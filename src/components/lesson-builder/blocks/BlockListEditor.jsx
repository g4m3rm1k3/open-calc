// Editor for Intuition/Rigor sections using the prose+image `blocks[]`
// pattern (see src/courses/geometry/*/*.js, and
// src/courses/linear-algebra/1-vectors-spaces/001-what-is-a-vector.js).
// Each entry is one of: prose (paragraphs), image (diagram + caption), or
// viz (embedded interactive component) — rendered and edited in the exact
// order they'll appear on the real lesson page.
//
// Callouts are NOT part of this list — MicroCycleLesson.jsx renders them
// after the block sequence regardless of prose-vs-blocks mode, so they
// keep using the separate, untouched CalloutEditor in ProseCalloutBlock.jsx.

const BLOCK_TYPE_META = {
  prose: { icon: '📝', label: 'Prose' },
  image: { icon: '🖼️', label: 'Image' },
  viz: { icon: '🔭', label: 'Visualization' },
}

function ProseBlockEditor({ block, onChange }) {
  const text = (block.paragraphs ?? []).join('\n\n')
  return (
    <textarea
      value={text}
      onChange={e => onChange({ paragraphs: e.target.value.split(/\n{2,}/).map(s => s.trim()).filter(Boolean) })}
      rows={5}
      placeholder="Short prose chunk — a paragraph or two, then move to the next block…"
      className="field font-mono text-sm resize-y w-full"
    />
  )
}

function ImageBlockEditor({ block, onChange }) {
  return (
    <div className="space-y-2">
      {block._previewSrc && (
        <img src={block._previewSrc} alt={block.alt ?? ''} className="max-h-40 rounded-lg border border-slate-200 dark:border-slate-700" />
      )}
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Diagram path (relative to this lesson's folder, e.g. <code>../diagrams/foo.svg</code>)
        </span>
        <input
          value={block.importPath ?? ''}
          onChange={e => onChange({ importPath: e.target.value })}
          placeholder="../diagrams/my-diagram.svg"
          className="field font-mono text-xs"
        />
        {!block.importPath && (
          <span className="text-[10px] text-amber-600 dark:text-amber-400">
            No path set — the diagram must already exist on disk; this builder doesn't create SVGs.
          </span>
        )}
      </label>
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

function VizBlockEditor({ block, onChange }) {
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
      <label className="flex flex-col gap-1 col-span-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Math bridge</span>
        <textarea
          value={block.mathBridge ?? ''}
          onChange={e => onChange({ mathBridge: e.target.value })}
          rows={2}
          className="field text-sm resize-none"
        />
      </label>
    </div>
  )
}

function BlockItem({ block, sectionId, dispatch, index, total }) {
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
        {block.type === 'image' && <ImageBlockEditor block={block} onChange={onChange} />}
        {block.type === 'viz' && <VizBlockEditor block={block} onChange={onChange} />}
        {!['prose', 'image', 'viz'].includes(block.type) && (
          <p className="text-xs text-slate-400 italic">
            Type "{block.type}" isn't editable here yet — preserved as-is on export.
          </p>
        )}
      </div>
    </div>
  )
}

export default function BlockListEditor({ sec, sectionId, dispatch }) {
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
        <BlockItem key={block._id} block={block} sectionId={sectionId} dispatch={dispatch} index={i} total={blocks.length} />
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
      </div>
    </div>
  )
}
