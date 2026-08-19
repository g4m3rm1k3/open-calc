# Lesson 14: `set?`, `makeset`, `subset?` — Lists as Sets

What you will build
In this lesson, you will implement set operations on top of plain lists: `set?` (is every element unique?), `makeset` (remove duplicates), `subset?` (is every element of set1 in set2?), `intersect` (common elements), `union` (all elements of both, no duplicates), and `difference` (elements in set1 not in set2). The transferable problem here is that a set is not a new data type — it is a constraint (uniqueness) layered on top of a list, enforced by convention. These operations reveal how purely functional programs simulate data structures using only the primitive tools already available, and operations like `subset?` and `intersect` introduce the pattern of nested recursion — for each element of the outer list, search the inner list.

What you need to know first
- Lessons 0-13 (all prior concepts through structural recursion, the Four Commandments, my-member?, rember, higher-order functions, closures).

Terms used in this lesson
- **Set** — A mathematical collection of distinct elements where order does not matter. It is not a distinct data structure here, but a list enforced by a uniqueness convention, showing how constraints build new abstractions on old data.
- **Base case** — The condition in a recursive function that stops the recursion from continuing infinitely, typically an empty list check.
- **Recursive case** — The part of a recursive function that calls itself with a progressively smaller piece of the input until the base case is reached.
- **Nested recursion** — A recursion pattern where the operation performed at each step of the outer recursion involves its own separate recursive traversal over another structure.
- **Predicate** — A function that answers a yes/no question, returning a boolean `#t` or `#f`.
- **List** — A sequenced chain of pairs in memory, constructed using `cons`.
- **Empty list (`'()`)** — A list containing zero elements, representing the end of a list or an empty collection.
- **`#t`** — The boolean value for true, returned when a condition is met.
- **`#f`** — The boolean value for false, returned when a condition is not met.
- **O(n) / O(n^2)** — Time complexity notation describing how the runtime scales. O(n) means time grows linearly with input size, while O(n^2) means time grows quadratically, often implying nested traversals.
- **Lambda expression** — An anonymous function created inline, without a name, used to pass behavior directly as data.
- **Higher-order function** — A function that accepts another function as an argument (like `my-filter`) or returns a function as a result, abstracting over operations.

Objects and methods used

**`cond`**
- *What it is:* A multi-branch conditional expression, Lisp's equivalent to if/else-if chains.
- *Implementation:* `(cond [condition-1 result-1] [condition-2 result-2] ... [else fallback-result])`
- *Its use:* Used in every recursive function to branch between base cases and recursive steps.
- *Type:* Core syntax / Macro.
- *Responsibility:* Evaluates a series of predicate conditions in order, returning the result associated with the first one that evaluates to true.
- *Depends on:* A series of clause pairs (predicate and expression).
- *Connects to:* Evaluates predicates calling other functions (like `null?` or `equal?`), passing control to the result expression of the match.
- *Shape:* The structural backbone of recursive branching in Scheme.

**`null?`**
- *What it is:* A predicate function checking if a value is the empty list.
- *Implementation:* `(null? val) -> boolean`
- *Its use:* Used as the condition for the base case in list traversal recursion.
- *Type:* Built-in function.
- *Responsibility:* Returns `#t` if the argument is exactly the empty list `'()`, otherwise `#f`.
- *Depends on:* A single argument to evaluate.
- *Connects to:* Often receives the list argument of a recursive function to determine if traversal is complete.
- *Shape:* A fundamental query primitive for list structure boundaries.

**`car`**
- *What it is:* A function that extracts the first element (the head) of a list.
- *Implementation:* `(car lst) -> any`
- *Its use:* Used to isolate the current element being processed in the recursive step.
- *Type:* Built-in function.
- *Responsibility:* Retrieves the value stored in the first half of a pair.
- *Depends on:* A non-empty list argument.
- *Connects to:* Called on lists; its result is often passed to predicates (like `equal?`) or added to new lists (via `cons`).
- *Shape:* The primary reading operation for traversing a linked sequence.

**`cdr`**
- *What it is:* A function that extracts the rest of a list (the tail) after the first element.
- *Implementation:* `(cdr lst) -> list`
- *Its use:* Used to advance the recursion by passing everything except the current element to the next call.
- *Type:* Built-in function.
- *Responsibility:* Retrieves the second half of a pair, which represents the remainder of the list.
- *Depends on:* A non-empty list argument.
- *Connects to:* Its output is the primary input to the recursive call.
- *Shape:* The structural stepping mechanism for list traversal.

**`cons`**
- *What it is:* A function that constructs a new pair (or list node) combining an element and another list.
- *Implementation:* `(cons element lst) -> list`
- *Its use:* Used to build up the result list when an element should be kept (e.g., in `makeset` or `intersect`).
- *Type:* Built-in function.
- *Responsibility:* Allocates a new pair in memory containing the two arguments.
- *Depends on:* Two arguments, typically an element and an existing list to prepend to.
- *Connects to:* Takes the result of a recursive call as its second argument, assembling the final returned list.
- *Shape:* The primary building operation for dynamic list creation.

**`equal?`**
- *What it is:* A predicate function checking if two values are structurally identical.
- *Implementation:* `(equal? a b) -> boolean`
- *Its use:* Used inside `member?` to see if the target element matches the current list element.
- *Type:* Built-in function.
- *Responsibility:* Recursively compares complex values or directly compares symbols/numbers, returning `#t` if they match.
- *Depends on:* Two arguments to compare.
- *Connects to:* Receives values extracted by `car` to test for equality.
- *Shape:* A deep-comparison primitive.

**`member?`**
- *What it is:* A predicate function that checks if an element exists anywhere within a list.
- *Implementation:* `(member? val lst) -> boolean`
- *Its use:* Used repeatedly to check for duplicate presence, forming the core logic of all set operations in this lesson.
- *Type:* Custom function (defined in an earlier lesson, reused here).
- *Responsibility:* Traverses `lst`, comparing each element to `val` with `equal?`, returning `#t` upon finding a match or `#f` if the end is reached.
- *Depends on:* A target value and a list to search.
- *Connects to:* Calls itself recursively on `cdr`, calls `equal?` on `car`.
- *Shape:* A reusable lookup utility that enables set-like behavior on list data structures.

**`rember`**
- *What it is:* A function that removes the first occurrence of an element from a list.
- *Implementation:* `(rember val lst) -> list`
- *Its use:* Used as an alternative helper in `makeset-first` to explicitly strip duplicates out of the tail.
- *Type:* Custom function (defined in an earlier lesson).
- *Responsibility:* Traverses `lst`, returning a new list identical to `lst` but omitting the first element that equals `val`.
- *Depends on:* A target value and a list to modify.
- *Connects to:* Calls `cons` to rebuild the list, skipping the matched element.
- *Shape:* A deletion utility for lists.

**`my-filter`**
- *What it is:* A higher-order function that keeps only elements of a list that satisfy a given predicate.
- *Implementation:* `(my-filter predicate lst) -> list`
- *Its use:* Mentioned conceptually to show how `intersect` and `difference` are specific instances of filtering.
- *Type:* Custom higher-order function (defined in an earlier lesson).
- *Responsibility:* Applies `predicate` to each element, using `cons` to keep those that return `#t`.
- *Depends on:* A function argument (`predicate`) and a list.
- *Connects to:* Calls the provided predicate on each element.
- *Shape:* A generic sequence transformer.

---

## Concept Unit: `set?` — Does the list contain no duplicates?

### The Problem
We have lists of symbols, like `'(a b c)` and `'(a b a)`. We want to treat some of these lists as mathematical sets, where every element must be unique. Because Scheme doesn't have a built-in `Set` type in its core list library, we need a way to look at a regular list and ask: "Is this list valid as a set? Does it contain zero duplicates?"

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are building our set operations library starting from first principles.
- **Files affected:** `sets.scm` (created)
- **Change type:** Add
- **Location:** At the top of the new file.
- **Dependencies:** Requires the previously defined `member?` function.

### The New Code — type it yourself
```scheme
(define (member? a lat)
  (cond
    [(null? lat) #f]
    [(equal? (car lat) a) #t]
    [else (member? a (cdr lat))]))

(define (set? lst)
  (cond
    [(null? lst) #t]
    [(member? (car lst) (cdr lst)) #f]
    [else (set? (cdr lst))]))
```

### The Updated Project
```scheme
;; sets.scm
// ← new
(define (member? a lat)
  (cond
    [(null? lat) #f]
    [(equal? (car lat) a) #t]
    [else (member? a (cdr lat))]))

(define (set? lst)
  (cond
    [(null? lst) #t]
    [(member? (car lst) (cdr lst)) #f]
    [else (set? (cdr lst))]))
```
The file now contains our reusable lookup helper `member?` and our new predicate `set?`. As a whole, this module now has the ability to answer whether any given list satisfies the uniqueness constraint required to act as a set.

### Introduce the concept in isolation
```scheme
(define (test-set? lst)
  (cond
    [(null? lst) #t]
    [(member? (car lst) (cdr lst)) #f]
    [else (test-set? (cdr lst))]))

(test-set? '(apple banana orange))
(test-set? '(apple banana apple))
```
Output:
```
#t
#f
```
This proves that checking for uniqueness is just searching the *rest* of the list for the current element. For `'(apple banana orange)`, no element appears again later in the list, so it is a valid set (`#t`). For `'(apple banana apple)`, the first `apple` is found again when we search the rest of the list, so it fails the set constraint (`#f`).

### Discard the throwaway example
The isolated `test-set?` throwaway is discarded and will not appear in the project again.

### Mechanical walkthrough — how it works in isolation
- `(define (set? lst)` — Declares a new function taking one argument, a list.
- `(cond` — Begins a multi-branch conditional to handle the base and recursive cases.
- `[(null? lst) #t]` — Base case: an empty list has no elements, so it cannot have duplicates. It is valid as a set, returning `#t`.
- `[(member? (car lst) (cdr lst)) #f]` — The critical test. `car lst` gets the current first element. `cdr lst` gets all remaining elements. We use `member?` to search for the first element inside the remaining elements. If `member?` returns `#t`, we found a duplicate, so we immediately return `#f` (not a set).
- `[else (set? (cdr lst))]))` — If the current element wasn't a duplicate, we haven't proven it's *not* a set yet, but we must check the remaining elements. We recursively call `set?` on `(cdr lst)`.

**Execution trace for `(set? '(a b a))`:**
1. `(set? '(a b a))` — Evaluates condition `(null? '(a b a))` (#f). Evaluates `(member? 'a '(b a))`.
2. `(member? 'a '(b a))` — Recursively searches. 'a' is not 'b', so it checks the rest `'(a)`. Finds 'a'. Returns `#t`.
3. `(set? '(a b a))` — Because `member?` returned `#t`, the second cond branch triggers and returns `#f`.

### CS lens
This implements a uniqueness constraint via **nested recursion** (or a nested loop equivalent). The outer recursion (`set?`) traverses the list element by element. At every step, the inner recursion (`member?`) traverses the remainder of the list.
Also recognized in: brute-force collision detection in games, N-body problem gravitational calculations, naive duplicate finding in database rows.

### SE lens
This is engineered for correctness and clarity over speed. By reusing `member?`, we keep the logic completely readable. The tradeoff is performance: this is O(n^2) worst-case time complexity, because for an n-element list, we might scan n-1 elements, then n-2, then n-3, making it quadratic. A hash-based set (like in Python or Java) does this in O(1) per lookup for an O(n) total build time, but requires a complex hashing algorithm and memory allocation. Our functional approach simulates sets purely with what we already have.

### Commands needed to make this unit real, if any.
None required. This runs inside the standard Racket environment.

### Run it. Show the real output.
```scheme
> (set? '(a b c))
#t
> (set? '(a b a))
#f
> (set? '())
#t
```

### One sentence connecting this unit to what came immediately before.
Now that we can verify if a list *is* a valid set, we need a way to force any arbitrary list to *become* a valid set by removing its duplicates.

---

## Concept Unit: `makeset` — Remove all duplicates to produce a set

### The Problem
If a user hands us `'(a b c a b)`, it fails `set?`. We need a function `makeset` that strips out the duplicates and returns a valid set, so we can convert dirty input into clean mathematical sets.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `sets.scm` (modified)
- **Change type:** Add
- **Location:** After `set?`
- **Dependencies:** `member?`

### The New Code — type it yourself
```scheme
(define (makeset lst)
  (cond
    [(null? lst) '()]
    [(member? (car lst) (cdr lst))
     (makeset (cdr lst))]
    [else
     (cons (car lst) (makeset (cdr lst)))]))
```

### The Updated Project
```scheme
;; sets.scm
(define (member? a lat)
  (cond
    [(null? lat) #f]
    [(equal? (car lat) a) #t]
    [else (member? a (cdr lat))]))

(define (set? lst)
  (cond
    [(null? lst) #t]
    [(member? (car lst) (cdr lst)) #f]
    [else (set? (cdr lst))]))

// ← new
(define (makeset lst)
  (cond
    [(null? lst) '()]
    [(member? (car lst) (cdr lst))
     (makeset (cdr lst))]
    [else
     (cons (car lst) (makeset (cdr lst)))]))
```
The file now contains a transformation function `makeset`. As a whole, the file provides both validation (`set?`) and normalization (`makeset`) for set data.

### Introduce the concept in isolation
```scheme
(define (test-makeset lst)
  (cond
    [(null? lst) '()]
    [(member? (car lst) (cdr lst))
     (test-makeset (cdr lst))]
    [else
     (cons (car lst) (test-makeset (cdr lst)))]))

(test-makeset '(apple banana apple orange banana))
```
Output:
```
'(apple orange banana)
```
This proves that by checking `(member? (car lst) (cdr lst))` and skipping the element if it exists later in the list, we filter out duplicates. Notice that the output keeps the *last* occurrence of each element (since earlier occurrences were skipped when they saw a match later on).

### Discard the throwaway example
The isolated `test-makeset` is discarded and will not appear in the project again.

### Mechanical walkthrough — how it works in isolation
- `(define (makeset lst)` — Declares the function.
- `(cond` — Branching logic.
- `[(null? lst) '()]` — Base case: an empty list has no duplicates to remove, returning the empty list `'()`.
- `[(member? (car lst) (cdr lst))` — The predicate. Checks if the first element appears again in the rest of the list.
- ` (makeset (cdr lst))]` — If it does appear later, we skip keeping the current element entirely and just return the result of cleaning up the rest of the list.
- `[else` — If the current element does NOT appear later...
- ` (cons (car lst) (makeset (cdr lst)))]))` — We must keep it. We `cons` the current element onto the cleaned-up remainder of the list.

**Execution trace for `(makeset '(a b a))`:**
1. `(makeset '(a b a))` — `(member? 'a '(b a))` is `#t`. Skips 'a'. Returns `(makeset '(b a))`.
2. `(makeset '(b a))` — `(member? 'b '(a))` is `#f`. Keeps 'b'. Returns `(cons 'b (makeset '(a)))`.
3. `(makeset '(a))` — `(member? 'a '())` is `#f`. Keeps 'a'. Returns `(cons 'a (makeset '()))`.
4. `(makeset '())` — Base case. Returns `'()`.
5. Resolving up: `(cons 'a '())` -> `'(a)`. `(cons 'b '(a))` -> `'(b a)`. Final result: `'(b a)`.

### CS lens
This is a constructive filter pattern: it dynamically decides whether to include elements in a new list structure based on a forward-looking test (`member?` over `cdr`).

### SE lens
This implementation chooses to keep the *last* occurrence of duplicates. An alternative would be keeping the *first* occurrence by actively removing all future copies immediately using `rember` (e.g. `(cons (car lst) (makeset-first (rember (car lst) (cdr lst))))`). We chose the forward-looking approach because it strictly reuses `member?` without modifying the remaining list traversal logic, resulting in cleaner code at the expense of reversing the apparent order of kept elements. 

### Commands needed to make this unit real, if any.
None.

### Run it. Show the real output.
```scheme
> (makeset '(a b c a b))
'(c a b)
```

### One sentence connecting this unit to what came immediately before.
With the ability to normalize lists into sets, we can now start comparing two sets against each other, beginning with asking if one is entirely contained within the other.

---

## Concept Unit: `subset?` — Is every element of set1 present in set2?

### The Problem
We need to compare two sets to see if one is a sub-collection of the other. If we have `set1 = '(a b)` and `set2 = '(a b c)`, we want to ask: does `set2` contain every single element from `set1`?

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `sets.scm` (modified)
- **Change type:** Add
- **Location:** After `makeset`
- **Dependencies:** None

### The New Code — type it yourself
```scheme
(define (subset? set1 set2)
  (cond
    [(null? set1) #t]
    [(member? (car set1) set2)
     (subset? (cdr set1) set2)]
    [else #f]))
```

### The Updated Project
```scheme
;; sets.scm
(define (makeset lst)
  (cond
    [(null? lst) '()]
    [(member? (car lst) (cdr lst))
     (makeset (cdr lst))]
    [else
     (cons (car lst) (makeset (cdr lst)))]))

// ← new
(define (subset? set1 set2)
  (cond
    [(null? set1) #t]
    [(member? (car set1) set2)
     (subset? (cdr set1) set2)]
    [else #f]))
```
The file now contains a cross-set relational operation `subset?`. As a whole, we can now compare mathematical sets.

### Introduce the concept in isolation
```scheme
(define (test-subset? s1 s2)
  (cond
    [(null? s1) #t]
    [(member? (car s1) s2)
     (test-subset? (cdr s1) s2)]
    [else #f]))

(test-subset? '(a b) '(a c b d))
(test-subset? '(a x) '(a c b d))
```
Output:
```
#t
#f
```
This proves that we can iterate over the first set (`s1`), asking `member?` against the entirety of the second set (`s2`) for each element. The moment any element is missing, we abort with `#f`. If we exhaust `s1` without failing, it's a subset (`#t`).

### Discard the throwaway example
The isolated `test-subset?` is discarded and will not appear in the project again.

### Mechanical walkthrough — how it works in isolation
- `(define (subset? set1 set2)` — Two list arguments.
- `(cond` — Branching.
- `[(null? set1) #t]` — Base case: an empty set is mathematically a subset of every set. Returning `#t` here means all elements of `set1` (which were zero) successfully passed the test.
- `[(member? (car set1) set2)` — Inner check: is the first element of `set1` present anywhere in `set2`? Note that `set2` is passed fully intact, not reduced.
- ` (subset? (cdr set1) set2)]` — If it is present, we recurse. We check the remaining elements of `set1`, continually passing the unchanged `set2` along.
- `[else #f]))` — If `(car set1)` is NOT in `set2`, `set1` cannot possibly be a subset. We immediately halt and return `#f`.

**Execution trace for `(subset? '(a d) '(a b c))`:**
1. `(subset? '(a d) '(a b c))` — `(member? 'a '(a b c))` is `#t`. Recurses with `(subset? '(d) '(a b c))`.
2. `(subset? '(d) '(a b c))` — `(member? 'd '(a b c))` is `#f`.
3. The `else` branch triggers and returns `#f`.

### CS lens
This is a universal quantifier (the mathematical "For All" $\forall$) implemented via recursion. It also demonstrates **nested recursion** vividly: the outer recursion traverses `set1`, and at every single step, `member?` triggers an inner recursion traversing `set2`.
Also recognized in: dependency resolution (does environment X have all packages required by app Y?), access control (does user have all required permissions?), database relational division.

### SE lens
This is engineered with short-circuit evaluation. The `else #f` base case means that if a mismatch is found early, the function halts immediately instead of checking the rest of `set1`. The tradeoff is that `set2` is searched linearly for every single element, resulting in an O(n*m) runtime. In a production environment with large sets, you would convert `set2` to a hash table first to make lookups O(1), bringing the total time to O(n+m).

### Commands needed to make this unit real, if any.
None.

### Run it. Show the real output.
```scheme
> (subset? '(a b) '(a b c))
#t
> (subset? '(a d) '(a b c))
#f
> (subset? '() '(a b))
#t
```

### One sentence connecting this unit to what came immediately before.
Just as we checked if all elements of one set are in another, we can use the same logic to actively gather and keep the elements that exist in both.

---

## Concept Unit: `intersect` — Elements present in both sets

### The Problem
Given two sets, we want a new set containing only the elements they share. For `set1 = '(a b c d)` and `set2 = '(b d e)`, the intersection is `'(b d)`.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `sets.scm` (modified)
- **Change type:** Add
- **Location:** After `subset?`
- **Dependencies:** None

### The New Code — type it yourself
```scheme
(define (intersect set1 set2)
  (cond
    [(null? set1) '()]
    [(member? (car set1) set2)
     (cons (car set1) (intersect (cdr set1) set2))]
    [else
     (intersect (cdr set1) set2)]))
```

### The Updated Project
```scheme
;; sets.scm
(define (subset? set1 set2)
  (cond
    [(null? set1) #t]
    [(member? (car set1) set2)
     (subset? (cdr set1) set2)]
    [else #f]))

// ← new
(define (intersect set1 set2)
  (cond
    [(null? set1) '()]
    [(member? (car set1) set2)
     (cons (car set1) (intersect (cdr set1) set2))]
    [else
     (intersect (cdr set1) set2)]))
```
The file now contains `intersect`. As a whole, the library can calculate the overlap between two data collections.

### Introduce the concept in isolation
```scheme
(define (test-intersect s1 s2)
  (cond
    [(null? s1) '()]
    [(member? (car s1) s2)
     (cons (car s1) (test-intersect (cdr s1) s2))]
    [else
     (test-intersect (cdr s1) s2)]))

(test-intersect '(a b c) '(c b d))
```
Output:
```
'(b c)
```
This proves that by iterating over `s1` and using `cons` only when `member?` is `#t`, we build a new list composed strictly of shared elements.

### Discard the throwaway example
The isolated `test-intersect` is discarded and will not appear in the project again.

### Mechanical walkthrough — how it works in isolation
- `(define (intersect set1 set2)` — Takes two sets.
- `(cond` — Branching.
- `[(null? set1) '()]` — Base case: an empty set intersects with nothing, returning the empty list `'()`.
- `[(member? (car set1) set2)` — Checks if the current element of `set1` exists in `set2`.
- ` (cons (car set1) (intersect (cdr set1) set2))]` — If it does, we keep it. We `cons` it onto the result of recursively intersecting the remainder of `set1` with `set2`.
- `[else` — If it does not exist in `set2`...
- ` (intersect (cdr set1) set2)]))` — We drop the element by skipping the `cons` and simply returning the recursion over the rest of the list.

**Execution trace for `(intersect '(a b) '(b c))`:**
1. `(intersect '(a b) '(b c))` — `(member? 'a '(b c))` is `#f`. Jumps to `else`. Returns `(intersect '(b) '(b c))`.
2. `(intersect '(b) '(b c))` — `(member? 'b '(b c))` is `#t`. Returns `(cons 'b (intersect '() '(b c)))`.
3. `(intersect '() '(b c))` — `null?` is `#t`. Returns `'()`.
4. Resolving up: `(cons 'b '())` -> `'(b)`. Final result: `'(b)`.

### CS lens
This is a constructive filter mapping. In higher-order function terms, this is exactly `my-filter` where the predicate is dynamically defined as `(lambda (elem) (member? elem set2))`.
Also recognized in: database INNER JOIN operations, search engine query processing (finding documents containing word A AND word B).

### SE lens
This is engineered for immutability. Rather than modifying `set1` by deleting missing elements in-place, it allocates and returns an entirely new list structure containing only the intersecting elements. The tradeoff is memory allocation (creating new pair nodes) in exchange for thread-safety and referential transparency (the original sets are unharmed).

### Commands needed to make this unit real, if any.
None.

### Run it. Show the real output.
```scheme
> (intersect '(a b c d) '(b d e))
'(b d)
```

### One sentence connecting this unit to what came immediately before.
Instead of finding what sets have in common, we can also merge them entirely to find everything they contain together.

---

## Concept Unit: `union` — All elements of both sets, no duplicates

### The Problem
We need to combine two sets into one superset that contains all elements from both. However, simply appending them (`'(a b) + '(b c)` -> `'(a b b c)`) creates duplicates, violating the set constraint. We need a `union` function.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `sets.scm` (modified)
- **Change type:** Add
- **Location:** After `intersect`
- **Dependencies:** None

### The New Code — type it yourself
```scheme
(define (union set1 set2)
  (cond
    [(null? set1) set2]
    [(member? (car set1) set2)
     (union (cdr set1) set2)]
    [else
     (cons (car set1) (union (cdr set1) set2))]))
```

### The Updated Project
```scheme
;; sets.scm
(define (intersect set1 set2)
  (cond
    [(null? set1) '()]
    [(member? (car set1) set2)
     (cons (car set1) (intersect (cdr set1) set2))]
    [else
     (intersect (cdr set1) set2)]))

// ← new
(define (union set1 set2)
  (cond
    [(null? set1) set2]
    [(member? (car set1) set2)
     (union (cdr set1) set2)]
    [else
     (cons (car set1) (union (cdr set1) set2))]))
```
The file now contains `union`. As a whole, the module can merge collections while maintaining data constraints.

### Introduce the concept in isolation
```scheme
(define (test-union s1 s2)
  (cond
    [(null? s1) s2]
    [(member? (car s1) s2)
     (test-union (cdr s1) s2)]
    [else
     (cons (car s1) (test-union (cdr s1) s2))]))

(test-union '(a b c) '(b c d))
```
Output:
```
'(a b c d)
```
This proves that we can selectively build the result. We iterate over `s1`. If an element is already in `s2`, we skip it (because it will be included when we hit the base case). If it's not in `s2`, we `cons` it onto our final result.

### Discard the throwaway example
The isolated `test-union` is discarded and will not appear in the project again.

### Mechanical walkthrough — how it works in isolation
- `(define (union set1 set2)` — Takes two sets.
- `(cond` — Branching.
- `[(null? set1) set2]` — Base case: if `set1` is empty, the union is just `set2`. By returning `set2` directly, we attach the entirety of the second set to the end of whatever unique elements from `set1` we've collected so far.
- `[(member? (car set1) set2)` — Checks if the current element of `set1` is already sitting inside `set2`.
- ` (union (cdr set1) set2)]` — If it is, we skip adding it right now. It will naturally appear in the final output because we return `set2` in the base case.
- `[else` — If it is NOT in `set2`...
- ` (cons (car set1) (union (cdr set1) set2))]))` — We must manually add it. We `cons` it onto the recursion.

**Execution trace for `(union '(a b) '(b c))`:**
1. `(union '(a b) '(b c))` — `(member? 'a '(b c))` is `#f`. Returns `(cons 'a (union '(b) '(b c)))`.
2. `(union '(b) '(b c))` — `(member? 'b '(b c))` is `#t`. Skips 'b'. Returns `(union '() '(b c))`.
3. `(union '() '(b c))` — `null?` is `#t`. Returns `'(b c)`.
4. Resolving up: `(cons 'a '(b c))` -> `'(a b c)`.

### CS lens
This takes advantage of **structural sharing**. Because functional lists are immutable, `union` doesn't have to copy `set2`. When it hits the base case, it just points the tail of the new list directly at the memory address of `set2`.
Also recognized in: boolean OR operations, database FULL OUTER JOIN, rendering multiple overlapping geometry passes.

### SE lens
This is engineered for efficiency. If we just appended the two lists and called `makeset` on the result (`(makeset (append set1 set2))`), we would unnecessarily rebuild the entire second list. Here, we only allocate new pair nodes for the elements of `set1` that are strictly missing from `set2`, and we reuse the entirety of `set2` directly in memory.

### Commands needed to make this unit real, if any.
None.

### Run it. Show the real output.
```scheme
> (union '(a b c) '(b c d))
'(a b c d)
```

### One sentence connecting this unit to what came immediately before.
With intersection finding what's shared and union merging everything together, the final basic operation is finding what is left when we subtract one set from another.

---

## Concept Unit: `difference` — Elements of set1 not in set2

### The Problem
We need to subtract sets: given `set1`, remove any element that appears in `set2`. For `set1 = '(a b c d)` and `set2 = '(b d)`, the difference is `'(a c)`.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `sets.scm` (modified)
- **Change type:** Add
- **Location:** After `union`
- **Dependencies:** None

### The New Code — type it yourself
```scheme
(define (difference set1 set2)
  (cond
    [(null? set1) '()]
    [(member? (car set1) set2)
     (difference (cdr set1) set2)]
    [else
     (cons (car set1) (difference (cdr set1) set2))]))
```

### The Updated Project
```scheme
;; sets.scm
(define (union set1 set2)
  (cond
    [(null? set1) set2]
    [(member? (car set1) set2)
     (union (cdr set1) set2)]
    [else
     (cons (car set1) (union (cdr set1) set2))]))

// ← new
(define (difference set1 set2)
  (cond
    [(null? set1) '()]
    [(member? (car set1) set2)
     (difference (cdr set1) set2)]
    [else
     (cons (car set1) (difference (cdr set1) set2))]))
```
The file now contains `difference`. As a whole, the core set operation library is complete, providing all primary set math functions.

### Introduce the concept in isolation
```scheme
(define (test-diff s1 s2)
  (cond
    [(null? s1) '()]
    [(member? (car s1) s2)
     (test-diff (cdr s1) s2)]
    [else
     (cons (car s1) (test-diff (cdr s1) s2))]))

(test-diff '(a b c d) '(b c))
```
Output:
```
'(a d)
```
This proves the logic is a direct inversion of `intersect`. If the element is found in `s2`, we skip keeping it. If it is NOT found in `s2`, we `cons` it.

### Discard the throwaway example
The isolated `test-diff` is discarded and will not appear in the project again.

### Mechanical walkthrough — how it works in isolation
- `(define (difference set1 set2)` — Takes two sets.
- `(cond` — Branching.
- `[(null? set1) '()]` — Base case: an empty set minus anything is still an empty set.
- `[(member? (car set1) set2)` — Checks if the current element of `set1` exists in `set2`.
- ` (difference (cdr set1) set2)]` — If it does, we drop it (do not `cons` it) and recurse.
- `[else` — If it does NOT exist in `set2`...
- ` (cons (car set1) (difference (cdr set1) set2))]))` — We keep it. We `cons` it onto the recursion.

**Execution trace for `(difference '(a b) '(b c))`:**
1. `(difference '(a b) '(b c))` — `(member? 'a '(b c))` is `#f`. Jumps to `else`. Returns `(cons 'a (difference '(b) '(b c)))`.
2. `(difference '(b) '(b c))` — `(member? 'b '(b c))` is `#t`. Skips 'b'. Returns `(difference '() '(b c))`.
3. `(difference '() '(b c))` — `null?` is `#t`. Returns `'()`.
4. Resolving up: `(cons 'a '())` -> `'(a)`. Final result: `'(a)`.

### CS lens
This is another constructive filter mapping, exactly identical to `intersect`, except the predicate is negated. It behaves mathematically as a relative complement. In higher-order function terms, it is `my-filter` with the predicate `(lambda (elem) (not (member? elem set2)))`.
Also recognized in: cache invalidation (finding items that changed), boolean NOT operations, geometric boolean subtraction.

### SE lens
This is engineered for predictability. It only removes elements of `set1` that exist in `set2`. It does NOT care if `set2` contains elements entirely unrelated to `set1` (like `'c` in the trace above). The tradeoff is that the operation is strictly asymmetric: `(difference A B)` is not the same as `(difference B A)`.

### Commands needed to make this unit real, if any.
None.

### Run it. Show the real output.
```scheme
> (difference '(a b c d) '(b d))
'(a c)
```

### One sentence connecting this unit to what came immediately before.
With difference implemented, we've successfully mapped the core mathematical operations to pure Lisp functions.

---

## Closing

### Connect the pieces
We can now chain operations. If we take `input1 = '(a b a)` and `input2 = '(b c d b)`, neither are sets. But we can combine them securely: `(union (makeset '(a b a)) (makeset '(b c d b)))`. 
1. `makeset` cleans `input1` into `'(b a)`.
2. `makeset` cleans `input2` into `'(c d b)`.
3. `union` merges them by checking if elements of `'(b a)` are in `'(c d b)`. 'b' is present, so it's skipped. 'a' is not, so it's added. The final output is `'(a c d b)`, a mathematically sound merged set produced purely from basic lists.

### What breaks without this
If we purposefully break `makeset` by commenting out its recursion skip logic:
```scheme
(define (makeset lst)
  (cond
    [(null? lst) '()]
    ;[(member? (car lst) (cdr lst))
    ; (makeset (cdr lst))]
    [else
     (cons (car lst) (makeset (cdr lst)))]))
```
Run `(makeset '(a b a))`. 
Output: `'(a b a)`.
Without the forward-looking `member?` filter, the constraint is lost. The uniqueness property that allows `subset?`, `intersect`, and `difference` to logically function falls apart, proving that the behavior of our sets depends entirely on code enforcing a convention, rather than a special memory type.

### Exercises
- **Symmetric Difference:** Write `symmetric-difference`, which returns elements that are in either `set1` or `set2`, but NOT in both. Hint: You can build this directly using the `union`, `difference`, and `intersect` functions you just wrote.
- **First Occurrence `makeset`:** Implement the alternative `makeset-first` shown conceptually in the lesson, which keeps the *first* occurrence of an element rather than the *last*, by using `rember` to explicitly strip duplicates from the rest of the list before recursing.

### Definition of done
- [x] `set?` implemented to validate uniqueness.
- [x] `makeset` implemented to remove duplicates.
- [x] `subset?`, `intersect`, `union`, and `difference` implemented as cross-set functions.
- [x] Tested against lists with and without duplicates.

Commit your changes:
`git commit -am "Add list-based set math operations"`
