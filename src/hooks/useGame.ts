// ── Core game hook ──
// useReducer-based state management with undo/redo.

import { useReducer, useCallback } from "react";
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

  // Derive conflict info for the selected cell
  const grid = boardToGrid(state.board);
  const conflicts =
    state.selectedCell &&
    state.board[state.selectedCell.row]?.[state.selectedCell.col]?.value
      ? getConflicts(grid, state.selectedCell.row, state.selectedCell.col)
      : [];

  // Find fully completed and correct rows/cols/boxes
  const completedGroups: Coord[] = [];
  // Check rows
  for (let r = 0; r < 9; r++) {
    if (isGroupComplete(state.solution, grid, "row", r)) {
      for (let c = 0; c < 9; c++) completedGroups.push({ row: r, col: c });
    }
  }
  // Check columns
  for (let c = 0; c < 9; c++) {
    if (isGroupComplete(state.solution, grid, "col", c)) {
      for (let r = 0; r < 9; r++) completedGroups.push({ row: r, col: c });
    }
  }
  // Check 3x3 boxes
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      if (isGroupComplete(state.solution, grid, "box", br * 3 + bc)) {
        for (let r = br * 3; r < br * 3 + 3; r++) {
          for (let c = bc * 3; c < bc * 3 + 3; c++) {
            completedGroups.push({ row: r, col: c });
          }
        }
      }
    }
  }

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
    completedGroups,
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
