import { useState, useEffect, useRef } from "react";
import { 
  useMath, 
  WhyPanel, 
  mkPanel as P, 
  mkHdr as H, 
  mkBody as B, 
  mkInsight as INS, 
  mkBadge as BDG, 
  mkHook as HK, 
  mkSeed as SD, 
} from "./GeometryHelpers.jsx";

export default function G2_3_Constructions({ params = {} }) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState("bisect");
  const constructions = {
    bisect: {
      title: "Bisect a line segment",
      steps: ["Start with segment AB.", "Set compass to more than half AB. Draw arc from A.", "Same setting: draw arc from B. Arcs cross at C and D.", "Line CD bisects AB at its midpoint M.", "Proof: AC=AD=BC=BD (equal compass settings) → △ACD ≅ △BCD (SSS) → M is the midpoint."]
    },
    perpendicular: {
      title: "Perpendicular through a point on a line",
      steps: ["Start with point P on line l.", "Draw two arcs from P at equal radius, hitting l at A and B.", "From A and B, draw arcs (equal radius) above the line crossing at Q.", "PQ is perpendicular to l.", "Proof: PA=PB and QA=QB (equal settings) → △PAQ ≅ △PBQ (SSS) → ∠QPM = 90°."]
    },
    angle_bisect: {
      title: "Bisect an angle",
      steps: ["Start with angle ∠BAC.", "Draw arc from A hitting AB at P and AC at Q.", "From P and Q, draw equal arcs crossing at R.", "AR bisects ∠BAC.", "Proof: AP=AQ (same arc), PR=QR (same setting) → △APR ≅ △AQR (SSS) → ∠PAR = ∠QAR."]
    }
  };
  const c = constructions[type];
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {BDG(3)}
      {HK("John wants to cut a plank perfectly in half with only a compass — he's lost his ruler. Albert shows him three classical constructions: bisecting a segment, drawing a perpendicular, and bisecting an angle. Each uses only compass and straightedge, and each has a proof.")}
      <div style={P}>
        {H("Story", { background: "#ecfdf5", color: "#065f46" }, "Compass and straightedge constructions")}
        <div style={{ ...B, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><em style={{ color: "var(--color-text-secondary)" }}>"Why only compass and straightedge?"</em> <span style={{ color: "#065f46", fontWeight: 500 }}>John</span> asked. <em style={{ color: "var(--color-text-secondary)" }}>"Why not use a ruler with marks?"</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> explained: the ancient Greeks were trying to find what geometry could prove from its axioms alone — without measurement. A compass implements P3 (draw a circle). A straightedge (unmarked ruler) implements P1 and P2 (draw a line). Measurement introduces numbers — which is a different system. Pure construction uses only the axioms.</p>
        </div>
      </div>
      <div style={P}>
        {H("Discovery", { background: "#ecfdf5", color: "#065f46" }, "Three classical constructions — step by step")}
        <div style={B}>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {Object.entries(constructions).map(([key, val]) => (
              <button key={key} onClick={() => { setType(key); setStep(0); }} style={{ flex: 1, padding: "6px 8px", borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)", border: `1px solid ${type === key ? "#059669" : "var(--color-border-tertiary)"}`, background: type === key ? "#ecfdf5" : "transparent", color: type === key ? "#065f46" : "var(--color-text-secondary)" }}>{val.title}</button>
            ))}
          </div>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#059669", marginBottom: 8 }}>Step {step + 1} of {c.steps.length}</div>
            <p style={{ fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.65 }}>{c.steps[step]}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ flex: 1 }}>← Previous</button>
            <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", minWidth: 72, textAlign: "center" }}>{step + 1} / {c.steps.length}</span>
            <button onClick={() => setStep(s => Math.min(c.steps.length - 1, s + 1))} disabled={step === c.steps.length - 1} style={{ flex: 1 }}>Next →</button>
          </div>
          <div style={{ ...INS(), marginTop: 14 }}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>What can't be constructed:</strong> Trisecting an angle, squaring the circle (constructing a square with area equal to a given circle), and doubling the cube — all proved impossible in 1837 by Wantzel and Galois. The proofs use abstract algebra (field theory) to show no finite sequence of compass-and-straightedge steps can produce these results.</div>
          <WhyPanel tag="Why is trisecting an angle impossible with compass and straightedge?" depth={0}>
            <p style={{ marginBottom: 8 }}>Compass-and-straightedge constructions correspond exactly to numbers that can be built from rationals using +, −, ×, ÷, and √ (square roots). Trisecting an angle in general requires solving a cubic equation — extracting a cube root — which is outside this set. Wantzel (1837) proved this using Galois field theory. It's not that no one is smart enough — it's mathematically impossible with those tools.</p>
          </WhyPanel>
        </div>
      </div>
      {SD(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Mic measures the height of the lighthouse using only its shadow — without climbing it. Albert explains similar triangles: when two triangles have the same angles, their sides are proportional, and this lets you scale measurements across any distance. Chapter 4: <em>Similar Triangles and Proportion.</em></>)}
    </div>
  );
}
