import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.js";
import { createCartoonButton } from "./CartoonButton.js";
import { createCartoonPanel } from "./CartoonPanel.js";
import { createBodyText, createCartoonText } from "./CartoonText.js";


export function createCartoonModal(
  scene,
  { title, message, buttons = [], width = 780, depth = 1000, fontSize = "22px" }
) {
  const container = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(depth);

  const dim = scene.add
    .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x09271e, 0.62)
    .setOrigin(0.5)
    .setInteractive();

  const body = createBodyText(scene, 0, 0, message, {
    fontSize,
    lineSpacing: 5,
    wordWrap: { width: width - 100 }
  });

  const buttonHeight = 58;
  const buttonGap = 14;
  const plateHeight = 68;

  const buttonsBlock = buttons.length
    ? buttons.length * buttonHeight + (buttons.length - 1) * buttonGap
    : 0;

  const height = Math.min(
    GAME_HEIGHT - 30,
    plateHeight + body.height + 40 + buttonsBlock + 40
  );

  const top = -height / 2;

  const panel = createCartoonPanel(scene, 0, 0, width, height, "card");

  const plate = createCartoonPanel(scene, 0, top, 440, plateHeight, "forest", {
    radius: 24
  });

  const plateText = createCartoonText(scene, 0, top, title, "heading", {
    fontSize: "28px",
    color: "#ffffff",
    stroke: "#0e6e4f",
    strokeThickness: 3
  });

  body.setY(top + plateHeight / 2 + 22 + body.height / 2);

  const buttonObjects = [];
  const firstButtonY = body.y + body.height / 2 + 36 + buttonHeight / 2;

  buttons.forEach((button, index) => {
    const y = firstButtonY + index * (buttonHeight + buttonGap);

    const created = createCartoonButton(
      scene,
      0,
      y,
      Math.min(420, width - 120),
      buttonHeight,
      button.label,
      button.color ?? COLORS.forest,
      () => button.onPress?.(),
      { fontSize: "20px" }
    );

    buttonObjects.push(created);
  });

  container.add([dim, panel, plate, plateText, body, ...buttonObjects]);

  container.close = () => {
    if (container.active) container.destroy(true);
  };

  return container;
}
