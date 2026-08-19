# Lesson 11: `o+`, `o*`, `o^` — The Fourth Commandment and Collecting Answers

What you will build: The reader will learn the Fourth Commandment from The Little Schemer — always change at least one argument while recurring — and use it to write functions that accumulate results across a list of numbers: `addtup` (sum all numbers in a list), `mul-tup` (multiply all numbers in a list), and `tup+` (element-wise sum of two tuples). The transferable problems: (1) the Fourth Commandment formalizes why recursion terminates — you must always make progress toward the base case; (2) `addtup` and `multup` are specializations of fold/reduce over number lists; (3) `tup+` introduces simultaneously recurring on two lists, a new structural pattern.

What you need to know first: Lessons 0-10 (all prior concepts through structural recursion, Peano arithmetic, o+, o*, o-, o-expt, nested list recursion, cons-building, higher-order functions).

Terms used in this lesson:
- **recursion** — A function calling itself. Why it exists: allows repetitive logic in functional programming without stateful loops.
- **base case** — The condition that stops recursion. Why it exists: prevents infinite loops by returning a known value when the simplest form of the problem is reached.
- **identity element** — A value that, when combined with another under a specific operation, leaves the other value unchanged. Why it exists: provides the mathematically correct base case for accumulations (0 for addition, 1 for multiplication).
- **The Fourth Commandment** — Always change at least one argument while recurring. Why it exists: formalizes why recursion terminates; without progress toward a base case, recursion loops forever.
- **tuple** — A list of numbers. Why it exists: provides a constrained domain (lists containing only numbers) to teach element-wise operations without type-checking distractions.

Objects and methods used:
**addtup**
- *What it is:* A recursive function to sum a tuple.
- *Implementation:* `(define (addtup tup) ...)`
- *Its use:* Demonstrates reducing a list of numbers using addition.
- *Type:* Function.
- *Responsibility:* Computes the sum of all elements in a list of numbers.
- *Depends on:* A list of numbers (tuple).
- *Connects to:* Calls `null?`, `car`, `cdr`, `o+`, and itself.
- *Shape:* Top-level function in `lesson-11.rkt`.

**mul-tup**
- *What it is:* A recursive function to multiply a tuple.
- *Implementation:* `(define (mul-tup tup) ...)`
- *Its use:* Demonstrates reducing a list of numbers using multiplication and a different identity base case.
- *Type:* Function.
- *Responsibility:* Computes the product of all elements in a tuple.
- *Depends on:* A tuple.
- *Connects to:* Calls `null?`, `car`, `cdr`, `o*`, and itself.
- *Shape:* Top-level function in `lesson-11.rkt`.

**tup+**
- *What it is:* Element-wise addition of two tuples of the same length.
- *Implementation:* `(define (tup+ tup1 tup2) ...)`
- *Its use:* Introduces simultaneously recurring on two lists.
- *Type:* Function.
- *Responsibility:* Adds corresponding elements of two equal-length tuples.
- *Depends on:* Two tuples of equal length.
- *Connects to:* Calls `null?`, `car`, `cdr`, `o+`, `cons`, and itself.
- *Shape:* Top-level function in `lesson-11.rkt`.

**tup+\***
- *What it is:* Element-wise addition of two tuples of potentially unequal length.
- *Implementation:* `(define (tup+* tup1 tup2) ...)`
- *Its use:* Handles exhaustion of one list before the other.
- *Type:* Function.
- *Responsibility:* Adds corresponding elements, passing through remaining elements when one tuple runs out.
- *Depends on:* Two tuples of any length.
- *Connects to:* Calls `null?`, `car`, `cdr`, `o+`, `cons`, and itself.
- *Shape:* Top-level function in `lesson-11.rkt`.

**o>**
- *What it is:* Greater-than comparison from scratch.
- *Implementation:* `(define (o> m n) ...)`
- *Its use:* Compares two numbers by stepping both down toward zero simultaneously.
- *Type:* Function.
- *Responsibility:* Returns `#t` if `m` is strictly greater than `n`.
- *Depends on:* Two non-negative integers.
- *Connects to:* Calls `zero?`, `sub1`, and itself.
- *Shape:* Top-level function in `lesson-11.rkt`.

**o<**
- *What it is:* Less-than comparison from scratch.
- *Implementation:* `(define (o< m n) ...)`
- *Its use:* Reuses `o>` to implement less-than.
- *Type:* Function.
- *Responsibility:* Returns `#t` if `m` is strictly less than `n`.
- *Depends on:* Two non-negative integers.
- *Connects to:* Calls `o>`.
- *Shape:* Top-level function in `lesson-11.rkt`.

**o=**
- *What it is:* Equality comparison from scratch.
- *Implementation:* `(define (o= m n) ...)`
- *Its use:* Uses the fact that if neither is greater nor less, they are equal.
- *Type:* Function.
- *Responsibility:* Returns `#t` if `m` is exactly equal to `n`.
- *Depends on:* Two non-negative integers.
- *Connects to:* Calls `o>`, `o<`.
- *Shape:* Top-level function in `lesson-11.rkt`.

**Everything else in the file, not this lesson's subject but still explained:**

**o+**
- *What it is:* Addition function from an earlier lesson.
- *Implementation:* `(define (o+ m n) ...)`
- *Its use:* Used to add two numbers.
- *Type:* Function.
- *Responsibility:* Adds two Peano numbers.
- *Depends on:* Two numbers.
- *Connects to:* Calls `add1`, `sub1`, `zero?`.
- *Shape:* Helper function.

**o\***
- *What it is:* Multiplication function from an earlier lesson.
- *Implementation:* `(define (o* m n) ...)`
- *Its use:* Used to multiply two numbers.
- *Type:* Function.
- *Responsibility:* Multiplies two Peano numbers.
- *Depends on:* Two numbers.
- *Connects to:* Calls `o+`, `sub1`, `zero?`.
- *Shape:* Helper function.

**sub1**
- *What it is:* Decrement primitive.
- *Implementation:* `(sub1 n)`
- *Its use:* Progresses a number toward the base case 0.
- *Type:* Primitive.
- *Responsibility:* Returns n minus 1.
- *Depends on:* A number.
- *Connects to:* Runtime.
- *Shape:* Core primitive.

**zero?**
- *What it is:* Check if number is zero.
- *Implementation:* `(zero? n)`
- *Its use:* Base case check for numbers.
- *Type:* Primitive.
- *Responsibility:* Returns true if n is 0.
- *Depends on:* A number.
- *Connects to:* Runtime.
- *Shape:* Core primitive.

**null?**
- *What it is:* Check if list is empty.
- *Implementation:* `(null? lst)`
- *Its use:* Base case check for lists.
- *Type:* Primitive.
- *Responsibility:* Returns true if list is empty.
- *Depends on:* A list.
- *Connects to:* Runtime.
- *Shape:* Core primitive.

**car**
- *What it is:* Gets first element of list.
- *Implementation:* `(car lst)`
- *Its use:* Accesses the current item.
- *Type:* Primitive.
- *Responsibility:* Returns head of list.
- *Depends on:* A non-empty list.
- *Connects to:* Runtime.
- *Shape:* Core primitive.

**cdr**
- *What it is:* Gets rest of list.
- *Implementation:* `(cdr lst)`
- *Its use:* Progresses list toward empty base case.
- *Type:* Primitive.
- *Responsibility:* Returns tail of list.
- *Depends on:* A non-empty list.
- *Connects to:* Runtime.
- *Shape:* Core primitive.

**cons**
- *What it is:* List constructor.
- *Implementation:* `(cons item lst)`
- *Its use:* Builds a new list recursively.
- *Type:* Primitive.
- *Responsibility:* Prepends item to list.
- *Depends on:* An element and a list.
- *Connects to:* Runtime.
- *Shape:* Core primitive.

---

## Concept Unit: The Fourth Commandment

### The Problem

When we write recursive functions, they call themselves. If a function calls itself with the exact same arguments it was given, it will do the exact same thing again, which means it will call itself again, infinitely. We need a formal rule to guarantee that a recursive function will eventually stop. 

### Introduce the concept in isolation

Let's deliberately write a broken function that violates the principle of progressing towards a base case. This is a **broken recursion** that never changes its argument.

```scheme
(define (broken-length lst)
  (if (null? lst)
      0
      (add1 (broken-length lst)))) ; Passing lst instead of (cdr lst)

(broken-length '(a b c))
```

When you run this in DrRacket, the output is not a number. The evaluation never finishes; you will eventually get an out of memory error or a stack overflow:

```
out of memory (or infinite spin)
```

This proves that without making the problem smaller at each step, the recursion cannot reach the base case `(null? lst)`.

### Discard the throwaway example

The `broken-length` function is explicitly discarded and will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating the Fourth Commandment.
- **Files affected:** `lesson-11.rkt` (created).
- **Change type:** Add.
- **Location:** Top of file.
- **Dependencies:** `o+`, `o*` from previous lessons (assume they are required or pasted above).

### The New Code

```scheme
; The Fourth Commandment: always change at least one argument while recurring.
; When recurring on a list of atoms, use (cdr lat). When recurring on a number, use (sub1 n).
```

### The Updated Project

```scheme
; lesson-11.rkt
; The Fourth Commandment: always change at least one argument while recurring.
; When recurring on a list of atoms, use (cdr lat). When recurring on a number, use (sub1 n).
```

This establishes the rule as a comment at the top of our workspace.

### Mechanical walkthrough

- `; The Fourth Commandment:` — A comment naming the principle. The principle is that we must always change at least one argument while recurring. This guarantees termination. In list recursion, we always pass `(cdr lst)`, a strictly shorter list. In number recursion, we always pass `(sub1 n)`, a strictly smaller number. 

### CS lens

The Fourth Commandment is a colloquial formulation of **well-founded recursion** or **decreasing measures**. Also recognized in: induction proofs in mathematics, termination analysis in compilers, loop variants in imperative programming, Turing machine halting heuristics.

### SE lens

We design our recursive functions to follow this structural template because it eliminates the risk of infinite loops by construction. The alternative is ad-hoc logic where termination depends on complex state, which makes the code fragile and difficult to reason about.

### Commands needed to make this unit real, if any.

None.

### Run it. Show the real output.

(No code to run for a comment.)

---

## Concept Unit: addtup

### The Problem

We have a tuple (a list of numbers), and we want to sum all the numbers in it. We need a function that traverses the list and accumulates the total using `o+`.

### Introduce the concept in isolation

We write a small test to see how we might add elements recursively.

```scheme
(o+ 3 (o+ 5 (o+ 2 0)))
```

Output:
```
10
```

This proves that `o+` can be chained by nesting. The base case `0` is used because `(o+ 2 0)` is just `2`. `0` is the **identity element** for addition.

### Discard the throwaway example

The manual chaining is discarded.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `lesson-11.rkt` (modified).
- **Change type:** Add.
- **Location:** Below the Fourth Commandment comment.
- **Dependencies:** None.

### The New Code

```scheme
(define (addtup tup)
  (if (null? tup)
      0
      (o+ (car tup) (addtup (cdr tup)))))
```

### The Updated Project

```scheme
; lesson-11.rkt
; The Fourth Commandment...

(define (addtup tup) ; ← new
  (if (null? tup)    ; ← new
      0              ; ← new
      (o+ (car tup) (addtup (cdr tup))))) ; ← new
```

`addtup` traverses the list, replacing `cons` with `o+`, and the empty list with `0`.

### Mechanical walkthrough

- `(define (addtup tup)` — Defines a function named `addtup` that takes one argument, `tup`, a list of numbers.
- `(if (null? tup)` — Checks if the tuple is empty. This is our base case.
- `0` — If empty, return `0`. This is the identity for addition; adding `0` changes nothing.
- `(o+` — If not empty, we call our addition function.
- `(car tup)` — The first argument to `o+` is the first element of the tuple.
- `(addtup (cdr tup))` — The second argument to `o+` is the recursive call on the rest of the tuple. This obeys the Fourth Commandment by changing the argument `tup` to `(cdr tup)`.

### Execution trace

```
(addtup '(3 5 2))
Iteration 1: tup is '(3 5 2). Not null. Returns (o+ 3 (addtup '(5 2))).
Iteration 2: tup is '(5 2). Not null. Returns (o+ 5 (addtup '(2))).
Iteration 3: tup is '(2). Not null. Returns (o+ 2 (addtup '())).
Iteration 4: tup is '(). Null. Returns 0.
Recomposition 3: (o+ 2 0) returns 2.
Recomposition 2: (o+ 5 2) returns 7.
Recomposition 1: (o+ 3 7) returns 10.
```

### CS lens

This pattern is a specialization of a **fold** or **reduce** operation over a list. Also recognized in: `Array.prototype.reduce` in JavaScript, MapReduce in distributed systems, `std::accumulate` in C++.

### SE lens

We hardcode the operation (`o+`) and the base case (`0`) here for simplicity, but in real software engineering, we extract the operation and the base case into a higher-order `reduce` function. The tradeoff of this specialized `addtup` is duplication: we will need to write the exact same shape again for multiplication.

### Commands needed to make this unit real, if any.

None.

### Run it. Show the real output.

```scheme
(addtup '(3 5 2 8))
```

Output:
```
18
```

```scheme
(addtup '())
```

Output:
```
0
```

---

## Concept Unit: mul-tup

### The Problem

We now want to multiply all numbers in a tuple. This requires the exact same traversal pattern as `addtup`, but with a different operation and a different base case.

### Introduce the concept in isolation

We test manual multiplication chaining to find the correct base case.

```scheme
(o* 2 (o* 3 (o* 4 1)))
```

Output:
```
24
```

This proves that `1` is the correct base case for multiplication, because `1` is the **identity element** for multiplication. If we used `0`, the entire product would collapse to `0`.

### Discard the throwaway example

The manual chaining is discarded.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `lesson-11.rkt` (modified).
- **Change type:** Add.
- **Location:** Below `addtup`.
- **Dependencies:** None.

### The New Code

```scheme
(define (mul-tup tup)
  (if (null? tup)
      1
      (o* (car tup) (mul-tup (cdr tup)))))
```

### The Updated Project

```scheme
; lesson-11.rkt
; ...addtup...

(define (mul-tup tup) ; ← new
  (if (null? tup)     ; ← new
      1               ; ← new
      (o* (car tup) (mul-tup (cdr tup))))) ; ← new
```

`mul-tup` multiplies all numbers in a tuple together.

### Mechanical walkthrough

- `(define (mul-tup tup)` — Defines a function named `mul-tup` taking a list of numbers.
- `(if (null? tup)` — Checks if the tuple is empty.
- `1` — Returns `1` if empty. Multiplying by 1 changes nothing. This is not an arbitrary choice — the identity element determines what the empty-list result must be.
- `(o*` — Calls our multiplication function.
- `(car tup)` — First element.
- `(mul-tup (cdr tup))` — Recursive call on the rest of the tuple, obeying the Fourth Commandment.

### Execution trace

```
(mul-tup '(2 3 4))
Iteration 1: tup is '(2 3 4). Not null. Returns (o* 2 (mul-tup '(3 4))).
Iteration 2: tup is '(3 4). Not null. Returns (o* 3 (mul-tup '(4))).
Iteration 3: tup is '(4). Not null. Returns (o* 4 (mul-tup '())).
Iteration 4: tup is '(). Null. Returns 1.
Recomposition 3: (o* 4 1) returns 4.
Recomposition 2: (o* 3 4) returns 12.
Recomposition 1: (o* 2 12) returns 24.
```

### CS lens

This is another **reduce** operation, highlighting that folds are parameterized by a monoid: an associative binary operation and an identity element. 

### SE lens

The repetition between `addtup` and `mul-tup` shows why abstraction is powerful. By not having a general `reduce`, we duplicate the traversal logic. The tradeoff is that this is simpler for beginners to read without needing to understand higher-order functions yet.

### Commands needed to make this unit real, if any.

None.

### Run it. Show the real output.

```scheme
(mul-tup '(2 3 4))
```

Output:
```
24
```

```scheme
(mul-tup '())
```

Output:
```
1
```

---

## Concept Unit: tup+

### The Problem

We want to perform element-wise addition of two tuples of the same length (e.g., adding `'(1 2 3)` and `'(4 5 6)` to get `'(5 7 9)`). This requires traversing two lists at the exact same time.

### Introduce the concept in isolation

We test combining two items into a new list cell simultaneously.

```scheme
(cons (o+ 1 4) '())
```

Output:
```
'(5)
```

This proves we can compute a combined element and build a new list out of it. 

### Discard the throwaway example

The manual `cons` test is discarded.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `lesson-11.rkt` (modified).
- **Change type:** Add.
- **Location:** Below `mul-tup`.
- **Dependencies:** None.

### The New Code

```scheme
(define (tup+ tup1 tup2)
  (cond
    [(and (null? tup1) (null? tup2)) '()]
    [else (cons (o+ (car tup1) (car tup2))
                (tup+ (cdr tup1) (cdr tup2)))]))
```

### The Updated Project

```scheme
; lesson-11.rkt
; ...mul-tup...

(define (tup+ tup1 tup2) ; ← new
  (cond                  ; ← new
    [(and (null? tup1) (null? tup2)) '()] ; ← new
    [else (cons (o+ (car tup1) (car tup2)) ; ← new
                (tup+ (cdr tup1) (cdr tup2)))])) ; ← new
```

`tup+` recurs on two lists simultaneously, adding corresponding elements.

### Mechanical walkthrough

- `(define (tup+ tup1 tup2)` — Defines `tup+` with two tuple arguments.
- `(cond` — Starts our conditional logic.
- `[(and (null? tup1) (null? tup2))` — Checks if both tuples are empty at the same time. Since they are the same length, they will reach empty together.
- `'()]` — If both are empty, the sum is the empty list.
- `[else` — Otherwise, they have elements.
- `(cons` — We build a new list.
- `(o+ (car tup1) (car tup2))` — The first element of the new list is the sum of the first elements of the two input tuples.
- `(tup+ (cdr tup1) (cdr tup2))` — We recur on the rest of *both* tuples at the same time. This obeys the Fourth Commandment on both arguments.

### Execution trace

```
(tup+ '(1 2) '(4 5))
Iteration 1: tup1 is '(1 2), tup2 is '(4 5). Neither is null. Returns (cons (o+ 1 4) (tup+ '(2) '(5))).
Iteration 2: tup1 is '(2), tup2 is '(5). Neither is null. Returns (cons (o+ 2 5) (tup+ '() '())).
Iteration 3: tup1 is '(), tup2 is '(). Both are null. Returns '().
Recomposition 2: (cons 7 '()) returns '(7).
Recomposition 1: (cons 5 '(7)) returns '(5 7).
```

### CS lens

This is a **zip** operation, specifically `zipWith`. Also recognized in: Python's `zip()`, Haskell's `zipWith`, SIMD vector addition, tensor broadcasting.

### SE lens

Requiring both lists to be the same length is a strict precondition. If one list is shorter, `car` will crash on the empty list. The tradeoff is simpler code, but fragile runtime behavior if inputs are unexpected.

### Commands needed to make this unit real, if any.

None.

### Run it. Show the real output.

```scheme
(tup+ '(1 2 3) '(4 5 6))
```

Output:
```
'(5 7 9)
```

---

## Concept Unit: tup+*

### The Problem

What if the tuples are different lengths? We want to add the elements we have, and when one tuple runs out, we just append the remaining elements of the other tuple unchanged.

### Introduce the concept in isolation

We test returning a remaining list when one runs out.

```scheme
(cond
  [#t '(4 5 6)] ; Simulating tup1 is empty, returning tup2
  [else '()])
```

Output:
```
'(4 5 6)
```

This proves we can just return the leftover list directly to terminate the recursion early without having to manually step through its remaining elements.

### Discard the throwaway example

The simulated base case is discarded.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `lesson-11.rkt` (modified).
- **Change type:** Add.
- **Location:** Below `tup+`.
- **Dependencies:** None.

### The New Code

```scheme
(define (tup+* tup1 tup2)
  (cond
    [(and (null? tup1) (null? tup2)) '()]
    [(null? tup1) tup2]
    [(null? tup2) tup1]
    [else (cons (o+ (car tup1) (car tup2))
                (tup+* (cdr tup1) (cdr tup2)))]))
```

### The Updated Project

```scheme
; lesson-11.rkt
; ...tup+...

(define (tup+* tup1 tup2) ; ← new
  (cond
    [(and (null? tup1) (null? tup2)) '()]
    [(null? tup1) tup2] ; ← new base case
    [(null? tup2) tup1] ; ← new base case
    [else (cons (o+ (car tup1) (car tup2))
                (tup+* (cdr tup1) (cdr tup2)))]))
```

`tup+*` safely handles unequal length lists by stopping recursion on the exhausted list and passing the remaining one through.

### Mechanical walkthrough

- `(define (tup+* tup1 tup2)` — Function definition.
- `[(and (null? tup1) (null? tup2)) '()]` — Optional base case if they empty at the same time.
- `[(null? tup1) tup2]` — If only `tup1` is empty, we just return the rest of `tup2`. We don't need to step through it because adding to nothing is just the remaining elements.
- `[(null? tup2) tup1]` — If only `tup2` is empty, return the rest of `tup1`.
- `[else (cons ...)]` — The standard recursive step, unchanged.

### CS lens

This is **early termination** of a zip. When one domain is exhausted, the identity element of the operation dictates that the remaining structure can be returned intact, exploiting referential transparency.

### SE lens

This is more robust than `tup+`. The tradeoff is more conditional branches to evaluate per step, which is a minuscule performance cost for a massive gain in input safety.

### Commands needed to make this unit real, if any.

None.

### Run it. Show the real output.

```scheme
(tup+* '(1 2) '(4 5 6))
```

Output:
```
'(5 7 6)
```

---

## Concept Unit: o>, o<, o=

### The Problem

We need to compare numbers without using the built-in `>`, `<`, `=`. We only have Peano addition (`o+`) and subtraction/decrementing (`sub1`). We must build relational operators from scratch.

### Introduce the concept in isolation

We test the logic of comparing by decrementing. If we have 2 and 1, we subtract 1 from both. Now we have 1 and 0. The one that hit 0 first was the smaller number.

```scheme
(zero? (sub1 1))
```

Output:
```
#t
```

This proves that decrementing a number towards `0` tells us when its magnitude is exhausted.

### Discard the throwaway example

The manual decrement check is discarded.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `lesson-11.rkt` (modified).
- **Change type:** Add.
- **Location:** Below `tup+*`.
- **Dependencies:** None.

### The New Code

```scheme
(define (o> m n)
  (cond
    [(zero? m) #f]
    [(zero? n) #t]
    [else (o> (sub1 m) (sub1 n))]))

(define (o< m n) (o> n m))

(define (o= m n)
  (cond
    [(o> m n) #f]
    [(o< m n) #f]
    [else #t]))
```

### The Updated Project

```scheme
; lesson-11.rkt
; ...tup+*...

(define (o> m n) ; ← new
  (cond
    [(zero? m) #f]
    [(zero? n) #t]
    [else (o> (sub1 m) (sub1 n))]))

(define (o< m n) (o> n m)) ; ← new

(define (o= m n) ; ← new
  (cond
    [(o> m n) #f]
    [(o< m n) #f]
    [else #t]))
```

These functions compare two numbers by counting both down simultaneously — exactly like `tup+`.

### Mechanical walkthrough

- `(define (o> m n)` — Greater than comparison.
- `[(zero? m) #f]` — If `m` is zero, it cannot be greater than `n` (since `n` is a non-negative Peano number). Return `#f`.
- `[(zero? n) #t]` — If `m` is NOT zero (because the first clause failed) but `n` IS zero, then `m` is greater than `n`. Return `#t`.
- `[else (o> (sub1 m) (sub1 n))]` — If neither is zero, subtract 1 from both and compare again. This obeys the Fourth Commandment on both arguments.
- `(define (o< m n) (o> n m))` — Less than is just greater than with the arguments flipped.
- `(define (o= m n)` — Equality check.
- `[(o> m n) #f]` — If `m` is strictly greater, they aren't equal.
- `[(o< m n) #f]` — If `m` is strictly less, they aren't equal.
- `[else #t]` — If neither is true, by mathematical trichotomy, they must be exactly equal.

### Execution trace

```
(o> 5 3)
Iteration 1: m is 5, n is 3. Neither is zero. Returns (o> 4 2).
Iteration 2: m is 4, n is 2. Neither is zero. Returns (o> 3 1).
Iteration 3: m is 3, n is 1. Neither is zero. Returns (o> 2 0).
Iteration 4: m is 2, n is 0. n is zero. Returns #t.
```

### CS lens

This is a Peano arithmetic implementation of the **law of trichotomy**, where every real number relation falls into exactly one of >, <, or =. It also highlights **co-recursion**, stepping two structures down at identical rates.

### SE lens

Reusing `o>` to implement `o<` and `o=` is excellent engineering. We defined the complex recursive logic once, and derived the other operations for free. The tradeoff is performance: `o=` might take twice as many steps because it calls `o>` and potentially `o<`, instead of doing a single parallel decrement itself.

### Commands needed to make this unit real, if any.

None.

### Run it. Show the real output.

```scheme
(o> 5 3)
```

Output:
```
#t
```

```scheme
(o> 3 5)
```

Output:
```
#f
```

```scheme
(o= 4 4)
```

Output:
```
#t
```

---

## Closing

Connect the pieces: we started by establishing the Fourth Commandment — to avoid infinite loops, we must step down our structures using `cdr` on lists or `sub1` on numbers. We applied this to single lists in `addtup` and `mul-tup`, reducing them to a single scalar answer based on an identity element. We then advanced to dual-traversal with `tup+` and `tup+*`, manipulating two lists in lockstep. Finally, we applied that same dual-traversal pattern to Peano numbers themselves, decrementing two numbers in lockstep to build `o>`, `o<`, and `o=`.

What breaks without this: If you remove `(cdr tup)` from `addtup` and pass `tup` instead, your program will crash with an out of memory error, as it will endlessly try to add the first element of the list to an infinitely nested series of itself.

Exercises:
1. Write `max-tup` which returns the maximum element in a tuple. You will need to use your `o>` function.
2. Write `min-tup` which returns the minimum element in a tuple.

Definition of done:
- [x] All functions implemented and tested.
- [x] Checked into version control with the message: `Implement tuple accumulation and Peano comparators to master the Fourth Commandment.`
