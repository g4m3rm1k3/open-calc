// DirectionCosineProof.jsx — Pillar 2
import { useState } from "react";

const STEPS = [
  {
    title: "Define direction cosines",
    eq:    "cosα = Aₓ/|A⃗|,   cosβ = Aᵧ/|A⃗|,   cosγ = Az/|A⃗|",
    insight: "Each direction cosine is the component along that axis divided by the magnitude. Each one equals cos of the angle to that axis.",
  },
  {
    title: "Square all three",
    eq:    "cos²α = Aₓ²/|A⃗|²,   cos²β = Aᵧ²/|A⃗|²,   cos²γ = Az²/|A⃗|²",
    insight: "Squaring each cosine gives the squared component over the squared magnitude.",
  },
  {
    title: "Sum them",
    eq:    "cos²α + cos²β + cos²γ  =  (Aₓ² + Aᵧ² + Az²) / |A⃗|²",
    insight: "The numerators combine into the sum of squared components.",
  },
  {
    title: "Recognise the numerator",
    eq:    "Aₓ² + Aᵧ² + Az²  =  |A⃗|²  (Pythagorean theorem in 3D)",
    insight: "The 3D Pythagorean theorem: the squared magnitude equals the sum of squared components. This is the key step.",
  },
  {
    title: "Identity proven",
    eq:    "cos²α + cos²β + cos²γ  =  |A⃗|² / |A⃗|²  =  1  ✓",
    insight: "The numerator and denominator cancel. The direction cosines always satisfy this identity — it is the 3D version of cos²θ + sin²θ = 1.",
  },
];

export default function DirectionCosineProof({ params = {} }) {
  const si = Math.min(params.currentStep ?? 0, STEPS.length - 1);
  const step = STEPS[si];

  // Live example with A⃗ = (2, 3, 6), |A⃗| = 7
  const [Ax, Ay, Az] = [2, 3, 6];
  const mag = 7;
  const cosA = Ax / mag, cosB = Ay / mag, cosG = Az / mag;
  const sumSq = cosA ** 2 + cosB ** 2 + cosG ** 2;

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: "#1e293b", color: "#818cf8", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
          STEP {si + 1}/{STEPS.length}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{step.title}</span>
      </div>

      <div style={{ margin: "10px 20px", padding: "12px 16px", background: "#1e293b", borderRadius: 10, fontFamily: "'Fira Code',monospace", fontSize: 13, color: "#c4b5fd", borderLeft: "3px solid #818cf8" }}>
        {step.eq}
      </div>

      {/* Live walkthrough with A⃗=(2,3,6) */}
      <div style={{ padding: "0 20px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>Live example: A⃗ = (2, 3, 6),  |A⃗| = 7</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "cosα", val: cosA.toFixed(4), color: "#f59e0b", show: si >= 0 },
            { label: "cosβ", val: cosB.toFixed(4), color: "#10b981", show: si >= 0 },
            { label: "cosγ", val: cosG.toFixed(4), color: "#818cf8", show: si >= 0 },
            { label: "Σcos²", val: sumSq.toFixed(6), color: sumSq > 0.9999 ? "#34d399" : "#94a3b8", show: si >= 2 },
          ].map(({ label, val, color, show }) => (
            <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px", opacity: show ? 1 : 0.2, transition: "opacity 0.4s", borderLeft: `3px solid ${color}` }}>
              <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
              <div style={{ fontSize: 13, fontFamily: "'Fira Code',monospace", fontWeight: 700, color }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ margin: "0 20px 20px", padding: "11px 15px", background: "#0c1a2e", borderRadius: 10, borderLeft: "3px solid #0ea5e9", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
        <span style={{ color: "#38bdf8", fontWeight: 600 }}>Insight: </span>{step.insight}
      </div>
    </div>
  );
}
