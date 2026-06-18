// KinematicsQuantitiesExplorer.jsx — Ch2 L1 Pillar 4
import { useState } from "react";

const W = 420, H = 260, PL = 50, PR = 20, PT = 20, PB = 40;
const GW = W - PL - PR, GH = H - PT - PB;

// Graph spans t: 0→8s, x: -20→20m
const T_MAX = 8, X_MIN = -20, X_MAX = 20;
function toSVG(t, x) {
  return [PL + (t / T_MAX) * GW, PT + GH - ((x - X_MIN) / (X_MAX - X_MIN)) * GH];
}

export default function KinematicsQuantitiesExplorer({ params = {} }) {
  const [t1, setT1] = useState(1);
  const [x1, setX1] = useState(-8);
  const [t2, setT2] = useState(6);
  const [x2, setX2] = useState(12);

  const dt = t2 - t1;
  const dx = x2 - x1;
  const vAvg = dt !== 0 ? dx / dt : 0;
  const speed = Math.abs(vAvg);

  const [p1x, p1y] = toSVG(t1, x1);
  const [p2x, p2y] = toSVG(t2, x2);
  const [ox] = toSVG(0, 0); const [, oy] = toSVG(0, 0);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0" }}>
        <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · x–t GRAPH EXPLORER</span>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {/* Grid */}
        {Array.from({ length: 9 }, (_, i) => {
          const [gx] = toSVG(i, 0); const [, gy2] = toSVG(0, X_MIN + i * 5);
          return <g key={i}>
            <line x1={gx} y1={PT} x2={gx} y2={PT + GH} stroke="#1a2540" strokeWidth={0.5} />
            {i < 9 && <line x1={PL} y1={gy2} x2={PL + GW} y2={gy2} stroke="#1a2540" strokeWidth={0.5} />}
          </g>;
        })}
        {/* Axes */}
        <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        {/* Zero x line */}
        {(() => { const [, zy] = toSVG(0, 0); return <line x1={PL} y1={zy} x2={PL + GW} y2={zy} stroke="#334155" strokeWidth={0.5} strokeDasharray="4 3" />; })()}

        {/* Tick labels */}
        {[0, 2, 4, 6, 8].map(t => { const [tx] = toSVG(t, 0); return <text key={t} x={tx} y={PT + GH + 14} fill="#475569" fontSize={9} textAnchor="middle">{t}s</text>; })}
        {[-20, -10, 0, 10, 20].map(x => { const [, ty] = toSVG(0, x); return <text key={x} x={PL - 4} y={ty + 3} fill="#475569" fontSize={9} textAnchor="end">{x}</text>; })}
        <text x={PL + GW / 2} y={H - 4} fill="#475569" fontSize={10} textAnchor="middle">time (s)</text>
        <text x={10} y={PT + GH / 2} fill="#475569" fontSize={10} textAnchor="middle" transform={`rotate(-90 10 ${PT + GH / 2})`}>x (m)</text>

        {/* Secant line between the two points */}
        <line x1={p1x} y1={p1y} x2={p2x} y2={p2y} stroke="#6366f1" strokeWidth={2} strokeDasharray="6 4" />

        {/* Rise and run guides */}
        <line x1={p1x} y1={p1y} x2={p2x} y2={p1y} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 2" />
        <line x1={p2x} y1={p1y} x2={p2x} y2={p2y} stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 2" />
        <text x={(p1x + p2x) / 2} y={p1y + 14} fill="#f59e0b" fontSize={10} textAnchor="middle">Δt = {dt.toFixed(1)}s</text>
        <text x={p2x + 6} y={(p1y + p2y) / 2} fill="#10b981" fontSize={10} textAnchor="start">Δx = {dx.toFixed(1)}m</text>

        {/* Draggable points */}
        {[{ t: t1, x: x1, setT: setT1, setX: setX1, c: "#10b981", label: "A" },
          { t: t2, x: x2, setT: setT2, setX: setX2, c: "#f43f5e", label: "B" }].map(({ t, x, setT, setX, c, label }) => {
          const [px2, py2] = toSVG(t, x);
          return (
            <g key={label}>
              <circle cx={px2} cy={py2} r={9} fill={c} stroke="#0f172a" strokeWidth={2} style={{ cursor: "pointer" }} />
              <text x={px2 + 12} y={py2 - 4} fill={c} fontSize={11} fontWeight="700">{label}({t.toFixed(1)},{x.toFixed(0)})</text>
            </g>
          );
        })}
      </svg>

      {/* Sliders */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 20px" }}>
        {[{ label: "Point A: t₁", val: t1, set: setT1, min: 0, max: 7, step: 0.5, color: "#10b981" },
          { label: "Point A: x₁", val: x1, set: setX1, min: -20, max: 20, step: 1, color: "#10b981" },
          { label: "Point B: t₂", val: t2, set: setT2, min: 1, max: 8, step: 0.5, color: "#f43f5e" },
          { label: "Point B: x₂", val: x2, set: setX2, min: -20, max: 20, step: 1, color: "#f43f5e" }].map(({ label, val, set, min, max, step, color }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 2 }}>
              <span>{label}</span><span style={{ color, fontWeight: 700 }}>{val.toFixed(1)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(parseFloat(e.target.value))} style={{ width: "100%" }} />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, padding: "12px 20px 20px" }}>
        {[
          { label: "Δx", val: dx.toFixed(2) + " m", color: "#10b981", note: "displacement" },
          { label: "Δt", val: dt.toFixed(2) + " s", color: "#f59e0b", note: "time interval" },
          { label: "v̄ = Δx/Δt", val: vAvg.toFixed(3) + " m/s", color: "#6366f1", note: "avg velocity = slope" },
          { label: "speed", val: speed.toFixed(3) + " m/s", color: "#94a3b8", note: "|v̄|" },
        ].map(({ label, val, color, note }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 9, color: "#64748b" }}>{note}</div>
            <div style={{ fontSize: 11, fontFamily: "'Fira Code',monospace", color: "#64748b" }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
