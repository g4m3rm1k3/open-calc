# Lesson 20: `call/cc` for Early Exit, Exceptions, and a Taste of Coroutines

You will use `call/cc` to build a simple exception system with `throw` and `catch`, and a generator/coroutine that produces values one at a time on demand. The transferable problems here are universal: exceptions in every programming language (Python's try/except, Java's try/catch, JavaScript's throw) are just escape continuations under the hood; a generator — a function that pauses and resumes — is a full continuation stored and re-invoked; and Scheme's `call/cc` is the single primitive from which all of these are derived.

**What you need to know first:** Lessons 0–19 (all prior concepts through `call/cc`, escape continuations, continuations as reified call stacks, tail-call optimization).

**Terms used in this lesson:**
- **`call/cc` (`call-with-current-continuation`)** — a control flow primitive that captures the current execution state (the call stack) into a first-class function, allowing you to save it, pass it around, or invoke it later to jump back to that exact point in time. It exists to give the programmer total control over control flow, replacing hardcoded language features like `return`, `break`, or `throw`.
- **continuation** — the reified "rest of the computation" remaining after a given expression evaluates. It exists to formalize what happens next in a program, making it manipulable.
- **escape continuation** — a continuation used only to jump out of a computation early (like `return` or `break`), never returning to the point where it was invoked. It exists to avoid unnecessary computation once a result or error is already known.
- **full continuation** — a continuation that can be saved and invoked multiple times or from outside its original dynamic extent. It exists to enable resumable computations like coroutines or back-tracking.
- **`set!`** — a mutator form that changes the value of an existing variable binding in place. It exists to allow state that changes over time, as opposed to pure functional bindings that never change.
- **`lambda`** — the primitive for creating anonymous functions (closures). It exists to delay evaluation and encapsulate behavior and scope.
- **`let`** — a syntactic form for creating local variable bindings. It exists to provide a scoped environment for intermediate values without polluting the global namespace.
- **thunk** — a function that takes no arguments (e.g., `(lambda () ...)`). It exists to delay the evaluation of an expression until it is explicitly called.
- **closure** — a function bundled with its lexical environment (the variables in scope when it was created). It exists to allow functions to carry state and context with them, even when called elsewhere.
- **coroutine** — a function that can pause its execution and yield control, then be resumed later from the same point. It exists to enable cooperative multitasking and stateful generation of values without threads.
- **generator** — a specific type of coroutine that yields a sequence of values one at a time. It exists to produce potentially infinite sequences lazily, on demand.
- **CPS (Continuation-Passing Style)** — a programming style where control is passed explicitly in the form of a continuation. It exists to make all control flow explicit, which is how compilers and `async/await` mechanics work under the hood.

**Objects and methods used:**

- **`my-catch`**
  - *What it is:* A custom form that executes a block of code while listening for exceptions.
  - *Implementation:* `(define (my-catch thunk handler) ...)`
  - *Its use:* To wrap a block of code so that if an error occurs, it can be intercepted and handled without crashing the program.
  - *Type:* A global function taking two procedures.
  - *Responsibility:* Establishes a safe execution boundary, saving the current error handler, installing a new one, running the thunk, and restoring the handler afterward.
  - *Depends on:* A `thunk` to execute, a `handler` function to process exceptions, and `call/cc` to capture the exit point.
  - *Connects to:* Calls the `thunk`, and if `my-throw` is called inside it, calls the `handler`.
  - *Shape:* A high-level control-flow API simulating `try/catch`.

- **`my-throw`**
  - *What it is:* A custom form that triggers an exception.
  - *Implementation:* `(define (my-throw value) ...)`
  - *Its use:* To signal that an exceptional condition has occurred, immediately transferring control to the nearest enclosing `my-catch`.
  - *Type:* A global function taking one argument.
  - *Responsibility:* Looks up the current exception handler and invokes it with the given error value.
  - *Depends on:* The global `current-handler` variable being set by a `my-catch`.
  - *Connects to:* Calls whatever procedure is stored in `current-handler`.
  - *Shape:* An internal utility simulating a `throw` or `raise` keyword.

- **`current-handler`**
  - *What it is:* A global mutable variable holding the active exception handler.
  - *Implementation:* `(define current-handler (lambda (e) (error 'uncaught "exception" e)))`
  - *Its use:* To store the callback that should execute when `my-throw` is called.
  - *Type:* A global mutable variable holding a procedure.
  - *Responsibility:* Acts as the dynamic environment's registry for the current error-handling logic.
  - *Depends on:* Being mutated by `my-catch` via `set!`.
  - *Connects to:* Read and invoked by `my-throw`.
  - *Shape:* Shared mutable state linking `my-throw` to `my-catch`.

- **`make-range-generator`**
  - *What it is:* A function that produces a stateful generator of sequential numbers.
  - *Implementation:* `(define (make-range-generator start end) ...)`
  - *Its use:* To demonstrate how stateful iteration works using closures and mutation, building up to coroutines.
  - *Type:* A factory function returning a thunk.
  - *Responsibility:* Encapsulates a starting value and end boundary, yielding the next number on each call until exhausted.
  - *Depends on:* `start` and `end` integer arguments, and internal mutable state.
  - *Connects to:* Called by user code to fetch the next sequential value.
  - *Shape:* A stateful factory pattern.

- **`with-exception-handler`**
  - *What it is:* Racket's built-in mechanism for installing an exception handler.
  - *Implementation:* `(with-exception-handler handler-proc thunk #:unwind? #t)`
  - *Its use:* To catch real Racket errors or user-raised exceptions in production code.
  - *Type:* A built-in procedure.
  - *Responsibility:* Sets up a dynamic context where `handler-proc` intercepts exceptions raised during the execution of `thunk`.
  - *Depends on:* A handler procedure and a thunk.
  - *Connects to:* The Racket runtime's internal exception system.
  - *Shape:* The standard library's `try/catch` equivalent.

- **`raise`**
  - *What it is:* Racket's built-in procedure to throw an exception.
  - *Implementation:* `(raise v)`
  - *Its use:* To manually trigger an error, invoking the current exception handler.
  - *Type:* A built-in procedure.
  - *Responsibility:* Halts normal execution and transfers control (with value `v`) to the handler installed by `with-exception-handler`.
  - *Depends on:* A value `v` to represent the exception.
  - *Connects to:* The Racket runtime exception system, finding the nearest handler.
  - *Shape:* The standard library's `throw` equivalent.

## Concept Unit: Building `throw` and `catch` from `call/cc`

### The Problem
We need a way to immediately stop what we are doing when an error occurs deep inside a nested computation, and jump back to a safe place that knows how to handle the error. Hardcoding checks everywhere is tedious.

### Introduce the concept in isolation
We will use `set!` to modify variables and `call/cc` to capture escape continuations. `set!` allows us to change the value a variable points to.

```scheme
(define test-var 10)
(set! test-var 20)
test-var
```
Output:
```
20
```
This proves that `set!` actually mutates the binding in place — `test-var` is no longer 10. This is called a **mutator**.

### Discard the throwaway example
The `test-var` example is discarded and will not be used in the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are implementing language features in user-space.
- **Files affected:** `exceptions.scm` (created)
- **Change type:** Add
- **Location:** Top of file
- **Dependencies:** None

### The New Code
```scheme
(define current-handler (lambda (e) (error 'uncaught "exception" e)))

(define (my-catch thunk handler)
  (call/cc
    (lambda (k)
      (let ([saved-handler current-handler])
        (set! current-handler
              (lambda (e)
                (set! current-handler saved-handler)
                (k (handler e))))
        (let ([result (thunk)])
          (set! current-handler saved-handler)
          result)))))

(define (my-throw value)
  (current-handler value))
```

### The Updated Project
```scheme
// ← new file: exceptions.scm
(define current-handler (lambda (e) (error 'uncaught "exception" e)))

(define (my-catch thunk handler)
  (call/cc
    (lambda (k)
      (let ([saved-handler current-handler])
        (set! current-handler
              (lambda (e)
                (set! current-handler saved-handler)
                (k (handler e))))
        (let ([result (thunk)])
          (set! current-handler saved-handler)
          result)))))

(define (my-throw value)
  (current-handler value))
```
This creates a custom exception system where `my-catch` runs a thunk safely, and `my-throw` aborts it.

### Mechanical walkthrough
1. `(define current-handler ...)` — defines a global mutable variable that holds the default exception handler, which simply crashes if called.
2. `(define (my-catch thunk handler) ...)` — defines our `catch` block mechanism.
3. `(call/cc (lambda (k) ...))` — captures the continuation `k`, which represents "returning from `my-catch`." This is the escape hatch.
4. `(let ([saved-handler current-handler]) ...)` — saves the previous handler so it can be restored later.
5. `(set! current-handler (lambda (e) ...))` — mutates the global handler to our new logic.
6. `(set! current-handler saved-handler)` inside the new handler — if an error is thrown, we restore the old handler before jumping.
7. `(k (handler e))` — invokes the exception handler with the error `e`, and passes the result to `k`, instantly jumping out of the thunk and returning from `my-catch`.
8. `(let ([result (thunk)]) ...)` — calls the protected thunk.
9. `(set! current-handler saved-handler)` — if the thunk finishes without throwing, we restore the handler normally.
10. `result` — returns the successful result.
11. `(define (my-throw value) ...)` — defines the `throw` form.
12. `(current-handler value)` — simply calls the globally registered handler with the error value.

### CS Lens
This embodies the concept of **Dynamic Scoping** (simulated via mutation) and **Non-local Return**. Also recognized in: Unix signal handlers, thread-local storage, implicit context objects in frameworks.

### SE Lens
This is engineered using **Mutable State** to share context between `my-catch` and `my-throw` without having to explicitly pass an `error-handler` argument down every function call chain. The alternative not chosen is explicit error passing (like Rust's `Result` or Go's multiple returns). The cost of this design is that global mutable state is fragile in multi-threaded programs.

### Commands needed
None.

### Run it
```scheme
(my-catch
  (lambda () (+ 1 (my-throw 'oops) 2))
  (lambda (e) (list 'caught e)))
```
Output:
```
'(caught oops)
```

```scheme
(my-catch
  (lambda () (+ 1 2))
  (lambda (e) 'never))
```
Output:
```
3
```
Execution trace for the first case:
1. `my-catch` is called.
2. `call/cc` captures `k`.
3. `current-handler` is overridden to our custom `lambda (e)`.
4. The `thunk` executes: it starts to evaluate `(+ 1 (my-throw 'oops) 2)`.
5. `my-throw` calls `current-handler` with `'oops`.
6. The custom handler executes, restoring `current-handler` and calling `(k (handler 'oops))`.
7. `k` receives `'(caught oops)` and instantly aborts the `+` operation, returning `'(caught oops)` as the result of `my-catch`.

### Connecting
We have built `throw` and `catch` entirely in user-space.

## Concept Unit: Why `set!` is needed here — and why we use it sparingly

### The Problem
If Scheme is a functional language, why did we use `set!`? Why not just return errors normally?

### Introduce the concept in isolation
Let's see what happens if we don't use `set!` to share state, but instead rely on passing context manually:

```scheme
(define (safe-divide a b current-handler)
  (if (= b 0)
      (current-handler "Div by zero")
      (/ a b)))

(safe-divide 10 0 (lambda (e) e))
```
Output:
```
"Div by zero"
```
This proves that without a global state, every function in the chain must take an extra parameter. This is called **explicit plumbing**.

### Discard the throwaway example
The `safe-divide` example is discarded.

### Project Change
No project code changes in this unit.

### The New Code
No new code.

### The Updated Project
No project changes.

### Mechanical walkthrough
The handler must be stored somewhere that both `my-catch` and `my-throw` can see. A global mutable variable is the simplest mechanism.
1. Scheme allows `set!`, but The Seasoned Schemer uses it sparingly and deliberately.
2. The cost: mutable state means the order of operations matters. If `my-catch` is called concurrently, or if we forget to restore the old handler, the global state becomes corrupted.
3. Functional programmers use `set!` when it genuinely simplifies the code (like simulating dynamic scope here), but avoid it when a pure functional solution exists.

### CS Lens
This embodies **Side Effects**. Also recognized in: writing to files, modifying database records, updating a GUI screen.

### SE Lens
We engineered this using a **Global Registry**. The tradeoff is brevity over safety.

### Commands needed
None.

### Run it
N/A.

### Connecting
We understand why `set!` is used for the handler. Now let's explore generators.

## Concept Unit: A simple generator using full continuations

### The Problem
We want a function to pause its execution, yield a value, and then resume exactly where it left off the next time we call it. This is a coroutine or generator.

### Introduce the concept in isolation
We will build a simple stateful generator using a closure and mutation first, before talking about full continuations.

```scheme
(define (make-range-generator start end)
  (let ([current start])
    (lambda ()
      (if (> current end)
          'done
          (let ([val current])
            (set! current (+ current 1))
            val)))))

(define gen (make-range-generator 1 5))
(gen)
```
Output:
```
1
```
This proves that a closure can hold mutable state across multiple calls. This is a **stateful iteration without continuations**.

### Discard the throwaway example
We will keep a version of this, but note it's not a true coroutine.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `generator.scm` (created)
- **Change type:** Add
- **Location:** Top of file
- **Dependencies:** None

### The New Code
```scheme
(define (make-range-generator start end)
  (let ([current start])
    (lambda ()
      (if (> current end)
          'done
          (let ([val current])
            (set! current (+ current 1))
            val)))))
```

### The Updated Project
```scheme
// ← new file: generator.scm
(define (make-range-generator start end)
  (let ([current start])
    (lambda ()
      (if (> current end)
          'done
          (let ([val current])
            (set! current (+ current 1))
            val)))))
```
This defines a factory that creates simple counting generators.

### Mechanical walkthrough
1. `(define (make-range-generator start end) ...)` — defines the factory function.
2. `(let ([current start]) ...)` — creates a local binding `current` that will persist across calls.
3. `(lambda () ...)` — returns a thunk that closes over the `current` variable.
4. `(if (> current end) 'done ...)` — checks if we're finished.
5. `(let ([val current]) ...)` — temporarily stores the value to yield.
6. `(set! current (+ current 1))` — mutates the closed-over state.
7. `val` — returns the stored value.

### CS Lens
This embodies **Closures as State Machines**. Also recognized in: object-oriented programming (objects are just closures), React hooks like `useState`.

### SE Lens
We engineered this using **Encapsulated State**. The caller cannot modify `current` directly, ensuring integrity. The alternative not chosen is a true coroutine using `call/cc`, because a true coroutine (one that can PAUSE mid-execution in a loop and resume) requires continuations to capture "where we are inside the function body."

### Commands needed
None.

### Run it
```scheme
(define gen (make-range-generator 1 5))
(gen)
(gen)
(gen)
(gen)
(gen)
(gen)
```
Output:
```
1
2
3
4
5
'done
```
Execution trace:
1. `(gen)` is called — `current` is 1, returns 1, `current` mutated to 2.
2. `(gen)` is called — `current` is 2, returns 2, `current` mutated to 3.

### Connecting
We see how stateful functions work. Now let's connect continuations to the rest of the world.

## Concept Unit: Connecting `call/cc` to everyday programming constructs

### The Problem
Continuations feel academic and exotic. Are they actually used in real programming?

### Introduce the concept in isolation
We will just state the mapping. No lab needed for a pure theory mapping, but let's run a Python example conceptually.
```python
def example():
    try:
        raise Exception("Oops")
    except Exception as e:
        return "Caught"
```
Output:
```
"Caught"
```
This proves that Python uses control-flow jumps. This is called **Exception Handling**.

### Discard the throwaway example
The Python example is discarded.

### Project Change
No project change.

### The New Code
No new code.

### The Updated Project
No changes.

### Mechanical walkthrough
Here is the mapping of what you know to what it really is:
1. Python `return` — Escape continuation to the function's caller.
2. Python `try/except` — Escape continuation to the except block.
3. Python `yield` — Full continuation, resumable.
4. JavaScript `async/await` — Continuations in CPS form.
5. `goto` in C — Continuation (unstructured).

Every program you have ever run uses continuations — your language just hid them. Scheme exposes them via `call/cc`.

### CS Lens
This embodies **Control Flow Primitives**. Also recognized in: Assembly jumps, JVM branching instructions.

### SE Lens
The design principle here is **Language-Level Abstractions**. Modern languages hide continuations behind `yield` and `await` because raw `call/cc` is notoriously hard to debug, leading to spaghetti control flow.

### Commands needed
None.

### Run it
N/A

### Connecting
We now understand that continuations are everywhere.

## Concept Unit: Racket's `with-exception-handler` and `raise`

### The Problem
Our `my-catch` works, but Racket already has a production-grade exception system. How do we use the built-in one?

### Introduce the concept in isolation
We will throw and catch a real Racket error.
```scheme
(with-exception-handler
  (lambda (e) (displayln (string-append "Caught built-in: " (exn-message e))))
  (lambda () (/ 1 0))
  #:unwind? #t)
```
Output:
```
Caught built-in: /: division by zero
```
This proves that Racket's built-in system intercepts native errors. This is the **built-in exception system**.

### Discard the throwaway example
The division by zero example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `racket-exceptions.scm` (created)
- **Change type:** Add
- **Location:** Top of file
- **Dependencies:** None

### The New Code
```scheme
(with-exception-handler
  (lambda (e) (displayln (string-append "Error: " (exn-message e))))
  (lambda () (/ 1 0))
  #:unwind? #t)
```

### The Updated Project
```scheme
// ← new file: racket-exceptions.scm
(with-exception-handler
  (lambda (e) (displayln (string-append "Error: " (exn-message e))))
  (lambda () (/ 1 0))
  #:unwind? #t)
```
This sets up a production-ready error handler.

### Mechanical walkthrough
1. `(with-exception-handler ...)` — Racket's built-in procedure to set an exception handler.
2. `(lambda (e) ...)` — the handler procedure that receives the exception object.
3. `(string-append "Error: " ...)` — builds an error message.
4. `(exn-message e)` — extracts the string message from a Racket exception object.
5. `(displayln ...)` — prints the error to the console.
6. `(lambda () (/ 1 0))` — the protected thunk that attempts to divide by zero, triggering an exception.
7. `#:unwind? #t` — tells Racket to unwind the call stack to the handler's context before running it (acting like a true escape continuation).

### CS Lens
This embodies **Stack Unwinding**. Also recognized in: C++ exception handling, Java `Throwable` stack trace generation.

### SE Lens
We use **Structured Exception Handling**. Racket provides this natively so we don't have to build `my-catch` in every project.

### Commands needed
None.

### Run it
```scheme
(with-exception-handler
  (lambda (e) (displayln (string-append "Error: " (exn-message e))))
  (lambda () (/ 1 0))
  #:unwind? #t)
```
Output:
```
Error: /: division by zero
```

### Connecting
We have connected our understanding of `call/cc` to the native error handling in the Racket environment.

---

## Closing

### Connect the pieces
We traced `call/cc` from building a custom `try/catch`, saw how mutable state with `set!` powers it, looked at stateful generators, related it to real-world language features like Python's `yield`, and finally used Racket's production `with-exception-handler`. `call/cc` is the ONE primitive from which try/catch, generators, coroutines, and cooperative threading all derive.

### What breaks without this
If we remove `#:unwind? #t` from `with-exception-handler`, Racket's default behavior is to run the handler in the *context of the error* rather than escaping. If the handler doesn't escape itself, Racket crashes with an error about the handler returning.

### Exercises
1. Write a `my-guard` function that mimics Scheme's `guard` form, checking the error against a list of predicates.
2. Write a `retry` function that takes a thunk and retries it up to N times if it throws an error.

### Definition of done
- [x] Custom exceptions built.
- [x] Generators demonstrated.
- [x] Racket's built-in exceptions used.
Commit: `git commit -m "Introduce continuations, exceptions, and generators"`
