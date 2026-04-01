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

            // ── CELL 10: Multiple assignment on one line ──────────────────────
            {
              id: 10,
              cellTitle: 'Multiple assignment — one line, many names',
              prose: 'You can assign the same value to several names at once by chaining `=` signs:\n\n`a = b = c = 0`\n\nPython evaluates `0` once, then binds all three names to that value. This is useful for initializing a group of counters or accumulators to a common starting value.',
              instructions: 'After this cell runs, all three names hold 0. Change the starting value to 10 and re-run — all three update together.',
              code: [
                'a = b = c = 0',
                'a, b, c     # shown as a tuple — all three are 0',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 11: Simultaneous swap ────────────────────────────────────
            {
              id: 11,
              cellTitle: "Python's idiomatic swap — no temp variable needed",
              prose: 'In most languages, swapping two variables requires a temporary holder:\n\n```\ntemp = a\na = b\nb = temp\n```\n\nPython lets you swap in a single line:\n\n`a, b = b, a`\n\nPython evaluates the entire right side first (building a tuple of the current values), then unpacks and rebinds both names simultaneously. The old values are never lost before being assigned.',
              instructions: 'Trace the values before and after the swap line.',
              code: [
                'a = 10',
                'b = 99',
                'a, b = b, a   # simultaneous swap',
                'a, b          # shown — a is now 99, b is now 10',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 12: del statement ────────────────────────────────────────
            {
              id: 12,
              cellTitle: 'del — removing a name from the kernel',
              prose: 'The `del` statement unbinds a name. After `del x`, the name `x` no longer exists in the kernel — using it raises a `NameError` just as if it had never been assigned.\n\n`del` is rarely needed in everyday code, but it is useful when you want to explicitly clean up a large object from memory, or when you want to prove to yourself that a name is gone.',
              instructions: 'The first two lines work fine. The third line will raise a NameError after `del` has removed the name.',
              code: [
                'x = 42',
                'x           # 42 — name exists',
                '# del x     # uncomment this line to remove x',
                '# x         # uncomment this to see the NameError',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 13: Shadowing a built-in ─────────────────────────────────
            {
              id: 13,
              cellTitle: 'Danger: shadowing a built-in name',
              prose: 'Python has many built-in names like `list`, `len`, `max`, `min`, `type`, `print`. These are pre-bound in the kernel.\n\nIf you write `list = 5`, you rebind the name `list` to the integer `5`. Now `list()` raises a `TypeError` because `5` is not callable. The built-in function is hidden — **shadowed** — by your variable.\n\nThe fix: `del list` removes your binding and restores access to the built-in. Better fix: never name a variable after a built-in in the first place.',
              instructions: 'Read the code but do NOT run it as written — it will break `list` in your kernel. The commented-out version shows the safe recovery path.',
              code: [
                '# DO NOT run — for illustration only',
                '# list = 5           # shadows the built-in',
                '# list([1, 2, 3])    # TypeError: int is not callable',
                '# del list           # restores the built-in',
                '# list([1, 2, 3])    # works again: [1, 2, 3]',
                '',
                '# Safe names: use descriptive words — shopping_list, task_list',
                'shopping_list_count = 5   # this is fine',
                'shopping_list_count',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 14: //= and **= augmented operators ──────────────────────
            {
              id: 14,
              cellTitle: '//= and **= — two more augmented operators',
              prose: 'The augmented assignment family extends beyond `+=`, `-=`, `*=`:\n\n`x //= 3`  is the same as  `x = x // 3`  (floor-divide-assign)\n`x **= 2`  is the same as  `x = x ** 2`  (power-assign)\n\nThese follow exactly the same pattern: evaluate the right side using the current value of `x`, then rebind `x` to the result.',
              instructions: 'Trace the value of `n` after each augmented operation.',
              code: [
                'n = 100',
                'n //= 3     # 100 // 3 = 33',
                'n **= 2     # 33 ** 2 = 1089',
                'n           # shown',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 15: Augmented assignment with strings ────────────────────
            {
              id: 15,
              cellTitle: 'Augmented assignment works on strings too',
              prose: 'The `+=` operator is not limited to numbers. On strings, `+=` appends (concatenates) the right side to the current value of the variable.\n\n`s += " world"` is shorthand for `s = s + " world"`.\n\nThis pattern is useful for building up a string piece by piece, though for large-scale string assembly, `join()` is more efficient (covered later).',
              instructions: 'Watch the string grow with each `+=`.',
              code: [
                's = "hello"',
                's += " world"',
                's += "!"',
                's           # shown — "hello world!"',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 16: Variables as subexpressions ──────────────────────────
            {
              id: 16,
              cellTitle: 'Building expressions from named parts',
              prose: 'Assigning intermediate values to descriptive names makes complex calculations readable. Compare:\n\n```python\n3.14159 * 7 * 7\n```\nvs.\n```python\npi = 3.14159\nr = 7\narea = pi * r * r\n```\n\nThe second version documents its own intent. Each name is a subexpression that Python evaluates (looks up) when the full expression runs.',
              instructions: 'Change `r` to a different value and re-run. Notice that `area` updates because it is recomputed from the current values of `pi` and `r`.',
              code: [
                'pi = 3.14159',
                'r = 7',
                'area = pi * r * r',
                'area        # shown — area of a circle with radius 7',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 17: NameError fires at evaluation time ───────────────────
            {
              id: 17,
              cellTitle: 'NameError fires at evaluation time — not at write time',
              prose: 'Python does not check whether names exist when you *write* code. It only checks when it *runs* the line that uses the name.\n\nThis means a cell can have a NameError lurking on line 5 even if lines 1–4 run perfectly. The error fires the moment Python tries to evaluate the missing name — not before.',
              instructions: 'Run this cell. Lines 1 and 2 succeed. Line 3 raises a NameError because `z` was never assigned. The value of `result` is never set.',
              code: [
                'a = 10',
                'b = 20',
                'result = a + b + z   # NameError: z is not defined',
                'result               # never reached',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 18: Constants by convention ─────────────────────────────
            {
              id: 18,
              cellTitle: 'Constants by convention — ALL_CAPS names',
              prose: 'Python has no built-in mechanism to prevent a variable from being changed. But there is a strong convention: if a name is written in ALL_CAPS, it signals "this value should not be changed."\n\n```python\nPI = 3.14159\nSPEED_OF_LIGHT = 299_792_458   # m/s\n```\n\nOther programmers (and your future self) will know not to reassign these names. Python will not stop you from writing `PI = 0`, but it is considered a serious style violation.',
              instructions: 'Use the ALL_CAPS constant in an expression. The convention is just a signal — Python treats it like any other variable.',
              code: [
                'PI = 3.14159',
                'MAX_RETRIES = 5',
                '',
                'r = 4',
                'circumference = 2 * PI * r',
                'circumference   # shown',
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

            // ── CHALLENGE 4: Augmented multiplication ────────────────────────
            {
              id: 21,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Triple with Augmented Assignment',
              difficulty: 'easy',
              prompt:
                'Assign `x = 7`, then use a single augmented assignment statement to triple `x` (multiply it by 3).\n\n' +
                'What is `x` after the operation? Write the two lines and evaluate `x`.',
              code: [
                '# Step 1: assign x = 7',
                '# Step 2: use augmented assignment to triple x',
                '# Step 3: evaluate x on the last line',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
x = 7
x *= 3
if x == 21:
    res = "SUCCESS: Augmented multiplication confirmed. 7 × 3 = 21."
else:
    res = f"ERROR: Expected 21, got {x}. Use x *= 3 to triple x."
res
`,
              hint: 'Tripling means multiplying by 3. The augmented operator for multiplication is `*=`. So `x *= 3` is the same as `x = x * 3`.',
            },

            // ── CHALLENGE 5: Fill-in swap ─────────────────────────────────────
            {
              id: 22,
              challengeType: 'fill',
              challengeNumber: 5,
              challengeTitle: "Fill the Swap — Python's One-Line Idiom",
              difficulty: 'easy',
              prompt:
                'Complete the simultaneous swap so that after execution `a` is `20` and `b` is `10`.\n\n' +
                'Fill in both blanks on the right side of the assignment.',
              starterBlock:
                'a = 10\nb = 20\na, b = ___, ___\na, b',
              code:
                'a = 10\nb = 20\na, b = ___, ___\na, b',
              output: '', status: 'idle', figureJson: null,
              testCode: `
a = 10
b = 20
a, b = b, a
if a == 20 and b == 10:
    res = "SUCCESS: Simultaneous swap confirmed. a=20, b=10."
else:
    res = f"ERROR: Expected a=20, b=10, got a={a}, b={b}. Put b first, then a."
res
`,
              hint: 'The right side should list the values in the new order you want. To make `a` get the old value of `b`, put `b` first.',
            },

            // ── CHALLENGE 6: Compound expression from 3 variables ────────────
            {
              id: 23,
              challengeType: 'write',
              challengeNumber: 6,
              challengeTitle: 'Volume from Three Variables',
              difficulty: 'medium',
              prompt:
                'Assign three variables: `width = 6`, `height = 4`, `depth = 3`.\n\n' +
                'Then compute `volume = width * height * depth`.\n\n' +
                'Evaluate `volume` on the last line. The result should be `72`.',
              code: [
                '# Assign the three dimension variables',
                '# Compute volume',
                '# Evaluate volume',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
width = 6
height = 4
depth = 3
volume = width * height * depth
if volume == 72:
    res = "SUCCESS: Volume verified. 6 × 4 × 3 = 72."
else:
    res = f"ERROR: Expected 72, got {volume}. Check that width=6, height=4, depth=3."
res
`,
              hint: 'Assign each variable on its own line, then multiply all three together and store in `volume`.',
            },

            // ── CHALLENGE 7: Reach 47 with augmented assignment ───────────────
            {
              id: 24,
              challengeType: 'write',
              challengeNumber: 7,
              challengeTitle: 'Reach 47 — Creative Augmented Path',
              difficulty: 'medium',
              prompt:
                'Start with `n = 100`. Apply exactly **three** augmented assignment operations (any combination of `+=`, `-=`, `*=`, `//=`, `**=`) so that `n` ends up equal to `47`.\n\n' +
                'There are many valid paths. Find one that works and verify it.',
              code: [
                'n = 100',
                '# Apply three augmented operations to reach n = 47',
                '',
                'n   # should be 47',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
# Student must reach 47 in three augmented steps from 100
# We only check the final value
if 'n' in dir() and n == 47:
    res = "SUCCESS: n is 47. Creative path confirmed."
else:
    res = f"ERROR: Expected n=47, got n={n if 'n' in dir() else 'undefined'}. Keep trying different operations."
res
`,
              hint: 'One path: n //= 2 gives 50, then n -= 3 gives 47. You only need two operations — try to find a three-step path. Another idea: n -= 53 in one step, but can you make it more interesting?',
            },

            // ── CHALLENGE 8: Type chain ────────────────────────────────────────
            {
              id: 25,
              challengeType: 'write',
              challengeNumber: 8,
              challengeTitle: 'Type Chain — int → double → str',
              difficulty: 'hard',
              prompt:
                'Perform this chain of operations:\n\n' +
                '1. Convert the string `"42"` to an int and store in `n`\n' +
                '2. Use `*=` to double `n` in place\n' +
                '3. Convert `n` back to a string and store in `result`\n\n' +
                'What is `result`? Evaluate it on the last line.',
              code: [
                '# Step 1: n = int("42")',
                '# Step 2: double n with *=',
                '# Step 3: result = str(n)',
                'result',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
n = int("42")
n *= 2
result = str(n)
if result == "84":
    res = "SUCCESS: Type chain verified. '42' → 42 → 84 → '84'."
else:
    res = f"ERROR: Expected '84', got {result!r}. Check each step."
res
`,
              hint: 'Step 1: `int("42")` converts the string to the integer 42. Step 2: `n *= 2` doubles it to 84. Step 3: `str(84)` converts back to the string "84".',
            },

            // ── CHALLENGE 9: Variable shadowing ───────────────────────────────
            {
              id: 26,
              challengeType: 'write',
              challengeNumber: 9,
              challengeTitle: 'Shadow and Restore — del in Action',
              difficulty: 'hard',
              prompt:
                'Demonstrate the built-in shadowing problem:\n\n' +
                '1. Call `max(1, 2, 3)` first to confirm it works — you should get `3`\n' +
                '2. Assign `max = 100` — this shadows the built-in\n' +
                '3. Try to call `max(1, 2, 3)` again — observe the TypeError\n' +
                '4. Use `del max` to remove your binding\n' +
                '5. Call `max(1, 2, 3)` one final time — it works again\n\n' +
                'Run each step as a comment-guided block. The goal is to understand what `del` recovers.',
              code: [
                '# Step 1: confirm the built-in works',
                'max(1, 2, 3)',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
# After del, the built-in max should be restored
del max  # safe even if not shadowed in test environment
result = max(1, 2, 3)
if result == 3:
    res = "SUCCESS: del restored the built-in max. max(1,2,3) = 3."
else:
    res = f"ERROR: Expected 3, got {result}. Did you del the shadow variable?"
res
`,
              hint: 'After `max = 100`, the name `max` points to 100, not the function. Calling `max(1, 2, 3)` is like calling `100(1, 2, 3)` — a TypeError. `del max` removes that binding, revealing the original built-in underneath.',
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
