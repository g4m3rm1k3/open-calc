import type { PracticeChallenge } from './loader'

export const title = 'Arithmetic Operators'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `remainder(a, b)` that returns `a % b`.',
        starter: '',
        tests: `
assert remainder(10, 3) === 1
assert remainder(9, 3) === 0
`,
        solution: 'function remainder(a, b) { return a % b; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `power(base, exp)` so it computes `base` raised to `exp` using a loop (not the `**` operator).',
        starter: 'function power(base, exp) {\n  // TODO: compute base^exp using a loop, not **\n}',
        tests: `
assert power(2, 3) === 8
assert power(5, 0) === 1
assert power(3, 2) === 9
`,
        solution: 'function power(base, exp) { let result = 1; for (let i = 0; i < exp; i++) { result *= base; } return result; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `average(nums)` that returns the arithmetic mean of `nums`, using `+` to sum and `/` to divide.',
        starter: '',
        tests: `
assert average([1,2,3]) === 2
assert average([10,20]) === 15
`,
        solution: 'function average(nums) { let sum = 0; for (const n of nums) { sum += n; } return sum / nums.length; }',
      },
    ],
  },
]

export default challenges
