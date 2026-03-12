// ── Validator ──
// Check if placing digit d at (row, col) violates any constraint:
//   1. Row uniqueness
//   2. Column uniqueness
//   3. 3×3 box uniqueness
//   4. Knight-move uniqueness

import { getKnightMoves } from "./knight";

/**
 * Returns true if placing `digit` at (row, col) is valid on the given
 * number grid (0 = empty). Does NOT check if the cell is already occupied.
 */
export function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  digit: number,
): boolean {
  // Row check
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row]?.[c] === digit) return false;
  }

  // Column check
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r]?.[col] === digit) return false;
  }

  // Box check
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (r !== row || c !== col) {
        if (grid[r]?.[c] === digit) return false;
      }
    }
  }

  // Knight-move check
  for (const { row: kr, col: kc } of getKnightMoves(row, col)) {
    if (grid[kr]?.[kc] === digit) return false;
  }

  return true;
}

/**
 * Returns a list of coordinates that conflict with the cell at (row, col).
 * Useful for highlighting errors in the UI.
 */
export function getConflicts(
  grid: number[][],
  row: number,
  col: number,
): { row: number; col: number }[] {
  const digit = grid[row]?.[col];
  if (!digit) return [];

  const conflicts: { row: number; col: number }[] = [];

  // Row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row]?.[c] === digit) conflicts.push({ row, col: c });
  }

  // Column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r]?.[col] === digit) conflicts.push({ row: r, col });
  }

  // Box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r]?.[c] === digit) {
        // Avoid duplicates (cell may already be in row or col conflicts)
        if (!conflicts.some((x) => x.row === r && x.col === c)) {
          conflicts.push({ row: r, col: c });
        }
      }
    }
  }

  // Knight
  for (const { row: kr, col: kc } of getKnightMoves(row, col)) {
    if (grid[kr]?.[kc] === digit) {
      if (!conflicts.some((x) => x.row === kr && x.col === kc)) {
        conflicts.push({ row: kr, col: kc });
      }
    }
  }

  return conflicts;
}

/**
 * Check if the entire board is complete and valid.
 */
export function isBoardComplete(grid: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r]?.[c];
      if (!v) return false;
      if (!isValidPlacement(grid, r, c, v)) return false;
    }
  }
  return true;
}
