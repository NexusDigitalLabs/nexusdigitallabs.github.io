/**
 * Routes where the site-wide promos (the PWA "Add to Home Screen" banner and the
 * "Buy me a coffee" button) are hidden. These are app-specific pages: an "install
 * the website" prompt or a tip jar next to a store listing / privacy policy is
 * off-topic, and a privacy policy should be a clean document.
 */
const APP_PAGES = ['/huffle', '/mentto'];

/** Legal documents (any app's, or the site's own) are clean pages with no promos at any depth. */
const LEGAL_SEGMENTS = new Set(['privacy-policy', 'privacy', 'terms', 'terms-of-service', 'cookies', 'legal']);

export function hidesSitePromos(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (pathname.split('/').some((segment) => LEGAL_SEGMENTS.has(segment))) return true;
  return APP_PAGES.some((base) => pathname === base || pathname.startsWith(`${base}/`));
}
