import { useEffect } from 'react'
import { getAllCourses, getChapters } from '../courses/courseLoader.js'
import { useProgress } from '../hooks/useProgress.js'
import StemOrbBackground from '../components/courses/StemOrbBackground.jsx'
import AppCard from '../components/cards/AppCard.jsx'

const ALL_COURSES = getAllCourses()
const COURSE_ENTRIES = ALL_COURSES
  .map(course => ({ course, chapters: getChapters(course.key) }))
  .filter(({ chapters }) => chapters.length > 0)

export default function AllCoursesPage() {
  const { getLessonStatus } = useProgress()

  useEffect(() => {
    document.title = 'All Courses — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [])

  return (
    <div className="relative min-h-screen">
      <StemOrbBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        <div className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-[8px] border border-indigo-400/30 bg-indigo-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-indigo-200 backdrop-blur-md">
            Curriculum
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 text-white">All Courses</h1>
          <p className="text-slate-300/80 max-w-xl leading-relaxed">
            {COURSE_ENTRIES.length} courses across math, science &amp; engineering.{' '}
            <span className="text-indigo-300 font-semibold">Pick up where you left off.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {COURSE_ENTRIES.map(({ course, chapters }) => (
            <AppCard key={course.key} item={course} variant="course" chapters={chapters} getLessonStatus={getLessonStatus} />
          ))}
        </div>
      </div>
    </div>
  )
}
