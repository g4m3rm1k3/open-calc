import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search, X, Dumbbell, Check } from 'lucide-react'
import ChallengeStep from '../engine/lesson/ChallengeStep'
import { executeCode } from '../engine/lesson/executor'
import type { TestResult } from '../engine/lesson/types'
import { getAvailablePracticeIds, getPracticeFile } from './loader'
import { useGlobalTheme } from '../context/ThemeContext.jsx'
import { useProgress } from '../hooks/useProgress.js'

interface Props {
  onClose: () => void
}

const LANG_LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  cpp: 'C++',
}

function langLabel(lang: string): string {
  const base = lang.replace(/-program$/, '')
  return LANG_LABELS[base] ?? base
}

// Practice's own shell, modeled on ConceptExplorerModal.tsx (searchable
// sidebar + main panel) but for a completely different kind of content —
// no Definition/Problem/CS/SE lens prose here, just a prompt, an editor, and
// real test results. Reuses ChallengeStep (the Lesson Engine's actual
// Monaco+test-runner+debugger) instead of building a second one — the exact
// same `assert ...`-line test format lessons already use, so grading a
// submission needed zero new code, only a place to browse challenges outside
// a specific lesson's sequence.
export default function PracticeExplorerModal({ onClose }: Props) {
  const { themeStyles } = useGlobalTheme() as any
  const ui = themeStyles.ui
  const { progress, markCheckpoint } = useProgress()

  const allIds = useMemo(() => getAvailablePracticeIds(), [])
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(allIds[0] ?? null)
  const [activeLevel, setActiveLevel] = useState(1)
  const [activeLang, setActiveLang] = useState<string | null>(null)
  const [results, setResults] = useState<TestResult[] | null>(null)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allIds
    return allIds.filter(id => id.toLowerCase().includes(q) || (getPracticeFile(id)?.title.toLowerCase().includes(q)))
  }, [allIds, query])

  const activeFile = activeId ? getPracticeFile(activeId) : null
  const activeChallenge = activeFile?.challenges.find(c => c.level === activeLevel) ?? null
  const activeVariant = activeChallenge?.variants.find(v => v.lang === activeLang) ?? activeChallenge?.variants[0] ?? null
  const progressKey = activeId ? `practice::${activeId}` : null
  const completedLevels: string[] = (progressKey ? progress[progressKey]?.completedCheckpoints : null) ?? []

  // Keep activeLang valid whenever the concept/level changes — fall back to the
  // first variant available at the new level instead of showing a blank panel.
  useEffect(() => {
    if (!activeChallenge) return
    if (!activeChallenge.variants.some(v => v.lang === activeLang)) {
      setActiveLang(activeChallenge.variants[0]?.lang ?? null)
    }
  }, [activeChallenge, activeLang])

  function selectConcept(id: string) {
    setActiveId(id)
    setActiveLevel(getPracticeFile(id)?.challenges[0]?.level ?? 1)
    setResults(null)
  }

  function selectLevel(level: number) {
    setActiveLevel(level)
    setResults(null)
  }

  function selectLang(lang: string) {
    setActiveLang(lang)
    setResults(null)
  }

  function handleResults(r: TestResult[]) {
    setResults(r)
    if (progressKey && r.length > 0 && r.every(x => x.passed)) {
      markCheckpoint(progressKey, `level-${activeLevel}`)
    }
  }

  const step = activeChallenge && activeVariant ? {
    id: `${activeId}-L${activeChallenge.level}-${activeVariant.lang}`,
    title: '',
    prose: '',
    examples: [],
    challenge: { lang: activeVariant.lang, code: activeVariant.starter ?? '' },
    tests: activeVariant.tests,
  } : null

  const passed = results?.filter(r => r.passed).length ?? 0
  const total = results?.length ?? 0

  return createPortal(
    <div
      className="fixed inset-0 z-[9997] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 dark:bg-[#030408]/80 backdrop-blur-md"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`relative w-full max-w-6xl h-[85vh] rounded-[20px] shadow-2xl flex flex-col overflow-hidden ${ui.bg0} border ${ui.border}`}>

        {/* Header */}
        <header className={`shrink-0 flex items-center justify-between gap-6 px-6 h-16 border-b ${ui.border} ${ui.bg1}`}>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <Dumbbell className="w-4.5 h-4.5 text-white" />
            </div>
            <h1 className={`text-lg font-extrabold ${ui.txt1} hidden sm:block`}>Practice</h1>
          </div>

          <div className="flex-1 max-w-xl relative">
            <Search className={`w-4 h-4 ${ui.txt2} absolute left-3 top-1/2 -translate-y-1/2`} />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search topics..."
              className={`w-full pl-9 pr-3 py-2 rounded-full text-sm ${ui.bg0} ${ui.txt1} border ${ui.border} focus:outline-none`}
            />
          </div>

          <button onClick={onClose} className={`p-2 rounded-full ${ui.txt2} ${ui.hoverBg} ${ui.hoverTx}`}>
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 flex min-h-0">
          {/* Sidebar */}
          <div className={`w-64 shrink-0 border-r ${ui.border} overflow-y-auto p-3 flex flex-col gap-1`}>
            {matches.map(id => {
              const file = getPracticeFile(id)
              const name = file?.title ?? id
              const done = ((progress[`practice::${id}`]?.completedCheckpoints as string[]) ?? []).length
              const total = file?.challenges.length ?? 0
              const isActive = id === activeId
              return (
                <button
                  key={id}
                  data-testid={`practice-concept-${id}`}
                  onClick={() => selectConcept(id)}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between gap-2 ${
                    isActive ? `${ui.bg1} ${ui.txt1} font-semibold` : `${ui.txt2} ${ui.hoverBg} ${ui.hoverTx}`
                  }`}
                >
                  <span className="truncate">{name}</span>
                  <span className={`text-[10px] shrink-0 ${done === total && total > 0 ? 'text-emerald-500' : ui.txt2}`}>{done}/{total}</span>
                </button>
              )
            })}
            {matches.length === 0 && (
              <p className={`text-xs ${ui.txt2} text-center py-8`}>No matches found</p>
            )}
          </div>

          {/* Main panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeFile && activeChallenge && activeVariant && step ? (
              <>
                {/* Level tabs */}
                <div className={`flex items-center gap-2 px-5 py-3 border-b ${ui.border} shrink-0`}>
                  {activeFile.challenges.map(c => {
                    const done = completedLevels.includes(`level-${c.level}`)
                    const isActive = c.level === activeLevel
                    return (
                      <button
                        key={c.level}
                        data-testid={`practice-level-${c.level}`}
                        onClick={() => selectLevel(c.level)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                          isActive ? `${ui.primaryBg} ${ui.primary}` : `${ui.txt2} ${ui.hoverBg}`
                        }`}
                      >
                        {done && <Check className="w-3 h-3 text-emerald-500" />}
                        Level {c.level}
                      </button>
                    )
                  })}
                </div>

                {/* Language tabs */}
                {activeChallenge.variants.length > 1 && (
                  <div className={`flex items-center gap-1.5 px-5 py-2 border-b ${ui.border} shrink-0 overflow-x-auto`}>
                    {activeChallenge.variants.map(v => (
                      <button
                        key={v.lang}
                        data-testid={`practice-lang-${v.lang}`}
                        onClick={() => selectLang(v.lang)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors shrink-0 ${
                          v.lang === activeVariant.lang ? `${ui.bg1} ${ui.txt1}` : `${ui.txt2} ${ui.hoverBg}`
                        }`}
                      >
                        {langLabel(v.lang)}
                      </button>
                    ))}
                  </div>
                )}

                {/* Prompt */}
                <div className={`px-5 py-3 text-sm ${ui.txt1} border-b ${ui.border} shrink-0`}>
                  {activeVariant.prompt}
                </div>

                {/* Editor */}
                <div className="flex-1 min-h-0">
                  <ChallengeStep
                    key={step.id}
                    step={step as any}
                    executor={executeCode}
                    ui={ui}
                    onTrace={() => {}}
                    onResults={handleResults}
                  />
                </div>

                {/* Results */}
                {results && results.length > 0 && (
                  <div className={`shrink-0 max-h-40 overflow-y-auto border-t ${ui.border} px-5 py-3`}>
                    <div className={`text-xs font-bold mb-2 ${passed === total ? 'text-emerald-500' : ui.txt2}`}>
                      {passed} / {total} passing
                    </div>
                    <div className="flex flex-col gap-1">
                      {results.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className={`shrink-0 mt-0.5 ${r.passed ? 'text-emerald-500' : 'text-red-500'}`}>{r.passed ? '✓' : '✗'}</span>
                          <span className={`font-mono ${ui.txt2}`}>{r.label}{r.detail ? ` — ${r.detail}` : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={`flex-1 flex items-center justify-center ${ui.txt2} text-sm`}>
                Choose a topic from the sidebar.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
