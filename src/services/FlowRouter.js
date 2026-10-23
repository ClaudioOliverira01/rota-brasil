import { PHASE_CONFIGS } from "../data/phases/index.js";

/**
 * Decide QUAL tela abre para cada destino do fluxo do jogo.
 * Arquivo SEM React.
 */

/** Fases jogadas em React: todas (1 a 4). */
export const REACT_PHASES = Object.freeze(
  Object.keys(PHASE_CONFIGS).map(Number)
);

/**
 * entryScene é o nome que o resto do jogo usa ("StoryScene", "Phase3Scene"...).
 * Devolve a "view" do App: a história ou uma fase. Todo o jogo já é React;
 * um nome desconhecido volta para a história (nunca para uma tela vazia).
 */
export function viewForEntry(entryScene) {
  const match = /^Phase(\d)Scene$/.exec(String(entryScene));
  const phase = match ? Number(match[1]) : null;

  if (phase && REACT_PHASES.includes(phase)) {
    return { name: "phase", phase };
  }

  return { name: "story" };
}

/** Fim de fase: o bônus vai direto para a vitória; as fases passam pela bússola. */
export function viewForVictory(info) {
  return info.bonus
    ? { name: "victory", info }
    : { name: "compass", info };
}