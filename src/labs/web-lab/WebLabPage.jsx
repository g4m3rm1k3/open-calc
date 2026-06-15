import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import WebLessonPlayer from '../../engines/lesson/WebLessonPlayer.jsx'
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'

import { lesson as l1 } from '../../data/learn/sandbox/lesson-01.js'
import { lesson as l2 } from '../../data/learn/sandbox/lesson-02.js'
import { lesson as l3 } from '../../data/learn/sandbox/lesson-03.js'

const LESSONS = { '1': l1, '2': l2, '3': l3 }
const ORDER = ['1', '2', '3']

export default function WebLabPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!lessonId) navigate('/web-learn/sandbox/1', { replace: true })
  }, [lessonId, navigate])

  const lesson = LESSONS[lessonId]
  if (!lesson) return null

  const idx = ORDER.indexOf(lessonId)
  const nextId = idx !== -1 && idx < ORDER.length - 1 ? ORDER[idx + 1] : null
  const seriesLessons = ORDER.map(id => ({
    id, title: LESSONS[id]?.title ?? id,
    path: `/web-learn/sandbox/${id}`,
    active: id === lessonId,
  }))

  return (
    <WebLessonPlayer
      key={lesson.id}
      lesson={lesson}
      onBack={() => navigate('/labs')}
      onNext={nextId ? () => navigate(`/web-learn/sandbox/${nextId}`) : null}
      nextTitle={nextId ? LESSONS[nextId]?.title : null}
      seriesLessons={seriesLessons}
      onJumpToLesson={(path) => navigate(path)}
    />
  )
}
