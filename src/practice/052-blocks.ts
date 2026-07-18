import type { PracticeChallenge } from './loader'

export const title = 'Blocks'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `sumEvens(nums)` that sums only the even numbers in `nums`, using a block-scoped `if` inside a loop.',
        starter: '',
        tests: `
assert sumEvens([1,2,3,4]) === 6
assert sumEvens([1,3,5]) === 0
`,
        solution: 'function sumEvens(nums) { let total = 0; for (const n of nums) { if (n % 2 === 0) { total += n; } } return total; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `shadowingDemo()`: it logs the outer `x` (1), then INSIDE a nested block declares a NEW `x = 2` (shadowing) and logs that, then logs the outer `x` again — proving the inner block\'s `x` never affected the outer one.',
        starter: 'function shadowingDemo() {\n  let x = 1;\n  let log = [x];\n  {\n    // TODO: declare a NEW block-scoped x = 2 here, and log.push(x)\n  }\n  log.push(x);\n  return log;\n}',
        tests: `
assert JSON.stringify(shadowingDemo()) === JSON.stringify([1,2,1])
`,
        solution: 'function shadowingDemo() { let x = 1; let log = [x]; { let x = 2; log.push(x); } log.push(x); return log; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `nestedBlocks()` with three nested blocks, each declaring its own `let x` (1, then 2, then 3), logging `x` on the way in AND back out of each level — producing `[1,2,3,2,1]`.',
        starter: '',
        tests: `
assert JSON.stringify(nestedBlocks()) === JSON.stringify([1,2,3,2,1])
`,
        solution: 'function nestedBlocks() { let result = []; { let x = 1; result.push(x); { let x = 2; result.push(x); { let x = 3; result.push(x); } result.push(x); } result.push(x); } return result; }',
      },
    ],
  },
]

export default challenges
