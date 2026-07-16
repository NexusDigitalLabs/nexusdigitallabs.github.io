'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '@/components/AuthProvider';
import { loginUrl } from '@/lib/auth-redirect';

function initialsFromUser(email?: string | null, name?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'U';
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return 'U';
}

function normalizeAvatarUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith('googleusercontent.com')) {
      // Google often rejects hotlinks that send a referrer; also normalize size suffix.
      u.search = '';
      const path = u.pathname.replace(/=s\d+(-c)?$/i, '');
      u.pathname = `${path}=s96-c`;
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}

function resolveAvatarUrl(user: User): string | null {
  const meta = user.user_metadata ?? {};
  const fromMeta = (meta.avatar_url || meta.picture || meta.avatar) as string | undefined;
  if (fromMeta) return normalizeAvatarUrl(fromMeta);

  for (const identity of user.identities ?? []) {
    const data = identity.identity_data ?? {};
    const fromIdentity = (data.avatar_url || data.picture || data.avatar) as string | undefined;
    if (fromIdentity) return normalizeAvatarUrl(fromIdentity);
  }
  return null;
}

function UserAvatar({
  avatarUrl,
  email,
  name,
}: {
  avatarUrl: string | null;
  email: string | null;
  name: string | null;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [avatarUrl]);

  if (!avatarUrl || failed) {
    return (
      <span
        className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ndl-on-accent"
        style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1)' }}
      >
        {initialsFromUser(email, name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarUrl}
      alt=""
      width={24}
      height={24}
      className="w-6 h-6 rounded-md object-cover"
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export default function AuthMenu() {
  const { user, profile, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (loading) {
    return (
      <div
        className="w-8 h-8 rounded-lg ndl-skeleton shrink-0"
        aria-hidden="true"
      />
    );
  }

  if (!user) {
    return (
      <Link
        href={loginUrl(pathname || '/')}
        className="inline-flex items-center text-[11px] sm:text-xs font-semibold px-2 sm:px-3 py-1.5 rounded-lg no-underline transition-colors shrink-0"
        style={{
          color: 'var(--ndl-text)',
          border: '1px solid var(--ndl-border)',
          background: 'var(--ndl-surface-2)',
        }}
      >
        Sign in
      </Link>
    );
  }

  const meta = user.user_metadata ?? {};
  const name =
    (profile?.display_name?.trim() ||
      (meta.full_name as string | undefined) ||
      (meta.name as string | undefined) ||
      null) ?? null;
  const email = profile?.email ?? user.email ?? null;
  const avatar = profile?.avatar_url
    ? normalizeAvatarUrl(profile.avatar_url)
    : resolveAvatarUrl(user);
  const label = name || email || 'Account';

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu — ${label}`}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors"
        style={{ border: '1px solid var(--ndl-border)', background: 'var(--ndl-surface-2)' }}
      >
        <UserAvatar avatarUrl={avatar} email={email} name={name} />
        <span className="hidden sm:inline max-w-[110px] truncate text-xs font-medium pr-1" style={{ color: 'var(--ndl-text)' }}>
          {label}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl py-2 z-50 shadow-lg"
          style={{
            background: 'var(--ndl-surface)',
            border: '1px solid var(--ndl-border)',
            boxShadow: '0 12px 40px rgba(15,23,42,0.18)',
          }}
        >
          <div className="px-3 pb-2 mb-1 flex items-center gap-2.5" style={{ borderBottom: '1px solid var(--ndl-border-soft)' }}>
            <UserAvatar avatarUrl={avatar} email={email} name={name} />
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--ndl-text)' }}>{label}</p>
              {email && name && (
                <p className="text-[11px] truncate" style={{ color: 'var(--ndl-faint)' }}>{email}</p>
              )}
            </div>
          </div>
          <Link
            href="/account/"
            role="menuitem"
            className="block px-3 py-2 text-sm no-underline transition-colors"
            style={{ color: 'var(--ndl-muted)' }}
            onClick={() => setOpen(false)}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ndl-text)'; e.currentTarget.style.background = 'var(--ndl-surface-2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ndl-muted)'; e.currentTarget.style.background = 'transparent'; }}
          >
            Account
          </Link>
          <button
            type="button"
            role="menuitem"
            className="w-full text-left px-3 py-2 text-sm transition-colors"
            style={{ color: 'var(--ndl-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onClick={async () => {
              setOpen(false);
              await signOut();
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ndl-text)'; e.currentTarget.style.background = 'var(--ndl-surface-2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ndl-muted)'; e.currentTarget.style.background = 'transparent'; }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/** Compact auth controls for the mobile drawer */
export function AuthMenuMobile({ onNavigate }: { onNavigate?: () => void }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  if (loading) return null;

  if (!user) {
    return (
      <Link
        href={loginUrl(pathname || '/')}
        className="text-sm font-semibold no-underline"
        style={{ color: 'var(--ndl-text)' }}
        onClick={onNavigate}
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/account/"
        className="text-sm font-semibold no-underline"
        style={{ color: 'var(--ndl-text)' }}
        onClick={onNavigate}
      >
        Account
      </Link>
      <button
        type="button"
        className="text-sm text-left"
        style={{ color: 'var(--ndl-muted)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        onClick={async () => {
          onNavigate?.();
          await signOut();
        }}
      >
        Sign out{user.email ? ` (${user.email})` : ''}
      </button>
    </div>
  );
}
