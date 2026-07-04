import { useState } from 'react'
import HtmlLabLesson from '../html-lab/HtmlLab/HtmlLabLesson'
import LessonCatalog from '../html-lab/HtmlLab/lessons/LessonCatalog'
import { LESSONS } from '../html-lab/HtmlLab/lessons/catalog'
import { useProgress } from '../../hooks/useProgress.js'

export const meta = {
  label: 'HTML Lab Lessons',
  emoji: '🎓',
  color: 'emerald',
  desc: 'Learn HTML, CSS, and JavaScript by watching real pages get built step by step, then trying it yourself — semantic tags first, then styling, then bringing pages to life with DOM manipulation. Browse lessons by topic, jump to any of them, and pick up right where you left off.',
  tags: ['HTML', 'CSS', 'JavaScript', 'Lessons', 'Interactive'],
  cover: { grad: 'from-emerald-600 via-teal-700 to-cyan-950', mark: '🎓', sub: 'Guided · Step-by-step · Challenges' },
}

export default function HtmlLabLessonsEntry({ onBack }) {
  const [activeLessonId, setActiveLessonId] = useState(null)
  const { markVisited } = useProgress()

  const selectLesson = (lessonId) => {
    markVisited(`html-lessons::${lessonId}`)
    setActiveLessonId(lessonId)
  }

  const activeLesson = LESSONS.find((l) => l.id === activeLessonId) ?? null

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      {activeLesson ? (
        <HtmlLabLesson lesson={activeLesson} onBack={() => setActiveLessonId(null)} />
      ) : (
        <LessonCatalog lessons={LESSONS} onSelect={selectLesson} onBack={onBack} />
      )}
    </div>
  )
}
