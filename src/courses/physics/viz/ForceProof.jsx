// ForceProof.jsx — L9 Pillar 2
import { useState } from "react";
const STEPS = [
  { title: "Net force is a vector sum", eq: "F⃗_net = Σᵢ F⃗ᵢ", insight: "Every force is a vector. The net force is their vector sum — not the sum of magnitudes." },
  { title: "Expand into components", eq: "= Σᵢ (Fᵢₓ î + Fᵢᵧ ĵ)", insight: "Replace each force with its component form. Now we have a sum of scalars times basis vectors." },
  { title: "Collect by axis", eq: "= (ΣFᵢₓ) î + (ΣFᵢᵧ) ĵ", insight: "Group the î terms together and ĵ terms together. Each axis is now independent." },
  { title: "Newton's 2nd law per axis", eq: "ΣFₓ = maₓ   and   ΣFᵧ = maᵧ", insight: "The x and y equations can be solved independently. A horizontal net force produces only horizontal acceleration." },
  { title: "Equilibrium condition", eq: "a⃗ = 0⃗  ⟺  ΣFₓ = 0  AND  ΣFᵧ = 0", insight: "Zero net force in every component simultaneously. One non-zero component is enough to cause acceleration." },
];
export default function ForceProof({ params = {} }) {
  const si = Math.min(params.currentStep ?? 0, STEPS.length - 1);
  const s = STEPS[si];
  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, padding: "0 0 20px" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: "#1e293b", color: "#10b981", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>STEP {si + 1}/{STEPS.length}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{s.title}</span>
      </div>
      <div style={{ margin: "10px 20px", padding: "11px 16px", background: "#1e293b", borderRadius: 10, fontFamily: "'Fira Code',monospace", fontSize: 14, color: "#6ee7b7", borderLeft: "3px solid #10b981" }}>{s.eq}</div>
      <div style={{ margin: "0 20px", padding: "11px 15px", background: "#0c1a2e", borderRadius: 10, borderLeft: "3px solid #0ea5e9", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
        <span style={{ color: "#38bdf8", fontWeight: 600 }}>Insight: </span>{s.insight}
      </div>
    </div>
  );
}
