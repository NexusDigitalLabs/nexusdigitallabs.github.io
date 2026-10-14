/**
 * Routes where the site-wide promos (the PWA "Add to Home Screen" banner and the
 * "Buy me a coffee" button) are hidden. These are app-specific pages: an "install
 * the website" prompt or a tip jar next to a store listing / privacy policy is
 * off-topic, and a privacy policy should be a clean document.
 */
export function hidesSitePromos(pathname: string | null | undefined): boolean {
  return pathname === '/huffle' || Boolean(pathname?.startsWith('/huffle/'));
}
