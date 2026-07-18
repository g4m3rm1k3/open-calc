import type { PracticeChallenge } from './loader'

export const title = 'Optimal Substructure'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `minCostClimbingStairs(cost)` — the minimum cost to reach the top of a staircase (climbing 1 or 2 steps at a time), built from the OPTIMAL cost of reaching each earlier step.',
        starter: '',
        tests: `
assert minCostClimbingStairs([10,15,20]) === 15
assert minCostClimbingStairs([1,100,1,1,1,100,1,1,100,1]) === 6
`,
        solution: `function minCostClimbingStairs(cost) {
  const n = cost.length
  const dp = new Array(n + 1).fill(0)
  for (let i = 2; i <= n; i++) {
    dp[i] = Math.min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])
  }
  return dp[n]
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `minPathSum(grid)` — the minimum-sum path from the top-left to bottom-right of `grid`, moving only right or down — where each cell\'s optimal cost builds on the optimal cost of the cells above and to its left.',
        starter: 'function minPathSum(grid) {\n  // TODO: DP -- min sum path from top-left to bottom-right, moving only right or down\n}',
        tests: `
assert minPathSum([[1,3,1],[1,5,1],[4,2,1]]) === 7
`,
        solution: `function minPathSum(grid) {
  const rows = grid.length, cols = grid[0].length
  const dp = Array.from({length: rows}, () => new Array(cols).fill(0))
  dp[0][0] = grid[0][0]
  for (let j = 1; j < cols; j++) dp[0][j] = dp[0][j-1] + grid[0][j]
  for (let i = 1; i < rows; i++) dp[i][0] = dp[i-1][0] + grid[i][0]
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i][j] = grid[i][j] + Math.min(dp[i-1][j], dp[i][j-1])
    }
  }
  return dp[rows-1][cols-1]
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `longestCommonSubsequenceLength(a, b)` — the length of the longest common subsequence of two strings — where each cell\'s optimal answer builds directly on smaller subproblems\' optimal answers.',
        starter: '',
        tests: `
assert longestCommonSubsequenceLength('abcde', 'ace') === 3
assert longestCommonSubsequenceLength('abc', 'def') === 0
`,
        solution: `function longestCommonSubsequenceLength(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i-1] === b[j-1]) dp[i][j] = dp[i-1][j-1] + 1
      else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])
    }
  }
  return dp[m][n]
}`,
      },
    ],
  },
]

export default challenges
