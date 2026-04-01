// Chapter 0.4 — Lesson 11: Conditional Execution
//
// DEPENDENCIES:
//   - Lesson 10: Boolean Logic (conditions ARE boolean expressions)
//   - Lesson 5:  State & Flow (sequential execution model)
//   - Lesson 9:  Writing Functions (conditionals inside functions)
//
// TEACHES:
//   1. if — execute a block only when a condition is True
//   2. else — the fallback branch
//   3. elif — multiple exclusive branches
//   4. Indentation as syntax — what a block IS
//   5. Nested conditionals
//   6. Conditionals inside functions
//   7. Conditional expressions (ternary): value_if_true if condition else value_if_false
//   8. Short-circuit patterns with conditionals
//   9. Exhaustive vs. non-exhaustive branching
//  10. Common mistakes: = vs ==, off-by-one, missing else

export default {
  id: 'py-0-4-conditionals',
  slug: 'conditional-execution',
  chapter: 0.4,
  order: 11,
  title: 'Conditional Execution',
  subtitle: 'Teaching your program to choose',
  tags: ['if', 'else', 'elif', 'conditionals', 'branching', 'indentation', 'ternary'],

  hook: {
    question: 'How does a program decide which path to take?',
    realWorldContext:
      'Every non-trivial program branches: if the password is correct, log in — else, reject. ' +
      'If the temperature is above 100°C, boil — elif above 0°C, liquid — else, freeze. ' +
      'Conditionals are the mechanism that transforms a linear sequence of instructions into a program ' +
      'that can respond to data. Everything from a login form to an AI decision tree is built on this.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'An `if` statement checks a **condition** — any expression that evaluates to a boolean — and runs a block of code only when that condition is `True`. The block is skipped entirely when the condition is `False`.',
      'The `else` clause provides a fallback block: code that runs when the `if` condition is `False`. Together, `if/else` guarantees that exactly one of the two branches executes.',
      '`elif` (short for "else if") adds additional branches between `if` and `else`. Python checks each condition in order and runs the first block whose condition is `True`. Once a branch runs, all remaining branches are skipped.',
      '**Indentation is not style — it is syntax.** The indented block after a colon IS the branch. Remove the indentation and Python raises an `IndentationError`. The standard is 4 spaces per level.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The colon + indent pattern',
        body: 'Every `if`, `elif`, and `else` ends with a colon (`:`). The code belonging to that branch is indented one level (4 spaces) below it. This is not optional — Python uses indentation to define blocks.',
      },
      {
        type: 'insight',
        title: 'Conditions are just boolean expressions',
        body: 'Anything that evaluates to `True` or `False` is a valid condition. You already know how to build them from Lesson 10: `x > 0`, `name == "Alice"`, `x % 2 == 0 and x > 0`. Conditionals just act on those values.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'The Decision Engine',
        mathBridge:
          'In mathematics, a piecewise function defines different formulas for different input ranges. `if/elif/else` is how you write piecewise logic in Python.',
        caption:
          'Work through each cell in order. Predict the output before running every time.',
        props: {
          initialCells: [
            // ── Lesson cells ─────────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'The if statement',
              prose:
                'The simplest conditional: `if condition:` followed by an indented block. The block runs only when the condition is `True`. When `False`, the block is skipped entirely.',
              instructions:
                'Run this. Then change `x` to 3 and run again — the message disappears.',
              code: 'x = 10\nif x > 5:\n    print("x is greater than 5")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'The else clause',
              prose:
                '`else` provides a fallback. Exactly one of the two branches will always execute — there is no case where both run, and no case where neither runs.',
              instructions:
                'Try x = 10 and x = 3. Confirm that exactly one branch runs each time.',
              code: 'x = 3\nif x > 5:\n    print("big")\nelse:\n    print("small")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Indentation is syntax',
              prose:
                'The indented lines ARE the block. Python uses whitespace to define structure — not curly braces like many other languages. Use exactly 4 spaces (most editors insert this automatically with Tab).',
              instructions:
                'Run this to see an IndentationError. Then fix the indentation and run again.',
              code: 'x = 10\nif x > 5:\nprint("this will crash — no indent")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Multiple lines in a branch',
              prose:
                'A branch can contain any number of lines — all must be indented at the same level. Python treats the whole indented block as a single unit.',
              instructions:
                'Both print statements inside the if block run together when the condition is True.',
              code: 'score = 92\nif score >= 90:\n    print("Grade: A")\n    print("Excellent work!")\nprint("Done.")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'elif — multiple exclusive branches',
              prose:
                '`elif` adds more branches. Python checks each condition **in order** and runs the first matching block. Once one branch executes, the rest are skipped — even if their conditions are also True.',
              instructions:
                'Try score = 85, 72, 55. Watch which branch fires each time.',
              code: 'score = 72\nif score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelif score >= 70:\n    print("C")\nelse:\n    print("F")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'Order matters in elif chains',
              prose:
                'Because Python stops at the first True condition, order determines behavior. Putting a broader condition before a narrower one can silently swallow cases.',
              instructions:
                'This is broken — score 95 prints "passing" instead of "excellent" because the broader condition comes first. Swap the order and fix it.',
              code: 'score = 95\nif score >= 60:\n    print("passing")    # fires first — wrong!\nelif score >= 90:\n    print("excellent")  # never reached',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: 'No else — non-exhaustive branching',
              prose:
                'An `if` without an `else` is valid. If the condition is False, the block is skipped and execution continues below. Nothing special happens — no error, no output.',
              instructions:
                'Change x to -1. Notice: nothing prints, but no error either.',
              code: 'x = 5\nif x > 0:\n    print("positive")\nprint("after the if")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 8,
              cellTitle: 'Conditions are full boolean expressions',
              prose:
                'Any boolean expression from Lesson 10 works as a condition: comparisons, `and`, `or`, `not`, chained comparisons, function calls that return booleans.',
              instructions:
                'Try several values of x to verify all four regions of the number line.',
              code: 'x = 42\nif x > 0 and x % 2 == 0:\n    print("positive and even")\nelif x > 0:\n    print("positive but odd")\nelif x == 0:\n    print("zero")\nelse:\n    print("negative")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 9,
              cellTitle: 'Conditionals inside functions',
              prose:
                'Putting a conditional inside a function creates a reusable decision. The function encapsulates the branching logic — callers just provide the input.',
              instructions:
                'Call classify() with several different numbers. The function hides the branching.',
              code: 'def classify(n):\n    if n > 0:\n        return "positive"\n    elif n < 0:\n        return "negative"\n    else:\n        return "zero"\n\nprint(classify(5))\nprint(classify(-3))\nprint(classify(0))',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 10,
              cellTitle: 'Early return from a function',
              prose:
                '`return` inside a conditional exits the function immediately. Once a branch returns, the rest of the function does not run. This is called an **early return** or **guard clause**.',
              instructions:
                'Trace: when n=0, the first if fires and returns — "safe" is never reached.',
              code: 'def safe_divide(a, n):\n    if n == 0:\n        return "cannot divide by zero"\n    return a / n\n\nprint(safe_divide(10, 2))\nprint(safe_divide(10, 0))',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 11,
              cellTitle: 'Nested conditionals',
              prose:
                'An `if` block can contain another `if` block. The inner block is indented 8 spaces (two levels). Nesting adds precision but hurts readability — usually better to combine with `and`.',
              instructions:
                'Compare this to the `and` version: `if x > 0 and x < 100`. Both are equivalent.',
              code: 'x = 42\nif x > 0:\n    if x < 100:\n        print("in range")\n    else:\n        print("too large")\nelse:\n    print("not positive")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 12,
              cellTitle: 'The conditional expression (ternary)',
              prose:
                'Python has a compact inline conditional for simple cases:\n\n`value_if_true if condition else value_if_false`\n\nThis is an **expression** — it produces a value and can go anywhere a value can (assignment, argument, return).',
              instructions:
                'This is equivalent to a 4-line if/else block. Use it when the logic is simple enough to read on one line.',
              code: 'x = 7\nlabel = "odd" if x % 2 != 0 else "even"\nprint(label)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 13,
              cellTitle: 'Common mistake: = vs ==',
              prose:
                '`=` is assignment (changes state). `==` is comparison (produces a boolean). Using `=` inside an `if` condition is a SyntaxError in Python — unlike in some other languages where it silently causes bugs.',
              instructions:
                'Run the broken version to see the SyntaxError, then fix it to `==`.',
              code: '# This is a SyntaxError — Python protects you here\n# if x = 5:  ← wrong\n\nx = 5\nif x == 5:  # correct\n    print("x is five")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 14,
              cellTitle: 'Truthy/falsy in conditions',
              prose:
                'You do not need to write `== True` or `== False` explicitly. Any expression goes directly into the condition — Python evaluates its truthiness. Empty string, 0, and None are falsy; everything else is truthy.',
              instructions:
                'Each condition uses truthiness directly. What would happen if name were an empty string?',
              code: 'name = "Alice"\nif name:\n    print("Hello,", name)\nelse:\n    print("No name provided")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 15,
              cellTitle: 'Piecewise functions with elif',
              prose:
                'A classic use of `elif` chains is implementing a piecewise mathematical function — different formulas for different input regions. This is identical to the notation used in math textbooks.',
              instructions:
                'This is the "absolute value" function implemented from scratch. Try x = 5, -5, 0.',
              code: 'def my_abs(x):\n    if x > 0:\n        return x\n    elif x == 0:\n        return 0\n    else:\n        return -x\n\nprint(my_abs(-7))\nprint(my_abs(0))\nprint(my_abs(3))',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 16,
              cellTitle: 'Conditional with no action needed',
              prose:
                'Sometimes a branch should do nothing. Python provides `pass` as a placeholder — a statement that does nothing but satisfies the syntax requirement for a non-empty block.',
              instructions:
                'Without `pass`, the empty else block would be a SyntaxError.',
              code: 'x = 10\nif x < 0:\n    print("negative")\nelse:\n    pass  # nothing to do for non-negative values',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 17,
              cellTitle: 'Returning booleans directly',
              prose:
                'A common beginner pattern is `if condition: return True else: return False`. This is always redundant — just `return condition` does the same thing in one line.',
              instructions:
                'Both versions are identical. The second is idiomatic Python.',
              code: '# Verbose (anti-pattern)\ndef is_even_v1(n):\n    if n % 2 == 0:\n        return True\n    else:\n        return False\n\n# Idiomatic\ndef is_even_v2(n):\n    return n % 2 == 0\n\nprint(is_even_v1(4), is_even_v2(4))',
              output: '', status: 'idle', figureJson: null,
            },

            // ── Challenge cells ───────────────────────────────────────────────
            {
              id: 21,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Grade Classifier',
              difficulty: 'easy',
              prompt:
                'Write a function `letter_grade(score)` that returns:\n- `"A"` if score >= 90\n- `"B"` if score >= 80\n- `"C"` if score >= 70\n- `"F"` otherwise',
              instructions:
                'Use an if/elif/elif/else chain. The conditions should be checked from highest to lowest.',
              code: '# Define letter_grade(score) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'letter_grade' not in dir():
    res = "ERROR: Function 'letter_grade' not found."
elif (letter_grade(95) == "A" and letter_grade(83) == "B" and
      letter_grade(71) == "C" and letter_grade(55) == "F"):
    res = "SUCCESS: All four branches verified. Grade classifier active."
else:
    res = "ERROR: One or more cases failed. Test: letter_grade(95), letter_grade(83), letter_grade(71), letter_grade(55)."
res
`,
              hint: 'Start with if score >= 90: return "A", then elif score >= 80, etc. Order high to low.',
            },
            {
              id: 22,
              challengeType: 'fill',
              challengeNumber: 2,
              challengeTitle: 'Fix the Branching Order',
              difficulty: 'easy',
              prompt:
                'This function is broken because the branches are in the wrong order — a score of 95 returns "passing" instead of "excellent". Fix it by reordering the conditions.',
              instructions:
                'Swap the `if` and `elif` so the narrower condition comes first.',
              code: `def check_score(score):
    if score ___:        # should be the broader check
        return "passing"
    elif score ___:      # should be the narrower check
        return "excellent"
    else:
        return "failing"
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'check_score' not in dir():
    res = "ERROR: Function 'check_score' not found."
elif check_score(95) == "excellent" and check_score(70) == "passing" and check_score(40) == "failing":
    res = "SUCCESS: Order correct. Narrow condition checked first, broad condition second."
else:
    res = "ERROR: check_score(95) should be 'excellent', check_score(70) should be 'passing'."
res
`,
              hint: 'Check score >= 90 first (returns "excellent"), then score >= 60 (returns "passing"), else "failing".',
            },
            {
              id: 23,
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'FizzBuzz',
              difficulty: 'medium',
              prompt:
                'Write `fizzbuzz(n)` that returns:\n- `"FizzBuzz"` if n is divisible by both 3 and 5\n- `"Fizz"` if divisible by 3 only\n- `"Buzz"` if divisible by 5 only\n- The number as a string otherwise\n\nCompound challenge: uses `%` from Lesson 2, `and` from Lesson 10, and conditionals.',
              instructions:
                'The "FizzBuzz" case must come FIRST — it is the most specific condition.',
              code: '# Define fizzbuzz(n) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'fizzbuzz' not in dir():
    res = "ERROR: Function 'fizzbuzz' not found."
elif (fizzbuzz(15) == "FizzBuzz" and fizzbuzz(9) == "Fizz" and
      fizzbuzz(10) == "Buzz" and fizzbuzz(7) == "7"):
    res = "SUCCESS: FizzBuzz verified. All four cases correct."
else:
    res = "ERROR: Test failed. Expected: fizzbuzz(15)='FizzBuzz', fizzbuzz(9)='Fizz', fizzbuzz(10)='Buzz', fizzbuzz(7)='7'."
res
`,
              hint: 'Check n % 15 == 0 (or n%3==0 and n%5==0) first. Then n%3, then n%5, else str(n).',
            },
            {
              id: 24,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Ternary Rewrite',
              difficulty: 'medium',
              prompt:
                'Rewrite this 4-line if/else as a single ternary expression stored in `result`:\n\n```python\nif temperature >= 100:\n    result = "boiling"\nelse:\n    result = "not boiling"\n```\n\nThen verify it works for temperature = 100 and temperature = 50.',
              instructions:
                'Format: `result = value_if_true if condition else value_if_false`',
              code: 'temperature = 100\n# Write the ternary expression here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
temperature = 100
result = "boiling" if temperature >= 100 else "not boiling"
if result == "boiling":
    temperature = 50
    result = "boiling" if temperature >= 100 else "not boiling"
    if result == "not boiling":
        res = "SUCCESS: Ternary expression correct for both cases."
    else:
        res = "ERROR: temperature=50 should give 'not boiling'."
else:
    res = "ERROR: temperature=100 should give 'boiling'."
res
`,
              hint: 'result = "boiling" if temperature >= 100 else "not boiling"',
            },
            {
              id: 25,
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Safe Division with Guard',
              difficulty: 'medium',
              prompt:
                'Write `divide(a, b)` that:\n- Returns `a / b` if `b` is not zero\n- Returns `None` if `b` is zero\n\nUse an early return pattern (guard clause at the top).',
              instructions:
                'Check the dangerous case first and return early. The happy path is at the bottom.',
              code: '# Define divide(a, b) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'divide' not in dir():
    res = "ERROR: Function 'divide' not found."
elif divide(10, 2) == 5.0 and divide(10, 0) is None:
    res = "SUCCESS: Guard clause verified. divide(10, 2)=5.0, divide(10, 0)=None."
else:
    res = "ERROR: divide(10, 2) should be 5.0 and divide(10, 0) should be None."
res
`,
              hint: 'if b == 0: return None. Then return a / b.',
            },
            {
              id: 26,
              challengeType: 'write',
              challengeNumber: 6,
              challengeTitle: 'Tax Calculator',
              difficulty: 'hard',
              prompt:
                'CUMULATIVE — uses Lessons 2, 4, 9, 10, and 11.\n\nWrite `tax(income)` that returns the tax owed using these brackets:\n- Income <= 10000: 10% tax\n- 10001 to 50000: 20% tax\n- Above 50000: 30% tax\n\nReturns a float (the tax amount, not the post-tax income).',
              instructions:
                'Each bracket applies to the full income (simplified — not marginal). So tax(20000) = 20000 * 0.20 = 4000.0',
              code: '# Define tax(income) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'tax' not in dir():
    res = "ERROR: Function 'tax' not found."
elif abs(tax(5000) - 500.0) < 0.01 and abs(tax(20000) - 4000.0) < 0.01 and abs(tax(100000) - 30000.0) < 0.01:
    res = "SUCCESS: All three brackets verified. tax(5000)=500, tax(20000)=4000, tax(100000)=30000."
else:
    res = f"ERROR: Got tax(5000)={tax(5000)}, tax(20000)={tax(20000)}, tax(100000)={tax(100000)}. Check each bracket."
res
`,
              hint: 'if income <= 10000: return income * 0.10. elif income <= 50000: return income * 0.20. else: return income * 0.30.',
            },
            {
              id: 27,
              challengeType: 'fill',
              challengeNumber: 7,
              challengeTitle: 'Complete the Validator',
              difficulty: 'hard',
              prompt:
                'CUMULATIVE — fills in a password validator using boolean logic (L10) and conditionals (L11).\n\nA valid password must:\n1. Have length >= 8\n2. Contain at least one digit (use `any(c.isdigit() for c in password)` — a preview of Lesson 13)\n\nFill in the condition blanks.',
              instructions:
                'The `any(c.isdigit() for c in password)` expression is pre-written — just combine it with the length check using `and`.',
              starterBlock: `def is_valid_password(password):
    if ___ and ___:
        return "valid"
    elif ___:
        return "too short"
    else:
        return "needs a digit"
`,
              code: `def is_valid_password(password):
    if ___ and ___:
        return "valid"
    elif ___:
        return "too short"
    else:
        return "needs a digit"
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'is_valid_password' not in dir():
    res = "ERROR: Function not found."
elif (is_valid_password("hello123") == "valid" and
      is_valid_password("hi1") == "too short" and
      is_valid_password("helloworld") == "needs a digit"):
    res = "SUCCESS: All three cases validated. Password logic complete."
else:
    res = f"ERROR: Got {is_valid_password('hello123')!r}, {is_valid_password('hi1')!r}, {is_valid_password('helloworld')!r}. Expected 'valid', 'too short', 'needs a digit'."
res
`,
              hint: 'First blank: len(password) >= 8. Second blank: any(c.isdigit() for c in password). elif blank: len(password) < 8.',
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Exhaustive branching**: an `if/elif/...` chain without a final `else` can silently do nothing if no condition matches. For functions especially, make sure every possible input is handled — either with a final `else` or by reasoning that one branch is always guaranteed to fire.',
      '**Short-circuit in conditions**: you can use what you know from Lesson 10 — `x != 0 and (10 / x) > 2` is safe because the division is never reached when x is 0. This pattern replaces a nested conditional with a single guard.',
      '**Conditional expressions (ternary) have limits**: `a if cond else b` is clean for simple assignments. For multiple operations or side effects, use a full `if/else` block. Never nest ternaries — `a if c1 else b if c2 else c` is unreadable.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Forgetting the colon',
        body: 'Every `if`, `elif`, and `else` line must end with `:`. Forgetting it is a SyntaxError. Python\'s error message ("expected \':\'" ) tells you exactly what is missing.',
      },
      {
        type: 'insight',
        title: 'if/elif/else is not the only way to branch',
        body: 'Python 3.10+ added `match/case` (structural pattern matching) as a more powerful alternative for complex branching. For now, `if/elif/else` covers everything you need.',
      },
    ],
  },

  mentalModel: [
    'if runs a block when its condition is True — skips it when False.',
    'elif/else add branches; only the first True branch executes.',
    'Indentation defines the block — it is syntax, not style.',
    'Conditions are just boolean expressions from Lesson 10.',
    'Guard clauses: check the dangerous/special case first, return early.',
    'return condition directly instead of if cond: return True else: return False.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}
