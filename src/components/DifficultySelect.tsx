import type { Difficulty } from "../game/types";
import styles from "./DifficultySelect.module.css";

interface DifficultySelectProps {
  onSelect: (difficulty: Difficulty) => void;
}

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
];

export function DifficultySelect({ onSelect }: DifficultySelectProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Knight Sudoku</h1>
      <p className={styles.subtitle}>
        Sudoku with a twist — no two identical digits can be a knight's move
        apart.
      </p>
      <div className={styles.buttons}>
        {DIFFICULTIES.map(({ value, label }) => (
          <button
            key={value}
            className={styles.diffButton}
            onClick={() => onSelect(value)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
