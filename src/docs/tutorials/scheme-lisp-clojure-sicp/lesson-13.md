# Lesson 13: Higher-Order Functions — `lambda` Returning `lambda`

What you will build: The reader will learn how functions can return other functions, how to use this to build function factories, and how to write `my-compose` (function composition), `my-curry` (partial application), and a from-scratch implementation of `my-map` using closures. The transferable problems: (1) returning a function from a function is just returning any other value — there is nothing special about it; (2) function composition is a fundamental mathematical operation that is trivially expressible in Scheme; (3) currying — converting a two-argument function into a sequence of single-argument functions — is both practically useful and conceptually reveals what argument application really means.

What you need to know first: Lessons 0-12 (all prior concepts through structural recursion, accumulators, my-reverse, my-zip, my-take/my-drop, closures from Lesson 3, higher-order functions introduced in Lesson 7).

Terms used in this lesson:
- **`lambda`** — The Scheme keyword used to create anonymous functions. It evaluates to a function object (a closure) which can be assigned to a name or returned directly.
- **Closure** — A function that remembers the environment (the variables in scope) where it was created, allowing it to access those variables even after the outer function has finished executing.
- **Higher-Order Function** — A function that either takes one or more functions as arguments, or returns a function as its result.
- **Currying** — The technique of converting a function that takes multiple arguments into a sequence of functions that each take a single argument.
- **Function Composition** — Applying one function to the result of another function, effectively chaining them.
- **Predicate** — A function that returns a boolean value (`#t` or `#f`).
- **Identity Function** — A function that simply returns its argument unchanged.
- **Accumulator** — A parameter in a recursive function that builds up the answer as the recursion proceeds.
- **Structural Recursion** — A recursive pattern where a function consumes a recursive data structure (like a list) and recurses on its smaller parts (like the `cdr`).

Objects and methods used:

**`make-multiplier`**
- *What it is:* A function factory that creates and returns multiplication functions.
- *Implementation:* `(define (make-multiplier n) (lambda (x) (* x n)))`
- *Its use:* Demonstrates the simplest case of a function returning a function.
- *Type:* A top-level function.
- *Responsibility:* Captures a multiplier `n` and returns a function that multiplies its argument by `n`.
- *Depends on:* The numeric argument `n` and the built-in `*` procedure.
- *Connects to:* Called by user code; returns a closure that will be called later.
- *Shape:* A utility function in our library.

**`my-compose`**
- *What it is:* A function that combines two functions into one.
- *Implementation:* `(define (my-compose f g) (lambda (x) (f (g x))))`
- *Its use:* Allows chaining functions together so they execute sequentially.
- *Type:* A top-level higher-order function.
- *Responsibility:* Returns a new function that applies `g` to its argument, then applies `f` to the result.
- *Depends on:* Two functions `f` and `g`.
- *Connects to:* Calls `g`, passing the result into `f`.
- *Shape:* Core abstraction for function pipelines.

**`my-curry`**
- *What it is:* A function that converts a 2-argument function into a nested sequence of 1-argument functions.
- *Implementation:* `(define (my-curry f) (lambda (x) (lambda (y) (f x y))))`
- *Its use:* Demonstrates partial application and deferred execution.
- *Type:* A top-level higher-order function.
- *Responsibility:* Wraps a binary function `f` so arguments can be supplied one at a time.
- *Depends on:* A binary function `f`.
- *Connects to:* Returns nested closures that eventually call `f`.
- *Shape:* Utility function in our core library.

**`my-negate`**
- *What it is:* A higher-order function that produces the logical complement of a predicate.
- *Implementation:* `(define (my-negate pred?) (lambda (x) (not (pred? x))))`
- *Its use:* Enables concise predicate inversions like `not-null?` without writing new named functions.
- *Type:* A top-level higher-order function.
- *Responsibility:* Wraps a predicate and negates its boolean return value.
- *Depends on:* A predicate function `pred?` and the built-in `not`.
- *Connects to:* Calls `pred?` on the input, passes the result to `not`.
- *Shape:* Predicate combinator.

**`my-reduce`**
- *What it is:* A standard right-fold function.
- *Implementation:* `(define (my-reduce f init lst) (if (null? lst) init (f (car lst) (my-reduce f init (cdr lst)))))`
- *Its use:* Acts as the structural iteration engine for reducing a list.
- *Type:* A recursive higher-order function.
- *Responsibility:* Folds a list into a single value using a combining function `f`.
- *Depends on:* A combiner `f`, an initial value `init`, and a list `lst`.
- *Connects to:* Calls `f` on each element and the recursive remainder.
- *Shape:* Fundamental list processor.

**`my-map-via-reduce`**
- *What it is:* An implementation of `map` built entirely on top of `reduce`.
- *Implementation:* `(define (my-map-via-reduce f lst) (my-reduce (lambda (elem rest) (cons (f elem) rest)) '() lst))`
- *Its use:* Proves that mapping is just a specific kind of reduction.
- *Type:* A higher-order function.
- *Responsibility:* Transforms each element in a list by applying `f`, returning a new list.
- *Depends on:* A mapping function `f`, a list `lst`, and `my-reduce`.
- *Connects to:* Calls `my-reduce` with a specific closure.
- *Shape:* A demonstration of functional completeness.

**`my-compose*`**
- *What it is:* A variadic generalization of composition for a list of functions.
- *Implementation:* `(define (my-compose* fns) (if (null? fns) (lambda (x) x) (my-compose (car fns) (my-compose* (cdr fns)))))`
- *Its use:* Allows building long pipelines of operations.
- *Type:* A recursive higher-order function.
- *Responsibility:* Reduces a list of functions into a single composite function.
- *Depends on:* A list of functions `fns` and `my-compose`.
- *Connects to:* Recursively composes the `car` with the composite of the `cdr`.
- *Shape:* Pipeline constructor.

**Everything else in the file, not this lesson's subject but still explained:**

**`lambda`**
- *What it is:* The keyword for anonymous functions.
- *Implementation:* `(lambda (args...) body)`
- *Its use:* To define the functions we return.
- *Type:* Core syntax keyword.
- *Responsibility:* Creates closures.
- *Depends on:* Its lexical environment.
- *Connects to:* Binds arguments to values upon invocation.
- *Shape:* Language primitive.

**`define`**
- *What it is:* The keyword for binding names to values.
- *Implementation:* `(define name value)`
- *Its use:* To give names to our top-level constructs.
- *Type:* Core syntax keyword.
- *Responsibility:* Mutates the top-level environment to register a binding.
- *Depends on:* A name symbol and a value expression.
- *Connects to:* The global environment.
- *Shape:* Language primitive.

**`not`**
- *What it is:* Boolean negation.
- *Implementation:* `(not expr)`
- *Its use:* To flip `#t` to `#f` and vice versa in `my-negate`.
- *Type:* Built-in procedure.
- *Responsibility:* Returns `#t` if its argument is `#f`, and `#f` otherwise.
- *Depends on:* A single argument.
- *Connects to:* N/A.
- *Shape:* Standard library procedure.

**`*`**
- *What it is:* Multiplication procedure.
- *Implementation:* `(* a b ...)`
- *Its use:* Used in our examples and labs to prove math logic.
- *Type:* Built-in procedure.
- *Responsibility:* Returns the product of numbers.
- *Depends on:* Numeric arguments.
- *Connects to:* N/A.
- *Shape:* Standard library procedure.

**`+`**
- *What it is:* Addition procedure.
- *Implementation:* `(+ a b ...)`
- *Its use:* Used in examples.
- *Type:* Built-in procedure.
- *Responsibility:* Returns the sum of numbers.
- *Depends on:* Numeric arguments.
- *Connects to:* N/A.
- *Shape:* Standard library procedure.

**`car`**
- *What it is:* Head accessor for pairs/lists.
- *Implementation:* `(car pair)`
- *Its use:* To get the first element in structural recursion.
- *Type:* Built-in procedure.
- *Responsibility:* Returns the first element of a pair.
- *Depends on:* A non-empty pair.
- *Connects to:* N/A.
- *Shape:* Standard library procedure.

**`cdr`**
- *What it is:* Tail accessor for pairs/lists.
- *Implementation:* `(cdr pair)`
- *Its use:* To get the rest of a list for structural recursion.
- *Type:* Built-in procedure.
- *Responsibility:* Returns the second element of a pair.
- *Depends on:* A non-empty pair.
- *Connects to:* N/A.
- *Shape:* Standard library procedure.

**`cons`**
- *What it is:* Pair constructor.
- *Implementation:* `(cons a b)`
- *Its use:* To build lists element by element.
- *Type:* Built-in procedure.
- *Responsibility:* Allocates a new pair in memory.
- *Depends on:* Two arguments (head and tail).
- *Connects to:* N/A.
- *Shape:* Standard library procedure.

**`null?`**
- *What it is:* Empty list predicate.
- *Implementation:* `(null? val)`
- *Its use:* To test for the base case in structural recursion.
- *Type:* Built-in procedure.
- *Responsibility:* Returns `#t` if the argument is the empty list `()`.
- *Depends on:* An arbitrary argument.
- *Connects to:* N/A.
- *Shape:* Standard library procedure.

**`pair?`**
- *What it is:* Pair predicate.
- *Implementation:* `(pair? val)`
- *Its use:* To test if a value is a pair (used in `my-negate` examples).
- *Type:* Built-in procedure.
- *Responsibility:* Returns `#t` if the argument is a cons cell.
- *Depends on:* An arbitrary argument.
- *Connects to:* N/A.
- *Shape:* Standard library procedure.

**`list`**
- *What it is:* List constructor.
- *Implementation:* `(list a b ...)`
- *Its use:* To build lists of functions for `my-compose*`.
- *Type:* Built-in procedure.
- *Responsibility:* Constructs a proper list from its arguments.
- *Depends on:* Arbitrary arguments.
- *Connects to:* Equivalent to nested `cons` calls.
- *Shape:* Standard library procedure.

---

## Concept Unit: Functions as Return Values

### The Problem

We know that functions can take numbers, strings, and lists as arguments. We also know they can return those same values. In functional programming, functions are "first-class citizens," meaning they are treated exactly like any other value. If we can return a string, we should be able to return a function. But what does that look like, and how do we use it to build "factories" that generate other customized functions on demand?

### Introduce the Concept in Isolation

Let's prove that returning a function is just returning any other value.

```scheme
((lambda (n) (lambda (x) (* x n))) 2)
```

Run this in your REPL.

```text
> ((lambda (n) (lambda (x) (* x n))) 2)
#<procedure>
```

This output proves that the result of calling the outer lambda with `2` is itself a procedure (this is called a **lambda expression**). We haven't run the inner multiplication yet; we just produced a function that *knows* `n` is `2`. To actually run it, we have to call the returned function:

```text
> (((lambda (n) (lambda (x) (* x n))) 2) 5)
10
```

This proves we can invoke the returned procedure immediately by wrapping the entire call in another set of parentheses and passing `5`.

### Discard the Throwaway Example

We will delete these raw nested lambdas. They exist only to prove that functions can generate functions, but they are hard to read without names.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are building our own core functional abstractions.
- **Files affected:** `src/core.scm` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code

Type this precisely:

```scheme
(define (make-multiplier n)
  (lambda (x) (* x n)))

(define double (make-multiplier 2))
(define triple (make-multiplier 3))
```

### The Updated Project

Here is how the file looks now with the new code added:

```scheme
;; ... previous definitions ...

(define (make-multiplier n)
  (lambda (x) (* x n))) ; ← new

(define double (make-multiplier 2)) ; ← new
(define triple (make-multiplier 3)) ; ← new
```

This structure now defines a function factory `make-multiplier` and uses it to generate two custom functions: `double` and `triple`.

### Mechanical Walkthrough

- **`(define (make-multiplier n)`** binds the name `make-multiplier` to a function that takes one argument `n`. This is the factory.
- **`(lambda (x) ...)`** is the return value of `make-multiplier`. It creates a new anonymous function that takes one argument `x`.
- **`(* x n)`** is the body of the inner lambda. It multiplies its own argument `x` by the outer argument `n`.
- **`(make-multiplier 2)`** calls the factory with `n` equal to `2`. It returns a closure where `n` is permanently bound to `2`.
- **`(define double ...)`** saves that returned closure under the name `double`.
- **`(define triple ...)`** does the same for `3`.

When we call `(double 5)`:

```text
Iteration 1: n = 2 (from closure), x = 5 (from call). Body evaluates (* 5 2) -> 10.
```

The closure remembers `n` = 2 from when `make-multiplier` was called. This is the **Closure** pattern we saw in Lesson 3, now used specifically to configure and return behavior dynamically.

---

## Concept Unit: Function Composition (`my-compose`)

### The Problem

Often we want to apply one function, take its result, and pass it directly into another function. Writing `(f (g x))` works for one-off calls, but if we need to pass this combined operation to something like `map` or `filter`, we have to write a custom lambda `(lambda (x) (f (g x)))` every time. We need a way to mathematically compose two functions into a single new function without manually wrapping them.

### Introduce the Concept in Isolation

Let's look at how function composition operates manually before we abstract it.

```scheme
((lambda (x) (add1 (* x 2))) 4)
```

Run this.

```text
> ((lambda (x) (add1 (* x 2))) 4)
9
```

This proves that evaluating from the inside out — first multiplying by 2 (yielding 8), then adding 1 (yielding 9) — works exactly as written (this is a standard **lambda expression**). But the functions `add1` and `*` are hardcoded into the structure.

### Discard the Throwaway Example

We discard this manual wrapping. We want a function that generates this pattern for *any* two functions.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because function composition is a standard utility.
- **Files affected:** `src/core.scm` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file, after `triple`.
- **Dependencies:** `double` from the previous unit.

### The New Code

```scheme
(define (my-compose f g)
  (lambda (x) (f (g x))))

(define add1-then-double (my-compose double add1))
(define double-then-add1 (my-compose add1 double))
```

### The Updated Project

```scheme
(define double (make-multiplier 2))
(define triple (make-multiplier 3))

(define (my-compose f g)
  (lambda (x) (f (g x)))) ; ← new

(define add1-then-double (my-compose double add1)) ; ← new
(define double-then-add1 (my-compose add1 double)) ; ← new
```

This structure introduces `my-compose`, which takes two functions and returns a new function representing their mathematical composition.

### Mechanical Walkthrough

- **`(define (my-compose f g)`** defines a function taking two functions, `f` and `g`.
- **`(lambda (x)`** is the new function being returned. It expects one argument, `x`.
- **`(g x)`** calls the inner function first.
- **`(f ...)`** calls the outer function with the result of `g`.
- **`(my-compose double add1)`** passes `double` as `f` and `add1` as `g`.

Let's trace `(add1-then-double 4)`:

```text
Iteration 1: my-compose closure invoked. f = double, g = add1, x = 4.
Iteration 2: evaluates (g x) -> (add1 4) -> 5.
Iteration 3: evaluates (f 5) -> (double 5) -> 10.
```

Order matters entirely. `(my-compose f g)` means "f after g". An analogy: `(compose format-as-string parse-number)` parses first, then formats the result.

---

## Concept Unit: Currying (`my-curry`)

### The Problem

Some functions take multiple arguments, like `(+ 10 5)`. But what if we only have the `10` right now, and won't get the `5` until later? We'd like to supply the `10`, pause the function, and get back a new function that waits for the remaining argument. This process of splitting a multi-argument function into a chain of single-argument functions is called currying.

### Introduce the Concept in Isolation

Let's manually curry a single expression.

```scheme
(((lambda (x) (lambda (y) (+ x y))) 10) 5)
```

Run this.

```text
> (((lambda (x) (lambda (y) (+ x y))) 10) 5)
15
```

This output proves that we can pass `10` to the first lambda, which returns a second lambda holding `x = 10`. Then we pass `5` to the second lambda (this is an example of a **lambda expression**).

### Discard the Throwaway Example

We delete this nested mess. We want a utility that can curry *any* two-argument function automatically.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating currying explicitly.
- **Files affected:** `src/core.scm` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code

```scheme
(define (my-curry f)
  (lambda (x)
    (lambda (y)
      (f x y))))

(define curried-add (my-curry +))
(define add10 (curried-add 10))
```

### The Updated Project

```scheme
(define double-then-add1 (my-compose add1 double))

(define (my-curry f)
  (lambda (x)
    (lambda (y)
      (f x y)))) ; ← new

(define curried-add (my-curry +)) ; ← new
(define add10 (curried-add 10)) ; ← new
```

This structure defines `my-curry`, which takes a function `f` and transforms it so it accepts its arguments one at a time.

### Mechanical Walkthrough

- **`(define (my-curry f)`** defines the currying wrapper.
- **`(lambda (x)`** returns a function that takes the first argument.
- **`(lambda (y)`** inside that, returns a *second* function that takes the final argument.
- **`(f x y)`** finally calls the original binary function once both arguments are collected.
- **`(my-curry +)`** passes the built-in addition procedure as `f`. It returns a procedure waiting for `x`.
- **`(curried-add 10)`** calls that procedure with `x = 10`. It returns a closure waiting for `y`.
- **`add10`** stores this closure.

Execution trace for `(add10 5)`:

```text
Iteration 1: add10 closure invoked. x = 10 (from environment), y = 5 (passed in).
Iteration 2: evaluates (f x y) -> (+ 10 5) -> 15.
```

This proves that argument application can be deferred and sequenced.

---

## Concept Unit: Predicate Negation (`my-negate`)

### The Problem

When using higher-order functions like `filter`, we often need the exact opposite of an existing predicate. If we have `null?`, but we want to filter for things that are *not* null, we are forced to write `(lambda (x) (not (null? x)))`. This is tedious. We want a function that takes a predicate and automatically returns its logical opposite.

### Introduce the Concept in Isolation

Let's observe boolean negation acting on a procedure call.

```scheme
((lambda (x) (not (null? x))) '(1 2 3))
```

Run this.

```text
> ((lambda (x) (not (null? x))) '(1 2 3))
#t
```

This proves that we can wrap a predicate call in `not` to flip its result (this is a standard **lambda expression**).

### Discard the Throwaway Example

We discard this hardcoded wrapper because we want it to work for *any* predicate, not just `null?`.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because predicate combinators are highly useful.
- **Files affected:** `src/core.scm` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code

```scheme
(define (my-negate pred?)
  (lambda (x) (not (pred? x))))

(define not-null? (my-negate null?))
(define not-pair? (my-negate pair?))
```

### The Updated Project

```scheme
(define add10 (curried-add 10))

(define (my-negate pred?)
  (lambda (x) (not (pred? x)))) ; ← new

(define not-null? (my-negate null?)) ; ← new
(define not-pair? (my-negate pair?)) ; ← new
```

This structure creates a higher-order function `my-negate` that accepts a predicate and returns a negated version of it, immediately used to define `not-null?` and `not-pair?`.

### Mechanical Walkthrough

- **`(define (my-negate pred?)`** binds `my-negate` to a function taking one argument, `pred?`.
- **`(lambda (x)`** returns a new function taking one argument, `x`.
- **`(pred? x)`** calls the original predicate on the input.
- **`(not ...)`** flips the boolean result. `#t` becomes `#f`, and `#f` becomes `#t`.
- **`(my-negate null?)`** passes the built-in `null?` function.
- **`not-null?`** stores the resulting closure.

Execution trace for `(not-null? '())`:

```text
Iteration 1: not-null? closure invoked. pred? = null?, x = '().
Iteration 2: evaluates (pred? x) -> (null? '()) -> #t.
Iteration 3: evaluates (not #t) -> #f.
```

---

## Concept Unit: Map as a Fold (`my-map-via-reduce`)

### The Problem

We've written `map` before using explicit recursion. But `map` fundamentally iterates over a list and accumulates a result. We already have a function that iterates over lists and accumulates results: `reduce` (or fold-right). Can we write `map` without any explicit recursion, strictly by composing our mapping function into a reduction?

### Introduce the Concept in Isolation

Let's look at `my-reduce` and how it accumulates a simple list copy.

```scheme
(define (my-reduce f init lst)
  (if (null? lst)
      init
      (f (car lst) (my-reduce f init (cdr lst)))))

(my-reduce cons '() '(1 2 3))
```

Run this.

```text
> (my-reduce cons '() '(1 2 3))
(1 2 3)
```

This proves that `reduce` can rebuild a list if the combiner is `cons` and the base is `()` (this is called a **structural recursion** pattern).

### Discard the Throwaway Example

We discard the bare `cons` example. We need `reduce` in our file to build `map` on top of it.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are implementing standard functional patterns.
- **Files affected:** `src/core.scm` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code

```scheme
(define (my-reduce f init lst)
  (if (null? lst)
      init
      (f (car lst) (my-reduce f init (cdr lst)))))

(define (my-map-via-reduce f lst)
  (my-reduce
    (lambda (elem rest)
      (cons (f elem) rest))
    '()
    lst))
```

### The Updated Project

```scheme
(define not-pair? (my-negate pair?))

(define (my-reduce f init lst)
  (if (null? lst)
      init
      (f (car lst) (my-reduce f init (cdr lst))))) ; ← new

(define (my-map-via-reduce f lst)
  (my-reduce
    (lambda (elem rest)
      (cons (f elem) rest))
    '()
    lst)) ; ← new
```

This structure implements `my-reduce` and then implements `my-map-via-reduce` directly by wrapping the given transformation function `f` inside a custom combiner passed to `my-reduce`.

### Mechanical Walkthrough

- **`(define (my-reduce f init lst)`** takes a combiner `f`, a base case `init`, and a list `lst`.
- **`(if (null? lst) init ...)`** handles the base case of structural recursion.
- **`(f (car lst) (my-reduce ...))`** applies the combiner to the current element and the folded rest of the list.
- **`(define (my-map-via-reduce f lst)`** takes a mapping function `f` and a list `lst`.
- **`(my-reduce ... '() lst)`** kicks off a reduction starting with an empty list.
- **`(lambda (elem rest)`** is our custom combiner function. It expects the current element and the accumulated remainder.
- **`(cons (f elem) rest)`** is the core logic: apply the mapped function `f` to `elem`, and `cons` the result onto `rest`.

Execution trace for `(my-map-via-reduce (lambda (x) (* x x)) '(1 2))`:

```text
Iteration 1: my-reduce on '(1 2). f = (lambda (elem rest) (cons (* elem elem) rest)).
Iteration 2: encounters 1. Needs to evaluate (f 1 (my-reduce ... '(2))).
Iteration 3: encounters 2. Needs to evaluate (f 2 (my-reduce ... '())).
Iteration 4: encounters '(). Returns '().
Iteration 5: resolves (f 2 '()) -> (cons 4 '()) -> '(4).
Iteration 6: resolves (f 1 '(4)) -> (cons 1 '(4)) -> '(1 4).
```

This proves `map` is simply a specialized `reduce` where the combination step applies `f` before consing.

---

## Concept Unit: Variadic Composition (`my-compose*`)

### The Problem

We wrote `my-compose` to combine two functions. But often we have a pipeline of three, four, or more operations. We could nest them: `(my-compose f (my-compose g h))`, but this gets unreadable. We want a function that takes an entire list of functions and recursively composes them all together.

### Introduce the Concept in Isolation

Let's test an identity function. When we compose zero functions together, what should the result be?

```scheme
((lambda (x) x) 42)
```

Run this.

```text
> ((lambda (x) x) 42)
42
```

This proves that a function that just returns its argument acts as a neutral "do nothing" operation, which is the perfect base case for composing a list of functions (this is the **Identity Function**).

### Discard the Throwaway Example

We discard the loose identity lambda. It will be the base case of our recursion.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because pipeline abstractions are critical.
- **Files affected:** `src/core.scm` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** `my-compose` from the second Concept Unit.

### The New Code

```scheme
(define (my-compose* fns)
  (if (null? fns)
      (lambda (x) x)
      (my-compose (car fns) (my-compose* (cdr fns)))))

(define pipeline
  (my-compose* (list (lambda (x) (* x 2))
                     (lambda (x) (+ x 1))
                     (lambda (x) (* x x)))))
```

### The Updated Project

```scheme
(define (my-map-via-reduce f lst)
  (my-reduce
    (lambda (elem rest)
      (cons (f elem) rest))
    '()
    lst))

(define (my-compose* fns)
  (if (null? fns)
      (lambda (x) x)
      (my-compose (car fns) (my-compose* (cdr fns))))) ; ← new

(define pipeline
  (my-compose* (list (lambda (x) (* x 2))
                     (lambda (x) (+ x 1))
                     (lambda (x) (* x x))))) ; ← new
```

This structure introduces `my-compose*`, which structurally recurses over a list of functions, composing them into a single massive function pipeline.

### Mechanical Walkthrough

- **`(define (my-compose* fns)`** defines our recursive composition function.
- **`(if (null? fns)`** checks if we are out of functions.
- **`(lambda (x) x)`** is the base case: the identity function, which alters nothing.
- **`(my-compose (car fns) (my-compose* (cdr fns)))`** is the recursive step. It takes the first function and composes it with the composed remainder of the list.
- **`(list ...)`** creates a list of three anonymous lambdas.
- **`pipeline`** stores the resulting massive closure.

Execution trace for `(pipeline 3)`:

```text
Iteration 1: pipeline calls (f1 (f2 (f3 (identity 3)))).
Iteration 2: f3 is (* x x), evaluates (* 3 3) -> 9.
Iteration 3: f2 is (+ x 1), evaluates (+ 9 1) -> 10.
Iteration 4: f1 is (* x 2), evaluates (* 10 2) -> 20.
```

Notice that because `my-compose` applies "f after g", the functions are evaluated right-to-left (or bottom-to-top from the list).

---

## Closing

We have seen that `make-multiplier`, `my-compose`, `my-curry`, and `my-negate` are all exactly the same pattern: a function taking arguments and returning a `lambda` that closes over those arguments. There is no special magic to returning a function; it is just a value that remembers its lexical environment.

**Exercises for next time:**
1. Write `my-flip` — a function that takes a two-argument function and returns a new function that accepts the arguments in reverse order.
2. Write `my-pipe` — identical to `my-compose*`, except it applies the functions left-to-right (top-to-bottom) instead of right-to-left.
