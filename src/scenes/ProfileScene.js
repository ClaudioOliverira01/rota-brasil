import Phaser from "phaser";

import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH
} from "../config/gameConfig.js";

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
  }

  // =========================================================
  // CREATE
  // =========================================================

  create() {
    this.drawBackground();

    this.add
      .text(
        GAME_WIDTH / 2,
        95,
        "QUEM ESTÁ JOGANDO?",
        {
          fontFamily: "Arial",
          fontSize: "42px",
          fontStyle: "bold",
          color: "#18332C"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        145,
        "Escolha um apelido para guardar sua aventura.",
        {
          fontFamily: "Arial",
          fontSize: "22px",
          color: "#31564A",
          align: "center"
        }
      )
      .setOrigin(0.5);

    this.createInput();
    this.createBackButton();

    AudioManager.speak(
      "Escolha um apelido para guardar sua aventura. Não precisa usar seu nome de verdade!"
    );
  }

  // =========================================================
  // BACKGROUND
  // =========================================================

  drawBackground() {
    this.cameras.main.setBackgroundColor(
      COLORS.skyLight
    );

    const graphics =
      this.add.graphics();

    graphics.fillStyle(
      COLORS.sky,
      1
    );

    graphics.fillRect(
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    graphics.fillStyle(
      COLORS.map,
      1
    );

    graphics.fillCircle(
      80,
      GAME_HEIGHT - 20,
      230
    );

    graphics.fillCircle(
      GAME_WIDTH - 70,
      GAME_HEIGHT + 20,
      260
    );

    graphics.fillStyle(
      COLORS.leaf,
      1
    );

    for (
      let i = 0;
      i < 15;
      i += 1
    ) {
      graphics.fillCircle(
        35 + i * 85,
        GAME_HEIGHT - 5,
        38
      );
    }
  }

  // =========================================================
  // INPUT
  // =========================================================

  createInput() {
    const input =
      document.createElement(
        "input"
      );

    input.id =
      "profile-nickname-input";

    input.type =
      "text";

    input.maxLength =
      15;

    input.placeholder =
      "Ex.: Aventureiro";

    Object.assign(
      input.style,
      {
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
      }
    );

    document.body.appendChild(
      input
    );

    this.inputElement =
      input;

    this.positionInput();

    this.resizeHandler =
      () =>
        this.positionInput();

    window.addEventListener(
      "resize",
      this.resizeHandler
    );

    input.focus();

    this.events.once(
      "shutdown",
      () => this.removeInput()
    );

    this.events.once(
      "destroy",
      () => this.removeInput()
    );

    // =======================================================
    // BOTÃO CONTINUAR
    // =======================================================

    const button =
      this.add
        .rectangle(
          GAME_WIDTH / 2,
          410,
          350,
          70,
          0x4C8A3A
        )
        .setStrokeStyle(
          4,
          0x315F2A
        )
        .setInteractive({
          useHandCursor: true
        });

    const label =
      this.add
        .text(
          GAME_WIDTH / 2,
          410,
          "CONTINUAR ➜",
          {
            fontFamily: "Arial",
            fontSize: "25px",
            fontStyle: "bold",
            color: "#FFFFFF"
          }
        )
        .setOrigin(0.5);

    button.on(
      "pointerover",
      () => {
        button.setScale(1.04);
        label.setScale(1.04);
      }
    );

    button.on(
      "pointerout",
      () => {
        button.setScale(1);
        label.setScale(1);
      }
    );

    button.on(
      "pointerdown",
      () => this.submit()
    );

    input.addEventListener(
      "keydown",
      event => {
        if (
          event.key ===
          "Enter"
        ) {
          this.submit();
        }
      }
    );
  }

  // =========================================================
  // POSICIONAMENTO DO INPUT
  // =========================================================

  positionInput() {
    if (
      !this.inputElement
    ) {
      return;
    }

    const canvas =
      this.game.canvas.getBoundingClientRect();

    const scaleX =
      canvas.width /
      GAME_WIDTH;

    const scaleY =
      canvas.height /
      GAME_HEIGHT;

    this.inputElement.style.left =
      `${
        canvas.left +
        (
          GAME_WIDTH / 2 -
          215
        ) *
          scaleX
      }px`;

    this.inputElement.style.top =
      `${
        canvas.top +
        225 *
          scaleY
      }px`;

    this.inputElement.style.transform =
      `scale(${
        Math.min(
          scaleX,
          scaleY
        )
      })`;

    this.inputElement.style.transformOrigin =
      "top left";
  }

  // =========================================================
  // REMOVE INPUT
  // =========================================================

  removeInput() {
    if (
      this.inputElement
    ) {
      this.inputElement.remove();

      this.inputElement =
        null;
    }

    if (
      this.resizeHandler
    ) {
      window.removeEventListener(
        "resize",
        this.resizeHandler
      );

      this.resizeHandler =
        null;
    }
  }

  // =========================================================
  // BOTÃO VOLTAR
  // =========================================================

  createBackButton() {
    const button =
      this.add
        .text(
          85,
          65,
          "← VOLTAR",
          {
            fontFamily: "Arial",
            fontSize: "22px",
            fontStyle: "bold",
            color: "#18332C",
            backgroundColor:
              "#FFFFFF",
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

    button.on(
      "pointerdown",
      () =>
        this.scene.start(
          "MenuScene"
        )
    );
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  async submit() {
    if (
      this.submitting
    ) {
      return;
    }

    const nickname =
      this.inputElement
        ?.value
        .trim() || "";

    const validation =
      ProgressManager.validateNickname(
        nickname
      );

    if (validation) {
      this.showMessage(
        validation
      );

      AudioManager.speak(
        validation
      );

      return;
    }

    this.submitting =
      true;

    this.showMessage(
      "Verificando seu apelido..."
    );

    let remoteProfile =
      null;

    let apiAvailable =
      true;

    try {
      // =====================================================
      // 1. PRIMEIRO CONSULTA O BANCO
      // =====================================================

      try {
        remoteProfile =
          await ApiService.getPlayerByNickname(
            nickname
          );
      } catch (error) {
        // ---------------------------------------------------
        // Jogador não encontrado
        // ---------------------------------------------------

        if (
          error?.status ===
          404
        ) {
          remoteProfile =
            null;
        } else {
          // -------------------------------------------------
          // API indisponível
          // -------------------------------------------------

          apiAvailable =
            false;

          console.warn(
            "[ProfileScene] API indisponível. Usando perfil local.",
            error
          );
        }
      }

      // =====================================================
      // 2. JOGADOR EXISTE NO BANCO
      // =====================================================

      if (
        remoteProfile
      ) {
        console.log(
          "[ProfileScene] Jogador encontrado no banco:",
          remoteProfile
        );

        this.showExistingProfile(
          remoteProfile
        );

        return;
      }

      // =====================================================
      // 3. API FUNCIONOU, MAS JOGADOR NÃO EXISTE
      // =====================================================

      if (
        apiAvailable
      ) {
        const localProfile =
          ProgressManager.findProfileByNickname(
            nickname
          );

        // ---------------------------------------------------
        // Perfil existe apenas localmente
        // ---------------------------------------------------

        if (
          localProfile
        ) {
          console.log(
            "[ProfileScene] Perfil encontrado apenas localmente:",
            localProfile
          );

          this.showExistingProfile(
            localProfile
          );

          return;
        }

        // ---------------------------------------------------
        // NOVO JOGADOR
        // ---------------------------------------------------

        const created =
          await ApiService.createPlayer(
            {
              nickname,
              avatar: "ae"
            }
          );

        console.log(
          "[ProfileScene] Jogador criado no banco:",
          created
        );

        // ---------------------------------------------------
        // Backend pode retornar:
        //
        // {
        //   mensagem: "...",
        //   jogador: {...}
        // }
        //
        // ou diretamente o jogador.
        // ---------------------------------------------------

        const createdPlayer =
          created?.jogador ||
          created?.player ||
          created;

        const playerId =
          createdPlayer?.id ||
          createdPlayer?.playerId ||
          null;

        console.log(
          "[ProfileScene] UUID do novo jogador:",
          playerId
        );

        // ---------------------------------------------------
        // Salva o perfil local já com UUID real
        // ---------------------------------------------------

        ProgressManager.createNewProfile(
          nickname,
          playerId
        );

        GameMetrics.reset();

        GameMetrics.startGame();

        this.scene.start(
          "AvatarScene"
        );

        return;
      }

      // =====================================================
      // 4. FALLBACK PARA PERFIL LOCAL
      // =====================================================

      const localProfile =
        ProgressManager.findProfileByNickname(
          nickname
        );

      if (
        localProfile
      ) {
        console.log(
          "[ProfileScene] Usando perfil local:",
          localProfile
        );

        this.showExistingProfile(
          localProfile
        );

        return;
      }

      // =====================================================
      // 5. NÃO ENCONTROU NADA
      // =====================================================

      ProgressManager.createNewProfile(
        nickname
      );

      GameMetrics.reset();

      GameMetrics.startGame();

      this.scene.start(
        "AvatarScene"
      );

    } catch (error) {
      console.error(
        "[ProfileScene] Erro ao entrar:",
        error
      );

      this.showMessage(
        error?.payload?.error ||
          error?.payload?.mensagem ||
          error?.message ||
          "Não foi possível verificar o apelido."
      );

      AudioManager.speak(
        "Não foi possível verificar o apelido. Tente novamente."
      );
    } finally {
      this.submitting =
        false;
    }
  }

  // =========================================================
  // MENSAGEM
  // =========================================================

  showMessage(
    message
  ) {
    this.message?.destroy();

    this.message =
      this.add
        .text(
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
        )
        .setOrigin(0.5);
  }

  // =========================================================
  // PERFIL EXISTENTE
  // =========================================================

  showExistingProfile(
    profile
  ) {
    // =====================================================
    // RECUPERA O ID
    // =====================================================

    let playerId =
      profile.playerId ||
      profile.id ||
      profile.jogador?.id;

    // =====================================================
    // IMPORTANTE:
    // IDs "local-..." NÃO SÃO UUIDs DO BANCO
    // =====================================================

    if (
      typeof playerId ===
        "string" &&
      playerId.startsWith(
        "local-"
      )
    ) {
      console.warn(
        "[ProfileScene] ID local detectado. Não será enviado para a API:",
        playerId
      );

      playerId =
        null;
    }

    // =====================================================
    // DADOS DO PERFIL
    // =====================================================

    const currentPhase =
      profile.currentPhase ??
      profile.progresso?.currentPhase ??
      1;

    const score =
      profile.score ??
      profile.progresso?.score ??
      0;

    const stars =
      profile.stars ??
      profile.progresso?.stars ??
      0;

    const nickname =
      profile.nickname ||
      profile.jogador?.nickname ||
      "";

    const normalizedProfile = {
      ...profile,

      playerId,

      currentPhase,

      score,

      stars,

      nickname
    };

    console.log(
      "[ProfileScene] Perfil normalizado:",
      normalizedProfile
    );

    // =====================================================
    // MOSTRA OPÇÕES
    // =====================================================

    this.showChoice(
      `Encontramos uma aventura de ${normalizedProfile.nickname}.\n\nFase atual: ${currentPhase}\nPontuação: ${score}\nEstrelas: ${stars}\n\nVocê quer continuar?`,

      [
        // ===================================================
        // CONTINUAR
        // ===================================================

        [
          "CONTINUAR AVENTURA",

          async () => {
            try {
              // ---------------------------------------------
              // Salva perfil local
              // ---------------------------------------------

              ProgressManager.loadProfile(
                normalizedProfile
              );

              GameMetrics.load();

              // ---------------------------------------------
              // Só consulta API se tiver UUID real
              // ---------------------------------------------

              if (
                normalizedProfile.playerId
              ) {
                console.log(
                  "[ProfileScene] Carregando progresso remoto para:",
                  normalizedProfile.playerId
                );

                try {
                  const response =
                    await ApiService.getProgress(
                      normalizedProfile.playerId
                    );

                  // -----------------------------------------
                  // O backend retorna:
                  //
                  // {
                  //   mensagem: "...",
                  //   progresso: { current_phase, score, stars, ... }
                  // }
                  //
                  // Os dados reais estão dentro de "progresso".
                  // -----------------------------------------

                  const progressData =
                    response?.progresso;

                  if (
                    progressData
                  ) {
                    console.log(
                      "[ProfileScene] Progresso remoto:",
                      progressData
                    );

                    GameState.applyRemoteProgress?.(
                      progressData
                    );
                  } else {
                    console.log(
                      "[ProfileScene] Nenhum progresso remoto encontrado. Mantendo progresso local."
                    );
                  }
                } catch (error) {
                  console.warn(
                    "[ProfileScene] Não foi possível carregar o progresso remoto.",
                    error
                  );
                }
              } else {
                console.log(
                  "[ProfileScene] Perfil sem UUID remoto. Continuando com progresso local."
                );
              }

              // ---------------------------------------------
              // Vai para seleção de avatar
              // ---------------------------------------------

              this.scene.start(
                "AvatarScene"
              );

            } catch (error) {
              console.error(
                "[ProfileScene] Erro ao continuar aventura:",
                error
              );

              this.showMessage(
                "Não foi possível carregar sua aventura."
              );
            }
          }
        ],

        // ===================================================
        // COMEÇAR DO ZERO
        // ===================================================

        [
          "COMEÇAR DO ZERO",

          async () => {
            try {
              ProgressManager.clearCurrentProfile();

              let playerId =
                normalizedProfile.playerId;

              // ------------------------------------------------
              // Se o perfil existente não tem UUID real,
              // tenta criar/recuperar no backend.
              // ------------------------------------------------

              if (
                !playerId
              ) {
                try {
                  const created =
                    await ApiService.createPlayer(
                      {
                        nickname:
                          normalizedProfile.nickname,

                        avatar:
                          "ae"
                      }
                    );

                  const createdPlayer =
                    created?.jogador ||
                    created?.player ||
                    created;

                  playerId =
                    createdPlayer?.id ||
                    createdPlayer?.playerId ||
                    null;

                } catch (error) {
                  console.warn(
                    "[ProfileScene] Não foi possível recriar perfil no banco.",
                    error
                  );
                }
              }

              ProgressManager.createNewProfile(
                normalizedProfile.nickname,
                playerId
              );

              GameMetrics.reset();

              GameMetrics.startGame();

              this.scene.start(
                "AvatarScene"
              );

            } catch (error) {
              console.error(
                "[ProfileScene] Erro ao começar do zero:",
                error
              );
            }
          }
        ],

        // ===================================================
        // ESCOLHER OUTRO
        // ===================================================

        [
          "ESCOLHER OUTRO",

          () =>
            this.closeChoice()
        ]
      ]
    );
  }

  // =========================================================
  // CHOICE
  // =========================================================

  showChoice(
    message,
    options
  ) {
    this.closeChoice();

    this.choiceOverlay =
      this.add
        .rectangle(
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
          0xFFFFFF
        );

    this.choiceText =
      this.add
        .text(
          GAME_WIDTH / 2,
          175,
          message,
          {
            fontFamily: "Arial",
            fontSize: "22px",
            fontStyle: "bold",
            color: "#FFFFFF",
            align: "center",
            wordWrap: {
              width: 680
            },
            lineSpacing: 7
          }
        )
        .setOrigin(0.5)
        .setDepth(51);

    const baseY =
      335;

    options.forEach(
      (
        [label, callback],
        index
      ) => {
        const y =
          baseY +
          index * 65;

        const button =
          this.add
            .rectangle(
              GAME_WIDTH / 2,
              y,
              420,
              52,
              index ===
                options.length - 1
                ? 0xD89B3C
                : 0x4C8A3A
            )
            .setDepth(51)
            .setInteractive({
              useHandCursor: true
            });

        const text =
          this.add
            .text(
              GAME_WIDTH / 2,
              y,
              label,
              {
                fontFamily:
                  "Arial",
                fontSize:
                  "18px",
                fontStyle:
                  "bold",
                color:
                  "#FFFFFF"
              }
            )
            .setOrigin(0.5)
            .setDepth(52);

        button.on(
          "pointerover",
          () => {
            button.setScale(
              1.03
            );

            text.setScale(
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
          }
        );

        button.on(
          "pointerdown",
          callback
        );
      }
    );
  }

  // =========================================================
  // FECHAR CHOICE
  // =========================================================

  closeChoice() {
    this.choiceOverlay?.destroy();

    this.choiceText?.destroy();

    this.choiceOverlay =
      null;

    this.choiceText =
      null;
  }
}