// Chapter 0.5 — Lesson 12: for Loops
//
// DEPENDENCIES:
//   - Lesson 5:  State & Flow (sequential execution, accumulation)
//   - Lesson 10: Boolean Logic (conditions for break)
//   - Lesson 11: Conditionals (combining if inside loops)
//
// TEACHES:
//   1. Why loops exist — the duplication problem
//   2. range(stop) — generate a sequence of integers
//   3. Basic for loop — iterate over a range
//   4. The loop variable — what it holds each iteration
//   5. range(start, stop) — control where counting begins
//   6. range(start, stop, step) — count by any increment
//   7. Counting down — negative step
//   8. The accumulator pattern — building up a result
//   9. Finding min/max in a loop
//  10. Nested for loops
//  11. break — exit the loop early
//  12. continue — skip current iteration
//  13. Looping over a string (preview of sequences)
//  14. The _ throwaway variable
//  15. for/else — code that runs when no break occurred

export default {
  id: 'py-0-5-for-loops',
  slug: 'for-loops',
  chapter: 0.5,
  order: 12,
  title: 'for Loops',
  subtitle: 'Repeating without repeating yourself',
  tags: ['for', 'range', 'iteration', 'loop', 'accumulator', 'break', 'continue'],

  hook: {
    question: 'What if you need to do the same thing a thousand times?',
    realWorldContext:
      'Every useful program repeats something: check each transaction in a bank account, ' +
      'process each pixel in an image, train a model over millions of data points. ' +
      'Writing the same line a thousand times is not programming — it is copying. ' +
      'A loop says: "repeat this block, varying one thing each time." ' +
      'The `for` loop is Python\'s tool for when you know in advance how many times to repeat.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Without loops, repetition means duplication — the same code copy-pasted five times. Change the logic and you have to change it five places. This violates the DRY principle: **Don\'t Repeat Yourself**.',
      'A `for` loop says: "for each value in this sequence, run this block with that value." The sequence is provided by `range()`, which generates integers on demand. The loop variable takes on each value in turn.',
      'The **accumulator pattern** is the most important loop pattern: initialize a variable before the loop, update it each iteration, read the result after the loop. It is how you sum, count, build strings, and find extrema.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'range(n) generates 0 to n−1',
        body: '`range(5)` produces `0, 1, 2, 3, 4` — five values starting at 0, stopping before 5. The stop value is always excluded. This matches Python\'s zero-based indexing convention.',
      },
      {
        type: 'insight',
        title: 'The loop variable is just a variable',
        body: 'The name after `for` (e.g., `i` in `for i in range(5)`) is an ordinary variable. It is assigned a new value at the start of each iteration and persists in scope after the loop ends — holding the last value it was assigned.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'The Iteration Engine',
        mathBridge:
          'A for loop is the computational equivalent of Σ (sigma) notation in mathematics: repeat an operation for each integer from a start to a stop value.',
        caption:
          'Predict the output of every cell before running. The loop variable is the key to trace.',
        props: {
          initialCells: [
            // ── Lesson cells ─────────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'The duplication problem',
              prose:
                'Without loops, repetition means copy-paste. This prints "hello" five times — but changing it to 100 times means 100 lines of code.',
              instructions:
                'This works, but it does not scale. The loop version does.',
              code: 'print("hello")\nprint("hello")\nprint("hello")\nprint("hello")\nprint("hello")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'range(n) — a sequence of integers',
              prose:
                '`range(n)` generates integers from `0` up to (but not including) `n`. It is lazy — it does not create a list, it produces values one at a time. Wrap it in `list()` to see all values at once.',
              instructions:
                'Run to confirm: range(5) gives 0, 1, 2, 3, 4 — five values, starting at 0.',
              code: 'list(range(5))',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Basic for loop',
              prose:
                'The `for` loop iterates over a sequence. Each iteration assigns the next value to the loop variable and runs the indented block.',
              instructions:
                'The loop variable `i` takes on 0, 1, 2, 3, 4 in order. The block runs 5 times.',
              code: 'for i in range(5):\n    print(i)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'The loop variable in expressions',
              prose:
                'The loop variable can be used in any expression inside the block. It changes each iteration, so the expression produces a different value each time.',
              instructions:
                'Trace: i=0 → 0², i=1 → 1², ..., i=4 → 16. Predict before running.',
              code: 'for i in range(5):\n    print(i ** 2)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'range(start, stop)',
              prose:
                '`range(start, stop)` begins at `start` (inclusive) and ends before `stop` (exclusive). Both boundaries are controlled.',
              instructions:
                'range(1, 6) gives 1, 2, 3, 4, 5 — not 0, and not 6.',
              code: 'for i in range(1, 6):\n    print(i)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'range(start, stop, step)',
              prose:
                'The third argument is the step — how much to add each time. Default is 1. Use 2 to count evens, 10 to count by tens.',
              instructions:
                'This prints every even number from 0 to 10. Try step=3.',
              code: 'for i in range(0, 11, 2):\n    print(i)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: 'Counting down — negative step',
              prose:
                'A negative step counts backwards. `range(10, 0, -1)` counts from 10 down to 1. Note: start > stop when step is negative.',
              instructions:
                'Countdown from 5 to 1. Change to range(10, 0, -2) for a skip-counting countdown.',
              code: 'for i in range(5, 0, -1):\n    print(i)\nprint("Go!")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 8,
              cellTitle: 'The accumulator pattern — summing',
              prose:
                'Initialize before the loop, update inside, read after. This is the most important loop pattern. It generalizes to sums, products, counts, string-building, and more.',
              instructions:
                'Trace: total starts at 0, then 1, 3, 6, 10, 15. The loop variable drives the addition.',
              code: 'total = 0\nfor i in range(1, 6):\n    total += i\nprint("Sum:", total)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 9,
              cellTitle: 'Accumulator — counting matches',
              prose:
                'Count how many numbers in a range satisfy a condition. The accumulator starts at 0 and increments by 1 each time the condition is True.',
              instructions:
                'How many numbers from 1–20 are divisible by 3? Count them.',
              code: 'count = 0\nfor i in range(1, 21):\n    if i % 3 == 0:\n        count += 1\nprint("Divisible by 3:", count)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 10,
              cellTitle: 'Accumulator — building a string',
              prose:
                'The accumulator pattern works on strings too. Start with an empty string `""`, then append to it each iteration.',
              instructions:
                'This builds "01234" character by character. The loop variable is converted to string first.',
              code: 'result = ""\nfor i in range(5):\n    result += str(i)\nprint(result)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 11,
              cellTitle: 'Nested for loops',
              prose:
                'A loop inside a loop. For each iteration of the outer loop, the inner loop runs completely. Total iterations = outer count × inner count.',
              instructions:
                'This prints a 3×3 multiplication table. Outer loop = rows, inner loop = columns.',
              code: 'for i in range(1, 4):\n    for j in range(1, 4):\n        print(i * j, end=" ")\n    print()  # newline after each row',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 12,
              cellTitle: 'break — exit the loop early',
              prose:
                '`break` immediately exits the loop, skipping all remaining iterations. Useful when you find what you were looking for and do not need to keep going.',
              instructions:
                'The loop stops as soon as i == 3. Change the break condition and watch the behavior change.',
              code: 'for i in range(10):\n    if i == 3:\n        break\n    print(i)\nprint("Loop ended at i =", i)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 13,
              cellTitle: 'continue — skip current iteration',
              prose:
                '`continue` skips the rest of the current iteration\'s block and jumps to the next value. The loop itself keeps running — only the current iteration is cut short.',
              instructions:
                'This prints all numbers from 0–9 EXCEPT multiples of 3. Compare with break: the loop continues.',
              code: 'for i in range(10):\n    if i % 3 == 0:\n        continue\n    print(i)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 14,
              cellTitle: 'Looping over a string',
              prose:
                '`for` works on any iterable — not just `range()`. A string is iterable: the loop variable takes on each character in turn.',
              instructions:
                'This iterates over each character in "Python". Sequences are covered fully in the next chapter.',
              code: 'for ch in "Python":\n    print(ch)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 15,
              cellTitle: 'The _ throwaway variable',
              prose:
                'When you need to repeat N times but do not care about the loop variable\'s value, use `_` as the name. It signals to readers: "I am not using this value — I just need the repetition."',
              instructions:
                'This prints "hello" 3 times. The loop variable _ is never used inside the block.',
              code: 'for _ in range(3):\n    print("hello")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 16,
              cellTitle: 'for/else — code after a successful loop',
              prose:
                'Python\'s `for` loop has an optional `else` clause. The `else` block runs if the loop completed **without** hitting a `break`. If `break` fired, `else` is skipped.',
              instructions:
                'Try changing the target to a number not in range (e.g., 99). The else fires and says "not found".',
              code: 'target = 7\nfor i in range(10):\n    if i == target:\n        print("Found:", i)\n        break\nelse:\n    print("Not found in range")',
              output: '', status: 'idle', figureJson: null,
            },

            // ── Challenge cells ───────────────────────────────────────────────
            {
              id: 21,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Sum of Squares',
              difficulty: 'easy',
              prompt:
                'Use a `for` loop and the accumulator pattern to compute the sum of squares from 1 to 10:\n\n1² + 2² + 3² + ... + 10² = 385\n\nStore the result in `total`.',
              instructions:
                'Initialize total = 0, loop over range(1, 11), add i**2 each iteration.',
              code: '# Write your loop here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
total = 0
for i in range(1, 11):
    total += i ** 2
if total == 385:
    res = "SUCCESS: Sum of squares 1–10 = 385. Accumulator pattern confirmed."
else:
    res = f"ERROR: Expected 385, got {total}. Did you square i inside the loop?"
res
`,
              hint: 'total = 0, then for i in range(1, 11): total += i ** 2',
            },
            {
              id: 22,
              challengeType: 'fill',
              challengeNumber: 2,
              challengeTitle: 'Countdown Timer',
              difficulty: 'easy',
              prompt:
                'Fill in the blanks to print a countdown from 5 to 1, then print "Liftoff!".',
              instructions:
                'Use range with a negative step. The stop value is 0 (exclusive), so the loop goes 5, 4, 3, 2, 1.',
              starterBlock: `for i in range(___, ___, ___):
    print(i)
print("Liftoff!")
`,
              code: `for i in range(___, ___, ___):
    print(i)
print("Liftoff!")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
output = []
for i in range(5, 0, -1):
    output.append(i)
if output == [5, 4, 3, 2, 1]:
    res = "SUCCESS: Countdown verified. range(5, 0, -1) produces 5, 4, 3, 2, 1."
else:
    res = f"ERROR: Expected [5,4,3,2,1], got {output}. Use range(5, 0, -1)."
res
`,
              hint: 'range(5, 0, -1) — start=5, stop=0 (exclusive), step=-1',
            },
            {
              id: 23,
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Count Even Numbers',
              difficulty: 'medium',
              prompt:
                'Write a function `count_evens(n)` that counts how many even numbers exist from 1 to n (inclusive).\n\nCompound: uses `%` from Lesson 2 and conditionals from Lesson 11.',
              instructions:
                'Use an accumulator starting at 0. Inside the loop, check if i % 2 == 0.',
              code: '# Define count_evens(n) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'count_evens' not in dir():
    res = "ERROR: Function 'count_evens' not found."
elif count_evens(10) == 5 and count_evens(1) == 0 and count_evens(6) == 3:
    res = "SUCCESS: count_evens verified. 1–10 has 5 evens, 1–6 has 3 evens."
else:
    res = f"ERROR: Got count_evens(10)={count_evens(10)}, count_evens(6)={count_evens(6)}. Check the range and condition."
res
`,
              hint: 'for i in range(1, n+1): if i % 2 == 0: count += 1',
            },
            {
              id: 24,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'First Multiple Finder',
              difficulty: 'medium',
              prompt:
                'Write `first_multiple(divisor, limit)` that returns the first number in range(1, limit+1) that is divisible by `divisor`. If none exists, return -1.\n\nUse `break` when you find it.',
              instructions:
                'Loop, check divisibility, break on first match. Use for/else to return -1 if no match.',
              code: '# Define first_multiple(divisor, limit) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'first_multiple' not in dir():
    res = "ERROR: Function 'first_multiple' not found."
elif first_multiple(7, 20) == 7 and first_multiple(6, 5) == -1 and first_multiple(4, 20) == 4:
    res = "SUCCESS: first_multiple verified. break and for/else working correctly."
else:
    res = f"ERROR: Got first_multiple(7,20)={first_multiple(7,20)}, first_multiple(6,5)={first_multiple(6,5)}."
res
`,
              hint: 'for i in range(1, limit+1): if i % divisor == 0: return i. After the loop: return -1.',
            },
            {
              id: 25,
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Multiplication Table Row',
              difficulty: 'medium',
              prompt:
                'Write `times_table(n)` that returns a string of the n-times table from 1×n to 10×n, one per line.\n\nExample: `times_table(3)` starts with:\n```\n1 x 3 = 3\n2 x 3 = 6\n...\n```',
              instructions:
                'Use a string accumulator. Add a newline `\\n` after each line except the last (or use .strip() at the end).',
              code: '# Define times_table(n) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'times_table' not in dir():
    res = "ERROR: Function 'times_table' not found."
else:
    result = times_table(3)
    lines = result.strip().split("\\n")
    if len(lines) == 10 and lines[0].strip() == "1 x 3 = 3" and lines[9].strip() == "10 x 3 = 30":
        res = "SUCCESS: times_table(3) verified. 10 lines, correct format."
    else:
        res = f"ERROR: Expected 10 lines starting '1 x 3 = 3'. Got {len(lines)} lines. First: {lines[0] if lines else 'none'}."
res
`,
              hint: 'result = "". for i in range(1, 11): result += f"{i} x {n} = {i*n}\\n". return result.strip()',
            },
            {
              id: 26,
              challengeType: 'write',
              challengeNumber: 6,
              challengeTitle: 'Digit Sum',
              difficulty: 'hard',
              prompt:
                'CUMULATIVE — uses Lessons 2, 4, 9, 11, and 12.\n\nWrite `digit_sum(n)` that returns the sum of all digits of a positive integer.\n\nExample: `digit_sum(1234)` = 1 + 2 + 3 + 4 = 10\n\nHint: use `%` and `//` to extract digits one at a time in a loop.',
              instructions:
                'Loop while n > 0: extract last digit with n % 10, add to total, remove it with n //= 10.',
              code: '# Define digit_sum(n) here\n# Use a while-style approach with //= and %\n# (you will learn while loops next — but for loops over digits also work)\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'digit_sum' not in dir():
    res = "ERROR: Function 'digit_sum' not found."
elif digit_sum(1234) == 10 and digit_sum(9) == 9 and digit_sum(100) == 1 and digit_sum(999) == 27:
    res = "SUCCESS: digit_sum verified. 1234→10, 999→27. Digit extraction mastered."
else:
    res = f"ERROR: Got digit_sum(1234)={digit_sum(1234)}, digit_sum(999)={digit_sum(999)}. Trace: extract last digit with n%10, remove with n//=10."
res
`,
              hint: 'total=0. Loop: total += n%10, then n //= 10. Stop when n becomes 0. Can also use: for d in str(n): total += int(d)',
            },
            {
              id: 27,
              challengeType: 'fill',
              challengeNumber: 7,
              challengeTitle: 'Skip and Collect',
              difficulty: 'hard',
              prompt:
                'CUMULATIVE — uses Lessons 10, 11, and 12.\n\nFill in the loop body to build a string of all numbers from 1–20 that are:\n- NOT divisible by 2\n- NOT divisible by 5\n\nSeparated by spaces. Expected: `"1 3 7 9 11 13 17 19"`',
              instructions:
                'Use `continue` to skip numbers that fail either condition. Accumulate the rest.',
              starterBlock: `result = ""
for i in range(1, 21):
    if ___ or ___:
        continue
    result += str(i) + " "
result = result.strip()
result
`,
              code: `result = ""
for i in range(1, 21):
    if ___ or ___:
        continue
    result += str(i) + " "
result = result.strip()
result
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
result = ""
for i in range(1, 21):
    if i % 2 == 0 or i % 5 == 0:
        continue
    result += str(i) + " "
result = result.strip()
if result == "1 3 7 9 11 13 17 19":
    res = "SUCCESS: Skip-and-collect verified. continue skipped evens and multiples of 5."
else:
    res = f"ERROR: Expected '1 3 7 9 11 13 17 19', got {result!r}."
res
`,
              hint: 'if i % 2 == 0 or i % 5 == 0: continue',
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**range() is lazy**: `range(1000000)` does not allocate a million integers in memory. It generates them one at a time on demand. This is why large ranges are efficient in Python.',
      '**Loop variable scope**: unlike some languages, Python\'s loop variable persists after the loop ends. After `for i in range(5)`, `i` is `4` in the enclosing scope. This is a common source of bugs when the variable name is reused.',
      '**break exits only the innermost loop**: in a nested loop, `break` exits the inner loop but not the outer. To break out of both, you typically use a flag variable or a function with `return`.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Modifying the loop variable does not affect the sequence',
        body: 'Inside `for i in range(5)`, writing `i = 10` changes the local name `i` for that iteration — but the next iteration still gets the next value from range. You cannot skip iterations by modifying the variable.',
      },
      {
        type: 'insight',
        title: 'for loops are not just for counting',
        body: '`for` works on any iterable: strings, lists, tuples, files, generators. The range-based loop is just the most common form. When you reach data structures, `for item in my_list` will feel completely natural.',
      },
    ],
  },

  mentalModel: [
    'range(n) → 0 to n−1. range(a, b) → a to b−1. range(a, b, s) → step by s.',
    'The loop block runs once per value; the variable holds the current value.',
    'Accumulator: initialize before, update inside, read after.',
    'break exits the loop; continue skips to the next iteration.',
    'for/else: else runs only if no break occurred.',
    '_ as loop variable signals "I need the repetition, not the value."',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}
