import { useEffect, useRef, useState } from "react";

import Backdrop from "../components/Backdrop.jsx";
import Button from "../components/Button.jsx";
import { isBonusUnlocked } from "../data/compassData.js";
import { getAvatar } from "../data/gameData.js";
import {
  REPORT_SOURCE,
  downloadReport,
  finishExpedition
} from "../services/ExpeditionService.js";
import { AudioManager } from "../systems/AudioManager.js";
import { GameMetrics } from "../systems/GameMetrics.js";
import { GameState } from "../systems/GameState.js";

function plural(count, singular, pluralForm) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function titleFor({ bonus, final, phase }) {
  if (bonus) {
    return "FASE BÔNUS CONCLUÍDA! 🌟";
  }

  return final ? "EXPEDIÇÃO CONCLUÍDA! 🎉" : `FASE ${phase} CONCLUÍDA! 🎉`;
}

/**
 * Tela de resultado depois de cada fase (e do bônus).
 *
 *  info          { phase, final, bonus, nextPhase }
 *  onNextPhase   vai para a fase seguinte
 *  onPlayBonus   abre o desafio bônus
 *  onFinish      encerra a expedição e abre o ranking
 *  onMenu        volta ao menu
 */
export default function VictoryScreen({
  info,
  onNextPhase,
  onPlayBonus,
  onFinish,
  onMenu
}) {
  const titleRef = useRef(null);

  const [report, setReport] = useState({ loading: false, message: "" });
  const [finishing, setFinishing] = useState(false);

  const state = GameState.get();
  const metrics = GameMetrics.get();
  const avatar = getAvatar(state.avatar);

  const { phase, final, bonus, nextPhase } = info;

  const showBonusButton =
    final && !bonus && !state.bonusCompleted && isBonusUnlocked(state);

  // O bônus guarda os erros dele separado das fases.
  const phaseData = metrics.phases?.[bonus ? "bonus" : phase] || {};

  const totalSeconds =
    metrics.totalTimeSeconds || GameMetrics.getCurrentTime();

  useEffect(() => {
    // preventScroll: o foco não pode rolar a tela e esconder o título.
    titleRef.current?.focus({ preventScroll: true });

    AudioManager.speak(
      final
        ? `Parabéns! Você terminou toda a expedição com ${state.score} pontos.`
        : `Parabéns! Você concluiu a Fase ${phase}. Agora vamos para a próxima fase.`
    );

    return () => AudioManager.stop();
    // Só ao abrir a tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleReport() {
    if (report.loading) {
      return;
    }

    setReport({ loading: true, message: "" });

    try {
      const source = await downloadReport();

      const message =
        source === REPORT_SOURCE.LOCAL_FALLBACK
          ? "Relatório gerado (versão local)."
          : "Relatório gerado com sucesso!";

      setReport({ loading: false, message });

      AudioManager.speak("Seu relatório de desempenho foi gerado com sucesso.");
    } catch (error) {
      console.error("Erro ao gerar relatório PDF:", error);

      setReport({
        loading: false,
        message: "Não foi possível gerar o relatório agora."
      });
    }
  }

  async function handleFinish() {
    if (finishing) {
      return;
    }

    setFinishing(true);

    await finishExpedition();

    onFinish();
  }

  return (
    <div className="screen">
      <Backdrop />

      <div className="page">
        <header className="page__header">
          <h1 className="page__title" ref={titleRef} tabIndex={-1}>
            {titleFor(info)}
          </h1>
        </header>

        <div className="victory">
          <div className="victory__summary">
            <div className="victory__mascot" role="img" aria-label={avatar.name}>
              {avatar.emoji}
            </div>

            <p className="victory__message">
              {final
                ? "Você ajudou Aê a completar toda a expedição!"
                : "Muito bem! Sua aventura está avançando."}
            </p>

            <ul className="stats">
              <li className="stat">
                <span aria-hidden="true">⭐</span>{" "}
                {plural(state.stars, "estrela", "estrelas")}
              </li>
              <li className="stat">
                <span aria-hidden="true">🏆</span>{" "}
                {plural(state.score, "ponto", "pontos")}
              </li>
            </ul>

            <p className="victory__detail">
              {bonus ? (
                <>
                  <span aria-hidden="true">❌</span> Erros no desafio dos
                  animais: {phaseData.errors || 0}
                </>
              ) : (
                <>
                  <span aria-hidden="true">❌</span> Erros na Fase {phase}:{" "}
                  {phaseData.errors || 0}
                  {"   "}
                  <span aria-hidden="true">⏱️</span> Tempo:{" "}
                  {GameMetrics.formatTime(phaseData.timeSeconds || 0)}
                </>
              )}
            </p>

            {bonus && state.bonusSeal ? (
              <p className="victory__detail">
                <span aria-hidden="true">
                  {state.bonusSeal === "gold" ? "🥇" : "🥈"}
                </span>{" "}
                Selo de explorador{" "}
                {state.bonusSeal === "gold" ? "dourado" : "prateado"}
              </p>
            ) : null}

            {final ? (
              <p className="victory__detail">
                <span aria-hidden="true">⏱️</span> Tempo total da expedição:{" "}
                {GameMetrics.formatTime(totalSeconds)}
              </p>
            ) : null}
          </div>

          <div className="victory__actions">
            <div className="page__actions">
              {showBonusButton ? (
                <Button variant="secondary" icon="🌟" onClick={onPlayBonus}>
                  Jogar a fase bônus
                </Button>
              ) : null}

              {final ? (
                <Button icon="🏆" disabled={finishing} onClick={handleFinish}>
                  {finishing ? "Finalizando..." : "Finalizar jogo"}
                </Button>
              ) : (
                <Button icon="➡️" onClick={() => onNextPhase(nextPhase)}>
                  {`Continuar para a fase ${nextPhase}`}
                </Button>
              )}

              <Button
                variant="secondary"
                size="md"
                icon="📄"
                disabled={report.loading}
                onClick={handleReport}
              >
                {report.loading ? "Gerando relatório..." : "Gerar relatório em PDF"}
              </Button>

              <Button variant="light" size="md" icon="🏠" onClick={onMenu}>
                Voltar ao menu
              </Button>
            </div>

            <p className="victory__status" role="status">
              {report.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}