// Chapter 0.2 — Lesson 1: Values
//
// DEPENDENCY: Chapter 0.1 (notebook model) only.
//
// TEACHES:
//   The four kinds of literal values: integer, float, string, boolean.
//   What "evaluation" means — Python reduces expressions to values.
//   The last expression in a cell is displayed as output.
//
// DOES NOT TEACH (reserved for later):
//   Variables (next lesson)
//   print() (after functions are introduced)
//   type() (after built-in functions are introduced)
//   Arithmetic beyond simple observation
//   Any operator beyond + for strings as a curiosity

export default {
  id: 'py-0-2-values',
  slug: 'values',
  chapter: 0.2,
  order: 1,
  title: 'Values',
  subtitle: 'The atoms of every Python program',
  tags: ['values', 'literals', 'int', 'float', 'str', 'bool', 'evaluation'],

  hook: {
    question: 'What is the simplest possible thing a Python program can do?',
    realWorldContext:
      'Before functions, before variables, before logic — there is just data. ' +
      'A value is a piece of data: the number 42, the text "hello", the answer True. ' +
      'Every Python program, from a two-line script to a million-line AI model, ' +
      'is ultimately a machine for transforming values into other values. ' +
      'This lesson introduces the four fundamental kinds of values you will use everywhere.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A **value** is the most fundamental concept in Python. It is a piece of data — something that exists and can be worked with. When you write a value directly in code, it is called a **literal**: the value literally written out.',

      'Python has four primitive (built-in, indivisible) types of value. You will use all four constantly. For now, just run each cell and observe what Python shows you.',

      'The rule you already know from Chapter 0.1: the **last expression** in a cell is shown as output. A lone value — like `42` on its own line — is the simplest possible expression. Python evaluates it and produces... `42`.',
    ],
    callouts: [
      {
        type: 'insight',
        title: '"Evaluate" means "produce a value"',
        body: 'When Python runs code, it evaluates it — reduces it to a value. The literal `42` evaluates to the integer forty-two. The expression `2 + 3` evaluates to the integer five. Evaluation is the core action Python performs on every line of code you write.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Lesson 0.2.1 — Values',
        mathBridge: 'Run each cell. Read the prose, observe the output, then move on.',
        caption: 'All cells are pre-written. Your only job is to run them and read.',
        props: {
          initialCells: [

            // ── CELL 1: Integer ──────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'The integer — a whole number',
              prose: 'An integer is any whole number: positive, negative, or zero. No decimal point.\n\nWrite a bare integer on a line and Python evaluates it — produces that number as a value and displays it.',
              code: '42',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 2: Float ────────────────────────────────────────────────
            {
              id: 2,
              cellTitle: 'The float — a decimal number',
              prose: 'A float (floating-point number) has a decimal point. `3.14` and `3.0` are both floats.\n\nImportant: `10` and `10.0` are different kinds of values even though they represent the same number. This distinction will matter when you start mixing them.',
              code: '3.14',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 3: String ───────────────────────────────────────────────
            {
              id: 3,
              cellTitle: 'The string — text',
              prose: 'A string is any sequence of characters enclosed in quotes. Single quotes or double quotes both work — Python treats them identically.\n\nThe quotes are delimiters, not part of the value. When Python shows you a string, it includes the quotes to tell you "this is text, not a number."',
              code: '"hello, notebook"',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 4: Boolean ──────────────────────────────────────────────
            {
              id: 4,
              cellTitle: 'The boolean — a truth value',
              prose: 'A boolean has exactly two possible values: `True` or `False`. Nothing else.\n\nThe capital letters are required — Python is case-sensitive. `true` is an error. `TRUE` is an error. Only `True` and `False` are valid.',
              instructions: 'After running this cell, try changing True to true (lowercase) and run again. Read the error message — errors are informative.',
              code: 'True',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 5: Last expression wins ─────────────────────────────────
            {
              id: 5,
              cellTitle: 'Only the last expression is shown',
              prose: 'A cell can have many lines. Python evaluates every one of them, but without print() only the last expression\'s result appears as output.\n\nThis cell has four values. Three evaluate and are discarded. One is shown.',
              instructions: 'Which value do you expect to see? Predict, then run.',
              code: [
                '42',
                '3.14',
                '"hello"',
                'False',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 6: Expressions produce values ───────────────────────────
            {
              id: 6,
              cellTitle: 'Expressions produce values',
              prose: 'A literal is a value on its own. An expression is code that produces a value by combining things. `2 + 3` is an expression — Python evaluates it and produces the integer `5`.\n\nThe mental model to engrave: expression → evaluated → produces a value.',
              instructions: 'Before running: what value do you expect? Then run.',
              code: '2 + 3',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 7: Strings combine too ──────────────────────────────────
            {
              id: 7,
              cellTitle: 'Strings can be combined',
              prose: 'The `+` operator works on strings too, but it means something different: it joins them end-to-end. This is called concatenation.\n\nNotice: the two strings are values. The `+` is an operator. The result is a new string value. Same pattern as arithmetic — expression → value.',
              instructions: 'Before running: what string value do you expect this to produce?',
              code: '"hello" + ", " + "world"',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 8: Type mismatch ────────────────────────────────────────
            {
              id: 8,
              cellTitle: 'Values have types — mixing them causes errors',
              prose: 'Each kind of value has a type. Operations that make sense for one type may not make sense for another.\n\nAdding two integers works. Combining two strings works. Adding an integer and a string — Python does not know what you mean and raises a TypeError.',
              instructions: 'Run this cell. Read the TypeError message carefully — it tells you exactly what went wrong.',
              code: '1 + "one"',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 9: Large integers ───────────────────────────────────────
            {
              id: 9,
              cellTitle: 'Large integers — Python has unlimited precision',
              prose: 'In many languages, integers have a maximum size — exceed it and you get overflow or garbage. Python has no such limit. An integer can be as large as your computer\'s memory allows.\n\n`2 ** 100` computes two to the power of one hundred — a number with 31 digits. Python computes it exactly, with no approximation.',
              instructions: 'Run this cell. Notice that the result is an exact integer, not scientific notation.',
              code: '2 ** 100',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 10: Negative literals ───────────────────────────────────
            {
              id: 10,
              cellTitle: 'Negative literals — -5 and -3.14 are valid values',
              prose: 'A negative sign in front of a number is valid Python. `-5` is the integer negative five. `-3.14` is the float negative three-point-one-four.\n\nTechnically the minus sign is a unary operator (it negates the value), but for all practical purposes you can treat `-5` as a negative integer literal.',
              code: [
                '-5',
                '-3.14',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 11: Multi-line strings ──────────────────────────────────
            {
              id: 11,
              cellTitle: 'Multi-line strings — triple quotes',
              prose: 'A regular string (`"..."` or `\'...\'`) must start and end on one line. A **triple-quoted string** (`"""..."""` or `\'\'\'...\'\'\'`) can span multiple lines. The newlines are part of the string value.\n\nMulti-line strings are used for long text, documentation, and SQL queries embedded in Python code.',
              code: [
                '"""This string',
                'spans',
                'three lines."""',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 12: Single vs double quotes ─────────────────────────────
            {
              id: 12,
              cellTitle: 'Single quotes and double quotes are interchangeable',
              prose: 'Python accepts both `\'hello\'` and `"hello"` — they produce identical string values. There is no difference.\n\nThe practical reason to have both: if your string contains a single quote, wrap it in double quotes (and vice versa) to avoid escaping.',
              code: [
                '\'single-quoted string\'',
                '"double-quoted string"',
                '"it\'s easy when you mix them"',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 13: None ────────────────────────────────────────────────
            {
              id: 13,
              cellTitle: 'None — the absence of a value',
              prose: '`None` is a special value that represents the absence of a value. It is its own type. It is not zero, not an empty string, not False — it is specifically "nothing".\n\nYou will encounter `None` when a function does not return anything, or when a variable has not been assigned a meaningful value yet. For now, just know it exists.',
              instructions: 'Run this cell. Notice that Python shows nothing in the output area — None produces no visible output by default.',
              code: 'None',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 14: String repetition ───────────────────────────────────
            {
              id: 14,
              cellTitle: 'String repetition — "ha" * 3',
              prose: 'The `*` operator has a special meaning when used with a string and an integer: it repeats the string that many times.\n\n`"ha" * 3` produces `"hahaha"`. This is not multiplication — Python recognises the combination of a string and an integer and applies repetition instead.',
              code: '"ha" * 3',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 15: Float scientific notation ───────────────────────────
            {
              id: 15,
              cellTitle: 'Float scientific notation — 1e6, 2.5e-3',
              prose: 'Python accepts scientific notation for floats. `1e6` means 1 × 10⁶ = 1,000,000.0. `2.5e-3` means 2.5 × 10⁻³ = 0.0025.\n\nThe `e` stands for "exponent". This notation is common in science and data work where values span many orders of magnitude.',
              code: [
                '1e6',
                '2.5e-3',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 16: Not a value — identifier without quotes ──────────────
            {
              id: 16,
              cellTitle: 'What is NOT a value — an identifier without quotes',
              prose: 'A common beginner mistake: writing text without quotes, thinking it is a string.\n\n`hello` (no quotes) is not a string. Python treats it as a **variable name** — an identifier — and looks it up in the kernel. If no variable called `hello` exists, you get a NameError.\n\nRule: text in code is only a string if it has quotes. Without quotes, it is a name.',
              instructions: 'Run this cell to see the NameError that results from a bare identifier.',
              code: [
                '# This looks like text but is NOT a string — it is an identifier',
                '# Python looks for a variable named "hello" and fails',
                'hello',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGE 1: Predict and verify ──────────────────────────────
            {
              id: 21,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Predict, then Verify',
              difficulty: 'easy',
              prompt:
                'For each expression below, predict the value it produces — write your prediction as a comment first, then run to verify.\n\n' +
                'Try them one at a time by replacing the current expression:\n\n' +
                '• `10 * 10`\n' +
                '• `10 / 3`\n' +
                '• `10 // 3`\n' +
                '• `"py" + "thon"`\n\n' +
                'Pay attention: does `10 / 3` give you what you expected?',
              code: '# Replace this comment with one expression at a time\n10 * 10',
              output: '', status: 'idle', figureJson: null,
              testCode: 'True  # Self-check: did the output match your prediction?',
              hint: '/ always produces a float (even if the result is a whole number). // is floor division — it discards the decimal.',
            },

            // ── CHALLENGE 2: What kind of value? ─────────────────────────────
            {
              id: 22,
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'What Kind of Value?',
              difficulty: 'easy',
              prompt:
                'Run each expression below and determine what kind of value it produces (integer, float, string, or boolean).\n\n' +
                '• `100 - 1`\n' +
                '• `1 / 1`\n' +
                '• `"True"`\n' +
                '• `1 == 1`\n\n' +
                'One of these will surprise you. Think about: what makes a value a string vs a boolean?',
              code: '# Try each expression one at a time\n100 - 1',
              output: '', status: 'idle', figureJson: null,
              testCode: 'True  # Self-check: did "True" (in quotes) behave differently from True (no quotes)?',
              hint: '"True" is a string — text that happens to spell the word True. True (no quotes) is a boolean. They are completely different values.',
            },

            // ── CHALLENGE 3: Fix a broken string literal ──────────────────────
            {
              id: 23,
              challengeType: 'fill',
              challengeNumber: 3,
              challengeTitle: 'Fix the Broken String',
              difficulty: 'easy',
              prompt: 'The string literal below is broken — it is missing a closing quote. Fix it so the cell runs without a SyntaxError and produces the string value `"open sesame"`.',
              instructions: 'Add the missing closing quote so the code is valid Python.',
              starterBlock: '"open sesame',
              code: '"open sesame',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = _
if result == "open sesame":
    res = "SUCCESS: The string is complete and evaluates to 'open sesame'."
else:
    res = "ERROR: Expected the string 'open sesame'. Make sure you closed the quote: \\"open sesame\\"."
res
`,
              hint: 'A string that starts with `"` must end with `"`. Add the closing double quote at the end.',
            },

            // ── CHALLENGE 4: Scientific notation ─────────────────────────────
            {
              id: 24,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Float Scientific Notation',
              difficulty: 'easy',
              prompt: 'Write an expression that produces the float `1000.0` using scientific notation (the `e` notation). Do not write `1000.0` directly — use `1e3`.',
              instructions: 'Your cell output should show: 1000.0',
              code: '# Write your scientific notation expression here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = _
if result == 1000.0 and isinstance(result, float):
    res = "SUCCESS: 1e3 evaluates to the float 1000.0."
else:
    res = "ERROR: Expected 1000.0 as a float. Use scientific notation: 1e3."
res
`,
              hint: '`1e3` means 1 × 10³ = 1000.0. The result is always a float when you use e-notation.',
            },

            // ── CHALLENGE 5: String repetition ───────────────────────────────
            {
              id: 25,
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'String Repetition',
              difficulty: 'medium',
              prompt: 'Produce the string `"abcabcabc"` using the `*` repetition operator. Do not write the string directly — use `"abc" * 3`.',
              instructions: 'Your cell output should show: \'abcabcabc\'',
              code: '# Write your expression using * here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = _
if result == "abcabcabc":
    res = "SUCCESS: 'abc' * 3 produces 'abcabcabc'. String repetition works just like numeric multiplication — but for text."
else:
    res = "ERROR: Expected 'abcabcabc'. Use 'abc' * 3 — the * operator repeats a string when combined with an integer."
res
`,
              hint: 'The `*` operator between a string and an integer repeats the string. `"abc" * 3` produces `"abcabcabc"`.',
            },

            // ── CHALLENGE 6: Bool arithmetic ──────────────────────────────────
            {
              id: 26,
              challengeType: 'write',
              challengeNumber: 6,
              challengeTitle: 'Boolean Arithmetic',
              difficulty: 'medium',
              prompt: 'In Python, `True` equals `1` and `False` equals `0`. This means booleans participate in arithmetic.\n\nWrite an expression that computes `True + True + True` and produces the integer result.',
              instructions: 'Your cell output should show: 3',
              code: 'True + True + True',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = True + True + True
if result == 3:
    res = "SUCCESS: bool arithmetic verified — True is 1, so 3 × True = 3."
else:
    res = "ERROR: Expected 3. Remember: True == 1 in Python."
res
`,
              hint: 'Python treats True as 1 in arithmetic contexts. So True + True + True = 1 + 1 + 1 = 3.',
            },

            // ── CHALLENGE 7: Compound — type reasoning ────────────────────────
            {
              id: 27,
              challengeType: 'write',
              challengeNumber: 7,
              challengeTitle: 'Compound: Reason Through a Type Expression',
              difficulty: 'hard',
              prompt: 'This challenge uses values and string operations together.\n\nStep through this expression manually before running it:\n```\ntype("10" + str(5 * 2))\n```\n1. What is `5 * 2`? → `10` (integer)\n2. What is `str(10)`? → `"10"` (string)\n3. What is `"10" + "10"`? → `"1010"` (string concatenation)\n4. What is `type("1010")`? → `<class \'str\'>`\n\nWrite the expression and run it to verify your reasoning.',
              instructions: 'Your cell output should show: <class \'str\'>',
              code: 'type("10" + str(5 * 2))',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = type("10" + str(5 * 2))
if result == str:
    res = "SUCCESS: The expression produces a string. '10' + str(10) = '10' + '10' = '1010', and type('1010') is str."
else:
    res = "ERROR: Expected <class 'str'>. Trace: 5*2=10, str(10)='10', '10'+'10'='1010', type('1010')=str."
res
`,
              hint: '`str()` converts any value to its string representation. `5 * 2` is 10 (int), `str(10)` is `"10"` (string). Then `"10" + "10"` is string concatenation, not addition.',
            },

          ],
        },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },

  rigor: {
    prose: [
      '**Integer precision**: Python integers have arbitrary precision — they can be as large as your computer\'s memory allows. There is no overflow. `2 ** 100` produces the exact integer, not an approximation.',

      '**Float imprecision**: floats are approximations stored in 64-bit binary. `0.1 + 0.2` does not equal `0.3` exactly in Python — it equals `0.30000000000000004`. This is not a bug; it is how binary floating-point works. It matters enormously in numerical computing and will come up again in Phase 2.',

      '**String immutability**: strings cannot be changed after creation. `"hello" + " world"` does not modify the original string — it creates a new string value. You will learn why this matters when data structures are introduced.',

      '**Boolean as subtype of integer**: in Python, `True` is exactly equal to `1` and `False` is exactly equal to `0`. `True + True` evaluates to `2`. This is intentional — it allows booleans to be used in arithmetic contexts, and is useful in data science for counting.',
    ],
    callouts: [
      {
        type: 'warning',
        title: '1 / 1 is not 1',
        body: 'In Python 3, `/` always returns a float. `1 / 1` returns `1.0`, not `1`. If you need an integer, use `//` (floor division). This is one of the most common sources of subtle type bugs.',
      },
    ],
    visualizations: [],
  },

  examples: [],
  challenges: [],
  semantics: { core: [] },

  spiral: {
    recoveryPoints: [
      'If you see a NameError on True or False, check capitalisation — it must be exactly True and False.',
      'If you see a TypeError when combining values, check that both sides of the operator are the same type.',
    ],
    futureLinks: [
      'Next lesson: Expressions — operators, order of operations, and how Python evaluates complex expressions.',
      'Types are formalised in Lesson 4 after you have seen them in action here.',
      'Variables (Lesson 5) give names to values so the kernel can remember them between cells.',
    ],
  },

  assessment: {
    questions: [
      {
        id: 'q1',
        text: 'What is the difference between 10 and 10.0 in Python?',
        options: [
          'Nothing — they are identical values',
          '10 is an integer, 10.0 is a float — different types',
          '10.0 is larger than 10',
        ],
        correct: 1,
      },
      {
        id: 'q2',
        text: 'What does 10 / 3 produce?',
        options: ['3 (integer, remainder discarded)', '3.3333... (float)', 'An error — division requires equal types'],
        correct: 1,
      },
      {
        id: 'q3',
        text: 'What kind of value is "False"?',
        options: ['A boolean — the value False', 'A string — text that spells "False"', 'An error — False must not be in quotes'],
        correct: 1,
      },
      {
        id: 'q4',
        text: 'A cell has three expressions on three lines. No print() is used. How many results appear in the output?',
        options: ['Three — one per expression', 'One — only the last expression is shown', 'Zero — you need print() for any output'],
        correct: 1,
      },
    ],
  },

  mentalModel: [
    'A value is data. A literal is a value written directly in code.',
    'Four primitive types: integer (whole), float (decimal), string (text), boolean (True/False).',
    'An expression evaluates to produce a value.',
    'Only the last expression in a cell is shown as output.',
    'Mixing incompatible types causes a TypeError — Python tells you exactly what went wrong.',
    'Python integers have unlimited precision — no overflow.',
    'None represents the absence of a value — it is its own type.',
    'String repetition: "ha" * 3 produces "hahaha".',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}
