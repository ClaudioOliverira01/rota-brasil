const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3333/api"
).replace(/\/$/, "");

const USE_MOCK =
  String(import.meta.env.VITE_USE_MOCK ?? "false") === "true";

const API_TIMEOUT = Number(
  import.meta.env.VITE_API_TIMEOUT || 8000
);

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

async function requestBlob(path, options = {}) {
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

  async saveProgress(payload) {
    if (USE_MOCK) {
      return payload;
    }

    return request("/progress", {
      method: "POST",
      body: JSON.stringify(payload)
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

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "relatorio-rota-brasil.pdf";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    return true;
  }
};