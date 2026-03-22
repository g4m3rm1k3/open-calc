import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * GraphExplorerViz
 * Interactive graph: drag nodes, click to add edges, toggle directed/undirected.
 * Displays degree count for each node. Highlights Euler path conditions.
 */
export default function GraphExplorerViz({ params = {} }) {
  const svgRef = useRef(null)
  const [directed, setDirected] = useState(false)
  const [eulerInfo, setEulerInfo] = useState('')
  const simulationRef = useRef(null)

  const WIDTH = 560
  const HEIGHT = 380

  const initialNodes = [
    { id: 'A', label: 'A' },
    { id: 'B', label: 'B' },
    { id: 'C', label: 'C' },
    { id: 'D', label: 'D' },
    { id: 'E', label: 'E' },
  ]

  const initialEdges = [
    { source: 'A', target: 'B' },
    { source: 'A', target: 'C' },
    { source: 'B', target: 'D' },
    { source: 'C', target: 'D' },
    { source: 'D', target: 'E' },
  ]

  const nodesRef = useRef(initialNodes.map(n => ({ ...n })))
  const edgesRef = useRef(initialEdges.map(e => ({ ...e })))

  const computeEuler = (nodes, edges) => {
    const deg = {}
    nodes.forEach(n => { deg[n.id] = 0 })
    edges.forEach(e => {
      const s = typeof e.source === 'object' ? e.source.id : e.source
      const t = typeof e.target === 'object' ? e.target.id : e.target
      deg[s] = (deg[s] || 0) + 1
      deg[t] = (deg[t] || 0) + 1
    })
    const oddCount = Object.values(deg).filter(d => d % 2 !== 0).length
    if (oddCount === 0) return { text: '✅ Euler Circuit exists (all vertices have even degree)', color: '#16a34a' }
    if (oddCount === 2) return { text: '➡️ Euler Path exists (exactly 2 odd-degree vertices)', color: '#d97706' }
    return { text: `❌ No Euler Path (${oddCount} odd-degree vertices — need 0 or 2)`, color: '#dc2626' }
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22).attr('refY', 0)
      .attr('markerWidth', 6).attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8')

    const nodes = nodesRef.current
    const edges = edgesRef.current

    const info = computeEuler(nodes, edges)
    setEulerInfo(info)

    // Force simulation
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .force('collision', d3.forceCollide(30))

    simulationRef.current = sim

    // Degree map
    const deg = {}
    nodes.forEach(n => { deg[n.id] = 0 })
    edges.forEach(e => {
      const s = typeof e.source === 'object' ? e.source.id : e.source
      const t = typeof e.target === 'object' ? e.target.id : e.target
      deg[s] = (deg[s] || 0) + 1
      deg[t] = (deg[t] || 0) + 1
    })

    // Edges
    const link = svg.append('g').selectAll('line')
      .data(edges).enter().append('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 2)
      .attr('marker-end', directed ? 'url(#arrow)' : null)

    // Nodes
    const nodeG = svg.append('g').selectAll('g')
      .data(nodes).enter().append('g')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart()
          d.fx = d.x; d.fy = d.y
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
        .on('end', (event, d) => {
          if (!event.active) sim.alphaTarget(0)
          d.fx = null; d.fy = null
        })
      )

    nodeG.append('circle')
      .attr('r', 20)
      .attr('fill', d => {
        const isOdd = (deg[d.id] || 0) % 2 !== 0
        return isOdd ? '#fef2f2' : '#eff6ff'
      })
      .attr('stroke', d => {
        const isOdd = (deg[d.id] || 0) % 2 !== 0
        return isOdd ? '#ef4444' : '#3b82f6'
      })
      .attr('stroke-width', 2.5)

    nodeG.append('text')
      .attr('text-anchor', 'middle').attr('dy', 1)
      .attr('font-size', 14).attr('font-weight', 'bold').attr('fill', '#1e293b')
      .text(d => d.label)

    // Degree badge
    nodeG.append('text')
      .attr('text-anchor', 'middle').attr('dy', 32)
      .attr('font-size', 11).attr('fill', '#64748b')
      .text(d => `deg ${deg[d.id] || 0}`)

    sim.on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      nodeG.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => sim.stop()
  }, [directed])

  const addEdge = () => {
    const src = prompt('Source node (A-E):')?.toUpperCase()
    const tgt = prompt('Target node (A-E):')?.toUpperCase()
    const validIds = nodesRef.current.map(n => n.id)
    if (src && tgt && validIds.includes(src) && validIds.includes(tgt) && src !== tgt) {
      edgesRef.current = [...edgesRef.current, { source: src, target: tgt }]
      // re-render by toggling directed back
      setDirected(d => { setTimeout(() => setDirected(d), 10); return !d })
    }
  }

  const resetGraph = () => {
    nodesRef.current = initialNodes.map(n => ({ ...n }))
    edgesRef.current = initialEdges.map(e => ({ ...e }))
    setDirected(false)
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <svg
        ref={svgRef}
        width={WIDTH}
        height={HEIGHT}
        style={{ display: 'block', maxWidth: '100%', height: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fafafa' }}
      />
      <div
        style={{
          marginTop: 8, padding: '8px 12px', borderRadius: 6,
          background: '#f8fafc', border: '1px solid #e2e8f0',
          fontSize: 13, fontWeight: 600,
          color: eulerInfo.color || '#475569',
        }}
      >
        {eulerInfo.text || 'Analyzing...'}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => setDirected(d => !d)}
          style={{
            padding: '7px 14px', background: directed ? '#1d4ed8' : '#e2e8f0',
            color: directed ? 'white' : '#334155',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}
        >
          {directed ? 'Directed ↗' : 'Undirected ─'}
        </button>
        <button
          onClick={addEdge}
          style={{
            padding: '7px 14px', background: '#10b981', color: 'white',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}
        >
          + Add Edge
        </button>
        <button
          onClick={resetGraph}
          style={{
            padding: '7px 14px', background: '#f1f5f9', color: '#475569',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}
        >
          Reset
        </button>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: '#64748b' }}>
        <span>🔵 Even degree (Euler-friendly)</span>
        <span>🔴 Odd degree (Euler-problematic)</span>
        <span>Drag nodes to rearrange</span>
      </div>
    </div>
  )
}
