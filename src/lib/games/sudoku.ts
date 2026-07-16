/** Sudoku generation + conflict helpers — pure TypeScript. */

export type SudokuTier = 'beginner' | 'easy' | 'medium' | 'hard';

export const SUDOKU_TIERS: Record<
  SudokuTier,
  { clues: number; baseScore: number; countdownSec: number }
> = {
  beginner: { clues: 48, baseScore: 400, countdownSec: 720 }, // 12 min
  easy: { clues: 40, baseScore: 700, countdownSec: 540 }, // 9 min
  medium: { clues: 32, baseScore: 1100, countdownSec: 360 }, // 6 min
  hard: { clues: 24, baseScore: 1800, countdownSec: 240 }, // 4 min
};

export type SudokuGrid = number[][]; // 0 = empty

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function emptyGrid(): SudokuGrid {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

export function cloneGrid(g: SudokuGrid): SudokuGrid {
  return g.map((row) => [...row]);
}

function isValidPlacement(grid: SudokuGrid, row: number, col: number, n: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === n || grid[i][col] === n) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if (grid[r][c] === n) return false;
    }
  }
  return true;
}

function findEmpty(grid: SudokuGrid): [number, number] | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) return [r, c];
    }
  }
  return null;
}

function solve(grid: SudokuGrid): boolean {
  const pos = findEmpty(grid);
  if (!pos) return true;
  const [r, c] = pos;
  for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (isValidPlacement(grid, r, c, n)) {
      grid[r][c] = n;
      if (solve(grid)) return true;
      grid[r][c] = 0;
    }
  }
  return false;
}

/** Count solutions up to `limit` (used to enforce uniqueness). */
function countSolutions(grid: SudokuGrid, limit = 2): number {
  const pos = findEmpty(grid);
  if (!pos) return 1;
  const [r, c] = pos;
  let count = 0;
  for (let n = 1; n <= 9; n++) {
    if (isValidPlacement(grid, r, c, n)) {
      grid[r][c] = n;
      count += countSolutions(grid, limit);
      grid[r][c] = 0;
      if (count >= limit) return count;
    }
  }
  return count;
}

export function generateFullBoard(): SudokuGrid {
  const grid = emptyGrid();
  solve(grid);
  return grid;
}

export function generatePuzzle(tier: SudokuTier): {
  puzzle: SudokuGrid;
  solution: SudokuGrid;
  given: boolean[][];
} {
  const targetClues = SUDOKU_TIERS[tier].clues;

  // Fast path: dig randomly then verify uniqueness (retry a few times).
  for (let attempt = 0; attempt < 10; attempt++) {
    const solution = generateFullBoard();
    const puzzle = cloneGrid(solution);
    const positions = shuffle(
      Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number])
    );
    let clues = 81;
    for (const [r, c] of positions) {
      if (clues <= targetClues) break;
      puzzle[r][c] = 0;
      clues--;
    }
    if (countSolutions(cloneGrid(puzzle), 2) === 1) {
      const given = Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => puzzle[r][c] !== 0)
      );
      return { puzzle, solution, given };
    }
  }

  // Careful dig if random failed (always unique; may keep slightly more clues).
  const solution = generateFullBoard();
  const puzzle = cloneGrid(solution);
  const given = Array.from({ length: 9 }, () => Array(9).fill(true));
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number])
  );
  let clues = 81;
  for (const [r, c] of positions) {
    if (clues <= targetClues) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    if (countSolutions(cloneGrid(puzzle), 2) === 1) {
      given[r][c] = false;
      clues--;
    } else {
      puzzle[r][c] = backup;
    }
  }
  return { puzzle, solution, given };
}

export function conflictCells(grid: SudokuGrid): Set<string> {
  const bad = new Set<string>();
  const mark = (cells: [number, number][]) => {
    const byVal = new Map<number, [number, number][]>();
    for (const [r, c] of cells) {
      const v = grid[r][c];
      if (v === 0) continue;
      const list = byVal.get(v) ?? [];
      list.push([r, c]);
      byVal.set(v, list);
    }
    for (const list of byVal.values()) {
      if (list.length > 1) {
        for (const [r, c] of list) bad.add(`${r}-${c}`);
      }
    }
  };

  for (let i = 0; i < 9; i++) {
    mark(Array.from({ length: 9 }, (_, j) => [i, j] as [number, number]));
    mark(Array.from({ length: 9 }, (_, j) => [j, i] as [number, number]));
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const cells: [number, number][] = [];
      for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) cells.push([r, c]);
      }
      mark(cells);
    }
  }
  return bad;
}

export function isComplete(grid: SudokuGrid, solution: SudokuGrid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

export function scoreSudoku(
  tier: SudokuTier,
  mistakes: number,
  elapsedSec: number
): number {
  const cfg = SUDOKU_TIERS[tier];
  let pts = cfg.baseScore - mistakes * 40;
  pts += Math.max(0, cfg.countdownSec - elapsedSec);
  return Math.max(0, Math.floor(pts));
}
