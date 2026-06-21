import { useState, lazy, Suspense } from 'react'
import BlockShell from '../BlockShell.jsx'
import MarkdownEditButton from '../MarkdownEditButton.jsx'

const MarkdownCellEditor = lazy(() => import('./MarkdownCellEditor.jsx'))

function ChallengeEditor({ ch, onChange, onRemove }) {
  const [editingProblem, setEditingProblem] = useState(false)
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center justify-between">
        <input
          value={ch.title ?? ''}
          onChange={e => onChange({ ...ch, title: e.target.value })}
          placeholder="Challenge title"
          className="field text-sm font-semibold flex-1 mr-3"
        />
        <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600 shrink-0">✕</button>
      </div>
      <label className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Problem</span>
          <MarkdownEditButton onClick={() => setEditingProblem(true)} />
        </div>
        <textarea value={ch.problem ?? ''} onChange={e => onChange({ ...ch, problem: e.target.value })} rows={3} className="field text-sm resize-none" placeholder="Problem statement…" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hint (optional)</span>
        <input value={ch.hint ?? ''} onChange={e => onChange({ ...ch, hint: e.target.value })} placeholder="Optional hint" className="field text-sm" />
      </label>
      {editingProblem && (
        <Suspense fallback={<div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-950 text-slate-400">Loading editor…</div>}>
          <MarkdownCellEditor
            value={ch.problem ?? ''}
            onChange={v => onChange({ ...ch, problem: v })}
            onClose={() => setEditingProblem(false)}
            title="🎯 Challenge Problem"
          />
        </Suspense>
      )}
    </div>
  )
}

export default function ChallengesBlock({ sec, dispatch, index, total, onMoveUp, onMoveDown, onRemove }) {
  const [editing, setEditing] = useState(false)
  const update = updates => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates })

  const preview = (
    <div className="space-y-2">
      {(sec.items ?? []).map((ch, i) => (
        <div key={i} className="rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-3">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ch.title}</p>
          {ch.problem && <p className="text-xs text-slate-500 mt-1">{ch.problem}</p>}
        </div>
      ))}
      {!sec.items?.length && <p className="text-slate-300 dark:text-slate-600 italic text-sm">No challenges yet…</p>}
    </div>
  )

  const editor = (
    <div className="space-y-4">
      {(sec.items ?? []).map((ch, i) => (
        <ChallengeEditor
          key={i} ch={ch}
          onChange={updated => { const items = [...(sec.items ?? [])]; items[i] = updated; update({ items }) }}
          onRemove={() => update({ items: (sec.items ?? []).filter((_, j) => j !== i) })}
        />
      ))}
      <div className="flex gap-3">
        <button
          onClick={() => update({ items: [...(sec.items ?? []), { title: `Challenge ${(sec.items?.length ?? 0) + 1}`, problem: '', hint: '' }] })}
          className="px-3 py-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold border border-brand-200 rounded-lg"
        >
          + Add challenge
        </button>
        <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">Done</button>
      </div>
    </div>
  )

  return (
    <BlockShell label="Challenges" icon="🎯" index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove} isEditing={editing} onEdit={() => setEditing(true)}>
      {editing ? editor : preview}
    </BlockShell>
  )
}
