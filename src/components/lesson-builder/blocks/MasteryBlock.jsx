import { useState, lazy, Suspense } from 'react'
import BlockShell from '../BlockShell.jsx'
import MarkdownEditButton from '../MarkdownEditButton.jsx'

const MarkdownCellEditor = lazy(() => import('./MarkdownCellEditor.jsx'))

const FIELDS = [
  { key: 'solveIndependently',       label: 'Solve Independently',        icon: '✍️', placeholder: 'Compute X without referring to a formula sheet…' },
  { key: 'explainVerbally',          label: 'Explain Verbally',           icon: '💬', placeholder: 'Explain why X works and what breaks without it…' },
  { key: 'detectIncorrectApplication', label: 'Detect Incorrect Application', icon: '🔍', placeholder: 'Identify when X has been applied incorrectly…' },
  { key: 'transferToUnfamiliar',     label: 'Transfer to Unfamiliar',     icon: '🚀', placeholder: 'Apply X in a context not seen in the lesson…' },
]

export default function MasteryBlock({ sec, dispatch, index, total, onMoveUp, onMoveDown, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const update = (key, value) => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates: { [key]: value } })

  const preview = (
    <div className="space-y-2">
      {sec.targetLevel != null && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold">Target level:</span>
          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{sec.targetLevel}</span>
        </div>
      )}
      {FIELDS.filter(f => sec[f.key]).map(f => (
        <div key={f.key} className="text-xs">
          <span className="font-semibold text-slate-500">{f.icon} {f.label}:</span>
          <p className="text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">{sec[f.key]}</p>
        </div>
      ))}
      {!FIELDS.some(f => sec[f.key]) && (
        <p className="text-slate-300 dark:text-slate-600 italic text-sm">No mastery criteria yet…</p>
      )}
    </div>
  )

  const editor = (
    <div className="space-y-4">
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Target level (1–4)</span>
        <input
          type="number" min={1} max={4}
          value={sec.targetLevel ?? 1}
          onChange={e => update('targetLevel', Number(e.target.value))}
          className="field w-24"
        />
      </label>
      {FIELDS.map(f => (
        <label key={f.key} className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{f.icon} {f.label}</span>
            <MarkdownEditButton onClick={() => setEditingField(f.key)} />
          </div>
          <textarea
            value={sec[f.key] ?? ''}
            onChange={e => update(f.key, e.target.value)}
            rows={2}
            placeholder={f.placeholder}
            className="field text-sm resize-y"
          />
          {editingField === f.key && (
            <Suspense fallback={null}>
              <MarkdownCellEditor
                value={sec[f.key] ?? ''}
                onChange={v => { update(f.key, v); setEditingField(null) }}
                onClose={() => setEditingField(null)}
                title={`🎓 ${f.label}`}
              />
            </Suspense>
          )}
        </label>
      ))}
      <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">Done</button>
    </div>
  )

  return (
    <BlockShell label="Mastery" icon="🎓" index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove} isEditing={editing} onEdit={() => setEditing(true)}>
      {editing ? editor : preview}
    </BlockShell>
  )
}
