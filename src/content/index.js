import ch0 from './chapter-0/index.js'
import ch1 from './chapter-1/index.js'
import ch2 from './chapter-2/index.js'

export const CURRICULUM = [ch0, ch1, ch2]

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
