import { GitBranch, RotateCw } from 'lucide-react'
import type { HistorySnapshot } from '../types.js'

interface HistoryPanelProps {
  history: HistorySnapshot[]
  current: number
  onRestore: (idx: number) => void
  onBranch: (idx: number) => void
  onSnapshot: () => void
}

export function HistoryPanel({ history, current, onRestore, onBranch, onSnapshot }: HistoryPanelProps) {
  return (
    <div className="space-y-2">
      <button type="button" onClick={onSnapshot}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand-400/30 bg-brand-500/10 px-3 py-2 text-[11px] font-bold text-brand-700 transition-all hover:bg-brand-500/20 dark:text-brand-400">
        <GitBranch className="h-4 w-4" /> Save snapshot
      </button>
      {history.length === 0 && <div className="px-2 py-2 text-center text-[10px] font-semibold text-slate-400">No snapshots yet. Save one to track your experiments.</div>}
      {history.map((snap, idx) => (
        <div key={snap.id} className={`group rounded-lg border px-3 py-2 transition-all ${idx === current ? 'border-brand-400/50 bg-gradient-to-r from-brand-500/10 to-transparent shadow-md shadow-brand-500/10' : 'border-slate-200/50 bg-white/40 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'}`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`truncate text-[11px] font-bold ${idx === current ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>{snap.label}</span>
            <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button type="button" onClick={() => onRestore(idx)} title="Restore"
                className="rounded p-1 text-slate-400 hover:bg-brand-500/20 hover:text-brand-600 dark:hover:text-brand-400"><RotateCw className="h-3 w-3" /></button>
              <button type="button" onClick={() => onBranch(idx)} title="Branch from here"
                className="rounded p-1 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400"><GitBranch className="h-3 w-3" /></button>
            </div>
          </div>
          <div className="mt-1 font-mono text-[9px] font-semibold text-slate-400">{new Date(snap.at).toLocaleTimeString()}</div>
        </div>
      ))}
    </div>
  )
}
