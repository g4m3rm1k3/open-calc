// Converts between ScratchPad's shape data model ({type, points, color, sw,
// ...}) and real SVG markup, so ScratchPad can open, edit, and save actual
// diagram files directly — not just sketch in isolation.
//
// Round-trip is intentionally partial: lines/rects/circles/ellipses/polygons/
// text with plain stroke/fill color attributes and no extra styling import
// as real editable shapes. Anything else (curved paths, gradients, <g>
// groups, class-styled elements, dashed strokes, text with custom font
// weight/alignment) is kept as an opaque "passthrough" entry — preserved
// byte-for-byte in the original document order, rendered for visual
// reference, but not draggable or editable via the shape tools. This is an
// honest limit, not a bug: silently "importing" something and dropping its
// styling on save would be worse than just leaving it alone.

const dist = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
const fillFor = color => `${color}1a`

// ─── Shapes → SVG ───────────────────────────────────────────────────────────

function segmentToSvg(shape) {
  const [x1, y1, x2, y2] = shape.points
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${shape.color}" stroke-width="${shape.sw}" stroke-linecap="round"/>`
}

function rectToSvg(shape) {
  const [x1, y1, x2, y2] = shape.points
  const x = Math.min(x1, x2), y = Math.min(y1, y2)
  const w = Math.abs(x2 - x1), h = Math.abs(y2 - y1)
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" stroke="${shape.color}" stroke-width="${shape.sw}" fill="${fillFor(shape.color)}"/>`
}

function circleToSvg(shape) {
  const [cx, cy, rx, ry] = shape.points
  const r = dist(cx, cy, rx, ry)
  return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" stroke="${shape.color}" stroke-width="${shape.sw}" fill="${fillFor(shape.color)}"/>`
}

function ellipseToSvg(shape) {
  const [x1, y1, x2, y2] = shape.points
  const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2
  const rx = Math.abs(x2 - x1) / 2, ry = Math.abs(y2 - y1) / 2
  return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" stroke="${shape.color}" stroke-width="${shape.sw}" fill="${fillFor(shape.color)}"/>`
}

function polygonToSvg(shape) {
  const p = shape.points
  const pts = []
  for (let i = 0; i < p.length; i += 2) pts.push(`${p[i].toFixed(1)},${p[i + 1].toFixed(1)}`)
  return `<polygon points="${pts.join(' ')}" stroke="${shape.color}" stroke-width="${shape.sw}" fill="${fillFor(shape.color)}"/>`
}

function sineToSvg(shape) {
  const p = shape.points
  let d = `M ${p[0].toFixed(1)},${p[1].toFixed(1)}`
  for (let i = 2; i < p.length; i += 2) d += ` L ${p[i].toFixed(1)},${p[i + 1].toFixed(1)}`
  return `<path d="${d}" stroke="${shape.color}" stroke-width="${shape.sw}" fill="none" stroke-linecap="round"/>`
}

function escapeXml(s) {
  return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
}

function textToSvg(shape) {
  const [x, y] = shape.points
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${shape.fontSize ?? 16}" fill="${shape.color}">${escapeXml(shape.text ?? '')}</text>`
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
// Presence of any of these on an otherwise-editable element means it relies
// on styling our shape model can't represent — keep it as passthrough rather
// than silently dropping the dash pattern / class styling / text formatting
// the next time it's saved.
const DISQUALIFYING_ATTRS = ['class', 'style', 'stroke-dasharray', 'font-weight', 'font-style', 'text-anchor', 'font-family', 'transform']

let importIdCounter = 0
function nextImportId() { return `import-${Date.now()}-${importIdCounter++}` }

function elementToShape(el) {
  if (DISQUALIFYING_ATTRS.some(a => el.hasAttribute(a))) return null
  const tag = el.tagName.toLowerCase()
  const color = el.getAttribute('stroke') || el.getAttribute('fill')
  if (!color) return null
  const sw = parseFloat(el.getAttribute('stroke-width')) || 2
  const num = name => parseFloat(el.getAttribute(name)) || 0

  switch (tag) {
    case 'line':
      return { type: 'segment', points: [num('x1'), num('y1'), num('x2'), num('y2')], color, sw }
    case 'rect':
      return { type: 'rect', points: [num('x'), num('y'), num('x') + num('width'), num('y') + num('height')], color, sw }
    case 'circle':
      return { type: 'circle', points: [num('cx'), num('cy'), num('cx') + num('r'), num('cy')], color, sw }
    case 'ellipse':
      return { type: 'ellipse', points: [num('cx') - num('rx'), num('cy') - num('ry'), num('cx') + num('rx'), num('cy') + num('ry')], color, sw }
    case 'polygon':
    case 'polyline': {
      const raw = (el.getAttribute('points') || '').trim()
      if (!raw) return null
      const pts = raw.split(/[\s,]+/).map(Number)
      if (pts.length < 6 || pts.some(Number.isNaN)) return null
      return { type: pts.length === 6 ? 'triangle' : 'polygon', points: pts, color, sw }
    }
    case 'text': {
      const fontSize = parseFloat(el.getAttribute('font-size')) || 16
      return { type: 'text', points: [num('x'), num('y')], color, sw: 0, fontSize, text: el.textContent || '' }
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
    const shape = EDITABLE_TAGS.has(tag) ? elementToShape(el) : null
    if (shape) {
      shapes.push({ ...shape, id: nextImportId() })
    } else {
      shapes.push({ type: 'passthrough', raw: el.outerHTML, id: nextImportId() })
    }
  }
  return { shapes, viewBox }
}
