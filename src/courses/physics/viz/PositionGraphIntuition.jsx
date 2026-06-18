// PositionGraphIntuition.jsx — Ch2 L3 Pillar 1
import { useState } from "react";

const W = 460, H = 240, PL = 50, PB = 36, PT = 16, PR = 16;
const GW = W - PL - PR, GH = H - PT - PB;
const T_MAX = 8;

// Presets representing different motion types
const PRESETS = [
  { name: "Constant velocity", fn: t => 2 * t - 5, vFn: () => 2, color: "#6366f1" },
  { name: "Constant acceleration", fn: t => 0.5 * t * t - 4, vFn: t => t, color: "#10b981" },
  { name: "Decelerate to stop", fn: t => 6 * t - 0.5 * t * t - 9, vFn: t => 6 - t, color: "#f59e0b" },
  { name: "Return to origin", fn: t => -0.5 * t * t + 4 * t, vFn: t => -t + 4, color: "#f43f5e" },
];

export default function PositionGraphIntuition({ params = {} }) {
  const [preset, setPreset] = useState(0);
  const [hoverT, setHoverT] = useState(null);
  const P = PRESETS[preset];

  const xMin = Math.min(...Array.from({ length: 81 }, (_, i) => P.fn(i / 10)));
  const xMax = Math.max(...Array.from({ length: 81 }, (_, i) => P.fn(i / 10)));
  const xRange = Math.max(xMax - xMin, 2);
  const xPad = xRange * 0.15;

  function toSVG(t, x) {
    return [
      PL + (t / T_MAX) * GW,
      PT + GH - ((x - xMin + xPad) / (xRange + 2 * xPad)) * GH
    ];
  }

  const curvePts = Array.from({ length: 81 }, (_, i) => { const t = i / 10; return toSVG(t, P.fn(t)); });
  const curveD = curvePts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  // Tangent at hover
  const hT = hoverT !== null ? hoverT : 4;
  const hV = P.vFn(hT);
  const [hx, hy] = toSVG(hT, P.fn(hT));
  const span = 1.2;
  const [tx0, ty0] = toSVG(hT - span, P.fn(hT) - span * hV);
  const [tx1, ty1] = toSVG(hT + span, P.fn(hT) + span * hV);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · x–t GRAPH</span>
        <div style={{ display: "flex", gap: 6 }}>
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => setPreset(i)} style={{
              background: preset === i ? p.color : "#1e293b",
              color: preset === i ? "#0f172a" : "#64748b",
              border: `1px solid ${preset === i ? p.color : "#334155"}`,
              borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer"
            }}>{p.name}</button>
          ))}
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}
        onMouseMove={e => {
          const r = e.currentTarget.getBoundingClientRect();
          const sx = (e.clientX - r.left) * (W / r.width);
          const t = Math.max(0, Math.min(T_MAX, (sx - PL) / GW * T_MAX));
          setHoverT(parseFloat(t.toFixed(2)));
        }}
        onMouseLeave={() => setHoverT(null)}>

        {/* Grid */}
        {[0, 2, 4, 6, 8].map(t => { const [tx] = toSVG(t, 0); return <line key={t} x1={tx} y1={PT} x2={tx} y2={PT + GH} stroke="#1a2540" strokeWidth={0.5} />; })}
        <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        {[0, 2, 4, 6, 8].map(t => { const [tx] = toSVG(t, 0); return <text key={t} x={tx} y={PT + GH + 14} fill="#475569" fontSize={9} textAnchor="middle">{t}s</text>; })}
        <text x={PL + GW / 2} y={H - 4} fill="#475569" fontSize={9} textAnchor="middle">time (s)</text>
        <text x={12} y={PT + GH / 2} fill="#475569" fontSize={9} textAnchor="middle" transform={`rotate(-90 12 ${PT + GH / 2})`}>x (m)</text>

        {/* Curve */}
        <path d={curveD} fill="none" stroke={P.color} strokeWidth={2.5} />

        {/* Tangent at hover */}
        <line x1={tx0} y1={ty0} x2={tx1} y2={ty1} stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="5 3" opacity={0.9} />
        <circle cx={hx} cy={hy} r={5} fill="#f43f5e" />

        {/* Vertical guide */}
        <line x1={hx} y1={PT} x2={hx} y2={PT + GH} stroke="#f43f5e" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.5} />

        {/* Slope label */}
        <text x={Math.min(hx + 8, W - 80)} y={hy - 10} fill="#f43f5e" fontSize={11} fontWeight="700">
          slope = {hV.toFixed(2)} m/s
        </text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 20px 20px" }}>
        {[
          { label: "t", val: hoverT !== null ? hoverT.toFixed(2) + " s" : "hover over graph", color: "#f59e0b" },
          { label: "x(t)", val: hoverT !== null ? P.fn(hoverT).toFixed(3) + " m" : "—", color: P.color },
          { label: "v = slope", val: hoverT !== null ? P.vFn(hoverT).toFixed(3) + " m/s" : "—", color: "#f43f5e" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
