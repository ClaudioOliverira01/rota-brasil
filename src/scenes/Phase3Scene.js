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
      "Qual lugar costuma ter muita chuva e uma floresta bem verde?",
    options: [
      "Amazônia",
      "Pampa",
      "Caatinga"
    ],
    correct: 0
  },

  {
    question:
      "Qual paisagem está mais relacionada a um lugar seco?",
    options: [
      "Caatinga",
      "Amazônia",
      "Mata Atlântica"
    ],
    correct: 0
  },

  {
    question:
      "O clima pode influenciar a vegetação de um lugar?",
    options: [
      "Sim",
      "Não",
      "Nunca"
    ],
    correct: 0
  }
];

export class Phase3Scene extends Phaser.Scene {
  constructor() {
    super("Phase3Scene");

    this.questionIndex = 0;
    this.errors = 0;
    this.finished = false;
    this.answering = false;

    this.optionObjects = [];
    this.questionObjects = [];
  }

  create() {
    GameMetrics.startPhase(3);

    this.drawBackground();
    this.createHeader();
    this.createQuestion();

    AudioManager.speak(
      "Fase 3! Vamos descobrir como o clima influencia as paisagens brasileiras."
    );
  }

  // =========================================================
  // FUNDO
  // =========================================================

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
        0xE8F6FF
      )
      .setOrigin(0);
  }

  // =========================================================
  // CABEÇALHO
  // =========================================================

  createHeader() {
    this.add
      .text(
        GAME_WIDTH / 2,
        55,
        "FASE 3",
        {
          fontFamily: "Arial",
          fontSize: "40px",
          fontStyle: "bold",
          color: "#07543D"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        105,
        "CLIMA E PAISAGENS DO BRASIL",
        {
          fontFamily: "Arial",
          fontSize: "23px",
          fontStyle: "bold",
          color: "#18332C"
        }
      )
      .setOrigin(0.5);
  }

  // =========================================================
  // CRIAÇÃO DA PERGUNTA
  // =========================================================

  createQuestion() {
    // -------------------------------------------------------
    // Remove TODOS os elementos da pergunta anterior
    // -------------------------------------------------------

    this.questionObjects.forEach(
      object => {
        if (object) {
          object.destroy();
        }
      }
    );

    this.questionObjects = [];

    // -------------------------------------------------------
    // Remove os botões anteriores
    // -------------------------------------------------------

    this.optionObjects.forEach(
      object => {
        if (object) {
          object.destroy();
        }
      }
    );

    this.optionObjects = [];

    // -------------------------------------------------------
    // Remove feedback anterior
    // -------------------------------------------------------

    if (this.feedback) {
      this.feedback.destroy();
      this.feedback = null;
    }

    const question =
      QUESTIONS[this.questionIndex];

    // =======================================================
    // INDICADOR DA PERGUNTA
    // =======================================================

    const questionNumber =
      this.add
        .text(
          GAME_WIDTH / 2,
          170,
          `Pergunta ${this.questionIndex + 1} de ${QUESTIONS.length}`,
          {
            fontFamily: "Arial",
            fontSize: "18px",
            fontStyle: "bold",
            color: "#4C8A3A"
          }
        )
        .setOrigin(0.5)
        .setDepth(10);

    this.questionObjects.push(
      questionNumber
    );

    // =======================================================
    // TEXTO DA PERGUNTA
    // =======================================================

    const questionText =
      this.add
        .text(
          GAME_WIDTH / 2,
          235,
          question.question,
          {
            fontFamily: "Arial",
            fontSize: "26px",
            fontStyle: "bold",
            color: "#18332C",
            align: "center",

            wordWrap: {
              width: 820
            },

            lineSpacing: 8
          }
        )
        .setOrigin(0.5)
        .setDepth(10);

    this.questionObjects.push(
      questionText
    );

    // =======================================================
    // BOTÕES
    // =======================================================

    const startY = 375;
    const buttonHeight = 64;
    const buttonSpacing = 82;

    question.options.forEach(
      (option, index) => {
        const y =
          startY +
          index * buttonSpacing;

        const button =
          this.add
            .rectangle(
              GAME_WIDTH / 2,
              y,
              560,
              buttonHeight,
              0xFFFFFF
            )
            .setStrokeStyle(
              4,
              0x4C8A3A
            )
            .setInteractive({
              useHandCursor: true
            })
            .setDepth(20);

        const text =
          this.add
            .text(
              GAME_WIDTH / 2,
              y,
              option,
              {
                fontFamily: "Arial",
                fontSize: "21px",
                fontStyle: "bold",
                color: "#31564A",
                align: "center"
              }
            )
            .setOrigin(0.5)
            .setDepth(21);

        // ---------------------------------------------------
        // Hover
        // ---------------------------------------------------

        button.on(
          "pointerover",
          () => {
            if (
              this.answering ||
              this.finished
            ) {
              return;
            }

            button.setFillStyle(
              0xE4F5E8
            );

            button.setStrokeStyle(
              4,
              0x2E7D32
            );
          }
        );

        button.on(
          "pointerout",
          () => {
            if (
              this.answering ||
              this.finished
            ) {
              return;
            }

            button.setFillStyle(
              0xFFFFFF
            );

            button.setStrokeStyle(
              4,
              0x4C8A3A
            );
          }
        );

        // ---------------------------------------------------
        // Clique
        // ---------------------------------------------------

        button.on(
          "pointerdown",
          () => {
            this.answer(index);
          }
        );

        this.optionObjects.push(
          button,
          text
        );
      }
    );
  }

  // =========================================================
  // RESPOSTA
  // =========================================================

  answer(index) {
    if (
      this.answering ||
      this.finished
    ) {
      return;
    }

    this.answering = true;

    GameMetrics.registerAttempt(
      3
    );

    const question =
      QUESTIONS[this.questionIndex];

    // =======================================================
    // RESPOSTA CORRETA
    // =======================================================

    if (
      index ===
      question.correct
    ) {
      GameState.addScore(
        20
      );

      GameMetrics.addScore(
        3,
        20
      );

      AudioManager.speak(
        "Muito bem! Você acertou."
      );

      this.showFeedback(
        "Muito bem! Você acertou! ⭐",
        true
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

      return;
    }

    // =======================================================
    // RESPOSTA ERRADA
    // =======================================================

    this.errors += 1;

    GameMetrics.registerError(
      3
    );

    AudioManager.speak(
      "Quase! Leia a pergunta novamente e tente outra vez."
    );

    this.showFeedback(
      "Quase! Leia a pergunta novamente e tente outra vez. 💡",
      false
    );

    this.time.delayedCall(
      900,
      () => {
        this.answering =
          false;
      }
    );
  }

  // =========================================================
  // FEEDBACK
  // =========================================================

  showFeedback(
    text,
    correct
  ) {
    if (this.feedback) {
      this.feedback.destroy();
    }

    this.feedback =
      this.add
        .text(
          GAME_WIDTH / 2,
          650,
          text,
          {
            fontFamily: "Arial",
            fontSize: "19px",
            fontStyle: "bold",

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

            align: "center",

            wordWrap: {
              width: 760
            },

            lineSpacing: 4
          }
        )
        .setOrigin(0.5)
        .setDepth(100);
  }

  // =========================================================
  // FINALIZAÇÃO
  // =========================================================

  async finishPhase() {
    if (
      this.finished
    ) {
      return;
    }

    this.finished = true;

    // -------------------------------------------------------
    // Calcula estrelas da Fase 3
    // -------------------------------------------------------

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

    try {
      await ApiService.savePhaseResult(
        {
          playerId:
            state.playerId,

          phase: 3,

          score:
            state.score,

          stars:
            phaseStars,

          errors:
            this.errors,

          attempts:
            GameMetrics.get()
              .phases?.[3]
              ?.attempts || 0,

          timeSeconds:
            GameMetrics.get()
              .phases?.[3]
              ?.timeSeconds || 0,

          completed:
            true
        }
      );

      await ApiService.saveProgress(
        {
          ...state,

          currentPhase:
            4,

          stars:
            phaseStars,

          metrics:
            GameMetrics.get()
        }
      );

      console.log(
        "Fase 3 concluída:",
        {
          score:
            state.score,

          stars:
            phaseStars,

          errors:
            this.errors
        }
      );
    } catch (error) {
      console.warn(
        "Erro ao salvar Fase 3.",
        error
      );
    }

    // -------------------------------------------------------
    // Vai para a tela de vitória
    // -------------------------------------------------------

    this.scene.start(
      "VictoryScene",
      {
        phase: 3,

        score:
          state.score,

        stars:
          phaseStars
      }
    );
  }
}