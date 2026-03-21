import ch0 from './chapter-0/index.js'
import ch1 from './chapter-1/index.js'
import ch2 from './chapter-2/index.js'
import ch3 from './chapter-3/index.js'
import ch4 from './chapter-4/index.js'
import ch5 from './chapter-5/index.js'
import ch6 from './chapter-6/index.js'
import discrete1 from './discrete-math/index.js'

const CALC_CURRICULUM = [ch0, ch1, ch2, ch3, ch4, ch5, ch6].map(ch => ({ ...ch, course: 'calc' }))
const DISCRETE_CURRICULUM = [discrete1].map(ch => ({ ...ch, course: 'discrete' }))

export const CURRICULUM = [...CALC_CURRICULUM, ...DISCRETE_CURRICULUM]

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

// Cache bust 1
