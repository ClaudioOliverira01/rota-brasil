import { FONT } from "../config/gameConfig.js";

export function createCartoonText(scene, x, y, text, variant = "body", overrides = {}) {
  const base = FONT[variant] ?? FONT.body;

  const defaultStroke = variant === "title" || variant === "heading" ? 5 : 3;

  return scene.add
    .text(x, y, text, {
      ...base,
      color: "#18332c",
      stroke: "#fff8e8",
      strokeThickness: defaultStroke,
      shadow: {
        offsetX: 0,
        offsetY: 3,
        color: "#00000040",
        blur: 0,
        fill: true
      },
      align: "center",
      ...overrides
    })
    .setOrigin(0.5);
}
