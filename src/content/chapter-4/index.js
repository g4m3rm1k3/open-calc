import areaAccumulation from './00-area-accumulation.js'
import riemannSums from './01-riemann-sums.js'
import definiteIntegral from './02-definite-integral.js'
import fundamentalTheorem from './03-fundamental-theorem.js'
import indefiniteIntegrals from './04-indefinite-integrals.js'
import initialValueProblems from './04b-initial-value-problems.js'
import applications from './05-applications.js'
import uSubstitution from './06-u-substitution.js'
import volumesOfRevolution from './06b-volumes-of-revolution.js'
import integrationByParts from './07-integration-by-parts.js'
import trigIntegrals from './08-trig-integrals.js'
import trigSubstitution from './09-trig-substitution.js'
import partialFractionsIntegration from './10-partial-fractions-integration.js'
import improperIntegrals from './11-improper-integrals.js'
import numericalIntegration from './12-numerical-integration.js'
import volumesDiskWasher from './13-volumes-disk-washer.js'
import volumesShell from './14-volumes-shell.js'
import arcLength from './15-arc-length.js'
import workAndForce from './16-work-and-force.js'
import centersOfMass from './17-centers-of-mass.js'

export default {
  id: 'chapter-4',
  number: 4,
  title: 'Integration',
  slug: 'integration',
  description: 'The second pillar of calculus: accumulation, area, and the Fundamental Theorem that links differentiation and integration as inverse operations. From Riemann sums to antiderivatives — with all the integration techniques you need for Calc 2, plus applications in physics, economics, and engineering.',
  color: 'sky',
  lessons: [
    areaAccumulation,
    riemannSums,
    definiteIntegral,
    fundamentalTheorem,
    indefiniteIntegrals,
    initialValueProblems,
    applications,
    uSubstitution,
    volumesOfRevolution,
    integrationByParts,
    trigIntegrals,
    trigSubstitution,
    partialFractionsIntegration,
    improperIntegrals,
    numericalIntegration,
    volumesDiskWasher,
    volumesShell,
    arcLength,
    workAndForce,
    centersOfMass,
  ],
}
