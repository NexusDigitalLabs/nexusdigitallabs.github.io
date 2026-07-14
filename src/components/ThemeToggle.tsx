'use client';

import { useTheme } from '@/components/ThemeProvider';
import type { ThemePreference } from '@/lib/theme';

const OPTIONS: Array<{ value: ThemePreference; label: string; icon: React.ReactNode }> = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'System',
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

interface ThemeToggleProps {
  /** Show text labels under icons (mobile drawer) */
  showLabels?: boolean;
  className?: string;
}

export default function ThemeToggle({ showLabels = false, className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={`inline-flex items-stretch ${className}`}
      style={{
        border: '1px solid var(--ndl-border)',
        background: 'var(--ndl-surface-2)',
        borderRadius: 8,
        padding: 2,
        gap: 2,
      }}
    >
      {OPTIONS.map(({ value, label, icon }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={`flex items-center justify-center transition-colors cursor-pointer border-none ${
              showLabels ? 'flex-col gap-0.5 px-3 py-1.5 min-w-[4.25rem]' : 'w-8 h-8'
            }`}
            style={{
              borderRadius: 6,
              background: selected ? 'var(--ndl-accent)' : 'transparent',
              color: selected ? '#ffffff' : 'var(--ndl-muted)',
            }}
          >
            {icon}
            {showLabels && (
              <span className="text-[10px] font-medium leading-none">{label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
