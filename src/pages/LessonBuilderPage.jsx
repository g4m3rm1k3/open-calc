import { useParams, useNavigate } from 'react-router-dom'
import { useReducer, useEffect, useState } from 'react'
import { loadLesson } from '../courses/courseLoader.js'
import { builderReducer } from '../components/lesson-builder/builderReducer.js'
import { emptyState, lessonToState, PALETTE_BLOCKS } from '../components/lesson-builder/builderUtils.js'
import ComponentPalette from '../components/lesson-builder/ComponentPalette.jsx'
import BuilderCanvas from '../components/lesson-builder/BuilderCanvas.jsx'
import ExportPanel from '../components/lesson-builder/ExportPanel.jsx'

export default function LessonBuilderPage() {
  const { chapterId, lessonSlug } = useParams()
  const navigate = useNavigate()

  const [state, dispatch] = useReducer(builderReducer, undefined, () =>
    emptyState(chapterId ?? '', lessonSlug ?? ''),
  )
  const [loading, setLoading] = useState(false)
  const [showExport, setShowExport] = useState(false)

  useEffect(() => {
    if (!chapterId || !lessonSlug) return
    let cancelled = false
    setLoading(true)
    loadLesson(chapterId, lessonSlug).then(lesson => {
      if (cancelled) return
      if (lesson) {
        dispatch({ type: 'LOAD', payload: lessonToState(lesson, chapterId, lessonSlug) })
      }
      setLoading(false)
    }).catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [chapterId, lessonSlug])

  const presentTypes = state.sections.map(s => s.type)

  const backPath = chapterId && lessonSlug
    ? `/chapter/${chapterId}/${lessonSlug}`
    : '/'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center gap-4 px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          ← {chapterId ? 'Back to lesson' : 'Home'}
        </button>

        <div className="flex items-center gap-2 ml-2">
          <span className="text-base">🔨</span>
          <span className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Lesson Builder
          </span>
        </div>

        {(chapterId || state.meta.slug) && (
          <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            {chapterId ?? state.meta.chapter} / {lessonSlug ?? (state.meta.slug || 'new-lesson')}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {loading && (
            <span className="text-xs text-slate-400 animate-pulse">Loading lesson…</span>
          )}
          <button
            onClick={() => setShowExport(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow transition-colors"
          >
            Export .js
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex gap-6 items-start">
        {/* Left: palette */}
        <ComponentPalette
          presentTypes={presentTypes}
          onAdd={type => dispatch({ type: 'ADD_SECTION', blockType: type })}
        />

        {/* Center: canvas */}
        <BuilderCanvas state={state} dispatch={dispatch} />
      </div>

      {/* Export panel overlay */}
      {showExport && (
        <ExportPanel state={state} onClose={() => setShowExport(false)} />
      )}
    </div>
  )
}
