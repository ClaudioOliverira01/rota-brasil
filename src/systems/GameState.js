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

  applyRemoteProgress(
    progress
  ) {
    if (!progress) {
      return;
    }

    state.currentPhase =
      Number(
        progress.currentPhase ||
          state.currentPhase
      );

    state.score =
      Number(
        progress.score ||
          0
      );

    state.stars =
      Number(
        progress.stars ||
          0
      );

    state.completedPhases =
      Array.isArray(
        progress.completedPhases
      )
        ? [
            ...progress.completedPhases
          ]
        : [];

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

    if (
      progress.accessibility
    ) {
      state.accessibility =
        {
          ...state.accessibility,

          ...progress.accessibility
        };
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