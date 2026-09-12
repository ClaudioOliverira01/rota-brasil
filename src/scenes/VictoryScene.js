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

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super("VictoryScene");
  }

  create(data = {}) {
    const state =
      GameState.get();

    const phase =
      Number(
        data.phase ||
          Math.max(
            ...state.completedPhases,
            1
          )
      );

    const isFinal =
      phase >= 4;

    const nextPhase =
      Math.min(
        phase + 1,
        4
      );

    if (isFinal) {
      GameMetrics.completeGame();
    }

    const metrics =
      GameMetrics.get();

    const phaseMetrics =
      metrics.phases?.[
        phase
      ] || {};

    this.cameras.main.setBackgroundColor(
      COLORS.sky
    );

    this.add
      .text(
        GAME_WIDTH / 2,
        80,
        isFinal
          ? "EXPEDIÇÃO CONCLUÍDA! 🎉"
          : `FASE ${phase} CONCLUÍDA! 🎉`,
        {
          fontFamily:
            "Arial",
          fontSize:
            "44px",
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
        175,
        "🦜",
        {
          fontFamily:
            "Arial",
          fontSize:
            "110px"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        275,
        isFinal
          ? "Você ajudou Aê a completar toda a expedição!"
          : `Muito bem! Você completou a Fase ${phase}.`,
        {
          fontFamily:
            "Arial",
          fontSize:
            "24px",
          fontStyle:
            "bold",
          color:
            "#18332C",
          align:
            "center"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        345,
        `⭐ ${state.stars} estrelas    |    🏆 ${state.score} pontos`,
        {
          fontFamily:
            "Arial",
          fontSize:
            "24px",
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
        390,
        `❌ Erros nesta fase: ${
          phaseMetrics.errors || 0
        }`,
        {
          fontFamily:
            "Arial",
          fontSize:
            "20px",
          color:
            "#9A3F28"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        425,
        `⏱️ Tempo da fase: ${GameMetrics.formatTime(
          phaseMetrics.timeSeconds || 0
        )}`,
        {
          fontFamily:
            "Arial",
          fontSize:
            "20px",
          color:
            "#31564A"
        }
      )
      .setOrigin(0.5);

    if (isFinal) {
      this.add
        .text(
          GAME_WIDTH / 2,
          460,
          `⏱️ Tempo total: ${GameMetrics.formatTime(
            metrics.totalTimeSeconds
          )}`,
          {
            fontFamily:
              "Arial",
            fontSize:
              "21px",
            fontStyle:
              "bold",
            color:
              "#07543D"
          }
        )
        .setOrigin(0.5);
    }

    const continueButton =
      this.add
        .rectangle(
          GAME_WIDTH / 2,
          isFinal
            ? 535
            : 500,
          420,
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

    this.add
      .text(
        GAME_WIDTH / 2,
        isFinal
          ? 535
          : 500,
        isFinal
          ? "🏆 FINALIZAR JOGO"
          : `CONTINUAR PARA A FASE ${nextPhase} →`,
        {
          fontFamily:
            "Arial",
          fontSize:
            "20px",
          fontStyle:
            "bold",
          color:
            "#FFFFFF",
          align:
            "center"
        }
      )
      .setOrigin(0.5);

    const menuButton =
      this.add
        .rectangle(
          GAME_WIDTH / 2,
          isFinal
            ? 615
            : 575,
          360,
          55,
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
        GAME_WIDTH / 2,
        isFinal
          ? 615
          : 575,
        "🏠 VOLTAR AO MENU",
        {
          fontFamily:
            "Arial",
          fontSize:
            "19px",
          fontStyle:
            "bold",
          color:
            "#FFFFFF"
        }
      )
      .setOrigin(0.5);

    continueButton.on(
      "pointerdown",
      async () => {
        if (isFinal) {
          await this.finishGame();
        } else {
          this.scene.start(
            `Phase${nextPhase}Scene`
          );
        }
      }
    );

    menuButton.on(
      "pointerdown",
      () =>
        this.scene.start(
          "MenuScene"
        )
    );

    AudioManager.speak(
      isFinal
        ? `Parabéns! Você completou toda a expedição com ${state.score} pontos.`
        : `Muito bem! Você concluiu a Fase ${phase}. Agora vamos para a próxima fase.`
    );
  }

  async finishGame() {
    GameMetrics.completeGame();

    const state =
      GameState.get();

    ProgressManager.save();

    try {
      await ApiService.saveProgress(
        {
          ...state,
          metrics:
            GameMetrics.get()
        }
      );
    } catch (error) {
      console.warn(
        "Não foi possível sincronizar o resultado final.",
        error
      );
    }

    this.scene.start(
      "RankingScene"
    );
  }
}