import { useState, lazy, Suspense } from 'react'
import BlockShell from '../BlockShell.jsx'
import MarkdownEditButton from '../MarkdownEditButton.jsx'

const MarkdownCellEditor = lazy(() => import('./MarkdownCellEditor.jsx'))

// Editor for the top-level `mentalModel` lesson field (array of short
// statements) — present in ~640 lesson files but previously only visible
// read-only in BuilderCanvas's PassthroughPanel, with no way to edit it.
// A top-level field like `hook`/`meta`, not a reorderable section, so no
// move/remove-block controls — just add/remove/reorder its own lines.
export default function MentalModelBlock({ mentalModel, dispatch }) {
  const [editing, setEditing] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const items = mentalModel ?? []
  const set = next => dispatch({ type: 'SET_MENTAL_MODEL', value: next })

  const updateItem = (i, value) => { const next = [...items]; next[i] = value; set(next) }
  const removeItem = i => set(items.filter((_, j) => j !== i))
  const addItem = () => set([...items, ''])
  const moveItem = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    set(next)
  }

  const preview = (
    <ul className="space-y-1.5 list-disc pl-5">
      {items.map((m, i) => (
        <li key={i} className="text-sm text-slate-700 dark:text-slate-300">{m || <span className="italic text-slate-300 dark:text-slate-600">empty</span>}</li>
      ))}
      {!items.length && <p className="text-slate-300 dark:text-slate-600 italic text-sm list-none">No mental model statements yet…</p>}
    </ul>
  )

  const editor = (
    <div className="space-y-3">
      {editingIndex !== null && (
        <Suspense fallback={null}>
          <MarkdownCellEditor
            value={items[editingIndex] ?? ''}
            onChange={v => { updateItem(editingIndex, v) }}
            onClose={() => setEditingIndex(null)}
            title="🧩 Mental Model Statement"
          />
        </Suspense>
      )}
      {items.map((m, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Statement {i + 1}</span>
              <MarkdownEditButton onClick={() => setEditingIndex(i)} />
            </div>
            <textarea
              value={m}
              onChange={e => updateItem(i, e.target.value)}
              rows={2}
              placeholder="A short statement the learner should walk away believing…"
              className="field text-sm resize-y"
            />
          </div>
          <div className="flex flex-col gap-0.5 shrink-0 pt-6">
            <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="px-1.5 text-xs text-slate-400 hover:text-slate-700 disabled:opacity-20">↑</button>
            <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className="px-1.5 text-xs text-slate-400 hover:text-slate-700 disabled:opacity-20">↓</button>
          </div>
          <button onClick={() => removeItem(i)} className="px-1.5 text-xs text-red-400 hover:text-red-600 shrink-0 pt-1.5">✕</button>
        </div>
      ))}
      <div className="flex gap-3">
        <button onClick={addItem} className="px-3 py-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold border border-brand-200 rounded-lg">
          + Add statement
        </button>
        <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">Done</button>
      </div>
    </div>
  )

  return (
    <BlockShell label="Mental Model" icon="🧩" rigid isEditing={editing} onEdit={() => setEditing(true)}>
      <div onClick={!editing ? () => setEditing(true) : undefined} className={!editing ? 'cursor-pointer' : ''}>
        {editing ? editor : preview}
      </div>
    </BlockShell>
  )
}
