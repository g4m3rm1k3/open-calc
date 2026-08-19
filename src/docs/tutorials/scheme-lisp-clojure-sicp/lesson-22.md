# Lesson 22: Streams — Infinite Lists

In this lesson, we will build infinite data structures using streams — list-like sequences that compute their elements only when demanded. The reader will implement `stream-cons`, `stream-car`, and `stream-cdr` using `delay` and `force`, build infinite streams like the natural numbers and the Fibonacci sequence, and write stream-processing functions like `stream-map`, `stream-filter`, and `stream-take`. The transferable problems this lesson is actually about are: (1) `delay` suspends computation by wrapping an expression in a thunk so it does not run until asked; (2) `force` demands a suspended computation by calling the thunk and caching the result; (3) a stream is a pair whose `cdr` is delayed, meaning only the head is evaluated now while the tail is a promise; (4) infinite data structures become possible when you only compute what you need, completely separating the definition of a sequence from its execution.

**What you need to know first:**
- Lessons 0–21 (all prior concepts through continuations, macros, define-syntax, let, letrec, named let, tail calls, higher-order functions, closures).

**Terms used in this lesson:**
- **eager evaluation** — The standard evaluation strategy where arguments to a function are evaluated before the function is applied, meaning an entire list is built in memory before it can be used.
- **lazy evaluation** — An evaluation strategy that delays the evaluation of an expression until its value is actually needed, preventing unnecessary computation and enabling infinite structures.
- **stream** — A lazy list. Specifically, a pair where the first element is computed immediately (or also delayed, in fully lazy languages), and the rest of the list is a promise to compute the next element only when asked.
- **thunk** — A function of zero arguments, used to delay a computation. By wrapping an expression in `(lambda () ...)`, the expression is not evaluated until the thunk is called.
- **memoization** — An optimization technique where the result of a computation is cached so that subsequent requests for the same computation return the cached result immediately without re-running the code.
- **promise** — A value representing a suspended computation, typically created by `delay` and resolved by `force`.
- **infinite data structure** — A data structure that has no bounds but can be processed because its elements are generated on demand.

**Objects and methods used:**

- **`delay`**
  - *What it is:* A special form (macro) that suspends computation.
  - *Implementation:* `(delay expr)` conceptually becomes a memoized `(lambda () expr)`.
  - *Its use:* We use it to create a promise for the tail of a stream without evaluating it yet.
  - *Type:* Macro (syntax).
  - *Responsibility:* Wraps an expression so it is not immediately evaluated, returning a promise.
  - *Depends on:* An expression to suspend.
  - *Connects to:* It is called by the programmer or by macros like `stream-cons`, and its result is eventually passed to `force`.
  - *Shape:* A primitive macro in Scheme/Racket.

- **`force`**
  - *What it is:* A function that demands the result of a promise.
  - *Implementation:* `(force promise)` calls the underlying thunk if not evaluated, and returns its cached result if already evaluated.
  - *Its use:* We use it to extract the actual value from a delayed expression.
  - *Type:* Function.
  - *Responsibility:* Evaluates a promise once, caches the result, and returns it for all subsequent calls.
  - *Depends on:* A promise object (created by `delay`).
  - *Connects to:* Calls the thunk inside the promise.
  - *Shape:* A standard library function.

- **`stream-cons`**
  - *What it is:* A macro that constructs a stream pair.
  - *Implementation:* `(stream-cons head tail)` evaluates `head` but delays `tail`.
  - *Its use:* We use it to build lazy lists one element at a time.
  - *Type:* Macro.
  - *Responsibility:* Glues a computed value to a delayed computation of the rest of the stream.
  - *Depends on:* A value (head) and an expression (tail).
  - *Connects to:* Uses `delay` under the hood to suspend the tail.
  - *Shape:* Provided by `racket/stream`.

- **`stream-car`**
  - *What it is:* A function that retrieves the first element of a stream.
  - *Implementation:* `(stream-car stream)`
  - *Its use:* We use it to look at the current value of the stream.
  - *Type:* Function.
  - *Responsibility:* Extracts the head of a stream pair.
  - *Depends on:* A valid stream.
  - *Connects to:* Operates on structures built by `stream-cons`.
  - *Shape:* Provided by `racket/stream`.

- **`stream-cdr`**
  - *What it is:* A function that retrieves the rest of the stream.
  - *Implementation:* `(stream-cdr stream)` forces the delayed tail.
  - *Its use:* We use it to advance to the next element of a stream.
  - *Type:* Function.
  - *Responsibility:* Forces the promise in the tail of a stream, computing the next step.
  - *Depends on:* A valid stream.
  - *Connects to:* Uses `force` under the hood to evaluate the suspended tail.
  - *Shape:* Provided by `racket/stream`.

- **`empty-stream`**
  - *What it is:* A constant representing the empty stream.
  - *Implementation:* `'()` equivalent for streams.
  - *Its use:* We use it as the base case for finite streams.
  - *Type:* Constant/Value.
  - *Responsibility:* Signifies the end of a stream.
  - *Depends on:* Nothing.
  - *Connects to:* Checked by `stream-empty?`.
  - *Shape:* Provided by `racket/stream`.

- **`stream-empty?`**
  - *What it is:* A predicate function.
  - *Implementation:* `(stream-empty? s)`
  - *Its use:* We use it to check if a stream has been exhausted.
  - *Type:* Function.
  - *Responsibility:* Returns `#t` if the stream is empty, `#f` otherwise.
  - *Depends on:* A stream.
  - *Connects to:* Used in base cases of recursive stream functions.
  - *Shape:* Provided by `racket/stream`.

- **`stream-ref`**
  - *What it is:* A function to get the nth element of a stream.
  - *Implementation:* `(stream-ref s n)`
  - *Its use:* We use it to peek at a specific index without manifesting the whole list.
  - *Type:* Function.
  - *Responsibility:* Walks down the stream `n` times, forcing each step, to return the nth element.
  - *Depends on:* A stream and an index `n`.
  - *Connects to:* Repeatedly calls `stream-cdr` and then `stream-car`.
  - *Shape:* Provided by `racket/stream`.

- **`cons`**
  - *What it is:* The standard list constructor.
  - *Implementation:* `(cons a b)`
  - *Its use:* We use it to build eager, strict lists from stream elements.
  - *Type:* Function.
  - *Responsibility:* Allocates a pair in memory immediately.
  - *Depends on:* Two values.
  - *Connects to:* Used when converting streams back to normal lists.
  - *Shape:* Built-in function.

- **`zero?`**
  - *What it is:* A numeric predicate.
  - *Implementation:* `(zero? n)`
  - *Its use:* We use it to check if our take-counter has reached 0.
  - *Type:* Function.
  - *Responsibility:* Returns `#t` if `n` is exactly 0.
  - *Depends on:* A number `n`.
  - *Connects to:* Standard arithmetic logic.
  - *Shape:* Built-in function.

---

## Concept Unit: The problem with eager lists

### The Problem

What are we trying to solve, right now, specifically? We want to model mathematical sequences that go on forever, like the set of all natural numbers, without our program crashing or running out of memory. If we try to define a list of infinite length using the list functions we already know, the program will try to evaluate every element before it can return the list. 

### Introduce the concept in isolation

Let's try to define an infinite list using standard eager evaluation. Type this directly into DrRacket:

```scheme
(define nats (cons 0 nats))
```

When you hit run, you get an error that looks like this:

```
nats: undefined;
 cannot use before initialization
```

What this output proves is that eager evaluation computes the whole structure before binding the name. Scheme tries to evaluate `(cons 0 nats)`, but `nats` doesn't exist yet! Even if we used a function to generate it recursively without a base case, it would immediately loop forever and blow the stack. We need a way to tell the language "compute this later, when asked."

### Discard the throwaway example

Delete the `(define nats (cons 0 nats))` code from your editor. It is broken and will not appear in our project again.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are starting our final lesson of Module 2.
- **Files affected:** `streams.rkt` (created)
- **Change type:** add
- **Location:** The entire new file.
- **Dependencies:** None.

### The New Code — type it yourself

```scheme
#lang racket
```

### The Updated Project — return, immediately, before any explanation

```scheme
// ← new
#lang racket
```

This simply establishes that we are writing a Racket program in our new file.

### Mechanical walkthrough — how it works in isolation

- `#lang racket` is a language declaration that tells the DrRacket environment to use the standard Racket language for evaluating this file.

---

## Concept Unit: `delay` and `force`

### The Problem

What are we trying to solve, right now, specifically? We need a language mechanism that can hold onto an expression without running it yet, and then run it on demand — and crucially, run it *only once*, caching the result so we don't repeat expensive work.

### Introduce the concept in isolation

Let's see how Racket provides this capability using two built-in primitives.

```scheme
(define p (delay (begin (display "computing!\n") (+ 1 2))))
; (Nothing is printed yet)

(force p)
; computing!
; 3

(force p)
; 3
```

This output proves two things. First, defining `p` printed nothing, meaning `delay` suspended the computation. This is called a **promise**. Second, the first time we called `force`, it printed "computing!" and evaluated the expression. The second time, it printed nothing and immediately returned 3. This is called **memoization** — the result was cached. 

### Discard the throwaway example

Delete the example definitions of `p` and the `force` calls. They are deleted and will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `streams.rkt` (modified)
- **Change type:** add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code — type it yourself

```scheme
(define my-promise (delay (* 10 10)))
(define result (force my-promise))
```

### The Updated Project — return, immediately, before any explanation

```scheme
#lang racket

(define my-promise (delay (* 10 10))) // ← new
(define result (force my-promise))    // ← new
```

We now have a promise that defers computing `10 * 10`, and a `result` variable that demands that promise be fulfilled immediately.

### Mechanical walkthrough — how it works in isolation

- `delay` is a special form (a macro) that takes an expression and wraps it in a thunk (a zero-argument function) while adding a memoization layer. `(delay expr)` conceptually becomes a memoized `(lambda () expr)`. It returns a promise object instead of evaluating its contents.
- `force` is a function that demands the result of a promise. `(force my-promise)` looks inside the promise object. If it hasn't been evaluated, it runs the suspended expression, saves the value, and returns it. If it has been evaluated before, it simply returns the saved value, avoiding recomputation.

---

## Concept Unit: `stream-cons`, `stream-car`, `stream-cdr`

### The Problem

What are we trying to solve, right now, specifically? We need a way to link values together into a list structure, where the current element is available immediately but the rest of the list is suspended as a promise.

### Introduce the concept in isolation

Racket provides a built-in library for streams.

```scheme
(require racket/stream)
(define s (stream-cons 1 (stream-cons 2 (stream-cons 3 empty-stream))))

(stream-car s)
; 1

(stream-car (stream-cdr s))
; 2

(stream-car (stream-cdr (stream-cdr s)))
; 3
```

What this output proves is that `stream-cons` acts like `cons`, but builds a lazy structure. We can pull elements out one by one using `stream-car` and `stream-cdr`.

### Discard the throwaway example

Delete this isolated list and the element extractions. They are deleted and will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `streams.rkt` (modified)
- **Change type:** replace
- **Location:** Replacing the previous test code at the bottom of the file.
- **Dependencies:** Requires the `racket/stream` module.

### The New Code — type it yourself

```scheme
(require racket/stream)
(define test-stream (stream-cons 1 empty-stream))
```

### The Updated Project — return, immediately, before any explanation

```scheme
#lang racket

(require racket/stream)                           // ← new
(define test-stream (stream-cons 1 empty-stream)) // ← new
```

We bring in Racket's stream library and define a tiny finite stream of exactly one element.

### Mechanical walkthrough — how it works in isolation

- `require` is a module-import mechanism. We use it to pull in `racket/stream`.
- `stream-cons` is a macro that constructs a stream pair. `(stream-cons head tail)` evaluates `head` normally, but wraps `tail` in a `delay` automatically. This is why `stream-cons` must be a macro and not a function — if it were a function, eager evaluation would compute `tail` before `stream-cons` even ran!
- `empty-stream` is a constant representing the end of a stream, much like `'()` represents the empty standard list.

---

## Concept Unit: The infinite stream of natural numbers

### The Problem

What are we trying to solve, right now, specifically? We want to construct an infinite sequence of numbers starting from `n` and counting upwards forever, without causing an infinite loop.

### Introduce the concept in isolation

Because `stream-cons` delays its second argument, a function can call itself to generate the tail of the stream without causing an infinite loop.

```scheme
(define (integers-from n)
  (stream-cons n (integers-from (+ n 1))))

(define nats (integers-from 0))

(stream-car nats)              
; 0
(stream-car (stream-cdr nats)) 
; 1
(stream-ref nats 100)          
; 100
```

What this output proves is that `integers-from` never terminates if forced all at once — but it is never forced all at once. Each `stream-cdr` forces exactly one more element. The stream is potentially infinite; we access it finitely.

### Discard the throwaway example

Delete the isolated definitions of `integers-from` and `nats`. They are deleted and will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `streams.rkt` (modified)
- **Change type:** replace
- **Location:** Replacing the `test-stream` definition.
- **Dependencies:** Requires `racket/stream`.

### The New Code — type it yourself

```scheme
(define (integers-from n)
  (stream-cons n (integers-from (+ n 1))))

(define nats (integers-from 0))
```

### The Updated Project — return, immediately, before any explanation

```scheme
#lang racket
(require racket/stream)

(define (integers-from n)                 // ← new
  (stream-cons n (integers-from (+ n 1))))// ← new
                                          
(define nats (integers-from 0))           // ← new
```

We now have our first truly infinite data structure: the set of all natural numbers starting at 0, generated on demand.

### Mechanical walkthrough — how it works in isolation

- `integers-from` is a function taking a number `n`.
- `stream-cons` builds a pair. Its head is `n`. Its tail is the expression `(integers-from (+ n 1))`, which is suspended inside a promise.
- `nats` is a variable bound to the stream starting at 0.

Let's look at an execution trace of the first two `stream-car` accesses:

```
Step 1: (define nats (integers-from 0))
        nats = (stream-cons 0 <promise:(integers-from 1)>)
Step 2: (stream-car nats) -> returns 0
Step 3: (stream-cdr nats) -> forces the promise!
        evaluates (integers-from 1) -> (stream-cons 1 <promise:(integers-from 2)>)
Step 4: (stream-car (stream-cdr nats)) -> returns 1
```

Because `stream-cons` delays its second argument, `integers-from` returns immediately after doing exactly one addition.

---

## Concept Unit: `stream-take`

### The Problem

What are we trying to solve, right now, specifically? We have an infinite stream, but standard Scheme printing functions will hang forever trying to print it. We need a way to extract a finite number of elements from the front of the stream and convert them back into a standard eager list so we can see them.

### Introduce the concept in isolation

We can write a function that forces the stream `n` times and accumulates the results in standard `cons` cells.

```scheme
(define (stream-take n s)
  (if (or (zero? n) (stream-empty? s))
      '()
      (cons (stream-car s)
            (stream-take (- n 1) (stream-cdr s)))))

(stream-take 5 (integers-from 10))
; '(10 11 12 13 14)
```

What this output proves is that we can pull precisely `n` values from the infinite stream, yielding a normal finite list of 5 elements that can be printed to the screen safely.

### Discard the throwaway example

Delete the isolated `stream-take` code. It is deleted and will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `streams.rkt` (modified)
- **Change type:** add
- **Location:** Below `nats`.
- **Dependencies:** None.

### The New Code — type it yourself

```scheme
(define (stream-take n s)
  (if (or (zero? n) (stream-empty? s))
      '()
      (cons (stream-car s)
            (stream-take (- n 1) (stream-cdr s)))))
```

### The Updated Project — return, immediately, before any explanation

```scheme
#lang racket
(require racket/stream)

(define (integers-from n)
  (stream-cons n (integers-from (+ n 1))))

(define nats (integers-from 0))

(define (stream-take n s)                        // ← new
  (if (or (zero? n) (stream-empty? s))           // ← new
      '()                                        // ← new
      (cons (stream-car s)                       // ← new
            (stream-take (- n 1) (stream-cdr s)))))// ← new
```

We now have a utility function `stream-take` capable of safely dumping `n` items from any stream into a normal printable list.

### Mechanical walkthrough — how it works in isolation

- `stream-take` takes an integer `n` and a stream `s`.
- `zero?` is a numeric predicate that returns `#t` if `n` is exactly 0.
- `stream-empty?` checks if the stream has hit an end.
- `or` checks if either base case condition is met. If so, we return the empty standard list `'()`.
- `cons` is the standard list constructor, returning an eager pair allocated immediately in memory.
- `stream-car` extracts the head of the stream.
- `stream-cdr` forces the tail of the stream to get the rest of it.
- `stream-take` recurses by subtracting 1 from `n` and passing the forced tail.

Execution trace for `(stream-take 3 nats)`:
```
Iteration 1: n=3, s=[0, promise]. zero? is false. 
             cons 0 with (stream-take 2 [1, promise])
Iteration 2: n=2, s=[1, promise]. zero? is false.
             cons 1 with (stream-take 1 [2, promise])
Iteration 3: n=1, s=[2, promise]. zero? is false.
             cons 2 with (stream-take 0 [3, promise])
Iteration 4: n=0, s=[3, promise]. zero? is true! returns '()
Result unwinds: (cons 0 (cons 1 (cons 2 '()))) -> '(0 1 2)
```
Each iteration checks `zero?` and then forces one element out of the stream.

---

## Concept Unit: `stream-map` and `stream-filter`

### The Problem

What are we trying to solve, right now, specifically? We want to manipulate infinite streams the same way we manipulate normal lists (by mapping functions over them or filtering out bad values) without breaking the laziness that keeps the program from hanging.

### Introduce the concept in isolation

We can write `stream-map` and `stream-filter` that return new streams instead of normal lists.

```scheme
(define (stream-map f s)
  (if (stream-empty? s)
      empty-stream
      (stream-cons (f (stream-car s))
                   (stream-map f (stream-cdr s)))))

(define (stream-filter pred? s)
  (cond
    [(stream-empty? s) empty-stream]
    [(pred? (stream-car s))
     (stream-cons (stream-car s)
                  (stream-filter pred? (stream-cdr s)))]
    [else (stream-filter pred? (stream-cdr s))]))

(define squares (stream-map (lambda (x) (* x x)) nats))
(stream-take 5 squares)  
; '(0 1 4 9 16)

(define evens (stream-filter even? nats))
(stream-take 5 evens)    
; '(0 2 4 6 8)
```

What this output proves is that each call to `stream-map` and `stream-filter` returns a *new stream promise*. No massive computation happens up front; computation is strictly driven by `stream-take` pulling from the end of the pipeline.

### Discard the throwaway example

Delete these isolated functions and usage examples. They are deleted and will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `streams.rkt` (modified)
- **Change type:** add
- **Location:** Below `stream-take`.
- **Dependencies:** None.

### The New Code — type it yourself

```scheme
(define (stream-map f s)
  (if (stream-empty? s)
      empty-stream
      (stream-cons (f (stream-car s))
                   (stream-map f (stream-cdr s)))))

(define (stream-filter pred? s)
  (cond
    [(stream-empty? s) empty-stream]
    [(pred? (stream-car s))
     (stream-cons (stream-car s)
                  (stream-filter pred? (stream-cdr s)))]
    [else (stream-filter pred? (stream-cdr s))]))
```

### The Updated Project — return, immediately, before any explanation

```scheme
#lang racket
(require racket/stream)

(define (integers-from n)
  (stream-cons n (integers-from (+ n 1))))

(define nats (integers-from 0))

(define (stream-take n s)
  (if (or (zero? n) (stream-empty? s))
      '()
      (cons (stream-car s)
            (stream-take (- n 1) (stream-cdr s)))))

(define (stream-map f s)                                    // ← new
  (if (stream-empty? s)                                     // ← new
      empty-stream                                          // ← new
      (stream-cons (f (stream-car s))                       // ← new
                   (stream-map f (stream-cdr s)))))         // ← new

(define (stream-filter pred? s)                             // ← new
  (cond                                                     // ← new
    [(stream-empty? s) empty-stream]                        // ← new
    [(pred? (stream-car s))                                 // ← new
     (stream-cons (stream-car s)                            // ← new
                  (stream-filter pred? (stream-cdr s)))]    // ← new
    [else (stream-filter pred? (stream-cdr s))]))           // ← new
```

We now have lazy equivalents for standard list-processing functions, returning infinite transformed streams.

### Mechanical walkthrough — how it works in isolation

- `stream-map` takes a function `f` and a stream `s`.
- `stream-empty?` checks if the sequence is exhausted; if so, we return the constant `empty-stream`.
- `stream-cons` is used to build the result. Its head evaluates `(f (stream-car s))` immediately. Its tail suspends `(stream-map f (stream-cdr s))` as a promise.
- `stream-filter` takes a predicate `pred?` and a stream `s`.
- `cond` handles three states. If empty, return `empty-stream`. If the head passes the predicate, we `stream-cons` the head and delay the recursive filtering of the tail. If the head fails the predicate, we eagerly force the tail and recurse *without* a `stream-cons`, walking down the stream until we find an element that passes the predicate or the stream empties.

Execution trace for `(stream-take 3 (stream-map sq nats))`:
```
Step 1: define squares as (stream-map sq nats).
        returns [sq(0), promise:(stream-map sq [1, promise])]
Step 2: stream-take asks for head. sq(0) = 0.
Step 3: stream-take asks for tail. forces promise!
        evaluates (stream-map sq [1, promise]).
        returns [sq(1), promise:(stream-map sq [2, promise])]
Step 4: stream-take asks for head. sq(1) = 1.
```
Only the specific items demanded are mapped. 

---

## Concept Unit: The Fibonacci stream

### The Problem

What are we trying to solve, right now, specifically? Generating a sequence where the next element depends on the previous two, without recomputing earlier elements recursively, using an infinite lazy stream. 

### Introduce the concept in isolation

We can use a named let loop to hold state and generate Fibonacci numbers on demand.

```scheme
(define fibs
  (let loop ([a 0] [b 1])
    (stream-cons a (loop b (+ a b)))))

(stream-take 10 fibs)  
; '(0 1 1 2 3 5 8 13 21 34)
```

What this output proves is that `fibs` is defined recursively using a named let inside a stream. Each `stream-cdr` forces the next Fibonacci number safely and lazily.

### Discard the throwaway example

Delete the isolated fibonacci stream. It is deleted and will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `streams.rkt` (modified)
- **Change type:** add
- **Location:** Bottom of the file.
- **Dependencies:** None.

### The New Code — type it yourself

```scheme
(define fibs
  (let loop ([a 0] [b 1])
    (stream-cons a (loop b (+ a b)))))
```

### The Updated Project — return, immediately, before any explanation

```scheme
#lang racket
(require racket/stream)

(define (integers-from n)
  (stream-cons n (integers-from (+ n 1))))

(define nats (integers-from 0))

(define (stream-take n s)
  (if (or (zero? n) (stream-empty? s))
      '()
      (cons (stream-car s)
            (stream-take (- n 1) (stream-cdr s)))))

(define (stream-map f s)
  (if (stream-empty? s)
      empty-stream
      (stream-cons (f (stream-car s))
                   (stream-map f (stream-cdr s)))))

(define (stream-filter pred? s)
  (cond
    [(stream-empty? s) empty-stream]
    [(pred? (stream-car s))
     (stream-cons (stream-car s)
                  (stream-filter pred? (stream-cdr s)))]
    [else (stream-filter pred? (stream-cdr s))]))

(define fibs                                     // ← new
  (let loop ([a 0] [b 1])                        // ← new
    (stream-cons a (loop b (+ a b)))))           // ← new
```

We add the infinite Fibonacci sequence to our file, showing stateful generation.

### Mechanical walkthrough — how it works in isolation

- `fibs` is defined as the result of a named let loop.
- `let loop ([a 0] [b 1])` binds `a` to 0 and `b` to 1 initially, creating a recursive function `loop` that can be called with new values.
- `stream-cons` immediately yields `a` (which is 0). It then suspends `(loop b (+ a b))` as a promise.
- `+` computes the sum for the next step.
- When the tail is forced by `stream-cdr`, it runs `(loop 1 1)`, returning a stream whose head is 1 and whose tail suspends `(loop 1 2)`.

Execution trace of the first 4 elements:
```
Iteration 1: loop(0, 1) -> yields 0, promises loop(1, 1)
Iteration 2: force tail -> runs loop(1, 1). yields 1, promises loop(1, 2)
Iteration 3: force tail -> runs loop(1, 2). yields 1, promises loop(2, 3)
Iteration 4: force tail -> runs loop(2, 3). yields 2, promises loop(3, 5)
```
Every force computes exactly one new term in the sequence.

---

## Conclusion

This is the end of Module 2. Let's summarize what the reader now has:
- `let` / `letrec` / named `let` for local binding and looping.
- Tail-call optimization for safe deep recursion.
- `call/cc` for advanced control flow and non-local exits.
- Macros (`define-syntax`) for language extension and syntax rewriting.
- Streams (`delay`, `force`, `stream-cons`) for lazy infinite data.

Module 3 introduces a completely different programming model — logic programming with miniKanren — where instead of writing functions that *compute* answers, you write *relations* that *describe* them.

**Exercises:**
1. Write a `stream-zip` function that zips two streams together into a stream of pairs.
2. Implement `sieve`, the Sieve of Eratosthenes, generating an infinite stream of prime numbers using `stream-filter`.
