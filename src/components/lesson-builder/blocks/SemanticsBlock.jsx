import { useState, lazy, Suspense } from 'react'
import BlockShell from '../BlockShell.jsx'
import MarkdownEditButton from '../MarkdownEditButton.jsx'

const MarkdownCellEditor = lazy(() => import('./MarkdownCellEditor.jsx'))

function CoreSymbolEditor({ item, onChange, onRemove }) {
  const [editingMeaning, setEditingMeaning] = useState(false)
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Symbol (LaTeX)</span>
        <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600">✕</button>
      </div>
      <input
        value={item.symbol ?? ''}
        onChange={e => onChange({ ...item, symbol: e.target.value })}
        placeholder="e.g. \|\mathbf{v}\|"
        className="field text-sm font-mono"
      />
      <label className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Meaning</span>
          <MarkdownEditButton onClick={() => setEditingMeaning(true)} />
        </div>
        <textarea
          value={item.meaning ?? ''}
          onChange={e => onChange({ ...item, meaning: e.target.value })}
          placeholder="Plain-language meaning of this symbol…"
          rows={2}
          className="field text-sm resize-none"
        />
      </label>
      {editingMeaning && (
        <Suspense fallback={null}>
          <MarkdownCellEditor value={item.meaning ?? ''} onChange={v => onChange({ ...item, meaning: v })} onClose={() => setEditingMeaning(false)} title="🔣 Symbol Meaning" />
        </Suspense>
      )}
    </div>
  )
}

export default function SemanticsBlock({ sec, dispatch, index, total, onMoveUp, onMoveDown, onRemove }) {
  const [editing, setEditing] = useState(false)
  const update = updates => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates })

  const core = sec.core ?? []
  const rulesOfThumb = sec.rulesOfThumb ?? []

  const preview = (
    <div className="space-y-3">
      {core.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Core symbols ({core.length})</p>
          {core.slice(0, 3).map((item, i) => (
            <div key={i} className="text-xs font-mono text-slate-500 truncate">{item.symbol} — {item.meaning?.slice(0, 60)}</div>
          ))}
          {core.length > 3 && <p className="text-xs text-slate-400 italic">+ {core.length - 3} more…</p>}
        </div>
      )}
      {rulesOfThumb.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Rules of thumb ({rulesOfThumb.length})</p>
          {rulesOfThumb.slice(0, 2).map((r, i) => (
            <p key={i} className="text-xs text-slate-500 truncate">{r}</p>
          ))}
        </div>
      )}
      {!core.length && !rulesOfThumb.length && (
        <p className="text-slate-300 dark:text-slate-600 italic text-sm">No semantics yet…</p>
      )}
    </div>
  )

  const editor = (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Core Symbols</span>
          <button
            onClick={() => update({ core: [...core, { symbol: '', meaning: '' }] })}
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
          >
            + Add symbol
          </button>
        </div>
        {core.map((item, i) => (
          <CoreSymbolEditor
            key={i} item={item}
            onChange={updated => { const next = [...core]; next[i] = updated; update({ core: next }) }}
            onRemove={() => update({ core: core.filter((_, j) => j !== i) })}
          />
        ))}
        {!core.length && <p className="text-xs text-slate-400 italic">No symbols yet.</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rules of Thumb</span>
          <button
            onClick={() => update({ rulesOfThumb: [...rulesOfThumb, ''] })}
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
          >
            + Add rule
          </button>
        </div>
        {rulesOfThumb.map((r, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={r}
              onChange={e => { const next = [...rulesOfThumb]; next[i] = e.target.value; update({ rulesOfThumb: next }) }}
              placeholder="A rule of thumb for students to remember…"
              className="field text-sm flex-1"
            />
            <button onClick={() => update({ rulesOfThumb: rulesOfThumb.filter((_, j) => j !== i) })} className="text-xs text-red-400 hover:text-red-600 shrink-0">✕</button>
          </div>
        ))}
        {!rulesOfThumb.length && <p className="text-xs text-slate-400 italic">No rules yet.</p>}
      </div>

      <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">Done</button>
    </div>
  )

  return (
    <BlockShell label="Semantics" icon="🔣" index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove} isEditing={editing} onEdit={() => setEditing(true)}>
      {editing ? editor : preview}
    </BlockShell>
  )
}
