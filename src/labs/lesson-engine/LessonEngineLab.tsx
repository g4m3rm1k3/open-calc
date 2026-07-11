import { useState } from 'react'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import { parseLesson } from '../../engine/lesson/parser'
import { executeCode } from '../../engine/lesson/executor'
import LessonView from '../../engine/lesson/LessonView'
import { SERIES } from './series'
import type { SeriesMeta } from './series'
import type { ParsedLesson } from '../../engine/lesson/types'

// Vite ?raw imports for all lesson markdown files
import pfLevel0  from './content/python-fundamentals/level-0.md?raw'
import pfLevel1  from './content/python-fundamentals/level-1.md?raw'
import pfLevel2  from './content/python-fundamentals/level-2.md?raw'
import pfLevel3  from './content/python-fundamentals/level-3.md?raw'

import dsaLevel0  from './content/dsa-python/level-0.md?raw'
import dsaLevel1  from './content/dsa-python/level-1.md?raw'
import dsaLevel2  from './content/dsa-python/level-2.md?raw'
import dsaLevel3  from './content/dsa-python/level-3.md?raw'
import dsaLevel4  from './content/dsa-python/level-4.md?raw'
import dsaLevel5  from './content/dsa-python/level-5.md?raw'
import dsaLevel6  from './content/dsa-python/level-6.md?raw'
import dsaLevel7  from './content/dsa-python/level-7.md?raw'
import dsaLevel8  from './content/dsa-python/level-8.md?raw'
import dsaLevel9  from './content/dsa-python/level-9.md?raw'
import dsaLevel10 from './content/dsa-python/level-10.md?raw'

const LESSON_FILES: Record<string, string> = {
  'python-fundamentals/level-0.md': pfLevel0,
  'python-fundamentals/level-1.md': pfLevel1,
  'python-fundamentals/level-2.md': pfLevel2,
  'python-fundamentals/level-3.md': pfLevel3,
  'dsa-python/level-0.md':  dsaLevel0,
  'dsa-python/level-1.md':  dsaLevel1,
  'dsa-python/level-2.md':  dsaLevel2,
  'dsa-python/level-3.md':  dsaLevel3,
  'dsa-python/level-4.md':  dsaLevel4,
  'dsa-python/level-5.md':  dsaLevel5,
  'dsa-python/level-6.md':  dsaLevel6,
  'dsa-python/level-7.md':  dsaLevel7,
  'dsa-python/level-8.md':  dsaLevel8,
  'dsa-python/level-9.md':  dsaLevel9,
  'dsa-python/level-10.md': dsaLevel10,
}

interface Props {
  onBack?: () => void
}

type View =
  | { kind: 'series-list' }
  | { kind: 'level-list'; series: SeriesMeta }
  | { kind: 'lesson'; lesson: ParsedLesson; series: SeriesMeta }

const PROGRESS_KEY = 'oc-lesson-progress'

export default function LessonEngineLab({ onBack }: Props) {
  const { themeStyles, studioTheme } = useGlobalTheme()
  const ui = (themeStyles as any).ui

  const [view, setView] = useState<View>({ kind: 'series-list' })

  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY)
      return new Set(raw ? JSON.parse(raw) : [])
    } catch { return new Set() }
  })

  function markComplete(seriesId: string, level: number) {
    const key = `${seriesId}:${level}`
    setCompleted(prev => {
      const next = new Set(prev)
      next.add(key)
      try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...next])) } catch {}
      return next
    })
  }

  function openLesson(file: string, series: SeriesMeta) {
    const raw = LESSON_FILES[file]
    if (!raw) return
    setView({ kind: 'lesson', lesson: parseLesson(raw), series })
  }

  return (
    <div
      className={`w-full h-screen flex flex-col overflow-hidden ${ui.bg0} ${ui.txt1}`}
    >
      {view.kind === 'series-list' && (
        <SeriesListView ui={ui} onBack={onBack} onSelectSeries={s => setView({ kind: 'level-list', series: s })} />
      )}
      {view.kind === 'level-list' && (
        <LevelListView ui={ui} series={view.series} completed={completed} available={LESSON_FILES} onBack={() => setView({ kind: 'series-list' })} onSelectLevel={file => openLesson(file, view.series)} />
      )}
      {view.kind === 'lesson' && (() => {
        const currentIdx = view.series.levels.findIndex(l => l.level === view.lesson.level)
        const nextLevel = view.series.levels[currentIdx + 1]
        return (
          <LessonView
            lesson={view.lesson}
            executor={executeCode}
            ui={ui}
            seriesLabel={view.series.label}
            onBack={() => setView({ kind: 'level-list', series: view.series })}
            onComplete={() => {
              markComplete(view.series.id, view.lesson.level)
              if (nextLevel) openLesson(nextLevel.file, view.series)
              else setView({ kind: 'level-list', series: view.series })
            }}
          />
        )
      })()}
    </div>
  )
}

// ── Series list ───────────────────────────────────────────────────────────────

function SeriesListView({ ui, onBack, onSelectSeries }: {
  ui: any
  onBack?: () => void
  onSelectSeries: (s: SeriesMeta) => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 px-4 py-2.5 border-b ${ui.border} ${ui.bg1} shrink-0`}>
        {onBack && (
          <button type="button" onClick={onBack} className={`text-sm ${ui.txt2} ${ui.hoverTx} bg-transparent border-none cursor-pointer`}>
            ← Labs
          </button>
        )}
        <span className={`text-sm font-bold ${ui.txt1}`}>Learn to Code</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className={`text-2xl font-bold mb-1 ${ui.txt1}`}>Choose a series</h1>
        <p className={`text-sm mb-6 ${ui.txt2}`}>Write real code. Run it against real tests. See what's happening inside.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERIES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectSeries(s)}
              className={`text-left p-5 rounded-2xl border ${ui.border} ${ui.bg1} ${ui.hoverBg} transition-all cursor-pointer`}
            >
              <div className="text-3xl mb-3">{s.emoji}</div>
              <div className={`font-semibold text-base mb-1 ${ui.txt1}`}>{s.label}</div>
              <div className={`text-xs mb-3 ${ui.txt2}`}>{s.description}</div>
              <div className={`text-xs font-semibold uppercase tracking-wide ${ui.txt2}`}>
                {s.levels.length} {s.levels.length === 1 ? 'level' : 'levels'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Level list ────────────────────────────────────────────────────────────────

function LevelListView({ ui, series, completed, available, onBack, onSelectLevel }: {
  ui: any
  series: SeriesMeta
  completed: Set<string>
  available: Record<string, string>
  onBack: () => void
  onSelectLevel: (file: string) => void
}) {
  const doneCount = series.levels.filter(l => completed.has(`${series.id}:${l.level}`)).length
  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 px-4 py-2.5 border-b ${ui.border} ${ui.bg1} shrink-0`}>
        <button type="button" onClick={onBack} className={`text-sm ${ui.txt2} ${ui.hoverTx} bg-transparent border-none cursor-pointer`}>
          ← Series
        </button>
        <span className={`text-sm font-bold ${ui.txt1}`}>{series.label}</span>
        {doneCount > 0 && (
          <span className="ml-auto text-xs font-semibold text-emerald-400">{doneCount} / {series.levels.length} complete</span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-4xl mb-3">{series.emoji}</div>
        <h1 className={`text-2xl font-bold mb-1 ${ui.txt1}`}>{series.label}</h1>
        <p className={`text-sm mb-6 ${ui.txt2}`}>{series.description}</p>
        <div className="flex flex-col gap-2">
          {series.levels.map(lvl => {
            const isDone = completed.has(`${series.id}:${lvl.level}`)
            const isReady = !!available[lvl.file]
            return (
              <button
                key={lvl.level}
                type="button"
                onClick={() => isReady && onSelectLevel(lvl.file)}
                disabled={!isReady}
                className={`text-left px-5 py-4 rounded-xl border transition-all flex items-center gap-4
                  ${!isReady ? `opacity-40 cursor-not-allowed ${ui.border} ${ui.bg1}` :
                    isDone  ? 'cursor-pointer border-emerald-500/40 bg-emerald-500/5' :
                              `cursor-pointer ${ui.border} ${ui.bg1} ${ui.hoverBg}`}`}
              >
                <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded
                  ${isDone ? 'bg-emerald-500/20 text-emerald-400' : `${ui.bg2} ${ui.txt2}`}`}>
                  Level {lvl.level}
                </span>
                <span className={`font-medium ${ui.txt1}`}>{lvl.title}</span>
                {!isReady
                  ? <span className={`ml-auto text-xs ${ui.txt2}`}>Coming soon</span>
                  : isDone
                    ? <span className="ml-auto text-emerald-400 text-base font-bold">✓</span>
                    : <span className={`ml-auto text-lg ${ui.txt2}`}>→</span>
                }
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
