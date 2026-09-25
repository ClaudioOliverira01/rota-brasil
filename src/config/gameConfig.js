export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

/**
 * Paleta "base" — mantém as MESMAS chaves e o mesmo formato (número hex)
 * do arquivo original, para que todo import existente (COLORS.forest,
 * COLORS.sun, etc.) continue funcionando sem tocar em nenhuma cena.
 * Cada cor é a mesma família de tom do original, só mais clara/pastel
 * e mais saturada — nenhuma foi trocada para a família rosa/lilás das
 * imagens de referência.
 */
export const COLORS = {
  forest: 0x2ecc8f,
  forestDark: 0x11875f,
  leaf: 0x4bd9a0,
  sky: 0xa8e8ff,
  skyLight: 0xeafcf5,
  sun: 0xffd873,
  orange: 0xffa94d,
  coral: 0xff7f6b,
  cream: 0xfff8e8,
  white: 0xffffff,
  ink: 0x18332c,
  muted: 0x5d756e,
  success: 0x3ecf85,
  error: 0xff6b6b,
  card: 0xfefdf7,
  map: 0xb8ecc0
};

/**
 * Novo. Não usado por nenhuma cena ainda — existe para os helpers de
 * src/ui/ (Etapa 2) desenharem contorno + gradiente + brilho de forma
 * consistente. Cada entrada tem:
 *   base      — a mesma cor de COLORS, valor de preenchimento principal
 *   shadow    — tom mais escuro e saturado, usado no contorno grosso e
 *               na metade inferior do gradiente (dá o volume "cartoon")
 *   highlight — tom bem mais claro, usado como brilho no topo da forma
 */
export const COLOR_SHADES = {
  forest:    { base: 0x2ecc8f, shadow: 0x0e7a52, highlight: 0x9ff2ce },
  forestDark:{ base: 0x11875f, shadow: 0x0a5c40, highlight: 0x5fd6a3 },
  leaf:      { base: 0x4bd9a0, shadow: 0x1f9d6f, highlight: 0xb3f2da },
  sky:       { base: 0xa8e8ff, shadow: 0x4fb8e0, highlight: 0xe6faff },
  skyLight:  { base: 0xeafcf5, shadow: 0xbfeadb, highlight: 0xffffff },
  sun:       { base: 0xffd873, shadow: 0xe8a930, highlight: 0xfff2c9 },
  orange:    { base: 0xffa94d, shadow: 0xdb7a1f, highlight: 0xffd9ac },
  coral:     { base: 0xff7f6b, shadow: 0xdb4a35, highlight: 0xffc4ba },
  cream:     { base: 0xfff8e8, shadow: 0xe8dcb8, highlight: 0xffffff },
  white:     { base: 0xffffff, shadow: 0xd8dde0, highlight: 0xffffff },
  success:   { base: 0x3ecf85, shadow: 0x1f9459, highlight: 0xa8ecc7 },
  error:     { base: 0xff6b6b, shadow: 0xd63c3c, highlight: 0xffbdbd },
  card:      { base: 0xfefdf7, shadow: 0xe4e0cf, highlight: 0xffffff },
  map:       { base: 0xb8ecc0, shadow: 0x7ac98a, highlight: 0xe9fbec }
};

/**
 * Espessura de contorno ("4-6px, traço à mão") e leve irregularidade
 * de canto que drawBlob (Etapa 2) vai usar para não parecer vetor
 * perfeito demais.
 */
export const STROKE = {
  thin: 4,
  regular: 5,
  thick: 6,
  color: 0x18332c, // reaproveita COLORS.ink — mantém contraste legível
  jitter: 2 // variação máxima, em px, aplicada aos cantos/pontos da silhueta
};

/**
 * Escala de raio para formas "bulbosas" (base mais larga que o topo).
 * Usado por CartoonPanel/CartoonButton/drawBlob.
 */
export const RADIUS = {
  sm: 14,
  md: 22,
  lg: 34,
  pill: 999 // atalho para botões totalmente arredondados
};

/**
 * Curvas de animação para squash & stretch / bounce.
 */
export const EASE = {
  pressIn: "Back.easeIn",
  pressOut: "Back.easeOut",
  bounce: "Elastic.easeOut",
  soft: "Sine.easeInOut"
};

/**
 * Reescrito para já vir pronto no formato de TextStyle do Phaser
 * (spread direto em this.add.text(x, y, str, { ...FONT.title, color })),
 * em vez de string CSS shorthand solta — formato antigo nunca era
 * consumido por nenhuma cena. FONT_FAMILY inclui fallback para Arial:
 * se a fonte Fredoka ainda não tiver carregado (antes da Etapa 3
 * resolver isso via document.fonts.ready), o texto continua legível.
 */
const FONT_FAMILY = '"Fredoka", Arial, Helvetica, sans-serif';

export const FONT = {
  family: FONT_FAMILY,
  title: { fontFamily: FONT_FAMILY, fontSize: "48px", fontStyle: "700" },
  heading: { fontFamily: FONT_FAMILY, fontSize: "32px", fontStyle: "700" },
  body: { fontFamily: FONT_FAMILY, fontSize: "22px", fontStyle: "600" },
  small: { fontFamily: FONT_FAMILY, fontSize: "17px", fontStyle: "600" }
};