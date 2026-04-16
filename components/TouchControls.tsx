"use client";

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

interface ControlButtonProps {
  label: string;
  onPress: () => void;
  onRelease?: () => void;
  variant?: "primary" | "secondary" | "danger";
}

function ControlButton({ label, onPress, onRelease, variant = "primary" }: ControlButtonProps) {
  return (
    <button
      type="button"
      className={`touch-btn ${variant}`}
      onTouchStart={(event) => {
        event.preventDefault();
        onPress();
      }}
      onTouchEnd={(event) => {
        event.preventDefault();
        onRelease?.();
      }}
      onTouchCancel={(event) => {
        event.preventDefault();
        onRelease?.();
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        onPress();
      }}
      onMouseUp={(event) => {
        event.preventDefault();
        onRelease?.();
      }}
      onMouseLeave={(event) => {
        event.preventDefault();
        onRelease?.();
      }}
      onContextMenu={(event) => event.preventDefault()}
    >
      {label}
    </button>
  );
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
    <section className="touch-controls" aria-label="Touch controls">
      <div className="controls-grid">
        <ControlButton label="Left" onPress={onLeftDown} onRelease={onLeftUp} />
        <ControlButton label="Right" onPress={onRightDown} onRelease={onRightUp} />
        <ControlButton label="Soft" onPress={onSoftDropDown} onRelease={onSoftDropUp} />
        <ControlButton label="Drop" onPress={onHardDrop} variant="secondary" />
        <ControlButton label="↻" onPress={onRotateCw} />
        <ControlButton label="↺" onPress={onRotateCcw} />
        <ControlButton label="Hold" onPress={onHold} />
        <ControlButton label="Pause" onPress={onPause} variant="danger" />
      </div>
    </section>
  );
}
