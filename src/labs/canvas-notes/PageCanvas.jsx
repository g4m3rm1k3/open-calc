import { useCallback, useEffect, useRef, useState } from 'react'
import * as fabric from 'fabric'
import TextFormatToolbar from './TextFormatToolbar.jsx'
import MarkdownNote from './MarkdownNote.jsx'
import { getPage, putPage } from './db.js'
import { useThemeColors } from '../../hooks/useThemeColors.js'

// A real notebook page, not a box that happens to fit the window — deliberately
// bigger than any viewport this opens in, so there's room to lay things out
// the way a real page of paper would, panned around rather than fully visible.
const CANVAS_W = 2400
const CANVAS_H = 1600

// Custom fabric properties that must survive serialization.
const CUSTOM_PROPS = ['__id', '__isMarkdownAnchor', '__markdown']

// Maximum history entries kept per page (higher = more RAM).
const MAX_HISTORY = 50

// Tool IDs that draw shapes by drag (not just click).
const SHAPE_TOOL_IDS = ['rect', 'ellipse', 'line', 'arrow']

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function hexToRgba(hex, alpha) {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

// ---------------------------------------------------------------------------
// Adaptive colour helpers — unchanged from the original version.
// ---------------------------------------------------------------------------
const ADAPTIVE_COLORS = ['#1e1e1e', '#1e293b', '#cbd5e1']

function getAdaptiveColor(val, canvasText) {
  if (!val || typeof val !== 'string') return val
  if (ADAPTIVE_COLORS.includes(val.toLowerCase())) return canvasText
  const m = val.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/)
  if (m) {
    const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3])
    const isMatch = ADAPTIVE_COLORS.some((hex) => {
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
          const cs = obj.styles[line][char]
          if (cs.fill) {
            const next = getAdaptiveColor(cs.fill, canvasText)
            if (next !== cs.fill) { cs.fill = next; changed = true }
          }
        }
      }
    }
  })
  if (changed) canvas.requestRenderAll()
}

// ---------------------------------------------------------------------------
// Background pattern helper — draws a ruled or grid pattern as a Fabric
// Pattern tiled on top of the solid surface colour. The tile also has the
// solid fill pre-drawn, so there's no transparency bleed from the canvas
// element edge. The pattern is NOT serialised; it is re-applied after each
// page load from toSaveable() which temporarily swaps it for the solid colour.
// ---------------------------------------------------------------------------
function makeBgPattern(bgStyle, surfaceColor) {
  if (bgStyle === 'blank') return null
  const pc = document.createElement('canvas')
  // Detect dark mode by checking if the surface colour looks dark
  const isDark = (() => {
    const m = surfaceColor.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
    if (!m) return false
    const [, r, g, b] = m.map((x, i) => (i === 0 ? x : parseInt(x, 16)))
    return (r * 299 + g * 587 + b * 114) / 1000 < 128
  })()
  const lineColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'

  if (bgStyle === 'ruled') {
    pc.width = 1; pc.height = 32
    const ctx = pc.getContext('2d')
    ctx.fillStyle = surfaceColor; ctx.fillRect(0, 0, 1, 32)
    ctx.strokeStyle = lineColor; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, 31.5); ctx.lineTo(1, 31.5); ctx.stroke()
  } else {
    // grid
    pc.width = 32; pc.height = 32
    const ctx = pc.getContext('2d')
    ctx.fillStyle = surfaceColor; ctx.fillRect(0, 0, 32, 32)
    ctx.strokeStyle = lineColor; ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(31.5, 0); ctx.lineTo(31.5, 32)
    ctx.moveTo(0, 31.5); ctx.lineTo(32, 31.5)
    ctx.stroke()
  }
  return new fabric.Pattern({ source: pc, repeat: 'repeat' })
}

// ---------------------------------------------------------------------------
// PageCanvas
// ---------------------------------------------------------------------------
//
// Props:
//   pageId          – id of the currently visible page (from IndexedDB)
//   tool            – active tool id from DrawToolbar
//   onPlacementDone – reset tool to 'select' after a one-shot placement
//   strokeColor     – current pen/shape colour
//   strokeWidth     – current pen/shape width
//   bgStyle         – 'blank' | 'ruled' | 'grid'
//   apiRef          – mutable ref populated with { undo, redo, zoomIn, ... }
//   onZoomChange    – (pct: number) => void  — reports new zoom %
//   onHistoryChange – (canUndo: bool, canRedo: bool) => void
//
export default function PageCanvas({
  pageId,
  tool,
  onPlacementDone,
  strokeColor,
  strokeWidth,
  bgStyle = 'blank',
  apiRef,
  onZoomChange,
  onHistoryChange,
}) {
  const canvasElRef  = useRef(null)
  const fabricRef    = useRef(null)
  const scrollRef    = useRef(null)
  const prevPageIdRef = useRef(pageId)

  // Latest stable copies kept in refs so async callbacks never go stale.
  const pageIdRef       = useRef(pageId)
  const bgStyleRef      = useRef(bgStyle)
  const canvasSurfaceRef = useRef(null) // populated once C is available

  const [selectedText, setSelectedText] = useState(null)
  const [noteAnchors, setNoteAnchors]   = useState([])
  const C = useThemeColors()

  // Keep refs in sync.
  useEffect(() => { pageIdRef.current = pageId }, [pageId])
  useEffect(() => { bgStyleRef.current = bgStyle }, [bgStyle])
  useEffect(() => { canvasSurfaceRef.current = C.canvasSurface }, [C.canvasSurface])

  // ── History ──────────────────────────────────────────────────────────────
  const historyRef      = useRef([]) // array of JSON strings
  const historyIdxRef   = useRef(-1)
  const suppressHistRef = useRef(false) // true while loading a snapshot
  const histTimerRef    = useRef(null)

  const notifyHistory = useCallback(() => {
    onHistoryChange?.(historyIdxRef.current > 0, historyIdxRef.current < historyRef.current.length - 1)
  }, [onHistoryChange])

  // Debounced push — consecutive rapid modifications (e.g. dragging) produce
  // only one history entry, 150 ms after the last change.
  const pushHistory = useCallback(() => {
    if (suppressHistRef.current) return
    clearTimeout(histTimerRef.current)
    histTimerRef.current = setTimeout(() => {
      const canvas = fabricRef.current
      if (!canvas) return
      const snap = JSON.stringify(canvas.toDatalessJSON(CUSTOM_PROPS))
      historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1)
      historyRef.current.push(snap)
      if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift()
      historyIdxRef.current = historyRef.current.length - 1
      notifyHistory()
    }, 150)
  }, [notifyHistory])

  // ── Canvas helpers ────────────────────────────────────────────────────────
  const refreshAnchors = useCallback(() => {
    const c = fabricRef.current
    setNoteAnchors(c ? c.getObjects().filter((o) => o.__isMarkdownAnchor) : [])
  }, [])

  // Apply the current bgStyle preference to the canvas background.
  const applyBg = useCallback((canvas) => {
    const pattern = makeBgPattern(bgStyleRef.current, canvasSurfaceRef.current ?? '#ffffff')
    canvas.backgroundColor = pattern ?? (canvasSurfaceRef.current ?? '#ffffff')
    canvas.requestRenderAll()
  }, [])

  // Return a serialisable JSON object with the bg pattern temporarily replaced
  // by the solid surface colour so it doesn't bloat the stored JSON.
  const toSaveable = useCallback((canvas) => {
    const savedBg = canvas.backgroundColor
    canvas.backgroundColor = canvasSurfaceRef.current ?? '#ffffff'
    const json = canvas.toDatalessJSON(CUSTOM_PROPS)
    canvas.backgroundColor = savedBg
    return json
  }, [])

  // Load a history snapshot (called by undo/redo).
  const applySnapshot = useCallback(async (snap) => {
    const canvas = fabricRef.current
    if (!canvas) return
    suppressHistRef.current = true
    canvas.clear()
    setNoteAnchors([])
    await canvas.loadFromJSON(JSON.parse(snap))
    adaptCanvasColors(canvas, C.canvasText)
    applyBg(canvas)
    refreshAnchors()
    suppressHistRef.current = false
    putPage(pageIdRef.current, toSaveable(canvas))
  }, [C.canvasText, applyBg, refreshAnchors, toSaveable])

  // ── Public API (exposed via apiRef) ───────────────────────────────────────
  // Wrapping each in its own ref so the keyboard handler effect (which uses
  // them) never closes over stale versions without needing to re-register.
  const actionsRef = useRef({})

  const undo = useCallback(async () => {
    if (historyIdxRef.current <= 0) return
    historyIdxRef.current--
    await applySnapshot(historyRef.current[historyIdxRef.current])
    notifyHistory()
  }, [applySnapshot, notifyHistory])

  const redo = useCallback(async () => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return
    historyIdxRef.current++
    await applySnapshot(historyRef.current[historyIdxRef.current])
    notifyHistory()
  }, [applySnapshot, notifyHistory])

  const zoomIn = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const nz = Math.min(canvas.getZoom() * 1.25, 4)
    canvas.setZoom(nz)
    onZoomChange?.(Math.round(nz * 100))
  }, [onZoomChange])

  const zoomOut = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const nz = Math.max(canvas.getZoom() / 1.25, 0.25)
    canvas.setZoom(nz)
    onZoomChange?.(Math.round(nz * 100))
  }, [onZoomChange])

  const zoomReset = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.setZoom(1)
    const scrollEl = scrollRef.current
    if (scrollEl) { scrollEl.scrollLeft = 0; scrollEl.scrollTop = 0 }
    onZoomChange?.(100)
  }, [onZoomChange])

  const exportPNG = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    // Temporarily restore solid background so the exported PNG doesn't have
    // the pattern baked in as a Fabric object artefact.
    const url = canvas.toDataURL({ format: 'png', multiplier: 1 })
    const a = document.createElement('a')
    a.href = url
    a.download = 'canvas-page.png'
    a.click()
  }, [])

  // Sync actions into actionsRef and apiRef on every render cycle where they
  // change (rare — only when callback deps change).
  useEffect(() => {
    const api = { undo, redo, zoomIn, zoomOut, zoomReset, exportPNG }
    actionsRef.current = api
    if (apiRef) apiRef.current = api
  }, [apiRef, undo, redo, zoomIn, zoomOut, zoomReset, exportPNG])

  // ── Mount the Fabric canvas once ─────────────────────────────────────────
  useEffect(() => {
    canvasSurfaceRef.current = C.canvasSurface
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: C.canvasSurface,
    })
    fabricRef.current = canvas

    const onSel = () => {
      const obj = canvas.getActiveObject()
      setSelectedText(obj?.type === 'textbox' ? obj : null)
    }
    canvas.on('selection:created', onSel)
    canvas.on('selection:updated', onSel)
    canvas.on('selection:cleared', () => setSelectedText(null))

    return () => canvas.dispose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Background style ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    applyBg(canvas)
  }, [bgStyle, C.canvasSurface, applyBg])

  // ── Adaptive colours (theme switch) ──────────────────────────────────────
  useEffect(() => {
    const canvas = fabricRef.current
    if (canvas) adaptCanvasColors(canvas, C.canvasText)
  }, [C.canvasText])

  // ── History push on canvas events ────────────────────────────────────────
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.on('object:added', pushHistory)
    canvas.on('object:modified', pushHistory)
    canvas.on('object:removed', pushHistory)
    canvas.on('path:created', pushHistory)
    return () => {
      canvas.off('object:added', pushHistory)
      canvas.off('object:modified', pushHistory)
      canvas.off('object:removed', pushHistory)
      canvas.off('path:created', pushHistory)
    }
  }, [pushHistory])

  // ── Autosave (debounced, separate from history) ───────────────────────────
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    let timer = null
    const schedule = () => {
      clearTimeout(timer)
      timer = setTimeout(() => putPage(pageIdRef.current, toSaveable(canvas)), 600)
    }
    canvas.on('object:added', schedule)
    canvas.on('object:modified', schedule)
    canvas.on('object:removed', schedule)
    canvas.on('path:created', schedule)
    return () => {
      clearTimeout(timer)
      canvas.off('object:added', schedule)
      canvas.off('object:modified', schedule)
      canvas.off('object:removed', schedule)
      canvas.off('path:created', schedule)
    }
  }, [toSaveable]) // stable ref — won't re-run

  // ── Page switch — save outgoing page, load incoming ───────────────────────
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    let cancelled = false

    ;(async () => {
      const outId = prevPageIdRef.current
      if (outId !== pageId) await putPage(outId, toSaveable(canvas))
      if (cancelled) return

      const stored = await getPage(pageId)
      if (cancelled) return

      suppressHistRef.current = true
      canvas.clear()
      setNoteAnchors([])

      // Reset history for the new page
      clearTimeout(histTimerRef.current)
      historyRef.current = []
      historyIdxRef.current = -1
      notifyHistory()

      if (stored?.canvasJSON) {
        await canvas.loadFromJSON(stored.canvasJSON)
        if (cancelled) return
        adaptCanvasColors(canvas, C.canvasText)
        refreshAnchors()
      }

      suppressHistRef.current = false
      applyBg(canvas)

      // Push the initial state as the first history entry so Undo is disabled.
      pushHistory()
      prevPageIdRef.current = pageId
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  // ── Ctrl+Wheel zoom ───────────────────────────────────────────────────────
  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return
    const handleWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const canvas = fabricRef.current
      if (!canvas) return
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const nz = Math.min(Math.max(canvas.getZoom() * delta, 0.25), 4)
      const canvasEl = canvasElRef.current
      if (canvasEl) {
        const rect = canvasEl.getBoundingClientRect()
        canvas.zoomToPoint(new fabric.Point(e.clientX - rect.left, e.clientY - rect.top), nz)
      } else {
        canvas.setZoom(nz)
      }
      onZoomChange?.(Math.round(nz * 100))
    }
    scrollEl.addEventListener('wheel', handleWheel, { passive: false })
    return () => scrollEl.removeEventListener('wheel', handleWheel)
  }, [onZoomChange])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const clipboardRef = { current: null }

    const handleKeyDown = async (e) => {
      const canvas = fabricRef.current
      if (!canvas) return
      // Don't intercept while typing in an input or textarea
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const ctrl = e.ctrlKey || e.metaKey
      const actions = actionsRef.current

      // Undo / Redo
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); await actions.undo?.(); return }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); await actions.redo?.(); return }

      // Select all
      if (ctrl && e.key === 'a') {
        e.preventDefault()
        const selectable = canvas.getObjects().filter((o) => o.selectable)
        if (selectable.length) {
          canvas.discardActiveObject()
          canvas.setActiveObject(new fabric.ActiveSelection(selectable, { canvas }))
          canvas.requestRenderAll()
        }
        return
      }

      // Zoom
      if (ctrl && (e.key === '=' || e.key === '+')) { e.preventDefault(); actions.zoomIn?.(); return }
      if (ctrl && e.key === '-') { e.preventDefault(); actions.zoomOut?.(); return }
      if (ctrl && e.key === '0') { e.preventDefault(); actions.zoomReset?.(); return }

      // Copy active object
      if (ctrl && e.key === 'c') {
        const obj = canvas.getActiveObject()
        if (obj) { clipboardRef.current = await obj.clone() }
        return
      }

      // Paste object (offset by 20px so it doesn't land exactly on the original)
      if (ctrl && e.key === 'v') {
        const cloned = clipboardRef.current
        if (!cloned) return
        const next = await cloned.clone()
        next.set({ left: (next.left ?? 0) + 20, top: (next.top ?? 0) + 20, evented: true, selectable: true })
        canvas.add(next)
        canvas.setActiveObject(next)
        canvas.requestRenderAll()
        return
      }

      // Delete / Backspace — remove selected objects
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = canvas.getActiveObjects()
        if (active.length) {
          active.forEach((o) => canvas.remove(o))
          canvas.discardActiveObject()
          canvas.requestRenderAll()
          refreshAnchors()
        }
        return
      }

      // Escape — deselect
      if (e.key === 'Escape') {
        canvas.discardActiveObject()
        canvas.requestRenderAll()
        return
      }

      // Arrow-key nudge (1 px; 10 px with Shift)
      const nudge = e.shiftKey ? 10 : 1
      const obj = canvas.getActiveObject()
      if (!obj) return
      if (e.key === 'ArrowLeft')  { e.preventDefault(); obj.set('left', (obj.left ?? 0) - nudge); canvas.fire('object:modified'); canvas.requestRenderAll() }
      if (e.key === 'ArrowRight') { e.preventDefault(); obj.set('left', (obj.left ?? 0) + nudge); canvas.fire('object:modified'); canvas.requestRenderAll() }
      if (e.key === 'ArrowUp')    { e.preventDefault(); obj.set('top',  (obj.top  ?? 0) - nudge); canvas.fire('object:modified'); canvas.requestRenderAll() }
      if (e.key === 'ArrowDown')  { e.preventDefault(); obj.set('top',  (obj.top  ?? 0) + nudge); canvas.fire('object:modified'); canvas.requestRenderAll() }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [refreshAnchors]) // actionsRef is stable, clipboardRef is local

  // ── Tool application ──────────────────────────────────────────────────────
  // Pen, marker, eraser, text, note, select — and the four shape tools.
  // Shape tools share one effect that handles the mouse-down→drag→up cycle.
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

    const isShape = SHAPE_TOOL_IDS.includes(tool)
    canvas.selection = tool === 'select'
    canvas.getObjects().forEach((o) => {
      o.selectable = tool === 'select'
      o.evented    = tool === 'select' || tool === 'eraser'
    })
    canvas.defaultCursor =
      tool === 'pan'    ? 'grab'
      : tool === 'select' ? 'default'
      : tool === 'text' || tool === 'note' ? 'cell'
      : 'crosshair'
    canvas.requestRenderAll()

    // ── Shape drag-to-draw ──────────────────────────────────────────────────
    if (isShape) {
      let tempShape = null
      let startPt   = null
      let drawing   = false

      const onMouseDown = (opt) => {
        startPt = canvas.getScenePoint(opt.e)
        drawing = true
        suppressHistRef.current = true // ignore intermediate adds

        const strokeOpts = { stroke: strokeColor, strokeWidth, fill: 'transparent', selectable: false, evented: false }

        if (tool === 'rect') {
          tempShape = new fabric.Rect({ ...strokeOpts, left: startPt.x, top: startPt.y, width: 1, height: 1 })
        } else if (tool === 'ellipse') {
          tempShape = new fabric.Ellipse({ ...strokeOpts, left: startPt.x, top: startPt.y, rx: 1, ry: 1 })
        } else {
          // line or arrow — preview as a simple line
          tempShape = new fabric.Line(
            [startPt.x, startPt.y, startPt.x + 1, startPt.y],
            { stroke: strokeColor, strokeWidth: tool === 'arrow' ? strokeWidth + 1 : strokeWidth, selectable: false, evented: false },
          )
        }
        canvas.add(tempShape)
      }

      const onMouseMove = (opt) => {
        if (!drawing || !tempShape || !startPt) return
        const p = canvas.getScenePoint(opt.e)
        const dx = p.x - startPt.x
        const dy = p.y - startPt.y

        if (tool === 'rect') {
          tempShape.set({
            left:   Math.min(startPt.x, p.x),
            top:    Math.min(startPt.y, p.y),
            width:  Math.abs(dx) || 1,
            height: Math.abs(dy) || 1,
          })
        } else if (tool === 'ellipse') {
          tempShape.set({
            left: Math.min(startPt.x, p.x),
            top:  Math.min(startPt.y, p.y),
            rx:   Math.abs(dx) / 2 || 1,
            ry:   Math.abs(dy) / 2 || 1,
          })
        } else {
          tempShape.set({ x2: p.x, y2: p.y })
        }
        canvas.requestRenderAll()
      }

      const onMouseUp = (opt) => {
        if (!drawing) return
        drawing = false

        const p    = startPt ? canvas.getScenePoint(opt.e) : null
        const dist = p && startPt ? Math.hypot(p.x - startPt.x, p.y - startPt.y) : 0

        // Remove temp shape regardless — we'll add the final version below.
        if (tempShape) { canvas.remove(tempShape); tempShape = null }
        suppressHistRef.current = false // allow the final add to push history

        if (!startPt || dist < 3) { startPt = null; canvas.requestRenderAll(); return }

        if (tool === 'arrow') {
          // Arrow = a single fabric.Path: shaft line + two arrowhead arms.
          const x1 = startPt.x, y1 = startPt.y, x2 = p.x, y2 = p.y
          const angle   = Math.atan2(y2 - y1, x2 - x1)
          const hw      = Math.max(strokeWidth * 4, 14) // arrowhead arm length
          const armAngle = Math.PI / 6 // 30°
          const a1x = x2 - hw * Math.cos(angle - armAngle)
          const a1y = y2 - hw * Math.sin(angle - armAngle)
          const a2x = x2 - hw * Math.cos(angle + armAngle)
          const a2y = y2 - hw * Math.sin(angle + armAngle)
          const pathStr = `M ${x1} ${y1} L ${x2} ${y2} M ${x2} ${y2} L ${a1x} ${a1y} M ${x2} ${y2} L ${a2x} ${a2y}`
          const arrow = new fabric.Path(pathStr, {
            stroke: strokeColor,
            strokeWidth: strokeWidth + 1,
            fill: 'transparent',
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
          })
          canvas.add(arrow)
          canvas.setActiveObject(arrow)
        } else {
          // rect / ellipse / line — create the final version with selectable=true
          let finalShape
          const strokeOpts = { stroke: strokeColor, strokeWidth, fill: 'transparent', selectable: true, evented: true }
          if (tool === 'rect') {
            finalShape = new fabric.Rect({
              ...strokeOpts,
              left:   Math.min(startPt.x, p.x),
              top:    Math.min(startPt.y, p.y),
              width:  Math.abs(p.x - startPt.x),
              height: Math.abs(p.y - startPt.y),
            })
          } else if (tool === 'ellipse') {
            finalShape = new fabric.Ellipse({
              ...strokeOpts,
              left: Math.min(startPt.x, p.x),
              top:  Math.min(startPt.y, p.y),
              rx:   Math.abs(p.x - startPt.x) / 2,
              ry:   Math.abs(p.y - startPt.y) / 2,
            })
          } else {
            // line
            finalShape = new fabric.Line([startPt.x, startPt.y, p.x, p.y], {
              stroke: strokeColor, strokeWidth, selectable: true, evented: true,
            })
          }
          canvas.add(finalShape)
          canvas.setActiveObject(finalShape)
        }

        canvas.requestRenderAll()
        startPt = null
        onPlacementDone()
      }

      canvas.on('mouse:down', onMouseDown)
      canvas.on('mouse:move', onMouseMove)
      canvas.on('mouse:up',   onMouseUp)
      return () => {
        canvas.off('mouse:down', onMouseDown)
        canvas.off('mouse:move', onMouseMove)
        canvas.off('mouse:up',   onMouseUp)
      }
    }

    // ── Non-shape tools: eraser, text, note ──────────────────────────────────
    const onMouseDown = (opt) => {
      if (tool === 'eraser' && opt.target) {
        canvas.remove(opt.target)
        canvas.requestRenderAll()
        refreshAnchors()
      }

      if (tool === 'text' && !opt.target) {
        const p = canvas.getScenePoint(opt.e)
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
        // fabric.Rect used as a position/size anchor — MarkdownNote's HTML
        // overlay covers it. __isMarkdownAnchor and __markdown survive
        // through toDatalessJSON via CUSTOM_PROPS.
        const anchor = new fabric.Rect({
          left: p.x,
          top: p.y,
          width: 260,
          height: 180,
          fill: 'rgba(255,247,178,0.18)',
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
  }, [tool, strokeColor, strokeWidth, refreshAnchors, onPlacementDone]) // eslint-disable-line

  // ── Pan tool — drag to scroll ─────────────────────────────────────────────
  useEffect(() => {
    if (tool !== 'pan') return
    const canvas  = fabricRef.current
    const scrollEl = scrollRef.current
    if (!canvas || !scrollEl) return

    const onMouseDown = (opt) => {
      const startX = opt.e.clientX, startY = opt.e.clientY
      const startL = scrollEl.scrollLeft, startT = scrollEl.scrollTop
      canvas.defaultCursor = 'grabbing'

      const onMove = (ev) => {
        scrollEl.scrollLeft = startL - (ev.clientX - startX)
        scrollEl.scrollTop  = startT - (ev.clientY - startY)
      }
      const onUp = () => {
        canvas.defaultCursor = 'grab'
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    }

    canvas.on('mouse:down', onMouseDown)
    return () => canvas.off('mouse:down', onMouseDown)
  }, [tool])

  // ── Clipboard image paste ─────────────────────────────────────────────────
  useEffect(() => {
    const handlePaste = (e) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const canvas = fabricRef.current
      if (!canvas) return
      const items = e.clipboardData?.items
      if (!items) return
      const imgItem = [...items].find((i) => i.type.startsWith('image/'))
      if (!imgItem) return
      const file = imgItem.getAsFile()
      const reader = new FileReader()
      reader.onload = () => {
        fabric.FabricImage.fromURL(reader.result).then((img) => {
          if (img.width > 500) img.scaleToWidth(500)
          img.set({
            left: CANVAS_W / 2 - img.getScaledWidth() / 2,
            top:  CANVAS_H / 2 - img.getScaledHeight() / 2,
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

  // ── Text formatting helpers ───────────────────────────────────────────────
  const applyTextStyle = (styles) => {
    const canvas = fabricRef.current
    const obj = selectedText
    if (!canvas || !obj) return
    const start = obj.selectionStart ?? 0
    const end   = obj.selectionEnd   ?? obj.text.length
    const from  = start === end ? 0 : start
    const to    = start === end ? obj.text.length : end
    obj.setSelectionStyles(styles, from, to)
    canvas.requestRenderAll()
    canvas.fire('object:modified')
  }

  const toggleBold      = () => applyTextStyle({ fontWeight: selectedText?.getSelectionStyles(0, 1)[0]?.fontWeight === 'bold' ? 'normal' : 'bold' })
  const toggleItalic    = () => applyTextStyle({ fontStyle:  selectedText?.getSelectionStyles(0, 1)[0]?.fontStyle  === 'italic' ? 'normal' : 'italic' })
  const toggleUnderline = () => applyTextStyle({ underline:  !selectedText?.getSelectionStyles(0, 1)[0]?.underline })
  const toggleStrike    = () => applyTextStyle({ linethrough: !selectedText?.getSelectionStyles(0, 1)[0]?.linethrough })

  const deleteAnchor = (anchor) => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.remove(anchor)
    canvas.requestRenderAll()
    refreshAnchors()
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Inline text format toolbar — only visible when a Textbox is selected */}
      {selectedText && (
        <TextFormatToolbar
          onToggleBold={toggleBold}
          onToggleItalic={toggleItalic}
          onToggleUnderline={toggleUnderline}
          onToggleStrike={toggleStrike}
          onChangeColor={(color) => applyTextStyle({ fill: color })}
          onChangeSize={(size)  => applyTextStyle({ fontSize: size })}
          onChangeFont={(font)  => applyTextStyle({ fontFamily: font || undefined })}
        />
      )}

      {/* Scroll viewport — the canvas (CANVAS_W × CANVAS_H) is bigger than
          this div, so native scrollbars or the Pan tool reveal the rest.
          Ctrl+Wheel on this div zooms via Fabric's viewportTransform. */}
      <div ref={scrollRef} className="flex-1 min-h-0 w-full overflow-auto">
        {/* Fabric reparents <canvas> into its own wrapper — nothing else
            conditionally rendered by React should live inside this div. */}
        <div>
          <canvas ref={canvasElRef} />
        </div>
      </div>

      {/* One HTML overlay per markdown anchor, always OUTSIDE the canvas
          wrapper so React's reconciler doesn't collide with Fabric's DOM. */}
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
