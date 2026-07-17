import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useThemeColors, withAlpha } from "../../hooks/useThemeColors.js";
import { useGlobalTheme } from "../../context/ThemeContext.jsx";
import Editor from "@monaco-editor/react";
import { setupOpenCalcMonaco } from "../../utils/monacoThemes.js";
import DPTableViz from "./DPTableViz.jsx";
import {
  traceClimbingStairsTab,
  traceHouseRobberTab,
  traceCoinChangeTab,
  traceLCSTab,
  traceKnapsackTab,
  traceEditDistanceTab,
} from "./dpTracers.js";

// ─────────────────────────────────────────────────────────────────────────────
//  DP LAB — six recurrences, one table-fill visualizer, JS + Python dual-language.
//  Same "hacker workstation" template as the DSA labs (DSA01Arrays.jsx), theme-
//  aware and with working Monaco line-highlighting — see the plan for why this
//  follows DSA01's pattern rather than DSA02's regressed one.
// ─────────────────────────────────────────────────────────────────────────────

// Canvas-safe fixed palette (not currently used for canvas here, kept for
// parity with DSA01's HX/C split in case a future lesson adds a canvas chart)
const HEX = {
  dark: { green: "#00ff88", blue: "#4fc3f7", amber: "#ffb347", red: "#ff4d6d", purple: "#c084fc" },
  light: { green: "#16a34a", blue: "#2563eb", amber: "#d97706", red: "#dc2626", purple: "#7c3aed" },
};

// ── LESSONS DATA ────────────────────────────────────────────────────────────
const LESSONS_DATA = [
  {
    id: 0,
    title: "Climbing Stairs",
    shortTitle: "Stairs",
    colorKey: "green",
    tag: "Introducing the Table",
    concept: [
      {
        head: "The recurrence",
        body: `Each step to the top can be reached from one step back
or two steps back — so the number of ways to reach
step i is the sum of the ways to reach the two steps
before it:

  dp[1] = 1
  dp[2] = 2
  dp[i] = dp[i-1] + dp[i-2]   for i >= 3

This is exactly the Fibonacci recurrence, just with
different base cases.`,
      },
      {
        head: "Tabulation vs. memoization",
        body: `The table-fill viz on the Demo tab animates the
BOTTOM-UP (tabulation) version — filling dp[1], dp[2],
dp[3]... in order. That's a genuinely different shape
from top-down MEMOIZED recursion, which builds a call
tree instead of a table (fib(5) calls fib(4) and fib(3),
which each call further down before anything returns).

Both give the identical answer. See the "Memoization"
and "Tabulation" concept-library entries for the full
side-by-side contrast on this exact problem.`,
      },
    ],
    pseudoLines: [
      { code: "FUNCTION climbStairs(n):", note: "Count the distinct ways to reach step n, moving 1 or 2 steps at a time" },
      { code: "  dp[1] ← 1", note: "Only one way to reach step 1: a single 1-step move" },
      { code: "  dp[2] ← 2", note: "Two ways to reach step 2: two 1-steps, or one 2-step" },
      { code: "  FOR i FROM 3 TO n:", note: null },
      { code: "    dp[i] ← dp[i-1] + dp[i-2]", note: "Arriving at step i means your LAST move was either a 1-step (from i-1) or a 2-step (from i-2) — sum both ways" },
      { code: "", note: null },
      { code: "  RETURN dp[n]", note: null },
    ],
    starterCode: `function climbStairs(n) {
  if (n === 1) return 1;
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  dp[2] = 2;
  for (let i = 3; i <= n; i++) {
    // YOUR CODE ↓
    // Fill dp[i] using the two previous steps
    ___
  }
  return dp[n];
}`,
    blanks: ["___"],
    solutions: ["    dp[i] = dp[i - 1] + dp[i - 2];"],
    testFn: (fn) => {
      const r1 = fn(1);
      const r2 = fn(2);
      const r5 = fn(5);
      return {
        ok: r1 === 1 && r2 === 2 && r5 === 8,
        result: r5,
        checks: [
          { label: "climbStairs(1) === 1", pass: r1 === 1 },
          { label: "climbStairs(2) === 2", pass: r2 === 2 },
          { label: "climbStairs(5) === 8", pass: r5 === 8 },
        ],
      };
    },
    hasTrace: true,
    kind: "dp1d",
    realWorldNote: "This exact recurrence shape — dp[i] built from a fixed window of previous cells — is the skeleton behind counting tilings, counting valid parenthesizations, and any 'in how many ways' question over a linear sequence.",
  },

  {
    id: 1,
    title: "House Robber",
    shortTitle: "Robber",
    colorKey: "blue",
    tag: "First Decision",
    concept: [
      {
        head: "The recurrence",
        body: `A thief can't rob two adjacent houses. dp[i] is the
most money collectible from houses 0..i:

  dp[0] = nums[0]
  dp[1] = max(nums[0], nums[1])
  dp[i] = max(dp[i-1], dp[i-2] + nums[i])
           skip house i     rob house i

Every cell now makes a real DECISION — skip or take —
not just a fixed sum of the previous two cells.`,
      },
      {
        head: "Why dp[i-2], not dp[i-1], when taking",
        body: `If you rob house i, you CANNOT also have robbed
house i-1 (adjacent). So robbing house i means your
running total is nums[i] PLUS whatever was optimal
using houses 0..i-2 — dp[i-2], skipping i-1 entirely.`,
      },
    ],
    pseudoLines: [
      { code: "FUNCTION houseRobber(nums):", note: "Max money collectible with no two adjacent houses robbed" },
      { code: "  dp[0] ← nums[0]", note: "Only one house available" },
      { code: "  dp[1] ← max(nums[0], nums[1])", note: "Rob whichever of the first two pays more" },
      { code: "  FOR i FROM 2 TO n-1:", note: null },
      { code: "    skip ← dp[i-1]", note: "Don't rob house i — keep the best total through i-1" },
      { code: "    take ← dp[i-2] + nums[i]", note: "Rob house i — add it to the best total through i-2 (i-1 must be skipped)" },
      { code: "    dp[i] ← max(skip, take)", note: null },
      { code: "", note: null },
      { code: "  RETURN dp[n-1]", note: null },
    ],
    starterCode: `function houseRobber(nums) {
  const n = nums.length;
  if (n === 1) return nums[0];
  const dp = new Array(n).fill(0);
  dp[0] = nums[0];
  dp[1] = Math.max(nums[0], nums[1]);
  for (let i = 2; i < n; i++) {
    // YOUR CODE ↓
    // dp[i] is the better of: skip house i, or rob it (using dp[i-2])
    ___
  }
  return dp[n - 1];
}`,
    blanks: ["___"],
    solutions: ["    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);"],
    testFn: (fn) => {
      const r1 = fn([1, 2, 3, 1]);
      const r2 = fn([2, 7, 9, 3, 1]);
      return {
        ok: r1 === 4 && r2 === 12,
        result: r2,
        checks: [
          { label: "houseRobber([1,2,3,1]) === 4", pass: r1 === 4 },
          { label: "houseRobber([2,7,9,3,1]) === 12", pass: r2 === 12 },
        ],
      };
    },
    hasTrace: true,
    kind: "dp1d",
    realWorldNote: "This 'skip or take, using i-2 when taking' shape shows up anywhere adjacent items conflict — non-overlapping interval scheduling, and the classic interview framing of choosing non-adjacent array elements to maximize a sum.",
  },

  {
    id: 2,
    title: "Coin Change",
    shortTitle: "Coins",
    colorKey: "amber",
    tag: "Variable Dependencies",
    concept: [
      {
        head: "The recurrence",
        body: `dp[a] = fewest coins to make amount a exactly:

  dp[0] = 0
  dp[a] = 1 + min over every coin c <= a of dp[a-c]

Unlike Stairs/Robber, the number of cells feeding dp[a]
is NOT fixed at 2 — it's a loop over every coin
denomination, so a coin set with 6 denominations
means up to 6 dependency cells per dp[a].`,
      },
      {
        head: "\"Unreachable\" is a real, distinct state",
        body: `If NO coin combination can make amount a, dp[a] stays
at its "infinity" sentinel — visually distinct in the
table from a cell that just hasn't been computed yet.
The final answer converts that sentinel to -1.`,
      },
    ],
    pseudoLines: [
      { code: "FUNCTION coinChange(coins, amount):", note: "Fewest coins summing exactly to amount, or -1 if impossible" },
      { code: "  dp[0] ← 0", note: "Zero coins needed to make amount 0" },
      { code: "  FOR a FROM 1 TO amount:", note: null },
      { code: "    FOR EACH coin c IN coins:", note: "Try every denomination, not just a fixed lookback" },
      { code: "      IF c <= a AND dp[a-c] is reachable:", note: null },
      { code: "        dp[a] ← min(dp[a], dp[a-c] + 1)", note: "Using coin c costs 1 more coin than however dp[a-c] was reached" },
      { code: "", note: null },
      { code: "  RETURN dp[amount], or -1 if still unreachable", note: null },
    ],
    starterCode: `function coinChange(coins, amount) {
  const INF = Infinity;
  const dp = new Array(amount + 1).fill(INF);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] !== INF) {
        // YOUR CODE ↓
        // Take coin c if it improves dp[a]
        ___
      }
    }
  }
  return dp[amount] === INF ? -1 : dp[amount];
}`,
    blanks: ["___"],
    solutions: ["        dp[a] = Math.min(dp[a], dp[a - c] + 1);"],
    testFn: (fn) => {
      const r1 = fn([1, 2, 5], 11);
      const r2 = fn([2], 3);
      const r3 = fn([1], 0);
      return {
        ok: r1 === 3 && r2 === -1 && r3 === 0,
        result: r1,
        checks: [
          { label: "coinChange([1,2,5], 11) === 3", pass: r1 === 3 },
          { label: "coinChange([2], 3) === -1 (unreachable)", pass: r2 === -1 },
          { label: "coinChange([1], 0) === 0", pass: r3 === 0 },
        ],
      };
    },
    hasTrace: true,
    kind: "dp1d",
    realWorldNote: "A loop-over-dependencies recurrence like this is the same shape behind unbounded knapsack, making change with limited coin counts, and word-break-style 'can this be assembled from parts' problems.",
  },

  {
    id: 3,
    title: "Longest Common Subsequence",
    shortTitle: "LCS",
    colorKey: "purple",
    tag: "First Grid",
    concept: [
      {
        head: "The recurrence",
        body: `dp[i][j] = length of the LCS of s1[0..i) and s2[0..j):

  dp[0][j] = dp[i][0] = 0          (empty string shares nothing)
  if s1[i-1] === s2[j-1]:
    dp[i][j] = dp[i-1][j-1] + 1      (characters match — extend the diagonal)
  else:
    dp[i][j] = max(dp[i-1][j], dp[i][j-1])   (no match — best of dropping either character)

This is the simplest possible 2D DP: no decision to
weigh when characters match, just a diagonal extend.`,
      },
      {
        head: "Reading the table",
        body: `Rows are indexed by s1, columns by s2. Every cell
depends only on its LEFT, ABOVE, or DIAGONAL-UP-LEFT
neighbor — never anything below or to the right — which
is exactly why filling row by row, left to right, is a
valid order: every dependency is already filled in.`,
      },
    ],
    pseudoLines: [
      { code: "FUNCTION lcs(s1, s2):", note: "Length of the longest sequence of characters common to both strings, in order (not necessarily contiguous)" },
      { code: "  dp[0][*] ← 0,  dp[*][0] ← 0", note: "An empty string shares 0 characters with anything" },
      { code: "  FOR i FROM 1 TO len(s1):", note: null },
      { code: "    FOR j FROM 1 TO len(s2):", note: null },
      { code: "      IF s1[i-1] == s2[j-1]:", note: null },
      { code: "        dp[i][j] ← dp[i-1][j-1] + 1", note: "Matching characters extend whatever LCS existed one row and one column back" },
      { code: "      ELSE:", note: null },
      { code: "        dp[i][j] ← max(dp[i-1][j], dp[i][j-1])", note: "No match — the best LCS either drops s1's character or drops s2's character" },
      { code: "", note: null },
      { code: "  RETURN dp[m][n]", note: null },
    ],
    starterCode: `function lcs(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let j = 0; j <= n; j++) dp[0][j] = 0;
  for (let i = 0; i <= m; i++) dp[i][0] = 0;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        // YOUR CODE ↓
        // Characters match — extend the diagonal
        ___
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}`,
    blanks: ["___"],
    solutions: ["        dp[i][j] = dp[i - 1][j - 1] + 1;"],
    testFn: (fn) => {
      const r1 = fn("abcde", "ace");
      const r2 = fn("abc", "abc");
      const r3 = fn("abc", "def");
      return {
        ok: r1 === 3 && r2 === 3 && r3 === 0,
        result: r1,
        checks: [
          { label: 'lcs("abcde","ace") === 3', pass: r1 === 3 },
          { label: 'lcs("abc","abc") === 3 (identical)', pass: r2 === 3 },
          { label: 'lcs("abc","def") === 0 (nothing shared)', pass: r3 === 0 },
        ],
      };
    },
    hasTrace: true,
    kind: "dp2d",
    realWorldNote: "LCS is the algorithm underneath `diff` (comparing file versions) and DNA sequence alignment — both are really 'find the longest common subsequence' in disguise.",
  },

  {
    id: 4,
    title: "0/1 Knapsack",
    shortTitle: "Knapsack",
    colorKey: "red",
    tag: "Grid + Decision",
    concept: [
      {
        head: "The recurrence",
        body: `dp[i][w] = best value using items 1..i with capacity w:

  dp[0][w] = 0                          (no items, no value)
  if weight[i] > w:
    dp[i][w] = dp[i-1][w]                 (item i can't fit — forced skip)
  else:
    dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i])
                  skip item i               take item i

Combines LCS's 2D grid with House Robber's skip/take
decision — the two prior lessons' ideas, composed.`,
      },
      {
        head: "Why dp[i-1], not dp[i], when taking",
        body: `Each item can be used AT MOST ONCE (0/1, not
unbounded). Taking item i must reference dp[i-1] (items
1..i-1 only) — referencing dp[i] here would let item i
be counted twice.`,
      },
    ],
    pseudoLines: [
      { code: "FUNCTION knapsack(values, weights, capacity):", note: "Max value obtainable, each item usable at most once" },
      { code: "  dp[0][*] ← 0", note: "Zero items available → zero value at any capacity" },
      { code: "  FOR i FROM 1 TO n:", note: null },
      { code: "    FOR w FROM 0 TO capacity:", note: null },
      { code: "      IF weight[i] > w:", note: null },
      { code: "        dp[i][w] ← dp[i-1][w]", note: "Item i literally doesn't fit — forced to skip it" },
      { code: "      ELSE:", note: null },
      { code: "        dp[i][w] ← max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i])", note: "Compare skipping item i against taking it (using the remaining capacity from the PREVIOUS item row, so item i is never double-counted)" },
      { code: "", note: null },
      { code: "  RETURN dp[n][capacity]", note: null },
    ],
    starterCode: `function knapsack(values, weights, capacity) {
  const n = values.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
  for (let w = 0; w <= capacity; w++) dp[0][w] = 0;
  for (let i = 1; i <= n; i++) {
    const wt = weights[i - 1], val = values[i - 1];
    for (let w = 0; w <= capacity; w++) {
      if (wt > w) {
        dp[i][w] = dp[i - 1][w];
      } else {
        // YOUR CODE ↓
        // Choose the better of: skip item i, or take it
        ___
      }
    }
  }
  return dp[n][capacity];
}`,
    blanks: ["___"],
    solutions: ["        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - wt] + val);"],
    testFn: (fn) => {
      const r1 = fn([60, 100, 120], [1, 2, 3], 5);
      const r2 = fn([10], [5], 3);
      return {
        ok: r1 === 220 && r2 === 0,
        result: r1,
        checks: [
          { label: "knapsack([60,100,120], [1,2,3], 5) === 220", pass: r1 === 220 },
          { label: "knapsack([10], [5], 3) === 0 (never fits)", pass: r2 === 0 },
        ],
      };
    },
    hasTrace: true,
    kind: "dp2d",
    realWorldNote: "0/1 Knapsack is the canonical model for any 'pick a subset under a budget to maximize value' problem — capital budgeting, cargo loading, and resource allocation all reduce to exactly this recurrence.",
  },

  {
    id: 5,
    title: "Edit Distance",
    shortTitle: "Edit Dist.",
    colorKey: "green",
    tag: "Hardest Transition",
    concept: [
      {
        head: "The recurrence",
        body: `dp[i][j] = fewest edits to turn s1[0..i) into s2[0..j):

  dp[0][j] = j,  dp[i][0] = i     (all inserts or all deletes)
  if s1[i-1] === s2[j-1]:
    dp[i][j] = dp[i-1][j-1]          (characters already match — no edit needed)
  else:
    dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])
                     replace          delete        insert

Three-way min instead of LCS's two-way max — the most
complex transition in this lab, reusing LCS's match
check and Knapsack's "pick the best of several sources"
idea together.`,
      },
      {
        head: "What each of the three sources means",
        body: `dp[i-1][j-1] + 1 → REPLACE s1[i-1] with s2[j-1]
dp[i-1][j] + 1     → DELETE s1[i-1]
dp[i][j-1] + 1      → INSERT s2[j-1]

Each corresponds to one concrete single-character edit
operation — the recurrence is really just "try all
three edits, keep whichever leaves the fewest remaining."`,
      },
    ],
    pseudoLines: [
      { code: "FUNCTION editDistance(s1, s2):", note: "Fewest single-character insert/delete/replace edits to turn s1 into s2" },
      { code: "  dp[0][j] ← j,  dp[i][0] ← i", note: "Converting to/from the empty string costs one edit per character" },
      { code: "  FOR i FROM 1 TO len(s1):", note: null },
      { code: "    FOR j FROM 1 TO len(s2):", note: null },
      { code: "      IF s1[i-1] == s2[j-1]:", note: null },
      { code: "        dp[i][j] ← dp[i-1][j-1]", note: "Characters already match — no edit needed here" },
      { code: "      ELSE:", note: null },
      { code: "        dp[i][j] ← 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])", note: "Try replace, delete, and insert — take whichever leaves the fewest total edits, plus 1 for this edit" },
      { code: "", note: null },
      { code: "  RETURN dp[m][n]", note: null },
    ],
    starterCode: `function editDistance(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        // YOUR CODE ↓
        // No match — take 1 + the best of replace/delete/insert
        ___
      }
    }
  }
  return dp[m][n];
}`,
    blanks: ["___"],
    solutions: ["        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);"],
    testFn: (fn) => {
      const r1 = fn("horse", "ros");
      const r2 = fn("abc", "abc");
      return {
        ok: r1 === 3 && r2 === 0,
        result: r1,
        checks: [
          { label: 'editDistance("horse","ros") === 3', pass: r1 === 3 },
          { label: 'editDistance("abc","abc") === 0', pass: r2 === 0 },
        ],
      };
    },
    hasTrace: true,
    kind: "dp2d",
    realWorldNote: "Edit distance (Levenshtein distance) powers spell-checkers, fuzzy search, and DNA-mutation-distance calculations — anywhere 'how different are these two sequences' needs a precise number.",
  },
];

// ── PYTHON STARTER / SOLUTION / HARNESS ARRAYS (parallel to LESSONS_DATA) ──
const PY_STARTERS = [
  `def climb_stairs(n):
    if n == 1:
        return 1
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2
    for i in range(3, n + 1):
        # YOUR CODE HERE
        ___
    return dp[n]`,
  `def house_robber(nums):
    n = len(nums)
    if n == 1:
        return nums[0]
    dp = [0] * n
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])
    for i in range(2, n):
        # YOUR CODE HERE
        ___
    return dp[n - 1]`,
  `def coin_change(coins, amount):
    INF = float('inf')
    dp = [INF] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] != INF:
                # YOUR CODE HERE
                ___
    if dp[amount] == INF:
        return -1
    return dp[amount]`,
  `def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for j in range(n + 1):
        dp[0][j] = 0
    for i in range(m + 1):
        dp[i][0] = 0
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                # YOUR CODE HERE
                ___
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
  `def knapsack(values, weights, capacity):
    n = len(values)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for w in range(capacity + 1):
        dp[0][w] = 0
    for i in range(1, n + 1):
        wt, val = weights[i - 1], values[i - 1]
        for w in range(capacity + 1):
            if wt > w:
                dp[i][w] = dp[i - 1][w]
            else:
                # YOUR CODE HERE
                ___
    return dp[n][capacity]`,
  `def edit_distance(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(m + 1):
        dp[i][0] = i
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                # YOUR CODE HERE
                ___
    return dp[m][n]`,
];

const PY_BLANKS = [["___"], ["___"], ["___"], ["___"], ["___"], ["___"]];

const PY_SOLUTIONS = [
  ["        dp[i] = dp[i - 1] + dp[i - 2]"],
  ["        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])"],
  ["                dp[a] = min(dp[a], dp[a - c] + 1)"],
  ["                dp[i][j] = dp[i - 1][j - 1] + 1"],
  ["                dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - wt] + val)"],
  ["                dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])"],
];

const PY_HARNESSES = [
  `import json as _j
_r1 = climb_stairs(1)
_r2 = climb_stairs(2)
_r5 = climb_stairs(5)
_checks=[
  {'label':'climbStairs(1) === 1','pass':_r1==1},
  {'label':'climbStairs(2) === 2','pass':_r2==2},
  {'label':'climbStairs(5) === 8','pass':_r5==8},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':_r5})`,
  `import json as _j
_r1 = house_robber([1,2,3,1])
_r2 = house_robber([2,7,9,3,1])
_checks=[
  {'label':'houseRobber([1,2,3,1]) === 4','pass':_r1==4},
  {'label':'houseRobber([2,7,9,3,1]) === 12','pass':_r2==12},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':_r2})`,
  `import json as _j
_r1 = coin_change([1,2,5], 11)
_r2 = coin_change([2], 3)
_r3 = coin_change([1], 0)
_checks=[
  {'label':'coinChange([1,2,5], 11) === 3','pass':_r1==3},
  {'label':'coinChange([2], 3) === -1 (unreachable)','pass':_r2==-1},
  {'label':'coinChange([1], 0) === 0','pass':_r3==0},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':_r1})`,
  `import json as _j
_r1 = lcs('abcde', 'ace')
_r2 = lcs('abc', 'abc')
_r3 = lcs('abc', 'def')
_checks=[
  {'label':'lcs("abcde","ace") === 3','pass':_r1==3},
  {'label':'lcs("abc","abc") === 3 (identical)','pass':_r2==3},
  {'label':'lcs("abc","def") === 0 (nothing shared)','pass':_r3==0},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':_r1})`,
  `import json as _j
_r1 = knapsack([60,100,120],[1,2,3],5)
_r2 = knapsack([10],[5],3)
_checks=[
  {'label':'knapsack([60,100,120],[1,2,3],5) === 220','pass':_r1==220},
  {'label':'knapsack([10],[5],3) === 0 (never fits)','pass':_r2==0},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':_r1})`,
  `import json as _j
_r1 = edit_distance('horse', 'ros')
_r2 = edit_distance('abc', 'abc')
_checks=[
  {'label':'editDistance("horse","ros") === 3','pass':_r1==3},
  {'label':'editDistance("abc","abc") === 0','pass':_r2==0},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':_r1})`,
];

// ── JS SANDBOX RUNNER (matches DSA01Arrays.jsx's runJS exactly) ──────────
function runJS(lesson, code) {
  try {
    const fnMatch = code.match(/function\s+(\w+)/);
    if (!fnMatch) return { error: "No function definition found." };
    // eslint-disable-next-line no-new-func
    const fn = new Function(code + `; return ${fnMatch[1]};`)();
    return { testResult: lesson.testFn(fn), error: null };
  } catch (e) {
    return { error: e.message || String(e) };
  }
}

// ── PSEUDOCODE BLOCK (identical shape to DSA01Arrays.jsx's PseudoBlock) ──
function PseudoBlock({ lines, C }) {
  const [hoveredLine, setHoveredLine] = useState(null);
  return (
    <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 1.9, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "6px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8, background: C.dim }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase" }}>pseudocode</span>
        <span style={{ fontSize: 9, color: C.muted }}>— hover a line to explain it</span>
      </div>
      <div style={{ padding: "8px 0" }}>
        {lines.map((line, i) => {
          const isHovered = hoveredLine === i;
          const isComment = line.code.trimStart().startsWith("//");
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredLine(i)}
              onMouseLeave={() => setHoveredLine(null)}
              style={{
                display: "flex", flexDirection: "column", padding: "0 14px",
                background: isHovered && line.note ? `${C.blue}12` : "transparent",
                borderLeft: isHovered && line.note ? `3px solid ${C.blue}` : "3px solid transparent",
                cursor: line.note ? "help" : "default", transition: "background 0.1s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 26 }}>
                <span
                  style={{
                    color: isComment
                      ? C.muted
                      : /^(FUNCTION|IF|ELSE|FOR|WHILE|RETURN)/.test(line.code.trimStart())
                        ? C.blue
                        : C.text,
                    whiteSpace: "pre", flex: 1,
                  }}
                >
                  {line.code}
                </span>
                {line.note && !isHovered && <span style={{ fontSize: 9, color: C.muted, opacity: 0.5 }}>(?)</span>}
                {line.note && isHovered && <span style={{ fontSize: 9, color: C.blue, fontWeight: 600 }}>↑</span>}
              </div>
              {isHovered && line.note && (
                <div style={{ margin: "2px 0 6px 0", padding: "7px 12px", background: `${C.blue}18`, border: `1px solid ${C.blue}44`, borderRadius: 6, fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                  {line.note}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function DP01DynamicProgramming({ onBack }) {
  const T = useThemeColors();
  const { isDarkGlobal } = useGlobalTheme();
  const HX = isDarkGlobal ? HEX.dark : HEX.light;

  const C = {
    bg: T.bg,
    surface: T.surface,
    panel: T.surface2,
    border: T.border,
    border2: withAlpha(T.border, "cc"),
    green: T.green,
    blue: T.blue,
    amber: T.amber,
    red: T.red,
    purple: T.purple,
    muted: T.muted,
    text: T.text,
    textDim: T.hint,
    bright: T.text,
    dim: T.surface2,
  };

  const ACCENT = { green: HX.green, blue: HX.blue, amber: HX.amber, purple: HX.purple, red: HX.red };
  const mono = "'JetBrains Mono','Fira Code','Cascadia Code',monospace";
  const sans = "'IBM Plex Sans','SF Pro Text',system-ui,sans-serif";

  const LESSONS = useMemo(
    () => LESSONS_DATA.map((l) => ({ ...l, color: ACCENT[l.colorKey] })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDarkGlobal]
  );

  const [lessonIdx, setLessonIdx] = useState(0);
  const [tab, setTab] = useState("concept");
  const [lang, setLang] = useState("js");
  const [jsCode, setJsCode] = useState(LESSONS_DATA[0].starterCode);
  const [pyCode, setPyCode] = useState(PY_STARTERS[0]);
  const [runResult, setRunResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [traceSteps, setTraceSteps] = useState([]);
  const [traceIdx, setTraceIdx] = useState(0);
  const [completed, setCompleted] = useState(new Set());

  // Demo-tab input controls, one per lesson (indices line up with LESSONS_DATA)
  const [demoN, setDemoN] = useState(6);
  const [demoNums, setDemoNums] = useState([2, 7, 9, 3, 1]);
  const [demoCoins, setDemoCoins] = useState([1, 2, 5]);
  const [demoAmount, setDemoAmount] = useState(11);
  const [demoS1, setDemoS1] = useState("abcde");
  const [demoS2, setDemoS2] = useState("ace");
  const [demoValues, setDemoValues] = useState([60, 100, 120]);
  const [demoWeights, setDemoWeights] = useState([1, 2, 3]);
  const [demoCapacity, setDemoCapacity] = useState(5);
  const [demoEd1, setDemoEd1] = useState("horse");
  const [demoEd2, setDemoEd2] = useState("ros");

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorRef = useRef([]);

  useEffect(() => {
    const id = "dp-lab-trace-line-css";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      .trace-current-line { background: rgba(79, 195, 247, 0.13) !important; border-left: 3px solid #4fc3f7 !important; }
      .trace-current-line-error { background: rgba(255, 77, 109, 0.13) !important; border-left: 3px solid #ff4d6d !important; }
    `;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  const cur = traceSteps[traceIdx];

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const model = editor.getModel();
    if (!model) return;

    decorRef.current = editor.deltaDecorations(decorRef.current, []);
    const pattern = cur?.codePattern;
    if (!pattern) return;

    const matches = model.findMatches(pattern, false, false, false, null, true);
    if (!matches.length) return;

    const ln = matches[0].range.startLineNumber;
    decorRef.current = editor.deltaDecorations([], [{
      range: new monaco.Range(ln, 1, ln, 999),
      options: { isWholeLine: true, inlineClassName: "trace-current-line" },
    }]);
    editor.revealLineInCenter(ln, 0);
  }, [cur]);

  const lesson = LESSONS[lessonIdx];
  const lc = lesson.color;
  const isComplete = completed.has(lessonIdx);
  const currentCode = lang === "js" ? jsCode : pyCode;
  const setCurrentCode = lang === "js" ? setJsCode : setPyCode;
  const currentBlanks = lang === "js" ? lesson.blanks : PY_BLANKS[lessonIdx] || [];
  const currentSols = lang === "js" ? lesson.solutions : PY_SOLUTIONS[lessonIdx] || [];
  const currentStarter = lang === "js" ? lesson.starterCode : PY_STARTERS[lessonIdx];

  const switchLesson = (idx) => {
    setLessonIdx(idx);
    setJsCode(LESSONS_DATA[idx].starterCode);
    setPyCode(PY_STARTERS[idx]);
    setRunResult(null);
    setShowHint(false);
    setTraceSteps([]);
    setTraceIdx(0);
    setTab("concept");
  };

  // Build the demo-tab trace from the current demo inputs
  const buildDemoTrace = useCallback(() => {
    let steps = [];
    switch (lessonIdx) {
      case 0: steps = traceClimbingStairsTab(demoN); break;
      case 1: steps = traceHouseRobberTab(demoNums); break;
      case 2: steps = traceCoinChangeTab(demoCoins, demoAmount); break;
      case 3: steps = traceLCSTab(demoS1, demoS2); break;
      case 4: steps = traceKnapsackTab(demoValues, demoWeights, demoCapacity); break;
      case 5: steps = traceEditDistanceTab(demoEd1, demoEd2); break;
      default: steps = [];
    }
    setTraceSteps(steps);
    setTraceIdx(0);
  }, [lessonIdx, demoN, demoNums, demoCoins, demoAmount, demoS1, demoS2, demoValues, demoWeights, demoCapacity, demoEd1, demoEd2]);

  // Build a trace using the SAME inputs as the lesson's test suite, so the
  // post-Run trace matches exactly what just executed (mirrors DSA01's
  // buildTestTrace — falls back to the demo trace if nothing test-specific applies).
  const buildTestTrace = useCallback(() => {
    let steps = [];
    switch (lessonIdx) {
      case 0: steps = traceClimbingStairsTab(5); break;
      case 1: steps = traceHouseRobberTab([2, 7, 9, 3, 1]); break;
      case 2: steps = traceCoinChangeTab([1, 2, 5], 11); break;
      case 3: steps = traceLCSTab("abcde", "ace"); break;
      case 4: steps = traceKnapsackTab([60, 100, 120], [1, 2, 3], 5); break;
      case 5: steps = traceEditDistanceTab("horse", "ros"); break;
      default: steps = [];
    }
    if (steps.length) { setTraceSteps(steps); setTraceIdx(0); }
    else buildDemoTrace();
  }, [lessonIdx, buildDemoTrace]);

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);

    const codeToCheck = lang === "js" ? jsCode : pyCode;
    const hasBlanks = lesson.blanks?.some((b) => codeToCheck.includes(b)) ?? false;

    if (lang === "js") {
      const res = runJS(lesson, jsCode);
      setRunResult(res);
      if (res.testResult?.ok) setCompleted((c) => new Set([...c, lessonIdx]));
      if (lesson.hasTrace && !res.error && !hasBlanks) buildTestTrace();
      else if (hasBlanks || res.error) setTraceSteps([]);
    } else {
      try {
        const { getPyodide } = await import("../../utils/pyodideRuntime.js").catch(() => ({ getPyodide: null }));
        if (!getPyodide) {
          setRunResult({ error: "Pyodide runtime not available." });
          setRunning(false);
          return;
        }
        const pyodide = await getPyodide();
        const fullCode = `${pyCode}\n${PY_HARNESSES[lessonIdx]}`;
        await pyodide.runPythonAsync(fullCode);
        const proxy = pyodide.globals.get("_matrix_result");
        const parsed = JSON.parse(typeof proxy === "string" ? proxy : proxy.toString());
        if (typeof proxy?.destroy === "function") proxy.destroy();
        setRunResult({ testResult: { ok: parsed.ok, checks: parsed.checks, result: parsed.result } });
        if (parsed.ok) setCompleted((c) => new Set([...c, lessonIdx]));
        if (lesson.hasTrace && !hasBlanks) buildTestTrace();
        else setTraceSteps([]);
      } catch (e) {
        setRunResult({ error: e.message || String(e) });
        setTraceSteps([]);
      }
    }
    setRunning(false);
  };

  const handleReveal = () => {
    let code = currentStarter;
    currentBlanks.forEach((b, i) => { code = code.replace(b, currentSols[i] || ""); });
    setCurrentCode(code);
  };

  const btn = (style = {}) => ({
    cursor: "pointer", fontFamily: mono, border: `1px solid ${C.border2}`, borderRadius: 4,
    background: "transparent", color: C.muted, fontSize: 11, padding: "0 10px", height: 26, ...style,
  });
  const label9 = { fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, color: C.muted };
  const traceNavBtns = [
    ["«", () => setTraceIdx(0)],
    ["‹", () => setTraceIdx((i) => Math.max(0, i - 1))],
    ["›", () => setTraceIdx((i) => Math.min(traceSteps.length - 1, i + 1))],
    ["»", () => setTraceIdx(traceSteps.length - 1)],
  ];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: sans, color: C.text, overflow: "hidden" }}>
      {/* ═══ HEADER ═══ */}
      <div style={{ height: 48, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 18px", gap: 14, flexShrink: 0 }}>
        {onBack && (
          <button onClick={onBack} style={btn({ height: 28, display: "flex", alignItems: "center", gap: 5 })}>
            ‹ Back
          </button>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", borderRadius: 4, background: `${C.green}18`, border: `1px solid ${C.green}44` }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
          <span style={{ fontSize: 10, fontFamily: mono, color: C.green, letterSpacing: "0.12em", fontWeight: 700 }}>DP LAB</span>
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, color: C.bright, letterSpacing: -0.3 }}>Dynamic Programming</div>
        <div style={{ fontSize: 11, color: C.textDim, fontFamily: mono }}>dp[i] → dp[i][j] → the table fills itself</div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          {LESSONS.map((l, i) => {
            const done = completed.has(i);
            const active = i === lessonIdx;
            return (
              <button
                key={i}
                onClick={() => switchLesson(i)}
                style={{
                  height: 28, padding: "0 12px", borderRadius: 14,
                  background: active ? `${l.color}22` : "transparent",
                  border: `1px solid ${active ? l.color : C.border2}`,
                  color: active ? l.color : done ? C.muted : C.textDim,
                  fontSize: 10, fontWeight: active ? 700 : 400,
                  cursor: "pointer", fontFamily: mono,
                  display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s",
                }}
              >
                {done && <span style={{ fontSize: 8, color: C.green }}>✓</span>}
                {l.shortTitle}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* ── LEFT: Concept panel ── */}
        <div style={{ width: 380, minWidth: 300, maxWidth: 440, background: C.panel, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ padding: "12px 16px 10px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: lc, background: `${lc}18`, border: `1px solid ${lc}30`, borderRadius: 3, padding: "2px 7px", fontFamily: mono, textTransform: "uppercase" }}>
                {lesson.tag}
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.bright, letterSpacing: -0.3 }}>{lesson.title}</div>
          </div>

          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            {[["concept", "Concept"], ["pseudo", "Pseudocode"], ["demo", "Demo"]].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  flex: 1, padding: "8px 0", fontSize: 11, fontWeight: tab === id ? 700 : 400,
                  color: tab === id ? lc : C.muted, background: "transparent", border: "none",
                  borderBottom: `2px solid ${tab === id ? lc : "transparent"}`,
                  cursor: "pointer", fontFamily: mono, letterSpacing: "0.04em", transition: "color .12s",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
            {tab === "concept" && (
              <>
                {lesson.concept.map((b, i) => (
                  <div key={i} style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: lc, letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase", fontFamily: mono }}>{b.head}</div>
                    <pre style={{ fontSize: 13, color: C.textDim, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, fontFamily: mono }}>{b.body}</pre>
                  </div>
                ))}
              </>
            )}

            {tab === "pseudo" && (
              <div>
                <div style={{ marginBottom: 12, padding: "8px 12px", background: `${lc}10`, border: `1px solid ${lc}30`, borderRadius: 6, fontSize: 11, color: C.textDim, lineHeight: 1.6, fontFamily: mono }}>
                  <span style={{ color: lc, fontWeight: 700 }}>How to use: </span>
                  Read top to bottom, hover any line for a plain-English explanation, then fill in the <code style={{ color: lc, background: `${lc}15`, padding: "1px 5px", borderRadius: 3 }}>___</code> blank in the editor.
                </div>
                <PseudoBlock lines={lesson.pseudoLines} C={C} />
              </div>
            )}

            {tab === "demo" && (
              <div>
                <div style={{ ...label9, marginBottom: 10 }}>Interactive Demo</div>

                {lessonIdx === 0 && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 10, color: C.textDim, fontFamily: mono, width: 30 }}>n</span>
                    <input type="number" value={demoN} min={1} max={12} onChange={(e) => setDemoN(+e.target.value)}
                      style={{ width: 60, padding: "3px 6px", background: C.dim, border: `1px solid ${C.border2}`, borderRadius: 3, color: C.text, fontFamily: mono, fontSize: 11 }} />
                    <button onClick={buildDemoTrace} style={{ padding: "4px 12px", background: `${lc}18`, border: `1px solid ${lc}44`, borderRadius: 3, color: lc, fontSize: 10, cursor: "pointer", fontFamily: mono }}>Trace</button>
                  </div>
                )}
                {lessonIdx === 1 && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: C.textDim, fontFamily: mono }}>nums = [{demoNums.join(", ")}]</span>
                    <button onClick={buildDemoTrace} style={{ padding: "4px 12px", background: `${lc}18`, border: `1px solid ${lc}44`, borderRadius: 3, color: lc, fontSize: 10, cursor: "pointer", fontFamily: mono }}>Trace</button>
                  </div>
                )}
                {lessonIdx === 2 && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: C.textDim, fontFamily: mono }}>coins = [{demoCoins.join(", ")}]</span>
                    <span style={{ fontSize: 10, color: C.textDim, fontFamily: mono, width: 50 }}>amount</span>
                    <input type="number" value={demoAmount} min={0} max={20} onChange={(e) => setDemoAmount(+e.target.value)}
                      style={{ width: 50, padding: "3px 6px", background: C.dim, border: `1px solid ${C.border2}`, borderRadius: 3, color: C.text, fontFamily: mono, fontSize: 11 }} />
                    <button onClick={buildDemoTrace} style={{ padding: "4px 12px", background: `${lc}18`, border: `1px solid ${lc}44`, borderRadius: 3, color: lc, fontSize: 10, cursor: "pointer", fontFamily: mono }}>Trace</button>
                  </div>
                )}
                {lessonIdx === 3 && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                    <input type="text" value={demoS1} onChange={(e) => setDemoS1(e.target.value)}
                      style={{ width: 70, padding: "3px 6px", background: C.dim, border: `1px solid ${C.border2}`, borderRadius: 3, color: C.text, fontFamily: mono, fontSize: 11 }} />
                    <input type="text" value={demoS2} onChange={(e) => setDemoS2(e.target.value)}
                      style={{ width: 70, padding: "3px 6px", background: C.dim, border: `1px solid ${C.border2}`, borderRadius: 3, color: C.text, fontFamily: mono, fontSize: 11 }} />
                    <button onClick={buildDemoTrace} style={{ padding: "4px 12px", background: `${lc}18`, border: `1px solid ${lc}44`, borderRadius: 3, color: lc, fontSize: 10, cursor: "pointer", fontFamily: mono }}>Trace</button>
                  </div>
                )}
                {lessonIdx === 4 && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: C.textDim, fontFamily: mono }}>values=[{demoValues.join(",")}] weights=[{demoWeights.join(",")}] cap={demoCapacity}</span>
                    <button onClick={buildDemoTrace} style={{ padding: "4px 12px", background: `${lc}18`, border: `1px solid ${lc}44`, borderRadius: 3, color: lc, fontSize: 10, cursor: "pointer", fontFamily: mono }}>Trace</button>
                  </div>
                )}
                {lessonIdx === 5 && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                    <input type="text" value={demoEd1} onChange={(e) => setDemoEd1(e.target.value)}
                      style={{ width: 70, padding: "3px 6px", background: C.dim, border: `1px solid ${C.border2}`, borderRadius: 3, color: C.text, fontFamily: mono, fontSize: 11 }} />
                    <input type="text" value={demoEd2} onChange={(e) => setDemoEd2(e.target.value)}
                      style={{ width: 70, padding: "3px 6px", background: C.dim, border: `1px solid ${C.border2}`, borderRadius: 3, color: C.text, fontFamily: mono, fontSize: 11 }} />
                    <button onClick={buildDemoTrace} style={{ padding: "4px 12px", background: `${lc}18`, border: `1px solid ${lc}44`, borderRadius: 3, color: lc, fontSize: 10, cursor: "pointer", fontFamily: mono }}>Trace</button>
                  </div>
                )}

                {traceSteps.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={label9}>Step {traceIdx + 1} of {traceSteps.length}</span>
                      <div style={{ display: "flex", gap: 3 }}>
                        {traceNavBtns.map(([lbl, fn], i) => (
                          <button key={i} onClick={fn} style={{ width: 26, height: 24, background: C.dim, border: `1px solid ${C.border2}`, borderRadius: 3, color: C.textDim, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono }}>{lbl}</button>
                        ))}
                      </div>
                    </div>
                    <input type="range" min={0} max={traceSteps.length - 1} value={traceIdx} onChange={(e) => setTraceIdx(+e.target.value)} style={{ width: "100%", accentColor: lc, marginBottom: 10 }} />
                    {cur && (
                      <DPTableViz
                        kind={cur.kind}
                        table={cur.table}
                        cursor={cur.cursor}
                        sources={cur.sources}
                        cellKind={cur.cellKind}
                        decision={cur.decision}
                        label={cur.note}
                        C={C}
                      />
                    )}
                  </div>
                )}

                <div style={{ marginTop: 20, padding: "10px 12px", background: C.dim, border: `1px solid ${C.border}`, borderRadius: 6, borderLeft: `3px solid ${lc}` }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, marginBottom: 4 }}>Real-World Connection</div>
                  <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6, fontFamily: mono }}>{lesson.realWorldNote}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER: Code editor ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg, overflow: "hidden", minWidth: 300 }}>
          <div style={{ height: 44, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 14px", gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleRun}
              disabled={running}
              style={{
                height: 30, padding: "0 18px", borderRadius: 6,
                background: isComplete ? `linear-gradient(135deg, ${C.green}, ${C.blue})` : `linear-gradient(135deg, ${C.blue}, ${C.purple})`,
                border: "none", color: "#fff", fontSize: 12, fontWeight: 700,
                cursor: running ? "default" : "pointer", fontFamily: sans, letterSpacing: "0.02em",
                display: "flex", alignItems: "center", gap: 6, opacity: running ? 0.6 : 1,
                boxShadow: `0 0 12px ${C.blue}44`, transition: "all 0.2s ease-out",
              }}
            >
              <span style={{ fontSize: 9 }}>{running ? "⟳" : "▶"}</span>
              {running ? "Running…" : isComplete ? "Re-run" : "Run"}
            </button>

            <button onClick={() => setShowHint((h) => !h)} style={btn({ color: showHint ? lc : C.muted, border: `1px solid ${showHint ? lc + "44" : C.border2}` })}>
              {showHint ? "Hide Hint" : "Hint"}
            </button>
            <button onClick={handleReveal} style={btn()}>Reveal</button>

            {lesson.hasTrace && (
              <button
                onClick={buildTestTrace}
                style={{ height: 28, padding: "0 14px", borderRadius: 6, background: `linear-gradient(135deg, ${C.purple}, ${C.blue})`, border: "none", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: sans, boxShadow: `0 0 10px ${C.purple}44` }}
                title="Replay the algorithm trace — highlights the matching line in your code as each step runs"
              >
                ▶ Trace
              </button>
            )}

            {isComplete && (
              <span style={{ fontSize: 10, color: C.green, background: `${C.green}14`, border: `1px solid ${C.green}40`, borderRadius: 12, padding: "3px 10px", fontFamily: mono }}>✓ passing</span>
            )}

            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              {[["js", "JS", "#f7df1e"], ["python", "Python", "#7dd3fc"]].map(([id, label, accent]) => (
                <button
                  key={id}
                  onClick={() => { setLang(id); setRunResult(null); }}
                  style={{
                    height: 24, padding: "0 10px", borderRadius: 4,
                    background: lang === id ? `${accent}18` : "transparent",
                    border: `1px solid ${lang === id ? accent : C.border2}`,
                    color: lang === id ? accent : C.muted, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: mono,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {showHint && (
            <div style={{ padding: "8px 14px", background: C.panel, borderBottom: `1px solid ${C.amber}33`, fontSize: 11, color: C.amber, fontFamily: mono, lineHeight: 1.6, flexShrink: 0 }}>
              <span style={{ fontWeight: 700, marginRight: 8, color: `${C.amber}99` }}>hint</span>
              {currentBlanks.map((b, i) => (
                <div key={i} style={{ color: C.amber, marginTop: 3 }}>
                  <code style={{ color: lc, background: `${lc}15`, padding: "1px 5px", borderRadius: 3, fontSize: 11 }}>{b}</code>
                  {" → "}
                  <code style={{ color: C.text }}>{currentSols[i]}</code>
                </div>
              ))}
            </div>
          )}

          <div style={{ flex: 1, overflow: "hidden" }}>
            <Editor
              height="100%"
              language={lang === "python" ? "python" : "javascript"}
              value={currentCode}
              onChange={(val) => setCurrentCode(val || "")}
              beforeMount={(monaco) => { monacoRef.current = monaco; setupOpenCalcMonaco(monaco); }}
              onMount={(editor) => { editorRef.current = editor; }}
              theme={isDarkGlobal ? "open-calc-dark" : "open-calc-light"}
              options={{
                fontSize: 14, lineHeight: 24, minimap: { enabled: false }, scrollBeyondLastLine: false,
                wordWrap: "on", tabSize: 2, renderLineHighlight: "line", padding: { top: 16, bottom: 16 },
                smoothScrolling: true, cursorBlinking: "smooth", fontLigatures: true,
                fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace", letterSpacing: 0.3,
              }}
            />
          </div>

          <div style={{ flexShrink: 0, background: C.panel, borderTop: `1px solid ${C.border}`, maxHeight: "48%", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0, background: C.surface }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, color: C.muted }}>Output</span>
              {isComplete && <span style={{ fontSize: 10, color: C.green, background: `${HX.green}18`, border: `1px solid ${HX.green}44`, borderRadius: 10, padding: "2px 9px", fontFamily: mono }}>✓ passing</span>}
              {traceSteps.length > 0 && (
                <>
                  <span style={{ color: C.border2, fontSize: 10 }}>|</span>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, color: C.muted }}>Trace {traceIdx + 1}/{traceSteps.length}</span>
                  <div style={{ display: "flex", gap: 3 }}>
                    {traceNavBtns.map(([lbl, fn], i) => (
                      <button key={i} onClick={fn} style={{ width: 22, height: 20, borderRadius: 3, background: C.dim, border: `1px solid ${C.border2}`, color: C.textDim, fontSize: 11, cursor: "pointer", fontFamily: mono }}>{lbl}</button>
                    ))}
                  </div>
                  <input type="range" min={0} max={traceSteps.length - 1} value={traceIdx} onChange={(e) => setTraceIdx(+e.target.value)} style={{ flex: 1, maxWidth: 200, accentColor: HX.blue }} />
                </>
              )}
            </div>

            <div style={{ padding: "10px 14px", display: "flex", gap: 16, flexWrap: "wrap", minHeight: 80 }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                {!runResult && !running && (
                  <div style={{ fontSize: 12, color: C.muted, fontFamily: mono, lineHeight: 1.8 }}>
                    1. Read <span style={{ color: HX.blue }}>Pseudocode</span> tab &nbsp;→&nbsp;
                    fill in <span style={{ color: lc }}>___</span> &nbsp;→&nbsp;
                    press <span style={{ color: HX.green }}>Run</span>
                  </div>
                )}
                {running && <div style={{ fontSize: 11, color: C.textDim, fontFamily: mono }}>⟳ Running…</div>}
                {runResult?.error && (
                  <div style={{ background: `${HX.red}14`, border: `1px solid ${HX.red}44`, borderRadius: 6, padding: "8px 10px" }}>
                    <div style={{ color: HX.red, fontSize: 10, fontWeight: 700, marginBottom: 3, fontFamily: mono }}>error</div>
                    <div style={{ color: HX.red, fontSize: 10, fontFamily: mono, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all", opacity: 0.85 }}>{runResult.error}</div>
                  </div>
                )}
                {runResult?.testResult && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
                    {runResult.testResult.checks.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: c.pass ? HX.green : HX.red, fontFamily: mono }}>{c.pass ? "✓" : "✗"}</span>
                        <span style={{ fontSize: 11, color: c.pass ? C.text : C.muted, fontFamily: mono }}>{c.label}</span>
                      </div>
                    ))}
                    <div style={{ width: "100%", marginTop: 6, padding: "7px 10px", borderRadius: 6, background: runResult.testResult.ok ? `${HX.green}14` : `${HX.red}14`, border: `1px solid ${runResult.testResult.ok ? HX.green + "44" : HX.red + "33"}` }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: runResult.testResult.ok ? HX.green : HX.red, fontFamily: mono }}>
                        {runResult.testResult.ok ? "✓ all tests pass" : "✗ tests failing"}
                      </span>
                      {runResult.testResult.result != null && (
                        <span style={{ fontSize: 12, color: lc, fontFamily: mono, marginLeft: 10 }}>→ {JSON.stringify(runResult.testResult.result)}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {cur && (
                <div style={{ flex: 2, minWidth: 300, overflowX: "auto" }}>
                  <DPTableViz
                    kind={cur.kind}
                    table={cur.table}
                    cursor={cur.cursor}
                    sources={cur.sources}
                    cellKind={cur.cellKind}
                    decision={cur.decision}
                    label={cur.note}
                    C={HX.dim ? C : C}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Real-world connection + Next ── */}
        <div style={{ width: 280, flexShrink: 0, background: C.panel, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, padding: "14px", overflowY: "auto" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, color: C.muted, marginBottom: 8 }}>Real-World Connection</div>
            <div style={{ padding: "10px 12px", background: C.dim, border: `1px solid ${C.border}`, borderRadius: 6, borderLeft: `3px solid ${lc}` }}>
              <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.7, fontFamily: mono, whiteSpace: "pre-line" }}>{lesson.realWorldNote}</div>
            </div>

            {lessonIdx < LESSONS.length - 1 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, color: C.muted, marginBottom: 8 }}>Next</div>
                <button
                  onClick={() => switchLesson(lessonIdx + 1)}
                  style={{
                    width: "100%", padding: "10px 14px", background: C.dim, border: `1px solid ${C.border2}`, borderRadius: 6,
                    color: C.textDim, fontSize: 12, cursor: "pointer", textAlign: "left", fontFamily: mono,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}
                >
                  <span>{LESSONS[lessonIdx + 1].title}</span>
                  <span style={{ color: lc }}>›</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
