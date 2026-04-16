import type { PieceType, RotationState } from "@/lib/game/types";

export const BOARD_WIDTH = 10;
export const VISIBLE_BOARD_HEIGHT = 20;
export const HIDDEN_ROWS = 4;
export const BOARD_HEIGHT = VISIBLE_BOARD_HEIGHT + HIDDEN_ROWS;
export const PREVIEW_COUNT = 5;

export const LOCK_DELAY_MS = 500;
export const MAX_LOCK_RESETS = 15;
export const DAS_MS = 120;
export const ARR_MS = 28;
export const SOFT_DROP_MULTIPLIER = 20;
export const LINES_PER_LEVEL = 10;

export const SOFT_DROP_POINTS_PER_CELL = 1;
export const HARD_DROP_POINTS_PER_CELL = 2;

export const PIECE_ORDER: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];

export const PIECE_COLORS: Record<PieceType, string> = {
  I: "#2bd6ff",
  O: "#ffd633",
  T: "#a166ff",
  S: "#40e26f",
  Z: "#ff5c74",
  J: "#5b8dff",
  L: "#ff9e3d"
};

export const TETROMINO_SHAPES: Record<PieceType, Record<RotationState, [number, number][]>> = {
  I: {
    0: [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1]
    ],
    1: [
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3]
    ],
    2: [
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2]
    ],
    3: [
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3]
    ]
  },
  O: {
    0: [
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1]
    ],
    1: [
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1]
    ],
    2: [
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1]
    ],
    3: [
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1]
    ]
  },
  T: {
    0: [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1]
    ],
    1: [
      [1, 0],
      [1, 1],
      [2, 1],
      [1, 2]
    ],
    2: [
      [0, 1],
      [1, 1],
      [2, 1],
      [1, 2]
    ],
    3: [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, 2]
    ]
  },
  S: {
    0: [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1]
    ],
    1: [
      [1, 0],
      [1, 1],
      [2, 1],
      [2, 2]
    ],
    2: [
      [1, 1],
      [2, 1],
      [0, 2],
      [1, 2]
    ],
    3: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2]
    ]
  },
  Z: {
    0: [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1]
    ],
    1: [
      [2, 0],
      [1, 1],
      [2, 1],
      [1, 2]
    ],
    2: [
      [0, 1],
      [1, 1],
      [1, 2],
      [2, 2]
    ],
    3: [
      [1, 0],
      [0, 1],
      [1, 1],
      [0, 2]
    ]
  },
  J: {
    0: [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1]
    ],
    1: [
      [1, 0],
      [2, 0],
      [1, 1],
      [1, 2]
    ],
    2: [
      [0, 1],
      [1, 1],
      [2, 1],
      [2, 2]
    ],
    3: [
      [1, 0],
      [1, 1],
      [0, 2],
      [1, 2]
    ]
  },
  L: {
    0: [
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1]
    ],
    1: [
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 2]
    ],
    2: [
      [0, 1],
      [1, 1],
      [2, 1],
      [0, 2]
    ],
    3: [
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2]
    ]
  }
};

export const SPAWN_POSITION: Record<PieceType, { x: number; y: number }> = {
  I: { x: 3, y: 0 },
  O: { x: 3, y: 0 },
  T: { x: 3, y: 0 },
  S: { x: 3, y: 0 },
  Z: { x: 3, y: 0 },
  J: { x: 3, y: 0 },
  L: { x: 3, y: 0 }
};

// y-offset follows SRS notation (positive is upward), convert to board space in rotation.ts.
export const SRS_KICKS_JLSTZ: Record<string, [number, number][]> = {
  "0>1": [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2]
  ],
  "1>0": [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2]
  ],
  "1>2": [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2]
  ],
  "2>1": [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2]
  ],
  "2>3": [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2]
  ],
  "3>2": [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2]
  ],
  "3>0": [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2]
  ],
  "0>3": [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2]
  ]
};

export const SRS_KICKS_I: Record<string, [number, number][]> = {
  "0>1": [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2]
  ],
  "1>0": [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2]
  ],
  "1>2": [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1]
  ],
  "2>1": [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1]
  ],
  "2>3": [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2]
  ],
  "3>2": [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2]
  ],
  "3>0": [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1]
  ],
  "0>3": [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1]
  ]
};

export const SCORE_LINE_CLEARS: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800
};

export const SCORE_T_SPIN: Record<number, number> = {
  0: 400,
  1: 800,
  2: 1200,
  3: 1600
};

export const BACK_TO_BACK_BONUS = 1.5;
export const COMBO_BASE = 50;

export const PERFECT_CLEAR_BONUS = 1800;

export const GRAVITY_TABLE_MS = [
  800, 716, 633, 550, 466, 383, 300, 216, 133, 100, 83, 83, 66, 66, 50, 50, 33, 33, 33, 16
];

export const T_SPIN_CORNERS: [number, number][] = [
  [0, 0],
  [2, 0],
  [0, 2],
  [2, 2]
];

export const PREVIEW_BOX_SIZE = 4;
