import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ALL_LESSONS } from '../../content/index.js'

const STORAGE_KEY = 'oc-sticky-notes'

// Build a fast id→meta lookup from the flat lesson list
const LESSON_META = Object.fromEntries(
  ALL_LESSONS.map(l => [l.id, {
    title: l.title,
    chapterTitle: l.chapterTitle,
    path: `/chapter/${l.chapterNumber}/${l.slug}`,
  }])
)

const DOT = { yellow: '#fbbf24', blue: '#60a5fa', green: '#4ade80', pink: '#f472b6', orange: '#fb923c' }

function parseNoteId(noteId) {
  const idx = noteId.indexOf(':')
  if (idx === -1) return { lessonId: noteId, section: '' }
  const lessonId = noteId.slice(0, idx)
  const rest = noteId.slice(idx + 1)
  const section = rest.startsWith('viz:') ? 'Viz' : rest.charAt(0).toUpperCase() + rest.slice(1)
  return { lessonId, section }
}

function readNotes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  catch { return {} }
}

export default function NotesPanel() {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState({})
  const navigate = useNavigate()

  // Refresh list whenever the panel opens
  useEffect(() => {
    if (open) setNotes(readNotes())
  }, [open])

  // Sync from other tabs or same-tab saves via custom event
  useEffect(() => {
    const handler = () => setNotes(readNotes())
    window.addEventListener('storage', handler)
    window.addEventListener('oc-note-change', handler)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('oc-note-change', handler)
    }
  }, [])

  const entries = Object.entries(notes)
    .filter(([, n]) => n?.text?.trim())
    .sort((a, b) => (b[1].updatedAt ?? 0) - (a[1].updatedAt ?? 0))

  function go(noteId) {
    const { lessonId } = parseNoteId(noteId)
    const meta = LESSON_META[lessonId]
    if (!meta) return
    navigate(meta.path)
    setOpen(false)
  }

  return (
    <div className="hidden lg:block fixed right-0 top-[60px] bottom-0 z-[39] pointer-events-none">
      {/* Slide-in panel */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-[280px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 pointer-events-auto shadow-xl ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base">✏️</span>
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">Notes</span>
            {entries.length > 0 && (
              <span className="text-xs font-bold bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded-full">
                {entries.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto py-2">
          {entries.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="text-2xl mb-2">✏️</div>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                Click the pencil icon next to any section in a lesson to add a note.
              </p>
            </div>
          ) : (
            entries.map(([noteId, note]) => {
              const { lessonId, section } = parseNoteId(noteId)
              const meta = LESSON_META[lessonId]
              const dot = DOT[note.color] ?? DOT.yellow
              return (
                <div
                  key={noteId}
                  className="group flex items-start gap-2 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                >
                  {/* Color dot */}
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, marginTop: 5, flexShrink: 0 }} />

                  <button onClick={() => go(noteId)} className="flex-1 text-left min-w-0">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug truncate">
                      {meta?.title ?? lessonId}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1 flex-wrap">
                      {section && <span className="font-medium text-slate-500 dark:text-slate-400">{section}</span>}
                      {section && meta?.chapterTitle && <span>·</span>}
                      {meta?.chapterTitle && <span className="truncate">{meta.chapterTitle}</span>}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug line-clamp-2">
                      {note.text.trim().replace(/\*\*|__|\$|`/g, '').slice(0, 130)}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      const all = readNotes()
                      delete all[noteId]
                      localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
                      setNotes({ ...all })
                    }}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 text-slate-300 hover:text-red-400 transition-all"
                    title="Delete note"
                  >
                    ✕
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Tab trigger — positioned below the Pins tab */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`pointer-events-auto absolute top-[52px] flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-l-lg border border-r-0 shadow-md transition-all duration-200 ${
          open
            ? 'right-[280px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            : 'right-0 bg-yellow-50 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/60'
        }`}
      >
        <span>✏️</span>
        <span>Notes</span>
        {entries.length > 0 && (
          <span className={`text-[10px] font-bold px-1 rounded-full leading-none py-0.5 ${open ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-yellow-400 dark:bg-yellow-500 text-white'}`}>
            {entries.length}
          </span>
        )}
      </button>
    </div>
  )
}
