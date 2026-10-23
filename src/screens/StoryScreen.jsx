import { useEffect, useRef } from "react";

import Backdrop from "../components/Backdrop.jsx";
import Button from "../components/Button.jsx";
import { getAvatar } from "../data/gameData.js";
import { AudioManager } from "../systems/AudioManager.js";
import { GameState } from "../systems/GameState.js";

import "../styles/story.css";

/**
 * Abertura da história: quem é o(a) companheiro(a) escolhido(a) e qual é a
 * missão. Termina no botão "VAMOS!", que abre a Fase 1.
 *
 *  onStart   abre a Fase 1
 *  onMenu    volta ao menu principal
 */
export default function StoryScreen({ onStart, onMenu }) {
  const titleRef = useRef(null);

  const state = GameState.get();
  const companion = getAvatar(state.avatar);
  const nickname = state.nickname || "Explorador";

  const lines = [
    `Olá, ${nickname}! Eu sou ${companion.name}.`,
    "Minha bússola mágica perdeu seus cristais!",
    "Precisamos viajar pelo Brasil para encontrá-los.",
    "Nossa primeira missão é reconstruir a bússola usando os pontos cardeais."
  ];

  const speech = `Olá, ${nickname}! Minha bússola mágica perdeu seus cristais. Vamos reconstruí-la usando os pontos cardeais.`;

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
    AudioManager.speak(speech);

    return () => AudioManager.stop();
    // Narra só ao abrir a tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="screen">
      <Backdrop />

      <div className="story">
        <div className="story__top">
          <Button variant="light" size="sm" icon="🏠" onClick={onMenu}>
            Menu
          </Button>
        </div>

        <h1 className="story__title" ref={titleRef} tabIndex={-1}>
          A expedição começa!
        </h1>

        <div className="story__hero" aria-hidden="true">
          {companion.emoji}
        </div>

        <p className="story__name">{companion.description}</p>

        <div className="story__bubble">
          {lines.map(line => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <div className="story__actions">
          <Button size="lg" icon="🧭" onClick={onStart}>
            Vamos!
          </Button>

          <Button
            variant="light"
            size="md"
            icon="🔊"
            onClick={() => AudioManager.speak(speech)}
          >
            Ouvir de novo
          </Button>
        </div>
      </div>
    </div>
  );
}