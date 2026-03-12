import styles from "./GameOverModal.module.css";

interface GameOverModalProps {
  time: string;
  difficulty: string;
  onNewGame: () => void;
}

export function GameOverModal({
  time,
  difficulty,
  onNewGame,
}: GameOverModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.heading}>Puzzle Complete!</h2>
        <p className={styles.details}>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} — {time}
        </p>
        <button className={styles.button} onClick={onNewGame} type="button">
          New Game
        </button>
      </div>
    </div>
  );
}
