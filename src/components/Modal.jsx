import { useEffect, useId, useRef } from "react";

import Button from "./Button.jsx";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Janela de diálogo acessível:
 *  - leitores de tela a anunciam como diálogo (role="dialog", aria-modal)
 *  - o foco entra na janela, fica preso nela e volta ao botão de origem
 *  - ESC e clique fora fecham
 */
export default function Modal({
  title,
  onClose,
  closeLabel = "ENTENDI!",
  children
}) {
  const titleId = useId();
  const dialogRef = useRef(null);

  // Guarda o onClose mais recente sem reiniciar o efeito a cada render
  // (se reiniciasse, o foco pularia para o 1º botão a cada clique).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement;

    const getFocusable = () => Array.from(dialog.querySelectorAll(FOCUSABLE));

    (getFocusable()[0] || dialog).focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const items = getFocusable();

      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
  }, []);

  function handleOverlayMouseDown(event) {
    if (event.target === event.currentTarget) {
      onCloseRef.current();
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <h2 id={titleId} className="modal__title">
          {title}
        </h2>

        <div className="modal__body">{children}</div>

        <div className="modal__footer">
          <Button size="md" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}