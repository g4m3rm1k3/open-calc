/**
 * ProductRuleProof.jsx
 * src/components/viz/react/ProductRuleProof.jsx
 * Register: VizFrame.jsx → ProductRuleProof: lazy(() => import('./react/ProductRuleProof.jsx'))
 *
 * Problem: Prove d/dx[f(x)·g(x)] = f′(x)·g(x) + f(x)·g′(x)
 * Demonstrated on: d/dx[x²·sin x]
 * Geometric interpretation: area of a growing rectangle
 * Every algebra trick is shown with numbers first.
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
  const btnLabel = why.tag || DLABELS[Math.min(depth, DLABELS.length - 1)];
  return (
    <div style={{ marginLeft: depth * 14, marginTop: 10 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: open ? d.tagBg : "transparent", border: `1px solid ${d.border}`, borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 500, color: d.border, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
        <span style={{ width: 15, height: 15, borderRadius: "50%", background: d.border, color: "#fff", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{open ? "−" : "?"}</span>
        {open ? "Close" : btnLabel}
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
  title: "The Product Rule: d/dx[f·g] = f′g + fg′",
  subtitle: "Proved from first principles, with geometric interpretation",
  problem: "\\frac{d}{dx}\\left[x^2 \\cdot \\sin x\\right] = 2x\\sin x + x^2\\cos x",
  preamble: "The product rule is not obvious — in fact, the first guess (d/dx[f·g] = f′·g′) is wrong. We prove the correct formula from the limit definition, using the 'add a clever zero' algebraic trick. Then we verify geometrically using a growing rectangle.",
  steps: [
    {
      id: 1, tag: "The Wrong Guess",
      tc: { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" },
      instruction: "First, let's see why the naive guess d/dx[f·g] = f′·g′ is wrong — so we know what we're actually proving.",
      math: "\\frac{d}{dx}[x^2 \\cdot x^3] \\stackrel{?}{=} 2x \\cdot 3x^2 = 6x^3 \\quad \\text{WRONG}",
      note: "The correct answer: d/dx[x⁵] = 5x⁴. The wrong formula gives 6x³. The product rule is not 'differentiate each part separately and multiply.' We need to prove what it actually is.",
      why: {
        tag: "Why doesn't d/dx[f·g] = f′·g′?",
        explanation: "Because derivatives measure rates of change, and the rate of change of a product depends on how both parts change together — not independently. Think of area: if a rectangle has sides f and g, and both are growing, the new area isn't just the product of the growth rates. It's the old width times the new height growth, plus the old height times the new width growth.",
        why: {
          tag: "Numerical demonstration",
          explanation: "Let f(x) = x² and g(x) = x³. Their product is h(x) = x⁵. At x = 1: h(1) = 1, h(1.001) ≈ 1.005. So h′(1) ≈ 5. But f′(1)·g′(1) = 2·3 = 6 ≠ 5. The correct rule gives f′g + fg′ = 2(1)(1) + (1)(3) = 5. ✓",
          why: null,
        },
      },
    },
    {
      id: 2, tag: "Definition",
      tc: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
      instruction: "Write the derivative of h(x) = f(x)·g(x) using the limit definition.",
      math: "h'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x)\\cdot g(x+\\Delta x) - f(x)\\cdot g(x)}{\\Delta x}",
      note: "We use Δx instead of h here to avoid confusion with the function h(x). This is identical to the limit definition — just different notation.",
      why: {
        tag: "Why write it this way with Δx?",
        explanation: "The limit definition says: h′(x) = lim_{Δx→0} [h(x+Δx) − h(x)] / Δx. Substituting h(x) = f(x)·g(x) gives the expression above. We use Δx (delta x, meaning 'a small change in x') to make it clear we're talking about an increment in the input, not a function named h.",
        why: {
          tag: "What does h(x+Δx) mean exactly?",
          explanation: "It means: evaluate the function at the input x + Δx instead of x. If h(x) = f(x)·g(x), then h(x+Δx) = f(x+Δx)·g(x+Δx). Both f and g get evaluated at the shifted input x+Δx. Think of it as asking: what does the product equal when x moves a tiny bit to the right?",
          why: null,
        },
      },
    },
    {
      id: 3, tag: "Algebra Trick",
      tc: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
      instruction: "Add and subtract f(x+Δx)·g(x) inside the numerator. This equals zero, so the value is unchanged — but it splits the expression into two recognisable pieces.",
      math: "= \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x)\\cdot g(x+\\Delta x) \\;\\mathbf{-\\; f(x+\\Delta x)\\cdot g(x) \\;+\\; f(x+\\Delta x)\\cdot g(x)} \\;-\\; f(x)\\cdot g(x)}{\\Delta x}",
      note: "The bolded terms sum to zero: −f(x+Δx)·g(x) + f(x+Δx)·g(x) = 0. Adding zero doesn't change the value. But now we can group differently.",
      why: {
        tag: "Why add zero? What's the plan?",
        explanation: "We need to split a single difference quotient into two parts — one that will become f′·g and one that will become f·g′. The expression as written doesn't factor cleanly. By adding and subtracting the same term, we manufacture the grouping we need.",
        steps: [
          { text: "Number analogy: 15 − 6 = 15 − 10 + 10 − 6 = 5 + 4 = 9. Adding and subtracting 10 doesn't change the value but splits the calculation." },
          { text: "Our case: A·D − B·C is hard to factor. But A·D − A·C + A·C − B·C = A(D−C) + C(A−B) — two clean groups." },
          { text: "In our limit: A = f(x+Δx), B = f(x), C = g(x), D = g(x+Δx). We add and subtract A·C = f(x+Δx)·g(x)." },
        ],
        why: {
          tag: "Is this always a valid algebra move?",
          explanation: "Yes. Adding and subtracting the same quantity is equivalent to adding zero: a + 0 = a. Adding zero is always valid by the additive identity axiom (a field axiom of the real numbers). The trick is choosing which zero to add so that the resulting expression can be factored usefully.",
          why: null,
        },
      },
    },
    {
      id: 4, tag: "Algebra",
      tc: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
      instruction: "Group into two fractions by factoring. Each fraction has Δx in the denominator.",
      math: "= \\lim_{\\Delta x \\to 0} \\left[ f(x+\\Delta x) \\cdot \\frac{g(x+\\Delta x) - g(x)}{\\Delta x} + g(x) \\cdot \\frac{f(x+\\Delta x) - f(x)}{\\Delta x} \\right]",
      note: "First group: f(x+Δx)·[g(x+Δx)−g(x)] / Δx. Second group: g(x)·[f(x+Δx)−f(x)] / Δx. These are not arbitrary — each fraction is a difference quotient in disguise.",
      why: {
        tag: "How does the grouping work? Show the algebra step by step.",
        explanation: "Take the numerator from Step 3 and factor by grouping — the same technique used in high school algebra.",
        steps: [
          { text: "The numerator is: f(x+Δx)·g(x+Δx) − f(x+Δx)·g(x) + f(x+Δx)·g(x) − f(x)·g(x)" },
          { text: "Group the first two terms: f(x+Δx)·[g(x+Δx) − g(x)]", math: "f(x+\\Delta x)\\cdot[g(x+\\Delta x) - g(x)]" },
          { text: "Group the last two terms: g(x)·[f(x+Δx) − f(x)]", math: "g(x)\\cdot[f(x+\\Delta x) - f(x)]" },
          { text: "Divide the whole thing by Δx — split across the two groups:", math: "f(x+\\Delta x)\\cdot\\frac{g(x+\\Delta x)-g(x)}{\\Delta x} + g(x)\\cdot\\frac{f(x+\\Delta x)-f(x)}{\\Delta x}" },
        ],
        why: {
          tag: "Why is splitting a fraction across addition valid?",
          explanation: "(A + B)/C = A/C + B/C — this is the distributive property of division over addition, which follows from the field axioms. Numerically: (6 + 4)/2 = 6/2 + 4/2 = 3 + 2 = 5 ✓. We're applying this to (first group + second group)/Δx.",
          steps: [
            { text: "Number check: (6 + 4)/2 = 10/2 = 5. Split: 6/2 + 4/2 = 3 + 2 = 5. ✓" },
            { text: "Variable check: (3x + 6)/3 = 3x/3 + 6/3 = x + 2. ✓" },
            { text: "Our case: [A + B]/Δx = A/Δx + B/Δx where A and B are the two grouped terms. ✓" },
          ],
          why: null,
        },
      },
    },
    {
      id: 5, tag: "Recognition",
      tc: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
      instruction: "Recognise the two difference quotients. Each is a derivative definition.",
      math: "\\frac{g(x+\\Delta x) - g(x)}{\\Delta x} \\xrightarrow{\\Delta x \\to 0} g'(x) \\qquad \\frac{f(x+\\Delta x) - f(x)}{\\Delta x} \\xrightarrow{\\Delta x \\to 0} f'(x)",
      note: "The pattern [q(x+Δx) − q(x)] / Δx as Δx → 0 is the definition of q′(x). Both fractions match this pattern — one for g and one for f.",
      why: {
        tag: "Why can we take each limit separately?",
        explanation: "The Limit Sum Law: lim[A + B] = lim[A] + lim[B] when both limits exist. The Limit Product Law: lim[c·A] = c·lim[A] when c is a constant (or approaches a limit). Both laws apply here, provided f and g are differentiable — meaning their difference quotients converge.",
        why: {
          tag: "What happens to f(x+Δx) as Δx→0?",
          explanation: "f(x+Δx) → f(x) because f is differentiable, which implies f is continuous, which means small changes in input produce small changes in output. So lim_{Δx→0} f(x+Δx) = f(x). This is the 'differentiability implies continuity' theorem.",
          why: {
            tag: "Prove: differentiability implies continuity",
            explanation: "If f′(x) exists, then: f(x+Δx) − f(x) = [f(x+Δx)−f(x)]/Δx · Δx → f′(x) · 0 = 0 as Δx→0. So f(x+Δx) → f(x). The function can't have a jump discontinuity at a point where it's differentiable — a jump would make the difference quotient blow up.",
            math: "f(x+\\Delta x) - f(x) = \\frac{f(x+\\Delta x)-f(x)}{\\Delta x} \\cdot \\Delta x \\to f'(x) \\cdot 0 = 0",
            why: null,
          },
        },
      },
    },
    {
      id: 6, tag: "Geometry",
      tc: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
      instruction: "Understand the Product Rule geometrically using a rectangle whose sides are f(x) and g(x).",
      math: "\\Delta A = f(x+\\Delta x)\\cdot g(x+\\Delta x) - f(x)\\cdot g(x) \\approx f'(x)\\cdot g(x)\\cdot\\Delta x + f(x)\\cdot g'(x)\\cdot\\Delta x",
      note: "A rectangle with sides f and g has area A = f·g. When x increases by Δx, both sides grow. The new area minus the old area equals the three new strips — two large ones (the product rule terms) and one tiny corner (which vanishes in the limit).",
      why: {
        tag: "Show me the rectangle picture in detail.",
        explanation: "Draw a rectangle with width f(x) and height g(x). When x changes by Δx, width becomes f(x+Δx) ≈ f(x) + f′(x)Δx and height becomes g(x+Δx) ≈ g(x) + g′(x)Δx.",
        steps: [
          { text: "New area − Old area = [f + f′Δx][g + g′Δx] − f·g" },
          { text: "Expand: = f·g + f·g′Δx + f′Δx·g + f′Δx·g′Δx − f·g" },
          { text: "Cancel f·g: = f·g′Δx + g·f′Δx + f′·g′·(Δx)²" },
          { text: "Divide by Δx: = f·g′ + g·f′ + f′·g′·Δx" },
          { text: "As Δx→0, the last term vanishes: ΔA/Δx → f·g′ + g·f′ = f′g + fg′ ✓" },
        ],
        why: {
          tag: "Why does the (Δx)² term vanish?",
          explanation: "The term f′·g′·(Δx)² divided by Δx gives f′·g′·Δx, which approaches 0 as Δx→0. In geometric terms: the tiny corner square of the rectangle has area proportional to (Δx)², which is second-order small. When you divide by Δx to get a rate, it becomes first-order small and disappears in the limit. Only the two strips (which are first-order in Δx) survive.",
          why: null,
        },
      },
    },
    {
      id: 7, tag: "Conclusion",
      tc: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
      instruction: "Take the limit. Each piece converges separately. Write the final Product Rule.",
      math: "\\frac{d}{dx}[f \\cdot g] = \\lim_{\\Delta x\\to 0}f(x+\\Delta x)\\cdot g'(x) + g(x)\\cdot f'(x) = f'(x)\\cdot g(x) + f(x)\\cdot g'(x)",
      note: "Applied to our example: d/dx[x²·sin x] = 2x·sin x + x²·cos x. The first term is f′·g (derivative of x² times sin x), the second is f·g′ (x² times derivative of sin x).",
      why: {
        tag: "Full dependency chain of this proof",
        explanation: "Every step required something beneath it:",
        steps: [
          { text: "Product Rule  ← the theorem" },
          { text: "↳ Limit definition of derivative" },
          { text: "↳ Add-zero trick (additive identity axiom)" },
          { text: "↳ Factor by grouping (distributive law)" },
          { text: "↳ Split fraction over addition (distributive law of division)" },
          { text: "↳ Limit Sum Law + Limit Product Law" },
          { text: "↳ Differentiability implies continuity" },
          { text: "↳ Field axioms of real numbers" },
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

export default function ProductRuleProof({ params = {} }) {
  const [step, setStep] = useState(0);
  const ready = useMath();
  const steps = PROOF.steps;
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "18px 22px", marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--color-text-tertiary)", marginBottom: 4 }}>Proof · Product Rule</div>
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
