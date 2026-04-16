"use client";

interface HudPanelProps {
  score: number;
  highScore: number;
  level: number;
  lines: number;
  variant?: "panel" | "inline";
}

export function HudPanel({ score, highScore, level, lines, variant = "panel" }: HudPanelProps) {
  const grid = (
    <div className={variant === "inline" ? "stats-grid stats-inline" : "stats-grid"}>
      <Stat label="Score" value={formatCompact(score)} />
      <Stat label="High" value={formatCompact(highScore)} />
      <Stat label="Level" value={level.toString()} />
      <Stat label="Lines" value={lines.toString()} />
    </div>
  );

  if (variant === "inline") return grid;

  return <div className="panel stats-panel">{grid}</div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function formatCompact(value: number): string {
  if (value < 10000) return value.toLocaleString();
  if (value < 1_000_000) return `${(value / 1000).toFixed(value < 100_000 ? 1 : 0)}k`;
  return `${(value / 1_000_000).toFixed(1)}M`;
}
