'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import UsernameGate from './UsernameGate';

const GAMES = [
  {
    id: '2048',
    href: '/games/2048/',
    tag: 'Strategy',
    title: '2048',
    desc: 'Slide tiles on a 4×4 grid to merge matching numbers. Reach the 2048 tile to win.',
    accent: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.1)',
    accentBorder: 'rgba(245,158,11,0.25)',
    symbol: '◼◼\n◼◼',
    label: '4×4',
  },
  {
    id: 'snake',
    href: '/games/snake/',
    tag: 'Arcade',
    title: 'Snake',
    desc: 'Navigate the snake to eat food and grow. Avoid walls and your own tail.',
    accent: '#4ade80',
    accentBg: 'rgba(74,222,128,0.08)',
    accentBorder: 'rgba(74,222,128,0.25)',
    symbol: '⟶',
    label: 'Canvas',
  },
  {
    id: 'blackjack',
    href: '/games/blackjack/',
    tag: 'Card Game',
    title: 'Blackjack',
    desc: 'Beat the dealer to 21 without going bust. Dealer draws to 17. Classic casino rules.',
    accent: '#818cf8',
    accentBg: 'rgba(129,140,248,0.08)',
    accentBorder: 'rgba(129,140,248,0.25)',
    symbol: '♠ ♥',
    label: '52 cards',
  },
];

export default function GamesLobbyClient() {
  const { username, setUsername, clearUsername, getHighScore, loaded } = useGameState();
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (loaded) {
      const s: Record<string, number> = {};
      GAMES.forEach((g) => { s[g.id] = getHighScore(g.id); });
      setScores(s);
    }
  }, [loaded, getHighScore]);

  if (!loaded) return null;

  if (!username) {
    return <UsernameGate onSubmit={setUsername} />;
  }

  return (
    <div style={{ background: '#0b0f19', minHeight: '100vh' }}>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '2rem 0' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4ade80', marginBottom: '0.5rem' }}>
              NexusDigitalLabs
            </p>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>Games</h1>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.375rem', fontWeight: 400 }}>
              Browser-based · Scores saved locally · No login needed
            </p>
          </div>
          <button
            onClick={() => clearUsername()}
            type="button"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.375rem 0.875rem', cursor: 'pointer',
              fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500,
            }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {username}
          </button>
        </div>
      </div>

      {/* ── Game cards ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.07)' }}>
          {GAMES.map((g) => {
            const hs = scores[g.id] ?? 0;
            return (
              <Link
                key={g.id}
                href={g.href}
                style={{
                  display: 'flex', flexDirection: 'column',
                  padding: '1.75rem',
                  background: '#0d1117',
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#111827')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0d1117')}
              >
                {/* Icon badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '2.5rem', height: '2.5rem', marginBottom: '1.25rem',
                  background: g.accentBg, border: `1px solid ${g.accentBorder}`,
                  fontSize: '1rem', color: g.accent, fontWeight: 700,
                  letterSpacing: '0.05em',
                }}>
                  {g.symbol}
                </div>

                {/* Tag */}
                <p style={{
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em',
                  textTransform: 'uppercase', color: g.accent, marginBottom: '0.5rem',
                }}>
                  {g.tag}
                </p>

                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.625rem' }}>
                  {g.title}
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.65, flexGrow: 1, marginBottom: '1.5rem' }}>
                  {g.desc}
                </p>

                {/* Footer row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', padding: '0.25rem 0.625rem',
                    background: hs > 0 ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
                    border: hs > 0 ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    color: hs > 0 ? '#4ade80' : '#475569',
                  }}>
                    Best: {hs > 0 ? hs.toLocaleString('en-US') : '—'}
                  </span>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: '#f8fafc',
                  }}>
                    Play
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── High scores ─────────────────────────────────────────────────── */}
        <div style={{ marginTop: '1px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderTop: 'none' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#475569', margin: 0 }}>
              Your High Scores
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {GAMES.map((g, i) => {
              const hs = scores[g.id] ?? 0;
              return (
                <div
                  key={g.id}
                  style={{
                    padding: '1.25rem',
                    textAlign: 'center',
                    borderRight: i < GAMES.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569', marginBottom: '0.5rem' }}>
                    {g.title}
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: hs > 0 ? '#4ade80' : '#f8fafc', margin: 0 }}>
                    {hs > 0 ? hs.toLocaleString('en-US') : '0'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: '#334155', textAlign: 'center', marginTop: '1.5rem' }}>
          All scores are stored in your browser&apos;s local storage — never sent anywhere.
        </p>
      </div>
    </div>
  );
}
