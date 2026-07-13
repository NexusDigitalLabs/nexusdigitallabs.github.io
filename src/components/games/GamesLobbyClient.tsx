'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import UsernameGate from './UsernameGate';

const GAMES = [
  {
    id: '2048',
    href: '/games/2048/',
    icon: '⊞',
    tag: 'Strategy',
    title: '2048',
    desc: 'Slide tiles on a 4×4 grid to merge matching numbers. Reach the 2048 tile to win.',
  },
  {
    id: 'snake',
    href: '/games/snake/',
    icon: '◈',
    tag: 'Arcade',
    title: 'Snake',
    desc: 'Navigate the snake to eat food and grow. Avoid walls and your own tail. Speed increases.',
  },
  {
    id: 'blackjack',
    href: '/games/blackjack/',
    icon: '♠',
    tag: 'Card Game',
    title: 'Blackjack',
    desc: 'Beat the dealer to 21 without going bust. Dealer draws to 17. Classic casino rules.',
  },
];

const slbl = 'text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-slate-400';

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
    <>
      {/* Page header */}
      <div style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-10 py-7">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className={`${slbl} mb-1.5`}>NexusDigitalLabs</p>
              <h1 className="text-2xl sm:text-[1.625rem] font-semibold text-slate-900 tracking-tight mt-1">Games</h1>
              <p className="text-sm text-slate-400 font-light mt-1.5">
                Browser-based mini-games · Scores saved locally · No login needed
              </p>
            </div>
            <button
              onClick={() => { clearUsername(); }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '0.3rem 0.75rem', alignSelf: 'flex-start', marginTop: '6px' }}
              type="button"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {username}
            </button>
          </div>
        </div>
      </div>

      {/* Game cards */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GAMES.map((g) => {
            const hs = scores[g.id] ?? 0;
            return (
              <Link
                key={g.id}
                href={g.href}
                className="flex flex-col p-7 no-underline transition-all duration-200 hover:-translate-y-[3px]"
                style={{ background: '#fff', border: '1px solid #e2e8f0', textDecoration: 'none' }}
              >
                <div
                  className="flex items-center justify-center mb-5 text-xl"
                  style={{ width: '2.75rem', height: '2.75rem', border: '1px solid #e2e8f0' }}
                >
                  {g.icon}
                </div>
                <p className={`${slbl} mb-2`}>{g.tag}</p>
                <h2 className="text-lg font-bold text-slate-900 mb-2">{g.title}</h2>
                <p className="text-sm text-slate-400 font-light leading-relaxed flex-1 mb-5">{g.desc}</p>
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-1.5 text-[0.6875rem] font-bold tracking-[0.06em] uppercase px-2 py-1"
                    style={hs > 0
                      ? { background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#16a34a' }
                      : { background: '#f8fafc', border: '1px solid #e2e8f0', color: '#94a3b8' }
                    }
                  >
                    Best: {hs > 0 ? hs.toLocaleString('en-US') : '0'}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.04em] uppercase text-slate-900">
                    Play
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Leaderboard strip */}
        <div className="mt-10" style={{ border: '1px solid #e2e8f0', background: '#fff' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
            <p className={slbl}>Your high scores</p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            {GAMES.map((g) => {
              const hs = scores[g.id] ?? 0;
              return (
                <div key={g.id} className="p-5 text-center">
                  <p className={`${slbl} mb-1`}>{g.title}</p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: hs > 0 ? '#16a34a' : '#0f172a' }}
                  >
                    {hs > 0 ? hs.toLocaleString('en-US') : '0'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-slate-400 font-light mt-6 text-center">
          All scores are stored in your browser&apos;s local storage — never sent anywhere.
        </p>
      </div>
    </>
  );
}
