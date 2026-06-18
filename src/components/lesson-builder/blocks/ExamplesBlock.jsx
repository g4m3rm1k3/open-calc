import { useState } from 'react'
import BlockShell from '../BlockShell.jsx'

function ExampleEditor({ ex, onChange, onRemove }) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center justify-between">
        <input
          value={ex.title ?? ''}
          onChange={e => onChange({ ...ex, title: e.target.value })}
          placeholder="Example title"
          className="field text-sm font-semibold flex-1 mr-3"
        />
        <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600 shrink-0">✕ Remove</button>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Problem</span>
        <textarea
          value={ex.problem ?? ''}
          onChange={e => onChange({ ...ex, problem: e.target.value })}
          rows={2}
          placeholder="State the problem…"
          className="field text-sm resize-none"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Steps — one per line (or keep as-is for rich format)</span>
        <textarea
          value={(ex.steps ?? []).map(s => typeof s === 'string' ? s : (s.strategyTitle ? `${s.strategyTitle}: ${s.expression}` : s.expression ?? '')).join('\n')}
          onChange={e => onChange({ ...ex, steps: e.target.value.split('\n') })}
          rows={4}
          placeholder="Step 1: …&#10;Step 2: …"
          className="field text-sm font-mono resize-y"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Answer</span>
        <input
          value={ex.answer ?? ''}
          onChange={e => onChange({ ...ex, answer: e.target.value })}
          placeholder="Final answer"
          className="field text-sm"
        />
      </label>
    </div>
  )
}

export default function ExamplesBlock({ sec, dispatch, index, total, onMoveUp, onMoveDown, onRemove }) {
  const [editing, setEditing] = useState(false)
  const update = updates => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates })

  const preview = (
    <div className="space-y-3">
      {(sec.items ?? []).map((ex, i) => (
        <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{ex.title}</p>
          {ex.problem && <p className="text-xs text-slate-500 mb-2 italic">{ex.problem}</p>}
          {ex.steps?.length > 0 && (
            <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-decimal pl-4">
              {ex.steps.filter(Boolean).map((s, j) => (
                <li key={j}>
                  {typeof s === 'string' ? s : (s.strategyTitle || s.expression || JSON.stringify(s))}
                </li>
              ))}
            </ol>
          )}
          {ex.answer && <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-2">→ {ex.answer}</p>}
        </div>
      ))}
      {!sec.items?.length && <p className="text-slate-300 dark:text-slate-600 italic text-sm">No examples yet…</p>}
    </div>
  )

  const editor = (
    <div className="space-y-4">
      {(sec.items ?? []).map((ex, i) => (
        <ExampleEditor
          key={i} ex={ex}
          onChange={updated => {
            const items = [...(sec.items ?? [])]
            items[i] = updated
            update({ items })
          }}
          onRemove={() => update({ items: (sec.items ?? []).filter((_, j) => j !== i) })}
        />
      ))}
      <div className="flex gap-3">
        <button
          onClick={() => update({ items: [...(sec.items ?? []), { title: `Example ${(sec.items?.length ?? 0) + 1}`, problem: '', steps: [''], answer: '' }] })}
          className="px-3 py-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold border border-brand-200 rounded-lg"
        >
          + Add example
        </button>
        <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">
          Done
        </button>
      </div>
    </div>
  )

  return (
    <BlockShell
      label="Examples" icon="✏️"
      index={index} total={total}
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove}
      isEditing={editing} onEdit={() => setEditing(true)}
    >
      {editing ? editor : preview}
    </BlockShell>
  )
}
