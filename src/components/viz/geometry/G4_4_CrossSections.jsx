import { useState, useEffect, useRef } from "react";
import { 
  useMath, 
  M,
  WhyPanel, 
  mkPanel as FP, 
  mkHdr as FH, 
  mkBody as FB, 
  mkInsight as FI, 
  mkBadge as FBG, 
  mkHook as FHK, 
  mkSeed as FSD, 
  mkMbox as FMB
} from "./GeometryHelpers.jsx";

export default function G4_4_CrossSections({ params = {} }) {
  const [z, setZ] = useState(2); const [r, setR] = useState(5);
  const ready = useMath();
  const sphereR2 = r * r - z * z;
  const sphereA = (Math.PI * sphereR2).toFixed(2);
  const cylA = (Math.PI * r * r).toFixed(2);
  const coneR = z;
  const annulusA = (Math.PI * r * r - Math.PI * coneR * coneR).toFixed(2);
  const match = Math.abs(parseFloat(sphereA) - parseFloat(annulusA)) < 0.01;
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {FBG(4)}
      {FHK("Albert proves Archimedes' sphere-cylinder result using cross-sections. At every height z, the cross-sectional area of the sphere equals the cross-sectional area of the cylinder minus the cone. Since the cross-sections match everywhere, the volumes match — and this is exactly what integration does.")}
      <div style={FP}>
        {FH("Story", { background: "#fef2f2", color: "#991b1b" }, "Cross-sections and Cavalieri's principle")}
        <div style={{ ...FB, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> sliced through all three solids — sphere, cylinder, cone — at the same height. <em style={{ color: "var(--color-text-secondary)" }}>"Look at the cross-sections. The sphere's disc has area πr²−πz². The cylinder's annulus (ring) minus the cone's disc also gives πr²−πz². They're identical at every height."</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span>: <em style={{ color: "var(--color-text-secondary)" }}>"So by Cavalieri, sphere volume = cylinder volume minus cone volume."</em> <em style={{ color: "var(--color-text-secondary)" }}>"Exactly. Archimedes knew this 2200 years ago. We're calling it Cavalieri's principle. He called it 'the method of exhaustion.' We call it integration."</em></p>
        </div>
      </div>
      <div style={FP}>
        {FH("Discovery", { background: "#fef2f2", color: "#991b1b" }, "At every height z: sphere cross-section = cylinder − cone")}
        <div style={FB}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            {[["Radius r", r, 2, 8, setR], ["Height z", z, 0, r - 1, setZ]].map(([label, val, min, max, setter]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 70 }}>{label}</span>
                <input type="range" min={min} max={max} value={val} step={1} onChange={e => setter(parseInt(e.target.value))} style={{ flex: 1 }} />
                <span style={{ fontSize: 13, fontWeight: 500, minWidth: 20 }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 12 }}>
            {[["Sphere at z", `π(r²−z²) = ${sphereA}`, "#dc2626"], ["Cyl − cone at z", `πr²−πz² = ${annulusA}`, "#4f46e5"], ["Equal?", match ? "Yes ✓" : "No ✗", match ? "#059669" : "#dc2626"]].map(([label, val, col]) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: col }}>{val}</div>
              </div>
            ))}
          </div>
          {ready && <div style={FMB}><M t={`\\text{Sphere at }z:\\; \\pi(r^2-z^2) \\quad\\text{Cylinder at }z:\\; \\pi r^2 \\quad\\text{Cone at }z:\\; \\pi z^2 \\quad \\Rightarrow\\pi(r^2-z^2) = \\pi r^2 - \\pi z^2 \\checkmark`} display ready={ready} /></div>}
          {[{ num: 1, label: "Sphere cross-section at height z", note: "Sphere: x²+y²+z²=r². At height z, cross-section is x²+y²=r²−z². This is a circle of radius √(r²−z²), area π(r²−z²)." }, { num: 2, label: "Cylinder cross-section at height z", note: "Always the same: a disc of radius r, area πr²." }, { num: 3, label: "Cone cross-section at height z", note: "A cone with apex at bottom, base radius r at height r: at height z, cone radius = z. Area = πz²." }, { num: 4, label: "Cylinder − cone = πr² − πz² = π(r²−z²) = sphere ✓", note: "Equal at every height z from 0 to r. By Cavalieri's principle: volume of sphere = volume of cylinder − volume of cone = πr²(r) − (1/3)πr²r = (2/3)πr³. Full sphere = (4/3)πr³." }].map((s, i) => (
            <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: "#dc2626", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{s.num}</span><span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{s.label}</span></div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{s.note}</div>
            </div>
          ))}
          <div style={FI()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>This IS integration:</strong> V = ∫₀ʳ A(z) dz where A(z) = π(r²−z²). Computing this integral: π[r²z − z³/3]₀ʳ = π(r³ − r³/3) = (2/3)πr³. Double for full sphere: (4/3)πr³. Archimedes' method of exhaustion and Riemann's integral are the same idea — one stated geometrically, one analytically. The Fundamental Theorem of Calculus (Book 5, Ch 5.2) is what connects them.</div>
        </div>
      </div>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderTop: "2px solid #059669", borderRadius: "0 0 10px 10px", padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
        <strong style={{ fontWeight: 500, color: "#059669" }}>Geometry complete — all four books.</strong> From Euclid's five postulates to Archimedes' sphere, from similar triangles to vectors, from circle theorems to the preview of integration. Every formula in these chapters has a proof. Every proof connects to something above it or below it. The hull is designed, the sundial is built, the dock is planned — and Mic, Albert, and John now understand the geometry underneath every structure they'll ever build.
      </div>
    </div>
  );
}
