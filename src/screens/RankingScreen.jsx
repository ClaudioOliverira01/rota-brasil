import { useEffect, useRef } from "react";

import Button from "../components/Button.jsx";
import { useRanking } from "../hooks/useRanking.js";
import { getAvatar, PHASES } from "../data/gameData.js";
import { GameState } from "../systems/GameState.js";
import { AudioManager } from "../systems/AudioManager.js";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

function plural(count, singular, pluralForm) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function Position({ place }) {
  const label = `${place}º lugar`;

  if (MEDALS[place]) {
    return (
      <span className="rank-row__pos" role="img" aria-label={label}>
        {MEDALS[place]}
      </span>
    );
  }

  return (
    <span className="rank-row__pos" aria-label={label}>
      {place}º
    </span>
  );
}

function RankingRow({ row, place, isMe }) {
  const avatar = getAvatar(row.avatar);

  return (
    <li className={isMe ? "rank-row rank-row--me" : "rank-row"}>
      <Position place={place} />

      <span className="rank-row__avatar" aria-hidden="true">
        {avatar.emoji}
      </span>

      <span className="rank-row__name">
        {row.nickname}
        {isMe ? " " : null}
        {isMe ? <span className="tag tag--me">VOCÊ</span> : null}
      </span>

      <span className="rank-row__stat">
        <span aria-hidden="true">⭐</span> {row.stars}
        <span className="visually-hidden"> estrelas</span>
      </span>

      <span className="rank-row__stat">
        <span aria-hidden="true">🏆</span> {row.score}
        <span className="visually-hidden"> pontos</span>
      </span>

      <span className="rank-row__stat rank-row__phases">
        <span aria-hidden="true">✅</span> {row.completedCount}/4
        <span className="visually-hidden"> fases concluídas</span>
      </span>
    </li>
  );
}

function RankingPanel({ ranking, onRetry }) {
  const myId = GameState.get().playerId;

  if (ranking.status === "loading") {
    return (
      <p className="panel__message" role="status">
        Carregando o ranking...
      </p>
    );
  }

  return (
    <>
      {ranking.status === "offline" ? (
        <div className="notice notice--warning" role="status">
          <p>
            Não consegui falar com o servidor. Estou mostrando só os
            jogadores deste aparelho.
          </p>

          <Button variant="light" size="sm" icon="🔄" onClick={onRetry}>
            Tentar de novo
          </Button>
        </div>
      ) : null}

      {ranking.rows.length === 0 ? (
        <p className="panel__message">
          {ranking.status === "offline"
            ? "Ainda não há jogadores salvos neste aparelho."
            : "Ainda não há jogadores. Seja o primeiro explorador!"}
        </p>
      ) : (
        <ol className="rank-list" aria-label="Exploradores">
          {ranking.rows.map((row, index) => (
            <RankingRow
              key={row.id || `${row.nickname}-${index}`}
              row={row}
              place={index + 1}
              isMe={Boolean(row.id) && row.id === myId}
            />
          ))}
        </ol>
      )}
    </>
  );
}

function PhaseErrorsPanel({ stats }) {
  if (stats.status === "loading") {
    return (
      <p className="panel__message" role="status">
        Carregando as estatísticas...
      </p>
    );
  }

  if (stats.status === "error") {
    return (
      <p className="panel__message" role="status">
        As estatísticas por fase não estão disponíveis agora.
      </p>
    );
  }

  return (
    <>
      <ul className="phase-list">
        {stats.phases.map(item => {
          const info = PHASES.find(phase => phase.id === item.phase);
          const isHardest = item.phase === stats.mostErrorsPhase;
          const percent =
            stats.maxErrors > 0
              ? Math.round((item.errors / stats.maxErrors) * 100)
              : 0;

          return (
            <li
              key={item.phase}
              className={isHardest ? "phase-row phase-row--hardest" : "phase-row"}
            >
              <div className="phase-row__head">
                <span className="phase-row__name">Fase {item.phase}</span>
                {isHardest ? <span className="tag">MAIS DIFÍCIL</span> : null}
              </div>

              {info ? <div className="phase-row__title">{info.title}</div> : null}

              <div className="bar" aria-hidden="true">
                <div className="bar__fill" style={{ width: `${percent}%` }} />
              </div>

              <div className="phase-row__numbers">
                <span aria-hidden="true">❌</span> {plural(item.errors, "erro", "erros")}
                {" · "}
                <span aria-hidden="true">🎯</span> {plural(item.attempts, "tentativa", "tentativas")}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="panel__summary">
        {stats.mostErrorsPhase
          ? `A fase com mais erros é a Fase ${stats.mostErrorsPhase}. Ela merece um reforço!`
          : "Ainda não há erros registrados."}
      </p>
    </>
  );
}

/**
 * Tela de Ranking.
 * onBack() volta ao menu principal.
 */
export default function RankingScreen({ onBack }) {
  const titleRef = useRef(null);
  const { ranking, stats, reload } = useRanking();

  // Leitores de tela começam pelo título; a narração apresenta a tela.
  useEffect(() => {
    titleRef.current?.focus();

    AudioManager.speak(
      "Aqui está o ranking dos exploradores e as fases que tiveram mais erros."
    );

    return () => AudioManager.stop();
  }, []);

  return (
    <div className="screen">
      <div className="decor" aria-hidden="true">
        <div className="decor__sun" />
        <div className="decor__hill decor__hill--left" />
        <div className="decor__hill decor__hill--right" />
        <div className="decor__bushes" />
      </div>

      <div className="ranking">
        <header className="ranking__header">
          <h1 className="ranking__title" ref={titleRef} tabIndex={-1}>
            🏆 Ranking dos exploradores
          </h1>
          <p className="ranking__subtitle">
            Veja quem já participou da expedição!
          </p>
        </header>

        <div className="ranking__grid">
          <section className="panel" aria-labelledby="ranking-heading">
            <h2 id="ranking-heading" className="panel__title">
              Exploradores
            </h2>
            <RankingPanel ranking={ranking} onRetry={reload} />
          </section>

          <section className="panel" aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="panel__title">
              Fases com mais erros
            </h2>
            <PhaseErrorsPanel stats={stats} />
          </section>
        </div>

        <div className="ranking__footer">
          <Button variant="secondary" size="md" icon="🏠" onClick={onBack}>
            Voltar ao menu
          </Button>
        </div>
      </div>
    </div>
  );
}