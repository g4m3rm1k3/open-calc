import { useState } from 'react'
import BlockShell from '../BlockShell.jsx'

function StepEditor({ step, onChange }) {
  return (
    <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-3 space-y-2 bg-white dark:bg-slate-800">
      <input
        value={step.label ?? ''}
        onChange={e => onChange({ ...step, label: e.target.value })}
        placeholder="Step label"
        className="field text-sm font-semibold w-full"
      />
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Math (LaTeX)</span>
        <textarea
          value={step.math ?? ''}
          onChange={e => onChange({ ...step, math: e.target.value })}
          rows={2}
          placeholder="e.g. A(x) = 50x - x^2"
          className="field text-sm font-mono resize-y"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Explanation (markdown)</span>
        <textarea
          value={step.explanation ?? ''}
          onChange={e => onChange({ ...step, explanation: e.target.value })}
          rows={4}
          placeholder="Step-by-step explanation…"
          className="field text-sm resize-y"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Gotcha (optional)</span>
        <textarea
          value={step.gotcha ?? ''}
          onChange={e => onChange({ ...step, gotcha: e.target.value || undefined })}
          rows={2}
          placeholder="Common mistake to warn about…"
          className="field text-sm resize-y"
        />
      </label>
      {step.strategy !== undefined && (
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Strategy</span>
          <textarea
            value={step.strategy ?? ''}
            onChange={e => onChange({ ...step, strategy: e.target.value })}
            rows={2}
            className="field text-sm resize-y"
          />
        </label>
      )}
    </div>
  )
}

function WalkthroughEditor({ wt, onChange }) {
  const [openStep, setOpenStep] = useState(null)
  const updateStep = (i, updated) => {
    const steps = [...(wt.steps ?? [])]
    steps[i] = updated
    onChange({ ...wt, steps })
  }
  return (
    <div className="border border-brand-200 dark:border-brand-800 rounded-xl p-4 space-y-3">
      <input
        value={wt.title ?? ''}
        onChange={e => onChange({ ...wt, title: e.target.value })}
        placeholder="Walkthrough title"
        className="field text-sm font-bold w-full"
      />
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Problem statement</span>
        <textarea
          value={wt.problem ?? ''}
          onChange={e => onChange({ ...wt, problem: e.target.value })}
          rows={2}
          className="field text-sm resize-none"
        />
      </label>

      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Steps ({(wt.steps ?? []).length})
      </p>
      <div className="space-y-2">
        {(wt.steps ?? []).map((step, i) => (
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
                <StepEditor step={step} onChange={updated => updateStep(i, updated)} />
              </div>
            )}
          </div>
        ))}
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
        <WalkthroughEditor key={wt.id ?? i} wt={wt} onChange={updated => updateItem(i, updated)} />
      ))}
      <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">
        Done
      </button>
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
