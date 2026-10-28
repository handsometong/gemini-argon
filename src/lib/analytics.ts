/** Lightweight analytics event bridge for GA4/Plausible-compatible installs. */
export type TrackerEvent =
  | 'model_view'
  | 'comparison_view'
  | 'calculator_used'
  | 'source_click'
  | 'subscribe_started'
  | 'subscribe_confirmed';

type AnalyticsWindow = Window & {
  gtag?: (
    command: string,
    event: string,
    params?: Record<string, unknown>
  ) => void;
  plausible?: (
    event: string,
    options?: { props?: Record<string, unknown> }
  ) => void;
};

export function trackEvent(
  event: TrackerEvent,
  params: Record<string, unknown> = {}
) {
  if (typeof window === 'undefined') return;
  const target = window as AnalyticsWindow;
  target.gtag?.('event', event, params);
  target.plausible?.(event, { props: params });
}
