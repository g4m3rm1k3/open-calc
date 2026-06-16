/**
 * FundamentalTheoremProof.jsx
 * src/components/viz/react/FundamentalTheoremProof.jsx
 * Register: VizFrame.jsx → FundamentalTheoremProof: lazy(() => import('./react/FundamentalTheoremProof.jsx'))
 *
 * Problem: Prove d/dx[∫₀ˣ f(t) dt] = f(x)
 * The most important theorem in calculus — almost nobody knows why it's true.
 * Dependency chain: Riemann sums → MVT for integrals → IVT → completeness of ℝ
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
  title: "The Fundamental Theorem of Calculus",
  subtitle: "Why d/dx[∫₀ˣ f(t) dt] = f(x) — proved from first principles",
  problem: "F(x) = \\int_0^x f(t)\\,dt \\quad\\Longrightarrow\\quad F'(x) = f(x)",
  preamble: "The FTC says: differentiating an accumulation function gives back the original function. This is not obvious — it connects two entirely different ideas (area and slope). The proof uses the Mean Value Theorem for Integrals, which itself rests on the Intermediate Value Theorem, which rests on the completeness of the real numbers.",
  steps: [
    {
      id: 1, tag: "Setup",
      tc: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
      instruction: "Define the accumulation function F(x) = ∫₀ˣ f(t) dt. This is the signed area under f from 0 to x.",
      math: "F(x) = \\int_0^x f(t)\\,dt",
      note: "F(x) is a function of x — the upper limit is the variable. F(2) is the area from 0 to 2, F(3) is the area from 0 to 3, and so on. The dummy variable t is just a placeholder — it disappears after integration.",
      why: {
        tag: "What is ∫₀ˣ f(t) dt exactly?",
        explanation: "The definite integral ∫ₐᵇ f(t) dt is the signed area between the curve y = f(t) and the t-axis, from t = a to t = b. It is defined as the limit of Riemann sums — adding up the areas of infinitely many thin rectangles.",
        math: "\\int_a^b f(t)\\,dt = \\lim_{n\\to\\infty} \\sum_{k=1}^n f(t_k)\\,\\Delta t \\quad \\text{where } \\Delta t = \\frac{b-a}{n}",
        why: {
          tag: "Why a limit of sums? Why not just 'the area'?",
          explanation: "We can't compute area under a curve directly — a curve has no width. Instead, we approximate with n thin rectangles of width Δt = (b−a)/n and height f(tₖ). As n→∞, the rectangles get infinitely thin and the sum approaches the exact area. This limit is the Riemann integral.",
          why: {
            tag: "Why does this limit exist?",
            explanation: "For any continuous function f on [a,b], the Riemann sums converge — this is a theorem, not an assumption. The proof uses the completeness of the real numbers: bounded monotone sequences converge. Completeness is what separates ℝ from ℚ — without it, limits might not land anywhere.",
            why: null,
          },
        },
      },
    },
    {
      id: 2, tag: "Definition",
      tc: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
      instruction: "Write F′(x) using the limit definition of the derivative.",
      math: "F'(x) = \\lim_{h \\to 0} \\frac{F(x+h) - F(x)}{h} = \\lim_{h \\to 0} \\frac{\\displaystyle\\int_0^{x+h} f(t)\\,dt - \\int_0^x f(t)\\,dt}{h}",
      note: "We apply the derivative definition to F. The numerator is the difference of two accumulation functions — which simplifies using an integral property.",
      why: {
        tag: "Why does F(x+h) − F(x) = ∫ₓˣ⁺ʰ f(t) dt?",
        explanation: "The additivity property of integrals: ∫₀ˣ⁺ʰ = ∫₀ˣ + ∫ₓˣ⁺ʰ. So ∫₀ˣ⁺ʰ − ∫₀ˣ = ∫ₓˣ⁺ʰ. Geometrically: the area from 0 to x+h minus the area from 0 to x equals the area in the thin strip from x to x+h.",
        math: "\\int_0^{x+h} f(t)\\,dt - \\int_0^x f(t)\\,dt = \\int_x^{x+h} f(t)\\,dt",
        why: {
          tag: "Prove the integral additivity property",
          explanation: "For any a < c < b: ∫ₐᵇ f = ∫ₐᶜ f + ∫ᶜᵇ f. This follows directly from the definition of the Riemann sum: splitting the interval [a,b] at c just splits the sum of rectangles into two sub-sums. The limit of the whole equals the sum of the limits of the parts.",
          why: null,
        },
      },
    },
    {
      id: 3, tag: "Key Step",
      tc: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
      instruction: "Simplify: F(x+h) − F(x) = ∫ₓˣ⁺ʰ f(t) dt. The limit becomes the derivative of this thin-strip area.",
      math: "F'(x) = \\lim_{h \\to 0} \\frac{1}{h}\\int_x^{x+h} f(t)\\,dt",
      note: "The numerator is the area of a thin strip from x to x+h under the curve f. As h→0, this strip becomes infinitely narrow. The question is: what is the area of an infinitely thin strip divided by its width?",
      why: {
        tag: "Geometrically — what is this limit asking?",
        explanation: "∫ₓˣ⁺ʰ f(t) dt is the area of a thin vertical strip under f, of width h. Dividing by h gives the average height of f over that strip. As h→0, the strip shrinks to a single vertical line at x — and the average height approaches f(x) itself.",
        steps: [
          { text: "Think of a rectangle: area = width × height, so height = area / width." },
          { text: "The strip area ≈ f(c)·h for some c between x and x+h (by MVT for integrals, proved below)." },
          { text: "So (1/h)·∫ₓˣ⁺ʰ f(t) dt = f(c), and as h→0, c→x, so f(c)→f(x) by continuity." },
        ],
        why: {
          tag: "What is the Mean Value Theorem for Integrals?",
          explanation: "MVT for Integrals: if f is continuous on [x, x+h], then there exists a point c in (x, x+h) such that ∫ₓˣ⁺ʰ f(t) dt = f(c)·h. In other words, there is always a rectangle of width h and height f(c) whose area exactly equals the curved area.",
          math: "\\exists\\, c \\in (x,\\, x+h) :\\quad \\int_x^{x+h} f(t)\\,dt = f(c)\\cdot h",
          why: {
            tag: "Prove the MVT for Integrals",
            explanation: "Since f is continuous on [x, x+h], it has a minimum m and maximum M on that interval. So m·h ≤ ∫ₓˣ⁺ʰ f(t) dt ≤ M·h, which gives m ≤ (1/h)∫ₓˣ⁺ʰ f ≤ M. The average value lies between the min and max. By the Intermediate Value Theorem, f must take every value between m and M — in particular, it must equal the average (1/h)∫ at some point c.",
            why: {
              tag: "What is the Intermediate Value Theorem?",
              explanation: "IVT: if f is continuous on [a,b] and k is any value between f(a) and f(b), then there exists c in (a,b) with f(c) = k. Intuitively: a continuous function can't jump over a value — it must pass through every value in between.",
              why: {
                tag: "Why does continuity guarantee this? (Completeness of ℝ)",
                explanation: "The IVT fails for functions on ℚ (the rationals). For example, f(x) = x² − 2 satisfies f(1) < 0 and f(2) > 0, but f(c) = 0 requires c = √2 which is irrational — so over ℚ, the IVT fails. Over ℝ, completeness (every bounded set has a least upper bound) guarantees √2 exists and f hits every value. The IVT, MVT, and FTC all ultimately depend on completeness of ℝ.",
                why: null,
              },
            },
          },
        },
      },
    },
    {
      id: 4, tag: "Apply MVT for Integrals",
      tc: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
      instruction: "Apply the Mean Value Theorem for Integrals: the thin-strip area equals f(c)·h for some c between x and x+h.",
      math: "\\frac{1}{h}\\int_x^{x+h} f(t)\\,dt = \\frac{f(c) \\cdot h}{h} = f(c) \\quad \\text{for some } c \\in (x,\\, x+h)",
      note: "The h cancels exactly — because the rectangle f(c)·h has h in both numerator and denominator. Now we need to take the limit as h→0.",
      why: {
        tag: "The h/h cancellation — show this with numbers first",
        explanation: "If the strip area = f(c)·h, then (1/h)·f(c)·h = f(c)·(h/h) = f(c)·1 = f(c). The h cancels because it appears in both the numerator (as part of the area formula) and the denominator (from the derivative definition).",
        steps: [
          { text: "Number example: (1/3)·(7·3) = (1/3)·21 = 7. Or: 7·3/3 = 7. The 3 cancels. ✓" },
          { text: "Variable example: (1/h)·(f(c)·h) = f(c)·h/h = f(c)·1 = f(c). ✓" },
          { text: "This cancellation is valid as long as h ≠ 0, which is guaranteed in the limit (limits approach but don't reach the point)." },
        ],
        why: null,
      },
    },
    {
      id: 5, tag: "Take the Limit",
      tc: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
      instruction: "As h→0, the point c (which lies between x and x+h) is squeezed toward x. By continuity of f, f(c)→f(x).",
      math: "F'(x) = \\lim_{h\\to 0} f(c) = f(x) \\quad \\text{because } c \\to x \\text{ as } h \\to 0 \\text{ and } f \\text{ is continuous}",
      note: "This is where continuity of f is essential. If f had a jump at x, then f(c) might not approach f(x) even as c→x. The FTC requires f to be continuous.",
      why: {
        tag: "Why does c→x as h→0?",
        explanation: "c is squeezed between x and x+h. As h→0, both x and x+h approach x. By the Squeeze Theorem: x ≤ c ≤ x+h and both bounds approach x, so c→x. This is the Squeeze Theorem used on c itself — not on a limit of functions, but on a bound on the point c.",
        why: {
          tag: "Why does f(c)→f(x) when c→x?",
          explanation: "This is the definition of continuity: f is continuous at x means lim_{c→x} f(c) = f(x). If f were discontinuous at x — for example, a jump discontinuity — then f(c) might approach a different value than f(x) even as c gets arbitrarily close. The FTC conclusion F′(x) = f(x) holds at every point where f is continuous.",
          why: null,
        },
      },
    },
    {
      id: 6, tag: "Corollary",
      tc: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
      instruction: "The second part of the FTC: if F′ = f and f is continuous, then ∫ₐᵇ f(x) dx = F(b) − F(a).",
      math: "\\int_a^b f(x)\\,dx = F(b) - F(a) \\quad \\text{where } F'(x) = f(x)",
      note: "This is why antiderivatives let us compute integrals. The first part (proved above) showed that accumulation functions are antiderivatives. The second part says any antiderivative works — and the definite integral is just the difference of its values at the endpoints.",
      why: {
        tag: "Why does any antiderivative F give the same answer F(b) − F(a)?",
        explanation: "If G is another antiderivative of f, then (F − G)′ = f − f = 0. A function with zero derivative everywhere is constant: F − G = C for some constant C. So G(b) − G(a) = [F(b) − C] − [F(a) − C] = F(b) − F(a). The constant cancels — any antiderivative gives the same definite integral value.",
        why: {
          tag: "Prove: if h′(x) = 0 everywhere, then h is constant",
          explanation: "By the Mean Value Theorem: for any a < b, there exists c in (a,b) with h(b) − h(a) = h′(c)·(b−a) = 0·(b−a) = 0. So h(b) = h(a) for any a, b — meaning h is constant.",
          why: {
            tag: "The Mean Value Theorem (differentiation)",
            explanation: "MVT: if f is continuous on [a,b] and differentiable on (a,b), then there exists c in (a,b) with f′(c) = [f(b)−f(a)]/(b−a). The average rate of change equals the instantaneous rate at some interior point. This is proved using Rolle's Theorem, which is proved using the Extreme Value Theorem, which requires completeness of ℝ.",
            why: null,
          },
        },
      },
    },
    {
      id: 7, tag: "Conclusion",
      tc: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
      instruction: "The FTC unifies differentiation and integration — they are inverse operations.",
      math: "\\frac{d}{dx}\\int_0^x f(t)\\,dt = f(x) \\qquad \\text{and} \\qquad \\int_a^b f'(x)\\,dx = f(b) - f(a)",
      note: "These two equations are the same theorem, viewed from opposite directions. Differentiation undoes integration (Part 1). Integration undoes differentiation (Part 2). Before the FTC, computing areas and computing slopes were separate problems. The FTC revealed they are the same problem.",
      why: {
        tag: "Full dependency chain of this proof",
        explanation: "The deepest proof chain in all of Calc 1:",
        steps: [
          { text: "FTC: F′(x) = f(x)  ← the theorem" },
          { text: "↳ Limit definition of derivative" },
          { text: "↳ Integral additivity: ∫₀ˣ⁺ʰ − ∫₀ˣ = ∫ₓˣ⁺ʰ" },
          { text: "↳ Mean Value Theorem for Integrals" },
          { text: "↳ Intermediate Value Theorem" },
          { text: "↳ Continuity of f + Completeness of ℝ" },
          { text: "↳ Squeeze Theorem (for c→x)" },
          { text: "↳ Continuity of f (for f(c)→f(x))" },
          { text: "↳ Real number axioms: completeness, order, field" },
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

export default function FundamentalTheoremProof({ params = {} }) {
  const [step, setStep] = useState(0);
  const ready = useMath();
  const steps = PROOF.steps;
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "18px 22px", marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--color-text-tertiary)", marginBottom: 4 }}>Proof · Fundamental Theorem of Calculus</div>
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
