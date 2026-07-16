'use client';

import { type CSSProperties } from 'react';
import { KOFI_URL } from '@/lib/seo';

type Variant = 'button' | 'link' | 'card' | 'floating';

export type KofiTipLinkProps = {
  /** Destination URL (defaults to the platform Ko-fi page). */
  href?: string;
  variant?: Variant;
  className?: string;
  /** @deprecated Unused — kept for call-site compatibility. */
  compact?: boolean;
};

const LABEL = 'Buy me a coffee?';

const accentFill: CSSProperties = {
  color: '#fff',
  background: 'var(--ndl-accent)',
  border: '1px solid var(--ndl-accent)',
  borderRadius: 12,
  boxShadow: '0 8px 24px color-mix(in srgb, var(--ndl-accent) 28%, transparent)',
};

function InlineButton({
  href,
  className,
}: {
  href: string;
  className: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 text-sm font-semibold tracking-tight px-5 py-2.5 no-underline transition-all duration-200 ease-in-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ndl-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ndl-bg)] ${className}`}
      style={accentFill}
    >
      <span className="text-2xl leading-none" aria-hidden="true">
        ☕
      </span>
      <span>{LABEL}</span>
    </a>
  );
}

function InlineLink({
  href,
  className,
}: {
  href: string;
  className: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`ndl-footer-link inline-flex items-center gap-2 text-sm transition-all duration-200 ease-in-out no-underline ${className}`}
    >
      <span className="text-2xl leading-none" aria-hidden="true">
        ☕
      </span>
      <span>{LABEL}</span>
    </a>
  );
}

function InlineCard({
  href,
  className,
}: {
  href: string;
  className: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-4 p-4 no-underline transition-all duration-200 ease-in-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ndl-accent)] ${className}`}
      style={{
        background: 'var(--ndl-card-bg)',
        border: '1px solid var(--ndl-border)',
        borderRadius: 12,
      }}
    >
      <div
        className="w-14 h-14 flex items-center justify-center shrink-0 text-3xl leading-none"
        style={{
          background: 'color-mix(in srgb, var(--ndl-accent) 12%, transparent)',
          border: '1px solid color-mix(in srgb, var(--ndl-accent) 28%, transparent)',
          borderRadius: 12,
        }}
        aria-hidden="true"
      >
        ☕
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium tracking-tight" style={{ color: 'var(--ndl-text)' }}>
          {LABEL}
        </p>
        <p className="text-xs font-light mt-0.5" style={{ color: 'var(--ndl-faint)' }}>
          Support free tools — optional, one-time tip
        </p>
      </div>
      <svg
        className="w-4 h-4 ml-auto shrink-0"
        style={{ color: 'var(--ndl-faint)' }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </a>
  );
}

function FloatingTipJar({
  href,
  className,
}: {
  href: string;
  className: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Buy me a coffee?"
      className={`fixed z-50 inline-flex items-center justify-center gap-2.5 no-underline transition-all duration-200 ease-in-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ndl-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ndl-bg)]
        right-4 sm:right-6
        px-3.5 py-2.5 sm:px-4 sm:py-2.5
        text-xs sm:text-sm font-semibold tracking-tight
        ${className}`}
      style={{
        ...accentFill,
        bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <span className="text-2xl sm:text-3xl leading-none" aria-hidden="true">
        ☕
      </span>
      <span>{LABEL}</span>
    </a>
  );
}

/**
 * Lightweight support CTA (external Ko-fi link only — no third-party widgets).
 * Floating variant is persistent (non-dismissible) and theme-token aligned.
 */
export default function KofiTipLink({
  href = KOFI_URL,
  variant = 'button',
  className = '',
}: KofiTipLinkProps) {
  if (variant === 'floating') {
    return <FloatingTipJar href={href} className={className} />;
  }
  if (variant === 'link') {
    return <InlineLink href={href} className={className} />;
  }
  if (variant === 'card') {
    return <InlineCard href={href} className={className} />;
  }
  return <InlineButton href={href} className={className} />;
}
