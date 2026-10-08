/** True for FreelanceOS routes (/app and below), which use their own chrome. */
export function isAppPath(pathname: string | null | undefined): boolean {
  return pathname === '/app' || Boolean(pathname?.startsWith('/app/'));
}
