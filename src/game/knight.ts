// ── Knight-move neighbour calculation ──
// Given a cell (r, c) on a 9×9 board, return all cells reachable by
// a chess knight's L-shaped move, filtered to stay within bounds.

import type { Coord } from "./types";

const KNIGHT_OFFSETS: readonly [number, number][] = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
];

/**
 * Returns all cells a knight's move away from (row, col).
 * Results are cached for the lifetime of the module.
 */
export function getKnightMoves(row: number, col: number): Coord[] {
  const key = row * 9 + col;
  const cached = cache.get(key);
  if (cached) return cached;

  const moves: Coord[] = [];
  for (const [dr, dc] of KNIGHT_OFFSETS) {
    const r = row + dr;
    const c = col + dc;
    if (r >= 0 && r < 9 && c >= 0 && c < 9) {
      moves.push({ row: r, col: c });
    }
  }

  cache.set(key, moves);
  return moves;
}

const cache = new Map<number, Coord[]>();
