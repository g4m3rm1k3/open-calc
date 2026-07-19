import { useEffect, useRef, useState } from 'react'
import * as fabric from 'fabric'
import TextFormatToolbar from './TextFormatToolbar.jsx'
import MarkdownNote from './MarkdownNote.jsx'
import { getPage, putPage } from './db.js'
import { useThemeColors } from '../../hooks/useThemeColors.js'

// A real notebook page, not a box that happens to fit the window — deliberately
// bigger than any viewport this opens in, so there's room to lay things out the
// way a real page of paper would, panned around rather than always fully visible.
const CANVAS_W = 2400
const CANVAS_H = 1600

// Custom fabric properties that must survive serialization — passed to
// every toDatalessJSON call so a page's markdown notes round-trip along
// with its shapes and strokes.
const CUSTOM_PROPS = ['__id', '__isMarkdownAnchor', '__markdown']

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

// A highlighter isn't a different kind of ink to fabric — it's the same
// PencilBrush, drawn with a translucent color so overlapping strokes (and
// whatever is underneath) still show through.
function hexToRgba(hex, alpha) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const ADAPTIVE_COLORS = ['#1e1e1e', '#1e293b', '#cbd5e1']
function getAdaptiveColor(val, canvasText) {
  if (!val || typeof val !== 'string') return val
  if (ADAPTIVE_COLORS.includes(val.toLowerCase())) return canvasText
  const m = val.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/)
  if (m) {
    const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3])
    const isMatch = ADAPTIVE_COLORS.some(hex => {
      const n = parseInt(hex.replace('#', ''), 16)
      return r === ((n >> 16) & 255) && g === ((n >> 8) & 255) && b === (n & 255)
    })
    if (isMatch) {
      const alpha = m[4] !== undefined ? parseFloat(m[4]) : 1
      return hexToRgba(canvasText, alpha)
    }
  }
  return val
}

function adaptCanvasColors(canvas, canvasText) {
  let changed = false
  canvas.getObjects().forEach((obj) => {
    if (obj.stroke && typeof obj.stroke === 'string') {
      const next = getAdaptiveColor(obj.stroke, canvasText)
      if (next !== obj.stroke) { obj.set('stroke', next); changed = true }
    }
    if (obj.fill && typeof obj.fill === 'string') {
      const next = getAdaptiveColor(obj.fill, canvasText)
      if (next !== obj.fill) { obj.set('fill', next); changed = true }
    }
    if (obj.type === 'textbox' && obj.styles) {
      for (const line in obj.styles) {
        for (const char in obj.styles[line]) {
           const charStyle = obj.styles[line][char]
           if (charStyle.fill) {
             const next = getAdaptiveColor(charStyle.fill, canvasText)
             if (next !== charStyle.fill) {
               charStyle.fill = next
               changed = true
             }
           }
        }
      }
    }
  })
  if (changed) canvas.requestRenderAll()
}

// One fabric.Canvas instance, reused across every page — never recreated
// when the active page changes. Switching pages swaps the canvas's
// CONTENT (via loadFromJSON), not the canvas itself.
export default function PageCanvas({ pageId, tool, onPlacementDone, strokeColor, strokeWidth }) {
  const canvasElRef = useRef(null)
  const fabricRef = useRef(null)
  const scrollRef = useRef(null)
  const prevPageIdRef = useRef(pageId)
  const [selectedText, setSelectedText] = useState(null)
  const [noteAnchors, setNoteAnchors] = useState([])
  const C = useThemeColors()

  const refreshAnchors = () => {
    const canvas = fabricRef.current
    setNoteAnchors(canvas ? canvas.getObjects().filter((o) => o.__isMarkdownAnchor) : [])
  }

  // Mount the canvas exactly once.
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: C.canvasSurface,
    })
    fabricRef.current = canvas

    // Track selection so the format toolbar only shows for a Textbox, and
    // reflects whichever one is currently active — independent of tool,
    // since formatting an existing text box happens from the Select tool.
    const onSelection = () => {
      const obj = canvas.getActiveObject()
      setSelectedText(obj?.type === 'textbox' ? obj : null)
    }
    canvas.on('selection:created', onSelection)
    canvas.on('selection:updated', onSelection)
    canvas.on('selection:cleared', () => setSelectedText(null))

    return () => canvas.dispose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep background color in sync with theme changes
  useEffect(() => {
    const canvas = fabricRef.current
    if (canvas) {
      canvas.backgroundColor = C.canvasSurface
      adaptCanvasColors(canvas, C.canvasText)
      canvas.requestRenderAll()
    }
  }, [C.canvasSurface, C.canvasText])

  // Swap content whenever the active page changes — now backed by real
  // persistence (idb) instead of Lesson 2's in-memory-only relay through
  // the parent. Both steps are async (a database write, then a database
  // read), so a `cancelled` flag guards against a second page switch
  // starting before this one's async work finishes — without it, a fast
  // A→B→C switch could let B's stale load finish AFTER C's, overwriting
  // C's content with B's on screen.
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    let cancelled = false

    ;(async () => {
      // Save whatever page we're leaving — read from the canvas BEFORE
      // it's cleared/reloaded below, using the last known pageId.
      const outgoingId = prevPageIdRef.current
      if (outgoingId !== pageId) {
        await putPage(outgoingId, canvas.toDatalessJSON(CUSTOM_PROPS))
      }
      if (cancelled) return

      const stored = await getPage(pageId)
      if (cancelled) return

      canvas.clear()
      setNoteAnchors([]) // the page we're leaving had its own anchors — never carry them over
      if (stored?.canvasJSON) {
        // loadFromJSON's 2nd argument is a per-object reviver, not a
        // "finished loading" callback — it returns a Promise for that.
        await canvas.loadFromJSON(stored.canvasJSON)
        if (cancelled) return
        canvas.backgroundColor = C.canvasSurface
        adaptCanvasColors(canvas, C.canvasText)
        canvas.requestRenderAll()
        refreshAnchors() // this page's own markdown anchors, freshly loaded
      } else {
        canvas.backgroundColor = C.canvasSurface
        canvas.requestRenderAll()
      }
      prevPageIdRef.current = pageId
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  // Debounced autosave: any edit (draw a stroke, add/move/delete a shape)
  // schedules a save of the CURRENT page 250ms after the last change —
  // same debounce shape as SvgStudioPage.jsx's undo-history push, aimed at
  // a database write instead of an in-memory history stack. This is what
  // makes content durable even if the user never switches away from the
  // page at all (the page-swap effect's save only fires on a switch).
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    let saveTimer = null
    const scheduleSave = () => {
      clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        putPage(pageId, canvas.toDatalessJSON(CUSTOM_PROPS))
      }, 250)
    }
    canvas.on('object:added', scheduleSave)
    canvas.on('object:modified', scheduleSave)
    canvas.on('object:removed', scheduleSave)
    canvas.on('path:created', scheduleSave)
    return () => {
      clearTimeout(saveTimer)
      canvas.off('object:added', scheduleSave)
      canvas.off('object:modified', scheduleSave)
      canvas.off('object:removed', scheduleSave)
      canvas.off('path:created', scheduleSave)
    }
  }, [pageId])

  // Apply the active tool. Pen and marker both draw via fabric's built-in
  // freehand brush — marker is a PencilBrush with a translucent color and a
  // flat cap, not a different brush class. Eraser has no brush at all: it
  // deletes whichever object the click landed on, via fabric's own hit-test
  // (the `target` fabric already resolves on every mouse:down).
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    canvas.isDrawingMode = tool === 'pen' || tool === 'marker'
    if (tool === 'pen') {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.color = strokeColor
      canvas.freeDrawingBrush.width = strokeWidth
    } else if (tool === 'marker') {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.color = hexToRgba(strokeColor, 0.35)
      canvas.freeDrawingBrush.width = strokeWidth * 3
      canvas.freeDrawingBrush.strokeLineCap = 'butt'
    }

    canvas.selection = tool === 'select'
    canvas.getObjects().forEach((o) => {
      o.selectable = tool === 'select'
      o.evented = tool === 'select' || tool === 'eraser'
    })
    canvas.defaultCursor = tool === 'pan' ? 'grab' : 'default'

    const onMouseDown = (opt) => {
      if (tool === 'eraser' && opt.target) {
        canvas.remove(opt.target)
        canvas.requestRenderAll()
        refreshAnchors() // the deleted object might have been a markdown anchor
      }
      if (tool === 'text' && !opt.target) {
        const p = canvas.getScenePoint(opt.e)
        // Textbox, not IText: a note box wraps to a fixed width instead of
        // growing sideways forever as the user types.
        const box = new fabric.Textbox('Type here', {
          left: p.x,
          top: p.y,
          width: 220,
          fontSize: 18,
          fill: strokeColor,
        })
        canvas.add(box)
        canvas.setActiveObject(box)
        box.enterEditing()
        canvas.requestRenderAll()
        onPlacementDone()
      }
      if (tool === 'note' && !opt.target) {
        const p = canvas.getScenePoint(opt.e)
        // A plain fabric.Rect used purely as a position/size anchor — its
        // own fill/stroke barely matter, since MarkdownNote's HTML overlay
        // (rendered outside the canvas entirely) covers almost all of it.
        // __isMarkdownAnchor marks it for refreshAnchors() to find; __markdown
        // holds the actual note text, riding along through toDatalessJSON.
        const anchor = new fabric.Rect({
          left: p.x,
          top: p.y,
          width: 260,
          height: 180,
          fill: 'rgba(0,0,0,0.02)',
          stroke: '#94a3b8',
          strokeDashArray: [4, 4],
        })
        anchor.__id = uid()
        anchor.__isMarkdownAnchor = true
        anchor.__markdown = ''
        canvas.add(anchor)
        canvas.requestRenderAll()
        refreshAnchors()
        onPlacementDone()
      }
    }
    canvas.on('mouse:down', onMouseDown)
    return () => canvas.off('mouse:down', onMouseDown)
  }, [tool, strokeColor, strokeWidth]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pan tool: drag anywhere to scroll the viewport around this page, the way
  // OneNote lets you drag a page that's bigger than your screen. Same
  // mousedown-then-window-mousemove/mouseup shape StickyNote.jsx already uses
  // to drag a note around — here scrolling the container instead of moving
  // an element's position. Listens through fabric's own mouse:down/up
  // (not a native listener on the <canvas> ref directly) because fabric
  // layers an interactive "upper canvas" on top of the element that ref
  // points at — a native listener on the original element would never see
  // these clicks at all, since they land on a sibling on top of it instead.
  useEffect(() => {
    if (tool !== 'pan') return
    const canvas = fabricRef.current
    const scrollEl = scrollRef.current
    if (!canvas || !scrollEl) return

    const onMouseDown = (opt) => {
      const startX = opt.e.clientX
      const startY = opt.e.clientY
      const startScrollLeft = scrollEl.scrollLeft
      const startScrollTop = scrollEl.scrollTop
      canvas.defaultCursor = 'grabbing'

      const onMouseMove = (ev) => {
        scrollEl.scrollLeft = startScrollLeft - (ev.clientX - startX)
        scrollEl.scrollTop = startScrollTop - (ev.clientY - startY)
      }
      const onMouseUp = () => {
        canvas.defaultCursor = 'grab'
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    }
    canvas.on('mouse:down', onMouseDown)
    return () => canvas.off('mouse:down', onMouseDown)
  }, [tool])

  // Paste an image straight from the system clipboard onto the canvas.
  // Skipped entirely while focus is inside a real text input (typing into a
  // markdown note, or a section/page title) — a paste there should paste
  // text into that field, not add an image to the canvas underneath it.
  useEffect(() => {
    const handlePaste = (e) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const canvas = fabricRef.current
      if (!canvas) return

      const items = e.clipboardData?.items
      if (!items) return
      const imageItem = [...items].find((item) => item.type.startsWith('image/'))
      if (!imageItem) return

      const file = imageItem.getAsFile()
      const reader = new FileReader()
      reader.onload = () => {
        // A data URL, not URL.createObjectURL — it has to survive
        // toDatalessJSON/loadFromJSON as a plain string (Increment 7 needs
        // this same data URL to still be valid after a full page reload).
        fabric.FabricImage.fromURL(reader.result).then((img) => {
          if (img.width > 400) img.scaleToWidth(400)
          img.set({
            left: CANVAS_W / 2 - img.getScaledWidth() / 2,
            top: CANVAS_H / 2 - img.getScaledHeight() / 2,
          })
          canvas.add(img)
          canvas.requestRenderAll()
        })
      }
      reader.readAsDataURL(file)
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

  // Formats the selected character range of the active Textbox — or the
  // whole text, if nothing is highlighted — via setSelectionStyles, fabric's
  // per-character (not whole-object) styling API.
  const applyTextStyle = (styles) => {
    const canvas = fabricRef.current
    const obj = selectedText
    if (!canvas || !obj) return
    const start = obj.selectionStart ?? 0
    const end = obj.selectionEnd ?? obj.text.length
    const from = start === end ? 0 : start
    const to = start === end ? obj.text.length : end
    obj.setSelectionStyles(styles, from, to)
    canvas.requestRenderAll()
    canvas.fire('object:modified')
  }

  const toggleBold = () => {
    const current = selectedText?.getSelectionStyles(0, 1)[0]?.fontWeight
    applyTextStyle({ fontWeight: current === 'bold' ? 'normal' : 'bold' })
  }

  const toggleItalic = () => {
    const current = selectedText?.getSelectionStyles(0, 1)[0]?.fontStyle
    applyTextStyle({ fontStyle: current === 'italic' ? 'normal' : 'italic' })
  }

  const deleteAnchor = (anchor) => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.remove(anchor)
    canvas.requestRenderAll()
    refreshAnchors()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {selectedText && (
        <TextFormatToolbar
          onToggleBold={toggleBold}
          onToggleItalic={toggleItalic}
          onChangeColor={(color) => applyTextStyle({ fill: color })}
          onChangeSize={(size) => applyTextStyle({ fontSize: size })}
        />
      )}
      {/* A viewport onto a much bigger page — the canvas itself
          (CANVAS_W × CANVAS_H) is larger than this div, so native scrollbars
          or the Pan tool's drag-to-scroll (above) reveal the rest of it.
          `flex-1 min-h-0` fills whatever height the parent actually gives
          this component, instead of a guessed fixed value — the window it
          opens in, not an arbitrary box floating inside it. */}
      <div ref={scrollRef} className="flex-1 min-h-0 w-full overflow-auto">
        {/* fabric.Canvas reparents this exact <canvas> node into its own
            wrapper div the moment it initializes. Nothing conditionally
            rendered by React can live inside THIS div, or React's reconciler
            tries to insert/remove it next to a node fabric has already moved
            elsewhere. Conditional siblings (the toolbar above, the scroll
            viewport around this) must stay outside this wrapper, never
            inside it. */}
        <div>
          <canvas ref={canvasElRef} />
        </div>
      </div>
      {/* One overlay per markdown anchor on this page — also a sibling of
          the canvas's dedicated wrapper, never a child of it, for the same
          reason the format toolbar above has to be. */}
      {noteAnchors.map((anchor) => (
        <MarkdownNote
          key={anchor.__id}
          canvas={fabricRef.current}
          canvasElRef={canvasElRef}
          anchor={anchor}
          initialText={anchor.__markdown}
          onDelete={() => deleteAnchor(anchor)}
          tool={tool}
        />
      ))}
    </div>
  )
}
