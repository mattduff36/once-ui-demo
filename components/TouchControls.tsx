"use client";

import type { MouseEvent, TouchEvent } from "react";

type TouchControlsProps = {
  onLeftDown: () => void;
  onLeftUp: () => void;
  onRightDown: () => void;
  onRightUp: () => void;
  onSoftDropDown: () => void;
  onSoftDropUp: () => void;
  onHardDrop: () => void;
  onRotateCw: () => void;
  onRotateCcw: () => void;
  onHold: () => void;
  onPause: () => void;
};

function pressHandlers(onPress: () => void, onRelease?: () => void) {
  return {
    onTouchStart: (event: TouchEvent) => {
      event.preventDefault();
      onPress();
    },
    onTouchEnd: (event: TouchEvent) => {
      event.preventDefault();
      onRelease?.();
    },
    onTouchCancel: (event: TouchEvent) => {
      event.preventDefault();
      onRelease?.();
    },
    onMouseDown: (event: MouseEvent) => {
      event.preventDefault();
      onPress();
    },
    onMouseUp: (event: MouseEvent) => {
      event.preventDefault();
      onRelease?.();
    },
    onMouseLeave: (event: MouseEvent) => {
      event.preventDefault();
      onRelease?.();
    },
    onContextMenu: (event: MouseEvent) => event.preventDefault()
  };
}

export function TouchControls({
  onLeftDown,
  onLeftUp,
  onRightDown,
  onRightUp,
  onSoftDropDown,
  onSoftDropUp,
  onHardDrop,
  onRotateCw,
  onRotateCcw,
  onHold,
  onPause
}: TouchControlsProps) {
  return (
    <section className="gb-controls" aria-label="Touch controls">
      {/* D-pad: Left/Right move, Up hard-drops, Down soft-drops (authentic GB movement) */}
      <div className="dpad" aria-label="Direction pad">
        <span className="dpad-cross" aria-hidden="true" />
        <button
          type="button"
          className="dpad-btn dpad-up"
          aria-label="Hard drop"
          {...pressHandlers(onHardDrop)}
        >
          <span className="arrow">▲</span>
        </button>
        <button
          type="button"
          className="dpad-btn dpad-left"
          aria-label="Move left"
          {...pressHandlers(onLeftDown, onLeftUp)}
        >
          <span className="arrow">◀</span>
        </button>
        <button
          type="button"
          className="dpad-btn dpad-right"
          aria-label="Move right"
          {...pressHandlers(onRightDown, onRightUp)}
        >
          <span className="arrow">▶</span>
        </button>
        <button
          type="button"
          className="dpad-btn dpad-down"
          aria-label="Soft drop"
          {...pressHandlers(onSoftDropDown, onSoftDropUp)}
        >
          <span className="arrow">▼</span>
        </button>
        <span className="dpad-hub" aria-hidden="true" />
      </div>

      {/* Select = Hold, Start = Pause (Start is authentic GB pause) */}
      <div className="menu-pills" aria-label="Menu buttons">
        <button type="button" className="pill-btn" {...pressHandlers(onHold)}>
          <span className="pill-label">Select</span>
          <span className="pill-sub">Hold</span>
        </button>
        <button type="button" className="pill-btn" {...pressHandlers(onPause)}>
          <span className="pill-label">Start</span>
          <span className="pill-sub">Pause</span>
        </button>
      </div>

      {/* A = rotate clockwise, B = rotate counter-clockwise (authentic GB Tetris) */}
      <div className="ab-cluster" aria-label="Action buttons">
        <button
          type="button"
          className="round-btn btn-b"
          aria-label="Rotate counter-clockwise"
          {...pressHandlers(onRotateCcw)}
        >
          B
        </button>
        <button
          type="button"
          className="round-btn btn-a"
          aria-label="Rotate clockwise"
          {...pressHandlers(onRotateCw)}
        >
          A
        </button>
      </div>
    </section>
  );
}
