export const lesson = {
  id: 'sicp-1-7',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '1.3.3–1.3.4  Functions as Returned Values',
  checkpoints: [
    { id: 'cp-fixed-point',  label: 'Fixed Point' },
    { id: 'cp-composition',  label: 'Composition' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Last lesson we passed functions in. Now we return them out. A function that produces a new function gives us a way to describe transformations of behaviour — not just transformations of data. Section 1.3.3 and 1.3.4 show this through two beautiful ideas: fixed-point search and average damping.',
      code: null,
    },

    // ── Fixed point ───────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'fixed-point-intro',
      text: 'A fixed point of a function f is a value x where f of x equals x. To find one, start with a guess and repeatedly apply f until successive guesses are close enough. Many numerical algorithms are secretly fixed-point searches in disguise.',
      code: 'function fixed_point(f, first_guess) {\n  const tolerance = 0.00001;\n  function close_enough(a, b) {\n    return Math.abs(a - b) < tolerance;\n  }\n  function try_it(guess) {\n    const next = f(guess);\n    if (close_enough(guess, next)) return next;\n    return try_it(next);\n  }\n  return try_it(first_guess);\n}\n\n// cos(x) = x  — cosine has a fixed point near 0.739\nconsole.log(fixed_point(Math.cos, 1.0));',
    },
    {
      type: 'codelens',
      id: 'codelens-fixed-point',
      text: 'Open CodeLens on fixed_point with cosine. Watch the guess converge — each call to try_it brings the estimate closer. The function has no idea it is finding a cosine fixed point; it just applies f and checks the gap. Step through several iterations to see the convergence.',
      code: 'function fixed_point(f, first_guess) {\n  const tolerance = 0.00001;\n  function close_enough(a, b) { return Math.abs(a - b) < tolerance; }\n  function try_it(guess) {\n    const next = f(guess);\n    if (close_enough(guess, next)) return next;\n    return try_it(next);\n  }\n  return try_it(first_guess);\n}\n\nconsole.log(fixed_point(Math.cos, 1.0));',
    },

    // ── Average damping ───────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'sqrt-as-fixed-point',
      text: 'Square root of x is the value y where y equals x divided by y. That means sqrt of x is a fixed point of the function y maps-to x over y. But if we call fixed_point directly on that function it oscillates — the guess alternates above and below the answer and never converges.',
      code: 'function fixed_point(f, first_guess) {\n  const tolerance = 0.00001;\n  function close_enough(a, b) { return Math.abs(a - b) < tolerance; }\n  function try_it(guess) {\n    const next = f(guess);\n    if (close_enough(guess, next)) return next;\n    return try_it(next);\n  }\n  return try_it(first_guess);\n}\n\n// This oscillates: 1 → 2 → 0.5 → 4 → 0.25 ...\n// fixed_point(y => 2 / y, 1.0)  — would loop forever\n\n// Instead: average the guess with the next value\nconsole.log(fixed_point(y => (y + 2 / y) / 2, 1.0));  // sqrt(2) ≈ 1.41421',
    },
    {
      type: 'narration',
      id: 'average-damp',
      text: 'The trick of averaging consecutive guesses is called average damping. We can package it as a higher-order function: average_damp takes a function f and returns a new function that averages x with f of x. Now we can express sqrt by composing fixed_point with average_damp applied to the target function.',
      code: 'function fixed_point(f, first_guess) {\n  const tolerance = 0.00001;\n  function close_enough(a, b) { return Math.abs(a - b) < tolerance; }\n  function try_it(guess) {\n    const next = f(guess);\n    if (close_enough(guess, next)) return next;\n    return try_it(next);\n  }\n  return try_it(first_guess);\n}\n\nfunction average_damp(f) {\n  return x => (x + f(x)) / 2;\n}\n\nfunction sqrt(x) {\n  return fixed_point(average_damp(y => x / y), 1.0);\n}\n\nconsole.log(sqrt(2));    // 1.41421...\nconsole.log(sqrt(9));    // 3.00000...\nconsole.log(sqrt(144));  // 12.0000...',
    },
    {
      type: 'checkpoint',
      id: 'cp-fixed-point',
    },
    {
      type: 'challenge',
      id: 'challenge-cube-root-fp',
      text: 'Newton\'s method generalises: cube root of x is a fixed point of y maps-to (x over y-squared plus 2y) divided by 3. Write cube_root(x) using fixed_point and average_damp. The damped function is y => (x / (y*y) + 2*y) / 3. cube_root(27) should be approximately 3.',
      expectedOutput: '~3\n~2',
      startCode: 'function fixed_point(f, first_guess) {\n  const tolerance = 0.00001;\n  function close_enough(a, b) { return Math.abs(a - b) < tolerance; }\n  function try_it(guess) {\n    const next = f(guess);\n    if (close_enough(guess, next)) return next;\n    return try_it(next);\n  }\n  return try_it(first_guess);\n}\n\nfunction average_damp(f) {\n  return x => (x + f(x)) / 2;\n}\n\n// Write cube_root(x) using fixed_point and average_damp\n// Hint: y => (x / (y * y) + 2 * y) / 3\n\n\nconsole.log(Math.round(cube_root(27))); // 3\nconsole.log(Math.round(cube_root(8)));  // 2\n',
      hint: 'function cube_root(x) {\n  return fixed_point(average_damp(y => (x / (y * y) + 2 * y) / 3), 1.0);\n}',
      tests: [
        { call: 'Math.round(cube_root(27))', expected: 3 },
        { call: 'Math.round(cube_root(8))',  expected: 2 },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `return typeof cube_root === 'function' && Math.abs(cube_root(27) - 3) < 0.01 && Math.abs(cube_root(8) - 2) < 0.01`)
          return fn() === true
        } catch { return false }
      },
    },

    // ── Function composition ──────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'newtons-method-general',
      text: 'What we just built is actually Newton\'s method in disguise. Newton\'s general method for finding zeros of a function g uses the transform: x becomes x minus g(x) over g-prime(x). When g(y) equals y-squared minus x, the zero of g is sqrt(x). Plug in and simplify — you get exactly the average-damp formula. The same fixed_point + average_damp machinery works for cube roots, fourth roots, logarithms. We described the algorithm once and used it for many problems. That is the payoff of higher-order functions.',
      code: '// Newton\'s method, general form\nfunction newton_transform(g) {\n  const dx = 0.00001;\n  return x => x - g(x) / ((g(x + dx) - g(x)) / dx);\n}\n\nfunction fixed_point(f, first_guess) {\n  const tol = 0.00001;\n  function try_it(g) {\n    const next = f(g);\n    return Math.abs(g - next) < tol ? next : try_it(next);\n  }\n  return try_it(first_guess);\n}\n\nfunction newtons_method(g, guess) {\n  return fixed_point(newton_transform(g), guess);\n}\n\n// sqrt(2): find y where y²-2 = 0\nconsole.log(newtons_method(y => y * y - 2, 1.0)); // 1.41421...',
    },
    {
      type: 'narration',
      id: 'compose-intro',
      text: 'When functions are first-class, we can write functions that build new functions. compose takes two functions and returns a function that applies them in sequence — f of g of x. It is the programming equivalent of mathematical function composition, written f ∘ g.',
      code: 'function compose(f, g) {\n  return x => f(g(x));\n}\n\nconst double    = x => x * 2;\nconst add1      = x => x + 1;\nconst square    = x => x * x;\n\nconst double_then_add1 = compose(add1, double);\nconst square_then_double = compose(double, square);\n\nconsole.log(double_then_add1(5));    // 11  (5*2 + 1)\nconsole.log(square_then_double(3));  // 18  (3*3 * 2)',
    },
    {
      type: 'narration',
      id: 'repeated-intro',
      text: 'compose applies a function once. repeated applies it n times. To double four times is to multiply by 16. To increment three times is to add 3. repeated is recursive: repeated(f, 1) is just f, and repeated(f, n) is f composed with repeated(f, n-1).',
      code: 'function compose(f, g) {\n  return x => f(g(x));\n}\n\nfunction repeated(f, n) {\n  if (n === 1) return f;\n  return compose(f, repeated(f, n - 1));\n}\n\nconst double = x => x * 2;\n\nconsole.log(repeated(double, 1)(3));  // 6   (double once)\nconsole.log(repeated(double, 3)(3));  // 24  (double three times)\nconsole.log(repeated(double, 4)(1));  // 16  (2^4)',
    },
    {
      type: 'codelens',
      id: 'codelens-repeated',
      text: 'Open CodeLens on repeated(double, 3)(5). Step through it — repeated builds a chain of compose calls: compose(double, compose(double, double)). Then that composed function is applied to 5. Watch how the chain unfolds: double is called three times, each wrapping the result of the last.',
      code: 'function compose(f, g) {\n  return x => f(g(x));\n}\n\nfunction repeated(f, n) {\n  if (n === 1) return f;\n  return compose(f, repeated(f, n - 1));\n}\n\nconst double = x => x * 2;\nconsole.log(repeated(double, 3)(5));',
    },
    {
      type: 'checkpoint',
      id: 'cp-composition',
    },
    {
      type: 'challenge',
      id: 'challenge-smooth',
      text: 'The smoothed version of a function f averages the values just below, at, and just above x: (f(x-dx) + f(x) + f(x+dx)) / 3. Write smooth(f) that returns this smoothed function. Use dx = 0.00001. smooth(x => x*x)(2) should be approximately 4.',
      expectedOutput: '~4\n~9',
      startCode: 'const dx = 0.00001;\n\n// smooth(f) returns x => (f(x-dx) + f(x) + f(x+dx)) / 3\n\nfunction smooth(f) {\n  // your code here\n}\n\nconst square = x => x * x;\nconsole.log(Math.round(smooth(square)(2)));  // 4\nconsole.log(Math.round(smooth(square)(3)));  // 9\n',
      hint: 'function smooth(f) {\n  return x => (f(x - dx) + f(x) + f(x + dx)) / 3;\n}',
      tests: [
        { call: 'Math.round(smooth(x => x * x)(2))', expected: 4 },
        { call: 'Math.round(smooth(x => x * x)(3))', expected: 9 },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `return typeof smooth === 'function' && Math.abs(smooth(x => x*x)(2) - 4) < 0.01 && Math.abs(smooth(x => x*x)(3) - 9) < 0.01`)
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
