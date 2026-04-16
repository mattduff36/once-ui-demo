"use client";

import { PREVIEW_BOX_SIZE, TETROMINO_SHAPES } from "@/lib/game/constants";
import { pieceToColor } from "@/lib/game/rotation";
import type { PieceType, RotationState } from "@/lib/game/types";

interface PiecePreviewProps {
  piece: PieceType | null;
  label?: string;
  dimmed?: boolean;
  variant?: "panel" | "mini";
}

const EMPTY_CELLS = Array.from({ length: PREVIEW_BOX_SIZE * PREVIEW_BOX_SIZE }, (_, index) => index);

export function PiecePreview({ piece, label, dimmed = false, variant = "panel" }: PiecePreviewProps) {
  const activeCells = new Set<number>();

  if (piece) {
    const shape = TETROMINO_SHAPES[piece][0 as RotationState];
    for (const [x, y] of shape) {
      activeCells.add(y * PREVIEW_BOX_SIZE + x);
    }
  }

  const classes = ["piece-preview"];
  if (variant === "panel") classes.push("panel");
  if (variant === "mini") classes.push("mini");
  if (dimmed) classes.push("dimmed");

  return (
    <div className={classes.join(" ")}>
      {label ? <div className="panel-title">{label}</div> : null}
      <div className="preview-grid" aria-label={label ? `${label} piece preview` : "piece preview"}>
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
                      boxShadow: `0 0 6px ${pieceToColor(piece)}66`
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
