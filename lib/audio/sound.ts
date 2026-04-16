export type SoundEffect =
  | "rotate"
  | "hold"
  | "lock"
  | "hardDrop"
  | "lineClear"
  | "tetris"
  | "gameOver"
  | "pause"
  | "resume"
  | "start";

interface ToneSpec {
  freq: number;
  /** If set, pitch ramps exponentially from `freq` to `endFreq` across the tone. */
  endFreq?: number;
  durationMs: number;
  /** Start offset from the effect's trigger time. */
  offsetMs?: number;
  wave?: OscillatorType;
  peakGain?: number;
}

interface SoundSpec {
  tones: ToneSpec[];
  defaultWave?: OscillatorType;
  defaultPeakGain?: number;
}

// Small chiptune-style sound library. Each effect is a sequence (or chord) of
// oscillator tones with optional pitch slides. Kept intentionally minimal so we
// don't ship audio assets.
const SOUND_LIBRARY: Record<SoundEffect, SoundSpec> = {
  rotate: {
    tones: [{ freq: 640, durationMs: 55 }],
    defaultWave: "square",
    defaultPeakGain: 0.12
  },
  hold: {
    tones: [
      { freq: 540, durationMs: 55 },
      { freq: 720, durationMs: 70, offsetMs: 42 }
    ],
    defaultWave: "triangle",
    defaultPeakGain: 0.14
  },
  lock: {
    tones: [{ freq: 260, endFreq: 140, durationMs: 85 }],
    defaultWave: "square",
    defaultPeakGain: 0.13
  },
  hardDrop: {
    tones: [
      { freq: 220, endFreq: 70, durationMs: 135, peakGain: 0.2 },
      { freq: 360, endFreq: 180, durationMs: 85, wave: "triangle", peakGain: 0.1 }
    ],
    defaultWave: "square"
  },
  lineClear: {
    tones: [
      { freq: 523, durationMs: 70 },
      { freq: 659, durationMs: 70, offsetMs: 55 },
      { freq: 784, durationMs: 95, offsetMs: 110, peakGain: 0.16 }
    ],
    defaultWave: "triangle",
    defaultPeakGain: 0.14
  },
  tetris: {
    // Rising C-E-G-C-E fanfare for a four-line clear.
    tones: [
      { freq: 523, durationMs: 80 },
      { freq: 659, durationMs: 80, offsetMs: 70 },
      { freq: 784, durationMs: 80, offsetMs: 140 },
      { freq: 1046, durationMs: 220, offsetMs: 210, peakGain: 0.18 },
      { freq: 1319, durationMs: 240, offsetMs: 230, wave: "triangle", peakGain: 0.16 }
    ],
    defaultWave: "square",
    defaultPeakGain: 0.14
  },
  gameOver: {
    tones: [
      { freq: 392, durationMs: 150 },
      { freq: 349, durationMs: 150, offsetMs: 120 },
      { freq: 293, durationMs: 170, offsetMs: 250 },
      { freq: 220, endFreq: 100, durationMs: 500, offsetMs: 400, peakGain: 0.18 }
    ],
    defaultWave: "square",
    defaultPeakGain: 0.16
  },
  pause: {
    // Two-note descent: "shh..."
    tones: [
      { freq: 622, durationMs: 90 },
      { freq: 415, durationMs: 160, offsetMs: 75 }
    ],
    defaultWave: "triangle",
    defaultPeakGain: 0.13
  },
  resume: {
    // Mirror of pause: two-note ascent.
    tones: [
      { freq: 415, durationMs: 80 },
      { freq: 622, durationMs: 150, offsetMs: 70, peakGain: 0.14 }
    ],
    defaultWave: "triangle",
    defaultPeakGain: 0.13
  },
  start: {
    // Upbeat C major arpeggio topped with a chord.
    tones: [
      { freq: 523, durationMs: 90 },
      { freq: 659, durationMs: 90, offsetMs: 85 },
      { freq: 784, durationMs: 90, offsetMs: 170 },
      { freq: 1046, durationMs: 230, offsetMs: 250, peakGain: 0.18 },
      { freq: 1319, durationMs: 260, offsetMs: 270, wave: "triangle", peakGain: 0.14 }
    ],
    defaultWave: "square",
    defaultPeakGain: 0.14
  }
};

export class SoundEngine {
  private context: AudioContext | null = null;
  private enabled = false;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  async unlock(): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    if (!this.context) {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }
      this.context = new AudioContextClass();
    }

    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  play(effect: SoundEffect) {
    if (!this.enabled || !this.context) {
      return;
    }

    const spec = SOUND_LIBRARY[effect];
    if (!spec) {
      return;
    }

    const ctx = this.context;
    const now = ctx.currentTime;
    const defaultWave = spec.defaultWave ?? "square";
    const defaultGain = spec.defaultPeakGain ?? 0.16;

    for (const tone of spec.tones) {
      const start = now + (tone.offsetMs ?? 0) / 1000;
      const end = start + tone.durationMs / 1000;
      const peak = tone.peakGain ?? defaultGain;

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = tone.wave ?? defaultWave;

      if (tone.endFreq !== undefined && tone.endFreq !== tone.freq) {
        oscillator.frequency.setValueAtTime(tone.freq, start);
        oscillator.frequency.exponentialRampToValueAtTime(
          Math.max(1, tone.endFreq),
          end
        );
      } else {
        oscillator.frequency.value = tone.freq;
      }

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(start);
      oscillator.stop(end + 0.02);
    }
  }
}
