import { jsPDF } from "jspdf";

import { GameState } from "../systems/GameState.js";
import { GameMetrics } from "../systems/GameMetrics.js";

export const ReportService = {
  exportPerformanceReport() {
    const state =
      GameState.get();

    const metrics =
      GameMetrics.get();

    const pdf =
      new jsPDF();

    const nickname =
      state.nickname ||
      "Explorador";

    pdf.setFontSize(20);

    pdf.text(
      "Rota Brasil - Relatório de Desempenho",
      20,
      20
    );

    pdf.setFontSize(12);

    pdf.text(
      `Explorador: ${nickname}`,
      20,
      35
    );

    pdf.text(
      `Pontuação total: ${state.score}`,
      20,
      45
    );

    pdf.text(
      `Estrelas: ${state.stars}`,
      20,
      55
    );

    pdf.text(
      `Fases concluídas: ${
        state.completedPhases.length
      }`,
      20,
      65
    );

    pdf.text(
      `Tempo total: ${
        GameMetrics.formatTime(
          metrics.totalTimeSeconds ||
          GameMetrics.getCurrentTime()
        )
      }`,
      20,
      75
    );

    let y = 95;

    pdf.setFontSize(15);

    pdf.text(
      "Desempenho por fase",
      20,
      y
    );

    y += 15;

    pdf.setFontSize(11);

    const phases =
      Object.entries(
        metrics.phases || {}
      );

    phases.forEach(
      ([phase, data]) => {
        pdf.text(
          `Fase ${phase}`,
          20,
          y
        );

        pdf.text(
          `Tentativas: ${
            data.attempts || 0
          }`,
          30,
          y + 10
        );

        pdf.text(
          `Erros: ${
            data.errors || 0
          }`,
          30,
          y + 20
        );

        pdf.text(
          `Pontuação: ${
            data.score || 0
          }`,
          30,
          y + 30
        );

        pdf.text(
          `Tempo: ${
            GameMetrics.formatTime(
              data.timeSeconds || 0
            )
          }`,
          30,
          y + 40
        );

        y += 58;

        if (y > 260) {
          pdf.addPage();
          y = 25;
        }
      }
    );

    pdf.setFontSize(12);

    pdf.text(
      "Rota Brasil - A Expedição de Aê",
      20,
      285
    );

    const safeName =
      nickname
        .replace(
          /[^a-zA-Z0-9À-ÿ_-]/g,
          "_"
        );

    pdf.save(
      `relatorio-rota-brasil-${safeName}.pdf`
    );
  }
};