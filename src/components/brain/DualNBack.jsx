/**
 * DualNBack — Visual Dual N-Back training game.
 *
 * Research basis: Jaeggi et al. (2008) PNAS — working memory training via
 * Dual N-Back transfers to fluid intelligence gains.  The visual variant
 * (position + letter shown simultaneously) is widely used and avoids audio
 * complexity while preserving the core working memory demand.
 *
 * Mechanics:
 *   - 3×3 grid, one cell highlighted per trial
 *   - A letter (A–R subset) displayed in the highlighted cell
 *   - User presses [Position] if the current position matches N trials ago
 *   - User presses [Letter]   if the current letter   matches N trials ago
 *   - Hit = correct press, Miss = unpressed match, FA = wrong press
 *   - After each block: auto-adjust N (≥80% correct → N+1, ≤50% → N-1)
 *   - Configurable interval (1.5 s / 2 s / 3 s) and block length (20 / 30 trials)
 *
 * localStorage key: oc-brain-dnback
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Brain, Play, Square, ChevronUp, ChevronDown, RotateCcw, Trophy, TrendingUp, Info, X } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────
const LETTERS       = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T']   // 8 distinct-sounding letters
const GRID_SIZE     = 9   // 3×3
const STORE_KEY     = 'oc-brain-dnback'
const INTERVALS_MS    = [1500, 2000, 3000]
const INTERVAL_LABELS = ['Fast (1.5 s)', 'Medium (2 s)', 'Slow (3 s)']
const BLOCK_LENGTHS   = [20, 30]
const FEEDBACK_MS     = 700  // how long to show green/red before next trial

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]

function generateTrial(history, n) {
  // 30 % chance of position match, 30 % chance of letter match (independent)
  const posMatch = history.length >= n && Math.random() < 0.30
  const letMatch = history.length >= n && Math.random() < 0.30
  const pos = posMatch
    ? history[history.length - n].pos
    : (() => {
        let p; do { p = Math.floor(Math.random() * GRID_SIZE) } while (history.length >= n && p === history[history.length - n].pos); return p
      })()
  const let_ = letMatch
    ? history[history.length - n].let
    : (() => {
        let l; do { l = rand(LETTERS) } while (history.length >= n && l === history[history.length - n].let); return l
      })()
  return { pos, let: let_, posMatch, letMatch }
}

function loadStats() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) ?? { sessions: [], bestN: 1 } }
  catch { return { sessions: [], bestN: 1 } }
}
function saveStats(s) { localStorage.setItem(STORE_KEY, JSON.stringify(s)) }

function scoreBlock(history) {
  let posHits = 0, posMisses = 0, posFAs = 0
  let letHits = 0, letMisses = 0, letFAs = 0
  history.forEach(t => {
    if (t.posMatch && t.posPressed)  posHits++
    if (t.posMatch && !t.posPressed) posMisses++
    if (!t.posMatch && t.posPressed) posFAs++
    if (t.letMatch && t.letPressed)  letHits++
    if (t.letMatch && !t.letPressed) letMisses++
    if (!t.letMatch && t.letPressed) letFAs++
  })
  const posTargets = posHits + posMisses
  const letTargets = letHits + letMisses
  const posAcc = posTargets ? posHits / posTargets : 1
  const letAcc = letTargets ? letHits / letTargets : 1
  const pctCorrect = (posAcc + letAcc) / 2
  return { posHits, posMisses, posFAs, letHits, letMisses, letFAs, posAcc, letAcc, pctCorrect }
}

// ─── ScoreBar ─────────────────────────────────────────────────────────────────
function ScoreBar({ label, hits, misses, fas }) {
  const total = hits + misses
  const acc   = total ? Math.round((hits / total) * 100) : 100
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-mono font-semibold">{acc}% ({hits}/{total})</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${acc}%` }} />
      </div>
      {fas > 0 && <p className="text-xs text-rose-400">{fas} false alarm{fas > 1 ? 's' : ''}</p>}
    </div>
  )
}

// ─── SessionChart (sparkline of last 10 sessions) ─────────────────────────────
function SessionChart({ sessions }) {
  if (!sessions.length) return null
  const last = sessions.slice(-10)
  const maxN  = Math.max(...last.map(s => s.n), 1)
  return (
    <div className="mt-4">
      <p className="text-xs text-slate-400 mb-2">N-level over last {last.length} sessions</p>
      <div className="flex items-end gap-1 h-12">
        {last.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className="w-full rounded-t bg-violet-400 dark:bg-violet-500 transition-all"
              style={{ height: `${Math.max(8, (s.n / (maxN + 1)) * 48)}px` }}
              title={`N=${s.n}  ${Math.round(s.pctCorrect * 100)}%`}
            />
            <span className="text-[9px] text-slate-400 font-mono">{s.n}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Mini grid for tutorial illustrations ────────────────────────────────────
function MiniGrid({ activeCell, letter }) {
  return (
    <div className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-slate-900 w-24 h-24 shrink-0">
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className={`rounded-md flex items-center justify-center text-sm font-black transition-all ${i === activeCell ? 'bg-violet-500 text-white' : 'bg-slate-700'}`}>
          {i === activeCell ? letter : ''}
        </div>
      ))}
    </div>
  )
}

// ─── InfoModal ────────────────────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    title: 'Each round, a square lights up',
    body: 'The game shows you a 3×3 grid. One square flashes and shows a letter. That\'s it — just a square and a letter.',
    visual: () => (
      <div className="flex items-center justify-center gap-4">
        <MiniGrid activeCell={4} letter="K" />
        <div className="text-left space-y-1">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Middle square lit</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Letter shown: <strong className="text-violet-500">K</strong></p>
          <p className="text-xs text-slate-400 italic">Remember both!</p>
        </div>
      </div>
    ),
  },
  {
    title: 'You see several squares in a row',
    body: 'The game flashes squares one at a time, like frames of a film. You need to keep the last few in your head.',
    visual: () => (
      <div className="flex items-center gap-2">
        {[
          { cell: 0, letter: 'C', label: '1st' },
          { cell: 7, letter: 'R', label: '2nd' },
          { cell: 4, letter: 'K', label: '3rd ← now' },
        ].map(({ cell, letter, label }, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <MiniGrid activeCell={cell} letter={letter} />
            <span className={`text-[10px] font-semibold ${i === 2 ? 'text-violet-400' : 'text-slate-400'}`}>{label}</span>
          </div>
        ))}
        <div className="text-xs text-slate-400 leading-relaxed ml-1">
          <p>Squares flash</p>
          <p>one by one,</p>
          <p>every 2 sec.</p>
        </div>
      </div>
    ),
  },
  {
    title: '"2-back" means: compare to 2 ago',
    body: 'At 2-back, every time a new square appears, ask yourself: "Does this match what I saw TWO flashes ago?" — for position AND letter separately.',
    visual: () => (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {[
            { cell: 0, letter: 'C', label: '1st', dim: true },
            { cell: 7, letter: 'R', label: '2nd  ← 2 ago', dim: false },
            { cell: 7, letter: 'K', label: '3rd  ← NOW', dim: false, now: true },
          ].map(({ cell, letter, label, dim, now }, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`grid grid-cols-3 gap-1 p-2 rounded-xl w-20 h-20 shrink-0 ${dim ? 'opacity-30' : 'bg-slate-900'}`} style={{ background: dim ? undefined : undefined }}>
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-900 w-full h-full p-1">
                  {Array.from({ length: 9 }, (_, j) => (
                    <div key={j} className={`rounded-sm flex items-center justify-center text-xs font-black ${j === cell ? (now ? 'bg-violet-500 text-white' : 'bg-violet-400 text-white') : 'bg-slate-700'}`}>
                      {j === cell ? letter : ''}
                    </div>
                  ))}
                </div>
              </div>
              <span className={`text-[9px] font-semibold text-center leading-tight ${now ? 'text-violet-400' : dim ? 'text-slate-600' : 'text-slate-400'}`}>{label}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 space-y-1.5 text-xs">
          <p className="flex items-center gap-2"><span className="text-emerald-500 font-bold text-base">✓</span> <strong>Position match!</strong> Both in the same column (middle-right). Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">Position</kbd></p>
          <p className="flex items-center gap-2"><span className="text-rose-400 font-bold text-base">✗</span> <strong>No letter match.</strong> "R" ≠ "K". Don't press Letter.</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Your two buttons',
    body: 'Each flash you can press Position, Letter, both, or neither. Press them only when there\'s a match — guessing wrong counts against you.',
    visual: () => (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border-2 border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/30 p-3 text-center space-y-1">
            <p className="font-bold text-violet-700 dark:text-violet-300 text-sm">Position</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Same square lit as 2 flashes ago?</p>
            <kbd className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs font-mono">A key</kbd>
          </div>
          <div className="rounded-xl border-2 border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/30 p-3 text-center space-y-1">
            <p className="font-bold text-violet-700 dark:text-violet-300 text-sm">Letter</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Same letter shown as 2 flashes ago?</p>
            <kbd className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs font-mono">L key</kbd>
          </div>
        </div>
        <p className="text-xs text-slate-400 text-center">You have until the next flash to decide. Take your time at first — speed comes with practice.</p>
      </div>
    ),
  },
  {
    title: 'Start on 2-back. The game adapts.',
    body: 'Don\'t worry about getting it perfect — everyone struggles at first. The game automatically makes it easier or harder based on how you\'re doing.',
    visual: () => (
      <div className="space-y-3">
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 space-y-2 text-sm">
          <p className="flex items-center gap-2"><span className="text-2xl">🎯</span> <span><strong>≥ 80% correct</strong> → bumps up to 3-back (harder)</span></p>
          <p className="flex items-center gap-2"><span className="text-2xl">💡</span> <span><strong>≤ 50% correct</strong> → drops back to 1-back (easier)</span></p>
          <p className="flex items-center gap-2"><span className="text-2xl">🧠</span> <span><strong>Consistent daily practice</strong> builds real working memory</span></p>
        </div>
        <p className="text-xs text-slate-400 text-center italic">Most people start at 2-back. Reaching 4-back is excellent. Don't stress the score — the struggle IS the training.</p>
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
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">How to play</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5 px-5 pb-3">
          {TUTORIAL_STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`rounded-full transition-all ${i === step ? 'w-5 h-2 bg-violet-500' : 'w-2 h-2 bg-slate-200 dark:bg-slate-700 hover:bg-violet-300'}`} />
          ))}
          <span className="ml-auto text-xs text-slate-400">{step + 1} / {TUTORIAL_STEPS.length}</span>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">{current.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{current.body}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4">
            <current.visual />
          </div>

          {/* Nav */}
          <div className="flex items-center gap-2 pt-1">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                ← Back
              </button>
            )}
            <button onClick={isLast ? onClose : () => setStep(s => s + 1)}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-colors">
              {isLast ? "Got it — let's play! 🧠" : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DualNBack() {
  const [n,           setN]           = useState(2)
  const [intervalIdx, setIntervalIdx] = useState(1)   // default 2 s
  const [blockLen,    setBlockLen]    = useState(20)
  const [phase,       setPhase]       = useState('idle')   // idle | playing | result
  const [trial,       setTrial]       = useState(null)
  const [trialIdx,    setTrialIdx]    = useState(0)
  const [history,     setHistory]     = useState([])
  const [pressed,     setPressed]     = useState({ pos: false, let: false })
  // feedback: null | { pos: 'hit'|'miss'|'fa'|'cr', let: 'hit'|'miss'|'fa'|'cr' }
  const [feedback,    setFeedback]    = useState(null)
  const [blockResult, setBlockResult] = useState(null)
  const [stats,       setStats]       = useState(loadStats)
  const [showInfo,    setShowInfo]    = useState(() => (loadStats().sessions?.length ?? 0) === 0)
  const timerRef   = useRef(null)
  // pressedRef always reflects current pressed state — timer closures read this
  // instead of relying on stale closure values (root cause of score always = 0)
  const pressedRef  = useRef({ pos: false, let: false })

  // Keyboard bindings
  useEffect(() => {
    if (phase !== 'playing') return
    const handler = (e) => {
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft')  { pressPos() }
      if (e.key === 'l' || e.key === 'L' || e.key === 'ArrowRight') { pressLet() }
      if (e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); pressBoth() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const pressPos   = useCallback(() => { setPressed(p => { const n = { ...p, pos: true }; pressedRef.current = n; return n }) }, [])
  const pressLet   = useCallback(() => { setPressed(p => { const n = { ...p, let: true }; pressedRef.current = n; return n }) }, [])
  const pressBoth  = useCallback(() => { const n = { pos: true, let: true }; pressedRef.current = n; setPressed(n) }, [])
  const resetPress = ()              => { pressedRef.current = { pos: false, let: false }; setPressed({ pos: false, let: false }) }

  const advanceTrial = useCallback((currentHistory, currentTrial, currentN, currentTrialIdx, afterFeedback = false) => {
    // Read pressed state from ref — closure captures initial value so ref is the only reliable source
    const currentPressed = pressedRef.current

    // Phase 1 — show feedback colors before recording/advancing
    if (!afterFeedback && currentTrial && currentHistory.length >= currentN) {
      const fb = {
        pos: currentTrial.posMatch
          ? (currentPressed.pos ? 'hit'  : 'miss')
          : (currentPressed.pos ? 'fa'   : 'cr'),
        let: currentTrial.letMatch
          ? (currentPressed.let ? 'hit'  : 'miss')
          : (currentPressed.let ? 'fa'   : 'cr'),
      }
      setFeedback(fb)
      timerRef.current = setTimeout(
        () => advanceTrial(currentHistory, currentTrial, currentN, currentTrialIdx, true),
        FEEDBACK_MS
      )
      return
    }

    setFeedback(null)

    // Phase 2 — record result and move to next trial
    const recorded = currentTrial
      ? { ...currentTrial, posPressed: currentPressed.pos, letPressed: currentPressed.let }
      : null
    const newHistory = recorded ? [...currentHistory, recorded] : currentHistory

    if (currentTrialIdx + 1 >= blockLen) {
      // Block complete
      clearTimeout(timerRef.current)
      const score = scoreBlock(newHistory)
      // Auto-adjust N
      let nextN = currentN
      if (score.pctCorrect >= 0.80 && currentN < 9) nextN = currentN + 1
      else if (score.pctCorrect <= 0.50 && currentN > 1) nextN = currentN - 1

      const newStats = { ...stats }
      newStats.sessions = [...(newStats.sessions ?? []), { n: currentN, ...score, date: new Date().toISOString() }]
      if (currentN > (newStats.bestN ?? 1)) newStats.bestN = currentN
      saveStats(newStats)

      setStats(newStats)
      setBlockResult({ score, nextN, finalN: currentN })
      setHistory(newHistory)
      setPhase('result')
      return
    }

    // Next trial
    const nextTrial  = generateTrial(newHistory, currentN)
    const nextIdx    = currentTrialIdx + 1
    setHistory(newHistory)
    setTrial(nextTrial)
    setTrialIdx(nextIdx)
    resetPress()
    setFeedback(null)

    timerRef.current = setTimeout(() => advanceTrial(newHistory, nextTrial, currentN, nextIdx), INTERVALS_MS[intervalIdx])
  }, [blockLen, intervalIdx, stats])

  const startBlock = () => {
    clearTimeout(timerRef.current)
    const first = generateTrial([], n)
    setHistory([])
    setTrial(first)
    setTrialIdx(0)
    resetPress()
    setFeedback(null)
    setBlockResult(null)
    setPhase('playing')
    timerRef.current = setTimeout(() => advanceTrial([], first, n, 0), INTERVALS_MS[intervalIdx])
  }

  const acceptNextN = () => {
    if (blockResult) setN(blockResult.nextN)
    setPhase('idle')
    setBlockResult(null)
    setTrial(null)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  // ── Render ────────────────────────────────────────────────────────────────
  const intervalMs = INTERVALS_MS[intervalIdx]
  const progress   = phase === 'playing' ? Math.round((trialIdx / blockLen) * 100) : 0

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-violet-500" />
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-200 text-lg leading-none">Dual N-Back</h2>
            <p className="text-xs text-slate-400 mt-0.5">Working memory · Fluid intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stats.sessions?.length > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 text-xs text-violet-600 dark:text-violet-400">
              <Trophy className="w-3.5 h-3.5" />
              Best: {stats.bestN}-back
            </div>
          )}
          <button onClick={() => setShowInfo(true)} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings (idle only) */}
      {phase === 'idle' && (
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 space-y-4">
          {/* N selector */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">N level</p>
              <p className="text-xs text-slate-400">How many steps back to remember</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setN(v => Math.max(1, v - 1))} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"><ChevronDown className="w-4 h-4" /></button>
              <span className="w-10 text-center font-bold text-xl text-violet-600 dark:text-violet-400">{n}</span>
              <button onClick={() => setN(v => Math.min(9, v + 1))} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"><ChevronUp className="w-4 h-4" /></button>
            </div>
          </div>
          {/* Speed */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Speed</p>
            <div className="flex gap-1.5">
              {INTERVAL_LABELS.map((lbl, i) => (
                <button key={i} onClick={() => setIntervalIdx(i)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${i === intervalIdx ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          {/* Block length */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Trials per block</p>
            <div className="flex gap-1.5">
              {BLOCK_LENGTHS.map(l => (
                <button key={l} onClick={() => setBlockLen(l)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${l === blockLen ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <button onClick={startBlock}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors">
            <Play className="w-4 h-4" /> Start {n}-Back ({blockLen} trials)
          </button>
          <SessionChart sessions={stats.sessions ?? []} />
        </div>
      )}

      {/* Playing */}
      {phase === 'playing' && trial && (
        <div className="space-y-4">
          {/* Progress + N badge */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-slate-400 shrink-0">{trialIdx + 1}/{blockLen}</span>
            <span className="px-2 py-0.5 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-bold border border-violet-200 dark:border-violet-700">{n}-back</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-slate-900 border border-slate-700 aspect-square max-w-[280px] mx-auto">
            {Array.from({ length: GRID_SIZE }, (_, i) => {
              const active = trial.pos === i
              return (
                <div key={i} className={`rounded-xl flex items-center justify-center text-3xl font-black transition-all duration-100 ${active ? 'bg-violet-500 shadow-lg shadow-violet-500/40 scale-105' : 'bg-slate-800'}`}>
                  {active ? <span className={`text-white ${active ? 'animate-none' : ''}`}>{trial.let}</span> : null}
                </div>
              )
            })}
          </div>

          {/* Press buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              {[{ key: 'pos', label: 'Position', hint: 'A or ←', onPress: pressPos, wasPressed: pressed.pos },
                { key: 'let', label: 'Letter',   hint: 'L or →', onPress: pressLet, wasPressed: pressed.let },
              ].map(({ key, label, hint, onPress, wasPressed }) => {
                const fb = feedback?.[key]
                const LABELS = { hit: '✓ Correct!', cr: '✓ Good hold', miss: '✗ Missed it!', fa: '✗ Wrong press' }
                const CLS = {
                  hit:  'bg-emerald-500 border-emerald-400 text-white scale-95',
                  cr:   'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300',
                  miss: 'bg-rose-500 border-rose-400 text-white scale-95',
                  fa:   'bg-rose-50 dark:bg-rose-950/30 border-rose-400 dark:border-rose-500 text-rose-700 dark:text-rose-300',
                }
                const cls = fb
                  ? CLS[fb]
                  : wasPressed
                    ? 'bg-violet-600 border-violet-600 text-white scale-95 shadow-inner'
                    : 'bg-white dark:bg-slate-800 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 active:scale-95'
                return (
                  <button key={key} onClick={onPress} disabled={wasPressed || !!feedback}
                    className={`py-4 rounded-xl font-semibold text-sm transition-all flex flex-col items-center gap-0.5 border-2 ${cls}`}>
                    <span>{label}</span>
                    <span className="text-xs font-normal opacity-70">{fb ? LABELS[fb] : hint}</span>
                  </button>
                )
              })}
            </div>
            {/* Both button */}
            {(() => {
              const bothPressed = pressed.pos && pressed.let
              const posFb = feedback?.pos
              const letFb = feedback?.let
              const bothCorrect = posFb && letFb && (posFb === 'hit' || posFb === 'cr') && (letFb === 'hit' || letFb === 'cr')
              const bothWrong   = posFb && letFb && (posFb === 'miss' || posFb === 'fa') && (letFb === 'miss' || letFb === 'fa')
              const cls = feedback
                ? bothCorrect ? 'bg-emerald-500 border-emerald-400 text-white'
                  : bothWrong ? 'bg-rose-500 border-rose-400 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-500'
                : bothPressed
                  ? 'bg-violet-600 border-violet-600 text-white scale-95 shadow-inner'
                  : 'bg-white dark:bg-slate-800 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 active:scale-95'
              return (
                <button onClick={pressBoth} disabled={bothPressed || !!feedback}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all border-2 flex items-center justify-center gap-3 ${cls}`}>
                  <span>Both match</span>
                  <span className="text-xs font-normal opacity-70">Space or ↓</span>
                </button>
              )
            })()}
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
            <TrendingUp className="w-5 h-5 text-violet-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Block complete — {n}-back</h3>
          </div>
          <div className="space-y-3">
            <ScoreBar label="Position accuracy" hits={blockResult.score.posHits} misses={blockResult.score.posMisses} fas={blockResult.score.posFAs} />
            <ScoreBar label="Letter accuracy"   hits={blockResult.score.letHits} misses={blockResult.score.letMisses} fas={blockResult.score.letFAs} />
          </div>
          <div className="flex items-center justify-between text-sm pt-1">
            <span className="text-slate-500">Overall: <strong className="text-slate-700 dark:text-slate-200">{Math.round(blockResult.score.pctCorrect * 100)}%</strong></span>
            {blockResult.nextN !== n && (
              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${blockResult.nextN > n ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'}`}>
                {blockResult.nextN > n ? `↑ Level up → ${blockResult.nextN}-back` : `↓ Adjusting → ${blockResult.nextN}-back`}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={acceptNextN}
              className="py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-1.5">
              <Play className="w-4 h-4" /> Next block
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
