// ── Timer hook ──
// Counts up in seconds. Pauses when the page is hidden.

import { useState, useEffect, useRef, useCallback } from "react";

export function useTimer(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start/stop the interval based on running prop
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [running]);

  // Pause when page is hidden (tab switch, app backgrounded)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      } else if (!document.hidden && running) {
        intervalRef.current = setInterval(() => {
          setSeconds((s) => s + 1);
        }, 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [running]);

  const reset = useCallback(() => setSeconds(0), []);

  const formatted = formatTime(seconds);

  return { seconds, formatted, reset };
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
