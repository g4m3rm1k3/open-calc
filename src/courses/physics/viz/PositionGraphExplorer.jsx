// PositionGraphExplorer.jsx — Ch2 L3 Pillar 4
import { useState } from "react";

const SCENARIOS = [
  { name: "Car trip", x: t => 5*t - 0.4*t*t, v: t => 5 - 0.8*t, a: () => -0.8, desc: "Constant deceleration — x–t curves, v–t is straight line with negative slope." },
  { name: "Oscillation", x: t => 3*Math.sin(t), v: t => 3*Math.cos(t), a: t => -3*Math.sin(t), desc: "Position oscillates — velocity leads by 90°, acceleration opposes position." },
  { name: "Free fall", x: t => 20*t - 4.9*t*t, v: t => 20 - 9.8*t, a: () => -9.8, desc: "Ball thrown up at 20 m/s — parabolic x–t, linear v–t crossing zero at peak." },
  { name: "Constant speed", x: t => 4*t - 8, v: () => 4, a: () => 0, desc: "Straight x–t line means constant velocity — horizontal v–t, zero a–t." },
];

const W = 420, H = 190, PL = 44, PB = 28, PT = 14, PR = 12;
const GW = W - PL - PR, GH = H - PT - PB, T_MAX = 6;

function MiniGraph({ fn, color, yLabel, title }) {
  const vals = Array.from({ length: 61 }, (_, i) => fn(i / 10));
  const yMin = Math.min(...vals), yMax = Math.max(...vals);
  const yRange = Math.max(yMax - yMin, 1);
  function toSVG(t, y) {
    return [PL + (t / T_MAX) * GW, PT + GH - ((y - yMin) / yRange) * GH];
  }
  const pts = Array.from({ length: 61 }, (_, i) => { const t = i / 10; return toSVG(t, fn(t)); });
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const [, zy] = toSVG(0, 0);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, color, fontWeight: 700, paddingLeft: PL, marginBottom: 2 }}>{title}</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {[0, 2, 4, 6].map(t => { const [tx] = toSVG(t, 0); return <line key={t} x1={tx} y1={PT} x2={tx} y2={PT + GH} stroke="#1a2540" strokeWidth={0.5} />; })}
        <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        {zy > PT && zy < PT + GH && <line x1={PL} y1={zy} x2={PL + GW} y2={zy} stroke="#334155" strokeWidth={0.5} strokeDasharray="3 3" />}
        <path d={d} fill="none" stroke={color} strokeWidth={2.5} />
        {[0, 2, 4, 6].map(t => { const [tx] = toSVG(t, 0); return <text key={t} x={tx} y={PT + GH + 14} fill="#475569" fontSize={8} textAnchor="middle">{t}s</text>; })}
        <text x={12} y={PT + GH / 2} fill={color} fontSize={9} textAnchor="middle" transform={`rotate(-90 12 ${PT + GH / 2})`}>{yLabel}</text>
        <text x={PL + GW} y={PT + GH / 2} fill={color} fontSize={9}>{vals[vals.length - 1].toFixed(1)}</text>
      </svg>
    </div>
  );
}

export default function PositionGraphExplorer({ params = {} }) {
  const [s, setS] = useState(2);
  const S = SCENARIOS[s];
  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · GRAPH SCENARIOS</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {SCENARIOS.map((sc, i) => (
            <button key={i} onClick={() => setS(i)} style={{
              background: s === i ? "#6366f1" : "#1e293b", color: s === i ? "#fff" : "#64748b",
              border: `1px solid ${s === i ? "#6366f1" : "#334155"}`,
              borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer"
            }}>{sc.name}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "8px 20px 4px", fontSize: 12, color: "#64748b" }}>{S.desc}</div>
      <div style={{ padding: "0 20px 20px" }}>
        <MiniGraph fn={S.x} color="#6366f1" yLabel="x (m)" title="Position x(t) — slope gives velocity" />
        <MiniGraph fn={S.v} color="#f59e0b" yLabel="v (m/s)" title="Velocity v(t) — slope gives acceleration, area gives Δx" />
        <MiniGraph fn={S.a} color="#f43f5e" yLabel="a (m/s²)" title="Acceleration a(t) — area gives Δv" />
      </div>
    </div>
  );
}
