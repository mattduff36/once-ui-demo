import {
  ARR_MS,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  DAS_MS,
  HIDDEN_ROWS,
  LINES_PER_LEVEL,
  LOCK_DELAY_MS,
  MAX_LOCK_RESETS,
  PREVIEW_COUNT,
  SOFT_DROP_MULTIPLIER,
  SPAWN_POSITION,
  T_SPIN_CORNERS
} from "@/lib/game/constants";
import { BagRandomizer } from "@/lib/game/random";
import { getClearText, getGravityMs, getLockScore } from "@/lib/game/scoring";
import { canPlace, getCells, getGhostY, tryRotate } from "@/lib/game/rotation";
import type {
  ActivePiece,
  CellValue,
  GameSnapshot,
  LockResult,
  MoveDirection,
  PieceType,
  TickResult
} from "@/lib/game/types";

interface InternalState {
  board: CellValue[][];
  active: ActivePiece;
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
}

const createBoard = (): CellValue[][] =>
  Array.from({ length: BOARD_HEIGHT }, () => Array<CellValue>(BOARD_WIDTH).fill(null));

const cloneBoard = (board: CellValue[][]): CellValue[][] => board.map((row) => [...row]);

const isPerfectClear = (board: CellValue[][]): boolean =>
  board.every((row) => row.every((cell) => cell === null));

const getSpawnPiece = (type: PieceType): ActivePiece => {
  const spawn = SPAWN_POSITION[type];
  return { type, rotation: 0, x: spawn.x, y: spawn.y };
};

const clearLines = (board: CellValue[][]): { board: CellValue[][]; linesCleared: number } => {
  const kept = board.filter((row) => row.some((cell) => cell === null));
  const linesCleared = BOARD_HEIGHT - kept.length;
  while (kept.length < BOARD_HEIGHT) {
    kept.unshift(Array<CellValue>(BOARD_WIDTH).fill(null));
  }
  return { board: kept, linesCleared };
};

export class GameEngine {
  private readonly randomizer: BagRandomizer;
  private state: InternalState;
  private gravityMs = 0;
  private lockMs = 0;
  private lockResets = 0;
  private moveDirection: MoveDirection | null = null;
  private dasMs = 0;
  private arrMs = 0;
  private softDrop = false;
  private lastMoveWasRotate = false;
  private pendingSoftDropCells = 0;

  constructor(seed?: number) {
    this.randomizer = new BagRandomizer(seed);
    const first = this.randomizer.next();
    this.state = {
      board: createBoard(),
      active: getSpawnPiece(first),
      holdPiece: null,
      canHold: true,
      nextQueue: [],
      score: 0,
      highScore: 0,
      lines: 0,
      level: 1,
      combo: -1,
      backToBack: false,
      paused: false,
      gameOver: false,
      soundEnabled: false,
      lastClearText: ""
    };
    this.fillQueue();
    if (!canPlace(this.state.board, this.state.active)) {
      this.state.gameOver = true;
    }
  }

  private fillQueue(): void {
    while (this.state.nextQueue.length < PREVIEW_COUNT + 2) {
      this.state.nextQueue.push(this.randomizer.next());
    }
  }

  private spawnFromQueue(): void {
    this.fillQueue();
    const next = this.state.nextQueue.shift();
    if (!next) {
      this.state.gameOver = true;
      return;
    }
    this.state.active = getSpawnPiece(next);
    this.state.canHold = true;
    this.lastMoveWasRotate = false;
    this.lockMs = 0;
    this.lockResets = 0;
    this.pendingSoftDropCells = 0;
    if (!canPlace(this.state.board, this.state.active)) {
      this.state.gameOver = true;
    }
  }

  private isGrounded(): boolean {
    return !canPlace(this.state.board, { ...this.state.active, y: this.state.active.y + 1 });
  }

  private maybeResetLock(): void {
    if (this.isGrounded() && this.lockResets < MAX_LOCK_RESETS) {
      this.lockMs = 0;
      this.lockResets += 1;
    }
  }

  private move(dx: number): boolean {
    const candidate: ActivePiece = { ...this.state.active, x: this.state.active.x + dx };
    if (!canPlace(this.state.board, candidate)) {
      return false;
    }
    this.state.active = candidate;
    this.lastMoveWasRotate = false;
    this.maybeResetLock();
    return true;
  }

  private stepDown(trackSoftDrop: boolean): boolean {
    const candidate: ActivePiece = { ...this.state.active, y: this.state.active.y + 1 };
    if (!canPlace(this.state.board, candidate)) {
      return false;
    }
    this.state.active = candidate;
    this.lastMoveWasRotate = false;
    this.lockMs = 0;
    if (trackSoftDrop) {
      this.pendingSoftDropCells += 1;
    }
    return true;
  }

  private lockPiece(hardDropCells: number): LockResult {
    const board = cloneBoard(this.state.board);
    for (const [x, y] of getCells(this.state.active)) {
      if (y >= 0 && y < BOARD_HEIGHT) {
        board[y][x] = this.state.active.type;
      }
    }

    let cornerCount = 0;
    if (this.state.active.type === "T" && this.lastMoveWasRotate) {
      for (const [cx, cy] of T_SPIN_CORNERS) {
        const x = this.state.active.x + cx;
        const y = this.state.active.y + cy;
        if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT || y < 0 || board[y][x] !== null) {
          cornerCount += 1;
        }
      }
    }

    const isTSpin = this.state.active.type === "T" && this.lastMoveWasRotate && cornerCount >= 3;
    const { board: clearedBoard, linesCleared } = clearLines(board);
    const perfectClear = linesCleared > 0 && isPerfectClear(clearedBoard);
    const difficult = (isTSpin && linesCleared > 0) || linesCleared === 4;
    const usedBackToBack = this.state.backToBack && difficult;
    const nextCombo = linesCleared > 0 ? this.state.combo + 1 : -1;

    const scoreDelta = getLockScore({
      level: this.state.level,
      linesCleared,
      isTSpin,
      usedBackToBack,
      combo: nextCombo,
      perfectClear,
      softDropCells: this.pendingSoftDropCells,
      hardDropCells
    });

    this.state.board = clearedBoard;
    this.state.score += scoreDelta;
    this.state.highScore = Math.max(this.state.highScore, this.state.score);
    this.state.lines += linesCleared;
    this.state.level = Math.floor(this.state.lines / LINES_PER_LEVEL) + 1;
    this.state.combo = nextCombo;
    if (linesCleared > 0) {
      this.state.backToBack = difficult;
    }
    this.state.lastClearText = getClearText(linesCleared, isTSpin, usedBackToBack, nextCombo);
    this.spawnFromQueue();

    return {
      linesCleared,
      isTSpin,
      usedBackToBack,
      perfectClear,
      scoreDelta,
      gameOver: this.state.gameOver
    };
  }

  tick(deltaMs: number): TickResult {
    if (this.state.paused || this.state.gameOver) {
      return { changed: false, lockResult: null };
    }

    let changed = false;
    let lockResult: LockResult | null = null;

    if (this.moveDirection) {
      this.dasMs += deltaMs;
      if (this.dasMs >= DAS_MS) {
        this.arrMs += deltaMs;
        while (this.arrMs >= ARR_MS) {
          this.arrMs -= ARR_MS;
          changed = this.move(this.moveDirection === "left" ? -1 : 1) || changed;
        }
      }
    }

    const gravityStep = this.softDrop ? Math.max(15, getGravityMs(this.state.level) / SOFT_DROP_MULTIPLIER) : getGravityMs(this.state.level);
    this.gravityMs += deltaMs;
    while (this.gravityMs >= gravityStep) {
      this.gravityMs -= gravityStep;
      const moved = this.stepDown(this.softDrop);
      if (moved) {
        changed = true;
      } else {
        this.lockMs += gravityStep;
        if (this.lockMs >= LOCK_DELAY_MS) {
          lockResult = this.lockPiece(0);
          changed = true;
          break;
        }
      }
    }

    if (lockResult?.gameOver) {
      this.state.lastClearText = "Game Over";
    }

    return { changed, lockResult };
  }

  moveLeft(): boolean {
    if (this.state.paused || this.state.gameOver) {
      return false;
    }
    return this.move(-1);
  }

  moveRight(): boolean {
    if (this.state.paused || this.state.gameOver) {
      return false;
    }
    return this.move(1);
  }

  startHorizontalRepeat(direction: MoveDirection): void {
    if (this.state.paused || this.state.gameOver) {
      return;
    }
    this.moveDirection = direction;
    this.dasMs = 0;
    this.arrMs = 0;
    this.move(direction === "left" ? -1 : 1);
  }

  stopHorizontalRepeat(direction: MoveDirection): void {
    if (this.moveDirection === direction) {
      this.moveDirection = null;
      this.dasMs = 0;
      this.arrMs = 0;
    }
  }

  rotateClockwise(): boolean {
    if (this.state.paused || this.state.gameOver) {
      return false;
    }
    const rotated = tryRotate(this.state.board, this.state.active, "cw");
    if (!rotated) {
      return false;
    }
    this.state.active = rotated;
    this.lastMoveWasRotate = true;
    this.maybeResetLock();
    return true;
  }

  rotateCounterClockwise(): boolean {
    if (this.state.paused || this.state.gameOver) {
      return false;
    }
    const rotated = tryRotate(this.state.board, this.state.active, "ccw");
    if (!rotated) {
      return false;
    }
    this.state.active = rotated;
    this.lastMoveWasRotate = true;
    this.maybeResetLock();
    return true;
  }

  softDropStart(): void {
    if (!this.state.paused && !this.state.gameOver) {
      this.softDrop = true;
    }
  }

  softDropStop(): void {
    this.softDrop = false;
  }

  hardDrop(): LockResult | null {
    if (this.state.paused || this.state.gameOver) {
      return null;
    }
    let dropped = 0;
    while (this.stepDown(false)) {
      dropped += 1;
    }
    return this.lockPiece(dropped);
  }

  hold(): boolean {
    if (this.state.paused || this.state.gameOver || !this.state.canHold) {
      return false;
    }

    const currentType = this.state.active.type;
    if (this.state.holdPiece === null) {
      this.state.holdPiece = currentType;
      this.spawnFromQueue();
    } else {
      const swap = this.state.holdPiece;
      this.state.holdPiece = currentType;
      this.state.active = getSpawnPiece(swap);
      if (!canPlace(this.state.board, this.state.active)) {
        this.state.gameOver = true;
      }
    }
    this.state.canHold = false;
    this.lastMoveWasRotate = false;
    this.pendingSoftDropCells = 0;
    this.lockMs = 0;
    this.lockResets = 0;
    return true;
  }

  togglePause(): void {
    if (!this.state.gameOver) {
      this.state.paused = !this.state.paused;
    }
  }

  restart(): void {
    const high = this.state.highScore;
    const sound = this.state.soundEnabled;
    const first = this.randomizer.next();
    this.state = {
      board: createBoard(),
      active: getSpawnPiece(first),
      holdPiece: null,
      canHold: true,
      nextQueue: [],
      score: 0,
      highScore: high,
      lines: 0,
      level: 1,
      combo: -1,
      backToBack: false,
      paused: false,
      gameOver: false,
      soundEnabled: sound,
      lastClearText: ""
    };
    this.fillQueue();
    this.gravityMs = 0;
    this.lockMs = 0;
    this.lockResets = 0;
    this.moveDirection = null;
    this.dasMs = 0;
    this.arrMs = 0;
    this.softDrop = false;
    this.lastMoveWasRotate = false;
    this.pendingSoftDropCells = 0;
    if (!canPlace(this.state.board, this.state.active)) {
      this.state.gameOver = true;
    }
  }

  setSoundEnabled(enabled: boolean): void {
    this.state.soundEnabled = enabled;
  }

  setHighScore(score: number): void {
    this.state.highScore = Math.max(score, this.state.highScore);
  }

  getSnapshot(): GameSnapshot {
    const ghostY = getGhostY(this.state.board, this.state.active);
    return {
      board: cloneBoard(this.state.board),
      visibleBoard: this.state.board.slice(HIDDEN_ROWS).map((row) => [...row]),
      activePiece: { ...this.state.active },
      ghostY,
      holdPiece: this.state.holdPiece,
      canHold: this.state.canHold,
      nextQueue: [...this.state.nextQueue],
      score: this.state.score,
      highScore: this.state.highScore,
      lines: this.state.lines,
      level: this.state.level,
      combo: this.state.combo,
      backToBack: this.state.backToBack,
      paused: this.state.paused,
      gameOver: this.state.gameOver,
      soundEnabled: this.state.soundEnabled,
      lastClearText: this.state.lastClearText
    };
  }
}
