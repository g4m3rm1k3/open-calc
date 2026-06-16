/**
 * RecursiveProofStepper.jsx
 * Drop into: src/components/viz/react/RecursiveProofStepper.jsx
 * Register:  VizFrame.jsx → RecursiveProofStepper: lazy(() => import('./react/RecursiveProofStepper.jsx'))
 *
 * A GPS-style "step-by-step with infinite Why?" proof component.
 * Each step has an instruction, the math, and a recursive why chain
 * the student can drill into as deep as they need.
 *
 * Data shape:
 *   { id, tag, instruction, math, note?, why?: { title, explanation, math?, why?: {...} } }
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─── KaTeX ────────────────────────────────────────────────────────────────────
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

function MathRenderer({ tex, display = false, ready }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ready || !ref.current || !window.katex || !tex) return;
    try { window.katex.render(tex, ref.current, { throwOnError: false, displayMode: display }); }
    catch (_) { if (ref.current) ref.current.textContent = tex; }
  }, [tex, display, ready]);
  if (!tex) return null;
  return <span ref={ref} style={{ display: display ? "block" : "inline" }} />;
}

// ─── Recursive Why Panel ──────────────────────────────────────────────────────
function WhyPanel({ why, depth = 0, ready }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;

  const indent = depth * 16;
  const hues = [
    { bg: "var(--color-background-secondary)", border: "#6366f1", tag: "#6366f1", tagBg: "#eef2ff" },
    { bg: "var(--color-background-primary)",   border: "#0891b2", tag: "#0891b2", tagBg: "#ecfeff" },
    { bg: "var(--color-background-secondary)", border: "#059669", tag: "#059669", tagBg: "#ecfdf5" },
    { bg: "var(--color-background-primary)",   border: "#d97706", tag: "#d97706", tagBg: "#fffbeb" },
    { bg: "var(--color-background-secondary)", border: "#9ca3af", tag: "#6b7280", tagBg: "#f9fafb" },
  ];
  const h = hues[Math.min(depth, hues.length - 1)];
  const depthLabels = ["Why?", "But why?", "Prove it", "From scratch", "Axioms"];
  const depthLabel = depthLabels[Math.min(depth, depthLabels.length - 1)];

  return (
    <div style={{ marginLeft: indent, marginTop: 10 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: open ? h.tagBg : "transparent",
          border: `1px solid ${h.border}`,
          borderRadius: 6, padding: "4px 12px",
          fontSize: 12, fontWeight: 500,
          color: h.border, cursor: "pointer",
          fontFamily: "var(--font-sans)",
          transition: "all 0.15s",
        }}
      >
        <span style={{
          display: "inline-block", width: 14, height: 14,
          lineHeight: "14px", textAlign: "center",
          borderRadius: "50%", background: h.border, color: "#fff",
          fontSize: 10, fontWeight: 700, flexShrink: 0,
        }}>
          {open ? "−" : "?"}
        </span>
        {open ? `Close: ${why.title || depthLabel}` : (why.title || depthLabel)}
      </button>

      {open && (
        <div style={{
          marginTop: 8,
          background: h.bg,
          border: `1px solid ${h.border}22`,
          borderLeft: `3px solid ${h.border}`,
          borderRadius: "0 8px 8px 0",
          padding: "14px 16px",
          animation: "slideDown 0.18s ease-out",
        }}>
          {/* Layer badge */}
          <div style={{
            display: "inline-block",
            background: h.tagBg, color: h.tag,
            fontSize: 10, fontWeight: 600,
            letterSpacing: "0.07em", textTransform: "uppercase",
            padding: "2px 8px", borderRadius: 4, marginBottom: 10,
            border: `0.5px solid ${h.border}44`,
          }}>
            {why.tag || depthLabel}
          </div>

          {/* Explanation text */}
          <p style={{
            fontSize: 14, lineHeight: 1.7,
            color: "var(--color-text-primary)",
            marginBottom: why.math ? 12 : 0,
          }}>
            {why.explanation}
          </p>

          {/* Optional math for this level */}
          {why.math && (
            <div style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: 8, padding: "12px 16px",
              textAlign: "center", overflowX: "auto",
              marginTop: 10, marginBottom: 2,
            }}>
              <MathRenderer tex={why.math} display ready={ready} />
            </div>
          )}

          {/* Optional numbered sub-steps */}
          {why.steps && why.steps.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {why.steps.map((st, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  marginBottom: 10,
                }}>
                  <div style={{
                    minWidth: 22, height: 22, borderRadius: "50%",
                    background: h.border, color: "#fff",
                    fontSize: 11, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 1,
                  }}>{i + 1}</div>
                  <div>
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--color-text-primary)", marginBottom: st.math ? 6 : 0 }}>
                      {st.text}
                    </p>
                    {st.math && (
                      <div style={{
                        background: "var(--color-background-secondary)",
                        borderRadius: 6, padding: "8px 12px",
                        textAlign: "center", overflowX: "auto", marginTop: 4,
                      }}>
                        <MathRenderer tex={st.math} display ready={ready} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recurse */}
          {why.why && (
            <WhyPanel why={why.why} depth={depth + 1} ready={ready} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Single top-level step ────────────────────────────────────────────────────
function ProofStep({ step, index, total, ready }) {
  const tagColors = {
    "Definition":   { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
    "Algebra":      { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
    "Limit Law":    { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
    "Recognition":  { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
    "Substitution": { bg: "#fefce8", text: "#854d0e", border: "#fef08a" },
    "Theorem":      { bg: "#f0f9ff", text: "#075985", border: "#bae6fd" },
    "Conclusion":   { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
  };
  const tc = tagColors[step.tag] || tagColors["Algebra"];

  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      {/* Step header bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 20px",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        background: "var(--color-background-secondary)",
      }}>
        {/* Step number */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "var(--color-text-primary)", color: "var(--color-background-primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 600, flexShrink: 0,
        }}>
          {index + 1}
        </div>
        {/* Tag pill */}
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.07em",
          textTransform: "uppercase", padding: "3px 10px", borderRadius: 20,
          background: tc.bg, color: tc.text, border: `0.5px solid ${tc.border}`,
        }}>
          {step.tag}
        </span>
        {/* Progress */}
        <span style={{
          marginLeft: "auto", fontSize: 12,
          color: "var(--color-text-tertiary)",
        }}>
          {index + 1} of {total}
        </span>
      </div>

      {/* Instruction */}
      <div style={{ padding: "18px 20px 0" }}>
        <p style={{
          fontSize: 16, fontWeight: 500, lineHeight: 1.55,
          color: "var(--color-text-primary)", marginBottom: 16,
        }}>
          {step.instruction}
        </p>

        {/* Main math display */}
        <div style={{
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 10, padding: "20px 16px",
          textAlign: "center", overflowX: "auto",
          fontSize: 18,
          marginBottom: 12,
        }}>
          <MathRenderer tex={step.math} display ready={ready} />
        </div>

        {/* Optional note */}
        {step.note && (
          <p style={{
            fontSize: 13, color: "var(--color-text-secondary)",
            lineHeight: 1.6, fontStyle: "italic",
            marginBottom: 10,
            paddingLeft: 12,
            borderLeft: "2px solid var(--color-border-secondary)",
          }}>
            {step.note}
          </p>
        )}

        {/* Why chain */}
        <div style={{ paddingBottom: 18 }}>
          <WhyPanel why={step.why} depth={0} ready={ready} />
        </div>
      </div>
    </div>
  );
}

// ─── Proof data — h(x) = sin(x³), prove h′(a) = cos(a³)·3a² ─────────────────
const PROOF = {
  title: "Differentiating h(x) = sin(x³) from First Principles",
  problem: "h'(a) = \\lim_{x \\to a} \\frac{\\sin(x^3) - \\sin(a^3)}{x - a} = \\ ?",
  preamble: "We will prove h′(a) = cos(a³)·3a² using only the definition of the derivative — no Chain Rule assumed. Each step introduces exactly one idea. Click Why? at any step to drill down.",
  steps: [
    {
      id: 1,
      tag: "Definition",
      instruction: "Write h′(a) as a limit using the definition of the derivative.",
      math: "h'(a) = \\lim_{x \\to a} \\frac{h(x) - h(a)}{x - a} = \\lim_{x \\to a} \\frac{\\sin(x^3) - \\sin(a^3)}{x - a}",
      note: "We are not using any differentiation rules yet. This limit IS the definition of the derivative — everything else must be derived from it.",
      why: {
        tag: "Limit Definition",
        title: "What is a derivative, really?",
        explanation: "The derivative h′(a) measures the instantaneous rate of change of h at the point a. We define it as the limit of average rates of change over smaller and smaller intervals [a, x] as x approaches a.",
        math: "h'(a) = \\lim_{x \\to a} \\frac{h(x) - h(a)}{x - a}",
        why: {
          tag: "Why a limit?",
          title: "Why can't we just compute (h(x)−h(a))/(x−a) at x=a directly?",
          explanation: "At x = a exactly, the difference quotient becomes (h(a)−h(a))/(a−a) = 0/0, which is undefined. The limit asks: what value does this ratio approach as x gets arbitrarily close to a, without ever equaling a? That approaching value is the derivative.",
          math: "\\frac{h(a)-h(a)}{a-a} = \\frac{0}{0} \\quad \\leftarrow \\text{undefined, not zero}",
          why: {
            tag: "0/0 and Limits",
            title: "What does 0/0 actually mean?",
            explanation: "The expression 0/0 is called an indeterminate form — it doesn't have a fixed value. Depending on how the numerator and denominator approach 0, the ratio could approach any number, or even infinity, or fail to exist. The limit process examines the ratio's behavior near the point, bypassing the singularity at the point itself.",
            why: null,
          },
        },
      },
    },

    {
      id: 2,
      tag: "Algebra",
      instruction: "Multiply and divide by (x³ − a³) — a strategic form of the number 1.",
      math: "= \\lim_{x \\to a} \\frac{\\sin(x^3) - \\sin(a^3)}{x^3 - a^3} \\cdot \\frac{x^3 - a^3}{x - a}",
      note: "The expression (x³−a³)/(x³−a³) = 1, so we haven't changed the value. But we have changed the structure in a way that will let us recognize two hidden derivatives.",
      why: {
        tag: "Algebra Trick",
        title: "Why multiply by (x³−a³)/(x³−a³)?",
        explanation: "The original limit has sin(x³)−sin(a³) in the numerator and (x−a) in the denominator. The 'inside' of the sine (x³) and the 'outside denominator' (x−a) don't match. We need to introduce the expression x³−a³ to bridge them — it matches the inside of sine, AND it factors against (x−a).",
        why: {
          tag: "The Goal",
          title: "What are we trying to produce?",
          explanation: "We want to split this into two limits. The first will be (sin(x³)−sin(a³))/(x³−a³), which we'll recognize as the derivative of sin at x³. The second will be (x³−a³)/(x−a), which is the derivative of x³ at a. But to split them, both pieces must exist as separate limits — which requires the Limit Product Law.",
          why: {
            tag: "Limit Product Law",
            title: "Why can we split a limit into a product?",
            explanation: "The Limit Product Law states: if lim f(x) = L and lim g(x) = M (both existing and finite), then lim[f(x)·g(x)] = L·M. This is a theorem, not an axiom — it must be proved from the ε-δ definition of limits. It tells us splitting is valid provided both limits exist.",
            math: "\\lim_{x\\to a}[f(x)\\cdot g(x)] = \\lim_{x\\to a}f(x) \\cdot \\lim_{x\\to a}g(x)",
            why: {
              tag: "ε-δ Proof Sketch",
              title: "How is the Product Law proved?",
              explanation: "Write f(x)g(x) − LM = f(x)(g(x)−M) + M(f(x)−L). Apply the triangle inequality: |f(x)g(x)−LM| ≤ |f(x)|·|g(x)−M| + |M|·|f(x)−L|. Since f is bounded near a (differentiability implies continuity implies boundedness), and both |g(x)−M| and |f(x)−L| can be made arbitrarily small, the whole expression can be made < ε.",
              why: null,
            },
          },
        },
      },
    },

    {
      id: 3,
      tag: "Limit Law",
      instruction: "Apply the Limit Product Law to separate into two independent limits.",
      math: "= \\underbrace{\\lim_{x \\to a} \\frac{\\sin(x^3) - \\sin(a^3)}{x^3 - a^3}}_{\\text{Limit A}} \\cdot \\underbrace{\\lim_{x \\to a} \\frac{x^3 - a^3}{x - a}}_{\\text{Limit B}}",
      note: "Now we have two separate jobs. Limit B looks exactly like a derivative definition. Limit A needs a variable substitution to reveal what it is.",
      why: {
        tag: "Limit Product Law",
        title: "Is it always legal to split a limit like this?",
        explanation: "Only when both individual limits exist and are finite. If one of the limits were infinite, or failed to exist, you could not split them. Here, Limit A = cos(a³) (we'll show this) and Limit B = 3a² — both finite, so the split is valid.",
        why: {
          tag: "Why does this matter?",
          title: "What's wrong with skipping straight to the answer?",
          explanation: "If you write 'derivative of sin(x³) = cos(x³)·3x² by the Chain Rule' without proving it, you've assumed the conclusion. In rigorous mathematics — and in building real understanding — every equality sign must be justified by a named law or definition. Here, each = sign corresponds to a specific theorem.",
          why: null,
        },
      },
    },

    {
      id: 4,
      tag: "Recognition",
      instruction: "Recognize Limit B: it's the definition of d/dx[x³] evaluated at x = a.",
      math: "\\lim_{x \\to a} \\frac{x^3 - a^3}{x - a} = \\left.\\frac{d}{dx}\\, x^3\\right|_{x=a} = 3a^2",
      note: "The pattern f(x)−f(a) / (x−a) as x→a is precisely the definition of f′(a). Here f(x) = x³, so this limit is the derivative of x³ at x = a.",
      why: {
        tag: "Power Rule",
        title: "Why does d/dx[x³] = 3x²?",
        explanation: "Apply the limit definition directly to f(x) = x³. The key is expanding (x+h)³ using the Binomial Theorem, which tells us exactly which terms survive after cancellation.",
        math: "\\frac{d}{dx}x^3 = \\lim_{h\\to 0}\\frac{(x+h)^3 - x^3}{h}",
        steps: [
          { text: "Expand (x+h)³ using the Binomial Theorem:", math: "(x+h)^3 = x^3 + 3x^2h + 3xh^2 + h^3" },
          { text: "Subtract x³ and divide by h — x³ cancels exactly:", math: "\\frac{3x^2h + 3xh^2 + h^3}{h} = 3x^2 + 3xh + h^2" },
          { text: "Take the limit as h→0 — all terms with h vanish:", math: "\\lim_{h\\to 0}(3x^2 + 3xh + h^2) = 3x^2" },
        ],
        why: {
          tag: "Binomial Theorem",
          title: "Why does (x+h)³ expand that way?",
          explanation: "(a+b)ⁿ = Σ C(n,k) aⁿ⁻ᵏ bᵏ. The coefficient C(3,1) = 3 is the number of ways to pick exactly one copy of h from three factors (x+h)(x+h)(x+h). The coefficient 3 in '3x²h' is a counting result — it comes from combinatorics, not just algebra.",
          math: "(x+h)^3 = \\binom{3}{0}x^3 + \\binom{3}{1}x^2h + \\binom{3}{2}xh^2 + \\binom{3}{3}h^3",
          why: {
            tag: "Combinatorics",
            title: "Why is C(3,1) = 3?",
            explanation: "C(n,k) = n! / (k!(n−k)!) counts the ways to choose k items from n without regard to order. C(3,1) = 3!/1!2! = 6/2 = 3. Concretely: when expanding (x+h)(x+h)(x+h), you can choose h from the 1st, 2nd, or 3rd factor — exactly 3 ways. That is why the coefficient of x²h is 3.",
            why: null,
          },
        },
      },
    },

    {
      id: 5,
      tag: "Substitution",
      instruction: "Evaluate Limit A using the substitution u = x³. As x→a, we have u→a³.",
      math: "\\lim_{x \\to a} \\frac{\\sin(x^3) - \\sin(a^3)}{x^3 - a^3} = \\lim_{u \\to a^3} \\frac{\\sin(u) - \\sin(a^3)}{u - a^3} = \\left.\\frac{d}{du}\\sin u\\right|_{u=a^3}",
      note: "Setting u = x³ re-labels the variable. Since x³ is a continuous function of x, as x→a we get u = x³ → a³ continuously — the substitution is valid.",
      why: {
        tag: "Substitution Validity",
        title: "Why is substituting u = x³ in a limit valid?",
        explanation: "A limit substitution u = g(x) is valid when g is continuous at a. Continuity means: as x→a, g(x)→g(a). Since x³ is continuous everywhere (it's a polynomial), x→a guarantees x³→a³. After substitution, the limit variable changes from x→a to u→a³.",
        why: {
          tag: "Continuity of Polynomials",
          title: "Why is x³ continuous?",
          explanation: "A polynomial p(x) = xⁿ is continuous at every point a because lim_{x→a} xⁿ = aⁿ. This follows from the ε-δ definition: |xⁿ − aⁿ| can be made arbitrarily small by making |x−a| small — the Binomial Theorem gives an explicit bound.",
          why: null,
        },
      },
    },

    {
      id: 6,
      tag: "Theorem",
      instruction: "Evaluate d/du[sin u] at u = a³. This requires the angle addition formula and the squeeze theorem.",
      math: "\\left.\\frac{d}{du}\\sin u\\right|_{u=a^3} = \\cos(a^3)",
      note: "This is the deepest part of the proof. d/du[sin u] = cos u is itself a theorem that depends on two things: the angle addition identity for sine, and the fundamental limit lim(sin h/h) = 1.",
      why: {
        tag: "Sine Derivative",
        title: "Prove that d/du[sin u] = cos u from the definition.",
        explanation: "Apply the limit definition to f(u) = sin u. The proof requires expanding sin(u+h) — which forces us to use the angle addition formula.",
        math: "\\frac{d}{du}\\sin u = \\lim_{h\\to 0}\\frac{\\sin(u+h) - \\sin u}{h}",
        steps: [
          { text: "Expand sin(u+h) using the angle addition formula:", math: "\\sin(u+h) = \\sin u \\cos h + \\cos u \\sin h" },
          { text: "Substitute and group:", math: "= \\lim_{h\\to 0}\\left[\\sin u \\cdot\\frac{\\cos h - 1}{h} + \\cos u \\cdot\\frac{\\sin h}{h}\\right]" },
          { text: "Apply the two fundamental trig limits (see Why below):", math: "= \\sin u \\cdot 0 \\;+\\; \\cos u \\cdot 1 = \\cos u" },
        ],
        why: {
          tag: "Angle Addition",
          title: "Why does sin(u+h) = sin u cos h + cos u sin h?",
          explanation: "This is the angle addition identity for sine. It comes from the geometry of the unit circle — specifically, from computing the same chord length two different ways (using the Pythagorean theorem and using rotational symmetry). It is not algebraically obvious and must be proved geometrically.",
          steps: [
            { text: "Place two unit vectors at angles u and u+h on the unit circle. Their coordinates are (cos u, sin u) and (cos(u+h), sin(u+h))." },
            { text: "The squared distance between them equals (cos(u+h)−cos u)² + (sin(u+h)−sin u)² by the Pythagorean theorem." },
            { text: "By rotational symmetry of the circle, this distance depends only on the arc h between them — same as the distance from (1,0) to (cos h, sin h), which equals 2−2cos h." },
            { text: "Expanding and equating the two distance formulas forces: cos(u+h) = cos u cos h − sin u sin h, and differentiation or a π/2 shift gives the sine formula." },
          ],
          why: {
            tag: "Two Trig Limits",
            title: "How do we know lim(sin h/h) = 1 and lim((cos h−1)/h) = 0?",
            explanation: "These two limits are the foundation of all trig calculus. The first is proved by the Squeeze Theorem using a geometric area argument on the unit circle. The second follows from the first by algebra.",
            steps: [
              { text: "For 0 < h < π/2, compare three areas on the unit circle:", math: "\\tfrac{1}{2}\\sin h < \\tfrac{1}{2}h < \\tfrac{1}{2}\\tan h" },
              { text: "Dividing through by ½ sin h and taking reciprocals:", math: "\\cos h < \\frac{\\sin h}{h} < 1" },
              { text: "As h→0, cos h→1 and 1→1. By the Squeeze Theorem:", math: "\\lim_{h\\to 0}\\frac{\\sin h}{h} = 1" },
              { text: "For the second limit, multiply by (cos h+1)/(cos h+1):", math: "\\frac{\\cos h - 1}{h} = \\frac{\\cos^2 h - 1}{h(\\cos h+1)} = \\frac{-\\sin^2 h}{h(\\cos h+1)} = -\\frac{\\sin h}{h}\\cdot\\frac{\\sin h}{\\cos h+1} \\to -1 \\cdot 0 = 0" },
            ],
            why: {
              tag: "Squeeze Theorem",
              title: "What is the Squeeze Theorem and why does it apply here?",
              explanation: "The Squeeze Theorem: if g(x) ≤ f(x) ≤ k(x) near a, and lim g(x) = lim k(x) = L, then lim f(x) = L. It applies here because (sin h)/h is sandwiched between cos h and 1 — two functions that both approach 1 as h→0. The theorem is proved from the ε-δ definition: if f is within ε of L on both sides, it must be within ε of L.",
              why: {
                tag: "Why Radians?",
                title: "Why does the area argument require radians?",
                explanation: "The sector area formula Area = ½r²θ = ½θ (for r=1) holds only when θ is measured in radians. By definition, one radian is the angle that subtends an arc of length 1 on a unit circle. If you used degrees, θ would need a factor of π/180, and you'd get lim(sin h/h) = π/180 instead of 1. All derivatives of trig functions would pick up this constant factor — which is why calculus always uses radians.",
                why: null,
              },
            },
          },
        },
      },
    },

    {
      id: 7,
      tag: "Conclusion",
      instruction: "Multiply the two limits together to produce the final answer.",
      math: "h'(a) = \\underbrace{\\cos(a^3)}_{\\text{Limit A}} \\cdot \\underbrace{3a^2}_{\\text{Limit B}} = \\cos(a^3) \\cdot 3a^2",
      note: "The Chain Rule has now emerged from first principles. We never applied a rule — we watched it develop from the definition of the derivative, algebra, and the geometry of the unit circle.",
      why: {
        tag: "What just happened?",
        title: "Why did the Chain Rule appear without us using it?",
        explanation: "The Chain Rule says d/dx[f(g(x))] = f′(g(x))·g′(x). We got exactly: [d/du sin u evaluated at u=a³] × [d/dx x³ evaluated at x=a] = cos(a³)·3a². The structure of the chain rule isn't a formula to memorize — it's the inevitable consequence of how composite functions interact with limit-based derivatives.",
        why: {
          tag: "The Full Dependency Chain",
          title: "What was the complete dependency hierarchy of this proof?",
          explanation: "Every step in this proof rested on a lower layer. The full chain from top to bottom:",
          steps: [
            { text: "h′(a) = cos(a³)·3a²  ← this theorem" },
            { text: "Depends on: Limit Product Law, definition of derivative" },
            { text: "Depends on: Power Rule (via Binomial Theorem), d/du[sin u] = cos u" },
            { text: "Depends on: Angle Addition Formula (geometric), lim(sin h/h) = 1" },
            { text: "Depends on: Squeeze Theorem, unit circle geometry, radian measure" },
            { text: "Depends on: Real number completeness, the ε-δ definition of limits, order axioms" },
          ],
          why: null,
        },
      },
    },
  ],
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RecursiveProofStepper({ params = {} }) {
  const [currentStep, setCurrentStep] = useState(0);
  const ready = useMath();
  const steps = PROOF.steps;
  const total = steps.length;
  const step = steps[currentStep];

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "0.5rem 0", maxWidth: 740 }}>

      {/* ── Global style injection ── */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Problem statement header ── */}
      <div style={{
        background: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 12, padding: "18px 22px", marginBottom: 20,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 600, textTransform: "uppercase",
          letterSpacing: "0.1em", color: "var(--color-text-tertiary)",
          marginBottom: 6,
        }}>
          Proof — First Principles
        </div>
        <div style={{
          fontSize: 16, fontWeight: 500, color: "var(--color-text-primary)",
          marginBottom: 14, lineHeight: 1.45,
        }}>
          {PROOF.title}
        </div>
        <div style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 8, padding: "14px 16px",
          textAlign: "center", overflowX: "auto", marginBottom: 12,
        }}>
          <MathRenderer tex={PROOF.problem} display ready={ready} />
        </div>
        <p style={{
          fontSize: 13, color: "var(--color-text-secondary)",
          lineHeight: 1.65, marginBottom: 0,
        }}>
          {PROOF.preamble}
        </p>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {steps.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrentStep(i)}
            style={{
              flex: 1, height: 5, borderRadius: 3, cursor: "pointer",
              background: i < currentStep
                ? "var(--color-text-tertiary)"
                : i === currentStep
                  ? "var(--color-text-primary)"
                  : "var(--color-border-tertiary)",
              transition: "background 0.2s",
              transform: i === currentStep ? "scaleY(1.4)" : "scaleY(1)",
            }}
          />
        ))}
      </div>

      {/* ── Active step ── */}
      <div style={{ marginBottom: 16 }}>
        <ProofStep
          key={step.id}
          step={step}
          index={currentStep}
          total={total}
          ready={ready}
        />
      </div>

      {/* ── Navigation ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <button
          onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          style={{ flex: 1 }}
        >
          ← Previous step
        </button>
        <span style={{
          fontSize: 12, color: "var(--color-text-tertiary)",
          minWidth: 72, textAlign: "center",
        }}>
          Step {currentStep + 1} / {total}
        </span>
        <button
          onClick={() => setCurrentStep(s => Math.min(total - 1, s + 1))}
          disabled={currentStep === total - 1}
          style={{ flex: 1 }}
        >
          Next step →
        </button>
      </div>

    </div>
  );
}