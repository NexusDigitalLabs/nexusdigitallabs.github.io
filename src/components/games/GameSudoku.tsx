'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import UsernameGate from './UsernameGate';
import GameHelpModal from './GameHelpModal';
import {
  BrainOverlay,
  BrainPrimaryBtn,
  BrainSecondaryBtn,
  BrainShell,
  formatMmSs,
  type GamePhase,
} from './BrainShell';
import {
  SUDOKU_TIERS,
  cloneGrid,
  conflictCells,
  generatePuzzle,
  isComplete,
  scoreSudoku,
  type SudokuGrid,
  type SudokuTier,
} from '@/lib/games/sudoku';

const DIFF_OPTIONS = [
  { id: 'beginner' as const, label: 'Beginner', hint: '48 clues · 12 min' },
  { id: 'easy' as const, label: 'Easy', hint: '40 clues · 9 min' },
  { id: 'medium' as const, label: 'Medium', hint: '32 clues · 6 min' },
  { id: 'hard' as const, label: 'Hard', hint: '24 clues · 4 min' },
];

export default function GameSudoku() {
  const { username, setUsername, getHighScore, saveScore, loaded } = useGameState();
  const [tier, setTier] = useState<SudokuTier>('easy');
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [grid, setGrid] = useState<SudokuGrid>(() => Array.from({ length: 9 }, () => Array(9).fill(0)));
  const [given, setGiven] = useState<boolean[][]>(() => Array.from({ length: 9 }, () => Array(9).fill(false)));
  const [solution, setSolution] = useState<SudokuGrid>(() => Array.from({ length: 9 }, () => Array(9).fill(0)));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [checkErrors, setCheckErrors] = useState(true);

  useEffect(() => {
    if (loaded && username) setBest(getHighScore('sudoku'));
  }, [loaded, username, getHighScore]);

  const cfg = SUDOKU_TIERS[tier];

  const conflicts = useMemo(
    () => (checkErrors ? conflictCells(grid) : new Set<string>()),
    [grid, checkErrors]
  );

  const startPuzzle = useCallback((nextTier: SudokuTier = tier) => {
    const { puzzle, solution: sol, given: g } = generatePuzzle(nextTier);
    setGrid(puzzle);
    setSolution(sol);
    setGiven(g);
    setSelected(null);
    setMistakes(0);
    setScore(0);
    setElapsed(0);
    setPhase('playing');
  }, [tier]);

  const changeTier = (id: SudokuTier) => {
    setTier(id);
    startPuzzle(id);
  };

  // Countdown timer (all tiers)
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = window.setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= cfg.countdownSec) {
          setPhase('gameover');
          return cfg.countdownSec;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, cfg.countdownSec]);

  const place = (n: number) => {
    if (phase !== 'playing' || !selected) return;
    const [r, c] = selected;
    if (given[r][c]) return;
    setGrid((prev) => {
      const next = cloneGrid(prev);
      next[r][c] = n;
      if (n !== 0 && n !== solution[r][c]) {
        setMistakes((m) => m + 1);
      }
      if (isComplete(next, solution)) {
        const pts = scoreSudoku(tier, mistakes + (n !== solution[r][c] ? 1 : 0), elapsed);
        setScore(pts);
        setBest((b) => {
          const nb = Math.max(b, pts);
          if (nb > b) saveScore('sudoku', nb);
          return nb;
        });
        setPhase('gameover');
      }
      return next;
    });
  };

  const timerLabel =
    phase === 'idle' ? undefined : `⏱ ${formatMmSs(Math.max(0, cfg.countdownSec - elapsed))}`;

  if (!loaded) return null;
  if (!username) return <UsernameGate onSubmit={setUsername} />;

  const won = phase === 'gameover' && isComplete(grid, solution);

  return (
    <>
      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Nexus Sudoku">
        <p style={{ marginBottom: '1rem' }}>
          Fill the 9×9 grid so every row, column, and 3×3 box contains digits <strong style={{ color: 'var(--ndl-text)' }}>1–9</strong> exactly once. Puzzles are generated with a unique solution.
        </p>
        <p style={{ fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.4rem' }}>Tiers</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <li>Beginner 48 clues / 12 min · Easy 40 / 9 min · Medium 32 / 6 min · Hard 24 / 4 min</li>
          <li>Score = base for tier − mistake penalties + remaining time bonus</li>
        </ul>
      </GameHelpModal>

      <BrainShell
        title="Nexus Sudoku"
        blurb="Grid logic · unique solutions · difficulty scales clues and timers."
        best={best}
        score={score}
        phase={phase}
        difficulty={tier}
        options={DIFF_OPTIONS}
        onDifficulty={changeTier}
        onHelp={() => setShowHelp(true)}
        onPause={phase === 'playing' ? () => setPhase('paused') : undefined}
        onResume={phase === 'paused' ? () => setPhase('playing') : undefined}
        timerLabel={timerLabel}
      >
        <div className="relative" style={{ border: '1px solid var(--ndl-border)', background: 'var(--ndl-surface)' }}>
          {(phase === 'idle' || phase === 'paused' || phase === 'gameover') && (
            <BrainOverlay
              title={phase === 'idle' ? 'Sudoku' : phase === 'paused' ? 'Paused' : won ? 'Solved!' : 'Time up'}
              sub={
                phase === 'idle'
                  ? 'Pick a difficulty and start. Changing difficulty resets the puzzle.'
                  : phase === 'paused'
                    ? 'Resume when ready — timer is frozen.'
                    : won
                      ? `Score ${score.toLocaleString('en-US')} · Mistakes ${mistakes}`
                      : 'Countdown exhausted. Try an easier tier or play again.'
              }
              titleColor={won ? '#16a34a' : phase === 'gameover' ? '#ef4444' : undefined}
            >
              <div className="flex gap-2 flex-wrap justify-center">
                <BrainPrimaryBtn onClick={() => startPuzzle()}>
                  {phase === 'idle' ? 'Start Puzzle' : 'Play Again'}
                </BrainPrimaryBtn>
                {phase === 'paused' && (
                  <BrainSecondaryBtn onClick={() => setPhase('playing')}>Resume</BrainSecondaryBtn>
                )}
              </div>
            </BrainOverlay>
          )}

          <div
            className="grid gap-0 p-1 sm:p-2 w-full max-w-[min(100%,420px)] mx-auto"
            style={{ gridTemplateColumns: 'repeat(9, minmax(0, 1fr))' }}
          >
            {grid.map((row, r) =>
              row.map((v, c) => {
                const isGiven = given[r][c];
                const isSel = selected?.[0] === r && selected?.[1] === c;
                const isConflict = conflicts.has(`${r}-${c}`);
                const thickR = c % 3 === 2 && c !== 8;
                const thickB = r % 3 === 2 && r !== 8;
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={phase !== 'playing'}
                    onClick={() => setSelected([r, c])}
                    className="aspect-square flex items-center justify-center text-sm sm:text-base font-bold tabular-nums cursor-pointer overflow-hidden"
                    style={{
                      borderRadius: 0,
                      borderRight: thickR ? '2px solid var(--ndl-text)' : '1px solid var(--ndl-border)',
                      borderBottom: thickB ? '2px solid var(--ndl-text)' : '1px solid var(--ndl-border)',
                      borderTop: r === 0 ? '1px solid var(--ndl-border)' : undefined,
                      borderLeft: c === 0 ? '1px solid var(--ndl-border)' : undefined,
                      background: isSel
                        ? 'rgba(79,70,229,0.18)'
                        : isConflict
                          ? 'rgba(239,68,68,0.12)'
                          : 'var(--ndl-surface)',
                      color: isConflict ? '#ef4444' : isGiven ? 'var(--ndl-text)' : '#4f46e5',
                    }}
                  >
                    {v || ''}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              type="button"
              disabled={phase !== 'playing'}
              onClick={() => place(n)}
              className="w-10 h-10 sm:w-11 sm:h-11 font-extrabold cursor-pointer disabled:opacity-40"
              style={{
                borderRadius: 0,
                border: '1px solid var(--ndl-border)',
                background: 'var(--ndl-surface-2)',
                color: 'var(--ndl-text)',
              }}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            disabled={phase !== 'playing'}
            onClick={() => place(0)}
            className="px-3 h-10 sm:h-11 text-[0.625rem] font-bold tracking-wider uppercase cursor-pointer disabled:opacity-40"
            style={{ borderRadius: 0, border: '1px solid var(--ndl-border)', background: 'var(--ndl-surface-2)', color: 'var(--ndl-muted)' }}
          >
            Erase
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 items-center justify-between">
          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--ndl-muted)' }}>
            <input
              type="checkbox"
              checked={checkErrors}
              onChange={(e) => setCheckErrors(e.target.checked)}
            />
            Highlight conflicts
          </label>
          <div className="flex gap-2">
            <BrainSecondaryBtn onClick={() => startPuzzle()}>Reset Grid</BrainSecondaryBtn>
            {phase === 'idle' && <BrainPrimaryBtn onClick={() => startPuzzle()}>Start</BrainPrimaryBtn>}
          </div>
        </div>
        <p className="mt-3 text-xs" style={{ color: 'var(--ndl-faint)' }}>
          Mistakes: {mistakes}
        </p>
      </BrainShell>
    </>
  );
}
