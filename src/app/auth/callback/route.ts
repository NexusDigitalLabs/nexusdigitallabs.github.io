import { NextResponse } from 'next/server';
import type { EmailOtpType, SupabaseClient } from '@supabase/supabase-js';
import { ensureProfile } from '@/lib/profile';
import { createServerSupabaseAuthClient } from '@/lib/supabase/server';

/**
 * Completes OAuth / magic-link auth after Supabase redirects here.
 * Supports:
 * - PKCE `?code=` (Google OAuth + many magic links)
 * - `?token_hash=&type=` (email templates using TokenHash)
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

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';
  const errorDescription = searchParams.get('error_description');

  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';

  if (errorDescription) {
    return NextResponse.redirect(
      new URL(`/login/?error=auth&message=${encodeURIComponent(errorDescription)}`, origin)
    );
  }

  const supabase = await createServerSupabaseAuthClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await syncProfileAfterAuth(supabase);
      return NextResponse.redirect(new URL(safeNext, origin));
    }
    return NextResponse.redirect(
      new URL(`/login/?error=auth&message=${encodeURIComponent(error.message)}`, origin)
    );
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      await syncProfileAfterAuth(supabase);
      return NextResponse.redirect(new URL(safeNext, origin));
    }
    return NextResponse.redirect(
      new URL(`/login/?error=auth&message=${encodeURIComponent(error.message)}`, origin)
    );
  }

  return NextResponse.redirect(
    new URL(
      `/login/?error=auth&message=${encodeURIComponent('Missing auth code. Open the magic link on the same device/browser where you requested it.')}`,
      origin
    )
  );
}
