import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Line } from 'react-konva'
import { X, Trash2, Undo2, Pencil, Eraser, Sun, Moon, Minus, Plus } from 'lucide-react'

const PALETTE = [
  '#ef4444', // red
  '#f97316', // orange
  '#facc15', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#6366f1', // indigo
  '#a855f7', // purple
  '#ec4899', // pink
  '#ffffff', // white
  '#94a3b8', // slate
  '#1e293b', // dark
]

const STORAGE_KEY = 'oc-scratchpad-lines'

function loadLines() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLines(lines) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  } catch {
    // storage full — silently ignore
  }
}

export default function ScratchPad({ isOpen, onClose }) {
  const [lines, setLines] = useState(loadLines)
  const [tool, setTool] = useState('brush')
  const [color, setColor] = useState('#6366f1')
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [darkCanvas, setDarkCanvas] = useState(() => document.documentElement.classList.contains('dark'))
  const isDrawing = useRef(false)
  const stageRef = useRef(null)
  const containerRef = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  // Measure container whenever open
  useEffect(() => {
    if (!isOpen) return
    const measure = () => {
      if (containerRef.current) {
        setSize({
          w: containerRef.current.offsetWidth,
          h: containerRef.current.offsetHeight,
        })
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [isOpen])

  // Persist lines to localStorage whenever they change
  useEffect(() => {
    saveLines(lines)
  }, [lines])

  const getPos = (e) => {
    const stage = e.target.getStage()
    return stage.getPointerPosition()
  }

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

  const handleUp = useCallback(() => {
    isDrawing.current = false
  }, [])

  const undo = () => setLines(prev => prev.slice(0, -1))
  const clear = () => setLines([])

  const bgColor = darkCanvas ? '#0f172a' : '#f8fafc'
  const eraserColor = bgColor

  if (!isOpen) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-[120] flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
      style={{
        width: 'min(680px, calc(100vw - 2rem))',
        height: 'min(520px, calc(100vh - 120px))',
        borderColor: darkCanvas ? '#334155' : '#e2e8f0',
        background: darkCanvas ? '#1e293b' : '#ffffff',
      }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0"
        style={{
          borderColor: darkCanvas ? '#334155' : '#e2e8f0',
          background: darkCanvas ? '#1e293b' : '#f1f5f9',
        }}
      >
        {/* Title */}
        <span className="text-xs font-bold tracking-widest uppercase mr-1" style={{ color: darkCanvas ? '#94a3b8' : '#64748b' }}>
          Scratch
        </span>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Tool: brush / eraser */}
        <button
          onClick={() => setTool('brush')}
          title="Brush (B)"
          className="p-1.5 rounded-lg transition-colors"
          style={{
            background: tool === 'brush' ? (darkCanvas ? '#3b4f6e' : '#dbeafe') : 'transparent',
            color: tool === 'brush' ? '#6366f1' : (darkCanvas ? '#94a3b8' : '#64748b'),
          }}
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('eraser')}
          title="Eraser (E)"
          className="p-1.5 rounded-lg transition-colors"
          style={{
            background: tool === 'eraser' ? (darkCanvas ? '#3b4f6e' : '#dbeafe') : 'transparent',
            color: tool === 'eraser' ? '#6366f1' : (darkCanvas ? '#94a3b8' : '#64748b'),
          }}
        >
          <Eraser className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Stroke size */}
        <button
          onClick={() => setStrokeWidth(w => Math.max(1, w - 2))}
          className="p-1 rounded"
          title="Thinner"
          style={{ color: darkCanvas ? '#94a3b8' : '#64748b' }}
        >
          <Minus className="w-3 h-3" />
        </button>
        <div
          className="rounded-full border-2 flex-shrink-0"
          style={{
            width: Math.max(6, strokeWidth) + 8,
            height: Math.max(6, strokeWidth) + 8,
            background: tool === 'eraser' ? (darkCanvas ? '#475569' : '#cbd5e1') : color,
            borderColor: darkCanvas ? '#475569' : '#cbd5e1',
          }}
        />
        <button
          onClick={() => setStrokeWidth(w => Math.min(32, w + 2))}
          className="p-1 rounded"
          title="Thicker"
          style={{ color: darkCanvas ? '#94a3b8' : '#64748b' }}
        >
          <Plus className="w-3 h-3" />
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Color palette */}
        <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
          {PALETTE.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool('brush') }}
              title={c}
              className="rounded-full flex-shrink-0 transition-transform hover:scale-110"
              style={{
                width: 16,
                height: 16,
                background: c,
                border: color === c && tool === 'brush' ? '2px solid #6366f1' : '1.5px solid rgba(0,0,0,0.2)',
                outline: color === c && tool === 'brush' ? '2px solid #818cf8' : 'none',
                outlineOffset: 1,
              }}
            />
          ))}
        </div>

        <div className="flex-1" />

        {/* Canvas theme toggle */}
        <button
          onClick={() => setDarkCanvas(d => !d)}
          title="Toggle canvas theme"
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: darkCanvas ? '#94a3b8' : '#64748b' }}
        >
          {darkCanvas ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        {/* Undo */}
        <button
          onClick={undo}
          title="Undo (Ctrl+Z)"
          disabled={lines.length === 0}
          className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
          style={{ color: darkCanvas ? '#94a3b8' : '#64748b' }}
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* Clear */}
        <button
          onClick={clear}
          title="Clear all"
          disabled={lines.length === 0}
          className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
          style={{ color: '#ef4444' }}
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        {/* Close */}
        <button
          onClick={onClose}
          title="Close scratchpad"
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: darkCanvas ? '#94a3b8' : '#64748b' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        style={{
          background: bgColor,
          cursor: tool === 'eraser' ? 'cell' : 'crosshair',
        }}
      >
        {size.w > 0 && (
          <Stage
            ref={stageRef}
            width={size.w}
            height={size.h}
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
                  stroke={line.tool === 'eraser' ? eraserColor : line.color}
                  strokeWidth={line.strokeWidth}
                  tension={0.4}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    line.tool === 'eraser' ? 'destination-out' : 'source-over'
                  }
                />
              ))}
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  )
}
