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

            // ── CELL 10: Dedicated modulo ────────────────────────────────────
            {
              id: 10,
              cellTitle: 'Modulo % — the remainder operator',
              prose: '`%` gives the **remainder** after dividing. `17 % 5` is `2` because 17 ÷ 5 is 3 with 2 left over.\n\nTwo useful identities:\n- `a % a == 0` — anything divided by itself leaves no remainder\n- `a % 1 == 0` — any integer divided by 1 leaves no remainder\n\nPractical use: `n % 2 == 0` means n is even; `n % 2 == 1` means n is odd.',
              instructions: 'Confirm that 17 % 5 == 2. Then try 7 % 7 and 0 % 5 by changing the last line.',
              code: [
                '17 % 5      # 17 = 3*5 + 2, so remainder is 2',
                '7 % 7       # anything % itself = 0',
                '0 % 5       # shown — 0 divided by anything leaves 0',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 11: Dedicated floor division ────────────────────────────
            {
              id: 11,
              cellTitle: 'Floor division // — rounds toward negative infinity',
              prose: '`//` divides and then rounds **toward negative infinity** — not toward zero. For positive numbers this is the same as truncating. For negative numbers it surprises many people:\n\n`-7 // 2` is `-4`, not `-3`.\n\nWhy? Because -3.5 floored toward negative infinity is -4. Compare with `/`, which gives the exact float `-3.5`.',
              instructions: 'Run both lines and compare. Notice how // gives -4 while / gives -3.5.',
              code: [
                '-7 / 2      # exact float: -3.5',
                '-7 // 2     # shown — floors toward -∞: -4',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 12: % and // are partners ───────────────────────────────
            {
              id: 12,
              cellTitle: '% and // are partners — the reconstruction identity',
              prose: '`//` and `%` are designed to work together. No matter what `a` and `b` are, this identity always holds:\n\n`(a // b) * b + (a % b) == a`\n\nWith `a = 17` and `b = 5`: `(17 // 5) * 5 + (17 % 5)` = `3 * 5 + 2` = `17`. ✓\n\nThis is why they are called partners — floor division gives the quotient and modulo gives what is left over.',
              instructions: 'Run this. The result should be True, confirming the identity.',
              code: [
                'a, b = 17, 5',
                '(a // b) * b + (a % b) == a     # shown — always True',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 13: ** with fractional exponents ────────────────────────
            {
              id: 13,
              cellTitle: '** with fractional exponents — roots',
              prose: 'The `**` operator accepts fractional exponents, which computes roots:\n\n- `9 ** 0.5` is the square root of 9 → `3.0`\n- `8 ** (1/3)` is the cube root of 8 → `2.0`\n\nNote: the parentheses around `1/3` are required. Without them, `8 ** 1 / 3` would compute `(8 ** 1) / 3 = 2.666...` due to precedence.',
              instructions: 'Run both lines. Then try 27 ** (1/3) — what should the cube root of 27 be?',
              code: [
                '9 ** 0.5        # square root of 9',
                '8 ** (1/3)      # shown — cube root of 8',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 14: String * operator ───────────────────────────────────
            {
              id: 14,
              cellTitle: 'String repetition with *',
              prose: 'The `*` operator has a special meaning when one operand is a string and the other is an integer: it **repeats** the string that many times.\n\n`"ha" * 3` produces `"hahaha"`.\n\nThis is the only arithmetic operator that works on strings. The string must be on the left or right — the integer must be the other operand.',
              instructions: 'Run this. Then try "ab" * 4 to get "abababab".',
              code: [
                '"ha" * 3        # shown — repeats "ha" three times',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 15: Left-to-right at the same precedence level ───────────
            {
              id: 15,
              cellTitle: 'Left-to-right evaluation at equal precedence',
              prose: 'When two operators have the **same precedence**, Python evaluates **left to right**. This matters for subtraction:\n\n`10 - 3 - 2` is `(10 - 3) - 2 = 7 - 2 = 5`.\n\nIf it were right-to-left it would be `10 - (3 - 2) = 10 - 1 = 9` — a completely different answer. Most operators are left-associative. The exception is `**`.',
              instructions: 'Verify that 10 - 3 - 2 is 5, not 9.',
              code: '10 - 3 - 2      # (10-3)-2 = 5 (left to right)',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 16: Right-associativity of ** ───────────────────────────
            {
              id: 16,
              cellTitle: '** is right-associative — a rare exception',
              prose: '`**` is the only Python arithmetic operator that associates **right to left**:\n\n`2 ** 3 ** 2` means `2 ** (3 ** 2)` = `2 ** 9` = **512**.\n\nIf it were left-to-right it would be `(2 ** 3) ** 2 = 8 ** 2 = 64` — a much smaller number. This matches mathematical convention for power towers. When in doubt, add parentheses to be explicit.',
              instructions: 'Predict the result before running. Is it 512 or 64?',
              code: '2 ** 3 ** 2     # right-associative: 2 ** (3 ** 2)',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 17: Floating point surprise ─────────────────────────────
            {
              id: 17,
              cellTitle: 'Floating point is not exact',
              prose: 'Float arithmetic has a subtle quirk: `0.1 + 0.2` is **not** exactly `0.3`.\n\nRun the cell — Python will show something like `0.30000000000000004`. This is not a bug; it is a consequence of how all modern hardware stores decimal numbers in binary. The fraction 0.1 cannot be represented exactly in binary, just as 1/3 cannot be written exactly in decimal.\n\nFor now, just be aware this exists. Phase 2 covers strategies for dealing with floating point precision.',
              instructions: 'Run this. The result is very close to 0.3 — but not exactly.',
              code: '0.1 + 0.2       # shown — floating point surprise',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 18: Building complex expressions step by step ────────────
            {
              id: 18,
              cellTitle: 'Building complex expressions — the distance formula',
              prose: 'Real computations often combine many operators into one expression. The key is to build it **from inside out**, matching mathematical notation.\n\nThe distance from `(0, 0)` to `(3, 4)` is:\n\n`√((3−0)² + (4−0)²)`\n\nIn Python: `((3-0)**2 + (4-0)**2)**0.5`\n\nTrace the evaluation:\n1. `(3-0)**2` → 9\n2. `(4-0)**2` → 16\n3. `9 + 16` → 25\n4. `25 ** 0.5` → 5.0',
              instructions: 'Run the cell. You should get 5.0 — a classic 3-4-5 right triangle.',
              code: '((3-0)**2 + (4-0)**2)**0.5      # distance formula',
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

            // ── CHALLENGE 4: Discover modulo patterns ────────────────────────
            {
              id: 21,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Discover the Modulo Pattern',
              difficulty: 'easy',
              prompt:
                'Compute each of the following and observe the pattern:\n\n' +
                '• `10 % 3` — what is the remainder?\n' +
                '• `10 % 10` — a number modulo itself?\n' +
                '• `10 % 1` — a number modulo 1?\n\n' +
                'Write each as a separate expression (one per line). The last one will be shown.',
              code: [
                '# Compute each modulo expression',
                '10 % 3',
                '10 % 10',
                '10 % 1      # shown',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 10 % 3 == 1 and 10 % 10 == 0 and 10 % 1 == 0:
    res = "SUCCESS: Modulo mastered. a % a == 0 always, a % 1 == 0 always."
else:
    res = "ERROR: Check your answers. 10 % 3 = 1, 10 % 10 = 0, 10 % 1 = 0."
res
`,
              hint: 'The remainder when you divide by 1 is always 0 (everything divides evenly by 1). The remainder when you divide by yourself is always 0 too.',
            },

            // ── CHALLENGE 5: Fill in for even number ─────────────────────────
            {
              id: 22,
              challengeType: 'fill',
              challengeNumber: 5,
              challengeTitle: 'Even Number Check',
              difficulty: 'easy',
              prompt:
                'Fill in the blank to make the expression evaluate to `True` for an even number.\n\n' +
                'An even number is any number divisible by 2 — meaning its remainder when divided by 2 is 0.',
              starterBlock: '___ % 2 == 0',
              code: '___ % 2 == 0',
              output: '', status: 'idle', figureJson: null,
              testCode: `
n = 4
if n % 2 == 0:
    res = "SUCCESS: Correct — any even number like 4 gives 4 % 2 == 0, which is True."
else:
    res = "ERROR: Replace ___ with an even number (e.g., 4, 8, 100). Even numbers have remainder 0 when divided by 2."
res
`,
              hint: 'Replace ___ with any even number — 2, 4, 6, 8, 100. Even numbers always satisfy n % 2 == 0.',
            },

            // ── CHALLENGE 6: Divisibility by 7 ───────────────────────────────
            {
              id: 23,
              challengeType: 'write',
              challengeNumber: 6,
              challengeTitle: 'Divisibility Check',
              difficulty: 'medium',
              prompt:
                'Use `%` to check whether 49 is divisible by 7.\n\n' +
                'Write an expression that evaluates to `True` if 49 is divisible by 7, and `False` otherwise.\n\n' +
                'A number is divisible by another when the remainder is exactly 0.',
              code: '# Write an expression using % that is True when 49 is divisible by 7\n49 % 7 == ___',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = 49 % 7 == 0
if result == True:
    res = "SUCCESS: 49 % 7 == 0 is True — 49 is exactly 7 * 7, so the remainder is 0."
else:
    res = "ERROR: 49 / 7 = 7 exactly, so the remainder is 0. The expression should be 49 % 7 == 0."
res
`,
              hint: 'Divisibility means the remainder is 0. Write 49 % 7 == 0. Python will evaluate this to True or False.',
            },

            // ── CHALLENGE 7: Hypotenuse — compound Lessons 1+2 ───────────────
            {
              id: 24,
              challengeType: 'write',
              challengeNumber: 7,
              challengeTitle: 'Hypotenuse in One Expression',
              difficulty: 'medium',
              prompt:
                '**Compound challenge (Lessons 1 + 2):** This draws on both values and expressions.\n\n' +
                'Compute the hypotenuse of a right triangle with legs 3 and 4 — in a **single expression**, no variables.\n\n' +
                'Recall: `hypotenuse = √(a² + b²)`\n\n' +
                'Use `** 0.5` for the square root. Your result should be `5.0`.',
              code: '# One expression: square root of (3**2 + 4**2)\n(3**2 + 4**2) ** ___',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = (3**2 + 4**2) ** 0.5
if abs(result - 5.0) < 0.0001:
    res = "SUCCESS: Hypotenuse confirmed — (9 + 16) ** 0.5 = 25 ** 0.5 = 5.0."
else:
    res = f"ERROR: Got {result}. Try (3**2 + 4**2) ** 0.5. The answer should be 5.0."
res
`,
              hint: 'Square both legs: 3**2 = 9, 4**2 = 16. Add: 9 + 16 = 25. Take the square root: 25 ** 0.5 = 5.0. Combine: (3**2 + 4**2) ** 0.5.',
            },

            // ── CHALLENGE 8: String repetition fill ──────────────────────────
            {
              id: 25,
              challengeType: 'fill',
              challengeNumber: 8,
              challengeTitle: 'String Repetition',
              difficulty: 'medium',
              prompt:
                'Fill in the blank so the expression produces `"abababab"` (the string "ab" repeated 4 times).\n\n' +
                'Use the string repetition operator from Cell 14.',
              starterBlock: '"ab" ___ 4',
              code: '"ab" ___ 4',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = "ab" * 4
if result == "abababab":
    res = "SUCCESS: String repetition confirmed — 'ab' * 4 produces 'abababab'."
else:
    res = f"ERROR: Got {result!r}. Use the * operator: 'ab' * 4."
res
`,
              hint: 'Replace ___ with the * operator. String repetition uses the same symbol as multiplication: "ab" * 4.',
            },

            // ── CHALLENGE 9: Predict right-associativity ──────────────────────
            {
              id: 26,
              challengeType: 'write',
              challengeNumber: 9,
              challengeTitle: 'Predict the Power Tower',
              difficulty: 'hard',
              prompt:
                'What is `2 ** 3 ** 2`?\n\n' +
                'Before running, write a comment with your reasoning:\n' +
                '- Is it `(2 ** 3) ** 2 = 8 ** 2 = 64`?\n' +
                '- Or is it `2 ** (3 ** 2) = 2 ** 9 = 512`?\n\n' +
                'Recall from Cell 16: `**` is right-associative. Write your prediction as a comment, then verify.',
              code: [
                '# My prediction: 2 ** 3 ** 2 ==',
                '# Reasoning: ** is right-associative, so...',
                '2 ** 3 ** 2',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = 2 ** 3 ** 2
if result == 512:
    res = "SUCCESS: Right-associativity confirmed — 2 ** (3 ** 2) = 2 ** 9 = 512, not (2 ** 3) ** 2 = 64."
else:
    res = f"ERROR: Got {result}. Remember ** is right-associative: 2 ** 3 ** 2 = 2 ** (3 ** 2) = 2 ** 9 = 512."
res
`,
              hint: '** associates right-to-left. So 2 ** 3 ** 2 is evaluated as 2 ** (3 ** 2). First compute 3 ** 2 = 9, then 2 ** 9 = 512.',
            },

            // ── CHALLENGE 10: Extract the tens digit ─────────────────────────
            {
              id: 27,
              challengeType: 'write',
              challengeNumber: 10,
              challengeTitle: 'Extract a Digit',
              difficulty: 'hard',
              prompt:
                '**Compound challenge (Lessons 1 + 2):** Using only `//` and `%`, extract the **tens digit** from the number 347.\n\n' +
                'The tens digit of 347 is `4`.\n\n' +
                'Hint: think in two steps —\n' +
                '1. Remove the ones digit using `//`\n' +
                '2. Extract only the last digit using `%`\n\n' +
                'Write a single expression (no variables) that produces `4`.',
              code: '# Extract the tens digit from 347 using // and %\n(347 ___ 10) ___ 10',
              output: '', status: 'idle', figureJson: null,
              testCode: `
n = 347
tens = (n // 10) % 10
if tens == 4:
    res = "SUCCESS: Digit extraction confirmed. 347 // 10 = 34 (removes ones). 34 % 10 = 4 (extracts tens)."
else:
    res = f"ERROR: Got {tens}. Step 1: 347 // 10 = 34 (removes ones digit). Step 2: 34 % 10 = 4 (extracts tens digit)."
res
`,
              hint: 'Step 1: 347 // 10 = 34 (drops the ones digit). Step 2: 34 % 10 = 4 (the ones digit of 34 is the tens digit of 347). Combined: (347 // 10) % 10.',
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
