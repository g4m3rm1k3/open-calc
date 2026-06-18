export const lesson = {
  id: 'sicp-1-6',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '1.3.1–1.3.2  Higher-Order Functions',
  checkpoints: [
    { id: 'cp-hof',     label: 'Functions as Arguments' },
    { id: 'cp-lambda',  label: 'Lambda & Closures' },
    { id: 'cp-product', label: 'Product' },
  ],
  segments: [

    // ══════════════════════════════════════════════════════════════════════════
    // Introduction
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'intro',
      text: 'Section 1.3 is the payoff of everything so far. We have been treating numbers, booleans, and strings as first-class values — things you can name, pass around, and return from functions. Now we extend that right to functions themselves.\n\nThis is not just a convenience. It is a fundamental shift in expressive power. When functions become values, you can abstract over not just DATA but over PATTERNS OF COMPUTATION. Instead of writing the same loop structure five times with five different operations, you write the loop structure once and pass the operation in.',
      code: null,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 1.3.1 — Functions as Arguments
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'first-class-vocab',
      text: 'Vocabulary:\n\n  First-class value — a value that can be:\n    1. Named with const or let\n    2. Passed as an argument to a function\n    3. Returned as the result of a function\n    4. Stored in a data structure\n\nNumbers are first-class. Strings are first-class. In JavaScript, functions are also first-class. Treating functions as first-class values is what enables higher-order programming.\n\n  Higher-order function — a function that takes another function as an argument, returns a function as its result, or both.',
      code: null,
    },

    // ── Spot the pattern ──────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'pattern-observe-1',
      text: 'Look at these two functions. Both sum a sequence of values from a to b. Look for what is shared and what differs.',
      code: `// Sum of integers: 1 + 2 + 3 + ... + n
function sum_integers(a, b) {
  if (a > b) return 0;
  return a + sum_integers(a + 1, b);
}

console.log(sum_integers(1, 5));  // 15`,
    },
    {
      type: 'narration',
      id: 'pattern-observe-2',
      text: 'Same structure, different operation.',
      code: `// Sum of integers: 1 + 2 + 3 + ... + n
function sum_integers(a, b) {
  if (a > b) return 0;
  return a + sum_integers(a + 1, b);
}

// Sum of cubes: 1³ + 2³ + 3³ + ... + n³
function sum_cubes(a, b) {
  if (a > b) return 0;
  return (a * a * a) + sum_cubes(a + 1, b);
}

console.log(sum_integers(1, 5));  // 15
console.log(sum_cubes(1, 3));     // 36  (1 + 8 + 27)`,
    },
    {
      type: 'narration',
      id: 'pattern-shared',
      text: 'The shared skeleton:\n\n  function sum_???(a, b) {\n    if (a > b) return 0;\n    return ???(a) + sum_???(a + 1, b);\n  }\n\nThe only difference is what we compute from each element — ???(a). In sum_integers that is just a. In sum_cubes it is a³. The recursion structure, the bounds check, the step size of 1 — all identical.\n\nA pattern that appears identically in multiple places is a pattern waiting to be named.',
      code: null,
    },

    // ── Build the sum abstraction ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'sum-signature',
      text: 'Name the pattern. sum takes term (a function applied to each element), a and b (the bounds), and next (a function that advances from one element to the next). Replace the two varying parts with parameters.',
      code: `function sum(term, a, next, b) {
  // body to be added
}`,
    },
    {
      type: 'narration',
      id: 'sum-base',
      text: 'Add the base case: when a > b, the sum is 0.',
      code: `function sum(term, a, next, b) {
  if (a > b) return 0;
  // recursive case to be added
}`,
    },
    {
      type: 'narration',
      id: 'sum-recursive',
      text: 'Add the recursive case. Apply term to a, then add the sum of the rest. next(a) advances to the next element.',
      code: `function sum(term, a, next, b) {
  if (a > b) return 0;
  return term(a) + sum(term, next(a), next, b);
}`,
    },
    {
      type: 'narration',
      id: 'sum-use-named',
      text: 'Use the abstraction. Define identity and inc as named functions — we will make them anonymous in a moment.',
      code: `function sum(term, a, next, b) {
  if (a > b) return 0;
  return term(a) + sum(term, next(a), next, b);
}

function identity(x) { return x; }
function cube(x)     { return x * x * x; }
function inc(x)      { return x + 1; }

// Sum of integers 1..5
console.log(sum(identity, 1, inc, 5));  // 15

// Sum of cubes 1..3
console.log(sum(cube, 1, inc, 3));      // 36`,
    },
    {
      type: 'codelens',
      id: 'codelens-sum',
      text: 'Open CodeLens on sum(cube, 1, inc, 3). Watch how term and inc are called as ordinary functions inside sum. sum has no idea whether term is cube or identity or anything else — it just calls it. Step through and watch each call: cube is called for 1, 2, and 3, with the results accumulated. The abstraction and the detail are completely separate.',
      code: `function sum(term, a, next, b) {
  if (a > b) return 0;
  return term(a) + sum(term, next(a), next, b);
}
function cube(x) { return x * x * x; }
function inc(x)  { return x + 1; }

console.log(sum(cube, 1, inc, 3));`,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 1.3.2 — Lambda Functions
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'lambda-vocab',
      text: 'Defining identity and inc as standalone functions just to pass them once is noisy. We need temporary, unnamed functions — values that happen to be functions, with no need for a permanent name.\n\nSICP calls these lambda expressions, from the Greek letter λ used in lambda calculus — the mathematical theory of computation underlying all functional programming, developed by Alonzo Church in the 1930s.\n\nJavaScript\'s syntax for lambda expressions is the arrow function: x => x + 1 is the function that takes x and returns x + 1. It is a function literal — a function as a value, like 42 is a number literal.',
      code: null,
    },
    {
      type: 'narration',
      id: 'lambda-intro',
      text: 'Arrow functions in JavaScript. The arrow => separates parameters from the body.',
      code: `// Named function
function double(x) { return x * 2; }

// Same thing as an arrow function
const double_arrow = x => x * 2;

// Both work identically
console.log(double(5));        // 10
console.log(double_arrow(5));  // 10

// Multi-parameter arrow function
const add = (x, y) => x + y;
console.log(add(3, 4));  // 7`,
    },
    {
      type: 'narration',
      id: 'lambda-inline',
      text: 'Pass arrow functions directly to sum — no need to define identity or inc separately.',
      code: `function sum(term, a, next, b) {
  if (a > b) return 0;
  return term(a) + sum(term, next(a), next, b);
}

// Same computations, but using inline arrow functions
console.log(sum(x => x,         1, x => x + 1, 5));  // 15  (sum of integers)
console.log(sum(x => x*x*x,     1, x => x + 1, 3));  // 36  (sum of cubes)
console.log(sum(x => x*x,       1, x => x + 1, 4));  // 30  (sum of squares: 1+4+9+16)`,
    },
    {
      type: 'narration',
      id: 'pi-sum',
      text: 'The Leibniz formula for π: π/8 = 1/(1×3) + 1/(5×7) + 1/(9×11) + ... Each term is 1/(x×(x+2)) and the sequence advances by 4. We can express this in one shot using sum and arrow functions.',
      code: `function sum(term, a, next, b) {
  if (a > b) return 0;
  return term(a) + sum(term, next(a), next, b);
}

// π/8 ≈ sum of 1/(x*(x+2)) for x = 1, 5, 9, 13, ...
function pi_sum(a, b) {
  return sum(
    x => 1 / (x * (x + 2)),
    a,
    x => x + 4,
    b
  );
}

console.log(8 * pi_sum(1, 1000));  // ≈ 3.139  (converges slowly to π)`,
    },
    { type: 'checkpoint', id: 'cp-hof' },

    // ── Closures ──────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'closure-intro',
      text: 'Arrow functions can capture variables from the surrounding scope. When an arrow function is created inside another function, it remembers the variables from that outer scope — even after the outer function finishes. This is called a closure.\n\nHere is a function that returns a function. make_adder(5) creates a closure that has permanently captured n = 5.',
      code: `const make_adder = n => x => x + n;`,
    },
    {
      type: 'narration',
      id: 'closure-use',
      text: 'Call make_adder(5) — it returns a new function. That function captures n = 5. Calling it later with any x adds 5 to x. Each call to make_adder creates a separate closure with its own captured n.',
      code: `const make_adder = n => x => x + n;

const add5  = make_adder(5);   // captures n = 5
const add10 = make_adder(10);  // captures n = 10

console.log(add5(3));   // 8   — n is 5 in this closure
console.log(add10(3));  // 13  — n is 10 in this closure
console.log(add5(100)); // 105 — same add5, still n = 5`,
    },
    {
      type: 'narration',
      id: 'closure-in-sum',
      text: 'Closures unlock a key capability: building specialised functions from general ones without any extra syntax. The lambda x => x / guess inside sqrt captures guess from the outer scope — it is a closure.',
      code: `function sum(term, a, next, b) {
  if (a > b) return 0;
  return term(a) + sum(term, next(a), next, b);
}

// Build a sum function for a specific step size using a closure
function sum_with_step(term, step) {
  return (a, b) => sum(term, a, x => x + step, b);
}

const sum_evens  = sum_with_step(x => x, 2);  // sum even numbers
const sum_squares_by3 = sum_with_step(x => x*x, 3); // sum squares, step 3

console.log(sum_evens(0, 10));          // 0+2+4+6+8+10 = 30
console.log(sum_squares_by3(1, 10));   // 1+16+49+100 = 166`,
    },
    { type: 'checkpoint', id: 'cp-lambda' },

    {
      type: 'challenge',
      id: 'challenge-sum-squares',
      text: 'Write sum_squares(a, b) using sum and an arrow function for term. sum_squares(1, 4) = 1 + 4 + 9 + 16 = 30. Then write sum_odd(a, b) that sums only the odd numbers from a to b. sum_odd(1, 9) = 1+3+5+7+9 = 25.',
      expectedOutput: '30\n55\n25',
      startCode: `function sum(term, a, next, b) {
  if (a > b) return 0;
  return term(a) + sum(term, next(a), next, b);
}

// sum_squares: sum of squares from a to b
function sum_squares(a, b) {
  return sum(/* term */, a, /* next */, b);
}

// sum_odd: sum of odd numbers from a to b
// hint: next should skip by 2
function sum_odd(a, b) {
  // start at odd a, step by 2
}

console.log(sum_squares(1, 4));  // 30
console.log(sum_squares(1, 5));  // 55
console.log(sum_odd(1, 9));      // 25
`,
      hint: 'function sum_squares(a, b) {\n  return sum(x => x * x, a, x => x + 1, b);\n}\nfunction sum_odd(a, b) {\n  // Make sure a starts odd\n  const start = a % 2 === 0 ? a + 1 : a;\n  return sum(x => x, start, x => x + 2, b);\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof sum_squares === 'function' && sum_squares(1,4) === 30 && sum_squares(1,5) === 55`)
          return fn() === true
        } catch { return false }
      },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 3 — Product (the natural complement to sum)
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'product-motivation',
      text: 'Look at sum again:\n\n  if (a > b) return 0;           // identity for +\n  return term(a) + sum(...)      // combine with +\n\nThe base value (0) and the combining operation (+) are both hardcoded. What if we changed them?\n\n  if (a > b) return 1;           // identity for ×\n  return term(a) * product(...)  // combine with ×\n\nThat is product — the natural complement to sum. SICP 1.3.1 asks you to write it. With product you can express factorial and the Wallis formula for π.',
      code: null,
    },
    {
      type: 'narration',
      id: 'product-base',
      text: 'Write product. Same structure as sum — only the base value and operator change.',
      code: `function product(term, a, next, b) {
  if (a > b) return 1;           // identity for multiplication
  return term(a) * product(term, next(a), next, b);
}`,
    },
    {
      type: 'narration',
      id: 'product-factorial',
      text: 'Factorial is a product of integers from 1 to n — one line.',
      code: `function product(term, a, next, b) {
  if (a > b) return 1;
  return term(a) * product(term, next(a), next, b);
}

function factorial(n) {
  return product(x => x, 1, x => x + 1, n);
}

console.log(factorial(5));   // 120
console.log(factorial(10));  // 3628800`,
    },
    {
      type: 'narration',
      id: 'product-wallis',
      text: 'The Wallis formula (1655): π/4 = (2/3) × (4/3) × (4/5) × (6/5) × (6/7) × ...\n\nThe kth term in the product is (2k/(2k−1)) × (2k/(2k+1)). Using product with k running from 1 to n gives an approximation.',
      code: `function product(term, a, next, b) {
  if (a > b) return 1;
  return term(a) * product(term, next(a), next, b);
}

function wallis_pi(n) {
  return product(
    k => (2*k / (2*k - 1)) * (2*k / (2*k + 1)),
    1,
    k => k + 1,
    n
  );
}

console.log(4 * wallis_pi(10));    // ≈ 3.092
console.log(4 * wallis_pi(100));   // ≈ 3.128
console.log(4 * wallis_pi(1000));  // ≈ 3.140`,
    },
    { type: 'checkpoint', id: 'cp-product' },

    {
      type: 'challenge',
      id: 'challenge-make-multiplier',
      text: 'Write make_multiplier(n) that returns a function which multiplies its argument by n. This is a closure: the returned function captures n. make_multiplier(3)(7) should return 21. Then write double_then_add(k) that returns a function which doubles its argument then adds k.',
      expectedOutput: '21\n50\n11',
      startCode: `// make_multiplier(n) returns x => n * x
const make_multiplier = n => /* your arrow function */;

// double_then_add(k) returns x => x * 2 + k
const double_then_add = k => /* your arrow function */;

console.log(make_multiplier(3)(7));     // 21
console.log(make_multiplier(5)(10));    // 50
console.log(double_then_add(1)(5));     // 11  (5*2 + 1)
`,
      hint: 'const make_multiplier = n => x => n * x;\nconst double_then_add = k => x => x * 2 + k;',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof make_multiplier === 'function' && make_multiplier(3)(7) === 21 && make_multiplier(5)(10) === 50`)
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
