/**
 * DerivativeCoach.jsx
 * src/components/viz/react/DerivativeCoach.jsx
 *
 * Two-phase derivative coaching:
 *   Phase 1 — Multiple choice: "what rule/step applies here?"
 *              Wrong answer → explain WHY that's wrong + what to review
 *              Retry until correct
 *   Phase 2 — Fill in the blanks: partial working shown, gaps to complete
 *              Wrong → hint first, then explanation, then answer on 3rd
 *
 * Session tracker: records which concepts caused errors.
 * Fully data-driven — add problems by appending to PROBLEMS array.
 *
 * ADD MORE PROBLEMS: copy any problem object structure, give it a new id,
 * and push it into the PROBLEMS array. No other code changes needed.
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { EXTRA_PROBLEMS } from "./derivativeCoachExtras.js";

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

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEMS DATA — add new problems here, no other changes needed
// ─────────────────────────────────────────────────────────────────────────────
const PROBLEMS = [
  // ── PROBLEM 1 ─────────────────────────────────────────────────────────────
  {
    id: 1,
    expression: "x^3 \\sin(x)",
    difficulty: "medium",
    conceptTag: "Product rule",
    preview: "x³ · sin(x)",

    mcSteps: [
      {
        id: "mc1",
        question: "What is the outermost structure of x³·sin(x)? This determines which rule to apply first.",
        options: [
          { id: "A", label: "Chain rule — sin is applied to x³" },
          { id: "B", label: "Product rule — two functions multiplied together" },
          { id: "C", label: "Quotient rule — one function over another" },
          { id: "D", label: "Power rule — it's a power of x" },
        ],
        correct: "B",
        feedback: {
          A: { verdict: "wrong", message: "Chain rule applies to compositions like sin(x³) — where sin is applied TO x³. Here x³ and sin(x) are side-by-side, multiplied. Neither is 'inside' the other. The last operation applied when computing this is multiplication, not composition.", reviewConcept: "Product vs Chain Rule", reviewTip: "Ask: is one function applied to another (chain), or are two functions multiplied (product)?" },
          C: { verdict: "wrong", message: "Quotient rule applies to f/g — one function divided by another. There is no division here. sin(x) and x³ are multiplied, not divided.", reviewConcept: "Quotient Rule", reviewTip: "Quotient rule needs a fraction. Look for f/g structure." },
          D: { verdict: "partial", message: "x³ alone is a power of x, but the full expression x³·sin(x) is x³ multiplied by sin(x). The product structure is outermost. Power rule applies to x³ when you find its individual derivative inside the product rule.", reviewConcept: "Identifying Outermost Structure", reviewTip: "Look at the whole expression before any individual piece." },
        },
        correctFeedback: "Correct. x³ · sin(x) is a product — two separate functions multiplied together. Product rule applies: (f·g)′ = f′g + fg′ where f = x³ and g = sin(x).",
      },
      {
        id: "mc2",
        question: "The product rule gives (f·g)′ = f′g + fg′. Which of these correctly identifies f′ and g′?",
        options: [
          { id: "A", label: "f′ = 3x², g′ = cos(x)" },
          { id: "B", label: "f′ = 3x², g′ = −cos(x)" },
          { id: "C", label: "f′ = 3x³, g′ = cos(x)" },
          { id: "D", label: "f′ = x², g′ = cos(x)" },
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "d/dx[sin(x)] = +cos(x), not −cos(x). It's d/dx[cos(x)] = −sin(x). These two are mirror images and are the most commonly swapped. Remember: sin goes to positive cos when differentiating.", reviewConcept: "Trig Derivatives", reviewTip: "sin → cos (positive). cos → −sin (negative). The negative sign belongs to cosine, not sine." },
          C: { verdict: "wrong", message: "d/dx[x³] = 3x², not 3x³. The power rule brings the exponent down and reduces it by 1: n·xⁿ⁻¹. For x³: 3·x² = 3x². The exponent reduces from 3 to 2.", reviewConcept: "Power Rule", reviewTip: "d/dx[xⁿ] = n·xⁿ⁻¹. The exponent decreases by 1." },
          D: { verdict: "wrong", message: "d/dx[x³] = 3x², not x². The power rule is n·xⁿ⁻¹ — the coefficient 3 must come down. Missing the coefficient is a very common error.", reviewConcept: "Power Rule", reviewTip: "The full power rule is d/dx[xⁿ] = n·xⁿ⁻¹. The n in front is not optional." },
        },
        correctFeedback: "Correct. Power rule: d/dx[x³] = 3x². Trig formula: d/dx[sin(x)] = cos(x). Both are direct formulas — no chain rule needed since both have inner = x.",
      },
    ],

    blanks: [
      {
        id: "b1",
        conceptTested: "Product rule assembly",
        prefix: "\\frac{d}{dx}[x^3 \\sin x] = f'g + fg' = ",
        suffix: "",
        answer: "3x^2 \\sin x + x^3 \\cos x",
        acceptedForms: ["3x^2sinx+x^3cosx", "3x^2 sin x + x^3 cos x", "3x²sinx+x³cosx"],
        hint: "Substitute f′ = 3x², g = sin(x), f = x³, g′ = cos(x) directly into f′g + fg′. First term is f′·g, second term is f·g′.",
        explanation: "f′g = 3x²·sin(x) and fg′ = x³·cos(x). Combined: 3x²sin(x) + x³cos(x). This cannot be simplified — both terms must stay.",
        reviewConcept: "Product Rule Assembly",
      },
    ],
  },

  // ── PROBLEM 2 ─────────────────────────────────────────────────────────────
  {
    id: 2,
    expression: "\\sin(x^3)",
    difficulty: "medium",
    conceptTag: "Chain rule",
    preview: "sin(x³)",

    mcSteps: [
      {
        id: "mc1",
        question: "sin(x³): what is the outermost structure?",
        options: [
          { id: "A", label: "Product rule — sin and x³ are multiplied" },
          { id: "B", label: "Chain rule — sin is applied to x³" },
          { id: "C", label: "Power rule — it's a cube" },
          { id: "D", label: "Quotient rule" },
        ],
        correct: "B",
        feedback: {
          A: { verdict: "wrong", message: "sin(x³) is NOT sin × x³. The parentheses mean sin is applied TO x³ — sin(x³) is sin evaluated at x³. This is composition, not multiplication. sin(x)·x³ would be a product; sin(x³) is a composition.", reviewConcept: "Composition vs Product", reviewTip: "f(g(x)) = composition = chain rule. f · g = product = product rule. The parentheses tell you which." },
          C: { verdict: "wrong", message: "The cube is on x, not on the whole expression. If the problem were [sin(x)]³, the outermost would be a cube. Here the outermost is sin applied to x³.", reviewConcept: "Identifying Outermost Structure", reviewTip: "What is the very last thing computed? Here: compute x³ first, then take sin. The last step is sin — so sin is the outer function." },
          D: { verdict: "wrong", message: "No division here. Quotient rule requires f/g.", reviewConcept: "Quotient Rule", reviewTip: null },
        },
        correctFeedback: "Correct. sin(x³) is a composition: outer = sin(□), inner = x³. Chain rule applies: h′ = f′(g(x)) · g′(x).",
      },
      {
        id: "mc2",
        question: "For chain rule on sin(x³): outer = sin(□), inner = x³. What is the outer derivative f′(u) evaluated at the inner?",
        options: [
          { id: "A", label: "cos(x³)" },
          { id: "B", label: "cos(x)" },
          { id: "C", label: "cos(3x²)" },
          { id: "D", label: "−sin(x³)" },
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "cos(x) would be the outer derivative if the inner were just x. Here the inner is x³, so we evaluate cos at x³, giving cos(x³). The inner function stays inside the outer derivative.", reviewConcept: "Chain Rule — Evaluating Outer at Inner", reviewTip: "f′(g(x)) means: take the derivative of the outer function, then evaluate it at g(x). The inner function does NOT change here." },
          C: { verdict: "wrong", message: "cos(3x²) would mean you differentiated the argument x³ (getting 3x²) before putting it into cos. Wrong order. First evaluate cos at x³ to get cos(x³). Then separately multiply by 3x² (the inner derivative). These are two different steps.", reviewConcept: "Chain Rule Order", reviewTip: "Outer derivative first (cos of x³). Inner derivative second (3x²). Multiply. Never differentiate the argument inside the outer function." },
          D: { verdict: "wrong", message: "d/du[sin(u)] = cos(u), not −sin(u). It's d/du[cos(u)] = −sin(u). The outer is sin, so its derivative is positive cos.", reviewConcept: "Trig Derivatives", reviewTip: "sin → +cos. cos → −sin. The negative belongs to cos, not sin." },
        },
        correctFeedback: "Correct. d/du[sin(u)] = cos(u). Evaluated at u = x³: cos(x³). The argument stays as x³ inside the cos — it has not been differentiated yet.",
      },
    ],

    blanks: [
      {
        id: "b1",
        conceptTested: "Chain rule multiplier",
        prefix: "\\frac{d}{dx}[\\sin(x^3)] = \\cos(x^3) \\cdot ",
        suffix: "",
        answer: "3x^2",
        acceptedForms: ["3x^2", "3x²"],
        hint: "Multiply the outer derivative cos(x³) by the inner derivative. The inner function is x³. What is d/dx[x³]?",
        explanation: "Inner derivative: d/dx[x³] = 3x². Full answer: cos(x³) · 3x². The 3x² is the chain rule multiplier — it appears because the argument is x³, not x.",
        reviewConcept: "Chain Rule Multiplier",
      },
    ],
  },

  // ── PROBLEM 3 ─────────────────────────────────────────────────────────────
  {
    id: 3,
    expression: "\\frac{e^x}{\\cos(x)}",
    difficulty: "medium",
    conceptTag: "Quotient rule",
    preview: "eˣ / cos(x)",

    mcSteps: [
      {
        id: "mc1",
        question: "eˣ/cos(x) — what is the correct approach?",
        options: [
          { id: "A", label: "Chain rule — eˣ is composed with cos(x)" },
          { id: "B", label: "Product rule — rewrite as eˣ · (cos x)⁻¹" },
          { id: "C", label: "Quotient rule — one function over another" },
          { id: "D", label: "Both B and C are valid" },
        ],
        correct: "D",
        feedback: {
          A: { verdict: "wrong", message: "eˣ is not applied TO cos(x). e^(cos(x)) would be a composition — eˣ with inner = cos(x). Here eˣ and cos(x) are separate functions in a fraction. No composition.", reviewConcept: "Composition vs Quotient", reviewTip: "e^(cos(x)) = chain rule. eˣ/cos(x) = quotient (or product). Look at whether one function is inside another, or whether they're in a fraction." },
          B: { verdict: "partial", message: "B is correct — rewriting as a product is valid. But the full answer is D: both B (product) and C (quotient) are valid approaches that produce the same answer. Neither is wrong.", reviewConcept: "Strategic Choice", reviewTip: "Quotient f/g = product f·g⁻¹. You can always choose either path." },
          C: { verdict: "partial", message: "C is correct — quotient rule is valid here. But so is B (rewriting as a product). Both approaches are correct. The answer is D.", reviewConcept: "Strategic Choice", reviewTip: "Both paths are valid. Choose the one that looks cleaner to you." },
        },
        correctFeedback: "Both are correct. Quotient rule: (f′g − fg′)/g². Product rewrite: eˣ·(cos x)⁻¹ then product rule. We'll use the quotient rule here.",
      },
      {
        id: "mc2",
        question: "Quotient rule: (f′g − fg′)/g². With f = eˣ, g = cos(x), which correctly identifies f′ and g′?",
        options: [
          { id: "A", label: "f′ = eˣ, g′ = −sin(x)" },
          { id: "B", label: "f′ = eˣ, g′ = sin(x)" },
          { id: "C", label: "f′ = xeˣ⁻¹, g′ = −sin(x)" },
          { id: "D", label: "f′ = eˣ, g′ = −cos(x)" },
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "d/dx[cos(x)] = −sin(x), not +sin(x). Cosine differentiates to negative sine. This sign error in the quotient rule will flip your final answer.", reviewConcept: "Trig Derivatives", reviewTip: "cos → −sin. The negative sign is part of the derivative of cos, not an optional element." },
          C: { verdict: "wrong", message: "d/dx[eˣ] = eˣ, not x·eˣ⁻¹. The power rule formula n·xⁿ⁻¹ applies to xⁿ (x as the base). For eˣ (e as the base), the derivative is just eˣ — a completely different formula.", reviewConcept: "Exponential Derivative", reviewTip: "d/dx[eˣ] = eˣ. The function is its own derivative. Do not apply the power rule to eˣ." },
          D: { verdict: "wrong", message: "d/dx[cos(x)] = −sin(x), not −cos(x). The derivative of cosine is negative sine, not negative cosine.", reviewConcept: "Trig Derivatives", reviewTip: "cos → −sin. Not −cos." },
        },
        correctFeedback: "Correct. d/dx[eˣ] = eˣ (its own derivative). d/dx[cos(x)] = −sin(x). Both are direct formulas with no chain rule since both have inner = x.",
      },
    ],

    blanks: [
      {
        id: "b1",
        conceptTested: "Quotient rule assembly — sign and order",
        prefix: "\\frac{d}{dx}\\left[\\frac{e^x}{\\cos x}\\right] = \\frac{f'g - fg'}{g^2} = \\frac{",
        suffix: "}{\\cos^2 x}",
        answer: "e^x \\cos x + e^x \\sin x",
        acceptedForms: ["e^x cosx + e^x sinx", "e^x(cosx+sinx)", "e^x(\\cos x+\\sin x)"],
        hint: "Substitute: f′ = eˣ, g = cos(x), f = eˣ, g′ = −sin(x). The numerator is f′g − fg′ = eˣ·cos(x) − eˣ·(−sin(x)). Careful with the double negative.",
        explanation: "f′g = eˣ·cos(x). fg′ = eˣ·(−sin(x)). So f′g − fg′ = eˣcos(x) − eˣ(−sin(x)) = eˣcos(x) + eˣsin(x) = eˣ(cos(x)+sin(x)). The minus a negative becomes plus.",
        reviewConcept: "Quotient Rule — Sign Handling",
      },
    ],
  },

  // ── PROBLEM 4 ─────────────────────────────────────────────────────────────
  {
    id: 4,
    expression: "x^2 \\cos(x^2)",
    difficulty: "hard",
    conceptTag: "Product + Chain",
    preview: "x² · cos(x²)",

    mcSteps: [
      {
        id: "mc1",
        question: "x²·cos(x²) — what is the outermost structure, and which rule applies first?",
        options: [
          { id: "A", label: "Chain rule — x² is inside cos" },
          { id: "B", label: "Product rule — x² and cos(x²) are multiplied" },
          { id: "C", label: "Power rule on x²" },
          { id: "D", label: "Chain rule on cos(x²), then product rule" },
        ],
        correct: "B",
        feedback: {
          A: { verdict: "wrong", message: "x² IS inside cos, but that only applies to the cos(x²) factor. The whole expression is x² multiplied by cos(x²). The outermost operation is multiplication. Product rule must come first.", reviewConcept: "Outermost Structure", reviewTip: "The outermost operation is always applied last. Here: compute x² and cos(x²), then multiply. The last step is multiplication → product rule." },
          C: { verdict: "wrong", message: "x² alone is a power, but x²·cos(x²) is a product. Focusing on one piece before identifying the full structure is the mistake.", reviewConcept: "Outermost Structure", reviewTip: "Look at the complete expression before any piece of it." },
          D: { verdict: "partial", message: "You will need chain rule on cos(x²) — but only after applying product rule to the whole expression. The order is: product rule first (outermost), then chain rule on the cos(x²) piece. D has the steps in the right order but the wrong framing — you don't apply both simultaneously.", reviewConcept: "Rule Order", reviewTip: "Always resolve the outermost structure first, then recurse inward." },
        },
        correctFeedback: "Product rule first. f = x², g = cos(x²). Then when you compute g′, you'll need chain rule on cos(x²).",
      },
      {
        id: "mc2",
        question: "Product rule creates two terms. The second term is f · g′ = x² · (cos(x²))′. What is (cos(x²))′?",
        options: [
          { id: "A", label: "−sin(x²)" },
          { id: "B", label: "−sin(x²) · 2x" },
          { id: "C", label: "−sin(2x)" },
          { id: "D", label: "sin(x²) · 2x" },
        ],
        correct: "B",
        feedback: {
          A: { verdict: "partial", message: "−sin(x²) is the outer derivative evaluated at the inner — but you're missing the chain rule multiplier. Since the inner function is x² (not x), you must multiply by the inner derivative 2x. The full answer is −sin(x²)·2x.", reviewConcept: "Chain Rule Multiplier", reviewTip: "The chain rule always adds the inner derivative as a multiplier. If inner = x, multiplier = 1 (invisible). If inner = x², multiplier = 2x." },
          C: { verdict: "wrong", message: "cos(x²) is NOT the same as cos(2x). The argument is x-squared, not 2x. These are completely different values. For example at x=1: cos(1²)=cos(1)≈0.540, but cos(2·1)=cos(2)≈−0.416.", reviewConcept: "Composition Notation", reviewTip: "x² means x times x. 2x means 2 times x. cos(x²) and cos(2x) are different functions." },
          D: { verdict: "wrong", message: "d/dx[cos(u)] = −sin(u), not +sin(u). The minus sign is essential.", reviewConcept: "Trig Derivatives", reviewTip: "cos → −sin. The negative is non-negotiable." },
        },
        correctFeedback: "Chain rule on cos(x²): outer = cos(□) → −sin(□), evaluated at x² → −sin(x²). Times inner derivative 2x. Result: −sin(x²)·2x.",
      },
    ],

    blanks: [
      {
        id: "b1",
        conceptTested: "Product rule assembly with chain inside",
        prefix: "\\frac{d}{dx}[x^2\\cos(x^2)] = \\underbrace{2x\\cos(x^2)}_{f'g} + \\underbrace{x^2 \\cdot(-\\sin(x^2))\\cdot}_{fg' =\\, x^2 \\cdot}",
        suffix: "",
        answer: "2x",
        acceptedForms: ["2x"],
        hint: "The product rule second term is f · g′ = x² · (−sin(x²)) · ___. The blank is the chain rule multiplier from differentiating x² inside cos. What is d/dx[x²]?",
        explanation: "The chain rule multiplier is d/dx[x²] = 2x. So the full second term is x²·(−sin(x²))·2x = −2x³sin(x²).",
        reviewConcept: "Chain Rule Multiplier in Product",
      },
      {
        id: "b2",
        conceptTested: "Final assembly and simplification",
        prefix: "\\text{Final answer: } 2x\\cos(x^2)",
        suffix: "",
        answer: "- 2x^3 \\sin(x^2)",
        acceptedForms: ["-2x^3sin(x^2)", "- 2x^3 sin(x^2)", "-2x³sin(x²)"],
        hint: "The second term from the product rule is x²·(−sin(x²))·2x. Simplify: x²·2x = 2x³. So the second term is −2x³sin(x²).",
        explanation: "x²·(−sin(x²))·2x = −2x³sin(x²). Full answer: 2x·cos(x²) − 2x³·sin(x²). Factor 2x: 2x[cos(x²) − x²sin(x²)]. Both forms correct.",
        reviewConcept: "Product Rule Full Assembly",
      },
    ],
  },

  // ── PROBLEM 5 ─────────────────────────────────────────────────────────────
  {
    id: 5,
    expression: "\\arctan\\!\\left(\\frac{1}{x}\\right)",
    difficulty: "hard",
    conceptTag: "Chain + Inverse trig + Simplification",
    preview: "arctan(1/x)",

    mcSteps: [
      {
        id: "mc1",
        question: "arctan(1/x) — what rule applies?",
        options: [
          { id: "A", label: "Direct formula — d/dx[arctan(x)] = 1/(1+x²)" },
          { id: "B", label: "Chain rule — arctan applied to 1/x which is not just x" },
          { id: "C", label: "Quotient rule — there is a fraction inside" },
          { id: "D", label: "Product rule — rewrite 1/x as x⁻¹ first" },
        ],
        correct: "B",
        feedback: {
          A: { verdict: "partial", message: "The formula d/dx[arctan(x)] = 1/(1+x²) only applies directly when the argument is just x. Here the argument is 1/x — not x. When the argument is anything other than x, chain rule is needed: outer formula evaluated at 1/x, multiplied by d/dx[1/x].", reviewConcept: "Direct Formula vs Chain Rule", reviewTip: "Direct formula when inner = x. Chain rule when inner = anything else. Check the argument." },
          C: { verdict: "wrong", message: "The fraction 1/x is the argument of arctan, not a numerator divided by a denominator of the whole expression. The outermost structure is arctan applied to something — that's chain rule.", reviewConcept: "Outermost Structure", reviewTip: "The fraction is inside arctan. The outermost operation is arctan(□) — chain rule." },
          D: { verdict: "partial", message: "Rewriting 1/x as x⁻¹ is useful for finding the inner derivative, but the outer rule is still chain rule on arctan(x⁻¹), not product rule. Product rule would be needed if arctan were multiplied by x⁻¹.", reviewConcept: "Composition vs Product", reviewTip: "arctan(x⁻¹) is arctan composed with x⁻¹. Chain rule. arctan·x⁻¹ would be product rule — different expression." },
        },
        correctFeedback: "Chain rule: outer = arctan(□), inner = 1/x = x⁻¹. Outer formula: 1/(1+□²), evaluated at 1/x. Times inner derivative d/dx[1/x].",
      },
      {
        id: "mc2",
        question: "Outer derivative formula 1/(1+□²) evaluated at □ = 1/x gives what?",
        options: [
          { id: "A", label: "1/(1 + 1/x²)" },
          { id: "B", label: "1/(1 + x²)" },
          { id: "C", label: "1/(1 + 1/x)" },
          { id: "D", label: "x²/(1 + x²)" },
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "1/(1+x²) would be the result if the inner were just x. Here inner = 1/x. Substituting u = 1/x into 1/(1+u²): 1/(1+(1/x)²) = 1/(1+1/x²). The x² in the formula comes from squaring the argument, and the argument here is 1/x, not x.", reviewConcept: "Evaluating Outer at Inner", reviewTip: "Square the actual inner function. (1/x)² = 1/x², not x²." },
          C: { verdict: "wrong", message: "(1/x)² is 1/x², not 1/x. Squaring 1/x: (1/x)² = 1²/x² = 1/x².", reviewConcept: "Squaring Fractions", reviewTip: "(a/b)² = a²/b². So (1/x)² = 1/x²." },
          D: { verdict: "wrong", message: "x²/(1+x²) would be the simplified form of 1/(1+1/x²) — but that simplification comes after multiplying through by x²/x². At this step, just substitute 1/x into the formula.", reviewConcept: "Evaluating Outer at Inner", reviewTip: "Evaluate first, simplify after." },
        },
        correctFeedback: "Correct. u = 1/x → u² = (1/x)² = 1/x². So 1/(1+u²) = 1/(1+1/x²). This can be simplified to x²/(x²+1) by multiplying top and bottom by x², but hold that for later.",
      },
    ],

    blanks: [
      {
        id: "b1",
        conceptTested: "Inner derivative of 1/x",
        prefix: "\\text{Inner derivative: } \\frac{d}{dx}\\left[\\frac{1}{x}\\right] = \\frac{d}{dx}[x^{-1}] = ",
        suffix: "",
        answer: "-x^{-2}",
        acceptedForms: ["-x^{-2}", "-1/x^2", "-1/x²", "-x^(-2)"],
        hint: "Rewrite 1/x as x⁻¹ and apply the power rule: d/dx[xⁿ] = n·xⁿ⁻¹ with n = −1.",
        explanation: "d/dx[x⁻¹] = −1·x⁻¹⁻¹ = −x⁻² = −1/x². The power rule works for negative exponents.",
        reviewConcept: "Power Rule for Negative Exponents",
      },
      {
        id: "b2",
        conceptTested: "Assembly and simplification",
        prefix: "\\frac{d}{dx}[\\arctan(1/x)] = \\frac{1}{1+\\frac{1}{x^2}} \\cdot \\left(-\\frac{1}{x^2}\\right) = ",
        suffix: "",
        answer: "-\\frac{1}{1+x^2}",
        acceptedForms: ["-1/(1+x^2)", "-1/(x^2+1)", "\\frac{-1}{1+x^2}"],
        hint: "First simplify 1/(1+1/x²): multiply numerator and denominator by x² to get x²/(x²+1). Then multiply by −1/x². The x² cancels.",
        explanation: "1/(1+1/x²) = x²/(x²+1) after multiplying by x²/x². Then: x²/(x²+1) · (−1/x²) = −1/(x²+1) = −1/(1+x²). The x² cancels completely.",
        reviewConcept: "Simplification After Chain Rule",
      },
    ],
  },

  // ── PROBLEM 6 ─────────────────────────────────────────────────────────────
  {
    id: 6,
    expression: "e^{\\sin(x^2)}",
    difficulty: "hard",
    conceptTag: "Chain rule × 3 layers",
    preview: "e^(sin(x²))",

    mcSteps: [
      {
        id: "mc1",
        question: "e^(sin(x²)) has how many layers of chain rule?",
        options: [
          { id: "A", label: "One — it's just an exponential" },
          { id: "B", label: "Two — outer is e^□, inner is sin(x²)" },
          { id: "C", label: "Three — outer e^□, middle sin(□), inner x²" },
          { id: "D", label: "Two — outer is sin(□), inner is x²" },
        ],
        correct: "C",
        feedback: {
          A: { verdict: "wrong", message: "The exponent is not just x — it's sin(x²), which itself has two layers. e^(sin(x²)) has three nested operations: x² inside sin inside exp. Each layer contributes a chain rule factor.", reviewConcept: "Counting Composition Layers", reviewTip: "Follow the chain: x → x² → sin(x²) → e^(sin(x²)). Count the operations: 3 steps = 3 layers." },
          B: { verdict: "partial", message: "Almost — you correctly identified outer = e^□ and inner = sin(x²). But sin(x²) is itself a composition (sin applied to x²), so when you differentiate the 'inner' sin(x²), you'll need chain rule again. Total: 3 layers, 3 factors in the answer.", reviewConcept: "Layers Within Layers", reviewTip: "Check: is the 'inner' function itself a composition? sin(x²) is — so count it as two layers." },
          D: { verdict: "wrong", message: "The outermost operation is e^□ — the exponential wraps everything. After computing x², we apply sin, then we apply exp. The last operation is exp, so exp is outermost.", reviewConcept: "Outermost Structure", reviewTip: "Follow the evaluation order from inside out. The LAST operation applied is the OUTERMOST function." },
        },
        correctFeedback: "Three layers: (1) outermost = e^□, (2) middle = sin(□), (3) inner = x². Chain rule gives three multiplicative factors — one per layer.",
      },
      {
        id: "mc2",
        question: "Layer 1 (outermost): d/du[eᵘ] = eᵘ, evaluated at u = sin(x²). What does the first factor equal?",
        options: [
          { id: "A", label: "e^(sin(x²))" },
          { id: "B", label: "e^(cos(x²))" },
          { id: "C", label: "e^(sin(x))·2x" },
          { id: "D", label: "sin(x²)·e^(sin(x²))" },
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "The first layer only differentiates the outermost function (exp). Its derivative is eᵘ evaluated at the full inner = sin(x²). The sin(x²) stays intact — it has not been differentiated yet. The next layer handles sin.", reviewConcept: "Chain Rule Layer by Layer", reviewTip: "One layer at a time. Layer 1: differentiate exp, keep the full inner sin(x²) unchanged. Layer 2 will handle sin." },
          C: { verdict: "wrong", message: "e^(sin(x)) would mean the inner is sin(x), not sin(x²). The inner is sin(x²) and must stay exactly as is inside the exponential.", reviewConcept: "Preserving Inner Function", reviewTip: "The inner function in the exponential is sin(x²), complete with the x²." },
          D: { verdict: "wrong", message: "sin(x²) should not multiply the exponential at this layer. Layer 1 result is just e^(sin(x²)) — the exponential evaluated at its argument. The chain rule multiplier (which will involve sin and cos terms) comes from the subsequent layers.", reviewConcept: "Chain Rule Layer by Layer", reviewTip: null },
        },
        correctFeedback: "Layer 1: d/du[eᵘ] = eᵘ. Evaluated at sin(x²): e^(sin(x²)). The exponent stays as sin(x²). Layers 2 and 3 will be multiplied onto this.",
      },
    ],

    blanks: [
      {
        id: "b1",
        conceptTested: "Layer 2 — derivative of sin(x²)",
        prefix: "\\text{Layer 2: } \\frac{d}{d\\square}[\\sin(\\square)]\\text{ evaluated at }\\square=x^2, \\text{ times layer 3 }= ",
        suffix: "",
        answer: "\\cos(x^2) \\cdot 2x",
        acceptedForms: ["cos(x^2)*2x", "cos(x²)·2x", "2x cos(x^2)", "2x\\cos(x^2)"],
        hint: "Layer 2 is chain rule on sin(x²): outer of this sub-problem = sin(□) → cos(□), evaluated at x². Inner = x² → derivative = 2x. Multiply these two.",
        explanation: "d/dx[sin(x²)] = cos(x²)·2x. This is its own mini chain rule: cos(x²) from the outer, 2x from the inner x².",
        reviewConcept: "Chain Rule on Middle Layer",
      },
      {
        id: "b2",
        conceptTested: "Full three-layer assembly",
        prefix: "\\frac{d}{dx}[e^{\\sin(x^2)}] = e^{\\sin(x^2)} \\cdot ",
        suffix: "",
        answer: "\\cos(x^2) \\cdot 2x",
        acceptedForms: ["cos(x^2)·2x", "2x cos(x^2)", "2x\\cos(x^2)", "cos(x²)·2x"],
        hint: "Multiply all three layers: Layer 1 (e^(sin(x²))) × Layer 2×3 (cos(x²)·2x). The full result has three factors.",
        explanation: "e^(sin(x²)) · cos(x²) · 2x. Three layers → three factors. Often written as 2x·cos(x²)·e^(sin(x²)).",
        reviewConcept: "Three-Layer Chain Rule Assembly",
      },
    ],
  },

  // ── PROBLEM 7 ─────────────────────────────────────────────────────────────
  {
    id: 7,
    expression: "\\frac{\\sin(x)}{1 + \\cos(x)}",
    difficulty: "hard",
    conceptTag: "Quotient rule + trig simplification",
    preview: "sin(x)/(1+cos(x))",

    mcSteps: [
      {
        id: "mc1",
        question: "sin(x)/(1+cos(x)) — what rule applies?",
        options: [
          { id: "A", label: "Product rule with rewrite" },
          { id: "B", label: "Quotient rule" },
          { id: "C", label: "Chain rule" },
          { id: "D", label: "Both A and B — both are valid" },
        ],
        correct: "D",
        feedback: {
          A: { verdict: "partial", message: "A is valid but not the only valid approach. Rewriting as sin(x)·(1+cos(x))⁻¹ and using product rule works — and then the (1+cos(x))⁻¹ factor needs chain rule. The full correct answer is D — both A and B are valid.", reviewConcept: "Strategic Choice", reviewTip: null },
          B: { verdict: "partial", message: "Quotient rule is valid, but so is the product rewrite (A). Full answer is D.", reviewConcept: "Strategic Choice", reviewTip: null },
          C: { verdict: "wrong", message: "There is no composition here — sin(x) is not applied to (1+cos(x)). The outermost structure is a fraction, so quotient rule (or product rewrite) applies.", reviewConcept: "Outermost Structure", reviewTip: null },
        },
        correctFeedback: "Both quotient rule and product rewrite are valid. We'll use quotient rule: f = sin(x), g = 1+cos(x).",
      },
      {
        id: "mc2",
        question: "Quotient rule numerator is f′g − fg′. With f = sin(x), g = 1+cos(x), what is g′?",
        options: [
          { id: "A", label: "−sin(x)" },
          { id: "B", label: "sin(x)" },
          { id: "C", label: "1 − sin(x)" },
          { id: "D", label: "−cos(x)" },
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "d/dx[1+cos(x)] = 0 + (−sin(x)) = −sin(x). The derivative of 1 is 0 (constant). The derivative of cos(x) is −sin(x). So g′ = −sin(x).", reviewConcept: "Sum Rule + Trig Derivative", reviewTip: "Sum rule: differentiate term by term. d/dx[1] = 0. d/dx[cos(x)] = −sin(x). Sum = −sin(x)." },
          C: { verdict: "wrong", message: "d/dx[1] = 0, not 1. The derivative of a constant is zero. d/dx[cos(x)] = −sin(x). Total: 0 + (−sin(x)) = −sin(x).", reviewConcept: "Derivative of a Constant", reviewTip: "Constants have zero derivative. They disappear when you differentiate." },
          D: { verdict: "wrong", message: "d/dx[cos(x)] = −sin(x), not −cos(x). The derivative of cos is negative sine.", reviewConcept: "Trig Derivatives", reviewTip: "cos → −sin. Not → −cos." },
        },
        correctFeedback: "g = 1+cos(x). Sum rule: g′ = d/dx[1] + d/dx[cos(x)] = 0 + (−sin(x)) = −sin(x).",
      },
    ],

    blanks: [
      {
        id: "b1",
        conceptTested: "Quotient rule numerator with double negative",
        prefix: "\\text{Numerator: } f'g - fg' = \\cos(x)(1+\\cos x) - \\sin(x) \\cdot(",
        suffix: ") = \\cos x + \\cos^2 x + \\sin^2 x",
        answer: "-\\sin x",
        acceptedForms: ["-sinx", "-\\sin x", "-sin(x)"],
        hint: "g′ = −sin(x). So fg′ = sin(x)·(−sin(x)) = −sin²(x). The numerator is f′g − fg′ = cos(x)(1+cos(x)) − sin(x)·(g′). Fill in g′.",
        explanation: "g′ = −sin(x). So the numerator is cos(x)(1+cos x) − sin(x)·(−sin x) = cos(x)+cos²(x)+sin²(x). The two negatives cancel: minus times negative sin = plus sin².",
        reviewConcept: "Quotient Rule — Double Negative",
      },
      {
        id: "b2",
        conceptTested: "Pythagorean identity simplification",
        prefix: "\\cos x + \\cos^2 x + \\sin^2 x = \\cos x + ",
        suffix: "\\qquad \\therefore \\text{ answer} = \\frac{1+\\cos x}{(1+\\cos x)^2} = \\frac{1}{1+\\cos x}",
        answer: "1",
        acceptedForms: ["1"],
        hint: "What does cos²(x) + sin²(x) equal? This is one of the Pythagorean identities.",
        explanation: "cos²(x) + sin²(x) = 1. Always. So cos(x) + cos²(x) + sin²(x) = cos(x) + 1 = 1 + cos(x). Then the denominator is (1+cos(x))², so the whole thing simplifies beautifully to 1/(1+cos(x)).",
        reviewConcept: "Pythagorean Identity in Differentiation",
      },
    ],
  },

  // ── PROBLEM 8 ─────────────────────────────────────────────────────────────
  {
    id: 8,
    expression: "x \\cdot \\arcsin(x)",
    difficulty: "medium",
    conceptTag: "Product + Inverse trig",
    preview: "x · arcsin(x)",

    mcSteps: [
      {
        id: "mc1",
        question: "x·arcsin(x) — what rule?",
        options: [
          { id: "A", label: "Chain rule — arcsin applied to x" },
          { id: "B", label: "Product rule — x and arcsin(x) multiplied" },
          { id: "C", label: "Direct formula for arcsin" },
          { id: "D", label: "Quotient rule" },
        ],
        correct: "B",
        feedback: {
          A: { verdict: "wrong", message: "arcsin(x) alone would just use the direct formula since inner = x. But x·arcsin(x) is a product: x and arcsin(x) are multiplied together. Product rule applies to the whole expression.", reviewConcept: "Product vs Direct Formula", reviewTip: null },
          C: { verdict: "partial", message: "Direct formula applies to arcsin(x) alone. The full expression x·arcsin(x) is a product — product rule is needed on the whole thing. The arcsin direct formula will be used inside the product rule for g′.", reviewConcept: "Outermost vs Inner Rule", reviewTip: null },
          D: { verdict: "wrong", message: "No division here.", reviewConcept: "Identifying Rules", reviewTip: null },
        },
        correctFeedback: "Product rule. f = x, g = arcsin(x). f′ = 1 (power rule). g′ = 1/√(1−x²) (inverse trig formula).",
      },
    ],

    blanks: [
      {
        id: "b1",
        conceptTested: "Inverse trig derivative",
        prefix: "g = \\arcsin(x),\\quad g' = ",
        suffix: "",
        answer: "\\frac{1}{\\sqrt{1-x^2}}",
        acceptedForms: ["1/sqrt(1-x^2)", "1/\\sqrt{1-x^2}", "(1-x^2)^{-1/2}"],
        hint: "The derivative of arcsin(x) is one of the inverse trig formulas. It involves a square root. What is d/dx[arcsin(x)]?",
        explanation: "d/dx[arcsin(x)] = 1/√(1−x²). This is derived by: let y = arcsin(x), so sin(y) = x. Differentiate: cos(y)·dy/dx = 1, so dy/dx = 1/cos(y) = 1/√(1−sin²(y)) = 1/√(1−x²).",
        reviewConcept: "Inverse Trig Derivatives",
      },
      {
        id: "b2",
        conceptTested: "Product rule with inverse trig",
        prefix: "\\frac{d}{dx}[x\\arcsin x] = 1 \\cdot \\arcsin(x) + x \\cdot ",
        suffix: "",
        answer: "\\frac{1}{\\sqrt{1-x^2}}",
        acceptedForms: ["1/sqrt(1-x^2)", "1/\\sqrt{1-x^2}"],
        hint: "Product rule second term: f·g′ = x·(g′). You just found g′ in the previous blank.",
        explanation: "Full answer: arcsin(x) + x/√(1−x²). The first term comes from f′·g = 1·arcsin(x). The second from f·g′ = x·(1/√(1−x²)).",
        reviewConcept: "Product Rule with Inverse Trig",
      },
    ],
  },

  // ── PROBLEM 9 ─────────────────────────────────────────────────────────────
  {
    id: 9,
    expression: "\\ln(x^2 + 1)",
    difficulty: "medium",
    conceptTag: "Chain rule — log",
    preview: "ln(x²+1)",

    mcSteps: [
      {
        id: "mc1",
        question: "ln(x²+1) — inner = x²+1 ≠ x. Which rule?",
        options: [
          { id: "A", label: "Direct formula: d/dx[ln(x)] = 1/x" },
          { id: "B", label: "Chain rule: outer = ln(□), inner = x²+1" },
          { id: "C", label: "Product rule: ln and x²+1 multiplied" },
          { id: "D", label: "Sum rule: ln(x²) + ln(1)" },
        ],
        correct: "B",
        feedback: {
          A: { verdict: "partial", message: "The formula 1/x applies when the argument is exactly x. Here the argument is x²+1. Chain rule: evaluate 1/□ at □ = x²+1, giving 1/(x²+1), then multiply by the inner derivative d/dx[x²+1].", reviewConcept: "Direct Formula vs Chain Rule", reviewTip: null },
          C: { verdict: "wrong", message: "ln(x²+1) means ln applied to (x²+1) — composition, not multiplication. ln and (x²+1) are not multiplied; the second is the argument of the first.", reviewConcept: "Composition vs Product", reviewTip: null },
          D: { verdict: "wrong", message: "ln(x²+1) ≠ ln(x²) + ln(1). The log product rule says ln(A·B) = ln(A) + ln(B). But x²+1 is a sum, not a product — it cannot be split with log rules.", reviewConcept: "Log Properties", reviewTip: "ln(A+B) cannot be split. Only ln(A·B) = ln(A)+ln(B) and ln(A/B) = ln(A)−ln(B)." },
        },
        correctFeedback: "Chain rule. Outer = ln(□) → derivative 1/□. Evaluated at x²+1: 1/(x²+1). Times inner derivative d/dx[x²+1].",
      },
    ],

    blanks: [
      {
        id: "b1",
        conceptTested: "Chain rule on ln(inner)",
        prefix: "\\frac{d}{dx}[\\ln(x^2+1)] = \\frac{1}{x^2+1} \\cdot ",
        suffix: "",
        answer: "2x",
        acceptedForms: ["2x"],
        hint: "The blank is the inner derivative: d/dx[x²+1]. Differentiate x²+1 term by term.",
        explanation: "d/dx[x²+1] = 2x + 0 = 2x. Full answer: 2x/(x²+1). This is a very common form in integration too — the numerator is the derivative of the denominator.",
        reviewConcept: "Chain Rule on Log",
      },
    ],
  },

  // ── PROBLEM 10 ────────────────────────────────────────────────────────────
  {
    id: 10,
    expression: "\\sqrt{\\sin(x)} \\cdot e^{x^2}",
    difficulty: "very hard",
    conceptTag: "Product + Chain + Chain",
    preview: "√(sin(x)) · e^(x²)",

    mcSteps: [
      {
        id: "mc1",
        question: "√(sin(x)) · e^(x²) — what's the outermost structure and first rule?",
        options: [
          { id: "A", label: "Chain rule on √(sin(x))" },
          { id: "B", label: "Product rule — two functions multiplied" },
          { id: "C", label: "Chain rule on e^(x²)" },
          { id: "D", label: "Quotient rule" },
        ],
        correct: "B",
        feedback: {
          A: { verdict: "partial", message: "Chain rule will be needed for √(sin(x)), but only after applying product rule to the whole expression. A and C both point at individual pieces — but the outermost structure of the whole expression is multiplication.", reviewConcept: "Outermost First", reviewTip: null },
          C: { verdict: "partial", message: "Same as A — chain rule on e^(x²) is needed, but only as a sub-problem inside the product rule. Outermost structure first.", reviewConcept: "Outermost First", reviewTip: null },
          D: { verdict: "wrong", message: "No division.", reviewConcept: "Identifying Rules", reviewTip: null },
        },
        correctFeedback: "Product rule first. f = √(sin(x)) = (sin(x))^(1/2), g = e^(x²). Both will need chain rule for their individual derivatives.",
      },
      {
        id: "mc2",
        question: "Find f′ where f = (sin(x))^(1/2). Which is correct?",
        options: [
          { id: "A", label: "(1/2)(sin(x))^(−1/2)" },
          { id: "B", label: "(1/2)(sin(x))^(−1/2) · cos(x)" },
          { id: "C", label: "(1/2)cos(x)^(−1/2)" },
          { id: "D", label: "(1/2)(sin(x))^(−1/2) · (−cos(x))" },
        ],
        correct: "B",
        feedback: {
          A: { verdict: "partial", message: "Almost. (1/2)(sin(x))^(−1/2) is the outer derivative evaluated at the inner. But you're missing the chain rule multiplier: the inner is sin(x), so multiply by d/dx[sin(x)] = cos(x).", reviewConcept: "Chain Rule Multiplier", reviewTip: "Outer derivative at inner × inner derivative. You have the first factor; don't forget the second." },
          C: { verdict: "wrong", message: "The (−1/2) power applies to the entire inner function sin(x), not just to cos(x). After the power rule on the outer, we evaluate at the inner: (1/2)(sin(x))^(−1/2). Then multiply by the inner derivative cos(x).", reviewConcept: "Evaluating Outer at Inner", reviewTip: null },
          D: { verdict: "wrong", message: "d/dx[sin(x)] = +cos(x), not −cos(x). The derivative of sin is positive cos.", reviewConcept: "Trig Derivatives", reviewTip: null },
        },
        correctFeedback: "Chain rule on (sin(x))^(1/2): outer = □^(1/2) → (1/2)□^(−1/2), evaluated at sin(x) → (1/2)(sin(x))^(−1/2). Times inner d/dx[sin(x)] = cos(x). Full: cos(x)/(2√(sin(x))).",
      },
    ],

    blanks: [
      {
        id: "b1",
        conceptTested: "Chain rule on e^(x²)",
        prefix: "g = e^{x^2}, \\quad g' = e^{x^2} \\cdot ",
        suffix: "",
        answer: "2x",
        acceptedForms: ["2x"],
        hint: "eᵘ is its own derivative. Evaluated at u = x². Then multiply by the inner derivative d/dx[x²].",
        explanation: "d/dx[e^(x²)] = e^(x²) · 2x. The exponential stays unchanged (its own derivative), multiplied by the inner derivative 2x.",
        reviewConcept: "Chain Rule on Exponential",
      },
      {
        id: "b2",
        conceptTested: "Full product rule assembly",
        prefix: "\\frac{d}{dx}[\\sqrt{\\sin x}\\cdot e^{x^2}] = \\frac{\\cos x}{2\\sqrt{\\sin x}}\\cdot e^{x^2} + \\sqrt{\\sin x} \\cdot ",
        suffix: "",
        answer: "2x e^{x^2}",
        acceptedForms: ["2x e^{x^2}", "2xe^{x^2}", "e^{x^2}·2x"],
        hint: "Second term of product rule: f · g′ = √(sin(x)) · g′. You found g′ in the previous blank.",
        explanation: "g′ = 2x·e^(x²). So second term = √(sin(x))·2x·e^(x²). Full answer: e^(x²)[cos(x)/(2√(sin(x))) + 2x√(sin(x))].",
        reviewConcept: "Product Rule Full Assembly",
      },
    ],
  },

  // ── PROBLEM 11 ────────────────────────────────────────────────────────────
  {
    id: 11,
    expression: "\\frac{\\arctan(x)}{x^2 + 1}",
    difficulty: "hard",
    conceptTag: "Quotient rule + inverse trig + recognition",
    preview: "arctan(x)/(x²+1)",

    mcSteps: [
      {
        id: "mc1",
        question: "arctan(x)/(x²+1) — notice that x²+1 appears in BOTH the expression and the derivative of arctan(x). What strategic opportunity does this create?",
        options: [
          { id: "A", label: "Nothing special — just apply quotient rule normally" },
          { id: "B", label: "Use chain rule since arctan is composed with something" },
          { id: "C", label: "The denominator x²+1 will cancel with terms from d/dx[arctan(x)] = 1/(x²+1), potentially simplifying the answer" },
          { id: "D", label: "Rewrite arctan(x) using a trig identity first" },
        ],
        correct: "C",
        feedback: {
          A: { verdict: "partial", message: "Quotient rule is the right approach, but C is the better answer — it notices that the denominator matches the denominator in the arctan derivative. Spotting this before you compute often motivates you to simplify earlier.", reviewConcept: "Strategic Observation", reviewTip: null },
          B: { verdict: "wrong", message: "arctan(x) has inner = x, so no chain rule needed. The argument is just x.", reviewConcept: "Direct Formula vs Chain Rule", reviewTip: null },
          D: { verdict: "wrong", message: "No standard trig identity simplifies arctan(x) as a starting step here.", reviewConcept: "Strategy", reviewTip: null },
        },
        correctFeedback: "Quotient rule, but notice that d/dx[arctan(x)] = 1/(x²+1) and the denominator IS (x²+1). The x²+1 terms will interact and can be simplified. Watch for the cancellation.",
      },
    ],

    blanks: [
      {
        id: "b1",
        conceptTested: "Quotient rule with inverse trig",
        prefix: "\\text{Numerator of quotient rule: } f'g - fg' = \\frac{1}{x^2+1}\\cdot(x^2+1) - \\arctan(x)\\cdot(",
        suffix: ")",
        answer: "2x",
        acceptedForms: ["2x"],
        hint: "g = x²+1. What is g′ = d/dx[x²+1]?",
        explanation: "g′ = d/dx[x²+1] = 2x. So the numerator is (1/(x²+1))·(x²+1) − arctan(x)·2x = 1 − 2x·arctan(x). The (x²+1) cancelled!",
        reviewConcept: "Quotient Rule with Cancellation",
      },
      {
        id: "b2",
        conceptTested: "Simplification and final form",
        prefix: "\\frac{d}{dx}\\left[\\frac{\\arctan x}{x^2+1}\\right] = \\frac{1 - 2x\\arctan(x)}{",
        suffix: "}",
        answer: "(x^2+1)^2",
        acceptedForms: ["(x^2+1)^2", "(x²+1)²", "x^4+2x^2+1"],
        hint: "The quotient rule denominator is g² = (x²+1)². What is (x²+1)²?",
        explanation: "Quotient rule denominator is g² = (x²+1)². Final answer: (1−2x·arctan(x))/(x²+1)².",
        reviewConcept: "Quotient Rule Denominator",
      },
    ],
  },

  // ── PROBLEM 12 ────────────────────────────────────────────────────────────
  {
    id: 12,
    expression: "\\sin^3(\\cos(x))",
    difficulty: "very hard",
    conceptTag: "Chain × 3 layers — all trig",
    preview: "sin³(cos(x))",

    mcSteps: [
      {
        id: "mc1",
        question: "sin³(cos(x)) = [sin(cos(x))]³. How many layers and which is outermost?",
        options: [
          { id: "A", label: "Two layers: outer = □³, inner = sin(cos(x))" },
          { id: "B", label: "Two layers: outer = sin(□), inner = cos(x)" },
          { id: "C", label: "Three layers: outer = □³, middle = sin(□), inner = cos(x)" },
          { id: "D", label: "One layer: chain rule on sin(cos(x))" },
        ],
        correct: "C",
        feedback: {
          A: { verdict: "partial", message: "Correct start: outermost IS □³ and the inner IS sin(cos(x)). But sin(cos(x)) is itself two layers (sin applied to cos(x)), so when you differentiate it you'll need chain rule again. Total: 3 layers.", reviewConcept: "Counting Layers", reviewTip: "When the 'inner' is itself a composition, you have an additional layer." },
          B: { verdict: "wrong", message: "The outermost operation is the cubing — [sin(cos(x))]³. The last thing computed is raising to the 3rd power. Middle = sin(□), inner = cos(x).", reviewConcept: "Outermost Structure", reviewTip: null },
          D: { verdict: "wrong", message: "Three nested functions = three chain rule layers. One chain rule only handles one layer.", reviewConcept: "Multiple Chain Rules", reviewTip: null },
        },
        correctFeedback: "Three layers: (1) □³ outermost, (2) sin(□) middle, (3) cos(x) innermost. Answer will have three multiplicative factors.",
      },
      {
        id: "mc2",
        question: "Layer 1: d/d□[□³] = 3□², evaluated at □ = sin(cos(x)). What is Layer 1's factor?",
        options: [
          { id: "A", label: "3sin²(cos(x))" },
          { id: "B", label: "3cos²(x)" },
          { id: "C", label: "3sin²(x)" },
          { id: "D", label: "3[sin(cos(x))]³" },
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "3□² with □ = sin(cos(x)) gives 3[sin(cos(x))]² = 3sin²(cos(x)). The square applies to the entire expression sin(cos(x)), not just to cos(x).", reviewConcept: "Evaluating Outer at Full Inner", reviewTip: "□ represents the entire inner function. Replace every □ with sin(cos(x))." },
          C: { verdict: "wrong", message: "sin(cos(x)) ≠ sin(x). The inner of sin here is cos(x), not x.", reviewConcept: "Tracking Composition", reviewTip: null },
          D: { verdict: "wrong", message: "d/d□[□³] = 3□², not 3□³. The exponent decreases by 1.", reviewConcept: "Power Rule", reviewTip: null },
        },
        correctFeedback: "3[sin(cos(x))]² = 3sin²(cos(x)). This is factor 1. Layers 2 and 3 still to be multiplied.",
      },
    ],

    blanks: [
      {
        id: "b1",
        conceptTested: "Layer 2+3: d/dx[sin(cos(x))]",
        prefix: "\\text{Layers 2+3: } \\frac{d}{dx}[\\sin(\\cos x)] = \\cos(\\cos x) \\cdot ",
        suffix: "",
        answer: "(-\\sin x)",
        acceptedForms: ["(-sinx)", "-sinx", "-\\sin x", "(−sin x)"],
        hint: "Layer 2: outer of sin(cos(x)) is sin(□) → cos(□), evaluated at cos(x) → cos(cos(x)). Times layer 3: inner derivative d/dx[cos(x)] = ?",
        explanation: "d/dx[cos(x)] = −sin(x). So d/dx[sin(cos(x))] = cos(cos(x))·(−sin(x)). This is the product of layers 2 and 3.",
        reviewConcept: "Chain Rule on Middle+Inner Layers",
      },
      {
        id: "b2",
        conceptTested: "Full three-layer assembly",
        prefix: "\\frac{d}{dx}[\\sin^3(\\cos x)] = 3\\sin^2(\\cos x) \\cdot \\cos(\\cos x) \\cdot (",
        suffix: ")",
        answer: "-\\sin x",
        acceptedForms: ["-sinx", "-\\sin x", "(−sin x)"],
        hint: "Multiply all three layers: Layer 1 × (Layer 2 × Layer 3). You have Layer 1 = 3sin²(cos(x)) and Layer 2+3 = cos(cos(x))·(−sin(x)).",
        explanation: "Full answer: 3sin²(cos(x))·cos(cos(x))·(−sin(x)) = −3sin(x)·sin²(cos(x))·cos(cos(x)). Three chain rule layers, three factors.",
        reviewConcept: "Three-Layer Chain Rule",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT REVIEW LINKS
// ─────────────────────────────────────────────────────────────────────────────
const REVIEW_LINKS = {
  "Product vs Chain Rule": "ChainRuleCompositionViz",
  "Chain Rule Multiplier": "ChainRuleLimitBridgeViz",
  "Trig Derivatives": "SixTrigGraphsViz",
  "Quotient Rule": "CombinedDerivativeSolver",
  "Inverse Trig Derivatives": "InverseTrigViz",
  "Power Rule": "CombinedDerivativeSolver",
  "Outermost Structure": "CombinedDerivativeSolver",
  "Log Properties": "LogPropertiesViz",
  "Pythagorean Identity": "UnitCircleIdentityViz",
};

const LEGACY_FINAL_ANSWERS = {
  1: "3x^2\\sin x + x^3\\cos x",
  2: "3x^2\\cos(x^3)",
  3: "\\frac{e^x(\\cos x + \\sin x)}{\\cos^2 x}",
  4: "2x\\cos(x^2) - 2x^3\\sin(x^2)",
  5: "-\\frac{1}{1+x^2}",
  6: "2x\\cos(x^2)e^{\\sin(x^2)}",
  7: "\\frac{1}{1+\\cos x}",
  8: "\\arcsin(x) + \\frac{x}{\\sqrt{1-x^2}}",
  9: "\\frac{2x}{x^2+1}",
  10: "\\frac{\\cos x}{2\\sqrt{\\sin x}}e^{x^2} + 2x\\sqrt{\\sin x}e^{x^2}",
  11: "\\frac{1-2x\\arctan(x)}{(x^2+1)^2}",
  12: "-3\\sin^2(\\cos x)\\cos(\\cos x)\\sin x",
};

const PROBLEM_BANK = [...PROBLEMS, ...EXTRA_PROBLEMS];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function DerivativeCoach({ params = {} }) {
  const ready = useMath();

  const [probIdx, setProbIdx] = useState(0);
  const [phase, setPhase] = useState("mc"); // "mc" | "blanks" | "done"
  const [mcIdx, setMcIdx] = useState(0);
  const [mcChosen, setMcChosen] = useState(null);
  const [mcResult, setMcResult] = useState(null); // null | {verdict, message, reviewConcept}
  const [blankIdx, setBlankIdx] = useState(0);
  const [blankInput, setBlankInput] = useState("");
  const [blankAttempts, setBlankAttempts] = useState(0); // 0,1,2
  const [blankResult, setBlankResult] = useState(null); // null | "correct" | "hint" | "explain"
  const [sessionErrors, setSessionErrors] = useState({}); // concept → count
  const [problemStats, setProblemStats] = useState({}); // probId -> { correct, incorrect }
  const [currentProblemMistakes, setCurrentProblemMistakes] = useState(0);
  const [selectedConcepts, setSelectedConcepts] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [showSummary, setShowSummary] = useState(false);

  const conceptOptions = useMemo(() => [...new Set(PROBLEM_BANK.map((p) => p.conceptTag))], []);
  const difficultyOptions = useMemo(() => [...new Set(PROBLEM_BANK.map((p) => p.difficulty))], []);

  const eligibleProblemIndices = useMemo(() => {
    return PROBLEM_BANK.map((p, idx) => ({ p, idx }))
      .filter(({ p }) => (selectedConcepts.length === 0 || selectedConcepts.includes(p.conceptTag)))
      .filter(({ p }) => (selectedDifficulties.length === 0 || selectedDifficulties.includes(p.difficulty)))
      .map(({ idx }) => idx);
  }, [selectedConcepts, selectedDifficulties]);

  const fallbackIndex = eligibleProblemIndices[0] ?? 0;
  const safeProbIdx = eligibleProblemIndices.includes(probIdx) ? probIdx : fallbackIndex;
  const prob = PROBLEM_BANK[safeProbIdx];
  const mcStep = prob.mcSteps[mcIdx];
  const blank = prob.blanks?.[blankIdx];

  const shuffledMcOptions = useMemo(() => {
    const options = [...(mcStep?.options || [])];
    for (let i = options.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  }, [prob?.id, mcIdx]);

  useEffect(() => {
    if (eligibleProblemIndices.length === 0) return;
    if (!eligibleProblemIndices.includes(probIdx)) {
      setProbIdx(eligibleProblemIndices[0]);
      setPhase("mc");
      setMcIdx(0);
      setMcChosen(null);
      setMcResult(null);
      setBlankIdx(0);
      setBlankInput("");
      setBlankAttempts(0);
      setBlankResult(null);
      setShowSummary(false);
    }
  }, [eligibleProblemIndices, probIdx]);

  const normalize = (value) => String(value ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\\left|\\right/g, "")
    .replace(/\\,/g, "")
    .replace(/[\u00a0\s]+/g, "")
    .replace(/[{}\[\]()]/g, "")
    .replace(/[−–—]/g, "-")
    .replace(/[×·⋅]/g, "*")
    .replace(/\\cdot/g, "*")
    .replace(/[⁰]/g, "^0")
    .replace(/[¹]/g, "^1")
    .replace(/[²]/g, "^2")
    .replace(/[³]/g, "^3")
    .replace(/[⁴]/g, "^4")
    .replace(/[⁵]/g, "^5")
    .replace(/[⁶]/g, "^6")
    .replace(/[⁷]/g, "^7")
    .replace(/[⁸]/g, "^8")
    .replace(/[⁹]/g, "^9")
    .replace(/\^{([^}]+)}/g, "^$1")
    .replace(/\\([a-zA-Z]+)/g, "$1");

  const updateProblemScore = (problemId, { correct = 0, incorrect = 0 }) => {
    setProblemStats((prev) => {
      const entry = prev[problemId] || { correct: 0, incorrect: 0 };
      return {
        ...prev,
        [problemId]: {
          correct: entry.correct + correct,
          incorrect: entry.incorrect + incorrect,
        },
      };
    });
  };

  const jumpToProblem = (index) => {
    setProbIdx(index);
    setPhase("mc");
    setMcIdx(0);
    setMcChosen(null);
    setMcResult(null);
    setBlankIdx(0);
    setBlankInput("");
    setBlankAttempts(0);
    setBlankResult(null);
    setCurrentProblemMistakes(0);
    setShowSummary(false);
  };

  const getConceptLens = (tag) => {
    const t = String(tag || "").toLowerCase();
    if (t.includes("product")) {
      return {
        title: "Structure lens: product",
        tip: "Identify each factor first, then write one term per factor derivative while freezing the others."
      };
    }
    if (t.includes("quotient")) {
      return {
        title: "Structure lens: quotient",
        tip: "Use f'g - fg' over g^2 and protect signs. Expand only after the quotient scaffold is correct."
      };
    }
    if (t.includes("chain") || t.includes("layer")) {
      return {
        title: "Structure lens: chain",
        tip: "Peel outside to inside. Keep the inner expression unchanged until its own derivative step."
      };
    }
    if (t.includes("log")) {
      return {
        title: "Structure lens: logarithmic",
        tip: "Check if log differentiation simplifies structure; after taking ln, use product/chain carefully."
      };
    }
    if (t.includes("inverse trig")) {
      return {
        title: "Structure lens: inverse trig",
        tip: "Recall the base inverse-trig formula first, then multiply by the inner derivative."
      };
    }
    if (t.includes("simplification")) {
      return {
        title: "Structure lens: simplify-first",
        tip: "Before differentiating, reduce the algebra/trig form. The derivative is often easier and cleaner."
      };
    }
    return {
      title: "Structure lens: identify outer rule",
      tip: "Find the last operation done to the expression, choose that rule, then recurse inward."
    };
  };

  const toggleFilter = (state, setter, value) => {
    setter(state.includes(value) ? state.filter((v) => v !== value) : [...state, value]);
  };

  const getScoreTone = (problemId) => {
    const s = problemStats[problemId] || { correct: 0, incorrect: 0 };
    const attempts = s.correct + s.incorrect;
    if (attempts === 0) return { bg: "var(--color-background-secondary)", border: "var(--color-border-secondary)", text: "var(--color-text-secondary)" };
    if (s.correct === 0) return { bg: isDark ? "rgba(244,63,94,0.2)" : "#FCEBEB", border: isDark ? "#fb7185" : "#fda4af", text: isDark ? "#fecdd3" : "#7f1d1d" };
    if (s.incorrect === 0) return { bg: isDark ? "rgba(16,185,129,0.2)" : "#E1F5EE", border: isDark ? "#34d399" : "#86efac", text: isDark ? "#bbf7d0" : "#065f46" };
    return { bg: isDark ? "rgba(245,158,11,0.2)" : "#FAEEDA", border: isDark ? "#f59e0b" : "#fcd34d", text: isDark ? "#fde68a" : "#78350f" };
  };

  const handleMcChoice = (optId) => {
    if (mcResult?.verdict === "correct") return;
    setMcChosen(optId);
    if (optId === mcStep.correct) {
      setMcResult({ verdict: "correct", message: mcStep.correctFeedback });
      updateProblemScore(prob.id, { correct: 1 });
    } else {
      const fb = mcStep.feedback[optId];
      setMcResult({ verdict: fb.verdict, message: fb.message, reviewConcept: fb.reviewConcept, reviewTip: fb.reviewTip });
      updateProblemScore(prob.id, { incorrect: 1 });
      setCurrentProblemMistakes((n) => n + 1);
      if (fb.reviewConcept) {
        setSessionErrors(e => ({ ...e, [fb.reviewConcept]: (e[fb.reviewConcept] || 0) + 1 }));
      }
    }
  };

  const advanceMc = () => {
    setMcChosen(null);
    setMcResult(null);
    if (mcIdx + 1 < prob.mcSteps.length) {
      setMcIdx(mcIdx + 1);
    } else {
      setPhase("blanks");
      setBlankIdx(0);
      setBlankInput("");
      setBlankAttempts(0);
      setBlankResult(null);
    }
  };

  const handleBlankSubmit = () => {
    const input = blankInput.trim();
    if (!input) return;
    const norm = normalize(input);
    const correct = normalize(blank.answer);
    const accepted = (blank.acceptedForms || []).map(normalize);
    const isCorrect = norm === correct || accepted.includes(norm);

    if (isCorrect) {
      setBlankResult("correct");
      updateProblemScore(prob.id, { correct: 1 });
    } else {
      const newAttempts = blankAttempts + 1;
      setBlankAttempts(newAttempts);
      updateProblemScore(prob.id, { incorrect: 1 });
      setCurrentProblemMistakes((n) => n + 1);
      if (newAttempts === 1) {
        setBlankResult("hint");
        setSessionErrors(e => ({ ...e, [blank.conceptTested]: (e[blank.conceptTested] || 0) + 1 }));
      } else {
        setBlankResult("explain");
      }
    }
  };

  const advanceBlank = () => {
    setBlankInput("");
    setBlankAttempts(0);
    setBlankResult(null);
    if (blankIdx + 1 < (prob.blanks?.length || 0)) {
      setBlankIdx(blankIdx + 1);
    } else {
      setPhase("done");
    }
  };

  const nextProblem = () => {
    const pos = eligibleProblemIndices.indexOf(safeProbIdx);
    if (pos !== -1 && pos + 1 < eligibleProblemIndices.length) {
      jumpToProblem(eligibleProblemIndices[pos + 1]);
    } else {
      setShowSummary(true);
    }
  };

  const card = { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "16px 18px", marginBottom: 10 };
  const secCard = { background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "10px 14px", marginBottom: 8, border: "0.5px solid var(--color-border-tertiary)" };
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const conceptLens = getConceptLens(prob?.conceptTag);
  const canRevealFinalAnswer = currentProblemMistakes === 0;

  const tone = {
    correct: isDark
      ? { bg: "rgba(16,185,129,0.16)", border: "#34d399", label: "#a7f3d0", text: "#d1fae5" }
      : { bg: "#E1F5EE", border: "#1D9E75", label: "#085041", text: "#0b3e33" },
    hint: isDark
      ? { bg: "rgba(245,158,11,0.16)", border: "#f59e0b", label: "#fde68a", text: "#fef3c7" }
      : { bg: "#FAEEDA", border: "#BA7517", label: "#412402", text: "#4a2d08" },
    explain: isDark
      ? { bg: "rgba(244,63,94,0.16)", border: "#fb7185", label: "#fecdd3", text: "#ffe4e6" }
      : { bg: "#FCEBEB", border: "#A32D2D", label: "#501313", text: "#5a1515" },
  };

  if (showSummary) {
    const topErrors = Object.entries(sessionErrors).sort((a, b) => b[1] - a[1]).slice(0, 4);
    return (
      <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
        <div style={{ ...card, borderLeft: `3px solid ${tone.correct.border}`, borderRadius: 0, background: tone.correct.bg, marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: tone.correct.label }}>Session complete — {eligibleProblemIndices.length} selected problems</div>
        </div>
        {topErrors.length > 0 && (
          <div style={{ ...card }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 10 }}>Concepts that caused the most errors:</div>
            {topErrors.map(([concept, count]) => (
              <div key={concept} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <div>
                  <div style={{ fontSize: 13, color: "var(--color-text-primary)" }}>{concept}</div>
                  {REVIEW_LINKS[concept] && <div style={{ fontSize: 11, color: "var(--color-text-info)" }}>Suggested review: {REVIEW_LINKS[concept]}</div>}
                </div>
                <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: tone.explain.bg, color: tone.explain.label, border: `0.5px solid ${tone.explain.border}` }}>{count} error{count > 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => { setProbIdx(0); setPhase("mc"); setMcIdx(0); setMcChosen(null); setMcResult(null); setBlankIdx(0); setBlankInput(""); setBlankAttempts(0); setBlankResult(null); setCurrentProblemMistakes(0); setShowSummary(false); }} style={{ padding: "8px 18px", borderRadius: 8, border: "0.5px solid var(--color-border-info)", background: "var(--color-background-info)", color: "var(--color-text-info)", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
          Start over
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Problem header */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>Problem {Math.max(eligibleProblemIndices.indexOf(safeProbIdx) + 1, 1)} / {Math.max(eligibleProblemIndices.length, 1)}</span>
        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "var(--color-background-secondary)", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-secondary)" }}>{prob.difficulty}</span>
        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "#E6F1FB", color: "#0C447C" }}>{prob.conceptTag}</span>
        <div style={{ display: "flex", gap: 3, marginLeft: "auto" }}>
          {eligibleProblemIndices.map((idx, i) => (
            <div key={idx} style={{ width: 20, height: 4, borderRadius: 2, background: i < Math.max(eligibleProblemIndices.indexOf(safeProbIdx), 0) ? "#1D9E75" : idx === safeProbIdx ? "#7F77DD" : "var(--color-border-tertiary)" }} />
          ))}
        </div>
      </div>

      <div style={{ ...card, marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--color-text-tertiary)", marginBottom: 8 }}>Practice filters</div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>Problem type</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {conceptOptions.map((tag) => {
              const active = selectedConcepts.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleFilter(selectedConcepts, setSelectedConcepts, tag)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 999,
                    border: active ? "0.5px solid #818cf8" : "0.5px solid var(--color-border-secondary)",
                    background: active ? (isDark ? "rgba(99,102,241,0.2)" : "#EEEDFE") : "var(--color-background-secondary)",
                    color: active ? (isDark ? "#c7d2fe" : "#3C3489") : "var(--color-text-secondary)",
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>Difficulty</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {difficultyOptions.map((level) => {
              const active = selectedDifficulties.includes(level);
              return (
                <button
                  key={level}
                  onClick={() => toggleFilter(selectedDifficulties, setSelectedDifficulties, level)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 999,
                    border: active ? "0.5px solid #22c55e" : "0.5px solid var(--color-border-secondary)",
                    background: active ? (isDark ? "rgba(34,197,94,0.2)" : "#E1F5EE") : "var(--color-background-secondary)",
                    color: active ? (isDark ? "#bbf7d0" : "#065f46") : "var(--color-text-secondary)",
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--color-text-tertiary)", marginBottom: 8 }}>Problem selector (scroll + color score)</div>
        <div style={{ maxHeight: 170, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
          {eligibleProblemIndices.map((idx) => {
            const p = PROBLEM_BANK[idx];
            const toneBtn = getScoreTone(p.id);
            const stat = problemStats[p.id] || { correct: 0, incorrect: 0 };
            return (
              <button
                key={p.id}
                onClick={() => jumpToProblem(idx)}
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: `0.5px solid ${idx === safeProbIdx ? "#818cf8" : toneBtn.border}`,
                  background: toneBtn.bg,
                  color: toneBtn.text,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600 }}>#{p.id} · {p.conceptTag}</div>
                <div style={{ fontSize: 12, marginTop: 2 }}>{p.preview}</div>
                <div style={{ fontSize: 10, opacity: 0.9, marginTop: 4 }}>C:{stat.correct} / I:{stat.incorrect}</div>
              </button>
            );
          })}
          {eligibleProblemIndices.length === 0 && (
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>No problems match current filters. Clear one filter to continue.</div>
          )}
        </div>
      </div>

      {/* Expression */}
      <div style={{ ...card, textAlign: "center", fontSize: 22, marginBottom: 14 }}>
        <M t={"\\displaystyle\\frac{d}{dx}\\left[" + prob.expression + "\\right] = \\;?"} display ready={ready} />
      </div>

      <div style={{ ...secCard, borderLeft: `3px solid ${tone.hint.border}`, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: tone.hint.label, marginBottom: 6 }}>
          {conceptLens.title}
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.6 }}>
          {conceptLens.tip}
        </p>
      </div>

      {/* PHASE: MULTIPLE CHOICE */}
      {phase === "mc" && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#3C3489", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8, padding: "3px 10px", background: "#EEEDFE", borderRadius: 6, display: "inline-block" }}>
            Phase 1 — Choose the correct step ({mcIdx + 1}/{prob.mcSteps.length})
          </div>

          <div style={{ ...secCard, marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{mcStep.question}</p>
          </div>

          {shuffledMcOptions.map((opt) => {
            const isChosen = mcChosen === opt.id;
            const isCorrect = mcResult?.verdict === "correct" && isChosen;
            const isWrong = isChosen && mcResult && mcResult.verdict !== "correct";
            const isPartial = isChosen && mcResult?.verdict === "partial";
            let bg = "var(--color-background-primary)", border = "var(--color-border-secondary)", color = "var(--color-text-primary)";
            if (isCorrect) { bg = tone.correct.bg; border = tone.correct.border; color = tone.correct.text; }
            else if (isPartial) { bg = tone.hint.bg; border = tone.hint.border; color = tone.hint.text; }
            else if (isWrong) { bg = tone.explain.bg; border = tone.explain.border; color = tone.explain.text; }
            return (
              <button key={opt.id} onClick={() => handleMcChoice(opt.id)} disabled={mcResult?.verdict === "correct"} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 14px", marginBottom: 6, borderRadius: 8, border: `0.5px solid ${border}`, background: bg, color, cursor: mcResult?.verdict === "correct" ? "default" : "pointer", fontSize: 13, lineHeight: 1.5, transition: "all .15s" }}>
                <span style={{ fontWeight: 600, marginRight: 8 }}>{opt.id}.</span>{opt.label}
              </button>
            );
          })}

          {mcResult && (
            <div
              style={{
                padding: "12px 14px",
                borderLeft: `3px solid ${mcResult.verdict === "correct" ? tone.correct.border : mcResult.verdict === "partial" ? tone.hint.border : tone.explain.border}`,
                borderRadius: "0 8px 8px 0",
                background: mcResult.verdict === "correct" ? tone.correct.bg : mcResult.verdict === "partial" ? tone.hint.bg : tone.explain.bg,
                marginTop: 8,
                animation: "sd .18s ease-out",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 6,
                  color: mcResult.verdict === "correct" ? tone.correct.label : mcResult.verdict === "partial" ? tone.hint.label : tone.explain.label,
                }}
              >
                {mcResult.verdict === "correct" ? "Correct" : mcResult.verdict === "partial" ? "Partially right — but read carefully" : "Not quite"}
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: mcResult.verdict === "correct" ? tone.correct.text : mcResult.verdict === "partial" ? tone.hint.text : tone.explain.text, marginBottom: mcResult.reviewConcept ? 8 : 0 }}>{mcResult.message}</p>
              {mcResult.reviewConcept && (
                <div style={{ fontSize: 12, color: mcResult.verdict === "correct" ? tone.correct.label : mcResult.verdict === "partial" ? tone.hint.label : tone.explain.label }}>
                  Review: <strong>{mcResult.reviewConcept}</strong>
                  {mcResult.reviewTip && <span style={{ color: mcResult.verdict === "correct" ? tone.correct.text : mcResult.verdict === "partial" ? tone.hint.text : tone.explain.text }}> — {mcResult.reviewTip}</span>}
                </div>
              )}
              {mcResult.verdict === "correct" && (
                <button onClick={advanceMc} style={{ marginTop: 10, padding: "7px 18px", borderRadius: 8, border: "0.5px solid #1D9E75", background: "#1D9E75", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                  {mcIdx + 1 < prob.mcSteps.length ? "Next decision →" : "Move to fill-in-blank →"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* PHASE: FILL IN BLANKS */}
      {phase === "blanks" && blank && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#0C447C", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8, padding: "3px 10px", background: "#E6F1FB", borderRadius: 6, display: "inline-block" }}>
            Phase 2 — Fill in the blank ({blankIdx + 1}/{prob.blanks.length})
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 10 }}>Testing: <em>{blank.conceptTested}</em></div>

          <div style={{ ...secCard, fontSize: 15, textAlign: "center", overflowX: "auto", marginBottom: 12 }}>
            <M t={blank.prefix + "\\fbox{?}" + blank.suffix} display ready={ready} />
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              value={blankInput}
              onChange={e => { setBlankInput(e.target.value); setBlankResult(null); }}
              onKeyDown={e => e.key === "Enter" && blankResult !== "correct" && handleBlankSubmit()}
              placeholder="Type your answer (math notation ok, e.g. 3x^2)"
              disabled={blankResult === "correct" || blankResult === "explain"}
              style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 13 }}
            />
            {blankResult !== "correct" && blankResult !== "explain" && (
              <button onClick={handleBlankSubmit} style={{ padding: "9px 18px", borderRadius: 8, border: "0.5px solid var(--color-border-info)", background: "var(--color-background-info)", color: "var(--color-text-info)", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                Check
              </button>
            )}
          </div>

          {blankResult === "correct" && (
            <div style={{ padding: "12px 14px", borderLeft: `3px solid ${tone.correct.border}`, borderRadius: "0 8px 8px 0", background: tone.correct.bg, animation: "sd .18s ease-out", marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: tone.correct.label, marginBottom: 4 }}>Correct</div>
              <M t={blank.prefix + blank.answer + blank.suffix} display ready={ready} />
              <button onClick={advanceBlank} style={{ marginTop: 10, padding: "7px 18px", borderRadius: 8, border: "0.5px solid #1D9E75", background: "#1D9E75", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                {blankIdx + 1 < (prob.blanks?.length || 0) ? "Next blank →" : "Complete problem →"}
              </button>
            </div>
          )}

          {blankResult === "hint" && (
            <div style={{ padding: "12px 14px", borderLeft: `3px solid ${tone.hint.border}`, borderRadius: "0 8px 8px 0", background: tone.hint.bg, animation: "sd .18s ease-out", marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: tone.hint.label, marginBottom: 4 }}>Hint</div>
              <p style={{ fontSize: 13, color: tone.hint.text, lineHeight: 1.6 }}>{blank.hint}</p>
              <div style={{ fontSize: 11, color: tone.hint.label, marginTop: 6 }}>Review: <strong>{blank.reviewConcept}</strong></div>
            </div>
          )}

          {blankResult === "explain" && (
            <div style={{ padding: "12px 14px", borderLeft: `3px solid ${tone.explain.border}`, borderRadius: "0 8px 8px 0", background: tone.explain.bg, animation: "sd .18s ease-out", marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: tone.explain.label, marginBottom: 4 }}>Full explanation</div>
              <p style={{ fontSize: 13, color: tone.explain.text, lineHeight: 1.6, marginBottom: 8 }}>{blank.explanation}</p>
              <div style={{ fontSize: 13, fontWeight: 500, color: tone.explain.label, marginBottom: 6 }}>Answer:</div>
              <M t={blank.prefix + blank.answer + blank.suffix} display ready={ready} />
              <button onClick={advanceBlank} style={{ marginTop: 10, padding: "7px 18px", borderRadius: 8, border: `0.5px solid ${tone.explain.border}`, background: isDark ? "rgba(244,63,94,0.22)" : "#FCEBEB", color: tone.explain.label, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                {blankIdx + 1 < (prob.blanks?.length || 0) ? "See next blank →" : "See next problem →"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* PHASE: DONE */}
      {phase === "done" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: `3px solid ${tone.correct.border}`, borderRadius: 0, background: tone.correct.bg }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: tone.correct.label, marginBottom: 6 }}>Problem complete</div>
            {canRevealFinalAnswer ? (
              <>
                <div style={{ fontSize: 13, color: tone.correct.text, marginBottom: 10 }}>Perfect run. Final answer unlocked:</div>
                <div style={{ background: isDark ? "rgba(15,23,42,0.75)" : "#fff", borderRadius: 8, padding: "12px", textAlign: "center", overflowX: "auto", border: isDark ? "0.5px solid #334155" : "0.5px solid #e2e8f0", color: "var(--color-text-primary)" }}>
                  <M
                    t={
                      "\\displaystyle\\frac{d}{dx}\\left[" + prob.expression + "\\right] = " +
                      (prob.finalAnswer || LEGACY_FINAL_ANSWERS[prob.id] || "\\text{Use worked steps above}")
                    }
                    display
                    ready={ready}
                  />
                </div>
              </>
            ) : (
              <div style={{ background: isDark ? "rgba(245,158,11,0.16)" : "#FFFBEB", borderRadius: 8, padding: "12px", border: `0.5px solid ${tone.hint.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: tone.hint.label, marginBottom: 6 }}>Final answer locked for this attempt</div>
                <p style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.65, marginBottom: 6 }}>
                  You made {currentProblemMistakes} mistake{currentProblemMistakes > 1 ? "s" : ""}. Re-run this problem for a clean pass to unlock the final line.
                </p>
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                  Hint for this problem type: {conceptLens.tip}
                </p>
              </div>
            )}
          </div>
          <button onClick={nextProblem} style={{ marginTop: 10, padding: "9px 20px", borderRadius: 8, border: isDark ? "0.5px solid #818cf8" : "0.5px solid #7F77DD", background: isDark ? "rgba(99,102,241,0.2)" : "#EEEDFE", color: isDark ? "#c7d2fe" : "#3C3489", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
            {(() => {
              const pos = eligibleProblemIndices.indexOf(safeProbIdx);
              return pos !== -1 && pos + 1 < eligibleProblemIndices.length
                ? `Next problem (${pos + 2}/${eligibleProblemIndices.length}) →`
                : "See session summary →";
            })()}
          </button>
        </div>
      )}
    </div>
  );
}
