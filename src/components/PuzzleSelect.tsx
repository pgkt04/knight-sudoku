import { ALL_PUZZLES } from "../game/puzzles";
import styles from "./PuzzleSelect.module.css";

interface PuzzleSelectProps {
  onSelect: (puzzleId: number) => void;
  isCompleted: (puzzleId: number) => boolean;
  isUnlocked: (puzzleId: number) => boolean;
}

export function PuzzleSelect({
  onSelect,
  isCompleted,
  isUnlocked,
}: PuzzleSelectProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Knight Sudoku</h1>
      <p className={styles.subtitle}>
        Complete each puzzle to unlock the next. Difficulty increases as you
        progress.
      </p>
      <div className={styles.list}>
        {ALL_PUZZLES.map((puzzle) => {
          const unlocked = isUnlocked(puzzle.id);
          const completed = isCompleted(puzzle.id);

          const rowClass = [
            styles.puzzleRow,
            !unlocked ? styles.locked : "",
            completed ? styles.completedRow : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={puzzle.id}
              className={rowClass}
              onClick={() => unlocked && onSelect(puzzle.id)}
              type="button"
              disabled={!unlocked}
            >
              <div className={styles.puzzleInfo}>
                <span className={styles.puzzleName}>
                  Puzzle #{puzzle.id}
                </span>
                <span className={styles.stars}>
                  {"★".repeat(puzzle.stars)}
                  {"☆".repeat(10 - puzzle.stars)}
                </span>
              </div>
              {!unlocked && <span className={styles.lockIcon}>🔒</span>}
              {completed && <span className={styles.checkIcon}>✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
