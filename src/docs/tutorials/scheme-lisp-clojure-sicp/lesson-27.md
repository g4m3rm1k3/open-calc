# Lesson 27: SICP Chapter 1 — The Elements of Programming

What you will build
The reader will build a foundational math utilities library (`math-utils.rkt`) while working through the foundational ideas of SICP Chapter 1. The transferable problems this lesson solves are: (1) every language provides the same three mechanisms — recognizing them makes you a language-independent thinker; (2) the substitution model is a mental tool for tracing how any expression evaluates step by step; (3) SICP's definition of a procedure as a description of a process — not a sequence of steps — is the core of the functional mindset.

What you need to know first
- Lessons 0–26 (specifically Scheme syntax, structural recursion, higher-order functions, closures, continuations, macros, streams, and miniKanren).

Terms used in this lesson
- **Primitive expression** — the simplest entities a language provides built-in (like numbers or fundamental operators). They exist so that there is a foundation of irreducible facts to build programs out of.
- **Means of combination** — the rules a language provides for putting simpler expressions together to form compound ones. They exist because programs are built by nesting operations, not just listing atoms.
- **Means of abstraction** — the mechanisms a language provides to give a name to a compound element and treat it as a unit. They exist to let human minds manage complexity by hiding details behind a name.
- **Substitution model** — a mental framework for evaluating code where function calls are resolved by replacing parameters with arguments in the body. It exists as a simplified tool for reasoning about pure functions without needing to model memory or environment mappings.
- **Applicative order** — an evaluation strategy where arguments are evaluated before the function is applied. It exists to avoid re-evaluating complex arguments multiple times inside the function body.
- **Normal order** — an evaluation strategy where arguments are not evaluated until their values are actually needed by the execution path. It exists to allow infinite streams and conditional control flow without crashing or looping forever on unused branches.
- **Procedural abstraction** — the principle of treating a function as a black box that maps inputs to outputs, completely hiding its internal implementation. It exists to decouple the "what" from the "how," allowing implementations to change without breaking callers.
- **Block structure** — the nesting of definitions inside other definitions. It exists to restrict the visibility of helper functions and local variables to only the places that need them, preventing global namespace pollution.
- **Lexical scope** — the property where a function can "see" the variables in the scope where it was defined, rather than where it was called. It exists to make the behavior of functions predictable by looking at the source code structure.
- **Closure** — a function bundled with the environment (the variables in scope) where it was defined. It exists to allow functions to carry state and context with them when they are passed around as values.
- **Pure function** — a function whose return value is determined strictly by its inputs, with no side effects. It exists to make code perfectly predictable and mathematically sound.

Objects and methods used
- **`define`**
  - *What it is:* A special form for binding names to values or expressions.
  - *Implementation:* `(define name value)` or `(define (name args...) body...)`
  - *Its use:* We use it to bind our compound operations to names, demonstrating abstraction.
  - *Type:* Special form / Keyword.
  - *Responsibility:* Binds an identifier to a value in the current lexical environment namespace.
  - *Depends on:* An identifier and an expression to evaluate.
  - *Connects to:* Called by the top-level program or an enclosing block; modifies the environment for subsequent expressions.
  - *Shape:* A fundamental structural boundary of the language.
- **`+`, `*`, `/`, `-`, `<`, `=`, `abs`**
  - *What it is:* Built-in mathematical and comparison procedures.
  - *Implementation:* Variadic functions that take numbers and return numbers (or booleans).
  - *Its use:* We use them as our primitive expressions to build combinations.
  - *Type:* Primitive procedure.
  - *Responsibility:* Performs basic arithmetic and logic at the hardware/runtime level.
  - *Depends on:* Numeric or comparable arguments.
  - *Connects to:* Called by combinations in our code; returns computed values.
  - *Shape:* The absolute bottom layer of the language's computation stack.
- **`if`**
  - *What it is:* A conditional special form.
  - *Implementation:* `(if predicate consequent alternate)`
  - *Its use:* We use it to control recursive branching in our `sqrt-iter` loop.
  - *Type:* Special form / Keyword.
  - *Responsibility:* Evaluates exactly one of two branches based on a boolean condition.
  - *Depends on:* A predicate expression and two branch expressions.
  - *Connects to:* Evaluates the predicate, then hands control to either the consequent or alternate.
  - *Shape:* A control-flow boundary.

Everything else in the file, not this lesson's subject but still explained.
- (None. All built-ins used are central to demonstrating the ideas.)

## Concept Unit: The Three Mechanisms

### The Problem
Any programming language must provide ways to represent simple things, combine them, and name them for reuse. Without a shared vocabulary for these mechanisms, we cannot discuss what makes a language powerful or compare Scheme to other languages.

### Isolate the Concept
We will demonstrate the three mechanisms in the DrRacket REPL.

```scheme
; Primitive expressions
42
+

; Means of combination
(+ 1 2)
(* 3 (+ 1 2))

; Means of abstraction
(define pi 3.14159)
(define (circle-area r) (* pi r r))
(circle-area 5)
```

Running this yields:
```
42
#<procedure:+>
3
9
78.53975
```
This output proves that DrRacket resolves primitives to their self-evaluating values or procedure references, combinations evaluate to the computed result of the nested expressions, and abstractions bind values so they can be reused by name (as seen when `circle-area` correctly computes the area using `pi`). The final line evaluates a compound combination. These three tools form the basis of all programming.

### Discard the throwaway example
The REPL demonstration is discarded. It will not appear in the project.

### Project Change
- **Reference Source:** SICP Section 1.1.1 through 1.1.4.
- **Files affected:** `math-utils.rkt` (created).
- **Change type:** Add.
- **Location:** Top of the new file.
- **Dependencies:** DrRacket installed.

### The New Code
```scheme
#lang racket

(define pi 3.14159)

(define (circle-area r)
  (* pi (* r r)))
```

### The Updated Project
```scheme
#lang racket
// ← new
(define pi 3.14159)

(define (circle-area r)
  (* pi (* r r)))
```
This establishes a new module with a numeric constant and a named function that computes the area of a circle.

### Mechanical Walkthrough
1. `#lang racket` declares the language dialect. It is required by DrRacket to know how to parse the file.
2. `(define pi 3.14159)` uses the `define` special form to bind the identifier `pi` to the primitive numeric value `3.14159`. This is a means of abstraction.
3. `(define (circle-area r) ...)` binds a procedure that takes one argument `r` to the name `circle-area`.
4. `(* pi (* r r))` is a combination. The inner combination `(* r r)` evaluates first, multiplying `r` by itself. The outer combination multiplies `pi` by the result.

### CS Lens
These three mechanisms (primitives, combination, abstraction) form the absolute baseline for Turing completeness in a high-level language.
Also recognized in: SQL (literals, expressions, views), HTML/CSS (tags, nesting, classes), bash (commands, pipes, functions).

### SE Lens
Languages are engineered with abstraction mechanisms because the human brain can only hold about seven items in working memory. By giving a complex expression a name (`circle-area`), we hide the detail of *how* the area is computed, allowing the developer to think entirely in terms of the domain ("I need the circle's area") instead of the math. The tradeoff is that abstraction requires maintaining a mental mapping of names to implementations when debugging.

### Commands Needed
None right now; we just created a file.

### Run It
(Not executed standalone yet; we will add more features).

### Connecting to What's Next
Now that we have defined a function using the three mechanisms, we need to understand exactly how the language evaluates it when it is called.

## Concept Unit: The Substitution Model

### The Problem
We need a mental tool for tracing how any expression evaluates step by step. When code becomes deeply nested, trying to guess the result by reading it top-to-bottom fails. We need a rigorous, mechanical way to resolve function calls.

### Isolate the Concept
We will trace a manual expansion of the `circle-area` function in the REPL.

```scheme
(define pi 3.14159)
(define (circle-area r) (* pi (* r r)))

(circle-area 5)
(* pi (* 5 5))
(* 3.14159 (* 5 5))
(* 3.14159 25)
```

Running these lines one by one yields:
```
78.53975
78.53975
78.53975
78.53975
```
This output proves that replacing the function call with its body, substituting the arguments for the parameters, and reducing the primitive expressions step by step yields the exact same result at every stage. This is called the **substitution model** of evaluation.

### Discard the throwaway example
The explicit substitution trace is a mental exercise and is discarded; it is not code we will save.

### Project Change
- **Reference Source:** SICP Section 1.1.5.
- **Files affected:** `math-utils.rkt`.
- **Change type:** Add.
- **Location:** Below `circle-area`.
- **Dependencies:** None.

### The New Code
```scheme
(define (cylinder-volume r h)
  (* (circle-area r) h))
```

### The Updated Project
```scheme
#lang racket

(define pi 3.14159)

(define (circle-area r)
  (* pi (* r r)))

// ← new
(define (cylinder-volume r h)
  (* (circle-area r) h))
```
This adds a new function that builds on the previous abstraction to compute a cylinder's volume.

### Mechanical Walkthrough
1. `(define (cylinder-volume r h) ...)` binds a procedure that takes two arguments, `r` and `h`.
2. `(* (circle-area r) h)` is a combination. To evaluate it using the substitution model: substitute `r` and `h` with actual values, then expand `circle-area` by replacing its formal parameter with the substituted `r`, then evaluate the primitive `*`.

### CS Lens
The substitution model is a mental framework for evaluating pure functions (functions with no side effects). 
Also recognized in: Lambda calculus (beta reduction), mathematical proofs, pure functional languages like Haskell.

### SE Lens
We teach the substitution model because it enables formal reasoning about code. If a function is pure, you can safely replace a call to it with its returned value anywhere in the codebase without altering program behavior (referential transparency). The alternative is tracking mutable state and side effects in a complex environment model, which makes tracing bugs significantly harder.

### Commands Needed
None.

### Run It
(We will run tests in the final project.)

### Connecting to What's Next
The substitution model assumes arguments are evaluated before substituting them into the body. Does a language have to work that way?

## Concept Unit: Applicative vs Normal Order

### The Problem
When a combination is evaluated, when should the arguments be reduced? If a function ignores one of its arguments, evaluating that argument unnecessarily might waste time or crash the program. We need to distinguish between evaluating arguments eagerly versus lazily.

### Isolate the Concept
We will define a function that ignores its argument and pass it a crashing expression.

```scheme
(define (ignore-arg x) 42)
(ignore-arg (/ 1 0))
```

Running this yields:
```
/: division by zero
```
This output proves that Scheme evaluates the argument `(/ 1 0)` *before* passing it to `ignore-arg`. This strategy is called **applicative order**. If the language had waited to evaluate the argument until it was actually used (which is never, since `ignore-arg` just returns `42`), the program would not have crashed; that hypothetical strategy is called **normal order**.

### Discard the throwaway example
The crashing code is discarded and will not appear in the project.

### Project Change
- **Reference Source:** SICP Section 1.1.5.
- **Files affected:** `math-utils.rkt`.
- **Change type:** Add.
- **Location:** Below `cylinder-volume`.
- **Dependencies:** None.

### The New Code
```scheme
(define (test x y)
  (if (= x 0)
      0
      y))
```

### The Updated Project
```scheme
#lang racket

(define pi 3.14159)

(define (circle-area r)
  (* pi (* r r)))

(define (cylinder-volume r h)
  (* (circle-area r) h))

// ← new
(define (test x y)
  (if (= x 0)
      0
      y))
```
This adds a function that conditionally ignores its second argument, demonstrating evaluation order behavior in actual code.

### Mechanical Walkthrough
1. `(define (test x y) ...)` binds a two-argument procedure.
2. `(if (= x 0) ...)` evaluates the predicate. `if` is a special form that does *not* use standard applicative order for its branches; it evaluates the condition, and then conditionally evaluates only the chosen branch.
3. However, if you call `(test 0 (/ 1 0))`, Scheme still crashes, because the *arguments* to `test` are evaluated using applicative order before the function body (and the `if` inside it) is even entered.

### CS Lens
Applicative order evaluates arguments first, mapping to call-by-value evaluation. Normal order delays evaluation, mapping to call-by-name or call-by-need (lazy evaluation).
Also recognized in: Haskell (lazy/normal order by default), Python generators, logical `&&` short-circuiting in C.

### SE Lens
Scheme uses applicative order because it is more efficient for typical programs—an argument used multiple times inside a function is only evaluated once. Normal order avoids evaluating unused arguments, but can lead to repeated work if a delayed argument is used repeatedly. The tradeoff is efficiency versus the ability to handle infinite data structures safely.

### Commands Needed
None.

### Run It
(Tested implicitly in the concept isolation step.)

### Connecting to What's Next
Now that we understand how functions are evaluated, we can define more complex processes that hide their internal workings entirely.

## Concept Unit: Procedural Abstraction

### The Problem
A complex mathematical operation like finding a square root requires a multi-step iterative process. If we expose every internal step to the caller, we pollute the namespace and force the caller to understand the algorithm. We need a way to treat a complex procedure as a black box.

### Isolate the Concept
We will write a single square root function using Newton's method that internally defines its helper functions.

```scheme
(define (my-sqrt x)
  (define (good-enough? guess)
    (< (abs (- (* guess guess) x)) 0.001))
  (define (improve guess)
    (/ (+ guess (/ x guess)) 2.0))
  (define (sqrt-iter guess)
    (if (good-enough? guess)
        guess
        (sqrt-iter (improve guess))))
  (sqrt-iter 1.0))

(my-sqrt 2.0)
```

Running this yields:
```
1.4142156862745097
```
This output proves that the caller simply asks for `(my-sqrt 2.0)` and receives the result, without ever knowing that `good-enough?`, `improve`, or `sqrt-iter` were used. This hiding of the "how" behind an interface of "what" is called **procedural abstraction**.

### Discard the throwaway example
We will keep a version of this in the project, so the standalone REPL demonstration is discarded.

### Project Change
- **Reference Source:** SICP Section 1.1.8.
- **Files affected:** `math-utils.rkt`.
- **Change type:** Add.
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```scheme
(define (my-sqrt x)
  (define (good-enough? guess)
    (< (abs (- (* guess guess) x)) 0.001))
  (define (improve guess)
    (/ (+ guess (/ x guess)) 2.0))
  (define (sqrt-iter guess)
    (if (good-enough? guess)
        guess
        (sqrt-iter (improve guess))))
  (sqrt-iter 1.0))
```

### The Updated Project
```scheme
#lang racket

(define pi 3.14159)

(define (circle-area r)
  (* pi (* r r)))

(define (cylinder-volume r h)
  (* (circle-area r) h))

(define (test x y)
  (if (= x 0) 0 y))

// ← new
(define (my-sqrt x)
  (define (good-enough? guess)
    (< (abs (- (* guess guess) x)) 0.001))
  (define (improve guess)
    (/ (+ guess (/ x guess)) 2.0))
  (define (sqrt-iter guess)
    (if (good-enough? guess)
        guess
        (sqrt-iter (improve guess))))
  (sqrt-iter 1.0))
```
This adds an iterative algorithm for computing square roots, fully encapsulated inside a single function.

### Mechanical Walkthrough
1. `(define (my-sqrt x) ...)` declares the main function taking `x`.
2. `(define (good-enough? guess) ...)` is an internal definition. It checks if the square of the guess is within `0.001` of `x`. Because it is defined inside `my-sqrt`, it has access to the variable `x` from the outer scope without needing `x` passed as an explicit argument.
3. `(define (improve guess) ...)` averages the guess with `x / guess`.
4. `(define (sqrt-iter guess) ...)` is the recursive loop.
5. `(if (good-enough? guess) ...)` uses the `if` special form to either return the final guess or recursively call itself with an improved guess.
6. `(sqrt-iter 1.0)` kicks off the process with an initial guess of 1.0.

Because `sqrt-iter` contains a recursive call, we provide an execution trace for `(my-sqrt 2.0)`:
```
Iteration 1: guess = 1.0, good-enough? returns #f, calls improve
Iteration 2: guess 1.0 → 1.5, good-enough? returns #f, calls improve
Iteration 3: guess 1.5 → 1.41666, good-enough? returns #f, calls improve
Iteration 4: guess 1.41666 → 1.41421, good-enough? returns #t, loop terminates
```
On iteration 1, `1.0 * 1.0 = 1.0`, which is far from 2.0, so the `if` evaluates the alternate branch because the condition is false. On iteration 4, `1.41421` squared is within `0.001` of `2.0`, so the `if` evaluates the consequent branch, terminating the recursion and returning the guess.

### CS Lens
Procedural abstraction treats processes as mathematical functions. A caller does not care if the square root is found via Newton's method, Taylor series, or a hardware instruction.
Also recognized in: POSIX system calls, REST APIs, OOP Interfaces, microservices architectures.

### SE Lens
We engineer functions this way to enforce a clear boundary between the user and the implementer. The alternative is putting all helper functions in the global scope, making them accessible to callers who might rely on them. If a caller relies on `good-enough?`, we can never change our internal algorithm without breaking their code. Procedural abstraction prevents this tight coupling.

### Commands Needed
None.

### Run It
(We will run everything in the closing).

### Connecting to What's Next
The fact that `good-enough?` can see `x` without it being passed as an argument relies on a specific scoping rule built into the language.

## Concept Unit: Block Structure and Lexical Scope

### The Problem
If a function returns another function, how does the returned function remember the variables from the scope where it was defined? We need a mechanism that ties a function to its defining environment, rather than the environment where it happens to be called later.

### Isolate the Concept
We will refactor `my-sqrt` into a function that *returns* the iterator, demonstrating that the iterator remembers `x`.

```scheme
(define (make-sqrt x)
  (define (good-enough? guess) (< (abs (- (* guess guess) x)) 0.001))
  (define (improve guess) (/ (+ guess (/ x guess)) 2.0))
  (define (sqrt-iter guess)
    (if (good-enough? guess) guess (sqrt-iter (improve guess))))
  sqrt-iter)  ; Return the function instead of calling it

(define sqrt-of-2 (make-sqrt 2.0))
(sqrt-of-2 1.0)
```

Running this yields:
```
1.4142156862745097
```
This output proves that `sqrt-iter` successfully uses the value `2.0` for `x`, even though `make-sqrt` has already finished executing and `sqrt-of-2` was called from the top level. The inner functions are bundled with the environment where they were defined. This nesting of scopes is called **block structure**, and the visibility rules are called **lexical scope**. The resulting bundled function is a **closure**.

### Discard the throwaway example
This functional factory pattern is discarded to keep our math module focused on plain procedures.

### Project Change
- **Reference Source:** SICP Section 1.1.8.
- **Files affected:** None (we just discussed the existing `my-sqrt`).
- **Change type:** No code change, purely conceptual explanation of the existing project state.
- **Location:** N/A.
- **Dependencies:** None.

### The New Code
(No new code to type; we rely on the `my-sqrt` definition from the previous unit).

### The Updated Project
(Project remains unchanged, containing `my-sqrt` with its internal definitions).

### Mechanical Walkthrough
1. In the `my-sqrt` definition, `(define (good-enough? guess) ...)` is nested inside the outer `define`. This nesting is the block structure.
2. Inside `good-enough?`, the variable `x` is used but never passed in as an argument.
3. Because Scheme uses lexical scope, the interpreter looks outward from the current block to the enclosing block to find `x`. It finds `x` bound as the parameter of `my-sqrt`.
4. Per the Repetition Rule, this is the exact same closure mechanism we've seen before: a function definition captures the variables in the environment where it is authored.

### CS Lens
Lexical scope (or static scope) binds variable names based on the physical structure of the source code.
Also recognized in: JavaScript (nested functions), Rust (lifetimes and borrowing contexts), C (block-level variables), Python (nonlocal).

### SE Lens
Lexical scoping is engineered to make code analyzable by human eyes. By looking at the indentation and brackets, you can tell exactly which variables a function has access to. The alternative is dynamic scoping, where a function looks up variables in the call stack of whoever invoked it. Dynamic scoping makes functions highly unpredictable because their behavior changes depending on who called them.

### Commands Needed
None.

### Run It
(Running the full file in the closing).

### Connecting to What's Next
This completes our tour of the essential elements of programming defined in SICP Chapter 1.

---

## Closing

### Connect the pieces
A value flows through the three mechanisms:
1. `(my-sqrt 9.0)` is a combination involving a procedural abstraction.
2. The substitution model tells us `x` becomes `9.0` in the body.
3. Applicative order ensures `9.0` is fully evaluated before the body runs.
4. Block structure allows the inner `sqrt-iter` to access that `9.0`.
5. The procedure recurses until it returns `3.00009`.

### What breaks without this
Remove the lexical scoping benefit by deleting the nested block structure and putting `good-enough?` at the top level without passing `x`:
```scheme
(define (good-enough? guess)
  (< (abs (- (* guess guess) x)) 0.001))

(define (my-sqrt x)
  ...)
```
Running this causes an error: `x: unbound identifier`. Without block structure and lexical scope, the inner function cannot see the outer variable, forcing you to pollute every helper signature with an extra `x` parameter.

### Exercises
1. Trace the substitution model manually for `(+ 1 (* 2 3))`.
2. Write a function using block structure that returns the sum of squares of the two larger of three numbers (SICP Exercise 1.3).
3. Test if your language uses applicative or normal order using `(define (p) (p))` and passing it to a function that ignores its argument (SICP Exercise 1.5).

### Definition of done
- [x] Create `math-utils.rkt`.
- [x] Implement procedural abstraction.
- [x] Commit: `git commit -m "Implement Chapter 1 math utilities demonstrating lexical scope and procedural abstraction"`
