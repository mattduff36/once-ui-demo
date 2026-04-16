import { PIECE_ORDER } from "@/lib/game/constants";
import type { PieceType } from "@/lib/game/types";

export const createSeededRandom = (seed = Date.now()) => {
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
};

const shuffleBag = (random: () => number): PieceType[] => {
  const bag = [...PIECE_ORDER];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
};

export class BagRandomizer {
  private bag: PieceType[] = [];
  private readonly random: () => number;

  constructor(seed?: number) {
    this.random = createSeededRandom(seed);
  }

  next(): PieceType {
    if (this.bag.length === 0) {
      this.bag = shuffleBag(this.random);
    }
    return this.bag.shift() as PieceType;
  }
}
