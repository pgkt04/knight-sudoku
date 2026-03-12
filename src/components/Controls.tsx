import styles from "./Controls.module.css";

interface ControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  onErase: () => void;
  onTogglePencil: () => void;
  pencilMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

export function Controls({
  onUndo,
  onRedo,
  onErase,
  onTogglePencil,
  pencilMode,
  canUndo,
  canRedo,
}: ControlsProps) {
  return (
    <div className={styles.controls}>
      <button
        className={styles.controlButton}
        onClick={onUndo}
        disabled={!canUndo}
        type="button"
      >
        Undo
      </button>
      <button
        className={styles.controlButton}
        onClick={onRedo}
        disabled={!canRedo}
        type="button"
      >
        Redo
      </button>
      <button
        className={styles.controlButton}
        onClick={onErase}
        type="button"
      >
        Erase
      </button>
      <button
        className={`${styles.controlButton} ${pencilMode ? styles.active : ""}`}
        onClick={onTogglePencil}
        type="button"
      >
        Note
      </button>
    </div>
  );
}
