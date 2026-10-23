/**
 * Fase 2 · Paisagens pelo Brasil (BNCC: EF04GE05 / EF05GE03)
 * Arrastar cada paisagem (bioma) para a região do Brasil onde ela existe.
 *
 * Cada fase é só DADOS: o motor (DragMatch) e a tela (PhaseScreen) são
 * os mesmos para todas.
 */
export const phase2 = {
  phase: 2,
  guideId: 2,
  title: "Paisagens pelo Brasil",
  instruction:
    "Arraste cada paisagem para a região correta! Ou toque na paisagem e depois na região.",
  introSpeech:
    "Fase 2. Observe cada paisagem e arraste o cartão para a região correta do Brasil.",
  finishSpeech: "Parabéns! Você completou a Fase 2!",
  hint: "Leia as características de cada paisagem. Elas ajudam você a descobrir a região!",
  layout: "columns",

  // Pontos por acerto. star: false mantém a regra original da Fase 2
  // (ela não dá estrela por acerto). Troque para true se quiser dar.
  points: 20,
  star: false,

  items: [
    {
      id: "amazonia",
      emoji: "🌳",
      label: "Amazônia",
      detail: "Floresta muito verde e muitos rios.",
      targetId: "norte"
    },
    {
      id: "caatinga",
      emoji: "🌵",
      label: "Caatinga",
      detail: "Vegetação adaptada a lugares mais secos.",
      targetId: "nordeste"
    },
    {
      id: "cerrado",
      emoji: "🌾",
      label: "Cerrado",
      detail: "Árvores baixas, campos e época de seca.",
      targetId: "centro-oeste"
    },
    {
      id: "mata-atlantica",
      emoji: "🌿",
      label: "Mata Atlântica",
      detail: "Presente em grande parte do litoral brasileiro.",
      targetId: "sudeste"
    },
    {
      id: "pampa",
      emoji: "🍃",
      label: "Pampa",
      detail: "Grandes campos de vegetação rasteira no extremo sul.",
      targetId: "sul"
    }
  ],

  // Cada região mostra um mapinha com o lugar dela e uma pista de posição
  // (usa o que a criança aprendeu na Fase 1: em cima, embaixo, no meio...).
  targets: [
    {
      id: "norte",
      label: "Norte",
      caption: "Parte de cima do Brasil",
      map: "norte",
      accent: "#2e8b57"
    },
    {
      id: "nordeste",
      label: "Nordeste",
      caption: "Lado direito (leste), junto ao mar",
      map: "nordeste",
      accent: "#c76a00"
    },
    {
      id: "centro-oeste",
      label: "Centro-Oeste",
      caption: "No meio do Brasil",
      map: "centro-oeste",
      accent: "#b8860b"
    },
    {
      id: "sudeste",
      label: "Sudeste",
      caption: "Lado direito (leste), abaixo do Nordeste",
      map: "sudeste",
      accent: "#3b66c8"
    },
    {
      id: "sul",
      label: "Sul",
      caption: "Parte de baixo do Brasil",
      map: "sul",
      accent: "#8e44ad"
    }
  ],

  messages: {
    correct: (item, target) =>
      `Muito bem! ${item.label} fica na região ${target.label}!`,
    wrong: () => "Quase! Leia a pista do cartão e tente novamente."
  }
};