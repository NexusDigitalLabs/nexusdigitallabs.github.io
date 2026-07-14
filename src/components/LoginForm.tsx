'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'magic-sent'; email: string }
  | { kind: 'error'; message: string };

function safeNext(raw: string | null): string {
  if (!raw) return '/';
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/';
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const next = useMemo(() => safeNext(searchParams.get('next')), [searchParams]);
  const urlError = searchParams.get('error');
  const urlMessage = searchParams.get('message');

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>(
    urlError
      ? {
          kind: 'error',
          message: urlMessage
            ? decodeURIComponent(urlMessage)
            : 'Sign-in failed. Please try again.',
        }
      : { kind: 'idle' }
  );

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback/?next=${encodeURIComponent(next)}`
      : undefined;

  async function signInWithGoogle() {
    setStatus({ kind: 'loading' });
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo ?? `${window.location.origin}/auth/callback/`,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) {
        setStatus({ kind: 'error', message: error.message });
      }
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Could not start Google sign-in.',
      });
    }
  }

  async function sendMagicLink(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus({ kind: 'error', message: 'Enter a valid email address.' });
      return;
    }

    setStatus({ kind: 'loading' });
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: redirectTo ?? `${window.location.origin}/auth/callback/`,
          shouldCreateUser: true,
        },
      });
      if (error) {
        setStatus({ kind: 'error', message: error.message });
        return;
      }
      setStatus({ kind: 'magic-sent', email: trimmed });
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Could not send magic link.',
      });
    }
  }

  const busy = status.kind === 'loading';

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-60"
        style={{
          background: 'var(--ndl-surface)',
          border: '1px solid var(--ndl-border)',
          color: 'var(--ndl-text)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-1.1 3.1-3.5 5.4-6.4 6.7l.1.1 6.3 5.3C39.6 37.3 44 31.5 44 24c0-1.3-.1-2.7-.4-3.9z" />
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: 'var(--ndl-border)' }} />
        <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--ndl-faint)' }}>or</span>
        <div className="h-px flex-1" style={{ background: 'var(--ndl-border)' }} />
      </div>

      {status.kind === 'magic-sent' ? (
        <div
          className="rounded-xl px-4 py-4 text-sm leading-relaxed"
          style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            color: '#059669',
          }}
        >
          Magic link sent to <strong style={{ color: 'var(--ndl-text)' }}>{status.email}</strong>.
          Check your inbox and open the link to finish signing in.
        </div>
      ) : (
        <form onSubmit={sendMagicLink} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-medium mb-1.5 tracking-wide"
              style={{ color: 'var(--ndl-muted)' }}
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={busy}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:opacity-60"
              style={{
                background: 'var(--ndl-input-bg)',
                border: '1px solid var(--ndl-input-border)',
                color: 'var(--ndl-text)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = '1px solid var(--ndl-accent)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '1px solid var(--ndl-input-border)';
                e.currentTarget.style.boxShadow = '';
              }}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 ndl-on-accent text-sm font-semibold px-7 py-3 rounded-xl transition-all duration-200 disabled:opacity-60"
            style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.35)' }}
          >
            {busy ? 'Sending…' : 'Email me a magic link'}
          </button>
        </form>
      )}

      {status.kind === 'error' && (
        <p
          className="text-sm rounded-xl px-4 py-3 border"
          style={{ color: '#dc2626', background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}
          role="alert"
        >
          {status.message}
        </p>
      )}

      <p className="text-xs leading-relaxed text-center" style={{ color: 'var(--ndl-faint)' }}>
        By continuing you agree we may process your account data as described in our{' '}
        <a href="/privacy-policy/" className="underline" style={{ color: 'var(--ndl-muted)' }}>
          Privacy Policy
        </a>
        . We don&apos;t sell your data.
      </p>
    </div>
  );
}
