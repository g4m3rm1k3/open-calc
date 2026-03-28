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

export default function G2_5_AreaFormulas({ params = {} }) {
  const [shape, setShape] = useState("triangle");
  const [base, setBase] = useState(8);
  const [height, setHeight] = useState(5);
  const [top, setTop] = useState(4);
  const ready = useMath();
  const areas = { triangle: base * height / 2, parallelogram: base * height, trapezoid: (base + top) / 2 * height };
  const formulas = { triangle: `\\frac{1}{2} \\times ${base} \\times ${height} = ${areas.triangle}`, parallelogram: `${base} \\times ${height} = ${areas.parallelogram}`, trapezoid: `\\frac{(${base}+${top})}{2} \\times ${height} = ${areas.trapezoid.toFixed(1)}` };
  const derivations = {
    triangle: "A triangle is half a parallelogram. Copy the triangle, flip it, attach it to the original — you get a parallelogram. Area = ½ × base × height.",
    parallelogram: "Shear the parallelogram: slide the top edge sideways while keeping base and height fixed. Area doesn't change. Eventually the top aligns with the base — making a rectangle. Area = base × height.",
    trapezoid: "Duplicate the trapezoid, flip, attach — making a parallelogram with base (b₁+b₂) and height h. Trapezoid area = ½ × (b₁+b₂) × h."
  };
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {BDG(5)}
      {HK("Mic is calculating how much floor tile he needs for different shaped sections of the workshop. Every shape has a formula — but Albert insists they derive each one from the rectangle. No formula should be memorised without knowing where it comes from.")}
      <div style={P}>
        {H("Story", { background: "#ecfdf5", color: "#065f46" }, "Area formulas")}
        <div style={{ ...B, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> rattled off the formulas: <em style={{ color: "var(--color-text-secondary)" }}>"Triangle: half base times height. Parallelogram: base times height. Trapezoid: average of parallel sides times height."</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> stopped him. <em style={{ color: "var(--color-text-secondary)" }}>"Where do they come from?"</em> Mic stared. <em style={{ color: "var(--color-text-secondary)" }}>"They're formulas."</em> <em style={{ color: "var(--color-text-secondary)" }}>"They're theorems. Each one is derived from the rectangle. If you know the derivation, you'll never forget the formula — and you'll understand why they work."</em></p>
        </div>
      </div>
      <div style={P}>
        {H("Discovery", { background: "#ecfdf5", color: "#065f46" }, "Every area formula comes from the rectangle")}
        <div style={B}>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {["triangle", "parallelogram", "trapezoid"].map(s => (
              <button key={s} onClick={() => setShape(s)} style={{ flex: 1, padding: "6px 8px", borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)", textTransform: "capitalize", border: `1px solid ${shape === s ? "#059669" : "var(--color-border-tertiary)"}`, background: shape === s ? "#ecfdf5" : "transparent", color: shape === s ? "#065f46" : "var(--color-text-secondary)" }}>{s}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            {[["Base", base, 2, 14, setBase], ["Height", height, 1, 10, setHeight], ...(shape === "trapezoid" ? [["Top", top, 1, 12, setTop]] : [])].map(([label, val, min, max, setter]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 140 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 44 }}>{label}</span>
                <input type="range" min={min} max={max} value={val} step={1} onChange={e => setter(parseInt(e.target.value))} style={{ flex: 1 }} />
                <span style={{ fontSize: 13, fontWeight: 500, minWidth: 20 }}>{val}</span>
              </div>
            ))}
          </div>
          {ready && <div style={MB}><M t={`\\text{Area} = ${formulas[shape]}`} display ready={ready} /></div>}
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#059669", marginBottom: 5, textTransform: "capitalize" }}>{shape} — derived from rectangle</div>
            <p style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.65 }}>{derivations[shape]}</p>
          </div>
          <div style={INS()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Cavalieri's principle (preview):</strong> Same base, same height, same area — regardless of how the shape leans. This principle extends to 3D in Book G4, where it proves that a cylinder and a stack of coins have the same volume even when leaning sideways.</div>
        </div>
      </div>
      {SD(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Albert wants to mark out the exact positions of the hour lines on his sundial. He needs arc lengths and sector areas — and discovers that these formulas only work cleanly in radians. This is the geometric proof of why the Book 2 calculus needed radians. Chapter 6: <em>Arc Length, Sector Area, and π.</em></>)}
    </div>
  );
}
