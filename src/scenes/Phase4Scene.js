import Phaser from "phaser";

import { createGuide } from "../ui/GuideCharacter.js";

import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH
} from "../config/gameConfig.js";

import { GameState } from "../systems/GameState.js";
import { GameMetrics } from "../systems/GameMetrics.js";
import { ProgressManager } from "../systems/ProgressManager.js";
import { ApiService } from "../services/ApiService.js";
import { AudioManager } from "../systems/AudioManager.js";

const WASTE_ITEMS = [
  {
    id: "plastic",
    emoji: "🥤",
    name: "Garrafa plástica",
    target: "plastic",
    explanation: "A garrafa plástica deve ser separada como plástico."
  },
  {
    id: "metal",
    emoji: "🥫",
    name: "Lata",
    target: "metal",
    explanation: "A lata deve ser separada como metal."
  },
  {
    id: "paper",
    emoji: "📰",
    name: "Jornal",
    target: "paper",
    explanation: "O jornal deve ser separado como papel."
  },
  {
    id: "organic",
    emoji: "🍌",
    name: "Casca de banana",
    target: "organic",
    explanation: "A casca de banana é um resíduo orgânico."
  },
  {
    id: "glass",
    emoji: "🍾",
    name: "Garrafa de vidro",
    target: "glass",
    explanation: "A garrafa deve ser separada como vidro."
  }
];

const TARGETS = [
  {
    id: "plastic",
    label: "PLÁSTICO",
    emoji: "♻️",
    color: 0x4b8ed8,
    x: 930,
    y: 230
  },
  {
    id: "metal",
    label: "METAL",
    emoji: "🥫",
    color: 0xd95d39,
    x: 1110,
    y: 230
  },
  {
    id: "paper",
    label: "PAPEL",
    emoji: "📄",
    color: 0xe7b84b,
    x: 930,
    y: 420
  },
  {
    id: "organic",
    label: "ORGÂNICO",
    emoji: "🍃",
    color: 0x5a9c55,
    x: 1110,
    y: 420
  },
  {
    id: "glass",
    label: "VIDRO",
    emoji: "🍾",
    color: 0x8b6bb1,
    x: 1020,
    y: 600
  }
];

const CARD_POSITIONS = [
  { x: 180, y: 220 },
  { x: 180, y: 340 },
  { x: 180, y: 460 },
  { x: 440, y: 280 },
  { x: 440, y: 420 }
];

export class Phase4Scene extends Phaser.Scene {
  constructor() {
    super("Phase4Scene");

    this.items = [];
    this.targets = {};
    this.correct = 0;
    this.draggingItem = null;
    this.dragPointerId = null;
    this.finishing = false;
    this.feedback = null;
  }

  create() {
    GameMetrics.startPhase(4);

    this.drawBackground();
    this.createHeader();
    this.createMission();
    this.createTargets();
    this.createWasteItems();

    AudioManager.speak(
      "Fase 4. Ajude Aê a separar corretamente os resíduos. Arraste cada objeto até a lixeira correspondente."
    );

    createGuide(this, 4);
  }

  drawBackground() {
    this.cameras.main.setBackgroundColor(COLORS.skyLight);

    const g = this.add.graphics();

    g.fillStyle(COLORS.sky, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    g.fillStyle(COLORS.map, 1);
    g.fillCircle(70, 700, 230);
    g.fillCircle(1220, 700, 260);

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
      .rectangle(
        105,
        45,
        125,
        52,
        COLORS.forest
      )
      .setStrokeStyle(3, COLORS.white);

    this.add
      .text(
        105,
        45,
        "FASE 4",
        {
          fontFamily: "Arial",
          fontSize: "24px",
          fontStyle: "bold",
          color: "#ffffff"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        640,
        45,
        "MISSÃO DA RECICLAGEM",
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
    const panel = this.add.graphics();

    panel.fillStyle(COLORS.cream, 1);

    panel.fillRoundedRect(
      -540,
      -35,
      1080,
      70,
      22
    );

    panel.lineStyle(
      3,
      COLORS.forest,
      1
    );

    panel.strokeRoundedRect(
      -540,
      -35,
      1080,
      70,
      22
    );

    this.add.container(
      640,
      120,
      [panel]
    );

    this.add
      .text(
        640,
        120,
        "♻️ Arraste cada resíduo para o recipiente correto.",
        {
          fontFamily: "Arial",
          fontSize: "22px",
          fontStyle: "bold",
          color: "#18332c"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        640,
        155,
        "Observe o material de cada objeto antes de escolher.",
        {
          fontFamily: "Arial",
          fontSize: "17px",
          color: "#31564a"
        }
      )
      .setOrigin(0.5);
  }

  createTargets() {
    TARGETS.forEach((targetData) => {
      const container = this.add.container(
        targetData.x,
        targetData.y
      );

      const shadow = this.add.rectangle(
        5,
        7,
        180,
        115,
        0x000000,
        0.12
      );

      const background = this.add
        .rectangle(
          0,
          0,
          180,
          115,
          targetData.color,
          1
        )
        .setStrokeStyle(
          5,
          COLORS.white
        );

      const emoji = this.add
        .text(
          0,
          -25,
          targetData.emoji,
          {
            fontFamily: "Arial",
            fontSize: "38px"
          }
        )
        .setOrigin(0.5);

      const label = this.add
        .text(
          0,
          28,
          targetData.label,
          {
            fontFamily: "Arial",
            fontSize: "17px",
            fontStyle: "bold",
            color: "#ffffff"
          }
        )
        .setOrigin(0.5);

      container.add([
        shadow,
        background,
        emoji,
        label
      ]);

      container.setData(
        "target",
        targetData.id
      );

      container.setData(
        "background",
        background
      );

      container.setData(
        "completed",
        false
      );

      this.targets[targetData.id] = container;
    });
  }

  createWasteItems() {
    WASTE_ITEMS.forEach((item, index) => {
      const position = CARD_POSITIONS[index];

      const container = this.add.container(
        position.x,
        position.y
      );

      const shadow = this.add.rectangle(
        5,
        6,
        210,
        82,
        0x000000,
        0.12
      );

      const background = this.add
        .rectangle(
          0,
          0,
          210,
          82,
          COLORS.white,
          1
        )
        .setStrokeStyle(
          4,
          COLORS.forest
        );

      const emoji = this.add
        .text(
          -65,
          0,
          item.emoji,
          {
            fontFamily: "Arial",
            fontSize: "38px"
          }
        )
        .setOrigin(0.5);

      const text = this.add
        .text(
          15,
          0,
          item.name,
          {
            fontFamily: "Arial",
            fontSize: "17px",
            fontStyle: "bold",
            color: "#18332c",
            align: "center",
            wordWrap: {
              width: 120
            }
          }
        )
        .setOrigin(0.5);

      const hitArea = this.add
        .rectangle(
          0,
          0,
          210,
          82,
          0xffffff,
          0
        )
        .setInteractive({
          useHandCursor: true
        });

      container.add([
        shadow,
        background,
        emoji,
        text,
        hitArea
      ]);

      container.setData(
        "item",
        item
      );

      container.setData(
        "homeX",
        position.x
      );

      container.setData(
        "homeY",
        position.y
      );

      container.setData(
        "completed",
        false
      );

      container.setData(
        "background",
        background
      );

      hitArea.on(
        "pointerdown",
        (pointer) => {
          this.beginDrag(
            pointer,
            container
          );
        }
      );

      hitArea.on(
        "pointerover",
        () => {
          if (!this.draggingItem) {
            container.setScale(1.04);
          }
        }
      );

      hitArea.on(
        "pointerout",
        () => {
          if (
            this.draggingItem !== container
          ) {
            container.setScale(1);
          }
        }
      );

      this.items.push(container);
    });

    this.input.on(
      "pointermove",
      (pointer) => {
        this.moveDrag(pointer);
      }
    );

    this.input.on(
      "pointerup",
      (pointer) => {
        this.endDrag(pointer);
      }
    );

    this.input.on(
      "pointerupoutside",
      (pointer) => {
        this.endDrag(pointer);
      }
    );
  }

  beginDrag(pointer, item) {
    if (
      this.draggingItem ||
      item.getData("completed")
    ) {
      return;
    }

    this.draggingItem = item;
    this.dragPointerId = pointer.id;

    item.setDepth(100);
    item.setScale(1.08);
    item.setAlpha(0.95);

    GameMetrics.registerAttempt(4);

    AudioManager.stop();
  }

  moveDrag(pointer) {
    if (
      !this.draggingItem ||
      pointer.id !== this.dragPointerId
    ) {
      return;
    }

    this.draggingItem.x = Phaser.Math.Clamp(
      pointer.x,
      120,
      1160
    );

    this.draggingItem.y = Phaser.Math.Clamp(
      pointer.y,
      190,
      650
    );

    this.highlightNearestTarget();
  }

  endDrag(pointer) {
    if (
      !this.draggingItem ||
      pointer.id !== this.dragPointerId
    ) {
      return;
    }

    const item = this.draggingItem;

    this.draggingItem = null;
    this.dragPointerId = null;

    this.clearTargetHighlights();

    const target = this.findNearestTarget(item);
    const waste = item.getData("item");

    item.setScale(1);
    item.setAlpha(1);

    if (
      target &&
      target.getData("target") === waste.target
    ) {
      this.handleCorrect(
        item,
        target,
        waste
      );
    } else {
      this.handleWrong(
        item,
        waste
      );
    }
  }

  findNearestTarget(item) {
    let nearest = null;
    let distance = Infinity;

    Object.values(this.targets).forEach(
      (target) => {
        if (target.getData("completed")) {
          return;
        }

        const d =
          Phaser.Math.Distance.Between(
            item.x,
            item.y,
            target.x,
            target.y
          );

        if (d < distance) {
          distance = d;
          nearest = target;
        }
      }
    );

    return distance <= 130
      ? nearest
      : null;
  }

  highlightNearestTarget() {
    this.clearTargetHighlights();

    const target =
      this.findNearestTarget(
        this.draggingItem
      );

    if (!target) {
      return;
    }

    target
      .getData("background")
      .setStrokeStyle(
        7,
        COLORS.orange
      );
  }

  clearTargetHighlights() {
    Object.values(this.targets).forEach(
      (target) => {
        if (target.getData("completed")) {
          return;
        }

        target
          .getData("background")
          .setStrokeStyle(
            5,
            COLORS.white
          );
      }
    );
  }

  handleCorrect(
    item,
    target,
    waste
  ) {
    item.setPosition(
      target.x,
      target.y
    );

    item.setDepth(30);

    item.setData(
      "completed",
      true
    );

    target.setData(
      "completed",
      true
    );

    target
      .getData("background")
      .setStrokeStyle(
        7,
        COLORS.success
      );

    this.correct += 1;

    GameState.addScore(20);
    GameState.addStar();

    GameMetrics.addScore(
      4,
      20
    );

    ProgressManager.save();

    this.scoreText.setText(
      `⭐ ${GameState.get().score}`
    );

    this.showFeedback(
      `Muito bem! ${waste.explanation} ♻️`,
      COLORS.success
    );

    AudioManager.speak(
      `Muito bem! ${waste.explanation}`
    );

    if (
      this.correct === WASTE_ITEMS.length &&
      !this.finishing
    ) {
      this.finishing = true;

      this.time.delayedCall(
        1200,
        () => this.finishPhase()
      );
    }
  }

  handleWrong(
    item,
    waste
  ) {
    GameMetrics.registerError(4);

    const duration =
      GameState.get().accessibility
        .reducedMotion
        ? 0
        : 280;

    this.tweens.add({
      targets: item,
      x: item.getData("homeX"),
      y: item.getData("homeY"),
      duration,
      ease: "Back.easeOut"
    });

    this.showFeedback(
      "Quase! Observe o material do objeto e tente novamente. 💡",
      COLORS.orange
    );

    AudioManager.speak(
      "Quase! Observe o material do objeto e tente novamente."
    );
  }

  showFeedback(
    message,
    color
  ) {
    this.feedback?.destroy();

    const bg = this.add.graphics();

    bg.fillStyle(
      color,
      1
    );

    bg.fillRoundedRect(
      -500,
      -28,
      1000,
      56,
      18
    );

    bg.lineStyle(
      3,
      COLORS.white,
      1
    );

    bg.strokeRoundedRect(
      -500,
      -28,
      1000,
      56,
      18
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
            width: 930
          }
        }
      )
      .setOrigin(0.5);

    this.feedback = this.add
      .container(
        640,
        700,
        [
          bg,
          text
        ]
      )
      .setDepth(300);
  }

  async finishPhase() {
    GameMetrics.completePhase(
      4,
      GameState.get().score
    );

    GameState.completePhase(4);

    ProgressManager.save();

    const state = GameState.get();

    const phaseMetrics =
      GameMetrics.get().phases[4] || {};

    try {
      await ApiService.savePhaseResult({
        playerId: state.playerId,
        phase: 4,
        score: state.score,
        stars: state.stars,
        completed: true,
        errors: phaseMetrics.errors || 0,
        attempts: phaseMetrics.attempts || 0,
        timeSeconds:
          phaseMetrics.timeSeconds || 0
      });

      await ApiService.saveProgress({
        ...state,
        metrics: GameMetrics.get()
      });
    } catch (error) {
      console.warn(
        "Não foi possível sincronizar a Fase 4.",
        error
      );
    }

    this.scene.start(
      "VictoryScene",
      {
        phase: 4,
        final: true
      }
    );
  }
}