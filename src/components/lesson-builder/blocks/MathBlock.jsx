import { useMemo, useState, lazy, Suspense } from 'react'
import katex from 'katex'
import BlockShell from '../BlockShell.jsx'
import MarkdownEditButton from '../MarkdownEditButton.jsx'
import VisualizationBlock from './VisualizationBlock.jsx'

const MarkdownCellEditor = lazy(() => import('./MarkdownCellEditor.jsx'))

// Renders eq.tex live so a bad \frac or unbalanced brace shows up the moment
// it's typed, instead of a contributor finding out from a failed CI check
// after they've already opened a pull request.
function useTexRender(tex) {
  return useMemo(() => {
    if (!tex?.trim()) return { html: null, error: null }
    try {
      return { html: katex.renderToString(tex, { throwOnError: true, strict: false, trust: false }), error: null }
    } catch (error) {
      return { html: null, error: error.message }
    }
  }, [tex])
}

function EquationPreview({ tex }) {
  const { html, error } = useTexRender(tex)
  if (error) return <p className="text-xs text-red-500 font-mono">LaTeX error: {error}</p>
  if (html) return <div dangerouslySetInnerHTML={{ __html: html }} />
  return null
}

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
      <EquationPreview tex={eq.tex} />
    </div>
  )
}

export default function MathBlock({ sec, dispatch, index, total, onMoveUp, onMoveDown, onRemove, sectionId }) {
  const [editing, setEditing] = useState(false)
  const [editingProse, setEditingProse] = useState(false)
  const update = updates => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates })
  const proseText = (sec.prose ?? []).join('\n\n')
  const setProse = next => update({ prose: next.split(/\n{2,}/).map(s => s.trim()).filter(Boolean) })

  const preview = (
    <div className="space-y-3">
      {(sec.prose ?? []).map((p, i) => (
        <p key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{p}</p>
      ))}
      {(sec.equations ?? []).map((eq, i) => (
        <div key={i} className="rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-3">
          {eq.label && <p className="text-xs text-slate-400 mb-1">{eq.label}</p>}
          <EquationPreview tex={eq.tex} />
        </div>
      ))}
      {(sec.children ?? []).map((child, i) => (
        <VisualizationBlock
          key={child._id}
          child={child}
          sectionId={sectionId ?? sec._id}
          dispatch={dispatch}
          index={i}
          total={(sec.children ?? []).length}
        />
      ))}
      {!sec.prose?.length && !sec.equations?.length && !sec.children?.length && (
        <p className="text-slate-300 dark:text-slate-600 italic text-sm">Click to add math content…</p>
      )}
    </div>
  )

  const editor = (
    <div className="space-y-4">
      <label className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Prose — separate paragraphs with blank lines
          </span>
          <MarkdownEditButton onClick={() => setEditingProse(true)} />
        </div>
        <textarea
          value={proseText}
          onChange={e => setProse(e.target.value)}
          rows={6}
          className="field font-mono text-sm resize-y"
          placeholder="Formal mathematical prose…"
        />
      </label>
      {editingProse && (
        <Suspense fallback={<div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-950 text-slate-400">Loading editor…</div>}>
          <MarkdownCellEditor value={proseText} onChange={setProse} onClose={() => setEditingProse(false)} title="📐 Math Prose" />
        </Suspense>
      )}
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
      {/* Nested visualizations */}
      {(sec.children ?? []).length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Embedded Visualizations</span>
          {(sec.children ?? []).map((child, i) => (
            <VisualizationBlock
              key={child._id}
              child={child}
              sectionId={sectionId ?? sec._id}
              dispatch={dispatch}
              index={i}
              total={(sec.children ?? []).length}
            />
          ))}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">Done</button>
        <button
          onClick={() => dispatch({ type: 'ADD_CHILD', sectionId: sectionId ?? sec._id, vizId: 'PythonNotebook' })}
          className="px-3 py-1.5 text-sm text-brand-600 border border-brand-300 hover:bg-brand-50 rounded-lg font-semibold"
        >
          + Add Notebook
        </button>
      </div>
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
