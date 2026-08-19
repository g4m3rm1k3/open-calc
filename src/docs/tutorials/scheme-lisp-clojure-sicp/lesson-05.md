# Lesson 5: The First Commandment — Recur on the `cdr`

What you will build: The reader will write their first genuinely recursive functions on lists — functions that call themselves on the `cdr` of their input until the list is null. The transferable problems: (1) structural recursion — a function whose structure mirrors the structure of its data; (2) the base case — the condition that stops the recursion, always `(null? lst)` for a proper list; (3) the recursive case — do something with `(car lst)`, then recur on `(cdr lst)`; (4) why this pattern always terminates: a proper list has finite length, and `cdr` shrinks it by one on every call.

What you need to know first: Lesson 0 (S-expressions, REPL, prefix notation, #lang racket), Lesson 1 (cons, car, cdr, pair?, atom?), Lesson 2 (list, null?, length, append, list?, nested lists, quote), Lesson 3 (define, lambda, closures), Lesson 4 (if, cond, booleans, and/or/not).

## Terms used in this lesson

- **structural recursion** — A function whose logic perfectly mirrors the shape of the data it operates on. For a list, which is either empty or a pair of an element and another list, structural recursion means writing a function that checks for the empty list, and if not, does something with the first element and recurs on the rest.
- **base case** — The condition that stops a recursive function from calling itself forever. For lists, this is almost always reaching the empty list. It prevents infinite loops and crashes.
- **recursive case** — The branch of a recursive function that makes the function call itself, always on a strictly smaller piece of data (like the `cdr` of a list) to guarantee progress toward the base case.
- **The First Commandment** — The fundamental rule of writing recursive list functions: always ask two questions. Is it null? If not, what is its car and what is its cdr? It exists because asking anything else first risks crashing on an empty list.
- **call stack** — The internal data structure the runtime uses to keep track of active function calls. It exists so a function can call itself and eventually return to the correct place with the correct context.
- **stack frame** — A single entry on the call stack, representing one active function call, holding its local variables, arguments, and the exact spot to return to when finished.
- **S-expression** — The fundamental syntax of Lisp, representing both code and data as nested lists.
- **REPL** — Read-Eval-Print Loop, the interactive environment where you type code and immediately see results.
- **prefix notation** — Writing the operator before the operands (e.g., `(+ 1 2)`), allowing uniform syntax for everything.
- **#lang racket** — The declaration that tells the system to interpret the file as Racket code.
- **cons** — The fundamental operation that builds a pair (a cons cell) out of two values.
- **car** — The operation that retrieves the first half of a cons cell (the first element of a list).
- **cdr** — The operation that retrieves the second half of a cons cell (the rest of the list).
- **pair?** — A predicate that checks if a value is a cons cell.
- **atom?** — A predicate that checks if a value is basic data (not a pair and not null).
- **list** — A sequence built from nested cons cells, ending in the empty list.
- **null?** — A predicate that checks if a value is the empty list `()`.
- **length** — A built-in function that counts the number of elements in a list.
- **append** — A built-in function that joins two lists together.
- **list?** — A predicate that checks if a value is a proper list.
- **nested list** — A list that contains other lists as elements.
- **quote** — A special form that tells the evaluator to treat an S-expression as literal data rather than code to be executed.
- **define** — The form used to bind a name to a value or a function in the global environment.
- **lambda** — The form used to create anonymous functions, capturing their environment.
- **closure** — A function bundled with the environment in which it was defined, allowing it to remember variables from that scope.
- **if** — The fundamental conditional form, evaluating a test and then choosing between a true branch and a false branch.
- **cond** — A multi-branch conditional form, cleaner than nested `if`s for checking multiple cases.
- **boolean** — A data type representing true (`#t`) or false (`#f`).
- **and** — A logical operator that returns true if all its arguments are true, short-circuiting on the first false.
- **or** — A logical operator that returns true if any of its arguments are true, short-circuiting on the first true.
- **not** — A logical operator that inverts a boolean value.

## Objects and methods used

- **`+`**
  - *What it is:* The built-in addition function.
  - *Implementation:* A function taking any number of numeric arguments and returning their sum.
  - *Its use:* Used to add 1 to the count in our length function.
  - *Type:* Built-in function.
  - *Responsibility:* Computes the mathematical sum of its arguments.
  - *Depends on:* Numeric arguments.
  - *Connects to:* Called by our recursive counting functions.
  - *Shape:* A standard library primitive.

- **`-`**
  - *What it is:* The built-in subtraction function.
  - *Implementation:* A function taking numbers and subtracting them.
  - *Its use:* Used to decrement the counter in our countdown function.
  - *Type:* Built-in function.
  - *Responsibility:* Computes the mathematical difference of its arguments.
  - *Depends on:* Numeric arguments.
  - *Connects to:* Called by our countdown loop.
  - *Shape:* A standard library primitive.

- **`=`**
  - *What it is:* The built-in numeric equality predicate.
  - *Implementation:* A function `(= a b)` returning `#t` if the numbers are mathematically equal.
  - *Its use:* Used to test if our countdown has reached 0.
  - *Type:* Built-in function.
  - *Responsibility:* Determines numerical equality.
  - *Depends on:* Numeric arguments.
  - *Connects to:* Used as the condition in `if` expressions.
  - *Shape:* A standard library primitive.

- **`display`**
  - *What it is:* A side-effecting output function.
  - *Implementation:* A function `(display val)` that prints the value to standard output.
  - *Its use:* Used to show the sequence of numbers in our countdown trace.
  - *Type:* Built-in function.
  - *Responsibility:* Writes text to the output stream.
  - *Depends on:* Any printable value.
  - *Connects to:* Called purely for its side effect in a `begin` block.
  - *Shape:* A standard library primitive.

- **`equal?`**
  - *What it is:* A deep-equality predicate.
  - *Implementation:* A function `(equal? a b)` returning `#t` if `a` and `b` have the same structure and contents.
  - *Its use:* Used to compare elements in our list searching function.
  - *Type:* Built-in function.
  - *Responsibility:* Determines if two arbitrary values are structurally identical.
  - *Depends on:* Any two values.
  - *Connects to:* Used in `cond` clauses to check for matches.
  - *Shape:* A standard library primitive.

---

## Concept Unit: The Call Stack

### The Problem

Before writing recursive code that operates on lists, we need to understand what happens when a function calls itself. How does the language keep track of where it is, what variables it has, and where to return when a function pauses to invoke itself again?

### Introduce the concept in isolation

Let's write a simple countdown function that prints numbers until it hits zero.

```scheme
#lang racket

(define (countdown n)
  (if (= n 0)
      (display "Done!\n")
      (begin
        (display n)
        (display " ")
        (countdown (- n 1)))))

(countdown 3)
```

**Real output:**
```
3 2 1 Done!
```

This output proves that the function successfully executes repeatedly with decreasing values of `n`, and eventually stops. This mechanism is governed by the **call stack**.

### Discard the throwaway example

The `countdown` function is a throwaway example to demonstrate stack frames. We will delete it and not use it in our project again.

### Project Change

No reference counterpart — this is a from-scratch addition because we are starting our own library of list operations.
- **Files affected:** `my-list-ops.rkt` (created)
- **Change type:** add
- **Location:** At the top of the file.
- **Dependencies:** None.

### The New Code

```scheme
#lang racket
```

### The Updated Project

```scheme
#lang racket
// ← new file created
```

We have established our blank slate.

### Mechanical walkthrough

- `#lang racket` — the language declaration, telling the evaluator to treat the file as a Racket program.

**How the Call Stack works:**
Every time a function is called, the runtime pushes a new **stack frame** onto the **call stack**. A stack frame holds the arguments (`n = 3`), local variables, and the return address. 
When `(countdown 3)` calls `(countdown 2)`, the frame for `3` pauses, and a new frame for `2` is pushed on top. 
When `(countdown 0)` finishes, its frame is popped off the stack, and execution resumes in the frame for `1`, which finishes and pops, and so on.

---

## Concept Unit: `my-length`

### The Problem

We need a function that counts the elements in a list, but we can only use primitive operations like `car`, `cdr`, and `null?`. We must traverse the list, counting one for each element, until we run out of list.

### Introduce the concept in isolation

Let's test the idea of counting a nested structure simply.

```scheme
(define (count-two)
  (+ 1 (+ 1 0)))

(count-two)
```

**Real output:**
```
2
```

This output proves we can build up a count by chaining `+ 1` operations. We will now apply this to **structural recursion**.

### Discard the throwaway example

The `count-two` example is deleted.

### Project Change

No reference counterpart — this is a from-scratch addition.
- **Files affected:** `my-list-ops.rkt` (modified)
- **Change type:** add
- **Location:** Below the `#lang racket` line.
- **Dependencies:** None.

### The New Code

```scheme
(define (my-length lst)
  (if (null? lst)
      0
      (+ 1 (my-length (cdr lst)))))
```

### The Updated Project

```scheme
#lang racket

(define (my-length lst) // ← new
  (if (null? lst)       // ← new
      0                 // ← new
      (+ 1 (my-length (cdr lst))))) // ← new
```

Our module now has a custom function to calculate the length of a proper list.

### Mechanical walkthrough

- `define` — binds the name `my-length`.
- `my-length` — a function taking one argument, `lst`.
- `if` — evaluates a test condition.
- `null?` — checks if `lst` is the empty list `()`. This is our **base case**.
- `0` — the return value if the list is empty. An empty list has 0 elements.
- `+` — the addition function.
- `1` — represents the single element we are currently looking at (`car lst`).
- `my-length` — the function calls itself. This is the **recursive case**.
- `cdr` — extracts the rest of the list. We recur on `(cdr lst)`, which is strictly shorter.

**Execution trace for `(my-length '(a b c))`:**
- Call 1: `lst = '(a b c)`. `(null? lst)` is false. Returns `(+ 1 (my-length '(b c)))`.
- Call 2: `lst = '(b c)`. `(null? lst)` is false. Returns `(+ 1 (my-length '(c)))`.
- Call 3: `lst = '(c)`. `(null? lst)` is false. Returns `(+ 1 (my-length '()))`.
- Call 4: `lst = '()`. `(null? lst)` is true. Returns `0`.
- Unwind 4 to 3: `0` replaces `(my-length '())`. Frame 3 calculates `(+ 1 0) = 1`. Returns `1`.
- Unwind 3 to 2: `1` replaces `(my-length '(c))`. Frame 2 calculates `(+ 1 1) = 2`. Returns `2`.
- Unwind 2 to 1: `2` replaces `(my-length '(b c))`. Frame 1 calculates `(+ 1 2) = 3`. Returns `3`.

This terminates because every proper list has finite length, and passing `(cdr lst)` shrinks the list by one element every time. Eventually, we hit the empty list.

---

## Concept Unit: `my-member?`

### The Problem

We want to search a list to see if it contains a specific atom. This requires checking elements one by one until we either find it or run out of list.

### Introduce the concept in isolation

Let's test comparing an item.

```scheme
(equal? 'b 'b)
```

**Real output:**
```
#t
```

This output proves `equal?` successfully compares symbols for equality.

### Discard the throwaway example

The `equal?` test is deleted.

### Project Change

No reference counterpart.
- **Files affected:** `my-list-ops.rkt` (modified)
- **Change type:** add
- **Location:** Below `my-length`.
- **Dependencies:** None.

### The New Code

```scheme
(define (my-member? atom lst)
  (cond
    [(null? lst) #f]
    [(equal? (car lst) atom) #t]
    [else (my-member? atom (cdr lst))]))
```

### The Updated Project

```scheme
#lang racket

(define (my-length lst)
  (if (null? lst)
      0
      (+ 1 (my-length (cdr lst)))))

(define (my-member? atom lst) // ← new
  (cond // ← new
    [(null? lst) #f] // ← new
    [(equal? (car lst) atom) #t] // ← new
    [else (my-member? atom (cdr lst))])) // ← new
```

Our module can now search for elements inside a list.

### Mechanical walkthrough

- `define` — binds `my-member?`.
- `cond` — multi-branch conditional.
- `null?` — tests if the list is empty. This is the first **base case** (ran out).
- `#f` — if the list is empty, the atom is definitely not in it.
- `equal?` — compares the first element of the list to our target `atom`.
- `car` — retrieves the first element to check it.
- `#t` — this is the second **base case** (found it). If the `car` matches, we stop and return true immediately.
- `else` — the default branch if both tests fail.
- `my-member?` — the recursive call on the rest of the list.
- `cdr` — shrinks the list for the next call.

**Execution trace for `(my-member? 'b '(a b c))`:**
- Call 1: `atom = 'b`, `lst = '(a b c)`. `(null? lst)` is false. `(equal? 'a 'b)` is false. Returns `(my-member? 'b '(b c))`.
- Call 2: `atom = 'b`, `lst = '(b c)`. `(null? lst)` is false. `(equal? 'b 'b)` is true. Returns `#t`.
- Unwind: `#t` propagates straight back up the call stack.

Most list recursions have exactly these two base cases: the "null" case (we exhausted the data) and the "found" case (we achieved our goal early).

---

## Concept Unit: `my-first`

### The Problem

Given a list of non-empty lists, we want to extract the first element of each sublist and return a new list containing just those elements. 

### Introduce the concept in isolation

Let's test combining elements into a new list.

```scheme
(cons 'a (cons 'c '()))
```

**Real output:**
```
'(a c)
```

This output proves we can build a list incrementally using `cons`.

### Discard the throwaway example

The list-building example is deleted.

### Project Change

No reference counterpart.
- **Files affected:** `my-list-ops.rkt` (modified)
- **Change type:** add
- **Location:** Below `my-member?`.
- **Dependencies:** None.

### The New Code

```scheme
(define (my-first lsts)
  (if (null? lsts)
      '()
      (cons (car (car lsts))
            (my-first (cdr lsts)))))
```

### The Updated Project

```scheme
#lang racket

(define (my-length lst)
  (if (null? lst)
      0
      (+ 1 (my-length (cdr lst)))))

(define (my-member? atom lst)
  (cond
    [(null? lst) #f]
    [(equal? (car lst) atom) #t]
    [else (my-member? atom (cdr lst))]))

(define (my-first lsts) // ← new
  (if (null? lsts) // ← new
      '() // ← new
      (cons (car (car lsts)) // ← new
            (my-first (cdr lsts))))) // ← new
```

Our module can now extract elements and build a completely new list out of them.

### Mechanical walkthrough

- `define` — binds `my-first`.
- `if` — branches based on a test.
- `null?` — tests if the list of lists is empty. The base case.
- `'()` — returns the empty list, which acts as the foundation for our new list.
- `cons` — attaches a new element to the front of a list.
- `car` — retrieves the first sublist from `lsts`.
- `car` (inner) — retrieves the first element from that sublist.
- `my-first` — the recursive call.
- `cdr` — retrieves the rest of the list of lists.

**Execution trace for `(my-first '((a b) (c d) (e f)))`:**
- Call 1: `lsts = '((a b) (c d) (e f))`. Not null. Returns `(cons 'a (my-first '((c d) (e f))))`.
- Call 2: `lsts = '((c d) (e f))`. Not null. Returns `(cons 'c (my-first '((e f))))`.
- Call 3: `lsts = '((e f))`. Not null. Returns `(cons 'e (my-first '()))`.
- Call 4: `lsts = '()`. Null. Returns `'()`.
- Unwind 4 to 3: `'()` replaces `(my-first '())`. Frame 3 calculates `(cons 'e '()) = '(e)`. Returns `'(e)`.
- Unwind 3 to 2: `'(e)` replaces `(my-first '((e f)))`. Frame 2 calculates `(cons 'c '(e)) = '(c e)`. Returns `'(c e)`.
- Unwind 2 to 1: `'(c e)` replaces `(my-first '((c d) (e f)))`. Frame 1 calculates `(cons 'a '(c e)) = '(a c e)`. Returns `'(a c e)`.

The crucial realization here is that the new list is **built on the way back up the call stack**. The `cons` operations wait in their stack frames until the base case `'()` is returned, and then they execute in reverse order, snapping the list together from back to front.

---

## Closing: The First Commandment

**The First Commandment** from *The Little Schemer*: When recurring on a list, always ask two questions. Is it null? If not, what is its car and what is its cdr?

This is not just a polite convention. It is structural self-defense. If you forget to test `(null? lst)` first and immediately try to take the `car` of an empty list, your program will crash.

If we broke the First Commandment in `my-length`:
```scheme
(define (broken-length lst)
  (+ 1 (broken-length (cdr lst))))
```
Running `(broken-length '())` would attempt `(cdr '())`, instantly raising an error: `cdr: contract violation expected: pair? given: ()`.

Every function we wrote today followed this pattern exactly:
1. `my-length` checked `null?`, then recurred on `cdr`.
2. `my-member?` checked `null?`, checked `car`, then recurred on `cdr`.
3. `my-first` checked `null?`, manipulated `car`, then recurred on `cdr`.

Next up, we will tackle building functions that construct complex structures dynamically.
