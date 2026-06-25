import { useState, lazy, Suspense } from 'react'
import BlockShell from '../BlockShell.jsx'
import MarkdownEditButton from '../MarkdownEditButton.jsx'

const MarkdownCellEditor = lazy(() => import('./MarkdownCellEditor.jsx'))

function LinkEditor({ item, onChange, onRemove, placeholder, title }) {
  const [editingNote, setEditingNote] = useState(false)
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center gap-2">
        <input
          value={item.lessonId ?? ''}
          onChange={e => onChange({ ...item, lessonId: e.target.value })}
          placeholder="Lesson ID (e.g. la1-003)"
          className="field font-mono text-xs w-36"
        />
        <input
          value={item.label ?? ''}
          onChange={e => onChange({ ...item, label: e.target.value })}
          placeholder="Display label"
          className="field text-sm flex-1"
        />
        <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600 shrink-0">✕</button>
      </div>
      <label className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Note</span>
          <MarkdownEditButton onClick={() => setEditingNote(true)} />
        </div>
        <textarea
          value={item.note ?? ''}
          onChange={e => onChange({ ...item, note: e.target.value })}
          placeholder={placeholder}
          rows={2}
          className="field text-sm resize-none"
        />
      </label>
      {editingNote && (
        <Suspense fallback={null}>
          <MarkdownCellEditor value={item.note ?? ''} onChange={v => onChange({ ...item, note: v })} onClose={() => setEditingNote(false)} title={title} />
        </Suspense>
      )}
    </div>
  )
}

export default function SpiralBlock({ sec, dispatch, index, total, onMoveUp, onMoveDown, onRemove }) {
  const [editing, setEditing] = useState(false)
  const update = updates => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates })

  const recovery = sec.recoveryPoints ?? []
  const future = sec.futureLinks ?? []

  const preview = (
    <div className="space-y-3">
      {recovery.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Recovery points ({recovery.length})</p>
          {recovery.map((r, i) => (
            <div key={i} className="text-xs flex items-center gap-2">
              <span className="font-mono text-slate-400">{r.lessonId}</span>
              <span className="text-slate-600 dark:text-slate-400">{r.label}</span>
            </div>
          ))}
        </div>
      )}
      {future.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Future links ({future.length})</p>
          {future.map((f, i) => (
            <div key={i} className="text-xs flex items-center gap-2">
              <span className="font-mono text-slate-400">{f.lessonId}</span>
              <span className="text-slate-600 dark:text-slate-400">{f.label}</span>
            </div>
          ))}
        </div>
      )}
      {!recovery.length && !future.length && (
        <p className="text-slate-300 dark:text-slate-600 italic text-sm">No spiral links yet…</p>
      )}
    </div>
  )

  const editor = (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Recovery Points — prerequisites to revisit</span>
          <button
            onClick={() => update({ recoveryPoints: [...recovery, { lessonId: '', label: '', note: '' }] })}
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
          >
            + Add
          </button>
        </div>
        {recovery.map((item, i) => (
          <LinkEditor
            key={i} item={item}
            onChange={updated => { const next = [...recovery]; next[i] = updated; update({ recoveryPoints: next }) }}
            onRemove={() => update({ recoveryPoints: recovery.filter((_, j) => j !== i) })}
            placeholder="How this earlier concept connects to today's lesson…"
            title="🌀 Recovery Point Note"
          />
        ))}
        {!recovery.length && <p className="text-xs text-slate-400 italic">No recovery points yet.</p>}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Future Links — where this leads</span>
          <button
            onClick={() => update({ futureLinks: [...future, { lessonId: '', label: '', note: '' }] })}
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
          >
            + Add
          </button>
        </div>
        {future.map((item, i) => (
          <LinkEditor
            key={i} item={item}
            onChange={updated => { const next = [...future]; next[i] = updated; update({ futureLinks: next }) }}
            onRemove={() => update({ futureLinks: future.filter((_, j) => j !== i) })}
            placeholder="How today's concept enables this future lesson…"
            title="🌀 Future Link Note"
          />
        ))}
        {!future.length && <p className="text-xs text-slate-400 italic">No future links yet.</p>}
      </div>

      <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">Done</button>
    </div>
  )

  return (
    <BlockShell label="Spiral" icon="🌀" index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove} isEditing={editing} onEdit={() => setEditing(true)}>
      {editing ? editor : preview}
    </BlockShell>
  )
}
