# Lesson 29: SICP Chapter 1 — Recursion vs Iteration — The Process Shape

What you will build
In this lesson, you will build and analyze three different implementations of the Fibonacci sequence to explore SICP's deep analysis of recursive vs iterative *processes*. The transferable problem is understanding the shape of the computation — the process — rather than the shape of the code: a recursive procedure can generate either a recursive process that grows the call stack, or an iterative process that maintains constant state. You will see how tree recursion defaults to exponential time and how memoization fixes it, using big-O notation to reason about process costs.

What you need to know first
- Lessons 0–28 (all prior concepts through higher-order procedures, fixed-point, tail calls, the call stack, accumulators, named let).

Terms used in this lesson
- **Recursive procedure** — A procedure that calls itself in its definition. It exists to express looping or self-similar logic in functional programming without mutating state variables.
- **Recursive process** — A process characterized by a chain of deferred operations. It exists to compute things by breaking them down, but it requires memory to track the chain, thus growing the call stack.
- **Iterative process** — A process whose state can be summarized by a fixed number of state variables. It exists to run loops in constant space, avoiding stack overflow by carrying all necessary state forward.
- **Tree recursion** — A process where a procedure calls itself more than once per activation. It exists to naturally express branching algorithms (like traversing trees or computing recurrence relations), but it causes exponential time complexity if subproblems overlap.
- **Big-O notation** — A mathematical vocabulary for describing how resource needs (time and space) grow as input size grows. It exists so engineers can compare algorithms abstractly without depending on specific hardware speed.
- **Call stack** — The memory structure that tracks active procedure calls and their deferred operations. It exists to let programs unwind correctly after branching into subroutines.
- **Memoization** — Caching the results of expensive function calls. It exists to turn exponential tree-recursive processes into linear ones by ensuring each unique subproblem is solved only once (a core idea of dynamic programming).
- **`define`** — The syntactic keyword to bind a name to a value or procedure in the current environment. It exists to let us give names to abstractions.
- **`if` / `cond`** — Conditional branching keywords. They exist to let procedures make decisions and stop recursion.
- **`let`** — A keyword to create local lexical bindings. It exists to temporarily name intermediate values without cluttering the global environment.
- **`=` / `>` / `<` / `+` / `-` / `*`** — Standard arithmetic and comparison operators.

Objects and methods used

**`make-hash`**
- *What it is:* A mutable hash table constructor.
- *Implementation:* `(make-hash)` returns a new, empty mutable hash table.
- *Its use:* We use it to create the `memo-table` cache to store computed Fibonacci numbers.
- *Type:* Built-in procedure.
- *Responsibility:* Instantiates and returns an empty dictionary structure capable of fast lookups.
- *Depends on:* Nothing (when called with no arguments).
- *Connects to:* Called by our script, returned to the global environment to be bound.
- *Shape:* A standard library data structure constructor.

**`hash-has-key?`**
- *What it is:* A predicate to check if a key exists in a hash table.
- *Implementation:* `(hash-has-key? hash key)` returning a boolean.
- *Its use:* We use it to check if we've already computed a Fibonacci number before doing expensive recursive calls.
- *Type:* Built-in procedure.
- *Responsibility:* Queries the dictionary safely without extracting a value or failing on missing keys.
- *Depends on:* A hash table instance and a key to search for.
- *Connects to:* Receives the hash table and key, returns a boolean to a `cond` clause.
- *Shape:* Standard library accessor.

**`hash-ref`**
- *What it is:* Retrieves a value from a hash table by key.
- *Implementation:* `(hash-ref hash key)` returning the stored value.
- *Its use:* We use it to pull the cached Fibonacci number out of `memo-table` when `hash-has-key?` is true.
- *Type:* Built-in procedure.
- *Responsibility:* Looks up and returns the stored value for the given key.
- *Depends on:* A hash table instance and a key that exists.
- *Connects to:* Receives the hash and key, returns the cached result to the caller.
- *Shape:* Standard library accessor.

**`hash-set!`**
- *What it is:* Mutates a hash table by adding or updating a key-value pair.
- *Implementation:* `(hash-set! hash key value)`.
- *Its use:* We use it to store newly computed Fibonacci numbers into `memo-table` so future calls can find them.
- *Type:* Built-in procedure.
- *Responsibility:* Modifies the underlying dictionary structure in-place.
- *Depends on:* A hash table instance, a key, and a value.
- *Connects to:* Modifies the hash table.
- *Shape:* Standard library mutator.

---

## Concept Unit: Linear recursive process vs linear iterative process

### The Problem
We need to understand SICP's foundational distinction: the shape of a procedure (the code we write) is not the same as the shape of the process (the execution it generates). If we write a procedure that calls itself, it is a recursive procedure. But does it generate a recursive process (where memory grows) or an iterative process (where memory is constant)?

### Introduce the concept in isolation
Let's build a simple factorial procedure to see the call stack grow.

```scheme
(define (fact-throwaway n)
  (if (= n 0)
      1
      (* n (fact-throwaway (- n 1)))))

(fact-throwaway 4)
```
Output: `24`

This works, but it hides the shape. The operation `*` is deferred until `fact-throwaway` returns. This is called a **recursive process**.

### Discard the throwaway example
We delete `fact-throwaway`. It will not be used in the final project.

### Project Change
- **Reference Source:** SICP Section 1.2.1.
- **Files affected:** `factorial.rkt` (new file)
- **Change type:** Add.
- **Location:** Brand-new file.
- **Dependencies:** Standard Racket environment.

### The New Code
```scheme
; Linear recursive process:
(define (fact-recursive n)
  (if (= n 0)
      1
      (* n (fact-recursive (- n 1)))))

; Linear iterative process (tail-recursive procedure):
(define (fact-iter n)
  (define (iter product counter)
    (if (> counter n)
        product
        (iter (* counter product) (+ counter 1))))
  (iter 1 1))
```

### The Updated Project
Because this is a brand-new file, the code above represents the entirety of `factorial.rkt`. It contains two ways to compute a factorial: one using deferred operations and one using an accumulator loop.

### Mechanical walkthrough
- `(define (fact-recursive n))` defines the first procedure.
- `(if (= n 0) 1` handles the base case.
- `(* n (fact-recursive (- n 1)))` is the recursive step. Notice that `*` cannot evaluate until the recursive call returns. This deferred operation is what makes this a recursive process.
- `(define (fact-iter n))` defines the second procedure.
- `(define (iter product counter))` defines a helper inside it.
- `(if (> counter n) product` is the base case, returning the accumulated `product`.
- `(iter (* counter product) (+ counter 1))` is the recursive step. Notice that `iter` is called directly, with no surrounding operations waiting on it. This makes it a tail call, meaning it generates an iterative process.
- `(iter 1 1)` kickstarts the loop.

### Execution trace
Let's trace `(fact-recursive 4)`:
1. `(fact-recursive 4)` — defers `(* 4 (fact-recursive 3))`.
2. `(fact-recursive 3)` — defers `(* 3 (fact-recursive 2))`.
3. `(fact-recursive 2)` — defers `(* 2 (fact-recursive 1))`.
4. `(fact-recursive 1)` — defers `(* 1 (fact-recursive 0))`.
5. `(fact-recursive 0)` — returns `1`.
6. Unwind: `(* 1 1)` -> `1`.
7. Unwind: `(* 2 1)` -> `2`.
8. Unwind: `(* 3 2)` -> `6`.
9. Unwind: `(* 4 6)` -> `24`.

Now trace `(fact-iter 4)`:
1. `(iter 1 1)` — counter is not > 4, call `(iter (* 1 1) (+ 1 1))`.
2. `(iter 1 2)` — counter is not > 4, call `(iter (* 2 1) (+ 2 1))`.
3. `(iter 2 3)` — counter is not > 4, call `(iter (* 3 2) (+ 3 1))`.
4. `(iter 6 4)` — counter is not > 4, call `(iter (* 4 6) (+ 4 1))`.
5. `(iter 24 5)` — counter > 4, returns `24`.

### CS lens
Both are recursive *procedures*, but they generate different *processes*. The first grows the call stack (linear space). The second carries state in variables and operates in constant space.

### SE lens
Engineers prefer iterative processes for deep loops because they avoid stack overflow. Racket guarantees that tail-recursive procedures run in constant space. If we did not have this, we would have to rewrite this using a `while` loop construct in languages like C or Java to avoid crashing.

### Commands needed
None.

### Run it. Show the real output
```scheme
(fact-recursive 6)
(fact-iter 6)
```
Output:
```
720
720
```

### One sentence connecting this unit to what came immediately before.
Having seen linear processes, we now need a vocabulary to formalize how their resource usage grows.

---

## Concept Unit: Big-O notation

### The Problem
We know `fact-recursive` uses more memory than `fact-iter`, but saying "more memory" is imprecise. We need a mathematical vocabulary to describe process cost.

### Introduce the concept in isolation
No code for this lab — big-O is a mathematical notation, not a syntax feature. 

### Discard the throwaway example
N/A.

### Project Change
- **Reference Source:** SICP 1.2.3.
- **Files affected:** None (conceptual).
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** N/A.

### The New Code
```text
O(n): linear
O(n^2): quadratic
O(2^n): exponential
O(log n): logarithmic
O(1): constant
```

### The Updated Project
N/A.

### Mechanical walkthrough
- `O(n)` means doubling the input doubles the work. `fact-recursive` takes O(n) time and O(n) space.
- `O(n^2)` means doubling the input quadruples the work.
- `O(2^n)` means adding 1 to the input doubles the work.
- `O(log n)` means doubling the input adds a constant amount of work.
- `O(1)` means the cost is constant. `fact-iter` takes O(n) time and O(1) space.

### CS lens
This is **Big-O notation**, the vocabulary for process cost. Also recognized in: database query optimization, algorithm analysis, network routing algorithms.

### SE lens
Engineers use big-O to ensure a system will scale before writing code. An O(n^2) algorithm is fine for 10 items, but disastrous for a million. We use this to choose data structures up front.

### Commands needed
None.

### Run it. Show the real output
N/A.

### One sentence connecting this unit to what came immediately before.
With big-O in hand, we can analyze a process that naturally grows exponentially: Fibonacci.

---

## Concept Unit: Tree recursive process

### The Problem
The Fibonacci sequence (0, 1, 1, 2, 3, 5, 8...) is defined as the sum of the two preceding numbers. If we translate this directly to code, it calls itself twice. We need to measure how bad this gets.

### Introduce the concept in isolation
Let's build a quick throwaway to sum simple branches.
```scheme
(define (branch-throwaway n)
  (if (< n 2)
      1
      (+ (branch-throwaway (- n 1)) (branch-throwaway (- n 2)))))
(branch-throwaway 3)
```
Output: `3`.
This proves that a procedure can make multiple recursive calls in one expression. This is called **tree recursion**.

### Discard the throwaway example
We delete `branch-throwaway`.

### Project Change
- **Reference Source:** SICP 1.2.2.
- **Files affected:** `fibonacci.rkt` (new file)
- **Change type:** Add.
- **Location:** Brand-new file.
- **Dependencies:** None.

### The New Code
```scheme
(define (fib-tree n)
  (cond
    [(= n 0) 0]
    [(= n 1) 1]
    [else (+ (fib-tree (- n 1))
             (fib-tree (- n 2)))]))
```

### The Updated Project
This is the new `fibonacci.rkt` file. It defines the tree-recursive version of Fibonacci.

### Mechanical walkthrough
- `(define (fib-tree n))` starts the definition.
- `(cond` opens conditional branches.
- `[(= n 0) 0]` and `[(= n 1) 1]` are base cases.
- `[else (+ (fib-tree (- n 1)) (fib-tree (- n 2)))]` evaluates the two recursive calls, waits for both to return, and sums them. Because it branches twice per step, it spawns a tree of calls.

### Execution trace
Tracing `(fib-tree 4)`:
1. `(fib-tree 4)` branches into `(fib-tree 3)` and `(fib-tree 2)`.
2. `(fib-tree 3)` branches into `(fib-tree 2)` and `(fib-tree 1)`.
3. Notice that `(fib-tree 2)` is being computed multiple times independently.

### CS lens
This shape is a **tree recursive process**. Time complexity is O(phi^n) where phi is ~1.618 (exponential). Space is O(n) because the max depth of the call stack is n.

### SE lens
Tree recursion is elegant for tree traversal, but disastrous for overlapping subproblems. The overlapping work causes exponential slowdown. The cost is high latency and CPU burn for `n > 30`.

### Commands needed
None.

### Run it. Show the real output
```scheme
(fib-tree 10)
(fib-tree 30)
```
Output:
```
55
832040
```
*(Noticeably slow for 30)*

### One sentence connecting this unit to what came immediately before.
Since tree recursion is exponentially slow, we can optimize it using an iterative process instead.

---

## Concept Unit: Linear iterative Fibonacci

### The Problem
We need to compute Fibonacci in O(n) time, meaning we must avoid computing the same state multiple times. We can do this by tracking only the current and next values.

### Introduce the concept in isolation
Let's build a loop that shifts variables.
```scheme
(define (shift-throwaway a b n)
  (if (= n 0)
      a
      (shift-throwaway b (+ a b) (- n 1))))
(shift-throwaway 0 1 5)
```
Output: `5`.
This shifts values forward linearly. This is an **iterative process**.

### Discard the throwaway example
Delete `shift-throwaway`.

### Project Change
- **Reference Source:** SICP 1.2.2.
- **Files affected:** `fibonacci.rkt`
- **Change type:** Add.
- **Location:** Below `fib-tree`.
- **Dependencies:** None.

### The New Code
```scheme
(define (fib-iter n)
  (define (iter a b count)
    (if (= count 0)
        b
        (iter (+ a b) a (- count 1))))
  (iter 1 0 n))
```

### The Updated Project
```scheme
(define (fib-tree n)
  ; ...
  )

// ← new
(define (fib-iter n)
  (define (iter a b count)
    (if (= count 0)
        b
        (iter (+ a b) a (- count 1))))
  (iter 1 0 n))
```
This adds the iterative version, calculating Fibonacci without a growing stack.

### Mechanical walkthrough
- `(define (fib-iter n))` takes the target index.
- `(define (iter a b count))` takes two accumulators (`a` for next, `b` for current) and a countdown.
- `(if (= count 0) b` returns the current number when the countdown is done.
- `(iter (+ a b) a (- count 1))` calls itself tail-recursively. The new `a` is `a+b`, the new `b` is the old `a`.
- `(iter 1 0 n)` starts with F(1)=1 and F(0)=0.

### Execution trace
For `(fib-iter 5)`:
1. `iter 1 0 5` — count=5, calls `iter (+ 1 0) 1 (- 5 1)`.
2. `iter 1 1 4` — count=4, calls `iter (+ 1 1) 1 (- 4 1)`.
3. `iter 2 1 3` — count=3, calls `iter (+ 2 1) 2 (- 3 1)`.
4. `iter 3 2 2` — count=2, calls `iter (+ 3 2) 3 (- 2 1)`.
5. `iter 5 3 1` — count=1, calls `iter (+ 5 3) 5 (- 1 1)`.
6. `iter 8 5 0` — count=0, returns `b`, which is `5`.

### CS lens
This process runs in O(n) time and O(1) space. 

### SE lens
By manually modeling the state transitions (`a` and `b`), we transformed an O(phi^n) algorithm into an O(n) algorithm. The tradeoff is that the code is slightly less mathematically pure than the tree definition, but it is vastly more efficient.

### Commands needed
None.

### Run it. Show the real output
```scheme
(fib-iter 10)
(fib-iter 100)
```
Output:
```
55
354224848179261915075
```
*(Instant!)*

### One sentence connecting this unit to what came immediately before.
Iteration solved the performance issue by changing the code shape, but what if we want to keep the clean tree-recursive code shape while getting linear performance?

---

## Concept Unit: Memoized Fibonacci

### The Problem
We like the readable structure of `fib-tree`, but hate its exponential cost. We need a way to solve each unique subproblem only once, caching the results for future lookups.

### Introduce the concept in isolation
Let's see how a mutable hash works.
```scheme
(define h-throwaway (make-hash))
(hash-set! h-throwaway 42 "answer")
(hash-ref h-throwaway 42)
```
Output: `"answer"`.
This proves we can store and retrieve data globally. We call this caching, and in recursion, it's called **memoization**.

### Discard the throwaway example
Delete `h-throwaway`.

### Project Change
- **Reference Source:** SICP 3.3.3 (Forward reference for hash usage applied to 1.2.2 problem).
- **Files affected:** `fibonacci.rkt`
- **Change type:** Add.
- **Location:** Bottom of file.
- **Dependencies:** `make-hash`, `hash-set!`, `hash-ref`, `hash-has-key?`.

### The New Code
```scheme
(define memo-table (make-hash))

(define (fib-memo n)
  (cond
    [(hash-has-key? memo-table n) (hash-ref memo-table n)]
    [else
     (let ([result (if (< n 2)
                       n
                       (+ (fib-memo (- n 1)) (fib-memo (- n 2))))])
       (hash-set! memo-table n result)
       result)]))
```

### The Updated Project
```scheme
// ... previous fib-iter unchanged
// ← new
(define memo-table (make-hash))

(define (fib-memo n)
  (cond
    [(hash-has-key? memo-table n) (hash-ref memo-table n)]
    [else
     (let ([result (if (< n 2)
                       n
                       (+ (fib-memo (- n 1)) (fib-memo (- n 2))))])
       (hash-set! memo-table n result)
       result)]))
```
This adds a globally scoped hash table and a new Fibonacci function that consults it.

### Mechanical walkthrough
- `(define memo-table (make-hash))` creates a mutable hash table in the global environment.
- `(cond` opens our cases.
- `[(hash-has-key? memo-table n)` checks if we have seen this `n` before.
- `(hash-ref memo-table n)]` returns the cached value if found, skipping the recursion entirely.
- `[else` catches uncomputed numbers.
- `(let ([result ...])` evaluates the Fibonacci logic and binds the answer to a local variable `result`.
- `(hash-set! memo-table n result)` mutates the hash table, saving the answer for next time.
- `result)` returns the computed answer to the caller.

### CS lens
This is **Memoization**, a core component of Dynamic Programming. We reduced time complexity to O(n), trading space complexity to O(n) for the cache. Also recognized in: React `useMemo`, web caching layers, DNS resolvers.

### SE lens
Memoization decouples performance from algorithm shape. The code still reads like the mathematical definition, but acts like the iterative version. The tradeoff is state management: we introduced a global mutable variable, which makes testing and concurrency harder.

### Commands needed
None.

### Run it. Show the real output
```scheme
(fib-memo 100)
```
Output:
```
354224848179261915075
```
*(Instant, despite being tree-recursive!)*

### One sentence connecting this unit to what came immediately before.
We now have three shapes (recursive, iterative, memoized), leading us to SICP's formal table of growth.

---

## Concept Unit: SICP's orders of growth

### The Problem
We need to summarize the different process shapes we just built so we can use them as a vocabulary for future algorithms.

### Introduce the concept in isolation
N/A, this is a conceptual summary.

### Discard the throwaway example
N/A.

### Project Change
- **Reference Source:** SICP 1.2.3.
- **Files affected:** None.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** N/A.

### The New Code
| Process shape | Time | Space | Example |
|---|---|---|---|
| Linear recursion | O(n) | O(n) | fact-recursive |
| Linear iteration | O(n) | O(1) | fact-iter |
| Tree recursion | O(phi^n) | O(n) | fib-tree |
| Memoized tree rec. | O(n) | O(n) | fib-memo |

### The Updated Project
N/A.

### Mechanical walkthrough
- **Linear recursion** grows the stack, taking O(n) space.
- **Linear iteration** runs in constant space O(1).
- **Tree recursion** branches exponentially, costing O(phi^n) time.
- **Memoized tree recursion** pays O(n) space for the cache to bring time down to O(n).

### CS lens
The goal when designing a process is to understand *which shape* it has, and whether that shape is acceptable for the expected input sizes.

### SE lens
Understanding these shapes is why you study algorithms. You can solve a problem in O(phi^n) in five minutes, but it will bring production down. Recognizing the shape lets you choose iteration or memoization *before* an outage happens.

### Commands needed
None.

### Run it. Show the real output
N/A.

### One sentence connecting this unit to what came immediately before.
With a complete understanding of process shapes, our coverage of SICP Chapter 1 is finished.

---

## Closing

### Connect the pieces
A target `n = 100` passed into `fib-tree` would freeze your machine due to O(phi^n) branching. That same `n = 100` in `fib-iter` glides through a loop maintaining just two variables in O(1) space. And in `fib-memo`, it recurses 100 times, caching each answer in `memo-table`, transforming an exponential problem into a linear O(n) sweep through the hash. The process shape, not the syntax, determined the runtime.

### What breaks without this
Without memoization, passing large values to a tree-recursive procedure crashes.
```scheme
(fib-tree 100) ; => hangs indefinitely, exhausting CPU
```

### Exercises
- SICP Exercise 1.11: Compute a function defined by a recurrence relation `f(n) = f(n-1) + 2f(n-2) + 3f(n-3)`, using both a recursive and iterative process.
- SICP Exercise 1.22: Write a timed prime test to observe O(sqrt(n)) behavior.

### Definition of done
- [x] Implemented recursive and iterative factorial.
- [x] Analyzed big-O orders of growth.
- [x] Implemented tree-recursive, iterative, and memoized Fibonacci.
- [x] Verified memoization yields O(n) time for tree structures.

```bash
git commit -m "Analyze SICP process shapes and big-O growth rates"
```
