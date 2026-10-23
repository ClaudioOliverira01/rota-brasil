import { useState } from "react";

import Button from "./Button.jsx";
import Modal from "./Modal.jsx";

/**
 * Barra do topo das telas de jogo: SEMPRE oferece uma saída para o menu,
 * com confirmação (para a criança não perder a fase sem querer).
 *
 *  title      título da fase
 *  score      pontos (opcional)
 *  titleRef   ref para o foco inicial do título
 *  onExit()   chamado DEPOIS de a criança confirmar que quer sair
 *  onRestart  (opcional) mostra o botão "Reiniciar" e é chamado depois da
 *             confirmação
 */
export default function GameBar({ title, score, titleRef, onExit, onRestart }) {
  const [dialog, setDialog] = useState(null); // null | "exit" | "restart"

  const close = () => setDialog(null);

  return (
    <>
      <header className="gamebar">
        <div className="gamebar__actions">
          <Button
            variant="light"
            size="sm"
            icon="🏠"
            onClick={() => setDialog("exit")}
          >
            Menu
          </Button>

          {onRestart ? (
            <Button
              variant="light"
              size="sm"
              icon="↻"
              onClick={() => setDialog("restart")}
            >
              Reiniciar
            </Button>
          ) : null}
        </div>

        <h1 className="gamebar__title" ref={titleRef} tabIndex={-1}>
          {title}
        </h1>

        {score !== undefined ? (
          <p className="hud">
            <span aria-hidden="true">⭐</span> {score}
            <span className="visually-hidden"> pontos</span>
          </p>
        ) : (
          <span />
        )}
      </header>

      {dialog === "exit" ? (
        <Modal
          title="Voltar ao menu?"
          onClose={close}
          footer={
            <>
              <Button size="md" onClick={close}>
                Continuar jogando
              </Button>
              <Button
                size="md"
                variant="secondary"
                onClick={() => {
                  close();
                  onExit();
                }}
              >
                Voltar ao menu
              </Button>
            </>
          }
        >
          <p>
            Se você sair agora, o que fez nesta fase não será salvo. As fases
            que você já terminou continuam salvas.
          </p>
        </Modal>
      ) : null}

      {dialog === "restart" ? (
        <Modal
          title="Recomeçar a fase?"
          onClose={close}
          footer={
            <>
              <Button size="md" onClick={close}>
                Não, continuar
              </Button>
              <Button
                size="md"
                variant="secondary"
                onClick={() => {
                  close();
                  onRestart();
                }}
              >
                Sim, recomeçar
              </Button>
            </>
          }
        >
          <p>Os pontos desta fase voltam a zero e os cartões são embaralhados.</p>
        </Modal>
      ) : null}
    </>
  );
}

/**
 * Botão flutuante "Menu" para as telas que ainda são do Phaser
 * (enquanto a migração não termina), também com confirmação.
 */
export function FloatingMenuButton({ onExit }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="floating-menu">
        <Button variant="light" size="sm" icon="🏠" onClick={() => setOpen(true)}>
          Menu
        </Button>
      </div>

      {open ? (
        <Modal
          title="Voltar ao menu?"
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button size="md" onClick={() => setOpen(false)}>
                Continuar jogando
              </Button>
              <Button
                size="md"
                variant="secondary"
                onClick={() => {
                  setOpen(false);
                  onExit();
                }}
              >
                Voltar ao menu
              </Button>
            </>
          }
        >
          <p>
            Se você sair agora, o que fez nesta fase não será salvo. As fases
            que você já terminou continuam salvas.
          </p>
        </Modal>
      ) : null}
    </>
  );
}