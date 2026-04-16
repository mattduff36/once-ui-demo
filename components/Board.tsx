"use client";

import { BOARD_WIDTH, HIDDEN_ROWS, PIECE_COLORS } from "@/lib/game/constants";
import { getCells } from "@/lib/game/rotation";
import type { CellValue, GameSnapshot, PieceType } from "@/lib/game/types";

interface BoardProps {
  snapshot: GameSnapshot;
  onRestart?: () => void;
  onResume?: () => void;
  onToggleSound?: () => void;
}

const GHOST_ALPHA = "55";

const getCellColor = (piece: PieceType, ghost = false): string =>
  ghost ? `${PIECE_COLORS[piece]}${GHOST_ALPHA}` : PIECE_COLORS[piece];

const createRenderGrid = (snapshot: GameSnapshot): CellValue[][] => {
  const board = snapshot.visibleBoard.map((row) => [...row]);

  // During the clearing animation the filled rows stay on the board; we paint
  // them with the piece colours already stored there and skip the ghost/active
  // overlays so the flash animation reads cleanly.
  if (snapshot.clearingLines.length > 0) {
    return board;
  }

  const activeCells = getCells(snapshot.activePiece);
  // Only draw the ghost once the active piece has at least one cell inside the
  // visible board. Without this check the ghost appears several rows before the
  // freshly-spawned piece is visible at the top of the screen.
  const activeIsVisible = activeCells.some(([, y]) => y >= HIDDEN_ROWS);

  if (activeIsVisible) {
    const ghostPiece = { ...snapshot.activePiece, y: snapshot.ghostY };
    for (const [x, y] of getCells(ghostPiece)) {
      const visibleY = y - HIDDEN_ROWS;
      if (
        visibleY >= 0 &&
        visibleY < board.length &&
        x >= 0 &&
        x < BOARD_WIDTH &&
        !board[visibleY][x]
      ) {
        board[visibleY][x] = `ghost:${snapshot.activePiece.type}`;
      }
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

export function Board({ snapshot, onRestart, onResume, onToggleSound }: BoardProps) {
  const renderGrid = createRenderGrid(snapshot);
  const clearingVisibleRows = new Set(
    snapshot.clearingLines
      .map((row) => row - HIDDEN_ROWS)
      .filter((row) => row >= 0 && row < renderGrid.length)
  );

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
                style = {
                  background: getCellColor(piece, true),
                  borderColor: `${PIECE_COLORS[piece]}99`
                };
                className = "cell ghost";
              } else {
                const piece = cell as PieceType;
                style = {
                  background: getCellColor(piece),
                  borderColor: `${PIECE_COLORS[piece]}cc`
                };
                className = "cell filled";
              }
            }
            if (clearingVisibleRows.has(y)) {
              className += " clearing";
            }
            return <div key={`${x}-${y}`} className={className} style={style} />;
          })
        )}
      </div>
      {(snapshot.paused || snapshot.gameOver) && (
        <div className="board-overlay">
          <p className="overlay-brand">Block Stack</p>
          <p className="overlay-title">{snapshot.gameOver ? "Game Over" : "Paused"}</p>
          <p className="overlay-subtitle">
            {snapshot.gameOver
              ? `Final score ${snapshot.score.toLocaleString()}`
              : "Use Start on the controls to resume."}
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
          <div className="overlay-actions">
            {onToggleSound ? (
              <button
                type="button"
                className="overlay-btn secondary"
                onClick={onToggleSound}
                aria-label={snapshot.soundEnabled ? "Mute sound" : "Enable sound"}
              >
                {snapshot.soundEnabled ? "Sound: On" : "Sound: Off"}
              </button>
            ) : null}
            {!snapshot.gameOver && onRestart ? (
              <button type="button" className="overlay-btn secondary danger" onClick={onRestart}>
                Restart
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
