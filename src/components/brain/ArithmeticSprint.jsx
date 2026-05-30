/**
 * ArithmeticSprint — Processing speed & numerical fluency.
 *
 * Research basis: Dehaene (1992) Cognition — the "number sense" and mental
 * arithmetic as a window into numerical processing speed and automaticity.
 * Timed mixed-operation mental arithmetic builds automatic number sense,
 * reducing the cognitive load of everyday quantitative reasoning.
 *
 * Mechanics:
 *   - Mixed arithmetic problems (+ − × ÷) appear one at a time
 *   - User types answer with keyboard or on-screen numpad, then confirms
 *   - Correct/wrong feedback shown for 650 ms before next problem
 *   - Accuracy and reaction time tracked per block
 *   - Adaptive difficulty: bigger numbers and harder operations
 *
 * localStorage key: oc-brain-arithmetic
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Hash, Play, Square, RotateCcw, Trophy, TrendingUp, Info, X, Delete } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────
const STORE_KEY   = 'oc-brain-arithmetic'
const FEEDBACK_MS = 700
const BLOCK_LENGTHS = [15, 20]

const DIFFICULTY_LEVELS = [
  { label: 'Easy',   ops: ['+', '-'], maxA: 20, maxB: 20,  mulMax: 0, divMax: 0  },
  { label: 'Medium', ops: ['+', '-', '×'], maxA: 50, maxB: 20,  mulMax: 10, divMax: 0  },
  { label: 'Hard',   ops: ['+', '-', '×', '÷'], maxA: 99, maxB: 25, mulMax: 12, divMax: 12 },
]

// ─── Problem generation ───────────────────────────────────────────────────────
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateProblem(diffIdx) {
  const { ops, maxA, maxB, mulMax, divMax } = DIFFICULTY_LEVELS[diffIdx]
  const op = ops[Math.floor(Math.random() * ops.length)]

  let a, b, answer

  if (op === '+') {
    a = randInt(1, maxA); b = randInt(1, maxB)
    answer = a + b
  } else if (op === '-') {
    a = randInt(1, maxA); b = randInt(1, Math.min(a, maxB))
    answer = a - b
  } else if (op === '×') {
    a = randInt(2, mulMax); b = randInt(2, mulMax)
    answer = a * b
  } else { // ÷
    b = randInt(2, divMax)
    answer = randInt(2, divMax)
    a = b * answer
  }

  return { a, b, op, answer, display: `${a} ${op} ${b}` }
}

// ─── Persistence ──────────────────────────────────────────────────────────────
function loadStats() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) ?? { sessions: [], bestAcc: 0, fastestRt: 0 } }
  catch { return { sessions: [], bestAcc: 0, fastestRt: 0 } }
}
function saveStats(s) { localStorage.setItem(STORE_KEY, JSON.stringify(s)) }

function scoreBlock(history) {
  const correct = history.filter(t => t.correct).length
  const acc     = correct / history.length
  const rtArr   = history.filter(t => t.correct && t.rt > 0).map(t => t.rt)
  const avgRt   = rtArr.length ? Math.round(rtArr.reduce((a, b) => a + b, 0) / rtArr.length) : 0
  const fastest = rtArr.length ? Math.min(...rtArr) : 0
  return { correct, total: history.length, acc, avgRt, fastest }
}

// ─── SessionChart ─────────────────────────────────────────────────────────────
function SessionChart({ sessions }) {
  if (!sessions.length) return null
  const last = sessions.slice(-10)
  return (
    <div className="mt-4">
      <p className="text-xs text-slate-400 mb-2">Accuracy over last {last.length} sessions</p>
      <div className="flex items-end gap-1 h-12">
        {last.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full rounded-t bg-amber-400 dark:bg-amber-500"
              style={{ height: `${Math.max(6, (s.acc ?? 0.5) * 48)}px` }}
              title={`${Math.round((s.acc ?? 0) * 100)}%`} />
            <span className="text-[9px] text-slate-400 font-mono">{Math.round((s.acc ?? 0) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tutorial ─────────────────────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    title: 'A math problem appears — solve it fast',
    body: 'An arithmetic problem is shown: addition, subtraction, multiplication, or division. Type your answer and press Enter. The clock starts when the problem appears.',
    visual: () => (
      <div className="space-y-4">
        <div className="rounded-2xl bg-slate-900 p-6 text-center">
          <p className="text-4xl font-black text-amber-400 tracking-wide">47 + 36</p>
        </div>
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-center">
          <p className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-200">83</p>
          <p className="text-xs text-slate-400 mt-1">Type the answer, then press Enter</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Use your keyboard or the numpad',
    body: 'Type digits with the keyboard (0–9). Press Enter or ↵ to submit. Backspace deletes the last digit. The on-screen numpad works the same way for touchscreens.',
    visual: () => (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 max-w-[160px] mx-auto">
          {['7','8','9','4','5','6','1','2','3','-','0','⌫'].map(k => (
            <div key={k} className={`py-2 rounded-xl text-center font-bold text-sm border ${k === '⌫' ? 'border-rose-200 dark:border-rose-800 text-rose-500 bg-rose-50 dark:bg-rose-950/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
              {k}
            </div>
          ))}
        </div>
        <div className="flex gap-2 max-w-[160px] mx-auto">
          <div className="flex-1 py-2 rounded-xl text-center font-bold text-sm border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30">
            Enter ↵
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Feedback appears immediately',
    body: 'After submitting: green means correct, red shows the right answer. A brief pause then the next problem appears. Wrong answers don\'t count against your time — just accuracy.',
    visual: () => (
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-center space-y-1">
          <p className="text-2xl">✓</p>
          <p className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">Correct!</p>
          <p className="text-xs text-slate-400">+1 to score</p>
        </div>
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-3 text-center space-y-1">
          <p className="text-2xl">✗</p>
          <p className="font-bold text-rose-600 text-sm">Wrong</p>
          <p className="text-xs text-slate-400">Answer shown</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Operations scale with difficulty',
    body: 'Easy: small additions and subtractions. Medium adds times-tables. Hard adds larger numbers and division. Difficulty is auto-suggested after each block based on your accuracy.',
    visual: () => (
      <div className="space-y-3">
        {DIFFICULTY_LEVELS.map((d, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5">
            <span className="w-16 text-sm font-semibold text-slate-700 dark:text-slate-300">{d.label}</span>
            <div className="flex gap-1.5 flex-wrap">
              {d.ops.map(op => (
                <span key={op} className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-700">
                  {op}
                </span>
              ))}
            </div>
            <span className="text-xs text-slate-400 ml-auto">up to {d.maxA}</span>
          </div>
        ))}
      </div>
    ),
  },
]

function InfoModal({ onClose }) {
  const [step, setStep] = useState(0)
  const current = TUTORIAL_STEPS[step]
  const isLast  = step === TUTORIAL_STEPS.length - 1
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">How to play</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 px-5 pb-3">
          {TUTORIAL_STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`rounded-full transition-all ${i === step ? 'w-5 h-2 bg-amber-500' : 'w-2 h-2 bg-slate-200 dark:bg-slate-700 hover:bg-amber-300'}`} />
          ))}
          <span className="ml-auto text-xs text-slate-400">{step + 1} / {TUTORIAL_STEPS.length}</span>
        </div>
        <div className="px-5 pb-5 space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">{current.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{current.body}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4">
            <current.visual />
          </div>
          <div className="flex items-center gap-2 pt-1">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                ← Back
              </button>
            )}
            <button onClick={isLast ? onClose : () => setStep(s => s + 1)}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors">
              {isLast ? "Got it — let's calculate! 🔢" : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Numpad ───────────────────────────────────────────────────────────────────
function Numpad({ onDigit, onDelete, onSubmit, disabled }) {
  const keys = [['7','8','9'],['4','5','6'],['1','2','3'],['-','0','⌫']]
  return (
    <div className="space-y-2">
      {keys.map((row, ri) => (
        <div key={ri} className="grid grid-cols-3 gap-2">
          {row.map(k => (
            <button key={k} disabled={disabled}
              onClick={() => k === '⌫' ? onDelete() : onDigit(k)}
              className={`py-3 rounded-xl font-bold text-base transition-all active:scale-95 disabled:opacity-50
                ${k === '⌫'
                  ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/50'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              {k === '⌫' ? <Delete className="w-4 h-4 mx-auto" /> : k}
            </button>
          ))}
        </div>
      ))}
      <button onClick={onSubmit} disabled={disabled}
        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
        Submit ↵
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ArithmeticSprint() {
  const [diffIdx,     setDiffIdx]     = useState(0)
  const [blockLen,    setBlockLen]    = useState(15)
  const [phase,       setPhase]       = useState('idle')
  const [problem,     setProblem]     = useState(null)
  const [trialIdx,    setTrialIdx]    = useState(0)
  const [input,       setInput]       = useState('')
  const [feedback,    setFeedback]    = useState(null)   // null | 'correct' | 'wrong'
  const [blockResult, setBlockResult] = useState(null)
  const [suggestDiff, setSuggestDiff] = useState(null)
  const [stats,       setStats]       = useState(loadStats)
  const [showInfo,    setShowInfo]    = useState(() => (loadStats().sessions?.length ?? 0) === 0)
  const timerRef      = useRef(null)
  const trialStartRef = useRef(null)
  const problemRef    = useRef(null)
  const historyRef    = useRef([])
  const trialIdxRef   = useRef(0)

  const advanceToTrial = useCallback((newHistory, nextIdx, dIdx, bLen) => {
    if (nextIdx >= bLen) {
      const score = scoreBlock(newHistory)
      const saved = loadStats()
      saved.sessions = [...(saved.sessions ?? []), { ...score, date: new Date().toISOString() }]
      if (score.acc > (saved.bestAcc ?? 0)) saved.bestAcc = score.acc
      if (!saved.fastestRt || (score.fastest > 0 && score.fastest < saved.fastestRt)) saved.fastestRt = score.fastest
      saveStats(saved)
      setStats(saved)
      let next = dIdx
      if (score.acc >= 0.90 && dIdx < DIFFICULTY_LEVELS.length - 1) next = dIdx + 1
      else if (score.acc <= 0.55 && dIdx > 0) next = dIdx - 1
      setSuggestDiff(next !== dIdx ? next : null)
      setBlockResult(score)
      setPhase('result')
      return
    }
    const p = generateProblem(dIdx)
    problemRef.current  = p
    historyRef.current  = newHistory
    trialIdxRef.current = nextIdx
    setProblem(p)
    setTrialIdx(nextIdx)
    setInput('')
    setFeedback(null)
    trialStartRef.current = Date.now()
  }, [])

  const handleSubmit = useCallback(() => {
    if (feedback !== null || !problemRef.current || input === '' || input === '-') return
    const p       = problemRef.current
    const userAns = parseInt(input, 10)
    if (isNaN(userAns)) return
    const rt      = Date.now() - trialStartRef.current
    const correct = userAns === p.answer
    const recorded = { ...p, userAnswer: userAns, correct, rt }
    setFeedback(correct ? 'correct' : 'wrong')

    timerRef.current = setTimeout(() => {
      const newHistory = [...historyRef.current, recorded]
      advanceToTrial(newHistory, trialIdxRef.current + 1, diffIdx, blockLen)
    }, FEEDBACK_MS)
  }, [feedback, input, diffIdx, blockLen, advanceToTrial])

  const handleDigit = useCallback((d) => {
    if (feedback !== null) return
    setInput(prev => {
      if (d === '-') return prev === '' ? '-' : prev
      return prev.length < 6 ? prev + d : prev
    })
  }, [feedback])

  const handleDelete = useCallback(() => {
    if (feedback !== null) return
    setInput(prev => prev.slice(0, -1))
  }, [feedback])

  // Keyboard
  useEffect(() => {
    if (phase !== 'playing') return
    const handler = (e) => {
      if (e.key === 'Enter')     { e.preventDefault(); handleSubmit() }
      if (e.key === 'Backspace') { handleDelete() }
      if (/^[0-9]$/.test(e.key)) { handleDigit(e.key) }
      if (e.key === '-')         { handleDigit('-') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, handleSubmit, handleDelete, handleDigit])

  const startBlock = () => {
    clearTimeout(timerRef.current)
    historyRef.current  = []
    trialIdxRef.current = 0
    setBlockResult(null)
    setSuggestDiff(null)
    setFeedback(null)
    setInput('')
    setPhase('playing')
    advanceToTrial([], 0, diffIdx, blockLen)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const progress = phase === 'playing' ? Math.round((trialIdx / blockLen) * 100) : 0

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-6 h-6 text-amber-500" />
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-200 text-lg leading-none">Arithmetic Sprint</h2>
            <p className="text-xs text-slate-400 mt-0.5">Processing speed · Numerical fluency</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stats.sessions?.length > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-600 dark:text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
              Best: {Math.round((stats.bestAcc ?? 0) * 100)}%
            </div>
          )}
          <button onClick={() => setShowInfo(true)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings */}
      {phase === 'idle' && (
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Difficulty</p>
              <p className="text-xs text-slate-400">Operations and number size</p>
            </div>
            <div className="flex gap-1.5">
              {DIFFICULTY_LEVELS.map((d, i) => (
                <button key={i} onClick={() => setDiffIdx(i)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${i === diffIdx ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Problems per block</p>
            <div className="flex gap-1.5">
              {BLOCK_LENGTHS.map(l => (
                <button key={l} onClick={() => setBlockLen(l)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${l === blockLen ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <button onClick={startBlock}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors">
            <Play className="w-4 h-4" /> Start ({blockLen} problems · {DIFFICULTY_LEVELS[diffIdx].label})
          </button>
          <SessionChart sessions={stats.sessions ?? []} />
        </div>
      )}

      {/* Playing */}
      {phase === 'playing' && problem && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-slate-400 shrink-0">{trialIdx + 1}/{blockLen}</span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-700">
              {DIFFICULTY_LEVELS[diffIdx].label}
            </span>
          </div>

          {/* Problem display */}
          <div className={`rounded-2xl border-2 p-5 text-center transition-all ${
            feedback === 'correct' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400'
            : feedback === 'wrong' ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-400'
            : 'bg-slate-900 border-slate-700'
          }`}>
            <p className={`text-4xl font-black tracking-wide ${feedback === null ? 'text-amber-400' : feedback === 'correct' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
              {problem.display}
            </p>
          </div>

          {/* Answer display */}
          <div className={`rounded-2xl border-2 p-4 text-center min-h-[60px] flex items-center justify-center transition-all ${
            feedback === 'correct' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400'
            : feedback === 'wrong' ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-400'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}>
            {feedback === null ? (
              <p className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-200">
                {input || <span className="text-slate-300 dark:text-slate-600">?</span>}
              </p>
            ) : feedback === 'correct' ? (
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">✓ {input}</p>
            ) : (
              <div>
                <p className="text-lg font-bold text-rose-500 line-through">{input}</p>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{problem.answer}</p>
              </div>
            )}
          </div>

          {/* Numpad */}
          <Numpad
            onDigit={handleDigit}
            onDelete={handleDelete}
            onSubmit={handleSubmit}
            disabled={feedback !== null} />

          <button onClick={() => { clearTimeout(timerRef.current); setPhase('idle') }}
            className="w-full py-2 rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex items-center justify-center gap-1.5">
            <Square className="w-3.5 h-3.5" /> Stop session
          </button>
        </div>
      )}

      {/* Result */}
      {phase === 'result' && blockResult && (
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Block complete</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-center">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">Accuracy</p>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{Math.round(blockResult.acc * 100)}%</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 p-3 text-center">
              <p className="text-xs text-slate-500 font-semibold mb-1">Avg RT</p>
              <p className="text-2xl font-black text-slate-700 dark:text-slate-300">
                {blockResult.avgRt > 0 ? `${(blockResult.avgRt / 1000).toFixed(1)}s` : '—'}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 p-3 text-center">
              <p className="text-xs text-slate-500 font-semibold mb-1">Fastest</p>
              <p className="text-2xl font-black text-slate-700 dark:text-slate-300">
                {blockResult.fastest > 0 ? `${(blockResult.fastest / 1000).toFixed(1)}s` : '—'}
              </p>
            </div>
          </div>

          {/* Score bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Correct</span>
              <span className="font-mono font-semibold">{blockResult.correct}/{blockResult.total}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${blockResult.acc * 100}%` }} />
            </div>
          </div>

          {suggestDiff !== null && (
            <div className={`rounded-xl p-3 flex items-center justify-between text-sm border ${
              suggestDiff > diffIdx
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
            }`}>
              <span className={suggestDiff > diffIdx ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}>
                {suggestDiff > diffIdx ? '↑ Ready for ' : '↓ Try '}{DIFFICULTY_LEVELS[suggestDiff].label}?
              </span>
              <button onClick={() => { setDiffIdx(suggestDiff); setSuggestDiff(null); setPhase('idle') }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  suggestDiff > diffIdx ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}>
                Switch
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button onClick={startBlock}
              className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-1.5">
              <Play className="w-4 h-4" /> Play again
            </button>
            <button onClick={() => { setPhase('idle'); setBlockResult(null) }}
              className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-1.5">
              <RotateCcw className="w-4 h-4" /> Settings
            </button>
          </div>
          <SessionChart sessions={stats.sessions ?? []} />
        </div>
      )}
    </div>
  )
}
