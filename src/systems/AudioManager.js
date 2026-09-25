import { GameState } from "./GameState.js";

let voices = [];

function loadVoices() {
  if (!("speechSynthesis" in window)) return;

  voices =
    window.speechSynthesis.getVoices();
}

if ("speechSynthesis" in window) {
  loadVoices();

  window.speechSynthesis.addEventListener(
    "voiceschanged",
    loadVoices
  );
}

function choosePortugueseVoice() {
  const ptBr =
    voices.filter(
      voice =>
        /^pt-BR$/i.test(voice.lang) ||
        /^pt_BR$/i.test(voice.lang)
    );

  const portuguese =
    ptBr.length
      ? ptBr
      : voices.filter(
          voice =>
            /^pt/i.test(voice.lang)
        );

  if (!portuguese.length) {
    return null;
  }

  const preferred = [
    "Microsoft Francisca",
    "Microsoft Maria",
    "Microsoft Antonio",
    "Microsoft Daniel",
    "Google português",
    "Google Portuguese",
    "Francisca",
    "Maria",
    "Fernanda",
    "Camila",
    "Helena",
    "Natural"
  ];

  return (
    portuguese.find(
      voice =>
        preferred.some(
          name =>
            voice.name
              .toLowerCase()
              .includes(
                name.toLowerCase()
              )
        )
    ) ||
    portuguese.find(
      voice => voice.localService
    ) ||
    portuguese[0]
  );
}

function clamp(value, min = 0, max = 1) {
  return Math.max(
    min,
    Math.min(max, Number(value) || 0)
  );
}

export const AudioManager = {
  speak(text, options = {}) {
    if (!("speechSynthesis" in window)) {
      return;
    }

    const settings =
      GameState.get().accessibility || {};

    if (
      settings.narration === false
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        String(text)
      );

    utterance.lang = "pt-BR";

    utterance.rate =
      options.rate ??
      settings.narrationRate ??
      0.9;

    utterance.pitch =
      options.pitch ?? 1.28;

    utterance.volume =
      options.volume ??
      settings.narrationVolume ??
      1;

    const speakNow = () => {
      loadVoices();

      const voice =
        choosePortugueseVoice();

      if (voice) {
        utterance.voice = voice;
      }

      window.speechSynthesis.speak(
        utterance
      );
    };

    window.setTimeout(
      speakNow,
      40
    );
  },

  stop() {
    if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }
  },

  setNarrationRate(rate) {
    GameState.setAccessibility({
      narrationRate: clamp(
        rate,
        0.5,
        1.5
      )
    });
  },

  getNarrationRate() {
    return (
      GameState.get()
        .accessibility
        ?.narrationRate ?? 0.9
    );
  },

  setNarrationVolume(volume) {
    GameState.setAccessibility({
      narrationVolume:
        clamp(volume)
    });
  },

  getNarrationVolume() {
    return (
      GameState.get()
        .accessibility
        ?.narrationVolume ?? 1
    );
  },

  setEffectsVolume(volume) {
    GameState.setAccessibility({
      effectsVolume:
        clamp(volume)
    });
  },

  getEffectsVolume() {
    return (
      GameState.get()
        .accessibility
        ?.effectsVolume ?? 1
    );
  },

  playEffect(src) {
    if (!src) return;

    const audio =
      new Audio(src);

    audio.volume =
      this.getEffectsVolume();

    audio.play().catch(
      error => {
        console.warn(
          "Não foi possível reproduzir efeito:",
          error
        );
      }
    );

    return audio;
  },

  getAvailableVoices() {
    loadVoices();

    return [...voices];
  }
};