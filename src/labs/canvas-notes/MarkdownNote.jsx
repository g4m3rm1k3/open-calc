import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css'
import MarkdownToolbar, { stripSnippetSyntax } from '../../components/markdown-toolbar/MarkdownToolbar.jsx'
import { preprocess } from '../../components/math/latexPreprocess.js'
import { useThemeColors } from '../../hooks/useThemeColors.js'

// Compact inline-style renderer for a small floating box — the same
// ReactMarkdown + remark-gfm + remark-math + rehype-katex pipeline
// MarkdownProse/StickyNote already use, with StickyNote's compact preview
// styling (a note box has no room for lesson-page-sized headings).
const NOTE_COMPONENTS = {
  h1: ({ children }) => <h1 style={{ fontSize: '1.3em', fontWeight: 700, margin: '0.4em 0' }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ fontSize: '1.15em', fontWeight: 700, margin: '0.4em 0' }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ fontSize: '1.05em', fontWeight: 700, margin: '0.3em 0' }}>{children}</h3>,
  p: ({ children }) => <p style={{ margin: '0.3em 0' }}>{children}</p>,
  ul: ({ children }) => <ul style={{ paddingLeft: '1.4em', margin: '0.3em 0' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft: '1.4em', margin: '0.3em 0' }}>{children}</ol>,
  li: ({ children }) => <li style={{ margin: '0.1em 0' }}>{children}</li>,
  strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  code: ({ inline, children }) =>
    inline ? (
      <code style={{ background: 'rgba(100,116,139,0.15)', borderRadius: 3, padding: '1px 4px', fontFamily: 'monospace' }}>{children}</code>
    ) : (
      <pre style={{ background: 'rgba(100,116,139,0.12)', borderRadius: 6, padding: 8, overflowX: 'auto', margin: '0.4em 0' }}>
        <code style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>{children}</code>
      </pre>
    ),
}

function FloatingMarkdownToolbar({ onInsert }) {
  // Start positioned in the top right quadrant so it doesn't obscure the note by default
  const [pos, setPos] = useState({ x: typeof window !== 'undefined' ? window.innerWidth - 450 : 200, y: 100 })
  const dragRef = useRef(null)
  const C = useThemeColors()

  useEffect(() => {
    const header = dragRef.current
    if (!header) return
    let startX = 0, startY = 0, initX = 0, initY = 0
    const onMouseDown = (e) => {
      // Don't start drag if clicking a button inside the header
      if (e.target.tagName === 'BUTTON') return
      e.preventDefault()
      startX = e.clientX
      startY = e.clientY
      initX = pos.x
      initY = pos.y
      const onMouseMove = (ev) => {
        setPos({ x: initX + (ev.clientX - startX), y: initY + (ev.clientY - startY) })
      }
      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    }
    header.addEventListener('mousedown', onMouseDown)
    return () => header.removeEventListener('mousedown', onMouseDown)
  }, [pos.x, pos.y])

  const content = (
    <div style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, display: 'flex', flexDirection: 'column' }}>
       <div ref={dragRef} style={{ background: C.surface2, padding: '6px 12px', cursor: 'grab', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: 7, borderTopRightRadius: 7, borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 11, fontWeight: 'bold', color: C.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Markdown Tools (Drag me)</span>
       </div>
       <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
         <MarkdownToolbar onInsert={onInsert} />
       </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(content, document.body)
}

// Positions itself directly over `anchor` (a fabric.Rect placeholder living
// on the canvas) by reading the anchor's live left/top/width/height and the
// canvas element's own screen position — written straight into the DOM via
// a ref, not React state, so a drag or resize doesn't force a re-render on
// every intermediate frame (same reasoning as SvgStudioPage's overlayRef).
export default function MarkdownNote({ canvas, canvasElRef, anchor, initialText, onDelete, tool }) {
  const overlayRef = useRef(null)
  const textareaRef = useRef(null)
  const [editing, setEditing] = useState(!initialText)
  const [text, setText] = useState(initialText ?? '')
  const C = useThemeColors()

  useEffect(() => {
    const el = overlayRef.current
    if (!el) return
    const sync = () => {
      const canvasEl = canvasElRef.current
      if (!canvasEl) return
      const canvasRect = canvasEl.getBoundingClientRect()
      
      // calcTransformMatrix returns a matrix [a, b, c, d, tx, ty] that maps the
      // object's local center (0,0) to the canvas logical coordinates.
      // So T[4] and T[5] are the logical X and Y of the object's center.
      const T = anchor.calcTransformMatrix()
      const vpt = canvas.viewportTransform
      const logicalCenterX = T[4]
      const logicalCenterY = T[5]
      
      // Convert logical center to screen pixels using the canvas viewport transform
      const screenCenterX = logicalCenterX * vpt[0] + logicalCenterY * vpt[2] + vpt[4]
      const screenCenterY = logicalCenterX * vpt[1] + logicalCenterY * vpt[3] + vpt[5]
      
      const zoom = canvas.getZoom()
      const scaledWidth = anchor.getScaledWidth() * zoom
      const scaledHeight = anchor.getScaledHeight() * zoom
      
      el.style.left = `${canvasRect.left + screenCenterX - scaledWidth / 2}px`
      el.style.top = `${canvasRect.top + screenCenterY - scaledHeight / 2}px`
      el.style.width = `${scaledWidth}px`
      el.style.height = `${scaledHeight}px`
      el.style.transform = `rotate(${anchor.angle || 0}deg)`
    }
    sync()
    const onTransform = (opt) => {
      if (opt.target === anchor) sync()
    }
    canvas.on('object:moving', onTransform)
    canvas.on('object:scaling', onTransform)
    canvas.on('object:rotating', onTransform)
    window.addEventListener('resize', sync)
    // The canvas is now bigger than its scrollable viewport (PageCanvas), so
    // scrolling/panning around the page moves the canvas element's position
    // relative to the viewport without firing any fabric transform event at
    // all — `true` (capture phase) catches a scroll fired on the inner
    // viewport div even though scroll events don't bubble upward, the same
    // technique StickyNote.jsx already uses to track its card through page
    // scrolling.
    window.addEventListener('scroll', sync, true)
    return () => {
      canvas.off('object:moving', onTransform)
      canvas.off('object:scaling', onTransform)
      canvas.off('object:rotating', onTransform)
      window.removeEventListener('resize', sync)
      window.removeEventListener('scroll', sync, true)
    }
  }, [canvas, anchor, canvasElRef])

  const commit = (next) => {
    setText(next)
    anchor.__markdown = next // stored on the fabric object so it round-trips through toDatalessJSON
  }

  const insertAtCursor = (btn) => {
    const raw = btn.plain ?? stripSnippetSyntax(btn.snippet)
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    commit(text.slice(0, start) + raw + text.slice(end))
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = ta.selectionEnd = start + raw.length
    })
  }

  return (
    // Outer frame: sized and positioned exactly over the fabric anchor, but
    // NOT clickable itself (pointerEvents: none) — an 8px border is left
    // exposed all the way around so a click there falls through to the real
    // canvas underneath, where fabric's own drag/resize handles live. Only
    // the inset content box below is interactive.
    <div ref={overlayRef} style={{ position: 'fixed', zIndex: 20, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          inset: 8,
          // Every other tool (pan, pen, marker, eraser, ...) needs its drags
          // and clicks to reach the canvas underneath, exactly like a fabric
          // object's own `evented` gets toggled off outside the Select tool
          // (Lesson 3) — otherwise a note sitting under a Pan drag silently
          // swallows the click instead of letting it through to the canvas.
          pointerEvents: tool === 'select' ? 'auto' : 'none',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          background: C.surface,
          color: C.text,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, padding: '3px 6px', background: C.surface2, fontSize: 11, borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
          <button onClick={() => setEditing((e) => !e)}>{editing ? 'View / Preview' : 'Edit'}</button>
          <button onClick={onDelete} className="text-red-500 hover:text-red-600 font-semibold px-1">Delete Note</button>
        </div>
        {editing ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <FloatingMarkdownToolbar onInsert={insertAtCursor} />
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => commit(e.target.value)}
              style={{ flex: 1, resize: 'none', border: 'none', outline: 'none', padding: 8, fontFamily: 'inherit', fontSize: 13, background: 'transparent', color: 'inherit' }}
            />
          </div>
        ) : (
          <div style={{ flex: 1, overflow: 'auto', padding: 8, fontSize: 13 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]} components={NOTE_COMPONENTS}>
              {preprocess(text) || '*Empty note*'}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
