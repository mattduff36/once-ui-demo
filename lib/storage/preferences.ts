const HIGH_SCORE_KEY = "block-stack-high-score";
const SOUND_ENABLED_KEY = "block-stack-sound-enabled";

export const readHighScore = (): number => {
  if (typeof window === "undefined") {
    return 0;
  }
  const raw = window.localStorage.getItem(HIGH_SCORE_KEY);
  if (!raw) {
    return 0;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

export const writeHighScore = (score: number): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(HIGH_SCORE_KEY, Math.max(0, Math.floor(score)).toString());
};

export const readSoundPreference = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  const raw = window.localStorage.getItem(SOUND_ENABLED_KEY);
  return raw === "true";
};

export const writeSoundPreference = (enabled: boolean): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SOUND_ENABLED_KEY, enabled ? "true" : "false");
};
