import Phaser from "phaser";

import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH
} from "../config/gameConfig.js";

import { GameState } from "../systems/GameState.js";
import { AudioManager } from "../systems/AudioManager.js";
import { AccessibilityManager } from "../systems/AccessibilityManager.js";
import { getAvatar } from "../data/gameData.js";
import {
  COMPASS_PARTS,
  TOTAL_PHASES,
  getCompassProgress,
  isCompassComplete,
  isBonusUnlocked
} from "../data/compassData.js";

const RADIUS = 150;
const CENTER_X = 640;
const CENTER_Y = 330;

const toRad = deg => Phaser.Math.DegToRad(deg);

/**
 * ENTRETELA entre fases.
 * Mostra a bússola sendo reconstruída: 1/4, 2/4, 3/4 e 4/4 (100%).
 * Recebe os mesmos dados do VictoryScene ({ phase, final, ... }) e,
 * ao tocar em CONTINUAR, abre o VictoryScene com { skipCompass: true }.
 */
export class CompassTransitionScene extends Phaser.Scene {
  constructor() {
    super("CompassTransitionScene");
  }

  create(data = {}) {
    this.payload = data;
    this.leaving = false;

    const state = GameState.get();
    const phase = Number(data.phase || 1);

    this.done = getCompassProgress(state.completedPhases);
    this.complete = isCompassComplete(state.completedPhases);
    this.reduceMotion = AccessibilityManager.isReducedMotionEnabled();

    this.drawBackground();
    this.createTitle(phase);
    this.createCompass(phase);
    this.createProgressBar(phase);
    this.createGuide(state);
    this.createContinueButton();

    this.playReward();

    AudioManager.speak(
      this.complete
        ? "Incrível! A bússola está completa! Ela revelou um caminho secreto."
        : `Muito bem! A bússola está ${this.done} de ${TOTAL_PHASES} reconstruída.`
    );
  }

  drawBackground() {
    this.cameras.main.setBackgroundColor(COLORS.sky);

    const g = this.add.graphics();
    g.fillStyle(COLORS.sky, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle(COLORS.map, 1);
    g.fillCircle(80, 700, 230);
    g.fillCircle(1200, 700, 260);
    g.fillStyle(COLORS.leaf, 1);

    for (let i = 0; i < 14; i += 1) {
      g.fillCircle(40 + i * 95, 705, 38);
    }
  }

  createTitle(phase) {
    this.add
      .text(
        GAME_WIDTH / 2,
        50,
        this.complete
          ? "BÚSSOLA COMPLETA! 🧭"
          : `FASE ${phase} CONCLUÍDA!`,
        {
          fontFamily: "Arial",
          fontSize: "40px",
          fontStyle: "bold",
          color: "#07543d"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        95,
        this.complete
          ? "Você reconstruiu 100% da bússola!"
          : `Uma nova peça voltou para a bússola (${this.done}/${TOTAL_PHASES})`,
        {
          fontFamily: "Arial",
          fontSize: "21px",
          fontStyle: "bold",
          color: "#18332c"
        }
      )
      .setOrigin(0.5);
  }

  // ---------------------------------------------------------
  // BÚSSOLA
  // ---------------------------------------------------------
  createCompass(currentPhase) {
    const state = GameState.get();
    const completed = new Set((state.completedPhases || []).map(Number));

    this.compass = this.add.container(CENTER_X, CENTER_Y);

    // Aro externo
    const ring = this.add.graphics();
    ring.fillStyle(0x000000, 0.12);
    ring.fillCircle(6, 8, RADIUS + 22);
    ring.fillStyle(COLORS.sun, 1);
    ring.fillCircle(0, 0, RADIUS + 20);
    ring.lineStyle(6, COLORS.ink, 1);
    ring.strokeCircle(0, 0, RADIUS + 20);
    ring.fillStyle(COLORS.cream, 1);
    ring.fillCircle(0, 0, RADIUS + 2);
    this.compass.add(ring);

    this.pieces = [];

    COMPASS_PARTS.forEach(part => {
      const has = completed.has(part.phase);
      const isNew = part.phase === currentPhase && has;

      // Peça já conquistada ANTES desta fase: aparece colorida.
      // Peça desta fase: entra animada. Futuras: cinza tracejado.
      const piece = this.drawWedge(part, has && !isNew);
      this.compass.add(piece);

      const letter = this.add
        .text(
          Math.cos(toRad(part.centerAngle)) * (RADIUS * 0.62),
          Math.sin(toRad(part.centerAngle)) * (RADIUS * 0.62),
          part.label.charAt(0),
          {
            fontFamily: "Arial",
            fontSize: "40px",
            fontStyle: "bold",
            color: has && !isNew ? "#ffffff" : "#9aa8a3"
          }
        )
        .setOrigin(0.5);

      this.compass.add(letter);
      this.pieces.push({ part, piece, letter, isNew, has });

      if (isNew) {
        this.animateNewPiece(part, piece, letter);
      }
    });

    // Miolo + agulha (só quando 100%)
    const hub = this.add.graphics();
    hub.fillStyle(COLORS.white, 1);
    hub.fillCircle(0, 0, 16);
    hub.lineStyle(4, COLORS.ink, 1);
    hub.strokeCircle(0, 0, 16);
    this.compass.add(hub);

    if (this.complete) {
      this.createNeedle();
    }

    // Letras sempre por cima da agulha, com contorno para ler bem
    this.pieces.forEach(({ letter }) => {
      letter.setStroke("#18332c", 6);
      this.compass.bringToTop(letter);
    });
  }

  drawWedge(part, filled) {
    const g = this.add.graphics();
    const start = toRad(part.centerAngle - 45);
    const end = toRad(part.centerAngle + 45);

    g.fillStyle(filled ? part.color : 0xd9e2de, filled ? 1 : 0.85);
    g.slice(0, 0, RADIUS, start, end, false);
    g.fillPath();

    g.lineStyle(4, filled ? COLORS.ink : 0x9aa8a3, 1);
    g.slice(0, 0, RADIUS, start, end, false);
    g.strokePath();

    return g;
  }

  animateNewPiece(part, oldPiece, letter) {
    // Substitui o fatiado cinza pela peça colorida, com "pop".
    oldPiece.destroy();

    const colored = this.drawWedge(part, true);
    this.compass.add(colored);
    this.compass.bringToTop(letter);

    letter.setColor("#ffffff");

    if (this.reduceMotion) {
      return;
    }

    const dist = RADIUS * 0.55;
    const dx = Math.cos(toRad(part.centerAngle)) * dist;
    const dy = Math.sin(toRad(part.centerAngle)) * dist;

    colored.setAlpha(0).setPosition(dx * 2.2, dy * 2.2).setScale(0.4);
    letter.setAlpha(0);

    this.tweens.add({
      targets: colored,
      alpha: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: 900,
      delay: 450,
      ease: "Back.easeOut"
    });

    this.tweens.add({
      targets: letter,
      alpha: 1,
      scale: { from: 0.4, to: 1 },
      duration: 600,
      delay: 1100,
      ease: "Back.easeOut"
    });
  }

  createNeedle() {
    const needle = this.add.graphics();

    needle.fillStyle(0xe85d4a, 1);
    needle.fillTriangle(0, -(RADIUS * 0.82), -14, 0, 14, 0);
    needle.fillStyle(COLORS.white, 1);
    needle.fillTriangle(0, RADIUS * 0.82, -14, 0, 14, 0);
    needle.lineStyle(3, COLORS.ink, 1);
    needle.strokeTriangle(0, -(RADIUS * 0.82), -14, 0, 14, 0);
    needle.strokeTriangle(0, RADIUS * 0.82, -14, 0, 14, 0);

    this.compass.add(needle);

    if (this.reduceMotion) {
      return;
    }

    needle.setAngle(-120);

    this.tweens.add({
      targets: needle,
      angle: { from: -120, to: 0 },
      duration: 1800,
      delay: 1300,
      ease: "Elastic.easeOut"
    });
  }

  // ---------------------------------------------------------
  // PROGRESSO 1/4, 2/4, 3/4, 4/4
  // ---------------------------------------------------------
  createProgressBar() {
    const boxW = 110;
    const gap = 12;
    const total = TOTAL_PHASES * boxW + (TOTAL_PHASES - 1) * gap;
    const startX = CENTER_X - total / 2;
    const y = 545;

    const g = this.add.graphics();

    for (let i = 0; i < TOTAL_PHASES; i += 1) {
      const x = startX + i * (boxW + gap);
      const filled = i < this.done;

      g.fillStyle(filled ? COMPASS_PARTS[i].color : 0xffffff, 1);
      g.fillRoundedRect(x, y, boxW, 30, 14);
      g.lineStyle(4, COLORS.ink, 1);
      g.strokeRoundedRect(x, y, boxW, 30, 14);
    }

    this.add
      .text(
        CENTER_X,
        y + 56,
        this.complete
          ? "4/4  •  Bússola 100% reconstruída!"
          : `${this.done}/${TOTAL_PHASES}  •  ${Math.round((this.done / TOTAL_PHASES) * 100)}% da bússola`,
        {
          fontFamily: "Arial",
          fontSize: "24px",
          fontStyle: "bold",
          color: "#07543d"
        }
      )
      .setOrigin(0.5);

    if (this.complete && isBonusUnlocked(GameState.get())) {
      this.add
        .text(
          CENTER_X,
          y + 90,
          "🌟 A bússola revelou um caminho secreto: a FASE BÔNUS!",
          {
            fontFamily: "Arial",
            fontSize: "19px",
            fontStyle: "bold",
            color: "#b45309"
          }
        )
        .setOrigin(0.5);
    }
  }

  // ---------------------------------------------------------
  // PERSONAGEM COMEMORANDO
  // ---------------------------------------------------------
  createGuide(state) {
    const avatar = getAvatar(state.avatar);

    const emoji = this.add
      .text(190, 330, avatar.emoji, {
        fontFamily: "Arial",
        fontSize: "110px"
      })
      .setOrigin(0.5);

    const bubble = this.add.graphics();
    bubble.fillStyle(COLORS.white, 1);
    bubble.fillRoundedRect(70, 175, 240, 80, 20);
    bubble.lineStyle(4, COLORS.forest, 1);
    bubble.strokeRoundedRect(70, 175, 240, 80, 20);

    this.add
      .text(
        190,
        215,
        this.complete ? "Conseguimos!!" : "Muito bem!",
        {
          fontFamily: "Arial",
          fontSize: "24px",
          fontStyle: "bold",
          color: "#07543d"
        }
      )
      .setOrigin(0.5);

    if (!this.reduceMotion) {
      this.tweens.add({
        targets: emoji,
        y: 312,
        duration: 450,
        yoyo: true,
        repeat: this.complete ? 6 : 2,
        ease: "Sine.easeInOut"
      });
    }
  }

  // ---------------------------------------------------------
  // BOTÃO
  // ---------------------------------------------------------
  createContinueButton() {
    const x = 1090;
    const y = 400;

    const shadow = this.add.rectangle(x + 5, y + 7, 300, 74, 0x000000, 0.15);

    const button = this.add
      .rectangle(x, y, 300, 74, COLORS.forest)
      .setStrokeStyle(4, COLORS.white)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(x, y, "CONTINUAR  →", {
        fontFamily: "Arial",
        fontSize: "27px",
        fontStyle: "bold",
        color: "#ffffff"
      })
      .setOrigin(0.5);

    button.on("pointerover", () => {
      button.setScale(1.04);
      text.setScale(1.04);
      shadow.setScale(1.04);
    });

    button.on("pointerout", () => {
      button.setScale(1);
      text.setScale(1);
      shadow.setScale(1);
    });

    button.on("pointerdown", () => this.next());

    this.input.keyboard?.once("keydown-ENTER", () => this.next());
    this.input.keyboard?.once("keydown-SPACE", () => this.next());
  }

  next() {
    if (this.leaving) {
      return;
    }

    this.leaving = true;
    AudioManager.stop();

    this.scene.start("VictoryScene", {
      ...this.payload,
      skipCompass: true
    });
  }

  playReward() {
    AudioManager.playChime(this.complete);
  }
}