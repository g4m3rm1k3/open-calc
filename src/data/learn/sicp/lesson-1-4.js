export const lesson = {
  id: 'sicp-1-4',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '1.2.2  Tree Recursion',
  checkpoints: [
    { id: 'cp-tree-recursion', label: 'Tree Recursion' },
    { id: 'cp-iter-fib',       label: 'Iterative Fib' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Last lesson each recursive call spawned exactly one more call — the process was a straight chain. Tree recursion is different: each call spawns two. The result is a branching call tree, and the number of nodes in that tree grows explosively with the input. Fibonacci is the classic example.',
      code: null,
    },

    // ── Terminology: Tree Recursion ───────────────────────────────────────────────
    {
      type: 'narration',
      id: 'tree-recursion-vocab',
      text: 'A process is tree recursive when a function calls itself more than once per invocation. Each call spawns multiple children, those children spawn more, and the call graph branches like a tree rather than running in a straight chain. The branching factor is how many times each call recurses — for Fibonacci it is 2. The depth of the tree is the number of recursive steps to reach a base case. A tree-recursive process uses stack space proportional to the depth, but computes a number of sub-results that is exponential in the depth.',
      code: null,
    },

    // ── Tree Fibonacci ────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'fib-def',
      text: 'The Fibonacci sequence is defined by two base cases and one rule: fib(0) is 0, fib(1) is 1, and every other fib is the sum of the two before it. Written directly in code, the definition looks elegant — it mirrors the mathematical specification exactly. Run it — fib(10) is 55.',
      code: 'function fib(n) {\n  if (n === 0) return 0;\n  if (n === 1) return 1;\n  return fib(n - 1) + fib(n - 2);\n}\n\nfib(10)',
    },

    // ── Terminology: Exponential Growth ──────────────────────────────────────────
    {
      type: 'narration',
      id: 'exponential-vocab',
      text: 'The elegance of that definition hides a serious cost. To compute fib(5), we need fib(4) and fib(3). To compute fib(4), we need fib(3) and fib(2). fib(3) gets computed twice. fib(2) gets computed three times. The number of calls grows exponentially with n — roughly as the golden ratio φ ≈ 1.618 raised to the n. Adding 1 to the input multiplies the work by about 1.618. Exponential growth is the worst common complexity class: fib(50) would require around 2^35 calls without memoization.',
      code: null,
    },
    {
      type: 'narration',
      id: 'fib-redundancy',
      text: 'Here is the redundancy made visible. A call counter shows exactly how many times each sub-problem is recomputed. fib(10) requires 177 calls. fib(20) requires 21 891. The ratio between them is already close to φ^10 ≈ 122. Each step of 10 more roughly multiplies the count by 122.',
      code: 'let calls = 0;\n\nfunction fib(n) {\n  calls++;\n  if (n === 0) return 0;\n  if (n === 1) return 1;\n  return fib(n - 1) + fib(n - 2);\n}\n\nfib(10);\nconsole.log(`Calls to fib(10): ${calls}`);\n\ncalls = 0;\nfib(20);\nconsole.log(`Calls to fib(20): ${calls}`);',
    },
    {
      type: 'codelens',
      id: 'codelens-tree-fib',
      text: 'Open CodeLens on fib(6) and step through it. Watch the call tree branch — each node spawns two children. The same sub-problems appear on different branches. fib(3) will be computed twice, fib(2) three times. This redundant recomputation is why naive tree recursion is so expensive.',
      code: 'function fib(n) {\n  if (n === 0) return 0;\n  if (n === 1) return 1;\n  return fib(n - 1) + fib(n - 2);\n}\n\nconsole.log(fib(6));',
    },
    {
      type: 'checkpoint',
      id: 'cp-tree-recursion',
    },
    {
      type: 'challenge',
      id: 'challenge-fib-recursive',
      text: 'Write fib(n) yourself — the Fibonacci function using tree recursion. Base cases: fib(0) returns 0, fib(1) returns 1. Recursive case: return fib(n-1) + fib(n-2). fib(7) is 13, fib(10) is 55.',
      expectedOutput: '0\n1\n13\n55',
      startCode: '// fib(0) = 0, fib(1) = 1, fib(n) = fib(n-1) + fib(n-2)\n\nfunction fib(n) {\n  // your code here\n}\n\nconsole.log(fib(0));  // 0\nconsole.log(fib(1));  // 1\nconsole.log(fib(7));  // 13\nconsole.log(fib(10)); // 55\n',
      hint: 'function fib(n) {\n  if (n === 0) return 0;\n  if (n === 1) return 1;\n  return fib(n - 1) + fib(n - 2);\n}',
      tests: [
        { call: 'fib(0)',  expected: 0  },
        { call: 'fib(1)',  expected: 1  },
        { call: 'fib(7)',  expected: 13 },
        { call: 'fib(10)', expected: 55 },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `return typeof fib === 'function' && fib(0) === 0 && fib(1) === 1 && fib(7) === 13 && fib(10) === 55`)
          return fn() === true
        } catch { return false }
      },
    },

    // ── Iterative Fibonacci ───────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'fib-iter-intro',
      text: 'We can compute Fibonacci in linear time by keeping track of two consecutive values and counting down. The state variables are a and b — two adjacent Fibonacci numbers. At each step: a becomes a + b, b becomes the old a, and count decrements by 1. When count reaches zero, b holds the answer. No sub-problem is ever recomputed.',
      code: 'function fib(n) {\n  function iter(a, b, count) {\n    if (count === 0) return b;\n    return iter(a + b, a, count - 1);\n  }\n  return iter(1, 0, n);\n}\n\nfib(10)',
    },
    {
      type: 'narration',
      id: 'fib-iter-trace',
      text: 'Trace the state for fib(6). At each step a and b slide one position forward along the Fibonacci sequence. The work is proportional to n — this is a linear iterative process. The iterative version can compute fib(100) instantly; the tree-recursive version would never finish.',
      code: '// iter(a,  b,  count):\n// iter(1,  0,  6)  → a=fib(1), b=fib(0)\n// iter(1,  1,  5)  → a=fib(2), b=fib(1)\n// iter(2,  1,  4)  → a=fib(3), b=fib(2)\n// iter(3,  2,  3)  → a=fib(4), b=fib(3)\n// iter(5,  3,  2)  → a=fib(5), b=fib(4)\n// iter(8,  5,  1)  → a=fib(6), b=fib(5)\n// iter(13, 8,  0)  → return b = 8\n\nfunction fib(n) {\n  function iter(a, b, count) {\n    if (count === 0) return b;\n    return iter(a + b, a, count - 1);\n  }\n  return iter(1, 0, n);\n}\n\nconsole.log(fib(6));   // 8\nconsole.log(fib(50));  // 12586269025',
    },
    {
      type: 'codelens',
      id: 'codelens-iter-fib',
      text: 'Open CodeLens on the iterative Fibonacci and compare it to the tree-recursive version. The call stack stays flat — a and b slide forward one step at a time instead of branching into an exponential tree. Watch how the three state variables a, b, and count evolve with each tail call.',
      code: 'function fib(n) {\n  function iter(a, b, count) {\n    if (count === 0) return b;\n    return iter(a + b, a, count - 1);\n  }\n  return iter(1, 0, n);\n}\n\nconsole.log(fib(10));',
    },

    // ── Tree vs Iterative side-by-side ────────────────────────────────────────────
    {
      type: 'narration',
      id: 'fib-comparison',
      text: 'The difference between exponential and linear is not just abstract. This code measures it directly. Run it — the call counts tell the whole story.',
      code: 'let tree_calls = 0, iter_calls = 0;\n\nfunction fib_tree(n) {\n  tree_calls++;\n  if (n <= 1) return n;\n  return fib_tree(n-1) + fib_tree(n-2);\n}\n\nfunction fib_iter(n) {\n  function step(a, b, count) {\n    iter_calls++;\n    return count === 0 ? b : step(a+b, a, count-1);\n  }\n  return step(1, 0, n);\n}\n\nfor (const n of [10, 20, 30]) {\n  tree_calls = 0; iter_calls = 0;\n  fib_tree(n); fib_iter(n);\n  console.log(`fib(${n}): tree=${tree_calls} calls, iter=${iter_calls} calls`);\n}',
    },

    // ── Memoization ───────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'memoization-note',
      text: 'There is a third option besides reformulating the algorithm: memoization. Cache every result the first time it is computed. If the same sub-problem appears again, return the cached value immediately. Memoization turns the exponential tree-recursive Fibonacci into a linear one without changing the recursive structure of the code — it trades stack space for heap space. JavaScript\'s Map makes this straightforward.',
      code: 'const memo = new Map();\n\nfunction fib(n) {\n  if (n === 0) return 0;\n  if (n === 1) return 1;\n  if (memo.has(n)) return memo.get(n);\n  const result = fib(n - 1) + fib(n - 2);\n  memo.set(n, result);\n  return result;\n}\n\nconsole.log(fib(50));  // 12586269025 — instant, still tree-recursive in shape',
    },
    {
      type: 'checkpoint',
      id: 'cp-iter-fib',
    },
    {
      type: 'challenge',
      id: 'challenge-stairs',
      text: 'Staircase problem: you can climb 1 or 2 steps at a time. How many distinct ways can you climb n steps? ways(1) is 1, ways(2) is 2, ways(3) is 3, ways(4) is 5. Notice the pattern — it follows Fibonacci. Write ways(n) using tree recursion: base cases ways(1)=1 and ways(2)=2, recursive case ways(n-1) + ways(n-2).',
      expectedOutput: '1\n2\n3\n5\n8',
      startCode: '// ways(1) = 1, ways(2) = 2\n// ways(n) = ways(n-1) + ways(n-2)\n\nfunction ways(n) {\n  // your code here\n}\n\nconsole.log(ways(1)); // 1\nconsole.log(ways(2)); // 2\nconsole.log(ways(3)); // 3\nconsole.log(ways(4)); // 5\nconsole.log(ways(5)); // 8\n',
      hint: 'function ways(n) {\n  if (n === 1) return 1;\n  if (n === 2) return 2;\n  return ways(n - 1) + ways(n - 2);\n}',
      tests: [
        { call: 'ways(1)', expected: 1 },
        { call: 'ways(2)', expected: 2 },
        { call: 'ways(3)', expected: 3 },
        { call: 'ways(4)', expected: 5 },
        { call: 'ways(5)', expected: 8 },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `return typeof ways === 'function' && ways(1)===1 && ways(2)===2 && ways(3)===3 && ways(4)===5 && ways(5)===8`)
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
