import { useEffect, useRef, useState } from "react";

import Backdrop from "../components/Backdrop.jsx";
import Button from "../components/Button.jsx";
import GuideHelper from "../components/GuideHelper.jsx";
import {
  BONUS_ANIMALS,
  BONUS_PHASE_KEY,
  BONUS_POINTS_PER_CORRECT
} from "../data/bonusData.js";
import {
  awardCorrect,
  completeBonus,
  recordAttempt,
  recordError,
  startPhase
} from "../services/PhaseSession.js";
import { AudioManager } from "../systems/AudioManager.js";
import { GameState } from "../systems/GameState.js";

const INTRO_TEXT = "Ouça o som e escolha o animal correto!";
const INTRO_SPEECH =
  "Fase bônus! Ouça o som e descubra qual animal brasileiro está fazendo esse som.";

const WRONG_FLASH_MS = 800;
const NEXT_ROUND_MS = 1000;
const FINISH_MS = 1200;

function shuffled(list) {
  const copy = [...list];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

/**
 * Desafio bônus: ouvir o som e escolher o animal certo (4 desafios).
 *
 *  onFinish()  terminou o desafio: segue para a tela de vitória
 *  onExit()    sair do desafio (volta ao menu)
 */
export default function BonusScreen({ onFinish, onExit }) {
  const titleRef = useRef(null);
  const listenRef = useRef(null);
  const timers = useRef([]);

  const [round, setRound] = useState(0);
  const [options, setOptions] = useState(() => shuffled(BONUS_ANIMALS));
  const [picked, setPicked] = useState(null); // { id, correct }
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState({ tone: "info", text: INTRO_TEXT });
  const [score, setScore] = useState(() => GameState.get().score);

  const animal = BONUS_ANIMALS[round];
  const total = BONUS_ANIMALS.length;

  function later(callback, delay) {
    timers.current.push(window.setTimeout(callback, delay));
  }

  useEffect(() => {
    startPhase(BONUS_PHASE_KEY);

    titleRef.current?.focus({ preventScroll: true });
    AudioManager.speak(INTRO_SPEECH);

    return () => {
      timers.current.forEach(window.clearTimeout);
      AudioManager.stop();
      AudioManager.stopAnimalSound();
    };
  }, []);

  function handleListen() {
    AudioManager.playAnimalSound(animal.sound, animal.id);
  }

  async function finishChallenge() {
    const seal = await completeBonus();

    setFeedback({
      tone: "success",
      text:
        seal === "gold"
          ? "Parabéns! Você ganhou o selo dourado de explorador!"
          : "Parabéns! Você completou o desafio e ganhou o selo de explorador!"
    });

    AudioManager.speak(
      seal === "gold"
        ? "Parabéns! Você completou o desafio e ganhou o selo dourado de explorador!"
        : "Parabéns! Você completou o desafio dos animais brasileiros e ganhou o selo de explorador!"
    );

    later(onFinish, FINISH_MS);
  }

  function nextRound() {
    setRound(current => current + 1);
    setOptions(shuffled(BONUS_ANIMALS));
    setPicked(null);
    setLocked(false);
    setFeedback({ tone: "info", text: INTRO_TEXT });

    // Quem usa teclado continua direto no botão de ouvir.
    window.setTimeout(() => listenRef.current?.querySelector("button")?.focus(), 0);
  }

  function handleAnswer(choice) {
    if (locked) {
      return;
    }

    recordAttempt(BONUS_PHASE_KEY);

    if (choice.id !== animal.id) {
      recordError(BONUS_PHASE_KEY);

      setPicked({ id: choice.id, correct: false });
      setFeedback({
        tone: "error",
        text: "Quase! Ouça novamente o som e tente outra vez."
      });

      AudioManager.speak("Quase! Ouça novamente o som e tente outra vez.");

      later(() => setPicked(null), WRONG_FLASH_MS);

      return;
    }

    setLocked(true);
    awardCorrect(BONUS_PHASE_KEY, BONUS_POINTS_PER_CORRECT);

    setScore(GameState.get().score);
    setPicked({ id: choice.id, correct: true });
    setFeedback({
      tone: "success",
      text: `Muito bem! Você reconheceu o som do ${choice.name}.`
    });

    AudioManager.speak(`Muito bem! Você reconheceu o som do ${choice.name}.`);

    later(
      round < total - 1 ? nextRound : finishChallenge,
      NEXT_ROUND_MS
    );
  }

  return (
    <div className="screen">
      <Backdrop />

      <div className="play">
        <div className="play__bar">
          <div className="play__exit">
            <Button variant="light" size="sm" icon="←" onClick={onExit}>
              Sair
            </Button>
          </div>

          <h1 className="play__title" ref={titleRef} tabIndex={-1}>
            🌎 Desafio dos animais brasileiros
          </h1>

          <p className="hud">
            <span aria-hidden="true">⭐</span> {score}
            <span className="visually-hidden"> pontos</span>
          </p>
        </div>

        <p className="play__round">
          Desafio {round + 1} de {total}
        </p>

        <div className="dots" aria-hidden="true">
          {BONUS_ANIMALS.map((item, index) => (
            <span
              key={item.id}
              className={index < round ? "dots__item dots__item--done" : "dots__item"}
            />
          ))}
        </div>

        <div className="sound-panel" ref={listenRef}>
          <Button icon="🔊" onClick={handleListen}>
            Ouvir som
          </Button>
        </div>

        <div className="choices" role="group" aria-label="Qual animal faz esse som?">
          {options.map(choice => {
            const state =
              picked?.id === choice.id
                ? picked.correct
                  ? " choice--right"
                  : " choice--wrong"
                : "";

            return (
              <button
                key={choice.id}
                type="button"
                className={`choice${state}`}
                disabled={locked && picked?.id !== choice.id}
                onClick={() => handleAnswer(choice)}
              >
                <span className="choice__emoji" aria-hidden="true">
                  {choice.emoji}
                </span>
                <span className="choice__name">{choice.name}</span>
                {picked?.id === choice.id ? (
                  <span className="choice__mark" aria-hidden="true">
                    {picked.correct ? "✓" : "✗"}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <p className={`feedback feedback--${feedback.tone}`} role="status">
          {feedback.text}
        </p>
      </div>

      <GuideHelper phaseId={5} position="right" />
    </div>
  );
}