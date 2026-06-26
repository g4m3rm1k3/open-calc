import { useState, useRef } from 'react'
import { SECTION_COLORS } from './builderUtils.js'
import { SECTION_LABELS, SECTION_ICONS } from './BuilderCanvas.jsx'

// Color → Tailwind class pairs (must be literal strings for Tailwind purge)
const DOT_COLORS = {
  indigo: 'bg-indigo-400',   violet: 'bg-violet-400',  purple: 'bg-purple-400',
  sky:    'bg-sky-400',      teal:   'bg-teal-400',    amber:  'bg-amber-400',
  emerald:'bg-emerald-400',  orange: 'bg-orange-400',  cyan:   'bg-cyan-400',
  pink:   'bg-pink-400',     lime:   'bg-lime-400',    green:  'bg-green-400',
  rose:   'bg-rose-400',     fuchsia:'bg-fuchsia-400', yellow: 'bg-yellow-400',
  blue:   'bg-blue-400',     red:    'bg-red-400',     slate:  'bg-slate-400',
}
const RING_COLORS = {
  indigo: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
  violet: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
  purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  sky:    'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
  teal:   'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
  amber:  'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  emerald:'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  orange: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  cyan:   'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
  pink:   'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',
  lime:   'bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-300',
  green:  'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  rose:   'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  fuchsia:'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-300',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
  blue:   'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  red:    'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  slate:  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
}

function trunc(s, n = 28) {
  if (!s) return ''
  return s.length > n ? s.slice(0, n) + '…' : s
}

// ── Tree node sub-components ─────────────────────────────────────────────────

function StepRow({ label, color, selected, onClick, onDelete }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-left group transition-colors text-[11px] ${
        selected ? RING_COLORS[color] ?? RING_COLORS.slate : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
      }`}
    >
      <span className="text-slate-300 dark:text-slate-600 shrink-0">└</span>
      <span className="text-slate-300 dark:text-slate-600 shrink-0">·</span>
      <span className="truncate flex-1">{label || '(unlabeled step)'}</span>
      {onDelete && (
        <span
          role="button"
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 px-1 shrink-0"
          title="Delete step"
        >✕</span>
      )}
    </button>
  )
}

function ItemRow({ label, icon, color, depth, selected, onClick, onDelete, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  const hasChildren = children && children.length > 0
  const indent = depth === 1 ? 'pl-4' : 'pl-8'

  return (
    <div>
      <div className={`${indent} flex items-center gap-1`}>
        {hasChildren && (
          <button
            onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 w-4 text-center text-[10px] shrink-0"
          >
            {open ? '▾' : '▸'}
          </button>
        )}
        {!hasChildren && <span className="w-4 shrink-0" />}

        <button
          onClick={onClick}
          className={`flex-1 flex items-center gap-1.5 px-2 py-1 rounded text-left group transition-colors text-[11px] min-w-0 ${
            selected ? RING_COLORS[color] ?? RING_COLORS.slate : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}
        >
          <span className="text-[10px] shrink-0">{icon}</span>
          <span className="truncate flex-1">{label}</span>
          {onDelete && (
            <span
              role="button"
              onClick={e => { e.stopPropagation(); onDelete() }}
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 px-1 shrink-0"
              title="Delete"
            >✕</span>
          )}
        </button>
      </div>

      {hasChildren && open && (
        <div className="pl-8">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Build children for each section type ────────────────────────────────────

function WalkthroughChildren({ sec, dispatch, selectedPath, onSelect }) {
  const items = sec.items ?? []
  if (!items.length) return <p className="pl-12 text-[10px] text-slate-400 italic py-1">No walkthroughs yet</p>

  return items.map((wt, wi) => {
    const wtKey = wt.id ?? `wt-${wi}`
    const steps = wt.steps ?? []
    const isItemSelected = selectedPath?.itemKey === wtKey

    const deleteWt = () => {
      dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates: { items: items.filter((_, i) => i !== wi) } })
    }
    const deleteStep = (si) => {
      const updatedItems = items.map((w, i) =>
        i !== wi ? w : { ...w, steps: steps.filter((_, j) => j !== si) }
      )
      dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates: { items: updatedItems } })
    }

    return (
      <ItemRow
        key={wtKey}
        label={`WT: "${trunc(wt.title, 22)}"`}
        icon="🚶"
        color={SECTION_COLORS[sec.type] ?? 'slate'}
        depth={1}
        selected={isItemSelected && !selectedPath?.stepIndex}
        onClick={() => onSelect({ sectionId: sec._id, itemKey: wtKey })}
        onDelete={deleteWt}
        defaultOpen
      >
        {steps.map((step, si) => (
          <StepRow
            key={si}
            label={trunc(step.label, 26)}
            color={SECTION_COLORS[sec.type] ?? 'slate'}
            selected={isItemSelected && selectedPath?.stepIndex === si}
            onClick={() => onSelect({ sectionId: sec._id, itemKey: wtKey, stepIndex: si })}
            onDelete={() => deleteStep(si)}
          />
        ))}
      </ItemRow>
    )
  })
}

function ItemListChildren({ sec, dispatch, selectedPath, onSelect, icon, prefix, getLabel }) {
  const items = sec.items ?? []
  if (!items.length) return null

  return items.map((item, i) => {
    const key = item.id ?? `item-${i}`
    const label = getLabel(item, i)
    const deleteItem = () => {
      dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates: { items: items.filter((_, j) => j !== i) } })
    }
    return (
      <ItemRow
        key={key}
        label={label}
        icon={icon}
        color={SECTION_COLORS[sec.type] ?? 'slate'}
        depth={1}
        selected={selectedPath?.itemKey === key}
        onClick={() => onSelect({ sectionId: sec._id, itemKey: key })}
        onDelete={deleteItem}
        defaultOpen={false}
      >
        {[]}
      </ItemRow>
    )
  })
}

function VizChildren({ sec, dispatch, selectedPath, onSelect }) {
  const children = sec.children ?? []
  if (!children.length) return null

  return children.map(child => (
    <ItemRow
      key={child._id}
      label={`${child.vizId || 'Viz'}${child.title ? ': ' + trunc(child.title, 18) : ''}`}
      icon="📊"
      color={SECTION_COLORS[sec.type] ?? 'slate'}
      depth={1}
      selected={selectedPath?.childId === child._id}
      onClick={() => onSelect({ sectionId: sec._id, childId: child._id })}
      onDelete={() => dispatch({ type: 'REMOVE_CHILD', sectionId: sec._id, childId: child._id })}
      defaultOpen={false}
    >
      {[]}
    </ItemRow>
  ))
}

function CellChildren({ sec, selectedPath, onSelect, getLabel, icon }) {
  const cells = sec.cells ?? []
  if (!cells.length) return null

  return cells.map((cell, i) => {
    const key = cell.id ?? `cell-${i}`
    return (
      <ItemRow
        key={key}
        label={trunc(getLabel(cell, i), 26)}
        icon={icon}
        color={SECTION_COLORS[sec.type] ?? 'slate'}
        depth={1}
        selected={selectedPath?.itemKey === key}
        onClick={() => onSelect({ sectionId: sec._id, itemKey: key })}
        onDelete={null}
        defaultOpen={false}
      >
        {[]}
      </ItemRow>
    )
  })
}

function SectionChildren({ sec, dispatch, selectedPath, onSelect }) {
  switch (sec.type) {
    case 'walkthroughs':
      return <WalkthroughChildren sec={sec} dispatch={dispatch} selectedPath={selectedPath} onSelect={onSelect} />
    case 'examples':
      return (
        <ItemListChildren sec={sec} dispatch={dispatch} selectedPath={selectedPath} onSelect={onSelect}
          icon="✏️" prefix="Ex"
          getLabel={(item, i) => `Ex ${i + 1}: ${trunc(item.title, 20)}`}
        />
      )
    case 'challenges':
      return (
        <ItemListChildren sec={sec} dispatch={dispatch} selectedPath={selectedPath} onSelect={onSelect}
          icon="🎯" prefix="Ch"
          getLabel={(item, i) => `Ch ${i + 1}: ${trunc(item.title, 20)}`}
        />
      )
    case 'quiz':
      return (
        <ItemListChildren sec={sec} dispatch={dispatch} selectedPath={selectedPath} onSelect={onSelect}
          icon="❓" prefix="Q"
          getLabel={(item, i) => `Q${i + 1}: ${trunc(item.question ?? item.text, 22)}`}
        />
      )
    case 'checkpoints':
      return (
        <ItemListChildren sec={sec} dispatch={dispatch} selectedPath={selectedPath} onSelect={onSelect}
          icon="✅" prefix="CP"
          getLabel={(item, i) => `${i + 1}: ${trunc(item.label, 22)}`}
        />
      )
    case 'misconceptions':
    case 'assessment':
    case 'transferPrompts':
    case 'debugging':
      return (
        <ItemListChildren sec={sec} dispatch={dispatch} selectedPath={selectedPath} onSelect={onSelect}
          icon={SECTION_ICONS[sec.type] ?? '·'}
          prefix=""
          getLabel={(item, i) => `${i + 1}: ${trunc(item.title ?? item.label ?? item.text ?? '', 22)}`}
        />
      )
    case 'intuition':
    case 'rigor':
    case 'math':
      return <VizChildren sec={sec} dispatch={dispatch} selectedPath={selectedPath} onSelect={onSelect} />
    case 'cells':
      return (
        <CellChildren sec={sec} selectedPath={selectedPath} onSelect={onSelect}
          icon="⚗️"
          getLabel={(cell, i) => cell.cellTitle ?? cell.type ?? `Cell ${i + 1}`}
        />
      )
    case 'python':
      return (
        <CellChildren sec={sec} selectedPath={selectedPath} onSelect={onSelect}
          icon="🐍"
          getLabel={(cell, i) => cell.cellTitle ?? `Cell ${i + 1}`}
        />
      )
    default:
      return null
  }
}

// ── Top-level section row (draggable) ────────────────────────────────────────

function SectionRow({ sec, index, total, dispatch, color, expanded, onToggle, selected, onSelect, selectedPath, onSelectChild, dragState, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const isActive = selectedPath?.sectionId === sec._id
  const label = SECTION_LABELS[sec.type] ?? sec.type
  const icon = SECTION_ICONS[sec.type] ?? '❓'
  const dot = DOT_COLORS[color] ?? DOT_COLORS.slate

  const [childCount] = [
    (sec.items?.length ?? 0) +
    (sec.children?.length ?? 0) +
    (sec.cells?.length ?? 0)
  ]

  const isDragOver = dragState.overId === sec._id
  const isDragging = dragState.draggingId === sec._id

  return (
    <div>
      {/* Drop indicator line above */}
      {isDragOver && dragState.position === 'before' && (
        <div className="h-0.5 bg-brand-400 rounded mx-2 mb-1" />
      )}

      <div
        draggable
        onDragStart={e => { e.dataTransfer.setData('tree-section-id', sec._id); onDragStart(sec._id) }}
        onDragOver={e => { e.preventDefault(); onDragOver(sec._id, e) }}
        onDrop={e => { e.preventDefault(); onDrop(sec._id) }}
        onDragEnd={onDragEnd}
        className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors cursor-pointer select-none ${
          isDragging ? 'opacity-40' : ''
        } ${
          isActive && !selectedPath?.itemKey
            ? (RING_COLORS[color] ?? RING_COLORS.slate) + ' font-semibold'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
        }`}
        onClick={() => onSelect(sec._id)}
      >
        {/* Drag handle */}
        <span className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 text-[11px]">
          ⋮⋮
        </span>

        {/* Expand toggle */}
        <button
          onClick={e => { e.stopPropagation(); onToggle() }}
          className="text-slate-400 dark:text-slate-500 hover:text-slate-600 w-4 text-center text-[10px] shrink-0"
        >
          {childCount > 0 ? (expanded ? '▾' : '▸') : ' '}
        </button>

        {/* Color dot + icon + label */}
        <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
        <span className="text-sm shrink-0">{icon}</span>
        <span className="text-xs font-semibold flex-1 truncate">{label}</span>

        {/* Item count badge */}
        {childCount > 0 && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 ml-1">{childCount}</span>
        )}

        {/* Position badges */}
        <span className="text-[9px] text-slate-300 dark:text-slate-600 shrink-0">{index + 1}/{total}</span>

        {/* Delete */}
        <button
          onClick={e => {
            e.stopPropagation()
            if (window.confirm(`Remove ${label} section?`)) {
              dispatch({ type: 'REMOVE_SECTION', id: sec._id })
            }
          }}
          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs px-1 shrink-0 transition-opacity"
          title="Remove section"
        >✕</button>
      </div>

      {/* Children */}
      {expanded && childCount > 0 && (
        <div className="mt-0.5 mb-1">
          <SectionChildren sec={sec} dispatch={dispatch} selectedPath={selectedPath} onSelect={onSelectChild} />
        </div>
      )}

      {/* Drop indicator line below */}
      {isDragOver && dragState.position === 'after' && (
        <div className="h-0.5 bg-brand-400 rounded mx-2 mt-1" />
      )}
    </div>
  )
}

// ── Rigid block row (Identity / Hook / Mental Model) ─────────────────────────

function RigidRow({ id, label, icon, color, selectedId, onSelect }) {
  const dot = DOT_COLORS[color] ?? DOT_COLORS.slate
  const isSelected = selectedId === id
  return (
    <div
      onClick={() => onSelect(id)}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? (RING_COLORS[color] ?? RING_COLORS.slate) + ' font-semibold'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
      }`}
    >
      <span className="w-4 shrink-0" /> {/* spacer for drag handle column */}
      <span className="w-4 shrink-0" /> {/* spacer for expand column */}
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      <span className="text-sm shrink-0">{icon}</span>
      <span className="text-xs font-semibold flex-1 truncate text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-[9px] text-slate-300 dark:text-slate-600 shrink-0 ml-1">Required</span>
    </div>
  )
}

// ── Main panel ───────────────────────────────────────────────────────────────

export default function LessonTreePanel({ state, dispatch, selectedId, onSelect }) {
  const { meta, sections } = state

  // Each section can be expanded to show children
  const [expanded, setExpanded] = useState(() => {
    const init = {}
    state.sections.forEach(s => { init[s._id] = true })
    return init
  })
  const toggleExpand = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  // selectedPath tracks deeper selection: { sectionId, itemKey?, childId?, stepIndex? }
  const [selectedPath, setSelectedPath] = useState(null)

  // Sync section-level selection with outer selectedId
  const handleSectionSelect = id => {
    onSelect(id)
    setSelectedPath({ sectionId: id })
  }

  const handleChildSelect = path => {
    onSelect(path.sectionId)
    setSelectedPath(path)
    // Scroll the section into view
    const el = document.querySelector(`[data-block-id="${path.sectionId}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const handleRigidSelect = id => {
    onSelect(id)
    setSelectedPath(null)
  }

  // Drag-to-reorder state
  const [dragState, setDragState] = useState({ draggingId: null, overId: null, position: null })

  const handleDragStart = id => setDragState({ draggingId: id, overId: null, position: null })
  const handleDragOver = (overId, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    setDragState(prev => ({ ...prev, overId, position: e.clientY < midY ? 'before' : 'after' }))
  }
  const handleDrop = (targetId) => {
    const { draggingId, position } = dragState
    if (!draggingId || draggingId === targetId) { setDragState({ draggingId: null, overId: null, position: null }); return }
    const fromIdx = sections.findIndex(s => s._id === draggingId)
    const toIdx   = sections.findIndex(s => s._id === targetId)
    if (fromIdx === -1 || toIdx === -1) { setDragState({ draggingId: null, overId: null, position: null }); return }
    let dest = toIdx
    if (position === 'after') dest = toIdx + (fromIdx < toIdx ? 0 : 1)
    else dest = toIdx - (fromIdx > toIdx ? 0 : 1)
    dispatch({ type: 'MOVE_TO', id: draggingId, toIndex: Math.max(0, Math.min(dest, sections.length - 1)) })
    setDragState({ draggingId: null, overId: null, position: null })
  }
  const handleDragEnd = () => setDragState({ draggingId: null, overId: null, position: null })

  return (
    <aside className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
        <span className="text-sm">🗺</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lesson Map</span>
        <span className="ml-auto text-[10px] text-slate-400 font-mono">{sections.length} sections</span>
      </div>

      {/* Lesson title */}
      {meta.title && (
        <div className="px-4 py-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 truncate shrink-0">
          {meta.title}
        </div>
      )}

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {/* Rigid blocks */}
        <div className="px-2">
          <RigidRow id="__identity"   label="Identity"     icon="🪪" color="indigo" selectedId={selectedId} onSelect={handleRigidSelect} />
          <RigidRow id="__hook"       label="Hook"         icon="🪝" color="violet" selectedId={selectedId} onSelect={handleRigidSelect} />
          <RigidRow id="__mentalmodel" label="Mental Model" icon="🧩" color="purple" selectedId={selectedId} onSelect={handleRigidSelect} />
        </div>

        {sections.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 mx-3 my-1" />
        )}

        {/* Flexible sections */}
        <div className="px-2 space-y-0.5"
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            // Drop from the palette (block-type) — ignore here
            const sId = e.dataTransfer.getData('tree-section-id')
            if (!sId) return
          }}
        >
          {sections.map((sec, i) => (
            <SectionRow
              key={sec._id}
              sec={sec}
              index={i}
              total={sections.length}
              dispatch={dispatch}
              color={SECTION_COLORS[sec.type] ?? 'slate'}
              expanded={expanded[sec._id] !== false}
              onToggle={() => toggleExpand(sec._id)}
              selected={selectedId === sec._id}
              onSelect={handleSectionSelect}
              selectedPath={selectedPath?.sectionId === sec._id ? selectedPath : null}
              onSelectChild={handleChildSelect}
              dragState={dragState}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>

        {sections.length === 0 && (
          <p className="px-4 py-6 text-[11px] text-slate-400 italic text-center">
            Add sections from the palette to see them here.
          </p>
        )}
      </div>

      {/* Footer — summary counts */}
      <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 shrink-0 flex flex-wrap gap-x-3 gap-y-1">
        {sections.filter(s => s.type === 'walkthroughs').map(s => (
          <span key={s._id} className="text-[10px] text-cyan-600 dark:text-cyan-400">
            🚶 {(s.items ?? []).length} wt
          </span>
        ))}
        {sections.filter(s => s.type === 'examples').map(s => (
          <span key={s._id} className="text-[10px] text-emerald-600 dark:text-emerald-400">
            ✏️ {(s.items ?? []).length} ex
          </span>
        ))}
        {sections.filter(s => s.type === 'challenges').map(s => (
          <span key={s._id} className="text-[10px] text-orange-600 dark:text-orange-400">
            🎯 {(s.items ?? []).length} ch
          </span>
        ))}
        {sections.filter(s => s.type === 'quiz').map(s => (
          <span key={s._id} className="text-[10px] text-pink-600 dark:text-pink-400">
            🧪 {(s.items ?? []).length} q
          </span>
        ))}
      </div>
    </aside>
  )
}
