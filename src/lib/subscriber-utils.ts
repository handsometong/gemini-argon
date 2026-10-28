export function normalizeSubscriberEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function createSubscriberToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const raw = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return { raw, hash: await sha256Token(raw) };
}

export async function sha256Token(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function isTokenExpired(
  expiresAt: Date | string | number,
  now = Date.now()
) {
  return new Date(expiresAt).getTime() <= now;
}
