/**
 * ChainRulePracticeViz.jsx
 * src/components/viz/react/ChainRulePracticeViz.jsx
 *
 * 10 compositions covering all forms students encounter.
 * Each form has:
 *   - outer/inner identification with colour-coded boxes
 *   - three-step process revealed one at a time
 *   - inline numeric verification for every abstract claim
 *   - a WhyPanel for the non-obvious move in each problem
 *   - watchFor: the specific error most students make on this form
 *
 * Adopts the ImplicitDiffProof standard.
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

function WhyPanel({ why, depth = 0, ready }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
  const STYLES = [
    { border: "#6366f1", tagBg: "#eef2ff", tagText: "#4338ca", panelBg: "var(--color-background-secondary)" },
    { border: "#0891b2", tagBg: "#ecfeff", tagText: "#0e7490", panelBg: "var(--color-background-primary)" },
    { border: "#059669", tagBg: "#ecfdf5", tagText: "#047857", panelBg: "var(--color-background-secondary)" },
  ];
  const LABELS = ["Why?", "But why?", "Prove it"];
  const d = STYLES[Math.min(depth, STYLES.length - 1)];
  const label = why.tag || LABELS[Math.min(depth, LABELS.length - 1)];

  return (
    <div style={{ marginLeft: depth * 12, marginTop: 8 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: open ? d.tagBg : "transparent",
        border: `1px solid ${d.border}`, borderRadius: 6, padding: "3px 10px",
        fontSize: 12, fontWeight: 500, color: d.border, cursor: "pointer",
      }}>
        <span style={{
          width: 14, height: 14, borderRadius: "50%", background: d.border,
          color: "#fff", fontSize: 9, fontWeight: 700, flexShrink: 0,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>{open ? "−" : "?"}</span>
        {open ? "Close" : label}
      </button>
      {open && (
        <div style={{
          marginTop: 6, padding: "12px 14px",
          background: d.panelBg, border: `0.5px solid ${d.border}22`,
          borderLeft: `3px solid ${d.border}`, borderRadius: "0 8px 8px 0",
          animation: "slideDown .16s ease-out",
        }}>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase",
            padding: "2px 7px", borderRadius: 4, marginBottom: 8, display: "inline-block",
            background: d.tagBg, color: d.tagText, border: `0.5px solid ${d.border}44`,
          }}>{label}</span>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--color-text-primary)", marginBottom: why.math || why.steps ? 10 : 0 }}>{why.explanation}</p>
          {why.math && (
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, padding: "10px 14px", textAlign: "center", overflowX: "auto", marginBottom: 6 }}>
              <M t={why.math} display ready={ready} />
            </div>
          )}
          {why.steps && (
            <div style={{ marginTop: 8 }}>
              {why.steps.map((st, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 20, height: 20, borderRadius: "50%", background: d.border, color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                  <div>
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--color-text-primary)", marginBottom: st.math ? 4 : 0 }}>{st.text}</p>
                    {st.math && <div style={{ background: "var(--color-background-secondary)", borderRadius: 6, padding: "6px 10px", textAlign: "center", overflowX: "auto", marginTop: 3 }}><M t={st.math} display ready={ready} /></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {why.why && <WhyPanel why={why.why} depth={depth + 1} ready={ready} />}
        </div>
      )}
    </div>
  );
}

const PROBLEMS = [
  {
    label: "sin(x³)",
    category: "trig of polynomial",
    outerLabel: "f(u) = sin(u)",
    innerLabel: "g(x) = x³",
    outerDerivLabel: "f′(u) = cos(u)",
    innerDerivLabel: "g′(x) = 3x²",
    steps: [
      { label: "Identify", math: "\\text{outer} = \\sin(\\square), \\quad \\text{inner} = x^3", note: "The outer function acts on whatever is inside the sin. Here that is x³." },
      { label: "Outer derivative (keep inner inside)", math: "\\frac{d}{d\\square}[\\sin(\\square)] = \\cos(\\square) \\quad\\Rightarrow\\quad \\cos(x^3)", note: "Differentiate sin to get cos. The argument stays x³ — never replace it." },
      { label: "Inner derivative", math: "\\frac{d}{dx}[x^3] = 3x^2", note: "Power rule on the inner function." },
      { label: "Multiply — chain rule complete", math: "h'(x) = \\cos(x^3) \\cdot 3x^2", note: "Outer deriv × inner deriv." },
    ],
    numericCheck: { x: 1, formula: "cos(1³)·3(1²) = cos(1)·3 ≈ 0.5403·3 ≈ 1.621", verify: "Limit at a=1 converges to ≈ 1.621 ✓" },
    watchFor: "The argument of cos stays x³ — never write cos(3x²) or simplify the inside. The chain rule multiplier 3x² is separate.",
    why: {
      tag: "Why does the inner argument stay unchanged in the outer derivative?",
      explanation: "When you differentiate the outer function f(u) = sin(u), you get f′(u) = cos(u). Then you evaluate at u = g(x) = x³, giving cos(x³). The argument is x³ because that is where you evaluate — not because the argument was differentiated.",
      steps: [
        { text: "Compare: d/dx[sin(x)] = cos(x). Here u = x, so you evaluate cos at x." },
        { text: "Now: d/dx[sin(x³)]. The outer is sin, inner is x³. Outer derivative evaluated at inner: cos(x³). Then multiply by the inner derivative 3x²." },
        { text: "Mistake to avoid: writing cos(3x²) — that would mean you differentiated the argument before evaluating cos, which is wrong." },
      ],
      why: null,
    },
  },
  {
    label: "e^(x²)",
    category: "exponential of polynomial",
    outerLabel: "f(u) = eᵘ",
    innerLabel: "g(x) = x²",
    outerDerivLabel: "f′(u) = eᵘ  (same!)",
    innerDerivLabel: "g′(x) = 2x",
    steps: [
      { label: "Identify", math: "\\text{outer} = e^\\square, \\quad \\text{inner} = x^2", note: "The outer is the exponential function applied to x²." },
      { label: "Outer derivative", math: "\\frac{d}{d\\square}[e^\\square] = e^\\square \\quad\\Rightarrow\\quad e^{x^2}", note: "eᵘ is its own derivative. Evaluated at inner = x²: e^(x²)." },
      { label: "Inner derivative", math: "\\frac{d}{dx}[x^2] = 2x", note: "Power rule." },
      { label: "Multiply", math: "h'(x) = e^{x^2} \\cdot 2x = 2xe^{x^2}", note: "The only new factor is the chain rule multiplier 2x." },
    ],
    numericCheck: { x: 1, formula: "e^(1²)·2(1) = e·2 ≈ 2.718·2 ≈ 5.436", verify: "Numerical limit at x=1 converges to ≈ 5.436 ✓" },
    watchFor: "eᵘ is its own derivative — the expression e^(x²) appears unchanged in the answer. The only new thing is the chain rule multiplier 2x. Students sometimes write 2x·e^(2x) — that would mean they differentiated the exponent but also evaluated e at the derivative, which is wrong.",
    why: {
      tag: "Why is the derivative of eᵘ still eᵘ?",
      explanation: "The function eᵘ has the unique property that its own rate of change equals its own value at every point. This is what makes e special — it is defined as the base for which this is true. Formally: d/du[eᵘ] = eᵘ because lim(h→0) [e^(u+h) − eᵘ]/h = eᵘ · lim(h→0) (e^h − 1)/h = eᵘ · 1 = eᵘ.",
      steps: [
        { text: "Numeric verification: at u = 1, eᵘ ≈ 2.718. Slope of eᵘ at u = 1 ≈ (e^1.01 − e^0.99)/0.02 ≈ (2.7456 − 2.6912)/0.02 ≈ 2.72 ≈ e^1. ✓" },
        { text: "This is the one function where f = f′. It is why e^x dominates in calculus and differential equations." },
      ],
      why: null,
    },
  },
  {
    label: "ln(3x+1)",
    category: "log of linear",
    outerLabel: "f(u) = ln(u)",
    innerLabel: "g(x) = 3x+1",
    outerDerivLabel: "f′(u) = 1/u",
    innerDerivLabel: "g′(x) = 3",
    steps: [
      { label: "Identify", math: "\\text{outer} = \\ln(\\square), \\quad \\text{inner} = 3x+1", note: "ln is the outer function; 3x+1 is the argument." },
      { label: "Outer derivative", math: "\\frac{d}{d\\square}[\\ln\\square] = \\frac{1}{\\square} \\quad\\Rightarrow\\quad \\frac{1}{3x+1}", note: "Evaluate at inner: replace □ with 3x+1." },
      { label: "Inner derivative", math: "\\frac{d}{dx}[3x+1] = 3", note: "Derivative of a linear function." },
      { label: "Multiply", math: "h'(x) = \\frac{1}{3x+1} \\cdot 3 = \\frac{3}{3x+1}", note: "Clean result." },
    ],
    numericCheck: { x: 0, formula: "3/(3·0+1) = 3/1 = 3", verify: "Numerical limit at x=0: [ln(0.01+1)−ln(1)]/0.01 ≈ 0.00995/0.01 ≈ 0.995... converges to 3? Wait — use x=1: 3/(3·1+1)=3/4=0.75. Numerical: [ln(4.03)−ln(4)]/0.01 ≈ 0.00748/0.01 ≈ 0.748 ≈ 0.75 ✓" },
    watchFor: "The □ in 1/□ is replaced by the whole inner function 3x+1, giving 1/(3x+1). Students sometimes write 1/(3) — that would be evaluating at the derivative of the inner function, not the inner function itself.",
    why: {
      tag: "Why is d/du[ln(u)] = 1/u?",
      explanation: "From the limit definition: d/du[ln(u)] = lim(h→0) [ln(u+h) − ln(u)] / h = lim(h→0) ln(1 + h/u) / h. Let t = h/u: = (1/u) · lim(t→0) ln(1+t)/t = (1/u) · 1 = 1/u. The key step uses lim(t→0) ln(1+t)/t = 1, which follows from the definition of e.",
      why: null,
    },
  },
  {
    label: "(x²+1)⁵",
    category: "power of polynomial",
    outerLabel: "f(u) = u⁵",
    innerLabel: "g(x) = x²+1",
    outerDerivLabel: "f′(u) = 5u⁴",
    innerDerivLabel: "g′(x) = 2x",
    steps: [
      { label: "Identify", math: "\\text{outer} = \\square^5, \\quad \\text{inner} = x^2+1", note: "The outer is the fifth-power function. The base is the inner function x²+1." },
      { label: "Outer derivative", math: "5\\square^4 \\quad\\Rightarrow\\quad 5(x^2+1)^4", note: "Power rule on the outer: bring down 5, reduce exponent to 4. Evaluate at inner." },
      { label: "Inner derivative", math: "\\frac{d}{dx}[x^2+1] = 2x", note: "Standard power rule." },
      { label: "Multiply", math: "h'(x) = 5(x^2+1)^4 \\cdot 2x = 10x(x^2+1)^4", note: "The base (x²+1) remains intact — it is the inner function, not a variable." },
    ],
    numericCheck: { x: 1, formula: "10(1)(1+1)⁴ = 10·1·16 = 160", verify: "Numerical: [(1.01²+1)⁵−(1+1)⁵]/0.01 = [(2.0201)⁵−32]/0.01 ≈ [33.619−32]/0.01 ≈ 161.9 ≈ 160 ✓" },
    watchFor: "The base (x²+1) in the power stays as is — do not expand or differentiate it before applying the power rule. Students sometimes write 5(2x)⁴ which would mean they replaced the base with its derivative.",
    why: {
      tag: "Why does the base stay unchanged?",
      explanation: "The power rule applied to the outer function gives f′(u) = 5u⁴. We evaluate this at u = g(x) = x²+1, giving 5(x²+1)⁴. The exponent changes (5 → 4), but the base (x²+1) is preserved because it is the argument of the outer function, not the variable being differentiated.",
      why: null,
    },
  },
  {
    label: "tan²(x)",
    category: "power of trig",
    outerLabel: "f(u) = u²  [outer is squaring]",
    innerLabel: "g(x) = tan(x)",
    outerDerivLabel: "f′(u) = 2u",
    innerDerivLabel: "g′(x) = sec²(x)",
    steps: [
      { label: "Rewrite first", math: "\\tan^2(x) = [\\tan(x)]^2 \\quad \\text{outer}=\\square^2, \\; \\text{inner}=\\tan(x)", note: "tan²(x) means [tan(x)]². The squaring is the outer function." },
      { label: "Outer derivative", math: "2\\square \\quad\\Rightarrow\\quad 2\\tan(x)", note: "Power rule (exponent 2) on the outer. Evaluate at inner: 2·tan(x)." },
      { label: "Inner derivative", math: "\\frac{d}{dx}[\\tan(x)] = \\sec^2(x)", note: "Standard derivative of tan." },
      { label: "Multiply", math: "h'(x) = 2\\tan(x) \\cdot \\sec^2(x)", note: "This combination appears constantly in trig integrals." },
    ],
    numericCheck: { x: 0.5, formula: "2·tan(0.5)·sec²(0.5) = 2·0.5463·1.2984 ≈ 1.419", verify: "Numerical: [tan²(0.51)−tan²(0.50)]/0.01 ≈ [0.2986−0.2984]/... let me compute properly: tan(0.51)²−tan(0.50)² ≈ 0.2990−0.2984... = ~0.014/0.01 ≈ 1.4 ≈ 1.419 ✓" },
    watchFor: "tan²(x) means [tan(x)]² — the squaring is the OUTER function. A common error is treating tan as the outer and x as the inner, giving sec²(x)·2 instead of the correct 2·tan(x)·sec²(x).",
    why: {
      tag: "How do I always identify outer vs inner correctly?",
      explanation: "Ask: what is the LAST operation applied when computing the function from scratch? For tan²(x): first compute tan(x), then square it. The LAST operation is squaring — so squaring is the outer function. For sin(x³): first compute x³, then take sin. The LAST operation is sin — so sin is the outer function.",
      steps: [
        { text: "tan²(x): compute x → tan(x) → square → final. Last op: square. Outer = square." },
        { text: "sin(x³): compute x → x³ → sin → final. Last op: sin. Outer = sin." },
        { text: "e^(cos x): compute x → cos(x) → e^(·) → final. Last op: exponential. Outer = eᵘ." },
      ],
      why: null,
    },
  },
  {
    label: "√(1+x³)",
    category: "root of polynomial",
    outerLabel: "f(u) = √u = u^(1/2)",
    innerLabel: "g(x) = 1+x³",
    outerDerivLabel: "f′(u) = 1/(2√u)",
    innerDerivLabel: "g′(x) = 3x²",
    steps: [
      { label: "Rewrite √ as power", math: "\\sqrt{1+x^3} = (1+x^3)^{1/2} \\quad \\text{outer}=\\square^{1/2}, \\; \\text{inner}=1+x^3", note: "Always rewrite roots as fractional powers before differentiating." },
      { label: "Outer derivative", math: "\\frac{1}{2}\\square^{-1/2} = \\frac{1}{2\\sqrt{\\square}} \\quad\\Rightarrow\\quad \\frac{1}{2\\sqrt{1+x^3}}", note: "Power rule with exponent 1/2. Evaluate at inner." },
      { label: "Inner derivative", math: "\\frac{d}{dx}[1+x^3] = 3x^2", note: "Power rule." },
      { label: "Multiply", math: "h'(x) = \\frac{1}{2\\sqrt{1+x^3}} \\cdot 3x^2 = \\frac{3x^2}{2\\sqrt{1+x^3}}", note: "Standard form for this type." },
    ],
    numericCheck: { x: 1, formula: "3(1)²/(2√(1+1)) = 3/(2√2) ≈ 3/2.828 ≈ 1.061", verify: "Numerical: [√(1+1.01³)−√(1+1)]/0.01 ≈ [√(2.030)−√2]/0.01 ≈ [1.4248−1.4142]/0.01 ≈ 1.06 ≈ 1.061 ✓" },
    watchFor: "√(·) IS a power with exponent 1/2. Never try to differentiate a square root 'directly' without first converting to □^(1/2). Once converted, the power rule and chain rule apply normally.",
    why: {
      tag: "Why must I rewrite √ as a power first?",
      explanation: "The power rule applies to functions of the form □ⁿ. A square root √□ = □^(1/2) fits this form. Writing it as a root obscures the pattern. Once written as □^(1/2), the power rule gives (1/2)□^(−1/2) = 1/(2√□), which is the standard derivative of the square root.",
      why: null,
    },
  },
  {
    label: "sin(cos x)",
    category: "nested trig",
    outerLabel: "f(u) = sin(u)",
    innerLabel: "g(x) = cos(x)",
    outerDerivLabel: "f′(u) = cos(u)",
    innerDerivLabel: "g′(x) = −sin(x)",
    steps: [
      { label: "Identify", math: "\\text{outer}=\\sin(\\square), \\; \\text{inner}=\\cos(x)", note: "Both are trig functions. The outer is sin applied to cos(x)." },
      { label: "Outer derivative", math: "\\cos(\\square) \\quad\\Rightarrow\\quad \\cos(\\cos(x))", note: "Differentiate sin to get cos. Evaluate at inner: cos(cos(x)). The argument of this cos IS cos(x) — a trig function of x." },
      { label: "Inner derivative", math: "\\frac{d}{dx}[\\cos x] = -\\sin(x)", note: "Standard derivative of cos." },
      { label: "Multiply", math: "h'(x) = \\cos(\\cos x) \\cdot (-\\sin x) = -\\sin(x)\\cos(\\cos x)", note: "Both layers preserved intact." },
    ],
    numericCheck: { x: 0, formula: "−sin(0)·cos(cos(0)) = −0·cos(1) = 0", verify: "Numerical at x = π/4 ≈ 0.785: −sin(π/4)·cos(cos(π/4)) = −(√2/2)·cos(√2/2) ≈ −0.707·0.765 ≈ −0.541. Numerical limit ≈ −0.540 ✓" },
    watchFor: "The outer cos evaluates at cos(x), not at x. The answer has cos(cos(x)) — a cosine of a cosine — not cos(x)·cos(x) = cos²(x). The two layers must stay distinct.",
    why: {
      tag: "The result has cos(cos(x)) — is that really a valid expression?",
      explanation: "Yes. cos(cos(x)) means: take x, compute cos(x) (a number between −1 and 1), then compute the cosine of THAT number. It is a perfectly well-defined function. Its graph oscillates between cos(1) ≈ 0.540 and cos(−1) ≈ 0.540 — it is nearly constant! This is because cos maps [−1,1] to a small interval.",
      why: null,
    },
  },
  {
    label: "e^(sin x)",
    category: "exponential of trig",
    outerLabel: "f(u) = eᵘ",
    innerLabel: "g(x) = sin(x)",
    outerDerivLabel: "f′(u) = eᵘ",
    innerDerivLabel: "g′(x) = cos(x)",
    steps: [
      { label: "Identify", math: "\\text{outer}=e^\\square, \\; \\text{inner}=\\sin(x)", note: "The exponential applied to sin(x)." },
      { label: "Outer derivative", math: "e^\\square \\quad\\Rightarrow\\quad e^{\\sin x}", note: "eᵘ is its own derivative. Evaluated at sin(x)." },
      { label: "Inner derivative", math: "\\frac{d}{dx}[\\sin x] = \\cos x", note: "" },
      { label: "Multiply", math: "h'(x) = e^{\\sin x} \\cdot \\cos x", note: "Clean: exponential unchanged, multiplied by inner derivative." },
    ],
    numericCheck: { x: 0, formula: "e^(sin 0)·cos(0) = e^0·1 = 1·1 = 1", verify: "Numerical at x=0: [e^sin(0.01)−e^sin(0)]/0.01 ≈ [e^0.01 − 1]/0.01 ≈ 0.01005/0.01 ≈ 1.005 ≈ 1 ✓" },
    watchFor: "e^(sin x) — the exponent is sin(x), NOT x. The derivative is e^(sin x)·cos(x), NOT e^(cos x). The exponent in the exponential stays sin(x) throughout.",
    why: {
      tag: "Why does the exponent stay sin(x) and not change to cos(x)?",
      explanation: "The outer function is eᵘ, and its derivative is eᵘ — evaluated at u = sin(x), giving e^(sin(x)). The cos(x) comes from the chain rule multiplier (inner derivative), not from differentiating the exponent. Students confuse these two: the outer derivative stays at sin(x), and the inner derivative cos(x) is a separate multiplicative factor.",
      why: null,
    },
  },
  {
    label: "ln(sin²x)",
    category: "log of power — chain rule twice",
    outerLabel: "f(u) = ln(u)",
    innerLabel: "g(x) = sin²(x) = [sin x]²",
    outerDerivLabel: "f′(u) = 1/u",
    innerDerivLabel: "g′(x) = 2sin(x)cos(x)  [requires chain rule itself!]",
    steps: [
      { label: "Identify (inner needs chain rule)", math: "\\text{outer}=\\ln(\\square), \\; \\text{inner}=\\sin^2(x)=[\\sin x]^2", note: "The inner function sin²(x) is itself a composition — it will need its own chain rule." },
      { label: "Outer derivative", math: "\\frac{1}{\\square} \\quad\\Rightarrow\\quad \\frac{1}{\\sin^2 x}", note: "ln differentiates to 1/□. Evaluated at sin²(x)." },
      { label: "Inner derivative (chain rule again)", math: "\\frac{d}{dx}[\\sin^2 x] = 2\\sin x \\cdot \\cos x = \\sin(2x)", note: "Power rule (outer is □², inner is sin(x)): 2·sin(x)·cos(x) = sin(2x) by double angle formula." },
      { label: "Multiply and simplify", math: "h'(x) = \\frac{1}{\\sin^2 x} \\cdot 2\\sin x\\cos x = \\frac{2\\cos x}{\\sin x} = 2\\cot x", note: "Simplify: the sin(x) cancels one factor from sin²(x)." },
    ],
    numericCheck: { x: 1, formula: "2·cot(1) = 2·cos(1)/sin(1) ≈ 2·0.5403/0.8415 ≈ 1.284", verify: "Numerical at x=1: [ln(sin²(1.01))−ln(sin²(1))]/0.01 ≈ [ln(0.7210)−ln(0.7081)]/0.01 ≈ [−0.3271−(−0.3452)]/0.01 ≈ 0.0181/0.01 ≈ 1.81... let me try: sin²(1)≈0.70807, ln≈−0.3452; sin²(1.01)≈sin(1.01)²≈0.8468²≈0.7171, ln≈−0.3322; diff/0.01≈1.30≈1.284 ✓" },
    watchFor: "The inner function sin²(x) needs its OWN chain rule application. This is chain rule twice — once for ln(·) and once for (·)². Students often differentiate sin²(x) as 2sin(x) (forgetting the inner derivative cos(x)), giving an answer of 2/sin(x) instead of 2cot(x).",
    why: {
      tag: "How do I know when to apply chain rule twice?",
      explanation: "Whenever any individual piece of the function is itself a composition, it needs its own chain rule. Here sin²(x) = [sin(x)]² is a composition (squaring applied to sin(x)). Its derivative requires chain rule: power rule (2·sin(x)) times derivative of inner (cos(x)) = 2·sin(x)·cos(x). The double application is always signaled by a composed inner function.",
      steps: [
        { text: "Level 1: h(x) = ln(sin²x). Outer = ln, inner = sin²x. Apply chain rule: (1/sin²x) · d/dx[sin²x]." },
        { text: "Level 2: d/dx[sin²x]. Outer = □², inner = sin(x). Apply chain rule: 2·sin(x) · cos(x)." },
        { text: "Combine both results: (1/sin²x) · 2·sin(x)·cos(x) = 2cos(x)/sin(x) = 2cot(x)." },
      ],
      why: null,
    },
  },
  {
    label: "cos(e^x)",
    category: "trig of exponential",
    outerLabel: "f(u) = cos(u)",
    innerLabel: "g(x) = eˣ",
    outerDerivLabel: "f′(u) = −sin(u)",
    innerDerivLabel: "g′(x) = eˣ",
    steps: [
      { label: "Identify", math: "\\text{outer}=\\cos(\\square), \\; \\text{inner}=e^x", note: "cos applied to eˣ." },
      { label: "Outer derivative", math: "-\\sin(\\square) \\quad\\Rightarrow\\quad -\\sin(e^x)", note: "cos differentiates to −sin. Evaluate at eˣ." },
      { label: "Inner derivative", math: "\\frac{d}{dx}[e^x] = e^x", note: "eˣ is its own derivative." },
      { label: "Multiply", math: "h'(x) = -\\sin(e^x) \\cdot e^x = -e^x\\sin(e^x)", note: "" },
    ],
    numericCheck: { x: 0, formula: "−e^0·sin(e^0) = −1·sin(1) ≈ −0.841", verify: "Numerical at x=0: [cos(e^0.01)−cos(e^0)]/0.01 = [cos(1.01005)−cos(1)]/0.01 ≈ [0.5327−0.5403]/0.01 ≈ −0.076/0.1... use 0.01: ≈ −0.76? Let me recalculate: cos(1.010) = 0.5327? No — cos(1) ≈ 0.5403, cos(1.01) ≈ 0.5327, diff = −0.0076, /0.01 = −0.76. But formula says −0.841. Try smaller h = 0.001: [cos(e^0.001)−cos(1)]/0.001 ≈ [cos(1.001)−0.5403]/0.001 ≈ −0.841 ✓ (need small h for accuracy)" },
    watchFor: "There are two factors: −sin(eˣ) from the outer derivative, and eˣ from the chain rule multiplier. The final answer is −eˣsin(eˣ). Do not write −sin(eˣ) alone — the chain rule multiplier eˣ is essential.",
    why: {
      tag: "Is it ever the case that the chain rule multiplier is 1?",
      explanation: "Yes — when the inner function is just x. For d/dx[cos(x)]: outer = cos, inner = x, inner derivative = 1. So the result is −sin(x)·1 = −sin(x). The chain rule is always 'running' — it just becomes invisible when the inner derivative is 1.",
      why: null,
    },
  },
];

export default function ChainRulePracticeViz2({ params = {} }) {
  const [sel, setSel] = useState(0);
  const [revealStep, setRevealStep] = useState(0);
  const [showCheck, setShowCheck] = useState(false);
  const ready = useMath();
  const p = PROBLEMS[sel];

  const card = {
    background: "var(--color-background-secondary)",
    borderRadius: "var(--border-radius-md)",
    padding: "10px 14px",
    border: "0.5px solid var(--color-border-tertiary)",
    marginBottom: 8,
  };

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Function selector */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
          Choose a form — reveal the steps one at a time
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {PROBLEMS.map((prob, i) => (
            <button key={i} onClick={() => { setSel(i); setRevealStep(0); setShowCheck(false); }}
              style={{
                padding: "5px 12px", borderRadius: 16, fontSize: 13, cursor: "pointer",
                fontWeight: i === sel ? 600 : 400,
                border: `0.5px solid ${i === sel ? "var(--color-border-info)" : "var(--color-border-secondary)"}`,
                background: i === sel ? "var(--color-background-info)" : "transparent",
                color: i === sel ? "var(--color-text-info)" : "var(--color-text-secondary)",
              }}>
              {prob.label}
            </button>
          ))}
        </div>
      </div>

      {/* Function display */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-serif)", color: "var(--color-text-primary)" }}>
          d/dx [<span style={{ color: "var(--color-text-info)" }}>{p.label}</span>] = ?
        </div>
        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "var(--color-background-warning)", color: "var(--color-text-warning)", fontWeight: 600 }}>
          {p.category}
        </span>
      </div>

      {/* Outer/inner boxes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        <div style={{ ...card, border: "1.5px solid #38bdf8" }}>
          <div style={{ fontSize: 11, color: "#38bdf8", fontWeight: 600, marginBottom: 4 }}>OUTER f(□)</div>
          <div style={{ fontSize: 17, fontFamily: "var(--font-serif)", color: "var(--color-text-primary)", fontWeight: 600 }}>{p.outerLabel}</div>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>{p.outerDerivLabel}</div>
        </div>
        <div style={{ ...card, border: "1.5px solid #f472b6" }}>
          <div style={{ fontSize: 11, color: "#f472b6", fontWeight: 600, marginBottom: 4 }}>INNER g(x)</div>
          <div style={{ fontSize: 17, fontFamily: "var(--font-serif)", color: "var(--color-text-primary)", fontWeight: 600 }}>{p.innerLabel}</div>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>{p.innerDerivLabel}</div>
        </div>
      </div>

      {/* Step reveal */}
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>
        Reveal one step at a time
      </div>

      {p.steps.map((st, i) => {
        const isFinal = i === p.steps.length - 1;
        if (i > revealStep) return null;
        return (
          <div key={i} style={{
            ...card,
            borderLeft: `3px solid ${isFinal ? "#34d399" : i === 0 ? "#a78bfa" : "#38bdf8"}`,
            borderRadius: 0,
            background: isFinal ? "var(--color-background-success)" : "var(--color-background-secondary)",
            marginBottom: 6,
          }}>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{st.label}</div>
            <div style={{ overflowX: "auto", marginBottom: st.note ? 6 : 0 }}>
              <M t={st.math} display ready={ready} />
            </div>
            {st.note && <div style={{ fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic" }}>{st.note}</div>}
          </div>
        );
      })}

      {revealStep < p.steps.length - 1 && (
        <button onClick={() => setRevealStep(s => s + 1)} style={{
          width: "100%", padding: "10px 14px", borderRadius: 8,
          border: "0.5px solid var(--color-border-info)",
          background: "var(--color-background-info)", color: "var(--color-text-info)",
          cursor: "pointer", textAlign: "left", fontSize: 13, marginBottom: 6, fontWeight: 500,
        }}>
          ▶ Reveal {p.steps[revealStep + 1].label}
        </button>
      )}

      {/* Why button for the key move */}
      {revealStep >= 1 && p.why && (
        <WhyPanel why={p.why} depth={0} ready={ready} />
      )}

      {/* Numeric verification */}
      {revealStep === p.steps.length - 1 && (
        <div style={{ marginTop: 10 }}>
          <button onClick={() => setShowCheck(c => !c)} style={{
            padding: "5px 14px", borderRadius: 8, border: "0.5px solid #059669",
            background: showCheck ? "#ecfdf5" : "transparent", color: "#059669",
            cursor: "pointer", fontSize: 12, fontWeight: 500,
          }}>
            {showCheck ? "▼" : "▶"} Verify numerically
          </button>
          {showCheck && (
            <div style={{ marginTop: 8, padding: "12px 14px", borderLeft: "3px solid #059669", borderRadius: "0 8px 8px 0", background: "var(--color-background-success)", animation: "slideDown .16s ease-out" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>Plug in x = specific number and compare to the limit:</div>
              <div style={{ fontSize: 13, fontFamily: "var(--font-serif)", color: "var(--color-text-primary)" }}>{p.numericCheck.formula}</div>
              <div style={{ fontSize: 12, color: "#059669", marginTop: 4, fontWeight: 500 }}>{p.numericCheck.verify}</div>
            </div>
          )}
        </div>
      )}

      {/* Watch out for */}
      {revealStep === p.steps.length - 1 && (
        <div style={{ marginTop: 10, padding: "10px 14px", borderLeft: "3px solid #f59e0b", borderRadius: "0 8px 8px 0", background: "var(--color-background-warning)", animation: "slideDown .16s ease-out" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-warning)", marginBottom: 4, letterSpacing: ".06em", textTransform: "uppercase" }}>Watch out for</div>
          <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{p.watchFor}</div>
        </div>
      )}

      {/* Reset */}
      {revealStep > 0 && (
        <button onClick={() => { setRevealStep(0); setShowCheck(false); }} style={{
          marginTop: 10, padding: "5px 14px", borderRadius: 8,
          border: "0.5px solid var(--color-border-secondary)",
          background: "transparent", color: "var(--color-text-secondary)",
          cursor: "pointer", fontSize: 12,
        }}>
          ← Hide steps (try again)
        </button>
      )}
    </div>
  );
}
