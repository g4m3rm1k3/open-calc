# Before SICP — LAB 03 — Functions: Naming a Computation

**Prerequisites:** LAB 02. You know: expressions, `const`, the environment,
using names in expressions.

**What this lab adds:**
- You write a function using SICP JS's arrow-function syntax (`x => x * x`)
- You call a function with different inputs and see different results
- You understand why SICP calls functions "the most important abstraction"
- You write `square`, `cube`, `average`, and `hypotenuse` — exactly as SICP does

**Time:** 35–45 minutes

---

> **Quick Check — answer these before reading further:**
>
> 1. In LAB 02 you wrote `const area = 3.14159 * 5 * 5`. The `5` is the radius.
>    If you want the area for radius 7, you must write a new `const`. How many
>    `const` declarations would you need for 100 different radii?
> 2. A recipe says "take any amount of flour, double it." The recipe works for
>    any amount. Is this more like a `const` (stores one specific value) or more
>    like a function (works for any input)?
> 3. SICP writes `const square = x => x * x`. Before reading further — what do
>    you think `x => x * x` means?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, you will have these functions working in the console:

```javascript
const square = x => x * x;
square(5)     // → 25
square(12)    // → 144
square(0.5)   // → 0.25

const cube = x => x * x * x;
cube(3)       // → 27

const average = (a, b) => (a + b) / 2;
average(4, 10)  // → 7

const hypotenuse = (a, b) => Math.sqrt(square(a) + square(b));
hypotenuse(3, 4)  // → 5
```

These are exactly the functions SICP introduces in Chapter 1.

---

## The Problem: One Name for One Value Is Not Enough

In LAB 02 you computed the area of a circle with radius 5:

```javascript
const pi   = 3.14159;
const r    = 5;
const area = pi * r * r;
```

If you want the area for radius 7, you cannot reassign `r` (`const` forbids it).
You would have to start over or add more names:

```javascript
const r2    = 7;
const area2 = pi * r2 * r2;

const r3    = 10;
const area3 = pi * r3 * r3;
```

For 100 different radii this becomes 200 lines of near-identical code. The
formula is always the same — only the input changes. You need a way to name
the *formula*, not just the result.

---

### Concept: Function — A Named Computation That Accepts Input

**What it is:** A named, reusable computation. Instead of storing one specific
value, it stores a recipe that works for any input.

**What it hides:** The connection between the input name (called the **parameter**)
and the actual value you provide when you call it (called the **argument**).
You write the recipe once with a placeholder name; when you call it, the
placeholder is replaced by the real value.

**The invariant it protects:** Every call to the function with the same argument
produces the same result. `square(5)` always returns `25` — no matter what else
has happened in your session.

**Canonical example:**
```
Real-world: A cookie recipe says "use 2 cups of X" where X is whichever
flour you have. The recipe is one document, but it works with
all-purpose flour, whole wheat flour, or almond flour.

In math: f(x) = x²   ← the formula is named f, x is the placeholder

In SICP JS: const square = x => x * x;
```

The `x` in `x => x * x` is a placeholder — a name for "whatever you hand me."
When you call `square(5)`, the `5` replaces every occurrence of `x` in the body.
The body `x * x` becomes `5 * 5` which evaluates to `25`.

**Watch for:** The `=>` (arrow) separates the parameter from the body.
"Given `x`, compute `x * x`." Reading it aloud: "x maps to x times x."
This is SICP JS syntax — you will see it on page 1 of the book.

---

## Step 1 — Your First Function

Type in the console:

```javascript
const square = x => x * x;
```

**OPEN CONSOLE AND TRY**

**Expected:** The console shows the function object (something like `x => x * x`).
The function is now named `square` in the environment.

Now call it:

```javascript
square(5)
```

**Expected:** `25`

```javascript
square(12)
```

**Expected:** `144`

```javascript
square(0.5)
```

**Expected:** `0.25`

**Change something:** Call `square` with negative numbers — `square(-3)`.
Does it matter that the input is negative? Why not?

---

## Step 2 — Reading the Arrow Syntax

SICP JS writes functions as:

```
parameter => body
```

or for multiple parameters:

```
(parameter1, parameter2) => body
```

Let's read `x => x * x` precisely:

- `x` — the parameter. This is a placeholder name for the input.
- `=>` — "maps to" (the arrow). Separates the input placeholder from the formula.
- `x * x` — the body. The expression that is evaluated when the function is called.
  Every occurrence of `x` is replaced by the actual argument.

When you call `square(5)`:
1. The argument `5` replaces the parameter `x` everywhere in the body
2. The body `x * x` becomes `5 * 5`
3. `5 * 5` evaluates to `25`
4. `25` is the value of the function call expression

This substitution process is exactly what SICP calls the **substitution model**
— the subject of its first major section.

---

### Concept: Parameter and Argument

**What it is:** Two related terms for the "input" of a function.

> **Term: parameter** — the placeholder name in the function definition.
> In `x => x * x`, the parameter is `x`. It is a local name — it only exists
> inside the function's body.

> **Term: argument** — the actual value you provide when you call the function.
> In `square(5)`, the argument is `5`. The parameter `x` takes on the value `5`
> during that call.

**Canonical example:**
```
Real-world: A recipe says "add X grams of sugar." X is the parameter — the blank
to fill in. "150 grams" is the argument — the specific value for this batch.

square(5)
  ↑       ↑
function  argument (5 is substituted for parameter x)
```

**Watch for:** The parameter name does not matter outside the function.
`const square = x => x * x` and `const square = n => n * n` are identical —
the placeholder name is internal. What matters is the relationship between
input and output.

---

## Step 3 — Functions with Two Parameters

For two inputs, wrap parameters in parentheses:

```javascript
const average = (a, b) => (a + b) / 2;
```

**OPEN CONSOLE AND TRY**

```javascript
average(4, 10)
```

**Expected:** `7` — (4 + 10) / 2 = 14 / 2 = 7

```javascript
average(0, 100)
```

**Expected:** `50`

```javascript
average(1, 2)
```

**Expected:** `1.5`

**Change something:** What does `average(average(0, 10), average(20, 30))` produce?
Predict it first, then run it.

---

## Step 4 — Functions Using Other Functions

This is where SICP starts. Functions can call other functions in their bodies.

```javascript
const hypotenuse = (a, b) => Math.sqrt(square(a) + square(b));
```

**OPEN CONSOLE AND TRY** (make sure `square` is already defined)

```javascript
hypotenuse(3, 4)
```

**Expected:** `5`

Trace through it:
1. `square(3)` → `9`
2. `square(4)` → `16`
3. `9 + 16` → `25`
4. `Math.sqrt(25)` → `5`
5. The function call `hypotenuse(3, 4)` → `5`

This is a function calling another function. `hypotenuse` does not know HOW
`square` computes its result — it just knows that `square(x)` produces the
square of `x`. This is **abstraction**: `hypotenuse` treats `square` as a black
box.

> **Term: abstraction** — hiding the details of HOW something works so you can
> use it without thinking about its internals. `hypotenuse` uses `square`
> without re-implementing multiplication. SICP's subtitle is literally
> "Abstraction" — it is the central theme of the entire book.

---

## Step 5 — A Library of Functions

Build these four functions — SICP's exact early examples:

```javascript
const square     = x => x * x;
const cube       = x => x * x * x;
const average    = (a, b) => (a + b) / 2;
const hypotenuse = (a, b) => Math.sqrt(square(a) + square(b));
```

**OPEN CONSOLE AND TRY** (all four lines), then test each:

```javascript
square(7)         // → 49
cube(4)           // → 64
average(6, 14)    // → 10
hypotenuse(5, 12) // → 13
```

**Change something:** Add one more:

```javascript
const circle_area = r => 3.14159 * square(r);
circle_area(5)    // → 78.539...
```

Notice: `circle_area` calls `square` instead of writing `r * r`. This is
deliberate — it reuses an existing abstraction. SICP says this is good practice.

---

## Step 6 — Break It on Purpose

**Test 1:** Call a function with the wrong number of arguments:

```javascript
average(5)        // missing second argument
```

**Expected:** `NaN` — `b` is `undefined`, and `5 + undefined = NaN`.
JavaScript does not error on missing arguments — the missing parameter becomes
`undefined`. This is different from SICP's Scheme where the wrong number of
arguments IS an error. Be careful.

**Test 2:** Reference a name that only exists inside a function:

```javascript
const double = x => x * 2;
x                         // try to use x outside the function
```

**Expected:** `ReferenceError: x is not defined`

> **Term: scope** — the region of code where a name is visible. The parameter
> `x` has scope limited to the function body `x * 2`. Outside the function,
> `x` does not exist. This is called **local scope**.

---

## 🎯 Challenge: Write `absolute_value`

**The goal:** Write a function `abs_val` that takes one number and returns
its absolute value (always positive).

Rules:
- Do NOT use `Math.abs`
- You must handle both positive and negative inputs
- You know arithmetic operators (`*`, `-`, etc.) but not `if` yet

Hint: Is there a mathematical operation that always produces a non-negative result
from a number, regardless of sign?

*(Think about what `square` does and whether `Math.sqrt` could help...)*

Try for at least 5 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```javascript
const abs_val = x => Math.sqrt(square(x));
abs_val(-7)   // → 7
abs_val(5)    // → 5
abs_val(0)    // → 0
```

**Why it works:** `square(x)` computes `x * x`. Squaring always produces a
non-negative result regardless of sign (`(-7) * (-7) = 49`). Then `Math.sqrt`
returns the positive square root. For any number x: `Math.sqrt(x * x) = |x|`.

**The insight:** You used two existing abstractions (`square` and `Math.sqrt`)
to build a new one (`abs_val`) without implementing the underlying arithmetic
yourself. This is the SICP way — build bigger abstractions from smaller ones.

In LAB 05 you will learn a more direct way using conditionals (`condition ? a : b`).
SICP uses that approach and explains why the square-root method, while clever,
has a subtle issue with very large numbers (floating-point precision).

</details>

---

## Final Check

| What | How to verify |
|------|---------------|
| `square(5)` returns `25` | Tested in console |
| `square(12)` returns `144` | Tested |
| `cube(3)` returns `27` | Tested |
| `average(4, 10)` returns `7` | Tested |
| `hypotenuse(3, 4)` returns `5` | Tested |
| `hypotenuse(5, 12)` returns `13` | Tested |
| Using parameter `x` outside function gives ReferenceError | Tested |
| Missing argument gives `NaN`, not an error | Tested `average(5)` |
| Challenge: `abs_val` works for negative inputs | Tested with `-7` |

---

## Quick Check Answers

**1. How many `const` declarations for 100 different radii?**
200 — one for `r1`, `r2`, ... `r100` and one for `area1`, `area2`, ... `area100`.
With a function: `const circle_area = r => 3.14159 * r * r`, you write ONE
declaration and call it 100 times with different arguments.

**2. Is a recipe more like `const` or a function?**
A function. A recipe is a reusable procedure that works for any input. `const`
stores ONE specific result. A function stores the procedure and runs it fresh
with each new input. The recipe for cookies is the function; one specific batch
is a `const` (the result of calling the recipe with specific ingredients).

**3. What does `x => x * x` mean?**
"Given x, compute x times x." `x` is the parameter (placeholder for input).
`=>` separates the parameter from the body. `x * x` is the body — the expression
evaluated when the function is called, with `x` replaced by the actual argument.

---

## What Is Next — LAB 04

You know how to define and call functions. But SICP spends significant time on
what happens MECHANICALLY when a function call evaluates — exactly how the
parameter gets substituted for the argument, step by step. In LAB 04 you learn
to trace evaluation manually. This unlocks your ability to understand any
SICP example, even the recursive ones that come later.

*Continue to Before SICP — LAB 04 — Tracing: The Substitution Model.*
