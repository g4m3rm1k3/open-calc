export default {
  id: 'dp1-001',
  slug: 'what-is-dynamic-programming',
  chapter: 'dp1',
  order: 1,
  title: 'What is Dynamic Programming?',
  subtitle: 'Overlapping subproblems, optimal substructure, and why naive recursion is a trap',
  tags: ['dynamic programming', 'memoization', 'tabulation', 'fibonacci', 'climbing stairs', 'recursion', 'cache'],
  aliases: 'DP memo table bottom-up top-down overlapping subproblems optimal substructure',

  hook: {
    question: 'Computing fib(50) naively takes over a trillion recursive calls. Computing it with dynamic programming takes 50. Both solve the same problem — the difference is whether you solve each subproblem once or over and over again. DP is the discipline of recognizing and eliminating that redundancy.',
    realWorldContext: 'Dynamic programming powers spell-checkers (edit distance), genome alignment (LCS), route optimization (shortest paths with state), resource scheduling (knapsack), option pricing (binomial trees), and autocomplete (Viterbi algorithm in HMMs). Every time a system needs an optimal answer over a structured space of possibilities, DP is likely under the hood.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**The central question DP answers:** "Have I already solved this exact subproblem?" If yes — return the cached answer. If no — solve it, cache it, return it. That is the entirety of dynamic programming.',
      '**Two necessary conditions.** A problem has a DP solution if and only if it has (1) **overlapping subproblems** — the same smaller problems appear repeatedly in the recursion tree — and (2) **optimal substructure** — the optimal solution to the whole problem can be built from optimal solutions to its subproblems. Fibonacci has overlapping subproblems. Shortest paths have optimal substructure. Most hard combinatorial problems have both.',
      '**Two implementation strategies.** Top-down memoization starts with the big problem, recurses, and caches as it goes. The recursion structure is natural — you write it exactly like the naive version, then add a dictionary. Bottom-up tabulation starts with the smallest subproblems, fills a table, and builds toward the answer. It avoids recursion overhead and is usually faster in practice.',
      '**Climbing Stairs:** the gateway problem. You can take 1 or 2 steps at a time. How many distinct ways to reach step n? To reach step n you must come from step n-1 (one step) or step n-2 (two steps). So ways(n) = ways(n-1) + ways(n-2). This is Fibonacci in disguise — the same recurrence, different framing. This is the pattern: express the answer to a big problem in terms of answers to smaller ones.',
    ],
    callouts: [
      { type: 'sequencing', title: 'Chapter 1, Lesson 1: What is DP?', body: '**This lesson:** The core mental model — overlapping subproblems, memoization, tabulation.\n**Next:** 1D DP patterns — house robber, min cost climbing stairs.\n**Then:** 2D DP — grids, sequences, edit distance.' },
      { type: 'insight', title: 'Memoization vs tabulation: when to use each', body: 'Memoization is easier to write (same structure as naive recursion) and only computes subproblems you actually need. Tabulation is faster (no call stack overhead) and works when the dependency order is clear. For most interview problems, start with memoization to think clearly, then optimize to tabulation.' },
      { type: 'strategy', title: 'How to spot a DP problem', body: '1. "Count the number of ways to..." → DP\n2. "Find the minimum/maximum..." → DP\n3. "Can you achieve X with these choices?" → DP\n4. Naive recursion is exponential → DP\n\nThe key signal: recursive solution with repeated subproblems.' },
      { type: 'warning', title: 'The cache key must capture all state', body: 'If your recursive function has two parameters (n, k), your cache key must include both. If you only cache on n, you get wrong answers when k differs. This is the most common DP bug.' },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'DP Visualized: Naive Recursion vs Memoization vs Tabulation',
        caption: 'Watch the recursion tree explode, then watch memoization prune it to a straight line.',
        props: {
          lesson: {
            title: 'Dynamic Programming Step by Step',
            subtitle: 'See why naive recursion fails, and how DP fixes it.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'The Explosion: Naive Recursive Fibonacci',
                instruction: 'Count how many times each subproblem is called. fib(6) calls fib(2) eight times — and it gets worse exponentially. For fib(50), the call count exceeds a trillion.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const callCount = {};

function fib(n) {
  callCount[n] = (callCount[n] || 0) + 1;
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

const result = fib(8);

let html = '<div style="color:#60a5fa;font-size:14px;margin-bottom:8px">Naive fib(8) = ' + result + '</div>';
html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:12px">Call counts per subproblem:</div>';
html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">';
for (let i = 8; i >= 0; i--) {
  const c = callCount[i] || 0;
  const hot = c > 4 ? '#f87171' : c > 1 ? '#f59e0b' : '#4ade80';
  html += '<div style="text-align:center">' +
    '<div style="background:#1e293b;border-radius:4px;padding:5px 10px;color:' + hot + ';font-weight:bold;min-width:36px">' + c + '</div>' +
    '<div style="color:#64748b;font-size:11px;margin-top:2px">fib(' + i + ')</div></div>';
}
html += '</div>';
const total = Object.values(callCount).reduce((a, b) => a + b, 0);
html += '<div style="background:#450a0a;border-radius:6px;padding:8px 12px;color:#f87171;font-size:13px">Total calls: <b>' + total + '</b> — for n=8. For n=50 this would be >2 trillion.</div>';
d.innerHTML = html;`,
                outputHeight: 220,
              },
              {
                type: 'js',
                title: 'The Fix: Memoization — Cache and Conquer',
                instruction: 'Add a single cache object. On the first call for fib(n), compute and store. On every subsequent call, return the stored answer instantly. The recursion tree collapses to a straight line.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const cache = {};
const callCount = {};

function fib(n) {
  callCount[n] = (callCount[n] || 0) + 1;
  if (n in cache) return cache[n];      // ← cache hit
  if (n <= 1) return (cache[n] = n);
  return (cache[n] = fib(n - 1) + fib(n - 2));
}

const result = fib(8);

let html = '<div style="color:#60a5fa;font-size:14px;margin-bottom:8px">Memoized fib(8) = ' + result + '</div>';
html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:12px">Call counts — each subproblem solved exactly once:</div>';
html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">';
for (let i = 8; i >= 0; i--) {
  const c = callCount[i] || 0;
  html += '<div style="text-align:center">' +
    '<div style="background:#1e293b;border-radius:4px;padding:5px 10px;color:#4ade80;font-weight:bold;min-width:36px">' + c + '</div>' +
    '<div style="color:#64748b;font-size:11px;margin-top:2px">fib(' + i + ')</div></div>';
}
html += '</div>';
const total = Object.values(callCount).reduce((a, b) => a + b, 0);
html += '<div style="background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80;font-size:13px">Total calls: <b>' + total + '</b> — exactly n+1 calls for any n.</div>';
html += '<div style="background:#1e293b;border-radius:6px;padding:8px 12px;margin-top:8px;color:#94a3b8;font-size:12px">Cache: ' + JSON.stringify(cache) + '</div>';
d.innerHTML = html;`,
                outputHeight: 240,
              },
              {
                type: 'js',
                title: 'Tabulation: Build the Table Bottom-Up',
                instruction: 'No recursion at all. Start from the smallest subproblems and fill a table. Each cell depends only on previously filled cells. This is bottom-up DP.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');

function fibTabulation(n) {
  if (n <= 1) return n;
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  const steps = [{dp: [...dp.slice(0,2)], filled: [0,1]}];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
    steps.push({ i, from: [i-1, i-2], val: dp[i], dp: dp.slice(0, i+1) });
  }
  return { result: dp[n], dp, steps };
}

const n = 8;
const { result, dp, steps } = fibTabulation(n);

let html = '<div style="color:#60a5fa;font-size:14px;margin-bottom:8px">Tabulation: fib(' + n + ') = ' + result + '</div>';
html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:10px">Building the DP table from dp[0] up to dp[' + n + ']:</div>';

steps.slice(1).forEach(s => {
  html += '<div style="margin-bottom:5px;padding:6px 10px;background:#1e293b;border-radius:4px">';
  html += '<span style="color:#94a3b8">i=' + s.i + ':</span> dp[' + s.i + '] = dp[' + (s.i-1) + '] + dp[' + (s.i-2) + '] = ' + dp[s.i-1] + ' + ' + dp[s.i-2] + ' = <b style="color:#4ade80">' + s.val + '</b>';
  html += '</div>';
});

html += '<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">';
dp.forEach((v, i) => {
  const color = i === n ? '#f59e0b' : '#4ade80';
  html += '<div style="text-align:center"><div style="background:#1e293b;border-radius:4px;padding:5px 10px;color:' + color + ';font-weight:bold">' + v + '</div><div style="color:#64748b;font-size:11px;margin-top:2px">dp[' + i + ']</div></div>';
});
html += '</div>';
d.innerHTML = html;`,
                outputHeight: 320,
              },
              {
                type: 'js',
                title: 'Climbing Stairs: Fibonacci in Disguise',
                instruction: 'To reach step n you must come from step n-1 (one step) or step n-2 (two steps). The number of ways to reach n equals ways(n-1) + ways(n-2) — identical recurrence to Fibonacci.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');

function climbingStairs(n) {
  const dp = new Array(n + 1);
  dp[1] = 1; dp[2] = 2;
  for (let i = 3; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
  return dp;
}

const dp = climbingStairs(8);

let html = '<div style="color:#60a5fa;font-size:14px;margin-bottom:6px">Ways to climb n stairs (1 or 2 steps at a time):</div>';
html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:12px">ways(n) = ways(n-1) + ways(n-2) — exactly Fibonacci offset by 1</div>';

html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">';
for (let i = 1; i <= 8; i++) {
  html += '<div style="text-align:center">' +
    '<div style="background:#1e293b;border-radius:4px;padding:5px 12px;color:#4ade80;font-weight:bold">' + dp[i] + '</div>' +
    '<div style="color:#64748b;font-size:11px;margin-top:2px">n=' + i + '</div></div>';
}
html += '</div>';

html += '<div style="background:#172554;border-radius:6px;padding:8px 12px;color:#93c5fd;font-size:12px">';
html += '<b>Pattern recognition:</b> Whenever you see "reach state n from state n-1 or n-2", write dp[n] = dp[n-1] + dp[n-2]. The Fibonacci structure appears in dozens of DP problems under different names.';
html += '</div>';
d.innerHTML = html;`,
                outputHeight: 240,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build DP from Scratch in JavaScript',
        caption: 'Naive recursion → memoization → tabulation. Then the climbing stairs problem from scratch.',
        props: {
          lesson: {
            title: 'Dynamic Programming in JavaScript',
            subtitle: 'Understand the problem, then solve it three ways.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Naive Recursion: See the Problem

Write the naive recursive Fibonacci. It is correct but exponential — \`fib(n)\` makes \`fib(n-1)\` and \`fib(n-2)\` calls, each of which makes two more, and so on. The call tree has **O(2^n) nodes**.

Notice: \`fib(3)\` is computed once in the \`fib(4)\` branch and again in the \`fib(5)\` branch. And \`fib(2)\` is computed even more times. This redundancy is the problem that DP solves.

After implementing, observe: \`fib(30)\` works fine. \`fib(50)\` hangs. That is the exponential wall.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `// Naive recursive Fibonacci — correct but exponential time O(2^n)
function fib(n) {
  // TODO: base cases: n === 0 returns 0, n === 1 returns 1
  // TODO: return fib(n - 1) + fib(n - 2)
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('fib(0)',  fib(0),  0);
test('fib(1)',  fib(1),  1);
test('fib(2)',  fib(2),  1);
test('fib(5)',  fib(5),  5);
test('fib(10)', fib(10), 55);
test('fib(20)', fib(20), 6765);
// Do NOT test fib(50) — it would hang the browser`,
                solutionCode: `function fib(n) {
  if (n === 0) return 0;
  if (n === 1) return 1;
  return fib(n - 1) + fib(n - 2);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('fib(0)',  fib(0),  0);
test('fib(1)',  fib(1),  1);
test('fib(2)',  fib(2),  1);
test('fib(5)',  fib(5),  5);
test('fib(10)', fib(10), 55);
test('fib(20)', fib(20), 6765);`,
                outputHeight: 180,
              },

              {
                type: 'js',
                instruction: `## Step 2 — Memoization: Add a Cache

Take your naive recursive solution and add one thing: a cache object. Before computing, check if the answer is already cached. After computing, store the answer in the cache.

The key insight: the structure of the recursion does not change. You are still solving the same subproblems in the same order — you just never solve the same one twice.

**Time complexity:** O(n) — each of the n+1 subproblems is computed exactly once.
**Space complexity:** O(n) — the cache stores n+1 answers, plus the recursion stack goes n levels deep.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `// Memoized Fibonacci — add a cache to naive recursion
const cache = {};

function fib(n) {
  // TODO: if n is in cache, return cache[n]
  // TODO: base cases: n===0 return 0, n===1 return 1
  // TODO: compute result = fib(n-1) + fib(n-2)
  // TODO: store result in cache[n]
  // TODO: return result
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('fib(0)',  fib(0),  0);
test('fib(1)',  fib(1),  1);
test('fib(10)', fib(10), 55);
test('fib(30)', fib(30), 832040);
test('fib(50)', fib(50), 12586269025);  // instant now — try fib(50) with naive and it hangs`,
                solutionCode: `const cache = {};

function fib(n) {
  if (n in cache) return cache[n];
  if (n === 0) return (cache[n] = 0);
  if (n === 1) return (cache[n] = 1);
  return (cache[n] = fib(n - 1) + fib(n - 2));
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('fib(0)',  fib(0),  0);
test('fib(1)',  fib(1),  1);
test('fib(10)', fib(10), 55);
test('fib(30)', fib(30), 832040);
test('fib(50)', fib(50), 12586269025);`,
                outputHeight: 160,
              },

              {
                type: 'js',
                instruction: `## Step 3 — Tabulation: Bottom-Up, No Recursion

Instead of recursing down and caching on the way back up, build the solution from the ground up. Start with the known base cases and fill a table until you reach the target.

**The recurrence:** \`dp[i] = dp[i-1] + dp[i-2]\`
**Base cases:** \`dp[0] = 0\`, \`dp[1] = 1\`
**Answer:** \`dp[n]\`

**Why tabulation?** No call stack — good for large n. Iteration is faster than recursion in most JS engines. The dependency order (each cell depends on previous cells) is explicit and clear.

After Fibonacci, implement **Climbing Stairs**: \`dp[i]\` = number of ways to reach step i taking 1 or 2 steps. Base cases: \`dp[1] = 1\`, \`dp[2] = 2\`.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `// Tabulated Fibonacci — build dp table bottom-up
function fibTab(n) {
  if (n <= 1) return n;
  const dp = new Array(n + 1);
  // TODO: dp[0] = 0; dp[1] = 1
  // TODO: for i from 2 to n: dp[i] = dp[i-1] + dp[i-2]
  // TODO: return dp[n]
}

// Climbing Stairs — number of ways to reach step n (1 or 2 steps at a time)
// dp[i] = dp[i-1] + dp[i-2]
// Base: dp[1] = 1 (one way to reach step 1), dp[2] = 2 (1+1 or 2)
function climbStairs(n) {
  if (n <= 2) return n;
  const dp = new Array(n + 1);
  // TODO: dp[1] = 1; dp[2] = 2
  // TODO: for i from 3 to n: dp[i] = dp[i-1] + dp[i-2]
  // TODO: return dp[n]
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('fibTab(10)', fibTab(10), 55);
test('fibTab(50)', fibTab(50), 12586269025);

test('climbStairs(1)', climbStairs(1), 1);
test('climbStairs(2)', climbStairs(2), 2);
test('climbStairs(3)', climbStairs(3), 3);   // 1+1+1, 1+2, 2+1
test('climbStairs(4)', climbStairs(4), 5);
test('climbStairs(5)', climbStairs(5), 8);`,
                solutionCode: `function fibTab(n) {
  if (n <= 1) return n;
  const dp = new Array(n + 1);
  dp[0] = 0; dp[1] = 1;
  for (let i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
  return dp[n];
}

function climbStairs(n) {
  if (n <= 2) return n;
  const dp = new Array(n + 1);
  dp[1] = 1; dp[2] = 2;
  for (let i = 3; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
  return dp[n];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('fibTab(10)', fibTab(10), 55);
test('fibTab(50)', fibTab(50), 12586269025);
test('climbStairs(1)', climbStairs(1), 1);
test('climbStairs(2)', climbStairs(2), 2);
test('climbStairs(3)', climbStairs(3), 3);
test('climbStairs(4)', climbStairs(4), 5);
test('climbStairs(5)', climbStairs(5), 8);`,
                outputHeight: 220,
              },

              {
                type: 'js',
                instruction: `## Step 4 — Space Optimization: You Only Need Two Variables

Look at the recurrence: \`dp[i] = dp[i-1] + dp[i-2]\`. To compute \`dp[i]\`, you only ever look at the two previous cells — not the entire table. So you can throw away everything except those two values.

This reduces space from **O(n)** to **O(1)**. This is a critical technique in production DP — many "O(n) space" DP solutions can be reduced to O(1) by observing that only a fixed number of previous states are needed.

**From Scratch Challenge:** write \`fibOpt\` (O(1) space Fibonacci) and \`climbStairsOpt\` (O(1) space climbing stairs) using only two variables. Then implement \`climbStairsMemo\` using memoization (top-down). 11 tests total.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.banner{margin-top:10px;padding:8px 12px;border-radius:6px;font-size:13px}.ok{background:#052e16;border:1px solid #166534;color:#4ade80}.bad{background:#450a0a;border:1px solid #7f1d1d;color:#f87171}`,
                startCode: `// O(1) space Fibonacci — only keep prev and curr
function fibOpt(n) {
  if (n <= 1) return n;
  // TODO: prev = 0, curr = 1
  // TODO: for i from 2 to n: next = prev + curr; prev = curr; curr = next
  // TODO: return curr
}

// O(1) space Climbing Stairs
function climbStairsOpt(n) {
  if (n <= 2) return n;
  // TODO: same pattern — prev = 1 (ways to reach step 1), curr = 2 (ways to reach step 2)
  // TODO: iterate, return curr
}

// Top-down memoized Climbing Stairs
function climbStairsMemo(n, memo = {}) {
  // TODO: if n in memo, return memo[n]
  // TODO: base cases: n===1 return 1, n===2 return 2
  // TODO: memo[n] = climbStairsMemo(n-1, memo) + climbStairsMemo(n-2, memo)
  // TODO: return memo[n]
}

const out = document.getElementById('out');
const results = [];
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  results.push(p);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}</div>\`;
}

test('fibOpt(0)',  fibOpt(0),  0);
test('fibOpt(1)',  fibOpt(1),  1);
test('fibOpt(10)', fibOpt(10), 55);
test('fibOpt(50)', fibOpt(50), 12586269025);

test('climbStairsOpt(1)', climbStairsOpt(1), 1);
test('climbStairsOpt(2)', climbStairsOpt(2), 2);
test('climbStairsOpt(3)', climbStairsOpt(3), 3);
test('climbStairsOpt(5)', climbStairsOpt(5), 8);
test('climbStairsOpt(10)', climbStairsOpt(10), 89);

test('climbStairsMemo(5)',  climbStairsMemo(5),  8);
test('climbStairsMemo(10)', climbStairsMemo(10), 89);

const all = results.every(Boolean);
out.innerHTML += \`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;`,
                solutionCode: `function fibOpt(n) {
  if (n <= 1) return n;
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }
  return curr;
}

function climbStairsOpt(n) {
  if (n <= 2) return n;
  let prev = 1, curr = 2;
  for (let i = 3; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }
  return curr;
}

function climbStairsMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n === 1) return 1;
  if (n === 2) return 2;
  memo[n] = climbStairsMemo(n - 1, memo) + climbStairsMemo(n - 2, memo);
  return memo[n];
}

const out = document.getElementById('out');
const results = [];
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  results.push(p);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}</div>\`;
}

test('fibOpt(0)',  fibOpt(0),  0);
test('fibOpt(1)',  fibOpt(1),  1);
test('fibOpt(10)', fibOpt(10), 55);
test('fibOpt(50)', fibOpt(50), 12586269025);
test('climbStairsOpt(1)', climbStairsOpt(1), 1);
test('climbStairsOpt(2)', climbStairsOpt(2), 2);
test('climbStairsOpt(3)', climbStairsOpt(3), 3);
test('climbStairsOpt(5)', climbStairsOpt(5), 8);
test('climbStairsOpt(10)', climbStairsOpt(10), 89);
test('climbStairsMemo(5)',  climbStairsMemo(5),  8);
test('climbStairsMemo(10)', climbStairsMemo(10), 89);

const all = results.every(Boolean);
out.innerHTML += \`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;`,
                outputHeight: 340,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Dynamic Programming in Python',
        caption: 'Python decorators, manual caches, and tabulation — with call-count visualization.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Step 1 — Naive Recursion and the Call Explosion',
              prose: [
                'Write naive recursive Fibonacci with a call counter. Watch the call count grow exponentially. This is the problem DP solves.',
                'Python integer arithmetic is exact (no overflow), so you can compute fib(100) with memoization safely.',
              ],
              instructions: 'Fill in fib_naive(). Then observe the call counts for small n.',
              code: `call_count = {}

def fib_naive(n):
    call_count[n] = call_count.get(n, 0) + 1
    # TODO: base cases: n == 0 returns 0, n == 1 returns 1
    # TODO: return fib_naive(n - 1) + fib_naive(n - 2)
    pass

import sys
sys.setrecursionlimit(10000)

for n in [5, 10, 15, 20]:
    call_count.clear()
    result = fib_naive(n)
    total = sum(call_count.values())
    print(f"fib({n:2d}) = {result:6d}  |  total calls = {total:6d}")`,
              output: `fib( 5) =      5  |  total calls =     15
fib(10) =     55  |  total calls =    177
fib(15) =    610  |  total calls =   1973
fib(20) =   6765  |  total calls =  21891`,
              status: 'idle',
              figureJson: null,
            },

            {
              id: 2,
              cellTitle: 'Step 2 — Memoization Three Ways',
              prose: [
                'Python gives you three ways to memoize: a manual dict cache, the @lru_cache decorator (automatic, built-in), and @cache (Python 3.9+, same but unbounded).',
                'All three produce identical results. @lru_cache is the most common in production code. Manual cache is most readable for learning.',
              ],
              instructions: 'Implement fib_memo() with a manual cache dict. Then compare with @lru_cache.',
              code: `from functools import lru_cache

# Manual cache
_cache = {}
def fib_memo(n):
    if n in _cache: return _cache[n]
    # TODO: base cases: n == 0 returns 0, n == 1 returns 1
    # TODO: _cache[n] = fib_memo(n-1) + fib_memo(n-2)
    # TODO: return _cache[n]
    pass

# Using @lru_cache — Python handles the cache automatically
@lru_cache(maxsize=None)
def fib_lru(n):
    if n <= 1: return n
    return fib_lru(n - 1) + fib_lru(n - 2)

print("fib_memo(50):", fib_memo(50))
print("fib_lru(50):", fib_lru(50))
print("fib_lru(100):", fib_lru(100))

# See how many subproblems were cached
print(f"\\nCache entries in fib_memo: {len(_cache)}")
print(f"Cache info for fib_lru: {fib_lru.cache_info()}")`,
              output: `fib_memo(50): 12586269025
fib_lru(50): 12586269025
fib_lru(100): 354224848179261915075

Cache entries in fib_memo: 51
Cache info for fib_lru: CacheInfo(hits=49, misses=51, maxsize=None, currsize=51)`,
              status: 'idle',
              figureJson: null,
            },

            {
              id: 3,
              cellTitle: 'Step 3 — Tabulation and Space Optimization',
              prose: [
                'Bottom-up tabulation: fill dp[0..n] iteratively, no recursion stack.',
                'Space optimization: since dp[i] only depends on dp[i-1] and dp[i-2], you can discard the full array and keep just two variables.',
              ],
              instructions: 'Implement fib_tab() and climb_stairs_opt().',
              code: `def fib_tab(n):
    if n <= 1: return n
    dp = [0] * (n + 1)
    dp[1] = 1
    # TODO: for i in range(2, n+1): dp[i] = dp[i-1] + dp[i-2]
    # TODO: return dp[n]
    pass

def climb_stairs_opt(n):
    # O(1) space — only two variables
    if n <= 2: return n
    # TODO: prev, curr = 1, 2
    # TODO: for i in range(3, n+1): prev, curr = curr, prev + curr
    # TODO: return curr
    pass

print("fib_tab(10):", fib_tab(10))
print("fib_tab(50):", fib_tab(50))
print("climb_stairs_opt(5):", climb_stairs_opt(5))
print("climb_stairs_opt(10):", climb_stairs_opt(10))`,
              output: `fib_tab(10): 55
fib_tab(50): 12586269025
climb_stairs_opt(5): 8
climb_stairs_opt(10): 89`,
              status: 'idle',
              figureJson: null,
            },

            {
              id: 4,
              cellTitle: 'From Scratch — All Variants + Call Count Visualization',
              prose: [
                'Write all four functions from memory. When assertions pass, opencalc draws a bar chart comparing naive call counts vs memoized call counts for different values of n.',
                'The chart makes the exponential vs linear complexity difference visceral.',
              ],
              instructions: 'Fill in all functions. The figure contrasts naive O(2^n) vs memo O(n) call counts.',
              code: `from opencalc import Figure
import sys
sys.setrecursionlimit(100000)

def fib_naive(n, counter=None):
    if counter is None: counter = [0]
    counter[0] += 1
    if n <= 1: return n, counter
    a, _ = fib_naive(n - 1, counter)
    b, _ = fib_naive(n - 2, counter)
    return a + b, counter

def fib_memo(n):
    pass  # your code — manual cache dict

def fib_tab(n):
    pass  # your code — tabulation

def climb_stairs_opt(n):
    pass  # your code — O(1) space

def climb_stairs_memo(n, memo=None):
    pass  # your code — top-down with memo dict

# ---------- Assertions ----------
assert fib_memo(10)  == 55,          "fib_memo(10)"
assert fib_memo(50)  == 12586269025, "fib_memo(50)"
assert fib_tab(10)   == 55,          "fib_tab(10)"
assert fib_tab(50)   == 12586269025, "fib_tab(50)"
assert climb_stairs_opt(5)  == 8,  "climb 5"
assert climb_stairs_opt(10) == 89, "climb 10"
assert climb_stairs_memo(5)  == 8,  "climb memo 5"
assert climb_stairs_memo(10) == 89, "climb memo 10"
print("All assertions passed!")

# ---------- Visualize: naive call count vs memo call count ----------
ns = [5, 8, 10, 12, 14, 16]
naive_counts = []
for n in ns:
    _, c = fib_naive(n)
    naive_counts.append(c[0])

fig = Figure()
fig.set_title("Naive call count (red) vs Memo call count (green) for fib(n)")
for i, n in enumerate(ns):
    fig.bar(i * 2,     naive_counts[i], label=f"naive n={n}: {naive_counts[i]}", color="#f87171")
    fig.bar(i * 2 + 1, n + 1,           label=f"memo n={n}: {n+1}",              color="#4ade80")
fig.show()`,
              output: `All assertions passed!`,
              status: 'idle',
              figureJson: null,
            },
          ],
        },
      },
    ],
  },
};
