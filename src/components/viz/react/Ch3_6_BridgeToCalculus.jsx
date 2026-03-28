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
  mkMbox as mbox,
  StepBlock
} from "../CalculusHelpers.jsx";

export default function Ch3_6_BridgeToCalculus({ params = {} }) {
  const [dx, setDx] = useState(1.0);
  const ready = useMath();
  const x0 = 2;
  const f = x => x * x + 1;
  const slope = (f(x0 + dx) - f(x0)) / dx;
  const trueSlope = 2 * x0;

  const steps = [
    { label: "Start with average rate of change", tex: "\\frac{f(x+h)-f(x)}{h} = \\frac{(x+h)^2+1-(x^2+1)}{h}", note: "This is the slope of the secant line — the line through two points on the curve." },
    { label: "Expand and cancel", tex: "= \\frac{x^2+2xh+h^2+1-x^2-1}{h} = \\frac{2xh+h^2}{h} = 2x+h", note: "The h in the denominator cancels with an h from every term in the numerator. This only works because h ≠ 0 in the limit." },
    { label: "Take the limit as h→0", tex: "f'(x) = \\lim_{h\\to 0}(2x+h) = 2x", note: "As h→0, the h term vanishes. The derivative of x²+1 is 2x — the slope at any point x." },
    { label: "At x = 2 specifically", tex: "f'(2) = 2(2) = 4 \\text{ m/s}", note: "This is the instantaneous speed of John's cart at t=2 seconds. The answer Mic has been seeking since Chapter 3.1." },
  ];

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {badge(3, 6)}
      {hook("Mic has all the tools: limits, continuity, the algebra of 0/0. Now he puts them together. The derivative is the limit of the average rate of change as the interval shrinks to zero. It's the slope of the curve at a single point. And for f(x) = x²+1, it gives the exact answer John wanted in Chapter 3.1.")}
      <div style={panel}>
        {hdr("Story", { background: "#eef2ff", color: "#3730a3" }, "The bridge to calculus")}
        <div style={{ ...body, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> had three pages of notes in front of him. Limits. Continuity. The algebra for removing 0/0. The sine limit. All separate tools. <em style={{ color: "var(--color-text-secondary)" }}>"They all point to the same thing."</em></p>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> looked at the notes. <em style={{ color: "var(--color-text-secondary)" }}>"The derivative."</em></p>
          <p style={{ marginBottom: 12 }}><em style={{ color: "var(--color-text-secondary)" }}>"The instantaneous rate of change. The slope at a single point. The limit of the difference quotient."</em> Mic wrote it on the board. <em style={{ color: "var(--color-text-secondary)" }}>"It's the same operation we've been building toward since Chapter 1.4."</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span> looked at the board. <em style={{ color: "var(--color-text-secondary)" }}>"And this tells me exactly how fast the cart was going at the fence?"</em> <em style={{ color: "var(--color-text-secondary)" }}>"Exactly,"</em> Mic said. <em style={{ color: "var(--color-text-secondary)" }}>"Not approximately. Exactly."</em></p>
        </div>
      </div>
      <div style={panel}>
        {hdr("Discovery", { background: "#eef2ff", color: "#3730a3" }, "The derivative — built from everything in Books 1 through 3")}
        <div style={body}>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: 14 }}>f(x) = x²+1 — John's cart position. Drag h toward 0 and watch the secant slope converge to the tangent slope = 4 at x = 2.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>h (interval)</span>
            <input type="range" min={0.01} max={2} value={dx} step={0.01} onChange={e => setDx(parseFloat(e.target.value))} style={{ flex: 1, maxWidth: 220 }} />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 50 }}>{dx.toFixed(2)}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 12 }}>
            {[["Secant slope", slope.toFixed(4), "#6366f1"], ["True slope f′(2)", trueSlope, "#059669"], ["Error", Math.abs(slope - trueSlope).toFixed(4), "#d97706"]].map(([label, val, col]) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 500, color: col }}>{val}</div>
              </div>
            ))}
          </div>
          {steps.map((s, i) => <StepBlock key={i} num={i + 1} label={s.label} tex={s.tex} note={s.note} ready={ready} col="#6366f1" />)}
          <div style={insight()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>What just happened:</strong> Three books of mathematics converged on a single formula. The slope-as-limit idea (Book 1), the radian/trig prerequisites (Book 2), the limit machinery (Book 3) — all of it was preparation for this moment. In Book 4, we prove every major differentiation rule from this definition.</div>
          <WhyPanel tag="Why do we need all of Books 1–3 to get here?" depth={0}>
            <p style={{ marginBottom: 8 }}>The derivative of sin x requires: the angle addition formula (Book 2, Ch 2.4), the limit lim(sin h)/h = 1 (Book 3, Ch 3.4), and the limit laws (Book 3, Ch 3.2). Without those, the proof is impossible. The derivative of x³ requires the Binomial Theorem (Book 1, Ch 1.5). Every rule in Book 4 has dependencies that reach back through the series.</p>
          </WhyPanel>
        </div>
      </div>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderTop: "2px solid #059669", borderRadius: "0 0 10px 10px", padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
        <strong style={{ fontWeight: 500, color: "#059669" }}>Book 3 complete. Books 1 through 3 complete.</strong> Mic has the definition of the derivative. Albert knows where it comes from. John has finally found out exactly how fast his cart was going. In Book 4, they prove every differentiation rule from scratch — starting with the problem that began the whole series: h(x) = sin(x³).
      </div>
    </div>
  );
}
