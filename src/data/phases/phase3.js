/**
 * Fase 3 · Clima e paisagens (BNCC: EF05GE03)
 * Arrastar cada clima para a paisagem brasileira que combina com ele.
 */
export const phase3 = {
  phase: 3,
  guideId: 3,
  title: "Clima e paisagens",
  instruction:
    "Arraste cada clima para a paisagem que combina com ele! Ou toque no clima e depois na paisagem.",
  introSpeech:
    "Fase três! Arraste cada cartão para a paisagem que combina com seu clima.",
  finishSpeech: "Parabéns! Você completou a fase três!",
  hint: "Pense: onde chove muito? Onde faz muito calor? Onde faz frio?",
  layout: "columns",
  points: 20,
  star: true,

  items: [
    {
      id: "muita-chuva",
      emoji: "🌧️",
      label: "Muita chuva",
      detail: "Lugar quente, úmido e com muita chuva.",
      targetId: "amazonia"
    },
    {
      id: "pouca-chuva",
      emoji: "☀️",
      label: "Pouca chuva",
      detail: "Lugar quente e com pouca chuva.",
      targetId: "sertao"
    },
    {
      id: "chuva-moderada",
      emoji: "🌦️",
      label: "Chuva moderada",
      detail: "Tem uma época de chuva e outra mais seca.",
      targetId: "cerrado"
    },
    {
      id: "clima-frio",
      emoji: "❄️",
      label: "Clima frio",
      detail: "O inverno pode ser bem frio.",
      targetId: "pampa"
    }
  ],

  // Cada paisagem mostra onde fica no mapa (o que a criança viu na Fase 2).
  targets: [
    {
      id: "amazonia",
      emoji: "🌳",
      label: "Amazônia",
      caption: "Floresta e rios, no Norte do Brasil",
      map: "norte",
      accent: "#2e8b57"
    },
    {
      id: "sertao",
      emoji: "🌵",
      label: "Sertão",
      caption: "Terra seca, no Nordeste",
      map: "nordeste",
      accent: "#c76a00"
    },
    {
      id: "cerrado",
      emoji: "🌾",
      label: "Cerrado",
      caption: "Campos e árvores baixas, no meio do Brasil",
      map: "centro-oeste",
      accent: "#b8860b"
    },
    {
      id: "pampa",
      emoji: "🍃",
      label: "Pampa",
      caption: "Campos verdes, no Sul do Brasil",
      map: "sul",
      accent: "#8e44ad"
    }
  ],

  messages: {
    correct: (item, target) =>
      `Muito bem! ${item.label} combina com ${target.label}!`,
    wrong: () =>
      "Ops! Esse clima combina com outra paisagem. Tente novamente!"
  }
};