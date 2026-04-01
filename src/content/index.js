import { COURSES } from './courses.js'
import ch0 from './chapter-0/index.js'
import ch1 from './chapter-1/index.js'
import ch2 from './chapter-2/index.js'
import ch3 from './chapter-3/index.js'
import ch4 from './chapter-4/index.js'
import ch5 from './chapter-5/index.js'
import ch6 from './chapter-6/index.js'
import discrete1 from './discrete-math/index.js'
import precalc1 from './precalc/index.js'
import precalc2 from './precalc-2/index.js'
import precalc3 from './precalc-3/index.js'
import precalc4 from './precalc-4/index.js'
import precalc5 from './precalc-5/index.js'
import physics1Chapters from './physics-1/index.js'
import geo1 from './geometry-1/index.js'
import geo2 from './geometry-2/index.js'
import geo3 from './geometry-3/index.js'
import geo4 from './geometry-4/index.js'
import geo5 from './geometry-5/index.js'
import geo6 from './geometry-6/index.js'
import web1 from './web-1/index.js'
import linearAlgebra1 from './linear-algebra/index.js'
import python1 from './python-1/index.js'
import javascriptCore1 from './javascript-1/index.js'

const CALC_CURRICULUM = [ch0, ch1, ch2, ch3, ch4, ch5, ch6].map(ch => ({ ...ch, course: 'calc' }))
const DISCRETE_CURRICULUM = [discrete1].map(ch => ({ ...ch, course: 'discrete' }))
const PRECALC_CURRICULUM = [precalc1, precalc2, precalc3, precalc4, precalc5].map(ch => ({ ...ch, course: 'precalc' }))
const PHYSICS_CURRICULUM = physics1Chapters.map(ch => ({ ...ch, course: 'physics-1' }))
const GEOMETRY_CURRICULUM = [geo1, geo2, geo3, geo4, geo5, geo6].map(ch => ({ ...ch, course: 'geometry' }))
const WEB_CURRICULUM = web1.map(ch => ({ ...ch, course: 'web-1' }))
const LA_CURRICULUM = linearAlgebra1.map(ch => ({ ...ch, course: 'linear-algebra' }))
const PYTHON_CURRICULUM = python1.map(ch => ({ ...ch, course: 'python-1' }))
const JAVASCRIPT_CORE_CURRICULUM = javascriptCore1.map(ch => ({ ...ch, course: 'javascript-core' }))

export const CURRICULUM = [
  ...PRECALC_CURRICULUM, 
  ...GEOMETRY_CURRICULUM, 
  ...CALC_CURRICULUM, 
  ...DISCRETE_CURRICULUM, 
  ...PHYSICS_CURRICULUM, 
  ...WEB_CURRICULUM, 
  ...LA_CURRICULUM,
  ...PYTHON_CURRICULUM,
  ...JAVASCRIPT_CORE_CURRICULUM
]

// Flat map for O(1) lookup by slug within chapter
export const LESSON_MAP = Object.fromEntries(
  CURRICULUM.flatMap((ch) =>
    ch.lessons.map((l) => [`${ch.number}/${l.slug}`, l])
  )
)

// All lessons as a flat array (useful for prev/next navigation)
export const ALL_LESSONS = CURRICULUM.flatMap((ch) =>
  ch.lessons.map((l) => ({ ...l, chapterNumber: ch.number, chapterTitle: ch.title }))
)

export { COURSES }

// Cache bust 2
