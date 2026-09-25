import { GameState } from "./GameState.js";

const DEFAULT_METRICS = {
    gameStartedAt: null,
    gameCompletedAt: null,
    totalTimeSeconds: 0,
    currentPhaseStartedAt: null,
    phases: {}
};

let metrics = structuredClone(DEFAULT_METRICS);

function getStorageKey() {

    const state = GameState.get();

    const playerId =
        state.playerId ||
        state.nickname ||
        "anonymous";

    return `rota-brasil-metrics-v2-${String(playerId)
        .trim()
        .toLowerCase()}`;
}

export const GameMetrics = {

    get() {

        return metrics;
    },

    hydrate(savedMetrics) {

        metrics = {

            ...structuredClone(
                DEFAULT_METRICS
            ),

            ...(savedMetrics || {}),

            phases: {

                ...(savedMetrics?.phases || {})
            }
        };
    },

    startGame() {

        if (!metrics.gameStartedAt) {

            metrics.gameStartedAt =
                new Date().toISOString();
        }

        metrics.gameCompletedAt =
            null;

        this.save();
    },

    /*
     * Cada vez que uma fase começa é uma NOVA tentativa.
     *
     * Por isso os contadores (erros, tentativas, pontos e tempo)
     * são zerados aqui. Assim, o que a fase envia ao backend e o que
     * a tela de vitória mostra é sempre o desta partida, e não a soma
     * de todas as vezes que o jogador já jogou a fase.
     */
    startPhase(phase) {

        const now =
            new Date().toISOString();

        metrics.currentPhaseStartedAt =
            now;

        metrics.phases[phase] = {

            errors: 0,

            attempts: 0,

            timeSeconds: 0,

            score: 0,

            startedAt:
                now,

            completedAt:
                null
        };

        this.save();
    },

    registerAttempt(phase) {

        this.ensurePhase(phase);

        metrics.phases[phase].attempts += 1;

        this.save();
    },

    registerError(phase) {

        this.ensurePhase(phase);

        metrics.phases[phase].errors += 1;

        this.save();
    },

    addScore(phase, points) {

        this.ensurePhase(phase);

        metrics.phases[phase].score +=
            Number(points) || 0;

        this.save();
    },

    completePhase(
        phase,
        score = 0
    ) {

        this.ensurePhase(phase);

        const phaseData =
            metrics.phases[phase];

        phaseData.completedAt =
            new Date().toISOString();

        phaseData.timeSeconds =
            this.calculatePhaseTime(
                phaseData
            );

        phaseData.score =
            Number(score) || 0;

        metrics.currentPhaseStartedAt =
            null;

        this.save();
    },

    completeGame() {

        if (
            !metrics.gameStartedAt
        ) {

            return;
        }

        metrics.gameCompletedAt =
            new Date().toISOString();

        metrics.totalTimeSeconds =
            this.calculateTotalTime();

        this.save();
    },

    calculatePhaseTime(
        phaseData
    ) {

        if (
            !phaseData?.startedAt
        ) {

            return 0;
        }

        const end =
            phaseData.completedAt
                ? new Date(
                    phaseData.completedAt
                ).getTime()
                : Date.now();

        const start =
            new Date(
                phaseData.startedAt
            ).getTime();

        return Math.max(
            0,
            Math.floor(
                (end - start) / 1000
            )
        );
    },

    calculateTotalTime() {

        if (
            !metrics.gameStartedAt
        ) {

            return 0;
        }

        const end =
            metrics.gameCompletedAt
                ? new Date(
                    metrics.gameCompletedAt
                ).getTime()
                : Date.now();

        const start =
            new Date(
                metrics.gameStartedAt
            ).getTime();

        return Math.max(
            0,
            Math.floor(
                (end - start) / 1000
            )
        );
    },

    getCurrentTime() {

        return this.calculateTotalTime();
    },

    getPhaseWithMostErrors() {

        const phases =
            Object.entries(
                metrics.phases
            );

        if (
            !phases.length
        ) {

            return null;
        }

        phases.sort(
            (a, b) =>
                b[1].errors -
                a[1].errors
        );

        return {

            phase:
                Number(
                    phases[0][0]
                ),

            errors:
                phases[0][1].errors
        };
    },

    /*
     * Estrelas de uma fase, pela quantidade de erros:
     *   0 erros  -> 3 estrelas
     *   1 a 2    -> 2 estrelas
     *   3 ou mais -> 1 estrela
     *
     * É a mesma regra que a Fase 2 já usava.
     */
    starsForErrors(errors) {

        const total =
            Math.max(
                0,
                Number(errors) || 0
            );

        if (total === 0) {

            return 3;
        }

        if (total <= 2) {

            return 2;
        }

        return 1;
    },

    formatTime(seconds) {

        const total =
            Math.max(
                0,
                Number(seconds) || 0
            );

        const hours =
            Math.floor(
                total / 3600
            );

        const minutes =
            Math.floor(
                (total % 3600) / 60
            );

        const secs =
            total % 60;

        if (
            hours > 0
        ) {

            return `${hours}h ${String(
                minutes
            ).padStart(2, "0")}min ${String(
                secs
            ).padStart(2, "0")}s`;
        }

        return `${minutes}min ${String(
            secs
        ).padStart(2, "0")}s`;
    },

    ensurePhase(phase) {

        if (
            !metrics.phases[phase]
        ) {

            metrics.phases[phase] = {

                errors: 0,

                attempts: 0,

                timeSeconds: 0,

                score: 0,

                startedAt:
                    new Date().toISOString(),

                completedAt:
                    null
            };
        }
    },

    save() {

        try {

            localStorage.setItem(
                getStorageKey(),
                JSON.stringify(
                    metrics
                )
            );

            return metrics;

        } catch (error) {

            console.warn(
                "Não foi possível salvar métricas:",
                error
            );

            return null;
        }
    },

    load() {

        try {

            const raw =
                localStorage.getItem(
                    getStorageKey()
                );

            if (
                !raw
            ) {

                return null;
            }

            const saved =
                JSON.parse(raw);

            this.hydrate(
                saved
            );

            return metrics;

        } catch {

            return null;
        }
    },

    reset() {

        metrics =
            structuredClone(
                DEFAULT_METRICS
            );

        localStorage.removeItem(
            getStorageKey()
        );
    }
};