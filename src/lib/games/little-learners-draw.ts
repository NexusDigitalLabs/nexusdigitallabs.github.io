/**
 * Little Learners — pre-writing activities: dot-to-dot, tracing lines and patterns,
 * tracing shapes and numbers, and colouring inside a shape (controlled scribbling).
 * Pure data + geometry; the board UI lives in src/components/games/LittleLearnersDraw.tsx.
 */

import { NUMBER_WORDS, type Level, type Rng } from './little-learners';

export type DrawActivity = 'dots' | 'lines' | 'trace' | 'scribble';
export const DRAW_ACTIVITIES: readonly DrawActivity[] = ['dots', 'lines', 'trace', 'scribble'];

export type Pt = { x: number; y: number };

/** A dashed path to follow. `d` is SVG path data inside a `w`×`h` viewBox. */
export type TraceFigure = { id: string; name: string; d: string; w: number; h: number; levels: Level[] };

/** Numbered dots in a 100×100 viewBox, joined in order (and back to 1 when `closed`). */
export type DotFigure = {
  id: string;
  name: string;
  emoji: string;
  fill: string;
  points: [number, number][];
  closed: boolean;
  levels: Level[];
};

export type Region =
  | { kind: 'rect'; x: number; y: number; w: number; h: number }
  | { kind: 'circle'; cx: number; cy: number; r: number };

/** A shape to colour in, in a 200×150 viewBox. */
export type ScribbleFigure = { id: string; name: string; region: Region; levels: Level[] };

export const SCRIBBLE_W = 200;
export const SCRIBBLE_H = 150;

const L: Level[] = ['little'];
const B: Level[] = ['big'];
const LB: Level[] = ['little', 'big'];

export const LINE_FIGURES: readonly TraceFigure[] = [
  { id: 'straight', name: 'straight line', d: 'M20 50 L180 50', w: 200, h: 100, levels: L },
  { id: 'standing', name: 'standing lines', d: 'M45 15 L45 85 M100 15 L100 85 M155 15 L155 85', w: 200, h: 100, levels: L },
  { id: 'slant', name: 'slanting line', d: 'M30 85 L170 15', w: 200, h: 100, levels: L },
  { id: 'rainbow', name: 'rainbow curve', d: 'M25 85 Q100 -15 175 85', w: 200, h: 100, levels: LB },
  { id: 'waves', name: 'wavy line', d: 'M20 55 Q40 15 60 55 T100 55 T140 55 T180 55', w: 200, h: 100, levels: LB },
  { id: 'zigzag', name: 'zigzag line', d: 'M20 75 L50 25 L80 75 L110 25 L140 75 L170 25', w: 200, h: 100, levels: B },
  {
    id: 'hills',
    name: 'bumpy hills',
    d: 'M20 80 C20 25 60 25 60 80 C60 25 100 25 100 80 C100 25 140 25 140 80 C140 25 180 25 180 80',
    w: 200,
    h: 100,
    levels: B,
  },
  {
    id: 'steps',
    name: 'castle line',
    d: 'M15 75 L15 30 L50 30 L50 75 L85 75 L85 30 L120 30 L120 75 L155 75 L155 30 L190 30',
    w: 200,
    h: 100,
    levels: B,
  },
  {
    id: 'loops',
    name: 'loopy line',
    d: 'M15 70 C45 70 62 22 45 22 C28 22 45 70 75 70 C105 70 122 22 105 22 C88 22 105 70 135 70 C165 70 182 22 165 22 C148 22 165 70 190 70',
    w: 200,
    h: 100,
    levels: B,
  },
];

function starPath(cx: number, cy: number, outer: number, inner: number): [number, number][] {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return [Math.round((cx + r * Math.cos(a)) * 10) / 10, Math.round((cy + r * Math.sin(a)) * 10) / 10];
  });
}

const polyD = (pts: [number, number][]) => `M${pts.map(([x, y]) => `${x} ${y}`).join(' L')} Z`;

/** Single-stroke numerals and outline shapes, each in a 100×100 viewBox. */
export const TRACE_FIGURES: readonly TraceFigure[] = [
  { id: 'circle', name: 'circle', d: 'M50 12 A38 38 0 1 1 49.9 12', w: 100, h: 100, levels: LB },
  { id: 'square', name: 'square', d: 'M18 18 L82 18 L82 82 L18 82 Z', w: 100, h: 100, levels: LB },
  { id: 'triangle', name: 'triangle', d: 'M50 12 L88 85 L12 85 Z', w: 100, h: 100, levels: LB },
  { id: 'star', name: 'star', d: polyD(starPath(50, 54, 42, 18)), w: 100, h: 100, levels: B },
  {
    id: 'heart',
    name: 'heart',
    d: 'M50 88 C20 66 4 46 17 26 C29 9 47 13 50 30 C53 13 71 9 83 26 C96 46 80 66 50 88 Z',
    w: 100,
    h: 100,
    levels: B,
  },
  { id: '0', name: 'number 0', d: 'M50 14 C26 14 24 40 24 50 C24 60 26 86 50 86 C74 86 76 60 76 50 C76 40 74 14 50 14', w: 100, h: 100, levels: B },
  { id: '1', name: 'number 1', d: 'M36 26 L52 14 L52 86', w: 100, h: 100, levels: LB },
  { id: '2', name: 'number 2', d: 'M28 32 C30 10 72 10 72 34 C72 52 32 68 28 86 L74 86', w: 100, h: 100, levels: LB },
  {
    id: '3',
    name: 'number 3',
    d: 'M30 24 C44 8 72 14 70 33 C68 46 54 49 46 50 C62 50 74 58 72 70 C70 88 40 92 28 78',
    w: 100,
    h: 100,
    levels: LB,
  },
  { id: '4', name: 'number 4', d: 'M62 86 L62 14 L24 62 L78 62', w: 100, h: 100, levels: LB },
  { id: '5', name: 'number 5', d: 'M70 15 L35 15 L32 46 C50 36 74 44 72 64 C70 86 42 90 28 78', w: 100, h: 100, levels: LB },
  { id: '6', name: 'number 6', d: 'M66 18 C40 10 28 40 30 62 C32 84 66 88 69 66 C71 48 44 44 31 60', w: 100, h: 100, levels: B },
  { id: '7', name: 'number 7', d: 'M26 15 L74 15 L42 86', w: 100, h: 100, levels: B },
  {
    id: '8',
    name: 'number 8',
    d: 'M50 50 C30 42 30 14 50 14 C70 14 70 42 50 50 C26 58 26 86 50 86 C74 86 74 58 50 50',
    w: 100,
    h: 100,
    levels: B,
  },
  { id: '9', name: 'number 9', d: 'M68 34 C68 12 32 12 32 34 C32 54 66 54 68 34 L68 86', w: 100, h: 100, levels: B },
];

export const DOT_FIGURES: readonly DotFigure[] = [
  { id: 'line', name: 'straight line', emoji: '📏', fill: '#3b82f6', points: [[18, 50], [82, 50]], closed: false, levels: L },
  { id: 'mountain', name: 'mountain', emoji: '⛰️', fill: '#22c55e', points: [[14, 82], [50, 18], [86, 82]], closed: false, levels: L },
  { id: 'triangle', name: 'triangle', emoji: '🔺', fill: '#f97316', points: [[50, 14], [86, 82], [14, 82]], closed: true, levels: L },
  { id: 'square', name: 'square', emoji: '🟦', fill: '#3b82f6', points: [[20, 20], [80, 20], [80, 80], [20, 80]], closed: true, levels: L },
  { id: 'house', name: 'house', emoji: '🏠', fill: '#ef4444', points: [[22, 88], [22, 45], [50, 15], [78, 45], [78, 88]], closed: true, levels: L },
  { id: 'star', name: 'star', emoji: '⭐', fill: '#eab308', points: starPath(50, 54, 44, 19), closed: true, levels: B },
  {
    id: 'heart',
    name: 'heart',
    emoji: '❤️',
    fill: '#ec4899',
    points: [[50, 88], [16, 56], [12, 30], [30, 14], [50, 28], [70, 14], [88, 30], [84, 56]],
    closed: true,
    levels: B,
  },
  {
    id: 'fish',
    name: 'fish',
    emoji: '🐟',
    fill: '#06b6d4',
    points: [[8, 24], [30, 42], [52, 24], [78, 30], [94, 50], [78, 70], [52, 76], [30, 58], [8, 76]],
    closed: true,
    levels: B,
  },
  {
    id: 'boat',
    name: 'sail boat',
    emoji: '⛵',
    fill: '#a855f7',
    points: [[8, 60], [42, 60], [42, 8], [74, 60], [92, 60], [76, 88], [24, 88]],
    closed: true,
    levels: B,
  },
  {
    id: 'house-chimney',
    name: 'house',
    emoji: '🏡',
    fill: '#f97316',
    points: [[18, 92], [18, 50], [50, 16], [59, 26], [59, 7], [73, 7], [73, 40], [82, 50], [82, 92]],
    closed: true,
    levels: B,
  },
];

export const SCRIBBLE_FIGURES: readonly ScribbleFigure[] = [
  { id: 'big-box', name: 'box', region: { kind: 'rect', x: 25, y: 15, w: 150, h: 120 }, levels: L },
  { id: 'big-circle', name: 'circle', region: { kind: 'circle', cx: 100, cy: 75, r: 62 }, levels: L },
  { id: 'box', name: 'box', region: { kind: 'rect', x: 55, y: 30, w: 90, h: 90 }, levels: B },
  { id: 'circle', name: 'circle', region: { kind: 'circle', cx: 100, cy: 75, r: 46 }, levels: B },
  { id: 'tall-box', name: 'tall box', region: { kind: 'rect', x: 72, y: 12, w: 56, h: 126 }, levels: B },
];

/** Fraction of the dashed path that must be covered to finish a trace. */
export const TRACE_DONE = 0.85;
/** Fraction of a shape that must be coloured to finish a scribble. */
export const SCRIBBLE_DONE: Record<Level, number> = { little: 0.55, big: 0.7 };
/** How far (viewBox units, out of 100 tall) a finger may stray and still count as on the line. */
export const TRACE_TOLERANCE: Record<Level, number> = { little: 12, big: 9 };
/** Crayon radius used to paint scribble cells. */
export const BRUSH = 9;
const CELL = 8;

export type DrawRound = {
  activity: DrawActivity;
  /** Bumped every round so the board remounts with fresh state. */
  key: number;
  figureId: string;
  prompt: string;
  say: string;
};

let roundKey = 0;

function pick<T extends { id: string; levels: Level[] }>(items: readonly T[], level: Level, rng: Rng, previousId?: string): T {
  const pool = items.filter((f) => f.levels.includes(level) && f.id !== previousId);
  return pool[Math.floor(rng() * pool.length)];
}

export function drawFigures(activity: DrawActivity): readonly { id: string; levels: Level[] }[] {
  return { dots: DOT_FIGURES, lines: LINE_FIGURES, trace: TRACE_FIGURES, scribble: SCRIBBLE_FIGURES }[activity];
}

const spokenName = (name: string) => name.replace(/\d+/, (n) => NUMBER_WORDS[Number(n)] ?? n);

export function generateDrawRound(activity: DrawActivity, level: Level, rng: Rng = Math.random, previousId?: string): DrawRound {
  roundKey++;
  switch (activity) {
    case 'dots': {
      const f = pick(DOT_FIGURES, level, rng, previousId);
      const n = f.points.length;
      return {
        activity,
        key: roundKey,
        figureId: f.id,
        prompt: `Join the dots 1 to ${n}`,
        say: `Join the dots, from one to ${NUMBER_WORDS[n] ?? n}. Start at number one!`,
      };
    }
    case 'lines': {
      const f = pick(LINE_FIGURES, level, rng, previousId);
      return { activity, key: roundKey, figureId: f.id, prompt: `Trace the ${f.name}`, say: `Trace the ${f.name}. Start at the green dot!` };
    }
    case 'trace': {
      const f = pick(TRACE_FIGURES, level, rng, previousId);
      return {
        activity,
        key: roundKey,
        figureId: f.id,
        prompt: `Trace the ${f.name}`,
        say: `Let's trace the ${spokenName(f.name)}. Start at the green dot!`,
      };
    }
    case 'scribble': {
      const f = pick(SCRIBBLE_FIGURES, level, rng, previousId);
      return {
        activity,
        key: roundKey,
        figureId: f.id,
        prompt: `Colour inside the ${f.name}`,
        say: `Pick a crayon and colour inside the ${f.name}!`,
      };
    }
  }
}

export function drawCheer(round: DrawRound, rng: Rng = Math.random): string {
  const wow = ['Wow', 'Yay', 'Amazing', 'Super', 'Well done'][Math.floor(rng() * 5)];
  switch (round.activity) {
    case 'dots': {
      const f = DOT_FIGURES.find((x) => x.id === round.figureId);
      return `${wow}! It's a ${f?.name ?? 'picture'}!`;
    }
    case 'lines':
    case 'trace': {
      const f = [...LINE_FIGURES, ...TRACE_FIGURES].find((x) => x.id === round.figureId);
      return `${wow}! You traced the ${spokenName(f?.name ?? 'line')}!`;
    }
    case 'scribble':
      return `${wow}! Beautiful colouring!`;
  }
}

// ---------- geometry ----------

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Points every `step` units from a to b (excluding a, including b), so fast swipes don't leave gaps. */
export function interpolate(a: Pt, b: Pt, step = 3): Pt[] {
  const n = Math.max(1, Math.ceil(dist(a, b) / step));
  return Array.from({ length: n }, (_, i) => ({ x: a.x + ((b.x - a.x) * (i + 1)) / n, y: a.y + ((b.y - a.y) * (i + 1)) / n }));
}

/** A run of ink that is either all on the line / inside the shape, or all off it. */
export type Seg = { pts: Pt[]; off: boolean; color?: string };

/**
 * Adds new pointer points to the ink. `from` is the previous point of the same stroke
 * (null starts a new stroke). A run switches colour where the finger goes on/off the line,
 * and the new run starts at the previous point so the ink stays joined.
 */
export function appendSegs(prev: readonly Seg[], items: readonly { p: Pt; off: boolean }[], from: Pt | null, color?: string): Seg[] {
  const out = prev.slice();
  const open = from ? out.pop() : undefined;
  // Copy the run being extended so the previous state is never mutated.
  let tail: Seg | null = open ? { ...open, pts: open.pts.slice() } : null;
  let lastPt = from;
  for (const it of items) {
    if (!tail || tail.off !== it.off) {
      if (tail) out.push(tail);
      tail = { pts: lastPt ? [lastPt, it.p] : [it.p], off: it.off, color: color ?? tail?.color };
    } else {
      tail.pts.push(it.p);
    }
    lastPt = it.p;
  }
  if (tail) out.push(tail);
  return out;
}

export function nearestDistance(p: Pt, samples: readonly Pt[]): number {
  let best = Infinity;
  for (const s of samples) best = Math.min(best, dist(p, s));
  return best;
}

/** Marks every sample within `tol` of `p` as covered; returns how many were newly covered. */
export function markCovered(samples: readonly Pt[], covered: boolean[], p: Pt, tol: number): number {
  let added = 0;
  samples.forEach((s, i) => {
    if (!covered[i] && dist(p, s) <= tol) {
      covered[i] = true;
      added++;
    }
  });
  return added;
}

/** Start points of each sub-path (every `M`), where the green "start here" dots go. */
export function pathStarts(d: string): Pt[] {
  return [...d.matchAll(/M\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
}

export function insideRegion(r: Region, p: Pt, margin = 0): boolean {
  if (r.kind === 'rect') return p.x >= r.x - margin && p.x <= r.x + r.w + margin && p.y >= r.y - margin && p.y <= r.y + r.h + margin;
  return dist(p, { x: r.cx, y: r.cy }) <= r.r + margin;
}

/** Centres of the colouring grid cells that sit inside the region. */
export function regionCells(r: Region): Pt[] {
  const cells: Pt[] = [];
  for (let y = CELL / 2; y < SCRIBBLE_H; y += CELL) {
    for (let x = CELL / 2; x < SCRIBBLE_W; x += CELL) {
      if (insideRegion(r, { x, y })) cells.push({ x, y });
    }
  }
  return cells;
}

function segmentDistance(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2)) : 0;
  return dist(p, { x: a.x + t * dx, y: a.y + t * dy });
}

const LABEL_GAP = 8;

/**
 * Where each dot's number goes: of 16 spots around its dot, the one furthest from the other
 * dots, the lines the child will draw and the numbers already placed, leaning outward from
 * the figure's centre on ties.
 */
export function dotLabels(points: readonly [number, number][], closed: boolean): Pt[] {
  const pts = points.map(([x, y]) => ({ x, y }));
  const cx = pts.reduce((s, q) => s + q.x, 0) / pts.length;
  const cy = pts.reduce((s, q) => s + q.y, 0) / pts.length;
  const edges = pts.slice(0, -1).map((a, j) => [a, pts[j + 1]] as const);
  if (closed && pts.length > 2) edges.push([pts[pts.length - 1], pts[0]]);
  const clamp = (v: number) => Math.min(95, Math.max(5, v));
  const placed: Pt[] = [];

  pts.forEach((p, i) => {
    const out = Math.hypot(p.x - cx, p.y - cy) || 1;
    let best = p;
    let bestScore = -Infinity;
    for (let k = 0; k < 16; k++) {
      const a = (Math.PI / 8) * k;
      const q = { x: clamp(p.x + Math.cos(a) * LABEL_GAP), y: clamp(p.y + Math.sin(a) * LABEL_GAP) };
      const clearance = Math.min(
        ...pts.filter((_, j) => j !== i).map((o) => dist(q, o)),
        ...edges.map(([e1, e2]) => segmentDistance(q, e1, e2) + 2),
        // Two numbers need roughly a label's width between them.
        ...placed.map((o) => dist(q, o) - 2),
      );
      // Clearance matters up to about a label's width; beyond that, prefer pointing outward.
      const outward = (Math.cos(a) * (p.x - cx) + Math.sin(a) * (p.y - cy)) / out;
      const score = Math.min(clearance, 9) + outward;
      if (score > bestScore) {
        bestScore = score;
        best = q;
      }
    }
    placed.push(best);
  });
  return placed;
}
