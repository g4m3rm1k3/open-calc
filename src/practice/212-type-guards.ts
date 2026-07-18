import type { PracticeChallenge } from './loader'

export const title = 'Type Guards (TypeScript)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Write `interface Circle { radius: number; area(): number }` and `interface Square { side: number; area(): number }`. Write `function isCircle(shape: Circle | Square): shape is Circle` returning `\'radius\' in shape`. Write `describe(shape)` that uses `isCircle` to print `` `circle with area ${shape.area().toFixed(2)}` `` or `` `square with area ${shape.area()}` ``. Create a `Circle{radius:2}` and `Square{side:3}` (each with a working `area()`), and print `describe` for both.',
        starter: '',
        tests: `
assert output === 'circle with area 12.57\\nsquare with area 9'
`,
        solution: `interface Circle {
  radius: number
  area(): number
}
interface Square {
  side: number
  area(): number
}

function isCircle(shape: Circle | Square): shape is Circle {
  return 'radius' in shape
}

function describe(shape: Circle | Square): string {
  if (isCircle(shape)) {
    return \`circle with area \${shape.area().toFixed(2)}\`
  } else {
    return \`square with area \${shape.area()}\`
  }
}

const c: Circle = { radius: 2, area() { return Math.PI * this.radius * this.radius } }
const s: Square = { side: 3, area() { return this.side * this.side } }

console.log(describe(c))
console.log(describe(s))
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Fix `isCircle`: it checks `\'side\' in shape` — the WRONG property — while still CLAIMING `shape is Circle`. TypeScript trusts the `is Circle` annotation completely and can\'t verify the body actually implements that check correctly, so this "lying" guard misclassifies every `Square` as a `Circle` — since both interfaces happen to share a working `area()` method, this doesn\'t crash, it just silently prints the WRONG label (`"circle with area 9.00"` instead of `"square with area 9"`). Fix the check to `\'radius\' in shape`.',
        starter: `interface Circle {
  radius: number
  area(): number
}
interface Square {
  side: number
  area(): number
}

function isCircle(shape: Circle | Square): shape is Circle {
  return 'side' in shape
}

function describe(shape: Circle | Square): string {
  if (isCircle(shape)) {
    return \`circle with area \${shape.area().toFixed(2)}\`
  } else {
    return \`square with area \${shape.area()}\`
  }
}

const s: Square = { side: 3, area() { return this.side * this.side } }
console.log(describe(s))
`,
        tests: `
assert output === 'square with area 9'
`,
        solution: `interface Circle {
  radius: number
  area(): number
}
interface Square {
  side: number
  area(): number
}

function isCircle(shape: Circle | Square): shape is Circle {
  return 'radius' in shape
}

function describe(shape: Circle | Square): string {
  if (isCircle(shape)) {
    return \`circle with area \${shape.area().toFixed(2)}\`
  } else {
    return \`square with area \${shape.area()}\`
  }
}

const s: Square = { side: 3, area() { return this.side * this.side } }
console.log(describe(s))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Write `function isString(x: unknown): x is string` returning `typeof x === \'string\'`. Write `processValues(values: unknown[]): string[]` that, for each value, pushes `v.toUpperCase()` if `isString(v)` narrows it to `string`, otherwise pushes `` `[not a string: ${String(v)}]` ``. Call it with `[\'hello\', 42, \'world\', true]` and print the results joined with `\', \'`.',
        starter: '',
        tests: `
assert output === 'HELLO, [not a string: 42], WORLD, [not a string: true]'
`,
        solution: `function isString(x: unknown): x is string {
  return typeof x === 'string'
}

function processValues(values: unknown[]): string[] {
  const results: string[] = []
  for (const v of values) {
    if (isString(v)) {
      results.push(v.toUpperCase())
    } else {
      results.push(\`[not a string: \${String(v)}]\`)
    }
  }
  return results
}

console.log(processValues(['hello', 42, 'world', true]).join(', '))
`,
      },
    ],
  },
]

export default challenges
