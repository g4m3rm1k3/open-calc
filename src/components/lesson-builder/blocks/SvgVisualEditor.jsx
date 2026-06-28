import { useState, useRef, useEffect, useCallback, useReducer } from 'react'
import Moveable from 'react-moveable'

// ── Rounding helper ────────────────────────────────────────────────────────────
const r1 = v => Math.round(v * 10) / 10

// ── CSS-pixel → SVG-user-unit conversion ──────────────────────────────────────
function clientToSvg(svgEl, cx, cy) {
  const pt = svgEl.createSVGPoint()
  pt.x = cx; pt.y = cy
  return pt.matrixTransform(svgEl.getScreenCTM().inverse())
}

// ── Move any SVG element by (dx, dy) in SVG user units ────────────────────────
function applyTranslate(el, dx, dy) {
  const tag = el.tagName.toLowerCase()
  const ga = a => +(el.getAttribute(a) || 0)
  switch (tag) {
    case 'circle': case 'ellipse':
      el.setAttribute('cx', r1(ga('cx') + dx)); el.setAttribute('cy', r1(ga('cy') + dy)); break
    case 'rect': case 'text': case 'image': case 'use': case 'tspan':
      el.setAttribute('x', r1(ga('x') + dx)); el.setAttribute('y', r1(ga('y') + dy)); break
    case 'line':
      el.setAttribute('x1', r1(ga('x1') + dx)); el.setAttribute('y1', r1(ga('y1') + dy))
      el.setAttribute('x2', r1(ga('x2') + dx)); el.setAttribute('y2', r1(ga('y2') + dy)); break
    case 'polyline': case 'polygon': {
      const pts = (el.getAttribute('points') || '').trim().split(/[\s,]+/)
      const out = []
      for (let i = 0; i < pts.length - 1; i += 2)
        out.push(`${r1(+pts[i] + dx)},${r1(+pts[i + 1] + dy)}`)
      el.setAttribute('points', out.join(' ')); break
    }
    default: {
      const t = el.getAttribute('transform') || ''
      const m = t.match(/translate\(\s*([-\d.]+)[,\s]+([-\d.]+)\s*\)/)
      const tx = m ? +m[1] : 0, ty = m ? +m[2] : 0
      const rest = t.replace(/translate\([^)]*\)/g, '').trim()
      el.setAttribute('transform', `translate(${r1(tx + dx)},${r1(ty + dy)})${rest ? ' ' + rest : ''}`)
    }
  }
}

// ── Resize any SVG element ─────────────────────────────────────────────────────
function applyResize(el, dx, dy, svgW, svgH) {
  const tag = el.tagName.toLowerCase()
  const ga = a => +(el.getAttribute(a) || 0)
  switch (tag) {
    case 'rect':
      el.setAttribute('x', r1(ga('x') + dx)); el.setAttribute('y', r1(ga('y') + dy))
      el.setAttribute('width', r1(Math.max(1, svgW))); el.setAttribute('height', r1(Math.max(1, svgH))); break
    case 'circle':
      el.setAttribute('cx', r1(ga('cx') + dx)); el.setAttribute('cy', r1(ga('cy') + dy))
      el.setAttribute('r', r1(Math.max(1, Math.min(svgW, svgH) / 2))); break
    case 'ellipse':
      el.setAttribute('cx', r1(ga('cx') + dx)); el.setAttribute('cy', r1(ga('cy') + dy))
      el.setAttribute('rx', r1(Math.max(1, svgW / 2))); el.setAttribute('ry', r1(Math.max(1, svgH / 2))); break
    default:
      el.setAttribute('transform', `translate(${r1(dx)},${r1(dy)}) scale(${r1(svgW)},${r1(svgH)})`)
  }
}

// ── Rotate any SVG element ────────────────────────────────────────────────────
function applyRotate(el, deg, ox, oy) {
  const t = el.getAttribute('transform') || ''
  const rest = t.replace(/rotate\([^)]*\)/g, '').trim()
  el.setAttribute('transform', (rest ? rest + ' ' : '') + `rotate(${r1(deg)},${r1(ox)},${r1(oy)})`)
}

// ── Collect every interactive element (skip definition/meta tags) ─────────────
const SKIP_TAGS = new Set([
  'defs','style','title','desc','marker','symbol','clippath',
  'filter','lineargradient','radialgradient','stop','pattern','script',
])

function collectEls(svgRoot) {
  const list = []
  function walk(node) {
    for (const child of node.children) {
      const tag = child.tagName.toLowerCase()
      if (SKIP_TAGS.has(tag)) continue
      list.push(child)
      if (tag === 'g') walk(child)
    }
  }
  walk(svgRoot)
  return list
}

// ── Human-readable label for the layers panel ─────────────────────────────────
function elLabel(el) {
  const tag = el.tagName.toLowerCase()
  const ga = a => el.getAttribute(a) ?? ''
  if (tag === 'text') return `"${el.textContent.slice(0, 18)}"`
  if (tag === 'circle') return `r=${ga('r')}`
  if (tag === 'rect') return `${ga('width')}×${ga('height')}`
  if (tag === 'line') return `(${ga('x1')},${ga('y1')})→(${ga('x2')},${ga('y2')})`
  if (tag === 'ellipse') return `rx=${ga('rx')}`
  if (tag === 'g') { const id = ga('id'); return id ? `#${id}` : '' }
  if (tag === 'path') { const d = ga('d'); return d.slice(0, 14) }
  return ''
}

// ── SVG parse / serialize ─────────────────────────────────────────────────────
function parseXml(xml) {
  try {
    const doc = new DOMParser().parseFromString(xml, 'image/svg+xml')
    if (doc.querySelector('parsererror')) return null
    return doc
  } catch { return null }
}

function serializeDoc(doc) {
  return new XMLSerializer().serializeToString(doc.documentElement)
}

// ── ViewBox helper ────────────────────────────────────────────────────────────
function getViewBox(svgEl) {
  const vb = svgEl?.getAttribute('viewBox')
  if (!vb) return [0, 0, 560, 380]
  return vb.split(/\s+/).map(Number)
}

// ── Shape templates ───────────────────────────────────────────────────────────
function makeShape(type, svgEl) {
  const [,, W, H] = getViewBox(svgEl)
  const cx = r1(W / 2), cy = r1(H / 2)
  const sw = 2

  const shapes = {
    line:         `<line x1="${cx-80}" y1="${cy}" x2="${cx+80}" y2="${cy}" stroke="#1e3a5f" stroke-width="${sw}"/>`,
    dashed:       `<line x1="${cx-80}" y1="${cy}" x2="${cx+80}" y2="${cy}" stroke="#1e3a5f" stroke-width="${sw}" stroke-dasharray="8,4"/>`,
    dotted:       `<line x1="${cx-80}" y1="${cy}" x2="${cx+80}" y2="${cy}" stroke="#1e3a5f" stroke-width="${sw}" stroke-dasharray="2,4"/>`,
    arrow:        `<line x1="${cx-80}" y1="${cy}" x2="${cx+78}" y2="${cy}" stroke="#1e3a5f" stroke-width="${sw}" marker-end="url(#oc-arrow)"/>`,
    doublearrow:  `<line x1="${cx-78}" y1="${cy}" x2="${cx+78}" y2="${cy}" stroke="#1e3a5f" stroke-width="${sw}" marker-start="url(#oc-arrow-rev)" marker-end="url(#oc-arrow)"/>`,
    hguide:       `<line x1="0" y1="${cy}" x2="${W}" y2="${cy}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,4"/>`,
    vguide:       `<line x1="${cx}" y1="0" x2="${cx}" y2="${H}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,4"/>`,
    rect:         `<rect x="${cx-60}" y="${cy-40}" width="120" height="80" fill="#6366f155" stroke="#6366f1" stroke-width="${sw}"/>`,
    square:       `<rect x="${cx-50}" y="${cy-50}" width="100" height="100" fill="#6366f155" stroke="#6366f1" stroke-width="${sw}"/>`,
    circle:       `<circle cx="${cx}" cy="${cy}" r="50" fill="#f59e0b55" stroke="#f59e0b" stroke-width="${sw}"/>`,
    ellipse:      `<ellipse cx="${cx}" cy="${cy}" rx="80" ry="45" fill="#10b98155" stroke="#10b981" stroke-width="${sw}"/>`,
    right_tri:    `<polygon points="${cx-60},${cy+50} ${cx-60},${cy-50} ${cx+60},${cy+50}" fill="#6366f133" stroke="#6366f1" stroke-width="${sw}"/>`,
    iso_tri:      `<polygon points="${cx},${cy-60} ${cx-60},${cy+50} ${cx+60},${cy+50}" fill="#6366f133" stroke="#6366f1" stroke-width="${sw}"/>`,
    equil_tri:    `<polygon points="${cx},${cy-58} ${cx-50},${cy+29} ${cx+50},${cy+29}" fill="#6366f133" stroke="#6366f1" stroke-width="${sw}"/>`,
    parallelogram:`<polygon points="${cx-70},${cy+35} ${cx-40},${cy-35} ${cx+70},${cy-35} ${cx+40},${cy+35}" fill="#f59e0b33" stroke="#f59e0b" stroke-width="${sw}"/>`,
    rhombus:      `<polygon points="${cx},${cy-55} ${cx+55},${cy} ${cx},${cy+55} ${cx-55},${cy}" fill="#f59e0b33" stroke="#f59e0b" stroke-width="${sw}"/>`,
    trapezoid:    `<polygon points="${cx-40},${cy-35} ${cx+40},${cy-35} ${cx+70},${cy+35} ${cx-70},${cy+35}" fill="#f59e0b33" stroke="#f59e0b" stroke-width="${sw}"/>`,
    angle_mark:   `<path d="M ${cx-30},${cy} A 30,30 0 0,1 ${cx},${cy-30}" fill="none" stroke="#ef4444" stroke-width="${sw}"/>`,
    right_mark:   `<polyline points="${cx-25},${cy} ${cx-25},${cy-25} ${cx},${cy-25}" fill="none" stroke="#ef4444" stroke-width="${sw}"/>`,
    arc:          `<path d="M ${cx-60},${cy} A 60,60 0 0,1 ${cx+60},${cy}" fill="none" stroke="#6366f1" stroke-width="${sw}"/>`,
    text:         `<text x="${cx}" y="${cy}" text-anchor="middle" font-size="16" fill="#1e293b">Label</text>`,
    math_text:    `<text x="${cx}" y="${cy}" text-anchor="middle" font-size="16" fill="#1e293b" font-style="italic">f(x) = x²</text>`,
  }
  return shapes[type] ?? null
}

// Ensure arrowhead markers in <defs>
function ensureArrowMarkers(doc) {
  const svgEl = doc.documentElement
  let defs = svgEl.querySelector('defs')
  if (!defs) {
    defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs')
    svgEl.insertBefore(defs, svgEl.firstChild)
  }
  if (!defs.querySelector('#oc-arrow')) {
    defs.insertAdjacentHTML('beforeend',
      `<marker id="oc-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="#1e3a5f"/>
      </marker>
      <marker id="oc-arrow-rev" markerWidth="8" markerHeight="8" refX="2" refY="3" orient="auto">
        <path d="M8,0 L8,6 L0,3 z" fill="#1e3a5f"/>
      </marker>`)
  }
}

// ── Toolbar definition ─────────────────────────────────────────────────────────
const TOOLBAR = [
  { group: 'Lines', items: [
    { type: 'line',         label: '─',    title: 'Solid line' },
    { type: 'dashed',       label: '╌',    title: 'Dashed line' },
    { type: 'dotted',       label: '···',  title: 'Dotted line' },
    { type: 'arrow',        label: '→',    title: 'Arrow' },
    { type: 'doublearrow',  label: '↔',    title: 'Double arrow' },
    { type: 'hguide',       label: '─ ─',  title: 'Horizontal guide' },
    { type: 'vguide',       label: '│ │',  title: 'Vertical guide' },
  ]},
  { group: 'Shapes', items: [
    { type: 'rect',         label: '▭',   title: 'Rectangle' },
    { type: 'square',       label: '□',   title: 'Square' },
    { type: 'circle',       label: '○',   title: 'Circle' },
    { type: 'ellipse',      label: '⬭',   title: 'Ellipse' },
    { type: 'right_tri',    label: '◺',   title: 'Right triangle' },
    { type: 'iso_tri',      label: '△',   title: 'Isosceles triangle' },
    { type: 'equil_tri',    label: '▵',   title: 'Equilateral triangle' },
    { type: 'parallelogram',label: '▱',   title: 'Parallelogram' },
    { type: 'rhombus',      label: '◇',   title: 'Rhombus' },
    { type: 'trapezoid',    label: '⌓',   title: 'Trapezoid' },
  ]},
  { group: 'Angles', items: [
    { type: 'angle_mark',   label: '∠',   title: 'Angle arc' },
    { type: 'right_mark',   label: '⊾',   title: 'Right angle mark' },
    { type: 'arc',          label: '⌒',   title: 'Arc' },
  ]},
  { group: 'Text', items: [
    { type: 'text',         label: 'T',    title: 'Text label' },
    { type: 'math_text',    label: '∫',    title: 'Math text (italic)' },
  ]},
]

// ── Suggested attribute list per tag ──────────────────────────────────────────
const TAG_ATTRS = {
  rect:      ['x','y','width','height','rx','ry','fill','stroke','stroke-width','stroke-dasharray','opacity'],
  circle:    ['cx','cy','r','fill','stroke','stroke-width','stroke-dasharray','opacity'],
  ellipse:   ['cx','cy','rx','ry','fill','stroke','stroke-width','stroke-dasharray','opacity'],
  line:      ['x1','y1','x2','y2','stroke','stroke-width','stroke-dasharray','stroke-linecap','marker-end','marker-start','opacity'],
  polyline:  ['points','fill','stroke','stroke-width','stroke-dasharray','opacity'],
  polygon:   ['points','fill','stroke','stroke-width','stroke-dasharray','opacity'],
  path:      ['d','fill','stroke','stroke-width','stroke-dasharray','opacity','transform'],
  text:      ['x','y','font-size','font-weight','font-style','text-anchor','fill','opacity','transform'],
  g:         ['transform','opacity','fill','stroke'],
  image:     ['x','y','width','height','href','opacity'],
}

// ── Grid overlay — renders SVG-coordinate grid lines exactly over the SVG ─────
function GridOverlay({ svgEl, style }) {
  const vb = svgEl?.getAttribute('viewBox')
  if (!vb) return null
  const [vx, vy, vw, vh] = vb.split(/\s+/).map(Number)

  const STEP = 20
  const lines = []
  for (let x = Math.ceil(vx / STEP) * STEP; x <= vx + vw; x += STEP) {
    lines.push(
      <line key={`v${x}`} x1={x} y1={vy} x2={x} y2={vy + vh}
        stroke={x === 0 ? '#3b82f6' : '#30363d88'} strokeWidth={x % 100 === 0 ? 0.8 : 0.4} />,
      <text key={`vl${x}`} x={x + 1} y={vy + 9} fontSize={6} fill="#484f58">{x}</text>
    )
  }
  for (let y = Math.ceil(vy / STEP) * STEP; y <= vy + vh; y += STEP) {
    lines.push(
      <line key={`h${y}`} x1={vx} y1={y} x2={vx + vw} y2={y}
        stroke={y === 0 ? '#3b82f6' : '#30363d88'} strokeWidth={y % 100 === 0 ? 0.8 : 0.4} />,
      <text key={`hl${y}`} x={vx + 1} y={y - 1} fontSize={6} fill="#484f58">{y}</text>
    )
  }

  return (
    <svg
      style={{ display: 'block', pointerEvents: 'none', ...style }}
      viewBox={`${vx} ${vy} ${vw} ${vh}`}
      preserveAspectRatio="none"
    >
      {lines}
    </svg>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function SvgVisualEditor({ xml, dark, onChange, zoom = 1, onZoomChange }) {
  const docRef          = useRef(null)
  const svgContainerRef = useRef(null)
  const svgWrapperRef   = useRef(null)
  const canvasScrollRef = useRef(null)
  const svgElRef        = useRef(null)
  const moveableRef     = useRef(null)
  const historyStack    = useRef([])
  const zoomRef         = useRef(zoom)

  const [selectedIdx, setSelectedIdx] = useState(null)
  const [showLayers, setShowLayers]   = useState(true)
  const [showGrid, setShowGrid]       = useState(false)
  const [coords, setCoords]           = useState(null)
  const [svgPx, setSvgPx]            = useState({ w: 0, h: 0 })

  // docVersion bumps when the parsed doc changes → triggers SVG re-clone effect
  const [docVersion, setDocVersion]   = useState(0)
  // cloneReady bumps AFTER the SVG DOM is re-built → next render resolves
  // selectedRenderedEl from the fresh svgElRef, giving Moveable a live target
  const [, bumpCloneReady]            = useReducer(n => n + 1, 0)

  // Keep zoomRef current without triggering re-clone
  zoomRef.current = zoom

  // ── Parse incoming XML into docRef ────────────────────────────────────────
  useEffect(() => {
    const doc = parseXml(xml)
    if (!doc) return
    docRef.current = doc
    setDocVersion(v => v + 1)
  }, [xml])

  // ── Re-clone rendered SVG whenever doc or dark mode changes ───────────────
  useEffect(() => {
    const container = svgContainerRef.current
    const doc = docRef.current
    if (!container || !doc) return

    const clone = doc.documentElement.cloneNode(true)
    clone.removeAttribute('width'); clone.removeAttribute('height')
    const [,, vw, vh] = getViewBox(clone)
    const pxW = Math.round(vw * zoomRef.current)
    const pxH = Math.round(vh * zoomRef.current)
    clone.style.cssText = `display:block;overflow:visible;width:${pxW}px;height:${pxH}px`
    if (dark) clone.classList.add('dark')

    // Tag every interactive element; add a wide transparent sibling for thin
    // elements (lines, polylines, paths) so they're easy to click
    collectEls(clone).forEach((el, i) => {
      el.dataset.svgVizIdx = i
      el.style.cursor = 'pointer'

      const tag = el.tagName.toLowerCase()
      if (tag === 'line' || tag === 'polyline' || tag === 'path') {
        const hit = el.cloneNode(true)
        hit.dataset.svgVizIdx = i
        hit.setAttribute('stroke', 'transparent')
        hit.setAttribute('fill', 'transparent')
        hit.setAttribute('stroke-width', '14')
        hit.setAttribute('stroke-dasharray', 'none')
        hit.style.cursor = 'pointer'
        el.parentNode.insertBefore(hit, el)
      }
    })

    container.innerHTML = ''
    container.appendChild(clone)
    svgElRef.current = clone
    setSvgPx({ w: pxW, h: pxH })
    bumpCloneReady()
  }, [docVersion, dark])

  // ── Update SVG pixel dimensions when zoom changes (no re-clone needed) ──
  useEffect(() => {
    const svgEl = svgElRef.current
    if (!svgEl) return
    const [,, vw, vh] = getViewBox(svgEl)
    const w = Math.round(vw * zoom)
    const h = Math.round(vh * zoom)
    svgEl.style.width  = `${w}px`
    svgEl.style.height = `${h}px`
    setSvgPx({ w, h })
    requestAnimationFrame(() => moveableRef.current?.updateRect())
  }, [zoom])

  // ── Ctrl/Cmd + scroll to zoom (non-passive so we can preventDefault) ────────
  useEffect(() => {
    const el = canvasScrollRef.current
    if (!el) return
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const delta = e.deltaY < 0 ? 0.25 : -0.25
      onZoomChange?.(z => Math.max(0.25, Math.min(5, +(z + delta).toFixed(2))))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onZoomChange])

  // ── Resolve selected element from the live rendered SVG ──────────────────
  // Computed every render so it always reflects the current svgElRef.
  // After bumpCloneReady() triggers a re-render, this picks up the new clone.
  const selectedRenderedEl = (selectedIdx != null && svgElRef.current)
    ? svgElRef.current.querySelector(
        `[data-svg-viz-idx="${selectedIdx}"]:not([stroke="transparent"])`)
    : null

  // ── Source element list (mutable doc, for layer panel + property editing) ─
  const sourceEls = docRef.current ? collectEls(docRef.current.documentElement) : []

  // ── History ───────────────────────────────────────────────────────────────
  const pushHistory = useCallback(() => {
    if (!docRef.current) return
    historyStack.current = [...historyStack.current.slice(-30), serializeDoc(docRef.current)]
  }, [])

  const undo = useCallback(() => {
    const prev = historyStack.current.pop()
    if (!prev) return
    const doc = parseXml(prev)
    if (!doc) return
    docRef.current = doc
    setSelectedIdx(null)
    setDocVersion(v => v + 1)
    onChange?.(prev)
  }, [onChange])

  // ── Commit: serialize doc → call onChange → bump docVersion ───────────────
  const commit = useCallback(() => {
    if (!docRef.current) return
    const next = serializeDoc(docRef.current)
    onChange?.(next)
    setDocVersion(v => v + 1)
  }, [onChange])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.key === 'Delete' || e.key === 'Backspace')
          && selectedIdx != null
          && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault()
        pushHistory()
        sourceEls[selectedIdx]?.remove()
        setSelectedIdx(null)
        commit()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, selectedIdx, sourceEls, pushHistory, commit])

  // ── Click on canvas ───────────────────────────────────────────────────────
  const handleSvgClick = useCallback((e) => {
    const hit = e.target.closest('[data-svg-viz-idx]')
    if (!hit) { setSelectedIdx(null); return }
    setSelectedIdx(Number(hit.dataset.svgVizIdx))
  }, [])

  // ── Add shape ─────────────────────────────────────────────────────────────
  const addShape = useCallback((type) => {
    if (!docRef.current) return
    const svgEl = docRef.current.documentElement
    if (type === 'arrow' || type === 'doublearrow') ensureArrowMarkers(docRef.current)
    const markup = makeShape(type, svgEl)
    if (!markup) return
    const tmp = parseXml(`<svg xmlns="http://www.w3.org/2000/svg">${markup}</svg>`)
    if (!tmp) return
    const child = tmp.documentElement.firstElementChild
    if (!child) return
    pushHistory()
    svgEl.appendChild(docRef.current.adoptNode(child))
    const newIdx = collectEls(docRef.current.documentElement).length - 1
    setSelectedIdx(newIdx)
    commit()
  }, [pushHistory, commit])

  // ── SVG scale factor (CSS px per SVG user unit) ───────────────────────────
  const getSvgScale = useCallback(() => {
    const ctm = svgElRef.current?.getScreenCTM()
    return ctm ? { sx: ctm.a, sy: ctm.d } : { sx: 1, sy: 1 }
  }, [])

  // ── Moveable callbacks ────────────────────────────────────────────────────
  const handleDragEnd = useCallback(({ lastEvent }) => {
    if (!lastEvent || selectedIdx == null) return
    const { sx, sy } = getSvgScale()
    const [cssDx, cssDy] = lastEvent.beforeTranslate
    pushHistory()
    applyTranslate(sourceEls[selectedIdx], cssDx / sx, cssDy / sy)
    if (selectedRenderedEl) selectedRenderedEl.style.transform = ''
    commit()
  }, [selectedIdx, sourceEls, selectedRenderedEl, getSvgScale, pushHistory, commit])

  const handleResizeEnd = useCallback(({ target, lastEvent }) => {
    if (!lastEvent || selectedIdx == null) return
    const { sx, sy } = getSvgScale()
    const { width, height, drag: { beforeTranslate: [cdx, cdy] } } = lastEvent
    pushHistory()
    applyResize(sourceEls[selectedIdx], cdx / sx, cdy / sy, width / sx, height / sy)
    target.style.transform = ''; target.style.width = ''; target.style.height = ''
    commit()
  }, [selectedIdx, sourceEls, getSvgScale, pushHistory, commit])

  const handleRotateEnd = useCallback(({ target, lastEvent }) => {
    if (!lastEvent || selectedIdx == null || !svgElRef.current) return
    const rect = target.getBoundingClientRect()
    const origin = clientToSvg(svgElRef.current, rect.left + rect.width / 2, rect.top + rect.height / 2)
    pushHistory()
    applyRotate(sourceEls[selectedIdx], lastEvent.rotate, origin.x, origin.y)
    target.style.transform = ''
    commit()
  }, [selectedIdx, sourceEls, pushHistory, commit])

  // ── Properties panel editing ──────────────────────────────────────────────
  const setAttr = useCallback((attr, value) => {
    if (selectedIdx == null) return
    pushHistory()
    sourceEls[selectedIdx]?.setAttribute(attr, value)
    commit()
  }, [selectedIdx, sourceEls, pushHistory, commit])

  const setTextContent = useCallback((value) => {
    if (selectedIdx == null) return
    pushHistory()
    if (sourceEls[selectedIdx]) sourceEls[selectedIdx].textContent = value
    commit()
  }, [selectedIdx, sourceEls, pushHistory, commit])

  const deleteSelected = useCallback(() => {
    if (selectedIdx == null) return
    pushHistory()
    sourceEls[selectedIdx]?.remove()
    setSelectedIdx(null)
    commit()
  }, [selectedIdx, sourceEls, pushHistory, commit])

  // ── Properties data ───────────────────────────────────────────────────────
  const selSrcEl      = selectedIdx != null ? sourceEls[selectedIdx] : null
  const selTag        = selSrcEl?.tagName?.toLowerCase() ?? ''
  const knownAttrs    = TAG_ATTRS[selTag] ?? []
  const existingAttrs = selSrcEl
    ? Array.from(selSrcEl.attributes)
        .map(a => a.name)
        .filter(n => !['data-svg-viz-idx', 'style'].includes(n))
    : []
  const allAttrs = [...new Set([...knownAttrs, ...existingAttrs])]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-0 select-none">

      {/* Toolbar */}
      <div style={{ background: '#161b22', borderBottom: '1px solid #30363d' }}>
        <div className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto flex-wrap">
          {TOOLBAR.map(({ group, items }) => (
            <div key={group} className="flex items-center gap-0.5 shrink-0">
              <span className="text-[9px] font-black uppercase tracking-widest px-1"
                style={{ color: '#484f58' }}>{group}</span>
              {items.map(({ type, label, title }) => (
                <button key={type} onClick={() => addShape(type)} title={title}
                  className="w-7 h-7 flex items-center justify-center rounded text-sm font-bold transition-colors hover:bg-white/10"
                  style={{ color: '#c9d1d9', border: '1px solid #30363d', background: '#21262d' }}>
                  {label}
                </button>
              ))}
              <div className="w-px h-4 mx-0.5" style={{ background: '#30363d' }} />
            </div>
          ))}

          <div className="ml-auto flex items-center gap-1 shrink-0">
            <button onClick={() => setShowGrid(v => !v)}
              className="px-2 py-0.5 text-[10px] font-bold rounded"
              title="Toggle SVG coordinate grid (every 20 units)"
              style={{ background: showGrid ? '#22863a' : '#21262d', color: showGrid ? '#fff' : '#8b949e', border: '1px solid #30363d' }}>
              Grid
            </button>
            <button onClick={() => setShowLayers(v => !v)}
              className="px-2 py-0.5 text-[10px] font-bold rounded"
              style={{ background: showLayers ? '#1f6feb' : '#21262d', color: showLayers ? '#fff' : '#8b949e', border: '1px solid #30363d' }}>
              Layers
            </button>
            {historyStack.current.length > 0 && (
              <button onClick={undo} title="Undo ⌘Z"
                className="px-2 py-0.5 text-[10px] font-bold rounded"
                style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}>↩</button>
            )}
            {selectedIdx != null && (
              <button onClick={deleteSelected} title="Delete selected"
                className="px-2 py-0.5 text-[10px] font-bold rounded"
                style={{ background: '#3d1515', color: '#f87171', border: '1px solid #5a1a1a' }}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Main row: layers | canvas | properties */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Layers panel */}
        {showLayers && (
          <div className="flex flex-col shrink-0 overflow-y-auto"
            style={{ width: 148, background: '#0d1117', borderRight: '1px solid #30363d' }}>
            <div className="px-2 py-1 text-[9px] font-black uppercase tracking-widest shrink-0"
              style={{ color: '#484f58', borderBottom: '1px solid #21262d' }}>
              {sourceEls.length} elements
            </div>
            {sourceEls.map((el, i) => {
              const selected = i === selectedIdx
              return (
                <button key={i} onClick={() => setSelectedIdx(i)}
                  className="w-full text-left px-2 py-0.5 text-[11px] truncate transition-colors"
                  style={{
                    background: selected ? '#1f6feb22' : 'transparent',
                    color: selected ? '#58a6ff' : '#8b949e',
                    borderLeft: selected ? '2px solid #1f6feb' : '2px solid transparent',
                  }}>
                  <span className="font-mono text-[9px] mr-1"
                    style={{ color: selected ? '#79c0ff' : '#484f58' }}>
                    {el.tagName.toLowerCase()}
                  </span>
                  {elLabel(el)}
                </button>
              )
            })}
          </div>
        )}

        {/* SVG canvas — scroll container */}
        <div
          ref={canvasScrollRef}
          className="flex-1 min-w-0 overflow-auto"
          style={{ background: dark ? '#1e293b' : '#f1f5f9', position: 'relative' }}
        >
          {/* Inline-block wrapper — also the Moveable container so handles scroll with content */}
          <div ref={svgWrapperRef} style={{ display: 'inline-block', minWidth: '100%', minHeight: '100%', position: 'relative', padding: 24 }}>
            {/* SVG inject target */}
            <div
              ref={svgContainerRef}
              onClick={handleSvgClick}
              onMouseMove={(e) => {
                const svgEl = svgElRef.current
                if (!svgEl) return
                try {
                  const pt = clientToSvg(svgEl, e.clientX, e.clientY)
                  setCoords({ x: Math.round(pt.x * 10) / 10, y: Math.round(pt.y * 10) / 10 })
                } catch { /* ignore if SVG not yet mounted */ }
              }}
              onMouseLeave={() => setCoords(null)}
            />
            {/* Grid overlay — positioned exactly over the injected SVG */}
            {showGrid && svgElRef.current && svgPx.w > 0 && (
              <GridOverlay
                svgEl={svgElRef.current}
                style={{
                  position: 'absolute',
                  top: 24, left: 24,
                  width: svgPx.w, height: svgPx.h,
                  opacity: 0.8,
                }}
              />
            )}
          </div>

          {coords && (
            <div
              className="sticky bottom-2 text-[10px] font-mono pointer-events-none select-none"
              style={{ float: 'right', marginRight: 8, background: '#0d1117cc', color: '#58a6ff', padding: '2px 8px', borderRadius: 4, border: '1px solid #30363d' }}
            >
              x={coords.x}  y={coords.y}
            </div>
          )}
          {selectedRenderedEl && svgWrapperRef.current && (
            <Moveable
              ref={moveableRef}
              target={selectedRenderedEl}
              container={svgWrapperRef.current}
              draggable resizable rotatable
              throttleDrag={0} throttleResize={0} throttleRotate={1}
              onDrag={({ target, beforeTranslate: [dx, dy] }) => {
                target.style.transform = `translate(${dx}px,${dy}px)`
              }}
              onDragEnd={handleDragEnd}
              onResize={({ target, width, height, drag: { beforeTranslate: [dx, dy] } }) => {
                target.style.transform = `translate(${dx}px,${dy}px)`
                target.style.width = `${width}px`; target.style.height = `${height}px`
              }}
              onResizeEnd={handleResizeEnd}
              onRotate={({ target, rotate, drag: { beforeTranslate: [dx, dy] } }) => {
                target.style.transform = `translate(${dx}px,${dy}px) rotate(${rotate}deg)`
              }}
              onRotateEnd={handleRotateEnd}
              renderDirections={['nw','n','ne','w','e','sw','s','se']}
              zoom={1} origin
            />
          )}
        </div>

        {/* Properties panel — shown only when an element is selected */}
        {selSrcEl && (
          <div className="flex flex-col shrink-0 overflow-y-auto"
            style={{ width: 192, background: '#0d1117', borderLeft: '1px solid #30363d' }}>
            <div className="px-2 py-1 text-[9px] font-black uppercase tracking-widest shrink-0"
              style={{ color: '#484f58', borderBottom: '1px solid #21262d' }}>
              &lt;{selTag}&gt;
            </div>
            <div className="flex flex-col gap-0.5 p-1.5">
              {selTag === 'text' && (
                <div className="mb-1">
                  <div className="text-[9px] font-mono mb-0.5" style={{ color: '#484f58' }}>content</div>
                  <input value={selSrcEl.textContent ?? ''}
                    onChange={e => setTextContent(e.target.value)}
                    className="w-full px-1.5 py-0.5 text-[11px] font-mono rounded"
                    style={{ background: '#21262d', color: '#e6edf3', border: '1px solid #30363d' }} />
                </div>
              )}
              {allAttrs.map(attr => (
                <div key={attr}>
                  <div className="text-[9px] font-mono" style={{ color: '#484f58' }}>{attr}</div>
                  <input value={selSrcEl.getAttribute(attr) ?? ''}
                    onChange={e => setAttr(attr, e.target.value)}
                    className="w-full px-1.5 py-0.5 text-[11px] font-mono rounded"
                    style={{ background: '#21262d', color: '#e6edf3', border: '1px solid #30363d' }} />
                </div>
              ))}
              <button
                onClick={() => { const a = prompt('Attribute name?'); if (a) setAttr(a, '') }}
                className="mt-2 text-[10px] font-bold py-0.5 rounded"
                style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}>
                + attribute
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
