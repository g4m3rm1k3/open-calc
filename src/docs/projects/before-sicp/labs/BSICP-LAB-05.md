# Before SICP — LAB 05 — Decisions: Conditionals and Predicates

**Prerequisites:** LAB 04. You know: functions, substitution model, tracing,
parameters, arguments.

**What this lab adds:**
- You use the conditional expression `condition ? consequent : alternative`
- You write functions that handle different cases differently
- You understand predicates — expressions that produce `true` or `false`
- You write `absolute_value`, `max_of_two`, and a piecewise mathematical function

**Time:** 35–45 minutes

---

> **Quick Check — answer these before reading further:**
>
> 1. In LAB 03 you wrote `abs_val = x => Math.sqrt(square(x))`. This is clever
>    but indirect. What is the more direct mathematical definition of absolute value?
>    (It is a piecewise definition — one rule for x ≥ 0, another for x < 0.)
> 2. The expression `3 > 2` — what type of value does it produce? A number? A string?
> 3. SICP writes: `x >= 0 ? x : -x`. Can you guess what this produces for
>    `x = 5`? What about `x = -7`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A set of functions that make decisions — they produce different results for
different inputs:

```javascript
const abs_val  = x => x >= 0 ? x : -x;
abs_val(7)     // → 7
abs_val(-7)    // → 7
abs_val(0)     // → 0

const max_two  = (a, b) => a >= b ? a : b;
max_two(3, 7)  // → 7
max_two(9, 4)  // → 9

const sign     = x => x > 0 ? 1 : x < 0 ? -1 : 0;
sign(100)      // → 1
sign(-5)       // → -1
sign(0)        // → 0
```

These are SICP's first examples of **conditional expressions**.

---

## The Problem: Some Functions Have Cases

The absolute value of a number is:
- If the number is 0 or positive: return it as-is
- If the number is negative: return its negation

No single arithmetic expression handles both cases. You need a way to *choose*
between two different computations based on a condition.

---

### Concept: Predicate — An Expression That Produces `true` or `false`

**What it is:** An expression whose value is a boolean (`true` or `false`).
Used as the condition in a conditional expression.

> **Term: predicate** — from Latin *praedicare* (to declare). In mathematics
> and logic, a predicate is a statement that is either true or false. In code,
> any expression that evaluates to `true` or `false` is a predicate.

**Canonical example:**
```javascript
3 > 2       // → true   (3 is greater than 2)
5 < 1       // → false  (5 is not less than 1)
4 === 4     // → true   (4 is equal to 4)
4 === 5     // → false
7 >= 7      // → true   (7 is greater than OR equal to 7)
-3 < 0      // → true
```

> **Comparison operators:**
> `>` — greater than
> `<` — less than
> `>=` — greater than or equal
> `<=` — less than or equal
> `===` — equal (three equals signs — exactly equal in type AND value)
> `!==` — not equal

**Watch for:** `===` (equality check) vs `=` (assignment) vs `==` (loose equality).
Always use `===` for comparison. The single `=` assigns a value. The double `==`
compares with type coercion (JavaScript-specific quirk SICP avoids). SICP JS
uses `===` for equality.

---

## Step 1 — Predicates in the Console

Type each of these in the console. Predict the result before pressing Enter.

```javascript
5 > 3
```
**Expected:** `true`

```javascript
2 > 9
```
**Expected:** `false`

```javascript
4 === 4
```
**Expected:** `true`

```javascript
4 === "4"
```
**Expected:** `false` — the number `4` is not equal to the string `"4"`.
`===` checks both value AND type.

```javascript
-3 < 0
```
**Expected:** `true`

```javascript
7 >= 7
```
**Expected:** `true` — `>=` means greater than OR equal.

**Change something:** Type `5 > 3 > 1`. Predict before pressing Enter. Is the
answer what you expect? (Hint: comparison operators are evaluated left to right.
`5 > 3` gives `true`, then `true > 1` gives something unexpected.)

---

### Concept: Conditional Expression — Choosing Between Two Values

**What it is:** An expression that evaluates to one of two values based on whether
a condition is true or false.

**The syntax:**
```javascript
condition ? consequent : alternative
```

Read aloud: "IF condition THEN consequent ELSE alternative"

> **Term: conditional expression** — an expression with three parts: a condition
> (predicate), a consequent (value if true), and an alternative (value if false).
> The whole conditional is itself an expression — it evaluates to a single value.

> **Term: consequent** — the value produced when the condition is true.
> SICP uses this exact word.

> **Term: alternative** — the value produced when the condition is false.
> SICP uses this exact word.

**Canonical example:**
```javascript
3 > 2 ? "yes" : "no"   // → "yes"  (condition is true, consequent chosen)
1 > 2 ? "yes" : "no"   // → "no"   (condition is false, alternative chosen)

// In a function:
const abs_val = x => x >= 0 ? x : -x;
abs_val(5)    // condition: 5 >= 0 → true  → consequent x → 5
abs_val(-7)   // condition: -7 >= 0 → false → alternative -x → -(-7) → 7
```

**What it hides:** The branch selection logic. You do not need to write separate
code paths — the conditional expression handles it in one expression.

**Watch for:** The conditional expression is an EXPRESSION — it produces a value.
It is different from JavaScript's `if` statement (which is a statement and does
not produce a value directly). SICP JS almost exclusively uses the conditional
EXPRESSION, not the `if` statement, in early chapters.

---

## Step 2 — Your First Conditional

Type in the console:

```javascript
5 > 3 ? "bigger" : "smaller"
```

**Expected:** `"bigger"`

```javascript
1 > 3 ? "bigger" : "smaller"
```

**Expected:** `"smaller"`

Now a numeric conditional:

```javascript
const abs_val = x => x >= 0 ? x : -x;
```

**OPEN CONSOLE AND TRY** (define the function, then:)

```javascript
abs_val(7)
```

**Expected:** `7` — condition `7 >= 0` is true → consequent `x` → `7`

```javascript
abs_val(-7)
```

**Expected:** `7` — condition `-7 >= 0` is false → alternative `-x` → `-(-7)` → `7`

```javascript
abs_val(0)
```

**Expected:** `0` — condition `0 >= 0` is true → consequent `x` → `0`

**Trace `abs_val(-7)` using the substitution model:**
```
abs_val(-7)
  → -7 >= 0 ? -7 : -(-7)   (substitute -7 for x)
  → false ? -7 : -(-7)     (evaluate condition)
  → -(-7)                  (condition false → take alternative)
  → 7                      (evaluate -(-7))
```

---

## Step 3 — More Conditional Functions

```javascript
const max_two = (a, b) => a >= b ? a : b;
```

**OPEN CONSOLE AND TRY:**

```javascript
max_two(3, 7)
```

**Expected:** `7`

```javascript
max_two(9, 4)
```

**Expected:** `9`

```javascript
max_two(5, 5)
```

**Expected:** `5` — when they are equal, `a >= b` is true → returns `a` (which equals `b`)

**Change something:** What does `max_two(max_two(3, 7), max_two(1, 9))` produce?
Trace it before running.

---

### Concept: Logical Operators — Combining Predicates

**What it is:** Operators that combine boolean values.

> **`&&`** — "and": both conditions must be true for the result to be true.
> `3 > 1 && 5 > 2` → `true && true` → `true`
> `3 > 1 && 5 > 9` → `true && false` → `false`

> **`||`** — "or": at least one condition must be true.
> `3 > 9 || 5 > 2` → `false || true` → `true`

> **`!`** — "not": flips true to false and false to true.
> `!true` → `false`
> `!(3 > 1)` → `!true` → `false`

**Canonical example:**
```javascript
// Is a number between 0 and 10 (inclusive)?
const between = x => x >= 0 && x <= 10;
between(5)   // → true
between(11)  // → false
between(-1)  // → false
```

---

## Step 4 — Nested Conditionals: Three Cases

Sometimes there are three or more cases. Nest conditionals:

```javascript
const sign = x => x > 0 ? 1 : x < 0 ? -1 : 0;
```

Read: "if x > 0 then 1, else if x < 0 then -1, else 0."

The alternative of the first conditional IS another conditional. This is
perfectly valid — the alternative is just an expression, and a conditional
expression IS an expression.

**OPEN CONSOLE AND TRY:**

```javascript
sign(100)   // → 1
sign(-5)    // → -1
sign(0)     // → 0
```

**Trace `sign(0)`:**
```
sign(0)
  → 0 > 0 ? 1 : 0 < 0 ? -1 : 0    (substitute)
  → false ? 1 : 0 < 0 ? -1 : 0    (evaluate 0 > 0)
  → 0 < 0 ? -1 : 0                (take alternative)
  → false ? -1 : 0                 (evaluate 0 < 0)
  → 0                              (take alternative)
```

---

## Step 5 — SICP's Exact Examples

These appear in SICP Chapter 1. Read them and trace them before running:

```javascript
const square    = x => x * x;
const abs_val   = x => x >= 0 ? x : -x;

// SICP uses this to compute square roots by Newton's method:
const good_enough = (guess, x) =>
    abs_val(square(guess) - x) < 0.001;
```

**OPEN CONSOLE AND TRY:**

```javascript
good_enough(3, 9)
```

**Trace:**
```
good_enough(3, 9)
  → abs_val(square(3) - 9) < 0.001    (substitute)
  → abs_val(9 - 9) < 0.001            (evaluate square(3) = 9)
  → abs_val(0) < 0.001                (evaluate 9 - 9 = 0)
  → 0 < 0.001                         (evaluate abs_val(0) = 0)
  → true                              (0 IS less than 0.001)
```

**Expected:** `true` — a guess of 3 for the square root of 9 is exactly right.

```javascript
good_enough(2, 9)
```

**Expected:** `false` — a guess of 2 for √9 is off by `|4 - 9| = 5`, which is not less than 0.001.

When you open SICP Chapter 1.1.7 (Newton's method for square roots), this exact
function will be there. You will recognize it.

---

## 🎯 Challenge: Write `clamp`

**The goal:** Write a function `clamp(x, lo, hi)` that returns:
- `lo` if `x < lo` (x is below the minimum)
- `hi` if `x > hi` (x is above the maximum)
- `x` if `lo <= x <= hi` (x is within range)

This is used everywhere in games (keeping a value within bounds) and signal
processing (limiting output range).

Examples:
```javascript
clamp(5, 0, 10)   // → 5   (5 is within [0, 10])
clamp(-3, 0, 10)  // → 0   (below minimum)
clamp(15, 0, 10)  // → 10  (above maximum)
clamp(0, 0, 10)   // → 0   (exactly at minimum)
clamp(10, 0, 10)  // → 10  (exactly at maximum)
```

You need nested conditionals. Try for at least 5 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```javascript
const clamp = (x, lo, hi) =>
    x < lo ? lo :
    x > hi ? hi :
    x;
```

**Trace `clamp(15, 0, 10)`:**
```
clamp(15, 0, 10)
  → 15 < 0 ? 0 : 15 > 10 ? 10 : 15    (substitute)
  → false ? 0 : 15 > 10 ? 10 : 15     (evaluate 15 < 0)
  → 15 > 10 ? 10 : 15                 (take alternative)
  → true ? 10 : 15                    (evaluate 15 > 10)
  → 10                                (take consequent)
```

**The key insight:** A nested conditional `a ? b : c ? d : e` reads as
"if a then b, else if c then d, else e." Each alternative can itself be
a conditional — because the conditional expression IS an expression, and
expressions can be nested arbitrarily.

SICP uses exactly this pattern throughout Chapter 1. When you see a nested
ternary in SICP, read it as a chain of "else-if" cases.

</details>

---

## Final Check

| What | How to verify |
|------|---------------|
| `3 > 2` returns `true` | Tested |
| `4 === 4` returns `true`, `4 === "4"` returns `false` | Tested both |
| `abs_val(-7)` returns `7` | Tested |
| `abs_val(0)` returns `0` | Tested |
| `sign(0)` returns `0`, `sign(-5)` returns `-1` | Tested |
| `good_enough(3, 9)` traced correctly | Trace matches console output |
| `good_enough(2, 9)` returns `false` | Verified |
| Challenge: `clamp` passes all 5 tests | All five examples verified |

---

## Quick Check Answers

**1. What is the direct mathematical definition of absolute value?**
|x| = x if x ≥ 0, and |x| = −x if x < 0. It is a piecewise function — two rules,
one for each case. The conditional expression `x >= 0 ? x : -x` is the direct
translation of this definition into code. SICP writes functions this way because
they mirror the mathematical definitions precisely.

**2. What does `3 > 2` produce?**
A boolean — specifically `true`. The `>` operator is a predicate: it compares two
numbers and returns either `true` or `false`. Booleans are a primitive type in
JavaScript, alongside numbers and strings.

**3. What does `x >= 0 ? x : -x` produce for `x = 5` and `x = -7`?**
For `x = 5`: condition `5 >= 0` is true → consequent `x` → `5`.
For `x = -7`: condition `-7 >= 0` is false → alternative `-x` → `-(-7)` → `7`.
In both cases the result is non-negative. This is the absolute value function.

---

## What Is Next — LAB 06

Functions that call other functions, conditions, predicates — you have all of
SICP's Chapter 1.1 foundations. In LAB 06 you learn one more building block that
Chapter 1.2 depends on entirely: **recursion** — functions that call themselves.
This is the subject of SICP's most important section and the one that confuses
most beginners. LAB 06 takes it slowly.

*Continue to Before SICP — LAB 06 — Recursion: A Function That Calls Itself.*
