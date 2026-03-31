export default {
  id: 'py-0-1',
  slug: 'notebook-basics',
  chapter: 0.1,
  order: 1,
  title: 'Environment: The Notebook Model',
  subtitle: 'Cells, state, and the flow of computation',
  tags: ['basics', 'python', 'environment', 'print', 'variables'],

  hook: {
    question: 'Why do data scientists use notebooks instead of regular scripts?',
    realWorldContext:
      'A notebook is a live document — part lab journal, part calculator. Every block of code is a "cell" you can run one at a time, see results immediately, and experiment freely. ' +
      'This is how real data scientists explore data at companies like Google, Netflix, and OpenAI. ' +
      'Before we write algorithms or visualize data, we need to understand the execution model that makes all of it possible.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      '**The core idea:** a notebook is a sequence of cells. Each cell is a unit of code you can run independently. ' +
      'When you run a cell, its output appears directly below it — no separate terminal needed.',

      'Two things make notebooks powerful and dangerous at the same time: ' +
      '(1) **Shared memory** — all cells share the same Python kernel, so a variable defined in cell 1 is available in cell 3. ' +
      '(2) **Order dependency** — the kernel only knows about cells you have actually run, in the order you ran them.',

      'A notebook is NOT a static document. It is a living computation. ' +
      'If you go back and change cell 1, you must re-run it for the change to take effect everywhere else.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The Kernel: Python\'s Brain',
        body: 'The kernel is the hidden Python process behind your notebook. Every cell you run deposits its results into the kernel\'s memory. ' +
              'Think of it like a whiteboard — you can write on it, erase parts, and everything written so far is visible to new code.',
      },
      {
        type: 'warning',
        title: 'Order Matters More Than Position',
        body: 'The kernel tracks execution order, not cell position. ' +
              'If you run cell 3 before cell 1, the kernel has cell 3\'s variables but not cell 1\'s — even though cell 1 appears first in the document. ' +
              '"Run All" from top to bottom is the safe reset.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'The Notebook Lab — Learn by Doing',
        mathBridge: 'Work through these cells in order. Each one builds on the last to demonstrate the execution model.',
        caption: 'Run each cell using the ▶ Run button or Shift+Enter. Watch how variables from earlier cells are available in later ones.',
        props: {
          initialCells: [
            // ── DEMO: First output ─────────────────────────────────────────────
            {
              id: 1,
              code: [
                '# DEMO: Your first cell',
                '# Press ▶ Run (or Shift+Enter) to execute this cell.',
                '# The output appears directly below.',
                '',
                'print("Welcome to open-calc!")',
                'print("Python is running live in your browser.")',
                'print("Every line inside print() becomes a line of output.")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGE 1: Write — print something ───────────────────────────
            {
              id: 2,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Your First Output',
              difficulty: 'easy',
              prompt:
                'Write a print() statement that outputs your name. ' +
                'For example, if your name is Alex, output: My name is Alex',
              code: '# Write your print() statement below:\n\n',
              output: '', status: 'idle', figureJson: null,
              testCode: [
                '# Auto-pass: if your code runs without an error, you succeed.',
                'True',
              ].join('\n'),
              hint: 'Use print("My name is ...") — text inside quotes is a string. ' +
                    'Strings can contain spaces, punctuation, and letters.',
            },

            // ── DEMO: Variables ────────────────────────────────────────────────
            {
              id: 3,
              code: [
                '# DEMO: Variables store values in the kernel\'s memory.',
                '# Once a cell runs, its variables are available to ALL later cells.',
                '',
                'temperature = 98.6        # float (decimal number)',
                'city = "San Francisco"    # str (text)',
                'is_sunny = True           # bool (True/False)',
                '',
                'print(f"In {city}, it is {temperature}°F and sunny: {is_sunny}")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGE 2: Fill-in — create variables ────────────────────────
            {
              id: 4,
              challengeType: 'fill-in',
              challengeNumber: 2,
              challengeTitle: 'Store Your Info',
              difficulty: 'easy',
              prompt:
                'Copy the starter code into the cell, then fill in the blanks. ' +
                'Store your name, age, and whether you have studied Python before.',
              starterBlock: [
                'my_name = ___       # your name as a string, e.g. "Sam"',
                'my_age  = ___       # your age as a whole number, e.g. 20',
                'studied_python = ___ # True or False',
                '',
                'print(f"Name: {my_name}, Age: {my_age}, Studied before: {studied_python}")',
              ].join('\n'),
              code: '# Paste the starter code here and fill in the blanks.\n\n',
              output: '', status: 'idle', figureJson: null,
              testCode: [
                'assert "my_name" in dir(), "Define my_name first."',
                'assert "my_age" in dir(), "Define my_age first."',
                'assert "studied_python" in dir(), "Define studied_python first."',
                'assert isinstance(my_name, str) and len(my_name) > 0, \\',
                '    f"my_name must be a non-empty string, got {type(my_name).__name__}"',
                'assert isinstance(my_age, int) and my_age > 0, \\',
                '    f"my_age must be a positive integer, got {my_age!r}"',
                'assert isinstance(studied_python, bool), \\',
                '    f"studied_python must be True or False, got {type(studied_python).__name__}"',
                '"SUCCESS: All three variables are set correctly!"',
              ].join('\n'),
              hint: 'Strings need quotes: my_name = "Alex". ' +
                    'Integers do not: my_age = 20. ' +
                    'Booleans are exactly True or False (capital T/F, no quotes).',
            },

            // ── DEMO: Order dependency ─────────────────────────────────────────
            {
              id: 5,
              code: [
                '# DEMO: Variables from earlier cells are available here.',
                '# Run cells 3 and 4 before this one, or you will see a NameError.',
                '',
                '# "my_name" was defined in Challenge 2 (cell 4).',
                '# "city" was defined in the Demo above (cell 3).',
                '',
                'print(f"Hello {my_name}! You are visiting {city} today.")',
                'print(f"Your age is {my_age}. In 10 years you will be {my_age + 10}.")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGE 3: Write — arithmetic with variables ─────────────────
            {
              id: 6,
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Compute and Print',
              difficulty: 'easy',
              prompt:
                'Define two numeric variables called a and b (any values you like). ' +
                'Then compute their sum, difference, and product, storing each in a new variable. ' +
                'Print all five values.',
              code: '# Define a and b, then compute sum, difference, and product.\n\n',
              output: '', status: 'idle', figureJson: null,
              testCode: [
                'assert "a" in dir() and "b" in dir(), "Define variables a and b."',
                'assert isinstance(a, (int, float)), f"a must be a number, got {type(a).__name__}"',
                'assert isinstance(b, (int, float)), f"b must be a number, got {type(b).__name__}"',
                '"SUCCESS: a and b are defined. Check your output looks correct!"',
              ].join('\n'),
              hint: [
                'Example structure:',
                '  a = 12',
                '  b = 4',
                '  total = a + b',
                '  diff  = a - b',
                '  prod  = a * b',
                '  print(total, diff, prod)',
              ].join('\n'),
            },

            // ── CHALLENGE 4: Write — out-of-order trap ─────────────────────────
            {
              id: 7,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'The Out-of-Order Trap',
              difficulty: 'medium',
              prompt:
                'This challenge builds intuition for why order matters.\n\n' +
                '1. Run this cell: it sets counter = 1.\n' +
                '2. Click "+ Add cell" and write: counter = counter + 1\n' +
                '3. Run your new cell several times.\n' +
                '4. Come back here and change counter = 1 to counter = 100, ' +
                'but do NOT re-run this cell yet.\n' +
                '5. Run your new cell again. Is the result what you expected?\n\n' +
                'Set counter = 0 in this cell to begin.',
              code: '# Step 1: Run this cell to initialise counter.\ncounter = 0\nprint(f"counter is now {counter}")\n',
              output: '', status: 'idle', figureJson: null,
              testCode: [
                'assert "counter" in dir() and isinstance(counter, int), \\',
                '    "counter must be an integer."',
                '"SUCCESS: counter is set. Now experiment with the out-of-order pattern!"',
              ].join('\n'),
              hint: 'The kernel only updates counter when you run the cell that defines it. ' +
                    'Editing the source does not change memory until the cell is executed.',
            },
          ],
        },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },

  rigor: {
    prose: [
      '**Kernel lifecycle:** the kernel is born when the notebook loads and dies when you refresh the page. ' +
      'Every variable, import, and function definition lives in the kernel\'s namespace until that moment.',

      '**Reproducibility rule:** a notebook is only reproducible if running all cells top-to-bottom produces the same result every time. ' +
      'This means: no cell should depend on variables defined in cells that come after it in the document.',

      '**The execution counter:** the [n] label next to each cell is the execution counter — it tells you the order cells were actually run, ' +
      'not their position in the document. If [3] appears before [1] in the document, something ran out of order.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Always use Run All before sharing',
        body: 'Before handing a notebook to anyone, click "Run All" to verify it works from a clean state. ' +
              'Hidden state from out-of-order execution is the #1 source of "works on my machine" bugs in data science.',
      },
    ],
    visualizations: [],
  },

  examples: [],
  challenges: [],
  semantics: { core: [] },
  spiral: {
    recoveryPoints: [
      'If a cell throws NameError, run all cells above it first.',
      'If behaviour seems wrong, restart the kernel (refresh) and Run All.',
    ],
    futureLinks: [
      'In Chapter 0.2 we fill these variables with structured types: int, float, str, bool.',
      'In Phase 2 we import NumPy and the kernel state grows to include array objects.',
    ],
  },
  assessment: {
    questions: [
      {
        id: 'q1',
        text: 'You edit cell 1 to change a variable. Without re-running cell 1, does the change appear in cell 3?',
        options: ['Yes — editing updates memory immediately', 'No — the kernel only sees the old value', 'Only if cell 3 is above cell 1'],
        correct: 1,
      },
      {
        id: 'q2',
        text: 'What does print("hello") do?',
        options: ['Stores "hello" in a variable', 'Sends "hello" to the output area', 'Creates a file called hello'],
        correct: 1,
      },
    ],
  },
  mentalModel: [
    'A notebook is a sequence of cells sharing one kernel (memory).',
    'Variables only exist in memory after their cell has been run.',
    '"Run All" is the safe reset — it guarantees top-to-bottom order.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}
