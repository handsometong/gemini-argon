import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/core/db';
import { comparisonPage } from '@/config/db/schema';
import { getUuid } from '@/lib/hash';
import { getEnrichedTrackerModelById } from '@/lib/tracker-model';

export async function listComparisons(includeDrafts = false, locale?: string) {
  const rows = await db()
    .select()
    .from(comparisonPage)
    .where(
      and(
        includeDrafts ? undefined : eq(comparisonPage.status, 'published'),
        locale ? eq(comparisonPage.locale, locale) : undefined
      )
    )
    .orderBy(desc(comparisonPage.updatedAt));
  return Promise.all(rows.map(withModels));
}

export async function listPublishedComparisons(locale?: string) {
  return listComparisons(false, locale);
}

export async function removeComparison(id: string) {
  await db().delete(comparisonPage).where(eq(comparisonPage.id, id));
}

export async function getComparisonBySlug(slug: string, includeDrafts = false) {
  const rows = await db()
    .select()
    .from(comparisonPage)
    .where(
      and(
        eq(comparisonPage.slug, slug),
        includeDrafts ? undefined : eq(comparisonPage.status, 'published')
      )
    )
    .limit(1);
  return rows[0] ? withModels(rows[0]) : null;
}

async function withModels(row: typeof comparisonPage.$inferSelect) {
  const [leftModel, rightModel] = await Promise.all([
    getEnrichedTrackerModelById(row.leftModelId, true),
    getEnrichedTrackerModelById(row.rightModelId, true),
  ]);
  return { ...row, leftModel, rightModel };
}

export async function saveComparison(
  input: Omit<typeof comparisonPage.$inferInsert, 'id'> & { id?: string }
) {
  if (!input.slug || !input.leftModelId || !input.rightModelId)
    throw new Error('Comparison slug and both model IDs are required');
  const id = input.id || getUuid();
  if (input.id) {
    const rows = await db()
      .update(comparisonPage)
      .set({ ...input, updatedAt: new Date().toISOString() } as any)
      .where(eq(comparisonPage.id, input.id))
      .returning();
    return rows[0];
  }
  const rows = await db()
    .insert(comparisonPage)
    .values({ ...input, id, updatedAt: new Date().toISOString() } as any)
    .returning();
  return rows[0];
}
