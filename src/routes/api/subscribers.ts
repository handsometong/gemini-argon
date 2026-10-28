import { createFileRoute } from '@tanstack/react-router';

import { getAllConfigs } from '@/modules/config/service';
import {
  createOrUpdateSubscriber,
  resolveSubscriberMailConfig,
} from '@/modules/subscribers/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 30_000,
    keyPrefix: 'argon-subscribe',
  });
  if (limited) return limited;
  try {
    const body = await request.json().catch(() => ({}));
    const result = await createOrUpdateSubscriber({
      email: String(body.email || ''),
      locale: String(body.locale || 'en'),
      mailConfig: resolveSubscriberMailConfig(await getAllConfigs()),
    });
    return respData(result);
  } catch (error) {
    return respErr(
      error instanceof Error ? error.message : 'Unable to subscribe'
    );
  }
}

export const Route = createFileRoute('/api/subscribers')({
  server: { handlers: { POST } },
});
