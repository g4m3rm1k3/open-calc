import { useState } from 'react'
import { Check, XCircle, SkipForward, CheckCircle2, ChevronDown, ChevronRight, Trophy } from 'lucide-react'
import type { Plan, PlanAction, ActionOutcome } from '../types'
import { METHODS } from '../methods'

export default function PlanCard({ 
  plan, 
  onDelete, 
  onLog, 
  onComplete, 
  onCompleteWithNote 
}: { 
  plan: Plan
  onDelete: (id: string) => void
  onLog: (planId: string, actionId: string, outcome: ActionOutcome, blocker?: string) => void
  onComplete: (id: string) => void
  onCompleteWithNote: (planId: string, actionId: string, note: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  
  const today = new Date().toISOString().split('T')[0]
  const d = new Date()
  const day = d.getDay()

  const allOnceDone = plan.actions.filter(a => a.cadence === 'once').every(a => a.status === 'done')
  const hasRecurring = plan.actions.some(a => a.cadence !== 'once')
  
  // If a plan is just a sequence of 'once' actions and they are all done, the plan is complete
  const canMarkComplete = plan.status !== 'completed' && (!hasRecurring && allOnceDone)

  return (
    <div className={`bg-slate-900 border rounded-xl overflow-hidden transition-colors ${plan.status === 'completed' ? 'border-emerald-500/50' : 'border-slate-800'}`}>
      <div className="p-4 flex items-start justify-between group">
        <div>
          <h3 className="font-bold text-slate-200 text-lg flex items-center gap-2">
            {plan.status === 'completed' && <Trophy size={16} className="text-emerald-400" />}
            <span className={plan.status === 'completed' ? 'line-through text-slate-500' : ''}>{plan.title}</span>
          </h3>
          {plan.focus && <p className="text-xs font-semibold text-emerald-500 mt-1">Narrowed to: {plan.focus}</p>}
        </div>
        
        <div className="flex items-center gap-2">
          {canMarkComplete && (
            <button onClick={() => onComplete(plan.id)} className="text-xs font-bold text-emerald-950 bg-emerald-500 px-2 py-1 rounded hover:bg-emerald-400 transition-colors">
              Mark Complete
            </button>
          )}
          <button onClick={() => setExpanded(!expanded)} className="p-1 text-slate-500 hover:text-slate-300">
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          <button onClick={() => onDelete(plan.id)} className="p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
            ✕
          </button>
        </div>
      </div>

      {plan.status === 'completed' && plan.reward && (
        <div className="px-4 pb-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm text-emerald-400">
            <strong>Reward Earned:</strong> {plan.reward}
          </div>
        </div>
      )}

      {expanded && plan.status !== 'completed' && (
        <div className="px-4 pb-4 space-y-4">
          {plan.actions.map(action => {
            const isDueToday = 
              action.cadence === 'daily' || 
              (action.cadence === 'weekdays' && day !== 0 && day !== 6) ||
              (action.cadence === 'once' && action.status !== 'done') ||
              (action.cadence === 'weekly' && action.calendarEventIds.length > 0) // Approximation

            const loggedToday = action.log.find(l => l.date === today)

            return (
              <div key={action.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${action.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {action.label}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                      {action.cadence}
                    </span>
                  </div>
                  
                  {isDueToday && !loggedToday && action.status !== 'done' && (
                    <div className="flex items-center gap-1">
                      <ActionCheckIn action={action} onLog={(outcome, blocker, note) => {
                        if (note) onCompleteWithNote(plan.id, action.id, note)
                        else onLog(plan.id, action.id, outcome, blocker)
                      }} />
                    </div>
                  )}

                  {loggedToday && (
                    <span className={`text-xs font-bold flex items-center gap-1 ${
                      loggedToday.outcome === 'done' ? 'text-emerald-500' :
                      loggedToday.outcome === 'blocked' ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {loggedToday.outcome === 'done' && <CheckCircle2 size={14} />}
                      {loggedToday.outcome === 'blocked' && <XCircle size={14} />}
                      {loggedToday.outcome === 'skipped' && <SkipForward size={14} />}
                      {loggedToday.outcome.toUpperCase()} TODAY
                    </span>
                  )}
                </div>

                {action.why && <p className="text-xs text-slate-400 mb-2 italic">"{action.why}"</p>}

                {action.methodIds && action.methodIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-800/50">
                    {action.methodIds.map(mid => {
                      const m = METHODS[mid as keyof typeof METHODS]
                      if (!m) return null
                      return <span key={mid} title={m.description} className="text-[10px] text-sky-400 bg-sky-400/10 border border-sky-400/20 px-1.5 py-0.5 rounded cursor-help">{m.title}</span>
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ActionCheckIn({ action, onLog }: { action: PlanAction, onLog: (outcome: ActionOutcome, blocker?: string, note?: string) => void }) {
  const [mode, setMode] = useState<'buttons' | 'blocker' | 'note'>('buttons')
  const [text, setText] = useState('')

  if (mode === 'note') {
    return (
      <div className="flex items-center gap-2 w-64">
        <input 
          autoFocus
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={action.requiresNote}
          className="flex-1 bg-slate-900 border border-emerald-500/50 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
          onKeyDown={e => {
            if (e.key === 'Enter' && text.trim()) {
              onLog('done', undefined, text.trim())
            }
          }}
        />
        <button onClick={() => setMode('buttons')} className="text-slate-500 hover:text-slate-300"><XCircle size={14} /></button>
      </div>
    )
  }

  if (mode === 'blocker') {
    return (
      <div className="flex items-center gap-2 w-64">
        <input 
          autoFocus
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="What stopped you?"
          className="flex-1 bg-slate-900 border border-red-500/50 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500"
          onKeyDown={e => {
            if (e.key === 'Enter' && text.trim()) {
              onLog('blocked', text.trim())
            }
          }}
        />
        <button onClick={() => setMode('buttons')} className="text-slate-500 hover:text-slate-300"><XCircle size={14} /></button>
      </div>
    )
  }

  return (
    <>
      <button 
        onClick={() => action.requiresNote ? setMode('note') : onLog('done')}
        className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded transition-colors"
        title="Mark Done"
      ><Check size={16} /></button>
      <button 
        onClick={() => setMode('blocker')}
        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
        title="Blocked"
      ><XCircle size={16} /></button>
      <button 
        onClick={() => onLog('skipped')}
        className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors"
        title="Skip Today"
      ><SkipForward size={16} /></button>
    </>
  )
}
