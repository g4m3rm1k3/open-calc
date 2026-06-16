// DirectionCosineIntuition.jsx — Pillar 1
import { useState } from "react";

export default function DirectionCosineIntuition({ params = {} }) {
  const [Ax, setAx] = useState(2);
  const [Ay, setAy] = useState(3);
  const [Az, setAz] = useState(6);

  const mag = Math.sqrt(Ax ** 2 + Ay ** 2 + Az ** 2);
  const cosA = mag > 0 ? Ax / mag : 0;
  const cosB = mag > 0 ? Ay / mag : 0;
  const cosG = mag > 0 ? Az / mag : 0;
  const alpha = Math.acos(Math.max(-1, Math.min(1, cosA))) * 180 / Math.PI;
  const beta  = Math.acos(Math.max(-1, Math.min(1, cosB))) * 180 / Math.PI;
  const gamma = Math.acos(Math.max(-1, Math.min(1, cosG))) * 180 / Math.PI;
  const sumSq = cosA ** 2 + cosB ** 2 + cosG ** 2;

  const inp = (val, set, label) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, color: "#64748b", width: 24 }}>{label}</span>
      <input type="range" min={-6} max={6} step={0.5} value={val}
        onChange={e => set(parseFloat(e.target.value))}
        style={{ flex: 1 }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", minWidth: 32 }}>{val}</span>
    </div>
  );

  const AXES = [
    { label: "α (from x)", cos: cosA, angle: alpha, color: "#f59e0b" },
    { label: "β (from y)", cos: cosB, angle: beta,  color: "#10b981" },
    { label: "γ (from z)", cos: cosG, angle: gamma, color: "#818cf8" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#818cf8", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · DIRECTION COSINES</span>
        <span style={{ background: Math.abs(sumSq - 1) < 0.001 ? "#0d2a1e" : "#2a0d0d", color: Math.abs(sumSq - 1) < 0.001 ? "#34d399" : "#f87171", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
          cos²α+cos²β+cos²γ = {sumSq.toFixed(5)}
        </span>
      </div>

      <div style={{ padding: "14px 20px" }}>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>Drag sliders to set A⃗ = (Aₓ, Aᵧ, A_z)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {inp(Ax, setAx, "Aₓ")}
          {inp(Ay, setAy, "Aᵧ")}
          {inp(Az, setAz, "A_z")}
        </div>
        <div style={{ background: "#1e293b", borderRadius: 8, padding: "10px 14px", fontFamily: "'Fira Code',monospace", fontSize: 12, color: "#64748b", marginBottom: 14 }}>
          |A⃗| = √({Ax}²+{Ay}²+{Az}²) = <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{mag.toFixed(4)}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "0 20px 20px" }}>
        {AXES.map(({ label, cos, angle, color }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13, fontFamily: "'Fira Code',monospace", color: "#94a3b8", marginBottom: 6 }}>cosine = {cos.toFixed(4)}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color }}>{angle.toFixed(1)}°</div>
            {/* Visual bar showing how much the vector "aligns" with this axis */}
            <div style={{ height: 4, background: "#334155", borderRadius: 2, marginTop: 8 }}>
              <div style={{ height: "100%", width: `${Math.abs(cos) * 100}%`, background: color, borderRadius: 2, transition: "width 0.2s" }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 20px 14px", fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
        The three direction cosines give the angle each vector makes with the x, y, and z axes respectively.
        Their squares always sum to exactly 1 — this is the 3D Pythagorean identity.
      </div>
    </div>
  );
}
