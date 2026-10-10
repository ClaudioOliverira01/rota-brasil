import { useEffect, useRef, useState } from "react";

import Button from "../components/Button.jsx";
import { AVATARS } from "../data/gameData.js";
import { beginAdventure } from "../services/PlayerSession.js";
import { AudioManager } from "../systems/AudioManager.js";
import { GameState } from "../systems/GameState.js";

const INTRO_SPEECH =
  "Prepare sua expedição! Escolha seu companheiro e continue a aventura.";

const ARROW_STEP = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1
};

/**
 * Tela de escolha do companheiro de aventura.
 *  onBack()          volta para "Quem está jogando?"
 *  onReady(cena)     começa o jogo no Phaser, na cena indicada
 */
export default function AvatarScreen({ onBack, onReady }) {
  const state = GameState.get();
  const nickname = state.nickname || "Explorador";

  const [selected, setSelected] = useState(state.avatar || "ae");
  const [busy, setBusy] = useState(false);

  const speechTimer = useRef(null);
  const radioRefs = useRef({});

  useEffect(() => {
    AudioManager.speak(INTRO_SPEECH);

    return () => {
      window.clearTimeout(speechTimer.current);
      AudioManager.stopAnimalSound();
    };
  }, []);

  function choose(avatar) {
    setSelected(avatar.id);

    // Primeiro o som real do animal; a fala só entra depois,
    // para não cobrir o som.
    AudioManager.stop();
    AudioManager.playAnimalSound(avatar.sound, avatar.id);

    window.clearTimeout(speechTimer.current);
    speechTimer.current = window.setTimeout(() => {
      AudioManager.speak(`${avatar.name}, ${avatar.description}.`);
    }, 1400);
  }

  // Teclado: setas movem a escolha, como em qualquer grupo de opções
  function handleKeyDown(event) {
    const step = ARROW_STEP[event.key];

    if (!step) {
      return;
    }

    event.preventDefault();

    const index = AVATARS.findIndex(avatar => avatar.id === selected);
    const next = AVATARS[(index + step + AVATARS.length) % AVATARS.length];

    choose(next);
    radioRefs.current[next.id]?.focus();
  }

  async function handleContinue() {
    if (busy) {
      return;
    }

    setBusy(true);

    window.clearTimeout(speechTimer.current);
    AudioManager.stopAnimalSound();

    const entryScene = await beginAdventure(selected);

    AudioManager.speak(`Olá, ${nickname}! A aventura de Aê está começando.`);

    onReady(entryScene);
  }

  function handleBack() {
    window.clearTimeout(speechTimer.current);
    AudioManager.stop();
    onBack();
  }

  return (
    <div className="screen">
      <div className="decor" aria-hidden="true">
        <div className="decor__sun" />
        <div className="decor__hill decor__hill--left" />
        <div className="decor__hill decor__hill--right" />
        <div className="decor__bushes" />
      </div>

      <div className="page">
        <header className="page__header">
          <h1 className="page__title">PREPARE SUA EXPEDIÇÃO</h1>
          <p className="page__subtitle">Escolha seu companheiro de aventura</p>
        </header>

        <div
          className="avatar-grid"
          role="radiogroup"
          aria-label="Companheiro de aventura"
          onKeyDown={handleKeyDown}
        >
          {AVATARS.map(avatar => {
            const isSelected = avatar.id === selected;

            return (
              <button
                key={avatar.id}
                ref={element => {
                  radioRefs.current[avatar.id] = element;
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                className={isSelected ? "avatar-card avatar-card--selected" : "avatar-card"}
                onClick={() => choose(avatar)}
              >
                <span className="avatar-card__emoji" aria-hidden="true">
                  {avatar.emoji}
                </span>
                <span className="avatar-card__name">{avatar.name}</span>
                <span className="avatar-card__description">{avatar.description}</span>
                <span className="avatar-card__badge" aria-hidden={!isSelected}>
                  {isSelected ? "✓ ESCOLHIDO" : "\u00A0"}
                </span>
              </button>
            );
          })}
        </div>

        <p className="avatar-nickname">
          Seu apelido: <strong>{nickname}</strong>
        </p>

        <div className="page__actions">
          <Button icon="➜" disabled={busy} onClick={handleContinue}>
            {busy ? "Preparando..." : "Continuar"}
          </Button>

          <Button variant="light" size="md" icon="←" disabled={busy} onClick={handleBack}>
            Trocar jogador
          </Button>
        </div>
      </div>
    </div>
  );
}