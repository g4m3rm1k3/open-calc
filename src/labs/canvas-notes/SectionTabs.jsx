import { useState } from 'react'

// Top-level tab row — OneNote calls this level "Sections". Each section
// owns its own independent set of pages (see PageTabs.jsx). Double-click a
// tab to rename it in place; the small ✕ (hover-only) deletes it.
export default function SectionTabs({ sections, activeSectionId, onSelect, onAdd, onRename, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [draftTitle, setDraftTitle] = useState('')

  const commitRename = (id) => {
    if (draftTitle.trim()) onRename(id, draftTitle.trim())
    setEditingId(null)
  }

  return (
    <div className="flex items-center gap-1 px-2 pt-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-x-auto">
      {sections.map((section) => {
        const isActive = section.id === activeSectionId
        const isEditing = editingId === section.id
        return (
          <div
            key={section.id}
            className={`group flex items-center gap-1 px-3 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-b-0 border-slate-200 dark:border-slate-800'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
            }`}
            onClick={() => !isEditing && onSelect(section.id)}
            onDoubleClick={() => {
              setEditingId(section.id)
              setDraftTitle(section.title)
            }}
          >
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
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 text-xs"
              title="Delete section"
            >
              ✕
            </button>
          </div>
        )
      })}
      <button
        onClick={onAdd}
        className="px-2 py-1 text-slate-400 hover:text-brand-500 text-sm"
        title="Add section"
      >
        +
      </button>
    </div>
  )
}
