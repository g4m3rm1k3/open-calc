import { useState, lazy, Suspense } from 'react'
import BlockShell from '../BlockShell.jsx'
import MarkdownEditButton from '../MarkdownEditButton.jsx'

const MarkdownCellEditor = lazy(() => import('./MarkdownCellEditor.jsx'))

const wrapMath = v => (v?.trim() ? `$$\n${v}\n$$` : '')
const unwrapMath = v => v?.replace(/^\$\$\s*\n?/, '').replace(/\n?\s*\$\$$/, '').trim() ?? ''

function StepEditor({ step, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [editingMath, setEditingMath] = useState(false)
  const [editingExplanation, setEditingExplanation] = useState(false)
  const [editingGotcha, setEditingGotcha] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState(false)
  return (
    <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-3 space-y-2 bg-white dark:bg-slate-800">
      <div className="flex items-center gap-2">
        <input
          value={step.label ?? ''}
          onChange={e => onChange({ ...step, label: e.target.value })}
          placeholder="Step label"
          className="field text-sm font-semibold flex-1"
        />
        <button onClick={onMoveUp} disabled={isFirst} className="text-slate-400 hover:text-slate-600 disabled:opacity-30 text-xs px-1">↑</button>
        <button onClick={onMoveDown} disabled={isLast} className="text-slate-400 hover:text-slate-600 disabled:opacity-30 text-xs px-1">↓</button>
        <button onClick={onRemove} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
      </div>
      <label className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Math (LaTeX)</span>
          <MarkdownEditButton onClick={() => setEditingMath(true)} />
        </div>
        <textarea
          value={step.math ?? ''}
          onChange={e => onChange({ ...step, math: e.target.value })}
          rows={2}
          placeholder="e.g. A(x) = 50x - x^2"
          className="field text-sm font-mono resize-y"
        />
      </label>
      {editingMath && (
        <Suspense fallback={null}>
          <MarkdownCellEditor
            value={wrapMath(step.math)}
            onChange={v => onChange({ ...step, math: unwrapMath(v) })}
            onClose={() => setEditingMath(false)}
            title="∑ Math (LaTeX)"
          />
        </Suspense>
      )}
      <label className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Explanation (markdown)</span>
          <MarkdownEditButton onClick={() => setEditingExplanation(true)} />
        </div>
        <textarea
          value={step.explanation ?? ''}
          onChange={e => onChange({ ...step, explanation: e.target.value })}
          rows={4}
          placeholder="Step-by-step explanation…"
          className="field text-sm resize-y"
        />
      </label>
      {editingExplanation && (
        <Suspense fallback={null}>
          <MarkdownCellEditor value={step.explanation ?? ''} onChange={v => onChange({ ...step, explanation: v })} onClose={() => setEditingExplanation(false)} title="🚶 Step Explanation" />
        </Suspense>
      )}
      <label className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Gotcha (optional)</span>
          <MarkdownEditButton onClick={() => setEditingGotcha(true)} />
        </div>
        <textarea
          value={step.gotcha ?? ''}
          onChange={e => onChange({ ...step, gotcha: e.target.value || undefined })}
          rows={2}
          placeholder="Common mistake to warn about…"
          className="field text-sm resize-y"
        />
      </label>
      {editingGotcha && (
        <Suspense fallback={null}>
          <MarkdownCellEditor value={step.gotcha ?? ''} onChange={v => onChange({ ...step, gotcha: v || undefined })} onClose={() => setEditingGotcha(false)} title="⚠️ Gotcha" />
        </Suspense>
      )}
      {step.strategy !== undefined && (
        <>
          <label className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Strategy</span>
              <MarkdownEditButton onClick={() => setEditingStrategy(true)} />
            </div>
            <textarea
              value={step.strategy ?? ''}
              onChange={e => onChange({ ...step, strategy: e.target.value })}
              rows={2}
              className="field text-sm resize-y"
            />
          </label>
          {editingStrategy && (
            <Suspense fallback={null}>
              <MarkdownCellEditor value={step.strategy ?? ''} onChange={v => onChange({ ...step, strategy: v })} onClose={() => setEditingStrategy(false)} title="🎯 Strategy" />
            </Suspense>
          )}
        </>
      )}
    </div>
  )
}

function WalkthroughEditor({ wt, onChange, onRemove }) {
  const [openStep, setOpenStep] = useState(null)
  const [editingProblem, setEditingProblem] = useState(false)

  const steps = wt.steps ?? []
  const updateStep = (i, updated) => {
    const next = [...steps]; next[i] = updated; onChange({ ...wt, steps: next })
  }
  const addStep = () => {
    const next = [...steps, { label: `Step ${steps.length + 1}`, math: '', explanation: '' }]
    onChange({ ...wt, steps: next })
    setOpenStep(next.length - 1)
  }
  const removeStep = i => {
    onChange({ ...wt, steps: steps.filter((_, j) => j !== i) })
    setOpenStep(null)
  }
  const moveStep = (i, dir) => {
    const next = [...steps]
    const t = i + dir
    if (t < 0 || t >= next.length) return
    ;[next[i], next[t]] = [next[t], next[i]]
    onChange({ ...wt, steps: next })
  }

  return (
    <div className="border border-brand-200 dark:border-brand-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <input
          value={wt.title ?? ''}
          onChange={e => onChange({ ...wt, title: e.target.value })}
          placeholder="Walkthrough title"
          className="field text-sm font-bold flex-1"
        />
        <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600 shrink-0">✕ Remove</button>
      </div>
      <label className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Problem statement</span>
          <MarkdownEditButton onClick={() => setEditingProblem(true)} />
        </div>
        <textarea
          value={wt.problem ?? ''}
          onChange={e => onChange({ ...wt, problem: e.target.value })}
          rows={2}
          className="field text-sm resize-none"
        />
      </label>
      {editingProblem && (
        <Suspense fallback={null}>
          <MarkdownCellEditor value={wt.problem ?? ''} onChange={v => onChange({ ...wt, problem: v })} onClose={() => setEditingProblem(false)} title="🚶 Problem Statement" />
        </Suspense>
      )}

      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Steps ({steps.length})
        </p>
        <button onClick={addStep} className="text-xs text-brand-600 hover:text-brand-700 font-semibold">+ Add step</button>
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenStep(openStep === i ? null : i)}
              className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm"
            >
              <span className="font-mono text-[10px] text-slate-400 w-5">{i + 1}.</span>
              <span className="flex-1 font-medium text-slate-700 dark:text-slate-200 truncate">{step.label || `Step ${i + 1}`}</span>
              {step.math && (
                <span className="text-[10px] font-mono text-brand-500 truncate max-w-[140px]">{step.math.slice(0, 40)}{step.math.length > 40 ? '…' : ''}</span>
              )}
              <span className="text-slate-400 text-xs">{openStep === i ? '▲' : '▼'}</span>
            </button>
            {openStep === i && (
              <div className="mt-1 ml-2">
                <StepEditor
                  step={step}
                  onChange={updated => updateStep(i, updated)}
                  onRemove={() => removeStep(i)}
                  onMoveUp={() => moveStep(i, -1)}
                  onMoveDown={() => moveStep(i, 1)}
                  isFirst={i === 0}
                  isLast={i === steps.length - 1}
                />
              </div>
            )}
          </div>
        ))}
        {!steps.length && (
          <p className="text-xs text-slate-400 italic px-3">No steps — click + Add step to add one.</p>
        )}
      </div>
    </div>
  )
}

export default function WalkthroughsBlock({ sec, dispatch, index, total, onMoveUp, onMoveDown, onRemove }) {
  const [editing, setEditing] = useState(false)
  const update = updates => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates })
  const updateItem = (i, updated) => {
    const items = [...(sec.items ?? [])]
    items[i] = updated
    update({ items })
  }

  const preview = (
    <div className="space-y-2">
      {(sec.items ?? []).map((wt, i) => (
        <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{wt.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{(wt.steps ?? []).length} steps</p>
        </div>
      ))}
      {!sec.items?.length && <p className="text-slate-300 dark:text-slate-600 italic text-sm">No walkthroughs yet…</p>}
    </div>
  )

  const editor = (
    <div className="space-y-4">
      {(sec.items ?? []).map((wt, i) => (
        <WalkthroughEditor
          key={wt.id ?? i}
          wt={wt}
          onChange={updated => updateItem(i, updated)}
          onRemove={() => update({ items: (sec.items ?? []).filter((_, j) => j !== i) })}
        />
      ))}
      <div className="flex gap-3">
        <button
          onClick={() => update({ items: [...(sec.items ?? []), { title: `Walkthrough ${(sec.items?.length ?? 0) + 1}`, problem: '', steps: [] }] })}
          className="px-3 py-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold border border-brand-200 rounded-lg"
        >
          + Add walkthrough
        </button>
        <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">
          Done
        </button>
      </div>
    </div>
  )

  return (
    <BlockShell
      label="Walkthroughs" icon="🚶"
      index={index} total={total}
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove}
      isEditing={editing} onEdit={() => setEditing(true)}
    >
      {editing ? editor : preview}
    </BlockShell>
  )
}
