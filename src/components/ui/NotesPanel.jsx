import { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css'
import Editor from '@monaco-editor/react'
import { ChevronLeft, Plus, X, Download, Upload, Trash2 } from 'lucide-react'
import MarkdownToolbar from '../markdown-toolbar/MarkdownToolbar.jsx'
import { preprocess } from '../math/latexPreprocess.js'
import { useThemeColors } from '../../hooks/useThemeColors.js'
import { ALL_LESSONS } from '../../courses/index.js'
import DEFAULT_NOTES from './default-notes.json'

// A reusable notes panel: browse, create, and edit notes entirely in place —
// no navigation to the lesson a note was originally taken on. Replaces the
// old PinsNotesPopup notes tab (which navigated away) and the per-lesson
// inline StickyNote pencil icons (which only worked from inside a lesson).
// Pre-existing per-section notes (default-notes.json, or ones a user wrote
// via the old inline icons) still show up here — same storage key, same
// merge logic — just accessed from one central place now.

const STORAGE_KEY = 'oc-sticky-notes'

const LESSON_META = Object.fromEntries(
  ALL_LESSONS.map(l => [l.id, { title: l.title, chapterTitle: l.chapterTitle }])
)

const COLORS = [
  { id: 'yellow', dot: '#fbbf24', bg: '#fef9c3', bgDark: '#2d2500', border: '#fbbf24' },
  { id: 'blue',   dot: '#60a5fa', bg: '#dbeafe', bgDark: '#0c1f3a', border: '#60a5fa' },
  { id: 'green',  dot: '#4ade80', bg: '#dcfce7', bgDark: '#052e16', border: '#4ade80' },
  { id: 'pink',   dot: '#f472b6', bg: '#fce7f3', bgDark: '#3b0718', border: '#f472b6' },
  { id: 'orange', dot: '#fb923c', bg: '#ffedd5', bgDark: '#2c1500', border: '#fb923c' },
]

const FONT_SIZES = [12, 18, 24]
const FONT_LABELS = ['1×', '1.5×', '2×']

function readUserNotes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}

function readMergedNotes() {
  const user = readUserNotes()
  const merged = {}
  for (const [id, note] of Object.entries(DEFAULT_NOTES)) {
    if (id === '__version') continue
    if (note?.text?.trim()) merged[id] = { ...note, _isDefault: true }
  }
  for (const [id, note] of Object.entries(user)) {
    if (note?.deleted) { delete merged[id]; continue }
    if (note?.text?.trim()) merged[id] = note
  }
  return merged
}

function saveNote(id, data) {
  const all = readUserNotes()
  all[id] = { ...data, updatedAt: Date.now(), deleted: false }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  window.dispatchEvent(new Event('oc-note-change'))
}

function removeNote(id) {
  const all = readUserNotes()
  const hasDefault = !!DEFAULT_NOTES[id]?.text?.trim()
  if (hasDefault) all[id] = { deleted: true } // tombstone so the default stays hidden
  else delete all[id]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  window.dispatchEvent(new Event('oc-note-change'))
}

// Manually-created notes (via the + button here) carry their own `manual:
// true` flag and are labeled generically. Notes with no flag but a
// `lessonId:section`-shaped id are the pre-existing per-lesson ones —
// same display logic PinsNotesPopup already used, kept for backward compat.
function describeNote(noteId, note) {
  if (note.manual) return { label: 'Note', title: new Date(note.updatedAt ?? Date.now()).toLocaleDateString() }
  const idx = noteId.indexOf(':')
  const lessonId = idx === -1 ? noteId : noteId.slice(0, idx)
  const rest = idx === -1 ? '' : noteId.slice(idx + 1)
  let section
  if (rest.startsWith('viz:')) section = 'Viz'
  else if (rest.startsWith('example:')) section = 'Example'
  else if (rest) section = rest.charAt(0).toUpperCase() + rest.slice(1)
  else section = 'Note'
  const meta = LESSON_META[lessonId]
  return { label: section, title: meta?.title ?? lessonId }
}

function newNoteId() {
  return `manual:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function NotesPanel({ onClose }) {
  const C = useThemeColors()
  const ref = useRef(null)
  const importRef = useRef(null)
  const editorRef = useRef(null)

  const [notes, setNotes] = useState(readMergedNotes)
  const [activeId, setActiveId] = useState(null) // null = list view
  const [text, setText] = useState('')
  const [color, setColor] = useState('yellow')
  const [preview, setPreview] = useState(false)
  const [fontIdx, setFontIdx] = useState(0)
  const loadedRef = useRef(false)

  const refreshNotes = useCallback(() => setNotes(readMergedNotes()), [])

  useEffect(() => {
    window.addEventListener('storage', refreshNotes)
    window.addEventListener('oc-note-change', refreshNotes)
    return () => {
      window.removeEventListener('storage', refreshNotes)
      window.removeEventListener('oc-note-change', refreshNotes)
    }
  }, [refreshNotes])

  // Close on outside click / Escape — Escape backs out of edit view first
  useEffect(() => {
    const handleKey = e => {
      if (e.key !== 'Escape') return
      if (activeId !== null) setActiveId(null)
      else onClose()
    }
    const handleClick = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('mousedown', handleClick)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('mousedown', handleClick)
    }
  }, [onClose, activeId])

  // Auto-save the open note whenever its content changes
  useEffect(() => {
    if (activeId === null) return
    if (!loadedRef.current) { loadedRef.current = true; return }
    const existing = notes[activeId]
    if (text.trim()) {
      saveNote(activeId, { text, color, fontIdx, manual: existing?.manual ?? true })
    } else {
      removeNote(activeId)
    }
    refreshNotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, color, fontIdx])

  function openNote(id) {
    loadedRef.current = false
    const n = notes[id] ?? {}
    setText(n.text ?? '')
    setColor(n.color ?? 'yellow')
    setFontIdx(n.fontIdx ?? 0)
    setPreview(!!n.text?.trim())
    setActiveId(id)
  }

  function createNote() {
    const id = newNoteId()
    loadedRef.current = true // don't autosave an empty note the instant it opens
    setText('')
    setColor('yellow')
    setFontIdx(0)
    setPreview(false)
    setActiveId(id)
  }

  function backToList() {
    setActiveId(null)
    refreshNotes()
  }

  function deleteActive() {
    if (activeId) removeNote(activeId)
    setText('')
    setActiveId(null)
    refreshNotes()
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
        refreshNotes()
        window.dispatchEvent(new Event('oc-note-change'))
      } catch {}
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const insertBtn = (btn) => {
    const ed = editorRef.current
    if (!ed) return
    if (btn.plain != null) ed.trigger('keyboard', 'type', { text: btn.plain })
    else if (btn.snippet) ed.trigger('keyboard', 'editor.action.insertSnippet', { snippet: btn.snippet })
    ed.focus()
  }

  const sortedNotes = Object.entries(notes)
    .filter(([, n]) => n?.text?.trim())
    .sort((a, b) => (b[1].updatedAt ?? 0) - (a[1].updatedAt ?? 0))

  const activeColor = COLORS.find(c => c.id === color) ?? COLORS[0]
  const cardBg = C.isDark ? activeColor.bgDark : activeColor.bg

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', bottom: 52, right: 8, zIndex: 1900,
        width: 380, maxHeight: '76vh', minHeight: 320,
        display: 'flex', flexDirection: 'column',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
        border: `1px solid ${C.border}`,
        background: C.surface,
      }}
    >
      {activeId === null ? (
        <>
          {/* List header */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: C.text }}>
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

          {/* List body */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sortedNotes.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>No notes yet. Click "Create note" to write one.</p>
              </div>
            ) : (
              sortedNotes.map(([noteId, note]) => {
                const { label, title } = describeNote(noteId, note)
                const dot = COLORS.find(c => c.id === note.color)?.dot ?? COLORS[0].dot
                return (
                  <div key={noteId} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderBottom: `1px solid ${C.border}` }}>
                    <button onClick={() => openNote(noteId)} style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted }}>{label}</span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.text}</div>
                    </button>
                    <button onClick={() => { removeNote(noteId); refreshNotes() }} title="Delete" style={{ flexShrink: 0, padding: 4, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </>
      ) : (
        <>
          {/* Editor header */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: `1px solid ${activeColor.border}`, background: cardBg }}>
            <button onClick={backToList} title="Back to notes" style={{ display: 'flex', alignItems: 'center', gap: 2, padding: 4, color: C.text, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <ChevronLeft className="w-4 h-4" /> Notes
            </button>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  style={{
                    width: 13, height: 13, borderRadius: '50%', background: c.dot,
                    border: color === c.id ? `2px solid ${C.text}` : '1.5px solid transparent',
                    cursor: 'pointer', padding: 0,
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onClick={() => setFontIdx(i => (i + 1) % FONT_SIZES.length)}
                title={`Font size: ${FONT_LABELS[fontIdx]} — click to cycle`}
                style={{ fontSize: 10, background: 'none', cursor: 'pointer', padding: '1px 4px', border: fontIdx > 0 ? `1px solid ${activeColor.dot}88` : '1px solid transparent', borderRadius: 3, color: fontIdx > 0 ? activeColor.dot : C.muted, fontWeight: 600 }}
              >
                A{fontIdx === 0 ? '' : fontIdx === 1 ? '⁺' : '⁺⁺'}
              </button>
              <button onClick={() => setPreview(p => !p)} style={{ fontSize: 10, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px' }}>
                {preview ? 'edit' : 'preview'}
              </button>
              <button onClick={deleteActive} title="Delete note" style={{ padding: 4, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Editor content */}
          {preview ? (
            <div style={{ flex: 1, padding: 12, overflow: 'auto', background: cardBg }}>
              <div style={{ fontSize: FONT_SIZES[fontIdx], lineHeight: 1.7, color: C.text, wordBreak: 'break-word' }}>
                {text.trim() ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                    components={{
                      h1: ({ children }) => <h1 style={{ fontSize: '1.3em', fontWeight: 700, margin: '0.4em 0' }}>{children}</h1>,
                      h2: ({ children }) => <h2 style={{ fontSize: '1.15em', fontWeight: 700, margin: '0.4em 0' }}>{children}</h2>,
                      h3: ({ children }) => <h3 style={{ fontSize: '1.05em', fontWeight: 700, margin: '0.3em 0' }}>{children}</h3>,
                      p: ({ children }) => <p style={{ margin: '0.3em 0' }}>{children}</p>,
                      ul: ({ children }) => <ul style={{ paddingLeft: '1.4em', margin: '0.3em 0' }}>{children}</ul>,
                      ol: ({ children }) => <ol style={{ paddingLeft: '1.4em', margin: '0.3em 0' }}>{children}</ol>,
                      li: ({ children }) => <li style={{ margin: '0.1em 0' }}>{children}</li>,
                      strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
                      em: ({ children }) => <em>{children}</em>,
                      code: ({ inline, children }) => inline
                        ? <code style={{ background: 'rgba(100,116,139,0.15)', borderRadius: 3, padding: '1px 4px', fontFamily: 'monospace' }}>{children}</code>
                        : <pre style={{ background: 'rgba(100,116,139,0.12)', borderRadius: 6, padding: 8, overflowX: 'auto', margin: '0.4em 0' }}><code style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>{children}</code></pre>,
                      hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(100,116,139,0.2)', margin: '0.5em 0' }} />,
                      blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid rgba(100,116,139,0.4)', paddingLeft: '0.75em', margin: '0.3em 0', color: C.muted, fontStyle: 'italic' }}>{children}</blockquote>,
                      a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: C.blue, textDecoration: 'underline' }}>{children}</a>,
                    }}
                  >
                    {preprocess(text)}
                  </ReactMarkdown>
                ) : (
                  <span style={{ color: C.muted, fontStyle: 'italic' }}>Nothing here yet</span>
                )}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <MarkdownToolbar onInsert={insertBtn} />
              <div style={{ flex: 1, minHeight: 0 }}>
                <Editor
                  defaultValue={text}
                  language="markdown"
                  theme={C.isDark ? 'vs-dark' : 'vs'}
                  onChange={(v) => setText(v ?? '')}
                  onMount={(editor) => { editorRef.current = editor }}
                  options={{
                    fontSize: FONT_SIZES[fontIdx],
                    lineHeight: Math.round(FONT_SIZES[fontIdx] * 1.7),
                    minimap: { enabled: false },
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 10, bottom: 10 },
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
