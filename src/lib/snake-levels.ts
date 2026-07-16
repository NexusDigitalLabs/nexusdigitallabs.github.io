/** Points required per level (level 1 = 0–4 score, level 2 = 5–9, …). */
export const SNAKE_POINTS_PER_LEVEL = 5;

/** Tick interval floor (ms) — fastest speed. */
export const SNAKE_MIN_TICK_MS = 55;

/** Tick interval at level 1 (ms). */
export const SNAKE_BASE_TICK_MS = 160;

/** Ms removed from tick interval per level above 1. */
export const SNAKE_TICK_STEP_MS = 12;

export function snakeLevelFromScore(score: number): number {
  return Math.floor(score / SNAKE_POINTS_PER_LEVEL) + 1;
}

export function snakeTickMsForLevel(level: number): number {
  const safe = Math.max(1, level);
  return Math.max(SNAKE_MIN_TICK_MS, SNAKE_BASE_TICK_MS - (safe - 1) * SNAKE_TICK_STEP_MS);
}

export function snakeTickMsForScore(score: number): number {
  return snakeTickMsForLevel(snakeLevelFromScore(score));
}
