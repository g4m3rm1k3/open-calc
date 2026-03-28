import { useState, useEffect, useRef } from "react";
import { 
  useMath, 
  M,
  WhyPanel, 
  mkPanel as panel, 
  mkHdr as hdr, 
  mkBody as body, 
  mkInsight as insight, 
  mkBadge as badge, 
  mkHook as hook, 
  mkSeed as seed, 
  mkMbox as mbox
} from "../CalculusHelpers.jsx";

export default function Ch3_3_InfiniteStaircase({ params = {} }) {
  const [x, setX] = useState(1.5);
  const ready = useMath();
  const fval = Math.floor(x);
  const limit_exists = !Number.isInteger(x);

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {badge(3, 3)}
      {hook("The harbor has a tide gauge that records only whole numbers — it jumps from 3m to 4m without any value in between. John asks: does the limit exist at the jump? Albert explains continuity — what it means for a function to have no gaps — and why the answer determines whether calculus can even be applied.")}
      <div style={panel}>
        {hdr("Story", { background: "#eef2ff", color: "#3730a3" }, "The infinite staircase")}
        <div style={{ ...body, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}>The tide gauge readout was a staircase: flat at 3 for twenty minutes, then an instantaneous jump to 4. <span style={{ color: "#065f46", fontWeight: 500 }}>John</span> stared at it. <em style={{ color: "var(--color-text-secondary)" }}>"What's the tide height at the exact moment of the jump?"</em></p>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> drew the step function on paper. <em style={{ color: "var(--color-text-secondary)" }}>"That's a discontinuity. The limit from the left is 3. The limit from the right is 4. They disagree — so the limit at that point does not exist."</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> looked up. <em style={{ color: "var(--color-text-secondary)" }}>"And if you can't take the limit, you can't take the derivative. Which means you can't find the rate of change at that point."</em> Albert nodded. <em style={{ color: "var(--color-text-secondary)" }}>"Differentiability requires continuity. Continuity requires the limit to exist. It's a chain of requirements."</em></p>
        </div>
      </div>
      <div style={panel}>
        {hdr("Discovery", { background: "#eef2ff", color: "#3730a3" }, "Continuity — and what breaks it")}
        <div style={body}>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: 12 }}>Drag x through the integers. At non-integer points, the floor function is continuous — the limit exists and equals the function value. At integers, the left and right limits disagree — discontinuity.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>x</span>
            <input type="range" min={0.01} max={4.99} value={x} step={0.01} onChange={e => setX(parseFloat(e.target.value))} style={{ flex: 1, maxWidth: 220 }} />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 40 }}>{x.toFixed(2)}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 12 }}>
            {[["f(x) = ⌊x⌋", fval, "var(--color-text-primary)"], ["lim exists?", limit_exists ? "Yes" : "No", limit_exists ? "#059669" : "#dc2626"], ["Continuous?", limit_exists ? "Yes" : "No (jump)", limit_exists ? "#059669" : "#dc2626"]].map(([label, val, col]) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: col }}>{val}</div>
              </div>
            ))}
          </div>
          {ready && <div style={mbox}><M t={`\\text{Continuity at } x_0:\\quad \\lim_{x\\to x_0}f(x) = f(x_0)`} display ready={ready} /></div>}
          <div style={insight()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Three requirements for continuity at x₀:</strong> (1) f(x₀) must be defined. (2) lim_{"{"}x→x₀{"}"} f(x) must exist. (3) They must be equal. Fail any one: discontinuity. A function is differentiable at x₀ only if it's continuous there — but continuity alone doesn't guarantee differentiability (|x| at x=0).</div>
          <WhyPanel tag="The Intermediate Value Theorem — why it needs continuity" depth={0}>
            <p style={{ marginBottom: 8 }}>IVT: if f is continuous on [a,b] and k is between f(a) and f(b), then f(c) = k for some c in (a,b). A continuous function can't jump over a value. A step function CAN jump over values — which is why IVT fails for discontinuous functions. IVT is used in the proof of the Fundamental Theorem of Calculus.</p>
            <WhyPanel tag="Why does IVT fail for rational numbers (ℚ)?" depth={1}>
              <p>f(x) = x² − 2 is continuous. f(1) = −1, f(2) = 2. By IVT over ℝ: f(c) = 0 for some c in (1,2) — namely c = √2. But √2 is irrational. Over ℚ, √2 doesn't exist, so the IVT fails. This is why calculus requires ℝ (complete) rather than ℚ (incomplete) — completeness guarantees that limits land somewhere.</p>
            </WhyPanel>
          </WhyPanel>
        </div>
      </div>
      {seed(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Mic needs lim(sin x / x) as x→0 to compute the derivative of sine — but plugging in x=0 gives 0/0. Albert says the answer is 1, and proves it with a geometry argument that requires the squeeze theorem. Chapter 4: <em>The Sine of Almost Nothing.</em></>)}
    </div>
  );
}
