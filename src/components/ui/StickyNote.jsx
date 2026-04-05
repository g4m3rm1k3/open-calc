import { useState, useEffect, useRef } from 'react'
import { parseProse } from '../math/parseProse.jsx'

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = 'oc-sticky-notes'

function readAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}
function getNote(id) { return readAll()[id] ?? null }
function saveNote(id, data) {
  const all = readAll()
  all[id] = { ...data, updatedAt: Date.now() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}
function deleteNote(id) {
  const all = readAll()
  delete all[id]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

// ─── Dark mode hook ───────────────────────────────────────────────────────────

function useIsDark() {
  const check = () => document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(check)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(check()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const COLORS = [
  { id: 'yellow', dot: '#fbbf24', bg: '#fef9c3', bgDark: '#2d2500', border: '#fbbf24' },
  { id: 'blue',   dot: '#60a5fa', bg: '#dbeafe', bgDark: '#0c1f3a', border: '#60a5fa' },
  { id: 'green',  dot: '#4ade80', bg: '#dcfce7', bgDark: '#052e16', border: '#4ade80' },
  { id: 'pink',   dot: '#f472b6', bg: '#fce7f3', bgDark: '#3b0718', border: '#f472b6' },
  { id: 'orange', dot: '#fb923c', bg: '#ffedd5', bgDark: '#2c1500', border: '#fb923c' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function StickyNote({ noteId }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [color, setColor] = useState('yellow')
  const [preview, setPreview] = useState(false)
  const [ruled, setRuled] = useState(false)
  const [size, setSize] = useState({ w: 320, h: null })
  const [pos, setPos] = useState(null)
  const btnRef = useRef(null)
  const cardRef = useRef(null)
  // Always-current ref so scroll/resize closures see latest size
  const sizeRef = useRef({ w: 320, h: null })
  sizeRef.current = size
  // Prevents save from firing with stale state on the first render after open
  const loadedRef = useRef(false)

  const stored = getNote(noteId)
  const hasNote = !!stored?.text?.trim()
  const C = COLORS.find(c => c.id === color) ?? COLORS[0]
  const cardBg = C.bg
  const textColor = '#1e293b'
  const mutedColor = '#64748b'

  // Load from storage when opening
  useEffect(() => {
    if (open) {
      loadedRef.current = false
      const n = getNote(noteId)
      setText(n?.text ?? '')
      setColor(n?.color ?? 'yellow')
      setRuled(n?.ruled ?? false)
      setSize({ w: n?.w ?? 320, h: n?.h ?? null })
    } else {
      loadedRef.current = false
    }
  }, [open, noteId])

  // Auto-save when text or color changes while open
  useEffect(() => {
    if (!open) return
    // Skip the very first fire after open — loaded state hasn't settled yet
    if (!loadedRef.current) { loadedRef.current = true; return }
    if (text.trim()) {
      saveNote(noteId, { text, color, ruled, w: size.w, h: size.h })
    } else {
      deleteNote(noteId)
    }
    window.dispatchEvent(new Event('oc-note-change'))
  }, [text, color, ruled, size, open, noteId])

  const computePos = () => {
    if (!btnRef.current) return null
    const rect = btnRef.current.getBoundingClientRect()
    const cardW = sizeRef.current.w
    const x = rect.right + 8 + cardW > window.innerWidth
      ? rect.left - cardW - 8
      : rect.right + 8
    const y = rect.top - 8
    return { x, y }
  }

  const handleOpen = () => {
    if (!open) setPos(computePos())
    setOpen(o => !o)
  }

  // Persist card size when user resizes it
  useEffect(() => {
    if (!open || !cardRef.current) return
    const ro = new ResizeObserver(() => {
      if (!cardRef.current) return
      setSize({ w: cardRef.current.offsetWidth, h: cardRef.current.offsetHeight })
    })
    ro.observe(cardRef.current)
    return () => ro.disconnect()
  }, [open])

  // Track card position as page scrolls — works whether the card has been dragged or not.
  // We watch how much the anchor button moves in viewport coords and apply the same delta.
  useEffect(() => {
    if (!open) return
    const getBtnTop = () => btnRef.current ? btnRef.current.getBoundingClientRect().top : 0
    let lastBtnTop = getBtnTop()
    const onScroll = () => {
      const newBtnTop = getBtnTop()
      const delta = newBtnTop - lastBtnTop
      lastBtnTop = newBtnTop
      setPos(p => p ? { x: p.x, y: p.y + delta } : p)
    }
    const onResize = () => setPos(computePos())
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  const onDragStart = (e) => {
    e.preventDefault()
    const startX = e.clientX - pos.x
    const startY = e.clientY - pos.y
    const onMove = (ev) => setPos({ x: ev.clientX - startX, y: ev.clientY - startY })
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
      {/* Anchor icon */}
      <button
        ref={btnRef}
        onClick={handleOpen}
        title={hasNote ? 'View note' : 'Add a note'}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: 3,
          background: hasNote ? `${C.dot}33` : 'rgba(100,116,139,0.10)',
          border: hasNote
            ? `1px solid ${C.dot}66`
            : '1px solid rgba(100,116,139,0.22)',
          borderRadius: 5,
          padding: '2px 5px',
          cursor: 'pointer', flexShrink: 0,
          transition: 'background 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = hasNote ? `${C.dot}55` : 'rgba(100,116,139,0.18)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = hasNote ? `${C.dot}33` : 'rgba(100,116,139,0.10)'
        }}
      >
        {/* Outlined pencil icon — filled when a note exists, outline-only when empty */}
        <svg
          width="13" height="13" viewBox="0 0 16 16" fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {hasNote ? (
            /* Filled pencil */
            <>
              <path d="M11.5 1.5a1.5 1.5 0 0 1 2.121 2.121l-1 1L10.5 2.5l1-1z" fill={C.dot} />
              <path d="M9.5 3.5l3 3L5 14H2v-3L9.5 3.5z" fill={C.dot} fillOpacity="0.25" stroke={C.dot} strokeWidth="1.2" strokeLinejoin="round" />
            </>
          ) : (
            /* Outline-only pencil */
            <>
              <path d="M11.5 1.5a1.5 1.5 0 0 1 2.121 2.121l-1 1L10.5 2.5l1-1z"
                fill="none" stroke="#64748b" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M9.5 3.5l3 3L5 14H2v-3L9.5 3.5z"
                fill="none" stroke="#64748b" strokeWidth="1.2" strokeLinejoin="round" />
            </>
          )}
        </svg>
      </button>

      {/* Floating card */}
      {open && pos && (
        <div ref={cardRef} style={{
          position: 'fixed',
          top: pos.y,
          left: pos.x,
          width: size.w,
          height: size.h ?? 'auto',
          minWidth: 220,
          minHeight: 120,
          display: 'flex',
          flexDirection: 'column',
          resize: 'both',
          overflow: 'hidden',
          background: cardBg,
          border: `1.5px solid ${C.border}`,
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          zIndex: 9999,
        }}>
          {/* Drag handle */}
          <div
            onMouseDown={onDragStart}
            style={{
              padding: '6px 10px',
              cursor: 'grab',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `1px solid ${C.border}`,
              userSelect: 'none',
            }}
          >
            {/* Color swatches */}
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {COLORS.map(c => (
                <button
                  key={c.id}
                  onMouseDown={e => e.stopPropagation()}
                  onClick={() => setColor(c.id)}
                  style={{
                    width: 13, height: 13, borderRadius: '50%',
                    background: c.dot,
                    border: color === c.id ? '2px solid #1e293b' : '1.5px solid transparent',
                    cursor: 'pointer', padding: 0,
                  }}
                />
              ))}
            </div>
            {/* Controls */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={() => setRuled(r => !r)}
                title={ruled ? 'Hide ruled lines' : 'Show ruled lines'}
                style={{
                  fontSize: 10, background: 'none', cursor: 'pointer', padding: '1px 3px',
                  border: ruled ? `1px solid ${C.dot}88` : '1px solid transparent',
                  borderRadius: 3, color: ruled ? C.dot : mutedColor,
                }}
              >
                ☰
              </button>
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={() => setPreview(p => !p)}
                style={{ fontSize: 10, color: mutedColor, background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px' }}
              >
                {preview ? 'edit' : 'preview'}
              </button>
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={() => { deleteNote(noteId); setText(''); setOpen(false) }}
                style={{ fontSize: 12, color: mutedColor, background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
              >
                🗑
              </button>
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={() => setOpen(false)}
                style={{ fontSize: 17, color: mutedColor, background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: 10, overflow: 'auto', userSelect: 'text', minHeight: 0 }}>
            {preview
              ? (
                <div style={{
                    fontSize: 12, lineHeight: 1.7, color: textColor, minHeight: 60, wordBreak: 'break-word',
                    ...(ruled ? {
                      backgroundImage: `repeating-linear-gradient(transparent, transparent calc(1.7em - 1px), rgba(100,116,139,0.14) calc(1.7em - 1px), rgba(100,116,139,0.14) 1.7em)`,
                      backgroundSize: '100% 1.7em',
                    } : {}),
                  }}>
                  {text.trim()
                    ? parseProse(text)
                    : <span style={{ color: mutedColor, fontStyle: 'italic' }}>Nothing here yet</span>
                  }
                </div>
              )
              : (
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Write a note… **bold**, $math$, etc."
                  autoFocus
                  style={{
                    width: '100%', height: '100%', minHeight: 60, resize: 'none',
                    background: ruled
                      ? `repeating-linear-gradient(transparent, transparent calc(1.7em - 1px), rgba(100,116,139,0.14) calc(1.7em - 1px), rgba(100,116,139,0.14) 1.7em)`
                      : 'transparent',
                    backgroundSize: '100% 1.7em',
                    border: 'none', outline: 'none',
                    fontSize: 12, lineHeight: 1.7, color: textColor,
                    fontFamily: 'inherit', padding: 0, boxSizing: 'border-box',
                  }}
                />
              )
            }
          </div>
        </div>
      )}
    </span>
  )
}
