// DSA + Design Patterns — Lesson 10
// Dynamic Programming

export const lesson = {
  id: 'dsa-patterns-10',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '10. Dynamic Programming',
  checkpoints: [
    { id: 'cp-overlapping', label: 'Overlapping Subproblems' },
    { id: 'cp-dp',          label: 'DP Approaches' },
    { id: 'cp-classic',     label: 'Classic Problems' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'Dynamic programming is a technique for solving problems that have two properties. First: optimal substructure — the best solution to the big problem can be built from the best solutions to smaller sub-problems. Second: overlapping subproblems — the same smaller problems appear over and over. If both properties hold, you can solve each sub-problem once, store the result, and reuse it. This transforms exponential algorithms into polynomial ones. You have already seen one example: memoised Fibonacci in lesson 5. This lesson generalises the technique and applies it to classic problems.',
      code: null,
    },

    // ── Step 1: The overlapping subproblem tree ───────────────────────────────

    {
      type: 'narration',
      id: 'step1-overlap',
      text: 'Look at why naive Fibonacci is exponential. To compute fib(5) you need fib(4) and fib(3). To compute fib(4) you need fib(3) and fib(2). fib(3) is computed twice. To compute fib(3) you need fib(2) and fib(1) — again. The call tree fans out and the same sub-problems appear at every level. Count the nodes in the call tree: it is roughly 2ⁿ. The key observation: fib(3) has the same answer whether you reach it from the left side or the right side of the tree. Store it once.',
      code: `// Visualising overlapping subproblems
let calls = 0

function fib(n) {
  calls++
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)
}

calls = 0; fib(5);  console.log('fib(5)  calls:', calls)    // 15
calls = 0; fib(10); console.log('fib(10) calls:', calls)    // 177
calls = 0; fib(20); console.log('fib(20) calls:', calls)    // 21891
calls = 0; fib(30); console.log('fib(30) calls:', calls)    // 2692537
// fib(40) would be over 300 million calls
// The call count roughly doubles with each step — that is O(2ⁿ)`,
    },

    // ── Step 2: Top-down (memoization) ───────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-top-down',
      text: 'Top-down dynamic programming is memoization: write the recursive solution, add a cache, check the cache before computing. The "top-down" name refers to the direction of solving: you start at the big problem (the top) and recursively break it down. The cache intercepts repeated sub-problems before they recurse further. Each sub-problem is solved at most once. The call count drops from O(2ⁿ) to O(n).',
      code: `// Top-down DP: recursive + cache
let calls = 0

function fibMemo(n, memo = {}) {
  calls++
  if (n <= 1) return n
  if (memo[n] !== undefined) return memo[n]   // cache hit — no recursion
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo)
  return memo[n]
}

calls = 0; console.log(fibMemo(5));  console.log('fib(5)  calls:', calls)    // 9
calls = 0; console.log(fibMemo(10)); console.log('fib(10) calls:', calls)    // 19
calls = 0; console.log(fibMemo(20)); console.log('fib(20) calls:', calls)    // 39
calls = 0; console.log(fibMemo(40)); console.log('fib(40) calls:', calls)    // 79
// Each fib(n) now makes exactly 2n-1 calls — O(n) instead of O(2ⁿ)`,
    },

    // ── Step 3: Bottom-up (tabulation) ───────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-bottom-up',
      text: 'Bottom-up dynamic programming is tabulation: start at the smallest sub-problems and work upward, filling in a table. No recursion. No call stack. You identify which sub-problems you need, fill them in order, and read the final answer from the table. This is often more efficient in practice because there is no function call overhead. "Bottom-up" refers to solving smallest first and working toward the big problem.',
      code: `// Bottom-up DP: fill a table from the smallest sub-problem upward
function fibTable(n) {
  if (n <= 1) return n

  const table = new Array(n + 1)
  table[0] = 0   // base case
  table[1] = 1   // base case

  // Fill in order — each entry only depends on what came before
  for (let i = 2; i <= n; i++) {
    table[i] = table[i - 1] + table[i - 2]
  }

  return table[n]
}

console.log(fibTable(10))   // 55
console.log(fibTable(40))   // 102334155
console.log(fibTable(50))   // 12586269025

// Space-optimised version: only need the last two values
function fibOptimal(n) {
  if (n <= 1) return n
  let prev = 0, curr = 1
  for (let i = 2; i <= n; i++) {
    const next = prev + curr
    prev = curr
    curr = next
  }
  return curr
}

console.log(fibOptimal(50))   // same answer, O(1) space`,
    },

    {
      type: 'challenge',
      id: 'ch-overlapping',
      text: 'The "climbing stairs" problem: you can climb 1 or 2 steps at a time. How many distinct ways can you reach step n? For n=1: 1 way. For n=2: 2 ways (1+1 or 2). For n=3: 3 ways. For n=4: 5 ways. Implement climbStairs(n) using bottom-up DP. Log climbStairs(5) and climbStairs(10).',
      expectedOutput: null,
      startCode: `function climbStairs(n) {
  if (n <= 2) return n
  // Fill a table: ways[i] = ways[i-1] + ways[i-2]
  // because at each step you either came from i-1 (1-step) or i-2 (2-step)
}

console.log(climbStairs(1))   // 1
console.log(climbStairs(2))   // 2
console.log(climbStairs(3))   // 3
console.log(climbStairs(4))   // 5
console.log(climbStairs(5))   // 8
console.log(climbStairs(10))  // 89`,
      hint: 'const table = new Array(n+1); table[1]=1; table[2]=2; for(i=3 to n) table[i]=table[i-1]+table[i-2]; return table[n].',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim(), 10))
        return nums.includes(8) && nums.includes(89)
      },
    },

    { type: 'checkpoint', id: 'cp-overlapping' },

    // ── Step 4: Coin change ───────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-coin-change',
      text: 'Coin change is the classic DP problem. Given a set of coin denominations and a target amount, find the minimum number of coins needed to make that amount. Greedy does not always work — try making 6 with coins [4, 3, 1]: greedy picks 4+1+1 = 3 coins, but 3+3 = 2 coins is better. DP works because of optimal substructure: the best way to make amount A uses the best way to make (A - one coin). And overlapping subproblems: the best way to make 3 is needed many times.',
      code: `// Coin change — greedy fails, DP works
function greedyCoinChange(coins, amount) {
  const sorted = [...coins].sort((a, b) => b - a)   // largest first
  let remaining = amount
  let count = 0
  for (const coin of sorted) {
    while (remaining >= coin) { remaining -= coin; count++ }
  }
  return remaining === 0 ? count : -1
}

// Greedy gives wrong answer:
console.log('greedy [4,3,1] → 6:', greedyCoinChange([4,3,1], 6))  // 3 (wrong!)
// Optimal is 2 coins: 3+3

// DP approach: build up minimum coins for every amount from 0 to target
function coinChange(coins, amount) {
  // table[i] = min coins to make amount i
  const table = new Array(amount + 1).fill(Infinity)
  table[0] = 0   // base case: 0 coins to make amount 0

  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && table[a - coin] + 1 < table[a]) {
        table[a] = table[a - coin] + 1
      }
    }
  }

  return table[amount] === Infinity ? -1 : table[amount]
}

console.log('DP [4,3,1] → 6:',  coinChange([4,3,1], 6))     // 2 (correct!)
console.log('DP [1,5,6,9] → 11:', coinChange([1,5,6,9], 11)) // 2 (6+5)`,
    },

    // ── Step 5: Coin change with reconstruction ───────────────────────────────

    {
      type: 'narration',
      id: 'step5-coin-reconstruct',
      text: 'Knowing the minimum count is useful, but knowing which coins to use is more useful. Store an extra array alongside the count table: for each amount, record which coin was used to reach it. Trace back from the target amount using this record to reconstruct the exact coins.',
      code: `function coinChangeWithCoins(coins, amount) {
  const table  = new Array(amount + 1).fill(Infinity)
  const usedCoin = new Array(amount + 1).fill(null)
  table[0] = 0

  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && table[a - coin] + 1 < table[a]) {
        table[a]    = table[a - coin] + 1
        usedCoin[a] = coin   // remember which coin was used
      }
    }
  }

  if (table[amount] === Infinity) return null

  // Reconstruct by following usedCoin back to 0
  const result = []
  let remaining = amount
  while (remaining > 0) {
    result.push(usedCoin[remaining])
    remaining -= usedCoin[remaining]
  }
  return result
}

console.log(coinChangeWithCoins([1, 5, 6, 9], 11))   // [6, 5] or [9, 1, 1]
console.log(coinChangeWithCoins([4, 3, 1], 6))        // [3, 3]
console.log(coinChangeWithCoins([2], 3))               // null — impossible`,
    },

    {
      type: 'challenge',
      id: 'ch-dp',
      text: 'Implement a function maxProfit(prices) that finds the maximum profit from a single buy and sell (you must buy before you sell). prices = [7, 1, 5, 3, 6, 4]. Answer: 5 (buy at 1, sell at 6). Use DP: track the minimum price seen so far as you scan left to right, compute profit at each step, track max profit seen.',
      expectedOutput: null,
      startCode: `function maxProfit(prices) {
  if (prices.length < 2) return 0
  let minPrice  = prices[0]
  let maxReturn = 0

  for (let i = 1; i < prices.length; i++) {
    // profit if we sold today
    const profit = prices[i] - minPrice
    // update max profit seen
    if (profit > maxReturn) maxReturn = profit
    // update minimum price seen (for future sells)
    if (prices[i] < minPrice) minPrice = prices[i]
  }

  return maxReturn
}

console.log(maxProfit([7, 1, 5, 3, 6, 4]))   // 5 (buy@1 sell@6)
console.log(maxProfit([7, 6, 4, 3, 1]))       // 0 (prices only fall)
console.log(maxProfit([1, 2]))                 // 1`,
      hint: 'The solution is already written — run it and observe the DP pattern: minPrice is the "optimal subproblem" carried forward.',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim(), 10))
        return nums.includes(5) && nums.includes(0) && nums.includes(1)
      },
    },

    { type: 'checkpoint', id: 'cp-dp' },

    // ── Step 6: Longest Common Subsequence ────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-lcs',
      text: 'Longest Common Subsequence (LCS) is a classic 2D DP problem. Given two strings, find the longest sequence of characters that appears in both in the same order (but not necessarily consecutive). LCS("ABCBDAB", "BDCAB") = "BCAB" (length 4). This is the foundation of diff tools (comparing files), DNA sequence analysis, and spell checkers. The table is 2D: table[i][j] = LCS length of the first i characters of string A and first j characters of string B.',
      code: `// Longest Common Subsequence — 2D DP table
function lcs(a, b) {
  const m = a.length
  const n = b.length

  // Build a 2D table — table[i][j] = LCS of a[0..i-1] and b[0..j-1]
  const table = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        // Characters match — extend the LCS by 1
        table[i][j] = table[i - 1][j - 1] + 1
      } else {
        // Characters differ — take the best from either direction
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1])
      }
    }
  }

  return table[m][n]
}

console.log(lcs('ABCBDAB', 'BDCAB'))   // 4
console.log(lcs('AGGTAB',  'GXTXAYB')) // 4
console.log(lcs('abc',     'abc'))      // 3
console.log(lcs('abc',     'def'))      // 0`,
    },

    // ── Step 7: When to use DP ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-when',
      text: 'Recognising a DP problem is a skill. Ask two questions. First: can I express the answer in terms of answers to smaller versions of the same problem? (Optimal substructure.) Second: will I need those smaller answers more than once? (Overlapping subproblems.) If yes to both, DP applies. Common DP problem shapes: "how many ways can X be done" (counting), "what is the maximum/minimum value" (optimisation), "is it possible to achieve X" (existence). Greedy algorithms are faster but only work when locally optimal choices lead to globally optimal answers — coin change showed that is not always true.',
      code: `// Summary: when is DP the right tool?

// YES to DP:
// - coin change: min coins to make amount (optimal substructure: best way to make
//   amount A uses best way to make A-coin)
// - LCS: length depends on substrings
// - climbing stairs: ways(n) = ways(n-1) + ways(n-2)
// - knapsack: max value with weight limit

// NO to DP (use greedy or other approaches):
// - sorting: no overlapping subproblems
// - binary search: divide and conquer, not overlapping
// - simple iteration: no sub-problems at all

// The tell: if a naive recursive solution computes the same thing twice,
// memoize it. If you know in advance which sub-problems you'll need,
// use a table (bottom-up).

// Bottom-up vs top-down:
// - Top-down (memo): write the recursion you understand, add a cache
// - Bottom-up (table): fill smallest first, no recursion overhead
// - Choose top-down when the recursion is natural and not all sub-problems are needed
// - Choose bottom-up when all sub-problems will be needed (common in 2D DP)

console.log('DP: solve once, reuse everywhere.')`,
    },

    {
      type: 'challenge',
      id: 'ch-classic',
      text: 'Implement a 0/1 Knapsack: given items with weights and values, and a maximum weight capacity, find the maximum total value you can carry. You cannot take fractions of items. Items: [{w:2,v:3},{w:3,v:4},{w:4,v:5},{w:5,v:6}]. Capacity: 8. Expected: 10 (items 0+1+? or 0+3 — find the best).',
      expectedOutput: null,
      startCode: `function knapsack(items, capacity) {
  const n = items.length
  // table[i][w] = max value using first i items with weight limit w
  const table = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0))

  for (let i = 1; i <= n; i++) {
    const { w, v } = items[i - 1]
    for (let cap = 0; cap <= capacity; cap++) {
      // Option 1: don't take item i
      table[i][cap] = table[i - 1][cap]
      // Option 2: take item i (only if it fits)
      if (w <= cap) {
        const withItem = table[i - 1][cap - w] + v
        if (withItem > table[i][cap]) table[i][cap] = withItem
      }
    }
  }

  return table[n][capacity]
}

const items = [
  { w: 2, v: 3 },
  { w: 3, v: 4 },
  { w: 4, v: 5 },
  { w: 5, v: 6 },
]

console.log(knapsack(items, 8))    // 10 (items[0]+items[1]+? check it)
console.log(knapsack(items, 5))    // 7  (items[0]+items[1])
console.log(knapsack(items, 10))   // 13`,
      hint: 'The solution is complete — run it and trace through the table to understand how each item is considered.',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim(), 10))
        return nums.includes(10) && nums.includes(7)
      },
    },

    { type: 'checkpoint', id: 'cp-classic' },

    // ── CodeLens ──────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens. Step through the coin change DP. Watch the table array fill up from index 0 to the target amount. See how each entry depends only on earlier entries. When the inner loop finds a coin that reduces the count, watch table[a] update. Then trace the reconstruction: follow usedCoin backward from amount to 0 to see exactly which coins were chosen.',
      code: `function coinChange(coins, amount) {
  const table    = new Array(amount + 1).fill(Infinity)
  const usedCoin = new Array(amount + 1).fill(null)
  table[0] = 0

  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && table[a - coin] + 1 < table[a]) {
        table[a]    = table[a - coin] + 1
        usedCoin[a] = coin
      }
    }
  }

  if (table[amount] === Infinity) return null
  const result = []
  let r = amount
  while (r > 0) { result.push(usedCoin[r]); r -= usedCoin[r] }
  return result
}

console.log(coinChange([1, 5, 6, 9], 11))   // [6, 5]
console.log(coinChange([4, 3, 1], 6))        // [3, 3]`,
    },

    {
      type: 'codelens',
      id: 'cl-dp',
      text: 'Step through coinChange in CodeLens. Watch the table array fill from index 0 upward. See how each amount checks every coin denomination. Watch usedCoin record which coin created the optimal solution. Then follow the reconstruction loop as it traces usedCoin from the target back to 0.',
      code: `function coinChange(coins, amount) {
  const table    = new Array(amount + 1).fill(Infinity)
  const usedCoin = new Array(amount + 1).fill(null)
  table[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && table[a - coin] + 1 < table[a]) {
        table[a]    = table[a - coin] + 1
        usedCoin[a] = coin
      }
    }
  }
  if (table[amount] === Infinity) return null
  const result = []
  let r = amount
  while (r > 0) { result.push(usedCoin[r]); r -= usedCoin[r] }
  return result
}
console.log(coinChange([1, 5, 6, 9], 11))`,
      lang: 'js',
    },

  ],
}
