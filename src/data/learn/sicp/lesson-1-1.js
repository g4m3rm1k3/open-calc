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
      text: 'Welcome to Structure and Interpretation of Computer Programs in JavaScript. This companion walks through Chapter 1 with working code and exercises at every checkpoint. There are three stops today: Expressions, Naming, and Functions. Press Play and follow along — the code in the editor runs whenever you click Run.',
      code: null,
    },

    // ── 1.1.1  Expressions ──────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'expressions-1',
      text: 'The simplest thing a programming language can do is evaluate an expression. Type a number and JavaScript returns that number. Try clicking Run — 486 evaluates to 486.',
      code: '486',
    },
    {
      type: 'narration',
      id: 'expressions-2',
      text: 'We combine numbers using arithmetic operators. The plus sign goes between its operands — this is called infix notation. The result is computed immediately.',
      code: '137 + 349',
    },
    {
      type: 'narration',
      id: 'expressions-3',
      text: 'Expressions can be nested inside other expressions. JavaScript always evaluates the innermost parentheses first — 3 times 5 gives 15, then we add 10 minus 6 which is 4, giving 19. Run it and see.',
      code: '(3 * 5) + (10 - 6)',
    },
    {
      type: 'challenge',
      id: 'challenge-expressions',
      text: 'You just saw that arithmetic expressions evaluate to numbers, and you can combine them with + and *. Write a single expression that computes: 25 multiplied by 4, then add 12. The answer is 112.',
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

    // ── 1.1.2  Naming ───────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'naming-1',
      text: 'A programming language needs a way to name things. We use const to bind a name to a value. After declaring const size equals 2, the name size means 2 everywhere. Run this to see size times size return 4.',
      code: 'const size = 2;\nsize * size',
    },
    {
      type: 'narration',
      id: 'naming-2',
      text: 'Names can stand for any expression, including ones built from other names. Here pi and radius are separate constants, and circumference is defined in terms of both. The interpreter remembers all of these — SICP calls this the environment.',
      code: 'const pi = 3.14159;\nconst radius = 10;\nconst circumference = 2 * pi * radius;\ncircumference',
    },
    {
      type: 'challenge',
      id: 'challenge-naming',
      text: 'The area of a circle is pi times r squared. We already have pi defined as 3.14159 and r defined as 5. Using const, define a new name called area that holds the result of pi * r * r. The expected value is 78.53975.',
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

    // ── 1.1.4  Compound Functions ───────────────────────────────────────────────
    {
      type: 'narration',
      id: 'functions-1',
      text: 'Beyond naming values, we can name operations. A function declaration packages a computation so we can use it by name. Here square takes a number x and returns x times x. Call it with 21 and it returns 441.',
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
      text: 'You just saw square defined as x * x. Using the same pattern — function name(parameter) { return expression; } — write a function called cube that returns x * x * x. The cube of 3 is 27. Define it and call cube(3) to verify.',
      expectedOutput: '27',
      startCode: '// Define cube(x) using the same pattern as square\n// function name(param) { return ...; }\n\n',
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

    // ── 1.1.5  Substitution model (CodeLens handoff) ────────────────────────────
    {
      type: 'codelens',
      id: 'codelens-substitution',
      text: 'SICP introduces the substitution model to explain how function calls work. When sum_of_squares is called with 3 and 4, the interpreter replaces the parameters with the arguments and evaluates. Open CodeLens to watch this step by step — you will see each call expand like an algebra problem.',
      code: 'function square(x) {\n  return x * x;\n}\n\nfunction sum_of_squares(x, y) {\n  return square(x) + square(y);\n}\n\nconsole.log(sum_of_squares(3, 4))',
    },
  ],
}
