import assert from 'node:assert/strict';
import test from 'node:test';

import { getRequestOrigin } from '../src/core/auth/trusted-origins';

test('uses the public request URL origin as a trusted auth origin', () => {
  const request = new Request(
    'https://custom.example.com/api/auth/sign-in/email',
    {
      headers: { Origin: 'https://attacker.example.com' },
    }
  );

  assert.equal(getRequestOrigin(request), 'https://custom.example.com');
});

test('rejects non-http request origins instead of trusting arbitrary headers', () => {
  const request = new Request('file:///tmp/auth-request', {
    headers: { Origin: 'https://attacker.example.com' },
  });

  assert.equal(getRequestOrigin(request), null);
});
