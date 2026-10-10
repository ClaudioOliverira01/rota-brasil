import { GameState } from "../systems/GameState.js";
import { GameMetrics } from "../systems/GameMetrics.js";

/**
 * Monta o "retrato" completo do progresso do jogador, no formato que
 * o backend espera em POST /api/progress.
 *
 * Por que existe: antes, cada fase enviava só um pedaço do progresso
 * (por exemplo, só as estrelas daquela fase) e o servidor acabava com
 * dados incompletos. Agora TODA gravação sai daqui, sempre completa,
 * a partir do estado real do jogo.
 */
export function buildProgressSnapshot() {
  const state = GameState.get();
  const metrics = GameMetrics.get();

  return {
    playerId: state.playerId,
    nickname: state.nickname,
    avatar: state.avatar,
    currentPhase: state.currentPhase,
    score: state.score,
    stars: state.stars,
    completedPhases: [...(state.completedPhases || [])],
    accessibility: { ...(state.accessibility || {}) },
    metrics: {
      gameStartedAt: metrics.gameStartedAt,
      gameCompletedAt: metrics.gameCompletedAt,
      totalTimeSeconds: Math.max(
        Number(metrics.totalTimeSeconds || 0),
        Number(GameMetrics.getCurrentTime?.() || 0)
      )
    }
  };
}