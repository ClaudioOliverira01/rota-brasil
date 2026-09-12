import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.js";
import { GameState } from "../systems/GameState.js";
import { AudioManager } from "../systems/AudioManager.js";

export class StoryScene extends Phaser.Scene {
  constructor() {
    super("StoryScene");
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.sky);

    this.add
      .text(640, 75, "A EXPEDIÇÃO COMEÇA!", {
        fontFamily: "Arial",
        fontSize: "42px",
        fontStyle: "bold",
        color: "#07543d"
      })
      .setOrigin(0.5);

    this.add
      .text(640, 185, "🦜", {
        fontFamily: "Arial",
        fontSize: "140px"
      })
      .setOrigin(0.5);

    const nickname = GameState.get().nickname || "Explorador";

    const story = [
      `Olá, ${nickname}! Eu sou Aê.`,
      "",
      "Minha bússola mágica perdeu seus cristais!",
      "Precisamos viajar pelo Brasil para encontrá-los.",
      "",
      "Nossa primeira missão é reconstruir a bússola",
      "usando os pontos cardeais."
    ];

    this.add
      .rectangle(640, 430, 800, 245, COLORS.cream)
      .setStrokeStyle(5, COLORS.forest);

    this.add
      .text(640, 430, story.join("\n"), {
        fontFamily: "Arial",
        fontSize: "23px",
        fontStyle: "bold",
        color: "#18332c",
        align: "center",
        lineSpacing: 9,
        wordWrap: { width: 700 }
      })
      .setOrigin(0.5);

    const button = this.add
      .rectangle(640, 630, 300, 62, COLORS.forest)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(640, 630, "VAMOS! 🧭", {
        fontFamily: "Arial",
        fontSize: "24px",
        fontStyle: "bold",
        color: "#ffffff"
      })
      .setOrigin(0.5);

    button.on("pointerdown", () => this.scene.start("Phase1Scene"));

    AudioManager.speak(
      `Olá, ${nickname}! Minha bússola mágica perdeu seus cristais. Vamos reconstruí-la usando os pontos cardeais.`
    );
  }
}