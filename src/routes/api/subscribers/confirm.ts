import { createFileRoute } from '@tanstack/react-router';

import { confirmSubscriber } from '@/modules/subscribers/service';
import { escapeHtml } from '@/lib/html';

async function GET({ request }: { request: Request }) {
  const token = new URL(request.url).searchParams.get('token') || '';
  try {
    await confirmSubscriber(token);
    return new Response(
      "<h1>Subscription confirmed</h1><p>You will receive Gemini Argon updates.</p><script>window.gtag?.('event', 'subscribe_confirmed');window.plausible?.('subscribe_confirmed');</script>",
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (error) {
    return new Response(
      `<h1>Unable to confirm subscription</h1><p>${escapeHtml(error instanceof Error ? error.message : 'Invalid link')}</p>`,
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

export const Route = createFileRoute('/api/subscribers/confirm')({
  server: { handlers: { GET } },
});
