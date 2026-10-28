import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { envConfigs } from '@/config';
import { getAllConfigs } from '@/modules/config/service';
import { hasPermission } from '@/modules/rbac/service';
import {
  resolveSubscriberMailConfig,
  sendArgonUpdateNotifications,
} from '@/modules/subscribers/service';
import { respData, respErr } from '@/lib/resp';

async function POST({ request }: { request: Request }) {
  try {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });
    if (!session?.user || !(await hasPermission(session.user.id, 'admin.*'))) {
      return respErr('Forbidden');
    }

    const body = await request.json().catch(() => ({}));
    const trackerUrl = body.trackerUrl
      ? String(body.trackerUrl)
      : `${envConfigs.app_url}/models/gemini-4-argon`;
    const parsedUrl = new URL(trackerUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return respErr('Tracker URL must use HTTP or HTTPS');
    }

    const limit = body.limit == null ? 100 : Number(body.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
      return respErr('Limit must be an integer between 1 and 500');
    }

    const subject = body.subject ? String(body.subject).trim() : undefined;
    if (subject && subject.length > 160) {
      return respErr('Subject must be 160 characters or fewer');
    }

    const result = await sendArgonUpdateNotifications({
      mailConfig: resolveSubscriberMailConfig(await getAllConfigs()),
      trackerUrl,
      subject,
      limit,
    });
    return respData(result);
  } catch (error) {
    return respErr(
      error instanceof Error ? error.message : 'Unable to send updates'
    );
  }
}

export const Route = createFileRoute('/api/admin/subscribers/notify')({
  server: { handlers: { POST } },
});
