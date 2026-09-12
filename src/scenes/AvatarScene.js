import Phaser from "phaser";

import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH
} from "../config/gameConfig.js";

import { AVATARS } from "../data/gameData.js";
import { GameState } from "../systems/GameState.js";
import { GameMetrics } from "../systems/GameMetrics.js";
import { ProgressManager } from "../systems/ProgressManager.js";
import { AudioManager } from "../systems/AudioManager.js";
import { ApiService } from "../services/ApiService.js";

export class AvatarScene extends Phaser.Scene {
  constructor() {
    super("AvatarScene");

    this.selectedAvatar =
      "ae";

    this.avatarCards = [];
  }

  create() {
    this.selectedAvatar =
      GameState.get().avatar ||
      "ae";

    this.drawBackground();
    this.createTitle();
    this.createAvatarCards();
    this.createNicknameField();
    this.createContinueButton();

    AudioManager.speak(
      "Prepare sua expedição! Escolha seu companheiro e continue a aventura."
    );
  }

  drawBackground() {
    this.cameras.main.setBackgroundColor(
      COLORS.skyLight
    );

    const g =
      this.add.graphics();

    g.fillStyle(
      COLORS.sky,
      1
    );

    g.fillRect(
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    g.fillStyle(
      COLORS.map,
      1
    );

    g.fillCircle(
      90,
      690,
      220
    );

    g.fillCircle(
      1190,
      690,
      250
    );

    g.fillStyle(
      COLORS.leaf,
      1
    );

    for (
      let i = 0;
      i < 16;
      i += 1
    ) {
      g.fillCircle(
        25 + i * 82,
        705 +
          (i % 2) * 7,
        42
      );
    }
  }

  createTitle() {
    this.add
      .text(
        GAME_WIDTH / 2,
        62,
        "PREPARE SUA EXPEDIÇÃO",
        {
          fontFamily:
            "Arial",
          fontSize: "38px",
          fontStyle:
            "bold",
          color:
            "#07543d"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        108,
        "Escolha seu companheiro de aventura",
        {
          fontFamily:
            "Arial",
          fontSize: "20px",
          color:
            "#18332c"
        }
      )
      .setOrigin(0.5);
  }

  createAvatarCards() {
    const startX =
      430;

    const y =
      240;

    AVATARS.forEach(
      (
        avatar,
        index
      ) => {
        const x =
          startX +
          index * 210;

        const card =
          this.add
            .rectangle(
              x,
              y,
              180,
              190,
              COLORS.card
            )
            .setStrokeStyle(
              5,
              index === 0
                ? COLORS.forest
                : 0xc9ded6
            )
            .setInteractive({
              useHandCursor: true
            });

        card.setData(
          "avatarId",
          avatar.id
        );

        this.avatarCards.push(
          card
        );

        this.add
          .text(
            x,
            y - 45,
            avatar.emoji,
            {
              fontFamily:
                "Arial",
              fontSize:
                "64px"
            }
          )
          .setOrigin(0.5);

        this.add
          .text(
            x,
            y + 38,
            avatar.name,
            {
              fontFamily:
                "Arial",
              fontSize:
                "23px",
              fontStyle:
                "bold",
              color:
                "#07543d"
            }
          )
          .setOrigin(0.5);

        this.add
          .text(
            x,
            y + 72,
            avatar.description,
            {
              fontFamily:
                "Arial",
              fontSize:
                "15px",
              color:
                "#5d756e",
              align:
                "center",
              wordWrap: {
                width: 150
              }
            }
          )
          .setOrigin(0.5);

        card.on(
          "pointerover",
          () =>
            card.setScale(
              1.03
            )
        );

        card.on(
          "pointerout",
          () =>
            card.setScale(
              1
            )
        );

        card.on(
          "pointerdown",
          () => {
            this.selectedAvatar =
              avatar.id;

            this.avatarCards.forEach(
              item => {
                item.setStrokeStyle(
                  5,
                  item === card
                    ? COLORS.forest
                    : 0xc9ded6
                );
              }
            );

            AudioManager.speak(
              `${avatar.name}, ${avatar.description}.`
            );
          }
        );
      }
    );
  }

  createNicknameField() {
    const nickname =
      GameState.get()
        .nickname ||
      "Explorador";

    this.add
      .text(
        GAME_WIDTH / 2,
        395,
        `Seu apelido: ${nickname}`,
        {
          fontFamily:
            "Arial",
          fontSize:
            "24px",
          fontStyle:
            "bold",
          color:
            "#18332c",
          align:
            "center"
        }
      )
      .setOrigin(0.5);
  }

  createContinueButton() {
    const shadow =
      this.add.rectangle(
        646,
        548,
        340,
        66,
        0x000000,
        0.15
      );

    const button =
      this.add
        .rectangle(
          640,
          540,
          340,
          66,
          COLORS.forest
        )
        .setStrokeStyle(
          3,
          COLORS.white
        )
        .setInteractive({
          useHandCursor: true
        });

    const text =
      this.add
        .text(
          640,
          540,
          "CONTINUAR →",
          {
            fontFamily:
              "Arial",
            fontSize:
              "25px",
            fontStyle:
              "bold",
            color:
              "#ffffff"
          }
        )
        .setOrigin(0.5);

    button.on(
      "pointerover",
      () => {
        button.setScale(
          1.03
        );

        text.setScale(
          1.03
        );

        shadow.setScale(
          1.03
        );
      }
    );

    button.on(
      "pointerout",
      () => {
        button.setScale(
          1
        );

        text.setScale(
          1
        );

        shadow.setScale(
          1
        );
      }
    );

    button.on(
      "pointerdown",
      () =>
        this.startAdventure()
    );
  }

  async startAdventure() {
    if (this.starting) {
      return;
    }

    this.starting =
      true;

    const state =
      GameState.get();

    const nickname =
      state.nickname ||
      "Explorador";

    try {
      let playerId =
        state.playerId;

      if (
        !playerId ||
        String(
          playerId
        ).startsWith(
          "local-"
        )
      ) {
        const player =
          await ApiService.createPlayer(
            {
              nickname,
              avatar:
                this.selectedAvatar
            }
          );

        playerId =
          player?.jogador?.id ||
          player?.id;
      }

      GameState.setPlayer({
        nickname,
        avatar:
          this.selectedAvatar,
        playerId:
          playerId ||
          state.playerId
      });

      ProgressManager.save();

      GameMetrics.startGame();

      await ApiService.saveProgress(
        {
          ...GameState.get(),
          metrics:
            GameMetrics.get()
        }
      );
    } catch (error) {
      console.warn(
        "API indisponível. Mantendo progresso local.",
        error
      );

      GameState.setPlayer({
        nickname,
        avatar:
          this.selectedAvatar,
        playerId:
          state.playerId ||
          `local-${Date.now()}`
      });

      ProgressManager.save();

      GameMetrics.startGame();
    }

    AudioManager.speak(
      `Olá, ${nickname}! A aventura de Aê está começando.`
    );

    const phase =
      GameState.get()
        .currentPhase;

    if (phase <= 1) {
      this.scene.start(
        "StoryScene"
      );
    } else if (
      phase === 2
    ) {
      this.scene.start(
        "Phase2Scene"
      );
    } else if (
      phase === 3
    ) {
      this.scene.start(
        "Phase3Scene"
      );
    } else {
      this.scene.start(
        "Phase4Scene"
      );
    }
  }
}