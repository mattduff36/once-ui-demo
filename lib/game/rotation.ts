import { BOARD_HEIGHT, BOARD_WIDTH, PIECE_COLORS, SRS_KICKS_I, SRS_KICKS_JLSTZ, TETROMINO_SHAPES } from "@/lib/game/constants";
import type { ActivePiece, CellValue, PieceType, RotationDirection, RotationState } from "@/lib/game/types";

export const getCells = (piece: ActivePiece): [number, number][] => {
  const cells = TETROMINO_SHAPES[piece.type][piece.rotation];
  return cells.map(([x, y]) => [x + piece.x, y + piece.y]);
};

export const canPlace = (board: CellValue[][], piece: ActivePiece): boolean => {
  const cells = getCells(piece);
  for (const [x, y] of cells) {
    if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) {
      return false;
    }
    if (y >= 0 && board[y][x]) {
      return false;
    }
  }
  return true;
};

export const rotateState = (state: RotationState, direction: RotationDirection): RotationState => {
  if (direction === "cw") {
    return ((state + 1) % 4) as RotationState;
  }
  return ((state + 3) % 4) as RotationState;
};

export const getKickTests = (
  type: PieceType,
  fromState: RotationState,
  toState: RotationState
): [number, number][] => {
  if (type === "O") {
    return [[0, 0]];
  }
  const key = `${fromState}>${toState}`;
  if (type === "I") {
    return SRS_KICKS_I[key] ?? [[0, 0]];
  }
  return SRS_KICKS_JLSTZ[key] ?? [[0, 0]];
};

export const tryRotate = (
  board: CellValue[][],
  active: ActivePiece,
  direction: RotationDirection
): ActivePiece | null => {
  const nextRotation = rotateState(active.rotation, direction);
  const kicks = getKickTests(active.type, active.rotation, nextRotation);
  for (const [kickX, kickY] of kicks) {
    const rotated: ActivePiece = {
      ...active,
      rotation: nextRotation,
      x: active.x + kickX,
      y: active.y - kickY
    };
    if (canPlace(board, rotated)) {
      return rotated;
    }
  }
  return null;
};

export const pieceToColor = (piece: PieceType) => PIECE_COLORS[piece];

export const getGhostY = (board: CellValue[][], active: ActivePiece): number => {
  let y = active.y;
  while (
    canPlace(board, {
      ...active,
      y: y + 1
    })
  ) {
    y += 1;
  }
  return y;
};
