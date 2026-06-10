# Before SICP — LAB 07 — Iteration vs Recursion: Two Ways to Compute the Same Thing

**Prerequisites:** LAB 06. You know: recursion, base case, recursive case,
the expanding-then-contracting trace shape.

**What this lab adds:**
- You write `factorial` iteratively (with an accumulator) instead of recursively
- You compare the trace shapes: expanding vs flat
- You understand what SICP means by "linear recursive process" vs "linear iterative process"
- You know why SICP cares about the difference (it is about memory, not code style)

**Time:** 35–45 minutes

---

> **Quick Check — answer these before reading further:**
>
> 1. Look at the factorial trace from LAB 06. The expression expands to 10+ terms
>    before collapsing. Where are those pending multiplications stored while the
>    inner calls are running?
> 2. If you compute `factorial(1000)`, the expanding trace would have 1000 pending
>    multiplications. Is that a problem?
> 3. The iterative approach uses an "accumulator" — a running total that builds up
>    as you go. How does computing a sum by keeping a running total differ from
>    computing it by adding everything at the end?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Two versions of `factorial` — same answer, different shapes of computation:

```javascript
// Recursive (LAB 06) — expands then contracts:
const factorial_r = n => n === 0 ? 1 : n * factorial_r(n - 1);

// Iterative — stays flat, runs in constant memory:
const factorial_i = (n, acc) => n === 0 ? acc : factorial_i(n - 1, n * acc);
```

And the ability to see WHY they differ by comparing their traces.

---

## The Problem: The Recursive Version Has a Hidden Cost

Look at the `factorial(4)` trace from LAB 06:

```
factorial_r(4)
  → 4 * factorial_r(3)
  → 4 * (3 * factorial_r(2))
  → 4 * (3 * (2 * factorial_r(1)))
  → 4 * (3 * (2 * (1 * factorial_r(0))))  ← 4 pending multiplications
  → 4 * (3 * (2 * (1 * 1)))
  → 4 * (3 * (2 * 1))
  → 4 * (3 * 2)
  → 4 * 6
  → 24
```

At the deepest point, the computer is holding `4 * (3 * (2 * (1 * ?)))` — four
multiplication operations that cannot be performed until the innermost call
returns `1`. These pending operations are stored in the call stack (the same
one that overflows when you forget a base case).

For `factorial(1000)`, the call stack holds 1000 pending multiplications.
For `factorial(10000)`, it holds 10000. This is what SICP calls a process
that grows linearly in SPACE with the input.

Can we compute factorial without those pending operations piling up?

---

### Concept: Accumulator — Carrying the Result Forward

**What it is:** An extra parameter that carries a running total through the
recursion. Instead of multiplying "on the way back up," we multiply "on the way down."

**Canonical example:**
```
Compare two ways to sum a list [3, 2, 5, 1]:

Waiting-until-the-end approach (recursive):
"Give me the sum of [2, 5, 1], then I'll add 3 to it."
→ sum = 3 + sum_of([2, 5, 1])
→ sum = 3 + (2 + sum_of([5, 1]))
→ sum = 3 + (2 + (5 + sum_of([1])))
→ sum = 3 + (2 + (5 + (1 + 0)))
All additions pending until the end!

Running total approach (iterative):
"Current total: 0. Add 3: total=3. Add 2: total=5. Add 5: total=10. Add 1: total=11."
No waiting — the total is always up to date.
```

In code, the running total is the accumulator — an extra parameter.

---

## Step 1 — The Iterative Factorial

```javascript
const factorial_i = (n, acc) => n === 0 ? acc : factorial_i(n - 1, n * acc);
```

Read aloud: "Given n and an accumulator, if n is 0 return the accumulator,
otherwise recurse with n decreased by 1 and the accumulator multiplied by n."

**OPEN CONSOLE AND TRY:**

```javascript
factorial_i(5, 1)
```

**Expected:** `120` — you must pass `1` as the starting accumulator

```javascript
factorial_i(0, 1)
```

**Expected:** `1`

---

## Step 2 — Trace the Iterative Version

**Trace `factorial_i(4, 1)`:**

```
factorial_i(4, 1)
  → factorial_i(3, 4 * 1)     (4 ≠ 0 → recurse; n*acc = 4*1 = 4)
  → factorial_i(3, 4)         (evaluate 4 * 1)
  → factorial_i(2, 3 * 4)     (3 ≠ 0 → recurse; n*acc = 3*4 = 12)
  → factorial_i(2, 12)
  → factorial_i(1, 2 * 12)    (2 ≠ 0 → recurse; n*acc = 2*12 = 24)
  → factorial_i(1, 24)
  → factorial_i(0, 1 * 24)    (1 ≠ 0 → recurse; n*acc = 1*24 = 24)
  → factorial_i(0, 24)
  → 24                         (0 === 0 → base case → return acc)
```

**Compare the shapes:**

| Recursive | Iterative |
|-----------|-----------|
| Expands outward (chain of pending `*`) | Stays flat (only two arguments at a time) |
| Deepest call holds the whole chain | Each call discards its predecessor |
| Memory use grows with n | Memory use is constant (always just 2 numbers) |
| n+1 calls in flight simultaneously | Only 1 call active at a time |

The iterative trace is a FLAT series of calls — no pending operations, no expanding
expression. The accumulator carries the work forward instead of leaving it pending.

SICP calls this a **linear iterative process** (even though the code still uses
recursion). The process is iterative in the sense that it has a fixed amount of
state (n and acc) that evolves step by step.

---

### Concept: Linear Recursive vs Linear Iterative Process

**What they are:** Two characterizations of how a process uses time and memory
as the input grows.

> **Linear recursive process:** Memory use grows linearly with input. Computation
> expands (building up pending operations) and then contracts (resolving them).
> `factorial_r(n)` requires holding n pending multiplications.

> **Linear iterative process:** Memory use is constant regardless of input size.
> The process consists of fixed state (the accumulator and a counter) that is
> updated with each step. `factorial_i(n, 1)` always holds exactly 2 numbers.

**This is NOT about whether the code looks recursive.** `factorial_i` IS written
recursively — it calls itself. But the PROCESS it generates is iterative, because
there are no pending operations. The state is completely captured by the parameters.

SICP calls this distinction important: "In contrasting iteration and recursion,
we must be careful not to confuse the notion of a recursive process with the
notion of a recursive function."

---

## Step 3 — Hide the Accumulator

Having to type `factorial_i(5, 1)` (with the initial `1`) is awkward.
Wrap it with a cleaner interface:

```javascript
const factorial_i = (n, acc) => n === 0 ? acc : factorial_i(n - 1, n * acc);
const factorial    = n => factorial_i(n, 1);
```

**OPEN CONSOLE AND TRY:**

```javascript
factorial(5)
```

**Expected:** `120` — the `1` accumulator is provided automatically.

This is a common pattern: an inner helper function with the accumulator,
and an outer "entry point" that starts it with the correct initial value.
SICP uses this pattern in Chapter 1.2.1.

---

## Step 4 — Compare with Sum-to-N

Rewrite `sum_to` from LAB 06 iteratively:

```javascript
// Recursive (from LAB 06):
const sum_r = n => n === 1 ? 1 : n + sum_r(n - 1);

// Iterative (with accumulator):
const sum_i_helper = (n, acc) => n === 0 ? acc : sum_i_helper(n - 1, acc + n);
const sum_i = n => sum_i_helper(n, 0);
```

**OPEN CONSOLE AND TRY:**

```javascript
sum_i(5)
```

**Expected:** `15`

**Trace `sum_i_helper(3, 0)`:**
```
sum_i_helper(3, 0)
  → sum_i_helper(2, 0 + 3) → sum_i_helper(2, 3)
  → sum_i_helper(1, 3 + 2) → sum_i_helper(1, 5)
  → sum_i_helper(0, 5 + 1) → sum_i_helper(0, 6)
  → 6                (base case: n=0 → return acc=6)
```

---

## Step 5 — Which Should You Use?

SICP's answer: in the languages that optimize for iterative recursion
(called **tail-call optimization** or **TCO**), it does not matter for most
programs — the language automatically converts tail-recursive calls into
iteration, so the call stack does not grow.

JavaScript does support tail-call optimization in theory (it was added in ES6)
but most browsers do not implement it. For the console exercises in this series,
inputs are small enough that the recursive version works fine.

For SICP reading: understand BOTH versions. SICP discusses both explicitly
and asks you to recognize which kind of process a given function generates.

> **Term: tail call** — a function call that is the LAST thing a function does,
> with no pending operations after it returns. `factorial_i(n-1, n*acc)` is
> a tail call — there is nothing left to do after it returns (the result goes
> directly back to the caller). `n * factorial_r(n-1)` is NOT a tail call —
> after `factorial_r(n-1)` returns, multiplication by n is still pending.

---

## 🎯 Challenge: Fibonacci Iteratively

**The goal:** Write an iterative version of Fibonacci.

The Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...
Each term is the sum of the two before it.

```javascript
// First the recursive version (write this too):
const fib_r = n =>
    n === 0 ? 0 :
    n === 1 ? 1 :
    fib_r(n - 1) + fib_r(n - 2);
```

**Try `fib_r(30)` — notice how long it takes.** (SICP explains why in Chapter 1.2.2.)

Then write the iterative version. The trick: you need TWO accumulator values —
the previous two terms. Here is the structure:

```javascript
const fib_i = (n, a, b) =>
    n === 0 ? a :
    fib_i(n - 1, b, a + b);

const fib = n => fib_i(n, 0, 1);
```

**Try `fib(30)` and `fib(50)`. Compare the speed to `fib_r(30)`.**

Trace `fib_i(5, 0, 1)` step by step to confirm it produces the right answer.

---

<details>
<summary>▶ Show Trace</summary>

```
fib_i(5, 0, 1)
  → fib_i(4, 1, 0 + 1) → fib_i(4, 1, 1)
  → fib_i(3, 1, 1 + 1) → fib_i(3, 1, 2)
  → fib_i(2, 2, 1 + 2) → fib_i(2, 2, 3)
  → fib_i(1, 3, 2 + 3) → fib_i(1, 3, 5)
  → fib_i(0, 5, 3 + 5) → fib_i(0, 5, 8)
  → 5                    (n=0 → return a=5)
```

The 5th Fibonacci number is 5 (0-indexed: 0,1,1,2,3,5). ✓

**The key insight:** The recursive `fib_r` computes the same values repeatedly.
`fib_r(5)` computes `fib_r(3)` twice, `fib_r(2)` three times, etc.
It grows EXPONENTIALLY in time. The iterative version computes each value exactly
once and runs in linear time. This difference — exponential vs linear — is one
of SICP's most important lessons (Chapter 1.2.2).

</details>

---

## Final Check

| What | How to verify |
|------|---------------|
| `factorial_i(5, 1)` returns `120` | Tested |
| Iterative trace is flat (no pending operations) | Trace written, shape is flat |
| Recursive trace expands then contracts | Comparison with LAB 06 trace |
| `factorial(5)` (with wrapper) returns `120` | Tested |
| `sum_i(5)` returns `15` | Tested |
| Challenge: `fib(30)` is instant; `fib_r(30)` is slow | Tested both |
| Challenge: `fib_i(5, 0, 1)` traced correctly | Returns 5 |

---

## Quick Check Answers

**1. Where are the pending multiplications stored?**
In the call stack — a memory region that tracks active function calls.
Each recursive call to `factorial_r` adds one frame to the call stack containing
the pending `n * ?` operation. The frame cannot be cleared until the inner call
returns. For `factorial_r(n)`, there are n such frames active simultaneously.

**2. Is 1000 pending multiplications a problem?**
Yes — it uses memory proportional to n (O(n) space). For large n it can cause
a stack overflow. The iterative version uses O(1) space — the same two parameters
regardless of n. For SICP reading: the recursive version is easier to write and
understand; the iterative version scales better.

**3. How does a running total differ from summing at the end?**
A running total adds each new value immediately, keeping only one number (the
current total). Summing at the end requires remembering all values (or all pending
additions) until the final step. The running total is iterative — constant space.
Summing at the end is recursive — linear space. Both give the same answer; the
difference is how much memory they need along the way.

---

## What Is Next — LAB 08

You can write recursive and iterative functions, trace them, and understand the
difference between recursive PROCESSES and iterative PROCESSES. There is one more
concept SICP uses heavily in Chapter 1 that you need before opening the book
comfortably: **higher-order functions** — functions that accept other functions
as arguments, or return functions as results. This is the most powerful idea in
functional programming, and SICP builds its entire Chapter 1.3 around it.

*Continue to Before SICP — LAB 08 — Higher-Order Functions: Functions That Work With Functions.*
