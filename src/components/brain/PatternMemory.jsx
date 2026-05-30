/**
 * PatternMemory — Episodic memory & visual sequence recall.
 *
 * Research basis: Corsi (1972) block-tapping paradigm; Milner (1971) on
 * visuospatial short-term memory span.  Watching and reproducing a growing
 * sequence of highlighted cells loads and trains visuo-spatial working memory
 * span — the number of items you can hold and manipulate in mind.
 *
 * Mechanics:
 *   - 4×4 grid of 16 cells
 *   - Watch phase: cells light up one at a time in a random sequence
 *   - Recall phase: tap the cells in the same order
 *   - All correct → sequence grows by 1
 *   - Any mistake → strike; 2 strikes → sequence shrinks by 1
 *   - Session ends when user stops; best span recorded
 *
 * localStorage key: oc-brain-pattern
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Star, Play, Square, Trophy, TrendingUp, Info, X } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────
const STORE_KEY    = 'oc-brain-pattern'
const GRID_SIZE    = 16   // 4×4
const CELL_ON_MS   = 550  // cell lit duration during playback
const CELL_GAP_MS  = 150  // gap between cells
const PRE_DELAY_MS = 800  // pause before playback starts
const FB_CORRECT_MS = 700 // success flash duration
const FB_WRONG_MS  = 1000 // error flash duration

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateSequence(length, prev = []) {
  const seq = []
  for (let i = 0; i < length; i++) {
    let next
    do {
      next = Math.floor(Math.random() * GRID_SIZE)
    } while (next === seq[seq.length - 1])  // no immediate repeats
    seq.push(next)
  }
  return seq
}

// ─── Persistence ──────────────────────────────────────────────────────────────
function loadStats() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) ?? { sessions: [], bestSpan: 0 } }
  catch { return { sessions: [], bestSpan: 0 } }
}
function saveStats(s) { localStorage.setItem(STORE_KEY, JSON.stringify(s)) }

// ─── SessionChart ─────────────────────────────────────────────────────────────
function SessionChart({ sessions }) {
  if (!sessions.length) return null
  const last   = sessions.slice(-10)
  const maxSpan = Math.max(...last.map(s => s.maxSpan), 3)
  return (
    <div className="mt-4">
      <p className="text-xs text-slate-400 mb-2">Max span over last {last.length} sessions</p>
      <div className="flex items-end gap-1 h-12">
        {last.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full rounded-t bg-emerald-400 dark:bg-emerald-500"
              style={{ height: `${Math.max(6, (s.maxSpan / (maxSpan + 1)) * 48)}px` }}
              title={`Span ${s.maxSpan}`} />
            <span className="text-[9px] text-slate-400 font-mono">{s.maxSpan}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tutorial ─────────────────────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    title: 'Watch the pattern light up',
    body: 'Cells on a 4×4 grid flash one by one. Your job: remember every cell that lit up, in the exact order it appeared. Watch carefully — the sequence gets longer each round.',
    visual: () => {
      const seq = [5, 10, 3, 14]
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-1.5 p-3 rounded-xl bg-slate-900 max-w-[160px] mx-auto">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${seq.includes(i) ? 'bg-emerald-500 text-white' : 'bg-slate-700'}`}>
                {seq.includes(i) ? seq.indexOf(i) + 1 : ''}
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-slate-400">Numbers show the order cells lit up</p>
        </div>
      )
    },
  },
  {
    title: 'Repeat the sequence by tapping',
    body: 'When the grid stops flashing, it\'s your turn. Tap or click the cells in the same order you saw them. The cells change colour as you tap to confirm your input.',
    visual: () => {
      const seq = [5, 10, 3]
      const tapped = [5, 10]
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-1.5 p-3 rounded-xl bg-slate-900 max-w-[160px] mx-auto">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i}
                className={`w-8 h-8 rounded-lg transition-all ${tapped.includes(i) ? 'bg-emerald-500' : seq[2] === i ? 'bg-slate-600 ring-2 ring-emerald-400' : 'bg-slate-700'}`} />
            ))}
          </div>
          <p className="text-xs text-center text-slate-400">First two tapped ✓ — one more to go</p>
        </div>
      )
    },
  },
  {
    title: 'Correct? Sequence grows by one',
    body: 'Nail the full sequence and the next round adds one more cell. A wrong tap ends the round immediately. Two wrong rounds in a row and the sequence shortens by one.',
    visual: () => (
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
          <span className="text-2xl">✅</span>
          <span className="text-emerald-700 dark:text-emerald-300">All correct → <strong>length + 1</strong></span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-3">
          <span className="text-2xl">⚠️</span>
          <span className="text-rose-700 dark:text-rose-300">Wrong tap → strike (retry same length)</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
          <span className="text-2xl">📉</span>
          <span className="text-amber-700 dark:text-amber-300">2 strikes → <strong>length − 1</strong></span>
        </div>
      </div>
    ),
  },
  {
    title: 'Your span grows with practice',
    body: 'Most adults start at span 4–5. Regular practice pushes this higher, reflecting real improvements in working memory capacity. Stop anytime — your best span is saved.',
    visual: () => (
      <div className="space-y-3 rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Average adult span</span>
          <span className="font-bold text-slate-700 dark:text-slate-200">4 – 5</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Good</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">6 – 7</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Excellent</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">8+</span>
        </div>
        <p className="text-xs text-slate-400 italic">The struggle to remember IS the training</p>
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
            <Star className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">How to play</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 px-5 pb-3">
          {TUTORIAL_STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`rounded-full transition-all ${i === step ? 'w-5 h-2 bg-emerald-500' : 'w-2 h-2 bg-slate-200 dark:bg-slate-700 hover:bg-emerald-300'}`} />
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
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors">
              {isLast ? "Got it — let's remember! ⭐" : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PatternMemory() {
  // Game state machine: idle → watching → input → (correct | wrong) → watching | idle
  const [phase,       setPhase]       = useState('idle')
  const [sequence,    setSequence]    = useState([])
  const [seqLen,      setSeqLen]      = useState(3)
  const [inputSoFar,  setInputSoFar]  = useState([])
  const [litCell,     setLitCell]     = useState(-1)    // cell lit during playback
  const [tappedCell,  setTappedCell]  = useState(-1)    // brief flash on tap
  const [errorCell,   setErrorCell]   = useState(-1)    // cell tapped wrongly
  const [strikes,     setStrikes]     = useState(0)
  const [sessionMax,  setSessionMax]  = useState(3)
  const [sessionRounds, setSessionRounds] = useState(0)
  const [stats,       setStats]       = useState(loadStats)
  const [showInfo,    setShowInfo]    = useState(() => (loadStats().sessions?.length ?? 0) === 0)
  const timersRef  = useRef([])
  const seqRef     = useRef([])
  const inputRef   = useRef([])
  const seqLenRef  = useRef(3)
  const strikesRef = useRef(0)
  const sessionMaxRef = useRef(3)

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  const addTimer = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }

  // Start watching phase: animate sequence
  const startWatching = useCallback((seq, len) => {
    seqRef.current   = seq
    seqLenRef.current = len
    inputRef.current = []
    setSequence(seq)
    setSeqLen(len)
    setInputSoFar([])
    setLitCell(-1)
    setTappedCell(-1)
    setErrorCell(-1)
    setPhase('watching')

    let delay = PRE_DELAY_MS
    seq.forEach((cellIdx, i) => {
      addTimer(() => setLitCell(cellIdx), delay)
      addTimer(() => setLitCell(-1), delay + CELL_ON_MS)
      delay += CELL_ON_MS + CELL_GAP_MS
    })
    addTimer(() => {
      setLitCell(-1)
      setPhase('input')
    }, delay + 200)
  }, [])

  const handleCorrectSequence = useCallback(() => {
    const nextLen = seqLenRef.current + 1
    if (nextLen > sessionMaxRef.current) {
      sessionMaxRef.current = nextLen
      setSessionMax(nextLen)
    }
    strikesRef.current = 0
    setStrikes(0)
    setSessionRounds(r => r + 1)
    setPhase('correct')
    addTimer(() => {
      const nextSeq = generateSequence(nextLen)
      startWatching(nextSeq, nextLen)
    }, FB_CORRECT_MS)
  }, [startWatching])

  const handleWrongTap = useCallback((wrongCell) => {
    setErrorCell(wrongCell)
    strikesRef.current += 1
    setStrikes(strikesRef.current)
    setSessionRounds(r => r + 1)
    setPhase('wrong')

    addTimer(() => {
      setErrorCell(-1)
      let nextLen = seqLenRef.current
      if (strikesRef.current >= 2) {
        nextLen = Math.max(2, seqLenRef.current - 1)
        strikesRef.current = 0
        setStrikes(0)
      }
      const nextSeq = generateSequence(nextLen)
      startWatching(nextSeq, nextLen)
    }, FB_WRONG_MS)
  }, [startWatching])

  const handleCellClick = useCallback((cellIdx) => {
    if (phase !== 'input') return
    const pos   = inputRef.current.length
    const seq   = seqRef.current
    const correct = cellIdx === seq[pos]

    if (!correct) {
      handleWrongTap(cellIdx)
      return
    }

    // Brief tap flash
    setTappedCell(cellIdx)
    addTimer(() => setTappedCell(-1), 200)

    const next = [...inputRef.current, cellIdx]
    inputRef.current = next
    setInputSoFar([...next])

    if (next.length === seq.length) {
      handleCorrectSequence()
    }
  }, [phase, handleCorrectSequence, handleWrongTap])

  const startSession = () => {
    clearAllTimers()
    strikesRef.current    = 0
    sessionMaxRef.current = 3
    setStrikes(0)
    setSessionMax(3)
    setSessionRounds(0)
    const seq = generateSequence(3)
    startWatching(seq, 3)
  }

  const stopSession = () => {
    clearAllTimers()
    // Save session
    const saved = loadStats()
    saved.sessions = [...(saved.sessions ?? []), { maxSpan: sessionMaxRef.current, date: new Date().toISOString() }]
    if (sessionMaxRef.current > (saved.bestSpan ?? 0)) saved.bestSpan = sessionMaxRef.current
    saveStats(saved)
    setStats(saved)
    setPhase('idle')
    setLitCell(-1)
    setTappedCell(-1)
    setErrorCell(-1)
    seqRef.current = []
    inputRef.current = []
  }

  useEffect(() => () => clearAllTimers(), [])

  const isPlaying = phase !== 'idle'

  // Cell color logic
  const getCellClass = (i) => {
    if (i === litCell)    return 'bg-emerald-500 shadow-lg shadow-emerald-500/40 scale-105'
    if (i === errorCell)  return 'bg-rose-500 shadow-lg shadow-rose-500/40 scale-105'
    if (i === tappedCell) return 'bg-emerald-400 scale-105'
    if (phase === 'input' && inputSoFar.includes(i)) return 'bg-emerald-700 dark:bg-emerald-800'
    if (phase === 'correct' && sequence.includes(i)) return 'bg-emerald-500/50'
    return 'bg-slate-700 dark:bg-slate-700'
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-emerald-500" />
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-200 text-lg leading-none">Pattern Memory</h2>
            <p className="text-xs text-slate-400 mt-0.5">Visual sequence recall · Working memory span</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stats.sessions?.length > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-600 dark:text-emerald-400">
              <Trophy className="w-3.5 h-3.5" />
              Best span: {stats.bestSpan ?? 0}
            </div>
          )}
          <button onClick={() => setShowInfo(true)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Idle */}
      {phase === 'idle' && (
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 space-y-5">
          <div className="text-center space-y-1">
            <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{stats.bestSpan ?? 0}</p>
            <p className="text-sm text-slate-500">personal best span</p>
          </div>
          <button onClick={startSession}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors">
            <Play className="w-4 h-4" /> Start session
          </button>
          <SessionChart sessions={stats.sessions ?? []} />
        </div>
      )}

      {/* Playing — grid + status */}
      {isPlaying && (
        <div className="space-y-4">
          {/* Status bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-lg text-sm font-bold border-2 transition-all ${
                phase === 'watching' ? 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                : phase === 'input'   ? 'bg-sky-100 dark:bg-sky-950/40 border-sky-400 text-sky-700 dark:text-sky-300 animate-pulse'
                : phase === 'correct' ? 'bg-emerald-500 border-emerald-500 text-white'
                : /* wrong */           'bg-rose-500 border-rose-500 text-white'
              }`}>
                {phase === 'watching' ? '👀 Watch…'
                : phase === 'input'   ? '👆 Repeat!'
                : phase === 'correct' ? '✓ Correct!'
                : /* wrong */           '✗ Wrong!'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="font-bold text-emerald-500 dark:text-emerald-400 text-base">{seqLen}</span> cells
              </span>
              <span className="flex items-center gap-1">
                {Array.from({ length: 2 }, (_, i) => (
                  <span key={i} className={`w-2.5 h-2.5 rounded-full ${i < strikes ? 'bg-rose-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                ))}
              </span>
            </div>
          </div>

          {/* Grid */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${
            phase === 'correct' ? 'bg-emerald-900 border-emerald-500'
            : phase === 'wrong'  ? 'bg-rose-900 border-rose-500'
            : 'bg-slate-900 border-slate-700'
          }`}>
            <div className="grid grid-cols-4 gap-2 max-w-[240px] mx-auto">
              {Array.from({ length: GRID_SIZE }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleCellClick(i)}
                  disabled={phase !== 'input'}
                  className={`aspect-square rounded-xl transition-all duration-100 disabled:cursor-default ${getCellClass(i)}`}
                />
              ))}
            </div>
          </div>

          {/* Input progress dots */}
          {phase === 'input' && (
            <div className="flex items-center justify-center gap-1.5 py-1">
              {sequence.map((_, i) => (
                <span key={i} className={`rounded-full transition-all ${
                  i < inputSoFar.length ? 'w-3 h-3 bg-emerald-500' : 'w-2.5 h-2.5 bg-slate-200 dark:bg-slate-700'
                }`} />
              ))}
            </div>
          )}

          {/* Session stats */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>This session: <strong className="text-emerald-500">{sessionMax}</strong> best span</span>
            <span>{sessionRounds} round{sessionRounds !== 1 ? 's' : ''}</span>
          </div>

          <button onClick={stopSession}
            className="w-full py-2 rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex items-center justify-center gap-1.5">
            <Square className="w-3.5 h-3.5" /> End session & save
          </button>
        </div>
      )}
    </div>
  )
}
