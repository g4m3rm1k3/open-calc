import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Line } from 'react-konva'
import { X, Trash2, Undo2, Pencil, Eraser, Sun, Moon, Minus, Plus } from 'lucide-react'

const PALETTE = [
  '#ef4444', '#f97316', '#facc15', '#22c55e',
  '#06b6d4', '#6366f1', '#a855f7', '#ec4899',
  '#ffffff', '#94a3b8', '#1e293b',
]

const STORAGE_KEY  = 'oc-scratchpad-lines'
const SIZE_KEY     = 'oc-scratchpad-size'

const MIN_W = 320
const MIN_H = 240
const DEFAULT_W = 640
const DEFAULT_H = 480

function loadLines() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') ?? [] } catch { return [] }
}
function saveLines(lines) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)) } catch {}
}
function loadSize() {
  try { return JSON.parse(localStorage.getItem(SIZE_KEY) ?? 'null') ?? null } catch { return null }
}
function saveSize(w, h) {
  try { localStorage.setItem(SIZE_KEY, JSON.stringify({ w, h })) } catch {}
}

// ---------------------------------------------------------------------------
// Resize handle — thin strip along an edge or corner
// ---------------------------------------------------------------------------
function ResizeHandle({ direction, onResize, darkCanvas }) {
  const dragging = useRef(false)
  const start    = useRef({})

  const base = {
    position: 'absolute',
    zIndex: 10,
    background: 'transparent',
  }

  const styles = {
    top:        { ...base, top: 0, left: 8, right: 8, height: 6, cursor: 'ns-resize' },
    left:       { ...base, left: 0, top: 8, bottom: 8, width: 6, cursor: 'ew-resize' },
    topleft:    { ...base, top: 0, left: 0, width: 14, height: 14, cursor: 'nwse-resize', borderRadius: '50%' },
  }

  const onPointerDown = (e) => {
    e.stopPropagation()
    e.preventDefault()
    dragging.current = true
    start.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!dragging.current) return
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y
    start.current = { x: e.clientX, y: e.clientY }
    onResize(direction, dx, dy)
  }
  const onPointerUp = () => { dragging.current = false }

  return (
    <div
      style={styles[direction]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* visual accent on the top handle */}
      {direction === 'top' && (
        <div style={{
          position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)',
          width: 36, height: 3, borderRadius: 2,
          background: darkCanvas ? '#475569' : '#cbd5e1',
        }} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
export default function ScratchPad({ isOpen, onClose }) {
  const [lines, setLines]           = useState(loadLines)
  const [tool, setTool]             = useState('brush')
  const [color, setColor]           = useState('#6366f1')
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [darkCanvas, setDarkCanvas] = useState(() => document.documentElement.classList.contains('dark'))

  // Panel size — persisted
  const savedSize = loadSize()
  const [panelW, setPanelW] = useState(savedSize?.w ?? DEFAULT_W)
  const [panelH, setPanelH] = useState(savedSize?.h ?? DEFAULT_H)

  const isDrawing    = useRef(false)
  const stageRef     = useRef(null)
  const containerRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })

  // Detect mobile (< 640px) — re-check on resize
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Clamp panel size to viewport whenever viewport changes
  useEffect(() => {
    if (isMobile) return
    const clampW = Math.min(panelW, window.innerWidth  - 32)
    const clampH = Math.min(panelH, window.innerHeight - 100)
    if (clampW !== panelW || clampH !== panelH) {
      setPanelW(clampW)
      setPanelH(clampH)
    }
  }, [isMobile]) // eslint-disable-line

  // Measure canvas area with ResizeObserver
  useEffect(() => {
    if (!isOpen) return
    const measure = () => {
      if (containerRef.current) {
        setCanvasSize({
          w: containerRef.current.offsetWidth,
          h: containerRef.current.offsetHeight,
        })
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [isOpen, panelW, panelH, isMobile])

  // Persist lines
  useEffect(() => { saveLines(lines) }, [lines])

  // Persist size
  useEffect(() => {
    if (!isMobile) saveSize(panelW, panelH)
  }, [panelW, panelH, isMobile])

  // Resize handler — panel is anchored bottom-right so top/left drags grow upward/leftward
  const handleResize = useCallback((direction, dx, dy) => {
    if (direction === 'top' || direction === 'topleft') {
      setPanelH(h => Math.max(MIN_H, Math.min(h - dy, window.innerHeight - 100)))
    }
    if (direction === 'left' || direction === 'topleft') {
      setPanelW(w => Math.max(MIN_W, Math.min(w - dx, window.innerWidth - 32)))
    }
  }, [])

  // Drawing
  const getPos = (e) => e.target.getStage().getPointerPosition()

  const handleDown = useCallback((e) => {
    isDrawing.current = true
    const pos = getPos(e)
    setLines(prev => [...prev, { tool, color: tool === 'eraser' ? null : color, strokeWidth, points: [pos.x, pos.y] }])
  }, [tool, color, strokeWidth])

  const handleMove = useCallback((e) => {
    if (!isDrawing.current) return
    e.evt.preventDefault()
    const pos = getPos(e)
    setLines(prev => {
      const updated = [...prev]
      const last = { ...updated[updated.length - 1] }
      last.points = [...last.points, pos.x, pos.y]
      updated[updated.length - 1] = last
      return updated
    })
  }, [])

  const handleUp = useCallback(() => { isDrawing.current = false }, [])

  const undo  = () => setLines(prev => prev.slice(0, -1))
  const clear = () => setLines([])

  const bgColor = darkCanvas ? '#0f172a' : '#f8fafc'

  if (!isOpen) return null

  // --- Mobile: full-width bottom sheet ---
  const mobileStyle = {
    position: 'fixed',
    bottom: 0, left: 0, right: 0,
    height: Math.max(MIN_H, Math.min(panelH, window.innerHeight - 60)),
    zIndex: 120,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px 16px 0 0',
    overflow: 'hidden',
    boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
    borderTop: `1px solid ${darkCanvas ? '#334155' : '#e2e8f0'}`,
    background: darkCanvas ? '#1e293b' : '#ffffff',
  }

  // --- Desktop: floating resizable panel ---
  const desktopStyle = {
    position: 'fixed',
    bottom: '1rem',
    right: '1rem',
    width: panelW,
    height: panelH,
    zIndex: 120,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
    border: `1px solid ${darkCanvas ? '#334155' : '#e2e8f0'}`,
    background: darkCanvas ? '#1e293b' : '#ffffff',
  }

  const toolbarBg    = darkCanvas ? '#1e293b' : '#f1f5f9'
  const dividerColor = darkCanvas ? '#334155' : '#e2e8f0'
  const iconColor    = darkCanvas ? '#94a3b8' : '#64748b'

  return (
    <div style={isMobile ? mobileStyle : desktopStyle}>

      {/* Resize handles (desktop only) */}
      {!isMobile && (
        <>
          <ResizeHandle direction="top"     onResize={handleResize} darkCanvas={darkCanvas} />
          <ResizeHandle direction="left"    onResize={handleResize} darkCanvas={darkCanvas} />
          <ResizeHandle direction="topleft" onResize={handleResize} darkCanvas={darkCanvas} />
        </>
      )}

      {/* Mobile resize — drag the grabber strip to resize height */}
      {isMobile && (
        <ResizeHandle direction="top" onResize={handleResize} darkCanvas={darkCanvas} />
      )}

      {/* ---- Toolbar ---- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          paddingTop: isMobile ? 14 : 8, // extra space for grabber
          borderBottom: `1px solid ${dividerColor}`,
          background: toolbarBg,
          flexShrink: 0,
          flexWrap: 'nowrap',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          userSelect: 'none',
        }}
      >
        {/* Title */}
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: iconColor, marginRight: 2, flexShrink: 0 }}>
          Scratch
        </span>

        <Divider color={dividerColor} />

        {/* Brush / Eraser */}
        <ToolBtn active={tool === 'brush'} onClick={() => setTool('brush')} title="Brush" darkCanvas={darkCanvas}>
          <Pencil size={15} />
        </ToolBtn>
        <ToolBtn active={tool === 'eraser'} onClick={() => setTool('eraser')} title="Eraser" darkCanvas={darkCanvas}>
          <Eraser size={15} />
        </ToolBtn>

        <Divider color={dividerColor} />

        {/* Stroke width */}
        <IconBtn onClick={() => setStrokeWidth(w => Math.max(1, w - 2))} color={iconColor} title="Thinner"><Minus size={12} /></IconBtn>
        <div style={{
          width: Math.max(6, strokeWidth) + 6, height: Math.max(6, strokeWidth) + 6,
          borderRadius: '50%', flexShrink: 0,
          background: tool === 'eraser' ? (darkCanvas ? '#475569' : '#cbd5e1') : color,
          border: `1.5px solid ${darkCanvas ? '#475569' : '#cbd5e1'}`,
        }} />
        <IconBtn onClick={() => setStrokeWidth(w => Math.min(32, w + 2))} color={iconColor} title="Thicker"><Plus size={12} /></IconBtn>

        <Divider color={dividerColor} />

        {/* Color palette */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {PALETTE.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool('brush') }}
              title={c}
              style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                background: c,
                border: color === c && tool === 'brush' ? '2px solid #6366f1' : '1.5px solid rgba(0,0,0,0.2)',
                outline: color === c && tool === 'brush' ? '2px solid #818cf8' : 'none',
                outlineOffset: 1,
                cursor: 'pointer',
                transition: 'transform 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            />
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 8 }} />

        {/* Canvas theme */}
        <IconBtn onClick={() => setDarkCanvas(d => !d)} color={iconColor} title="Toggle canvas theme">
          {darkCanvas ? <Sun size={15} /> : <Moon size={15} />}
        </IconBtn>

        <Divider color={dividerColor} />

        {/* Undo */}
        <IconBtn onClick={undo} color={iconColor} title="Undo" disabled={lines.length === 0}><Undo2 size={15} /></IconBtn>

        {/* Clear */}
        <IconBtn onClick={clear} color="#ef4444" title="Clear all" disabled={lines.length === 0}><Trash2 size={15} /></IconBtn>

        <Divider color={dividerColor} />

        {/* Close */}
        <IconBtn onClick={onClose} color={iconColor} title="Close"><X size={15} /></IconBtn>
      </div>

      {/* ---- Canvas ---- */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          background: bgColor,
          cursor: tool === 'eraser' ? 'cell' : 'crosshair',
          touchAction: 'none',
        }}
      >
        {canvasSize.w > 0 && (
          <Stage
            ref={stageRef}
            width={canvasSize.w}
            height={canvasSize.h}
            onMouseDown={handleDown}
            onMousemove={handleMove}
            onMouseup={handleUp}
            onTouchStart={handleDown}
            onTouchMove={handleMove}
            onTouchEnd={handleUp}
          >
            <Layer>
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.tool === 'eraser' ? bgColor : line.color}
                  strokeWidth={line.strokeWidth}
                  tension={0.4}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
                />
              ))}
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Small shared sub-components
// ---------------------------------------------------------------------------
function Divider({ color }) {
  return <div style={{ width: 1, height: 18, background: color, flexShrink: 0, margin: '0 2px' }} />
}

function ToolBtn({ children, active, onClick, title, darkCanvas }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: '5px 6px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
        background: active ? (darkCanvas ? '#3b4f6e' : '#dbeafe') : 'transparent',
        color: active ? '#6366f1' : (darkCanvas ? '#94a3b8' : '#64748b'),
        display: 'flex',
        alignItems: 'center',
        transition: 'background 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function IconBtn({ children, onClick, color, title, disabled }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        padding: '5px 5px',
        borderRadius: 8,
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        flexShrink: 0,
        background: 'transparent',
        color,
        opacity: disabled ? 0.3 : 1,
        display: 'flex',
        alignItems: 'center',
        transition: 'opacity 0.15s',
      }}
    >
      {children}
    </button>
  )
}
