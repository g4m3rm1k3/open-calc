// Quick-access overlay — capture a note or check today's status without
// leaving whatever lesson/tool you're in. Full system building/AI-coach
// workflows live on the /compass page; this is the on-the-fly counterpart.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Compass, X, ExternalLink } from 'lucide-react'
import { useCompass } from './useCompass'
import { computeDailyWin, computeXp, xpToLevel } from './montyStatus'
import { useLearningTime, formatLearningTime } from './useLearningTime'
import { useProgress } from '../../hooks/useProgress.js'

export default function CompassQuickPanel({ onClose }: { onClose?: () => void }) {
  const compass = useCompass()
  const navigate = useNavigate()
  const [draft, setDraft] = useState('')

  const capture = () => {
    if (!draft.trim()) return
    compass.addNote({ content: draft.trim() })
    setDraft('')
  }

  const goFull = () => {
    onClose?.()
    navigate('/compass')
  }

  const win = computeDailyWin(compass.plans)
  const activePlans = compass.plans.filter((p) => p.status === 'active')
  const { progress } = useProgress() as unknown as { progress: Record<string, { quiz?: { correct: number }; completedCheckpoints?: string[] }> }
  const { level, xpInLevel } = xpToLevel(computeXp(progress))
  const learningMs = useLearningTime()

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[150] sm:w-80 max-h-[70vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <Compass size={15} className="text-emerald-400" /> Compass Quick
        </div>
        <div className="flex items-center gap-1">
          <button onClick={goFull} className="text-slate-500 hover:text-emerald-400 p-1" title="Open full dashboard">
            <ExternalLink size={14} />
          </button>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 p-1" title="Close">
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
        <span className="text-sky-400">Lv {level}</span>
        <span>{xpInLevel}/100 XP</span>
        <span className="text-slate-700">·</span>
        <span>{formatLearningTime(learningMs)}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {win.dueToday > 0 && (
          <div className={`rounded-xl p-2.5 text-xs font-bold ${win.won ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800/60 text-slate-300 border border-slate-700/60'}`}>
            {win.won ? '🏆 ' : '🎯 '}{win.doneToday}/{win.dueToday} done today{win.won ? ' — you won the day' : ''}
          </div>
        )}

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Quick capture a note..."
            rows={2}
            className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 resize-none outline-none"
          />
          <button onClick={capture} disabled={!draft.trim()} className="mt-1.5 text-xs font-semibold bg-emerald-600 text-white px-3 py-1 rounded-lg disabled:opacity-40 hover:bg-emerald-500">
            Save Note
          </button>
        </div>

        {activePlans.length > 0 ? (
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1.5">Active Plans</p>
            <ul className="space-y-1">
              {activePlans.map((p) => (
                <li key={p.id} className="text-xs text-slate-300 bg-slate-800/60 rounded-lg px-2 py-1.5">{p.title}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            No active plans yet —{' '}
            <button onClick={goFull} className="text-emerald-400 hover:underline">open the full dashboard</button> to start one.
          </p>
        )}
      </div>
    </div>
  )
}
