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

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 1.1.6 — Conditional Expressions and Predicates
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'intro',
      text: 'Last lesson we could compute, name, and define functions — but every computation ran in a straight line. There was no way to choose between two different paths depending on the input. This lesson adds that: conditionals. With conditionals and the recursive functions from last time we can write programs of arbitrary complexity. We will also build square root from scratch — one small helper at a time — which will show exactly how real programs are assembled from pieces.',
      code: null,
    },

    // ── Vocabulary ────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'conditional-vocab',
      text: 'SICP uses precise vocabulary for conditionals. Learn these three words — they appear throughout the rest of the book:\n\n  Predicate — an expression that evaluates to true or false. In an if statement, the predicate is the test: the part inside the condition.\n\n  Consequent — the expression evaluated when the predicate is true. The then-branch.\n\n  Alternative — the expression evaluated when the predicate is false. The else-branch.\n\nIn if (x < 0) { return -x; } else { return x; }, the predicate is x < 0, the consequent is -x, and the alternative is x.',
      code: null,
    },

    // ── Build abs step by step ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'abs-signature',
      text: 'Start with absolute value. The mathematical definition: |x| = x when x ≥ 0, and |x| = −x when x < 0. Write the function signature first — just the shell, no body yet.',
      code: `function abs(x) {
  // body to be added
}`,
    },
    {
      type: 'narration',
      id: 'abs-predicate',
      text: 'Add the predicate. The test is x < 0. When this is true, the input is negative.',
      code: `function abs(x) {
  if (x < 0) {
    // consequent: what to do when negative
  } else {
    // alternative: what to do otherwise
  }
}`,
    },
    {
      type: 'narration',
      id: 'abs-complete',
      text: 'Fill in the branches. If x is negative, return its negation. Otherwise, return x unchanged.',
      code: `function abs(x) {
  if (x < 0) {
    return -x;   // consequent
  } else {
    return x;    // alternative
  }
}`,
    },
    {
      type: 'narration',
      id: 'abs-test',
      text: 'Test all three cases: negative, zero, and positive. For a correct abs, the output should never be negative.',
      code: `function abs(x) {
  if (x < 0) {
    return -x;
  } else {
    return x;
  }
}

console.log(abs(-7));  // 7
console.log(abs(0));   // 0
console.log(abs(5));   // 5`,
    },

    // ── Ternary and comparison operators ─────────────────────────────────────

    {
      type: 'narration',
      id: 'ternary-vocab',
      text: 'When each branch is a single expression, JavaScript offers the ternary operator — condition ? then-value : else-value. It is an expression, not a statement, so it can appear anywhere a value is expected. Both versions of abs are identical in behaviour.',
      code: `function abs(x) {
  return x < 0 ? -x : x;  // same as if/else above
}

console.log(abs(-7));  // 7
console.log(abs(5));   // 5`,
    },
    {
      type: 'narration',
      id: 'comparison-ops',
      text: 'The comparison operators that produce predicates: < (less than), > (greater than), === (equal to), <= (less than or equal), >= (greater than or equal). Each returns a boolean — true or false.',
      code: `console.log(5 > 3);    // true
console.log(5 === 5);  // true
console.log(5 === 6);  // false
console.log(3 >= 3);   // true
console.log(2 <= 1);   // false`,
    },
    {
      type: 'narration',
      id: 'logical-ops',
      text: 'Predicates can be combined with logical operators. && (AND) is true only when both sides are true. || (OR) is true when at least one side is true. ! (NOT) inverts a boolean.',
      code: `const x = 5;

// AND: both conditions must hold
console.log(x > 0 && x < 10);  // true  — 5 is between 0 and 10
console.log(x > 0 && x > 10);  // false — 5 is not > 10

// OR: either condition is enough
console.log(x < 0 || x > 3);   // true  — 5 > 3

// NOT: flip the result
console.log(!(x === 5));        // false — 5 === 5 is true, not true is false`,
    },

    // ── Special forms: if does not evaluate both branches ─────────────────────

    {
      type: 'narration',
      id: 'special-forms-vocab',
      text: 'Here is something non-obvious about conditionals: they are special forms — exceptions to the normal evaluation rule.\n\nThe normal rule (from lesson 1-1) says: evaluate ALL sub-expressions, then apply the operator. But if does NOT evaluate both branches. The interpreter evaluates the predicate first. Then it evaluates only the branch that matches — the other branch is never touched.\n\nThis matters when a branch would cause an error. if (x !== 0) { return 1/x; } is safe even when x is 0 — the division is never reached. If both branches always evaluated, this would always divide by zero for x = 0.\n\n&&  and || also short-circuit: in a && b, if a is false, b is never evaluated. In a || b, if a is true, b is never evaluated.',
      code: `// Safe — the division is never evaluated when x is 0
function safe_reciprocal(x) {
  return x !== 0 ? 1 / x : 'undefined';
}

console.log(safe_reciprocal(4));    // 0.25
console.log(safe_reciprocal(0));    // 'undefined' — no division by zero`,
    },
    {
      type: 'challenge',
      id: 'challenge-sign',
      text: 'Write sign(x) that returns -1 for negative numbers, 0 for zero, and 1 for positive numbers. You need three cases — use if / else if / else. sign(-5) = -1, sign(0) = 0, sign(7) = 1.',
      expectedOutput: '-1\n0\n1',
      startCode: `function sign(x) {
  // if x < 0: return -1
  // else if x === 0: return 0
  // else: return 1
}

console.log(sign(-5));  // -1
console.log(sign(0));   // 0
console.log(sign(7));   // 1
`,
      hint: 'function sign(x) {\n  if (x < 0) return -1;\n  else if (x === 0) return 0;\n  else return 1;\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof sign === 'function' && sign(-5) === -1 && sign(0) === 0 && sign(7) === 1`)
          return fn() === true
        } catch { return false }
      },
    },
    { type: 'checkpoint', id: 'cp-conditionals' },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 1.1.7 — Square Roots by Newton's Method
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'declarative-vs-imperative',
      text: 'Here is a deep observation from SICP. There are two kinds of knowledge about square root:\n\n  Declarative: the square root of x is the non-negative y such that y × y = x.\n  Imperative: a procedure for finding y.\n\nThe declarative definition tells you WHAT the answer is. It says nothing about HOW to compute it. A program must be imperative — it must specify a sequence of operations. The declarative definition of sqrt is a mathematical fact. To write a program we need an algorithm. Newton\'s method is that algorithm.',
      code: null,
    },
    {
      type: 'narration',
      id: 'newtons-idea',
      text: 'Newton\'s idea: start with any positive guess for √x (we will use 1.0). Improve the guess by computing the average of the current guess and x divided by the guess. Repeat until the guess is close enough to the true answer.\n\nWhy does averaging (guess + x/guess) / 2 improve the guess? If guess is too large, then x/guess is too small, and their average is closer to the truth. If guess is too small, x/guess is too large — same logic. The average is always between the too-large and too-small values, and therefore always closer to √x.',
      code: null,
    },

    // ── Build sqrt piece by piece ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'sqrt-square',
      text: 'The helpers we need: square (already familiar), and abs (just written). Define them at the top.',
      code: `function square(x) { return x * x; }
function abs(x)    { return x < 0 ? -x : x; }`,
    },
    {
      type: 'narration',
      id: 'sqrt-improve',
      text: 'The improve function: given a guess and the target x, return a better guess. The formula is (guess + x/guess) / 2 — the average of the guess and x-over-guess.',
      code: `function square(x) { return x * x; }
function abs(x)    { return x < 0 ? -x : x; }

function improve(guess, x) {
  return (guess + x / guess) / 2;
}`,
    },
    {
      type: 'narration',
      id: 'sqrt-improve-demo',
      text: 'See improve in action. One step toward √2, starting from 1.0:',
      code: `function square(x) { return x * x; }
function abs(x)    { return x < 0 ? -x : x; }

function improve(guess, x) {
  return (guess + x / guess) / 2;
}

// One step from guess=1.0 toward sqrt(2)
console.log(improve(1.0, 2));   // 1.5
console.log(improve(1.5, 2));   // 1.4166...
console.log(improve(1.4166, 2)); // 1.4142...`,
    },
    {
      type: 'narration',
      id: 'sqrt-convergence',
      text: 'Watch the convergence explicitly. Starting from 1.0, apply improve repeatedly and log each step. The sequence homes in on √2 ≈ 1.41421356 very quickly — just four applications get us to full precision.',
      code: `function improve(guess, x) {
  return (guess + x / guess) / 2;
}

let g = 1.0;
for (let i = 1; i <= 5; i++) {
  g = improve(g, 2);
  console.log(\`step \${i}: \${g}\`);
}
// Converges to √2 = 1.41421356...`,
    },
    {
      type: 'narration',
      id: 'sqrt-good-enough',
      text: 'We need a stopping criterion. good_enough returns true when the squared guess is within 0.001 of x. It uses square and abs — two functions we already have.',
      code: `function square(x) { return x * x; }
function abs(x)    { return x < 0 ? -x : x; }

function improve(guess, x) {
  return (guess + x / guess) / 2;
}

function good_enough(guess, x) {
  return abs(square(guess) - x) < 0.001;
}`,
    },
    {
      type: 'narration',
      id: 'sqrt-good-enough-demo',
      text: 'Test good_enough on a few values. 1.4 squared is 1.96 — the error is 0.04, which is > 0.001, so not good enough yet. 1.414 squared is about 1.99996 — error < 0.001, good enough.',
      code: `function square(x) { return x * x; }
function abs(x)    { return x < 0 ? -x : x; }

function good_enough(guess, x) {
  return abs(square(guess) - x) < 0.001;
}

console.log(good_enough(1.0,   2));  // false — 1.0²=1, error=1
console.log(good_enough(1.4,   2));  // false — 1.4²=1.96, error=0.04
console.log(good_enough(1.414, 2));  // true  — 1.414²≈1.9996, error≈0.0004`,
    },
    {
      type: 'narration',
      id: 'sqrt-iter',
      text: 'Now the loop. sqrt_iter takes the current guess and the target x. If good_enough is satisfied, return the guess — we are done. Otherwise, improve the guess and call sqrt_iter again with the better value. This is recursive iteration: the function calls itself with a better state, not with deferred work.',
      code: `function square(x) { return x * x; }
function abs(x)    { return x < 0 ? -x : x; }

function improve(guess, x) {
  return (guess + x / guess) / 2;
}

function good_enough(guess, x) {
  return abs(square(guess) - x) < 0.001;
}

function sqrt_iter(guess, x) {
  if (good_enough(guess, x)) {
    return guess;
  } else {
    return sqrt_iter(improve(guess, x), x);
  }
}`,
    },
    {
      type: 'narration',
      id: 'sqrt-complete',
      text: 'Finally, the public sqrt function. It starts the iteration with an initial guess of 1. The choice of 1 is arbitrary — any positive number would converge, just at different speeds.',
      code: `function square(x) { return x * x; }
function abs(x)    { return x < 0 ? -x : x; }
function improve(guess, x)     { return (guess + x / guess) / 2; }
function good_enough(guess, x) { return abs(square(guess) - x) < 0.001; }
function sqrt_iter(guess, x) {
  return good_enough(guess, x) ? guess : sqrt_iter(improve(guess, x), x);
}

function sqrt(x) {
  return sqrt_iter(1, x);
}

console.log(sqrt(2));    // 1.4142...
console.log(sqrt(9));    // 3.0000...
console.log(sqrt(144));  // 12.0000...`,
    },
    {
      type: 'codelens',
      id: 'codelens-sqrt-iter',
      text: 'Open CodeLens on sqrt_iter(1, 2). Watch the call stack — each frame is one iteration, one improved guess. The frames grow until good_enough returns true, then the entire stack unwinds returning the final guess. Compare this to the recursive factorial from lesson 1-3: same expand-then-return shape, but here what is accumulating between calls is just a better number, not deferred multiplication.',
      code: `function square(x) { return x * x; }
function abs(x)    { return x < 0 ? -x : x; }
function improve(guess, x)     { return (guess + x / guess) / 2; }
function good_enough(guess, x) { return abs(square(guess) - x) < 0.001; }

function sqrt_iter(guess, x) {
  if (good_enough(guess, x)) return guess;
  return sqrt_iter(improve(guess, x), x);
}

console.log(sqrt_iter(1, 2));`,
    },
    {
      type: 'challenge',
      id: 'challenge-sqrt-use',
      text: 'You have a working sqrt. The Pythagorean theorem says the hypotenuse of a right triangle is sqrt(a² + b²). Write hypotenuse(a, b) using the square and sqrt functions provided. hypotenuse(3, 4) ≈ 5, hypotenuse(5, 12) ≈ 13.',
      expectedOutput: '5\n13',
      startCode: `function square(x) { return x * x; }
function abs(x)    { return x < 0 ? -x : x; }
function improve(guess, x)     { return (guess + x / guess) / 2; }
function good_enough(guess, x) { return abs(square(guess) - x) < 0.001; }
function sqrt_iter(guess, x)   { return good_enough(guess, x) ? guess : sqrt_iter(improve(guess, x), x); }
function sqrt(x)               { return sqrt_iter(1, x); }

// Write hypotenuse(a, b) using sqrt and square

console.log(Math.round(hypotenuse(3, 4)));   // 5
console.log(Math.round(hypotenuse(5, 12)));  // 13
`,
      hint: 'function hypotenuse(a, b) { return sqrt(square(a) + square(b)); }',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof hypotenuse === 'function' && Math.abs(hypotenuse(3,4) - 5) < 0.01 && Math.abs(hypotenuse(5,12) - 13) < 0.01`)
          return fn() === true
        } catch { return false }
      },
    },
    { type: 'checkpoint', id: 'cp-sqrt' },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 1.1.8 — Functions as Black Boxes
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'blackbox-problem',
      text: 'The sqrt function works — but it has a problem. Its four helper functions (square, abs, improve, good_enough) are all visible in the global scope. Any other code could accidentally redefine square and break sqrt. For a small program this is manageable. For a large program with hundreds of helpers, it becomes chaos.\n\nSection 1.1.8 introduces two ideas that fix this: block structure and lexical scoping.',
      code: null,
    },

    // ── Block structure ───────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'block-structure-vocab',
      text: 'Block structure: define helper functions inside the function that needs them. They exist only inside that function\'s scope — invisible to everything outside. This is the same idea as local variables, but for functions.\n\nIn the block-structured version of sqrt, improve, good_enough, and sqrt_iter are declared inside sqrt. Nothing outside sqrt can see or disturb them.',
      code: null,
    },
    {
      type: 'narration',
      id: 'block-structure-start',
      text: 'Start building the block-structured sqrt. Move the helpers inside.',
      code: `function sqrt(x) {
  function square(n)      { return n * n; }
  function abs(n)         { return n < 0 ? -n : n; }
  function improve(guess) { return (guess + x / guess) / 2; }
  function good_enough(g) { return abs(square(g) - x) < 0.001; }
  function iter(guess)    { return good_enough(guess) ? guess : iter(improve(guess)); }
  return iter(1);
}`,
    },
    {
      type: 'narration',
      id: 'block-structure-notice',
      text: 'Notice something: improve and good_enough no longer take x as a parameter. In the earlier version both functions received x explicitly. Now they just use x directly — because they are defined inside sqrt, where x is already bound as a parameter.\n\nThis is lexical scoping at work: a function can use names from the scope where it was defined.',
      code: null,
    },

    // ── Lexical scoping and closures ──────────────────────────────────────────

    {
      type: 'narration',
      id: 'closure-vocab',
      text: 'New vocabulary:\n\n  Closure — a function that captures variables from the scope where it was defined. improve captures x from sqrt\'s parameter list.\n\n  Free variable — a variable used in a function that is not one of its own parameters. x is a free variable in improve and good_enough — it does not appear in their parameter lists but is used in their bodies.\n\n  Lexical scoping — the rule that free variables are looked up in the environment where the function was defined, not where it was called. JavaScript uses lexical scoping. This means improve always uses sqrt\'s x, regardless of where improve is called from.',
      code: null,
    },
    {
      type: 'narration',
      id: 'block-structure-run',
      text: 'Run the block-structured sqrt. The results are identical — the refactoring changed nothing about the behaviour, only where the helpers live.',
      code: `function sqrt(x) {
  function square(n)      { return n * n; }
  function abs(n)         { return n < 0 ? -n : n; }
  function improve(guess) { return (guess + x / guess) / 2; }
  function good_enough(g) { return abs(square(g) - x) < 0.001; }
  function iter(guess)    { return good_enough(guess) ? guess : iter(improve(guess)); }
  return iter(1);
}

console.log(sqrt(2));    // 1.4142...
console.log(sqrt(9));    // 3.0000...
console.log(sqrt(144));  // 12.0000...`,
    },
    {
      type: 'narration',
      id: 'blackbox-principle',
      text: 'From the outside, sqrt is a black box. Callers pass a number and get back its square root. They cannot see improve or good_enough. They do not know Newton\'s method is being used. They only need to know the contract: give a non-negative number, get its square root.\n\nThis principle — separating what a function does from how it does it — runs throughout all of SICP. It is what makes large software systems possible: each component can be understood, tested, and changed independently.',
      code: null,
    },
    {
      type: 'codelens',
      id: 'codelens-closure',
      text: 'Open CodeLens on sqrt(9). Step into improve. When improve uses x, watch where x comes from in the scope chain panel — it is found in sqrt\'s frame, not improve\'s own frame. improve has no x parameter, but it captured x lexically from the enclosing scope. This is the physical reality of a closure.',
      code: `function sqrt(x) {
  function improve(guess) {
    return (guess + x / guess) / 2;  // x is free — captured from sqrt
  }
  function good_enough(g) {
    return Math.abs(g * g - x) < 0.001;
  }
  function iter(guess) {
    return good_enough(guess) ? guess : iter(improve(guess));
  }
  return iter(1);
}

console.log(sqrt(9));`,
    },
    {
      type: 'challenge',
      id: 'challenge-cube-root',
      text: 'Newton\'s method generalises. For cube roots, the improvement step is (2 * guess + x / (guess * guess)) / 3. Write cube_root(x) using full block structure: define improve and good_enough inside it. good_enough should test Math.abs(guess*guess*guess - x) < 0.001. cube_root(27) ≈ 3, cube_root(8) ≈ 2.',
      expectedOutput: '3\n2',
      startCode: `// Write cube_root(x) with all helpers inside
// improve(guess): (2 * guess + x / (guess * guess)) / 3
// good_enough(g): Math.abs(g*g*g - x) < 0.001
// iter(guess): good_enough(guess) ? guess : iter(improve(guess))

function cube_root(x) {
  // your helpers here
  // return iter(1);
}

console.log(Math.round(cube_root(27)));  // 3
console.log(Math.round(cube_root(8)));   // 2
`,
      hint: 'function cube_root(x) {\n  function improve(g) { return (2*g + x/(g*g)) / 3; }\n  function ok(g)      { return Math.abs(g*g*g - x) < 0.001; }\n  function iter(g)    { return ok(g) ? g : iter(improve(g)); }\n  return iter(1);\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof cube_root === 'function' && Math.abs(cube_root(27) - 3) < 0.01 && Math.abs(cube_root(8) - 2) < 0.01`)
          return fn() === true
        } catch { return false }
      },
    },
    { type: 'checkpoint', id: 'cp-blackbox' },
  ],
}
