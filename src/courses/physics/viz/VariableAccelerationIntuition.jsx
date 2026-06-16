// VariableAccelerationIntuition.jsx — Ch2 L22 Pillar 1
import { useState } from "react";

const W = 460, H = 220, PL = 48, PB = 32, PT = 14, PR = 16;
const GW = W - PL - PR, GH = H - PT - PB, T_MAX = 5;

const PRESETS = [
  { label: "a = 6t", aFn: t => 6*t, vFn: (t,v0) => v0 + 3*t*t, xFn: (t,x0,v0) => x0 + v0*t + t*t*t },
  { label: "a = cos(t)", aFn: t => Math.cos(t), vFn: (t,v0) => v0 + Math.sin(t), xFn: (t,x0,v0) => x0 + v0*t - Math.cos(t) + 1 },
  { label: "a = 2 − 0.5t", aFn: t => 2 - 0.5*t, vFn: (t,v0) => v0 + 2*t - 0.25*t*t, xFn: (t,x0,v0) => x0 + v0*t + t*t - t*t*t/12 },
];

function MiniGraph({ fn, color, label }) {
  const vals = Array.from({ length: 51 }, (_, i) => fn(i / 50 * T_MAX));
  const yMin = Math.min(...vals) - 0.5, yMax = Math.max(...vals) + 0.5;
  const yRange = Math.max(yMax - yMin, 0.1);
  function toSVG(t, y) { return [PL + (t / T_MAX) * GW, PT + GH - ((y - yMin) / yRange) * GH]; }
  const pts = Array.from({ length: 51 }, (_, i) => { const t = i / 50 * T_MAX; return toSVG(t, fn(t)); });
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const [, zy] = toSVG(0, 0);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
      <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1} />
      {zy > PT && zy < PT + GH && <line x1={PL} y1={zy} x2={PL + GW} y2={zy} stroke="#334155" strokeWidth={0.5} strokeDasharray="3 3" />}
      <path d={d} fill="none" stroke={color} strokeWidth={2.5} />
      {[0, 1, 2, 3, 4, 5].map(t => { const [tx] = toSVG(t, 0); return <text key={t} x={tx} y={PT + GH + 14} fill="#475569" fontSize={8} textAnchor="middle">{t}</text>; })}
      <text x={12} y={PT + GH / 2} fill={color} fontSize={9} textAnchor="middle" transform={`rotate(-90 12 ${PT + GH / 2})`}>{label}</text>
    </svg>
  );
}

export default function VariableAccelerationIntuition({ params = {} }) {
  const [pi, setPi] = useState(0);
  const [v0, setV0] = useState(2);
  const P = PRESETS[pi];

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#f43f5e", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · VARIABLE ACCELERATION</span>
        <div style={{ display: "flex", gap: 6 }}>
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => setPi(i)} style={{
              background: pi === i ? "#f43f5e" : "#1e293b", color: pi === i ? "#fff" : "#64748b",
              border: `1px solid ${pi === i ? "#f43f5e" : "#334155"}`,
              borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer"
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "8px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
          <span>v₀ (initial velocity)</span><span style={{ color: "#f43f5e", fontWeight: 700 }}>{v0} m/s</span>
        </div>
        <input type="range" min={-5} max={10} step={0.5} value={v0} onChange={e => setV0(parseFloat(e.target.value))} style={{ width: "100%", marginBottom: 10 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, padding: "0 20px" }}>
        <div><div style={{ fontSize: 10, color: "#f43f5e", fontWeight: 700, textAlign: "center", marginBottom: 2 }}>a(t)</div><MiniGraph fn={P.aFn} color="#f43f5e" label="a" /></div>
        <div><div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, textAlign: "center", marginBottom: 2 }}>v(t) = v₀+∫a dt</div><MiniGraph fn={t => P.vFn(t, v0)} color="#f59e0b" label="v" /></div>
        <div><div style={{ fontSize: 10, color: "#6366f1", fontWeight: 700, textAlign: "center", marginBottom: 2 }}>x(t) = x₀+∫v dt</div><MiniGraph fn={t => P.xFn(t, 0, v0)} color="#6366f1" label="x" /></div>
      </div>

      <div style={{ padding: "10px 20px", background: "#1e293b", margin: "10px 20px", borderRadius: 8, fontFamily: "'Fira Code',monospace", fontSize: 12, color: "#94a3b8", lineHeight: 2 }}>
        <div style={{ color: "#f43f5e" }}>a(t) = {P.label.split("=")[1].trim()} ← <span style={{ color: "#475569" }}>NOT constant — SUVAT doesn't apply</span></div>
        <div style={{ color: "#f59e0b" }}>v(t) = v₀ + ∫a(t) dt</div>
        <div style={{ color: "#6366f1" }}>x(t) = x₀ + ∫v(t) dt</div>
      </div>
      <div style={{ padding: "0 20px 16px", fontSize: 12, color: "#475569" }}>
        When a varies with time, you must integrate. The graphs update as v₀ changes — notice how x changes shape but a doesn't.
      </div>
    </div>
  );
}
