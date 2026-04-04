// Chapter 0.2 — Lesson 3: Types
//
// DEPENDENCY: Lesson 1 (values), Lesson 2 (expressions).
//
// TEACHES:
//   The four primitive type names: int, float, str, bool
//   type() as an observation tool (used before functions are formally taught —
//     introduced as a "magic spell" with full explanation deferred to Lesson 7)
//   Type determines which operations are valid
//   Implicit type promotion: int op float → float
//   Explicit type conversion: int(), float(), str(), bool()
//   TypeError — what it means and how to read it
//   Truthiness: True == 1, False == 0
//
// DOES NOT TEACH (reserved for later):
//   Variables (Lesson 5)
//   print() (Lesson 7)
//   How functions work mechanically (Lesson 7)
//   Comparison operators (Lesson 10)

export default {
  id: 'py-0-2-types',
  slug: 'types',
  chapter: 0.2,
  order: 3,
  title: 'Types',
  subtitle: 'Why the kind of value matters as much as the value itself',
  tags: ['types', 'int', 'float', 'str', 'bool', 'type()', 'conversion', 'TypeError'],

  hook: {
    question: 'Why does Python care whether a number is 5 or 5.0?',
    realWorldContext:
      'A type is a label Python attaches to every value. It describes what the value is and what you can do with it. ' +
      'Two values can look the same — 5 and 5.0 — but belong to different types and behave differently. ' +
      'Types prevent nonsensical operations (what would it mean to multiply "hello" by "world"?) ' +
      'and determine the result of mixed-type arithmetic. ' +
      'Every production Python program — every data pipeline, every model — relies on types being correct.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Every value in Python has a **type** — a classification that describes what kind of data it is. You have already met the four primitive types: `int`, `float`, `str`, and `bool`. This lesson gives them their official names and shows how to inspect and convert them.',

      'You will use a tool called `type()` in this lesson. We have not yet learned how functions work — that comes in Lesson 7. For now, treat `type(value)` as a magic spell that asks Python: *"what kind of thing is this value?"* The explanation of how the spell works comes later.',

      'Type matters because it determines what operations are legal. Adding two integers is fine. Adding an integer and a string is a TypeError. Understanding types means understanding why Python accepts or rejects your code.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'type() is just for observation',
        body: 'In this lesson, type() is a reading tool — you use it to inspect values. You do not need to understand how it works yet. When Lesson 7 introduces built-in functions, type() will make complete sense.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Lesson 0.2.3 — Types',
        mathBridge: 'Run each cell. Read the prose, observe the output, then move on.',
        caption: 'All demo cells are pre-written. Run them in order.',
        props: {
          initialCells: [

            // ── CELL 1: type() as observation tool ───────────────────────────
            {
              id: 1,
              cellTitle: 'Inspecting a type with type()',
              prose: '`type(value)` asks Python what type a value belongs to. The result is a **type object** — Python\'s way of representing the type itself.\n\n`<class \'int\'>` means: this value belongs to the `int` (integer) type.',
              code: 'type(42)',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 2: All four primitive types ─────────────────────────────
            {
              id: 2,
              cellTitle: 'The four primitive types',
              prose: 'Here are all four primitive type names. Run this cell and read what Python reports for each.',
              instructions: 'Only the last `type()` call is shown. Change which value is on the last line to inspect each one.',
              code: [
                'type(42)         # int   — whole numbers',
                'type(3.14)       # float — decimal numbers',
                'type("hello")    # str   — text',
                'type(True)       # shown — bool: truth values',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 3: int vs float — same number, different type ────────────
            {
              id: 3,
              cellTitle: '5 and 5.0 are different types',
              prose: '`5` and `5.0` represent the same mathematical value, but they are different Python types.\n\n`5` is an `int` — stored exactly as a whole number.\n`5.0` is a `float` — stored as a binary approximation.\n\nThey behave differently in arithmetic and produce different output.',
              instructions: 'Run each line separately by moving the last line. Confirm that one returns `<class \'int\'>` and the other `<class \'float\'>`.',
              code: [
                'type(5)',
                'type(5.0)     # shown',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 4: int + float → float promotion ────────────────────────
            {
              id: 4,
              cellTitle: 'Mixed arithmetic: int + float → float',
              prose: 'When you mix an `int` and a `float` in an expression, Python automatically promotes the result to `float`.\n\nThis is called **implicit type promotion** — Python chooses the more general type to avoid losing precision.',
              instructions: 'The type of the result is float, not int. Verify this.',
              code: [
                '3 + 1.0     # int + float',
                'type(3 + 1.0)   # shown — what type is the result?',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 5: TypeError — incompatible types ───────────────────────
            {
              id: 5,
              cellTitle: 'TypeError — when types are incompatible',
              prose: 'Not all type combinations make sense. Python raises a `TypeError` when you try an operation that has no meaning for those types.\n\nA `TypeError` is informative — it tells you exactly which types were involved and what operation failed.',
              instructions: 'Run this cell and read the full error message. It tells you the types and the operation.',
              code: '1 + "one"',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 6: str + str is fine (concatenation) ────────────────────
            {
              id: 6,
              cellTitle: 'Same operator, different type — different meaning',
              prose: '`+` means addition for numbers, but concatenation for strings. The **type** of the operands determines what `+` does.\n\nThis is why types matter: the same symbol can mean completely different things.',
              code: '"Type " + "matters"',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 7: Explicit conversion — int(), float(), str(), bool() ───
            {
              id: 7,
              cellTitle: 'Converting between types',
              prose: 'You can convert a value from one type to another using conversion tools: `int()`, `float()`, `str()`, `bool()`.\n\nThis is called **explicit type conversion** (or casting). It is different from implicit promotion — you are asking Python to do it deliberately.',
              instructions: 'Run this to see the float 3.9 converted to an int. Notice: `int()` truncates — it does not round.',
              code: [
                'int(3.9)        # truncates toward zero → 3',
                'float(7)        # promotes to float  → 7.0',
                'str(42)         # shown — makes a string → "42"',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 8: bool() and truthiness ────────────────────────────────
            {
              id: 8,
              cellTitle: 'bool() — what is "truthy"?',
              prose: 'Every Python value has a truth interpretation: it is either truthy or falsy.\n\nFalsy values: `0`, `0.0`, `""` (empty string), and `False`.\nEverything else is truthy.\n\n`bool(value)` converts any value to its boolean interpretation.',
              instructions: 'Predict before running: which of these is False?',
              code: [
                'bool(0)',
                'bool(1)',
                'bool("")',
                'bool("hello")',
                'bool(0.0)',
                'bool(3.14)   # shown',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 9: True == 1 ────────────────────────────────────────────
            {
              id: 9,
              cellTitle: 'True is 1, False is 0',
              prose: 'In Python, `bool` is a subtype of `int`. `True` is exactly equal to the integer `1`, and `False` is exactly equal to `0`.\n\nThis means booleans can participate in arithmetic — which turns out to be useful for counting.',
              instructions: 'Predict each result before running.',
              code: [
                'True + True',
                'True + 1',
                'False * 100',
                'True + True + True   # shown',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 10: int() truncates toward zero ─────────────────────────
            {
              id: 10,
              cellTitle: 'int() truncates toward zero — not toward negative infinity',
              prose: '`int()` on a float removes the decimal part, always moving **toward zero**.\n\n- `int(3.9)` → `3` (not 4)\n- `int(-3.9)` → `-3` (not -4)\n\nThis differs from floor division `//`, which rounds toward negative infinity. For `-3.9`, floor gives `-4` but `int()` gives `-3`.\n\nIf you want true rounding, use `round()` — introduced in Lesson 7.',
              instructions: 'Confirm that int(-3.9) is -3, not -4. Then compare with -3.9 // 1.',
              code: [
                'int(-3.9)       # truncates toward zero: -3',
                '-3.9 // 1       # shown — floors toward -∞: -4.0',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 11: float('inf') and float('nan') ───────────────────────
            {
              id: 11,
              cellTitle: 'Special floats: infinity and NaN',
              prose: 'Python\'s `float()` accepts two special string values that represent mathematical concepts:\n\n- `float("inf")` — positive infinity (larger than any finite number)\n- `float("nan")` — Not a Number (the result of undefined operations like 0/0 in some contexts)\n\nThese arise naturally in scientific computing. Phase 2 covers when and why they appear. For now, just know they exist and are valid Python values.',
              instructions: 'Run this. Notice that inf and nan are real Python values, not errors.',
              code: [
                'float("inf")        # positive infinity',
                'float("nan")        # shown — Not a Number',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 12: str() of various types ──────────────────────────────
            {
              id: 12,
              cellTitle: 'str() converts any value to its string form',
              prose: '`str()` converts any value to a string representation:\n\n- `str(True)` → `"True"` (capital T)\n- `str(False)` → `"False"` (capital F)\n- `str(3.14)` → `"3.14"`\n- `str(42)` → `"42"`\n\nThis is useful when you need to join a number into a string using `+` concatenation.',
              instructions: 'Run this. Notice that str(True) gives the string "True" — with a capital T.',
              code: [
                'str(True)       # → "True"',
                'str(3.14)       # → "3.14"',
                'str(42)         # shown — → "42"',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 13: bool() of non-zero numbers ──────────────────────────
            {
              id: 13,
              cellTitle: 'bool() — non-zero is truthy, zero is falsy',
              prose: '`bool()` of a number follows a simple rule:\n- `0` and `0.0` → `False`\n- Everything else → `True` — including negative numbers\n\n`bool(-1)` is `True`. `bool(0.0)` is `False`. `bool(-0.001)` is `True`.\n\nThe rule: **zero is falsy, non-zero is truthy** — regardless of sign.',
              instructions: 'Predict each result before running. Does the sign of -1 matter?',
              code: [
                'bool(-1)        # non-zero negative — truthy',
                'bool(0.0)       # zero float — falsy',
                'bool(-100)      # shown — negative but non-zero: truthy',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 14: isinstance() ─────────────────────────────────────────
            {
              id: 14,
              cellTitle: 'isinstance() — checking type membership',
              prose: '`isinstance(value, Type)` returns `True` if a value belongs to that type (or a subtype of it).\n\nBecause `bool` is a **subtype** of `int`, `isinstance(True, int)` returns `True`. This is surprising — `True` is both a bool and an int.\n\n`isinstance()` is more flexible than `type() ==` because it respects the type hierarchy. For now, use it as an observation tool.',
              instructions: 'Run this. Then try isinstance(3.14, int) — should that be True or False?',
              code: [
                'isinstance(True, bool)      # True is a bool: True',
                'isinstance(True, int)       # shown — bool is subtype of int: also True',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 15: Type of an expression result ────────────────────────
            {
              id: 15,
              cellTitle: 'The type of an expression depends on its operands',
              prose: 'The type of an expression\'s result is determined by the types of its operands:\n\n- `3 + 1` → both ints → result is `int`\n- `3 + 1.0` → int + float → result is `float` (promoted)\n- `10 / 2` → always `float` (the `/` operator always returns float)\n- `10 // 2` → both ints → result is `int`\n\nThis connects Lesson 2 (operators) with Lesson 3 (types).',
              instructions: 'Run both. The first gives int, the second gives float — same numbers, different operator.',
              code: [
                'type(3 + 1)         # int + int → int',
                'type(3 + 1.0)       # shown — int + float → float',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 16: int() raises ValueError ─────────────────────────────
            {
              id: 16,
              cellTitle: 'int() raises ValueError on non-numeric strings',
              prose: '`int()` can convert a numeric string like `"42"` to an integer. But if the string is not a valid integer, Python raises a `ValueError` — not a TypeError.\n\n`int("hello")` → `ValueError: invalid literal for int() with base 10: \'hello\'`\n\n`int("3.14")` also fails — even though the string looks numeric, it contains a decimal point. To handle that, you need `float()` first: `int(float("3.14"))` → `3`.',
              instructions: 'Run this to see the ValueError. Then fix it by wrapping in float() first.',
              code: 'int("hello")    # raises ValueError',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 17: / always returns float ──────────────────────────────
            {
              id: 17,
              cellTitle: 'Why 1/1 is not 1 — / always returns float',
              prose: 'In Python 3, the `/` operator **always** returns a float, even when the division is exact:\n\n- `1 / 1` → `1.0` (not `1`)\n- `10 / 2` → `5.0` (not `5`)\n\nThis was a deliberate change from Python 2, where `1 / 1` gave `1` (integer). The change prevents silent truncation bugs. If you need an integer result, use `//`.',
              instructions: 'Run this. Confirm that 1 / 1 returns 1.0, not 1.',
              code: [
                '1 / 1           # exact division, but still float: 1.0',
                'type(1 / 1)     # shown — <class \'float\'>',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 18: The conversion chain ────────────────────────────────
            {
              id: 18,
              cellTitle: 'The conversion chain — nesting conversions',
              prose: 'Conversions can be **nested** — the output of one feeds into the next:\n\n`float(int("42"))` → `float(42)` → `42.0`\n\nTrace it inside out:\n1. `int("42")` — string to int → `42`\n2. `float(42)` — int to float → `42.0`\n\nThis pattern is common when reading data (which arrives as strings) and converting it for computation.',
              instructions: 'Run this. You should get 42.0. Confirm the type is float.',
              code: [
                'float(int("42"))        # "42" → 42 → 42.0',
                'type(float(int("42")))  # shown — <class \'float\'>',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGE 1: Identify the type ───────────────────────────────
            {
              id: 10,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Identify the Type',
              difficulty: 'easy',
              prompt:
                'For each expression, predict what `type()` will return, then verify.\n\n' +
                '• `type(10 / 2)` — is this int or float?\n' +
                '• `type(10 // 2)` — what about floor division?\n' +
                '• `type(True + 1)` — bool arithmetic?\n' +
                '• `type("3.14")` — a number inside quotes?\n' +
                '• `type(int("42"))` — converted from string?\n\n' +
                'Change the last line each time to check a different expression.',
              code: '# Replace the expression to check each type\ntype(10 / 2)',
              output: '', status: 'idle', figureJson: null,
              testCode: 'True  # Self-check: did "3.14" in quotes give str, not float?',
              hint: '/ always produces float. // produces int (when both operands are int). A number inside quotes is still a string — the quotes win.',
            },

            // ── CHALLENGE 2: Fix the TypeError ───────────────────────────────
            {
              id: 11,
              challengeType: 'fill',
              challengeNumber: 2,
              challengeTitle: 'Fix the TypeError',
              difficulty: 'easy',
              prompt:
                'Each line below raises a `TypeError`. Fix it using the appropriate conversion (`int()`, `float()`, or `str()`) so the expression runs without error.\n\n' +
                '1. `"The answer is " + 42`  → should produce `"The answer is 42"`\n' +
                '2. `"10" + 5`  → should produce `15` (integer sum)\n' +
                '3. `"3.14" * 2`  → should produce `6.28` (float product)\n\n' +
                'Try them one at a time.',
              starterBlock:
                '# Fix: "The answer is " + 42\n"The answer is " + str(___)',
              code:
                '# Fix: "The answer is " + 42\n"The answer is " + str(___)',
              output: '', status: 'idle', figureJson: null,
              testCode: [
                'assert "The answer is " + str(42) == "The answer is 42"',
                'assert int("10") + 5 == 15',
                'assert float("3.14") * 2 == 6.28',
                'True',
              ].join('\n'),
              hint: 'To add a string and a number, convert the number to a string with str(). To add a numeric string and a number, convert the string to int() or float().',
            },

            // ── CHALLENGE 3: Type chain ───────────────────────────────────────
            {
              id: 12,
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'The Conversion Chain',
              difficulty: 'medium',
              prompt:
                'Write a single expression that:\n\n' +
                '1. Starts with the string `"255"`\n' +
                '2. Converts it to an integer\n' +
                '3. Converts that integer to a float\n' +
                '4. The final result should be `255.0`\n\n' +
                'You can nest conversions — one inside another.',
              code: '# Convert the string "255" → int → float in one expression\nfloat(int(___))',
              output: '', status: 'idle', figureJson: null,
              testCode: [
                'result = float(int("255"))',
                'assert result == 255.0, f"Expected 255.0, got {result}"',
                'assert type(result) == float, "Result must be a float"',
                'True',
              ].join('\n'),
              hint: 'You can nest conversion calls: float(int("255")). The inner call runs first, producing 255. The outer call converts that to 255.0.',
            },

            // ── CHALLENGE 4: type() of expression results ────────────────────
            {
              id: 21,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Types of Division Results',
              difficulty: 'easy',
              prompt:
                'What does `type(10 // 3)` return? And `type(10 / 3)`?\n\n' +
                'Predict both answers, then verify by running each expression separately.\n\n' +
                'Remember: `//` is floor division, `/` is regular division.',
              code: [
                '# Check type of floor division result',
                'type(10 // 3)',
                '# Then check type of regular division result',
                'type(10 / 3)    # shown',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
r1 = type(10 // 3)
r2 = type(10 / 3)
if r1 == int and r2 == float:
    res = "SUCCESS: 10 // 3 is int (floor division of two ints returns int). 10 / 3 is float (/ always returns float)."
else:
    res = f"ERROR: Got type(10 // 3) = {r1.__name__}, type(10 / 3) = {r2.__name__}. Floor division of two ints gives int; / always gives float."
res
`,
              hint: '// on two ints returns an int. / always returns a float, even when the result is a whole number.',
            },

            // ── CHALLENGE 5: int() from a float ──────────────────────────────
            {
              id: 22,
              challengeType: 'fill',
              challengeNumber: 5,
              challengeTitle: 'Truncate a Float',
              difficulty: 'easy',
              prompt:
                'Fill in the blank so that `int(___)` produces `3`.\n\n' +
                'Use the float `3.99` as your input. Remember: `int()` truncates toward zero.',
              starterBlock: 'int(___)',
              code: 'int(___)',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = int(3.99)
if result == 3:
    res = "SUCCESS: int(3.99) = 3. int() truncates the decimal — it does not round."
else:
    res = f"ERROR: Got {result}. Replace ___ with 3.99. int() truncates toward zero, so int(3.99) = 3."
res
`,
              hint: 'Replace ___ with 3.99. int(3.99) truncates the .99 and gives 3 — not 4.',
            },

            // ── CHALLENGE 6: type of ** results — compound Lessons 2+3 ───────
            {
              id: 23,
              challengeType: 'write',
              challengeNumber: 6,
              challengeTitle: 'Types Through Exponentiation',
              difficulty: 'medium',
              prompt:
                '**Compound challenge (Lessons 2 + 3):** This draws on both expressions and types.\n\n' +
                'What is `type(2 ** 10)`? And `type(2.0 ** 10)`? Why are they different?\n\n' +
                'Predict both, then verify. Write a comment explaining why the float operand changes the result type.',
              code: [
                '# Predict: what type does 2 ** 10 produce?',
                'type(2 ** 10)',
                '# Now with a float base:',
                'type(2.0 ** 10)   # shown',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
r1 = type(2 ** 10)
r2 = type(2.0 ** 10)
if r1 == int and r2 == float:
    res = "SUCCESS: 2 ** 10 is int (both operands are ints). 2.0 ** 10 is float (one operand is float, so result is promoted to float)."
else:
    res = f"ERROR: Got {r1.__name__} and {r2.__name__}. When both operands of ** are ints, the result is int. When either is a float, the result is float."
res
`,
              hint: 'When both operands are ints, ** returns int. When either operand is a float, the result is promoted to float — the same promotion rule as +, -, *, //.',
            },

            // ── CHALLENGE 7: Conversion chain write ──────────────────────────
            {
              id: 24,
              challengeType: 'write',
              challengeNumber: 7,
              challengeTitle: 'String → Compute → String',
              difficulty: 'medium',
              prompt:
                'Write a single expression that:\n\n' +
                '1. Converts `"3"` to an integer\n' +
                '2. Multiplies it by `4`\n' +
                '3. Converts the result back to a string\n\n' +
                'The final result should be the string `"12"` (not the number 12).',
              code: '# str(int("3") * 4) — fill in the steps\nstr(int("3") * ___)',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = str(int("3") * 4)
if result == "12":
    res = "SUCCESS: Conversion chain verified. str→int→multiply→str produces '12'."
else:
    res = f"ERROR: Expected '12', got {result!r}. Check each step: int('3') = 3, 3 * 4 = 12, str(12) = '12'."
res
`,
              hint: 'Nest the calls: str(int("3") * 4). First int("3") = 3, then 3 * 4 = 12, then str(12) = "12".',
            },

            // ── CHALLENGE 8: bool("False") — hard ────────────────────────────
            {
              id: 25,
              challengeType: 'write',
              challengeNumber: 8,
              challengeTitle: 'The Truthy String Trap',
              difficulty: 'hard',
              prompt:
                '**Compound challenge (Lessons 1 + 3):** What does `bool("False")` return?\n\n' +
                'Think carefully:\n' +
                '- `"False"` is a string containing the word "False"\n' +
                '- It is not the boolean value `False`\n' +
                '- What is the truthiness rule for strings?\n\n' +
                'Write your reasoning as a comment, then verify with `bool("False")`.',
              code: [
                '# My prediction: bool("False") ==',
                '# Reasoning: ...',
                'bool("False")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = bool("False")
if result == True:
    res = "SUCCESS: Correct — bool('False') is True. Any non-empty string is truthy, even if it spells 'False'. Only the empty string '' is falsy."
else:
    res = "ERROR: Unexpected result. The string 'False' is non-empty, so bool() returns True. Don't confuse the string 'False' with the boolean False."
res
`,
              hint: 'The truthiness rule for strings: an empty string "" is falsy; any non-empty string is truthy. "False" is a non-empty string — it has 5 characters — so bool("False") is True.',
            },

            // ── CHALLENGE 9: Fix two type bugs ───────────────────────────────
            {
              id: 26,
              challengeType: 'fill',
              challengeNumber: 9,
              challengeTitle: 'Fix Two Type Bugs',
              difficulty: 'hard',
              prompt:
                'Two broken expressions need fixing:\n\n' +
                '1. `"Score: " + 42` — raises TypeError. Fix it so it produces `"Score: 42"`.\n' +
                '2. `int("3.14")` — raises ValueError. Fix it so it produces `3`.\n\n' +
                'For (1): convert 42 to a string before concatenating.\n' +
                'For (2): you need an intermediate conversion step — `int()` cannot parse a decimal string directly.',
              starterBlock:
                '# Bug 1: Fix the concatenation\n"Score: " + str(___)\n# Bug 2: Fix the conversion\nint(float(___))',
              code:
                '# Bug 1: Fix the concatenation\n"Score: " + str(___)\n# Bug 2: Fix the conversion\nint(float(___))',
              output: '', status: 'idle', figureJson: null,
              testCode: `
r1 = "Score: " + str(42)
r2 = int(float("3.14"))
if r1 == "Score: 42" and r2 == 3:
    res = "SUCCESS: Both bugs fixed. str(42) enables concatenation; int(float('3.14')) handles the decimal string."
else:
    res = f"ERROR: Got r1={r1!r}, r2={r2}. Bug 1: use str(42). Bug 2: float('3.14') = 3.14, then int(3.14) = 3."
res
`,
              hint: 'Bug 1: str(42) converts the integer to a string so it can be concatenated. Bug 2: int("3.14") fails because the string has a decimal point. Fix: int(float("3.14")) — first parse as float 3.14, then truncate to int 3.',
            },

          ],
        },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },

  rigor: {
    prose: [
      '**Type hierarchy**: `bool` is a subtype of `int` in Python\'s type system. `isinstance(True, int)` returns `True`. This is unusual among languages — most treat bool and int as unrelated types. The design allows booleans in arithmetic contexts without explicit conversion.',

      '**int() truncates, not rounds**: `int(3.9)` returns `3`, not `4`. It discards the decimal part entirely. For rounding, Python provides `round()`, which will be introduced with built-in functions.',

      '**str() vs repr()**: `str(value)` gives a human-readable string. For most primitive types they are identical, but for strings themselves: `str("hello")` gives `hello` while `repr("hello")` gives `\'hello\'` (with quotes). This distinction matters when building output — covered later.',

      '**float("nan") and float("inf")**: `float()` accepts special string values `"nan"` and `"inf"` as valid inputs. These represent Not-a-Number and infinity — values that arise in numerical computation and will be explored in Phase 2.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'int() truncates toward zero',
        body: 'int(-3.9) returns -3, not -4. It drops the decimal — it does not round to the nearest integer. For rounding behavior, use round(), which will be introduced in Lesson 7.',
      },
      {
        type: 'definition',
        title: 'Implicit vs explicit conversion',
        body: 'Implicit conversion (promotion) happens automatically: int + float → float. Explicit conversion requires you to call int(), float(), str(), or bool(). Python rarely does implicit conversion — it prefers to raise a TypeError and let you be explicit.',
      },
    ],
    visualizations: [],
  },

  examples: [],
  challenges: [],
  semantics: { core: [] },

  spiral: {
    recoveryPoints: [
      'If you get a TypeError, check the types of both operands. They must be compatible for the operation.',
      'If int() raises a ValueError, the string is not a valid integer (e.g., "3.14" cannot be directly converted to int — use float() first).',
    ],
    futureLinks: [
      'Next lesson: Variables — you will finally give names to values, and types become important when you store and reuse them.',
      'Lesson 7 (built-in functions) will explain exactly how type(), int(), float(), str(), and bool() work — and introduce many more.',
      'Phase 2 (NumPy) introduces array dtypes — a more efficient type system for large numerical data.',
    ],
  },

  assessment: {
    questions: [
      {
        id: 'q1',
        type: 'choice',
        text: 'What does type(3 + 1.0) return?',
        options: ["<class 'int'> — the first operand is an int", "<class 'float'> — int + float promotes to float", 'A TypeError — you cannot mix int and float'],
        answer: "<class 'float'> — int + float promotes to float",
      },
      {
        id: 'q2',
        type: 'choice',
        text: 'What does int(3.9) return?',
        options: ['4 — rounds to nearest integer', '3 — truncates toward zero', 'An error — float cannot be converted to int'],
        answer: '3 — truncates toward zero',
      },
      {
        id: 'q3',
        type: 'choice',
        text: 'Which value is falsy?',
        options: ['1', '"False"  (a non-empty string)', '0'],
        answer: '0',
      },
      {
        id: 'q4',
        type: 'choice',
        text: 'What is the type of True + 1?',
        options: ["bool — True is a boolean", "int — bool is a subtype of int, arithmetic promotes to int", "float — mixing types always produces float"],
        answer: "int — bool is a subtype of int, arithmetic promotes to int",
      },
    ],
  },

  mentalModel: [
    'Every value has a type: int, float, str, or bool.',
    'type(value) reveals what type a value belongs to.',
    'Type determines which operations are valid — incompatible types raise TypeError.',
    'int + float promotes to float; bool is a subtype of int.',
    'int(), float(), str(), bool() convert between types explicitly.',
    'int() truncates (does not round); 0, 0.0, and "" are falsy.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}
