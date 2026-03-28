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

export default function G3_6_Vectors({ params = {} }) {
  const [ax, setAx] = useState(3); const [ay, setAy] = useState(4);
  const [bx, setBx] = useState(2); const [by, setBy] = useState(-1);
  const ready = useMath();
  const dot = ax * bx + ay * by;
  const magA = Math.hypot(ax, ay).toFixed(3);
  const magB = Math.hypot(bx, by).toFixed(3);
  const angle = (Math.acos(Math.max(-1, Math.min(1, dot / (parseFloat(magA) * parseFloat(magB))))) * 180 / Math.PI).toFixed(1);
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {GBG(6)}
      {GHK("Mic needs to find the net force on a mooring rope from two cables pulling at different angles. Albert introduces vectors as arrows with direction and magnitude, shows how to add them geometrically, and proves that the dot product of two vectors equals zero if and only if they are perpendicular.")}
      <div style={GP}>
        {GH("Story", { background: "#ecfeff", color: "#155e75" }, "Vectors")}
        <div style={{ ...GB, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> had two force vectors and needed to know their combined effect and the angle between them. <em style={{ color: "var(--color-text-secondary)" }}>"Are they pulling in roughly the same direction or opposing each other?"</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> wrote the dot product formula. <em style={{ color: "var(--color-text-secondary)" }}>"The dot product tells you everything about the angle between them. Zero means perpendicular. Positive means acute. Negative means obtuse. One number, three cases."</em></p>
        </div>
      </div>
      <div style={GP}>
        {GH("Discovery", { background: "#ecfeff", color: "#155e75" }, "Dot product — the algebraic measure of angle between vectors")}
        <div style={GB}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {[["ax", ax, -6, 6, setAx], ["ay", ay, -6, 6, setAy], ["bx", bx, -6, 6, setBx], ["by", by, -6, 6, setBy]].map(([label, val, min, max, setter]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 110 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 24 }}>{label}</span>
                <input type="range" min={min} max={max} value={val} step={1} onChange={e => setter(parseInt(e.target.value))} style={{ flex: 1 }} />
                <span style={{ fontSize: 13, fontWeight: 500, minWidth: 20 }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 12 }}>
            {[["a · b", dot, dot === 0 ? "#059669" : dot > 0 ? "#4f46e5" : "#dc2626"], ["|a|", magA, "#0891b2"], ["angle", angle + "°", "#d97706"]].map(([label, val, col]) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 500, color: col }}>{val}</div>
              </div>
            ))}
          </div>
          {ready && <div style={GMB}><M t={`\\mathbf{a} \\cdot \\mathbf{b} = a_x b_x + a_y b_y = ${ax}\\times${bx} + ${ay}\\times${by} = ${dot} \\quad |\\mathbf{a}| = \\sqrt{${ax}^2+${ay}^2} = ${magA}`} display ready={ready} /></div>}
          {[{ num: 1, label: "Dot product definition", note: "a·b = axbx + ayby. This is the algebraic definition — computable from coordinates alone." }, { num: 2, label: "Geometric interpretation: a·b = |a||b|cos θ", note: "Where θ is the angle between the vectors. Proved using the Law of Cosines on the triangle formed by a, b, and a−b." }, { num: 3, label: "Perpendicularity: a·b = 0 ↔ cos θ = 0 ↔ θ = 90°", note: "Perpendicular vectors have zero dot product. This is the vector version of m₁m₂ = −1 for lines. Both are consequences of cos 90° = 0." }].map((s, i) => (
            <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: "#0891b2", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{s.num}</span><span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{s.label}</span></div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{s.note}</div>
            </div>
          ))}
          <div style={GI()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Connection to the Law of Cosines:</strong> The dot product formula a·b = |a||b|cos θ is proved by expanding |a−b|² = |a|²−2a·b+|b|² and comparing with the Law of Cosines c²=a²+b²−2ab·cosC. They're the same formula — one geometric, one algebraic.</div>
        </div>
      </div>
      {GSD(<><strong style={{ fontWeight: 500, color: "#d97706" }}>Book G3 complete.</strong> Coordinates, lines, circles, transformations, conics, vectors — geometry made algebraic. In Book G4, Mic's uncle needs to calculate the volume of a curved boat hull. Flat geometry isn't enough. Three dimensions await.</>)}
    </div>
  );
}
