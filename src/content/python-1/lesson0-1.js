export default {
  id: 'py-0-1',
  slug: 'notebook-basics',
  chapter: 0.1,
  order: 1,
  title: 'Environment: The Notebook Model',
  subtitle: 'Understanding your tool before you learn the language',
  tags: ['environment', 'notebook', 'kernel', 'execution', 'reproducibility'],

  hook: {
    question: 'Before you write a single line of Python — what is a notebook, and why does the order you run cells matter?',
    realWorldContext:
      'Every data scientist at Google, Netflix, or a research lab works in a notebook. ' +
      'Before you learn Python syntax, you need to understand the environment you\'re working in. ' +
      'A notebook is not just a text editor — it has a memory model, an execution order, and rules for reproducibility. ' +
      'Getting this wrong is the most common source of "it worked on my machine" bugs in data science. ' +
      'In this chapter, you run pre-written cells and observe how the system behaves. No typing yet.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A **notebook** is a document made of **cells** — boxes that hold code. Nothing happens until you run a cell. The notebook never executes on its own.',

      'Behind the cells is the **kernel**: the Python process that actually runs your code. Every cell shares the same kernel. When a cell runs, it deposits its results into the kernel\'s memory. Other cells can use those results — but only after the cell that creates them has run.',

      'Your job in this chapter: press ▶ Run on each cell, in order, and read the prose above each one. All the code is pre-written. You are learning the tool, not the language.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Shift+Enter',
        body: 'Shift+Enter runs the current cell and moves to the next one. It\'s the fastest way to advance through a notebook.',
      },
      {
        type: 'insight',
        title: 'The [n] Counter',
        body: 'The number in brackets next to each cell (In [1], In [2]...) is the execution counter. It shows when that cell ran in this session — not its position in the document. [*] means the cell is currently running.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Chapter 0.1 — Guided Notebook Tour',
        mathBridge: 'Every cell is pre-written. Read the box above each cell, then press Run. Some cells ask you to run them in a specific order — that is the experiment.',
        caption: 'Run each cell with ▶ Run or Shift+Enter.',
        props: {
          initialCells: [

            // ── CELL 1: What is a cell? ──────────────────────────────────────
            {
              id: 1,
              cellTitle: 'Cell 1 of 17 — What is a cell?',
              prose: 'This box is a cell. It contains code. Press ▶ Run now.\n\nWhat to observe: output appears directly below, and the [n] counter updates to [1]. Before you ran it, the counter was empty — the notebook was waiting for you.',
              code: '2 + 3',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 2: Last expression wins ─────────────────────────────────
            {
              id: 2,
              cellTitle: 'Cell 2 of 17 — Multiple lines, one output',
              prose: 'A cell can have many lines. All of them execute top-to-bottom. Without print(), only the last expression is shown as output — the others run silently.\n\nWhat to observe: three expressions below, but only one number appears.',
              code: [
                '10 * 10    # runs — result discarded (not the last line)',
                '50 + 50    # runs — result discarded (not the last line)',
                '7 * 6      # runs — this IS the last expression → shown as output',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 3: Import ───────────────────────────────────────────────
            {
              id: 3,
              cellTitle: 'Cell 3 of 17 — Importing a library',
              prose: 'Python has thousands of libraries — pre-built collections of tools. "import" loads one into the kernel\'s memory. We are loading NumPy: the foundational numerical computing library used by nearly every data scientist.\n\nWhat to observe: importing is silent. No output appears. But the library is now in kernel memory — you will see it used in Cell 5.',
              code: [
                'import numpy as np',
                '',
                '# Confirm it loaded — ask for the value of π:',
                'np.pi',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 4: NameError (intentional) ─────────────────────────────
            {
              id: 4,
              cellTitle: 'Cell 4 of 17 — The kernel only knows what you\'ve run',
              prose: 'The kernel\'s memory starts empty. It only contains what cells you have actually run.',
              instructions: 'Run THIS cell first (before Cell 5).\nYou will see a red NameError — that error is the lesson.\nThen run Cell 5, and come back and run this cell again.',
              code: 'radius * 2',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 5: Deposit into kernel ──────────────────────────────────
            {
              id: 5,
              cellTitle: 'Cell 5 of 17 — Depositing state into the kernel',
              prose: 'Running this cell stores the name "radius" in kernel memory. After it runs, Cell 4 can use it.\n\nWhat to observe: run this cell, then go back and run Cell 4 again. The NameError disappears — because "radius" now exists in the kernel. This is the whole shared-memory model.',
              code: [
                'radius = 7',
                '',
                '# Area of a circle = π × r²',
                '# Uses "radius" defined above AND "np" loaded in Cell 3',
                'np.pi * radius ** 2',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 6: [n] counter experiment Part A ───────────────────────
            {
              id: 6,
              cellTitle: 'Cell 6 of 17 — Execution order experiment (Part A)',
              prose: 'The [n] counter tracks when a cell ran, not where it sits in the document.',
              instructions: 'Run Cell 7 (below) FIRST.\nThen come back and run this cell.\nCompare the [n] counters — Cell 7\'s number should be lower than Cell 6\'s, even though Cell 6 is above Cell 7 in the document.',
              code: '"Cell 6: I ran second in this experiment"',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 7: [n] counter experiment Part B ───────────────────────
            {
              id: 7,
              cellTitle: 'Cell 7 of 17 — Execution order experiment (Part B)',
              instructions: 'Run THIS cell before Cell 6 above.\nThen compare the [n] counters on both cells.',
              code: '"Cell 7: I ran first in this experiment"',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 8: Run All ──────────────────────────────────────────────
            {
              id: 8,
              cellTitle: 'Cell 8 of 17 — Reproducibility: Run All',
              prose: 'The out-of-order experiments left the kernel in an unpredictable state. This is the most common source of notebook bugs.\n\nThe fix is "Run All" — it runs every cell in document order from a clean start. After Run All, the [n] counters read 1, 2, 3 ... in order. The kernel is now in a guaranteed, reproducible state.\n\nRule: always Run All before sharing or submitting a notebook.',
              instructions: 'Click ▶ Run All in the notebook header above.\nWatch every cell execute in document order.\nConfirm the [n] counters now go 1, 2, 3, 4, 5, 6, 7, 8.',
              code: '"Chapter 0.1 complete — you understand the notebook model."',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 9: Kernel restart ───────────────────────────────────────
            {
              id: 9,
              cellTitle: 'Cell 9 of 17 — When the kernel restarts',
              prose: 'Refreshing the page or clicking "Restart Kernel" wipes everything. Every variable, every import, every computed value — gone. The kernel starts fresh as if no cell has ever run.\n\nThis is both a danger and a feature. The danger: you lose all state and must re-run everything. The feature: it gives you a guaranteed clean slate — the only way to be certain your notebook runs correctly from scratch.\n\nWhat to observe: after a kernel restart, the [n] counters all go blank. Run this cell — it should give a NameError because "radius" no longer exists.',
              instructions: 'Refresh the page (or use Restart Kernel if available).\nThen try to run this cell without running Cell 5 first.',
              code: [
                '# After a restart, this will raise NameError: name "radius" is not defined',
                '# because Cell 5 has not run in this new session',
                'radius',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 10: Out-of-order bug ────────────────────────────────────
            {
              id: 10,
              cellTitle: 'Cell 10 of 17 — Running out of order causes bugs',
              prose: 'Here is a concrete out-of-order bug. These two cells depend on each other — but only if run in the right order.\n\nThe "result" variable is used in Cell 10, but defined in Cell 11 (below). If you run Cell 10 first, you get a NameError. If you run Cell 11 first, then Cell 10, it works.\n\nThis is the core danger of notebooks: you can create a state where the notebook only works because of a specific, non-obvious run order.',
              instructions: 'Run THIS cell first. Observe the NameError.\nThen run Cell 11 below, then re-run this cell.\nThis is what "out of order" means in practice.',
              code: [
                '# This uses "result" — which is defined in the NEXT cell',
                '# Running this first will fail',
                'result * 2',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 11: Out-of-order fix ────────────────────────────────────
            {
              id: 11,
              cellTitle: 'Cell 11 of 17 — The dependency that Cell 10 needs',
              prose: 'This cell defines "result". After you run it, Cell 10 above will work — but only because you ran this cell manually. A reader following the notebook top-to-bottom would hit the NameError at Cell 10 before reaching Cell 11.\n\nThis is a broken notebook. Run All would expose the bug by running cells in document order.',
              code: [
                'result = 100',
                'result',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 12: Run All as reproducibility ──────────────────────────
            {
              id: 12,
              cellTitle: 'Cell 12 of 17 — "Run All" is the reproducibility tool',
              prose: '"Run All" does two things simultaneously: it resets the kernel to a clean state, and it runs every cell in document order. This combination is what makes a notebook reproducible.\n\nA notebook passes the reproducibility test if and only if "Run All" completes without errors. If it does, anyone — on any machine — can open the notebook and reproduce your results exactly.\n\nIf Run All fails, the notebook is broken, even if it "works" when you run cells manually in some special order.',
              instructions: 'Run All now. Notice that Cell 10 causes an error — because result is defined after it is used. This is the bug that Run All reveals.',
              code: '"Run All exposes order dependencies that manual execution hides."',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 13: Cell order vs execution order ───────────────────────
            {
              id: 13,
              cellTitle: 'Cell 13 of 17 — Cell position vs execution order',
              prose: 'Two different things determine when code runs:\n\n**Position in document** — the cell\'s location in the notebook file. Cell 1 is at the top, Cell 17 is at the bottom. This is fixed.\n\n**Execution order** — the sequence you actually ran the cells. Shown by the [n] counter. This is whatever you chose to do.\n\nThese two orderings can diverge — and when they do, you get hard-to-debug state bugs. "Run All" forces them to match.',
              code: [
                '# The [n] counter on THIS cell shows when it ran',
                '# If you ran Cell 7 before Cell 6, those [n] values reflect that',
                '# Position in the notebook never changes — [n] always can',
                '"Position is fixed. Execution order is a choice."',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 14: Output display ──────────────────────────────────────
            {
              id: 14,
              cellTitle: 'Cell 14 of 17 — What output looks like',
              prose: 'When Python evaluates the last expression in a cell, the result is shown directly below the cell in an output area. Different types of values look different:\n\n- Numbers appear as plain digits: `42`, `3.14`\n- Strings appear with quotes: `\'hello\'`\n- Booleans appear as words: `True`, `False`\n\nThe output area is cleared and replaced each time you run the cell.',
              code: [
                '# Run each one separately to see how each type appears:',
                '# 42',
                '# 3.14',
                '# "hello"',
                '# True',
                '',
                '# Currently showing:',
                '"hello, I am a string — notice the quotes in the output"',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 15: SyntaxError ─────────────────────────────────────────
            {
              id: 15,
              cellTitle: 'Cell 15 of 17 — SyntaxError: what a broken cell looks like',
              prose: 'If a cell contains invalid Python syntax, the kernel refuses to run it and shows a SyntaxError in the output area. The error message tells you which line is wrong and often points directly at the problem.\n\nImportant: a SyntaxError in one cell does not affect other cells. The rest of the notebook still works. Fix the syntax and re-run.',
              instructions: 'Run this cell. Read the SyntaxError. Then fix the code (remove one of the extra parentheses) and run again.',
              code: [
                '# This line has a syntax error — an unmatched parenthesis',
                '(2 + 3',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 16: [*] indicator ───────────────────────────────────────
            {
              id: 16,
              cellTitle: 'Cell 16 of 17 — The [*] indicator: a cell is running',
              prose: 'When a cell is actively executing, its counter shows `[*]` instead of a number. For fast computations (like everything in this chapter), you will rarely see it — the cell finishes before you notice.\n\nFor slow computations — loading large datasets, training models, running long loops — `[*]` is visible and important. While a cell shows `[*]`, the kernel is busy. You can run other cells, but they will queue up and wait.\n\nIf `[*]` stays forever, the kernel may be stuck. Refresh the page to restart.',
              code: [
                '# Simulate a slow cell with a brief pause',
                'import time',
                'time.sleep(2)   # wait 2 seconds',
                '"Done — you may have seen [*] briefly"',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 17: Markdown cells vs code cells ────────────────────────
            {
              id: 17,
              cellTitle: 'Cell 17 of 17 — Markdown cells vs code cells',
              prose: 'Notebooks have two kinds of cells: **code cells** (everything you have been running) and **markdown cells** (formatted text).\n\nThe prose you have been reading above each cell — that is markdown. It is not Python. It is a simple text format that renders as formatted text with headers, bold, bullet points, and more.\n\nMarkdown cells have no [n] counter. They never "run" in the code sense — they just render their text. They exist to explain the code around them. In real notebooks, scientists alternate: a markdown cell describing the next analysis, then a code cell doing it.',
              instructions: 'This entire lesson is displayed in code cells for interactivity. In a real Jupyter notebook, the prose boxes you see here would be markdown cells sitting above each code cell.',
              code: [
                '# This is a code cell — it runs Python',
                '# The prose ABOVE this cell would be a markdown cell in Jupyter',
                '',
                '"Code cells run Python. Markdown cells display formatted text."',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGE 1: Produce the value 42 ────────────────────────────
            {
              id: 21,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Produce the Value 42',
              difficulty: 'easy',
              prompt: 'Write a single expression that produces the output `42`. It can be the literal number, an arithmetic expression, or any combination — as long as the output is exactly the integer 42.',
              instructions: 'Your cell output should show: 42',
              code: '# Write your expression here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = _
if result == 42:
    res = "SUCCESS: Your expression evaluates to 42."
else:
    res = "ERROR: Expected 42, got " + str(result) + ". Make sure the last expression in your cell equals 42."
res
`,
              hint: 'The simplest answer is just the literal `42`. But you could also write `40 + 2` or `6 * 7`.',
            },

            // ── CHALLENGE 2: Two-cell state dependency ────────────────────────
            {
              id: 22,
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Two-Cell State Dependency',
              difficulty: 'easy',
              prompt: 'Run a two-step cell sequence: first, assign `x = 10`. Then, in a second run of this cell, use `x` in an expression. Specifically, write a cell that produces `x + 5`, where `x` was assigned to 10 in a previous step.\n\nFor this challenge, the cell below already assigns x and uses it. Run it as-is and verify the output is 15.',
              instructions: 'Run the cell. The output should be 15.',
              code: [
                'x = 10',
                'x + 5',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = _
if result == 15:
    res = "SUCCESS: x was 10, x + 5 is 15. State was correctly deposited and used."
else:
    res = "ERROR: Expected 15. Make sure x = 10 and the last expression is x + 5."
res
`,
              hint: 'x is assigned in the first line and used in the second. Both lines execute when you run the cell.',
            },

            // ── CHALLENGE 3: State dependency bug ────────────────────────────
            {
              id: 23,
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'The State Dependency Bug',
              difficulty: 'medium',
              prompt: 'Below are two cells. Cell A uses a variable `score`, and Cell B defines it. If you run Cell A first, you get a NameError. The fix is to run Cell B first.\n\nFor this challenge: the cell below IS Cell B — it defines `score = 95`. Run it, then note that `score` is now in kernel memory and would be available to Cell A.\n\nThe lesson: always trace which cell defines what a later cell needs.',
              instructions: 'Run this cell to deposit `score` into kernel memory. After running, `score` will be accessible from any subsequent cell.',
              code: [
                '# Cell B — defines the variable',
                'score = 95',
                '',
                '# This is the fix: run the definition cell BEFORE the cell that uses it',
                'score',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = _
if result == 95:
    res = "SUCCESS: score is 95 and is now in kernel memory. Any cell that uses 'score' will work."
else:
    res = "ERROR: Expected score to be 95. Make sure score = 95 is assigned and is the last expression."
res
`,
              hint: 'The last expression in this cell is `score`, which evaluates to 95. After running, `score` lives in the kernel and other cells can use it.',
            },

            // ── CHALLENGE 4: Which expression appears? ───────────────────────
            {
              id: 24,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Which Expression Appears as Output?',
              difficulty: 'medium',
              prompt: 'A cell has three expressions on three separate lines. Only one value appears in the output. Which one?\n\nWrite a cell with these three lines and run it:\n```\n10 + 10\n5 * 5\n100 - 1\n```\nBefore running: predict which value will appear. Then verify.',
              instructions: 'Write the three-line cell and run it. The output should be 99.',
              code: [
                '10 + 10',
                '5 * 5',
                '100 - 1',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = _
if result == 99:
    res = "SUCCESS: Only the last expression (100 - 1 = 99) appears as output. The first two ran but their results were discarded."
else:
    res = "ERROR: Expected 99. Remember — only the last expression in a cell produces visible output."
res
`,
              hint: 'Without print(), only the last expression in a cell is displayed. The first two expressions execute but their results are silently discarded.',
            },

            // ── CHALLENGE 5: Predict each step (compound) ────────────────────
            {
              id: 25,
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Compound: Predict Each Step',
              difficulty: 'hard',
              prompt: 'This challenge uses both the notebook model and values (from Chapter 0.2).\n\nA variable `x` is assigned, then used, then reassigned. Run the cell below and predict what the final output will be before running.\n\nTrace through:\n1. `x = 5` — x is now 5\n2. `x = x + 3` — x is now 5 + 3 = 8\n3. `x * 2` — evaluates to 16, and since it\'s the last expression, it appears as output\n\nPrediction: what is the final output?',
              instructions: 'Predict the output, then run. Verify your prediction.',
              code: [
                'x = 5',
                'x = x + 3',
                'x * 2',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = _
if result == 16:
    res = "SUCCESS: x started at 5, was reassigned to 8, then x * 2 = 16 appeared as output. Each step built on the last."
else:
    res = "ERROR: Expected 16. Trace: x=5, x=x+3 gives x=8, x*2 gives 16. Only the last expression is shown."
res
`,
              hint: 'Assignment lines (x = ...) produce no output. Only the last expression `x * 2` produces output. Trace the value of x at each step.',
            },

          ],
        },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },

  rigor: {
    prose: [
      '**Kernel lifecycle**: the kernel starts when the page loads and resets on refresh. Every import, variable, and result accumulates in kernel memory until the reset. A fresh kernel has no memory — you must re-run cells to rebuild state.',
      '**NameError as signal**: a NameError means precisely one thing — you are referencing a name that has never been deposited into the kernel in this session. The fix is always: run the cell that defines that name first.',
      '**Reproducibility rule**: a notebook is reproducible if and only if running all cells top-to-bottom from a fresh kernel produces the correct result. Any notebook that only works because of a specific run order is considered broken.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Kernel',
        body: 'The kernel is the Python process behind the notebook. It holds all variables, imports, and computed values in memory. All cells share one kernel. Refreshing the page kills the kernel and wipes all memory.',
      },
    ],
    visualizations: [],
  },

  examples: [],
  challenges: [],
  semantics: { core: [] },

  spiral: {
    recoveryPoints: [
      'If a cell shows [*] permanently, the kernel is stuck. Refresh the page and Run All.',
      'If you get a NameError, run all cells above the failing one first.',
    ],
    futureLinks: [
      'Chapter 0.2 begins with values and expressions — you saw expressions here (2 + 3). Next you learn exactly what they are.',
      'The "import numpy as np" pattern from Cell 3 appears in every lesson from Phase 2 onward.',
      'Variables (Cell 5: radius = 7) are explained properly in Chapter 0.2 Lesson 5.',
    ],
  },

  assessment: {
    questions: [
      {
        id: 'q1',
        text: 'You write code in a cell but do not press Run. Does the kernel update?',
        options: ['Yes — writing code updates the kernel immediately', 'No — the kernel only sees code after you run the cell', 'Only if you press Save first'],
        correct: 1,
      },
      {
        id: 'q2',
        text: 'Cell 7 is below Cell 6 in the document. You run Cell 7 first. Cell 7\'s [n] counter shows:',
        options: ['[7] — it is the seventh cell', '[1] — it was the first cell run in this session', 'An error — you cannot run out of order'],
        correct: 1,
      },
      {
        id: 'q3',
        text: 'What does "Run All" do?',
        options: ['Saves the notebook', 'Runs all cells in document order, guaranteeing a reproducible state', 'Checks for syntax errors without running'],
        correct: 1,
      },
      {
        id: 'q4',
        text: 'Cell 5 defines "radius". Cell 4 uses "radius". You run Cell 4 before Cell 5. What happens?',
        options: ['Cell 4 uses 0 as a default', 'Cell 4 raises a NameError — radius is not in the kernel yet', 'Cell 4 automatically runs Cell 5 first'],
        correct: 1,
      },
    ],
  },

  mentalModel: [
    'A cell runs when you tell it to — not when you write it.',
    'All cells share one kernel. State persists between cells.',
    'The [n] counter shows execution order, not document position.',
    'NameError = this name was never deposited into the kernel.',
    '"Run All" is the reproducibility guarantee.',
    'Kernel restart wipes all memory — every cell must be re-run to rebuild state.',
    'A SyntaxError in one cell does not break other cells.',
    '[*] means the cell is currently executing.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}
