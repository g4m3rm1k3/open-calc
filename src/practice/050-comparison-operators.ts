import type { PracticeChallenge } from './loader'

export const title = 'Comparison Operators'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `isGreater(a, b)` that returns `a > b`.',
        starter: '',
        tests: `
assert isGreater(5,3) === true
assert isGreater(3,5) === false
`,
        solution: 'function isGreater(a, b) { return a > b; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `clamp(n, min, max)` so it returns `n` restricted to the `[min, max]` range using comparisons.',
        starter: 'function clamp(n, min, max) {\n  // TODO\n}',
        tests: `
assert clamp(5, 0, 10) === 5
assert clamp(-5, 0, 10) === 0
assert clamp(15, 0, 10) === 10
`,
        solution: 'function clamp(n, min, max) { if (n < min) return min; if (n > max) return max; return n; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `sortThree(a, b, c)` that returns the three values sorted ascending, using ONLY comparisons and swaps (no `.sort()`).',
        starter: '',
        tests: `
assert JSON.stringify(sortThree(3,1,2)) === JSON.stringify([1,2,3])
assert JSON.stringify(sortThree(1,2,3)) === JSON.stringify([1,2,3])
`,
        solution: 'function sortThree(a, b, c) { const arr = [a, b, c]; if (arr[0] > arr[1]) { [arr[0], arr[1]] = [arr[1], arr[0]]; } if (arr[1] > arr[2]) { [arr[1], arr[2]] = [arr[2], arr[1]]; } if (arr[0] > arr[1]) { [arr[0], arr[1]] = [arr[1], arr[0]]; } return arr; }',
      },
    ],
  },
]

export default challenges
