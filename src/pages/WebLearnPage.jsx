import { Suspense, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import WebLessonPlayer from '../components/learn/WebLessonPlayer.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'

// Lesson registry — add new lessons here
import { lesson as sandbox1 } from '../data/learn/sandbox/lesson-01.js'
import { lesson as sandbox2 } from '../data/learn/sandbox/lesson-02.js'
import { lesson as sandbox3 } from '../data/learn/sandbox/lesson-03.js'

// CSS Mastery lessons
import { lesson as css01 } from '../content/css-mastery/css-01-normal-flow.js'
import { lesson as css02 } from '../content/css-mastery/css-02-box-model.js'
import { lesson as css03 } from '../content/css-mastery/css-03-centering.js'
import { lesson as css04 } from '../content/css-mastery/css-04-stacking-contexts.js'
import { lesson as css05 } from '../content/css-mastery/css-05-overflow.js'

const LESSONS = {
  'sandbox/1': sandbox1,
  'sandbox/2': sandbox2,
  'sandbox/3': sandbox3,
  'css-mastery/01': css01,
  'css-mastery/02': css02,
  'css-mastery/03': css03,
  'css-mastery/04': css04,
  'css-mastery/05': css05,
}

// Ordered series list — drives "Next lesson" button
const SERIES_ORDER = {
  sandbox: ['1', '2', '3'],
  'css-mastery': ['01', '02', '03', '04', '05'],
}

// First lesson per series — used for redirect when no lessonId in URL
const SERIES_FIRST = {
  sandbox: '1',
  'css-mastery': '01',
}

export default function WebLearnPage() {
  const { series, lessonId } = useParams()
  const navigate = useNavigate()

  // Redirect /web-learn/:series → /web-learn/:series/first-lesson
  useEffect(() => {
    if (series && !lessonId) {
      const first = SERIES_FIRST[series]
      if (first) navigate(`/web-learn/${series}/${first}`, { replace: true })
    }
  }, [series, lessonId, navigate])

  const key = series && lessonId ? `${series}/${lessonId}` : null
  const lesson = key ? LESSONS[key] : null

  if (!lesson) {
    if (series && !lessonId) return null // redirecting
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#08111f] text-slate-400 gap-4">
        <p className="text-lg">Web Lesson not found: {key}</p>
        <button
          onClick={() => navigate('/labs')}
          className="text-sm text-cyan-500 hover:text-cyan-400"
        >
          Return to Labs
        </button>
      </div>
    )
  }

  // Determine next lesson in the series
  const seriesOrder = SERIES_ORDER[series] || []
  const currentIndex = seriesOrder.indexOf(lessonId)
  const nextId = currentIndex !== -1 && currentIndex < seriesOrder.length - 1
    ? seriesOrder[currentIndex + 1]
    : null
  
  const nextPath = nextId ? `/web-learn/${series}/${nextId}` : null

  // Build series metadata for the dropdown menu
  const seriesLessons = seriesOrder.map(id => {
    const l = LESSONS[`${series}/${id}`]
    return {
      id,
      title: l?.title ?? id,
      path: `/web-learn/${series}/${id}`,
      active: id === lessonId
    }
  })

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-[#08111f]">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <WebLessonPlayer
        key={lesson.id}
        lesson={lesson}
        onBack={() => navigate('/labs')}
        onNext={nextPath ? () => navigate(nextPath) : null}
        nextTitle={nextId ? (LESSONS[`${series}/${nextId}`]?.title ?? null) : null}
        seriesLessons={seriesLessons}
        onJumpToLesson={(path) => navigate(path)}
      />
    </Suspense>
  )
}
