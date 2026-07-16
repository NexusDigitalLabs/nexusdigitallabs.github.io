'use client';

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

export const GAME_ACCENT = '#4ade80';

export type GameStatItem = {
  label: string;
  value: string | number;
  highlight?: boolean;
};

type GameHeaderProps = {
  title: string;
  stats: GameStatItem[];
  onHelp: () => void;
};

export function GameHeader({ title, stats, onHelp }: GameHeaderProps) {
  return (
    <div
      className="border-b"
      style={{ borderColor: 'var(--ndl-border)', background: 'var(--ndl-bg)' }}
    >
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href="/games/"
              className="no-underline inline-flex items-center gap-1 text-[0.6875rem] font-bold tracking-[0.1em] uppercase transition-opacity hover:opacity-80"
              style={{ color: GAME_ACCENT }}
            >
              ← Games
            </Link>
            <h1
              className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1"
              style={{ color: 'var(--ndl-text)' }}
            >
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-end">
            <GameHelpButton onClick={onHelp} />
            {stats.map((stat) => (
              <GameStat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GameHelpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl cursor-pointer transition-colors hover:opacity-90"
      style={{
        background: 'var(--ndl-surface-2)',
        border: '1px solid var(--ndl-border)',
        fontSize: '0.625rem',
        fontWeight: 700,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: 'var(--ndl-muted)',
        whiteSpace: 'nowrap',
      }}
    >
      <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01" />
      </svg>
      <span className="hidden xs:inline sm:inline">How to Play</span>
      <span className="inline sm:hidden">Help</span>
    </button>
  );
}

export function GameStat({ label, value, highlight }: GameStatItem) {
  return (
    <div
      className="rounded-xl text-center min-w-[68px] sm:min-w-[76px] px-3 py-2"
      style={{
        border: `1px solid ${highlight ? 'rgba(74,222,128,0.35)' : 'var(--ndl-border)'}`,
        background: highlight ? 'rgba(74,222,128,0.08)' : 'var(--ndl-surface-2)',
      }}
    >
      <div
        className="text-[0.5625rem] font-bold tracking-[0.1em] uppercase"
        style={{ color: 'var(--ndl-faint)' }}
      >
        {label}
      </div>
      <div
        className="text-base sm:text-lg font-extrabold leading-tight tabular-nums"
        style={{ color: highlight ? GAME_ACCENT : 'var(--ndl-text)' }}
      >
        {value}
      </div>
    </div>
  );
}

export function GamePageBody({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: 'var(--ndl-bg)', minHeight: 'calc(100vh - 64px - 80px)' }}>
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
    </div>
  );
}

export function GameBoardFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        border: '1px solid var(--ndl-border)',
        background: 'var(--ndl-surface)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {children}
    </div>
  );
}

type GameOverlayProps = {
  title: string;
  sub: string;
  titleColor?: string;
  btnText?: string;
  onAction: () => void;
};

export function GameOverlay({ title, sub, titleColor, btnText = 'Start Game', onAction }: GameOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center rounded-2xl"
      style={{ background: 'color-mix(in srgb, var(--ndl-bg) 90%, transparent)' }}
    >
      <p className="text-xl sm:text-2xl font-extrabold mb-1.5" style={{ color: titleColor || 'var(--ndl-text)' }}>
        {title}
      </p>
      <p className="text-sm mb-6 max-w-[240px]" style={{ color: 'var(--ndl-faint)' }}>
        {sub}
      </p>
      <GamePrimaryButton onClick={onAction}>{btnText}</GamePrimaryButton>
    </div>
  );
}

export function GamePrimaryButton({
  children,
  onClick,
  disabled,
  fullWidth,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-6 py-2.5 text-xs font-bold tracking-[0.07em] uppercase cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${fullWidth ? 'w-full' : ''}`}
      style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
        color: '#fff',
        border: 'none',
        boxShadow: disabled ? 'none' : '0 8px 24px rgba(37,99,235,0.28)',
      }}
    >
      {children}
    </button>
  );
}

export function GameSecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl px-5 py-2 text-[0.6875rem] font-bold tracking-[0.07em] uppercase cursor-pointer transition-colors hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        border: '1px solid var(--ndl-border)',
        background: 'var(--ndl-surface-2)',
        color: 'var(--ndl-muted)',
      }}
    >
      {children}
    </button>
  );
}

export function GameTip({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-light" style={{ color: 'var(--ndl-faint)' }}>
      {children}
    </p>
  );
}

export function GameControlsRow({ items }: { items: { key: string; label: string }[] }) {
  return (
    <div className="text-center mt-6">
      <p
        className="text-[0.6rem] font-bold tracking-[0.15em] uppercase mb-3"
        style={{ color: 'var(--ndl-faint)' }}
      >
        Controls
      </p>
      <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
        {items.map(({ key, label }) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <span
              className="text-[0.6875rem] font-semibold px-2.5 py-1 rounded-lg tabular-nums"
              style={{
                color: 'var(--ndl-muted)',
                border: '1px solid var(--ndl-border)',
                background: 'var(--ndl-surface-2)',
              }}
            >
              {key}
            </span>
            <span className="text-[0.6875rem]" style={{ color: 'var(--ndl-faint)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GamePanel({
  children,
  title,
  trailing,
  style,
}: {
  children: ReactNode;
  title?: string;
  trailing?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className="rounded-2xl p-4 sm:p-5"
      style={{
        background: 'var(--ndl-surface)',
        border: '1px solid var(--ndl-border)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        ...style,
      }}
    >
      {(title || trailing) && (
        <div className="flex items-center justify-between mb-3">
          {title && (
            <span
              className="text-[0.6rem] font-bold tracking-[0.15em] uppercase"
              style={{ color: 'var(--ndl-faint)' }}
            >
              {title}
            </span>
          )}
          {trailing}
        </div>
      )}
      {children}
    </div>
  );
}

export function GameChipButton({
  value,
  onClick,
  active,
}: {
  value: number;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-11 h-11 rounded-full text-xs font-extrabold cursor-pointer transition-all hover:scale-105"
      style={{
        border: active ? '2px solid #2563eb' : '2px dashed var(--ndl-border)',
        background: active ? 'rgba(37,99,235,0.12)' : 'var(--ndl-surface-2)',
        color: active ? '#2563eb' : 'var(--ndl-muted)',
      }}
    >
      {value}
    </button>
  );
}
