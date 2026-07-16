'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import {
  GameBoardFrame,
  GameControlsRow,
  GameHeader,
  GameOverlay,
  GamePageBody,
  GameSecondaryButton,
} from './game-ui';
import UsernameGate from './UsernameGate';
import GameHelpModal from './GameHelpModal';
import {
  SNAKE_POINTS_PER_LEVEL,
  snakeLevelFromScore,
  snakeTickMsForScore,
} from '@/lib/snake-levels';

const CELL = 20;

interface Point { x: number; y: number; }
interface Dir   { x: number; y: number; }

interface OverlayState {
  title: string;
  sub: string;
  titleColor: string;
  btnText: string;
}

function readCanvasColors() {
  if (typeof document === 'undefined') {
    return { bg: '#ffffff', grid: '#f1f5f9', head: '#0f172a' };
  }
  const s = getComputedStyle(document.documentElement);
  const surface = s.getPropertyValue('--ndl-surface').trim() || '#ffffff';
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    bg: surface,
    grid: isDark ? 'rgba(148,163,184,0.12)' : '#f1f5f9',
    head: isDark ? '#f8fafc' : '#0f172a',
  };
}

export default function GameSnake() {
  const { username, setUsername, getHighScore, saveScore, loaded } = useGameState();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const snakeRef   = useRef<Point[]>([]);
  const dirRef     = useRef<Dir>({ x: 1, y: 0 });
  const nextDirRef = useRef<Dir>({ x: 1, y: 0 });
  const foodRef    = useRef<Point>({ x: 0, y: 0 });
  const scoreRef   = useRef(0);
  const levelRef   = useRef(1);
  const bestRef    = useRef(0);
  const aliveRef   = useRef(false);
  const runningRef = useRef(false);
  const lastTickRef= useRef(0);
  const rafRef     = useRef<number | null>(null);
  const colsRef    = useRef(0);
  const rowsRef    = useRef(0);

  const [dispScore, setDispScore] = useState(0);
  const [dispLevel, setDispLevel] = useState(1);
  const [dispBest,  setDispBest]  = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [levelPulse, setLevelPulse] = useState(false);
  const [overlay, setOverlay] = useState<OverlayState>({
    title: 'Snake',
    sub: 'Eat food, level up, and wrap through walls. Speed rises each level.',
    titleColor: 'var(--ndl-text)',
    btnText: 'Start Game',
  });

  useEffect(() => {
    if (!loaded || !username) return;
    const hs = getHighScore('snake');
    bestRef.current = hs;
    setDispBest(hs);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const avail = Math.min(360, window.innerWidth - 48);
    const size  = Math.floor(avail / CELL) * CELL;
    canvas.width  = size;
    canvas.height = size;
    canvas.style.width  = `${size}px`;
    canvas.style.height = `${size}px`;
    colsRef.current = size / CELL;
    rowsRef.current = size / CELL;

    const ctx = canvas.getContext('2d');
    const { bg } = readCanvasColors();
    if (ctx) { ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size); }
  }, [loaded, username, getHighScore]);

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const COLS = colsRef.current, ROWS = rowsRef.current;
    const { bg, grid, head } = readCanvasColors();

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = grid;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x*CELL,0); ctx.lineTo(x*CELL,H); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0,y*CELL); ctx.lineTo(W,y*CELL); ctx.stroke(); }

    const f = foodRef.current;
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, CELL / 2 - 6, 0, Math.PI * 2);
    ctx.fill();

    const snake = snakeRef.current;
    const dir   = dirRef.current;
    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      const isHead = i === 0;
      const t = 1 - (i / Math.max(snake.length, 1)) * 0.4;
      if (isHead) {
        ctx.fillStyle = head;
      } else {
        const g = Math.round(74 + (1 - t) * 40);
        ctx.fillStyle = `rgb(${g}, ${Math.round(222 - t * 60)}, ${Math.round(128 - t * 30)})`;
      }
      const pad = isHead ? 1 : 2;
      const r = isHead ? 4 : 3;
      const x = seg.x * CELL + pad;
      const y = seg.y * CELL + pad;
      const w = CELL - pad * 2;
      const h = CELL - pad * 2;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();

      if (isHead) {
        ctx.fillStyle = head === '#0f172a' ? '#fff' : '#0f172a';
        const ex = seg.x*CELL, ey = seg.y*CELL;
        if (dir.x === 1)  { ctx.fillRect(ex+CELL-5,ey+3,3,3); ctx.fillRect(ex+CELL-5,ey+CELL-6,3,3); }
        if (dir.x === -1) { ctx.fillRect(ex+2,ey+3,3,3);       ctx.fillRect(ex+2,ey+CELL-6,3,3); }
        if (dir.y === -1) { ctx.fillRect(ex+3,ey+2,3,3);       ctx.fillRect(ex+CELL-6,ey+2,3,3); }
        if (dir.y === 1)  { ctx.fillRect(ex+3,ey+CELL-5,3,3);  ctx.fillRect(ex+CELL-6,ey+CELL-5,3,3); }
      }
    }
  };

  const placeFood = () => {
    const snake = snakeRef.current;
    const COLS = colsRef.current, ROWS = rowsRef.current;
    const candidates: Point[] = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (!snake.some((s) => s.x === x && s.y === y)) candidates.push({ x, y });
      }
    }
    if (!candidates.length) return;
    foodRef.current = candidates[Math.floor(Math.random() * candidates.length)];
  };

  const bumpLevelIfNeeded = (score: number) => {
    const nextLevel = snakeLevelFromScore(score);
    if (nextLevel > levelRef.current) {
      levelRef.current = nextLevel;
      setDispLevel(nextLevel);
      setLevelPulse(true);
      window.setTimeout(() => setLevelPulse(false), 600);
    }
  };

  const update = () => {
    dirRef.current = { ...nextDirRef.current };
    const head = snakeRef.current[0];
    const COLS = colsRef.current, ROWS = rowsRef.current;
    // Wrap through walls: leave one side, appear on the opposite.
    const next: Point = {
      x: (head.x + dirRef.current.x + COLS) % COLS,
      y: (head.y + dirRef.current.y + ROWS) % ROWS,
    };

    const snake = snakeRef.current;
    for (let i = 0; i < snake.length - 1; i++) {
      if (snake[i].x === next.x && snake[i].y === next.y) { killSnake(); return; }
    }

    const newSnake = [next, ...snake];

    if (next.x === foodRef.current.x && next.y === foodRef.current.y) {
      scoreRef.current++;
      if (scoreRef.current > bestRef.current) {
        bestRef.current = scoreRef.current;
        saveScore('snake', bestRef.current);
        setDispBest(bestRef.current);
      }
      setDispScore(scoreRef.current);
      bumpLevelIfNeeded(scoreRef.current);
      placeFood();
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
  };

  const loop = (ts: number) => {
    if (!runningRef.current) return;
    if (ts - lastTickRef.current >= snakeTickMsForScore(scoreRef.current)) {
      lastTickRef.current = ts;
      update();
      if (!aliveRef.current) return;
    }
    render();
    rafRef.current = requestAnimationFrame(loop);
  };

  const killSnake = () => {
    aliveRef.current = false;
    runningRef.current = false;
    setPlaying(false);
    render();
    setOverlay({
      title: 'Game Over',
      sub: `Score ${scoreRef.current} · Level ${levelRef.current} · Best ${bestRef.current}`,
      titleColor: '#ef4444',
      btnText: 'Play Again',
    });
  };

  const startGame = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    const COLS = colsRef.current, ROWS = rowsRef.current;
    const sx = Math.floor(COLS / 2), sy = Math.floor(ROWS / 2);
    snakeRef.current = [{ x: sx, y: sy }, { x: sx-1, y: sy }, { x: sx-2, y: sy }];
    dirRef.current     = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    scoreRef.current   = 0;
    levelRef.current   = 1;
    aliveRef.current   = true;
    runningRef.current = true;
    setPlaying(true);
    lastTickRef.current= 0;
    setDispScore(0);
    setDispLevel(1);
    setLevelPulse(false);
    setOverlay({ title: '', sub: '', titleColor: '', btnText: '' });
    placeFood();
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const applyDir = (d: Dir) => {
    if (!aliveRef.current || !runningRef.current) return;
    const cur = dirRef.current;
    if (d.x === -cur.x && d.y === -cur.y) return;
    nextDirRef.current = d;
  };

  useEffect(() => {
    if (!loaded || !username) return;
    const DIR_MAP: Record<string, Dir> = {
      ArrowUp:{x:0,y:-1}, w:{x:0,y:-1}, W:{x:0,y:-1},
      ArrowDown:{x:0,y:1}, s:{x:0,y:1}, S:{x:0,y:1},
      ArrowLeft:{x:-1,y:0}, a:{x:-1,y:0}, A:{x:-1,y:0},
      ArrowRight:{x:1,y:0}, d:{x:1,y:0}, D:{x:1,y:0},
    };
    const handler = (e: KeyboardEvent) => {
      const d = DIR_MAP[e.key];
      if (d) { e.preventDefault(); applyDir(d); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [loaded, username]);

  useEffect(() => {
    if (!loaded || !username) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let tx0 = 0, ty0 = 0;
    const onStart = (e: TouchEvent) => { tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - tx0;
      const dy = e.changedTouches[0].clientY - ty0;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      applyDir(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? {x:1,y:0} : {x:-1,y:0}) : (dy > 0 ? {x:0,y:1} : {x:0,y:-1}));
    };
    canvas.addEventListener('touchstart', onStart, { passive: true });
    canvas.addEventListener('touchend', onEnd, { passive: true });
    return () => { canvas.removeEventListener('touchstart', onStart); canvas.removeEventListener('touchend', onEnd); };
  }, [loaded, username]);

  useEffect(() => {
    const onTheme = () => { if (canvasRef.current) render(); };
    const obs = new MutationObserver(onTheme);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  if (!loaded) return null;
  if (!username) return <UsernameGate onSubmit={setUsername} />;

  const showOverlay = overlay.title !== '';

  return (
    <>
      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Snake">
        <p style={{ marginBottom: '1rem' }}>
          Guide the snake to eat food and grow. Each <strong style={{ color: 'var(--ndl-text)' }}>{SNAKE_POINTS_PER_LEVEL} points</strong> advances you to the next <strong style={{ color: '#4ade80' }}>level</strong>, and the snake moves faster. Walls wrap — leave one side and you appear on the opposite.
        </p>
        <p style={{ fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.5rem' }}>Controls</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
          <li><strong style={{ color: 'var(--ndl-text)' }}>Arrow keys</strong> or <strong style={{ color: 'var(--ndl-text)' }}>W / A / S / D</strong> — change direction</li>
          <li><strong style={{ color: 'var(--ndl-text)' }}>D-pad buttons</strong> — on touch screens</li>
          <li><strong style={{ color: 'var(--ndl-text)' }}>Swipe on the canvas</strong> — also works on touch</li>
        </ul>
        <p style={{ fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.5rem' }}>Rules</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <li>You cannot instantly reverse direction (180°)</li>
          <li>Edges wrap: right ↔ left, top ↔ bottom</li>
          <li>Hitting your own <strong style={{ color: 'var(--ndl-text)' }}>tail</strong> ends the game</li>
          <li>Each food eaten = <strong style={{ color: '#4ade80' }}>+1 point</strong></li>
        </ul>
      </GameHelpModal>

      <GameHeader
        title="Snake"
        onHelp={() => setShowHelp(true)}
        stats={[
          { label: 'Score', value: dispScore },
          { label: 'Level', value: dispLevel, highlight: levelPulse },
          { label: 'Best', value: dispBest },
        ]}
      />

      <GamePageBody>
        <div className="flex flex-col items-center gap-5 sm:gap-6">
          <GameBoardFrame className="relative inline-block leading-none">
            <canvas ref={canvasRef} className="block w-full" style={{ background: 'var(--ndl-surface)' }} />
            {showOverlay && (
              <GameOverlay
                title={overlay.title}
                sub={overlay.sub}
                titleColor={overlay.titleColor}
                btnText={overlay.btnText}
                onAction={startGame}
              />
            )}
          </GameBoardFrame>

          {!showOverlay && playing && (
            <p className="text-xs font-medium tabular-nums" style={{ color: 'var(--ndl-faint)' }}>
              Level {dispLevel} · next level at {dispLevel * SNAKE_POINTS_PER_LEVEL} pts
            </p>
          )}

          <div
            className="dpad-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 52px)', gridTemplateRows: 'repeat(3, 52px)', gap: '6px' }}
          >
            <div />
            <DpadBtn onClick={() => applyDir({ x: 0, y: -1 })}>↑</DpadBtn>
            <div />
            <DpadBtn onClick={() => applyDir({ x: -1, y: 0 })}>←</DpadBtn>
            <div />
            <DpadBtn onClick={() => applyDir({ x: 1, y: 0 })}>→</DpadBtn>
            <div />
            <DpadBtn onClick={() => applyDir({ x: 0, y: 1 })}>↓</DpadBtn>
            <div />
          </div>

          <GameControlsRow
            items={[
              { key: '↑ ↓ ← →', label: 'Arrows' },
              { key: 'W A S D', label: 'Keys' },
            ]}
          />

          <GameSecondaryButton onClick={startGame}>New Game</GameSecondaryButton>
        </div>
      </GamePageBody>

      <style>{`
        @media (pointer: coarse) { .dpad-grid { display: grid !important; } }
        @media (pointer: fine)   { .dpad-grid { display: none !important; } }
      `}</style>
    </>
  );
}

function DpadBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onTouchStart={(e) => { e.preventDefault(); onClick(); }}
      onMouseDown={onClick}
      className="flex items-center justify-center text-xl cursor-pointer select-none rounded-xl transition-colors hover:opacity-90"
      style={{
        background: 'var(--ndl-surface-2)',
        border: '1px solid var(--ndl-border)',
        color: 'var(--ndl-muted)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}
