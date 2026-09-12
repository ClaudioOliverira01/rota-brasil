import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.js";
import { AudioManager } from "../systems/AudioManager.js";
import { AccessibilityManager } from "../systems/AccessibilityManager.js";
import { GameState } from "../systems/GameState.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
    this.modal = null;
  }

  create() {

     this.selectedAvatar =
    GameState.get().avatar ||
    "ae";

    this.drawBackground();

    this.createHeader();

    this.createMascot();

    this.createButtons();

    AudioManager.speak(
      "Prepare sua expedição! Escolha seu companheiro e continue a aventura."
    );
  }

  drawBackground() {
    const g = this.add.graphics();

    g.fillStyle(COLORS.sky, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    g.fillStyle(COLORS.map, 1);
    g.fillCircle(150, 650, 210);
    g.fillCircle(1120, 650, 250);

    g.fillStyle(COLORS.leaf, 1);

    for (let i = 0; i < 14; i += 1) {
      const x = 30 + i * 95;
      const y = 675 + (i % 2) * 12;

      g.fillCircle(x, y, 52);
    }

    g.fillStyle(COLORS.sun, 1);
    g.fillCircle(1110, 95, 58);
  }

  createHeader() {
    this.add
      .text(640, 76, "ROTA BRASIL", {
        fontFamily: "Arial",
        fontSize: "64px",
        fontStyle: "bold",
        color: "#07543d",
        stroke: "#ffffff",
        strokeThickness: 8
      })
      .setOrigin(0.5);

    this.add
      .text(640, 140, "A EXPEDIÇÃO DE AÊ", {
        fontFamily: "Arial",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#18332c"
      })
      .setOrigin(0.5);
  }

  createMascot() {
    const mascot = this.add
      .text(640, 270, "🦜", {
        fontFamily: "Arial",
        fontSize: "130px"
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: mascot,
      y: 262,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.add
      .text(640, 350, "Olá, explorador!", {
        fontFamily: "Arial",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#18332c"
      })
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
  }

createButton(x, y, width, height, label, color, callback) {
  const isLight = color === COLORS.white;

  const container = this.add.container(x, y);

  // Sombra suave
  const shadow = this.add.graphics();

  shadow.fillStyle(0x000000, 0.12);
  shadow.fillRoundedRect(
    -width / 2 + 5,
    -height / 2 + 7,
    width,
    height,
    22
  );

  // Fundo arredondado
  const background = this.add.graphics();

  background.fillStyle(color, 1);

  background.fillRoundedRect(
    -width / 2,
    -height / 2,
    width,
    height,
    22
  );

  background.lineStyle(
    4,
    isLight ? COLORS.forest : COLORS.white,
    0.9
  );

  background.strokeRoundedRect(
    -width / 2,
    -height / 2,
    width,
    height,
    22
  );

  // Área clicável
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

  // Texto
  const text = this.add
    .text(0, 0, label, {
      fontFamily: "Arial",
      fontSize: height >= 70 ? "27px" : "20px",
      fontStyle: "bold",
      color: isLight ? "#0b6e4f" : "#ffffff",
      align: "center"
    })
    .setOrigin(0.5);

  container.add([
    shadow,
    background,
    text
  ]);

  // Efeito ao passar o mouse
  background.on("pointerover", () => {
    container.setScale(1.04);
  });

  background.on("pointerout", () => {
    container.setScale(1);
  });

  // Clique
  background.on("pointerdown", () => {
    AudioManager.stop();
    callback();
  });

  return container;
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
        "Você aprende tentando. Se errar, tente novamente!"
      ],

      buttonLabel: "ENTENDI!"
    });
  }

  showAccessibility() {
    const narration =
      GameState.get().accessibility.narration;

    this.showModal({
      title: "ACESSIBILIDADE",

      lines: [
        "Recursos disponíveis nesta versão:",
        "",
        "✓ Textos grandes e legíveis",
        "✓ Botões grandes e com destaque",
        "✓ Interação por mouse e toque",
        "✓ Narração em português",
        "✓ Feedback visual para acertos e erros",
        "",
        `🔊 Narração: ${
          narration ? "ATIVADA" : "DESATIVADA"
        }`
      ],

      buttonLabel: narration
        ? "DESLIGAR NARRAÇÃO"
        : "LIGAR NARRAÇÃO",

      onButton: () => {
        const enabled =
          AccessibilityManager.toggleNarration();

        if (!enabled) {
          AudioManager.stop();
        }

        this.showAccessibility();
      },

      secondaryLabel: "VOLTAR",

      onSecondary: () => {
        this.closeModal();
      }
    });
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

    const container = this.add
      .container(640, 360)
      .setDepth(1000);

    this.modal = container;

    const dim = this.add
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

    const panel = this.add.graphics();

    panel.fillStyle(COLORS.cream, 1);
    panel.fillRoundedRect(
      -380,
      -240,
      760,
      480,
      36
    );

    panel.lineStyle(5, COLORS.forest, 1);

    panel.strokeRoundedRect(
      -380,
      -240,
      760,
      480,
      36
    );

  // Faixa de título do modal
const titleBackground = this.add.graphics();

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

// Título
const titleText = this.add
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

    const body = this.add
      .text(
        0,
        -70,
        lines.join("\n"),
        {
          fontFamily: "Arial",
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

    const button = this.add.graphics();

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

    const buttonText = this.add
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
      secondary = this.add
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

      secondary.on("pointerover", () => {
        secondary.setScale(1.05);
      });

      secondary.on("pointerout", () => {
        secondary.setScale(1);
      });

      secondary.on("pointerdown", () => {
        if (onSecondary) {
          onSecondary();
        } else {
          this.closeModal();
        }
      });
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
      container.add(secondary);
    }

    button.on("pointerover", () => {
      button.setScale(1.04);
      buttonText.setScale(1.04);
    });

    button.on("pointerout", () => {
      button.setScale(1);
      buttonText.setScale(1);
    });

    button.on("pointerdown", () => {
      if (onButton) {
        onButton();
      } else {
        this.closeModal();
      }
    });

    AudioManager.speak(
      lines
        .filter(Boolean)
        .slice(0, 2)
        .join(" ")
    );
  }

  closeModal() {
    if (this.modal) {
      this.modal.destroy(true);
      this.modal = null;
    }
  }
}