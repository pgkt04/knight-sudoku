import type { Digit } from "../game/types";
import styles from "./Cell.module.css";

interface CellProps {
  row: number;
  col: number;
  value: number;
  given: boolean;
  pencilMarks: Set<Digit>;
  selected: boolean;
  highlighted: boolean;
  knightHighlight: boolean;
  conflict: boolean;
  completed: boolean;
  onClick: () => void;
}

export function CellView({
  row,
  col,
  value,
  given,
  pencilMarks,
  selected,
  highlighted,
  knightHighlight,
  conflict,
  completed,
  onClick,
}: CellProps) {
  const classNames = [
    styles.cell,
    given ? styles.given : "",
    !given && value ? styles.player : "",
    selected ? styles.selected : "",
    !selected && highlighted ? styles.highlighted : "",
    !selected && !highlighted && knightHighlight ? styles.knight : "",
    conflict ? styles.conflict : "",
    completed ? styles.completed : "",
  ]
    .filter(Boolean)
    .join(" ");

  // 3x3 box borders: thicker on box boundaries
  const borderRight =
    col === 8 ? "none" : col % 3 === 2 ? "2px solid #1a1a2e" : "1px solid #ccc";
  const borderBottom =
    row === 8 ? "none" : row % 3 === 2 ? "2px solid #1a1a2e" : "1px solid #ccc";

  return (
    <button
      className={classNames}
      onClick={onClick}
      type="button"
      style={{ borderRight, borderBottom }}
    >
      {value ? (
        value
      ) : pencilMarks.size > 0 ? (
        <div className={styles.pencilMarks}>
          {([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]).map((d) => (
            <span key={d} className={styles.pencilDigit}>
              {pencilMarks.has(d) ? d : ""}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}
