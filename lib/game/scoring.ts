import {
  BACK_TO_BACK_BONUS,
  COMBO_BASE,
  GRAVITY_TABLE_MS,
  HARD_DROP_POINTS_PER_CELL,
  PERFECT_CLEAR_BONUS,
  SCORE_LINE_CLEARS,
  SCORE_T_SPIN,
  SOFT_DROP_POINTS_PER_CELL
} from "@/lib/game/constants";

export const getGravityMs = (level: number): number => {
  const idx = Math.max(0, Math.min(level - 1, GRAVITY_TABLE_MS.length - 1));
  return GRAVITY_TABLE_MS[idx];
};

interface ScoreInput {
  level: number;
  linesCleared: number;
  isTSpin: boolean;
  usedBackToBack: boolean;
  combo: number;
  perfectClear: boolean;
  softDropCells: number;
  hardDropCells: number;
}

export const getLockScore = (input: ScoreInput): number => {
  const {
    level,
    linesCleared,
    isTSpin,
    usedBackToBack,
    combo,
    perfectClear,
    softDropCells,
    hardDropCells
  } = input;

  let base = 0;
  if (isTSpin) {
    base = SCORE_T_SPIN[Math.min(linesCleared, 3)] ?? 0;
  } else if (linesCleared > 0) {
    base = SCORE_LINE_CLEARS[linesCleared] ?? 0;
  }

  if (usedBackToBack && (isTSpin || linesCleared === 4) && linesCleared > 0) {
    base = Math.floor(base * BACK_TO_BACK_BONUS);
  }

  if (combo > 0 && linesCleared > 0) {
    base += COMBO_BASE * combo;
  }

  if (perfectClear && linesCleared > 0) {
    base += PERFECT_CLEAR_BONUS;
  }

  const levelScore = base * level;
  const dropScore = softDropCells * SOFT_DROP_POINTS_PER_CELL + hardDropCells * HARD_DROP_POINTS_PER_CELL;
  return levelScore + dropScore;
};

export const getClearText = (
  linesCleared: number,
  isTSpin: boolean,
  usedBackToBack: boolean,
  combo: number
): string => {
  let clear = "";

  if (isTSpin) {
    if (linesCleared === 0) {
      clear = "T-Spin";
    } else if (linesCleared === 1) {
      clear = "T-Spin Single";
    } else if (linesCleared === 2) {
      clear = "T-Spin Double";
    } else {
      clear = "T-Spin Triple";
    }
  } else if (linesCleared === 1) {
    clear = "Single";
  } else if (linesCleared === 2) {
    clear = "Double";
  } else if (linesCleared === 3) {
    clear = "Triple";
  } else if (linesCleared === 4) {
    clear = "Quad";
  }

  if (usedBackToBack && (isTSpin || linesCleared === 4) && linesCleared > 0) {
    clear = `B2B ${clear}`;
  }

  if (combo > 0 && linesCleared > 0) {
    clear = `${clear} Combo x${combo + 1}`;
  }

  return clear;
};
