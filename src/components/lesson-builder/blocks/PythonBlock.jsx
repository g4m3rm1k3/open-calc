import { useState } from 'react'
import BlockShell from '../BlockShell.jsx'

function CellEditor({ cell, onChange, onRemove }) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
        <span className="text-xs font-mono text-slate-400">{cell.id || 'cell'}</span>
        <input
          value={cell.id ?? ''}
          onChange={e => onChange({ ...cell, id: e.target.value })}
          placeholder="id (e.g. py1)"
          className="field font-mono text-xs py-0.5 w-24"
        />
        <input
          value={cell.cellTitle ?? ''}
          onChange={e => onChange({ ...cell, cellTitle: e.target.value })}
          placeholder="Cell title…"
          className="field text-sm py-0.5 flex-1"
        />
        <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600 shrink-0 ml-2">✕</button>
      </div>
      <label className="flex flex-col gap-1 p-3 border-b border-slate-100 dark:border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description / prose (shown above code)</span>
        <textarea
          value={cell.prose ?? ''}
          onChange={e => onChange({ ...cell, prose: e.target.value })}
          rows={2}
          placeholder="What this cell demonstrates…"
          className="field text-sm resize-none"
        />
      </label>
      <label className="flex flex-col gap-1 p-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Python code</span>
        <textarea
          value={cell.code ?? ''}
          onChange={e => onChange({ ...cell, code: e.target.value })}
          rows={12}
          placeholder="import numpy as np&#10;&#10;# Your code here…"
          className="field font-mono text-xs resize-y leading-relaxed"
          spellCheck={false}
        />
      </label>
    </div>
  )
}

export default function PythonBlock({ sec, dispatch, index, total, onMoveUp, onMoveDown, onRemove }) {
  const [editing, setEditing] = useState(false)
  const update = updates => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates })
  const updateCell = (i, updated) => { const cells = [...(sec.cells ?? [])]; cells[i] = updated; update({ cells }) }

  const preview = (
    <div className="space-y-3">
      {(sec.cells ?? []).map((cell, i) => (
        <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{cell.cellTitle || cell.id || `Cell ${i + 1}`}</span>
            <span className="ml-auto text-[10px] font-mono text-slate-400">{cell.id}</span>
          </div>
          {cell.prose && <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 italic border-b border-slate-100 dark:border-slate-800">{cell.prose}</p>}
          <pre className="px-3 py-2 text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-950/5 dark:bg-slate-950/40 overflow-x-auto max-h-32 overflow-y-auto">
            {(cell.code ?? '').slice(0, 300)}{(cell.code ?? '').length > 300 ? '\n…' : ''}
          </pre>
        </div>
      ))}
      {!sec.cells?.length && <p className="text-slate-300 dark:text-slate-600 italic text-sm">No cells yet…</p>}
    </div>
  )

  const editor = (
    <div className="space-y-4">
      {(sec.cells ?? []).map((cell, i) => (
        <CellEditor
          key={i}
          cell={cell}
          onChange={updated => updateCell(i, updated)}
          onRemove={() => update({ cells: (sec.cells ?? []).filter((_, j) => j !== i) })}
        />
      ))}
      <div className="flex gap-3">
        <button
          onClick={() => update({ cells: [...(sec.cells ?? []), { id: `py${(sec.cells?.length ?? 0) + 1}`, cellTitle: '', prose: '', code: '' }] })}
          className="px-3 py-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold border border-brand-200 rounded-lg"
        >
          + Add cell
        </button>
        <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">
          Done
        </button>
      </div>
    </div>
  )

  const ORIG_KEY_LABELS = {
    PythonNotebook: 'PythonNotebook',
    notebooks:      'Notebooks / Python',
    pythonLab:      'Python Lab',
    python:         'Python',
  }
  const label = ORIG_KEY_LABELS[sec._origKey] ?? 'Python'

  return (
    <BlockShell
      label={label} icon="🐍"
      index={index} total={total}
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove}
      isEditing={editing} onEdit={() => setEditing(true)}
    >
      {editing ? editor : preview}
    </BlockShell>
  )
}
