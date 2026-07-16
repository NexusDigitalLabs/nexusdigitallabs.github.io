import { describe, expect, it } from 'vitest';
import { conflictCells, emptyGrid, generatePuzzle, isComplete } from '@/lib/games/sudoku';
import { patternsEqual, randomPattern } from '@/lib/games/gridlock';
import { areAdjacent, selectionConnected, selectionSum } from '@/lib/games/sumoku';
import { buildPuzzle, edgeKey } from '@/lib/games/cryptic-paths';
import { generateRound, streakMultiplier } from '@/lib/games/semantic-shift';
import { BRAIN_GAMES, FUN_GAMES, GAME_COUNT } from '@/data/catalog';

describe('game catalogs', () => {
  it('splits fun and brain games', () => {
    expect(FUN_GAMES.length).toBe(3);
    expect(BRAIN_GAMES.length).toBe(5);
    expect(FUN_GAMES.length + BRAIN_GAMES.length).toBe(GAME_COUNT);
  });
});

describe('sudoku engine', () => {
  it('generates a solvable unique-ish beginner puzzle', () => {
    const { puzzle, solution, given } = generatePuzzle('beginner');
    expect(puzzle).toHaveLength(9);
    expect(isComplete(solution, solution)).toBe(true);
    const clueCount = given.flat().filter(Boolean).length;
    expect(clueCount).toBeGreaterThanOrEqual(40);
    expect(conflictCells(emptyGrid()).size).toBe(0);
  });
});

describe('gridlock helpers', () => {
  it('builds sorted patterns of requested length', () => {
    const p = randomPattern(4, 5);
    expect(p).toHaveLength(5);
    expect(patternsEqual(p, [...p].reverse())).toBe(true);
  });
});

describe('sumoku helpers', () => {
  it('validates adjacency and path connectivity', () => {
    expect(areAdjacent(0, 1)).toBe(true);
    expect(areAdjacent(0, 5)).toBe(false);
    expect(selectionConnected([0, 1, 5])).toBe(true);
    expect(selectionConnected([0, 2])).toBe(false);
    expect(selectionSum([1, 2, 3, 4], [0, 1])).toBe(3);
  });
});

describe('cryptic paths', () => {
  it('builds puzzles with undirected edge keys', () => {
    const p = buildPuzzle('easy');
    expect(p.nodes.length).toBe(4);
    expect(edgeKey(2, 1)).toBe('1-2');
  });
});

describe('semantic shift', () => {
  it('builds rounds and streak multipliers', () => {
    const r = generateRound('word');
    expect(r.correct).toBe(r.word);
    expect(streakMultiplier(1)).toBe(1);
    expect(streakMultiplier(5)).toBe(2);
  });
});
