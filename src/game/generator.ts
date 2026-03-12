// ── Puzzle generator ──
// 1. Generate a complete valid board (with knight constraint)
// 2. Remove cells while maintaining unique solution
// 3. Rate difficulty by number of givens remaining

import type { Difficulty, Puzzle, Board } from "./types";
import { createEmptyBoard } from "./types";
import { solveRandom, countSolutions } from "./solver";

/** Number of given cells per difficulty */
const GIVENS: Record<Difficulty, [number, number]> = {
  easy: [36, 42],
  medium: [30, 35],
  hard: [25, 29],
  expert: [20, 24],
};

/**
 * Generate a new puzzle for the given difficulty.
 */
export function generatePuzzle(difficulty: Difficulty): Puzzle {
  // 1. Generate a complete board
  const solution = makeEmptyGrid();
  solveRandom(solution);

  // 2. Remove cells to create the puzzle
  const [minGivens, maxGivens] = GIVENS[difficulty];
  const targetGivens =
    minGivens + Math.floor(Math.random() * (maxGivens - minGivens + 1));

  const puzzle = solution.map((row) => [...row]);
  const cells = allCells();
  shuffleInPlace(cells);

  let currentGivens = 81;

  for (const [r, c] of cells) {
    if (currentGivens <= targetGivens) break;

    const backup = puzzle[r]![c]!;
    puzzle[r]![c] = 0;

    // Check uniqueness
    const testGrid = puzzle.map((row) => [...row]);
    if (countSolutions(testGrid, 2) !== 1) {
      // Removing this cell creates multiple solutions — put it back
      puzzle[r]![c] = backup;
    } else {
      currentGivens--;
    }
  }

  // 3. Build the Board with Cell objects
  const board = puzzleToBoard(puzzle);

  return { board, solution, difficulty };
}

/**
 * Convert a raw number grid (from pre-built puzzle data) into a Board.
 */
export function puzzleToBoard(grid: number[][]): Board {
  const board = createEmptyBoard();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r]![c]!;
      if (v !== 0) {
        board[r]![c]!.value = v;
        board[r]![c]!.given = true;
      }
    }
  }
  return board;
}

/**
 * Convert a raw number grid + solution from JSON into a Puzzle.
 */
export function createPuzzleFromData(
  grid: number[][],
  solution: number[][],
  difficulty: Difficulty,
): Puzzle {
  return {
    board: puzzleToBoard(grid),
    solution,
    difficulty,
  };
}

// ── Helpers ──

function makeEmptyGrid(): number[][] {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
}

function allCells(): [number, number][] {
  const cells: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      cells.push([r, c]);
    }
  }
  return cells;
}

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j] as T, arr[i] as T];
  }
}
