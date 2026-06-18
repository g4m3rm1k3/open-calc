import { getAllCourses, getChapters } from '../courses/courseLoader.js'
import { useProgress } from '../hooks/useProgress.js'
import StemOrbBackground from '../components/backgrounds/StemOrbBackground.jsx'
import GridPage from './GridPage.jsx'

const ENTRIES = getAllCourses()
  .map(course => ({ ...course, chapters: getChapters(course.key) }))
  .filter(e => e.chapters.length > 0)

export default function AllCoursesPage() {
  const { getLessonStatus } = useProgress()
  return (
    <GridPage
      title="All Courses"
      Background={StemOrbBackground}
      badge={{ label: 'Curriculum', className: 'border-indigo-400/30 bg-indigo-400/10 text-indigo-200' }}
      headline="All Courses"
      subline={`${ENTRIES.length} courses across math, science & engineering. Pick up where you left off.`}
      items={ENTRIES}
      cardVariant="course"
      extraProps={item => ({ chapters: item.chapters, getLessonStatus })}
    />
  )
}
