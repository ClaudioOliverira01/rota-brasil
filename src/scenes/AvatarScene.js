import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.js";
import { AVATARS } from "../data/gameData.js";
import { GameState } from "../systems/GameState.js";
import { ProgressManager } from "../systems/ProgressManager.js";
import { GameMetrics } from "../systems/GameMetrics.js";
import { AudioManager } from "../systems/AudioManager.js";
import { ApiService } from "../services/ApiService.js";

export class AvatarScene extends Phaser.Scene {
  constructor() {
    super("AvatarScene");

    this.selectedAvatar = "ae";
    this.avatarCards = [];
    this.starting = false;
  }

  create() {
    const state = GameState.get();

    this.selectedAvatar = state.avatar || "ae";
    this.avatarCards = [];
    this.starting = false;

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
    this.cameras.main.setBackgroundColor(COLORS.skyLight);

    const graphics = this.add.graphics();

    // Céu
    graphics.fillStyle(COLORS.sky, 1);
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Elementos de chão
    graphics.fillStyle(COLORS.map, 1);

    graphics.fillCircle(90, 690, 220);
    graphics.fillCircle(1190, 690, 250);

    // Folhagens
    graphics.fillStyle(COLORS.leaf, 1);

    for (let i = 0; i < 16; i += 1) {
      graphics.fillCircle(
        25 + i * 82,
        705 + (i % 2) * 7,
        42
      );
    }

    // Pequenos detalhes decorativos
    graphics.fillStyle(0xffffff, 0.45);

    graphics.fillCircle(105, 95, 22);
    graphics.fillCircle(135, 85, 30);
    graphics.fillCircle(170, 98, 22);

    graphics.fillCircle(1060, 100, 24);
    graphics.fillCircle(1095, 90, 32);
    graphics.fillCircle(1135, 102, 24);
  }

  createTitle() {
    this.add.text(
      GAME_WIDTH / 2,
      62,
      "PREPARE SUA EXPEDIÇÃO",
      {
        fontFamily: "Arial",
        fontSize: "38px",
        fontStyle: "bold",
        color: "#07543d"
      }
    ).setOrigin(0.5);

    this.add.text(
      GAME_WIDTH / 2,
      108,
      "Escolha seu companheiro de aventura",
      {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#18332c"
      }
    ).setOrigin(0.5);
  }

  createAvatarCards() {
    const startX = 430;
    const y = 240;

    AVATARS.forEach((avatar, index) => {
      const x = startX + index * 210;

      const selected = avatar.id === this.selectedAvatar;

      // Sombra
      const shadow = this.add.rectangle(
        x + 5,
        y + 7,
        180,
        190,
        0x000000,
        0.12
      );

      // Card
      const card = this.add.rectangle(
        x,
        y,
        180,
        190,
        COLORS.card
      )
        .setStrokeStyle(
          5,
          selected ? COLORS.forest : 0xc9ded6
        )
        .setInteractive({
          useHandCursor: true
        });

      this.avatarCards.push(card);

      // Emoji
      this.add.text(
        x,
        y - 45,
        avatar.emoji,
        {
          fontFamily: "Arial",
          fontSize: "64px"
        }
      ).setOrigin(0.5);

      // Nome
      this.add.text(
        x,
        y + 38,
        avatar.name,
        {
          fontFamily: "Arial",
          fontSize: "23px",
          fontStyle: "bold",
          color: "#07543d"
        }
      ).setOrigin(0.5);

      // Descrição
      this.add.text(
        x,
        y + 72,
        avatar.description,
        {
          fontFamily: "Arial",
          fontSize: "15px",
          color: "#5d756e",
          align: "center",
          wordWrap: {
            width: 150
          }
        }
      ).setOrigin(0.5);

      // Interações
      card.on("pointerover", () => {
        card.setScale(1.03);
        shadow.setScale(1.03);
      });

      card.on("pointerout", () => {
        card.setScale(1);
        shadow.setScale(1);
      });

      card.on("pointerdown", () => {
        this.selectedAvatar = avatar.id;

        this.avatarCards.forEach(item => {
          item.setStrokeStyle(
            5,
            item === card
              ? COLORS.forest
              : 0xc9ded6
          );
        });

        // Som real do animal; a fala só entra depois, para não cobrir o som.
        AudioManager.stop();
        AudioManager.playAnimalSound(avatar.sound, avatar.id);

        this.time.delayedCall(1400, () => {
          if (this.selectedAvatar === avatar.id) {
            AudioManager.speak(
              `${avatar.name}, ${avatar.description}.`
            );
          }
        });
      });
    });
  }

  createNicknameField() {
    const state = GameState.get();

    const nickname = state.nickname || "Explorador";

    this.add.text(
      GAME_WIDTH / 2,
      395,
      `Seu apelido: ${nickname}`,
      {
        fontFamily: "Arial",
        fontSize: "24px",
        fontStyle: "bold",
        color: "#18332c"
      }
    ).setOrigin(0.5);
  }

  createContinueButton() {
    // Sombra do botão
    const shadow = this.add.rectangle(
      GAME_WIDTH / 2 + 6,
      548,
      340,
      66,
      0x000000,
      0.15
    );

    // Botão
    const button = this.add.rectangle(
      GAME_WIDTH / 2,
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

    // Texto
    const text = this.add.text(
      GAME_WIDTH / 2,
      540,
      "CONTINUAR  →",
      {
        fontFamily: "Arial",
        fontSize: "25px",
        fontStyle: "bold",
        color: "#ffffff"
      }
    ).setOrigin(0.5);

    // Mouse em cima
    button.on("pointerover", () => {
      button.setScale(1.03);
      text.setScale(1.03);
      shadow.setScale(1.03);
    });

    // Mouse fora
    button.on("pointerout", () => {
      button.setScale(1);
      text.setScale(1);
      shadow.setScale(1);
    });

    // Clique
    button.on("pointerdown", () => {
      this.startAdventure();
    });
  }

  async startAdventure() {
    // Impede dois cliques rápidos iniciarem duas cenas
    if (this.starting) {
      return;
    }

    this.starting = true;

    const state = GameState.get();

    const nickname = state.nickname || "Explorador";

    /*
     * IMPORTANTE:
     * Mantemos o playerId existente.
     *
     * Isso evita criar um novo jogador quando o usuário
     * está continuando uma aventura já existente.
     */
    GameState.setPlayer({
      nickname,
      avatar: this.selectedAvatar,
      playerId: state.playerId
    });

    /*
     * Salva localmente:
     * - nickname
     * - avatar
     * - fase atual
     * - pontuação
     * - estrelas
     * - fases concluídas
     */
    ProgressManager.save();

    /*
     * Recupera as métricas associadas ao jogador.
     */
    GameMetrics.load();

    /*
     * Tenta sincronizar o estado atualizado com o backend.
     *
     * Se o backend estiver indisponível, o jogo continua
     * utilizando o progresso salvo localmente.
     */
    try {
      await ApiService.saveProgress({
        ...GameState.get(),
        metrics: GameMetrics.get()
      });
    } catch (error) {
      console.warn(
        "Não foi possível sincronizar o avatar/progresso.",
        error
      );
    }

    AudioManager.speak(
      `Olá, ${nickname}! A aventura de Aê está começando.`
    );

    /*
     * Recupera a fase atual.
     *
     * Isso é importante para o botão CONTINUAR:
     *
     * Fase 1 → StoryScene
     * Fase 2 → Phase2Scene
     * Fase 3 → Phase3Scene
     * Fase 4 → Phase4Scene
     */
    const phase = Number(
      GameState.get().currentPhase || 1
    );

    if (phase <= 1) {
      this.scene.start("StoryScene");
    } else if (phase === 2) {
      this.scene.start("Phase2Scene");
    } else if (phase === 3) {
      this.scene.start("Phase3Scene");
    } else {
      this.scene.start("Phase4Scene");
    }
  }
}