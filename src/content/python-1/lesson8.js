// Chapter 0.3 — Lesson 8: Function Composition
//
// DEPENDENCIES: 
//   - Lesson 7: Built-in Functions (Individual Tool Knowledge)
//   - Lesson 5: State (Tracking how results move through memory)
//
// 1. DEFINITION: Composition = Using a function output as an input.
// 2. THE SPIRAL RULE: Evaluation order is Inside -> Out.
// 3. SUBSTITUTION: Every inner call collapses before the outer call runs.
// 4. THE PRINT GHOST: Understanding None propagation in nested prints.

export default {
  id: 'py-0-3-composition',
  slug: 'function-composition',
  chapter: 0.3,
  order: 8,
  title: 'Function Composition',
  subtitle: 'The Matryoshka Model',
  tags: ['composition', 'nesting', 'execution-order', 'substitution'],

  hook: {
    question: 'How do you build a complex machine out of smaller, simpler ones?',
    realWorldContext:
      'In a factory, the output of one conveyor belt is the input of the next. ' +
      'In Python, we call this **Composition**. When you nest functions like `print(len("hi"))`, ' +
      'you are connecting machines together to perform a multi-step transformation in a single line.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      '**Functional Composition** is the act of using the result of one function as the argument for another. It allows us to avoid creating temporary variable names for every intermediate step.',
      'To master composition, you must follow the **Inside-Out Spiral Rule**. Every nested expression evaluates from the deepest parentheses first:',
      '```\nresult = abs(round(-10.5))\n\n1. Evaluate inner: round(-10.5) -> -10\n2. SUBSTITUTE: the code becomes abs(-10)\n3. Evaluate outer: abs(-10) -> 10\n4. Bind result = 10\n```',
      'If you don\'t understand this "Collapse," you will fail to debug complex programs. The computer never sees both functions at once; it only sees the **current winner** of the innermost evaluation.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The Spiral Rule',
        body: '1. Innermost Level (Base Data)\n2. Inner Function execution\n3. Result Substitution\n4. Outer Function execution\n5. Final Outcome',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'The Composition Lab',
        mathBridge: 'Observe how each layer collapses one by one, shifting the state from text -> number -> result.',
        caption: 'Work through the stages of complexity, culminating in 4 major execution challenges.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Stage 1: Basic Nesting',
              prose: 'Measuring the absolute magnitude of a length. Inside: `len()`. Outside: `abs()`.',
              instructions: 'Predict: 1. len("Python") is 6. 2. abs(6) is 6. Run to verify.',
              code: 'res = abs(len("Python"))\nres',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Stage 2: Mathematical Cascades',
              prose: 'We can go deeper. `pow(abs(round(-3.8)), 2)` involves three distinct machines.',
              instructions: 'Trace: 1. round(-3.8) -> -4. 2. abs(-4) -> 4. 3. pow(4, 2) -> 16.',
              code: 'final = pow(abs(round(-3.8)), 2)\nfinal',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Stage 3: The Double-Print Paradox',
              prose: 'What happens if we nest a Side-Effect? `print(print("hi"))`.',
              instructions: 'Notice the output: "hi" appears first, then "None". Trace why: Outer print is printing the "None" result of the inner print.',
              code: 'print(print("hi"))',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Stage 4: String to Math Bridge',
              prose: 'Using the output of a sequence tool inside an arithmetic tool.',
              instructions: 'Predict the result. Does length of "logic" get used correctly as a number?',
              code: 'val = pow(len("logic"), 2)\nval',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Stage 5: Type Composition',
              prose: 'We can examine the metadata of our results in mid-air.',
              instructions: 'Predict: The inner len() returns an int. So type() should find <class "int">.',
              code: 'info = type(len("metadata"))\ninfo',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'Stage 6: Clamping with Composition',
              prose: 'Using min() and max() to force a result into a range in a single line.',
              instructions: 'This line ensures 150 stays between 0 and 100. Trace the inner min() first!',
              code: 'score = 150\nresult = max(0, min(score, 100))\nresult',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: 'Stage 7: Multi-Argument Nesting',
              prose: 'Each input can be its own machine.',
              instructions: 'Trace both inner machines: len("A") is 1, len("BBB") is 3. Result is 3.',
              code: 'greatest = max(len("A"), len("BBB"))\ngreatest',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 11,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Cumulative Challenge 1: The String Cube',
              difficulty: 'easy',
              prompt: 'Create a variable `cube`. Use `pow()` and `len()` to store the cube (power of 3) of the word "Python".',
              instructions: "1. Measure 'Python' with len().\n2. Cube that result with pow().\n3. Save result to `cube`.",
              code: 'word = "Python"\n# Your composition here\ncube = \n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'cube' not in locals(): raise ValueError("Missing: cube")
if cube == 216: # 6^3
    print("Correct! len('Python') is 6, 6^3 is 216.")
else:
    raise ValueError(f"Got {cube}, expected 216. Did you use len(word) then pow(val, 3)?")
True
`,
              hint: 'cube = pow(len(word), 3)',
            },
            {
              id: 12,
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Cumulative Challenge 2: The Safe Rounding',
              difficulty: 'medium',
              prompt: 'Round -15.8 and ensure it never goes below 0.',
              instructions: "1. Use `round()` to round -15.8.\n2. Wrap that in `max(0, ...)` to ensure the result is at least 0.\n3. Save to `safe_result`.",
              code: 'val = -15.8\n# Your composition here\nsafe_result = \n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'safe_result' not in locals(): raise ValueError("Missing: safe_result")
# round(-15.8) is -16. max(0, -16) is 0.
if safe_result == 0:
    print("Safe! You successfully used max() to clamp a negative rounded result.")
else:
    raise ValueError(f"Got {safe_result}, expected 0. (-16 vs 0).")
True
`,
              hint: 'safe_result = max(0, round(val))',
            },
            {
              id: 13,
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Cumulative Challenge 3: Identity Verification',
              difficulty: 'medium',
              prompt: 'Determine the data type of a measurement result in one line.',
              instructions: "1. Create variable `check`. Use `type()` and `len()` together to find the type of the length of 'Verify'.",
              code: 'text = "Verify"\n# Your composition here\ncheck = \n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'check' not in locals(): raise ValueError("Missing: check")
if check == int:
    print("Perfect. The metadata shows that lengths are always Integers.")
else:
    raise ValueError("Did you type(len(text))?")
True
`,
              hint: 'check = type(len(text))',
            },
            {
              id: 14,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Cumulative Challenge 4: The Master Trace',
              difficulty: 'hard',
              prompt: 'TRIPLE COMPOSTION: Predict the final value of **master**.',
              instructions: "Trace this by hand first:\n\n```\na = -5.5\nmaster = abs(round(a)) + pow(len('OK'), 2)\n```\n\n1. What is `abs(round(-5.5))`? (round to -6, then abs to 6).\n2. What is `pow(len('OK'), 2)`? (len is 2, 2^2 is 4).\n3. Result should be 10.\n\nType and verify.",
              code: 'a = -5.5\n# Predict and type the full line\nmaster = \n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'master' not in locals(): raise ValueError("Missing: master")
# round(-5.5) -> -6. abs(-6) -> 6. 
# len('OK') -> 2. pow(2,2) -> 4.
# 6 + 4 = 10.
if master == 10:
    print("MASTER TRACE SUCCESS! You have perfectly simulated the evaluation spiral.")
else:
    raise ValueError(f"Trace mismatch! Got {master}, expected 10.")
True
`,
              hint: 'master = abs(round(a)) + pow(len("OK"), 2)',
            }
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Nested State Persistence**: Composition is just a shortcut. Every intermediate result is held in memory before being fed to the next function.',
      '**None Propagation**: A single Side-Effect function (like `print`) at the root of a composition tree will turn the entire final result into `None`.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The Composition Rulebook',
        body: '1. Inner outputs become Outer inputs.\n2. Incompatibile types (None + 5) crash the cascade.\n3. Every layer must collapse before the next can begin.',
      },
    ],
  },

  mentalModel: [
    'Inside-Out Rule: Deepest parentheses evaluate first.',
    'Substitution: Function results replace their own text.',
    'Temporary State: Results are held in memory between calls.',
    'Pure inner functions are required for computation cascades.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}
