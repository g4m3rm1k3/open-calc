# Before SICP — LAB 08 — Higher-Order Functions: Functions That Work With Functions

**Prerequisites:** LAB 07. You know: functions, arrow syntax, recursion, the
substitution model, conditionals, iterative vs recursive processes.

**What this lab adds:**
- You pass a function as an argument to another function
- You return a function from a function
- You understand what SICP means by "functions as first-class values"
- You write SICP's `sum` abstraction — a function that computes any sum of any series

**Time:** 45–55 minutes

---

> **Quick Check — answer these before reading further:**
>
> 1. In LAB 03, you used `Math.sqrt` as if it were a number you passed to another
>    function: `hypotenuse = (a, b) => Math.sqrt(square(a) + square(b))`. Could you
>    also pass `Math.sqrt` as an argument — `hypotenuse(3, 4, Math.sqrt)` — so the
>    caller decides which root function to use?
> 2. The sum 1 + 4 + 9 + 16 + 25 (sum of squares from 1 to 5) and the sum
>    1 + 8 + 27 + 64 + 125 (sum of cubes from 1 to 5) have nearly identical
>    structure. What is the common pattern? What is the only difference?
> 3. SICP says "functions are first-class citizens." What does "first-class" mean
>    for a value?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

SICP's `sum` abstraction — a single function that can sum any series of values
by accepting the term function and step function as arguments:

```javascript
const sum = (term, a, next, b) =>
    a > b ? 0 : term(a) + sum(term, next(a), next, b);

// Sum of integers from 1 to 5:
const identity = x => x;
const add1 = x => x + 1;
sum(identity, 1, add1, 5)   // → 15

// Sum of squares from 1 to 5:
const square = x => x * x;
sum(square, 1, add1, 5)     // → 55 (1 + 4 + 9 + 16 + 25)

// Sum of cubes from 1 to 5:
const cube = x => x * x * x;
sum(cube, 1, add1, 5)       // → 225 (1 + 8 + 27 + 64 + 125)
```

This is word for word from SICP Chapter 1.3.1. When you open that page,
you will already understand it.

---

## The Problem: Identical Code for Different Sums

To sum integers from 1 to n:

```javascript
const sum_integers = n => n === 0 ? 0 : n + sum_integers(n - 1);
```

To sum squares from 1 to n:

```javascript
const sum_squares = n => n === 0 ? 0 : n * n + sum_squares(n - 1);
```

To sum cubes from 1 to n:

```javascript
const sum_cubes = n => n === 0 ? 0 : n * n * n + sum_cubes(n - 1);
```

These three functions are nearly identical. The only difference is `n` vs `n*n`
vs `n*n*n` — the "term" being added. Every time you want a new kind of sum,
you copy and paste the structure.

The abstraction you are missing: a function that sums ANY term, where the "what
to add" is provided as an argument.

---

### Concept: Functions as First-Class Values

**What it is:** The property that functions can be used wherever any other value
can be used — stored in a `const`, passed as an argument, returned as a result.

**The problem before:** You treat numbers and strings as things you can pass
around, but functions as special things you can only define and call. This
prevents you from abstracting over patterns of computation.

**The solution:** In JavaScript (and Scheme, which SICP uses), functions are
values just like `5` or `"hello"`. You can pass them as arguments. You can
return them from other functions. You can store them in variables.

**What it hides:** The rigid distinction between "code" and "data." In languages
without first-class functions, computation patterns cannot be parameterized —
you copy code to vary it. With first-class functions, you pass the varying
part as an argument.

**Canonical example:**
```javascript
const square = x => x * x;
const cube   = x => x * x * x;

// apply_twice: applies a function to a value, twice.
const apply_twice = (f, x) => f(f(x));

apply_twice(square, 2)   // → square(square(2)) = square(4) = 16
apply_twice(cube,   2)   // → cube(cube(2)) = cube(8) = 512

// The same function apply_twice works with ANY function.
// square and cube are passed as arguments, just like numbers.
```

**Watch for:** The difference between `square` (the function itself — a value)
and `square(5)` (a call to square — evaluates to `25`). When you pass a function
as an argument, you pass the function, not a call to it.

---

## Step 1 — Passing Functions as Arguments

Define these in the console:

```javascript
const square = x => x * x;
const cube   = x => x * x * x;
const add1   = x => x + 1;
```

Now write a function that takes another function as an argument:

```javascript
const apply_twice = (f, x) => f(f(x));
```

**OPEN CONSOLE AND TRY:**

```javascript
apply_twice(square, 2)
```

**Trace:**
```
apply_twice(square, 2)
  → square(square(2))   (substitute: f=square, x=2)
  → square(4)           (evaluate square(2) = 4)
  → 16                  (evaluate square(4))
```

**Expected:** `16`

```javascript
apply_twice(add1, 10)
```

**Expected:** `12` (add1 applied twice: 10 → 11 → 12)

**Change something:** Try `apply_twice(apply_twice(square, 2), ...)` — wait,
`apply_twice` returns a NUMBER (because `f(f(x))` applies f twice and returns
the result). Can you apply `apply_twice` to itself? Think about what it would
mean. This is the kind of question SICP explores.

---

## Step 2 — The `sum` Abstraction

SICP's key example of a higher-order function:

```javascript
const sum = (term, a, next, b) =>
    a > b ? 0 : term(a) + sum(term, next(a), next, b);
```

Read aloud: "Sum from a to b of term(a), stepping by next."

- `term` — a function: what to compute for each value
- `a` — the current value (starts at the lower bound)
- `next` — a function: how to get the next value from the current one
- `b` — the upper bound (stop when a > b)

**OPEN CONSOLE AND TRY:**

```javascript
const identity = x => x;
const add1     = x => x + 1;
sum(identity, 1, add1, 5)
```

**Expected:** `15` (1 + 2 + 3 + 4 + 5)

```javascript
sum(square, 1, add1, 5)
```

**Expected:** `55` (1 + 4 + 9 + 16 + 25)

```javascript
sum(cube, 1, add1, 5)
```

**Expected:** `225` (1 + 8 + 27 + 64 + 125)

**The power:** One function handles all three. No copying. No structure changes.
Only the `term` argument changes.

---

## Step 3 — Trace `sum`

**Trace `sum(square, 1, add1, 3)`:**

```
sum(square, 1, add1, 3)
  → 1 > 3 ? 0 : square(1) + sum(square, add1(1), add1, 3)
  → square(1) + sum(square, 2, add1, 3)       (1 ≤ 3, evaluate add1(1)=2)
  → 1 + sum(square, 2, add1, 3)               (evaluate square(1)=1)
  → 1 + (square(2) + sum(square, 3, add1, 3)) (2 ≤ 3)
  → 1 + (4 + sum(square, 3, add1, 3))         (evaluate square(2)=4)
  → 1 + (4 + (square(3) + sum(square, 4, add1, 3)))  (3 ≤ 3)
  → 1 + (4 + (9 + sum(square, 4, add1, 3)))   (evaluate square(3)=9)
  → 1 + (4 + (9 + 0))                         (4 > 3 → base case → 0)
  → 1 + (4 + 9)
  → 1 + 13
  → 14
```

**Expected:** `14` — verify in the console.

---

### Concept: Higher-Order Function

**What it is:** A function that takes other functions as arguments, or returns
a function as its result.

> **Term: higher-order function** — a function that operates on functions.
> "Higher-order" means it works at a higher level of abstraction — it abstracts
> over PATTERNS of computation, not just values.

**What it hides:** The repetitive structure of similar computations. `sum` hides
the recursive summation structure — you only supply the varying part (the term function).

**The invariant:** Every call to `sum(term, a, next, b)` computes the sum of
`term(a) + term(next(a)) + term(next(next(a))) + ...` until the argument exceeds `b`.
This invariant holds regardless of what `term` or `next` are — they are plugged into
a fixed mathematical structure.

SICP says: "This [pattern] reveals an important abstraction waiting to be brought
to the surface. Mathematicians long ago identified the abstraction of summation of
a series and invented 'sigma notation' [...] The power of sigma notation is that
it allows mathematicians to deal with the concept of summation itself rather than
only with particular sums."

---

## Step 4 — Returning Functions

Functions can also be the RETURN VALUE of another function.

```javascript
const make_adder = n => x => x + n;
```

Read: "given n, return a function that adds n to its argument."

**OPEN CONSOLE AND TRY:**

```javascript
const add5  = make_adder(5);
const add10 = make_adder(10);

add5(3)    // → 8
add10(3)   // → 13
add5(add10(1))  // → ?
```

**Trace `make_adder(5)`:**
```
make_adder(5)
  → x => x + 5     (substitute n=5 into the body x => x + n)
  → (a function that adds 5 to its argument)
```

`add5` is now bound to the function `x => x + 5`.

```
add5(3)
  → (x => x + 5)(3)  (add5 IS the function x => x + 5)
  → 3 + 5            (substitute x=3)
  → 8
```

> **Term: closure** — a function that "captures" variables from its surrounding
> scope. `x => x + n` captures `n` from the `make_adder` call. Even after
> `make_adder` returns, `add5` still knows `n = 5`. The function "closes over"
> the variable. SICP discusses closures in Chapter 3.

---

## Step 5 — Compose

A classic higher-order function:

```javascript
const compose = (f, g) => x => f(g(x));
```

"Given functions f and g, return a new function that applies g first, then f."

**OPEN CONSOLE AND TRY:**

```javascript
const square = x => x * x;
const add1   = x => x + 1;

const square_then_add1 = compose(add1, square);
square_then_add1(5)    // → 26 (square(5)=25, add1(25)=26)

const add1_then_square = compose(square, add1);
add1_then_square(5)    // → 36 (add1(5)=6, square(6)=36)
```

`compose` creates a new function from two existing ones. This is exactly what
SICP uses to build complex computations from simple pieces.

---

## 🎯 Challenge: Rewrite `sum` Iteratively with an Accumulator

**The goal:** The `sum` from Step 2 is recursive (linear recursive process).
Rewrite it as a linear iterative process using an accumulator.

```javascript
// Recursive (from above):
const sum_r = (term, a, next, b) =>
    a > b ? 0 : term(a) + sum_r(term, next(a), next, b);

// Iterative (your task):
const sum_iter = (term, a, next, b, acc) =>
    // fill this in
    ;

const sum = (term, a, next, b) => sum_iter(term, a, next, b, 0);
```

Verify: `sum(square, 1, add1, 5)` should still return `55`.

Trace the iterative version to confirm the trace is flat (no pending additions).

---

<details>
<summary>▶ Show Solution</summary>

```javascript
const sum_iter = (term, a, next, b, acc) =>
    a > b ? acc : sum_iter(term, next(a), next, b, acc + term(a));

const sum = (term, a, next, b) => sum_iter(term, a, next, b, 0);
```

**Trace `sum(square, 1, add1, 3)` iteratively:**
```
sum_iter(square, 1, add1, 3, 0)
  → sum_iter(square, 2, add1, 3, 0 + square(1)) → ...(square, 2, add1, 3, 1)
  → sum_iter(square, 3, add1, 3, 1 + square(2)) → ...(square, 3, add1, 3, 5)
  → sum_iter(square, 4, add1, 3, 5 + square(3)) → ...(square, 4, add1, 3, 14)
  → 14                                              (4 > 3 → return acc=14)
```

The trace is completely flat. This is SICP's iterative sum (Chapter 1.3.1, exercise 1.30).

</details>

---

## Final Check

| What | How to verify |
|------|---------------|
| `apply_twice(square, 2)` returns `16` | Tested |
| `apply_twice(add1, 10)` returns `12` | Tested |
| `sum(identity, 1, add1, 5)` returns `15` | Tested |
| `sum(square, 1, add1, 5)` returns `55` | Tested |
| `sum(cube, 1, add1, 5)` returns `225` | Tested |
| `sum(square, 1, add1, 3)` traced correctly | 10-step trace, reaches 14 |
| `make_adder(5)(3)` returns `8` | Tested |
| `compose(add1, square)(5)` returns `26` | Tested |
| Challenge: iterative `sum` works and trace is flat | Solution traced |

---

## Quick Check Answers

**1. Could you pass `Math.sqrt` as an argument?**
Yes. `Math.sqrt` is a value (a function object). You can pass it as an argument:
```javascript
const apply = (f, x) => f(x);
apply(Math.sqrt, 25)  // → 5
```
`Math.sqrt` itself is an argument; `Math.sqrt(25)` is a CALL that evaluates to `5`.
The distinction matters — passing the function gives the receiver the ABILITY to call it;
passing the call gives only the number result.

**2. What is the common pattern in the three sum functions?**
All three: start at 1, increase by 1, sum until n, add 0 at the end. The only difference
is the term: `n`, `n*n`, or `n*n*n`. The SICP `sum` abstraction captures this:
it accepts the term as a function argument and applies it to each value in the range.

**3. What does "first-class" mean?**
A value is "first-class" if it can be: (1) bound to a name, (2) passed as an argument
to a function, (3) returned as a result from a function, (4) included in data structures.
In JavaScript and Scheme, functions are first-class — they satisfy all four conditions.
In many older languages, functions were NOT first-class (you could call them but not pass
them around). This restriction made abstraction over computation patterns impossible.

---

## What Is Next — LAB 09

You have everything you need to open SICP and not be lost. LAB 09 is a guided
walk through SICP's actual first pages — reading Chapter 1.1 together, seeing
exactly where each concept you learned appears, and connecting the book's prose
to the code you have been writing. After LAB 09, you are ready to read SICP
independently.

*Continue to Before SICP — LAB 09 — Reading SICP: A Guided Walk Through Chapter 1.1.*
