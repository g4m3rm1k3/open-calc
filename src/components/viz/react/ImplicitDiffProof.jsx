/**
 * ImplicitDiffProof.jsx
 * src/components/viz/react/ImplicitDiffProof.jsx
 * Register: VizFrame.jsx → ImplicitDiffProof: lazy(() => import('./react/ImplicitDiffProof.jsx'))
 *
 * Problem: x² + y² = r²  →  prove dy/dx = −x/y
 * Pedagogical chain: implicit functions → chain rule → algebra of equations
 *   → geometric meaning (tangent ⊥ radius)
 * Every algebra manipulation goes back to a numerical example first.
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
        {open ? `Close` : btnLabel}
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

// ─── Proof data ────────────────────────────────────────────────────────────
const PROOF = {
  title: "Implicit Differentiation: x² + y² = r²",
  subtitle: "Prove that dy/dx = −x/y along the circle",
  problem: "x^2 + y^2 = r^2 \\quad \\Longrightarrow \\quad \\frac{dy}{dx} = -\\frac{x}{y}",
  preamble: "This equation defines a circle of radius r. Unlike y = f(x), we cannot easily solve for y first — y appears in a square root with a ±. Implicit differentiation lets us find dy/dx without solving for y at all. Every algebra step is shown with a number example first.",
  steps: [
    {
      id: 1, tag: "Setup",
      tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
      instruction: "Understand what we're looking at. The equation x² + y² = r² does NOT give y as a function of x — it gives a relationship between x and y.",
      math: "x^2 + y^2 = r^2 \\qquad \\leftarrow \\text{a constraint, not a function}",
      note: "At any point (x, y) on the circle, y is secretly a function of x — but a two-valued one: y = +√(r²−x²) on top, y = −√(r²−x²) on bottom. Implicit differentiation works on either branch without us having to choose.",
      why: {
        tag: "What is an implicit function?",
        explanation: "An explicit function says y = (something in x) directly. An implicit equation gives a relationship F(x, y) = 0 where y's dependence on x is hidden. Here F(x,y) = x² + y² − r² = 0. The key idea: even though we can't write a clean formula for y, we can still ask 'if x changes a tiny bit, how much does y change?' That ratio dy/dx is the derivative.",
        why: {
          tag: "Why can't we just solve for y?",
          explanation: "We can — but it creates two branches: y = +√(r²−x²) and y = −√(r²−x²). Differentiating each branch separately works, but is messier and only applies to that branch. Implicit differentiation handles both branches in one calculation and extends to curves where solving for y is impossible (like x³ + y³ = 6xy).",
          why: null,
        },
      },
    },

    {
      id: 2, tag: "Key Idea",
      tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
      instruction: "Treat y as a function of x — write it as y(x) — even though we don't know its formula.",
      math: "x^2 + [y(x)]^2 = r^2",
      note: "This is the conceptual move that makes implicit differentiation work. y is not a constant — it changes with x. So [y(x)]² is a composite function: the outer function is u², the inner function is u = y(x).",
      why: {
        tag: "Why is y(x) a composite function?",
        explanation: "A composite function is one function applied to the result of another. Here: [y(x)]² means 'take y, then square it.' The outer function is f(u) = u², the inner function is u = y(x). This matters because to differentiate [y(x)]², we must use the Chain Rule — squaring a constant is different from squaring a changing function.",
        steps: [
          { text: "Constant case: if y = 5, then y² = 25 and d/dx[25] = 0. y doesn't change with x." },
          { text: "Function case: if y = y(x), then y² = [y(x)]² and the derivative requires the Chain Rule." },
          { text: "Chain Rule applied: d/dx[y²] = d/dy[y²] · dy/dx = 2y · dy/dx" },
        ],
        why: {
          tag: "The Chain Rule — why does it apply here?",
          explanation: "Chain Rule: d/dx[f(g(x))] = f′(g(x)) · g′(x). Here f(u) = u² and g(x) = y(x). So d/dx[(y(x))²] = 2·y(x) · y′(x) = 2y · dy/dx. The factor dy/dx is the derivative of the inner function y(x) with respect to x — which is exactly what we're solving for.",
          why: {
            tag: "Wasn't the Chain Rule proved earlier?",
            explanation: "Yes — in the sin(x³) proof, the Chain Rule emerged from first principles: write (f∘g)(x)−(f∘g)(a) / (x−a), multiply by (g(x)−g(a))/(g(x)−g(a)), take the limit. Both factors become derivatives. Here we're applying that proven theorem, not re-proving it.",
            why: null,
          },
        },
      },
    },

    {
      id: 3, tag: "Differentiate Both Sides",
      tagStyle: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
      instruction: "Differentiate both sides of the equation with respect to x. This is legal because both sides are equal — doing the same operation to equals preserves equality.",
      math: "\\frac{d}{dx}\\left[x^2 + y^2\\right] = \\frac{d}{dx}\\left[r^2\\right]",
      note: "r is a constant (the radius doesn't change with x), so d/dx[r²] = 0. We differentiate term by term on the left.",
      why: {
        tag: "Why can we differentiate both sides?",
        explanation: "If two expressions are equal — A = B — then they have the same value at every point. Applying any operation to both sides preserves the equality: f(A) = f(B). Differentiation is an operation. So d/dx[A] = d/dx[B]. This is the same principle as: if 2x = 10, you can divide both sides by 2 to get x = 5.",
        steps: [
          { text: "Numerical example: 3 + 4 = 7. Multiply both sides by 2: 6 + 8 = 14. ✓" },
          { text: "Equation example: x + 5 = 12. Subtract 5 from both sides: x = 7. Same operation, both sides." },
          { text: "Differentiation example: if f(x) = g(x) for all x, then f′(x) = g′(x) for all x where differentiable." },
        ],
        why: {
          tag: "Why does d/dx[r²] = 0?",
          explanation: "r is the radius of the circle — a fixed constant, not a function of x. The derivative of any constant is 0, because a constant doesn't change as x changes. Its rate of change is zero by definition.",
          math: "\\frac{d}{dx}[c] = \\lim_{h\\to 0}\\frac{c - c}{h} = \\lim_{h\\to 0}\\frac{0}{h} = 0",
          why: null,
        },
      },
    },

    {
      id: 4, tag: "Algebra",
      tagStyle: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
      instruction: "Apply the Sum Rule: differentiate x² and y² separately. Then apply the Chain Rule to y².",
      math: "\\frac{d}{dx}[x^2] + \\frac{d}{dx}[y^2] = 0 \\quad\\Longrightarrow\\quad 2x + 2y\\,\\frac{dy}{dx} = 0",
      note: "d/dx[x²] = 2x by the Power Rule. d/dx[y²] = 2y·(dy/dx) by the Chain Rule — y is a function of x, so its derivative brings the extra factor dy/dx.",
      why: {
        tag: "Why does d/dx[y²] = 2y·(dy/dx) and not just 2y?",
        explanation: "Because y is not x. The Power Rule says d/dx[x²] = 2x — the variable being differentiated IS x, so no Chain Rule needed. But y is a different variable that depends on x. Differentiating [y(x)]² requires the Chain Rule: bring down the exponent (2y) and multiply by the derivative of the inner function (dy/dx).",
        steps: [
          { text: "Compare: d/dx[x²] = 2x.  Here the outer function u² is applied to u = x. d/du[u²] = 2u, and du/dx = 1. So result = 2x·1 = 2x." },
          { text: "Now: d/dx[y²] where y = y(x). Outer function: u². Inner function: u = y(x). Chain Rule: 2u · du/dx = 2y · dy/dx." },
          { text: "The dy/dx term is non-negotiable whenever you differentiate any expression containing y with respect to x." },
        ],
        why: {
          tag: "Numerical example to make this concrete",
          explanation: "Let y = x³ (just as an example). Then y² = x⁶. d/dx[x⁶] = 6x⁵. Now use the formula: 2y·dy/dx = 2(x³)·(3x²) = 6x⁵. Same answer. The formula 2y·dy/dx is the Chain Rule working correctly.",
          math: "y = x^3 \\Rightarrow y^2 = x^6 \\Rightarrow \\frac{d}{dx}[y^2] = 6x^5 = 2y \\cdot \\frac{dy}{dx} = 2x^3 \\cdot 3x^2 \\checkmark",
          why: null,
        },
      },
    },

    {
      id: 5, tag: "Algebra",
      tagStyle: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
      instruction: "Isolate dy/dx. This is purely algebra — subtract 2x from both sides, then divide by 2y.",
      math: "2x + 2y\\,\\frac{dy}{dx} = 0 \\quad\\Longrightarrow\\quad 2y\\,\\frac{dy}{dx} = -2x \\quad\\Longrightarrow\\quad \\frac{dy}{dx} = -\\frac{x}{y}",
      note: "Treat dy/dx as a single unknown variable — the same way you'd solve 2x + 2y·m = 0 for m. The algebra is identical to linear equation solving.",
      why: {
        tag: "How do we 'solve for dy/dx'? Isn't it a derivative, not a number?",
        explanation: "dy/dx is the derivative — but in this equation, it's the unknown we want. After differentiating, dy/dx appears as a term (multiplied by 2y). We isolate it using ordinary algebra. Think of dy/dx as a single symbol m — the slope — and solve for it exactly as you'd solve any linear equation.",
        steps: [
          { text: "Analogy: suppose you have 2x + 2y·m = 0 and want m. Subtract 2x: 2y·m = −2x. Divide by 2y: m = −x/y." },
          { text: "That is exactly what we did. dy/dx is m. The algebra is identical." },
          { text: "The only requirement: y ≠ 0 (can't divide by zero). Geometrically, y = 0 means we're at (±r, 0) — the leftmost and rightmost points of the circle, where the tangent is vertical and the slope is undefined." },
        ],
        why: {
          tag: "Why is dividing both sides by 2y valid? (Division property of equality)",
          explanation: "If A = B and c ≠ 0, then A/c = B/c. This is the Division Property of Equality — an axiom of arithmetic. We have 2y·(dy/dx) = −2x. Dividing both sides by 2y (assuming y ≠ 0) gives dy/dx = −2x/(2y) = −x/y.",
          steps: [
            { text: "Number example: 6 = 6. Divide both sides by 2: 3 = 3. ✓" },
            { text: "Variable example: 4m = 12. Divide both sides by 4: m = 3. ✓" },
            { text: "Our case: 2y·(dy/dx) = −2x. Divide both sides by 2y: dy/dx = −x/y. ✓" },
          ],
          why: null,
        },
      },
    },

    {
      id: 6, tag: "Geometry",
      tagStyle: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
      instruction: "Verify geometrically: the slope dy/dx = −x/y should be perpendicular to the radius at every point.",
      math: "\\text{Radius slope: } \\frac{y - 0}{x - 0} = \\frac{y}{x} \\qquad \\text{Tangent slope: } -\\frac{x}{y}",
      note: "Two lines are perpendicular when their slopes multiply to −1. Check: (y/x)·(−x/y) = −1. ✓ This is the geometric proof that our algebraic answer is correct.",
      why: {
        tag: "Why should the tangent be perpendicular to the radius?",
        explanation: "The radius at point (x, y) is the line from the center (0,0) to (x, y). The tangent at (x, y) is the line that just touches the circle without crossing it. A fundamental theorem of geometry: a tangent to a circle is perpendicular to the radius at the point of tangency. This gives us an independent check on our calculus result.",
        why: {
          tag: "Prove: two perpendicular lines have slopes m₁ and m₂ where m₁·m₂ = −1",
          explanation: "If a line has slope m₁, its direction vector is (1, m₁). A perpendicular direction is obtained by rotating 90°: (−m₁, 1). That rotated vector has slope 1/(−m₁). So the perpendicular slope is m₂ = −1/m₁, which means m₁·m₂ = −1.",
          steps: [
            { text: "Example: slope 2 and slope −1/2 are perpendicular. 2 · (−1/2) = −1. ✓" },
            { text: "Our case: radius slope = y/x, tangent slope = −x/y. Product: (y/x)·(−x/y) = −y·x/(x·y) = −1. ✓" },
            { text: "The geometric and algebraic answers agree — the implicit differentiation is correct." },
          ],
          why: {
            tag: "Why does rotating a vector 90° give (−y, x) from (x, y)?",
            explanation: "Rotation by 90° counterclockwise in the plane maps (x, y) → (−y, x). This comes from rotation matrices: [cos90 −sin90; sin90 cos90] = [0 −1; 1 0]. Applying to (x,y): new vector is (0·x + (−1)·y, 1·x + 0·y) = (−y, x). The slope of (−y, x) is x/(−y) = −x/y. This matches our tangent slope exactly.",
            why: null,
          },
        },
      },
    },

    {
      id: 7, tag: "Conclusion",
      tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
      instruction: "The answer: dy/dx = −x/y, valid at every point (x, y) on the circle except where y = 0.",
      math: "\\frac{d}{dx}\\left[x^2 + y^2\\right] = \\frac{d}{dx}[r^2] \\implies 2x + 2y\\frac{dy}{dx} = 0 \\implies \\frac{dy}{dx} = -\\frac{x}{y}",
      note: "At y = 0 (the points (r,0) and (−r,0)), the tangent is vertical — the slope is undefined, and −x/y would be ±r/0, which confirms this. The formula breaks exactly where geometry says it should.",
      why: {
        tag: "What was the full dependency chain of this proof?",
        explanation: "Every step depended on a layer beneath it. Here is the complete chain:",
        steps: [
          { text: "dy/dx = −x/y  ← the result" },
          { text: "↳ Differentiating both sides of an equation  ← equality preservation (algebra axiom)" },
          { text: "↳ Sum Rule for derivatives  ← proved from the limit definition" },
          { text: "↳ d/dx[y²] = 2y·(dy/dx)  ← Chain Rule applied to composite [y(x)]²" },
          { text: "↳ Chain Rule  ← proved from the limit definition (sin(x³) proof)" },
          { text: "↳ Division property of equality  ← field axioms of real numbers" },
          { text: "↳ Perpendicularity check  ← 90° rotation matrix, slope formula" },
        ],
        why: {
          tag: "What does this teach us about implicit differentiation generally?",
          explanation: "The pattern for any implicit equation F(x, y) = 0: (1) differentiate both sides with respect to x, (2) whenever you differentiate a term with y, apply the Chain Rule and tag on a factor of dy/dx, (3) collect all dy/dx terms on one side, (4) factor out dy/dx and divide. This works even when solving for y explicitly is impossible — for example, x⁵ + y⁵ = 5xy has no closed-form solution for y, but implicit differentiation still gives dy/dx = (y − x⁴)/(y⁴ − x).",
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

export default function ImplicitDiffProof({ params = {} }) {
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
          Proof · Implicit Differentiation
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

      {/* Progress */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {steps.map((_, i) => (
          <div key={i} onClick={() => setStep(i)} style={{
            flex: 1, height: 5, borderRadius: 3, cursor: "pointer",
            background: i < step ? "var(--color-text-tertiary)" : i === step ? "var(--color-text-primary)" : "var(--color-border-tertiary)",
            transform: i === step ? "scaleY(1.4)" : "scaleY(1)",
            transition: "background .2s",
          }} />
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <ProofStep key={steps[step].id} step={steps[step]} idx={step} total={steps.length} ready={ready} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ flex: 1 }}>
          ← Previous step
        </button>
        <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", minWidth: 72, textAlign: "center" }}>
          Step {step + 1} / {steps.length}
        </span>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1} style={{ flex: 1 }}>
          Next step →
        </button>
      </div>
    </div>
  );
}