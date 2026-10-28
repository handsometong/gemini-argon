import { createServerFn } from '@tanstack/react-start';

import type { Source, TimelineEvent } from '@/config/db/schema';

/**
 * Keep tracker database access behind server functions so public route modules
 * can hydrate in the browser without bundling Drizzle, database drivers, or
 * other server-only dependencies.
 */
export const getTrackerModelsFn = createServerFn().handler(async () => {
  const { listModels } = await import('@/modules/models/service');
  return listModels();
});

export const getTrackerModelFn = createServerFn()
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { getModelBySlug } = await import('@/modules/models/service');
    return getModelBySlug(data.slug);
  });

export const getTrackerComparisonFn = createServerFn()
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { getComparisonBySlug } =
      await import('@/modules/comparisons/service');
    return getComparisonBySlug(data.slug);
  });

export const getTrackerComparisonsFn = createServerFn()
  .inputValidator((data: { locale?: string }) => data)
  .handler(async ({ data }) => {
    const { listPublishedComparisons } =
      await import('@/modules/comparisons/service');
    return listPublishedComparisons(data.locale);
  });

export const getTrackerUpdatesFn = createServerFn().handler(async () => {
  const [{ and, desc, eq, isNotNull }, { db }, { source, timelineEvent }] =
    await Promise.all([
      import('drizzle-orm'),
      import('@/core/db'),
      import('@/config/db/schema'),
    ]);

  try {
    const [events, sources]: [TimelineEvent[], Source[]] = await Promise.all([
      db()
        .select()
        .from(timelineEvent)
        .where(
          and(
            eq(timelineEvent.status, 'published'),
            isNotNull(timelineEvent.sourceId)
          )
        )
        .orderBy(desc(timelineEvent.eventDate)),
      db().select().from(source).where(eq(source.status, 'published')),
    ]);

    const sourceMap = new Map(sources.map((item) => [item.id, item]));
    return events
      .filter((event) => event.sourceId && sourceMap.has(event.sourceId))
      .map((event) => ({
        ...event,
        source: event.sourceId ? (sourceMap.get(event.sourceId) ?? null) : null,
      }));
  } catch {
    // Render the page shell even if the content database is unavailable.
    return [];
  }
});
