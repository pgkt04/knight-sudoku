import { useState, useCallback, useEffect } from "react";
import type { Difficulty, Puzzle } from "./game/types";
import { getPuzzleById, gridToBoard } from "./game/puzzles";
import type { PuzzlePack } from "./game/puzzles";
import { useGame } from "./hooks/useGame";
import { useTimer } from "./hooks/useTimer";
import { useProgress } from "./hooks/useProgress";
import { BoardView } from "./components/Board";
import { NumberPad } from "./components/NumberPad";
import { Controls } from "./components/Controls";
import { Timer } from "./components/Timer";
import { PuzzleSelect } from "./components/PuzzleSelect";
import { GameOverModal } from "./components/GameOverModal";
import styles from "./App.module.css";

type Screen = "menu" | "playing";

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [activePuzzleId, setActivePuzzleId] = useState<number | null>(null);
  const { markCompleted, isCompleted, isUnlocked } = useProgress();

  const handleSelectPuzzle = useCallback((puzzleId: number) => {
    setActivePuzzleId(puzzleId);
    setScreen("playing");
  }, []);

  const handleBack = useCallback(() => {
    setActivePuzzleId(null);
    setScreen("menu");
  }, []);

  const handleComplete = useCallback(
    (puzzleId: number) => {
      markCompleted(puzzleId);
    },
    [markCompleted],
  );

  if (screen === "menu" || activePuzzleId == null) {
    return (
      <PuzzleSelect
        onSelect={handleSelectPuzzle}
        isCompleted={isCompleted}
        isUnlocked={isUnlocked}
      />
    );
  }

  const puzzlePack = getPuzzleById(activePuzzleId);
  if (!puzzlePack) {
    return (
      <PuzzleSelect
        onSelect={handleSelectPuzzle}
        isCompleted={isCompleted}
        isUnlocked={isUnlocked}
      />
    );
  }

  const puzzle: Puzzle = {
    board: gridToBoard(puzzlePack.grid),
    solution: puzzlePack.solution,
    difficulty: starsToLabel(puzzlePack.stars),
  };

  return (
    <GameScreen
      key={puzzlePack.id}
      puzzle={puzzle}
      puzzlePack={puzzlePack}
      onBack={handleBack}
      onComplete={handleComplete}
    />
  );
}

function starsToLabel(stars: number): Difficulty {
  if (stars <= 2) return "easy";
  if (stars <= 4) return "medium";
  if (stars <= 6) return "hard";
  return "expert";
}

// ── Game Screen ──

function GameScreen({
  puzzle,
  puzzlePack,
  onBack,
  onComplete,
}: {
  puzzle: Puzzle;
  puzzlePack: PuzzlePack;
  onBack: () => void;
  onComplete: (puzzleId: number) => void;
}) {
  const {
    state,
    selectCell,
    placeDigit,
    erase,
    togglePencil,
    undo,
    redo,
    conflicts,
    flashVersions,
    knightMoves,
  } = useGame(puzzle);

  const { formatted, reset } = useTimer(!state.isComplete);

  // Reset timer when puzzle changes
  useEffect(() => {
    reset();
  }, [puzzle, reset]);

  // Mark completed when puzzle is solved
  useEffect(() => {
    if (state.isComplete) {
      onComplete(puzzlePack.id);
    }
  }, [state.isComplete, puzzlePack.id, onComplete]);

  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={onBack}
          type="button"
        >
          ← Back
        </button>
        <span className={styles.puzzleLabel}>
          Puzzle #{puzzlePack.id}
        </span>
        <div className={styles.headerRight}>
          <Timer formatted={formatted} />
        </div>
      </div>

      <BoardView
        board={state.board}
        selectedCell={state.selectedCell}
        conflicts={conflicts}
        flashVersions={flashVersions}
        knightMoves={knightMoves}
        onCellClick={selectCell}
      />

      <Controls
        onUndo={undo}
        onRedo={redo}
        onErase={erase}
        onTogglePencil={togglePencil}
        pencilMode={state.pencilMode}
        canUndo={state.undoStack.length > 0}
        canRedo={state.redoStack.length > 0}
      />

      <NumberPad onDigit={placeDigit} />

      {state.isComplete && (
        <GameOverModal
          time={formatted}
          difficulty={`Puzzle #${puzzlePack.id} · ${"★".repeat(puzzlePack.stars)}`}
          onNewGame={onBack}
        />
      )}
    </div>
  );
}
