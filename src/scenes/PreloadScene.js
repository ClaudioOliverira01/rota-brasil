import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  create() {
    // Nesta etapa os elementos visuais são desenhados com Phaser Graphics,
    // portanto o MVP funciona mesmo sem uma pasta de assets.
    this.scene.start("MenuScene");
  }
}