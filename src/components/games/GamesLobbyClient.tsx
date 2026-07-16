'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { BRAIN_GAMES, FUN_GAMES, GAMES as CATALOG_GAMES } from '@/data/catalog';
import { isGameKey, type GameKey } from '@/lib/game-scores';
import UsernameGate from './UsernameGate';
import GameHelpModal from './GameHelpModal';

type LobbyMeta = {
  id: GameKey;
  tag: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  symbol: string;
};

const LOBBY_META: Record<string, LobbyMeta> = {
  '/games/2048/': {
    id: '2048',
    tag: 'Fun · Strategy',
    accent: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.1)',
    accentBorder: 'rgba(245,158,11,0.25)',
    symbol: '◼',
  },
  '/games/snake/': {
    id: 'snake',
    tag: 'Fun · Arcade',
    accent: '#16a34a',
    accentBg: 'rgba(22,163,74,0.1)',
    accentBorder: 'rgba(22,163,74,0.25)',
    symbol: '⟶',
  },
  '/games/blackjack/': {
    id: 'blackjack',
    tag: 'Fun · Cards',
    accent: '#6366f1',
    accentBg: 'rgba(99,102,241,0.1)',
    accentBorder: 'rgba(99,102,241,0.25)',
    symbol: '♠',
  },
  '/games/sudoku/': {
    id: 'sudoku',
    tag: 'Brain · Logic',
    accent: '#4f46e5',
    accentBg: 'rgba(79,70,229,0.1)',
    accentBorder: 'rgba(79,70,229,0.25)',
    symbol: '9',
  },
  '/games/gridlock/': {
    id: 'gridlock',
    tag: 'Brain · Memory',
    accent: '#0ea5e9',
    accentBg: 'rgba(14,165,233,0.1)',
    accentBorder: 'rgba(14,165,233,0.25)',
    symbol: '▣',
  },
  '/games/sumoku/': {
    id: 'sumoku',
    tag: 'Brain · Math',
    accent: '#14b8a6',
    accentBg: 'rgba(20,184,166,0.1)',
    accentBorder: 'rgba(20,184,166,0.25)',
    symbol: '∑',
  },
  '/games/cryptic-paths/': {
    id: 'cryptic-paths',
    tag: 'Brain · Graph',
    accent: '#a855f7',
    accentBg: 'rgba(168,85,247,0.1)',
    accentBorder: 'rgba(168,85,247,0.25)',
    symbol: '◎',
  },
  '/games/semantic-shift/': {
    id: 'semantic-shift',
    tag: 'Brain · Stroop',
    accent: '#ef4444',
    accentBg: 'rgba(239,68,68,0.1)',
    accentBorder: 'rgba(239,68,68,0.25)',
    symbol: 'Aa',
  },
};

const ALL = CATALOG_GAMES.map((g) => {
  const meta = LOBBY_META[g.href];
  if (!meta) throw new Error(`Missing lobby meta for ${g.href}`);
  return { ...g, ...meta };
});

function HelpContent(id: GameKey) {
  switch (id) {
    case '2048':
      return <p>Slide tiles with arrows or swipe. Merge matches to reach <strong style={{ color: '#16a34a' }}>2048</strong>.</p>;
    case 'snake':
      return <p>Eat food, level up for speed, wrap through walls. Hitting your tail ends the run.</p>;
    case 'blackjack':
      return <p>Beat the dealer to 21 without busting. Hit, stand, or double down.</p>;
    case 'sudoku':
      return <p>Fill 1–9 uniquely in every row, column, and box. Higher tiers add timers and fewer clues.</p>;
    case 'gridlock':
      return <p>Memorize the flash, then recreate the pattern. Three wrong clicks = game over.</p>;
    case 'sumoku':
      return <p>Select adjacent tiles that sum to the target. Cleared cells refill from above.</p>;
    case 'cryptic-paths':
      return <p>Visit every edge exactly once. Start on a node, then walk unused connections.</p>;
    case 'semantic-shift':
      return <p>Follow MATCH WORD or MATCH COLOR before the timer ends. One miss ends the streak.</p>;
    default:
      return null;
  }
}

function Section({
  title,
  subtitle,
  games,
  scores,
  onHelp,
}: {
  title: string;
  subtitle: string;
  games: typeof ALL;
  scores: Record<string, number>;
  onHelp: (id: GameKey) => void;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4">
        <p className="text-[0.6rem] font-bold tracking-[0.15em] uppercase m-0" style={{ color: '#6366f1' }}>
          {title}
        </p>
        <p className="text-sm mt-1 m-0 break-words" style={{ color: 'var(--ndl-faint)' }}>
          {subtitle}
        </p>
      </div>
      <div
        className="grid gap-px"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          background: 'var(--ndl-border)',
        }}
      >
        {games.map((g) => {
          const hs = scores[g.id] ?? 0;
          return (
            <Link
              key={g.id}
              href={g.href}
              className="flex flex-col p-6 no-underline transition-colors overflow-hidden"
              style={{ background: 'var(--ndl-surface)' }}
            >
              <div
                className="inline-flex items-center justify-center w-10 h-10 mb-4 text-base font-bold"
                style={{ background: g.accentBg, border: `1px solid ${g.accentBorder}`, color: g.accent, borderRadius: 0 }}
              >
                {g.symbol}
              </div>
              <p className="text-[0.6rem] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: g.accent }}>
                {g.tag}
              </p>
              <h2 className="text-lg font-bold mb-2 break-words" style={{ color: 'var(--ndl-text)' }}>
                {g.title}
              </h2>
              <p className="text-sm leading-relaxed flex-grow mb-4 break-words" style={{ color: 'var(--ndl-faint)' }}>
                {g.desc}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onHelp(g.id);
                }}
                className="self-start text-xs font-semibold mb-4 cursor-pointer bg-transparent border-0 p-0"
                style={{ color: 'var(--ndl-faint)' }}
              >
                How to Play
              </button>
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[0.6875rem] font-bold tracking-wide uppercase px-2 py-1"
                  style={{
                    background: hs > 0 ? 'rgba(22,163,74,0.1)' : 'var(--ndl-surface-2)',
                    border: hs > 0 ? '1px solid rgba(22,163,74,0.3)' : '1px solid var(--ndl-border)',
                    color: hs > 0 ? '#16a34a' : 'var(--ndl-faint)',
                    borderRadius: 0,
                  }}
                >
                  Best: {hs > 0 ? hs.toLocaleString('en-US') : '—'}
                </span>
                <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--ndl-text)' }}>
                  Play →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function GamesLobbyClient() {
  const { username, setUsername, clearUsername, getHighScore, loaded } = useGameState();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [helpGame, setHelpGame] = useState<GameKey | null>(null);

  useEffect(() => {
    if (!loaded) return;
    const s: Record<string, number> = {};
    ALL.forEach((g) => {
      if (isGameKey(g.id)) s[g.id] = getHighScore(g.id);
    });
    setScores(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  if (!loaded) return null;
  if (!username) return <UsernameGate onSubmit={setUsername} />;

  const fun = ALL.filter((g) => g.category === 'fun');
  const brain = ALL.filter((g) => g.category === 'brain');

  return (
    <div style={{ background: 'var(--ndl-bg)', minHeight: '100vh' }}>
      <GameHelpModal
        isOpen={helpGame !== null}
        onClose={() => setHelpGame(null)}
        title={helpGame ? ALL.find((g) => g.id === helpGame)?.title ?? '' : ''}
      >
        {helpGame ? (
          <div style={{ color: 'var(--ndl-muted)' }}>
            {HelpContent(helpGame)}
            <p style={{ marginTop: '1rem' }}>
              High scores save locally. Sign in to sync across devices.
            </p>
          </div>
        ) : null}
      </GameHelpModal>

      <div style={{ borderBottom: '1px solid var(--ndl-border)', padding: '2rem 0' }}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[0.6rem] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: '#16a34a' }}>
              NexusDigitalLabs
            </p>
            <h1 className="text-3xl font-extrabold m-0 tracking-tight" style={{ color: 'var(--ndl-text)' }}>
              Games
            </h1>
            <p className="text-sm mt-1.5 m-0 break-words" style={{ color: 'var(--ndl-faint)' }}>
              {FUN_GAMES.length} fun · {BRAIN_GAMES.length} brain teasers · client-side · local scores
            </p>
          </div>
          <button
            onClick={() => clearUsername()}
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer"
            style={{
              background: 'var(--ndl-surface-2)',
              border: '1px solid var(--ndl-border)',
              color: 'var(--ndl-muted)',
              borderRadius: 0,
            }}
          >
            {username}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <Section
          title="Fun games"
          subtitle="Arcade and classic pastimes — light cognitive load, quick sessions."
          games={fun}
          scores={scores}
          onHelp={setHelpGame}
        />
        <Section
          title="Brain games"
          subtitle="Logic, memory, math, and attention challenges with difficulty tiers."
          games={brain}
          scores={scores}
          onHelp={setHelpGame}
        />

        <div style={{ background: 'var(--ndl-surface)', border: '1px solid var(--ndl-border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--ndl-border-soft)' }}>
            <p className="text-[0.6rem] font-bold tracking-[0.15em] uppercase m-0" style={{ color: 'var(--ndl-faint)' }}>
              Your high scores
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ background: 'var(--ndl-border-soft)' }}>
            {ALL.map((g) => {
              const hs = scores[g.id] ?? 0;
              return (
                <div key={g.id} className="p-4 text-center" style={{ background: 'var(--ndl-surface)' }}>
                  <p className="text-[0.6rem] font-bold tracking-[0.12em] uppercase mb-2 break-words" style={{ color: 'var(--ndl-faint)' }}>
                    {g.title}
                  </p>
                  <p className="text-xl font-extrabold m-0 tabular-nums" style={{ color: hs > 0 ? '#16a34a' : 'var(--ndl-text)' }}>
                    {hs > 0 ? hs.toLocaleString('en-US') : '0'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-center mt-6" style={{ color: 'var(--ndl-faint)' }}>
          All {CATALOG_GAMES.length} games run in your browser. No gameplay data is uploaded unless you opt into account sync.
        </p>
      </div>
    </div>
  );
}
