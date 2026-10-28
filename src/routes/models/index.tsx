import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTrackerModelsFn } from '@/content/tracker/server';

export const Route = createFileRoute('/models/')({
  loader: async () => ({
    locale: getLocale(),
    models: await getTrackerModelsFn(),
  }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale || 'en';
    const canonical = localizeUrl(`${envConfigs.app_url}/models`, {
      locale: locale as any,
    }).href;
    const items = loaderData?.models || [];
    return {
      meta: [
        {
          title: `AI Model Comparison | ${envConfigs.app_name}`,
          name: 'description',
          content:
            'Compare Gemini Argon with leading AI models by price, context, availability, and evidence status.',
        },
      ],
      links: [
        { rel: 'canonical', href: canonical },
        ...locales
          .filter((locale) => locale === 'en' || locale === 'zh')
          .map((item) => ({
            rel: 'alternate',
            hrefLang: item,
            href: localizeUrl(`${envConfigs.app_url}/models`, {
              locale: item as any,
            }).href,
          })),
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: items.map((item: any, index: number) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: item.name,
              url: `${envConfigs.app_url}/models/${item.slug}`,
            })),
          }),
        },
      ],
    };
  },
  component: ModelsPage,
});

function ModelsPage() {
  const { models } = Route.useLoaderData();
  const [provider, setProvider] = useState('all');
  const [sort, setSort] = useState('newest');
  const rows = useMemo(
    () =>
      [...models]
        .filter((item: any) => provider === 'all' || item.provider === provider)
        .sort((a: any, b: any) =>
          sort === 'context'
            ? Number(b.contextWindow || 0) - Number(a.contextWindow || 0)
            : sort === 'input'
              ? Number(a.primaryPrice?.inputPricePerMillion || 0) -
                Number(b.primaryPrice?.inputPricePerMillion || 0)
              : String(b.releaseDate || '').localeCompare(
                  String(a.releaseDate || '')
                )
        ),
    [models, provider, sort]
  );
  const providers = Array.from(
    new Set(models.map((item: any) => item.provider))
  );
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase">
            Source-aware catalog
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Compare AI models with evidence attached
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            A focused catalog for Gemini 4 Argon and the models most often used
            as alternatives. Prices and claims show their evidence state and
            verification date.
          </p>
        </div>
        <div className="mb-6 flex flex-wrap gap-3">
          <select
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="all">All providers</option>
            {providers.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="input">Lowest input price</option>
            <option value="context">Largest context</option>
          </select>
          <Link
            className="border-input hover:bg-muted rounded-md border px-3 py-2 text-sm"
            href="/tools/cost-calculator"
          >
            Open cost calculator
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((item: any) => (
            <Card key={item.slug} className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-xl">
                    <Link
                      href={`/models/${item.slug}`}
                      className="hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  </CardTitle>
                  <Badge
                    variant={
                      item.evidenceStatus === 'confirmed'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {item.evidenceStatus}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  {item.provider} · {item.availabilityStatus}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span>Release</span>
                  <strong>{item.releaseDate || '—'}</strong>
                  <span>Context</span>
                  <strong>
                    {item.contextWindow
                      ? `${Number(item.contextWindow).toLocaleString()} tokens`
                      : '—'}
                  </strong>
                  <span>Input</span>
                  <strong>
                    {item.primaryPrice
                      ? `$${item.primaryPrice.inputPricePerMillion}/M`
                      : 'Not published'}
                  </strong>
                  <span>Output</span>
                  <strong>
                    {item.primaryPrice
                      ? `$${item.primaryPrice.outputPricePerMillion}/M`
                      : 'Not published'}
                  </strong>
                </div>
                <p className="text-muted-foreground border-t pt-3">
                  Last updated {String(item.updatedAt).slice(0, 10)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        {rows.length === 0 && (
          <p className="text-muted-foreground py-16 text-center">
            No published models match these filters.
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}
