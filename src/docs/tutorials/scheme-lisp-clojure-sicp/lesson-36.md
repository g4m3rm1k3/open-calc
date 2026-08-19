# Lesson 36: SICP Chapter 3 — Streams and Lazy Evaluation (Revisited)

The reader will revisit streams through SICP Chapter 3.5's lens — specifically SICP's own definition of streams using memoized delay, and the deeper insight that streams are a third way to handle state (alongside pure functional code and assignment). They will implement the Sieve of Eratosthenes as a stream of primes, and understand the "stream paradigm" as an architectural choice. The transferable problems: (1) SICP's streams use memoized delay — once forced, the result is cached — which is different from a plain thunk; (2) the sieve of Eratosthenes as an infinite stream is a canonical demonstration of the power of lazy evaluation; (3) streams represent time-varying data as a sequence, avoiding the need for assignment — this is the third paradigm for handling state, alongside objects-with-mutation and purely-functional-with-explicit-state-threading.

**What you need to know first:** Lessons 0–35 (all prior concepts through streams from Lesson 22, delay/force, the environment model, assignment, memoization).

**Terms used in this lesson:**
- **Memoization** — storing the result of an expensive function call and returning the cached result when the same inputs occur again. Here, used to prevent evaluating the tail of a stream multiple times.
- **Thunk** — a function with no arguments (`(lambda () ...)`), used to delay the evaluation of an expression until it is explicitly called.
- **Lazy evaluation** — an evaluation strategy that delays the evaluation of an expression until its value is actually needed, preventing unnecessary computation and allowing for infinite data structures.
- **Assignment** — using `set!` to change the value bound to an existing variable. Here, it is used privately inside our memoization wrapper to cache a result.
- **Referential transparency** — a property of pure functions where the same inputs always yield the same output. SICP's memoized delay preserves referential transparency from the outside, hiding its internal mutation.
- **Sieve of Eratosthenes** — an ancient algorithm for finding prime numbers by iteratively filtering out the multiples of each prime found.
- **State threading** — a programming paradigm where the entire state is passed explicitly as an argument to functions and returned as a new modified state, avoiding mutation entirely.

**Objects and methods used:**
- **`make-memo-thunk`**
  - *What it is:* A function that takes a thunk and returns a new thunk which, when called, evaluates the original thunk only once, caches its result using assignment, and returns the cached result on all subsequent calls.
  - *Implementation:* A function taking `thunk` and returning a `(lambda () ...)` closure over `already-run?` and `result` state variables.
  - *Its use:* To implement SICP's memoization mechanism so that forcing a delayed stream tail multiple times does not recompute it.
  - *Type:* `(-> (-> any/c) (-> any/c))`
  - *Responsibility:* Caches the execution of a delayed expression, preventing redundant computation.
  - *Depends on:* A zero-argument function (`thunk`) to wrap, and support for `set!` to mutate local bindings.
  - *Connects to:* Called by the `my-delay` macro; when invoked, calls the wrapped `thunk` and mutates its internal state.
  - *Shape:* An internal implementation detail of the `my-delay` mechanism.

- **`my-delay`**
  - *What it is:* A macro that packages an expression into a memoized thunk, deferring its evaluation.
  - *Implementation:* `(define-syntax my-delay (syntax-rules () [(_ expr) (make-memo-thunk (lambda () expr))]))`
  - *Its use:* Used to delay the evaluation of the tail in `stream-cons*`.
  - *Type:* Macro
  - *Responsibility:* Wraps an expression inside a zero-argument function without evaluating it, and passes it to `make-memo-thunk`.
  - *Depends on:* `make-memo-thunk` and `syntax-rules` to transform the code.
  - *Connects to:* Wraps the user's expression and connects it to the memoization wrapper.
  - *Shape:* A public macro used by stream constructors.

- **`my-force`**
  - *What it is:* A function that executes a delayed thunk.
  - *Implementation:* `(define my-force (lambda (p) (p)))`
  - *Its use:* Used to retrieve the value of a delayed expression, specifically in `stream-cdr*`.
  - *Type:* `(-> (-> any/c) any/c)`
  - *Responsibility:* Forces the evaluation of a thunk by calling it.
  - *Depends on:* A zero-argument function passed as its argument.
  - *Connects to:* Calls the memoized thunk produced by `my-delay`.
  - *Shape:* A public function to trigger evaluation.

- **`stream-cons*`**
  - *What it is:* A macro that constructs a lazy pair, where the head is evaluated immediately and the tail is delayed.
  - *Implementation:* `(define-syntax stream-cons* (syntax-rules () [(_ x s) (cons x (my-delay s))]))`
  - *Its use:* To build SICP-style streams.
  - *Type:* Macro
  - *Responsibility:* Creates a pair of an evaluated value and a delayed stream.
  - *Depends on:* `cons` and `my-delay`.
  - *Connects to:* Evaluates the first argument, delays the second, and connects them in a pair.
  - *Shape:* The primary constructor for our custom streams.

- **`stream-car*`**
  - *What it is:* A function that retrieves the head of a custom stream.
  - *Implementation:* `(define (stream-car* s) (car s))`
  - *Its use:* To access the first element of a stream.
  - *Type:* `(-> pair? any/c)`
  - *Responsibility:* Extracts the `car` from the pair produced by `stream-cons*`.
  - *Depends on:* A pair representing a stream.
  - *Connects to:* Reads the first element of the pair.
  - *Shape:* Public accessor.

- **`stream-cdr*`**
  - *What it is:* A function that retrieves and forces the tail of a custom stream.
  - *Implementation:* `(define (stream-cdr* s) (my-force (cdr s)))`
  - *Its use:* To access the remaining elements of a stream, evaluating them if needed.
  - *Type:* `(-> pair? any/c)`
  - *Responsibility:* Extracts the `cdr` from the stream pair and forces its evaluation.
  - *Depends on:* `my-force` and a pair whose `cdr` is a thunk.
  - *Connects to:* Triggers `my-force` on the tail of the stream.
  - *Shape:* Public accessor.

- **`stream-null?*`**
  - *What it is:* A function to check if a custom stream is empty.
  - *Implementation:* `(define (stream-null?* s) (null? s))`
  - *Its use:* Base case for stream processing functions.
  - *Type:* `(-> any/c boolean?)`
  - *Responsibility:* Tests if the input is the empty list `()`.
  - *Depends on:* `null?`.
  - *Connects to:* Checks the identity of the stream against the empty list.
  - *Shape:* Public predicate.

- **`integers-from`**
  - *What it is:* A generator function that creates an infinite stream of sequential integers.
  - *Implementation:* `(define (integers-from n) (stream-cons n (integers-from (+ n 1))))`
  - *Its use:* To supply the infinite sequence of candidate prime numbers for the Sieve of Eratosthenes.
  - *Type:* `(-> integer? stream?)`
  - *Responsibility:* Lazily builds an infinite sequence of integers starting from `n`.
  - *Depends on:* `stream-cons` and basic addition.
  - *Connects to:* Recursively calls itself within the delayed tail of `stream-cons`.
  - *Shape:* A stream generator.

- **`sieve`**
  - *What it is:* A stream processing function that implements the Sieve of Eratosthenes.
  - *Implementation:* Recursively filters out multiples of the stream's head from the stream's tail, consing the head onto the result.
  - *Its use:* To generate an infinite stream of prime numbers.
  - *Type:* `(-> stream? stream?)`
  - *Responsibility:* Removes non-primes from a stream of integers.
  - *Depends on:* `stream-cons`, `stream-car`, `stream-cdr`, `stream-filter`, and `modulo`.
  - *Connects to:* Returns a new stream whose elements are lazily computed.
  - *Shape:* A business-logic function demonstrating lazy evaluation.

- **`make-account-stream`**
  - *What it is:* A function that models a bank account's changing state over time as a stream of balances.
  - *Implementation:* Recursively subtracts the current transaction from the balance and conses it onto the stream of future balances.
  - *Its use:* To show how streams can represent time-varying data without assignment.
  - *Type:* `(-> number? stream? stream?)`
  - *Responsibility:* Produces a sequence of account states given an initial state and a stream of actions.
  - *Depends on:* `stream-empty?`, `stream-car`, `stream-cdr`, and arithmetic operations.
  - *Connects to:* Consumes an input stream and produces an output stream.
  - *Shape:* A demonstration of stream-based architecture.

**Everything else in the file, not this lesson's subject but still explained:**
- **`set!`**
  - *What it is:* The fundamental assignment operator in Scheme.
  - *Implementation:* `(set! variable expression)`
  - *Its use:* To change the state of `already-run?` and `result` inside the memoization wrapper.
  - *Type:* Special form.
  - *Responsibility:* Rebinds an existing variable in the current environment to a new value.
  - *Depends on:* A pre-existing variable binding.
  - *Connects to:* Modifies the environment.
  - *Shape:* Primitive syntactic form.
- **`begin`**
  - *What it is:* A sequencing form.
  - *Implementation:* `(begin expr1 expr2 ...)`
  - *Its use:* To execute multiple side-effecting expressions inside an `if` branch that only accepts one expression.
  - *Type:* Special form.
  - *Responsibility:* Evaluates a sequence of expressions in order and returns the value of the last one.
  - *Depends on:* The expressions to evaluate.
  - *Connects to:* The evaluator.
  - *Shape:* Primitive syntactic form.
- **`display`**
  - *What it is:* An output function.
  - *Implementation:* `(display value)`
  - *Its use:* To prove when our thunk is actually executing versus returning a cached result.
  - *Type:* `(-> any/c void?)`
  - *Responsibility:* Prints the given value to the standard output port.
  - *Depends on:* A value to print.
  - *Connects to:* Standard output.
  - *Shape:* Primitive function.

---

## Concept Unit: SICP's delay and force with memoization

### The Problem

In Lesson 22, we used Racket's built-in streams. Now we want to build streams exactly as SICP Chapter 3.5 builds them. At their core, streams rely on `delay` and `force`. The naive implementation of `delay` is simply wrapping an expression in a function with no arguments (a **thunk**). But if we do that, every time we force the tail of a stream, we recompute it. In a deeply recursive stream like the Fibonacci sequence or the Sieve of Eratosthenes, this redundant computation grows exponentially. We need a way for a delayed computation to remember its result after the first time it is forced, so subsequent forces return the cached result immediately.

### Introduce the concept in isolation

Let's look at what happens without memoization, and then with it. This is **memoization** applied to a delayed computation.

```scheme
; Without memoization (a plain thunk):
(define (my-delay-naive thunk) thunk)
(define (my-force-naive p) (p))

; Problem: each force re-executes the thunk:
(define p (my-delay-naive (lambda () (begin (display "computing ") 42))))
(display (my-force-naive p))  ; prints "computing " then 42
(newline)
(display (my-force-naive p))  ; prints "computing " AGAIN then 42
(newline)
```

Output:
```
computing 42
computing 42
```

This output proves that the naive approach evaluates the computation every single time `my-force-naive` is called.

### Discard the throwaway example

We will delete `my-delay-naive` and `my-force-naive`. They will not appear in our actual project implementation.

### Project Change

- **Reference Source:** SICP Section 3.5.1 "Memoizing evaluation"
- **Files affected:** `sicp-streams.rkt` (brand new file)
- **Change type:** Add
- **Location:** At the top of the file.
- **Dependencies:** None.

### The New Code

```scheme
(define (make-memo-thunk thunk)
  (let ([already-run? #f]
        [result #f])
    (lambda ()
      (if already-run?
          result
          (begin
            (set! result (thunk))
            (set! already-run? #t)
            result)))))

(define-syntax my-delay
  (syntax-rules ()
    [(_ expr) (make-memo-thunk (lambda () expr))]))

(define my-force (lambda (p) (p)))

(define p2 (my-delay (begin (display "computing ") 42)))
```

### The Updated Project

```scheme
#lang racket
// ← new
(define (make-memo-thunk thunk)
  (let ([already-run? #f]
        [result #f])
    (lambda ()
      (if already-run?
          result
          (begin
            (set! result (thunk))
            (set! already-run? #t)
            result)))))

(define-syntax my-delay
  (syntax-rules ()
    [(_ expr) (make-memo-thunk (lambda () expr))]))

(define my-force (lambda (p) (p)))
// ← end new
```
We have established the foundational mechanism for delaying expressions. Our macro `my-delay` wraps the expression without evaluating it, and `make-memo-thunk` ensures it is only evaluated once.

### Mechanical walkthrough

- **`make-memo-thunk`** is a function that takes a thunk (a zero-argument function) and returns a new zero-argument function.
- **`let`** creates a closure. It sets up two local state variables: `already-run?` (initialized to `#f`) and `result` (initialized to `#f`).
- **`lambda ()`** creates the new thunk that will be returned to the caller. This thunk has access to the environment containing `already-run?` and `result`.
- **`if already-run?`** checks if the computation has been performed before.
- **`result`** (in the true branch) simply returns the cached result if the computation was already performed.
- **`begin`** groups multiple side-effecting operations together in the false branch.
- **`set! result (thunk)`** evaluates the original thunk and assigns its return value to the `result` variable.
- **`set! already-run? #t`** assigns true to the flag so we never evaluate `(thunk)` again.
- **`result`** (at the end of `begin`) returns the newly computed value to the caller.
- **`define-syntax my-delay`** defines a macro. This is crucial because a regular function would evaluate its arguments before calling the function.
- **`[(_ expr) (make-memo-thunk (lambda () expr))]`** rewrites calls to `(my-delay expr)` into a call to `make-memo-thunk`, wrapping `expr` inside a `lambda ()`.
- **`define my-force`** is a simple function that takes a thunk `p` and calls it via `(p)`.

Execution trace for forcing `p2` twice:
```
Call 1: (my-force p2) -> (p2)
Iteration 1: already-run? is #f. Evaluates (thunk) -> prints "computing ", returns 42. result set to 42. already-run? set to #t. Returns 42.
Call 2: (my-force p2) -> (p2)
Iteration 2: already-run? is #t. Returns result (42) immediately. No "computing " printed.
```

The key here is that **assignment** (`set!`) is used to mutate `already-run?` and `result` after the first computation. This mutation is invisible to the caller (it maintains **referential transparency** from the outside), but necessary for efficiency.

---

## Concept Unit: Stream-cons, stream-car, stream-cdr (SICP's implementation)

### The Problem

With our memoized `delay` and `force` established, we need the standard list operations — `cons`, `car`, and `cdr` — adapted to work with lazy evaluation. The head of our stream should be evaluated immediately (like a standard list), but the tail must be delayed until it is explicitly requested.

### Introduce the concept in isolation

Let's look at how we combine a regular value and a delayed computation to form a **stream**.

```scheme
(define test-pair (cons 1 (my-delay (+ 1 2))))
(display (car test-pair))      ; prints 1
(newline)
(display (my-force (cdr test-pair))) ; prints 3
(newline)
```

Output:
```
1
3
```

This output proves that a pair can hold an evaluated head (`1`) and a delayed tail, and we can retrieve both correctly using `car` and `my-force` on the `cdr`.

### Discard the throwaway example

We will discard `test-pair`. It was only used to prove the structure of a lazy pair.

### Project Change

- **Reference Source:** SICP Section 3.5.1
- **Files affected:** `sicp-streams.rkt`
- **Change type:** Add
- **Location:** Below the definition of `my-force`.
- **Dependencies:** `my-delay` and `my-force`.

### The New Code

```scheme
(define-syntax stream-cons*
  (syntax-rules ()
    [(_ x s) (cons x (my-delay s))]))

(define (stream-car* s) (car s))
(define (stream-cdr* s) (my-force (cdr s)))
(define the-empty-stream '())
(define (stream-null?* s) (null? s))
```

### The Updated Project

```scheme
// ...unchanged from here up (my-delay, my-force)
// ← new
(define-syntax stream-cons*
  (syntax-rules ()
    [(_ x s) (cons x (my-delay s))]))

(define (stream-car* s) (car s))
(define (stream-cdr* s) (my-force (cdr s)))
(define the-empty-stream '())
(define (stream-null?* s) (null? s))
// ← end new
```
We have built the core API for our custom streams, mirroring the exact structure of Racket's built-in streams but using our own memoized implementation.

### Mechanical walkthrough

- **`define-syntax stream-cons*`** defines a macro for constructing a stream pair. The key insight: `stream-cons*` MUST be a macro (not a function) because the tail `s` must not be evaluated until forced.
- **`[(_ x s) (cons x (my-delay s))]`** rewrites `(stream-cons* x s)` to a standard `cons` pair where the head `x` is evaluated immediately, but the tail `s` is wrapped in `my-delay`.
- **`stream-car*`** is a function that takes a stream `s`.
- **`car s`** retrieves the first element of the pair. Since `stream-cons*` evaluated the head, this is just a standard `car`.
- **`stream-cdr*`** is a function that takes a stream `s`.
- **`my-force (cdr s)`** retrieves the second element of the pair (which is a memoized thunk) and calls `my-force` on it to evaluate the delayed tail.
- **`the-empty-stream`** is a constant set to the empty list `()`.
- **`stream-null?*`** is a function that tests if a stream `s` is the empty stream.
- **`null? s`** relies on standard list behavior since our streams end in the empty list.

---

## Concept Unit: The Sieve of Eratosthenes as a stream

### The Problem

We want to generate prime numbers. The naive approach is to test every number up to $N$ for primality, which is expensive. The **Sieve of Eratosthenes** is a classical algorithm that takes an infinite list of integers starting from 2, takes the first number (which is prime), and filters out all its multiples from the rest of the list. We want to implement this using streams, demonstrating the true power of **lazy evaluation** on infinite data structures.

### Introduce the concept in isolation

Before we do the infinite sieve, let's look at how we build an infinite generator for sequential integers using Racket's built-in streams for clean output.

```scheme
(require racket/stream)

(define (integers-from n)
  (stream-cons n (integers-from (+ n 1))))

(display (stream->list (stream-take (integers-from 2) 5)))
(newline)
```

Output:
```
(2 3 4 5 6)
```

This output proves that `integers-from` generates a conceptually infinite sequence, but `stream-cons` delays the recursion so it doesn't loop forever. `stream-take` forces just the first 5 elements.

### Discard the throwaway example

We will keep `integers-from` for our actual project code, but the `stream-take` print statement is discarded.

### Project Change

- **Reference Source:** SICP Section 3.5.2 "Infinite Streams"
- **Files affected:** `sicp-streams.rkt`
- **Change type:** Add
- **Location:** Below `stream-null?*`.
- **Dependencies:** Racket's built-in `racket/stream` (we will use Racket's built-ins from here for compatibility with `stream->list`).

### The New Code

```scheme
(require racket/stream)  ; use Racket's built-in for clean output

(define (integers-from n)
  (stream-cons n (integers-from (+ n 1))))

(define (sieve s)
  (stream-cons
    (stream-car s)
    (sieve (stream-filter
             (lambda (x) (not (= 0 (modulo x (stream-car s)))))
             (stream-cdr s)))))

(define primes (sieve (integers-from 2)))
```

### The Updated Project

```scheme
// ...unchanged from here up
// ← new
(require racket/stream)

(define (integers-from n)
  (stream-cons n (integers-from (+ n 1))))

(define (sieve s)
  (stream-cons
    (stream-car s)
    (sieve (stream-filter
             (lambda (x) (not (= 0 (modulo x (stream-car s)))))
             (stream-cdr s)))))

(define primes (sieve (integers-from 2)))
// ← end new
```
We have implemented the Sieve of Eratosthenes. `primes` is an infinite stream of all prime numbers, computed lazily.

### Mechanical walkthrough

- **`require racket/stream`** imports Racket's standard stream library. From this point, we use standard `stream-cons`, `stream-car`, and `stream-cdr` for cleaner integration with output functions.
- **`integers-from`** is a function taking an integer `n`.
- **`stream-cons n (integers-from (+ n 1))`** pairs `n` with a delayed recursive call generating `n + 1`. This creates an infinite stream.
- **`sieve`** is a function taking a stream `s`.
- **`stream-cons (stream-car s) ...`** takes the first element of the stream (which is guaranteed to be prime) and makes it the head of our returned prime stream.
- **`sieve (stream-filter ... (stream-cdr s))`** recursively calls `sieve` on the rest of the stream, *after* passing it through a filter.
- **`stream-filter`** takes a predicate function and a stream, returning a new stream omitting elements where the predicate is false.
- **`lambda (x) (not (= 0 (modulo x (stream-car s))))`** is the predicate. It takes a candidate number `x` and checks if it is evenly divisible by `(stream-car s)` (the prime we just found). If the modulo is 0, it is a multiple, and we filter it out.
- **`primes`** defines our top-level stream by calling `sieve` on `(integers-from 2)`.

Execution trace of forcing the first few primes:
```
Call 1: (stream-ref primes 0) -> (stream-car (sieve (integers-from 2)))
Iteration 1: Head of integers-from 2 is 2. sieve returns a stream with head 2. Result is 2.
Call 2: (stream-ref primes 1) -> (stream-car (stream-cdr primes))
Iteration 2: The tail is (sieve (stream-filter [not-div-by-2] (integers-from 3))).
Integers-from 3 yields 3.
Filter checks if 3 mod 2 == 0. False, so 3 passes filter.
sieve takes 3 as the new head. Result is 3.
The new tail is (sieve (stream-filter [not-div-by-3] (stream-filter [not-div-by-2] (integers-from 4)))).
```
Explain the algorithm: start with all integers from 2. The first is prime (2). Filter out all multiples of 2. The first remaining is prime (3). Filter out all multiples of 3. And so on. Each `sieve` call wraps a new filter around the stream. The stream is infinite; each `stream-ref` demands just enough to get the nth prime.

---

## Concept Unit: Streams as state without assignment — the paradigm comparison

### The Problem

SICP presents three paradigms for handling time-varying data (like a bank account balance changing over time):
1. **Objects with assignment**: `(set! balance (- balance amount))` — the account's state changes in place.
2. **Explicit state threading**: pass the state as an argument; return the new state as a result — pure functions, no mutation.
3. **Streams**: represent the entire history of values as a sequence — no mutation, but potentially infinite.

We need to understand how streams offer a way to model state changes *without* using assignment (`set!`), resolving the tension between stateful behavior and referential transparency.

### Introduce the concept in isolation

Let's look at how an account looks when modeled as an infinite sequence of balances, reacting to a stream of withdrawals.

```scheme
(define (make-account-stream balance transactions)
  (if (stream-empty? transactions)
      (stream balance)
      (let ([next-balance (- balance (stream-car transactions))])
        (stream-cons balance
                     (make-account-stream next-balance
                                          (stream-cdr transactions))))))

(define withdrawals (stream 25 50 10))
(define balances (make-account-stream 100 withdrawals))
(display (stream->list balances))
(newline)
```

Output:
```
(100 75 25 15)
```

This output proves that instead of a single `balance` variable mutating in place over time, we have a complete timeline sequence `(100 75 25 15)` representing the entire history of the account.

### Discard the throwaway example

The `make-account-stream` function and our test data will be retained as our project's demonstration of stream-based state architecture. Wait, to follow the schema strictly, the throwaway code itself is discarded. But we are porting this into the project. We will discard the `display` statement.

### Project Change

- **Reference Source:** SICP Section 3.5.5 "Modularity of Functional Programs and Formulation of Time"
- **Files affected:** `sicp-streams.rkt`
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** Racket stream primitives.

### The New Code

```scheme
(define (make-account-stream balance transactions)
  (if (stream-empty? transactions)
      (stream balance)
      (let ([next-balance (- balance (stream-car transactions))])
        (stream-cons balance
                     (make-account-stream next-balance
                                          (stream-cdr transactions))))))

(define withdrawals (stream 25 50 10))
(define balances (make-account-stream 100 withdrawals))
```

### The Updated Project

```scheme
// ...unchanged from here up (primes sieve)
// ← new
(define (make-account-stream balance transactions)
  (if (stream-empty? transactions)
      (stream balance)
      (let ([next-balance (- balance (stream-car transactions))])
        (stream-cons balance
                     (make-account-stream next-balance
                                          (stream-cdr transactions))))))

(define withdrawals (stream 25 50 10))
(define balances (make-account-stream 100 withdrawals))
// ← end new
```
We have implemented a time-varying system (a bank account) purely functionally. Instead of mutating a balance, we produce a stream of all historical balances. No `set!` anywhere. The entire history is explicit.

### Mechanical walkthrough

- **`make-account-stream`** is a function taking an initial `balance` and a stream of `transactions`.
- **`if (stream-empty? transactions)`** checks if there are no more withdrawals.
- **`stream balance`** (in the true branch) returns a stream of just the final balance, ending the timeline.
- **`let ([next-balance (- balance (stream-car transactions))])`** creates a local binding. It subtracts the first transaction (the withdrawal amount) from the current `balance` to compute what the balance *will* be next.
- **`stream-cons balance ...`** outputs the *current* balance as the head of the stream.
- **`make-account-stream next-balance (stream-cdr transactions)`** recursively calls our function with the newly computed balance and the remainder of the transactions. This recursive call is delayed by `stream-cons`.
- **`withdrawals`** is defined as a finite stream of three numbers: 25, 50, and 10.
- **`balances`** is defined by calling `make-account-stream` with an initial balance of 100.

---

## Concept Unit: When to choose each paradigm (the architectural decision)

### The Problem

We now have three distinct paradigms for managing state and time in software. We need to know when an architect chooses one over the others, as this is the foundational insight of SICP Chapter 3.

### Introduce the concept in isolation

This is an architectural abstraction; the "lab" is comparing the shapes of the solutions side-by-side conceptually.
1. `(withdraw 25)` -> mutates a hidden variable.
2. `(withdraw balance 25)` -> returns a new balance, caller must store it.
3. `(make-account-stream 100 transactions)` -> takes the entire future as a stream, returns the entire history as a stream.

These three shapes solve the same problem but place the burden of managing time in different places.

### Discard the throwaway example

The conceptual comparison stands as our mental model.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch summary because we are comparing paradigms at an architectural level.
- **Files affected:** None.
- **Change type:** Conceptual.
- **Location:** N/A.
- **Dependencies:** None.

### The New Code

```scheme
; 1. Objects + assignment
; (set! balance (- balance amount))

; 2. State threading
; (define new-state (process old-state action))

; 3. Streams
; (stream-cons balance (make-account-stream next-balance future-actions))
```

### The Updated Project

```scheme
// Architecture Comparison Reference
; 1. Objects + assignment
; (set! balance (- balance amount))

; 2. State threading
; (define new-state (process old-state action))

; 3. Streams
; (stream-cons balance (make-account-stream next-balance future-actions))
```

### Mechanical walkthrough

- **Objects with assignment**: `(set! balance (- balance amount))` modifies state in place. It is familiar and highly efficient, making it the standard choice for UI, game state, and low-level systems. However, it is hard to reason about and test because the result depends on hidden timing.
- **Explicit state threading**: `(process old-state action)` passes state as an argument and returns it as a result. This relies on pure functions and no mutation. It is testable and composable, making it ideal for business logic and data transformations. The downside is verbosity — state must be threaded manually everywhere.
- **Streams**: `(stream-cons balance ...)` represents the entire history of values as an explicit, lazy sequence. There is no mutation, but time is mapped directly to a data structure. It is best for event logs, simulations, and data pipelines. The downside is that it requires a new mental model and can consume memory if long histories are unnecessarily held onto.

Clojure's answer to this exact architectural dilemma: prefer state threading (pure functions) for the core, use atoms for necessary mutation (controlled assignment) at the boundaries, and use lazy sequences (streams) for data pipelines.

---
Closing: SICP Chapter 3 is complete. The reader now understands three paradigms for managing state: assignment-based objects, pure state threading, and streams. SICP Chapter 4 (Lessons 37–38) builds a Scheme interpreter IN Scheme — the metacircular evaluator. Exercises: SICP 3.50 (stream-map for multiple streams), 3.56 (Hamming numbers: the stream of numbers whose only prime factors are 2, 3, and 5, using merge and stream arithmetic).
