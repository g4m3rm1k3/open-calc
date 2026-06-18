/**
 * RelatedRatesProof.jsx
 * src/components/viz/react/RelatedRatesProof.jsx
 *
 * Problem: A 10m ladder leans against a wall. The base slides out at 2 m/s.
 * How fast is the top sliding down when the base is 6m from the wall?
 * Answer: dy/dt = −3/2 m/s
 * Dependency chain: Pythagorean theorem → implicit differentiation → chain rule → algebra
 */

import { useState, useEffect, useRef } from "react";

function useMath() {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.katex);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(link);
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready;
}

function M({ t, display = false, ready }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ready || !ref.current || !window.katex || !t) return;
    try { window.katex.render(t, ref.current, { throwOnError: false, displayMode: display }); }
    catch (_) { if (ref.current) ref.current.textContent = t; }
  }, [t, display, ready]);
  if (!t) return null;
  return <span ref={ref} style={{ display: display ? "block" : "inline" }} />;
}

const DEPTHS = [
  { border: "#6366f1", tagBg: "#eef2ff", tagText: "#4338ca", panelBg: "var(--color-background-secondary)" },
  { border: "#0891b2", tagBg: "#ecfeff", tagText: "#0e7490", panelBg: "var(--color-background-primary)" },
  { border: "#059669", tagBg: "#ecfdf5", tagText: "#047857", panelBg: "var(--color-background-secondary)" },
  { border: "#d97706", tagBg: "#fffbeb", tagText: "#b45309", panelBg: "var(--color-background-primary)" },
  { border: "#9ca3af", tagBg: "#f9fafb", tagText: "#6b7280", panelBg: "var(--color-background-secondary)" },
];
const DLABELS = ["Why?", "But why?", "Prove it", "From scratch", "Axioms"];

function WhyPanel({ why, depth = 0, ready }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
  const d = DEPTHS[Math.min(depth, DEPTHS.length - 1)];
  return (
    <div style={{ marginLeft: depth * 14, marginTop: 10 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: open ? d.tagBg : "transparent", border: `1px solid ${d.border}`, borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 500, color: d.border, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
        <span style={{ width: 15, height: 15, borderRadius: "50%", background: d.border, color: "#fff", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{open ? "−" : "?"}</span>
        {open ? "Close" : (why.tag || DLABELS[Math.min(depth, DLABELS.length - 1)])}
      </button>
      {open && (
        <div style={{ marginTop: 8, padding: "14px 16px", background: d.panelBg, border: `0.5px solid ${d.border}22`, borderLeft: `3px solid ${d.border}`, borderRadius: "0 8px 8px 0", animation: "slideDown .18s ease-out" }}>
          <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, marginBottom: 10, background: d.tagBg, color: d.tagText, border: `0.5px solid ${d.border}44` }}>{why.tag || DLABELS[Math.min(depth, DLABELS.length - 1)]}</span>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-text-primary)", marginBottom: why.math || why.steps ? 12 : 0 }}>{why.explanation}</p>
          {why.math && <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "12px 16px", textAlign: "center", overflowX: "auto", marginBottom: 8 }}><M t={why.math} display ready={ready} /></div>}
          {why.steps && <div style={{ marginTop: 10 }}>{why.steps.map((st, i) => (<div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}><div style={{ minWidth: 22, height: 22, borderRadius: "50%", background: d.border, color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div><div><p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--color-text-primary)", marginBottom: st.math ? 5 : 0 }}>{st.text}</p>{st.math && <div style={{ background: "var(--color-background-secondary)", borderRadius: 6, padding: "8px 12px", textAlign: "center", overflowX: "auto", marginTop: 4 }}><M t={st.math} display ready={ready} /></div>}</div></div>))}</div>}
          {why.why && <WhyPanel why={why.why} depth={depth + 1} ready={ready} />}
        </div>
      )}
    </div>
  );
}

const PROOF = {
  title: "Related Rates: The Sliding Ladder",
  subtitle: "How fast is the top falling when the base is 6m from the wall?",
  problem: "x^2 + y^2 = 100,\\quad \\frac{dx}{dt} = 2 \\text{ m/s},\\quad x = 6 \\implies \\frac{dy}{dt} = -\\tfrac{3}{2} \\text{ m/s}",
  preamble: "A 10m ladder leans against a vertical wall. The base slides outward at 2 m/s. Every variable — x, y — is a function of time t. We differentiate the geometric relationship with respect to t, not x. This is the Chain Rule applied to a real-world constraint.",
  steps: [
    {
      id: 1, tag: "Geometry",
      tc: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
      instruction: "Draw the situation. Label x = distance of base from wall, y = height of top on wall, ladder length = 10m.",
      math: "x(t)^2 + y(t)^2 = 10^2 = 100",
      note: "Both x and y are functions of time t. As t increases, x increases (base slides out) and y decreases (top slides down). The ladder length stays 100 — that's the constraint.",
      why: {
        tag: "Why is x² + y² = 100?",
        explanation: "The Pythagorean Theorem: in a right triangle, a² + b² = c² where c is the hypotenuse. The wall is vertical, the floor is horizontal — they meet at 90°. The ladder is the hypotenuse. So x² + y² = 10² = 100 at every instant.",
        why: {
          tag: "Prove the Pythagorean Theorem",
          explanation: "Classic proof by rearrangement: take a right triangle with legs a, b and hypotenuse c. Arrange four copies of this triangle inside a square of side (a+b). The four triangles have total area 2ab. The square has area (a+b)². The remaining region is a square of side c, with area c². So (a+b)² − 2ab = c², which gives a² + 2ab + b² − 2ab = c², so a² + b² = c².",
          why: null,
        },
      },
    },
    {
      id: 2, tag: "Key Insight",
      tc: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
      instruction: "Both x and y are functions of time t. We differentiate both sides of x² + y² = 100 with respect to t — not with respect to x.",
      math: "\\frac{d}{dt}\\left[x(t)^2 + y(t)^2\\right] = \\frac{d}{dt}[100]",
      note: "This is the key conceptual move. We're not asking 'how does y change with x?' We're asking 'how do x and y each change with time?' Both get differentiated with respect to t.",
      why: {
        tag: "Why differentiate with respect to t?",
        explanation: "The problem gives us a rate with respect to time: dx/dt = 2 m/s. The question asks for a rate with respect to time: dy/dt = ? Differentiating with respect to t converts the geometric equation (about positions) into a rate equation (about speeds).",
        steps: [
          { text: "The equation x² + y² = 100 tells us where things are at any moment." },
          { text: "Differentiating with respect to t tells us how fast things are changing." },
          { text: "Think of t as a dial. As you turn t, x and y both move. Differentiation with respect to t captures the speeds of those movements." },
        ],
        why: {
          tag: "What's the difference between d/dx and d/dt?",
          explanation: "d/dx means 'rate of change with respect to x.' d/dt means 'rate of change with respect to time t.' They're the same operation — derivative — applied to different independent variables. In this problem, t is the fundamental variable (time is passing), and x and y are both functions of t.",
          why: null,
        },
      },
    },
    {
      id: 3, tag: "Differentiate",
      tc: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
      instruction: "Apply d/dt to both sides. Each term requires the Chain Rule because x and y are functions of t.",
      math: "2x\\,\\frac{dx}{dt} + 2y\\,\\frac{dy}{dt} = 0",
      note: "d/dt[x²] = 2x·(dx/dt) by the Chain Rule. d/dt[y²] = 2y·(dy/dt) by the Chain Rule. d/dt[100] = 0 because 100 is constant.",
      why: {
        tag: "Why does d/dt[x²] = 2x·(dx/dt)?",
        explanation: "x is a function of t. So x² is a composite function: the outer function is u², the inner function is u = x(t). Chain Rule: d/dt[u²] = 2u · du/dt = 2x · dx/dt. This is identical to what we saw with y in implicit differentiation — whenever you differentiate a variable with respect to a different variable, the Chain Rule brings in the derivative of the inner function.",
        steps: [
          { text: "Let u = x(t). Then x² = u². Chain Rule: d/dt[u²] = 2u · du/dt." },
          { text: "Substituting back: 2x · dx/dt." },
          { text: "Same logic for y²: d/dt[y²] = 2y · dy/dt." },
          { text: "d/dt[100] = 0 because constants don't change with time." },
        ],
        why: {
          tag: "Numerical check: if x = 3sin(t), what is d/dt[x²]?",
          explanation: "x = 3sin(t), so x² = 9sin²(t). d/dt[9sin²(t)] = 9·2sin(t)·cos(t) = 18sin(t)cos(t). Using the formula: 2x·dx/dt = 2(3sin t)(3cos t) = 18sin(t)cos(t). ✓ They match.",
          math: "x = 3\\sin t \\implies x^2 = 9\\sin^2 t \\implies \\frac{d}{dt}[x^2] = 18\\sin t\\cos t = 2x\\frac{dx}{dt} \\checkmark",
          why: null,
        },
      },
    },
    {
      id: 4, tag: "Substitute Known Values",
      tc: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
      instruction: "Plug in: x = 6, dx/dt = 2. Find y using the constraint x² + y² = 100.",
      math: "x = 6: \\quad 36 + y^2 = 100 \\implies y = 8 \\qquad \\text{(ladder is 10m, base 6m out, top is 8m up)}",
      note: "We chose y = +8 because y represents a height — it's positive. The negative root y = −8 would mean the top of the ladder is underground, which is physically impossible.",
      why: {
        tag: "How do we find y = 8? Show the algebra.",
        explanation: "Substitute x = 6 into the Pythagorean constraint: 6² + y² = 100. Solve for y.",
        steps: [
          { text: "6² + y² = 100", math: "36 + y^2 = 100" },
          { text: "Subtract 36 from both sides:", math: "y^2 = 64" },
          { text: "Take the positive square root (y is a height, so y > 0):", math: "y = \\sqrt{64} = 8" },
        ],
        why: {
          tag: "Why take only the positive root?",
          explanation: "The equation y² = 64 has two solutions: y = 8 and y = −8. In this physical context, y represents the height of the top of the ladder above the floor. Height must be non-negative. The negative root is a valid algebraic solution but has no physical meaning here. Always check that your solution makes sense in the context of the problem.",
          why: null,
        },
      },
    },
    {
      id: 5, tag: "Algebra: Solve for dy/dt",
      tc: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
      instruction: "Substitute x = 6, y = 8, dx/dt = 2 into the differentiated equation. Solve for dy/dt.",
      math: "2(6)(2) + 2(8)\\,\\frac{dy}{dt} = 0 \\implies 24 + 16\\,\\frac{dy}{dt} = 0 \\implies \\frac{dy}{dt} = -\\frac{24}{16} = -\\frac{3}{2}",
      note: "The answer is −3/2 m/s. The negative sign means y is decreasing — the top is sliding DOWN. This makes physical sense: as the base slides out, the top must slide down.",
      why: {
        tag: "Show the algebra step by step.",
        explanation: "Substitute the known values and isolate dy/dt.",
        steps: [
          { text: "Start with: 2x·(dx/dt) + 2y·(dy/dt) = 0" },
          { text: "Substitute x=6, dx/dt=2, y=8:", math: "2(6)(2) + 2(8)\\frac{dy}{dt} = 0" },
          { text: "Simplify:", math: "24 + 16\\frac{dy}{dt} = 0" },
          { text: "Subtract 24 from both sides:", math: "16\\frac{dy}{dt} = -24" },
          { text: "Divide both sides by 16:", math: "\\frac{dy}{dt} = -\\frac{24}{16} = -\\frac{3}{2}" },
        ],
        why: {
          tag: "Why does the negative sign appear?",
          explanation: "The equation 2x·(dx/dt) + 2y·(dy/dt) = 0 came from differentiating a constant (100). Differentiating a constant gives zero — so the sum of the rates must equal zero. This means if one rate is positive (dx/dt = +2, base moving out), the other must be negative (dy/dt < 0, top moving down). The constraint forces one rate to counteract the other.",
          why: null,
        },
      },
    },
    {
      id: 6, tag: "Sanity Check",
      tc: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
      instruction: "Check the answer makes sense. The base moves at 2 m/s outward. The top moves at 3/2 m/s downward. Are these comparable?",
      math: "\\frac{|dy/dt|}{|dx/dt|} = \\frac{3/2}{2} = \\frac{3}{4} < 1 \\quad \\text{top moves slower than base — correct for } x < y",
      note: "When the base (x = 6) is shorter than the height (y = 8), the top moves slower than the base. When x = y (the ladder at 45°), they move equally fast. When the base is almost at full length (top near the floor), the top moves infinitely fast — a dangerous singularity.",
      why: {
        tag: "Why does the top speed up as the ladder falls more horizontal?",
        explanation: "From the equation: dy/dt = −(x/y)·(dx/dt). As x increases toward 10 and y decreases toward 0, the ratio x/y grows without bound. When y is near zero, even a small dx/dt produces a huge dy/dt. This is the mathematical explanation for why the top of a falling ladder accelerates.",
        math: "\\frac{dy}{dt} = -\\frac{x}{y}\\cdot\\frac{dx}{dt} \\to -\\infty \\text{ as } y \\to 0",
        why: {
          tag: "What happens at y = 0 mathematically?",
          explanation: "At y = 0, the formula gives dy/dt = −(x/0)·(dx/dt) = −∞. The model breaks down — the ladder is flat on the floor and the top is no longer constrained to the wall. In the real world, the ladder separates from the wall before y reaches 0. The mathematical singularity signals the physical breakdown of our model.",
          why: null,
        },
      },
    },
    {
      id: 7, tag: "Conclusion",
      tc: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
      instruction: "The top of the ladder slides down at 3/2 m/s when the base is 6m from the wall.",
      math: "\\frac{dy}{dt}\\bigg|_{x=6} = -\\frac{3}{2} \\text{ m/s}",
      note: "The general formula dy/dt = −(x/y)·(dx/dt) comes from differentiating the constraint. It tells us the speed of y in terms of the positions x, y and the speed of x at any instant.",
      why: {
        tag: "Full dependency chain of this proof",
        explanation: "The complete reasoning structure:",
        steps: [
          { text: "dy/dt = −3/2 m/s  ← the answer" },
          { text: "↳ Pythagorean Theorem (geometry of the right triangle)" },
          { text: "↳ Implicit differentiation with respect to t" },
          { text: "↳ Chain Rule (d/dt[x²] = 2x·dx/dt)" },
          { text: "↳ Chain Rule proved from the limit definition" },
          { text: "↳ Differentiating both sides (equality preservation)" },
          { text: "↳ Algebraic isolation of dy/dt (field axioms)" },
          { text: "↳ Physical interpretation of the sign (dy/dt < 0 means decreasing)" },
        ],
        why: null,
      },
    },
  ],
};

function ProofStep({ step, idx, total, ready }) {
  const tc = step.tc;
  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-text-primary)", color: "var(--color-background-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{idx + 1}</div>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, background: tc.bg, color: tc.text, border: `0.5px solid ${tc.border}` }}>{step.tag}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-text-tertiary)" }}>{idx + 1} of {total}</span>
      </div>
      <div style={{ padding: "18px 20px 0" }}>
        <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.55, color: "var(--color-text-primary)", marginBottom: 16 }}>{step.instruction}</p>
        <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "20px 16px", textAlign: "center", overflowX: "auto", fontSize: 18, marginBottom: 12 }}>
          <M t={step.math} display ready={ready} />
        </div>
        {step.note && <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, fontStyle: "italic", paddingLeft: 12, borderLeft: "2px solid var(--color-border-secondary)", marginBottom: 10 }}>{step.note}</p>}
        <div style={{ paddingBottom: 18 }}><WhyPanel why={step.why} depth={0} ready={ready} /></div>
      </div>
    </div>
  );
}

export default function RelatedRatesProof({ params = {} }) {
  const [step, setStep] = useState(0);
  const ready = useMath();
  const steps = PROOF.steps;
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "18px 22px", marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--color-text-tertiary)", marginBottom: 4 }}>Proof · Related Rates</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 4 }}>{PROOF.title}</div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 14 }}>{PROOF.subtitle}</div>
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "14px 16px", textAlign: "center", overflowX: "auto", marginBottom: 12 }}><M t={PROOF.problem} display ready={ready} /></div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>{PROOF.preamble}</p>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {steps.map((_, i) => (<div key={i} onClick={() => setStep(i)} style={{ flex: 1, height: 5, borderRadius: 3, cursor: "pointer", background: i < step ? "var(--color-text-tertiary)" : i === step ? "var(--color-text-primary)" : "var(--color-border-tertiary)", transform: i === step ? "scaleY(1.4)" : "scaleY(1)", transition: "background .2s" }} />))}
      </div>
      <div style={{ marginBottom: 16 }}><ProofStep key={steps[step].id} step={steps[step]} idx={step} total={steps.length} ready={ready} /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ flex: 1 }}>← Previous step</button>
        <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", minWidth: 72, textAlign: "center" }}>Step {step + 1} / {steps.length}</span>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1} style={{ flex: 1 }}>Next step →</button>
      </div>
    </div>
  );
}
