import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css'
import Editor from '@monaco-editor/react'
import MarkdownToolbar from '../markdown-toolbar/MarkdownToolbar.jsx'
import { preprocess } from '../math/latexPreprocess.js'
import DEFAULT_NOTES from './default-notes.json'

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
  { id: 'yellow', dot: '#fbbf24', headerClass: 'from-amber-200 to-yellow-100 dark:from-yellow-500/20 dark:to-amber-500/5', bgClass: 'bg-yellow-50/90 dark:bg-[#1A1814]/90', borderClass: 'border-yellow-200 dark:border-yellow-500/30', borderHex: 'rgba(251,191,36,0.3)', glow: 'shadow-[0_8px_32px_rgba(251,191,36,0.15)] dark:shadow-[0_8px_32px_rgba(251,191,36,0.15)]' },
  { id: 'blue',   dot: '#60a5fa', headerClass: 'from-blue-200 to-blue-100 dark:from-blue-500/20 dark:to-indigo-500/5', bgClass: 'bg-blue-50/90 dark:bg-[#0C121E]/90', borderClass: 'border-blue-200 dark:border-blue-500/30', borderHex: 'rgba(96,165,250,0.3)', glow: 'shadow-[0_8px_32px_rgba(96,165,250,0.15)] dark:shadow-[0_8px_32px_rgba(96,165,250,0.15)]' },
  { id: 'green',  dot: '#4ade80', headerClass: 'from-green-200 to-green-100 dark:from-emerald-500/20 dark:to-green-500/5', bgClass: 'bg-green-50/90 dark:bg-[#0A1610]/90', borderClass: 'border-green-200 dark:border-emerald-500/30', borderHex: 'rgba(74,222,128,0.3)', glow: 'shadow-[0_8px_32px_rgba(74,222,128,0.15)] dark:shadow-[0_8px_32px_rgba(74,222,128,0.15)]' },
  { id: 'pink',   dot: '#f472b6', headerClass: 'from-pink-200 to-pink-100 dark:from-pink-500/20 dark:to-rose-500/5', bgClass: 'bg-pink-50/90 dark:bg-[#1C0D14]/90', borderClass: 'border-pink-200 dark:border-pink-500/30', borderHex: 'rgba(244,114,182,0.3)', glow: 'shadow-[0_8px_32px_rgba(244,114,182,0.15)] dark:shadow-[0_8px_32px_rgba(244,114,182,0.15)]' },
  { id: 'orange', dot: '#fb923c', headerClass: 'from-orange-200 to-orange-100 dark:from-orange-500/20 dark:to-red-500/5', bgClass: 'bg-orange-50/90 dark:bg-[#1E120A]/90', borderClass: 'border-orange-200 dark:border-orange-500/30', borderHex: 'rgba(251,146,60,0.3)', glow: 'shadow-[0_8px_32px_rgba(251,146,60,0.15)] dark:shadow-[0_8px_32px_rgba(251,146,60,0.15)]' },
]

// Bigger than the old 320×(auto) default — a real Monaco instance + toolbar
// needs room to be usable, not just a couple of lines of plain text.
const DEFAULT_W = 480
const DEFAULT_H = 460

// ─── Component ────────────────────────────────────────────────────────────────

export default function StickyNote({ noteId }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [color, setColor] = useState('yellow')
  const [preview, setPreview] = useState(false)
  const [ruled, setRuled] = useState(false)
  const [fontIdx, setFontIdx] = useState(0)
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H })
  const [pos, setPos] = useState(null)
  const btnRef = useRef(null)
  const cardRef = useRef(null)
  const editorRef = useRef(null)
  // Always-current ref so scroll/resize closures see latest size
  const sizeRef = useRef({ w: DEFAULT_W, h: DEFAULT_H })
  sizeRef.current = size
  // Prevents save from firing with stale state on the first render after open
  const loadedRef = useRef(false)

  const isDark = useIsDark()
  const stored = getNote(noteId)
  const hasNote = !!stored?.text?.trim()
  const C = COLORS.find(c => c.id === color) ?? COLORS[0]
  const cardBg = '' // removed in favor of tailwind class
  const textColor = isDark ? '#f1f5f9' : '#1e293b'
  const mutedColor = isDark ? '#94a3b8' : '#64748b'

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

  // Loading is done synchronously here (not in a useEffect keyed on `open`)
  // so the very first render with open=true already has the correct text —
  // Monaco's `defaultValue` only applies once, at mount, so a stale value
  // from a later effect would never make it into the editor.
  const handleOpen = () => {
    if (!open) {
      loadedRef.current = false
      const n = getNote(noteId)
      setText(n?.text ?? '')
      setColor(n?.color ?? 'yellow')
      setRuled(n?.ruled ?? false)
      setFontIdx(n?.fontIdx ?? 0)
      setSize({ w: n?.w ?? DEFAULT_W, h: n?.h ?? DEFAULT_H })
      setPreview(!!(n?.text?.trim()))
      setPos(computePos())
    } else {
      loadedRef.current = false
    }
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

  const insertBtn = (btn) => {
    const ed = editorRef.current
    if (!ed) return
    if (btn.plain != null) ed.trigger('keyboard', 'type', { text: btn.plain })
    else if (btn.snippet) ed.trigger('keyboard', 'editor.action.insertSnippet', { snippet: btn.snippet })
    ed.focus()
  }

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
        <div ref={cardRef} className={`border-[1.5px] rounded-[10px] backdrop-blur-xl ${C.bgClass} ${C.borderClass} ${C.glow} transition-colors duration-300`} style={{
          position: 'fixed',
          top: pos.y,
          left: pos.x,
          width: size.w,
          height: size.h ?? DEFAULT_H,
          minWidth: 360,
          minHeight: 280,
          display: 'flex',
          flexDirection: 'column',
          resize: 'both',
          overflow: 'hidden',
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
              borderBottom: `1px solid ${C.borderHex}`,
              userSelect: 'none',
              background: `linear-gradient(to right, ${C.borderHex.replace('0.3', '0.05')}, transparent)`
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
                    border: color === c.id ? `2px solid ${textColor}` : '1.5px solid transparent',
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
          {preview
            ? (
              <div style={{ flex: 1, padding: 10, overflow: 'auto', userSelect: 'text', minHeight: 0 }}>
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
                        rehypePlugins={[rehypeRaw, rehypeKatex]}
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
                          blockquote: ({children}) => <blockquote style={{borderLeft:'3px solid rgba(100,116,139,0.4)',paddingLeft:'0.75em',margin:'0.3em 0',color:mutedColor,fontStyle:'italic'}}>{children}</blockquote>,
                          a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" style={{color: isDark ? '#60a5fa' : '#2563eb',textDecoration:'underline'}}>{children}</a>,
                        }}
                      >{preprocess(text)}</ReactMarkdown>
                    : <span style={{ color: mutedColor, fontStyle: 'italic' }}>Nothing here yet</span>
                  }
                </div>
              </div>
            )
            : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                <MarkdownToolbar onInsert={insertBtn} />
                <div style={{ flex: 1, minHeight: 0 }}>
                  <Editor
                    defaultValue={text}
                    language="markdown"
                    theme={isDark ? 'vs-dark' : 'vs'}
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
            )
          }
        </div>
      )}
    </span>
  )
}
