import { useState, useEffect, useRef } from "react";
import { 
  useMath, 
  WhyPanel, 
  mkPanel, 
  mkHdr, 
  mkBody, 
  mkInsight, 
  mkBadge, 
  mkHook, 
  mkSeed, 
} from "./GeometryHelpers.jsx";

export default function G1_5_Congruence({ params = {} }) {
  const [criterion, setCriterion] = useState("SSS");
  const ready = useMath();
  const criteria = {
    SSS: { works: true, desc: "Side-Side-Side", why: "Three sides fix the shape uniquely. Given a, b, c, the triangle can only close in one way (up to reflection). Proof: by rigidity — three fixed rods form a unique triangle.", example: "a=5, b=7, c=6 → exactly one triangle." },
    SAS: { works: true, desc: "Side-Angle-Side", why: "Two sides and the included angle between them fix the triangle. The third side and remaining angles are forced by these three values.", example: "a=5, ∠C=60°, b=7 → exactly one triangle." },
    ASA: { works: true, desc: "Angle-Side-Angle", why: "Two angles fix the shape (similar triangles). One included side fixes the scale. Together: unique triangle.", example: "∠A=40°, c=8, ∠B=70° → exactly one triangle." },
    AAS: { works: true, desc: "Angle-Angle-Side", why: "Two angles determine all three angles (sum=180°). A non-included side fixes scale. Equivalent to ASA after one step.", example: "∠A=40°, ∠B=70°, a=5 → unique (similar to ASA)." },
    SSA: { works: false, desc: "Side-Side-Angle (ambiguous!)", why: "Given two sides and a non-included angle, there can be 0, 1, or 2 possible triangles. The angle doesn't 'pin' both sides. This is the ambiguous case.", example: "a=5, b=8, ∠A=30° → could give 0, 1, or 2 triangles." },
    AAA: { works: false, desc: "Angle-Angle-Angle (similarity only!)", why: "Three angles determine the shape but not the size. Any scale of the same triangle satisfies AAA. This gives similarity, not congruence.", example: "40°, 70°, 70° → infinitely many triangles of different sizes." },
  };
  const c = criteria[criterion];
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {mkBadge(5)}
      {mkHook("Mic needs to cut two identical triangular braces for the boat hull. How many measurements does he need to ensure they're identical? Albert says three — but not any three. Two triangles are congruent (identical) only when the right combination of sides and angles match.")}
      <div style={mkPanel}>
        {mkHdr("Story", { background: "#ede9fe", color: "#4f46e5" }, "Congruence")}
        <div style={{ ...mkBody, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> had six measurements for a triangle: three sides and three angles. <em style={{ color: "var(--color-text-secondary)" }}>"I only need to give the factory three of these to guarantee a matching piece?"</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> nodded. <em style={{ color: "var(--color-text-secondary)" }}>"Three — if they're the right three. And two of the six combinations don't work at all. One gives infinitely many non-matching triangles. One gives zero, one, or two possibilities. You need to know which combinations are safe."</em></p>
        </div>
      </div>
      <div style={mkPanel}>
        {mkHdr("Discovery", { background: "#ede9fe", color: "#4f46e5" }, "Which three measurements guarantee congruence?")}
        <div style={mkBody}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {Object.keys(criteria).map(key => (
              <button key={key} onClick={() => setCriterion(key)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", border: `1px solid ${key === criterion ? (criteria[key].works ? "#059669" : "#dc2626") : "var(--color-border-tertiary)"}`, background: key === criterion ? (criteria[key].works ? "#ecfdf5" : "#fef2f2") : "transparent", color: key === criterion ? (criteria[key].works ? "#065f46" : "#991b1b") : "var(--color-text-secondary)" }}>
                {key}
              </button>
            ))}
          </div>
          <div style={{ background: c.works ? "#ecfdf5" : "#fef2f2", border: `1px solid ${c.works ? "#6ee7b7" : "#fca5a5"}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: c.works ? "#065f46" : "#991b1b", marginBottom: 6 }}>{criterion}: {c.desc} — {c.works ? "✓ Guarantees congruence" : "✗ Does NOT guarantee congruence"}</div>
            <p style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.65, marginBottom: 6 }}>{c.why}</p>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic" }}>Example: {c.example}</p>
          </div>
          <div style={mkInsight(c.works ? "#059669" : "#dc2626")}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>The working criteria are SSS, SAS, ASA, AAS.</strong> SSA fails because the angle is not between the two known sides — the triangle can swing to two positions. AAA fails because it gives shape without scale. For Mic's factory order: specify two sides and the included angle (SAS), or all three sides (SSS), and the piece will match exactly.</div>
          <WhyPanel tag="Why does SSS guarantee uniqueness? Prove it." depth={0}>
            <p style={{ marginBottom: 8 }}>Given three side lengths a, b, c: fix side a along a baseline. The second vertex is at distance b from one end — a circle. The third vertex is at distance c from the other end — another circle. Two circles intersect in at most two points (one on each side of the baseline, giving a triangle and its reflection). Both are congruent. So SSS gives a unique triangle up to reflection.</p>
            <p>This is a constructive proof — we showed exactly one triangle can be built, by construction. It also explains why compass-and-straightedge can construct any triangle given SSS: draw the two circles and find the intersection.</p>
          </WhyPanel>
        </div>
      </div>
      {mkSeed(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Albert wants to prove the most famous theorem in mathematics — not just once, but three different ways. Each proof reveals something the others don't. Chapter 6: <em>The Pythagorean Theorem — Three Proofs.</em></>)}
    </div>
  );
}
