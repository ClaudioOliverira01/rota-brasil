import Phaser from "phaser";
import { AccessibilityManager } from "../systems/AccessibilityManager.js";
import { GameState } from "../systems/GameState.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    /*
     * Carrega as configurações de acessibilidade
     * antes que qualquer outra cena seja apresentada.
     */
    const accessibility =
      AccessibilityManager.load();

    /*
     * Garante que o GameState utilize imediatamente
     * as configurações carregadas.
     */
    GameState.setAccessibility(
      accessibility
    );

    /*
     * Disponibiliza as configurações no Registry
     * do Phaser para as demais cenas.
     */
    this.registry.set(
      "accessibility",
      accessibility
    );

    /*
     * Pequena configuração visual inicial.
     */
    this.cameras.main.setBackgroundColor(
      "#dff6ee"
    );

    /*
     * Segue normalmente para o carregamento.
     */
    this.scene.start("PreloadScene");
  }
}