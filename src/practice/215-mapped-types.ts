import type { PracticeChallenge } from './loader'

export const title = 'Mapped Types (TypeScript)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Write `interface Point { x: number; y: number }` and `type Nullable<T> = { [K in keyof T]: T[K] | null }`. Write `clearPoint(): Nullable<Point>` building `{ x: null, y: null }`, print `` `x=${cleared.x}, y=${cleared.y}` ``. Write `movePoint(p: Point, dx: number, dy: number): Point` returning `{ x: p.x + dx, y: p.y + dy }`, call it with `({x:1,y:2}, 3, 4)`, print `` `x=${moved.x}, y=${moved.y}` ``.',
        starter: '',
        tests: `
assert output === 'x=null, y=null\\nx=4, y=6'
`,
        solution: `interface Point {
  x: number
  y: number
}

type Nullable<T> = { [K in keyof T]: T[K] | null }

function clearPoint(): Nullable<Point> {
  const result = {} as Nullable<Point>
  result.x = null
  result.y = null
  return result
}

const cleared = clearPoint()
console.log(\`x=\${cleared.x}, y=\${cleared.y}\`)

function movePoint(p: Point, dx: number, dy: number): Point {
  return { x: p.x + dx, y: p.y + dy }
}

const moved = movePoint({ x: 1, y: 2 }, 3, 4)
console.log(\`x=\${moved.x}, y=\${moved.y}\`)
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Fix `stringifyPoint`: it\'s hand-written to return `{ x: string; y: string }`, one property at a time — when `Point` gained a third field `z`, the manual duplicate was never updated, so `s.z` is silently `undefined`. Replace it with a general version using `type Stringified<T> = { [K in keyof T]: string }` and a `for (const key of Object.keys(p))` loop that stringifies EVERY key automatically, so it stays correct even as `Point` gains fields.',
        starter: `interface Point {
  x: number
  y: number
  z: number
}

function stringifyPoint(p: Point): { x: string; y: string } {
  return { x: String(p.x), y: String(p.y) }
}

const p: Point = { x: 1, y: 2, z: 3 }
const s = stringifyPoint(p)
console.log(\`x=\${s.x}, y=\${s.y}, z=\${(s as any).z}\`)
`,
        tests: `
assert output === 'x=1, y=2, z=3'
`,
        solution: `interface Point {
  x: number
  y: number
  z: number
}

type Stringified<T> = { [K in keyof T]: string }

function stringifyPoint(p: Point): Stringified<Point> {
  const result = {} as Stringified<Point>
  for (const key of Object.keys(p) as (keyof Point)[]) {
    result[key] = String(p[key])
  }
  return result
}

const p: Point = { x: 1, y: 2, z: 3 }
const s = stringifyPoint(p)
console.log(\`x=\${s.x}, y=\${s.y}, z=\${s.z}\`)
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Given `interface Scores { math: number; art: number }`, write `doubleValues(scores): Doubled<Scores>` using `type Doubled<T> = { [K in keyof T]: T[K] }` (PRESERVING each property\'s original `number` type, doubling each value), and `labelValues(scores): Labeled<Scores>` using `type Labeled<T> = { [K in keyof T]: string }` (FORCING every property to `string`, via `` `${key}: ${scores[key]}` `` for each). Call both on `{ math: 90, art: 75 }` and print both results.',
        starter: '',
        tests: `
assert output === 'doubled: math=180, art=150\\nlabeled: math=math: 90, art=art: 75'
`,
        solution: `interface Scores {
  math: number
  art: number
}

type Doubled<T> = { [K in keyof T]: T[K] }

function doubleValues(scores: Scores): Doubled<Scores> {
  return { math: scores.math * 2, art: scores.art * 2 }
}

type Labeled<T> = { [K in keyof T]: string }

function labelValues(scores: Scores): Labeled<Scores> {
  const result = {} as Labeled<Scores>
  for (const key of Object.keys(scores) as (keyof Scores)[]) {
    result[key] = \`\${key}: \${scores[key]}\`
  }
  return result
}

const scores: Scores = { math: 90, art: 75 }
const doubled = doubleValues(scores)
const labeled = labelValues(scores)

console.log(\`doubled: math=\${doubled.math}, art=\${doubled.art}\`)
console.log(\`labeled: math=\${labeled.math}, art=\${labeled.art}\`)
`,
      },
    ],
  },
]

export default challenges
