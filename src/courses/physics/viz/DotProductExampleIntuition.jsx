// DotProductExampleIntuition.jsx — L11 Pillar 1: component dot product with worked example
import { useState } from "react";
export default function DotProductExampleIntuition({ params = {} }) {
  const [Ax, setAx] = useState(3); const [Ay, setAy] = useState(4);
  const [Bx, setBx] = useState(1); const [By, setBy] = useState(-2);
  const dot = Ax * Bx + Ay * By;
  const mA = Math.sqrt(Ax ** 2 + Ay ** 2), mB = Math.sqrt(Bx ** 2 + By ** 2);
  const phi = mA > 0 && mB > 0 ? Math.acos(Math.max(-1, Math.min(1, dot / (mA * mB)))) * 180 / Math.PI : 0;
  const dotColor = dot > 0.05 ? "#10b981" : dot < -0.05 ? "#f43f5e" : "#818cf8";
  const inp = (val, set, label) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, color: "#64748b", width: 24 }}>{label}</span>
      <input type="number" value={val} step="1" onChange={e => set(parseFloat(e.target.value) || 0)} style={{ width: 56, background: "#0f172a", border: "1px solid #334155", borderRadius: 6, color: "#e2e8f0", padding: "5px 8px", fontSize: 14, textAlign: "center" }} />
    </div>
  );
  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0" }}><span style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · COMPONENT DOT PRODUCT</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "14px 20px" }}>
        <div style={{ background: "#1e293b", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 700, marginBottom: 8 }}>A⃗</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{inp(Ax, setAx, "Aₓ")}{inp(Ay, setAy, "Aᵧ")}</div>
        </div>
        <div style={{ background: "#1e293b", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, marginBottom: 8 }}>B⃗</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{inp(Bx, setBx, "Bₓ")}{inp(By, setBy, "Bᵧ")}</div>
        </div>
      </div>
      <div style={{ background: "#1e293b", margin: "0 20px", borderRadius: 10, padding: "14px 16px", fontFamily: "'Fira Code',monospace", fontSize: 13, color: "#94a3b8", lineHeight: 1.9 }}>
        <div>A⃗·B⃗ = Aₓ×Bₓ + Aᵧ×Bᵧ</div>
        <div style={{ color: "#e2e8f0" }}>= {Ax}×{Bx} + {Ay}×{By}</div>
        <div style={{ color: "#e2e8f0" }}>= {Ax * Bx} + {Ay * By}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: dotColor, marginTop: 4 }}>= {dot}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "12px 20px 20px" }}>
        {[{ label: "A⃗·B⃗", val: dot.toFixed(2), color: dotColor }, { label: "φ", val: phi.toFixed(1) + "°", color: "#818cf8" }, { label: dot === 0 ? "⊥ Perpendicular" : Math.abs(phi) < 1 ? "∥ Parallel" : "Oblique", val: "", color: dot === 0 ? "#818cf8" : "#94a3b8" }].map(({ label, val, color }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 11, color: "#64748b" }}>{val ? label : ""}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color }}>{val || label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
