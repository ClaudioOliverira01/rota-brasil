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
import { AccessibilityManager } from "../systems/AccessibilityManager.js";
import { ReportService } from "../services/ReportService.js";
import { getAvatar } from "../data/gameData.js";
import { isBonusUnlocked } from "../data/compassData.js";

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super("VictoryScene");

    this.pdfButton = null;
    this.pdfLoading = false;
  }

  create(data = {}) {
    const state =
      GameState.get();

    const completedPhases =
      Array.isArray(
        state.completedPhases
      )
        ? state.completedPhases
        : [];

    const phase = Number(
      data.phase ||
      (
        completedPhases.length
          ? Math.max(...completedPhases)
          : 1
      )
    );

    const final =
      Boolean(
        data.final ||
        phase >= 4
      );

    // ENTRETELA: antes da tela de resultados, mostra a bússola sendo montada.
    if (!data.skipCompass && !data.bonus) {
      this.scene.start("CompassTransitionScene", {
        ...data,
        phase,
        final
      });

      return;
    }

    const isBonusResult =
      Boolean(data.bonus);

    const showBonusButton =
      final &&
      !isBonusResult &&
      !state.bonusCompleted &&
      isBonusUnlocked(state);

    const nextPhase =
      Math.min(
        phase + 1,
        4
      );

    const metrics =
      GameMetrics.get();

    const phaseMetrics =
      metrics.phases?.[phase] || {};

    this.drawBackground();

    this.add
      .text(
        640,
        70,
        isBonusResult
          ? "FASE BÔNUS CONCLUÍDA! 🌟"
          : final
            ? "EXPEDIÇÃO CONCLUÍDA! 🎉"
            : `FASE ${phase} CONCLUÍDA! 🎉`,
        {
          fontFamily: "Arial",
          fontSize: "42px",
          fontStyle: "bold",
          color: "#07543d",
          align: "center"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        640,
        150,
        getAvatar(state.avatar).emoji,
        {
          fontFamily: "Arial",
          fontSize: "100px"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        640,
        245,
        final
          ? "Você ajudou Aê a completar toda a expedição!"
          : "Muito bem! Sua aventura está avançando.",
        {
          fontFamily: "Arial",
          fontSize: "23px",
          fontStyle: "bold",
          color: "#18332c",
          align: "center"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        640,
        295,
        `⭐ ${state.stars} estrelas     🏆 ${state.score} pontos`,
        {
          fontFamily: "Arial",
          fontSize: "24px",
          fontStyle: "bold",
          color: "#07543d"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        640,
        335,
        `❌ Erros na Fase ${phase}: ${
          phaseMetrics.errors || 0
        }     ⏱️ Tempo: ${
          GameMetrics.formatTime(
            phaseMetrics.timeSeconds || 0
          )
        }`,
        {
          fontFamily: "Arial",
          fontSize: "18px",
          fontStyle: "bold",
          color: "#31564a"
        }
      )
      .setOrigin(0.5);

    if (final) {
      this.add
        .text(
          640,
          375,
          `⏱️ Tempo total da expedição: ${
            GameMetrics.formatTime(
              metrics.totalTimeSeconds ||
              GameMetrics.getCurrentTime()
            )
          }`,
          {
            fontFamily: "Arial",
            fontSize: "19px",
            fontStyle: "bold",
            color: "#31564a"
          }
        )
        .setOrigin(0.5);
    }

    const primaryY =
      showBonusButton
        ? 494
        : final
          ? 475
          : 450;

    if (showBonusButton) {
      this.createButton(
        640,
        430,
        430,
        56,
        "🌟 JOGAR A FASE BÔNUS",
        COLORS.coral,
        () => {
          this.scene.start("BonusScene");
        }
      );
    }

    this.createButton(
      640,
      primaryY,
      430,
      showBonusButton ? 52 : 60,
      final
        ? "🏆 FINALIZAR JOGO"
        : `➡️ CONTINUAR PARA A FASE ${nextPhase}`,
      COLORS.forest,
      () => {
        if (final) {
          this.finishGame();
        } else {
          this.scene.start(
            `Phase${nextPhase}Scene`
          );
        }
      }
    );

    this.pdfButton =
      this.createButton(
        640,
        primaryY + (showBonusButton ? 62 : 72),
        430,
        52,
        "📄 GERAR RELATÓRIO EM PDF",
        COLORS.orange,
        () => {
          this.downloadPdf();
        }
      );

    this.createButton(
      640,
      primaryY + (showBonusButton ? 124 : 136),
      430,
      52,
      "🏠 VOLTAR AO MENU",
      COLORS.orange,
      () => {
        this.scene.start(
          "MenuScene"
        );
      }
    );

    if (
      AccessibilityManager.isNarrationEnabled()
    ) {
      AudioManager.speak(
        final
          ? `Parabéns! Você terminou toda a expedição com ${state.score} pontos.`
          : `Parabéns! Você concluiu a Fase ${phase}. Agora vamos para a próxima fase.`
      );
    }
  }

  drawBackground() {
    this.cameras.main.setBackgroundColor(
      COLORS.sky
    );

    const g =
      this.add.graphics();

    g.fillStyle(
      COLORS.sky,
      1
    );

    g.fillRect(
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    g.fillStyle(
      COLORS.map,
      1
    );

    g.fillCircle(
      80,
      700,
      230
    );

    g.fillCircle(
      1200,
      700,
      260
    );

    g.fillStyle(
      COLORS.leaf,
      1
    );

    for (
      let i = 0;
      i < 14;
      i += 1
    ) {
      g.fillCircle(
        40 + i * 95,
        700,
        38
      );
    }
  }

  createButton(
    x,
    y,
    width,
    height,
    label,
    color,
    callback
  ) {
    const shadow =
      this.add.rectangle(
        x + 5,
        y + 6,
        width,
        height,
        0x000000,
        0.12
      );

    const button =
      this.add
        .rectangle(
          x,
          y,
          width,
          height,
          color
        )
        .setStrokeStyle(
          3,
          COLORS.white
        )
        .setInteractive({
          useHandCursor: true
        });

    const text =
      this.add
        .text(
          x,
          y,
          label,
          {
            fontFamily: "Arial",
            fontSize:
              height > 58
                ? "20px"
                : "17px",
            fontStyle: "bold",
            color: "#ffffff",
            align: "center"
          }
        )
        .setOrigin(0.5);

    button.on(
      "pointerover",
      () => {
        button.setScale(1.03);
        text.setScale(1.03);
        shadow.setScale(1.03);
      }
    );

    button.on(
      "pointerout",
      () => {
        button.setScale(1);
        text.setScale(1);
        shadow.setScale(1);
      }
    );

    button.on(
      "pointerdown",
      callback
    );

    return {
      button,
      text,
      shadow
    };
  }

  async downloadPdf() {
    if (this.pdfLoading) {
      return;
    }

    const playerId =
      GameState.get().playerId;

    this.pdfLoading = true;

    if (this.pdfButton?.text) {
      this.pdfButton.text.setText(
        "⏳ GERANDO RELATÓRIO..."
      );
    }

    const hasServerPlayer =
      playerId &&
      !String(playerId).startsWith("local-") &&
      !ApiService.isMockEnabled();

    let message =
      "Relatório gerado com sucesso!";

    try {
      if (!hasServerPlayer) {
        // Sem backend / jogador local: gera o PDF aqui no navegador.
        ReportService.exportPerformanceReport();
      } else {
        try {
          await ApiService.downloadPerformancePdf(
            playerId
          );
        } catch (apiError) {
          console.warn(
            "Backend não gerou o PDF. Usando o relatório local.",
            apiError
          );

          ReportService.exportPerformanceReport();

          message =
            "Relatório gerado (versão local).";
        }
      }

      this.showPdfMessage(message);

      if (
        AccessibilityManager.isNarrationEnabled()
      ) {
        AudioManager.speak(
          "Seu relatório de desempenho foi gerado com sucesso."
        );
      }
    } catch (error) {
      console.error(
        "Erro ao gerar relatório PDF:",
        error
      );

      this.showPdfMessage(
        "Não foi possível gerar o relatório agora."
      );
    } finally {
      this.pdfLoading = false;

      if (this.pdfButton?.text) {
        this.pdfButton.text.setText(
          "📄 GERAR RELATÓRIO EM PDF"
        );
      }
    }
  }

  showPdfMessage(message) {
    if (this.pdfMessage) {
      this.pdfMessage.destroy();
    }

    this.pdfMessage =
      this.add
        .text(
          640,
          695,
          message,
          {
            fontFamily: "Arial",
            fontSize: "15px",
            fontStyle: "bold",
            color: "#18332c",
            align: "center",
            wordWrap: {
              width: 800
            }
          }
        )
        .setOrigin(0.5);

    this.time.delayedCall(
      3500,
      () => {
        if (
          this.pdfMessage
        ) {
          this.pdfMessage.destroy();
          this.pdfMessage = null;
        }
      }
    );
  }

  async finishGame() {
    GameMetrics.completeGame();

    const profile =
      ProgressManager.save();

    try {
      await ApiService.saveProgress({
        ...GameState.get(),
        metrics:
          GameMetrics.get()
      });
    } catch (error) {
      console.warn(
        "Não foi possível sincronizar o encerramento.",
        error
      );
    }

    this.scene.start(
      "RankingScene",
      {
        final: true
      }
    );
  }
}