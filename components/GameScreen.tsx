"use client";

import { useEffect } from "react";
import { Board } from "@/components/Board";
import { HudPanel } from "@/components/HudPanel";
import { PiecePreview } from "@/components/PiecePreview";
import { TouchControls } from "@/components/TouchControls";
import { useGame } from "@/hooks/useGame";

export function GameScreen() {
  const { snapshot, input } = useGame();
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
    <main className="app-root">
      <header className="title-row">
        <div>
          <h1 className="brand-title">Block Stack</h1>
          <p className="subtitle">Mobile-first falling-block puzzle</p>
        </div>
      </header>
      <section className="game-layout">
        <div className="left-column">
          <PiecePreview piece={snapshot.holdPiece} label="Hold" dimmed={!snapshot.canHold} />
          <HudPanel
            score={snapshot.score}
            highScore={snapshot.highScore}
            level={snapshot.level}
            lines={snapshot.lines}
            combo={snapshot.combo}
            backToBack={snapshot.backToBack}
            clearText={snapshot.lastClearText}
            paused={snapshot.paused}
            gameOver={snapshot.gameOver}
            soundEnabled={snapshot.soundEnabled}
            onToggleSound={input.toggleSound}
            onPause={input.pauseToggle}
            onRestart={input.restart}
          />
        </div>

        <div className="board-column">
          <Board snapshot={snapshot} />
        </div>

        <div className="right-column">
          <div className="panel queue-panel">
            <div className="panel-title">Next</div>
            <div className="queue-list">
              {next.map((piece, index) => (
                <PiecePreview key={`${piece}-${index}`} piece={piece} label={`#${index + 1}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

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
