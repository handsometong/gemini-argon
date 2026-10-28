import { useEffect } from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { trackEvent } from '@/lib/analytics';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTrackerModelFn } from '@/content/tracker/server';

export const Route = createFileRoute('/models/$slug')({
  loader: async ({ params }) => {
    const item = await getTrackerModelFn({ data: { slug: params.slug } });
    if (!item) throw notFound();
    return { locale: getLocale(), item };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { item, locale } = loaderData;
    const canonical = localizeUrl(`${envConfigs.app_url}/models/${item.slug}`, {
      locale: locale as any,
    }).href;
    const faq = [
      {
        q: `Is ${item.name} available?`,
        a: `${item.name} is currently listed as ${item.availabilityStatus}.`,
      },
      {
        q: `What is the evidence status for ${item.name}?`,
        a: `This page labels its current evidence as ${item.evidenceStatus} and shows source links beside the relevant facts.`,
      },
    ];
    return {
      meta: [
        {
          title: `${item.name}: pricing, availability and benchmarks`,
          name: 'description',
          content: item.description,
        },
      ],
      links: [
        { rel: 'canonical', href: canonical },
        ...locales
          .filter((locale) => locale === 'en' || locale === 'zh')
          .map((l) => ({
            rel: 'alternate',
            hrefLang: l,
            href: localizeUrl(`${envConfigs.app_url}/models/${item.slug}`, {
              locale: l as any,
            }).href,
          })),
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'TechArticle',
              headline: item.name,
              dateModified: String(item.updatedAt),
              author: { '@type': 'Organization', name: envConfigs.app_name },
              mainEntityOfPage: canonical,
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faq.map((x) => ({
                '@type': 'Question',
                name: x.q,
                acceptedAnswer: { '@type': 'Answer', text: x.a },
              })),
            },
          ]),
        },
      ],
    };
  },
  component: ModelPage,
});

function ModelPage() {
  const { item } = Route.useLoaderData();
  useEffect(() => {
    trackEvent('model_view', { model: item.slug, provider: item.provider });
  }, [item.provider, item.slug]);
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Badge>{item.provider}</Badge>
          <Badge variant="secondary">{item.evidenceStatus}</Badge>
          <span className="text-muted-foreground text-sm">
            Last updated {String(item.updatedAt).slice(0, 10)}
          </span>
        </div>
        <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
          {item.name}
        </h1>
        <p className="text-muted-foreground mt-5 max-w-3xl text-lg leading-8">
          {item.description}
        </p>
        <p className="text-muted-foreground mt-4 text-sm">
          Independent, unofficial tracker. Not affiliated with or endorsed by
          Google.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Availability" value={item.availabilityStatus} />
          <Stat
            label="Release date"
            value={item.releaseDate || 'Not published'}
          />
          <Stat
            label="Context"
            value={
              item.contextWindow
                ? `${Number(item.contextWindow).toLocaleString()} tokens`
                : 'Not published'
            }
          />
          <Stat
            label="Max output"
            value={
              item.maxOutputTokens
                ? `${Number(item.maxOutputTokens).toLocaleString()} tokens`
                : 'Not published'
            }
          />
        </div>
        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {item.prices.length ? (
                <div className="space-y-4">
                  {item.prices.map((price: any) => (
                    <div key={price.id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between">
                        <span>Input</span>
                        <strong>
                          ${price.inputPricePerMillion || '—'} / M tokens
                        </strong>
                      </div>
                      <div className="mt-1 flex justify-between">
                        <span>Output</span>
                        <strong>
                          ${price.outputPricePerMillion || '—'} / M tokens
                        </strong>
                      </div>
                      {price.contextThreshold && (
                        <p className="text-muted-foreground mt-2 text-xs">
                          Above{' '}
                          {Number(price.contextThreshold).toLocaleString()}{' '}
                          tokens: ${price.inputPriceAboveThreshold || '—'} input
                          / ${price.outputPriceAboveThreshold || '—'} output.
                        </p>
                      )}
                      <Evidence
                        status={price.evidenceStatus}
                        verifiedAt={price.verifiedAt}
                        source={price.source}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No public price is available yet.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Benchmarks</CardTitle>
            </CardHeader>
            <CardContent>
              {item.benchmarks.length ? (
                <div className="space-y-4">
                  {item.benchmarks.map((benchmark: any) => (
                    <div key={benchmark.id}>
                      <div className="flex justify-between">
                        <span>{benchmark.benchmarkName}</span>
                        <strong>
                          {benchmark.score} {benchmark.scoreUnit}
                        </strong>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {benchmark.methodology}
                      </p>
                      <Evidence
                        status={benchmark.evidenceStatus}
                        verifiedAt={benchmark.verifiedAt}
                        source={benchmark.source}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No benchmark has been published.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Timeline</h2>
          <div className="mt-5 space-y-4">
            {item.timeline.map((event: any) => (
              <div key={event.id} className="border-primary/40 border-l-2 pl-4">
                <p className="text-muted-foreground text-sm">
                  {event.eventDate}
                </p>
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-muted-foreground mt-1">
                  {event.description}
                </p>
                <Evidence status={event.evidenceStatus} source={event.source} />
              </div>
            ))}
          </div>
        </section>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/models"
            className="border-input rounded-md border px-4 py-2 text-sm"
          >
            Back to models
          </Link>
          <Link
            href="/tools/cost-calculator"
            className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm"
          >
            Estimate cost
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="mt-2 font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
function Evidence({
  status,
  verifiedAt,
  source,
}: {
  status: string;
  verifiedAt?: string | null;
  source?: any;
}) {
  return (
    <p className="text-muted-foreground mt-2 text-xs">
      Evidence: <span className="font-medium">{status}</span>
      {verifiedAt ? ` · verified ${verifiedAt}` : ''}
      {source?.url ? (
        <>
          {' '}
          ·{' '}
          <a
            className="text-primary underline"
            href={source.url}
            onClick={() => trackEvent('source_click', { url: source.url })}
            target="_blank"
            rel="noreferrer"
          >
            source
          </a>
        </>
      ) : (
        ''
      )}
    </p>
  );
}
