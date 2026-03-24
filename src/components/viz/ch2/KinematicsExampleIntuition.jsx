// KinematicsExampleIntuition.jsx — Ch2 L8-10,19 Pillar 1
// Shows position polynomial with live differentiation display
import { useState } from "react";

const EXAMPLES = [
  { label: "x = 3t²−5t+2", xFn: t => 3*t*t - 5*t + 2, vFn: t => 6*t - 5, aFn: () => 6, vTex: "v(t) = 6t − 5", aTex: "a(t) = 6" },
  { label: "x = t³/3 − 2t", xFn: t => t*t*t/3 - 2*t, vFn: t => t*t - 2, aFn: t => 2*t, vTex: "v(t) = t² − 2", aTex: "a(t) = 2t" },
  { label: "x = 4t − t²/2", xFn: t => 4*t - t*t/2, vFn: t => 4 - t, aFn: () => -1, vTex: "v(t) = 4 − t", aTex: "a(t) = −1" },
];

const W = 420, H = 180, PL = 44, PB = 28, PT = 12, PR = 12;
const GW = W - PL - PR, GH = H - PT - PB, T_MAX = 6;

function SmallGraph({ fn, color, label, tMax }) {
  const vals = Array.from({ length: 61 }, (_, i) => fn(i / 10));
  const yMin = Math.min(...vals) - 0.5, yMax = Math.max(...vals) + 0.5;
  const yRange = Math.max(yMax - yMin, 1);
  function toSVG(t, y) { return [PL + (t / tMax) * GW, PT + GH - ((y - yMin) / yRange) * GH]; }
  const pts = Array.from({ length: 61 }, (_, i) => { const t = i / 10; return toSVG(t, fn(t)); });
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const [, zy] = toSVG(0, 0);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
      <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1} />
      {zy > PT && zy < PT + GH && <line x1={PL} y1={zy} x2={PL + GW} y2={zy} stroke="#334155" strokeWidth={0.5} strokeDasharray="3 3" />}
      <path d={d} fill="none" stroke={color} strokeWidth={2.5} />
      {[0, 2, 4, 6].map(t => { const [tx] = toSVG(t, 0); return <text key={t} x={tx} y={PT + GH + 14} fill="#475569" fontSize={8} textAnchor="middle">{t}</text>; })}
      <text x={12} y={PT + GH / 2} fill={color} fontSize={9} textAnchor="middle" transform={`rotate(-90 12 ${PT + GH / 2})`}>{label}</text>
    </svg>
  );
}

export default function KinematicsExampleIntuition({ params = {} }) {
  const [ei, setEi] = useState(0);
  const [tQuery, setTQuery] = useState(3);
  const E = EXAMPLES[ei];

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#10b981", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · POLYNOMIAL KINEMATICS</span>
        <div style={{ display: "flex", gap: 6 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => setEi(i)} style={{
              background: ei === i ? "#10b981" : "#1e293b", color: ei === i ? "#0f172a" : "#64748b",
              border: `1px solid ${ei === i ? "#10b981" : "#334155"}`,
              borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer"
            }}>{ex.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "10px 20px 0" }}>
        {[
          { fn: E.xFn, color: "#6366f1", label: "x (m)" },
          { fn: E.vFn, color: "#f59e0b", label: "v (m/s)" },
          { fn: E.aFn, color: "#f43f5e", label: "a (m/s²)" },
        ].map(({ fn, color, label }) => (
          <SmallGraph key={label} fn={fn} color={color} label={label} tMax={T_MAX} />
        ))}
      </div>

      {/* Derivative chain */}
      <div style={{ margin: "10px 20px", padding: "12px 14px", background: "#1e293b", borderRadius: 10, fontFamily: "'Fira Code',monospace", fontSize: 12, color: "#94a3b8", lineHeight: 2 }}>
        <div>x(t) = <span style={{ color: "#6366f1" }}>{E.label.split("=")[1].trim()}</span></div>
        <div>v(t) = dx/dt → <span style={{ color: "#f59e0b" }}>{E.vTex.split("=")[1].trim()}</span></div>
        <div>a(t) = dv/dt → <span style={{ color: "#f43f5e" }}>{E.aTex.split("=")[1].trim()}</span></div>
      </div>

      {/* Query point */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
          <span>Evaluate at t =</span><span style={{ color: "#10b981", fontWeight: 700 }}>{tQuery.toFixed(1)} s</span>
        </div>
        <input type="range" min={0} max={6} step={0.1} value={tQuery} onChange={e => setTQuery(parseFloat(e.target.value))} style={{ width: "100%", marginBottom: 10 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 20px 20px" }}>
        {[
          { label: "x(" + tQuery.toFixed(1) + ")", val: E.xFn(tQuery).toFixed(3) + " m", color: "#6366f1" },
          { label: "v(" + tQuery.toFixed(1) + ")", val: E.vFn(tQuery).toFixed(3) + " m/s", color: "#f59e0b" },
          { label: "a(" + tQuery.toFixed(1) + ")", val: E.aFn(tQuery).toFixed(3) + " m/s²", color: "#f43f5e" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
