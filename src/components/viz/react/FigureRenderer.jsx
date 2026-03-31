// FigureRenderer.jsx
// Reads a JSON figure description from the Python opencalc library
// and renders it on a canvas using the same patterns as the hand-built vizzes.
// This is NOT a viz itself — it is a rendering engine used by PythonNotebook.

import { useEffect, useRef } from 'react'

// ── Color token mapping ───────────────────────────────────────────────────────
// Maps Python color names to actual CSS colors.
// The 'C' object comes from the notebook's useColors() hook.
function resolveColor(name, C) {
  const map = {
    blue: C.blue, amber: C.amber, green: C.green, red: C.red,
    purple: C.purple, teal: C.teal, gray: C.hint, muted: C.muted,
    text: C.text, border: C.border, hint: C.hint,
    white: '#ffffff', black: '#000000',
  }
  // If it's a known token name, return the theme color.
  // Otherwise treat it as a raw CSS color string.
  return map[name] || name
}

// ── FigureRenderer ────────────────────────────────────────────────────────────
export default function FigureRenderer({ figureJson, C }) {
  const canvasRef = useRef(null)
  const roRef = useRef(null)

  useEffect(() => {
    // Parse figure data
    let fig
    try {
      fig = typeof figureJson === 'string' ? JSON.parse(figureJson) : figureJson
    } catch (e) {
      return
    }
    if (!fig || fig.type !== 'opencalc_figure') return

    const draw = () => {
      const cv = canvasRef.current; if (!cv) return

      // Canvas sizing
      const canvasW = cv.offsetWidth || 600
      const canvasH = fig.square
        ? canvasW
        : (fig.height || Math.min(canvasW * 0.65, 400))
      cv.width = canvasW
      cv.height = canvasH

      const ctx = cv.getContext('2d')
      ctx.clearRect(0, 0, canvasW, canvasH)

      // Background
      ctx.fillStyle = C.surface
      ctx.fillRect(0, 0, canvasW, canvasH)

      // Layout padding
      const titleH = fig.title ? 28 : 0
      const pl = 52, pr = 16, pt = 16 + titleH, pb = 36
      const iw = canvasW - pl - pr
      const ih = canvasH - pt - pb

      // Data range
      const { xmin, xmax, ymin, ymax } = fig

      // Coordinate transform functions
      const toX = dx => pl + ((dx - xmin) / (xmax - xmin)) * iw
      const toY = dy => pt + ih - ((dy - ymin) / (ymax - ymin)) * ih
      const scaleX = dx => (dx / (xmax - xmin)) * iw
      const scaleY = dy => (dy / (ymax - ymin)) * ih

      // Title
      if (fig.title) {
        ctx.fillStyle = C.text
        ctx.font = '500 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(fig.title, canvasW / 2, 20)
      }

      // ── Draw clip region so elements don't overflow ──────────────────────
      ctx.save()
      ctx.beginPath()
      ctx.rect(pl - 2, pt - 2, iw + 4, ih + 4)
      ctx.clip()

      // ── Render each element ──────────────────────────────────────────────
      for (const el of fig.elements) {
        ctx.save()
        ctx.globalAlpha = el.alpha ?? 1.0

        switch (el.type) {

          case 'grid': {
            const step = el.step || 1
            ctx.strokeStyle = resolveColor(el.color || 'border', C)
            ctx.lineWidth = 1
            // vertical lines
            for (let x = Math.ceil(xmin / step) * step; x <= xmax; x += step) {
              ctx.beginPath(); ctx.moveTo(toX(x), pt); ctx.lineTo(toX(x), pt + ih); ctx.stroke()
            }
            // horizontal lines
            for (let y = Math.ceil(ymin / step) * step; y <= ymax; y += step) {
              ctx.beginPath(); ctx.moveTo(pl, toY(y)); ctx.lineTo(pl + iw, toY(y)); ctx.stroke()
            }
            break
          }

          case 'axes': {
            ctx.strokeStyle = C.hint; ctx.lineWidth = 1.5
            // x-axis
            ctx.beginPath(); ctx.moveTo(pl, toY(0)); ctx.lineTo(pl + iw, toY(0)); ctx.stroke()
            // y-axis
            ctx.beginPath(); ctx.moveTo(toX(0), pt); ctx.lineTo(toX(0), pt + ih); ctx.stroke()
            if (el.ticks !== false) {
              ctx.fillStyle = C.hint; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
              for (let x = Math.ceil(xmin); x <= Math.floor(xmax); x++) {
                if (x === 0) continue
                ctx.fillText(x, toX(x), toY(0) + 14)
              }
              ctx.textAlign = 'right'
              for (let y = Math.ceil(ymin); y <= Math.floor(ymax); y++) {
                if (y === 0) continue
                ctx.fillText(y, toX(0) - 4, toY(y) + 4)
              }
            }
            break
          }

          case 'arrow': {
            const sx = toX(el.start[0]), sy = toY(el.start[1])
            const ex = toX(el.end[0]),   ey = toY(el.end[1])
            const color = resolveColor(el.color || 'blue', C)
            const angle = Math.atan2(ey - sy, ex - sx)
            const hl = 10

            if (el.dashed) ctx.setLineDash([5, 4])
            ctx.strokeStyle = color; ctx.lineWidth = el.width || 2.5
            ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke()
            ctx.setLineDash([])

            ctx.fillStyle = color; ctx.beginPath()
            ctx.moveTo(ex, ey)
            ctx.lineTo(ex - hl * Math.cos(angle - 0.4), ey - hl * Math.sin(angle - 0.4))
            ctx.lineTo(ex - hl * Math.cos(angle + 0.4), ey - hl * Math.sin(angle + 0.4))
            ctx.fill()

            if (el.label) {
              ctx.fillStyle = color; ctx.font = '500 12px sans-serif'; ctx.textAlign = 'center'
              ctx.fillText(el.label,
                ex + 16 * Math.cos(angle + Math.PI / 4),
                ey + 16 * Math.sin(angle + Math.PI / 4))
            }
            break
          }

          case 'line': {
            const color = resolveColor(el.color || 'muted', C)
            if (el.dashed) ctx.setLineDash([5, 4])
            ctx.strokeStyle = color; ctx.lineWidth = el.width || 1.5
            ctx.beginPath()
            ctx.moveTo(toX(el.start[0]), toY(el.start[1]))
            ctx.lineTo(toX(el.end[0]),   toY(el.end[1]))
            ctx.stroke()
            ctx.setLineDash([])
            break
          }

          case 'point': {
            const px = toX(el.pos[0]), py = toY(el.pos[1])
            const color = resolveColor(el.color || 'amber', C)
            ctx.fillStyle = color
            ctx.beginPath(); ctx.arc(px, py, el.radius || 6, 0, Math.PI * 2); ctx.fill()
            if (el.label) {
              ctx.fillStyle = color; ctx.font = '500 12px sans-serif'; ctx.textAlign = 'center'
              ctx.fillText(el.label, px, py - 10)
            }
            break
          }

          case 'curve': {
            const color = resolveColor(el.color || 'blue', C)
            const xs = el.xs, ys = el.ys
            // Filled region first (under the curve)
            if (el.fill) {
              ctx.beginPath()
              let started = false
              const fillAlpha = el.fill_alpha || 0.15
              for (let i = 0; i < xs.length; i++) {
                if (ys[i] == null || !isFinite(ys[i])) { started = false; continue }
                const px = toX(xs[i]), py = toY(ys[i])
                if (!started) { ctx.moveTo(px, toY(0)); ctx.lineTo(px, py); started = true }
                else ctx.lineTo(px, py)
              }
              ctx.lineTo(toX(xs[xs.length - 1]), toY(0))
              ctx.closePath()
              ctx.fillStyle = color; ctx.globalAlpha = fillAlpha; ctx.fill()
              ctx.globalAlpha = el.alpha ?? 1.0
            }
            // Curve line
            ctx.strokeStyle = color; ctx.lineWidth = el.width || 2.5
            ctx.beginPath()
            let started = false
            for (let i = 0; i < xs.length; i++) {
              if (ys[i] == null || !isFinite(ys[i])) { started = false; continue }
              const px = toX(xs[i]), py = toY(ys[i])
              if (py < pt - 10 || py > pt + ih + 10) { started = false; continue }
              started ? ctx.lineTo(px, py) : ctx.moveTo(px, py)
              started = true
            }
            ctx.stroke()
            // Label at midpoint
            if (el.label) {
              const mid = Math.floor(xs.length / 2)
              if (ys[mid] != null && isFinite(ys[mid])) {
                ctx.fillStyle = color; ctx.font = '500 12px sans-serif'; ctx.textAlign = 'left'
                ctx.fillText(el.label, toX(xs[mid]) + 6, toY(ys[mid]) - 6)
              }
            }
            break
          }

          case 'scatter': {
            const color = resolveColor(el.color || 'blue', C)
            ctx.fillStyle = color
            for (let i = 0; i < el.xs.length; i++) {
              const px = toX(el.xs[i]), py = toY(el.ys[i])
              ctx.beginPath(); ctx.arc(px, py, el.radius || 4, 0, Math.PI * 2); ctx.fill()
              if (el.labels && el.labels[i]) {
                ctx.fillStyle = color; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
                ctx.fillText(el.labels[i], px, py - 8)
              }
            }
            break
          }

          case 'region': {
            const color = resolveColor(el.color || 'blue', C)
            ctx.beginPath()
            let started = false
            for (let i = 0; i < el.xs.length; i++) {
              if (el.tops[i] == null) { started = false; continue }
              const px = toX(el.xs[i]), py = toY(el.tops[i])
              started ? ctx.lineTo(px, py) : ctx.moveTo(px, py)
              started = true
            }
            for (let i = el.xs.length - 1; i >= 0; i--) {
              if (el.bottoms[i] == null) continue
              ctx.lineTo(toX(el.xs[i]), toY(el.bottoms[i]))
            }
            ctx.closePath()
            ctx.fillStyle = color; ctx.globalAlpha = el.alpha || 0.2; ctx.fill()
            break
          }

          case 'text': {
            const color = resolveColor(el.color || 'text', C)
            ctx.fillStyle = color
            ctx.font = `${el.bold ? '500 ' : ''}${el.size || 13}px sans-serif`
            ctx.textAlign = el.align || 'center'
            ctx.fillText(el.content, toX(el.pos[0]), toY(el.pos[1]))
            break
          }

          case 'polygon': {
            if (!el.points || el.points.length < 2) break
            const color = resolveColor(el.color || 'blue', C)
            ctx.beginPath()
            ctx.moveTo(toX(el.points[0][0]), toY(el.points[0][1]))
            for (let i = 1; i < el.points.length; i++)
              ctx.lineTo(toX(el.points[i][0]), toY(el.points[i][1]))
            ctx.closePath()
            if (el.fill) {
              ctx.fillStyle = color; ctx.globalAlpha = el.alpha || 0.2; ctx.fill()
              ctx.globalAlpha = 1
            }
            if (el.stroke !== false) {
              ctx.strokeStyle = color; ctx.lineWidth = el.stroke_width || 1.5; ctx.stroke()
            }
            break
          }

          case 'transformed_grid': {
            const { a, b, c, d, range: r = 5, color_h, color_v, alpha: ga = 0.7 } = el
            ctx.globalAlpha = ga
            const T = (x, y) => [toX(a * x + c * y), toY(b * x + d * y)]
            for (let i = -r; i <= r; i++) {
              // vertical lines of original grid
              const [x0,y0] = T(i, -r), [x1,y1] = T(i, r)
              ctx.strokeStyle = i === 0 ? resolveColor(color_v || 'green', C) : resolveColor(color_v || 'green', C) + '55'
              ctx.lineWidth = i === 0 ? 2 : 1
              ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke()
              // horizontal lines
              const [x2,y2] = T(-r, i), [x3,y3] = T(r, i)
              ctx.strokeStyle = i === 0 ? resolveColor(color_h || 'blue', C) : resolveColor(color_h || 'blue', C) + '55'
              ctx.lineWidth = i === 0 ? 2 : 1
              ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x3,y3); ctx.stroke()
            }
            ctx.globalAlpha = 1
            break
          }

          case 'tangent': {
            const color = resolveColor(el.color || 'amber', C)
            ctx.strokeStyle = color; ctx.lineWidth = el.width || 2
            ctx.beginPath()
            ctx.moveTo(toX(el.x1), toY(el.y0 + el.slope * (el.x1 - el.x0)))
            ctx.lineTo(toX(el.x2), toY(el.y0 + el.slope * (el.x2 - el.x0)))
            ctx.stroke()
            // dot at tangent point
            ctx.fillStyle = color
            ctx.beginPath(); ctx.arc(toX(el.x0), toY(el.y0), 5, 0, Math.PI * 2); ctx.fill()
            if (el.label) {
              ctx.fillStyle = color; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
              ctx.fillText(el.label, toX(el.x0) + 8, toY(el.y0) - 8)
            }
            break
          }

          case 'riemann': {
            const color = resolveColor(el.color || 'blue', C)
            ctx.fillStyle = color; ctx.globalAlpha = el.alpha || 0.3
            for (const rect of el.rects) {
              const rx = toX(rect.x)
              const rw = scaleX(rect.w)
              const ry = rect.h >= 0 ? toY(rect.h) : toY(0)
              const rh = Math.abs(scaleY(rect.h))
              ctx.fillRect(rx, ry, rw, rh)
            }
            ctx.globalAlpha = 1
            ctx.strokeStyle = color; ctx.lineWidth = 0.5
            for (const rect of el.rects) {
              ctx.strokeRect(toX(rect.x), toY(Math.max(0, rect.h)), scaleX(rect.w), Math.abs(scaleY(rect.h)))
            }
            break
          }

          case 'bars': {
            // Bar chart — overrides coordinate system entirely
            ctx.restore(); ctx.save()
            const n = el.values.length
            const maxV = Math.max(...el.values.map(Math.abs))
            const barW = iw / (n * 1.4)
            const gap = iw / n
            const barColor = resolveColor(el.color || 'blue', C)
            const baseY = pt + ih  // bottom of chart area

            el.values.forEach((v, i) => {
              const barH = (Math.abs(v) / maxV) * ih * 0.85
              const bx = pl + i * gap + (gap - barW) / 2
              const by = v >= 0 ? baseY - barH : baseY
              ctx.fillStyle = barColor
              ctx.globalAlpha = el.alpha || 0.8
              ctx.fillRect(bx, by, barW, barH)
              ctx.globalAlpha = 1
              ctx.strokeStyle = barColor; ctx.lineWidth = 1
              ctx.strokeRect(bx, by, barW, barH)
              // value label above bar
              ctx.fillStyle = barColor; ctx.font = '500 11px sans-serif'; ctx.textAlign = 'center'
              ctx.fillText(v.toFixed(1), bx + barW / 2, by - 4)
              // category label below
              ctx.fillStyle = C.muted; ctx.font = '11px sans-serif'
              ctx.fillText(el.labels[i], bx + barW / 2, baseY + 14)
            })
            break
          }

        }
        ctx.restore()
      }

      // Restore from clip
      ctx.restore()

      // Axis tick labels (drawn outside clip region)
      ctx.fillStyle = C.muted; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
    }

    draw()

    if (!roRef.current) {
      roRef.current = new ResizeObserver(draw)
      if (canvasRef.current?.parentElement) roRef.current.observe(canvasRef.current.parentElement)
    }
    return () => { if (roRef.current) { roRef.current.disconnect(); roRef.current = null } }

  }, [figureJson, C])

  // Parse to get dimensions for the canvas style
  let fig = null
  try { fig = typeof figureJson === 'string' ? JSON.parse(figureJson) : figureJson } catch (e) {}

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        aspectRatio: fig?.square ? '1' : undefined,
        height: fig?.square ? undefined : (fig?.height || 340),
        display: 'block',
        borderRadius: 8,
      }}
    />
  )
}
