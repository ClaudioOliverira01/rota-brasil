import { ApiService } from "./ApiService.js";
import { GameState } from "../systems/GameState.js";
import { GameMetrics } from "../systems/GameMetrics.js";
import { ProgressManager } from "../systems/ProgressManager.js";
import { BONUS_RULES, getBonusSeal } from "../data/compassData.js";
import { BONUS_PHASE_KEY } from "../data/bonusData.js";

/**
 * Sessão de uma fase: tempo, tentativas, erros, pontos, estrelas e
 * gravação do progresso. É o que TODAS as fases (e o bônus) têm em comum.
 *
 * Arquivo SEM React: as telas de jogo só chamam estas funções.
 *
 * Uso típico de uma fase:
 *   startPhase(2);                 // ao abrir a fase
 *   recordAttempt(2);              // a cada tentativa de resposta
 *   recordError(2);                // quando erra
 *   awardCorrect(2, 20);           // quando acerta (+pontos e +estrela)
 *   const victory = await completePhase(2);   // ao terminar
 */

export const FINAL_PHASE = 4;

const EMPTY_STATS = Object.freeze({
  errors: 0,
  attempts: 0,
  timeSeconds: 0,
  score: 0
});

/**
 * Jogadores criados sem conexão (id "local-...") não existem no servidor.
 */
function canSyncWithServer() {
  const playerId = GameState.get().playerId;

  return (
    Boolean(playerId) &&
    !String(playerId).startsWith("local-") &&
    !ApiService.isMockEnabled()
  );
}

async function syncProgress() {
  if (!canSyncWithServer()) {
    return;
  }

  try {
    await ApiService.saveProgress({ playerId: GameState.get().playerId });
  } catch (error) {
    console.warn("Não foi possível sincronizar o progresso.", error);
  }
}

/** Contadores desta fase (erros, tentativas, tempo e pontos DELA). */
export function getPhaseStats(phase) {
  return GameMetrics.get().phases?.[phase] || EMPTY_STATS;
}

/** Cada vez que a fase abre é uma partida nova: os contadores zeram. */
export function startPhase(phase) {
  GameMetrics.startPhase(phase);
}

export function recordAttempt(phase) {
  GameMetrics.registerAttempt(phase);
}

export function recordError(phase) {
  GameMetrics.registerError(phase);
}

/**
 * Acerto: soma pontos e (por padrão) uma estrela ao jogo e aos
 * contadores da fase, e salva no aparelho.
 */
export function awardCorrect(phase, points, { star = true } = {}) {
  GameState.addScore(points);

  if (star) {
    GameState.addStar();
  }

  GameMetrics.addScore(phase, points);
  ProgressManager.save();
}

/**
 * Encerra uma fase (1 a 4): fecha as métricas, marca a fase como concluída
 * (é isso que monta a peça da bússola), salva e envia o resultado ao
 * servidor. Se o servidor falhar, o jogo continua normalmente.
 *
 * Devolve { phase, final } para a tela de bússola e vitória.
 */
export async function completePhase(phase) {
  // Pontos DESTA fase (e não o total do jogo)
  const earned = Number(getPhaseStats(phase).score) || 0;

  GameMetrics.completePhase(phase, earned);
  GameState.completePhase(phase);
  ProgressManager.save();

  if (canSyncWithServer()) {
    const stats = getPhaseStats(phase);

    try {
      await ApiService.savePhaseResult({
        playerId: GameState.get().playerId,
        phase,
        score: earned,
        // 0 erros = 3 estrelas, até 2 erros = 2, mais que isso = 1
        stars: GameMetrics.starsForErrors(stats.errors),
        completed: true,
        errors: stats.errors,
        attempts: stats.attempts,
        timeSeconds: stats.timeSeconds
      });
    } catch (error) {
      console.warn("Não foi possível salvar o resultado da fase.", error);
    }

    await syncProgress();
  }

  return { phase, final: phase >= FINAL_PHASE };
}

/**
 * Encerra o desafio bônus: dá os pontos de conclusão, define o selo
 * (dourado ou prateado, conforme as estrelas) e salva.
 * Devolve o selo: "gold" ou "silver".
 */
export async function completeBonus() {
  const seal = getBonusSeal(GameState.get());

  GameState.addScore(BONUS_RULES.completionPoints);
  GameMetrics.addScore(BONUS_PHASE_KEY, BONUS_RULES.completionPoints);
  GameMetrics.completePhase(
    BONUS_PHASE_KEY,
    getPhaseStats(BONUS_PHASE_KEY).score
  );

  GameState.completeBonus(seal);
  ProgressManager.save();

  await syncProgress();

  return seal;
}