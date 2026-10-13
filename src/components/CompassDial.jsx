import { COMPASS_PARTS } from "../data/compassData.js";

const CENTER = 200;
const RADIUS = 150;
const RING = 172;
const NEEDLE = RADIUS * 0.82;

const INK = "#18332c";
const EMPTY_FILL = "#d9e2de";
const EMPTY_STROKE = "#9aa8a3";

const toHex = color => `#${color.toString(16).padStart(6, "0")}`;
const toRadians = degrees => (degrees * Math.PI) / 180;

function polar(angle, distance) {
  return {
    x: CENTER + Math.cos(toRadians(angle)) * distance,
    y: CENTER + Math.sin(toRadians(angle)) * distance
  };
}

/** Fatia (quadrante) da bússola, centrada em centerAngle. */
function wedgePath(centerAngle) {
  const start = polar(centerAngle - 45, RADIUS);
  const end = polar(centerAngle + 45, RADIUS);

  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    `A ${RADIUS} ${RADIUS} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
    "Z"
  ].join(" ");
}

/**
 * Bússola desenhada em SVG: 4 peças (Norte, Leste, Sul, Oeste), uma por
 * fase concluída. Com as 4 peças, aparece a agulha.
 *
 *  completedPhases: fases já concluídas
 *  newPhase:        fase recém-concluída (a peça dela entra animada)
 *  complete:        bússola 100% (mostra a agulha)
 */
export default function CompassDial({ completedPhases, newPhase, complete }) {
  const earned = new Set(completedPhases.map(Number));

  const names = COMPASS_PARTS.filter(part => earned.has(part.phase)).map(
    part => part.label
  );

  const description =
    names.length === 0
      ? "Bússola ainda sem peças montadas."
      : `Bússola com ${names.length} de ${COMPASS_PARTS.length} peças montadas: ${names.join(", ")}.`;

  return (
    <svg
      className="dial"
      viewBox="0 0 400 400"
      role="img"
      aria-label={description}
    >
      <circle cx={CENTER + 6} cy={CENTER + 8} r={RING + 2} fill="rgba(0,0,0,0.12)" />
      <circle className="dial__ring" cx={CENTER} cy={CENTER} r={RING} />
      <circle className="dial__face" cx={CENTER} cy={CENTER} r={RADIUS + 2} />

      {COMPASS_PARTS.map(part => {
        const has = earned.has(part.phase);
        const isNew = has && part.phase === newPhase;

        // De onde a peça "voa" até o lugar dela (só na peça nova)
        const from = polar(part.centerAngle, RADIUS * 0.55 * 2.2);
        const offset = {
          "--dx": `${(from.x - CENTER).toFixed(1)}px`,
          "--dy": `${(from.y - CENTER).toFixed(1)}px`
        };

        return (
          <path
            key={part.id}
            d={wedgePath(part.centerAngle)}
            fill={has ? toHex(part.color) : EMPTY_FILL}
            stroke={has ? INK : EMPTY_STROKE}
            strokeWidth="4"
            strokeLinejoin="round"
            className={isNew ? "dial__piece dial__piece--new" : "dial__piece"}
            style={isNew ? offset : undefined}
          />
        );
      })}

      <circle className="dial__hub" cx={CENTER} cy={CENTER} r="16" />

      {complete ? (
        <g className="dial__needle">
          <polygon
            points={`${CENTER},${CENTER - NEEDLE} ${CENTER - 14},${CENTER} ${CENTER + 14},${CENTER}`}
            fill="#e85d4a"
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <polygon
            points={`${CENTER},${CENTER + NEEDLE} ${CENTER - 14},${CENTER} ${CENTER + 14},${CENTER}`}
            fill="#ffffff"
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>
      ) : null}

      {COMPASS_PARTS.map(part => {
        const has = earned.has(part.phase);
        const isNew = has && part.phase === newPhase;
        const position = polar(part.centerAngle, RADIUS * 0.62);

        return (
          <text
            key={part.id}
            x={position.x}
            y={position.y}
            textAnchor="middle"
            dominantBaseline="central"
            className={isNew ? "dial__letter dial__letter--new" : "dial__letter"}
            fill={has ? "#ffffff" : EMPTY_STROKE}
            stroke={has ? INK : "none"}
            strokeWidth={has ? 6 : 0}
            paintOrder="stroke"
            aria-hidden="true"
          >
            {part.label.charAt(0)}
          </text>
        );
      })}
    </svg>
  );
}