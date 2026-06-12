import { Suspense, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LessonPlayer from '../components/learn/LessonPlayer.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'

// Lesson registry — add new lessons here
import { lesson as sicp11 } from '../data/learn/sicp/lesson-1-1.js'
import { lesson as sicp12 } from '../data/learn/sicp/lesson-1-2.js'
import { lesson as sicp13 } from '../data/learn/sicp/lesson-1-3.js'
import { lesson as sicp14 } from '../data/learn/sicp/lesson-1-4.js'
import { lesson as sicp14b } from '../data/learn/sicp/lesson-1-4b.js'
import { lesson as sicp15 } from '../data/learn/sicp/lesson-1-5.js'
import { lesson as sicp16 } from '../data/learn/sicp/lesson-1-6.js'
import { lesson as sicp17 } from '../data/learn/sicp/lesson-1-7.js'
import { lesson as sicp21 } from '../data/learn/sicp/lesson-2-1.js'
import { lesson as sicp22 } from '../data/learn/sicp/lesson-2-2.js'
import { lesson as sicp23 } from '../data/learn/sicp/lesson-2-3.js'
import { lesson as sicp24 } from '../data/learn/sicp/lesson-2-4.js'
import { lesson as sicp24b } from '../data/learn/sicp/lesson-2-4b.js'
import { lesson as sicp24c } from '../data/learn/sicp/lesson-2-4c.js'
import { lesson as sicp25 } from '../data/learn/sicp/lesson-2-5.js'
import { lesson as sicp26 } from '../data/learn/sicp/lesson-2-6.js'
import { lesson as sicp27 } from '../data/learn/sicp/lesson-2-7.js'
import { lesson as sicp27b } from '../data/learn/sicp/lesson-2-7b.js'
import { lesson as sicp31 } from '../data/learn/sicp/lesson-3-1.js'
import { lesson as sicp32 } from '../data/learn/sicp/lesson-3-2.js'
import { lesson as sicp33 } from '../data/learn/sicp/lesson-3-3.js'
import { lesson as sicp33b } from '../data/learn/sicp/lesson-3-3b.js'
import { lesson as sicp41 } from '../data/learn/sicp/lesson-4-1.js'

import { lesson as dsa01 } from '../data/learn/dsa-patterns/lesson-01.js'
import { lesson as dsa06 } from '../data/learn/dsa-patterns/lesson-06.js'
import { lesson as dsa11 } from '../data/learn/dsa-patterns/lesson-11.js'
import { lesson as dsa14 } from '../data/learn/dsa-patterns/lesson-14.js'
import { lesson as dsa17 } from '../data/learn/dsa-patterns/lesson-17.js'
import { lesson as dsa21 } from '../data/learn/dsa-patterns/lesson-21.js'
import { lesson as dsa26 } from '../data/learn/dsa-patterns/lesson-26.js'
import { lesson as dsa27 } from '../data/learn/dsa-patterns/lesson-27.js'
import { lesson as dsa41 } from '../data/learn/dsa-patterns/lesson-41.js'
import { lesson as dsa42 } from '../data/learn/dsa-patterns/lesson-42.js'

const LESSONS = {
  'sicp/1-1': sicp11,
  'sicp/1-2': sicp12,
  'sicp/1-3': sicp13,
  'sicp/1-4': sicp14,
  'sicp/1-4b': sicp14b,
  'sicp/1-5': sicp15,
  'sicp/1-6': sicp16,
  'sicp/1-7': sicp17,
  'sicp/2-1': sicp21,
  'sicp/2-2': sicp22,
  'sicp/2-3': sicp23,
  'sicp/2-4': sicp24,
  'sicp/2-4b': sicp24b,
  'sicp/2-4c': sicp24c,
  'sicp/2-5': sicp25,
  'sicp/2-6': sicp26,
  'sicp/2-7': sicp27,
  'sicp/2-7b': sicp27b,
  'sicp/3-1': sicp31,
  'sicp/3-2': sicp32,
  'sicp/3-3': sicp33,
  'sicp/3-3b': sicp33b,
  'sicp/4-1': sicp41,

  'dsa-patterns/01': dsa01,
  'dsa-patterns/06': dsa06,
  'dsa-patterns/11': dsa11,
  'dsa-patterns/14': dsa14,
  'dsa-patterns/17': dsa17,
  'dsa-patterns/21': dsa21,
  'dsa-patterns/26': dsa26,
  'dsa-patterns/27': dsa27,
  'dsa-patterns/41': dsa41,
  'dsa-patterns/42': dsa42,
}

// Ordered series list — drives "Next lesson" button
const SERIES_ORDER = {
  sicp: [
    '1-1', '1-2', '1-3', '1-4', '1-4b', '1-5', '1-6', '1-7',
    '2-1', '2-2', '2-3', '2-4', '2-4b', '2-4c', '2-5', '2-6', '2-7', '2-7b',
    '3-1', '3-2', '3-3', '3-3b',
    '4-1',
  ],
  'dsa-patterns': ['01', '41', '06', '11', '42', '14', '17', '21', '26', '27'],
}

// First lesson per series — used for redirect when no lessonId in URL
const SERIES_FIRST = {
  sicp: '1-1',
  'dsa-patterns': '01',
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
