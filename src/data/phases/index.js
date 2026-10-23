import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";

/**
 * Fases jogadas na tela React (motor DragMatch), pelo número da fase.
 * Para migrar outra fase, crie o arquivo de dados e registre aqui.
 */
export const PHASE_CONFIGS = Object.freeze({
  1: phase1,
  2: phase2,
  3: phase3,
  4: phase4
});