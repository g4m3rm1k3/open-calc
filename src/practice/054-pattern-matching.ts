import type { PracticeChallenge } from './loader'

export const title = 'Pattern Matching'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `pointSum({ x, y })`, destructuring its argument directly in the parameter list, returning `x + y`.',
        starter: '',
        tests: `
assert pointSum({x:1,y:2}) === 3
assert pointSum({x:0,y:5}) === 5
`,
        solution: 'function pointSum({ x, y }) { return x + y; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: "Finish `describeShape(shape)` matching on `shape.kind` — `'circle'` returns `'circle r=' + radius`, `'square'` returns `'square s=' + side`.",
        starter: "function describeShape(shape) {\n  // TODO: match on shape.kind ('circle' -> 'circle r='+radius, 'square' -> 'square s='+side)\n}",
        tests: `
assert describeShape({kind:'circle', radius: 5}) === 'circle r=5'
assert describeShape({kind:'square', side: 3}) === 'square s=3'
`,
        solution: "function describeShape(shape) { if (shape.kind === 'circle') return 'circle r=' + shape.radius; if (shape.kind === 'square') return 'square s=' + shape.side; return 'unknown'; }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `firstTwoSum({ items: [a, b] })`, using NESTED destructuring to pull the first two elements of `items` directly out of the parameter, and return their sum.',
        starter: '',
        tests: `
assert firstTwoSum({ items: [3, 4, 5] }) === 7
assert firstTwoSum({ items: [10, 20] }) === 30
`,
        solution: 'function firstTwoSum({ items: [a, b] }) { return a + b; }',
      },
    ],
  },
]

export default challenges
