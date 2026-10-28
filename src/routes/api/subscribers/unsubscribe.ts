import { createFileRoute } from '@tanstack/react-router';

import { getAllConfigs } from '@/modules/config/service';
import {
  resolveSubscriberMailConfig,
  unsubscribeSubscriber,
} from '@/modules/subscribers/service';
import { escapeHtml } from '@/lib/html';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

async function unsubscribeFromRequest(request: Request) {
  const token = new URL(request.url).searchParams.get('token') || '';
  return unsubscribeSubscriber(
    token,
    resolveSubscriberMailConfig(await getAllConfigs())
  );
}

async function GET({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 30_000,
    keyPrefix: 'argon-unsubscribe',
  });
  if (limited) return limited;

  try {
    await unsubscribeFromRequest(request);
    return new Response(
      '<h1>Unsubscribed</h1><p>You will no longer receive Gemini Argon tracker updates.</p>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (error) {
    return new Response(
      `<h1>Unable to unsubscribe</h1><p>${escapeHtml(error instanceof Error ? error.message : 'Invalid link')}</p>`,
      {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }
}

async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 30_000,
    keyPrefix: 'argon-unsubscribe',
  });
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => ({}));
    return respData(
      await unsubscribeSubscriber(
        String(body.token || ''),
        resolveSubscriberMailConfig(await getAllConfigs())
      )
    );
  } catch (error) {
    return respErr(
      error instanceof Error ? error.message : 'Unable to unsubscribe'
    );
  }
}

export const Route = createFileRoute('/api/subscribers/unsubscribe')({
  server: { handlers: { GET, POST } },
});
