// KinematicEquationsIntuition.jsx — SUVAT equation selector
import { useState } from "react";

const EQUATIONS = [
  { id: 1, formula: "v = v₀ + at", missing: "Δx", color: "#6366f1", desc: "No displacement? Use this." },
  { id: 2, formula: "Δx = ½(v₀+v)t", missing: "a", color: "#f59e0b", desc: "No acceleration? Use this." },
  { id: 3, formula: "Δx = v₀t + ½at²", missing: "v", color: "#10b981", desc: "No final velocity? Use this." },
  { id: 4, formula: "Δx = vt − ½at²", missing: "v₀", color: "#f43f5e", desc: "No initial velocity? Use this." },
  { id: 5, formula: "v² = v₀² + 2aΔx", missing: "t", color: "#818cf8", desc: "No time? Use this." },
];

export default function KinematicEquationsIntuition({ params = {} }) {
  const [missing, setMissing] = useState(null);
  const highlight = EQUATIONS.find(e => e.missing === missing);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0" }}>
        <span style={{ fontSize: 13, color: "#10b981", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · EQUATION SELECTOR</span>
        <p style={{ fontSize: 13, color: "#64748b", margin: "6px 0 0" }}>Click the variable you <strong style={{ color: "#e2e8f0" }}>don't know and don't need</strong>. The right equation highlights.</p>
      </div>

      {/* Variable buttons */}
      <div style={{ display: "flex", gap: 8, padding: "12px 20px", flexWrap: "wrap" }}>
        {["Δx", "v₀", "v", "a", "t"].map(v => (
          <button key={v} onClick={() => setMissing(missing === v ? null : v)} style={{
            background: missing === v ? "#1e293b" : "#1e293b",
            color: missing === v ? "#e2e8f0" : "#64748b",
            border: `2px solid ${missing === v ? EQUATIONS.find(e => e.missing === v)?.color || "#334155" : "#334155"}`,
            borderRadius: 8, padding: "8px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer",
            transition: "all 0.2s"
          }}>
            {v} missing
          </button>
        ))}
      </div>

      {/* Equations */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 20px 20px" }}>
        {EQUATIONS.map(eq => {
          const active = missing === eq.missing;
          return (
            <div key={eq.id} style={{
              background: active ? "#0c1a2e" : "#1e293b",
              borderRadius: 10, padding: "14px 18px",
              border: `2px solid ${active ? eq.color : "#334155"}`,
              transition: "all 0.3s",
              opacity: missing && !active ? 0.4 : 1,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 11, color: eq.color, fontWeight: 700, marginRight: 8 }}>Eq {eq.id}</span>
                  <span style={{ fontSize: 15, fontFamily: "'Fira Code',monospace", color: "#e2e8f0", fontWeight: 700 }}>{eq.formula}</span>
                </div>
                <span style={{ background: "#1e293b", color: eq.color, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                  omits {eq.missing}
                </span>
              </div>
              {active && <div style={{ marginTop: 8, fontSize: 13, color: "#94a3b8" }}>{eq.desc}</div>}
            </div>
          );
        })}
      </div>

      {missing && highlight && (
        <div style={{ margin: "0 20px 16px", padding: "12px 16px", background: "#0c1a2e", borderRadius: 10, borderLeft: `3px solid ${highlight.color}`, fontSize: 13, color: "#94a3b8" }}>
          <span style={{ color: highlight.color, fontWeight: 700 }}>Use: </span>{highlight.formula} — it doesn't contain {missing}, so you don't need to know it.
        </div>
      )}
    </div>
  );
}
