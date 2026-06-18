import { useState } from 'react'

// Cell editor for PythonNotebook initialCells
function CellEditor({ cell, onChange, onRemove }) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
        <input
          value={cell.id ?? ''}
          onChange={e => onChange({ ...cell, id: e.target.value })}
          placeholder="id (e.g. 1)"
          className="field font-mono text-xs py-0.5 w-20"
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
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Prose (shown above code)</span>
        <textarea
          value={cell.prose ?? ''}
          onChange={e => onChange({ ...cell, prose: e.target.value })}
          rows={2}
          placeholder="What this cell demonstrates…"
          className="field text-sm resize-none"
        />
      </label>
      {cell.instructions != null && (
        <label className="flex flex-col gap-1 p-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Instructions</span>
          <textarea
            value={cell.instructions ?? ''}
            onChange={e => onChange({ ...cell, instructions: e.target.value })}
            rows={2}
            className="field text-sm resize-none"
          />
        </label>
      )}
      <label className="flex flex-col gap-1 p-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Python code</span>
        <textarea
          value={cell.code ?? ''}
          onChange={e => onChange({ ...cell, code: e.target.value })}
          rows={10}
          placeholder="import numpy as np&#10;&#10;# Your code here…"
          className="field font-mono text-xs resize-y leading-relaxed"
          spellCheck={false}
        />
      </label>
    </div>
  )
}

function NotebookCellsEditor({ cells, onChange }) {
  const updateCell = (i, updated) => {
    const next = [...cells]
    next[i] = updated
    onChange(next)
  }
  const removeCell = i => onChange(cells.filter((_, j) => j !== i))
  const addCell = () => onChange([
    ...cells,
    { id: cells.length + 1, cellTitle: '', prose: '', code: '', output: '', status: 'idle', figureJson: null },
  ])

  return (
    <div className="space-y-3">
      {cells.map((cell, i) => (
        <CellEditor
          key={i}
          cell={cell}
          onChange={updated => updateCell(i, updated)}
          onRemove={() => removeCell(i)}
        />
      ))}
      <button
        onClick={addCell}
        className="px-3 py-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold border border-brand-200 rounded-lg"
      >
        + Add cell
      </button>
    </div>
  )
}

export default function VisualizationBlock({ child, sectionId, dispatch, index, total }) {
  const [expanded, setExpanded] = useState(false)
  const [editingMeta, setEditingMeta] = useState(false)

  const updateChild = updates => dispatch({ type: 'UPDATE_CHILD', sectionId, childId: child._id, updates })
  const cells = child.props?.initialCells ?? []

  const isPythonNotebook = child.vizId === 'PythonNotebook'

  return (
    <div className="rounded-xl border border-brand-200 dark:border-brand-800 overflow-hidden bg-brand-50/30 dark:bg-brand-950/20">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-brand-50 dark:bg-brand-900/30 border-b border-brand-200 dark:border-brand-800">
        <span className="text-sm">🔭</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
          {child.vizId || 'Visualization'}
        </span>
        {isPythonNotebook && (
          <span className="text-[10px] text-slate-400 font-mono ml-1">🐍 {cells.length} cells</span>
        )}
        {child.title && <span className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1">{child.title}</span>}

        <div className="ml-auto flex items-center gap-1">
          {index > 0 && (
            <button
              onClick={() => dispatch({ type: 'MOVE_CHILD_UP', sectionId, childId: child._id })}
              className="text-xs text-slate-400 hover:text-slate-600 px-1"
              title="Move up"
            >↑</button>
          )}
          {index < total - 1 && (
            <button
              onClick={() => dispatch({ type: 'MOVE_CHILD_DOWN', sectionId, childId: child._id })}
              className="text-xs text-slate-400 hover:text-slate-600 px-1"
              title="Move down"
            >↓</button>
          )}
          {isPythonNotebook && (
            <button
              onClick={() => dispatch({ type: 'EJECT_CHILD', sectionId, childId: child._id })}
              className="text-[10px] font-semibold text-amber-600 hover:text-amber-700 border border-amber-300 rounded px-1.5 py-0.5"
              title="Eject to top-level Python section"
            >↑ Eject</button>
          )}
          <button
            onClick={() => setEditingMeta(e => !e)}
            className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 border border-slate-300 rounded px-1.5 py-0.5"
          >{editingMeta ? 'Done' : 'Meta'}</button>
          <button
            onClick={() => {
              if (window.confirm(`Remove ${child.vizId || 'visualization'}?`))
                dispatch({ type: 'REMOVE_CHILD', sectionId, childId: child._id })
            }}
            className="text-xs text-red-400 hover:text-red-600 px-1"
          >✕</button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs text-slate-500 hover:text-slate-700 px-1.5 font-mono"
          >{expanded ? '▲' : '▼'}</button>
        </div>
      </div>

      {/* Meta editor (vizId, title, caption, mathBridge) */}
      {editingMeta && (
        <div className="px-4 py-3 space-y-2 border-b border-brand-100 dark:border-brand-900">
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Viz ID</span>
              <input
                value={child.vizId}
                onChange={e => updateChild({ vizId: e.target.value })}
                className="field text-sm font-mono"
                placeholder="PythonNotebook"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Title</span>
              <input
                value={child.title}
                onChange={e => updateChild({ title: e.target.value })}
                className="field text-sm"
                placeholder="Chapter 1 — Lab Tour"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Caption</span>
            <input
              value={child.caption}
              onChange={e => updateChild({ caption: e.target.value })}
              className="field text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Math bridge</span>
            <textarea
              value={child.mathBridge}
              onChange={e => updateChild({ mathBridge: e.target.value })}
              rows={2}
              className="field text-sm resize-none"
              placeholder="Connects the math to the code…"
            />
          </label>
        </div>
      )}

      {/* Expandable content */}
      {expanded && (
        <div className="px-4 py-4">
          {isPythonNotebook ? (
            <NotebookCellsEditor
              cells={cells}
              onChange={next => updateChild({ props: { ...child.props, initialCells: next } })}
            />
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 mb-2">
                Editing props for <span className="font-mono text-brand-500">{child.vizId}</span> — raw JSON
              </p>
              <textarea
                value={JSON.stringify(child.props, null, 2)}
                onChange={e => {
                  try { updateChild({ props: JSON.parse(e.target.value) }) } catch {}
                }}
                rows={10}
                className="field font-mono text-xs resize-y"
                spellCheck={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
