import relatedRates from './00-related-rates.js'
import linearApproximation from './01-linear-approximation.js'
import meanValueTheorem from './02-mean-value-theorem.js'
import rollesTheorem from './02a-rolles-theorem.js'
import curveSketching from './03-curve-sketching.js'
import optimization from './04-optimization.js'
import lhopital from './05-lhopital.js'
import newtonsMethod from './06-newtons-method.js'
import differentials from './07-differentials.js'

export default {
  id: 'chapter-3',
  number: 3,
  title: 'Applications of Derivatives',
  slug: 'applications',
  description: 'The power of the derivative unleashed: related rates, linear approximation, the Mean Value Theorem, curve sketching, optimization, and L\'Hôpital\'s Rule.',
  color: 'emerald',
  lessons: [
    relatedRates,
    linearApproximation,
    meanValueTheorem,
    rollesTheorem,
    curveSketching,
    optimization,
    lhopital,
    newtonsMethod,
    differentials,
  ],
}
