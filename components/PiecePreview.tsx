"use client";

import { pieceToColor } from "@/lib/game/rotation";
import type { PieceType } from "@/lib/game/types";

interface PiecePreviewProps {
  piece: PieceType | null;
  label?: string;
  dimmed?: boolean;
  variant?: "panel" | "mini";
}

const PREVIEW_WIDTH = 3;
const PREVIEW_HEIGHT = 4;
const EMPTY_CELLS = Array.from({ length: PREVIEW_WIDTH * PREVIEW_HEIGHT }, (_, index) => index);

const PREVIEW_SHAPES: Record<PieceType, [number, number][]> = {
  // Force I vertical in previews to reduce horizontal footprint.
  I: [
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3]
  ],
  O: [
    [0, 1],
    [1, 1],
    [0, 2],
    [1, 2]
  ],
  T: [
    [1, 1],
    [0, 2],
    [1, 2],
    [2, 2]
  ],
  S: [
    [1, 1],
    [2, 1],
    [0, 2],
    [1, 2]
  ],
  Z: [
    [0, 1],
    [1, 1],
    [1, 2],
    [2, 2]
  ],
  J: [
    [0, 1],
    [0, 2],
    [1, 2],
    [2, 2]
  ],
  L: [
    [2, 1],
    [0, 2],
    [1, 2],
    [2, 2]
  ]
};

export function PiecePreview({ piece, label, dimmed = false, variant = "panel" }: PiecePreviewProps) {
  const activeCells = new Set<number>();

  if (piece) {
    const shape = PREVIEW_SHAPES[piece];
    for (const [x, y] of shape) {
      activeCells.add(y * PREVIEW_WIDTH + x);
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
                      boxShadow: `0 0 6px ${pieceToColor(piece)}66`,
                      // In a 3-column preview, offset O by half a cell so it reads centred.
                      transform: piece === "O" ? "translateX(50%)" : undefined
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
