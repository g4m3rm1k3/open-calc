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

export default function G3_3_CircleEquation({ params = {} }) {
  const [h, setH] = useState(1); const [k, setK] = useState(2); const [r, setR] = useState(5);
  const ready = useMath();
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {GBG(3)}
      {GHK("Mic receives the engineering specification for the circular dock boundary as an expanded equation: x²+y²−4x−8y−5=0. He needs the centre and radius. Albert shows that completing the square converts expanded form to standard form — and derives the circle equation from the distance formula.")}
      <div style={GP}>
        {GH("Story", { background: "#ecfeff", color: "#155e75" }, "The circle equation")}
        <div style={{ ...GB, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 0 }}><em style={{ color: "var(--color-text-secondary)" }}>"The equation of a circle is every point equidistant from the centre,"</em> <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> said. <em style={{ color: "var(--color-text-secondary)" }}>"Distance from (x,y) to (h,k) equals r. Square both sides of the distance formula: that's the circle equation. Standard form makes the centre and radius visible at a glance."</em></p>
        </div>
      </div>
      <div style={GP}>
        {GH("Discovery", { background: "#ecfeff", color: "#155e75" }, "(x−h)²+(y−k)²=r² — derived from distance")}
        <div style={GB}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            {[["Centre h", h, -5, 5, 1, setH], ["Centre k", k, -5, 5, 1, setK], ["Radius r", r, 1, 10, 1, setR]].map(([label, val, min, max, step, setter]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 140 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 70 }}>{label}</span>
                <input type="range" min={min} max={max} value={val} step={step} onChange={e => setter(parseInt(e.target.value))} style={{ flex: 1 }} />
                <span style={{ fontSize: 13, fontWeight: 500, minWidth: 20 }}>{val}</span>
              </div>
            ))}
          </div>
          {ready && <div style={GMB}><M t={`(x-${h})^2 + (y-${k})^2 = ${r}^2 = ${r*r}`} display ready={ready} /></div>}
          {ready && <div style={GMB}><M t={`\\text{Expanded: } x^2 + y^2 ${-2*h >= 0 ? "+" : ""}${-2*h}x ${-2*k >= 0 ? "+" : ""}${-2*k}y + ${h*h+k*k-r*r} = 0`} display ready={ready} /></div>}
          {[{ num: 1, label: "Distance from (x,y) to centre (h,k) = r", tex: "\\sqrt{(x-h)^2+(y-k)^2} = r" }, { num: 2, label: "Square both sides", tex: "(x-h)^2 + (y-k)^2 = r^2" }, { num: 3, label: "To go backwards (expanded→standard): complete the square in x, then in y", tex: "x^2 - 4x + \\square + y^2 - 8y + \\square = 5 + \\square + \\square" }].map((s, i) => (
            <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: "#0891b2", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{s.num}</span><span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{s.label}</span></div>
              {s.tex && ready && <div style={{ background: "var(--color-background-secondary)", borderRadius: 6, padding: 8, textAlign: "center", overflowX: "auto" }}><M t={s.tex} display ready={ready} /></div>}
            </div>
          ))}
          <div style={GI()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Connection:</strong> The circle equation is the Pythagorean theorem applied at every point: (x−h)²+(y−k)²=r² says each point forms a right triangle with the centre. Differentiating implicitly (Book 4, Ch 4.3) gives the tangent slope dy/dx = −(x−h)/(y−k) — confirming the tangent is perpendicular to the radius (G2.2).</div>
        </div>
      </div>
      {GSD(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> John discovers that rotating a dock layout on paper is just applying a formula to every coordinate. Albert shows that translations, rotations, and reflections are functions on (x,y) — and reveals why rotation uses sin and cos. Chapter 4: <em>Transformations.</em></>)}
    </div>
  );
}
