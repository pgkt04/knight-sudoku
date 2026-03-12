import type { Digit } from "../game/types";
import styles from "./NumberPad.module.css";

interface NumberPadProps {
  onDigit: (digit: Digit) => void;
}

export function NumberPad({ onDigit }: NumberPadProps) {
  return (
    <div className={styles.numberPad}>
      {([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]).map((d) => (
        <button
          key={d}
          className={styles.numButton}
          onClick={() => onDigit(d)}
          type="button"
        >
          {d}
        </button>
      ))}
    </div>
  );
}
