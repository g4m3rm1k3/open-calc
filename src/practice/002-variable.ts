import type { PracticeChallenge } from './loader'

export const title = 'Variable'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `addFive(n)` that stores `n` in a variable, adds 5 to it, and returns the result.',
        starter: '',
        tests: `
assert addFive(0) === 5
assert addFive(10) === 15
assert addFive(-5) === 0
`,
        solution: 'function addFive(n) { let result = n; result += 5; return result; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `runningTotal(nums)` so it uses a variable to accumulate and return the sum of every number in `nums`.',
        starter: 'function runningTotal(nums) {\n  // TODO: use a variable to accumulate the total\n}',
        tests: `
assert runningTotal([1,2,3]) === 6
assert runningTotal([]) === 0
assert runningTotal([5]) === 5
`,
        solution: 'function runningTotal(nums) { let total = 0; for (const n of nums) { total += n; } return total; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `countDown(n)` that returns an array counting down from `n` to `1`, using a variable that decrements each step.',
        starter: '',
        tests: `
assert JSON.stringify(countDown(3)) === JSON.stringify([3,2,1])
assert JSON.stringify(countDown(0)) === JSON.stringify([])
assert JSON.stringify(countDown(1)) === JSON.stringify([1])
`,
        solution: 'function countDown(n) { let result = []; let i = n; while (i > 0) { result.push(i); i--; } return result; }',
      },
    ],
  },
]

export default challenges
