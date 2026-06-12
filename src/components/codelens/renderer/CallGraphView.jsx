/**
 * CallGraphView — static call graph as a layered SVG DAG.
 * Nodes = named functions/methods. Edges = "A calls B".
 * Active nodes are highlighted based on the current execution stack.
 */

const SVG_W    = 288
const NODE_H   = 40
const LAYER_H  = 74
const PAD_TOP  = 12
const PAD_SIDE = 8
const NODE_GAP = 6

const KIND_COLOR = {
  function:    '#7dd3fc',
  arrow:       '#86efac',
  method:      '#818cf8',
  constructor: '#a78bfa',
}
const kindColor = k => KIND_COLOR[k] ?? '#94a3b8'

function complexityColor(c) {
  if (!c || c === 'O(1)') return null
  if (c === 'O(n)' || c.includes('recursive')) return '#fbbf24'
  if (c.includes('log') || c === 'O(n²)') return '#f97316'
  return '#f87171'
}

function trunc(str, maxLen) {
  if (!str) return ''
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str
}

// ── Layout ─────────────────────────────────────────────────────────────────────
// Assigns each node a layer (longest-path from root), then positions within layer.

function computeLayout(nodes, edges) {
  const nameById = {}
  nodes.forEach(n => { nameById[n.id] = n.name })

  const adj    = {}
  const indeg  = {}
  nodes.forEach(n => { adj[n.id] = []; indeg[n.id] = 0 })

  for (const e of edges) {
    if (e.recursive) continue
    adj[e.from].push(e.to)
    indeg[e.to] = (indeg[e.to] ?? 0) + 1
  }

  const layer = {}
  nodes.forEach(n => { layer[n.id] = 0 })

  // BFS from zero-in-degree roots; assign longest-path layer
  let queue = nodes.filter(n => indeg[n.id] === 0).map(n => n.id)
  if (queue.length === 0) queue = nodes.map(n => n.id)  // all in a cycle

  const visited = new Set()
  while (queue.length) {
    const next = []
    for (const id of queue) {
      if (visited.has(id)) continue
      visited.add(id)
      for (const to of (adj[id] ?? [])) {
        const nl = (layer[id] ?? 0) + 1
        if (nl > (layer[to] ?? 0)) layer[to] = nl
        if (!visited.has(to)) next.push(to)
      }
    }
    queue = next
  }

  // Group nodes by layer, sort within each by source line
  const byLayer = {}
  nodes.forEach(n => {
    const l = layer[n.id] ?? 0
    if (!byLayer[l]) byLayer[l] = []
    byLayer[l].push(n)
  })
  Object.values(byLayer).forEach(arr => arr.sort((a, b) => (a.line ?? 0) - (b.line ?? 0)))

  const maxLayer = Math.max(...nodes.map(n => layer[n.id] ?? 0), 0)

  const positions = {}
  for (const [l, layerNodes] of Object.entries(byLayer)) {
    const count  = layerNodes.length
    const nodeW  = Math.min(200, Math.floor((SVG_W - 2 * PAD_SIDE - (count - 1) * NODE_GAP) / count))
    const totalW = count * nodeW + (count - 1) * NODE_GAP
    const startX = Math.floor((SVG_W - totalW) / 2)
    layerNodes.forEach((n, i) => {
      const x = startX + i * (nodeW + NODE_GAP)
      positions[n.id] = { x, y: PAD_TOP + Number(l) * LAYER_H, w: nodeW, cx: x + nodeW / 2 }
    })
  }

  return { positions, maxLayer, nameById }
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function CallGraphView({ callGraph, currentEvent }) {
  if (!callGraph?.nodes?.length) {
    return (
      <div style={{ padding: '10px 0', fontSize: 12, color: '#475569' }}>
        No functions detected.
      </div>
    )
  }

  const { nodes, edges } = callGraph
  const activeNames = new Set((currentEvent?.stackSnapshot ?? []).map(f => f.name))
  const layout  = computeLayout(nodes, edges)
  const svgH    = PAD_TOP + (layout.maxLayer + 1) * LAYER_H + 4

  return (
    <div style={{ overflow: 'auto', marginBottom: 10 }}>
      <svg width={SVG_W} height={svgH} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <marker id="cg-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0,0 0,6 6,3" fill="#334155" />
          </marker>
          <marker id="cg-arr-a" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0,0 0,6 6,3" fill="#818cf8" />
          </marker>
        </defs>

        {/* ── Edges (behind nodes) ── */}
        {edges.filter(e => !e.recursive).map((e, i) => {
          const f = layout.positions[e.from]
          const t = layout.positions[e.to]
          if (!f || !t) return null
          const bothActive = activeNames.has(layout.nameById[e.from]) && activeNames.has(layout.nameById[e.to])
          const x1 = f.cx, y1 = f.y + NODE_H
          const x2 = t.cx, y2 = t.y
          const mid = (y1 + y2) / 2
          return (
            <path key={i}
              d={`M${x1},${y1} C${x1},${mid} ${x2},${mid} ${x2},${y2}`}
              fill="none"
              stroke={bothActive ? '#6366f1' : '#1e293b'}
              strokeWidth={bothActive ? 1.5 : 1}
              markerEnd={bothActive ? 'url(#cg-arr-a)' : 'url(#cg-arr)'}
            />
          )
        })}

        {/* ── Nodes ── */}
        {nodes.map(node => {
          const pos = layout.positions[node.id]
          if (!pos) return null
          const { x, y, w } = pos
          const isActive  = activeNames.has(node.name)
          const isRecurse = edges.some(e => e.recursive && e.from === node.id)
          const color     = kindColor(node.kind)
          const cxColor   = complexityColor(node.complexity)
          // chars available for name: subtract left pad (12px) + right content (~50px) / ~7px per char
          const nameMaxLen = Math.max(6, Math.floor((w - (cxColor ? 60 : 22)) / 7))
          const parMaxLen  = Math.max(4, Math.floor((w - 22) / 7))

          return (
            <g key={node.id}>
              {/* Node card */}
              <rect x={x} y={y} width={w} height={NODE_H} rx={6}
                fill="#0d1526"
                stroke={isActive ? '#fbbf24' : color + '44'}
                strokeWidth={isActive ? 1.5 : 1}
                style={{ filter: isActive ? 'drop-shadow(0 0 6px rgba(251,191,36,.35))' : 'none' }}
              />
              {/* Left kind bar */}
              <rect x={x} y={y + 4} width={3} height={NODE_H - 8} rx={2} fill={color} />

              {/* Recursive indicator */}
              {isRecurse && (
                <text x={x + w - 5} y={y + 14}
                  fill="#f59e0b" fontSize={13} textAnchor="end" fontFamily="monospace"
                  title="Recursive">↺</text>
              )}

              {/* Function name */}
              <text x={x + 10} y={y + 15}
                fill={isActive ? '#fbbf24' : color}
                fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight={700}>
                {trunc(node.name, nameMaxLen)}
              </text>

              {/* Params */}
              <text x={x + 10} y={y + 30}
                fill="#475569" fontSize={9} fontFamily="JetBrains Mono, monospace">
                ({trunc(node.params.join(', '), parMaxLen)})
              </text>

              {/* Complexity badge (bottom-right) */}
              {cxColor && (
                <text x={x + w - 5} y={y + 30}
                  fill={cxColor} fontSize={8} fontFamily="JetBrains Mono, monospace"
                  textAnchor="end">
                  {node.complexity}
                </text>
              )}

              {/* Line number (bottom-right, only when no complexity) */}
              {!cxColor && node.line && (
                <text x={x + w - 5} y={y + 30}
                  fill="#334155" fontSize={8} fontFamily="JetBrains Mono, monospace"
                  textAnchor="end">
                  L{node.line}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
        {Object.entries(KIND_COLOR).map(([kind, color]) => (
          nodes.some(n => n.kind === kind) && (
            <span key={kind} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9,
              color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
              <span style={{ width: 3, height: 10, background: color, borderRadius: 2, display: 'inline-block' }} />
              {kind}
            </span>
          )
        ))}
      </div>
    </div>
  )
}
