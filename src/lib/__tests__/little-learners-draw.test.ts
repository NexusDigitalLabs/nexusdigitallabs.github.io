import { describe, expect, it } from 'vitest';
import {
  DOT_FIGURES,
  DRAW_ACTIVITIES,
  SCRIBBLE_FIGURES,
  appendSegs,
  dotLabels,
  drawFigures,
  generateDrawRound,
  insideRegion,
  interpolate,
  markCovered,
  pathStarts,
  regionCells,
} from '@/lib/games/little-learners-draw';
import type { Level } from '@/lib/games/little-learners';

describe('little learners drawing rounds', () => {
  const levels: Level[] = ['little', 'big'];

  it('only picks figures for the chosen level and never repeats the last one', () => {
    for (const level of levels) {
      for (const activity of DRAW_ACTIVITIES) {
        const allowed = drawFigures(activity).filter((f) => f.levels.includes(level)).map((f) => f.id);
        expect(allowed.length).toBeGreaterThan(1);
        let prev: string | undefined;
        for (let i = 0; i < 100; i++) {
          const r = generateDrawRound(activity, level, Math.random, prev);
          expect(allowed).toContain(r.figureId);
          expect(r.figureId).not.toBe(prev);
          prev = r.figureId;
        }
      }
    }
  });

  it('keeps little dot-to-dots short and big ones up to ten dots', () => {
    for (const f of DOT_FIGURES) {
      if (f.levels.includes('little')) expect(f.points.length).toBeLessThanOrEqual(5);
      expect(f.points.length).toBeGreaterThanOrEqual(2);
      expect(f.points.length).toBeLessThanOrEqual(10);
    }
  });

  it('keeps dots far enough apart for small fingers', () => {
    for (const f of DOT_FIGURES) {
      f.points.forEach((a, i) =>
        f.points.slice(i + 1).forEach((b) => expect(Math.hypot(a[0] - b[0], a[1] - b[1]), f.id).toBeGreaterThanOrEqual(12)),
      );
    }
  });

  it('says the number of dots in the prompt', () => {
    const r = generateDrawRound('dots', 'little', () => 0);
    const f = DOT_FIGURES.find((x) => x.id === r.figureId)!;
    expect(r.prompt).toBe(`Join the dots 1 to ${f.points.length}`);
  });
});

describe('little learners drawing geometry', () => {
  it('fills gaps between fast pointer moves', () => {
    const pts = interpolate({ x: 0, y: 0 }, { x: 30, y: 0 }, 3);
    expect(pts).toHaveLength(10);
    expect(pts.at(-1)).toEqual({ x: 30, y: 0 });
  });

  it('only covers samples within the tolerance', () => {
    const samples = [0, 10, 20, 30].map((x) => ({ x, y: 0 }));
    const covered = samples.map(() => false);
    expect(markCovered(samples, covered, { x: 12, y: 3 }, 5)).toBe(1);
    expect(markCovered(samples, covered, { x: 12, y: 3 }, 5)).toBe(0);
    expect(covered).toEqual([false, true, false, false]);
  });

  it('finds a start dot for every sub-path', () => {
    expect(pathStarts('M45 15 L45 85 M100 15 L100 85')).toEqual([
      { x: 45, y: 15 },
      { x: 100, y: 15 },
    ]);
  });

  it('splits ink into on-line and off-line runs that stay joined', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 1, y: 0 };
    const c = { x: 2, y: 0 };
    let segs = appendSegs([], [{ p: a, off: false }], null);
    segs = appendSegs(segs, [{ p: b, off: false }, { p: c, off: true }], a);
    expect(segs).toEqual([
      { pts: [a, b], off: false, color: undefined },
      { pts: [b, c], off: true, color: undefined },
    ]);
    // A new stroke never joins the previous one.
    segs = appendSegs(segs, [{ p: a, off: false }], null);
    expect(segs).toHaveLength(3);
    expect(segs[2].pts).toEqual([a]);
  });

  it('does not mutate earlier ink', () => {
    const first = appendSegs([], [{ p: { x: 0, y: 0 }, off: false }], null);
    const snapshot = JSON.stringify(first);
    appendSegs(first, [{ p: { x: 1, y: 1 }, off: false }], { x: 0, y: 0 });
    expect(JSON.stringify(first)).toBe(snapshot);
  });

  it('builds colouring cells that all sit inside the shape', () => {
    for (const f of SCRIBBLE_FIGURES) {
      const cells = regionCells(f.region);
      expect(cells.length).toBeGreaterThan(20);
      for (const c of cells) expect(insideRegion(f.region, c)).toBe(true);
    }
  });
});

describe('little learners dot labels', () => {
  it('keeps every number clear of the other dots and the other numbers', () => {
    for (const f of DOT_FIGURES) {
      const labels = dotLabels(f.points, f.closed);
      labels.forEach((label, i) => {
        f.points.forEach(([x, y], j) => {
          if (j !== i) expect(Math.hypot(label.x - x, label.y - y), `${f.id} label ${i + 1}`).toBeGreaterThan(5);
        });
        labels.forEach((other, j) => {
          if (j !== i) expect(Math.hypot(label.x - other.x, label.y - other.y), `${f.id} labels ${i + 1}/${j + 1}`).toBeGreaterThan(6);
        });
      });
    }
  });
});
