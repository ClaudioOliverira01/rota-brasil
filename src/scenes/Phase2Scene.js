import Phaser from "phaser";

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

const BIOMES = [
  {
    id: "amazonia",
    name: "AMAZÔNIA",
    hint: "Floresta muito verde e muitos rios.",
    region: "NORTE",
    emoji: "🌳"
  },
  {
    id: "caatinga",
    name: "CAATINGA",
    hint: "Vegetação adaptada a lugares mais secos.",
    region: "NORDESTE",
    emoji: "🌵"
  },
  {
    id: "cerrado",
    name: "CERRADO",
    hint: "Árvores baixas, campos e época de seca.",
    region: "CENTRO-OESTE",
    emoji: "🌾"
  },
  {
    id: "mata",
    name: "MATA ATLÂNTICA",
    hint: "Presente em grande parte do litoral brasileiro.",
    region: "SUDESTE",
    emoji: "🌿"
  },
  {
    id: "pampa",
    name: "PAMPA",
    hint: "Grandes campos de vegetação rasteira no extremo sul.",
    region: "SUL",
    emoji: "🍃"
  }
];

const REGIONS = [
  "NORTE",
  "NORDESTE",
  "CENTRO-OESTE",
  "SUDESTE",
  "SUL"
];

const CARD_WIDTH = 430;
const CARD_HEIGHT = 82;

const ZONE_WIDTH = 430;
const ZONE_HEIGHT = 72;

const DROP_PADDING = 45;

export default class Phase2Scene extends Phaser.Scene {

  constructor() {

    super("Phase2Scene");

    this.cards = [];
    this.zones = {};

    this.answered = 0;
    this.errors = 0;

    this.finishing = false;
    this.finished = false;

    this.feedback = null;

    this.draggingCard = null;
    this.highlightedZone = null;
  }

  // ============================================
  // CREATE
  // ============================================

  create() {

    GameMetrics.startPhase(2);

    this.drawBackground();

    this.createHeader();

    this.createInstructions();

    this.createHintButton();

    this.createZones();

    this.createCards();

    AudioManager.speak(
      "Fase 2. Observe cada paisagem e arraste o cartão para a região correta do Brasil."
    );
  }

  // ============================================
  // BACKGROUND
  // ============================================

  drawBackground() {

    this.cameras.main.setBackgroundColor(
      COLORS.skyLight
    );

    this.add
      .rectangle(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT,
        0xF4F8E8
      )
      .setOrigin(0);
  }

  // ============================================
  // HEADER
  // ============================================

  createHeader() {

    this.add
      .rectangle(
        30,
        20,
        GAME_WIDTH - 60,
        72,
        0xFFFFFF
      )
      .setOrigin(0)
      .setStrokeStyle(
        3,
        0x4C8A3A
      );

    this.add.text(
      55,
      39,
      "FASE 2",
      {
        fontFamily: "Arial",
        fontSize: "30px",
        fontStyle: "bold",
        color: "#35652A"
      }
    );

    this.add.text(
      GAME_WIDTH - 310,
      45,
      "🌎 PAISAGENS PELO BRASIL",
      {
        fontFamily: "Arial",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#35652A"
      }
    );
  }

  // ============================================
  // INSTRUCTIONS
  // ============================================

  createInstructions() {

    this.add
      .text(
        GAME_WIDTH / 2,
        125,
        "Arraste cada paisagem para a região correta!",
        {
          fontFamily: "Arial",
          fontSize: "23px",
          fontStyle: "bold",
          color: "#333333"
        }
      )
      .setOrigin(0.5);
  }

  // ============================================
  // HINT BUTTON
  // ============================================

  createHintButton() {

    const button =
      this.add
        .rectangle(
          170,
          125,
          180,
          46,
          0xD89B3C
        )
        .setStrokeStyle(
          3,
          0x9A6A21
        )
        .setInteractive({
          useHandCursor: true
        });

    this.add
      .text(
        170,
        125,
        "💡 DICA",
        {
          fontFamily: "Arial",
          fontSize: "19px",
          fontStyle: "bold",
          color: "#FFFFFF"
        }
      )
      .setOrigin(0.5);

    button.on(
      "pointerdown",
      () => {
        this.showGlobalHint();
      }
    );
  }

  // ============================================
  // ZONES
  // ============================================

  createZones() {

    const x = 900;
    const startY = 190;
    const gap = 92;

    REGIONS.forEach(
      (region, index) => {

        const y =
          startY +
          index * gap;

        const zone =
          this.add
            .rectangle(
              x,
              y,
              ZONE_WIDTH,
              ZONE_HEIGHT,
              0xFFFFFF
            )
            .setStrokeStyle(
              4,
              0x4C8A3A
            );

        zone.setData(
          "region",
          region
        );

        zone.setData(
          "defaultFill",
          0xFFFFFF
        );

        zone.setData(
          "defaultStroke",
          0x4C8A3A
        );

        zone.setData(
          "completed",
          false
        );

        this.add
          .text(
            x,
            y,
            region,
            {
              fontFamily: "Arial",
              fontSize: "21px",
              fontStyle: "bold",
              color: "#35652A"
            }
          )
          .setOrigin(0.5);

        this.zones[region] =
          zone;
      }
    );
  }

  // ============================================
  // CARDS
  // ============================================

  createCards() {

    const positions = [
      {
        x: 285,
        y: 205
      },
      {
        x: 285,
        y: 310
      },
      {
        x: 285,
        y: 415
      },
      {
        x: 285,
        y: 520
      },
      {
        x: 285,
        y: 625
      }
    ];

    BIOMES.forEach(
      (biome, index) => {

        const position =
          positions[index];

        const card =
          this.add.container(
            position.x,
            position.y
          );

        // ======================================
        // SOMBRA
        // ======================================

        const shadow =
          this.add.rectangle(
            7,
            8,
            CARD_WIDTH,
            CARD_HEIGHT,
            0x000000,
            0.12
          );

        // ======================================
        // FUNDO
        // ======================================

        const background =
          this.add
            .rectangle(
              0,
              0,
              CARD_WIDTH,
              CARD_HEIGHT,
              0xFFFFFF
            )
            .setStrokeStyle(
              4,
              0xD89B3C
            );

        // ======================================
        // EMOJI
        // ======================================

        const emoji =
          this.add
            .text(
              -185,
              0,
              biome.emoji,
              {
                fontFamily: "Arial",
                fontSize: "35px"
              }
            )
            .setOrigin(0.5);

        // ======================================
        // TÍTULO
        // ======================================

        const title =
          this.add.text(
            -140,
            -20,
            biome.name,
            {
              fontFamily: "Arial",
              fontSize: "18px",
              fontStyle: "bold",
              color: "#333333"
            }
          );

        // ======================================
        // DICA
        // ======================================

        const hint =
          this.add.text(
            -140,
            8,
            biome.hint,
            {
              fontFamily: "Arial",
              fontSize: "13px",
              color: "#555555",
              wordWrap: {
                width: 310
              }
            }
          );

        card.add([
          shadow,
          background,
          emoji,
          title,
          hint
        ]);

        // ======================================
        // TAMANHO DO CONTAINER
        // ======================================

        card.setSize(
          CARD_WIDTH,
          CARD_HEIGHT
        );

        // ======================================
        // ÁREA INTERATIVA
        // ======================================

        const hitArea =
          new Phaser.Geom.Rectangle(
            -CARD_WIDTH / 2,
            -CARD_HEIGHT / 2,
            CARD_WIDTH,
            CARD_HEIGHT
          );

        card.setInteractive(
          hitArea,
          Phaser.Geom.Rectangle.Contains,
          {
            useHandCursor: true
          }
        );

        // ======================================
        // ATIVAR DRAG DO PHASER
        // ======================================

        this.input.setDraggable(
          card
        );

        // ======================================
        // DADOS
        // ======================================

        card.setData(
          "biome",
          biome
        );

        card.setData(
          "homeX",
          position.x
        );

        card.setData(
          "homeY",
          position.y
        );

        card.setData(
          "background",
          background
        );

        card.setData(
          "completed",
          false
        );

        // ======================================
        // DRAG START
        // ======================================

        card.on(
          "dragstart",
          (pointer) => {

            this.startCardDrag(
              pointer,
              card
            );

          }
        );

        // ======================================
        // DRAG
        // ======================================

        card.on(
          "drag",
          (pointer, dragX, dragY) => {

            this.updateCardDrag(
              pointer,
              card,
              dragX,
              dragY
            );

          }
        );

        // ======================================
        // DRAG END
        // ======================================

        card.on(
          "dragend",
          (pointer) => {

            this.endCardDrag(
              pointer,
              card
            );

          }
        );

        this.cards.push({
          container: card,
          background,
          biome,
          originalX:
            position.x,
          originalY:
            position.y,
          completed: false
        });
      }
    );
  }

  // ============================================
  // START CARD DRAG
  // ============================================

  startCardDrag(
    pointer,
    card
  ) {

    if (
      this.finishing ||
      this.finished
    ) {
      return;
    }

    if (
      this.draggingCard
    ) {
      return;
    }

    if (
      card.getData(
        "completed"
      )
    ) {
      return;
    }

    this.draggingCard =
      card;

    card.setDepth(
      100
    );

    card.setScale(
      1.05
    );

    const background =
      card.getData(
        "background"
      );

    if (background) {

      background.setStrokeStyle(
        5,
        0xD89B3C
      );
    }

    GameMetrics.registerAttempt(
      2
    );

    AudioManager.stop();
  }

  // ============================================
  // UPDATE CARD DRAG
  // ============================================

  updateCardDrag(
    pointer,
    card,
    dragX,
    dragY
  ) {

    if (
      this.draggingCard !==
      card
    ) {
      return;
    }

    const halfWidth =
      (
        CARD_WIDTH *
        card.scaleX
      ) / 2;

    const halfHeight =
      (
        CARD_HEIGHT *
        card.scaleY
      ) / 2;

    const newX =
      Phaser.Math.Clamp(
        dragX,
        halfWidth + 20,
        GAME_WIDTH -
          halfWidth -
          20
      );

    const newY =
      Phaser.Math.Clamp(
        dragY,
        165 + halfHeight,
        GAME_HEIGHT -
          halfHeight -
          45
      );

    card.x = newX;
    card.y = newY;

    this.updateZoneHighlight(
      card
    );
  }

  // ============================================
  // END CARD DRAG
  // ============================================

  endCardDrag(
    pointer,
    card
  ) {

    if (
      this.draggingCard !==
      card
    ) {
      return;
    }

    this.draggingCard =
      null;

    const biome =
      card.getData(
        "biome"
      );

    card.setScale(
      1
    );

    card.setDepth(
      10
    );

    const background =
      card.getData(
        "background"
      );

    if (background) {

      background.setStrokeStyle(
        4,
        0xD89B3C
      );
    }

    const targetRegion =
      this.getDropRegion(
        card
      );

    this.clearZoneHighlight();

    // ========================================
    // NÃO ESTÁ EM UMA REGIÃO
    // ========================================

    if (!targetRegion) {

      this.returnCard(
        card
      );

      this.showFeedback(
        "Coloque o cartão mais perto de uma região. 💡"
      );

      return;
    }

    // ========================================
    // CORRETO
    // ========================================

    if (
      targetRegion ===
      biome.region
    ) {

      this.handleCorrect(
        card,
        biome,
        targetRegion
      );

      return;
    }

    // ========================================
    // ERRADO
    // ========================================

    this.handleWrong(
      card,
      biome
    );
  }

  // ============================================
  // IDENTIFICAR REGIÃO
  // ============================================

  getDropRegion(
    card
  ) {

    for (
      const region
      of REGIONS
    ) {

      const zone =
        this.zones[region];

      if (!zone) {
        continue;
      }

      const bounds =
        zone.getBounds();

      const expanded =
        new Phaser.Geom.Rectangle(
          bounds.x -
            DROP_PADDING,

          bounds.y -
            DROP_PADDING,

          bounds.width +
            DROP_PADDING * 2,

          bounds.height +
            DROP_PADDING * 2
        );

      if (
        expanded.contains(
          card.x,
          card.y
        )
      ) {

        return region;
      }
    }

    return null;
  }

  // ============================================
  // HIGHLIGHT
  // ============================================

  updateZoneHighlight(
    card
  ) {

    const region =
      this.getDropRegion(
        card
      );

    if (
      region ===
      this.highlightedZone
    ) {
      return;
    }

    this.clearZoneHighlight();

    if (!region) {
      return;
    }

    const zone =
      this.zones[region];

    if (!zone) {
      return;
    }

    zone.setFillStyle(
      0xFFF3D6
    );

    zone.setStrokeStyle(
      6,
      0xD89B3C
    );

    this.highlightedZone =
      region;
  }

  // ============================================
  // LIMPAR HIGHLIGHT
  // ============================================

  clearZoneHighlight() {

    if (
      !this.highlightedZone
    ) {
      return;
    }

    const zone =
      this.zones[
        this.highlightedZone
      ];

    if (zone) {

      if (
        zone.getData(
          "completed"
        )
      ) {

        zone.setFillStyle(
          0xE4F5E8
        );

        zone.setStrokeStyle(
          5,
          0x2E7D32
        );

      } else {

        zone.setFillStyle(
          zone.getData(
            "defaultFill"
          )
        );

        zone.setStrokeStyle(
          4,
          zone.getData(
            "defaultStroke"
          )
        );
      }
    }

    this.highlightedZone =
      null;
  }

  // ============================================
  // RESPOSTA CORRETA
  // ============================================

  handleCorrect(
    card,
    biome,
    region
  ) {

    const data =
      this.cards.find(
        item =>
          item.container ===
          card
      );

    if (
      !data ||
      data.completed
    ) {
      return;
    }

    data.completed =
      true;

    card.setData(
      "completed",
      true
    );

    this.answered += 1;

    // Pontuação
    GameState.addScore(
      20
    );

    GameMetrics.addScore(
      2,
      20
    );

    // ========================================
    // ZONA CONCLUÍDA
    // ========================================

    const zone =
      this.zones[region];

    zone.setData(
      "completed",
      true
    );

    zone.setFillStyle(
      0xE4F5E8
    );

    zone.setStrokeStyle(
      5,
      0x2E7D32
    );

    // ========================================
    // ANIMAÇÃO
    // ========================================

    const state =
      GameState.get();

    const reducedMotion =
      state &&
      state.accessibility
        ? state.accessibility.reducedMotion
        : false;

    this.tweens.add({

      targets:
        card,

      x:
        zone.x,

      y:
        zone.y,

      scale:
        0.68,

      duration:
        reducedMotion
          ? 0
          : 350,

      ease:
        "Back.easeOut"
    });

    // ========================================
    // CARD VERDE
    // ========================================

    const background =
      card.getData(
        "background"
      );

    if (background) {

      background.setStrokeStyle(
        4,
        0x2E7D32
      );

      background.setFillStyle(
        0xE4F5E8
      );
    }

    card.disableInteractive();

    // ========================================
    // FEEDBACK
    // ========================================

    this.showFeedback(
      `Muito bem! ${biome.name} fica na região ${region}! ⭐`
    );

    AudioManager.speak(
      `Muito bem! ${biome.name} combina com a região ${region}.`
    );

    // ========================================
    // FINALIZAR
    // ========================================

    if (
      this.answered ===
      BIOMES.length
    ) {

      this.finishing =
        true;

      this.time.delayedCall(
        900,
        () => {

          this.finishPhase();

        }
      );
    }
  }

  // ============================================
  // RESPOSTA ERRADA
  // ============================================

  handleWrong(
    card,
    biome
  ) {

    this.errors += 1;

    GameMetrics.registerError(
      2
    );

    this.returnCard(
      card
    );

    this.showFeedback(
      "Quase! Leia a pista do cartão e tente novamente. 💡"
    );

    AudioManager.speak(
      "Quase! Leia a pista do cartão e tente novamente."
    );
  }

  // ============================================
  // VOLTAR CARD
  // ============================================

  returnCard(
    card
  ) {

    const data =
      this.cards.find(
        item =>
          item.container ===
          card
      );

    if (!data) {
      return;
    }

    const state =
      GameState.get();

    const reducedMotion =
      state &&
      state.accessibility
        ? state.accessibility.reducedMotion
        : false;

    this.tweens.add({

      targets:
        card,

      x:
        data.originalX,

      y:
        data.originalY,

      scale:
        1,

      duration:
        reducedMotion
          ? 0
          : 320,

      ease:
        "Back.easeOut"
    });
  }

  // ============================================
  // DICA
  // ============================================

  showGlobalHint() {

    this.showFeedback(
      "Dica: leia as características de cada paisagem. Elas ajudam você a descobrir a região!"
    );

    AudioManager.speak(
      "Dica: leia as características de cada paisagem. Elas ajudam você a descobrir a região."
    );
  }

  // ============================================
  // FEEDBACK
  // ============================================

  showFeedback(
    text
  ) {

    if (this.feedback) {

      this.feedback.destroy();

      this.feedback =
        null;
    }

    this.feedback =
      this.add
        .text(
          GAME_WIDTH / 2,
          715,
          text,
          {
            fontFamily:
              "Arial",

            fontSize:
              "18px",

            fontStyle:
              "bold",

            color:
              "#31564A",

            backgroundColor:
              "#FFFFFF",

            padding: {
              x: 18,
              y: 10
            },

            align:
              "center",

            wordWrap: {
              width: 950
            }
          }
        )
        .setOrigin(0.5)
        .setDepth(200);

    this.time.delayedCall(
      2600,
      () => {

        if (this.feedback) {

          this.feedback.destroy();

          this.feedback =
            null;
        }
      }
    );
  }

  // ============================================
  // FINALIZAR FASE
  // ============================================

  async finishPhase() {

    if (this.finished) {
      return;
    }

    this.finished = true;

    // ========================================
    // MÉTRICAS
    // ========================================

    GameMetrics.completePhase(
      2,
      GameState.get().score
    );

    // ========================================
    // CONCLUIR FASE
    // ========================================

    GameState.completePhase(
      2
    );

    ProgressManager.save();

    const state =
      GameState.get();

    // ========================================
    // ESTRELAS DA FASE
    // ========================================

    let phaseStars;

    if (
      this.errors === 0
    ) {

      phaseStars = 3;

    } else if (
      this.errors <= 2
    ) {

      phaseStars = 2;

    } else {

      phaseStars = 1;
    }

    // ========================================
    // API
    // ========================================

    try {

      const metrics =
        GameMetrics.get();

      const phaseMetrics =
        metrics &&
        metrics.phases &&
        metrics.phases[2]
          ? metrics.phases[2]
          : {};

      console.log(
        "=========================================="
      );

      console.log(
        "FASE 2 - ENVIANDO RESULTADO"
      );

      console.log({
        playerId:
          state.playerId,

        phase:
          2,

        score:
          state.score,

        stars:
          phaseStars,

        errors:
          this.errors,

        attempts:
          phaseMetrics.attempts ||
          0,

        timeSeconds:
          phaseMetrics.timeSeconds ||
          0,

        completed:
          true
      });

      console.log(
        "=========================================="
      );

      await ApiService.savePhaseResult({

        playerId:
          state.playerId,

        phase:
          2,

        score:
          state.score,

        stars:
          phaseStars,

        errors:
          this.errors,

        attempts:
          phaseMetrics.attempts ||
          0,

        timeSeconds:
          phaseMetrics.timeSeconds ||
          0,

        completed:
          true
      });

      await ApiService.saveProgress({

        playerId:
          state.playerId,

        currentPhase:
          3,

        score:
          state.score,

        stars:
          phaseStars
      });

      console.log(
        "FASE 2: progresso salvo com sucesso."
      );

    } catch (error) {

      console.error(
        "=========================================="
      );

      console.error(
        "ERRO AO SALVAR FASE 2"
      );

      console.error(
        "=========================================="
      );

      console.error(
        "Erro:",
        error
      );

      console.error(
        "Status HTTP:",
        error?.status
      );

      console.error(
        "Resposta da API:",
        error?.payload
      );

      console.error(
        "Mensagem:",
        error?.message
      );

      console.error(
        "=========================================="
      );
    }

    // ========================================
    // VICTORY SCENE
    // ========================================

    this.scene.start(
      "VictoryScene",
      {
        phase:
          2,

        score:
          state.score,

        stars:
          phaseStars
      }
    );
  }
}