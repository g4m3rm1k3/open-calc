import tangentProblem from './00-tangent-problem.js'
import differentiationRules from './01-differentiation-rules.js'
import chainRule from './02-chain-rule.js'
import trigDerivatives from './03-trig-derivatives.js'
import expLogDerivatives from './04-exp-log-derivatives.js'
import implicitDifferentiation from './05-implicit-differentiation.js'
import readingDerivatives from './06-reading-derivatives.js'

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
    trigDerivatives,
    expLogDerivatives,
    implicitDifferentiation,
    readingDerivatives,
  ],
}
