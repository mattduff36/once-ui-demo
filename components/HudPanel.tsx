"use client";

interface HudPanelProps {
  score: number;
  highScore: number;
  level: number;
  lines: number;
  combo: number;
  backToBack: boolean;
  clearText: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  onRestart: () => void;
  paused: boolean;
  gameOver: boolean;
}

export function HudPanel({
  score,
  highScore,
  level,
  lines,
  combo,
  backToBack,
  clearText,
  soundEnabled,
  onToggleSound,
  onPause,
  onRestart,
  paused,
  gameOver
}: HudPanelProps) {
  return (
    <div className="panel hud-panel">
      <div className="stats-grid">
        <Stat label="Score" value={score.toLocaleString()} />
        <Stat label="High" value={highScore.toLocaleString()} />
        <Stat label="Level" value={level.toString()} />
        <Stat label="Lines" value={lines.toString()} />
      </div>
      <div className="status-line">
        {clearText ? <span className="status-pill">{clearText}</span> : null}
        {combo > 0 ? <span className="status-pill">Combo x{combo + 1}</span> : null}
        {backToBack ? <span className="status-pill">Back-to-Back</span> : null}
      </div>
      <div className="action-row">
        <button type="button" className="action-btn" onClick={onToggleSound}>
          Sound: {soundEnabled ? "On" : "Off"}
        </button>
        <button type="button" className="action-btn" onClick={onPause}>
          {paused ? "Resume" : "Pause"}
        </button>
        <button type="button" className="action-btn danger" onClick={onRestart}>
          {gameOver ? "Play Again" : "Restart"}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
