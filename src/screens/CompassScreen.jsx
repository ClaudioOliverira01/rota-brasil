import { useEffect, useRef } from "react";

import Backdrop from "../components/Backdrop.jsx";
import Button from "../components/Button.jsx";
import CompassDial from "../components/CompassDial.jsx";
import {
  COMPASS_PARTS,
  TOTAL_PHASES,
  getCompassProgress,
  isBonusUnlocked,
  isCompassComplete
} from "../data/compassData.js";
import { getAvatar } from "../data/gameData.js";
import { AudioManager } from "../systems/AudioManager.js";
import { GameState } from "../systems/GameState.js";

const toHex = color => `#${color.toString(16).padStart(6, "0")}`;

/**
 * Entretela entre as fases: mostra a bússola sendo reconstruída
 * (1/4, 2/4, 3/4 e, na Fase 4, 100%).
 *
 *  phase       fase que acabou de ser concluída
 *  onContinue  segue para a tela de vitória
 */
export default function CompassScreen({ phase, onContinue }) {
  const buttonRef = useRef(null);

  const state = GameState.get();
  const completedPhases = state.completedPhases || [];

  const done = getCompassProgress(completedPhases);
  const complete = isCompassComplete(completedPhases);
  const bonusUnlocked = complete && isBonusUnlocked(state);
  const percent = Math.round((done / TOTAL_PHASES) * 100);
  const avatar = getAvatar(state.avatar);

  useEffect(() => {
    // preventScroll: o foco não pode rolar a tela e esconder o título.
    buttonRef.current?.querySelector("button")?.focus({ preventScroll: true });

    AudioManager.playChime(complete);

    AudioManager.speak(
      complete
        ? "Incrível! A bússola está completa! Ela revelou um caminho secreto."
        : `Muito bem! A bússola está ${done} de ${TOTAL_PHASES} reconstruída.`
    );

    return () => AudioManager.stop();
    // Só ao abrir a tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="screen">
      <Backdrop />

      <div className="page">
        <header className="page__header">
          <h1 className="page__title">
            {complete ? "BÚSSOLA COMPLETA! 🧭" : `FASE ${phase} CONCLUÍDA!`}
          </h1>

          <p className="page__subtitle" role="status">
            {complete
              ? "Você reconstruiu 100% da bússola!"
              : `Uma nova peça voltou para a bússola (${done}/${TOTAL_PHASES})`}
          </p>
        </header>

        <div className="compass-stage">
          <div className="celebrate">
            <p className="celebrate__bubble">
              {complete ? "Conseguimos!!" : "Muito bem!"}
            </p>
            <div className="celebrate__emoji" role="img" aria-label={avatar.name}>
              {avatar.emoji}
            </div>
          </div>

          <CompassDial
            completedPhases={completedPhases}
            newPhase={phase}
            complete={complete}
          />
        </div>

        <ol className="progress" aria-label="Peças da bússola">
          {COMPASS_PARTS.map(part => {
            const filled = completedPhases.map(Number).includes(part.phase);

            return (
              <li
                key={part.id}
                className="progress__box"
                style={filled ? { background: toHex(part.color) } : undefined}
              >
                <span className="visually-hidden">
                  {`Peça ${part.phase} (${part.label}): ${filled ? "montada" : "ainda não montada"}`}
                </span>
              </li>
            );
          })}
        </ol>

        <p className="progress__text">
          {complete
            ? `${done}/${TOTAL_PHASES}  •  Bússola 100% reconstruída!`
            : `${done}/${TOTAL_PHASES}  •  ${percent}% da bússola`}
        </p>

        {bonusUnlocked ? (
          <p className="notice-bonus">
            🌟 A bússola revelou um caminho secreto: a FASE BÔNUS!
          </p>
        ) : null}

        <div className="page__actions" ref={buttonRef}>
          <Button icon="→" onClick={onContinue}>
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}