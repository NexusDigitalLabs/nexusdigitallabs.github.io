'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import AuthGate from '@/components/AuthGate';
import { useAuth } from '@/components/AuthProvider';
import {
  CURRENCIES,
  normalizeCurrencyCode,
  type CurrencyCode,
} from '@/lib/currencies';
import {
  fetchOwnProfile,
  updateOwnDisplayName,
  updateOwnPreferredCurrency,
  type Profile,
} from '@/lib/profile';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

function initials(email?: string | null, name?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'U';
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return 'U';
}

function AccountPanel() {
  const { user, signOut, setProfile: setAuthProfile } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setDisplayName('');
      setCurrency('USD');
      setStatus('idle');
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setError(null);

    const supabase = createBrowserSupabaseClient();
    fetchOwnProfile(supabase, user.id).then(({ profile: row, error: err }) => {
      if (cancelled) return;
      if (err) {
        setError(err);
        setStatus('error');
        return;
      }
      setProfile(row);
      if (row) setAuthProfile(row);
      setDisplayName(row?.display_name ?? '');
      setCurrency(normalizeCurrencyCode(row?.preferred_currency));
      setStatus('idle');
    });

    return () => {
      cancelled = true;
    };
  }, [user, setAuthProfile]);

  if (!user) return null;

  const avatar = profile?.avatar_url ?? null;
  const email = profile?.email ?? user.email ?? null;

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setStatus('saving');
    setError(null);
    const supabase = createBrowserSupabaseClient();

    const { profile: named, error: nameErr } = await updateOwnDisplayName(
      supabase,
      user.id,
      displayName
    );
    if (nameErr || !named) {
      setError(nameErr ?? 'Could not save.');
      setStatus('error');
      return;
    }

    const { profile: updated, error: curErr } = await updateOwnPreferredCurrency(
      supabase,
      user.id,
      currency
    );
    if (curErr || !updated) {
      // Name saved; surface currency error without losing name update.
      setProfile(named);
      setAuthProfile(named);
      setDisplayName(named.display_name ?? '');
      setError(curErr ?? 'Could not save currency preference.');
      setStatus('error');
      return;
    }

    setProfile(updated);
    setAuthProfile(updated);
    setDisplayName(updated.display_name ?? '');
    setCurrency(normalizeCurrencyCode(updated.preferred_currency));
    try {
      localStorage.setItem('ndl_fuel_currency', updated.preferred_currency);
    } catch {
      /* ignore */
    }
    setStatus('saved');
    window.setTimeout(() => setStatus((s) => (s === 'saved' ? 'idle' : s)), 2000);
  }

  async function onSignOut() {
    await signOut();
    router.refresh();
  }

  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{ background: 'var(--ndl-surface)', border: '1px solid var(--ndl-border)' }}
    >
      <div className="flex items-center gap-4 mb-8">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            width={56}
            height={56}
            className="w-14 h-14 rounded-xl object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold ndl-on-accent"
            style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1)' }}
          >
            {initials(email, displayName || profile?.display_name)}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-base font-semibold truncate" style={{ color: 'var(--ndl-text)' }}>
            {displayName || profile?.display_name || 'Account'}
          </p>
          {email && (
            <p className="text-sm truncate" style={{ color: 'var(--ndl-faint)' }}>
              {email}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label
            htmlFor="account-display-name"
            className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: 'var(--ndl-faint)' }}
          >
            Display name
          </label>
          <input
            id="account-display-name"
            type="text"
            maxLength={80}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={status === 'loading' || status === 'saving'}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-shadow"
            style={{
              color: 'var(--ndl-text)',
              background: 'var(--ndl-surface-2)',
              border: '1px solid var(--ndl-border)',
            }}
            autoComplete="nickname"
          />
        </div>

        <div>
          <label
            htmlFor="account-currency"
            className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: 'var(--ndl-faint)' }}
          >
            Preferred currency
          </label>
          <select
            id="account-currency"
            value={currency}
            onChange={(e) => setCurrency(normalizeCurrencyCode(e.target.value))}
            disabled={status === 'loading' || status === 'saving'}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{
              color: 'var(--ndl-text)',
              background: 'var(--ndl-surface-2)',
              border: '1px solid var(--ndl-border)',
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.label}
              </option>
            ))}
          </select>
          <p className="text-xs mt-1.5" style={{ color: 'var(--ndl-faint)' }}>
            Used across tools such as Fuel Tracker when you are signed in.
          </p>
        </div>

        <div>
          <p
            className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: 'var(--ndl-faint)' }}
          >
            Email
          </p>
          <p className="text-sm" style={{ color: 'var(--ndl-muted)' }}>
            {email ?? '—'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--ndl-faint)' }}>
            Managed by your sign-in provider (Google or magic link).
          </p>
        </div>

        {error && (
          <p className="text-sm" role="alert" style={{ color: '#ef4444' }}>
            {error}
            {error.toLowerCase().includes('preferred_currency')
              ? ' — run supabase/migrations/003_preferred_currency.sql in Supabase.'
              : ''}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={status === 'loading' || status === 'saving'}
            className="text-sm font-semibold px-4 py-2 rounded-lg ndl-on-accent disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg,#2563eb,#6366f1)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={() => void onSignOut()}
            className="text-sm font-medium px-3 py-2 rounded-lg"
            style={{
              color: 'var(--ndl-muted)',
              background: 'transparent',
              border: '1px solid var(--ndl-border)',
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </form>

      <p className="text-xs mt-8 leading-relaxed" style={{ color: 'var(--ndl-faint)' }}>
        Your account powers optional cloud features (e.g. linking a Fuel Tracker garage).
        Calculators and documents still run privately in your browser by default.
        See the{' '}
        <a href="/privacy-policy/" className="underline" style={{ color: 'var(--ndl-muted)' }}>
          Privacy Policy
        </a>
        {' '}and{' '}
        <a href="/terms/" className="underline" style={{ color: 'var(--ndl-muted)' }}>
          Terms of Use
        </a>
        .
      </p>
    </div>
  );
}

export default function AccountClient() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
        <div className="w-full max-w-md h-48 rounded-2xl ndl-skeleton" aria-hidden="true" />
      </div>
    );
  }

  if (!user) {
    return (
      <AuthGate
        variant="page"
        next="/account/"
        title="Sign in required"
        description="View and edit your profile, display name, and preferred currency after you sign in."
        minHeight="calc(100vh - 64px)"
      >
        {null}
      </AuthGate>
    );
  }

  return (
    <section className="relative overflow-hidden ndl-dot-grid py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute top-[-120px] right-[15%] w-[450px] h-[450px] rounded-full"
          style={{
            background: 'radial-gradient(circle,rgba(37,99,235,0.11) 0%,transparent 65%)',
            filter: 'blur(80px)',
          }}
        />
      </div>
      <div className="relative max-w-lg mx-auto px-6 sm:px-10">
        <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">Account</p>
        <h1
          className="text-3xl sm:text-4xl font-light tracking-tight mb-3"
          style={{ color: 'var(--ndl-text)' }}
        >
          Your profile
        </h1>
        <p
          className="text-sm sm:text-base font-light leading-relaxed mb-10"
          style={{ color: 'var(--ndl-muted)' }}
        >
          Update how your name and currency preference appear across NexusDigitalLabs.
        </p>
        <AccountPanel />
      </div>
    </section>
  );
}
