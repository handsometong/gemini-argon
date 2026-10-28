import { desc, eq } from 'drizzle-orm';

import { db } from '@/core/db';
import { source, type NewSource } from '@/config/db/schema';
import { getUuid } from '@/lib/hash';

export async function listSources(includeDrafts = false) {
  return db()
    .select()
    .from(source)
    .where(includeDrafts ? undefined : eq(source.status, 'published'))
    .orderBy(desc(source.createdAt));
}

export async function saveSource(
  input: Omit<NewSource, 'id' | 'createdAt'> & { id?: string }
) {
  if (!input.url || !/^https?:\/\//i.test(input.url))
    throw new Error('A valid source URL is required');
  const id = input.id || getUuid();
  if (input.id) {
    const rows = await db()
      .update(source)
      .set(input as any)
      .where(eq(source.id, input.id))
      .returning();
    return rows[0];
  }
  const rows = await db()
    .insert(source)
    .values({ ...input, id, createdAt: new Date() } as any)
    .returning();
  return rows[0];
}

export async function removeSource(id: string) {
  await db().delete(source).where(eq(source.id, id));
}
