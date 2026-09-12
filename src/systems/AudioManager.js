import { GameState } from "./GameState.js";

let voices = [];
let voicesReady = false;

function loadVoices() {
  if (!("speechSynthesis" in window)) return;
  voices = window.speechSynthesis.getVoices();
  voicesReady = voices.length > 0;
}

if ("speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
}

function choosePortugueseVoice() {
  if (!voices.length) return null;

  const ptBr = voices.filter((voice) =>
    /^pt-BR$/i.test(voice.lang) || /^pt_BR$/i.test(voice.lang)
  );

  const pool = ptBr.length
    ? ptBr
    : voices.filter((voice) => /^pt/i.test(voice.lang));

  if (!pool.length) return null;

  // Prioriza vozes femininas/naturais quando o sistema operacional oferecer.
  const preferred = [
    "francisca",
    "maria",
    "fernanda",
    "camila",
    "helena",
    "female",
    "natural",
    "google português",
    "google portuguese"
  ];

  return (
    pool.find((voice) => {
      const name = voice.name.toLowerCase();
      return preferred.some((term) => name.includes(term));
    }) || pool[0]
  );
}

export const AudioManager = {
  speak(text, options = {}) {
    if (!("speechSynthesis" in window)) return;
    if (GameState.get().accessibility?.narration === false) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = options.rate ?? 0.86;
    utterance.pitch = options.pitch ?? 1.22;
    utterance.volume = options.volume ?? 1;

    const speakNow = () => {
      loadVoices();
      const voice = choosePortugueseVoice();
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    };

    // Alguns navegadores só populam as vozes depois do primeiro evento.
    if (!voicesReady) {
      loadVoices();
    }

    window.setTimeout(speakNow, 30);
  },

  stop() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  },

  getAvailableVoices() {
    return [...voices];
  }
};
