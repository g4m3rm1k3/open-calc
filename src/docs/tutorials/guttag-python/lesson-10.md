# Lesson 10: Sets — Membership and Uniqueness

What you will build: The reader will understand Racket sets: creation, membership testing (O(1)), set operations (union, intersection, difference, symmetric difference), immutable vs mutable sets, and when sets are the right tool. The transferable problems: (1) a set is an unordered collection of UNIQUE values — adding a duplicate has no effect; (2) membership testing is extremely fast for sets compared to lists — this matters enormously for large datasets; (3) set operations (intersection, difference) solve a class of problems cleanly that would require nested loops otherwise. We will build a simple subscriber analytics script to demonstrate these.

What you need to know first: Lessons 0–9 (REPL, types, variables, conditionals, iteration, functions, strings, lists).

**Terms used in this lesson**
- **Set** — an unordered collection of unique values. It exists to efficiently answer "is this item in the collection?" and to mathematically combine collections without duplicates.
- **Membership testing** — checking if a value exists within a collection. In sets, this is highly optimized, making it much faster than searching a list.
- **Union** — a set operation that combines elements from multiple sets into one, keeping only unique elements.
- **Intersection** — a set operation that produces a set containing only the elements that exist in all the provided sets.
- **Difference** — a set operation that produces a set of elements in the first set but not in the second.
- **Symmetric Difference** — a set operation that produces elements in either of two sets, but not in both.

**Objects and methods used**
- **`set`**
  - *What it is:* A function to construct an immutable literal set.
  - *Implementation:* `(set v ...)`
  - *Its use:* To create a new set from given values.
  - *Type:* Function.
  - *Responsibility:* Constructs and returns an immutable set containing the provided unique values.
  - *Depends on:* The values passed as arguments.
  - *Connects to:* Returns a set data structure.
  - *Shape:* Public standard library API.
- **`set-count`**
  - *What it is:* A function to get the number of elements in a set.
  - *Implementation:* `(set-count st)`
  - *Its use:* To know the size of a set.
  - *Type:* Function.
  - *Responsibility:* Counts the unique elements in the set.
  - *Depends on:* A set.
  - *Connects to:* Returns an integer.
  - *Shape:* Public standard library API.
- **`set-member?`**
  - *What it is:* A function to check if an element is in a set.
  - *Implementation:* `(set-member? st v)`
  - *Its use:* To efficiently verify membership.
  - *Type:* Function.
  - *Responsibility:* Returns true if the value is in the set, false otherwise.
  - *Depends on:* A set and a value to look for.
  - *Connects to:* Returns a boolean.
  - *Shape:* Public standard library API.
- **`set-add`**
  - *What it is:* A function to functionally add an element.
  - *Implementation:* `(set-add st v)`
  - *Its use:* To derive a new set with an added element.
  - *Type:* Function.
  - *Responsibility:* Returns a new immutable set including the new value.
  - *Depends on:* A set and a value.
  - *Connects to:* Returns a new set.
  - *Shape:* Public standard library API.
- **`list->set`**
  - *What it is:* A function to convert a list to a set.
  - *Implementation:* `(list->set lst)`
  - *Its use:* To deduplicate elements from a list.
  - *Type:* Function.
  - *Responsibility:* Returns a new set containing the unique elements of the list.
  - *Depends on:* A list.
  - *Connects to:* Returns a set.
  - *Shape:* Public standard library API.
- **`set-union`**
  - *What it is:* A function to perform mathematical union.
  - *Implementation:* `(set-union st ...)`
  - *Its use:* To combine sets.
  - *Type:* Function.
  - *Responsibility:* Returns a new set with all unique elements from all given sets.
  - *Depends on:* One or more sets.
  - *Connects to:* Returns a set.
  - *Shape:* Public standard library API.
- **`set-intersect`**
  - *What it is:* A function to perform mathematical intersection.
  - *Implementation:* `(set-intersect st ...)`
  - *Its use:* To find common elements.
  - *Type:* Function.
  - *Responsibility:* Returns a new set with elements present in all given sets.
  - *Depends on:* One or more sets.
  - *Connects to:* Returns a set.
  - *Shape:* Public standard library API.
- **`set-subtract`**
  - *What it is:* A function to perform set difference.
  - *Implementation:* `(set-subtract st0 st ...)`
  - *Its use:* To find elements unique to the first set.
  - *Type:* Function.
  - *Responsibility:* Returns a new set with elements in the first set but not in the rest.
  - *Depends on:* Two or more sets.
  - *Connects to:* Returns a set.
  - *Shape:* Public standard library API.
- **`set-symmetric-difference`**
  - *What it is:* A function to find elements in exactly one of two sets.
  - *Implementation:* `(set-symmetric-difference st1 st2)`
  - *Its use:* To find non-overlapping elements.
  - *Type:* Function.
  - *Responsibility:* Returns elements that are in either set, but not both.
  - *Depends on:* Two sets.
  - *Connects to:* Returns a set.
  - *Shape:* Public standard library API.
- **`subset?`**
  - *What it is:* A function to check if one set is a subset of another.
  - *Implementation:* `(subset? st1 st2)`
  - *Its use:* To verify set containment.
  - *Type:* Function.
  - *Responsibility:* Returns true if all elements of st1 are in st2.
  - *Depends on:* Two sets.
  - *Connects to:* Returns a boolean.
  - *Shape:* Public standard library API.
- **`mutable-set`**
  - *What it is:* A function to construct a mutable set.
  - *Implementation:* `(mutable-set v ...)`
  - *Its use:* To create a set that can be modified in-place.
  - *Type:* Function.
  - *Responsibility:* Constructs and returns a mutable set.
  - *Depends on:* Initial values.
  - *Connects to:* Returns a mutable set data structure.
  - *Shape:* Public standard library API.

## Concept Unit: Creating sets and basic operations

### The Problem
If we have a collection of active user IDs and we want to quickly check if a given user is active, using a list requires scanning every element. We need a collection specifically optimized for unique values and fast membership checks. What data structure should we use?

### Introduce the concept in isolation
```racket
> (define s (set 1 2 3 4))
> s
(set 1 2 3 4)
> (set-count s)
4
> (set-member? s 3)
#t
> (set-member? s 5)
#f
> (set-add s 5)
(set 1 2 3 4 5)
> s
(set 1 2 3 4)
> (set-add s 3)
(set 1 2 3 4)
> (set)
(set)
```
This demonstrates the **set** data structure. A set is created using `(set)`. Notice that `set-add` returns a *new* set and leaves the original `s` unchanged, because standard Racket sets are immutable. Adding a duplicate `3` has no effect. 

### Discard the throwaway example
We are deleting the `s` variable from our REPL. It will not be used in our project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are starting our analytics script.
- **Files affected:** `analytics.rkt` (created)
- **Change type:** add
- **Location:** File root.
- **Dependencies:** None.

### The New Code
```racket
#lang racket
(define active-users (set "alice" "bob"))
(define (is-active? user)
  (set-member? active-users user))
```

### The Updated Project
```racket
#lang racket
// ← new
(define active-users (set "alice" "bob"))
(define (is-active? user)
  (set-member? active-users user))
```
Our file now defines a set of active users and a function to check membership.

### Mechanical walkthrough
- **`set`**: A function that constructs an immutable set containing the provided unique values. Here, it takes `"alice"` and `"bob"` and creates a set.
- **`set-member?`**: A function to check if a value exists within a collection. In sets, this is O(1) (constant time), making it much faster than searching a list. It takes our `active-users` set and the `user` variable.

## Concept Unit: Creating sets from lists

### The Problem
Data often arrives as a list from a file or API, possibly with duplicates. How do we convert this list into a deduplicated set?

### Introduce the concept in isolation
```racket
> (list->set '(1 2 2 3 3 3))
(set 1 2 3)
> (list->set (string->list "hello"))
(set #\e #\h #\l #\o)
> (set->list (set 3 1 4 1 5 9 2 6))
'(1 2 3 4 5 6 9)
```
This is the **list->set** function. It removes duplicates from the list and yields a set. `set->list` converts it back, but does not guarantee the original order.

### Discard the throwaway example
The list and set conversions above are discarded.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `analytics.rkt` (modified)
- **Change type:** add
- **Location:** After `is-active?`.
- **Dependencies:** None.

### The New Code
```racket
(define raw-log-entries '("alice" "bob" "alice" "charlie"))
(define unique-visitors (list->set raw-log-entries))
```

### The Updated Project
```racket
#lang racket
(define active-users (set "alice" "bob"))
(define (is-active? user)
  (set-member? active-users user))

// ← new
(define raw-log-entries '("alice" "bob" "alice" "charlie"))
(define unique-visitors (list->set raw-log-entries))
```
We take a list of visitors and convert it into a unique set.

### Mechanical walkthrough
- **`list->set`**: A function that converts a list to a set. It iterates over `raw-log-entries` and builds a new set, discarding the second `"alice"`.

## Concept Unit: Set operations — union, intersection, difference

### The Problem
We have sets of users from two different systems. How do we find users in *both* systems, or in *either* system, without writing manual loops?

### Introduce the concept in isolation
```racket
> (define a (set 1 2 3 4))
> (define b (set 3 4 5 6))

> (set-union a b)
(set 1 2 3 4 5 6)

> (set-intersect a b)
(set 3 4)

> (set-subtract a b)
(set 1 2)

> (set-symmetric-difference a b)
(set 1 2 5 6)
```
These are the core **set operations**. Union combines them, intersect finds commonalities, subtract removes `b` from `a`, and symmetric difference finds elements in one but not both.

### Discard the throwaway example
We discard the `a` and `b` variables.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `analytics.rkt` (modified)
- **Change type:** add
- **Location:** Bottom of file.
- **Dependencies:** None.

### The New Code
```racket
(define system-a-users (set "alice" "bob" "carol" "dave"))
(define system-b-users (set "bob" "carol" "eve" "frank"))

(define both (set-intersect system-a-users system-b-users))
(define only-a (set-subtract system-a-users system-b-users))
(define all-users (set-union system-a-users system-b-users))
```

### The Updated Project
```racket
#lang racket
(define active-users (set "alice" "bob"))
(define (is-active? user)
  (set-member? active-users user))

(define raw-log-entries '("alice" "bob" "alice" "charlie"))
(define unique-visitors (list->set raw-log-entries))

// ← new
(define system-a-users (set "alice" "bob" "carol" "dave"))
(define system-b-users (set "bob" "carol" "eve" "frank"))

(define both (set-intersect system-a-users system-b-users))
(define only-a (set-subtract system-a-users system-b-users))
(define all-users (set-union system-a-users system-b-users))
```
We calculate various overlapping metrics of users.

### Mechanical walkthrough
- **`set-intersect`**: A function to perform mathematical intersection. It finds `"bob"` and `"carol"`.
- **`set-subtract`**: A function to perform set difference. It finds `"alice"` and `"dave"`.
- **`set-union`**: A function to perform mathematical union. It gathers all unique names from both sets.

## Concept Unit: Subset checks

### The Problem
How do we know if all our active users are present in the full user list, without checking each one individually?

### Introduce the concept in isolation
```racket
> (subset? (set 1 2) (set 1 2 3))
#t
> (subset? (set 1 2 3) (set 1 2))
#f
> (proper-subset? (set 1 2) (set 1 2 3))
#t
> (proper-subset? (set 1 2) (set 1 2))
#f
```
These functions check containment. A proper subset means strictly smaller (not equal).

### Discard the throwaway example
We discard the throwaway test sets.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `analytics.rkt` (modified)
- **Change type:** add
- **Location:** Bottom of file.
- **Dependencies:** None.

### The New Code
```racket
(define is-subset? (subset? active-users all-users))
```

### The Updated Project
```racket
...
(define both (set-intersect system-a-users system-b-users))
(define only-a (set-subtract system-a-users system-b-users))
(define all-users (set-union system-a-users system-b-users))

// ← new
(define is-subset? (subset? active-users all-users))
```
We check if our active users are mathematically contained within our overall list.

### Mechanical walkthrough
- **`subset?`**: A function to check if one set is a subset of another. It verifies every element of `active-users` exists in `all-users`.

## Concept Unit: Mutable sets

### The Problem
Sometimes creating a new immutable set on every addition is inefficient. What if we need to build up a set over time, modifying it in place?

### Introduce the concept in isolation
```racket
> (define ms (mutable-set 1 2 3))
> (set-add! ms 4)
> ms
(mutable-set 1 2 3 4)
> (set-remove! ms 2)
> ms
(mutable-set 1 3 4)
> (set-remove! ms 99)
> ms
(mutable-set 1 3 4)
```
This is the **mutable-set**. Using `set-add!` and `set-remove!` updates the set in place. Removing a non-existent item is silently ignored.

### Discard the throwaway example
We discard `ms`.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `analytics.rkt` (modified)
- **Change type:** add
- **Location:** Bottom of file.
- **Dependencies:** None.

### The New Code
```racket
(define tracked-users (mutable-set))
(set-add! tracked-users "alice")
```

### The Updated Project
```racket
...
(define is-subset? (subset? active-users all-users))

// ← new
(define tracked-users (mutable-set))
(set-add! tracked-users "alice")
```
We create a mutable set for tracking users dynamically.

### Mechanical walkthrough
- **`mutable-set`**: A function to construct a mutable set. It creates a stateful collection we can modify.
- **`set-add!`**: A function that mutates the set to include the new element `"alice"`.

## Concept Unit: Hashable immutable sets

### The Problem
Can a set be an element of another set, or a key in a dictionary (hash)?

### Introduce the concept in isolation
```racket
> (define h (hash (set 1 2) "pair"))
> (hash-ref h (set 1 2))
"pair"
```
Because standard Racket `set`s are immutable, they are hashable and can be used as keys. Mutable sets cannot be used this way safely.

### Discard the throwaway example
We discard the hash table `h`.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `analytics.rkt` (modified)
- **Change type:** add
- **Location:** Bottom of file.
- **Dependencies:** None.

### The New Code
```racket
(define groups (set (set "alice" "bob") (set "carol")))
```

### The Updated Project
```racket
...
(define tracked-users (mutable-set))
(set-add! tracked-users "alice")

// ← new
(define groups (set (set "alice" "bob") (set "carol")))
```
We store sets inside a set.

### Mechanical walkthrough
- **`set`**: A function to construct an immutable literal set. The inner sets are immutable, so they safely act as elements for the outer set.

## Concept Unit: Real use case

### The Problem
Let's print the actual metrics using the set operations we defined.

### Introduce the concept in isolation
```racket
> (printf "Both: ~a\n" (set-intersect (set 1 2) (set 2 3)))
Both: (set 2)
```
We use `printf` to display the result of a set operation.

### Discard the throwaway example
We discard this snippet.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `analytics.rkt` (modified)
- **Change type:** add
- **Location:** Bottom of file.
- **Dependencies:** None.

### The New Code
```racket
(printf "Subscribed to both: ~a\n" both)
(printf "Subscribed to exactly one: ~a\n" (set-symmetric-difference system-a-users system-b-users))
```

### The Updated Project
```racket
...
(define groups (set (set "alice" "bob") (set "carol")))

// ← new
(printf "Subscribed to both: ~a\n" both)
(printf "Subscribed to exactly one: ~a\n" (set-symmetric-difference system-a-users system-b-users))
```
The script now outputs the insights gathered from the sets.

### Mechanical walkthrough
- **`set-symmetric-difference`**: A function to find elements in exactly one of two sets. This effectively gives us the list of users who are not shared between the two systems.
- **`printf`**: Prints formatted output.

Sets are the right tool when uniqueness matters, when you need fast membership testing, or when you need mathematical set operations. Lesson 11 covers comprehensions — a concise syntax for building collections.
