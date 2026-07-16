'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import {
  GameBoardFrame,
  GameControlsRow,
  GameHeader,
  GameOverlay,
  GamePageBody,
  GameSecondaryButton,
  GameTip,
} from './game-ui';
import UsernameGate from './UsernameGate';
import GameHelpModal from './GameHelpModal';

// ── Tile colour palette ────────────────────────────────────────────────────────
const TILE_STYLE: Record<number, { bg: string; fg: string }> = {
  0:    { bg: 'var(--ndl-surface-2)', fg: 'transparent' },
  2:    { bg: '#ffffff', fg: '#0f172a'       },
  4:    { bg: '#f8fafc', fg: '#0f172a'       },
  8:    { bg: '#0f172a', fg: '#ffffff'       },
  16:   { bg: '#1e293b', fg: '#ffffff'       },
  32:   { bg: '#334155', fg: '#ffffff'       },
  64:   { bg: '#475569', fg: '#ffffff'       },
  128:  { bg: '#2563eb', fg: '#ffffff'       },
  256:  { bg: '#1d4ed8', fg: '#ffffff'       },
  512:  { bg: '#1e40af', fg: '#ffffff'       },
  1024: { bg: '#312e81', fg: '#ffffff'       },
  2048: { bg: '#4ade80', fg: '#052e16'       },
};

function getTileStyle(v: number) {
  return TILE_STYLE[v] ?? { bg: '#4ade80', fg: '#052e16' };
}

// ── Board logic (pure functions) ───────────────────────────────────────────────
type Board = number[];

function shiftLine(line: number[]): { result: number[]; gained: number; won: boolean } {
  const filtered = line.filter((n) => n !== 0);
  const result: number[] = [];
  let gained = 0;
  let won = false;
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const merged = filtered[i] * 2;
      result.push(merged);
      gained += merged;
      if (merged === 2048) won = true;
      i += 2;
    } else {
      result.push(filtered[i]);
      i++;
    }
  }
  while (result.length < 4) result.push(0);
  return { result, gained, won };
}

function applyMove(
  board: Board,
  direction: 'up' | 'down' | 'left' | 'right',
): { board: Board; gained: number; moved: boolean; won: boolean } {
  const next = [...board];
  let gained = 0;
  let moved = false;
  let won = false;

  const getRow = (r: number) => [next[r*4], next[r*4+1], next[r*4+2], next[r*4+3]];
  const setRow = (r: number, line: number[]) => { for (let c = 0; c < 4; c++) next[r*4+c] = line[c]; };
  const getCol = (c: number) => [next[c], next[4+c], next[8+c], next[12+c]];
  const setCol = (c: number, line: number[]) => { for (let r = 0; r < 4; r++) next[r*4+c] = line[r]; };

  if (direction === 'left' || direction === 'right') {
    for (let r = 0; r < 4; r++) {
      const orig = getRow(r);
      const line = direction === 'right' ? [...orig].reverse() : [...orig];
      const { result, gained: g, won: w } = shiftLine(line);
      const shifted = direction === 'right' ? [...result].reverse() : result;
      if (orig.join(',') !== shifted.join(',')) { setRow(r, shifted); moved = true; }
      gained += g;
      if (w) won = true;
    }
  } else {
    for (let c = 0; c < 4; c++) {
      const orig = getCol(c);
      const line = direction === 'down' ? [...orig].reverse() : [...orig];
      const { result, gained: g, won: w } = shiftLine(line);
      const shifted = direction === 'down' ? [...result].reverse() : result;
      if (orig.join(',') !== shifted.join(',')) { setCol(c, shifted); moved = true; }
      gained += g;
      if (w) won = true;
    }
  }

  return { board: next, gained, moved, won };
}

function spawnTile(board: Board): Board {
  const empties = board.reduce<number[]>((acc, v, i) => { if (v === 0) acc.push(i); return acc; }, []);
  if (!empties.length) return board;
  const pos = empties[Math.floor(Math.random() * empties.length)];
  const next = [...board];
  next[pos] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function isGameOver(board: Board): boolean {
  if (board.some((n) => n === 0)) return false;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = board[r * 4 + c];
      if (c < 3 && board[r * 4 + c + 1] === v) return false;
      if (r < 3 && board[(r + 1) * 4 + c] === v) return false;
    }
  }
  return true;
}

function newBoard(): Board {
  let b = Array(16).fill(0);
  b = spawnTile(b);
  b = spawnTile(b);
  return b;
}

// ── Main component ─────────────────────────────────────────────────────────────
type Overlay = { title: string; sub: string; titleColor: string } | null;

export default function Game2048() {
  const { username, setUsername, getHighScore, saveScore, loaded } = useGameState();
  const [board, setBoard] = useState<Board>(Array(16).fill(0));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [overlay, setOverlay] = useState<Overlay>({ title: '2048', sub: 'Merge tiles to reach 2048', titleColor: 'var(--ndl-text)' });
  const [started, setStarted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Init best after load
  useEffect(() => {
    if (loaded && username) {
      const hs = getHighScore('2048');
      setBest(hs);
    }
  }, [loaded, username, getHighScore]);

  const startGame = useCallback(() => {
    setBoard(newBoard());
    setScore(0);
    setOverlay(null);
    setStarted(true);
  }, []);

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (overlay) return;
    setBoard((prev) => {
      const { board: next, gained, moved, won } = applyMove(prev, direction);
      if (!moved) return prev;

      let newScore = 0;
      setScore((s) => {
        newScore = s + gained;
        setBest((b) => {
          const nb = Math.max(b, newScore);
          if (nb > b) saveScore('2048', nb);
          return nb;
        });
        return newScore;
      });

      const spawned = spawnTile(next);

      if (won) {
        setOverlay({ title: 'You reached 2048!', sub: `Score: ${newScore.toLocaleString('en-US')} — Keep going or start fresh.`, titleColor: '#16a34a' });
      } else if (isGameOver(spawned)) {
        setOverlay({ title: 'Game Over', sub: `Final score: ${newScore.toLocaleString('en-US')}`, titleColor: '#ef4444' });
      }

      return spawned;
    });
  }, [overlay, saveScore]);

  // Keyboard input
  useEffect(() => {
    if (!started) return;
    const KEY_MAP: Record<string, 'up' | 'down' | 'left' | 'right'> = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
      W: 'up', S: 'down', A: 'left', D: 'right',
    };
    const handler = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key];
      if (dir) { e.preventDefault(); move(dir); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [started, move]);

  // Touch/swipe input — scoped to the game grid to avoid intercepting header link taps
  useEffect(() => {
    if (!started) return;
    const el = gridRef.current;
    if (!el) return;
    let tx0 = 0, ty0 = 0;
    const onStart = (e: TouchEvent) => { tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - tx0;
      const dy = e.changedTouches[0].clientY - ty0;
      if (Math.abs(dx) < 28 && Math.abs(dy) < 28) return;
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
      else move(dy > 0 ? 'down' : 'up');
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchend', onEnd); };
  }, [started, move]);

  if (!loaded) return null;
  if (!username) return <UsernameGate onSubmit={setUsername} />;

  return (
    <>
      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="2048">
        <p style={{ marginBottom: '1rem' }}>
          Slide tiles on a <strong style={{ color: 'var(--ndl-text)' }}>4×4 grid</strong> using arrow keys or swipe gestures. When two tiles with the same number collide, they <strong style={{ color: 'var(--ndl-text)' }}>merge into one</strong>.
        </p>
        <p style={{ fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.5rem' }}>Goal</p>
        <p style={{ marginBottom: '1rem' }}>Create a tile with the value <strong style={{ color: '#4ade80' }}>2048</strong> to win. Keep playing after winning to beat your high score.</p>
        <p style={{ fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.5rem' }}>Controls</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <li><strong style={{ color: 'var(--ndl-text)' }}>Arrow keys</strong> or <strong style={{ color: 'var(--ndl-text)' }}>W / A / S / D</strong> — move all tiles</li>
          <li><strong style={{ color: 'var(--ndl-text)' }}>Swipe</strong> — on touch screens</li>
        </ul>
        <p style={{ marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--ndl-text)' }}>Strategy Tips</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <li>Keep your highest tile locked in a corner</li>
          <li>Build a descending chain of tiles along one edge</li>
          <li>Avoid filling the board — always plan two moves ahead</li>
        </ul>
      </GameHelpModal>

      <GameHeader
        title="2048"
        onHelp={() => setShowHelp(true)}
        stats={[
          { label: 'Score', value: score.toLocaleString('en-US') },
          { label: 'Best', value: best.toLocaleString('en-US') },
        ]}
      />

      <GamePageBody>
        <div className="flex justify-between items-center gap-3 mb-4">
          <GameTip>
            Merge tiles to reach <strong style={{ color: '#4ade80', fontWeight: 700 }}>2048</strong>
          </GameTip>
          <GameSecondaryButton onClick={startGame}>New Game</GameSecondaryButton>
        </div>

        <GameBoardFrame className="inline-block w-full max-w-[360px]">
          <div
            ref={gridRef}
            className="relative w-full"
            style={{ aspectRatio: '1', userSelect: 'none', touchAction: 'none' }}
          >
            <div
              className="absolute inset-0 grid p-1.5 rounded-2xl"
              style={{
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '6px',
                background: 'color-mix(in srgb, var(--ndl-border) 35%, var(--ndl-surface-2))',
              }}
            >
              {board.map((v, i) => {
                const st = getTileStyle(v);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-center font-extrabold rounded-lg"
                    style={{
                      fontSize: v >= 1024 ? '0.875rem' : v >= 128 ? '1rem' : v >= 8 ? '1.125rem' : '1.25rem',
                      background: st.bg,
                      color: st.fg,
                      aspectRatio: '1',
                      transition: 'background-color 0.08s, color 0.08s',
                      boxShadow: v > 0 ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    {v > 0 ? v.toLocaleString('en-US') : ''}
                  </div>
                );
              })}
            </div>

            {overlay && (
              <GameOverlay
                title={overlay.title}
                sub={overlay.sub}
                titleColor={overlay.titleColor}
                btnText={started ? 'Play Again' : 'Start Game'}
                onAction={startGame}
              />
            )}
          </div>
        </GameBoardFrame>

        <GameControlsRow
          items={[
            { key: '↑ W', label: 'Up' },
            { key: '↓ S', label: 'Down' },
            { key: '← A', label: 'Left' },
            { key: '→ D', label: 'Right' },
            { key: 'Swipe', label: 'Touch' },
          ]}
        />
      </GamePageBody>
    </>
  );
}
