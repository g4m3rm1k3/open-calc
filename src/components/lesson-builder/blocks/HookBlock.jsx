import { useState, lazy, Suspense } from 'react'
import BlockShell from '../BlockShell.jsx'
import MarkdownEditButton from '../MarkdownEditButton.jsx'
import VizFrame from '../../viz/VizFrame.jsx'

const MarkdownCellEditor = lazy(() => import('./MarkdownCellEditor.jsx'))

export default function HookBlock({ hook, dispatch }) {
  const [editing, setEditing] = useState(false)
  const [editingContext, setEditingContext] = useState(false)
  const set = (key, value) => dispatch({ type: 'SET_HOOK', key, value })

  const preview = (
    <div className="space-y-3">
      <p className="text-base font-serif italic text-brand-800 dark:text-brand-200 border-l-4 border-brand-300 dark:border-brand-700 pl-4">
        {hook.question || <span className="text-slate-300 dark:text-slate-600">No hook question yet…</span>}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
        {hook.realWorldContext || <span className="text-slate-300 dark:text-slate-600 italic">No real-world context yet…</span>}
      </p>
      {hook.previewVisualizationId && (
        <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          viz: {hook.previewVisualizationId}
        </span>
      )}
    </div>
  )

  const editor = (
    <div className="space-y-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hook question (italic lead-in)</span>
        <textarea
          value={hook.question}
          onChange={e => set('question', e.target.value)}
          rows={2}
          placeholder="What if you could describe any direction in space with just three numbers?"
          className="field resize-none"
        />
      </label>
      <label className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Real-world context (prose, markdown ok)</span>
          <MarkdownEditButton onClick={() => setEditingContext(true)} />
        </div>
        <textarea
          value={hook.realWorldContext}
          onChange={e => set('realWorldContext', e.target.value)}
          rows={5}
          placeholder="Vectors appear everywhere in the real world…"
          className="field resize-y"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Preview Visualization ID (optional)</span>
        <input
          value={hook.previewVisualizationId}
          onChange={e => set('previewVisualizationId', e.target.value)}
          placeholder="vector-field-intro"
          className="field font-mono"
        />
      </label>
      {hook.previewVisualizationId && (
        <div className="pt-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Live preview</p>
          <VizFrame id={hook.previewVisualizationId} />
        </div>
      )}
      <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">
        Done
      </button>
      {editingContext && (
        <Suspense fallback={<div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-950 text-slate-400">Loading editor…</div>}>
          <MarkdownCellEditor
            value={hook.realWorldContext}
            onChange={v => set('realWorldContext', v)}
            onClose={() => setEditingContext(false)}
            title="📝 Real-world Context"
          />
        </Suspense>
      )}
    </div>
  )

  return (
    <BlockShell label="Hook" icon="🪝" rigid isEditing={editing} onEdit={() => setEditing(true)}>
      <div onClick={!editing ? () => setEditing(true) : undefined} className={!editing ? 'cursor-pointer' : ''}>
        {editing ? editor : preview}
      </div>
    </BlockShell>
  )
}
