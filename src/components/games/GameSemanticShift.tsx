'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import UsernameGate from './UsernameGate';
import GameHelpModal from './GameHelpModal';
import {
  BrainOverlay,
  BrainPrimaryBtn,
  BrainShell,
  type GamePhase,
} from './BrainShell';
import {
  INK,
  SEMANTIC_TIERS,
  generateRound,
  nextRule,
  streakMultiplier,
  type MatchRule,
  type Round,
  type SemanticTier,
} from '@/lib/games/semantic-shift';

const DIFF = [
  { id: 'easy' as const, label: 'Easy', hint: '2.5s · rule every 5' },
  { id: 'medium' as const, label: 'Medium', hint: '1.3s · rule every 2' },
  { id: 'hard' as const, label: 'Hard', hint: '0.7s · random rules' },
];

export default function GameSemanticShift() {
  const { username, setUsername, getHighScore, saveScore, loaded } = useGameState();
  const [tier, setTier] = useState<SemanticTier>('easy');
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [rule, setRule] = useState<MatchRule>('word');
  const [roundIdx, setRoundIdx] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [streak, setStreak] = useState(0);
  const [msLeft, setMsLeft] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const endRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lockedRef = useRef(false);

  const cfg = SEMANTIC_TIERS[tier];

  useEffect(() => {
    if (loaded && username) setBest(getHighScore('semantic-shift'));
  }, [loaded, username, getHighScore]);

  const stopRaf = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const endRun = useCallback(
    (finalScore: number) => {
      stopRaf();
      lockedRef.current = true;
      setPhase('gameover');
      setBest((b) => {
        const nb = Math.max(b, finalScore);
        if (nb > b) saveScore('semantic-shift', nb);
        return nb;
      });
    },
    [saveScore]
  );

  const spawnRound = useCallback(
    (idx: number, prevRule: MatchRule, currentScore: number, currentStreak: number) => {
      stopRaf();
      lockedRef.current = false;
      const r = nextRule(tier, idx, prevRule);
      const next = generateRound(r);
      setRule(r);
      setRound(next);
      setRoundIdx(idx);
      setMsLeft(cfg.perRoundMs);
      endRef.current = performance.now() + cfg.perRoundMs;

      const tick = (now: number) => {
        const left = Math.max(0, endRef.current - now);
        setMsLeft(left);
        if (left <= 0) {
          endRun(currentScore);
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      void currentStreak;
    },
    [tier, cfg.perRoundMs, endRun]
  );

  useEffect(() => () => stopRaf(), []);

  const start = (t: SemanticTier = tier) => {
    setTier(t);
    setScore(0);
    setStreak(0);
    setPhase('playing');
    spawnRound(0, 'word', 0, 0);
  };

  const changeTier = (id: SemanticTier) => {
    stopRaf();
    setTier(id);
    setPhase('idle');
    setRound(null);
    setScore(0);
    setStreak(0);
    setMsLeft(0);
  };

  const answer = (choice: string) => {
    if (phase !== 'playing' || !round || lockedRef.current) return;
    lockedRef.current = true;
    stopRaf();
    if (choice !== round.correct) {
      endRun(score);
      return;
    }
    const nextStreak = streak + 1;
    const gained = Math.round(cfg.basePts * streakMultiplier(nextStreak));
    const nextScore = score + gained;
    setStreak(nextStreak);
    setScore(nextScore);
    setBest((b) => {
      const nb = Math.max(b, nextScore);
      if (nb > b) saveScore('semantic-shift', nb);
      return nb;
    });
    spawnRound(roundIdx + 1, rule, nextScore, nextStreak);
  };

  if (!loaded) return null;
  if (!username) return <UsernameGate onSubmit={setUsername} />;

  const pct = cfg.perRoundMs > 0 ? (msLeft / cfg.perRoundMs) * 100 : 0;

  return (
    <>
      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Semantic Shift">
        <p style={{ marginBottom: '1rem' }}>
          Stroop challenge: the displayed word&apos;s ink may disagree with its meaning. Follow the flashing rule —{' '}
          <strong style={{ color: 'var(--ndl-text)' }}>MATCH WORD</strong> or{' '}
          <strong style={{ color: 'var(--ndl-text)' }}>MATCH COLOR</strong> — before time runs out.
        </p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <li>One miss or timeout ends the run</li>
          <li>Streaks multiply points (×1.5 / ×2 / ×3)</li>
        </ul>
      </GameHelpModal>

      <BrainShell
        title="Semantic Shift"
        blurb="Stroop reflexes — word vs ink under the clock."
        best={best}
        score={score}
        phase={phase}
        difficulty={tier}
        options={DIFF}
        onDifficulty={changeTier}
        onHelp={() => setShowHelp(true)}
        timerLabel={phase === 'playing' ? `${(msLeft / 1000).toFixed(1)}s` : undefined}
      >
        <div className="relative overflow-hidden" style={{ border: '1px solid var(--ndl-border)', background: 'var(--ndl-surface)', padding: '1.5rem' }}>
          {(phase === 'idle' || phase === 'gameover') && (
            <BrainOverlay
              title={phase === 'idle' ? 'Semantic Shift' : 'Run over'}
              sub={
                phase === 'idle'
                  ? 'Match the word meaning or the ink color — whichever the rule demands.'
                  : `Score ${score.toLocaleString('en-US')} · Best streak ${streak}`
              }
              titleColor={phase === 'gameover' ? '#ef4444' : undefined}
            >
              <BrainPrimaryBtn onClick={() => start()}>{phase === 'idle' ? 'Start' : 'Play Again'}</BrainPrimaryBtn>
            </BrainOverlay>
          )}

          <div style={{ opacity: phase === 'playing' ? 1 : 0.25 }}>
            <p
              className="text-center text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-4"
              style={{ color: rule === 'word' ? '#4f46e5' : '#16a34a' }}
            >
              {rule === 'word' ? 'Match word' : 'Match color'}
            </p>

            <p
              className="text-center text-4xl sm:text-5xl font-extrabold tracking-wide mb-6 break-words"
              style={{ color: round ? INK[round.ink] : 'var(--ndl-text)' }}
            >
              {round?.word ?? 'BLUE'}
            </p>

            <div className="h-1.5 w-full mb-6" style={{ background: 'var(--ndl-surface-2)' }}>
              <div
                className="h-full transition-[width] duration-75"
                style={{ width: `${pct}%`, background: pct < 30 ? '#ef4444' : '#4f46e5' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(round ? [round.optionA, round.optionB] : (['RED', 'BLUE'] as const)).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={phase !== 'playing'}
                  onClick={() => answer(opt)}
                  className="py-4 text-sm font-extrabold tracking-wider uppercase cursor-pointer disabled:opacity-40 overflow-hidden"
                  style={{
                    borderRadius: 0,
                    border: '1px solid var(--ndl-border)',
                    background: 'var(--ndl-surface-2)',
                    color: 'var(--ndl-text)',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            <p className="mt-4 text-center text-xs" style={{ color: 'var(--ndl-faint)' }}>
              Streak {streak} · ×{streakMultiplier(streak)}
            </p>
          </div>
        </div>
      </BrainShell>
    </>
  );
}
