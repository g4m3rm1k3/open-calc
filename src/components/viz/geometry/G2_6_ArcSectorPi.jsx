import { useState, useEffect, useRef } from "react";
import { 
  useMath, 
  M,
  WhyPanel, 
  mkPanel as P, 
  mkHdr as H, 
  mkBody as B, 
  mkInsight as INS, 
  mkBadge as BDG, 
  mkHook as HK, 
  mkSeed as SD, 
  mkMbox as MB
} from "./GeometryHelpers.jsx";

export default function G2_6_ArcSectorPi({ params = {} }) {
  const [angleDeg, setAngleDeg] = useState(120);
  const [r, setR] = useState(8);
  const ready = useMath();
  const rad = (angleDeg * Math.PI) / 180;
  const arcLen = (r * rad).toFixed(3);
  const sector = (0.5 * r * r * rad).toFixed(3);
  const arcDeg = ((angleDeg / 360) * 2 * Math.PI * r).toFixed(3);
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {BDG(6)}
      {HK("Albert is marking the hour lines on his sundial. He needs to divide the circle arc into 12 equal parts. The formula for arc length looks different depending on whether you use degrees or radians — and one formula is much cleaner than the other. This is the geometric reason why all of calculus uses radians.")}
      <div style={P}>
        {H("Story", { background: "#ecfdf5", color: "#065f46" }, "Arc length, sector area, and π")}
        <div style={{ ...B, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><em style={{ color: "var(--color-text-secondary)" }}>"In degrees, arc length = (θ/360) × 2πr,"</em> <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> said. <em style={{ color: "var(--color-text-secondary)" }}>"In radians, arc length = rθ. Look at those two formulas."</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span> looked. <em style={{ color: "var(--color-text-secondary)" }}>"The radian one is shorter."</em> <em style={{ color: "var(--color-text-secondary)" }}>"It's not just shorter. It's the definition. One radian IS the angle where arc = radius. So arc = r × (number of radii that fit in the arc). That's what rθ means — it's built into the unit. Degrees are arbitrary. Radians are the geometry."</em></p>
        </div>
      </div>
      <div style={P}>
        {H("Discovery", { background: "#ecfdf5", color: "#065f46" }, "Arc = rθ, Sector = ½r²θ — and why radians make them clean")}
        <div style={B}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            {[["Angle (°)", angleDeg, 5, 355, 5, setAngleDeg], ["Radius r", r, 1, 15, 1, setR]].map(([label, val, min, max, step, setter]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 160 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 80 }}>{label}</span>
                <input type="range" min={min} max={max} value={val} step={step} onChange={e => setter(parseInt(e.target.value))} style={{ flex: 1 }} />
                <span style={{ fontSize: 13, fontWeight: 500, minWidth: 28 }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[["In degrees", `(${angleDeg}/360) × 2π×${r}`, arcDeg, `(${angleDeg}/360) × π×${r}²`, ((angleDeg / 360) * Math.PI * r * r).toFixed(3)], ["In radians", `${r} × ${rad.toFixed(3)}`, arcLen, `½ × ${r}² × ${rad.toFixed(3)}`, sector]].map(([label, arcF, arcV, secF, secV]) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "12px" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 6, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>Arc = {arcF} = {arcV}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Sector = {secF} = {secV}</div>
              </div>
            ))}
          </div>
          {ready && <div style={MB}><M t={`\\text{Arc} = r\\theta \\quad \\text{Sector} = \\tfrac{1}{2}r^2\\theta \\quad (\\theta \\text{ in radians})`} display ready={ready} /></div>}
          <div style={INS()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Why π is irrational (sketch):</strong> π = C/d for any circle. If π = p/q (rational), then the circumference of a unit circle = 2p/q — a rational number. But the Lindemann-Weierstrass theorem (1882) proves π is transcendental (not the root of any polynomial with rational coefficients) — which implies it's irrational. The proof uses complex analysis. The consequence: a circle's circumference can never be exactly expressed as a ratio of integers.</div>
          <WhyPanel tag="The sector area formula comes from the same triangle argument as πr²" depth={0}>
            <p style={{ marginBottom: 8 }}>A sector is a fraction θ/(2π) of the full circle. Full circle area = πr². Sector = (θ/2π) × πr² = ½r²θ. Alternatively: the sector can be filled with thin triangles (like in Chapter 1 of Book 1 — the slice argument for πr²). Each thin triangle has base = r dθ and height ≈ r, area = ½r²dθ. Integrating from 0 to θ: total = ½r²θ. This is the calculus derivation — and it requires radians.</p>
          </WhyPanel>
        </div>
      </div>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderTop: "2px solid #0891b2", borderRadius: "0 0 10px 10px", padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
        <strong style={{ fontWeight: 500, color: "#0891b2" }}>Book G2 complete.</strong> Circles, tangents, constructions, similarity, area, arc length — all proved from the postulates. In Book G3, Mic applies coordinates to geometry, and Albert shows that every geometric object has an algebraic equation — and every equation has a geometric shape.
      </div>
    </div>
  );
}
