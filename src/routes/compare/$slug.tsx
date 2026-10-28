import { useEffect } from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { trackEvent } from '@/lib/analytics';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { Badge } from '@/components/ui/badge';
import { getTrackerComparisonFn } from '@/content/tracker/server';

export const Route = createFileRoute('/compare/$slug')({
  loader: async ({ params }) => {
    const comparison = await getTrackerComparisonFn({
      data: { slug: params.slug },
    });
    if (!comparison) throw notFound();
    return { comparison, locale: getLocale() };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { comparison, locale } = loaderData;
    const canonical = localizeUrl(
      `${envConfigs.app_url}/compare/${comparison.slug}`,
      { locale: locale as any }
    ).href;
    return {
      meta: [
        {
          title: `${comparison.leftModel?.name} vs ${comparison.rightModel?.name}`,
          name: 'description',
          content: comparison.intro,
        },
      ],
      links: [
        { rel: 'canonical', href: canonical },
        ...locales
          .filter((locale) => locale === 'en' || locale === 'zh')
          .map((l) => ({
            rel: 'alternate',
            hrefLang: l,
            href: localizeUrl(
              `${envConfigs.app_url}/compare/${comparison.slug}`,
              { locale: l as any }
            ).href,
          })),
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: `${comparison.leftModel?.name} vs ${comparison.rightModel?.name}`,
            dateModified: comparison.updatedAt,
            author: { '@type': 'Organization', name: envConfigs.app_name },
          }),
        },
      ],
    };
  },
  component: ComparisonPage,
});

function ComparisonPage() {
  const { comparison } = Route.useLoaderData();
  useEffect(() => {
    trackEvent('comparison_view', { comparison: comparison.slug });
  }, [comparison.slug]);
  const left: any = comparison.leftModel;
  const right: any = comparison.rightModel;
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-primary text-sm font-semibold tracking-widest uppercase">
          Source-aware comparison
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">
          {left?.name} vs {right?.name}
        </h1>
        <p className="text-muted-foreground mt-5 max-w-3xl text-lg leading-8">
          {comparison.intro}
        </p>
        <div className="border-primary/30 bg-primary/5 mt-6 rounded-xl border p-5">
          <strong>Decision summary:</strong> {comparison.decisionSummary}
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {[left, right].map((item: any) => (
            <div key={item.slug} className="rounded-2xl border p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">
                  <Link
                    href={`/models/${item.slug}`}
                    className="hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </h2>
                <Badge variant="secondary">{item.evidenceStatus}</Badge>
              </div>
              <p className="text-muted-foreground mt-2">
                {item.provider} · {item.availabilityStatus}
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Context</dt>
                  <dd className="mt-1 font-semibold">
                    {Number(item.contextWindow || 0).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Release</dt>
                  <dd className="mt-1 font-semibold">{item.releaseDate}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Input</dt>
                  <dd className="mt-1 font-semibold">
                    ${item.primaryPrice?.inputPricePerMillion ?? '—'} / M
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Output</dt>
                  <dd className="mt-1 font-semibold">
                    ${item.primaryPrice?.outputPricePerMillion ?? '—'} / M
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">How to choose</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border p-5">
              <h3 className="font-semibold">Choose {left?.name}</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                When its reported capabilities, context headroom, or staged
                evaluation path match your workload.
              </p>
            </div>
            <div className="rounded-xl border p-5">
              <h3 className="font-semibold">Choose {right?.name}</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                When current public availability, established tooling, or a
                different price profile matters more.
              </p>
            </div>
            <div className="rounded-xl border p-5">
              <h3 className="font-semibold">Need a number?</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                <Link
                  className="text-primary underline"
                  href="/tools/cost-calculator"
                >
                  Run the cost calculator
                </Link>{' '}
                with your own request volume.
              </p>
            </div>
          </div>
        </section>
        <p className="text-muted-foreground mt-10 text-sm">
          Last updated {comparison.updatedAt || '—'}. Facts are labeled by
          evidence status and should not be treated as official launch guidance.
        </p>
      </main>
      <Footer />
    </div>
  );
}
