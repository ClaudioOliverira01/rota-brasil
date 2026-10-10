const DEFAULT_STATE = {
  playerId: null,
  nickname: "",
  avatar: "ae",

  currentPhase: 1,

  score: 0,

  stars: 0,

  completedPhases: [],

  bonusCompleted: false,

  bonusSeal: null,

  accessibility: {
    narration: true,
    highContrast: false,
    reducedMotion: false,
    dyslexiaFont: false
  }
};

let state =
  structuredClone(
    DEFAULT_STATE
  );

export const GameState = {
  reset() {
    state =
      structuredClone(
        DEFAULT_STATE
      );
  },

  get() {
    return state;
  },

  hydrate(savedState) {
    state = {
      ...structuredClone(
        DEFAULT_STATE
      ),

      ...(savedState || {}),

      accessibility: {
        ...DEFAULT_STATE.accessibility,

        ...(savedState?.accessibility ||
          {})
      },

      completedPhases:
        Array.isArray(
          savedState?.completedPhases
        )
          ? [
              ...savedState.completedPhases
            ]
          : []
    };
  },

  setPlayer({
    nickname,
    avatar = "ae",
    playerId = null
  }) {
    state.nickname =
      String(
        nickname || ""
      ).trim();

    state.avatar =
      avatar || "ae";

    state.playerId =
      playerId;
  },

  addScore(points) {
    state.score +=
      Number(points) || 0;
  },

  addStar() {
    state.stars += 1;
  },

  completePhase(
    phaseId
  ) {
    if (
      !state.completedPhases.includes(
        phaseId
      )
    ) {
      state.completedPhases.push(
        phaseId
      );
    }

    state.currentPhase =
      Math.min(
        Number(
          phaseId
        ) + 1,
        4
      );
  },

  completeBonus(seal = "silver") {
    state.bonusCompleted = true;
    state.bonusSeal = seal;
  },

  /**
   * Junta o progresso vindo do servidor com o que já existe no aparelho.
   *
   * Regra: o progresso NUNCA regride. Se o servidor estiver atrasado
   * (por exemplo, o jogador jogou sem internet), vale o que for maior.
   * As opções de acessibilidade NÃO vêm do servidor: quem decide é o
   * aparelho (o que a criança escolheu no menu).
   */
  applyRemoteProgress(
    progress
  ) {
    if (!progress) {
      return;
    }

    const remotePhases =
      Array.isArray(
        progress.completedPhases
      )
        ? progress.completedPhases.map(Number)
        : [];

    state.completedPhases =
      [
        ...new Set([
          ...state.completedPhases.map(Number),
          ...remotePhases
        ])
      ].sort(
        (a, b) => a - b
      );

    state.currentPhase =
      Math.max(
        1,
        Math.min(
          4,
          Math.max(
            Number(
              state.currentPhase
            ) || 1,
            Number(
              progress.currentPhase
            ) || 1
          )
        )
      );

    state.score =
      Math.max(
        Number(state.score) || 0,
        Number(progress.score) || 0
      );

    state.stars =
      Math.max(
        Number(state.stars) || 0,
        Number(progress.stars) || 0
      );

    if (
      progress.nickname
    ) {
      state.nickname =
        progress.nickname;
    }

    if (
      progress.avatar
    ) {
      state.avatar =
        progress.avatar;
    }
  },

  setAccessibility(
    settings
  ) {
    state.accessibility =
      {
        ...state.accessibility,

        ...(settings || {})
      };
  }
};