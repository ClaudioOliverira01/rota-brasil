import Phaser from "phaser";
import "./styles.css";

import {
  GAME_WIDTH,
  GAME_HEIGHT
} from "./config/gameConfig.js";

import { BootScene } from "./scenes/BootScene.js";
import { PreloadScene } from "./scenes/PreloadScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { ProfileScene } from "./scenes/ProfileScene.js";
import { AvatarScene } from "./scenes/AvatarScene.js";
import { StoryScene } from "./scenes/StoryScene.js";
import { Phase1Scene } from "./scenes/Phase1Scene.js";
import Phase2Scene from "./scenes/Phase2Scene.js";
import { Phase3Scene } from "./scenes/Phase3Scene.js";
import { Phase4Scene } from "./scenes/Phase4Scene.js";
import { VictoryScene } from "./scenes/VictoryScene.js";
import { RankingScene } from "./scenes/RankingScene.js";

const config = {
  type: Phaser.AUTO,

  width:
    GAME_WIDTH,

  height:
    GAME_HEIGHT,

  parent:
    "game-container",

  backgroundColor:
    "#dff6ee",

  render: {
    antialias:
      true,

    roundPixels:
      true
  },

  scale: {
    mode:
      Phaser.Scale.FIT,

    autoCenter:
      Phaser.Scale.CENTER_BOTH,

    width:
      GAME_WIDTH,

    height:
      GAME_HEIGHT,

    min: {
      width:
        800,

      height:
        450
    }
  },

  input: {
    activePointers:
      3
  },

  scene: [
    BootScene,

    PreloadScene,

    MenuScene,

    ProfileScene,

    AvatarScene,

    StoryScene,

    Phase1Scene,

    Phase2Scene,

    Phase3Scene,

    Phase4Scene,
    
    VictoryScene,

    RankingScene
  ]
};

new Phaser.Game(
  config
);