/**
 * Bússola, progresso e regras da Fase Bônus.
 * SEM dependência de Phaser/React (reaproveitável na migração).
 */

// Cada fase concluída devolve 1 peça (quadrante) da bússola.
// Cores iguais às de CARDINAL_DIRECTIONS (Fase 1).
export const COMPASS_PARTS = [
  { phase: 1, id: "north", label: "Norte", color: 0xe85d4a, centerAngle: -90 },
  { phase: 2, id: "east",  label: "Leste", color: 0xffb83e, centerAngle: 0 },
  { phase: 3, id: "south", label: "Sul",   color: 0x2e9f65, centerAngle: 90 },
  { phase: 4, id: "west",  label: "Oeste", color: 0x5b8def, centerAngle: 180 }
];

export const TOTAL_PHASES = COMPASS_PARTS.length; // 4

/** Quantas peças estão montadas (0 a 4), a partir das fases concluídas. */
export function getCompassProgress(completedPhases = []) {
  const done = new Set(completedPhases.map(Number));
  return COMPASS_PARTS.filter(part => done.has(part.phase)).length;
}

export function isCompassComplete(completedPhases = []) {
  return getCompassProgress(completedPhases) >= TOTAL_PHASES;
}

/**
 * REGRA DA FASE BÔNUS
 *  - Liberação: ao reconstruir 100% da bússola (4 fases concluídas).
 *    Todas as crianças que terminam o jogo podem jogar o bônus.
 *  - Recompensa por desempenho: o "Selo de Explorador" é sempre dado
 *    ao concluir o bônus; a versão DOURADA exige estrelas mínimas.
 *  Para exigir desempenho na ENTRADA, troque unlockMinStars por um número > 0.
 */
export const BONUS_RULES = {
  unlockMinStars: 0,
  goldSealMinStars: 8,
  completionPoints: 100
};

export function isBonusUnlocked(state = {}) {
  return (
    isCompassComplete(state.completedPhases) &&
    Number(state.stars || 0) >= BONUS_RULES.unlockMinStars
  );
}

export function getBonusSeal(state = {}) {
  return Number(state.stars || 0) >= BONUS_RULES.goldSealMinStars
    ? "gold"
    : "silver";
}