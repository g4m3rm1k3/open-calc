/**
 * MentalRotation — Spatial reasoning & visuospatial working memory.
 *
 * Research basis: Shepard & Metzler (1971) Science.
 * Judge whether two 2-D polyomino shapes are the same object at different
 * orientations (rotated) or mirror images (flipped).  Builds spatial working
 * memory and correlates strongly with STEM performance.
 *
 * Mechanics:
 *   - Reference shape: one orientation of a chosen polyomino
 *   - Comparison shape: same shape at a different rotation (Same),
 *                       or the mirror image at a different rotation (Mirror)
 *   - User presses [Same] or [Mirror]
 *   - 5 chiral shape pairs (none can be rotated to match their own mirror)
 *   - Adaptive difficulty: more shape pairs as accuracy rises
 *   - Per-trial feedback + RT tracking
 *
 * localStorage key: oc-brain-mental-rotation
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { RotateCcw, Play, Square, Trophy, TrendingUp, Info, X, CheckCircle2, XCircle } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────
const STORE_KEY   = 'oc-brain-mental-rotation'
const FEEDBACK_MS = 700
const BLOCK_LENGTHS = [16, 24]

// ─── Shape definitions ────────────────────────────────────────────────────────
// Each shape is an array of [row, col] cells, normalized to min_r=0, min_c=0.
// Every pair is chiral — no rotation of base equals the mirror.
const SHAPE_PAIRS = [
  // Pair 1: L-tetromino / J-tetromino
  { base: [[0,0],[1,0],[2,0],[2,1]], mirror: [[0,1],[1,1],[2,0],[2,1]] },
  // Pair 2: Long-L pentomino / Long-J pentomino
  { base: [[0,0],[1,0],[2,0],[3,0],[3,1]], mirror: [[0,1],[1,1],[2,1],[3,0],[3,1]] },
  // Pair 3: N-pentomino / mirror-N
  { base: [[0,1],[1,0],[1,1],[2,0],[3,0]], mirror: [[0,0],[1,0],[1,1],[2,1],[3,1]] },
  // Pair 4: F-pentomino / mirror-F
  { base: [[0,1],[0,2],[1,0],[1,1],[2,1]], mirror: [[0,0],[0,1],[1,1],[1,2],[2,1]] },
  // Pair 5: Y-pentomino / mirror-Y
  { base: [[0,0],[1,0],[1,1],[2,0],[3,0]], mirror: [[0,1],[1,0],[1,1],[2,1],[3,1]] },
]

const DIFFICULTY_LEVELS = [
  { label: 'Easy',   numPairs: 2, label2: '2 shapes' },
  { label: 'Medium', numPairs: 3, label2: '3 shapes' },
  { label: 'Hard',   numPairs: 5, label2: '5 shapes' },
]

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]

// ─── Shape transforms ─────────────────────────────────────────────────────────
function rotateCW(cells) {
  const rotated = cells.map(([r, c]) => [c, -r])
  const minR = Math.min(...rotated.map(([r]) => r))
  const minC = Math.min(...rotated.map(([, c]) => c))
  return rotated.map(([r, c]) => [r - minR, c - minC])
}

function rotate(cells, n) {
  let result = cells.map(c => [...c])
  for (let i = 0; i < (((n % 4) + 4) % 4); i++) result = rotateCW(result)
  return result
}

function generateTrial(diffIdx) {
  const numPairs = DIFFICULTY_LEVELS[diffIdx].numPairs
  const pair = SHAPE_PAIRS[Math.floor(Math.random() * numPairs)]
  // Always use a different rotation for comparison so it can't be trivially identical
  const refRot  = Math.floor(Math.random() * 4)
  const compRot = (refRot + 1 + Math.floor(Math.random() * 3)) % 4  // guaranteed ≠ refRot
  const isMirror = Math.random() < 0.5
  return {
    reference:  rotate(pair.base, refRot),
    comparison: rotate(isMirror ? pair.mirror : pair.base, compRot),
    isMirror,
  }
}

// ─── Persistence ──────────────────────────────────────────────────────────────
function loadStats() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) ?? { sessions: [], bestAcc: 0 } }
  catch { return { sessions: [], bestAcc: 0 } }
}
function saveStats(s) { localStorage.setItem(STORE_KEY, JSON.stringify(s)) }

function scoreBlock(history) {
  const correct = history.filter(t => t.correct).length
  const acc     = correct / history.length
  const rtArr   = history.filter(t => t.correct && t.rt > 0).map(t => t.rt)
  const avgRt   = rtArr.length ? Math.round(rtArr.reduce((a, b) => a + b, 0) / rtArr.length) : 0
  return { correct, total: history.length, acc, avgRt }
}

// ─── ShapeGrid ────────────────────────────────────────────────────────────────
function ShapeGrid({ cells, color = '#818cf8', size = 5 }) {
  const cellSet = new Set(cells.map(([r, c]) => `${r},${c}`))
  const cellPx  = 22
  const gapPx   = 3
  return (
    <div
      className="rounded-xl bg-slate-900 p-2 inline-grid shrink-0"
      style={{
        gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
        gap: `${gapPx}px`,
      }}>
      {Array.from({ length: size * size }, (_, i) => {
        const r = Math.floor(i / size)
        const c = i % size
        const active = cellSet.has(`${r},${c}`)
        return (
          <div key={i} className="rounded-sm transition-colors"
            style={{ width: cellPx, height: cellPx, background: active ? color : '#1e293b' }} />
        )
      })}
    </div>
  )
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
            <div className="w-full rounded-t bg-sky-400 dark:bg-sky-500"
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
    title: 'You see two shapes side by side',
    body: 'Each round shows two block shapes. One is the REFERENCE (left). The other is either the same shape rotated, or its mirror image. Your job: tell them apart.',
    visual: () => (
      <div className="flex items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <ShapeGrid cells={[[0,0],[1,0],[2,0],[2,1]]} color="#818cf8" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Reference</p>
        </div>
        <p className="text-2xl text-slate-400">vs</p>
        <div className="flex flex-col items-center gap-2">
          <ShapeGrid cells={rotate([[0,0],[1,0],[2,0],[2,1]], 2)} color="#38bdf8" />
          <p className="text-xs font-semibold text-sky-500">Comparison</p>
        </div>
      </div>
    ),
  },
  {
    title: '"Same" means it can be rotated to match',
    body: 'If you could pick up the comparison shape and rotate it in 2D — with no flipping — until it matches the reference exactly, the answer is Same.',
    visual: () => {
      const base = [[0,0],[1,0],[2,0],[2,1]]
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            {[0, 1, 2, 3].map(rot => (
              <div key={rot} className="flex flex-col items-center gap-1">
                <ShapeGrid cells={rotate(base, rot)} color="#818cf8" size={4} />
                <span className="text-[9px] text-slate-400">{rot * 90}°</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            All four are the <strong className="text-sky-400">same shape</strong> — just rotated.
          </p>
        </div>
      )
    },
  },
  {
    title: '"Mirror" means it is flipped',
    body: 'If no rotation matches — you\'d have to flip it over — it\'s a Mirror. The mirror image of some shapes looks subtly different no matter how you rotate it.',
    visual: () => {
      const base   = [[0,0],[1,0],[2,0],[2,1]]
      const mirror = [[0,1],[1,1],[2,0],[2,1]]
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <ShapeGrid cells={base} color="#818cf8" />
              <p className="text-xs text-slate-400">Original</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShapeGrid cells={mirror} color="#f43f5e" />
              <p className="text-xs text-rose-400">Mirror image</p>
            </div>
          </div>
          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            Look at the "foot" of the L — it points in opposite directions.
          </p>
        </div>
      )
    },
  },
  {
    title: 'Use the two buttons to respond',
    body: 'Click Same (or press S) when the shapes are rotationally equivalent. Click Mirror (or press M) when they are flipped. Both speed and accuracy count.',
    visual: () => (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border-2 border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/30 p-3 text-center space-y-1">
            <p className="font-bold text-sky-700 dark:text-sky-300 text-sm">Same</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Rotated, not flipped</p>
            <kbd className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs font-mono">S key</kbd>
          </div>
          <div className="rounded-xl border-2 border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/30 p-3 text-center space-y-1">
            <p className="font-bold text-rose-700 dark:text-rose-300 text-sm">Mirror</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Flipped image</p>
            <kbd className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs font-mono">M key</kbd>
          </div>
        </div>
        <p className="text-xs text-center text-slate-400">Take your time at first — accuracy matters more than speed.</p>
      </div>
    ),
  },
  {
    title: 'Difficulty adapts to your performance',
    body: 'Start with just 2 shape types. As accuracy rises above 80%, new shapes are added making it harder to distinguish them. Drop below 50% and the pool shrinks back.',
    visual: () => (
      <div className="space-y-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
        {DIFFICULTY_LEVELS.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-16 text-sm font-semibold text-slate-700 dark:text-slate-300">{d.label}</span>
            <div className="flex gap-1">
              {Array.from({ length: d.numPairs }, (_, j) => (
                <div key={j} className="w-6 h-6 rounded-sm bg-sky-400 dark:bg-sky-500" style={{ opacity: 0.4 + j * 0.15 }} />
              ))}
            </div>
            <span className="text-xs text-slate-400">{d.label2}</span>
          </div>
        ))}
        <p className="text-xs text-slate-400 italic pt-1">Suggestion shown after each block</p>
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
            <RotateCcw className="w-5 h-5 text-sky-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">How to play</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 px-5 pb-3">
          {TUTORIAL_STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`rounded-full transition-all ${i === step ? 'w-5 h-2 bg-sky-500' : 'w-2 h-2 bg-slate-200 dark:bg-slate-700 hover:bg-sky-300'}`} />
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
              className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition-colors">
              {isLast ? "Got it — let's rotate! 🔄" : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MentalRotation() {
  const [diffIdx,     setDiffIdx]     = useState(0)
  const [blockLen,    setBlockLen]    = useState(16)
  const [phase,       setPhase]       = useState('idle')
  const [trial,       setTrial]       = useState(null)
  const [trialIdx,    setTrialIdx]    = useState(0)
  const [history,     setHistory]     = useState([])
  const [feedback,    setFeedback]    = useState(null)  // null | 'correct' | 'wrong'
  const [blockResult, setBlockResult] = useState(null)
  const [suggestDiff, setSuggestDiff] = useState(null)
  const [stats,       setStats]       = useState(loadStats)
  const [showInfo,    setShowInfo]    = useState(() => (loadStats().sessions?.length ?? 0) === 0)
  const timerRef      = useRef(null)
  const trialStartRef = useRef(null)
  const trialRef      = useRef(null)
  const historyRef    = useRef([])
  const trialIdxRef   = useRef(0)

  const advanceToTrial = useCallback((newHistory, nextIdx, dIdx, bLen) => {
    if (nextIdx >= bLen) {
      const score = scoreBlock(newHistory)
      const saved = loadStats()
      saved.sessions = [...(saved.sessions ?? []), { ...score, date: new Date().toISOString() }]
      if (score.acc > (saved.bestAcc ?? 0)) saved.bestAcc = score.acc
      saveStats(saved)
      setStats(saved)
      let next = dIdx
      if (score.acc >= 0.80 && dIdx < DIFFICULTY_LEVELS.length - 1) next = dIdx + 1
      else if (score.acc <= 0.50 && dIdx > 0) next = dIdx - 1
      setSuggestDiff(next !== dIdx ? next : null)
      setBlockResult(score)
      setPhase('result')
      return
    }
    const t = generateTrial(dIdx)
    trialRef.current    = t
    historyRef.current  = newHistory
    trialIdxRef.current = nextIdx
    setTrial(t)
    setTrialIdx(nextIdx)
    setFeedback(null)
    trialStartRef.current = Date.now()
  }, [])

  const handleAnswer = useCallback((userSaysMirror) => {
    if (feedback !== null) return
    const t = trialRef.current
    if (!t) return
    const rt      = Date.now() - trialStartRef.current
    const correct = userSaysMirror === t.isMirror
    const recorded = { ...t, correct, rt, userSaysMirror }
    setFeedback(correct ? 'correct' : 'wrong')

    timerRef.current = setTimeout(() => {
      const newHistory = [...historyRef.current, recorded]
      advanceToTrial(newHistory, trialIdxRef.current + 1, diffIdx, blockLen)
    }, FEEDBACK_MS)
  }, [feedback, diffIdx, blockLen, advanceToTrial])

  // Keyboard: S = Same, M = Mirror
  useEffect(() => {
    if (phase !== 'playing') return
    const handler = (e) => {
      if (e.key === 's' || e.key === 'S') handleAnswer(false)
      if (e.key === 'm' || e.key === 'M') handleAnswer(true)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, handleAnswer])

  const startBlock = () => {
    clearTimeout(timerRef.current)
    historyRef.current  = []
    trialIdxRef.current = 0
    setHistory([])
    setBlockResult(null)
    setSuggestDiff(null)
    setFeedback(null)
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
          <RotateCcw className="w-6 h-6 text-sky-500" />
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-200 text-lg leading-none">Mental Rotation</h2>
            <p className="text-xs text-slate-400 mt-0.5">Spatial reasoning · Visuospatial memory</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stats.sessions?.length > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs text-sky-600 dark:text-sky-400">
              <Trophy className="w-3.5 h-3.5" />
              Best: {Math.round((stats.bestAcc ?? 0) * 100)}%
            </div>
          )}
          <button onClick={() => setShowInfo(true)} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors">
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
              <p className="text-xs text-slate-400">Controls shape variety</p>
            </div>
            <div className="flex gap-1.5">
              {DIFFICULTY_LEVELS.map((d, i) => (
                <button key={i} onClick={() => setDiffIdx(i)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${i === diffIdx ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Trials per block</p>
            <div className="flex gap-1.5">
              {BLOCK_LENGTHS.map(l => (
                <button key={l} onClick={() => setBlockLen(l)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${l === blockLen ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <button onClick={startBlock}
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors">
            <Play className="w-4 h-4" /> Start ({blockLen} trials · {DIFFICULTY_LEVELS[diffIdx].label})
          </button>
          <SessionChart sessions={stats.sessions ?? []} />
        </div>
      )}

      {/* Playing */}
      {phase === 'playing' && trial && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-slate-400 shrink-0">{trialIdx + 1}/{blockLen}</span>
            <span className="px-2 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-xs font-bold border border-sky-200 dark:border-sky-700">
              {DIFFICULTY_LEVELS[diffIdx].label}
            </span>
          </div>

          {/* Shapes display */}
          <div className={`rounded-2xl border-2 p-5 transition-all ${
            feedback === 'correct' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400'
            : feedback === 'wrong' ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-400'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center justify-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <ShapeGrid cells={trial.reference} color="#818cf8" />
                <p className="text-xs font-semibold text-slate-400">Reference</p>
              </div>
              {feedback === null ? (
                <p className="text-2xl text-slate-300 dark:text-slate-600 font-light">vs</p>
              ) : (
                <div className="flex flex-col items-center">
                  {feedback === 'correct'
                    ? <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    : <XCircle className="w-8 h-8 text-rose-500" />}
                  <p className={`text-xs font-semibold mt-1 ${feedback === 'correct' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                    {feedback === 'correct' ? 'Correct!' : `Was ${trial.isMirror ? 'Mirror' : 'Same'}`}
                  </p>
                </div>
              )}
              <div className="flex flex-col items-center gap-2">
                <ShapeGrid cells={trial.comparison} color="#38bdf8" />
                <p className="text-xs font-semibold text-sky-400">Comparison</p>
              </div>
            </div>
          </div>

          {/* Response buttons */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Same', hint: 'S key', value: false, color: 'sky' },
              { label: 'Mirror', hint: 'M key', value: true, color: 'rose' },
            ].map(({ label, hint, value, color }) => (
              <button key={label} onClick={() => handleAnswer(value)}
                disabled={feedback !== null}
                className={`py-4 rounded-xl font-semibold text-sm border-2 transition-all active:scale-95 disabled:opacity-60 flex flex-col items-center gap-0.5
                  ${color === 'sky'
                    ? 'bg-white dark:bg-slate-800 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/30'
                    : 'bg-white dark:bg-slate-800 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30'}`}>
                <span>{label}</span>
                <span className="text-xs font-normal opacity-60">{hint}</span>
              </button>
            ))}
          </div>

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
            <TrendingUp className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Block complete</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 p-3 text-center">
              <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold mb-1">Accuracy</p>
              <p className="text-2xl font-black text-sky-700 dark:text-sky-300">{Math.round(blockResult.acc * 100)}%</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 p-3 text-center">
              <p className="text-xs text-slate-500 font-semibold mb-1">Correct</p>
              <p className="text-2xl font-black text-slate-700 dark:text-slate-300">{blockResult.correct}/{blockResult.total}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 p-3 text-center">
              <p className="text-xs text-slate-500 font-semibold mb-1">Avg RT</p>
              <p className="text-2xl font-black text-slate-700 dark:text-slate-300">{blockResult.avgRt > 0 ? `${(blockResult.avgRt / 1000).toFixed(1)}s` : '—'}</p>
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
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  suggestDiff > diffIdx ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}>
                Switch
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={startBlock}
              className="py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-1.5">
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
