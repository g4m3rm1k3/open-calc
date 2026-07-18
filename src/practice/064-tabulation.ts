import type { PracticeChallenge } from './loader'

export const title = 'Tabulation (Bottom-Up DP)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `fibTab(n)` computing the `n`th Fibonacci number BOTTOM-UP, filling a table from the base cases upward (no recursion).',
        starter: '',
        tests: `
assert fibTab(0) === 0
assert fibTab(1) === 1
assert fibTab(10) === 55
`,
        solution: `function fibTab(n) {
  if (n <= 1) return n
  const table = [0, 1]
  for (let i = 2; i <= n; i++) {
    table[i] = table[i-1] + table[i-2]
  }
  return table[n]
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `climbStairs(n)` — the number of ways to climb `n` stairs taking 1 or 2 steps at a time — using a bottom-up table.',
        starter: 'function climbStairs(n) {\n  // TODO: build a bottom-up table of ways to climb n stairs (1 or 2 steps at a time)\n}',
        tests: `
assert climbStairs(2) === 2
assert climbStairs(3) === 3
assert climbStairs(5) === 8
`,
        solution: `function climbStairs(n) {
  const table = [1, 1]
  for (let i = 2; i <= n; i++) {
    table[i] = table[i-1] + table[i-2]
  }
  return table[n]
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `coinChange(coins, amount)` returning the MINIMUM number of coins needed to make `amount` (or `-1` if impossible), using a bottom-up DP table.',
        starter: '',
        tests: `
assert coinChange([1,2,5], 11) === 3
assert coinChange([2], 3) === -1
assert coinChange([1], 0) === 0
`,
        solution: `function coinChange(coins, amount) {
  const table = new Array(amount + 1).fill(Infinity)
  table[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && table[a - c] + 1 < table[a]) {
        table[a] = table[a - c] + 1
      }
    }
  }
  return table[amount] === Infinity ? -1 : table[amount]
}`,
      },
    ],
  },
]

export default challenges
