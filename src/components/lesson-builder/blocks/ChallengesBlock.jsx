import { useState, useMemo, lazy, Suspense } from 'react'
import katex from 'katex'
import BlockShell from '../BlockShell.jsx'
import MarkdownEditButton from '../MarkdownEditButton.jsx'

const MarkdownCellEditor = lazy(() => import('./MarkdownCellEditor.jsx'))

const DIFFICULTY_OPTS = ['easy', 'medium', 'hard']

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

function WalkthroughStepEditor({ step, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast, index }) {
  const [open, setOpen] = useState(false)
  const { html, error } = useTexRender(step.expression)

  return (
    <div className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
      <div className="flex items-center gap-1 px-3 py-2 bg-slate-50 dark:bg-slate-700/50">
        <span className="font-mono text-[10px] text-slate-400 w-5 shrink-0">{index + 1}.</span>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex-1 text-left text-xs font-mono text-slate-600 dark:text-slate-300 truncate"
        >
          {step.expression?.slice(0, 70) || <span className="italic text-slate-400">Empty step</span>}
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
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expression (LaTeX)</span>
            <textarea
              value={step.expression ?? ''}
              onChange={e => onChange({ ...step, expression: e.target.value })}
              rows={2}
              className="field text-sm font-mono resize-y"
              placeholder="\|\mathbf{v}\| = \sqrt{25+144} = \sqrt{169}"
            />
            {error && <p className="text-xs text-red-500 font-mono">LaTeX error: {error}</p>}
            {html && !error && (
              <div className="rounded bg-slate-50 dark:bg-slate-900 px-3 py-2 text-center overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: html }} />
            )}
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Annotation</span>
            <textarea
              value={step.annotation ?? ''}
              onChange={e => onChange({ ...step, annotation: e.target.value })}
              rows={2}
              className="field text-sm resize-y"
              placeholder="What this step does…"
            />
          </label>
        </div>
      )}
    </div>
  )
}

function ChallengeEditor({ ch, onChange, onRemove }) {
  const [editingProblem, setEditingProblem] = useState(false)
  const [editingAnswer, setEditingAnswer] = useState(false)

  const walkthrough = ch.walkthrough ?? []
  const updateStep = (i, updated) => {
    const next = [...walkthrough]; next[i] = updated; onChange({ ...ch, walkthrough: next })
  }
  const addStep = () => onChange({ ...ch, walkthrough: [...walkthrough, { expression: '', annotation: '' }] })
  const removeStep = i => onChange({ ...ch, walkthrough: walkthrough.filter((_, j) => j !== i) })
  const moveStep = (i, dir) => {
    const next = [...walkthrough]
    const t = i + dir
    if (t < 0 || t >= next.length) return
    ;[next[i], next[t]] = [next[t], next[i]]
    onChange({ ...ch, walkthrough: next })
  }

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center gap-2">
        <input
          value={ch.id ?? ''}
          onChange={e => onChange({ ...ch, id: e.target.value })}
          placeholder="id (e.g. la1-001-ch1)"
          className="field font-mono text-xs w-36 shrink-0"
        />
        <select
          value={ch.difficulty ?? 'medium'}
          onChange={e => onChange({ ...ch, difficulty: e.target.value })}
          className="field text-xs py-1 w-24 shrink-0"
        >
          {DIFFICULTY_OPTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button onClick={onRemove} className="ml-auto text-xs text-red-400 hover:text-red-600 shrink-0">✕</button>
      </div>

      <label className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Problem</span>
          <MarkdownEditButton onClick={() => setEditingProblem(true)} />
        </div>
        <textarea
          value={ch.problem ?? ''}
          onChange={e => onChange({ ...ch, problem: e.target.value })}
          rows={3}
          className="field text-sm resize-none"
          placeholder="Problem statement…"
        />
      </label>
      {editingProblem && (
        <Suspense fallback={null}>
          <MarkdownCellEditor value={ch.problem ?? ''} onChange={v => onChange({ ...ch, problem: v })} onClose={() => setEditingProblem(false)} title="🎯 Challenge Problem" />
        </Suspense>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hint (optional)</span>
        <input value={ch.hint ?? ''} onChange={e => onChange({ ...ch, hint: e.target.value })} placeholder="Optional hint" className="field text-sm" />
      </label>

      <label className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Answer</span>
          <MarkdownEditButton onClick={() => setEditingAnswer(true)} />
        </div>
        <textarea
          value={ch.answer ?? ''}
          onChange={e => onChange({ ...ch, answer: e.target.value || undefined })}
          rows={2}
          placeholder="Full answer / worked solution summary…"
          className="field text-sm resize-none"
        />
      </label>
      {editingAnswer && (
        <Suspense fallback={null}>
          <MarkdownCellEditor value={ch.answer ?? ''} onChange={v => onChange({ ...ch, answer: v || undefined })} onClose={() => setEditingAnswer(false)} title="🎯 Challenge Answer" />
        </Suspense>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Walkthrough steps ({walkthrough.length})</span>
          <button onClick={addStep} className="text-xs text-brand-600 hover:text-brand-700 font-semibold">+ Add step</button>
        </div>
        {walkthrough.map((step, i) => (
          <WalkthroughStepEditor
            key={i}
            index={i}
            step={step}
            onChange={updated => updateStep(i, updated)}
            onRemove={() => removeStep(i)}
            onMoveUp={() => moveStep(i, -1)}
            onMoveDown={() => moveStep(i, 1)}
            isFirst={i === 0}
            isLast={i === walkthrough.length - 1}
          />
        ))}
        {!walkthrough.length && (
          <p className="text-xs text-slate-400 italic">No walkthrough steps — click + Add step to add one.</p>
        )}
      </div>
    </div>
  )
}

export default function ChallengesBlock({ sec, dispatch, index, total, onMoveUp, onMoveDown, onRemove }) {
  const [editing, setEditing] = useState(false)
  const update = updates => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates })

  const DIFF_COLORS = { easy: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30', medium: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30', hard: 'text-red-600 bg-red-50 dark:bg-red-950/30' }

  const preview = (
    <div className="space-y-2">
      {(sec.items ?? []).map((ch, i) => (
        <div key={i} className="rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-3">
          <div className="flex items-center gap-2 mb-1">
            {ch.difficulty && (
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${DIFF_COLORS[ch.difficulty] ?? 'text-slate-500'}`}>{ch.difficulty}</span>
            )}
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex-1">{ch.title || ch.id}</p>
            {ch.walkthrough?.length > 0 && <span className="text-[10px] text-slate-400">{ch.walkthrough.length} walkthrough steps</span>}
          </div>
          {ch.problem && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ch.problem}</p>}
        </div>
      ))}
      {!sec.items?.length && <p className="text-slate-300 dark:text-slate-600 italic text-sm">No challenges yet…</p>}
    </div>
  )

  const editor = (
    <div className="space-y-4">
      {(sec.items ?? []).map((ch, i) => (
        <ChallengeEditor
          key={i} ch={ch}
          onChange={updated => { const items = [...(sec.items ?? [])]; items[i] = updated; update({ items }) }}
          onRemove={() => update({ items: (sec.items ?? []).filter((_, j) => j !== i) })}
        />
      ))}
      <div className="flex gap-3">
        <button
          onClick={() => update({ items: [...(sec.items ?? []), { id: '', difficulty: 'medium', problem: '', hint: '', walkthrough: [], answer: '' }] })}
          className="px-3 py-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold border border-brand-200 rounded-lg"
        >
          + Add challenge
        </button>
        <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">Done</button>
      </div>
    </div>
  )

  return (
    <BlockShell label="Challenges" icon="🎯" index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove} isEditing={editing} onEdit={() => setEditing(true)}>
      {editing ? editor : preview}
    </BlockShell>
  )
}
