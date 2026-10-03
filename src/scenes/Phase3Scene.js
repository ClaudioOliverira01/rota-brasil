import Phaser from "phaser";

import {
  GAME_WIDTH,
  GAME_HEIGHT
} from "../config/gameConfig.js";

import { createGuide } from "../ui/GuideCharacter.js";
import { GameState } from "../systems/GameState.js";
import { GameMetrics } from "../systems/GameMetrics.js";
import { ProgressManager } from "../systems/ProgressManager.js";
import { AudioManager } from "../systems/AudioManager.js";
import { ApiService } from "../services/ApiService.js";

export class Phase3Scene extends Phaser.Scene {
  constructor() {
    super("Phase3Scene");

    this.cards = [];
    this.targets = [];
    this.completedCards = 0;
    this.totalCards = 4;
    this.finishStarted = false;
  }

  create() {
    this.cards = [];
    this.targets = [];
    this.completedCards = 0;
    this.finishStarted = false;

    /*
     * Facilita o arraste para crianças.
     */
    this.input.dragDistanceThreshold = 4;
    this.input.dragTimeThreshold = 0;

    GameMetrics.startPhase(3);

    this.createBackground();
    this.createHeader();
    this.createInstruction();
    this.createTargets();
    this.createCards();
    this.createProgress();

    AudioManager.speak(
      "Fase três! Arraste cada cartão para a paisagem que combina com seu clima."
    );

    createGuide(this, 3);
  }

  createBackground() {
    this.cameras.main.setBackgroundColor(
      "#DFF6EE"
    );

    const g = this.add.graphics();

    g.fillStyle(
      0xDFF6EE,
      1
    );

    g.fillRect(
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    /*
     * Chão.
     */
    g.fillStyle(
      0xD7EFC9,
      1
    );

    g.fillRect(
      0,
      590,
      GAME_WIDTH,
      130
    );

    /*
     * Morros.
     */
    g.fillStyle(
      0xC5E6B7,
      1
    );

    g.fillCircle(
      90,
      690,
      220
    );

    g.fillCircle(
      1210,
      690,
      250
    );

    /*
     * Sol.
     */
    g.fillStyle(
      0xFFD966,
      1
    );

    g.fillCircle(
      1160,
      70,
      38
    );

    /*
     * Vegetação.
     */
    for (
      let i = 0;
      i < 12;
      i++
    ) {
      const x =
        20 + i * 110;

      g.fillStyle(
        0x75B96B,
        1
      );

      g.fillCircle(
        x,
        670,
        27
      );
    }
  }

  createHeader() {
    this.add.text(
      135,
      43,
      "FASE 3",
      {
        fontFamily: "Arial",
        fontSize: "29px",
        fontStyle: "bold",
        color: "#07543D"
      }
    ).setOrigin(0.5);

    this.add.text(
      GAME_WIDTH / 2,
      43,
      "CLIMA E PAISAGENS",
      {
        fontFamily: "Arial",
        fontSize: "31px",
        fontStyle: "bold",
        color: "#07543D"
      }
    ).setOrigin(0.5);

    this.scoreText =
      this.add.text(
        GAME_WIDTH - 105,
        43,
        `⭐ ${GameState.get().score}`,
        {
          fontFamily: "Arial",
          fontSize: "21px",
          fontStyle: "bold",
          color: "#07543D"
        }
      ).setOrigin(0.5);
  }

  createInstruction() {
    const box =
      this.add.rectangle(
        GAME_WIDTH / 2,
        97,
        1000,
        48,
        0xFFF8E8
      );

    box.setStrokeStyle(
      3,
      0x4D9144
    );

    this.add.text(
      GAME_WIDTH / 2,
      97,
      "🌎 Arraste cada cartão para a paisagem que combina com seu clima.",
      {
        fontFamily: "Arial",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#29443B"
      }
    ).setOrigin(0.5);
  }

  createTargets() {
    const x = 985;

    const targetsData = [
      {
        id: "amazonia",
        name: "AMAZÔNIA",
        y: 205
      },
      {
        id: "sertao",
        name: "SERTÃO",
        y: 315
      },
      {
        id: "cerrado",
        name: "CERRADO",
        y: 425
      },
      {
        id: "pampa",
        name: "PAMPA",
        y: 535
      }
    ];

    this.add.text(
      x,
      145,
      "PAISAGENS BRASILEIRAS",
      {
        fontFamily: "Arial",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#315A4B"
      }
    ).setOrigin(0.5);

    targetsData.forEach(
      (data) => {
        const target =
          this.add.rectangle(
            x,
            data.y,
            370,
            82,
            0xFFFFFF
          );

        target.setStrokeStyle(
          4,
          0x4D9144
        );

        this.add.text(
          x,
          data.y,
          data.name,
          {
            fontFamily: "Arial",
            fontSize: "20px",
            fontStyle: "bold",
            color: "#29443B"
          }
        ).setOrigin(0.5);

        this.targets.push({
          id: data.id,
          x,
          y: data.y,
          object: target,
          occupied: false
        });
      }
    );
  }

  createCards() {
    const cardsData = [
      {
        id: "muita-chuva",
        target: "amazonia",
        title: "MUITA CHUVA",
        description:
          "Lugar quente, úmido e com muita chuva.",
        emoji: "🌧️",
        color: 0x50A474
      },
      {
        id: "pouca-chuva",
        target: "sertao",
        title: "POUCA CHUVA",
        description:
          "Lugar quente e com pouca chuva.",
        emoji: "☀️",
        color: 0xE2A13D
      },
      {
        id: "chuva-moderada",
        target: "cerrado",
        title: "CHUVA MODERADA",
        description:
          "Tem uma época de chuva e outra mais seca.",
        emoji: "🌦️",
        color: 0x4D91C7
      },
      {
        id: "clima-frio",
        target: "pampa",
        title: "CLIMA FRIO",
        description:
          "O inverno pode ser bem frio.",
        emoji: "❄️",
        color: 0x8B69B8
      }
    ];

    /*
     * Embaralhamento.
     */
    const shuffled =
      Phaser.Utils.Array.Shuffle(
        [...cardsData]
      );

    /*
     * Dois cartões à esquerda,
     * dois cartões embaixo.
     */
    const positions = [
      {
        x: 250,
        y: 220
      },
      {
        x: 560,
        y: 220
      },
      {
        x: 250,
        y: 405
      },
      {
        x: 560,
        y: 405
      }
    ];

    shuffled.forEach(
      (data, index) => {
        this.createCard(
          data,
          positions[index].x,
          positions[index].y
        );
      }
    );
  }

  createCard(
    data,
    x,
    y
  ) {
    const card =
      this.add.rectangle(
        x,
        y,
        270,
        130,
        data.color
      );

    card.setStrokeStyle(
      4,
      0xFFFFFF
    );

    const emoji =
      this.add.text(
        x - 100,
        y - 28,
        data.emoji,
        {
          fontFamily: "Arial",
          fontSize: "31px"
        }
      ).setOrigin(0.5);

    const title =
      this.add.text(
        x - 65,
        y - 35,
        data.title,
        {
          fontFamily: "Arial",
          fontSize: "16px",
          fontStyle: "bold",
          color: "#FFFFFF",
          wordWrap: {
            width: 170
          }
        }
      ).setOrigin(0);

    const description =
      this.add.text(
        x - 65,
        y + 5,
        data.description,
        {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#FFFFFF",
          wordWrap: {
            width: 185
          }
        }
      ).setOrigin(0);

    /*
     * O Rectangle inteiro é draggable.
     */
    card.setInteractive({
      draggable: true,
      useHandCursor: true
    });

    card.setData(
      "target",
      data.target
    );

    card.setData(
      "originalX",
      x
    );

    card.setData(
      "originalY",
      y
    );

    card.setData(
      "locked",
      false
    );

    card.on(
      "dragstart",
      () => {
        if (
          card.getData("locked")
        ) {
          return;
        }

        card.setScale(
          1.06
        );

        emoji.setScale(
          1.06
        );

        title.setScale(
          1.06
        );

        description.setScale(
          1.06
        );

        card.setDepth(
          100
        );

        emoji.setDepth(
          101
        );

        title.setDepth(
          101
        );

        description.setDepth(
          101
        );

        GameMetrics.registerAttempt(
          3
        );
      }
    );

    card.on(
      "drag",
      (
        pointer,
        dragX,
        dragY
      ) => {
        card.setPosition(
          dragX,
          dragY
        );

        emoji.setPosition(
          dragX - 100,
          dragY - 28
        );

        title.setPosition(
          dragX - 65,
          dragY - 35
        );

        description.setPosition(
          dragX - 65,
          dragY + 5
        );
      }
    );

    card.on(
      "dragend",
      (pointer) => {
        if (
          card.getData("locked")
        ) {
          return;
        }

        const target =
          this.findTarget(
            pointer.worldX,
            pointer.worldY
          );

        if (!target) {
          this.returnCard(
            card,
            emoji,
            title,
            description
          );

          return;
        }

        if (
          target.id ===
          card.getData("target")
        ) {
          this.correctCard(
            card,
            emoji,
            title,
            description,
            target
          );
        } else {
          this.wrongCard(
            card,
            emoji,
            title,
            description
          );
        }
      }
    );

    this.cards.push({
      card,
      emoji,
      title,
      description
    });
  }

  findTarget(
    x,
    y
  ) {
    for (
      const target
      of this.targets
    ) {
      if (
        target.occupied
      ) {
        continue;
      }

      /*
       * Área de acerto maior que o visual.
       *
       * Isso deixa a atividade mais fácil
       * para uma criança.
       */
      const bounds =
        target.object.getBounds();

      bounds.x -= 20;
      bounds.y -= 20;
      bounds.width += 40;
      bounds.height += 40;

      if (
        Phaser.Geom.Rectangle.Contains(
          bounds,
          x,
          y
        )
      ) {
        return target;
      }
    }

    return null;
  }

  correctCard(
    card,
    emoji,
    title,
    description,
    target
  ) {
    target.occupied =
      true;

    card.setPosition(
      target.x,
      target.y
    );

    emoji.setPosition(
      target.x - 100,
      target.y - 28
    );

    title.setPosition(
      target.x - 65,
      target.y - 35
    );

    description.setPosition(
      target.x - 65,
      target.y + 5
    );

    card.setScale(
      0.86
    );

    emoji.setScale(
      0.86
    );

    title.setScale(
      0.86
    );

    description.setScale(
      0.86
    );

    card.setData(
      "locked",
      true
    );

    card.disableInteractive();

    target.object.setFillStyle(
      0xD9F4DF
    );

    target.object.setStrokeStyle(
      5,
      0x45A85A
    );

    this.add.text(
      target.x + 155,
      target.y - 25,
      "✓",
      {
        fontFamily: "Arial",
        fontSize: "24px",
        fontStyle: "bold",
        color: "#2E8B42"
      }
    ).setOrigin(0.5);

    this.completedCards += 1;

    GameState.addScore(
      20
    );

    GameState.addStar();

    GameMetrics.addScore(
      3,
      20
    );

    ProgressManager.save();

    this.updateScore();
    this.updateProgress();

    AudioManager.speak(
      "Muito bem! Você encontrou a paisagem correta!"
    );

    if (
      this.completedCards ===
      this.totalCards
    ) {
      this.finishPhase();
    }
  }

  wrongCard(
    card,
    emoji,
    title,
    description
  ) {
    GameMetrics.registerError(
      3
    );

    this.returnCard(
      card,
      emoji,
      title,
      description
    );

    this.showFeedback(
      "OPS! TENTE OUTRO LUGAR!"
    );

    AudioManager.speak(
      "Ops! Esse clima combina com outra paisagem. Tente novamente!"
    );
  }

  returnCard(
    card,
    emoji,
    title,
    description
  ) {
    const x =
      card.getData(
        "originalX"
      );

    const y =
      card.getData(
        "originalY"
      );

    this.tweens.add({
      targets:
        card,

      x,
      y,

      duration:
        300,

      ease:
        "Back.easeOut",

      onUpdate:
        () => {
          emoji.setPosition(
            card.x - 100,
            card.y - 28
          );

          title.setPosition(
            card.x - 65,
            card.y - 35
          );

          description.setPosition(
            card.x - 65,
            card.y + 5
          );
        }
    });

    card.setScale(
      1
    );

    emoji.setScale(
      1
    );

    title.setScale(
      1
    );

    description.setScale(
      1
    );
  }

  showFeedback(
    message
  ) {
    const feedback =
      this.add.text(
        570,
        570,
        message,
        {
          fontFamily: "Arial",
          fontSize: "19px",
          fontStyle: "bold",
          color: "#C0392B"
        }
      ).setOrigin(0.5);

    this.tweens.add({
      targets:
        feedback,

      alpha:
        0,

      y:
        545,

      duration:
        900,

      onComplete:
        () => {
          feedback.destroy();
        }
    });
  }

  createProgress() {
    this.progressText =
      this.add.text(
        650,
        680,
        "PAISAGENS ENCONTRADAS: 0 / 4",
        {
          fontFamily: "Arial",
          fontSize: "18px",
          fontStyle: "bold",
          color: "#07543D"
        }
      ).setOrigin(0.5);
  }

  updateProgress() {
    this.progressText.setText(
      `PAISAGENS ENCONTRADAS: ${this.completedCards} / ${this.totalCards}`
    );
  }

  updateScore() {
    this.scoreText.setText(
      `⭐ ${GameState.get().score}`
    );
  }

  async finishPhase() {
    if (
      this.finishStarted
    ) {
      return;
    }

    this.finishStarted =
      true;

    GameMetrics.completePhase(
      3,
      GameState.get().score
    );

    GameState.completePhase(
      3
    );

    ProgressManager.save();

    const state =
      GameState.get();

    const phaseMetrics =
      GameMetrics.get().phases?.[3] || {};

    const phaseStars =
      GameMetrics.starsForErrors(
        phaseMetrics.errors
      );

    try {
      await ApiService.savePhaseResult({
        playerId:
          state.playerId,

        phase:
          3,

        score:
          state.score,

        stars:
          phaseStars,

        completed:
          true,

        errors:
          phaseMetrics.errors || 0,

        attempts:
          phaseMetrics.attempts || 0,

        timeSeconds:
          phaseMetrics.timeSeconds || 0
      });

      await ApiService.saveProgress({
        ...state,

        stars:
          phaseStars,

        metrics:
          GameMetrics.get()
      });

    } catch (error) {
      console.warn(
        "Não foi possível sincronizar a Fase 3.",
        error
      );
    }

    AudioManager.speak(
      "Parabéns! Você completou a fase três!"
    );

    this.time.delayedCall(
      1600,
      () => {
        this.scene.start(
          "VictoryScene",
          {
            phase: 3
          }
        );
      }
    );
  }
}