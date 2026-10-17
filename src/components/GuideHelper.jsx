import { useCallback, useEffect, useRef, useState } from "react";

import { getAvatar } from "../data/gameData.js";
import { GUIDE_CONFIG, GUIDE_TIPS } from "../data/guideData.js";
import { AudioManager } from "../systems/AudioManager.js";
import { GameState } from "../systems/GameState.js";

function sideFor(phaseId, position) {
  if (position === "left" || position === "right") {
    return position;
  }

  const configured =
    GUIDE_CONFIG.positionByPhase?.[phaseId] || GUIDE_CONFIG.position;

  return configured === "bottom-right" ? "right" : "left";
}

/**
 * Personagem guia: fica fixo num canto da tela, com um balão de dica.
 *  - Tocar no personagem mostra a próxima dica (e lê em voz alta).
 *  - O balão se recolhe sozinho para não atrapalhar o jogo; tocar de novo
 *    reabre a dica atual.
 *
 *  phaseId   1 a 4 = fases, 5 = bônus (as dicas vêm de data/guideData.js)
 *  position  "left" | "right" (padrão: o que estiver em guideData.js)
 */
export default function GuideHelper({ phaseId, position }) {
  const tips = GUIDE_TIPS[phaseId] || GUIDE_TIPS[1];
  const side = sideFor(phaseId, position);
  const avatar = getAvatar(GameState.get().avatar);

  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(true);
  const hideTimer = useRef(null);

  const scheduleHide = useCallback(() => {
    window.clearTimeout(hideTimer.current);

    hideTimer.current = window.setTimeout(
      () => setOpen(false),
      GUIDE_CONFIG.bubbleSeconds * 1000
    );
  }, []);

  useEffect(() => {
    scheduleHide();

    return () => window.clearTimeout(hideTimer.current);
  }, [scheduleHide]);

  function handleClick() {
    // Balão fechado: reabre a dica atual. Aberto: avança para a próxima.
    const next = open ? (index + 1) % tips.length : index;

    setIndex(next);
    setOpen(true);
    scheduleHide();

    AudioManager.speak(tips[next]);
  }

  return (
    <aside className={`guide guide--${side}`} aria-label="Dicas do guia">
      <p className="guide__bubble" role="status" hidden={!open}>
        {tips[index]}
      </p>

      <button
        type="button"
        className="guide__button"
        aria-label={`Pedir uma dica para ${avatar.name}`}
        onClick={handleClick}
      >
        <span className="guide__emoji" aria-hidden="true">
          {avatar.emoji}
        </span>
        <span
          className={open ? "guide__badge" : "guide__badge guide__badge--pulse"}
          aria-hidden="true"
        >
          ?
        </span>
      </button>
    </aside>
  );
}