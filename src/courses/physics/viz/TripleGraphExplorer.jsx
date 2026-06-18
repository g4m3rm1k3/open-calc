// TripleGraphExplorer.jsx — Ch2 Pillar 4 for graph lessons
import { useState } from "react";

const T_MAX = 8, STEPS = 80;
const W_GRAPH = 400, H_GRAPH = 100, PL = 42, PB = 24, PT = 8, PR = 8;
const GW = W_GRAPH - PL - PR, GH = H_GRAPH - PT - PB;

function buildPath(fn, tMax, yMin, yMax) {
  const pts = Array.from({ length: STEPS + 1 }, (_, i) => {
    const t = (i / STEPS) * tMax;
    const y = fn(t);
    const sx = PL + (t / tMax) * GW;
    const sy = PT + GH - ((y - yMin) / Math.max(yMax - yMin, 0.01)) * GH;
    return `${i === 0 ? "M" : "L"} ${sx} ${sy}`;
  });
  return pts.join(" ");
}

function Graph({ fn, color, yLabel, tMax, title }) {
  const vals = Array.from({ length: STEPS + 1 }, (_, i) => fn((i / STEPS) * tMax));
  const yMin = Math.min(...vals) - 1, yMax = Math.max(...vals) + 1;
  const zeroY = PT + GH - (0 - yMin) / Math.max(yMax - yMin, 0.01) * GH;
  const d = buildPath(fn, tMax, yMin, yMax);

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 11, color, fontWeight: 700, paddingLeft: PL, marginBottom: 2 }}>{title}</div>
      <svg width="100%" viewBox={`0 0 ${W_GRAPH} ${H_GRAPH}`} style={{ display: "block" }}>
        {[0, 2, 4, 6, 8].map(t => { const x = PL + (t / tMax) * GW; return <line key={t} x1={x} y1={PT} x2={x} y2={PT + GH} stroke="#1a2540" strokeWidth={0.5} />; })}
        <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        {zeroY > PT && zeroY < PT + GH && <line x1={PL} y1={zeroY} x2={PL + GW} y2={zeroY} stroke="#334155" strokeWidth={0.5} strokeDasharray="3 3" />}
        <path d={d} fill="none" stroke={color} strokeWidth={2} />
        {[0, 2, 4, 6, 8].map(t => { const x = PL + (t / tMax) * GW; return <text key={t} x={x} y={H_GRAPH - 6} fill="#475569" fontSize={8} textAnchor="middle">{t}</text>; })}
        <text x={10} y={PT + GH / 2} fill={color} fontSize={9} textAnchor="middle" transform={`rotate(-90 10 ${PT + GH / 2})`}>{yLabel}</text>
        {/* Current values at right edge */}
        <text x={PL + GW + 2} y={PT + GH / 2} fill={color} fontSize={8}>{fn(tMax).toFixed(1)}</text>
      </svg>
    </div>
  );
}

export default function TripleGraphExplorer({ params = {} }) {
  const [v0, setV0] = useState(10);
  const [a, setA] = useState(-2);
  const [x0, setX0] = useState(0);

  const xFn = t => x0 + v0 * t + 0.5 * a * t * t;
  const vFn = t => v0 + a * t;
  const aFn = () => a;

  // Stop time (when v = 0 if decelerating)
  const tStop = a !== 0 ? -v0 / a : T_MAX;
  const stopNote = tStop > 0 && tStop < T_MAX ? `Object stops at t = ${tStop.toFixed(2)}s` : null;

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0" }}>
        <span style={{ fontSize: 13, color: "#818cf8", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · TRIPLE GRAPH EXPLORER</span>
      </div>

      {/* Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: "12px 20px" }}>
        {[
          { label: "x₀ (m)", val: x0, set: setX0, min: -20, max: 20, step: 1, color: "#6366f1" },
          { label: "v₀ (m/s)", val: v0, set: setV0, min: -20, max: 20, step: 1, color: "#f59e0b" },
          { label: "a (m/s²)", val: a, set: setA, min: -10, max: 10, step: 0.5, color: "#f43f5e" },
        ].map(({ label, val, set, min, max, step, color }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 3 }}><span>{label}</span><span style={{ color, fontWeight: 700 }}>{val.toFixed(1)}</span></div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(parseFloat(e.target.value))} style={{ width: "100%" }} />
          </div>
        ))}
      </div>

      {stopNote && <div style={{ margin: "0 20px 8px", background: "#1a1a3e", borderRadius: 6, padding: "6px 12px", fontSize: 12, color: "#818cf8" }}>⚡ {stopNote}</div>}

      <div style={{ padding: "0 20px 20px" }}>
        <Graph fn={xFn} color="#6366f1" yLabel="x (m)" tMax={T_MAX} title="Position x(t) = x₀ + v₀t + ½at²" />
        <Graph fn={vFn} color="#f59e0b" yLabel="v (m/s)" tMax={T_MAX} title="Velocity v(t) = v₀ + at" />
        <Graph fn={aFn} color="#f43f5e" yLabel="a (m/s²)" tMax={T_MAX} title={`Acceleration a(t) = ${a.toFixed(1)} m/s² (constant)`} />
      </div>
    </div>
  );
}
