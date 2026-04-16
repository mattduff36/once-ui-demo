type SoundEffect = "rotate" | "lineClear" | "hardDrop" | "gameOver" | "hold";

const FREQUENCIES: Record<SoundEffect, number[]> = {
  rotate: [620],
  lineClear: [400, 520, 680],
  hardDrop: [180, 120],
  gameOver: [330, 280, 240, 190],
  hold: [520, 460]
};

const DURATIONS: Record<SoundEffect, number> = {
  rotate: 0.06,
  lineClear: 0.1,
  hardDrop: 0.08,
  gameOver: 0.16,
  hold: 0.08
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
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

    const now = this.context.currentTime;
    const notes = FREQUENCIES[effect];
    const duration = DURATIONS[effect];

    notes.forEach((frequency, index) => {
      const oscillator = this.context!.createOscillator();
      const gain = this.context!.createGain();

      oscillator.type = effect === "lineClear" ? "triangle" : "square";
      oscillator.frequency.value = frequency;

      const start = now + index * duration * 0.55;
      const end = start + duration;

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      oscillator.connect(gain);
      gain.connect(this.context!.destination);

      oscillator.start(start);
      oscillator.stop(end + 0.02);
    });
  }
}
