/**
 * Fase 4 · Missão da reciclagem (BNCC: EF05GE10)
 * Arrastar cada resíduo para a lixeira da coleta seletiva.
 *
 * As CORES das lixeiras seguem a Resolução CONAMA nº 275/2001, o padrão
 * oficial do Brasil: papel = azul, plástico = vermelho, vidro = verde,
 * metal = amarelo, orgânico = marrom. (A versão antiga do jogo usava
 * cores diferentes desse padrão.)
 *
 * Todas as cores de fundo têm contraste de pelo menos 5:1 com o texto.
 */
export const phase4 = {
  phase: 4,
  guideId: 4,
  title: "Missão da reciclagem",
  instruction:
    "Arraste cada resíduo para a lixeira da cor certa! Ou toque no resíduo e depois na lixeira.",
  introSpeech:
    "Fase 4. Ajude {companion} a separar corretamente os resíduos. Arraste cada objeto até a lixeira correspondente.",
  finishSpeech: "Parabéns! Você completou a Fase 4!",
  hint: "Observe o material de cada objeto antes de escolher.",
  layout: "bins",
  points: 20,
  star: true,

  items: [
    {
      id: "garrafa-plastica",
      emoji: "🥤",
      label: "Garrafa plástica",
      targetId: "plastico"
    },
    { id: "lata", emoji: "🥫", label: "Lata", targetId: "metal" },
    { id: "jornal", emoji: "📰", label: "Jornal", targetId: "papel" },
    {
      id: "casca-de-banana",
      emoji: "🍌",
      label: "Casca de banana",
      targetId: "organico"
    },
    {
      id: "garrafa-de-vidro",
      emoji: "🍾",
      label: "Garrafa de vidro",
      targetId: "vidro"
    }
  ],

  targets: [
    {
      id: "plastico",
      emoji: "🗑️",
      label: "Plástico",
      caption: "lixeira vermelha",
      color: "#c62828",
      textColor: "#ffffff"
    },
    {
      id: "metal",
      emoji: "🗑️",
      label: "Metal",
      caption: "lixeira amarela",
      color: "#ffd21f",
      textColor: "#18332c"
    },
    {
      id: "papel",
      emoji: "🗑️",
      label: "Papel",
      caption: "lixeira azul",
      color: "#1e5bb8",
      textColor: "#ffffff"
    },
    {
      id: "organico",
      emoji: "🗑️",
      label: "Orgânico",
      caption: "lixeira marrom",
      color: "#7a4a21",
      textColor: "#ffffff"
    },
    {
      id: "vidro",
      emoji: "🗑️",
      label: "Vidro",
      caption: "lixeira verde",
      color: "#177a37",
      textColor: "#ffffff"
    }
  ],

  messages: {
    correct: (item, target) =>
      `Muito bem! ${item.label} vai na ${target.caption} (${target.label.toLowerCase()}).`,
    wrong: (item, target) =>
      `Ops! ${item.label} não vai na lixeira de ${target.label.toLowerCase()}. Pense no material do objeto e tente de novo!`
  }
};