import tangentProblem from './00-tangent-problem.js'
import differentiationRules from './01-differentiation-rules.js'
import chainRule from './02-chain-rule.js'
import derivativesOfInverseFunctions from './02-derivatives-of-inverse-functions.js'
import trigDerivatives from './03-trig-derivatives.js'
import expLogDerivatives from './04-exp-log-derivatives.js'
import productRuleChainTrap from './04b-product-rule-chain-trap.js'
import implicitDifferentiation from './05-implicit-differentiation.js'
import readingDerivatives from './06-reading-derivatives.js'
import derivativesIntroduction from './10-derivatives-introduction.js'
import polynomialDivisionRoots from './polynomial-division-roots.js'
import absoluteValueRadicals from './absolute-value-radicals.js'

export default {
  id: 'chapter-2',
  number: 2,
  title: 'Derivatives',
  slug: 'derivatives',
  description: 'The instantaneous rate of change. Derivatives unlock velocity, optimization, curve sketching, and the fundamental link between a function and its slope at every point.',
  color: 'violet',

  // ─── Chapter Story Arc ────────────────────────────────────────────────────
  // This chapter is a single coherent journey, not a collection of isolated
  // techniques. Here is how the story unfolds:
  //
  // ACT 1 — THE QUESTION (Lessons 0–1)
  //   We begin with a paradox: how can something have a speed "right now"
  //   if speed requires two moments? The derivative is the answer. Lesson 0
  //   surveys all four ways to see a derivative (geometric, physical, algebraic,
  //   computational). Lesson 1 builds the definition rigorously from limits —
  //   the difference quotient made precise. After these two lessons you
  //   understand WHAT a derivative is.
  //
  // ACT 2 — THE TOOLKIT (Lessons 2–4)
  //   Computing derivatives from limits every time is exhausting. Lessons 2–4
  //   give you the shortcuts, proved once and used forever: power, product,
  //   quotient rules (Lesson 2), then the most-used rule of all — the chain
  //   rule for composed functions (Lesson 3). Lesson 4 immediately shows the
  //   #1 mistake students make combining product and chain rules, and drills
  //   the correct workflow before bad habits form.
  //
  // ACT 3 — SPECIAL FUNCTIONS (Lessons 5–7)
  //   The toolkit of Act 2 applies to all functions, but three families deserve
  //   their own treatment: trig (Lesson 5), exponentials and logarithms
  //   (Lesson 6), and inverse functions including arcsin/arccos/arctan
  //   (Lesson 7). Each lesson uses the chain rule as its engine. Together they
  //   cover every function you will encounter in applied mathematics.
  //
  // ACT 4 — SYNTHESIS (Lessons 8–9)
  //   Lesson 8 (Implicit Differentiation) shows what to do when y cannot be
  //   solved explicitly — it is the chain rule applied to both sides of an
  //   equation. Lesson 9 (Reading Derivatives) closes the loop: given a graph
  //   of f, you should now be able to sketch f′, f′′, and interpret what each
  //   tells you physically and geometrically. After Lesson 9 you can compute,
  //   apply, and read derivatives.
  //
  // APPENDIX — PREREQUISITE TOOLS (Lessons 10–11)
  //   Lessons 10–11 are review material for algebra skills (polynomial
  //   division, absolute value equations) that occasionally appear in calculus
  //   problems. They are here for reference — not part of the main story arc.

  lessons: [
    // ── Act 1: The Question ─────────────────────────────────────────────────
    derivativesIntroduction,      // 0 — Big picture: four perspectives on the derivative
    tangentProblem,               // 1 — Limit definition: from average to instantaneous change

    // ── Act 2: The Toolkit ──────────────────────────────────────────────────
    differentiationRules,         // 2 — Power, product, quotient rules (shortcuts proved from limits)
    chainRule,                    // 3 — Chain rule: differentiating compositions
    productRuleChainTrap,         // 4 — Common mistake: incomplete inner derivatives (drill it now)

    // ── Act 3: Special Functions ────────────────────────────────────────────
    trigDerivatives,              // 5 — sin, cos, tan and their chain-rule extensions
    expLogDerivatives,            // 6 — e^x, ln(x), a^x, log_a(x), logarithmic differentiation
    derivativesOfInverseFunctions,// 7 — General inverse rule + arcsin, arccos, arctan

    // ── Act 4: Synthesis ────────────────────────────────────────────────────
    implicitDifferentiation,      // 8 — When y is not solved explicitly (chain rule in disguise)
    readingDerivatives,           // 9 — Reading f, f', f'', f''' from graphs (visual language)

    // ── Appendix: Prerequisite Tools ────────────────────────────────────────
    polynomialDivisionRoots,      // 10 — Polynomial division, rational zeros (algebra review)
    absoluteValueRadicals,        // 11 — Absolute value equations, radicals (algebra review)
  ],
}
