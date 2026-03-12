import type { Board, Coord } from "../game/types";
import { CellView } from "./Cell";
import styles from "./Board.module.css";

interface BoardProps {
  board: Board;
  selectedCell: Coord | null;
  conflicts: Coord[];
  knightMoves: Coord[];
  onCellClick: (coord: Coord) => void;
}

export function BoardView({
  board,
  selectedCell,
  conflicts,
  knightMoves,
  onCellClick,
}: BoardProps) {
  const conflictSet = new Set(conflicts.map((c) => `${c.row},${c.col}`));
  const knightSet = new Set(knightMoves.map((c) => `${c.row},${c.col}`));

  return (
    <div className={styles.board}>
      {board.flatMap((row, r) =>
        row.map((cell, c) => {
          const key = `${r},${c}`;
          const isSelected =
            selectedCell?.row === r && selectedCell?.col === c;
          const isHighlighted =
            !isSelected &&
            selectedCell != null &&
            (selectedCell.row === r ||
              selectedCell.col === c ||
              (Math.floor(selectedCell.row / 3) === Math.floor(r / 3) &&
                Math.floor(selectedCell.col / 3) === Math.floor(c / 3)));

          return (
            <CellView
              key={key}
              row={r}
              col={c}
              value={cell.value}
              given={cell.given}
              pencilMarks={cell.pencilMarks}
              selected={isSelected}
              highlighted={isHighlighted}
              knightHighlight={knightSet.has(key)}
              conflict={conflictSet.has(key)}
              onClick={() => onCellClick({ row: r, col: c })}
            />
          );
        }),
      )}
    </div>
  );
}
