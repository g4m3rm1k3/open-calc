import { useParams, useNavigate } from 'react-router-dom'
import { useReducer, useEffect, useState } from 'react'
import { loadLesson, loadLessonSource } from '../courses/courseLoader.js'
import { builderReducer } from '../components/lesson-builder/builderReducer.js'
import { emptyState, lessonToState, PALETTE_BLOCKS } from '../components/lesson-builder/builderUtils.js'
import ComponentPalette from '../components/lesson-builder/ComponentPalette.jsx'
import BuilderCanvas from '../components/lesson-builder/BuilderCanvas.jsx'
import ExportPanel from '../components/lesson-builder/ExportPanel.jsx'
import StepTour from '../components/ui/StepTour.jsx'

const BUILDER_TOUR_SEEN_KEY = 'oc-lesson-builder-intro-seen'

const BUILDER_TOUR_STEPS = [
  {
    title: 'Build a lesson without touching code',
    body: "Lessons are made of blocks — Intuition, Math, Rigor, Examples, Challenges, Quiz, and Python notebooks. Add blocks from the palette on the left, fill them in, and the builder assembles a real lesson file behind the scenes.",
  },
  {
    title: 'Visualizations connect by ID',
    body: "Any block can embed an interactive visualization by referencing its component ID (e.g. previewVisualizationId). The Viz Builder lets you create and preview those separately, then drop the ID into a lesson block here.",
  },
  {
    title: 'LaTeX is checked as you type',
    body: "Math blocks render live with KaTeX — if an equation is broken, you'll see the error immediately instead of finding out after submitting.",
  },
  {
    title: 'Submit it as a real contribution',
    body: "When you're done, \"Submit as contribution\" in the Export panel signs you in with GitHub and opens a real pull request — fork, branch, and commit handled automatically. No local git setup needed.",
  },
]

function BuilderTour({ onDone }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col min-h-[300px]">
        <StepTour steps={BUILDER_TOUR_STEPS} onDone={onDone} finalLabel="Start building" />
      </div>
    </div>
  )
}

export default function LessonBuilderPage() {
  const { chapterId, lessonSlug } = useParams()
  const navigate = useNavigate()

  const [state, dispatch] = useReducer(builderReducer, undefined, () =>
    emptyState(chapterId ?? '', lessonSlug ?? ''),
  )
  const [loading, setLoading] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showTour, setShowTour] = useState(() => !localStorage.getItem(BUILDER_TOUR_SEEN_KEY))
  // Diagrams live one folder per course (src/courses/<courseId>/diagrams/) —
  // derive courseId from chapterId the same way BuilderCanvas/lessonSerializer
  // do, so this works for whichever lesson/course happens to be open.
  const courseId = (chapterId || state.meta.chapter || 'geometry').replace(/-\d+$/, '')
  const dismissTour = () => {
    localStorage.setItem(BUILDER_TOUR_SEEN_KEY, '1')
    setShowTour(false)
  }

  useEffect(() => {
    if (!chapterId || !lessonSlug) return
    let cancelled = false
    setLoading(true)
    Promise.all([loadLesson(chapterId, lessonSlug), loadLessonSource(chapterId, lessonSlug)])
      .then(([lesson, sourceText]) => {
        if (cancelled) return
        if (lesson) {
          dispatch({ type: 'LOAD', payload: lessonToState(lesson, chapterId, lessonSlug, sourceText) })
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
            onClick={() => window.dispatchEvent(new CustomEvent('oc-open-scratchpad', { detail: { dir: `src/courses/${courseId}/diagrams` } }))}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
          >
            🎨 Open Scratchpad
          </button>
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

      {showTour && <BuilderTour onDone={dismissTour} />}
    </div>
  )
}
