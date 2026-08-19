# Lesson 19: Continuations — Capturing Where You Are

What you will build: The reader will understand what a continuation is — the rest of the computation after any given point — and learn `call-with-current-continuation` (`call/cc`) in Racket. They will use continuations for early exit from a search (simulating `break` or `return` from a loop), and understand why this is the most powerful and unusual feature in Scheme. The transferable problems: (1) a continuation is a reified (made into a value) representation of the call stack at a specific moment — it captures where the program will go next; (2) `call/cc` packages the current continuation as a function and passes it to a user-supplied procedure; (3) invoking a captured continuation is a jump — it immediately restores the call stack to its saved state, discarding everything that happened between capture and invocation.

What you need to know first: Lessons 0–18 (all prior concepts through `let`, `letrec`, named `let`, tail-call optimization, and the call stack).

**Terms used in this lesson:**
- **continuation** — The rest of the computation. Every expression in a program is evaluated in a context that is waiting for its result in order to do something else. The continuation is that "something else," conceptually gathered up and turned into a callable function. It represents exactly what the program will do next once the current expression finishes.
- **escape continuation** — A continuation used strictly to jump backward out of a computation to an enclosing scope (exactly like a `return` or `break`), abandoning everything in between. It is never called after its capturing `call/cc` has already returned normally.
- **full continuation** — A continuation that is stored away and called later, potentially multiple times, or long after the scope that created it has finished. It allows pausing and resuming execution, cooperative threading, and coroutines, by restoring a past state of the call stack.
- **hole** — A conceptual placeholder inside a continuation that represents exactly where the result of the current expression will eventually be placed to complete the surrounding computation.
- **lambda** — Reappearing from Lesson 2. An anonymous function definition, creating a first-class procedure that can be passed around or invoked. It is the fundamental building block of behavior in Scheme.
- **named `let`** — Reappearing from Lesson 15. A form of `let` that binds variables and also creates a local recursive function with a name, immediately calling it with the initial bindings. It is Scheme's idiomatic way to write loops.
- **`cond`** — Reappearing from Lesson 4. A multi-branch conditional that evaluates tests in order, executing the branch of the first true test and returning its result.
- **`#f`** — Reappearing from Lesson 3. The boolean false value in Scheme, often used to signify failure or "not found" in search functions.
- **`null?`** — Reappearing from Lesson 6. A predicate procedure that checks whether a list is empty.
- **`zero?`** — Reappearing from Lesson 3. A predicate procedure that checks whether a number is exactly zero.
- **`car`** — Reappearing from Lesson 6. A procedure that accesses the first element (the head) of a pair or list.
- **`cdr`** — Reappearing from Lesson 6. A procedure that accesses the rest (the tail) of a pair or list.

**Objects and methods used:**

**`call-with-current-continuation`** (often aliased to **`call/cc`**)
- *What it is:* A primitive control-flow procedure that captures the current execution context (the "continuation") and passes it as a first-class function to a user-provided procedure.
- *Implementation:* `(call/cc (lambda (k) ...))` - a built-in procedure in Racket/Scheme taking exactly one argument, which must be a procedure of one argument.
- *Its use:* We reach for it to jump out of deeply nested code, bypassing the rest of the computation, specifically for early returns or aborting work.
- *Type:* Built-in procedure.
- *Responsibility:* To package the current state of the call stack (what the program was about to do next) into a callable procedure, and immediately invoke the user's provided procedure with that captured continuation.
- *Depends on:* A single procedure argument (a lambda) that accepts one argument (the captured continuation).
- *Connects to:* It calls the provided lambda. When the lambda calls the continuation, control flows immediately out of `call/cc` and directly back to whatever code was waiting for `call/cc`'s result.
- *Shape:* The deepest boundary of control flow in Scheme, exposing the underlying evaluation engine to user code.

**`for-each`**
- *What it is:* An iteration procedure that applies a function to every element of a list purely for side effects, returning no useful value.
- *Implementation:* `(for-each proc lst)` - a standard library procedure taking a procedure of one argument and a list.
- *Its use:* Used to traverse a list when we care about what the function does (like mutation, printing, or in our case, jumping out), not what it returns.
- *Type:* Standard library procedure.
- *Responsibility:* To sequentially apply a procedure to every item in a list from left to right, ignoring the return values and ultimately returning void.
- *Depends on:* A procedure (usually a side-effecting one) and a list to iterate over.
- *Connects to:* Calls the provided procedure once for each element of the list, passing the element as the argument.
- *Shape:* A standard iteration utility sitting at the boundary between list processing and side effects.

---

## Concept Unit: What a continuation IS — before any code

### The Problem

Before we can capture and use a continuation, we have to define what one actually is. In most languages, the call stack is an invisible, internal detail of the runtime. You can't touch it. You can't save it to a variable. In Scheme, we need a way to talk about "what happens next" as a concrete, tangible thing.

### Introduce the concept in isolation

Let's look at a simple arithmetic expression:

```scheme
(+ 1 (* 2 3))
```

```
7
```

This code evaluates to `7`. But what does this prove about continuations? Every expression in a program has a **continuation**: the computation that will use its result. When the computer is busy figuring out what `(* 2 3)` is, the rest of the expression — the `(+ 1 ...)` part — is just waiting. 

If we represent the waiting part, it looks like this:

```
Expression: (+ 1 (* 2 3))
Continuation of (* 2 3): (+ 1 [hole])
```

This represents what a **continuation** is: a function that takes a value (to put in the `[hole]`) and finishes the computation. The "hole" is exactly where the result of `(* 2 3)` will go. The continuation is everything surrounding the expression that is waiting for it to finish.

### Discard the throwaway example

The conceptual visualization of `(+ 1 [hole])` is discarded; it is merely a mental model for understanding the call stack's waiting state.

### Project Change

No reference counterpart — this is a from-scratch addition because we are demonstrating a core language feature directly in the REPL.

- **Files affected:** None yet.
- **Change type:** Configuration/Mental Model.
- **Location:** In the programmer's conceptual toolkit.
- **Dependencies:** None.

### The New Code

```scheme
(+ 1 (* 2 3))
```

### The Updated Project

```scheme
// ← new (conceptually)
(+ 1 (* 2 3))
```
This expression as a whole adds 1 to the product of 2 and 3.

### Mechanical walkthrough

- `(+ 1 (* 2 3))` is evaluated from the inside out.
- The inner expression `(* 2 3)` must be evaluated first.
- The outer expression `(+ 1 ...)` pauses and waits. This waiting state is the **continuation**.
- Once `(* 2 3)` produces `6`, it is plugged into the hole, yielding `(+ 1 6)`, which produces `7`.

### CS lens

Also recognized in: callback functions in Node.js, continuation-passing style (CPS) in compiler design, `Promise.then()` in JavaScript. A continuation is the reification of the call stack.

### SE lens

We normally let the language runtime manage the call stack (the continuation) invisibly. The alternative is Continuation-Passing Style, where every function takes an extra argument representing "what to do next." Scheme's engine is built this way internally, which is why it can safely expose the continuation to the programmer.

### Commands needed to make this unit real, if any

None.

### Run it. Show the real output.

```
7
```

### One sentence connecting this unit to what came immediately before.

Now that we understand the continuation is just the "waiting rest of the computation," we can learn how Scheme allows us to grab it and use it.

---

## Concept Unit: `call/cc` — the mechanism

### The Problem

We know the continuation is the waiting computation, but it is invisible. How do we actually capture it, hold it in a variable, and call it ourselves to manipulate the control flow of our program?

### Introduce the concept in isolation

```scheme
(call/cc (lambda (k) 42))
```

```
42
```

This is called **`call/cc`** (short for `call-with-current-continuation`). This simple use proves that if the captured continuation `k` is never called, `call/cc` just returns whatever the lambda returns normally (in this case, `42`).

### Discard the throwaway example

This minimal `call/cc` example is discarded; it will not appear in the final project.

### Project Change

No reference counterpart — this is a from-scratch addition because we are experimenting with the syntax in the REPL.

- **Files affected:** REPL.
- **Change type:** Add.
- **Location:** Freestanding.
- **Dependencies:** None.

### The New Code

```scheme
(+ 1 (call/cc (lambda (k) (+ 10 (k 99)))))
```

### The Updated Project

```scheme
// ← new
(+ 1 (call/cc (lambda (k) (+ 10 (k 99)))))
```
This expression captures the continuation `(+ 1 [hole])`, packages it as `k`, and inside the lambda immediately calls `k` with `99`, aborting the `(+ 10 ...)` calculation.

### Mechanical walkthrough

- `+` is the standard addition procedure.
- `1` is the first argument to `+`.
- `call/cc` captures the **current continuation**. The continuation at this exact moment is `(+ 1 [hole])`.
- `lambda (k)` defines an anonymous function receiving one argument. `call/cc` calls this lambda, passing the captured continuation (which we name `k`).
- Inside the lambda, `+` is called with `10` and the result of `(k 99)`.
- `(k 99)` invokes the continuation. Invoking a continuation is a one-way jump.
- `99` is immediately sent into the `[hole]` of the captured continuation, becoming `(+ 1 99)`.
- Control flow completely Abandons the `(+ 10 ...)` expression. It never finishes.

1. `call/cc` captures the continuation `(+ 1 [hole])` and calls the lambda with it.
2. Inside the lambda, evaluation reaches `(k 99)`.
3. `k` is invoked with `99`. The current stack is completely discarded, and the stack saved in `k` is restored.
4. `99` drops into the hole: `(+ 1 99)`. The program returns `100`.

### CS lens

Also recognized in: `setjmp`/`longjmp` in C, exception handling (`throw`/`catch`) in most modern languages, algebraic effects. `call/cc` provides a first-class, programmable `goto` that carries state.

### SE lens

The alternative to `call/cc` is hardcoding specific control structures (like `break`, `return`, `throw`, `yield`) into the language compiler. By providing `call/cc`, Scheme remains a tiny language: all those other constructs can be written as library functions in regular Scheme code. The tradeoff is that reading code with explicit `call/cc` requires holding the shape of the stack in your head.

### Commands needed to make this unit real, if any

None.

### Run it. Show the real output.

```
100
```

### One sentence connecting this unit to what came immediately before.

Because invoking a continuation immediately jumps back to where `call/cc` was, we can use this exact mechanism to simulate a `return` or `break` out of a loop.

---

## Concept Unit: Early exit with `call/cc` — simulating `return` or `break`

### The Problem

If we are searching through a list and find what we're looking for, we want to stop searching immediately. In a language like Java or Python, we would just use a `return` statement inside a loop. Scheme doesn't have a `return` keyword. How do we break out of an iteration early?

### Introduce the concept in isolation

```scheme
(define (find-first pred? lst)
  (call/cc
    (lambda (return)
      (for-each (lambda (elem)
                  (when (pred? elem)
                    (return elem)))
                lst)
      #f)))
```

```
> (find-first even? '(1 3 4 7 8))
4
> (find-first even? '(1 3 7))
#f
```

This proves that `call/cc` allows us to jump completely out of the nested `for-each` loop the instant `(return elem)` is called, skipping the rest of the list.

### Discard the throwaway example

This throwaway demonstration is complete, but we will adapt the exact same pattern into our project code for other searches.

### Project Change

No reference counterpart — this is a from-scratch addition because we are demonstrating early exit mechanics.

- **Files affected:** `search.rkt` (conceptual).
- **Change type:** Add.
- **Location:** Freestanding.
- **Dependencies:** None.

### The New Code

```scheme
(define (find-first pred? lst)
  (call/cc
    (lambda (return)
      (for-each (lambda (elem)
                  (when (pred? elem)
                    (return elem)))
                lst)
      #f)))
```

### The Updated Project

```scheme
// ← new
(define (find-first pred? lst)
  (call/cc
    (lambda (return)
      (for-each (lambda (elem)
                  (when (pred? elem)
                    (return elem)))
                lst)
      #f)))
```
This function defines a search that iterates over a list for side-effects and uses a captured continuation to perform an early exit upon success, returning `#f` if the loop finishes normally.

### Mechanical walkthrough

- `define` creates a new function named `find-first` accepting a predicate `pred?` and a list `lst`.
- `call/cc` captures the continuation that is waiting for the final result of `find-first`, and binds it to `return` via the lambda.
- `for-each` is an iteration procedure. It takes a lambda and applies it to every element in `lst`, primarily for side effects.
- `lambda (elem)` defines the operation performed on each item.
- `when` is a conditional that executes its body only if `(pred? elem)` evaluates to true.
- `(return elem)` invokes the captured continuation. Because `return` is the continuation for the entire `call/cc` block, calling it immediately exits the `for-each` loop entirely, making `call/cc` evaluate to `elem`, which becomes the return value of `find-first`.
- `#f` is evaluated and returned only if the `for-each` completes without `return` ever being called (meaning the predicate matched nothing).

1. Execution enters `find-first`.
2. `call/cc` captures the exit point and binds it to `return`.
3. `for-each` begins processing elements.
4. If `(pred? elem)` is true, `(return elem)` is called, instantly jumping out to step 2's exit point.
5. If the loop exhausts the list, `#f` is returned.

### CS lens

Also recognized in: `return` statements in C/Java, `break` statements in loops. Using a continuation this way implements a non-local transfer of control.

### SE lens

The alternative to using an early exit is forcing the loop to process every item, or writing a custom recursive function that manually stops propagating down the list. The cost of `for-each` with `call/cc` is that it allocates a continuation object, but it yields incredibly clear code that closely mirrors imperative `return` semantics while using only functional primitives.

### Commands needed to make this unit real, if any

None.

### Run it. Show the real output.

```
> (find-first even? '(1 3 4 7 8))
4
```

### One sentence connecting this unit to what came immediately before.

The early exit we just built is entirely safe, provided we use it correctly — which brings us to the distinction between the two ways continuations can be used.

---

## Concept Unit: Escape continuations vs full continuations — the distinction

### The Problem

If we capture a continuation and save it in a global variable, what happens if we call it *after* the function that captured it has already finished and returned? Can we travel back in time?

### Introduce the concept in isolation

```scheme
(define saved-k #f)

(define (test)
  (call/cc (lambda (k)
             (set! saved-k k)
             "Finished naturally")))
```

```
> (test)
"Finished naturally"
> (saved-k "Time travel!")
"Time travel!"
```

This proves that continuations in Scheme are **full continuations**. They outlive the scope that created them. Calling `saved-k` restores the stack to exactly the state it was in when `call/cc` ran, making `test` seemingly return a second time, long after it finished!

### Discard the throwaway example

This time-travel example is discarded. In this lesson, we are only focusing on safe early exits.

### Project Change

No reference counterpart.

- **Files affected:** None.
- **Change type:** Mental Model.
- **Location:** Conceptual toolkit.
- **Dependencies:** None.

### The New Code

We will not write new project code for full continuations here; we are establishing the boundary of what we are doing.

### The Updated Project

No project update is required for this conceptual distinction.

### Mechanical walkthrough

- An **escape continuation** is what we used in `find-first`. We only invoked it while still strictly inside the dynamic extent (the execution lifetime) of the `call/cc` that created it. It acts purely to "escape" upwards, abandoning work.
- A **full continuation** (what we just showed in isolation) is captured, stored away (using `set!`), and called later, possibly multiple times.
- Scheme's `call/cc` always captures a full continuation.
- Calling an escape continuation is completely safe and predictable (it acts like a `return`).
- Calling a full continuation after the fact re-enters a dead context, which enables powerful features like coroutines, but is extremely difficult to reason about.

### CS lens

Also recognized in: Cooperative multitasking, generator functions (`yield` in Python), green threads, undo mechanisms. A full continuation is a snapshot of a running thread.

### SE lens

The alternative to full continuations for implementing coroutines or generators is maintaining complex state machines by hand (which is exactly what compilers for languages with `async`/`await` do behind the scenes). Scheme gives you the primitive directly. The tradeoff is that debugging full continuations is notoriously difficult because control flow can arrive from anywhere at any time.

### Commands needed to make this unit real, if any

None.

### Run it. Show the real output.

```
"Time travel!"
```

### One sentence connecting this unit to what came immediately before.

Because we understand that escape continuations are just a safe subset of full continuations, we can use them confidently to optimize recursive functions.

---

## Concept Unit: `list-product` with early exit — short-circuit multiplication

### The Problem

If we write a recursive function to multiply a list of numbers, and one of the numbers is `0`, the final result is guaranteed to be `0`. But a standard recursive loop will stubbornly continue multiplying everything else anyway, returning from every stack frame one by one. How do we short-circuit out of a deep recursion instantly?

### Introduce the concept in isolation

```scheme
(define (list-product lst)
  (call/cc
    (lambda (exit)
      (let loop ([lst lst])
        (cond
          [(null? lst) 1]
          [(zero? (car lst)) (exit 0)]
          [else (* (car lst) (loop (cdr lst)))])))))
```

```
> (list-product '(1 2 0 4 5))
0
```

This proves that by calling `(exit 0)` from inside a deep recursion, we completely bypass all the pending `*` operations waiting on the stack, immediately yielding `0`.

### Discard the throwaway example

The isolated proof is finished; the code is perfectly adapted for our needs.

### Project Change

No reference counterpart — this is a from-scratch addition.

- **Files affected:** `math-utils.rkt` (conceptual).
- **Change type:** Add.
- **Location:** Freestanding.
- **Dependencies:** None.

### The New Code

```scheme
(define (list-product lst)
  (call/cc
    (lambda (exit)
      (let loop ([lst lst])
        (cond
          [(null? lst) 1]
          [(zero? (car lst)) (exit 0)]
          [else (* (car lst) (loop (cdr lst)))])))))
```

### The Updated Project

```scheme
// ← new
(define (list-product lst)
  (call/cc
    (lambda (exit)
      (let loop ([lst lst])
        (cond
          [(null? lst) 1]
          [(zero? (car lst)) (exit 0)]
          [else (* (car lst) (loop (cdr lst)))])))))
```
This function multiplies a list of numbers recursively, using an escape continuation to short-circuit the entire process the moment a zero is encountered.

### Mechanical walkthrough

- `call/cc` captures the continuation waiting for the entire function's result and binds it to `exit`.
- `let loop ([lst lst])` is a **named `let`**. It binds the local variable `lst` to the initial list and creates a recursive entry point called `loop`.
- `cond` evaluates tests in order.
- `[(null? lst) 1]` is the base case. If the list is empty, it returns `1` (the multiplicative identity).
- `[(zero? (car lst)) (exit 0)]` checks if the current item is zero. If true, it invokes `exit` with `0`. This abandons the `loop` and abandons all the pending `*` operations on the stack, returning `0` from `list-product` immediately.
- `[else (* (car lst) (loop (cdr lst)))]` is the recursive step. It multiplies the current number by the result of calling `loop` on the rest of the list. Every call here builds up a waiting continuation: `(* 1 (* 2 [hole]))`.

1. `list-product` is called with `'(1 2 0 4 5)`.
2. `call/cc` binds `exit`.
3. `loop` processes `1`. It waits to evaluate `(* 1 [hole])`.
4. `loop` processes `2`. It waits to evaluate `(* 2 [hole])`.
5. `loop` processes `0`. `(zero? (car lst))` is true.
6. `(exit 0)` is called. The waiting `(* 1 ...)` and `(* 2 ...)` stack frames are instantly vaporized.
7. The function returns `0`.

### CS lens

Also recognized in: short-circuit evaluation (like `&&` and `||` in C/Java), early pruning in search trees (alpha-beta pruning). Discarding irrelevant stack frames saves computation time and memory overhead.

### SE lens

The alternative is propagating `#f` or `0` manually up through every single frame, forcing the developer to write boilerplate checks after every recursive call to see if a failure occurred. The tradeoff is that jumping the stack bypasses any cleanup code that might normally run as the stack unwinds (unless explicit unwinding protectors like `dynamic-wind` are used).

### Commands needed to make this unit real, if any

None.

### Run it. Show the real output.

```
> (list-product '(1 2 3 4 5))
120
> (list-product '(1 2 0 4 5))
0
```

### One sentence connecting this unit to what came immediately before.

Because `call/cc` allows us to instantly discard the current stack and return a value directly, it is the ultimate tool for both imperative loop-breaking and recursive short-circuiting.

---

## Closing

### Connect the pieces

Continuations are the most powerful control-flow primitive in Scheme. Every expression executes with a continuation (a "what's next"). By exposing this via `call/cc`, Scheme allows the programmer to capture the current state of the stack as a function. Invoking that function discards whatever the program was currently doing and restores the captured state. We used this as an **escape continuation** to implement an early `return` out of a `for-each` loop, and to short-circuit a recursive `list-product` multiplication the moment we hit a `0`. Every other control structure in programming (if, cond, when, exceptions, loops, coroutines, cooperative threading) can be built natively from `call/cc`.

### What breaks without this

If you remove the `call/cc` wrapper from `find-first` and just try to return early without it:

```scheme
(define (find-first pred? lst)
  (for-each (lambda (elem)
              (when (pred? elem)
                elem)) ; Just evaluating elem does nothing!
            lst)
  #f)

> (find-first even? '(1 3 4 7 8))
#f
```
Without `call/cc` to provide an explicit escape hatch, `for-each` consumes and ignores the value of `elem`, finishes the loop, and the function incorrectly returns `#f`.

### Exercises

1. Write `my-find-index`, a function that takes a predicate and a list, and returns the index of the first element matching the predicate, using `call/cc` for an early exit. If no element matches, return `#f`.
2. Write `search-tree`, a function that takes a nested list (a tree) and a predicate, and returns the first leaf node that satisfies the predicate, aborting the rest of the traversal.

### Definition of done

- [x] Implemented `call/cc` to capture the current continuation.
- [x] Simulated early `return` and `break` using escape continuations.
- [x] Short-circuited a deep recursion to optimize a search.
- [x] Committed to `git` with message: "feat: implemented continuation-based early exits for search operations".
