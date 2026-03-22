import expressionsStructure from './01-expressions-structure.js'
import factoring from './02-factoring.js'
import quadratics from './03-quadratics.js'
import rationalPartialFractions from './04-rational-partial-fractions.js'
import systems from './05-systems.js'
import complexNumbers from './06-complex-numbers.js'
import inequalities from './07-inequalities.js'

export default {
  id: 'precalc-2',
  number: 'precalc-2',
  title: 'Algebra',
  slug: 'algebra',
  description: 'Algebraic structure, factoring, quadratics, rational expressions, systems of equations, complex numbers, and inequalities — the toolkit calculus builds on.',
  color: 'violet',
  lessons: [
    expressionsStructure,
    factoring,
    quadratics,
    rationalPartialFractions,
    systems,
    complexNumbers,
    inequalities,
  ],
}
