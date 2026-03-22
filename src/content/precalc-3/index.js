import angles from './01-angles.js'
import triangles from './02-triangles.js'
import trigRatiosUnitCircle from './03-trig-ratios-unit-circle.js'
import trigGraphs from './04-trig-graphs.js'
import inverseTrig from './05-inverse-trig.js'
import solvingTriangles from './06-solving-triangles.js'
import identitiesProofs from './07-identities-proofs.js'
import polarCoordinates from './08-polar-coordinates.js'

export default {
  id: 'precalc-3',
  number: 'precalc-3',
  title: 'Trigonometry',
  slug: 'trigonometry',
  description: 'A comprehensive journey through Trigonometry, from basic angles and geometry to the Unit Circle, graphing, identities, and polar coordinates. This directly powers the tools needed for Calculus.',
  color: 'sky',
  lessons: [
    angles,
    triangles,
    trigRatiosUnitCircle,
    trigGraphs,
    inverseTrig,
    solvingTriangles,
    identitiesProofs,
    polarCoordinates,

  ],
}
