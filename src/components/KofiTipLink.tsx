import { KOFI_URL } from '@/lib/seo';

type Variant = 'button' | 'link' | 'card';

type Props = {
  variant?: Variant;
  className?: string;
  /** Shorter label for tight layouts */
  compact?: boolean;
};

function CupIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.5 3H5a1 1 0 00-1 1v7.5A4.5 4.5 0 008.5 16H11v1.5A2.5 2.5 0 0013.5 20h1A2.5 2.5 0 0017 17.5V16h.5A4.5 4.5 0 0022 11.5V8a1 1 0 00-1-1h-2.5V4a1 1 0 00-1-1zm1.5 8.5a2.5 2.5 0 01-2.5 2.5H17v-5h3v2.5zM7 5h10v9H8.5A2.5 2.5 0 016 11.5V5z" />
    </svg>
  );
}

/**
 * Lightweight Ko-fi tip link (no widget script — keeps Lighthouse clean).
 */
export default function KofiTipLink({ variant = 'button', className = '', compact = false }: Props) {
  const label = compact ? 'Tip on Ko-fi' : 'Support on Ko-fi';

  if (variant === 'link') {
    return (
      <a
        href={KOFI_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`ndl-footer-link inline-flex items-center gap-1.5 text-sm transition-colors no-underline ${className}`}
      >
        <CupIcon className="w-3.5 h-3.5" />
        {label}
      </a>
    );
  }

  if (variant === 'card') {
    return (
      <a
        href={KOFI_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-4 p-4 rounded-xl no-underline transition-all duration-250 hover:-translate-y-0.5 ${className}`}
        style={{ background: 'var(--ndl-card-bg)', border: '1px solid var(--ndl-border)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,94,91,0.12)', border: '1px solid rgba(255,94,91,0.28)', color: '#FF5E5B' }}
        >
          <CupIcon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--ndl-text)' }}>
            Tip on Ko-fi
          </p>
          <p className="text-xs" style={{ color: 'var(--ndl-faint)' }}>
            Support free tools — optional, one-time tip
          </p>
        </div>
        <svg className="w-4 h-4 ml-auto shrink-0" style={{ color: 'var(--ndl-faint)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
    );
  }

  return (
    <a
      href={KOFI_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl no-underline transition-all duration-200 hover:-translate-y-0.5 ${className}`}
      style={{
        color: '#fff',
        background: '#FF5E5B',
        boxShadow: '0 4px 16px rgba(255,94,91,0.28)',
      }}
    >
      <CupIcon />
      {label}
    </a>
  );
}
