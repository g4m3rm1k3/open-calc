import { useState, useMemo, lazy, Suspense } from 'react'
import katex from 'katex'
import BlockShell from '../BlockShell.jsx'
import MarkdownEditButton from '../MarkdownEditButton.jsx'

const MarkdownCellEditor = lazy(() => import('./MarkdownCellEditor.jsx'))

function useTexRender(tex) {
  return useMemo(() => {
    if (!tex?.trim()) return { html: null, error: null }
    try {
      return { html: katex.renderToString(tex, { throwOnError: true, strict: false, trust: false }), error: null }
    } catch (e) {
      return { html: null, error: e.message }
    }
  }, [tex])
}

// Normalize a step to the rich object format. Plain strings become {expression: str}.
function toRichStep(s) {
  if (typeof s === 'string') return { expression: s, annotation: '', strategyTitle: '', hints: [] }
  return s
}

function StepEditor({ step, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast, index }) {
  const [open, setOpen] = useState(false)
  const [editingAnnotation, setEditingAnnotation] = useState(false)
  const rich = toRichStep(step)
  const { html, error } = useTexRender(rich.expression)

  return (
    <div className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
      <div className="flex items-center gap-1 px-3 py-2 bg-slate-50 dark:bg-slate-700/50">
        <span className="font-mono text-[10px] text-slate-400 w-5 shrink-0">{index + 1}.</span>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex-1 text-left text-sm font-medium text-slate-700 dark:text-slate-200 truncate"
        >
          {rich.strategyTitle || rich.expression?.slice(0, 60) || <span className="italic text-slate-400">Empty step</span>}
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onMoveUp} disabled={isFirst} className="text-slate-400 hover:text-slate-600 disabled:opacity-30 text-xs px-1">↑</button>
          <button onClick={onMoveDown} disabled={isLast} className="text-slate-400 hover:text-slate-600 disabled:opacity-30 text-xs px-1">↓</button>
          <button onClick={onRemove} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
          <button onClick={() => setOpen(o => !o)} className="text-slate-400 text-xs px-1">{open ? '▲' : '▼'}</button>
        </div>
      </div>
      {open && (
        <div className="p-3 space-y-2 border-t border-slate-100 dark:border-slate-700">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Strategy title</span>
            <input
              value={rich.strategyTitle ?? ''}
              onChange={e => onChange({ ...rich, strategyTitle: e.target.value })}
              placeholder="e.g. Step 1: Set up the formula"
              className="field text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expression (LaTeX)</span>
            <textarea
              value={rich.expression ?? ''}
              onChange={e => onChange({ ...rich, expression: e.target.value })}
              rows={2}
              placeholder="e.g. \|\mathbf{v}\| = \sqrt{x^2 + y^2}"
              className="field text-sm font-mono resize-y"
            />
            {error && <p className="text-xs text-red-500 font-mono">LaTeX error: {error}</p>}
            {html && !error && (
              <div
                className="rounded bg-slate-50 dark:bg-slate-900 px-3 py-2 text-center overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}
          </label>
          <label className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Annotation (markdown)</span>
              <MarkdownEditButton onClick={() => setEditingAnnotation(true)} />
            </div>
            <textarea
              value={rich.annotation ?? ''}
              onChange={e => onChange({ ...rich, annotation: e.target.value })}
              rows={3}
              placeholder="Explanation of what this step does…"
              className="field text-sm resize-y"
            />
          </label>
          {editingAnnotation && (
            <Suspense fallback={null}>
              <MarkdownCellEditor
                value={rich.annotation ?? ''}
                onChange={v => onChange({ ...rich, annotation: v })}
                onClose={() => setEditingAnnotation(false)}
                title="📝 Step Annotation"
              />
            </Suspense>
          )}
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Hints — one per line</span>
            <textarea
              value={(rich.hints ?? []).join('\n')}
              onChange={e => onChange({ ...rich, hints: e.target.value.split('\n').filter(Boolean) })}
              rows={2}
              placeholder="Optional hints for students…"
              className="field text-sm resize-none"
            />
          </label>
        </div>
      )}
    </div>
  )
}

function ExampleEditor({ ex, onChange, onRemove }) {
  const [editingProblem, setEditingProblem] = useState(false)
  const [editingAnswer, setEditingAnswer] = useState(false)
  const [editingConclusion, setEditingConclusion] = useState(false)

  const steps = ex.steps ?? []
  const updateStep = (i, updated) => {
    const next = [...steps]
    next[i] = updated
    onChange({ ...ex, steps: next })
  }
  const addStep = () => onChange({
    ...ex,
    steps: [...steps, { expression: '', annotation: '', strategyTitle: '', hints: [] }],
  })
  const removeStep = i => onChange({ ...ex, steps: steps.filter((_, j) => j !== i) })
  const moveStep = (i, dir) => {
    const next = [...steps]
    const target = i + dir
    if (target < 0 || target >= next.length) return
    ;[next[i], next[target]] = [next[target], next[i]]
    onChange({ ...ex, steps: next })
  }

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center gap-2">
        <input
          value={ex.id ?? ''}
          onChange={e => onChange({ ...ex, id: e.target.value })}
          placeholder="id (e.g. la1-001-ex1)"
          className="field font-mono text-xs w-40 shrink-0"
        />
        <input
          value={ex.title ?? ''}
          onChange={e => onChange({ ...ex, title: e.target.value })}
          placeholder="Example title"
          className="field text-sm font-semibold flex-1"
        />
        <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600 shrink-0">✕ Remove</button>
      </div>

      <label className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Problem</span>
          <MarkdownEditButton onClick={() => setEditingProblem(true)} />
        </div>
        <textarea
          value={ex.problem ?? ''}
          onChange={e => onChange({ ...ex, problem: e.target.value })}
          rows={2}
          placeholder="State the problem…"
          className="field text-sm resize-none"
        />
      </label>
      {editingProblem && (
        <Suspense fallback={null}>
          <MarkdownCellEditor value={ex.problem ?? ''} onChange={v => onChange({ ...ex, problem: v })} onClose={() => setEditingProblem(false)} title="✏️ Example Problem" />
        </Suspense>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Steps ({steps.length})</span>
          <button onClick={addStep} className="text-xs text-brand-600 hover:text-brand-700 font-semibold">+ Add step</button>
        </div>
        {steps.map((step, i) => (
          <StepEditor
            key={i}
            index={i}
            step={step}
            onChange={updated => updateStep(i, updated)}
            onRemove={() => removeStep(i)}
            onMoveUp={() => moveStep(i, -1)}
            onMoveDown={() => moveStep(i, 1)}
            isFirst={i === 0}
            isLast={i === steps.length - 1}
          />
        ))}
        {!steps.length && (
          <p className="text-xs text-slate-400 italic">No steps — click + Add step to add one.</p>
        )}
      </div>

      <label className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Answer</span>
          <MarkdownEditButton onClick={() => setEditingAnswer(true)} />
        </div>
        <input
          value={ex.answer ?? ''}
          onChange={e => onChange({ ...ex, answer: e.target.value })}
          placeholder="Final answer"
          className="field text-sm"
        />
      </label>
      {editingAnswer && (
        <Suspense fallback={null}>
          <MarkdownCellEditor value={ex.answer ?? ''} onChange={v => onChange({ ...ex, answer: v })} onClose={() => setEditingAnswer(false)} title="✏️ Example Answer" />
        </Suspense>
      )}

      <label className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Conclusion (optional)</span>
          <MarkdownEditButton onClick={() => setEditingConclusion(true)} />
        </div>
        <textarea
          value={ex.conclusion ?? ''}
          onChange={e => onChange({ ...ex, conclusion: e.target.value || undefined })}
          rows={2}
          placeholder="Wrap-up sentence connecting the result back to the concept…"
          className="field text-sm resize-none"
        />
      </label>
      {editingConclusion && (
        <Suspense fallback={null}>
          <MarkdownCellEditor
            value={ex.conclusion ?? ''}
            onChange={v => onChange({ ...ex, conclusion: v || undefined })}
            onClose={() => setEditingConclusion(false)}
            title="✏️ Example Conclusion"
          />
        </Suspense>
      )}
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
          {(ex.steps ?? []).length > 0 && (
            <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-decimal pl-4">
              {(ex.steps ?? []).filter(Boolean).map((s, j) => (
                <li key={j}>
                  {typeof s === 'string'
                    ? s
                    : s.strategyTitle
                      ? <><strong>{s.strategyTitle}</strong>{s.expression ? ` — ${s.expression.slice(0, 60)}` : ''}</>
                      : s.expression?.slice(0, 80) ?? ''}
                </li>
              ))}
            </ol>
          )}
          {ex.answer && <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-2">→ {ex.answer}</p>}
          {ex.conclusion && <p className="text-xs text-slate-400 mt-1 italic">{ex.conclusion}</p>}
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
          onClick={() => update({ items: [...(sec.items ?? []), { id: '', title: `Example ${(sec.items?.length ?? 0) + 1}`, problem: '', steps: [], answer: '' }] })}
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
