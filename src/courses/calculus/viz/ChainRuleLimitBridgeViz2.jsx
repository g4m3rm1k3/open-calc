/**
 * ChainRuleLimitBridgeViz.jsx
 * src/components/viz/react/ChainRuleLimitBridgeViz.jsx
 * Register: VizFrame.jsx → ChainRuleLimitBridgeViz: lazy(() => import('./react/ChainRuleLimitBridgeViz.jsx'))
 *
 * Walks through the exact sin(x³) chain rule proof shown in the textbook image.
 * Every step has: instruction + math + note + infinitely nestable Why buttons.
 * Numeric examples verify every non-obvious algebraic claim before stating it.
 * Final step shows full dependency chain.
 *
 * Adopts the ImplicitDiffProof standard:
 *   - WhyPanel nesting (Why? → But why? → Prove it → From scratch → Axioms)
 *   - Numeric verification before every abstract claim
 *   - Four-slot step structure: instruction + math + note + why
 *   - Semantic color coding per step type
 *   - Dependency chain as final step
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

const DEPTH_STYLES = [
  { border: "#6366f1", tagBg: "#eef2ff", tagText: "#4338ca", panelBg: "var(--color-background-secondary)" },
  { border: "#0891b2", tagBg: "#ecfeff", tagText: "#0e7490", panelBg: "var(--color-background-primary)" },
  { border: "#059669", tagBg: "#ecfdf5", tagText: "#047857", panelBg: "var(--color-background-secondary)" },
  { border: "#d97706", tagBg: "#fffbeb", tagText: "#b45309", panelBg: "var(--color-background-primary)" },
  { border: "#9ca3af", tagBg: "#f9fafb", tagText: "#6b7280", panelBg: "var(--color-background-secondary)" },
];
const DEPTH_BTN_LABELS = ["Why?", "But why?", "Prove it", "From scratch", "Axioms"];

function WhyPanel({ why, depth = 0, ready }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
  const d = DEPTH_STYLES[Math.min(depth, DEPTH_STYLES.length - 1)];
  const btnLabel = why.tag || DEPTH_BTN_LABELS[Math.min(depth, DEPTH_BTN_LABELS.length - 1)];

  return (
    <div style={{ marginLeft: depth * 14, marginTop: 10 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: open ? d.tagBg : "transparent",
          border: `1px solid ${d.border}`,
          borderRadius: 6, padding: "4px 12px",
          fontSize: 12, fontWeight: 500, color: d.border,
          cursor: "pointer", fontFamily: "var(--font-sans)",
        }}
      >
        <span style={{
          width: 15, height: 15, borderRadius: "50%", background: d.border,
          color: "#fff", fontSize: 10, fontWeight: 700,
          display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>{open ? "−" : "?"}</span>
        {open ? "Close" : btnLabel}
      </button>

      {open && (
        <div style={{
          marginTop: 8, padding: "14px 16px",
          background: d.panelBg,
          border: `0.5px solid ${d.border}22`,
          borderLeft: `3px solid ${d.border}`,
          borderRadius: "0 8px 8px 0",
          animation: "slideDown .18s ease-out",
        }}>
          <span style={{
            display: "inline-block", fontSize: 10, fontWeight: 600,
            letterSpacing: "0.07em", textTransform: "uppercase",
            padding: "2px 8px", borderRadius: 4, marginBottom: 10,
            background: d.tagBg, color: d.tagText, border: `0.5px solid ${d.border}44`,
          }}>
            {why.tag || DEPTH_BTN_LABELS[Math.min(depth, DEPTH_BTN_LABELS.length - 1)]}
          </span>

          <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-text-primary)", marginBottom: why.math || why.steps ? 12 : 0 }}>
            {why.explanation}
          </p>

          {why.math && (
            <div style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: 8, padding: "12px 16px",
              textAlign: "center", overflowX: "auto", marginBottom: 8,
            }}>
              <M t={why.math} display ready={ready} />
            </div>
          )}

          {why.steps && (
            <div style={{ marginTop: 10 }}>
              {why.steps.map((st, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <div style={{
                    minWidth: 22, height: 22, borderRadius: "50%", background: d.border,
                    color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{i + 1}</div>
                  <div>
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--color-text-primary)", marginBottom: st.math ? 5 : 0 }}>
                      {st.text}
                    </p>
                    {st.math && (
                      <div style={{
                        background: "var(--color-background-secondary)",
                        borderRadius: 6, padding: "8px 12px",
                        textAlign: "center", overflowX: "auto", marginTop: 4,
                      }}>
                        <M t={st.math} display ready={ready} />
                      </div>
                    )}
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

// ─── Proof data ─────────────────────────────────────────────────────────────
const PROOF = {
  title: "The Chain Rule: h(x) = sin(x³)",
  subtitle: "Prove that h′(x) = cos(x³) · 3x²",
  problem: "h(x) = \\sin(x^3) \\qquad \\Longrightarrow \\qquad h'(x) = \\cos(x^3) \\cdot 3x^2",
  preamble: "This is the exact proof your textbook shows — but every non-obvious move is explained, and every algebraic claim is verified with a number before you're asked to believe it. The two key surprises: (1) multiplying by (x³−a³)/(x³−a³) splits a hard limit into two recognisable pieces, and (2) each piece turns out to be a derivative in disguise.",

  steps: [
    {
      id: 1,
      tag: "Setup",
      tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
      instruction: "Write h′(a) using the limit definition of the derivative. This is where every derivative starts.",
      math: "h'(a) = \\lim_{x \\to a} \\frac{h(x) - h(a)}{x - a} = \\lim_{x \\to a} \\frac{\\sin(x^3) - \\sin(a^3)}{x - a}",
      note: "We use the 'two-point' form of the derivative: slope between (a, h(a)) and (x, h(x)) as x → a. This is identical to the difference quotient (f(x+h)−f(x))/h — just written with two named points instead.",
      why: {
        tag: "Limit definition of derivative — what is this?",
        explanation: "The derivative h′(a) is the instantaneous rate of change of h at x = a. We measure it by computing the average rate of change over a shrinking interval and seeing where it converges.",
        math: "h'(a) = \\lim_{x \\to a} \\frac{h(x) - h(a)}{x - a}",
        steps: [
          { text: "Numerically: let h(x) = sin(x³) and a = 1. At x = 1.1: [sin(1.1³) − sin(1)] / (1.1 − 1) = [sin(1.331) − sin(1)] / 0.1 ≈ [0.9735 − 0.8415] / 0.1 ≈ 1.32." },
          { text: "At x = 1.01: [sin(1.030301) − sin(1)] / 0.01 ≈ [0.8580 − 0.8415] / 0.01 ≈ 1.65." },
          { text: "At x = 1.001: ≈ 1.620. At x = 1.0001: ≈ 1.621. The limit is converging to h′(1) = cos(1³)·3(1²) = cos(1)·3 ≈ 1.621. ✓" },
        ],
        why: {
          tag: "Why does this formula give the instantaneous rate?",
          explanation: "[h(x) − h(a)] / (x − a) is the slope of the secant line through (a, h(a)) and (x, h(x)). As x → a, the second point slides along the curve toward the first. In the limit, the secant becomes the tangent — and the slope of the tangent is the derivative.",
          why: null,
        },
      },
    },

    {
      id: 2,
      tag: "The Key Move",
      tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
      instruction: "Multiply and divide by (x³ − a³). This looks strange — why would we do this? The answer: it splits one hard limit into a product of two limits, each of which we can recognise.",
      math: "h'(a) = \\lim_{x \\to a} \\frac{\\sin(x^3) - \\sin(a^3)}{x^3 - a^3} \\cdot \\frac{x^3 - a^3}{x - a}",
      note: "Multiplying by (x³−a³)/(x³−a³) = 1 changes nothing mathematically. It is a deliberate algebraic trick to reveal structure that was hidden.",
      why: {
        tag: "Why multiply by 1 in this specific form?",
        explanation: "We want to turn the single fraction [sin(x³)−sin(a³)]/(x−a) into something we recognise. The expression (x³−a³)/(x−a) is a pattern we know — it is the difference quotient for f(x) = x³, which converges to f′(a) = 3a² as x → a. By inserting it as a factor, we create two separate limits both of which we can evaluate.",
        steps: [
          { text: "Original: [sin(x³) − sin(a³)] / (x − a). This involves the change in sin(x³) relative to the change in x. Hard to recognise directly." },
          { text: "After multiplication: [sin(x³) − sin(a³)] / (x³ − a³) · (x³ − a³) / (x − a). Same value — we multiplied by 1." },
          { text: "The second factor (x³ − a³)/(x − a) is immediately recognisable as the derivative of x³ at a. The first factor becomes the derivative of sin at a³ after substitution. Two separate, solvable limits." },
        ],
        why: {
          tag: "How do you know to use (x³−a³)/(x³−a³) and not something else?",
          explanation: "Because h(x) = sin(x³) is a composition: sin applied to x³. The chain rule says the derivative is the product of two derivatives — one for the outer function (sin), one for the inner function (x³). The algebraic trick recreates exactly those two derivatives as separate factors. The choice of what to multiply by is guided by the structure of the composition.",
          why: {
            tag: "What is the Chain Rule?",
            explanation: "If h(x) = f(g(x)), then h′(x) = f′(g(x)) · g′(x). The derivative of a composition is the outer derivative (evaluated at the inner function) times the inner derivative. Here: outer = sin, inner = x³. So h′(x) = cos(x³) · 3x². The proof below verifies this from first principles.",
            why: null,
          },
        },
      },
    },

    {
      id: 3,
      tag: "Split the Limit",
      tagStyle: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
      instruction: "Since both factors converge separately, the limit of the product equals the product of the limits.",
      math: "h'(a) = \\underbrace{\\lim_{x \\to a} \\frac{\\sin(x^3) - \\sin(a^3)}{x^3 - a^3}}_{\\text{Factor 1}} \\cdot \\underbrace{\\lim_{x \\to a} \\frac{x^3 - a^3}{x - a}}_{\\text{Factor 2}}",
      note: "This step requires the Limit Product Rule: lim[f·g] = lim[f] · lim[g] when both limits exist. Both factors here do have limits — we will find them in the next two steps.",
      why: {
        tag: "Why can we split lim[A·B] into lim[A] · lim[B]?",
        explanation: "The Limit Product Rule states: if lim(x→a) f(x) = L and lim(x→a) g(x) = M, then lim(x→a) [f(x)·g(x)] = L·M. This is a theorem proved from the epsilon-delta definition of limits.",
        steps: [
          { text: "Numerical check with a = 1, x = 1.01:" },
          { text: "Factor 1 at x = 1.01: [sin(1.030301) − sin(1)] / (1.030301 − 1) ≈ 0.01649 / 0.030301 ≈ 0.5442." },
          { text: "Factor 2 at x = 1.01: (1.030301 − 1) / (1.01 − 1) ≈ 0.030301 / 0.01 ≈ 3.0301." },
          { text: "Product: 0.5442 × 3.0301 ≈ 1.649. Compare to h′(1) ≈ 1.621. ✓ (The approximation improves as x → 1.)" },
        ],
        why: {
          tag: "Proof of the Limit Product Rule",
          explanation: "The intuition: if f(x) ≈ L and g(x) ≈ M for x near a, then f(x)·g(x) ≈ L·M. Making this precise uses the triangle inequality and the epsilon-delta definition of limits. The full proof is in any calculus textbook (typically section 2.3 or equivalent).",
          why: null,
        },
      },
    },

    {
      id: 4,
      tag: "Factor 2 — recognise a derivative",
      tagStyle: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
      instruction: "Evaluate the second factor. It matches the limit definition of a derivative exactly — for f(x) = x³ at x = a.",
      math: "\\lim_{x \\to a} \\frac{x^3 - a^3}{x - a} = \\frac{d}{dx}(x^3)\\bigg|_{x=a} = 3a^2",
      note: "Pattern recognition: [f(x) − f(a)] / (x − a) as x → a is the definition of f′(a). Here f(x) = x³, so the limit is f′(a) = 3a². No algebraic manipulation needed — just recognise the pattern.",
      why: {
        tag: "How do I know this limit equals 3a²?",
        explanation: "The difference quotient definition: f′(a) = lim(x→a) [f(x) − f(a)] / (x − a). Here f(x) = x³ and f(a) = a³, so the expression is exactly [x³ − a³] / (x − a). Its limit is f′(a) = 3a² by the power rule.",
        steps: [
          { text: "Verify algebraically: x³ − a³ = (x − a)(x² + ax + a²). So [x³ − a³]/(x − a) = x² + ax + a². As x → a: a² + a·a + a² = 3a². ✓" },
          { text: "Verify numerically at a = 2, x = 2.01: (2.01³ − 2³)/(2.01 − 2) = (8.120601 − 8)/0.01 = 12.0601 ≈ 12 = 3(2²). ✓" },
          { text: "This is not a coincidence — it is exactly the definition of the derivative of x³ at a." },
        ],
        why: {
          tag: "Why is recognising the derivative pattern the key skill here?",
          explanation: "The whole proof strategy depends on seeing that certain limits ARE derivatives in disguise. The algebraic trick in Step 2 was designed to create two factors that match the derivative pattern. A student who doesn't recognise [f(x)−f(a)]/(x−a) as f′(a) will not understand why the proof works — they will just see algebra that somehow produces the right answer.",
          why: null,
        },
      },
    },

    {
      id: 5,
      tag: "Factor 1 — substitution u = x³",
      tagStyle: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
      instruction: "The first factor also hides a derivative — but only after a substitution. Let u = x³. As x → a, what does u approach?",
      math: "\\text{As } x \\to a: \\quad u = x^3 \\to a^3 \\quad \\text{(since }x^3\\text{ is continuous)}",
      note: "Continuity means small changes in input produce small changes in output. Since x³ is continuous, x approaching a forces x³ to approach a³. This makes the substitution valid.",
      why: {
        tag: "Why does x → a imply x³ → a³?",
        explanation: "f(x) = x³ is a polynomial, and all polynomials are continuous everywhere. Continuity at x = a means: lim(x→a) f(x) = f(a). So lim(x→a) x³ = a³. This is not trivial — it requires continuity.",
        steps: [
          { text: "Numerical check at a = 2, x = 2.001: x³ = 2.001³ = 8.006003001. And a³ = 8. The difference is 0.006003001, which → 0 as x → 2. ✓" },
          { text: "What if f were not continuous? If f had a jump discontinuity at a, then x → a would NOT imply f(x) → f(a). The continuity of x³ is crucial here." },
        ],
        why: {
          tag: "What does continuity mean precisely?",
          explanation: "f is continuous at a if: (1) f(a) exists, (2) lim(x→a) f(x) exists, and (3) they are equal: lim(x→a) f(x) = f(a). For x³, all three conditions hold at every point. This is what allows the substitution u = x³ in a limit.",
          why: null,
        },
      },
    },

    {
      id: 6,
      tag: "Factor 1 — recognise the second derivative",
      tagStyle: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
      instruction: "After substituting u = x³, the first factor becomes the limit definition of the derivative of sin(u) at u = a³.",
      math: "\\lim_{x \\to a} \\frac{\\sin(x^3) - \\sin(a^3)}{x^3 - a^3} = \\lim_{u \\to a^3} \\frac{\\sin(u) - \\sin(a^3)}{u - a^3} = \\frac{d}{du}(\\sin u)\\bigg|_{u=a^3} = \\cos(a^3)",
      note: "The substitution u = x³ converts the limit variable from x (approaching a) to u (approaching a³). The resulting expression [sin(u) − sin(a³)] / (u − a³) is exactly the derivative of sin at u = a³ — which equals cos(a³).",
      why: {
        tag: "Why does the substitution convert the limit correctly?",
        explanation: "A substitution u = g(x) in a limit is valid when g is continuous and g(a) = L (the target value). Here g(x) = x³, which is continuous, and g(a) = a³ — so the limit as x → a becomes the limit as u → a³. This is the Change of Variables theorem for limits.",
        steps: [
          { text: "Before substitution: lim(x→a) [sin(x³) − sin(a³)] / (x³ − a³)." },
          { text: "Let u = x³. As x → a, u → a³. Replace x³ with u everywhere: lim(u→a³) [sin(u) − sin(a³)] / (u − a³)." },
          { text: "This is the definition of d/du[sin(u)] at u = a³ = cos(a³). ✓" },
        ],
        why: {
          tag: "How do we know d/du[sin(u)] = cos(u)?",
          explanation: "From the limit definition: d/du[sin(u)] = lim(h→0) [sin(u+h) − sin(u)] / h. Using the angle addition formula sin(u+h) = sin(u)cos(h) + cos(u)sin(h) and the known limits lim(h→0) sin(h)/h = 1 and lim(h→0) (cos(h)−1)/h = 0, this simplifies to cos(u). This proof is in the trig identities chapter.",
          why: null,
        },
      },
    },

    {
      id: 7,
      tag: "Assemble",
      tagStyle: { bg: "#f0f9ff", text: "#0c4a6e", border: "#bae6fd" },
      instruction: "Multiply the two limits together to get h′(a).",
      math: "h'(a) = \\cos(a^3) \\cdot 3a^2",
      note: "In function notation: h′(x) = cos(x³) · 3x². This is exactly the Chain Rule result: outer derivative cos(x³) (with inner argument preserved) times inner derivative 3x².",
      why: {
        tag: "Why does this match the Chain Rule formula?",
        explanation: "Chain Rule: if h(x) = f(g(x)), then h′(x) = f′(g(x)) · g′(x). Here f(u) = sin(u), g(x) = x³. So f′(u) = cos(u), evaluated at u = g(x) = x³: f′(g(x)) = cos(x³). And g′(x) = 3x². Product: cos(x³) · 3x². The limit proof just derived this rigorously from the definition.",
        steps: [
          { text: "Verify numerically at a = 1: h′(1) = cos(1³) · 3(1²) = cos(1) · 3 ≈ 0.5403 · 3 ≈ 1.621." },
          { text: "From Step 1, the numerical limit converged to ≈ 1.621. ✓" },
          { text: "The formula and the limit agree — the proof is correct." },
        ],
        why: null,
      },
    },

    {
      id: 8,
      tag: "Dependency Chain",
      tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
      instruction: "Every step in this proof relied on something proved earlier. Here is the full intellectual stack.",
      math: "h'(x) = \\cos(x^3) \\cdot 3x^2",
      note: "When you understand this chain, you understand why the proof had to go this way — and why a textbook that just states the chain rule without this derivation is leaving out the scaffolding.",
      why: {
        tag: "Show me the full dependency chain",
        explanation: "Here is every concept this proof rested on:",
        steps: [
          { text: "h′(x) = cos(x³) · 3x²  ← the result" },
          { text: "↳ Limit Product Rule: lim[A·B] = lim[A] · lim[B]  ← Step 3" },
          { text: "↳ Limit definition of derivative: lim[f(x)−f(a)]/(x−a) = f′(a)  ← Steps 4 and 6" },
          { text: "↳ Derivative of x³ is 3x²  ← power rule (Factor 2)" },
          { text: "↳ Derivative of sin(u) is cos(u)  ← proved from angle addition + squeeze theorem (Factor 1)" },
          { text: "↳ Continuity of x³ allows substitution u = x³  ← Step 5" },
          { text: "↳ The algebraic trick (multiply by (x³−a³)/(x³−a³))  ← motivates the split into two factors" },
          { text: "↳ All of this ultimately rests on: the epsilon-delta definition of limits, field axioms of real numbers, and the angle addition formulas for sin and cos." },
        ],
        why: {
          tag: "What does this teach about how proofs work generally?",
          explanation: "A proof is a chain of reductions: we transform what we want to prove into things we already know are true. The chain rule proof starts with something we don't know (the derivative of sin(x³)) and reduces it to two things we do know (derivatives of x³ and sin). Every non-obvious step is a reduction — either recognising a known pattern or using a known theorem. Understanding a proof means understanding every reduction in the chain.",
          why: null,
        },
      },
    },
  ],
};

function ProofStep({ step, idx, total, ready }) {
  const tc = step.tagStyle;
  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: 12, overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,.04)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 20px",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        background: "var(--color-background-secondary)",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "var(--color-text-primary)", color: "var(--color-background-primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 600, flexShrink: 0,
        }}>{idx + 1}</div>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase",
          padding: "3px 10px", borderRadius: 20,
          background: tc.bg, color: tc.text, border: `0.5px solid ${tc.border}`,
        }}>{step.tag}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-text-tertiary)" }}>
          {idx + 1} of {total}
        </span>
      </div>

      <div style={{ padding: "18px 20px 0" }}>
        <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.55, color: "var(--color-text-primary)", marginBottom: 16 }}>
          {step.instruction}
        </p>

        <div style={{
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 10, padding: "20px 16px",
          textAlign: "center", overflowX: "auto", fontSize: 18, marginBottom: 12,
        }}>
          <M t={step.math} display ready={ready} />
        </div>

        {step.note && (
          <p style={{
            fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6,
            fontStyle: "italic", paddingLeft: 12,
            borderLeft: "2px solid var(--color-border-secondary)", marginBottom: 10,
          }}>{step.note}</p>
        )}

        <div style={{ paddingBottom: 18 }}>
          <WhyPanel why={step.why} depth={0} ready={ready} />
        </div>
      </div>
    </div>
  );
}

export default function ChainRuleLimitBridgeViz2({ params = {} }) {
  const [step, setStep] = useState(0);
  const ready = useMath();
  const steps = PROOF.steps;

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{
        background: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 12, padding: "18px 22px", marginBottom: 20,
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--color-text-tertiary)", marginBottom: 4 }}>
          Proof · Chain Rule
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 4 }}>
          {PROOF.title}
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 14 }}>
          {PROOF.subtitle}
        </div>
        <div style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 8, padding: "14px 16px", textAlign: "center", overflowX: "auto", marginBottom: 12,
        }}>
          <M t={PROOF.problem} display ready={ready} />
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
          {PROOF.preamble}
        </p>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {steps.map((s, i) => (
          <div key={i} onClick={() => setStep(i)} style={{
            flex: 1, height: 5, borderRadius: 3, cursor: "pointer",
            background: i < step
              ? "var(--color-text-tertiary)"
              : i === step
                ? "var(--color-text-primary)"
                : "var(--color-border-tertiary)",
            transform: i === step ? "scaleY(1.4)" : "scaleY(1)",
            transition: "background .2s",
          }} />
        ))}
      </div>

      {/* Active step */}
      <div style={{ marginBottom: 16 }}>
        <ProofStep key={steps[step].id} step={steps[step]} idx={step} total={steps.length} ready={ready} />
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            flex: 1, padding: "8px 16px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
            background: "transparent", color: step === 0 ? "var(--color-text-tertiary)" : "var(--color-text-secondary)",
            cursor: step === 0 ? "not-allowed" : "pointer", fontSize: 14,
          }}
        >
          ← Previous
        </button>
        <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", minWidth: 72, textAlign: "center" }}>
          {step + 1} / {steps.length}
        </span>
        <button
          onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
          disabled={step === steps.length - 1}
          style={{
            flex: 1, padding: "8px 16px", borderRadius: 8,
            border: "0.5px solid var(--color-border-info)",
            background: step === steps.length - 1 ? "transparent" : "var(--color-background-info)",
            color: step === steps.length - 1 ? "var(--color-text-tertiary)" : "var(--color-text-info)",
            cursor: step === steps.length - 1 ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 500,
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
