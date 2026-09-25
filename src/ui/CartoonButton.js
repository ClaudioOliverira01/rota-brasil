import Phaser from "phaser";
import { COLORS, FONT, RADIUS, STROKE, EASE } from "../config/gameConfig.js";
import { AudioManager } from "../systems/AudioManager.js";
import { drawBlob, resolveShades } from "./CartoonShapes.js";

export function createCartoonButton(
  scene,
  x,
  y,
  width,
  height,
  label,
  color,
  callback,
  options = {}
) {
  const isLight = color === COLORS.white || color === "white";
  const shades = resolveShades(color);

  const container = scene.add.container(x, y);

  const graphics = scene.add.graphics();
  drawBlob(graphics, {
    width,
    height,
    colorKey: color,
    radius: height >= 70 ? RADIUS.lg : RADIUS.md,
    strokeWidth: STROKE.thick
  });

  const hitArea = new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height);
  graphics.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains, {
    useHandCursor: true
  });

  const textColor =
    options.textColor ?? (isLight ? "#0e6e4f" : "#ffffff");

  const text = scene.add
    .text(0, 2, label, {
      ...(height >= 70 ? FONT.heading : FONT.small),
      fontSize: options.fontSize ?? (height >= 70 ? "27px" : "20px"),
      color: textColor,
      align: "center",
      stroke: "#18332c",
      strokeThickness: isLight ? 0 : 3,
      shadow: {
        offsetX: 0,
        offsetY: 2,
        color: "#00000055",
        blur: 0,
        fill: true
      }
    })
    .setOrigin(0.5);

  container.add([graphics, text]);
  container.setSize(width, height);
  container.setData("baseScale", 1);

  graphics.on("pointerover", () => {
    scene.tweens.add({
      targets: container,
      scale: 1.06,
      duration: 140,
      ease: EASE.soft
    });
  });

  graphics.on("pointerout", () => {
    scene.tweens.add({
      targets: container,
      scale: 1,
      duration: 140,
      ease: EASE.soft
    });
  });

  graphics.on("pointerdown", () => {
    AudioManager.stop();

    scene.tweens.add({
      targets: container,
      scaleX: 0.92,
      scaleY: 1.08,
      duration: 80,
      ease: EASE.pressIn,
      yoyo: true,
      onComplete: () => callback()
    });
  });

  return container;
}

export const shades = resolveShades;