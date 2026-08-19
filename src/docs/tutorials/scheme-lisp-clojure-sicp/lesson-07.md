# Lesson 7: The Third Commandment — Stop When Null, Otherwise Recur

What you will build: The reader will formalize the pattern they have been following into a single transferable template: the Third Commandment. They will write `my-map` — applying a function to every element of a list — and `my-filter` — keeping only elements that pass a test — both from scratch. The transferable problems: (1) the three-commandment template (null? check, car, recur on cdr) is not just a style guide — it is the complete specification of how structural recursion on a proper list works; (2) passing a function as an argument — functions are first-class values and can be handed to other functions; (3) why `map` and `filter` are not special — they are ordinary recursive functions you can write yourself, which makes them demystifiable and extensible.

What you need to know first: Lessons 0-6 (all prior concepts through structural recursion, cons-building, my-rember, my-insertR).

### Terms used in this lesson

- **Proper list** — A sequence of pairs that ends with the empty list `'()`. This is the fundamental data structure in Scheme. Structural recursion on a proper list means breaking it down one pair at a time.
- **Higher-order function** — A function that takes another function as an argument, or returns a function as its result. It exists because in Scheme, functions are first-class values, just like numbers or lists, and can be passed around to generalize repetitive patterns like applying an operation to a whole list.
- **Lambda expression** — An anonymous, unnamed function created on the fly using the `lambda` keyword. It is used to quickly define a one-off operation (like a specific math calculation) to pass into a higher-order function without having to use a full `define` block elsewhere.
- **Predicate** — A function that asks a yes-or-no question and returns a boolean (`#t` or `#f`). Used to decide which branch of execution to take, such as testing if an element should be kept in a list.
- **Base case** — The condition in a recursive function that stops the recursion and returns a final, non-recursive answer. Without a base case, recursion runs infinitely. For lists, this is almost always asking if the list is empty.
- **Structural recursion** — The process of solving a problem on a compound data structure (like a list) by solving it on the first element, and then recursively calling the same function on the rest of the structure.
- **define** — The keyword used to bind a name to a value or a procedure in the global environment, establishing reusable functions.
- **if** — A conditional form that evaluates a test expression; if true, it evaluates and returns the first branch, otherwise the second branch.
- **cond** — A multi-branch conditional form that evaluates tests in order until one is true, keeping code clean when there are more than two possibilities.
- **else** — The catch-all final condition in a `cond` block that executes if no prior tests matched.

### Objects and methods used

**`my-map`**
- *What it is:* A recursive list-processing procedure that transforms every element of a list.
- *Implementation:* `(define (my-map f lst) ...)` returning a new list.
- *Its use:* To apply a given function to every item in a collection, producing a new collection of transformed items, rather than writing a manual loop.
- *Type:* A user-defined, pure function.
- *Responsibility:* Traverses the provided list, applies the function to each element's car, and rebuilds a new list via cons.
- *Depends on:* A transformation function `f` and a proper list `lst`.
- *Connects to:* Calls `null?`, `cons`, `car`, `cdr`, and the passed-in function `f`.
- *Shape:* A fundamental list-processing abstraction utility.

**`my-filter`**
- *What it is:* A recursive list-processing procedure that conditionally keeps elements of a list.
- *Implementation:* `(define (my-filter pred? lst) ...)` returning a new list.
- *Its use:* To sift out unwanted elements from a collection, keeping only those that satisfy a given test predicate.
- *Type:* A user-defined, pure function.
- *Responsibility:* Traverses the list, tests each element with the predicate, and either cons-es it to the recursive result or drops it entirely.
- *Depends on:* A predicate function `pred?` and a proper list `lst`.
- *Connects to:* Calls `null?`, `pred?`, `car`, `cdr`, and `cons`.
- *Shape:* A foundational list-filtering abstraction utility.

**`my-reduce`**
- *What it is:* A recursive list-processing procedure that collapses a list down to a single accumulated value.
- *Implementation:* `(define (my-reduce f init lst) ...)` returning any type.
- *Its use:* To summarize or combine a list into one final result, such as summing numbers or flattening a structure.
- *Type:* A user-defined, pure function.
- *Responsibility:* Walks the list to the end, then recursively combines the elements from right to left using the provided function and an initial base value.
- *Depends on:* A combiner function `f`, an initial value `init`, and a proper list `lst`.
- *Connects to:* Calls `null?`, `car`, `cdr`, and the combiner `f`.
- *Shape:* The ultimate generalization of list processing, of which map and filter are special cases.

**Everything else in the file, not this lesson's subject but still explained**

**`null?`**
- *What it is:* A built-in predicate procedure.
- *Implementation:* `(null? val)` returning a boolean.
- *Its use:* Used as the base case check to determine if a list is empty.
- *Type:* A core standard library function.
- *Responsibility:* Returns true if and only if the given value is the empty list `'()`.
- *Depends on:* Any arbitrary single value to inspect.
- *Connects to:* Used directly by list-processing functions to stop recursion.
- *Shape:* A primitive language operation.

**`car`**
- *What it is:* A built-in procedure to extract the first part of a pair.
- *Implementation:* `(car pair)` returning an element.
- *Its use:* Retrieves the head element of the list being processed so work can be done on it.
- *Type:* A core standard library function.
- *Responsibility:* Returns the contents of the address part of a register (the first element of a cons pair).
- *Depends on:* A non-empty list or cons pair.
- *Connects to:* Yields the item that transformation functions operate on.
- *Shape:* A primitive language operation.

**`cdr`**
- *What it is:* A built-in procedure to extract the second part of a pair.
- *Implementation:* `(cdr pair)` returning a list or element.
- *Its use:* Retrieves the rest of the list so it can be passed down into the recursive step.
- *Type:* A core standard library function.
- *Responsibility:* Returns the contents of the decrement part of a register (the rest of the pair).
- *Depends on:* A non-empty list or cons pair.
- *Connects to:* Provides the diminishing data that ensures recursion eventually reaches the base case.
- *Shape:* A primitive language operation.

**`cons`**
- *What it is:* A built-in procedure that constructs a new pair.
- *Implementation:* `(cons car-val cdr-val)` returning a new pair.
- *Its use:* Rebuilds the resulting list on the way back up from the recursion.
- *Type:* A core standard library function.
- *Responsibility:* Allocates memory and creates a single pair linking a head element to a tail element.
- *Depends on:* Two values, typically an element and a list.
- *Connects to:* Forms the structural spine of every list returned by map and filter.
- *Shape:* A primitive memory allocation operation.

---

## Concept Unit: The Three Commandments Unified

### The Problem
We have written several recursive functions to process lists, but the approach has been informal. To consistently build reliable recursive functions, we need to formalize the pattern into a clear, repeatable template so we no longer have to guess how to structure the code.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition to establish the fundamental design pattern of this module.
- **Files affected:** None explicitly written to yet, this establishes the mental model.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** None.

### The New Code
```scheme
(define (f lst)
  (if (null? lst)
      '()  ; Base case
      (... (car lst)
           (f (cdr lst)))))
```

### The Updated Project
This is the skeleton every list-recursive function in this module hangs on. It provides a structural guarantee: if you follow this shape, you will correctly process every element of a list and safely stop when done.

### Introduce the concept in isolation
Let's see this pattern used to simply copy a list, proving it traverses and rebuilds correctly.

```scheme
(define (my-copy lst)
  (if (null? lst)
      '()
      (cons (car lst)
            (my-copy (cdr lst)))))

(my-copy '(apple banana cherry))
```
Output:
```
'(apple banana cherry)
```
This proves that the structural template safely unpacks a list down to its end and repacks it exactly as it was. This formalization is called the **Three Commandments of Structural Recursion**.

### Discard the throwaway example
The `my-copy` function is deleted and will not appear in the project again. It served only to prove the template's completeness.

### Mechanical walkthrough
- `(define (f lst) ...)` establishes a recursive function named `f` accepting a list.
- `(if (null? lst) ...)` is **Commandment 1**: always ask `null?` first. Before doing any work, you must ensure there is actually data to work on.
- `'()` represents **Commandment 3**: stop when null. The base case for list building is the empty list, ending the recursion safely.
- `(car lst)` is the mechanism to work on the head of the list. Structural recursion demands we handle one element at a time.
- `(f (cdr lst))` is **Commandment 1 + 2**: recur on the `cdr`. We pass the rest of the list back into the function, guaranteeing we process smaller and smaller pieces until we hit the empty list.
- `cons` (in `my-copy`) rebuilds the exact same structure by attaching the `car` to the recursively processed `cdr`.

---

## Concept Unit: Functions as Arguments

### The Problem
If we want a function to square numbers, and another function to add 1 to numbers, we normally have to define them completely separately. But often, the *shape* of what we are doing is the same, and only the specific operation differs. We need a way to pass the *operation itself* as an argument.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** None.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** None.

### The New Code
```scheme
(define (apply-to-5 f)
  (f 5))
```

### The Updated Project
```scheme
(define (apply-to-5 f)
  (f 5)) // ← new: calling the argument itself as a procedure
```
This single function takes another procedure `f` and invokes it on the number 5, meaning `apply-to-5` can perform any math operation you hand it.

### Introduce the concept in isolation
We will pass different, on-the-fly functions into `apply-to-5` using `lambda`.

```scheme
(define (apply-to-5 f)
  (f 5))

(apply-to-5 (lambda (x) (* x x)))
(apply-to-5 (lambda (x) (+ x 1)))
```
Output:
```
25
6
```
This proves that functions in Scheme are just values. You can pass a function into another function exactly like you pass a number. This is called a **higher-order function** and a **lambda expression**.

### Discard the throwaway example
The `apply-to-5` function and the lambda tests are deleted and will not appear in the project again.

### Mechanical walkthrough
- `(define (apply-to-5 f) ...)` declares a function taking one argument, `f`. In Scheme, there is no type signature stopping `f` from being a procedure.
- `(f 5)` takes that argument `f` and invokes it by placing it in the first position of a parenthesis pair. Because of how Scheme evaluates expressions, it looks up the value of `f`, sees it is a procedure, and applies it to `5`.
- `(lambda (x) (* x x))` creates an anonymous procedure. `lambda` is the keyword that builds a function. `(x)` is the parameter list. `(* x x)` is the body. It operates exactly like a named `define` but without polluting the global namespace.
- `apply-to-5` receives the lambda procedure as its `f` argument, and when `(f 5)` evaluates, it runs `(* 5 5)`, yielding 25.

---

## Concept Unit: `my-map`

### The Problem
We often need to take a list and apply the exact same transformation to every single item in it. Writing a custom recursive function every time we want to transform a list is tedious and error-prone. We need a general-purpose tool that abstracts away the traversal and just accepts the transformation logic.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are implementing a core standard library function to demystify it.
- **Files affected:** `utils.scm` (created)
- **Change type:** Add.
- **Location:** Top of the file.
- **Dependencies:** None.

### The New Code
```scheme
(define (my-map f lst)
  (if (null? lst)
      '()
      (cons (f (car lst))
            (my-map f (cdr lst)))))
```

### The Updated Project
```scheme
// utils.scm
(define (my-map f lst) // ← new
  (if (null? lst)
      '()
      (cons (f (car lst))
            (my-map f (cdr lst)))))
```
`my-map` follows the exact three-commandment template. The only difference from our generic `my-copy` is that it applies `f` to each `car` instead of keeping it raw.

### Introduce the concept in isolation
Let's see `my-map` in action with multiple different functions to prove its generality.

```scheme
(my-map (lambda (x) (* x x)) '(1 2 3 4))
(my-map (lambda (x) (+ x 10)) '(1 2 3))
(my-map null? '(() (1 2) () 3))
```
Output:
```
'(1 4 9 16)
'(11 12 13)
'(#t #f #t #f)
```
This proves that by passing a function as a variable, a single recursive structure can perform infinitely many different kinds of list transformations.

### Discard the throwaway example
The test calls are discarded. The `my-map` definition itself remains in our utilities file.

### Mechanical walkthrough
- `(define (my-map f lst) ...)` declares a higher-order function that takes a transformation procedure `f` and a list `lst`.
- `(if (null? lst) '() ...)` checks the base case. If the list is empty, there is nothing left to map over, so it returns the empty list.
- `(car lst)` extracts the current element we are looking at.
- `(f (car lst))` invokes the provided transformation function on that current element, yielding the transformed value.
- `(my-map f (cdr lst))` recursively calls the map function on the remainder of the list, passing along the exact same transformation function `f`.
- `cons` takes the transformed head element and attaches it to the recursively mapped tail, rebuilding the entire list with the new values.

**Execution trace for `(my-map (lambda (x) (* x x)) '(1 2 3))`:**
```
Call 1: f = square, lst = (1 2 3). null? is false. Evaluates to (cons (square 1) (my-map square '(2 3)))
Call 2: f = square, lst = (2 3). null? is false. Evaluates to (cons (square 2) (my-map square '(3)))
Call 3: f = square, lst = (3). null? is false. Evaluates to (cons (square 3) (my-map square '()))
Call 4: f = square, lst = (). null? is true. Returns '().
Unwinding: Call 3 becomes (cons 9 '()) -> '(9)
Unwinding: Call 2 becomes (cons 4 '(9)) -> '(4 9)
Unwinding: Call 1 becomes (cons 1 '(4 9)) -> '(1 4 9)
```
The base case empty list ripples back up, and `cons` builds the new list step by step as the recursive calls resolve.

---

## Concept Unit: `my-filter`

### The Problem
Sometimes we don't want to transform elements; we want to selectively throw some away based on a test. We need a general-purpose function that traverses a list and keeps only the elements that satisfy a given predicate function.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `utils.scm` (modified)
- **Change type:** Add.
- **Location:** Below `my-map`.
- **Dependencies:** None.

### The New Code
```scheme
(define (my-filter pred? lst)
  (cond
    [(null? lst) '()]
    [(pred? (car lst))
     (cons (car lst) (my-filter pred? (cdr lst)))]
    [else
     (my-filter pred? (cdr lst))]))
```

### The Updated Project
```scheme
// utils.scm
(define (my-map f lst)
  (if (null? lst)
      '()
      (cons (f (car lst))
            (my-map f (cdr lst)))))

(define (my-filter pred? lst) // ← new
  (cond
    [(null? lst) '()]
    [(pred? (car lst))
     (cons (car lst) (my-filter pred? (cdr lst)))]
    [else
     (my-filter pred? (cdr lst))]))
```
`my-filter` uses a three-branch `cond` to determine what to do. If the predicate passes, it keeps the element via `cons`. If it fails, it simply recurs on the `cdr` and abandons the current `car`.

### Introduce the concept in isolation
We will pass different predicates to filter lists of varying types.

```scheme
(my-filter odd? '(1 2 3 4 5))
(my-filter pair? '(1 (2 3) 4 (5)))
```
Output:
```
'(1 3 5)
'((2 3) (5))
```
This proves that by deciding whether or not to `cons` at each step, we can selectively shrink a list while maintaining order.

### Discard the throwaway example
The test calls are discarded; `my-filter` remains in the utilities file.

### Mechanical walkthrough
- `(cond ...)` evaluates multiple branches sequentially, which is cleaner than nested `if` statements for a 3-outcome scenario (empty, keep, drop).
- `[(null? lst) '()]` is the standard base case. An empty list yields an empty list.
- `(pred? (car lst))` invokes the boolean test function on the current element. If it returns true, this branch executes.
- `(cons (car lst) (my-filter pred? (cdr lst)))` executes when the predicate is true. It keeps the current raw element by attaching it to the result of recursively filtering the rest.
- `[else ...]` catches elements that failed the predicate test.
- `(my-filter pred? (cdr lst))` executes in the else branch. Notice there is no `cons` here. We immediately call the recursive function on the rest of the list. The current `car` is left behind and vanishes from the final result.

**Execution trace for `(my-filter odd? '(1 2 3 4 5))`:**
```
Call 1: lst = (1 2 3 4 5). car is 1. (odd? 1) is true. Returns (cons 1 (my-filter odd? '(2 3 4 5)))
Call 2: lst = (2 3 4 5). car is 2. (odd? 2) is false. Hits else. Returns (my-filter odd? '(3 4 5))
Call 3: lst = (3 4 5). car is 3. (odd? 3) is true. Returns (cons 3 (my-filter odd? '(4 5)))
Call 4: lst = (4 5). car is 4. (odd? 4) is false. Hits else. Returns (my-filter odd? '(5))
Call 5: lst = (5). car is 5. (odd? 5) is true. Returns (cons 5 (my-filter odd? '()))
Call 6: lst = (). null? is true. Returns '().
Unwinding: Call 5 becomes (cons 5 '()) -> '(5)
Unwinding: Call 4 returns Call 5's result -> '(5)
Unwinding: Call 3 becomes (cons 3 '(5)) -> '(3 5)
Unwinding: Call 2 returns Call 3's result -> '(3 5)
Unwinding: Call 1 becomes (cons 1 '(3 5)) -> '(1 3 5)
```

---

## Concept Unit: `my-reduce` (fold-right)

### The Problem
Map transforms, filter removes, but both return a list of exactly the same shape. What if we want to collapse a list down to a single value, like a sum, a product, or a complex nested structure? We need a generic way to fold a list in on itself.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `utils.scm` (modified)
- **Change type:** Add.
- **Location:** Below `my-filter`.
- **Dependencies:** None.

### The New Code
```scheme
(define (my-reduce f init lst)
  (if (null? lst)
      init
      (f (car lst) (my-reduce f init (cdr lst)))))
```

### The Updated Project
```scheme
// utils.scm
(define (my-reduce f init lst) // ← new
  (if (null? lst)
      init
      (f (car lst) (my-reduce f init (cdr lst)))))
```
The combiner function `f` is applied to the current element and the accumulated result of recursively processing the rest of the list.

### Introduce the concept in isolation
We will use reduce to sum numbers, multiply numbers, and completely rebuild a list from scratch.

```scheme
(my-reduce + 0 '(1 2 3 4))
(my-reduce * 1 '(1 2 3 4))
(my-reduce cons '() '(1 2 3))
```
Output:
```
10
24
'(1 2 3)
```
This proves that reduce is the ultimate generalization. `+` combined with `0` sums the list. `cons` combined with `'()` perfectly rebuilds the list, proving that `map` and `filter` are actually just special cases of reduce.

### Discard the throwaway example
The test calls are discarded; `my-reduce` remains in the utilities file.

### Mechanical walkthrough
- `(define (my-reduce f init lst) ...)` introduces a function taking three arguments: a two-argument combiner function `f`, a starting base case value `init`, and the list.
- `(if (null? lst) init ...)` replaces the hardcoded empty list `'()` with our flexible `init` value. If we are summing, `init` is 0. If we are multiplying, `init` is 1.
- `(my-reduce f init (cdr lst))` recursively reduces the rest of the list first. This is called fold-right because the deepest nested evaluation happens on the far right end of the list.
- `(f (car lst) ...)` takes the combiner function and applies it. Its first argument is the current element `(car lst)`. Its second argument is the entire accumulated result returned by the recursive call on the rest of the list.

### Closing connections
Because `my-reduce` abstracts the traversal and the building step, any list operation can be written using it. For example, `my-map` could actually be implemented as:
```scheme
(define (map-via-reduce f lst)
  (my-reduce (lambda (element acc)
               (cons (f element) acc))
             '()
             lst))
```
**Exercises:**
1. Write a function `my-any` that takes a predicate and a list, and returns `#t` if *any* element passes, using `my-filter` or `my-reduce`.
2. Write a function `my-every` that returns `#t` only if *every* element passes.

Next lesson: we will break the Third Commandment and explore non-structural recursion.
