// VelocityGraphExplorer.jsx — Ch2 L4 Pillar 4
import { useState } from "react";

const W = 460, H = 240, PL = 48, PB = 36, PT = 16, PR = 16;
const GW = W - PL - PR, GH = H - PT - PB, T_MAX = 8;

export default function VelocityGraphExplorer({ params = {} }) {
  const [v0, setV0] = useState(12);
  const [a, setA] = useState(-3);

  const vFn = t => v0 + a * t;
  const tStop = a !== 0 ? -v0 / a : null; // when v = 0
  const tStopClamped = tStop !== null && tStop > 0 && tStop < T_MAX ? tStop : null;

  // Compute area (displacement) from 0 to T_MAX
  const totalDisp = v0 * T_MAX + 0.5 * a * T_MAX * T_MAX;

  const vals = Array.from({ length: 81 }, (_, i) => vFn(i / 10));
  const vMin = Math.min(...vals, 0), vMax = Math.max(...vals, 0);
  const vRange = Math.max(vMax - vMin, 2);

  function toSVG(t, v) {
    return [PL + (t / T_MAX) * GW, PT + GH - ((v - vMin) / vRange) * GH];
  }

  const pts = Array.from({ length: 81 }, (_, i) => { const t = i / 10; return toSVG(t, vFn(t)); });
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const [, zy] = toSVG(0, 0);

  // Area fill paths
  const posArea = () => {
    const tEnd = tStopClamped || T_MAX;
    const apts = Array.from({ length: Math.round(tEnd * 10) + 1 }, (_, i) => {
      const t = Math.min(i / 10, tEnd);
      return toSVG(t, vFn(t));
    });
    const [startX] = toSVG(0, 0);
    const [endX] = toSVG(tEnd, 0);
    return apts.map(([x, y]) => `${x},${y}`).join(" ") + ` ${endX},${zy} ${startX},${zy}`;
  };

  const negArea = () => {
    if (!tStopClamped) return null;
    const apts = Array.from({ length: Math.round((T_MAX - tStopClamped) * 10) + 1 }, (_, i) => {
      const t = tStopClamped + i / 10;
      return toSVG(Math.min(t, T_MAX), vFn(Math.min(t, T_MAX)));
    });
    const [startX] = toSVG(tStopClamped, 0);
    const [endX] = toSVG(T_MAX, 0);
    return apts.map(([x, y]) => `${x},${y}`).join(" ") + ` ${endX},${zy} ${startX},${zy}`;
  };

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0" }}>
        <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · v–t AREA = DISPLACEMENT</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "12px 20px 0" }}>
        {[
          { label: "v₀ (m/s)", val: v0, set: setV0, min: -20, max: 20, step: 1, color: "#6366f1" },
          { label: "a (m/s²)", val: a, set: setA, min: -8, max: 8, step: 0.5, color: "#f43f5e" },
        ].map(({ label, val, set, min, max, step, color }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
              <span>{label}</span><span style={{ color, fontWeight: 700 }}>{val.toFixed(1)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(parseFloat(e.target.value))} style={{ width: "100%" }} />
          </div>
        ))}
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", marginTop: 8 }}>
        {[0, 2, 4, 6, 8].map(t => { const [tx] = toSVG(t, 0); return <line key={t} x1={tx} y1={PT} x2={tx} y2={PT + GH} stroke="#1a2540" strokeWidth={0.5} />; })}
        <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        <line x1={PL} y1={zy} x2={PL + GW} y2={zy} stroke="#334155" strokeWidth={1} />

        {/* Positive area (displacement in +x) */}
        <polygon points={posArea()} fill="#6366f1" opacity={0.2} />
        {/* Negative area */}
        {negArea() && <polygon points={negArea()} fill="#f43f5e" opacity={0.2} />}

        <path d={d} fill="none" stroke="#f59e0b" strokeWidth={2.5} />

        {/* Zero crossing marker */}
        {tStopClamped && (() => {
          const [zx] = toSVG(tStopClamped, 0);
          return <>
            <line x1={zx} y1={PT} x2={zx} y2={PT + GH} stroke="#818cf8" strokeWidth={1} strokeDasharray="4 3" />
            <text x={zx + 4} y={zy - 6} fill="#818cf8" fontSize={10}>v=0 at t={tStopClamped.toFixed(1)}s</text>
          </>;
        })()}

        {[0, 2, 4, 6, 8].map(t => { const [tx] = toSVG(t, 0); return <text key={t} x={tx} y={PT + GH + 14} fill="#475569" fontSize={9} textAnchor="middle">{t}s</text>; })}
        <text x={12} y={PT + GH / 2} fill="#f59e0b" fontSize={9} textAnchor="middle" transform={`rotate(-90 12 ${PT + GH / 2})`}>v (m/s)</text>
        <text x={PL + GW / 2} y={H - 4} fill="#475569" fontSize={9} textAnchor="middle">time (s)</text>

        {/* Area labels */}
        <text x={PL + (tStopClamped ? tStopClamped * GW / T_MAX / 2 : GW / 2)} y={zy - 14} fill="#818cf8" fontSize={10} textAnchor="middle">+Δx</text>
        {tStopClamped && <text x={PL + ((tStopClamped + T_MAX) / 2) * GW / T_MAX} y={zy + 18} fill="#f87171" fontSize={10} textAnchor="middle">−Δx</text>}
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 20px 20px" }}>
        {[
          { label: "Total Δx (net)", val: totalDisp.toFixed(2) + " m", color: "#e2e8f0" },
          { label: "slope of v–t", val: a.toFixed(1) + " m/s²", color: "#f43f5e" },
          { label: tStopClamped ? "reverses at t" : "v always " + (v0 >= 0 ? "+" : "−"), val: tStopClamped ? tStopClamped.toFixed(2) + " s" : "no reversal", color: "#818cf8" },
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
