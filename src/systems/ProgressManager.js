import { GameState } from "./GameState.js";
import { GameMetrics } from "./GameMetrics.js";

const STORAGE_KEY = "rota-brasil-profiles-v3";


function normalizeNickname(nickname) {
  return String(nickname || "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}


export const ProgressManager = {

  validateNickname(nickname) {

    const value =
      String(nickname || "").trim();

    if (
      value.length < 2 ||
      value.length > 15
    ) {
      return "Use um apelido com 2 a 15 caracteres.";
    }

    if (
      !/^[\p{L}\p{N} _-]+$/u.test(value)
    ) {
      return "Use apenas letras, números, espaço, _ ou - .";
    }

    return null;
  },


  getProfiles() {

    try {

      const raw =
        localStorage.getItem(
          STORAGE_KEY
        );

      const profiles =
        raw
          ? JSON.parse(raw)
          : [];

      return Array.isArray(profiles)
        ? profiles
        : [];

    } catch {

      return [];

    }
  },


  findProfileByNickname(nickname) {

    const normalized =
      normalizeNickname(
        nickname
      );

    return this
      .getProfiles()
      .find(
        profile =>
          profile.nicknameNormalized ===
          normalized
      ) || null;
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


    /*
     * Mantém o ID existente.
     *
     * Só cria um novo ID quando realmente
     * não existe nenhum.
     */
    const playerId =
      state.playerId ||
      `local-${
        globalThis.crypto?.randomUUID?.() ||
        Date.now()
      }`;


    const profile = {

      playerId,

      nickname,

      nicknameNormalized,

      avatar:
        state.avatar || "ae",

      currentPhase:
        Number(
          state.currentPhase || 1
        ),

      score:
        Number(
          state.score || 0
        ),

      stars:
        Number(
          state.stars || 0
        ),

      completedPhases:
        Array.isArray(
          state.completedPhases
        )
          ? [
              ...state.completedPhases
            ]
          : [],

      accessibility: {

        narration:
          state.accessibility?.narration ??
          true,

        highContrast:
          state.accessibility?.highContrast ??
          false,

        reducedMotion:
          state.accessibility?.reducedMotion ??
          false

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
      JSON.stringify(profiles)
    );


    /*
     * Atualiza o ID no estado global.
     */
    if (
      !state.playerId
    ) {

      state.playerId =
        playerId;

    }


    /*
     * Salva métricas localmente.
     */
    GameMetrics.save();


    return profile;
  },


  loadProfile(profile) {

    if (!profile) {
      return false;
    }


    GameState.hydrate(
      profile
    );


    GameMetrics.load();


    return true;
  },


  createNewProfile(
    nickname,
    playerId = null
  ) {

    const cleanNickname =
      String(
        nickname || ""
      ).trim();


    /*
     * IMPORTANTE:
     *
     * Guarda as configurações de acessibilidade
     * antes de resetar o estado.
     *
     * Isso impede que a criança desligue a narração
     * e ela volte a ligar quando o apelido for criado.
     */
    const previousAccessibility = {

      ...(
        GameState.get()
          .accessibility || {}
      )

    };


    /*
     * Cria o estado inicial.
     */
    GameState.reset();


    /*
     * Restaura as configurações de acessibilidade.
     */
    GameState.setAccessibility({

      narration:
        previousAccessibility.narration ??
        true,

      highContrast:
        previousAccessibility.highContrast ??
        false,

      reducedMotion:
        previousAccessibility.reducedMotion ??
        false

    });


    /*
     * Define o jogador.
     */
    GameState.setPlayer({

      nickname:
        cleanNickname,

      avatar:
        "ae",

      playerId

    });


    /*
     * Salva o perfil.
     */
    this.save();


    /*
     * Inicia as métricas da aventura.
     */
    GameMetrics.reset();

    GameMetrics.startGame();


    /*
     * Salva novamente depois de iniciar
     * as métricas.
     */
    this.save();


    return GameState.get();
  },


  clearCurrentProfile() {

    const state =
      GameState.get();


    const profiles =
      this
        .getProfiles()
        .filter(
          profile =>
            profile.playerId !==
            state.playerId
        );


    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(profiles)
    );


    /*
     * Remove as métricas locais
     * desse jogador.
     */
    localStorage.removeItem(
      `rota-brasil-metrics-v2-${
        String(
          state.playerId ||
          state.nickname
        )
          .trim()
          .toLowerCase()
      }`
    );


    GameState.reset();

    GameMetrics.reset();
  },


  clearAll() {

    localStorage.removeItem(
      STORAGE_KEY
    );


    GameState.reset();

    GameMetrics.reset();
  }

};