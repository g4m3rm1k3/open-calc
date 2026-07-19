import { useState } from 'react'

// Side tab column — OneNote calls this level "Pages". Only ever shows the
// pages belonging to whichever section is currently active in SectionTabs.
// Double-click a tab to rename it in place; the small ✕ (hover-only) deletes it.
export default function PageTabs({ pages, activePageId, onSelect, onAdd, onRename, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [draftTitle, setDraftTitle] = useState('')

  const commitRename = (id) => {
    if (draftTitle.trim()) onRename(id, draftTitle.trim())
    setEditingId(null)
  }

  return (
    <div className="w-48 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      {pages.map((page) => {
        const isActive = page.id === activePageId
        const isEditing = editingId === page.id
        return (
          <div
            key={page.id}
            className={`group w-full flex items-center gap-1 pl-4 pr-2 py-2.5 text-sm border-l-2 transition-colors cursor-pointer ${
              isActive
                ? 'border-brand-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            onClick={() => !isEditing && onSelect(page.id)}
            onDoubleClick={() => {
              setEditingId(page.id)
              setDraftTitle(page.title)
            }}
          >
            {isEditing ? (
              <input
                autoFocus
                value={draftTitle}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={() => commitRename(page.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename(page.id)
                  if (e.key === 'Escape') setEditingId(null)
                }}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent border-b border-brand-400 outline-none flex-1 min-w-0"
              />
            ) : (
              <span className="flex-1 truncate">{page.title}</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(page.id)
              }}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 text-xs"
              title="Delete page"
            >
              ✕
            </button>
          </div>
        )
      })}
      <button
        onClick={onAdd}
        className="w-full text-left pl-4 pr-2 py-2 text-sm text-slate-400 hover:text-brand-500"
        title="Add page"
      >
        + Add page
      </button>
    </div>
  )
}
