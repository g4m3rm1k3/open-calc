import { useState, lazy, Suspense } from 'react'
import BlockShell from '../BlockShell.jsx'
import MarkdownEditButton from '../MarkdownEditButton.jsx'
import VisualizationBlock from './VisualizationBlock.jsx'
import BlockListEditor from './BlockListEditor.jsx'

const MarkdownCellEditor = lazy(() => import('./MarkdownCellEditor.jsx'))

// Shared editor for Intuition and Rigor (both have prose[] + callouts[])

const CALLOUT_TYPES = ['insight', 'sequencing', 'procedure', 'warning', 'tip']

function CalloutEditor({ callout, onChange, onRemove }) {
  const [editingBody, setEditingBody] = useState(false)
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center gap-2">
        <select
          value={callout.type ?? 'insight'}
          onChange={e => onChange({ ...callout, type: e.target.value })}
          className="field text-xs py-1"
        >
          {CALLOUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <MarkdownEditButton onClick={() => setEditingBody(true)} />
          <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600">✕ Remove</button>
        </div>
      </div>
      <input
        value={callout.title ?? ''}
        onChange={e => onChange({ ...callout, title: e.target.value })}
        placeholder="Callout title"
        className="field text-sm"
      />
      <textarea
        value={callout.body ?? ''}
        onChange={e => onChange({ ...callout, body: e.target.value })}
        placeholder="Callout body text…"
        rows={2}
        className="field text-sm resize-none"
      />
      {editingBody && (
        <Suspense fallback={<div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-950 text-slate-400">Loading editor…</div>}>
          <MarkdownCellEditor
            value={callout.body ?? ''}
            onChange={v => onChange({ ...callout, body: v })}
            onClose={() => setEditingBody(false)}
            title="💡 Callout Body"
          />
        </Suspense>
      )}
    </div>
  )
}

export default function ProseCalloutBlock({ sec, label, icon, dispatch, index, total, onMoveUp, onMoveDown, onRemove, sectionId, courseId }) {
  const [editing, setEditing] = useState(false)
  const [editingProse, setEditingProse] = useState(false)
  // blocks[] (new prose+image pattern, see BlockListEditor.jsx) vs legacy
  // prose[] — both render through this same component; only the
  // content portion (not callouts) differs between the two modes.
  const isBlocksMode = Array.isArray(sec.blocks)

  const updateSec = (updates) => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates })

  const proseText = (sec.prose ?? []).join('\n\n')
  const setProse = next => updateSec({ prose: next.split(/\n{2,}/).map(s => s.trim()).filter(Boolean) })

  const preview = (
    <div className="space-y-3">
      {isBlocksMode
        ? (sec.blocks ?? []).map(b => {
            if (b.type === 'prose') {
              return (b.paragraphs ?? []).map((p, j) => (
                <p key={`${b._id}-${j}`} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{p}</p>
              ))
            }
            if (b.type === 'image') {
              return (
                <div key={b._id} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic">
                  🖼️ {b.caption || b.importPath || 'image block (no path set)'}
                </div>
              )
            }
            if (b.type === 'viz') {
              return (
                <div key={b._id} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic">
                  🔭 {b.title || b.vizId || 'visualization block'}
                </div>
              )
            }
            return null
          })
        : (sec.prose ?? []).map((p, i) => (
            <p key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{p}</p>
          ))}
      {(sec.callouts ?? []).map((c, i) => (
        <div key={i} className="rounded-lg border-l-4 border-brand-400 bg-brand-50 dark:bg-brand-900/20 px-4 py-3">
          <p className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase mb-1">{c.type}</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{c.title}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{c.body}</p>
        </div>
      ))}
      {!isBlocksMode && (sec.children ?? []).map((child, i) => (
        <VisualizationBlock
          key={child._id}
          child={child}
          sectionId={sectionId ?? sec._id}
          dispatch={dispatch}
          index={i}
          total={(sec.children ?? []).length}
        />
      ))}
      {!isBlocksMode && !sec.prose?.length && !sec.callouts?.length && !sec.children?.length && (
        <p className="text-slate-300 dark:text-slate-600 italic text-sm">Click to add content…</p>
      )}
      {isBlocksMode && !sec.blocks?.length && !sec.callouts?.length && (
        <p className="text-slate-300 dark:text-slate-600 italic text-sm">No blocks yet — click to add some.</p>
      )}
    </div>
  )

  const editor = (
    <div className="space-y-4">
      {isBlocksMode ? (
        <BlockListEditor sec={sec} sectionId={sectionId ?? sec._id} dispatch={dispatch} courseId={courseId} />
      ) : (
        <>
          <label className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Prose paragraphs — separate with blank lines
              </span>
              <MarkdownEditButton onClick={() => setEditingProse(true)} />
            </div>
            <textarea
              value={proseText}
              onChange={e => setProse(e.target.value)}
              rows={8}
              placeholder="First paragraph…&#10;&#10;Second paragraph…"
              className="field font-mono text-sm resize-y"
            />
          </label>
          {editingProse && (
            <Suspense fallback={<div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-950 text-slate-400">Loading editor…</div>}>
              <MarkdownCellEditor value={proseText} onChange={setProse} onClose={() => setEditingProse(false)} title={`${icon ?? '📝'} ${label ?? 'Prose'}`} />
            </Suspense>
          )}
          <button
            onClick={() => {
              if (window.confirm('Switch this section to blocks (prose + images), like the geometry course uses? Existing prose becomes the first block.')) {
                dispatch({ type: 'CONVERT_TO_BLOCKS', sectionId: sec._id })
              }
            }}
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
          >
            🧩 Switch to blocks (prose + images, like Geometry)
          </button>
        </>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Callouts</span>
          <button
            onClick={() => updateSec({ callouts: [...(sec.callouts ?? []), { type: 'insight', title: '', body: '' }] })}
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
          >
            + Add callout
          </button>
        </div>
        {(sec.callouts ?? []).map((c, i) => (
          <CalloutEditor
            key={i}
            callout={c}
            onChange={updated => {
              const callouts = [...(sec.callouts ?? [])]
              callouts[i] = updated
              updateSec({ callouts })
            }}
            onRemove={() => updateSec({ callouts: (sec.callouts ?? []).filter((_, j) => j !== i) })}
          />
        ))}
      </div>

      {/* Nested visualizations — legacy mode only; blocks mode embeds viz inline via BlockListEditor */}
      {!isBlocksMode && (sec.children ?? []).length > 0 && (
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
        <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg">
          Done
        </button>
        {!isBlocksMode && (
          <button
            onClick={() => dispatch({ type: 'ADD_CHILD', sectionId: sectionId ?? sec._id, vizId: 'PythonNotebook' })}
            className="px-3 py-1.5 text-sm text-brand-600 border border-brand-300 hover:bg-brand-50 rounded-lg font-semibold"
          >
            + Add Notebook
          </button>
        )}
      </div>
    </div>
  )

  return (
    <BlockShell
      label={label} icon={icon}
      index={index} total={total}
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove}
      isEditing={editing} onEdit={() => setEditing(true)}
    >
      {editing ? editor : preview}
    </BlockShell>
  )
}
