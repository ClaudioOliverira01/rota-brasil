import { useCallback, useEffect, useState } from "react";

import { ApiService } from "../services/ApiService.js";
import { ProgressManager } from "../systems/ProgressManager.js";

const DEFAULT_LIMIT = 8;
const PHASE_IDS = [1, 2, 3, 4];

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function compareRows(a, b) {
  return (
    b.score - a.score ||
    b.stars - a.stars ||
    b.completedCount - a.completedCount
  );
}

function normalizeRow(row) {
  const completedPhases = Array.isArray(row?.completedPhases)
    ? row.completedPhases
    : [];

  return {
    id: row?.id || row?.playerId || null,
    nickname: row?.nickname || "Explorador",
    avatar: row?.avatar || "ae",
    score: toNumber(row?.score),
    stars: toNumber(row?.stars),
    completedCount: completedPhases.length
  };
}

function normalizeRanking(data) {
  const list = Array.isArray(data) ? data : data?.ranking || [];

  return list.map(normalizeRow);
}

/**
 * Ranking dos jogadores que já jogaram NESTE aparelho.
 * É o plano B quando o servidor não responde.
 */
function readLocalRanking(limit) {
  return ProgressManager.getProfiles()
    .map(normalizeRow)
    .sort(compareRows)
    .slice(0, limit);
}

/**
 * A API devolve só as fases que já tiveram resultados.
 * Aqui completamos as 4 fases, para a tela sempre mostrar todas.
 */
function normalizeStats(data) {
  const byPhase = new Map(
    (data?.phases || []).map(item => [Number(item.phase), item])
  );

  const phases = PHASE_IDS.map(phase => {
    const item = byPhase.get(phase) || {};

    return {
      phase,
      errors: toNumber(item.totalErrors),
      attempts: toNumber(item.totalAttempts)
    };
  });

  const maxErrors = Math.max(...phases.map(item => item.errors));

  return {
    phases,
    maxErrors,
    // A API manda o número da fase em "mostErrorsPhase".
    mostErrorsPhase: maxErrors > 0 ? Number(data?.mostErrorsPhase) || null : null
  };
}

/**
 * Carrega o ranking e as estatísticas por fase, de forma INDEPENDENTE:
 * se uma das duas chamadas falhar, a outra continua aparecendo.
 *
 * ranking.status: "loading" | "ready" | "offline"
 *   offline = o servidor não respondeu; mostramos os jogadores locais.
 * stats.status:   "loading" | "ready" | "error"
 */
export function useRanking(limit = DEFAULT_LIMIT) {
  const [attempt, setAttempt] = useState(0);

  const [ranking, setRanking] = useState({
    status: "loading",
    rows: []
  });

  const [stats, setStats] = useState({
    status: "loading",
    phases: [],
    maxErrors: 0,
    mostErrorsPhase: null
  });

  useEffect(() => {
    let cancelled = false;

    setRanking(previous => ({ ...previous, status: "loading" }));
    setStats(previous => ({ ...previous, status: "loading" }));

    if (ApiService.isMockEnabled()) {
      setRanking({ status: "ready", rows: readLocalRanking(limit) });
      setStats({ status: "error", phases: [], maxErrors: 0, mostErrorsPhase: null });

      return undefined;
    }

    ApiService.getRanking(limit)
      .then(data => {
        if (!cancelled) {
          setRanking({ status: "ready", rows: normalizeRanking(data) });
        }
      })
      .catch(error => {
        console.warn("Ranking indisponível. Usando jogadores deste aparelho.", error);

        if (!cancelled) {
          setRanking({ status: "offline", rows: readLocalRanking(limit) });
        }
      });

    ApiService.getPhaseStats()
      .then(data => {
        if (!cancelled) {
          setStats({ status: "ready", ...normalizeStats(data) });
        }
      })
      .catch(error => {
        console.warn("Estatísticas por fase indisponíveis.", error);

        if (!cancelled) {
          setStats({ status: "error", phases: [], maxErrors: 0, mostErrorsPhase: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [limit, attempt]);

  const reload = useCallback(() => setAttempt(count => count + 1), []);

  return { ranking, stats, reload };
}