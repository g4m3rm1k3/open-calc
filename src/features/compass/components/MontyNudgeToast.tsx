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
    <div className="w-72 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_8px_32px_rgba(6,182,212,0.15)] p-4 animate-in fade-in slide-in-from-right-8 duration-500 ease-out group relative overflow-hidden">
      {/* Subtle top glare */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      
      <div className="flex items-start gap-3 relative z-10">
        <div className="bg-cyan-500/20 p-1.5 rounded-lg shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
          <Sparkles size={16} className="text-cyan-400 animate-pulse" />
        </div>
        <p className="text-xs font-medium text-slate-200 leading-relaxed flex-1 mt-0.5">{nudge.message}</p>
        <button onClick={onDismiss} className="text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-md p-1 shrink-0 transition-colors" title="Dismiss">
          <X size={14} />
        </button>
      </div>
      <div className="flex justify-end gap-2 mt-3 relative z-10">
        <button onClick={onSnooze} className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-md px-2.5 py-1.5 transition-colors">
          Remind me in 30m
        </button>
        <button onClick={onDismiss} className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-md px-2.5 py-1.5 transition-colors shadow-sm">
          Got it
        </button>
      </div>
    </div>
  )
}
