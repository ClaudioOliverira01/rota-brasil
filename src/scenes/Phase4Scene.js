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

const QUESTIONS = [
  {
    question:
      "Qual atitude ajuda a proteger os rios?",

    options: [
      "Jogar lixo no rio",
      "Não jogar lixo na água",
      "Despejar óleo na água"
    ],

    correct: 1
  },

  {
    question:
      "O que podemos fazer para cuidar das florestas?",

    options: [
      "Evitar queimadas",
      "Colocar fogo",
      "Derrubar todas as árvores"
    ],

    correct: 0
  },

  {
    question:
      "Separar materiais recicláveis ajuda o meio ambiente?",

    options: [
      "Sim",
      "Não",
      "Nunca"
    ],

    correct: 0
  }
];

export class Phase4Scene extends Phaser.Scene {
  constructor() {
    super("Phase4Scene");

    this.questionIndex = 0;
    this.errors = 0;
    this.finished = false;
  }

  create() {
    GameMetrics.startPhase(4);

    this.drawBackground();

    this.add
      .text(
        GAME_WIDTH / 2,
        70,
        "FASE 4",
        {
          fontFamily:
            "Arial",
          fontSize:
            "42px",
          fontStyle:
            "bold",
          color:
            "#07543D"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        120,
        "BIOMAS E SUSTENTABILIDADE",
        {
          fontFamily:
            "Arial",
          fontSize:
            "24px",
          fontStyle:
            "bold",
          color:
            "#18332C"
        }
      )
      .setOrigin(0.5);

    this.createQuestion();

    AudioManager.speak(
      "Fase 4! Agora vamos aprender como cuidar da natureza e dos biomas brasileiros."
    );
  }

  drawBackground() {
    this.cameras.main.setBackgroundColor(
      COLORS.sky
    );

    this.add
      .rectangle(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT,
        0xE8F7E8
      )
      .setOrigin(0);
  }

  createQuestion() {
    this.optionObjects?.forEach(
      object =>
        object.destroy()
    );

    this.optionObjects =
      [];

    const question =
      QUESTIONS[
        this.questionIndex
      ];

    this.add
      .text(
        GAME_WIDTH / 2,
        205,
        `Pergunta ${
          this.questionIndex + 1
        } de ${
          QUESTIONS.length
        }`,
        {
          fontFamily:
            "Arial",
          fontSize:
            "18px",
          fontStyle:
            "bold",
          color:
            "#4C8A3A"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        275,
        question.question,
        {
          fontFamily:
            "Arial",
          fontSize:
            "27px",
          fontStyle:
            "bold",
          color:
            "#18332C",
          align:
            "center",
          wordWrap: {
            width: 850
          }
        }
      )
      .setOrigin(0.5);

    question.options.forEach(
      (
        option,
        index
      ) => {
        const y =
          385 +
          index * 85;

        const button =
          this.add
            .rectangle(
              GAME_WIDTH / 2,
              y,
              560,
              62,
              0xFFFFFF
            )
            .setStrokeStyle(
              4,
              0x4C8A3A
            )
            .setInteractive({
              useHandCursor: true
            });

        const text =
          this.add
            .text(
              GAME_WIDTH / 2,
              y,
              option,
              {
                fontFamily:
                  "Arial",
                fontSize:
                  "21px",
                fontStyle:
                  "bold",
                color:
                  "#31564A"
              }
            )
            .setOrigin(0.5);

        button.on(
          "pointerover",
          () =>
            button.setFillStyle(
              0xE4F5E8
            )
        );

        button.on(
          "pointerout",
          () =>
            button.setFillStyle(
              0xFFFFFF
            )
        );

        button.on(
          "pointerdown",
          () =>
            this.answer(
              index
            )
        );

        this.optionObjects.push(
          button,
          text
        );
      }
    );
  }

  answer(index) {
    if (this.answering) {
      return;
    }

    this.answering =
      true;

    GameMetrics.registerAttempt(
      4
    );

    const question =
      QUESTIONS[
        this.questionIndex
      ];

    if (
      index ===
      question.correct
    ) {
      GameState.addScore(
        20
      );

      GameState.addStar();

      GameMetrics.addScore(
        4,
        20
      );

      this.showFeedback(
        "Muito bem! Essa atitude ajuda o meio ambiente. ⭐",
        true
      );

      AudioManager.speak(
        "Muito bem! Essa atitude ajuda o meio ambiente."
      );

      this.time.delayedCall(
        900,
        () => {
          this.questionIndex +=
            1;

          this.answering =
            false;

          if (
            this.questionIndex >=
            QUESTIONS.length
          ) {
            this.finishPhase();
          } else {
            this.createQuestion();
          }
        }
      );
    } else {
      this.errors +=
        1;

      GameMetrics.registerError(
        4
      );

      this.showFeedback(
        "Quase! Pense em uma atitude que proteja a natureza. 💡",
        false
      );

      AudioManager.speak(
        "Quase! Pense em uma atitude que proteja a natureza."
      );

      this.time.delayedCall(
        900,
        () => {
          this.answering =
            false;
        }
      );
    }
  }

  showFeedback(
    text,
    correct
  ) {
    this.feedback?.destroy();

    this.feedback =
      this.add
        .text(
          GAME_WIDTH / 2,
          680,
          text,
          {
            fontFamily:
              "Arial",
            fontSize:
              "20px",
            fontStyle:
              "bold",
            color:
              correct
                ? "#2E7D32"
                : "#9A3F28",
            backgroundColor:
              "#FFFFFF",
            padding: {
              x: 18,
              y: 10
            },
            align:
              "center"
          }
        )
        .setOrigin(0.5);
  }

  async finishPhase() {
    if (
      this.finished
    ) {
      return;
    }

    this.finished =
      true;

    GameMetrics.completePhase(
      4,
      GameState.get().score
    );

    GameState.completePhase(
      4
    );

    ProgressManager.save();

    const state =
      GameState.get();

    try {
      await ApiService.savePhaseResult(
        {
          playerId:
            state.playerId,
          phase: 4,
          score:
            state.score,
          stars:
            state.stars,
          errors:
            this.errors,
          attempts:
            GameMetrics.get()
              .phases?.[4]
              ?.attempts || 0,
          timeSeconds:
            GameMetrics.get()
              .phases?.[4]
              ?.timeSeconds || 0,
          completed:
            true
        }
      );

      await ApiService.saveProgress(
        {
          ...state,
          metrics:
            GameMetrics.get()
        }
      );
    } catch (error) {
      console.warn(
        "Erro ao salvar Fase 4.",
        error
      );
    }

    this.scene.start(
      "VictoryScene",
      {
        phase: 4
      }
    );
  }
}