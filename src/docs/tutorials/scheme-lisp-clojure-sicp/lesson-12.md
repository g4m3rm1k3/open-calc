# Lesson 12: Length, Reverse, Flatten — Classic List Algorithms from First Principles

**What you will build**
You will write `my-reverse` (reverse a list), `my-flatten` (flatten any nesting depth), `my-zip` (pair up two lists), and `my-take`/`my-drop` (split a list at a position). These are canonical list-processing algorithms that appear in every real Lisp codebase. The transferable problems include: (1) `reverse` requires an accumulator parameter — a value threaded through the recursion to collect partial results, changing the shape of the recursion from "build on the way back up" to "build on the way down"; (2) `flatten` requires the double-recursion pattern from Lesson 9; (3) `zip` requires simultaneous recursion on two lists like `tup+`.

**What you need to know first**
Lessons 0-11 (all prior concepts through structural recursion, nested list recursion, Peano arithmetic, the Four Commandments, addtup, tup+).

**Terms used in this lesson**
- **O(n^2) time complexity** — a measure of computational cost where the time taken grows quadratically with the size of the input (n). This usually happens when an operation that takes O(n) time is placed inside a loop or recursion that also runs n times, leading to n * n total operations. It is a sign of an inefficient algorithm for simple list traversal.
- **O(n) time complexity** — a measure of computational cost where the time taken grows linearly with the size of the input (n). This is the optimal time for traversing a list once, as processing each element takes a constant amount of time.
- **Accumulator pattern** — a recursive technique where an extra parameter (the accumulator) is passed along with the recursive calls to build up the final result incrementally. Instead of combining results as the recursion unwinds, the result is fully built by the time the base case is reached.
- **Tail recursion** — a specific form of recursion where the recursive call is the very last operation performed in the function. Because nothing is left to do after the recursive call returns, the runtime can reuse the current stack frame, preventing stack overflow and improving performance.
- **Local definition** — declaring a helper function or variable inside another function, restricting its visibility to only that enclosing function. This is standard practice for hiding accumulator-based helpers from the public API.
- **Double-recursion pattern** — recursing on both the `car` (the first element, which might be a list) and the `cdr` (the rest of the list) simultaneously, which is required for processing nested lists of arbitrary depth.
- **Simultaneous recursion** — traversing two or more data structures (like two lists) at the same time in parallel, usually stopping when either one reaches its base case.

**Objects and methods used**
- **`define`**
  - *What it is:* The core form used to bind a name to a value or to create a function.
  - *Implementation:* A special form, e.g., `(define (name args...) body...)` or `(define name value)`.
  - *Its use:* Used to define our custom list-processing algorithms (`my-reverse`, `my-flatten`, etc.) and inner helper functions.
  - *Type:* Special form.
  - *Responsibility:* Binds identifiers to evaluated expressions in the current environment.
  - *Depends on:* An identifier name and an expression to evaluate.
  - *Connects to:* Mutates the environment by adding a new binding; read by any subsequent code that references the name.
  - *Shape:* Top-level declaration, or local declaration inside another block.
- **`if`**
  - *What it is:* The fundamental conditional branching construct.
  - *Implementation:* A special form `(if test-expr true-expr false-expr)`.
  - *Its use:* Used to check for base cases in our recursive functions.
  - *Type:* Special form.
  - *Responsibility:* Evaluates the test expression; if true, evaluates and returns the true-expr; otherwise, evaluates and returns the false-expr.
  - *Depends on:* A test expression that resolves to a boolean, a consequent expression, and an alternate expression.
  - *Connects to:* Controls the flow of execution based on boolean conditions.
  - *Shape:* Control flow boundary within a function body.
- **`null?`**
  - *What it is:* A predicate function to check if a value is the empty list `()`.
  - *Implementation:* `(null? val) -> boolean`
  - *Its use:* Used to detect the end of a list and trigger the base case in recursions.
  - *Type:* Built-in function.
  - *Responsibility:* Accurately identifies the empty list.
  - *Depends on:* A single value to inspect.
  - *Connects to:* Usually supplies the boolean condition for an `if` or `cond` branch.
  - *Shape:* A standard predicate call.
- **`car`**
  - *What it is:* The function that extracts the first element of a pair or list.
  - *Implementation:* `(car pair) -> any`
  - *Its use:* Used to process the current element of a list during traversal.
  - *Type:* Built-in function.
  - *Responsibility:* Retrieves the first component (the "Contents of the Address part of Register number") of a cons cell.
  - *Depends on:* A non-empty pair or list.
  - *Connects to:* Often feeds into `cons` or `list` to build new structures.
  - *Shape:* Standard accessor function.
- **`cdr`**
  - *What it is:* The function that extracts the second element of a pair, or the rest of a list.
  - *Implementation:* `(cdr pair) -> any`
  - *Its use:* Used to advance the recursion to the remaining elements of the list.
  - *Type:* Built-in function.
  - *Responsibility:* Retrieves the second component (the "Contents of the Decrement part of Register number") of a cons cell.
  - *Depends on:* A non-empty pair or list.
  - *Connects to:* Usually serves as the argument for the next recursive call.
  - *Shape:* Standard accessor function.
- **`cons`**
  - *What it is:* The fundamental constructor for pairs and lists.
  - *Implementation:* `(cons a d) -> pair`
  - *Its use:* Used to prepend an element onto an existing list or accumulator.
  - *Type:* Built-in function.
  - *Responsibility:* Allocates a new cons cell with the given `car` and `cdr`.
  - *Depends on:* Two arguments: the element to add and the structure to attach it to (usually a list).
  - *Connects to:* Returns a new pair, extending a list structure.
  - *Shape:* Standard constructor function.
- **`append`**
  - *What it is:* A function that concatenates multiple lists into a single list.
  - *Implementation:* `(append list1 list2 ...) -> list`
  - *Its use:* Shown in the naive reverse (as an anti-pattern) and used correctly in `my-flatten` to merge independent flat lists.
  - *Type:* Built-in function.
  - *Responsibility:* Creates a new list containing all elements of the provided lists in order.
  - *Depends on:* One or more lists as arguments.
  - *Connects to:* Iterates through the first lists, copying their elements to link with the final list.
  - *Shape:* Standard list processing function.
- **`list`**
  - *What it is:* A function that creates a proper list out of its arguments.
  - *Implementation:* `(list arg ...) -> list`
  - *Its use:* Used in `my-zip` to group two elements into a two-element list rather than a bare pair, and in naive reverse to wrap an element for appending.
  - *Type:* Built-in function.
  - *Responsibility:* Constructs a chain of cons cells terminating in `()`, with each argument as an element.
  - *Depends on:* Any number of arguments to be placed in the list.
  - *Connects to:* Often nested within other lists or constructed on the fly.
  - *Shape:* Standard constructor function.
- **`pair?`**
  - *What it is:* A predicate function to check if a value is a cons cell.
  - *Implementation:* `(pair? val) -> boolean`
  - *Its use:* Used in `my-flatten` to determine if an element is itself a nested list that needs flattening.
  - *Type:* Built-in function.
  - *Responsibility:* Returns true if the value is a pair (or non-empty list), false otherwise.
  - *Depends on:* A single value to inspect.
  - *Connects to:* Typically directs branching in `cond` forms for nested structures.
  - *Shape:* Standard predicate call.
- **`or`**
  - *What it is:* A logical operator that evaluates expressions left-to-right, returning true if any expression is truthy.
  - *Implementation:* A special form `(or expr ...)`.
  - *Its use:* Used in `my-zip`, `my-take`, and `my-drop` to check if *either* termination condition is met (e.g., list is empty OR counter is zero).
  - *Type:* Special form.
  - *Responsibility:* Performs short-circuit logical OR evaluation.
  - *Depends on:* One or more boolean expressions.
  - *Connects to:* Supplies a compound condition to an `if` statement.
  - *Shape:* Control flow operator.
- **`zero?`**
  - *What it is:* A predicate function to check if a number is exactly zero.
  - *Implementation:* `(zero? num) -> boolean`
  - *Its use:* Used in `my-take` and `my-drop` as a base case condition to stop when the count reaches zero.
  - *Type:* Built-in function.
  - *Responsibility:* Accurately identifies numerical zero.
  - *Depends on:* A numerical argument.
  - *Connects to:* Directs branching logic for numeric recursion.
  - *Shape:* Standard predicate call.
- **`-`**
  - *What it is:* The subtraction operator function.
  - *Implementation:* `(- a b ...) -> number`
  - *Its use:* Used to decrement the counter `n` by 1 in `my-take` and `my-drop`.
  - *Type:* Built-in function.
  - *Responsibility:* Computes the difference between numbers.
  - *Depends on:* Numerical arguments (usually two).
  - *Connects to:* Provides the updated counter for the next recursive step.
  - *Shape:* Standard arithmetic function.

## Concept Unit: The naive reverse and O(n^2) time complexity

### The Problem

We want to write a function that takes a list and returns a new list with the elements in reverse order. The most intuitive way to think about this recursively is: the reverse of a list is the reverse of its rest (`cdr`), with its first element (`car`) tacked onto the very end. However, tacking an element onto the end of a list in Lisp is not a simple operation.

### Introduce the concept in isolation

Let's look at the naive implementation of reverse that follows this direct recursive translation.

```scheme
(define (slow-reverse lst)
  (if (null? lst)
      '()
      (append (slow-reverse (cdr lst))
              (list (car lst)))))

(slow-reverse '(1 2 3 4 5))
```

Output:
```
'(5 4 3 2 1)
```

The output proves that this logic correctly reverses the list. However, it exposes a massive inefficiency: `append` has to walk every element of its first argument to attach the second argument. When we reverse `'(1 2 3 4 5)`, the deepest call reverses the empty list, returning `()`. Then we append `'(5)`, then append `'(4)` to `'(5)`, then append `'(3)` to `'(5 4)`, and so on. For a list of length *n*, `append` traverses 1 element, then 2 elements, up to *n* elements. The total work is $1 + 2 + 3 + ... + n$, which grows quadratically. This is an **O(n^2) time complexity** anti-pattern.

### Discard the throwaway example

The `slow-reverse` approach is fundamentally inefficient and should not be used in real list processing. We will discard it.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are building our standard library.
- **Files affected:** `list-utils.rkt` (create or modify)
- **Change type:** add
- **Location:** At the top of the file.
- **Dependencies:** None.

### The New Code

```scheme
;; We will replace this with a better approach in the next unit.
```

### The Updated Project

```scheme
;; list-utils.rkt
;; (Empty for now as we discarded the slow approach)
```

### Mechanical walkthrough

- **`define`** declares a new function.
- **`slow-reverse`** is the name of our inefficient function.
- **`lst`** is the input list.
- **`if`** checks the base case.
- **`null?`** tests if `lst` is empty.
- **`'()`** is returned if the list is empty.
- **`append`** is the expensive operation that merges lists.
- **`slow-reverse`** recurses on the rest of the list.
- **`cdr`** gets the rest of the list.
- **`list`** wraps the first element so it can be appended.
- **`car`** gets the first element.

This function builds the result on the way *back up* the recursion tree. Because appending to the end of a linked list requires walking the entire list, doing this inside every recursive step causes the cost to multiply quadratically.

## Concept Unit: The Accumulator Pattern

### The Problem

We need a way to reverse a list in **O(n) time complexity**, traversing the list only once. The problem with `slow-reverse` was building the list on the way *up*. If we can build the list on the way *down*, we can just use `cons` to attach each element to the front of a running result.

### Introduce the concept in isolation

To build on the way down, we need to carry our partial result along with us as we recurse. This extra argument is an **accumulator**.

```scheme
(define (rev-helper lst acc)
  (if (null? lst)
      acc
      (rev-helper (cdr lst) (cons (car lst) acc))))

(rev-helper '(1 2 3) '())
```

Output:
```
'(3 2 1)
```

The output proves that by passing an initially empty list `'()` as `acc`, we can pick off the `car` of `lst` and `cons` it onto `acc` as we go deeper. When `lst` is empty, `acc` holds the fully reversed list, and we just return it. This uses only `cons`, which is a constant-time O(1) operation, meaning the whole traversal takes O(n) time.

### Discard the throwaway example

We will discard the freestanding `rev-helper` because it requires the caller to manually pass `'()` as the second argument, which makes for a bad public API.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `list-utils.rkt`
- **Change type:** add
- **Location:** At the top of the file.
- **Dependencies:** None.

### The New Code

```scheme
(define (my-reverse lst)
  (define (rev-helper lst acc)
    (if (null? lst)
        acc
        (rev-helper (cdr lst) (cons (car lst) acc))))
  (rev-helper lst '()))
```

### The Updated Project

```scheme
;; list-utils.rkt
// ← new
(define (my-reverse lst)
  (define (rev-helper lst acc)
    (if (null? lst)
        acc
        (rev-helper (cdr lst) (cons (car lst) acc))))
  (rev-helper lst '()))
```
Our file now contains a highly efficient O(n) reverse function that hides its accumulator implementation details from the user.

### Mechanical walkthrough

- **`define`** declares the public function `my-reverse`.
- **`lst`** is the input list to reverse.
- **`define`** inside `my-reverse` creates a **local definition**, hiding `rev-helper` from the outside world.
- **`rev-helper`** is our tail-recursive helper function.
- **`acc`** is the **accumulator parameter**, holding the partial reversed list.
- **`if`** checks the base case.
- **`null?`** tests if the remaining `lst` is empty.
- **`acc`** is returned directly when `lst` is empty; it holds the final result.
- **`rev-helper`** makes the recursive call.
- **`cdr`** shrinks the input list.
- **`cons`** prepends the current element.
- **`car`** gets the current element from `lst`.
- **`rev-helper lst '()`** kicks off the recursion by passing the initial empty accumulator.

Execution trace for `(my-reverse '(1 2 3))`:
```
Call 1: rev-helper '(1 2 3) '()
Call 2: rev-helper '(2 3) '(1)
Call 3: rev-helper '(3) '(2 1)
Call 4: rev-helper '() '(3 2 1)
Return: '(3 2 1)
```

Notice that the recursive call to `rev-helper` is the very last thing evaluated in the `if` branch. This is called **tail recursion**. The Scheme runtime optimizes this so that it does not grow the call stack, making it as efficient as a `while` loop in other languages.

## Concept Unit: Named Inner Definitions

### The Problem

We don't want to expose our `rev-helper` to the global namespace. A consumer of our library should just call `(my-reverse '(1 2 3))` and not need to know about the two-argument helper or accidentally call it.

### Introduce the concept in isolation

Scheme allows us to nest `define` forms inside other `define` forms or functions.

```scheme
(define (outer-func x)
  (define (inner-func y)
    (+ y 1))
  (inner-func x))

(outer-func 5)
```

Output:
```
6
```

The output proves that `inner-func` is accessible inside `outer-func` and can be called to produce a result, but `inner-func` cannot be called from the outside.

### Discard the throwaway example

We will discard this arbitrary `outer-func` example.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `list-utils.rkt`
- **Change type:** configure
- **Location:** Inside `my-reverse`
- **Dependencies:** None.

### The New Code

```scheme
;; The structure is already in our my-reverse from the previous unit.
```

### The Updated Project

```scheme
(define (my-reverse lst)
  (define (rev-helper lst acc) ; ← inner definition
    (if (null? lst)
        acc
        (rev-helper (cdr lst) (cons (car lst) acc))))
  (rev-helper lst '()))
```
The inner definition pattern neatly encapsulates the helper logic.

### Mechanical walkthrough

- **`define`** creates the local helper. This is a **local definition**. It exists only within the lexical scope of `my-reverse`. This is the standard idiom in Scheme for hiding accumulator-based helpers.

## Concept Unit: Flatten (Review of Double-Recursion)

### The Problem

Lists can be nested arbitrarily deep (e.g., `'(a (b (c d)) (e f))`), and we need a function to extract all the elements into a single flat list. We cannot just iterate linearly because elements themselves might be lists.

### Introduce the concept in isolation

We must use the **double-recursion pattern**, recursing simultaneously on the `car` (to dive into sublists) and the `cdr` (to move forward).

```scheme
(define (my-flatten lst)
  (cond
    [(null? lst) '()]
    [(pair? (car lst))
     (append (my-flatten (car lst))
             (my-flatten (cdr lst)))]
    [else
     (cons (car lst) (my-flatten (cdr lst)))]))

(my-flatten '(a (b (c d)) (e f)))
```

Output:
```
'(a b c d e f)
```

The output proves that `my-flatten` correctly flattens nested lists regardless of depth. Unlike `slow-reverse`, using `append` here is completely legitimate: we are merging two independently produced flat lists (the flattened `car` and the flattened `cdr`), not accumulating a result element-by-element inside a chain of `cons`es.

### Discard the throwaway example

We will not discard this; this is exactly the code we need.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `list-utils.rkt`
- **Change type:** add
- **Location:** After `my-reverse`.
- **Dependencies:** None.

### The New Code

```scheme
(define (my-flatten lst)
  (cond
    [(null? lst) '()]
    [(pair? (car lst))
     (append (my-flatten (car lst))
             (my-flatten (cdr lst)))]
    [else
     (cons (car lst) (my-flatten (cdr lst)))]))
```

### The Updated Project

```scheme
;; list-utils.rkt
(define (my-reverse lst)
  ;; ...
  )

// ← new
(define (my-flatten lst)
  (cond
    [(null? lst) '()]
    [(pair? (car lst))
     (append (my-flatten (car lst))
             (my-flatten (cdr lst)))]
    [else
     (cons (car lst) (my-flatten (cdr lst)))]))
```
Our module now supports deep structural transformations.

### Mechanical walkthrough

- **`define`** declares the `my-flatten` function.
- **`lst`** is the input nested list.
- **`cond`** introduces a multi-way branch.
- **`null?`** tests the base case: empty list returns `'()`.
- **`pair?`** checks if the first element (`car lst`) is itself a list.
- **`car`** accesses the first element.
- **`append`** concatenates the results of the two recursive calls.
- **`my-flatten`** recurses into the sublist (`car`).
- **`my-flatten`** recurses into the rest of the list (`cdr`).
- **`else`** catches the case where the first element is a bare atom.
- **`cons`** attaches the bare atom directly to the flattened rest of the list.

Execution trace for `(my-flatten '((a) b))`:
```
Call: my-flatten '((a) b)
  car is '(a), which is a pair.
  Calls: (append (my-flatten '(a)) (my-flatten '(b)))
  
  Subcall 1: my-flatten '(a)
    car is 'a, which is not a pair.
    Calls: (cons 'a (my-flatten '())) -> '(a)
    
  Subcall 2: my-flatten '(b)
    car is 'b, which is not a pair.
    Calls: (cons 'b (my-flatten '())) -> '(b)
    
  Returns: (append '(a) '(b)) -> '(a b)
```

## Concept Unit: Zip and Simultaneous Recursion

### The Problem

Often we have two parallel lists (e.g., keys and values) and we want to combine them by pairing corresponding elements together.

### Introduce the concept in isolation

We must step through both lists at the same time, using **simultaneous recursion**, stopping when *either* list runs out of elements.

```scheme
(define (my-zip lst1 lst2)
  (if (or (null? lst1) (null? lst2))
      '()
      (cons (list (car lst1) (car lst2))
            (my-zip (cdr lst1) (cdr lst2)))))

(my-zip '(a b c) '(1 2 3))
```

Output:
```
'((a 1) (b 2) (c 3))
```

The output proves that `my-zip` takes corresponding elements and pairs them up. Notice that the result elements are two-element lists built with `list`, not raw pairs built with `cons`. If we used `(cons (car lst1) (car lst2))`, the result would be `((a . 1) (b . 2) (c . 3))`.

### Discard the throwaway example

We will keep this code.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `list-utils.rkt`
- **Change type:** add
- **Location:** After `my-flatten`.
- **Dependencies:** None.

### The New Code

```scheme
(define (my-zip lst1 lst2)
  (if (or (null? lst1) (null? lst2))
      '()
      (cons (list (car lst1) (car lst2))
            (my-zip (cdr lst1) (cdr lst2)))))
```

### The Updated Project

```scheme
;; list-utils.rkt
(define (my-flatten lst)
  ;; ...
  )

// ← new
(define (my-zip lst1 lst2)
  (if (or (null? lst1) (null? lst2))
      '()
      (cons (list (car lst1) (car lst2))
            (my-zip (cdr lst1) (cdr lst2)))))
```
We now have a function capable of parallel list traversal.

### Mechanical walkthrough

- **`define`** declares `my-zip`.
- **`lst1`** and **`lst2`** are the parallel lists.
- **`if`** checks the termination condition.
- **`or`** short-circuits the condition: if *either* is empty, stop.
- **`null?`** tests each list.
- **`'()`** is the return value for the base case.
- **`cons`** builds the result list.
- **`list`** packages the two current elements into a nice two-element proper list `(x y)`.
- **`car`** gets the element from each list.
- **`my-zip`** recursively calls itself.
- **`cdr`** steps both lists forward simultaneously.

Execution trace for `(my-zip '(a b) '(1 2))`:
```
Call 1: my-zip '(a b) '(1 2)
  cons (list 'a 1) onto (my-zip '(b) '(2))
Call 2: my-zip '(b) '(2)
  cons (list 'b 2) onto (my-zip '() '())
Call 3: my-zip '() '()
  Base case triggered, returns '()
Returns: '((a 1) (b 2))
```

## Concept Unit: Take and Drop

### The Problem

Sometimes we need to split a list in half at a specific index. `take` returns the first *n* elements, and `drop` returns the remaining elements.

### Introduce the concept in isolation

This requires recursing on both a number (counting down) and a list (moving forward) simultaneously.

```scheme
(define (my-take n lst)
  (if (or (zero? n) (null? lst))
      '()
      (cons (car lst) (my-take (- n 1) (cdr lst)))))

(define (my-drop n lst)
  (if (or (zero? n) (null? lst))
      lst
      (my-drop (- n 1) (cdr lst))))

(my-take 3 '(a b c d e))
(my-drop 3 '(a b c d e))
```

Output:
```
'(a b c)
'(d e)
```

The output proves that `my-take` successfully grabs the front of the list while `my-drop` skips exactly that many elements, leaving the rest.

### Discard the throwaway example

We will keep this code for our project.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `list-utils.rkt`
- **Change type:** add
- **Location:** After `my-zip`.
- **Dependencies:** None.

### The New Code

```scheme
(define (my-take n lst)
  (if (or (zero? n) (null? lst))
      '()
      (cons (car lst) (my-take (- n 1) (cdr lst)))))

(define (my-drop n lst)
  (if (or (zero? n) (null? lst))
      lst
      (my-drop (- n 1) (cdr lst))))
```

### The Updated Project

```scheme
;; list-utils.rkt
(define (my-zip lst1 lst2)
  ;; ...
  )

// ← new
(define (my-take n lst)
  (if (or (zero? n) (null? lst))
      '()
      (cons (car lst) (my-take (- n 1) (cdr lst)))))

(define (my-drop n lst)
  (if (or (zero? n) (null? lst))
      lst
      (my-drop (- n 1) (cdr lst))))
```
We now have the primitive tools for splitting and segmenting lists.

### Mechanical walkthrough

- **`define`** declares the functions.
- **`n`** is the count of elements to take or drop.
- **`lst`** is the target list.
- **`if`** checks the combined base case.
- **`or`** triggers the base case if *either* the counter hits zero OR the list runs out of elements (preventing an error on short lists).
- **`zero?`** checks if the counter `n` is exactly zero.
- **`null?`** checks if the list is empty.
- **`'()`** is returned by `my-take` at the base case, ending its `cons` chain.
- **`lst`** is returned by `my-drop` at the base case, returning whatever is left of the list un-traversed.
- **`cons`** is used by `my-take` to build the retained elements.
- **`car`** accesses the current element for `my-take`.
- **`my-take`** / **`my-drop`** recursively call themselves.
- **`-`** subtracts 1 from `n` to step the counter down.
- **`cdr`** steps the list forward.

Execution trace for `(my-take 2 '(a b c))`:
```
Call 1: my-take 2 '(a b c)
  cons 'a onto (my-take 1 '(b c))
Call 2: my-take 1 '(b c)
  cons 'b onto (my-take 0 '(c))
Call 3: my-take 0 '(c)
  Base case zero? triggers, returns '()
Returns: '(a b)
```

Execution trace for `(my-drop 2 '(a b c))`:
```
Call 1: my-drop 2 '(a b c)
  recurs to (my-drop 1 '(b c))
Call 2: my-drop 1 '(b c)
  recurs to (my-drop 0 '(c))
Call 3: my-drop 0 '(c)
  Base case zero? triggers, returns '(c)
Returns: '(c)
```
Notice how `my-drop` is tail-recursive, simply shedding elements and counting down until it hands back the remaining list pointer directly.

## Closing
We have built four fundamental algorithms: `reverse`, `flatten`, `zip`, and `take`/`drop`. Together, these primitives form the bedrock of list manipulation. `my-take` and `my-drop` combined can split any list perfectly in two. 

**Exercises:**
1. Write `my-split-at` which takes an index `n` and a list, and returns a pair `(take-result . drop-result)` without traversing the list twice.
2. Write `my-interleave`, taking two lists and alternating their elements into a single list until one is empty.

Next lesson, we will explore higher-order functions.
