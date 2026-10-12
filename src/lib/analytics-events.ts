/**
 * Product analytics events (Umami, cookieless). Event names only — never
 * personal data, amounts, or record contents.
 *
 * Server-side flows (server actions, auth callback) can't call Umami from the
 * browser, so they queue event names in a short-lived first-party cookie;
 * <AnalyticsFlush /> sends them from the browser on the next page, keeping
 * events attributed to the real visitor session.
 */

export const ANALYTICS_EVENTS = [
  // Accounts
  'signup',
  'login',
  'account_deleted',
  // FreelanceOS funnel
  'workspace_created',
  'profile_saved',
  'client_created',
  'project_created',
  'invoice_draft_created',
  'invoice_issued',
  'payment_recorded',
  'expense_created',
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export const EVENT_COOKIE = 'ndl_evt';
/** Long enough to survive a redirect, short enough to never linger. */
export const EVENT_COOKIE_MAX_AGE = 60;

export function isAnalyticsEvent(value: unknown): value is AnalyticsEvent {
  return typeof value === 'string' && (ANALYTICS_EVENTS as readonly string[]).includes(value);
}

/** Cookie value ⇄ event list ("a.b.c"; unknown names are dropped). */
export function encodeEvents(events: AnalyticsEvent[]): string {
  return events.join('.');
}

export function decodeEvents(raw: string | undefined | null): AnalyticsEvent[] {
  if (!raw) return [];
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    /* keep raw */
  }
  return value.split('.').filter(isAnalyticsEvent).slice(0, 10);
}
