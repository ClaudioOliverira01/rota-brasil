import { SimplePdf } from "./SimplePdf.js";
import { GameState } from "../systems/GameState.js";
import { GameMetrics } from "../systems/GameMetrics.js";
import { PHASES } from "../data/gameData.js";
import { COMPASS_PARTS, getCompassProgress } from "../data/compassData.js";

/**
 * Relatório de desempenho gerado no próprio navegador.
 * É o "plano B" do botão de PDF: funciona sem backend, sem internet
 * e sem biblioteca externa.
 */

export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function buildReportPdf() {
  const state = GameState.get();
  const metrics = GameMetrics.get();
  const nickname = state.nickname || "Explorador";
  const phasesMetrics = metrics.phases || {};

  const pdf = new SimplePdf();
  const green = [7, 84, 61];
  const ink = [24, 51, 44];
  const muted = [93, 117, 110];

  pdf.rect(0, 0, pdf.width, 90, green);
  pdf.text("Rota Brasil - Relatório de Desempenho", 40, 45, { size: 22, bold: true, color: [255, 255, 255] });
  pdf.text("A Expedição de Aê", 40, 68, { size: 13, color: [255, 255, 255] });

  let y = 125;
  const line = (label, value) => {
    pdf.text(label, 40, y, { size: 12, bold: true, color: ink });
    pdf.text(String(value), 210, y, { size: 12, color: ink });
    y += 22;
  };

  line("Explorador(a):", nickname);
  line("Pontuação total:", state.score ?? 0);
  line("Estrelas:", state.stars ?? 0);
  line("Fases concluídas:", `${(state.completedPhases || []).length} de 4`);
  line("Bússola reconstruída:", `${getCompassProgress(state.completedPhases)} de ${COMPASS_PARTS.length} peças`);
  line("Fase bônus:", state.bonusCompleted
    ? `Concluída (selo ${state.bonusSeal === "gold" ? "dourado" : "prateado"})`
    : "Ainda não concluída");
  line("Tempo total:", GameMetrics.formatTime(metrics.totalTimeSeconds || GameMetrics.getCurrentTime()));

  y += 14;
  pdf.text("Desempenho por fase", 40, y, { size: 16, bold: true, color: green });
  y += 10;

  PHASES.forEach(phase => {
    const data = phasesMetrics[phase.id] || {};
    const done = (state.completedPhases || []).includes(phase.id);

    if (y > 720) {
      pdf.addPage();
      y = 50;
    }

    y += 18;
    pdf.rect(40, y - 14, 515, 70, [238, 248, 243]);
    pdf.text(`Fase ${phase.id} - ${phase.title}`, 50, y, { size: 12, bold: true, color: ink });
    pdf.text(done ? "Concluída" : "Não concluída", 470, y, { size: 11, bold: true, color: done ? [31, 148, 89] : [214, 60, 60] });
    pdf.text(`Habilidade BNCC: ${phase.skill}`, 50, y + 16, { size: 10, color: muted });
    pdf.text(
      `Tentativas: ${data.attempts || 0}    Erros: ${data.errors || 0}    Pontos: ${data.score || 0}    Tempo: ${GameMetrics.formatTime(data.timeSeconds || 0)}`,
      50, y + 34, { size: 11, color: ink }
    );
    y += 62;
  });

  pdf.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")} - Rota Brasil: A Expedição de Aê`, 40, 810, { size: 9, color: muted });
  return pdf;
}

export const ReportService = {
  exportPerformanceReport() {
    const nickname = GameState.get().nickname || "Explorador";
    const safe = nickname.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    triggerDownload(buildReportPdf().toBlob(), `relatorio-rota-brasil-${safe}.pdf`);
    return true;
  }
};