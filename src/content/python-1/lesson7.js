// Chapter 0.3 — Lesson 7: Built-in Functions & The Mapping Model
//
// DEPENDENCIES: 
//   - Lesson 2: Expressions (Arguments are evaluated just like PEMDAS)
//   - Lesson 4: Variables (Capturing return values in state)
//   - Lesson 5: State (Persistent changes over a sequence of calls)
//
// TEACHES:
//   Core Toolbox: abs(), pow(), min(), max(), round(), len(), type()
//   Arguments: Providing inputs to the black-box process
//   Return Values vs. Side Effects: Mapping data vs. Observing state
//   Functional Composition: Nesting one result inside another input

export default {
  id: 'py-0-3-builtins',
  slug: 'built-in-functions',
  chapter: 0.3,
  order: 7,
  title: 'Built-in Functions',
  subtitle: 'The Professional Toolkit',
  tags: ['functions', 'print', 'returning', 'nesting', 'composition'],

  hook: {
    question: 'How do you perform complex logic without writing every step manually?',
    realWorldContext:
      'In a kitchen, you don\'t build a blender every time you need a smoothie. You use the pre-built tool. ' +
      'Python functions are pre-built digital tools. You give them ingredients (Arguments) and they give you a result (Return Value).',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A **Function** is a named block of code that performs a specific task. Think of it as a "Digital Machine": you provide it with **Arguments** (Inputs), it follows pre-written logic, and it potentially gives you a **Return Value** (Output).',
      'Python comes with a "Built-in Toolbox" of these pre-made machines so you don\'t have to re-invent the wheel for common tasks like measuring text (`len`), rounding numbers (`round`), or showing data to humans (`print`).',
      'However, not all functions behave the same way:',
      '1. **Pure Functions (Mappings)**: Tools like `abs(-5)` are "Pure." They take data, perform a calculation, and **Return** a new value. Critically, ellos do not change the world or the original data. `abs(x)` identifies the magnitude, but `x` stays exactly as it was.',
      '2. **Side-Effect Functions (Observations)**: Tools like `print("Hello")` have a "Side Effect." Instead of strictly returning a value to the computer, they perform an action on the **Outside World** (like showing text on your screen).',
      'This distinction is vital: if a function is Pure, you can always trust it to leave your variables alone. If it has Side Effects, something outside your program is changing.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Return Value vs. Side Effect',
        body: 'A **Return Value** (like `len`) is data the computer uses. A **Side Effect** (like `print`) is a signal for humans. Be careful: `print()` returns **None**. You cannot do math with "None".',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'The Measurement & Comparison Tools',
        mathBridge: 'Just as $\\min(x, y)$ picks the lower value, Python tools resolve complex comparisons in a single step.',
        caption: 'Explore these core tools. Notice how the return values appear in the "Out" area.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Tool 1: Measurement & Types',
              prose: '`len()` measures the length of a sequence. `type()` identifies the category of data.',
              instructions: 'Run to see how Python "sees" the string "open-calc".',
              code: 'name = "open-calc"\nlength = len(name)\ncategory = type(name)\n\nprint("Length:", length)\nprint("Type:", category)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Tool 2: Mathematical Specialists',
              prose: 'Beyond arithmetic, we have `pow(base, exp)`, `round(num, precision)`, and `abs(num)`.',
              instructions: 'Notice how `pow(2, 3)` is the same as `2 ** 3`. It is an alternative "tool" for the same result.',
              code: 'base = 2\nexp = 3\n\npower_result = pow(base, exp)\nrounded = round(3.14159, 2)\nprint("2 to the power of 3:", power_result)\nprint("PI rounded:", rounded)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Tool 3: Comparison Tools (Min/Max)',
              prose: '`min()` and `max()` are used to "clamp" values. They can take multiple arguments separated by commas.',
              instructions: 'Try changing the numbers. `min` always picks the lower, `max` the higher.',
              code: 'score = 150\n# Limit the score to a max of 100 (Clamping)\nclamped_score = min(score, 100)\n\nfloor = 0\n# Ensure the score never goes below 0\nsafe_score = max(clamped_score, floor)\n\nprint("Final Safe Score:", safe_score)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'The Clamping Challenge',
              difficulty: 'easy',
              prompt: 'We have a variable `temperature = 120`. We want to ensure it never exceeds 100 and never drops below 0.',
              instructions: "1. Use `min()` to cap the temperature at 100. Store it in `capped`.\n2. Use `max()` to ensure `capped` never drops below 0.\n3. Display the final result.",
              code: 'temperature = 120\n# Your code here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'capped' in locals() and capped == 100:
    print("Success! Capped at 100.")
else:
    raise ValueError("Did you use min() to pick the smaller value between 120 and 100?")
True
`,
              hint: 'capped = min(temperature, 100)',
            },
            {
              id: 5,
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Deep Nesting Trace',
              difficulty: 'medium',
              prompt: 'Nesting is evaluating from the inside out. Trace this mental model.',
              instructions: "Predict the value of `result` without running the code first:\n\n```\nx = -3.8\nresult = abs(round(x))\n```\n\nType the code and verify your trace.",
              code: '# Type and verify\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if _ == 4:
    print("Perfect trace! round(-3.8) -> -4. abs(-4) -> 4.")
else:
    raise ValueError(f"Expected 4, but got {_}. Remember: rounding -3.8 goes to -4, then absolute turns it into 4.")
True
`,
              hint: '1. round(-3.8) -> -4. 2. abs(-4) -> 4.',
            },
            {
              id: 10,
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'The Composite Metric Challenge',
              difficulty: 'hard',
              prompt: 'CUMULATIVE REVIEW: Combine everything from Lesson 1 to Lesson 7.',
              instructions: "1. Create a variable `message` with the value 'Quantum Physics'.\n2. Use `len()` to get the length.\n3. Cube that length (power of 3) using `pow()`.\n4. Ensure the final result is always positive using `abs()` (even though it already is!).\n5. Store the final result in `final_score`.",
              code: '# Full composite logic here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'message' not in locals(): raise ValueError("Missing variable: message")
if 'final_score' not in locals(): raise ValueError("Missing variable: final_score")

expected = abs(pow(len("Quantum Physics"), 3)) # 15^3 = 3375
if final_score == expected:
    print("LEGENDARY! You correctly combined Strings, Variables, len(), pow(), and abs() in one flow.")
else:
    raise ValueError(f"Expected {expected}, but got {final_score}. Check your Nesting!")
True
`,
              hint: 'final_score = abs(pow(len(message), 3))',
            }
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Evaluative Substitution**: When Python sees `round(x)`, it does not just "run" it. It **Replaces** that text with the return value. This is why you can do `round(x) + 10`.',
      '**Side-Effect Leakage**: Using `print()` inside a complex calculation is a "Side-Effect." It does not provide data back to the script; it only leaks information to the console.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'Innermost Wins (The Spiral Rule)',
        body: 'In `abs(round(x))`, the inner part (`round(x)`) is evaluated first. It produces a result, and *that* result becomes the argument for the outer part (`abs`). Always work from the center parentheses outward.',
      },
    ],
  },

  mentalModel: [
    'Tools solve sub-problems: abs, len, min, max, round, pow.',
    'Arguments flow IN; Return Values flow OUT.',
    'Nesting: Evaluating from the inside-out.',
    'Composition: Tools + Variables + Math = Programs.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}
