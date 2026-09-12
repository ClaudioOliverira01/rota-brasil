import Phaser from "phaser";

import { COLORS } from "../config/gameConfig.js";
import { CARDINAL_DIRECTIONS } from "../data/gameData.js";
import { GameState } from "../systems/GameState.js";
import { ProgressManager } from "../systems/ProgressManager.js";
import { ApiService } from "../services/ApiService.js";
import { AudioManager } from "../systems/AudioManager.js";

const CARD_WIDTH = 250;
const CARD_HEIGHT = 76;

const TARGET_WIDTH = 150;
const TARGET_HEIGHT = 76;

const CARD_POSITIONS = {
  north: { x: 220, y: 290 },
  south: { x: 220, y: 420 },
  east: { x: 1060, y: 290 },
  west: { x: 1060, y: 420 }
};

const TARGET_POSITIONS = {
  north: { x: 640, y: 260 },
  east: { x: 815, y: 365 },
  south: { x: 640, y: 500 },
  west: { x: 465, y: 365 }
};

export class Phase1Scene extends Phaser.Scene {
  constructor() {
    super("Phase1Scene");

    this.correct = 0;
    this.total = CARDINAL_DIRECTIONS.length;

    this.targets = {};
    this.cards = {};

    this.draggingCard = null;
    this.dragPointerId = null;

    this.feedbackContainer = null;
    this.scoreText = null;
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.skyLight);

    this.createHeader();
    this.createMission();
    this.createCompass();
    this.createDirectionCards();
    this.createInteractionHint();

    AudioManager.speak(
      "Fase 1. Arraste cada ponto cardeal para o lugar correto na bússola. Pegue uma peça, leve até o lugar certo e solte."
    );
  }

  // =========================================================
  // CABEÇALHO
  // =========================================================

  createHeader() {
  // Box "FASE 1"
  this.add
    .rectangle(105, 42, 118, 48, COLORS.forest, 1)
    .setOrigin(0.5)
    .setStrokeStyle(3, COLORS.white, 1);

  this.add
    .text(105, 42, "FASE 1", {
      fontFamily: "Arial",
      fontSize: "23px",
      fontStyle: "bold",
      color: "#ffffff"
    })
    .setOrigin(0.5);

  // Título principal
  this.add
    .text(640, 42, "O MISTÉRIO DA BÚSSOLA", {
      fontFamily: "Arial",
      fontSize: "34px",
      fontStyle: "bold",
      color: "#07543d"
    })
    .setOrigin(0.5);

  // Pontuação
  this.scoreText = this.add
    .text(1235, 42, `⭐ ${GameState.get().score}`, {
      fontFamily: "Arial",
      fontSize: "23px",
      fontStyle: "bold",
      color: "#07543d"
    })
    .setOrigin(1, 0.5);
}

  // =========================================================
  // MISSÃO
  // =========================================================

  createMission() {
    const mission = this.add.graphics();

    mission.fillStyle(COLORS.cream, 1);
    mission.fillRoundedRect(-490, -38, 980, 76, 20);

    mission.lineStyle(3, COLORS.forest, 1);
    mission.strokeRoundedRect(-490, -38, 980, 76, 20);

    this.add.container(640, 120).add(mission);

    this.add
      .text(
        640,
        120,
        "🧭 Ajude Aê a reconstruir a bússola!\nArraste cada peça colorida até o ponto correspondente.",
        {
          fontFamily: "Arial",
          fontSize: "20px",
          fontStyle: "bold",
          color: "#18332c",
          align: "center",
          lineSpacing: 7,
          wordWrap: {
            width: 900
          }
        }
      )
      .setOrigin(0.5);
  }

  // =========================================================
  // BÚSSOLA
  // =========================================================

  createCompass() {
    const cx = 640;
    const cy = 365;

    const compass = this.add.graphics();

    // Círculo externo
    compass.fillStyle(0xfefdf7, 1);
    compass.fillCircle(cx, cy, 190);

    compass.lineStyle(9, COLORS.forest, 1);
    compass.strokeCircle(cx, cy, 190);

    // Círculo interno
    compass.fillStyle(0xeaf8f0, 1);
    compass.fillCircle(cx, cy, 132);

    compass.lineStyle(4, 0x8fbca9, 1);
    compass.strokeCircle(cx, cy, 132);

    // Centro
    compass.fillStyle(0xffffff, 1);
    compass.fillCircle(cx, cy, 76);

    compass.lineStyle(4, COLORS.orange, 1);
    compass.strokeCircle(cx, cy, 76);

    // Ícone central
    this.add
      .text(cx, cy, "🧭", {
        fontFamily: "Arial",
        fontSize: "70px"
      })
      .setOrigin(0.5);

    // Norte
    this.add
      .text(cx, cy - 83, "N", {
        fontFamily: "Arial",
        fontSize: "22px",
        fontStyle: "bold",
        color: "#c94c4c"
      })
      .setOrigin(0.5);

    // Leste
    this.add
      .text(cx + 85, cy, "L", {
        fontFamily: "Arial",
        fontSize: "22px",
        fontStyle: "bold",
        color: "#d68a00"
      })
      .setOrigin(0.5);

    // Sul
    this.add
      .text(cx, cy + 84, "S", {
        fontFamily: "Arial",
        fontSize: "22px",
        fontStyle: "bold",
        color: "#2e9f65"
      })
      .setOrigin(0.5);

    // Oeste
    this.add
      .text(cx - 85, cy, "O", {
        fontFamily: "Arial",
        fontSize: "22px",
        fontStyle: "bold",
        color: "#416fc7"
      })
      .setOrigin(0.5);

    Object.entries(TARGET_POSITIONS).forEach(([id, position]) => {
      this.createTarget(id, position.x, position.y);
    });
  }

  // =========================================================
  // DESTINOS
  // =========================================================

  createTarget(id, x, y) {
    const direction = CARDINAL_DIRECTIONS.find(
      (item) => item.id === id
    );

    if (!direction) return;

    const container = this.add.container(x, y);

    const background = this.add.graphics();

    background.fillStyle(COLORS.white, 0.98);
    background.fillRoundedRect(
      -TARGET_WIDTH / 2,
      -TARGET_HEIGHT / 2,
      TARGET_WIDTH,
      TARGET_HEIGHT,
      18
    );

    background.lineStyle(4, COLORS.forest, 1);
    background.strokeRoundedRect(
      -TARGET_WIDTH / 2,
      -TARGET_HEIGHT / 2,
      TARGET_WIDTH,
      TARGET_HEIGHT,
      18
    );

    container.add(background);

    const symbol = this.add
      .text(0, -10, direction.symbol, {
        fontFamily: "Arial",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#07543d"
      })
      .setOrigin(0.5);

    const label = this.add
      .text(0, 22, direction.label, {
        fontFamily: "Arial",
        fontSize: "13px",
        fontStyle: "bold",
        color: "#5d756e"
      })
      .setOrigin(0.5);

    container.add([symbol, label]);

    container.setData("directionId", id);
    container.setData("background", background);

    this.targets[id] = container;
  }

  // =========================================================
  // CARTÕES DAS DIREÇÕES
  // =========================================================

  createDirectionCards() {
    CARDINAL_DIRECTIONS.forEach((direction) => {
      const position = CARD_POSITIONS[direction.id];

      const container = this.add.container(
        position.x,
        position.y
      );

      // -----------------------------------------------------
      // SOMBRA
      // -----------------------------------------------------

      const shadow = this.add.graphics();

      shadow.fillStyle(0x000000, 0.14);

      shadow.fillRoundedRect(
        -CARD_WIDTH / 2 + 6,
        -CARD_HEIGHT / 2 + 7,
        CARD_WIDTH,
        CARD_HEIGHT,
        18
      );

      container.add(shadow);

      // -----------------------------------------------------
      // CARTÃO
      // -----------------------------------------------------

      const card = this.add.graphics();

      card.fillStyle(direction.color, 1);

      card.fillRoundedRect(
        -CARD_WIDTH / 2,
        -CARD_HEIGHT / 2,
        CARD_WIDTH,
        CARD_HEIGHT,
        18
      );

      card.lineStyle(4, COLORS.white, 1);

      card.strokeRoundedRect(
        -CARD_WIDTH / 2,
        -CARD_HEIGHT / 2,
        CARD_WIDTH,
        CARD_HEIGHT,
        18
      );

      container.add(card);

      // -----------------------------------------------------
      // TEXTO
      // -----------------------------------------------------

      const label = this.add
        .text(
          0,
          0,
          `${direction.symbol}  ${direction.label}`,
          {
            fontFamily: "Arial",
            fontSize: "22px",
            fontStyle: "bold",
            color: "#ffffff",
            align: "center"
          }
        )
        .setOrigin(0.5);

      container.add(label);

      // -----------------------------------------------------
      // ÁREA INTERATIVA
      // -----------------------------------------------------

      const hitArea = this.add.rectangle(
        0,
        0,
        CARD_WIDTH,
        CARD_HEIGHT,
        0xffffff,
        0
      );

      hitArea.setInteractive({
        useHandCursor: true
      });

      container.add(hitArea);

      // -----------------------------------------------------
      // DADOS
      // -----------------------------------------------------

      container.setData("directionId", direction.id);
      container.setData("homeX", position.x);
      container.setData("homeY", position.y);
      container.setData("shadow", shadow);
      container.setData("card", card);
      container.setData("label", label);
      container.setData("hitArea", hitArea);

      this.cards[direction.id] = container;

      // -----------------------------------------------------
      // INTERAÇÕES
      // -----------------------------------------------------

      hitArea.on("pointerover", () => {
        if (this.draggingCard || !hitArea.input.enabled) {
          return;
        }

        container.setScale(1.04);
      });

      hitArea.on("pointerout", () => {
        if (this.draggingCard === container) {
          return;
        }

        if (!hitArea.input.enabled) {
          return;
        }

        container.setScale(1);
      });

      hitArea.on("pointerdown", (pointer) => {
        this.beginDrag(pointer, container);
      });
    });

    // -------------------------------------------------------
    // EVENTOS GLOBAIS DO MOUSE
    // -------------------------------------------------------

    this.input.on("pointermove", (pointer) => {
      this.moveDraggedCard(pointer);
    });

    this.input.on("pointerup", (pointer) => {
      this.endDrag(pointer);
    });

    this.input.on("pointerupoutside", (pointer) => {
      this.endDrag(pointer);
    });
  }

  // =========================================================
  // DICA
  // =========================================================

  createInteractionHint() {
    this.add
      .text(
        640,
        610,
        "💡 Dica: clique e segure uma peça, mova até a bússola e solte.",
        {
          fontFamily: "Arial",
          fontSize: "19px",
          fontStyle: "bold",
          color: "#18332c",
          align: "center"
        }
      )
      .setOrigin(0.5);

    this.feedbackContainer = null;
  }

  // =========================================================
  // INÍCIO DO DRAG
  // =========================================================

  beginDrag(pointer, card) {
    if (!card || !card.getData("hitArea")) {
      return;
    }

    if (!card.getData("hitArea").input?.enabled) {
      return;
    }

    if (this.draggingCard) {
      return;
    }

    this.draggingCard = card;
    this.dragPointerId = pointer.id;

    // Coloca o cartão na frente
    card.setDepth(20);

    card.setScale(1.08);

    // Pequena transparência para indicar que está sendo segurado
    card.setAlpha(0.94);

    const shadow = card.getData("shadow");

    if (shadow) {
      shadow.setVisible(false);
    }

    this.showFeedback(
      "Segure a peça e leve-a até o ponto correto.",
      COLORS.forest
    );

    AudioManager.stop();
  }

  // =========================================================
  // MOVIMENTO DURANTE O DRAG
  // =========================================================

  moveDraggedCard(pointer) {
    if (!this.draggingCard) {
      return;
    }

    if (pointer.id !== this.dragPointerId) {
      return;
    }

    const card = this.draggingCard;

    // Mantém o cartão dentro da área útil do jogo
    card.x = Phaser.Math.Clamp(
      pointer.x,
      135,
      1145
    );

    card.y = Phaser.Math.Clamp(
      pointer.y,
      220,
      555
    );

    this.updateTargetHighlight();
  }

  // =========================================================
  // FIM DO DRAG
  // =========================================================

  endDrag(pointer) {
    if (!this.draggingCard) {
      return;
    }

    if (pointer.id !== this.dragPointerId) {
      return;
    }

    const card = this.draggingCard;

    this.draggingCard = null;
    this.dragPointerId = null;

    const directionId = card.getData("directionId");

    const target = this.findNearestTarget(card);

    const direction = CARDINAL_DIRECTIONS.find(
      (item) => item.id === directionId
    );

    // Restaura visual
    card.setDepth(2);
    card.setScale(1);
    card.setAlpha(1);

    const shadow = card.getData("shadow");

    if (shadow) {
      shadow.setVisible(true);
    }

    this.clearTargetHighlights();

    if (
      target &&
      target.getData("directionId") === directionId
    ) {
      this.handleCorrect(
        card,
        target,
        direction
      );
    } else {
      this.handleWrong(
        card,
        direction
      );
    }
  }

  // =========================================================
  // PROCURA O ALVO MAIS PRÓXIMO
  // =========================================================

  findNearestTarget(card) {
    let nearest = null;
    let shortestDistance = Infinity;

    Object.values(this.targets).forEach((target) => {
      const distance = Phaser.Math.Distance.Between(
        card.x,
        card.y,
        target.x,
        target.y
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearest = target;
      }
    });

    // Margem generosa para facilitar para crianças
    return shortestDistance <= 145
      ? nearest
      : null;
  }

  // =========================================================
  // DESTACA O ALVO MAIS PRÓXIMO
  // =========================================================

  updateTargetHighlight() {
    if (!this.draggingCard) {
      return;
    }

    const target = this.findNearestTarget(
      this.draggingCard
    );

    this.clearTargetHighlights();

    if (!target) {
      return;
    }

    const background = target.getData("background");

    if (background) {
      background.clear();

      background.fillStyle(
        COLORS.cream,
        1
      );

      background.fillRoundedRect(
        -TARGET_WIDTH / 2,
        -TARGET_HEIGHT / 2,
        TARGET_WIDTH,
        TARGET_HEIGHT,
        18
      );

      background.lineStyle(
        6,
        COLORS.orange,
        1
      );

      background.strokeRoundedRect(
        -TARGET_WIDTH / 2,
        -TARGET_HEIGHT / 2,
        TARGET_WIDTH,
        TARGET_HEIGHT,
        18
      );
    }

    target.setScale(1.05);
  }

  // =========================================================
  // REMOVE DESTAQUES
  // =========================================================

  clearTargetHighlights() {
    Object.values(this.targets).forEach((target) => {
      const background = target.getData("background");

      if (background) {
        background.clear();

        background.fillStyle(
          COLORS.white,
          0.98
        );

        background.fillRoundedRect(
          -TARGET_WIDTH / 2,
          -TARGET_HEIGHT / 2,
          TARGET_WIDTH,
          TARGET_HEIGHT,
          18
        );

        background.lineStyle(
          4,
          COLORS.forest,
          1
        );

        background.strokeRoundedRect(
          -TARGET_WIDTH / 2,
          -TARGET_HEIGHT / 2,
          TARGET_WIDTH,
          TARGET_HEIGHT,
          18
        );
      }

      target.setScale(1);
    });
  }

  // =========================================================
  // RESPOSTA CORRETA
  // =========================================================

  handleCorrect(card, target, direction) {
    const hitArea = card.getData("hitArea");

    if (hitArea) {
      hitArea.disableInteractive();
    }

    // Coloca exatamente no centro do destino
    card.x = target.x;
    card.y = target.y;

    card.setScale(1);

    card.setAlpha(1);

    const shadow = card.getData("shadow");

    if (shadow) {
      shadow.setVisible(false);
    }

    const cardGraphic = card.getData("card");

    if (cardGraphic) {
      cardGraphic.clear();

      cardGraphic.fillStyle(
        COLORS.success,
        1
      );

      cardGraphic.fillRoundedRect(
        -CARD_WIDTH / 2,
        -CARD_HEIGHT / 2,
        CARD_WIDTH,
        CARD_HEIGHT,
        18
      );

      cardGraphic.lineStyle(
        4,
        COLORS.white,
        1
      );

      cardGraphic.strokeRoundedRect(
        -CARD_WIDTH / 2,
        -CARD_HEIGHT / 2,
        CARD_WIDTH,
        CARD_HEIGHT,
        18
      );
    }

    target.setScale(1);

    const targetBackground =
      target.getData("background");

    if (targetBackground) {
      targetBackground.clear();

      targetBackground.fillStyle(
        0xdff6e8,
        1
      );

      targetBackground.fillRoundedRect(
        -TARGET_WIDTH / 2,
        -TARGET_HEIGHT / 2,
        TARGET_WIDTH,
        TARGET_HEIGHT,
        18
      );

      targetBackground.lineStyle(
        4,
        COLORS.success,
        1
      );

      targetBackground.strokeRoundedRect(
        -TARGET_WIDTH / 2,
        -TARGET_HEIGHT / 2,
        TARGET_WIDTH,
        TARGET_HEIGHT,
        18
      );
    }

    this.correct += 1;

    GameState.addScore(10);
    GameState.addStar();

    this.scoreText.setText(
      `⭐ ${GameState.get().score}`
    );

    this.showFeedback(
      `Muito bem! ${direction.label} está no lugar certo! ⭐`,
      COLORS.success
    );

    AudioManager.speak(
      `Muito bem! ${direction.label} está no lugar certo.`
    );

    if (this.correct === this.total) {
      this.time.delayedCall(
        1100,
        () => this.finishPhase()
      );
    }
  }

  // =========================================================
  // RESPOSTA ERRADA
  // =========================================================

  handleWrong(card, direction) {
    const original =
      CARD_POSITIONS[direction.id];

    const duration =
      GameState.get().accessibility.reducedMotion
        ? 0
        : 280;

    this.tweens.add({
      targets: card,

      x: original.x,
      y: original.y,

      duration,

      ease: "Back.easeOut"
    });

    this.showFeedback(
      `Quase! O ${direction.label} não fica aí. Observe a bússola e tente novamente.`,
      COLORS.orange
    );

    AudioManager.speak(
      `Quase! Observe a direção ${direction.label} e tente novamente.`
    );
  }

  // =========================================================
  // FEEDBACK
  // =========================================================

  showFeedback(message, color) {
    if (this.feedbackContainer) {
      this.feedbackContainer.destroy(true);
    }

    this.feedbackContainer =
      this.add.container(
        640,
        675
      );

    this.feedbackContainer.setDepth(50);

    const bg = this.add.graphics();

    bg.fillStyle(
      color,
      1
    );

    bg.fillRoundedRect(
      -440,
      -24,
      880,
      48,
      16
    );

    bg.lineStyle(
      3,
      COLORS.white,
      1
    );

    bg.strokeRoundedRect(
      -440,
      -24,
      880,
      48,
      16
    );

    const text = this.add
      .text(
        0,
        0,
        message,
        {
          fontFamily: "Arial",
          fontSize: "17px",
          fontStyle: "bold",
          color: "#ffffff",
          align: "center",
          wordWrap: {
            width: 820
          }
        }
      )
      .setOrigin(0.5);

    this.feedbackContainer.add([
      bg,
      text
    ]);
  }

  // =========================================================
  // FINALIZAÇÃO DA FASE
  // =========================================================

async finishPhase() {

  console.log(
    "FASE 1: finishPhase() foi chamada"
  );

  GameState.completePhase(1);

  ProgressManager.save();

  const state =
    GameState.get();

  try {

    await ApiService.savePhaseResult({

      playerId:
        state.playerId,

      phase:
        1,

      score:
        state.score,

      stars:
        3,

      completed:
        true
    });

    await ApiService.saveProgress({
      playerId: state.playerId,
      currentPhase: 2,
      score: state.score,
      stars: 3
    });

  } catch (error) {

    console.warn(
      "API indisponível. Progresso permanece salvo localmente.",
      error
    );
  }

  this.scene.start(
    "VictoryScene",
    {
      phase: 1,
      score: state.score,
      stars: 3
      }
    );
  }
}