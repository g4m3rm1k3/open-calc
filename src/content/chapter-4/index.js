import areaAccumulation from './00-area-accumulation.js'
import riemannSums from './01-riemann-sums.js'
import definiteIntegral from './02-definite-integral.js'
import fundamentalTheorem from './03-fundamental-theorem.js'
import indefiniteIntegrals from './04-indefinite-integrals.js'
import applications from './05-applications.js'
import integrationByParts from './07-integration-by-parts.js'
import trigIntegrals from './08-trig-integrals.js'
import trigSubstitution from './09-trig-substitution.js'
import partialFractionsIntegration from './10-partial-fractions-integration.js'
import improperIntegrals from './11-improper-integrals.js'

export default {
  id: 'chapter-4',
  number: 4,
  title: 'Integration',
  slug: 'integration',
  description: 'The second pillar of calculus: accumulation, area, and the Fundamental Theorem that links differentiation and integration as inverse operations. From Riemann sums to antiderivatives, with applications in physics, economics, and engineering.',
  color: 'sky',
  lessons: [
    areaAccumulation,
    riemannSums,
    definiteIntegral,
    fundamentalTheorem,
    indefiniteIntegrals,
    applications,
    integrationByParts,
    trigIntegrals,
    trigSubstitution,
    partialFractionsIntegration,
    improperIntegrals,
  ],
}
