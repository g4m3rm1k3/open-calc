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
              id: 6,
              cellTitle: 'Tool 4: abs() — Absolute Value',
              prose: '`abs(x)` returns the **distance from zero** on the number line — always a non-negative result. It works on both integers and floats. The original variable is never changed.',
              instructions: 'Run the cell. Notice that both `abs(-7)` and `abs(-3.5)` strip the negative sign. The variable `n` stays at -7.',
              code: 'n = -7\nresult = abs(n)\n\nprint("Original n:", n)       # Still -7\nprint("abs(-7):", result)      # 7\nprint("abs(-3.5):", abs(-3.5)) # 3.5',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: 'Tool 5: pow() — Exponentiation',
              prose: '`pow(base, exp)` raises `base` to the power `exp`. It is identical to the `**` operator for two arguments. A rare third argument `pow(base, exp, mod)` computes modular exponentiation — useful in cryptography, but you will not need it yet.',
              instructions: 'Verify that `pow(2, 10)` and `2 ** 10` produce the same result. Also observe the three-argument form.',
              code: 'print("pow(2, 10):", pow(2, 10))      # 1024\nprint("2 ** 10  :", 2 ** 10)          # 1024 — identical\nprint("pow(2, 10, 1000):", pow(2, 10, 1000))  # 1024 mod 1000 = 24',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 8,
              cellTitle: 'Tool 6: min() and max() — Any Number of Arguments',
              prose: '`min()` and `max()` accept **any number of comma-separated arguments**, not just two. Python scans all of them and returns the smallest (or largest) one.',
              instructions: 'Run both calls. Try adding or removing numbers — the functions handle any count.',
              code: 'print("min:", min(3, 1, 4, 1, 5))  # 1\nprint("max:", max(3, 1, 4, 1, 5))  # 5\n\n# Works on a mix of positives and negatives too\nprint("min of mix:", min(0, -10, 7, -3))  # -10',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 9,
              cellTitle: 'Tool 7: round() — Controlling Precision',
              prose: '`round(number, ndigits)` rounds to `ndigits` decimal places. If you omit `ndigits`, it rounds to the nearest integer. Python uses **banker\'s rounding**: ties (like 0.5) round to the nearest even number.',
              instructions: 'Notice that `round(3.5)` gives 4 (even) but `round(2.5)` gives 2 (also even). This surprises many beginners.',
              code: 'print("round(3.14159, 2):", round(3.14159, 2))  # 3.14\nprint("round(3.5)      :", round(3.5))           # 4  (rounds to even)\nprint("round(2.5)      :", round(2.5))           # 2  (rounds to even)\nprint("round(3.14159, 4):", round(3.14159, 4))  # 3.1416',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 11,
              cellTitle: 'Tool 8: len() — Measuring Sequences',
              prose: '`len(sequence)` returns the number of items in a sequence. For strings, that is the character count. Later you will see it also works on **lists** and other collections — the same tool, different containers.',
              instructions: 'Run to count characters in each string. Spaces count as characters too.',
              code: 'print("len(\'hello\')  :", len("hello"))       # 5\nprint("len(\'open-calc\'):", len("open-calc"))  # 9\nprint("len(\' hi \')   :", len(" hi "))        # 4 — spaces count!\nprint("len(\'\')       :", len(""))            # 0 — empty string',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 12,
              cellTitle: 'Tool 9: type() — Inspecting Data Categories',
              prose: 'You first saw `type()` in Lesson 3. Here is the key insight: `type()` is just another **pure function** — it takes a value, returns a type object, and leaves the original alone. You can use its return value in comparisons.',
              instructions: 'Notice the return value is a type object like `<class \'int\'>`. You can compare it directly: `type(x) == int`.',
              code: 'x = 42\nprint("type(42)        :", type(x))           # <class \'int\'>\nprint("type(3.14)      :", type(3.14))         # <class \'float\'>\nprint("type(\'hi\')      :", type("hi"))         # <class \'str\'>\nprint("is x an int?   :", type(x) == int)     # True',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 13,
              cellTitle: 'Tool 10: sum() — Adding a Collection',
              prose: '`sum([1, 2, 3])` adds up all the numbers in a list. Lists are covered in depth later, but `sum()` is worth knowing now. The argument is a **collection** (wrapped in `[]`), not separate comma-separated values like `min()` and `max()`.',
              instructions: 'Notice the square brackets inside the call. That `[1, 2, 3]` is a list — a single argument containing multiple values.',
              code: 'total = sum([1, 2, 3, 4, 5])\nprint("sum([1..5]):", total)  # 15\n\n# Compare to adding manually\nmanual = 1 + 2 + 3 + 4 + 5\nprint("manual   :", manual)   # Also 15',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 14,
              cellTitle: 'Tool 11: int(), float(), str() as Functions',
              prose: 'These are not just type names — they are **conversion functions**. `int("42")` converts a string to an integer. `float(3)` converts an integer to a float. `str(99)` converts a number to a string. You will use these constantly for data input.',
              instructions: 'Notice the type changes in the output. `int("42")` produces the number 42, not the text "42".',
              code: 'print("int(\'42\')  :", int("42"),   "->", type(int("42")))   # 42 int\nprint("float(3)  :", float(3),   "->", type(float(3)))      # 3.0 float\nprint("str(99)   :", str(99),    "->", type(str(99)))       # \'99\' str\nprint("int(3.9)  :", int(3.9))                              # 3 — truncates!',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 15,
              cellTitle: 'Return Value vs. Side Effect — The Critical Divide',
              prose: 'Every function either **returns a value** or **produces a side effect** (or both). `abs(-5)` returns `5` — a pure data output you can store or compute with. `print("hi")` outputs to the screen (side effect) and returns `None` — a special Python object meaning "no value."',
              instructions: 'Capture the return value of print(). You will see it is None — which is why you cannot add print() results together.',
              code: 'pure_result = abs(-5)\nprint("abs(-5) returns:", pure_result)  # 5\n\nside_effect_result = print("I am a side effect")\nprint("print() returns:", side_effect_result)   # None',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 16,
              cellTitle: 'Capturing vs. Discarding Return Values',
              prose: 'When you write `x = round(3.5)`, you **capture** the return value into a variable. When you write `round(3.5)` alone on a line, the return value is computed and then **discarded**. Neither is wrong — but discarding is only useful when you are testing in a notebook.',
              instructions: 'Both lines call round(), but only one saves the result. In a script (not a notebook), the second line does nothing useful.',
              code: '# Capturing the result\nx = round(3.14159, 2)\nprint("Captured:", x)  # 3.14\n\n# Discarding the result (only useful in interactive mode)\nround(3.14159, 2)      # Computes 3.14, then throws it away\nprint("x unchanged:", x)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 17,
              cellTitle: 'TypeError — Calling Functions with Wrong Arguments',
              prose: 'Every function expects a specific number of arguments. Give too many (or too few) and Python raises a **TypeError** immediately. This is one of the most common beginner errors.',
              instructions: 'The first call works. The commented-out calls would raise TypeErrors — read the comments to understand why.',
              code: 'print("abs(-7):", abs(-7))   # Correct: 1 argument\n\n# abs(1, 2)       # TypeError: abs() takes exactly 1 argument (2 given)\n# round()         # TypeError: round() requires at least 1 argument\n# len()           # TypeError: len() requires exactly 1 argument\n\nprint("TypeError guard: always check how many args a function needs.")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 18,
              cellTitle: 'The help() Function — Your Built-in Manual',
              prose: '`help(function_name)` prints the official documentation for any built-in function. It shows the **signature** (what arguments it accepts) and a short description. In a notebook you can also type `abs?` or `round?` for a quick reference.',
              instructions: 'Run help() on round to see its full signature. Notice it documents the optional `ndigits` parameter.',
              code: 'help(round)',
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
            },
            {
              id: 21,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Rounding to Precision',
              difficulty: 'easy',
              prompt: 'Use `round()` to round the number 3.14159 to exactly 2 decimal places. Store the result in `result`.',
              instructions: "1. Call `round()` with two arguments: the number and the number of decimal places.\n2. Store the answer in `result`.\n3. Print `result`.",
              code: '# Round pi to 2 decimal places\nresult = \nprint(result)',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = round(3.14159, 2)
if result == 3.14:
    res = "SUCCESS: round(3.14159, 2) = 3.14. Precision confirmed."
else:
    res = f"ERROR: Expected 3.14, got {result}."
res
`,
              hint: 'result = round(3.14159, 2)',
            },
            {
              id: 22,
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Min and Max on the Same Set',
              difficulty: 'easy',
              prompt: 'Given five numbers — 7, 2, 9, 1, 5 — find both the smallest and the largest in two separate expressions.',
              instructions: "1. Use `min()` on all five numbers and store the result in `smallest`.\n2. Use `max()` on the same five numbers and store the result in `largest`.\n3. Print both.",
              code: '# Find the smallest and largest of 7, 2, 9, 1, 5\nsmallest = \nlargest = \nprint("Smallest:", smallest)\nprint("Largest:", largest)',
              output: '', status: 'idle', figureJson: null,
              testCode: `
smallest = min(7, 2, 9, 1, 5)
largest = max(7, 2, 9, 1, 5)
if smallest == 1 and largest == 9:
    res = "SUCCESS: min(7,2,9,1,5)=1 and max(7,2,9,1,5)=9. Both correct."
elif smallest != 1:
    res = f"ERROR: smallest should be 1, got {smallest}."
else:
    res = f"ERROR: largest should be 9, got {largest}."
res
`,
              hint: 'smallest = min(7, 2, 9, 1, 5)  |  largest = max(7, 2, 9, 1, 5)',
            },
            {
              id: 23,
              challengeType: 'write',
              challengeNumber: 6,
              challengeTitle: 'Absolute Difference',
              difficulty: 'medium',
              prompt: 'COMPOUND (Lessons 2 + 7): Compute the absolute difference between 2³ and 3². The result should always be positive regardless of which power is larger.',
              instructions: "1. Use `pow(2, 3)` and `pow(3, 2)` to compute each power.\n2. Subtract them: `pow(2, 3) - pow(3, 2)`.\n3. Wrap the whole subtraction in `abs()` so the result is always non-negative.\n4. Store the final value in `result`.",
              code: '# Compute abs(2^3 - 3^2)\nresult = \nprint("Result:", result)',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = abs(pow(2, 3) - pow(3, 2))
if result == 1:
    res = "SUCCESS: pow(2,3)=8, pow(3,2)=9, 8-9=-1, abs(-1)=1."
else:
    res = f"ERROR: Expected 1, got {result}. Trace: pow(2,3)=8, pow(3,2)=9, abs(8-9)=abs(-1)=1."
res
`,
              hint: 'result = abs(pow(2, 3) - pow(3, 2))',
            },
            {
              id: 24,
              challengeType: 'fill',
              challengeNumber: 7,
              challengeTitle: 'Round Up to the Nearest Integer',
              difficulty: 'medium',
              prompt: 'Fill in the function call to convert the float `3.7` to the integer `4`. Use a built-in function that rounds a number to the nearest integer.',
              instructions: "Replace `___` with the correct function name. The call `___(3.7)` should produce `4`.",
              starterBlock: 'result = ___(3.7)\nprint(result)',
              code: 'result = ___(3.7)\nprint(result)',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = round(3.7)
if result == 4:
    res = "SUCCESS: round(3.7) = 4. The nearest integer to 3.7 is 4."
else:
    res = f"ERROR: Expected 4, got {result}. Hint: which function rounds to the nearest integer?"
res
`,
              hint: 'The function that rounds to the nearest integer is round(). round(3.7) → 4.',
            },
            {
              id: 25,
              challengeType: 'write',
              challengeNumber: 8,
              challengeTitle: 'The Four-Function Chain',
              difficulty: 'hard',
              prompt: 'COMPOUND (Lessons 4 + 7): Starting from `x = -42.7`, compute — in a single expression — the length of the string representation of the rounded absolute value.',
              instructions: "1. Assign `x = -42.7`.\n2. In one expression, chain: `abs(x)` → `round(...)` → `str(...)` → `len(...)`.\n3. Store the final result in `result`.\n\nTrace: abs(-42.7)=42.7 → round(42.7)=43 → str(43)='43' → len('43')=2.",
              code: 'x = -42.7\n# Chain all four functions in one expression\nresult = \nprint("Result:", result)',
              output: '', status: 'idle', figureJson: null,
              testCode: `
x = -42.7
result = len(str(round(abs(x))))
if result == 2:
    res = "SUCCESS: abs(-42.7)=42.7, round=43, str='43', len=2. Chain complete."
else:
    res = f"ERROR: Expected 2, got {result}. Trace: abs→round→str→len."
res
`,
              hint: 'result = len(str(round(abs(x))))',
            },
            {
              id: 26,
              challengeType: 'write',
              challengeNumber: 9,
              challengeTitle: 'Pure Built-ins Only',
              difficulty: 'hard',
              prompt: 'Using only built-in functions (no arithmetic operators), compute the absolute value of the minimum of the numbers -5, 3, -8, and 1.',
              instructions: "1. Use `min()` to find the smallest of -5, 3, -8, 1.\n2. Wrap that call directly inside `abs()` — no variables, no operators.\n3. Store the result in `result`.\n\nExpected answer: abs(min(-5, 3, -8, 1)) = abs(-8) = 8.",
              code: '# Use only built-in function calls, no + - * / operators\nresult = \nprint("Result:", result)',
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = abs(min(-5, 3, -8, 1))
if result == 8:
    res = "SUCCESS: min(-5,3,-8,1)=-8, abs(-8)=8. Pure composition achieved."
else:
    res = f"ERROR: Expected 8, got {result}. Trace: min(-5,3,-8,1)=-8, then abs(-8)=8."
res
`,
              hint: 'result = abs(min(-5, 3, -8, 1))',
            },
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
