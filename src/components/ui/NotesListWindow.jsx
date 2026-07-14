import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, X, Download, Upload } from 'lucide-react'
import { useThemeColors } from '../../hooks/useThemeColors.js'
import { useDesktop } from '../desktop/DesktopProvider.jsx'
import { ALL_LESSONS } from '../../courses/index.js'
import NoteEditorWindow from './NoteEditorWindow.jsx'
import { readUserNotes, readMergedNotes, removeNote, newNoteId, STORAGE_KEY } from './notesStore.js'

// Browses all notes and launches each one as its own FloatingWindow (via
// openWindow) — draggable, resizable, independent of this list, so several
// notes can be open side by side. This list itself is NOT a floating window —
// it's a fixed, anchored, resizable panel that stays open until its own
// close button is clicked (never on an outside click).

const MIN_W = 300
const MIN_H = 280

const COLOR_DOTS = { yellow: '#fbbf24', blue: '#60a5fa', green: '#4ade80', pink: '#f472b6', orange: '#fb923c' }

const LESSON_META = Object.fromEntries(
  ALL_LESSONS.map(l => [l.id, { title: l.title }])
)

// `note.title` (typed by the user in NoteEditorWindow) always wins for the
// bold/primary line when set. The `label` line is secondary context — for a
// manual note that's just the date it was written, not something that needs
// its own editor field; for a lesson-tied note it's still which section of
// the lesson it came from.
function describeNote(noteId, note) {
  if (note.manual) {
    const label = new Date(note.updatedAt ?? Date.now()).toLocaleDateString()
    return { label, title: note.title?.trim() || 'Untitled note' }
  }
  const idx = noteId.indexOf(':')
  const lessonId = idx === -1 ? noteId : noteId.slice(0, idx)
  const rest = idx === -1 ? '' : noteId.slice(idx + 1)
  let section
  if (rest.startsWith('viz:')) section = 'Viz'
  else if (rest.startsWith('example:')) section = 'Example'
  else if (rest) section = rest.charAt(0).toUpperCase() + rest.slice(1)
  else section = 'Note'
  return { label: section, title: note.title?.trim() || LESSON_META[lessonId]?.title || lessonId }
}

export default function NotesListWindow({ onClose }) {
  const C = useThemeColors()
  const { openWindow } = useDesktop()
  const importRef = useRef(null)
  const [notes, setNotes] = useState(readMergedNotes)
  const [size, setSize] = useState({ w: 340, h: 480 })
  const resizing = useRef(false)
  const resizeOrigin = useRef({ mx: 0, my: 0, sw: 0, sh: 0 })

  const refresh = useCallback(() => setNotes(readMergedNotes()), [])

  function startResize(e) {
    e.preventDefault()
    resizing.current = true
    resizeOrigin.current = { mx: e.clientX, my: e.clientY, sw: size.w, sh: size.h }
  }

  useEffect(() => {
    const move = (e) => {
      if (!resizing.current) return
      const maxW = window.innerWidth - 24
      const maxH = window.innerHeight - 80
      // Anchored to the bottom-right corner, so growing means dragging up/left —
      // width grows as the mouse moves left, height grows as it moves up.
      setSize({
        w: Math.min(maxW, Math.max(MIN_W, resizeOrigin.current.sw - (e.clientX - resizeOrigin.current.mx))),
        h: Math.min(maxH, Math.max(MIN_H, resizeOrigin.current.sh - (e.clientY - resizeOrigin.current.my))),
      })
    }
    const up = () => { resizing.current = false }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('storage', refresh)
    window.addEventListener('oc-note-change', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('oc-note-change', refresh)
    }
  }, [refresh])

  function openNote(noteId, title) {
    openWindow({
      id: `note-${noteId}`,
      label: title || 'Note',
      emoji: '📝',
      width: 460,
      height: 480,
      Component: (props) => <NoteEditorWindow {...props} noteId={noteId} />,
    })
  }

  function createNote() {
    const id = newNoteId()
    openNote(id, 'Untitled note')
  }

  const exportNotes = () => {
    const user = readUserNotes()
    const clean = {}
    for (const [id, n] of Object.entries(user)) {
      if (n?.text?.trim()) { const { _isDefault, _imported, ...rest } = n; clean[id] = rest }
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' }))
    a.download = 'open-calc-notes.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importNotes = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result)
        const current = readUserNotes()
        for (const [id, note] of Object.entries(imported)) {
          if (id === '__version') continue
          if (!current[id]?.text?.trim()) current[id] = { ...note, _imported: true }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
        refresh()
        window.dispatchEvent(new Event('oc-note-change'))
      } catch {}
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const sortedNotes = Object.entries(notes)
    .filter(([, n]) => n?.text?.trim())
    .sort((a, b) => (b[1].updatedAt ?? 0) - (a[1].updatedAt ?? 0))

  return (
    <div
      style={{
        position: 'fixed', bottom: 52, right: 8, zIndex: 1900,
        width: size.w, height: size.h,
        display: 'flex', flexDirection: 'column',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
        border: `1px solid ${C.border}`,
        background: C.surface,
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: C.text }}>
          Notes
          {sortedNotes.length > 0 && (
            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, background: C.blueBg, color: C.blue }}>{sortedNotes.length}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button onClick={createNote} title="Create note" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', fontSize: 11, fontWeight: 700, borderRadius: 8, border: 'none', background: C.blue, color: '#fff', cursor: 'pointer' }}>
            <Plus className="w-3.5 h-3.5" /> Create note
          </button>
          <button onClick={exportNotes} title="Export notes" style={{ padding: 6, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
            <Download className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => importRef.current?.click()} title="Import notes" style={{ padding: 6, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={importNotes} />
          <button onClick={onClose} title="Close" style={{ padding: 6, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {sortedNotes.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>No notes yet. Click "Create note" to write one.</p>
          </div>
        ) : (
          sortedNotes.map(([noteId, note]) => {
            const { label, title } = describeNote(noteId, note)
            const dot = COLOR_DOTS[note.color] ?? COLOR_DOTS.yellow
            return (
              <div key={noteId} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderBottom: `1px solid ${C.border}` }}>
                <button onClick={() => openNote(noteId, title)} style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted }}>{label}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.text}</div>
                </button>
                <button onClick={() => { removeNote(noteId); refresh() }} title="Delete" style={{ flexShrink: 0, padding: 4, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Resize handle — panel is anchored to the bottom-right corner, so
          dragging the top-left corner grows/shrinks it. */}
      <div
        onMouseDown={startResize}
        title="Resize"
        style={{ position: 'absolute', top: 0, left: 0, width: 16, height: 16, cursor: 'nwse-resize', zIndex: 10 }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ position: 'absolute', top: 2, left: 2, color: C.muted, opacity: 0.6 }}>
          <path d="M2 12L12 2M7 12L12 7M12 12L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
