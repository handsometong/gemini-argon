import { and, eq } from 'drizzle-orm';

import { db } from '@/core/db';
import {
  createCloudflareEmailProvider,
  createResendProvider,
  emailManager,
} from '@/core/email';
import { ArgonSubscriptionEmail } from '@/core/email/templates/argon-subscription';
import { envConfigs } from '@/config';
import { subscriber } from '@/config/db/schema';
import { getUuid } from '@/lib/hash';
import {
  createSubscriberToken,
  isTokenExpired,
  normalizeSubscriberEmail,
  sha256Token,
} from '@/lib/subscriber-utils';

const CONFIRMATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const UNSUBSCRIBE_TOKEN_TTL_MS = 365 * 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 5 * 60 * 1000;

export type MailConfig = {
  provider: 'resend' | 'cloudflare';
  sender: string;
};

export function resolveSubscriberMailConfig(
  configs: Record<string, string>
): MailConfig | null {
  const provider =
    configs.email_provider ||
    (configs.resend_api_key && configs.resend_sender_email
      ? 'resend'
      : configs.cloudflare_email_api_token &&
          configs.cloudflare_email_account_id &&
          configs.cloudflare_email_sender_email
        ? 'cloudflare'
        : '');

  if (
    provider === 'resend' &&
    configs.resend_api_key &&
    configs.resend_sender_email
  ) {
    if (!emailManager.getProvider('resend')) {
      emailManager.addProvider(
        createResendProvider({
          apiKey: configs.resend_api_key,
          defaultFrom: configs.resend_sender_email,
        }),
        true
      );
    }
    return { provider: 'resend', sender: configs.resend_sender_email };
  }

  if (
    provider === 'cloudflare' &&
    configs.cloudflare_email_api_token &&
    configs.cloudflare_email_account_id &&
    configs.cloudflare_email_sender_email
  ) {
    if (!emailManager.getProvider('cloudflare')) {
      emailManager.addProvider(
        createCloudflareEmailProvider({
          apiToken: configs.cloudflare_email_api_token,
          accountId: configs.cloudflare_email_account_id,
          defaultFrom: configs.cloudflare_email_sender_email,
        }),
        true
      );
    }
    return {
      provider: 'cloudflare',
      sender: configs.cloudflare_email_sender_email,
    };
  }

  return null;
}

async function sendMail(
  config: MailConfig,
  input: {
    to: string;
    subject: string;
    confirmationUrl?: string;
    unsubscribeUrl?: string;
    kind?: 'confirmation' | 'update' | 'unsubscribe';
  }
) {
  return emailManager.sendEmailWithProvider(
    {
      to: input.to,
      from: config.sender,
      subject: input.subject,
      react: ArgonSubscriptionEmail({
        confirmationUrl: input.confirmationUrl,
        unsubscribeUrl: input.unsubscribeUrl,
        kind: input.kind,
      }),
      text: input.confirmationUrl || input.unsubscribeUrl || input.subject,
    },
    config.provider
  );
}

export async function createOrUpdateSubscriber(input: {
  email: string;
  locale?: string;
  mailConfig?: MailConfig | null;
}) {
  const email = normalizeSubscriberEmail(input.email);
  if (!/^\S+@\S+\.\S+$/.test(email))
    throw new Error('Please enter a valid email address');
  const now = new Date();
  const existing = await db()
    .select()
    .from(subscriber)
    .where(eq(subscriber.email, email))
    .limit(1);
  const existingRow = existing[0];
  const mailConfig = input.mailConfig ?? null;

  if (
    existingRow?.status === 'pending' &&
    existingRow.lastSentAt &&
    Date.now() - new Date(existingRow.lastSentAt).getTime() < RESEND_COOLDOWN_MS
  ) {
    return { accepted: true, deliveryConfigured: Boolean(mailConfig) };
  }

  const token = await createSubscriberToken();
  const payload = {
    locale: input.locale || 'en',
    status: 'pending',
    confirmationTokenHash: token.hash,
    tokenExpiresAt: new Date(Date.now() + CONFIRMATION_TOKEN_TTL_MS),
    updatedAt: now,
  } as const;
  if (existingRow) {
    await db()
      .update(subscriber)
      .set(payload)
      .where(eq(subscriber.id, existingRow.id));
  } else {
    await db()
      .insert(subscriber)
      .values({ ...payload, id: getUuid(), email, createdAt: now } as any);
  }

  let deliveryAttempted = false;
  if (mailConfig) {
    deliveryAttempted = true;
    const confirmationUrl = `${envConfigs.app_url}/api/subscribers/confirm?token=${token.raw}`;
    const result = await sendMail(mailConfig, {
      to: email,
      subject: 'Confirm your Gemini Argon updates',
      confirmationUrl,
      kind: 'confirmation',
    });
    if (result.success) {
      await db()
        .update(subscriber)
        .set({ lastSentAt: new Date(), updatedAt: new Date() })
        .where(eq(subscriber.email, email));
    }
  }

  return {
    accepted: true,
    deliveryConfigured: Boolean(mailConfig),
    deliveryAttempted,
  };
}

export async function confirmSubscriber(rawToken: string) {
  const tokenHash = await sha256Token(rawToken);
  const rows = await db()
    .select()
    .from(subscriber)
    .where(eq(subscriber.confirmationTokenHash, tokenHash))
    .limit(1);
  const row = rows[0];
  if (!row || !row.tokenExpiresAt || isTokenExpired(row.tokenExpiresAt))
    throw new Error('Confirmation link is invalid or expired');
  const unsubscribe = await createSubscriberToken();
  const now = new Date();
  const updated = await db()
    .update(subscriber)
    .set({
      status: 'confirmed',
      confirmationTokenHash: null,
      unsubscribeTokenHash: unsubscribe.hash,
      tokenExpiresAt: new Date(Date.now() + UNSUBSCRIBE_TOKEN_TTL_MS),
      confirmedAt: now,
      updatedAt: now,
    })
    .where(eq(subscriber.id, row.id))
    .returning();
  return { subscriber: updated[0], unsubscribeToken: unsubscribe.raw };
}

export async function unsubscribeSubscriber(
  rawToken: string,
  mailConfig: MailConfig | null = null
) {
  const tokenHash = await sha256Token(rawToken);
  const rows = await db()
    .select()
    .from(subscriber)
    .where(
      and(
        eq(subscriber.unsubscribeTokenHash, tokenHash),
        eq(subscriber.status, 'confirmed')
      )
    )
    .limit(1);
  const row = rows[0];
  if (!row || (row.tokenExpiresAt && isTokenExpired(row.tokenExpiresAt))) {
    throw new Error('Unsubscribe link is invalid or expired');
  }
  await db()
    .update(subscriber)
    .set({
      status: 'unsubscribed',
      unsubscribedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriber.id, row.id));

  if (mailConfig) {
    await sendMail(mailConfig, {
      to: row.email,
      subject: 'You have unsubscribed from Gemini Argon updates',
      kind: 'unsubscribe',
    }).catch(() => undefined);
  }
  return { success: true };
}
export async function sendArgonUpdateNotifications(input: {
  mailConfig: MailConfig | null;
  trackerUrl?: string;
  subject?: string;
  limit?: number;
  minIntervalMs?: number;
}) {
  if (!input.mailConfig) {
    return { configured: false, sent: 0, failed: 0, skipped: 0 };
  }

  const limit = Math.min(Math.max(Math.floor(input.limit ?? 100), 1), 500);
  const minIntervalMs = Math.max(0, input.minIntervalMs ?? RESEND_COOLDOWN_MS);
  const trackerUrl =
    input.trackerUrl || `${envConfigs.app_url}/models/gemini-4-argon`;
  const subject = input.subject || 'Gemini Argon tracker update';
  const rows = await db()
    .select()
    .from(subscriber)
    .where(eq(subscriber.status, 'confirmed'))
    .limit(limit);

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of rows) {
    if (
      row.lastSentAt &&
      Date.now() - new Date(row.lastSentAt).getTime() < minIntervalMs
    ) {
      skipped += 1;
      continue;
    }

    // The raw unsubscribe token is never persisted. A fresh token is generated
    // for each delivery and only its hash is stored in the subscriber row.
    const unsubscribe = await createSubscriberToken();
    const unsubscribeUrl = `${envConfigs.app_url}/api/subscribers/unsubscribe?token=${encodeURIComponent(unsubscribe.raw)}`;
    await db()
      .update(subscriber)
      .set({
        unsubscribeTokenHash: unsubscribe.hash,
        tokenExpiresAt: new Date(Date.now() + UNSUBSCRIBE_TOKEN_TTL_MS),
        updatedAt: new Date(),
      })
      .where(eq(subscriber.id, row.id));

    try {
      const result = await sendMail(input.mailConfig, {
        to: row.email,
        subject,
        confirmationUrl: trackerUrl,
        unsubscribeUrl,
        kind: 'update',
      });
      if (!result.success) {
        failed += 1;
        continue;
      }
      await db()
        .update(subscriber)
        .set({ lastSentAt: new Date(), updatedAt: new Date() })
        .where(eq(subscriber.id, row.id));
      sent += 1;
    } catch {
      failed += 1;
    }
  }

  return { configured: true, sent, failed, skipped };
}
