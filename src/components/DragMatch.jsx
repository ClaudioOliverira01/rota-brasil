import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";

// Quantos pixels o dedo/mouse precisa andar para virar "arrastar"
// (menos que isso é só um toque/clique).
const DRAG_THRESHOLD = 8;

// Perto da borda da tela, arrastar rola a página sozinho (celular).
const EDGE_ZONE = 80;
const EDGE_SPEED = 14;

/** Qual destino está sob o ponto (x, y) da tela? */
function targetIdAt(x, y) {
  const hit = document
    .elementsFromPoint(x, y)
    .find(element => element.dataset && element.dataset.targetId);

  return hit ? hit.dataset.targetId : null;
}

/** Cartões coloridos (ex.: pontos cardeais) recebem suas cores por variável CSS. */
function cardStyle(item) {
  return item.color
    ? { "--card-bg": item.color, "--card-fg": item.textColor }
    : undefined;
}

const MAP_CELLS = ["norte", "nordeste", "centro-oeste", "sudeste", "sul"];

/**
 * Mapinha esquemático do Brasil (só enfeite/ajuda visual): mostra a posição
 * da região em destaque. Não é um mapa exato.
 */
function MiniMap({ region }) {
  return (
    <span className="minimap" aria-hidden="true">
      {MAP_CELLS.map(cell => (
        <span
          key={cell}
          className={
            cell === region
              ? `minimap__cell minimap__cell--${cell} minimap__cell--on`
              : `minimap__cell minimap__cell--${cell}`
          }
        />
      ))}
    </span>
  );
}

function CardFace({ item }) {
  return (
    <>
      <span className="card__emoji" aria-hidden="true">
        {item.emoji}
      </span>

      <span className="card__text">
        <span className="card__label">{item.label}</span>
        {item.detail ? (
          <span className="card__detail">{item.detail}</span>
        ) : null}
      </span>
    </>
  );
}

/**
 * Motor "arrastar e combinar": cartões que precisam ir para o destino certo.
 * Serve para as Fases 1, 2, 3 e 4. Quem usa decide o que é certo ou errado;
 * este componente só cuida de COMO o jogador interage.
 *
 * Três formas de jogar (todas sempre disponíveis):
 *   1. ARRASTAR o cartão até o destino (mouse, dedo ou caneta);
 *   2. TOCAR no cartão e depois no destino;
 *   3. TECLADO: Tab até o cartão, Enter, Tab até o destino, Enter.
 * O cartão INTEIRO responde, não só o texto.
 *
 *  layout        "columns" (cartões à esquerda, destinos à direita),
 *                "bins" (cartões em cima, lixeiras embaixo) ou
 *                "compass" (cartões ao lado, destinos dispostos numa bússola)
 *  items         cartões que ainda NÃO foram colocados
 *  targets       destinos, na ordem em que aparecem
 *  placed        { idDoDestino: [cartões já colocados nele] }
 *  full          { idDoDestino: true } quando o destino já recebeu tudo
 *  selectedId    cartão escolhido por toque/teclado
 *  flash         { itemId, targetId, correct } feedback da última jogada
 *  onSelect(id)            tocou/clicou em um cartão
 *  onDrop(itemId, targetId|null)  soltou/escolheu um destino
 *  onTargetClick(id)       tocou/clicou em um destino
 */
const DragMatch = forwardRef(function DragMatch(
  {
    layout = "columns",
    items,
    targets,
    placed,
    full,
    selectedId,
    flash,
    onSelect,
    onDrop,
    onTargetClick
  },
  ref
) {
  const poolRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);

  const pointerRef = useRef({ x: 0, y: 0 });

  const [ghost, setGhost] = useState(null);
  const [overId, setOverId] = useState(null);

  const dragging = ghost !== null;

  // Enquanto arrasta perto do topo/rodapé, rola a tela (o dedo não precisa
  // soltar o cartão para chegar ao destino).
  useEffect(() => {
    if (!dragging) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const { x, y } = pointerRef.current;
      const area = poolRef.current?.closest(".screen");

      if (!area) {
        return;
      }

      let step = 0;

      if (y < EDGE_ZONE) {
        step = -EDGE_SPEED;
      } else if (y > window.innerHeight - EDGE_ZONE) {
        step = EDGE_SPEED;
      }

      if (step !== 0) {
        area.scrollBy(0, step);
        setOverId(targetIdAt(x, y));
      }
    }, 16);

    return () => window.clearInterval(timer);
  }, [dragging]);

  useImperativeHandle(ref, () => ({
    focusFirstCard() {
      poolRef.current?.querySelector(".card")?.focus();
    }
  }));

  function endDrag() {
    dragRef.current = null;
    setGhost(null);
    setOverId(null);
  }

  function handlePointerDown(event, item) {
    // Só o botão principal do mouse; dedo e caneta sempre valem.
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    dragRef.current = {
      item,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      active: false
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;

    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const moved = Math.hypot(
      event.clientX - drag.startX,
      event.clientY - drag.startY
    );

    if (!drag.active && moved < DRAG_THRESHOLD) {
      return;
    }

    drag.active = true;
    pointerRef.current = { x: event.clientX, y: event.clientY };

    setGhost({
      item: drag.item,
      x: event.clientX - drag.offsetX,
      y: event.clientY - drag.offsetY,
      width: drag.width,
      height: drag.height
    });

    setOverId(targetIdAt(event.clientX, event.clientY));
  }

  function handlePointerUp(event) {
    const drag = dragRef.current;

    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const wasDragging = drag.active;
    const targetId = wasDragging
      ? targetIdAt(event.clientX, event.clientY)
      : null;

    endDrag();

    if (wasDragging) {
      // O navegador ainda dispara um "click" logo depois de soltar:
      // ignoramos para não selecionar o cartão sem querer.
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);

      onDrop(drag.item.id, targetId);
    }
  }

  function handleCardClick(item) {
    if (suppressClickRef.current) {
      return;
    }

    onSelect(item.id);
  }

  return (
    <div className={`match match--${layout}`}>
      <section className="match__pool" ref={poolRef} aria-label="Cartões">
        {items.length === 0 ? (
          <p className="match__empty">Todos os cartões foram colocados!</p>
        ) : null}

        {items.map(item => {
          const selected = selectedId === item.id;
          const isOrigin = ghost?.item.id === item.id;
          const wrong = flash && !flash.correct && flash.itemId === item.id;

          const className = [
            "card",
            selected ? "card--selected" : "",
            isOrigin ? "card--origin" : "",
            wrong ? "card--wrong" : ""
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={item.id}
              type="button"
              className={className}
              style={cardStyle(item)}
              aria-pressed={selected}
              onPointerDown={event => handlePointerDown(event, item)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={endDrag}
              onContextMenu={event => event.preventDefault()}
              onClick={() => handleCardClick(item)}
            >
              <CardFace item={item} />

              {selected ? (
                <span className="card__tag">✓ ESCOLHIDO</span>
              ) : null}
            </button>
          );
        })}
      </section>

      <section
        className={
          layout === "compass"
            ? "match__targets match__targets--compass"
            : "match__targets"
        }
        aria-label={layout === "compass" ? "Bússola" : "Destinos"}
      >
        {layout === "compass" ? (
          <span className="compass__center" aria-hidden="true">
            🧭
          </span>
        ) : null}

        {targets.map(target => {
          const inside = placed[target.id] || [];
          const isFull = Boolean(full[target.id]);
          const isFlash = flash && flash.targetId === target.id;

          const className = [
            "target",
            layout === "bins" ? "target--bin" : "",
            target.slot ? `target--${target.slot}` : "",
            overId === target.id ? "target--over" : "",
            isFull ? "target--done" : "",
            isFlash && flash.correct ? "target--right" : "",
            isFlash && !flash.correct ? "target--wrong" : ""
          ]
            .filter(Boolean)
            .join(" ");

          const style = {};

          if (target.color) {
            style["--bin-bg"] = target.color;
            style["--bin-fg"] = target.textColor;
          }

          if (target.accent) {
            style["--accent"] = target.accent;
          }

          return (
            <button
              key={target.id}
              type="button"
              className={className}
              style={style}
              data-target-id={target.id}
              disabled={isFull}
              onClick={() => onTargetClick(target.id)}
            >
              {target.map ? <MiniMap region={target.map} /> : null}

              {target.emoji ? (
                <span className="target__emoji" aria-hidden="true">
                  {target.emoji}
                </span>
              ) : null}

              <span className="target__text">
                <span className="target__label">{target.label}</span>

                {target.caption ? (
                  <span className="target__caption">{target.caption}</span>
                ) : null}
              </span>

              {inside.length > 0 ? (
                <span className="target__placed">
                  {inside.map(item => (
                    <span key={item.id} className="chip">
                      <span aria-hidden="true">✓ {item.emoji}</span>{" "}
                      {item.label}
                    </span>
                  ))}
                </span>
              ) : null}

              {isFlash && !flash.correct ? (
                <span className="target__mark" aria-hidden="true">
                  ✗
                </span>
              ) : null}
            </button>
          );
        })}
      </section>

      {ghost ? (
        <div
          className="card card--ghost"
          aria-hidden="true"
          style={{
            ...cardStyle(ghost.item),
            left: ghost.x,
            top: ghost.y,
            width: ghost.width,
            height: ghost.height
          }}
        >
          <CardFace item={ghost.item} />
        </div>
      ) : null}
    </div>
  );
});

export default DragMatch;