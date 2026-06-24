import { useState, lazy, Suspense } from 'react'
import BlockShell from '../BlockShell.jsx'
import MarkdownEditButton from '../MarkdownEditButton.jsx'

const MarkdownCellEditor = lazy(() => import('./MarkdownCellEditor.jsx'))

const FIELDS = [
  { key: 'commonError',    label: 'Common Error',    placeholder: 'Computing ||[3,4]|| = 3 + 4 = 7 instead of sqrt(9+16) = 5…' },
  { key: 'symptom',        label: 'Symptom',         placeholder: 'The answer is too large and doesn\'t match the visual…' },
  { key: 'whyItHappened',  label: 'Why It Happened', placeholder: 'Students forget to square before adding — the formula requires squaring…' },
  { key: 'repairStrategy', label: 'Repair Strategy', placeholder: 'Write the formula explicitly first: sqrt((__)^2 + (__)^2). Fill blanks, square, sum, root…' },
]

function DebugEditor({ item, onChange, onRemove }) {
  const [editingField, setEditingField] = useState(null)
  return (
    <div className="border border-orange-200 dark:border-orange-900/40 rounded-xl p-4 space-y-3 bg-orange-50/50 dark:bg-orange-950/10">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">Debug entry</span>
        <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600">✕ Remove</button>
      </div>
      {FIELDS.map(f => (
        <label key={f.key} className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{f.label}</span>
            <MarkdownEditButton onClick={() => setEditingField(f.key)} />
          </div>
          <textarea
            value={item[f.key] ?? ''}
            onChange={e => onChange({ ...item, [f.key]: e.target.value })}
            rows={2}
            placeholder={f.placeholder}
            className="field text-sm resize-y"
          />
          {editingField === f.key && (
            <Suspense fallback={null}>
              <MarkdownCellEditor
                value={item[f.key] ?? ''}
                onChange={v => { onChange({ ...item, [f.key]: v }); setEditingField(null) }}
                onClose={() => setEditingField(null)}
                title={`🐛 ${f.label}`}
              />
            </Suspense>
          )}
        </label>
      ))}
    </div>
  )
}

export default function DebuggingBlock({ sec, dispatch, index, total, onMoveUp, onMoveDown, onRemove }) {
  const [editing, setEditing] = useState(false)
  const update = updates => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates })

  const preview = (
    <div className="space-y-2">
      {(sec.items ?? []).map((item, i) => (
        <div key={i} className="rounded-lg border border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/10 p-3">
          <p className="text-sm font-mono text-orange-700 dark:text-orange-400 line-clamp-2">{item.commonError || <span className="italic text-slate-400 font-sans">No error written</span>}</p>
        </div>
      ))}
      {!sec.items?.length && <p className="text-slate-300 dark:text-slate-600 italic text-sm">No debugging entries yet…</p>}
    </div>
  )

  const editor = (
    <div className="space-y-4">
      {(sec.items ?? []).map((item, i) => (
        <DebugEditor
          key={i} item={item}
          onChange={updated => { const items = [...(sec.items ?? [])]; items[i] = updated; update({ items }) }}
          onRemove={() => update({ items: (sec.items ?? []).filter((_, j) => j !== i) })}
        />
      ))}
      <div className="flex gap-3">
        <button
          onClick={() => update({ items: [...(sec.items ?? []), { commonError: '', symptom: '', whyItHappened: '', repairStrategy: '' }] })}
          className="px-3 py-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold border border-brand-200 rounded-lg"
        >
          + Add debug entry
        </button>
        <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">Done</button>
      </div>
    </div>
  )

  return (
    <BlockShell label="Debugging" icon="🐛" index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove} isEditing={editing} onEdit={() => setEditing(true)}>
      {editing ? editor : preview}
    </BlockShell>
  )
}
