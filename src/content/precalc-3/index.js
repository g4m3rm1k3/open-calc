// Foundational trig lessons (video series: TR-00 to TR-44)
import angles from './01-angles.js'
import trianglesBasic from './02-triangles.js'
import trigRatiosUC from './03-trig-ratios-unit-circle.js'
import trigGraphsBasic from './04-trig-graphs.js'
import inverseTrigBasic from './05-inverse-trig.js'
import solvingTrianglesBasic from './06-solving-triangles.js'
import identitiesBasic from './07-identities-proofs.js'
import polarCoords from './08-polar-coordinates.js'

// Rich conceptual lessons (existing)
import trigIdentities from './trig-identities-deep-dive.js'
import trigInCalculus from './trig-in-calculus.js'
import logarithmRelationships from './logarithm-relationships.js'
import inverseTrig from './inverse-trig-functions.js'
import trigApplications from './trig-applications.js'

// Rich conceptual lessons (new — full interactive lessons with proofs)
import anglesFoundations from './angles-foundations.js'
import triangleGeometry from './triangle-geometry.js'
import trigRatiosRightTriangles from './trig-ratios-right-triangles.js'
import graphingTrigFunctions from './graphing-trig-functions.js'
import solvingTriangles from './solving-triangles.js'

export default {
  id: 'precalc-3',
  number: 'precalc-3',
  title: 'Trigonometry & Transcendental Functions',
  slug: 'trig',
  description: 'Trig identities from the unit circle, inverse trig functions, logarithms as area, and sinusoidal models — the transcendental toolkit that unlocks advanced calculus.',
  color: 'cyan',
  lessons: [
    anglesFoundations,
    angles,
    triangleGeometry,
    trianglesBasic,
    trigRatiosRightTriangles,
    trigRatiosUC,
    graphingTrigFunctions,
    trigGraphsBasic,
    solvingTriangles,
    solvingTrianglesBasic,
    inverseTrigBasic,
    identitiesBasic,
    polarCoords,
    trigIdentities,
    trigInCalculus,
    logarithmRelationships,
    inverseTrig,
    trigApplications,
  ],
}
