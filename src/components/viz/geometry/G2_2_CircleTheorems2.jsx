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

export default function G2_2_CircleTheorems2({ params = {} }) {
  const [extX, setExtX] = useState(350);
  const ready = useMath();
  const cx = 200, cy = 130, r = 90;
  const dx = extX - cx, dy = 0;
  const dist = Math.hypot(dx, dy);
  const tangentLen = dist > r ? Math.sqrt(dist * dist - r * r).toFixed(2) : "N/A";
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {BDG(2)}
      {HK("Albert needs to draw a line from a point outside the sundial circle that just touches the circle — a tangent. He finds something remarkable: two tangent lines from the same external point are always exactly the same length. He proves it using congruent triangles.")}
      <div style={P}>
        {H("Story", { background: "#ecfdf5", color: "#065f46" }, "Tangents and secants")}
        <div style={{ ...B, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span> measured the two tangent lines from the same point: 14.2 cm and 14.2 cm. <em style={{ color: "var(--color-text-secondary)" }}>"That's suspicious."</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> looked at the diagram. <em style={{ color: "var(--color-text-secondary)" }}>"It's not suspicious. It's a theorem. Two tangents from an external point are always equal. I'll prove it with congruent triangles — using the fact that a tangent is perpendicular to the radius."</em></p>
        </div>
      </div>
      <div style={P}>
        {H("Discovery", { background: "#ecfdf5", color: "#065f46" }, "Two tangents from an external point are equal")}
        <div style={B}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>External point distance</span>
            <input type="range" min={110} max={420} value={extX} step={1} onChange={e => setExtX(parseInt(e.target.value))} style={{ flex: 1, maxWidth: 200 }} />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 80 }}>tangent = {tangentLen}</span>
          </div>
          {[{ num: 1, label: "Tangent is perpendicular to radius at point of tangency", note: "Proved: the shortest distance from the centre to the tangent line is the radius — because the tangent only touches, not crosses. The perpendicular is the shortest path, so the radius must be perpendicular to the tangent." }, { num: 2, label: "Two right triangles: OTA and OTB (O=centre, T=external point)", note: "OT is shared (hypotenuse). OA = OB = r (both radii). ∠OAT = ∠OBT = 90° (tangent perpendicular to radius)." }, { num: 3, label: "By RHS (Right angle, Hypotenuse, Side) congruence: △OTA ≅ △OTB", note: "RHS is a special case of congruence: two right triangles with equal hypotenuse and one equal leg are congruent." }, { num: 4, label: "Therefore TA = TB (corresponding parts of congruent triangles)", note: "QED. The two tangent lengths from any external point are always equal." }].map((s, i) => (
            <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: "#059669", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{s.num}</span><span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{s.label}</span></div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{s.note}</div>
            </div>
          ))}
          <div style={INS()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Connection to calculus:</strong> The tangent-perpendicular-to-radius theorem is the geometric statement of what the implicit differentiation proof (Book 4, Ch 4.3) proved algebraically. dy/dx = −x/y at any point (x,y) on x²+y²=r² — and the perpendicularity of the tangent to the radius is exactly what that formula says.</div>
          <WhyPanel tag="What is the power of a point?" depth={0}>
            <p style={{ marginBottom: 8 }}>For an external point T, the power = (tangent length)² = d²−r² where d is the distance from T to the centre. For any secant through T hitting the circle at points A and B: TA × TB = d²−r² = (power). So the power of a point is constant for all lines through that point — tangents and secants alike.</p>
          </WhyPanel>
        </div>
      </div>
      {SD(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> John wants to bisect a line with only a compass — no ruler allowed. Albert explains compass-and-straightedge constructions: what they can build (anything constructible in finite steps) and what they cannot (trisecting an angle, squaring the circle). Chapter 3: <em>Compass and Straightedge.</em></>)}
    </div>
  );
}
