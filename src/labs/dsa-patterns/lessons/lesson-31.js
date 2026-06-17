// DSA + Design Patterns — Lesson 31
export const lesson = {
  id: 'dsa-patterns-31',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '31. Greedy Algorithms + Strategy',
  checkpoints: [
    { id: 'cp-greedy', label: 'Greedy Conditions' },
    { id: 'cp-activity', label: 'Activity Selection' },
    { id: 'cp-strategy', label: 'Strategy Pattern' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: 'You need to schedule as many non-overlapping meetings as possible in a single room. Or make change for a dollar using the fewest coins. Or compress a file by encoding frequent characters with shorter bit strings. In each case, you are tempted to pick the locally best option at every step and hope it leads to a globally optimal solution. But does it? Greedy algorithms work only when a specific mathematical guarantee holds — and knowing when it does NOT is as important as the algorithm itself.',
      code: null,
    },
    {
      type: 'narration',
      id: 'dsa-1',
      text: 'A greedy algorithm makes the locally optimal choice at each step without reconsidering past decisions. It runs in O(n log n) or better — far faster than DP or exhaustive search. The two conditions that guarantee correctness are: (1) Greedy choice property — a globally optimal solution can always be reached by making a locally optimal choice. (2) Optimal substructure — the optimal solution to the whole problem contains optimal solutions to its subproblems.',
      code: null,
    },
    {
      type: 'narration',
      id: 'dsa-2',
      text: 'Activity selection: given a list of activities with start and finish times, select the maximum number of non-overlapping activities. The greedy rule is: always pick the activity with the earliest finish time that does not conflict with the last selected activity. Sorting by finish time takes O(n log n); the greedy scan is O(n). Proof sketch: choosing the earliest-finishing activity leaves the maximum remaining time for future activities.',
      code:
        'function activitySelection(activities) {\n' +
        '  // Sort by finish time  // ← NEW\n' +
        '  const sorted = [...activities].sort((a, b) => a[1] - b[1]);\n' +
        '  const selected = [sorted[0]];\n' +
        '  let lastFinish = sorted[0][1];\n' +
        '\n' +
        '  for (let i = 1; i < sorted.length; i++) {\n' +
        '    const [start, finish] = sorted[i];\n' +
        '    if (start >= lastFinish) { // no overlap  // ← NEW\n' +
        '      selected.push(sorted[i]);\n' +
        '      lastFinish = finish;\n' +
        '    }\n' +
        '  }\n' +
        '  return selected;\n' +
        '}\n' +
        '\n' +
        'const acts = [[0,6],[1,4],[3,5],[3,8],[4,7],[5,9],[6,10],[8,11]];\n' +
        'const result = activitySelection(acts);\n' +
        'console.log("count", result.length);\n' +
        'console.log("selected", JSON.stringify(result));',
    },
    {
      type: 'narration',
      id: 'dsa-3',
      text: 'Coin change: find the minimum number of coins to make a given amount. For standard denominations like [1, 5, 10, 25] cents, greedy (always take the largest coin that fits) is optimal. But for arbitrary denominations like [1, 3, 4], greedy fails. For amount=6 with [1,3,4]: greedy picks 4 then 1+1, giving 3 coins. DP finds 3+3, giving only 2 coins. Greedy has no guarantee here because the denominations lack the "canonical" structure.',
      code:
        'function coinChangeGreedy(coins, amount) {\n' +
        '  const sorted = [...coins].sort((a, b) => b - a); // largest first  // ← NEW\n' +
        '  let count = 0, remaining = amount;\n' +
        '  const used = [];\n' +
        '  for (const coin of sorted) {\n' +
        '    while (remaining >= coin) {\n' +
        '      remaining -= coin;\n' +
        '      count++;\n' +
        '      used.push(coin);\n' +
        '    }\n' +
        '  }\n' +
        '  return remaining === 0 ? { count, used } : { count: -1, used: [] };\n' +
        '}\n' +
        '\n' +
        'function coinChangeDP(coins, amount) {\n' +
        '  const dp = new Array(amount + 1).fill(Infinity); // ← NEW\n' +
        '  dp[0] = 0;\n' +
        '  for (let a = 1; a <= amount; a++) {\n' +
        '    for (const coin of coins) {\n' +
        '      if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1);\n' +
        '    }\n' +
        '  }\n' +
        '  return dp[amount] === Infinity ? -1 : dp[amount];\n' +
        '}\n' +
        '\n' +
        'console.log("greedy [1,3,4] amount=6", JSON.stringify(coinChangeGreedy([1,3,4], 6)));\n' +
        'console.log("DP [1,3,4] amount=6", coinChangeDP([1,3,4], 6));',
    },
    {
      type: 'narration',
      id: 'dsa-4',
      text: 'Huffman encoding: assign shorter bit strings to more frequent characters. The greedy rule is: always merge the two nodes with the lowest frequency. Use a min-heap (priority queue) to efficiently find them. The merged node has frequency equal to the sum of its children. Repeat until one root remains. Time: O(n log n) where n is the number of distinct characters. This is optimal because the greedy merge always minimizes the weighted path length.',
      code:
        'class MinHeap {\n' +
        '  constructor() { this.heap = []; }\n' +
        '  push(node) {\n' +
        '    this.heap.push(node);\n' +
        '    this.heap.sort((a, b) => a.freq - b.freq);\n' +
        '  }\n' +
        '  pop() { return this.heap.shift(); }\n' +
        '  get size() { return this.heap.length; }\n' +
        '}\n' +
        '\n' +
        'function buildHuffman(freqs) {\n' +
        '  const heap = new MinHeap();\n' +
        '  for (const [char, freq] of Object.entries(freqs)) {\n' +
        '    heap.push({ char, freq, left: null, right: null }); // ← NEW\n' +
        '  }\n' +
        '  while (heap.size > 1) {\n' +
        '    const left = heap.pop();\n' +
        '    const right = heap.pop();\n' +
        '    heap.push({ char: null, freq: left.freq + right.freq, left, right }); // ← NEW\n' +
        '  }\n' +
        '  return heap.pop();\n' +
        '}\n' +
        '\n' +
        'function getCodes(node, prefix, codes) {\n' +
        '  if (!node.left && !node.right) { codes[node.char] = prefix || "0"; return; }\n' +
        '  if (node.left) getCodes(node.left, prefix + "0", codes);\n' +
        '  if (node.right) getCodes(node.right, prefix + "1", codes);\n' +
        '}\n' +
        '\n' +
        'const freqs = { a: 5, b: 2, c: 1, d: 3 };\n' +
        'const root = buildHuffman(freqs);\n' +
        'const codes = {};\n' +
        'getCodes(root, "", codes);\n' +
        'console.log("huffman codes", JSON.stringify(codes));',
    },
    {
      type: 'narration',
      id: 'dsa-5',
      text: 'The three greedy algorithms — activity selection, coin change, Huffman — solve completely different problems but share the same strategy shape: at each step, pick the best available option by a local criterion. The criterion differs (earliest finish, largest coin, lowest frequency), but the pattern is the same. This makes them ideal candidates for the Strategy design pattern.',
      code: null,
    },
    {
      type: 'narration',
      id: 'dsa-6',
      text: 'Knowing WHEN greedy works is the real insight. Greedy works for activity selection (proof: exchange argument — swapping any other activity for the earliest-finishing one never increases the count). Greedy works for canonical coin systems (proof: by the structure of denominations). Greedy works for Huffman (proof: optimality of the merge order). For coin change with arbitrary denominations, DP is the correct tool.',
      code: null,
    },
    {
      type: 'challenge',
      id: 'challenge-1',
      text: 'Run activity selection on [[0,6],[1,4],[3,5],[3,8],[4,7],[5,9],[6,10],[8,11]]. Print the count of selected activities.',
      expectedOutput: null,
      startCode:
        'function activitySelection(activities) {\n' +
        '  const sorted = [...activities].sort((a, b) => a[1] - b[1]);\n' +
        '  const selected = [sorted[0]];\n' +
        '  let lastFinish = sorted[0][1];\n' +
        '  // TODO: iterate and add non-overlapping activities\n' +
        '  return selected;\n' +
        '}\n' +
        '\n' +
        'const acts = [[0,6],[1,4],[3,5],[3,8],[4,7],[5,9],[6,10],[8,11]];\n' +
        'console.log(activitySelection(acts).length);',
      hint: 'For each sorted activity after the first: if activity[0] >= lastFinish, push it and update lastFinish = activity[1].',
      validate: ({ logs }) => {
        return logs.some(l => String(l).trim() === '4');
      },
    },
    { type: 'checkpoint', id: 'cp-greedy' },
    {
      type: 'narration',
      id: 'pattern-intro',
      text: 'The Strategy pattern defines a family of algorithms behind a common interface. The context object delegates to whichever strategy is currently set. For our problem-solver, the context is a Solver class with a solve(input) method. Strategies include GreedyStrategy, DPStrategy, and BruteForceStrategy. The caller swaps strategies at runtime without changing the Solver.',
      code: null,
    },
    {
      type: 'narration',
      id: 'pattern-code',
      text: 'Here is the Strategy wrapper for coin change. The same Solver class works whether we plug in the greedy or DP strategy. Swapping reveals the difference in result for [1,3,4] and amount=6.',
      code:
        'class GreedyCoinStrategy {\n' +
        '  solve({ coins, amount }) {\n' +
        '    const sorted = [...coins].sort((a, b) => b - a);\n' +
        '    let count = 0, rem = amount;\n' +
        '    for (const coin of sorted) { while (rem >= coin) { rem -= coin; count++; } }\n' +
        '    return rem === 0 ? count : -1;\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        'class DPCoinStrategy {\n' +
        '  solve({ coins, amount }) {\n' +
        '    const dp = new Array(amount + 1).fill(Infinity);\n' +
        '    dp[0] = 0;\n' +
        '    for (let a = 1; a <= amount; a++) {\n' +
        '      for (const coin of coins) {\n' +
        '        if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1);\n' +
        '      }\n' +
        '    }\n' +
        '    return dp[amount] === Infinity ? -1 : dp[amount];\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        'class Solver {\n' +
        '  constructor(strategy) { this.strategy = strategy; } // ← NEW\n' +
        '  setStrategy(s) { this.strategy = s; } // ← NEW\n' +
        '  solve(input) { return this.strategy.solve(input); } // ← NEW\n' +
        '}\n' +
        '\n' +
        'const solver = new Solver(new GreedyCoinStrategy());\n' +
        'console.log("greedy", solver.solve({ coins: [1,3,4], amount: 6 })); // 3\n' +
        'solver.setStrategy(new DPCoinStrategy());\n' +
        'console.log("dp", solver.solve({ coins: [1,3,4], amount: 6 })); // 2',
    },
    {
      type: 'narration',
      id: 'pattern-meeting',
      text: 'The meeting point: greedy algorithms and the Strategy pattern both answer the question "which rule drives the next decision?" In a greedy algorithm the rule is embedded in the algorithm itself (earliest finish time, largest coin). In the Strategy pattern the rule is extracted into a separate class so it can be swapped. Together they let us compare algorithms side by side and swap them without rewriting the surrounding infrastructure.',
      code: null,
    },
    {
      type: 'challenge',
      id: 'challenge-2',
      text: 'Show that greedy coin change gives 3 coins for [1,3,4] amount=6, while DP gives 2 coins. Print both results.',
      expectedOutput: null,
      startCode:
        'class GreedyCoinStrategy {\n' +
        '  solve({ coins, amount }) {\n' +
        '    const sorted = [...coins].sort((a, b) => b - a);\n' +
        '    let count = 0, rem = amount;\n' +
        '    for (const coin of sorted) { while (rem >= coin) { rem -= coin; count++; } }\n' +
        '    return rem === 0 ? count : -1;\n' +
        '  }\n' +
        '}\n' +
        'class DPCoinStrategy {\n' +
        '  solve({ coins, amount }) {\n' +
        '    const dp = new Array(amount + 1).fill(Infinity);\n' +
        '    dp[0] = 0;\n' +
        '    for (let a = 1; a <= amount; a++) {\n' +
        '      for (const coin of coins) {\n' +
        '        if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1);\n' +
        '      }\n' +
        '    }\n' +
        '    return dp[amount] === Infinity ? -1 : dp[amount];\n' +
        '  }\n' +
        '}\n' +
        'class Solver {\n' +
        '  constructor(strategy) { this.strategy = strategy; }\n' +
        '  setStrategy(s) { this.strategy = s; }\n' +
        '  solve(input) { return this.strategy.solve(input); }\n' +
        '}\n' +
        '\n' +
        'const solver = new Solver(new GreedyCoinStrategy());\n' +
        'const input = { coins: [1,3,4], amount: 6 };\n' +
        'console.log(solver.solve(input));\n' +
        'solver.setStrategy(new DPCoinStrategy());\n' +
        'console.log(solver.solve(input));',
      hint: 'The code is complete. Run it and verify: greedy returns 3, DP returns 2.',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim());
        return strs.includes('3') && strs.includes('2');
      },
    },
    { type: 'checkpoint', id: 'cp-activity' },
    {
      type: 'narration',
      id: 'combined-narration',
      text: 'A complete activity-selection Strategy demonstrates all three components: the algorithm lives in the strategy, the context (Solver) is stable, and the caller decides which algorithm to use. Adding Huffman encoding as a fourth strategy means writing one new class — the Solver stays untouched. That is the Open/Closed Principle: closed for modification, open for extension.',
      code:
        'class ActivitySelectionStrategy {\n' +
        '  solve({ activities }) {\n' +
        '    const sorted = [...activities].sort((a, b) => a[1] - b[1]);\n' +
        '    const result = [sorted[0]];\n' +
        '    let last = sorted[0][1];\n' +
        '    for (let i = 1; i < sorted.length; i++) {\n' +
        '      if (sorted[i][0] >= last) { result.push(sorted[i]); last = sorted[i][1]; }\n' +
        '    }\n' +
        '    return result.length;\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        'class Solver {\n' +
        '  constructor(strategy) { this.strategy = strategy; }\n' +
        '  setStrategy(s) { this.strategy = s; }\n' +
        '  solve(input) { return this.strategy.solve(input); }\n' +
        '}\n' +
        '\n' +
        'const solver = new Solver(new ActivitySelectionStrategy());\n' +
        'const acts = [[0,6],[1,4],[3,5],[3,8],[4,7],[5,9],[6,10],[8,11]];\n' +
        'console.log("max activities", solver.solve({ activities: acts }));',
    },
    {
      type: 'challenge',
      id: 'challenge-3',
      text: 'Using the Solver + ActivitySelectionStrategy, solve activity selection for [[0,6],[1,4],[3,5],[3,8],[4,7],[5,9],[6,10],[8,11]]. Print the count.',
      expectedOutput: null,
      startCode:
        'class ActivitySelectionStrategy {\n' +
        '  solve({ activities }) {\n' +
        '    const sorted = [...activities].sort((a, b) => a[1] - b[1]);\n' +
        '    const result = [sorted[0]];\n' +
        '    let last = sorted[0][1];\n' +
        '    // TODO: iterate and select non-overlapping activities\n' +
        '    return result.length;\n' +
        '  }\n' +
        '}\n' +
        'class Solver {\n' +
        '  constructor(strategy) { this.strategy = strategy; }\n' +
        '  solve(input) { return this.strategy.solve(input); }\n' +
        '}\n' +
        '\n' +
        'const solver = new Solver(new ActivitySelectionStrategy());\n' +
        'const acts = [[0,6],[1,4],[3,5],[3,8],[4,7],[5,9],[6,10],[8,11]];\n' +
        'console.log(solver.solve({ activities: acts }));',
      hint: 'For i from 1 to sorted.length-1: if sorted[i][0] >= last, push to result and update last = sorted[i][1].',
      validate: ({ logs }) => {
        return logs.some(l => String(l).trim() === '4');
      },
    },
    { type: 'checkpoint', id: 'cp-strategy' },
    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Let\'s trace the activity selection algorithm step by step. Watch how sorting by finish time and comparing start times greedily builds the maximum non-overlapping set.',
      code: null,
    },
    {
      type: 'codelens',
      id: 'codelens-1',
      text: 'Step through activity selection: each iteration either picks or skips an activity.',
      lang: 'js',
      code:
        'const activities = [[0,6],[1,4],[3,5],[3,8],[4,7],[5,9],[6,10],[8,11]];\n' +
        'const sorted = [...activities].sort((a, b) => a[1] - b[1]);\n' +
        'const selected = [sorted[0]];\n' +
        'let lastFinish = sorted[0][1];\n' +
        'console.log("start with", JSON.stringify(sorted[0]));\n' +
        '\n' +
        'for (let i = 1; i < sorted.length; i++) {\n' +
        '  const [start, finish] = sorted[i];\n' +
        '  if (start >= lastFinish) {\n' +
        '    selected.push(sorted[i]);\n' +
        '    lastFinish = finish;\n' +
        '    console.log("picked", JSON.stringify(sorted[i]));\n' +
        '  } else {\n' +
        '    console.log("skipped", JSON.stringify(sorted[i]));\n' +
        '  }\n' +
        '}\n' +
        'console.log("total selected", selected.length);',
    },
  ],
};
