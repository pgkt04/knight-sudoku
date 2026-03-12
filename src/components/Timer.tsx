import styles from "./Timer.module.css";

interface TimerProps {
  formatted: string;
}

export function Timer({ formatted }: TimerProps) {
  return <div className={styles.timer}>{formatted}</div>;
}
