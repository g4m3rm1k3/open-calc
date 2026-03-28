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

export default function G2_4_SimilarTriangles({ params = {} }) {
  const [scale, setScale] = useState(1.8);
  const ready = useMath();
  const a1 = 5, b1 = 7, c1 = 8;
  const a2 = (a1 * scale).toFixed(2), b2 = (b1 * scale).toFixed(2), c2 = (c1 * scale).toFixed(2);
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {BDG(4)}
      {HK("Mic needs to find the height of the lighthouse without climbing it. He measures its shadow (14m) and his own shadow (1.4m) at the same time. He is 1.8m tall. Albert says two similar triangles will solve it — and shows why similar triangles always have proportional sides.")}
      <div style={P}>
        {H("Story", { background: "#ecfdf5", color: "#065f46" }, "Similar triangles and proportion")}
        <div style={{ ...B, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> stood next to the lighthouse. His shadow was 1.4m, the lighthouse shadow was 14m. <em style={{ color: "var(--color-text-secondary)" }}>"The sun angle is the same for both. So the triangle formed by me, my shadow, and the sun ray is similar to the triangle formed by the lighthouse, its shadow, and the same sun ray."</em></p>
          <p style={{ marginBottom: 0 }}><em style={{ color: "var(--color-text-secondary)" }}>"Lighthouse height / 14m = 1.8m / 1.4m,"</em> <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> said. <em style={{ color: "var(--color-text-secondary)" }}>"So the lighthouse is 18 metres tall. But why do similar triangles have proportional sides? That requires a proof."</em></p>
        </div>
      </div>
      <div style={P}>
        {H("Discovery", { background: "#ecfdf5", color: "#065f46" }, "AA similarity — same angles, proportional sides")}
        <div style={B}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Scale factor</span>
            <input type="range" min={0.5} max={3} value={scale} step={0.1} onChange={e => setScale(parseFloat(e.target.value))} style={{ flex: 1, maxWidth: 200 }} />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 30 }}>×{scale.toFixed(1)}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            {[["Small triangle", a1, b1, c1], ["Large triangle", a2, b2, c2]].map(([label, a, b, c]) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "12px" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 13, color: "var(--color-text-primary)" }}>a = {a}, b = {b}, c = {c}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>Ratio a/b = {(parseFloat(a) / parseFloat(b)).toFixed(3)} ← same for both</div>
              </div>
            ))}
          </div>
          {ready && <div style={MB}><M t={`\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2} = \\frac{1}{${scale.toFixed(1)}} \\quad \\text{(AA similarity)}`} display ready={ready} /></div>}
          {[{ num: 1, label: "Two triangles with same angles are similar (AA criterion)", note: "If two angles of one triangle equal two angles of another, the triangles are similar — the third angle is forced (sum = 180°)." }, { num: 2, label: "Similar triangles have proportional sides", note: "Proof by parallel lines: draw a line parallel to one side of the larger triangle cutting the other two sides. This creates a smaller triangle similar to the original. The parallel line theorem forces the ratio." }, { num: 3, label: "Lighthouse: height/shadow = 1.8m/1.4m", note: "Height = 14 × (1.8/1.4) = 14 × 1.286 = 18m. Same sun angle → same triangle shape → same ratio of height to shadow." }].map((s, i) => (
            <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: "#059669", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{s.num}</span><span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{s.label}</span></div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{s.note}</div>
            </div>
          ))}
          <div style={INS()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Connection:</strong> Similar triangles are why SOH-CAH-TOA works. In Book 2, Ch 2.1, sin θ = opposite/hypotenuse. This ratio is the same in every right triangle with angle θ — because all such triangles are similar. The trig ratio IS the similarity ratio.</div>
        </div>
      </div>
      {SD(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Mic needs to tile the workshop floor. He needs the areas of triangles, parallelograms, and trapezoids. Albert shows that every area formula derives from one rectangle — using a shearing argument. Chapter 5: <em>Area Formulas.</em></>)}
    </div>
  );
}
