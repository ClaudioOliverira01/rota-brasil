import { COLORS } from "../config/gameConfig.js";
import { GameState } from "../systems/GameState.js";
import { AudioManager } from "../systems/AudioManager.js";
import { AccessibilityManager } from "../systems/AccessibilityManager.js";
import { getAvatar } from "../data/gameData.js";
import { GUIDE_TIPS, GUIDE_CONFIG } from "../data/guideData.js";

/**
 * PERSONAGEM GUIA
 * Fica fixo em um canto da tela durante a fase, com balão de dica.
 *  - Toque no personagem: mostra a próxima dica (e lê em voz alta).
 *  - O balão se recolhe sozinho para não atrapalhar a jogabilidade.
 *
 * Uso (dentro de create() de uma fase):
 *   createGuide(this, 1);   // 1..4 = fases, 5 = bônus
 */
export function createGuide(scene, phaseId) {
  const tips = GUIDE_TIPS[phaseId] || GUIDE_TIPS[1];
  const avatar = getAvatar(GameState.get().avatar);
  const reduceMotion = AccessibilityManager.isReducedMotionEnabled();

  const position = GUIDE_CONFIG.positionByPhase?.[phaseId] || GUIDE_CONFIG.position;
  const left = position !== "bottom-right";
  const baseX = left ? 62 : 1280 - 62;
  const baseY = 648;

  const container = scene.add.container(0, 0).setDepth(900);

  // Sombra + círculo do personagem
  const shadow = scene.add.circle(baseX + 3, baseY + 5, 44, 0x000000, 0.18);

  const disc = scene.add
    .circle(baseX, baseY, 44, COLORS.card)
    .setStrokeStyle(5, COLORS.forest)
    .setInteractive({ useHandCursor: true });

  const face = scene.add
    .text(baseX, baseY, avatar.emoji, {
      fontFamily: "Arial",
      fontSize: "50px"
    })
    .setOrigin(0.5);

  // Selo "dica"
  const badge = scene.add.circle(baseX + (left ? 34 : -34), baseY - 34, 15, COLORS.sun).setStrokeStyle(3, COLORS.ink);
  const badgeText = scene.add
    .text(baseX + (left ? 34 : -34), baseY - 34, "?", {
      fontFamily: "Arial",
      fontSize: "20px",
      fontStyle: "bold",
      color: "#18332c"
    })
    .setOrigin(0.5);

  // Balão
  const bubbleW = 260;
  // Canto esquerdo: balão ACIMA do personagem. Canto direito: balão AO LADO.
  const bubbleX = left ? 12 : baseX - 58 - bubbleW;
  const bubbleG = scene.add.graphics();
  const bubbleText = scene.add.text(0, 0, "", {
    fontFamily: "Arial",
    fontSize: "16px",
    fontStyle: "bold",
    color: "#18332c",
    wordWrap: { width: bubbleW - 24 },
    lineSpacing: 3
  });

  container.add([shadow, bubbleG, bubbleText, disc, face, badge, badgeText]);

  let index = 0;
  let hideTimer = null;

  function drawBubble() {
    const textH = bubbleText.height;
    const h = textH + 24;
    const bottom = left ? baseY - 58 : baseY + 40;
    const top = bottom - h;

    bubbleG.clear();
    bubbleG.fillStyle(COLORS.white, 1);
    bubbleG.fillRoundedRect(bubbleX, top, bubbleW, h, 16);
    bubbleG.lineStyle(4, COLORS.forest, 1);
    bubbleG.strokeRoundedRect(bubbleX, top, bubbleW, h, 16);

    bubbleG.fillStyle(COLORS.white, 1);

    if (left) {
      // rabinho para baixo, apontando para o personagem
      bubbleG.fillTriangle(baseX - 12, bottom - 2, baseX + 12, bottom - 2, baseX, bottom + 14);
      bubbleG.lineStyle(4, COLORS.forest, 1);
      bubbleG.lineBetween(baseX - 12, bottom, baseX, bottom + 14);
      bubbleG.lineBetween(baseX + 12, bottom, baseX, bottom + 14);
    } else {
      // rabinho para a direita
      const ex = bubbleX + bubbleW;
      const ty = bottom - 22;
      bubbleG.fillTriangle(ex - 2, ty - 12, ex - 2, ty + 12, ex + 14, ty);
      bubbleG.lineStyle(4, COLORS.forest, 1);
      bubbleG.lineBetween(ex, ty - 12, ex + 14, ty);
      bubbleG.lineBetween(ex, ty + 12, ex + 14, ty);
    }

    bubbleText.setPosition(bubbleX + 12, top + 12);
  }

  function setBubbleVisible(visible) {
    bubbleG.setVisible(visible);
    bubbleText.setVisible(visible);
  }

  function showTip(i, { speak = false } = {}) {
    index = (i + tips.length) % tips.length;
    bubbleText.setText(tips[index]);
    drawBubble();
    setBubbleVisible(true);

    if (speak) {
      AudioManager.speak(tips[index]);
    }

    if (hideTimer) {
      hideTimer.remove(false);
    }

    hideTimer = scene.time.delayedCall(
      GUIDE_CONFIG.bubbleSeconds * 1000,
      () => setBubbleVisible(false)
    );

    if (!reduceMotion) {
      scene.tweens.add({
        targets: [disc, face],
        scale: { from: 1, to: 1.12 },
        duration: 140,
        yoyo: true
      });
    }
  }

  disc.on("pointerdown", () => {
    // 1º toque com balão fechado reabre a dica atual; depois avança
    const open = bubbleText.visible;
    showTip(open ? index + 1 : index, { speak: true });
  });

  showTip(0);

  scene.events.once("shutdown", () => {
    if (hideTimer) {
      hideTimer.remove(false);
    }
  });

  return { container, showTip };
}