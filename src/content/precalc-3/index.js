import polarCoords from './08-polar-coordinates.js'
import trigInCalculus from './trig-in-calculus.js'
import logarithmRelationships from './logarithm-relationships.js'
import trigApplications from './trig-applications.js'
import anglesFoundations from './angles-foundations.js'
import triangleGeometry from './triangle-geometry.js'
import trigRatiosRightTriangles from './trig-ratios-right-triangles.js'
import graphingTrigFunctions from './graphing-trig-functions.js'
import inverseTrig from './inverse-trig-functions.js'
import solvingTriangles from './solving-triangles.js'
import trigIdentities from './trig-identities-deep-dive.js'

export default {
  id: 'precalc-3',
  number: 'precalc-3',
  title: 'Trigonometry & Transcendental Functions',
  slug: 'trig',
  description: 'Trig identities from the unit circle, inverse trig functions, logarithms as area, and sinusoidal models — the transcendental toolkit that unlocks advanced calculus.',
  color: 'cyan',
  lessons: [
    anglesFoundations,
    triangleGeometry,
    trigRatiosRightTriangles,
    graphingTrigFunctions,
    inverseTrig,
    solvingTriangles,
    trigIdentities,
    polarCoords,
    trigInCalculus,
    logarithmRelationships,
    trigApplications,
  ],
}
