'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';

export type GamePhase = 'idle' | 'playing' | 'paused' | 'gameover';

export type DiffOption<T extends string> = {
  id: T;
  label: string;
  hint: string;
};

type BrainShellProps<T extends string> = {
  title: string;
  blurb: string;
  best: number;
  score: number;
  phase: GamePhase;
  difficulty: T;
  options: DiffOption<T>[];
  onDifficulty: (id: T) => void;
  onHelp: () => void;
  onPause?: () => void;
  onResume?: () => void;
  timerLabel?: string;
  children: ReactNode;
};

/** Shared chrome for brain games — sharp edges, high contrast. */
export function BrainShell<T extends string>({
  title,
  blurb,
  best,
  score,
  phase,
  difficulty,
  options,
  onDifficulty,
  onHelp,
  onPause,
  onResume,
  timerLabel,
  children,
}: BrainShellProps<T>) {
  return (
    <>
      <div style={{ borderBottom: '1px solid var(--ndl-border)', background: 'var(--ndl-bg)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href="/games/"
                className="no-underline text-[0.6875rem] font-bold tracking-[0.1em] uppercase"
                style={{ color: '#6366f1' }}
              >
                ← Games
              </Link>
              <h1 className="text-xl sm:text-2xl font-extrabold mt-1 break-words" style={{ color: 'var(--ndl-text)' }}>
                {title}
              </h1>
              <p className="text-sm mt-1 max-w-md break-words" style={{ color: 'var(--ndl-faint)' }}>
                {blurb}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                type="button"
                onClick={onHelp}
                className="h-9 px-3 text-[0.625rem] font-bold tracking-[0.07em] uppercase cursor-pointer"
                style={{
                  background: 'var(--ndl-surface-2)',
                  border: '1px solid var(--ndl-border)',
                  color: 'var(--ndl-muted)',
                  borderRadius: 0,
                }}
              >
                How to Play
              </button>
              {[
                { label: 'Score', val: score },
                { label: 'Best', val: best },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center min-w-[68px] px-3 py-2"
                  style={{
                    border: '1px solid var(--ndl-border)',
                    background: 'var(--ndl-surface-2)',
                    borderRadius: 0,
                  }}
                >
                  <div className="text-[0.5625rem] font-bold tracking-[0.1em] uppercase" style={{ color: 'var(--ndl-faint)' }}>
                    {s.label}
                  </div>
                  <div className="text-lg font-extrabold tabular-nums" style={{ color: 'var(--ndl-text)' }}>
                    {s.val.toLocaleString('en-US')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-[0.6rem] font-bold tracking-[0.12em] uppercase" style={{ color: 'var(--ndl-faint)' }}>
              Difficulty
            </span>
            {options.map((o) => {
              const active = o.id === difficulty;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onDifficulty(o.id)}
                  title={o.hint}
                  className="px-3 py-1.5 text-[0.625rem] font-bold tracking-[0.08em] uppercase cursor-pointer transition-colors"
                  style={{
                    borderRadius: 0,
                    border: active ? '1px solid #4f46e5' : '1px solid var(--ndl-border)',
                    background: active ? 'rgba(79,70,229,0.12)' : 'var(--ndl-surface-2)',
                    color: active ? '#4f46e5' : 'var(--ndl-muted)',
                  }}
                >
                  {o.label}
                </button>
              );
            })}
            {timerLabel && (
              <span
                className="ml-auto text-sm font-bold tabular-nums px-3 py-1.5"
                style={{
                  border: '1px solid var(--ndl-border)',
                  background: 'var(--ndl-surface-2)',
                  color: 'var(--ndl-text)',
                  borderRadius: 0,
                }}
              >
                {timerLabel}
              </span>
            )}
            {phase === 'playing' && onPause && (
              <button
                type="button"
                onClick={onPause}
                className="px-3 py-1.5 text-[0.625rem] font-bold tracking-[0.08em] uppercase cursor-pointer"
                style={{ border: '1px solid var(--ndl-border)', background: 'var(--ndl-surface-2)', color: 'var(--ndl-muted)', borderRadius: 0 }}
              >
                Pause
              </button>
            )}
            {phase === 'paused' && onResume && (
              <button
                type="button"
                onClick={onResume}
                className="px-3 py-1.5 text-[0.625rem] font-bold tracking-[0.08em] uppercase cursor-pointer"
                style={{ border: '1px solid #4f46e5', background: 'rgba(79,70,229,0.12)', color: '#4f46e5', borderRadius: 0 }}
              >
                Resume
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--ndl-bg)', minHeight: 'calc(100vh - 64px - 90px)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 overflow-hidden">{children}</div>
      </div>
    </>
  );
}

export function BrainPrimaryBtn({
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
      className="px-6 py-2.5 text-xs font-bold tracking-[0.07em] uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        borderRadius: 0,
        background: 'var(--ndl-text)',
        color: 'var(--ndl-bg)',
        border: 'none',
      }}
    >
      {children}
    </button>
  );
}

export function BrainSecondaryBtn({
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
      className="px-5 py-2 text-[0.6875rem] font-bold tracking-[0.07em] uppercase cursor-pointer disabled:opacity-40"
      style={{
        borderRadius: 0,
        border: '1px solid var(--ndl-border)',
        background: 'var(--ndl-surface-2)',
        color: 'var(--ndl-muted)',
      }}
    >
      {children}
    </button>
  );
}

export function BrainOverlay({
  title,
  sub,
  titleColor,
  children,
}: {
  title: string;
  sub: string;
  titleColor?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'color-mix(in srgb, var(--ndl-bg) 92%, transparent)' }}
    >
      <p className="text-xl font-extrabold mb-1.5 break-words" style={{ color: titleColor || 'var(--ndl-text)' }}>
        {title}
      </p>
      <p className="text-sm mb-5 max-w-xs break-words" style={{ color: 'var(--ndl-faint)' }}>
        {sub}
      </p>
      {children}
    </div>
  );
}

export function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}
