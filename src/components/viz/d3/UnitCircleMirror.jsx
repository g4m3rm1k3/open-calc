import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 500, H = 500
const CX = W / 2, CY = H / 2 + 30, R = 150

const COORDINATES = {
  '0':      { label: '0',       x: '1',           y: '0',           valX: 1,            valY: 0 },
  'π/6':    { label: 'π/6',     x: '√3/2',        y: '1/2',         valX: Math.sqrt(3)/2, valY: 0.5 },
  'π/4':    { label: 'π/4',     x: '√2/2',        y: '√2/2',        valX: Math.sqrt(2)/2, valY: Math.sqrt(2)/2 },
  'π/3':    { label: 'π/3',     x: '1/2',         y: '√3/2',        valX: 0.5,          valY: Math.sqrt(3)/2 },
  'π/2':    { label: 'π/2',     x: '0',           y: '1',           valX: 0,            valY: 1 }
}

const NOTABLE_ANGLES = [
  { a: 0,        l: '0',        d: '0°' },
  { a: Math.PI/6, l: 'π/6',     d: '30°' },
  { a: Math.PI/4, l: 'π/4',     d: '45°' },
  { a: Math.PI/3, l: 'π/3',     d: '60°' },
  { a: Math.PI/2, l: 'π/2',     d: '90°' },
  { a: 2*Math.PI/3, l: '2π/3',  d: '120°' },
  { a: 3*Math.PI/4, l: '3π/4',  d: '135°' },
  { a: 5*Math.PI/6, l: '5π/6',  d: '150°' },
  { a: Math.PI,    l: 'π',      d: '180°' },
  { a: 7*Math.PI/6, l: '7π/6',  d: '210°' },
  { a: 5*Math.PI/4, l: '5π/4',  d: '225°' },
  { a: 4*Math.PI/3, l: '4π/3',  d: '240°' },
  { a: 3*Math.PI/2, l: '3π/2',  d: '270°' },
  { a: 5*Math.PI/3, l: '5π/3',  d: '300°' },
  { a: 7*Math.PI/4, l: '7π/4',  d: '315°' },
  { a: 11*Math.PI/6, l: '11π/6', d: '330°' },
]

export default function UnitCircleMirror({ params }) {
  const svgRef = useRef(null)
  const [angle, setAngle] = useState(Math.PI / 3)
  const [mirrorMode, setMirrorMode] = useState(true)
  const [viewMode, setViewMode] = useState('both') // 'cos', 'sin', 'both', 'extended'
  const [unitMode, setUnitMode] = useState('rad') // 'rad', 'deg'
  const [showAll, setShowAll] = useState(false)
  const [solveQuery, setSolveQuery] = useState('') // e.g. "cos=0.5"

  // Snap to notable angles logic
  const handleSliderChange = (val) => {
    const norm = ((val % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    const closest = NOTABLE_ANGLES.reduce((prev, curr) => 
      Math.abs(curr.a - norm) < Math.abs(prev.a - norm) ? curr : prev
    )
    
    if (Math.abs(closest.a - norm) < 0.08) {
      setAngle(closest.a)
    } else {
      setAngle(val)
    }
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 0. Setup Math
    const normAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    const cosVal = Math.cos(normAngle)
    const sinVal = Math.sin(normAngle)
    const tanVal = Math.tan(normAngle)
    const cotVal = 1 / tanVal
    const secVal = 1 / cosVal
    const cscVal = 1 / sinVal

    // 0a. Solve Logic (Laser Beams & Intersections)
    let laserLine = null
    let intersections = []
    if (solveQuery.includes('=')) {
      const [func, valStr] = solveQuery.split('=').map(s => s.trim().toLowerCase())
      const val = parseFloat(valStr)
      if (!isNaN(val) && Math.abs(val) <= 1) {
        if (func === 'cos' || func === 'x') {
          // Cosine is X: Draw Vertical Laser
          laserLine = { x1: CX + R * val, x2: CX + R * val, y1: CY - R - 30, y2: CY + R + 30, color: '#10b981' }
          const yOff = Math.sqrt(1 - val * val)
          intersections = [
            { a: Math.acos(val), x: CX + R * val, y: CY - R * yOff },
            { a: 2 * Math.PI - Math.acos(val), x: CX + R * val, y: CY + R * yOff }
          ]
        } else if (func === 'sin' || func === 'y') {
          // Sine is Y: Draw Horizontal Laser
          laserLine = { x1: CX - R - 30, x2: CX + R + 30, y1: CY - R * val, y2: CY - R * val, color: '#f59e0b' }
          const xOff = Math.sqrt(1 - val * val)
          intersections = [
            { a: Math.asin(val), x: CX + R * xOff, y: CY - R * val },
            { a: Math.PI - Math.asin(val), x: CX - R * xOff, y: CY - R * val }
          ]
        }
      }
    }

    // Background Circle & Axes
    svg.append('circle').attr('cx', CX).attr('cy', CY).attr('r', R).attr('fill', 'none').attr('stroke', '#e2e8f0').attr('stroke-width', 2)
    
    // Laser Beam (Equation Slicer)
    if (laserLine) {
      svg.append('line')
        .attr('x1', laserLine.x1).attr('y1', laserLine.y1)
        .attr('x2', laserLine.x2).attr('y2', laserLine.y2)
        .attr('stroke', laserLine.color)
        .attr('stroke-width', 3)
        .attr('opacity', 0.6)
        .attr('stroke-dasharray', '8,4')
        .style('filter', 'drop-shadow(0 0 4px ' + laserLine.color + ')')
    }

    // Help lines (The "Wall" and "Ceiling")
    if (viewMode === 'extended') {
      // The Wall: x = 1
      svg.append('line').attr('x1', CX + R).attr('x2', CX + R).attr('y1', CY - R * 2).attr('y2', CY + R * 2).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '4,4')
      // The Ceiling: y = 1
      svg.append('line').attr('x1', CX - R * 2).attr('x2', CX + R * 2).attr('y1', CY - R).attr('y2', CY - R).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '4,4')
    }

    svg.append('line').attr('x1', CX - R - 30).attr('x2', CX + R + 30).attr('y1', CY).attr('y2', CY).attr('stroke', '#94a3b8').attr('stroke-width', 1).attr('stroke-dasharray', '2,2')
    svg.append('line').attr('x1', CX).attr('x2', CX).attr('y1', CY - R - 30).attr('y2', CY + R + 30).attr('stroke', '#94a3b8').attr('stroke-width', 1).attr('stroke-dasharray', '2,2')

    // Find the reference point (Quadrant 1 equivalent)
    let refAngle = normAngle
    const quad = Math.floor(normAngle / (Math.PI / 2)) % 4
    
    if (quad === 0) refAngle = normAngle
    else if (quad === 1) refAngle = Math.PI - normAngle
    else if (quad === 2) refAngle = normAngle - Math.PI
    else if (quad === 3) refAngle = 2 * Math.PI - normAngle

    // Draw reference triangles if in mirror mode
    if (mirrorMode) {
      const rx = CX + R * Math.cos(refAngle)
      const ry = CY - R * Math.sin(refAngle)
      
      // Mirror link (only if not already in Q1)
      if (quad !== 0) {
        svg.append('line')
          .attr('x1', CX + R * Math.cos(normAngle))
          .attr('y1', CY - R * Math.sin(normAngle))
          .attr('x2', rx)
          .attr('y2', ry)
          .attr('stroke', '#6366f1')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '4,4')
          .attr('opacity', 0.5)
      }

      svg.append('line').attr('x1', CX).attr('y1', CY).attr('x2', rx).attr('y2', ry).attr('stroke', '#94a3b8').attr('stroke-width', 1.5).attr('opacity', 0.2)
      svg.append('circle').attr('cx', rx).attr('cy', ry).attr('r', 4).attr('fill', '#94a3b8').attr('opacity', 0.4)
    }

    // 1. EXTENDED TRIG LOGIC (Secondary Functions)
    if (viewMode === 'extended') {
      const INF_CAP = 5 // Don't draw lines longer than 5 radii to avoid SVG crash

      // TANGENT & SECANT (BLUE/PURPLE)
      if (Math.abs(tanVal) < INF_CAP && Math.abs(cosVal) > 0.01) {
        // Tangent: (1, 0) to (1, tan)
        svg.append('line')
          .attr('x1', CX + R).attr('y1', CY)
          .attr('x2', CX + R).attr('y2', CY - R * tanVal)
          .attr('stroke', '#8b5cf6').attr('stroke-width', 3).attr('stroke-linecap', 'round')
        
        // Secant: (0,0) to (1, tan)
        svg.append('line')
          .attr('x1', CX).attr('y1', CY)
          .attr('x2', CX + R).attr('y2', CY - R * tanVal)
          .attr('stroke', '#6366f1').attr('stroke-width', 3).attr('stroke-dasharray', '5,3')
      }

      // COTANGENT & COSECANT (RED/PINK)
      if (Math.abs(cotVal) < INF_CAP && Math.abs(sinVal) > 0.01) {
        // Cotangent: (0, 1) to (cot, 1)
        svg.append('line')
          .attr('x1', CX).attr('y1', CY - R)
          .attr('x2', CX + R * cotVal).attr('y2', CY - R)
          .attr('stroke', '#ec4899').attr('stroke-width', 3).attr('stroke-linecap', 'round')

        // Cosecant: (0,0) to (cot, 1)
        svg.append('line')
          .attr('x1', CX).attr('y1', CY)
          .attr('x2', CX + R * cotVal).attr('y2', CY - R)
          .attr('stroke', '#f43f5e').attr('stroke-width', 3).attr('stroke-dasharray', '5,3')
      }
    }

    // 2. Notable Angles (Show All toggle)
    NOTABLE_ANGLES.forEach(n => {
      const isMatch = Math.abs(n.a - normAngle) < 0.01
      const nx = CX + R * Math.cos(n.a)
      const ny = CY - R * Math.sin(n.a)
      
      const dot = svg.append('circle')
        .attr('cx', nx)
        .attr('cy', ny)
        .attr('r', isMatch ? 5 : 3)
        .attr('fill', isMatch ? '#6366f1' : '#cbd5e1')
        .attr('opacity', showAll || isMatch ? 1 : 0.2)
        .style('cursor', 'pointer')
        .on('click', () => setAngle(n.a))

      if (showAll || isMatch) {
         const labelR = R + 25
         svg.append('text')
            .attr('x', CX + labelR * Math.cos(n.a))
            .attr('y', CY - labelR * Math.sin(n.a))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '10px')
            .attr('fill', isMatch ? '#6366f1' : '#94a3b8')
            .attr('font-weight', isMatch ? 'bold' : 'normal')
            .text(unitMode === 'rad' ? n.l : n.d)
      }
    })

    // 3. Laser Intersections (Illuminated Points)
    intersections.forEach(pt => {
      const g = svg.append('g').style('cursor', 'help')
      
      // Outer glow
      g.append('circle')
        .attr('cx', pt.x).attr('cy', pt.y).attr('r', 12)
        .attr('fill', laserLine.color).attr('opacity', 0.2)
        .append('animate')
          .attr('attributeName', 'r')
          .attr('values', '10;14;10')
          .attr('dur', '2s')
          .attr('repeatCount', 'indefinite')

      // Core dot
      g.append('circle')
        .attr('cx', pt.x).attr('cy', pt.y).attr('r', 6)
        .attr('fill', '#fff').attr('stroke', laserLine.color).attr('stroke-width', 2)

      // Hover Tooltip logic (simulated with SVG title or manual label)
      const normRad = ((pt.a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      const angleLabel = unitMode === 'rad' ? `${(normRad/Math.PI).toFixed(2)}π` : `${(normRad*180/Math.PI).toFixed(0)}°`
      const coordLabel = `(${getExact(Math.cos(pt.a))}, ${getExact(Math.sin(pt.a))})`

      g.on('mouseenter', (e) => {
        const tooltip = svg.append('g').attr('id', 'intersection-tooltip')
        const tx = pt.x + (pt.x > CX ? -100 : 20)
        const ty = pt.y + (pt.y > CY ? -50 : 20)
        
        tooltip.append('rect')
          .attr('x', tx).attr('y', ty).attr('width', 90).attr('height', 40).attr('rx', 4)
          .attr('fill', '#1e293b').attr('opacity', 0.9)
        
        tooltip.append('text')
          .attr('x', tx + 45).attr('y', ty + 15).attr('text-anchor', 'middle').attr('fill', 'white').attr('font-size', '10px')
          .text(angleLabel)
        tooltip.append('text')
          .attr('x', tx + 45).attr('y', ty + 30).attr('text-anchor', 'middle').attr('fill', laserLine.color).attr('font-size', '10px').attr('font-weight', 'bold')
          .text(coordLabel)
      }).on('mouseleave', () => {
        svg.select('#intersection-tooltip').remove()
      }).on('click', () => setAngle(pt.a))
    })

    // Main Angle Line (Radius 1)
    const px = CX + R * Math.cos(normAngle)
    const py = CY - R * Math.sin(normAngle)
    
    // Triangle Legs based on ViewMode
    if (viewMode === 'both' || viewMode === 'cos' || viewMode === 'extended') {
      svg.append('line').attr('x1', CX).attr('y1', CY).attr('x2', px).attr('y2', CY).attr('stroke', '#10b981').attr('stroke-width', 4).attr('stroke-linecap', 'round')
    }
    if (viewMode === 'both' || viewMode === 'sin' || viewMode === 'extended') {
      svg.append('line').attr('x1', px).attr('y1', CY).attr('x2', px).attr('y2', py).attr('stroke', '#f59e0b').attr('stroke-width', 4).attr('stroke-linecap', 'round')
    }
    
    svg.append('line').attr('x1', CX).attr('y1', CY).attr('x2', px).attr('y2', py).attr('stroke', '#1e293b').attr('stroke-width', 4).attr('stroke-linecap', 'round')

    // Active Point
    svg.append('circle').attr('cx', px).attr('cy', py).attr('r', 8).attr('fill', '#1e293b').attr('stroke', 'white').attr('stroke-width', 2)

    // COORDINATE CALCULATION
    let coordText = "???"
    
    const families = [
        { name: '0', ref: 0 },
        { name: 'π/6', ref: Math.PI/6 },
        { name: 'π/4', ref: Math.PI/4 },
        { name: 'π/3', ref: Math.PI/3 },
        { name: 'π/2', ref: Math.PI/2 }
    ]
    
    const family = families.find(f => Math.abs(Math.sin(refAngle) - Math.abs(Math.sin(f.ref))) < 0.01)
    
    if (family) {
        const base = COORDINATES[family.name]
        const signX = cosVal < -0.01 ? '−' : ''
        const signY = sinVal < -0.01 ? '−' : ''
        const xDisp = base.x === '0' ? '0' : base.x === '1' ? (cosVal < 0 ? '−1' : '1') : (signX + base.x)
        const yDisp = base.y === '0' ? '0' : base.y === '1' ? (sinVal < 0 ? '−1' : '1') : (signY + base.y)
        
        if (viewMode === 'cos') coordText = `cos θ = ${xDisp}`
        else if (viewMode === 'sin') coordText = `sin θ = ${yDisp}`
        else if (viewMode === 'extended') {
          // Compact extended view label
          coordText = `(cos: ${xDisp}, sin: ${yDisp})`
        }
        else coordText = `(${xDisp}, ${yDisp})`
    } else {
        coordText = `(${cosVal.toFixed(2)}, ${sinVal.toFixed(2)})`
    }

    // Coordinate label position (Fixed Z-index & Padding)
    const offset = 35
    let lx = px + (cosVal > 0 ? offset : -offset)
    let ly = py + (sinVal > 0 ? -offset : offset)

    // Bound the label within the SVG frame
    const labelW = 140, labelH = 40
    if (cosVal > 0) {
      if (lx + labelW > W - 10) lx = W - labelW - 10
    } else {
      if (lx - labelW < 10) lx = labelW + 10
    }
    if (ly - labelH / 2 < 10) ly = labelH / 2 + 10
    if (ly + labelH / 2 > H - 10) ly = H - labelH / 2 - 10

    const labelGroup = svg.append('g')
        .attr('transform', `translate(${lx}, ${ly})`)
        .attr('class', 'coordinate-label-group')

    labelGroup.append('rect')
        .attr('x', cosVal > 0 ? -10 : -130)
        .attr('y', -20)
        .attr('width', 140)
        .attr('height', 40)
        .attr('rx', 8)
        .attr('fill', 'white')
        .attr('fill-opacity', 0.98)
        .attr('stroke', '#1e293b')
        .attr('stroke-width', 2)
        .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))')

    labelGroup.append('text')
        .attr('x', cosVal > 0 ? 60 : -60)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#1e293b')
        .attr('font-weight', 'bold')
        .attr('font-size', '14px')
        .text(coordText)

    // Ensure ALL floating UI elements are raised to the top layer
    svg.selectAll('.coordinate-label-group').raise()
    svg.select('#intersection-tooltip').raise()

  }, [angle, mirrorMode, viewMode, unitMode, showAll, solveQuery])

  const getExact = (val, type) => {
    const abs = Math.abs(val)
    const sign = val < -0.01 ? '−' : ''
    if (abs < 0.01) return '0'
    if (Math.abs(abs - 0.5) < 0.01) return sign + '1/2'
    if (Math.abs(abs - Math.sqrt(2)/2) < 0.01) return sign + '√2/2'
    if (Math.abs(abs - Math.sqrt(3)/2) < 0.01) return sign + '√3/2'
    if (Math.abs(abs - 1) < 0.01) return sign + '1'
    if (Math.abs(abs - Math.sqrt(3)) < 0.01) return sign + '√3'
    if (Math.abs(abs - 1/Math.sqrt(3)) < 0.01) return sign + '√3/3'
    if (abs > 10) return '∞'
    return val.toFixed(3)
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col justify-center items-center bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-inner min-h-[520px]">
           <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W }} />
           
           <div className="w-full max-w-sm mt-8 space-y-4">
              <SliderControl 
                min={0} max={2*Math.PI} step={0.01} 
                value={angle} 
                onChange={handleSliderChange}
                label="Slide to Rotate"
                format={(v) => {
                    const norm = ((v % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI)
                    const n = NOTABLE_ANGLES.find(a => Math.abs(a.a - norm) < 0.05)
                    if (unitMode === 'deg') return n ? n.d : `${((norm * 180) / Math.PI).toFixed(0)}°`
                    return n ? n.l : `${(norm / Math.PI).toFixed(2)}π`
                }}
              />
              
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Solve: cos=0.5 or sin=0.5"
                  className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 text-sm font-mono text-slate-700 dark:text-slate-200 shadow-sm"
                  value={solveQuery}
                  onChange={e => setSolveQuery(e.target.value)}
                />
                <div className="absolute right-3 top-2.5 text-indigo-400 group-hover:text-indigo-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                  </svg>
                </div>
              </div>
           </div>
        </div>
        
        <div className="w-full lg:w-80 space-y-6">
          <section>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">6-Function Dashboard</h4>
            <div className="grid grid-cols-2 gap-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm font-mono">
              {[
                { f: 'sin', c: 'text-amber-500', v: Math.sin(angle) },
                { f: 'cos', c: 'text-emerald-500', v: Math.cos(angle) },
                { f: 'tan', c: 'text-violet-500', v: Math.tan(angle) },
                { f: 'cot', c: 'text-pink-500', v: 1/Math.tan(angle) },
                { f: 'sec', c: 'text-indigo-500', v: 1/Math.cos(angle) },
                { f: 'csc', c: 'text-rose-500', v: 1/Math.sin(angle) }
              ].map(x => (
                <div key={x.f} className="flex flex-col p-1.5 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-400">{x.f} θ</span>
                  <span className={`text-xs font-bold ${x.c}`}>{getExact(x.v, x.f)}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">View Perspective</h4>
            <div className="grid grid-cols-2 gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                {[
                  { id: 'both', label: '(X, Y)' },
                  { id: 'cos', label: 'X only' },
                  { id: 'sin', label: 'Y only' },
                  { id: 'extended', label: 'Extended' }
                ].map(m => (
                    <button 
                        key={m.id}
                        onClick={() => setViewMode(m.id)}
                        className={`py-1.5 text-[10px] uppercase font-bold rounded ${viewMode === m.id ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'}`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>
          </section>

          {viewMode === 'extended' && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Tangent (Vertical Wall)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 border border-dashed border-slate-400" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Secant (Extended Radius)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Cotangent (Horizontal Ceiling)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 border border-dashed border-slate-400" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Cosecant (Extended Radius)</span>
                </div>
            </div>
          )}


          <section>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Unit System</h4>
            <div className="flex gap-2">
                <button 
                    onClick={() => setUnitMode('rad')}
                    className={`flex-1 py-2 text-xs font-semibold border rounded-lg transition-all ${unitMode === 'rad' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'}`}
                >
                    Radians (π)
                </button>
                <button 
                    onClick={() => setUnitMode('deg')}
                    className={`flex-1 py-2 text-xs font-semibold border rounded-lg transition-all ${unitMode === 'deg' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'}`}
                >
                    Degrees (°)
                </button>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Visualization Toggles</h4>
            
            <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-300 transition-colors">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Mirror Mode</span>
                    <span className="text-[10px] text-slate-500">Reflection path to Quadrant 1</span>
                </div>
                <input type="checkbox" checked={mirrorMode} onChange={e => setMirrorMode(e.target.checked)} className="w-5 h-5 accent-indigo-600" />
            </label>

            <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-300 transition-colors">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Show All Points</span>
                    <span className="text-[10px] text-slate-500">Display labels for all families</span>
                </div>
                <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} className="w-5 h-5 accent-indigo-600" />
            </label>
          </section>

          <section>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Quick Coordinate Lookup</h4>
            <div className="grid grid-cols-2 gap-2">
                {Object.entries(COORDINATES).map(([label, coord]) => {
                    const target = NOTABLE_ANGLES.find(n => n.l === label).a
                    const isActive = Math.abs(angle % (Math.PI/2) - target) < 0.01
                    return (
                        <button 
                            key={label}
                            onClick={() => setAngle(target)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                                isActive 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                            }`}
                        >
                            <span className="text-[10px] opacity-80">{unitMode === 'rad' ? label : NOTABLE_ANGLES.find(n => n.l === label).d}</span>
                            <span className="text-xs font-bold tracking-tighter">({coord.x}, {coord.y})</span>
                        </button>
                    )
                })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

