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
      <div className="info-strip" aria-label="Game status">
        <HudPanel
          score={snapshot.score}
          highScore={snapshot.highScore}
          level={snapshot.level}
          lines={snapshot.lines}
          variant="inline"
        />
      </div>

      <div className="play-row">
        <aside className="side-rail" aria-label="Hold and next pieces">
          <p className="rail-label">Hold</p>
          <div className="rail-hold">
            <PiecePreview
              piece={snapshot.holdPiece}
              dimmed={!snapshot.canHold}
              variant="mini"
            />
          </div>
          <p className="rail-label">Next</p>
          <div className="rail-next-list">
            {next.map((piece, index) => (
              <PiecePreview key={`${piece}-${index}`} piece={piece} variant="mini" />
            ))}
          </div>
        </aside>

        <div className="board-wrap">
          <Board
            snapshot={snapshot}
            onRestart={input.restart}
            onResume={input.pauseToggle}
            onToggleSound={input.toggleSound}
          />
        </div>
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
