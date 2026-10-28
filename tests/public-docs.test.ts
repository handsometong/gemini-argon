import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

const root = new URL('../', import.meta.url);

async function read(path: string) {
  return readFile(new URL(path, root), 'utf8');
}

describe('public tracker documents', () => {
  it('keeps llms indexes focused on the tracker surfaces', async () => {
    const concise = await read('src/routes/llms[.]txt.ts');
    const full = await read('src/routes/llms-full[.]txt.ts');

    for (const source of [concise, full]) {
      assert.match(source, /gemini-4-argon/);
      assert.match(source, /cost-calculator/);
      assert.match(source, /unofficial|Independent/i);
      assert.doesNotMatch(source, /\/pricing|\/blog/);
    }

    assert.match(full, /confirmed/);
    assert.match(full, /reported/);
    assert.match(full, /unverified/);
    assert.match(full, /rss\.xml/);
  });

  it('keeps the sitemap limited to public tracker pages', async () => {
    const source = await read('src/routes/sitemap/sitemap[.]xml.ts');

    assert.match(source, /privacy-policy/);
    assert.match(source, /terms-of-service/);
    assert.match(source, /models\/gemini-4-argon/);
    assert.match(source, /tools\/cost-calculator/);
    assert.match(source, /updates/);
    assert.doesNotMatch(source, /\/pricing/);
    assert.doesNotMatch(source, /\/blog/);
  });

  it('uses current legal metadata and tracker-specific privacy language', async () => {
    const privacyEn = await read('src/content/pages/privacy-policy.en.mdx');
    const privacyZh = await read('src/content/pages/privacy-policy.zh.mdx');
    const termsEn = await read('src/content/pages/terms-of-service.en.mdx');
    const termsZh = await read('src/content/pages/terms-of-service.zh.mdx');

    for (const source of [privacyEn, privacyZh, termsEn, termsZh]) {
      assert.match(source, /2026-10-01/);
      assert.match(source, /Google|Google/);
    }

    assert.match(privacyEn, /confirmation token|token hashes/i);
    assert.match(privacyEn, /Resend|Cloudflare Email/i);
    assert.match(privacyZh, /确认令牌|令牌哈希/);
    assert.match(termsEn, /cost calculator|billing quote/i);
    assert.match(termsZh, /成本计算器|账单报价/);
  });
});

it('exposes the sitemap at the nested sitemap path', async () => {
  const source = await read('src/routes/sitemap/sitemap[.]xml.ts');

  assert.match(source, /createFileRoute\('\/sitemap\/sitemap\.xml'\)/);
  assert.match(source, /application\/xml/);
});

it('removes the legacy sitemap route and advertises the nested location', async () => {
  await assert.rejects(
    () => access(new URL('../src/routes/sitemap[.]xml.ts', import.meta.url)),
    { code: 'ENOENT' }
  );

  const robots = await read('src/routes/robots[.]txt.ts');
  assert.match(robots, /Sitemap: .*\/sitemap\/sitemap\.xml/);
  assert.doesNotMatch(robots, /\$\{envConfigs\.app_url\}\/sitemap\.xml`/);
});
