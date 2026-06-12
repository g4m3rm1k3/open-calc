/**
 * StackDepthMeter — thin sparkline strip showing call stack depth at every
 * execution step. Click or drag to seek. Current step = vertical cursor.
 * Color encodes depth: indigo (shallow) → amber (mid) → red (deep).
 */
import { useMemo, useRef, useCallback } from 'react'

function depthColor(depth, maxDepth) {
  if (depth === 0 || maxDepth === 0) return '#1e293b'
  const ratio = depth / maxDepth
  if (ratio < 0.35) return '#6366f1'
  if (ratio < 0.70) return '#f59e0b'
  return '#ef4444'
}

export default function StackDepthMeter({ events, step, onSeek }) {
  const svgRef = useRef(null)

  const depths = useMemo(() => {
    if (!events?.length) return []
    return events.map(e => (e.stackSnapshot?.length ?? 0))
  }, [events])

  const maxDepth = useMemo(() => Math.max(0, ...depths), [depths])
  const total    = depths.length

  const currentDepth = depths[step] ?? 0

  // ── Seek on click/drag ─────────────────────────────────────────────────────

  const seekFromEvent = useCallback((e) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect || total === 0) return
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    onSeek(Math.round(ratio * (total - 1)))
  }, [total, onSeek])

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    seekFromEvent(e)
    const onMove = (ev) => seekFromEvent(ev)
    const onUp   = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [seekFromEvent])

  if (!events?.length || maxDepth === 0) return null

  // SVG viewBox units: 1 unit per step horizontally, 28 units tall
  const VH = 28

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '0 12px 4px 12px', background: '#080c14', flexShrink: 0,
    }}>

      {/* Label */}
      <span style={{
        fontSize: 8, color: '#334155', fontFamily: 'JetBrains Mono, monospace',
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
      >
        {/* Baseline */}
        <rect x={0} y={VH - 2} width={total} height={2} fill="#0f172a" />

        {/* Depth bars */}
        {depths.map((d, i) => {
          if (d === 0) return null
          const barH = Math.max(2, Math.round((d / maxDepth) * (VH - 4)))
          return (
            <rect
              key={i}
              x={i} y={VH - 2 - barH}
              width={1} height={barH}
              fill={depthColor(d, maxDepth)}
              opacity={i === step ? 1 : 0.55}
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
        color: depthColor(currentDepth, maxDepth),
        minWidth: 36, textAlign: 'right',
      }}>
        {currentDepth}/{maxDepth}
      </span>

      {/* Color scale legend */}
      <div style={{ display: 'flex', gap: 0, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
        {['#6366f1', '#f59e0b', '#ef4444'].map((c, i) => (
          <div key={i} style={{ width: 6, height: 10, background: c }} />
        ))}
      </div>
    </div>
  )
}
