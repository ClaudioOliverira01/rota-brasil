import Phaser from "phaser";

import {
  GAME_WIDTH,
  GAME_HEIGHT
} from "../config/gameConfig.js";

import { BootScene } from "../scenes/BootScene.js";
import { PreloadScene } from "../scenes/PreloadScene.js";
import { BridgeMenuScene } from "./BridgeMenuScene.js";
import { StoryScene } from "../scenes/StoryScene.js";
import { Phase1Scene } from "../scenes/Phase1Scene.js";
import Phase2Scene from "../scenes/Phase2Scene.js";
import { Phase3Scene } from "../scenes/Phase3Scene.js";
import { Phase4Scene } from "../scenes/Phase4Scene.js";
import { BonusScene } from "../scenes/BonusScene.js";
import { CompassTransitionScene } from "../scenes/CompassTransitionScene.js";
import { VictoryScene } from "../scenes/VictoryScene.js";
import { BridgeRankingScene } from "./BridgeRankingScene.js";

/**
 * Cria o jogo Phaser dentro do elemento recebido.
 * Arquivo sem React: quem decide QUANDO criar e destruir o jogo
 * é o componente PhaserStage.
 *
 * Menu, Perfil, Avatar e Ranking são telas em React. O Phaser cuida só
 * da história e das fases.
 *
 * entryScene: cena em que o jogo deve começar depois do carregamento
 * (StoryScene ou a fase em que o jogador parou).
 */
export function createGame(parent, { entryScene = "StoryScene" } = {}) {
  return new Phaser.Game({
    type: Phaser.AUTO,

    callbacks: {
      preBoot: game => {
        game.registry.set("entryScene", entryScene);
        game.registry.set("entryConsumed", false);
      }
    },

    width: GAME_WIDTH,
    height: GAME_HEIGHT,

    parent,

    backgroundColor: "#dff6ee",

    render: {
      antialias: true,
      roundPixels: true
    },

    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      min: {
        width: 800,
        height: 450
      }
    },

    input: {
      activePointers: 3
    },

    scene: [
      BootScene,
      PreloadScene,
      BridgeMenuScene,
      StoryScene,
      Phase1Scene,
      Phase2Scene,
      Phase3Scene,
      Phase4Scene,
      BonusScene,
      CompassTransitionScene,
      VictoryScene,
      BridgeRankingScene
    ]
  });
}