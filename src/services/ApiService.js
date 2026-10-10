import { triggerDownload } from "./ReportService.js";
import { buildProgressSnapshot } from "./ProgressSnapshot.js";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3333/api"
).replace(/\/$/, "");

const USE_MOCK =
  String(import.meta.env.VITE_USE_MOCK ?? "false") === "true";

const API_TIMEOUT = Number(
  import.meta.env.VITE_API_TIMEOUT || 12000
);

/**
 * IDs que começam com "local-" são de jogadores criados sem conexão:
 * eles não existem no servidor, então não há o que sincronizar.
 */
function isServerPlayerId(playerId) {
  return Boolean(playerId) && !String(playerId).startsWith("local-");
}

async function request(path, options = {}) {
  const controller = new AbortController();

  const timeoutId = window.setTimeout(
    () => controller.abort(),
    API_TIMEOUT
  );

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...(options.headers || {})
      }
    });

    const contentType =
      response.headers.get("content-type") || "";

    const payload =
      response.status === 204
        ? null
        : contentType.includes("application/json")
          ? await response.json()
          : await response.text();

    if (!response.ok) {
      const error = new Error(
        payload?.error ||
        payload?.mensagem ||
        `API ${response.status}: ${response.statusText}`
      );

      error.status = response.status;
      error.payload = payload;

      throw error;
    }

    return payload;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "A API demorou para responder. Verifique se o backend está ligado."
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

const PDF_TIMEOUT = Number(
  import.meta.env.VITE_PDF_TIMEOUT || 45000
);

async function requestBlob(path, options = {}) {
  const controller = new AbortController();

  const timeoutId = window.setTimeout(
    () => controller.abort(),
    PDF_TIMEOUT
  );

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/pdf",
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      let message = `API ${response.status}: ${response.statusText}`;

      try {
        const contentType =
          response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const payload = await response.json();
          message =
            payload?.error ||
            payload?.mensagem ||
            message;
        }
      } catch {
        // Mantém a mensagem padrão.
      }

      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return await response.blob();
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "A geração do relatório demorou para responder."
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const ApiService = {
  get baseUrl() {
    return API_BASE_URL;
  },

  isMockEnabled() {
    return USE_MOCK;
  },

  async health() {
    return request("/health");
  },

  async createPlayer(payload) {
    if (USE_MOCK) {
      return {
        id: `mock-${Date.now()}`,
        ...payload
      };
    }

    return request("/players", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async getPlayerByNickname(nickname) {
    if (USE_MOCK) {
      return null;
    }

    return request(
      `/players/by-nickname/${encodeURIComponent(nickname)}`
    );
  },

  async getProgress(playerId) {
    if (USE_MOCK) {
      return {
        playerId,
        currentPhase: 1,
        score: 0,
        stars: 0,
        completedPhases: [],
        accessibility: {
          narration: true,
          highContrast: false,
          reducedMotion: false
        },
        gameStartedAt: null,
        gameCompletedAt: null,
        totalTimeSeconds: 0
      };
    }

    return request(
      `/players/${encodeURIComponent(playerId)}/progress`
    );
  },

  /**
   * Salva o progresso. O conteúdo vem SEMPRE do estado real do jogo
   * (ProgressSnapshot): os campos enviados pela cena que chamou são
   * ignorados, exceto o playerId e o reset. Assim nenhuma tela consegue
   * gravar um progresso incompleto.
   */
  async saveProgress(payload = {}) {
    if (USE_MOCK) {
      return payload;
    }

    const snapshot = buildProgressSnapshot();
    const playerId = payload.playerId || snapshot.playerId;

    if (!isServerPlayerId(playerId)) {
      return null;
    }

    return request("/progress", {
      method: "POST",
      body: JSON.stringify({
        ...snapshot,
        playerId,
        // reset: true = "começar do zero": o servidor SUBSTITUI o progresso
        // em vez de juntar com o que já estava salvo.
        ...(payload.reset === true ? { reset: true } : {})
      })
    });
  },

  async savePhaseResult(payload) {
    if (USE_MOCK) {
      return payload;
    }

    return request("/progress/phases", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async getRanking(limit = 10) {
    if (USE_MOCK) {
      return [];
    }

    return request(
      `/ranking?limit=${Math.max(
        1,
        Math.min(50, Number(limit) || 10)
      )}`
    );
  },

  async getPhaseStats() {
    if (USE_MOCK) {
      return {
        phases: [],
        mostErrorsPhase: null
      };
    }

    return request("/stats/phases");
  },

  /*
   * Gera e baixa o relatório de desempenho em PDF.
   */
  async downloadPerformancePdf(playerId) {
    if (!playerId) {
      throw new Error(
        "Não foi possível identificar o jogador."
      );
    }

    if (USE_MOCK) {
      throw new Error(
        "O relatório em PDF exige conexão com o backend."
      );
    }

    const blob = await requestBlob(
      `/reports/${encodeURIComponent(playerId)}/pdf`
    );

    // Garante que o que chegou é mesmo um PDF (e não uma página de erro)
    if (!blob || blob.size < 200) {
      throw new Error("O servidor devolveu um relatório vazio.");
    }

    triggerDownload(
      blob,
      "relatorio-rota-brasil.pdf"
    );

    return true;
  }
};