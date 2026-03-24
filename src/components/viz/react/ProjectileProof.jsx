// ProjectileProof.jsx — Ch3 Pillar 2 (shared across all projectile lessons)
const STEPS = [
  {
    title: "Assert independence",
    eq: "a_x = 0,\\quad a_y = -g\\quad \\Rightarrow \\text{ axes decouple}",
    insight: "Gravity acts only downward. There is zero horizontal force (air resistance neglected). This means horizontal and vertical motions are completely independent — we can solve each as a 1D problem.",
  },
  {
    title: "Horizontal equations",
    eq: "v_x = v_{0x} = v_0\\cos\\theta\\quad (\\text{constant}),\\qquad x = v_{0x}\\,t",
    insight: "No horizontal force → no horizontal acceleration → constant horizontal velocity. Position grows linearly with time. This is the simplest possible 1D motion.",
  },
  {
    title: "Vertical equations",
    eq: "v_y = v_{0y} - gt,\\quad y = v_{0y}t - \\tfrac{1}{2}gt^2,\\quad v_y^2 = v_{0y}^2 - 2gy",
    insight: "Vertical motion is pure free fall with initial upward velocity v₀y. These are the same SUVAT equations from Chapter 2, with a = −g.",
  },
  {
    title: "Time is the coupling variable",
    eq: "t = x / v_{0x}\\quad\\text{(from horizontal)}\\quad\\Rightarrow\\text{ substitute into vertical equations}",
    insight: "Time is the only shared variable. Find t from the horizontal equation (or from vertical constraints) and substitute to connect the two axes.",
  },
  {
    title: "Trajectory equation",
    eq: "y = x\\tan\\theta - \\frac{g\\,x^2}{2v_0^2\\cos^2\\theta}\\quad (\\text{parabola})",
    insight: "Eliminate t entirely using x = v₀ₓt. The result is a parabola in x and y — the exact shape of every projectile trajectory under uniform gravity.",
  },
];

import { useState } from "react";
export default function ProjectileProof({ params = {} }) {
  const si = Math.min(params.currentStep ?? 0, STEPS.length - 1);
  const s = STEPS[si];
  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, padding: "0 0 20px" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: "#1e293b", color: "#6366f1", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>STEP {si + 1}/{STEPS.length}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{s.title}</span>
      </div>
      <div style={{ margin: "10px 20px", padding: "12px 16px", background: "#1e293b", borderRadius: 10, fontFamily: "'Fira Code',monospace", fontSize: 12, color: "#a5b4fc", borderLeft: "3px solid #6366f1", lineHeight: 1.8 }}>
        {s.eq}
      </div>
      <div style={{ margin: "0 20px", padding: "11px 15px", background: "#0c1a2e", borderRadius: 10, borderLeft: "3px solid #0ea5e9", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
        <span style={{ color: "#38bdf8", fontWeight: 600 }}>Insight: </span>{s.insight}
      </div>
    </div>
  );
}
