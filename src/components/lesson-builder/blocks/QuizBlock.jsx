import { useState } from 'react'
import BlockShell from '../BlockShell.jsx'

function QuizItemEditor({ q, onChange, onRemove }) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center justify-between">
        <input
          value={q.id ?? ''}
          onChange={e => onChange({ ...q, id: e.target.value })}
          placeholder="Question ID (e.g. q1)"
          className="field font-mono text-xs w-28"
        />
        <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600">✕ Remove</button>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Question text</span>
        <textarea value={q.text ?? ''} onChange={e => onChange({ ...q, text: e.target.value })} rows={2} className="field text-sm resize-none" placeholder="What does a vector represent?" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Options — one per line</span>
        <textarea
          value={(q.options ?? []).join('\n')}
          onChange={e => onChange({ ...q, options: e.target.value.split('\n') })}
          rows={4}
          className="field text-sm font-mono resize-none"
          placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Correct answer (exact match to one option)</span>
        <input value={q.answer ?? ''} onChange={e => onChange({ ...q, answer: e.target.value })} placeholder="Option A" className="field text-sm" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hints — one per line</span>
        <textarea
          value={(q.hints ?? []).join('\n')}
          onChange={e => onChange({ ...q, hints: e.target.value.split('\n').filter(Boolean) })}
          rows={2}
          className="field text-sm resize-none"
          placeholder="Think about direction…"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Review section</span>
        <input value={q.reviewSection ?? ''} onChange={e => onChange({ ...q, reviewSection: e.target.value })} placeholder="intuition" className="field text-sm" />
      </label>
    </div>
  )
}

export default function QuizBlock({ sec, dispatch, index, total, onMoveUp, onMoveDown, onRemove }) {
  const [editing, setEditing] = useState(false)
  const update = updates => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates })
  const updateItem = (i, updated) => { const items = [...(sec.items ?? [])]; items[i] = updated; update({ items }) }

  const preview = (
    <div className="space-y-2">
      {(sec.items ?? []).map((q, i) => (
        <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{i + 1}. {q.text || <span className="italic text-slate-300">No question text</span>}</p>
          {q.options?.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {q.options.filter(Boolean).map((opt, j) => (
                <li key={j} className={`text-xs pl-4 ${opt === q.answer ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                  {opt === q.answer ? '✓ ' : '○ '}{opt}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      {!sec.items?.length && <p className="text-slate-300 dark:text-slate-600 italic text-sm">No quiz questions yet…</p>}
    </div>
  )

  const editor = (
    <div className="space-y-4">
      {(sec.items ?? []).map((q, i) => (
        <QuizItemEditor
          key={i} q={q}
          onChange={updated => updateItem(i, updated)}
          onRemove={() => update({ items: (sec.items ?? []).filter((_, j) => j !== i) })}
        />
      ))}
      <div className="flex gap-3">
        <button
          onClick={() => update({ items: [...(sec.items ?? []), { id: `q${Date.now()}`, type: 'choice', text: '', options: ['', '', '', ''], answer: '', hints: [], reviewSection: '' }] })}
          className="px-3 py-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold border border-brand-200 rounded-lg"
        >
          + Add question
        </button>
        <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">Done</button>
      </div>
    </div>
  )

  return (
    <BlockShell label="Quiz" icon="🧪" index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove} isEditing={editing} onEdit={() => setEditing(true)}>
      {editing ? editor : preview}
    </BlockShell>
  )
}
