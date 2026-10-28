import { and, asc, desc, eq, like, or } from 'drizzle-orm';

import { db } from '@/core/db';
import {
  benchmark,
  model,
  modelPrice,
  source,
  timelineEvent,
  type Model,
  type NewModel,
} from '@/config/db/schema';
import { getUuid } from '@/lib/hash';
import {
  filterModels,
  type ModelFilter,
  type ModelForComparison,
} from '@/lib/model-utils';

export const EVIDENCE_STATUSES = [
  'confirmed',
  'reported',
  'unverified',
] as const;
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

export type ModelWrite = Omit<NewModel, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

function requiredEvidence(
  sourceId?: string | null,
  verifiedAt?: string | null
) {
  return Boolean(sourceId && verifiedAt);
}

export function validateEvidence(input: {
  evidenceStatus?: string;
  sourceId?: string | null;
  verifiedAt?: string | null;
}) {
  if (
    input.evidenceStatus === 'confirmed' &&
    !requiredEvidence(input.sourceId, input.verifiedAt)
  ) {
    throw new Error('Confirmed facts require a source and verification date');
  }
  if (
    input.evidenceStatus &&
    !EVIDENCE_STATUSES.includes(input.evidenceStatus as EvidenceStatus)
  ) {
    throw new Error('Invalid evidence status');
  }
}

function publicModel(row: Model): ModelForComparison {
  return {
    slug: row.slug,
    name: row.name,
    provider: row.provider,
    releaseDate: row.releaseDate ?? '',
    contextWindow: Number(row.contextWindow || 0),
    inputPricePerMillion: 0,
    outputPricePerMillion: 0,
    isOpenSource: Boolean(row.isOpenSource),
    isReasoning: Boolean(row.isReasoning),
    availabilityStatus: row.availabilityStatus,
    evidenceStatus: 'unverified',
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : String(row.updatedAt),
  };
}

async function enrich(row: Model) {
  const [prices, benchmarks, events, sources]: [any[], any[], any[], any[]] =
    await Promise.all([
      db().select().from(modelPrice).where(eq(modelPrice.modelId, row.id)),
      db().select().from(benchmark).where(eq(benchmark.modelId, row.id)),
      db()
        .select()
        .from(timelineEvent)
        .where(
          and(
            eq(timelineEvent.modelId, row.id),
            eq(timelineEvent.status, 'published')
          )
        )
        .orderBy(asc(timelineEvent.eventDate)),
      db().select().from(source).where(eq(source.status, 'published')),
    ]);
  const sourceMap = new Map(sources.map((item) => [item.id, item]));
  const firstPrice = prices[0];
  const evidenceStatus = prices.some((p) => p.evidenceStatus === 'confirmed')
    ? 'confirmed'
    : prices.some((p) => p.evidenceStatus === 'reported')
      ? 'reported'
      : 'unverified';
  return {
    ...row,
    contextWindow: Number(row.contextWindow || 0),
    maxOutputTokens: Number(row.maxOutputTokens || 0),
    prices: prices.map((p) => ({
      ...p,
      source: p.sourceId ? (sourceMap.get(p.sourceId) ?? null) : null,
    })),
    benchmarks: benchmarks.map((b) => ({
      ...b,
      source: b.sourceId ? (sourceMap.get(b.sourceId) ?? null) : null,
    })),
    timeline: events.map((event) => ({
      ...event,
      source: event.sourceId ? (sourceMap.get(event.sourceId) ?? null) : null,
    })),
    sources: sources.filter(
      (s) =>
        prices.some((p) => p.sourceId === s.id) ||
        benchmarks.some((b) => b.sourceId === s.id) ||
        events.some((e) => e.sourceId === s.id)
    ),
    evidenceStatus,
    primaryPrice: firstPrice
      ? {
          inputPricePerMillion: Number(firstPrice.inputPricePerMillion || 0),
          outputPricePerMillion: Number(firstPrice.outputPricePerMillion || 0),
          currency: firstPrice.currency,
          contextThreshold: Number(firstPrice.contextThreshold || 0),
          inputPriceAboveThreshold: Number(
            firstPrice.inputPriceAboveThreshold || 0
          ),
          outputPriceAboveThreshold: Number(
            firstPrice.outputPriceAboveThreshold || 0
          ),
          verifiedAt: firstPrice.verifiedAt,
          evidenceStatus: firstPrice.evidenceStatus,
        }
      : null,
  };
}

export async function listModels(
  options: { includeDrafts?: boolean; filter?: ModelFilter } = {}
) {
  const conditions = options.includeDrafts
    ? []
    : [eq(model.status, 'published')];
  const rows = await db()
    .select()
    .from(model)
    .where(and(...conditions))
    .orderBy(desc(model.updatedAt));
  const enriched = await Promise.all(rows.map(enrich));
  if (!options.filter) return enriched;
  return filterModels(
    enriched.map((item) => ({
      ...publicModel(item),
      inputPricePerMillion: item.primaryPrice?.inputPricePerMillion ?? 0,
      outputPricePerMillion: item.primaryPrice?.outputPricePerMillion ?? 0,
      evidenceStatus: item.evidenceStatus,
    })),
    options.filter
  );
}

export async function getModelBySlug(slug: string, includeDrafts = false) {
  const conditions = [
    eq(model.slug, slug),
    ...(includeDrafts ? [] : [eq(model.status, 'published')]),
  ];
  const rows = await db()
    .select()
    .from(model)
    .where(and(...conditions))
    .limit(1);
  return rows[0] ? enrich(rows[0]) : null;
}

export async function listAdminModels(
  options: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  } = {}
) {
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));
  const conditions = [
    options.status ? eq(model.status, options.status) : undefined,
    options.search
      ? or(
          like(model.name, `%${options.search}%`),
          like(model.slug, `%${options.search}%`)
        )
      : undefined,
  ].filter(Boolean);
  const rows = await db()
    .select()
    .from(model)
    .where(and(...conditions))
    .orderBy(desc(model.updatedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const all = await db()
    .select({ id: model.id })
    .from(model)
    .where(and(...conditions));
  return { items: rows, total: all.length };
}

export async function saveModel(input: ModelWrite) {
  const id = input.id || getUuid();
  const values = { ...input, id, updatedAt: new Date() } as any;
  if (input.status === 'published' && !input.name)
    throw new Error('Published models require a name');
  if (input.id) {
    const rows = await db()
      .update(model)
      .set(values)
      .where(eq(model.id, input.id))
      .returning();
    return rows[0];
  }
  const rows = await db()
    .insert(model)
    .values({ ...values, createdAt: new Date() })
    .returning();
  return rows[0];
}

export type TrackerRecordKind = 'price' | 'benchmark' | 'timeline';

const trackerTables = {
  price: modelPrice,
  benchmark,
  timeline: timelineEvent,
} as const;

export async function listTrackerRecords(
  kind: TrackerRecordKind,
  modelId?: string
) {
  const table = trackerTables[kind];
  const where = modelId ? eq(table.modelId, modelId) : undefined;
  return db()
    .select()
    .from(table)
    .where(where as any);
}

export async function saveTrackerRecord(
  kind: TrackerRecordKind,
  input: Record<string, unknown> & { id?: string }
) {
  const table = trackerTables[kind];
  const sourceId = typeof input.sourceId === 'string' ? input.sourceId : null;
  const verifiedAt =
    typeof input.verifiedAt === 'string' ? input.verifiedAt : null;
  validateEvidence({
    evidenceStatus:
      typeof input.evidenceStatus === 'string'
        ? input.evidenceStatus
        : undefined,
    sourceId,
    verifiedAt,
  });
  if (kind !== 'timeline' && !input.modelId) {
    throw new Error('A model and required record fields are needed');
  }
  if (kind === 'timeline' && !input.eventDate) {
    throw new Error('A model and required record fields are needed');
  }
  const id = input.id || getUuid();
  const values = { ...input, id } as any;
  if (input.id) {
    const rows = await db()
      .update(table)
      .set(values)
      .where(eq(table.id, input.id))
      .returning();
    return rows[0];
  }
  const rows = await db().insert(table).values(values).returning();
  return rows[0];
}

export async function removeTrackerRecord(kind: TrackerRecordKind, id: string) {
  await db().delete(trackerTables[kind]).where(eq(trackerTables[kind].id, id));
}

export async function removeModel(id: string) {
  await db().delete(model).where(eq(model.id, id));
}
