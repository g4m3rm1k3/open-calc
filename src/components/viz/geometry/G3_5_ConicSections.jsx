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

export default function G3_5_ConicSections({ params = {} }) {
  const [conic, setConic] = useState("parabola");
  const ready = useMath();
  const [a, setA] = useState(1);
  const conics = {
    parabola: { eq: `y = \\frac{1}{${a}}x^2`, desc: "A parabola is every point equidistant from a fixed point (focus) and a fixed line (directrix). This is the shape of a thrown stone's path, a satellite dish, and the cross-section of a flashlight reflector.", connection: "Connects to Ch1.5 (quadratic equations): the equation y = x²/a is a parabola. The vertex is the point closest to both focus and directrix." },
    ellipse: { eq: `\\frac{x^2}{${a+4}} + \\frac{y^2}{${a+1}} = 1`, desc: "An ellipse is every point where the sum of distances to two fixed points (foci) is constant. Planets orbit in ellipses (Kepler's First Law). A circle is a special ellipse with both foci at the same point.", connection: "When a=b, the ellipse is a circle. The sum-of-distances definition explains why planets don't orbit in circles — the two foci are the Sun and an empty point." },
    hyperbola: { eq: `\\frac{x^2}{${a+1}} - \\frac{y^2}{${a}} = 1`, desc: "A hyperbola is every point where the difference of distances to two fixed foci is constant. GPS systems use hyperbolas — the time difference between two signals locates you on a hyperbola.", connection: "Hyperbolas have asymptotes — lines the curve approaches but never touches. The asymptotes are y = ±(b/a)x." },
  };
  const c = conics[conic];
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {GBG(5)}
      {GHK("Albert watches a stone thrown from the harbour wall trace a curved path. He says it's a parabola — a slice of a cone. Mic is skeptical: what does a cone have to do with a thrown stone? Albert shows that all four conic sections are the same family, and each appears naturally in physics and engineering.")}
      <div style={GP}>
        {GH("Story", { background: "#ecfeff", color: "#155e75" }, "Conic sections")}
        <div style={{ ...GB, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><em style={{ color: "var(--color-text-secondary)" }}>"If you slice a cone parallel to the side, you get a parabola,"</em> <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> said. <em style={{ color: "var(--color-text-secondary)" }}>"Tilt the plane and you get an ellipse. Cut perpendicular to the base: a circle. Cut steeper than the side: a hyperbola. Four shapes from one cone."</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span>: <em style={{ color: "var(--color-text-secondary)" }}>"Why does a thrown stone make a cone slice?"</em> Albert: <em style={{ color: "var(--color-text-secondary)" }}>"Because gravity is constant — constant downward acceleration. The resulting path satisfies a quadratic equation. And a quadratic equation in two variables is always a conic section."</em></p>
        </div>
      </div>
      <div style={GP}>
        {GH("Discovery", { background: "#ecfeff", color: "#155e75" }, "Parabola, ellipse, hyperbola — same cone, different cuts")}
        <div style={GB}>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {Object.keys(conics).map(co => (
              <button key={co} onClick={() => setConic(co)} style={{ flex: 1, padding: "6px 8px", borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)", textTransform: "capitalize", border: `1px solid ${conic === co ? "#0891b2" : "var(--color-border-tertiary)"}`, background: conic === co ? "#ecfeff" : "transparent", color: conic === co ? "#0e7490" : "var(--color-text-secondary)" }}>{co}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Parameter a</span>
            <input type="range" min={1} max={6} value={a} step={1} onChange={e => setA(parseInt(e.target.value))} style={{ flex: 1, maxWidth: 200 }} />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 20 }}>{a}</span>
          </div>
          {ready && <div style={GMB}><M t={c.eq} display ready={ready} /></div>}
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
            <p style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.65, marginBottom: 6 }}>{c.desc}</p>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic" }}>{c.connection}</p>
          </div>
          <div style={GI()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Why conic sections appear everywhere:</strong> Any physical system with a constant force (gravity, electromagnetism) and a moving object traces a conic section. The four conics are the complete set of quadratic curves in two dimensions — every equation of degree 2 in x and y is a conic (or degenerates to lines or a point).</div>
        </div>
      </div>
      {GSD(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Mic needs to calculate the direction and magnitude of the force on a dock mooring. Albert introduces vectors — quantities with both magnitude and direction — and proves that the dot product equalling zero is the algebraic condition for perpendicularity. Chapter 6: <em>Vectors.</em></>)}
    </div>
  );
}
