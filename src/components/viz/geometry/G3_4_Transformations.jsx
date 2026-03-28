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

export default function G3_4_Transformations({ params = {} }) {
  const [type, setType] = useState("rotation");
  const [angle, setAngle] = useState(45);
  const [tx, setTx] = useState(2); const [ty, setTy] = useState(1);
  const ready = useMath();
  const rad = (angle * Math.PI) / 180;
  const formulas = {
    translation: `(x, y) \\to (x + ${tx},\\; y + ${ty})`,
    rotation: `(x, y) \\to (x\\cos ${angle}° - y\\sin ${angle}°,\\; x\\sin ${angle}° + y\\cos ${angle}°)`,
    reflection: `(x, y) \\to (x,\\; -y) \\text{ (reflect over x-axis)}`,
  };
  const descriptions = {
    translation: "Shift every point by (tx, ty). Preserves shape, size, and orientation. No rotation, no reflection.",
    rotation: "Rotate every point by θ around the origin. Why sin and cos? Because rotation on the unit circle maps (1,0) to (cos θ, sin θ) — and that's the definition of sin and cos.",
    reflection: "Flip every point over an axis. Preserves shape and size but reverses orientation (mirror image).",
  };
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {GBG(4)}
      {GHK("John needs to rotate the dock layout by 30° to align with the new harbour entrance. Albert shows that every geometric transformation is a function on coordinates — and that rotation specifically requires sin and cos, connecting geometry to trigonometry in the most direct way possible.")}
      <div style={GP}>
        {GH("Story", { background: "#ecfeff", color: "#155e75" }, "Transformations")}
        <div style={{ ...GB, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span> rotated the drawing by hand. <em style={{ color: "var(--color-text-secondary)" }}>"Is there a formula? So I can just calculate the new coordinates without redrawing everything?"</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> wrote it on the board. <em style={{ color: "var(--color-text-secondary)" }}>"Every transformation is a function: you put in (x,y), you get out (x′,y′). Translation is addition. Rotation uses sin and cos — because rotation is exactly what the unit circle describes."</em></p>
        </div>
      </div>
      <div style={GP}>
        {GH("Discovery", { background: "#ecfeff", color: "#155e75" }, "Translation, rotation, reflection as coordinate functions")}
        <div style={GB}>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {["translation", "rotation", "reflection"].map(t => (
              <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: "6px 8px", borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)", textTransform: "capitalize", border: `1px solid ${type === t ? "#0891b2" : "var(--color-border-tertiary)"}`, background: type === t ? "#ecfeff" : "transparent", color: type === t ? "#0e7490" : "var(--color-text-secondary)" }}>{t}</button>
            ))}
          </div>
          {type === "translation" && (
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              {[["tx", tx, -5, 5, setTx], ["ty", ty, -5, 5, setTy]].map(([label, val, min, max, setter]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 20 }}>{label}</span>
                  <input type="range" min={min} max={max} value={val} step={1} onChange={e => setter(parseInt(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, minWidth: 20 }}>{val}</span>
                </div>
              ))}
            </div>
          )}
          {type === "rotation" && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Rotation angle</span>
              <input type="range" min={0} max={360} value={angle} step={5} onChange={e => setAngle(parseInt(e.target.value))} style={{ flex: 1, maxWidth: 200 }} />
              <span style={{ fontSize: 13, fontWeight: 500, minWidth: 40 }}>{angle}°</span>
            </div>
          )}
          {ready && <div style={GMB}><M t={formulas[type]} display ready={ready} /></div>}
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#0891b2", marginBottom: 5, textTransform: "capitalize" }}>{type}</div>
            <p style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.65 }}>{descriptions[type]}</p>
          </div>
          <div style={GI()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Why rotation requires sin and cos:</strong> The rotation matrix maps (1,0) to (cos θ, sin θ) and (0,1) to (−sin θ, cos θ). This is exactly the unit circle definition of sin and cos. Rotation IS what sin and cos were invented to describe — not the other way around.</div>
          <WhyPanel tag="What is a matrix and how does it represent a transformation?" depth={0}>
            <p style={{ marginBottom: 8 }}>A 2×2 matrix [a b; c d] transforms (x,y) to (ax+by, cx+dy). The rotation matrix is [cos θ, −sin θ; sin θ, cos θ]. Matrices make it easy to compose transformations: rotate then translate = multiply the matrices then add the translation. This is the foundation of computer graphics — every 3D game renders using matrix transformations applied to coordinates thousands of times per frame.</p>
          </WhyPanel>
        </div>
      </div>
      {GSD(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Albert discovers that the path of a stone thrown from the cliff is a parabola, and that the path of the planets is an ellipse. Both are conic sections — slices of the same cone at different angles. Chapter 5: <em>Conic Sections.</em></>)}
    </div>
  );
}
