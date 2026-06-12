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

    // ── Why SICP ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'hook',
      text: 'Structure and Interpretation of Computer Programs was written at MIT in 1985. For over a decade it was the entry-point course for CS at MIT. It has been called one of the greatest programming books ever written — not because it teaches the most languages or the most frameworks, but because it teaches you to think about computation itself: what it means to compute, how programs are structured, how to manage complexity through abstraction.\n\nThis course runs SICP\'s ideas in JavaScript. The book uses Scheme — a dialect of Lisp with a radically minimal syntax. Where Scheme writes (+ 1 2), we write 1 + 2. Where it writes (define (square x) (* x x)), we write function square(x) { return x * x; }. The syntax differs; the ideas are identical.\n\nIf the book is hard to code along with, these lessons are the bridge. Every example from the book appears here as runnable JavaScript. Every exercise is scaffolded. The goal is for you to read the book and run the code side by side.',
      code: null,
    },

    // ── Three elements ────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Chapter 1 builds the vocabulary of computation from nothing. SICP says every powerful programming language provides three kinds of things: primitive expressions (the simplest elements, which represent the simplest things — numbers, built-in operators); means of combination (the ability to build compound expressions from simpler ones); means of abstraction (the ability to give a name to a compound thing so it can be used as a unit). By the end of this lesson you will have all three in your hands.',
      code: null,
    },

    // ── 1.1.1  Expressions ────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'expressions-vocab',
      text: 'Vocabulary first. An expression is any piece of syntax the interpreter can reduce to a value. To evaluate an expression is to carry out that reduction. The result is the value. The simplest expressions are primitive expressions — a number literal like 486 is a primitive expression that evaluates to the number 486. There is no work to do; the literal IS the value. Everything more complex is built from primitives using combination.',
      code: null,
    },
    {
      type: 'narration',
      id: 'expressions-number',
      text: 'The most primitive thing: a number literal. Click Run. The interpreter reads 486 and returns 486. No computation — just recognition.',
      code: '486',
    },
    {
      type: 'narration',
      id: 'combinations-vocab',
      text: 'When two or more expressions are combined with an arithmetic symbol, the result is a combination. The symbol naming the operation is the operator. The expressions on either side are the operands — also called arguments. Placing the operator between its operands is infix notation, the style inherited from algebra. The value of a combination is found by applying the operator to the values of its operands.',
      code: null,
    },
    {
      type: 'narration',
      id: 'expressions-combine',
      text: 'A combination: two literal operands and the + operator. The interpreter evaluates each operand (trivially — they are literals), then applies the operator.',
      code: '137 + 349',
    },
    {
      type: 'narration',
      id: 'expressions-nest',
      text: 'Combinations can nest. Any sub-expression can itself be a combination. JavaScript evaluates the innermost parentheses first: 3 × 5 gives 15, 10 − 6 gives 4, then 15 + 4 gives 19.',
      code: '(3 * 5) + (10 - 6)',
    },

    // ── 1.1.3  Evaluating Combinations — the tree ────────────────────────────

    {
      type: 'narration',
      id: 'evaluation-tree-vocab',
      text: 'SICP section 1.1.3 states the evaluation rule precisely:\n\n  To evaluate a combination: (1) evaluate each sub-expression, then (2) apply the operator to the results of evaluating the operands.\n\nThis rule is recursive — each sub-expression may itself be a combination, and the same rule applies to it. The recursion bottoms out at primitives: number literals and built-in operators need no further evaluation — they are the base cases.\n\nThe recursive rule creates a tree structure. Think of (2 + (4 × 6)) × ((3 + 5) + 7). To evaluate the outermost ×, you must first evaluate its two operands. The left operand is 2 + (4 × 6) — another combination. To evaluate that, you evaluate 4 × 6 first. The shape of the computation is a tree. The tree IS the expression.',
      code: null,
    },
    {
      type: 'narration',
      id: 'evaluation-tree-code',
      text: 'Work through this expression before running: what is 4 × 6? What is 2 + that? What is 3 + 5? What is that + 7? What is the product of your two results? Then run to verify.',
      code: '(2 + (4 * 6)) * ((3 + 5) + 7)',
    },
    {
      type: 'challenge',
      id: 'challenge-expressions',
      text: 'Before running anything, trace this expression using the tree rule: (3 * (2 + 4)) * (7 - (1 + 2)). Innermost first — what are 2+4 and 1+2? Then the next level. Then the outermost multiply. When you have a prediction, run the console.log to verify. Then write your own expression, using at least two levels of nesting, that evaluates to 100.',
      expectedOutput: '72',
      startCode: '// Step through the tree:\n// 2 + 4 = ?\n// 3 * ? = ?\n// 1 + 2 = ?\n// 7 - ? = ?\n// ? * ? = your prediction\n\nconsole.log((3 * (2 + 4)) * (7 - (1 + 2))); // verify\n\n// Write an expression that equals 100:\n',
      hint: '2+4=6, so 3*6=18. 1+2=3, so 7-3=4. 18*4=72.\nFor 100: try (5*4)*5 or (10*10) or (25*4) — many right answers.',
      validate: ({ logs }) => logs.some(l => l.includes('72')),
    },
    {
      type: 'checkpoint',
      id: 'cp-expressions',
    },

    // ── 1.1.2  Naming and the Environment ────────────────────────────────────

    {
      type: 'narration',
      id: 'environment-vocab',
      text: 'Programs need memory. The interpreter maintains an environment — a table of associations between names and their values. When you write const size = 2, you create a binding: the name size is associated with the value 2 in the environment. SICP calls this a means of abstraction — naming is how we refer to complex things by simple handles. Once bound, any expression that uses size looks up the environment, finds 2, and substitutes it before evaluating.',
      code: null,
    },
    {
      type: 'narration',
      id: 'naming-1',
      text: 'const binds a name to a value. After const size = 2, the environment has a new entry. Using size in an expression causes a lookup — the interpreter replaces size with 2 before evaluating. Here: size * size → 2 * 2 → 4.',
      code: 'const size = 2;\nsize * size',
    },
    {
      type: 'narration',
      id: 'naming-2',
      text: 'Names can be defined in terms of other names. Each const declaration adds one binding to the environment. When circumference is evaluated, the interpreter looks up pi (3.14159) and radius (10), substitutes both into the formula, and evaluates the resulting arithmetic.',
      code: 'const pi = 3.14159;\nconst radius = 10;\nconst circumference = 2 * pi * radius;\ncircumference',
    },
    {
      type: 'challenge',
      id: 'challenge-naming',
      text: 'A right triangle with legs a = 3 and b = 4 has hypotenuse √(a² + b²) = √(9 + 16) = √25 = 5 — the classic 3-4-5 triple. Define names a, b, and hypotenuse. Use Math.sqrt for the square root. After the three const declarations, no numeric literals allowed — only the names.',
      expectedOutput: '5',
      startCode: 'const a = 3;\nconst b = 4;\n// Define hypotenuse using only a and b\n\nconsole.log(hypotenuse); // should print 5\n',
      hint: 'const hypotenuse = Math.sqrt(a * a + b * b);',
      validate: ({ logs, result, code }) => {
        if (logs.some(l => parseFloat(l) === 5)) return true
        if (result === 5) return true
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof hypotenuse !== 'undefined' ? hypotenuse : undefined`)
          return fn() === 5
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-naming',
    },

    // ── 1.1.4  Compound Functions ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'procedure-vocab',
      text: 'Naming values is useful. Naming operations is more powerful. A compound function packages a computation under a name. It has three parts: the formal parameters — the named input slots (x in square(x)); the body — the expression to evaluate (x * x); and the return value — what the body produces. When you call a compound function, each formal parameter is bound to the corresponding argument in a fresh local scope, and the body is evaluated there. The caller gets back the result.',
      code: null,
    },
    {
      type: 'narration',
      id: 'functions-1',
      text: 'square(x) returns x * x. Call it with 21 — the parameter x is bound to 21, the body 21 * 21 evaluates to 441. The function is reusable: the same definition works for any number.',
      code: 'function square(x) {\n  return x * x;\n}\n\nsquare(21)',
    },
    {
      type: 'narration',
      id: 'functions-2',
      text: 'Functions compose. sum_of_squares calls square twice and adds the results. Notice: sum_of_squares does not need to know how square works internally — only what it does (given x, return x²). This separation is abstraction. The caller operates at a higher level than the implementation.',
      code: 'function square(x) {\n  return x * x;\n}\n\nfunction sum_of_squares(x, y) {\n  return square(x) + square(y);\n}\n\nsum_of_squares(3, 4)',
    },
    {
      type: 'narration',
      id: 'functions-3',
      text: 'Layers compose. f calls sum_of_squares which calls square. Each layer is a black box to the layer above it — f does not care how sum_of_squares works; sum_of_squares does not care how square works. Abstraction lets each layer reason only about the layer just below.',
      code: 'function square(x) {\n  return x * x;\n}\nfunction sum_of_squares(x, y) {\n  return square(x) + square(y);\n}\nfunction f(a) {\n  return sum_of_squares(a + 1, a * 2);\n}\n\nf(5)',
    },
    {
      type: 'challenge',
      id: 'challenge-functions',
      text: 'Define cube(x) returning x³. Then define sum_of_cubes(x, y) using cube — not x*x*x — as the building block. cube(3) should return 27. sum_of_cubes(2, 3) should return 8 + 27 = 35.',
      expectedOutput: '27\n35',
      startCode: '// Define cube(x): returns x cubed\n\n// Define sum_of_cubes(x, y): use cube, not x*x*x\n\nconsole.log(cube(3));             // 27\nconsole.log(sum_of_cubes(2, 3)); // 35\n',
      hint: 'function cube(x) { return x * x * x; }\nfunction sum_of_cubes(x, y) { return cube(x) + cube(y); }',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn cube(3) === 27 && sum_of_cubes(2, 3) === 35`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-functions',
    },

    // ── 1.1.5  The Substitution Model ─────────────────────────────────────────

    {
      type: 'narration',
      id: 'substitution-vocab',
      text: 'SICP 1.1.5 introduces the substitution model: a way to evaluate function calls by hand. The rule is: to evaluate a function application, substitute each argument for its parameter throughout the body, then evaluate the resulting expression.\n\nWalk through sum_of_squares(3, 4) step by step:\n\n  sum_of_squares(3, 4)\n  → square(3) + square(4)          [substitute x=3, y=4 into body]\n  → (3 * 3) + (4 * 4)             [expand each square call]\n  → 9 + 16                        [evaluate the multiplications]\n  → 25                            [evaluate the addition]\n\nEach → is one substitution step. JavaScript uses applicative-order evaluation: arguments are fully evaluated before being substituted. So f(2+1) first evaluates 2+1 to 3, then substitutes 3.',
      code: null,
    },
    {
      type: 'narration',
      id: 'substitution-insight',
      text: 'The substitution model is not how JavaScript actually executes code — the real mechanism (the environment model) is introduced in Chapter 3. But it gives the correct answer for pure functions, and it is the right mental model to start with. Whenever you are unsure what a function call returns, trace it by hand with substitution.',
      code: null,
    },
    {
      type: 'codelens',
      id: 'codelens-substitution',
      text: 'Open CodeLens on sum_of_squares(3, 4). Watch the call stack. When sum_of_squares calls square(3), a new frame is pushed. square returns 9, the frame is popped. square(4) pushes another frame, returns 16, pops. sum_of_squares adds the results. Each frame push and pop corresponds to one → in the substitution trace. The stack growing and shrinking IS the substitution model in motion.',
      code: 'function square(x) {\n  return x * x;\n}\n\nfunction sum_of_squares(x, y) {\n  return square(x) + square(y);\n}\n\nconsole.log(sum_of_squares(3, 4))',
    },
    {
      type: 'challenge',
      id: 'challenge-substitution',
      text: 'Without running any code, use the substitution model to trace f(5). Write each step as a comment. How many total arithmetic operations (multiplications and additions) are performed? Then verify by running.',
      expectedOutput: '136',
      startCode: 'function square(n)            { return n * n; }\nfunction sum_of_squares(a, b) { return square(a) + square(b); }\nfunction f(x)                 { return sum_of_squares(x + 1, x * 2); }\n\n// Trace f(5) step by step:\n// f(5)\n// → sum_of_squares(5+1, 5*2)     [substitute x=5 into body of f]\n// → sum_of_squares(6, 10)        [evaluate arguments: 5+1=6, 5*2=10]\n// → ...                          [continue — what does sum_of_squares do?]\n// → ...                          [expand the square calls]\n// → ...                          [evaluate to a number]\n\nconsole.log(f(5)); // verify your prediction\n',
      hint: 'f(5) → sum_of_squares(6, 10) → square(6) + square(10) → (6*6) + (10*10) → 36 + 100 → 136.\nArithmetic operations: 5+1, 5*2, 6*6, 10*10, 36+100 = 5 operations total.',
      validate: ({ logs, result }) =>
        logs.some(l => l.includes('136')) || result === 136,
    },
    {
      type: 'checkpoint',
      id: 'cp-substitution',
    },
  ],
}
