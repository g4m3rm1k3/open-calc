import { useRef, useState } from 'react'

// Palette of section accent colours — clicking a section's colour dot cycles
// through these, giving each section a distinct visual identity (like OneNote).
const SECTION_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
]

// Top-level tab row — OneNote calls this level "Sections". Each section
// owns its own independent set of pages (see PageTabs.jsx). Double-click a
// tab to rename it in place; the small ✕ (hover-only) deletes it.
// Drag-to-reorder sections via HTML5 drag API.
export default function SectionTabs({
  sections,
  activeSectionId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onReorder,
  onSetColor,
}) {
  const [editingId, setEditingId] = useState(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const dragSrcIdxRef = useRef(null)

  const commitRename = (id) => {
    if (draftTitle.trim()) onRename(id, draftTitle.trim())
    setEditingId(null)
  }

  const cycleColor = (e, section) => {
    e.stopPropagation()
    const current = section.color ?? SECTION_COLORS[0]
    const idx = SECTION_COLORS.indexOf(current)
    const next = SECTION_COLORS[(idx + 1) % SECTION_COLORS.length]
    onSetColor?.(section.id, next)
  }

  return (
    <div className="flex items-end gap-0.5 px-2 pt-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-x-auto min-h-[42px]">
      {sections.map((section, idx) => {
        const isActive = section.id === activeSectionId
        const isEditing = editingId === section.id
        const isDragTarget = dragOverIdx === idx
        const accentColor = section.color ?? SECTION_COLORS[idx % SECTION_COLORS.length]

        return (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => {
              dragSrcIdxRef.current = idx
              e.dataTransfer.effectAllowed = 'move'
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              setDragOverIdx(idx)
            }}
            onDragLeave={() => setDragOverIdx(null)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOverIdx(null)
              if (dragSrcIdxRef.current !== null && dragSrcIdxRef.current !== idx) {
                onReorder?.(dragSrcIdxRef.current, idx)
              }
              dragSrcIdxRef.current = null
            }}
            onDragEnd={() => {
              dragSrcIdxRef.current = null
              setDragOverIdx(null)
            }}
            className={`group flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors select-none ${
              isActive
                ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-b-0 border-slate-200 dark:border-slate-800 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
            } ${isDragTarget ? 'ring-2 ring-brand-400 ring-inset rounded-t-lg' : ''}`}
            style={isActive ? { borderTopColor: accentColor } : {}}
            onClick={() => !isEditing && onSelect(section.id)}
            onDoubleClick={() => {
              setEditingId(section.id)
              setDraftTitle(section.title)
            }}
          >
            {/* Color dot — click to cycle through accent colours */}
            <button
              onClick={(e) => cycleColor(e, section)}
              title="Change section color"
              className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-offset-1 ring-transparent hover:ring-current transition-all"
              style={{ background: accentColor }}
            />

            {isEditing ? (
              <input
                autoFocus
                value={draftTitle}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={() => commitRename(section.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename(section.id)
                  if (e.key === 'Escape') setEditingId(null)
                }}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent border-b border-brand-400 outline-none w-24"
              />
            ) : (
              <span>{section.title}</span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(section.id)
              }}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 text-xs shrink-0"
              title="Delete section"
            >
              ✕
            </button>
          </div>
        )
      })}
      <button
        onClick={onAdd}
        className="px-2 py-1.5 mb-0 text-slate-400 hover:text-brand-500 text-sm transition-colors self-center"
        title="Add section"
      >
        +
      </button>
    </div>
  )
}
