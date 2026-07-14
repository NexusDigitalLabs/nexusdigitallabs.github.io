'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import UsernameGate from './UsernameGate';
import GameHelpModal from './GameHelpModal';

const CELL = 20;

interface Point { x: number; y: number; }
interface Dir   { x: number; y: number; }

interface OverlayState {
  title: string;
  sub: string;
  titleColor: string;
  btnText: string;
}

export default function GameSnake() {
  const { username, setUsername, getHighScore, saveScore, loaded } = useGameState();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game loop refs (avoid stale closures in RAF)
  const snakeRef   = useRef<Point[]>([]);
  const dirRef     = useRef<Dir>({ x: 1, y: 0 });
  const nextDirRef = useRef<Dir>({ x: 1, y: 0 });
  const foodRef    = useRef<Point>({ x: 0, y: 0 });
  const scoreRef   = useRef(0);
  const bestRef    = useRef(0);
  const aliveRef   = useRef(false);
  const runningRef = useRef(false);
  const lastTickRef= useRef(0);
  const rafRef     = useRef<number | null>(null);
  const colsRef    = useRef(0);
  const rowsRef    = useRef(0);

  // UI state
  const [dispScore, setDispScore] = useState(0);
  const [dispBest,  setDispBest]  = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [overlay, setOverlay] = useState<OverlayState>({
    title: 'Snake',
    sub: 'Arrow keys, WASD, or D-pad to move',
    titleColor: '#0f172a',
    btnText: 'Start Game',
  });

  // Init canvas size and best score
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

    // Draw initial white canvas
    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size); }
  }, [loaded, username, getHighScore]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const COLS = colsRef.current, ROWS = rowsRef.current;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x*CELL,0); ctx.lineTo(x*CELL,H); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0,y*CELL); ctx.lineTo(W,y*CELL); ctx.stroke(); }

    // Food
    const f = foodRef.current;
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(f.x*CELL+2, f.y*CELL+2, CELL-4, CELL-4);
    ctx.fillStyle = '#86efac';
    ctx.fillRect(f.x*CELL+5, f.y*CELL+5, CELL-10, CELL-10);

    // Snake
    const snake = snakeRef.current;
    const dir   = dirRef.current;
    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      const isHead = i === 0;
      const t = 1 - (i / snake.length) * 0.35;
      if (isHead) {
        ctx.fillStyle = '#0f172a';
      } else {
        const v = Math.round(30 + (1-t)*60);
        ctx.fillStyle = `rgba(${v},${Math.round(41+(1-t)*60)},${Math.round(59+(1-t)*60)},1)`;
      }
      const pad = isHead ? 1 : 2;
      ctx.fillRect(seg.x*CELL+pad, seg.y*CELL+pad, CELL-pad*2, CELL-pad*2);

      if (isHead) {
        ctx.fillStyle = '#fff';
        const ex = seg.x*CELL, ey = seg.y*CELL;
        if (dir.x === 1)  { ctx.fillRect(ex+CELL-5,ey+3,3,3); ctx.fillRect(ex+CELL-5,ey+CELL-6,3,3); }
        if (dir.x === -1) { ctx.fillRect(ex+2,ey+3,3,3);       ctx.fillRect(ex+2,ey+CELL-6,3,3); }
        if (dir.y === -1) { ctx.fillRect(ex+3,ey+2,3,3);       ctx.fillRect(ex+CELL-6,ey+2,3,3); }
        if (dir.y === 1)  { ctx.fillRect(ex+3,ey+CELL-5,3,3);  ctx.fillRect(ex+CELL-6,ey+CELL-5,3,3); }
      }
    }
  };

  // ── Place food ────────────────────────────────────────────────────────────
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

  // ── Tick interval ─────────────────────────────────────────────────────────
  const tickInterval = () => Math.max(70, 150 - Math.floor(scoreRef.current / 5) * 8);

  // ── Update (called once per tick) ─────────────────────────────────────────
  const update = () => {
    dirRef.current = { ...nextDirRef.current };
    const head = snakeRef.current[0];
    const next: Point = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };
    const COLS = colsRef.current, ROWS = rowsRef.current;

    if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) { killSnake(); return; }
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
      placeFood();
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
  };

  // ── RAF loop ──────────────────────────────────────────────────────────────
  const loop = (ts: number) => {
    if (!runningRef.current) return;
    if (ts - lastTickRef.current >= tickInterval()) {
      lastTickRef.current = ts;
      update();
      if (!aliveRef.current) return;
    }
    render();
    rafRef.current = requestAnimationFrame(loop);
  };

  // ── Kill snake ────────────────────────────────────────────────────────────
  const killSnake = () => {
    aliveRef.current = false;
    runningRef.current = false;
    render();
    setOverlay({
      title: 'Game Over',
      sub: `Score: ${scoreRef.current} · Best: ${bestRef.current}`,
      titleColor: '#ef4444',
      btnText: 'Play Again',
    });
  };

  // ── Start game ────────────────────────────────────────────────────────────
  const startGame = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    const COLS = colsRef.current, ROWS = rowsRef.current;
    const sx = Math.floor(COLS / 2), sy = Math.floor(ROWS / 2);
    snakeRef.current = [{ x: sx, y: sy }, { x: sx-1, y: sy }, { x: sx-2, y: sy }];
    dirRef.current     = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    scoreRef.current   = 0;
    aliveRef.current   = true;
    runningRef.current = true;
    lastTickRef.current= 0;
    setDispScore(0);
    setOverlay({ title: '', sub: '', titleColor: '', btnText: '' });
    placeFood();
    rafRef.current = requestAnimationFrame(loop);
  };

  // ── Cleanup RAF on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // ── Keyboard + D-pad input ────────────────────────────────────────────────
  const applyDir = (d: Dir) => {
    if (!aliveRef.current || !runningRef.current) return;
    const cur = dirRef.current;
    if (d.x === -cur.x && d.y === -cur.y) return; // prevent 180°
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

  // ── Touch swipe on canvas ─────────────────────────────────────────────────
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

  if (!loaded) return null;
  if (!username) return <UsernameGate onSubmit={setUsername} />;

  const slbl = 'text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-slate-400';
  const showOverlay = overlay.title !== '';

  return (
    <>
      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Snake">
        <p style={{ marginBottom: '1rem' }}>
          Guide the snake to eat food and grow longer. The game ends if you hit a <strong>wall</strong> or your own <strong>tail</strong>. Every food item you eat increases your score and the snake speeds up slightly.
        </p>
        <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Controls</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
          <li><strong>Arrow keys</strong> or <strong>W / A / S / D</strong> — change direction</li>
          <li><strong>D-pad</strong> — on touch screens (shown automatically)</li>
          <li><strong>Swipe on canvas</strong> — also works on touch</li>
        </ul>
        <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Rules</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <li>You cannot reverse direction (180°) instantly</li>
          <li>The snake wraps — no wait, it doesn&apos;t: hitting the wall ends the game</li>
          <li>Each food eaten = +1 point and the snake grows by one segment</li>
        </ul>
      </GameHelpModal>

      <div style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
        <div className="max-w-lg mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/games/" className={`${slbl} hover:text-slate-600 transition-colors no-underline`}>← Games</Link>
              <h1 className="text-xl font-bold text-slate-900 mt-1">Snake</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                title="How to play"
                style={{
                  border: '1px solid #e2e8f0', background: '#fff',
                  width: '36px', height: '36px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.875rem', fontWeight: 700, color: '#64748b',
                }}
              >
                ?
              </button>
              {[{ label: 'Score', val: dispScore }, { label: 'Best', val: dispBest }].map(({ label, val }) => (
                <div key={label} style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '0.5rem 1rem', textAlign: 'center', minWidth: '80px' }}>
                  <div className="text-[0.5625rem] font-bold tracking-[0.1em] uppercase text-slate-400">{label}</div>
                  <div className="text-xl font-extrabold text-slate-900 leading-tight">{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 flex flex-col items-center gap-6">
        {/* Canvas */}
        <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
          <canvas ref={canvasRef} style={{ display: 'block', border: '1px solid #e2e8f0', background: '#fff' }} />
          {showOverlay && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.94)', zIndex: 5 }}>
              <p className="text-xl font-bold mb-1" style={{ color: overlay.titleColor || '#0f172a' }}>{overlay.title}</p>
              <p className="text-sm text-slate-400 font-light mb-6">{overlay.sub}</p>
              <button
                onClick={startGame}
                type="button"
                className="text-xs font-bold tracking-[0.07em] uppercase text-white border-none cursor-pointer hover:bg-slate-700 transition-colors"
                style={{ background: '#0f172a', padding: '0.625rem 1.75rem' }}
              >
                {overlay.btnText || 'Start Game'}
              </button>
            </div>
          )}
        </div>

        {/* D-pad (touch devices) */}
        <div
          className="hidden"
          style={{ display: 'none' }}
          id="dpad-container"
        >
          {/* Shown via CSS for pointer:coarse in globals.css or inline */}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 48px)',
            gridTemplateRows: 'repeat(3, 48px)',
            gap: '4px',
          }}
          className="dpad-grid"
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

        {/* Keyboard hint */}
        <div className="hidden sm:flex gap-3 items-center flex-wrap justify-center">
          <span className={slbl}>Controls:</span>
          <span className="text-[0.6875rem] font-semibold text-slate-500 px-2 py-1" style={{ border: '1px solid #e2e8f0', background: '#fff' }}>↑ ↓ ← →</span>
          <span className="text-xs text-slate-400">or</span>
          <span className="text-[0.6875rem] font-semibold text-slate-500 px-2 py-1" style={{ border: '1px solid #e2e8f0', background: '#fff' }}>W A S D</span>
        </div>

        <button
          onClick={startGame}
          type="button"
          className="text-[0.6875rem] font-bold tracking-[0.07em] uppercase cursor-pointer transition-colors hover:bg-slate-50"
          style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '0.5rem 1rem' }}
        >
          New Game
        </button>
      </div>

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
      className="flex items-center justify-center text-xl cursor-pointer select-none"
      style={{ background: '#fff', border: '1px solid #e2e8f0', WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
    </button>
  );
}
