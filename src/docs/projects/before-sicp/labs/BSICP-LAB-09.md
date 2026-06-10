# Before SICP — LAB 09 — Reading SICP: A Guided Walk Through Chapter 1

**Prerequisites:** LABs 01–08. You know: expressions, names, functions, the
substitution model, conditionals, recursion, iterative vs recursive processes,
higher-order functions.

**What this lab adds:**
- You open SICP Chapter 1 and recognize every concept as something you have already practiced
- You run SICP's exact examples in the console and verify them
- You know which SICP sections map to which lab
- You have a strategy for when SICP is confusing

**Time:** 60–90 minutes (reading + console practice)

---

## Before You Open the Book

This lab does not teach new concepts. Everything in SICP Chapter 1 (through
Section 1.3) uses exactly the tools you already have:

| You learned | SICP calls it | SICP section |
|-------------|--------------|--------------|
| expressions evaluate to values | "the read-eval-print loop" | 1.1.1 |
| `const x = 5` | "naming and the environment" | 1.1.2 |
| `x => x * x` | "compound functions" | 1.1.4 |
| the substitution model | "the substitution model" | 1.1.5 |
| `condition ? a : b` | "conditional expressions and predicates" | 1.1.6 |
| functions calling functions | "functions as black-box abstractions" | 1.1.7 |
| `factorial_r` | "linear recursive process" | 1.2.1 |
| `factorial_i` with accumulator | "linear iterative process" | 1.2.1 |
| `fib_r` | "tree recursion" | 1.2.2 |
| `sum(term, a, next, b)` | "summations as higher-order functions" | 1.3.1 |
| `compose`, `make_adder` | "returning functions as values" | 1.3.3 |

Nothing in this list will surprise you. Your job in this lab is to locate each
one in the actual book and confirm "yes — I know this."

---

## How to Read SICP

SICP is not a tutorial. It is a proof — it builds a rigorous case that computation
can be understood through a small number of powerful ideas. Reading it passively
produces very little. Reading it actively — with a console open, running every
example — produces mastery.

**The active reading protocol:**

1. Read one paragraph.
2. If there is a code example, run it in the console before reading further.
3. Before running it, predict the output.
4. If the prediction was wrong, trace it manually to find where your model broke.
5. Read SICP's exercises. Do them. They are not optional examples — they are
   where the learning happens.

---

## Section 1.1 — Building Abstractions with Functions

### 1.1.1 — Expressions

SICP opens with:

> "One easy way to get started at programming is to examine some typical interactions
> with an interpreter for the JavaScript language. [...] We type an expression, and
> the interpreter responds by displaying the result of its evaluating that expression."

Run these in the console — they appear in SICP:

```javascript
486
```
**Expected:** `486` — a number literal IS an expression. Its value is itself.

```javascript
137 + 349
```
**Expected:** `486`

```javascript
10 / 5
```
**Expected:** `2`

```javascript
2.7 + 10
```
**Expected:** `12.7`

**SICP's term for these:** "primitive expressions" — the simplest building blocks.

---

### 1.1.2 — Naming and the Environment

SICP writes:

> "A critical aspect of a programming language is the means it provides for using
> names to refer to computational objects. We say that the name identifies a variable
> whose value is the object."

SICP JS syntax for naming:

```javascript
const size = 2;
size
```
**Expected:** `2`

```javascript
const pi = 3.14159;
const radius = 10;
const circumference = 2 * pi * radius;
circumference
```
**Expected:** `62.8318`

You wrote exactly this in LAB 02.

> **SICP's note on the environment:** "The possibility of associating values with
> symbols and later retrieving them means that the interpreter must maintain some
> sort of memory that keeps track of the name-object pairs. This memory is called
> the environment (more precisely the global environment, since we will see later
> that a computation may involve a number of different environments)."

You will learn about multiple environments in SICP Chapter 3. For now: one global
environment in the console.

---

### 1.1.3 — Evaluating Combinations

SICP's rule for evaluation (you traced this in LAB 04):

> "To evaluate a combination, do the following:
> 1. Evaluate the subexpressions of the combination.
> 2. Apply the function that is the value of the leftmost subexpression (the function)
>    to the arguments that are the values of the other subexpressions (the arguments)."

This is the applicative order you learned in LAB 04. Run:

```javascript
(2 + 4 * 6) * (3 + 12)
```

**Predict before running.** SICP asks you to trace the evaluation tree of this
expression. Try it:

```
Step 1: evaluate 4 * 6 → 24
Step 2: evaluate 2 + 24 → 26
Step 3: evaluate 3 + 12 → 15
Step 4: evaluate 26 * 15 → 390
```

**Expected:** `390`

---

### 1.1.4 — Compound Functions

This is where SICP introduces the arrow function:

```javascript
const square = x => x * x;
```

SICP writes: "We have here a compound function, which has been given the name `square`."

Run:

```javascript
const square = x => x * x;
square(21)
square(2 + 5)
square(square(3))
```

**Expected:** `441`, `49`, `81`

Then SICP introduces:

```javascript
const sum_of_squares = (x, y) => square(x) + square(y);
sum_of_squares(3, 4)
```

**Expected:** `25`

And:

```javascript
const f = a => sum_of_squares(a + 1, a * 2);
f(5)
```

**Expected:** `136` — trace this:
```
f(5)
→ sum_of_squares(5+1, 5*2)
→ sum_of_squares(6, 10)
→ square(6) + square(10)
→ 36 + 100
→ 136
```

---

### 1.1.5 — The Substitution Model

SICP formally presents what you practised in LAB 04. Read this section carefully.

SICP traces `f(5)`:

> "To apply a compound function to arguments, evaluate the body of the function
> with each parameter replaced by the corresponding argument."

The trace SICP provides:

```
f(5)
→ sum_of_squares(5 + 1, 5 * 2)
→ sum_of_squares(6, 10)
→ square(6) + square(10)
→ (6 * 6) + (10 * 10)
→ 36 + 100
→ 136
```

If this trace is exactly what you expected from LAB 04, you are on track.

SICP then discusses the alternative "normal order" evaluation (substitute first,
evaluate later). Run this thought experiment in your head — do not run any code.
SICP shows that both orders give the same answer for well-behaved functions.

---

### 1.1.6 — Conditional Expressions and Predicates

SICP introduces the conditional expression:

```javascript
const abs = x => x >= 0 ? x : -x;
```

This is the `abs_val` you wrote in LAB 05. Run the SICP version and test it.

SICP also introduces logical operators:

```javascript
const and = (p, q) => p ? q : false;
const or  = (p, q) => p ? true : q;
const not = p => p ? false : true;
```

> **Wait** — SICP is defining `and` and `or` as FUNCTIONS? In LAB 05 you used
> `&&` and `||` as operators. Why is SICP writing them as functions?
>
> SICP is making a point: the logical operators have special behavior (`&&` does
> not evaluate the right side if the left is false — this is called **short-circuit
> evaluation**). SICP's function versions are simplified and always evaluate both
> arguments. The operator versions are more efficient. SICP introduces the
> distinction to sharpen your understanding of evaluation order.

---

### 1.1.7 — Newton's Method

SICP uses Newton's method to find square roots — a function that is computed by
successive approximation rather than a direct formula. This is SICP's first
extended example of a multi-function program.

The functions SICP defines (run them in the console):

```javascript
const square      = x => x * x;
const abs         = x => x >= 0 ? x : -x;
const good_enough = (guess, x) => abs(square(guess) - x) < 0.001;
const average     = (x, y) => (x + y) / 2;
const improve     = (guess, x) => average(guess, x / guess);

const sqrt_iter = (guess, x) =>
    good_enough(guess, x) ? guess : sqrt_iter(improve(guess, x), x);

const sqrt = x => sqrt_iter(1.0, x);
```

**Run:**

```javascript
sqrt(9)
```
**Expected:** approximately `3.00009` (within 0.001 of 3)

```javascript
sqrt(2)
```
**Expected:** approximately `1.41421`

```javascript
sqrt(0.0001)
```
**Expected:** approximately `0.03162...` (but see the note below)

> **SICP's problem with small numbers:** The `good_enough` test uses an absolute
> tolerance of `0.001`. For very small numbers (like `0.0001`), this tolerance
> is too large relative to the answer. For very large numbers, the iteration may
> never terminate. SICP exercise 1.7 asks you to fix this. You now have the tools
> to understand both the problem and the fix.

---

## Section 1.2 — Recursive and Iterative Processes

### 1.2.1 — Factorial

SICP presents the two factorial versions from LAB 07. Run them and compare the
traces SICP draws.

SICP's recursive version:
```javascript
const factorial = n => n === 1 ? 1 : n * factorial(n - 1);
```

SICP's iterative version:
```javascript
const fact_iter  = (product, counter, max_count) =>
    counter > max_count ? product
                        : fact_iter(counter * product, counter + 1, max_count);

const factorial_i = n => fact_iter(1, 1, n);
```

Note that SICP uses THREE arguments (product, counter, max_count) instead of
LAB 07's two (n, acc). Both are valid. SICP counts up instead of down — different
implementation, same result.

**The key passage:** SICP says:

> "In contrasting iteration and recursion, we must be careful not to confuse the
> notion of a recursive process with the notion of a recursive function. When we
> describe a function as recursive, we are referring to the syntactic fact that
> the function declaration refers to the function itself. But when we describe a
> process as following a pattern that is, say, linearly recursive, we are speaking
> about how the process evolves, not about the syntax of how the function is written."

Read this twice. This is the insight from LAB 07, stated precisely.

---

### 1.2.2 — Tree Recursion (Fibonacci)

SICP's Fibonacci:

```javascript
const fib = n =>
    n === 0 ? 0 :
    n === 1 ? 1 :
    fib(n - 1) + fib(n - 2);
```

Run `fib(10)` (→ 55). Run `fib(20)` (→ 6765). Note the computation time.
Do NOT run `fib(50)` — it will hang your browser tab.

> **Why is it slow?** `fib(5)` calls `fib(4)` and `fib(3)`. But `fib(4)` also
> calls `fib(3)`. SICP draws the call tree — each branch fans into two. The number
> of calls grows EXPONENTIALLY with n. This is SICP's example of a "tree recursive"
> process: the recursion branches into a tree rather than a line.

The iterative version (from LAB 07's challenge) runs instantly for any n.

---

## Section 1.3 — Higher-Order Functions

### 1.3.1 — Functions as Arguments

SICP's `sum` (the exact function from LAB 08):

```javascript
const sum = (term, a, next, b) =>
    a > b ? 0 : term(a) + sum(term, next(a), next, b);
```

Run SICP's examples:

```javascript
// Sum of integers from a to b:
const identity = x => x;
const inc      = x => x + 1;
const sum_integers = (a, b) => sum(identity, a, inc, b);
sum_integers(1, 10)  // → 55
```

```javascript
// Sum of cubes from a to b:
const cube = x => x * x * x;
const sum_cubes = (a, b) => sum(cube, a, inc, b);
sum_cubes(1, 10)  // → 3025
```

SICP then uses `sum` to approximate π (pi) using the Leibniz formula:

```javascript
const pi_sum = (a, b) =>
    sum(x => 1.0 / (x * (x + 2)), a, x => x + 4, b);

8 * pi_sum(1, 1000)
```

**Expected:** approximately `3.139...` (closer to π = 3.14159... with more terms)

Notice that `x => 1.0 / (x * (x + 2))` is an arrow function written INLINE as an
argument. This is a lambda (anonymous function) passed directly — no `const` needed.
You have been doing this throughout the labs; now SICP names the pattern.

> **Term: lambda** — an anonymous function (one without a name). In SICP's Scheme
> version, these are written with the `lambda` keyword. In JavaScript, they are
> arrow functions: `x => x * x`. SICP JS calls them "lambda expressions."

---

### 1.3.2 — Constructing Functions Using Lambda

SICP formalizes that `x => x * x` IS a lambda expression. Any place you need a
function, you can write one inline:

```javascript
const f = x => (x => x + 4)(x * x);
```

This creates a function and immediately calls it. Run it:

```javascript
f(5)
```

**Trace:**
```
f(5)
→ (x => x + 4)(5 * 5)
→ (x => x + 4)(25)
→ 25 + 4
→ 29
```

**Expected:** `29`

SICP also introduces `const` declarations LOCAL to a function using nested functions.
You have seen this: a helper function defined inside another is only visible within it.

---

### 1.3.3 — Functions as Returned Values

SICP's formalization of returning functions:

```javascript
const average_damp = f => x => average(x, f(x));
```

"Given a function f, return a new function that averages x with f(x)."

```javascript
const average  = (x, y) => (x + y) / 2;
const square   = x => x * x;

const average_damp = f => x => average(x, f(x));

average_damp(square)(10)
```

**Trace:**
```
average_damp(square)
  → x => average(x, square(x))      (substitute f=square)

average_damp(square)(10)
  → (x => average(x, square(x)))(10)
  → average(10, square(10))
  → average(10, 100)
  → (10 + 100) / 2
  → 55
```

**Expected:** `55`

SICP uses `average_damp` to refactor the Newton's method square root:

```javascript
const sqrt = x => fixed_point(average_damp(y => x / y), 1.0);
```

You do not need to implement `fixed_point` now — recognize the pattern:
a function (`average_damp`) that takes a function (`y => x/y`) and returns
a new function, which is then passed to another function (`fixed_point`).
Functions all the way down.

---

## Your Reading Strategy

When you encounter something confusing in SICP:

1. **Run the example first.** Many confusions clear up when you see the output.
2. **Trace it.** Write out the substitution model steps on paper.
3. **Find the structure.** Is it a base case + recursive case? Is it using an accumulator?
   Is it passing a function as an argument? Label the parts.
4. **Look for the analog.** Which lab covered this concept? What did it call it?
5. **Do the exercise.** SICP exercises are not optional. They are the test of whether
   you understood the section or just followed along.

---

## SICP Chapter 1 — Concept Map

```
Chapter 1.1:
  1.1.1  Expressions              ← LAB 01
  1.1.2  const naming             ← LAB 02
  1.1.3  Evaluation rules         ← LAB 04
  1.1.4  Arrow functions          ← LAB 03
  1.1.5  Substitution model       ← LAB 04
  1.1.6  Conditionals, predicates ← LAB 05
  1.1.7  Newton's method (all above combined)

Chapter 1.2:
  1.2.1  Linear recursion         ← LAB 06
         Linear iteration         ← LAB 07
  1.2.2  Tree recursion (Fibonacci) ← LAB 07 challenge
  1.2.3–1.2.6  Applications (orders of growth, GCD, primes)
         ← all use LAB 06–07 tools; new math, same patterns

Chapter 1.3:
  1.3.1  Functions as arguments   ← LAB 08 (sum)
  1.3.2  Lambda expressions       ← LAB 03 (arrow functions)
  1.3.3  Returning functions      ← LAB 08 (make_adder, compose)
  1.3.4  Newton's method, fixed point ← 1.3.1–1.3.3 combined
```

---

## 🎯 Challenge: Exercise 1.5 — Normal vs Applicative Order

SICP Exercise 1.5 (Chapter 1.1.5):

```javascript
const p = () => p();  // p calls itself forever
const test = (x, y) => x === 0 ? 0 : y;
```

Ben Bitdiddle claims he has devised a test to determine whether the interpreter
he is faced with is using applicative order or normal order evaluation.

He defines `p` and `test` as above, and evaluates `test(0, p())`.

**Applicative order:** evaluate arguments before calling `test`.
`p()` is evaluated first — it calls itself forever — **hangs**.

**Normal order:** substitute without evaluating arguments.
`test(0, p())` → `0 === 0 ? 0 : p()` → `0` (never evaluates p()).

**Questions:**
1. What does `test(0, p())` do in the browser console? (Applicative order)
2. Under normal order, what would it return?
3. What does this tell Ben about the JavaScript interpreter?

Try `test(0, p())` in the console. **Be ready to close the tab** — it may hang.

---

<details>
<summary>▶ Show Answer</summary>

**In the console:** The browser hangs (or eventually crashes). JavaScript uses
applicative order — it tries to evaluate `p()` before calling `test`. Since `p()`
calls itself forever, the call stack overflows.

**Under normal order:** It would return `0`. The body `x === 0 ? 0 : y` evaluates
the condition `x === 0` (which is `0 === 0 = true`), returns `0`, and never evaluates `y` (which is `p()`).

**What Ben learns:** JavaScript uses applicative order evaluation — arguments are
evaluated before the function is called.

This exercise is why SICP teaches the substitution model so carefully — without it,
you cannot reason about what evaluation ORDER does and does not affect.

</details>

---

## Final Check

| What | How to verify |
|------|---------------|
| Section 1.1 examples run and match predictions | Ran all examples, no surprises |
| `sqrt(9)` approximates `3` | Tested Newton's method |
| Recursive `fib(20)` returns `6765` | Tested |
| `sum_integers(1, 10)` returns `55` | Tested SICP's sum |
| `8 * pi_sum(1, 1000)` approximates π | Tested Leibniz formula |
| `average_damp(square)(10)` traced to `55` | Trace matches console |
| Concept map: each section has a known lab | All entries have a lab number |
| Challenge 1.5: behaviour understood | Can explain why it hangs |

---

## You Are Ready

You know everything SICP Chapter 1 requires you to know. When you hit a passage
that is confusing, you have the tools to work through it:

- **Run the example** (console, F12)
- **Trace the substitution** (paper)
- **Locate the pattern** (which of LABs 01–08 covers this?)
- **Do the exercise** (not optional)

The book will introduce things you have not seen — mathematical concepts like
the golden ratio, orders of growth (Big-O before it has that name), and Fermat's
little theorem. Those are new mathematics, not new programming concepts. Your
programming foundation is solid.

SICP is one of the most important books in computer science. You are ready to read it.

*End of the Before SICP series. Open Chapter 1.*
