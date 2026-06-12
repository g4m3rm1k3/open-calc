export const lesson = {
  id: 'sicp-1-6',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '1.3.1–1.3.2  Functions as Arguments',
  checkpoints: [
    { id: 'cp-sum-abstraction', label: 'Sum Abstraction' },
    { id: 'cp-lambda',          label: 'Lambda' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Section 1.3 is the payoff of everything so far. We have been treating numbers and booleans as first-class values — things you can name, pass around, return from functions. Now we do the same with functions themselves. This is not a convenience feature — it is a fundamental shift in expressive power. Today we pass functions as arguments.',
      code: null,
    },

    // ── Terminology: First-Class & Higher-Order ────────────────────────────────────
    {
      type: 'narration',
      id: 'first-class-vocab',
      text: 'In most languages, data and functions live in different worlds — you can pass a number to a function, but passing a function to a function requires special ceremony. JavaScript, following Scheme, treats functions as first-class values. First-class means a value can be named with const, passed as an argument to a function, returned as the result of a function, and stored in a data structure — exactly the same rights as a number. A function that takes another function as an argument, or returns a function as its result, is called a higher-order function.',
      code: null,
    },

    // ── Repeated pattern ─────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'pattern-notice',
      text: 'Look at these three functions. sum_integers adds 1 + 2 + ... + n. sum_cubes adds cubes. They share the same skeleton: add up a sequence of terms from a to b, advancing with a next function. Only the term computation and next step differ. This shared skeleton is a pattern waiting to be named.',
      code: 'function sum_integers(a, b) {\n  if (a > b) return 0;\n  return a + sum_integers(a + 1, b);\n}\n\nfunction sum_cubes(a, b) {\n  if (a > b) return 0;\n  return (a * a * a) + sum_cubes(a + 1, b);\n}\n\nconsole.log(sum_integers(1, 5)); // 15\nconsole.log(sum_cubes(1, 3));    // 36',
    },

    // ── Abstraction ───────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'sum-abstraction',
      text: 'We capture the pattern as a single higher-order function. sum takes four arguments: term is the function applied to each element, a and b are the bounds, and next advances from one element to the next. The body is the same skeleton as both versions above — only term and next vary. We have abstracted over the varying parts by making them parameters.',
      code: 'function sum(term, a, next, b) {\n  if (a > b) return 0;\n  return term(a) + sum(term, next(a), next, b);\n}\n\n// Sum of integers 1..5: term is identity, next adds 1\nfunction identity(x) { return x; }\nfunction inc(x)      { return x + 1; }\n\nconsole.log(sum(identity, 1, inc, 5)); // 15\n\n// Sum of cubes 1..3\nfunction cube(x) { return x * x * x; }\nconsole.log(sum(cube, 1, inc, 3)); // 36',
    },

    // ── Terminology: Lambda ────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'lambda-vocab',
      text: 'Defining identity and inc as standalone functions just to pass them once is noisy. Anonymous functions — also called lambdas, from the Greek letter λ used in the lambda calculus, the mathematical theory of computation underlying all functional programming — let you write a function inline without naming it. JavaScript\'s arrow function syntax is its lambda notation. The arrow x => x is the identity function. The arrow x => x + 1 is increment. Arrow functions are expressions: they can appear anywhere a value is expected.',
      code: null,
    },
    {
      type: 'narration',
      id: 'lambda-intro',
      text: 'With arrow functions, we can inline the term and next arguments directly. No helper function definitions needed. The meaning is identical — we are just writing the function as a literal value rather than naming it first.',
      code: 'function sum(term, a, next, b) {\n  if (a > b) return 0;\n  return term(a) + sum(term, next(a), next, b);\n}\n\n// Same results with inline arrow functions\nconsole.log(sum(x => x,       1, x => x + 1, 5));  // 15\nconsole.log(sum(x => x*x*x,   1, x => x + 1, 3));  // 36',
    },
    {
      type: 'narration',
      id: 'pi-sum',
      text: 'The Leibniz formula: pi/8 = 1/(1*3) + 1/(5*7) + 1/(9*11) + ... Each term is 1/(x*(x+2)), and the sequence advances by 4 each time. We can express this directly with our sum abstraction and a lambda — no new named functions needed.',
      code: 'function sum(term, a, next, b) {\n  if (a > b) return 0;\n  return term(a) + sum(term, next(a), next, b);\n}\n\nfunction pi_sum(a, b) {\n  return sum(\n    x => 1 / (x * (x + 2)),\n    a,\n    x => x + 4,\n    b\n  );\n}\n\n// pi/8 ≈ pi_sum(1, 1000)\nconsole.log(8 * pi_sum(1, 1000));  // ≈ 3.139',
    },
    {
      type: 'codelens',
      id: 'codelens-sum',
      text: 'Open CodeLens on sum(x => x*x, 1, x => x+1, 4). Step through it — watch how term and next are called as ordinary functions. The sum function has no idea what they do; it just calls them. The iteration pattern is separated from the specific operation. This is what makes higher-order functions powerful.',
      code: 'function sum(term, a, next, b) {\n  if (a > b) return 0;\n  return term(a) + sum(term, next(a), next, b);\n}\n\n// Sum of squares: 1 + 4 + 9 + 16 = 30\nconsole.log(sum(x => x * x, 1, x => x + 1, 4));',
    },
    {
      type: 'checkpoint',
      id: 'cp-sum-abstraction',
    },
    {
      type: 'challenge',
      id: 'challenge-sum-squares',
      text: 'You have the sum function available. Write sum_squares(a, b) that uses it to compute the sum of squares from a to b. sum_squares(1, 4) should be 30 (1 + 4 + 9 + 16). Use a lambda for term and another for next — no helper function definitions needed.',
      expectedOutput: '30\n55',
      startCode: 'function sum(term, a, next, b) {\n  if (a > b) return 0;\n  return term(a) + sum(term, next(a), next, b);\n}\n\n// Write sum_squares(a, b) using sum with lambda arguments\n\n\nconsole.log(sum_squares(1, 4)); // 30  (1+4+9+16)\nconsole.log(sum_squares(1, 5)); // 55  (1+4+9+16+25)\n',
      hint: 'function sum_squares(a, b) {\n  return sum(x => x * x, a, x => x + 1, b);\n}',
      tests: [
        { call: 'sum_squares(1, 4)', expected: 30 },
        { call: 'sum_squares(1, 5)', expected: 55 },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `return typeof sum_squares === 'function' && sum_squares(1,4) === 30 && sum_squares(1,5) === 55`)
          return fn() === true
        } catch { return false }
      },
    },

    // ── Closures returned from functions ─────────────────────────────────────────
    {
      type: 'narration',
      id: 'closure-returned',
      text: 'Arrow functions can also be returned from functions. A function that returns a function is another kind of higher-order function — it is a function factory. Each call creates a fresh closure: a new function with its own captured environment. make_adder(5) returns a closure that has captured n = 5. make_adder(10) returns a different closure with n = 10. The two closures are independent.',
      code: 'const make_adder = n => x => x + n;\n\nconst add5  = make_adder(5);\nconst add10 = make_adder(10);\n\nconsole.log(add5(3));   // 8\nconsole.log(add10(3));  // 13\nconsole.log(make_adder(100)(7)); // 107',
    },
    {
      type: 'codelens',
      id: 'codelens-closure',
      text: 'Open CodeLens on make_adder. When make_adder(5) is called, it returns a new function — a closure. That closure captures the variable n from the enclosing call frame. When add5(3) is called later, the closure still holds n = 5 in its environment. Step through it and watch the captured environment in the stack. Each call to make_adder creates a separate closure with its own n.',
      code: 'const make_adder = n => x => x + n;\n\nconst add5  = make_adder(5);\nconst add10 = make_adder(10);\n\nconsole.log(add5(3));    // 8  — n captured as 5\nconsole.log(add10(3));   // 13 — n captured as 10',
    },
    {
      type: 'challenge',
      id: 'challenge-make-multiplier',
      text: 'Write make_multiplier(n) that returns a function which multiplies its argument by n. make_multiplier(3)(7) should return 21. Use the same arrow-returning-arrow pattern: n => x => ...',
      expectedOutput: '21\n50\n100',
      startCode: '// make_multiplier(n) returns a function that multiplies by n\n// Pattern: n => x => ???\n\nconst make_multiplier = n => null; // replace null with: x => n * x\n\nconsole.log(make_multiplier(3)(7));   // 21\nconsole.log(make_multiplier(5)(10));  // 50\nconsole.log(make_multiplier(4)(25));  // 100\n',
      hint: 'const make_multiplier = n => x => x * n;',
      tests: [
        { call: 'make_multiplier(3)(7)',  expected: 21  },
        { call: 'make_multiplier(5)(10)', expected: 50  },
        { call: 'make_multiplier(4)(25)', expected: 100 },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `return typeof make_multiplier === 'function' && make_multiplier(3)(7) === 21 && make_multiplier(5)(10) === 50`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-lambda',
    },
  ],
}
