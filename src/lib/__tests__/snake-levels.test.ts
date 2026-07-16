import { describe, expect, it } from 'vitest';
import {
  SNAKE_POINTS_PER_LEVEL,
  snakeLevelFromScore,
  snakeTickMsForLevel,
  snakeTickMsForScore,
} from '@/lib/snake-levels';

describe('snake-levels', () => {
  it('starts at level 1', () => {
    expect(snakeLevelFromScore(0)).toBe(1);
    expect(snakeLevelFromScore(4)).toBe(1);
  });

  it('levels up every five points', () => {
    expect(snakeLevelFromScore(5)).toBe(2);
    expect(snakeLevelFromScore(10)).toBe(3);
  });

  it('slows tick interval as level rises', () => {
    const l1 = snakeTickMsForLevel(1);
    const l3 = snakeTickMsForLevel(3);
    expect(l3).toBeLessThan(l1);
  });

  it('matches score to level tick', () => {
    expect(snakeTickMsForScore(0)).toBe(snakeTickMsForLevel(1));
    expect(snakeTickMsForScore(SNAKE_POINTS_PER_LEVEL)).toBe(snakeTickMsForLevel(2));
  });
});
