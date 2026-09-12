import { GameState } from "./GameState.js";
import { GameMetrics } from "./GameMetrics.js";

const STORAGE_KEY =
  "rota-brasil-profiles-v3";

function normalizeNickname(
  nickname
) {
  return String(
    nickname || ""
  )
    .trim()
    .toLocaleLowerCase(
      "pt-BR"
    );
}

function createLocalId() {
  return `local-${globalThis.crypto?.randomUUID?.() || Date.now()}`;
}

export const ProgressManager = {
  validateNickname(nickname) {
    const value =
      String(nickname || "")
        .trim();

    if (
      value.length < 2 ||
      value.length > 15
    ) {
      return "Use um apelido com 2 a 15 caracteres.";
    }

    if (
      !/^[\p{L}\p{N} _-]+$/u.test(
        value
      )
    ) {
      return "Use apenas letras, números, espaço, _ ou -.";
    }

    return null;
  },

  getProfiles() {
    try {
      const raw =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!raw) {
        return [];
      }

      const profiles =
        JSON.parse(raw);

      return Array.isArray(
        profiles
      )
        ? profiles
        : [];
    } catch {
      return [];
    }
  },

  findProfilesByNickname(
    nickname
  ) {
    const normalized =
      normalizeNickname(
        nickname
      );

    return this.getProfiles()
      .filter(
        profile =>
          profile.nicknameNormalized ===
          normalized
      );
  },

  findProfileByNickname(
    nickname
  ) {
    return (
      this.findProfilesByNickname(
        nickname
      )[0] || null
    );
  },

  save() {
    const state =
      GameState.get();

    const profiles =
      this.getProfiles();

    const nickname =
      String(
        state.nickname ||
          "Explorador"
      ).trim();

    const nicknameNormalized =
      normalizeNickname(
        nickname
      );

    const playerId =
      state.playerId ||
      createLocalId();

    const profile = {
      playerId,
      nickname,
      nicknameNormalized,
      avatar:
        state.avatar || "ae",
      currentPhase:
        state.currentPhase,
      score:
        state.score,
      stars:
        state.stars,
      completedPhases:
        [
          ...state.completedPhases
        ],
      accessibility: {
        ...state.accessibility
      },
      updatedAt:
        new Date().toISOString()
    };

    const index =
      profiles.findIndex(
        item =>
          item.playerId ===
          playerId
      );

    if (index >= 0) {
      profiles[index] =
        profile;
    } else {
      profiles.push(
        profile
      );
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        profiles
      )
    );

    if (!state.playerId) {
      state.playerId =
        playerId;
    }

    return profile;
  },

  createNewProfile(
    nickname,
    playerId = null
  ) {
    const cleanNickname =
      String(
        nickname || ""
      ).trim();

    GameState.reset();

    GameState.setPlayer({
      nickname:
        cleanNickname,
      avatar: "ae",
      playerId:
        playerId ||
        createLocalId()
    });

    this.save();

    return GameState.get();
  },

  loadProfile(profile) {
    if (!profile) {
      return false;
    }

    GameState.hydrate({
      playerId:
        profile.playerId ||
        profile.id ||
        null,
      nickname:
        profile.nickname ||
        "",
      avatar:
        profile.avatar ||
        "ae",
      currentPhase:
        Number(
          profile.currentPhase ||
            1
        ),
      score:
        Number(
          profile.score || 0
        ),
      stars:
        Number(
          profile.stars || 0
        ),
      completedPhases:
        Array.isArray(
          profile.completedPhases
        )
          ? profile.completedPhases
          : [],
      accessibility:
        profile.accessibility
    });

    return true;
  },

  clearCurrentProfile() {
    const state =
      GameState.get();

    if (!state.playerId) {
      GameState.reset();
      return;
    }

    const profiles =
      this.getProfiles()
        .filter(
          profile =>
            profile.playerId !==
            state.playerId
        );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        profiles
      )
    );

    GameState.reset();
  },

  clearAll() {
    localStorage.removeItem(
      STORAGE_KEY
    );

    GameState.reset();
  },

  saveMetrics() {
    GameMetrics.save();
  }
};