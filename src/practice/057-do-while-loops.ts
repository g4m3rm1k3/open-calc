import type { PracticeChallenge } from './loader'

export const title = 'do-while Loops'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `rollUntilSix(rolls)` that counts how many entries of `rolls` are consumed, one at a time via `do`/`while`, until hitting a `6` (or the array runs out).',
        starter: '',
        tests: `
assert rollUntilSix([2,4,6,1]) === 3
assert rollUntilSix([6]) === 1
`,
        solution: 'function rollUntilSix(rolls) { let i = 0; let count = 0; do { count++; i++; } while (rolls[i-1] !== 6 && i < rolls.length); return count; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `readUntilEmpty(queue)` using `do`/`while` to pop every item from `queue` into a result array, one at a time, until `queue` is empty.',
        starter: 'function readUntilEmpty(queue) {\n  // TODO: use do-while to pop every item from queue into a result array\n}',
        tests: `
assert JSON.stringify(readUntilEmpty([1,2,3])) === JSON.stringify([1,2,3])
assert JSON.stringify(readUntilEmpty(['a'])) === JSON.stringify(['a'])
`,
        solution: 'function readUntilEmpty(queue) { const popped = []; do { popped.push(queue.shift()); } while (queue.length > 0); return popped; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `runsAtLeastOnce(condition)` using `do`/`while (condition)`, demonstrating that the body runs at least once even when `condition` is `false` from the start.',
        starter: '',
        tests: `
assert runsAtLeastOnce(false) === 1
`,
        solution: 'function runsAtLeastOnce(condition) { let count = 0; do { count++; } while (condition); return count; }',
      },
    ],
  },
]

export default challenges
