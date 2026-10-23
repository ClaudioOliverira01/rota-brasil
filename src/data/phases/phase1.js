/**
 * Fase 1 · O Mistério da Bússola (BNCC: EF04GE01)
 * Arrastar cada ponto cardeal até o lugar certo da bússola.
 *
 * As cores dos cartões têm contraste de pelo menos 5:1 com o texto
 * (as cores antigas, com texto branco sobre amarelo e verde-claro, eram
 * difíceis de ler).
 *
 * layout "compass": os destinos ficam NA bússola (Norte em cima, Leste à
 * direita, Sul embaixo, Oeste à esquerda), por isso não são embaralhados.
 * Só os cartões mudam de ordem.
 */
export const phase1 = {
  phase: 1,
  guideId: 1,
  title: "O Mistério da Bússola",
  instruction:
    "Ajude {companion} a reconstruir a bússola! Arraste cada peça colorida até o ponto correspondente. Ou toque na peça e depois no ponto.",
  introSpeech:
    "Fase 1. Arraste cada ponto cardeal para o lugar correto na bússola. Pegue uma peça, leve até o lugar certo e solte.",
  finishSpeech: "Parabéns! Você reconstruiu a bússola!",
  hint: "Pense na bússola: o Norte fica em cima e o Sul embaixo.",
  layout: "compass",
  points: 10,
  star: true,

  items: [
    {
      id: "north",
      emoji: "↑",
      label: "NORTE",
      hint: "o Norte fica em cima, no alto da bússola.",
      color: "#c0392b",
      textColor: "#ffffff",
      targetId: "north"
    },
    {
      id: "south",
      emoji: "↓",
      label: "SUL",
      hint: "o Sul fica embaixo, do lado contrário ao Norte.",
      color: "#1e7a46",
      textColor: "#ffffff",
      targetId: "south"
    },
    {
      id: "east",
      emoji: "→",
      label: "LESTE",
      hint: "o Leste fica à direita. É o lado onde o Sol nasce.",
      color: "#ffb83e",
      textColor: "#18332c",
      targetId: "east"
    },
    {
      id: "west",
      emoji: "←",
      label: "OESTE",
      hint: "o Oeste fica à esquerda, do lado contrário ao Leste.",
      color: "#3b66c8",
      textColor: "#ffffff",
      targetId: "west"
    }
  ],

  targets: [
    { id: "north", emoji: "↑", label: "NORTE", slot: "n" },
    { id: "east", emoji: "→", label: "LESTE", slot: "e" },
    { id: "south", emoji: "↓", label: "SUL", slot: "s" },
    { id: "west", emoji: "←", label: "OESTE", slot: "w" }
  ],

  messages: {
    correct: item => `Muito bem! ${item.label} está no lugar certo!`,
    wrong: item =>
      `Quase! O ${item.label} não fica aí. Observe a bússola e tente novamente.`
  }
};