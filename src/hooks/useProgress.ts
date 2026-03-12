// ── Progress tracking ──
// Tracks which puzzles are completed, persisted in localStorage.

import { useState, useCallback } from "react";

const STORAGE_KEY = "knight-sudoku-progress";

function loadProgress(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as number[];
      return new Set(arr);
    }
  } catch {
    // ignore
  }
  return new Set();
}

function saveProgress(completed: Set<number>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
}

export function useProgress() {
  const [completed, setCompleted] = useState<Set<number>>(loadProgress);

  const markCompleted = useCallback((puzzleId: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(puzzleId);
      saveProgress(next);
      return next;
    });
  }, []);

  const isCompleted = useCallback(
    (puzzleId: number) => completed.has(puzzleId),
    [completed],
  );

  const isUnlocked = useCallback(
    (puzzleId: number) => {
      // Puzzle 1 is always unlocked, others require the previous one completed
      if (puzzleId === 1) return true;
      return completed.has(puzzleId - 1);
    },
    [completed],
  );

  return { completed, markCompleted, isCompleted, isUnlocked };
}
