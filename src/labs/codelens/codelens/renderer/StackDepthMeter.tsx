/**
 * StackDepthMeter — thin sparkline strip showing call stack depth at every
 * execution step. Click or drag to seek. Current step = vertical cursor.
 * Color encodes depth: accent (shallow) → amber (mid) → red (deep).
 * Hover over any bar to see depth info and the currently running function.
 */
import { useMemo, useRef, useCallback, useState, type MouseEvent as ReactMouseEvent } from 'react'
import type { TraceEvent } from '../types'
import { useCodeLensTheme } from '../ThemeContext'
import type { CodeLensUiPalette } from '../theme'

function depthColor(depth: number, maxDepth: number, ui: CodeLensUiPalette): string {
  if (depth === 0 || maxDepth === 0) return ui.border
  const ratio = depth / maxDepth
  if (ratio < 0.35) return ui.accentSolid
  if (ratio < 0.70) return ui.amber
  return ui.redSolid
}

function tickColor(type: string, ui: CodeLensUiPalette): string | null {
  if (type === 'error_thrown') return ui.redSolid
  if (type === 'function_call') return ui.accent
  if (type === 'conditional_branch' || type === 'loop_iteration') return ui.amber
  if (type === 'variable_assign' || type === 'object_mutate') return ui.green
  return null
}

interface HoverState {
  index: number
  x: number
  y: number
}

interface StackDepthMeterProps {
  events: TraceEvent[]
  step: number
  onSeek: (step: number) => void
}

export default function StackDepthMeter({ events, step, onSeek }: StackDepthMeterProps) {
  const { theme: { ui } } = useCodeLensTheme()
  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<HoverState | null>(null)

  const depths = useMemo(() => {
    if (!events?.length) return []
    return events.map(e => (e.stackSnapshot?.length ?? 0))
  }, [events])

  const maxDepth = useMemo(() => Math.max(0, ...depths), [depths])
  const total    = depths.length

  const currentDepth = depths[step] ?? 0

  // ── Seek on click/drag ─────────────────────────────────────────────────────────

  const seekFromEvent = useCallback((e: { clientX: number }) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect || total === 0) return
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    onSeek(Math.round(ratio * (total - 1)))
  }, [total, onSeek])

  const onMouseDown = useCallback((e: ReactMouseEvent) => {
    e.preventDefault()
    seekFromEvent(e)
    const onMove = (ev: globalThis.MouseEvent) => seekFromEvent(ev)
    const onUp   = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [seekFromEvent])

  const onMouseMove = useCallback((e: ReactMouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const idx = Math.round(ratio * (total - 1))
    setHover({ index: idx, x: e.clientX, y: e.clientY })
  }, [total])

  if (!events?.length || maxDepth === 0) return null

  // SVG viewBox units: 1 unit per step horizontally, 28 units tall
  const VH = 28

  // Build tooltip data
  const hoverData = hover !== null && depths[hover.index] > 0 ? (() => {
    const d = depths[hover.index]
    const evt = events[hover.index]
    const topFrame = evt?.stackSnapshot?.[evt.stackSnapshot.length - 1]
    return { d, fnName: topFrame?.name ?? null, color: depthColor(d, maxDepth, ui) }
  })() : null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '0 12px 4px 12px', background: ui.bg, flexShrink: 0,
    }}>

      {/* Label */}
      <span style={{
        fontSize: 8, color: ui.borderStrong, fontFamily: 'JetBrains Mono, monospace',
        whiteSpace: 'nowrap', userSelect: 'none',
      }}>
        stack
      </span>

      {/* Sparkline SVG — stretches to fill available width */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${total} ${VH}`}
        preserveAspectRatio="none"
        width="100%"
        height={VH}
        style={{ flex: 1, cursor: 'col-resize', display: 'block' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* Baseline */}
        <rect x={0} y={VH - 2} width={total} height={2} fill={ui.panelBg} />

        {/* Depth bars */}
        {depths.map((d, i) => {
          if (d === 0) return null
          const barH = Math.max(2, Math.round((d / maxDepth) * (VH - 4)))
          return (
            <rect
              key={i}
              x={i} y={VH - 2 - barH}
              width={1} height={barH}
              fill={depthColor(d, maxDepth, ui)}
              opacity={i === step ? 1 : 0.55}
            />
          )
        })}

        {/* Semantic Ticks */}
        {events.map((e, i) => {
          const tc = tickColor(e.type, ui)
          if (!tc) return null
          return (
            <rect
              key={`tick-${i}`}
              x={i} y={VH - 2} width={1} height={2}
              fill={tc}
              opacity={i === step ? 1 : 0.8}
            />
          )
        })}

        {/* Current-step cursor */}
        <line
          x1={step + 0.5} y1={0}
          x2={step + 0.5} y2={VH}
          stroke="white" strokeWidth={0.8} opacity={0.5}
        />
      </svg>

      {/* Depth readout */}
      <span style={{
        fontSize: 9, whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace',
        color: depthColor(currentDepth, maxDepth, ui),
        minWidth: 36, textAlign: 'right',
      }}>
        {currentDepth}/{maxDepth}
      </span>

      {/* Color scale legend */}
      <div style={{ display: 'flex', gap: 0, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
        {[ui.accentSolid, ui.amber, ui.redSolid].map((c, i) => (
          <div key={i} style={{ width: 6, height: 10, background: c }} />
        ))}
      </div>

      {/* Hover tooltip — fixed position so it escapes any overflow:hidden parents */}
      {hoverData && hover && (
        <div style={{
          position: 'fixed',
          left: hover.x + 14,
          top: hover.y - 62,
          zIndex: 9999,
          pointerEvents: 'none',
          background: ui.panelBg2,
          border: `1px solid ${hoverData.color}55`,
          borderRadius: 8,
          padding: '7px 11px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
          minWidth: 180,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: hoverData.color,
            fontFamily: 'JetBrains Mono, monospace', marginBottom: 2,
          }}>
            Depth {hoverData.d}/{maxDepth} — {hoverData.d === 1 ? '1 function deep' : `${hoverData.d} functions deep`}
          </div>
          {hoverData.fnName && (
            <div style={{
              fontSize: 10, color: ui.cyan,
              fontFamily: 'JetBrains Mono, monospace', marginBottom: 3,
            }}>
              `{hoverData.fnName}` is running
            </div>
          )}
          <div style={{ fontSize: 9, color: ui.textFaint, fontFamily: 'JetBrains Mono, monospace' }}>
            Click to jump to step {(hover.index ?? 0) + 1}
          </div>
        </div>
      )}
    </div>
  )
}
