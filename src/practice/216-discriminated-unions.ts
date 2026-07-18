import type { PracticeChallenge } from './loader'

export const title = 'Discriminated Unions (TypeScript)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Write `type Circle = { kind: \'circle\'; radius: number }` and `type Rectangle = { kind: \'rectangle\'; width: number; height: number }`, and `type Shape = Circle | Rectangle`. Write `area(shape: Shape): number` using a `switch (shape.kind)` — `\'circle\'` narrows to `Circle` (`.radius` valid), `\'rectangle\'` narrows to `Rectangle` (`.width`/`.height` valid). Call it with a `Circle{radius:3}` (print `.toFixed(2)`) and a `Rectangle{width:4,height:5}` (print directly).',
        starter: '',
        tests: `
assert output === '28.27\\n20'
`,
        solution: `type Circle = { kind: 'circle'; radius: number }
type Rectangle = { kind: 'rectangle'; width: number; height: number }
type Shape = Circle | Rectangle

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius * shape.radius
    case 'rectangle':
      return shape.width * shape.height
  }
}

const c: Circle = { kind: 'circle', radius: 3 }
const r: Rectangle = { kind: 'rectangle', width: 4, height: 5 }

console.log(area(c).toFixed(2))
console.log(area(r))
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Fix `area`: `Triangle` was added to the `Shape` union, but the `switch` was never updated with a `\'triangle\'` case — with no `default` either, calling `area` on a `Triangle` falls through the whole function, implicitly returning `undefined` (which prints as an EMPTY line). Add `case \'triangle\': return 0.5 * shape.base * shape.height`.',
        starter: `type Circle = { kind: 'circle'; radius: number }
type Rectangle = { kind: 'rectangle'; width: number; height: number }
type Triangle = { kind: 'triangle'; base: number; height: number }
type Shape = Circle | Rectangle | Triangle

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius * shape.radius
    case 'rectangle':
      return shape.width * shape.height
  }
}

const c: Circle = { kind: 'circle', radius: 1 }
const t: Triangle = { kind: 'triangle', base: 6, height: 4 }

console.log(area(c).toFixed(2))
console.log(area(t))
`,
        tests: `
assert output === '3.14\\n12'
`,
        solution: `type Circle = { kind: 'circle'; radius: number }
type Rectangle = { kind: 'rectangle'; width: number; height: number }
type Triangle = { kind: 'triangle'; base: number; height: number }
type Shape = Circle | Rectangle | Triangle

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius * shape.radius
    case 'rectangle':
      return shape.width * shape.height
    case 'triangle':
      return 0.5 * shape.base * shape.height
  }
}

const c: Circle = { kind: 'circle', radius: 1 }
const t: Triangle = { kind: 'triangle', base: 6, height: 4 }

console.log(area(c).toFixed(2))
console.log(area(t))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Write `assertNever(x: never): never` that throws `` new Error(`unhandled shape kind: ${JSON.stringify(x)}`) ``. In `area(shape: Shape)`\'s `switch`, add a `default: return assertNever(shape)` case, giving a REAL runtime safety net (not just a compile-time one) for any shape that slips past static typing. Call `area` on a valid `Circle` (prints fine). Then build `bad = { kind: \'triangle\', base: 3, height: 4 } as unknown as Shape` (bypassing static checking) and call `area(bad)` inside a `try`/`catch`, printing `` `caught: ${(e as Error).message}` ``.',
        starter: '',
        tests: `
assert output === '12.57\\ncaught: unhandled shape kind: {"kind":"triangle","base":3,"height":4}'
`,
        solution: `type Circle = { kind: 'circle'; radius: number }
type Rectangle = { kind: 'rectangle'; width: number; height: number }
type Shape = Circle | Rectangle

function assertNever(x: never): never {
  throw new Error(\`unhandled shape kind: \${JSON.stringify(x)}\`)
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius * shape.radius
    case 'rectangle':
      return shape.width * shape.height
    default:
      return assertNever(shape)
  }
}

const c: Circle = { kind: 'circle', radius: 2 }
console.log(area(c).toFixed(2))

const bad = { kind: 'triangle', base: 3, height: 4 } as unknown as Shape
try {
  area(bad)
} catch (e) {
  console.log(\`caught: \${(e as Error).message}\`)
}
`,
      },
    ],
  },
]

export default challenges
