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

export default function G4_1_PrismsCylinders({ params = {} }) {
  const [r, setR] = useState(4); const [h, setH] = useState(7);
  const ready = useMath();
  const baseArea = (Math.PI * r * r).toFixed(2);
  const vol = (Math.PI * r * r * h).toFixed(2);
  const sa = (2 * Math.PI * r * r + 2 * Math.PI * r * h).toFixed(2);
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {FBG(1)}
      {FHK("Mic's uncle needs to order the correct amount of fibreglass for a new cylindrical fuel tank. He knows the radius and height, but the volume formula — πr²h — is something he memorised in school without understanding where it comes from. Albert proves it using Cavalieri's principle.")}
      <div style={FP}>
        {FH("Story", { background: "#fef2f2", color: "#991b1b" }, "Prisms and cylinders")}
        <div style={{ ...FB, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><em style={{ color: "var(--color-text-secondary)" }}>"The tank volume formula is πr²h,"</em> Mic's uncle said. <em style={{ color: "var(--color-text-secondary)" }}>"Where does the h come from?"</em></p>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> stacked a pile of coins. <em style={{ color: "var(--color-text-secondary)" }}>"Each coin is a thin circle — base area πr². Stack h coins of thickness 1: total volume = πr² × h. The cylinder is just infinitely many coins stacked up. This is Cavalieri's principle."</em></p>
        </div>
      </div>
      <div style={FP}>
        {FH("Discovery", { background: "#fef2f2", color: "#991b1b" }, "Volume = base area × height — Cavalieri's principle")}
        <div style={FB}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            {[["Radius r", r, 1, 8, setR], ["Height h", h, 1, 12, setH]].map(([label, val, min, max, setter]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 70 }}>{label}</span>
                <input type="range" min={min} max={max} value={val} step={1} onChange={e => setter(parseInt(e.target.value))} style={{ flex: 1 }} />
                <span style={{ fontSize: 13, fontWeight: 500, minWidth: 20 }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 12 }}>
            {[["Base area", "πr² = " + baseArea, "#dc2626"], ["Volume", "πr²h = " + vol, "#4f46e5"], ["Surface area", "2πr²+2πrh = " + sa, "#059669"]].map(([label, val, col]) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: col }}>{val}</div>
              </div>
            ))}
          </div>
          {ready && <div style={FMB}><M t={`V = \\pi r^2 h = \\pi \\times ${r}^2 \\times ${h} = ${vol}`} display ready={ready} /></div>}
          {[{ num: 1, label: "Cavalieri's Principle", note: "If two solids have the same cross-sectional area at every height, they have the same volume. A cylinder and a leaning cylinder (oblique) have the same volume — same circular cross-section at every height." }, { num: 2, label: "Volume of a prism = base area × height", note: "Any prism (triangular, rectangular, hexagonal): V = Bh where B is the base area. The cross-section is always the same shape." }, { num: 3, label: "Surface area of cylinder = two circles + rectangle", note: "Unroll the cylinder: the lateral surface is a rectangle with width = circumference (2πr) and height h. SA = 2πr² + 2πrh." }].map((s, i) => (
            <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: "#dc2626", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{s.num}</span><span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{s.label}</span></div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{s.note}</div>
            </div>
          ))}
          <div style={FI()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Preview of integration:</strong> "Infinitely many thin cross-sections stacked up" is exactly the Riemann integral: V = ∫₀ʰ A(z) dz. For a cylinder, A(z) = πr² (constant), so V = πr²h. Cavalieri's principle IS integration — just stated geometrically instead of analytically.</div>
        </div>
      </div>
      {FSD(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> The hull design includes a conical bow. Mic's uncle asks why the cone volume is ⅓ of the cylinder with the same base and height. The ⅓ is not arbitrary — it can be proved by dissecting a cube into exactly three equal pyramids. Chapter 2: <em>Pyramids and Cones.</em></>)}
    </div>
  );
}
