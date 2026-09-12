import { GameState } from "./GameState.js";

export const AccessibilityManager = {
  toggleContrast() {
    const current = GameState.get().accessibility.highContrast;
    GameState.setAccessibility({ highContrast: !current });
    return !current;
  },

  toggleNarration() {
    const current = GameState.get().accessibility.narration;
    const next = !current;
    GameState.setAccessibility({ narration: next });
    window.__rotaBrasilNarration = next;
    return next;
  },

  toggleReducedMotion() {
    const current = GameState.get().accessibility.reducedMotion;
    GameState.setAccessibility({ reducedMotion: !current });
    return !current;
  }
};
