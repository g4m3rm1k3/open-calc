import { useState, lazy, Suspense } from 'react'
import BlockShell from '../BlockShell.jsx'
import MarkdownEditButton from '../MarkdownEditButton.jsx'

const MarkdownCellEditor = lazy(() => import('./MarkdownCellEditor.jsx'))

const FIELDS = [
  { key: 'falseBelief',           label: 'False Belief',             placeholder: 'What students incorrectly believe…' },
  { key: 'whyStudentsThinkIt',    label: 'Why Students Think It',    placeholder: 'The intuition or prior knowledge that leads to this error…' },
  { key: 'correctionExample',     label: 'Correction Example',       placeholder: 'A concrete worked example showing the correct approach…' },
  { key: 'contrastCase',          label: 'Contrast Case',            placeholder: 'A case where the wrong reasoning would actually work, to help students see the boundary…' },
]

function MiscEditor({ item, onChange, onRemove }) {
  const [editingField, setEditingField] = useState(null)
  return (
    <div className="border border-red-200 dark:border-red-900/40 rounded-xl p-4 space-y-3 bg-red-50/50 dark:bg-red-950/10">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Misconception</span>
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
                title={`⚠️ ${f.label}`}
              />
            </Suspense>
          )}
        </label>
      ))}
    </div>
  )
}

export default function MisconceptionsBlock({ sec, dispatch, index, total, onMoveUp, onMoveDown, onRemove }) {
  const [editing, setEditing] = useState(false)
  const update = updates => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates })

  const preview = (
    <div className="space-y-2">
      {(sec.items ?? []).map((item, i) => (
        <div key={i} className="rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/10 p-3">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400 line-clamp-2">{item.falseBelief || <span className="italic text-slate-400">No false belief written</span>}</p>
        </div>
      ))}
      {!sec.items?.length && <p className="text-slate-300 dark:text-slate-600 italic text-sm">No misconceptions yet…</p>}
    </div>
  )

  const editor = (
    <div className="space-y-4">
      {(sec.items ?? []).map((item, i) => (
        <MiscEditor
          key={i} item={item}
          onChange={updated => { const items = [...(sec.items ?? [])]; items[i] = updated; update({ items }) }}
          onRemove={() => update({ items: (sec.items ?? []).filter((_, j) => j !== i) })}
        />
      ))}
      <div className="flex gap-3">
        <button
          onClick={() => update({ items: [...(sec.items ?? []), { falseBelief: '', whyStudentsThinkIt: '', correctionExample: '', contrastCase: '' }] })}
          className="px-3 py-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold border border-brand-200 rounded-lg"
        >
          + Add misconception
        </button>
        <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">Done</button>
      </div>
    </div>
  )

  return (
    <BlockShell label="Misconceptions" icon="⚠️" index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove} isEditing={editing} onEdit={() => setEditing(true)}>
      {editing ? editor : preview}
    </BlockShell>
  )
}
