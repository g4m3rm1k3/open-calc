export const lesson = {
  id: 'sicp-1-2',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '1.1.6–1.1.8  Conditionals, Square Roots & Black Boxes',
  checkpoints: [
    { id: 'cp-conditionals', label: 'Conditionals' },
    { id: 'cp-sqrt',         label: 'Square Roots' },
    { id: 'cp-blackbox',     label: 'Black Boxes' },
  ],
  segments: [

    // ── Introduction ────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Last lesson we built the vocabulary: expressions evaluate to values, names bind values to identifiers, and functions package operations. Everything computed in a straight line. Today we add the ability to make decisions, refine guesses by recursion, and hide complexity behind an interface. We will build a working square root function from scratch — one helper at a time.',
      code: null,
    },

    // ── Terminology: Predicates ──────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'conditional-vocab',
      text: 'SICP uses precise vocabulary for conditionals. A predicate is any expression that evaluates to true or false — a boolean expression. In an if statement, the predicate is the test in the condition position. The consequent is the expression evaluated when the predicate is true — the then-branch. The alternative is the expression evaluated when the predicate is false — the else-branch. Knowing these three terms lets you read SICP and talk about conditional logic precisely.',
      code: null,
    },

    // ── 1.1.6  Conditionals ─────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'cond-1',
      text: 'Programs need to choose between alternatives. The if statement takes a predicate and runs the consequent when it is true, the alternative when it is false. Here is absolute value: the predicate is x < 0. When true (consequent), return -x. Otherwise (alternative), return x as-is. Run it with -5.',
      code: 'function abs(x) {\n  if (x < 0) {\n    return -x;   // consequent\n  } else {\n    return x;    // alternative\n  }\n}\n\nabs(-5)',
    },
    {
      type: 'narration',
      id: 'cond-2',
      text: 'When each branch is a single expression, JavaScript programmers often use the ternary operator — condition ? then-value : else-value. It is a compact spelling of the same if/else idea. Both versions of abs behave identically. The ternary is itself an expression, not a statement, so it can appear anywhere a value is expected.',
      code: 'function abs(x) {\n  return x < 0 ? -x : x;\n}\n\nabs(-5)',
    },
    {
      type: 'narration',
      id: 'cond-3',
      text: 'Predicates can be combined. The && operator (AND) is true only when both sides are true. The || operator (OR) is true when at least one side is true. The ! operator (NOT) inverts a boolean. Here, between returns true only when x falls inside the range low to high inclusive — both conditions must hold simultaneously.',
      code: 'function between(x, low, high) {\n  return x >= low && x <= high;\n}\n\nconsole.log(between(5, 1, 10));  // true\nconsole.log(between(0, 1, 10));  // false\nconsole.log(between(10, 1, 10)); // true',
    },
    {
      type: 'challenge',
      id: 'challenge-sign',
      text: 'You saw abs use if/else to split into two cases. Some functions need three. Write sign(x) that returns -1 when x is negative, 0 when x is zero, and 1 when x is positive. Use if / else if / else — when the first predicate fails, test a second one inside the else branch.',
      expectedOutput: '-1\n0\n1',
      startCode: '// Write sign(x) — returns -1, 0, or 1\nfunction sign(x) {\n  // your code here\n}\n\nconsole.log(sign(-5)); // -1\nconsole.log(sign(0));  // 0\nconsole.log(sign(5));  // 1\n',
      hint: 'function sign(x) {\n  if (x < 0) return -1;\n  else if (x === 0) return 0;\n  else return 1;\n}',
      tests: [
        { call: 'sign(-5)', expected: -1 },
        { call: 'sign(0)',  expected: 0  },
        { call: 'sign(5)',  expected: 1  },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `return typeof sign === 'function' && sign(-5) === -1 && sign(0) === 0 && sign(5) === 1`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-conditionals',
    },

    // ── Special forms: if does not evaluate both branches ────────────────────────
    {
      type: 'narration',
      id: 'special-forms-vocab',
      text: 'Conditionals are special forms — they are exceptions to the evaluation rule from section 1.1.3. The normal rule says: evaluate ALL sub-expressions first. But if does NOT evaluate both branches. Only the predicate is evaluated first. If the predicate is true, only the consequent is evaluated; the alternative is never touched. If the predicate is false, only the alternative runs.\n\nWhy does this matter? Because one branch might have a side effect or error that only makes sense in one case. If both branches always evaluated, you could never safely write if (x !== 0) { return 1/x; } — dividing by zero would always run. The same applies to && and ||: JavaScript short-circuits them. In a && b, if a is false, b is never evaluated.',
      code: null,
    },

    // ── Terminology: Declarative vs Imperative ────────────────────────────────────
    {
      type: 'narration',
      id: 'declarative-vs-imperative',
      text: 'There is a deep distinction between knowing what something is and knowing how to compute it. The mathematical definition of square root is declarative: the square root of x is the non-negative y such that y times y equals x. That tells us what a square root is. A program must be imperative — it must describe a process, a sequence of steps. The declarative definition says nothing about how to find y. We need an algorithm. Newton\'s method is that algorithm, and we will build it piece by piece.',
      code: null,
    },

    // ── 1.1.7  Square Roots by Newton's Method ──────────────────────────────────
    {
      type: 'narration',
      id: 'sqrt-problem',
      text: 'Newton\'s method for square roots works by successive improvement. Start with any guess — we will use 1. If the guess squared is not close enough to x, replace the guess with the average of the guess and x divided by the guess. That average is always a better approximation. Here is the improvement step alone — one function with one job.',
      code: 'function improve(guess, x) {\n  return (guess + x / guess) / 2;\n}\n\nimprove(1, 2)    // One step toward sqrt(2): 1.5',
    },
    {
      type: 'narration',
      id: 'sqrt-improve',
      text: 'Now we need a stopping criterion. We define good_enough using abs and square: a guess is good enough when squaring it lands within 0.001 of x. Notice these are standalone helpers — we will put them together shortly. Run it: 1.4 squared is 1.96, which is 0.04 away from 2. Not good enough yet. 1.414 squared is about 1.99996 — good enough.',
      code: 'function square(x) { return x * x; }\nfunction abs(x)    { return x < 0 ? -x : x; }\n\nfunction good_enough(guess, x) {\n  return abs(square(guess) - x) < 0.001;\n}\n\nconsole.log(good_enough(1.4,   2));  // false — 1.4² = 1.96\nconsole.log(good_enough(1.414, 2));  // true  — 1.414² ≈ 1.9996',
    },
    {
      type: 'narration',
      id: 'sqrt-convergence',
      text: 'Before writing the loop, see WHY Newton\'s method works. Start with a guess of 1 for √2. Repeatedly apply improve: average the guess with x divided by the guess. The sequence converges fast.',
      code: 'function improve(guess, x) { return (guess + x / guess) / 2; }\n\n// Watch the convergence toward √2 = 1.41421356...\nlet g = 1;\nconsole.log(`guess: ${g}`);\ng = improve(g, 2); console.log(`guess: ${g}`);   // 1.5\ng = improve(g, 2); console.log(`guess: ${g}`);   // 1.4166...\ng = improve(g, 2); console.log(`guess: ${g}`);   // 1.41421...\ng = improve(g, 2); console.log(`guess: ${g}`);   // already perfect',
    },
    {
      type: 'narration',
      id: 'sqrt-good-enough',
      text: 'Now we write the loop. sqrt_iter takes the current guess and the target x. If good_enough returns true, we are done — return the guess. Otherwise, improve the guess and call sqrt_iter again with the better value. This is our first example of recursion driving an iterative refinement: each call is one step closer to the answer.',
      code: 'function square(x) { return x * x; }\nfunction abs(x)    { return x < 0 ? -x : x; }\nfunction improve(guess, x) { return (guess + x / guess) / 2; }\nfunction good_enough(guess, x) { return abs(square(guess) - x) < 0.001; }\n\nfunction sqrt_iter(guess, x) {\n  if (good_enough(guess, x)) {\n    return guess;\n  } else {\n    return sqrt_iter(improve(guess, x), x);\n  }\n}',
    },
    {
      type: 'narration',
      id: 'sqrt-iter',
      text: 'With sqrt_iter written, the public function sqrt simply kicks things off with an initial guess of 1. Run it — it computes the square root of 2 by calling sqrt_iter repeatedly until good_enough is satisfied.',
      code: 'function square(x) { return x * x; }\nfunction abs(x)    { return x < 0 ? -x : x; }\nfunction improve(guess, x) { return (guess + x / guess) / 2; }\nfunction good_enough(guess, x) { return abs(square(guess) - x) < 0.001; }\n\nfunction sqrt_iter(guess, x) {\n  if (good_enough(guess, x)) {\n    return guess;\n  } else {\n    return sqrt_iter(improve(guess, x), x);\n  }\n}\n\nfunction sqrt(x) {\n  return sqrt_iter(1, x);\n}\n\nsqrt(2)',
    },
    {
      type: 'codelens',
      id: 'codelens-sqrt-iter',
      text: 'Open CodeLens on sqrt_iter. Each recursive call is a new stack frame with a better guess. Watch the call stack grow as the algorithm homes in on the answer — you will see good_enough finally return true and the recursion unwind. Notice how improve and good_enough are called from inside sqrt_iter: the stack shows all three frames active at once.',
      code: 'function square(x) { return x * x; }\nfunction abs(x) { return x < 0 ? -x : x; }\nfunction improve(guess, x) { return (guess + x / guess) / 2; }\nfunction good_enough(guess, x) { return abs(square(guess) - x) < 0.001; }\n\nfunction sqrt_iter(guess, x) {\n  if (good_enough(guess, x)) {\n    return guess;\n  } else {\n    return sqrt_iter(improve(guess, x), x);\n  }\n}\n\nconsole.log(sqrt_iter(1, 2));',
    },
    {
      type: 'challenge',
      id: 'challenge-sqrt-use',
      text: 'You have a working sqrt. The Pythagorean theorem says the hypotenuse of a right triangle equals sqrt(a² + b²). Write hypotenuse(a, b) using the square and sqrt functions provided. hypotenuse(3, 4) should be approximately 5, and hypotenuse(5, 12) should be approximately 13.',
      expectedOutput: '~5',
      startCode: 'function square(x) { return x * x; }\nfunction abs(x)    { return x < 0 ? -x : x; }\nfunction improve(guess, x) { return (guess + x / guess) / 2; }\nfunction good_enough(guess, x) { return abs(square(guess) - x) < 0.001; }\nfunction sqrt_iter(guess, x) {\n  return good_enough(guess, x) ? guess : sqrt_iter(improve(guess, x), x);\n}\nfunction sqrt(x) { return sqrt_iter(1, x); }\n\n// Write hypotenuse(a, b) using sqrt and square\n\n',
      hint: 'function hypotenuse(a, b) { return sqrt(square(a) + square(b)); }',
      tests: [
        { call: 'Math.round(hypotenuse(3, 4))', expected: 5 },
        { call: 'Math.round(hypotenuse(5, 12))', expected: 13 },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `return typeof hypotenuse === 'function' && Math.abs(hypotenuse(3, 4) - 5) < 0.01`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-sqrt',
    },

    // ── Terminology: Block Structure & Closure ────────────────────────────────────
    {
      type: 'narration',
      id: 'block-structure-vocab',
      text: 'Two terms before the refactored code. Block structure means defining helper functions inside the function that uses them — they become local, invisible to the outside world. A closure is a function that captures variables from the scope where it was defined. A free variable is a variable used inside a function that is not one of its own formal parameters — it is inherited from an enclosing scope. When improve uses x without x being its own parameter, x is a free variable; the closure captures the x that belongs to sqrt.',
      code: null,
    },

    // ── 1.1.8  Functions as Black Boxes ─────────────────────────────────────────
    {
      type: 'narration',
      id: 'blackbox-1',
      text: 'The sqrt function works, but it depends on four helpers — square, abs, improve, good_enough — scattered in the global scope. Any other code could accidentally redefine them. SICP introduces block structure: define the helpers inside sqrt so they are invisible to the outside world.',
      code: null,
    },
    {
      type: 'narration',
      id: 'blackbox-2',
      text: 'Here is the block-structured version. Each helper is declared inside sqrt and exists only there. Notice something subtle: improve and good_enough no longer take x as a parameter — they reference x directly. That works because they are closures defined inside a scope where x is already bound. The free variable x is captured from sqrt\'s parameter.',
      code: 'function sqrt(x) {\n  function square(n)      { return n * n; }\n  function abs(n)         { return n < 0 ? -n : n; }\n  function improve(guess) { return (guess + x / guess) / 2; }\n  function good_enough(g) { return abs(square(g) - x) < 0.001; }\n  function iter(guess)    { return good_enough(guess) ? guess : iter(improve(guess)); }\n  return iter(1);\n}\n\nsqrt(2)',
    },
    {
      type: 'narration',
      id: 'blackbox-3',
      text: 'From the outside, sqrt is a black box. Callers do not know or care that it uses Newton\'s method internally. They only know: give it a non-negative number, get back its square root. The interface is clean. The implementation is hidden. This principle — separating what a function does from how it does it — runs through all of SICP.',
      code: '// All of these work without knowing anything about Newton\'s method\nconsole.log(sqrt(9));    // 3\nconsole.log(sqrt(144));  // 12\nconsole.log(sqrt(2));    // 1.4142...',
    },
    {
      type: 'challenge',
      id: 'challenge-cube-root',
      text: 'Newton\'s method generalises. For cube roots, the improve step is (2 * guess + x / (guess * guess)) / 3. Write cube_root(x) using block structure — define improve and good_enough inside it. good_enough should check that Math.abs(guess * guess * guess - x) < 0.001. cube_root(27) should be approximately 3.',
      expectedOutput: '~3',
      startCode: '// Write cube_root(x) with block-structured helpers\n// improve(guess): return (2 * guess + x / (guess * guess)) / 3\n// good_enough(guess): return Math.abs(guess*guess*guess - x) < 0.001\n\n',
      hint: 'function cube_root(x) {\n  function improve(g) { return (2*g + x/(g*g)) / 3; }\n  function ok(g) { return Math.abs(g*g*g - x) < 0.001; }\n  function iter(g) { return ok(g) ? g : iter(improve(g)); }\n  return iter(1);\n}',
      tests: [
        { call: 'Math.round(cube_root(27))',  expected: 3 },
        { call: 'Math.round(cube_root(8))',   expected: 2 },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `return typeof cube_root === 'function' && Math.abs(cube_root(27) - 3) < 0.01`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'codelens',
      id: 'codelens-closure',
      text: 'Open CodeLens on sqrt and step into improve. When improve references x, CodeLens will show you that x is not improve\'s own parameter — it is found in sqrt\'s environment, the enclosing scope. This is lexical scoping: a function looks up free variables in the environment where it was defined, not where it was called. Each call to sqrt creates a fresh closure for improve with that call\'s value of x.',
      code: 'function sqrt(x) {\n  function improve(guess) {\n    return (guess + x / guess) / 2;\n  }\n  function good_enough(g) {\n    return Math.abs(g * g - x) < 0.001;\n  }\n  function iter(guess) {\n    return good_enough(guess) ? guess : iter(improve(guess));\n  }\n  return iter(1);\n}\n\nconsole.log(sqrt(9));',
    },
    {
      type: 'checkpoint',
      id: 'cp-blackbox',
    },
  ],
}
