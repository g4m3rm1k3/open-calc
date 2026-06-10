# Before SICP — LAB 01 — Expressions: How Code Becomes a Value

**Prerequisites:** None. This is the starting point.

**What this lab adds:**
- You type an expression in the browser console and see it evaluate to a value
- You understand the difference between an expression and a statement
- You know what SICP means when it says "evaluating an expression"

**Time:** 25–35 minutes

---

> **Quick Check — answer these before reading further:**
>
> 1. What do you think `3 + 4 * 2` evaluates to in JavaScript? 14 or 11?
> 2. SICP says "the interpreter always prints the value of the expression." What
>    does the word *evaluate* mean in plain English?
> 3. Is `console.log("hello")` an expression that produces a value? If so, what value?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab you will have run eight different expressions in the
browser console and seen exactly what each produces. You will be able to predict
what any arithmetic expression evaluates to before you run it.

```
> 2 + 3
  5
> Math.sqrt(16)
  4
> 1 + 2 * 3
  7
> (1 + 2) * 3
  9
```

That console exchange — where you type, it answers — is the same conversation
SICP's first chapter is built around.

---

## Setup: Open the Console

Open any browser tab (a new blank tab is fine). Press **F12** (or right-click
anywhere → Inspect). Click the **Console** tab.

You now have a JavaScript interpreter. Every line you type is evaluated immediately.

This is the same kind of read-eval-print loop SICP uses. SICP calls this the
"read-eval-print loop" or **REPL**:
- **Read:** it reads what you type
- **Eval:** it evaluates the expression
- **Print:** it prints the result
- **Loop:** it waits for your next input

---

### Concept: Expression

**What it is:** A piece of code that the computer evaluates to produce a single value.

**The problem before:** If you do not know what an expression is, you do not know
what SICP means on its first page, which says: "A computational process is directed
by a pattern of rules called a *program*. People create programs to direct
processes. In effect, we conjure the spirits of the computer with our spells."
Those "spells" are expressions.

**The solution:** Every expression has exactly one value when evaluated.
`2 + 3` is not a command ("add these"). It is a question ("what is 2 + 3?") and
the answer is `5`. The interpreter answers the question.

**Canonical example:**
```
Real-world: A recipe calls for "2 cups of flour + 1 cup of sugar."
That total (3 cups) is the value of the expression "2 + 1."
The expression is the description; the value is the result of measuring it.

In code:
2 + 3   → 5      (the expression is 2+3, the value is 5)
10 / 2  → 5      (different expression, same value — value depends only on the numbers)
3 * 3   → 9
```

**Why this specific example makes it obvious:** Notice that `2 + 3` and `10 / 2`
both evaluate to `5`. The *expression* is different but the *value* is the same.
This is what "evaluate" means — reduce to a value. Different paths, same destination.

**Watch for:** Students confuse "expression" with "line of code." Not every line
of code is an expression. An expression *produces a value*. A statement *does*
something (like printing) but does not itself become a value you can use elsewhere.

---

## Step 1 — Your First Expressions

Type each of these into the console. Press Enter after each one. Watch what appears.

```javascript
2 + 3
```

**OPEN CONSOLE AND TRY**

**Expected:** The console prints `5` on the next line.

```javascript
10 - 4
```

**Expected:** `6`

```javascript
3 * 7
```

**Expected:** `21`

```javascript
20 / 4
```

**Expected:** `5`

Notice: the console always answers. You type an expression, it gives back the value.
That is the REPL loop in action.

**Change something:** Type `2 + 3 + 4 + 5`. Before pressing Enter — predict the answer.
Then press Enter. Were you right?

---

## Step 2 — Nested Expressions

SICP's very first non-trivial concept is that expressions can be nested inside
each other. The inner expression evaluates first, and its value is used by the outer one.

```javascript
Math.sqrt(9)
```

**OPEN CONSOLE AND TRY**

**Expected:** `3`

`Math.sqrt` is a function that computes the square root. `Math.sqrt(9)` is an
expression: the function `Math.sqrt` applied to the value `9`. The value of the
whole expression is `3`.

```javascript
Math.sqrt(2 + 7)
```

**OPEN CONSOLE AND TRY**

**Expected:** `3` (because `2 + 7 = 9`, and `Math.sqrt(9) = 3`)

---

### Concept: Order of Evaluation

**What it is:** The rules for which part of an expression evaluates first when
multiple operations are present.

**The problem before:** `1 + 2 * 3` could mean `(1 + 2) * 3 = 9` or `1 + (2 * 3) = 7`.
Without a rule, the result is ambiguous.

**The solution:** JavaScript follows standard mathematical precedence:
1. Parentheses first (innermost first)
2. Then multiplication and division (`*`, `/`)
3. Then addition and subtraction (`+`, `-`)

**Canonical example:**
```
Real-world: "Do the work inside the parentheses before anything outside them."
Same rule as math class.

1 + 2 * 3   → 1 + 6 → 7     (multiplication first)
(1 + 2) * 3 → 3 * 3 → 9     (parentheses first)
```

**Watch for:** Assuming left-to-right always. `8 / 2 * 4` evaluates left-to-right
ONLY because `*` and `/` have equal precedence. `8 + 2 * 4` does NOT evaluate
left-to-right — multiplication runs first.

---

## Step 3 — Predict, Then Run

Before typing each expression below, write your predicted answer.
Then type it in the console and see if you were right.

| Expression | Your prediction | Actual |
|------------|----------------|--------|
| `4 + 3 * 2` | | |
| `(4 + 3) * 2` | | |
| `10 - 2 - 3` | | |
| `Math.sqrt(4 + 12)` | | |
| `2 * 3 + 4 * 5` | | |

**Type each one into the console and compare.**

Fill in the table mentally. If your prediction was wrong, stop and figure out
why before moving on.

---

## Step 4 — Break It on Purpose

Type this:

```javascript
2 +
```

**OPEN CONSOLE AND TRY**

Notice the console changes its prompt — it is waiting for more input. An
incomplete expression cannot be evaluated. Press **Shift+Enter** to add a line,
then type `3` and Enter. Or press Escape to cancel.

Now type:

```javascript
Math.sqrt("hello")
```

**OPEN CONSOLE AND TRY**

**Expected:** `NaN` — which stands for "Not a Number." The square root of text
is not a number. JavaScript does not crash — it returns a special value that
means "the result of this expression is not a valid number."

> **Term: `NaN`** — Not a Number. A special value JavaScript produces when a
> numeric operation receives a non-numeric input or an impossible calculation
> (like `Math.sqrt(-1)` in real numbers). It is itself a value — expressions
> containing `NaN` usually produce `NaN`.

```javascript
NaN + 5
```

**Expected:** `NaN` — a value "infected" by NaN stays NaN.

---

### Concept: Primitive Values

**What it is:** The simplest, non-decomposable values that expressions evaluate to.

**Canonical example:**
```javascript
5         // a number
"hello"   // a string (text in quotes)
true      // a boolean (true or false)
```

> **Term: number** — a numeric value. `5`, `3.14`, `-7`, `0` are all numbers.
> In SICP JS, numbers are the primary values used in early chapters.

> **Term: string** — a sequence of characters in quotes. `"hello"`, `"world"`,
> `"3"` are strings. Note: `"3"` (string) and `3` (number) are different types.

> **Term: boolean** — a value that is either `true` or `false`. Named after
> George Boole, a mathematician. Used for yes/no conditions.

**Watch for:** `"5"` (string) vs `5` (number). They look similar but behave
differently. `"5" + 3` in JavaScript gives `"53"` (string concatenation), not
`8` (addition). This is one of JavaScript's quirks.

**Try it:**
```javascript
"5" + 3
```

**Expected:** `"53"` (the `+` operator with a string does concatenation, not addition).

This is NOT how SICP's examples work. SICP uses only numbers in its early chapters.
When you read SICP, assume all values are numbers unless stated otherwise.

---

## Step 5 — More Useful Math Functions

SICP uses several math operations. Learn their JavaScript names:

```javascript
Math.abs(-7)
```

**Expected:** `7` — absolute value (removes the negative sign)

```javascript
Math.max(3, 7, 2)
```

**Expected:** `7` — the largest of several values

```javascript
Math.min(3, 7, 2)
```

**Expected:** `2` — the smallest

```javascript
Math.pow(2, 10)
```

**Expected:** `1024` — 2 raised to the power 10

**Change something:** Try `Math.pow(3, 3)`. Predict the answer first. Then try
`Math.abs(Math.min(-5, -2))`. What is the inner expression? What does it produce?
What does the outer expression receive?

---

## 🎯 Challenge: Nested Evaluation

**The goal:** Without running the code, trace through this expression step by step
and determine what it produces:

```javascript
Math.sqrt(Math.pow(3, 2) + Math.pow(4, 2))
```

Write out each step:
1. What does `Math.pow(3, 2)` evaluate to?
2. What does `Math.pow(4, 2)` evaluate to?
3. What does `[step 1 result] + [step 2 result]` evaluate to?
4. What does `Math.sqrt([step 3 result])` evaluate to?

Predict the final value, then run it in the console.

*(Hint: this is a famous formula from geometry.)*

Try for at least 5 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```
1. Math.pow(3, 2) → 9      (3 squared = 9)
2. Math.pow(4, 2) → 16     (4 squared = 16)
3. 9 + 16 → 25
4. Math.sqrt(25) → 5
```

This is the **Pythagorean theorem**: the hypotenuse of a right triangle with
legs 3 and 4 is 5. The formula is √(a² + b²).

SICP uses this exact kind of nested expression in its first few pages.
The inner expressions evaluate to numbers, and those numbers become the
arguments to the outer expression. This is called **compound expressions** —
expressions built from other expressions.

**The key insight:** Every expression, no matter how complex, reduces to a
single value by evaluating from the inside out. `Math.sqrt(Math.pow(3,2) + Math.pow(4,2))`
is one expression whose value is `5`. You could use it anywhere you could use `5`.

</details>

---

## Final Check

| What | How to verify |
|------|---------------|
| Console is open | F12 → Console tab visible |
| `2 + 3` evaluates to `5` | Typed it, saw the result |
| `Math.sqrt(9)` evaluates to `3` | Tried it |
| `1 + 2 * 3` evaluates to `7` (not 9) | Understood why |
| `(1 + 2) * 3` evaluates to `9` | Parentheses change the order |
| `"5" + 3` gives `"53"` not `8` | Saw the string concatenation quirk |
| Challenge: nested expression traced manually | Traced 4 steps correctly |

---

## Quick Check Answers

**1. What does `3 + 4 * 2` evaluate to — 14 or 11?**
`11`. Multiplication has higher precedence than addition. `4 * 2 = 8` is evaluated
first, then `3 + 8 = 11`. If you meant 14, you would write `(3 + 4) * 2`.

**2. What does "evaluate" mean?**
To evaluate an expression means to reduce it to a single value by performing all
the operations in it. `3 + 4 * 2` evaluates to `11`. The expression IS the question.
The value IS the answer. Evaluation is the process of answering the question.

**3. Is `console.log("hello")` an expression?**
Yes — but its value is `undefined`. `console.log` has the side effect of printing
"hello" to the console, but the expression itself evaluates to `undefined`. This
is why `console.log(2 + 3)` prints `5` (side effect) but evaluates to `undefined`
(value). SICP's early chapters avoid side effects and focus purely on expressions
that produce useful values.

---

## What Is Next — LAB 02

Every expression produces a value. But right now, every value disappears — you
compute `Math.pow(2, 10)` and get `1024`, but the next expression cannot use it.
In LAB 02 you learn to give values names — the JavaScript equivalent of SICP's
"naming and the environment."

*Continue to Before SICP — LAB 02 — Names: Giving Values a Place to Live.*
