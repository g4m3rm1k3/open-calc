# Lesson 4: Asking Questions — `cond`, `if`, and Booleans

**What you will build**
You will build functions that make decisions based on inputs, including absolute value, number classification, and simple side-effect warnings. The transferable problems here are Scheme's `if` being an expression that always returns a value (not a statement), `cond` acting as a structural equivalent to if-else-if chains, and Scheme's truthiness rule where only `#f` is false and everything else is truthy. 

**What you need to know first**
- Lesson 0 (S-expressions, REPL, prefix notation, #lang racket)
- Lesson 1 (cons, car, cdr, pair?, atom?)
- Lesson 2 (list, null?, list?, nested lists, quote)
- Lesson 3 (define, lambda, closures, calling functions)

**Terms used in this lesson**

- **`#t` and `#f`** — The boolean literals in Scheme. `#t` means true, and `#f` means false. They exist to represent the truth or falsehood of tests.
- **Truthiness rule** — In Scheme, only `#f` is false. Everything else is treated as true in conditionals. This exists to simplify conditional logic, allowing empty lists, zero, and strings to act as true conditions without explicit comparison.
- **`if`** — A special form for two-branch branching. It exists to evaluate one of two expressions based on a test. It returns the value of the evaluated branch, because in functional programming, everything is an expression that yields a value.
- **`cond`** — A multi-branch conditional special form. It solves the problem of deep nesting of `if` expressions when checking multiple exclusive conditions, acting like a `switch` or `if-else-if` chain.
- **`when`** — A one-armed conditional macro for side effects. It exists to run code only when a condition is true, yielding no useful return value. It is meant for imperative effects like printing.
- **`and`** — A boolean operator macro. It evaluates expressions from left to right, stopping and returning `#f` at the first false, or returning the last truthy value.
- **`or`** — A boolean operator macro. It evaluates from left to right, stopping and returning the first truthy value, or `#f` if all are false.
- **`not`** — A boolean inversion function. It returns `#t` if given `#f`, and `#f` for any truthy value.
- **`define`** — The keyword for binding names to values or functions in the environment. It exists to give names to reusable logic.
- **`'()` (quote empty list)** — The syntax for constructing an empty list without evaluating it. 

**Objects and methods used**

**`<`, `>`, `<=`, `>=`**
- **What it is:** Numeric comparison primitives.
- **Implementation:** Built-in functions `(< x y)`, etc., returning `#t` or `#f`.
- **Its use:** Used to check boundaries in our classification and absolute value functions.
- **Type:** Built-in procedures.
- **Responsibility:** Evaluates the mathematical ordering of numbers.
- **Depends on:** Numeric arguments.
- **Connects to:** Conditionals like `if` and `cond` that branch on their result.
- **Shape:** Internal language primitives.

**`=`**
- **What it is:** Numeric equality primitive.
- **Implementation:** `(= x y)`, returning `#t` if numbers are mathematically equal.
- **Its use:** Used to check if numbers equal exact bounds, like zero.
- **Type:** Built-in procedure.
- **Responsibility:** Determines numeric equivalency.
- **Depends on:** Numeric arguments.
- **Connects to:** Branching constructs.
- **Shape:** Internal primitive.

**`equal?`**
- **What it is:** Structural equality predicate.
- **Implementation:** `(equal? a b)`
- **Its use:** Used to compare lists, strings, and other complex data for having the same contents.
- **Type:** Built-in procedure.
- **Responsibility:** Recursively checks if two values have the exact same structure and contents.
- **Depends on:** Any two values.
- **Connects to:** Used in tests requiring deep equivalence.
- **Shape:** Standard library predicate.

**`eq?`**
- **What it is:** Identity equality predicate.
- **Implementation:** `(eq? a b)`
- **Its use:** Used to check if two values are the exact same object in memory.
- **Type:** Built-in procedure.
- **Responsibility:** Pointer comparison.
- **Depends on:** Any two values.
- **Connects to:** High-performance identity checks, often on symbols.
- **Shape:** Standard library predicate.

**`display`**
- **What it is:** Output primitive.
- **Implementation:** `(display value)`
- **Its use:** Used to print the warning message in the `when` example.
- **Type:** Built-in procedure.
- **Responsibility:** Prints the human-readable representation of a value to standard output.
- **Depends on:** A value to print.
- **Connects to:** The standard output stream.
- **Shape:** Side-effecting I/O function.

**`newline`**
- **What it is:** Output primitive.
- **Implementation:** `(newline)`
- **Its use:** Used to print a line break after a warning message.
- **Type:** Built-in procedure.
- **Responsibility:** Advances standard output to the next line.
- **Depends on:** None.
- **Connects to:** The standard output stream.
- **Shape:** Side-effecting I/O function.

---

## Concept Unit: Booleans and Truthiness

### The Problem
To make decisions in code, we need a way to represent "yes" and "no", or "true" and "false". Furthermore, in a dynamically typed language, we need to know what happens if we ask "is 0 true?" or "is the empty string true?".

### Project Change
- **Reference Source:** None — this is a from-scratch addition.
- **Files affected:** `tests.rkt` (created)
- **Change type:** add
- **Location:** At the top of a new file.
- **Dependencies:** `#lang racket`

### The New Code
```scheme
#lang racket
(define is-ready #t)
(define is-finished #f)
```

### The Updated Project
```scheme
// ← new
#lang racket
(define is-ready #t)
(define is-finished #f)
```
This sets up a basic environment where we have two flags stored as boolean values.

### Isolated Lab
In the REPL, let's explore literal booleans and the truthiness rule.
```scheme
> #t
#t
> #f
#f
> (if 0 'yes 'no)
'yes
> (if '() 'yes 'no)
'yes
> (if #f 'yes 'no)
'no
```
This output proves that **`#t` and `#f`** are the primitive boolean values. It also proves the **truthiness rule**: Scheme evaluates `0` and `'()` as true. Only `#f` is treated as false. This design simplifies code because you rarely have to write `(if (not (eq? x #f)) ...)`; any valid non-false value acts as a "true" signal.

### Discarding the Lab
We discard these REPL tests. We will use the truthiness rule directly in upcoming functions.

### Mechanical Walkthrough
- `#t` is the literal boolean for true.
- `#f` is the literal boolean for false.
- `if` checks its first argument; if it is anything other than `#f`, it evaluates the second argument (`'yes`).
- Because Scheme treats `0` and `'()` as truthy, `if` yields `'yes`.

---

## Concept Unit: `if`

### The Problem
We need to run one piece of logic when a condition is true, and a different piece of logic when it is false. Moreover, we want the result of this decision to immediately be our return value, rather than needing to assign a temporary variable.

### Project Change
- **Reference Source:** None — from scratch.
- **Files affected:** `tests.rkt`
- **Change type:** add
- **Location:** Below our boolean variables.
- **Dependencies:** None.

### The New Code
```scheme
(define (abs-val x)
  (if (< x 0)
      (- x)
      x))
```

### The Updated Project
```scheme
#lang racket
(define is-ready #t)
(define is-finished #f)

// ← new
(define (abs-val x)
  (if (< x 0)
      (- x)
      x))
```
This is a fully working absolute value function that uses `if` as an expression to return a value directly.

### Isolated Lab
Let's see `if` evaluate directly in the REPL:
```scheme
> (if (> 5 3) 'bigger 'smaller)
'bigger
> (if (= 1 2) 'equal 'not-equal)
'not-equal
> (if #f 'yes)
```
*(The last expression returns void/unspecified).*

This proves that **`if`** is an expression evaluating to a single value. When we omit the alternative branch and the test is false, DrRacket returns a void/unspecified value. You should always supply both branches unless you genuinely mean "do nothing."

### Discarding the Lab
We discard these isolated expressions; our project uses `abs-val`.

### Mechanical Walkthrough
- `define` binds the name `abs-val` to a function taking `x`.
- `if` evaluates its first argument `(< x 0)`.
- `<` is a built-in comparison primitive that returns `#t` if `x` is strictly less than `0`.
- If true, `(- x)` evaluates (negating `x`) and becomes the return value of `if`.
- If false, `x` is evaluated and becomes the return value.
- Because `if` is the last expression in the function body, its value is returned by `abs-val`.

---

## Concept Unit: Comparison Predicates

### The Problem
We need to compare different types of data correctly. Checking if `5` equals `5` is mathematically clear, but checking if the list `'(1 2)` equals another `'(1 2)` requires a different tool.

### Project Change
- **Reference Source:** None.
- **Files affected:** `tests.rkt`
- **Change type:** add
- **Location:** Below `abs-val`.
- **Dependencies:** None.

### The New Code
```scheme
(define (same-lists? lst1 lst2)
  (equal? lst1 lst2))
```

### The Updated Project
```scheme
// ... previous code ...
(define (abs-val x)
  (if (< x 0)
      (- x)
      x))

// ← new
(define (same-lists? lst1 lst2)
  (equal? lst1 lst2))
```
We define a helper function to check list equality safely.

### Isolated Lab
```scheme
> (= 5 5)
#t
> (equal? '(1 2) '(1 2))
#t
> (eq? '(1 2) '(1 2))
#f
```
This proves that **`=`** is for numbers, **`equal?`** checks structural equality (contents match), and **`eq?`** checks object identity (same memory address). The two lists have identical contents but are distinct objects.

### Discarding the Lab
We discard the REPL checks.

### Mechanical Walkthrough
- `equal?` compares `lst1` and `lst2`.
- It recursively checks if their structure and atomic contents are exactly the same.
- It returns `#t` if they are, or `#f` if not.

---

## Concept Unit: `cond`

### The Problem
When testing a value against multiple exclusive conditions (like classifying a number as negative, zero, small, or large), chaining multiple `if` expressions creates deeply nested, hard-to-read code.

### Project Change
- **Reference Source:** None.
- **Files affected:** `tests.rkt`
- **Change type:** add
- **Location:** Below `same-lists?`.
- **Dependencies:** None.

### The New Code
```scheme
(define (classify-number n)
  (cond
    [(< n 0) 'negative]
    [(= n 0) 'zero]
    [(< n 10) 'small-positive]
    [else 'large-positive]))
```

### The Updated Project
```scheme
// ... previous code ...
(define (same-lists? lst1 lst2)
  (equal? lst1 lst2))

// ← new
(define (classify-number n)
  (cond
    [(< n 0) 'negative]
    [(= n 0) 'zero]
    [(< n 10) 'small-positive]
    [else 'large-positive]))
```
We introduce `classify-number`, which handles multi-way branching flatly without nested `if`s.

### Isolated Lab
```scheme
> (classify-number -3)
'negative
> (classify-number 0)
'zero
> (classify-number 7)
'small-positive
> (classify-number 100)
'large-positive
```
This proves that **`cond`** evaluates clauses top-to-bottom. It stops and returns the result of the first clause whose test evaluates to true. The `else` clause acts as a fallback if all previous tests are false. Square brackets are conventionally used in Racket for readability, though round parentheses also work.

### Discarding the Lab
We discard the manual REPL calls.

### Mechanical Walkthrough
- `cond` begins the conditional multi-branch form.
- `[(< n 0) 'negative]` is the first clause. It evaluates `(< n 0)`. If true, returns `'negative`.
- `[(= n 0) 'zero]` evaluates next if the first was false.
- `[(< n 10) 'small-positive]` triggers for positive numbers less than 10.
- `else` is a special keyword in `cond` that always evaluates as true, returning `'large-positive` as a fallback.

---

## Concept Unit: `when`

### The Problem
Sometimes we want to conditionally execute a side effect (like printing) and do nothing otherwise. Using `if` without an alternative branch is confusing and returns a void value.

### Project Change
- **Reference Source:** None.
- **Files affected:** `tests.rkt`
- **Change type:** add
- **Location:** Bottom of the file.
- **Dependencies:** None.

### The New Code
```scheme
(define (warn-if-negative x)
  (when (< x 0)
    (display "Warning: negative number")
    (newline)))
```

### The Updated Project
```scheme
// ... previous code ...
(define (classify-number n)
  (cond
    [(< n 0) 'negative]
    [(= n 0) 'zero]
    [(< n 10) 'small-positive]
    [else 'large-positive]))

// ← new
(define (warn-if-negative x)
  (when (< x 0)
    (display "Warning: negative number")
    (newline)))
```
This adds a function that performs side effects conditionally.

### Isolated Lab
```scheme
> (warn-if-negative -5)
Warning: negative number
> (warn-if-negative 3)
```
This proves that **`when`** runs its body only if the condition is true. It is a one-armed conditional designed explicitly for side effects (like printing), completely ignoring the lack of a "false" fallback.

### Discarding the Lab
We discard the REPL output.

### Mechanical Walkthrough
- `when` evaluates the test `(< x 0)`.
- If true, it evaluates all subsequent expressions in its body sequentially.
- `display` prints the warning text to standard output.
- `newline` prints a carriage return.
- `when` is technically a macro built on top of `if`.

---

## Concept Unit: Boolean Operators

### The Problem
We need to combine multiple conditions, like asking if a number is both greater than 0 and less than 10. Furthermore, we need to know what happens if we use non-boolean truthy values in these checks.

### Project Change
- **Reference Source:** None.
- **Files affected:** `tests.rkt`
- **Change type:** add
- **Location:** Bottom of file.
- **Dependencies:** None.

### The New Code
```scheme
(define (valid-small-number? x)
  (and (number? x) (> x 0) (< x 10)))
```

### The Updated Project
```scheme
// ... previous code ...
(define (warn-if-negative x)
  (when (< x 0)
    (display "Warning: negative number")
    (newline)))

// ← new
(define (valid-small-number? x)
  (and (number? x) (> x 0) (< x 10)))
```
This function logically combines multiple truth tests into one expression.

### Isolated Lab
```scheme
> (and 1 2 3)
3
> (and 1 #f 3)
#f
> (or #f #f 'found)
'found
> (not #f)
#t
> (not 5)
#f
```
This output proves that **`and`** and **`or`** in Scheme don't just return `#t` or `#f`. They return the actual values that satisfied them. `and` returns the last truthy value, or `#f` if it short-circuits. `or` returns the first truthy value, or `#f`. **`not`** forcefully inverts truthiness to strict `#t` or `#f`.

### Discarding the Lab
We discard the REPL experiments.

### Mechanical Walkthrough
- `and` evaluates its arguments left-to-right.
- `(number? x)` is checked first. If false, `and` stops and returns `#f`.
- `(> x 0)` is evaluated next.
- `(< x 10)` is evaluated last. If all are truthy, `and` returns the final evaluated result (in this case, the `#t` returned by the `<` primitive).

---

## Closing Exercises

**1. What breaks without this?**
If Scheme did not have the truthiness rule (i.e. only literal `#t` was true), how would you have to rewrite `(if '() 'empty 'full)`? You would be forced to use explicit type checking, such as `(if (equal? '() '()) 'empty 'full)` or `(if (not (eq? '() #f)) ...)`. Code dealing with lists and values would double in size due to explicit casts to boolean.

**2. Practice:**
Write a function `fizz-buzz` using `cond` that takes a number and returns `'fizzbuzz` if it's divisible by 15, `'fizz` if divisible by 3, `'buzz` if divisible by 5, and the number itself otherwise. Use the built-in `modulo` procedure.

*(End of Lesson 4)*
