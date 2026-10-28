import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';

const EVIDENCE_DEFINITIONS = [
  '`confirmed`: supported by an official source or a repeatable verification.',
  '`reported`: published by a reliable media or independent source, but not yet confirmed by an official source.',
  '`unverified`: not currently supported well enough for a confirmed claim; it remains explicitly labeled when shown publicly.',
];

function formatNumber(value: unknown) {
  const number = Number(value || 0);
  return number > 0 ? number.toLocaleString('en-US') : 'not published';
}

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: async () => {
        const { app_url, app_name } = envConfigs;
        const lines: string[] = [
          `# ${app_name}`,
          '',
          '## Identity',
          '',
          'Gemini 4 Argon Tracker is an independent, unofficial research and monitoring site. It is not affiliated with, endorsed by, or operated by Google. “Gemini” and provider/model names are trademarks of their respective owners.',
          '',
          `Canonical origin: ${app_url}`,
          'Primary language: English, with Chinese translations for core pages.',
          'Last site content review: 2026-10-01.',
          '',
          '## Evidence model',
          '',
          ...EVIDENCE_DEFINITIONS.map((definition) => `- ${definition}`),
          '',
          'Every material public fact should include a source URL and a verification or update date. Unverified or reported information must not be read as an official Google announcement.',
          '',
          '## Main pages',
          '',
          `- Home: ${app_url}/ — tracker overview and entry points.`,
          `- Model catalog: ${app_url}/models — published models with provider, context, availability, prices and evidence status.`,
          `- Argon topic page: ${app_url}/models/gemini-4-argon — current status, capabilities, timeline, price tiers, benchmarks, sources, FAQ and update date.`,
          `- Cost calculator: ${app_url}/tools/cost-calculator — monthly input/output estimate based on requests and token volumes.`,
          `- Updates: ${app_url}/updates — published source-linked model, price, availability, benchmark and site events.`,
          `- RSS: ${app_url}/rss.xml — published timeline events with a source.`,
          `- Privacy: ${app_url}/privacy-policy`,
          `- Terms: ${app_url}/terms-of-service`,
          '',
          '## Published model records',
          '',
        ];

        try {
          const { listModels } = await import('@/modules/models/service');
          const models = await listModels();
          if (models.length === 0) {
            lines.push(
              '- No published model records are currently available.',
              ''
            );
          } else {
            for (const model of models) {
              lines.push(`### ${model.name} (${model.slug})`);
              lines.push(`- URL: ${app_url}/models/${model.slug}`);
              lines.push(`- Provider: ${model.provider || 'not published'}`);
              lines.push(`- Family: ${model.family || 'not published'}`);
              lines.push(
                `- Release date: ${model.releaseDate || 'not published'}`
              );
              lines.push(
                `- Availability: ${model.availabilityStatus || 'not published'}`
              );
              lines.push(
                `- Context window: ${formatNumber(model.contextWindow)} tokens`
              );
              lines.push(
                `- Maximum output: ${formatNumber(model.maxOutputTokens)} tokens`
              );
              lines.push(
                `- Open source: ${model.isOpenSource ? 'yes' : 'no or not published'}`
              );
              lines.push(
                `- Reasoning model: ${model.isReasoning ? 'yes' : 'no or not published'}`
              );
              lines.push(`- Record status: ${model.status}`);
              lines.push(
                `- Last updated: ${model.updatedAt || 'not published'}`
              );
              lines.push('');
            }
          }
        } catch {
          lines.push(
            '- Model records are temporarily unavailable; use the public model catalog when the database is reachable.',
            ''
          );
        }

        lines.push(
          '## Selected comparisons',
          '',
          'Comparison pages are a controlled allowlist, not an unlimited page generator. Each published comparison should explain task fit, coding, knowledge work, cyber defense, long context, price, availability, benchmarks, limitations, sources and its last update.',
          ''
        );

        try {
          const { listPublishedComparisons } =
            await import('@/modules/comparisons/service');
          const comparisons = await listPublishedComparisons();
          if (comparisons.length === 0) {
            lines.push(
              '- No published comparison pages are currently available.',
              ''
            );
          } else {
            for (const comparison of comparisons) {
              lines.push(
                `- [${comparison.slug}](${app_url}/compare/${comparison.slug})`
              );
              if (comparison.decisionSummary)
                lines.push(`  Summary: ${comparison.decisionSummary}`);
              lines.push(
                `  Last updated: ${comparison.updatedAt || 'not published'}`
              );
            }
            lines.push('');
          }
        } catch {
          lines.push('- Comparison records are temporarily unavailable.', '');
        }

        lines.push(
          '## Cost calculator assumptions',
          '',
          '- Input and output prices are expressed per one million tokens unless the page says otherwise.',
          '- A request count multiplied by tokens per request produces monthly token volume.',
          '- If a published price has a context threshold, the calculator applies the appropriate tier only when the user opts into the threshold scenario.',
          '- Missing prices or prices labeled `reported`/`unverified` must remain visible as caveats; results are illustrative estimates, not invoices or billing quotes.',
          '- Zero token values are valid and produce zero cost for that component.',
          '',
          '## Updates and subscriptions',
          '',
          '- The update log and RSS feed expose only published events with a source.',
          '- Email subscriptions use double opt-in. Confirmation and unsubscribe tokens are stored as hashes, expire, and are not exposed through public APIs.',
          '- If email delivery is not configured, the site should direct visitors to RSS rather than claim that an email was sent.',
          '',
          '## Data and legal limitations',
          '',
          '- This site does not automatically certify Google announcements, provider billing, benchmark methodology or third-party claims.',
          '- Availability, pricing, benchmarks, context limits and provider policies can change; official provider documentation controls.',
          '- Do not use the tracker alone for procurement, security, legal, financial, compliance or production decisions.',
          '- Privacy practices are described at the privacy page. Use of the site is governed by the terms page.',
          ''
        );

        return new Response(lines.join('\n'), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});
