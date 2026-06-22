// Converts between ScratchPad's shape data model ({type, points, color, sw,
// ...}) and real SVG markup, so ScratchPad can open, edit, and save actual
// diagram files directly — not just sketch in isolation.
//
// Import is broad: dashed strokes, class-styled elements (color resolved
// from the file's own <style> block), and inline style="fill:...;stroke:..."
// all import as real editable shapes now, not just plain-attribute ones.
// The only things still kept as "passthrough" (visible for reference, not
// draggable/editable) are ones that genuinely can't be represented without
// losing information: curved <path>s, <g> groups, gradients, and class
// styling this couldn't resolve to a literal color. Dark-mode-responsive
// class styling on an *edited* element will bake in to its current resolved
// color rather than keep switching with the theme — an honest trade-off for
// making it draggable at all, not a silent loss.

const dist = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
const fillFor = color => `${color}1a`
// Prefer a captured/explicit fill (real diagrams' independent fill colors)
// over the auto-tinted-from-stroke approximation, which is only meant for
// hand-drawn shapes that never had a real fill to begin with.
const fillAttr = shape => shape.fill ?? fillFor(shape.color)
const dashAttr = shape => (shape.dash?.length ? ` stroke-dasharray="${shape.dash.join(',')}"` : '')
const rxAttr = shape => (shape.rx ? ` rx="${shape.rx.toFixed(1)}"` : '')

// ─── Shapes → SVG ───────────────────────────────────────────────────────────

function segmentToSvg(shape) {
  const [x1, y1, x2, y2] = shape.points
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${shape.color}" stroke-width="${shape.sw}" stroke-linecap="round"${dashAttr(shape)}/>`
}

function rectToSvg(shape) {
  const [x1, y1, x2, y2] = shape.points
  const x = Math.min(x1, x2), y = Math.min(y1, y2)
  const w = Math.abs(x2 - x1), h = Math.abs(y2 - y1)
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" stroke="${shape.color}" stroke-width="${shape.sw}" fill="${fillAttr(shape)}"${rxAttr(shape)}${dashAttr(shape)}/>`
}

function circleToSvg(shape) {
  const [cx, cy, rx, ry] = shape.points
  const r = dist(cx, cy, rx, ry)
  return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" stroke="${shape.color}" stroke-width="${shape.sw}" fill="${fillAttr(shape)}"${dashAttr(shape)}/>`
}

function ellipseToSvg(shape) {
  const [x1, y1, x2, y2] = shape.points
  const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2
  const rx = Math.abs(x2 - x1) / 2, ry = Math.abs(y2 - y1) / 2
  return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" stroke="${shape.color}" stroke-width="${shape.sw}" fill="${fillAttr(shape)}"${dashAttr(shape)}/>`
}

function polygonToSvg(shape) {
  const p = shape.points
  const pts = []
  for (let i = 0; i < p.length; i += 2) pts.push(`${p[i].toFixed(1)},${p[i + 1].toFixed(1)}`)
  return `<polygon points="${pts.join(' ')}" stroke="${shape.color}" stroke-width="${shape.sw}" fill="${fillAttr(shape)}"${dashAttr(shape)}/>`
}

function sineToSvg(shape) {
  const p = shape.points
  let d = `M ${p[0].toFixed(1)},${p[1].toFixed(1)}`
  for (let i = 2; i < p.length; i += 2) d += ` L ${p[i].toFixed(1)},${p[i + 1].toFixed(1)}`
  return `<path d="${d}" stroke="${shape.color}" stroke-width="${shape.sw}" fill="none" stroke-linecap="round"${dashAttr(shape)}/>`
}

function escapeXml(s) {
  return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
}

function textToSvg(shape) {
  const [x, y] = shape.points
  const extra = [
    shape.fontWeight ? ` font-weight="${shape.fontWeight}"` : '',
    shape.fontStyle ? ` font-style="${shape.fontStyle}"` : '',
    shape.fontFamily ? ` font-family="${escapeXml(shape.fontFamily)}"` : '',
    shape.textAnchor ? ` text-anchor="${shape.textAnchor}"` : '',
    shape.rotation ? ` transform="rotate(${shape.rotation} ${x.toFixed(1)} ${y.toFixed(1)})"` : '',
  ].join('')
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${shape.fontSize ?? 16}" fill="${shape.color}"${extra}>${escapeXml(shape.text ?? '')}</text>`
}

function passthroughToSvg(shape) {
  return shape.raw ?? ''
}

const CONVERTERS = {
  segment: segmentToSvg,
  rect: rectToSvg,
  circle: circleToSvg,
  ellipse: ellipseToSvg,
  triangle: polygonToSvg,
  polygon: polygonToSvg,
  sine: sineToSvg,
  text: textToSvg,
  passthrough: passthroughToSvg,
}

// Returns an array of element strings, one per shape, in array order
// (preserving relative document/layering order), skipping unknown types.
export function shapesToSvgElements(shapes) {
  return shapes
    .map(s => CONVERTERS[s.type]?.(s))
    .filter(Boolean)
}

// Inserts the given shapes as new elements just before </svg> in an existing
// SVG source string, without touching anything already there.
export function mergeShapesIntoSvg(xml, shapes) {
  const elements = shapesToSvgElements(shapes)
  if (!elements.length) return xml
  const fragment = '\n  ' + elements.join('\n  ') + '\n'
  const closeTagIndex = xml.lastIndexOf('</svg>')
  if (closeTagIndex === -1) return xml
  return xml.slice(0, closeTagIndex) + fragment + xml.slice(closeTagIndex)
}

// Assembles a complete, standalone <svg> document from a shape array — used
// for "Save to project" / "Download" when ScratchPad is the only source of
// truth for the file (a brand-new diagram, or one fully replaced by import).
export function buildSvgDocument(shapes, viewBox = '0 0 720 480') {
  const elements = shapesToSvgElements(shapes)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">\n  ${elements.join('\n  ')}\n</svg>\n`
}

// ─── SVG → shapes (import) ──────────────────────────────────────────────────

const EDITABLE_TAGS = new Set(['line', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'text'])
// Only things we genuinely can't represent without losing information stay
// disqualifying. transform is allowed for <text> when it's a plain
// rotate(deg, x, y) around the text's own anchor (anything else — translate,
// scale, matrix, or a pivot that doesn't match the element's own position —
// can't be mapped onto a single `rotation` field safely).
const DISQUALIFYING_ATTRS = []

// Look up ONE class's light-mode fill/stroke from the document's own
// <style> block (e.g. `.svg-text { fill: #1e3a5f; }`), skipping `.dark .x`
// overrides. Best-effort: a regex scan of the CSS text, not a real parser —
// good enough for the simple `.name { decl: val; }` rules these diagrams
// actually use.
function resolveOneClass(css, className) {
  const re = new RegExp(`(?<!\\.dark\\s+)\\.${className}\\s*\\{([^}]*)\\}`)
  const m = css.match(re)
  if (!m) return {}
  const decl = m[1]
  const fillM = decl.match(/fill:\s*([^;]+);?/)
  const strokeM = decl.match(/stroke:\s*([^;]+);?/)
  return { fill: fillM?.[1]?.trim(), stroke: strokeM?.[1]?.trim() }
}

// `class` is often more than one space-separated name (e.g.
// class="svg-panel svg-div", combining a fill-only rule with a
// stroke-only rule) — treating the whole attribute as one literal class
// name (the original implementation) never matches anything for multi-class
// elements, silently falling back to passthrough for every one of them.
// Resolve each class separately and merge, first class with a usable value
// for a given property wins.
function resolveClassColor(svgDoc, classAttr) {
  const styleEl = svgDoc.querySelector('style')
  if (!styleEl || !classAttr) return {}
  const css = styleEl.textContent || ''
  const result = {}
  for (const className of classAttr.trim().split(/\s+/)) {
    const { fill, stroke } = resolveOneClass(css, className)
    if (fill && result.fill === undefined) result.fill = fill
    if (stroke && result.stroke === undefined) result.stroke = stroke
  }
  return result
}

// Parse inline style="fill:...;stroke:...;" — same idea, simpler source.
function parseInlineStyle(styleText) {
  if (!styleText) return {}
  const fillM = styleText.match(/fill:\s*([^;]+);?/)
  const strokeM = styleText.match(/stroke:\s*([^;]+);?/)
  return { fill: fillM?.[1]?.trim(), stroke: strokeM?.[1]?.trim() }
}

// Resolve an element's effective stroke/fill from (in priority order)
// literal attributes, inline style=, and class-resolved CSS — so
// class="svg-text" and style="fill:none" elements become editable instead
// of unconditionally falling to passthrough.
function resolveColor(el, svgDoc) {
  const fromStyle = parseInlineStyle(el.getAttribute('style'))
  const fromClass = resolveClassColor(svgDoc, el.getAttribute('class'))
  const stroke = el.getAttribute('stroke') || fromStyle.stroke || fromClass.stroke
  const fill = el.getAttribute('fill') || fromStyle.fill || fromClass.fill
  const usable = v => v && v !== 'none'
  return usable(stroke) ? stroke : (usable(fill) ? fill : null)
}

// Real diagrams often use an independent fill, unrelated to the stroke
// color (e.g. a pastel box fill="#eff6ff" with a saturated stroke="#3b82f6")
// — resolveColor() above prioritizes stroke as the shape's main "color" and
// only falls back to fill when there's no stroke at all, so it can't be
// reused here. This always captures the literal fill verbatim when present,
// so it can be preserved exactly instead of being replaced by the
// auto-tinted-from-stroke approximation used for hand-drawn shapes.
function resolveFill(el, svgDoc) {
  const fromStyle = parseInlineStyle(el.getAttribute('style'))
  const fromClass = resolveClassColor(svgDoc, el.getAttribute('class'))
  const fill = el.getAttribute('fill') || fromStyle.fill || fromClass.fill
  return (fill && fill !== 'none') ? fill : null
}

function parseDash(el) {
  const raw = el.getAttribute('stroke-dasharray')
  if (!raw) return null
  const nums = raw.split(/[\s,]+/).map(Number).filter(n => !Number.isNaN(n))
  return nums.length ? nums : null
}

// Only accept transform="rotate(deg, x, y)" where x,y match the element's
// own anchor (within rounding) — anything else (translate/scale/matrix, or
// a pivot elsewhere) can't be represented by a single rotation field without
// silently shifting the element, so it's left disqualifying for those cases.
function parseSimpleRotation(el, anchorX, anchorY) {
  const t = (el.getAttribute('transform') || '').trim()
  if (!t) return 0
  const m = t.match(/^rotate\(\s*(-?[\d.]+)(?:[\s,]+(-?[\d.]+)[\s,]+(-?[\d.]+))?\s*\)$/)
  if (!m) return null // unrecognized/compound transform — caller should disqualify
  const deg = Number(m[1])
  if (m[2] == null) return deg // rotate(deg) with no pivot given — treat as own-anchor
  const cx = Number(m[2]), cy = Number(m[3])
  return (Math.abs(cx - anchorX) < 0.5 && Math.abs(cy - anchorY) < 0.5) ? deg : null
}

let importIdCounter = 0
function nextImportId() { return `import-${Date.now()}-${importIdCounter++}` }

function elementToShape(el, svgDoc) {
  const tag = el.tagName.toLowerCase()
  const color = resolveColor(el, svgDoc)
  if (!color) return null
  const sw = parseFloat(el.getAttribute('stroke-width')) || 2
  const dash = parseDash(el)
  const fill = resolveFill(el, svgDoc)
  const num = name => parseFloat(el.getAttribute(name)) || 0

  switch (tag) {
    case 'line':
      return { type: 'segment', points: [num('x1'), num('y1'), num('x2'), num('y2')], color, sw, dash }
    case 'rect':
      return { type: 'rect', points: [num('x'), num('y'), num('x') + num('width'), num('y') + num('height')], color, sw, dash, fill, rx: num('rx') }
    case 'circle':
      return { type: 'circle', points: [num('cx'), num('cy'), num('cx') + num('r'), num('cy')], color, sw, dash, fill }
    case 'ellipse':
      return { type: 'ellipse', points: [num('cx') - num('rx'), num('cy') - num('ry'), num('cx') + num('rx'), num('cy') + num('ry')], color, sw, dash, fill }
    case 'polygon':
    case 'polyline': {
      const raw = (el.getAttribute('points') || '').trim()
      if (!raw) return null
      const pts = raw.split(/[\s,]+/).map(Number)
      if (pts.length < 6 || pts.some(Number.isNaN)) return null
      return { type: pts.length === 6 ? 'triangle' : 'polygon', points: pts, color, sw, dash, fill }
    }
    case 'text': {
      const x = num('x'), y = num('y')
      const rotation = parseSimpleRotation(el, x, y)
      if (rotation === null) return null // compound/mismatched transform — keep as passthrough
      const fontSize = parseFloat(el.getAttribute('font-size')) || 16
      const shape = { type: 'text', points: [x, y], color, sw: 0, fontSize, text: el.textContent || '', rotation }
      const fontWeight = el.getAttribute('font-weight'); if (fontWeight) shape.fontWeight = fontWeight
      const fontStyle = el.getAttribute('font-style'); if (fontStyle) shape.fontStyle = fontStyle
      const fontFamily = el.getAttribute('font-family'); if (fontFamily) shape.fontFamily = fontFamily
      const textAnchor = el.getAttribute('text-anchor'); if (textAnchor) shape.textAnchor = textAnchor
      return shape
    }
    default:
      return null
  }
}

// Parses an SVG source string into a ScratchPad shape array. Every top-level
// child of the root <svg> becomes exactly one array entry, in document
// order, either as a real editable shape or a passthrough — so nothing from
// the original file is ever silently dropped, and re-exporting via
// shapesToSvgElements reproduces the same element order.
export function parseSvgToShapes(xml) {
  const doc = new DOMParser().parseFromString(xml, 'image/svg+xml')
  const svgEl = doc.querySelector('svg')
  if (!svgEl || doc.querySelector('parsererror')) return { shapes: [], viewBox: '' }
  const viewBox = svgEl.getAttribute('viewBox') || ''

  const shapes = []
  for (const el of Array.from(svgEl.children)) {
    const tag = el.tagName.toLowerCase()
    const shape = EDITABLE_TAGS.has(tag) ? elementToShape(el, doc) : null
    if (shape) {
      shapes.push({ ...shape, id: nextImportId() })
    } else {
      shapes.push({ type: 'passthrough', raw: el.outerHTML, id: nextImportId() })
    }
  }
  return { shapes, viewBox }
}
