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
      text: 'Last lesson we built the vocabulary: expressions evaluate to values, names bind values to identifiers, and functions package operations. Everything computed in a straight line. Today we add the ability to make decisions, loop by recursion, and hide complexity behind an interface. We will build a working square root function from scratch.',
      code: null,
    },

    // ── 1.1.6  Conditionals ─────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'cond-1',
      text: 'Programs need to choose between alternatives. JavaScript\'s if statement takes a condition — a boolean expression — and runs one branch when it is true and another when it is false. Here is absolute value. If x is less than zero, return negative x. Otherwise return x as-is. Run it with -5 and watch the negative branch execute.',
      code: 'function abs(x) {\n  if (x < 0) {\n    return -x;\n  } else {\n    return x;\n  }\n}\n\nabs(-5)',
    },
    {
      type: 'narration',
      id: 'cond-2',
      text: 'When the body of each branch is a single expression, JavaScript programmers often write the ternary operator instead — condition question-mark then-value colon else-value. It is a more compact spelling of the same idea. Both versions of abs behave identically.',
      code: 'function abs(x) {\n  return x < 0 ? -x : x;\n}\n\nabs(-5)',
    },
    {
      type: 'narration',
      id: 'cond-3',
      text: 'Conditions can be combined. The double-ampersand means AND — both sides must be true. The double-pipe means OR — at least one side must be true. Here between returns true only when x falls inside the range low to high inclusive. Test it with a few values.',
      code: 'function between(x, low, high) {\n  return x >= low && x <= high;\n}\n\nconsole.log(between(5, 1, 10));  // true\nconsole.log(between(0, 1, 10));  // false\nconsole.log(between(10, 1, 10)); // true',
    },
    {
      type: 'challenge',
      id: 'challenge-sign',
      text: 'You just saw abs use if/else to split into two cases. Some functions need three cases. Write a function called sign that returns -1 when x is negative, 0 when x is zero, and 1 when x is positive. Use nested if/else — if the first condition fails, test a second one inside the else branch. Call sign(-5), sign(0), and sign(5) on separate lines.',
      expectedOutput: '-1\n0\n1',
      startCode: '// Write sign(x) here — returns -1, 0, or 1\n// Hint: if (x < 0) { ... } else if (x === 0) { ... } else { ... }\n\n',
      hint: 'function sign(x) {\n  if (x < 0) return -1;\n  else if (x === 0) return 0;\n  else return 1;\n}',
      validate: ({ logs, result, code }) => {
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

    // ── 1.1.7  Square Roots by Newton's Method ──────────────────────────────────
    {
      type: 'narration',
      id: 'sqrt-problem',
      text: 'Now we apply conditionals to a real problem: computing square roots. The mathematical definition says the square root of x is the y such that y times y equals x and y is non-negative. That definition tells us what a square root is. It does not tell us how to find one. We need an algorithm.',
      code: null,
    },
    {
      type: 'narration',
      id: 'sqrt-improve',
      text: 'Newton\'s method for square roots works by successive improvement. Start with any guess — we will use 1. If guess squared is not close enough to x, replace the guess with the average of guess and x divided by guess. That average is always closer to the true answer. Run this — improve takes a guess and the target, and one step gets us from 1 to 1.5 toward sqrt of 2.',
      code: 'function improve(guess, x) {\n  return (guess + x / guess) / 2;\n}\n\nimprove(1, 2)    // First step toward sqrt(2)',
    },
    {
      type: 'narration',
      id: 'sqrt-good-enough',
      text: 'We need a stopping criterion. A guess is good enough when squaring it is within 0.001 of x. We reuse abs from earlier. Run this — 1.4 squared is 1.96, which is 0.04 away from 2, so it is not yet good enough. 1.414 squared is about 1.99996, which is good enough.',
      code: 'function square(x) { return x * x; }\nfunction abs(x)    { return x < 0 ? -x : x; }\n\nfunction good_enough(guess, x) {\n  return abs(square(guess) - x) < 0.001;\n}\n\nconsole.log(good_enough(1.4,   2));  // false — 1.4² = 1.96\nconsole.log(good_enough(1.414, 2));  // true  — 1.414² ≈ 1.9996',
    },
    {
      type: 'narration',
      id: 'sqrt-iter',
      text: 'Now we put the pieces together. sqrt_iter is recursive: if the current guess is good enough, return it. Otherwise improve the guess and call sqrt_iter again with the better guess. The public function sqrt just kicks things off with a guess of 1. This is our first iterative algorithm — each call brings us closer to the answer.',
      code: 'function square(x) { return x * x; }\nfunction abs(x)    { return x < 0 ? -x : x; }\nfunction improve(guess, x) { return (guess + x / guess) / 2; }\nfunction good_enough(guess, x) { return abs(square(guess) - x) < 0.001; }\n\nfunction sqrt_iter(guess, x) {\n  if (good_enough(guess, x)) {\n    return guess;\n  } else {\n    return sqrt_iter(improve(guess, x), x);\n  }\n}\n\nfunction sqrt(x) {\n  return sqrt_iter(1, x);\n}\n\nsqrt(2)',
    },
    {
      type: 'challenge',
      id: 'challenge-sqrt-use',
      text: 'You have a working sqrt. The Pythagorean theorem says the hypotenuse of a right triangle equals sqrt(a squared plus b squared). Write a function called hypotenuse(a, b) that computes this. You have square and sqrt already defined above — use them. hypotenuse(3, 4) should return approximately 5.',
      expectedOutput: '~5',
      startCode: 'function square(x) { return x * x; }\nfunction abs(x)    { return x < 0 ? -x : x; }\nfunction improve(guess, x) { return (guess + x / guess) / 2; }\nfunction good_enough(guess, x) { return abs(square(guess) - x) < 0.001; }\nfunction sqrt_iter(guess, x) {\n  return good_enough(guess, x) ? guess : sqrt_iter(improve(guess, x), x);\n}\nfunction sqrt(x) { return sqrt_iter(1, x); }\n\n// Write hypotenuse(a, b) using sqrt and square\n\n',
      hint: 'function hypotenuse(a, b) { return sqrt(square(a) + square(b)); }',
      validate: ({ logs, result, code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `return typeof hypotenuse === 'function' && Math.abs(hypotenuse(3, 4) - 5) < 0.01`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'codelens',
      id: 'codelens-sqrt-iter',
      text: 'Open CodeLens on sqrt_iter. Each recursive call is a new stack frame with a better guess. Watch the call stack grow as the guess improves, then unwind once good_enough returns true. This is what SICP calls a linear iterative process — each step does constant work, but the number of steps grows with the precision required.',
      code: 'function square(x) { return x * x; }\nfunction abs(x) { return x < 0 ? -x : x; }\nfunction improve(guess, x) { return (guess + x / guess) / 2; }\nfunction good_enough(guess, x) { return abs(square(guess) - x) < 0.001; }\n\nfunction sqrt_iter(guess, x) {\n  if (good_enough(guess, x)) {\n    return guess;\n  } else {\n    return sqrt_iter(improve(guess, x), x);\n  }\n}\n\nconsole.log(sqrt_iter(1, 2));',
    },
    {
      type: 'checkpoint',
      id: 'cp-sqrt',
    },

    // ── 1.1.8  Functions as Black Boxes ─────────────────────────────────────────
    {
      type: 'narration',
      id: 'blackbox-1',
      text: 'The sqrt function works, but it depends on four helpers — square, abs, improve, good_enough — scattered in the global scope. Any other code could accidentally redefine them. SICP introduces block structure: define the helpers inside sqrt itself so they are invisible to the outside world.',
      code: null,
    },
    {
      type: 'narration',
      id: 'blackbox-2',
      text: 'Here is the block-structured version. Each helper is declared inside sqrt and exists only there. Notice something subtle: improve and good_enough no longer take x as a parameter — they just use x directly. That is because they are defined inside a function where x is already a parameter. The inner functions inherit x from the outer scope. This is called a closure.',
      code: 'function sqrt(x) {\n  function square(n)       { return n * n; }\n  function abs(n)          { return n < 0 ? -n : n; }\n  function improve(guess)  { return (guess + x / guess) / 2; }\n  function good_enough(g)  { return abs(square(g) - x) < 0.001; }\n  function iter(guess)     { return good_enough(guess) ? guess : iter(improve(guess)); }\n  return iter(1);\n}\n\nsqrt(2)',
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
      text: 'Newton\'s method generalizes. For cube roots, the improve step is: new_guess = (2 * guess + x / (guess * guess)) / 3. Write cube_root(x) using block structure — define improve and good_enough inside it. good_enough should check that Math.abs(guess * guess * guess - x) is less than 0.001. cube_root(27) should be approximately 3.',
      expectedOutput: '~3',
      startCode: '// Write cube_root(x) with internal helpers\n// improve(guess): return (2 * guess + x / (guess * guess)) / 3\n// good_enough(guess): return Math.abs(guess*guess*guess - x) < 0.001\n\n',
      hint: 'function cube_root(x) {\n  function improve(g) { return (2*g + x/(g*g)) / 3; }\n  function ok(g) { return Math.abs(g*g*g - x) < 0.001; }\n  function iter(g) { return ok(g) ? g : iter(improve(g)); }\n  return iter(1);\n}',
      validate: ({ logs, result, code }) => {
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
      text: 'Open this in CodeLens and step through sqrt. When improve is called, it references x — but x is not its parameter. CodeLens will show you that x is found in the enclosing scope of sqrt. That is lexical scoping: a function looks up names in the environment where it was defined, not where it was called.',
      code: 'function sqrt(x) {\n  function improve(guess) {\n    return (guess + x / guess) / 2;\n  }\n  function good_enough(g) {\n    return Math.abs(g * g - x) < 0.001;\n  }\n  function iter(guess) {\n    return good_enough(guess) ? guess : iter(improve(guess));\n  }\n  return iter(1);\n}\n\nconsole.log(sqrt(9));',
    },
    {
      type: 'checkpoint',
      id: 'cp-blackbox',
    },
  ],
}
