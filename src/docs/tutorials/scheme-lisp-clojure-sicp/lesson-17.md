# Lesson 17: Named `let` — Loops Without Looping

Named `let` is Scheme's idiomatic loop — it is how Scheme programmers write what other languages write with `for` and `while`. In this lesson, you will learn how named `let` creates a locally-named recursive function and immediately calls it, giving a clean way to write tail-recursive iteration with accumulators. You will rewrite `my-reverse`, `my-length`, and a string-processing function using named let. The transferable problems you will solve include understanding syntactic sugar, managing loop state with accumulators, and ensuring tail-call optimization so loops do not consume stack frames.

**What you need to know first:**
- All prior concepts through `let`, `let*`, `letrec`, structural recursion, accumulators, and `my-reverse` (Lessons 0–16).

**Terms used in this lesson:**
- **named `let`** — Syntactic sugar for an immediately-invoked recursive function. It solves the problem of writing tight, local loops with accumulators without polluting the outer scope with helper functions.
- **`letrec`** — A binding form that allows local variables to refer to themselves. It provides the mechanism for defining local recursive functions, which is what named `let` compiles down to.
- **`lambda`** — The syntax for creating anonymous functions. It encapsulates the body of our loops.
- **`if`** — The fundamental branching syntax. It evaluates to one of two expressions based on a condition, acting as our loop exit check.
- **`when`** — A one-armed conditional used for side effects. It executes its body only if the condition is true, useful in imperative loops.
- **`cond`** — A multi-branch conditional syntax that avoids deeply nested `if` expressions, allowing cleanly separated base cases and recursive steps.
- **`define`** — The top-level binding syntax used to create global variables and functions.
- **`#f`** — The literal boolean false value, used to indicate failure in search loops.
- **tail position** — The last thing evaluated in a function body. A loop only stays efficient (O(1) space) when its recursive call is in tail position.

**Objects and methods used:**

- **`zero?`**
  - *What it is:* A predicate function that checks if a number is zero.
  - *Implementation:* `(zero? z)` → boolean
  - *Its use:* To check the base condition of the countdown loop.
  - *Type:* Function
  - *Responsibility:* Returns `#t` if the argument is numeric zero, `#f` otherwise.
  - *Depends on:* A single numeric argument.
  - *Connects to:* Called by our loops to test termination conditions.
  - *Shape:* A built-in procedure in the Scheme standard library.

- **`-`**
  - *What it is:* A mathematical function for subtraction.
  - *Implementation:* `(- z1 z2 ...)` → number
  - *Its use:* To decrement our loop counters.
  - *Type:* Function
  - *Responsibility:* Subtracts the arguments from the first one.
  - *Depends on:* One or more numeric arguments.
  - *Connects to:* Called to compute the next value for recursive loops.
  - *Shape:* A built-in procedure in the Scheme standard library.

- **`*`**
  - *What it is:* A mathematical function for multiplication.
  - *Implementation:* `(* z ...)` → number
  - *Its use:* To compute the factorial by multiplying the accumulator.
  - *Type:* Function
  - *Responsibility:* Returns the product of its arguments.
  - *Depends on:* Zero or more numeric arguments.
  - *Connects to:* Called to update the accumulator.
  - *Shape:* A built-in procedure.

- **`null?`**
  - *What it is:* A predicate function that checks if a list is empty.
  - *Implementation:* `(null? obj)` → boolean
  - *Its use:* To test the base case for list processing loops.
  - *Type:* Function
  - *Responsibility:* Returns `#t` if the argument is the empty list `()`, `#f` otherwise.
  - *Depends on:* A single argument (usually a list).
  - *Connects to:* Evaluated in the condition of `if` or `cond`.
  - *Shape:* A built-in procedure.

- **`cdr`**
  - *What it is:* A list accessor function that returns the rest of the list after the first element.
  - *Implementation:* `(cdr pair)` → value
  - *Its use:* To advance the loop to the next element in a list.
  - *Type:* Function
  - *Responsibility:* Retrieves the second part of a cons cell.
  - *Depends on:* A non-empty list (pair).
  - *Connects to:* Called inside the recursive loop invocation.
  - *Shape:* A built-in procedure.

- **`+`**
  - *What it is:* A mathematical function for addition.
  - *Implementation:* `(+ z ...)` → number
  - *Its use:* To increment the counter or sum the accumulator.
  - *Type:* Function
  - *Responsibility:* Returns the sum of its arguments.
  - *Depends on:* Zero or more numeric arguments.
  - *Connects to:* Called to update state variables in loops.
  - *Shape:* A built-in procedure.

- **`car`**
  - *What it is:* A list accessor function that returns the first element.
  - *Implementation:* `(car pair)` → value
  - *Its use:* To access the current element of the list being processed.
  - *Type:* Function
  - *Responsibility:* Retrieves the first part of a cons cell.
  - *Depends on:* A non-empty list (pair).
  - *Connects to:* Called to get data for computations or predicates.
  - *Shape:* A built-in procedure.

- **`cons`**
  - *What it is:* A constructor function that creates a new pair (cons cell).
  - *Implementation:* `(cons obj1 obj2)` → pair
  - *Its use:* To build a new list by prepending the current element.
  - *Type:* Function
  - *Responsibility:* Allocates a new pair containing the two arguments.
  - *Depends on:* Two arguments (an element and a list, conventionally).
  - *Connects to:* Called to construct the accumulator in `my-reverse`.
  - *Shape:* A built-in procedure.

- **`>`**
  - *What it is:* A predicate function for strict greater-than comparison.
  - *Implementation:* `(> x1 x2 ...)` → boolean
  - *Its use:* To check if the loop counter has not reached zero.
  - *Type:* Function
  - *Responsibility:* Returns `#t` if the arguments are strictly monotonically decreasing.
  - *Depends on:* Real number arguments.
  - *Connects to:* Evaluated in the `when` condition.
  - *Shape:* A built-in procedure.

- **`display`**
  - *What it is:* An output function that prints human-readable text.
  - *Implementation:* `(display obj)` → void
  - *Its use:* To print the countdown numbers and string.
  - *Type:* Function
  - *Responsibility:* Writes a representation of the object to the current output port.
  - *Depends on:* Any Scheme object.
  - *Connects to:* Called for its side-effects in the countdown loop.
  - *Shape:* A built-in procedure.

- **`newline`**
  - *What it is:* An output function that prints a newline character.
  - *Implementation:* `(newline)` → void
  - *Its use:* To move the cursor to the next line after the countdown.
  - *Type:* Function
  - *Responsibility:* Writes a line termination sequence to the current output port.
  - *Depends on:* Nothing.
  - *Connects to:* Called for its side-effects.
  - *Shape:* A built-in procedure.

- **`even?`**
  - *What it is:* A predicate function that checks if an integer is even.
  - *Implementation:* `(even? n)` → boolean
  - *Its use:* To test if elements in the list meet the search criteria.
  - *Type:* Function
  - *Responsibility:* Returns `#t` if the argument is an even integer.
  - *Depends on:* An integer argument.
  - *Connects to:* Passed as a predicate to `find`, or called inside the loop.
  - *Shape:* A built-in procedure.

---

## Concept Unit: Named `let` Syntax

### The Problem

Writing tail-recursive loops with accumulators requires defining a helper function. Using `define` creates a global function that pollutes the namespace, and even using a local `letrec` is verbose. We want a clean, inline way to declare a local loop with initial state.

### Introduce the concept in isolation

We can use a special form of `let` that includes a name before the bindings. This is called **named `let`**.

```scheme
(let loop ([n 5] [acc 1])
  (if (zero? n)
      acc
      (loop (- n 1) (* acc n))))
```

**Output:**
```
120
```

This proves that `loop` acts as a function we can call recursively within its own body, and `n` and `acc` are initialized to `5` and `1`.

### Discard the throwaway example

This throwaway code is discarded and will not be kept in the project.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating the desugaring mechanism.
- **Files affected:** `scratch.scm` (temporary)
- **Change type:** Add
- **Location:** At the top.
- **Dependencies:** None.

### The New Code

```scheme
(letrec ([loop (lambda (n acc)
                 (if (zero? n) 
                     acc 
                     (loop (- n 1) (* acc n))))])
  (loop 5 1))
```

### The Updated Project

```scheme
// ← new
(letrec ([loop (lambda (n acc)
                 (if (zero? n) 
                     acc 
                     (loop (- n 1) (* acc n))))])
  (loop 5 1))
```

This is the exact desugared equivalent of our named `let`.

### Mechanical Walkthrough

- `letrec` — A binding form that allows the `loop` variable to refer to itself in its own definition.
- `[` — Opens the binding list.
- `loop` — The local variable name.
- `(lambda (n acc) ...)` — Creates an anonymous function taking the current state as arguments `n` and `acc`.
- `(if (zero? n)` — The base case check. `zero?` tests if `n` is 0.
- `acc` — The return value of the function when the base case is met.
- `(loop (- n 1) (* acc n))` — The recursive call. We pass the decremented `n` and the accumulated product.
- `]` — Closes the binding list.
- `(loop 5 1)` — The immediate invocation of our newly defined `loop` function with the initial values `5` and `1`.

### Execution Trace

```text
Iteration 1: n = 5, acc = 1. zero? is false. Call loop(4, 5).
Iteration 2: n = 4, acc = 5. zero? is false. Call loop(3, 20).
Iteration 3: n = 3, acc = 20. zero? is false. Call loop(2, 60).
Iteration 4: n = 2, acc = 60. zero? is false. Call loop(1, 120).
Iteration 5: n = 1, acc = 120. zero? is false. Call loop(0, 120).
Iteration 6: n = 0, acc = 120. zero? is true. Return 120.
```

---

## Concept Unit: `my-length` Using Named `let`

### The Problem

We want to calculate the length of a list iteratively, without consuming stack frames. Standard recursion builds a tower of `(+ 1 ...)` operations. We need an accumulator loop.

### Introduce the concept in isolation

```scheme
(let loop ([lst '(a b c)] [count 0])
  (if (null? lst)
      count
      (loop (cdr lst) (+ count 1))))
```

**Output:**
```
3
```

This proves that the named `let` gracefully iterates over a list and accumulates a running total.

### Discard the throwaway example

This throwaway code is discarded.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are rewriting our list tools.
- **Files affected:** `list-tools.scm`
- **Change type:** Add
- **Location:** Appended to the file.
- **Dependencies:** None.

### The New Code

```scheme
(define (my-length lst)
  (let loop ([lst lst] [count 0])
    (if (null? lst)
        count
        (loop (cdr lst) (+ count 1)))))
```

### The Updated Project

```scheme
// ← new
(define (my-length lst)
  (let loop ([lst lst] [count 0])
    (if (null? lst)
        count
        (loop (cdr lst) (+ count 1)))))
```

We have defined a new version of `my-length` that encapsulates its own iterative loop.

### Mechanical Walkthrough

- `define` — Binds the function globally.
- `(my-length lst)` — The function signature.
- `let loop` — Initiates the named let, defining the recursive function `loop`.
- `[lst lst]` — Binds the loop variable `lst` to the initial argument `lst`. Shadowing is common and idiomatic here.
- `[count 0]` — Initializes the accumulator to 0.
- `(if (null? lst)` — Tests if the remaining list is empty.
- `count` — Returns the accumulated total.
- `(loop (cdr lst) (+ count 1))` — The tail-recursive call. It passes the rest of the list and the incremented count. This is in **tail position**, meaning it is the last evaluation step.

### Execution Trace

Given `(my-length '(a b c d))`:
```text
Iteration 1: lst = '(a b c d), count = 0. null? is false. Call loop('(b c d), 1).
Iteration 2: lst = '(b c d), count = 1. null? is false. Call loop('(c d), 2).
Iteration 3: lst = '(c d), count = 2. null? is false. Call loop('(d), 3).
Iteration 4: lst = '(d), count = 3. null? is false. Call loop('(), 4).
Iteration 5: lst = '(), count = 4. null? is true. Return 4.
```

---

## Concept Unit: `my-reverse` Using Named `let`

### The Problem

Reversing a list efficiently is O(n) using an accumulator. In Lesson 12, we used a nested `define` for the helper. We want a cleaner, inline expression using named `let`.

### Introduce the concept in isolation

```scheme
(let loop ([lst '(1 2)] [acc '()])
  (if (null? lst)
      acc
      (loop (cdr lst) (cons (car lst) acc))))
```

**Output:**
```
(2 1)
```

This proves that `cons`-ing the `car` of the list onto the accumulator effectively reverses the list.

### Discard the throwaway example

This throwaway code is discarded.

### Project Change

- **Reference Source:** No reference counterpart — rewriting `my-reverse`.
- **Files affected:** `list-tools.scm`
- **Change type:** Add
- **Location:** Below `my-length`.
- **Dependencies:** None.

### The New Code

```scheme
(define (my-reverse lst)
  (let loop ([lst lst] [acc '()])
    (if (null? lst)
        acc
        (loop (cdr lst) (cons (car lst) acc)))))
```

### The Updated Project

```scheme
// ← new
(define (my-reverse lst)
  (let loop ([lst lst] [acc '()])
    (if (null? lst)
        acc
        (loop (cdr lst) (cons (car lst) acc)))))
```

This defines `my-reverse` using an idiomatic named `let` loop.

### Mechanical Walkthrough

- `define` — Binds `my-reverse`.
- `(my-reverse lst)` — Function signature taking one list.
- `let loop` — The named let.
- `[lst lst]` — Initializes loop's `lst` to the argument `lst`.
- `[acc '()]` — Initializes the accumulator to the empty list.
- `(if (null? lst)` — The loop termination condition.
- `acc` — The fully reversed list, returned when the input list is exhausted.
- `(loop ...)` — The tail call.
- `(cdr lst)` — The remaining elements of the list to process.
- `(cons (car lst) acc)` — Creates a new pair with the current element at the front of the accumulator.

### Execution Trace

Given `(my-reverse '(1 2 3))`:
```text
Iteration 1: lst = '(1 2 3), acc = '(). null? is false. Call loop('(2 3), '(1)).
Iteration 2: lst = '(2 3), acc = '(1). null? is false. Call loop('(3), '(2 1)).
Iteration 3: lst = '(3), acc = '(2 1). null? is false. Call loop('(), '(3 2 1)).
Iteration 4: lst = '(), acc = '(3 2 1). null? is true. Return '(3 2 1).
```

---

## Concept Unit: Countdown Timer

### The Problem

We often want a loop that acts purely for side effects — like a `for` loop that prints numbers. Scheme uses named let for this imperative-style looping too.

### Introduce the concept in isolation

```scheme
(let loop ([i 3])
  (when (> i 0)
    (display i)
    (display " ")
    (loop (- i 1))))
```

**Output:**
```
3 2 1 
```

This proves that named `let` can be used strictly for execution control, acting as a standard `while` or `for` loop.

### Discard the throwaway example

This throwaway code is discarded.

### Project Change

- **Reference Source:** No reference counterpart — demonstrating side effects.
- **Files affected:** `scratch.scm`
- **Change type:** Add
- **Location:** At the bottom.
- **Dependencies:** None.

### The New Code

```scheme
(define (print-countdown n)
  (let loop ([i n])
    (when (> i 0)
      (display i)
      (display " ")
      (loop (- i 1))))
  (newline)
  (display "Liftoff!"))
```

### The Updated Project

```scheme
// ← new
(define (print-countdown n)
  (let loop ([i n])
    (when (> i 0)
      (display i)
      (display " ")
      (loop (- i 1))))
  (newline)
  (display "Liftoff!"))
```

A complete function that counts down and prints a completion message.

### Mechanical Walkthrough

- `define (print-countdown n)` — The function definition.
- `let loop ([i n])` — The named let acting as our `for` loop. `i` is the loop variable.
- `(when (> i 0)` — The loop condition. It executes the body only if `i` is greater than `0`.
- `(display i)` — Prints the current loop counter.
- `(display " ")` — Prints a space separator.
- `(loop (- i 1))` — The increment (decrement) step, calling the loop again with `i - 1`.
- `(newline)` — Prints a newline after the loop finishes.
- `(display "Liftoff!")` — Prints the final message.

### Execution Trace

Given `(print-countdown 3)`:
```text
Iteration 1: i = 3. (> 3 0) is true. Print "3 ". Call loop(2).
Iteration 2: i = 2. (> 2 0) is true. Print "2 ". Call loop(1).
Iteration 3: i = 1. (> 1 0) is true. Print "1 ". Call loop(0).
Iteration 4: i = 0. (> 0 0) is false. `when` body skipped. Loop terminates.
```

---

## Concept Unit: Summing a List

### The Problem

We need to iterate over a list of numbers and collapse them into a single sum. This is a fold operation, written manually as a loop.

### Introduce the concept in isolation

```scheme
(let loop ([lst '(10 20)] [total 0])
  (if (null? lst)
      total
      (loop (cdr lst) (+ total (car lst)))))
```

**Output:**
```
30
```

This proves that we can update a `total` accumulator at every step by adding the current list element.

### Discard the throwaway example

This throwaway code is discarded.

### Project Change

- **Reference Source:** No reference counterpart — writing a manual fold.
- **Files affected:** `list-tools.scm`
- **Change type:** Add
- **Location:** Below `my-reverse`.
- **Dependencies:** None.

### The New Code

```scheme
(define (sum-list lst)
  (let loop ([lst lst] [total 0])
    (if (null? lst)
        total
        (loop (cdr lst) (+ total (car lst))))))
```

### The Updated Project

```scheme
// ← new
(define (sum-list lst)
  (let loop ([lst lst] [total 0])
    (if (null? lst)
        total
        (loop (cdr lst) (+ total (car lst))))))
```

The `sum-list` function computes the total of a list of numbers in O(n) time and O(1) space.

### Mechanical Walkthrough

- `define (sum-list lst)` — The function declaration.
- `let loop ([lst lst] [total 0])` — The named let. `total` is our accumulator.
- `(if (null? lst)` — The empty-list check.
- `total` — The final sum to return.
- `(loop (cdr lst) (+ total (car lst)))` — The tail call. We pass the rest of the list, and the new total which is the old total plus the current element (`car lst`).

### Execution Trace

Given `(sum-list '(1 2 3 4 5))`:
```text
Iteration 1: lst = '(1 2 3 4 5), total = 0. Call loop('(2 3 4 5), 1).
Iteration 2: lst = '(2 3 4 5), total = 1. Call loop('(3 4 5), 3).
Iteration 3: lst = '(3 4 5), total = 3. Call loop('(4 5), 6).
Iteration 4: lst = '(4 5), total = 6. Call loop('(5), 10).
Iteration 5: lst = '(5), total = 10. Call loop('(), 15).
Iteration 6: lst = '(), total = 15. null? is true. Return 15.
```

---

## Concept Unit: Finding an Element With Early Exit

### The Problem

When searching a list, we don't want to process the entire list if we find a match early. We need a way to break out of our loop as soon as the answer is known.

### Introduce the concept in isolation

```scheme
(let loop ([lst '(1 3 4 7 8)])
  (cond
    [(null? lst) #f]
    [(even? (car lst)) (car lst)]
    [else (loop (cdr lst))]))
```

**Output:**
```
4
```

This proves that returning a value directly (like `(car lst)`) rather than calling `loop` again acts as an early exit or break statement.

### Discard the throwaway example

This throwaway code is discarded.

### Project Change

- **Reference Source:** No reference counterpart — writing an early-exit search.
- **Files affected:** `list-tools.scm`
- **Change type:** Add
- **Location:** Appended to the file.
- **Dependencies:** None.

### The New Code

```scheme
(define (find pred? lst)
  (let loop ([lst lst])
    (cond
      [(null? lst) #f]
      [(pred? (car lst)) (car lst)]
      [else (loop (cdr lst))])))
```

### The Updated Project

```scheme
// ← new
(define (find pred? lst)
  (let loop ([lst lst])
    (cond
      [(null? lst) #f]
      [(pred? (car lst)) (car lst)]
      [else (loop (cdr lst))])))
```

A generic `find` function that takes a predicate function and a list, returning the first matching element or `#f`.

### Mechanical Walkthrough

- `define (find pred? lst)` — The function declaration, taking a predicate function `pred?` and the list.
- `let loop ([lst lst])` — The named let loop.
- `cond` — The multi-branch conditional.
- `[(null? lst) #f]` — If the list is empty, we found nothing, return the literal `#f`.
- `[(pred? (car lst)) (car lst)]` — We call the predicate function on the current element. If it returns true, we return the element immediately. This is our early exit.
- `[else (loop (cdr lst))]` — If neither condition is met, we continue the loop with the rest of the list.

### Execution Trace

Given `(find even? '(1 3 4 7 8))`:
```text
Iteration 1: lst = '(1 3 4 7 8). null? is false. (even? 1) is false. Call loop('(3 4 7 8)).
Iteration 2: lst = '(3 4 7 8). null? is false. (even? 3) is false. Call loop('(4 7 8)).
Iteration 3: lst = '(4 7 8). null? is false. (even? 4) is true. Return 4 immediately.
```
