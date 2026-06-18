import { useState } from 'react'
import BlockShell from '../BlockShell.jsx'

const CP_TYPES = ['read', 'lab', 'example', 'challenge']

export default function CheckpointsBlock({ sec, dispatch, index, total, onMoveUp, onMoveDown, onRemove }) {
  const [editing, setEditing] = useState(false)
  const update = updates => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates })
  const updateItem = (i, updated) => { const items = [...(sec.items ?? [])]; items[i] = updated; update({ items }) }

  const preview = (
    <div className="space-y-1">
      {(sec.items ?? []).map((cp, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">○</span>
          <span className="text-slate-700 dark:text-slate-300">{cp.label}</span>
          <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{cp.type}</span>
        </div>
      ))}
      {!sec.items?.length && <p className="text-slate-300 dark:text-slate-600 italic text-sm">No checkpoints yet…</p>}
    </div>
  )

  const editor = (
    <div className="space-y-3">
      {(sec.items ?? []).map((cp, i) => (
        <div key={i} className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50">
          <input
            value={cp.id ?? ''}
            onChange={e => updateItem(i, { ...cp, id: e.target.value })}
            placeholder="id (e.g. cp-intro)"
            className="field font-mono text-xs w-28 shrink-0"
          />
          <input
            value={cp.label ?? ''}
            onChange={e => updateItem(i, { ...cp, label: e.target.value })}
            placeholder="Checkpoint label"
            className="field text-sm flex-1"
          />
          <select
            value={cp.type ?? 'read'}
            onChange={e => updateItem(i, { ...cp, type: e.target.value })}
            className="field text-xs py-1 w-28 shrink-0"
          >
            {CP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={() => update({ items: (sec.items ?? []).filter((_, j) => j !== i) })} className="text-xs text-red-400 hover:text-red-600 shrink-0">✕</button>
        </div>
      ))}
      <div className="flex gap-3">
        <button
          onClick={() => update({ items: [...(sec.items ?? []), { id: `cp-${Date.now()}`, label: '', type: 'read' }] })}
          className="px-3 py-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold border border-brand-200 rounded-lg"
        >
          + Add checkpoint
        </button>
        <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">Done</button>
      </div>
    </div>
  )

  return (
    <BlockShell label="Checkpoints" icon="✅" index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove} isEditing={editing} onEdit={() => setEditing(true)}>
      {editing ? editor : preview}
    </BlockShell>
  )
}
