'use client';

import { useRef, useState, type PointerEvent, type SVGProps } from 'react';
import type { Level } from '@/lib/games/little-learners';
import {
  BRUSH,
  DOT_FIGURES,
  LINE_FIGURES,
  SCRIBBLE_DONE,
  SCRIBBLE_FIGURES,
  SCRIBBLE_H,
  SCRIBBLE_W,
  TRACE_DONE,
  TRACE_FIGURES,
  TRACE_TOLERANCE,
  appendSegs,
  dist,
  dotLabels,
  insideRegion,
  interpolate,
  markCovered,
  nearestDistance,
  pathStarts,
  regionCells,
  type DotFigure,
  type DrawRound,
  type Pt,
  type Region,
  type ScribbleFigure,
  type Seg,
  type TraceFigure,
} from '@/lib/games/little-learners-draw';

export type DrawHandlers = {
  /** The figure is finished — the parent awards a star and moves on. */
  onWin: () => void;
  /** A gentle "try again" message (shown in red, spoken kindly). */
  onOops: (text: string) => void;
  /** A soft pop, optionally saying a short word (e.g. the dot number). */
  onPop: (word?: string) => void;
};

type Props = DrawHandlers & { round: DrawRound; level: Level; onNext: () => void };

/** Repeated off-line or outside-the-box strokes only get one nudge every few seconds. */
const OOPS_GAP_MS = 2800;
const INK = '#2563eb';
const OFF_INK = '#dc2626';
const CRAYONS = [
  { name: 'red', color: '#ef4444' },
  { name: 'orange', color: '#f97316' },
  { name: 'yellow', color: '#facc15' },
  { name: 'green', color: '#22c55e' },
  { name: 'blue', color: '#3b82f6' },
  { name: 'purple', color: '#a855f7' },
];

function toPoint(e: PointerEvent<SVGSVGElement>, w: number, h: number): Pt {
  const r = e.currentTarget.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * w, y: ((e.clientY - r.top) / r.height) * h };
}

const segD = (pts: Pt[]) => {
  const [first, ...rest] = pts;
  // A single tap becomes a zero-length line, which round caps draw as a dot.
  const tail = rest.length ? rest : [first];
  return `M${first.x.toFixed(1)} ${first.y.toFixed(1)}${tail.map((p) => ` L${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('')}`;
};

function useOops(onOops: (text: string) => void) {
  const last = useRef(0);
  return (text: string) => {
    const now = Date.now();
    if (now - last.current < OOPS_GAP_MS) return false;
    last.current = now;
    onOops(text);
    return true;
  };
}

// ---------- trace (lines, patterns, shapes, numbers) ----------

function TraceBoard({ figure, level, onWin, onOops }: { figure: TraceFigure; level: Level } & DrawHandlers) {
  const pathRef = useRef<SVGPathElement>(null);
  const samples = useRef<Pt[] | null>(null);
  const covered = useRef<boolean[]>([]);
  const last = useRef<Pt | null>(null);
  const drawing = useRef(false);
  const [segs, setSegs] = useState<Seg[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const oops = useOops(onOops);
  const { w, h, d } = figure;
  const tol = (TRACE_TOLERANCE[level] * h) / 100;
  const starts = pathStarts(d);

  const getSamples = () => {
    if (!samples.current && pathRef.current) {
      const path = pathRef.current;
      const len = path.getTotalLength();
      const n = Math.ceil(len / 2);
      samples.current = Array.from({ length: n + 1 }, (_, i) => {
        const p = path.getPointAtLength((len * i) / n);
        return { x: p.x, y: p.y };
      });
      covered.current = samples.current.map(() => false);
    }
    return samples.current ?? [];
  };

  const add = (p: Pt, newStroke: boolean) => {
    const s = getSamples();
    const from = newStroke ? null : last.current;
    const pts = from ? interpolate(from, p) : [p];
    const items = pts.map((q) => {
      const off = nearestDistance(q, s) > tol * 1.5;
      if (!off) markCovered(s, covered.current, q, tol);
      return { p: q, off };
    });
    last.current = p;
    setSegs((prev) => appendSegs(prev, items, from));
    if (items.some((it) => it.off)) oops("Oops! Let's stay on the dotted line.");

    const ratio = s.length ? covered.current.filter(Boolean).length / s.length : 0;
    setProgress(ratio);
    if (ratio >= TRACE_DONE && !done) {
      setDone(true);
      drawing.current = false;
      onWin();
    }
  };

  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (done) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    add(toPoint(e, w, h), true);
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (drawing.current && !done) add(toPoint(e, w, h), false);
  };
  const up = () => {
    drawing.current = false;
    last.current = null;
  };

  const inkWidth = h * 0.055;
  return (
    <>
      <svg
        className={`lld-board${done ? ' is-done' : ''}`}
        viewBox={`0 0 ${w} ${h}`}
        style={{ aspectRatio: `${w} / ${h}` }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        role="img"
        aria-label={`Dotted ${figure.name} to trace with your finger`}
      >
        <path d={d} fill="none" stroke="#eef2ff" strokeWidth={tol * 2} strokeLinecap="round" strokeLinejoin="round" />
        <path
          ref={pathRef}
          d={d}
          fill="none"
          stroke={done ? '#16a34a' : '#94a3b8'}
          strokeWidth={h * 0.025}
          strokeDasharray={done ? undefined : `${h * 0.05} ${h * 0.06}`}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {segs.map((s, i) => (
          <path
            key={i}
            d={segD(s.pts)}
            fill="none"
            stroke={s.off ? OFF_INK : INK}
            strokeOpacity={s.off ? 0.75 : 0.9}
            strokeWidth={inkWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {!done &&
          starts.map((s, i) => (
            <g key={i} className="lld-start" pointerEvents="none">
              <circle cx={s.x} cy={s.y} r={h * 0.07} className="lld-start-ring" />
              <circle cx={s.x} cy={s.y} r={h * 0.05} fill="#22c55e" stroke="#fff" strokeWidth={h * 0.012} />
            </g>
          ))}
      </svg>
      <Progress value={progress / TRACE_DONE} />
    </>
  );
}

// ---------- dot to dot ----------

const HIT = 9;

function DotBoard({ figure, level, onWin, onOops, onPop }: { figure: DotFigure; level: Level } & DrawHandlers) {
  const { points } = figure;
  const n = points.length;
  const [next, setNext] = useState(0);
  const [wrong, setWrong] = useState<{ dot: number; key: number } | null>(null);
  const [pointer, setPointer] = useState<Pt | null>(null);
  const [misses, setMisses] = useState(0);
  const drawing = useRef(false);
  /** The wrong dot under the finger, so dragging across it only nudges once. */
  const overWrong = useRef<number | null>(null);
  const done = next >= n;

  const hitDot = (p: Pt) => {
    let best = -1;
    let bestD = HIT;
    points.forEach(([x, y], i) => {
      const dd = dist(p, { x, y });
      if (dd <= bestD) {
        best = i;
        bestD = dd;
      }
    });
    return best;
  };

  const handle = (p: Pt) => {
    const i = hitDot(p);
    if (i < 0 || i < next) {
      if (i < 0) overWrong.current = null;
      return;
    }
    if (i === next) {
      overWrong.current = null;
      const reached = i + 1;
      setNext(reached);
      if (reached === n) {
        drawing.current = false;
        setPointer(null);
        onWin();
      } else {
        onPop(String(reached));
      }
      return;
    }
    if (overWrong.current === i) return;
    overWrong.current = i;
    setWrong((w) => ({ dot: i, key: (w?.key ?? 0) + 1 }));
    setMisses((m) => m + 1);
    onOops(next === 0 ? `That's ${i + 1}! Let's start at number 1.` : `That's ${i + 1}! Can you find ${next + 1}?`);
  };

  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (done) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    overWrong.current = null;
    const p = toPoint(e, 100, 100);
    setPointer(p);
    handle(p);
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (!drawing.current || done) return;
    const p = toPoint(e, 100, 100);
    setPointer(p);
    handle(p);
  };
  const up = () => {
    drawing.current = false;
    setPointer(null);
  };

  const joined = points.slice(0, next);
  if (done && figure.closed) joined.push(points[0]);
  const lineStr = joined.map(([x, y]) => `${x},${y}`).join(' ');
  const cx = points.reduce((s, p) => s + p[0], 0) / n;
  const cy = points.reduce((s, p) => s + p[1], 0) / n + (n === 2 ? -22 : 0);
  // Toddlers always see where to go next; older children only after a miss.
  const showHint = !done && (level === 'little' || misses > 0);
  const labels = dotLabels(points, figure.closed);

  return (
    <svg
      className={`lld-board${done ? ' is-done' : ''}`}
      viewBox="0 0 100 100"
      style={{ aspectRatio: '1 / 1' }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      role="img"
      aria-label={`${n} numbered dots to join in order`}
    >
      {done && figure.closed && (
        <polygon className="lld-reveal" points={lineStr} fill={figure.fill} fillOpacity={0.85} />
      )}
      {joined.length > 1 && (
        <polyline points={lineStr} fill="none" stroke={done ? figure.fill : INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {pointer && next > 0 && !done && (
        <line
          x1={points[next - 1][0]}
          y1={points[next - 1][1]}
          x2={pointer.x}
          y2={pointer.y}
          stroke={INK}
          strokeOpacity={0.5}
          strokeWidth={2.5}
          strokeDasharray="3 3"
          strokeLinecap="round"
          pointerEvents="none"
        />
      )}
      {points.map(([x, y], i) => {
        const label = labels[i];
        const isWrong = wrong?.dot === i && i >= next;
        const isNext = i === next && showHint;
        return (
          <g key={isWrong ? `${i}-${wrong.key}` : i} className={isWrong ? 'lld-dot-wrong' : undefined} pointerEvents="none">
            {isNext && <circle cx={x} cy={y} r={7} className="lld-next-ring" />}
            <circle
              cx={x}
              cy={y}
              r={i < next ? 3.6 : 4.2}
              fill={isWrong ? OFF_INK : i < next ? (done ? figure.fill : INK) : '#334155'}
              stroke="#fff"
              strokeWidth={1.2}
            />
            <text x={label.x} y={label.y} className={`lld-num${isWrong ? ' is-wrong' : ''}`} textAnchor="middle" dominantBaseline="central">
              {i + 1}
            </text>
          </g>
        );
      })}
      {done && (
        <text x={cx} y={cy} className="lld-reveal-emoji" textAnchor="middle" dominantBaseline="central">
          {figure.emoji}
        </text>
      )}
    </svg>
  );
}

// ---------- colour inside (controlled scribbling) ----------

function RegionShape({ region, ...rest }: { region: Region } & SVGProps<SVGRectElement & SVGCircleElement>) {
  return region.kind === 'rect' ? (
    <rect x={region.x} y={region.y} width={region.w} height={region.h} rx={6} {...rest} />
  ) : (
    <circle cx={region.cx} cy={region.cy} r={region.r} {...rest} />
  );
}

function ScribbleBoard({ figure, level, onWin, onOops, onPop }: { figure: ScribbleFigure; level: Level } & DrawHandlers) {
  const [cells] = useState(() => regionCells(figure.region));
  const painted = useRef<boolean[]>(cells.map(() => false));
  const last = useRef<Pt | null>(null);
  const drawing = useRef(false);
  const [segs, setSegs] = useState<Seg[]>([]);
  const [crayon, setCrayon] = useState(CRAYONS[4].color);
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState(0);
  const [done, setDone] = useState(false);
  const oops = useOops(onOops);
  const goal = SCRIBBLE_DONE[level];

  const add = (p: Pt, newStroke: boolean) => {
    const from = newStroke ? null : last.current;
    const pts = from ? interpolate(from, p) : [p];
    const items = pts.map((q) => {
      const off = !insideRegion(figure.region, q, 3);
      if (!off) markCovered(cells, painted.current, q, BRUSH);
      return { p: q, off };
    });
    last.current = p;
    setSegs((prev) => appendSegs(prev, items, from, crayon));
    if (items.some((it) => it.off) && oops(`Oops! Let's keep the crayon inside the ${figure.name}.`)) setFlash((f) => f + 1);

    const ratio = painted.current.filter(Boolean).length / cells.length;
    setProgress(ratio);
    if (ratio >= goal && !done) {
      setDone(true);
      drawing.current = false;
      onWin();
    }
  };

  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (done) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    add(toPoint(e, SCRIBBLE_W, SCRIBBLE_H), true);
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (drawing.current && !done) add(toPoint(e, SCRIBBLE_W, SCRIBBLE_H), false);
  };
  const up = () => {
    drawing.current = false;
    last.current = null;
  };

  return (
    <>
      <svg
        className={`lld-board${done ? ' is-done' : ''}`}
        viewBox={`0 0 ${SCRIBBLE_W} ${SCRIBBLE_H}`}
        style={{ aspectRatio: `${SCRIBBLE_W} / ${SCRIBBLE_H}` }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        role="img"
        aria-label={`A ${figure.name} to colour in`}
      >
        <RegionShape region={figure.region} fill="#fff" />
        {segs.map((s, i) => (
          <path
            key={i}
            d={segD(s.pts)}
            fill="none"
            stroke={s.color}
            strokeOpacity={s.off ? 0.3 : 0.9}
            strokeWidth={BRUSH * 1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        <RegionShape
          key={flash}
          region={figure.region}
          fill="none"
          stroke={done ? '#16a34a' : '#475569'}
          strokeWidth={3}
          strokeDasharray={done ? undefined : '7 6'}
          className={flash ? 'lld-edge-flash' : undefined}
          pointerEvents="none"
        />
      </svg>
      <div className="lld-crayons" role="radiogroup" aria-label="Pick a crayon">
        {CRAYONS.map((c) => (
          <button
            key={c.color}
            type="button"
            role="radio"
            aria-checked={crayon === c.color}
            aria-label={c.name}
            className={`lld-crayon${crayon === c.color ? ' is-on' : ''}`}
            style={{ background: c.color }}
            onClick={() => {
              setCrayon(c.color);
              onPop(c.name);
            }}
          />
        ))}
      </div>
      <Progress value={progress / goal} />
    </>
  );
}

function Progress({ value }: { value: number }) {
  const pct = Math.round(Math.min(1, value) * 100);
  return (
    <div className="lld-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="How much is done">
      <span style={{ width: `${pct}%` }} />
      <b aria-hidden="true">{pct >= 100 ? '⭐' : '☆'}</b>
    </div>
  );
}

// ---------- wrapper ----------

export default function LittleLearnersDraw({ round, level, onNext, ...handlers }: Props) {
  /** "Start again" remounts the board with a clean slate. */
  const [attempt, setAttempt] = useState(0);
  const board = (() => {
    switch (round.activity) {
      case 'dots': {
        const f = DOT_FIGURES.find((x) => x.id === round.figureId)!;
        return <DotBoard key={attempt} figure={f} level={level} {...handlers} />;
      }
      case 'lines':
      case 'trace': {
        const f = [...LINE_FIGURES, ...TRACE_FIGURES].find((x) => x.id === round.figureId)!;
        return <TraceBoard key={attempt} figure={f} level={level} {...handlers} />;
      }
      case 'scribble': {
        const f = SCRIBBLE_FIGURES.find((x) => x.id === round.figureId)!;
        return <ScribbleBoard key={attempt} figure={f} level={level} {...handlers} />;
      }
    }
  })();

  return (
    <div className="lld-root">
      <style>{CSS}</style>
      <div className={`lld-frame is-${round.activity}`}>{board}</div>
      <div className="lld-actions">
        <button type="button" className="lld-btn" onClick={() => setAttempt((a) => a + 1)}>
          ↺ Start again
        </button>
        <button type="button" className="lld-btn is-next" onClick={onNext}>
          Next ➜
        </button>
      </div>
    </div>
  );
}

const CSS = `
.lld-root { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.lld-frame { width: 100%; background: #fff; border-radius: 28px; border: 4px solid #e5e7eb; box-shadow: 0 6px 0 rgba(0,0,0,.06); padding: 10px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
/* Keep the whole board (plus crayons) on screen: each board's width is capped by the viewport height. */
.lld-frame.is-dots .lld-board, .lld-frame.is-trace .lld-board { width: min(100%, 52vh); }
.lld-frame.is-lines .lld-board { width: min(100%, 104vh); }
.lld-frame.is-scribble .lld-board { width: min(100%, 66vh); }
.lld-board { display: block; touch-action: none; user-select: none; -webkit-user-select: none; cursor: crosshair; border-radius: 18px; background: #fffdf7; }
.lld-board.is-done { animation: lld-pop .5s ease; }
.lld-board text { font-family: inherit; }
.lld-num { font-size: 7px; font-weight: 900; fill: #334155; }
.lld-num.is-wrong { fill: #dc2626; }
.lld-dot-wrong { animation: lld-wiggle .5s ease; transform-box: fill-box; transform-origin: center; }
.lld-next-ring { fill: rgba(250,204,21,.35); stroke: #f59e0b; stroke-width: 1.2; animation: lld-pulse 1.1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.lld-start-ring { fill: rgba(34,197,94,.25); animation: lld-pulse 1.1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.lld-reveal { animation: lld-fade .6s ease; }
.lld-reveal-emoji { font-size: 26px; animation: lld-pop .6s ease; transform-box: fill-box; transform-origin: center; }
.lld-edge-flash { animation: lld-edge 1.2s ease; }

.lld-crayons { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.lld-crayon { width: 44px; height: 44px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 0 0 2px #e5e7eb, 0 3px 0 rgba(0,0,0,.15); transition: transform .12s; }
.lld-crayon.is-on { transform: scale(1.18); box-shadow: 0 0 0 3px #1f2937, 0 3px 0 rgba(0,0,0,.15); }

.lld-progress { position: relative; width: min(100%, 360px); height: 18px; border-radius: 999px; background: #f3f4f6; overflow: visible; }
.lld-progress span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #86efac, #22c55e); transition: width .2s; }
.lld-progress b { position: absolute; right: -6px; top: 50%; transform: translate(50%, -50%); font-size: 1.4rem; color: #f59e0b; }

.lld-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.lld-btn { border: 3px solid #e5e7eb; background: #fff; color: #1f2937; border-radius: 999px; padding: 10px 20px; font-weight: 800; font-size: 1.05rem; box-shadow: 0 4px 0 #e5e7eb; }
.lld-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 #e5e7eb; }
.lld-btn.is-next { border-color: #fcd34d; background: #fef3c7; color: #92400e; box-shadow: 0 4px 0 #fcd34d; }

@keyframes lld-pulse { 0%,100% { transform: scale(.85); opacity: .9; } 50% { transform: scale(1.25); opacity: .5; } }
@keyframes lld-wiggle { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 50% { transform: translateX(2px); } 75% { transform: translateX(-1px); } }
@keyframes lld-pop { 0% { transform: scale(.96); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }
@keyframes lld-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes lld-edge { 0%, 60% { stroke: #dc2626; stroke-width: 5px; } 100% { stroke: #475569; } }
@media (prefers-reduced-motion: reduce) {
  .lld-root *, .lld-root *::before, .lld-root *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition: none !important; }
}
`;
