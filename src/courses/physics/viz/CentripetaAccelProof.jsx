// CentripetaAccelProof.jsx — Ch3 L16-21 Pillar 2
import { useState } from "react";
const STEPS = [
  {
    title: "Velocity is tangential",
    eq: "|\\vec{v}| = v = \\text{const},\\quad \\vec{v} \\perp \\vec{r}\\text{ at all times}",
    insight: "In uniform circular motion the speed is constant but direction rotates. At every point the velocity vector is tangent to the circle — perpendicular to the radius.",
  },
  {
    title: "Velocity vector rotates",
    eq: "\\text{In time }\\Delta t:\\;\\Delta\\theta = \\omega\\,\\Delta t = \\frac{v\\,\\Delta t}{r}",
    insight: "As the object moves through angle Δθ, the velocity vector also rotates through the same angle Δθ. This is a geometric fact — two perpendicular relationships rotate together.",
  },
  {
    title: "Magnitude of Δv⃗ from geometry",
    eq: "|\\Delta\\vec{v}| \\approx v\\,\\Delta\\theta = v\\cdot\\frac{v\\,\\Delta t}{r} = \\frac{v^2}{r}\\Delta t",
    insight: "For small Δθ, the chord length of the velocity triangle ≈ v·Δθ (arc length). Substituting Δθ = v·Δt/r gives |Δv⃗| = v²Δt/r.",
  },
  {
    title: "Take the limit",
    eq: "a_c = \\lim_{\\Delta t\\to 0}\\frac{|\\Delta\\vec{v}|}{\\Delta t} = \\frac{v^2}{r} = \\omega^2 r",
    insight: "Dividing by Δt and taking the limit gives the centripetal acceleration magnitude. The ω²r form comes from substituting v = ωr.",
  },
  {
    title: "Direction: toward centre",
    eq: "\\vec{a}_c\\text{ points from the object toward the centre of the circle (centripetal = centre-seeking)}",
    insight: "The direction of Δv⃗ (and thus the acceleration) points toward the centre. This is why centripetal acceleration is sometimes called 'centre-seeking' acceleration. Without it the object would fly off in a straight line.",
  },
];
export default function CentripetaAccelProof({ params = {} }) {
  const si = Math.min(params.currentStep ?? 0, STEPS.length - 1);
  const s = STEPS[si];
  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, padding: "0 0 20px" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: "#1e293b", color: "#818cf8", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>STEP {si + 1}/{STEPS.length}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{s.title}</span>
      </div>
      <div style={{ margin: "10px 20px", padding: "12px 16px", background: "#1e293b", borderRadius: 10, fontFamily: "'Fira Code',monospace", fontSize: 12, color: "#c4b5fd", borderLeft: "3px solid #818cf8", lineHeight: 1.8 }}>
        {s.eq}
      </div>
      <div style={{ margin: "0 20px", padding: "11px 15px", background: "#0c1a2e", borderRadius: 10, borderLeft: "3px solid #0ea5e9", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
        <span style={{ color: "#38bdf8", fontWeight: 600 }}>Insight: </span>{s.insight}
      </div>
    </div>
  );
}
