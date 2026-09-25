import { GameState } from "./GameState.js";

const STORAGE_KEY = "rota-brasil-accessibility-v1";

const DEFAULT_SETTINGS = {
  narration: true,
  highContrast: false,
  reducedMotion: false,
  dyslexiaFont: false
};

function cloneDefaultSettings() {
  return {
    ...DEFAULT_SETTINGS
  };
}

function normalizeSettings(settings = {}) {
  return {
    narration:
      settings.narration !== undefined
        ? Boolean(settings.narration)
        : DEFAULT_SETTINGS.narration,

    highContrast:
      settings.highContrast !== undefined
        ? Boolean(settings.highContrast)
        : DEFAULT_SETTINGS.highContrast,

    reducedMotion:
      settings.reducedMotion !== undefined
        ? Boolean(settings.reducedMotion)
        : DEFAULT_SETTINGS.reducedMotion,

    dyslexiaFont:
      settings.dyslexiaFont !== undefined
        ? Boolean(settings.dyslexiaFont)
        : DEFAULT_SETTINGS.dyslexiaFont
  };
}

export const AccessibilityManager = {
  getDefaults() {
    return cloneDefaultSettings();
  },

  getSettings() {
    return {
      ...normalizeSettings(GameState.get().accessibility)
    };
  },

  load() {
    let settings = cloneDefaultSettings();

    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        settings = normalizeSettings(
          JSON.parse(raw)
        );
      }
    } catch (error) {
      console.warn(
        "Não foi possível carregar as configurações de acessibilidade.",
        error
      );
    }

    GameState.setAccessibility(settings);

    this.applyToDocument(settings);

    return settings;
  },

  save(settings = GameState.get().accessibility) {
    const normalized = normalizeSettings(settings);

    GameState.setAccessibility(normalized);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(normalized)
      );
    } catch (error) {
      console.warn(
        "Não foi possível salvar as configurações de acessibilidade.",
        error
      );
    }

    this.applyToDocument(normalized);

    return normalized;
  },

  set(settings = {}) {
    return this.save({
      ...GameState.get().accessibility,
      ...settings
    });
  },

  toggleNarration() {
    const enabled =
      !GameState.get().accessibility.narration;

    this.set({
      narration: enabled
    });

    return enabled;
  },

  toggleHighContrast() {
    const enabled =
      !GameState.get().accessibility.highContrast;

    this.set({
      highContrast: enabled
    });

    return enabled;
  },

  toggleReducedMotion() {
    const enabled =
      !GameState.get().accessibility.reducedMotion;

    this.set({
      reducedMotion: enabled
    });

    return enabled;
  },

  toggleDyslexiaFont() {
    const enabled =
      !GameState.get().accessibility.dyslexiaFont;

    this.set({
      dyslexiaFont: enabled
    });

    return enabled;
  },

  isNarrationEnabled() {
    return Boolean(
      GameState.get().accessibility.narration
    );
  },

  isHighContrastEnabled() {
    return Boolean(
      GameState.get().accessibility.highContrast
    );
  },

  isReducedMotionEnabled() {
    return Boolean(
      GameState.get().accessibility.reducedMotion
    );
  },

  isDyslexiaFontEnabled() {
    return Boolean(
      GameState.get().accessibility.dyslexiaFont
    );
  },

  applyToDocument(settings = GameState.get().accessibility) {
    if (typeof document === "undefined") {
      return;
    }

    const normalized = normalizeSettings(settings);

    const root = document.documentElement;
    const body = document.body;

    root.dataset.highContrast = normalized.highContrast
      ? "true"
      : "false";

    root.dataset.reducedMotion = normalized.reducedMotion
      ? "true"
      : "false";

    root.dataset.dyslexiaFont = normalized.dyslexiaFont
      ? "true"
      : "false";

    if (body) {
      body.classList.toggle(
        "accessibility-high-contrast",
        normalized.highContrast
      );

      body.classList.toggle(
        "accessibility-reduced-motion",
        normalized.reducedMotion
      );

      body.classList.toggle(
        "accessibility-dyslexia",
        normalized.dyslexiaFont
      );
    }
  }
};