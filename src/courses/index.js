import { getAllChapters, getAllCourses } from '../courses/courseLoader.js'

export const COURSES    = getAllCourses()
export const CURRICULUM = getAllChapters()

export const ALL_LESSONS = CURRICULUM.flatMap(ch =>
  ch.lessons.map(l => ({ ...l, course: ch.course, chapterNumber: ch.number }))
)

export const LESSON_MAP = Object.fromEntries(ALL_LESSONS.map(l => [l.slug, l]))
