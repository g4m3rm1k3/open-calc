# Before SICP — LAB 06 — Recursion: A Function That Calls Itself

**Prerequisites:** LAB 05. You know: functions, the substitution model,
conditionals and predicates, tracing evaluation.

**What this lab adds:**
- You write a function that calls itself
- You understand the two required parts of any recursive function: base case and recursive case
- You trace a recursive call all the way to its answer
- You write `factorial`, `sum_of_integers`, and `count_down`

**Time:** 45–55 minutes

---

> **Quick Check — answer these before reading further:**
>
> 1. If a function calls itself, won't it call itself forever? How does it ever stop?
> 2. The factorial of 5 (written 5!) is `5 × 4 × 3 × 2 × 1 = 120`. Notice that
>    `5! = 5 × 4!`. And `4! = 4 × 3!`. See the pattern? How would you express
>    factorial in terms of itself?
> 3. What is `0!`? (This is not a trick — it is a defined value. Look it up if
>    you need to. SICP starts with this exact question.)
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `factorial` function that correctly computes any non-negative integer's factorial:

```javascript
const factorial = n => n === 0 ? 1 : n * factorial(n - 1);

factorial(0)   // → 1
factorial(1)   // → 1
factorial(5)   // → 120
factorial(10)  // → 3628800
```

And an understanding of how to trace a recursive call:

```
factorial(4)
  → 4 * factorial(3)
  → 4 * (3 * factorial(2))
  → 4 * (3 * (2 * factorial(1)))
  → 4 * (3 * (2 * (1 * factorial(0))))
  → 4 * (3 * (2 * (1 * 1)))
  → 4 * (3 * (2 * 1))
  → 4 * (3 * 2)
  → 4 * 6
  → 24
```

This trace is exactly what SICP uses to introduce recursion in Chapter 1.2.

---

## The Problem: Some Computations Repeat on Smaller Versions of Themselves

To sum the integers from 1 to 5: `1 + 2 + 3 + 4 + 5 = 15`.
To sum from 1 to 6: `1 + 2 + 3 + 4 + 5 + 6 = 21`.

Notice: sum-to-6 = 6 + sum-to-5. Sum-to-5 = 5 + sum-to-4.
The problem gets smaller by one each time, until you reach a trivial case you
know the answer to immediately.

This "solve a smaller version of the same problem" structure is called **recursion**.

---

### Concept: Recursion

**What it is:** A function that calls itself as part of computing its result.
Each call works on a smaller version of the problem, until the smallest possible
case (the **base case**) is reached.

**The two required parts (both must exist):**
1. **Base case:** A condition that produces a result WITHOUT calling the function again.
   This is how the recursion stops.
2. **Recursive case:** A condition that calls the function again, on a smaller input.

**What it hides:** The loop. Without recursion, you would need an explicit loop
construct to repeat a computation. Recursion expresses repetition through
self-reference — no loop needed. SICP teaches recursion exclusively in early
chapters and introduces iteration separately later.

**Canonical example:**
```
Real-world: Russian nesting dolls (Matryoshka).
Opening a doll: "is there a smaller doll inside? If yes, open it. If not, you're done."
The dolls are the recursive calls. The smallest solid doll is the base case.

In code:
const countdown = n =>
    n === 0 ? "Done!"        // base case: stop here
             : countdown(n - 1);  // recursive case: smaller n

countdown(3)
  → countdown(2)
  → countdown(1)
  → countdown(0)
  → "Done!"
```

**Watch for:** A recursive function without a base case never stops — it calls
itself forever until the system runs out of memory (a stack overflow). Always
write the base case FIRST.

---

## Step 1 — The Countdown Function

Start with the simplest possible recursive function:

```javascript
const countdown = n => n === 0 ? 0 : countdown(n - 1);
```

**OPEN CONSOLE AND TRY:**

```javascript
countdown(3)
```

**Expected:** `0` — it just counts down to zero and returns it.

This function does not compute anything interesting yet — it just recurses.
Trace it:

```
countdown(3)
  → countdown(3 - 1)       (3 === 0 is false → recursive case)
  → countdown(2)           (evaluate 3 - 1 = 2)
  → countdown(2 - 1)       (2 === 0 is false → recursive case)
  → countdown(1)
  → countdown(1 - 1)       (1 === 0 is false → recursive case)
  → countdown(0)
  → 0                      (0 === 0 is true → base case → return 0)
```

**Key observations:**
- The recursive case makes n smaller: `n - 1`. Every call brings us closer to the base case.
- The base case `n === 0` stops the recursion.
- Without the base case, this would run forever.

**Break it on purpose:** Remove the base case:

```javascript
const broken = n => broken(n - 1);
broken(5)
```

**Expected:** Eventually an error: `Maximum call stack size exceeded`. The function
called itself without ever stopping. The "call stack" is a limited-size memory
region that tracks function calls — when it fills up, JavaScript throws an error.

> **Term: stack overflow** — the error that occurs when a function calls itself
> (or a chain of functions call each other) so many times that the call stack
> runs out of space. The recursive function that never reaches its base case
> causes a stack overflow.

---

## Step 2 — Factorial

Now a recursive function that actually computes something:

The mathematical definition of factorial:
```
0! = 1                   ← base case (defined this way by convention)
n! = n × (n-1)!          ← recursive case (defined in terms of itself)
```

Translated directly into SICP JS:

```javascript
const factorial = n => n === 0 ? 1 : n * factorial(n - 1);
```

**OPEN CONSOLE AND TRY:**

```javascript
factorial(0)
```

**Expected:** `1`

```javascript
factorial(5)
```

**Expected:** `120`

```javascript
factorial(10)
```

**Expected:** `3628800`

---

## Step 3 — Trace Factorial Completely

This is the most important practice in this lab. Do it on paper.

**Trace `factorial(4)` step by step:**

```
factorial(4)
  → 4 === 0 ? 1 : 4 * factorial(4 - 1)    (substitute n=4)
  → 4 * factorial(3)                       (4 ≠ 0, evaluate 4-1=3)
  → 4 * (3 * factorial(2))                 (substitute n=3, 3 ≠ 0)
  → 4 * (3 * (2 * factorial(1)))           (substitute n=2, 2 ≠ 0)
  → 4 * (3 * (2 * (1 * factorial(0))))     (substitute n=1, 1 ≠ 0)
  → 4 * (3 * (2 * (1 * 1)))               (substitute n=0, 0 === 0 → 1)
  → 4 * (3 * (2 * 1))                     (evaluate 1 * 1)
  → 4 * (3 * 2)                           (evaluate 2 * 1)
  → 4 * 6                                 (evaluate 3 * 2)
  → 24                                    (evaluate 4 * 6)
```

This exact trace appears in SICP Chapter 1.2.1. When you open that page,
you will see this shape of computation described as a "linear recursive process."

**Notice the shape:** The expression expands outward (getting longer and more
nested) and then contracts inward (evaluating the multiplications from the inside
out). SICP calls this expansion followed by contraction the signature of
a recursive process.

---

## Step 4 — Sum of Integers

Write a recursive function to sum the integers from 1 to n:

```
sum_to(1) = 1
sum_to(n) = n + sum_to(n - 1)
```

**Write it yourself before looking at the code below.**

Think: what is the base case? What returns immediately without another call?
What is the recursive case?

```javascript
const sum_to = n => n === 1 ? 1 : n + sum_to(n - 1);
```

**OPEN CONSOLE AND TRY:**

```javascript
sum_to(5)
```

**Expected:** `15` (1 + 2 + 3 + 4 + 5 = 15)

**Trace `sum_to(3)` on paper:**

```
sum_to(3)
  → 3 + sum_to(2)
  → 3 + (2 + sum_to(1))
  → 3 + (2 + 1)
  → 3 + 3
  → 6
```

**Verify:** `sum_to(3) = 3 + 2 + 1 = 6` ✓

---

## Step 5 — Break It: What Happens with a Negative Input?

```javascript
factorial(-1)
```

**OPEN CONSOLE AND TRY**

**Expected:** Eventually an error (`Maximum call stack size exceeded`) or a
very long wait. The base case is `n === 0`. If we start at `-1`, we go to
`-2`, then `-3`, forever — we never reach `0`. The base case is never triggered.

This reveals an important principle: recursive functions must guarantee that
every valid input eventually reaches the base case. The input must "decrease
toward" the base case with each recursive call.

For `factorial`, the contract is: `n` must be a non-negative integer.
Negative inputs violate the contract and produce infinite recursion.

---

## 🎯 Challenge: Count Occurrences

**The goal:** Write a recursive function `count_nines(n)` that counts how many
times the digit `9` appears in the integer `n`.

Examples:
```javascript
count_nines(9)      // → 1
count_nines(99)     // → 2
count_nines(919)    // → 2
count_nines(123)    // → 0
count_nines(9999)   // → 4
```

Hints:
- `n % 10` gives the last digit of `n` (e.g., `919 % 10` → `9`)
- `Math.floor(n / 10)` removes the last digit (e.g., `Math.floor(919 / 10)` → `91`)
- Base case: when `n` is 0, there are no more digits to check
- Recursive case: check if the last digit is 9, then recurse on the remaining digits

Try for at least 10 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```javascript
const count_nines = n =>
    n === 0 ? 0 :
    n % 10 === 9 ? 1 + count_nines(Math.floor(n / 10)) :
                       count_nines(Math.floor(n / 10));
```

**Trace `count_nines(919)`:**
```
count_nines(919)
  → 919 % 10 === 9 ?                       (last digit is 9)
  → 1 + count_nines(Math.floor(919 / 10))  (yes → add 1, recurse)
  → 1 + count_nines(91)
  → 1 + (91 % 10 === 9 ?                   (last digit of 91 is 1, not 9)
  → 1 + count_nines(Math.floor(91 / 10))   (no → just recurse)
  → 1 + count_nines(9)
  → 1 + (9 % 10 === 9 ?                    (last digit is 9)
  → 1 + 1 + count_nines(Math.floor(9/10))  (yes → add 1, recurse)
  → 1 + 1 + count_nines(0)
  → 1 + 1 + 0                              (base case: n=0 → 0)
  → 2
```

**The pattern:** Each recursive call removes one digit from `n`. The recursion
eventually reaches 0 (no digits left). This structure — processing a number
digit by digit recursively — appears in SICP's exercises. You have now solved
a real SICP-style exercise.

</details>

---

## Final Check

| What | How to verify |
|------|---------------|
| `factorial(0)` returns `1` | Tested |
| `factorial(5)` returns `120` | Tested |
| `factorial` without base case causes stack overflow | Tested `broken` function |
| `factorial(4)` traced step by step | 10-step trace written and verified |
| `sum_to(5)` returns `15` | Tested |
| `sum_to(3)` traced step by step | Trace matches output |
| `factorial(-1)` causes infinite recursion (or overflow) | Tested |
| Challenge: `count_nines(919)` returns `2` | Tested |

---

## Quick Check Answers

**1. How does a recursive function ever stop?**
The base case. Every recursive function must have at least one case that does NOT
call itself — a case where it returns a value directly. When the recursion reaches
that case, it returns immediately. All the pending calls then complete, from innermost
to outermost. If there is no base case — or if the input never reaches it — the
recursion never stops and causes a stack overflow.

**2. How do you express factorial in terms of itself?**
`n! = n × (n-1)!` for n > 0, and `0! = 1` as the base case.
`5! = 5 × 4!`, `4! = 4 × 3!`, `3! = 3 × 2!`, `2! = 2 × 1!`, `1! = 1 × 0!`, `0! = 1`.
This self-referential definition is what makes factorial a naturally recursive computation.

**3. What is `0!`?**
`0! = 1`. This is defined by convention (not derived from the product formula, since
there is nothing to multiply). It makes the recursive formula work: `1! = 1 × 0! = 1 × 1 = 1`.
It also makes combinatorial formulas work (the number of ways to arrange 0 items is 1 — the
empty arrangement). SICP defines `0! = 1` as the base case for the same reason.

---

## What Is Next — LAB 07

You can write recursive functions and trace them. SICP will now introduce a key
distinction: some recursive functions, even though they look recursive, can be
computed in a fundamentally more efficient way — using **iteration** (counting
forward with an accumulator rather than backward with pending multiplications).
In LAB 07 you learn to recognize the difference and write both versions.

*Continue to Before SICP — LAB 07 — Recursion vs Iteration: Two Ways to Compute.*
