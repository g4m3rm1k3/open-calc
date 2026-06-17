// DSA + Design Patterns — Lesson 30
export const lesson = {
  id: 'dsa-patterns-30',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '30. Knapsack + Strategy',
  checkpoints: [
    { id: 'cp-knapsack', label: '0/1 Knapsack' },
    { id: 'cp-unbounded', label: 'Unbounded Knapsack' },
    { id: 'cp-strategy', label: 'Strategy Pattern' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: 'You have a backpack with a weight limit. There are items, each with a weight and a value. You want to pack the highest total value without exceeding the limit. The catch: you cannot take fractions of items, and each item can only be used once. With even 30 items, brute-forcing all subsets takes over a billion operations. We need a smarter approach.',
      code: null,
    },
    {
      type: 'narration',
      id: 'dsa-1',
      text: 'The 0/1 Knapsack problem is solved with dynamic programming. Define dp[i][w] as the maximum value achievable using the first i items with a weight capacity of w. "0/1" means each item is either taken (1) or skipped (0) — no partial items. The table has (n+1) rows and (capacity+1) columns, giving O(n × capacity) time and space — both are pseudopolynomial (polynomial in the numeric value of the input, not its bit length).',
      code: null,
    },
    {
      type: 'narration',
      id: 'dsa-2',
      text: 'The recurrence has two cases. If item i\'s weight exceeds the current capacity w, we cannot take it: dp[i][w] = dp[i-1][w]. Otherwise, we choose the better of skipping (dp[i-1][w]) or taking it (dp[i-1][w - weight[i]] + value[i]). The base case is dp[0][w] = 0 for all w — no items means no value.',
      code:
        'function knapsack01(capacity, items) {\n' +
        '  const n = items.length;\n' +
        '  // dp[i][w] = max value with first i items, capacity w  // ← NEW\n' +
        '  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));\n' +
        '\n' +
        '  for (let i = 1; i <= n; i++) {\n' +
        '    const { w, v } = items[i - 1];\n' +
        '    for (let cap = 0; cap <= capacity; cap++) {\n' +
        '      dp[i][cap] = dp[i - 1][cap]; // default: skip item i  // ← NEW\n' +
        '      if (w <= cap) {\n' +
        '        dp[i][cap] = Math.max(dp[i][cap], dp[i - 1][cap - w] + v); // ← NEW\n' +
        '      }\n' +
        '    }\n' +
        '  }\n' +
        '  return dp[n][capacity];\n' +
        '}\n' +
        '\n' +
        'const items = [{w:2,v:6},{w:2,v:10},{w:3,v:12}];\n' +
        'console.log("max value", knapsack01(6, items)); // 22',
    },
    {
      type: 'narration',
      id: 'dsa-3',
      text: 'The 2D table uses O(n × capacity) space. We can reduce this to O(capacity) by using a single 1D array and iterating capacity backwards. Backwards iteration is critical: it prevents an item from being counted twice in the same pass, which would accidentally turn it into an unbounded item.',
      code:
        'function knapsack01Optimized(capacity, items) {\n' +
        '  const dp = new Array(capacity + 1).fill(0); // ← NEW: 1D array\n' +
        '\n' +
        '  for (const { w, v } of items) {\n' +
        '    // Iterate backwards to prevent double-counting  // ← NEW\n' +
        '    for (let cap = capacity; cap >= w; cap--) {\n' +
        '      dp[cap] = Math.max(dp[cap], dp[cap - w] + v);\n' +
        '    }\n' +
        '  }\n' +
        '  return dp[capacity];\n' +
        '}\n' +
        '\n' +
        'const items = [{w:2,v:6},{w:2,v:10},{w:3,v:12}];\n' +
        'console.log("optimized", knapsack01Optimized(6, items)); // 22',
    },
    {
      type: 'narration',
      id: 'dsa-4',
      text: 'Unbounded knapsack allows each item to be used any number of times. The only change: iterate capacity forwards instead of backwards. When we compute dp[cap] for item w, dp[cap - w] has already been updated in this same pass — meaning item w can be used again. O(n × capacity) time, O(capacity) space.',
      code:
        'function knapsackUnbounded(capacity, items) {\n' +
        '  const dp = new Array(capacity + 1).fill(0);\n' +
        '\n' +
        '  for (const { w, v } of items) {\n' +
        '    for (let cap = w; cap <= capacity; cap++) { // ← NEW: forwards!\n' +
        '      dp[cap] = Math.max(dp[cap], dp[cap - w] + v);\n' +
        '    }\n' +
        '  }\n' +
        '  return dp[capacity];\n' +
        '}\n' +
        '\n' +
        'const items = [{w:2,v:6},{w:2,v:10},{w:3,v:12}];\n' +
        'console.log("unbounded", knapsackUnbounded(6, items)); // 30',
    },
    {
      type: 'narration',
      id: 'dsa-5',
      text: 'Fractional knapsack — where you can take a fraction of an item — is NOT solved by DP. It is solved greedily: sort items by value/weight ratio and take as much of the best-ratio item as fits. This works because fractions remove the combinatorial constraint. O(n log n) for the sort. Knowing which algorithm fits which variant is as important as the algorithm itself.',
      code:
        'function knapsackFractional(capacity, items) {\n' +
        '  // Sort by value-per-weight descending  // ← NEW\n' +
        '  const sorted = [...items].sort((a, b) => (b.v / b.w) - (a.v / a.w));\n' +
        '  let totalValue = 0;\n' +
        '  let remaining = capacity;\n' +
        '\n' +
        '  for (const { w, v } of sorted) {\n' +
        '    if (remaining <= 0) break;\n' +
        '    const take = Math.min(w, remaining); // ← NEW: take fraction if needed\n' +
        '    totalValue += take * (v / w);\n' +
        '    remaining -= take;\n' +
        '  }\n' +
        '  return totalValue;\n' +
        '}\n' +
        '\n' +
        'const items = [{w:2,v:6},{w:2,v:10},{w:3,v:12}];\n' +
        'console.log("fractional", knapsackFractional(6, items).toFixed(2));',
    },
    {
      type: 'narration',
      id: 'dsa-6',
      text: 'The three knapsack variants share a single interface: given capacity and items, return max value. The algorithm differs per variant. This is the exact shape the Strategy pattern is designed for: a family of interchangeable algorithms behind a common interface.',
      code: null,
    },
    {
      type: 'challenge',
      id: 'challenge-1',
      text: 'Solve the 0/1 knapsack with capacity=6 and items=[{w:2,v:6},{w:2,v:10},{w:3,v:12}]. Print the result with console.log.',
      expectedOutput: null,
      startCode:
        'function knapsack01(capacity, items) {\n' +
        '  const dp = new Array(capacity + 1).fill(0);\n' +
        '  for (const { w, v } of items) {\n' +
        '    // TODO: iterate correctly to avoid double-counting\n' +
        '  }\n' +
        '  return dp[capacity];\n' +
        '}\n' +
        '\n' +
        'const items = [{w:2,v:6},{w:2,v:10},{w:3,v:12}];\n' +
        'console.log(knapsack01(6, items));',
      hint: 'Iterate cap from capacity down to w (inclusive). dp[cap] = Math.max(dp[cap], dp[cap - w] + v).',
      validate: ({ logs }) => {
        return logs.some(l => String(l).trim() === '22');
      },
    },
    { type: 'checkpoint', id: 'cp-knapsack' },
    {
      type: 'narration',
      id: 'pattern-intro',
      text: 'The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. The client (a Knapsack solver) holds a reference to a strategy object and delegates the solve call to it. Swapping strategies at runtime changes the algorithm without changing the client. This is exactly what we want: one Knapsack class, three solving strategies.',
      code: null,
    },
    {
      type: 'narration',
      id: 'pattern-code',
      text: 'Each strategy implements a solve(capacity, items) method. The Knapsack class stores the active strategy and delegates to it. Adding a new variant — say, a multi-dimensional knapsack — means adding one new strategy class, touching zero existing code.',
      code:
        'class ZeroOneStrategy {\n' +
        '  solve(capacity, items) {\n' +
        '    const dp = new Array(capacity + 1).fill(0);\n' +
        '    for (const { w, v } of items) {\n' +
        '      for (let cap = capacity; cap >= w; cap--) {\n' +
        '        dp[cap] = Math.max(dp[cap], dp[cap - w] + v);\n' +
        '      }\n' +
        '    }\n' +
        '    return dp[capacity];\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        'class UnboundedStrategy {\n' +
        '  solve(capacity, items) {\n' +
        '    const dp = new Array(capacity + 1).fill(0);\n' +
        '    for (const { w, v } of items) {\n' +
        '      for (let cap = w; cap <= capacity; cap++) {\n' +
        '        dp[cap] = Math.max(dp[cap], dp[cap - w] + v);\n' +
        '      }\n' +
        '    }\n' +
        '    return dp[capacity];\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        'class Knapsack {\n' +
        '  constructor(strategy) { this.strategy = strategy; } // ← NEW\n' +
        '  setStrategy(strategy) { this.strategy = strategy; } // ← NEW\n' +
        '  solve(capacity, items) { return this.strategy.solve(capacity, items); } // ← NEW\n' +
        '}\n' +
        '\n' +
        'const knapsack = new Knapsack(new ZeroOneStrategy());\n' +
        'const items = [{w:2,v:6},{w:2,v:10},{w:3,v:12}];\n' +
        'console.log("0/1", knapsack.solve(6, items)); // 22\n' +
        'knapsack.setStrategy(new UnboundedStrategy());\n' +
        'console.log("unbounded", knapsack.solve(6, items));',
    },
    {
      type: 'narration',
      id: 'pattern-meeting',
      text: 'The meeting point: both 0/1 and unbounded knapsack share one structural insight — a 1D DP array of length capacity+1. The only difference is iteration direction. Strategy pattern makes that difference a first-class swap. The algorithm\'s identity lives in the strategy object, not scattered across if/else branches. Separating "what DP table to use" from "how to fill it" is the same separation the pattern enforces between context and algorithm.',
      code: null,
    },
    {
      type: 'challenge',
      id: 'challenge-2',
      text: 'Implement a Knapsack class that picks between 0/1 and unbounded strategies based on a boolean flag. Call solve(6, items) with unbounded=true and print the result.',
      expectedOutput: null,
      startCode:
        'class ZeroOneStrategy {\n' +
        '  solve(capacity, items) {\n' +
        '    const dp = new Array(capacity + 1).fill(0);\n' +
        '    for (const { w, v } of items) {\n' +
        '      for (let cap = capacity; cap >= w; cap--) dp[cap] = Math.max(dp[cap], dp[cap - w] + v);\n' +
        '    }\n' +
        '    return dp[capacity];\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        'class UnboundedStrategy {\n' +
        '  solve(capacity, items) {\n' +
        '    const dp = new Array(capacity + 1).fill(0);\n' +
        '    for (const { w, v } of items) {\n' +
        '      for (let cap = w; cap <= capacity; cap++) dp[cap] = Math.max(dp[cap], dp[cap - w] + v);\n' +
        '    }\n' +
        '    return dp[capacity];\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        'class Knapsack {\n' +
        '  constructor(unbounded) {\n' +
        '    // TODO: set this.strategy based on the unbounded flag\n' +
        '  }\n' +
        '  solve(capacity, items) {\n' +
        '    // TODO: delegate to strategy\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        'const items = [{w:2,v:6},{w:2,v:10},{w:3,v:12}];\n' +
        'const k = new Knapsack(true);\n' +
        'console.log(k.solve(6, items));',
      hint: 'In the constructor: this.strategy = unbounded ? new UnboundedStrategy() : new ZeroOneStrategy(). In solve: return this.strategy.solve(capacity, items).',
      validate: ({ logs }) => {
        return logs.some(l => String(l).trim() === '30');
      },
    },
    { type: 'checkpoint', id: 'cp-unbounded' },
    {
      type: 'narration',
      id: 'combined-narration',
      text: 'The full picture: 0/1 knapsack (iterate backwards), unbounded knapsack (iterate forwards), and fractional knapsack (greedy sort) are three members of the same problem family. Strategy pattern gives each its own class. The Knapsack context stays stable as new variants arrive. This is the Open/Closed Principle in action: open for extension (new strategy classes), closed for modification (Knapsack context unchanged).',
      code:
        'class FractionalStrategy {\n' +
        '  solve(capacity, items) {\n' +
        '    const sorted = [...items].sort((a, b) => (b.v / b.w) - (a.v / a.w));\n' +
        '    let total = 0, rem = capacity;\n' +
        '    for (const { w, v } of sorted) {\n' +
        '      if (rem <= 0) break;\n' +
        '      const take = Math.min(w, rem);\n' +
        '      total += take * (v / w);\n' +
        '      rem -= take;\n' +
        '    }\n' +
        '    return total;\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        'class Knapsack {\n' +
        '  constructor(strategy) { this.strategy = strategy; }\n' +
        '  setStrategy(s) { this.strategy = s; }\n' +
        '  solve(capacity, items) { return this.strategy.solve(capacity, items); }\n' +
        '}\n' +
        '\n' +
        'const items = [{w:2,v:6},{w:2,v:10},{w:3,v:12}];\n' +
        'const k = new Knapsack(new FractionalStrategy());\n' +
        'console.log("fractional value", k.solve(6, items).toFixed(2));',
    },
    {
      type: 'challenge',
      id: 'challenge-3',
      text: 'Using the Strategy pattern, create a Knapsack that solves with 0/1 and then unbounded strategies. Print both results.',
      expectedOutput: null,
      startCode:
        'class ZeroOneStrategy {\n' +
        '  solve(capacity, items) {\n' +
        '    const dp = new Array(capacity + 1).fill(0);\n' +
        '    for (const { w, v } of items) {\n' +
        '      for (let cap = capacity; cap >= w; cap--) dp[cap] = Math.max(dp[cap], dp[cap - w] + v);\n' +
        '    }\n' +
        '    return dp[capacity];\n' +
        '  }\n' +
        '}\n' +
        'class UnboundedStrategy {\n' +
        '  solve(capacity, items) {\n' +
        '    const dp = new Array(capacity + 1).fill(0);\n' +
        '    for (const { w, v } of items) {\n' +
        '      for (let cap = w; cap <= capacity; cap++) dp[cap] = Math.max(dp[cap], dp[cap - w] + v);\n' +
        '    }\n' +
        '    return dp[capacity];\n' +
        '  }\n' +
        '}\n' +
        'class Knapsack {\n' +
        '  constructor(strategy) { this.strategy = strategy; }\n' +
        '  setStrategy(s) { this.strategy = s; }\n' +
        '  solve(capacity, items) { return this.strategy.solve(capacity, items); }\n' +
        '}\n' +
        '\n' +
        'const items = [{w:2,v:6},{w:2,v:10},{w:3,v:12}];\n' +
        'const k = new Knapsack(new ZeroOneStrategy());\n' +
        'console.log(k.solve(6, items));\n' +
        'k.setStrategy(new UnboundedStrategy());\n' +
        'console.log(k.solve(6, items));',
      hint: 'The code is nearly complete. Just call k.solve twice and verify the output is 22 then 30.',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim());
        return strs.includes('22') && strs.includes('30');
      },
    },
    { type: 'checkpoint', id: 'cp-strategy' },
    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Let\'s trace the 0/1 knapsack 1D DP array as it fills for each item. Watch how backwards iteration ensures each item is used at most once.',
      code: null,
    },
    {
      type: 'codelens',
      id: 'codelens-1',
      text: 'Step through the 1D knapsack DP array, item by item, capacity by capacity.',
      lang: 'js',
      code:
        'const items = [{w:2,v:6},{w:2,v:10},{w:3,v:12}];\n' +
        'const capacity = 6;\n' +
        'const dp = new Array(capacity + 1).fill(0);\n' +
        '\n' +
        'for (const item of items) {\n' +
        '  const { w, v } = item;\n' +
        '  for (let cap = capacity; cap >= w; cap--) {\n' +
        '    dp[cap] = Math.max(dp[cap], dp[cap - w] + v);\n' +
        '  }\n' +
        '  console.log("after item w=" + w + " v=" + v + " dp=" + dp.join(","));\n' +
        '}\n' +
        'console.log("result", dp[capacity]);',
    },
  ],
};
