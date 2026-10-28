import { and, asc, eq } from 'drizzle-orm';

import { db } from '@/core/db';
import {
  benchmark,
  model,
  modelPrice,
  source,
  timelineEvent,
  type Model,
} from '@/config/db/schema';

/**
 * Shared read-only enrichment for public tracker pages. Keeping this in lib
 * avoids making the independent tracker modules depend on one another.
 */
export async function getEnrichedTrackerModelById(
  modelId: string,
  includeDrafts = false
) {
  const rows = await db()
    .select()
    .from(model)
    .where(
      and(
        eq(model.id, modelId),
        includeDrafts ? undefined : eq(model.status, 'published')
      )
    )
    .limit(1);
  return rows[0] ? enrichTrackerModel(rows[0]) : null;
}

export async function enrichTrackerModel(row: Model) {
  const [prices, benchmarks, events, sources]: [
    (typeof modelPrice.$inferSelect)[],
    (typeof benchmark.$inferSelect)[],
    (typeof timelineEvent.$inferSelect)[],
    (typeof source.$inferSelect)[],
  ] = await Promise.all([
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
    prices: prices.map((price) => ({
      ...price,
      source: price.sourceId ? (sourceMap.get(price.sourceId) ?? null) : null,
    })),
    benchmarks: benchmarks.map((item) => ({
      ...item,
      source: item.sourceId ? (sourceMap.get(item.sourceId) ?? null) : null,
    })),
    timeline: events.map((event) => ({
      ...event,
      source: event.sourceId ? (sourceMap.get(event.sourceId) ?? null) : null,
    })),
    sources: sources.filter(
      (item) =>
        prices.some((price) => price.sourceId === item.id) ||
        benchmarks.some(
          (benchmarkItem) => benchmarkItem.sourceId === item.id
        ) ||
        events.some((event) => event.sourceId === item.id)
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
