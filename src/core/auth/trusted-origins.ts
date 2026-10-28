/**
 * Return the origin of the URL the auth request was sent to.
 *
 * This is safer than trusting the Origin header: the destination URL is
 * determined by the server/router, while the header can be supplied by a
 * cross-site client. It allows Cloudflare custom domains and preview hosts
 * to use the same deployed worker without weakening CSRF checks.
 */
export function getRequestOrigin(request: Request | undefined): string | null {
  if (!request) return null;

  try {
    const origin = new URL(request.url).origin;
    return origin === 'null' ? null : origin;
  } catch {
    return null;
  }
}
