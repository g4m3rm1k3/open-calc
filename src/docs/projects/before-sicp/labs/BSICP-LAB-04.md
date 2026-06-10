# Before SICP — LAB 04 — Tracing: The Substitution Model

**Prerequisites:** LAB 03. You know: functions, arrow syntax, parameters,
arguments, calling functions, scope.

**What this lab adds:**
- You trace a function call step by step, substituting argument for parameter
- You trace nested function calls, from inside out
- You understand what SICP means by "the substitution model of evaluation"
- You can predict what any expression evaluates to before running it

**Time:** 35–45 minutes

---

> **Quick Check — answer these before reading further:**
>
> 1. `square(3 + 2)` — does JavaScript evaluate `3 + 2` first and then call
>    `square(5)`, or does it pass `3 + 2` unevaluated into `square`?
> 2. If `f = x => x + 1` and `g = x => x * 2`, what does `f(g(3))` produce?
>    Trace it step by step before looking at the answer.
> 3. SICP says the substitution model has a flaw — it breaks down when programs
>    use something called "mutation." What do you think mutation means here?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The ability to read code like a calculator — substituting, reducing, and
arriving at a final value before touching the keyboard:

```
Trace f(g(3)) where f = x => x + 1 and g = x => x * 2:

f(g(3))
  → f(3 * 2)         (substitute 3 into g's body x * 2)
  → f(6)             (evaluate 3 * 2 = 6)
  → 6 + 1            (substitute 6 into f's body x + 1)
  → 7                (evaluate 6 + 1 = 7)
```

This skill — tracing evaluation — lets you understand every SICP example without
running it. SICP's early chapters are fundamentally about this model.

---

## The Problem: Reading Code Without Running It

Right now when you see `hypotenuse(3, 4)`, you probably run it and trust the
answer. But in SICP, expressions get complex — you need to understand WHY the
answer is what it is, not just accept that the computer said so.

More importantly: when code does something unexpected, tracing is how you
diagnose it. Running it again produces the same wrong answer. Tracing reveals
WHERE the wrong answer was introduced.

---

### Concept: The Substitution Model

**What it is:** A step-by-step rule for evaluating function calls: replace the
parameter with the argument in the body, then evaluate the resulting expression.

**Canonical example:**
```
Real-world: A fill-in-the-blank form.
The form says: "For ______ kg at $______ per kg, total = ______ × ______"
You fill in: 3 kg at $5/kg → total = 3 × 5 = $15.
"Filling in the blank" IS substitution.

In code:
const square = x => x * x;
square(7)
  → 7 * 7       (substitute 7 for x in body x * x)
  → 49          (evaluate 7 * 7)
```

**The two rules:**
1. Evaluate the argument(s) first (reduce to a value)
2. Substitute the evaluated argument(s) for the parameter(s) in the body
3. Evaluate the resulting body expression

**Watch for:** Arguments are evaluated BEFORE substitution. `square(3 + 2)` does
NOT substitute `3 + 2` into the body to get `(3 + 2) * (3 + 2)` and then evaluate.
Instead: evaluate `3 + 2 → 5` first, then substitute `5` to get `5 * 5 = 25`.
Both give 25 here — but the order matters when functions have side effects.

---

## Step 1 — Trace One Level of Function Call

Rules for tracing:
- Write the original expression
- On the next line, substitute argument for parameter in the body
- On the next line, evaluate the resulting expression
- Continue until you reach a primitive value (a number)

**Practice this on paper (or in a text file), then verify in the console:**

**Exercise 1:**
```
const square = x => x * x;
square(6)
```

Trace:
```
square(6)
  → 6 * 6     (substitute 6 for x)
  → 36        (evaluate)
```

Type `square(6)` in the console. Confirm: `36`.

**Exercise 2:**
```
const cube = x => x * x * x;
cube(4)
```

Write the trace before looking:
```
cube(4)
  → ?         (what is the body with 4 substituted?)
  → ?         (evaluate)
```

Then verify in the console.

---

## Step 2 — Trace Nested Function Calls

When a function call appears as the argument to another function call,
evaluate from the inside out.

```javascript
const square = x => x * x;
square(square(3))
```

**Trace:**
```
square(square(3))
  → square(3 * 3)      (evaluate inner: substitute 3 for x in body)
  → square(9)          (evaluate 3 * 3 = 9)
  → 9 * 9              (substitute 9 for x in outer body)
  → 81                 (evaluate)
```

**OPEN CONSOLE AND TRY**

**Expected:** `81`

**Exercise:** Trace this on paper before running:
```javascript
const double = x => x * 2;
const square = x => x * x;
double(square(4))
```

```
double(square(4))
  → double(?)     fill in
  → ?             fill in
  → ?             fill in
```

Then verify in the console.

---

### Concept: Function Call as Expression

**What it is:** A function call is itself an expression — it evaluates to the
function's return value. This value can be used anywhere any other expression can be used.

**Canonical example:**
```javascript
const square = x => x * x;

// square(4) is an expression whose value is 16.
// It can appear anywhere 16 could:

square(4) + 1         // → 17
square(square(2))     // → 16 (square(2)=4, square(4)=16)
const y = square(5);  // y is bound to 25
```

**Why this matters for SICP:** SICP says *"a function call expression is evaluated
by evaluating the function expression and argument expressions, and applying the
function to the arguments."* A function call IS an expression. Its value IS the
result. You can nest function calls arbitrarily deep.

---

## Step 3 — Trace Two-Parameter Functions

```javascript
const average = (a, b) => (a + b) / 2;
average(3, 9)
```

**Trace:**
```
average(3, 9)
  → (3 + 9) / 2     (substitute 3 for a, 9 for b)
  → 12 / 2          (evaluate 3 + 9 = 12)
  → 6               (evaluate)
```

**Now trace this — write it out before running:**
```javascript
const hypotenuse = (a, b) => Math.sqrt(square(a) + square(b));
hypotenuse(3, 4)
```

```
hypotenuse(3, 4)
  → Math.sqrt(square(3) + square(4))   (substitute)
  → Math.sqrt(? + square(4))           (evaluate square(3))
  → Math.sqrt(? + ?)                   (evaluate square(4))
  → Math.sqrt(?)                       (evaluate the addition)
  → ?                                  (evaluate Math.sqrt)
```

Fill in each `?` before running in the console.

---

## Step 4 — The Order Matters: Applicative Order

JavaScript uses **applicative order** evaluation — arguments are evaluated
BEFORE the function is called. SICP discusses this explicitly.

The alternative is **normal order** — arguments are NOT evaluated until needed.

**Why it rarely matters:** For pure mathematical functions like the ones you
have been writing, both orders produce the same result. They differ only when
there are side effects (like printing) or when an argument would cause an error.

**See the applicative order in action:**

```javascript
const first = (a, b) => a;
first(1, 2 + 2)
```

Under applicative order: `2 + 2` is evaluated to `4` FIRST, then `first(1, 4)`
is called, which returns `1`. The `4` was computed but never used.

Under normal order: `first(1, 2+2)` → substitute → `1` is returned immediately,
and `2 + 2` is never computed. More efficient here.

**OPEN CONSOLE AND TRY:**
```javascript
const first = (a, b) => a;
first(1, 2 + 2)
```

**Expected:** `1` (both orders agree here — but you cannot observe which was used).

---

## Step 5 — Trace a Composition Chain

Define these in the console:

```javascript
const add1   = x => x + 1;
const double = x => x * 2;
const square = x => x * x;
```

Now trace this on paper before running it:

```javascript
add1(double(square(3)))
```

```
add1(double(square(3)))
  → add1(double(? * ?))   fill in
  → add1(double(?))       fill in
  → add1(? * 2)           fill in
  → add1(?)               fill in
  → ? + 1                 fill in
  → ?
```

**Verify in the console.** If your answer does not match, find where your trace
went wrong.

---

## 🎯 Challenge: Predict Without Running

**The goal:** For each expression below, trace it completely on paper (no console
allowed until your trace is complete). Then run it to verify.

Define in the console first:
```javascript
const square  = x => x * x;
const add1    = x => x + 1;
const average = (a, b) => (a + b) / 2;
```

**Expression 1:** `add1(add1(add1(0)))`
**Expression 2:** `square(add1(4))`
**Expression 3:** `average(square(2), square(4))`
**Expression 4:** `add1(average(square(3), square(4)))`

Write your trace for each. Then verify. Any mismatch reveals a gap in your model.

---

<details>
<summary>▶ Show Solutions</summary>

**Expression 1:** `add1(add1(add1(0)))`
```
add1(add1(add1(0)))
→ add1(add1(0 + 1))
→ add1(add1(1))
→ add1(1 + 1)
→ add1(2)
→ 2 + 1
→ 3
```

**Expression 2:** `square(add1(4))`
```
square(add1(4))
→ square(4 + 1)
→ square(5)
→ 5 * 5
→ 25
```

**Expression 3:** `average(square(2), square(4))`
```
average(square(2), square(4))
→ average(2 * 2, square(4))
→ average(4, square(4))
→ average(4, 4 * 4)
→ average(4, 16)
→ (4 + 16) / 2
→ 20 / 2
→ 10
```

**Expression 4:** `add1(average(square(3), square(4)))`
```
add1(average(square(3), square(4)))
→ add1(average(3 * 3, square(4)))
→ add1(average(9, square(4)))
→ add1(average(9, 4 * 4))
→ add1(average(9, 16))
→ add1((9 + 16) / 2)
→ add1(25 / 2)
→ add1(12.5)
→ 12.5 + 1
→ 13.5
```

**If any trace was wrong:** The most common error is evaluating the wrong subexpression
first. The rule is always: innermost first. If you see `add1(square(3))`, you must
evaluate `square(3)` before you can apply `add1`. You cannot substitute until
all arguments are reduced to primitive values.

</details>

---

## Final Check

| What | How to verify |
|------|---------------|
| `square(square(3))` traced correctly | 5 steps, reaches `81` |
| `hypotenuse(3, 4)` traced correctly | Each step filled in correctly |
| `add1(double(square(3)))` traced correctly | Reaches the right answer |
| Challenge: all 4 expressions traced | Traces written before running |
| All 4 console results match traces | No mismatches |

---

## Quick Check Answers

**1. Does `square(3 + 2)` evaluate `3 + 2` first?**
Yes — applicative order. JavaScript evaluates arguments before calling the function.
`3 + 2 → 5`, then `square(5) → 25`. This is the same result as substituting
first (`(3+2) * (3+2) → 25`), but the process is different. The distinction
matters in SICP's deeper discussions of evaluation order.

**2. What does `f(g(3))` produce?**
`g(3) = 3 * 2 = 6`. `f(6) = 6 + 1 = 7`. Answer: `7`.
Trace: `f(g(3)) → f(6) → 6 + 1 → 7`.

**3. What does "mutation" mean?**
Mutation means changing a value after it has been created — overwriting a variable
with a new value. SICP introduces mutation later (in Chapter 3) and shows why it
breaks the substitution model: if `x` can change while a function is evaluating,
you cannot simply substitute the value of `x` at the moment of the call, because
the value might be different halfway through. This is why SICP's early chapters
use only `const` (which cannot be mutated) and teach the substitution model
while it is still valid.

---

## What Is Next — LAB 05

You can trace any expression. But some computations need to choose between two
paths — "if the number is negative, negate it; otherwise return it as-is." In
LAB 05 you learn JavaScript's conditional expression: `condition ? a : b`. This
is SICP's "conditional expressions and predicates" section — and it unlocks the
ability to write your first complete function that handles all possible inputs.

*Continue to Before SICP — LAB 05 — Decisions: Conditionals and Predicates.*
