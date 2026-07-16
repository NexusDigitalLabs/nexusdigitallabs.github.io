/**
 * Return-path helpers for sign-in → same page after auth.
 * OAuth providers sometimes strip query params from redirectTo;
 * we stash `next` in a short-lived cookie + sessionStorage as backup.
 */

export const AUTH_NEXT_COOKIE = 'ndl_auth_next';
export const AUTH_NEXT_STORAGE_KEY = 'ndl_auth_next';

/** Only allow same-origin relative paths (no open redirects). */
export function safeNextPath(raw: string | null | undefined): string {
  if (!raw) return '/';
  let path = raw.trim();
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep raw */
  }
  if (!path.startsWith('/') || path.startsWith('//')) return '/';
  // Normalize trailing slash for app routes (except root)
  if (path !== '/' && !path.endsWith('/')) path = `${path}/`;
  return path;
}

/** Build `/login/?next=…` for the current page (or a known tool path). */
export function loginUrl(nextPath: string): string {
  const safe = safeNextPath(nextPath);
  if (safe === '/') return '/login/';
  return `/login/?next=${encodeURIComponent(safe)}`;
}

/** Persist return path before leaving for Google / magic-link. */
export function stashAuthNext(nextPath: string): void {
  const safe = safeNextPath(nextPath);
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(AUTH_NEXT_STORAGE_KEY, safe);
  } catch {
    /* ignore */
  }
  try {
    const maxAge = 60 * 15; // 15 minutes
    document.cookie = `${AUTH_NEXT_COOKIE}=${encodeURIComponent(safe)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function readStashedAuthNext(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromSession = sessionStorage.getItem(AUTH_NEXT_STORAGE_KEY);
    if (fromSession) return safeNextPath(fromSession);
  } catch {
    /* ignore */
  }
  return null;
}

export function clearStashedAuthNext(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(AUTH_NEXT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  try {
    document.cookie = `${AUTH_NEXT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

/** Server: read next from cookie header. */
export function readAuthNextCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${AUTH_NEXT_COOKIE}=([^;]*)`));
  if (!match?.[1]) return null;
  try {
    return safeNextPath(decodeURIComponent(match[1]));
  } catch {
    return safeNextPath(match[1]);
  }
}

/** Clear cookie on a NextResponse. */
export function clearAuthNextCookie(response: { cookies: { set: (name: string, value: string, opts: object) => void } }) {
  response.cookies.set(AUTH_NEXT_COOKIE, '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });
}
