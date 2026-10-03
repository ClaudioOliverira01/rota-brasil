import { createGuide } from "../ui/GuideCharacter.js";
import Phaser from "phaser";
import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH
} from "../config/gameConfig.js";

import { GameState } from "../systems/GameState.js";
import { GameMetrics } from "../systems/GameMetrics.js";
import { ProgressManager } from "../systems/ProgressManager.js";
import { AudioManager } from "../systems/AudioManager.js";
import { ApiService } from "../services/ApiService.js";
import { BONUS_RULES, getBonusSeal } from "../data/compassData.js";

const ANIMALS = [
  {
    id: "tucano",
    name: "Tucano",
    emoji: "🦜",
    sound: "/assets/audio/animals/tucano.mp3"
  },
  {
    id: "onca",
    name: "Onça-pintada",
    emoji: "🐆",
    sound: "/assets/audio/animals/onca.mp3"
  },
  {
    id: "tartaruga",
    name: "Tartaruga",
    emoji: "🐢",
    sound: "/assets/audio/animals/tartaruga.mp3"
  },
  {
    id: "sapo",
    name: "Sapo",
    emoji: "🐸",
    sound: "/assets/audio/animals/sapo.mp3"
  }
];

export class BonusScene extends Phaser.Scene {
  constructor() {
    super("BonusScene");

    this.currentIndex = 0;
    this.score = 0;
    this.currentAnimal = null;
    this.answerButtons = [];
    this.audio = null;
    this.answered = false;
  }

  create() {
    this.currentIndex = 0;
    this.answered = false;
    this.answerButtons = [];
    this.audio = null;

    this.drawBackground();
    this.createHeader();
    this.createMission();
    this.loadChallenge();

    AudioManager.speak(
      "Fase bônus! Ouça o som e descubra qual animal brasileiro está fazendo esse som."
    );

    createGuide(this, 5);
  }

  drawBackground() {
    this.cameras.main.setBackgroundColor(
      COLORS.skyLight
    );

    const g = this.add.graphics();

    g.fillStyle(COLORS.sky, 1);
    g.fillRect(
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    g.fillStyle(COLORS.map, 1);
    g.fillCircle(80, 700, 230);
    g.fillCircle(1200, 700, 260);

    g.fillStyle(COLORS.leaf, 1);

    for (let i = 0; i < 15; i += 1) {
      g.fillCircle(
        30 + i * 90,
        700 + (i % 2) * 8,
        40
      );
    }
  }

  createHeader() {
    this.add
      .text(
        640,
        55,
        "🌎 DESAFIO DOS ANIMAIS BRASILEIROS",
        {
          fontFamily: "Arial",
          fontSize: "32px",
          fontStyle: "bold",
          color: "#07543d"
        }
      )
      .setOrigin(0.5);

    this.scoreText = this.add
      .text(
        1235,
        45,
        `⭐ ${GameState.get().score}`,
        {
          fontFamily: "Arial",
          fontSize: "23px",
          fontStyle: "bold",
          color: "#07543d"
        }
      )
      .setOrigin(1, 0.5);
  }

  createMission() {
    this.add
      .text(
        640,
        120,
        "Ouça o som e escolha o animal correto!",
        {
          fontFamily: "Arial",
          fontSize: "23px",
          fontStyle: "bold",
          color: "#18332c"
        }
      )
      .setOrigin(0.5);
  }

  loadChallenge() {
    this.destroyButtons();

    this.answered = false;

    this.currentAnimal =
      ANIMALS[this.currentIndex];

    this.add
      .text(
        640,
        190,
        `Desafio ${this.currentIndex + 1} de ${ANIMALS.length}`,
        {
          fontFamily: "Arial",
          fontSize: "19px",
          fontStyle: "bold",
          color: "#31564a"
        }
      )
      .setOrigin(0.5);

    const panel = this.add.graphics();

    panel.fillStyle(
      COLORS.cream,
      1
    );

    panel.fillRoundedRect(
      440,
      220,
      400,
      150,
      30
    );

    panel.lineStyle(
      4,
      COLORS.forest,
      1
    );

    panel.strokeRoundedRect(
      440,
      220,
      400,
      150,
      30
    );

    const playButton = this.add
      .rectangle(
        640,
        295,
        250,
        65,
        COLORS.forest
      )
      .setStrokeStyle(
        4,
        COLORS.white
      )
      .setInteractive({
        useHandCursor: true
      });

    const playText = this.add
      .text(
        640,
        295,
        "🔊 OUVIR SOM",
        {
          fontFamily: "Arial",
          fontSize: "23px",
          fontStyle: "bold",
          color: "#ffffff"
        }
      )
      .setOrigin(0.5);

    playButton.on(
      "pointerdown",
      () => this.playAnimalSound()
    );

    this.createAnswers();
  }

  createAnswers() {
    const shuffled =
      Phaser.Utils.Array.Shuffle([
        ...ANIMALS
      ]);

    shuffled.forEach((animal, index) => {
      const x =
        index % 2 === 0
          ? 410
          : 870;

      const y =
        465 +
        Math.floor(index / 2) * 95;

      const button = this.add
        .rectangle(
          x,
          y,
          360,
          70,
          COLORS.white
        )
        .setStrokeStyle(
          4,
          COLORS.forest
        )
        .setInteractive({
          useHandCursor: true
        });

      const text = this.add
        .text(
          x,
          y,
          `${animal.emoji} ${animal.name}`,
          {
            fontFamily: "Arial",
            fontSize: "21px",
            fontStyle: "bold",
            color: "#18332c"
          }
        )
        .setOrigin(0.5);

      button.on(
        "pointerdown",
        () => {
          this.answer(
            animal,
            button,
            text
          );
        }
      );

      this.answerButtons.push({
        button,
        text
      });
    });
  }

  playAnimalSound() {
    if (!this.currentAnimal) return;

    this.audio = AudioManager.playAnimalSound(
      this.currentAnimal.sound,
      this.currentAnimal.id
    );
  }

  answer(
    animal,
    button,
    text
  ) {
    if (this.answered) return;

    GameMetrics.registerAttempt(
      "bonus"
    );

    if (
      animal.id !==
      this.currentAnimal.id
    ) {
      GameMetrics.registerError(
        "bonus"
      );

      button.setFillStyle(
        COLORS.error
      );

      text.setColor(
        "#ffffff"
      );

      AudioManager.speak(
        "Quase! Ouça novamente o som e tente outra vez."
      );

      this.time.delayedCall(
        800,
        () => {
          button.setFillStyle(
            COLORS.white
          );

          text.setColor(
            "#18332c"
          );
        }
      );

      return;
    }

    this.answered = true;

    button.setFillStyle(
      COLORS.success
    );

    text.setColor(
      "#ffffff"
    );

    GameState.addScore(15);
    GameState.addStar();

    this.scoreText.setText(
      `⭐ ${GameState.get().score}`
    );

    AudioManager.speak(
      `Muito bem! Você reconheceu o som do ${animal.name}.`
    );

    this.time.delayedCall(
      1000,
      () => {
        if (
          this.currentIndex <
          ANIMALS.length - 1
        ) {
          this.currentIndex += 1;
          this.loadChallenge();
        } else {
          this.finishBonus();
        }
      }
    );
  }

  destroyButtons() {
    this.answerButtons.forEach(
      item => {
        item.button.destroy();
        item.text.destroy();
      }
    );

    this.answerButtons = [];
  }

  async finishBonus() {
    const state = GameState.get();
    const seal = getBonusSeal(state);

    GameState.addScore(BONUS_RULES.completionPoints);
    GameState.completeBonus(seal);
    ProgressManager.save();

    try {
      await ApiService.saveProgress({
        ...GameState.get(),
        metrics: GameMetrics.get()
      });
    } catch (error) {
      console.warn("Não foi possível sincronizar o bônus.", error);
    }

    AudioManager.speak(
      seal === "gold"
        ? "Parabéns! Você completou o desafio e ganhou o selo dourado de explorador!"
        : "Parabéns! Você completou o desafio dos animais brasileiros e ganhou o selo de explorador!"
    );

    this.time.delayedCall(
      1000,
      () => {
        this.scene.start(
          "VictoryScene",
          {
            phase: 4,
            bonus: true,
            final: true
          }
        );
      }
    );
  }
}