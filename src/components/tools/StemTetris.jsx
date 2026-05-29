import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'

const COLS = 10
const ROWS = 20

// Compute cell size from viewport once at module load
const CELL = (() => {
  if (typeof window === 'undefined') return 36
  const byH = Math.floor((window.innerHeight - 90) / ROWS)   // full-screen: only header ~70px
  const byW = Math.floor((window.innerWidth  - 420) / COLS)  // left panel(120) + right panel(240) + gaps
  return Math.max(28, Math.min(byH, byW, 66))
})()

const W = COLS * CELL
const H = ROWS * CELL

const PIECES = {
  I: { cells: [[0,1],[1,1],[2,1],[3,1]], color: '#00d4ff', sym: 'C₂', symmetry: '2-fold rotational' },
  O: { cells: [[0,0],[1,0],[0,1],[1,1]], color: '#ffe040', sym: 'D₄', symmetry: 'Square: 4-fold' },
  T: { cells: [[1,0],[0,1],[1,1],[2,1]], color: '#cc44ff', sym: 'C₁', symmetry: 'No symmetry' },
  S: { cells: [[1,0],[2,0],[0,1],[1,1]], color: '#44ff88', sym: 'C₂', symmetry: '2-fold rotational' },
  Z: { cells: [[0,0],[1,0],[1,1],[2,1]], color: '#ff4455', sym: 'C₂', symmetry: '2-fold rotational' },
  J: { cells: [[0,0],[0,1],[1,1],[2,1]], color: '#ff8844', sym: 'C₁', symmetry: 'No symmetry' },
  L: { cells: [[2,0],[0,1],[1,1],[2,1]], color: '#4488ff', sym: 'C₁', symmetry: 'No symmetry' },
}
const PIECE_KEYS = Object.keys(PIECES)
const SCORE_TABLE = [0, 100, 300, 500, 800]

// ─── Fixed 90° CW rotation ────────────────────────────────────────────────────
// Original had `maxY - (y-minY) + minX` which added minX as an offset — shifting
// pieces far right when not at the board edge. Correct: minX + maxY - y.
function rotate90(cells) {
  const xs = cells.map(c => c[0]), ys = cells.map(c => c[1])
  const minX = Math.min(...xs), minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return cells.map(([x, y]) => [
    minX + maxY - y,        // 90° CW: new_x = minX + (maxY - y)
    minY + (x - minX),      // 90° CW: new_y = minY + (x - minX)
  ])
}

function getRotationMatrix(step) {
  const theta = (step * Math.PI) / 2
  return { cos: Math.round(Math.cos(theta)), sin: Math.round(Math.sin(theta)), theta: step * 90 }
}

function spawnPiece(key) {
  const p = PIECES[key]
  const minY = Math.min(...p.cells.map(c => c[1]))
  return { key, color: p.color, cells: p.cells.map(([x, y]) => [x + 3, y - minY]), rotations: 0 }
}

function isValid(cells, board) {
  return cells.every(([x, y]) => x >= 0 && x < COLS && (y < 0 || (y < ROWS && !board[y][x])))
}

function getDropInterval(level) {
  return Math.max(60, Math.floor(800 / Math.pow(1.18, level - 1)))
}

const STEM_MODES = [
  { id: 'NORMAL',      label: 'Play',     icon: '▶',    color: '#4dd0ff', description: 'Classic Tetris' },
  { id: 'MATRIX',      label: 'Matrix',   icon: '[ ]',  color: '#44ff88', description: 'Board as bool[20][10]' },
  { id: 'ROTATION',    label: 'Rotation', icon: '↻',    color: '#cc44ff', description: '2×2 rotation transforms' },
  { id: 'GRAVITY',     label: 'Gravity',  icon: '↓g',   color: '#ff8844', description: 'Δy/Δt = g·level' },
  { id: 'PROBABILITY', label: 'Prob',     icon: 'P(x)', color: '#ffe040', description: 'Piece frequency vs E[X]=1/7' },
  { id: 'PACKING',     label: 'Packing',  icon: 'η',    color: '#ff44cc', description: 'Space efficiency heat map' },
]

// ─── Draw one filled cell ──────────────────────────────────────────────────────
function drawCell(ctx, px, py, color, active) {
  ctx.fillStyle = active ? color : color + 'bb'
  ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2)
  ctx.fillStyle = 'rgba(255,255,255,0.14)'
  ctx.fillRect(px + 1, py + 1, CELL - 2, 3)
  ctx.fillRect(px + 1, py + 1, 3, CELL - 2)
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(px + 1, py + CELL - 4, CELL - 2, 3)
  ctx.fillRect(px + CELL - 4, py + 1, 3, CELL - 2)
  if (active) {
    ctx.strokeStyle = color; ctx.lineWidth = 0.5
    ctx.strokeRect(px + 0.5, py + 0.5, CELL - 1, CELL - 1)
  }
}

// ─── MiniPiece for next-piece preview ─────────────────────────────────────────
function MiniPiece({ pieceKey, size = 16 }) {
  const p = PIECES[pieceKey]
  const xs = p.cells.map(c => c[0]), ys = p.cells.map(c => c[1])
  const minX = Math.min(...xs), minY = Math.min(...ys)
  const w = (Math.max(...xs) - minX + 1) * size
  const h = (Math.max(...ys) - minY + 1) * size
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {p.cells.map(([x, y], i) => (
        <rect key={i} x={(x-minX)*size+1} y={(y-minY)*size+1} width={size-2} height={size-2} fill={p.color} opacity={0.9} rx={1} />
      ))}
    </svg>
  )
}

// ─── Board Canvas with STEM overlays ─────────────────────────────────────────
function BoardCanvas({ board, currentPiece, showGhost, stemMode, rotations, level, pieceCount }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = '#050a0f'
    ctx.fillRect(0, 0, W, H)

    // ── PACKING: build hole depth map ────────────────────────────────────────
    let holeDepth = null
    if (stemMode === 'PACKING') {
      holeDepth = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
      for (let x = 0; x < COLS; x++) {
        let firstFilled = -1
        for (let y = 0; y < ROWS; y++) {
          if (board[y]?.[x]) { if (firstFilled < 0) firstFilled = y }
          else if (firstFilled >= 0) holeDepth[y][x] = y - firstFilled
        }
      }
    }

    // ── Grid ──────────────────────────────────────────────────────────────────
    ctx.lineWidth = 0.5
    ctx.strokeStyle = stemMode === 'MATRIX' ? 'rgba(20,60,35,0.6)' : 'rgba(10,25,38,0.9)'
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, H); ctx.stroke()
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL); ctx.stroke()
    }

    // ── MATRIX: column index header row ──────────────────────────────────────
    if (stemMode === 'MATRIX') {
      const fs = Math.max(8, Math.floor(CELL * 0.28))
      ctx.font = `bold ${fs}px monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      for (let x = 0; x < COLS; x++) {
        ctx.fillStyle = x % 2 === 0 ? '#1a5030' : '#0e3520'
        ctx.fillText(x, x * CELL + CELL / 2, 2)
      }
    }

    // ── Locked cells ──────────────────────────────────────────────────────────
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = board[y]?.[x]
        const px = x * CELL, py = y * CELL

        if (stemMode === 'MATRIX') {
          if (cell) {
            ctx.fillStyle = '#071510'
            ctx.fillRect(px, py, CELL, CELL)
            ctx.strokeStyle = '#44ff8833'; ctx.lineWidth = 0.5
            ctx.strokeRect(px + 0.5, py + 0.5, CELL - 1, CELL - 1)
            ctx.fillStyle = '#44ff88'
            ctx.font = `bold ${Math.floor(CELL * 0.52)}px monospace`
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
            ctx.fillText('1', px + CELL / 2, py + CELL / 2)
          } else {
            ctx.fillStyle = '#0c1e14'
            ctx.font = `${Math.floor(CELL * 0.36)}px monospace`
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
            ctx.fillText('0', px + CELL / 2, py + CELL / 2)
          }
        } else if (stemMode === 'PACKING') {
          if (cell) {
            drawCell(ctx, px, py, cell, false)
          } else if (holeDepth?.[y]?.[x] > 0) {
            const d = Math.min(holeDepth[y][x] / 6, 1)
            ctx.fillStyle = `rgba(${Math.floor(180 + 75*d)}, ${Math.floor(30 + 30*(1-d))}, 20, ${0.25 + d * 0.55})`
            ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2)
          }
        } else if (cell) {
          drawCell(ctx, px, py, cell, false)
        }
      }
    }

    // ── MATRIX: row index labels (right edge) ─────────────────────────────────
    if (stemMode === 'MATRIX') {
      const fs = Math.max(7, Math.floor(CELL * 0.24))
      ctx.font = `${fs}px monospace`
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
      for (let y = 0; y < ROWS; y++) {
        ctx.fillStyle = y % 2 === 0 ? 'rgba(20,80,50,0.8)' : 'rgba(14,55,35,0.8)'
        ctx.fillText(String(y).padStart(2, '0'), W - 2, y * CELL + CELL / 2)
      }
    }

    // ── GRAVITY: trajectory lines to ghost ────────────────────────────────────
    if (stemMode === 'GRAVITY' && currentPiece && showGhost) {
      let offset = 0
      while (isValid(currentPiece.cells.map(([x, y]) => [x, y + offset + 1]), board)) offset++
      if (offset > 0) {
        currentPiece.cells.forEach(([x, y]) => {
          ctx.setLineDash([2, 4])
          ctx.strokeStyle = 'rgba(255,136,68,0.14)'; ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(x * CELL + CELL / 2, Math.max(0, y) * CELL + CELL)
          ctx.lineTo(x * CELL + CELL / 2, (y + offset) * CELL)
          ctx.stroke()
          ctx.setLineDash([])
        })
      }
    }

    // ── Ghost piece ────────────────────────────────────────────────────────────
    if (currentPiece && showGhost && stemMode !== 'MATRIX') {
      let offset = 0
      while (isValid(currentPiece.cells.map(([x, y]) => [x, y + offset + 1]), board)) offset++
      currentPiece.cells.forEach(([x, y]) => {
        const ry = y + offset
        if (ry < 0 || ry >= ROWS) return
        const px = x * CELL, py = ry * CELL
        ctx.strokeStyle = currentPiece.color + '44'; ctx.lineWidth = 1
        ctx.strokeRect(px + 1, py + 1, CELL - 2, CELL - 2)
        ctx.fillStyle = currentPiece.color + '0e'
        ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2)
      })
    }

    // ── Current piece ─────────────────────────────────────────────────────────
    if (currentPiece) {
      currentPiece.cells.forEach(([x, y]) => {
        if (y < 0) return
        const px = x * CELL, py = y * CELL
        if (stemMode === 'MATRIX') {
          ctx.fillStyle = '#071510'
          ctx.fillRect(px, py, CELL, CELL)
          ctx.strokeStyle = currentPiece.color + '99'; ctx.lineWidth = 1
          ctx.strokeRect(px + 0.5, py + 0.5, CELL - 1, CELL - 1)
          ctx.fillStyle = currentPiece.color
          ctx.font = `bold ${Math.floor(CELL * 0.52)}px monospace`
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText('1', px + CELL / 2, py + CELL / 2)
        } else {
          drawCell(ctx, px, py, currentPiece.color, true)
        }
      })

      // GRAVITY: velocity arrows on piece
      if (stemMode === 'GRAVITY') {
        const speed = 1 - getDropInterval(level) / 800
        const r = Math.floor(200 + 55 * speed), g = Math.floor(160 - 110 * speed)
        currentPiece.cells.forEach(([x, y]) => {
          if (y < 0 || y >= ROWS) return
          const cx = x * CELL + CELL / 2, cy = y * CELL + CELL - 5
          ctx.strokeStyle = `rgba(${r},${g},30,0.7)`; ctx.lineWidth = 2
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + 6); ctx.stroke()
          ctx.fillStyle = `rgba(${r},${g},30,0.7)`
          ctx.beginPath(); ctx.moveTo(cx - 4, cy + 4); ctx.lineTo(cx + 4, cy + 4); ctx.lineTo(cx, cy + 11); ctx.fill()
        })
      }

      // ROTATION: circle + angle + local coords
      if (stemMode === 'ROTATION') {
        const vis = currentPiece.cells.filter(([, y]) => y >= 0 && y < ROWS)
        if (vis.length > 0) {
          const minCX = Math.min(...vis.map(c => c[0]))
          const minCY = Math.min(...vis.map(c => c[1]))
          const maxCX = Math.max(...vis.map(c => c[0]))
          const maxCY = Math.max(...vis.map(c => c[1]))
          const pcx = ((minCX + maxCX) / 2) * CELL + CELL / 2
          const pcy = ((minCY + maxCY) / 2) * CELL + CELL / 2
          const rad = Math.max(CELL * 1.2, Math.hypot(maxCX - minCX, maxCY - minCY) * CELL * 0.6 + CELL * 0.8)

          // Dashed rotation circle
          ctx.strokeStyle = currentPiece.color + '55'; ctx.lineWidth = 1.5
          ctx.setLineDash([4, 4])
          ctx.beginPath(); ctx.arc(pcx, pcy, rad, 0, Math.PI * 2); ctx.stroke()
          ctx.setLineDash([])

          // Rotating dot on circle
          const angle = (rotations % 4) * Math.PI / 2 - Math.PI / 2
          const dotX = pcx + rad * Math.cos(angle)
          const dotY = pcy + rad * Math.sin(angle)
          ctx.fillStyle = currentPiece.color
          ctx.beginPath(); ctx.arc(dotX, dotY, 5, 0, Math.PI * 2); ctx.fill()

          // Arc showing angle from 0
          ctx.strokeStyle = currentPiece.color + '44'; ctx.lineWidth = 1
          ctx.beginPath(); ctx.arc(pcx, pcy, rad * 0.4, -Math.PI / 2, angle); ctx.stroke()

          // Angle label at center
          ctx.fillStyle = currentPiece.color + 'cc'
          ctx.font = `bold ${Math.floor(CELL * 0.32)}px monospace`
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(`${(rotations % 4) * 90}°`, pcx, pcy)

          // Local (dx, dy) coords on each cell
          vis.forEach(([x, y]) => {
            const dx = x - minCX, dy = y - minCY
            ctx.fillStyle = 'rgba(210,90,255,0.85)'
            ctx.font = `${Math.max(7, Math.floor(CELL * 0.22))}px monospace`
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
            ctx.fillText(`${dx},${dy}`, x * CELL + CELL / 2, y * CELL + CELL / 2)
          })
        }
      }
    }

    // ── PROBABILITY: piece frequency bars drawn inside bottom of board ─────────
    if (stemMode === 'PROBABILITY') {
      const total = Object.values(pieceCount).reduce((a, b) => a + b, 0)
      if (total > 0) {
        const barH = Math.min(CELL * 1.5, H * 0.12)
        const barY = H - barH - 2
        const barW = W / PIECE_KEYS.length
        ctx.fillStyle = 'rgba(5,10,15,0.75)'
        ctx.fillRect(0, barY - 12, W, barH + 14)
        ctx.fillStyle = 'rgba(255,224,64,0.5)'
        ctx.font = `bold ${Math.floor(barH * 0.22)}px monospace`
        ctx.textAlign = 'left'; ctx.textBaseline = 'top'
        ctx.fillText('P(piece) vs 1/7', 4, barY - 11)
        PIECE_KEYS.forEach((k, i) => {
          const pct = (pieceCount[k] || 0) / total
          const expected = 1 / 7
          const diff = pct - expected
          const barColor = diff > 0.04 ? '#ff8844' : diff < -0.04 ? '#4488ff' : '#44ff88'
          const bx = i * barW + 2, bw = barW - 4
          ctx.fillStyle = 'rgba(10,20,30,0.5)'
          ctx.fillRect(bx, barY, bw, barH)
          const fillH = Math.round(pct / (expected * 2.5) * barH)
          ctx.fillStyle = barColor
          ctx.fillRect(bx, barY + barH - fillH, bw, fillH)
          // Expected line
          const expY = barY + barH - Math.round(expected / (expected * 2.5) * barH)
          ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1
          ctx.setLineDash([2, 2])
          ctx.beginPath(); ctx.moveTo(bx, expY); ctx.lineTo(bx + bw, expY); ctx.stroke()
          ctx.setLineDash([])
          ctx.fillStyle = PIECES[k].color
          ctx.font = `bold ${Math.max(7, Math.floor(barW * 0.3))}px monospace`
          ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
          ctx.fillText(k, bx + bw / 2, barY - 1)
        })
      }
    }

    // ── Mode badge (non-normal modes) ─────────────────────────────────────────
    if (stemMode !== 'NORMAL') {
      const m = STEM_MODES.find(s => s.id === stemMode)
      ctx.fillStyle = 'rgba(5,10,20,0.7)'
      const label = `${m?.icon} ${m?.label.toUpperCase()} MODE`
      ctx.font = `bold ${Math.floor(CELL * 0.28)}px monospace`
      const tw = ctx.measureText(label).width
      ctx.fillRect(4, 4, tw + 12, 20)
      ctx.fillStyle = m?.color || '#4dd0ff'
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
      ctx.fillText(label, 10, 14)
    }

  }, [board, currentPiece, showGhost, stemMode, rotations, level, pieceCount])

  return (
    <canvas ref={canvasRef} width={W} height={H}
      style={{ display: 'block', border: '1px solid #1a3040', cursor: 'default' }} />
  )
}

// ─── STEM Side Panel ──────────────────────────────────────────────────────────
function StemPanel({ mode, piece, board, pieceCount, level, lines, combo, rotations }) {
  const modeObj = STEM_MODES.find(m => m.id === mode) || STEM_MODES[0]
  const total = Object.values(pieceCount).reduce((a, b) => a + b, 0)

  // Packing stats
  let holes = 0, heights = Array(COLS).fill(0)
  for (let x = 0; x < COLS; x++) {
    let found = false
    for (let y = 0; y < ROWS; y++) {
      if (board[y]?.[x]) { found = true; if (!heights[x]) heights[x] = ROWS - y }
      else if (found) holes++
    }
  }
  const filled = board.flat().filter(Boolean).length
  const packEff = filled + holes > 0 ? Math.round(filled / (filled + holes) * 100) : 100
  const bump = heights.reduce((acc, h, i) => acc + (i > 0 ? Math.abs(h - heights[i-1]) : 0), 0)
  const avgH = Math.round(heights.reduce((a, b) => a + b, 0) / COLS)

  const panelW = Math.max(240, Math.min(320, Math.round(CELL * 5.5)))
  const panelStyle = { width: panelW, minWidth: panelW, background: '#060c14', border: '1px solid #1a3040', padding: 14, display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'monospace', fontSize: 12, overflowY: 'auto' }
  const hdStyle = { fontSize: 8, letterSpacing: 3, color: '#2a5570', marginBottom: 3, textTransform: 'uppercase' }
  const codeBox = (c) => ({ margin: '6px 0', padding: '6px 8px', background: '#0a1520', border: '1px solid #1a3a40', fontSize: 10, color: c || '#44ff88', lineHeight: 1.7 })

  return (
    <div style={panelStyle}>
      {/* Mode header */}
      <div style={{ borderBottom: '1px solid #0d2030', paddingBottom: 10 }}>
        <div style={hdStyle}>stem mode</div>
        <div style={{ fontSize: 15, color: modeObj.color, fontWeight: 700, letterSpacing: 1 }}>{modeObj.icon} {modeObj.label}</div>
        <div style={{ fontSize: 10, color: '#3a6070', marginTop: 4, lineHeight: 1.5 }}>{modeObj.description}</div>
      </div>

      {/* ── NORMAL ── */}
      {mode === 'NORMAL' && (
        <div style={{ color: '#3a7090', fontSize: 11, lineHeight: 1.7 }}>
          <div style={{ color: '#4dd0ff', marginBottom: 6 }}>Tab → cycle modes</div>
          <div>Each mode reveals a different layer of math hiding inside Tetris.</div>
          <div style={{ marginTop: 8 }}>
            {STEM_MODES.slice(1).map(m => (
              <div key={m.id} style={{ color: m.color, marginBottom: 3 }}>· {m.label}: {m.description}</div>
            ))}
          </div>
        </div>
      )}

      {/* ── MATRIX ── */}
      {mode === 'MATRIX' && (
        <div>
          <div style={hdStyle}>board state</div>
          <div style={{ fontSize: 11, color: '#44ff88', lineHeight: 1.8 }}>
            <div>type <span style={{ color: '#fff' }}>boolean[{ROWS}][{COLS}]</span></div>
            <div>filled <span style={{ color: '#4dd0ff' }}>{filled}</span> / {ROWS * COLS}</div>
            <div>empty  <span style={{ color: '#4dd0ff' }}>{ROWS * COLS - filled}</span></div>
          </div>
          <div style={codeBox('#44ff88')}>
            <div style={{ color: '#2a5070' }}>// access cell</div>
            <div>board[row][col]</div>
            <div style={{ marginTop: 4, color: '#2a5070' }}>// clear line</div>
            <div>board.splice(r, 1)</div>
            <div>board.unshift([])</div>
          </div>
          <div style={hdStyle}>collision check</div>
          <div style={codeBox('#44ff88')}>
            <div style={{ color: '#2a5070' }}>// O(cells) per move</div>
            <div>board[y][x] !== null</div>
            <div style={{ marginTop: 4, color: '#2a5070' }}>// clear check O(n)</div>
            <div>row.every(c =&gt; c)</div>
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: '#3a6070', lineHeight: 1.6 }}>
            Row-col indices shown on board. Green = 1, dim = 0.
          </div>
        </div>
      )}

      {/* ── ROTATION ── */}
      {mode === 'ROTATION' && (
        <div>
          {piece && (
            <div style={{ marginBottom: 10 }}>
              <div style={hdStyle}>current piece</div>
              <div style={{ fontSize: 12, color: '#cc44ff' }}>
                <span style={{ color: '#fff' }}>{piece.key}</span> — {PIECES[piece.key]?.sym}
              </div>
              <div style={{ fontSize: 10, color: '#3a7090' }}>{PIECES[piece.key]?.symmetry}</div>
            </div>
          )}
          <div style={hdStyle}>rotation matrices</div>
          {[0, 1, 2, 3].map(step => {
            const mat = getRotationMatrix(step)
            const isCur = (rotations % 4) === step
            return (
              <div key={step} style={{ marginBottom: 6, padding: '5px 8px', background: isCur ? '#1a0d30' : 'transparent', border: `1px solid ${isCur ? '#cc44ff55' : '#1a3040'}`, transition: 'all 0.2s' }}>
                <div style={{ fontSize: 9, color: isCur ? '#cc44ff' : '#2a5570', marginBottom: 3 }}>θ = {step * 90}° {isCur ? '← current' : ''}</div>
                <div style={{ fontSize: 11, color: isCur ? '#cc44ff' : '#3a5070', lineHeight: 1.8, fontFamily: 'monospace' }}>
                  <div>[{String(mat.cos).padStart(2)} {String(-mat.sin).padStart(2)}]</div>
                  <div>[{String(mat.sin).padStart(2)}  {String(mat.cos).padStart(2)}]</div>
                </div>
              </div>
            )
          })}
          <div style={{ fontSize: 10, color: '#3a6070', lineHeight: 1.6, marginTop: 4 }}>
            <div>↑ key applies next matrix</div>
            <div>4 rotations = identity</div>
            <div style={{ marginTop: 4, color: '#cc44ff' }}>O-piece (D₄ symmetry):</div>
            <div>all rotations identical</div>
          </div>
        </div>
      )}

      {/* ── GRAVITY ── */}
      {mode === 'GRAVITY' && (
        <div>
          <div style={hdStyle}>drop speed</div>
          <div style={{ fontSize: 13, color: '#ff8844' }}>level {level}: <span style={{ color: '#fff' }}>{getDropInterval(level)}ms</span></div>
          <div style={{ marginTop: 8 }}>
            {Array.from({ length: Math.min(level + 3, 12) }, (_, i) => {
              const l = i + 1, ms = getDropInterval(l)
              const w = Math.round((1 - ms / 800) * 100)
              return (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 20, fontSize: 9, color: l === level ? '#ff8844' : '#2a5570' }}>L{l}</div>
                  <div style={{ flex: 1, height: 5, background: '#0d1e2b', border: '1px solid #1a3040' }}>
                    <div style={{ height: '100%', width: `${w}%`, background: l === level ? '#ff8844' : '#2a4050', transition: 'width 0.4s' }} />
                  </div>
                  <div style={{ fontSize: 9, color: l === level ? '#ff8844' : '#2a5570', width: 38, textAlign: 'right' }}>{ms}ms</div>
                </div>
              )
            })}
          </div>
          <div style={codeBox('#ff8844')}>
            <div style={{ color: '#2a5070' }}>// exponential decay</div>
            <div>800 / 1.18^(lvl-1)</div>
            <div style={{ marginTop: 4, color: '#2a5070' }}>// max speed</div>
            <div>floor = 60ms (~17fps)</div>
          </div>
          <div style={{ fontSize: 10, color: '#3a6070', lineHeight: 1.6, marginTop: 4 }}>
            Arrows on piece show velocity direction. Dashed lines show fall path to ghost.
          </div>
        </div>
      )}

      {/* ── PROBABILITY ── */}
      {mode === 'PROBABILITY' && (
        <div>
          <div style={hdStyle}>piece frequency</div>
          <div style={{ fontSize: 10, color: '#ffe040', marginBottom: 8 }}>
            n = <span style={{ color: '#fff' }}>{total}</span> pieces drawn
          </div>
          {PIECE_KEYS.map(k => {
            const pct = total > 0 ? (pieceCount[k] || 0) / total : 0
            const exp = 1 / 7
            const diff = pct - exp
            const bc = diff > 0.04 ? '#ff8844' : diff < -0.04 ? '#4488ff' : '#44ff88'
            return (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <div style={{ width: 12, height: 12, background: PIECES[k].color, opacity: 0.85, flexShrink: 0 }} />
                <div style={{ width: 12, fontSize: 9, color: '#3a7090' }}>{k}</div>
                <div style={{ flex: 1, height: 6, background: '#0d1e2b', border: '1px solid #1a3040', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${Math.round(pct * 100)}%`, background: bc, transition: 'width 0.4s' }} />
                  <div style={{ position: 'absolute', top: -2, height: 10, width: 1, background: '#666', left: `${Math.round(exp * 100)}%` }} />
                </div>
                <div style={{ fontSize: 9, color: bc, width: 30, textAlign: 'right' }}>{Math.round(pct * 100)}%</div>
              </div>
            )
          })}
          <div style={codeBox('#ffe040')}>
            <div>E[X] = 1/7 ≈ 14.3%</div>
            <div style={{ marginTop: 4, color: '#2a5070' }}>// std dev</div>
            <div>σ = √(p(1-p)/n)</div>
            {total > 0 && <div style={{ color: '#ffe040' }}>= {(Math.sqrt((1/7*6/7)/total)*100).toFixed(1)}%</div>}
          </div>
          <div style={{ fontSize: 10, color: '#3a6070', lineHeight: 1.5 }}>
            Orange = seen too often. Blue = overdue. Bar chart on board updates live.
          </div>
        </div>
      )}

      {/* ── PACKING ── */}
      {mode === 'PACKING' && (
        <div>
          <div style={hdStyle}>efficiency</div>
          <div style={{ fontSize: 28, color: '#ff44cc', fontWeight: 700, lineHeight: 1 }}>{packEff}%</div>
          <div style={{ fontSize: 10, color: '#3a6070', marginTop: 2 }}>filled / (filled + holes)</div>
          <div style={{ height: 1, background: '#0d2030', margin: '8px 0' }} />
          <div style={{ fontSize: 11, color: '#ff44cc', lineHeight: 1.9 }}>
            <div>holes  <span style={{ color: '#fff' }}>{holes}</span></div>
            <div>avg h  <span style={{ color: '#fff' }}>{avgH}</span></div>
            <div>bumpy  <span style={{ color: '#fff' }}>{bump}</span></div>
            <div>filled <span style={{ color: '#fff' }}>{filled}</span></div>
          </div>
          <div style={codeBox('#ff44cc')}>
            <div style={{ color: '#2a5070' }}>// AI cost function</div>
            <div>cost =</div>
            <div>  holes  × 4 +</div>
            <div>  bump   × 2 +</div>
            <div>  height × 1</div>
          </div>
          <div style={{ fontSize: 10, color: '#3a6070', lineHeight: 1.5 }}>
            Heat map on board: orange = hole, deeper = more red. Keep board flat and filled.
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Line Clear Flash ──────────────────────────────────────────────────────────
function LineClearFlash({ lines, mode }) {
  if (!lines) return null
  const labels = { 1: 'SINGLE', 2: 'DOUBLE', 3: 'TRIPLE', 4: 'TETRIS!' }
  const stemHint = {
    MATRIX:      `splice(y,1) × ${lines} — array shrinks`,
    PROBABILITY: 'E[next] = 1/7 — memoryless!',
    PACKING:     'η improved — holes cleared',
    GRAVITY:     `stack Δh = −${lines}`,
    ROTATION:    'lock phase — rotation frozen',
    NORMAL:      `+${[0,100,300,500,800][Math.min(lines,4)]} pts`,
  }
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', background: 'rgba(5,10,20,0.72)', zIndex: 5, animation: 'flashIn 0.15s ease' }}>
      <div style={{ fontSize: Math.floor(CELL * 0.9), fontWeight: 800, color: '#4dd0ff', letterSpacing: 4, fontFamily: 'monospace' }}>{labels[Math.min(lines, 4)]}</div>
      <div style={{ fontSize: Math.floor(CELL * 0.32), color: '#4a8090', marginTop: 4, letterSpacing: 2 }}>{lines} line{lines > 1 ? 's' : ''} cleared</div>
      <div style={{ fontSize: Math.floor(CELL * 0.35), color: '#ffe040', marginTop: 8, fontFamily: 'monospace', padding: '4px 14px', border: '1px solid #3a4000', background: '#0d1000' }}>
        {stemHint[mode] || stemHint.NORMAL}
      </div>
    </div>
  )
}

// ─── Main Game ─────────────────────────────────────────────────────────────────
export default function StemTetris({ defaultMode = 'NORMAL', autoStart = false }) {
  const [board, setBoard] = useState(() => Array.from({ length: ROWS }, () => Array(COLS).fill(null)))
  const [piece, setPiece] = useState(null)
  const [nextKey, setNextKey] = useState(null)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [combo, setCombo] = useState(0)
  const [counts, setCounts] = useState(() => Object.fromEntries(PIECE_KEYS.map(k => [k, 0])))
  const [state, setState] = useState('idle')
  const [mode, setMode] = useState(defaultMode)
  const [ghost, setGhost] = useState(true)
  const [flash, setFlash] = useState(0)
  const [rots, setRots] = useState(0)

  const boardR = useRef(board), pieceR = useRef(piece)
  const stateR = useRef(state), levelR = useRef(level)
  const dropR = useRef(null), flashR = useRef(null)

  boardR.current = board; pieceR.current = piece
  stateR.current = state; levelR.current = level

  const lockPiece = useCallback(() => {
    const p = pieceR.current, b = boardR.current
    if (!p) return
    const nb = b.map(row => [...row])
    p.cells.forEach(([x, y]) => { if (y >= 0 && y < ROWS) nb[y][x] = p.color })

    let cleared = 0
    for (let y = ROWS - 1; y >= 0; y--) {
      if (nb[y].every(c => c !== null)) {
        nb.splice(y, 1); nb.unshift(Array(COLS).fill(null)); cleared++; y++
      }
    }

    setBoard(nb); boardR.current = nb
    setCounts(prev => ({ ...prev, [p.key]: (prev[p.key] || 0) + 1 }))

    if (cleared > 0) {
      const nc = combo + 1
      const pts = SCORE_TABLE[Math.min(cleared, 4)] * levelR.current * (1 + nc * 0.1)
      setScore(s => s + pts)
      setLines(l => { const nl = l + cleared; setLevel(Math.floor(nl / 10) + 1); return nl })
      setCombo(nc); setFlash(cleared)
      if (flashR.current) clearTimeout(flashR.current)
      flashR.current = setTimeout(() => setFlash(0), 600)
    } else {
      setCombo(0)
    }

    const nk = nextKey || PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)]
    const np = spawnPiece(nk)
    if (!isValid(np.cells, nb)) {
      setState('over'); stateR.current = 'over'
      if (dropR.current) clearInterval(dropR.current)
    } else {
      setPiece(np); pieceR.current = np; setRots(0)
      setNextKey(PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)])
    }
  }, [combo, nextKey])

  const drop = useCallback(() => {
    if (stateR.current !== 'running') return
    const p = pieceR.current; if (!p) return
    const moved = p.cells.map(([x, y]) => [x, y + 1])
    if (isValid(moved, boardR.current)) {
      const np = { ...p, cells: moved }; setPiece(np); pieceR.current = np
    } else { lockPiece() }
  }, [lockPiece])

  useEffect(() => {
    if (state !== 'running') return
    if (dropR.current) clearInterval(dropR.current)
    dropR.current = setInterval(drop, getDropInterval(level))
    return () => clearInterval(dropR.current)
  }, [state, level, drop])

  const startGame = useCallback(() => {
    const b = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
    const fk = PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)]
    const nk = PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)]
    const p = spawnPiece(fk)
    setBoard(b); boardR.current = b
    setPiece(p); pieceR.current = p
    setNextKey(nk); setScore(0); setLines(0); setLevel(1); setCombo(0); setRots(0)
    setCounts(Object.fromEntries(PIECE_KEYS.map(k => [k, 0])))
    setState('running'); stateR.current = 'running'
  }, [])

  useEffect(() => { if (autoStart) startGame() }, [])

  useEffect(() => {
    const onKey = e => {
      const st = stateR.current

      if (e.key === ' ') {
        e.preventDefault()
        if (st === 'idle' || st === 'over') { startGame(); return }
        if (st === 'paused') { setState('running'); stateR.current = 'running'; return }
        const p = pieceR.current; if (!p) return
        let off = 0
        while (isValid(p.cells.map(([x, y]) => [x, y + off + 1]), boardR.current)) off++
        if (off > 0) {
          setScore(s => s + off * 2)
          const np = { ...p, cells: p.cells.map(([x, y]) => [x, y + off]) }
          setPiece(np); pieceR.current = np
        }
        setTimeout(() => lockPiece(), 0)
        return
      }

      if (e.key === 'p' || e.key === 'P') {
        if (st === 'running') { setState('paused'); stateR.current = 'paused' }
        else if (st === 'paused') { setState('running'); stateR.current = 'running' }
        return
      }

      if (e.key === 'Tab') {
        e.preventDefault()
        setMode(m => { const i = STEM_MODES.findIndex(s => s.id === m); return STEM_MODES[(i + 1) % STEM_MODES.length].id })
        return
      }

      if (st !== 'running') return
      const p = pieceR.current; if (!p) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const m = p.cells.map(([x, y]) => [x - 1, y])
        if (isValid(m, boardR.current)) { const np = { ...p, cells: m }; setPiece(np); pieceR.current = np }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        const m = p.cells.map(([x, y]) => [x + 1, y])
        if (isValid(m, boardR.current)) { const np = { ...p, cells: m }; setPiece(np); pieceR.current = np }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const rotated = rotate90(p.cells)
        // Wall kicks: try position offsets in order; [0,0] first so it only shifts if truly blocked
        const kicks = [[0,0],[-1,0],[1,0],[0,-1],[-2,0],[2,0]]
        for (const [dx, dy] of kicks) {
          const kicked = rotated.map(([x, y]) => [x + dx, y + dy])
          if (isValid(kicked, boardR.current)) {
            const np = { ...p, cells: kicked }; setPiece(np); pieceR.current = np
            setRots(r => r + 1)
            break
          }
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault(); drop()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [startGame, lockPiece, drop])

  const modeObj = STEM_MODES.find(m => m.id === mode)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'monospace', color: '#c8e0f0', width: '100%', padding: '0 24px', boxSizing: 'border-box' }}>
      <style>{`
        @keyframes flashIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <div style={{ fontSize: Math.floor(CELL * 0.45), color: '#4dd0ff', letterSpacing: 4, fontWeight: 700 }}>STEM//TETRIS</div>
          <div style={{ fontSize: 9, color: '#2a5570', letterSpacing: 3 }}>VISUAL LEARNING EDITION</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {STEM_MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} title={m.description}
              style={{ background: mode === m.id ? '#0d2030' : 'transparent', border: mode === m.id ? `1px solid ${m.color}` : '1px solid #1a3040', color: mode === m.id ? m.color : '#3a6070', padding: '4px 10px', fontSize: Math.max(9, Math.floor(CELL * 0.27)), fontFamily: 'monospace', cursor: 'pointer', letterSpacing: 1, transition: 'all 0.15s', borderRadius: 2 }}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
        <Link to="/games" style={{ background: 'transparent', border: '1px solid #1a3040', borderRadius: 3, color: '#3a6070', textDecoration: 'none', padding: '4px 12px', fontSize: 10, letterSpacing: 1, display: 'inline-flex', alignItems: 'center', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#4dd0ff'; e.currentTarget.style.borderColor = '#4dd0ff' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#3a6070'; e.currentTarget.style.borderColor = '#1a3040' }}>
          ← GAMES
        </Link>
      </div>

      {/* ── Main layout ── */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', justifyContent: 'space-around' }}>

        {/* Left stats */}
        <div style={{ width: 115, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            { label: 'SCORE', value: Math.floor(score).toLocaleString(), big: true },
            { label: 'LINES', value: lines },
            { label: 'LEVEL', value: String(level).padStart(2, '0') },
            { label: 'COMBO', value: combo > 0 ? `×${combo}` : '—' },
          ].map(({ label, value, big }) => (
            <div key={label} style={{ background: '#090f16', border: '1px solid #1a3040', padding: '7px 10px' }}>
              <div style={{ fontSize: 8, letterSpacing: 3, color: '#2a5570', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: big ? Math.floor(CELL * 0.45) : Math.floor(CELL * 0.55), color: '#4dd0ff', lineHeight: 1 }}>{value}</div>
            </div>
          ))}

          {/* Next piece */}
          <div style={{ background: '#090f16', border: '1px solid #1a3040', padding: '7px 10px' }}>
            <div style={{ fontSize: 8, letterSpacing: 3, color: '#2a5570', marginBottom: 6 }}>NEXT</div>
            {nextKey && <MiniPiece pieceKey={nextKey} size={Math.floor(CELL * 0.55)} />}
            {nextKey && (
              <div style={{ marginTop: 4, fontSize: 9, color: PIECES[nextKey]?.color }}>
                {PIECES[nextKey]?.sym} — {nextKey}
              </div>
            )}
          </div>

          {/* Ghost toggle */}
          <button onClick={() => setGhost(g => !g)}
            style={{ background: ghost ? '#0d2030' : 'transparent', border: `1px solid ${ghost ? '#4dd0ff' : '#1a3040'}`, color: ghost ? '#4dd0ff' : '#3a6070', padding: '5px 8px', fontSize: 9, fontFamily: 'monospace', cursor: 'pointer', letterSpacing: 1, width: '100%' }}>
            {ghost ? '● GHOST ON' : '○ GHOST OFF'}
          </button>

          {/* Controls */}
          <div style={{ background: '#060c12', border: '1px solid #1a3040', padding: '8px 10px', fontSize: 9 }}>
            <div style={{ fontSize: 8, letterSpacing: 3, color: '#2a5570', marginBottom: 6 }}>CONTROLS</div>
            {[['←→','move'],['↑','rotate CW'],['↓','soft drop'],['SPC','hard drop'],['P','pause'],['Tab','mode']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#3a6070' }}>
                <span style={{ color: '#2a6080', background: '#0d1e2b', padding: '1px 4px', border: '1px solid #1a3040' }}>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Board */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <BoardCanvas board={board} currentPiece={piece} showGhost={ghost}
            stemMode={mode} rotations={rots} level={level} pieceCount={counts} />

          {flash > 0 && <LineClearFlash lines={flash} mode={mode} />}

          {state === 'idle' && (
            <div onClick={startGame} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,10,20,0.92)', cursor: 'pointer', zIndex: 10 }}>
              <div style={{ fontSize: Math.floor(CELL * 0.6), color: '#4dd0ff', letterSpacing: 4, fontWeight: 700 }}>STEM//TETRIS</div>
              <div style={{ fontSize: Math.floor(CELL * 0.32), color: '#4a8090', marginTop: 10, letterSpacing: 2 }}>SPACE or click to start</div>
              <div style={{ fontSize: Math.floor(CELL * 0.28), color: '#2a5060', marginTop: 8, letterSpacing: 1 }}>Tab → cycle STEM modes</div>
              <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: W * 0.9 }}>
                {STEM_MODES.slice(1).map(m => (
                  <div key={m.id} style={{ fontSize: 9, color: m.color, border: `1px solid ${m.color}44`, padding: '2px 8px' }}>{m.icon} {m.label}</div>
                ))}
              </div>
            </div>
          )}
          {state === 'paused' && (
            <div onClick={() => { setState('running'); stateR.current = 'running' }}
              style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,10,20,0.88)', cursor: 'pointer', zIndex: 10 }}>
              <div style={{ fontSize: Math.floor(CELL * 0.55), color: '#4dd0ff', letterSpacing: 4 }}>PAUSED</div>
              <div style={{ fontSize: Math.floor(CELL * 0.3), color: '#4a8090', marginTop: 8, letterSpacing: 2 }}>P or click to resume</div>
            </div>
          )}
          {state === 'over' && (
            <div onClick={startGame} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,10,20,0.92)', cursor: 'pointer', zIndex: 10 }}>
              <div style={{ fontSize: Math.floor(CELL * 0.55), color: '#ff4455', letterSpacing: 4 }}>GAME OVER</div>
              <div style={{ fontSize: Math.floor(CELL * 0.38), color: '#4dd0ff', marginTop: 8 }}>score: {Math.floor(score).toLocaleString()}</div>
              <div style={{ fontSize: Math.floor(CELL * 0.3), color: '#4a8090', marginTop: 4 }}>lines: {lines} · level: {level}</div>
              <div style={{ fontSize: Math.floor(CELL * 0.28), color: '#2a5570', marginTop: 16, letterSpacing: 2 }}>SPACE or click to restart</div>
            </div>
          )}
        </div>

        {/* STEM panel */}
        <StemPanel mode={mode} piece={piece} board={board} pieceCount={counts}
          level={level} lines={lines} combo={combo} rotations={rots} />
      </div>
    </div>
  )
}
