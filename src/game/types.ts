// ── Core types for Knight Sudoku ──
// Pure TypeScript, no React dependency.

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface Cell {
  /** Current value, 0 = empty */
  value: number;
  /** True if the cell was part of the original puzzle (immutable) */
  given: boolean;
  /** Pencil-mark candidates toggled by the player */
  pencilMarks: Set<Digit>;
}

/** 9x9 grid of cells */
export type Board = Cell[][];

export type Difficulty = "easy" | "medium" | "hard" | "expert";

/** Row/column coordinate */
export interface Coord {
  row: number;
  col: number;
}

/** A full puzzle definition */
export interface Puzzle {
  /** The board with only given cells filled in */
  board: Board;
  /** The complete solved board */
  solution: number[][];
  difficulty: Difficulty;
}

/** Serialisable snapshot for persistence (Sets aren't JSON-friendly) */
export interface SerializedCell {
  value: number;
  given: boolean;
  pencilMarks: number[];
}

export type SerializedBoard = SerializedCell[][];

// ── Helpers ──

export function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({
      value: 0,
      given: false,
      pencilMarks: new Set<Digit>(),
    })),
  );
}

export function cloneBoard(board: Board): Board {
  return board.map((row) =>
    row.map((cell) => ({
      value: cell.value,
      given: cell.given,
      pencilMarks: new Set(cell.pencilMarks),
    })),
  );
}

export function serializeBoard(board: Board): SerializedBoard {
  return board.map((row) =>
    row.map((cell) => ({
      value: cell.value,
      given: cell.given,
      pencilMarks: [...cell.pencilMarks],
    })),
  );
}

export function deserializeBoard(data: SerializedBoard): Board {
  return data.map((row) =>
    row.map((cell) => ({
      value: cell.value,
      given: cell.given,
      pencilMarks: new Set(cell.pencilMarks as Digit[]),
    })),
  );
}
