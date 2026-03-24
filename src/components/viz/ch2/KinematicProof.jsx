// KinematicProof.jsx — Ch2 Pillar 2 (shared across many lessons)
import { useState } from "react";
const STEPS = [
  { title: "Start: constant acceleration", eq: "a = const  ⟹  v(t) = v₀ + at  [Eq 1]", insight: "Integrate constant acceleration with respect to time. The constant of integration is v₀." },
  { title: "Integrate velocity for displacement", eq: "Δx = ∫₀ᵗ v dt = ∫₀ᵗ (v₀+at) dt = v₀t + ½at²  [Eq 3]", insight: "Integrate Eq 1. This is the fundamental displacement equation — the other three are algebraic rearrangements." },
  { title: "Derive Eq 5 (no time)", eq: "v² = (v₀+at)² = v₀² + 2a(v₀t+½at²) = v₀² + 2aΔx  [Eq 5]", insight: "Square Eq 1, then substitute Eq 3. Time cancels out. This equation connects velocity, acceleration, and displacement directly." },
  { title: "Derive Eq 2 (no acceleration)", eq: "Δx = ½(v₀+v)t  [Eq 2] — average of initial and final velocity × time", insight: "Since v increases linearly, the average velocity is exactly (v₀+v)/2. Multiply by time. Valid ONLY for constant acceleration." },
  { title: "All five equations", eq: "Eq1: v=v₀+at  Eq2: Δx=½(v₀+v)t  Eq3: Δx=v₀t+½at²  Eq4: Δx=vt−½at²  Eq5: v²=v₀²+2aΔx", insight: "Only Eq 1 and Eq 3 are independent. The other three follow algebraically. You only need to memorise two — or re-derive the rest." },
];
export default function KinematicProof({ params = {} }) {
  const si = Math.min(params.currentStep ?? 0, STEPS.length - 1);
  const s = STEPS[si];
  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, padding: "0 0 20px" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: "#1e293b", color: "#10b981", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>STEP {si + 1}/{STEPS.length}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{s.title}</span>
      </div>
      <div style={{ margin: "10px 20px", padding: "12px 16px", background: "#1e293b", borderRadius: 10, fontFamily: "'Fira Code',monospace", fontSize: 12, color: "#6ee7b7", borderLeft: "3px solid #10b981", lineHeight: 1.8 }}>{s.eq}</div>
      <div style={{ margin: "0 20px", padding: "11px 15px", background: "#0c1a2e", borderRadius: 10, borderLeft: "3px solid #0ea5e9", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
        <span style={{ color: "#38bdf8", fontWeight: 600 }}>Insight: </span>{s.insight}
      </div>
    </div>
  );
}
