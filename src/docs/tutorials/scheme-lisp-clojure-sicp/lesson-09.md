# Lesson 9: Firsts and Seconds — Nested List Recursion

- **What you will build:** The reader will learn to write recursive functions that descend into nested lists — lists whose elements are themselves lists. The transferable problems: (1) to recur into a nested list you need TWO recursive calls — one on `(car lst)` when it is a pair, one always on `(cdr lst)`; (2) `firsts` and `seconds` — extracting the first/second element of each sublist — are the canonical examples of flat-list recursion on a list of lists; (3) `insertR*` and `rember*` on nested lists (the "starred" functions from The Little Schemer) show the full double-recursion pattern.
- **What you need to know first:** Lessons 0–8 (all prior concepts through `lat?`, `member?`, `rember`, `rember*`, structural recursion, cons-building, functions as arguments).

**Terms used in this lesson:**
- **Nested list** — a list whose elements can themselves be lists, rather than just atoms. Nested lists require algorithms that can traverse multiple dimensions (down into sublists, across the main list).
- **Flat recursion** — recursion that only traverses the "top level" of a list, moving via `cdr` across the list but never descending into the elements themselves.
- **Double recursion** — recursion that descends into sublists by making a recursive call on `(car lst)` in addition to the standard recursive call on `(cdr lst)`. This pattern is required to process every element of a nested list regardless of depth.
- **`null?`** — a predicate that tests whether a list is empty. It forms the base case for almost all list recursion.
- **`pair?`** — a predicate that tests whether an item is a pair (a cons cell). In Scheme, `pair?` is used to detect if an element is a sublist that can be descended into.

**Objects and methods used:**

- **`car`**
  - *What it is:* A fundamental list operation that extracts the first element of a pair or list.
  - *Implementation:* Built-in procedure `(car pair)`.
  - *Its use:* Used to examine the current element being processed, or to extract specific elements from sublists (like in `firsts` and `seconds`).
  - *Type:* Built-in function.
  - *Responsibility:* To return the contents of the address register of a cons cell (the left side of a pair).
  - *Depends on:* A non-empty list or pair.
  - *Connects to:* Often fed into recursive calls or examined via predicates like `pair?` or `equal?`.
  - *Shape:* A primitive operation on the data structure boundary.

- **`cdr`**
  - *What it is:* A fundamental list operation that extracts the rest of a pair or list after the first element.
  - *Implementation:* Built-in procedure `(cdr pair)`.
  - *Its use:* Used to advance the recursion to the next element in the list.
  - *Type:* Built-in function.
  - *Responsibility:* To return the contents of the decrement register of a cons cell (the right side of a pair, typically the rest of the list).
  - *Depends on:* A non-empty list or pair.
  - *Connects to:* Fed into recursive calls to process the remainder of the list.
  - *Shape:* A primitive operation on the data structure boundary.

- **`cons`**
  - *What it is:* A fundamental list operation that constructs a new pair or adds an element to the front of a list.
  - *Implementation:* Built-in procedure `(cons obj1 obj2)`.
  - *Its use:* Used to build up the result list during recursive returns.
  - *Type:* Built-in function.
  - *Responsibility:* To allocate a new cons cell and set its `car` and `cdr` pointers.
  - *Depends on:* Two objects to pair together (often an atom and a list).
  - *Connects to:* Connects elements to lists; outputs of recursive calls are often passed as the second argument to `cons`.
  - *Shape:* A primitive operation on the data structure boundary.

- **`equal?`**
  - *What it is:* A general-purpose equality predicate.
  - *Implementation:* Built-in procedure `(equal? obj1 obj2)`.
  - *Its use:* Used to check if an atom matches a target atom during removal or counting operations.
  - *Type:* Built-in function.
  - *Responsibility:* To determine if two objects are structurally equivalent.
  - *Depends on:* Two objects to compare.
  - *Connects to:* Conditional branches (`cond` or `if`) to direct the flow of recursion.
  - *Shape:* A primitive operation on the logic boundary.

- **`append`**
  - *What it is:* A built-in function that concatenates multiple lists into a single list.
  - *Implementation:* Built-in procedure `(append list ... )`.
  - *Its use:* Used in `flatten` to merge the results of recursing down into a sublist with the results of recursing across the main list.
  - *Type:* Built-in function.
  - *Responsibility:* To traverse its arguments and build a new list containing all their elements in order.
  - *Depends on:* Lists to concatenate.
  - *Connects to:* Outputs of recursive branches in tree-flattening algorithms.
  - *Shape:* A list manipulation utility.

---

## Concept Unit: `firsts`

### The Problem

We have a list where every element is itself a non-empty list. We want to extract just the first element of each of these sublists and return them as a new, flat list.

### Introduce the concept in isolation

Before tackling a whole list of lists, let's look at extracting the first element of a single list that is nested inside another list structure. We'll use a **`car` of a `car`**.

```scheme
(define single-nested '((a b)))
(car (car single-nested))
```

Output:
```
'a
```

What this proves: `(car single-nested)` gives us the first element, which is the list `'(a b)`. Calling `car` again on that result extracts the symbol `'a`.

### Discard the throwaway example

The `single-nested` example is deleted and will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition to build intuition for list traversal.
- **Files affected:** `nested-lists.rkt` (created)
- **Change type:** Add
- **Location:** At the top of the new file.
- **Dependencies:** None.

### The New Code

```scheme
(define (firsts lst)
  (if (null? lst)
      '()
      (cons (car (car lst))
            (firsts (cdr lst)))))
```

### The Updated Project

```scheme
// ← new
(define (firsts lst)
  (if (null? lst)
      '()
      (cons (car (car lst))
            (firsts (cdr lst)))))
```

This function traverses a list of lists and collects the first item of each into a single list.

### Mechanical walkthrough

- `(define (firsts lst)`: Defines a new function named `firsts` taking one argument, `lst`.
- `(if (null? lst)`: Checks if the list is empty. This is the base case.
- `'()`: If the list is empty, returns the empty list.
- `(cons ... )`: If the list is not empty, constructs a new list.
- `(car (car lst))`: Extracts the first element of the current sublist. `(car lst)` gets the sublist; the outer `car` gets its first element.
- `(firsts (cdr lst))`: Recursively calls `firsts` on the remainder of the top-level list.

**Execution trace:**

```scheme
> (firsts '((a b) (c d) (e f)))
```

Iteration 1: `lst` is `'((a b) (c d) (e f))`. `null?` is false. We cons `(car (car lst))` (which is `'a`) onto `(firsts '((c d) (e f)))`.
Iteration 2: `lst` is `'((c d) (e f))`. `null?` is false. We cons `'c` onto `(firsts '((e f)))`.
Iteration 3: `lst` is `'((e f))`. `null?` is false. We cons `'e` onto `(firsts '())`.
Iteration 4: `lst` is `'()`. `null?` is true. Returns `'()`.

Result unwinds: `(cons 'a (cons 'c (cons 'e '())))` => `'(a c e)`.

This is **FLAT recursion** on the outer list — we never descend into the sublists, we just peek at their `car`. The recursion only travels along the `cdr` of the main list.

---

## Concept Unit: `seconds`

### The Problem

Now we want to extract the *second* element of each sublist in a list of lists. The pattern will be very similar, but we need to reach deeper into each sublist.

### Introduce the concept in isolation

Let's extract the second element of a single list nested inside another.

```scheme
(define single-nested '((a b c)))
(car (cdr (car single-nested)))
```

Output:
```
'b
```

What this proves: `(car single-nested)` yields `'(a b c)`. `(cdr '(a b c))` yields `'(b c)`. `(car '(b c))` yields `'b`.

### Discard the throwaway example

The `single-nested` example is deleted and will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `nested-lists.rkt` (modified)
- **Change type:** Add
- **Location:** Below `firsts`.
- **Dependencies:** None.

### The New Code

```scheme
(define (seconds lst)
  (if (null? lst)
      '()
      (cons (car (cdr (car lst)))
            (seconds (cdr lst)))))
```

### The Updated Project

```scheme
(define (firsts lst)
  (if (null? lst)
      '()
      (cons (car (car lst))
            (firsts (cdr lst)))))

// ← new
(define (seconds lst)
  (if (null? lst)
      '()
      (cons (car (cdr (car lst)))
            (seconds (cdr lst)))))
```

This function traverses a list of lists and collects the second item of each into a single list.

### Mechanical walkthrough

- `(define (seconds lst)`: Defines the function `seconds`.
- `(if (null? lst)`: The base case check.
- `'()`: Base case return value.
- `(cons ... )`: Builds the result list.
- `(car (cdr (car lst)))`: `(car lst)` gets the sublist. `(cdr ...)` gets the tail of that sublist (everything after the first element). `(car ...)` gets the first element of *that* tail, which is the second element of the original sublist.
- `(seconds (cdr lst))`: Recursively processes the rest of the main list.

**Execution trace:**

```scheme
> (seconds '((a b) (c d) (e f)))
```

Iteration 1: `lst` is `'((a b) (c d) (e f))`. Extracts `'b`. Recurs on `'((c d) (e f))`.
Iteration 2: `lst` is `'((c d) (e f))`. Extracts `'d`. Recurs on `'((e f))`.
Iteration 3: `lst` is `'((e f))`. Extracts `'f`. Recurs on `'()`.
Iteration 4: `lst` is `'()`. Returns `'()`.

Result unwinds: `(cons 'b (cons 'd (cons 'f '())))` => `'(b d f)`.

---

## Concept Unit: The double-recursion pattern

### The Problem

If a list can contain sublists of arbitrary depth, we cannot just use `car` or `cdr` a fixed number of times. We need a function that looks at EVERY atom in a nested list, regardless of how deep it is. To do this, we need to recur in two directions: down into sublists AND across the top-level list.

### Introduce the concept in isolation

Let's look at how we can identify if we need to recur downwards. We use `pair?` to check if an element is a list.

```scheme
(pair? '(a b))
(pair? 'c)
```

Output:
```
#t
#f
```

What this proves: `pair?` returns true for lists (which are made of pairs) and false for atoms. We can use this to branch our recursion.

### Discard the throwaway example

The `pair?` example is deleted and will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `nested-lists.rkt` (modified)
- **Change type:** Add
- **Location:** As a comment block explaining the template.
- **Dependencies:** None.

### The New Code

```scheme
#|
(define (f* lst)
  (cond
    [(null? lst) BASE]
    [(pair? (car lst))
     (... (f* (car lst))   ; recurse INTO the sublist
          (f* (cdr lst)))] ; recurse ACROSS the top level
    [else
     (... (car lst)        ; process the atom
          (f* (cdr lst)))]))
|#
```

### The Updated Project

```scheme
// (firsts and seconds definitions omitted for space)

// ← new
#|
(define (f* lst)
  (cond
    [(null? lst) BASE]
    [(pair? (car lst))
     (... (f* (car lst))   ; recurse INTO the sublist
          (f* (cdr lst)))] ; recurse ACROSS the top level
    [else
     (... (car lst)        ; process the atom
          (f* (cdr lst)))]))
|#
```

This is a template for **double recursion**, showing the structural branches required to traverse an arbitrarily nested tree of lists.

### Mechanical walkthrough

- `(define (f* lst)`: Defines a theoretical function `f*`. The `*` is a convention indicating it operates on deeply nested lists.
- `(cond`: Starts a multi-branch conditional.
- `[(null? lst) BASE]`: The base case. If the list is empty, we return some base value.
- `[(pair? (car lst))`: Checks if the first element is a list (a pair). If it is, it means we have a sublist.
- `(... (f* (car lst)) (f* (cdr lst)))]`: The crucial double recursion. We call `f*` on `(car lst)` to process the sublist, and we call `f*` on `(cdr lst)` to process the rest of the current list level. We combine their results using some operation `...`.
- `[else`: If it's not null and the first element is not a pair, the first element must be an atom.
- `(... (car lst) (f* (cdr lst)))]`: We process the atom `(car lst)` and combine it with the recursive result of processing the rest of the list `(cdr lst)`.

---

## Concept Unit: `rember*`

### The Problem

We want to remove all occurrences of a specific atom from a list, no matter how deeply nested those occurrences are. `rember` only looks at the top level. We need `rember*`.

### Introduce the concept in isolation

We already know the template. Let's trace a small example manually to see what we want to construct.

```scheme
;; If we want to remove 'b from '(a (b c))
;; Top level gives us 'a and '(b c).
;; We keep 'a, and recursively process '(b c).
;; Processing '(b c) removes 'b and leaves '(c).
;; Recombining gives '(a (c)).
```

### Discard the throwaway example

The manual trace is discarded.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `nested-lists.rkt` (modified)
- **Change type:** Add
- **Location:** Below the template comment.
- **Dependencies:** None.

### The New Code

```scheme
(define (rember* a lst)
  (cond
    [(null? lst) '()]
    [(pair? (car lst))
     (cons (rember* a (car lst))
           (rember* a (cdr lst)))]
    [(equal? (car lst) a)
     (rember* a (cdr lst))]
    [else
     (cons (car lst) (rember* a (cdr lst)))]))
```

### The Updated Project

```scheme
// (template comment omitted)

// ← new
(define (rember* a lst)
  (cond
    [(null? lst) '()]
    [(pair? (car lst))
     (cons (rember* a (car lst))
           (rember* a (cdr lst)))]
    [(equal? (car lst) a)
     (rember* a (cdr lst))]
    [else
     (cons (car lst) (rember* a (cdr lst)))]))
```

This function implements the double-recursion pattern to remove an atom from any depth.

### Mechanical walkthrough

- `(define (rember* a lst)`: Defines `rember*` taking the atom `a` to remove, and the list `lst`.
- `[(null? lst) '()]`: Base case: if the list is empty, return an empty list.
- `[(pair? (car lst))`: If the first element is a sublist.
- `(cons (rember* a (car lst)) (rember* a (cdr lst)))]`: Recursively call `rember*` on the sublist `(car lst)` to clean it, and recursively call `rember*` on the rest of the list `(cdr lst)` to clean it. `cons` puts the cleaned sublist back onto the cleaned rest of the list.
- `[(equal? (car lst) a)`: If the first element is the atom we want to remove.
- `(rember* a (cdr lst))]`: We skip it. We do not `cons` it. We just return the result of cleaning the rest of the list.
- `[else (cons (car lst) (rember* a (cdr lst)))]`: Otherwise, it's an atom we want to keep. We `cons` it onto the cleaned rest of the list.

**Execution trace:**

```scheme
> (rember* 'b '(a (b c) (b (b d))))
```

Iteration 1: `lst` is `'(a (b c) (b (b d)))`. `car` is `'a`. Matches `else`. We evaluate `(cons 'a (rember* 'b '((b c) (b (b d)))))`.
Iteration 2: (Processing the `cdr` from Iteration 1). `lst` is `'((b c) (b (b d)))`. `car` is `'(b c)`. `pair?` is true. We evaluate `(cons (rember* 'b '(b c)) (rember* 'b '((b (b d)))))`.
Iteration 2a: (Descending into `(b c)`). `car` is `'b`. Matches `equal?`. We evaluate `(rember* 'b '(c))`.
Iteration 2b: `car` is `'c`. Matches `else`. Returns `(cons 'c '())` -> `'(c)`.
(Back to Iteration 2): The `car` part of the `cons` is now `'(c)`. We proceed to the `cdr` part.

The recursion explores every branch of the tree, selectively omitting `'b` atoms, and reassembling the structure using `cons`. Result: `'(a (c) ((d)))`.

---

## Concept Unit: `occur*`

### The Problem

We want to count how many times a specific atom appears in a nested list, at any depth. This is similar to `rember*`, but instead of building a new list with `cons`, we are summing numbers.

### Introduce the concept in isolation

We can add results from two recursive calls using the standard `+` operator.

```scheme
(+ 1 2)
```

Output:
```
3
```

What this proves: `+` takes numbers and returns their sum. We can use this to combine counts from the `car` branch and the `cdr` branch.

### Discard the throwaway example

The `+` example is discarded.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `nested-lists.rkt` (modified)
- **Change type:** Add
- **Location:** Below `rember*`.
- **Dependencies:** None.

### The New Code

```scheme
(define (occur* a lst)
  (cond
    [(null? lst) 0]
    [(pair? (car lst))
     (+ (occur* a (car lst))
        (occur* a (cdr lst)))]
    [(equal? (car lst) a) (+ 1 (occur* a (cdr lst)))]
    [else (occur* a (cdr lst))]))
```

### The Updated Project

```scheme
// (rember* definition omitted)

// ← new
(define (occur* a lst)
  (cond
    [(null? lst) 0]
    [(pair? (car lst))
     (+ (occur* a (car lst))
        (occur* a (cdr lst)))]
    [(equal? (car lst) a) (+ 1 (occur* a (cdr lst)))]
    [else (occur* a (cdr lst))]))
```

This function traverses the nested list and sums occurrences.

### Mechanical walkthrough

- `(define (occur* a lst)`: Defines the function.
- `[(null? lst) 0]`: Base case: an empty list contains 0 occurrences.
- `[(pair? (car lst))`: If the element is a sublist.
- `(+ (occur* a (car lst)) (occur* a (cdr lst)))]`: We add the count found inside the sublist to the count found in the rest of the list.
- `[(equal? (car lst) a)`: If the atom matches our target.
- `(+ 1 (occur* a (cdr lst)))]`: We add 1 to the count found in the rest of the list.
- `[else (occur* a (cdr lst))]`: If the atom doesn't match, we add nothing, just return the count from the rest of the list.

**Execution trace:**

```scheme
> (occur* 'b '(a (b c) (b (b d))))
```

It encounters `a`, adds 0.
It descends into `(b c)`, finds `b` (+1), finds `c` (+0), returns 1.
It descends into `(b (b d))`, finds `b` (+1). It descends into `(b d)`, finds `b` (+1), finds `d` (+0). Returns 2. Total from that sublist is 3.
Total sum across all branches is 3.

---

## Concept Unit: `flatten`

### The Problem

We want to take a deeply nested list and return a single, flat list containing all the atoms in the same left-to-right order. We cannot just use `cons` when recombining branches because `cons`ing a list onto a list creates a nested list, and we want a flat one. We need `append`.

### Introduce the concept in isolation

Let's see what `append` does compared to `cons`.

```scheme
(cons '(a b) '(c d))
(append '(a b) '(c d))
```

Output:
```
'((a b) c d)
'(a b c d)
```

What this proves: `cons` treats its first argument as a single element to place inside the second argument. `append` merges the elements of both lists into a single flat list.

### Discard the throwaway example

The `append` vs `cons` example is discarded.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `nested-lists.rkt` (modified)
- **Change type:** Add
- **Location:** Below `occur*`.
- **Dependencies:** None.

### The New Code

```scheme
(define (flatten lst)
  (cond
    [(null? lst) '()]
    [(pair? (car lst))
     (append (flatten (car lst))
             (flatten (cdr lst)))]
    [else
     (cons (car lst) (flatten (cdr lst)))]))
```

### The Updated Project

```scheme
// (occur* definition omitted)

// ← new
(define (flatten lst)
  (cond
    [(null? lst) '()]
    [(pair? (car lst))
     (append (flatten (car lst))
             (flatten (cdr lst)))]
    [else
     (cons (car lst) (flatten (cdr lst)))]))
```

This function reduces a nested list to a flat list of all its atoms.

### Mechanical walkthrough

- `(define (flatten lst)`: Defines the function.
- `[(null? lst) '()]`: Base case: flattening an empty list yields an empty list.
- `[(pair? (car lst))`: If we encounter a sublist.
- `(append (flatten (car lst)) (flatten (cdr lst)))]`: We flatten the sublist. We flatten the rest of the list. We use `append` to merge these two flat lists into one bigger flat list. This is one of the rare legitimate uses of `append` in a recursive function — because we're merging two independently-produced flat lists, not appending inside a single `cons`-chain.
- `[else (cons (car lst) (flatten (cdr lst)))]`: If it's an atom, we just `cons` it onto the flattened rest of the list.

**Execution trace:**

```scheme
> (flatten '(a (b (c d)) (e f)))
```

Iteration 1: `lst` is `'(a (b (c d)) (e f))`. `car` is `'a`. Matches `else`. We evaluate `(cons 'a (flatten '((b (c d)) (e f))))`.
Iteration 2: `lst` is `'((b (c d)) (e f))`. `car` is `'(b (c d))`. Matches `pair?`. We evaluate `(append (flatten '(b (c d))) (flatten '((e f))))`.
Sub-iteration: `(flatten '(b (c d)))` flattens to `'(b c d)`. `(flatten '((e f)))` flattens to `'(e f)`.
The `append` call merges `'(b c d)` and `'(e f)` into `'(b c d e f)`.
Back to Iteration 1: `(cons 'a '(b c d e f))` yields `'(a b c d e f)`.

### Connect the Pieces

All these functions share a common philosophy: processing tree structures requires recursive traversal in multiple dimensions. `firsts` and `seconds` represent flat traversal on a nested structure, accessing specific depths deterministically. `rember*`, `occur*`, and `flatten` demonstrate the full double-recursion pattern, allowing comprehensive traversal regardless of the tree's depth or shape.

Try writing `subst*` to substitute all occurrences of an atom at any depth, or `depth` to find the maximum nesting depth of a list.
