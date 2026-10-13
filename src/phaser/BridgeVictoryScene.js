import Phaser from "phaser";

import { gameBridge, BRIDGE_EVENTS } from "../bridge/gameBridge.js";

/**
 * Substitui a antiga VictoryScene dentro do Phaser (usa o MESMO nome,
 * "VictoryScene", para que as fases e o bônus continuem chamando
 * scene.start("VictoryScene", ...) sem nenhuma alteração).
 *
 * A bússola e a vitória agora são telas em React: esta cena só avisa o
 * React, levando os dados da fase ({ phase, final, bonus }).
 */
export class BridgeVictoryScene extends Phaser.Scene {
  constructor() {
    super("VictoryScene");
  }

  create(data = {}) {
    gameBridge.emit(BRIDGE_EVENTS.VICTORY_REQUESTED, data);
  }
}