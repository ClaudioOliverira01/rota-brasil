import Phaser from "phaser";
import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH
} from "../config/gameConfig.js";

import { AudioManager } from "../systems/AudioManager.js";
import { AccessibilityManager } from "../systems/AccessibilityManager.js";
import { GameState } from "../systems/GameState.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");

    this.modal = null;
    this.keyboardButtons = [];
    this.keyboardIndex = 0;
    this.keyboardEnabled = true;
  }

  create() {
    this.keyboardButtons = [];
    this.keyboardIndex = 0;
    this.keyboardEnabled = true;

    this.drawBackground();
    this.createHeader();
    this.createMascot();
    this.createButtons();
    this.setupKeyboardNavigation();

    if (
      AccessibilityManager.isNarrationEnabled()
    ) {
      AudioManager.speak(
        "Bem-vindo à Rota Brasil. A Expedição de Aê."
      );
    }
  }

  shutdown() {
    this.removeKeyboardNavigation();

    this.closeModal();
  }

  drawBackground() {
    const g = this.add.graphics();

    g.fillStyle(COLORS.sky, 1);
    g.fillRect(
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    g.fillStyle(COLORS.map, 1);

    g.fillCircle(
      150,
      650,
      210
    );

    g.fillCircle(
      1120,
      650,
      250
    );

    g.fillStyle(COLORS.leaf, 1);

    for (let i = 0; i < 14; i += 1) {
      const x = 30 + i * 95;
      const y =
        675 + (i % 2) * 12;

      g.fillCircle(
        x,
        y,
        52
      );
    }

    g.fillStyle(COLORS.sun, 1);

    g.fillCircle(
      1110,
      95,
      58
    );
  }

  createHeader() {
    this.add
      .text(
        640,
        76,
        "ROTA BRASIL",
        {
          fontFamily: "Arial",
          fontSize: "64px",
          fontStyle: "bold",
          color: "#07543d",
          stroke: "#ffffff",
          strokeThickness: 8
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        640,
        140,
        "A EXPEDIÇÃO DE AÊ",
        {
          fontFamily: "Arial",
          fontSize: "28px",
          fontStyle: "bold",
          color: "#18332c"
        }
      )
      .setOrigin(0.5);
  }

  createMascot() {
    const mascot = this.add
      .text(
        640,
        270,
        "🦜",
        {
          fontFamily: "Arial",
          fontSize: "130px"
        }
      )
      .setOrigin(0.5);

    if (
      !AccessibilityManager.isReducedMotionEnabled()
    ) {
      this.tweens.add({
        targets: mascot,
        y: 262,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    this.add
      .text(
        640,
        350,
        "Olá, explorador!",
        {
          fontFamily: "Arial",
          fontSize: "28px",
          fontStyle: "bold",
          color: "#18332c"
        }
      )
      .setOrigin(0.5);
  }

  createButtons() {
    this.createButton(
      640,
      440,
      390,
      70,
      "▶  COMEÇAR",
      COLORS.forest,
      () => {
        this.scene.start("ProfileScene");
      }
    );

    this.createButton(
      640,
      530,
      390,
      62,
      "📖  COMO JOGAR",
      COLORS.orange,
      () => {
        this.showHowToPlay();
      }
    );

    this.createButton(
      640,
      610,
      390,
      58,
      "⚙  ACESSIBILIDADE",
      COLORS.white,
      () => {
        this.showAccessibility();
      }
    );

    this.createButton(
      640,
      685,
      300,
      42,
      "🏆  RANKING",
      COLORS.orange,
      () => {
        this.scene.start("RankingScene");
      }
    );

    this.selectKeyboardButton(0);
  }

  createButton(
    x,
    y,
    width,
    height,
    label,
    color,
    callback
  ) {
    const isLight =
      color === COLORS.white;

    const container =
      this.add.container(
        x,
        y
      );

    const shadow =
      this.add.graphics();

    shadow.fillStyle(
      0x000000,
      0.12
    );

    shadow.fillRoundedRect(
      -width / 2 + 5,
      -height / 2 + 7,
      width,
      height,
      22
    );

    const background =
      this.add.graphics();

    background.fillStyle(
      color,
      1
    );

    background.fillRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      22
    );

    background.lineStyle(
      4,
      isLight
        ? COLORS.forest
        : COLORS.white,
      0.9
    );

    background.strokeRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      22
    );

    background.setInteractive(
      new Phaser.Geom.Rectangle(
        -width / 2,
        -height / 2,
        width,
        height
      ),
      Phaser.Geom.Rectangle.Contains,
      {
        useHandCursor: true
      }
    );

    const text =
      this.add
        .text(
          0,
          0,
          label,
          {
            fontFamily: "Arial",
            fontSize:
              height >= 70
                ? "27px"
                : "20px",
            fontStyle: "bold",
            color: isLight
              ? "#0b6e4f"
              : "#ffffff",
            align: "center"
          }
        )
        .setOrigin(0.5);

    container.add([
      shadow,
      background,
      text
    ]);

    const buttonData = {
      container,
      background,
      text,
      shadow,
      callback,
      label
    };

    this.keyboardButtons.push(
      buttonData
    );

    background.on(
      "pointerover",
      () => {
        if (
          this.keyboardIndex !==
          this.keyboardButtons.indexOf(
            buttonData
          )
        ) {
          container.setScale(1.04);
        }
      }
    );

    background.on(
      "pointerout",
      () => {
        if (
          this.keyboardIndex !==
          this.keyboardButtons.indexOf(
            buttonData
          )
        ) {
          container.setScale(1);
        }
      }
    );

    background.on(
      "pointerdown",
      () => {
        this.keyboardIndex =
          this.keyboardButtons.indexOf(
            buttonData
          );

        this.selectKeyboardButton(
          this.keyboardIndex
        );

        AudioManager.stop();

        callback();
      }
    );

    return container;
  }

  setupKeyboardNavigation() {
    if (
      !this.input.keyboard
    ) {
      return;
    }

    this.input.keyboard.on(
      "keydown-UP",
      this.handleKeyboardUp,
      this
    );

    this.input.keyboard.on(
      "keydown-LEFT",
      this.handleKeyboardUp,
      this
    );

    this.input.keyboard.on(
      "keydown-DOWN",
      this.handleKeyboardDown,
      this
    );

    this.input.keyboard.on(
      "keydown-RIGHT",
      this.handleKeyboardDown,
      this
    );

    this.input.keyboard.on(
      "keydown-ENTER",
      this.handleKeyboardActivate,
      this
    );

    this.input.keyboard.on(
      "keydown-SPACE",
      this.handleKeyboardActivate,
      this
    );
    
    this.input.keyboard.on(
      "keydown-ESC",
      this.handleKeyboardEscape,
      this
    );
  }

  removeKeyboardNavigation() {
    if (
      !this.input?.keyboard
    ) {
      return;
    }

    this.input.keyboard.off(
      "keydown-UP",
      this.handleKeyboardUp,
      this
    );

    this.input.keyboard.off(
      "keydown-LEFT",
      this.handleKeyboardUp,
      this
    );

    this.input.keyboard.off(
      "keydown-DOWN",
      this.handleKeyboardDown,
      this
    );

    this.input.keyboard.off(
      "keydown-RIGHT",
      this.handleKeyboardDown,
      this
    );

    this.input.keyboard.off(
      "keydown-ENTER",
      this.handleKeyboardActivate,
      this
    );

    this.input.keyboard.off(
      "keydown-SPACE",
      this.handleKeyboardActivate,
      this
    );

    this.input.keyboard.off(
      "keydown-ESC",
      this.handleKeyboardEscape,
      this
    );
  }

  handleKeyboardUp() {
    if (
      !this.keyboardEnabled ||
      this.modal
    ) {
      return;
    }

    this.keyboardIndex--;

    if (
      this.keyboardIndex < 0
    ) {
      this.keyboardIndex =
        this.keyboardButtons.length - 1;
    }

    this.selectKeyboardButton(
      this.keyboardIndex
    );
  }

  handleKeyboardDown() {
    if (
      !this.keyboardEnabled ||
      this.modal
    ) {
      return;
    }

    this.keyboardIndex++;

    if (
      this.keyboardIndex >=
      this.keyboardButtons.length
    ) {
      this.keyboardIndex = 0;
    }

    this.selectKeyboardButton(
      this.keyboardIndex
    );
  }

  handleKeyboardActivate() {
    if (
      !this.keyboardEnabled ||
      this.modal
    ) {
      return;
    }

    const button =
      this.keyboardButtons[
        this.keyboardIndex
      ];

    if (!button) {
      return;
    }

    AudioManager.stop();

    button.callback();
  }

  handleKeyboardEscape() {
    if (this.modal) {
      this.closeModal();
    }
  }

  selectKeyboardButton(index) {
    if (
      !this.keyboardButtons.length
    ) {
      return;
    }

    this.keyboardIndex =
      Math.max(
        0,
        Math.min(
          index,
          this.keyboardButtons.length - 1
        )
      );

    this.keyboardButtons.forEach(
      (button, buttonIndex) => {
        const selected =
          buttonIndex ===
          this.keyboardIndex;

        button.container.setScale(
          selected ? 1.06 : 1
        );

        if (selected) {
          button.background.lineStyle(
            7,
            COLORS.sun,
            1
          );

          button.background.strokeRoundedRect(
            -button.container.width / 2,
            -button.container.height / 2,
            button.container.width,
            button.container.height,
            22
          );
        }
      }
    );
  }

  showHowToPlay() {
    this.showModal({
      title: "COMO JOGAR",

      lines: [
        "Você vai viajar pelo Brasil com Aê!",
        "",
        "🧭 Explore os pontos cardeais.",
        "🗺️ Conheça paisagens e regiões.",
        "🌱 Descubra biomas e sustentabilidade.",
        "",
        "Você aprende tentando. Se errar, tente novamente!",
        "",
        "⌨️ No computador, use as setas e ENTER."
      ],

      buttonLabel: "ENTENDI!"
    });
  }

  showAccessibility() {
    this.closeModal();

    const accessibility =
      GameState.get().accessibility;

    const container =
      this.add
        .container(
          640,
          360
        )
        .setDepth(1000);

    this.modal =
      container;

    const dim =
      this.add
        .rectangle(
          0,
          0,
          GAME_WIDTH,
          GAME_HEIGHT,
          0x09271e,
          0.62
        )
        .setOrigin(0.5)
        .setInteractive();

    const panel =
      this.add.graphics();

    panel.fillStyle(
      COLORS.cream,
      1
    );

    panel.fillRoundedRect(
      -380,
      -240,
      760,
      480,
      36
    );

    panel.lineStyle(
      5,
      COLORS.forest,
      1
    );

    panel.strokeRoundedRect(
      -380,
      -240,
      760,
      480,
      36
    );

    const titleBackground =
      this.add.graphics();

    titleBackground.fillStyle(
      COLORS.forest,
      1
    );

    titleBackground.fillRoundedRect(
      -200,
      -285,
      400,
      68,
      24
    );

    titleBackground.lineStyle(
      4,
      COLORS.white,
      1
    );

    titleBackground.strokeRoundedRect(
      -200,
      -285,
      400,
      68,
      24
    );

    const titleText =
      this.add
        .text(
          0,
          -251,
          "ACESSIBILIDADE",
          {
            fontFamily: "Arial",
            fontSize: "30px",
            fontStyle: "bold",
            color: "#ffffff",
            align: "center"
          }
        )
        .setOrigin(0.5);

    const intro =
      this.add
        .text(
          0,
          -202,
          "Toque em um recurso para ativar ou desativar:",
          {
            fontFamily: "Arial",
            fontSize: "18px",
            fontStyle: "bold",
            color: "#18332c",
            align: "center",
            wordWrap: {
              width: 660
            }
          }
        )
        .setOrigin(0.5);

    container.add([
      dim,
      panel,
      titleBackground,
      titleText,
      intro
    ]);

    /*
     * Cada item representa um recurso de acessibilidade.
     * "enabled" vem do estado atual salvo, "onLabel"/"offLabel"
     * respeitam a concordância de gênero de cada palavra
     * ("ATIVADA/DESATIVADA" para Narração e Fonte, e
     * "ATIVADO/DESATIVADO" para Contraste e Movimento).
     */
    const toggles = [
      {
        icon: "🔊",
        label: "Narração",
        enabled: accessibility.narration,
        onLabel: "ATIVADA",
        offLabel: "DESATIVADA",
        toggle: () => {
          const enabled =
            AccessibilityManager.toggleNarration();

          if (!enabled) {
            AudioManager.stop();
          }
        }
      },
      {
        icon: "👁️",
        label: "Alto contraste",
        enabled: accessibility.highContrast,
        onLabel: "ATIVADO",
        offLabel: "DESATIVADO",
        toggle: () => {
          AccessibilityManager.toggleHighContrast();
        }
      },
      {
        icon: "🎬",
        label: "Menos movimento",
        enabled: accessibility.reducedMotion,
        onLabel: "ATIVADO",
        offLabel: "DESATIVADO",
        toggle: () => {
          AccessibilityManager.toggleReducedMotion();
        }
      },
      {
        icon: "📖",
        label: "Fonte para dislexia",
        enabled: accessibility.dyslexiaFont,
        onLabel: "ATIVADA",
        offLabel: "DESATIVADA",
        toggle: () => {
          AccessibilityManager.toggleDyslexiaFont();
        }
      }
    ];

    const rowWidth = 620;
    const rowHeight = 56;
    const rowGap = 14;
    const startY = -150;

    toggles.forEach(
      (item, index) => {
        const y =
          startY +
          index * (rowHeight + rowGap);

        const row =
          this.add.graphics();

        row.fillStyle(
          item.enabled
            ? COLORS.forest
            : COLORS.white,
          1
        );

        row.fillRoundedRect(
          -rowWidth / 2,
          y - rowHeight / 2,
          rowWidth,
          rowHeight,
          18
        );

        row.lineStyle(
          3,
          item.enabled
            ? COLORS.white
            : COLORS.forest,
          0.9
        );

        row.strokeRoundedRect(
          -rowWidth / 2,
          y - rowHeight / 2,
          rowWidth,
          rowHeight,
          18
        );

        row.setInteractive(
          new Phaser.Geom.Rectangle(
                        -rowWidth / 2,
            y - rowHeight / 2,
            rowWidth,
            rowHeight
          ),
          Phaser.Geom.Rectangle.Contains,
          {
            useHandCursor: true
          }
        );

        const text =
          this.add
            .text(
              0,
              y,
              `${item.icon}  ${item.label}: ${
                item.enabled
                  ? item.onLabel
                  : item.offLabel
              }`,
              {
                fontFamily: "Arial",
                fontSize: "19px",
                fontStyle: "bold",
                color: item.enabled
                  ? "#ffffff"
                  : "#0b6e4f",
                align: "center"
              }
            )
            .setOrigin(0.5);

        container.add([
          row,
          text
        ]);

        row.on(
          "pointerover",
          () => {
            row.setAlpha(0.85);
          }
        );

        row.on(
          "pointerout",
          () => {
            row.setAlpha(1);
          }
        );

        row.on(
          "pointerdown",
          () => {
            item.toggle();

            this.showAccessibility();
          }
        );
      }
    );

    const backY =
      startY +
      toggles.length * (rowHeight + rowGap) +
      18;

    const back =
      this.add
        .text(
          0,
          backY,
          "VOLTAR",
          {
            fontFamily: "Arial",
            fontSize: "20px",
            fontStyle: "bold",
            color: "#07543d"
          }
        )
        .setOrigin(0.5)
        .setInteractive({
          useHandCursor: true
        });

    back.on(
      "pointerover",
      () => {
        back.setScale(1.05);
      }
    );

    back.on(
      "pointerout",
      () => {
        back.setScale(1);
      }
    );

    back.on(
      "pointerdown",
      () => {
        this.closeModal();
      }
    );

    container.add(
      back
    );

    if (
      AccessibilityManager.isNarrationEnabled()
    ) {
      AudioManager.speak(
        "Menu de acessibilidade. Toque em um recurso para ativar ou desativar."
      );
    }
  }

  showModal({
    title,
    lines,
    buttonLabel,
    onButton,
    secondaryLabel,
    onSecondary
  }) {
    this.closeModal();

    const container =
      this.add
        .container(
          640,
          360
        )
        .setDepth(1000);

    this.modal =
      container;

    const dim =
      this.add
        .rectangle(
          0,
          0,
          GAME_WIDTH,
          GAME_HEIGHT,
          0x09271e,
          0.62
        )
        .setOrigin(0.5)
        .setInteractive();

    const panel =
      this.add.graphics();

    panel.fillStyle(
      COLORS.cream,
      1
    );

    panel.fillRoundedRect(
      -380,
      -240,
      760,
      480,
      36
    );

    panel.lineStyle(
      5,
      COLORS.forest,
      1
    );

    panel.strokeRoundedRect(
      -380,
      -240,
      760,
      480,
      36
    );

    const titleBackground =
      this.add.graphics();

    titleBackground.fillStyle(
      COLORS.forest,
      1
    );

    titleBackground.fillRoundedRect(
      -200,
      -285,
      400,
      68,
      24
    );

    titleBackground.lineStyle(
      4,
      COLORS.white,
      1
    );

    titleBackground.strokeRoundedRect(
      -200,
      -285,
      400,
      68,
      24
    );

    const titleText =
      this.add
        .text(
          0,
          -251,
          title,
          {
            fontFamily: "Arial",
            fontSize: "30px",
            fontStyle: "bold",
            color: "#ffffff",
            align: "center"
          }
        )
        .setOrigin(0.5);

    const body =
      this.add
        .text(
          0,
          -70,
          lines.join("\n"),
          {
            fontFamily:
              GameState.get()
                .accessibility
                .dyslexiaFont
                ? "Arial"
                : "Arial",
            fontSize: "20px",
            fontStyle: "bold",
            color: "#18332c",
            align: "center",
            lineSpacing: 8,
            wordWrap: {
              width: 650
            }
          }
        )
        .setOrigin(0.5);

    const button =
      this.add.graphics();

    button.fillStyle(
      COLORS.forest,
      1
    );

    button.fillRoundedRect(
      -160,
      130,
      320,
      58,
      20
    );

    button.lineStyle(
      3,
      COLORS.white,
      1
    );

    button.strokeRoundedRect(
      -160,
      130,
      320,
      58,
      20
    );

    button.setInteractive(
      new Phaser.Geom.Rectangle(
        -160,
        130,
        320,
        58
      ),
      Phaser.Geom.Rectangle.Contains
    );

    const buttonText =
      this.add
        .text(
          0,
          159,
          buttonLabel,
          {
            fontFamily: "Arial",
            fontSize: "18px",
            fontStyle: "bold",
            color: "#ffffff",
            align: "center"
          }
        )
        .setOrigin(0.5);

    let secondary = null;

    if (secondaryLabel) {
      secondary =
        this.add
          .text(
            0,
            215,
            secondaryLabel,
            {
              fontFamily: "Arial",
              fontSize: "18px",
              fontStyle: "bold",
              color: "#07543d"
            }
          )
          .setOrigin(0.5)
          .setInteractive({
            useHandCursor: true
          });

      secondary.on(
        "pointerover",
        () => {
          secondary.setScale(1.05);
        }
      );

      secondary.on(
        "pointerout",
        () => {
          secondary.setScale(1);
        }
      );

      secondary.on(
        "pointerdown",
        () => {
          if (onSecondary) {
            onSecondary();
          } else {
            this.closeModal();
          }
        }
      );
    }

    container.add([
      dim,
      panel,
      titleBackground,
      titleText,
      body,
      button,
      buttonText
    ]);

    if (secondary) {
      container.add(
        secondary
      );
    }

    button.on(
      "pointerover",
      () => {
        button.setScale(1.04);
        buttonText.setScale(1.04);
      }
    );

    button.on(
      "pointerout",
      () => {
        button.setScale(1);
        buttonText.setScale(1);
      }
    );

    button.on(
      "pointerdown",
      () => {
        if (onButton) {
          onButton();
        } else {
          this.closeModal();
        }
      }
    );

    if (
      AccessibilityManager.isNarrationEnabled()
    ) {
      AudioManager.speak(
        lines
          .filter(Boolean)
          .slice(0, 3)
          .join(" ")
      );
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.destroy(
        true
      );

      this.modal = null;
    }
  }
}