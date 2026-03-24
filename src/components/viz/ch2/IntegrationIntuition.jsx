// IntegrationIntuition.jsx — Ch2 L9 Pillar 1
// Shows area under v-t curve = displacement, Riemann sum → exact integral
import { useState } from "react";

const W = 460, H = 240, PL = 48, PB = 36, PT = 16, PR = 16;
const GW = W - PL - PR, GH = H - PT - PB;
const T_MAX = 6;

const PRESETS = [
  { label: "v = 4t − 3", vFn: t => 4*t - 3, dispFn: (a, b) => 2*b*b - 3*b - (2*a*a - 3*a) },
  { label: "v = 3t²", vFn: t => 3*t*t, dispFn: (a, b) => b*b*b - a*a*a },
  { label: "v = 6 − 2t", vFn: t => 6 - 2*t, dispFn: (a, b) => 6*b - b*b - (6*a - a*a) },
];

export default function IntegrationIntuition({ params = {} }) {
  const [preset, setPreset] = useState(0);
  const [t1, setT1] = useState(1);
  const [t2, setT2] = useState(4);
  const [nBars, setNBars] = useState(6);
  const P = PRESETS[preset];

  const vals = Array.from({ length: 61 }, (_, i) => P.vFn(i / 10 * T_MAX / 6));
  const vMin = Math.min(...vals, 0), vMax = Math.max(...vals, 1);
  const vRange = Math.max(vMax - vMin, 1);

  function toSVG(t, v) {
    return [PL + (t / T_MAX) * GW, PT + GH - ((v - vMin) / vRange) * GH];
  }

  const curvePts = Array.from({ length: 61 }, (_, i) => { const t = i / 60 * T_MAX; return toSVG(t, P.vFn(t)); });
  const curveD = curvePts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const [, zy] = toSVG(0, 0);

  // Riemann bars
  const dt = (t2 - t1) / nBars;
  const bars = Array.from({ length: nBars }, (_, i) => {
    const tL = t1 + i * dt;
    const tM = tL + dt / 2;
    const v = P.vFn(tM);
    const [x1] = toSVG(tL, 0);
    const [x2] = toSVG(tL + dt, 0);
    const [, yTop] = toSVG(tM, v);
    return { x1, x2, yTop, v, area: v * dt };
  });
  const riemannSum = bars.reduce((s, b) => s + b.area, 0);
  const exact = P.dispFn(t1, t2);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · ∫v dt = DISPLACEMENT</span>
        <div style={{ display: "flex", gap: 6 }}>
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => setPreset(i)} style={{
              background: preset === i ? "#6366f1" : "#1e293b", color: preset === i ? "#fff" : "#64748b",
              border: `1px solid ${preset === i ? "#6366f1" : "#334155"}`,
              borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer"
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: "10px 20px 0" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 3 }}><span>t₁</span><span style={{ color: "#f59e0b", fontWeight: 700 }}>{t1.toFixed(1)}s</span></div>
          <input type="range" min={0} max={5} step={0.1} value={t1} onChange={e => setT1(Math.min(parseFloat(e.target.value), t2 - 0.2))} style={{ width: "100%" }} />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 3 }}><span>t₂</span><span style={{ color: "#10b981", fontWeight: 700 }}>{t2.toFixed(1)}s</span></div>
          <input type="range" min={0.5} max={6} step={0.1} value={t2} onChange={e => setT2(Math.max(parseFloat(e.target.value), t1 + 0.2))} style={{ width: "100%" }} />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 3 }}><span>Rectangles n</span><span style={{ color: "#818cf8", fontWeight: 700 }}>{nBars}</span></div>
          <input type="range" min={1} max={30} step={1} value={nBars} onChange={e => setNBars(parseInt(e.target.value))} style={{ width: "100%" }} />
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", marginTop: 8 }}>
        {[0, 2, 4, 6].map(t => { const [tx] = toSVG(t, 0); return <line key={t} x1={tx} y1={PT} x2={tx} y2={PT + GH} stroke="#1a2540" strokeWidth={0.5} />; })}
        <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        {zy > PT && zy < PT + GH && <line x1={PL} y1={zy} x2={PL + GW} y2={zy} stroke="#334155" strokeWidth={0.5} strokeDasharray="3 3" />}

        {/* Riemann bars */}
        {bars.map(({ x1, x2, yTop, v }, i) => (
          <rect key={i} x={x1} y={v >= 0 ? yTop : zy} width={x2 - x1 - 0.5}
            height={Math.abs(zy - yTop)}
            fill={v >= 0 ? "#6366f1" : "#f43f5e"} opacity={0.3} />
        ))}

        <path d={curveD} fill="none" stroke="#f59e0b" strokeWidth={2.5} />

        {/* Interval markers */}
        {(() => { const [x1t] = toSVG(t1, 0), [x2t] = toSVG(t2, 0); return <>
          <line x1={x1t} y1={PT} x2={x1t} y2={PT + GH} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" />
          <line x1={x2t} y1={PT} x2={x2t} y2={PT + GH} stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 3" />
        </>; })()}

        {[0, 2, 4, 6].map(t => { const [tx] = toSVG(t, 0); return <text key={t} x={tx} y={PT + GH + 14} fill="#475569" fontSize={9} textAnchor="middle">{t}s</text>; })}
        <text x={12} y={PT + GH / 2} fill="#f59e0b" fontSize={9} textAnchor="middle" transform={`rotate(-90 12 ${PT + GH / 2})`}>v (m/s)</text>
        <text x={PL + GW / 2} y={H - 4} fill="#475569" fontSize={9} textAnchor="middle">t (s)</text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 20px 20px" }}>
        {[
          { label: "Riemann sum (n=" + nBars + ")", val: riemannSum.toFixed(4) + " m", color: "#818cf8" },
          { label: "Exact ∫v dt", val: exact.toFixed(4) + " m", color: "#10b981" },
          { label: "Error → 0 as n → ∞", val: Math.abs(riemannSum - exact).toFixed(4), color: Math.abs(riemannSum - exact) < 0.1 ? "#34d399" : "#f59e0b" },
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
