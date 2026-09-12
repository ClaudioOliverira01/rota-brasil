import Phaser from "phaser";

import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH
} from "../config/gameConfig.js";

import { ApiService } from "../services/ApiService.js";
import { GameMetrics } from "../systems/GameMetrics.js";
import { AudioManager } from "../systems/AudioManager.js";

export class RankingScene extends Phaser.Scene {
  constructor() {
    super("RankingScene");
  }

  async create() {
    this.drawBackground();

    this.add
      .text(
        GAME_WIDTH / 2,
        65,
        "🏆 RANKING DOS EXPLORADORES",
        {
          fontFamily:
            "Arial",
          fontSize:
            "36px",
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
        115,
        "Veja quem já participou da expedição!",
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

    this.add
      .text(
        390,
        175,
        "EXPLORADORES",
        {
          fontFamily:
            "Arial",
          fontSize:
            "22px",
          fontStyle:
            "bold",
          color:
            "#07543D"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        900,
        175,
        "FASES COM MAIS ERROS",
        {
          fontFamily:
            "Arial",
          fontSize:
            "22px",
          fontStyle:
            "bold",
          color:
            "#07543D"
        }
      )
      .setOrigin(0.5);

    try {
      const ranking =
        await ApiService.getRanking(
          8
        );

      const stats =
        await ApiService.getPhaseStats();

      this.showRanking(
        ranking
      );

      this.showStats(
        stats
      );
    } catch (error) {
      console.warn(
        error
      );

      this.add
        .text(
          GAME_WIDTH / 2,
          300,
          "Não foi possível carregar o ranking agora.",
          {
            fontFamily:
              "Arial",
            fontSize:
              "21px",
            color:
              "#9A3F28"
          }
        )
        .setOrigin(0.5);
    }

    this.createBackButton();

    AudioManager.speak(
      "Aqui está o ranking dos exploradores e as fases que tiveram mais erros."
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
        0xF4F8E8
      )
      .setOrigin(0);
  }

  showRanking(data) {
    const ranking =
      Array.isArray(data)
        ? data
        : data?.ranking ||
          [];

    if (!ranking.length) {
      this.add
        .text(
          390,
          250,
          "Ainda não há jogadores.",
          {
            fontFamily:
              "Arial",
            fontSize:
              "20px",
            color:
              "#555555"
          }
        )
        .setOrigin(0.5);

      return;
    }

    ranking.forEach(
      (
        player,
        index
      ) => {
        const y =
          220 +
          index * 45;

        this.add
          .text(
            180,
            y,
            `${index + 1}º`,
            {
              fontFamily:
                "Arial",
              fontSize:
                "20px",
              fontStyle:
                "bold",
              color:
                "#07543D"
            }
          )
          .setOrigin(0.5);

        this.add
          .text(
            270,
            y,
            player.nickname ||
              "Explorador",
            {
              fontFamily:
                "Arial",
              fontSize:
                "19px",
              fontStyle:
                "bold",
              color:
                "#18332C"
            }
          )
          .setOrigin(0, 0.5);

        this.add
          .text(
            610,
            y,
            `⭐ ${
              player.stars || 0
            }`,
            {
              fontFamily:
                "Arial",
              fontSize:
                "18px",
              color:
                "#31564A"
            }
          )
          .setOrigin(0.5);

        this.add
          .text(
            690,
            y,
            `🏆 ${
              player.score || 0
            }`,
            {
              fontFamily:
                "Arial",
              fontSize:
                "18px",
                color:
                "#31564A"
            }
          )
          .setOrigin(0.5);
      }
    );
  }

  showStats(data) {
    const phases =
      data?.phases ||
      [];

    if (!phases.length) {
      this.add
        .text(
          900,
          250,
          "Ainda não há estatísticas.",
          {
            fontFamily:
              "Arial",
            fontSize:
              "19px",
            color:
              "#555555"
          }
        )
        .setOrigin(0.5);

      return;
    }

    phases.forEach(
      (
        phase,
        index
      ) => {
        const y =
          220 +
          index * 70;

        this.add
          .text(
            730,
            y,
            `FASE ${
              phase.phase
            }`,
            {
              fontFamily:
                "Arial",
              fontSize:
                "19px",
              fontStyle:
                "bold",
              color:
                "#18332C"
            }
          );

        this.add
          .text(
            900,
            y,
            `❌ ${
              phase.totalErrors ||
              0
            } erros`,
            {
              fontFamily:
                "Arial",
              fontSize:
                "18px",
              color:
                "#9A3F28"
            }
          );

        this.add
          .text(
            1060,
            y,
            `🎯 ${
              phase.totalAttempts ||
              0
            } tentativas`,
            {
              fontFamily:
                "Arial",
              fontSize:
                "16px",
              color:
                "#31564A"
            }
          );
      }
    );

    const most =
      data?.phaseWithMostErrors;

    if (most) {
      this.add
        .text(
          900,
          590,
          `📊 Fase com mais erros: Fase ${most.phase}`,
          {
            fontFamily:
              "Arial",
            fontSize:
              "20px",
            fontStyle:
              "bold",
            color:
              "#9A3F28",
            align:
              "center"
          }
        )
        .setOrigin(0.5);
    }
  }

  createBackButton() {
    const button =
      this.add
        .rectangle(
          GAME_WIDTH / 2,
          670,
          300,
          55,
          COLORS.forest
        )
        .setInteractive({
          useHandCursor: true
        });

    this.add
      .text(
        GAME_WIDTH / 2,
        670,
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

    button.on(
      "pointerdown",
      () =>
        this.scene.start(
          "MenuScene"
        )
    );
  }
}