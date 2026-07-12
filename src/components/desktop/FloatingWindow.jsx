import { useEffect, useRef, useState } from 'react'
import LabErrorBoundary from '../ui/LabErrorBoundary.jsx'

const PANEL_W = 960
const PANEL_H = 640

function MacDots({ onClose, onMinimize, onMaximize, isMaximized }) {
  return (
    <div className="flex items-center gap-[6px]">
      <button onClick={onClose} title="Close"
        className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-75 active:brightness-50 transition-all focus:outline-none" />
      <button
        onClick={isMaximized ? undefined : onMinimize}
        title={isMaximized ? undefined : 'Minimize'}
        className={`w-3 h-3 rounded-full bg-[#ffbd2e] transition-all focus:outline-none ${isMaximized ? 'opacity-30 cursor-default' : 'hover:brightness-75 active:brightness-50'}`}
      />
      <button onClick={onMaximize} title={isMaximized ? 'Restore' : 'Maximize'}
        className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-75 active:brightness-50 transition-all focus:outline-none" />
    </div>
  )
}

export default function FloatingWindow({ win, zIndex, onClose, onMinimize, onMaximize, onFocus }) {
  const offset = (win.offset ?? 0) * 24
  const [pos, setPos] = useState(() => ({
    x: Math.max(0, (window.innerWidth - PANEL_W) / 2 + offset),
    y: Math.max(44, 80 + offset),
  }))
  const dragging = useRef(false)
  const origin = useRef({ mx: 0, my: 0, wx: 0, wy: 0 })
  const isMax = win.state === 'maximized'
  const Component = win.Component

  function startDrag(e) {
    if (isMax || e.button !== 0) return
    e.preventDefault()
    dragging.current = true
    origin.current = { mx: e.clientX, my: e.clientY, wx: pos.x, wy: pos.y }
  }

  useEffect(() => {
    const move = (e) => {
      if (!dragging.current) return
      setPos({
        x: origin.current.wx + e.clientX - origin.current.mx,
        y: origin.current.wy + e.clientY - origin.current.my,
      })
    }
    const up = () => { dragging.current = false }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [])

  if (isMax) {
    return (
      <div
        className="fixed inset-0 flex flex-col"
        style={{ zIndex }}
        onMouseDown={onFocus}
      >
        {/* A real row (not absolute-over-content) — reserves actual height so
            every lab's own top-left UI (back buttons, headers, ...) gets
            pushed below the dots instead of colliding with them. Absolute
            positioning here used to overlap whatever a lab drew in that same
            corner, on every lab, every time — fixed once here rather than
            padding each lab individually. Solid background, not translucent —
            this bar sits at z-1800 above the app's own top bar (z-100), and a
            translucent fill let that page chrome show through underneath it. */}
        <div className="flex-shrink-0 h-7 flex items-center px-3 bg-[#e8e8e8] dark:bg-[#2c2c2e]">
          <MacDots onClose={onClose} onMinimize={undefined} onMaximize={onMaximize} isMaximized />
        </div>
        <div className="flex-1 overflow-hidden" style={{ transform: 'translate(0,0)' }}>
          <LabErrorBoundary label={win.label} backTo={win.backTo}>
            {/* Games/labs were written against two different close-prop conventions
                (onBack vs onClose) with no single source of truth — pass both so
                either works, instead of each one silently no-oping when wired the
                "wrong" way (this is how golf's close button and fullscreen-detection
                broke when opened through the window manager). */}
            <Component onBack={onClose} onClose={onClose} />
          </LabErrorBoundary>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed flex flex-col rounded-xl overflow-hidden shadow-2xl border border-black/15 dark:border-white/[0.08]"
      style={{ left: pos.x, top: pos.y, width: PANEL_W, height: PANEL_H, zIndex }}
      onMouseDown={onFocus}
    >
      <div
        className="flex-shrink-0 h-8 flex items-center gap-3 px-3 select-none cursor-grab active:cursor-grabbing bg-[#e8e8e8] dark:bg-[#2c2c2e] border-b border-black/10 dark:border-white/[0.08]"
        onMouseDown={startDrag}
      >
        <MacDots onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} isMaximized={false} />
        <span className="flex-1 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate pr-14">
          {win.emoji ? `${win.emoji} ` : ''}{win.label}
        </span>
      </div>
      {/* transform creates a containing block so fixed-position lab canvases clip to this window */}
      <div className="flex-1 overflow-hidden relative" style={{ transform: 'translate(0,0)' }}>
        <LabErrorBoundary label={win.label} backTo={win.backTo}>
          <Component onBack={onClose} onClose={onClose} />
        </LabErrorBoundary>
      </div>
    </div>
  )
}
