export const lesson = {
  id: 'sicp-1-4',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '1.2.2  Tree Recursion',
  checkpoints: [
    { id: 'cp-tree-recursion', label: 'Tree Recursion' },
    { id: 'cp-iter-fib',       label: 'Iterative Fib' },
  ],
  segments: [

    // ══════════════════════════════════════════════════════════════════════════
    // Introduction
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'intro',
      text: 'Last lesson showed linear recursion: each call spawns exactly one more call, and the process is a single chain. Section 1.2.2 introduces tree recursion: each call spawns TWO more calls. The process branches like a tree. This sounds like a small change, but the consequences are dramatic — the number of operations grows exponentially with the input, not linearly.\n\nFibonacci is the canonical example. It is elegant, natural to express recursively, and catastrophically inefficient in its naive form. The goal of this lesson is to understand WHY — and to fix it.',
      code: null,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 1 — Tree-Recursive Fibonacci
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'fib-definition',
      text: 'The Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ... Each number is the sum of the two before it. The mathematical definition:\n\n  fib(0) = 0\n  fib(1) = 1\n  fib(n) = fib(n−1) + fib(n−2)   for n ≥ 2\n\nTwo base cases and one recursive rule.',
      code: null,
    },
    {
      type: 'narration',
      id: 'fib-base-cases',
      text: 'Translate the definition directly. Start with the two base cases.',
      code: `function fib(n) {
  if (n === 0) return 0;
  if (n === 1) return 1;
  // recursive case to be added
}`,
    },
    {
      type: 'narration',
      id: 'fib-recursive-case',
      text: 'Add the recursive case: the sum of the previous two Fibonacci numbers. The function calls itself TWICE.',
      code: `function fib(n) {
  if (n === 0) return 0;
  if (n === 1) return 1;
  return fib(n - 1) + fib(n - 2);
}`,
    },
    {
      type: 'narration',
      id: 'fib-test',
      text: 'Run it. The first several Fibonacci numbers are correct.',
      code: `function fib(n) {
  if (n === 0) return 0;
  if (n === 1) return 1;
  return fib(n - 1) + fib(n - 2);
}

for (let i = 0; i <= 10; i++) {
  console.log(\`fib(\${i}) = \${fib(i)}\`);
}`,
    },

    // ── The redundancy ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'tree-recursion-vocab',
      text: 'A process is tree recursive when a function calls itself more than once per invocation. Each call spawns multiple children, those children spawn more, and the call graph branches like a tree. For Fibonacci with branching factor 2, the tree doubles in size at each level.\n\nHere is the call tree for fib(5):\n\n  fib(5)\n  ├── fib(4)\n  │   ├── fib(3)\n  │   │   ├── fib(2) ── fib(1), fib(0)\n  │   │   └── fib(1)\n  │   └── fib(2) ── fib(1), fib(0)\n  └── fib(3)\n      ├── fib(2) ── fib(1), fib(0)\n      └── fib(1)\n\nCount how many times fib(2) appears: THREE TIMES. fib(3) appears twice. Every time the same sub-problem recurs, all its work is repeated from scratch. This is the fundamental inefficiency of naive tree recursion.',
      code: null,
    },
    {
      type: 'narration',
      id: 'fib-count-calls',
      text: 'Add a call counter. The numbers reveal the catastrophe.',
      code: `let calls = 0;

function fib(n) {
  calls++;
  if (n === 0) return 0;
  if (n === 1) return 1;
  return fib(n - 1) + fib(n - 2);
}

for (const n of [5, 10, 15, 20, 25]) {
  calls = 0;
  fib(n);
  console.log(\`fib(\${n}): \${calls} calls\`);
}`,
    },
    {
      type: 'narration',
      id: 'fib-exponential-analysis',
      text: 'The call counts grow roughly by a factor of 1.618 for each increase of 1 in n. That number is the golden ratio φ ≈ 1.618 — it is actually mathematically provable that fib(n) requires Θ(φⁿ) calls. This is exponential growth.\n\nTo put this in perspective:\n  n = 30: about 2.7 million calls\n  n = 40: about 330 million calls\n  n = 50: about 40 billion calls — even a fast computer would take minutes\n  n = 100: more calls than atoms in the observable universe\n\nThe function is mathematically correct but practically useless for large n.',
      code: null,
    },
    {
      type: 'narration',
      id: 'fib-ratio',
      text: 'Measure the growth ratio directly. Each step from n to n+1 should multiply the calls by about φ ≈ 1.618.',
      code: `let calls = 0;

function fib(n) {
  calls++;
  if (n === 0) return 0;
  if (n === 1) return 1;
  return fib(n - 1) + fib(n - 2);
}

let prev = 1;
for (const n of [10, 11, 12, 13, 14, 15]) {
  calls = 0;
  fib(n);
  const ratio = (calls / prev).toFixed(3);
  console.log(\`fib(\${n}): \${calls} calls  (ratio to prev: \${ratio})\`);
  prev = calls;
}
// Ratio converges to φ ≈ 1.618`,
    },
    {
      type: 'codelens',
      id: 'codelens-tree-fib',
      text: 'Open CodeLens on fib(6). Watch the call tree branch — each node spawns two children. Find where fib(3) appears: it is computed TWICE, and each computation performs the same work. Step through and count the total frames that are created. The tree-shaped stack is the defining feature of a tree-recursive process.',
      code: `function fib(n) {
  if (n === 0) return 0;
  if (n === 1) return 1;
  return fib(n - 1) + fib(n - 2);
}

console.log(fib(6));`,
    },
    { type: 'checkpoint', id: 'cp-tree-recursion' },

    {
      type: 'challenge',
      id: 'challenge-fib',
      text: 'Write fib(n) from scratch: two base cases (0 and 1), one recursive case. Then add a call counter and verify that fib(15) requires more than 1000 calls but fib(10) requires fewer than 200.',
      expectedOutput: 'fib(10) = 55\nfib(15) = 610',
      startCode: `let calls = 0;

// Write fib(n) with two base cases and one recursive case

console.log('fib(10) = ' + fib(10)); // 55
calls = 0; fib(10);
console.log('calls for fib(10): ' + calls); // < 200

console.log('fib(15) = ' + fib(15)); // 610
calls = 0; fib(15);
console.log('calls for fib(15): ' + calls); // > 1000
`,
      hint: 'function fib(n) {\n  calls++;\n  if (n === 0) return 0;\n  if (n === 1) return 1;\n  return fib(n - 1) + fib(n - 2);\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof fib === 'function' && fib(10) === 55 && fib(15) === 610`)
          return fn() === true
        } catch { return false }
      },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 2 — Iterative Fibonacci
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'fib-iter-intro',
      text: 'The tree-recursive fib is elegant but exponentially expensive. We can compute the same values in Θ(n) time — n steps instead of φⁿ — using an iterative process.\n\nThe insight: instead of branching into two recursive calls, keep track of two consecutive Fibonacci numbers and march them forward. At each step: the next pair is (a+b, a). After n steps, b is fib(n).',
      code: null,
    },
    {
      type: 'narration',
      id: 'fib-iter-logic',
      text: 'Think about it concretely. Start with a=1, b=0, count=n.\n\n  After step 1: a=1+0=1, b=1 → b=fib(1)\n  After step 2: a=1+1=2, b=1 → b=fib(2)\n  After step 3: a=2+1=3, b=2 → b=fib(3)\n  ...\n  After step n: b=fib(n)\n\nAt each step we slide the window one position forward along the Fibonacci sequence.',
      code: null,
    },
    {
      type: 'narration',
      id: 'fib-iter-base',
      text: 'Start with the base case. When count reaches 0, b holds the answer.',
      code: `function fib(n) {
  function iter(a, b, count) {
    if (count === 0) return b;
    // step to be added
  }
  return iter(1, 0, n);
}`,
    },
    {
      type: 'narration',
      id: 'fib-iter-step',
      text: 'Add the step. Advance: new a = a + b, new b = old a, count decrements.',
      code: `function fib(n) {
  function iter(a, b, count) {
    if (count === 0) return b;
    return iter(a + b, a, count - 1);
  }
  return iter(1, 0, n);
}`,
    },
    {
      type: 'narration',
      id: 'fib-iter-test',
      text: 'Run it. Same values, completely different process.',
      code: `function fib(n) {
  function iter(a, b, count) {
    if (count === 0) return b;
    return iter(a + b, a, count - 1);
  }
  return iter(1, 0, n);
}

for (let i = 0; i <= 10; i++) {
  console.log(\`fib(\${i}) = \${fib(i)}\`);
}`,
    },
    {
      type: 'narration',
      id: 'fib-iter-trace',
      text: 'The state trace for fib(6). Only three numbers evolve — nothing accumulates on the stack:',
      code: `// Trace for fib(6):
// iter(a, b, count)
// iter(1, 0, 6)   → a=fib(1), b=fib(0)
// iter(1, 1, 5)   → a=fib(2), b=fib(1)
// iter(2, 1, 4)   → a=fib(3), b=fib(2)
// iter(3, 2, 3)   → a=fib(4), b=fib(3)
// iter(5, 3, 2)   → a=fib(5), b=fib(4)
// iter(8, 5, 1)   → a=fib(6), b=fib(5)
// iter(13,8, 0)   → return b = 8 ✓

function fib(n) {
  function iter(a, b, count) {
    if (count === 0) return b;
    return iter(a + b, a, count - 1);
  }
  return iter(1, 0, n);
}

console.log(fib(6));   // 8
console.log(fib(50));  // 12586269025 — instant`,
    },

    // ── Side-by-side comparison ───────────────────────────────────────────────

    {
      type: 'narration',
      id: 'fib-comparison',
      text: 'The most important comparison in this lesson: the same answer, radically different call counts.',
      code: `let tree_calls = 0;
let iter_calls  = 0;

function fib_tree(n) {
  tree_calls++;
  if (n <= 1) return n;
  return fib_tree(n-1) + fib_tree(n-2);
}

function fib_iter(n) {
  function step(a, b, count) {
    iter_calls++;
    return count === 0 ? b : step(a+b, a, count-1);
  }
  return step(1, 0, n);
}

for (const n of [10, 20, 30]) {
  tree_calls = 0; iter_calls = 0;
  fib_tree(n); fib_iter(n);
  console.log(\`fib(\${n}): tree=\${tree_calls} calls, iter=\${iter_calls} calls\`);
}`,
    },
    {
      type: 'narration',
      id: 'fib-when-tree',
      text: 'Tree recursion is not always wrong — it is sometimes the most natural expression of a problem (tree data structures in Chapter 2, for instance). The lesson is to recognise when the tree-recursive structure causes exponential redundancy, and to know the two remedies: reformulate as an iterative process (as we just did), or use memoization.',
      code: null,
    },

    // ── Memoization ───────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'memoization-intro',
      text: 'Memoization is the third option: cache every result the first time it is computed. If fib(3) is requested again, return the cached value instead of recomputing. This turns the exponential tree-recursive process into a linear one without changing the recursive structure.',
      code: `const memo = new Map();

function fib(n) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);   // cache hit
  const result = fib(n - 1) + fib(n - 2);
  memo.set(n, result);                   // cache the result
  return result;
}

console.log(fib(50));   // 12586269025 — instant despite tree-recursive structure
console.log(fib(100));  // 354224848179261915075`,
    },
    {
      type: 'codelens',
      id: 'codelens-iter-fib',
      text: 'Open CodeLens on the iterative fib(10). The call stack stays flat — a, b, and count evolve in the local variables panel without any expansion. Compare: the tree-recursive version would create 177 frames for fib(10). The iterative version creates exactly 11.',
      code: `function fib(n) {
  function iter(a, b, count) {
    if (count === 0) return b;
    return iter(a + b, a, count - 1);
  }
  return iter(1, 0, n);
}

console.log(fib(10));`,
    },
    { type: 'checkpoint', id: 'cp-iter-fib' },

    {
      type: 'challenge',
      id: 'challenge-stairs',
      text: 'Staircase problem: you can climb 1 or 2 steps at a time. How many distinct ways can you climb n steps? ways(1)=1, ways(2)=2, ways(3)=3, ways(4)=5, ways(5)=8. Notice the Fibonacci pattern!\n\nPart A: Write ways_tree(n) using tree recursion (base cases 1 and 2, recursive case ways(n-1)+ways(n-2)).\nPart B: Write ways_iter(n) as an iterative process. Verify both give the same answers.',
      expectedOutput: '1\n2\n3\n5\n8',
      startCode: `// Part A: tree-recursive version
function ways_tree(n) {
  if (n === 1) return 1;
  if (n === 2) return 2;
  // recursive case
}

// Part B: iterative version (same structure as iterative fib)
function ways_iter(n) {
  function iter(a, b, count) {
    // your code
  }
  return iter(2, 1, n - 1);  // starts at fib(2)=2, fib(1)=1
}

console.log(ways_tree(1));  // 1
console.log(ways_tree(2));  // 2
console.log(ways_tree(3));  // 3
console.log(ways_tree(4));  // 5
console.log(ways_tree(5));  // 8
`,
      hint: 'function ways_tree(n) {\n  if (n === 1) return 1;\n  if (n === 2) return 2;\n  return ways_tree(n-1) + ways_tree(n-2);\n}\nfunction ways_iter(n) {\n  function iter(a, b, count) {\n    if (count === 0) return b;\n    return iter(a+b, a, count-1);\n  }\n  return iter(2, 1, n-1);\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof ways_tree === 'function' && ways_tree(1)===1 && ways_tree(5)===8`)
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
