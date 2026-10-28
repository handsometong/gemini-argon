import assert from 'node:assert/strict';
import test from 'node:test';

import { escapeHtml } from '../src/lib/html';
import {
  createSubscriberToken,
  isTokenExpired,
  normalizeSubscriberEmail,
  sha256Token,
} from '../src/lib/subscriber-utils';

test('normalizes subscriber email and generates verifiable token hashes', async () => {
  const email = normalizeSubscriberEmail('  Person@Example.COM ');
  assert.equal(email, 'person@example.com');
  const token = await createSubscriberToken();
  assert.equal(await sha256Token(token.raw), token.hash);
  assert.notEqual(token.raw, token.hash);
});

test('expires tokens at or after their expiry timestamp', () => {
  const now = new Date('2026-10-01T00:00:00.000Z');
  assert.equal(
    isTokenExpired(new Date('2026-09-30T23:59:59.000Z'), now.getTime()),
    true
  );
  assert.equal(
    isTokenExpired(new Date('2026-10-01T00:00:01.000Z'), now.getTime()),
    false
  );
});

test('escapes subscriber-facing HTML error text', () => {
  assert.equal(
    escapeHtml('<script>alert("x")</script> & "quoted"'),
    '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &quot;quoted&quot;'
  );
});
