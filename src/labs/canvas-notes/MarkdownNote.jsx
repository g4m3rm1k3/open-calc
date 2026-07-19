import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css'
import MarkdownToolbar, { stripSnippetSyntax } from '../../components/markdown-toolbar/MarkdownToolbar.jsx'
import { preprocess } from '../../components/math/latexPreprocess.js'

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

  useEffect(() => {
    const el = overlayRef.current
    if (!el) return
    const sync = () => {
      const canvasEl = canvasElRef.current
      if (!canvasEl) return
      const canvasRect = canvasEl.getBoundingClientRect()
      el.style.left = `${canvasRect.left + anchor.left}px`
      el.style.top = `${canvasRect.top + anchor.top}px`
      el.style.width = `${anchor.getScaledWidth()}px`
      el.style.height = `${anchor.getScaledHeight()}px`
    }
    sync()
    const onTransform = (opt) => {
      if (opt.target === anchor) sync()
    }
    canvas.on('object:moving', onTransform)
    canvas.on('object:scaling', onTransform)
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
          border: '1px solid #cbd5e1',
          borderRadius: 6,
          background: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, padding: '3px 6px', background: '#f1f5f9', fontSize: 11 }}>
          <button onClick={() => setEditing((e) => !e)}>{editing ? 'Preview' : 'Edit'}</button>
          <button onClick={onDelete}>✕</button>
        </div>
        {editing ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <MarkdownToolbar onInsert={insertAtCursor} />
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => commit(e.target.value)}
              style={{ flex: 1, resize: 'none', border: 'none', outline: 'none', padding: 8, fontFamily: 'inherit', fontSize: 13 }}
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
