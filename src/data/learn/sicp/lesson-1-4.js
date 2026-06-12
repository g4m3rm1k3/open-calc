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
      text: 'Last lesson each recursive call spawned exactly one more call — the process was a straight chain. Tree recursion is different: each call spawns two. The result is a process that branches like a tree, and the costs grow explosively. Fibonacci is the classic example.',
      code: null,
    },

    // ── Tree Fibonacci ────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'fib-def',
      text: 'The Fibonacci sequence is defined by two base cases and a rule: fib of 0 is 0, fib of 1 is 1, and every other fib is the sum of the two before it. Written directly in code the definition looks elegant. Run it — fib of 10 is 55.',
      code: 'function fib(n) {\n  if (n === 0) return 0;\n  if (n === 1) return 1;\n  return fib(n - 1) + fib(n - 2);\n}\n\nfib(10)',
    },
    {
      type: 'narration',
      id: 'fib-redundancy',
      text: 'The elegance hides a serious problem. To compute fib(5), we compute fib(4) and fib(3). To compute fib(4), we compute fib(3) and fib(2). fib(3) is computed twice. fib(2) is computed three times. The number of times fib(1) is called grows exponentially with n — it is exactly fib(n+1). Count the calls to see.',
      code: 'let calls = 0;\n\nfunction fib(n) {\n  calls++;\n  if (n === 0) return 0;\n  if (n === 1) return 1;\n  return fib(n - 1) + fib(n - 2);\n}\n\nfib(10);\nconsole.log(\'Calls to fib(10):\', calls); // 177\n\ncalls = 0;\nfib(20);\nconsole.log(\'Calls to fib(20):\', calls); // 21891',
    },
    {
      type: 'codelens',
      id: 'codelens-tree-fib',
      text: 'Open CodeLens on fib(6) and step through it. Watch the call tree branch — each node spawns two children. The same sub-problems appear again and again on different branches. This redundant recomputation is why naive tree recursion is so expensive.',
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
      text: 'We can compute Fibonacci in linear time by keeping track of two consecutive values and counting down. fib_iter carries a and b — at each step a becomes a plus b, b becomes the old a, and count decrements. When count reaches zero, b holds the answer. No redundant recomputation.',
      code: 'function fib(n) {\n  function iter(a, b, count) {\n    if (count === 0) return b;\n    return iter(a + b, a, count - 1);\n  }\n  return iter(1, 0, n);\n}\n\nfib(10)',
    },
    {
      type: 'narration',
      id: 'fib-iter-trace',
      text: 'Trace the state for fib(6). a and b slide along the sequence — each step advances one position. The work is proportional to n, not exponential. The iterative version can compute fib(100) instantly; the tree-recursive version would run until the heat death of the universe.',
      code: '// iter(a,  b,  count):\n// iter(1,  0,  6) → fib(1)=1, fib(0)=0\n// iter(1,  1,  5) → fib(2)=1\n// iter(2,  1,  4) → fib(3)=2\n// iter(3,  2,  3) → fib(4)=3\n// iter(5,  3,  2) → fib(5)=5\n// iter(8,  5,  1) → fib(6)=8\n// iter(13, 8,  0) → return b = 8\n\nfunction fib(n) {\n  function iter(a, b, count) {\n    if (count === 0) return b;\n    return iter(a + b, a, count - 1);\n  }\n  return iter(1, 0, n);\n}\n\nconsole.log(fib(6));   // 8\nconsole.log(fib(50));  // 12586269025',
    },
    {
      type: 'codelens',
      id: 'codelens-iter-fib',
      text: 'Open CodeLens on the iterative Fibonacci. Compare it to the tree-recursive version — the call stack stays flat. Two variables slide forward one step at a time instead of branching into an exponential tree. This is the power of finding an iterative formulation.',
      code: 'function fib(n) {\n  function iter(a, b, count) {\n    if (count === 0) return b;\n    return iter(a + b, a, count - 1);\n  }\n  return iter(1, 0, n);\n}\n\nconsole.log(fib(10));',
    },
    {
      type: 'narration',
      id: 'memoization-note',
      text: 'There is a third option besides tree recursion and reformulation: memoization. Cache every result you compute. fib(3) appears seven times when computing fib(6) — if we save the first result and reuse it, we pay for each sub-problem once. JavaScript has no built-in memoization, but a Map makes it straightforward. This trades stack space for heap space and turns the exponential into linear.',
      code: 'const memo = new Map();\n\nfunction fib(n) {\n  if (n === 0) return 0;\n  if (n === 1) return 1;\n  if (memo.has(n)) return memo.get(n);\n  const result = fib(n - 1) + fib(n - 2);\n  memo.set(n, result);\n  return result;\n}\n\nconsole.log(fib(50));  // 12586269025 — instant, no reformulation needed',
    },
    {
      type: 'checkpoint',
      id: 'cp-iter-fib',
    },
    {
      type: 'challenge',
      id: 'challenge-stairs',
      text: 'Staircase problem: you can climb 1 or 2 steps at a time. How many distinct ways can you climb n steps? ways(1) is 1, ways(2) is 2, ways(3) is 3, ways(4) is 5, ways(5) is 8. Notice the pattern — it follows Fibonacci. Write ways(n) using tree recursion: base cases ways(1)=1 and ways(2)=2, recursive case ways(n-1) + ways(n-2).',
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
