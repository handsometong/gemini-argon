import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';

const STATIC_PAGES: { path: string; title: string; description: string }[] = [
  {
    path: '',
    title: 'Gemini 4 Argon Tracker',
    description: 'Independent, unofficial tracker homepage',
  },
  {
    path: '/models',
    title: 'AI model catalog',
    description:
      'Source-aware model facts, prices, availability and evidence status',
  },
  {
    path: '/models/gemini-4-argon',
    title: 'Gemini 4 Argon',
    description:
      'Argon availability, pricing, capabilities, benchmarks and timeline',
  },
  {
    path: '/tools/cost-calculator',
    title: 'Token cost calculator',
    description:
      'Illustrative monthly cost estimates from published price tiers',
  },
  {
    path: '/updates',
    title: 'Tracker updates',
    description:
      'Published source-linked changes to models, prices and availability',
  },
  {
    path: '/rss.xml',
    title: 'RSS feed',
    description: 'Machine-readable source-linked tracker updates',
  },
  {
    path: '/privacy-policy',
    title: 'Privacy Policy',
    description:
      'How browsing, subscriptions and administrator data are handled',
  },
  {
    path: '/terms-of-service',
    title: 'Terms of Service',
    description: 'Terms for using this unofficial informational tracker',
  },
];

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: async () => {
        const { app_url, app_name } = envConfigs;
        const lines: string[] = [
          `# ${app_name}`,
          '',
          '> Independent, unofficial Gemini 4 Argon tracker. Not affiliated with or endorsed by Google.',
          '',
          'This site tracks reported and verified model availability, pricing, benchmarks, sources and updates. Facts are labeled `confirmed`, `reported`, or `unverified`; the labels describe evidence strength, not a guarantee of accuracy.',
          '',
          '## Pages',
          '',
          ...STATIC_PAGES.map(
            (page) =>
              `- [${page.title}](${app_url}${page.path || '/'}): ${page.description}`
          ),
          '',
          '## Important limitations',
          '',
          '- Gemini 4 Argon may not have public access or final public pricing; check linked official sources before relying on any claim.',
          '- The cost calculator provides estimates, not provider billing quotes.',
          '- Model names, trademarks and external source content belong to their respective owners.',
          '',
        ];

        return new Response(lines.join('\n'), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});
