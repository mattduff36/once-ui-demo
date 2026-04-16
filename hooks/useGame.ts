"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameEngine } from "@/lib/game/engine";
import type { GameSnapshot, MoveDirection, RotationDirection } from "@/lib/game/types";
import { SoundEngine } from "@/lib/audio/sound";
import { readHighScore, readSoundPreference, writeHighScore, writeSoundPreference } from "@/lib/storage/preferences";

interface InputHandlers {
  leftDown: () => void;
  leftUp: () => void;
  rightDown: () => void;
  rightUp: () => void;
  softDropDown: () => void;
  softDropUp: () => void;
  hardDrop: () => void;
  rotateCw: () => void;
  rotateCcw: () => void;
  hold: () => void;
  pauseToggle: () => void;
  restart: () => void;
  toggleSound: () => void;
}

export interface GameController {
  snapshot: GameSnapshot;
  input: InputHandlers;
}

const makeInitialSnapshot = (): GameSnapshot => ({
  board: [],
  visibleBoard: [],
  activePiece: { type: "I", rotation: 0, x: 0, y: 0 },
  ghostY: 0,
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
});

export const useGame = (): GameController => {
  const engineRef = useRef<GameEngine | null>(null);
  const soundRef = useRef<SoundEngine | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => makeInitialSnapshot());

  const syncSnapshot = useCallback(() => {
    if (!engineRef.current) {
      return;
    }
    const next = engineRef.current.getSnapshot();
    setSnapshot(next);
    writeHighScore(next.highScore);
  }, []);

  const playRotate = useCallback(() => {
    soundRef.current?.play("rotate");
  }, []);

  const playLineClear = useCallback((lines: number) => {
    if (lines > 0) {
      soundRef.current?.play("lineClear");
    }
  }, []);

  const playHardDrop = useCallback(() => {
    soundRef.current?.play("hardDrop");
  }, []);

  const playGameOver = useCallback(() => {
    soundRef.current?.play("gameOver");
  }, []);

  const handleLockResultSounds = useCallback(
    (lockResult: { linesCleared: number; gameOver: boolean } | null) => {
      if (!lockResult) {
        return;
      }
      playLineClear(lockResult.linesCleared);
      if (lockResult.gameOver) {
        playGameOver();
      }
    },
    [playGameOver, playLineClear]
  );

  const playHold = useCallback(() => {
    soundRef.current?.play("hold");
  }, []);

  useEffect(() => {
    const engine = new GameEngine();
    const sound = new SoundEngine();
    engineRef.current = engine;
    soundRef.current = sound;

    const savedHigh = readHighScore();
    const savedSound = readSoundPreference();
    if (savedHigh > 0) {
      engine.setHighScore(savedHigh);
    }
    engine.setSoundEnabled(savedSound);
    sound.setEnabled(savedSound);
    setSnapshot(engine.getSnapshot());

    const loop = (ts: number) => {
      if (!engineRef.current) {
        return;
      }
      if (lastTsRef.current === 0) {
        lastTsRef.current = ts;
      }
      const delta = Math.min(100, ts - lastTsRef.current);
      lastTsRef.current = ts;
      const result = engineRef.current.tick(delta);
      if (result.changed) {
        const next = engineRef.current.getSnapshot();
        setSnapshot(next);
        writeHighScore(next.highScore);
        handleLockResultSounds(result.lockResult);
      }
      frameRef.current = window.requestAnimationFrame(loop);
    };

    frameRef.current = window.requestAnimationFrame(loop);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [handleLockResultSounds]);

  const withSoundUnlock = useCallback(async () => {
    await soundRef.current?.unlock();
  }, []);

  const move = useCallback((direction: MoveDirection) => {
    void withSoundUnlock();
    if (!engineRef.current) {
      return;
    }
    if (direction === "left") {
      engineRef.current.moveLeft();
    } else {
      engineRef.current.moveRight();
    }
    syncSnapshot();
  }, [syncSnapshot, withSoundUnlock]);

  const startRepeat = useCallback((direction: MoveDirection) => {
    void withSoundUnlock();
    engineRef.current?.startHorizontalRepeat(direction);
    syncSnapshot();
  }, [syncSnapshot, withSoundUnlock]);

  const stopRepeat = useCallback((direction: MoveDirection) => {
    engineRef.current?.stopHorizontalRepeat(direction);
  }, []);

  const rotate = useCallback((direction: RotationDirection) => {
    void withSoundUnlock();
    if (!engineRef.current) {
      return;
    }
    const rotated =
      direction === "cw" ? engineRef.current.rotateClockwise() : engineRef.current.rotateCounterClockwise();
    if (rotated) {
      playRotate();
      syncSnapshot();
    }
  }, [playRotate, syncSnapshot, withSoundUnlock]);

  const startSoftDrop = useCallback(() => {
    void withSoundUnlock();
    engineRef.current?.softDropStart();
  }, [withSoundUnlock]);

  const stopSoftDrop = useCallback(() => {
    engineRef.current?.softDropStop();
  }, []);

  const hardDrop = useCallback(() => {
    void withSoundUnlock();
    if (!engineRef.current) {
      return;
    }
    const result = engineRef.current.hardDrop();
    if (result) {
      playHardDrop();
      handleLockResultSounds(result);
      syncSnapshot();
    }
  }, [handleLockResultSounds, playHardDrop, syncSnapshot, withSoundUnlock]);

  const hold = useCallback(() => {
    void withSoundUnlock();
    if (!engineRef.current) {
      return;
    }
    const swapped = engineRef.current.hold();
    if (swapped) {
      playHold();
      syncSnapshot();
    }
  }, [playHold, syncSnapshot, withSoundUnlock]);

  const togglePause = useCallback(() => {
    engineRef.current?.togglePause();
    syncSnapshot();
  }, [syncSnapshot]);

  const restart = useCallback(() => {
    void withSoundUnlock();
    engineRef.current?.restart();
    syncSnapshot();
  }, [syncSnapshot, withSoundUnlock]);

  const toggleSound = useCallback(() => {
    const current = engineRef.current?.getSnapshot().soundEnabled ?? false;
    const next = !current;
    engineRef.current?.setSoundEnabled(next);
    soundRef.current?.setEnabled(next);
    writeSoundPreference(next);
    void withSoundUnlock();
    syncSnapshot();
  }, [syncSnapshot, withSoundUnlock]);

  useEffect(() => {
    const held = {
      left: false,
      right: false,
      down: false
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === "arrowleft" || key === "a") {
        event.preventDefault();
        if (!held.left) {
          startRepeat("left");
          held.left = true;
        }
        return;
      }

      if (key === "arrowright" || key === "d") {
        event.preventDefault();
        if (!held.right) {
          startRepeat("right");
          held.right = true;
        }
        return;
      }

      if (key === "arrowdown" || key === "s") {
        event.preventDefault();
        if (!held.down) {
          startSoftDrop();
          held.down = true;
        }
        return;
      }

      if (event.repeat) {
        return;
      }

      if (key === "arrowup" || key === "x") {
        event.preventDefault();
        rotate("cw");
      } else if (key === "z") {
        event.preventDefault();
        rotate("ccw");
      } else if (key === " ") {
        event.preventDefault();
        hardDrop();
      } else if (key === "c" || event.key === "Shift") {
        event.preventDefault();
        hold();
      } else if (key === "p" || key === "escape") {
        event.preventDefault();
        togglePause();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") {
        stopRepeat("left");
        held.left = false;
      } else if (key === "arrowright" || key === "d") {
        stopRepeat("right");
        held.right = false;
      } else if (key === "arrowdown" || key === "s") {
        stopSoftDrop();
        held.down = false;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      stopRepeat("left");
      stopRepeat("right");
      stopSoftDrop();
    };
  }, [hardDrop, hold, rotate, startRepeat, startSoftDrop, stopRepeat, stopSoftDrop, togglePause]);

  const input = useMemo<InputHandlers>(
    () => ({
      leftDown: () => startRepeat("left"),
      leftUp: () => stopRepeat("left"),
      rightDown: () => startRepeat("right"),
      rightUp: () => stopRepeat("right"),
      softDropDown: startSoftDrop,
      softDropUp: stopSoftDrop,
      hardDrop,
      rotateCw: () => rotate("cw"),
      rotateCcw: () => rotate("ccw"),
      hold,
      pauseToggle: togglePause,
      restart,
      toggleSound
    }),
    [hardDrop, hold, restart, rotate, startRepeat, startSoftDrop, stopRepeat, stopSoftDrop, togglePause, toggleSound]
  );

  return useMemo(
    () => ({
      snapshot,
      input
    }),
    [input, snapshot]
  );
};
