import type { PracticeChallenge } from './loader'

export const title = 'Destructuring (JavaScript)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript-program',
        prompt: 'Given `point = { x: 1, y: 2 }`, destructure `{ x, y }` and print both. Destructure with a RENAME: `{ x: horizontalPos }`, print it. Destructure `{ z = 0 }` (a DEFAULT, since `point` has no `z`), print it. Destructure `[first, second, ...rest] = [1, 2, 3, 4, 5]`, print all three (joining `rest` with `,`). Write `distance({ x, y })` (destructured PARAMETER) returning `Math.sqrt(x*x + y*y)`, print `distance(point).toFixed(2)`.',
        starter: '',
        tests: `
assert output === 'x=1, y=2\\nhorizontalPos=1\\nz=0\\nfirst=1, second=2, rest=3,4,5\\n2.24'
`,
        solution: `const point = { x: 1, y: 2 }

const { x, y } = point
console.log(\`x=\${x}, y=\${y}\`)

const { x: horizontalPos } = point
console.log(\`horizontalPos=\${horizontalPos}\`)

const { z = 0 } = point
console.log(\`z=\${z}\`)

const [first, second, ...rest] = [1, 2, 3, 4, 5]
console.log(\`first=\${first}, second=\${second}, rest=\${rest.join(',')}\`)

function distance({ x, y }) {
  return Math.sqrt(x * x + y * y)
}
console.log(distance(point).toFixed(2))
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript-program',
        prompt: 'Fix `main`: `const [z, y, x] = coordinates` destructures a `[10, 20, 30]` array — but array destructuring is purely POSITIONAL, not name-matched, so this assigns `z=10` (1st position), `y=20` (2nd), `x=30` (3rd), the opposite of what the variable names suggest. Reorder the pattern to `const [x, y, z] = coordinates`, matching the array\'s actual intended order.',
        starter: `const coordinates = [10, 20, 30]

const [z, y, x] = coordinates

console.log(\`x=\${x}, y=\${y}, z=\${z}\`)
`,
        tests: `
assert output === 'x=10, y=20, z=30'
`,
        solution: `const coordinates = [10, 20, 30]

const [x, y, z] = coordinates

console.log(\`x=\${x}, y=\${y}, z=\${z}\`)
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript-program',
        prompt: 'Write `createUser({ name, role = \'guest\', age = 18 } = {})` returning `` `${name} (${role}, age ${age})` ``. Call it with `{ name: \'Alice\', role: \'admin\' }` (age falls back to the default `18`), `{ name: \'Bob\' }` (both defaults apply), and `{ name: \'Carol\', role: \'admin\', age: 0 }` — a destructured default only applies when the property is genuinely `undefined`, NOT merely falsy, so `age: 0` (explicitly provided) stays `0`, it is NOT replaced by the default `18`.',
        starter: '',
        tests: `
assert output === 'Alice (admin, age 18)\\nBob (guest, age 18)\\nCarol (admin, age 0)'
`,
        solution: `function createUser({ name, role = 'guest', age = 18 } = {}) {
  return \`\${name} (\${role}, age \${age})\`
}

console.log(createUser({ name: 'Alice', role: 'admin' }))
console.log(createUser({ name: 'Bob' }))
console.log(createUser({ name: 'Carol', role: 'admin', age: 0 }))
`,
      },
    ],
  },
]

export default challenges
