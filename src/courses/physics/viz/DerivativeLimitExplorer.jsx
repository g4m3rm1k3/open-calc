// DerivativeLimitExplorer.jsx — Ch2 L7 Pillar 4
import { useState } from "react";

const PRESETS = [
  { label: "x(t) = t²−2t+4", fn: t => t*t - 2*t + 4, vFn: t => 2*t - 2, tex: "t^2 - 2t + 4" },
  { label: "x(t) = t³/3", fn: t => t*t*t/3, vFn: t => t*t, tex: "t^3/3" },
  { label: "x(t) = 4t−t²/2", fn: t => 4*t - t*t/2, vFn: t => 4 - t, tex: "4t - t^2/2" },
];

export default function DerivativeLimitExplorer({ params = {} }) {
  const [preset, setPreset] = useState(0);
  const [t0, setT0] = useState(2.0);
  const P = PRESETS[preset];

  // Compute limit table: secant slopes for shrinking Δt
  const dts = [1.0, 0.5, 0.1, 0.05, 0.01, 0.005, 0.001];
  const rows = dts.map(dt => {
    const slope = (P.fn(t0 + dt) - P.fn(t0)) / dt;
    return { dt, slope, error: Math.abs(slope - P.vFn(t0)) };
  });
  const exact = P.vFn(t0);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · LIMIT EXPLORER</span>
        <div style={{ display: "flex", gap: 6 }}>
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => setPreset(i)} style={{
              background: preset === i ? "#6366f1" : "#1e293b",
              color: preset === i ? "#fff" : "#64748b",
              border: `1px solid ${preset === i ? "#6366f1" : "#334155"}`,
              borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer"
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 20px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
          <span>Evaluate at t₀</span>
          <span style={{ color: "#6366f1", fontWeight: 700 }}>{t0.toFixed(2)} s</span>
        </div>
        <input type="range" min={0.1} max={5} step={0.05} value={t0}
          onChange={e => setT0(parseFloat(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />

        <div style={{ background: "#1e293b", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontFamily: "'Fira Code',monospace", fontSize: 12, color: "#94a3b8" }}>
          <div>v(t₀) = lim<sub>Δt→0</sub> [x(t₀+Δt) − x(t₀)] / Δt</div>
          <div style={{ color: "#10b981", fontWeight: 700, marginTop: 4 }}>
            Exact: v({t0.toFixed(2)}) = {exact.toFixed(6)} m/s
          </div>
        </div>

        {/* Limit table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>{["Δt", "Δx/Δt (secant slope)", "Error"].map(h => (
              <th key={h} style={{ padding: "5px 8px", color: "#64748b", fontSize: 10, fontWeight: 600, textAlign: "center", borderBottom: "1px solid #334155" }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {rows.map(({ dt, slope, error }) => (
              <tr key={dt} style={{ background: error < 0.001 ? "#0d2a1e" : "transparent" }}>
                <td style={{ padding: "6px 8px", textAlign: "center", fontFamily: "'Fira Code',monospace", color: "#f59e0b" }}>{dt}</td>
                <td style={{ padding: "6px 8px", textAlign: "center", fontFamily: "'Fira Code',monospace", color: "#e2e8f0" }}>{slope.toFixed(6)}</td>
                <td style={{ padding: "6px 8px", textAlign: "center", fontFamily: "'Fira Code',monospace", color: error < 0.001 ? "#34d399" : "#64748b" }}>{error.toExponential(2)}</td>
              </tr>
            ))}
            <tr style={{ borderTop: "2px solid #334155" }}>
              <td style={{ padding: "8px 8px", textAlign: "center", fontFamily: "'Fira Code',monospace", color: "#10b981", fontWeight: 700 }}>→ 0</td>
              <td style={{ padding: "8px 8px", textAlign: "center", fontFamily: "'Fira Code',monospace", color: "#10b981", fontWeight: 700 }}>{exact.toFixed(6)}</td>
              <td style={{ padding: "8px 8px", textAlign: "center", fontFamily: "'Fira Code',monospace", color: "#34d399" }}>0</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ padding: "0 20px 14px", fontSize: 12, color: "#475569" }}>
        As Δt shrinks, the secant slope converges to the exact derivative. Green rows are within 0.001 of the true value.
      </div>
    </div>
  );
}
