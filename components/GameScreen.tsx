"use client";

import { useEffect } from "react";
import { Board } from "@/components/Board";
import { HudPanel } from "@/components/HudPanel";
import { PiecePreview } from "@/components/PiecePreview";
import { TouchControls } from "@/components/TouchControls";
import { useGame } from "@/hooks/useGame";

export function GameScreen() {
  const { snapshot, input } = useGame();
  // Render up to 5 next pieces; CSS hides extras on narrower viewports.
  const next = snapshot.nextQueue.slice(0, 5);

  useEffect(() => {
    const preventGesture = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };
    document.addEventListener("touchmove", preventGesture, { passive: false });
    return () => document.removeEventListener("touchmove", preventGesture);
  }, []);

  return (
    <main className="app-shell">
      <header className="top-bar">
        <h1 className="brand-title">Block Stack</h1>
        <div className="top-actions">
          <button
            type="button"
            className="action-btn"
            onClick={input.toggleSound}
            aria-label={snapshot.soundEnabled ? "Mute sound" : "Enable sound"}
          >
            {snapshot.soundEnabled ? "Sound" : "Muted"}
          </button>
          <button type="button" className="action-btn" onClick={input.pauseToggle}>
            {snapshot.paused ? "Resume" : "Pause"}
          </button>
          <button type="button" className="action-btn danger" onClick={input.restart}>
            {snapshot.gameOver ? "Play Again" : "Restart"}
          </button>
        </div>
      </header>

      <div className="info-strip" aria-label="Game status">
        <div className="hold-slot">
          <PiecePreview
            piece={snapshot.holdPiece}
            label="Hold"
            dimmed={!snapshot.canHold}
            variant="mini"
          />
        </div>
        <HudPanel
          score={snapshot.score}
          highScore={snapshot.highScore}
          level={snapshot.level}
          lines={snapshot.lines}
          variant="inline"
        />
        <div className="next-inline" aria-label="Next pieces">
          {next.map((piece, index) => (
            <PiecePreview key={`${piece}-${index}`} piece={piece} variant="mini" />
          ))}
        </div>
      </div>

      <div className="board-wrap">
        <Board
          snapshot={snapshot}
          onRestart={input.restart}
          onResume={input.pauseToggle}
        />
      </div>

      <div className="status-line" aria-live="polite">
        {snapshot.lastClearText ? <span className="status-pill">{snapshot.lastClearText}</span> : null}
        {snapshot.combo > 0 ? <span className="status-pill">Combo x{snapshot.combo + 1}</span> : null}
        {snapshot.backToBack ? <span className="status-pill">Back-to-Back</span> : null}
      </div>

      <TouchControls
        onLeftDown={input.leftDown}
        onLeftUp={input.leftUp}
        onRightDown={input.rightDown}
        onRightUp={input.rightUp}
        onSoftDropDown={input.softDropDown}
        onSoftDropUp={input.softDropUp}
        onHardDrop={input.hardDrop}
        onRotateCw={input.rotateCw}
        onRotateCcw={input.rotateCcw}
        onHold={input.hold}
        onPause={input.pauseToggle}
      />
    </main>
  );
}
