import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { ArgonTracker } from '@/blocks/argon-tracker';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { argonFaqs } from '@/content/argon';
import { localizedHome } from '@/content/localized-home';

function translatedPage(locale: string) {
  return localizedHome[locale as keyof typeof localizedHome];
}

function HomePage() {
  return (
    <div className="argon-site min-h-screen">
      <Header />
      <main>
        <ArgonTracker />
      </main>
      <Footer />
    </div>
  );
}

export const Route = createFileRoute('/')({
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale || 'en';
    const page = translatedPage(locale);
    const urlFor = (locale: string) =>
      localizeUrl(`${envConfigs.app_url}/`, { locale: locale as any }).href;
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: argonFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    };
    return {
      meta: [
        {
          title:
            page?.title ||
            'Gemini 4 Argon: Release Date, Access, Pricing & Benchmarks (Updated)',
        },
        {
          name: 'description',
          content:
            page?.description ||
            "Everything confirmed so far about Google DeepMind's Gemini 4 Argon — availability, pricing, 1M output tokens, and benchmark results. Unofficial tracker, sources linked.",
        },
        {
          property: 'og:title',
          content:
            page?.title ||
            'Gemini 4 Argon: Release Date, Access, Pricing & Benchmarks',
        },
        {
          property: 'og:description',
          content:
            page?.description ||
            'Track Gemini Argon access, pricing, output limits, benchmarks, and official source updates.',
        },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:image',
          content: `${envConfigs.app_url}/argon/argon-logo.png`,
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Gemini 4 Argon Tracker' },
        {
          name: 'twitter:description',
          content:
            page?.description ||
            'Unofficial Gemini Argon access, pricing, and benchmark tracker.',
        },
        {
          name: 'twitter:image',
          content: `${envConfigs.app_url}/argon/argon-logo.png`,
        },
      ],
      links: [
        { rel: 'canonical', href: urlFor(locale) },
        ...locales
          .filter((locale) => locale === 'en' || locale === 'zh')
          .map((locale) => ({
            rel: 'alternate',
            hrefLang: locale,
            href: urlFor(locale),
          })),
        { rel: 'alternate', hrefLang: 'x-default', href: urlFor('en') },
      ],
      scripts: [
        { type: 'application/ld+json', children: JSON.stringify(faqSchema) },
      ],
    };
  },
  component: HomePage,
});
