import { COLOR_SHADES, STROKE, RADIUS } from "../config/gameConfig.js";

function resolveShades(colorKeyOrHex) {
  if (typeof colorKeyOrHex === "string" && COLOR_SHADES[colorKeyOrHex]) {
    return COLOR_SHADES[colorKeyOrHex];
  }

  if (typeof colorKeyOrHex === "number") {
    const match = Object.values(COLOR_SHADES).find(
      (shade) => shade.base === colorKeyOrHex
    );
    if (match) return match;

    return {
      base: colorKeyOrHex,
      shadow: darken(colorKeyOrHex, 0.35),
      highlight: lighten(colorKeyOrHex, 0.55)
    };
  }

  return COLOR_SHADES.card;
}

function darken(hex, amount) {
  const r = Math.round(((hex >> 16) & 0xff) * (1 - amount));
  const g = Math.round(((hex >> 8) & 0xff) * (1 - amount));
  const b = Math.round((hex & 0xff) * (1 - amount));
  return (r << 16) | (g << 8) | b;
}

function lighten(hex, amount) {
  const r = Math.round(((hex >> 16) & 0xff) + (255 - ((hex >> 16) & 0xff)) * amount);
  const g = Math.round(((hex >> 8) & 0xff) + (255 - ((hex >> 8) & 0xff)) * amount);
  const b = Math.round((hex & 0xff) + (255 - (hex & 0xff)) * amount);
  return (r << 16) | (g << 8) | b;
}

function jitteredRadius(baseRadius, seed = 0) {
  const j = STROKE.jitter;
  const rnd = (n) => baseRadius + (((seed * 97 + n * 131) % (j * 2 + 1)) - j);
  return {
    tl: Math.max(4, rnd(1) * 1.08),
    tr: Math.max(4, rnd(2) * 1.08),
    bl: Math.max(4, rnd(3) * 0.85),
    br: Math.max(4, rnd(4) * 0.85)
  };
}

export function drawBlob(graphics, options) {
  const {
    width,
    height,
    colorKey,
    radius = RADIUS.md,
    strokeWidth = STROKE.regular,
    withHighlight = true,
    seed = Math.floor(width * 7 + height * 13)
  } = options;

  const shades = resolveShades(colorKey);
  const corners = jitteredRadius(radius, seed);
  const x = -width / 2;
  const y = -height / 2;

  graphics.clear();

  graphics.fillStyle(0x000000, 0.14);
  graphics.fillRoundedRect(x + 4, y + 7, width, height, corners);

  graphics.fillGradientStyle(
    shades.highlight,
    shades.highlight,
    shades.shadow,
    shades.base,
    1
  );
  graphics.fillRoundedRect(x, y, width, height, corners);

  graphics.lineStyle(strokeWidth, STROKE.color, 1);
  graphics.strokeRoundedRect(x, y, width, height, corners);

  if (withHighlight) {
    graphics.fillStyle(0xffffff, 0.35);
    graphics.fillRoundedRect(
      x + width * 0.12,
      y + height * 0.12,
      width * 0.76,
      height * 0.22,
      { tl: corners.tl * 0.6, tr: corners.tr * 0.6, bl: 999, br: 999 }
    );
  }

  return { shades, corners };
}

export { resolveShades, darken, lighten };