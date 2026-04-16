export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
export type RotationState = 0 | 1 | 2 | 3;
export type RotationDirection = "cw" | "ccw";
export type MoveDirection = "left" | "right";
export type CellValue = PieceType | `ghost:${PieceType}` | null;

export interface Point {
  x: number;
  y: number;
}

export interface ActivePiece {
  type: PieceType;
  rotation: RotationState;
  x: number;
  y: number;
}

export interface LockResult {
  linesCleared: number;
  isTSpin: boolean;
  usedBackToBack: boolean;
  perfectClear: boolean;
  scoreDelta: number;
  gameOver: boolean;
}

export interface GameSnapshot {
  board: CellValue[][];
  visibleBoard: CellValue[][];
  activePiece: ActivePiece;
  ghostY: number;
  holdPiece: PieceType | null;
  canHold: boolean;
  nextQueue: PieceType[];
  score: number;
  highScore: number;
  lines: number;
  level: number;
  combo: number;
  backToBack: boolean;
  paused: boolean;
  gameOver: boolean;
  soundEnabled: boolean;
  lastClearText: string;
  clearingLines: number[];
}

export type GameEventType = "rotate" | "line-clear" | "hard-drop" | "game-over";

export interface GameEvent {
  type: GameEventType;
  linesCleared?: number;
}

export interface ActionResult {
  changed: boolean;
  events: GameEvent[];
}

export interface TickResult {
  changed: boolean;
  lockResult: LockResult | null;
}
