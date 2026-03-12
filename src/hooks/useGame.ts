// ── Core game hook ──
// useReducer-based state management with undo/redo.

import { useReducer, useCallback, useRef } from "react";
import type { Board, Digit, Puzzle, Coord } from "../game/types";
import { cloneBoard } from "../game/types";
import { getConflicts, isBoardComplete } from "../game/validator";
import { getKnightMoves } from "../game/knight";

// ── State ──

export interface GameState {
  board: Board;
  solution: number[][];
  selectedCell: Coord | null;
  pencilMode: boolean;
  undoStack: Board[];
  redoStack: Board[];
  isComplete: boolean;
  difficulty: string;
}

// ── Actions ──

type GameAction =
  | { type: "SELECT_CELL"; coord: Coord }
  | { type: "PLACE_DIGIT"; digit: Digit }
  | { type: "ERASE" }
  | { type: "TOGGLE_PENCIL" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "NEW_GAME"; puzzle: Puzzle };

// ── Reducer ──

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_CELL": {
      return { ...state, selectedCell: action.coord };
    }

    case "PLACE_DIGIT": {
      if (!state.selectedCell) return state;
      const { row, col } = state.selectedCell;
      const cell = state.board[row]?.[col];
      if (!cell || cell.given) return state;

      const newBoard = cloneBoard(state.board);
      const target = newBoard[row]![col]!;

      if (state.pencilMode) {
        // Toggle pencil mark
        if (target.pencilMarks.has(action.digit)) {
          target.pencilMarks.delete(action.digit);
        } else {
          target.pencilMarks.add(action.digit);
        }
        // Don't clear value when toggling pencil marks
      } else {
        // Place digit — clear pencil marks
        target.value = action.digit;
        target.pencilMarks.clear();
      }

      // Check completion
      const grid = boardToGrid(newBoard);
      const complete = isBoardComplete(grid);

      return {
        ...state,
        board: newBoard,
        undoStack: [...state.undoStack, state.board],
        redoStack: [],
        isComplete: complete,
      };
    }

    case "ERASE": {
      if (!state.selectedCell) return state;
      const { row, col } = state.selectedCell;
      const cell = state.board[row]?.[col];
      if (!cell || cell.given) return state;
      if (cell.value === 0 && cell.pencilMarks.size === 0) return state;

      const newBoard = cloneBoard(state.board);
      const target = newBoard[row]![col]!;
      target.value = 0;
      target.pencilMarks.clear();

      return {
        ...state,
        board: newBoard,
        undoStack: [...state.undoStack, state.board],
        redoStack: [],
        isComplete: false,
      };
    }

    case "TOGGLE_PENCIL": {
      return { ...state, pencilMode: !state.pencilMode };
    }

    case "UNDO": {
      if (state.undoStack.length === 0) return state;
      const previous = state.undoStack[state.undoStack.length - 1]!;
      return {
        ...state,
        board: previous,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.board],
        isComplete: false,
      };
    }

    case "REDO": {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1]!;
      return {
        ...state,
        board: next,
        undoStack: [...state.undoStack, state.board],
        redoStack: state.redoStack.slice(0, -1),
        isComplete: false,
      };
    }

    case "NEW_GAME": {
      return createInitialState(action.puzzle);
    }

    default:
      return state;
  }
}

// ── Initial state ──

function createInitialState(puzzle: Puzzle): GameState {
  return {
    board: puzzle.board,
    solution: puzzle.solution,
    selectedCell: null,
    pencilMode: false,
    undoStack: [],
    redoStack: [],
    isComplete: false,
    difficulty: puzzle.difficulty,
  };
}

// ── Hook ──

export function useGame(puzzle: Puzzle) {
  const [state, dispatch] = useReducer(gameReducer, puzzle, createInitialState);

  const selectCell = useCallback(
    (coord: Coord) => dispatch({ type: "SELECT_CELL", coord }),
    [],
  );

  const placeDigit = useCallback(
    (digit: Digit) => dispatch({ type: "PLACE_DIGIT", digit }),
    [],
  );

  const erase = useCallback(() => dispatch({ type: "ERASE" }), []);

  const togglePencil = useCallback(
    () => dispatch({ type: "TOGGLE_PENCIL" }),
    [],
  );

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  const newGame = useCallback(
    (p: Puzzle) => dispatch({ type: "NEW_GAME", puzzle: p }),
    [],
  );

  // Derive conflicts for ALL cells on the board (not just selected)
  const grid = boardToGrid(state.board);
  const conflictSet = new Set<string>();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r]?.[c]) {
        for (const coord of getConflicts(grid, r, c)) {
          conflictSet.add(`${coord.row},${coord.col}`);
          conflictSet.add(`${r},${c}`);
        }
      }
    }
  }
  const conflicts: Coord[] = [...conflictSet].map((key) => {
    const [row, col] = key.split(",").map(Number);
    return { row: row!, col: col! };
  });

  // Find fully completed and correct rows/cols/boxes
  // Track which groups are complete as string keys like "row-3", "col-5", "box-4"
  const currentCompleted = new Set<string>();
  for (let r = 0; r < 9; r++) {
    if (isGroupComplete(state.solution, grid, "row", r)) {
      currentCompleted.add(`row-${r}`);
    }
  }
  for (let c = 0; c < 9; c++) {
    if (isGroupComplete(state.solution, grid, "col", c)) {
      currentCompleted.add(`col-${c}`);
    }
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      if (isGroupComplete(state.solution, grid, "box", br * 3 + bc)) {
        currentCompleted.add(`box-${br * 3 + bc}`);
      }
    }
  }

  // Detect newly completed groups by comparing with previous state
  const prevCompletedRef = useRef(new Set<string>());
  const flashVersionRef = useRef<number[][]>(
    Array.from({ length: 9 }, () => Array(9).fill(0) as number[]),
  );

  // Find groups that just became complete
  for (const key of currentCompleted) {
    if (!prevCompletedRef.current.has(key)) {
      // This group just completed — bump flash version for its cells
      const cells = getGroupCells(key);
      for (const [r, c] of cells) {
        flashVersionRef.current[r]![c]! += 1;
      }
    }
  }
  prevCompletedRef.current = currentCompleted;

  // Build a snapshot of flash versions for rendering
  const flashVersions = flashVersionRef.current.map((row) => [...row]);

  // Knight moves from selected cell (for visualization)
  const knightMoves = state.selectedCell
    ? getKnightMoves(state.selectedCell.row, state.selectedCell.col)
    : [];

  return {
    state,
    selectCell,
    placeDigit,
    erase,
    togglePencil,
    undo,
    redo,
    newGame,
    conflicts,
    flashVersions,
    knightMoves,
  };
}

// ── Helpers ──

function boardToGrid(board: Board): number[][] {
  return board.map((row) => row.map((cell) => cell.value));
}

/**
 * Check if a row/col/box is fully filled AND matches the solution.
 */
function isGroupComplete(
  solution: number[][],
  grid: number[][],
  type: "row" | "col" | "box",
  index: number,
): boolean {
  const cells: [number, number][] = [];

  if (type === "row") {
    for (let c = 0; c < 9; c++) cells.push([index, c]);
  } else if (type === "col") {
    for (let r = 0; r < 9; r++) cells.push([r, index]);
  } else {
    const br = Math.floor(index / 3) * 3;
    const bc = (index % 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        cells.push([r, c]);
      }
    }
  }

  return cells.every(([r, c]) => {
    const v = grid[r]?.[c];
    return v !== 0 && v === solution[r]?.[c];
  });
}

/**
 * Given a group key like "row-3", "col-5", "box-4",
 * return the list of [row, col] coordinates in that group.
 */
function getGroupCells(key: string): [number, number][] {
  const [type, indexStr] = key.split("-");
  const index = Number(indexStr);
  const cells: [number, number][] = [];

  if (type === "row") {
    for (let c = 0; c < 9; c++) cells.push([index, c]);
  } else if (type === "col") {
    for (let r = 0; r < 9; r++) cells.push([r, index]);
  } else {
    const br = Math.floor(index / 3) * 3;
    const bc = (index % 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        cells.push([r, c]);
      }
    }
  }

  return cells;
}
