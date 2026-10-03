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


let currentAnimalAudio = null;
let audioCtx = null;

function getAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

/* Sons provisórios (Web Audio). Substitua pelos arquivos reais em /public. */
function synthAnimal(animalId, volume = 1) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.35 * volume;
  master.connect(ctx.destination);

  const tone = (type, f0, f1, start, dur, gainPeak = 1) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, now + start);
    osc.frequency.exponentialRampToValueAtTime(f1, now + start + dur);
    g.gain.setValueAtTime(0.0001, now + start);
    g.gain.exponentialRampToValueAtTime(gainPeak, now + start + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
    osc.connect(g).connect(master);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.05);
  };

  if (animalId === "tucano" || animalId === "ae") {
    // "rrrá-rrrá" rouco e agudo
    tone("sawtooth", 900, 1500, 0.00, 0.22);
    tone("sawtooth", 900, 1600, 0.30, 0.22);
    tone("sawtooth", 850, 1400, 0.60, 0.28);
  } else if (animalId === "onca") {
    // rosnado grave com vibração
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 1.1);
    lfo.frequency.value = 22;
    lfoGain.gain.value = 18;
    lfo.connect(lfoGain).connect(osc.frequency);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(1, now + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc.connect(g).connect(master);
    osc.start(now); lfo.start(now);
    osc.stop(now + 1.25); lfo.stop(now + 1.25);
  } else if (animalId === "sapo") {
    // "croac" grave repetido
    tone("square", 180, 90, 0.00, 0.16, 0.7);
    tone("square", 200, 100, 0.26, 0.16, 0.7);
    tone("square", 170, 85, 0.52, 0.2, 0.7);
  } else {
    // tartaruga: sopro/bolhas suaves e graves
    tone("sine", 220, 140, 0.00, 0.18, 0.8);
    tone("sine", 260, 160, 0.28, 0.18, 0.8);
    tone("sine", 200, 120, 0.56, 0.22, 0.8);
  }
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


  /*
   * ------------------------------------------------------------
   * SONS DOS ANIMAIS
   * Toca o arquivo real (ex.: /assets/audio/animals/tucano.mp3).
   * Se o arquivo estiver ausente, vazio ou corrompido, toca um som
   * sintetizado provisório, para a criança nunca ficar sem resposta.
   * ------------------------------------------------------------
   */
  playAnimalSound(src, animalId = "tucano") {
    this.stopAnimalSound();

    const settings =
      GameState.get().accessibility || {};

    if (settings.effectsMuted) {
      return null;
    }

    let fallbackUsed = false;

    const fallback = () => {
      if (fallbackUsed) return;
      fallbackUsed = true;
      synthAnimal(animalId, this.getEffectsVolume());
    };

    if (!src) {
      fallback();
      return null;
    }

    const audio = new Audio(src);

    audio.volume = this.getEffectsVolume();
    audio.addEventListener("error", fallback, { once: true });

    audio.play().catch(() => fallback());

    // Arquivo existe mas não tem duração (0 bytes): garante o fallback
    audio.addEventListener("loadedmetadata", () => {
      if (!Number.isFinite(audio.duration) || audio.duration === 0) {
        fallback();
      }
    }, { once: true });

    currentAnimalAudio = audio;

    return audio;
  },

  stopAnimalSound() {
    if (currentAnimalAudio) {
      currentAnimalAudio.pause();
      currentAnimalAudio.currentTime = 0;
      currentAnimalAudio = null;
    }
  },

  /* Som de recompensa (peça da bússola). final=true toca uma fanfarra maior. */
  playChime(final = false) {
    const settings = GameState.get().accessibility || {};
    if (settings.effectsMuted) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = final ? [523, 659, 784, 1047, 1319] : [523, 659, 784];
    const vol = 0.25 * this.getEffectsVolume();

    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.14;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(g).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });
  },

  getAvailableVoices() {
    loadVoices();

    return [...voices];
  }
};