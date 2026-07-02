import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import EngMathLeft from './EngMathLeft.jsx'
import EngMathRight from './EngMathRight.jsx'

function loadQuizResults(slug) {
  try { return JSON.parse(localStorage.getItem(`em-results:${slug}`)) ?? {} } catch { return {} }
}

function saveQuizResults(slug, results) {
  try { localStorage.setItem(`em-results:${slug}`, JSON.stringify(results)) } catch {}
}

export default function EngMathReader({ content, title, slug, seriesNav, lessons = [] }) {
  const [activeScene, setActiveScene] = useState('WelcomeScene')
  const [quizResults, setQuizResults] = useState(() => loadQuizResults(slug))
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef(null)
  const navigate = useNavigate()

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return
    function handler(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [pickerOpen])

  // Reset when lesson changes
  useEffect(() => {
    setQuizResults(loadQuizResults(slug))
    setActiveScene('WelcomeScene')
  }, [slug])

  const handleSceneChange = useCallback((sceneId) => {
    setActiveScene(sceneId)
  }, [])

  const handleQuizResult = useCallback((quizId, correct) => {
    setQuizResults((prev) => {
      const next = correct === null
        ? (() => { const r = { ...prev }; delete r[quizId]; return r })()
        : { ...prev, [quizId]: correct }
      saveQuizResults(slug, next)
      return next
    })
  }, [slug])

  const totalAnswered = Object.keys(quizResults).length
  const totalCorrect = Object.values(quizResults).filter(Boolean).length

  return (
    <div className="fixed inset-0 z-[110] bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-4 h-11 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0"
          >
            ← Back
          </button>
          {title && (
            <>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">|</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                {title}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Quiz score */}
          {totalAnswered > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              <span className="text-slate-400 dark:text-slate-500">Checkpoints</span>
              <span className={totalCorrect === totalAnswered ? 'text-green-600 dark:text-green-400' : 'text-indigo-600 dark:text-indigo-400'}>
                {totalCorrect}/{totalAnswered}
              </span>
            </div>
          )}

          {/* Series navigation */}
          {seriesNav && (
            <div className="flex items-center gap-2">
              {seriesNav.prev && (
                <button
                  onClick={() => navigate(`/eng-math/${seriesNav.prev.slug}`)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  ←
                </button>
              )}

              {/* Clickable lesson picker */}
              <div className="relative" ref={pickerRef}>
                <button
                  onClick={() => setPickerOpen((o) => !o)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-mono flex items-center gap-1"
                >
                  {seriesNav.current}
                  <span className="text-slate-400 dark:text-slate-500">▾</span>
                </button>

                {pickerOpen && (
                  <div className="absolute right-0 top-full mt-1 w-72 max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50 py-1">
                    {lessons.map((lesson, i) => (
                      <button
                        key={lesson.slug}
                        onClick={() => { navigate(`/eng-math/${lesson.slug}`); setPickerOpen(false) }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                          lesson.slug === slug ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="font-mono text-slate-400 dark:text-slate-600 shrink-0 mt-px w-6">
                          {i + 1}.
                        </span>
                        <span className="leading-tight">{lesson.title ?? lesson.slug}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {seriesNav.next && (
                <button
                  onClick={() => navigate(`/eng-math/${seriesNav.next.slug}`)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Split layout */}
      <div className="flex-1 grid grid-cols-2 min-h-0">
        <EngMathLeft
          content={content}
          slug={slug}
          onSceneChange={handleSceneChange}
          onQuizResult={handleQuizResult}
        />
        <EngMathRight
          activeScene={activeScene}
          quizResults={quizResults}
        />
      </div>
    </div>
  )
}
