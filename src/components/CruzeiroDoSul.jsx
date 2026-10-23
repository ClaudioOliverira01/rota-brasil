// ARQUIVO: src/components/CruzeiroDoSul.jsx  (CRIAR)
/**
 * Desenho esquemático da constelação do Cruzeiro do Sul (5 estrelas).
 * Não é um mapa de céu exato: as posições são simplificadas para crianças.
 *
 *  labels   mostra o nome de cada estrela
 *  axis     mostra a linha do braço comprido apontando para o Sul
 *  title    se informado, o desenho é lido por leitores de tela;
 *           sem título, é só enfeite (aria-hidden)
 */
const STARS = [
  { id: "gacrux", name: "Gacrux", x: 50, y: 14, r: 6.5, label: "right" },
  { id: "acrux", name: "Acrux", x: 50, y: 106, r: 8, label: "right" },
  { id: "mimosa", name: "Mimosa", x: 14, y: 56, r: 7, label: "below" },
  { id: "imai", name: "Imai", x: 86, y: 58, r: 5.5, label: "below" },
  { id: "intrometida", name: "Intrometida", x: 66, y: 88, r: 3.6, label: "right" }
];

/** Pontos de uma estrela de 5 pontas centrada em (cx, cy). */
function starPoints(cx, cy, outer) {
  const inner = outer * 0.45;
  const points = [];

  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    points.push(
      `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`
    );
  }

  return points.join(" ");
}

export default function CruzeiroDoSul({
  labels = false,
  axis = false,
  title = "",
  className = ""
}) {
  const readable = Boolean(title);
  const width = labels ? 140 : 100;
  const height = axis ? 154 : 124;
  const viewBox = `${labels ? -6 : 0} 0 ${width} ${height}`;

  return (
    <svg
      className={["cruzeiro", className].filter(Boolean).join(" ")}
      viewBox={viewBox}
      role={readable ? "img" : undefined}
      aria-label={readable ? title : undefined}
      aria-hidden={readable ? undefined : "true"}
      focusable="false"
    >
      {/* braços da cruz */}
      <g className="cruzeiro__lines">
        <line x1="50" y1="14" x2="50" y2="106" />
        <line x1="14" y1="56" x2="86" y2="58" />
      </g>

      {axis ? (
        <g className="cruzeiro__axis">
          <line x1="50" y1="106" x2="50" y2="146" />
          <polygon points="44,138 50,148 56,138" />
        </g>
      ) : null}

      {STARS.map((star, index) => (
        <g key={star.id}>
          <polygon
            className="cruzeiro__star"
            points={starPoints(star.x, star.y, star.r)}
            style={{ animationDelay: `${index * 0.45}s` }}
          />

          {labels ? (
            <text
              className="cruzeiro__name"
              x={star.label === "right" ? star.x + star.r + 4 : star.x}
              y={star.label === "right" ? star.y + 3 : star.y + star.r + 11}
              textAnchor={star.label === "right" ? "start" : "middle"}
            >
              {star.name}
            </text>
          ) : null}
        </g>
      ))}

      {axis ? (
        <text className="cruzeiro__name" x="60" y="144" textAnchor="start">
          Sul
        </text>
      ) : null}
    </svg>
  );
}