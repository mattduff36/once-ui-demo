"use client";

import { PREVIEW_BOX_SIZE, TETROMINO_SHAPES } from "@/lib/game/constants";
import { pieceToColor } from "@/lib/game/rotation";
import type { PieceType, RotationState } from "@/lib/game/types";

interface PiecePreviewProps {
  piece: PieceType | null;
  label: string;
  dimmed?: boolean;
}

const EMPTY_CELLS = Array.from({ length: PREVIEW_BOX_SIZE * PREVIEW_BOX_SIZE }, (_, index) => index);

export function PiecePreview({ piece, label, dimmed = false }: PiecePreviewProps) {
  const activeCells = new Set<number>();

  if (piece) {
    const shape = TETROMINO_SHAPES[piece][0 as RotationState];
    for (const [x, y] of shape) {
      activeCells.add(y * PREVIEW_BOX_SIZE + x);
    }
  }

  return (
    <div className={`panel piece-preview ${dimmed ? "dimmed" : ""}`}>
      <div className="panel-title">{label}</div>
      <div className="preview-grid" aria-label={`${label} piece preview`}>
        {EMPTY_CELLS.map((cell) => {
          const filled = activeCells.has(cell) && piece;
          return (
            <div
              key={cell}
              className={`preview-cell ${filled ? "filled" : ""}`}
              style={
                filled
                  ? {
                      background: pieceToColor(piece),
                      boxShadow: `0 0 8px ${pieceToColor(piece)}66`
                    }
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
