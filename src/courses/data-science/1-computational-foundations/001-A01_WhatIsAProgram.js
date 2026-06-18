// Track A — Lesson 01
// What Is a Program?
// Prereqs: None | Unlocks: A.02, A.03

export default {
  id: 'a-01',
  slug: 'what-is-a-program',
  track: 'A',
  order: 1,
  title: 'What Is a Program?',
  subtitle: 'The Interpreter Model',
  tags: ['evaluation', 'interpreter', 'expressions', 'errors'],
  prereqs: [],
  unlocks: ['a-02', 'a-03'],

  hook: {
    question: 'What does Python actually DO with code?',
    realWorldContext:
      'Before you write a single program, you need a mental model of the machine running it. ' +
      'Python is an interpreter — it reads your code one line at a time, executes that line, ' +
      'then moves to the next. Every line either produces a value, stores a value, or causes a ' +
      'side effect. Understanding this model is the foundation of everything else.',
  },

  intuition: {
    prose: [
      'A **program** is a sequence of instructions. The Python interpreter executes them top to bottom, one line at a time. This is not a metaphor — it is literally how it works.',
      'Every line of code does one of three things: it **evaluates an expression** (produces a value), it **binds a name to a value** (assignment), or it **causes a side effect** (changes something outside the program). Most bugs come from confusing which one a line is doing.',
      'When Python encounters an error, it stops immediately. Nothing below the error line runs. The error message tells you the line number, the type of error, and a description. Reading error messages precisely is a skill — it is not optional.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The Three Things Any Line Can Do',
        body: '1. Evaluate an expression → produce a value\n2. Bind a name → store a value in memory\n3. Cause a side effect → change something outside the computation\n\nIf you cannot say which one a line is doing, you do not yet understand it.',
      },
      {
        type: 'warning',
        title: 'Errors Stop Everything',
        body: 'When Python hits an error on line 5, lines 6, 7, 8 do not run. The interpreter stops at the error. This is intentional — continuing with broken state would produce meaningless results.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'The Interpreter in Action',
        caption: 'Watch how Python evaluates each line. Notice which produce visible values and which do not.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Stage 1 — A Pure Expression',
              prose: 'Type `2 + 3` into a cell and run it. This is an expression. Python evaluates it and shows the result: 5. Nothing is stored anywhere. The value 5 exists for a moment, is displayed, and then is gone.',
              instructions: 'Run the cell. Notice the `Out [1]: 5` below. That is the result of evaluating the expression.',
              code: '2 + 3',
              output: '',
              status: 'idle',
            },
            {
              id: 2,
              cellTitle: 'Stage 2 — A String Literal',
              prose: 'A string in quotes is also an expression — it evaluates to itself. `"hello"` evaluates to the string hello. The quotes are not part of the value — they are syntax that tells Python "this is a string."',
              instructions: 'Run the cell. The output shows the string with its quotes — Python\'s way of telling you this is a string value, not a number.',
              code: '"hello"',
              output: '',
              status: 'idle',
            },
            {
              id: 3,
              cellTitle: 'Stage 3 — Sequential Execution',
              prose: 'Python runs lines top to bottom. Each line runs to completion before the next begins. In a notebook, only the value of the LAST expression in a cell is shown automatically.',
              instructions: 'Run the cell. Notice that only the result of the last line (30) appears as output. The first two expressions (10, 20) evaluated but were not shown — there was a next line to run.',
              code: '10\n20\n30',
              output: '',
              status: 'idle',
            },
            {
              id: 4,
              cellTitle: 'Stage 4 — Arithmetic Expressions',
              prose: 'Python understands standard arithmetic. These are all expressions — they evaluate to values. The operators follow standard mathematical precedence.',
              instructions: 'Run the cell. Each `print()` forces the value to be displayed even though it is not the last line. We will explain print() properly in Lesson A.06.',
              code: 'print(10 + 3)\nprint(10 - 3)\nprint(10 * 3)\nprint(10 / 3)\nprint(10 ** 2)',
              output: '',
              status: 'idle',
            },
            {
              id: 5,
              cellTitle: 'Stage 5 — What an Error Looks Like',
              prose: 'This cell contains a deliberate error. Run it and read the output carefully. Python tells you: (1) the type of error, (2) the line where it occurred, (3) a description of what went wrong.',
              instructions: 'Run the cell. Read the error. Find: the error type (SyntaxError), the line number, and the description. Then fix the error so the cell runs correctly.',
              code: '# This has a syntax error — fix it\n5 + * 3',
              output: '',
              status: 'idle',
            },
            {
              id: 6,
              cellTitle: 'Stage 6 — Errors Stop Everything',
              prose: 'When an error occurs on one line, nothing after it runs. The line `print("this never runs")` will never execute.',
              instructions: 'Run the cell. Notice only one line of output appears. The error on the second line stops execution — the third line never runs.',
              code: 'print("this runs")\n1 / 0\nprint("this never runs")',
              output: '',
              status: 'idle',
            },
            {
              id: 11,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Challenge 1 — Your First Expression',
              difficulty: 'easy',
              prompt: 'Write a single arithmetic expression that evaluates to exactly 42. You may use any combination of numbers and operators (+, -, *, /, **). Do not use any variable names.',
              instructions: '1. Think of a calculation that equals 42.\n2. Write only the expression — no variable names, no print().\n3. Run the cell. The output should show 42.',
              code: '# Write your expression below — it should evaluate to 42\n',
              output: '',
              status: 'idle',
              testCode: `
result = eval(In[-1].strip().split('\\n')[-1])
if result == 42:
    res = "SUCCESS: Your expression evaluates to 42. You have written your first Python expression."
else:
    raise ValueError(f"Your expression evaluates to {result}, not 42. Adjust your arithmetic.")
res
`,
              hint: '6 * 7',
            },
            {
              id: 12,
              challengeType: 'predict',
              challengeNumber: 2,
              challengeTitle: 'Challenge 2 — Error Reading',
              difficulty: 'easy',
              prompt: 'The cell below has two errors. Run it. Read the error message. Fix ONLY the first error and run again. Then fix the second error. This trains you to read errors precisely.',
              instructions: '1. Run the cell as-is.\n2. Read the error type and line number.\n3. Fix that specific error.\n4. Run again — a new error will appear.\n5. Fix that one too.\n6. The cell should print exactly: Hello World',
              code: 'print("Hello" + " " + World")\nprint("this line is fine")',
              output: '',
              status: 'idle',
              testCode: `
import sys
from io import StringIO
buf = StringIO()
sys.stdout = buf
exec('''print("Hello" + " " + "World")''')
sys.stdout = sys.__stdout__
out = buf.getvalue().strip()
if out == "Hello World":
    res = "SUCCESS: You read two error messages and fixed them both. This skill will save you hours."
else:
    raise ValueError(f"Expected 'Hello World', got '{out}'. Check your string syntax.")
res
`,
              hint: 'The first error is a missing opening quote. The second is a missing closing quote on the first string.',
            },
          ],
        },
      },
    ],
  },

  mentalModel: [
    'The interpreter reads and executes one line at a time, top to bottom.',
    'Every line either evaluates an expression, stores a value, or causes a side effect.',
    'An expression is anything that produces a value when evaluated.',
    'Errors stop execution immediately — nothing below the error line runs.',
    'Read error messages precisely: type, line number, description.',
  ],
}
