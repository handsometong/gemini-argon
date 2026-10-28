import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { baseLocale, locales, localizeUrl } from '@/paraglide/runtime.js';

const STATIC_LAST_MODIFIED = '2026-10-01';

const STATIC_PATHS = [
  '',
  '/privacy-policy',
  '/terms-of-service',
  '/models',
  '/models/gemini-4-argon',
  '/tools/cost-calculator',
  '/updates',
];

type Entry = {
  path: string;
  lastModified?: string;
  changeFrequency: string;
  priority: number;
};

function urlFor(path: string, locale: string): string {
  return localizeUrl(`${envConfigs.app_url}${path || '/'}`, {
    locale: locale as (typeof locales)[number],
  }).href;
}

function entryXml(e: Entry, currentLocale: string): string {
  const alternates = locales
    .filter((loc) => loc === 'en' || loc === 'zh')
    .map(
      (loc) =>
        `    <xhtml:link rel="alternate" hreflang="${loc}" href="${urlFor(e.path, loc)}"/>`
    )
    .join('\n');
  return [
    '  <url>',
    `    <loc>${urlFor(e.path, currentLocale)}</loc>`,
    alternates,
    e.lastModified ? `    <lastmod>${e.lastModified}</lastmod>` : null,
    `    <changefreq>${e.changeFrequency}</changefreq>`,
    `    <priority>${e.priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function getSitemapResponse() {
  const entries: Entry[] = STATIC_PATHS.map((path) => ({
    path,
    lastModified: STATIC_LAST_MODIFIED,
    changeFrequency: path === '/updates' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : path.includes('gemini-4-argon') ? 0.9 : 0.8,
  }));

  try {
    const { listModels } = await import('@/modules/models/service');
    const models = await listModels();
    for (const model of models) {
      entries.push({
        path: `/models/${model.slug}`,
        lastModified:
          model.updatedAt instanceof Date
            ? model.updatedAt.toISOString()
            : String(model.updatedAt || ''),
        changeFrequency: 'weekly',
        priority: model.slug === 'gemini-4-argon' ? 0.9 : 0.6,
      });
    }
  } catch {
    // Static entries remain available if the database is unavailable.
  }

  try {
    const { listPublishedComparisons } =
      await import('@/modules/comparisons/service');
    const comparisons = await listPublishedComparisons();
    for (const comparison of comparisons) {
      entries.push({
        path: `/compare/${comparison.slug}`,
        lastModified: comparison.updatedAt || undefined,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch {
    // Keep the sitemap available when the database is temporarily unreachable.
  }

  const uniqueEntries = Array.from(
    new Map(entries.map((entry) => [entry.path, entry])).values()
  );
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...uniqueEntries.flatMap((entry) =>
      [baseLocale].map((locale) => entryXml(entry, locale))
    ),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}

export const Route = createFileRoute('/sitemap/sitemap.xml')({
  server: {
    handlers: {
      GET: getSitemapResponse,
    },
  },
});
