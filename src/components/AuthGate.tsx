'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

type AuthGateProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  next?: string;
  minHeight?: number | string;
  /** Full-viewport gate vs compact card (default). */
  variant?: 'card' | 'page';
};

function loginHref(next: string): string {
  const path = next.startsWith('/') && !next.startsWith('//') ? next : '/';
  const normalized = path.endsWith('/') || path === '/' ? path : `${path}/`;
  return `/login/?next=${encodeURIComponent(normalized)}`;
}

function LockMark() {
  return (
    <div
      className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'linear-gradient(145deg, rgba(37,99,235,0.35), rgba(14,165,233,0.12))',
          filter: 'blur(12px)',
          opacity: 0.9,
        }}
      />
      <div
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: 'var(--ndl-surface)',
          border: '1px solid color-mix(in srgb, var(--ndl-accent) 40%, var(--ndl-border))',
          color: 'var(--ndl-accent)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="4" y="11" width="16" height="10" rx="2.5" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function GateDialog({
  title,
  description,
  nextPath,
}: {
  title: string;
  description: string;
  nextPath: string;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-gate-title"
      aria-describedby="auth-gate-desc"
      className="w-full max-w-[22rem] text-center"
    >
      <LockMark />
      <h2
        id="auth-gate-title"
        className="text-[1.35rem] font-semibold tracking-tight mb-2.5"
        style={{ color: 'var(--ndl-text)' }}
      >
        {title}
      </h2>
      <p
        id="auth-gate-desc"
        className="text-sm font-light leading-relaxed mb-7"
        style={{ color: 'var(--ndl-muted)' }}
      >
        {description}
      </p>
      <Link
        href={loginHref(nextPath)}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold no-underline ndl-on-accent transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
        style={{
          background: 'linear-gradient(135deg,#2563eb 0%,#3b82f6 55%,#0ea5e9 100%)',
          boxShadow: '0 12px 32px rgba(37,99,235,0.32)',
        }}
      >
        Sign in to continue
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
      <p className="text-xs mt-5 tracking-wide" style={{ color: 'var(--ndl-faint)' }}>
        Google or magic link · no password
      </p>
    </div>
  );
}

/**
 * Blocks children until signed in. Prefer `variant="page"` for tool locks.
 */
export default function AuthGate({
  children,
  title = 'Sign in required',
  description = 'Sign in to access this area. Other tools stay available without an account.',
  next,
  minHeight = 320,
  variant = 'card',
}: AuthGateProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const nextPath =
    next ??
    (pathname && pathname !== '/'
      ? pathname.endsWith('/')
        ? pathname
        : `${pathname}/`
      : '/account/');

  if (loading) {
    return (
      <div
        className="w-full rounded-2xl ndl-skeleton"
        style={{ minHeight: variant === 'page' ? 'min(70vh, 520px)' : minHeight }}
        aria-busy="true"
        aria-label="Checking sign-in"
      />
    );
  }

  if (user) {
    return <>{children}</>;
  }

  if (variant === 'page') {
    return (
      <div
        className="relative w-full overflow-hidden"
        style={{
          minHeight: typeof minHeight === 'number' ? minHeight : minHeight,
          background: 'var(--ndl-bg)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(37,99,235,0.16), transparent 65%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(14,165,233,0.08), transparent 55%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(var(--ndl-border-soft) 1px, transparent 1px), linear-gradient(90deg, var(--ndl-border-soft) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
          }}
        />
        <div className="relative flex min-h-[inherit] items-center justify-center px-6 py-16 sm:py-24">
          <div
            className="w-full max-w-md rounded-[1.75rem] px-7 py-9 sm:px-9 sm:py-10"
            style={{
              background: 'color-mix(in srgb, var(--ndl-surface) 88%, transparent)',
              border: '1px solid var(--ndl-border)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 28px 80px rgba(0,0,0,0.35)',
            }}
          >
            <GateDialog title={title} description={description} nextPath={nextPath} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        minHeight,
        border: '1px solid var(--ndl-border)',
        background: 'var(--ndl-surface)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none select-none opacity-40"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(circle at 30% 20%, rgba(37,99,235,0.18), transparent 50%), radial-gradient(circle at 80% 90%, rgba(14,165,233,0.1), transparent 45%)',
        }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center p-5 sm:p-8"
        style={{
          background: 'color-mix(in srgb, var(--ndl-bg) 40%, transparent)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="w-full max-w-sm rounded-[1.5rem] px-6 py-8"
          style={{
            background: 'var(--ndl-surface)',
            border: '1px solid var(--ndl-border)',
            boxShadow: '0 24px 64px rgba(15, 23, 42, 0.28)',
          }}
        >
          <GateDialog title={title} description={description} nextPath={nextPath} />
        </div>
      </div>
    </div>
  );
}
