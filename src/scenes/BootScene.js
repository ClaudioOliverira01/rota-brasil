import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.skyLight);

    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 25, "ROTA BRASIL", {
        fontFamily: "Arial",
        fontSize: "46px",
        fontStyle: "bold",
        color: "#0b6e4f"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 30, "A Expedição de Aê", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#18332c"
      })
      .setOrigin(0.5);

    this.time.delayedCall(500, () => this.scene.start("PreloadScene"));
  }
}