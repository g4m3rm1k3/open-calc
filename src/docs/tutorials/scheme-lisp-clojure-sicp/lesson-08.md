# Lesson 8: `lat?`, `member?`, `rember` — Searching and Modifying Lists

**What you will build**
The reader will write the classic Little Schemer predicates and transformers: `lat?` (is this a list of atoms?), `member?` (is this atom in this lat?), and `rember` (remove first occurrence). These are the exact functions from Chapter 2 of The Little Schemer. The transferable problems: (1) writing predicates — functions that return only `#t` or `#f` — using the structural recursion template; (2) the difference between searching (`member?`) and transforming (`rember`) — both recur the same way but differ in what they do at the found case; (3) `lat?` introduces the idea of a type-checking predicate over a list — confirming every element satisfies a condition.

**What you need to know first**
Lessons 0–7 (all prior concepts through the Three Commandments, my-map, my-filter, my-reduce, structural recursion pattern, cons-building, functions as arguments).

**Terms used in this lesson**
- **define** — A keyword used to bind a name to a value or a function, allowing it to be reused throughout the program.
- **cond** — A conditional branching keyword that evaluates a series of test clauses, returning the result of the first true test to handle multiple cases in a recursive function.
- **else** — A fallback keyword used as the final test in a `cond` block; it always evaluates to true, catching anything not matched by previous clauses.
- **#t** — The boolean literal for true in Scheme, indicating a condition has been met or a predicate has passed.
- **#f** — The boolean literal for false in Scheme, indicating a condition failed or a predicate did not match.
- **' (quote)** — Syntax that tells the evaluator to treat the following data as a literal list or symbol rather than code to be evaluated.
- **predicate** — A function that asks a question about its arguments and returns only `#t` or `#f`.
- **lat** — A list of atoms; a flat list containing no nested lists.
- **structural recursion** — A design pattern where a function consumes a recursive data structure (like a list) by handling the empty case and then calling itself on a smaller piece of the structure (the rest of the list).

**Objects and methods used**

- **`lat?`**
  - *What it is:* A predicate function that checks if a list consists entirely of atoms.
  - *Implementation:* `(define (lat? lst) ...)` returning a boolean.
  - *Its use:* Used to verify the type of a list before processing it with functions that expect a flat list.
  - *Type:* A freestanding recursive function.
  - *Responsibility:* Traverses a list and confirms every element is an atom, returning `#f` immediately if a pair is found.
  - *Depends on:* A list `lst` to inspect.
  - *Connects to:* Called by user code; calls itself recursively on `(cdr lst)`.
  - *Shape:* A domain-specific utility predicate.

- **`atom?`**
  - *What it is:* A predicate that checks if a value is an atom (i.e., not a pair).
  - *Implementation:* `(define (atom? x) (not (pair? x)))` returning a boolean.
  - *Its use:* Used to differentiate between single values and nested lists during traversal.
  - *Type:* A freestanding utility function.
  - *Responsibility:* Determines if a given expression is a fundamental unit (atom) rather than a composite pair.
  - *Depends on:* A value `x` to inspect.
  - *Connects to:* Called by `lat?` and other recursive structural functions.
  - *Shape:* A fundamental data-type checker.

- **`not`**
  - *What it is:* A logical negation function.
  - *Implementation:* Built-in Scheme function returning a boolean.
  - *Its use:* Used to invert the boolean result of another predicate, such as `pair?`.
  - *Type:* A built-in function.
  - *Responsibility:* Returns `#t` if its argument is `#f`, and `#f` otherwise.
  - *Depends on:* A single boolean or truthy expression.
  - *Connects to:* Called within predicates like `atom?` to invert logic.
  - *Shape:* Core language primitive.

- **`pair?`**
  - *What it is:* A predicate that checks if a value is a cons cell.
  - *Implementation:* Built-in Scheme function returning a boolean.
  - *Its use:* Used to identify if a value is a non-empty list or pair.
  - *Type:* A built-in function.
  - *Responsibility:* Returns `#t` if the argument is a pair created by `cons`.
  - *Depends on:* A single value to inspect.
  - *Connects to:* Used directly or via `atom?`.
  - *Shape:* Core language primitive.

- **`car`**
  - *What it is:* A function that extracts the first element of a pair.
  - *Implementation:* Built-in Scheme function returning any type.
  - *Its use:* Used to inspect the current element being processed in a list.
  - *Type:* A built-in function.
  - *Responsibility:* Retrieves the value held in the first position of a cons cell.
  - *Depends on:* A valid non-empty list (or pair).
  - *Connects to:* Often passed to predicates or transformers in the recursive step.
  - *Shape:* Core data-structure accessor.

- **`cdr`**
  - *What it is:* A function that extracts the second element (usually the rest of the list) of a pair.
  - *Implementation:* Built-in Scheme function returning a list or value.
  - *Its use:* Used to advance a recursive traversal to the remainder of a list.
  - *Type:* A built-in function.
  - *Responsibility:* Retrieves the value held in the second position of a cons cell.
  - *Depends on:* A valid non-empty list (or pair).
  - *Connects to:* Passed as an argument in recursive function calls.
  - *Shape:* Core data-structure accessor.

- **`null?`**
  - *What it is:* A predicate that checks if a value is the empty list `()`.
  - *Implementation:* Built-in Scheme function returning a boolean.
  - *Its use:* Used as the base case condition in list processing recursion.
  - *Type:* A built-in function.
  - *Responsibility:* Safely identifies the terminal end of a proper list.
  - *Depends on:* A value to inspect.
  - *Connects to:* Used inside `cond` statements to stop recursion.
  - *Shape:* Core language primitive.

- **`member?`**
  - *What it is:* A predicate function that searches for a specific atom in a list of atoms.
  - *Implementation:* `(define (member? a lat) ...)` returning a boolean.
  - *Its use:* Used to determine presence or absence of an element.
  - *Type:* A freestanding recursive function.
  - *Responsibility:* Traverses a lat and returns `#t` if `a` is found, `#f` if the end is reached.
  - *Depends on:* An atom `a` and a list `lat`.
  - *Connects to:* Calls itself recursively on the `cdr`.
  - *Shape:* A domain-specific searching predicate.

- **`equal?`**
  - *What it is:* An equivalence predicate.
  - *Implementation:* Built-in Scheme function returning a boolean.
  - *Its use:* Used to compare atoms to see if they are the same.
  - *Type:* A built-in function.
  - *Responsibility:* Performs a deep or structural comparison of two values.
  - *Depends on:* Two values to compare.
  - *Connects to:* Used in `cond` clauses to identify a target element.
  - *Shape:* Core language primitive.

- **`rember`**
  - *What it is:* A list-transforming function that removes the first occurrence of an atom from a lat.
  - *Implementation:* `(define (rember a lat) ...)` returning a list.
  - *Its use:* Used to construct a new list missing a specific element.
  - *Type:* A freestanding recursive function.
  - *Responsibility:* Traverses a lat, skipping the first element that equals `a`, and rebuilding the rest of the list.
  - *Depends on:* An atom `a` and a list `lat`.
  - *Connects to:* Calls itself recursively to process the rest of the list until the target is found.
  - *Shape:* A domain-specific list transformer.

- **`cons`**
  - *What it is:* A constructor function that creates a new pair.
  - *Implementation:* Built-in Scheme function returning a pair/list.
  - *Its use:* Used to rebuild a list during recursive transformation, preserving elements that shouldn't be removed.
  - *Type:* A built-in function.
  - *Responsibility:* Allocates a new cons cell pointing to a head and a tail.
  - *Depends on:* A value (head) and another value/list (tail).
  - *Connects to:* Used in the `else` branch of building functions to attach `car` to the result of the recursive call.
  - *Shape:* Core data-structure constructor.

- **`rember*`**
  - *What it is:* A list-transforming function that removes all occurrences of an atom from a list.
  - *Implementation:* `(define (rember* a lat) ...)` returning a list.
  - *Its use:* Used to purge a specific element completely from a flat list (and later, nested lists).
  - *Type:* A freestanding recursive function.
  - *Responsibility:* Traverses a list and rebuilding it without any elements that equal `a`.
  - *Depends on:* An atom `a` and a list `lat`.
  - *Connects to:* Calls itself in *both* the found and not-found cases.
  - *Shape:* A domain-specific recursive list transformer.

## Concept Unit: `lat?`

### The Problem
We need a way to verify that a list contains only simple elements (atoms) and no nested lists, to safely pass it to other functions that expect flat lists. We need to build a predicate that answers `#t` if every element passes this test, and `#f` as soon as it finds one that doesn't.

### Introduce the concept in isolation
Before we build a recursive function to check every element, let's verify how to check if a single item is an atom, and how to check the first item of a list.

```scheme
(define (atom? x) (not (pair? x)))
(atom? 'Jack)
(atom? '(Jack))
(atom? (car '(Jack (Jill))))
```

Running this yields:

```
#t
#f
#t
```

This output proves that `atom?` correctly identifies a bare symbol like `'Jack` as an atom (`#t`), correctly rejects a list like `'(Jack)` as not an atom (`#f`), and correctly identifies that the first element extracted from `'(Jack (Jill))` via `car` is an atom (`#t`).

### Discard the throwaway example
The test expressions above are deleted and will not appear in our project. We will keep the `atom?` helper function, as it is a fundamental tool for checking elements.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition implementing Chapter 2 of The Little Schemer.
- **Files affected:** `src/docs/tutorials/scheme-lisp-clojure-sicp/little-schemer.rkt` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```scheme
(define (atom? x)
  (not (pair? x)))

(define (lat? lst)
  (cond
    [(null? lst) #t]
    [(atom? (car lst)) (lat? (cdr lst))]
    [else #f]))
```

### The Updated Project
Here is how the new code looks when placed at the end of our file.

```scheme
// ... previous code ...
(define (atom? x)
  (not (pair? x)))

(define (lat? lst)
  (cond
    [(null? lst) #t]
    [(atom? (car lst)) (lat? (cdr lst))]
    [else #f]))
// ← new functions added to check for lists of atoms
```

This structure now provides a reusable `atom?` predicate and a `lat?` predicate that processes an entire list to guarantee it contains no nested lists.

### Mechanical walkthrough

- **`define`** binds the name `lat?` to the function we are creating, making it available globally.
- **`lat?`** is the name of our function. The `?` conventionally indicates it is a predicate returning a boolean.
- **`lst`** is the parameter representing the list we are inspecting.
- **`cond`** starts our conditional branching, allowing us to test multiple cases in sequence.
- **`null?`** is a built-in predicate that tests if a list is empty. We apply it to `lst`.
- **`#t`** is the boolean true. If the list is empty, we return `#t` because an empty list vacuously satisfies the condition "all elements are atoms."
- **`atom?`** is our helper predicate that determines if a value is not a pair.
- **`car`** extracts the first element of `lst` to be checked by `atom?`.
- **`lat?`** is called recursively on the rest of the list.
- **`cdr`** extracts the remainder of the list, passing it into the recursive call.
- **`else`** is the fallback clause. If the list is not empty, and the first element is not an atom, we fall through to here.
- **`#f`** is the boolean false, returned immediately if a non-atom is found. This is short-circuit behavior; there is no need to check the rest of the list.

Here is the execution trace when evaluating `(lat? '(Jack (Jill) Mary))`:

```
Step 1: lst = '(Jack (Jill) Mary). (null? lst) is #f. (atom? (car lst)) is (atom? 'Jack) which is #t. Recurse with (cdr lst).
Step 2: lst = '((Jill) Mary). (null? lst) is #f. (atom? (car lst)) is (atom? '(Jill)) which is #f. Fall through to else.
Step 3: else branch returns #f.
```

The function correctly identifies that `(Jill)` is not an atom, immediately stopping and returning `#f`. Evaluating `(lat? '(Jack Jill Mary))` would return `#t`, and `(lat? '())` would return `#t`.

## Concept Unit: `member?`

### The Problem
We need to search a lat for a specific atom to determine if it is present. We want a predicate that answers `#t` if the atom exists anywhere in the list, and `#f` if we reach the end without finding it.

### Introduce the concept in isolation
Let's verify how to check if a specific symbol matches the first element of a list using the equivalence predicate.

```scheme
(equal? 'Jill (car '(Jack Jill Mary)))
(equal? 'Jack (car '(Jack Jill Mary)))
```

Running this yields:

```
#f
#t
```

This output proves that `equal?` accurately compares our target symbol with the `car` of the list, returning `#t` only when they are the exact same atom.

### Discard the throwaway example
The throwaway equality checks are deleted and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition implementing Chapter 2 of The Little Schemer.
- **Files affected:** `src/docs/tutorials/scheme-lisp-clojure-sicp/little-schemer.rkt` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** The previously established `lat` concept.

### The New Code
```scheme
(define (member? a lat)
  (cond
    [(null? lat) #f]
    [(equal? (car lat) a) #t]
    [else (member? a (cdr lat))]))
```

### The Updated Project
Here is the function added to our file.

```scheme
(define (lat? lst)
  (cond
    [(null? lst) #t]
    [(atom? (car lst)) (lat? (cdr lst))]
    [else #f]))

(define (member? a lat)
  (cond
    [(null? lat) #f]
    [(equal? (car lat) a) #t]
    [else (member? a (cdr lat))]))
// ← new function added to search for an atom
```

This provides a search predicate that recursively traverses a flat list looking for a target atom.

### Mechanical walkthrough

- **`define`** binds the name `member?` to the function.
- **`member?`** is the name of our predicate.
- **`a`** is the target atom we are searching for.
- **`lat`** is the list of atoms we are searching within.
- **`cond`** starts our conditional cases.
- **`null?`** tests if `lat` is empty. If it is, the atom was not found.
- **`#f`** is returned because an empty list cannot contain the target.
- **`equal?`** compares the first element of the list with our target `a`.
- **`car`** extracts that first element from `lat`.
- **`#t`** is returned immediately if a match is found, halting the recursion.
- **`else`** catches the case where the list is not empty, but the first element is not a match.
- **`member?`** is called recursively.
- **`cdr`** passes the rest of the list into the recursive call, effectively skipping the non-matching element.

Here is the execution trace for `(member? 'Jill '(Jack Jill Mary))`:

```
Step 1: lat = '(Jack Jill Mary). (null? lat) is #f. (equal? 'Jack 'Jill) is #f. Recurse on (cdr lat).
Step 2: lat = '(Jill Mary). (null? lat) is #f. (equal? 'Jill 'Jill) is #t. Return #t.
```

The function stops as soon as it finds `'Jill` and returns `#t`. Evaluating `(member? 'Pete '(Jack Jill Mary))` would exhaust the list and return `#f`.

Note: `member?` assumes its second argument is a lat — it only compares atoms with `equal?`, not pairs. Calling `(member? 'a '((a) b))` would check if `'a` equals the list `'(a)`, which it doesn't. This limitation is deliberate — later we write general versions.

## Concept Unit: `rember`

### The Problem
We need to remove the first occurrence of an atom from a lat. Unlike our predicates that return a boolean, this function must return a *new list*, meaning it has to rebuild the parts of the list it isn't removing.

### Introduce the concept in isolation
Let's see how to rebuild a list by explicitly attaching an element to the front of a shorter list.

```scheme
(cons 'Jack '(Mary Jill))
```

Running this yields:

```
'(Jack Mary Jill)
```

This output proves that `cons` can take an atom (`'Jack`) and attach it to an existing list (`'(Mary Jill)`), creating a new, larger list. This is how we will rebuild the list when we want to keep an element during our traversal.

### Discard the throwaway example
The throwaway `cons` example is deleted and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition implementing Chapter 2 of The Little Schemer.
- **Files affected:** `src/docs/tutorials/scheme-lisp-clojure-sicp/little-schemer.rkt` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** The `cons` constructor.

### The New Code
```scheme
(define (rember a lat)
  (cond
    [(null? lat) '()]
    [(equal? (car lat) a) (cdr lat)]
    [else (cons (car lat) (rember a (cdr lat)))]))
```

### The Updated Project
Here is the function placed in our file.

```scheme
(define (member? a lat)
  (cond
    [(null? lat) #f]
    [(equal? (car lat) a) #t]
    [else (member? a (cdr lat))]))

(define (rember a lat)
  (cond
    [(null? lat) '()]
    [(equal? (car lat) a) (cdr lat)]
    [else (cons (car lat) (rember a (cdr lat)))]))
// ← new function added to remove the first occurrence of an atom
```

This structure introduces a list transformer that recurs the same way as `member?` but differs in what it does at the found case and how it builds the result.

### Mechanical walkthrough

- **`define`** binds the name `rember`.
- **`rember`** stands for "remove member."
- **`a`** is the target atom to remove.
- **`lat`** is the list to process.
- **`cond`** starts our conditional cases.
- **`null?`** tests if the list is empty.
- **`'()`** is the empty list, returned as the base case for building a new list.
- **`equal?`** tests if the first element matches `a`.
- **`car`** extracts the first element.
- **`cdr`** returns the rest of the list. If we find a match, we simply return the rest of the list, effectively skipping the matched element.
- **`else`** runs when the first element is not a match.
- **`cons`** rebuilds the list by attaching the current, non-matching element to the result of the recursion.
- **`rember`** is called recursively to continue searching for `a`.

Here is the execution trace for `(rember 'Jill '(Jack Jill Mary Jill))`:

```
Step 1: lat = '(Jack Jill Mary Jill). (equal? 'Jack 'Jill) is #f. (cons 'Jack (rember 'Jill '(Jill Mary Jill))).
Step 2: lat = '(Jill Mary Jill). (equal? 'Jill 'Jill) is #t. Return (cdr lat), which is '(Mary Jill).
Step 3: The recursion unwinds. (cons 'Jack '(Mary Jill)) evaluates to '(Jack Mary Jill).
```

Only the first `'Jill` is removed. The three-case structure handles everything: null (done, return empty), found (skip it, return rest), not-found (keep head, recur).

## Concept Unit: `rember*`

### The Problem
We need to remove ALL occurrences of an atom from a lat, not just the first one. Our previous function stopped searching as soon as it found a match.

### Introduce the concept in isolation
To remove multiple items, we must continue processing the list even after a match is found. Let's trace how manually continuing past a match works on a small scale.

```scheme
(cons 'Jack (cdr '(Jill Mary Jill)))
```

Running this yields:

```
'(Jack Mary Jill)
```

This output proves that if we skip an element (by taking the `cdr`), we are left with a smaller list that might still contain our target. To remove it again, we must apply our removal function to that smaller list instead of just returning it raw.

### Discard the throwaway example
The throwaway code is deleted.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition implementing Chapter 2 of The Little Schemer.
- **Files affected:** `src/docs/tutorials/scheme-lisp-clojure-sicp/little-schemer.rkt` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```scheme
(define (rember* a lat)
  (cond
    [(null? lat) '()]
    [(equal? (car lat) a) (rember* a (cdr lat))]
    [else (cons (car lat) (rember* a (cdr lat)))]))
```

### The Updated Project
Here is the function added to our file.

```scheme
(define (rember a lat)
  (cond
    [(null? lat) '()]
    [(equal? (car lat) a) (cdr lat)]
    [else (cons (car lat) (rember a (cdr lat)))]))

(define (rember* a lat)
  (cond
    [(null? lat) '()]
    [(equal? (car lat) a) (rember* a (cdr lat))]
    [else (cons (car lat) (rember* a (cdr lat)))]))
// ← new function added to remove all occurrences of an atom
```

This gives us a preview of "starred" functions in The Little Schemer, which operate on every occurrence rather than stopping at the first.

### Mechanical walkthrough

- **`define`** binds the name `rember*`.
- **`rember*`** is the name of our function, with the `*` conventionally indicating it applies universally to all matches.
- **`a`** is the target atom.
- **`lat`** is the list to process.
- **`cond`** starts our conditional branches.
- **`null?`** tests if the list is empty.
- **`'()`** returns the empty list.
- **`equal?`** tests if the first element matches `a`.
- **`rember*`** is called recursively even when a match is found. This is the crucial difference from `rember`.
- **`cdr`** passes the rest of the list into that recursive call, effectively skipping the matched element but continuing the search.
- **`else`** runs when the first element is not a match.
- **`cons`** rebuilds the list, keeping the non-matching element.

Here is the execution trace for `(rember* 'Jill '(Jack Jill Mary Jill))`:

```
Step 1: lat = '(Jack Jill Mary Jill). match is #f. (cons 'Jack (rember* 'Jill '(Jill Mary Jill))).
Step 2: lat = '(Jill Mary Jill). match is #t. (rember* 'Jill '(Mary Jill)).
Step 3: lat = '(Mary Jill). match is #f. (cons 'Mary (rember* 'Jill '(Jill))).
Step 4: lat = '(Jill). match is #t. (rember* 'Jill '()).
Step 5: lat = '(). return '().
Step 6: Unwind. (cons 'Mary '()) -> '(Mary). (cons 'Jack '(Mary)) -> '(Jack Mary).
```

The ONLY change from `rember` is that the found case also recurs instead of stopping — `(cdr lat)` becomes `(rember* a (cdr lat))`.

### Connect the Pieces

All four functions follow the structural recursion pattern. They differ only in their return types (booleans vs. lists) and what they do when they find a match (stop vs. keep going). 

What breaks without the `null?` check? If we remove `[(null? lat) #f]` from `member?` and call `(member? 'Pete '(Jack))`, it checks `'Jack`, recurses on `'()`, and then attempts `(car '())`, throwing an error because you cannot take the `car` of an empty list.

**Exercises:**
1. Write `insertL`, which inserts a new atom to the LEFT of the first occurrence of a target atom.
2. Write `subst`, which substitutes a new atom for the first occurrence of a target atom.
