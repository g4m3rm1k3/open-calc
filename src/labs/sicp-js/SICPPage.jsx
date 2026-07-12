import { Suspense, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LessonPlayer from './LessonPlayer.jsx'
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'

import { lesson as l11 } from './lessons/lesson-1-1.js'
import { lesson as l12 } from './lessons/lesson-1-2.js'
import { lesson as l13 } from './lessons/lesson-1-3.js'
import { lesson as l14 } from './lessons/lesson-1-4.js'
import { lesson as l14b } from './lessons/lesson-1-4b.js'
import { lesson as l15 } from './lessons/lesson-1-5.js'
import { lesson as l16 } from './lessons/lesson-1-6.js'
import { lesson as l17 } from './lessons/lesson-1-7.js'
import { lesson as l21 } from './lessons/lesson-2-1.js'
import { lesson as l22 } from './lessons/lesson-2-2.js'
import { lesson as l23 } from './lessons/lesson-2-3.js'
import { lesson as l24 } from './lessons/lesson-2-4.js'
import { lesson as l24b } from './lessons/lesson-2-4b.js'
import { lesson as l24c } from './lessons/lesson-2-4c.js'
import { lesson as l25 } from './lessons/lesson-2-5.js'
import { lesson as l26 } from './lessons/lesson-2-6.js'
import { lesson as l27 } from './lessons/lesson-2-7.js'
import { lesson as l27b } from './lessons/lesson-2-7b.js'
import { lesson as l31 } from './lessons/lesson-3-1.js'
import { lesson as l32 } from './lessons/lesson-3-2.js'
import { lesson as l33 } from './lessons/lesson-3-3.js'
import { lesson as l33b } from './lessons/lesson-3-3b.js'
import { lesson as l34 } from './lessons/lesson-3-4.js'
import { lesson as l41 } from './lessons/lesson-4-1.js'
import { lesson as l42 } from './lessons/lesson-4-2.js'
import { lesson as l43 } from './lessons/lesson-4-3.js'
import { lesson as l51 } from './lessons/lesson-5-1.js'
import { lesson as l51b } from './lessons/lesson-5-1b.js'
import { lesson as l53 } from './lessons/lesson-5-3.js'
import { lesson as l54 } from './lessons/lesson-5-4.js'
import { lesson as l54b } from './lessons/lesson-5-4b.js'

const ORDER = [
  '1-1','1-2','1-3','1-4','1-4b','1-5','1-6','1-7',
  '2-1','2-2','2-3','2-4','2-4b','2-4c','2-5','2-6','2-7','2-7b',
  '3-1','3-2','3-3','3-3b','3-4',
  '4-1','4-2','4-3',
  '5-1','5-1b','5-3','5-4','5-4b',
]

const LESSONS = {
  '1-1':l11,'1-2':l12,'1-3':l13,'1-4':l14,'1-4b':l14b,'1-5':l15,'1-6':l16,'1-7':l17,
  '2-1':l21,'2-2':l22,'2-3':l23,'2-4':l24,'2-4b':l24b,'2-4c':l24c,'2-5':l25,'2-6':l26,'2-7':l27,'2-7b':l27b,
  '3-1':l31,'3-2':l32,'3-3':l33,'3-3b':l33b,'3-4':l34,
  '4-1':l41,'4-2':l42,'4-3':l43,
  '5-1':l51,'5-1b':l51b,'5-3':l53,'5-4':l54,'5-4b':l54b,
}

export default function SICPPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!lessonId) navigate('/learn/sicp/1-1', { replace: true })
  }, [lessonId, navigate])

  const lesson = lessonId ? LESSONS[lessonId] : null

  if (!lesson) {
    if (!lessonId) return null
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#08111f] text-slate-400 gap-4">
        <p className="text-lg">Lesson not found: sicp/{lessonId}</p>
        <button onClick={() => navigate('/')} className="text-cyan-400 hover:text-cyan-300 text-sm underline">
          Back to Labs
        </button>
      </div>
    )
  }

  const idx = ORDER.indexOf(lessonId)
  const nextId = idx >= 0 && idx < ORDER.length - 1 ? ORDER[idx + 1] : null

  const seriesLessons = ORDER.map(id => ({
    id, title: LESSONS[id]?.title ?? id,
    path: `/learn/sicp/${id}`,
    active: id === lessonId,
  }))

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#08111f]"><LoadingSpinner size="lg" /></div>}>
      <LessonPlayer
        key={lesson.id}
        lesson={lesson}
        onBack={() => navigate('/')}
        onNext={nextId ? () => navigate(`/learn/sicp/${nextId}`) : null}
        nextTitle={nextId ? (LESSONS[nextId]?.title ?? null) : null}
        seriesLessons={seriesLessons}
        onJumpToLesson={(path) => navigate(path)}
      />
    </Suspense>
  )
}
