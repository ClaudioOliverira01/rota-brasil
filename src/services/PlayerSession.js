import { ApiService } from "./ApiService.js";
import { GameState } from "../systems/GameState.js";
import { GameMetrics } from "../systems/GameMetrics.js";
import { ProgressManager } from "../systems/ProgressManager.js";

/**
 * Regras de "quem está jogando": identificar o jogador pelo apelido,
 * continuar ou recomeçar uma aventura e preparar o início do jogo.
 *
 * Arquivo SEM React: as telas (Perfil e Avatar) só chamam estas funções.
 */

export const IDENTIFY = Object.freeze({
  NEW_PLAYER: "new",
  EXISTING_PLAYER: "existing",
  NICKNAME_TAKEN: "taken",
  INVALID: "invalid"
});

const TAKEN_MESSAGE = "Esse apelido já está sendo utilizado. Tente outro.";

function isLocalId(playerId) {
  return String(playerId || "").startsWith("local-");
}

/**
 * Perfis salvos trazem as opções de acessibilidade da última vez que o
 * jogo foi salvo. Mas quem decide é o APARELHO: o que a criança escolheu
 * agora no menu (contraste, movimento, fonte...) tem prioridade.
 */
async function withDeviceAccessibility(run) {
  const device = { ...GameState.get().accessibility };

  try {
    return await run();
  } finally {
    GameState.setAccessibility(device);
  }
}

function existing(profile) {
  return { kind: IDENTIFY.EXISTING_PLAYER, profile };
}

async function findRemotePlayer(nickname) {
  if (ApiService.isMockEnabled()) {
    return null;
  }

  try {
    return await ApiService.getPlayerByNickname(nickname);
  } catch (error) {
    // 404 = o jogador ainda não existe. Qualquer outro erro é falha real.
    if (error.status !== 404) {
      throw error;
    }

    return null;
  }
}

async function loadRemoteProgress(playerId) {
  if (!playerId || isLocalId(playerId) || ApiService.isMockEnabled()) {
    return;
  }

  try {
    const progress = await ApiService.getProgress(playerId);

    GameState.applyRemoteProgress(progress);
    ProgressManager.save();
    GameMetrics.load();
  } catch (error) {
    console.warn("Não foi possível carregar o progresso remoto.", error);
  }
}

/**
 * Jogador que já existe no servidor. Se este aparelho também tem um perfil
 * dele, os dois são juntados (vale o que for maior) em vez de um apagar
 * o outro.
 */
async function openRemotePlayer(player, nickname) {
  const playerId = player?.id || player?.playerId;
  const remoteNickname = player?.nickname || nickname;
  const progress = player?.progress || (await ApiService.getProgress(playerId));

  const local = ProgressManager.findProfileByNickname(remoteNickname);

  const base =
    local && local.playerId === playerId
      ? local
      : { playerId, nickname: remoteNickname, avatar: player?.avatar || "ae" };

  ProgressManager.loadProfile(base);
  GameState.applyRemoteProgress({ ...progress, nickname: remoteNickname });

  const profile = ProgressManager.save();

  GameMetrics.load();

  return profile;
}

async function openLocalProfileOnline(localProfile, nickname) {
  ProgressManager.loadProfile(localProfile);

  await loadRemoteProgress(localProfile.playerId);

  return ProgressManager.findProfileByNickname(nickname) || localProfile;
}

async function createServerPlayer(nickname) {
  const player = await ApiService.createPlayer({ nickname, avatar: "ae" });

  // A API pode responder em formatos diferentes.
  const playerId = player?.jogador?.id || player?.id;

  ProgressManager.createNewProfile(nickname, playerId || null);
  GameMetrics.reset();
  GameMetrics.startGame();

  return { kind: IDENTIFY.NEW_PLAYER };
}

/**
 * Sem conexão com o servidor: o jogo continua com o perfil deste aparelho.
 */
function openOrCreateOffline(nickname) {
  const localProfile = ProgressManager.findProfileByNickname(nickname);

  if (localProfile) {
    ProgressManager.loadProfile(localProfile);
    GameMetrics.load();

    return existing(localProfile);
  }

  ProgressManager.createNewProfile(nickname, null);
  GameMetrics.reset();
  GameMetrics.startGame();

  return { kind: IDENTIFY.NEW_PLAYER };
}

async function lookupOrCreate(nickname) {
  try {
    const remotePlayer = await findRemotePlayer(nickname);

    if (remotePlayer) {
      return existing(await openRemotePlayer(remotePlayer, nickname));
    }

    const localProfile = ProgressManager.findProfileByNickname(nickname);

    if (localProfile && !isLocalId(localProfile.playerId)) {
      return existing(await openLocalProfileOnline(localProfile, nickname));
    }

    return await createServerPlayer(nickname);
  } catch (error) {
    if (error.status === 409) {
      return { kind: IDENTIFY.NICKNAME_TAKEN, message: TAKEN_MESSAGE };
    }

    console.warn("API indisponível. Usando perfil local.", error);

    return openOrCreateOffline(nickname);
  }
}

/**
 * Identifica o jogador pelo apelido.
 * Devolve { kind, profile? , message? }.
 */
export async function identifyPlayer(rawNickname) {
  const nickname = String(rawNickname || "").trim();
  const validationError = ProgressManager.validateNickname(nickname);

  if (validationError) {
    return { kind: IDENTIFY.INVALID, message: validationError };
  }

  return withDeviceAccessibility(() => lookupOrCreate(nickname));
}

/**
 * "CONTINUAR AVENTURA": carrega o perfil encontrado.
 */
export async function continueAdventure(profile) {
  await withDeviceAccessibility(async () => {
    ProgressManager.loadProfile(profile);
    GameMetrics.load();
  });
}

/**
 * "COMEÇAR DO ZERO": apaga o progresso deste perfil, mantendo o mesmo
 * jogador (mesmo playerId), e avisa o servidor com reset: true. Sem esse
 * aviso, o servidor guardaria o maior progresso e a aventura "voltaria".
 */
export async function restartFromZero(profile) {
  await withDeviceAccessibility(async () => {
    ProgressManager.loadProfile(profile);
    ProgressManager.clearCurrentProfile();
    ProgressManager.createNewProfile(profile.nickname, profile.playerId || null);

    GameMetrics.reset();
    GameMetrics.startGame();
  });

  try {
    await ApiService.saveProgress({
      playerId: profile.playerId,
      reset: true
    });
  } catch (error) {
    console.warn("Não foi possível reiniciar o progresso no servidor.", error);
  }
}

/**
 * Cena do Phaser em que o jogo deve continuar, conforme a fase atual.
 */
export function entrySceneForPhase(phase) {
  const current = Number(phase) || 1;

  if (current <= 1) {
    return "StoryScene";
  }

  if (current === 2) {
    return "Phase2Scene";
  }

  if (current === 3) {
    return "Phase3Scene";
  }

  return "Phase4Scene";
}

/**
 * Último passo antes de jogar: grava o avatar escolhido e devolve a cena
 * em que o Phaser deve começar.
 */
export async function beginAdventure(avatarId) {
  const state = GameState.get();

  GameState.setPlayer({
    nickname: state.nickname || "Explorador",
    avatar: avatarId,
    playerId: state.playerId
  });

  ProgressManager.save();
  GameMetrics.load();

  try {
    await ApiService.saveProgress({ playerId: GameState.get().playerId });
  } catch (error) {
    console.warn("Não foi possível sincronizar o avatar/progresso.", error);
  }

  return entrySceneForPhase(GameState.get().currentPhase);
}