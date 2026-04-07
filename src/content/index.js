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
import dataScience1 from './data-science/index.js'
import javascriptCore1 from './javascript-1/index.js'
import tetris1 from './tetris-1/index.js'
import cs1 from './cs-1/index.js'
import chemistry1 from './chemistry-1/index.js'
import chemistry2 from './chemistry-2/index.js'
import digitalFundamentals from './digital-fundamentals/index.js'
import cnc1 from './cnc-1/index.js'
import git1 from './git-1/index.js'
import dsa1 from './dsa-1/index.js'

const CALC_CURRICULUM = [ch0, ch1, ch2, ch3, ch4, ch5, ch6].map(ch => ({ ...ch, course: 'calc' }))
const DISCRETE_CURRICULUM = [discrete1].map(ch => ({ ...ch, course: 'discrete' }))
const PRECALC_CURRICULUM = [precalc1, precalc2, precalc3, precalc4, precalc5].map(ch => ({ ...ch, course: 'precalc' }))
const PHYSICS_CURRICULUM = physics1Chapters.map(ch => ({ ...ch, course: 'physics-1' }))
const GEOMETRY_CURRICULUM = [geo1, geo2, geo3, geo4, geo5, geo6].map(ch => ({ ...ch, course: 'geometry' }))
const WEB_CURRICULUM = web1.map(ch => ({ ...ch, course: 'web-1' }))
const LA_CURRICULUM = linearAlgebra1.map(ch => ({ ...ch, course: 'linear-algebra' }))
const PYTHON_CURRICULUM = python1.map(ch => ({ ...ch, course: 'python-1' }))
const DATA_SCIENCE_CURRICULUM = dataScience1.map(ch => ({ ...ch, course: 'data-science-1' }))
const JAVASCRIPT_CORE_CURRICULUM = javascriptCore1.map(ch => ({ ...ch, course: 'javascript-core' }))
const TETRIS_CURRICULUM = tetris1.map(ch => ({ ...ch, course: 'tetris' }))
const CS_CURRICULUM = cs1.map(ch => ({ ...ch, course: 'cs-1' }))
const CHEMISTRY_CURRICULUM = [...chemistry1, ...chemistry2].map(ch => ({ ...ch, course: 'chemistry-1' }))
const DIGITAL_FUNDAMENTALS_CURRICULUM = digitalFundamentals.map(ch => ({ ...ch, course: 'digital-fundamentals' }))
const CNC_CURRICULUM = [cnc1].map(ch => ({ ...ch, course: 'cnc-logic' }))
const GIT_CURRICULUM = [git1].map(ch => ({ ...ch, course: 'git-logic' }))
const DSA_CURRICULUM = dsa1.map(ch => ({ ...ch, course: 'dsa-1' }))

export const CURRICULUM = [
  ...PRECALC_CURRICULUM, 
  ...GEOMETRY_CURRICULUM, 
  ...CALC_CURRICULUM, 
  ...DISCRETE_CURRICULUM, 
  ...PHYSICS_CURRICULUM, 
  ...WEB_CURRICULUM, 
  ...LA_CURRICULUM,
  ...PYTHON_CURRICULUM,
  ...DATA_SCIENCE_CURRICULUM,
  ...JAVASCRIPT_CORE_CURRICULUM,
  ...TETRIS_CURRICULUM,
  ...CS_CURRICULUM,
  ...CHEMISTRY_CURRICULUM,
  ...DIGITAL_FUNDAMENTALS_CURRICULUM,
  ...CNC_CURRICULUM,
  ...GIT_CURRICULUM,
  ...DSA_CURRICULUM,
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

// Dev-only: validate lesson.chapter fields match the chapter.number they live in
if (typeof import.meta.env !== 'undefined' && import.meta.env.DEV) {
  const knownChapterNumbers = new Set(CURRICULUM.map((ch) => ch.number))
  for (const ch of CURRICULUM) {
    for (const lesson of ch.lessons) {
      if (lesson.chapter !== undefined && lesson.chapter !== ch.number) {
        console.warn(
          `[open-calc validator] Lesson chapter mismatch:\n` +
          `  lesson.id      = "${lesson.id}"\n` +
          `  lesson.chapter = ${lesson.chapter}  ← should be ${ch.number}\n` +
          `  chapter.title  = "${ch.title}"\n` +
          `  Fix: set chapter: ${ch.number} in ${lesson.id}.js`
        )
      }
      if (lesson.chapter !== undefined && !knownChapterNumbers.has(lesson.chapter)) {
        console.warn(
          `[open-calc validator] Lesson references unknown chapter: "${lesson.id}" has chapter=${lesson.chapter} which does not match any chapter.number`
        )
      }
    }
  }
}

// Cache bust 3
