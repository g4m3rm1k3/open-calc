import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { snapshotToGraph } from './heapSnapshot.js'

const TYPE_COLOR = {
  Object:     '#818cf8',
  Array:      '#7dd3fc',
  Node:       '#86efac',
  LinkedList: '#a78bfa',
  Map:        '#fbbf24',
  Set:        '#f472b6',
  prototype:  '#475569',
}
function typeColor(t) { return TYPE_COLOR[t] ?? '#94a3b8' }

// Node card dimensions
const NW  = 148   // card width
const NH  = 38    // header height
const PH  = 18    // per-property row height
const PAD = 8     // horizontal text padding

function nodeH(n) { return NH + (n.props.length ? 4 + n.props.length * PH : 0) }

function trunc(s, max = 13) {
  const str = String(s)
  return str.length > max ? str.slice(0, max) + '…' : str
}

export default function HeapGraph({ snapshot }) {
  const containerRef = useRef(null)
  const svgRef       = useRef(null)
  const simRef       = useRef(null)
  const posMap       = useRef(new Map())

  const { nodes: rawNodes, links: rawLinks } = useMemo(
    () => snapshot ? snapshotToGraph(snapshot) : { nodes: [], links: [] },
    [snapshot]
  )

  const nodes = useMemo(() => rawNodes.map(n => {
    const p = posMap.current.get(n.id)
    return { ...n, x: p?.x, y: p?.y }
  }), [rawNodes])

  const links = useMemo(() => rawLinks.map(l => ({ ...l })), [rawLinks])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function draw(W, H) {
      if (simRef.current) { simRef.current.stop(); simRef.current = null }

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      // Only use D3 attrs for size — no CSS width/height on the SVG element itself
      svg.attr('width', W).attr('height', H)

      if (nodes.length === 0) {
        svg.append('text')
          .attr('x', W / 2).attr('y', H / 2)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
          .attr('fill', '#334155').attr('font-size', 13)
          .text('Run code and step forward to see heap allocations.')
        return
      }

      // Seed new nodes near center, keep positions for existing ones
      nodes.forEach(n => {
        if (n.x == null || n.x < 0 || n.x > W) n.x = W / 2 + (Math.random() - 0.5) * 120
        if (n.y == null || n.y < 0 || n.y > H) n.y = H / 2 + (Math.random() - 0.5) * 120
      })

      // ── Defs ────────────────────────────────────────────────────────────────
      const defs = svg.append('defs')
      const marker = defs.append('marker')
        .attr('id', 'arr').attr('viewBox', '0 -5 10 10')
        .attr('refX', 8).attr('refY', 0)
        .attr('markerWidth', 7).attr('markerHeight', 7)
        .attr('orient', 'auto')
      marker.append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', '#6366f1')

      const flt = defs.append('filter').attr('id', 'glow')
        .attr('x', '-40%').attr('y', '-40%').attr('width', '180%').attr('height', '180%')
      flt.append('feGaussianBlur').attr('stdDeviation', 3).attr('result', 'blur')
      const fm = flt.append('feMerge')
      fm.append('feMergeNode').attr('in', 'blur')
      fm.append('feMergeNode').attr('in', 'SourceGraphic')

      // ── Root group (pan/zoom target) ─────────────────────────────────────────
      const g = svg.append('g')
      svg.call(
        d3.zoom().scaleExtent([0.1, 4])
          .on('zoom', e => g.attr('transform', e.transform))
      )

      // ── Links ────────────────────────────────────────────────────────────────
      const lGrp = g.append('g')
      const lSel = lGrp.selectAll('g').data(links, d => d.id).enter().append('g')

      const lPath = lSel.append('path')
        .attr('stroke', '#6366f1').attr('stroke-width', 1.5)
        .attr('fill', 'none').attr('opacity', 0.8)
        .attr('marker-end', 'url(#arr)')

      const lLabel = lSel.append('text')
        .attr('font-size', 9).attr('fill', '#818cf8')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .text(d => d.label)

      // ── Nodes ────────────────────────────────────────────────────────────────
      const nGrp = g.append('g')
      const nSel = nGrp.selectAll('g').data(nodes, d => d.id).enter().append('g')
        .attr('cursor', 'grab')
        .call(
          d3.drag()
            .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.2).restart(); d.fx = d.x; d.fy = d.y })
            .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y })
            .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
        )

      // Card background
      nSel.append('rect')
        .attr('width', NW).attr('height', d => nodeH(d))
        .attr('rx', 7).attr('ry', 7)
        .attr('fill', '#0d1526')
        .attr('stroke', d => d.isNew ? '#22c55e' : d.isMutated ? '#f59e0b' : typeColor(d.type) + '66')
        .attr('stroke-width', d => d.isNew || d.isMutated ? 2 : 1)
        .attr('filter', d => d.isNew || d.isMutated ? 'url(#glow)' : null)

      // Header band
      nSel.append('rect')
        .attr('width', NW).attr('height', NH).attr('rx', 7).attr('ry', 7)
        .attr('fill', d => typeColor(d.type) + '22')
      // Square off bottom of header band (round corners only on top)
      nSel.append('rect')
        .attr('y', NH - 7).attr('width', NW).attr('height', 7)
        .attr('fill', d => typeColor(d.type) + '22')

      // Type label
      nSel.append('text')
        .attr('x', NW / 2).attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12).attr('font-weight', 700)
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('fill', d => typeColor(d.type))
        .text(d => d.type)

      // Object id
      nSel.append('text')
        .attr('x', NW / 2).attr('y', 28)
        .attr('text-anchor', 'middle')
        .attr('font-size', 9).attr('font-family', 'JetBrains Mono, monospace')
        .attr('fill', '#475569')
        .text(d => `#${d.id}`)

      // Property rows
      nSel.each(function(d) {
        const el = d3.select(this)
        d.props.forEach(([k, v], i) => {
          const y = NH + 4 + i * PH + PH * 0.65
          el.append('text')
            .attr('x', PAD).attr('y', y)
            .attr('font-size', 10).attr('font-family', 'JetBrains Mono, monospace')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#7dd3fc')
            .text(trunc(k, 8) + ':')
          el.append('text')
            .attr('x', NW - PAD).attr('y', y)
            .attr('text-anchor', 'end')
            .attr('font-size', 10).attr('font-family', 'JetBrains Mono, monospace')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#86efac')
            .text(trunc(v, 10))
        })
      })

      // Fade-in new nodes
      nSel.filter(d => d.isNew).attr('opacity', 0)
        .transition().duration(300).attr('opacity', 1)

      // ── Simulation ───────────────────────────────────────────────────────────
      const sim = d3.forceSimulation(nodes)
        .force('link',    d3.forceLink(links).id(d => d.id).distance(180).strength(0.6))
        .force('charge',  d3.forceManyBody().strength(-600))
        .force('x',       d3.forceX(W / 2).strength(0.12))
        .force('y',       d3.forceY(H / 2).strength(0.12))
        .force('collide', d3.forceCollide(80).strength(1))
        .alphaDecay(0.025)
        .velocityDecay(0.45)

      simRef.current = sim

      sim.on('tick', () => {
        const padX = NW / 2 + 12
        const padY = d => nodeH(d) / 2 + 12

        nodes.forEach(n => {
          n.x = Math.max(padX, Math.min(W - padX, n.x))
          n.y = Math.max(padY(n), Math.min(H - padY(n), n.y))
          posMap.current.set(n.id, { x: n.x, y: n.y })
        })

        nSel.attr('transform', d =>
          `translate(${(d.x - NW / 2).toFixed(1)}, ${(d.y - nodeH(d) / 2).toFixed(1)})`
        )

        lPath.attr('d', d => edgePath(d, W, H))
        lLabel.attr('transform', d => edgeLabelTransform(d, W, H))
      })
    }

    // Only draw once ResizeObserver gives us real dimensions
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      if (width > 4 && height > 4) draw(Math.floor(width), Math.floor(height))
    })
    ro.observe(container)

    return () => { ro.disconnect(); simRef.current?.stop() }
  }, [nodes, links])

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%', minHeight: 320 }}
    >
      {/* SVG sized only by D3 attrs — no CSS width/height to avoid coord-system scaling */}
      <svg
        ref={svgRef}
        style={{ position: 'absolute', top: 0, left: 0, display: 'block' }}
      />
    </div>
  )
}

// ── Path helpers ───────────────────────────────────────────────────────────────

function edgePath(d, W, H) {
  const sx = d.source.x ?? W / 2, sy = d.source.y ?? H / 2
  const tx = d.target.x ?? W / 2, ty = d.target.y ?? H / 2
  if (Math.abs(sx - tx) < 1 && Math.abs(sy - ty) < 1) {
    return `M${sx},${sy} C${sx + 55},${sy - 65} ${sx + 65},${sy + 20} ${sx + 8},${sy}`
  }
  const dx = tx - sx, dy = ty - sy
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = dx / len, ny = dy / len
  const th = nodeH(d.target) / 2
  const x1 = sx + nx * (NW / 2), y1 = sy + ny * (NH / 2)
  const x2 = tx - nx * (NW / 2 + 8), y2 = ty - ny * (th + 8)
  const cx = (sx + tx) / 2 - ny * 32, cy = (sy + ty) / 2 + nx * 32
  return `M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`
}

function edgeLabelTransform(d, W, H) {
  const sx = d.source.x ?? W / 2, sy = d.source.y ?? H / 2
  const tx = d.target.x ?? W / 2, ty = d.target.y ?? H / 2
  const mx = (sx + tx) / 2, my = (sy + ty) / 2
  const dx = tx - sx, dy = ty - sy
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ox = -dy / len * 22, oy = dx / len * 22
  return `translate(${(mx + ox).toFixed(1)}, ${(my + oy).toFixed(1)})`
}
