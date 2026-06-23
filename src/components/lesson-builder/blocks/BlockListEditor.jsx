// Editor for Intuition/Rigor sections using the prose+image `blocks[]`
// pattern (see src/courses/geometry/*/*.js, and
// src/courses/linear-algebra/1-vectors-spaces/001-what-is-a-vector.js).
// Each entry is one of: prose (paragraphs), image (diagram + caption), viz
// (embedded interactive component), or callout (inline insight/definition/
// warning box) — rendered and edited in the exact order they'll appear on
// the real lesson page. Any other block type still renders, just as raw
// editable JSON (see GenericBlockEditor below) rather than disappearing.
//
// Note: the separate sec.callouts[] array (rendered after the block
// sequence) is a different, older pattern — still handled by the untouched
// CalloutEditor in ProseCalloutBlock.jsx. This file's `callout` block type
// is for callouts interleaved inline within the blocks[] sequence itself.

import { useState, lazy, Suspense } from 'react'
import MarkdownEditButton from '../MarkdownEditButton.jsx'
import LiveSvgPreview from './LiveSvgPreview.jsx'
import VizFrame from '../../viz/VizFrame.jsx'

const MarkdownCellEditor = lazy(() => import('./MarkdownCellEditor.jsx'))
const VizSourceEditor = lazy(() => import('./VizSourceEditor.jsx'))
const SvgSourceEditor = lazy(() => import('./SvgSourceEditor.jsx'))

const BLOCK_TYPE_META = {
  prose: { icon: '📝', label: 'Prose' },
  image: { icon: '🖼️', label: 'Image' },
  viz: { icon: '🔭', label: 'Visualization' },
  callout: { icon: '💡', label: 'Callout' },
}

function ProseBlockEditor({ block, onChange }) {
  const [editing, setEditing] = useState(false)
  const text = (block.paragraphs ?? []).join('\n\n')
  const setText = next => onChange({ paragraphs: next.split(/\n{2,}/).map(s => s.trim()).filter(Boolean) })
  return (
    <div className="space-y-1">
      <div className="flex justify-end">
        <MarkdownEditButton onClick={() => setEditing(true)} />
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={5}
        placeholder="Short prose chunk — a paragraph or two, then move to the next block…"
        className="field font-mono text-sm resize-y w-full"
      />
      {editing && (
        <Suspense fallback={<div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-950 text-slate-400">Loading editor…</div>}>
          <MarkdownCellEditor value={text} onChange={setText} onClose={() => setEditing(false)} title="📝 Prose Block" />
        </Suspense>
      )}
    </div>
  )
}

function ImageBlockEditor({ block, onChange, courseId = 'geometry' }) {
  const [previewKey, setPreviewKey] = useState(0)
  const [editingSvg, setEditingSvg] = useState(false)
  const diagramsDir = `src/courses/${courseId}/diagrams`

  // importPath is stored relative to the lesson's folder (e.g. '../diagrams/foo.svg')
  // but the dev-fs API needs a repo-root-relative path — every course keeps its
  // diagrams in its own src/courses/<courseId>/diagrams/ folder, so resolve by
  // filename against that course's folder regardless of the '../' prefix style
  // used in the lesson source.
  const resolvedPath = block.importPath
    ? `${diagramsDir}/${block.importPath.split('/').pop()}`
    : ''

  const openInScratchpad = () => {
    window.dispatchEvent(new CustomEvent('oc-open-scratchpad', {
      detail: resolvedPath ? { filePath: resolvedPath, dir: diagramsDir } : { dir: diagramsDir },
    }))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preview</span>
        <button type="button" onClick={() => setPreviewKey(k => k + 1)} className="text-[10px] text-slate-400 hover:text-slate-600">↻ Refresh</button>
      </div>
      <LiveSvgPreview key={previewKey} path={resolvedPath} />
      <div className="flex items-start gap-2">
        <label className="flex-1 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Diagram path (relative to this lesson's folder, e.g. <code>../diagrams/foo.svg</code>)
          </span>
          <input
            value={block.importPath ?? ''}
            onChange={e => onChange({ importPath: e.target.value })}
            placeholder="../diagrams/my-diagram.svg"
            className="field font-mono text-xs"
          />
        </label>
        <div className="flex flex-col gap-1.5 mt-4 shrink-0">
          <button
            type="button"
            onClick={openInScratchpad}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
          >
            🎨 Scratchpad
          </button>
          <button
            type="button"
            onClick={() => resolvedPath && setEditingSvg(true)}
            disabled={!resolvedPath}
            title={resolvedPath ? 'Open full SVG source editor' : 'Set a diagram path first'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ✎ Edit SVG
          </button>
        </div>
      </div>
      {editingSvg && resolvedPath && (
        <Suspense fallback={null}>
          <SvgSourceEditor
            filePath={resolvedPath}
            onClose={() => { setEditingSvg(false); setPreviewKey(k => k + 1) }}
          />
        </Suspense>
      )}
      {!block.importPath && (
        <span className="text-[10px] text-amber-600 dark:text-amber-400 block">
          No path set yet — "Open in Scratchpad" will start a new diagram; type its filename above to match what you save there, then click ↻ Refresh.
        </span>
      )}
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Alt text</span>
        <input
          value={block.alt ?? ''}
          onChange={e => onChange({ alt: e.target.value })}
          placeholder="Describe what the diagram shows, for screen readers"
          className="field text-sm"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Caption</span>
        <input
          value={block.caption ?? ''}
          onChange={e => onChange({ caption: e.target.value })}
          placeholder="One line shown under the diagram"
          className="field text-sm"
        />
      </label>
    </div>
  )
}

function VizBlockEditor({ block, onChange, courseId = 'geometry' }) {
  const [editingBridge, setEditingBridge] = useState(false)
  const [editingSource, setEditingSource] = useState(false)
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="flex flex-col gap-1 col-span-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Viz ID</span>
        <input
          value={block.vizId ?? ''}
          onChange={e => onChange({ vizId: e.target.value })}
          className="field text-sm font-mono"
          placeholder="LALesson01_Vectors"
        />
      </label>
      <label className="flex flex-col gap-1 col-span-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Title</span>
        <input value={block.title ?? ''} onChange={e => onChange({ title: e.target.value })} className="field text-sm" />
      </label>
      <label className="flex flex-col gap-1 col-span-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Caption</span>
        <input value={block.caption ?? ''} onChange={e => onChange({ caption: e.target.value })} className="field text-sm" />
      </label>
      <div className="col-span-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Math bridge</span>
        <MarkdownEditButton onClick={() => setEditingBridge(true)} label="📝 Edit + Preview" />
      </div>
      <textarea
        value={block.mathBridge ?? ''}
        onChange={e => onChange({ mathBridge: e.target.value })}
        rows={2}
        className="field text-sm resize-none col-span-2"
      />
      {editingBridge && (
        <Suspense fallback={<div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-950 text-slate-400">Loading editor…</div>}>
          <MarkdownCellEditor
            value={block.mathBridge ?? ''}
            onChange={v => onChange({ mathBridge: v })}
            onClose={() => setEditingBridge(false)}
            title="📝 Math Bridge"
          />
        </Suspense>
      )}
      {block.vizId && (
        <div className="col-span-2 mt-2 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live preview</p>
            <button
              type="button"
              onClick={() => setEditingSource(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            >
              ✎ Edit source
            </button>
          </div>
          <VizFrame id={block.vizId} title={block.title} />
        </div>
      )}
      {editingSource && (
        <Suspense fallback={<div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-950 text-slate-400">Loading editor…</div>}>
          <VizSourceEditor vizId={block.vizId} courseId={courseId} onClose={() => setEditingSource(false)} />
        </Suspense>
      )}
    </div>
  )
}

const CALLOUT_TYPES = ['insight', 'definition', 'theorem', 'tip', 'warning', 'intuition', 'prior-knowledge', 'real-world', 'geometric', 'mnemonic', 'procedure', 'proof', 'example', 'misconception', 'history', 'strategy', 'application']

function CalloutBlockEditor({ block, onChange }) {
  const [editingBody, setEditingBody] = useState(false)
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select value={block.calloutType ?? 'insight'} onChange={e => onChange({ calloutType: e.target.value })} className="field text-xs py-1 font-mono">
          {CALLOUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="ml-auto"><MarkdownEditButton onClick={() => setEditingBody(true)} /></div>
      </div>
      <input value={block.title ?? ''} onChange={e => onChange({ title: e.target.value })} placeholder="Callout title" className="field text-sm" />
      <textarea value={block.body ?? ''} onChange={e => onChange({ body: e.target.value })} rows={2} placeholder="Callout body — markdown/LaTeX ok" className="field text-sm resize-none" />
      {editingBody && (
        <Suspense fallback={<div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-950 text-slate-400">Loading editor…</div>}>
          <MarkdownCellEditor value={block.body ?? ''} onChange={v => onChange({ body: v })} onClose={() => setEditingBody(false)} title="💡 Callout Body" />
        </Suspense>
      )}
    </div>
  )
}

// Catches any block type without a dedicated editor above — instead of a
// dead "isn't editable here yet" message, this makes it actually editable
// as raw JSON. Nothing in a lesson should ever be invisible or stuck.
function GenericBlockEditor({ block, onChange }) {
  const [text, setText] = useState(() => JSON.stringify(block, null, 2))
  const [error, setError] = useState('')
  const apply = () => {
    try {
      const parsed = JSON.parse(text)
      onChange(parsed)
      setError('')
    } catch (e) {
      setError('Invalid JSON: ' + e.message)
    }
  }
  return (
    <div className="space-y-2">
      <p className="text-[10px] text-amber-600 dark:text-amber-400">
        No dedicated editor for "{block.type}" blocks yet — editing as raw data. Click Apply to commit changes.
      </p>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={8} spellCheck={false} className="field font-mono text-xs resize-y w-full" />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button onClick={apply} className="px-3 py-1 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white">Apply</button>
    </div>
  )
}

function BlockItem({ block, sectionId, dispatch, index, total, courseId }) {
  const meta = BLOCK_TYPE_META[block.type] ?? { icon: '❓', label: block.type }
  const onChange = updates => dispatch({ type: 'UPDATE_BLOCK_ITEM', sectionId, blockId: block._id, updates })

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
        <span className="text-sm">{meta.icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{meta.label}</span>
        <div className="ml-auto flex items-center gap-1">
          {index > 0 && (
            <button onClick={() => dispatch({ type: 'MOVE_BLOCK_ITEM_UP', sectionId, blockId: block._id })} className="text-xs text-slate-400 hover:text-slate-600 px-1" title="Move up">↑</button>
          )}
          {index < total - 1 && (
            <button onClick={() => dispatch({ type: 'MOVE_BLOCK_ITEM_DOWN', sectionId, blockId: block._id })} className="text-xs text-slate-400 hover:text-slate-600 px-1" title="Move down">↓</button>
          )}
          <button
            onClick={() => {
              if (window.confirm(`Remove this ${meta.label.toLowerCase()} block?`)) {
                dispatch({ type: 'REMOVE_BLOCK_ITEM', sectionId, blockId: block._id })
              }
            }}
            className="text-xs text-red-400 hover:text-red-600 px-1"
          >✕</button>
        </div>
      </div>
      <div className="px-3 py-3">
        {block.type === 'prose' && <ProseBlockEditor block={block} onChange={onChange} />}
        {block.type === 'image' && <ImageBlockEditor block={block} onChange={onChange} courseId={courseId} />}
        {block.type === 'viz' && <VizBlockEditor block={block} onChange={onChange} courseId={courseId} />}
        {block.type === 'callout' && <CalloutBlockEditor block={block} onChange={onChange} />}
        {!['prose', 'image', 'viz', 'callout'].includes(block.type) && (
          <GenericBlockEditor block={block} onChange={onChange} />
        )}
      </div>
    </div>
  )
}

export default function BlockListEditor({ sec, sectionId, dispatch, courseId }) {
  const blocks = sec.blocks ?? []
  const addBlock = blockType => dispatch({ type: 'ADD_BLOCK_ITEM', sectionId, blockType })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Blocks — prose and diagrams, in the order they're shown
        </span>
      </div>

      {blocks.map((block, i) => (
        <BlockItem key={block._id} block={block} sectionId={sectionId} dispatch={dispatch} index={i} total={blocks.length} courseId={courseId} />
      ))}

      {blocks.length === 0 && (
        <p className="text-slate-300 dark:text-slate-600 italic text-sm">No blocks yet — add one below.</p>
      )}

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => addBlock('prose')} className="px-3 py-1.5 text-xs text-brand-600 border border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/30 rounded-lg font-semibold">
          + Prose
        </button>
        <button onClick={() => addBlock('image')} className="px-3 py-1.5 text-xs text-brand-600 border border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/30 rounded-lg font-semibold">
          + Image
        </button>
        <button onClick={() => addBlock('viz')} className="px-3 py-1.5 text-xs text-brand-600 border border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/30 rounded-lg font-semibold">
          + Visualization
        </button>
        <button onClick={() => addBlock('callout')} className="px-3 py-1.5 text-xs text-brand-600 border border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/30 rounded-lg font-semibold">
          + Callout
        </button>
      </div>
    </div>
  )
}
