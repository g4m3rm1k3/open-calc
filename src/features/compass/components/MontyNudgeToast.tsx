import { Sparkles, X } from 'lucide-react'
import type { Nudge } from '../montyNudge'

export default function MontyNudgeToast({
  nudge,
  onDismiss,
  onSnooze,
}: {
  nudge: Nudge
  onDismiss: () => void
  onSnooze: () => void
}) {
  return (
    <div className="w-72 bg-slate-900 border border-emerald-500/30 rounded-xl shadow-2xl p-3 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start gap-2">
        <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-200 leading-relaxed flex-1">{nudge.message}</p>
        <button onClick={onDismiss} className="text-slate-500 hover:text-slate-200 shrink-0" title="Dismiss">
          <X size={14} />
        </button>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onSnooze} className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 px-2 py-1">
          Remind me in 30m
        </button>
        <button onClick={onDismiss} className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-1">
          Got it
        </button>
      </div>
    </div>
  )
}
