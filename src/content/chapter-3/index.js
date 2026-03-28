// ============================================================
// CHAPTER 3 — APPLICATIONS OF DERIVATIVES
// Pedagogical sequence: 4 acts
//
// ACT 1 — FOUNDATIONS (The laws that govern derivatives)
//   Lesson 0: Rolle's Theorem  — the seed: f(a)=f(b) forces a flat tangent
//   Lesson 1: Mean Value Theorem — the harvest: average rate = instantaneous rate somewhere
//
// ACT 2 — APPROXIMATION (Derivatives as measuring tools)
//   Lesson 2: Linear Approximation — tangent line ≈ function near a point
//   Lesson 3: Differentials       — dy = f'(x)dx, error propagation, engineering precision
//   Lesson 4: Related Rates       — chain rule applied to time: two linked quantities
//
// ACT 3 — ANALYSIS (Reading the whole story from a derivative)
//   Lesson 5: Curve Sketching  — f' gives increasing/decreasing, f'' gives concavity
//   Lesson 6: Optimization     — the reason calculus was invented: find the best value
//
// ACT 4 — SPECIAL TECHNIQUES (Derivatives solving harder problems)
//   Lesson 7: L'Hôpital's Rule  — use derivatives to resolve 0/0 and ∞/∞
//   Lesson 8: Newton's Method   — use tangent lines to hunt roots quadratically fast
// ============================================================

import rollesTheorem from './02a-rolles-theorem.js'
import meanValueTheorem from './02-mean-value-theorem.js'
import linearApproximation from './01-linear-approximation.js'
import differentials from './07-differentials.js'
import relatedRates from './00-related-rates.js'
import curveSketching from './03-curve-sketching.js'
import optimization from './04-optimization.js'
import lhopital from './05-lhopital.js'
import newtonsMethod from './06-newtons-method.js'

export default {
  id: 'chapter-3',
  number: 3,
  title: 'Applications of Derivatives',
  slug: 'applications',
  description: "The derivative is not just a formula — it's a tool. Chapter 3 shows you how to use it: to prove that a function must be momentarily flat, to approximate square roots by hand, to find the dimensions that minimize cost, to resolve limits that look like 0/0, and to solve equations no algebra can crack.",
  color: 'emerald',
  lessons: [
    // ACT 1 — FOUNDATIONS
    rollesTheorem,       // order 0 — proves MVT; must come first
    meanValueTheorem,    // order 1 — uses Rolle's; unlocks all applications

    // ACT 2 — APPROXIMATION
    linearApproximation, // order 2 — tangent line as local model
    differentials,       // order 3 — dy = f'dx formalism + error propagation
    relatedRates,        // order 4 — chain rule in time

    // ACT 3 — ANALYSIS
    curveSketching,      // order 5 — reading f shape from f', f''
    optimization,        // order 6 — the "why calculus was invented" lesson

    // ACT 4 — SPECIAL TECHNIQUES
    lhopital,            // order 7 — resolving indeterminate limits
    newtonsMethod,       // order 8 — root-finding via iterated linearization
  ],
}
