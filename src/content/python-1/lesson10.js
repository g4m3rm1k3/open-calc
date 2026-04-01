// Chapter 0.4 — Lesson 10: Boolean Logic
//
// DEPENDENCIES:
//   - Lesson 2: Values (True and False are values like any other)
//   - Lesson 3: Expressions (comparisons ARE expressions that evaluate to booleans)
//   - Lesson 9: Writing Functions (functions can return booleans)
//
// TEACHES:
//   1. True and False as first-class values
//   2. Comparison operators: ==  !=  <  >  <=  >=
//   3. Logical operators: not, and, or
//   4. Chained comparisons: 0 < x < 10
//   5. Truthy / Falsy — what else evaluates to True or False
//   6. Short-circuit evaluation
//   7. Boolean expressions as function return values

export default {
  id: 'py-0-4-booleans',
  slug: 'boolean-logic',
  chapter: 0.4,
  order: 10,
  title: 'Boolean Logic',
  subtitle: 'The language of True and False',
  tags: ['boolean', 'comparison', 'and', 'or', 'not', 'truthy', 'falsy', 'logic'],

  hook: {
    question: 'How does a program decide between two different paths?',
    realWorldContext:
      'Every decision a computer makes — whether an alarm sounds, a login succeeds, a payment processes — ' +
      'reduces to a single binary question: *True or False?* ' +
      'Before a program can branch (Lesson 11), loop conditionally, or filter data, it needs a way to ' +
      'produce and combine those answers. That is boolean logic.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      '`True` and `False` are **values** — the same kind of first-class value as `5` or `"hello"`. They have a type (`bool`), they can be stored in variables, returned from functions, and combined with operators.',
      'The most common way to produce a boolean is a **comparison**. Comparisons are expressions: `3 < 10` evaluates to `True`. That result can be used anywhere a value can be used.',
      'Three **logical operators** let you combine booleans:\n- `not x` — flips the value\n- `x and y` — True only if BOTH are True\n- `x or y` — True if AT LEAST ONE is True',
      'Python also has **truthy/falsy** rules. Many non-boolean values behave like booleans in a boolean context: empty strings, zero, and `None` are falsy; everything else is truthy.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'Equality vs Assignment',
        body: '`==` checks if two values are equal. `=` assigns a value to a name. Mixing them up is one of the most common beginner errors:\n```python\nx = 5      # assignment — binds 5 to x\nx == 5     # comparison — produces True\n```',
      },
      {
        type: 'insight',
        title: 'Comparisons ARE Expressions',
        body: 'You already know that `2 + 3` evaluates to `5`. Likewise, `3 < 10` evaluates to `True`. Both are just expressions that produce a value — one is `int`, the other is `bool`.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'The Logic Engine',
        mathBridge:
          'In math, a proposition is a statement that is either true or false. Every comparison operator produces a proposition.',
        caption:
          'Step through each cell to build the full picture of boolean logic from the ground up.',
        props: {
          initialCells: [
            // ─── Lesson cells ───────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'Boolean Values',
              prose:
                '`True` and `False` are values with the type `bool`. They are not strings — no quotes.',
              instructions:
                'Run to verify the type. Note that `bool` is a subtype of `int` in Python.',
              code: 'print(True)\nprint(False)\nprint(type(True))',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Equality: ==',
              prose:
                '`==` asks "do these two values have the same value?" It produces `True` or `False`.',
              instructions:
                'Predict each result before running. Why does `"5" == 5` produce `False`?',
              code: 'print(3 == 3)\nprint(3 == 4)\nprint("5" == 5)   # string vs int',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Inequality: !=',
              prose:
                '`!=` is "not equal." It is the direct opposite of `==`.',
              instructions:
                'For any expression `a == b`, the expression `a != b` will always give the opposite result.',
              code: 'print(3 != 4)\nprint(3 != 3)\nprint("hello" != "world")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Ordered Comparisons: <  >  <=  >=',
              prose:
                'Ordered comparisons work on numbers (and strings, alphabetically). They all evaluate to `True` or `False`.',
              instructions:
                'Try changing the numbers. Make sure you understand <= (less than OR equal).',
              code: 'print(5 > 3)\nprint(5 < 3)\nprint(5 >= 5)   # True — equal counts!\nprint(5 <= 4)   # False',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Storing Comparisons',
              prose:
                'The result of a comparison is just a value — you can bind it to a name like any other value.',
              instructions:
                'Trace the state: what type is `is_adult`? What value does it hold?',
              code: 'age = 20\nis_adult = age >= 18\nprint(is_adult)\nprint(type(is_adult))',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'not — Logical Negation',
              prose:
                '`not` flips the boolean value. `not True` → `False`, `not False` → `True`.',
              instructions:
                'Read these out loud: "not True", "not (5 > 3)". Predict before running.',
              code: 'print(not True)\nprint(not False)\nprint(not (5 > 3))',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: 'and — Both Must Be True',
              prose:
                '`x and y` is `True` only if BOTH `x` and `y` are `True`. If either is `False`, the result is `False`.',
              instructions:
                'Fill in the truth table mentally:\n  T and T = ?\n  T and F = ?\n  F and T = ?\n  F and F = ?',
              code: 'print(True and True)\nprint(True and False)\nprint(False and True)\nprint(False and False)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 8,
              cellTitle: 'or — At Least One Must Be True',
              prose:
                '`x or y` is `True` if EITHER (or both) are `True`. It is only `False` when both are `False`.',
              instructions:
                'The only case where `or` is `False` is `False or False`.',
              code: 'print(True or False)\nprint(False or True)\nprint(False or False)\nprint(True or True)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 9,
              cellTitle: 'Combining Operators',
              prose:
                'You can chain comparisons and logical operators into compound expressions.',
              instructions:
                'Read the last line as: "Is x positive AND less than 100?" Change x to 150 and re-run.',
              code: 'x = 42\nprint(x > 0 and x < 100)\nprint(x == 0 or x > 10)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 10,
              cellTitle: 'Chained Comparisons (Python shortcut)',
              prose:
                'Python lets you write range checks as `0 < x < 100` directly — this is equivalent to `x > 0 and x < 100`.',
              instructions:
                'This reads like math: "Is x between 1 and 10?" Try x = 0, x = 5, x = 10.',
              code: 'x = 5\nprint(1 <= x <= 10)\nprint(0 < x < 10)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 11,
              cellTitle: 'Truthy and Falsy Values',
              prose:
                'Non-boolean values have a boolean interpretation. Falsy values: `0`, `0.0`, `""`, `None`, empty collections. Everything else is truthy.',
              instructions:
                'Use bool() to see any value\'s boolean interpretation. Why is `bool(0)` False but `bool(-1)` True?',
              code: 'print(bool(0))\nprint(bool(1))\nprint(bool(""))\nprint(bool("hello"))\nprint(bool(None))',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 12,
              cellTitle: 'Short-Circuit Evaluation',
              prose:
                'Python stops evaluating as soon as the answer is known. For `and`: if the left side is `False`, the right side is never checked. For `or`: if the left side is `True`, the right is skipped.',
              instructions:
                'The division `1/0` would crash, but it is never reached. Why?',
              code: 'x = 0\nprint(x != 0 and (1 / x) > 2)   # short-circuits: x != 0 is False',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 13,
              cellTitle: 'Functions That Return Booleans',
              prose:
                'Functions can return True or False directly. These are called *predicates*. The result is just a value — store it, combine it, print it.',
              instructions:
                'Call `is_even` with several numbers. Then combine: `is_even(4) and is_even(6)`.',
              code: 'def is_even(n):\n    return n % 2 == 0\n\nprint(is_even(4))\nprint(is_even(7))\nprint(is_even(4) and is_even(6))',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 14,
              cellTitle: 'Operator Precedence',
              prose:
                'Precedence order (highest first): `not` → `and` → `or`. Use parentheses when in doubt.',
              instructions:
                'The two prints are NOT equivalent without parentheses. Add parens to the second line to make it match the first.',
              code: 'print(True or (False and False))   # True — and binds tighter\nprint((True or False) and False)   # False — parens change meaning',
              output: '', status: 'idle', figureJson: null,
            },

            // ─── Challenge cells ─────────────────────────────────────────────
            {
              id: 21,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Temperature Check',
              difficulty: 'easy',
              prompt:
                'Write a single expression that is `True` if `temp` is between 20 and 30 (inclusive). Store the result in `is_comfortable`.',
              instructions:
                'Use a chained comparison. Set temp = 25 first.',
              code: 'temp = 25\n# Write your expression here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'is_comfortable' not in locals():
    res = "ERROR: 'is_comfortable' not found. Did you bind your expression to that name?"
elif is_comfortable == True and eval('20 <= temp <= 30'):
    res = "SUCCESS: Range check confirmed. Chained comparison is your most readable tool for intervals."
else:
    res = "ERROR: Check your range. Both ends are inclusive (>=20 and <=30)."
res
`,
              hint: 'is_comfortable = 20 <= temp <= 30',
            },
            {
              id: 22,
              challengeType: 'fill',
              challengeNumber: 2,
              challengeTitle: 'Fill the Logic Gate',
              difficulty: 'easy',
              prompt:
                'Complete the function so it returns `True` if `x` is positive AND even.',
              instructions:
                'Replace the `___` placeholders with the correct operators and expressions.',
              code: `def is_positive_even(x):
    return x ___ 0 ___ x % 2 == 0

print(is_positive_even(4))    # True
print(is_positive_even(-4))   # False
print(is_positive_even(3))    # False
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'is_positive_even' not in locals():
    res = "ERROR: Function not found. Did you define 'is_positive_even'?"
elif is_positive_even(4) == True and is_positive_even(-4) == False and is_positive_even(3) == False:
    res = "SUCCESS: Logic gate verified. You combined a comparison with 'and' correctly."
else:
    res = "ERROR: Test failed. 4 should be True, -4 and 3 should be False."
res
`,
              hint: 'The first blank is > and the second blank is and',
            },
            {
              id: 23,
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Leap Year Detector',
              difficulty: 'medium',
              prompt:
                'A year is a leap year if it is divisible by 4. But years divisible by 100 are NOT leap years — UNLESS they are also divisible by 400.\n\nWrite `is_leap(year)` that returns `True` for leap years.',
              instructions:
                'Compound challenge: requires boolean logic AND writing functions (Lesson 9).\nHint: build it up — divisible by 4, then subtract the exceptions.',
              code: '# Define is_leap(year) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'is_leap' not in locals():
    res = "ERROR: Function 'is_leap' not found."
elif is_leap(2000) == True and is_leap(1900) == False and is_leap(2024) == True and is_leap(2023) == False:
    res = "SUCCESS: Leap year logic verified. You combined multiple conditions correctly."
else:
    res = "ERROR: Check edge cases — 1900 is NOT a leap year (div by 100 but not 400). 2000 IS (div by 400)."
res
`,
              hint: 'return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)',
            },
            {
              id: 24,
              challengeType: 'fill',
              challengeNumber: 4,
              challengeTitle: 'Short-Circuit Guard',
              difficulty: 'medium',
              prompt:
                'Fill in the blank so the division never crashes, even when `n` is 0.\nThe result should be `True` if `100 / n > 10` when n is non-zero, and `False` when n is 0.',
              instructions:
                'Use short-circuit evaluation. The guard check must come FIRST.',
              code: `def safe_check(n):
    return ___ and (100 / n) > 10

print(safe_check(5))    # True:  100/5 = 20 > 10
print(safe_check(20))   # False: 100/20 = 5, not > 10
print(safe_check(0))    # False — should not crash
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'safe_check' not in locals():
    res = "ERROR: Function 'safe_check' not found."
elif safe_check(5) == True and safe_check(20) == False and safe_check(0) == False:
    res = "SUCCESS: Guard confirmed. Short-circuit evaluation protected the division."
else:
    res = "ERROR: Test failed. safe_check(5) should be True, safe_check(0) should be False without crashing."
res
`,
              hint: 'The guard is: n != 0',
            },
            {
              id: 25,
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'The Classifier',
              difficulty: 'hard',
              prompt:
                'CUMULATIVE — uses Lessons 2, 3, 4, 9, and 10.\n\nWrite `classify(x)` that:\n- Returns `"negative"` if x < 0\n- Returns `"zero"` if x == 0\n- Returns `"small"` if 0 < x <= 10\n- Returns `"large"` if x > 10\n\nYou will need what you learn in the next lesson (conditionals) OR you can solve it cleverly with expressions and string operations now.',
              instructions:
                'Advanced challenge: you already have `not`, `and`, `or`, and the ability to return values. Try using multiplication tricks:\n`"negative" * (x < 0)` evaluates to `"negative"` when the condition is True, `""` when False.',
              code: '# Write classify(x) here\n# Test it:\n# classify(-5) -> "negative"\n# classify(0)  -> "zero"\n# classify(7)  -> "small"\n# classify(20) -> "large"\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'classify' not in locals():
    res = "ERROR: Function 'classify' not found."
elif (classify(-5) == "negative" and classify(0) == "zero" and
     classify(7) == "small" and classify(20) == "large"):
    res = "SUCCESS: CLASSIFIER ACTIVE. You bridged boolean logic into string output — a taste of what conditionals do cleanly."
else:
    res = "ERROR: One or more cases failed. Test each individually: classify(-5), classify(0), classify(7), classify(20)."
res
`,
              hint: 'One approach: return ("negative" * (x<0)) or ("zero" * (x==0)) or ("small" * (0<x<=10)) or "large"',
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**De Morgan\'s Laws**: `not (A and B)` is the same as `(not A) or (not B)`. And `not (A or B)` equals `(not A) and (not B)`. These are useful when simplifying nested conditions.',
      '**`is` vs `==`**: `==` compares values. `is` compares identity (whether two names point to the same object in memory). For booleans and small integers, Python often caches objects so `is` appears to work — but use `==` for value comparison.',
      '**Operator Precedence (full order)**: Arithmetic → Comparisons (`<`, `>`, `==`, ...) → `not` → `and` → `or`. This means `x > 0 and x < 10` is parsed as `(x > 0) and (x < 10)` automatically.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Chained or vs and',
        body: '`x == 1 or 2` does NOT mean "x is 1 or 2". It means `(x == 1) or 2`, which is always truthy because `2` is truthy. Always write: `x == 1 or x == 2`.',
      },
      {
        type: 'insight',
        title: 'Boolean Arithmetic',
        body: 'In Python, `True == 1` and `False == 0`. So `True + True` is `2`, and `sum([True, False, True])` is `2`. This is useful for counting how many conditions hold.',
      },
    ],
  },

  mentalModel: [
    'Comparisons produce values — True or False — just like arithmetic.',
    '`and` = all must pass; `or` = any must pass; `not` = flip.',
    'Short-circuit: `and` stops at the first False; `or` stops at the first True.',
    'Truthy/falsy: 0, "", None are False; everything else is True.',
    'Use parentheses when combining `and` and `or` to make intent explicit.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}
