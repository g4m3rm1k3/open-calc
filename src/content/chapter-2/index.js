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
  lessons: [
    tangentProblem,
    differentiationRules,
    chainRule,
    derivativesOfInverseFunctions,
    trigDerivatives,
    expLogDerivatives,
    productRuleChainTrap,
    implicitDifferentiation,
    readingDerivatives,
    derivativesIntroduction,
    polynomialDivisionRoots,
    absoluteValueRadicals,
  ],
}
