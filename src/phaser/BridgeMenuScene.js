import Phaser from "phaser";

import { gameBridge, BRIDGE_EVENTS } from "../bridge/gameBridge.js";

/**
 * Substitui a antiga MenuScene dentro do Phaser (usa o MESMO nome,
 * "MenuScene", para que nenhuma outra cena precise ser alterada).
 *
 *  1ª vez (logo após o carregamento): segue direto para a cena pedida
 *     pelo React (ex.: "ProfileScene" ou "RankingScene").
 *  Depois: qualquer cena que chamar scene.start("MenuScene") está pedindo
 *     para voltar ao menu, que agora é uma tela em React.
 */
export class BridgeMenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const entryScene = this.registry.get("entryScene");
    const entryConsumed = this.registry.get("entryConsumed");

    if (entryScene && !entryConsumed) {
      this.registry.set("entryConsumed", true);
      this.scene.start(entryScene);
      return;
    }

    gameBridge.emit(BRIDGE_EVENTS.MENU_REQUESTED);
  }
}