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

export default function G4_3_Sphere({ params = {} }) {
  const [r, setR] = useState(5);
  const ready = useMath();
  const vol = ((4 / 3) * Math.PI * r * r * r).toFixed(2);
  const sa = (4 * Math.PI * r * r).toFixed(2);
  const cylVol = (Math.PI * r * r * 2 * r).toFixed(2);
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {FBG(3)}
      {FHK("Archimedes (287–212 BC) discovered that a sphere fits inside a cylinder of the same radius and height, and the sphere occupies exactly ⅔ of the cylinder's volume. He was so proud of this result that he asked for a sphere-in-cylinder to be carved on his tombstone. The proof uses cross-sections — the idea that becomes calculus.")}
      <div style={FP}>
        {FH("Story", { background: "#fef2f2", color: "#991b1b" }, "The sphere")}
        <div style={{ ...FB, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> placed a ball inside a cylindrical container. <em style={{ color: "var(--color-text-secondary)" }}>"Archimedes proved the sphere is exactly ⅔ of this cylinder — 2200 years before calculus was invented. He used the same idea Cavalieri would formalize later: compare cross-sections at every height."</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span>: <em style={{ color: "var(--color-text-secondary)" }}>"He derived the formula without integration?"</em> <em style={{ color: "var(--color-text-secondary)" }}>"He invented integration. He just didn't have the notation."</em></p>
        </div>
      </div>
      <div style={FP}>
        {FH("Discovery", { background: "#fef2f2", color: "#991b1b" }, "V = (4/3)πr³, SA = 4πr² — Archimedes' method")}
        <div style={FB}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Radius r</span>
            <input type="range" min={1} max={10} value={r} step={1} onChange={e => setR(parseInt(e.target.value))} style={{ flex: 1, maxWidth: 220 }} />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 20 }}>{r}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 12 }}>
            {[["Sphere V = (4/3)πr³", vol, "#dc2626"], ["Surface 4πr²", sa, "#4f46e5"], ["Cylinder V (r,2r)", cylVol, "#059669"]].map(([label, val, col]) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: col }}>{val}</div>
              </div>
            ))}
          </div>
          {ready && <div style={FMB}><M t={`V_{\\text{sphere}} = \\tfrac{4}{3}\\pi r^3 = \\tfrac{2}{3} V_{\\text{cylinder}} \\quad \\text{(Archimedes' theorem)}`} display ready={ready} /></div>}
          {[{ num: 1, label: "Archimedes compared sphere to cylinder-minus-cone", note: "A sphere of radius r fits inside a cylinder of radius r and height 2r. A double cone (two cones joined at base) also fits inside. Archimedes showed: sphere volume = cylinder − double cone." }, { num: 2, label: "Cylinder − double cone = πr²(2r) − 2×(1/3)πr²r = 2πr³ − (2/3)πr³ = (4/3)πr³", note: "The subtraction gives the sphere volume directly. This is the geometric origin of the 4/3 factor." }, { num: 3, label: "Surface area 4πr² — Archimedes' second result", note: "Archimedes also proved the sphere's surface area equals 4 × (area of great circle) = 4πr². Equivalently: the surface area of a sphere equals the lateral surface area of its enclosing cylinder (2πr × 2r = 4πr²)." }].map((s, i) => (
            <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: "#dc2626", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{s.num}</span><span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{s.label}</span></div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{s.note}</div>
            </div>
          ))}
          <div style={FI()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Archimedes' epitaph:</strong> He asked for a sphere inscribed in a cylinder to be carved on his tomb, with the ratio 2:3. Cicero reported finding this tomb in 75 BC — 137 years after Archimedes' death. The result was that important to him. It's a preview of the Fundamental Theorem of Calculus: integrate πy² over the height to get volume.</div>
          <WhyPanel tag="Why is the surface area 4πr² — where does that come from?" depth={0}>
            <p style={{ marginBottom: 8 }}>Archimedes' method: if you peel a sphere and flatten it, you get 4 great circles worth of area. More precisely: the sphere's surface area equals the lateral surface area of the enclosing cylinder (2πr)(2r) = 4πr². This can be proved by Cavalieri cross-sections: at height z, the sphere's circumference equals the cylinder's circumference — always 2πr.</p>
            <p>The calculus derivation: SA = ∫₋ᵣʳ 2πy·ds where ds = √(1+(dy/dz)²) dz is arc length. After substitution using y² = r²−z², this gives exactly 4πr². The geometric and calculus proofs agree.</p>
          </WhyPanel>
        </div>
      </div>
      {FSD(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Albert reveals the proof behind Archimedes' sphere-cylinder relationship — using cross-sections at every height. This is Cavalieri's principle in 3D, and it shows exactly how calculus (as integration) extends geometry. Chapter 4: <em>Cross-Sections and Cavalieri's Principle.</em></>)}
    </div>
  );
}
