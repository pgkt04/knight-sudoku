// ── Backtracking solver with knight constraint ──
// Used for puzzle generation and unique-solution verification.

import { isValidPlacement } from "./validator";

/**
 * Solve the grid in-place. Returns true if a solution was found.
 * The grid is modified to contain the solution.
 */
export function solve(grid: number[][]): boolean {
  const empty = findEmpty(grid);
  if (!empty) return true; // no empty cells → solved

  const [row, col] = empty;

  // Try digits 1-9 in random order for varied solutions during generation
  for (let d = 1; d <= 9; d++) {
    if (isValidPlacement(grid, row, col, d)) {
      grid[row]![col] = d;
      if (solve(grid)) return true;
      grid[row]![col] = 0;
    }
  }

  return false;
}

/**
 * Solve with randomised digit ordering — used during board generation
 * to produce varied complete boards.
 */
export function solveRandom(grid: number[][]): boolean {
  const empty = findEmpty(grid);
  if (!empty) return true;

  const [row, col] = empty;
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  for (const d of digits) {
    if (isValidPlacement(grid, row, col, d)) {
      grid[row]![col] = d;
      if (solveRandom(grid)) return true;
      grid[row]![col] = 0;
    }
  }

  return false;
}

/**
 * Count solutions up to `limit`. Returns the count (capped at limit).
 * Used to verify unique solutions during puzzle generation.
 */
export function countSolutions(grid: number[][], limit: number = 2): number {
  let count = 0;

  function search(): boolean {
    const empty = findEmpty(grid);
    if (!empty) {
      count++;
      return count >= limit; // stop early once we hit the limit
    }

    const [row, col] = empty;
    for (let d = 1; d <= 9; d++) {
      if (isValidPlacement(grid, row, col, d)) {
        grid[row]![col] = d;
        if (search()) {
          grid[row]![col] = 0;
          return true;
        }
        grid[row]![col] = 0;
      }
    }
    return false;
  }

  search();
  return count;
}

// ── Helpers ──

function findEmpty(grid: number[][]): [number, number] | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r]![c] === 0) return [r, c];
    }
  }
  return null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
