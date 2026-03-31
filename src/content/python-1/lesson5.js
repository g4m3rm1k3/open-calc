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
            {
              id: 1,
              cellTitle: 'Rule 1: Independence of Name',
              prose: 'Let\'s test the "Snapshot" rule. If we set `y = x`, does `y` change when `x` changes later?',
              instructions: 'Predict: What is y? Run to reconcile your mental model.',
              code: 'x = 5\ny = x      # y captures the current value of x\nx = 10     # x is rebound, but y is independent\ny',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Rule 2: Evaluation Before Assignment',
              prose: 'Python evaluates the RIGHT side completely before it updates the LEFT side. This is why `x = x + 1` makes sense.',
              instructions: 'Trace the state of `a` as it grows. 1 -> 14.',
              code: 'x = 2\ny = x + 3 * 4   # 1. Evaluate 2 + 12 -> 14. 2. Bind y to 14.\ny',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Instrumented Tracing',
              prose: 'Sometimes "Thinking" is not enough. We use `print()` as a diagnostic tool to look inside the state map while the code is running.',
              instructions: 'Notice how the first print happens before the update, and the second happens after.',
              code: 'balance = 100\nprint("Opened at:", balance)\n\nbalance = balance + 50\nprint("Updated to:", balance)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Logic Errors: The Silent Failure',
              prose: 'A program can run "perfectly" but still be wrong. This is a logic error: the computer did exactly what you said, but you said the wrong thing.',
              instructions: 'Why is `total` 10 instead of 15? Trace it: `total` was computed before `tax` was added!',
              code: 'price = 10\ntax = 5\ntotal = price\nprice = price + tax\n\ntotal',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'The Multi-Step Trace',
              difficulty: 'medium',
              prompt: 'Trace the state by hand. What is the value of **c** at the end?',
              instructions: "Type the following four lines into the cell. Predict the value of `c` before you click Run:\n\n```python\na = 3\nb = a + 4\na = a + 2\nc = a + b\nc\n```",
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
            }
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

  assessment: {
    questions: [
      {
        id: 'q1',
        text: 'If x = 5 and y = x, then x = 10, what is the value of y?',
        options: ['5 (y captured the snapshot of x)', '10 (y is linked to x automatically)', 'An error'],
        correct: 0,
      },
      {
        id: 'q2',
        text: 'In the line "z = x + 10", what happens first?',
        options: ['z is updated', 'x + 10 is evaluated to a value', 'The program stops'],
        correct: 1,
      },
      {
        id: 'q3',
        text: 'Which rule is true regarding execution flow?',
        options: ['Lines run bottom to top', 'Each line must complete before the next begins', 'Variables must be used before being assigned'],
        correct: 1,
      }
    ],
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
