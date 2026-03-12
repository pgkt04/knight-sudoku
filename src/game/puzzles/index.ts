// Pre-built puzzle pack — 30 puzzles, 3 per star level (1-10).
// Loaded from generated JSON data.

import type { Board } from "../types";
import { createEmptyBoard } from "../types";
import puzzleData from "./puzzle-data.json";

export interface PuzzlePack {
  id: number;
  stars: number;
  givens: number;
  grid: number[][];
  solution: number[][];
}

/** All 30 pre-built puzzles, sorted by id */
export const ALL_PUZZLES: PuzzlePack[] = puzzleData as PuzzlePack[];

/** Get a specific puzzle by id */
export function getPuzzleById(id: number): PuzzlePack | undefined {
  return ALL_PUZZLES.find((p) => p.id === id);
}

/** Convert a raw grid to a Board (with Cell objects) */
export function gridToBoard(grid: number[][]): Board {
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
