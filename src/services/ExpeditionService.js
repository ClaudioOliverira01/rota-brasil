import { ApiService } from "./ApiService.js";
import { ReportService } from "./ReportService.js";
import { GameState } from "../systems/GameState.js";
import { GameMetrics } from "../systems/GameMetrics.js";
import { ProgressManager } from "../systems/ProgressManager.js";

/**
 * Regras do fim de fase e do fim da expedição.
 * Arquivo SEM React: as telas de Bússola e Vitória só chamam estas funções.
 */

export const REPORT_SOURCE = Object.freeze({
  SERVER: "server",
  LOCAL: "local",
  LOCAL_FALLBACK: "local-fallback"
});

/**
 * Interpreta os dados que a fase mandou ao terminar.
 *  phase:     fase concluída (se não vier, usa a maior já concluída)
 *  final:     última fase (4) ou bônus
 *  bonus:     veio do desafio bônus
 *  nextPhase: fase seguinte (limitada a 4)
 */
export function describeVictory(data = {}) {
  const completed = GameState.get().completedPhases;

  const phase = Number(
    data.phase || (completed.length ? Math.max(...completed) : 1)
  );

  return {
    phase,
    final: Boolean(data.final || phase >= 4),
    bonus: Boolean(data.bonus),
    nextPhase: Math.min(phase + 1, 4)
  };
}

/**
 * Gera e baixa o relatório em PDF.
 * Com servidor: baixa o PDF do servidor. Sem servidor (ou se ele falhar):
 * gera o relatório aqui no navegador, então o botão sempre funciona.
 */
export async function downloadReport() {
  const playerId = GameState.get().playerId;

  const hasServerPlayer =
    Boolean(playerId) &&
    !String(playerId).startsWith("local-") &&
    !ApiService.isMockEnabled();

  if (!hasServerPlayer) {
    ReportService.exportPerformanceReport();

    return REPORT_SOURCE.LOCAL;
  }

  try {
    await ApiService.downloadPerformancePdf(playerId);

    return REPORT_SOURCE.SERVER;
  } catch (error) {
    console.warn("Backend não gerou o PDF. Usando o relatório local.", error);

    ReportService.exportPerformanceReport();

    return REPORT_SOURCE.LOCAL_FALLBACK;
  }
}

/**
 * "FINALIZAR JOGO": encerra a contagem de tempo, salva no aparelho e
 * tenta sincronizar com o servidor (se falhar, o jogo continua).
 */
export async function finishExpedition() {
  GameMetrics.completeGame();
  ProgressManager.save();

  try {
    await ApiService.saveProgress({ playerId: GameState.get().playerId });
  } catch (error) {
    console.warn("Não foi possível sincronizar o encerramento.", error);
  }
}