import { useState, useEffect, useRef } from 'react'
import BlogPost from '../../components/blog/BlogPost.jsx'
import { VUE_LESSONS } from './lessons/lessonLoader.js'
import { SPREADSHEET_LESSONS } from './series/spreadsheet/seriesLoader.js'

const SERIES = [
  {
    id: 'intro',
    label: 'Vue Essentials',
    sublabel: 'Core concepts — ref, computed, components, composables',
    emoji: '🟢',
    lessons: VUE_LESSONS,
  },
  {
    id: 'spreadsheet',
    label: 'Build a Spreadsheet',
    sublabel: 'Project series — build Excel in Vue from scratch',
    emoji: '📊',
    lessons: SPREADSHEET_LESSONS,
  },
]

const PANEL_LS_KEY = 'vue-studio-panel-v1'

function loadPanelState() {
  try { return JSON.parse(localStorage.getItem(PANEL_LS_KEY) ?? 'null') ?? {} } catch { return {} }
}

function savePanelState(patch) {
  try {
    const prev = loadPanelState()
    localStorage.setItem(PANEL_LS_KEY, JSON.stringify({ ...prev, ...patch }))
  } catch {}
}

// ── Series picker ────────────────────────────────────────────────────────────

function SeriesList({ onSelect, onBack, ui }) {
  return (
    <div className="flex flex-col h-full">
      <div className={`px-4 py-3 border-b ${ui.border} flex items-center gap-2 flex-shrink-0`}>
        <button
          onClick={onBack}
          className={`text-xs ${ui.txt2} ${ui.hoverTx} transition-colors`}
        >
          ← Labs
        </button>
        <span className={`${ui.txt2} text-xs`}>·</span>
        <span className={`text-xs font-semibold ${ui.primary}`}>Vue Studio</span>
      </div>

      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <h2 className={`text-[10px] font-bold uppercase tracking-widest ${ui.txt2}`}>Lesson Series</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="space-y-2">
          {SERIES.map(s => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`w-full text-left p-3 rounded-xl ${ui.bg1} ${ui.hoverBg} border ${ui.border} transition-all group`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{s.emoji}</span>
                <span className={`text-sm font-semibold ${ui.txt1} transition-colors leading-tight`}>
                  {s.label}
                </span>
              </div>
              <p className={`text-[11px] ${ui.txt2} leading-snug ml-6`}>{s.sublabel}</p>
              <p className={`text-[10px] ${ui.txt2} mt-1 ml-6 opacity-70`}>{s.lessons.length} lessons</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Lesson list for one series ───────────────────────────────────────────────

function LessonList({ series, activeLessonIdx, onSelect, onBack, ui }) {
  return (
    <div className="flex flex-col h-full">
      <div className={`px-4 py-3 border-b ${ui.border} flex items-center gap-2 flex-shrink-0`}>
        <button
          onClick={onBack}
          className={`text-xs ${ui.txt2} ${ui.hoverTx} transition-colors`}
        >
          ← Series
        </button>
        <span className={`${ui.txt2} text-xs`}>·</span>
        <span className={`text-xs font-semibold ${ui.txt1} truncate`}>{series.label}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 pt-2">
        <div className="space-y-0.5">
          {series.lessons.map((lesson, i) => {
            const isActive = i === activeLessonIdx
            return (
              <button
                key={lesson.slug}
                onClick={() => onSelect(i)}
                className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? `${ui.primaryBg} ${ui.primary}`
                    : `${ui.txt2} ${ui.hoverBg} ${ui.hoverTx}`
                }`}
              >
                <span className={`text-xs w-5 shrink-0 text-right mt-0.5 font-mono ${isActive ? ui.primary : ui.txt2}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 leading-snug">{lesson.title}</span>
                {isActive && <span className={`${ui.primary} text-xs shrink-0 mt-0.5`}>●</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Lesson content view ──────────────────────────────────────────────────────

function LessonView({ lesson, lessons, lessonIndex, seriesLabel, onBackToList, onSelectLesson, ui }) {
  const nextLesson = lessonIndex < lessons.length - 1 ? lessons[lessonIndex + 1] : null

  return (
    <div className="flex flex-col h-full">
      <div className={`px-4 py-3 border-b ${ui.border} flex items-center gap-2 flex-shrink-0`}>
        <button
          onClick={onBackToList}
          className={`text-xs ${ui.txt2} ${ui.hoverTx} transition-colors flex items-center gap-1`}
        >
          ← {seriesLabel}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5" style={{ userSelect: 'text', cursor: 'text' }}>
        <BlogPost content={lesson.content} />

        <div className={`mt-10 pt-6 border-t ${ui.border} flex items-center justify-between`}>
          <button
            onClick={onBackToList}
            className={`text-sm ${ui.txt2} ${ui.hoverTx} transition-colors`}
          >
            ← All lessons
          </button>
          {nextLesson && (
            <button
              onClick={() => onSelectLesson(lessonIndex + 1)}
              className={`flex items-center gap-1.5 text-sm font-semibold ${ui.primary} transition-colors`}
            >
              {nextLesson.title} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Root panel ───────────────────────────────────────────────────────────────

export default function LessonPanel({ milestoneIdx, onSelectMilestone, onBack, ui }) {
  // Restore navigation state from last session
  const saved = loadPanelState()

  const [view, setView]         = useState(saved.view     ?? 'series')
  const [seriesId, setSeriesId] = useState(saved.seriesId ?? null)
  const [lessonIdx, setLessonIdx] = useState(saved.lessonIdx ?? 0)
  const scrollRef = useRef(null)

  const activeSeries = SERIES.find(s => s.id === seriesId) ?? null
  const activeLesson = activeSeries?.lessons[lessonIdx] ?? null

  // Reset scroll on navigation
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [view, lessonIdx])

  function selectSeries(id) {
    setSeriesId(id)
    setLessonIdx(0)
    setView('list')
    savePanelState({ seriesId: id, lessonIdx: 0, view: 'list' })
  }

  function openLesson(idx) {
    setLessonIdx(idx)
    setView('content')
    savePanelState({ lessonIdx: idx, view: 'content', seriesId })
    // Sync code panel for the intro series (each lesson has its own starter files)
    if (seriesId === 'intro') onSelectMilestone(idx)
  }

  function backToList() {
    setView('list')
    savePanelState({ view: 'list', seriesId, lessonIdx })
  }

  function backToSeries() {
    setView('series')
    savePanelState({ view: 'series', seriesId, lessonIdx })
  }

  // For the intro series, the active-lesson highlight tracks milestoneIdx (the
  // code panel's authoritative state) so they never fall out of sync.
  const activeLessonHighlight = seriesId === 'intro' ? milestoneIdx : lessonIdx

  return (
    <div ref={scrollRef} className={`h-full overflow-y-auto ${ui.bg0} ${ui.txt1}`}>
      {view === 'series' && (
        <SeriesList onSelect={selectSeries} onBack={onBack} ui={ui} />
      )}

      {view === 'list' && activeSeries && (
        <LessonList
          series={activeSeries}
          activeLessonIdx={activeLessonHighlight}
          onSelect={openLesson}
          onBack={backToSeries}
          ui={ui}
        />
      )}

      {view === 'content' && activeLesson && activeSeries && (
        <LessonView
          lesson={activeLesson}
          lessons={activeSeries.lessons}
          lessonIndex={lessonIdx}
          seriesLabel={activeSeries.label}
          onBackToList={backToList}
          onSelectLesson={openLesson}
          ui={ui}
        />
      )}
    </div>
  )
}
