import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { localizedHome } from '../src/content/localized-home';

test('localized home pages have translated metadata and visible FAQ content', () => {
  for (const locale of ['fr', 'de', 'nl'] as const) {
    const page = localizedHome[locale];
    assert.ok(page.title.includes('Gemini'));
    assert.ok(page.description.length > 80);
    assert.ok(page.heading.includes('Gemini'));
    assert.ok(page.faqs.length >= 3);
    assert.ok(page.faqs.every((item) => item.question && item.answer));
  }
});

test('all locales use the same complete homepage and its visible FAQ data', async () => {
  const source = await readFile(
    new URL('../src/routes/index.tsx', import.meta.url),
    'utf8'
  );
  assert.doesNotMatch(source, /if \(page\)/);
  assert.match(source, /<Header\s*\/>/);
  assert.match(source, /<ArgonTracker\s*\/>/);
  assert.match(source, /<Footer\s*\/>/);
  assert.doesNotMatch(source, /page\?\.faqs/);
});
