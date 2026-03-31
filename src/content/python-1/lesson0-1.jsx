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
              cellTitle: 'Cell 1 of 8 — What is a cell?',
              prose: 'This box is a cell. It contains code. Press ▶ Run now.\n\nWhat to observe: output appears directly below, and the [n] counter updates to [1]. Before you ran it, the counter was empty — the notebook was waiting for you.',
              code: '2 + 3',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 2: Last expression wins ─────────────────────────────────
            {
              id: 2,
              cellTitle: 'Cell 2 of 8 — Multiple lines, one output',
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
              cellTitle: 'Cell 3 of 8 — Importing a library',
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
              cellTitle: 'Cell 4 of 8 — The kernel only knows what you\'ve run',
              prose: 'The kernel\'s memory starts empty. It only contains what cells you have actually run.',
              instructions: 'Run THIS cell first (before Cell 5).\nYou will see a red NameError — that error is the lesson.\nThen run Cell 5, and come back and run this cell again.',
              code: 'radius * 2',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 5: Deposit into kernel ──────────────────────────────────
            {
              id: 5,
              cellTitle: 'Cell 5 of 8 — Depositing state into the kernel',
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
              cellTitle: 'Cell 6 of 8 — Execution order experiment (Part A)',
              prose: 'The [n] counter tracks when a cell ran, not where it sits in the document.',
              instructions: 'Run Cell 7 (below) FIRST.\nThen come back and run this cell.\nCompare the [n] counters — Cell 7\'s number should be lower than Cell 6\'s, even though Cell 6 is above Cell 7 in the document.',
              code: '"Cell 6: I ran second in this experiment"',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 7: [n] counter experiment Part B ───────────────────────
            {
              id: 7,
              cellTitle: 'Cell 7 of 8 — Execution order experiment (Part B)',
              instructions: 'Run THIS cell before Cell 6 above.\nThen compare the [n] counters on both cells.',
              code: '"Cell 7: I ran first in this experiment"',
              output: '', status: 'idle', figureJson: null,
            },

            // ── CELL 8: Run All ──────────────────────────────────────────────
            {
              id: 8,
              cellTitle: 'Cell 8 of 8 — Reproducibility: Run All',
              prose: 'The out-of-order experiments left the kernel in an unpredictable state. This is the most common source of notebook bugs.\n\nThe fix is "Run All" — it runs every cell in document order from a clean start. After Run All, the [n] counters read 1, 2, 3 ... 8 in order. The kernel is now in a guaranteed, reproducible state.\n\nRule: always Run All before sharing or submitting a notebook.',
              instructions: 'Click ▶ Run All in the notebook header above.\nWatch every cell execute in document order.\nConfirm the [n] counters now go 1, 2, 3, 4, 5, 6, 7, 8.',
              code: '"Chapter 0.1 complete — you understand the notebook model."',
              output: '', status: 'idle', figureJson: null,
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
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}
