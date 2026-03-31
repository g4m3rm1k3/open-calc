// Chapter 0.2 — Lesson 4: Variables
//
// DEPENDENCY: Lessons 1–3 (values, expressions, types).
//
// TEACHES:
//   Assignment: binding a name to a value
//   Reading a variable (name as last expression → shown as output)
//   Reassignment: the name rebinds to a new value
//   x = x + 1 — right side evaluates first, then binds
//   Assignment is NOT mathematical equality
//   Variable naming rules
//   NameError — using a name before it is assigned
//   Augmented assignment: +=, -=, *=
//
// DOES NOT TEACH (reserved for later):
//   print() — Lesson 7
//   Multiple assignment / tuple unpacking — later
//   Scope — after functions are introduced

export default {
  id: 'py-0-2-variables',
  slug: 'variables',
  chapter: 0.2,
  order: 4,
  title: 'Variables',
  subtitle: 'Giving names to values so the kernel can remember them',
  tags: ['variables', 'assignment', 'names', 'bindings', 'state', 'reassignment', 'NameError'],

  hook: {
    question: 'How does Python remember a value so you can use it later?',
    realWorldContext:
      'So far every value you have computed disappeared the moment the expression was evaluated. ' +
      'Variables solve this: they give names to values and store them in the kernel\'s memory. ' +
      'Once a variable is assigned, it persists in the kernel until the session resets — ' +
      'you can use it in any cell that runs after the assignment. ' +
      'Variables are how programs accumulate and transform state over time.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A **variable** is a name bound to a value. When you write `x = 5`, you are telling Python: "create a binding in the kernel — the name `x` now refers to the value `5`." This is called **assignment**.',

      'The `=` symbol in Python means **binding**, not mathematical equality. In mathematics, `x = 5` asserts that x and 5 are the same. In Python, it is a command: *evaluate the right side, then bind the result to the name on the left*.',

      'Reading a variable is simple: write its name as an expression. Python looks up the name in the kernel, finds the value it is bound to, and returns that value. Put the name on the last line of a cell and its value appears as output.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Right side evaluates first — always',
        body: 'In `x = x + 1`, Python evaluates the right side (`x + 1`) before doing anything with the left side. It looks up the current value of `x`, adds 1, and then rebinds the name `x` to the new value. The old value is discarded.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Lesson 0.2.4 — Variables',
        mathBridge: 'Run each cell in order. Variables accumulate in the kernel — later cells depend on earlier ones.',
        caption: 'Run cells in order. Variables set in one cell are available in all later cells.',
        props: {
          initialCells: [

            // ── CELL 1: Assignment ────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'Assigning a variable',
              prose: 'The assignment statement `name = expression` evaluates the right-hand side and binds the result to the name.\n\nAssignment itself produces no output — nothing is shown. To see the value, put the name on the last line.',
              code: [
                'x = 5',
                'x       # reading x — this IS the last expression, so it is shown',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 2: The name persists in the kernel ───────────────────────
            {
              id: 2,
              cellTitle: 'Variables persist between cells',
              prose: 'Once a variable is assigned, it lives in the kernel\'s memory. Every cell that runs after the assignment can use that name — regardless of where it appears in the notebook.',
              instructions: 'This cell uses `x` from Cell 1. If you run this cell before Cell 1, you will get a NameError.',
              code: 'x * 10    # x was assigned in Cell 1',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 3: Reassignment ──────────────────────────────────────────
            {
              id: 3,
              cellTitle: 'Reassignment — rebinding a name',
              prose: 'You can assign a new value to a name that already exists. The old value is replaced. The name now refers to the new value.',
              instructions: 'What value does `x` hold after this cell runs?',
              code: [
                'x = 5',
                'x = 100    # x is rebound to 100 — 5 is gone',
                'x          # shown',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 4: Right side evaluates first ───────────────────────────
            {
              id: 4,
              cellTitle: 'x = x + 1 — right side evaluates first',
              prose: 'The right side of `=` always evaluates **completely** before binding. In `x = x + 1`:\n\n1. Python looks up the current value of `x` (say, 100)\n2. Computes `100 + 1` → 101\n3. Rebinds the name `x` to 101\n\nThe old value is only replaced at step 3 — after the right side is done.',
              instructions: 'Trace through this cell step by step before running.',
              code: [
                'x = 10',
                'x = x + 1',
                'x = x + 1',
                'x           # shown — what is x now?',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 5: Assignment is not equality ───────────────────────────
            {
              id: 5,
              cellTitle: '= is binding, not equality',
              prose: 'In mathematics, `x = 5` means "x and 5 are the same thing." Python\'s `=` means something different: "evaluate the right side, then bind the result to the name on the left."\n\nThe proof: `x = x + 1` makes mathematical sense. In Python, `x = x + 1` is a perfectly valid — and extremely common — statement.',
              code: [
                'counter = 0',
                'counter = counter + 1',
                'counter = counter + 1',
                'counter = counter + 1',
                'counter     # shown — how many increments?',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 6: Using variables in expressions ────────────────────────
            {
              id: 6,
              cellTitle: 'Variables in expressions',
              prose: 'Variables can appear anywhere a value can. They are evaluated (looked up) when the expression runs, and their current value is substituted in.',
              instructions: 'Predict the output before running.',
              code: [
                'width = 8',
                'height = 5',
                'area = width * height',
                'area        # shown',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 7: NameError ─────────────────────────────────────────────
            {
              id: 7,
              cellTitle: 'NameError — using a name before assigning it',
              prose: 'If you use a name that has never been assigned in this kernel session, Python raises a `NameError`. It has no idea what value to look up.\n\nThis is the same error you saw in Chapter 0.1 — now you know precisely why it happens.',
              instructions: 'Run this cell. Read the NameError message — it tells you the exact name that was not found.',
              code: 'unassigned_name * 2',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 8: Variable naming rules ─────────────────────────────────
            {
              id: 8,
              cellTitle: 'Naming rules',
              prose: 'Variable names can contain letters, digits, and underscores. They cannot start with a digit. They are case-sensitive: `Score` and `score` are two different names.\n\nConvention: use `snake_case` — lowercase words joined by underscores. This is the Python standard.\n\n`total_score = 0` is preferred over `TotalScore = 0` or `totalscore = 0`.',
              instructions: 'All three names below are distinct. Run this and observe.',
              code: [
                'score = 10',
                'Score = 20',
                'SCORE = 30',
                'score + Score + SCORE   # shown — three separate variables',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 9: Augmented assignment ──────────────────────────────────
            {
              id: 9,
              cellTitle: 'Shorthand: augmented assignment',
              prose: 'Python provides shorthand operators that combine an operation with reassignment:\n\n`x += 1`  is the same as  `x = x + 1`\n`x -= 5`  is the same as  `x = x - 5`\n`x *= 2`  is the same as  `x = x * 2`\n\nThese are called **augmented assignment** operators. They are very common — use them whenever you are updating a variable.',
              code: [
                'total = 0',
                'total += 10',
                'total += 25',
                'total -= 5',
                'total       # shown',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGE 1: Trace the state ──────────────────────────────────
            {
              id: 10,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Trace the State',
              difficulty: 'easy',
              prompt:
                'Without running the code, trace the value of `n` after each line:\n\n' +
                '```\n' +
                'n = 4\n' +
                'n = n * 2\n' +
                'n = n + 3\n' +
                'n = n // 3\n' +
                '```\n\n' +
                'Write your predicted final value as a comment, then run to verify.',
              code: '# Predict: what is n after all four lines?\nn = 4\nn = n * 2\nn = n + 3\nn = n // 3\nn',
              output: '', status: 'idle', figureJson: null,
              testCode: [
                'n = 4',
                'n = n * 2',
                'n = n + 3',
                'n = n // 3',
                'assert n == 3, f"Expected 3, got {n}"',
                'True',
              ].join('\n'),
              hint: 'Step through one line at a time: 4 → 8 → 11 → 3 (11 // 3 = 3).',
            },

            // ── CHALLENGE 2: Accumulate a total ──────────────────────────────
            {
              id: 11,
              challengeType: 'fill',
              challengeNumber: 2,
              challengeTitle: 'Accumulate a Total',
              difficulty: 'easy',
              prompt:
                'Complete the code to accumulate a running total of test scores.\n\n' +
                'Start `total` at `0`, then add each score using `+=`.\n\n' +
                'The scores are: `85`, `92`, `78`, `95`.\n\n' +
                'The final value of `total` should be `350`.',
              starterBlock:
                'total = 0\ntotal += ___\ntotal += ___\ntotal += ___\ntotal += ___\ntotal',
              code:
                'total = 0\ntotal += ___\ntotal += ___\ntotal += ___\ntotal += ___\ntotal',
              output: '', status: 'idle', figureJson: null,
              testCode: [
                'total = 0',
                'total += 85',
                'total += 92',
                'total += 78',
                'total += 95',
                'assert total == 350, f"Expected 350, got {total}"',
                'True',
              ].join('\n'),
              hint: 'Replace each ___ with one of the four scores: 85, 92, 78, 95.',
            },

            // ── CHALLENGE 3: Swap two variables ──────────────────────────────
            {
              id: 12,
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Swap Two Variables',
              difficulty: 'medium',
              prompt:
                'Two variables `a` and `b` hold values `10` and `99`.\n\n' +
                'Swap their values so that after your code:\n' +
                '- `a` holds `99`\n' +
                '- `b` holds `10`\n\n' +
                '**Constraint**: you must use a third variable as a temporary holder.\n\n' +
                'Think it through: if you write `a = b` first, what happens to the original value of `a`?',
              code: [
                'a = 10',
                'b = 99',
                '',
                '# Swap a and b using a temporary variable',
                '# Your code here',
                '',
                'a   # should be 99 after the swap',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: [
                'a = 10',
                'b = 99',
                'temp = a',
                'a = b',
                'b = temp',
                'assert a == 99, f"Expected a == 99, got {a}"',
                'assert b == 10, f"Expected b == 10, got {b}"',
                'True',
              ].join('\n'),
              hint: 'Save one value before overwriting it: temp = a, then a = b, then b = temp. Without temp, you lose the original value of a the moment you write a = b.',
            },

          ],
        },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },

  rigor: {
    prose: [
      '**Binding vs copying**: when you write `x = 5`, Python creates a binding from the name `x` to the object `5`. The name is not the value — it is a reference. This distinction matters for mutable objects (lists, dicts) and will be revisited in depth in the data structures lessons.',

      '**del statement**: you can remove a name from the kernel with `del x`. After `del x`, using `x` raises a NameError. This is rarely needed but exists.',

      '**Python swap idiom**: Python allows simultaneous assignment: `a, b = b, a` swaps two variables in one line without a temporary variable. This uses tuple unpacking, which will be taught with data structures. The three-variable swap is the universal approach taught first because it transfers to every language.',

      '**Augmented assignment with immutable types**: `x += 1` on an integer creates a new integer object and rebinds `x` to it. It does not modify the original object `1` in place. For mutable objects (lists), `+=` actually modifies the object in place. This subtlety will be revisited in the data structures lessons.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Name vs value',
        body: 'A variable name is just a label. The same value can have multiple names (aliases). When you write `y = x`, you are making `y` point to the same value as `x` — not copying it. For immutable values like integers and strings, this distinction is invisible. For mutable objects, it will matter.',
      },
    ],
    visualizations: [],
  },

  examples: [],
  challenges: [],
  semantics: { core: [] },

  spiral: {
    recoveryPoints: [
      'If you get a NameError, run the cell that assigns the variable first.',
      'If a variable has an unexpected value, trace it: print each assignment step to see where it diverges.',
    ],
    futureLinks: [
      'Next lesson: State and execution flow — stepping through multi-line programs, tracing state changes over time.',
      'Lesson 7 (built-in functions) introduces print(), which lets you display multiple values from a single cell.',
      'Data structures (Lessons 15–17) will revisit the name vs value distinction for mutable objects.',
    ],
  },

  assessment: {
    questions: [
      {
        id: 'q1',
        text: 'What does x = 5 do in Python?',
        options: [
          'Asserts that x and 5 are mathematically equal',
          'Evaluates 5 and binds the name x to that value in the kernel',
          'Displays 5 as output',
        ],
        correct: 1,
      },
      {
        id: 'q2',
        text: 'x = 3. After x = x * 2, what is x?',
        options: ['3 — the original value is preserved', '6 — right side evaluates first, then x is rebound', 'An error — you cannot assign x to itself'],
        correct: 1,
      },
      {
        id: 'q3',
        text: 'What does x += 10 mean?',
        options: ['x = 10', 'x = x + 10', 'Add 10 to x and display the result'],
        correct: 1,
      },
      {
        id: 'q4',
        text: 'You use a variable name that was never assigned. Python raises:',
        options: ['A ValueError — the value is unknown', 'A NameError — the name is not in the kernel', 'A TypeError — the type cannot be determined'],
        correct: 1,
      },
    ],
  },

  mentalModel: [
    '= is binding, not equality: evaluate the right side, then bind the name to the result.',
    'A variable name is a label pointing to a value in the kernel.',
    'Reassignment rebinds the name — the old value is discarded.',
    'x = x + 1: right side evaluates first using the current value, then x is rebound.',
    'NameError means the name was never bound in this kernel session.',
    '+= -= *= are shorthands for update-and-rebind.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}
