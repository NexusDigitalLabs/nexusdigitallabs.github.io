'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import UsernameGate from './UsernameGate';
import GameHelpModal from './GameHelpModal';

type GameId = '2048' | 'snake' | 'blackjack';

const GAMES: {
  id: GameId; href: string; tag: string; title: string; desc: string;
  accent: string; accentBg: string; accentBorder: string; symbol: string; label: string;
}[] = [
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
    accent: '#16a34a',
    accentBg: 'rgba(22,163,74,0.1)',
    accentBorder: 'rgba(22,163,74,0.25)',
    symbol: '⟶',
    label: 'Canvas',
  },
  {
    id: 'blackjack',
    href: '/games/blackjack/',
    tag: 'Card Game',
    title: 'Blackjack',
    desc: 'Beat the dealer to 21 without going bust. Dealer draws to 17. Classic casino rules.',
    accent: '#6366f1',
    accentBg: 'rgba(99,102,241,0.1)',
    accentBorder: 'rgba(99,102,241,0.25)',
    symbol: '♠ ♥',
    label: '52 cards',
  },
];

const strong: React.CSSProperties = { color: 'var(--ndl-text)' };

function HelpContent2048() {
  return (
    <>
      <p style={{ marginBottom: '1rem' }}>Slide tiles using <strong style={strong}>arrow keys</strong> or swipe. Matching tiles merge — reach <strong style={{ color: '#16a34a' }}>2048</strong> to win.</p>
      <p style={{ fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.4rem' }}>Controls</p>
      <ul style={{ paddingLeft: '1.25rem', margin: '0 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <li><strong style={strong}>Arrow keys / W A S D</strong> — move tiles</li>
        <li><strong style={strong}>Swipe</strong> — on touch screens</li>
      </ul>
      <p style={{ fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.4rem' }}>Tips</p>
      <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <li>Lock your highest tile in a corner</li>
        <li>Build a descending chain along one edge</li>
        <li>Never fill the board — plan two moves ahead</li>
      </ul>
    </>
  );
}

function HelpContentSnake() {
  return (
    <>
      <p style={{ marginBottom: '1rem' }}>Guide the snake to eat food and grow. Hit a <strong style={strong}>wall</strong> or your own <strong style={strong}>tail</strong> and it&apos;s game over. Speed increases as you grow.</p>
      <p style={{ fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.4rem' }}>Controls</p>
      <ul style={{ paddingLeft: '1.25rem', margin: '0 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <li><strong style={strong}>Arrow keys / W A S D</strong> — change direction</li>
        <li><strong style={strong}>D-pad</strong> — on touch screens</li>
        <li><strong style={strong}>Swipe on canvas</strong> — also works on touch</li>
      </ul>
      <p style={{ fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.4rem' }}>Rules</p>
      <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <li>No instant 180° reversal</li>
        <li>Hitting a wall ends the game</li>
        <li>Each food = <strong style={{ color: '#16a34a' }}>+1 point</strong> + growth</li>
      </ul>
    </>
  );
}

function HelpContentBlackjack() {
  return (
    <>
      <p style={{ marginBottom: '1rem' }}>Get closer to <strong style={strong}>21</strong> than the dealer without going over. You start with <strong style={strong}>500 chips</strong>.</p>
      <p style={{ fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.4rem' }}>Card Values</p>
      <ul style={{ paddingLeft: '1.25rem', margin: '0 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <li>2–10 = face value · J/Q/K = 10 · Ace = 11 (or 1)</li>
      </ul>
      <p style={{ fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.4rem' }}>Actions</p>
      <ul style={{ paddingLeft: '1.25rem', margin: '0 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <li><strong style={strong}>Hit</strong> — draw a card</li>
        <li><strong style={strong}>Stand</strong> — end your turn</li>
        <li><strong style={strong}>Double Down</strong> — double bet, one card, stand</li>
      </ul>
      <p style={{ fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.4rem' }}>Payouts</p>
      <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <li><strong style={{ color: '#16a34a' }}>Blackjack</strong> — 1.5× · <strong style={strong}>Win</strong> — 1× · <strong style={{ color: '#dc2626' }}>Bust</strong> — forfeit</li>
      </ul>
    </>
  );
}

const HELP_CONTENT: Record<GameId, React.ReactNode> = {
  '2048': <HelpContent2048 />,
  'snake': <HelpContentSnake />,
  'blackjack': <HelpContentBlackjack />,
};

export default function GamesLobbyClient() {
  const { username, setUsername, clearUsername, getHighScore, loaded } = useGameState();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [helpGame, setHelpGame] = useState<GameId | null>(null);

  useEffect(() => {
    if (!loaded) return;
    const s: Record<string, number> = {};
    GAMES.forEach((g) => { s[g.id] = getHighScore(g.id); });
    setScores(s);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  if (!loaded) return null;

  if (!username) {
    return <UsernameGate onSubmit={setUsername} />;
  }

  return (
    <div style={{ background: 'var(--ndl-bg)', minHeight: '100vh' }}>
      <GameHelpModal
        isOpen={helpGame !== null}
        onClose={() => setHelpGame(null)}
        title={helpGame ? GAMES.find(g => g.id === helpGame)!.title : ''}
      >
        {helpGame ? HELP_CONTENT[helpGame] : null}
      </GameHelpModal>

      <div style={{ borderBottom: '1px solid var(--ndl-border)', padding: '2rem 0' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#16a34a', marginBottom: '0.5rem' }}>
              NexusDigitalLabs
            </p>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ndl-text)', margin: 0, letterSpacing: '-0.02em' }}>Games</h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ndl-faint)', marginTop: '0.375rem', fontWeight: 400 }}>
              Browser-based · Scores saved locally · No login needed
            </p>
          </div>
          <button
            onClick={() => clearUsername()}
            type="button"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--ndl-surface-2)', border: '1px solid var(--ndl-border)',
              padding: '0.375rem 0.875rem', cursor: 'pointer',
              fontSize: '0.8125rem', color: 'var(--ndl-muted)', fontWeight: 500,
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

      <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: 'var(--ndl-border)' }}>
          {GAMES.map((g) => {
            const hs = scores[g.id] ?? 0;
            return (
              <Link
                key={g.id}
                href={g.href}
                style={{
                  display: 'flex', flexDirection: 'column',
                  padding: '1.75rem',
                  background: 'var(--ndl-surface)',
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--ndl-surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--ndl-surface)')}
              >
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '2.5rem', height: '2.5rem', marginBottom: '1.25rem',
                  background: g.accentBg, border: `1px solid ${g.accentBorder}`,
                  fontSize: '1rem', color: g.accent, fontWeight: 700,
                  letterSpacing: '0.05em', whiteSpace: 'pre-line', textAlign: 'center', lineHeight: 1.1,
                }}>
                  {g.symbol}
                </div>

                <p style={{
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em',
                  textTransform: 'uppercase', color: g.accent, marginBottom: '0.5rem',
                }}>
                  {g.tag}
                </p>

                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.625rem' }}>
                  {g.title}
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ndl-faint)', lineHeight: 1.65, flexGrow: 1, marginBottom: '1rem' }}>
                  {g.desc}
                </p>

                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setHelpGame(g.id); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    background: 'transparent', border: 'none', padding: 0,
                    fontSize: '0.75rem', fontWeight: 600, color: 'var(--ndl-faint)',
                    cursor: 'pointer', marginBottom: '1.25rem',
                    letterSpacing: '0.03em',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = g.accent)}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--ndl-faint)')}
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01"/>
                  </svg>
                  How to Play
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', padding: '0.25rem 0.625rem',
                    background: hs > 0 ? 'rgba(22,163,74,0.1)' : 'var(--ndl-surface-2)',
                    border: hs > 0 ? '1px solid rgba(22,163,74,0.3)' : '1px solid var(--ndl-border)',
                    color: hs > 0 ? '#16a34a' : 'var(--ndl-faint)',
                  }}>
                    Best: {hs > 0 ? hs.toLocaleString('en-US') : '—'}
                  </span>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'var(--ndl-text)',
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

        <div style={{ marginTop: '1px', background: 'var(--ndl-surface)', border: '1px solid var(--ndl-border)', borderTop: 'none' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--ndl-border-soft)' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ndl-faint)', margin: 0 }}>
              Your High Scores
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {GAMES.map((g, i) => {
              const hs = scores[g.id] ?? 0;
              return (
                <div
                  key={g.id}
                  style={{
                    padding: '1.25rem',
                    textAlign: 'center',
                    borderRight: i < GAMES.length - 1 ? '1px solid var(--ndl-border-soft)' : 'none',
                  }}
                >
                  <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ndl-faint)', marginBottom: '0.5rem' }}>
                    {g.title}
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: hs > 0 ? '#16a34a' : 'var(--ndl-text)', margin: 0 }}>
                    {hs > 0 ? hs.toLocaleString('en-US') : '0'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--ndl-faint)', textAlign: 'center', marginTop: '1.5rem' }}>
          All scores are stored in your browser&apos;s local storage — never sent anywhere.
        </p>
      </div>
    </div>
  );
}
