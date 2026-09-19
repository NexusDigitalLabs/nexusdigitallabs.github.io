// Google Consent Mode v2 — the mechanism Google tags (GTM, AdSense, Ads,
// Analytics) read to decide whether to set advertising/measurement cookies.
// Since Jan 16 2024, AdSense/Ad Manager/AdMob publishers serving EEA/UK users
// must use a Google-certified CMP; this hand-built banner is NOT one (Google
// doesn't certify custom code). It correctly plumbs Consent Mode v2 signals
// and is real, useful GDPR compliance for the GTM tag already loading
// unconditionally today — but before actually serving AdSense ads to EEA/UK
// traffic, replace or supplement it with AdSense's own "Privacy & messaging"
// (Google's certified CMP, configured entirely in the AdSense dashboard once
// the account exists — no code change needed here, it reads the same
// dataLayer this file writes to).
export type ConsentState = 'granted' | 'denied';

const STORAGE_KEY = 'ndl_ad_consent';
export const CONSENT_CHANGED_EVENT = 'ndl:consent-changed';
export const OPEN_CONSENT_SETTINGS_EVENT = 'ndl:open-consent-settings';

export function getStoredConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

function gtag(...args: unknown[]): void {
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(args);
}

function pushConsentUpdate(state: ConsentState): void {
  gtag('consent', 'update', {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
}

/** Stores the visitor's choice, updates Consent Mode, and notifies same-tab
 * listeners (e.g. AdSenseScript) — the single entry point the banner and the
 * "Cookie Settings" re-opener should both call. */
export function setConsent(state: ConsentState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, state);
  } catch {
    /* ignore */
  }
  pushConsentUpdate(state);
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: state }));
}

/** Re-applies a previously stored choice — call once on mount so returning
 * visitors don't stay stuck on the safe "denied" default from layout.tsx's
 * inline script. Returns the stored state (or null if this is a first visit,
 * in which case the caller should show the banner instead). */
export function reapplyStoredConsent(): ConsentState | null {
  const stored = getStoredConsent();
  if (stored) pushConsentUpdate(stored);
  return stored;
}
