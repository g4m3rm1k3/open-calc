import { Suspense, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LessonPlayer from '../components/learn/LessonPlayer.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'

// Lesson registry — add new lessons here
import { lesson as sicp11 } from '../data/learn/sicp/lesson-1-1.js'
import { lesson as sicp12 } from '../data/learn/sicp/lesson-1-2.js'
import { lesson as sicp13 } from '../data/learn/sicp/lesson-1-3.js'
import { lesson as sicp14 } from '../data/learn/sicp/lesson-1-4.js'
import { lesson as sicp15 } from '../data/learn/sicp/lesson-1-5.js'
import { lesson as sicp16 } from '../data/learn/sicp/lesson-1-6.js'
import { lesson as sicp17 } from '../data/learn/sicp/lesson-1-7.js'
import { lesson as sicp21 } from '../data/learn/sicp/lesson-2-1.js'

const LESSONS = {
  'sicp/1-1': sicp11,
  'sicp/1-2': sicp12,
  'sicp/1-3': sicp13,
  'sicp/1-4': sicp14,
  'sicp/1-5': sicp15,
  'sicp/1-6': sicp16,
  'sicp/1-7': sicp17,
  'sicp/2-1': sicp21,
}

// Ordered series list — drives "Next lesson" button
const SERIES_ORDER = {
  sicp: ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '2-1'],
}

// First lesson per series — used for redirect when no lessonId in URL
const SERIES_FIRST = {
  sicp: '1-1',
}

export default function LearnPage() {
  const { series, lessonId } = useParams()
  const navigate = useNavigate()

  // Redirect /learn/:series → /learn/:series/first-lesson
  useEffect(() => {
    if (series && !lessonId) {
      const first = SERIES_FIRST[series]
      if (first) navigate(`/learn/${series}/${first}`, { replace: true })
    }
  }, [series, lessonId, navigate])

  const key = series && lessonId ? `${series}/${lessonId}` : null
  const lesson = key ? LESSONS[key] : null

  if (!lesson) {
    if (series && !lessonId) return null // redirecting
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#08111f] text-slate-400 gap-4">
        <p className="text-lg">Lesson not found: {key}</p>
        <button
          onClick={() => navigate('/labs')}
          className="text-cyan-400 hover:text-cyan-300 text-sm underline"
        >
          Back to Labs
        </button>
      </div>
    )
  }

  const order = SERIES_ORDER[series] ?? []
  const currentIdx = order.indexOf(lessonId)
  const nextId = currentIdx >= 0 && currentIdx < order.length - 1 ? order[currentIdx + 1] : null
  const nextPath = nextId ? `/learn/${series}/${nextId}` : null

  const seriesLessons = order.map(id => ({
    id,
    title: LESSONS[`${series}/${id}`]?.title ?? id,
    path: `/learn/${series}/${id}`,
    active: id === lessonId,
  }))

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-[#08111f]">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <LessonPlayer
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
