import parametricEquations from './00-parametric-equations.js'
import polarCoordinates from './01-polar-coordinates.js'
import vectors from './02-vectors.js'
import polarAreaLength from './03-polar-area-length.js'
import vectorCalculusPreview from './04-vector-calculus-preview.js'

export default {
  id: 'chapter-6',
  number: 6,
  title: 'Parametric, Polar & Vectors',
  slug: 'parametric-polar-vectors',
  description: 'Beyond Cartesian coordinates: parametric curves, polar coordinates, and vectors in 2D and 3D. These tools are the bridge to multivariable calculus, physics, and engineering applications — essential for any Calc 2 course and for understanding the geometry of space.',
  color: 'rose',
  lessons: [parametricEquations, polarCoordinates, vectors, polarAreaLength, vectorCalculusPreview],
}
