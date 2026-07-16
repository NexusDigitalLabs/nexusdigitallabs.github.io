'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import UsernameGate from './UsernameGate';
import GameHelpModal from './GameHelpModal';
import {
  BrainOverlay,
  BrainPrimaryBtn,
  BrainSecondaryBtn,
  BrainShell,
  type GamePhase,
} from './BrainShell';
import {
  GRIDLOCK_TIERS,
  patternsEqual,
  randomPattern,
  type GridlockTier,
} from '@/lib/games/gridlock';

type RoundPhase = 'idle' | 'flash' | 'recall' | 'gameover';

const DIFF = [
  { id: 'easy' as const, label: 'Easy', hint: '3×3 · 2s look · 8s recall' },
  { id: 'medium' as const, label: 'Medium', hint: '4×4 · 1.5s look · 6s recall' },
  { id: 'hard' as const, label: 'Hard', hint: '5×5 · 1s look · 4s recall' },
];

export default function GameGridlock() {
  const { username, setUsername, getHighScore, saveScore, loaded } = useGameState();
  const [tier, setTier] = useState<GridlockTier>('easy');
  const [shellPhase, setShellPhase] = useState<GamePhase>('idle');
  const [round, setRound] = useState<RoundPhase>('idle');
  const [target, setTarget] = useState<number[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [recallLeftMs, setRecallLeftMs] = useState(0);
  const timerRef = useRef<number | null>(null);
  const recallIntervalRef = useRef<number | null>(null);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);

  const cfg = GRIDLOCK_TIERS[tier];
  livesRef.current = lives;
  scoreRef.current = score;

  useEffect(() => {
    if (loaded && username) setBest(getHighScore('gridlock'));
  }, [loaded, username, getHighScore]);

  const clearTimers = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (recallIntervalRef.current) {
      window.clearInterval(recallIntervalRef.current);
      recallIntervalRef.current = null;
    }
  };

  useEffect(() => () => clearTimers(), []);

  const beginRoundRef = useRef<() => void>(() => undefined);

  const failLife = useCallback(() => {
    const nextLives = livesRef.current - 1;
    setLives(nextLives);
    if (nextLives <= 0) {
      clearTimers();
      setRound('gameover');
      setShellPhase('gameover');
      setRecallLeftMs(0);
      setBest((b) => {
        const nb = Math.max(b, scoreRef.current);
        if (nb > b) saveScore('gridlock', nb);
        return nb;
      });
      return false;
    }
    return true;
  }, [saveScore]);

  const beginRound = useCallback(() => {
    clearTimers();
    const pattern = randomPattern(cfg.size, cfg.flashes);
    setTarget(pattern);
    setPicked([]);
    setFlashOn(true);
    setRecallLeftMs(0);
    setRound('flash');
    setShellPhase('playing');
    timerRef.current = window.setTimeout(() => {
      setFlashOn(false);
      setRound('recall');
      setRecallLeftMs(cfg.recallMs);
      const started = Date.now();
      recallIntervalRef.current = window.setInterval(() => {
        const left = Math.max(0, cfg.recallMs - (Date.now() - started));
        setRecallLeftMs(left);
        if (left <= 0) {
          clearTimers();
          if (failLife()) {
            beginRoundRef.current();
          }
        }
      }, 50);
    }, cfg.windowMs);
  }, [cfg, failLife]);

  beginRoundRef.current = beginRound;

  const resetAll = (next: GridlockTier = tier) => {
    clearTimers();
    setTier(next);
    setScore(0);
    setLives(3);
    setTarget([]);
    setPicked([]);
    setFlashOn(false);
    setRecallLeftMs(0);
    setRound('idle');
    setShellPhase('idle');
  };

  const changeTier = (id: GridlockTier) => {
    resetAll(id);
  };

  const onCell = (idx: number) => {
    if (round !== 'recall') return;
    if (picked.includes(idx)) return;
    const nextPicked = [...picked, idx];
    setPicked(nextPicked);

    if (!target.includes(idx)) {
      clearTimers();
      if (failLife()) {
        setPicked([]);
        beginRound();
      }
      return;
    }

    if (nextPicked.length === target.length) {
      if (patternsEqual(nextPicked, target)) {
        clearTimers();
        const pts = score + cfg.points;
        setScore(pts);
        setBest((b) => {
          const nb = Math.max(b, pts);
          if (nb > b) saveScore('gridlock', nb);
          return nb;
        });
        beginRound();
      }
    }
  };

  if (!loaded) return null;
  if (!username) return <UsernameGate onSubmit={setUsername} />;

  return (
    <>
      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Gridlock">
        <p style={{ marginBottom: '1rem' }}>
          Memorize the flashing tiles, then recreate the pattern before the recall timer runs out. Wrong tiles or a timeout each cost a life — three lives and the run ends.
        </p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <li>Easy 3×3 / Medium 4×4 / Hard 5×5</li>
          <li>Shorter flash windows and recall timers on harder tiers</li>
        </ul>
      </GameHelpModal>

      <BrainShell
        title="Gridlock"
        blurb="Pattern matrix memory — flash, hide, recreate against the clock."
        best={best}
        score={score}
        phase={shellPhase}
        difficulty={tier}
        options={DIFF}
        onDifficulty={changeTier}
        onHelp={() => setShowHelp(true)}
        timerLabel={
          round === 'flash'
            ? 'Memorize…'
            : round === 'recall'
              ? `⏱ ${(recallLeftMs / 1000).toFixed(1)}s`
              : undefined
        }
      >
        <div className="relative mx-auto max-w-md" style={{ border: '1px solid var(--ndl-border)', background: 'var(--ndl-surface)', padding: '1rem' }}>
          {(round === 'idle' || round === 'gameover') && (
            <BrainOverlay
              title={round === 'idle' ? 'Gridlock' : 'Game Over'}
              sub={
                round === 'idle'
                  ? `Memorize ${cfg.flashes} tiles on a ${cfg.size}×${cfg.size} grid.`
                  : `Final score ${score.toLocaleString('en-US')}`
              }
              titleColor={round === 'gameover' ? '#ef4444' : undefined}
            >
              <BrainPrimaryBtn
                onClick={() => {
                  setLives(3);
                  setScore(0);
                  beginRound();
                }}
              >
                {round === 'idle' ? 'Start' : 'Play Again'}
              </BrainPrimaryBtn>
            </BrainOverlay>
          )}

          <div
            className="grid gap-1.5 w-full"
            style={{
              gridTemplateColumns: `repeat(${cfg.size}, minmax(0, 1fr))`,
              opacity: round === 'idle' || round === 'gameover' ? 0.35 : 1,
            }}
          >
            {Array.from({ length: cfg.size * cfg.size }, (_, i) => {
              const lit =
                (round === 'flash' && flashOn && target.includes(i)) ||
                (round === 'recall' && picked.includes(i));
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onCell(i)}
                  disabled={round !== 'recall'}
                  className="aspect-square cursor-pointer disabled:cursor-default overflow-hidden"
                  style={{
                    borderRadius: 0,
                    border: '1px solid var(--ndl-border)',
                    background: lit ? '#4f46e5' : 'var(--ndl-surface-2)',
                  }}
                  aria-label={`Tile ${i + 1}`}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 justify-between items-center text-sm" style={{ color: 'var(--ndl-muted)' }}>
          <span>
            Lives: <strong style={{ color: 'var(--ndl-text)' }}>{lives}</strong>
          </span>
          <span>
            Phase:{' '}
            <strong style={{ color: 'var(--ndl-text)' }}>
              {round === 'flash' ? 'Memorize' : round === 'recall' ? 'Recall' : round}
            </strong>
          </span>
          <BrainSecondaryBtn onClick={() => resetAll()}>Reset</BrainSecondaryBtn>
        </div>
      </BrainShell>
    </>
  );
}
