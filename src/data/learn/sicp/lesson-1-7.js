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
      text: 'Last lesson we passed functions in. Now we return them out. A function that produces a new function gives us a way to describe transformations of behaviour — not just transformations of data. Section 1.3.3 and 1.3.4 show this through two ideas: fixed-point search and average damping. Together they reveal that Newton\'s method, which we wrote by hand in lesson 1-2, is an instance of a general pattern expressible in a few lines.',
      code: null,
    },

    // ── Terminology: Fixed Point ──────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'fixed-point-math-vocab',
      text: 'A fixed point of a function f is a value x where f(x) equals x — the function maps x back to itself. For example, the cosine function has a fixed point near 0.739 because cos(0.739) ≈ 0.739. To find a fixed point numerically, start with an initial guess, apply f to get a new value, apply f again to that result, and repeat. If the sequence of guesses converges, it converges to a fixed point. The method works when f is a contraction — each application brings the guess closer to the answer.',
      code: null,
    },

    // ── Fixed point ───────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'fixed-point-intro',
      text: 'Here is the fixed_point search function. It takes a function f and a starting guess. try_it applies f, checks whether the new value is close enough to the old one, and if not recurses with the new value. The tolerance is 0.00001. Run it — it finds the cosine fixed point near 0.739.',
      code: 'function fixed_point(f, first_guess) {\n  const tolerance = 0.00001;\n  function close_enough(a, b) {\n    return Math.abs(a - b) < tolerance;\n  }\n  function try_it(guess) {\n    const next = f(guess);\n    if (close_enough(guess, next)) return next;\n    return try_it(next);\n  }\n  return try_it(first_guess);\n}\n\n// cos(x) = x — cosine has a fixed point near 0.739\nconsole.log(fixed_point(Math.cos, 1.0));',
    },
    {
      type: 'codelens',
      id: 'codelens-fixed-point',
      text: 'Open CodeLens on fixed_point with cosine. Watch the guess converge iteration by iteration — each call to try_it brings the estimate closer. The function has no idea it is finding a cosine fixed point; it just applies f and checks the gap. Step through several iterations to see the convergence and notice how the difference between successive guesses shrinks.',
      code: 'function fixed_point(f, first_guess) {\n  const tolerance = 0.00001;\n  function close_enough(a, b) { return Math.abs(a - b) < tolerance; }\n  function try_it(guess) {\n    const next = f(guess);\n    if (close_enough(guess, next)) return next;\n    return try_it(next);\n  }\n  return try_it(first_guess);\n}\n\nconsole.log(fixed_point(Math.cos, 1.0));',
    },

    // ── Average damping ───────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'oscillation-vocab',
      text: 'Not every function converges when you apply it repeatedly. If f(x) overshoots the fixed point each time — bouncing above and below without settling — the search oscillates and never converges. This happens with the function y → x/y when searching for sqrt(x): starting at 1, it jumps to x, then to 1 again, repeating forever. The fix is average damping: instead of jumping to f(x) directly, move to the average of x and f(x). This halves the step size and prevents overshoot.',
      code: null,
    },
    {
      type: 'narration',
      id: 'sqrt-as-fixed-point',
      text: 'Square root of x is the value y where y = x/y — a fixed point of y → x/y. But applying that function directly oscillates. Averaging the current guess with the next value damps the oscillation. With average damping, the search converges smoothly.',
      code: 'function fixed_point(f, first_guess) {\n  const tolerance = 0.00001;\n  function close_enough(a, b) { return Math.abs(a - b) < tolerance; }\n  function try_it(guess) {\n    const next = f(guess);\n    if (close_enough(guess, next)) return next;\n    return try_it(next);\n  }\n  return try_it(first_guess);\n}\n\n// This oscillates — do not run it in an infinite loop:\n// fixed_point(y => 2 / y, 1.0)\n\n// With damping: average the guess with the next value\nconsole.log(fixed_point(y => (y + 2 / y) / 2, 1.0));  // sqrt(2) ≈ 1.41421',
    },
    {
      type: 'narration',
      id: 'average-damp',
      text: 'We can package average damping as a higher-order function. average_damp takes a function f and returns a new function that averages x with f(x). Now we can express sqrt by composing fixed_point with average_damp applied to the target function y → x/y. Each concept — fixed-point search, damping, the specific function — is expressed separately and composed.',
      code: 'function fixed_point(f, first_guess) {\n  const tolerance = 0.00001;\n  function close_enough(a, b) { return Math.abs(a - b) < tolerance; }\n  function try_it(guess) {\n    const next = f(guess);\n    if (close_enough(guess, next)) return next;\n    return try_it(next);\n  }\n  return try_it(first_guess);\n}\n\nfunction average_damp(f) {\n  return x => (x + f(x)) / 2;\n}\n\nfunction sqrt(x) {\n  return fixed_point(average_damp(y => x / y), 1.0);\n}\n\nconsole.log(sqrt(2));    // 1.41421...\nconsole.log(sqrt(9));    // 3.00000...\nconsole.log(sqrt(144));  // 12.0000...',
    },
    {
      type: 'checkpoint',
      id: 'cp-fixed-point',
    },
    {
      type: 'challenge',
      id: 'challenge-cube-root-fp',
      text: 'Newton\'s method generalises: cube root of x is a fixed point of y → (x/y² + 2y)/3. Write cube_root(x) using fixed_point and average_damp. The function to damp is y => (x / (y*y) + 2*y) / 3. cube_root(27) should be approximately 3.',
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

    // ── Terminology: Composition ──────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'composition-vocab',
      text: 'Mathematical function composition writes f ∘ g to mean the function that first applies g, then applies f to the result: (f ∘ g)(x) = f(g(x)). In programming we represent this directly: compose(f, g) returns a new function x => f(g(x)). The order matters — f ∘ g is not the same as g ∘ f. Composition is how we build complex behaviours by chaining simpler functions, and it is the programming analogue of the mathematical concept you will use throughout linear algebra and analysis.',
      code: null,
    },
    {
      type: 'narration',
      id: 'newtons-method-general',
      text: 'What we built with average_damp is actually Newton\'s method in disguise. Newton\'s general method for finding zeros of a function g uses the transform x → x - g(x)/g\'(x). When g(y) = y² - x, the zero of g is sqrt(x). Substituting and simplifying yields exactly the average-damp formula. The same fixed_point + average_damp machinery works for cube roots, fourth roots, logarithms — we described the algorithm once and used it for many problems.',
      code: 'function newton_transform(g) {\n  const dx = 0.00001;\n  return x => x - g(x) / ((g(x + dx) - g(x)) / dx);\n}\n\nfunction fixed_point(f, first_guess) {\n  const tol = 0.00001;\n  function try_it(g) {\n    const next = f(g);\n    return Math.abs(g - next) < tol ? next : try_it(next);\n  }\n  return try_it(first_guess);\n}\n\nfunction newtons_method(g, guess) {\n  return fixed_point(newton_transform(g), guess);\n}\n\n// sqrt(2): find y where y² - 2 = 0\nconsole.log(newtons_method(y => y * y - 2, 1.0)); // 1.41421...',
    },
    {
      type: 'narration',
      id: 'compose-intro',
      text: 'Here is compose as a function. It takes two functions f and g and returns a new function that applies them in sequence — g first, then f. It is the direct representation of f ∘ g.',
      code: 'function compose(f, g) {\n  return x => f(g(x));\n}\n\nconst double    = x => x * 2;\nconst add1      = x => x + 1;\nconst square    = x => x * x;\n\nconst double_then_add1   = compose(add1, double);\nconst square_then_double = compose(double, square);\n\nconsole.log(double_then_add1(5));    // 11  — (5*2) + 1\nconsole.log(square_then_double(3));  // 18  — (3*3) * 2',
    },
    {
      type: 'narration',
      id: 'repeated-intro',
      text: 'compose applies a function once. repeated applies it n times. repeated(f, 1) is just f; repeated(f, n) is f composed with repeated(f, n-1). This is a recursive definition of a function that builds functions — a higher-order function whose output grows with each level of recursion.',
      code: 'function compose(f, g) {\n  return x => f(g(x));\n}\n\nfunction repeated(f, n) {\n  if (n === 1) return f;\n  return compose(f, repeated(f, n - 1));\n}\n\nconst double = x => x * 2;\n\nconsole.log(repeated(double, 1)(3));  // 6   (double once)\nconsole.log(repeated(double, 3)(3));  // 24  (double three times: 3→6→12→24)\nconsole.log(repeated(double, 4)(1));  // 16  (2⁴)',
    },
    {
      type: 'codelens',
      id: 'codelens-repeated',
      text: 'Open CodeLens on repeated(double, 3)(5). Step through it — repeated builds a chain of compose calls: compose(double, compose(double, double)). Then that composed function is applied to 5. Watch how the chain unfolds: double is called three times, each time wrapping the result of the previous.',
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
