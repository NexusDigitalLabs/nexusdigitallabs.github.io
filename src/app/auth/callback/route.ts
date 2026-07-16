import { NextResponse } from 'next/server';
import type { EmailOtpType, SupabaseClient } from '@supabase/supabase-js';
import { ensureProfile } from '@/lib/profile';
import {
  clearAuthNextCookie,
  readAuthNextCookie,
  safeNextPath,
} from '@/lib/auth-redirect';
import { createServerSupabaseAuthClient } from '@/lib/supabase/server';

/**
 * Completes OAuth / magic-link auth after Supabase redirects here.
 * Supports:
 * - PKCE `?code=` (Google OAuth + many magic links)
 * - `?token_hash=&type=` (email templates using TokenHash)
 *
 * Return path: prefers `?next=`, falls back to `ndl_auth_next` cookie
 * (stashed by LoginForm before OAuth, in case the provider drops query params).
 */
async function syncProfileAfterAuth(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    // Best-effort; login must succeed even if profiles table is not migrated yet.
    await ensureProfile(supabase, user);
  }
}

function resolveNext(request: Request, searchParams: URLSearchParams): string {
  const fromQuery = safeNextPath(searchParams.get('next'));
  if (fromQuery !== '/') return fromQuery;
  const fromCookie = readAuthNextCookie(request.headers.get('cookie'));
  return fromCookie ?? '/';
}

function redirectWithClear(url: URL) {
  const res = NextResponse.redirect(url);
  clearAuthNextCookie(res);
  return res;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = resolveNext(request, searchParams);
  const errorDescription = searchParams.get('error_description');

  if (errorDescription) {
    const login = new URL('/login/', origin);
    login.searchParams.set('error', 'auth');
    login.searchParams.set('message', errorDescription);
    if (next !== '/') login.searchParams.set('next', next);
    return redirectWithClear(login);
  }

  const supabase = await createServerSupabaseAuthClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await syncProfileAfterAuth(supabase);
      return redirectWithClear(new URL(next, origin));
    }
    const login = new URL('/login/', origin);
    login.searchParams.set('error', 'auth');
    login.searchParams.set('message', error.message);
    if (next !== '/') login.searchParams.set('next', next);
    return redirectWithClear(login);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      await syncProfileAfterAuth(supabase);
      return redirectWithClear(new URL(next, origin));
    }
    const login = new URL('/login/', origin);
    login.searchParams.set('error', 'auth');
    login.searchParams.set('message', error.message);
    if (next !== '/') login.searchParams.set('next', next);
    return redirectWithClear(login);
  }

  const login = new URL('/login/', origin);
  login.searchParams.set('error', 'auth');
  login.searchParams.set(
    'message',
    'Missing auth code. Open the magic link on the same device/browser where you requested it.'
  );
  if (next !== '/') login.searchParams.set('next', next);
  return redirectWithClear(login);
}
