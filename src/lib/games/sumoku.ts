export type SumokuTier = 'easy' | 'medium' | 'hard';

export const SUMOKU_TIERS: Record<
  SumokuTier,
  {
    min: number;
    max: number;
    maxTarget: number;
    roundSec: number;
    shiftTargetSec: number | null;
  }
> = {
  easy: { min: 1, max: 9, maxTarget: 15, roundSec: 75, shiftTargetSec: null },
  medium: { min: 1, max: 15, maxTarget: 30, roundSec: 45, shiftTargetSec: null },
  hard: { min: -5, max: 15, maxTarget: 25, roundSec: 40, shiftTargetSec: 12 },
};

export type SumokuCell = number | null;

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function fillBoard(tier: SumokuTier): SumokuCell[] {
  const { min, max } = SUMOKU_TIERS[tier];
  return Array.from({ length: 16 }, () => randInt(min, max));
}

export function pickTarget(board: SumokuCell[], tier: SumokuTier): number {
  const { maxTarget } = SUMOKU_TIERS[tier];
  const filled = board.filter((v): v is number => v !== null);
  if (filled.length < 2) return Math.min(maxTarget, 10);
  // Prefer a reachable sum of 2–4 random adjacent-ish values
  const sample = filled.slice(0, Math.min(4, filled.length));
  let sum = sample.reduce((a, b) => a + b, 0);
  while (Math.abs(sum) > maxTarget && sample.length) {
    sample.pop();
    sum = sample.reduce((a, b) => a + b, 0);
  }
  if (sum === 0) return randInt(3, Math.min(12, maxTarget));
  return sum;
}

export function areAdjacent(a: number, b: number): boolean {
  const ar = Math.floor(a / 4);
  const ac = a % 4;
  const br = Math.floor(b / 4);
  const bc = b % 4;
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
}

/** Selection must form a connected path (order of clicks). */
export function selectionConnected(indices: number[]): boolean {
  if (indices.length <= 1) return true;
  for (let i = 1; i < indices.length; i++) {
    if (!areAdjacent(indices[i - 1], indices[i])) return false;
  }
  return true;
}

export function selectionSum(board: SumokuCell[], indices: number[]): number {
  return indices.reduce((s, i) => s + (board[i] ?? 0), 0);
}

/** Gravity drop: nulls float up column-wise? Spec: matching removes tiles and drops new numbers down. */
export function applyClearAndDrop(
  board: SumokuCell[],
  clear: number[],
  tier: SumokuTier
): SumokuCell[] {
  const { min, max } = SUMOKU_TIERS[tier];
  const next = [...board];
  for (const i of clear) next[i] = null;

  for (let c = 0; c < 4; c++) {
    const col: SumokuCell[] = [];
    for (let r = 3; r >= 0; r--) {
      const v = next[r * 4 + c];
      if (v !== null) col.push(v);
    }
    while (col.length < 4) col.push(randInt(min, max));
    for (let r = 3; r >= 0; r--) {
      next[r * 4 + c] = col[3 - r];
    }
  }
  return next;
}

export function scoreSumokuMatch(target: number, chainLen: number): number {
  return Math.abs(target) * 10 + chainLen * 15;
}
