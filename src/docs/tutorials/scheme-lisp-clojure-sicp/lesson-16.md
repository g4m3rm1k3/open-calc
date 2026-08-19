# Lesson 16: `let` and `letrec` — Naming Things Inside Functions

The reader will learn `let` (local binding), `let*` (sequential local binding), and `letrec` (recursive local binding). They will refactor earlier functions to use these forms, making code clearer and avoiding repeated computation. The transferable problems: (1) `let` names intermediate results so they are computed once and referenced by name — not for scoping/privacy alone, but for performance; (2) `let*` allows each binding to reference the previous one, like a sequence of assignment statements in an imperative language; (3) `letrec` is required when a locally-defined function needs to call itself — ordinary `let` cannot do this because the binding is not yet in scope when the function body is written.

**What you need to know first:**
- Lessons 0–15 (all Module 0 and Module 1 concepts: structural recursion, the Four Commandments, higher-order functions, closures, association lists, set operations).

**Terms used in this lesson:**
- **local binding** — Creating a name for a value that is only visible inside a specific block of code, rather than globally across the whole program. This prevents name collisions and limits the lifespan of the variable.
- **lambda expression** — An anonymous, unnamed function created on the fly. It is the fundamental building block of computation in Scheme.
- **closure** — A function bundled together with the environment (the local variables) that was in scope when the function was created. This allows a function to "remember" values even after the outer scope has returned.
- **syntactic sugar** — Syntax designed to make things easier to read or express, which the language automatically translates (desugars) into a more primitive core construct behind the scenes.
- **mutual recursion** — A pattern where two or more functions call each other, rather than a single function calling itself.
- **association list** — A list of pairs (key-value pairs) used as a simple dictionary or map to look up values by their keys.
- **structural recursion** — A recursive pattern where a function consumes a structured data type (like a list) and makes a recursive call on a smaller piece of that structure (like the rest of the list) until it reaches a base case.
- **Four Commandments** — The foundational rules for writing recursive functions over lists in Scheme (always ask `null?` first, use `cons` to build lists, etc.).
- **higher-order function** — A function that takes other functions as arguments, or returns a function as its result.
- **set operations** — Mathematical operations on lists treated as sets (no duplicates), such as union, intersection, and difference.

**Objects and methods used:**
- **`define`**
  - *What it is:* The core form for binding a name to a value globally.
  - *Implementation:* `(define name value)` or `(define (name args...) body)`
  - *Its use:* Used to create top-level functions like `lookup` and `my-reverse`.
  - *Type:* Special form / macro.
  - *Responsibility:* Binds names in the global environment so they can be referenced anywhere.
  - *Depends on:* A symbol to name, and an expression to evaluate.
  - *Connects to:* Mutates the top-level environment.
  - *Shape:* A top-level module/script boundary declaration.
- **`let`**
  - *What it is:* A form for creating local, parallel bindings.
  - *Implementation:* `(let ([name val] ...) body)`
  - *Its use:* Used to compute intermediate values once and refer to them by name.
  - *Type:* Special form / macro.
  - *Responsibility:* Evaluates all right-hand sides in the current environment, then binds them to names in a new inner environment where the body is evaluated.
  - *Depends on:* A list of binding pairs and a body expression.
  - *Connects to:* Desugars directly into a lambda application.
  - *Shape:* An internal block scope boundary.
- **`let*`**
  - *What it is:* A form for creating local, sequential bindings.
  - *Implementation:* `(let* ([name val] ...) body)`
  - *Its use:* Used when a local binding needs to refer to a previously defined local binding in the same block.
  - *Type:* Special form / macro.
  - *Responsibility:* Evaluates and binds each pair sequentially, so each subsequent binding can see the previous ones.
  - *Depends on:* A list of binding pairs and a body expression.
  - *Connects to:* Desugars into nested `let` expressions.
  - *Shape:* An internal block scope boundary for sequential steps.
- **`letrec`**
  - *What it is:* A form for creating recursive local bindings.
  - *Implementation:* `(letrec ([name val] ...) body)`
  - *Its use:* Used to define local helper functions that need to call themselves or each other.
  - *Type:* Special form / macro.
  - *Responsibility:* Creates the bindings first, then evaluates the right-hand sides in an environment where all the names are visible, enabling recursion.
  - *Depends on:* A list of binding pairs (usually lambda expressions) and a body expression.
  - *Connects to:* Implemented via environment mutation or complex combinators under the hood.
  - *Shape:* An internal block scope boundary for self-referential definitions.
- **`cond`**
  - *What it is:* A multi-branch conditional form.
  - *Implementation:* `(cond [question answer] ... [else default])`
  - *Its use:* Used in functions to handle multiple cases cleanly without nested `if` statements.
  - *Type:* Special form / macro.
  - *Responsibility:* Evaluates questions in order until one is true, then evaluates and returns its corresponding answer.
  - *Depends on:* A sequence of question/answer clauses.
  - *Connects to:* Desugars into nested `if` expressions.
  - *Shape:* Control flow router inside function bodies.
- **`if`**
  - *What it is:* A basic two-branch conditional form.
  - *Implementation:* `(if condition true-branch false-branch)`
  - *Its use:* Used for simple branching logic.
  - *Type:* Special form.
  - *Responsibility:* Evaluates the condition, and based on its truthiness, evaluates exactly one of the branches.
  - *Depends on:* A boolean expression and two outcome expressions.
  - *Connects to:* Core language evaluation logic.
  - *Shape:* Control flow node.
- **`null?`**
  - *What it is:* A predicate that checks if a list is empty.
  - *Implementation:* `(null? lst)` returning a boolean.
  - *Its use:* Used as the base case condition in structural recursion over lists.
  - *Type:* Built-in function.
  - *Responsibility:* Returns `#t` if the argument is the empty list `()`, `#f` otherwise.
  - *Depends on:* A single argument (usually a list).
  - *Connects to:* Core type-checking system.
  - *Shape:* A base-case guard.
- **`car`**
  - *What it is:* A selector function that extracts the first element of a list or pair.
  - *Implementation:* `(car pair)` returning the left half.
  - *Its use:* Used to access the first item in a list or the key in an association list pair.
  - *Type:* Built-in function.
  - *Responsibility:* Retrieves the value stored in the first slot of a cons cell.
  - *Depends on:* A non-empty list or pair.
  - *Connects to:* Core memory access for pairs.
  - *Shape:* Data extraction boundary.
- **`cdr`**
  - *What it is:* A selector function that extracts the rest of a list or pair.
  - *Implementation:* `(cdr pair)` returning the right half.
  - *Its use:* Used to access the remainder of a list during recursion or the value in an association list pair.
  - *Type:* Built-in function.
  - *Responsibility:* Retrieves the value stored in the second slot of a cons cell.
  - *Depends on:* A non-empty list or pair.
  - *Connects to:* Core memory access for pairs.
  - *Shape:* Data extraction boundary.
- **`equal?`**
  - *What it is:* A deep-equality comparison function.
  - *Implementation:* `(equal? a b)` returning a boolean.
  - *Its use:* Used to compare values, such as keys in an association list.
  - *Type:* Built-in function.
  - *Responsibility:* Recursively traverses data structures to determine if they look exactly the same.
  - *Depends on:* Two arguments of any type.
  - *Connects to:* Structural comparison logic.
  - *Shape:* Equivalence boundary.
- **`cons`**
  - *What it is:* A constructor function that creates a new pair.
  - *Implementation:* `(cons a b)` returning a new pair.
  - *Its use:* Used to build lists element by element during recursion.
  - *Type:* Built-in function.
  - *Responsibility:* Allocates a new cons cell and stores its two arguments in it.
  - *Depends on:* Two arguments, typically a new element and an existing list.
  - *Connects to:* Memory allocator.
  - *Shape:* Data construction boundary.
- **`zero?`**
  - *What it is:* A predicate that checks if a number is zero.
  - *Implementation:* `(zero? n)` returning a boolean.
  - *Its use:* Used as the base case for numeric recursion.
  - *Type:* Built-in function.
  - *Responsibility:* Returns `#t` if the number is exactly 0.
  - *Depends on:* A numeric argument.
  - *Connects to:* Numeric type system.
  - *Shape:* A base-case guard.

---

## Concept Unit: `let` — local binding

### The Problem

Often inside a function, we compute a value that we need to use multiple times. If we simply call the computation every time we need its result, we waste performance and make the code hard to read. We need a way to assign a name to an intermediate result locally, without cluttering the global namespace with `define`.

### Introduce the concept in isolation

We can introduce local bindings using `let`. 

```scheme
(let ([x 10]
      [y 20])
  (+ x y))
```

**Output:**
```
30
```

This is called a **local binding** via `let`. The result proves that inside the body of the `let`, the names `x` and `y` represent the values 10 and 20. 

Crucially, `let` evaluates all the right-hand side expressions *before* binding any of them. If we try to use `x` to define `y` in the same `let`, it will fail:

```scheme
(let ([x 1]
      [y x])
  (+ x y))
```

**Output:**
```
x: undefined;
 cannot reference an identifier before its definition
```

This output proves that `x` is not yet bound when `y`'s right-hand side is being evaluated.

### Discard the throwaway example

The throwaway examples above are deleted and will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition to demonstrate avoiding duplicate work.
- **Files affected:** `scratch.rkt` (created)
- **Change type:** add
- **Location:** A new file.
- **Dependencies:** None.

### The New Code

```scheme
(define (bad-fn lst)
  (if (null? (some-expensive-fn lst))
      'empty
      (car (some-expensive-fn lst))))

(define (good-fn lst)
  (let ([result (some-expensive-fn lst)])
    (if (null? result)
        'empty
        (car result))))
```

### The Updated Project

```scheme
// ← new
(define (some-expensive-fn lst)
  (display "Called expensive fn!\n")
  lst)

(define (bad-fn lst)
  (if (null? (some-expensive-fn lst))
      'empty
      (car (some-expensive-fn lst))))

(define (good-fn lst)
  (let ([result (some-expensive-fn lst)])
    (if (null? result)
        'empty
        (car result))))
// ← new
```

The new `good-fn` computes `some-expensive-fn` only once, stores it in `result`, and reuses that named result.

### Mechanical walkthrough

- `let` is a form that creates a local block scope. It evaluates its bindings and then evaluates its body.
- `[result (some-expensive-fn lst)]` creates a single local binding. `result` is the name, and `(some-expensive-fn lst)` is the value evaluated.
- `(if (null? result) ...)` uses the locally bound `result`. `null?` checks if the result is empty.
- `car` extracts the first element of `result` if it is not empty.
- **`let` desugaring:** A `let` is actually **syntactic sugar** for an anonymous **lambda expression** applied immediately. `(let ([x e1]) body)` is perfectly identical to `((lambda (x) body) e1)`. It takes `e1`, evaluates it, and passes it as an argument to a function that expects `x`.

---

## Concept Unit: `let*` — sequential local binding

### The Problem

Sometimes we need to build up intermediate values step by step, where the second value depends on the first. As we saw, ordinary `let` evaluates all right-hand sides before binding any of them, so it fails if we reference an earlier binding.

### Introduce the concept in isolation

We can use `let*` for sequential binding:

```scheme
(let* ([x 10]
       [y (* x 2)]
       [z (+ x y)])
  z)
```

**Output:**
```
30
```

This is called **sequential local binding** via `let*`. The output proves that `y` was able to successfully read `x`, and `z` was able to read both `x` and `y`.

### Discard the throwaway example

The throwaway example is deleted and will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `scratch.rkt`
- **Change type:** add
- **Location:** Appended.
- **Dependencies:** None.

### The New Code

```scheme
(define (compute-stats x)
  (let* ([double (* x 2)]
         [square (* double double)])
    (+ double square)))
```

### The Updated Project

```scheme
(define (compute-stats x)
  (let* ([double (* x 2)]
         [square (* double double)])
    (+ double square)))
```

The function sequences two calculations, with the second reading the first.

### Mechanical walkthrough

- `let*` is a form that evaluates bindings strictly in order, making each one visible to all the bindings below it.
- `[double (* x 2)]` binds `double` first.
- `[square (* double double)]` binds `square` second, and it successfully reads `double`.
- `+` computes the final result.
- **`let*` desugaring:** A `let*` is syntactic sugar for nested `let` expressions. `(let* ([x e1] [y e2]) body)` becomes `(let ([x e1]) (let ([y e2]) body))`.

---

## Concept Unit: `letrec` — recursive local binding

### The Problem

If we want to create a local helper function that calls itself, or two helper functions that call each other, ordinary `let` fails. The name of the helper is not in scope while its own body (the right-hand side) is being evaluated, so it cannot refer to itself.

### Introduce the concept in isolation

We use `letrec` to bind mutually recursive functions:

```scheme
(letrec ([my-even? (lambda (n)
                     (if (zero? n) #t (my-odd? (- n 1))))]
         [my-odd?  (lambda (n)
                     (if (zero? n) #f (my-even? (- n 1))))])
  (my-even? 10))
```

**Output:**
```
#t
```

This demonstrates **recursive local binding** via `letrec`. The output proves that `my-even?` and `my-odd?` can successfully see and call each other. This is called **mutual recursion**.

### Discard the throwaway example

The throwaway example is deleted and will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `scratch.rkt`
- **Change type:** replace
- **Location:** Replacing an earlier nested `define` approach from Lesson 12.
- **Dependencies:** `my-reverse` logic.

### The New Code

```scheme
(define (my-reverse lst)
  (letrec ([helper (lambda (lst acc)
                     (if (null? lst)
                         acc
                         (helper (cdr lst) (cons (car lst) acc))))])
    (helper lst '())))
```

### The Updated Project

```scheme
// ← replace
(define (my-reverse lst)
  (letrec ([helper (lambda (lst acc)
                     (if (null? lst)
                         acc
                         (helper (cdr lst) (cons (car lst) acc))))])
    (helper lst '())))
// ← replace
```

Here, `my-reverse` uses a single local, recursive helper function hidden completely inside `letrec`.

### Mechanical walkthrough

- `letrec` allows the bound names to appear in each other's right-hand sides immediately.
- `helper` is bound to a `lambda` taking `lst` and `acc`.
- `(if (null? lst) acc ...)` is the base case: if the list is empty, return the accumulator. `null?` checks for the empty list.
- `(helper (cdr lst) (cons (car lst) acc))` is the recursive step. It calls `helper` itself. `cdr` gets the rest of the list, `car` gets the first element, and `cons` attaches it to the front of `acc`.
- `(helper lst '())` kicks off the loop initially.

---

## Concept Unit: Refactoring `lookup` using `let`

### The Problem

We previously wrote `lookup` (from Lesson 15) which looks up a key in an association list. It repeatedly called `(car alist)` to look at the first pair, which made the code dense and hard to read.

### Introduce the concept in isolation

*(This concept—`let`—was already isolated above, so we proceed to the refactor.)*

### Discard the throwaway example

*(N/A)*

### Project Change

- **Reference Source:** From Lesson 15.
- **Files affected:** `alist.rkt`
- **Change type:** refactor
- **Location:** Replacing the old `lookup` function.
- **Dependencies:** Association lists.

### The New Code

```scheme
(define (lookup key alist)
  (if (null? alist)
      #f
      (let ([pair (car alist)])
        (if (equal? key (car pair))
            (cdr pair)
            (lookup key (cdr alist))))))
```

### The Updated Project

```scheme
// ← replace
; Original:
; (define (lookup key alist)
;   (cond
;     [(null? alist) #f]
;     [(equal? key (caar alist)) (cdar alist)]
;     [else (lookup key (cdr alist))]))

(define (lookup key alist)
  (if (null? alist)
      #f
      (let ([pair (car alist)])
        (if (equal? key (car pair))
            (cdr pair)
            (lookup key (cdr alist))))))
// ← replace
```

We now assign `(car alist)` to a local name `pair`.

### Mechanical walkthrough

- `(define (lookup key alist))` begins the function definition.
- `if (null? alist)` checks the base case. If true, it returns `#f`.
- `let ([pair (car alist)])` introduces the local binding. `car` grabs the first key-value pair of the association list and binds it to `pair`.
- `(if (equal? key (car pair)) ...)` checks if the sought key deeply equals the key of our pair (accessed with `(car pair)`). `equal?` performs this deep comparison.
- `(cdr pair)` returns the matching value.
- `(lookup key (cdr alist))` is the recursive step, moving to the rest of the association list.

---

## Concept Unit: When to use `let` vs `let*` vs `letrec`

### The Problem

We now have three forms for local bindings, and we need a clear decision matrix for when to use which one in our programs.

### Introduce the concept in isolation

*(Decision guide, not a distinct syntax feature to isolate.)*

### Discard the throwaway example

*(N/A)*

### Project Change

- **Reference Source:** N/A.
- **Files affected:** N/A.
- **Change type:** configure
- **Location:** N/A.
- **Dependencies:** N/A.

### The New Code

```scheme
; Decision Guide Code Examples:
; 1. Independent: let
(let ([a 1] [b 2]) (+ a b))

; 2. Dependent: let*
(let* ([a 1] [b (+ a 1)]) (+ a b))

; 3. Recursive: letrec
(letrec ([loop (lambda (x) (if (zero? x) 0 (loop (- x 1))))])
  (loop 5))
```

### The Updated Project

*(Self-contained guide block above)*

### Mechanical walkthrough

- Use `let` when bindings are independent of each other. This communicates to the reader that order does not matter.
- Use `let*` when each binding builds on the previous one. This reads like a sequence of variable assignments.
- Use `letrec` when a locally-defined function needs to call itself or a sibling function.
- All three forms are syntactic sugar. `let` is a direct lambda application. `let*` is nested `let`s. `letrec` is implemented via environment mutation to allow forward references. Nested `define` inside `define` is an alternative to `letrec` — both are valid Scheme idioms, but `letrec` is more explicit about block scope.

---

Closing: We have seen that `let`, `let*`, and `letrec` are all syntactic sugar for lambdas and function calls that give us precise control over local variable scoping, intermediate values, and recursive helper functions.
