import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePins } from '../../context/PinsContext.jsx'
import { ALL_LESSONS } from '../../courses/index.js'
import DEFAULT_NOTES from '../ui/default-notes.json'
import { Pin, PenLine, X, Download, Upload } from 'lucide-react'

const STORAGE_KEY = 'oc-sticky-notes'

const LESSON_META = Object.fromEntries(
  ALL_LESSONS.map(l => [
    l.id,
    { title: l.title, path: `/chapter/${l.chapterNumber}/${l.slug}` },
  ])
)

const DOTS = {
  yellow: '#fbbf24', blue: '#60a5fa', green: '#4ade80',
  pink: '#f472b6', orange: '#fb923c',
}

function parseNoteId(noteId) {
  const idx = noteId.indexOf(':')
  if (idx === -1) return { lessonId: noteId, section: '' }
  const lessonId = noteId.slice(0, idx)
  const rest = noteId.slice(idx + 1)
  let section
  if (rest.startsWith('viz:')) section = 'Viz'
  else if (rest.startsWith('example:')) section = 'Example'
  else section = rest.charAt(0).toUpperCase() + rest.slice(1)
  return { lessonId, section }
}

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

export default function PinsNotesPopup({ initialTab = 'pins', onClose }) {
  const ref = useRef(null)
  const importRef = useRef(null)
  const navigate = useNavigate()
  const { pins, removePin } = usePins()
  const [tab, setTab] = useState(initialTab)
  const [notes, setNotes] = useState(readMergedNotes)

  // Sync notes on storage changes
  useEffect(() => {
    const handler = () => setNotes(readMergedNotes())
    window.addEventListener('storage', handler)
    window.addEventListener('oc-note-change', handler)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('oc-note-change', handler)
    }
  }, [])

  // Close on outside click / Escape
  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    const handleClick = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('mousedown', handleClick)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('mousedown', handleClick)
    }
  }, [onClose])

  function scrollToElement(elementId) {
    let attempts = 0
    setTimeout(() => {
      window.scrollTo(0, 0)
      const chunk = Math.max(window.innerHeight * 0.6, 400)
      function step() {
        const el = document.getElementById(elementId)
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); return }
        if (++attempts >= 80) return
        window.scrollTo(0, window.scrollY + chunk)
        setTimeout(step, 160)
      }
      step()
    }, 600)
  }

  const handlePinClick = pin => {
    navigate(pin.path)
    onClose()
    if (pin.elementId) scrollToElement(pin.elementId)
  }

  const handleNoteClick = noteId => {
    const { lessonId } = parseNoteId(noteId)
    const meta = LESSON_META[lessonId]
    if (!meta) return
    navigate(meta.path)
    onClose()
    scrollToElement(noteId.replace(/:/g, '-'))
  }

  const deleteNote = useCallback(noteId => {
    const user = readUserNotes()
    if (DEFAULT_NOTES[noteId]) user[noteId] = { deleted: true }
    else delete user[noteId]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    setNotes(readMergedNotes())
  }, [])

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
        setNotes(readMergedNotes())
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
      ref={ref}
      className="fixed bottom-11 right-2 z-[1900] w-[340px] max-h-[72vh] flex flex-col rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-white/10 bg-slate-900/80 backdrop-blur-2xl text-slate-200"
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10">
        
        {/* Segmented Control */}
        <div className="flex bg-slate-800/50 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setTab('pins')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 ${
              tab === 'pins'
                ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
            Pins
            {pins.length > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ml-0.5 ${tab === 'pins' ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-700/50 text-slate-400'}`}>
                {pins.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('notes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 ${
              tab === 'notes'
                ? 'bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            Notes
            {sortedNotes.length > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ml-0.5 ${tab === 'notes' ? 'bg-amber-500/30 text-amber-200' : 'bg-slate-700/50 text-slate-400'}`}>
                {sortedNotes.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1">
          {tab === 'notes' && (
            <>
              <button onClick={exportNotes} title="Export notes" className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => importRef.current?.click()} title="Import notes" className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <Upload className="w-4 h-4" />
              </button>
              <input ref={importRef} type="file" accept=".json" className="hidden" onChange={importNotes} />
            </>
          )}
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {tab === 'pins' ? (
          pins.length === 0 ? (
            <div className="py-12 text-center px-6">
              <Pin className="w-6 h-6 text-slate-600 mx-auto mb-3" />
              <p className="text-xs text-slate-500">No pins yet. Click the pin icon on any visualization to save it here.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {pins.map(pin => (
                <div key={pin.id} className="group flex items-start gap-2 p-3 hover:bg-white/[0.04] transition-colors">
                  <button onClick={() => handlePinClick(pin)} className="flex-1 text-left min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">{pin.subtitle || 'Visualization'}</p>
                    <p className="text-xs font-semibold text-slate-200 leading-snug truncate group-hover:text-white transition-colors">{pin.title}</p>
                  </button>
                  <button
                    onClick={() => removePin(pin.id)}
                    className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          sortedNotes.length === 0 ? (
            <div className="py-12 text-center px-6">
              <PenLine className="w-6 h-6 text-slate-600 mx-auto mb-3" />
              <p className="text-xs text-slate-500">No notes yet. Clip a section of any lesson to save it here.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {sortedNotes.map(([noteId, note]) => {
                const { lessonId, section } = parseNoteId(noteId)
                const meta = LESSON_META[lessonId]
                const dot = DOTS[note.color] ?? DOTS.yellow
                return (
                  <div key={noteId} className="group flex items-start gap-2 p-3 hover:bg-white/[0.04] transition-colors relative overflow-hidden">
                    {/* Subtle color highlight on hover */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: dot, boxShadow: `0 0 8px ${dot}` }}
                    />
                    <button onClick={() => handleNoteClick(noteId)} className="flex-1 text-left min-w-0 pl-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span style={{ background: dot, boxShadow: `0 0 8px ${dot}80` }} className="w-2 h-2 rounded-full flex-shrink-0" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{section || 'Note'}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 leading-snug mb-0.5 truncate group-hover:text-white transition-colors">{meta?.title || lessonId}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{note.text}</p>
                    </button>
                    <button
                      onClick={() => deleteNote(noteId)}
                      className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}
