# Lesson 1: Atoms and Pairs — The Two Things Everything Is

**What you will build**
The reader will learn the two primitive constructors of Lisp: `cons` (which builds a pair from any two values) and the two accessors `car` and `cdr` (which take a pair apart), plus the predicate `pair?`. The transferable problems: (1) what a pair is at the data-model level — a cell holding exactly two pointers; (2) the box-and-pointer model of memory — how to draw and read the diagram that represents any Scheme value; (3) why `car` and `cdr` have those names (IBM 704 registers — history that explains the weird vocabulary); (4) how `cons`, `car`, and `cdr` form a complete, minimal interface for building any linked structure.

**What you need to know first**
Lesson 0 — S-expressions (what they are), the REPL (how to use it), prefix notation (how to call functions), `#lang racket` (the language line).

**Terms used in this lesson**
- **Atom** — a fundamental value that cannot be broken down into smaller pieces (a number, a symbol, a string, a boolean). In Scheme, everything is either an atom or a pair.
- **Pair (Cons Cell)** — a data structure containing exactly two pointers, created by `cons`. It is the building block of all linked data structures in Lisp.
- **Box-and-pointer model** — a visual way to diagram memory, where pairs are drawn as two adjacent boxes with arrows pointing to their contents.
- **Dotted-pair notation** — DrRacket's printed representation of a raw pair, written as `(a . b)`, where the dot explicitly separates the left and right sides.
- **Empty list (`'()`)** — a special sentinel value representing the end of a list. It is an atom, not a pair, and has no `car` or `cdr`.

**Objects and methods used**
- **`define`**
  - *What it is:* A special form that binds a name to a value or creates a function.
  - *Implementation:* `(define (name args...) body...)`
  - *Its use:* Used here to give `atom?` a name so we can call it.
  - *Type:* Language keyword / special form.
  - *Responsibility:* Associates a symbol in the environment with a value or procedure.
  - *Depends on:* An identifier to bind, and an expression to evaluate.
  - *Connects to:* Modifies the current environment, allowing subsequent expressions to reference the bound name.
  - *Shape:* A fundamental top-level or block-level declaration.
- **`cons`**
  - *What it is:* The primitive constructor for pairs.
  - *Implementation:* `(cons x y)` where `x` and `y` are any values.
  - *Its use:* Builds a new cons cell pointing to its two arguments.
  - *Type:* Built-in procedure.
  - *Responsibility:* Allocates a new cons cell in memory and sets its left and right pointers.
  - *Depends on:* Exactly two arguments to place in the left and right halves of the cell.
  - *Connects to:* Forms the foundation for lists and trees.
  - *Shape:* Core language primitive.
- **`car`**
  - *What it is:* The accessor for the left side of a pair.
  - *Implementation:* `(car pair)`
  - *Its use:* Extracts the first element of a cons cell.
  - *Type:* Built-in procedure.
  - *Responsibility:* Dereferences the left pointer of a cons cell and returns its value.
  - *Depends on:* A value that is a pair (a cons cell).
  - *Connects to:* Works in tandem with `cdr` to deconstruct pairs.
  - *Shape:* Core language primitive.
- **`cdr`**
  - *What it is:* The accessor for the right side of a pair.
  - *Implementation:* `(cdr pair)`
  - *Its use:* Extracts the second element of a cons cell.
  - *Type:* Built-in procedure.
  - *Responsibility:* Dereferences the right pointer of a cons cell and returns its value.
  - *Depends on:* A value that is a pair.
  - *Connects to:* Works in tandem with `car` to deconstruct pairs.
  - *Shape:* Core language primitive.
- **`pair?`**
  - *What it is:* A predicate testing if a value is a cons cell.
  - *Implementation:* `(pair? val)` returns `#t` or `#f`.
  - *Its use:* Determines if a value can be passed to `car` and `cdr`.
  - *Type:* Built-in procedure.
  - *Responsibility:* Checks the type tag of the given value to see if it represents a pair.
  - *Depends on:* Any single value.
  - *Connects to:* Often used in conditional checks before destructuring.
  - *Shape:* Core language primitive.
- **`not`**
  - *What it is:* A logical negation function.
  - *Implementation:* `(not val)` returns `#t` if `val` is false, and `#f` otherwise.
  - *Its use:* Used inside `atom?` to invert the result of `pair?`.
  - *Type:* Built-in procedure.
  - *Responsibility:* Reverses a boolean truth value.
  - *Depends on:* A single value to test.
  - *Connects to:* Used to combine or invert predicates.
  - *Shape:* Core language primitive.

## Concept Unit: `atom?`

### The Problem
We need a way to distinguish between compound, breakable data (pairs) and indivisible, fundamental data (atoms). Scheme doesn't have a built-in `atom?` predicate in `#lang racket`. We need to define one ourselves.

### Isolate
Before we write the final function, let's look at how we check if something is a pair and invert it.

```racket
#lang racket
(not (pair? 5))
```
Output:
```
#t
```
This proves that we can combine `not` and `pair?` to check if a value is an atom. `5` is a number, not a pair, so `(pair? 5)` is false, and `not` makes it true. This combined predicate is called an **atom check**.

### Discard
This throwaway test is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we need the predicate for learning.
- **Files affected:** `pairs.rkt` (created)
- **Change type:** Add
- **Location:** Top of the file.
- **Dependencies:** `#lang racket`

### The New Code
```racket
(define (atom? x)
  (not (pair? x)))
```

### The Updated Project
```racket
#lang racket

// ← new
(define (atom? x)
  (not (pair? x)))
```
We have created a reusable function `atom?` that accepts one argument `x` and returns true if it is anything other than a pair.

### Mechanical walkthrough
- **`(define (atom? x) ...)`**: `define` is a special form that binds a name to a procedure. Here, it creates a function named `atom?` that takes exactly one argument, `x`. The `?` is just a naming convention for predicates (functions returning true/false).
- **`(not ...)`**: Calls the built-in `not` procedure, which takes the boolean result of its argument and returns the opposite.
- **`(pair? x)`**: Calls the built-in predicate `pair?` on the input `x`. It returns `#t` if `x` is a cons cell, and `#f` otherwise.

An **atom** is simply a value that is not a pair — a number, a symbol, a string, a boolean. Let's trace how it evaluates different inputs:
- `(atom? 5)`: `(pair? 5)` is `#f`, `not` makes it `#t`.
- `(atom? 'hello)`: `(pair? 'hello)` is `#f`, `not` makes it `#t`.
- `(atom? '())`: The empty list is not a pair, so `(pair? '())` is `#f`, and `(atom? '())` is `#t`.

## Concept Unit: `cons`

### The Problem
We have atoms, but no way to glue them together into larger structures. We need a fundamental constructor that takes two values and joins them into one.

### Isolate
We introduce `cons`, which builds a pair.

```racket
#lang racket
(cons 1 2)
```
Output:
```
'(1 . 2)
```
This proves that `cons` creates a **cons cell**, a structure holding exactly two pointers. The output `'(1 . 2)` is called dotted-pair notation. The dot is not an operator; it is DrRacket's printed representation of a raw pair, explicitly showing the left and right halves.

### Discard
This throwaway test is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `pairs.rkt` (modified)
- **Change type:** Add
- **Location:** After the `atom?` definition.
- **Dependencies:** None.

### The New Code
```racket
(cons 'peanut 'butter)
```

### The Updated Project
```racket
#lang racket

(define (atom? x)
  (not (pair? x)))

// ← new
(cons 'peanut 'butter)
```
This adds a concrete usage of `cons` to our file.

### Mechanical walkthrough
- **`(cons ...)`**: Calls the primitive pair constructor `cons`.
- **`'peanut`**: A symbol atom, passed as the first (left) argument.
- **`'butter`**: A symbol atom, passed as the second (right) argument.

When `cons` executes, memory is allocated in the shape of a **box-and-pointer diagram**: two boxes side by side. The left box contains a pointer to the atom `'peanut`, and the right box contains a pointer to the atom `'butter`. Every `cons` cell is exactly this: two pointers, nothing more.

## Concept Unit: `car`

### The Problem
Once we have packed two values into a cons cell, we need a way to extract the left value back out.

### Isolate
Let's extract the left side of a pair using `car`.

```racket
#lang racket
(car (cons 1 2))
```
Output:
```
1
```
This proves that `car` follows the left pointer of a cons cell and retrieves its contents.

### Discard
This throwaway test is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `pairs.rkt` (modified)
- **Change type:** Add
- **Location:** After the `cons` call.
- **Dependencies:** None.

### The New Code
```racket
(car (cons 'peanut 'butter))
```

### The Updated Project
```racket
#lang racket

(define (atom? x)
  (not (pair? x)))

(cons 'peanut 'butter)

// ← new
(car (cons 'peanut 'butter))
```
We now retrieve the first element from the pair we just learned to construct.

### Mechanical walkthrough
- **`(car ...)`**: The accessor function that extracts the left element of a pair.
- **`(cons 'peanut 'butter)`**: An inline pair creation that returns a cons cell `(peanut . butter)`.

The name **`car`** comes from history: "Contents of Address Register" on the IBM 704, the machine Lisp was originally implemented on. Despite the archaic name, its meaning is entirely consistent: follow the left pointer of the box-and-pointer diagram.

## Concept Unit: `cdr`

### The Problem
We can retrieve the left half of a pair, but we also need a way to extract the right half.

### Isolate
Let's extract the right side of a pair using `cdr`.

```racket
#lang racket
(cdr (cons 1 2))
```
Output:
```
2
```
This proves that `cdr` follows the right pointer of a cons cell and retrieves its contents.

### Discard
This throwaway test is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `pairs.rkt` (modified)
- **Change type:** Add
- **Location:** After the `car` call.
- **Dependencies:** None.

### The New Code
```racket
(cdr (cons 'peanut 'butter))
```

### The Updated Project
```racket
#lang racket

(define (atom? x)
  (not (pair? x)))

(cons 'peanut 'butter)
(car (cons 'peanut 'butter))

// ← new
(cdr (cons 'peanut 'butter))
```
We now extract the second element of the pair.

### Mechanical walkthrough
- **`(cdr ...)`**: The accessor function that extracts the right element of a pair.
- **`(cons 'peanut 'butter)`**: A cons cell `(peanut . butter)`.

The name **`cdr`** (pronounced "could-er") is also historical: "Contents of Decrement Register" on the IBM 704. It simply follows the right pointer of the box-and-pointer diagram. For example, `(cdr (cons 'a 'b))` returns `b`.

## Concept Unit: `pair?`

### The Problem
Before we try to call `car` or `cdr` on a value, we need to know if the value is actually a pair. Calling `car` on an atom will crash the program.

### Isolate
We use the `pair?` predicate to inspect values.

```racket
#lang racket
(pair? (cons 1 2))
```
Output:
```
#t
```
This proves that a cons cell is recognized as a pair.

### Discard
This throwaway test is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `pairs.rkt` (modified)
- **Change type:** Add
- **Location:** After the `cdr` call.
- **Dependencies:** None.

### The New Code
```racket
(pair? 5)
(pair? '())
```

### The Updated Project
```racket
#lang racket

(define (atom? x)
  (not (pair? x)))

(cons 'peanut 'butter)
(car (cons 'peanut 'butter))
(cdr (cons 'peanut 'butter))

// ← new
(pair? 5)
(pair? '())
```
We test the `pair?` predicate against atoms.

### Mechanical walkthrough
- **`(pair? ...)`**: A predicate that returns `#t` only if its argument is a cons cell.
- **`5`**: A number (atom), which is not a pair, so `(pair? 5)` returns `#f`.
- **`'()`**: The empty list.

The **empty list (`'()`)** is NOT a pair. It is a special sentinel atom that marks the end of a sequence. Because it is not a pair, it has no left or right box, meaning `car` and `cdr` cannot be called on it. `(pair? '())` correctly returns `#f`.

## Concept Unit: Nesting `cons`

### The Problem
A single pair only holds two values. To store more, we must place pairs inside other pairs, using the right pointer to chain them together.

### Isolate
We can put a cons cell inside another cons cell.

```racket
#lang racket
(cons 1 (cons 2 3))
```
Output:
```
'(1 2 . 3)
```
This proves that pairs can be nested. In the box-and-pointer model, the first cons cell points to `1` on the left, and its right box points to an entirely new cons cell. That second cons cell points to `2` on the left and `3` on the right. Scheme's printer shows `(1 2 . 3)`, meaning it prints a space between chained elements until the final right-most value.

### Discard
This throwaway test is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `pairs.rkt` (modified)
- **Change type:** Add
- **Location:** At the end of the file.
- **Dependencies:** None.

### The New Code
```racket
(cons 1 (cons 2 (cons 3 '())))
```

### The Updated Project
```racket
#lang racket

(define (atom? x)
  (not (pair? x)))

(cons 'peanut 'butter)
(car (cons 'peanut 'butter))
(cdr (cons 'peanut 'butter))
(pair? 5)
(pair? '())

// ← new
(cons 1 (cons 2 (cons 3 '())))
```
We construct a properly terminated sequence of nested pairs.

### Mechanical walkthrough
- **`(cons 1 ...)`**: The first cell, left pointer is `1`, right pointer points to the next pair.
- **`(cons 2 ...)`**: The second cell, left pointer is `2`, right pointer points to the third pair.
- **`(cons 3 '())`**: The third cell, left pointer is `3`, right pointer is the empty list atom `'()`.

When we execute `(cons 1 (cons 2 (cons 3 '())))`, the REPL prints `'(1 2 3)`. Notice there is **no trailing dot**. When the rightmost `cdr` of a chain of pairs is exactly the empty list (`'()`), Scheme recognizes this as a standard linked list and uses list notation as a printing convenience. The underlying memory structure is still exactly three cons cells wired together, ending in a null pointer. `cons`, `car`, and `cdr` form a complete, minimal interface for building any such linked data structure.
