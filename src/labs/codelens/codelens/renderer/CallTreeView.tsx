/**
 * CallTreeView — recursive call tree with pan, zoom, and seek-on-click.
 *
 * Mouse wheel = zoom · drag = pan · click node = seek to that call's first step
 * Amber = current call · Indigo = call path · Depth selector caps visible depth
 */
import { useMemo, useState, useRef, useCallback, useEffect } from 'react'

const CALL = 'function_call'
const RET  = 'function_return'

const NODE_W  = 108
const NODE_H  = 42
const COL_GAP = 10
const ROW_H   = 76

const MIN_SCALE = 0.15
const MAX_SCALE = 2.5

// ── Tree builder ──────────────────────────────────────────────────────────────

function buildTree(events) {
  const root = { id: '__root__', name: '__root__', args: [], children: [],
    returnValue: undefined, stepStart: 0, stepEnd: events.length - 1 }
  const stack = [root]

  events.forEach((evt, i) => {
    if (evt.type === CALL) {
      const node = {
        id:          `n${i}`,
        name:        evt.functionName ?? '?',
        args:        (evt.args ?? []).map(fmtArg),
        children:    [],
        returnValue: undefined,
        stepStart:   i,
        stepEnd:     -1,
      }
      stack.at(-1).children.push(node)
      stack.push(node)
    } else if (evt.type === RET) {
      if (stack.length > 1) {
        const node = stack.pop()
        node.returnValue = evt.returnValue
        node.stepEnd     = i
      }
    }
  })

  return root
}

function fmtArg(a) {
  if (a === null)      return 'null'
  if (a === undefined) return '?'
  if (typeof a === 'object' && '$ref' in a) return '…'
  const s = JSON.stringify(a)
  return s?.length > 6 ? s.slice(0, 5) + '…' : s
}

function fmtReturn(v) {
  if (v === undefined) return null
  if (v === null)      return 'null'
  if (typeof v === 'object' && '$ref' in v) return '{…}'
  const s = JSON.stringify(v)
  return s?.length > 10 ? s.slice(0, 9) + '…' : s
}

function countAll(node) {
  return 1 + node.children.reduce((s, c) => s + countAll(c), 0)
}

// ── Layout ────────────────────────────────────────────────────────────────────

function computeLayout(tree, maxDepth) {
  const visRoots = tree.children
  if (visRoots.length === 0) return { nodeList: [], edgeList: [], svgW: 0, svgH: 0 }

  function calcW(node, depth) {
    if (depth >= maxDepth || node.children.length === 0) {
      node._w = NODE_W + COL_GAP
    } else {
      node.children.forEach(c => calcW(c, depth + 1))
      node._w = Math.max(NODE_W + COL_GAP, node.children.reduce((s, c) => s + c._w, 0))
    }
  }
  visRoots.forEach(r => calcW(r, 0))

  const totalW = visRoots.reduce((s, r) => s + r._w, 0)
  const nodeList = []
  const edgeList = []

  function place(node, cx, depth) {
    const y           = depth * ROW_H
    const x           = cx - NODE_W / 2
    const hiddenKids  = depth === maxDepth && node.children.length > 0
    const hiddenCount = hiddenKids ? node.children.reduce((s, c) => s + countAll(c), 0) : 0

    nodeList.push({ node, x, y, cx, depth, hiddenKids, hiddenCount })

    if (depth < maxDepth && node.children.length > 0) {
      const totalChildW = node.children.reduce((s, c) => s + c._w, 0)
      let childCx = cx - totalChildW / 2 + node.children[0]._w / 2
      for (const child of node.children) {
        const childY = (depth + 1) * ROW_H
        const midY   = (y + NODE_H + childY) / 2
        edgeList.push({
          d:    `M${cx},${y + NODE_H} C${cx},${midY} ${childCx},${midY} ${childCx},${childY}`,
          from: node.id,
          to:   child.id,
        })
        place(child, childCx, depth + 1)
        childCx += child._w
      }
    }
  }

  let cx = 0
  for (const r of visRoots) {
    place(r, cx + r._w / 2, 0)
    cx += r._w
  }

  const svgH = (maxDepth + 1) * ROW_H + NODE_H + 40
  return { nodeList, edgeList, svgW: totalW, svgH }
}

// ── Pan / Zoom hook ───────────────────────────────────────────────────────────

function usePanZoom(svgW, svgH) {
  const [tx, setTx]    = useState(10)
  const [ty, setTy]    = useState(10)
  const [scale, setScale] = useState(1)
  const dragRef = useRef(null)
  const svgRef  = useRef(null)

  // Center tree horizontally on first render
  useEffect(() => {
    if (!svgRef.current || svgW === 0) return
    const containerW = svgRef.current.clientWidth || 300
    setTx(Math.max(10, (containerW - svgW) / 2))
    setTy(10)
    setScale(1)
  }, [svgW])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    const rect   = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const factor = e.deltaY < 0 ? 1.12 : 0.9
    setScale(s => {
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, s * factor))
      // Zoom toward mouse pointer
      setTx(x => mouseX - (mouseX - x) * (next / s))
      setTy(y => mouseY - (mouseY - y) * (next / s))
      return next
    })
  }, [])

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    // Don't start pan if clicking a node (handled by node onClick)
    dragRef.current = { startX: e.clientX, startY: e.clientY, origTx: tx, origTy: ty, moved: false }
  }, [tx, ty])

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    if (Math.abs(dx) + Math.abs(dy) > 3) dragRef.current.moved = true
    setTx(dragRef.current.origTx + dx)
    setTy(dragRef.current.origTy + dy)
  }, [])

  const onMouseUp = useCallback(() => {
    dragRef.current = null
  }, [])

  const isDragging = useCallback(() => dragRef.current?.moved ?? false, [])

  const resetView = useCallback(() => {
    if (!svgRef.current || svgW === 0) return
    const containerW = svgRef.current.clientWidth || 300
    setTx(Math.max(10, (containerW - svgW) / 2))
    setTy(10)
    setScale(1)
  }, [svgW])

  // Attach wheel listener (non-passive so we can preventDefault)
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  return { svgRef, tx, ty, scale, onMouseDown, onMouseMove, onMouseUp, isDragging, resetView }
}

// ── Component ─────────────────────────────────────────────────────────────────

const DEPTHS = [3, 4, 5, 6, 99]
const DEPTH_LABELS = { 3: '3', 4: '4', 5: '5', 6: '6', 99: '∞' }

export default function CallTreeView({ events, step, onSeek }) {
  const [maxDepth, setMaxDepth] = useState(4)

  const tree = useMemo(() => buildTree(events ?? []), [events])

  const { nodeList, edgeList, svgW, svgH } = useMemo(
    () => computeLayout(tree, maxDepth),
    [tree, maxDepth],
  )

  const { svgRef, tx, ty, scale, onMouseDown, onMouseMove, onMouseUp, isDragging, resetView }
    = usePanZoom(svgW, svgH)

  // Active path
  const { activePath, currentId } = useMemo(() => {
    const activePath = new Set()
    let currentId = null, maxD = -1
    for (const { node, depth } of nodeList) {
      const inside = step >= node.stepStart && (node.stepEnd === -1 || step <= node.stepEnd)
      if (inside) {
        activePath.add(node.id)
        if (depth > maxD) { maxD = depth; currentId = node.id }
      }
    }
    return { activePath, currentId }
  }, [nodeList, step])

  const totalCalls = tree.children.reduce((s, r) => s + countAll(r), 0)

  const handleNodeClick = useCallback((node) => {
    if (isDragging()) return
    onSeek?.(node.stepStart)
  }, [onSeek, isDragging])

  if (!events?.length) {
    return <Empty>Run code to see the call tree.</Empty>
  }
  if (tree.children.length === 0) {
    return <Empty>No function calls detected.</Empty>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        padding: '5px 10px', borderBottom: '1px solid #1e293b',
      }}>
        <span style={{ fontSize: 9, color: '#334155', letterSpacing: '.08em',
          fontFamily: 'JetBrains Mono, monospace' }}>CALL TREE</span>
        <span style={{ fontSize: 9, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
          {totalCalls} calls
        </span>

        {/* Zoom controls */}
        <div style={{ display: 'flex', gap: 2 }}>
          <ZoomBtn onClick={() => { resetView() }} title="Reset view">⊙</ZoomBtn>
          <ZoomBtn onClick={() => setScale(s => Math.min(MAX_SCALE, s * 1.25))}>+</ZoomBtn>
          <ZoomBtn onClick={() => setScale(s => Math.max(MIN_SCALE, s * 0.8))}>−</ZoomBtn>
        </div>

        <span style={{ fontSize: 9, color: '#334155', fontFamily: 'JetBrains Mono, monospace',
          marginLeft: 'auto', opacity: 0.6 }}>
          scroll=zoom · drag=pan · click=seek
        </span>

        {/* Depth */}
        <div style={{ display: 'flex', gap: 2, background: '#0f172a',
          borderRadius: 4, padding: 2, border: '1px solid #1e293b' }}>
          {DEPTHS.map(d => (
            <button key={d} onClick={() => setMaxDepth(d)} style={{
              padding: '2px 6px', borderRadius: 3, border: 'none', cursor: 'pointer',
              fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
              background: maxDepth === d ? '#1e293b' : 'transparent',
              color:      maxDepth === d ? '#a5b4fc' : '#475569',
            }}>{DEPTH_LABELS[d]}</button>
          ))}
        </div>
      </div>

      {/* ── Legend ── */}
      <div style={{ display: 'flex', gap: 10, padding: '4px 10px',
        borderBottom: '1px solid #0f172a', flexShrink: 0 }}>
        <Legend color="#fbbf24" label="current call" />
        <Legend color="#6366f1" label="call path" />
        <Legend color="#1e293b" label="completed" />
      </div>

      {/* ── Canvas ── */}
      <div
        ref={svgRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ flex: 1, overflow: 'hidden', cursor: 'grab', userSelect: 'none',
          background: '#080c14', position: 'relative' }}
      >
        <svg
          width="100%"
          height="100%"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            {nodeList.map(({ node, x, y }) => (
              <clipPath key={`clip_${node.id}`} id={`clt_clip_${node.id}`}>
                <rect x={x + 4} y={y} width={NODE_W - 8} height={NODE_H} />
              </clipPath>
            ))}
          </defs>

          <g transform={`translate(${tx}, ${ty}) scale(${scale})`}>

            {/* Base edges */}
            {edgeList.map((e, i) => (
              <path key={i} d={e.d} fill="none" stroke="#1e293b" strokeWidth={1.5} />
            ))}

            {/* Active path edges */}
            {nodeList.map(({ node, cx, y, depth }) => {
              if (!activePath.has(node.id)) return null
              return node.children.map((child, ci) => {
                if (!activePath.has(child.id)) return null
                const childEntry = nodeList.find(n => n.node.id === child.id)
                if (!childEntry) return null
                const midY = (y + NODE_H + childEntry.y) / 2
                return (
                  <path key={`ap-${node.id}-${ci}`}
                    d={`M${cx},${y + NODE_H} C${cx},${midY} ${childEntry.cx},${midY} ${childEntry.cx},${childEntry.y}`}
                    fill="none" stroke="#6366f1" strokeWidth={2} opacity={0.7}
                  />
                )
              })
            })}

            {/* Nodes */}
            {nodeList.map(({ node, x, y, cx, hiddenKids, hiddenCount }) => {
              const isCurrent = node.id === currentId
              const isInPath  = activePath.has(node.id)
              const retStr    = fmtReturn(node.returnValue)
              const hasReturn = node.returnValue !== undefined
              const argsStr   = node.args.slice(0, 3).join(', ')
              const nameStr   = node.name.length > 11 ? node.name.slice(0, 10) + '…' : node.name
              const callStr   = `${nameStr}(${argsStr})`
              const clipId    = `clt_clip_${node.id}`

              return (
                <g
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={x} y={y} width={NODE_W} height={NODE_H} rx={6}
                    fill={isCurrent ? '#1a1020' : isInPath ? '#0c1428' : '#0d1526'}
                    stroke={isCurrent ? '#fbbf24' : isInPath ? '#6366f1' : '#1e293b'}
                    strokeWidth={isCurrent ? 2 : isInPath ? 1.5 : 1}
                    style={{ filter: isCurrent ? 'drop-shadow(0 0 6px rgba(251,191,36,.4))' : 'none' }}
                  />

                  <text x={cx} y={y + 16} textAnchor="middle"
                    fill={isCurrent ? '#fbbf24' : isInPath ? '#a5b4fc' : '#7dd3fc'}
                    fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight={700}
                    clipPath={`url(#${clipId})`}>
                    {callStr}
                  </text>

                  {hasReturn && retStr !== null ? (
                    <text x={cx} y={y + 31} textAnchor="middle"
                      fill={isCurrent ? '#fcd34d' : '#86efac'}
                      fontSize={9} fontFamily="JetBrains Mono, monospace"
                      clipPath={`url(#${clipId})`}>
                      → {retStr}
                    </text>
                  ) : !hasReturn ? (
                    <text x={cx} y={y + 31} textAnchor="middle"
                      fill="#334155" fontSize={9} fontFamily="JetBrains Mono, monospace">
                      …
                    </text>
                  ) : null}

                  {hiddenKids && (
                    <text x={cx} y={y + NODE_H + 14} textAnchor="middle"
                      fill="#475569" fontSize={8} fontFamily="JetBrains Mono, monospace">
                      +{hiddenCount} hidden
                    </text>
                  )}
                </g>
              )
            })}

          </g>
        </svg>
      </div>
    </div>
  )
}

function ZoomBtn({ onClick, children, title }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 20, height: 20, borderRadius: 3, border: '1px solid #1e293b',
      background: '#0f172a', color: '#475569', cursor: 'pointer',
      fontSize: 13, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'JetBrains Mono, monospace', padding: 0,
    }}>{children}</button>
  )
}

function Legend({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9,
      color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
      <span style={{ width: 8, height: 8, borderRadius: 2,
        border: `2px solid ${color}`, display: 'inline-block' }} />
      {label}
    </span>
  )
}

function Empty({ children }) {
  return (
    <div style={{ padding: '16px 12px', color: '#475569', fontSize: 12 }}>
      {children}
    </div>
  )
}
