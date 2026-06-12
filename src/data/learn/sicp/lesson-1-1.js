export const lesson = {
  id: 'sicp-1-1',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '1.1 The Elements of Programming',
  checkpoints: [
    { id: 'cp-expressions',  label: 'Expressions' },
    { id: 'cp-naming',       label: 'Naming' },
    { id: 'cp-functions',    label: 'Functions' },
    { id: 'cp-substitution', label: 'Substitution Model' },
  ],
  segments: [

    // ══════════════════════════════════════════════════════════════════════════
    // Why SICP and what this course is
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'hook',
      text: 'Structure and Interpretation of Computer Programs was written at MIT in 1985. For over a decade it was the introductory CS course for MIT students. It has been called one of the greatest programming books ever written — not because it teaches the most frameworks, but because it teaches you to think about computation itself: what programs are, how they are structured, how abstraction manages complexity.\n\nMost programming courses teach you syntax — how to write for-loops and if-statements. SICP teaches you to reason about what a program does and why. By the end of Chapter 1 you will be able to look at any function and answer: how much does this cost? Is this process building up deferred work or just updating state? That is a different kind of understanding.\n\nThis course runs SICP\'s ideas in JavaScript. The book uses Scheme — a dialect of Lisp. Where Scheme writes (+ 1 2) we write 1 + 2. Where it writes (define (square x) (* x x)) we write function square(x) { return x * x; }. The syntax is different; the ideas are identical.',
      code: null,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // Three elements of every programming language
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'three-elements',
      text: 'Chapter 1 starts from nothing. Before any code, SICP makes an observation: every powerful programming language must provide three things:\n\n  1. Primitive expressions — the simplest elements, representing the simplest things: numbers, built-in operators.\n  2. Means of combination — the ability to build compound expressions from simpler ones.\n  3. Means of abstraction — the ability to name compound things and use them as units.\n\nThese three ingredients are not specific to JavaScript or Scheme. They appear in every language that has ever existed, because without all three you cannot build complexity. This lesson introduces all three in turn.',
      code: null,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 1.1.1 — Expressions
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'expressions-vocab',
      text: 'Vocabulary first — these are the exact words SICP uses, and you will see them throughout the book:\n\n  An expression is any piece of syntax the interpreter can reduce to a value.\n  To evaluate an expression means to carry out that reduction.\n  The result is the value of the expression.\n\nThe simplest expressions are primitive expressions — number literals. The number 486 is a primitive expression. Its value is the number 486. There is nothing to reduce; the literal IS the value.',
      code: null,
    },
    {
      type: 'narration',
      id: 'expressions-number',
      text: 'The most primitive thing possible. Run it.',
      code: `486`,
    },
    {
      type: 'narration',
      id: 'expressions-arithmetic',
      text: 'More interesting: combine two numbers with an operator. The symbol in the middle is the operator. The numbers on either side are the operands — also called arguments. Placing the operator between its operands is infix notation, inherited from algebra. The value of a combination is found by applying the operator to the values of its operands.',
      code: `137 + 349`,
    },
    {
      type: 'narration',
      id: 'expressions-more-ops',
      text: 'All four arithmetic operators work. Run each one and check that you understand why each result is what it is.',
      code: `console.log(25 * 4);    // multiplication
console.log(100 - 37);  // subtraction
console.log(10 / 4);    // division — JavaScript returns a decimal`,
    },

    // ── The evaluation rule ───────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'evaluation-rule-vocab',
      text: 'Combinations can nest. Parentheses force evaluation order: whatever is inside parentheses is evaluated first, and the result becomes an operand of the outer expression. JavaScript evaluates from the inside out.\n\nThis introduces the evaluation rule that SICP states in Section 1.1.3:\n\n  To evaluate a combination:\n  1. Evaluate each sub-expression.\n  2. Apply the operator to the values of the operands.\n\nThis rule is recursive — each sub-expression may itself be a combination, and the same rule applies. The recursion bottoms out at primitives (numbers, built-in operators) which evaluate to themselves.',
      code: null,
    },
    {
      type: 'narration',
      id: 'expressions-nested',
      text: 'Work through this before running it. 3 × 5 = 15. 10 − 6 = 4. 15 + 4 = 19. The parentheses create an evaluation order — innermost first, then combine.',
      code: `(3 * 5) + (10 - 6)`,
    },
    {
      type: 'narration',
      id: 'expressions-tree',
      text: 'The evaluation rule creates a tree structure. This expression has three levels: the outer +, then the two sub-combinations, then the four leaf numbers. The tree shape IS the expression. Predict the value before running.',
      code: `(2 + (4 * 6)) * ((3 + 5) + 7)`,
    },
    {
      type: 'challenge',
      id: 'challenge-expressions',
      text: 'Before running anything, trace this expression by hand using the tree rule: (3 * (2 + 4)) * (7 - (1 + 2)). Find the innermost sub-expressions first, then work outward. When you have a prediction, run the console.log to verify. Then write your own expression — using at least two levels of nesting — that evaluates to exactly 100.',
      expectedOutput: '72',
      startCode: `// Trace the tree:
// innermost: 2+4 = ?, 1+2 = ?
// next level: 3*? = ?, 7-? = ?
// outermost: ? * ? = ?

console.log((3 * (2 + 4)) * (7 - (1 + 2)));  // verify your prediction

// Write an expression that equals 100:
`,
      hint: '2+4=6, so 3×6=18.  1+2=3, so 7-3=4.  18×4=72.\nFor 100: try (5*4)*5  or  (10*10)  or  (25*4) — many right answers.',
      validate: ({ logs }) => logs.some(l => l.includes('72')),
    },
    { type: 'checkpoint', id: 'cp-expressions' },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 1.1.2 — Naming and the Environment
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'naming-vocab',
      text: 'Expressions give us computation, but programs need memory. The interpreter maintains an environment — a table that maps names to values. When you write const size = 2, you create a binding: the name size is now associated with the value 2 in the environment. Every time size appears in an expression, the interpreter looks it up in the table and substitutes 2 before evaluating.\n\nSICP calls this the simplest means of abstraction — naming lets you refer to a complex thing by a simple handle. Instead of re-writing the formula for the area of a circle every time you need it, you can name the result once and reuse the name.',
      code: null,
    },
    {
      type: 'narration',
      id: 'naming-first-binding',
      text: 'Create a binding with const. After this, the environment has an entry: size → 2. Using size in any expression is the same as writing 2 there directly.',
      code: `const size = 2;`,
    },
    {
      type: 'narration',
      id: 'naming-use-binding',
      text: 'Use the name. The interpreter looks up size in the environment, substitutes 2, and evaluates 2 * 2 = 4.',
      code: `const size = 2;

size * size`,
    },
    {
      type: 'narration',
      id: 'naming-multiple-bindings',
      text: 'Names can be defined in terms of other names. The environment grows with each declaration. When circumference is computed, the interpreter looks up pi and radius — each binding is there waiting. Names are evaluated by lookup; that is why the order of declarations matters.',
      code: `const pi     = 3.14159;
const radius = 10;

const circumference = 2 * pi * radius;`,
    },
    {
      type: 'narration',
      id: 'naming-log-all',
      text: 'Log the values to see the environment in action. Each console.log triggers a lookup.',
      code: `const pi     = 3.14159;
const radius = 10;

const circumference = 2 * pi * radius;

console.log(pi);
console.log(radius);
console.log(circumference);`,
    },
    {
      type: 'challenge',
      id: 'challenge-naming',
      text: 'A right triangle with legs 3 and 4 has hypotenuse √(3² + 4²) = √25 = 5 — the classic 3-4-5 Pythagorean triple. Define const a = 3 and const b = 4. Then define hypotenuse using Math.sqrt(a * a + b * b). After those three declarations, no numeric literals allowed — use only the names. Log hypotenuse.',
      expectedOutput: '5',
      startCode: `const a = 3;
const b = 4;
// define hypotenuse using Math.sqrt, a, and b only

console.log(hypotenuse);  // 5
`,
      hint: 'const hypotenuse = Math.sqrt(a * a + b * b);',
      validate: ({ logs, code }) => {
        if (logs.some(l => parseFloat(l) === 5)) return true
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof hypotenuse !== 'undefined' ? hypotenuse : undefined`)
          return fn() === 5
        } catch { return false }
      },
    },
    { type: 'checkpoint', id: 'cp-naming' },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 1.1.4 — Compound Functions
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'functions-vocab',
      text: 'Naming values is useful. Naming operations is more powerful. A compound function packages a computation under a name so it can be called repeatedly with different inputs.\n\nA function has three parts:\n  • Formal parameters — the named input slots (x in square(x))\n  • Body — the expression to evaluate when called (x * x)\n  • Return value — what the body produces\n\nWhen a function is called, each formal parameter is temporarily bound to the corresponding argument value, and the body is evaluated in that context. The caller receives the return value and knows nothing about how the body works — only what it produces.',
      code: null,
    },
    {
      type: 'narration',
      id: 'functions-keyword',
      text: 'The function keyword declares a compound function. This declaration alone does not compute anything — it just creates the function and binds it to the name square in the environment.',
      code: `function square(x) {
  return x * x;
}`,
    },
    {
      type: 'narration',
      id: 'functions-call',
      text: 'Now call it. square(21) binds x to 21, evaluates 21 * 21, and returns 441. Call it with different arguments — the function works for any number.',
      code: `function square(x) {
  return x * x;
}

console.log(square(21));   // 441
console.log(square(5));    // 25
console.log(square(0.5));  // 0.25`,
    },
    {
      type: 'narration',
      id: 'functions-compose',
      text: 'Functions compose: one function can call another. sum_of_squares calls square twice. Crucially, sum_of_squares does not need to know how square is implemented — only what it does (takes a number, returns its square). This is abstraction: the caller works at a higher level than the implementation.',
      code: `function square(x) {
  return x * x;
}

function sum_of_squares(x, y) {
  return square(x) + square(y);
}`,
    },
    {
      type: 'narration',
      id: 'functions-compose-call',
      text: 'Call sum_of_squares. It dispatches to square twice. 3² + 4² = 9 + 16 = 25.',
      code: `function square(x) {
  return x * x;
}

function sum_of_squares(x, y) {
  return square(x) + square(y);
}

console.log(sum_of_squares(3, 4));  // 25
console.log(sum_of_squares(5, 12)); // 169  (the 5-12-13 triple)`,
    },
    {
      type: 'narration',
      id: 'functions-three-layers',
      text: 'A third layer. f calls sum_of_squares which calls square. Each layer is a black box to the layer above it — f has no idea that square exists. This layering is how large programs become manageable: each piece is independently understandable.',
      code: `function square(x) {
  return x * x;
}

function sum_of_squares(x, y) {
  return square(x) + square(y);
}

function f(a) {
  return sum_of_squares(a + 1, a * 2);
}

console.log(f(5));   // sum_of_squares(6, 10) = 36 + 100 = 136
console.log(f(3));   // sum_of_squares(4, 6)  = 16 + 36  = 52`,
    },
    {
      type: 'codelens',
      id: 'codelens-sum-of-squares',
      text: 'Open CodeLens on sum_of_squares(3, 4). Watch the call stack grow: sum_of_squares → square(3) → returns 9 → square(4) → returns 16 → 9+16 = 25. Each function call pushes a new frame. Each return pops one. This is the substitution model in motion — three frames at most for a two-level composition.',
      code: `function square(x) {
  return x * x;
}

function sum_of_squares(x, y) {
  return square(x) + square(y);
}

console.log(sum_of_squares(3, 4));`,
    },
    {
      type: 'challenge',
      id: 'challenge-functions',
      text: 'Define cube(x) that returns x³. Then define sum_of_cubes(x, y) using cube — not x*x*x. Use cube as a building block, just like sum_of_squares used square. cube(3) = 27. sum_of_cubes(2, 3) = 8 + 27 = 35.',
      expectedOutput: '27\n35',
      startCode: `// Define cube(x)

// Define sum_of_cubes(x, y) — use cube, not x*x*x

console.log(cube(3));              // 27
console.log(sum_of_cubes(2, 3));   // 35
`,
      hint: 'function cube(x) { return x * x * x; }\nfunction sum_of_cubes(x, y) { return cube(x) + cube(y); }',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn cube(3) === 27 && sum_of_cubes(2, 3) === 35`)
          return fn() === true
        } catch { return false }
      },
    },
    { type: 'checkpoint', id: 'cp-functions' },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 1.1.5 — The Substitution Model
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'substitution-vocab',
      text: 'How does a function call actually produce a value? SICP Section 1.1.5 introduces the substitution model as a mental tool for reasoning about this. The rule:\n\n  To evaluate a function application: substitute each argument for its parameter throughout the body, then evaluate the resulting expression.\n\nThis is a process you perform with pencil and paper, not in the computer. It gives the correct answer for any pure function (one with no side effects), and it is the right mental model to start with.',
      code: null,
    },
    {
      type: 'narration',
      id: 'substitution-trace-1',
      text: 'Walk through square(5) using substitution:\n\n  square(5)\n  → 5 * 5           [substitute x = 5 into body x * x]\n  → 25               [evaluate]\n\nOne substitution, one evaluation. Simple.',
      code: null,
    },
    {
      type: 'narration',
      id: 'substitution-trace-2',
      text: 'Walk through sum_of_squares(3, 4):\n\n  sum_of_squares(3, 4)\n  → square(3) + square(4)     [substitute x=3, y=4 into body]\n  → (3 * 3) + (4 * 4)         [expand each square call]\n  → 9 + 16                    [evaluate the multiplications]\n  → 25                        [evaluate the addition]\n\nEach → is one substitution step. The key observation: arguments are evaluated BEFORE substituting. 3 is evaluated to 3, 4 is evaluated to 4, then they are substituted. JavaScript uses this applicative-order evaluation — evaluate arguments first, then substitute.',
      code: null,
    },
    {
      type: 'narration',
      id: 'substitution-applicative',
      text: 'Here is what applicative order means in practice. When we call f(2 + 1), JavaScript first evaluates 2 + 1 to get 3, then substitutes 3. It does NOT substitute the unevaluated expression (2 + 1) into the body. Run this to see that f receives the already-evaluated value.',
      code: `function show_argument(x) {
  console.log('x is:', x);
  return x * x;
}

// 2+1 is evaluated to 3 BEFORE show_argument sees it
console.log(show_argument(2 + 1));`,
    },
    {
      type: 'narration',
      id: 'substitution-insight',
      text: 'The substitution model is not how JavaScript actually executes code internally — the real mechanism uses environments (we will meet that in Chapter 3). But for pure functions, the substitution model gives the correct answer for every call. Use it whenever you need to trace what a function returns.',
      code: null,
    },
    {
      type: 'narration',
      id: 'substitution-practice',
      text: 'Trace f(5) using substitution. Write each → step before running. f calls sum_of_squares with two arithmetic expressions as arguments — remember applicative order evaluates those arguments first.',
      code: `function square(n)            { return n * n; }
function sum_of_squares(a, b) { return square(a) + square(b); }
function f(x)                 { return sum_of_squares(x + 1, x * 2); }

// Trace f(5) by hand:
//   f(5)
//   → sum_of_squares(5+1, 5*2)     [substitute x=5]
//   → sum_of_squares(6, 10)        [evaluate arguments]
//   → ...                          (continue the trace)

console.log(f(5));`,
    },
    {
      type: 'challenge',
      id: 'challenge-substitution',
      text: 'Complete the substitution trace for f(5) in the comments, then verify your prediction. How many total arithmetic operations (multiplications and additions) are performed? Count them in your trace — then verify with the output.',
      expectedOutput: '136',
      startCode: `function square(n)            { return n * n; }
function sum_of_squares(a, b) { return square(a) + square(b); }
function f(x)                 { return sum_of_squares(x + 1, x * 2); }

// Complete the trace:
// f(5)
// → sum_of_squares(5+1, 5*2)
// → sum_of_squares(6, 10)
// → square(6) + square(10)
// → (6*6) + (10*10)
// → 36 + 100
// → ???

// Operations: 5+1, 5*2, 6*6, 10*10, 36+100 = 5 arithmetic ops

console.log(f(5));   // verify your prediction
`,
      hint: 'f(5) = sum_of_squares(6, 10) = square(6) + square(10) = 36 + 100 = 136.',
      validate: ({ logs }) => logs.some(l => l.includes('136')),
    },
    { type: 'checkpoint', id: 'cp-substitution' },
  ],
}
