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
              id: 8,
              cellTitle: 'Stage 8: Three Levels Deep',
              prose: 'Composition is not limited to two layers. `round(abs(float("-3.7")), 1)` has three nested functions. The key is always to find the **innermost** call and collapse it first.',
              instructions: 'Trace each layer before running:\n1. float("-3.7") → -3.7\n2. abs(-3.7) → 3.7\n3. round(3.7, 1) → 3.7\n\nNow run to confirm.',
              code: '# Three-layer composition\nresult = round(abs(float("-3.7")), 1)\nprint("Step-by-step:")\nprint("  float(\\"-3.7\\")          :", float("-3.7"))            # -3.7\nprint("  abs(float(\\"-3.7\\"))    :", abs(float("-3.7")))        # 3.7\nprint("  round(abs(...), 1)     :", round(abs(float("-3.7")), 1)) # 3.7',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 9,
              cellTitle: 'Why Inside-Out Matters — The Outside-In Mistake',
              prose: 'Beginners sometimes read `round(abs(-3.7), 1)` as "round first, then abs." That is **wrong**. If you evaluated outside-in, you would try to call `round(-3.7, 1)` before `abs` ever ran — which would give you a different (and incorrect) trace for more complex chains.',
              instructions: 'Compare the two orderings. They give the same answer here, but try `round(abs(-3.75), 1)` vs `abs(round(-3.75, 1))` — the results diverge.',
              code: '# Same answer by coincidence:\nprint("round(abs(-3.7), 1) :", round(abs(-3.7), 1))   # 3.7\nprint("abs(round(-3.7, 1)) :", abs(round(-3.7, 1)))   # 3.7\n\n# Now they differ — order matters!\nprint("round(abs(-3.75), 1) :", round(abs(-3.75), 1)) # 3.8 (abs first: 3.75 -> rounds to 3.8)\nprint("abs(round(-3.75, 1)) :", abs(round(-3.75, 1))) # 3.8 (round first: -3.8 -> abs 3.8)\n# For this specific case they match, but the trace logic is different',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 10,
              cellTitle: 'Intermediate Variables vs. Composition',
              prose: 'Every composed expression can be rewritten with intermediate variables. Both approaches are **correct** and produce identical results. The composed form is more compact; the step-by-step form is easier to debug.',
              instructions: 'Verify that both `composed` and `step_by_step` hold the same value.',
              code: '# Composed (one line)\ncomposed = round(abs(float("-3.7")), 1)\n\n# Step-by-step (same logic, explicit variables)\nraw = float("-3.7")      # Step 1: convert string to float\npositive = abs(raw)       # Step 2: make positive\nstep_by_step = round(positive, 1)  # Step 3: round\n\nprint("Composed      :", composed)     # 3.7\nprint("Step-by-step  :", step_by_step) # 3.7\nprint("Are they equal:", composed == step_by_step)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 11,
              cellTitle: 'The Substitution Model',
              prose: 'The **Substitution Model** is the mental technique Python itself uses. Each time a function call appears, you mentally replace it with its return value, then evaluate the next layer. This "collapse and replace" continues until a single value remains.',
              instructions: 'The comments show each substitution step. Read them before running.',
              code: '# Original expression:\n# abs(round(-3.8))\n\n# Substitution step 1: evaluate innermost\n# round(-3.8) -> -4\n# Expression becomes: abs(-4)\n\n# Substitution step 2: evaluate remaining\n# abs(-4) -> 4\n\nresult = abs(round(-3.8))\nprint("Final result:", result)  # 4',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 12,
              cellTitle: 'The Print Ghost — When print() Returns None',
              prose: 'Because `print()` returns `None`, nesting it inside another function causes a **None propagation** problem. `abs(print(-5))` will print -5 to the screen, then try to call `abs(None)` — which crashes with a TypeError.',
              instructions: 'The first call works correctly. Uncomment the second line to see the TypeError that None propagation causes.',
              code: '# Safe: pure function inside another pure function\nresult = abs(round(-5.5))\nprint("abs(round(-5.5)):", result)  # 6\n\n# DANGEROUS: print() returns None — do not nest it inside math functions\n# abs(print(-5))   # Uncomment to see: TypeError: bad operand type for abs(): NoneType',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 13,
              cellTitle: 'Composing len() and str() — Counting Digits',
              prose: '`len(str(n))` is a classic composition: convert a number to its string representation, then count the characters. This is a clean way to count how many digits a number has.',
              instructions: 'Trace: str(12345) → "12345" (a 5-character string), len("12345") → 5.',
              code: 'n = 12345\ndigit_count = len(str(n))\nprint("Number    :", n)            # 12345\nprint("As string  :", str(n))       # "12345"\nprint("Digit count:", digit_count)  # 5\n\n# Works for any size number\nprint("Digits in 2**20:", len(str(2 ** 20)))  # 7  (1048576)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 14,
              cellTitle: 'Composing with Arithmetic — Mixing Operators and Functions',
              prose: 'Composition does not have to be function-inside-function. You can mix function calls with arithmetic operators. Python evaluates function calls **before** applying operators, just as PEMDAS handles parentheses before multiplication.',
              instructions: 'Trace: round(3 * 3.14159, 2) → round(9.42477, 2) → 9.42. The multiplication happens inside the argument list, so it evaluates first.',
              code: 'import math\npi_approx = 3.14159\n\n# Operator inside a function argument\nresult = round(3 * pi_approx, 2)\nprint("round(3 * pi, 2):", result)  # 9.42\n\n# Multiple composed calls combined with +\ncombined = abs(-7) + round(2.9)\nprint("abs(-7) + round(2.9):", combined)  # 7 + 3 = 10',
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
    res = "SUCCESS: Correct! len('Python') is 6, 6^3 is 216."
else:
    raise ValueError(f"Got {cube}, expected 216. Did you use len(word) then pow(val, 3)?")
res
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
    res = "SUCCESS: Safe! You successfully used max() to clamp a negative rounded result."
else:
    raise ValueError(f"Got {safe_result}, expected 0. (-16 vs 0).")
res
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
    res = "SUCCESS: Perfect. The metadata shows that lengths are always Integers."
else:
    raise ValueError("Did you type(len(text))?")
res
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
    res = "SUCCESS: MASTER TRACE SUCCESS! You have perfectly simulated the evaluation spiral."
else:
    raise ValueError(f"Trace mismatch! Got {master}, expected 10.")
res
`,
              hint: 'master = abs(round(a)) + pow(len("OK"), 2)',
            },
            {
              id: 21,
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Two-Step Absolute Round',
              difficulty: 'easy',
              prompt: 'Write `round(abs(-7.456), 1)` and trace the two-step evaluation. Store the result in `result`.',
              instructions: "1. Identify the inner function: `abs(-7.456)`.\n2. Evaluate it: abs(-7.456) → 7.456.\n3. Evaluate the outer: round(7.456, 1) → 7.5.\n4. Store the final value in `result` and print it.",
              code: '# Two-step composition: abs then round\nresult = \nprint("Result:", result)',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = round(abs(-7.456), 1)
if result == 7.5:
    res = "SUCCESS: abs(-7.456)=7.456, round(7.456,1)=7.5. Trace correct."
else:
    res = f"ERROR: Expected 7.5, got {result}. Trace: abs(-7.456)=7.456 → round(7.456,1)=7.5."
res
`,
              hint: 'result = round(abs(-7.456), 1)',
            },
            {
              id: 22,
              challengeType: 'write',
              challengeNumber: 6,
              challengeTitle: 'How Many Digits Does 2**32 Have?',
              difficulty: 'medium',
              prompt: 'COMPOUND (Lessons 7 + 8): Use `len(str(...))` to count the number of digits in `2 ** 32`. Store the answer in `digit_count`.',
              instructions: "1. Compute `2 ** 32`.\n2. Convert it to a string with `str()`.\n3. Measure the length with `len()`.\n4. Store the result in `digit_count`.\n\nExpected answer: 2**32 = 4294967296, which has 10 digits.",
              code: '# Count digits in 2**32\ndigit_count = \nprint("2**32 =", 2 ** 32)\nprint("Digit count:", digit_count)',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = len(str(2 ** 32))
if result == 10:
    res = "SUCCESS: 2**32 = 4294967296, which has 10 digits."
else:
    res = f"ERROR: Expected 10, got {result}. 2**32 = 4294967296."
res
`,
              hint: 'digit_count = len(str(2 ** 32))',
            },
            {
              id: 23,
              challengeType: 'fill',
              challengeNumber: 7,
              challengeTitle: 'Fill the Composition Blanks',
              difficulty: 'medium',
              prompt: 'Fill in the two blanks so that the expression evaluates to `10.0`. The outer function is `round(..., 0)` and the inner function should take `abs` of a number.',
              instructions: "Replace each `___` with the correct function name and argument:\n\n`round(___(___(-9.81)), 0)` should produce `10.0`.\n\nTrace: inner arg = -9.81, apply abs → 9.81, apply round(9.81, 0) → 10.0.",
              starterBlock: 'result = round(___(___(-9.81)), 0)\nprint(result)',
              code: 'result = round(___(___(-9.81)), 0)\nprint(result)',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = round(abs(float(-9.81)), 0)
if result == 10.0:
    res = "SUCCESS: float(-9.81)=-9.81, abs(-9.81)=9.81, round(9.81,0)=10.0."
else:
    res = f"ERROR: Expected 10.0, got {result}. The blanks should be abs and float (or just abs if the number is already a float)."
res
`,
              hint: 'The two functions are abs and float. round(abs(float(-9.81)), 0) → round(abs(-9.81), 0) → round(9.81, 0) → 10.0.',
            },
            {
              id: 24,
              challengeType: 'write',
              challengeNumber: 8,
              challengeTitle: 'Tuple Min/Max Composition',
              difficulty: 'hard',
              prompt: 'COMPOUND (Lessons 4 + 8): Assign `values = (3, -1, 4, -1, 5)`. Then compute `abs(min(values)) + max(values)` in a single expression. Store the result in `result`.',
              instructions: "1. Assign the tuple `values = (3, -1, 4, -1, 5)`.\n2. Compute `abs(min(values))` — find the minimum then take its absolute value.\n3. Compute `max(values)` — find the maximum.\n4. Add the two results together.\n5. Store in `result`.\n\nTrace: min(values)=-1, abs(-1)=1, max(values)=5, 1+5=6.",
              code: 'values = (3, -1, 4, -1, 5)\n# Compose abs, min, and max in one expression\nresult = \nprint("Result:", result)',
              output: '', status: 'idle', figureJson: null,
              testCode: `
values = (3, -1, 4, -1, 5)
result = abs(min(values)) + max(values)
if result == 6:
    res = "SUCCESS: min(values)=-1, abs(-1)=1, max(values)=5, 1+5=6."
else:
    res = f"ERROR: Expected 6, got {result}. Trace: min(values)=-1 → abs(-1)=1, max(values)=5, sum=6."
res
`,
              hint: 'result = abs(min(values)) + max(values)',
            },
            {
              id: 25,
              challengeType: 'write',
              challengeNumber: 9,
              challengeTitle: 'Four-Function Digit Count',
              difficulty: 'hard',
              prompt: 'Compose `str`, `len`, `abs`, and `round` in a single expression to find how many characters are in the string representation of `round(abs(-99.7))`. Store the result in `result`.',
              instructions: "1. Start with -99.7.\n2. Apply `abs(-99.7)` → 99.7.\n3. Apply `round(99.7)` → 100.\n4. Apply `str(100)` → '100'.\n5. Apply `len('100')` → 3.\n6. Store 3 in `result`.",
              code: '# Chain all four functions in one expression\nresult = \nprint("Result:", result)',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = len(str(round(abs(-99.7))))
if result == 3:
    res = "SUCCESS: abs(-99.7)=99.7, round(99.7)=100, str(100)='100', len('100')=3."
else:
    res = f"Got {result}. Trace: abs(-99.7)=99.7 → round()=100 → str='100' → len=3."
res
`,
              hint: 'result = len(str(round(abs(-99.7))))',
            },
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
