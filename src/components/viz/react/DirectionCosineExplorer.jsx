// DirectionCosineExplorer.jsx — Pillar 4
import { useState } from "react";

export default function DirectionCosineExplorer({ params = {} }) {
  const [alpha, setAlpha] = useState(70);
  const [beta,  setBeta]  = useState(60);
  // Gamma is constrained by cos²α+cos²β+cos²γ=1
  const cosA = Math.cos(alpha * Math.PI / 180);
  const cosB = Math.cos(beta  * Math.PI / 180);
  const cos2G = 1 - cosA ** 2 - cosB ** 2;
  const valid = cos2G >= 0;
  const cosG = valid ? Math.sqrt(cos2G) : 0;
  const gamma = valid ? Math.acos(cosG) * 180 / Math.PI : null;

  // Reconstruct unit vector
  const ux = cosA, uy = cosB, uz = cosG;
  const check = ux ** 2 + uy ** 2 + uz ** 2;

  // Also allow free-form component entry
  const [mode, setMode] = useState("angles"); // angles | components
  const [Cx, setCx] = useState(2); const [Cy, setCy] = useState(3); const [Cz, setCz] = useState(6);
  const cmag = Math.sqrt(Cx ** 2 + Cy ** 2 + Cz ** 2);
  const ccosA = cmag > 0 ? Cx / cmag : 0;
  const ccosB = cmag > 0 ? Cy / cmag : 0;
  const ccosG = cmag > 0 ? Cz / cmag : 0;
  const cAlpha = Math.acos(Math.max(-1, Math.min(1, ccosA))) * 180 / Math.PI;
  const cBeta  = Math.acos(Math.max(-1, Math.min(1, ccosB))) * 180 / Math.PI;
  const cGamma = Math.acos(Math.max(-1, Math.min(1, ccosG))) * 180 / Math.PI;

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#818cf8", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · DIRECTION COSINE EXPLORER</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["angles", "components"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              background: mode === m ? "#818cf8" : "#1e293b", color: mode === m ? "#0f172a" : "#64748b",
              border: `1px solid ${mode === m ? "#818cf8" : "#334155"}`, borderRadius: 6,
              padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer"
            }}>{m === "angles" ? "From angles" : "From components"}</button>
          ))}
        </div>
      </div>

      {mode === "angles" ? (
        <div style={{ padding: "14px 20px" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>
            Set α and β — γ is computed automatically to satisfy cos²α+cos²β+cos²γ=1
          </div>
          {[["α (from x-axis)", alpha, setAlpha, "#f59e0b"], ["β (from y-axis)", beta, setBeta, "#10b981"]].map(([label, val, set, color]) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                <span>{label}</span><span style={{ color, fontWeight: 700 }}>{val}°</span>
              </div>
              <input type="range" min={0} max={180} step={1} value={val}
                onChange={e => set(parseInt(e.target.value))} style={{ width: "100%" }} />
            </div>
          ))}
          {!valid && (
            <div style={{ background: "#2a0d0d", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#f87171", marginBottom: 10 }}>
              ⚠ cos²α + cos²β &gt; 1 — no real γ exists for this combination. Reduce α or β.
            </div>
          )}
          {valid && (
            <div style={{ background: "#0d2a1e", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#34d399", marginBottom: 10 }}>
              γ = {gamma?.toFixed(2)}°  (computed from identity)
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: "14px 20px" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>Enter any vector — direction cosines computed automatically</div>
          {[["Aₓ", Cx, setCx], ["Aᵧ", Cy, setCy], ["A_z", Cz, setCz]].map(([label, val, set]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#64748b", width: 28 }}>{label}</span>
              <input type="number" value={val} step="0.5" onChange={e => set(parseFloat(e.target.value) || 0)}
                style={{ width: 64, background: "#1e293b", border: "1px solid #334155", borderRadius: 5, color: "#e2e8f0", padding: "5px 8px", fontSize: 13, textAlign: "center" }} />
            </div>
          ))}
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>|A⃗| = {cmag.toFixed(4)}</div>
        </div>
      )}

      {/* Results grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "0 20px 20px" }}>
        {(mode === "angles" ? [
          { label: "cosα", cos: cosA.toFixed(5), angle: alpha + "°", color: "#f59e0b" },
          { label: "cosβ", cos: cosB.toFixed(5), angle: beta + "°",  color: "#10b981" },
          { label: "cosγ", cos: (valid ? cosG.toFixed(5) : "—"), angle: valid ? gamma?.toFixed(2) + "°" : "—", color: "#818cf8" },
        ] : [
          { label: "cosα", cos: ccosA.toFixed(5), angle: cAlpha.toFixed(1) + "°", color: "#f59e0b" },
          { label: "cosβ", cos: ccosB.toFixed(5), angle: cBeta.toFixed(1) + "°",  color: "#10b981" },
          { label: "cosγ", cos: ccosG.toFixed(5), angle: cGamma.toFixed(1) + "°", color: "#818cf8" },
        ]).map(({ label, cos, angle, color }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color }}>{angle}</div>
            <div style={{ fontSize: 11, fontFamily: "'Fira Code',monospace", color: "#64748b", marginTop: 3 }}>{cos}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 20px 14px" }}>
        <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 14px", fontFamily: "'Fira Code',monospace", fontSize: 12, color: "#94a3b8" }}>
          cos²α + cos²β + cos²γ = {mode === "angles" ? (valid ? (cosA**2+cosB**2+cosG**2).toFixed(6) : "invalid") : (ccosA**2+ccosB**2+ccosG**2).toFixed(6)}
        </div>
      </div>
    </div>
  );
}
