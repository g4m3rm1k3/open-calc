export const lesson = {
  id: 'sicp-1-3',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '1.2.1  Linear Recursion and Iteration',
  checkpoints: [
    { id: 'cp-recursive-process',  label: 'Recursive Process' },
    { id: 'cp-iterative-process',  label: 'Iterative Process' },
  ],
  segments: [

    // ══════════════════════════════════════════════════════════════════════════
    // Introduction
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'intro',
      text: 'Section 1.2 changes the question. We have been asking "how do we write this function?" Now we ask "what does this function actually DO when it runs?" The same computation can have dramatically different shapes at runtime, with very different costs.\n\nThe example is factorial — a function you can write in one line. But there are two fundamentally different ways to write it, and they create two fundamentally different kinds of process. Understanding this distinction is one of the most important ideas in the whole book.',
      code: null,
    },

    // ── Vocabulary: Process vs Procedure ─────────────────────────────────────

    {
      type: 'narration',
      id: 'process-vs-procedure-vocab',
      text: 'SICP draws a sharp line between two words that are often confused:\n\n  Procedure (or function) — static text. The code you write, the function declaration in the source file. It exists before the program runs.\n\n  Process — dynamic activity. The pattern of computation that unfolds at runtime when the procedure is called. It exists only during execution.\n\nThe same procedure can generate very different processes. A recursive procedure (one that calls itself) does not necessarily generate a recursive process. This is the key non-obvious fact of Section 1.2.1.',
      code: null,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 1 — The Recursive Process
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'factorial-def',
      text: 'The mathematical definition of n! (n factorial):\n\n  0! = 1\n  n! = n × (n−1)!   for n > 0\n\nThis says: n factorial is n times the factorial of n−1. Translated directly into code, the function calls itself — it is recursive.',
      code: null,
    },
    {
      type: 'narration',
      id: 'factorial-base',
      text: 'Start with the base case. When n equals 1 (or 0), return 1 — factorial\'s stopping condition.',
      code: `function factorial(n) {
  if (n === 1) return 1;
  // recursive case to be added
}`,
    },
    {
      type: 'narration',
      id: 'factorial-recursive',
      text: 'Add the recursive case: n times factorial(n − 1). The function calls itself with a smaller argument.',
      code: `function factorial(n) {
  if (n === 1) return 1;
  return n * factorial(n - 1);
}`,
    },
    {
      type: 'narration',
      id: 'factorial-test',
      text: 'Run it. 5! = 5 × 4 × 3 × 2 × 1 = 120.',
      code: `function factorial(n) {
  if (n === 1) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(1));  // 1
console.log(factorial(3));  // 6
console.log(factorial(5));  // 120`,
    },

    // ── Deferred operations: the expand-then-contract shape ───────────────────

    {
      type: 'narration',
      id: 'deferred-ops-vocab',
      text: 'Now look at WHAT ACTUALLY HAPPENS when factorial(5) runs. Use the substitution model:\n\n  factorial(5)\n  → 5 * factorial(4)\n  → 5 * (4 * factorial(3))\n  → 5 * (4 * (3 * factorial(2)))\n  → 5 * (4 * (3 * (2 * factorial(1))))\n  → 5 * (4 * (3 * (2 * 1)))\n  → 5 * (4 * (3 * 2))\n  → 5 * (4 * 6)\n  → 5 * 24\n  → 120\n\nThe expression first GROWS — each call adds one more pending multiplication — then CONTRACTS as the multiplications are resolved. This shape is called a linear recursive process.',
      code: null,
    },
    {
      type: 'narration',
      id: 'deferred-key-word',
      text: 'The key word is deferred. When factorial(5) calls factorial(4), it cannot complete yet — it must remember "I still need to multiply by 5 when factorial(4) returns." That remembered "I still need to..." is a deferred operation. It sits waiting in the call stack. For factorial(n), there are n deferred multiplications waiting on the stack — the stack grows proportionally to n. This is Θ(n) space.',
      code: null,
    },
    {
      type: 'narration',
      id: 'factorial-stack-size',
      text: 'Confirm the stack depth by counting calls. For factorial(n) we make n calls — but the key point is that ALL n frames exist simultaneously on the stack at maximum depth.',
      code: `let max_depth = 0;
let current_depth = 0;

function factorial(n) {
  current_depth++;
  max_depth = Math.max(max_depth, current_depth);
  const result = n === 1 ? 1 : n * factorial(n - 1);
  current_depth--;
  return result;
}

factorial(10);
console.log('max stack depth for factorial(10):', max_depth); // 10`,
    },
    {
      type: 'codelens',
      id: 'codelens-recursive',
      text: 'Open CodeLens on factorial(5). Watch the call stack grow: 5 frames pushed before any multiplication happens, then 4 multiplications happen on the way out. The expand-then-contract shape is visible in the call stack panel. Each frame represents one deferred multiplication.',
      code: `function factorial(n) {
  if (n === 1) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(5));`,
    },
    { type: 'checkpoint', id: 'cp-recursive-process' },

    {
      type: 'challenge',
      id: 'challenge-triangle',
      text: 'Write triangle(n) that computes the nth triangular number: 1 + 2 + 3 + ... + n. Use the same recursive pattern: triangle(n) = n + triangle(n − 1), base case triangle(1) = 1. triangle(5) = 15.',
      expectedOutput: '1\n3\n6\n15',
      startCode: `// triangle(n) = n + triangle(n-1), base case: triangle(1) = 1

function triangle(n) {
  // your code
}

console.log(triangle(1));  // 1
console.log(triangle(2));  // 3
console.log(triangle(3));  // 6
console.log(triangle(5));  // 15
`,
      hint: 'function triangle(n) {\n  if (n === 1) return 1;\n  return n + triangle(n - 1);\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof triangle === 'function' && triangle(1) === 1 && triangle(2) === 3 && triangle(5) === 15`)
          return fn() === true
        } catch { return false }
      },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 2 — The Iterative Process
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'iterative-intro',
      text: 'There is a completely different way to compute factorial. Instead of deferring multiplications, carry a running product along as a parameter. At each step, multiply the running product by the current counter. When the counter reaches n, the product IS the answer — no pending work, no stack buildup.\n\nThis is an iterative process: all the state of the computation lives in a fixed number of parameters, updated at each step.',
      code: null,
    },

    // ── State variables ───────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'state-vars-vocab',
      text: 'New vocabulary: state variables are the parameters that carry the complete state of the computation forward at each step. For iterative factorial:\n\n  product — the running accumulated result\n  counter — how far we have counted\n\nAt every step, these two numbers contain everything we need to know to continue the computation. If you paused an iterative process and wrote down the state variables, you could restart from those values and get the same answer. Nothing is hidden in the call stack.',
      code: null,
    },
    {
      type: 'narration',
      id: 'iterative-base',
      text: 'The inner function iter. When counter exceeds n, the product is complete — return it. This is the base case.',
      code: `function factorial(n) {
  function iter(product, counter) {
    if (counter > n) return product;
    // step to be added
  }
  return iter(1, 1);
}`,
    },
    {
      type: 'narration',
      id: 'iterative-step',
      text: 'Add the recursive step. Multiply product by counter and increment counter. Call iter again with the new state. Nothing is deferred — the multiplication happens NOW, not "when something returns."',
      code: `function factorial(n) {
  function iter(product, counter) {
    if (counter > n) return product;
    return iter(product * counter, counter + 1);
  }
  return iter(1, 1);
}`,
    },
    {
      type: 'narration',
      id: 'iterative-test',
      text: 'Run it. Same answers as the recursive version.',
      code: `function factorial(n) {
  function iter(product, counter) {
    if (counter > n) return product;
    return iter(product * counter, counter + 1);
  }
  return iter(1, 1);
}

console.log(factorial(1));  // 1
console.log(factorial(3));  // 6
console.log(factorial(5));  // 120`,
    },

    // ── The state trace ───────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'iterative-trace',
      text: 'Now trace the process for factorial(5). Only two numbers change at each step — product and counter:\n\n  iter(1,  1) → iter(1,   2)   [1 × 1 = 1]\n  iter(1,  2) → iter(2,   3)   [1 × 2 = 2]\n  iter(2,  3) → iter(6,   4)   [2 × 3 = 6]\n  iter(6,  4) → iter(24,  5)   [6 × 4 = 24]\n  iter(24, 5) → iter(120, 6)   [24 × 5 = 120]\n  iter(120, 6) → 120           [counter 6 > n 5 — done]\n\nNotice: there is no expansion. Product and counter just march forward. The stack never needs more than ONE frame at a time.',
      code: null,
    },
    {
      type: 'narration',
      id: 'iterative-stack-depth',
      text: 'Confirm with the same depth measurement. The maximum stack depth for iterative factorial should be 1 — only the iter frame itself, never accumulating.',
      code: `let max_depth = 0;
let current_depth = 0;

function factorial(n) {
  function iter(product, counter) {
    current_depth++;
    max_depth = Math.max(max_depth, current_depth);
    const result = counter > n ? product : iter(product * counter, counter + 1);
    current_depth--;
    return result;
  }
  return iter(1, 1);
}

factorial(100);
console.log('max stack depth for factorial(100):', max_depth);  // 100
// Note: in languages with tail-call optimisation, this would be 1`,
    },

    // ── Tail position: the key distinction ────────────────────────────────────

    {
      type: 'narration',
      id: 'tail-position-vocab',
      text: 'Why does the iterative version not accumulate stack frames?\n\nA call is in tail position when it is the LAST operation in a function — nothing is left to compute after it returns. In iter, return iter(product * counter, counter + 1) is in tail position. Once that call returns, the current iter frame has absolutely nothing left to do. It can be discarded immediately.\n\nIn the recursive factorial, return n * factorial(n - 1) is NOT in tail position — the multiplication by n happens AFTER factorial returns. The current frame must stay alive to perform that multiplication. That is what creates the stack buildup.\n\nLanguages with proper tail-call optimisation (like Scheme, the original SICP language) reuse the current stack frame for a tail call, achieving Θ(1) space. JavaScript does not guarantee this, but the conceptual distinction matters: a tail-recursive process is logically iterative.',
      code: null,
    },
    {
      type: 'narration',
      id: 'iterative-comparison',
      text: 'Here are both versions side by side with explicit labels for the key structural difference.',
      code: `// RECURSIVE FACTORIAL — n * is waiting after the recursive call
function factorial_r(n) {
  if (n === 1) return 1;
  return n * factorial_r(n - 1);   // NOT tail position: must multiply after
}

// ITERATIVE FACTORIAL — nothing waits after the recursive call
function factorial_i(n) {
  function iter(product, counter) {
    if (counter > n) return product;
    return iter(product * counter, counter + 1);  // tail position: nothing after
  }
  return iter(1, 1);
}

console.log(factorial_r(10));  // 3628800
console.log(factorial_i(10));  // 3628800  — same answer, different process`,
    },
    {
      type: 'codelens',
      id: 'codelens-iterative',
      text: 'Open CodeLens on the iterative factorial(5). Compare it to the recursive version: the call stack stays shallow — only iter and its current call. Product and counter evolve in the local variables panel. Step through it and watch: no expansion, no contraction, just forward progress.',
      code: `function factorial(n) {
  function iter(product, counter) {
    if (counter > n) return product;
    return iter(product * counter, counter + 1);
  }
  return iter(1, 1);
}

console.log(factorial(5));`,
    },
    { type: 'checkpoint', id: 'cp-iterative-process' },

    {
      type: 'challenge',
      id: 'challenge-triangle-iter',
      text: 'Rewrite triangle(n) as an iterative process. Use an inner function iter(total, k) where total accumulates the sum and k counts from 1 to n. Base case: k > n returns total. Recursive step: iter(total + k, k + 1). Start with iter(0, 1). triangle_iter(5) should still equal 15.',
      expectedOutput: '1\n3\n6\n15',
      startCode: `// Iterative triangle: total accumulates, k counts from 1 to n

function triangle_iter(n) {
  function iter(total, k) {
    // base case: k > n → return total
    // step: iter(total + k, k + 1)
  }
  return iter(0, 1);
}

console.log(triangle_iter(1));  // 1
console.log(triangle_iter(2));  // 3
console.log(triangle_iter(3));  // 6
console.log(triangle_iter(5));  // 15
`,
      hint: 'function triangle_iter(n) {\n  function iter(total, k) {\n    if (k > n) return total;\n    return iter(total + k, k + 1);\n  }\n  return iter(0, 1);\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof triangle_iter === 'function' && triangle_iter(1) === 1 && triangle_iter(2) === 3 && triangle_iter(5) === 15`)
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
