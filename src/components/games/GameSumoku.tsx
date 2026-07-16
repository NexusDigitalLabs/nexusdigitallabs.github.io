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
  formatMmSs,
  type GamePhase,
} from './BrainShell';
import {
  SUMOKU_TIERS,
  applyClearAndDrop,
  fillBoard,
  pickTarget,
  scoreSumokuMatch,
  selectionConnected,
  selectionSum,
  type SumokuCell,
  type SumokuTier,
} from '@/lib/games/sumoku';

const DIFF = [
  { id: 'easy' as const, label: 'Easy', hint: '1–9 · 75s round' },
  { id: 'medium' as const, label: 'Medium', hint: '1–15 · 45s round' },
  { id: 'hard' as const, label: 'Hard', hint: 'Negatives · 40s · shifting' },
];

export default function GameSumoku() {
  const { username, setUsername, getHighScore, saveScore, loaded } = useGameState();
  const [tier, setTier] = useState<SumokuTier>('easy');
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [board, setBoard] = useState<SumokuCell[]>(() => Array(16).fill(0));
  const [selected, setSelected] = useState<number[]>([]);
  const [target, setTarget] = useState(10);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [remaining, setRemaining] = useState(75);
  const [shiftLeft, setShiftLeft] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [msg, setMsg] = useState('');
  const scoreRef = useRef(0);
  scoreRef.current = score;

  const cfg = SUMOKU_TIERS[tier];

  useEffect(() => {
    if (loaded && username) setBest(getHighScore('sumoku'));
  }, [loaded, username, getHighScore]);

  const boot = useCallback((t: SumokuTier) => {
    const b = fillBoard(t);
    setBoard(b);
    setTarget(pickTarget(b, t));
    setSelected([]);
    setScore(0);
    setMsg('');
    setRemaining(SUMOKU_TIERS[t].roundSec);
    setShiftLeft(SUMOKU_TIERS[t].shiftTargetSec);
    setPhase('playing');
  }, []);

  const changeTier = (id: SumokuTier) => {
    setTier(id);
    boot(id);
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setPhase('gameover');
          setBest((b) => {
            const nb = Math.max(b, scoreRef.current);
            if (nb > b) saveScore('sumoku', nb);
            return nb;
          });
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, saveScore]);

  useEffect(() => {
    if (phase !== 'playing' || cfg.shiftTargetSec == null) return;
    const id = window.setInterval(() => {
      setShiftLeft((s) => {
        if (s == null) return s;
        if (s <= 1) {
          setBoard((b) => {
            const nt = pickTarget(b, tier);
            setTarget(nt);
            setMsg('Target shifted!');
            return b;
          });
          setSelected([]);
          return cfg.shiftTargetSec;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, cfg.shiftTargetSec, tier]);

  const toggleCell = (idx: number) => {
    if (phase !== 'playing') return;
    setSelected((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      const next = [...prev, idx];
      if (!selectionConnected(next)) {
        setMsg('Tiles must be adjacent in path order');
        return prev;
      }
      setMsg('');
      return next;
    });
  };

  const submitMatch = () => {
    if (phase !== 'playing' || selected.length < 2) return;
    if (!selectionConnected(selected)) {
      setMsg('Selection must be connected');
      return;
    }
    const sum = selectionSum(board, selected);
    if (sum !== target) {
      setMsg(`Sum is ${sum}, need ${target}`);
      setSelected([]);
      return;
    }
    const pts = score + scoreSumokuMatch(target, selected.length);
    setScore(pts);
    setBest((b) => {
      const nb = Math.max(b, pts);
      if (nb > b) saveScore('sumoku', nb);
      return nb;
    });
    const nextBoard = applyClearAndDrop(board, selected, tier);
    setBoard(nextBoard);
    setTarget(pickTarget(nextBoard, tier));
    setSelected([]);
    setMsg('Match!');
  };

  if (!loaded) return null;
  if (!username) return <UsernameGate onSubmit={setUsername} />;

  const timerLabel =
    phase === 'idle'
      ? undefined
      : `⏱ ${formatMmSs(remaining)}${
          shiftLeft != null && phase === 'playing' ? ` · Target ↻ ${shiftLeft}s` : ''
        }`;

  return (
    <>
      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Sumoku">
        <p style={{ marginBottom: '1rem' }}>
          Select a path of adjacent tiles that sum exactly to the target. Cleared tiles drop new numbers into the column.
        </p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <li>Easy: 75s · Medium: 45s · Hard: 40s with shifting target every 12s</li>
        </ul>
      </GameHelpModal>

      <BrainShell
        title="Sumoku"
        blurb="Math-logic grid — connected sums, gravity refill."
        best={best}
        score={score}
        phase={phase}
        difficulty={tier}
        options={DIFF}
        onDifficulty={changeTier}
        onHelp={() => setShowHelp(true)}
        onPause={phase === 'playing' ? () => setPhase('paused') : undefined}
        onResume={phase === 'paused' ? () => setPhase('playing') : undefined}
        timerLabel={timerLabel}
      >
        <div className="relative" style={{ border: '1px solid var(--ndl-border)', background: 'var(--ndl-surface)', padding: '1.25rem' }}>
          {(phase === 'idle' || phase === 'paused' || phase === 'gameover') && (
            <BrainOverlay
              title={phase === 'idle' ? 'Sumoku' : phase === 'paused' ? 'Paused' : 'Round Over'}
              sub={
                phase === 'idle'
                  ? 'Connect numbers to hit the target sum.'
                  : phase === 'paused'
                    ? 'Timer paused.'
                    : `Score ${score.toLocaleString('en-US')}`
              }
              titleColor={phase === 'gameover' ? '#ef4444' : undefined}
            >
              <BrainPrimaryBtn onClick={() => boot(tier)}>
                {phase === 'idle' ? 'Start' : 'Play Again'}
              </BrainPrimaryBtn>
            </BrainOverlay>
          )}

          <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
            <div>
              <p className="text-[0.6rem] font-bold tracking-[0.15em] uppercase m-0" style={{ color: 'var(--ndl-faint)' }}>
                Target sum
              </p>
              <p className="text-4xl font-extrabold tabular-nums m-0" style={{ color: '#4f46e5' }}>
                {target}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[0.6rem] font-bold tracking-[0.15em] uppercase m-0" style={{ color: 'var(--ndl-faint)' }}>
                Selection
              </p>
              <p className="text-2xl font-extrabold tabular-nums m-0" style={{ color: 'var(--ndl-text)' }}>
                {selectionSum(board, selected)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 w-full max-w-sm mx-auto">
            {board.map((v, i) => {
              const on = selected.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={phase !== 'playing'}
                  onClick={() => toggleCell(i)}
                  className="aspect-square text-lg font-extrabold tabular-nums cursor-pointer overflow-hidden disabled:opacity-50"
                  style={{
                    borderRadius: 0,
                    border: on ? '2px solid #4f46e5' : '1px solid var(--ndl-border)',
                    background: on ? 'rgba(79,70,229,0.12)' : 'var(--ndl-surface-2)',
                    color: (v ?? 0) < 0 ? '#ef4444' : 'var(--ndl-text)',
                  }}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <BrainPrimaryBtn onClick={submitMatch} disabled={phase !== 'playing'}>
            Submit match
          </BrainPrimaryBtn>
          <BrainSecondaryBtn onClick={() => setSelected([])} disabled={phase !== 'playing'}>
            Clear selection
          </BrainSecondaryBtn>
          <BrainSecondaryBtn onClick={() => boot(tier)}>Reset Grid</BrainSecondaryBtn>
        </div>
        {msg && (
          <p className="mt-3 text-center text-sm" style={{ color: 'var(--ndl-muted)' }}>
            {msg}
          </p>
        )}
      </BrainShell>
    </>
  );
}
