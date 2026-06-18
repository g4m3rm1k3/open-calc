import { useState } from 'react'
import BlockShell from '../BlockShell.jsx'

function EquationEditor({ eq, onChange, onRemove }) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">Equation</span>
        <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600">✕</button>
      </div>
      <input
        value={eq.label ?? ''}
        onChange={e => onChange({ ...eq, label: e.target.value })}
        placeholder="Label (e.g. Definition 1.2)"
        className="field text-sm"
      />
      <textarea
        value={eq.tex ?? ''}
        onChange={e => onChange({ ...eq, tex: e.target.value })}
        placeholder="LaTeX, e.g. \vec{v} = \begin{bmatrix} x \\ y \end{bmatrix}"
        rows={2}
        className="field text-sm font-mono resize-none"
      />
    </div>
  )
}

export default function MathBlock({ sec, dispatch, index, total, onMoveUp, onMoveDown, onRemove }) {
  const [editing, setEditing] = useState(false)
  const update = updates => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates })

  const preview = (
    <div className="space-y-3">
      {(sec.prose ?? []).map((p, i) => (
        <p key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{p}</p>
      ))}
      {(sec.equations ?? []).map((eq, i) => (
        <div key={i} className="rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-3 font-mono text-sm">
          {eq.label && <p className="text-xs text-slate-400 mb-1">{eq.label}</p>}
          <code className="text-slate-700 dark:text-slate-200">{eq.tex}</code>
        </div>
      ))}
      {!sec.prose?.length && !sec.equations?.length && (
        <p className="text-slate-300 dark:text-slate-600 italic text-sm">Click to add math content…</p>
      )}
    </div>
  )

  const editor = (
    <div className="space-y-4">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Prose — separate paragraphs with blank lines
        </span>
        <textarea
          value={(sec.prose ?? []).join('\n\n')}
          onChange={e => update({ prose: e.target.value.split(/\n{2,}/).map(s => s.trim()).filter(Boolean) })}
          rows={6}
          className="field font-mono text-sm resize-y"
          placeholder="Formal mathematical prose…"
        />
      </label>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Equations</span>
          <button
            onClick={() => update({ equations: [...(sec.equations ?? []), { label: '', tex: '' }] })}
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
          >
            + Add equation
          </button>
        </div>
        {(sec.equations ?? []).map((eq, i) => (
          <EquationEditor
            key={i} eq={eq}
            onChange={updated => {
              const equations = [...(sec.equations ?? [])]
              equations[i] = updated
              update({ equations })
            }}
            onRemove={() => update({ equations: (sec.equations ?? []).filter((_, j) => j !== i) })}
          />
        ))}
      </div>
      <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">Done</button>
    </div>
  )

  return (
    <BlockShell
      label="Math" icon="📐"
      index={index} total={total}
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove}
      isEditing={editing} onEdit={() => setEditing(true)}
    >
      {editing ? editor : preview}
    </BlockShell>
  )
}
