import { useEffect, useRef, useState } from "react";

import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import {
  IDENTIFY,
  continueAdventure,
  identifyPlayer,
  restartFromZero
} from "../services/PlayerSession.js";
import { AudioManager } from "../systems/AudioManager.js";

const INTRO_SPEECH =
  "Escolha um apelido para guardar sua aventura. Não precisa usar seu nome de verdade!";

function ProfileSummary({ profile }) {
  return (
    <>
      <p>
        Encontramos uma aventura de <strong>{profile.nickname}</strong>.
      </p>

      <dl className="summary">
        <div className="summary__item">
          <dt>Fase atual</dt>
          <dd>{profile.currentPhase}</dd>
        </div>
        <div className="summary__item">
          <dt>Pontuação</dt>
          <dd>{profile.score}</dd>
        </div>
        <div className="summary__item">
          <dt>Estrelas</dt>
          <dd>{profile.stars}</dd>
        </div>
      </dl>

      <p>Você quer continuar?</p>
    </>
  );
}

/**
 * Tela "Quem está jogando?".
 *  onBack()   volta ao menu
 *  onReady()  o jogador está identificado: segue para a escolha do avatar
 */
export default function ProfileScreen({ onBack, onReady }) {
  const inputRef = useRef(null);

  const [nickname, setNickname] = useState("");
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState(null); // { text, tone: "info" | "error" }
  const [found, setFound] = useState(null); // perfil encontrado
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    AudioManager.speak(INTRO_SPEECH);

    return () => AudioManager.stop();
  }, []);

  function showError(text) {
    setMessage({ text, tone: "error" });
    AudioManager.speak(text);
    inputRef.current?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (checking) {
      return;
    }

    setChecking(true);
    setMessage({ text: "Verificando seu apelido...", tone: "info" });

    const result = await identifyPlayer(nickname);

    setChecking(false);

    if (result.kind === IDENTIFY.NEW_PLAYER) {
      onReady();
      return;
    }

    if (result.kind === IDENTIFY.EXISTING_PLAYER) {
      setMessage(null);
      setConfirmingReset(false);
      setFound(result.profile);
      return;
    }

    showError(result.message);
  }

  function closeChoice() {
    setFound(null);
    setConfirmingReset(false);
    inputRef.current?.focus();
  }

  async function handleContinue() {
    await continueAdventure(found);
    onReady();
  }

  async function handleRestart() {
    await restartFromZero(found);
    onReady();
  }

  const messageClass = message?.tone === "error" ? "field__message field__message--error" : "field__message";

  return (
    <div className="screen">
      <div className="decor" aria-hidden="true">
        <div className="decor__sun" />
        <div className="decor__hill decor__hill--left" />
        <div className="decor__hill decor__hill--right" />
        <div className="decor__bushes" />
      </div>

      <div className="page">
        <header className="page__header">
          <h1 className="page__title">QUEM ESTÁ JOGANDO?</h1>
          <p className="page__subtitle">
            Escolha um apelido para guardar sua aventura.
          </p>
        </header>

        <form className="form-card" onSubmit={handleSubmit} noValidate>
          <label className="field__label" htmlFor="nickname">
            Seu apelido
          </label>

          <input
            id="nickname"
            ref={inputRef}
            className="field__input"
            type="text"
            value={nickname}
            maxLength={15}
            placeholder="Ex.: Aventureiro"
            autoComplete="off"
            spellCheck={false}
            aria-describedby="nickname-hint nickname-message"
            aria-invalid={message?.tone === "error"}
            disabled={checking}
            onChange={event => setNickname(event.target.value)}
          />

          <p id="nickname-hint" className="field__hint">
            De 2 a 15 letras ou números. Não precisa usar seu nome de verdade!
          </p>

          <p
            id="nickname-message"
            className={messageClass}
            role={message?.tone === "error" ? "alert" : "status"}
          >
            {message ? message.text : ""}
          </p>

          <div className="form-actions">
            <Button type="submit" icon="➜" disabled={checking}>
              {checking ? "Verificando..." : "Continuar"}
            </Button>

            <Button
              variant="light"
              size="md"
              icon="←"
              disabled={checking}
              onClick={onBack}
            >
              Voltar
            </Button>
          </div>
        </form>
      </div>

      {found && !confirmingReset ? (
        <Modal
          title="Aventura encontrada"
          onClose={closeChoice}
          footer={
            <>
              <Button size="md" onClick={handleContinue}>
                Continuar aventura
              </Button>
              <Button
                size="md"
                variant="secondary"
                onClick={() => setConfirmingReset(true)}
              >
                Começar do zero
              </Button>
              <Button size="md" variant="light" onClick={closeChoice}>
                Escolher outro
              </Button>
            </>
          }
        >
          <ProfileSummary profile={found} />
        </Modal>
      ) : null}

      {found && confirmingReset ? (
        <Modal
          title="Começar do zero?"
          onClose={() => setConfirmingReset(false)}
          footer={
            <>
              <Button size="md" variant="light" onClick={() => setConfirmingReset(false)}>
                Não, voltar
              </Button>
              <Button size="md" variant="secondary" onClick={handleRestart}>
                Sim, começar do zero
              </Button>
            </>
          }
        >
          <p>
            O progresso de <strong>{found.nickname}</strong> será apagado:
            fases, pontos e estrelas.
          </p>
          <p>Tem certeza?</p>
        </Modal>
      ) : null}
    </div>
  );
}