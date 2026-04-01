// Chapter 0.2 — Lesson 5: State & Execution Flow
//
// DEPENDENCY: Lessons 1–4 (values, expressions, types, variables).
//
// TEACHES:
//   Programs run top-to-bottom sequentially
//   Evaluation (computing a value) vs Execution (running a statement)
//   State: The "Invisible Map" of bindings in memory
//   Active Tracing: Using print() to observe state changes
//   Logic Errors (correct execution, wrong logic)
//
// KEY REINFORCEMENTS:
//   - Variables store values, not relationships.
//   - Each line completes before the next begins.

export default {
  id: 'py-0-2-state',
  slug: 'state-flow',
  chapter: 0.2,
  order: 5,
  title: 'State & Execution Flow',
  subtitle: 'Watching your program move through time',
  tags: ['state', 'execution', 'sequential', 'tracing', 'evaluation'],

  hook: {
    question: 'How do you look inside a program while it is running?',
    realWorldContext:
      'In math, if $y = x + 2$, then $y$ always follows $x$. In Python, this is NOT true. ' +
      'Variables do not remember formulas — they store values at the specific moment of assignment. ' +
      'Understanding this "Sequence of Mutations" is the foundation of all programming.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A Python program is not run "all at once." It is executed **one line at a time, top to bottom**, modifying a shared state.',
      'To think like a programmer, you must separate **Evaluation** from **Execution**:',
      '1. **Evaluation**: Python computes a value (e.g., `x + 2` becomes `7`).\n2. **Execution**: Python updates the State (e.g., the name `y` is now bound to `7`).',
      'The collection of all variable names and their current values is called the **State**. Every line of code has the potential to update this map.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'Core Execution Rules',
        body: '1. Python runs code top → bottom.\n2. Each line completes before the next begins.\n3. Expressions are evaluated fully BEFORE assignment.\n4. Names must exist in the State before they are used.',
      },
      {
        type: 'insight',
        title: 'Variables are Snapshots, not Links',
        body: 'If you write `y = x`, `y` is now bound to the value that `x` holds RIGHT NOW. If you change `x` later, `y` stays with the old value. They are independent bindings.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'The Execution Timeline',
        mathBridge: 'Compare this to a mathematical proof: every line represents a new state of the world.',
        caption: 'Trace the state through the "Invisible Map" and use print() to verify your mental model.',
        props: {
          initialCells: [

            // ── CELL 1: Independence of name ──────────────────────────────────
            {
              id: 1,
              cellTitle: 'Rule 1: Independence of Name',
              prose: 'Let\'s test the "Snapshot" rule. If we set `y = x`, does `y` change when `x` changes later?',
              instructions: 'Predict: What is y? Run to reconcile your mental model.',
              code: 'x = 5\ny = x      # y captures the current value of x\nx = 10     # x is rebound, but y is independent\ny',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 2: Evaluation before assignment ──────────────────────────
            {
              id: 2,
              cellTitle: 'Rule 2: Evaluation Before Assignment',
              prose: 'Python evaluates the RIGHT side completely before it updates the LEFT side. This is why `x = x + 1` makes sense.',
              instructions: 'Trace the state of `a` as it grows. 1 -> 14.',
              code: 'x = 2\ny = x + 3 * 4   # 1. Evaluate 2 + 12 -> 14. 2. Bind y to 14.\ny',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 3: Instrumented tracing ──────────────────────────────────
            {
              id: 3,
              cellTitle: 'Instrumented Tracing',
              prose: 'Sometimes "Thinking" is not enough. We use `print()` as a diagnostic tool to look inside the state map while the code is running.',
              instructions: 'Notice how the first print happens before the update, and the second happens after.',
              code: 'balance = 100\nprint("Opened at:", balance)\n\nbalance = balance + 50\nprint("Updated to:", balance)',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 4: Logic errors ──────────────────────────────────────────
            {
              id: 4,
              cellTitle: 'Logic Errors: The Silent Failure',
              prose: 'A program can run "perfectly" but still be wrong. This is a logic error: the computer did exactly what you said, but you said the wrong thing.',
              instructions: 'Why is `total` 10 instead of 15? Trace it: `total` was computed before `tax` was added!',
              code: 'price = 10\ntax = 5\ntotal = price\nprice = price + tax\n\ntotal',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 6: State before and after ───────────────────────────────
            {
              id: 6,
              cellTitle: 'Tracing the State Map — a five-line program',
              prose: 'Think of the kernel\'s memory as a map: name → value. Every assignment updates that map. Every expression lookup reads from it.\n\nBelow is a five-line program. After each line, the state map changes. Trace it out loud before running.',
              instructions: 'Write down the state map after each line, then verify by running.',
              code: [
                'a = 10        # State: {a: 10}',
                'b = a + 5     # State: {a: 10, b: 15}',
                'a = a * 2     # State: {a: 20, b: 15}',
                'c = b - a     # State: {a: 20, b: 15, c: -5}',
                'c             # shown: -5',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 7: Multiple variables in state ──────────────────────────
            {
              id: 7,
              cellTitle: 'Multiple Variables — Each is Independent',
              prose: 'The state map can hold many variables at once. Each name is an independent slot. Changing one name does not affect any other name — unless an assignment explicitly uses the other name on its right side.',
              instructions: 'Notice that updating `score` has no effect on `high_score` or `lives`. They are separate entries in the state map.',
              code: [
                'score = 0',
                'high_score = 500',
                'lives = 3',
                '',
                'score += 100     # only score changes',
                'score += 50',
                '',
                'score, high_score, lives   # all three shown',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 8: Line-by-line execution order ─────────────────────────
            {
              id: 8,
              cellTitle: 'Execution Order — Assign, Use, Reassign',
              prose: 'Python executes each line exactly once, in the order it appears. The same name can be assigned, used in an expression, and reassigned in different positions — the key is which line ran most recently.',
              instructions: 'Trace `x` as it moves through three distinct phases: initial assignment, use in an expression, then reassignment.',
              code: [
                'x = 10           # x is 10',
                'result = x * 3   # uses x=10 → result=30',
                'x = 99           # x is now 99 — result is unaffected',
                '',
                'result, x        # shown: (30, 99)',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 9: State depends on which cells ran ──────────────────────
            {
              id: 9,
              cellTitle: 'Cell Dependency — Order of Execution Matters',
              prose: 'In a notebook, cells share the same state map. If Cell A assigns a variable and Cell B uses it, Cell B depends on Cell A having run first.\n\nIf you run Cell B before Cell A, you get a NameError. If you re-run Cell A after Cell B, the results from Cell B are stale.',
              instructions: 'This cell uses `balance` which must have been assigned in Cell 3. Try running this cell first to see the dependency in action.',
              code: [
                '# This cell depends on "balance" being in the state map',
                '# (Cell 3 assigns it)',
                'interest = balance * 0.05',
                'interest    # shown — 7.5 if balance is still 150',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 10: print as a tracing tool ─────────────────────────────
            {
              id: 10,
              cellTitle: 'print() as a Tracing Tool — Finding the Bug',
              prose: 'When a program produces the wrong output, you cannot always see why just by reading. The technique of **instrumented tracing** means inserting `print()` calls at key points to reveal the state map at those moments.\n\nThe strategy: print before a suspicious operation, and again after. The moment the value stops matching your expectation is where the bug lives.',
              instructions: 'The program below has a bug. Add `print()` calls after each operation to find exactly where the value goes wrong.',
              code: [
                'n = 8',
                'print("start:", n)',
                'n = n * 2',
                'print("after *2:", n)',
                'n = n + 1',
                'print("after +1:", n)',
                'n = n // 2',
                'print("after //2:", n)',
                'n   # final value',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 11: Logic error vs syntax error ─────────────────────────
            {
              id: 11,
              cellTitle: 'Logic Error vs Syntax Error',
              prose: 'There are two very different kinds of mistakes:\n\n**Syntax error**: Python cannot even parse the code. Execution stops immediately with a `SyntaxError`. You will always know.\n\n**Logic error**: The code is valid Python and runs without error — but it produces the wrong answer. Python did exactly what you asked; you asked for the wrong thing. These are much harder to catch.\n\nA NameError, TypeError, or ValueError is an **exception** — somewhere between the two.',
              instructions: 'The first cell has a syntax error (commented out). The second has a logic error — it runs fine but gives the wrong area of a triangle.',
              code: [
                '# Syntax error — Python cannot parse this:',
                '# area = base * height /    # incomplete expression',
                '',
                '# Logic error — Python runs this perfectly but the answer is wrong:',
                'base = 10',
                'height = 6',
                'area = base * height   # LOGIC ERROR: forgot to divide by 2',
                'area                   # shows 60 instead of 30',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 12: NameError timing ─────────────────────────────────────
            {
              id: 12,
              cellTitle: 'NameError Fires at Evaluation Time',
              prose: 'Python does not scan for undefined names when you open a file or write a cell. It only checks when the line that uses the name actually runs.\n\nThis means the first four lines of a cell can succeed perfectly, and then line 5 raises a NameError. Execution halts at the moment of the bad lookup — not before.',
              instructions: 'Lines 1–3 run successfully. Line 4 raises a NameError because `z` was never assigned. The `print` on line 5 never runs.',
              code: [
                'a = 10',
                'b = 20',
                'c = a + b     # 30 — fine',
                'd = c + z     # NameError: z is not defined',
                'print(d)      # never reached',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 13: Notebook execution order vs reading order ────────────
            {
              id: 13,
              cellTitle: 'Notebook Order vs Reading Order',
              prose: 'When you read a notebook from top to bottom, it *looks* sequential. But the actual execution order is determined by which cells you ran and when — not by where they appear on the page.\n\nYou can run Cell 5 before Cell 1. You can run Cell 3 twice. The state map reflects the history of what actually ran, not what the page implies.\n\nThis is the number-one source of mysterious bugs in data science notebooks. The discipline: always use "Run All" to verify your notebook works from a clean state.',
              instructions: 'The [1], [2], [3] markers on cells show the order they ran. If you see Cell 4 marked [1] and Cell 1 marked [3], the state will not be what the page suggests.',
              code: [
                '# This cell illustrates the issue:',
                '# If you run THIS cell before running Cell 6 above,',
                '# the variable "a" from Cell 6 may be in your kernel',
                '# from a previous run — giving a false impression of success.',
                '',
                '# Best practice: Kernel → Restart & Run All',
                'a = "fresh"',
                'a',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 14: State accumulation ───────────────────────────────────
            {
              id: 14,
              cellTitle: 'State Accumulation — A Counter Grows',
              prose: 'State accumulates over time. A counter that starts at 0 and is incremented on each line shows how the state map grows step by step.\n\nThis is the simplest form of a running total — a pattern that appears constantly in data processing, animation, and simulations.',
              instructions: 'Watch the counter grow. After this cell runs, the state map holds `count = 5`. Later cells can read that value.',
              code: [
                'count = 0',
                'count += 1   # 1',
                'count += 1   # 2',
                'count += 1   # 3',
                'count += 1   # 4',
                'count += 1   # 5',
                'count        # shown: 5',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 15: Trace challenge setup ────────────────────────────────
            {
              id: 15,
              cellTitle: 'Trace Challenge — Predict Before You Run',
              prose: 'The best way to build a strong mental model of execution flow is to predict the output before running. This forces you to simulate Python\'s evaluation in your head.\n\nRule: write your prediction as a comment, then run and compare.',
              instructions: 'Trace the six lines below. What is the final value of `x`? Write your prediction as a comment before running.',
              code: [
                '# Prediction: x = ???',
                'x = 5',
                'x = x + 3    # x = ?',
                'x = x * 2    # x = ?',
                'x = x - 4    # x = ?',
                'x //= 3      # x = ?',
                'x **= 2      # x = ?',
                'x            # final value',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 16: Clearing state ───────────────────────────────────────
            {
              id: 16,
              cellTitle: 'Clearing State — What "Restart Kernel" Does',
              prose: 'The kernel\'s state map persists until you explicitly clear it. "Restart Kernel" (or "Restart & Run All") wipes the entire map — every variable, every imported module, every cached result is gone.\n\nAfter a restart, every name must be re-assigned before use. Running Cell 2 before Cell 1 after a fresh restart will always produce a NameError if Cell 2 depends on Cell 1.\n\nClearing state is the ultimate debugging tool: if your notebook behaves unexpectedly, a clean restart reveals whether you have hidden dependencies from previous runs.',
              instructions: 'After running this cell, try restarting the kernel (Kernel menu → Restart). Then try running Cell 2 first. You will get a NameError — the state map is empty.',
              code: [
                '# The kernel remembers everything that has run in this session.',
                '# restart_marker is now in the state map.',
                'restart_marker = "kernel is alive"',
                'restart_marker',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGE 1: Multi-step trace ─────────────────────────────────
            {
              id: 5,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'The Multi-Step Trace',
              difficulty: 'medium',
              prompt: 'Trace the state by hand. What is the value of **c** at the end?',
              instructions: "Type the following four lines into the cell. Predict the value of `c` before you click Run:\n\n\na = 3\nb = a + 4\na = a + 2\nc = a + b\nc\n",
              starterBlock: [
                'a = 3',
                'b = a + 4',
                'a = a + 2',
                'c = a + b',
                'c'
              ].join('\n'),
              code: [
                '# 1. Type the code from the instructions here',
                '# 2. Predict the final value of c',
                '# 3. Run to verify',
                ''
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
# We check if the student actually computed the trace result correctly
# result is the value of the last expression (c)
if _ == 12:
    print("Perfect! a=3, b=7, then a=5. Finally 5 + 7 = 12.")
else:
    raise ValueError(f"Expected 12, but got {_}. Did you think b was linked to a? It captured 7 and stayed there!")
True
`,
              hint: 'Trace: a is 3. b becomes 3+4=7. a is updated to 3+2=5. Finally, c is 5+7=12.',
            },

            // ── CHALLENGE 2: Add print() tracing ──────────────────────────────
            {
              id: 21,
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Trace with print()',
              difficulty: 'easy',
              prompt:
                'Add `print()` statements to trace a three-step calculation.\n\n' +
                'Start with `n = 50`. Then:\n' +
                '1. Multiply by 2\n' +
                '2. Subtract 30\n' +
                '3. Divide by 7 (use `//` for integer division)\n\n' +
                'Add a `print()` call after each step so you can see `n` at the start, after step 1, after step 2, and after step 3.',
              code: [
                'n = 50',
                'print("start:", n)',
                '# Step 1: multiply by 2',
                '',
                '# Step 2: subtract 30',
                '',
                '# Step 3: divide by 7 (integer division)',
                '',
                'n   # final value',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
n = 50
n *= 2
n -= 30
n //= 7
if n == 10:
    res = "SUCCESS: Trace confirmed. 50 → 100 → 70 → 10."
else:
    res = f"ERROR: Expected 10, got {n}. Check each operation: *2, -30, //7."
res
`,
              hint: 'After *2: n=100. After -30: n=70. After //7: n=10. Add print("after *2:", n) etc. between each step.',
            },

            // ── CHALLENGE 3: Fill accumulation ────────────────────────────────
            {
              id: 22,
              challengeType: 'fill',
              challengeNumber: 3,
              challengeTitle: 'Fill the Accumulator',
              difficulty: 'easy',
              prompt:
                'Complete the accumulator so that `total` ends up equal to `25`.\n\n' +
                'Fill in the two blanks with values that sum to 25.',
              starterBlock:
                'total = 0\ntotal += ___\ntotal += ___\ntotal',
              code:
                'total = 0\ntotal += ___\ntotal += ___\ntotal',
              output: '', status: 'idle', figureJson: null,
              testCode: `
total = 0
total += 10
total += 15
if total == 25:
    res = "SUCCESS: Accumulation confirmed. 10 + 15 = 25."
else:
    res = f"ERROR: Expected 25, got {total}. What two numbers sum to 25?"
res
`,
              hint: 'Any two numbers that add up to 25 will work. For example, 10 and 15, or 20 and 5.',
            },

            // ── CHALLENGE 4: Find the logic error ─────────────────────────────
            {
              id: 23,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Diagnose the Logic Error',
              difficulty: 'medium',
              prompt:
                'The program below runs without error but gives the wrong answer. It should compute the total cost of 3 items at $12 each with a $5 discount, giving `$31`.\n\n' +
                '```python\nquantity = 3\nprice = 12\ndiscount = 5\ntotal = price * quantity\ndiscount = discount - total\ntotal\n```\n\n' +
                'Find the bug, fix it, and confirm `total == 31`.',
              code: [
                '# Original (buggy) program — find and fix the logic error',
                'quantity = 3',
                'price = 12',
                'discount = 5',
                'total = price * quantity',
                'discount = discount - total   # BUG is here — fix this line',
                'total',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
quantity = 3
price = 12
discount = 5
total = price * quantity
total = total - discount
if total == 31:
    res = "SUCCESS: Logic error fixed. 3 × 12 - 5 = 31."
else:
    res = f"ERROR: Expected 31, got {total}. Hint: total should be reduced by discount, not discount reduced by total."
res
`,
              hint: 'The bug is on the line with `discount`. The program subtracts `total` from `discount` — it should subtract `discount` from `total`. Fix: `total = total - discount`.',
            },

            // ── CHALLENGE 5: Hand-trace five lines ────────────────────────────
            {
              id: 24,
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Predict Before You Run — Five-Line Trace',
              difficulty: 'medium',
              prompt:
                'Trace this five-line program by hand. Predict the final values of `a`, `b`, and `c` before running.\n\n' +
                '```python\na = 4\nb = a * 3\na = a + 1\nc = a + b\nb = c - a\n```\n\n' +
                'Write your predictions as comments, then run to verify.',
              code: [
                '# Predictions:',
                '# a = ?',
                '# b = ?',
                '# c = ?',
                '',
                'a = 4',
                'b = a * 3',
                'a = a + 1',
                'c = a + b',
                'b = c - a',
                '',
                'a, b, c   # shown',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
a = 4
b = a * 3
a = a + 1
c = a + b
b = c - a
if a == 5 and b == 12 and c == 17:
    res = "SUCCESS: Trace verified. a=5, b=12, c=17."
else:
    res = f"ERROR: Expected a=5, b=12, c=17. Got a={a}, b={b}, c={c}. Trace step by step."
res
`,
              hint: 'Step by step: a=4, b=12, a becomes 5, c=5+12=17, b=17-5=12. Final: a=5, b=12, c=17.',
            },

            // ── CHALLENGE 6: Celsius to Fahrenheit ───────────────────────────
            {
              id: 25,
              challengeType: 'write',
              challengeNumber: 6,
              challengeTitle: 'Temperature Conversion — Augmented Assignment Chain',
              difficulty: 'hard',
              prompt:
                'Convert 100 degrees Celsius to Fahrenheit using **only augmented assignment**.\n\n' +
                'The formula is: `F = (C × 9/5) + 32`\n\n' +
                'Start with `C = 100`. Build the conversion step by step:\n' +
                '1. Start with `F = C`\n' +
                '2. Use augmented operations to apply the formula to `F`\n\n' +
                'The correct answer is `212.0`. Use `print()` to trace each step.',
              code: [
                'C = 100',
                'F = C             # start: F equals C',
                '# Step 2: multiply F by 9/5',
                '# Step 3: add 32',
                '',
                'print("C:", C)',
                'print("F:", F)',
                'F',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
C = 100
F = (C * 9/5) + 32
if abs(F - 212.0) < 0.001:
    res = "SUCCESS: 100°C = 212°F. Formula verified."
else:
    res = f"ERROR: Expected 212.0, got {F}. Formula: (C × 9/5) + 32."
res
`,
              hint: 'After `F = C`, use `F *= 9/5` (multiply by 9/5), then `F += 32` (add 32). The two augmented operations apply the formula step by step.',
            },

            // ── CHALLENGE 7: Four-step sequence ──────────────────────────────
            {
              id: 26,
              challengeType: 'write',
              challengeNumber: 7,
              challengeTitle: 'State Journey — Four Steps in One Cell',
              difficulty: 'hard',
              prompt:
                'Write a four-step sequence in a single cell (use comments as section markers) that takes a value through this state journey:\n\n' +
                '1. `temp = 100` (initial state)\n' +
                '2. Apply some adjustment: `temp -= 37` (adjusted state)\n' +
                '3. Format as a string: `result = str(temp) + " degrees"` (string state)\n' +
                '4. Print the result with a label: `print("Reading:", result)`\n\n' +
                'The final `print` should output `Reading: 63 degrees`.',
              code: [
                '# Step 1: initial state',
                '',
                '# Step 2: adjust',
                '',
                '# Step 3: format as string',
                '',
                '# Step 4: print with label',
                '',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
temp = 100
temp -= 37
result = str(temp) + " degrees"
if result == "63 degrees":
    res = "SUCCESS: State journey complete. 'Reading: 63 degrees' confirmed."
else:
    res = f"ERROR: Expected '63 degrees', got {result!r}. Check each step."
res
`,
              hint: 'Each step builds on the previous: 100 → 63 (integer) → "63 degrees" (string) → printed with label. Use `str(temp)` to convert the integer to a string for concatenation.',
            },

          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**The Global State Record**: In this stage, all variables exist in a single "Global Scope." There are no isolated pockets of memory yet. Every variable is visible to every line of code.',
      '**Evaluations are side-effect free (mostly)**: In pure arithmetic, evaluating `x + 2` doesn\'t change `x`. It only produces a result. Only the assignment `=` changes the state.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Notebook "Time Travel"',
        body: 'In a real notebook, you can run cells out of order (e.g., Run Cell 3, then Cell 1). This "Time Travels" the state and is the #1 cause of bugs in data science. Always try to "Run All" to ensure your logic works from top to bottom.',
      },
    ],
    visualizations: [],
  },

  mentalModel: [
    'Predict → Run → Reconcile: Always guess the state before executing.',
    'Evaluation computes values; Execution updates state.',
    'Variable names are independent bindings to snapshots.',
    'Sequence matters: Names must exist before use.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}
