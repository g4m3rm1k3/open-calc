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

export default function G4_2_PyramidsCones({ params = {} }) {
  const [r, setR] = useState(4); const [h, setH] = useState(7);
  const ready = useMath();
  const vol = ((1 / 3) * Math.PI * r * r * h).toFixed(2);
  const cylVol = (Math.PI * r * r * h).toFixed(2);
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {FBG(2)}
      {FHK("Mic's uncle needs to know why the cone volume formula has ⅓ in it. John says 'it's just the formula.' Albert says the ⅓ is a geometric fact — provable by splitting a cube into exactly three congruent pyramids, each with the same base and height as the cube.")}
      <div style={FP}>
        {FH("Story", { background: "#fef2f2", color: "#991b1b" }, "Pyramids and cones — the ⅓ factor")}
        <div style={{ ...FB, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span>: <em style={{ color: "var(--color-text-secondary)" }}>"V = (1/3)πr²h. The one-third is just the formula."</em></p>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span>: <em style={{ color: "var(--color-text-secondary)" }}>"The one-third is a theorem. Take a cube. Cut it into three pieces. Each piece is a pyramid with the same base and height as the cube. Since three equal pyramids fill the cube, each is one-third. The factor isn't chosen — it's forced by geometry."</em></p>
        </div>
      </div>
      <div style={FP}>
        {FH("Discovery", { background: "#fef2f2", color: "#991b1b" }, "V = ⅓Bh — proved by dissecting a cube into 3 pyramids")}
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, marginBottom: 12 }}>
            {[["Cylinder V = πr²h", cylVol, "#4f46e5"], ["Cone V = ⅓πr²h", vol, "#dc2626"]].map(([label, val, col]) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: col, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)" }}>{val}</div>
              </div>
            ))}
          </div>
          {ready && <div style={FMB}><M t={`V_{\\text{cone}} = \\tfrac{1}{3}\\pi r^2 h = \\tfrac{1}{3} \\times \\pi \\times ${r}^2 \\times ${h} = ${vol}`} display ready={ready} /></div>}
          {[{ num: 1, label: "Take a cube with side length a", note: "Volume = a³. It can be divided into exactly three congruent square pyramids." }, { num: 2, label: "Each pyramid has base = a², height = a", note: "The three pyramids tile the cube perfectly with no gaps and no overlaps. This is a geometric fact, not an approximation." }, { num: 3, label: "Each pyramid volume = a³/3 = (1/3) × base × height", note: "Since three equal pyramids = one cube (volume a³), each pyramid = a³/3 = (1/3) × a² × a = (1/3)Bh." }, { num: 4, label: "By Cavalieri's principle, this extends to any pyramid or cone", note: "The cross-section shape doesn't matter. Any pyramid with base B and height h has volume (1/3)Bh. A cone is a pyramid with a circular base." }].map((s, i) => (
            <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: "#dc2626", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{s.num}</span><span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{s.label}</span></div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{s.note}</div>
            </div>
          ))}
          <div style={FI()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Connection to integration:</strong> The cone volume can also be derived by integrating circular cross-sections: V = ∫₀ʰ π(r·z/h)² dz = πr²/h² × ∫₀ʰ z² dz = πr²/h² × h³/3 = (1/3)πr²h. The integral of z² from 0 to h gives h³/3 — and that's exactly where the ⅓ comes from analytically. The geometric cube-dissection proof and the calculus proof give the same ⅓ for the same underlying reason.</div>
        </div>
      </div>
      {FSD(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> The hull has a hemispherical bow. Albert recalls that Archimedes found the sphere's volume 2200 years ago using a brilliant comparison with a cylinder and a cone. The proof is a preview of calculus — and Archimedes knew it. Chapter 3: <em>The Sphere.</em></>)}
    </div>
  );
}
