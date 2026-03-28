import { useState, useEffect, useRef } from "react";
import { 
  useMath, 
  M,
  WhyPanel, 
  mkPanel as GP, 
  mkHdr as GH, 
  mkBody as GB, 
  mkInsight as GI, 
  mkBadge as GBG, 
  mkHook as GHK, 
  mkSeed as GSD, 
  mkMbox as GMB
} from "./GeometryHelpers.jsx";

export default function G3_2_LinesInPlane({ params = {} }) {
  const [slope, setSlope] = useState(0.5);
  const [intercept, setIntercept] = useState(1);
  const [showPerp, setShowPerp] = useState(false);
  const ready = useMath();
  const perpSlope = slope !== 0 ? (-1 / slope) : Infinity;
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {GBG(2)}
      {GHK("Mic needs dock beams parallel to each other and perpendicular to the shoreline. Albert translates these geometric conditions into slope algebra: parallel lines have equal slopes, perpendicular lines have slopes that multiply to −1. Both conditions are proved geometrically.")}
      <div style={GP}>
        {GH("Story", { background: "#ecfeff", color: "#155e75" }, "Lines in the plane")}
        <div style={{ ...GB, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span> drew two lines. <em style={{ color: "var(--color-text-secondary)" }}>"How do I know if these are parallel without measuring every point?"</em></p>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> looked at the slopes. <em style={{ color: "var(--color-text-secondary)" }}>"Same slope, different intercept — parallel. And perpendicular: the slopes multiply to negative one. Not approximately — exactly negative one. I'll prove both from similar triangles."</em></p>
        </div>
      </div>
      <div style={GP}>
        {GH("Discovery", { background: "#ecfeff", color: "#155e75" }, "Slope conditions for parallel and perpendicular lines")}
        <div style={GB}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            {[["Slope m", slope, -3, 3, 0.1, setSlope], ["y-intercept b", intercept, -4, 4, 0.5, setIntercept]].map(([label, val, min, max, step, setter]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 160 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 80 }}>{label}</span>
                <input type="range" min={min} max={max} value={val} step={step} onChange={e => setter(parseFloat(e.target.value))} style={{ flex: 1 }} />
                <span style={{ fontSize: 13, fontWeight: 500, minWidth: 40 }}>{typeof val === "number" ? val.toFixed(1) : val}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setShowPerp(p => !p)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)", border: "1px solid #0891b2", background: showPerp ? "#ecfeff" : "transparent", color: "#0891b2", marginBottom: 12 }}>
            {showPerp ? "Hide perpendicular" : "Show perpendicular line"}
          </button>
          {ready && <div style={GMB}><M t={`y = ${slope.toFixed(1)}x + ${intercept.toFixed(1)} \\qquad ${showPerp ? `\\text{Perp: } y = ${perpSlope === Infinity ? "\\text{vertical}" : perpSlope.toFixed(2) + "x"}` : "\\text{Parallel: same slope, different intercept}"}`} display ready={ready} /></div>}
          {[{ num: 1, label: "Parallel lines have equal slopes", note: "Two lines rise and run at the same rate — they make the same angle with the horizontal. If m₁ = m₂ but b₁ ≠ b₂, the lines never meet. Proved: if they had different slopes, they'd intersect at some point (by the Parallel Postulate, P5)." }, { num: 2, label: "Perpendicular lines: m₁ × m₂ = −1", note: "Rotate a direction vector (1, m₁) by 90°: get (−m₁, 1). Slope of rotated vector = 1/(−m₁) = −1/m₁. So m₂ = −1/m₁, meaning m₁ × m₂ = −1. Confirmed by: (0.5) × (−2) = −1 ✓." }, { num: 3, label: "Point-slope form: y−y₁ = m(x−x₁)", note: "A line through (x₁,y₁) with slope m: the slope between (x₁,y₁) and any point (x,y) must equal m. So (y−y₁)/(x−x₁) = m. Rearrange: y−y₁ = m(x−x₁). This is the most direct form — derived from the definition of slope." }].map((s, i) => (
            <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: "#0891b2", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{s.num}</span><span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{s.label}</span></div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{s.note}</div>
            </div>
          ))}
          <div style={GI()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Connection to Book 1, Ch 1.4:</strong> The slope explored there was a physical ramp. Here it's a formal algebraic object. The perpendicularity condition m₁m₂ = −1 is the algebraic version of the geometric fact proved in G2.2: a tangent to a circle is perpendicular to the radius (and the implicit differentiation result dy/dx = −x/y).</div>
        </div>
      </div>
      {GSD(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Mic needs to specify the dock boundary as a circle equation for the engineering drawings. Albert derives (x−h)²+(y−k)²=r² from the distance formula, and shows how to find the centre and radius when the equation arrives in expanded form. Chapter 3: <em>The Circle Equation.</em></>)}
    </div>
  );
}
