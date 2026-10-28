import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { Badge } from '@/components/ui/badge';
import { getTrackerUpdatesFn } from '@/content/tracker/server';

export const Route = createFileRoute('/updates')({
  loader: async () => ({
    locale: getLocale(),
    events: await getTrackerUpdatesFn(),
  }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale || 'en';
    const canonical = localizeUrl(`${envConfigs.app_url}/updates`, {
      locale: locale as any,
    }).href;
    return {
      meta: [
        {
          title: `Gemini Argon Updates | ${envConfigs.app_name}`,
          name: 'description',
          content:
            'A source-linked changelog of model availability, pricing, benchmark, and tracker updates.',
        },
      ],
      links: [
        { rel: 'canonical', href: canonical },
        ...locales
          .filter((locale) => locale === 'en' || locale === 'zh')
          .map((l) => ({
            rel: 'alternate',
            hrefLang: l,
            href: localizeUrl(`${envConfigs.app_url}/updates`, {
              locale: l as any,
            }).href,
          })),
      ],
    };
  },
  component: UpdatesPage,
});

function UpdatesPage() {
  const { events } = Route.useLoaderData();
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight">Updates</h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Published changes only. Every event below has a linked source.
        </p>
        <div className="mt-10 space-y-5">
          {events.map((event: any) => (
            <article key={event.id} className="rounded-2xl border p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">{event.eventType}</Badge>
                <time className="text-muted-foreground text-sm">
                  {event.eventDate}
                </time>
                <Badge>{event.evidenceStatus}</Badge>
              </div>
              <h2 className="mt-4 text-xl font-semibold">{event.title}</h2>
              <p className="text-muted-foreground mt-2 leading-7">
                {event.description}
              </p>
              {event.source?.url && (
                <a
                  className="text-primary mt-4 inline-block text-sm underline"
                  href={event.source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Read source: {event.source.title || event.source.publisher}
                </a>
              )}
            </article>
          ))}
          {events.length === 0 && (
            <p className="text-muted-foreground py-16 text-center">
              No source-linked updates are published yet.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
