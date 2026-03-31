// Chapter 0.2 — Lesson 2: Expressions
//
// DEPENDENCY: Lesson 1 (values: int, float, str, bool).
//
// TEACHES:
//   Operators: +, -, *, /, //, %, **
//   Order of operations (precedence)
//   Parentheses override precedence
//   Expressions nest — inner evaluates first
//   The evaluation model: expression → value
//
// DOES NOT TEACH (reserved for later):
//   Variables (Lesson 5)
//   print() (Lesson 7, after functions)
//   Boolean expressions / comparisons (Lesson 10)
//   String operators beyond + (later)

export default {
  id: 'py-0-2-expressions',
  slug: 'expressions',
  chapter: 0.2,
  order: 2,
  title: 'Expressions',
  subtitle: 'How Python reduces code to values',
  tags: ['expressions', 'operators', 'arithmetic', 'precedence', 'evaluation'],

  hook: {
    question: 'How does Python turn `2 + 3 * 4` into a value — and why does the answer depend on order?',
    realWorldContext:
      'Every computation in Python — from pricing an item to training a neural network — is a chain of expressions. ' +
      'An expression is any piece of code that produces a value. Understanding how Python evaluates them, ' +
      'and in what order, is the foundation of writing correct programs. ' +
      'This lesson gives you the full arithmetic toolkit and the rules for how expressions combine.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'You already know that `42` is an expression — a lone value evaluates to itself. Now we go one step further: expressions can **combine** values using **operators** to produce new values.',

      'An operator is a symbol that describes an operation. `+` means add, `*` means multiply. The values on either side of an operator are called **operands**. The whole thing — operands plus operator — is an expression that evaluates to a single value.',

      'The key insight is that evaluation is **mechanical and deterministic**: given the same expression, Python always produces the same value, following fixed rules of precedence.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Expressions all the way down',
        body: '`2 + 3 * 4` is an expression. `3 * 4` is also an expression — it is a sub-expression nested inside the larger one. Python evaluates the innermost expressions first, then works outward. This is the evaluation model.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Lesson 0.2.2 — Expressions',
        mathBridge: 'Run each cell. Read the prose, observe the output, then move on.',
        caption: 'All cells are pre-written. Your only job is to run them and observe.',
        props: {
          initialCells: [

            // ── CELL 1: Basic arithmetic ─────────────────────────────────────
            {
              id: 1,
              cellTitle: 'The arithmetic operators',
              prose: 'Python has seven arithmetic operators. You already know `+` and `-`. Here are all seven:\n\n`+` add · `-` subtract · `*` multiply · `/` divide (float result)\n`//` floor divide (integer result) · `%` remainder · `**` power\n\nRun this cell to see addition.',
              code: '10 + 3',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 2: Subtraction and multiplication ───────────────────────
            {
              id: 2,
              cellTitle: 'Subtraction and multiplication',
              prose: 'Subtraction and multiplication behave exactly as you expect from mathematics.\n\nOnly the last expression is shown — so this cell displays the result of `7 * 8`.',
              code: [
                '100 - 37    # 63',
                '7 * 8       # shown — last expression',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 3: Division always returns float ────────────────────────
            {
              id: 3,
              cellTitle: '/ always returns a float',
              prose: 'In Python 3, the `/` operator always returns a float — even when the result divides evenly.\n\n`10 / 2` returns `5.0`, not `5`. This is a deliberate design choice to avoid silent integer truncation.',
              instructions: 'Predict the output before running. Does it match what you expected?',
              code: '10 / 2',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 4: Floor division and remainder ─────────────────────────
            {
              id: 4,
              cellTitle: 'Floor division // and remainder %',
              prose: '`//` (floor division) divides and then rounds **down** to the nearest integer — discarding any decimal.\n\n`%` (modulo) gives the **remainder** after floor division. The two operators are partners:\n\n`a == (a // b) * b + (a % b)` is always true.',
              instructions: 'Run this. Then think: what would `17 // 5` and `17 % 5` give?',
              code: [
                '17 // 5     # how many whole 5s fit in 17?',
                '17 % 5      # shown — what is left over?',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 5: Exponentiation ───────────────────────────────────────
            {
              id: 5,
              cellTitle: '** is exponentiation (power)',
              prose: '`**` raises the left operand to the power of the right operand. `2 ** 10` means 2 raised to the power 10.\n\nPython integers have unlimited precision — `2 ** 100` produces the exact value, not an approximation.',
              code: '2 ** 10',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 6: Order of operations ──────────────────────────────────
            {
              id: 6,
              cellTitle: 'Order of operations',
              prose: 'When an expression has multiple operators, Python applies them in a fixed order called **precedence** — the same rules as in mathematics:\n\n1. `**` (highest)\n2. `*  /  //  %`\n3. `+  -` (lowest)\n\nOperators at the same level are evaluated left to right.',
              instructions: 'Before running: what do you expect? Is it (2 + 3) × 4 = 20, or 2 + (3 × 4) = 14?',
              code: '2 + 3 * 4',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 7: Parentheses override precedence ──────────────────────
            {
              id: 7,
              cellTitle: 'Parentheses override precedence',
              prose: 'Parentheses force evaluation order. Anything inside `()` is evaluated first, regardless of the surrounding operators.\n\nThis makes expressions unambiguous and lets you say exactly what you mean.',
              instructions: 'Compare this to Cell 6. Same numbers, different parentheses — different answer.',
              code: '(2 + 3) * 4',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 8: Nested expressions ───────────────────────────────────
            {
              id: 8,
              cellTitle: 'Expressions nest — inside out',
              prose: 'Complex expressions are just smaller expressions combined. Python always evaluates the **innermost** sub-expression first, then works outward.\n\nTrace this one step by step:\n1. `2 ** 3` → 8\n2. `4 * 8` → 32\n3. `100 - 32` → 68',
              instructions: 'Verify by running. Does the result match the trace above?',
              code: '100 - 4 * 2 ** 3',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 9: Negative numbers ─────────────────────────────────────
            {
              id: 9,
              cellTitle: 'Negative numbers and unary minus',
              prose: 'The `-` symbol has two roles:\n\n- **Binary** (between two values): `10 - 3` is subtraction\n- **Unary** (before one value): `-5` is a negative number\n\nBoth work as you expect.',
              code: '-5 * -3',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGE 1: Trace the evaluation ────────────────────────────
            {
              id: 10,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Trace the Evaluation',
              difficulty: 'easy',
              prompt:
                'For each expression, trace the evaluation **by hand** first (write your reasoning as a comment), then run to verify.\n\n' +
                'Try each one:\n\n' +
                '• `3 + 4 * 2`\n' +
                '• `(3 + 4) * 2`\n' +
                '• `2 ** 3 + 1`\n' +
                '• `10 % 3`\n' +
                '• `10 // 3 * 3 + 10 % 3`  ← can you predict this one?\n\n' +
                'The last one is a puzzle. Think carefully.',
              code: '# Write your prediction as a comment, then run\n3 + 4 * 2',
              output: '', status: 'idle', figureJson: null,
              testCode: 'True  # Self-check: did your trace match the output?',
              hint: 'Multiplication before addition, so 4 * 2 = 8, then 3 + 8 = 11. The last expression is the "reconstruction theorem": (a // b) * b + a % b always equals a.',
            },

            // ── CHALLENGE 2: Fix the expression ──────────────────────────────
            {
              id: 11,
              challengeType: 'fill',
              challengeNumber: 2,
              challengeTitle: 'Fix the Expression',
              difficulty: 'easy',
              prompt:
                'Each expression below produces the **wrong** answer due to missing parentheses. ' +
                'Add parentheses to make it produce the **target value**.\n\n' +
                '1. `2 + 3 * 4` → should equal **20** (not 14)\n' +
                '2. `10 - 2 * 3` → should equal **24** (not 4)\n' +
                '3. `2 ** 2 + 1` → should equal **8** (not 5)\n\n' +
                'Try them one at a time by replacing the expression in the cell.',
              starterBlock:
                '# Fix this expression so it produces 20\n(2 + 3) * ___',
              code: '# Fix this expression so it produces 20\n(2 + 3) * ___',
              output: '', status: 'idle', figureJson: null,
              testCode: [
                'assert (2 + 3) * 4 == 20, "expression 1 should equal 20"',
                'assert (10 - 2) * 3 == 24, "expression 2 should equal 24"',
                'assert 2 ** (2 + 1) == 8, "expression 3 should equal 8"',
                'True',
              ].join('\n'),
              hint: 'Parentheses force evaluation of what is inside them first. Wrap the sub-expression that should happen before the multiplication.',
            },

            // ── CHALLENGE 3: Build an expression ─────────────────────────────
            {
              id: 12,
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Build the Expression',
              difficulty: 'medium',
              prompt:
                'Write a single Python expression (no variables, no print) that computes:\n\n' +
                '**The area of a circle with radius 5.**\n\n' +
                'Area = π × r²\n\n' +
                'Use `3.14159` as an approximation for π. Your result should be approximately `78.53975`.',
              code: '# Write a single expression: 3.14159 * ...',
              output: '', status: 'idle', figureJson: null,
              testCode: [
                'import math',
                'result = 3.14159 * 5 ** 2',
                'assert abs(result - 78.53975) < 0.001, f"Expected ~78.53975, got {result}"',
                'True',
              ].join('\n'),
              hint: 'r² means r raised to the power 2. In Python, that is 5 ** 2. Then multiply by π: 3.14159 * 5 ** 2.',
            },

          ],
        },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },

  rigor: {
    prose: [
      '**Precedence table (Python)**: from highest to lowest — `**` > unary `-` > `* / // %` > `+ -`. Operators at the same level associate left-to-right, except `**` which associates right-to-left: `2 ** 3 ** 2` = `2 ** (3 ** 2)` = `2 ** 9` = 512.',

      '**Floor division semantics**: `//` rounds toward negative infinity, not toward zero. `7 // 2` = 3 (expected), but `-7 // 2` = -4, not -3. This can surprise you when working with negative numbers.',

      '**Integer vs float arithmetic**: if both operands are integers, `+`, `-`, `*`, `//`, `%`, `**` all return integers. If either operand is a float, the result is a float. `/` always returns a float regardless. This type promotion rule is deterministic.',

      '**Modulo and negative numbers**: `a % b` in Python always returns a non-negative value when `b` is positive: `-7 % 3` = 2 (not -1). This differs from C, Java, and JavaScript which return a result with the sign of the dividend.',
    ],
    callouts: [
      {
        type: 'warning',
        title: '** is right-associative',
        body: '`2 ** 3 ** 2` is `2 ** (3 ** 2)` = 512, not `(2 ** 3) ** 2` = 64. This is unlike all other arithmetic operators, which are left-associative. When chaining `**`, always add parentheses to be explicit.',
      },
      {
        type: 'definition',
        title: 'Operand and operator',
        body: 'An operator (`+`, `*`, etc.) acts on one or two operands (the values it operates on). Unary operators take one operand; binary operators take two. Every expression with an operator evaluates to a single value.',
      },
    ],
    visualizations: [],
  },

  examples: [],
  challenges: [],
  semantics: { core: [] },

  spiral: {
    recoveryPoints: [
      'If your result is not what you expected, add parentheses to make the order explicit and check each sub-expression.',
      'If you get a TypeError, check that you are not accidentally mixing strings with numbers.',
    ],
    futureLinks: [
      'Next lesson: Types — you have now seen int vs float emerge from operators; the next lesson formalises what types are.',
      'Boolean expressions (==, !=, <, >) come in Lesson 10, after you have variables to compare.',
      'Variables (Lesson 5) let you name the results of expressions and reuse them.',
    ],
  },

  assessment: {
    questions: [
      {
        id: 'q1',
        text: 'What does 2 + 3 * 4 evaluate to in Python?',
        options: ['20 — addition is performed first', '14 — multiplication has higher precedence', 'An error — cannot mix operators'],
        correct: 1,
      },
      {
        id: 'q2',
        text: 'What is the result of 10 / 2 in Python?',
        options: ['5 — integer, exact division', '5.0 — / always returns a float', 'An error — 10 and 2 are integers'],
        correct: 1,
      },
      {
        id: 'q3',
        text: 'What does 17 % 5 produce?',
        options: ['3 — the remainder when 17 is divided by 5', '3.4 — the float result of 17 / 5', '2 — the floor of 17 / 5'],
        correct: 0,
      },
      {
        id: 'q4',
        text: 'Which expression produces 8 from the numbers 2, 2, and 1?',
        options: ['2 ** 2 + 1  (equals 5)', '2 ** (2 + 1)  (equals 8)', '(2 ** 2) + 1  (equals 5)'],
        correct: 1,
      },
    ],
  },

  mentalModel: [
    'An expression is code that evaluates to a value.',
    'Operators combine operands to produce a new value.',
    'Precedence determines evaluation order: ** > *//%// > +-.',
    'Parentheses override precedence — innermost first.',
    '/ always returns a float; // returns an integer (floor).',
    '% gives the remainder after floor division.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}
