import Phaser from "phaser";

import { gameBridge, BRIDGE_EVENTS } from "../bridge/gameBridge.js";

/**
 * Substitui a antiga RankingScene dentro do Phaser (usa o MESMO nome,
 * "RankingScene", para que a tela de vitória e as outras cenas continuem
 * funcionando sem alteração).
 *
 * O ranking agora é uma tela em React: esta cena só avisa o React,
 * que mostra a tela nova e encerra o Phaser.
 */
export class BridgeRankingScene extends Phaser.Scene {
  constructor() {
    super("RankingScene");
  }

  create() {
    gameBridge.emit(BRIDGE_EVENTS.RANKING_REQUESTED);
  }
}