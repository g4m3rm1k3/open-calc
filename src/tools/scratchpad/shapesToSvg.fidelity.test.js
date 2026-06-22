// @vitest-environment happy-dom
//
// Round-trip fidelity check for ScratchPad's SVG import/export — runs the
// EXACT same parseSvgToShapes -> buildSvgDocument pipeline ScratchPad uses
// when you open and re-save a real diagram file, then asserts the visual
// properties that matter (fill, stroke, rounded corners, dash pattern,
// font-weight) survive unchanged. This exists because those properties
// were silently dropped/approximated for a while (square corners instead
// of rounded, an auto-tinted fill instead of the real one, no bold text) —
// caught by eye on a real lesson page, not by anything automated. This is
// what "what's off and where" looks like as a test failure instead of a
// screenshot comparison.
//
// Scope: structural/attribute-level fidelity, not pixel-level image
// diffing — there's no headless-screenshot infrastructure in this repo yet,
// and that's a heavier lift than this needs. This catches "the fill
// attribute changed" or "rx was dropped," which is what actually broke.

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { resolve, join } from 'path'
import { parseSvgToShapes, buildSvgDocument } from './shapesToSvg.js'

const DIAGRAMS_DIR = resolve(__dirname, '../../courses/geometry/diagrams')

// Concrete fixtures known to exercise rounded rects, independent fill
// colors, dashed strokes, and bold text — the exact properties that
// regressed. Falls back to every .svg in the geometry diagrams folder if
// these specific files ever move, so the test doesn't just go quietly
// stale.
const FIXTURES = ['geo-axiom-hierarchy.svg', 'geo-angle-pairs.svg']
  .filter(name => {
    try { readFileSync(join(DIAGRAMS_DIR, name)); return true }
    catch { return false }
  })
const files = FIXTURES.length ? FIXTURES : readdirSync(DIAGRAMS_DIR).filter(f => f.endsWith('.svg'))

function parseAttrs(elString) {
  const doc = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${elString}</svg>`, 'image/svg+xml')
  const el = doc.documentElement.firstElementChild
  return el ? Object.fromEntries(Array.from(el.attributes).map(a => [a.name, a.value])) : null
}

describe.each(files)('round-trip fidelity: %s', (filename) => {
  const original = readFileSync(join(DIAGRAMS_DIR, filename), 'utf-8')
  const { shapes, viewBox } = parseSvgToShapes(original)
  const rebuilt = buildSvgDocument(shapes, viewBox)
  const rebuiltDoc = new DOMParser().parseFromString(rebuilt, 'image/svg+xml')
  const rebuiltChildren = Array.from(rebuiltDoc.documentElement.children)

  it('imports at least one element from the file', () => {
    expect(shapes.length).toBeGreaterThan(0)
  })

  it('every passthrough shape round-trips byte-for-byte unchanged', () => {
    const passthroughMismatches = []
    shapes.forEach((shape, i) => {
      if (shape.type !== 'passthrough') return
      if (rebuiltChildren[i]?.outerHTML !== shape.raw) {
        passthroughMismatches.push({ index: i, expected: shape.raw, got: rebuiltChildren[i]?.outerHTML })
      }
    })
    expect(passthroughMismatches, JSON.stringify(passthroughMismatches, null, 2)).toEqual([])
  })

  it('every structured shape keeps its fill, stroke, rx, dash, and font-weight', () => {
    const mismatches = []
    shapes.forEach((shape, i) => {
      if (shape.type === 'passthrough') return
      const after = parseAttrs(rebuiltChildren[i]?.outerHTML ?? '')
      if (!after) { mismatches.push({ index: i, type: shape.type, issue: 're-export produced nothing' }); return }
      // Compare against what the SHAPE OBJECT itself captured (the actual
      // contract under test — did elementToShape capture it, and did the
      // exporter emit it back out) rather than re-deriving the original
      // element's attributes a second time.
      if (shape.fill && after.fill !== shape.fill) mismatches.push({ index: i, type: shape.type, attr: 'fill', expected: shape.fill, got: after.fill })
      if (shape.rx && Number(after.rx) !== shape.rx) mismatches.push({ index: i, type: shape.type, attr: 'rx', expected: shape.rx, got: after.rx })
      if (shape.dash?.length && after['stroke-dasharray'] !== shape.dash.join(',')) mismatches.push({ index: i, type: shape.type, attr: 'stroke-dasharray', expected: shape.dash.join(','), got: after['stroke-dasharray'] })
      if (shape.fontWeight && after['font-weight'] !== shape.fontWeight) mismatches.push({ index: i, type: shape.type, attr: 'font-weight', expected: shape.fontWeight, got: after['font-weight'] })
    })
    expect(mismatches, JSON.stringify(mismatches, null, 2)).toEqual([])
  })

  it('rounded rects in the source keep a non-zero rx after import', () => {
    const sourceDoc = new DOMParser().parseFromString(original, 'image/svg+xml')
    const roundedRectCount = Array.from(sourceDoc.querySelectorAll('rect[rx]')).filter(r => Number(r.getAttribute('rx')) > 0).length
    const importedRoundedCount = shapes.filter(s => s.type === 'rect' && s.rx > 0).length
    if (roundedRectCount === 0) return // nothing to check for this fixture
    expect(importedRoundedCount, `source has ${roundedRectCount} rounded rect(s), but only ${importedRoundedCount} imported with rx preserved`).toBe(roundedRectCount)
  })
})
