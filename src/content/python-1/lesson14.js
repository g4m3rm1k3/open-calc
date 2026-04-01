// Chapter 0.5 — Lesson 13: while Loops
//
// DEPENDENCIES:
//   - Lesson 5:  State & Flow (state changes over time — core to while)
//   - Lesson 10: Boolean Logic (conditions)
//   - Lesson 11: Conditionals (if inside loops)
//   - Lesson 12: for Loops (contrast with for; accumulator pattern)
//
// TEACHES:
//   1. Why while exists — loops that run until a condition changes
//   2. Basic while loop — condition checked before each iteration
//   3. The update step — how state changes to eventually end the loop
//   4. Infinite loops — what they are and how to avoid them
//   5. while vs for — choosing the right loop
//   6. Accumulator pattern with while
//   7. Input validation loop (loop until valid)
//   8. Convergence loop — repeat until a value stops changing
//   9. break inside while
//   10. continue inside while
//   11. while/else
//   12. Counting up and down with while
//   13. The flag variable pattern
//   14. Nested while loops
//   15. Converting a for loop to while and back

export default {
  id: 'py-0-5-while-loops',
  slug: 'while-loops',
  chapter: 0.5,
  order: 14,
  title: 'while Loops',
  subtitle: 'Repeating until something changes',
  tags: ['while', 'loop', 'condition', 'infinite', 'break', 'convergence', 'flag'],

  hook: {
    question: 'What if you don\'t know in advance how many times to repeat?',
    realWorldContext:
      'A `for` loop is perfect when you know the count upfront: "do this 10 times," "process these 5 items." ' +
      'But many real problems don\'t have a fixed count: keep asking for a password until it\'s correct, ' +
      'keep refining an estimate until it\'s accurate enough, keep reading data until the file ends. ' +
      '`while` loops run for as long as a condition remains True — the exit point is determined by what happens inside.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A `while` loop checks its condition **before** each iteration. If the condition is True, the block runs. Then the condition is checked again. This repeats until the condition becomes False — at which point the loop exits and execution continues below.',
      'The critical difference from `for`: a `while` loop has no built-in counter. You are responsible for changing the state so the condition eventually becomes False. Forget the update step and you get an **infinite loop** — the program runs forever.',
      'The mental model: `while` is a repeated `if`. Every iteration asks "should I keep going?" The answer is determined by the current state of your variables.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'Every while loop needs an exit path',
        body: 'Before writing a while loop, identify: (1) what condition controls it, and (2) what inside the loop will eventually make that condition False. If neither changes, the loop runs forever.',
      },
      {
        type: 'insight',
        title: 'while is for unknown counts; for is for known sequences',
        body: 'If you know the sequence to iterate over (a range, a list, a string), use `for`. If you\'re looping until something happens — a value converges, a condition flips, a valid input arrives — use `while`.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'The State Machine',
        mathBridge:
          'A while loop is the computational equivalent of a recursive definition: apply a rule repeatedly until a base case is reached.',
        caption:
          'For every while loop: identify the condition, trace the state, confirm it terminates.',
        props: {
          initialCells: [
            // ── Lesson cells ─────────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'Basic while loop',
              prose:
                'The condition is checked before each iteration. When it becomes False, the loop exits. Here, `x` starts at 0 and grows by 1 each time — the loop stops when `x` reaches 5.',
              instructions:
                'Trace: x=0 (runs), x=1 (runs), ..., x=4 (runs), x=5 (False — exits). The final print shows x=5.',
              code: 'x = 0\nwhile x < 5:\n    print(x)\n    x += 1\nprint("Done. x =", x)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'The update step is mandatory',
              prose:
                'Without updating the variable, the condition never changes — the loop runs forever. This is an infinite loop. In a notebook, click the Stop button (■) to interrupt the kernel.',
              instructions:
                'Do NOT run this cell — it is intentionally broken to show the infinite loop pattern. Read it instead.',
              code: '# DANGER: infinite loop — do not run\n# x = 0\n# while x < 5:\n#     print(x)    # x never changes, condition never False',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'while vs for — the same count',
              prose:
                'Any `for i in range(n)` loop can be rewritten as a `while` loop with a counter. They produce identical behavior. The `for` version is preferred when you have a known sequence — it is shorter and harder to get wrong.',
              instructions:
                'Both cells produce 0, 1, 2, 3, 4. The while version requires you to manage `i` manually.',
              code: '# for version (preferred for counting)\nfor i in range(5):\n    print("for:", i)\n\n# while version (equivalent)\ni = 0\nwhile i < 5:\n    print("while:", i)\n    i += 1',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Accumulator with while',
              prose:
                'The accumulator pattern works the same as with `for`. Initialize before, update inside, read after. The difference: the loop condition drives when to stop, not a fixed count.',
              instructions:
                'This sums integers until the running total exceeds 50. We don\'t know in advance how many iterations it takes.',
              code: 'total = 0\nn = 1\nwhile total <= 50:\n    total += n\n    n += 1\nprint("Total:", total, "| Stopped at n:", n)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Counting down',
              prose:
                'While loops count in any direction. Start high, condition checks when to stop, update decrements.',
              instructions:
                'countdown starts at 5 and decrements. Loop exits when countdown hits 0.',
              code: 'countdown = 5\nwhile countdown > 0:\n    print(countdown)\n    countdown -= 1\nprint("Blastoff!")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'Loop until a condition flips — simulated input validation',
              prose:
                'A common while pattern: keep looping until valid input arrives. Here we simulate the "input" as a list of attempts, processing one per iteration.',
              instructions:
                'The loop keeps rejecting passwords until it finds one with length >= 8.',
              code: 'attempts = ["hi", "abc123", "securepwd"]\nindex = 0\npassword = attempts[index]\nwhile len(password) < 8:\n    print("Too short:", password)\n    index += 1\n    password = attempts[index]\nprint("Accepted:", password)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: 'Convergence loop',
              prose:
                'Some algorithms repeat until a value stabilizes — the difference between iterations becomes negligibly small. This is a convergence loop. The exit condition is "close enough," not "exactly equal."',
              instructions:
                'This approximates √2 using Newton\'s method. Each iteration gets closer. The loop stops when two consecutive estimates differ by less than 0.0001.',
              code: 'guess = 1.0\ntarget = 2.0\nwhile abs(guess * guess - target) > 0.0001:\n    guess = (guess + target / guess) / 2\nprint("√2 ≈", round(guess, 6))',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 8,
              cellTitle: 'break inside while',
              prose:
                '`break` exits the while loop immediately, regardless of the condition. Useful when you find what you\'re looking for mid-loop.',
              instructions:
                'The loop searches for the first number divisible by both 7 and 11. Once found, break exits immediately.',
              code: 'n = 1\nwhile n <= 1000:\n    if n % 7 == 0 and n % 11 == 0:\n        print("Found:", n)\n        break\n    n += 1',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 9,
              cellTitle: 'continue inside while',
              prose:
                '`continue` skips the rest of the current iteration and goes back to check the condition. The update step must still happen before `continue` — or you risk an infinite loop.',
              instructions:
                'This prints only odd numbers from 1–10. The continue skips the print for even numbers — but n += 1 happens first to avoid an infinite loop.',
              code: 'n = 0\nwhile n < 10:\n    n += 1          # update BEFORE continue\n    if n % 2 == 0:\n        continue\n    print(n)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 10,
              cellTitle: 'while/else',
              prose:
                'Like `for`, `while` has an optional `else` clause. The `else` block runs if the loop exited normally (condition became False). It is skipped if a `break` fired.',
              instructions:
                'Change the target to 999 — the while loop exhausts without finding it, so else fires.',
              code: 'target = 77\nn = 1\nwhile n <= 100:\n    if n % 7 == 0 and n % 11 == 0:\n        print("Found at n =", n)\n        break\n    n += 1\nelse:\n    print("Not found in range 1–100")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 11,
              cellTitle: 'The flag variable pattern',
              prose:
                'A boolean flag variable makes the loop\'s purpose explicit. Set it to False when the exit condition is met. This is more readable than a compound condition in the while header.',
              instructions:
                'The flag `found` starts False and flips to True when the target is located. The while condition is simple: just check the flag.',
              code: 'found = False\nn = 1\nwhile not found:\n    if n % 13 == 0 and n % 7 == 0:\n        found = True\n    else:\n        n += 1\nprint("First multiple of 7 and 13:", n)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 12,
              cellTitle: 'while True with break',
              prose:
                '`while True` creates a deliberately infinite loop — the only exit is an explicit `break`. This is idiomatic when the exit condition is complex or checked in the middle of the block.',
              instructions:
                'This is an "infinite loop with controlled exit." The break in the middle exits cleanly.',
              code: 'n = 1\nwhile True:\n    if n > 5:\n        break\n    print(n)\n    n += 1',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 13,
              cellTitle: 'Nested while loops',
              prose:
                'A while loop inside another while loop. The inner loop runs completely for each iteration of the outer loop. Total iterations = product of both counts.',
              instructions:
                'This prints a 3×3 grid of (outer, inner) pairs. Trace: for each outer value, inner goes 1→3.',
              code: 'outer = 1\nwhile outer <= 3:\n    inner = 1\n    while inner <= 3:\n        print(f"({outer},{inner})", end=" ")\n        inner += 1\n    print()\n    outer += 1',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 14,
              cellTitle: 'Collatz conjecture loop',
              prose:
                'A famous example where we don\'t know how many iterations a while loop will take: the Collatz sequence. If n is even, halve it; if odd, multiply by 3 and add 1. Repeat until n = 1.',
              instructions:
                'Start with n = 27. Count the steps. The sequence is chaotic but always reaches 1 (as far as we know).',
              code: 'n = 27\nsteps = 0\nwhile n != 1:\n    if n % 2 == 0:\n        n //= 2\n    else:\n        n = 3 * n + 1\n    steps += 1\nprint("Steps to reach 1:", steps)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 15,
              cellTitle: 'Digit reversal with while',
              prose:
                'The digit-extraction pattern from Lesson 12 is naturally a while loop: keep going while there are digits left. We don\'t know the count in advance — we stop when the number reaches 0.',
              instructions:
                'This reverses 1234 into 4321 by extracting digits from the right and building from the left.',
              code: 'n = 1234\nreversed_n = 0\nwhile n > 0:\n    digit = n % 10\n    reversed_n = reversed_n * 10 + digit\n    n //= 10\nprint("Reversed:", reversed_n)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 16,
              cellTitle: 'Comparing while and for on the same problem',
              prose:
                'Rule of thumb: if you can write it cleanly with `for`, do so. Use `while` when: (1) the count is unknown, (2) the exit condition is based on computed state, or (3) you need to exit from the middle with `break`.',
              instructions:
                'Both find the sum 1+2+...+n where the sum first exceeds 100. The while version is more natural here.',
              code: '# while version — natural for "until" conditions\ntotal = 0\nn = 0\nwhile total <= 100:\n    n += 1\n    total += n\nprint(f"Sum {total} first exceeds 100 at n={n}")',
              output: '', status: 'idle', figureJson: null,
            },

            // ── Challenge cells ───────────────────────────────────────────────
            {
              id: 21,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Power of Two',
              difficulty: 'easy',
              prompt:
                'Write a while loop that starts with `p = 1` and keeps doubling it until `p` exceeds 1000. Print each value of `p` as it doubles.',
              instructions:
                'The loop condition is p <= 1000. The update is p *= 2.',
              code: 'p = 1\n# Write your while loop here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
p = 1
values = []
while p <= 1000:
    values.append(p)
    p *= 2
if values == [1, 2, 4, 8, 16, 32, 64, 128, 256, 512]:
    res = "SUCCESS: Powers of 2 up to 1000 verified. p doubles each iteration."
else:
    res = f"ERROR: Expected [1,2,4,...,512], got {values}."
res
`,
              hint: 'while p <= 1000: print(p), then p *= 2',
            },
            {
              id: 22,
              challengeType: 'fill',
              challengeNumber: 2,
              challengeTitle: 'Fill the Convergence Loop',
              difficulty: 'easy',
              prompt:
                'Fill in the blanks to complete a loop that repeatedly halves `x` until it falls below 0.01.',
              instructions:
                'The condition checks if x is still too large. The update halves x.',
              starterBlock: `x = 100.0
while ___:
    x ___= 2
print(round(x, 6))
`,
              code: `x = 100.0
while ___:
    x ___= 2
print(round(x, 6))
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
x = 100.0
while x >= 0.01:
    x /= 2
if abs(x - 0.006104) < 0.0001:
    res = "SUCCESS: x halved until below 0.01. Final value ≈ 0.006104."
else:
    res = f"ERROR: Expected ≈0.006104, got {round(x, 6)}. Check condition (x >= 0.01) and update (x /= 2)."
res
`,
              hint: 'Condition: x >= 0.01. Update: x /= 2 (divide by 2 each step)',
            },
            {
              id: 23,
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Sum Until Limit',
              difficulty: 'medium',
              prompt:
                'Write `sum_until(limit)` that adds consecutive integers 1, 2, 3, ... until the running total would EXCEED `limit`. Return the total at that point.\n\nCompound: accumulator pattern + while condition.',
              instructions:
                'Keep adding while total + next_n <= limit. Stop before you exceed it.',
              code: '# Define sum_until(limit) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'sum_until' not in dir():
    res = "ERROR: Function 'sum_until' not found."
elif sum_until(10) == 10 and sum_until(15) == 15 and sum_until(11) == 10:
    res = "SUCCESS: sum_until verified. Stops before exceeding the limit."
else:
    res = f"ERROR: Got sum_until(10)={sum_until(10)}, sum_until(11)={sum_until(11)}. The sum should not exceed the limit."
res
`,
              hint: 'n=1, total=0. while total + n <= limit: total += n, n += 1. return total',
            },
            {
              id: 24,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Collatz Steps',
              difficulty: 'medium',
              prompt:
                'Write `collatz_steps(n)` that returns the number of steps to reach 1 using the Collatz rule:\n- If n is even: n = n // 2\n- If n is odd: n = 3 * n + 1\n\nCompound: uses `%` (L2), conditionals (L11), while loops (L13).',
              instructions:
                'Count steps until n == 1. Do not count the final state (n=1 is the stopping point, not a step).',
              code: '# Define collatz_steps(n) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'collatz_steps' not in dir():
    res = "ERROR: Function 'collatz_steps' not found."
elif collatz_steps(1) == 0 and collatz_steps(2) == 1 and collatz_steps(6) == 8:
    res = "SUCCESS: Collatz steps verified. collatz_steps(6)=8, collatz_steps(2)=1."
else:
    res = f"ERROR: Got collatz_steps(1)={collatz_steps(1)}, collatz_steps(2)={collatz_steps(2)}, collatz_steps(6)={collatz_steps(6)}."
res
`,
              hint: 'steps=0, while n != 1: apply rule, steps += 1. return steps',
            },
            {
              id: 25,
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'GCD with Euclid\'s Algorithm',
              difficulty: 'medium',
              prompt:
                'Write `gcd(a, b)` using Euclid\'s algorithm:\n- While b != 0: replace (a, b) with (b, a % b)\n- Return a\n\nThis is a classic "loop until convergence" pattern.\nExample: gcd(48, 18) → 6',
              instructions:
                'Use simultaneous assignment: `a, b = b, a % b` each iteration.',
              code: '# Define gcd(a, b) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'gcd' not in dir():
    res = "ERROR: Function 'gcd' not found."
elif gcd(48, 18) == 6 and gcd(100, 75) == 25 and gcd(17, 5) == 1:
    res = "SUCCESS: Euclid's algorithm verified. gcd(48,18)=6, gcd(100,75)=25, gcd(17,5)=1."
else:
    res = f"ERROR: Got gcd(48,18)={gcd(48,18)}, gcd(100,75)={gcd(100,75)}, gcd(17,5)={gcd(17,5)}."
res
`,
              hint: 'while b != 0: a, b = b, a % b. return a',
            },
            {
              id: 26,
              challengeType: 'fill',
              challengeNumber: 6,
              challengeTitle: 'Number Guessing Logic',
              difficulty: 'hard',
              prompt:
                'Fill in the while loop that simulates a number-guessing game. The loop keeps trying guesses from a list until it finds the secret or exhausts all attempts.',
              instructions:
                'The loop exits on a correct guess (break) or when all attempts are used (condition). The for/else reports the outcome.',
              starterBlock: `secret = 42
attempts = [10, 55, 42, 99]
index = 0

while ___ and ___:
    guess = attempts[index]
    if guess ___:
        print("Too low")
    elif guess ___:
        print("Too high")
    index += 1

if index < len(attempts) and attempts[index - 1] == secret:
    print("Found it!")
else:
    print("Ran out of attempts")
`,
              code: `secret = 42
attempts = [10, 55, 42, 99]
index = 0

while ___ and ___:
    guess = attempts[index]
    if guess ___:
        print("Too low")
    elif guess ___:
        print("Too high")
    index += 1

if index < len(attempts) and attempts[index - 1] == secret:
    print("Found it!")
else:
    print("Ran out of attempts")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
secret = 42
attempts = [10, 55, 42, 99]
index = 0
results = []
while index < len(attempts) and attempts[index] != secret:
    guess = attempts[index]
    if guess < secret:
        results.append("low")
    elif guess > secret:
        results.append("high")
    index += 1
found = index < len(attempts) and attempts[index] == secret
if results == ["low", "high"] and found:
    res = "SUCCESS: Loop terminates when secret is found. Correct low/high feedback."
else:
    res = f"ERROR: Expected ['low','high'] then found. Got {results}, found={found}."
res
`,
              hint: 'Conditions: index < len(attempts) and attempts[index] != secret. Comparisons: guess < secret and guess > secret',
            },
            {
              id: 27,
              challengeType: 'write',
              challengeNumber: 7,
              challengeTitle: 'Integer Square Root',
              difficulty: 'hard',
              prompt:
                'CUMULATIVE — Lessons 2, 9, 10, 11, 13.\n\nWrite `isqrt(n)` that returns the largest integer `k` such that `k * k <= n`, without using `**` or any math library.\n\nUse a while loop that increments a counter until it overshoots, then steps back by 1.\n\nExamples: isqrt(16)=4, isqrt(17)=4, isqrt(25)=5, isqrt(2)=1',
              instructions:
                'Start k=0, keep incrementing while k*k <= n, then return k-1.',
              code: '# Define isqrt(n) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'isqrt' not in dir():
    res = "ERROR: Function 'isqrt' not found."
elif isqrt(16) == 4 and isqrt(17) == 4 and isqrt(25) == 5 and isqrt(2) == 1 and isqrt(1) == 1:
    res = "SUCCESS: Integer square root verified. isqrt(16)=4, isqrt(17)=4, isqrt(25)=5."
else:
    res = f"ERROR: Got isqrt(16)={isqrt(16)}, isqrt(17)={isqrt(17)}, isqrt(25)={isqrt(25)}."
res
`,
              hint: 'k=0. while k*k <= n: k += 1. return k - 1',
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Termination proof**: before writing a while loop, you should be able to argue why it terminates. Identify a quantity that changes monotonically toward the exit condition (e.g., n decreases by at least 1 each iteration, total strictly increases). If no such quantity exists, the loop may not terminate.',
      '**continue + update ordering**: when using `continue` inside a while loop, make sure the update step runs before the `continue`. Otherwise the loop variable never changes and the loop runs infinitely. This is one of the most common while loop bugs.',
      '**while True is not always bad**: `while True: ... break` is idiomatic when the natural exit check belongs in the middle of the block, not the top. It is also used in event loops and servers that run "forever" by design.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Off-by-one in the exit condition',
        body: '`while x < 5` stops when x==5 (x is 0–4). `while x <= 5` stops when x==6 (x is 0–5). The choice between `<` and `<=` shifts the last iteration. Always trace the boundary case before running.',
      },
      {
        type: 'insight',
        title: 'Most while loops can be written as for loops with itertools',
        body: 'Python\'s `itertools` module provides `takewhile`, `dropwhile`, and `count` that express many while-loop patterns as iterators. You will encounter these in Phase 3 (data pipelines). For now, explicit while loops make the mechanics visible.',
      },
    ],
  },

  mentalModel: [
    'while checks condition before each iteration — exits when condition is False.',
    'Always identify what changes inside the loop to eventually make the condition False.',
    'for = known sequence; while = unknown count / condition-driven exit.',
    'continue before update in a while loop → infinite loop (common bug).',
    'while True + break = "exit from the middle" pattern.',
    'while/else: else runs only if the loop exited normally (no break).',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}
