/**
 * Dados do desafio bônus: reconhecer o som de animais brasileiros.
 * Arquivo SEM React: só dados e regras.
 */

// As métricas do bônus ficam separadas das fases (que usam os números 1 a 4).
export const BONUS_PHASE_KEY = "bonus";

export const BONUS_POINTS_PER_CORRECT = 15;

// Sons em public/assets/audio/animals/ (créditos em data/credits.js).
// Se algum arquivo faltar, use sound: null: o AudioManager toca um som
// sintetizado no lugar.
export const BONUS_ANIMALS = [
  {
    id: "tucano",
    name: "Tucano",
    emoji: "🦜",
    sound: "/assets/audio/animals/tucano.mp3"
  },
  {
    id: "onca",
    name: "Onça-pintada",
    emoji: "🐆",
    sound: "/assets/audio/animals/onca.mp3"
  },
  {
    id: "tartaruga",
    name: "Tartaruga",
    emoji: "🐢",
    sound: "/assets/audio/animals/tartaruga.mp3"
  },
  {
    id: "sapo",
    name: "Sapo",
    emoji: "🐸",
    sound: "/assets/audio/animals/sapo.mp3"
  }
];