import { useEffect, useRef, useState, useCallback } from "react"
import * as fabric from "fabric"
import Editor from "@monaco-editor/react"
import "./SvgStudio.css"

const CANVAS_W = 800
const CANVAS_H = 600
const SNAP_THRESHOLD = 8
const GRID_SIZE = 20

const SWATCHES = [
  "#1e1e1e","#ffffff","#e24b4a","#ef9f27",
  "#639922","#1d9e75","#378ade","#7f77dd","#d4537e",
]

// The app's own logo (same shape as the AppShell tile, colors baked in since
// this gets parsed outside the app's live Tailwind CSS) — loaded onto the
// canvas by default so opening SVG Studio always gives you a real starting
// point to edit and re-export (e.g. as a favicon), not a blank page.
const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="logoBgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56" fill="url(#logoBgGrad)"/>
  <g transform="matrix(4.8069 0 0 3.7957 126.0017 180)">
    <text font-family="'Montserrat','Helvetica Neue',Helvetica,Arial,sans-serif" font-size="75" font-weight="900" fill="#ffffff">
      <tspan x="-24.7559" y="23.5605">^</tspan>
    </text>
  </g>
</svg>`

const TOOLS = [
  { id: "select",   label: "Select",    icon: "↖" },
  { id: "pen",      label: "Freehand",  icon: "✎" },
  { id: "line",     label: "Line",      icon: "╱" },
  { id: "rect",     label: "Rectangle", icon: "▭" },
  { id: "ellipse",  label: "Ellipse",   icon: "◯" },
  { id: "triangle", label: "Triangle",  icon: "△" },
  { id: "text",     label: "Text",      icon: "T" },
]

function uid() { return Math.random().toString(36).slice(2, 9) }

// Returns vertical + horizontal snap reference lines from canvas edges/center,
// grid, and all sibling objects' edges/centers.
function collectSnapLines(canvas, excluding) {
  const vLines = new Set([0, CANVAS_W / 2, CANVAS_W])
  const hLines = new Set([0, CANVAS_H / 2, CANVAS_H])
  for (let x = 0; x <= CANVAS_W; x += GRID_SIZE) vLines.add(x)
  for (let y = 0; y <= CANVAS_H; y += GRID_SIZE) hLines.add(y)
  canvas.getObjects().forEach(o => {
    if (o === excluding) return
    if (excluding?.type === "activeSelection" && excluding.getObjects?.().includes(o)) return
    const b = o.getBoundingRect()
    vLines.add(b.left); vLines.add(b.left + b.width / 2); vLines.add(b.left + b.width)
    hLines.add(b.top);  hLines.add(b.top + b.height / 2); hLines.add(b.top + b.height)
  })
  return { vLines: [...vLines], hLines: [...hLines] }
}

function closestSnap(values, candidates, threshold) {
  let best = null
  for (const v of values) {
    for (const c of candidates) {
      const d = Math.abs(v - c)
      if (d <= threshold && (!best || d < best.dist)) best = { dist: d, target: c, from: v, delta: c - v }
    }
  }
  return best
}

export default function SvgStudioPage({ onBack, onClose }) {
  const handleBack = onBack ?? onClose ?? (() => {})
  const canvasElRef  = useRef(null)
  const fabricRef    = useRef(null)
  const fileInputRef = useRef(null)
  const overlayRef   = useRef(null)
  const monacoRef    = useRef(null)
  const editorRef    = useRef(null)

  const [tool, setTool]               = useState("select")
  const [zoom, setZoom]               = useState(1)
  const [selected, setSelected]       = useState(null)
  const [layers, setLayers]           = useState([])
  const [fillColor, setFillColor]     = useState("#378ade")
  const [strokeColor, setStrokeColor] = useState("#1e1e1e")
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [history, setHistory]         = useState({ stack: [], idx: -1 })
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [showCode, setShowCode]       = useState(false)
  const [svgCode, setSvgCode]         = useState("")

  const isRestoring          = useRef(false)
  const drawStart            = useRef(null)
  const drawShape            = useRef(null)
  const codeSyncingFromCanvas = useRef(false)
  const canvasSyncingFromCode = useRef(false)

  // ---------- SVG ↔ canvas sync ----------
  // Fabric's toSVG() doesn't carry __id so we inject data-obj-id by matching
  // serialization order (fabric serializes in z-order, same as getObjects()).
  const generateAnnotatedSVG = useCallback(() => {
    const canvas = fabricRef.current; if (!canvas) return ""
    const raw = canvas.toSVG()
    const objects = canvas.getObjects()
    const doc = new DOMParser().parseFromString(raw, "image/svg+xml")
    const drawable = doc.querySelectorAll("rect,ellipse,circle,polygon,polyline,path,line,text,image,g")
    let i = 0
    drawable.forEach(node => {
      if (node.closest("[data-obj-id]")) return
      const obj = objects[i]
      if (obj) { node.setAttribute("data-obj-id", obj.__id); i++ }
    })
    return new XMLSerializer().serializeToString(doc)
  }, [])

  const refreshCodeFromCanvas = useCallback(() => {
    if (canvasSyncingFromCode.current) return
    codeSyncingFromCanvas.current = true
    setSvgCode(generateAnnotatedSVG())
    setTimeout(() => { codeSyncingFromCanvas.current = false }, 0)
  }, [generateAnnotatedSVG])

  // ---------- init Fabric canvas ----------
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: CANVAS_W, height: CANVAS_H, backgroundColor: "#ffffff", preserveObjectStacking: true,
    })
    fabricRef.current = canvas

    const refreshLayers = () => setLayers(
      canvas.getObjects().map(o => ({ id: o.__id, type: o.type, name: o.__name || o.type, visible: o.visible !== false })).reverse()
    )
    const onSelection = () => { const obj = canvas.getActiveObject(); setSelected(obj || null); highlightCodeForObject(obj) }
    canvas.on("selection:created", onSelection)
    canvas.on("selection:updated", onSelection)
    canvas.on("selection:cleared", () => setSelected(null))
    canvas.on("object:added",    e => { if (e.target && !e.target.__id) e.target.__id = uid(); refreshLayers() })
    canvas.on("object:removed",  refreshLayers)
    canvas.on("object:modified", () => { refreshLayers(); refreshCodeFromCanvas() })

    let saveTimer = null
    const pushHistory = () => {
      if (isRestoring.current) return
      clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        const json = JSON.stringify(canvas.toDatalessJSON(["__id","__name"]))
        setHistory(h => { const stack = h.stack.slice(0, h.idx + 1); stack.push(json); return { stack, idx: stack.length - 1 } })
      }, 250)
    }
    canvas.on("object:added",    pushHistory)
    canvas.on("object:modified", pushHistory)
    canvas.on("object:removed",  pushHistory)
    canvas.on("path:created",    pushHistory)
    canvas.on("path:created",    refreshCodeFromCanvas)

    // Load the app's own logo by default — same code path as a normal SVG
    // import (fabric.loadSVGFromString + groupSVGElements) — so opening SVG
    // Studio always gives you a real starting point to edit and re-export
    // (e.g. as a favicon) instead of a blank canvas. isRestoring suppresses
    // pushHistory while this loads so it becomes history entry zero, not a
    // separate undo-able step on top of an empty canvas.
    ;(async () => {
      const result = await fabric.loadSVGFromString(DEFAULT_SVG)
      const objects = result.objects.filter(Boolean)
      const group = fabric.util.groupSVGElements(objects, result.options)
      group.__id = uid(); group.__name = "Logo"
      group.set({ left: (CANVAS_W-group.width)/2, top: (CANVAS_H-group.height)/2 })
      isRestoring.current = true
      canvas.add(group)
      canvas.requestRenderAll()
      setHistory({ stack: [JSON.stringify(canvas.toDatalessJSON(["__id","__name"]))], idx: 0 })
      isRestoring.current = false
      refreshCodeFromCanvas()
    })()
    return () => canvas.dispose()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- keyboard shortcuts ----------
  useEffect(() => {
    const onKey = e => {
      const canvas = fabricRef.current; if (!canvas) return
      const tag = document.activeElement?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return

      if (e.key === "Delete" || e.key === "Backspace") {
        const active = canvas.getActiveObjects()
        if (active.length) { active.forEach(o => canvas.remove(o)); canvas.discardActiveObject(); canvas.requestRenderAll(); e.preventDefault() }
      }
      if ((e.metaKey||e.ctrlKey) && e.key==="z" && !e.shiftKey)               { e.preventDefault(); undo() }
      if ((e.metaKey||e.ctrlKey) && (e.key==="y"||(e.key==="z"&&e.shiftKey))) { e.preventDefault(); redo() }
      if ((e.metaKey||e.ctrlKey) && e.key==="d")                              { e.preventDefault(); duplicateSelected() }
      if ((e.metaKey||e.ctrlKey) && e.key==="g" && !e.shiftKey)               { e.preventDefault(); groupSelected() }
      if ((e.metaKey||e.ctrlKey) && e.shiftKey && e.key.toLowerCase()==="g")  { e.preventDefault(); ungroupSelected() }
      if ((e.metaKey||e.ctrlKey) && e.key==="a") {
        e.preventDefault()
        canvas.discardActiveObject()
        canvas.setActiveObject(new fabric.ActiveSelection(canvas.getObjects(), { canvas }))
        canvas.requestRenderAll()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [history]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- snap guides ----------
  useEffect(() => {
    const canvas = fabricRef.current; if (!canvas) return
    const clearGuides = () => { const ov = overlayRef.current; if (ov) ov.innerHTML = "" }
    const drawGuide = (orientation, pos) => {
      const ov = overlayRef.current; if (!ov) return
      const line = document.createElement("div")
      line.className = orientation === "v" ? "snap-guide snap-guide--v" : "snap-guide snap-guide--h"
      if (orientation === "v") line.style.left = `${pos}px`; else line.style.top = `${pos}px`
      ov.appendChild(line)
    }
    const onMoving = opt => {
      clearGuides(); if (!snapEnabled) return
      const obj = opt.target, b = obj.getBoundingRect()
      const { vLines, hLines } = collectSnapLines(canvas, obj)
      const snapV = closestSnap([b.left, b.left+b.width/2, b.left+b.width], vLines, SNAP_THRESHOLD)
      const snapH = closestSnap([b.top,  b.top+b.height/2, b.top+b.height],  hLines, SNAP_THRESHOLD)
      if (snapV) { obj.left += snapV.delta; drawGuide("v", snapV.target) }
      if (snapH) { obj.top  += snapH.delta; drawGuide("h", snapH.target) }
      obj.setCoords()
    }
    const onScaling = opt => {
      clearGuides(); if (!snapEnabled) return
      const obj = opt.target, b = obj.getBoundingRect()
      const { vLines, hLines } = collectSnapLines(canvas, obj)
      const snapR = closestSnap([b.left+b.width],  vLines, SNAP_THRESHOLD)
      const snapB = closestSnap([b.top+b.height],  hLines, SNAP_THRESHOLD)
      if (snapR) drawGuide("v", snapR.target)
      if (snapB) drawGuide("h", snapB.target)
    }
    canvas.on("object:moving",  onMoving)
    canvas.on("object:scaling", onScaling)
    canvas.on("mouse:up",       clearGuides)
    return () => { canvas.off("object:moving", onMoving); canvas.off("object:scaling", onScaling); canvas.off("mouse:up", clearGuides) }
  }, [snapEnabled])

  // ---------- drawing tool mouse handlers ----------
  useEffect(() => {
    const canvas = fabricRef.current; if (!canvas) return
    canvas.isDrawingMode = tool === "pen"
    if (tool === "pen") {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.width = strokeWidth
      canvas.freeDrawingBrush.color = strokeColor
    }
    canvas.selection = tool === "select"
    canvas.getObjects().forEach(o => { o.selectable = tool === "select"; o.evented = tool === "select" })

    const onDown = opt => {
      if (tool === "select" || tool === "pen") return
      const p = canvas.getScenePoint(opt.e); drawStart.current = p
      if (tool === "text") {
        const t = new fabric.IText("Edit me", { left: p.x, top: p.y, fontSize: 28, fill: fillColor, fontFamily: "-apple-system, sans-serif" })
        t.__id = uid(); t.__name = "Text"
        canvas.add(t); canvas.setActiveObject(t); t.enterEditing(); setTool("select"); return
      }
      const common = { left: p.x, top: p.y, fill: fillColor, stroke: strokeColor, strokeWidth }
      let shape
      if (tool === "rect")     shape = new fabric.Rect({ ...common, width: 1, height: 1 })
      if (tool === "ellipse")  shape = new fabric.Ellipse({ ...common, rx: 1, ry: 1 })
      if (tool === "triangle") shape = new fabric.Triangle({ ...common, width: 1, height: 1 })
      if (tool === "line")     shape = new fabric.Line([p.x, p.y, p.x, p.y], { stroke: strokeColor, strokeWidth })
      if (shape) { shape.__id = uid(); shape.__name = tool[0].toUpperCase() + tool.slice(1); drawShape.current = shape; canvas.add(shape) }
    }
    const onMove = opt => {
      if (!drawShape.current || !drawStart.current) return
      const p = canvas.getScenePoint(opt.e), s = drawStart.current, shape = drawShape.current
      if (tool === "rect" || tool === "triangle")
        shape.set({ left: Math.min(s.x,p.x), top: Math.min(s.y,p.y), width: Math.abs(p.x-s.x), height: Math.abs(p.y-s.y) })
      else if (tool === "ellipse")
        shape.set({ left: Math.min(s.x,p.x), top: Math.min(s.y,p.y), rx: Math.abs(p.x-s.x)/2, ry: Math.abs(p.y-s.y)/2 })
      else if (tool === "line")
        shape.set({ x2: p.x, y2: p.y })
      canvas.requestRenderAll()
    }
    const onUp = () => {
      if (drawShape.current) { canvas.setActiveObject(drawShape.current); canvas.fire("object:modified"); drawShape.current = null; drawStart.current = null; setTool("select") }
    }
    canvas.on("mouse:down", onDown); canvas.on("mouse:move", onMove); canvas.on("mouse:up", onUp)
    return () => { canvas.off("mouse:down", onDown); canvas.off("mouse:move", onMove); canvas.off("mouse:up", onUp) }
  }, [tool, fillColor, strokeColor, strokeWidth])

  // ---------- history ----------
  const restore = useCallback(json => {
    const canvas = fabricRef.current; if (!canvas || !json) return
    isRestoring.current = true
    canvas.loadFromJSON(JSON.parse(json), () => { canvas.requestRenderAll(); isRestoring.current = false; refreshCodeFromCanvas() })
  }, [refreshCodeFromCanvas])

  const undo = useCallback(() => setHistory(h => {
    if (h.idx <= 0) return h; const idx = h.idx - 1; restore(h.stack[idx]); return { ...h, idx }
  }), [restore])

  const redo = useCallback(() => setHistory(h => {
    if (h.idx >= h.stack.length - 1) return h; const idx = h.idx + 1; restore(h.stack[idx]); return { ...h, idx }
  }), [restore])

  const duplicateSelected = useCallback(async () => {
    const canvas = fabricRef.current, active = canvas?.getActiveObject(); if (!active) return
    const clone = await active.clone()
    clone.set({ left: active.left + 16, top: active.top + 16, __id: uid() })
    canvas.add(clone); canvas.setActiveObject(clone); canvas.requestRenderAll(); canvas.fire("object:modified")
  }, [])

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current, active = canvas?.getActiveObjects(); if (!active?.length) return
    active.forEach(o => canvas.remove(o)); canvas.discardActiveObject(); canvas.requestRenderAll()
  }, [])

  const groupSelected = useCallback(() => {
    const canvas = fabricRef.current, active = canvas?.getActiveObject()
    if (!active || active.type !== "activeSelection" || active._objects.length < 2) return
    const group = active.toGroup(); group.__id = uid(); group.__name = "Group"
    canvas.requestRenderAll(); canvas.fire("object:modified")
  }, [])

  const ungroupSelected = useCallback(() => {
    const canvas = fabricRef.current, active = canvas?.getActiveObject()
    if (!active || active.type !== "group") return
    const sel = active.toActiveSelection()
    sel.getObjects().forEach(o => { if (!o.__id) o.__id = uid() })
    canvas.requestRenderAll(); canvas.fire("object:modified")
  }, [])

  const bringToFront = () => { const c=fabricRef.current,o=c?.getActiveObject(); if(o){c.bringObjectToFront(o);c.requestRenderAll();c.fire("object:modified")} }
  const bringForward = () => { const c=fabricRef.current,o=c?.getActiveObject(); if(o){c.bringObjectForward(o);c.requestRenderAll();c.fire("object:modified")} }
  const sendBackward = () => { const c=fabricRef.current,o=c?.getActiveObject(); if(o){c.sendObjectBackwards(o);c.requestRenderAll();c.fire("object:modified")} }
  const sendToBack   = () => { const c=fabricRef.current,o=c?.getActiveObject(); if(o){c.sendObjectToBack(o);c.requestRenderAll();c.fire("object:modified")} }

  const align = where => {
    const c = fabricRef.current, o = c?.getActiveObject(); if (!o) return
    const w = o.getScaledWidth(), h = o.getScaledHeight()
    if (where==="left")    o.set({ left: 0 })
    if (where==="centerH") o.set({ left: (CANVAS_W-w)/2 })
    if (where==="right")   o.set({ left: CANVAS_W-w })
    if (where==="top")     o.set({ top: 0 })
    if (where==="centerV") o.set({ top: (CANVAS_H-h)/2 })
    if (where==="bottom")  o.set({ top: CANVAS_H-h })
    o.setCoords(); c.requestRenderAll(); c.fire("object:modified")
  }

  const applyZoom = z => {
    const canvas = fabricRef.current, clamped = Math.min(4, Math.max(0.1, z))
    canvas.setZoom(clamped); canvas.setDimensions({ width: CANVAS_W*clamped, height: CANVAS_H*clamped }); setZoom(clamped)
  }

  const exportSVG = () => {
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([fabricRef.current.toSVG()], {type:"image/svg+xml"})), download: "drawing.svg" })
    a.click(); URL.revokeObjectURL(a.href)
  }

  const exportPNG = () => {
    const canvas = fabricRef.current, prevZoom = canvas.getZoom()
    canvas.setZoom(1); canvas.setDimensions({ width: CANVAS_W, height: CANVAS_H })
    const a = Object.assign(document.createElement("a"), { href: canvas.toDataURL({ format:"png", multiplier:2 }), download: "drawing.png" })
    a.click(); canvas.setZoom(prevZoom); canvas.setDimensions({ width: CANVAS_W*prevZoom, height: CANVAS_H*prevZoom })
  }

  const importSVGFile = file => {
    const canvas = fabricRef.current
    const reader = new FileReader()
    reader.onload = async () => {
      const result = await fabric.loadSVGFromString(String(reader.result))
      const objects = result.objects.filter(Boolean)
      const group = fabric.util.groupSVGElements(objects, result.options)
      group.__id = uid(); group.__name = file.name.replace(/\.svg$/i,"")
      group.set({ left: (CANVAS_W-group.width)/2, top: (CANVAS_H-group.height)/2 })
      canvas.add(group); canvas.setActiveObject(group); canvas.requestRenderAll(); canvas.fire("object:modified")
    }
    reader.readAsText(file)
  }

  const newCanvas = () => {
    if (!window.confirm("Clear the canvas? This can't be undone.")) return
    const canvas = fabricRef.current; canvas.clear(); canvas.backgroundColor="#ffffff"; canvas.requestRenderAll()
    setHistory({ stack: [JSON.stringify(canvas.toDatalessJSON(["__id","__name"]))], idx: 0 }); refreshCodeFromCanvas()
  }

  const updateSelected = props => {
    const canvas = fabricRef.current, o = canvas?.getActiveObject(); if (!o) return
    o.set(props); o.setCoords(); canvas.requestRenderAll(); canvas.fire("object:modified"); setSelected(o)
  }

  const selectLayer  = id => { const c=fabricRef.current,o=c.getObjects().find(x=>x.__id===id); if(o){c.setActiveObject(o);c.requestRenderAll();setTool("select")} }
  const removeLayer  = (id,e) => { e.stopPropagation(); const c=fabricRef.current,o=c.getObjects().find(x=>x.__id===id); if(o){c.remove(o);c.requestRenderAll()} }
  const toggleVisible= (id,e) => { e.stopPropagation(); const c=fabricRef.current,o=c.getObjects().find(x=>x.__id===id); if(o){o.visible=!o.visible;c.requestRenderAll();c.fire("object:modified")} }

  // ---------- code ↔ canvas selection sync ----------
  function highlightCodeForObject(obj) {
    if (!showCode || !editorRef.current || !monacoRef.current) return
    if (!obj?.__id) { editorRef.current.deltaDecorations(editorRef.current.__decorIds||[], []); return }
    const model = editorRef.current.getModel(); if (!model) return
    const text = model.getValue()
    const idx = text.search(new RegExp(`data-obj-id="${obj.__id}"`))
    if (idx === -1) return
    const pos = model.getPositionAt(idx)
    const lineText = model.getLineContent(pos.lineNumber)
    const tagStartCol = lineText.lastIndexOf("<", pos.column) + 1
    const range = new monacoRef.current.Range(pos.lineNumber, tagStartCol, pos.lineNumber, lineText.length + 1)
    editorRef.current.__decorIds = editorRef.current.deltaDecorations(
      editorRef.current.__decorIds||[],
      [{ range, options: { isWholeLine: false, className: "svg-code-highlight" } }]
    )
    editorRef.current.revealLineInCenter(pos.lineNumber)
  }

  useEffect(() => { highlightCodeForObject(selected) }, [selected, showCode]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor; monacoRef.current = monaco
    editor.onDidChangeCursorPosition(e => {
      if (codeSyncingFromCanvas.current) return
      const model = editor.getModel(), offset = model.getOffsetAt(e.position), text = model.getValue()
      const upto = text.slice(0, offset), tagStart = upto.lastIndexOf("<"), tagEnd = text.indexOf(">", tagStart)
      const match = text.slice(tagStart, tagEnd === -1 ? undefined : tagEnd).match(/data-obj-id="([^"]+)"/)
      if (match) {
        const canvas = fabricRef.current, obj = canvas.getObjects().find(o => o.__id === match[1])
        if (obj && canvas.getActiveObject() !== obj) { canvas.setActiveObject(obj); canvas.requestRenderAll() }
      }
    })
  }

  const applyCodeToCanvas = async () => {
    const canvas = fabricRef.current
    canvasSyncingFromCode.current = true
    try {
      const result = await fabric.loadSVGFromString(svgCode)
      const objects = result.objects.filter(Boolean)
      canvas.clear(); canvas.backgroundColor = "#ffffff"
      objects.forEach(o => { o.__id = uid(); canvas.add(o) })
      canvas.requestRenderAll(); canvas.fire("object:modified")
    } catch (err) { window.alert("Couldn't parse that SVG: " + err.message) }
    finally { canvasSyncingFromCode.current = false }
  }

  return (
    <div className={`svg-studio${showCode ? " svg-studio--with-code" : ""}`}>
      {/* Top bar */}
      <div className="svg-studio__topbar">
        <button className="svg-studio__btn" onClick={handleBack}>← Back</button>
        <div className="svg-studio__topbar divider" />
        <span className="brand">SVG Studio</span>

        <button className="svg-studio__btn" onClick={newCanvas}>New</button>
        <button className="svg-studio__btn" onClick={() => fileInputRef.current.click()}>Import SVG</button>
        <input ref={fileInputRef} type="file" accept=".svg,image/svg+xml" style={{display:"none"}}
          onChange={e => { if(e.target.files[0]) importSVGFile(e.target.files[0]); e.target.value="" }} />
        <button className="svg-studio__btn svg-studio__btn--primary" onClick={exportSVG}>Export SVG</button>
        <button className="svg-studio__btn" onClick={exportPNG}>Export PNG</button>

        <div className="svg-studio__topbar divider" />
        <button className="svg-studio__btn" onClick={undo}  disabled={history.idx <= 0}>Undo</button>
        <button className="svg-studio__btn" onClick={redo}  disabled={history.idx >= history.stack.length-1}>Redo</button>
        <button className="svg-studio__btn" onClick={duplicateSelected} disabled={!selected}>Duplicate</button>
        <button className="svg-studio__btn" onClick={deleteSelected}    disabled={!selected}>Delete</button>
        <button className="svg-studio__btn" onClick={groupSelected}
          disabled={!selected || selected.type !== "activeSelection"}>Group</button>
        <button className="svg-studio__btn" onClick={ungroupSelected}
          disabled={!selected || selected.type !== "group"}>Ungroup</button>

        <div className="svg-studio__topbar divider" />
        <button className={`svg-studio__btn${snapEnabled ? " svg-studio__btn--toggled" : ""}`}
          onClick={() => setSnapEnabled(s => !s)} title="Snap to grid, edges, and other objects">
          ⌗ Snap
        </button>
        <button className={`svg-studio__btn${showCode ? " svg-studio__btn--toggled" : ""}`}
          onClick={() => { setShowCode(s => !s); if (!showCode) refreshCodeFromCanvas() }}>
          {"</>"} Code
        </button>

        <div className="svg-studio__spacer" />
        <button className="svg-studio__btn" onClick={() => applyZoom(zoom-0.1)}>−</button>
        <span className="svg-studio__zoom-readout">{Math.round(zoom*100)}%</span>
        <button className="svg-studio__btn" onClick={() => applyZoom(zoom+0.1)}>+</button>
        <button className="svg-studio__btn" onClick={() => applyZoom(1)}>Reset</button>
      </div>

      {/* Left tool rail */}
      <div className="svg-studio__rail">
        <div className="svg-studio__rail-label">Tools</div>
        {TOOLS.map(t => (
          <button key={t.id} className={`svg-studio__tool${tool===t.id?" svg-studio__tool--active":""}`} onClick={() => setTool(t.id)}>
            <span className="svg-studio__tool-icon">{t.icon}</span>{t.label}
          </button>
        ))}
        <div className="svg-studio__rail-label">Fill</div>
        <div className="svg-studio__field" style={{padding:"0 6px"}}>
          <input type="color" value={fillColor} onChange={e => { setFillColor(e.target.value); if(selected) updateSelected({fill:e.target.value}) }} />
          <input type="text"  value={fillColor} onChange={e => { setFillColor(e.target.value); if(selected) updateSelected({fill:e.target.value}) }} />
        </div>
        <div className="svg-studio__swatches">
          {SWATCHES.map(c => (
            <div key={c} className="svg-studio__swatch" style={{background:c}}
              onClick={() => { setFillColor(c); if(selected) updateSelected({fill:c}) }} />
          ))}
        </div>
        <div className="svg-studio__rail-label">Stroke</div>
        <div className="svg-studio__field" style={{padding:"0 6px"}}>
          <input type="color" value={strokeColor} onChange={e => { setStrokeColor(e.target.value); if(selected) updateSelected({stroke:e.target.value}) }} />
          <input type="number" min="0" max="40" value={strokeWidth}
            onChange={e => { const v=Number(e.target.value); setStrokeWidth(v); if(selected) updateSelected({strokeWidth:v}) }} />
        </div>
      </div>

      {/* Canvas */}
      <div className="svg-studio__canvas-wrap">
        <div className="svg-studio__canvas-shadow" style={{position:"relative"}}>
          <canvas ref={canvasElRef} />
          <div ref={overlayRef} className="svg-studio__snap-overlay" />
        </div>
      </div>

      {/* SVG code panel */}
      {showCode && (
        <div className="svg-studio__codepanel">
          <div className="svg-studio__panel-title">
            SVG Source
            <button className="svg-studio__btn svg-studio__btn--small" onClick={applyCodeToCanvas}>
              Apply to canvas
            </button>
          </div>
          <Editor
            height="100%"
            defaultLanguage="xml"
            theme="vs-dark"
            value={svgCode}
            onChange={v => { if (!codeSyncingFromCanvas.current) setSvgCode(v) }}
            onMount={handleEditorMount}
            options={{ minimap:{enabled:false}, fontSize:12, wordWrap:"on", scrollBeyondLastLine:false }}
          />
          <div className="svg-studio__hint" style={{padding:"8px 4px"}}>
            Click object → jumps to tag here. Click inside a tag → selects on canvas. Edit and hit "Apply to canvas" to rebuild.
          </div>
        </div>
      )}

      {/* Right panel */}
      <div className="svg-studio__panel">
        <div className="svg-studio__panel-title">Properties</div>
        {!selected && <p className="svg-studio__panel-empty">Select an object to edit its properties.</p>}

        {selected && (<>
          <div className="svg-studio__field">
            <label>X / Y</label>
            <div className="svg-studio__field-pair">
              <input type="number" value={Math.round(selected.left)} onChange={e => updateSelected({left:Number(e.target.value)})} />
              <input type="number" value={Math.round(selected.top)}  onChange={e => updateSelected({top:Number(e.target.value)})} />
            </div>
          </div>
          <div className="svg-studio__field">
            <label>W / H</label>
            <div className="svg-studio__field-pair">
              <input type="number" value={Math.round(selected.getScaledWidth())}  onChange={e => { const w=Number(e.target.value); updateSelected({scaleX:w/(selected.width||1)}) }} />
              <input type="number" value={Math.round(selected.getScaledHeight())} onChange={e => { const h=Number(e.target.value); updateSelected({scaleY:h/(selected.height||1)}) }} />
            </div>
          </div>
          <div className="svg-studio__field">
            <label>Rotate</label>
            <input type="range" min="0" max="360" value={Math.round(selected.angle||0)} onChange={e => updateSelected({angle:Number(e.target.value)})} />
            <span style={{width:32,fontSize:12,color:"#9d9da2"}}>{Math.round(selected.angle||0)}°</span>
          </div>
          <div className="svg-studio__field">
            <label>Opacity</label>
            <input type="range" min="0" max="1" step="0.01" value={selected.opacity??1} onChange={e => updateSelected({opacity:Number(e.target.value)})} />
          </div>
          {"fill" in selected && (
            <div className="svg-studio__field">
              <label>Fill</label>
              <input type="color" value={typeof selected.fill==="string"?selected.fill:"#000000"} onChange={e => updateSelected({fill:e.target.value})} />
              <input type="text"  value={typeof selected.fill==="string"?selected.fill:""} onChange={e => updateSelected({fill:e.target.value})} />
            </div>
          )}
          <div className="svg-studio__field">
            <label>Stroke</label>
            <input type="color" value={selected.stroke||"#000000"} onChange={e => updateSelected({stroke:e.target.value})} />
            <input type="number" min="0" max="60" value={selected.strokeWidth||0} onChange={e => updateSelected({strokeWidth:Number(e.target.value)})} />
          </div>
          {selected.type==="i-text" && (
            <div className="svg-studio__field">
              <label>Font</label>
              <input type="number" value={selected.fontSize||28} onChange={e => updateSelected({fontSize:Number(e.target.value)})} />
            </div>
          )}

          <div className="svg-studio__divider" />
          <div className="svg-studio__panel-title">Arrange</div>
          <div className="svg-studio__align">
            <button onClick={() => align("left")}>Left</button>
            <button onClick={() => align("centerH")}>Center H</button>
            <button onClick={() => align("right")}>Right</button>
            <button onClick={() => align("top")}>Top</button>
            <button onClick={() => align("centerV")}>Center V</button>
            <button onClick={() => align("bottom")}>Bottom</button>
          </div>
          <div className="svg-studio__divider" />
          <div className="svg-studio__align">
            <button onClick={bringToFront}>To front</button>
            <button onClick={bringForward}>Forward</button>
            <button onClick={sendBackward}>Backward</button>
            <button onClick={sendToBack}>To back</button>
          </div>
          {selected.type === "activeSelection" && (<>
            <div className="svg-studio__divider" />
            <button className="svg-studio__btn" style={{width:"100%"}} onClick={groupSelected}>Attach into one object</button>
          </>)}
          {selected.type === "group" && (<>
            <div className="svg-studio__divider" />
            <button className="svg-studio__btn" style={{width:"100%"}} onClick={ungroupSelected}>Detach group</button>
          </>)}
        </>)}

        <div className="svg-studio__divider" />
        <div className="svg-studio__panel-title">Layers</div>
        <div className="svg-studio__layers">
          {layers.length===0 && <p className="svg-studio__panel-empty">No objects yet — pick a tool and draw.</p>}
          {layers.map(l => (
            <div key={l.id} className={`svg-studio__layer${selected?.__id===l.id?" svg-studio__layer--selected":""}`} onClick={() => selectLayer(l.id)}>
              <span className="svg-studio__layer-icon">{l.visible?"●":"○"}</span>
              <span className="svg-studio__layer-name">{l.name}</span>
              <button onClick={e => toggleVisible(l.id,e)}>{l.visible?"Hide":"Show"}</button>
              <button onClick={e => removeLayer(l.id,e)}>✕</button>
            </div>
          ))}
        </div>
        <div className="svg-studio__hint">
          Del removes · ⌘D duplicates · ⌘Z undo · ⌘⇧Z redo · ⌘A select all<br/>
          ⌘G group · ⌘⇧G ungroup · Corner handles to scale · top handle to rotate
        </div>
      </div>
    </div>
  )
}
