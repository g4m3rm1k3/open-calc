import type { PracticeChallenge } from './loader'

export const title = 'Bridge Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeCircle(radius, renderer)` returning `{ draw() }`, where `draw` delegates to `renderer.renderCircle(radius)` — the same `Circle` must work with any renderer object it\'s given.',
        starter: '',
        tests: `
const svgRenderer = { renderCircle: r => \`<svg-circle r="\${r}"/>\` }
const canvasRenderer = { renderCircle: r => \`canvas.arc(0,0,\${r})\` }
const svgCircle = makeCircle(5, svgRenderer)
const canvasCircle = makeCircle(5, canvasRenderer)
assert svgCircle.draw() === '<svg-circle r="5"/>'
assert canvasCircle.draw() === 'canvas.arc(0,0,5)'
`,
        solution: `function makeCircle(radius, renderer) {
  return { draw() { return renderer.renderCircle(radius) } }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `makeSquare(side, renderer)` returning `{ draw() }`, where `draw` delegates to `renderer.renderSquare(side)` — a new shape slotting into the existing renderer abstraction with no renderer-specific code inside `makeSquare` itself.',
        starter: 'function makeSquare(side, renderer) {\n  // TODO: return { draw() } that delegates to renderer.renderSquare(side)\n  return { draw() { return \'\' } }\n}',
        tests: `
const svgRenderer = { renderSquare: s => \`<svg-rect w="\${s}"/>\` }
const square = makeSquare(4, svgRenderer)
assert square.draw() === '<svg-rect w="4"/>'
`,
        solution: `function makeSquare(side, renderer) {
  return { draw() { return renderer.renderSquare(side) } }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `renderAllCombinations(shapeFactories, renderers)`, where each `shapeFactory` is a function `renderer => shape` (a shape with `draw()`). Return a 2D array: for each shape factory, its `draw()` output against every renderer, in order — proving shapes and renderers combine freely without either needing to know about the other\'s specific variants.',
        starter: '',
        tests: `
function makeCircleFactory(radius) { return renderer => ({ draw: () => renderer.renderCircle(radius) }) }
const svgRenderer = { renderCircle: r => \`svg:\${r}\` }
const canvasRenderer = { renderCircle: r => \`canvas:\${r}\` }
const result = renderAllCombinations([makeCircleFactory(5)], [svgRenderer, canvasRenderer])
assert JSON.stringify(result) === JSON.stringify([['svg:5','canvas:5']])
`,
        solution: `function renderAllCombinations(shapeFactories, renderers) {
  return shapeFactories.map(factory =>
    renderers.map(renderer => factory(renderer).draw())
  )
}`,
      },
    ],
  },
]

export default challenges
