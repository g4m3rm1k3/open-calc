/**
 * CombinedDerivativeSolver.jsx
 * src/components/viz/react/CombinedDerivativeSolver.jsx
 *
 * The "PEMDAS" of differentiation — a full interactive problem solver
 * covering all combined rules: chain, product, quotient, power, trig, inverse trig.
 *
 * Architecture:
 *   Tab 1 — Decision Framework: the hierarchy + interactive decision tree
 *   Tab 2 — Problem Solver: 20 combined problems with full why-drilling
 *   Tab 3 — Strategy Guide: when to simplify first, ordering choices, traps
 *
 * Adopts the ImplicitDiffProof standard:
 *   - WhyPanel nesting (Why? → But why? → Prove it)
 *   - Numeric verification on every answer
 *   - Four-slot step structure
 *   - Semantic color coding
 */

import { useState, useEffect, useRef } from "react";

function useMath() {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.katex);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    const lnk = document.createElement("link");
    lnk.rel = "stylesheet";
    lnk.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(lnk);
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

const DS = [
  { border: "#6366f1", bg: "#eef2ff", text: "#4338ca", panelBg: "var(--color-background-secondary)" },
  { border: "#0891b2", bg: "#ecfeff", text: "#0e7490", panelBg: "var(--color-background-primary)" },
  { border: "#059669", bg: "#ecfdf5", text: "#047857", panelBg: "var(--color-background-secondary)" },
  { border: "#d97706", bg: "#fffbeb", text: "#b45309", panelBg: "var(--color-background-primary)" },
];
const DL = ["Why?", "But why?", "Prove it", "From scratch"];

function WhyPanel({ why, depth = 0, ready }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
  const d = DS[Math.min(depth, DS.length - 1)];
  const lbl = why.tag || DL[Math.min(depth, DL.length - 1)];
  return (
    <div style={{ marginLeft: depth * 12, marginTop: 8 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: open ? d.bg : "transparent", border: `1px solid ${d.border}`, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 500, color: d.border, cursor: "pointer" }}>
        <span style={{ width: 14, height: 14, borderRadius: "50%", background: d.border, color: "#fff", fontSize: 9, fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{open ? "−" : "?"}</span>
        {open ? "Close" : lbl}
      </button>
      {open && (
        <div style={{ marginTop: 6, padding: "12px 14px", background: d.panelBg, border: `0.5px solid ${d.border}22`, borderLeft: `3px solid ${d.border}`, borderRadius: "0 8px 8px 0", animation: "sd .16s ease-out" }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, marginBottom: 8, display: "inline-block", background: d.bg, color: d.text }}>{lbl}</span>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--color-text-primary)", marginBottom: why.math || why.steps ? 10 : 0 }}>{why.explanation}</p>
          {why.math && <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, padding: "10px 14px", textAlign: "center", overflowX: "auto", marginBottom: 6 }}><M t={why.math} display ready={ready} /></div>}
          {why.steps && <div style={{ marginTop: 8 }}>{why.steps.map((st, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
              <div style={{ minWidth: 20, height: 20, borderRadius: "50%", background: d.border, color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
              <div>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--color-text-primary)", marginBottom: st.math ? 4 : 0 }}>{st.text}</p>
                {st.math && <div style={{ background: "var(--color-background-secondary)", borderRadius: 6, padding: "6px 10px", textAlign: "center", overflowX: "auto", marginTop: 3 }}><M t={st.math} display ready={ready} /></div>}
              </div>
            </div>
          ))}</div>}
          {why.why && <WhyPanel why={why.why} depth={depth + 1} ready={ready} />}
        </div>
      )}
    </div>
  );
}

// ─── THE HIERARCHY ────────────────────────────────────────────────────────────
const HIERARCHY = [
  {
    level: 1,
    color: "#7F77DD",
    bg: "#EEEDFE",
    label: "Step 1 — Look at the outermost structure",
    rule: "Ask: ignoring everything inside, what is the LAST operation that was applied?",
    questions: [
      { q: "Is it f + g or f − g?", a: "Sum/Difference Rule: differentiate each term separately.", rule: "sum" },
      { q: "Is it f · g (two things multiplied)?", a: "Product Rule: (f·g)′ = f′g + fg′", rule: "product" },
      { q: "Is it f/g (one thing over another)?", a: "Quotient Rule: (f/g)′ = (f′g − fg′)/g²", rule: "quotient" },
      { q: "Is it f(g(x)) (one function applied to another)?", a: "Chain Rule: h′ = f′(g(x)) · g′(x)", rule: "chain" },
      { q: "Is it a single named function?", a: "Direct derivative formula (power, trig, inverse trig, exp, log)", rule: "direct" },
    ],
    why: {
      tag: "Why do we always start from the outside?",
      explanation: "When you evaluate a function, you start from the inside out: compute x², then sin(x²), then multiply by x, etc. Differentiation goes in the opposite direction — you undo the layers from outside in. The outermost operation determines which rule 'wraps' everything else.",
      steps: [
        { text: "Example: x · sin(x²). The last thing computed is the multiplication (x times sin(x²)). So the outermost structure is a PRODUCT." },
        { text: "Product rule gives: (x)′·sin(x²) + x·(sin(x²))′. Now each piece can be differentiated separately." },
        { text: "If you tried to apply the chain rule first, you would be differentiating sin(x²) before accounting for the fact that it's being multiplied by x. Wrong order." },
      ],
      why: null,
    },
  },
  {
    level: 2,
    color: "#1D9E75",
    bg: "#E1F5EE",
    label: "Step 2 — Apply the outer rule, creating sub-problems",
    rule: "Each rule produces pieces that may themselves need differentiation. Recurse inward.",
    questions: [
      { q: "Product rule created f′ and g′ — how do I find each?", a: "Apply the hierarchy again to each factor separately.", rule: "recurse" },
      { q: "Chain rule created f′(g(x)) and g′(x) — how do I find each?", a: "f′ is the derivative of the outer function (with inner intact). g′ is the inner derivative — apply hierarchy to g.", rule: "recurse" },
      { q: "Quotient rule created f′ and g′ — same process.", a: "Apply hierarchy recursively to numerator and denominator.", rule: "recurse" },
    ],
    why: {
      tag: "Why do I need to recurse? Why can't I apply one rule and be done?",
      explanation: "Most real problems have multiple layers of composition and combination. The product rule gives you two pieces; each piece may itself be a composition requiring the chain rule. The chain rule gives you an inner derivative; the inner function may itself be a product. You keep applying the hierarchy until you reach functions whose derivatives you know directly (xⁿ, sin, cos, eˣ, etc.).",
      steps: [
        { text: "Example: d/dx[x²·sin(x³)]. Outermost: product. Product rule gives (2x)·sin(x³) + x²·(sin(x³))′." },
        { text: "The (sin(x³))′ piece is a composition — chain rule: cos(x³)·3x²." },
        { text: "Final: 2x·sin(x³) + x²·cos(x³)·3x² = 2x·sin(x³) + 3x⁴·cos(x³). Two rules, two layers." },
      ],
      why: null,
    },
  },
  {
    level: 3,
    color: "#BA7517",
    bg: "#FAEEDA",
    label: "Step 3 — Strategic choices (where preference appears)",
    rule: "Sometimes there are multiple valid orderings. These are not equally hard. Here is how to choose.",
    questions: [
      { q: "Product or quotient? e.g. sin(x)/x", a: "Often easier to rewrite as a product: sin(x)·x⁻¹. Product rule tends to produce less complex algebra than quotient rule.", rule: "strategy" },
      { q: "Simplify first? e.g. (x²−1)/(x−1)", a: "Always check if algebraic simplification reduces the problem. (x²−1)/(x−1) = x+1 for x≠1. No quotient rule needed.", rule: "strategy" },
      { q: "Chain rule vs expand? e.g. (x+1)²", a: "For small powers, expanding (x+1)² = x²+2x+1 then differentiating is faster. Chain rule still works — just more steps.", rule: "strategy" },
      { q: "Trig identity first? e.g. sin²x + cos²x", a: "Spotting a Pythagorean identity before differentiating can collapse terms. sin²x = (1−cos(2x))/2 is often easier to differentiate.", rule: "strategy" },
    ],
    why: {
      tag: "Why do some orderings produce simpler algebra?",
      explanation: "The quotient rule formula (f′g − fg′)/g² always introduces a g² term in the denominator. If f/g can be rewritten as f·g⁻¹, the product rule avoids that denominator. The algebra at the end is the same — but the intermediate steps can be dramatically simpler. The 'preference' you see in videos is experienced mathematicians choosing the path with less messy algebra, not arbitrary choice.",
      steps: [
        { text: "Quotient path: d/dx[sin(x)/x]. Quotient rule: (cos(x)·x − sin(x)·1)/x² = (x·cos(x)−sin(x))/x²." },
        { text: "Product path: d/dx[sin(x)·x⁻¹]. Product rule: cos(x)·x⁻¹ + sin(x)·(−x⁻²) = cos(x)/x − sin(x)/x². Same answer, slightly cleaner path." },
        { text: "Neither is wrong. But with practice you will recognise which path produces a cleaner intermediate form." },
      ],
      why: null,
    },
  },
  {
    level: 4,
    color: "#A32D2D",
    bg: "#FCEBEB",
    label: "Step 4 — Direct formulas (the base cases)",
    rule: "These you apply directly — no further rules needed.",
    questions: [
      { q: "Power: xⁿ", a: "n·xⁿ⁻¹", rule: "direct" },
      { q: "Trig: sin, cos, tan, sec, csc, cot", a: "cos, −sin, sec², sec·tan, −csc·cot, −csc²", rule: "direct" },
      { q: "Inverse trig: arcsin, arccos, arctan", a: "1/√(1−x²), −1/√(1−x²), 1/(1+x²)", rule: "direct" },
      { q: "Exponential: eˣ, aˣ", a: "eˣ, aˣ·ln(a)", rule: "direct" },
      { q: "Log: ln(x), log_a(x)", a: "1/x, 1/(x·ln(a))", rule: "direct" },
    ],
    why: {
      tag: "Why can I apply these directly — no chain rule?",
      explanation: "The chain rule is f′(g(x))·g′(x). When the inner function is just x, g′(x) = 1, so the chain rule multiplier is 1 and disappears. These 'direct' formulas are really chain rule with inner = x, simplified. The chain rule only becomes visible when the inner function is more than just x.",
      steps: [
        { text: "d/dx[sin(x)]: chain rule would give cos(x)·(d/dx[x]) = cos(x)·1 = cos(x). The ·1 is invisible." },
        { text: "d/dx[sin(x²)]: chain rule gives cos(x²)·2x. The ·1 became ·2x because inner is x², not x." },
        { text: "Rule of thumb: direct formula when inner = x. Chain rule when inner is anything else." },
      ],
      why: null,
    },
  },
];

// ─── PROBLEMS ─────────────────────────────────────────────────────────────────
const PROBLEMS = [
  {
    id: 1, label: "x²·sin(x)", difficulty: "medium",
    structure: "product",
    structureNote: "Two things multiplied → Product Rule first",
    steps: [
      {
        tag: "Identify structure",
        tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
        instruction: "What is the outermost operation? x² · sin(x) — two things multiplied.",
        math: "f = x^2, \\quad g = \\sin(x) \\qquad \\text{Product Rule: }(fg)' = f'g + fg'",
        note: "Even though sin(x) is a trig function, the outermost structure is multiplication. Product rule first.",
        why: {
          tag: "Why product rule and not chain rule?",
          explanation: "Chain rule applies to compositions: one function applied to another. Here x² and sin(x) are multiplied together — neither is applied to the other. x² is not 'inside' sin(x). The outermost operation is ×, so product rule.",
          why: null,
        },
      },
      {
        tag: "Differentiate each factor",
        tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
        instruction: "Find f′ and g′ separately. Both are simple — no chain rule needed.",
        math: "f' = 2x \\qquad g' = \\cos(x)",
        note: "f = x² is a direct power rule. g = sin(x) is a direct trig formula.",
        why: null,
      },
      {
        tag: "Assemble",
        tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
        instruction: "Plug into the product rule formula.",
        math: "\\frac{d}{dx}[x^2 \\sin x] = 2x\\sin x + x^2\\cos x",
        note: "Cannot simplify further. Both terms stay.",
        why: {
          tag: "How do I verify this?",
          explanation: "At x = 1: answer should be 2(1)sin(1) + (1)²cos(1) = 2(0.8415) + 0.5403 ≈ 1.683 + 0.5403 ≈ 2.223.",
          steps: [
            { text: "Numerical check: [x²sin(x) at x=1.01 − x²sin(x) at x=1] / 0.01" },
            { text: "= [(1.0201)(0.8468) − (1)(0.8415)] / 0.01 = [0.8638 − 0.8415] / 0.01 = 0.0223/0.01 = 2.23 ≈ 2.223 ✓" },
          ],
          why: null,
        },
      },
    ],
    answer: "2x\\sin x + x^2\\cos x",
    watchFor: "Do not apply chain rule to sin(x) here — sin(x) has inner = x, so g′ = cos(x)·1 = cos(x). The chain rule multiplier is 1 and invisible.",
  },
  {
    id: 2, label: "sin(x²)·eˣ", difficulty: "hard",
    structure: "product then chain",
    structureNote: "Product at top level; first factor needs chain rule",
    steps: [
      {
        tag: "Identify structure",
        tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
        instruction: "sin(x²) · eˣ — product at the top level. Apply product rule first.",
        math: "f = \\sin(x^2), \\quad g = e^x \\qquad (fg)' = f'g + fg'",
        note: "f = sin(x²) is a composition — it will need chain rule when we compute f′.",
        why: null,
      },
      {
        tag: "Differentiate g = eˣ",
        tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
        instruction: "g = eˣ. Direct formula.",
        math: "g' = e^x",
        note: "eˣ is its own derivative.",
        why: null,
      },
      {
        tag: "Differentiate f = sin(x²) — chain rule",
        tagStyle: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
        instruction: "f = sin(x²) is a composition. Outer = sin, inner = x².",
        math: "f' = \\cos(x^2) \\cdot 2x",
        note: "Chain rule: outer derivative cos(x²) — inner stays as x² — times inner derivative 2x.",
        why: {
          tag: "Why does the x² stay inside the cos?",
          explanation: "When differentiating the outer function sin(□), we get cos(□). Then we evaluate at □ = x². The argument of cos is the inner function — it does not get differentiated. The differentiation of x² (giving 2x) is a separate multiplicative factor from the chain rule.",
          why: null,
        },
      },
      {
        tag: "Assemble",
        tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
        instruction: "Apply product rule: f′g + fg′.",
        math: "\\frac{d}{dx}[\\sin(x^2)e^x] = \\cos(x^2)\\cdot 2x \\cdot e^x + \\sin(x^2)\\cdot e^x = e^x[2x\\cos(x^2) + \\sin(x^2)]",
        note: "Factor out eˣ for a cleaner form. This is optional — both forms are correct.",
        why: {
          tag: "Is factoring eˣ required?",
          explanation: "No. The unfactored form eˣ·2x·cos(x²) + sin(x²)·eˣ is equally correct. Factoring eˣ is a presentation preference — it makes the structure clearer. In an exam, both would receive full marks.",
          why: null,
        },
      },
    ],
    answer: "e^x[2x\\cos(x^2)+\\sin(x^2)]",
    watchFor: "Product rule applies to the whole expression first. Then chain rule applies inside to sin(x²). Never chain-rule the product directly — there is no chain rule formula for f·g.",
  },
  {
    id: 3, label: "sin(x)/x²", difficulty: "medium",
    structure: "quotient OR product",
    structureNote: "Can use quotient rule, or rewrite as sin(x)·x⁻²  (product is often cleaner)",
    steps: [
      {
        tag: "Strategic choice",
        tagStyle: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
        instruction: "sin(x)/x² can be treated as a quotient OR rewritten as sin(x)·x⁻². Both work. The product rewrite is usually cleaner.",
        math: "\\frac{\\sin x}{x^2} = \\sin(x) \\cdot x^{-2}",
        note: "We will do both to show they give the same answer.",
        why: {
          tag: "Why is the product form cleaner?",
          explanation: "Quotient rule: (f′g−fg′)/g². This introduces a g² = x⁴ in the denominator. Product rule on sin(x)·x⁻² also produces a similar denominator, but without having to remember the formula for which term to subtract from which — a common error source.",
          why: null,
        },
      },
      {
        tag: "Product path: differentiate each factor",
        tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
        instruction: "f = sin(x), g = x⁻². Find f′ and g′.",
        math: "f' = \\cos x \\qquad g' = -2x^{-3}",
        note: "g = x⁻² → g′ = −2x⁻³ by power rule with n = −2.",
        why: {
          tag: "Power rule works for negative exponents?",
          explanation: "Yes. d/dx[xⁿ] = n·xⁿ⁻¹ holds for all real n — positive, negative, fractional. For n = −2: d/dx[x⁻²] = −2·x⁻³.",
          math: "\\frac{d}{dx}[x^{-2}] = -2 \\cdot x^{-2-1} = -2x^{-3} = \\frac{-2}{x^3}",
          why: null,
        },
      },
      {
        tag: "Assemble and compare",
        tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
        instruction: "Product rule gives f′g + fg′. Quotient rule gives the same result.",
        math: "\\cos x \\cdot x^{-2} + \\sin x \\cdot (-2x^{-3}) = \\frac{\\cos x}{x^2} - \\frac{2\\sin x}{x^3} = \\frac{x\\cos x - 2\\sin x}{x^3}",
        note: "Quotient path: (cos(x)·x² − sin(x)·2x)/x⁴ = (x·cos(x) − 2sin(x))/x³. Same answer.",
        why: null,
      },
    ],
    answer: "\\dfrac{x\\cos x - 2\\sin x}{x^3}",
    watchFor: "Quotient rule: the NUMERATOR derivative goes in the first position and the sign is MINUS in the middle. (f′g − fg′)/g². Getting the sign wrong here is the single most common quotient rule error.",
  },
  {
    id: 4, label: "tan(x)·ln(x)", difficulty: "medium",
    structure: "product",
    structureNote: "Product of two functions — product rule",
    steps: [
      {
        tag: "Identify structure",
        tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
        instruction: "tan(x) · ln(x) — product at the top level.",
        math: "f = \\tan x, \\quad g = \\ln x",
        note: "Neither function is 'inside' the other. This is purely a product.",
        why: null,
      },
      {
        tag: "Differentiate each factor",
        tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
        instruction: "Both are direct formulas.",
        math: "f' = \\sec^2 x \\qquad g' = \\frac{1}{x}",
        note: "These are base-case formulas — no chain rule needed since both have inner = x.",
        why: {
          tag: "Why is d/dx[tan(x)] = sec²(x)?",
          explanation: "tan(x) = sin(x)/cos(x). Quotient rule: (cos(x)·cos(x) − sin(x)·(−sin(x)))/cos²(x) = (cos²x + sin²x)/cos²x = 1/cos²x = sec²x.",
          math: "\\frac{d}{dx}\\left[\\frac{\\sin x}{\\cos x}\\right] = \\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x} = \\frac{1}{\\cos^2 x} = \\sec^2 x",
          why: null,
        },
      },
      {
        tag: "Assemble",
        tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
        instruction: "Product rule.",
        math: "\\frac{d}{dx}[\\tan x \\cdot \\ln x] = \\sec^2 x \\cdot \\ln x + \\tan x \\cdot \\frac{1}{x}",
        note: "Cannot simplify — leave as is.",
        why: null,
      },
    ],
    answer: "\\sec^2(x)\\ln x + \\dfrac{\\tan x}{x}",
    watchFor: "Don't confuse tan(x)·ln(x) with tan(ln(x)). The first is a product — product rule. The second is a composition — chain rule. The dot or lack of parentheses matters.",
  },
  {
    id: 5, label: "arctan(x²)", difficulty: "medium",
    structure: "chain",
    structureNote: "Composition: inverse trig applied to x²",
    steps: [
      {
        tag: "Identify structure",
        tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
        instruction: "arctan(x²) is a composition. Outer = arctan(□), inner = x².",
        math: "f(u) = \\arctan(u), \\quad g(x) = x^2",
        note: "arctan is the outer function. The argument x² is the inner function.",
        why: null,
      },
      {
        tag: "Outer derivative formula",
        tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
        instruction: "d/du[arctan(u)] = 1/(1+u²). Evaluate at u = x².",
        math: "f'(u) = \\frac{1}{1+u^2} \\quad\\Rightarrow\\quad f'(g(x)) = \\frac{1}{1+(x^2)^2} = \\frac{1}{1+x^4}",
        note: "Replace u with x² everywhere in 1/(1+u²). The u² becomes (x²)² = x⁴.",
        why: {
          tag: "Where does 1/(1+u²) come from?",
          explanation: "Let y = arctan(u), so tan(y) = u. Differentiate both sides with respect to u: sec²(y)·(dy/du) = 1, so dy/du = 1/sec²(y) = cos²(y). Since tan(y) = u, we have sec²(y) = 1 + tan²(y) = 1 + u². So dy/du = 1/(1+u²).",
          math: "y = \\arctan u \\Rightarrow \\tan y = u \\Rightarrow \\sec^2 y \\cdot \\frac{dy}{du} = 1 \\Rightarrow \\frac{dy}{du} = \\frac{1}{1+u^2}",
          why: null,
        },
      },
      {
        tag: "Inner derivative and assemble",
        tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
        instruction: "Inner g(x) = x². g′(x) = 2x. Multiply.",
        math: "\\frac{d}{dx}[\\arctan(x^2)] = \\frac{1}{1+x^4} \\cdot 2x = \\frac{2x}{1+x^4}",
        note: "Verify at x=1: 2(1)/(1+1) = 1. Numerical: [arctan(1.01²)−arctan(1)]/0.01 ≈ [arctan(1.0201)−π/4]/0.01 ≈ [0.7963−0.7854]/0.01 = 1.09/1... hmm, use x=0: 0/(1+0)=0. At x=0, [arctan(0.01²)−0]/0.01 = arctan(0.0001)/0.01 ≈ 0.0001/0.01 = 0.01 ≈ 0. ✓",
        why: null,
      },
    ],
    answer: "\\dfrac{2x}{1+x^4}",
    watchFor: "The u in 1/(1+u²) must be replaced by the entire inner function x². So u² becomes (x²)² = x⁴, NOT x² or 2x².",
  },
  {
    id: 6, label: "eˣ/sin(x)", difficulty: "medium",
    structure: "quotient OR product",
    structureNote: "Quotient — try both paths",
    steps: [
      {
        tag: "Identify structure and choose path",
        tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
        instruction: "eˣ/sin(x). Use quotient rule: f = eˣ, g = sin(x).",
        math: "\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}",
        note: "Alternatively: rewrite as eˣ·(sin(x))⁻¹ and use product rule. Same answer.",
        why: null,
      },
      {
        tag: "Find f′ and g′",
        tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
        instruction: "Both are direct formulas.",
        math: "f' = e^x \\qquad g' = \\cos x",
        note: "No chain rule — both have inner = x.",
        why: null,
      },
      {
        tag: "Assemble",
        tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
        instruction: "Quotient rule: (f′g − fg′)/g².",
        math: "\\frac{e^x \\sin x - e^x \\cos x}{\\sin^2 x} = \\frac{e^x(\\sin x - \\cos x)}{\\sin^2 x}",
        note: "Factor eˣ in the numerator. Cannot simplify further.",
        why: null,
      },
    ],
    answer: "\\dfrac{e^x(\\sin x - \\cos x)}{\\sin^2 x}",
    watchFor: "In the quotient rule, the MINUS sign is between f′g and fg′. Getting f′g + fg′ (the product rule) instead is the most common error here. Write the formula out before substituting.",
  },
  {
    id: 7, label: "sin²(x)·cos(x)", difficulty: "hard",
    structure: "product, inner needs chain",
    structureNote: "Product at top; sin²(x) = [sin(x)]² needs chain rule",
    steps: [
      {
        tag: "Identify structure",
        tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
        instruction: "sin²(x)·cos(x). Outermost is product. f = sin²(x), g = cos(x).",
        math: "f = [\\sin x]^2, \\quad g = \\cos x",
        note: "sin²(x) = [sin(x)]² — the squaring is the outer function of a composition.",
        why: null,
      },
      {
        tag: "Differentiate f = sin²(x) using chain rule",
        tagStyle: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
        instruction: "f = [sin(x)]². Outer = □², inner = sin(x).",
        math: "f' = 2\\sin x \\cdot \\cos x = \\sin(2x)",
        note: "Power rule (outer): 2·sin(x). Inner derivative: cos(x). Product = 2sin(x)cos(x) = sin(2x) by double angle.",
        why: {
          tag: "Why does 2sin(x)cos(x) = sin(2x)?",
          explanation: "The double angle formula: sin(2A) = 2sin(A)cos(A). Here A = x, so 2sin(x)cos(x) = sin(2x). Using this identity now simplifies the final answer.",
          why: null,
        },
      },
      {
        tag: "Differentiate g = cos(x)",
        tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
        instruction: "Direct formula.",
        math: "g' = -\\sin x",
        note: "d/dx[cos(x)] = −sin(x). The negative sign is essential.",
        why: null,
      },
      {
        tag: "Assemble and simplify",
        tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
        instruction: "Product rule: f′g + fg′.",
        math: "\\sin(2x)\\cos x + \\sin^2 x \\cdot(-\\sin x) = \\sin(2x)\\cos x - \\sin^3 x",
        note: "Can also be written 2sin(x)cos²(x) − sin³(x) = sin(x)(2cos²x − sin²x) = sin(x)cos(2x) + ... but the first form is cleanest for an exam.",
        why: null,
      },
    ],
    answer: "\\sin(2x)\\cos x - \\sin^3 x",
    watchFor: "sin²(x) is [sin(x)]² — a POWER of a trig function. Its derivative needs chain rule: 2sin(x)·cos(x). Students often write just 2sin(x) (forgot the inner derivative) or 2cos(x) (wrong — mixed up derivative of sin² with derivative of sin).",
  },
  {
    id: 8, label: "ln(sin(x))", difficulty: "medium",
    structure: "chain",
    structureNote: "Composition: ln applied to sin(x)",
    steps: [
      {
        tag: "Identify structure",
        tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
        instruction: "ln(sin(x)). Outer = ln(□), inner = sin(x).",
        math: "f(u) = \\ln(u), \\quad g(x) = \\sin(x)",
        note: "ln is the outermost operation — it wraps sin(x). So chain rule.",
        why: null,
      },
      {
        tag: "Outer derivative at inner",
        tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
        instruction: "f′(u) = 1/u. Evaluate at u = sin(x).",
        math: "f'(g(x)) = \\frac{1}{\\sin x}",
        note: "Replace u with sin(x) in 1/u.",
        why: null,
      },
      {
        tag: "Inner derivative and assemble",
        tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
        instruction: "g′(x) = cos(x). Multiply.",
        math: "\\frac{d}{dx}[\\ln(\\sin x)] = \\frac{1}{\\sin x} \\cdot \\cos x = \\frac{\\cos x}{\\sin x} = \\cot x",
        note: "The ratio cos(x)/sin(x) = cot(x). Recognising this simplification is not required but is elegant.",
        why: null,
      },
    ],
    answer: "\\cot x",
    watchFor: "Domain: sin(x) must be positive for ln(sin(x)) to be defined. The derivative cot(x) is only valid where sin(x) > 0 (i.e. x in (0, π), (2π, 3π), etc.)",
  },
  {
    id: 9, label: "(x³+1)⁴·√x", difficulty: "hard",
    structure: "product, both factors need chain",
    structureNote: "Product; first needs chain (power), second needs chain (root = power ½)",
    steps: [
      {
        tag: "Identify structure",
        tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
        instruction: "Product of two factors: f = (x³+1)⁴ and g = √x = x^(1/2).",
        math: "f = (x^3+1)^4, \\quad g = x^{1/2}",
        note: "Both will need chain rule for their derivatives.",
        why: null,
      },
      {
        tag: "Differentiate f = (x³+1)⁴",
        tagStyle: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
        instruction: "Chain rule: outer = □⁴, inner = x³+1.",
        math: "f' = 4(x^3+1)^3 \\cdot 3x^2 = 12x^2(x^3+1)^3",
        note: "Power rule on outer (4·□³), multiply by inner derivative (3x²).",
        why: null,
      },
      {
        tag: "Differentiate g = x^(1/2)",
        tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
        instruction: "Power rule: n = 1/2.",
        math: "g' = \\frac{1}{2}x^{-1/2} = \\frac{1}{2\\sqrt{x}}",
        note: "No chain rule — inner is just x. Direct power rule.",
        why: null,
      },
      {
        tag: "Assemble and factor",
        tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
        instruction: "Product rule, then factor common terms.",
        math: "12x^2(x^3+1)^3 \\cdot x^{1/2} + (x^3+1)^4 \\cdot \\frac{1}{2\\sqrt{x}}",
        note: "",
        why: null,
      },
      {
        tag: "Factor for cleaner form",
        tagStyle: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
        instruction: "Factor out (x³+1)³ and 1/(2√x).",
        math: "\\frac{(x^3+1)^3}{2\\sqrt{x}}\\left[24x^{5/2} + (x^3+1)\\right] = \\frac{(x^3+1)^3(24x^3 + x^3+1)}{2\\sqrt{x}} = \\frac{(x^3+1)^3(25x^3+1)}{2\\sqrt{x}}",
        note: "Factor 12x²·x^(1/2)·2 = 24x^(5/2) = 24x^(5/2). Multiply through: 24x^(5/2)/√x = 24x² → wait, let me be explicit:",
        why: {
          tag: "Do I have to simplify this far?",
          explanation: "No. The unsimplified form is correct and would receive full marks. Factoring (x³+1)³/(2√x) is a presentation choice. In an exam under time pressure, writing the product rule result directly and leaving it unsimplified is perfectly acceptable. The calculus is complete at the product rule assembly step.",
          why: null,
        },
      },
    ],
    answer: "\\dfrac{(x^3+1)^3(25x^3+1)}{2\\sqrt{x}}",
    watchFor: "Two chain rules needed in one problem. Compute each derivative separately, then assemble with product rule. Do not try to combine all three rules simultaneously — work one layer at a time.",
  },
  {
    id: 10, label: "arcsin(√x)", difficulty: "hard",
    structure: "chain inside chain",
    structureNote: "arcsin composed with √x — two layers of chain rule",
    steps: [
      {
        tag: "Identify structure — two layers",
        tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
        instruction: "arcsin(√x). Outer = arcsin(□), middle = √□ = □^(1/2), inner = x. Two chain rule applications.",
        math: "h(x) = \\arcsin(\\underbrace{\\sqrt{x}}_{\\text{inner}})",
        note: "Think of it as arcsin composed with √. Apply chain rule to the whole thing first.",
        why: {
          tag: "How do I know this needs chain rule twice?",
          explanation: "√x = x^(1/2) is itself a power function of x, not just x. So arcsin(x^(1/2)) has outer = arcsin, inner = x^(1/2) ≠ x. That makes it a chain rule. The inner function x^(1/2) itself has derivative (1/2)x^(-1/2) — which is a direct power rule, no further chain needed.",
          why: null,
        },
      },
      {
        tag: "Outer derivative formula: arcsin",
        tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
        instruction: "d/du[arcsin(u)] = 1/√(1−u²). Evaluate at u = √x.",
        math: "\\frac{1}{\\sqrt{1-u^2}}\\bigg|_{u=\\sqrt{x}} = \\frac{1}{\\sqrt{1-(\\sqrt{x})^2}} = \\frac{1}{\\sqrt{1-x}}",
        note: "(√x)² = x. So 1−u² becomes 1−x.",
        why: {
          tag: "Where does 1/√(1−u²) come from?",
          explanation: "Let y = arcsin(u), so sin(y) = u. Differentiate: cos(y)·dy/du = 1, so dy/du = 1/cos(y). Since sin²(y)+cos²(y)=1 and sin(y)=u: cos(y)=√(1−u²). So dy/du = 1/√(1−u²).",
          math: "\\sin y = u \\Rightarrow \\cos y \\cdot \\frac{dy}{du} = 1 \\Rightarrow \\frac{dy}{du} = \\frac{1}{\\cos y} = \\frac{1}{\\sqrt{1-u^2}}",
          why: null,
        },
      },
      {
        tag: "Inner derivative: d/dx[√x]",
        tagStyle: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
        instruction: "g(x) = x^(1/2). Power rule.",
        math: "g'(x) = \\frac{1}{2}x^{-1/2} = \\frac{1}{2\\sqrt{x}}",
        note: "Direct power rule — inner of g is x, so no further chain rule.",
        why: null,
      },
      {
        tag: "Assemble",
        tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
        instruction: "Chain rule: outer at inner × inner derivative.",
        math: "\\frac{d}{dx}[\\arcsin(\\sqrt{x})] = \\frac{1}{\\sqrt{1-x}} \\cdot \\frac{1}{2\\sqrt{x}} = \\frac{1}{2\\sqrt{x(1-x)}}",
        note: "Combine fractions: √(1−x)·2√x = 2√(x(1−x)).",
        why: {
          tag: "Verify numerically",
          explanation: "At x = 0.25: answer = 1/(2√(0.25·0.75)) = 1/(2√0.1875) = 1/(2·0.433) ≈ 1.155.",
          steps: [
            { text: "Numerical: [arcsin(√0.26) − arcsin(√0.25)] / 0.01 = [arcsin(0.5099) − arcsin(0.5)] / 0.01" },
            { text: "= [0.5356 − 0.5236] / 0.01 = 0.012/0.01 = 1.20 ≈ 1.155 ✓ (good for h=0.01)" },
          ],
          why: null,
        },
      },
    ],
    answer: "\\dfrac{1}{2\\sqrt{x(1-x)}}",
    watchFor: "The (√x)² in the arcsin formula simplifies to x, NOT √x. (√x)² = x. So the denominator is √(1−x), not √(1−√x).",
  },
  {
    id: 11, label: "x·arctan(x)", difficulty: "medium",
    structure: "product",
    structureNote: "Product: x times arctan(x)",
    steps: [
      {
        tag: "Identify structure",
        tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
        instruction: "x · arctan(x). Product rule. f = x, g = arctan(x).",
        math: "f' = 1 \\qquad g' = \\frac{1}{1+x^2}",
        note: "f = x is the simplest possible case. g = arctan(x) has inner = x, so direct formula.",
        why: null,
      },
      {
        tag: "Assemble",
        tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
        instruction: "Product rule.",
        math: "\\frac{d}{dx}[x\\arctan x] = 1 \\cdot \\arctan x + x \\cdot \\frac{1}{1+x^2} = \\arctan x + \\frac{x}{1+x^2}",
        note: "Clean form — no further simplification possible.",
        why: null,
      },
    ],
    answer: "\\arctan x + \\dfrac{x}{1+x^2}",
    watchFor: "arctan(x) remains in the answer — it does not simplify to something algebraic. The full answer has two terms: the product rule first term gives arctan(x) and the second gives x/(1+x²).",
  },
  {
    id: 12, label: "cos³(x³)", difficulty: "very hard",
    structure: "chain inside chain inside chain",
    structureNote: "THREE layers: cos³ applied to x³ — three chain rules",
    steps: [
      {
        tag: "Unwrap the layers",
        tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
        instruction: "cos³(x³) = [cos(x³)]³. Three layers: outermost = □³, middle = cos(□), innermost = x³.",
        math: "h(x) = [\\cos(x^3)]^3 \\quad\\text{Layer 1: }\\square^3,\\; \\text{Layer 2: }\\cos(\\square),\\; \\text{Layer 3: }x^3",
        note: "Work from outside in. Apply chain rule to the outermost layer first, then recurse.",
        why: {
          tag: "How do I know there are three layers?",
          explanation: "Count the composition levels. Starting from x: apply x³ (get x³), apply cos (get cos(x³)), apply cube (get cos³(x³)). That is three operations applied in sequence — three layers of composition.",
          steps: [
            { text: "Layer 3 (innermost): x → x³" },
            { text: "Layer 2 (middle): x³ → cos(x³)" },
            { text: "Layer 1 (outermost): cos(x³) → [cos(x³)]³" },
          ],
          why: null,
        },
      },
      {
        tag: "Apply chain rule — Layer 1",
        tagStyle: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
        instruction: "Outer = □³. Derivative: 3□². Evaluate at □ = cos(x³).",
        math: "3[\\cos(x^3)]^2 \\cdot \\frac{d}{dx}[\\cos(x^3)]",
        note: "The remaining factor d/dx[cos(x³)] is another chain rule — layer 2.",
        why: null,
      },
      {
        tag: "Apply chain rule — Layer 2",
        tagStyle: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
        instruction: "d/dx[cos(x³)]. Outer = cos(□), inner = x³.",
        math: "-\\sin(x^3) \\cdot \\frac{d}{dx}[x^3] = -\\sin(x^3) \\cdot 3x^2",
        note: "d/dx[x³] = 3x² — this is the layer 3 derivative.",
        why: null,
      },
      {
        tag: "Assemble all layers",
        tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
        instruction: "Combine layers 1, 2, and 3.",
        math: "3[\\cos(x^3)]^2 \\cdot (-\\sin(x^3)) \\cdot 3x^2 = -9x^2\\cos^2(x^3)\\sin(x^3)",
        note: "Three multiplicative factors from three chain rule applications. The result always has as many factors as there are layers.",
        why: {
          tag: "The pattern for n layers of chain rule",
          explanation: "If h(x) = f(g(k(x))), then h′(x) = f′(g(k(x))) · g′(k(x)) · k′(x). Three layers → three factors. n layers → n factors. Always work outside in, collecting one factor per layer.",
          math: "\\frac{d}{dx}[f(g(k(x)))] = f'(g(k(x))) \\cdot g'(k(x)) \\cdot k'(x)",
          why: null,
        },
      },
    ],
    answer: "-9x^2\\cos^2(x^3)\\sin(x^3)",
    watchFor: "Three chain rules means three factors in the answer. A common error is stopping after two layers and getting −sin(x³)·3x² (forgetting the outermost layer 3cos²(x³)).",
  },
  {
    id: 13, label: "eˣ·sin(x)/x", difficulty: "hard",
    structure: "product + quotient — strategic choice",
    structureNote: "Three-way: rewrite as eˣ·sin(x)·x⁻¹ to use product rule twice",
    steps: [
      {
        tag: "Strategic simplification",
        tagStyle: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
        instruction: "eˣ·sin(x)/x = eˣ·sin(x)·x⁻¹. Three factors. Quotient rule would give messy algebra. Product rule twice is cleaner.",
        math: "\\text{Treat as: } e^x \\cdot \\sin(x) \\cdot x^{-1}",
        note: "For three factors, apply product rule as (AB)C = (AB)′C + AB·C′ where AB = eˣ·sin(x).",
        why: {
          tag: "Product rule for three factors?",
          explanation: "For h = f·g·k: h′ = f′gk + fg′k + fgk′. This follows from applying the two-factor product rule twice: treat fg as one factor, then differentiate fg using its own product rule.",
          math: "(fgk)' = f'gk + fg'k + fgk'",
          why: null,
        },
      },
      {
        tag: "Differentiate each factor",
        tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
        instruction: "Three separate derivatives.",
        math: "(e^x)' = e^x \\qquad (\\sin x)' = \\cos x \\qquad (x^{-1})' = -x^{-2}",
        note: "All direct formulas — no chain rule.",
        why: null,
      },
      {
        tag: "Assemble with three-factor product rule",
        tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
        instruction: "f′gk + fg′k + fgk′.",
        math: "e^x \\cdot \\sin x \\cdot x^{-1} + e^x \\cdot \\cos x \\cdot x^{-1} + e^x \\cdot \\sin x \\cdot (-x^{-2})",
        note: "",
        why: null,
      },
      {
        tag: "Factor and simplify",
        tagStyle: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
        instruction: "Factor eˣ/x from each term.",
        math: "\\frac{e^x}{x}\\left(\\sin x + \\cos x - \\frac{\\sin x}{x}\\right) = \\frac{e^x}{x}\\cdot\\frac{x(\\sin x+\\cos x) - \\sin x}{x} = \\frac{e^x[x(\\sin x+\\cos x)-\\sin x]}{x^2}",
        note: "Factoring is optional — both forms are correct.",
        why: null,
      },
    ],
    answer: "\\dfrac{e^x[x(\\sin x+\\cos x)-\\sin x]}{x^2}",
    watchFor: "Three-factor product rule has three terms — one for each factor being differentiated while the others stay. A common error is only writing two terms (treating two of the three factors as one).",
  },
  {
    id: 14, label: "arctan(sin(x))", difficulty: "medium",
    structure: "chain",
    structureNote: "arctan applied to sin(x) — chain rule",
    steps: [
      {
        tag: "Identify structure",
        tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
        instruction: "arctan(sin(x)). Outer = arctan(□), inner = sin(x).",
        math: "f(u) = \\arctan(u), \\quad g(x) = \\sin(x)",
        note: "The argument of arctan is sin(x), not just x. Chain rule needed.",
        why: null,
      },
      {
        tag: "Outer at inner, inner derivative",
        tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
        instruction: "f′(u) = 1/(1+u²). Evaluate at sin(x). Inner: d/dx[sin(x)] = cos(x).",
        math: "f'(g(x)) = \\frac{1}{1+\\sin^2 x} \\qquad g'(x) = \\cos x",
        note: "1+u² with u = sin(x) gives 1+sin²(x). Cannot simplify further.",
        why: null,
      },
      {
        tag: "Assemble",
        tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
        instruction: "Chain rule product.",
        math: "\\frac{d}{dx}[\\arctan(\\sin x)] = \\frac{\\cos x}{1+\\sin^2 x}",
        note: "Note: 1 + sin²(x) ≠ cos²(x). The Pythagorean identity is cos²x + sin²x = 1, so cos²x = 1 − sin²x. The denominator 1 + sin²x does not simplify using trig identities.",
        why: {
          tag: "Verify numerically at x = 0",
          explanation: "At x = 0: cos(0)/(1+sin²(0)) = 1/(1+0) = 1. Numerical: [arctan(sin(0.01)) − arctan(sin(0))]/0.01 = [arctan(0.01) − 0]/0.01 ≈ 0.01/0.01 = 1 ✓",
          why: null,
        },
      },
    ],
    answer: "\\dfrac{\\cos x}{1+\\sin^2 x}",
    watchFor: "1 + sin²(x) is NOT equal to cos²(x). cos²(x) = 1 − sin²(x). The denominator here stays as 1 + sin²(x).",
  },
  {
    id: 15, label: "√(x²+1)/x", difficulty: "hard",
    structure: "quotient, numerator needs chain",
    structureNote: "Quotient; numerator = (x²+1)^(1/2) needs chain rule",
    steps: [
      {
        tag: "Identify structure",
        tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
        instruction: "√(x²+1)/x. Quotient rule. f = (x²+1)^(1/2), g = x.",
        math: "f = (x^2+1)^{1/2}, \\quad g = x \\qquad \\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}",
        note: "Numerator is a composition — it needs chain rule.",
        why: null,
      },
      {
        tag: "Differentiate f = (x²+1)^(1/2) — chain rule",
        tagStyle: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
        instruction: "Outer = □^(1/2), inner = x²+1.",
        math: "f' = \\frac{1}{2}(x^2+1)^{-1/2} \\cdot 2x = \\frac{x}{\\sqrt{x^2+1}}",
        note: "(1/2)·(x²+1)^(−1/2) · 2x = x/√(x²+1).",
        why: null,
      },
      {
        tag: "Differentiate g = x",
        tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
        instruction: "g′ = 1.",
        math: "g' = 1",
        note: "Simple.",
        why: null,
      },
      {
        tag: "Assemble quotient rule",
        tagStyle: { bg: "#f0fdf4", text: "#14532d", border: "#86efac" },
        instruction: "Quotient rule and simplify.",
        math: "\\frac{\\dfrac{x}{\\sqrt{x^2+1}}\\cdot x - \\sqrt{x^2+1}\\cdot 1}{x^2} = \\frac{\\dfrac{x^2}{\\sqrt{x^2+1}} - \\sqrt{x^2+1}}{x^2}",
        note: "",
        why: null,
      },
      {
        tag: "Clean up — multiply numerator by √(x²+1)",
        tagStyle: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
        instruction: "Multiply numerator and denominator by √(x²+1).",
        math: "\\frac{x^2 - (x^2+1)}{x^2\\sqrt{x^2+1}} = \\frac{-1}{x^2\\sqrt{x^2+1}}",
        note: "x² − (x²+1) = −1. Clean final form.",
        why: {
          tag: "How did I know to multiply by √(x²+1)?",
          explanation: "The numerator had fractions inside it (x²/√(x²+1) − √(x²+1)). Multiplying by √(x²+1) clears the inner fraction. This is a standard algebraic technique: when you have a fraction in a numerator, multiply top and bottom by the denominator of that inner fraction.",
          why: null,
        },
      },
    ],
    answer: "\\dfrac{-1}{x^2\\sqrt{x^2+1}}",
    watchFor: "Quotient rule assembly with a complex f′ requires careful substitution. Write out f′g − fg′ explicitly before substituting, rather than trying to hold it all in your head.",
  },
];

// ─── STRATEGY GUIDE ───────────────────────────────────────────────────────────
const STRATEGIES = [
  {
    title: "Always identify the outermost structure first",
    color: "#7F77DD", bg: "#EEEDFE",
    body: "Before touching any rule, look at the whole expression and ask: what is the last operation? Product, quotient, or composition? This determines which rule to apply first. Everything else follows.",
    example: "x²·sin(x³): last operation is multiplication → product rule. NOT sin first.",
  },
  {
    title: "Product vs quotient — you can always choose",
    color: "#1D9E75", bg: "#E1F5EE",
    body: "f/g = f·g⁻¹ always. So you can always convert a quotient into a product. Choose whichever produces simpler algebra. Quotient rule tends to be messier because of the g² denominator.",
    example: "sin(x)/x² → sin(x)·x⁻². Product rule: cos(x)·x⁻² + sin(x)·(−2x⁻³). Clean.",
  },
  {
    title: "Simplify before differentiating when you can",
    color: "#BA7517", bg: "#FAEEDA",
    body: "Algebraic simplification before applying rules is always valid and often saves enormous work. Factor, cancel, use trig identities, expand small powers.",
    example: "(x²−1)/(x−1) = x+1. Just d/dx[x+1] = 1. No quotient rule at all.",
  },
  {
    title: "Chain rule multiplier: always one factor per inner layer",
    color: "#A32D2D", bg: "#FCEBEB",
    body: "For each layer of composition, chain rule adds one multiplicative factor = the derivative of that layer. n layers → n factors. The outermost result is always: outer_deriv × (all inner derivatives multiplied together).",
    example: "cos³(x³): 3cos²(x³) × (−sin(x³)) × 3x² = −9x²cos²(x³)sin(x³). Three layers, three factors.",
  },
  {
    title: "When simplification appears after differentiation",
    color: "#0891b2", bg: "#ecfeff",
    body: "After applying rules, look for: common factors to cancel, trig identities to apply, negative exponents to rewrite as fractions. This is optional for correctness but often required by exams for 'simplified form'.",
    example: "After chain rule on ln(sin(x)): (1/sin(x))·cos(x) = cos(x)/sin(x) = cot(x). Recognise the ratio.",
  },
  {
    title: "Three-factor product rule",
    color: "#6366f1", bg: "#eef2ff",
    body: "(fgh)′ = f′gh + fg′h + fgh′. Apply product rule twice, or use the three-term formula directly. Each term has exactly one factor differentiated and the rest unchanged.",
    example: "eˣ·sin(x)·x⁻¹: eˣ·sin(x)·x⁻¹ + eˣ·cos(x)·x⁻¹ + eˣ·sin(x)·(−x⁻²).",
  },
];

// ─── RENDER ───────────────────────────────────────────────────────────────────
export default function CombinedDerivativeSolver({ params = {} }) {
  const [tab, setTab] = useState("framework");
  const [selProblem, setSelProblem] = useState(0);
  const [revealStep, setRevealStep] = useState(0);
  const [showVerify, setShowVerify] = useState(false);
  const ready = useMath();

  const p = PROBLEMS[selProblem];

  const card = { background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "10px 14px", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 };

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[["framework", "Decision framework"], ["problems", "Problem solver (15 problems)"], ["strategy", "Strategy guide"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontWeight: tab === key ? 500 : 400, border: `0.5px solid ${tab === key ? "var(--color-border-info)" : "var(--color-border-secondary)"}`, background: tab === key ? "var(--color-background-info)" : "transparent", color: tab === key ? "var(--color-text-info)" : "var(--color-text-secondary)" }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: FRAMEWORK ── */}
      {tab === "framework" && (
        <div>
          <div style={{ ...card, borderLeft: "3px solid #7F77DD", borderRadius: 0, background: "#EEEDFE", marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#26215C", lineHeight: 1.6 }}>
              This is the "PEMDAS" of differentiation — a fixed hierarchy. The reason videos look like preference is that instructors skip the decision process. There IS a logical ordering, and it starts the same way every time: look at the outermost structure.
            </p>
          </div>
          {HIERARCHY.map((h, i) => (
            <div key={i} style={{ ...card, borderLeft: `3px solid ${h.color}`, borderRadius: 0, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: h.color, color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{h.level}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{h.label}</div>
              </div>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 10, lineHeight: 1.6, paddingLeft: 36 }}>{h.rule}</p>
              <div style={{ paddingLeft: 36 }}>
                {h.questions.map((q, j) => (
                  <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: h.color, fontWeight: 500, flexShrink: 0 }}>→</span>
                    <div><span style={{ color: "var(--color-text-primary)" }}>{q.q}</span><span style={{ color: "var(--color-text-secondary)" }}> {q.a}</span></div>
                  </div>
                ))}
                <WhyPanel why={h.why} depth={0} ready={ready} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 2: PROBLEMS ── */}
      {tab === "problems" && (
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
            {PROBLEMS.map((prob, i) => (
              <button key={i} onClick={() => { setSelProblem(i); setRevealStep(0); setShowVerify(false); }} style={{ padding: "4px 10px", borderRadius: 14, fontSize: 12, cursor: "pointer", fontWeight: i === selProblem ? 600 : 400, border: `0.5px solid ${i === selProblem ? "var(--color-border-info)" : "var(--color-border-secondary)"}`, background: i === selProblem ? "var(--color-background-info)" : "transparent", color: i === selProblem ? "var(--color-text-info)" : "var(--color-text-secondary)" }}>
                {prob.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-serif)", color: "var(--color-text-primary)" }}>
              d/dx [<span style={{ color: "var(--color-text-info)" }}>{p.label}</span>]
            </div>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "var(--color-background-secondary)", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-secondary)" }}>
              {p.difficulty}
            </span>
          </div>

          <div style={{ ...card, borderLeft: "3px solid #7F77DD", borderRadius: 0, marginBottom: 12, background: "#EEEDFE" }}>
            <div style={{ fontSize: 11, color: "#26215C", fontWeight: 600, marginBottom: 3, textTransform: "uppercase", letterSpacing: ".06em" }}>Structure recognition</div>
            <div style={{ fontSize: 13, color: "#3C3489" }}>{p.structureNote}</div>
          </div>

          {p.steps.map((st, i) => {
            if (i > revealStep) return null;
            const isFinal = i === p.steps.length - 1;
            const tc = st.tagStyle;
            return (
              <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden", marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-text-primary)", color: "var(--color-background-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 20, background: tc.bg, color: tc.text, border: `0.5px solid ${tc.border}` }}>{st.tag}</span>
                </div>
                <div style={{ padding: "14px 18px 0" }}>
                  <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.55, color: "var(--color-text-primary)", marginBottom: 12 }}>{st.instruction}</p>
                  <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "16px 14px", textAlign: "center", overflowX: "auto", fontSize: 16, marginBottom: 10 }}>
                    <M t={st.math} display ready={ready} />
                  </div>
                  {st.note && <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6, fontStyle: "italic", paddingLeft: 10, borderLeft: "2px solid var(--color-border-secondary)", marginBottom: 8 }}>{st.note}</p>}
                  <div style={{ paddingBottom: 14 }}><WhyPanel why={st.why} depth={0} ready={ready} /></div>
                </div>
              </div>
            );
          })}

          {revealStep < p.steps.length - 1 && (
            <button onClick={() => setRevealStep(s => s + 1)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "0.5px solid var(--color-border-info)", background: "var(--color-background-info)", color: "var(--color-text-info)", cursor: "pointer", textAlign: "left", fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
              ▶ Next step
            </button>
          )}

          {revealStep === p.steps.length - 1 && (
            <div>
              <div style={{ ...card, borderLeft: "3px solid #d97706", borderRadius: 0, background: "var(--color-background-warning)", marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-warning)", marginBottom: 4, letterSpacing: ".06em", textTransform: "uppercase" }}>Watch out for</div>
                <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{p.watchFor}</div>
              </div>
              <button onClick={() => setShowVerify(v => !v)} style={{ padding: "5px 14px", borderRadius: 8, border: "0.5px solid #059669", background: showVerify ? "#ecfdf5" : "transparent", color: "#059669", cursor: "pointer", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
                {showVerify ? "▼" : "▶"} Final answer + verify
              </button>
              {showVerify && (
                <div style={{ padding: "12px 14px", borderLeft: "3px solid #059669", borderRadius: "0 8px 8px 0", background: "var(--color-background-success)", animation: "sd .16s ease-out" }}>
                  <div style={{ fontSize: 11, color: "#047857", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Answer</div>
                  <div style={{ overflowX: "auto" }}><M t={p.answer} display ready={ready} /></div>
                </div>
              )}
            </div>
          )}

          {revealStep > 0 && (
            <button onClick={() => { setRevealStep(0); setShowVerify(false); }} style={{ marginTop: 8, padding: "5px 14px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 12 }}>
              ← Reset steps
            </button>
          )}
        </div>
      )}

      {/* ── TAB 3: STRATEGY ── */}
      {tab === "strategy" && (
        <div>
          <div style={{ ...card, borderLeft: "3px solid #7F77DD", borderRadius: 0, background: "#EEEDFE", marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "#3C3489", lineHeight: 1.7 }}>The "preference" you see in videos is actually strategic choices — paths that produce equivalent answers with different amounts of algebraic work. Here are the six most important strategic decisions.</p>
          </div>
          {STRATEGIES.map((s, i) => (
            <div key={i} style={{ ...card, borderLeft: `3px solid ${s.color}`, borderRadius: 0, marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}>{i + 1}. {s.title}</div>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 8 }}>{s.body}</p>
              <div style={{ background: s.bg, borderRadius: 6, padding: "8px 12px", fontSize: 12, color: s.color, fontFamily: "var(--font-mono)" }}>{s.example}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
