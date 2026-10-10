import { useEffect, useRef, useState } from "react";

import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import Switch from "../components/Switch.jsx";
import { AccessibilityManager } from "../systems/AccessibilityManager.js";
import { AudioManager } from "../systems/AudioManager.js";

const ACCESSIBILITY_OPTIONS = [
  {
    key: "narration",
    icon: "🔊",
    label: "Narração",
    onText: "ATIVADA",
    offText: "DESATIVADA"
  },
  {
    key: "highContrast",
    icon: "👁️",
    label: "Alto contraste",
    onText: "ATIVADO",
    offText: "DESATIVADO"
  },
  {
    key: "reducedMotion",
    icon: "🎬",
    label: "Menos movimento",
    onText: "ATIVADO",
    offText: "DESATIVADO"
  },
  {
    key: "dyslexiaFont",
    icon: "📖",
    label: "Fonte para dislexia",
    onText: "ATIVADA",
    offText: "DESATIVADA"
  }
];

function HowToPlayContent() {
  return (
    <>
      <p>Você vai viajar pelo Brasil com Aê!</p>

      <ul className="modal__list">
        <li>🧭 Explore os pontos cardeais.</li>
        <li>🗺️ Conheça paisagens e regiões.</li>
        <li>🌱 Descubra biomas e sustentabilidade.</li>
      </ul>

      <p>Você aprende tentando. Se errar, tente novamente!</p>
      <p>⌨️ No computador, use as setas e ENTER.</p>
    </>
  );
}

function AccessibilityContent({ settings, onToggle }) {
  return (
    <>
      <p>Toque em um recurso para ativar ou desativar:</p>

      <div className="switch-list">
        {ACCESSIBILITY_OPTIONS.map(option => (
          <Switch
            key={option.key}
            icon={option.icon}
            label={option.label}
            onText={option.onText}
            offText={option.offText}
            checked={Boolean(settings[option.key])}
            onChange={() => onToggle(option.key)}
          />
        ))}
      </div>
    </>
  );
}

/**
 * Tela inicial do jogo.
 *  onStart()        leva o jogador ao jogo (cena de Perfil no Phaser)
 *  onOpenRanking()  abre a tela de Ranking
 */
export default function MenuScreen({ onStart, onOpenRanking }) {
  const actionsRef = useRef(null);

  const [modal, setModal] = useState(null); // null | "how" | "accessibility"
  const [settings, setSettings] = useState(() =>
    AccessibilityManager.getSettings()
  );

  // Boas-vindas por voz (se a narração estiver ativada)
  useEffect(() => {
    if (AccessibilityManager.isNarrationEnabled()) {
      AudioManager.speak("Bem-vindo à Rota Brasil. A Expedição de Aê.");
    }

    return () => AudioManager.stop();
  }, []);

  // Teclado: setas ↑ ↓ percorrem os botões do menu
  useEffect(() => {
    if (modal) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
        return;
      }

      const buttons = Array.from(actionsRef.current.querySelectorAll("button"));
      const current = buttons.indexOf(document.activeElement);

      let next;

      if (current === -1) {
        next = event.key === "ArrowDown" ? 0 : buttons.length - 1;
      } else if (event.key === "ArrowDown") {
        next = (current + 1) % buttons.length;
      } else {
        next = (current - 1 + buttons.length) % buttons.length;
      }

      event.preventDefault();
      buttons[next].focus();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modal]);

  function leave(action) {
    AudioManager.stop();
    action();
  }

  function toggleSetting(key) {
    AccessibilityManager.set({ [key]: !settings[key] });

    if (key === "narration") {
      AudioManager.stop();
    }

    setSettings(AccessibilityManager.getSettings());
  }

  return (
    <div className="screen">
      <div className="decor" aria-hidden="true">
        <div className="decor__sun" />
        <div className="decor__hill decor__hill--left" />
        <div className="decor__hill decor__hill--right" />
        <div className="decor__bushes" />
      </div>

      <div className="menu">
        <h1 className="menu__title">ROTA BRASIL</h1>
        <p className="menu__subtitle">A Expedição de Aê</p>

        <div className="menu__mascot" role="img" aria-label="Aê, o tucano explorador">
          🦜
        </div>

        <p className="menu__greeting">Olá, explorador!</p>

        <nav className="menu__actions" ref={actionsRef} aria-label="Menu principal">
          <Button icon="▶" onClick={() => leave(onStart)}>
            Começar
          </Button>

          <Button
            icon="📖"
            variant="secondary"
            size="md"
            onClick={() => setModal("how")}
          >
            Como jogar
          </Button>

          <Button
            icon="⚙"
            variant="light"
            size="md"
            onClick={() => setModal("accessibility")}
          >
            Acessibilidade
          </Button>

          <Button
            icon="🏆"
            variant="secondary"
            size="sm"
            onClick={() => leave(onOpenRanking)}
          >
            Ranking
          </Button>
        </nav>
      </div>

      {modal === "how" ? (
        <Modal title="Como jogar" closeLabel="ENTENDI!" onClose={() => setModal(null)}>
          <HowToPlayContent />
        </Modal>
      ) : null}

      {modal === "accessibility" ? (
        <Modal title="Acessibilidade" closeLabel="PRONTO!" onClose={() => setModal(null)}>
          <AccessibilityContent settings={settings} onToggle={toggleSetting} />
        </Modal>
      ) : null}
    </div>
  );
}