import { eq } from 'drizzle-orm';

import { db } from '@/core/db';
import {
  benchmark,
  comparisonPage,
  model,
  modelPrice,
  source,
  timelineEvent,
} from '@/config/db/schema';
import { getUuid } from '@/lib/hash';

const today = '2026-10-01';

async function ensureSource(input: {
  url: string;
  title: string;
  publisher: string;
  sourceType: string;
  verifiedAt?: string;
  notes?: string;
}) {
  const existing = await db()
    .select()
    .from(source)
    .where(eq(source.url, input.url))
    .limit(1);
  if (existing[0]) return existing[0];
  const rows = await db()
    .insert(source)
    .values({
      id: getUuid(),
      ...input,
      retrievedAt: today,
      status: 'published',
      createdAt: new Date(),
    } as any)
    .returning();
  return rows[0];
}

async function ensureModel(input: any) {
  const existing = await db()
    .select()
    .from(model)
    .where(eq(model.slug, input.slug))
    .limit(1);
  if (existing[0]) return existing[0];
  const rows = await db()
    .insert(model)
    .values({
      id: getUuid(),
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...input,
    } as any)
    .returning();
  return rows[0];
}

async function main() {
  const google = await ensureSource({
    url: 'https://blog.google/',
    title: 'Google AI announcements',
    publisher: 'Google',
    sourceType: 'official',
    notes:
      'Official source index; individual claims remain reported until a direct announcement is available.',
  });
  const vals = await ensureSource({
    url: 'https://vals.ai/',
    title: 'Vals AI benchmark index',
    publisher: 'Vals AI',
    sourceType: 'independent',
  });
  const deepSWE = await ensureSource({
    url: 'https://deepmind.google/',
    title: 'Google DeepMind research',
    publisher: 'Google DeepMind',
    sourceType: 'official',
  });
  const models = await Promise.all([
    ensureModel({
      slug: 'gemini-4-argon',
      name: 'Gemini 4 Argon',
      provider: 'Google',
      family: 'Gemini 4',
      description:
        'Reported frontier model tracked across access, pricing, benchmarks, and safety updates.',
      releaseDate: today,
      availabilityStatus: 'fairwind-limited',
      isOpenSource: false,
      isReasoning: true,
      contextWindow: '1000000',
      maxOutputTokens: '1000000',
      officialUrl: 'https://blog.google/',
    }),
    ensureModel({
      slug: 'gpt-6-astra',
      name: 'GPT-6 Astra',
      provider: 'OpenAI',
      family: 'GPT-6',
      description:
        'Comparison baseline for general reasoning and production API work.',
      releaseDate: '2026-06-01',
      availabilityStatus: 'public',
      isOpenSource: false,
      isReasoning: true,
      contextWindow: '128000',
      maxOutputTokens: '32768',
      officialUrl: 'https://openai.com/',
    }),
    ensureModel({
      slug: 'claude-opus-5-5',
      name: 'Claude Opus 5.5',
      provider: 'Anthropic',
      family: 'Claude 5',
      description: 'Comparison baseline for knowledge work and coding.',
      releaseDate: '2026-05-01',
      availabilityStatus: 'public',
      isOpenSource: false,
      isReasoning: true,
      contextWindow: '200000',
      maxOutputTokens: '32768',
      officialUrl: 'https://www.anthropic.com/',
    }),
    ensureModel({
      slug: 'grok',
      name: 'Grok',
      provider: 'xAI',
      family: 'Grok',
      description:
        'Comparison baseline for public availability and fast iteration.',
      releaseDate: '2026-04-01',
      availabilityStatus: 'public',
      isOpenSource: false,
      isReasoning: true,
      contextWindow: '131072',
      maxOutputTokens: '16384',
      officialUrl: 'https://x.ai/',
    }),
    ensureModel({
      slug: 'gemini-3-8-flash',
      name: 'Gemini 3.8 Flash',
      provider: 'Google',
      family: 'Gemini 3',
      description:
        'Earlier Gemini comparison baseline focused on speed and cost.',
      releaseDate: '2026-02-01',
      availabilityStatus: 'public',
      isOpenSource: false,
      isReasoning: false,
      contextWindow: '1000000',
      maxOutputTokens: '8192',
      officialUrl: 'https://ai.google.dev/',
    }),
  ]);
  const prices = [
    [models[0], '2', '10', '200000', '4', '20', google, 'reported'],
    [models[1], '10', '50', '', '', '', null, 'unverified'],
    [models[2], '4', '20', '', '', '', null, 'unverified'],
    [models[3], '5', '15', '', '', '', null, 'unverified'],
    [models[4], '0.5', '3', '', '', '', null, 'unverified'],
  ];
  for (const [
    m,
    input,
    output,
    threshold,
    inputAbove,
    outputAbove,
    src,
    evidenceStatus,
  ] of prices) {
    const existing = await db()
      .select()
      .from(modelPrice)
      .where(eq(modelPrice.modelId, (m as any).id))
      .limit(1);
    if (!existing[0])
      await db()
        .insert(modelPrice)
        .values({
          id: getUuid(),
          modelId: (m as any).id,
          inputPricePerMillion: input,
          outputPricePerMillion: output,
          currency: 'USD',
          contextThreshold: threshold || null,
          inputPriceAboveThreshold: inputAbove || null,
          outputPriceAboveThreshold: outputAbove || null,
          effectiveAt: today,
          verifiedAt: evidenceStatus === 'confirmed' ? today : null,
          sourceId: (src as any)?.id || null,
          evidenceStatus,
        } as any);
  }
  const benchmarkRows = [
    [models[0], 'Vals Index', '68.9%', vals, 'reported'],
    [models[0], 'DeepSWE v1.1', '77.9%', deepSWE, 'reported'],
    [models[0], 'CWE-bench v1', '68.0%', google, 'reported'],
  ];
  for (const [m, name, score, src, evidenceStatus] of benchmarkRows) {
    const existing = await db()
      .select()
      .from(benchmark)
      .where(eq(benchmark.modelId, (m as any).id))
      .limit(1);
    if (!existing[0])
      await db()
        .insert(benchmark)
        .values({
          id: getUuid(),
          modelId: (m as any).id,
          benchmarkName: name,
          score,
          scoreUnit: '%',
          methodology:
            'As reported by the linked source; independent reproduction pending.',
          sourceId: (src as any).id,
          evidenceStatus,
          verifiedAt: null,
        } as any);
  }
  const events = [
    {
      eventType: 'reported-announcement',
      eventDate: today,
      title: 'Gemini 4 Argon enters tracker',
      description:
        'Initial tracker entry; public release status remains unconfirmed.',
      sourceId: google.id,
      evidenceStatus: 'reported',
    },
    {
      eventType: 'availability',
      eventDate: today,
      title: 'Fairwind Program access reported',
      description:
        'Access is reported as limited to internal teams and trusted network defenders.',
      sourceId: google.id,
      evidenceStatus: 'reported',
    },
  ];
  for (const event of events) {
    const existing = await db()
      .select()
      .from(timelineEvent)
      .where(eq(timelineEvent.title, event.title))
      .limit(1);
    if (!existing[0])
      await db()
        .insert(timelineEvent)
        .values({
          id: getUuid(),
          modelId: models[0].id,
          status: 'published',
          ...event,
        } as any);
  }
  const comparisonSlugs = [
    [
      'gemini-4-argon-vs-gpt-6-astra',
      models[0],
      models[1],
      'Choose Argon for reported long-horizon coding and defensive workflows; choose GPT-6 Astra for a currently public production route.',
    ],
    [
      'gemini-4-argon-vs-claude-opus-5-5',
      models[0],
      models[2],
      'Choose Argon for the reported frontier profile; choose Claude Opus 5.5 when public access and knowledge-work tooling matter most.',
    ],
    [
      'gemini-4-argon-vs-grok',
      models[0],
      models[3],
      'Choose Argon for staged safety-reviewed access; choose Grok when public availability and fast iteration are the priority.',
    ],
    [
      'gemini-4-argon-vs-gemini-3-8-flash',
      models[0],
      models[4],
      'Choose Argon for maximum reported reasoning headroom; choose Gemini 3.8 Flash for a lower-cost, public Gemini workflow.',
    ],
  ];
  for (const [slug, left, right, summary] of comparisonSlugs) {
    const existing = await db()
      .select()
      .from(comparisonPage)
      .where(eq(comparisonPage.slug, slug as string))
      .limit(1);
    if (!existing[0])
      await db()
        .insert(comparisonPage)
        .values({
          id: getUuid(),
          slug,
          leftModelId: (left as any).id,
          rightModelId: (right as any).id,
          locale: 'en',
          intro: `A source-aware comparison of ${(left as any).name} and ${(right as any).name}.`,
          decisionSummary: summary,
          status: 'published',
          publishedAt: today,
          updatedAt: today,
        } as any);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
