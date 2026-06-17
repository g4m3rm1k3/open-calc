export const lesson = {
  id: 'sicp-1-7',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '1.3.3–1.3.4  Functions as Returned Values',
  checkpoints: [
    { id: 'cp-half-interval', label: 'Bisection Search' },
    { id: 'cp-fixed-point',   label: 'Fixed Points' },
    { id: 'cp-composition',   label: 'Composition' },
  ],
  segments: [

    // ══════════════════════════════════════════════════════════════════════════
    // Introduction
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'intro',
      text: 'Last lesson we passed functions in. Now we return them out. A function that produces a new function is a transformer of behaviour — not just a transformer of data. Section 1.3.3 introduces two general methods for finding function values: bisection search and fixed-point iteration. Section 1.3.4 shows how average damping, Newton\'s method, and square roots are all instances of the same abstract pattern, separated only by which functions you compose together.',
      code: null,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 1.3.3a — Half-Interval Method
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'half-interval-vocab',
      text: 'The half-interval method (bisection search) finds a root of a function — a value x where f(x) = 0. The mathematical foundation: the Intermediate Value Theorem says that if f(a) < 0 and f(b) > 0 and f is continuous, then somewhere between a and b there must be a root.\n\nAlgorithm: evaluate f at the midpoint. If the midpoint value has the same sign as f(a), the root is in the upper half — replace a. Otherwise the root is in the lower half — replace b. Repeat. Each step halves the interval. After log₂((b-a)/tolerance) steps, you have the root to the desired precision.',
      code: null,
    },
    {
      type: 'narration',
      id: 'half-interval-search',
      text: 'Build the search function. It takes f and the current negative/positive brackets. When the interval is small enough (< tolerance), return the midpoint.',
      code: `function half_interval_search(f, neg, pos) {
  const mid = (neg + pos) / 2;
  if (Math.abs(pos - neg) < 0.001) return mid;
  // check midpoint and recurse
}`,
    },
    {
      type: 'narration',
      id: 'half-interval-recurse',
      text: 'Evaluate f at the midpoint. If f(mid) < 0, mid becomes the new negative bracket. If f(mid) > 0, mid becomes the new positive bracket. If f(mid) = 0 exactly, we are done.',
      code: `function half_interval_search(f, neg, pos) {
  const mid = (neg + pos) / 2;
  if (Math.abs(pos - neg) < 0.001) return mid;
  const f_mid = f(mid);
  if (f_mid < 0) return half_interval_search(f, mid, pos);
  if (f_mid > 0) return half_interval_search(f, neg, mid);
  return mid;  // exactly zero
}`,
    },
    {
      type: 'narration',
      id: 'half-interval-wrapper',
      text: 'A wrapper handles the initial setup: sort the endpoints and verify they bracket a root.',
      code: `function half_interval_search(f, neg, pos) {
  const mid = (neg + pos) / 2;
  if (Math.abs(pos - neg) < 0.001) return mid;
  const f_mid = f(mid);
  if (f_mid < 0) return half_interval_search(f, mid, pos);
  if (f_mid > 0) return half_interval_search(f, neg, mid);
  return mid;
}

function half_interval_method(f, a, b) {
  const fa = f(a), fb = f(b);
  if (fa < 0 && fb > 0) return half_interval_search(f, a, b);
  if (fa > 0 && fb < 0) return half_interval_search(f, b, a);
  throw new Error('f(a) and f(b) do not have opposite signs');
}`,
    },
    {
      type: 'narration',
      id: 'half-interval-demo',
      text: 'Find a root of x³ − 2x − 3. Also find π by finding where sin(x) = 0 between 2 and 4.',
      code: `function half_interval_search(f, neg, pos) {
  const mid = (neg + pos) / 2;
  if (Math.abs(pos - neg) < 0.001) return mid;
  const fm = f(mid);
  if (fm < 0) return half_interval_search(f, mid, pos);
  if (fm > 0) return half_interval_search(f, neg, mid);
  return mid;
}
function half_interval_method(f, a, b) {
  const fa = f(a), fb = f(b);
  if (fa < 0 && fb > 0) return half_interval_search(f, a, b);
  if (fa > 0 && fb < 0) return half_interval_search(f, b, a);
}

// Root of x³ - 2x - 3 = 0 between 1 and 3
console.log(half_interval_method(x => x*x*x - 2*x - 3, 1, 3)); // ≈ 1.893

// sin(x) = 0 between 2 and 4 — that root is π
console.log(half_interval_method(Math.sin, 2, 4));  // ≈ 3.14159`,
    },
    { type: 'checkpoint', id: 'cp-half-interval' },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 1.3.3b — Fixed Points
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'fixed-point-vocab',
      text: 'A fixed point of a function f is a value x where f(x) = x — the function maps x back to itself. For example, cos(x) has a fixed point near 0.739 because cos(0.739) ≈ 0.739.\n\nTo find a fixed point numerically: start with a guess, apply f to get a new value, apply f again, repeat. If the sequence converges, it converges to a fixed point. This works when the function does not overshoot too badly — formally, when f is a contraction.',
      code: null,
    },
    {
      type: 'narration',
      id: 'fixed-point-try',
      text: 'Build the inner loop. try_it applies f and checks whether the new value is close enough to the old one.',
      code: `function fixed_point(f, first_guess) {
  const tolerance = 0.00001;

  function close_enough(a, b) {
    return Math.abs(a - b) < tolerance;
  }

  function try_it(guess) {
    const next = f(guess);
    if (close_enough(guess, next)) return next;
    return try_it(next);
  }

  return try_it(first_guess);
}`,
    },
    {
      type: 'narration',
      id: 'fixed-point-cosine',
      text: 'Find the cosine fixed point. Starting from 1.0, the sequence converges to ≈ 0.739.',
      code: `function fixed_point(f, first_guess) {
  const tol = 0.00001;
  function try_it(g) {
    const next = f(g);
    return Math.abs(g - next) < tol ? next : try_it(next);
  }
  return try_it(first_guess);
}

// cos(x) = x — the fixed point of cosine
console.log(fixed_point(Math.cos, 1.0));  // ≈ 0.7390851`,
    },
    {
      type: 'narration',
      id: 'fixed-point-oscillation',
      text: 'Not every function converges. Searching for √2 by finding the fixed point of y → 2/y oscillates forever: starting from 1, the sequence goes 1 → 2 → 1 → 2 → ... The function overshoots the fixed point every time.\n\nThe fix is average damping: instead of jumping to f(x), move to the average of x and f(x). This halves each step and prevents overshoot.',
      code: null,
    },
    {
      type: 'narration',
      id: 'fixed-point-sqrt',
      text: '√2 is the fixed point of y → 2/y. With average damping: use y → (y + 2/y)/2. This is exactly the improve step from Newton\'s square root in lesson 1-2.',
      code: `function fixed_point(f, first_guess) {
  const tol = 0.00001;
  function try_it(g) {
    const next = f(g);
    return Math.abs(g - next) < tol ? next : try_it(next);
  }
  return try_it(first_guess);
}

// Oscillates — do NOT run this (infinite loop):
// fixed_point(y => 2 / y, 1.0)

// With average damping: converges to √2
console.log(fixed_point(y => (y + 2/y) / 2, 1.0));  // 1.41421...
console.log(fixed_point(y => (y + 9/y) / 2, 1.0));  // 3.0000...`,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 1.3.4 — Functions as Returned Values
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'average-damp-motivation',
      text: 'The average-damping trick appears in multiple problems: square roots, cube roots, higher roots. Instead of hardcoding the damping every time, package it as a function transformer. average_damp takes a function f and returns a new function that averages x with f(x).',
      code: null,
    },
    {
      type: 'narration',
      id: 'average-damp-build',
      text: 'average_damp is a function that returns a function. The returned function captures f from the outer scope — a closure.',
      code: `function average_damp(f) {
  return x => (x + f(x)) / 2;
}`,
    },
    {
      type: 'narration',
      id: 'average-damp-use',
      text: 'average_damp(y => 2/y) returns a new function that, given y, computes (y + 2/y)/2 — exactly our damped sqrt target. Now sqrt is a composition of two general ideas.',
      code: `function fixed_point(f, first_guess) {
  const tol = 0.00001;
  function try_it(g) { const n = f(g); return Math.abs(g-n)<tol ? n : try_it(n); }
  return try_it(first_guess);
}

function average_damp(f) {
  return x => (x + f(x)) / 2;
}

function sqrt(x) {
  return fixed_point(average_damp(y => x / y), 1.0);
}

console.log(sqrt(2));    // 1.41421...
console.log(sqrt(9));    // 3.00000...
console.log(sqrt(144));  // 12.0000...`,
    },
    {
      type: 'narration',
      id: 'cube-root-as-fp',
      text: 'Cube root of x is a fixed point of y → x/y² — with average damping to prevent oscillation. Same pattern, different function passed in.',
      code: `function fixed_point(f, first_guess) {
  const tol = 0.00001;
  function try_it(g) { const n = f(g); return Math.abs(g-n)<tol ? n : try_it(n); }
  return try_it(first_guess);
}
function average_damp(f) { return x => (x + f(x)) / 2; }

function cube_root(x) {
  return fixed_point(average_damp(y => x / (y * y)), 1.0);
}

console.log(cube_root(8));    // ≈ 2.0
console.log(cube_root(27));   // ≈ 3.0`,
    },
    {
      type: 'codelens',
      id: 'codelens-fixed-point',
      text: 'Open CodeLens on sqrt(2) expressed as fixed_point(average_damp(y => 2/y), 1.0). Watch the heap — average_damp returns a closure object, and that closure is passed to fixed_point. Step through try_it and watch each iteration bring the guess closer to 1.41421. Functions-returning-functions are visible as objects on the heap with closure pointers.',
      code: `function fixed_point(f, first_guess) {
  const tol = 0.00001;
  function try_it(g) { const n = f(g); return Math.abs(g-n)<tol ? n : try_it(n); }
  return try_it(first_guess);
}
function average_damp(f) { return x => (x + f(x)) / 2; }
function sqrt(x) { return fixed_point(average_damp(y => x / y), 1.0); }

console.log(sqrt(2));`,
    },
    { type: 'checkpoint', id: 'cp-fixed-point' },

    // ── Compose and repeat ────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'compose-vocab',
      text: 'Mathematical composition: (f ∘ g)(x) = f(g(x)). Apply g first, then apply f to the result. In code: compose(f, g) returns a new function that applies g then f.',
      code: `function compose(f, g) {
  return x => f(g(x));
}`,
    },
    {
      type: 'narration',
      id: 'compose-demo',
      text: 'Compose two functions. Note the order: in compose(f, g), g runs first.',
      code: `function compose(f, g) {
  return x => f(g(x));
}

const double   = x => x * 2;
const add1     = x => x + 1;
const square   = x => x * x;

const double_then_add1   = compose(add1, double);
const square_then_double = compose(double, square);

console.log(double_then_add1(5));    // 11  — 5*2=10, +1=11
console.log(square_then_double(3));  // 18  — 3²=9, 9*2=18`,
    },
    {
      type: 'narration',
      id: 'repeated-build',
      text: 'repeated(f, n) applies f n times. Base case: repeated(f, 1) is just f. Recursive case: compose f with repeated(f, n-1).',
      code: `function compose(f, g) { return x => f(g(x)); }

function repeated(f, n) {
  if (n === 1) return f;
  return compose(f, repeated(f, n - 1));
}`,
    },
    {
      type: 'narration',
      id: 'repeated-demo',
      text: 'Apply double three times: 3 → 6 → 12 → 24.',
      code: `function compose(f, g) { return x => f(g(x)); }
function repeated(f, n) {
  if (n === 1) return f;
  return compose(f, repeated(f, n - 1));
}

const double = x => x * 2;

console.log(repeated(double, 1)(3));  // 6   (double once)
console.log(repeated(double, 3)(3));  // 24  (double three times)
console.log(repeated(double, 4)(1));  // 16  (2⁴)`,
    },
    {
      type: 'codelens',
      id: 'codelens-repeated',
      text: 'Open CodeLens on repeated(double, 3)(5). Step through it — repeated builds a chain of compose calls: compose(double, compose(double, double)). Then the composed function is applied to 5. Watch the heap fill up with closure objects, each pointing to the next.',
      code: `function compose(f, g) { return x => f(g(x)); }
function repeated(f, n) {
  if (n === 1) return f;
  return compose(f, repeated(f, n - 1));
}
const double = x => x * 2;
console.log(repeated(double, 3)(5));`,
    },
    { type: 'checkpoint', id: 'cp-composition' },

    {
      type: 'challenge',
      id: 'challenge-smooth',
      text: 'The smoothed version of a function f averages three nearby values: (f(x−dx) + f(x) + f(x+dx)) / 3. Write smooth(f) that returns this smoothed function. Use dx = 0.00001. Then write n_fold_smooth(f, n) that applies smooth n times using repeated. n_fold_smooth(x => x*x, 1)(2) ≈ 4.',
      expectedOutput: '4\n4',
      startCode: `const dx = 0.00001;

function compose(f, g) { return x => f(g(x)); }
function repeated(f, n) { return n === 1 ? f : compose(f, repeated(f, n-1)); }

// smooth(f) returns x => (f(x-dx) + f(x) + f(x+dx)) / 3
function smooth(f) {
  // your code
}

// n_fold_smooth(f, n) applies smooth n times using repeated
function n_fold_smooth(f, n) {
  // your code
}

const sq = x => x * x;
console.log(Math.round(smooth(sq)(2)));             // 4
console.log(Math.round(n_fold_smooth(sq, 3)(2)));   // 4
`,
      hint: 'function smooth(f) {\n  return x => (f(x-dx) + f(x) + f(x+dx)) / 3;\n}\nfunction n_fold_smooth(f, n) {\n  return repeated(smooth, n)(f);\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof smooth === 'function' && Math.abs(smooth(x => x*x)(2) - 4) < 0.01`)
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
