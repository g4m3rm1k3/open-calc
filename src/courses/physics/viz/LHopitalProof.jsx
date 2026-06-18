/**
 * LHopitalProof.jsx
 * src/components/viz/react/LHopitalProof.jsx
 *
 * Problem: Prove L'Hôpital's Rule and apply it to lim(sin x / x) as x→0
 * Shows both proofs of the same limit: squeeze theorem AND L'Hôpital
 * and explains why they agree.
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
  title: "L'Hôpital's Rule — and Two Proofs of the Same Limit",
  subtitle: "lim(sin x / x) as x→0, proved two ways — and why both give 1",
  problem: "\\lim_{x \\to 0}\\frac{\\sin x}{x} = 1 \\qquad \\lim_{x\\to a}\\frac{f(x)}{g(x)} \\stackrel{0/0}{=} \\lim_{x\\to a}\\frac{f'(x)}{g'(x)}",
  preamble: "L'Hôpital's Rule says: for 0/0 or ∞/∞ forms, you can replace the limit of a ratio with the limit of the ratio of derivatives. But why? And why can't you use it for every limit? We prove the rule, apply it to sin(x)/x, and compare with the squeeze theorem proof we already know.",
  steps: [
    {
      id: 1, tag: "The Problem",
      tc: { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" },
      instruction: "lim(sin x / x) as x→0 is an indeterminate form 0/0. Direct substitution gives 0/0 — which is undefined, not zero.",
      math: "\\lim_{x \\to 0}\\frac{\\sin x}{x} = \\frac{\\sin 0}{0} = \\frac{0}{0} \\quad \\leftarrow \\text{undefined — not zero, not one, not anything yet}",
      note: "0/0 is called indeterminate because different limits of this form can give different answers. For example: lim x/x = 1, lim x²/x = 0, lim x/x³ = ∞. The form 0/0 tells us nothing by itself — we need more information about how fast the top and bottom approach zero.",
      why: {
        tag: "What other indeterminate forms exist?",
        explanation: "0/0 and ∞/∞ are the forms where L'Hôpital applies directly. Other indeterminate forms (0·∞, ∞−∞, 0⁰, ∞⁰, 1^∞) can be converted to 0/0 or ∞/∞ through algebraic manipulation before applying the rule.",
        steps: [
          { text: "0/0 example: lim(sin x)/x — both approach 0, limit = 1" },
          { text: "∞/∞ example: lim(x²)/(eˣ) — both approach ∞, limit = 0 (exponential wins)" },
          { text: "0·∞ example: lim x·ln x as x→0⁺ — rewrite as lim (ln x)/(1/x) and apply L'Hôpital" },
          { text: "L'Hôpital does NOT apply to 1/2 + 3/4 = 0/0 style — only limits approaching the indeterminate form." },
        ],
        why: null,
      },
    },
    {
      id: 2, tag: "Prove L'Hôpital's Rule",
      tc: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
      instruction: "L'Hôpital's Rule: if f(a) = g(a) = 0 and g′(a) ≠ 0, then lim f(x)/g(x) = f′(a)/g′(a).",
      math: "\\lim_{x\\to a}\\frac{f(x)}{g(x)} = \\lim_{x\\to a}\\frac{f(x)-f(a)}{g(x)-g(a)} = \\lim_{x\\to a}\\frac{\\dfrac{f(x)-f(a)}{x-a}}{\\dfrac{g(x)-g(a)}{x-a}} = \\frac{f'(a)}{g'(a)}",
      note: "This is the simple version of the proof. It works when f(a) = g(a) = 0. The general version (for ∞/∞ and for open intervals) uses Cauchy's Mean Value Theorem.",
      why: {
        tag: "Walk me through each equality sign in the proof.",
        explanation: "There are three equality signs. Each requires justification.",
        steps: [
          { text: "Step 1: f(x)/g(x) = [f(x)−f(a)]/[g(x)−g(a)]. This holds because f(a) = 0 and g(a) = 0, so f(x)−f(a) = f(x)−0 = f(x), and g(x)−g(a) = g(x)−0 = g(x). Subtracting zero doesn't change anything." },
          { text: "Step 2: [f(x)−f(a)]/[g(x)−g(a)] = [(f(x)−f(a))/(x−a)] / [(g(x)−g(a))/(x−a)]. We multiplied top and bottom by 1/(x−a) — valid since x ≠ a in the limit." },
          { text: "Step 3: As x→a, the top converges to f′(a) (by definition of derivative), the bottom to g′(a). Their ratio converges to f′(a)/g′(a), by the Limit Quotient Law." },
        ],
        why: {
          tag: "Why can we multiply top and bottom by 1/(x−a)?",
          explanation: "Multiplying numerator and denominator by the same nonzero quantity doesn't change the value of a fraction: A/B = (A·c)/(B·c) for any c ≠ 0. Here c = 1/(x−a) and x ≠ a in the limit (limits approach but never reach the point). This is the field axiom that division distributes.",
          steps: [
            { text: "Number example: 6/4 = (6·½)/(4·½) = 3/2. ✓ Multiplying both by ½ preserves the ratio." },
            { text: "Our case: [f(x)−f(a)]/[g(x)−g(a)] · (1/(x−a))/(1/(x−a)) — the 1/(x−a) factors cancel." },
          ],
          why: {
            tag: "What is the Limit Quotient Law?",
            explanation: "lim[f/g] = lim[f] / lim[g], provided lim[g] ≠ 0. Here lim[(f(x)−f(a))/(x−a)] = f′(a) and lim[(g(x)−g(a))/(x−a)] = g′(a) ≠ 0 (given). So the ratio of limits equals the limit of the ratio.",
            why: null,
          },
        },
      },
    },
    {
      id: 3, tag: "Apply L'Hôpital",
      tc: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
      instruction: "Apply L'Hôpital's Rule to lim(sin x / x) as x→0. Differentiate top and bottom separately.",
      math: "\\lim_{x\\to 0}\\frac{\\sin x}{x} \\stackrel{\\scriptscriptstyle 0/0}{=} \\lim_{x\\to 0}\\frac{\\frac{d}{dx}\\sin x}{\\frac{d}{dx}x} = \\lim_{x\\to 0}\\frac{\\cos x}{1} = \\cos 0 = 1",
      note: "f(x) = sin x, f′(x) = cos x. g(x) = x, g′(x) = 1. The 0/0 condition is met: sin(0) = 0 and 0 = 0. The rule applies, and the limit is cos(0)/1 = 1.",
      why: {
        tag: "Wait — d/dx[sin x] = cos x was proved using lim(sin x/x) = 1. Isn't this circular?",
        explanation: "Yes — and this is one of the most important logical traps in calculus. We proved d/dx[sin x] = cos x using the squeeze theorem, which required lim(sin x/x) = 1 as a lemma. If we then use L'Hôpital to prove lim(sin x/x) = 1 using d/dx[sin x] = cos x, we have a circular argument. Each proof assumes the other.",
        steps: [
          { text: "The squeeze theorem proof: lim(sin x/x) = 1 proved geometrically → used to prove d/dx[sin x] = cos x. No circularity." },
          { text: "L'Hôpital applied to sin x/x: uses d/dx[sin x] = cos x → but that was proved using lim(sin x/x) = 1. Circular!" },
          { text: "Conclusion: L'Hôpital confirms the result but does NOT provide an independent proof of it here. The squeeze theorem proof is the foundational one." },
        ],
        why: {
          tag: "Why do two valid proofs give the same answer if one is circular?",
          explanation: "Both proofs give 1 because the result is true. The issue is not correctness but justification. A circular argument isn't wrong about the conclusion — it's wrong about the reasoning. It says 'A is true because B is true because A is true' — which proves nothing, even if A happens to be true. Mathematics requires that each step be independently justified.",
          why: null,
        },
      },
    },
    {
      id: 4, tag: "When L'Hôpital Fails",
      tc: { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" },
      instruction: "L'Hôpital's Rule cannot be applied when the limit is NOT an indeterminate form. Common mistakes:",
      math: "\\lim_{x\\to 0}\\frac{x^2 + 1}{x + 2} = \\frac{1}{2} \\quad \\text{NOT} \\quad \\frac{2x}{1} = 0",
      note: "This limit is NOT 0/0 — at x = 0, the numerator is 1 and the denominator is 2. Direct substitution works. Applying L'Hôpital anyway gives the wrong answer.",
      why: {
        tag: "Why does L'Hôpital give the wrong answer here?",
        explanation: "The rule requires f(a) = g(a) = 0 (or both infinite). Here g(0) = 2 ≠ 0. The algebraic manipulation in the proof — writing [f(x)−f(a)]/[g(x)−g(a)] — doesn't simplify to f(x)/g(x) unless f(a) = g(a) = 0. The derivation breaks down, and the formula no longer applies.",
        steps: [
          { text: "Correct: lim_{x→0} (x²+1)/(x+2) = (0+1)/(0+2) = 1/2 by direct substitution." },
          { text: "Wrong: applying L'Hôpital gives lim_{x→0} 2x/1 = 0. This is incorrect." },
          { text: "Lesson: always verify the 0/0 or ∞/∞ form before applying L'Hôpital." },
        ],
        why: null,
      },
    },
    {
      id: 5, tag: "Cauchy MVT — the full proof",
      tc: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
      instruction: "The general L'Hôpital's Rule (for open intervals, not just at a point) is proved using Cauchy's Mean Value Theorem.",
      math: "\\frac{f(b)-f(a)}{g(b)-g(a)} = \\frac{f'(c)}{g'(c)} \\quad \\text{for some } c \\in (a,b)",
      note: "Cauchy's MVT generalises the standard MVT to ratios. Standard MVT: f(b)−f(a) = f′(c)·(b−a). Cauchy: [f(b)−f(a)]/[g(b)−g(a)] = f′(c)/g′(c). Setting g(x) = x recovers the standard MVT.",
      why: {
        tag: "How is Cauchy's MVT proved?",
        explanation: "Define h(x) = f(x) − f(a) − [f(b)−f(a)]/[g(b)−g(a)] · [g(x) − g(a)]. Then h(a) = 0 and h(b) = 0. By Rolle's Theorem, h′(c) = 0 for some c ∈ (a,b). Computing h′(c) = 0 gives exactly the Cauchy MVT.",
        why: {
          tag: "What is Rolle's Theorem?",
          explanation: "Rolle's Theorem: if f is continuous on [a,b], differentiable on (a,b), and f(a) = f(b), then f′(c) = 0 for some c ∈ (a,b). Intuitively: if a function starts and ends at the same value, it must have a horizontal tangent somewhere in between.",
          why: {
            tag: "Why must there be a horizontal tangent? (Extreme Value Theorem)",
            explanation: "f must attain its maximum and minimum on [a,b] by the Extreme Value Theorem (which requires continuity and completeness of ℝ). If the max or min is in the interior (not at the endpoints), then f′ = 0 there — that's the horizontal tangent. If both extrema are at the endpoints and f(a) = f(b), then f is constant and f′ = 0 everywhere.",
            why: null,
          },
        },
      },
    },
    {
      id: 6, tag: "Two Proofs — One Truth",
      tc: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
      instruction: "Compare the two proofs of lim(sin x/x) = 1. One is foundational. One is confirmatory.",
      math: "\\underbrace{\\cos h < \\frac{\\sin h}{h} < 1 \\implies \\lim = 1}_{\\text{Squeeze Theorem — foundational, no circularity}} \\qquad \\underbrace{\\frac{d/dx\\,\\sin x}{d/dx\\, x}\\bigg|_0 = \\frac{\\cos 0}{1} = 1}_{\\text{L'Hôpital — confirmatory, circular here}}",
      note: "Both are valid mathematical reasoning — but only the squeeze theorem proof is logically independent. The L'Hôpital proof confirms the answer after the fact. This distinction matters enormously for building reliable mathematical understanding.",
      why: {
        tag: "Is there a non-circular L'Hôpital proof of lim(sin x/x)?",
        explanation: "Yes — if you define sin x via its Taylor series: sin x = x − x³/3! + x⁵/5! − …, then sin x/x = 1 − x²/3! + x⁴/5! − …, and the limit as x→0 is 1, independently of the geometric definition. Under this approach, d/dx[sin x] = cos x is proved from the series, which doesn't require lim(sin x/x) = 1. No circularity. But the series approach requires knowing what Taylor series are — a later topic.",
        why: null,
      },
    },
    {
      id: 7, tag: "Conclusion",
      tc: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
      instruction: "L'Hôpital's Rule is a powerful shortcut — but it rests on the same foundations as everything else.",
      math: "\\lim_{x\\to a}\\frac{f(x)}{g(x)} \\stackrel{\\scriptscriptstyle 0/0 \\text{ or } \\infty/\\infty}{=} \\lim_{x\\to a}\\frac{f'(x)}{g'(x)}",
      note: "The rule is a theorem — not an axiom. It is proved from Cauchy's MVT, which is proved from Rolle's Theorem, which is proved from the Extreme Value Theorem, which requires completeness of ℝ. There is no shortcut that avoids the foundations.",
      why: {
        tag: "Full dependency chain",
        explanation: "The proof structure for L'Hôpital:",
        steps: [
          { text: "L'Hôpital's Rule  ← the theorem" },
          { text: "↳ Cauchy's Mean Value Theorem" },
          { text: "↳ Rolle's Theorem" },
          { text: "↳ Extreme Value Theorem (continuous function on closed interval attains extrema)" },
          { text: "↳ Completeness of ℝ (bounded monotone sequences converge)" },
          { text: "↳ Limit Quotient Law (for the ratio of limits)" },
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

export default function LHopitalProof({ params = {} }) {
  const [step, setStep] = useState(0);
  const ready = useMath();
  const steps = PROOF.steps;
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "18px 22px", marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--color-text-tertiary)", marginBottom: 4 }}>Proof · L'Hôpital's Rule</div>
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
