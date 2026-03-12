import { useRef, useState, useCallback, useEffect } from "react";
import { ALL_PUZZLES } from "../game/puzzles";
import styles from "./PuzzleSelect.module.css";

interface PuzzleSelectProps {
  onSelect: (puzzleId: number) => void;
  isCompleted: (puzzleId: number) => boolean;
  isUnlocked: (puzzleId: number) => boolean;
}

const ITEM_HEIGHT = 72;

export function PuzzleSelect({
  onSelect,
  isCompleted,
  isUnlocked,
}: PuzzleSelectProps) {
  // Find the first unlocked-but-not-completed puzzle as initial center
  const initialIndex = Math.max(
    0,
    ALL_PUZZLES.findIndex((p) => isUnlocked(p.id) && !isCompleted(p.id)),
  );

  const [offset, setOffset] = useState(-initialIndex * ITEM_HEIGHT);
  const dragRef = useRef({
    dragging: false,
    startY: 0,
    startOffset: 0,
    lastY: 0,
    lastTime: 0,
    velocity: 0,
  });
  const animRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalItems = ALL_PUZZLES.length;
  const minOffset = -(totalItems - 1) * ITEM_HEIGHT;
  const maxOffset = 0;

  const clamp = (v: number) => Math.max(minOffset, Math.min(maxOffset, v));

  // Snap to nearest item
  const snapTo = useCallback(
    (currentOffset: number, velocity: number) => {
      if (animRef.current) cancelAnimationFrame(animRef.current);

      // Project where the offset would end up with momentum
      const projected = currentOffset + velocity * 0.3;
      const targetIndex = Math.round(-projected / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(totalItems - 1, targetIndex));
      const target = -clamped * ITEM_HEIGHT;

      let pos = currentOffset;
      let vel = velocity;

      const animate = () => {
        const diff = target - pos;
        // Spring physics
        vel = vel * 0.85 + diff * 0.15;
        pos += vel;

        if (Math.abs(diff) < 0.5 && Math.abs(vel) < 0.5) {
          setOffset(target);
          return;
        }

        setOffset(pos);
        animRef.current = requestAnimationFrame(animate);
      };

      animRef.current = requestAnimationFrame(animate);
    },
    [totalItems],
  );

  // Touch handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      const touch = e.touches[0]!;
      dragRef.current = {
        dragging: true,
        startY: touch.clientY,
        startOffset: offset,
        lastY: touch.clientY,
        lastTime: Date.now(),
        velocity: 0,
      };
    },
    [offset],
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current.dragging) return;
    const touch = e.touches[0]!;
    const now = Date.now();
    const dt = now - dragRef.current.lastTime;
    if (dt > 0) {
      dragRef.current.velocity =
        (touch.clientY - dragRef.current.lastY) / dt * 16; // normalize to ~60fps
    }
    dragRef.current.lastY = touch.clientY;
    dragRef.current.lastTime = now;

    const dy = touch.clientY - dragRef.current.startY;
    setOffset(clamp(dragRef.current.startOffset + dy));
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    snapTo(clamp(offset), dragRef.current.velocity);
  }, [offset, snapTo]);

  // Mouse handlers (for desktop)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      dragRef.current = {
        dragging: true,
        startY: e.clientY,
        startOffset: offset,
        lastY: e.clientY,
        lastTime: Date.now(),
        velocity: 0,
      };
    },
    [offset],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      const now = Date.now();
      const dt = now - dragRef.current.lastTime;
      if (dt > 0) {
        dragRef.current.velocity =
          (e.clientY - dragRef.current.lastY) / dt * 16;
      }
      dragRef.current.lastY = e.clientY;
      dragRef.current.lastTime = now;

      const dy = e.clientY - dragRef.current.startY;
      setOffset(clamp(dragRef.current.startOffset + dy));
    };

    const handleMouseUp = () => {
      if (!dragRef.current.dragging) return;
      dragRef.current.dragging = false;
      setOffset((cur) => {
        snapTo(clamp(cur), dragRef.current.velocity);
        return cur;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [snapTo]);

  // Wheel handler
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      const newOffset = clamp(offset - e.deltaY);
      setOffset(newOffset);
      snapTo(newOffset, 0);
    },
    [offset, snapTo],
  );

  // The centered item index
  const centeredIndex = Math.round(-offset / ITEM_HEIGHT);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Knight Sudoku</h1>
      <p className={styles.subtitle}>
        Complete each puzzle to unlock the next.
      </p>
      <div
        ref={containerRef}
        className={styles.wheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <div
          className={styles.wheelInner}
          style={{
            transform: `translateY(${offset}px)`,
          }}
        >
          {ALL_PUZZLES.map((puzzle, index) => {
            const distFromCenter = index - centeredIndex;
            const absDist = Math.abs(distFromCenter);

            // Scale: 1 at center, shrinks outward
            const scale = Math.max(0.65, 1 - absDist * 0.08);
            // Opacity: 1 at center, fades outward
            const opacity = Math.max(0.15, 1 - absDist * 0.2);

            const unlocked = isUnlocked(puzzle.id);
            const completed = isCompleted(puzzle.id);
            const isCentered = index === centeredIndex;

            const rowClass = [
              styles.puzzleRow,
              !unlocked ? styles.locked : "",
              completed ? styles.completedRow : "",
              isCentered ? styles.centered : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={puzzle.id}
                className={rowClass}
                style={{
                  transform: `scale(${scale})`,
                  opacity,
                  height: ITEM_HEIGHT,
                }}
                onClick={() => {
                  if (isCentered && unlocked) {
                    onSelect(puzzle.id);
                  } else {
                    // Snap to this item
                    if (animRef.current) cancelAnimationFrame(animRef.current);
                    snapTo(-index * ITEM_HEIGHT, 0);
                  }
                }}
                type="button"
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

        {/* Fade edges */}
        <div className={styles.fadeTop} />
        <div className={styles.fadeBottom} />
      </div>

      {/* Play button for centered item */}
      {isUnlocked(ALL_PUZZLES[centeredIndex]?.id ?? 1) && (
        <button
          className={styles.playButton}
          onClick={() => onSelect(ALL_PUZZLES[centeredIndex]?.id ?? 1)}
          type="button"
        >
          Play
        </button>
      )}
    </div>
  );
}
