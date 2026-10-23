import { useEffect, useMemo, useRef, useState } from "react";

import Backdrop from "../components/Backdrop.jsx";
import Button from "../components/Button.jsx";
import DragMatch from "../components/DragMatch.jsx";
import GameBar from "../components/GameBar.jsx";
import GuideHelper from "../components/GuideHelper.jsx";
import { getAvatar } from "../data/gameData.js";
import { PHASE_CONFIGS } from "../data/phases/index.js";
import {
  awardCorrect,
  completePhase,
  recordAttempt,
  recordError,
  restorePhase,
  snapshotPhase,
  startPhase
} from "../services/PhaseSession.js";
import { AudioManager } from "../systems/AudioManager.js";
import { GameState } from "../systems/GameState.js";
import { arrangeMatch, shuffle } from "../utils/shuffle.js";

// Garante que o estilo das fases carrega mesmo que o styles.css não o importe.
import "../styles/match.css";

/**
 * Na bússola os destinos têm lugar fixo (Norte em cima etc.), então só os
 * cartões são embaralhados. Nas demais fases, as duas colunas mudam de ordem
 * e nenhum cartão fica na linha do seu destino.
 */
function arrange(config) {
  return config.layout === "compass"
    ? { items: shuffle(config.items), targets: config.targets }
    : arrangeMatch(config.items, config.targets);
}

const FLASH_MS = 800;
const FINISH_MS = 1200;

/**
 * Uma fase de "arrastar e combinar" (Fases 1, 2, 3 e 4).
 * Os dados vêm de data/phases/; a interação, do DragMatch; a pontuação e o
 * progresso, do PhaseSession.
 *
 *  phase        número da fase (1 a 4)
 *  onComplete   terminou: recebe { phase, final } para a bússola e a vitória
 *  onMenu       a criança confirmou que quer voltar ao menu
 */
export default function PhaseScreen({ phase, onComplete, onMenu }) {
  const config = PHASE_CONFIGS[phase];
  const companion = getAvatar(GameState.get().avatar).name;

  const matchRef = useRef(null);
  const titleRef = useRef(null);
  const snapshotRef = useRef(null);
  const timers = useRef([]);

  const [arrangement, setArrangement] = useState(() => arrange(config));
  const [placed, setPlaced] = useState({}); // idDoDestino -> [ids dos cartões]
  const [selectedId, setSelectedId] = useState(null);
  const [flash, setFlash] = useState(null);
  // A instrução já aparece no quadro de cima; aqui só vai o retorno das jogadas.
  const [feedback, setFeedback] = useState({ tone: "info", text: "" });
  const [hint, setHint] = useState("");
  const [score, setScore] = useState(() => GameState.get().score);
  const [finishing, setFinishing] = useState(false);

  const itemsById = useMemo(
    () => Object.fromEntries(config.items.map(item => [item.id, item])),
    [config]
  );
  const targetsById = useMemo(
    () => Object.fromEntries(config.targets.map(target => [target.id, target])),
    [config]
  );

  // Quantos cartões cada destino recebe (nas fases atuais, sempre 1)
  const capacity = useMemo(() => {
    const counts = {};

    config.items.forEach(item => {
      counts[item.targetId] = (counts[item.targetId] || 0) + 1;
    });

    return counts;
  }, [config]);

  const placedIds = new Set(Object.values(placed).flat());
  const poolItems = arrangement.items.filter(item => !placedIds.has(item.id));
  const doneCount = placedIds.size;
  const total = config.items.length;

  const placedByTarget = Object.fromEntries(
    Object.entries(placed).map(([targetId, ids]) => [
      targetId,
      ids.map(id => itemsById[id])
    ])
  );

  const full = {};
  Object.entries(placed).forEach(([targetId, ids]) => {
    full[targetId] = ids.length >= (capacity[targetId] || 1);
  });

  const fill = text => text.replaceAll("{companion}", companion);

  function later(callback, delay) {
    timers.current.push(window.setTimeout(callback, delay));
  }

  function clearTimers() {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }

  useEffect(() => {
    snapshotRef.current = snapshotPhase();
    startPhase(phase);

    titleRef.current?.focus({ preventScroll: true });
    AudioManager.speak(fill(config.introSpeech));

    return () => {
      clearTimers();
      AudioManager.stop();
    };
    // Só ao abrir a fase.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function say(tone, text) {
    setFeedback({ tone, text });
    AudioManager.speak(text);
  }

  function handleSelect(itemId) {
    if (finishing) {
      return;
    }

    const item = itemsById[itemId];

    if (selectedId === itemId) {
      setSelectedId(null);
      setFeedback({ tone: "info", text: "" });
      return;
    }

    setSelectedId(itemId);
    setFeedback({
      tone: "info",
      text: `Você escolheu "${item.label}". Agora toque no destino certo.`
    });

    // Quem ainda não lê bem ouve o nome e a pista do cartão.
    AudioManager.speak(
      item.detail ? `${item.label}. ${item.detail}` : item.label
    );
  }

  async function finishPhase() {
    setFinishing(true);

    const info = await completePhase(phase);

    AudioManager.speak(fill(config.finishSpeech));

    later(() => onComplete(info), FINISH_MS);
  }

  function handleDrop(itemId, targetId) {
    if (finishing || !itemId) {
      return;
    }

    if (!targetId) {
      setSelectedId(null);
      setFeedback({
        tone: "info",
        text: "Solte o cartão sobre um dos destinos. Ou toque no cartão e depois no destino."
      });
      return;
    }

    const item = itemsById[itemId];
    const target = targetsById[targetId];

    recordAttempt(phase);

    if (item.targetId !== targetId) {
      recordError(phase);

      // Errou: o cartão escolhido continua escolhido (a criança tenta outro
      // destino sem precisar escolher de novo). Se foi arrastado, solta.
      setSelectedId(current => (current === itemId ? current : null));

      setFlash({ itemId, targetId, correct: false });
      later(() => setFlash(null), FLASH_MS);

      say("error", config.messages.wrong(item, target));
      return;
    }

    setSelectedId(null);
    awardCorrect(phase, config.points, { star: config.star });

    setScore(GameState.get().score);
    setHint("");
    setFlash({ itemId, targetId, correct: true });
    later(() => setFlash(null), FLASH_MS);

    setPlaced(current => ({
      ...current,
      [targetId]: [...(current[targetId] || []), itemId]
    }));

    say("success", config.messages.correct(item, target));

    if (doneCount + 1 >= total) {
      finishPhase();
      return;
    }

    // Quem usa teclado continua direto no próximo cartão.
    later(() => matchRef.current?.focusFirstCard(), 50);
  }

  function handleTargetClick(targetId) {
    if (!selectedId) {
      setFeedback({
        tone: "info",
        text: "Primeiro toque em um cartão para escolher."
      });
      return;
    }

    handleDrop(selectedId, targetId);
  }

  function handleHint() {
    const item = poolItems.find(card => card.id === selectedId) || poolItems[0];

    const text = item
      ? `Dica: ${
          item.hint ||
          (item.detail
            ? `leia a pista de ${item.label}: ${item.detail}`
            : config.hint)
        }`
      : `Dica: ${config.hint}`;

    setHint(text);
    AudioManager.speak(text);
  }

  function handleRestart() {
    clearTimers();

    restorePhase(snapshotRef.current);
    startPhase(phase);

    setArrangement(arrange(config));
    setPlaced({});
    setSelectedId(null);
    setFlash(null);
    setHint("");
    setScore(GameState.get().score);
    setFeedback({ tone: "info", text: "" });

    AudioManager.speak(fill(config.introSpeech));
  }

  function handleExit() {
    // Saiu no meio: desfaz os pontos desta fase (senão somariam de novo).
    if (!finishing) {
      restorePhase(snapshotRef.current);
    }

    onMenu();
  }

  return (
    <div className="screen">
      <Backdrop />

      <div className="play">
        <GameBar
          title={config.title}
          score={score}
          titleRef={titleRef}
          onExit={handleExit}
          onRestart={handleRestart}
        />

        <p className="instruction">{fill(config.instruction)}</p>

        <div className="phase-tools">
          <Button
            variant="secondary"
            size="sm"
            icon="💡"
            disabled={finishing}
            onClick={handleHint}
          >
            Dica
          </Button>

          <p className="phase-progress">
            {doneCount} de {total} no lugar certo
          </p>
        </div>

        <DragMatch
          ref={matchRef}
          layout={config.layout}
          items={poolItems}
          targets={arrangement.targets}
          placed={placedByTarget}
          full={full}
          selectedId={selectedId}
          flash={flash}
          onSelect={handleSelect}
          onDrop={handleDrop}
          onTargetClick={handleTargetClick}
        />

        <p className={`feedback feedback--${feedback.tone}`} role="status">
          {feedback.text}
        </p>

        {hint ? <p className="hintline">{hint}</p> : null}
      </div>

      <GuideHelper phaseId={config.guideId} startOpen={false} />
    </div>
  );
}