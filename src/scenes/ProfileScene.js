import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.js";
import { GameState } from "../systems/GameState.js";
import { GameMetrics } from "../systems/GameMetrics.js";
import { ProgressManager } from "../systems/ProgressManager.js";
import { AudioManager } from "../systems/AudioManager.js";
import { ApiService } from "../services/ApiService.js";

export class ProfileScene extends Phaser.Scene {
  constructor() {
    super("ProfileScene");

    this.inputElement = null;
    this.resizeHandler = null;
    this.submitting = false;
    this.choiceObjects = [];
    this.choiceOverlay = null;
    this.choiceText = null;
    this.message = null;
  }

  create() {
    this.drawBackground();

    this.add.text(GAME_WIDTH / 2, 95, "QUEM ESTÁ JOGANDO?", {
      fontFamily: "Arial",
      fontSize: "42px",
      fontStyle: "bold",
      color: "#18332C"
    }).setOrigin(0.5);

    this.add.text(
      GAME_WIDTH / 2,
      145,
      "Escolha um apelido para guardar sua aventura.",
      {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#31564A"
      }
    ).setOrigin(0.5);

    this.createInput();
    this.createBackButton();

    AudioManager.speak(
      "Escolha um apelido para guardar sua aventura. Não precisa usar seu nome de verdade!"
    );
  }

  drawBackground() {
    this.cameras.main.setBackgroundColor(COLORS.skyLight);

    const g = this.add.graphics();

    g.fillStyle(COLORS.sky, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    g.fillStyle(COLORS.map, 1);
    g.fillCircle(80, GAME_HEIGHT - 20, 230);
    g.fillCircle(GAME_WIDTH - 70, GAME_HEIGHT + 20, 260);

    g.fillStyle(COLORS.leaf, 1);

    for (let i = 0; i < 15; i += 1) {
      g.fillCircle(
        35 + i * 85,
        GAME_HEIGHT - 5,
        38
      );
    }
  }

  createInput() {
    const input = document.createElement("input");

    input.id = "profile-nickname-input";
    input.type = "text";
    input.maxLength = 15;
    input.placeholder = "Ex.: Aventureiro";
    input.autocomplete = "off";
    input.spellcheck = false;

    Object.assign(input.style, {
      position: "absolute",
      width: "430px",
      height: "58px",
      padding: "0 20px",
      fontSize: "24px",
      fontFamily: "Arial",
      border: "4px solid #4C8A3A",
      borderRadius: "20px",
      outline: "none",
      textAlign: "center",
      boxSizing: "border-box",
      zIndex: "20",
      background: "white"
    });

    document.body.appendChild(input);

    this.inputElement = input;

    this.positionInput();

    this.resizeHandler = () => {
      this.positionInput();
    };

    window.addEventListener(
      "resize",
      this.resizeHandler
    );

    input.focus();

    input.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        this.submit();
      }
    });

    this.events.once(
      "shutdown",
      () => this.removeInput()
    );

    this.events.once(
      "destroy",
      () => this.removeInput()
    );

    const shadow = this.add.rectangle(
      GAME_WIDTH / 2 + 5,
      415,
      350,
      70,
      0x000000,
      0.12
    );

    const button = this.add.rectangle(
      GAME_WIDTH / 2,
      410,
      350,
      70,
      COLORS.forest
    )
      .setStrokeStyle(4, 0x315F2A)
      .setInteractive({
        useHandCursor: true
      });

    const label = this.add.text(
      GAME_WIDTH / 2,
      410,
      "CONTINUAR ➜",
      {
        fontFamily: "Arial",
        fontSize: "25px",
        fontStyle: "bold",
        color: "#FFFFFF"
      }
    ).setOrigin(0.5);

    button.on("pointerover", () => {
      button.setScale(1.04);
      label.setScale(1.04);
      shadow.setScale(1.04);
    });

    button.on("pointerout", () => {
      button.setScale(1);
      label.setScale(1);
      shadow.setScale(1);
    });

    button.on("pointerdown", () => {
      this.submit();
    });
  }

  positionInput() {
    if (!this.inputElement) return;

    const canvas = this.game.canvas.getBoundingClientRect();

    const scaleX =
      canvas.width / GAME_WIDTH;

    const scaleY =
      canvas.height / GAME_HEIGHT;

    const scale =
      Math.min(scaleX, scaleY);

    this.inputElement.style.left =
      `${canvas.left + (GAME_WIDTH / 2 - 215) * scaleX}px`;

    this.inputElement.style.top =
      `${canvas.top + 225 * scaleY}px`;

    this.inputElement.style.transform =
      `scale(${scale})`;

    this.inputElement.style.transformOrigin =
      "top left";
  }

  removeInput() {
    this.inputElement?.remove();

    this.inputElement = null;

    if (this.resizeHandler) {
      window.removeEventListener(
        "resize",
        this.resizeHandler
      );

      this.resizeHandler = null;
    }
  }

  createBackButton() {
    const button = this.add.text(
      85,
      65,
      "← VOLTAR",
      {
        fontFamily: "Arial",
        fontSize: "22px",
        fontStyle: "bold",
        color: "#18332C",
        backgroundColor: "#FFFFFF",
        padding: {
          x: 18,
          y: 10
        }
      }
    )
      .setOrigin(0.5)
      .setInteractive({
        useHandCursor: true
      });

    button.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });
  }

  async submit() {
    if (this.submitting) return;

    const nickname =
      this.inputElement?.value.trim() || "";

    const validationError =
      ProgressManager.validateNickname(nickname);

    if (validationError) {
      this.showMessage(validationError);

      AudioManager.speak(
        validationError
      );

      return;
    }

    this.submitting = true;

    this.showMessage(
      "Verificando seu apelido..."
    );

    try {
      /*
       * Primeiro procuramos no armazenamento
       * local do navegador.
       */
      const localProfile =
        ProgressManager.findProfileByNickname(
          nickname
        );

      /*
       * Depois procuramos no Backend.
       *
       * Não alteramos o Backend.
       * Apenas consumimos a API que já existe.
       */
      let remotePlayer = null;

      if (!ApiService.isMockEnabled()) {
        try {
          remotePlayer =
            await ApiService.getPlayerByNickname(
              nickname
            );
        } catch (error) {
          /*
           * 404 significa que o jogador ainda
           * não existe.
           *
           * Qualquer outro erro é realmente
           * um problema de comunicação.
           */
          if (error.status !== 404) {
            throw error;
          }
        }
      }

      /*
       * JOGADOR ENCONTRADO NO BACKEND
       */
      if (remotePlayer) {
        await this.openExistingRemotePlayer(
          remotePlayer
        );

        return;
      }

      /*
       * JOGADOR LOCAL ENCONTRADO
       *
       * Caso exista no navegador, carregamos
       * os dados antes de continuar.
       */
      if (
        localProfile &&
        !String(
          localProfile.playerId
        ).startsWith("local-")
      ) {
        ProgressManager.loadProfile(
          localProfile
        );

        await this.loadRemoteProgressIfPossible(
          localProfile.playerId
        );

        const updatedProfile =
          ProgressManager.findProfileByNickname(
            nickname
          );

        this.showExistingProfile(
          updatedProfile
        );

        return;
      }

      /*
       * NOVO JOGADOR
       */
      const player =
        await ApiService.createPlayer({
          nickname,
          avatar: "ae"
        });

      /*
       * Compatibilidade com possíveis formatos
       * de resposta da API.
       */
      const playerId =
        player?.jogador?.id ||
        player?.id;

      /*
       * Criamos o perfil local associado
       * ao ID real do Backend.
       */
      ProgressManager.createNewProfile(
        nickname,
        playerId || null
      );

      GameMetrics.reset();
      GameMetrics.startGame();

      /*
       * IMPORTANTE:
       * o jogador já está identificado aqui.
       *
       * Agora vai para AvatarScene.
       *
       * O AvatarScene NÃO deve pedir o apelido
       * novamente.
       */
      this.scene.start(
        "AvatarScene"
      );

    } catch (error) {

      /*
       * O Backend informou que o apelido
       * já existe.
       */
      if (error.status === 409) {
        this.showMessage(
          "Esse apelido já está sendo utilizado. Tente outro."
        );

        AudioManager.speak(
          "Esse apelido já está sendo utilizado. Tente outro."
        );

        return;
      }

      /*
       * Se a API estiver temporariamente
       * indisponível, tentamos trabalhar
       * com o perfil local.
       */
      console.warn(
        "API indisponível. Usando perfil local.",
        error
      );

      const localProfile =
        ProgressManager.findProfileByNickname(
          nickname
        );

      if (localProfile) {

        ProgressManager.loadProfile(
          localProfile
        );

        GameMetrics.load();

        this.showExistingProfile(
          localProfile
        );

      } else {

        /*
         * Nenhum perfil encontrado.
         * Criamos um perfil local.
         */
        ProgressManager.createNewProfile(
          nickname,
          null
        );

        GameMetrics.reset();
        GameMetrics.startGame();

        this.scene.start(
          "AvatarScene"
        );
      }

    } finally {
      this.submitting = false;
    }
  }

  async loadRemoteProgressIfPossible(
    playerId
  ) {
    if (
      !playerId ||
      String(playerId).startsWith("local-") ||
      ApiService.isMockEnabled()
    ) {
      return;
    }

    try {

      const progress =
        await ApiService.getProgress(
          playerId
        );

      /*
       * Aqui está uma parte importante
       * para resolver o problema que você
       * relatou:
       *
       * o Backend salva, mas a interface
       * não mostrava o progresso.
       *
       * Pegamos o progresso da API e
       * colocamos dentro do GameState.
       */
      GameState.applyRemoteProgress(
        progress
      );

      /*
       * Depois salvamos esse estado
       * carregado também no navegador.
       */
      ProgressManager.save();

      /*
       * Carrega as métricas do jogador.
       */
      GameMetrics.load();

    } catch (error) {

      console.warn(
        "Não foi possível carregar o progresso remoto.",
        error
      );
    }
  }

  async openExistingRemotePlayer(
    player
  ) {
    const playerId =
      player?.id ||
      player?.playerId;

    const nickname =
      player?.nickname ||
      this.inputElement?.value.trim();

    /*
     * Se a resposta do endpoint já trouxe
     * o progresso, usamos ele.
     *
     * Caso contrário, consultamos a API.
     */
    const progress =
      player?.progress ||
      await ApiService.getProgress(
        playerId
      );

    /*
     * Montamos um perfil completo para o
     * GameState.
     */
    const profile = {
      playerId,

      nickname,

      nicknameNormalized:
        nickname.toLocaleLowerCase(
          "pt-BR"
        ),

      avatar:
        player?.avatar || "ae",

      currentPhase:
        Number(
          progress?.currentPhase || 1
        ),

      score:
        Number(
          progress?.score || 0
        ),

      stars:
        Number(
          progress?.stars || 0
        ),

      completedPhases:
        Array.isArray(
          progress?.completedPhases
        )
          ? [
              ...progress.completedPhases
            ]
          : [],

      accessibility:
        progress?.accessibility ||
        GameState.get().accessibility,

      updatedAt:
        new Date().toISOString()
    };

    /*
     * Coloca o progresso recuperado
     * dentro do GameState.
     */
    ProgressManager.loadProfile(
      profile
    );

    /*
     * Agora o jogador verá a tela
     * perguntando se deseja continuar.
     */
    this.showExistingProfile(
      profile
    );
  }

  showMessage(message) {
    this.message?.destroy();

    this.message =
      this.add.text(
        GAME_WIDTH / 2,
        325,
        message,
        {
          fontFamily: "Arial",
          fontSize: "20px",
          fontStyle: "bold",
          color: "#9A3F28",
          align: "center",
          wordWrap: {
            width: 650
          }
        }
      ).setOrigin(0.5);
  }

  /*
   * =====================================================
   * PERFIL EXISTENTE
   * =====================================================
   *
   * ESTA É A PARTE QUE VOCÊ NÃO ESTAVA ACHANDO.
   *
   * Agora ela está claramente dentro do arquivo.
   */
  showExistingProfile(profile) {

    this.showChoice(

      `Encontramos uma aventura de ${profile.nickname}.\n\n` +

      `Fase atual: ${profile.currentPhase}\n` +

      `Pontuação: ${profile.score}\n` +

      `Estrelas: ${profile.stars}\n\n` +

      "Você quer continuar?",

      [

        [
          "CONTINUAR AVENTURA",

          () => {

            /*
             * Recarrega o perfil.
             */
            ProgressManager.loadProfile(
              profile
            );

            /*
             * Recarrega as métricas.
             */
            GameMetrics.load();

            /*
             * IMPORTANTE:
             *
             * Não vamos mandar o jogador
             * para o começo.
             *
             * O AvatarScene será responsável
             * por encaminhar para a fase
             * correta.
             */
            this.scene.start(
              "AvatarScene"
            );
          }
        ],

        [
          "COMEÇAR DO ZERO",

          () => {

            /*
             * Apaga o progresso local
             * desse perfil.
             */
            ProgressManager.clearCurrentProfile();

            /*
             * Cria novamente o perfil
             * mantendo o mesmo playerId.
             *
             * Assim o Backend continuará
             * reconhecendo o mesmo jogador.
             */
            ProgressManager.createNewProfile(
              profile.nickname,
              profile.playerId || null
            );

            GameMetrics.reset();
            GameMetrics.startGame();

            /*
             * Vai para escolha do avatar.
             */
            this.scene.start(
              "AvatarScene"
            );
          }
        ],

        [
          "ESCOLHER OUTRO",

          () => {
            this.closeChoice();
          }
        ]

      ]
    );
  }

  showChoice(
    message,
    options
  ) {

    this.closeChoice();

    /*
     * Fundo escuro.
     */
    this.choiceOverlay =
      this.add.rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        780,
        560,
        0x18332C,
        0.96
      )
        .setDepth(50)
        .setStrokeStyle(
          5,
          COLORS.white
        );

    /*
     * Texto do perfil.
     */
    this.choiceText =
      this.add.text(
        GAME_WIDTH / 2,
        170,
        message,
        {
          fontFamily: "Arial",
          fontSize: "23px",
          fontStyle: "bold",
          color: "#FFFFFF",
          align: "center",
          wordWrap: {
            width: 680
          },
          lineSpacing: 8
        }
      )
        .setOrigin(0.5)
        .setDepth(51);

    /*
     * Botões.
     */
    options.forEach(
      ([label, callback], index) => {

        const y =
          325 + index * 70;

        const color =
          index === options.length - 1
            ? COLORS.orange
            : COLORS.forest;

        const button =
          this.add.rectangle(
            GAME_WIDTH / 2,
            y,
            440,
            56,
            color
          )
            .setDepth(51)
            .setStrokeStyle(
              3,
              COLORS.white
            )
            .setInteractive({
              useHandCursor: true
            });

        const text =
          this.add.text(
            GAME_WIDTH / 2,
            y,
            label,
            {
              fontFamily: "Arial",
              fontSize: "18px",
              fontStyle: "bold",
              color: "#FFFFFF"
            }
          )
            .setOrigin(0.5)
            .setDepth(52);

        button.on(
          "pointerover",
          () => {
            button.setScale(1.03);
            text.setScale(1.03);
          }
        );

        button.on(
          "pointerout",
          () => {
            button.setScale(1);
            text.setScale(1);
          }
        );

        button.on(
          "pointerdown",
          callback
        );

        this.choiceObjects.push(
          button,
          text
        );
      }
    );
  }

  closeChoice() {

    this.choiceOverlay?.destroy();

    this.choiceText?.destroy();

    this.choiceObjects.forEach(
      item => item?.destroy()
    );

    this.choiceObjects = [];

    this.choiceOverlay = null;
    this.choiceText = null;
  }
}