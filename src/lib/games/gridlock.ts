export type GridlockTier = 'easy' | 'medium' | 'hard';

export const GRIDLOCK_TIERS: Record<
  GridlockTier,
  { size: number; flashes: number; windowMs: number; recallMs: number; points: number }
> = {
  easy: { size: 3, flashes: 3, windowMs: 2000, recallMs: 8000, points: 100 },
  medium: { size: 4, flashes: 5, windowMs: 1500, recallMs: 6000, points: 200 },
  hard: { size: 5, flashes: 7, windowMs: 1000, recallMs: 4000, points: 350 },
};

export function randomPattern(size: number, count: number): number[] {
  const total = size * size;
  const indices = Array.from({ length: total }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, Math.min(count, total)).sort((a, b) => a - b);
}

export function patternsEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}
