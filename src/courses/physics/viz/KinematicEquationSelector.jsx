// KinematicEquationSelector.jsx — Ch2 Pillar 4 (shared across lessons 2,8-11,19)
import { useState } from "react";

export default function KinematicEquationSelector({ params = {} }) {
  const [v0, setV0] = useState(""); const [v, setV] = useState(""); const [a, setA] = useState("");
  const [t, setT] = useState(""); const [dx, setDx] = useState("");

  const vals = { v0: parseFloat(v0), v: parseFloat(v), a: parseFloat(a), t: parseFloat(t), dx: parseFloat(dx) };
  const known = { v0: v0 !== "", v: v !== "", a: a !== "", t: t !== "", dx: dx !== "" };
  const knownCount = Object.values(known).filter(Boolean).length;

  // Solve based on which 3 are known
  let results = {};
  const V0 = vals.v0, V = vals.v, A = vals.a, T = vals.t, DX = vals.dx;

  if (knownCount >= 3) {
    // Eq 1: v = v0 + at
    if (known.v0 && known.a && known.t && !known.v) results.v = V0 + A * T;
    if (known.v && known.a && known.t && !known.v0) results.v0 = V - A * T;
    if (known.v && known.v0 && known.t && !known.a) results.a = (V - V0) / T;
    if (known.v && known.v0 && known.a && !known.t) results.t = (V - V0) / A;
    // Eq 3: dx = v0t + 0.5at²
    if (known.v0 && known.a && known.t && !known.dx) results.dx = V0 * T + 0.5 * A * T * T;
    if (known.dx && known.a && known.t && !known.v0) results.v0 = (DX - 0.5 * A * T * T) / T;
    // Eq 5: v² = v0² + 2a·dx
    if (known.v0 && known.a && known.dx && !known.v) results.v = Math.sign(V0 + A * Math.sqrt(Math.max(0, (DX - 0) / A)) || 1) * Math.sqrt(Math.max(0, V0 * V0 + 2 * A * DX));
    if (known.v && known.v0 && known.dx && !known.a) results.a = (V * V - V0 * V0) / (2 * DX);
    if (known.v && known.v0 && known.a && !known.dx) results.dx = (V * V - V0 * V0) / (2 * A);
    // Eq 2: dx = 0.5(v0+v)t
    if (known.v0 && known.v && known.t && !known.dx) results.dx = 0.5 * (V0 + V) * T;
    if (known.dx && known.v && known.t && !known.v0) results.v0 = 2 * DX / T - V;
  }

  const inp = (label, val, set, color) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
        <span style={{ color }}>{label}</span>
        {results[label.split(' ')[0].toLowerCase().replace('₀','0').replace('Δ','')] !== undefined && (
          <span style={{ color: "#10b981", fontWeight: 700 }}>→ {results[label.split(' ')[0].toLowerCase().replace('₀','0').replace('Δ','')]?.toFixed(3)}</span>
        )}
      </div>
      <input type="number" value={val} placeholder="leave blank = unknown"
        onChange={e => set(e.target.value)} step="any"
        style={{ width: "100%", background: val ? "#0c1a2e" : "#1e293b", border: `1px solid ${val ? color : "#334155"}`, borderRadius: 6, color: "#e2e8f0", padding: "7px 10px", fontSize: 13 }} />
    </div>
  );

  const missingVar = Object.keys(known).find(k => !known[k] && results[k] !== undefined);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#10b981", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · SUVAT SOLVER</span>
        <button onClick={() => { setV0(""); setV(""); setA(""); setT(""); setDx(""); }}
          style={{ background: "#1e293b", color: "#64748b", border: "1px solid #334155", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
          Clear all
        </button>
      </div>

      <div style={{ padding: "14px 20px" }}>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
          Enter any 3 known values. Leave the unknowns blank.
          <span style={{ color: "#f59e0b", marginLeft: 6 }}>{knownCount}/5 filled</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          {inp("v₀ — initial velocity (m/s)", v0, setV0, "#6366f1")}
          {inp("v — final velocity (m/s)", v, setV, "#6366f1")}
          {inp("a — acceleration (m/s²)", a, setA, "#f59e0b")}
          {inp("t — time (s)", t, setT, "#f59e0b")}
          {inp("Δx — displacement (m)", dx, setDx, "#10b981")}
        </div>
      </div>

      {/* Results */}
      {Object.keys(results).length > 0 && (
        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>Computed values:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(results).map(([k, v2]) => (
              <div key={k} style={{ background: "#0d2a1e", borderRadius: 8, padding: "10px 14px", borderLeft: "3px solid #10b981", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>{k === "v0" ? "v₀" : k === "dx" ? "Δx" : k}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#34d399", fontFamily: "'Fira Code',monospace" }}>{v2.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {knownCount < 3 && (
        <div style={{ padding: "0 20px 16px", fontSize: 12, color: "#475569" }}>
          Enter at least 3 values to solve. The solver uses equations 1, 2, 3, and 5.
        </div>
      )}
    </div>
  );
}
