import introLimits from './00-intro-limits.js'
import limitLaws from './01-limit-laws.js'
import continuity from './02-continuity.js'
import epsilonDelta from './03-epsilon-delta.js'
import visualEpsilonDelta from './04a-visual-epsilon-delta.js'
import squeezeTheorem from './04-squeeze-theorem.js'
import limitsAtInfinity from './05-limits-at-infinity.js'

export default {
  id: 'chapter-1',
  number: 1,
  title: 'Limits & Continuity',
  slug: 'limits',
  description: 'The foundation of calculus. Limits describe how functions behave near a point, enabling the precise definition of derivatives and integrals.',
  color: 'blue',
  lessons: [introLimits, limitLaws, continuity, epsilonDelta, visualEpsilonDelta, squeezeTheorem, limitsAtInfinity],
}
