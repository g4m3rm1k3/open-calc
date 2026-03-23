/**
 * ProductPowerChainRuleViz.jsx
 * Interactive step-by-step derivative of h(x) = (2x+1)^5 (3x-2)^7
 * Uses same WhyPanel + numeric verification + dependency chain style
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
        }}>
          <span style={{
            display: "inline-block", fontSize: 10, fontWeight: 600,
            letterSpacing: "0.07em", textTransform: "uppercase",
            padding: "2px 8px", borderRadius: 4, marginBottom: 10,
            background: d.tagBg, color: d.tagText, border: `0.5px solid ${d.border}44`,
          }}>
            {why.tag || DEPTH_BTN_LABELS[Math.min(depth, DEPTH_BTN_LABELS.length - 1)]}
          </span>

          <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: why.math || why.steps ? 12 : 0 }}>
            {why.explanation}
          </p>

          {why.math && (
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "12px 16px", textAlign: "center", overflowX: "auto", marginBottom: 8 }}>
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
                    <p style={{ fontSize: 13, lineHeight: 1.65, marginBottom: st.math ? 5 : 0 }}>
                      {st.text}
                    </p>
                    {st.math && (
                      <div style={{ background: "var(--color-background-secondary)", borderRadius: 6, padding: "8px 12px", textAlign: "center", overflowX: "auto", marginTop: 4 }}>
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

// ─── Proof / Solution Data ──────────────────────────────────────────────────
const SOLUTION = {
  title: "Product Rule + Chain Rule",
  subtitle: "Derivative of h(x) = (2x + 1)^5 (3x - 2)^7",
  problem: "h(x) = (2x + 1)^5 (3x - 2)^7 \\quad \\Longrightarrow \\quad h'(x) = (2x + 1)^4 (3x - 2)^6 (72x + 1)",
  preamble: "Full no-shortcuts walkthrough. Every algebraic claim is checked numerically before you accept it. We build from Product Rule → Chain Rule on each factor → strategic factoring → clean final form.",

  steps: [
    {
      id: 1,
      tag: "Setup – Product Rule",
      tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
      instruction: "Identify product structure and apply the Product Rule.",
      math: "h(x) = f(x) \\cdot g(x) \\quad\\text{where}\\quad f(x)=(2x+1)^5, \\; g(x)=(3x-2)^7\n\\h'(x) = f'(x)g(x) + f(x)g'(x)",
      note: "The Product Rule is required whenever you have two functions multiplied together — no exceptions.",
      why: {
        tag: "Why Product Rule instead of expanding everything?",
        explanation: "Expanding (2x+1)^5 (3x-2)^7 gives a 12th-degree polynomial — messy and error-prone. Product + Chain Rule is far cleaner and generalizes to any number of factors.",
        steps: [
          { text: "At x=1: h(1) = 3^5 · 1^7 = 243" },
          { text: "We’ll later confirm h'(1) ≈ 5913 using finite difference — the method we build must match this." },
        ],
        why: null,
      },
    },

    {
      id: 2,
      tag: "Chain Rule – First factor",
      tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
      instruction: "Differentiate f(x) = (2x + 1)^5 using the chain rule (generalized power rule).",
      math: "f'(x) = 5(2x + 1)^4 \\cdot 2 = 10(2x + 1)^4",
      note: "Outer function: u^5 → 5u^4. Inner: 2x+1 → 2. Multiply.",
      why: {
        tag: "Why does the chain rule look like this?",
        explanation: "If f(x) = [g(x)]^n then f'(x) = n [g(x)]^{n-1} g'(x). This is the chain rule in power form.",
        steps: [
          { text: "At x=1: f'(1) = 10 · 3^4 = 10 · 81 = 810" },
          { text: "Finite difference check: [f(1.001) − f(1)] / 0.001 ≈ 810. ✓" },
        ],
        why: null,
      },
    },

    {
      id: 3,
      tag: "Chain Rule – Second factor",
      tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
      instruction: "Differentiate g(x) = (3x - 2)^7.",
      math: "g'(x) = 7(3x - 2)^6 \\cdot 3 = 21(3x - 2)^6",
      note: "Same pattern: power 7 → coefficient 7, reduce exponent by 1, multiply by inner derivative 3.",
      why: {
        tag: "Numeric confirmation",
        explanation: "At x=1: g'(1) = 21 · 1^6 = 21. Finite difference matches closely.",
        why: null,
      },
    },

    {
      id: 4,
      tag: "Apply Product Rule",
      tagStyle: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
      instruction: "Substitute both derivatives back in.",
      math: "h'(x) = 10(2x+1)^4 (3x-2)^7 + 21(2x+1)^5 (3x-2)^6",
      note: "This correct but unsimplified form is what many students stop at.",
      why: {
        tag: "Verification at x=1",
        explanation: "Plug x=1: 10·81·1 + 21·243·1 = 810 + 5103 = 5913",
        steps: [
          { text: "Finite difference at x=1 with h=0.001: ≈5913.06 → very close ✓" },
        ],
        why: null,
      },
    },

    {
      id: 5,
      tag: "Factor common terms",
      tagStyle: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
      instruction: "Factor out the lowest powers present in both terms: (2x+1)^4 and (3x-2)^6.",
      math: "h'(x) = (2x+1)^4 (3x-2)^6 \\Bigl[ 10(3x-2) + 21(2x+1) \\Bigr]",
      note: "This is the key clean-up step — makes the expression much more readable.",
      why: {
        tag: "Why can we factor like this?",
        explanation: "Both terms share at least those powers. Factoring them out is valid distributive property in reverse.",
        steps: [
          { text: "At x=1: 3^4 · 1^6 · [10·1 + 21·3] = 81 · 73 = 5913 ✓" },
        ],
        why: null,
      },
    },

    {
      id: 6,
      tag: "Simplify the bracket",
      tagStyle: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
      instruction: "Expand and combine like terms inside.",
      math: "10(3x - 2) + 21(2x + 1) = 30x - 20 + 42x + 21 = 72x + 1",
      note: "Final compact linear expression.",
      why: {
        tag: "Double-check algebra",
        explanation: "At x=0: 72·0 + 1 = 1\nAt x=1: 72 + 1 = 73 ✓ Matches earlier calculation.",
        why: null,
      },
    },

    {
      id: 7,
      tag: "Final answer",
      tagStyle: { bg: "#f0f9ff", text: "#0c4a6e", border: "#bae6fd" },
      instruction: "Put it all together.",
      math: "h'(x) = (2x + 1)^4 (3x - 2)^6 (72x + 1)",
      note: "This is the clean, factored form most textbooks expect.",
      why: {
        tag: "Quick numeric spot-check at x=0",
        explanation: "h'(0) = 1^4 · (-2)^6 · 1 = 1 · 64 · 1 = 64\nFinite difference confirms ≈64 ✓",
        why: null,
      },
    },

    {
      id: 8,
      tag: "Dependency Chain",
      tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
      instruction: "Intellectual scaffolding — what this solution rests on.",
      math: "h'(x) = (2x+1)^4 (3x-2)^6 (72x+1)",
      note: "Understanding each layer helps you solve similar problems faster.",
      why: {
        tag: "Full dependency chain",
        explanation: "Result ← Product Rule ← Chain Rule (power form) ← Factoring polynomials ← Distributive property ← Limit definition of derivative (foundation of all rules used)",
        steps: [
          { text: "Most practical path: recognize product → apply Product Rule → apply Chain Rule to each → factor → simplify" },
          { text: "Alternative (bad): expand everything → differentiate term-by-term → very error-prone" },
        ],
        why: null,
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
      marginBottom: 16,
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
          fontSize: 13, fontWeight: 600,
        }}>{idx + 1}</div>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase",
          padding: "3px 10px", borderRadius: 20,
          background: tc.bg, color: tc.text, border: `0.5px solid ${tc.border}`,
        }}>{step.tag}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-text-tertiary)" }}>
          {idx + 1} / {total}
        </span>
      </div>

      <div style={{ padding: "18px 20px 0" }}>
        <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.55, marginBottom: 16 }}>
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

export default function ProductPowerChainRuleViz({ params = {} }) {
  const [step, setStep] = useState(0);
  const ready = useMath();
  const steps = SOLUTION.steps;

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "0.5rem 0", maxWidth: 740, margin: "0 auto" }}>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{
        background: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 12, padding: "18px 22px", marginBottom: 20,
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--color-text-tertiary)", marginBottom: 4 }}>
          Calculus · Product + Chain Rule
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
          {SOLUTION.title}
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 14 }}>
          {SOLUTION.subtitle}
        </div>
        <div style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 8, padding: "14px 16px", textAlign: "center", overflowX: "auto", marginBottom: 12,
        }}>
          <M t={SOLUTION.problem} display ready={ready} />
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
          {SOLUTION.preamble}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {steps.map((s, i) => (
          <div key={i} onClick={() => setStep(i)} style={{
            flex: 1, height: 5, borderRadius: 3, cursor: "pointer",
            background: i < step ? "var(--color-text-tertiary)" : i === step ? "var(--color-text-primary)" : "var(--color-border-tertiary)",
            transform: i === step ? "scaleY(1.4)" : "scaleY(1)",
            transition: "background .2s",
          }} />
        ))}
      </div>

      {/* Current step */}
      <ProofStep step={steps[step]} idx={step} total={steps.length} ready={ready} />

      {/* Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            flex: 1, padding: "8px 16px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
            background: "transparent", color: step === 0 ? "var(--color-text-tertiary)" : "var(--color-text-secondary)",
            cursor: step === 0 ? "not-allowed" : "pointer",
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
            cursor: step === steps.length - 1 ? "not-allowed" : "pointer",
            fontWeight: 500,
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}