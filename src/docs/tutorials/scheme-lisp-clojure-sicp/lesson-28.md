# Lesson 28: SICP Chapter 1 — Higher-Order Procedures

What you will build
The reader will work through SICP Section 1.3 — the pivotal section where SICP formally introduces higher-order procedures as the key abstraction mechanism. They will implement `sum` (a general summation abstraction), `integral` (numerical integration using sum), `fixed-point` (finding fixed points of functions), and see how these capture mathematical patterns as procedures. The transferable problems: (1) a higher-order procedure captures a computational pattern — it is an abstraction over processes, not just data; (2) `sum` and `integral` are examples of abstracting away the "how to iterate" from the "what to do at each step"; (3) `fixed-point` introduces the idea of iterative improvement — a pattern that recurs in optimization, machine learning, and numerical methods.

What you need to know first
- Lessons 0–27 (all prior concepts through the three mechanisms, substitution model, procedural abstraction, structural recursion, higher-order functions from Lesson 7 and 13).

Terms used in this lesson
- **Procedural abstraction** — the technique of hiding a complex process behind a named function so that the rest of the program can use it without knowing how it works. This solves the problem of repeating identical logic and allows us to separate what a program does from how it does it.
- **Higher-order procedure** — a procedure that takes other procedures as arguments or returns a procedure as a result. This exists to let us capture and abstract computational patterns (like "summing" or "iterating") rather than just abstracting data.
- **Iterative improvement** — a mathematical and computational pattern where we start with a guess, apply a function to get a better guess, and repeat until the guess is close enough to the true answer. It solves the problem of finding solutions to equations that cannot be solved algebraically.
- **Lambda expression** — a way to create anonymous (unnamed) procedures inline. It solves the problem of needing to define a trivial, one-off helper function with `define` when we only need to pass it immediately as an argument to a higher-order procedure.
- **Fixed point** — a value x for a function f such that f(x) = x. Finding fixed points is a generalized way to solve many numerical problems, such as finding roots or square roots.

Objects and methods used
- **`sum`**
  - *What it is:* A general summation abstraction that captures the pattern of adding up a sequence of terms.
  - *Implementation:* `(define (sum term a next b) ...)`
  - *Its use:* We use it to compute the sum of integers, sum of cubes, and pi approximation without rewriting the iteration logic.
  - *Type:* A recursive function (higher-order procedure).
  - *Responsibility:* To accumulate a sum by applying a `term` function to the current index, adding it to the recursive result of the next index, until the upper bound is exceeded.
  - *Depends on:* A `term` procedure, a lower bound `a`, a `next` procedure to advance the index, and an upper bound `b`.
  - *Connects to:* Calls `term` and `next`, and calls itself recursively. Called by `sum-integers`, `sum-cubes`, etc.
  - *Shape:* A core mathematical utility in our library.
- **`integral`**
  - *What it is:* A numerical integration procedure using the summation abstraction.
  - *Implementation:* `(define (integral f a b dx) ...)`
  - *Its use:* We use it to find the definite integral of a function `f` between `a` and `b` by summing the areas of small rectangles of width `dx`.
  - *Type:* A mathematical function (higher-order procedure).
  - *Responsibility:* To approximate an integral by setting up the correct `term` and `next` functions and delegating the accumulation to `sum`.
  - *Depends on:* A function `f` to integrate, lower bound `a`, upper bound `b`, and a small step size `dx`.
  - *Connects to:* Calls `sum` to perform the actual iteration. Called by top-level user code.
  - *Shape:* An application-level math utility.
- **`fixed-point`**
  - *What it is:* A procedure that finds the fixed point of a given function `f`.
  - *Implementation:* `(define (fixed-point f first-guess) ...)`
  - *Its use:* We use it to find values where f(x) = x, which is used directly to compute square roots.
  - *Type:* A recursive iterative-improvement function (higher-order procedure).
  - *Responsibility:* To repeatedly apply `f` to a `guess` until the difference between the current guess and the next guess is within a specified tolerance.
  - *Depends on:* A function `f` and an initial `first-guess`.
  - *Connects to:* Calls `f` and a local `close-enough?` helper. Calls its internal `try` loop.
  - *Shape:* A core iterative solver utility.
- **`average-damp`**
  - *What it is:* A procedure that takes a function and returns a new function whose output is the average of its input and the original function's output.
  - *Implementation:* `(define (average-damp f) (lambda (x) (average x (f x))))`
  - *Its use:* We use it to prevent oscillations in the `fixed-point` search for square roots.
  - *Type:* A function that returns a function (higher-order procedure).
  - *Responsibility:* To stabilize iterative processes by smoothing out large jumps between guesses.
  - *Depends on:* A target function `f`.
  - *Connects to:* Returns a `lambda` that calls an `average` helper and `f`. Called by `sqrt-clean`.
  - *Shape:* A process-modifying decorator utility.


## Concept Unit: The summation pattern

### The Problem
When computing the sum of integers from `a` to `b`, the sum of cubes from `a` to `b`, or the sum of terms in a series converging to pi, the underlying iteration is identical. Writing a new recursive function for each of these involves duplicating the exact same branching and accumulation logic, varying only the operation applied to the term and how to find the next term. We need a way to abstract the *process* of summing, not just the data.

### Introduce the concept in isolation
Before we build the general `sum` procedure for our project, let's look at how we can pass procedures as arguments. We will use a throwaway example to demonstrate a **higher-order procedure**: a function that accepts another function as an input.

```scheme
#lang racket

(define (apply-twice f x)
  (f (f x)))

(define (add-one x) (+ x 1))

(apply-twice add-one 5)
```

**Output:**
```
7
```

This output proves that `apply-twice` successfully received the `add-one` procedure and applied it two consecutive times to the value `5` (first yielding 6, then 7). The procedure `f` is a parameter just like `x`.

### Discard the throwaway example
We have seen how procedures can be passed as arguments. We will now delete `apply-twice` and `add-one`; they will not appear in our project.

### Project Change
- **Reference Source:** SICP Section 1.3.1
- **Files affected:** `sicp-math.rkt` (created)
- **Change type:** Add
- **Location:** A brand-new file for our SICP chapter 1 math utilities.
- **Dependencies:** None.

### The New Code
```scheme
#lang racket

(define (sum term a next b)
  (if (> a b)
      0
      (+ (term a)
         (sum term (next a) next b))))

; Sum of integers:
(define (sum-integers a b)
  (sum (lambda (x) x) a (lambda (x) (+ x 1)) b))

; Sum of cubes:
(define (cube x) (* x x x))
(define (sum-cubes a b)
  (sum cube a (lambda (x) (+ x 1)) b))

; Pi approximation (Leibniz series: pi/8 = 1/1*3 + 1/5*7 + 1/9*11 + ...):
(define (pi-sum a b)
  (sum (lambda (x) (/ 1.0 (* x (+ x 2))))
       a
       (lambda (x) (+ x 4))
       b))
```

### The Updated Project
Because this is a brand-new file, the new code shown above represents the entire contents of `sicp-math.rkt`. It establishes our core summation utility and three specific application functions that rely on it.

### Mechanical walkthrough
- **`sum`** is a higher-order procedure. It takes four arguments: `term` (a procedure), `a` (the current index), `next` (a procedure to get the next index), and `b` (the upper bound).
- **`(if (> a b) 0 ...)`** checks if our lower bound has exceeded our upper bound. If it has, the sum of an empty sequence is 0.
- **`(+ (term a) (sum term (next a) next b))`** computes the value of the current term by applying the `term` procedure to `a`, and adds it to the recursive call to `sum`. The recursive call uses `(next a)` to advance the index.
- **`(lambda (x) x)`** in `sum-integers` is a **lambda expression** that creates an anonymous identity procedure. It takes `x` and returns `x`.
- **`(lambda (x) (+ x 1))`** in `sum-integers` is an anonymous procedure that adds 1 to its argument, serving as our `next` function to move to the next integer.
- **`(sum cube a (lambda (x) (+ x 1)) b)`** in `sum-cubes` passes the named procedure `cube` directly as the `term` argument.
- **`(/ 1.0 (* x (+ x 2)))`** in `pi-sum` computes the specific term for the Leibniz series. By using `1.0`, we force Racket to use floating-point arithmetic instead of exact rational fractions.

Here is the execution trace for `(sum-integers 1 4)`:
```
Call: (sum-integers 1 4)
Expands to: (sum identity 1 add-1 4)
Step 1: a=1, b=4. 1 <= 4, so (+ (identity 1) (sum identity 2 add-1 4)) -> (+ 1 (sum ...))
Step 2: a=2, b=4. 2 <= 4, so (+ (identity 2) (sum identity 3 add-1 4)) -> (+ 2 (sum ...))
Step 3: a=3, b=4. 3 <= 4, so (+ (identity 3) (sum identity 4 add-1 4)) -> (+ 3 (sum ...))
Step 4: a=4, b=4. 4 <= 4, so (+ (identity 4) (sum identity 5 add-1 4)) -> (+ 4 (sum ...))
Step 5: a=5, b=4. 5 > 4, so returns 0.
Unwinding: (+ 4 0) = 4
Unwinding: (+ 3 4) = 7
Unwinding: (+ 2 7) = 9
Unwinding: (+ 1 9) = 10
```
Abstracting the summation pattern means you can add a new kind of sum without rewriting the iteration logic. The process of accumulating a sum is solved once in `sum`.


## Concept Unit: Using sum to implement numerical integration

### The Problem
We want to compute the definite integral of a function between two bounds `a` and `b`. The integral can be approximated by summing the areas of many thin rectangles under the curve. We already have a machine that sums things (`sum`), but we need to map the mathematical definition of integration onto the parameters `sum` expects.

### Introduce the concept in isolation
Before integrating, let's prove that we can use local `define` statements inside another function to create closed-over helper procedures. This will be necessary to define our step function.

```scheme
#lang racket

(define (make-adder-and-apply x)
  (define (add-two y) (+ y 2))
  (add-two x))

(make-adder-and-apply 10)
```

**Output:**
```
12
```

This output proves that `add-two` is successfully defined locally within `make-adder-and-apply` and applied to `x`. This is called **block structure** and lets us hide helper procedures.

### Discard the throwaway example
We will delete `make-adder-and-apply`; it is not part of our math library.

### Project Change
- **Reference Source:** SICP Section 1.3.1
- **Files affected:** `sicp-math.rkt` (modified)
- **Change type:** Add
- **Location:** Below the `pi-sum` definition.
- **Dependencies:** The `sum` function defined earlier.

### The New Code
```scheme
(define (integral f a b dx)
  (define (add-dx x) (+ x dx))
  (* (sum f (+ a (/ dx 2.0)) add-dx b)
     dx))
```

### The Updated Project
```scheme
; ... unchanged from pi-sum above

// ← new
(define (integral f a b dx)
  (define (add-dx x) (+ x dx))
  (* (sum f (+ a (/ dx 2.0)) add-dx b)
     dx))
```
The file now contains `integral`, which uses our existing `sum` utility to approximate the area under a curve `f` between `a` and `b`.

### Mechanical walkthrough
- **`integral`** takes a function `f`, a start `a`, an end `b`, and a rectangle width `dx`.
- **`(define (add-dx x) (+ x dx))`** creates a local helper procedure that adds `dx` to its input. This acts as the `next` procedure for `sum`. It captures the `dx` variable from the enclosing scope.
- **`(+ a (/ dx 2.0))`** computes the initial starting point for our rectangles. We start at `a + dx/2` to sample the function at the midpoint of each rectangle.
- **`(sum f ... add-dx b)`** delegates the accumulation of the function heights to our generalized `sum` procedure. `f` acts as the `term` procedure.
- **`(* ... dx)`** takes the total sum of the heights returned by `sum` and multiplies it by the constant width `dx` to get the total area.

If we run `(integral cube 0 1 0.01)`, it evaluates to `0.24998750000000042` (the exact integral is 0.25). The smaller `dx`, the better the approximation. `integral` is exactly `sum` with a specific choice of term function and step size.


## Concept Unit: Procedures as returned values — fixed-point

### The Problem
Many computations can be framed as finding the fixed point of a function. A fixed point is a value x where f(x) = x. We want to find this value by guessing a number, applying the function to it, and repeating this process with the new result until the answer stops changing. We need an abstract procedure that captures this pattern of **iterative improvement**.

### Introduce the concept in isolation
Before building `fixed-point`, let's verify how we can use a recursive loop with a `let` binding to continuously update a value until a condition is met.

```scheme
#lang racket

(define (countdown-until-small start)
  (define (try current)
    (let ([next (/ current 2.0)])
      (if (< next 1.0)
          next
          (try next))))
  (try start))

(countdown-until-small 10.0)
```

**Output:**
```
0.625
```

This output proves that `try` successfully recurses, halving the value each time, until the value drops below 1.0. 10.0 -> 5.0 -> 2.5 -> 1.25 -> 0.625.

### Discard the throwaway example
We will delete `countdown-until-small`; it was just a demonstration of internal iterative looping.

### Project Change
- **Reference Source:** SICP Section 1.3.3
- **Files affected:** `sicp-math.rkt` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```scheme
(define tolerance 0.00001)

(define (fixed-point f first-guess)
  (define (close-enough? v1 v2)
    (< (abs (- v1 v2)) tolerance))
  (define (try guess)
    (let ([next (f guess)])
      (if (close-enough? guess next)
          next
          (try next))))
  (try first-guess))
```

### The Updated Project
```scheme
; ... unchanged from integral above

// ← new
(define tolerance 0.00001)

(define (fixed-point f first-guess)
  (define (close-enough? v1 v2)
    (< (abs (- v1 v2)) tolerance))
  (define (try guess)
    (let ([next (f guess)])
      (if (close-enough? guess next)
          next
          (try next))))
  (try first-guess))
```
We added a global `tolerance` constant and the `fixed-point` solver.

### Mechanical walkthrough
- **`tolerance`** is a constant set to `0.00001`, determining how close two successive guesses must be to be considered equal.
- **`fixed-point`** is a higher-order procedure that accepts a function `f` and a starting value `first-guess`.
- **`close-enough?`** is a local helper that checks if the absolute difference between `v1` and `v2` is strictly less than `tolerance`.
- **`try`** is a local recursive function that represents the iterative improvement loop.
- **`(let ([next (f guess)]) ...)`** binds the result of applying `f` to the current `guess` to the local variable `next`.
- **`(if (close-enough? guess next) next (try next))`** is the termination condition. If the guess hasn't changed meaningfully, we found our fixed point and return `next`. Otherwise, we recursively call `try` using `next` as the new guess.

Execution trace for the first 4 iterations of `(fixed-point cos 1.0)`:
```
Call: (fixed-point cos 1.0)
Iter 1: guess = 1.0. next = (cos 1.0) = 0.540302. close-enough? is false. Call (try 0.540302).
Iter 2: guess = 0.540302. next = (cos 0.540302) = 0.857553. close-enough? is false. Call (try 0.857553).
Iter 3: guess = 0.857553. next = (cos 0.857553) = 0.654289. close-enough? is false. Call (try 0.654289).
Iter 4: guess = 0.654289. next = (cos 0.654289) = 0.793480. close-enough? is false. Call (try 0.793480).
```
This is an iterative improvement pattern — start with a guess, apply f to get a better guess, repeat until close enough.


## Concept Unit: sqrt via fixed-point

### The Problem
We want to compute the square root of `x`. The square root of `x` is the value `y` such that `y = x/y`. This means finding the square root of `x` is exactly the same as finding the fixed point of the function `y -> x/y`. However, simply passing this function to `fixed-point` results in an endless oscillation between two guesses.

### Introduce the concept in isolation
Let's look at the oscillation problem by writing a naive square root function that attempts to use the un-damped fixed point. We won't actually run this in a way that loops forever, but we will trace the math.

```scheme
#lang racket
(define (naive-f x y)
  (/ x y))

(naive-f 4.0 1.0)
(naive-f 4.0 4.0)
(naive-f 4.0 1.0)
```

**Output:**
```
4.0
1.0
4.0
```

This output proves the oscillation. For `x=4`, if our guess `y` is 1, `x/y` is 4. If we use 4 as our next guess, `x/y` is 1. It endlessly bounces between 1 and 4 and never converges.

### Discard the throwaway example
We will delete `naive-f`. We need a mathematical fix to prevent this bouncing.

### Project Change
- **Reference Source:** SICP Section 1.3.3
- **Files affected:** `sicp-math.rkt` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** `fixed-point` and `average`.

### The New Code
```scheme
(define (average x y) (/ (+ x y) 2.0))

(define (sqrt-damped x)
  (fixed-point (lambda (y) (average y (/ x y))) 1.0))
```

### The Updated Project
```scheme
; ... unchanged from fixed-point above

// ← new
(define (average x y) (/ (+ x y) 2.0))

(define (sqrt-damped x)
  (fixed-point (lambda (y) (average y (/ x y))) 1.0))
```
We added an `average` helper and a `sqrt-damped` procedure that successfully calculates square roots by preventing oscillation.

### Mechanical walkthrough
- **`average`** is a simple helper function that takes two numbers and returns their arithmetic mean.
- **`sqrt-damped`** takes a number `x` for which we want to find the square root.
- **`(lambda (y) (average y (/ x y)))`** is the new function we pass to `fixed-point`. Instead of guessing `x/y` next, we guess the *average* of `y` and `x/y`.
- **`1.0`** is passed as the `first-guess` to start the fixed-point search.

Without damping, `y -> x/y` bounces between `y` and `x/y` endlessly. Average damping takes the midpoint, which forces the successive guesses to converge towards the true root. This is the same Newton's method from Lesson 27, now derived elegantly from `fixed-point`.


## Concept Unit: average-damp as a procedure that returns a procedure

### The Problem
The technique of average damping (taking a function and modifying it so it returns the average of its input and its original output) is broadly useful for stabilizing many different fixed-point searches. Right now, the average logic is hardcoded inside the lambda inside `sqrt-damped`. We want to abstract the *damping process itself*.

### Introduce the concept in isolation
Before applying this to our project, let's look at how a procedure can return another procedure.

```scheme
#lang racket

(define (make-multiplier factor)
  (lambda (x) (* x factor)))

(define times-ten (make-multiplier 10))
(times-ten 5)
```

**Output:**
```
50
```

This output proves that `make-multiplier` successfully returned a brand-new function (via `lambda`) that remembered the `factor` of 10. We then bound that returned function to `times-ten` and called it.

### Discard the throwaway example
We will discard `make-multiplier`. We will use this exact technique to create `average-damp`.

### Project Change
- **Reference Source:** SICP Section 1.3.3
- **Files affected:** `sicp-math.rkt` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** `fixed-point` and `average`.

### The New Code
```scheme
(define (average-damp f)
  (lambda (x) (average x (f x))))

(define (sqrt-clean x)
  (fixed-point (average-damp (lambda (y) (/ x y))) 1.0))
```

### The Updated Project
```scheme
; ... unchanged from sqrt-damped above

// ← new
(define (average-damp f)
  (lambda (x) (average x (f x))))

(define (sqrt-clean x)
  (fixed-point (average-damp (lambda (y) (/ x y))) 1.0))
```
We extracted `average-damp` into its own higher-order procedure, making `sqrt-clean` incredibly declarative.

### Mechanical walkthrough
- **`average-damp`** takes a single argument `f`, which is a procedure.
- **`(lambda (x) (average x (f x)))`** is the return value of `average-damp`. It evaluates to a new procedure that takes a value `x`, applies the original function `f` to it, and averages `x` and `(f x)`.
- **`sqrt-clean`** takes a number `x`.
- **`(lambda (y) (/ x y))`** is the naive, oscillating square root function.
- **`(average-damp ...)`** wraps the naive function, returning the stabilized, damped version.
- **`fixed-point`** receives this brand-new damped function and runs its standard iterative improvement loop starting at `1.0`.

`average-damp` makes the damping reusable — it can be applied to any fixed-point computation that needs it. This is function composition at the level of iterative processes.

Closing: SICP 1.3 is the formal statement of the lesson from Module 1 Lesson 7 (higher-order functions). SICP's contribution is showing that higher-order procedures capture MATHEMATICAL abstractions — summation, integration, fixed-point iteration — not just code patterns. You can explore this further by considering exercises including SICP Exercise 1.34 (what happens when you apply `(lambda (f) (f f))` to itself?) and implementing `cube-root` using `fixed-point` and `average-damp`.
