const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3333"
).replace(/\/$/, "");

const USE_MOCK =
    String(
        import.meta.env.VITE_USE_MOCK ?? "false"
    ) === "true";

const API_TIMEOUT = Number(
    import.meta.env.VITE_API_TIMEOUT || 8000
);

// =========================================================
// EVENTOS DA API
// =========================================================

function dispatchApiEvent(type, detail = {}) {

    window.dispatchEvent(
        new CustomEvent(
            `rota-brasil:api:${type}`,
            {
                detail
            }
        )
    );
}

// =========================================================
// REQUEST
// =========================================================

async function request(path, options = {}) {

    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => controller.abort(),
            API_TIMEOUT
        );

    try {

        const response =
            await fetch(
                `${API_BASE_URL}${path}`,
                {
                    ...options,

                    headers: {
                        "Content-Type":
                            "application/json",

                        ...(options.headers || {})
                    },

                    signal:
                        controller.signal
                }
            );

        let payload = null;

        try {

            payload =
                await response.json();

        } catch {

            payload = null;
        }

        if (!response.ok) {

            const errorMessage =
                payload?.mensagem ||
                payload?.erro ||
                payload?.error ||
                `Erro HTTP ${response.status}`;

            console.error(
                "[ApiService] Erro na requisição:",
                path,
                "status:",
                response.status,
                "payload:",
                payload
            );

            const error =
                new Error(errorMessage);

            error.status =
                response.status;

            error.payload =
                payload;

            throw error;
        }

        dispatchApiEvent(
            "success",
            {
                path,
                payload
            }
        );

        return payload;

    } catch (error) {

        dispatchApiEvent(
            "error",
            {
                path,
                error
            }
        );

        throw error;

    } finally {

        clearTimeout(timeout);
    }
}

// =========================================================
// MOCK
// =========================================================

function mockPlayer(payload) {

    return {

        id:
            `mock-${Date.now()}`,

        nickname:
            payload.nickname,

        avatar:
            payload.avatar || "ae"
    };
}

// =========================================================
// API SERVICE
// =========================================================

export const ApiService = {

    // =====================================================
    // CONFIGURAÇÃO
    // =====================================================

    get baseUrl() {

        return API_BASE_URL;
    },

    isMockEnabled() {

        return USE_MOCK;
    },

    // =====================================================
    // SAÚDE DA API
    // =====================================================

    async health() {

        if (USE_MOCK) {

            return {
                mensagem:
                    "API funcionando em modo mock."
            };
        }

        return request("/health");
    },

    // =====================================================
    // JOGADORES
    // =====================================================

    async createPlayer(payload) {

        if (USE_MOCK) {

            return mockPlayer(payload);
        }

        const response =
            await request(
                "/players",
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            nickname:
                                payload.nickname,

                            avatar:
                                payload.avatar || "ae"
                        })
                }
            );

        // O backend retorna:
        //
        // {
        //   mensagem: "...",
        //   jogador: {...}
        // }

        return response;
    },

    async getPlayerByNickname(nickname) {

        if (!nickname) {

            return null;
        }

        if (USE_MOCK) {

            return null;
        }

        return request(
            `/players/by-nickname/${encodeURIComponent(
                nickname
            )}`
        );
    },

    async getPlayer(playerId) {

        if (!playerId) {

            return null;
        }

        if (USE_MOCK) {

            return null;
        }

        return request(
            `/players/${encodeURIComponent(
                playerId
            )}`
        );
    },

    // =====================================================
    // PROGRESSO
    // =====================================================

    async getProgress(playerId) {

        if (!playerId) {

            return null;
        }

        if (USE_MOCK) {

            return null;
        }

        const response =
            await request(
                `/players/${encodeURIComponent(
                    playerId
                )}/progress`
            );

        return response;
    },

    async saveProgress(payload) {

        if (USE_MOCK) {

            return {
                progresso:
                    payload
            };
        }

        return request(
            "/progress",
            {
                method: "POST",

                body:
                    JSON.stringify({
                        playerId:
                            payload.playerId,

                        currentPhase:
                            payload.currentPhase ??
                            payload.current_phase ??
                            1,

                        score:
                            Number(
                                payload.score || 0
                            ),

                        stars:
                            Number(
                                payload.stars || 0
                            )
                    })
            }
        );
    },

    // =====================================================
    // RESULTADO DAS FASES
    // =====================================================

    async savePhaseResult(payload) {

        if (USE_MOCK) {

            return {
                resultado:
                    payload
            };
        }

        console.log(
            "[ApiService] Enviando resultado:",
            payload
        );

        return request(
            "/progress/phases",
            {
                method: "POST",

                body:
                    JSON.stringify({
                        playerId:
                            payload.playerId,

                        phase:
                            Number(
                                payload.phase || 1
                            ),

                        score:
                            Number(
                                payload.score || 0
                            ),

                        stars:
                            Number(
                                payload.stars || 0
                            ),

                        completed:
                            Boolean(
                                payload.completed
                            ),

                        timeSeconds:
                            payload.timeSeconds !==
                            undefined &&
                            payload.timeSeconds !== null
                                ? Number(
                                    payload.timeSeconds
                                )
                                : null
                    })
            }
        );
    },

    async getPhaseResults(playerId) {

        if (!playerId) {

            return null;
        }

        if (USE_MOCK) {

            return {

                mensagem:
                    "Resultados encontrados.",

                resultados:
                    []
            };
        }

        return request(
            `/players/${encodeURIComponent(
                playerId
            )}/phases`
        );
    },

    // =====================================================
    // RANKING
    // =====================================================

    async getRanking(limit = 10) {

        if (USE_MOCK) {

            return [];
        }

        return request(
            `/ranking?limit=${Math.max(
                1,
                Number(limit) || 10
            )}`
        );
    },

    // =====================================================
    // ESTATÍSTICAS
    // =====================================================

    async getPhaseStats() {

        if (USE_MOCK) {

            return {

                phases:
                    [],

                phaseWithMostErrors:
                    null
            };
        }

        return request(
            "/stats/phases"
        );
    }
};