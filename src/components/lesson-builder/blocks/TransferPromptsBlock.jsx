import { useState, lazy, Suspense } from 'react'
import BlockShell from '../BlockShell.jsx'
import MarkdownEditButton from '../MarkdownEditButton.jsx'

const MarkdownCellEditor = lazy(() => import('./MarkdownCellEditor.jsx'))

const FIELDS = [
  { key: 'situation',              label: 'Situation',              placeholder: 'You are given a force of magnitude 10 N at 135°…' },
  { key: 'competingTechniques',    label: 'Competing Techniques',   placeholder: 'Guess from context vs. use the component formula…' },
  { key: 'whyThisTechniqueWins',   label: 'Why This Technique Wins', placeholder: 'The formula is exact and works for any angle; guessing only works for 0°, 90°…' },
]

function TransferEditor({ item, onChange, onRemove }) {
  const [editingField, setEditingField] = useState(null)
  return (
    <div className="border border-teal-200 dark:border-teal-900/40 rounded-xl p-4 space-y-3 bg-teal-50/50 dark:bg-teal-950/10">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide">Transfer prompt</span>
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
                title={`🚀 ${f.label}`}
              />
            </Suspense>
          )}
        </label>
      ))}
    </div>
  )
}

export default function TransferPromptsBlock({ sec, dispatch, index, total, onMoveUp, onMoveDown, onRemove }) {
  const [editing, setEditing] = useState(false)
  const update = updates => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates })

  const preview = (
    <div className="space-y-2">
      {(sec.items ?? []).map((item, i) => (
        <div key={i} className="rounded-lg border border-teal-200 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-950/10 p-3">
          <p className="text-sm text-teal-700 dark:text-teal-400 line-clamp-2">{item.situation || <span className="italic text-slate-400">No situation written</span>}</p>
        </div>
      ))}
      {!sec.items?.length && <p className="text-slate-300 dark:text-slate-600 italic text-sm">No transfer prompts yet…</p>}
    </div>
  )

  const editor = (
    <div className="space-y-4">
      {(sec.items ?? []).map((item, i) => (
        <TransferEditor
          key={i} item={item}
          onChange={updated => { const items = [...(sec.items ?? [])]; items[i] = updated; update({ items }) }}
          onRemove={() => update({ items: (sec.items ?? []).filter((_, j) => j !== i) })}
        />
      ))}
      <div className="flex gap-3">
        <button
          onClick={() => update({ items: [...(sec.items ?? []), { situation: '', competingTechniques: '', whyThisTechniqueWins: '' }] })}
          className="px-3 py-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold border border-brand-200 rounded-lg"
        >
          + Add transfer prompt
        </button>
        <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">Done</button>
      </div>
    </div>
  )

  return (
    <BlockShell label="Transfer Prompts" icon="🚀" index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove} isEditing={editing} onEdit={() => setEditing(true)}>
      {editing ? editor : preview}
    </BlockShell>
  )
}
