// VariableAccelerationExplorer.jsx — Ch2 L22 Pillar 4
import { useState } from "react";

export default function VariableAccelerationExplorer({ params = {} }) {
  const [v0, setV0] = useState(2);
  const [x0, setX0] = useState(0);
  const [tQuery, setTQuery] = useState(3);

  // a(t) = 6t  →  v(t) = v0 + 3t²  →  x(t) = x0 + v0*t + t³
  const aFn = t => 6 * t;
  const vFn = t => v0 + 3 * t * t;
  const xFn = t => x0 + v0 * t + tQuery === t ? null : x0 + v0 * t + Math.pow(t, 3);

  const aT = aFn(tQuery);
  const vT = vFn(tQuery);
  const xT = x0 + v0 * tQuery + Math.pow(tQuery, 3);

  // Numerical integration check
  const dt = 0.001;
  let vNum = v0, xNum = x0;
  for (let t = 0; t < tQuery; t += dt) {
    vNum += aFn(t) * dt;
    xNum += vNum * dt;
  }

  const steps = [
    { label: "Given a(t)", eq: `a(t) = 6t`, color: "#f43f5e" },
    { label: "Integrate for v(t)", eq: `v(t) = v₀ + ∫6t dt = ${v0} + 3t²`, color: "#f59e0b" },
    { label: "Integrate for x(t)", eq: `x(t) = x₀ + ∫(${v0}+3t²) dt = ${x0} + ${v0}t + t³`, color: "#6366f1" },
    { label: `Evaluate at t = ${tQuery}`, eq: `v(${tQuery}) = ${v0} + 3(${tQuery})² = ${vT.toFixed(3)} m/s`, color: "#10b981" },
    { label: `x at t = ${tQuery}`, eq: `x(${tQuery}) = ${x0} + ${v0}(${tQuery}) + ${tQuery}³ = ${xT.toFixed(3)} m`, color: "#10b981" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0" }}>
        <span style={{ fontSize: 13, color: "#f43f5e", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · INTEGRATION SOLVER  a(t) = 6t</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: "12px 20px 0" }}>
        {[
          { label: "v₀ (m/s)", val: v0, set: setV0, min: -10, max: 20, step: 0.5, color: "#f59e0b" },
          { label: "x₀ (m)", val: x0, set: setX0, min: -20, max: 20, step: 1, color: "#6366f1" },
          { label: "Evaluate at t (s)", val: tQuery, set: setTQuery, min: 0, max: 5, step: 0.1, color: "#10b981" },
        ].map(({ label, val, set, min, max, step, color }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}><span>{label}</span><span style={{ color, fontWeight: 700 }}>{val.toFixed(1)}</span></div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(parseFloat(e.target.value))} style={{ width: "100%" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "14px 20px" }}>
        {steps.map(({ label, eq, color }, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#1e293b", color, fontSize: 11, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{label}</div>
              <div style={{ background: "#1e293b", borderRadius: 6, padding: "6px 12px", fontFamily: "'Fira Code',monospace", fontSize: 12, color }}>{eq}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "0 20px 16px" }}>
        <div style={{ background: "#1e293b", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 10, color: "#64748b" }}>Numerical check (Euler, dt=0.001)</div>
          <div style={{ fontSize: 12, fontFamily: "'Fira Code',monospace", color: "#94a3b8", marginTop: 4 }}>
            v ≈ {vNum.toFixed(4)}, x ≈ {xNum.toFixed(4)}
          </div>
        </div>
        <div style={{ background: "#0d2a1e", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 10, color: "#64748b" }}>Error (analytic vs numerical)</div>
          <div style={{ fontSize: 12, fontFamily: "'Fira Code',monospace", color: "#34d399", marginTop: 4 }}>
            Δv = {Math.abs(vT - vNum).toExponential(2)}, Δx = {Math.abs(xT - xNum).toExponential(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
