export const lesson = {
  id: 'sicp-1-1',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '1.1 The Elements of Programming',
  checkpoints: [
    { id: 'cp-expressions', label: 'Expressions' },
    { id: 'cp-naming',      label: 'Naming' },
    { id: 'cp-functions',   label: 'Functions' },
  ],
  segments: [

    // ── Introduction ────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Welcome to Structure and Interpretation of Computer Programs in JavaScript. Chapter 1 builds the vocabulary of computation from scratch. Every powerful program is assembled from three things: primitive expressions that evaluate to values, means of combination that build complex expressions from simpler ones, and means of abstraction that give names to compound things. By the end of this lesson you will have all three.',
      code: null,
    },

    // ── Terminology: Expressions ─────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'expressions-vocab',
      text: 'Fix the vocabulary first. An expression is any piece of syntax the interpreter can reduce to a value. To evaluate an expression means to carry out that reduction. The simplest expressions are primitive expressions — a literal number like 486 is a primitive expression that evaluates to the number 486. Every more complex expression is built from primitives using rules of combination.',
      code: null,
    },

    // ── 1.1.1  Expressions ──────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'expressions-1',
      text: 'The simplest thing a programming language can do is evaluate an expression. Type a number and JavaScript returns that number. Try clicking Run — 486 evaluates to 486.',
      code: '486',
    },

    // ── Terminology: Combinations ─────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'combinations-vocab',
      text: 'When two or more expressions are combined with an arithmetic symbol, the result is a combination. The symbol that specifies the operation is the operator. The expressions on either side are the operands — also called arguments. Writing the operator between its operands is infix notation, the style inherited from mathematics. The value produced by a combination is found by applying the operator to the values of its operands.',
      code: null,
    },
    {
      type: 'narration',
      id: 'expressions-2',
      text: 'We combine numbers using arithmetic operators. The plus sign goes between its operands — this is infix notation. The result is computed immediately.',
      code: '137 + 349',
    },

    // ── Terminology: Evaluation rule ─────────────────────────────────────────────
    {
      type: 'narration',
      id: 'evaluation-rule',
      text: 'How does JavaScript evaluate a nested expression? It works from the inside out. To evaluate a combination, first evaluate each subexpression, then apply the outermost operator to the results. For (3 * 5) + (10 - 6): evaluate 3 * 5 to get 15, evaluate 10 - 6 to get 4, then apply + to 15 and 4. This rule applies recursively — any subexpression can itself be a combination, and it is evaluated the same way.',
      code: null,
    },
    {
      type: 'narration',
      id: 'expressions-3',
      text: 'Expressions can be nested inside other expressions. JavaScript always evaluates the innermost parentheses first — 3 times 5 gives 15, then we add 10 minus 6 which is 4, giving 19. Run it and verify.',
      code: '(3 * 5) + (10 - 6)',
    },
    {
      type: 'challenge',
      id: 'challenge-expressions',
      text: 'You just saw that arithmetic expressions evaluate to numbers and that you can nest them. Write a single expression that computes 25 multiplied by 4, then adds 12. The answer is 112.',
      expectedOutput: '112',
      startCode: '// Write your expression here\n',
      hint: '25 * 4 + 12',
      validate: ({ logs, result }) =>
        logs.some(l => l.includes('112')) || result === 112 || String(result) === '112',
    },
    {
      type: 'checkpoint',
      id: 'cp-expressions',
    },

    // ── Terminology: Environment ─────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'environment-vocab',
      text: 'Programs need memory — a way to remember values across expressions. The interpreter maintains an environment: a table of associations between names and values. When you write const size = 2, you create a binding — the name size is associated with the value 2 in the environment. The name is also called an identifier. From then on, any expression that mentions size can look it up in the environment and retrieve 2. SICP calls this a means of abstraction: naming is what lets us build complexity from simplicity.',
      code: null,
    },

    // ── 1.1.2  Naming ───────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'naming-1',
      text: 'A programming language needs a way to name things. We use const to bind a name to a value. After declaring const size = 2, the name size means 2 everywhere. Run this to see size * size return 4.',
      code: 'const size = 2;\nsize * size',
    },
    {
      type: 'narration',
      id: 'naming-2',
      text: 'Names can stand for any expression, including ones built from other names. Here pi and radius are separate constants, and circumference is defined in terms of both. The interpreter remembers all of these in the environment — each name points to its value, and those values can themselves involve other names.',
      code: 'const pi = 3.14159;\nconst radius = 10;\nconst circumference = 2 * pi * radius;\ncircumference',
    },
    {
      type: 'challenge',
      id: 'challenge-naming',
      text: 'The area of a circle is pi * r * r. We have pi defined as 3.14159 and r defined as 5. Using const, define a new name called area that holds the result. The expected value is 78.53975.',
      expectedOutput: '78.53975',
      startCode: 'const pi = 3.14159;\nconst r = 5;\n// Define area here using const\n',
      hint: 'const area = pi * r * r;',
      validate: ({ logs, result, code }) => {
        if (logs.length && Math.abs(parseFloat(logs[0]) - 78.53975) < 0.01) return true
        if (typeof result === 'number' && Math.abs(result - 78.53975) < 0.01) return true
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn (typeof area !== 'undefined' ? area : undefined)`)
          const val = fn()
          return typeof val === 'number' && Math.abs(val - 78.53975) < 0.01
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-naming',
    },

    // ── Terminology: Compound Procedures ─────────────────────────────────────────
    {
      type: 'narration',
      id: 'procedure-vocab',
      text: 'Naming values is powerful, but naming operations is more powerful. A compound procedure is a function you define yourself — it packages a computation under a name. It has three parts: the formal parameters, which are the named slots for input values (like x in square(x)); the body, which is the expression to compute (like x * x); and the return value, which is whatever the body produces. When you call a compound procedure, each formal parameter is temporarily bound to the corresponding argument in a local environment, and the body is evaluated there.',
      code: null,
    },

    // ── 1.1.4  Compound Functions ───────────────────────────────────────────────
    {
      type: 'narration',
      id: 'functions-1',
      text: 'Beyond naming values, we can name operations. A function declaration packages a computation so we can use it by name. Here square takes a number x and returns x * x. Call it with 21 and it returns 441.',
      code: 'function square(x) {\n  return x * x;\n}\n\nsquare(21)',
    },
    {
      type: 'narration',
      id: 'functions-2',
      text: 'Functions can be composed — one function can call another. sum_of_squares calls square twice and adds the results. Notice that sum_of_squares does not need to know how square works internally. That separation — using something without knowing how it is built — is the essence of abstraction.',
      code: 'function square(x) {\n  return x * x;\n}\n\nfunction sum_of_squares(x, y) {\n  return square(x) + square(y);\n}\n\nsum_of_squares(3, 4)',
    },
    {
      type: 'challenge',
      id: 'challenge-functions',
      text: 'You just saw square defined as x * x. Using the same pattern, write a function called cube that returns x * x * x. The cube of 3 is 27. Define it and call cube(3) to verify.',
      expectedOutput: '27',
      startCode: '// Define cube(x) — function name(param) { return ...; }\n\n',
      hint: 'function cube(x) { return x * x * x; }',
      validate: ({ logs, result, code }) => {
        if (logs.some(l => l.includes('27')) || result === 27) return true
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn (typeof cube === 'function' ? cube(3) : undefined)`)
          return fn() === 27
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-functions',
    },

    // ── 1.1.5  Substitution model ────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'substitution-model',
      text: 'SICP introduces the substitution model to explain how function calls work. To evaluate a combination whose operator is a compound procedure, substitute each argument for the corresponding formal parameter throughout the body, then evaluate the resulting expression. For sum_of_squares(3, 4):\n\nsum_of_squares(3, 4)\n  → square(3) + square(4)\n  → (3 * 3) + (4 * 4)\n  → 9 + 16\n  → 25\n\nEach arrow substitutes a name for its value until only primitive operations remain. This model does not describe exactly how modern JavaScript engines work — they use environments — but it correctly predicts the return value of every call, and it is the right mental model to start with.',
      code: null,
    },
    {
      type: 'codelens',
      id: 'codelens-substitution',
      text: 'Now open CodeLens on sum_of_squares(3, 4) and watch the substitution unfold step by step. You will see each call expand exactly as the trace above showed — square is evaluated twice, once with 3 and once with 4, then the two products are added. The call stack shows each active frame waiting for its result.',
      code: 'function square(x) {\n  return x * x;\n}\n\nfunction sum_of_squares(x, y) {\n  return square(x) + square(y);\n}\n\nconsole.log(sum_of_squares(3, 4))',
    },
  ],
}
