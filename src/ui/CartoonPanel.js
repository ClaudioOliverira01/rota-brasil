import { RADIUS, STROKE } from "../config/gameConfig.js";
import { drawBlob } from "./CartoonShapes.js";

export function createCartoonPanel(scene, x, y, width, height, colorKey, options = {}) {
  const graphics = scene.add.graphics({ x, y });

  drawBlob(graphics, {
    width,
    height,
    colorKey,
    radius: options.radius ?? RADIUS.lg,
    strokeWidth: options.strokeWidth ?? STROKE.thick,
    withHighlight: options.withHighlight ?? true
  });

  return graphics;
}
