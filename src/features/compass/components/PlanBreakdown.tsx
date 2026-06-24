import { useState } from 'react'
import { Clock, Calendar, Check, X, BookOpen } from 'lucide-react'
import type { ActionDraft } from '../playbooks'
import { METHODS } from '../methods'
import { matchCourses } from '../courseMatch'

export default function PlanBreakdown({
  title,
  initialDrafts,
  onConfirm,
  onCancel
}: {
  title: string
  initialDrafts: ActionDraft[]
  onConfirm: (title: string, drafts: ActionDraft[], reward?: string) => void
  onCancel: () => void
}) {
  const [drafts, setDrafts] = useState<ActionDraft[]>(initialDrafts)
  const [reward, setReward] = useState('')
  const courses = matchCourses(title)

  const handleConfirm = () => {
    onConfirm(title, drafts, reward.trim() || undefined)
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
      <h3 className="font-bold text-slate-900 dark:text-slate-200 mb-1">Proposed Breakdown: {title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Review and adjust the proposed actions before confirming.</p>

      {courses.length > 0 && (
        <div className="mb-5 bg-sky-500/5 border border-sky-500/20 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 uppercase tracking-wide mb-2">
            <BookOpen size={13} /> Already in this app
          </div>
          <div className="flex flex-wrap gap-2">
            {courses.map((c) => (
              <a key={c.key} href={`#${c.path}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-2.5 py-1 hover:border-sky-500/50 hover:text-sky-600 dark:hover:text-sky-300 shadow-sm transition-all">
                <span>{c.icon}</span> {c.label}
              </a>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Real courses already on this app, matched by name — not generated, not a guess.</p>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {drafts.map((draft, i) => (
          <div key={i} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-200">{draft.label}</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                {draft.cadence}
              </span>
            </div>

            {draft.why && (
              <p className="text-xs text-slate-400 mb-3 italic">"{draft.why}"</p>
            )}

            <div className="flex flex-wrap gap-2 text-xs">
              {draft.time && (
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg shadow-sm">
                  <Clock size={12} />
                  <input 
                    type="time" 
                    value={draft.time}
                    onChange={e => {
                      const newDrafts = [...drafts]
                      newDrafts[i].time = e.target.value
                      setDrafts(newDrafts)
                    }}
                    className="bg-transparent focus:outline-none"
                  />
                </div>
              )}
              {draft.durationMinutes && (
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg shadow-sm">
                  <span>⏳</span>
                  <input 
                    type="number" 
                    min="5" max="240" step="5"
                    value={draft.durationMinutes}
                    onChange={e => {
                      const newDrafts = [...drafts]
                      newDrafts[i].durationMinutes = parseInt(e.target.value)
                      setDrafts(newDrafts)
                    }}
                    className="bg-transparent w-10 focus:outline-none"
                  />
                  <span>min</span>
                </div>
              )}
            </div>

            {draft.methodIds && draft.methodIds.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800/50 flex flex-wrap gap-2">
                {draft.methodIds.map(mid => {
                  const m = METHODS[mid as keyof typeof METHODS]
                  if (!m) return null
                  return (
                    <span key={mid} title={m.description} className="text-[10px] text-sky-400 bg-sky-400/10 border border-sky-400/20 px-1.5 py-0.5 rounded cursor-help">
                      {m.title}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Reward Protocol (Optional)
        </label>
        <input 
          type="text" 
          value={reward}
          onChange={e => setReward(e.target.value)}
          placeholder="e.g., Buy that new video game, Take a weekend off"
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        />
        <p className="text-[10px] text-slate-500 mt-1">Pre-committing to a reward increases the completion rate.</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center gap-2 transition-colors">
          <X size={16} /> Cancel
        </button>
        <button 
          onClick={handleConfirm}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <Check size={16} /> Confirm & Schedule
        </button>
      </div>
    </div>
  )
}
