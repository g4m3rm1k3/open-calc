export const lesson = {
  id: 'sicp-1-3',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '1.2.1  Linear Recursion and Iteration',
  checkpoints: [
    { id: 'cp-recursive-process',  label: 'Recursive Process' },
    { id: 'cp-iterative-process',  label: 'Iterative Process' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Section 1.2 shifts focus. We know how to write functions — now we study the processes those functions generate. The same computation can be shaped two very different ways. Today we look at factorial: a deceptively simple example that reveals a deep difference between a recursive process and an iterative one.',
      code: null,
    },

    // ── Recursive factorial ───────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'recursive-def',
      text: 'Here is the straightforward recursive factorial. To compute six factorial the function says: six times five factorial. To compute five factorial: five times four factorial. And so on down to one. Each call waits for the next before it can multiply — the pending multiplications pile up like a stack of IOUs.',
      code: 'function factorial(n) {\n  if (n === 1) return 1;\n  return n * factorial(n - 1);\n}\n\nfactorial(6)',
    },
    {
      type: 'narration',
      id: 'recursive-shape',
      text: 'If we visualise the expansion, we see the computation grow outward and then contract. The interpreter must remember where it is in each call so it can come back and do the multiplication. For factorial of n, the chain is n steps deep — the space required grows linearly with n.',
      code: '// Expansion:\n// factorial(6)\n//   6 * factorial(5)\n//     6 * (5 * factorial(4))\n//       6 * (5 * (4 * factorial(3)))\n//         6 * (5 * (4 * (3 * factorial(2))))\n//           6 * (5 * (4 * (3 * (2 * factorial(1)))))\n//           6 * (5 * (4 * (3 * (2 * 1))))\n// Contraction:\n//           6 * (5 * (4 * (3 * 2)))\n//           6 * (5 * (4 * 6))\n//           6 * (5 * 24)\n//           6 * 120\n// => 720\n\nfunction factorial(n) {\n  if (n === 1) return 1;\n  return n * factorial(n - 1);\n}\nfactorial(6)',
    },
    {
      type: 'codelens',
      id: 'codelens-recursive',
      text: 'Open CodeLens on the recursive factorial. Step through it and watch the call stack grow as each frame defers its multiplication, then shrink as the products are computed on the way back up. This expansion then contraction is the hallmark of a linear recursive process.',
      code: 'function factorial(n) {\n  if (n === 1) return 1;\n  return n * factorial(n - 1);\n}\n\nconsole.log(factorial(5));',
    },
    {
      type: 'checkpoint',
      id: 'cp-recursive-process',
    },
    {
      type: 'challenge',
      id: 'challenge-triangle',
      text: 'You just saw factorial defined recursively — n times factorial(n-1), base case is 1. Using the same pattern, write triangle(n) which computes the nth triangular number: 1 + 2 + 3 + ... + n. triangle(1) is 1, triangle(2) is 3, triangle(5) is 15.',
      expectedOutput: '1\n3\n15',
      startCode: '// triangle(n) = n + triangle(n-1), base case: triangle(1) === 1\n\nfunction triangle(n) {\n  // your code here\n}\n\nconsole.log(triangle(1)); // 1\nconsole.log(triangle(2)); // 3\nconsole.log(triangle(5)); // 15\n',
      hint: 'function triangle(n) {\n  if (n === 1) return 1;\n  return n + triangle(n - 1);\n}',
      tests: [
        { call: 'triangle(1)', expected: 1 },
        { call: 'triangle(2)', expected: 3 },
        { call: 'triangle(5)', expected: 15 },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `return typeof triangle === 'function' && triangle(1) === 1 && triangle(2) === 3 && triangle(5) === 15`)
          return fn() === true
        } catch { return false }
      },
    },

    // ── Iterative factorial ───────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'iterative-intro',
      text: 'Now watch a different formulation. Instead of deferring multiplications, we carry a running product along as a parameter. product starts at 1 and accumulates. counter counts up to n. At each step both are updated and we call again. Nothing is deferred — no stack of IOUs.',
      code: 'function factorial(n) {\n  function iter(product, counter) {\n    if (counter > n) return product;\n    return iter(product * counter, counter + 1);\n  }\n  return iter(1, 1);\n}\n\nfactorial(6)',
    },
    {
      type: 'narration',
      id: 'iterative-insight',
      text: 'The key insight: at any moment the entire state of the computation is captured by product and counter. If we paused and resumed with those two values we would get the same answer. The recursive version cannot say that — its state is hidden in the chain of deferred multiplications spread across many stack frames.',
      code: '// State trace — only two numbers tell the whole story:\n// iter(1,   1) → iter(1,   2)\n// iter(2,   2) → iter(6,   3)\n// iter(6,   3) → iter(24,  4)\n// iter(24,  4) → iter(120, 5)\n// iter(120, 5) → iter(720, 6)\n// iter(720, 6) → 720   (counter > 5)\n\nfunction factorial(n) {\n  function iter(product, counter) {\n    if (counter > n) return product;\n    return iter(product * counter, counter + 1);\n  }\n  return iter(1, 1);\n}\nfactorial(5)',
    },
    {
      type: 'narration',
      id: 'recursive-vs-process',
      text: 'Here is the distinction SICP hammers home: iter is a recursive function — it calls itself. Yet it generates an iterative process. These terms mean different things. A recursive function is defined in terms of itself. A recursive process is one that builds deferred operations at runtime. iter is syntactically recursive but its state fits in two variables — there is nothing deferred. In Scheme, the original language of SICP, an interpreter recognises tail calls like iter and runs them in constant stack space. JavaScript does not guarantee this optimisation, but understanding whether a process is truly iterative tells you whether it could in principle run in constant space.',
      code: '// iter is a recursive function — it calls itself...\n// ...but every call is in TAIL position — there is nothing left to do after it.\n// That is what makes the process iterative.\n\n// Contrast:\nfunction factorial_r(n) {\n  if (n === 1) return 1;\n  return n * factorial_r(n - 1); // ← must wait for result to multiply\n}\n\nfunction factorial_i(n) {\n  function iter(product, counter) {\n    if (counter > n) return product;\n    return iter(product * counter, counter + 1); // ← nothing waiting; could reuse frame\n  }\n  return iter(1, 1);\n}\n\nconsole.log(factorial_r(10)); // 3628800\nconsole.log(factorial_i(10)); // 3628800',
    },
    {
      type: 'codelens',
      id: 'codelens-iterative',
      text: 'Open CodeLens on the iterative factorial and compare it to the recursive version. The call stack does not grow — each iter call replaces the previous one because there is nothing left to do after it returns. This is what SICP calls a linear iterative process, and it is why tail recursion can be compiled to a loop.',
      code: 'function factorial(n) {\n  function iter(product, counter) {\n    if (counter > n) return product;\n    return iter(product * counter, counter + 1);\n  }\n  return iter(1, 1);\n}\n\nconsole.log(factorial(5));',
    },
    {
      type: 'checkpoint',
      id: 'cp-iterative-process',
    },
    {
      type: 'challenge',
      id: 'challenge-triangle-iter',
      text: 'Rewrite triangle as an iterative process. Use an inner function iter(total, k) where total accumulates the sum and k counts from 1 up to n. Base case: when k is greater than n, return total. Call iter(0, 1) to start. triangle_iter(5) should still equal 15.',
      expectedOutput: '1\n3\n15',
      startCode: '// Iterative triangle: accumulate total, count k from 1 to n\n\nfunction triangle_iter(n) {\n  function iter(total, k) {\n    // base case: k > n → return total\n    // recursive step: iter(total + k, k + 1)\n  }\n  return iter(0, 1);\n}\n\nconsole.log(triangle_iter(1)); // 1\nconsole.log(triangle_iter(2)); // 3\nconsole.log(triangle_iter(5)); // 15\n',
      hint: 'function triangle_iter(n) {\n  function iter(total, k) {\n    if (k > n) return total;\n    return iter(total + k, k + 1);\n  }\n  return iter(0, 1);\n}',
      tests: [
        { call: 'triangle_iter(1)', expected: 1 },
        { call: 'triangle_iter(2)', expected: 3 },
        { call: 'triangle_iter(5)', expected: 15 },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `return typeof triangle_iter === 'function' && triangle_iter(1) === 1 && triangle_iter(2) === 3 && triangle_iter(5) === 15`)
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
