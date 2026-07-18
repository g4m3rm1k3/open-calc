import type { PracticeChallenge } from './loader'

export const title = 'Greedy Algorithms'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `greedyCoins(amount, denominations)` returning an array of coins used to make `amount`, always taking the LARGEST denomination that still fits, repeatedly, until `amount` reaches `0`.',
        starter: '',
        tests: `
assert JSON.stringify(greedyCoins(67, [25,10,5,1])) === JSON.stringify([25,25,10,5,1,1])
assert JSON.stringify(greedyCoins(30, [25,10,5,1])) === JSON.stringify([25,5])
`,
        solution: `function greedyCoins(amount, denominations) {
  const sorted = [...denominations].sort((a, b) => b - a)
  const used = []
  for (const coin of sorted) {
    while (amount >= coin) {
      used.push(coin)
      amount -= coin
    }
  }
  return used
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `activitySelection(activities)`, each activity `[start, end]`. Sort by END time, then greedily pick each activity whose `start` is `>=` the end of the last picked activity — the classic greedy interval-scheduling algorithm, maximizing the count of non-overlapping activities.',
        starter: 'function activitySelection(activities) {\n  // TODO: sort activities by END time, then greedily pick each activity\n  // whose start is >= the end of the last picked activity\n  const result = [...activities]\n  return result\n}',
        tests: `
const activities = [[1,3],[2,5],[4,7],[6,9],[8,10]]
assert JSON.stringify(activitySelection(activities)) === JSON.stringify([[1,3],[4,7],[8,10]])
`,
        solution: `function activitySelection(activities) {
  const sorted = [...activities].sort((a, b) => a[1] - b[1])
  const result = []
  let lastEnd = -Infinity
  for (const [start, end] of sorted) {
    if (start >= lastEnd) {
      result.push([start, end])
      lastEnd = end
    }
  }
  return result
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `minCoinsDP(amount, denominations)` returning the TRUE minimum-coin solution via dynamic programming, and confirm it beats `greedyCoins` for `denominations = [4, 3, 1]`, `amount = 6` — the classic case where greedy is provably NOT optimal.',
        starter: '',
        tests: `
const optimal = minCoinsDP(6, [4,3,1])
assert optimal.length === 2
assert JSON.stringify([...optimal].sort((a,b) => a-b)) === JSON.stringify([3,3])
assert greedyCoins(6, [4,3,1]).length === 3
`,
        solution: `function greedyCoins(amount, denominations) {
  const sorted = [...denominations].sort((a, b) => b - a)
  const used = []
  for (const coin of sorted) {
    while (amount >= coin) {
      used.push(coin)
      amount -= coin
    }
  }
  return used
}
function minCoinsDP(amount, denominations) {
  const dp = new Array(amount + 1).fill(Infinity)
  const choice = new Array(amount + 1).fill(-1)
  dp[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const coin of denominations) {
      if (coin <= a && dp[a - coin] + 1 < dp[a]) {
        dp[a] = dp[a - coin] + 1
        choice[a] = coin
      }
    }
  }
  const result = []
  let remaining = amount
  while (remaining > 0) {
    result.push(choice[remaining])
    remaining -= choice[remaining]
  }
  return result
}`,
      },
    ],
  },
]

export default challenges
