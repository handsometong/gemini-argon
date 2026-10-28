import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { trackEvent } from '@/lib/analytics';
import { calculateModelCost } from '@/lib/model-utils';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTrackerModelsFn } from '@/content/tracker/server';

export const Route = createFileRoute('/tools/cost-calculator')({
  loader: async () => ({
    locale: getLocale(),
    models: await getTrackerModelsFn(),
  }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale || 'en';
    const canonical = localizeUrl(
      `${envConfigs.app_url}/tools/cost-calculator`,
      { locale: locale as any }
    ).href;
    return {
      meta: [
        {
          title: `LLM Cost Calculator | ${envConfigs.app_name}`,
          name: 'description',
          content:
            'Estimate monthly input and output token costs with context-aware pricing tiers.',
        },
      ],
      links: [
        { rel: 'canonical', href: canonical },
        ...locales
          .filter((locale) => locale === 'en' || locale === 'zh')
          .map((l) => ({
            rel: 'alternate',
            hrefLang: l,
            href: localizeUrl(`${envConfigs.app_url}/tools/cost-calculator`, {
              locale: l as any,
            }).href,
          })),
      ],
    };
  },
  component: CostCalculatorPage,
});

function CostCalculatorPage() {
  const { models } = Route.useLoaderData();
  const [modelSlug, setModelSlug] = useState(models[0]?.slug || '');
  const [requests, setRequests] = useState('1000');
  const [inputTokens, setInputTokens] = useState('10000');
  const [outputTokens, setOutputTokens] = useState('2000');
  const hasTrackedUse = useRef(false);
  const selected: any =
    models.find((item: any) => item.slug === modelSlug) || models[0];
  useEffect(() => {
    if (hasTrackedUse.current) return;
    if (
      requests !== '1000' ||
      inputTokens !== '10000' ||
      outputTokens !== '2000'
    ) {
      hasTrackedUse.current = true;
      trackEvent('calculator_used', { model: modelSlug });
    }
  }, [inputTokens, modelSlug, outputTokens, requests]);
  const estimate = useMemo(
    () =>
      selected?.primaryPrice
        ? calculateModelCost({
            requestsPerMonth: Number(requests),
            inputTokensPerRequest: Number(inputTokens),
            outputTokensPerRequest: Number(outputTokens),
            inputPricePerMillion: selected.primaryPrice.inputPricePerMillion,
            outputPricePerMillion: selected.primaryPrice.outputPricePerMillion,
            contextThreshold: selected.primaryPrice.contextThreshold,
            inputPriceAboveThreshold:
              selected.primaryPrice.inputPriceAboveThreshold,
            outputPriceAboveThreshold:
              selected.primaryPrice.outputPriceAboveThreshold,
          })
        : null,
    [selected, requests, inputTokens, outputTokens]
  );
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-primary text-sm font-semibold tracking-widest uppercase">
          Interactive tool
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Monthly AI cost calculator
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
          Use your request volume and token profile to estimate cost. This is an
          estimate, not a quote; prices may be missing, reported, or tiered.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field label="Model">
                <select
                  className="border-input bg-background w-full rounded-md border px-3 py-2"
                  value={modelSlug}
                  onChange={(e) => setModelSlug(e.target.value)}
                >
                  {models.map((item: any) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="Requests per month"
                value={requests}
                onChange={setRequests}
              />
              <Field
                label="Input tokens per request"
                value={inputTokens}
                onChange={setInputTokens}
              />
              <Field
                label="Output tokens per request"
                value={outputTokens}
                onChange={setOutputTokens}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Estimate</CardTitle>
            </CardHeader>
            <CardContent>
              {estimate ? (
                <>
                  <div className="space-y-4">
                    <Result
                      label="Monthly input"
                      value={estimate.monthlyInputCost}
                    />
                    <Result
                      label="Monthly output"
                      value={estimate.monthlyOutputCost}
                    />
                    <Result
                      label="Monthly total"
                      value={estimate.monthlyTotalCost}
                      strong
                    />
                  </div>
                  <p className="text-muted-foreground mt-6 text-sm">
                    Currency: {estimate.currency}. Price verified:{' '}
                    {selected?.primaryPrice?.verifiedAt || 'not verified'}.
                  </p>
                  {estimate.assumptions.length > 0 && (
                    <ul className="text-muted-foreground mt-3 list-disc space-y-1 pl-5 text-sm">
                      {estimate.assumptions.map((item: string) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">
                  This model does not have enough published price data to
                  estimate cost.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 rounded-xl border p-5 text-sm">
          <strong>Assumptions:</strong> token prices are per million tokens,
          each request has the same input/output profile, and a tier threshold
          applies to the combined request context.{' '}
          <Link className="text-primary underline" href="/models">
            Review model sources
          </Link>
          .
        </div>
      </main>
      <Footer />
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  children?: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-medium">{label}</span>
      {children ||
        (onChange ? (
          <input
            className="border-input bg-background w-full rounded-md border px-3 py-2"
            type="number"
            min="0"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : null)}
    </label>
  );
}
function Result({
  label,
  value,
  strong,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b pb-3">
      <span>{label}</span>
      <span className={strong ? 'text-2xl font-bold' : 'font-semibold'}>
        ${value.toFixed(2)}
      </span>
    </div>
  );
}
