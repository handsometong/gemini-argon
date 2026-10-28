import { createFileRoute } from '@tanstack/react-router';
import { and, desc, eq, isNotNull } from 'drizzle-orm';

import { db } from '@/core/db';
import { envConfigs } from '@/config';
import { source, timelineEvent } from '@/config/db/schema';

function xmlEscape(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export const Route = createFileRoute('/rss.xml')({
  server: {
    handlers: {
      GET: async () => {
        let events: any[] = [];
        let sources: any[] = [];
        try {
          events = await db()
            .select()
            .from(timelineEvent)
            .where(
              and(
                eq(timelineEvent.status, 'published'),
                isNotNull(timelineEvent.sourceId)
              )
            )
            .orderBy(desc(timelineEvent.eventDate));
          sources = await db()
            .select()
            .from(source)
            .where(eq(source.status, 'published'));
        } catch {
          // RSS remains valid during a temporary database outage.
        }
        const sourceMap = new Map(sources.map((item) => [item.id, item]));
        const items = events
          .filter((event) => event.sourceId && sourceMap.has(event.sourceId))
          .map(
            (event: any) =>
              `<item><title>${xmlEscape(event.title)}</title><link>${envConfigs.app_url}/updates</link><guid>${event.id}</guid><pubDate>${new Date(event.eventDate).toUTCString()}</pubDate><description>${xmlEscape(event.description)}</description>${event.sourceId && sourceMap.get(event.sourceId)?.url ? `<source url="${xmlEscape(sourceMap.get(event.sourceId)!.url)}">${xmlEscape(sourceMap.get(event.sourceId)!.publisher)}</source>` : ''}</item>`
          )
          .join('');
        const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xmlEscape(envConfigs.app_name)} updates</title><link>${envConfigs.app_url}/updates</link><description>Source-linked Gemini Argon tracker updates.</description>${items}</channel></rss>`;
        return new Response(xml, {
          headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
        });
      },
    },
  },
});
