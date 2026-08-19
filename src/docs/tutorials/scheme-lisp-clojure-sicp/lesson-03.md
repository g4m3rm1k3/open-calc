# Lesson 3: Your First Recipe — `define` and `lambda`

What you will build: The reader will learn how to define their own named functions using `define`, how `lambda` creates an anonymous function as a value, how to call those functions, and how closures capture variables from their surrounding scope. The transferable problems: (1) a function definition is just giving a name to a lambda — `define` and `lambda` are not two different things, they are one thing with two notations; (2) a function is a value in Scheme — it can be stored in a variable, passed to another function, or returned from one; (3) a closure captures the environment where it was created, not where it is called — this is why functions can 'remember' variables that have gone out of scope elsewhere.

What you need to know first: Lesson 0 (S-expressions, REPL, prefix notation, #lang racket), Lesson 1 (cons, car, cdr, pair?, atom?, box-and-pointer, dotted-pair, empty list), Lesson 2 (list, null?, length, append, list?, nested lists, quote).

**Terms used in this lesson**
- **S-expression** — A parenthesized list of elements, forming the basic syntactic building block of Scheme programs. It represents both code and data.
- **REPL** — Read-Eval-Print Loop. An interactive programming environment that takes user inputs, evaluates them, and returns the result to the user.
- **Prefix notation** — A mathematical notation where operators precede their operands (e.g., `+ 1 2`), used uniformly in Scheme for all function calls.
- **`#lang racket`** — A language declaration at the top of a file that tells the DrRacket environment to use the Racket dialect of Scheme.
- **Binding** — Associating a name (a symbol) with a value within a specific environment, allowing the value to be referenced by that name later.
- **Environment** — A lookup table mapping names (symbols) to their bound values, tracking what variables exist and what they hold at any given point in execution.
- **Lambda** — An anonymous function. A lambda expression evaluates to a procedure object, which is a first-class value in Scheme.
- **Closure** — A function paired with the environment in which it was created, allowing the function to access variables from that specific environment even when called from somewhere else.
- **Side-effect** — An operation, like printing to the screen or mutating state, that alters the state of the system outside its local environment, rather than just returning a value.

**Objects and methods used**

- **`define`**
  - *What it is:* A special form used to create a new binding in the current environment.
  - *Implementation:* `(define name value)` or `(define (name args...) body)`.
  - *Its use:* Used to associate names with numbers, strings, or functions so they can be reused.
  - *Type:* Special form (keyword).
  - *Responsibility:* Binds a symbol to the result of evaluating an expression in the current environment.
  - *Depends on:* An identifier to bind, and an expression to evaluate.
  - *Connects to:* Modifies the current environment.
  - *Shape:* A top-level or internal definition boundary.

- **`display`**
  - *What it is:* A built-in procedure for printing output.
  - *Implementation:* `(display value)`. Returns void.
  - *Its use:* Used to output text or values to the console for the user to read.
  - *Type:* Built-in procedure.
  - *Responsibility:* Prints the external representation of a value to the current output port.
  - *Depends on:* A value to print.
  - *Connects to:* The standard output stream.
  - *Shape:* An I/O boundary.

- **`newline`**
  - *What it is:* A built-in procedure for printing a line break.
  - *Implementation:* `(newline)`. Returns void.
  - *Its use:* Used to advance the console output to the next line.
  - *Type:* Built-in procedure.
  - *Responsibility:* Outputs a newline character to the current output port.
  - *Depends on:* Nothing.
  - *Connects to:* The standard output stream.
  - *Shape:* An I/O boundary.


## Concept Unit: `define` for values

### The Problem
We need a way to store a value so we can refer to it later by name, rather than re-typing or re-calculating it every time.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are in Module 0 Foundations.
- **Files affected:** `scratch.rkt` (created).
- **Change type:** Add.
- **Location:** Top level.
- **Dependencies:** `#lang racket`.

### The New Code
```scheme
#lang racket
(define answer 42)
```

### The Updated Project
```scheme
#lang racket
(define answer 42) // ← new
```
We now have a file that establishes the Racket language and binds a single variable.

### Introduce the concept in isolation
In the REPL, type the definition and then evaluate the name:
```scheme
> (define x 42)
> x
42
```
This output proves that `define` binds the symbol `x` to the value `42`. When `x` is evaluated, the REPL looks it up in the environment and returns `42`. This is called a **binding**.

### Discard the throwaway example
The variable `x` is explicitly discarded and will not be used in the main file.

### Mechanical walkthrough
- `#lang racket` establishes the language environment.
- `(define answer 42)` is an S-expression.
- `define` is a special form that alters the environment.
- `answer` is the symbol being bound.
- `42` is the value evaluated and bound to `answer`.


## Concept Unit: `lambda`

### The Problem
We need a way to create a function, which is a reusable block of logic, independent of whether it has a name.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `scratch.rkt` (modified).
- **Change type:** Add.
- **Location:** Below `answer`.
- **Dependencies:** None.

### The New Code
```scheme
(lambda (x) (* x x))
```

### The Updated Project
```scheme
#lang racket
(define answer 42)

(lambda (x) (* x x)) // ← new
```
The file now contains an anonymous function that squares its input.

### Introduce the concept in isolation
In the REPL, type the lambda:
```scheme
> (lambda (x) (* x x))
#<procedure>
```
This output proves that `lambda` evaluates to a procedure object (a function value), not to the result of calling the function. This is called a **lambda expression**.

### Discard the throwaway example
This isolated evaluation is explicitly discarded.

### Mechanical walkthrough
- `lambda` is a special form that creates a procedure.
- `(x)` is the parameter list.
- `(* x x)` is the body of the function, evaluated only when the function is called.
- `*` is the multiplication operator, used in prefix notation.


## Concept Unit: Calling a lambda directly

### The Problem
Now that we have created a function object, we need a way to actually run it and pass arguments to it.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `scratch.rkt` (modified).
- **Change type:** Add.
- **Location:** Below the lambda.
- **Dependencies:** None.

### The New Code
```scheme
((lambda (x) (* x x)) 5)
```

### The Updated Project
```scheme
#lang racket
(define answer 42)

(lambda (x) (* x x))

((lambda (x) (* x x)) 5) // ← new
```
The file now shows an inline invocation of an anonymous function.

### Introduce the concept in isolation
In the REPL, type:
```scheme
> ((lambda (x) (* x x)) 5)
25
> ((lambda (x y) (+ x y)) 3 4)
7
```
This output proves that putting a lambda expression in the first position of a list immediately invokes it with the subsequent elements as arguments.

### Discard the throwaway example
The inline calls in the REPL are explicitly discarded.

### Mechanical walkthrough
- The outer S-expression `((lambda ...) 5)` represents a function call because it is a list.
- In Scheme, the first element of an evaluated list is treated as the function to call.
- The `lambda` expression evaluates to a procedure object.
- `5` evaluates to the number `5`, which is bound to `x` during the evaluation of the body `(* x x)`.


## Concept Unit: `define` for functions

### The Problem
Typing a lambda every time we want to use a function is tedious. We want to bind a function to a name so we can reuse it easily.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `scratch.rkt` (modified).
- **Change type:** Add.
- **Location:** Bottom of the file.
- **Dependencies:** None.

### The New Code
```scheme
(define (square x) (* x x))
```

### The Updated Project
```scheme
#lang racket
(define answer 42)

(lambda (x) (* x x))
((lambda (x) (* x x)) 5)

(define (square x) (* x x)) // ← new
```
We now have a named function `square` that can be called repeatedly.

### Introduce the concept in isolation
In the REPL:
```scheme
> (define square (lambda (x) (* x x)))
> (square 5)
25
> (define (square-shorthand x) (* x x))
> (square-shorthand 5)
25
```
This output proves that `(define (name args) body)` is just shorthand for `(define name (lambda (args) body))`. Both notations create a binding to a lambda.

### Discard the throwaway example
The REPL demonstration is explicitly discarded.

### Mechanical walkthrough
- `(define (square x) ...)` is a shorthand syntax.
- `square` is the name of the function.
- `x` is the parameter.
- `(* x x)` is the body.
- It operates exactly as if we had written `(define square (lambda (x) (* x x)))`.


## Concept Unit: Closures

### The Problem
We want to create functions that remember information from the environment in which they were created, even if that environment goes out of scope.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `scratch.rkt` (modified).
- **Change type:** Add.
- **Location:** Bottom of the file.
- **Dependencies:** None.

### The New Code
```scheme
(define (make-adder n)
  (lambda (x) (+ x n)))

(define add5 (make-adder 5))
```

### The Updated Project
```scheme
#lang racket
(define answer 42)

(lambda (x) (* x x))
((lambda (x) (* x x)) 5)
(define (square x) (* x x))

(define (make-adder n)        // ← new
  (lambda (x) (+ x n)))       // ← new
(define add5 (make-adder 5))  // ← new
```
The file now contains a function factory and an instance of a function that captures state.

### Introduce the concept in isolation
In the REPL:
```scheme
> (define (make-adder n)
    (lambda (x) (+ x n)))
> (define add5 (make-adder 5))
> (add5 10)
15
> (add5 3)
8
```
This output proves that the inner lambda captures the variable `n` from the outer function's scope, forming a **closure**. When `make-adder` finishes, `n=5` is retained inside the procedure assigned to `add5`.

### Discard the throwaway example
The REPL examples are explicitly discarded.

### Mechanical walkthrough
- `make-adder` is a function that takes a parameter `n`.
- Its body evaluates to a `lambda` expression.
- The `lambda` captures the `n` from its surrounding environment, keeping it alive.
- `add5` is bound to the procedure returned when `make-adder` is called with `5`.
- Calling `(add5 10)` sets `x` to `10`, looks up the captured `n` (which is `5`), and calculates `10 + 5`.


## Concept Unit: Multiple-expression bodies

### The Problem
Sometimes a function needs to perform multiple actions, such as printing output (a side-effect) before returning a calculated value.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `scratch.rkt` (modified).
- **Change type:** Add.
- **Location:** Bottom of the file.
- **Dependencies:** None.

### The New Code
```scheme
(define (describe-square x)
  (display "Squaring: ")
  (display x)
  (newline)
  (* x x))
```

### The Updated Project
```scheme
#lang racket
(define answer 42)
(lambda (x) (* x x))
((lambda (x) (* x x)) 5)
(define (square x) (* x x))
(define (make-adder n)
  (lambda (x) (+ x n)))
(define add5 (make-adder 5))

(define (describe-square x) // ← new
  (display "Squaring: ")    // ← new
  (display x)               // ← new
  (newline)                 // ← new
  (* x x))                  // ← new
```
We now have a function that executes several statements in sequence.

### Introduce the concept in isolation
In the REPL:
```scheme
> (define (describe-square x)
    (display "Squaring: ")
    (display x)
    (newline)
    (* x x))
> (describe-square 4)
Squaring: 4
16
```
This output proves that a function body can contain multiple expressions. They are executed in order, and only the value of the last expression (`16`) is returned. The `display` and `newline` functions execute their side-effects.

### Discard the throwaway example
The REPL session is explicitly discarded.

### Mechanical walkthrough
- The function body contains four expressions.
- `(display "Squaring: ")` executes first, printing a string.
- `(display x)` prints the value of `x`.
- `(newline)` prints a line break.
- `(* x x)` calculates the square and acts as the return value of the entire function body.
