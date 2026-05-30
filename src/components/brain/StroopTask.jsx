/**
 * StroopTask — Selective attention & cognitive flexibility.
 *
 * Research basis: Stroop (1935) JEP; MacLeod (1991) Psych Bull.
 * Naming the ink colour while suppressing automatic word-reading trains
 * executive attention and reduces interference over time.
 *
 * Mechanics:
 *   - A colour word (RED / BLUE / GREEN / YELLOW / PURPLE / ORANGE) shown
 *     in an ink colour that may or may not match the word
 *   - Congruent trial: word = ink   (easy — no conflict)
 *   - Incongruent trial: word ≠ ink (hard — word reading interferes)
 *   - User clicks the button matching the INK colour
 *   - Score: accuracy % + mean RT, split by trial type
 *   - "Interference" = incongruent RT − congruent RT
 *
 * localStorage key: oc-brain-stroop
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Zap, Play, Square, RotateCcw, Trophy, TrendingUp, Info, X } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────
const STORE_KEY   = 'oc-brain-stroop'
const FEEDBACK_MS = 650

const COLORS = [
  { name: 'Red',    hex: '#ef4444' },
  { name: 'Blue',   hex: '#3b82f6' },
  { name: 'Green',  hex: '#10b981' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Orange', hex: '#f97316' },
]

const BLOCK_LENGTHS = [20, 30]

const DIFFICULTY_LEVELS = [
  { label: 'Easy',   incongruentRatio: 0.3, numColors: 4 },
  { label: 'Medium', incongruentRatio: 0.55, numColors: 5 },
  { label: 'Hard',   incongruentRatio: 0.75, numColors: 6 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]

function generateTrial(diffIdx) {
  const { incongruentRatio, numColors } = DIFFICULTY_LEVELS[diffIdx]
  const active = COLORS.slice(0, numColors)
  const wordColor = rand(active)
  const isIncongruent = Math.random() < incongruentRatio
  const inkColor = isIncongruent
    ? rand(active.filter(c => c.name !== wordColor.name))
    : wordColor
  return { wordColor, inkColor, isIncongruent }
}

function loadStats() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) ?? { sessions: [], bestAcc: 0 } }
  catch { return { sessions: [], bestAcc: 0 } }
}
function saveStats(s) { localStorage.setItem(STORE_KEY, JSON.stringify(s)) }

function scoreBlock(history) {
  const cong   = history.filter(t => !t.isIncongruent)
  const incong = history.filter(t =>  t.isIncongruent)
  const accOf = (arr) => arr.length ? arr.filter(t => t.correct).length / arr.length : 1
  const rtOf  = (arr) => {
    const correct = arr.filter(t => t.correct && t.rt > 0)
    return correct.length ? Math.round(correct.reduce((s, t) => s + t.rt, 0) / correct.length) : 0
  }
  return {
    totalAcc:        history.filter(t => t.correct).length / history.length,
    congruentAcc:    accOf(cong),
    incongruentAcc:  accOf(incong),
    congruentRt:     rtOf(cong),
    incongruentRt:   rtOf(incong),
    interference:    rtOf(incong) - rtOf(cong),
  }
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
            <div className="w-full rounded-t bg-rose-400 dark:bg-rose-500"
              style={{ height: `${Math.max(6, (s.totalAcc ?? 0.5) * 48)}px` }}
              title={`${Math.round((s.totalAcc ?? 0) * 100)}%`} />
            <span className="text-[9px] text-slate-400 font-mono">{Math.round((s.totalAcc ?? 0) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tutorial ─────────────────────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    title: 'A coloured word appears',
    body: 'Each round you see a colour word — like "RED" or "GREEN" — printed in an ink colour that may or may not match. Your goal: identify the INK colour, not the word.',
    visual: () => (
      <div className="flex flex-col items-center gap-4">
        <p className="text-5xl font-black select-none" style={{ color: '#3b82f6' }}>RED</p>
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm text-center space-y-0.5">
          <p>Word says <strong className="text-rose-500">RED</strong></p>
          <p>Ink is <strong style={{ color: '#3b82f6' }}>Blue</strong></p>
          <p className="text-xs text-slate-400 italic">→ Correct answer: Blue</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Click the ink colour button',
    body: 'Coloured buttons appear below the word. Tap or click the one that matches the INK. Use keyboard keys 1–6 for extra speed.',
    visual: () => (
      <div className="space-y-4">
        <p className="text-5xl font-black text-center select-none" style={{ color: '#3b82f6' }}>RED</p>
        <div className="grid grid-cols-3 gap-2">
          {COLORS.slice(0, 6).map((c, i) => (
            <div key={c.name}
              className="py-2 rounded-xl text-white font-bold text-sm text-center transition-all"
              style={{ background: c.hex, outline: c.name === 'Blue' ? '3px solid white' : 'none',
                transform: c.name === 'Blue' ? 'scale(1.1)' : 'none', opacity: c.name === 'Blue' ? 1 : 0.5 }}>
              {c.name}
              <div className="text-[10px] font-normal opacity-80">key {i + 1}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-center text-slate-400">Blue is highlighted — that's the ink colour!</p>
      </div>
    ),
  },
  {
    title: 'Congruent vs incongruent trials',
    body: 'When word and ink match (congruent) it feels easy. When they clash (incongruent) your brain slows down — that gap is the Stroop effect. Training shrinks it.',
    visual: () => (
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-center space-y-2">
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Congruent ✓</p>
          <p className="text-3xl font-black" style={{ color: '#ef4444' }}>RED</p>
          <p className="text-xs text-slate-500">Word = ink → easy!</p>
        </div>
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-center space-y-2">
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Incongruent ✗</p>
          <p className="text-3xl font-black" style={{ color: '#3b82f6' }}>RED</p>
          <p className="text-xs text-slate-500">Word ≠ ink → hard!</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Your reaction time is tracked',
    body: 'The clock starts when the word appears. Fast AND accurate is the goal. After each block you see your interference score — how much the word slowed you down.',
    visual: () => (
      <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Congruent avg RT</span>
          <span className="font-mono font-bold">420 ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-rose-500 font-semibold">Incongruent avg RT</span>
          <span className="font-mono font-bold">650 ms</span>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Interference</span>
          <span className="font-mono font-bold text-rose-500">+230 ms</span>
        </div>
        <p className="text-xs text-slate-400 italic text-center">Elite performers show &lt; 80 ms interference</p>
      </div>
    ),
  },
  {
    title: 'Difficulty adjusts automatically',
    body: 'Start on Easy — mostly easy congruent trials. Score above 85% and the ratio of hard incongruent trials rises. Drop below 50% and it eases off. Stay in the challenge zone.',
    visual: () => (
      <div className="space-y-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
        {DIFFICULTY_LEVELS.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-16 text-sm font-semibold text-slate-700 dark:text-slate-300">{d.label}</span>
            <div className="flex-1 h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className="h-full bg-rose-400 rounded-full" style={{ width: `${d.incongruentRatio * 100}%` }} />
            </div>
            <span className="text-xs text-slate-400 w-12 text-right">{Math.round(d.incongruentRatio * 100)}% hard</span>
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
            <Zap className="w-5 h-5 text-rose-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">How to play</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 px-5 pb-3">
          {TUTORIAL_STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`rounded-full transition-all ${i === step ? 'w-5 h-2 bg-rose-500' : 'w-2 h-2 bg-slate-200 dark:bg-slate-700 hover:bg-rose-300'}`} />
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
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-colors">
              {isLast ? "Got it — let's focus! ⚡" : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StroopTask() {
  const [diffIdx,      setDiffIdx]      = useState(0)
  const [blockLen,     setBlockLen]     = useState(20)
  const [phase,        setPhase]        = useState('idle')   // idle | playing | result
  const [trial,        setTrial]        = useState(null)
  const [trialIdx,     setTrialIdx]     = useState(0)
  const [history,      setHistory]      = useState([])
  const [feedback,     setFeedback]     = useState(null)     // null | 'correct' | 'wrong'
  const [blockResult,  setBlockResult]  = useState(null)
  const [suggestDiff,  setSuggestDiff]  = useState(null)
  const [shuffledColors, setShuffledColors] = useState([])
  const [stats,        setStats]        = useState(loadStats)
  const [showInfo,     setShowInfo]     = useState(() => (loadStats().sessions?.length ?? 0) === 0)
  const timerRef     = useRef(null)
  const trialStartRef = useRef(null)
  // Refs to latest trial + history so the timeout closure always has fresh values
  const trialRef      = useRef(null)
  const historyRef    = useRef([])
  const trialIdxRef   = useRef(0)

  const activeColors = COLORS.slice(0, DIFFICULTY_LEVELS[diffIdx].numColors)

  const advanceToTrial = useCallback((newHistory, nextIdx, dIdx, bLen) => {
    if (nextIdx >= bLen) {
      const score = scoreBlock(newHistory)
      const saved = loadStats()
      saved.sessions = [...(saved.sessions ?? []), { ...score, date: new Date().toISOString() }]
      if (score.totalAcc > (saved.bestAcc ?? 0)) saved.bestAcc = score.totalAcc
      saveStats(saved)
      setStats(saved)
      // Suggest next difficulty
      let next = dIdx
      if (score.totalAcc >= 0.85 && dIdx < DIFFICULTY_LEVELS.length - 1) next = dIdx + 1
      else if (score.totalAcc <= 0.50 && dIdx > 0) next = dIdx - 1
      setSuggestDiff(next !== dIdx ? next : null)
      setBlockResult(score)
      setPhase('result')
      return
    }
    const t = generateTrial(dIdx)
    trialRef.current    = t
    historyRef.current  = newHistory
    trialIdxRef.current = nextIdx
    // Shuffle button order every trial so muscle memory can't form
    const cols = COLORS.slice(0, DIFFICULTY_LEVELS[dIdx].numColors)
    setShuffledColors([...cols].sort(() => Math.random() - 0.5))
    setTrial(t)
    setTrialIdx(nextIdx)
    setFeedback(null)
    trialStartRef.current = Date.now()
  }, [])

  const handleAnswer = useCallback((colorName) => {
    if (feedback !== null) return
    const t   = trialRef.current
    if (!t) return
    const rt      = Date.now() - trialStartRef.current
    const correct = colorName === t.inkColor.name
    const recorded = { ...t, correct, rt }
    setFeedback(correct ? 'correct' : 'wrong')

    timerRef.current = setTimeout(() => {
      const newHistory = [...historyRef.current, recorded]
      const nextIdx    = trialIdxRef.current + 1
      advanceToTrial(newHistory, nextIdx, diffIdx, blockLen)
    }, FEEDBACK_MS)
  }, [feedback, diffIdx, blockLen, advanceToTrial])

  // Keyboard: 1–N keys map to the current shuffled button order
  useEffect(() => {
    if (phase !== 'playing') return
    const handler = (e) => {
      const idx = parseInt(e.key) - 1
      if (idx >= 0 && idx < shuffledColors.length) handleAnswer(shuffledColors[idx].name)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, shuffledColors, handleAnswer])

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
          <Zap className="w-6 h-6 text-rose-500" />
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-200 text-lg leading-none">Stroop Task</h2>
            <p className="text-xs text-slate-400 mt-0.5">Attention control · Cognitive flexibility</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stats.sessions?.length > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400">
              <Trophy className="w-3.5 h-3.5" />
              Best: {Math.round((stats.bestAcc ?? 0) * 100)}%
            </div>
          )}
          <button onClick={() => setShowInfo(true)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
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
              <p className="text-xs text-slate-400">Controls % of incongruent trials</p>
            </div>
            <div className="flex gap-1.5">
              {DIFFICULTY_LEVELS.map((d, i) => (
                <button key={i} onClick={() => setDiffIdx(i)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${i === diffIdx ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
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
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${l === blockLen ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <button onClick={startBlock}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors">
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
              <div className="h-full bg-rose-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-slate-400 shrink-0">{trialIdx + 1}/{blockLen}</span>
            <span className="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-700">
              {DIFFICULTY_LEVELS[diffIdx].label}
            </span>
          </div>

          {/* Stimulus box */}
          <div className={`flex flex-col items-center justify-center rounded-2xl border-2 py-10 gap-3 transition-all ${
            feedback === 'correct' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400'
            : feedback === 'wrong' ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-400'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}>
            <p className="text-6xl font-black tracking-wide select-none" style={{ color: trial.inkColor.hex }}>
              {trial.wordColor.name.toUpperCase()}
            </p>
            {feedback !== null && (
              <p className={`text-sm font-semibold ${feedback === 'correct' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {feedback === 'correct' ? '✓ Correct!' : `✗ Ink was ${trial.inkColor.name}`}
              </p>
            )}
            {feedback !== null && (
              <p className="text-xs text-slate-400">{trial.isIncongruent ? 'incongruent trial' : 'congruent trial'}</p>
            )}
          </div>

          {/* Colour buttons — shuffled every trial so positions can't become habitual */}
          <div className="flex flex-wrap gap-2 justify-center">
            {shuffledColors.map((c, i) => (
              <button key={c.name} onClick={() => handleAnswer(c.name)}
                disabled={feedback !== null}
                className="flex-1 min-w-[80px] py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: c.hex }}>
                {c.name}
                <span className="block text-[10px] font-normal opacity-60">{i + 1}</span>
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
            <TrendingUp className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Block complete</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-center">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Congruent</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{Math.round(blockResult.congruentAcc * 100)}%</p>
              <p className="text-xs text-slate-400">{blockResult.congruentRt > 0 ? `${blockResult.congruentRt} ms avg` : '—'}</p>
            </div>
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-3 text-center">
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">Incongruent</p>
              <p className="text-2xl font-black text-rose-700 dark:text-rose-300">{Math.round(blockResult.incongruentAcc * 100)}%</p>
              <p className="text-xs text-slate-400">{blockResult.incongruentRt > 0 ? `${blockResult.incongruentRt} ms avg` : '—'}</p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 p-3 flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Stroop interference</span>
            <span className={`font-mono font-bold text-sm ${blockResult.interference > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {blockResult.interference > 0 ? '+' : ''}{blockResult.interference} ms
            </span>
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
                  suggestDiff > diffIdx
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}>
                Switch
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={startBlock}
              className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-1.5">
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
