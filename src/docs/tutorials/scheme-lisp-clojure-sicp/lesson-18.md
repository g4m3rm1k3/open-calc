# Lesson 18: Tail Calls — Why Some Recursion Doesn't Blow the Stack

The reader will understand tail-call optimization (TCO) — what a tail call is, why Scheme guarantees to optimize it, and how to transform any recursive function into a tail-recursive one using an accumulator. They will write tail-recursive and non-tail-recursive versions of the same functions and observe the difference. The transferable problems: (1) a tail call is when a function call is the very last thing a function does before returning — there is nothing waiting for its return value; (2) TCO means Scheme reuses the current stack frame for a tail call instead of pushing a new one, making tail recursion as space-efficient as a while loop; (3) not all recursive calls are tail calls — recognizing the difference is a skill that matters in every recursive language.

**What you need to know first:** Lessons 0–17 (all prior concepts through let, let*, letrec, named let, accumulators, my-reverse, the call stack from Lesson 5).

**Terms used in this lesson:**
- **Tail-call optimization (TCO)** — The guarantee that a tail call will not push a new stack frame, preventing stack overflow during recursion. It exists to make functional loops safe.
- **Tail call** — A function call that happens as the absolute last action in its caller, with no pending operations waiting for its return value. It exists so the runtime knows it can safely discard or reuse the caller's stack frame.
- **Stack frame** — A block of memory allocated for a single function execution, holding its local variables, arguments, and return address. It exists so a function can keep its own state separate from its caller's state.
- **Accumulator** — An extra parameter passed along during recursion that builds up the final result step by step. It exists to turn operations that would otherwise be pending after a recursive return into eager computations done on the way down.
- **`if`** — A special form that conditionally evaluates its consequent or alternative. It exists to allow branching control flow without eagerly evaluating all possible branches.
- **`cond`** — A special form for multi-way branching. It exists to replace deeply nested `if` expressions with a flat list of test-result clauses.
- **`let`** — A special form that binds names to values within a local scope. It exists so intermediate results can be computed once, named, and reused safely without polluting the global environment.
- **`begin`** — A special form that evaluates a sequence of expressions in order and returns the value of the last one. It exists to allow side-effects in places where only a single expression is syntactically allowed.
- **Named let** — A variation of `let` that binds a name to the local block, allowing it to be called recursively. It exists as idiomatic Scheme syntax for writing loops without needing a separate `define`.

**Objects and methods used:**

- **`sum-nt`**
  - *What it is:* A non-tail-recursive function to sum a list of numbers.
  - *Implementation:* `(define (sum-nt lst))` returning a number.
  - *Its use:* To demonstrate a function that leaves an addition operation pending after its recursive call.
  - *Type:* A top-level recursive procedure.
  - *Responsibility:* Computes the sum of a list by building a chain of deferred additions.
  - *Depends on:* A list of numbers.
  - *Connects to:* Calls `null?`, `+`, `car`, `cdr`, and itself.
  - *Shape:* A lesson subject function used to illustrate stack frame buildup.

- **`sum-tr`**
  - *What it is:* A tail-recursive function to sum a list of numbers.
  - *Implementation:* `(define (sum-tr lst acc))` returning a number.
  - *Its use:* To demonstrate a function that uses an accumulator to avoid pending operations.
  - *Type:* A top-level recursive procedure.
  - *Responsibility:* Computes the sum of a list by accumulating the total on the way down the call chain.
  - *Depends on:* A list of numbers and an initial accumulator value (0).
  - *Connects to:* Calls `null?`, `+`, `car`, `cdr`, and itself.
  - *Shape:* A lesson subject function used to illustrate tail-call optimization.

- **`length-nt`**
  - *What it is:* A non-tail-recursive list length function.
  - *Implementation:* `(define (length-nt lst))` returning an integer.
  - *Its use:* To show another common pattern that is not tail-recursive by default.
  - *Type:* A top-level recursive procedure.
  - *Responsibility:* Counts elements by building a chain of deferred `+ 1` operations.
  - *Depends on:* A list.
  - *Connects to:* Calls `null?`, `+`, `cdr`, and itself.
  - *Shape:* A lesson subject function.

- **`length-tr`**
  - *What it is:* A tail-recursive list length function.
  - *Implementation:* `(define (length-tr lst))` returning an integer, implemented internally with a named let loop.
  - *Its use:* To show how to transform a non-tail-recursive function into a tail-recursive one using an accumulator loop.
  - *Type:* A top-level procedure.
  - *Responsibility:* Counts elements using an internal accumulator.
  - *Depends on:* A list.
  - *Connects to:* Calls `null?`, `+`, `cdr`, and a named let.
  - *Shape:* A lesson subject function.

- **`tree-sum`**
  - *What it is:* A recursive function that sums leaves in a nested tree structure.
  - *Implementation:* `(define (tree-sum tree))` returning a number.
  - *Its use:* To demonstrate that not all recursive structures can be straightforwardly flattened into a single tail call.
  - *Type:* A top-level recursive procedure.
  - *Responsibility:* Traverses both car and cdr branches of pairs, summing numbers.
  - *Depends on:* A pair tree containing numbers at the leaves.
  - *Connects to:* Calls `pair?`, `not`, `+`, `car`, `cdr`, and itself twice per pair.
  - *Shape:* A lesson subject function demonstrating limits of simple accumulators.

**Everything else in the file, not this lesson's subject but still explained:**

- **`+`**
  - *What it is:* The standard Scheme addition procedure.
  - *Implementation:* Built-in procedure `(+)` returning a number.
  - *Its use:* To compute sums and increment counters.
  - *Type:* Built-in procedure.
  - *Responsibility:* Returns the arithmetic sum of its arguments.
  - *Depends on:* Numeric arguments.
  - *Connects to:* Called by our summing functions.
  - *Shape:* A mathematical operation.

- **`null?`**
  - *What it is:* The standard list-emptiness predicate.
  - *Implementation:* Built-in procedure `(null? obj)` returning a boolean.
  - *Its use:* To identify the base case of list recursion.
  - *Type:* Built-in procedure.
  - *Responsibility:* Returns `#t` only if its argument is the empty list `()`.
  - *Depends on:* Any Scheme object.
  - *Connects to:* Called by our recursive base cases.
  - *Shape:* A primitive predicate.

- **`car`**
  - *What it is:* The standard head accessor for pairs.
  - *Implementation:* Built-in procedure `(car pair)` returning the first element.
  - *Its use:* To get the current item being processed in a list or tree.
  - *Type:* Built-in procedure.
  - *Responsibility:* Extracts the first part of a pair.
  - *Depends on:* A non-empty pair.
  - *Connects to:* Called by our list traversal logic.
  - *Shape:* A primitive accessor.

- **`cdr`**
  - *What it is:* The standard tail accessor for pairs.
  - *Implementation:* Built-in procedure `(cdr pair)` returning the second element.
  - *Its use:* To get the remainder of the list to recurse on.
  - *Type:* Built-in procedure.
  - *Responsibility:* Extracts the second part of a pair.
  - *Depends on:* A non-empty pair.
  - *Connects to:* Called by our list traversal logic.
  - *Shape:* A primitive accessor.

- **`pair?`**
  - *What it is:* The standard pair predicate.
  - *Implementation:* Built-in procedure `(pair? obj)` returning a boolean.
  - *Its use:* To distinguish between leaf nodes and internal tree nodes.
  - *Type:* Built-in procedure.
  - *Responsibility:* Returns `#t` if the argument is a cons cell.
  - *Depends on:* Any Scheme object.
  - *Connects to:* Called by `tree-sum`.
  - *Shape:* A primitive predicate.

- **`not`**
  - *What it is:* The standard boolean negation procedure.
  - *Implementation:* Built-in procedure `(not obj)` returning a boolean.
  - *Its use:* To invert the result of a predicate like `pair?`.
  - *Type:* Built-in procedure.
  - *Responsibility:* Returns `#t` if its argument is `#f`, and `#f` otherwise.
  - *Depends on:* A boolean value.
  - *Connects to:* Called by `tree-sum` to check for non-pairs.
  - *Shape:* A logical operator.

---

## Concept Unit: The call stack, revisited

### 1. The Problem
When a recursive function calls itself, it must remember where to return so it can finish any remaining work. We saw this in Lesson 5: every function call pushes a new "stack frame" containing local variables and the "pending computation". For lists with millions of elements, accumulating millions of stack frames causes a stack overflow crash.

### 2. Introduce the concept in isolation
Let's see what it looks like to leave an operation pending.
```scheme
(define (add-later x)
  (+ 5 (let ()
         (display "Waiting to return...\n")
         x)))

(add-later 10)
```

**Real output:**
```
Waiting to return...
15
```
This output proves that the `+ 5` operation is placed on hold; the inner block executes first, and only when it returns its value (`10`) does the outer addition finally execute. The addition is "pending".

### 3. Discard the throwaway example
The `add-later` example is deleted and will not appear in the project again.

### 4. Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating fundamental recursion mechanics.
- **Files affected:** `lesson-18.scm` (created)
- **Change type:** add
- **Location:** top of file
- **Dependencies:** None

### 5. The New Code
```scheme
(define (sum-nt lst)
  (if (null? lst)
      0
      (+ (car lst) (sum-nt (cdr lst)))))
```

### 6. The Updated Project
```scheme
// ← new
(define (sum-nt lst)
  (if (null? lst)
      0
      (+ (car lst) (sum-nt (cdr lst)))))
```
This is a standard list processing function that sums all numeric elements in `lst`. It does this by adding the first element to the result of summing the rest.

### 7. Mechanical walkthrough
- `(define (sum-nt lst))` — defines a new procedure `sum-nt` taking one argument `lst`.
- `(if (null? lst)` — checks if the list is empty, which is the base case.
- `0` — if the list is empty, returns the sum 0.
- `(+ (car lst) (sum-nt (cdr lst)))` — otherwise, it extracts the first element `(car lst)` and adds it to the result of recursively calling `sum-nt` on the rest of the list `(cdr lst)`. The crucial point is that the `+` operation cannot complete until `sum-nt` returns. The addition is left pending.

**Execution trace:**
1. `(sum-nt '(1 2 3))` — Frame 1 is created. It needs to evaluate `(+ 1 (sum-nt '(2 3)))`. The `+ 1` is left pending.
2. `(sum-nt '(2 3))` — Frame 2 is created. It needs to evaluate `(+ 2 (sum-nt '(3)))`. The `+ 2` is left pending.
3. `(sum-nt '(3))` — Frame 3 is created. It needs to evaluate `(+ 3 (sum-nt '()))`. The `+ 3` is left pending.
4. `(sum-nt '())` — Frame 4 is created. It evaluates to `0`.
5. `0` returns to Frame 3, which computes `(+ 3 0)` yielding `3`.
6. `3` returns to Frame 2, which computes `(+ 2 3)` yielding `5`.
7. `5` returns to Frame 1, which computes `(+ 1 5)` yielding `6`.

Each frame is kept alive because `+` is waiting for the recursive call to return. If we passed a list of 1 million elements, this would require 1 million stack frames to keep track of 1 million pending additions.

### 8. CS lens
This embodies the standard call stack model for function invocation.
Also recognized in: tracking execution contexts in C, keeping track of scopes in JavaScript closures, parsing nested expressions in compilers, backtracking in regex engines.

### 9. SE lens
The design principle here is naive recursion. The alternative not chosen is using a loop construct or an accumulator. We wrote it this way because it closely mirrors the mathematical definition of a sequence sum. The failure cost is high: this code will crash with a stack overflow exception if the list exceeds the maximum stack depth of the environment.

### 10. Commands needed
Start the Scheme REPL: `racket -I r5rs` (or your preferred environment) to test the code.

### 11. Run it. Show the real output.
```scheme
> (sum-nt '(1 2 3))
6
```

### 12. One sentence connecting this unit to what came immediately before.
Having seen how naive recursion leaves operations pending and consumes stack space, we will now look at how to structure code so that nothing is left pending at all.

---

## Concept Unit: What a tail call is

### 1. The Problem
We need a way to recurse without leaving any operations pending. If there is no pending operation waiting for a recursive call's return value, the language runtime shouldn't need to keep the caller's stack frame around.

### 2. Introduce the concept in isolation
Let's see a function call where its return value is immediately returned as the caller's own value, with no further work.
```scheme
(define (wrapper-func x)
  (display "Passing through...\n")
  (abs x))

(wrapper-func -10)
```

**Real output:**
```
Passing through...
10
```
This output proves that after calling `abs`, `wrapper-func` does absolutely nothing else with the result except return it. The call to `abs` is in **tail position**.

### 3. Discard the throwaway example
The `wrapper-func` example is deleted and will not appear in the project again.

### 4. Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `lesson-18.scm` (modified)
- **Change type:** add
- **Location:** bottom of file
- **Dependencies:** `sum-nt` from the previous unit.

### 5. The New Code
```scheme
(define (sum-tr lst acc)
  (if (null? lst)
      acc
      (sum-tr (cdr lst) (+ acc (car lst)))))
```

### 6. The Updated Project
```scheme
(define (sum-nt lst)
  (if (null? lst)
      0
      (+ (car lst) (sum-nt (cdr lst)))))

// ← new
(define (sum-tr lst acc)
  (if (null? lst)
      acc
      (sum-tr (cdr lst) (+ acc (car lst)))))
```
This creates a new version of our summation function. This one takes an extra parameter, `acc`, to keep a running total. It computes the new running total before making the recursive call.

### 7. Mechanical walkthrough
- `(define (sum-tr lst acc))` — defines the tail-recursive summation function taking a list and an accumulator.
- `(if (null? lst)` — checks if the list is empty.
- `acc` — if empty, it simply returns the accumulated total, because we added things up on the way down.
- `(sum-tr (cdr lst) (+ acc (car lst)))` — otherwise, it computes the new accumulator `(+ acc (car lst))` and calls `sum-tr` with the rest of the list `(cdr lst)` and that new total. The crucial point here is that `sum-tr` is the *very last thing* this function does. There is no `+` wrapping the recursive call. This makes it a **tail call**.

**Execution trace:**
1. `(sum-tr '(1 2 3) 0)` — Frame 1 is created. It evaluates arguments for the next call: `(cdr '(1 2 3))` is `'(2 3)`, and `(+ 0 1)` is `1`. It makes a tail call to `(sum-tr '(2 3) 1)`. Because it is a tail call, Scheme *reuses* Frame 1.
2. `(sum-tr '(2 3) 1)` — Frame 1 (reused) evaluates arguments: `(cdr '(2 3))` is `'(3)`, and `(+ 1 2)` is `3`. It makes a tail call to `(sum-tr '(3) 3)`. Scheme reuses Frame 1.
3. `(sum-tr '(3) 3)` — Frame 1 (reused) evaluates arguments: `(cdr '(3))` is `'()`, and `(+ 3 3)` is `6`. It makes a tail call to `(sum-tr '() 6)`. Scheme reuses Frame 1.
4. `(sum-tr '() 6)` — Frame 1 (reused) hits the base case and returns `6`.
5. `6` is the final answer, returned immediately to the original caller.

Because we passed the running total forward as a parameter, no additions were left pending. Instead of pushing a new frame, Scheme replaces the current frame's arguments with the new values and jumps back to the top of the function.

### 8. CS lens
This embodies the concept of Tail-Call Optimization (TCO). When a recursive call is in tail position, it compiles down to a simple `goto` or `jump` instruction, exactly like a `while` loop in an imperative language.
Also recognized in: standard `while`/`for` loops in C, state machine transitions, coroutine yields, and CPS (continuation-passing style) compilation.

### 9. SE lens
The design principle here is space efficiency through eager accumulation. The alternative not chosen was naive recursion (our `sum-nt` function). We chose this because it ensures the function operates in constant stack space, $O(1)$, regardless of the list size. The tradeoff is that we expose an implementation detail (the `acc` parameter) to the caller, which we will see how to hide later.

### 10. Commands needed
No new commands.

### 11. Run it. Show the real output.
```scheme
> (sum-tr '(1 2 3) 0)
6
```

### 12. One sentence connecting this unit to what came immediately before.
Now that we know what a tail call looks like mechanically, we need to understand how strongly the language guarantees this behavior.

---

## Concept Unit: Scheme's TCO guarantee

### 1. The Problem
Many languages (like Python, Java, and early JavaScript) can technically recognize tail calls, but they choose not to optimize them, meaning tail-recursive code will still blow the stack. We need to know if Scheme's behavior is just a nice performance trick in some compilers, or a fundamental rule of the language.

### 2. Introduce the concept in isolation
Let's see an infinite recursion that only survives because of TCO.
```scheme
(define (forever x)
  (forever x))

;; Warning: if you run (forever 1), it loops infinitely without crashing.
;; It does NOT cause a stack overflow in Scheme.
```

This theoretical code proves that Scheme must be reusing the stack frame; if it pushed a new frame every time, the system would run out of memory and crash within a fraction of a second. The call to `forever` is a tail call.

### 3. Discard the throwaway example
The `forever` example is deleted and will not appear in the project again.

### 4. Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** None
- **Change type:** configure
- **Location:** None
- **Dependencies:** None

### 5. The New Code
```scheme
;; This is a conceptual rule standardizing what we built in sum-tr.
;; No new code is added here.
```

### 6. The Updated Project
```scheme
;; We rely on Scheme's structural guarantees for functions like sum-tr.
```
This unit explains the language contract governing the functions we have already written.

### 7. Mechanical walkthrough
- R5RS, R6RS, and R7RS (the Scheme standards) explicitly require proper tail recursion.
- This is not an "optimization" that a particular implementation might optionally do — it is a mandated part of the language semantics.
- A Scheme implementation that does not optimize tail calls is literally not a conforming Scheme.
- Because of this, you can write loops as recursive functions. In Scheme, you can write code that recurs a billion times and it will not overflow the stack, provided the recursion is in tail position.

### 8. CS lens
This embodies language specification guarantees. Instead of leaving memory management to "implementation details", the standard forces the compiler to manage control flow graphs differently.
Also recognized in: Haskell's lazy evaluation guarantees, C++'s standard complexity guarantees for STL containers, ECMAScript 6's formal tail-call requirement.

### 9. SE lens
The design principle here is designing for a functional paradigm. The alternative not chosen is providing primitive looping constructs like `while` or `for`. Scheme omits built-in imperative loops because, with guaranteed TCO, tail recursion *is* the loop. The cost is that programmers must learn to manually manage tail positions.

### 10. Commands needed
No new commands.

### 11. Run it. Show the real output.
N/A (Conceptual standard)

### 12. One sentence connecting this unit to what came immediately before.
Since we know Scheme guarantees this optimization, the next crucial skill is knowing exactly which expressions are actually in a tail position.

---

## Concept Unit: How to identify tail position

### 1. The Problem
Not every position at the end of a block of code is a tail position. We need a rigorous set of rules to look at an expression and definitively say whether its return value is the final result of the function, or if something else is still waiting to operate on it.

### 2. Introduce the concept in isolation
Let's look at `begin`, which evaluates things in sequence.
```scheme
(define (test-begin)
  (begin
    (display "First\n")
    (+ 1 2)
    (* 3 4)))

(test-begin)
```

**Real output:**
```
First
12
```
This output proves that only the very last expression in a `begin` block (`(* 3 4)`) determines the return value. The `(+ 1 2)` was evaluated, but its result was thrown away. Therefore, only `(* 3 4)` is in tail position.

### 3. Discard the throwaway example
The `test-begin` example is deleted and will not appear in the project again.

### 4. Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** None
- **Change type:** configure
- **Location:** None
- **Dependencies:** None

### 5. The New Code
```scheme
;; Demonstrating rules for tail position
(define (tail-rules x)
  (if (> x 0)
      (abs x)         ; Tail position
      (begin
        (display x)
        (let ((y 5))
          (+ x y))))) ; Tail position
```

### 6. The Updated Project
```scheme
;; Demonstrating rules for tail position
(define (tail-rules x)
  (if (> x 0)
      (abs x)         ; Tail position
      (begin
        (display x)
        (let ((y 5))
          (+ x y))))) ; Tail position
```
This contrived function shows various positions that count as the "last thing" a function does.

### 7. Mechanical walkthrough
- In `(if test consequent alternative)`: both the `consequent` and the `alternative` are in tail position. The `if` itself does nothing with their results; it just routes execution to one of them.
- In `(cond [test expr] ...)`: the last expression in each clause is in tail position.
- In `(let ([...]) body)`: the last expression inside the `body` is in tail position. The bindings have been made, and the body's result is the `let`'s result.
- In `(begin expr1 expr2 ... exprN)`: only `exprN` is in tail position.
- In `(f (g x))`: `g` is NOT in tail position. Even though `g` is the innermost call, `f` is still waiting for `g`'s result. `f` is in tail position.

### 8. CS lens
This embodies syntactic position tracking in Abstract Syntax Trees (ASTs). A compiler determines tail positions by recursively checking if an AST node's evaluation is passed directly to the function's return instruction.
Also recognized in: return type inference algorithms, linter reachability analysis, dead code elimination paths.

### 9. SE lens
The design principle here is explicit syntactic reduction. The alternative not chosen is a `return` keyword. Many languages require `return g(x)` to signal a tail return. Scheme treats every expression block as an implicit return, meaning the structure itself dictates what is returned.

### 10. Commands needed
No new commands.

### 11. Run it. Show the real output.
```scheme
> (tail-rules -3)
-32
```

### 12. One sentence connecting this unit to what came immediately before.
With these rules in hand, we can now confidently take a non-tail-recursive function and restructure it so its recursive call sits cleanly in tail position.

---

## Concept Unit: Transforming my-length from non-tail to tail recursive

### 1. The Problem
We have seen `sum-nt` and `sum-tr`, but building a separate top-level function that requires the caller to pass an initial `acc` of `0` is poor API design. We want the caller to just call `(length-tr lst)` and have the loop managed internally.

### 2. Introduce the concept in isolation
Let's see the named let loop pattern from Lesson 17.
```scheme
(define (count-down n)
  (let loop ((current n))
    (if (= current 0)
        "Done!"
        (loop (- current 1)))))

(count-down 3)
```

**Real output:**
```
"Done!"
```
This output proves that the named `let` creates an internal recursive function (`loop`) and immediately calls it with the initial value (`3`). The recursive call to `loop` is in tail position.

### 3. Discard the throwaway example
The `count-down` example is deleted and will not appear in the project again.

### 4. Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `lesson-18.scm` (modified)
- **Change type:** add
- **Location:** bottom of file
- **Dependencies:** Named `let` from Lesson 17.

### 5. The New Code
```scheme
; Non-tail:
(define (length-nt lst)
  (if (null? lst) 0 (+ 1 (length-nt (cdr lst)))))

; Tail-recursive with accumulator:
(define (length-tr lst)
  (let loop ([lst lst] [count 0])
    (if (null? lst)
        count
        (loop (cdr lst) (+ count 1)))))
```

### 6. The Updated Project
```scheme
// ... previous sum functions ...

// ← new
; Non-tail:
(define (length-nt lst)
  (if (null? lst) 0 (+ 1 (length-nt (cdr lst)))))

; Tail-recursive with accumulator:
(define (length-tr lst)
  (let loop ([lst lst] [count 0])
    (if (null? lst)
        count
        (loop (cdr lst) (+ count 1)))))
```
Here we present both versions of a list-length function. The tail-recursive one hides its accumulator inside an internal named `let` loop.

### 7. Mechanical walkthrough
- `(define (length-nt lst))` — a non-tail-recursive version. The `(+ 1 ...)` is waiting.
- `(define (length-tr lst))` — defines the top-level API function.
- `(let loop ([lst lst] [count 0])` — creates a named let called `loop`. It initializes its internal `lst` to the outer argument, and its internal accumulator `count` to `0`.
- `(if (null? lst)` — checks the base case.
- `count` — if the list is empty, return the accumulator.
- `(loop (cdr lst) (+ count 1))` — makes a recursive call to `loop`. It shrinks the list and increments the count.

**The transformation pattern:**
1. Create a named let loop (or a helper function).
2. Add an accumulator parameter initialized to the base case value (like 0).
3. Move the combining operation (`+ 1`) into the accumulator update during the recursive call.
4. Change the base case to return the accumulator instead of a hardcoded value.

Because `loop` is inside the `let` body, and is the last expression evaluated in the `if` alternative branch, it is in tail position.

### 8. CS lens
This embodies the transformation of linear recursion into iteration. An accumulator mechanically converts a process from building up state in control flow (the call stack) to passing state as explicit data.
Also recognized in: Fold-left (reduce) operations, converting algorithms to use explicit stacks, Dynamic Programming tabulation vs memoization.

### 9. SE lens
The design principle here is encapsulation. The alternative not chosen is defining `(length-helper lst count)` as a separate top-level function. By using a named let, we prevent `loop` from polluting the global namespace and guarantee no other code can misuse the helper with invalid starting states.

### 10. Commands needed
No new commands.

### 11. Run it. Show the real output.
```scheme
> (length-nt '(a b c d))
4
> (length-tr '(a b c d))
4
```

### 12. One sentence connecting this unit to what came immediately before.
This transformation works perfectly for linear lists, but what happens when a function branches into multiple recursive paths at once?

---

## Concept Unit: A function that CANNOT be made simply tail-recursive with one accumulator

### 1. The Problem
Some recursive problems involve multiple recursive calls in the same step. If a function needs to sum the left side of a tree and the right side of a tree, it can't put *both* calls in tail position. A simple single accumulator is not enough to store the branching state.

### 2. Introduce the concept in isolation
Let's see a branching structure: pairs inside pairs.
```scheme
(define tree '((1 . 2) . (3 . 4)))
(display (car (car tree)))
(newline)
```

**Real output:**
```
1
```
This output proves that a tree made of nested pairs requires digging down through multiple `car` and `cdr` operations to find all the leaf values.

### 3. Discard the throwaway example
The tree definition example is deleted and will not appear in the project again.

### 4. Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `lesson-18.scm` (modified)
- **Change type:** add
- **Location:** bottom of file
- **Dependencies:** None

### 5. The New Code
```scheme
; Tree sum — not simply tail-recursive:
(define (tree-sum tree)
  (if (not (pair? tree))
      tree
      (+ (tree-sum (car tree))
         (tree-sum (cdr tree)))))
```

### 6. The Updated Project
```scheme
// ... previous length functions ...

// ← new
; Tree sum — not simply tail-recursive:
(define (tree-sum tree)
  (if (not (pair? tree))
      tree
      (+ (tree-sum (car tree))
         (tree-sum (cdr tree)))))
```
This function traverses every branch of a nested pair structure, adding up all the non-pair leaf values.

### 7. Mechanical walkthrough
- `(define (tree-sum tree))` — defines a function taking a nested structure.
- `(if (not (pair? tree))` — checks if the current node is a leaf (not a pair).
- `tree` — if it's a leaf, we return its numeric value directly.
- `(+ (tree-sum (car tree)) (tree-sum (cdr tree)))` — if it is a pair, we must recursively sum the left branch `(car tree)` and the right branch `(cdr tree)`.

Because there are TWO recursive calls, neither can truly be the final thing the function does. Even if we evaluated the left branch first, the `+` operation still has to wait for the right branch to finish before it can add them together. We need both results before we can add. A single integer accumulator passed forward cannot represent the fact that we still have to traverse the right side later.

### 8. CS lens
This embodies non-linear (tree) recursion. Transforming tree recursion into iteration requires an explicit stack data structure to hold pending nodes, because the call stack is naturally a stack data structure itself.
Also recognized in: Depth-First Search algorithms, AST parsing, rendering scene graphs, traversing DOM trees in the browser.

### 9. SE lens
The design principle here is relying on the call stack for state management. The alternative not chosen is building our own explicit list to act as a stack of pending branches. We chose to leave it non-tail-recursive because it makes the code radically simpler and easier to read. The tradeoff is that extremely deep trees will blow the stack.

### 10. Commands needed
No new commands.

### 11. Run it. Show the real output.
```scheme
> (tree-sum '((1 . 2) . (3 . 4)))
10
```

### 12. One sentence connecting this unit to what came immediately before.
Tree recursion reveals the limits of simple accumulators, showing us why we will eventually need more powerful tools to manage control flow.

---

## Connect the pieces

Every named let loop we wrote in Lesson 17 was already using tail recursion. Consider the `length-tr` function. When we call `(length-tr '(a b c))`:
1. `loop` is initialized with `lst = '(a b c)` and `count = 0`.
2. It tail-calls `loop` with `lst = '(b c)` and `count = 1`. Frame is reused.
3. It tail-calls `loop` with `lst = '(c)` and `count = 2`. Frame is reused.
4. It tail-calls `loop` with `lst = '()` and `count = 3`. Frame is reused.
5. Base case `(null? lst)` is met, returning `3`.
The Four Commandments' rule to "always change at least one argument" is exactly what ensures this reused-frame iteration eventually reaches its base case and terminates.

## What breaks without this

If we accidentally wrap our tail-call loop in an operation, we lose TCO.
Delete the `count` return in `length-tr` and replace the recursive call with an addition:
```scheme
(define (broken-length lst)
  (let loop ([lst lst] [count 0])
    (if (null? lst)
        count
        (+ 0 (loop (cdr lst) (+ count 1)))))) ; The (+ 0 ...) wraps the call
```
**Error:** While this still computes the right answer, `(+ 0 ...)` forces the call stack to grow. If you ran this on a massive list, you would see a "stack overflow" crash, proving that even a mathematically useless `+ 0` destroys the tail position. Restore it back to a clean `(loop ...)` tail call to regain the optimization.

## Exercises

1. **Sum an Accumulator Trace**: Modify `sum-tr` to use `(display acc) (newline)` right before the recursive call. Watch how the total grows step by step.
2. **Tail-Recursive Flatten**: Attempt to transform `my-flatten` into a tail-recursive version using an accumulator list. (Hint: a simple single accumulator won't work perfectly because it's tree recursion. You have to maintain an explicit stack of pending lists in your accumulator.)

## Definition of done
- [x] Defined and proved the existence of the call stack for non-tail-recursive calls.
- [x] Defined tail position and Scheme's TCO guarantee.
- [x] Transformed a linear recursion into a tail-recursive loop with an accumulator.
- [x] Demonstrated why tree recursion resists simple accumulator transformation.
- [x] `git commit -m "Add lesson 18 on tail calls to establish safe recursion constraints"`
