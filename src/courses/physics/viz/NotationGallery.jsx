import { useState, useEffect } from "react";

const DEFAULT_VEC = [3, 4];

const NOTATIONS = [
  {
    id: "arrow",
    display: "A⃗",
    label: "Arrow notation",
    description: "Handwritten physics. The arrow above the letter signals a vector.",
    color: "#6366f1",
  },
  {
    id: "bold",
    display: "𝐀",
    label: "Bold notation",
    description: "Printed textbooks and linear algebra. Bold replaces the arrow in typeset math.",
    color: "#f59e0b",
  },
  {
    id: "bracket",
    display: "(Aₓ, Aᵧ)",
    label: "Component form",
    description: "Ordered pair. Each number is the vector's reach along one axis.",
    color: "#10b981",
  },
  {
    id: "polar",
    display: "|A⃗| ∠ θ",
    label: "Polar form",
    description: "Engineering notation. Magnitude first, then the angle from +x axis.",
    color: "#f43f5e",
  },
  {
    id: "unit",
    display: "Aₓî + Aᵧĵ",
    label: "Unit-vector form",
    description: "Fully explicit. Each basis vector shows which axis the component belongs to.",
    color: "#0ea5e9",
  },
];

const W = 300, H = 240, CX = 100, CY = 150, SC = 38;

function ts(x, y) { return [CX + x * SC, CY - y * SC]; }

function VectorDiagram({ vec, highlightColor, activeId }) {
  const [Ax, Ay] = vec;
  const [ox, oy] = ts(0, 0);
  const [hx, hy] = ts(Ax, Ay);
  const [px, py] = ts(Ax, 0);
  const mag = Math.sqrt(Ax * Ax + Ay * Ay).toFixed(2);
  const theta = (Math.atan2(Ay, Ax) * 180 / Math.PI).toFixed(1);

  const showComponents = ["bracket", "unit", "polar"].includes(activeId);
  const showAngle = ["polar"].includes(activeId);

  const arcR = 28;
  const arcAngle = parseFloat(theta) * Math.PI / 180;
  const arcX = CX + arcR * Math.cos(0), arcY = CY;
  const arcX2 = CX + arcR * Math.cos(-arcAngle), arcY2 = CY + arcR * Math.sin(-arcAngle);
  const sweepFlag = Ay >= 0 ? 0 : 1;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {/* Grid */}
      {[-2, -1, 0, 1, 2, 3].map(i => {
        const [x1, y1] = ts(i, -2.5), [x2, y2] = ts(i, 2.5);
        const [x3, y3] = ts(-1.5, i), [x4, y4] = ts(4, i);
        return <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a2540" strokeWidth={0.5} />
          <line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#1a2540" strokeWidth={0.5} />
        </g>;
      })}
      <line x1={0} y1={oy} x2={W} y2={oy} stroke="#334155" strokeWidth={1} />
      <line x1={ox} y1={0} x2={ox} y2={H} stroke="#334155" strokeWidth={1} />

      {/* Component lines */}
      {showComponents && (
        <g>
          <line x1={ox} y1={oy} x2={px} y2={oy}
            stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round" />
          <line x1={px} y1={oy} x2={px} y2={hy}
            stroke="#10b981" strokeWidth={2.5} strokeLinecap="round" />
          <text x={(ox + px) / 2} y={oy + 16} fill="#f59e0b" fontSize={10} textAnchor="middle">Aₓ={Ax}</text>
          <text x={px + 8} y={(oy + hy) / 2} fill="#10b981" fontSize={10} textAnchor="start">Aᵧ={Ay}</text>
        </g>
      )}

      {/* Angle arc */}
      {showAngle && Ay > 0 && (
        <>
          <path d={`M ${arcX} ${arcY} A ${arcR} ${arcR} 0 0 ${sweepFlag} ${arcX2} ${arcY2}`}
            fill="none" stroke="#818cf8" strokeWidth={1.5} strokeDasharray="3 2" />
          <text x={CX + 45} y={CY - 16} fill="#818cf8" fontSize={10}>θ={theta}°</text>
        </>
      )}

      {/* Main vector */}
      {(() => {
        const dx = hx - CX, dy = hy - CY;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / len, uy = dy / len;
        const hl = 10;
        const ex = hx - ux * hl, ey = hy - uy * hl;
        return (
          <g>
            <line x1={CX} y1={CY} x2={ex} y2={ey}
              stroke={highlightColor} strokeWidth={3} strokeLinecap="round" />
            <polygon
              points={`${hx},${hy} ${ex - uy * 5},${ey + ux * 5} ${ex + uy * 5},${ey - ux * 5}`}
              fill={highlightColor} />
          </g>
        );
      })()}

      {/* Magnitude label */}
      {showAngle && (
        <text x={(CX + hx) / 2 - 10} y={(CY + hy) / 2 - 10}
          fill="#f43f5e" fontSize={10} fontWeight="600">{mag}</text>
      )}

      <text x={hx + 8} y={hy - 6} fill="#e2e8f0" fontSize={12} fontWeight="700">A⃗</text>
      <circle cx={CX} cy={CY} r={3} fill="#94a3b8" />
    </svg>
  );
}

export default function NotationGallery({ params = {} }) {
  const vec = params.vector || DEFAULT_VEC;
  const [active, setActive] = useState(null);
  const [Ax, Ay] = vec;
  const mag = Math.sqrt(Ax * Ax + Ay * Ay).toFixed(2);
  const theta = (Math.atan2(Ay, Ax) * 180 / Math.PI).toFixed(1);

  const getValue = (id) => {
    switch (id) {
      case "arrow": return `A⃗`;
      case "bold": return `𝐀`;
      case "bracket": return `(${Ax}, ${Ay})`;
      case "polar": return `${mag} ∠ ${theta}°`;
      case "unit": return `${Ax}î + ${Ay}ĵ`;
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0" }}>
        <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em" }}>
          PILLAR 1 · SAME VECTOR, FIVE NOTATIONS
        </span>
        <p style={{ fontSize: 13, color: "#64748b", margin: "6px 0 0" }}>
          Click a notation to highlight what changes in the diagram.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        {/* Diagram */}
        <div style={{ padding: "16px 0 16px 16px" }}>
          <VectorDiagram
            vec={vec}
            highlightColor={active ? NOTATIONS.find(n => n.id === active)?.color || "#6366f1" : "#6366f1"}
            activeId={active}
          />
        </div>

        {/* Notation cards */}
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {NOTATIONS.map((n) => (
            <div key={n.id}
              onClick={() => setActive(active === n.id ? null : n.id)}
              style={{
                background: active === n.id ? "#1a1a3e" : "#1e293b",
                border: `1.5px solid ${active === n.id ? n.color : "#334155"}`,
                borderRadius: 8, padding: "8px 12px",
                cursor: "pointer", transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 10
              }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: n.color, minWidth: 52 }}>
                {getValue(n.id)}
              </span>
              <span style={{ fontSize: 11, color: active === n.id ? "#c7d2fe" : "#64748b", lineHeight: 1.3 }}>
                {n.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active description */}
      {active && (
        <div style={{
          margin: "0 16px 16px",
          padding: "12px 16px",
          background: "#0c1122",
          borderLeft: `3px solid ${NOTATIONS.find(n => n.id === active)?.color}`,
          borderRadius: 8,
          fontSize: 13, color: "#94a3b8", lineHeight: 1.6
        }}>
          {NOTATIONS.find(n => n.id === active)?.description}
        </div>
      )}
    </div>
  );
}
