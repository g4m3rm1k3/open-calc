import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import DEFAULT_NOTES from '../../content/default-notes.json'

// ─── Storage helpers ──────────────────────────────────────────────────────────
// oc-sticky-notes  = ONLY the user's own writes/edits + tombstones for deleted defaults
// Default notes come from default-notes.json at read time, never persisted to localStorage.

const STORAGE_KEY = 'oc-sticky-notes'

function readUserNotes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}

// Merge: user note wins; tombstone hides default; else fall back to default
function getNote(id) {
  const user = readUserNotes()[id]
  if (user?.deleted) return null           // user deleted a default
  if (user?.text?.trim()) return user      // user wrote their own
  const def = DEFAULT_NOTES[id]
  if (def?.text?.trim()) return { ...def, _isDefault: true }
  return null
}

function saveNote(id, data) {
  const all = readUserNotes()
  all[id] = { ...data, updatedAt: Date.now(), deleted: false }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

function deleteNote(id) {
  const all = readUserNotes()
  const hasDefault = !!DEFAULT_NOTES[id]?.text?.trim()
  if (hasDefault) {
    all[id] = { deleted: true }            // tombstone so default stays hidden
  } else {
    delete all[id]
  }
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

// ─── Font sizes ─────────────────────────────────────────────────────────────────

const FONT_SIZES = [12, 18, 24]               // 1×, 1.5×, 2×
const FONT_LABELS = ['1×', '1.5×', '2×']

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
  const [fontIdx, setFontIdx] = useState(0)
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
      setFontIdx(n?.fontIdx ?? 0)
      setSize({ w: n?.w ?? 320, h: n?.h ?? null })
      setPreview(!!(n?.text?.trim()))
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
      saveNote(noteId, { text, color, ruled, fontIdx, w: size.w, h: size.h })
    } else {
      deleteNote(noteId)
    }
    window.dispatchEvent(new Event('oc-note-change'))
  }, [text, color, ruled, fontIdx, size, open, noteId])

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
                onClick={() => setFontIdx(i => (i + 1) % FONT_SIZES.length)}
                title={`Font size: ${FONT_LABELS[fontIdx]} — click to cycle`}
                style={{
                  fontSize: 10, background: 'none', cursor: 'pointer', padding: '1px 4px',
                  border: fontIdx > 0 ? `1px solid ${C.dot}88` : '1px solid transparent',
                  borderRadius: 3, color: fontIdx > 0 ? C.dot : mutedColor,
                  fontWeight: 600, letterSpacing: '-0.02em',
                }}
              >
                A{fontIdx === 0 ? '' : fontIdx === 1 ? '⁺' : '⁺⁺'}
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
                    fontSize: FONT_SIZES[fontIdx], lineHeight: 1.7, color: textColor, minHeight: 60, wordBreak: 'break-word',
                    ...(ruled ? {
                      backgroundImage: `repeating-linear-gradient(transparent, transparent calc(1.7em - 1px), rgba(100,116,139,0.14) calc(1.7em - 1px), rgba(100,116,139,0.14) 1.7em)`,
                      backgroundSize: '100% 1.7em',
                    } : {}),
                  }}>
                  {text.trim()
                    ? <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          h1: ({children}) => <h1 style={{fontSize:'1.3em',fontWeight:700,margin:'0.4em 0'}}>{children}</h1>,
                          h2: ({children}) => <h2 style={{fontSize:'1.15em',fontWeight:700,margin:'0.4em 0'}}>{children}</h2>,
                          h3: ({children}) => <h3 style={{fontSize:'1.05em',fontWeight:700,margin:'0.3em 0'}}>{children}</h3>,
                          p: ({children}) => <p style={{margin:'0.3em 0'}}>{children}</p>,
                          ul: ({children}) => <ul style={{paddingLeft:'1.4em',margin:'0.3em 0'}}>{children}</ul>,
                          ol: ({children}) => <ol style={{paddingLeft:'1.4em',margin:'0.3em 0'}}>{children}</ol>,
                          li: ({children}) => <li style={{margin:'0.1em 0'}}>{children}</li>,
                          strong: ({children}) => <strong style={{fontWeight:700}}>{children}</strong>,
                          em: ({children}) => <em>{children}</em>,
                          code: ({inline, children}) => inline
                            ? <code style={{background:'rgba(100,116,139,0.15)',borderRadius:3,padding:'1px 4px',fontFamily:'monospace'}}>{children}</code>
                            : <pre style={{background:'rgba(100,116,139,0.12)',borderRadius:6,padding:'8px',overflowX:'auto',margin:'0.4em 0'}}><code style={{fontFamily:'monospace',fontSize:'0.9em'}}>{children}</code></pre>,
                          table: ({children}) => <table style={{borderCollapse:'collapse',width:'100%',margin:'0.4em 0',fontSize:'0.9em'}}>{children}</table>,
                          th: ({children}) => <th style={{border:'1px solid rgba(100,116,139,0.3)',padding:'4px 8px',background:'rgba(100,116,139,0.1)',textAlign:'left'}}>{children}</th>,
                          td: ({children}) => <td style={{border:'1px solid rgba(100,116,139,0.2)',padding:'4px 8px'}}>{children}</td>,
                          hr: () => <hr style={{border:'none',borderTop:'1px solid rgba(100,116,139,0.2)',margin:'0.5em 0'}} />,
                          blockquote: ({children}) => <blockquote style={{borderLeft:'3px solid rgba(100,116,139,0.4)',paddingLeft:'0.75em',margin:'0.3em 0',color:'rgba(30,41,59,0.7)',fontStyle:'italic'}}>{children}</blockquote>,
                          a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" style={{color:'#2563eb',textDecoration:'underline'}}>{children}</a>,
                        }}
                      >{text}</ReactMarkdown>
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
                    fontSize: FONT_SIZES[fontIdx], lineHeight: 1.7, color: textColor,
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
