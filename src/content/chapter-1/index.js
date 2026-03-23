import introLimits from './00-intro-limits.js'
import limitLaws from './01-limit-laws.js'
import continuity from './02-continuity.js'
import ivt from './02a-intermediate-value-theorem.js'
import typesOfDiscontinuities from './02b-types-of-discontinuities.js'
import epsilonDelta from './03-epsilon-delta.js'
import visualEpsilonDelta from './04a-visual-epsilon-delta.js'
import squeezeTheorem from './04-squeeze-theorem.js'
import fundamentalTrigLimits from './04b-fundamental-trig-limits.js'
import limitsAtInfinity from './05-limits-at-infinity.js'
import limitsAndContinuity from './10-limits-and-continuity.js'
import rateOfChange from './rate-of-change.js'
import functionModeling from './function-modeling.js'

export default {
  id: 'chapter-1',
  number: 1,
  title: 'Limits & Continuity',
  slug: 'limits',
  description: 'The foundation of calculus. Limits describe how functions behave near a point — and continuity describes functions with no breaks. Includes the Intermediate Value Theorem, all types of discontinuities, epsilon-delta proofs, the Squeeze Theorem, and limits at infinity.',
  color: 'blue',
  lessons: [
    introLimits,
    limitLaws,
    continuity,
    ivt,
    typesOfDiscontinuities,
    epsilonDelta,
    visualEpsilonDelta,
    squeezeTheorem,
    fundamentalTrigLimits,
    limitsAtInfinity,
    limitsAndContinuity,
    rateOfChange,
    functionModeling,
  ],
}
