// TwoPhaseMotionIntuition.jsx — Ch2 L11 Pillar 1
import { useState } from "react";

const W = 460, H = 240, PL = 48, PB = 36, PT = 16, PR = 16;
const GW = W - PL - PR, GH = H - PT - PB;

export default function TwoPhaseMotionIntuition({ params = {} }) {
  const [a1, setA1] = useState(10);   // phase 1 acceleration
  const [t1dur, setT1dur] = useState(4); // duration of phase 1
  const [t2dur, setT2dur] = useState(6); // duration of phase 2

  // Phase 1: v0=0, accelerate at a1 for t1dur
  const v1end = a1 * t1dur;
  const x1end = 0.5 * a1 * t1dur * t1dur;

  // Phase 2: v0=v1end, a=0 (engines off) for t2dur
  const v2end = v1end; // constant velocity
  const x2end = x1end + v1end * t2dur;

  const T_TOTAL = t1dur + t2dur;
  const X_MAX = Math.max(x2end * 1.05, 10);
  const V_MAX = Math.max(v1end * 1.1, 5);

  // x-t
  function xAtT(t) {
    if (t <= t1dur) return 0.5 * a1 * t * t;
    return x1end + v1end * (t - t1dur);
  }
  function vAtT(t) {
    if (t <= t1dur) return a1 * t;
    return v1end;
  }

  function toSVG_x(t, x) { return [PL + (t / T_TOTAL) * GW, PT + GH - (x / X_MAX) * GH]; }
  function toSVG_v(t, v) { return [PL + (t / T_TOTAL) * GW, PT + GH - (v / V_MAX) * GH]; }

  const xPts = Array.from({ length: 81 }, (_, i) => { const t = i / 80 * T_TOTAL; return toSVG_x(t, xAtT(t)); });
  const xD = xPts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const vPts = Array.from({ length: 81 }, (_, i) => { const t = i / 80 * T_TOTAL; return toSVG_v(t, vAtT(t)); });
  const vD = vPts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  const [transX] = toSVG_x(t1dur, 0);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0" }}>
        <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · TWO-PHASE MOTION</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "10px 20px 0" }}>
        {[
          { label: "Phase 1 acceleration (m/s²)", val: a1, set: setA1, min: 1, max: 20, step: 0.5, color: "#6366f1" },
          { label: "Phase 1 duration (s)", val: t1dur, set: setT1dur, min: 1, max: 10, step: 0.5, color: "#6366f1" },
          { label: "Phase 2 duration (s)", val: t2dur, set: setT2dur, min: 1, max: 15, step: 0.5, color: "#f59e0b" },
        ].map(({ label, val, set, min, max, step, color }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 3 }}><span>{label}</span><span style={{ color, fontWeight: 700 }}>{val.toFixed(1)}</span></div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(parseFloat(e.target.value))} style={{ width: "100%" }} />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "8px 20px 0" }}>
        {[["x–t", xD, toSVG_x, "x (m)"], ["v–t", vD, toSVG_v, "v (m/s)"]].map(([label, pathD, toSVG, yLabel]) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, paddingLeft: PL, marginBottom: 2 }}>{label}</div>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
              {/* Phase divider */}
              <rect x={transX} y={PT} width={GW - (transX - PL)} height={GH} fill="#f59e0b" opacity={0.05} />
              <line x1={transX} y1={PT} x2={transX} y2={PT + GH} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" />
              <text x={transX - 4} y={PT + 12} fill="#6366f1" fontSize={8} textAnchor="end">Phase 1</text>
              <text x={transX + 4} y={PT + 12} fill="#f59e0b" fontSize={8} textAnchor="start">Phase 2</text>
              <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
              <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1} />
              <path d={pathD} fill="none" stroke="#818cf8" strokeWidth={2} />
              <text x={12} y={PT + GH / 2} fill="#94a3b8" fontSize={9} textAnchor="middle" transform={`rotate(-90 12 ${PT + GH / 2})`}>{yLabel}</text>
            </svg>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, padding: "8px 20px 20px" }}>
        {[
          { label: "v at end of P1", val: v1end.toFixed(1) + " m/s", color: "#6366f1" },
          { label: "x at end of P1", val: x1end.toFixed(1) + " m", color: "#6366f1" },
          { label: "v at end of P2", val: v2end.toFixed(1) + " m/s", color: "#f59e0b" },
          { label: "x at end of P2", val: x2end.toFixed(1) + " m", color: "#f59e0b" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 9, color: "#64748b" }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 20px 14px", fontSize: 12, color: "#475569" }}>
        At the phase boundary, the final state of phase 1 (v = {v1end.toFixed(1)} m/s, x = {x1end.toFixed(1)} m) becomes the initial conditions for phase 2.
      </div>
    </div>
  );
}
