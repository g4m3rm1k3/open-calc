// DotProductCalculator.jsx — L10-13 Pillar 4
import { useState } from "react";

export default function DotProductCalculator({ params = {} }) {
  const [mode, setMode] = useState("component"); // component | magangle
  const [Ax, setAx] = useState(3); const [Ay, setAy] = useState(4); const [Az, setAz] = useState(0);
  const [Bx, setBx] = useState(1); const [By, setBy] = useState(-2); const [Bz, setBz] = useState(0);
  const [use3D, setUse3D] = useState(false);
  const [magA, setMagA] = useState(5); const [angA, setAngA] = useState(30);
  const [magB2, setMagB2] = useState(4); const [angB2, setAngB2] = useState(80);

  let dot, mA, mB, phi;
  if (mode === "component") {
    dot = Ax * Bx + Ay * By + (use3D ? Az * Bz : 0);
    mA = Math.sqrt(Ax ** 2 + Ay ** 2 + (use3D ? Az ** 2 : 0));
    mB = Math.sqrt(Bx ** 2 + By ** 2 + (use3D ? Bz ** 2 : 0));
    phi = mA > 0 && mB > 0 ? Math.acos(Math.max(-1, Math.min(1, dot / (mA * mB)))) * 180 / Math.PI : 0;
  } else {
    phi = Math.abs(angA - angB2);
    dot = magA * magB2 * Math.cos(phi * Math.PI / 180);
    mA = magA; mB = magB2;
  }
  const perpendicular = Math.abs(dot) < 0.001;
  const parallel = Math.abs(Math.abs(dot) - mA * mB) < 0.001;

  const inp = (val, set, label, w = 52) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 11, color: "#64748b", minWidth: 24 }}>{label}</span>
      <input type="number" value={val} step="0.1" onChange={e => set(parseFloat(e.target.value) || 0)}
        style={{ width: w, background: "#0f172a", border: "1px solid #334155", borderRadius: 5, color: "#e2e8f0", padding: "4px 6px", fontSize: 13, textAlign: "center" }} />
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · DOT PRODUCT CALCULATOR</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["component", "magangle"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              background: mode === m ? "#0ea5e9" : "#1e293b", color: mode === m ? "#0f172a" : "#64748b",
              border: `1px solid ${mode === m ? "#0ea5e9" : "#334155"}`, borderRadius: 6,
              padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer"
            }}>{m === "component" ? "Components" : "Mag & Angle"}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {mode === "component" ? (<>
          <div style={{ background: "#1e293b", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 700, marginBottom: 8 }}>A⃗</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {inp(Ax, setAx, "Aₓ")}
              {inp(Ay, setAy, "Aᵧ")}
              {use3D && inp(Az, setAz, "A_z")}
            </div>
          </div>
          <div style={{ background: "#1e293b", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, marginBottom: 8 }}>B⃗</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {inp(Bx, setBx, "Bₓ")}
              {inp(By, setBy, "Bᵧ")}
              {use3D && inp(Bz, setBz, "B_z")}
            </div>
          </div>
        </>) : (<>
          <div style={{ background: "#1e293b", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 700, marginBottom: 8 }}>A⃗</div>
            {inp(magA, setMagA, "|A|")} <div style={{ marginTop: 6 }} />{inp(angA, setAngA, "θ_A°", 60)}
          </div>
          <div style={{ background: "#1e293b", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, marginBottom: 8 }}>B⃗</div>
            {inp(magB2, setMagB2, "|B|")} <div style={{ marginTop: 6 }} />{inp(angB2, setAngB2, "θ_B°", 60)}
          </div>
        </>)}
      </div>

      {mode === "component" && (
        <div style={{ padding: "0 20px 8px" }}>
          <button onClick={() => setUse3D(u => !u)} style={{ background: use3D ? "#1a1a3e" : "#1e293b", color: use3D ? "#818cf8" : "#64748b", border: `1px solid ${use3D ? "#6366f1" : "#334155"}`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            {use3D ? "3D mode ON" : "Enable 3D (z)"}
          </button>
        </div>
      )}

      {/* Results */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, padding: "8px 20px" }}>
        <div style={{ background: "#1e293b", borderRadius: 8, padding: "10px 12px", gridColumn: "span 3", borderLeft: `4px solid ${perpendicular ? "#818cf8" : parallel ? "#f59e0b" : "#0ea5e9"}` }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>A⃗ · B⃗ = AₓBₓ + AᵧBᵧ{use3D ? " + A_zB_z" : ""}</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: perpendicular ? "#818cf8" : parallel ? "#f59e0b" : "#0ea5e9" }}>{dot.toFixed(4)}</div>
        </div>
        {[
          { label: "φ (angle)", val: phi.toFixed(2) + "°", color: "#818cf8" },
          { label: "Status", val: perpendicular ? "⊥ Perpendicular" : parallel ? "∥ Parallel" : "Oblique", color: perpendicular ? "#818cf8" : parallel ? "#f59e0b" : "#94a3b8" },
          { label: "|A⃗||B⃗|cosφ check", val: (mA * mB * Math.cos(phi * Math.PI / 180)).toFixed(4), color: "#64748b" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ background: "#1e293b", borderRadius: 8, padding: "10px 14px", fontFamily: "'Fira Code',monospace", fontSize: 12, color: "#94a3b8" }}>
          {mode === "component"
            ? `${Ax}×${Bx} + ${Ay}×${By}${use3D ? ` + ${Az}×${Bz}` : ""} = ${dot.toFixed(4)}`
            : `${mA.toFixed(2)} × ${mB.toFixed(2)} × cos(${phi.toFixed(1)}°) = ${dot.toFixed(4)}`}
        </div>
      </div>
    </div>
  );
}
