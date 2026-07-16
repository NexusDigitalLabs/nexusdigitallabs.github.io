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
  CRYPTIC_TIERS,
  buildPuzzle,
  edgeKey,
  neighbors,
  scoreCryptic,
  type CrypticTier,
  type GraphEdge,
} from '@/lib/games/cryptic-paths';

const DIFF = [
  { id: 'easy' as const, label: 'Easy', hint: '4 nodes · 90s' },
  { id: 'medium' as const, label: 'Medium', hint: '6 nodes · 60s' },
  { id: 'hard' as const, label: 'Hard', hint: '8 nodes · 30s' },
];

export default function GameCrypticPaths() {
  const { username, setUsername, getHighScore, saveScore, loaded } = useGameState();
  const [tier, setTier] = useState<CrypticTier>('easy');
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [cursor, setCursor] = useState<number | null>(null);
  const [used, setUsed] = useState<Set<string>>(() => new Set());
  const [path, setPath] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [seed, setSeed] = useState(0);

  const puzzle = useMemo(() => buildPuzzle(tier), [tier, seed]);
  const cfg = CRYPTIC_TIERS[tier];
  const totalEdges = puzzle.edges.length;

  useEffect(() => {
    if (loaded && username) setBest(getHighScore('cryptic-paths'));
  }, [loaded, username, getHighScore]);

  const resetRun = useCallback(
    (t: CrypticTier = tier, playing = true) => {
      setTier(t);
      setSeed((s) => s + 1);
      setCursor(null);
      setUsed(new Set());
      setPath([]);
      setElapsed(0);
      setScore(0);
      setPhase(playing ? 'playing' : 'idle');
    },
    [tier]
  );

  const changeTier = (id: CrypticTier) => {
    resetRun(id, true);
  };

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

  const finishWin = useCallback(() => {
    const pts = scoreCryptic(tier, elapsed);
    setScore(pts);
    setBest((b) => {
      const nb = Math.max(b, pts);
      if (nb > b) saveScore('cryptic-paths', nb);
      return nb;
    });
    setPhase('gameover');
  }, [tier, elapsed, saveScore]);

  const onNode = (id: number) => {
    if (phase !== 'playing') return;
    if (cursor == null) {
      setCursor(id);
      setPath([id]);
      return;
    }
    if (id === cursor) return;
    const key = edgeKey(cursor, id);
    const hasEdge = puzzle.edges.some((e) => edgeKey(e.a, e.b) === key);
    if (!hasEdge) return;
    if (used.has(key)) return;
    if (!neighbors(puzzle.edges, cursor).includes(id)) return;

    const nextUsed = new Set(used);
    nextUsed.add(key);
    setUsed(nextUsed);
    setCursor(id);
    setPath((p) => [...p, id]);
    if (nextUsed.size === totalEdges) finishWin();
  };

  const undo = () => {
    if (phase !== 'playing' || path.length < 2) return;
    const last = path[path.length - 1];
    const prev = path[path.length - 2];
    const key = edgeKey(prev, last);
    const nextUsed = new Set(used);
    nextUsed.delete(key);
    setUsed(nextUsed);
    setPath((p) => p.slice(0, -1));
    setCursor(prev);
  };

  if (!loaded) return null;
  if (!username) return <UsernameGate onSubmit={setUsername} />;

  const won = phase === 'gameover' && used.size === totalEdges;
  const timerLabel =
    phase === 'idle' ? undefined : `⏱ ${formatMmSs(Math.max(0, cfg.countdownSec - elapsed))}`;

  const edgeStroke = (e: GraphEdge) => {
    const key = edgeKey(e.a, e.b);
    return used.has(key) ? '#4f46e5' : 'var(--ndl-border)';
  };

  return (
    <>
      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cryptic Paths">
        <p style={{ marginBottom: '1rem' }}>
          Trace a path that covers <strong style={{ color: 'var(--ndl-text)' }}>every edge exactly once</strong> (Eulerian traversal). Click nodes to walk connected edges.
        </p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <li>Start on any node, then only adjacent unused edges</li>
          <li>All tiers are timed — Easy 90s · Medium 60s · Hard 30s. Faster solves score higher.</li>
        </ul>
      </GameHelpModal>

      <BrainShell
        title="Cryptic Paths"
        blurb="Node traversal — walk every edge once."
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
        <div className="relative overflow-hidden" style={{ border: '1px solid var(--ndl-border)', background: 'var(--ndl-surface)' }}>
          {(phase === 'idle' || phase === 'paused' || phase === 'gameover') && (
            <BrainOverlay
              title={phase === 'idle' ? 'Cryptic Paths' : phase === 'paused' ? 'Paused' : won ? 'Path complete' : 'Time up'}
              sub={
                phase === 'idle'
                  ? 'Cover every edge exactly once.'
                  : won
                    ? `Score ${score.toLocaleString('en-US')}`
                    : phase === 'paused'
                      ? 'Resume to continue tracing.'
                      : 'Countdown hit zero before the tour finished.'
              }
              titleColor={won ? '#16a34a' : phase === 'gameover' ? '#ef4444' : undefined}
            >
              <BrainPrimaryBtn onClick={() => resetRun(tier, true)}>
                {phase === 'idle' ? 'Start' : 'Play Again'}
              </BrainPrimaryBtn>
            </BrainOverlay>
          )}

          <svg viewBox="0 0 340 320" className="w-full h-auto block" role="img" aria-label="Graph puzzle">
            {puzzle.edges.map((e) => {
              const na = puzzle.nodes.find((n) => n.id === e.a)!;
              const nb = puzzle.nodes.find((n) => n.id === e.b)!;
              return (
                <line
                  key={edgeKey(e.a, e.b)}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke={edgeStroke(e)}
                  strokeWidth={used.has(edgeKey(e.a, e.b)) ? 4 : 2}
                />
              );
            })}
            {puzzle.nodes.map((n) => {
              const active = cursor === n.id;
              return (
                <g key={n.id} onClick={() => onNode(n.id)} style={{ cursor: phase === 'playing' ? 'pointer' : 'default' }}>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={16}
                    fill={active ? '#4f46e5' : 'var(--ndl-surface-2)'}
                    stroke={active ? '#312e81' : 'var(--ndl-text)'}
                    strokeWidth={2}
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill={active ? '#fff' : 'var(--ndl-text)'}
                  >
                    {n.id + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 justify-between items-center text-sm" style={{ color: 'var(--ndl-muted)' }}>
          <span>
            Edges: <strong style={{ color: 'var(--ndl-text)' }}>{used.size}/{totalEdges}</strong>
          </span>
          <div className="flex gap-2">
            <BrainSecondaryBtn onClick={undo} disabled={phase !== 'playing'}>
              Undo
            </BrainSecondaryBtn>
            <BrainSecondaryBtn onClick={() => resetRun(tier, true)}>Reset Path</BrainSecondaryBtn>
          </div>
        </div>
      </BrainShell>
    </>
  );
}
