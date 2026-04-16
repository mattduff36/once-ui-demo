"use client";

import { BOARD_WIDTH, HIDDEN_ROWS, PIECE_COLORS } from "@/lib/game/constants";
import { getCells } from "@/lib/game/rotation";
import type { CellValue, GameSnapshot, PieceType } from "@/lib/game/types";

interface BoardProps {
  snapshot: GameSnapshot;
  onRestart?: () => void;
  onResume?: () => void;
}

const GHOST_ALPHA = "55";

const getCellColor = (piece: PieceType, ghost = false): string =>
  ghost ? `${PIECE_COLORS[piece]}${GHOST_ALPHA}` : PIECE_COLORS[piece];

const createRenderGrid = (snapshot: GameSnapshot): CellValue[][] => {
  const board = snapshot.visibleBoard.map((row) => [...row]);
  const ghostPiece = { ...snapshot.activePiece, y: snapshot.ghostY };
  const ghostCells = getCells(ghostPiece);
  const activeCells = getCells(snapshot.activePiece);

  for (const [x, y] of ghostCells) {
    const visibleY = y - HIDDEN_ROWS;
    if (visibleY >= 0 && visibleY < board.length && x >= 0 && x < BOARD_WIDTH && !board[visibleY][x]) {
      board[visibleY][x] = `ghost:${ghostPiece.type}`;
    }
  }

  for (const [x, y] of activeCells) {
    const visibleY = y - HIDDEN_ROWS;
    if (visibleY >= 0 && visibleY < board.length && x >= 0 && x < BOARD_WIDTH) {
      board[visibleY][x] = snapshot.activePiece.type;
    }
  }

  return board;
};

export function Board({ snapshot, onRestart, onResume }: BoardProps) {
  const renderGrid = createRenderGrid(snapshot);

  return (
    <div className="board-shell">
      <div className="board-grid no-select" role="img" aria-label="Game board">
        {renderGrid.map((row, y) =>
          row.map((cell, x) => {
            let style: React.CSSProperties = {};
            let className = "cell";
            if (cell) {
              if (typeof cell === "string" && cell.startsWith("ghost:")) {
                const piece = cell.replace("ghost:", "") as PieceType;
                style = { background: getCellColor(piece, true), borderColor: `${PIECE_COLORS[piece]}99` };
                className = "cell ghost";
              } else {
                const piece = cell as PieceType;
                style = { background: getCellColor(piece), borderColor: `${PIECE_COLORS[piece]}cc` };
                className = "cell filled";
              }
            }
            return <div key={`${x}-${y}`} className={className} style={style} />;
          })
        )}
      </div>
      {(snapshot.paused || snapshot.gameOver) && (
        <div className="board-overlay">
          <p className="overlay-title">{snapshot.gameOver ? "Game Over" : "Paused"}</p>
          <p className="overlay-subtitle">
            {snapshot.gameOver ? "Tap play again to retry." : "Tap resume to continue."}
          </p>
          {snapshot.gameOver && onRestart ? (
            <button type="button" className="overlay-btn" onClick={onRestart}>
              Play Again
            </button>
          ) : null}
          {!snapshot.gameOver && snapshot.paused && onResume ? (
            <button type="button" className="overlay-btn" onClick={onResume}>
              Resume
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
