/**
 * TaylorSeriesProof.jsx
 * src/components/viz/react/TaylorSeriesProof.jsx
 *
 * Problem: Derive eˣ = 1 + x + x²/2! + x³/3! + … with error bounds
 * Shows where every coefficient comes from, why the series converges,
 * and connects to Euler's formula e^(iπ) + 1 = 0
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
  title: "Taylor Series: eˣ = 1 + x + x²/2! + x³/3! + …",
  subtitle: "Where every coefficient comes from — and how this leads to e^(iπ) + 1 = 0",
  problem: "e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots",
  preamble: "A Taylor series approximates a function using an infinite polynomial. Every coefficient is determined by the derivatives of the function at a single point. We derive the series for eˣ from scratch, prove it converges everywhere, and show the connection to Euler's most beautiful formula.",
  steps: [
    {
      id: 1, tag: "The Idea",
      tc: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
      instruction: "Suppose eˣ could be written as an infinite polynomial: eˣ = a₀ + a₁x + a₂x² + a₃x³ + … We want to find the coefficients aₙ.",
      math: "e^x = a_0 + a_1 x + a_2 x^2 + a_3 x^3 + \\cdots = \\sum_{n=0}^{\\infty} a_n x^n",
      note: "This is an assumption — we're guessing the form and will determine the coefficients. The proof that this representation actually works requires showing the series converges to eˣ (not just any value). We do that in Step 5.",
      why: {
        tag: "Why would any function be expressible as an infinite polynomial?",
        explanation: "Not all functions can be. A function must be infinitely differentiable (smooth everywhere, with no corners or kinks) and must equal the limit of its Taylor polynomials. Functions like eˣ, sin x, cos x satisfy this — they're called analytic functions. Functions like |x| (which has a corner at 0) do not have valid Taylor series at the corner.",
        why: {
          tag: "What's the difference between a Taylor polynomial and a Taylor series?",
          explanation: "A Taylor polynomial is a finite approximation: Tₙ(x) = a₀ + a₁x + … + aₙxⁿ. It's accurate near x = 0 but drifts away farther out. A Taylor series is the infinite limit: T(x) = lim_{n→∞} Tₙ(x). If this limit equals f(x), we say f is analytic. The series is exact, not approximate — at every x in the radius of convergence.",
          why: null,
        },
      },
    },
    {
      id: 2, tag: "Find the Coefficients",
      tc: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
      instruction: "Differentiate both sides n times, then evaluate at x = 0. Each differentiation reveals one coefficient.",
      math: "f(x) = e^x \\implies f^{(n)}(0) = e^0 = 1 \\quad \\text{for all } n",
      note: "The special property of eˣ is that it equals its own derivative. So every derivative at x = 0 equals 1. This is what makes the Taylor series for eˣ so clean.",
      why: {
        tag: "Walk me through the differentiation procedure for one coefficient.",
        explanation: "Start with the polynomial form: f(x) = a₀ + a₁x + a₂x² + a₃x³ + …",
        steps: [
          { text: "Set x = 0: f(0) = a₀. So a₀ = f(0) = e⁰ = 1." },
          { text: "Differentiate once: f′(x) = a₁ + 2a₂x + 3a₃x² + … Set x = 0: f′(0) = a₁. So a₁ = f′(0) = 1." },
          { text: "Differentiate again: f″(x) = 2a₂ + 6a₃x + … Set x = 0: f″(0) = 2a₂. So a₂ = f″(0)/2 = 1/2." },
          { text: "Differentiate again: f‴(x) = 6a₃ + … Set x = 0: f‴(0) = 6a₃. So a₃ = f‴(0)/6 = 1/6 = 1/3!." },
          { text: "Pattern: aₙ = f⁽ⁿ⁾(0) / n! because differentiating xⁿ n times gives n!, leaving aₙ·n! = f⁽ⁿ⁾(0)." },
        ],
        why: {
          tag: "Why does differentiating xⁿ exactly n times give n!?",
          explanation: "Applying the power rule repeatedly: d/dx[xⁿ] = nxⁿ⁻¹, d²/dx²[xⁿ] = n(n−1)xⁿ⁻², …, dⁿ/dxⁿ[xⁿ] = n(n−1)(n−2)···2·1 = n!. The constant n! is exactly the factorial of n — the product of all integers from 1 to n.",
          math: "\\frac{d^n}{dx^n}[x^n] = n! \\qquad \\text{(applying power rule } n \\text{ times)}",
          why: {
            tag: "What is n! and where does it come from?",
            explanation: "n! (n factorial) = n·(n−1)·(n−2)·…·2·1. It counts the number of ways to arrange n distinct objects in order. 0! = 1 by convention (there is exactly one way to arrange nothing). Factorials grow extremely fast: 10! = 3,628,800.",
            steps: [
              { text: "0! = 1, 1! = 1, 2! = 2, 3! = 6, 4! = 24, 5! = 120, 6! = 720" },
              { text: "n! appears in the denominator of Taylor series because differentiating xⁿ n times produces n! in the numerator, and we divide to isolate the coefficient aₙ." },
            ],
            why: null,
          },
        },
      },
    },
    {
      id: 3, tag: "Write the Series",
      tc: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
      instruction: "Since aₙ = 1/n! for all n (because all derivatives of eˣ at 0 equal 1), write out the full series.",
      math: "e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\frac{x^4}{4!} + \\cdots = \\sum_{n=0}^{\\infty}\\frac{x^n}{n!}",
      note: "The denominators 1, 1, 2, 6, 24, 120, … are the factorials. They grow so fast that they overwhelm any power of x — which is why this series converges for all x.",
      why: {
        tag: "Check: does this give e¹ = e ≈ 2.718?",
        explanation: "Plug in x = 1: e = 1 + 1 + 1/2 + 1/6 + 1/24 + 1/120 + … = 1 + 1 + 0.5 + 0.1667 + 0.0417 + 0.0083 + … The partial sums: 2, 2.5, 2.667, 2.708, 2.717, 2.7181… converging to e ≈ 2.71828. ✓",
        steps: [
          { text: "n=0: 1/0! = 1. Running sum: 1" },
          { text: "n=1: 1/1! = 1. Running sum: 2" },
          { text: "n=2: 1/2! = 0.5. Running sum: 2.5" },
          { text: "n=3: 1/3! ≈ 0.1667. Running sum: 2.6667" },
          { text: "n=4: 1/4! ≈ 0.0417. Running sum: 2.7083" },
          { text: "n=5: 1/5! ≈ 0.0083. Running sum: 2.7167" },
          { text: "n=10: sum ≈ 2.71828. Already accurate to 5 decimal places." },
        ],
        why: null,
      },
    },
    {
      id: 4, tag: "Integration by Substitution",
      tc: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
      instruction: "Verify by differentiation: if eˣ = Σ xⁿ/n!, then d/dx[eˣ] should equal eˣ itself.",
      math: "\\frac{d}{dx}\\sum_{n=0}^{\\infty}\\frac{x^n}{n!} = \\sum_{n=1}^{\\infty}\\frac{nx^{n-1}}{n!} = \\sum_{n=1}^{\\infty}\\frac{x^{n-1}}{(n-1)!} = \\sum_{m=0}^{\\infty}\\frac{x^m}{m!} = e^x \\checkmark",
      note: "The series is self-reproducing under differentiation — just like eˣ itself. This confirms the series representation is consistent.",
      why: {
        tag: "Walk through the index substitution step.",
        explanation: "After differentiating, the sum starts at n=1 (the n=0 term differentiates to 0). We have Σ_{n=1}^∞ x^(n-1)/(n-1)!. Let m = n−1 (so n = m+1). When n=1, m=0. When n=∞, m=∞. The sum becomes Σ_{m=0}^∞ x^m/m! — which is exactly the original series.",
        steps: [
          { text: "Before: Σ_{n=1}^∞ x^(n-1)/(n-1)!" },
          { text: "Substitute m = n−1. Then n−1 = m and (n−1)! = m!." },
          { text: "New bounds: n=1 → m=0, n=∞ → m=∞." },
          { text: "After: Σ_{m=0}^∞ x^m/m! = eˣ. ✓" },
        ],
        why: {
          tag: "Can we differentiate a series term-by-term?",
          explanation: "Yes — for power series within their radius of convergence. This is a theorem: if Σ aₙxⁿ converges on (−R, R), then its derivative is Σ n·aₙxⁿ⁻¹, also convergent on (−R, R). The eˣ series converges for all x (R = ∞), so term-by-term differentiation is always valid.",
          why: null,
        },
      },
    },
    {
      id: 5, tag: "Convergence",
      tc: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
      instruction: "Prove the series converges for all x using the Ratio Test.",
      math: "\\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_n}\\right| = \\lim_{n\\to\\infty}\\frac{|x|^{n+1}/(n+1)!}{|x|^n/n!} = \\lim_{n\\to\\infty}\\frac{|x|}{n+1} = 0 < 1",
      note: "The Ratio Test: if the limit of |a_{n+1}/aₙ| < 1, the series converges absolutely. Since the limit is 0 < 1 for every fixed x, the eˣ series converges absolutely for all real x — and all complex x.",
      why: {
        tag: "What is the Ratio Test and why does it work?",
        explanation: "The Ratio Test compares a series to a geometric series. If |a_{n+1}/aₙ| → L < 1, the terms shrink at least as fast as a geometric series with ratio L — which we know converges. If L > 1, terms grow and the series diverges. If L = 1, the test is inconclusive.",
        why: {
          tag: "Why do factorials beat any power of x?",
          explanation: "For any fixed x, the ratio |x|/(n+1) → 0 as n → ∞. No matter how large x is, n+1 will eventually exceed it. n! grows faster than xⁿ for any fixed x. This is why every term |x|ⁿ/n! eventually decreases to 0, and the series converges.",
          steps: [
            { text: "For x = 1000: the ratio |x|/(n+1) = 1000/(n+1). When n = 1000, ratio = 1000/1001 ≈ 1. When n = 2000, ratio = 1000/2001 ≈ 0.5. Eventually → 0." },
            { text: "For x = 10⁶: same story, just takes longer. n! wins eventually for any finite x." },
          ],
          why: null,
        },
      },
    },
    {
      id: 6, tag: "Euler's Formula",
      tc: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
      instruction: "Substitute x = iθ (imaginary input) into the eˣ series. Use i² = −1 to separate real and imaginary parts.",
      math: "e^{i\\theta} = \\cos\\theta + i\\sin\\theta \\qquad \\Longrightarrow \\qquad e^{i\\pi} + 1 = 0",
      note: "This is Euler's formula — often called the most beautiful equation in mathematics. It connects e, i, π, 1, and 0 in a single identity. The proof is a direct consequence of the Taylor series for eˣ, sin x, and cos x.",
      why: {
        tag: "Show the derivation of e^(iθ) = cos θ + i sin θ.",
        explanation: "Substitute x = iθ into the eˣ series and group real and imaginary terms.",
        steps: [
          { text: "e^(iθ) = 1 + (iθ) + (iθ)²/2! + (iθ)³/3! + (iθ)⁴/4! + …" },
          { text: "Powers of i: i⁰=1, i¹=i, i²=−1, i³=−i, i⁴=1, then repeats.", math: "i^0=1,\\; i^1=i,\\; i^2=-1,\\; i^3=-i,\\; i^4=1,\\; \\ldots" },
          { text: "Substitute:", math: "e^{i\\theta} = 1 + i\\theta - \\frac{\\theta^2}{2!} - i\\frac{\\theta^3}{3!} + \\frac{\\theta^4}{4!} + i\\frac{\\theta^5}{5!} - \\cdots" },
          { text: "Group real terms (no i): 1 − θ²/2! + θ⁴/4! − … = cos θ (Taylor series for cosine)" },
          { text: "Group imaginary terms (factor out i): i(θ − θ³/3! + θ⁵/5! − …) = i·sin θ" },
          { text: "Therefore: e^(iθ) = cos θ + i sin θ. Setting θ = π: e^(iπ) = cos π + i sin π = −1 + 0 = −1. So e^(iπ) + 1 = 0. ✓" },
        ],
        why: {
          tag: "Why does the Taylor series work for complex inputs?",
          explanation: "The eˣ series Σ xⁿ/n! converges absolutely for all complex x by the same Ratio Test argument — |x| can be complex, but |xⁿ/n!| still goes to 0 as n→∞. The series defines eˣ for complex x consistently with all the algebraic properties of the real exponential.",
          why: null,
        },
      },
    },
    {
      id: 7, tag: "Conclusion",
      tc: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
      instruction: "The Taylor series is both a computational tool and a bridge between areas of mathematics.",
      math: "e^x = \\sum_{n=0}^{\\infty}\\frac{x^n}{n!}, \\quad \\cos x = \\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n}}{(2n)!}, \\quad \\sin x = \\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n+1}}{(2n+1)!}",
      note: "These three series, combined through Euler's formula, reveal that exponentials and trig functions are secretly the same thing — just viewed from different angles (literally). This is one of the deepest unifications in all of mathematics.",
      why: {
        tag: "Full dependency chain",
        explanation: "The proof structure for Taylor series of eˣ:",
        steps: [
          { text: "eˣ = Σ xⁿ/n!  ← the theorem" },
          { text: "↳ Coefficients determined by: aₙ = f⁽ⁿ⁾(0)/n!" },
          { text: "↳ Power Rule applied n times: d^n/dx^n[xⁿ] = n!" },
          { text: "↳ d/dx[eˣ] = eˣ (defining property of e, or proved via limits)" },
          { text: "↳ Convergence: Ratio Test (factorials grow faster than any power)" },
          { text: "↳ Term-by-term differentiation (valid within radius of convergence)" },
          { text: "↳ Euler's formula: substitute x = iθ, use i² = −1, group real/imaginary" },
          { text: "↳ Complex number arithmetic, field axioms, definition of convergence in ℂ" },
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

export default function TaylorSeriesProof({ params = {} }) {
  const [step, setStep] = useState(0);
  const ready = useMath();
  const steps = PROOF.steps;
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "18px 22px", marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--color-text-tertiary)", marginBottom: 4 }}>Proof · Taylor Series</div>
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
