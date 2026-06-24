import { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import type { CompassSettings } from '../types'

type Phase = 'work' | 'break' | 'longBreak'

const PHASE_LABEL: Record<Phase, string> = { work: 'Focus', break: 'Short Break', longBreak: 'Long Break' }
const PHASE_COLOR: Record<Phase, string> = { work: 'text-sky-400', break: 'text-emerald-400', longBreak: 'text-violet-400' }

export default function PomodoroTimer({ settings }: { settings: CompassSettings }) {
  const [phase, setPhase] = useState<Phase>('work')
  const [secondsLeft, setSecondsLeft] = useState(settings.pomodoroWork * 60)
  const [running, setRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const phaseLength = (p: Phase) =>
    (p === 'work' ? settings.pomodoroWork : p === 'break' ? settings.pomodoroBreak : settings.pomodoroLongBreak) * 60

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1
        // Phase finished — work sessions count toward a long break every 4th cycle.
        if (phase === 'work') {
          const next = completedSessions + 1
          setCompletedSessions(next)
          const nextPhase: Phase = next % 4 === 0 ? 'longBreak' : 'break'
          setPhase(nextPhase)
          return phaseLength(nextPhase)
        }
        setPhase('work')
        return phaseLength('work')
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, completedSessions])

  const reset = () => {
    setRunning(false)
    setPhase('work')
    setCompletedSessions(0)
    setSecondsLeft(phaseLength('work'))
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const pct = 1 - secondsLeft / phaseLength(phase)

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center shadow-sm">
      <p className={`text-xs font-bold uppercase tracking-wide ${PHASE_COLOR[phase]}`}>{PHASE_LABEL[phase]}</p>
      <div className="text-5xl font-black text-slate-900 dark:text-slate-100 my-3 font-mono tracking-tight">{mm}:{ss}</div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-sky-500 transition-all" style={{ width: `${Math.round(pct * 100)}%` }} />
      </div>
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex items-center gap-1.5 text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white px-5 py-2 rounded-xl transition-all shadow-sm shadow-sky-500/20"
        >
          {running ? <Pause size={14} /> : <Play size={14} />} {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Reset">
          <RotateCcw size={15} />
        </button>
      </div>
      <p className="text-[10px] text-slate-500 mt-2">{completedSessions} session{completedSessions === 1 ? '' : 's'} completed today</p>
    </div>
  )
}
