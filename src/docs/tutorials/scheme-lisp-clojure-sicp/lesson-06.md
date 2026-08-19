# Lesson 6: The Second Commandment — Build with `cons`

What you will build
The reader will learn that when a recursive function on a list needs to return a list, it must build that result using `cons` on the way back up the call stack — never with `list` or `append` in the recursive case. The transferable problems: (1) `cons` is the only correct way to build a result list during structural recursion because it adds exactly one element and preserves the recursive shape; (2) `list` in the recursive case creates nested lists instead of flat ones; (3) `append` in the recursive case is quadratic — it rebuilds the entire accumulated list on every step; (4) this is the Second Commandment from The Little Schemer: "Use `cons` to build lists."

What you need to know first
- Lesson 0-4 concepts (S-expressions, REPL, prefix notation, #lang racket, cons, car, cdr, pair?, atom?, list, null?, define, lambda, if, cond, booleans)
- Lesson 5 (structural recursion, the First Commandment, call stack, execution traces, my-length, my-member?)

Terms used in this lesson
- **Structural recursion** — breaking a structure (like a list) down one element at a time until reaching a base case, solving it, and combining the results on the way back up. It is the fundamental way functional programs iterate without `while` or `for` loops.
- **Base case** — the condition that stops the recursion (often `null?` for lists), preventing infinite loops.
- **Recursive case** — the branch that processes one piece of data and calls the function again on the rest.
- **Quadratic cost** — an algorithmic property where doing a task $N$ times takes time proportional to $N^2$. This is what happens when you use `append` in a recursive loop instead of `cons`, because `append` traverses the whole accumulated list every step.
- **The Second Commandment** — "Use `cons` to build lists." A principle from *The Little Schemer* that dictates `cons` must be the glue used to construct a list result in recursive functions.

Objects and methods used
- **`cons`**
  - *What it is:* the fundamental list-building operation in Lisp.
  - *Implementation:* a built-in primitive function taking two arguments.
  - *Its use:* to attach a new element to the front of an already-correct list returned by a recursive call.
  - *Type:* a free function `(cons element list)`.
  - *Responsibility:* allocates a new pair cell linking the first argument to the second argument.
  - *Depends on:* an element to add, and a list (or pair) to attach it to.
  - *Connects to:* called by recursive list-building functions to assemble the final result.
  - *Shape:* a core language primitive used everywhere.

- **`list`**
  - *What it is:* a convenience function to create a flat list from an arbitrary number of arguments.
  - *Implementation:* a built-in function taking variadic arguments.
  - *Its use:* shown in the bug demonstration to prove why it creates nested lists when used in a recursive step instead of `cons`.
  - *Type:* a free function `(list ...args)`.
  - *Responsibility:* packages all provided arguments into a single, properly terminated list.
  - *Depends on:* the values to be included.
  - *Connects to:* used at the top level or base cases, but fatal in recursive building.
  - *Shape:* a core language primitive.

- **`append`**
  - *What it is:* a list concatenation function.
  - *Implementation:* a built-in function that takes two or more lists and joins them.
  - *Its use:* to show the performance cost (quadratic) of rebuilding lists at every step instead of linking with `cons`.
  - *Type:* a free function `(append list1 list2 ...)`.
  - *Responsibility:* traverses the first list to make copies of its cells, pointing the final cell to the second list.
  - *Depends on:* two or more lists.
  - *Connects to:* called when joining completely separate lists, but not for element-by-element accumulation.
  - *Shape:* a core library function.

- **`equal?`**
  - *What it is:* the standard deep-equality comparison function.
  - *Implementation:* a built-in function.
  - *Its use:* to compare the current list element against a target atom in `my-rember` and `my-insertR`.
  - *Type:* a free function `(equal? a b)`.
  - *Responsibility:* determines if two values are structurally identical.
  - *Depends on:* two arguments of any type.
  - *Connects to:* used in `cond` predicate tests.
  - *Shape:* a core language primitive.

- **`car`**
  - *What it is:* the list head accessor.
  - *Implementation:* a built-in primitive function taking one list or pair.
  - *Its use:* to retrieve the current element we are processing during recursion.
  - *Type:* a free function `(car list)`.
  - *Responsibility:* returns the first element of a pair.
  - *Depends on:* a non-empty list.
  - *Connects to:* used anywhere a list's first element must be inspected.
  - *Shape:* a core language primitive.

- **`cdr`**
  - *What it is:* the list tail accessor.
  - *Implementation:* a built-in primitive function taking one list or pair.
  - *Its use:* to step forward to the rest of the list for the recursive call.
  - *Type:* a free function `(cdr list)`.
  - *Responsibility:* returns the remainder of the list after the first element.
  - *Depends on:* a non-empty list.
  - *Connects to:* drives the recursion forward toward the base case.
  - *Shape:* a core language primitive.

- **`null?`**
  - *What it is:* the empty-list predicate.
  - *Implementation:* a built-in function taking one argument.
  - *Its use:* to detect the base case and stop recursion.
  - *Type:* a free function `(null? val)`.
  - *Responsibility:* returns `#t` if the value is the empty list `()`, `#f` otherwise.
  - *Depends on:* any value to test.
  - *Connects to:* always used as the first condition in a recursive `cond` or `if`.
  - *Shape:* a core language primitive.

## Concept Unit: Why `cons`, not `list` — the `list` Bug

### The Problem
When writing a recursive function that needs to return a list, the natural instinct for beginners is to use `list` to package the current element and the recursive result together. We need to see exactly why that fails to produce a flat list, and what shape it actually creates instead.

### Project Change
- **Reference Source** — No reference counterpart — this is a from-scratch addition because we are demonstrating a bug before fixing it.
- **Files affected** — `commandments.rkt` (created)
- **Change type** — add
- **Location** — Brand new file.
- **Dependencies** — `racket` installation.

### The New Code
```scheme
#lang racket

(define (broken-copy lst)
  (if (null? lst)
      '()
      (list (car lst) (broken-copy (cdr lst)))))
```

### The Updated Project
```scheme
// ← new
#lang racket

(define (broken-copy lst)
  (if (null? lst)
      '()
      (list (car lst) (broken-copy (cdr lst)))))
```
This file now contains a full Racket module with a single function `broken-copy` that attempts to duplicate a list element by element.

### Introduce the concept in isolation
Let's see what happens when we use `list` to join a number and an already-existing list.

```scheme
(list 1 '(2 3))
```

### Run it. Show the real output.
```
'(1 (2 3))
```
This output proves that `list` creates a new list with exactly two elements: the number `1`, and the sub-list `(2 3)`. It does not merge them into a flat `(1 2 3)`. This behavior of creating nested lists is what breaks recursive list-building.

### Discard the throwaway example
The isolated `(list 1 '(2 3))` line is discarded; it will not appear in the project again.

### Mechanical walkthrough
- `#lang racket` declares the language for this file, which the Racket environment needs to interpret the syntax.
- `(define (broken-copy lst)` declares a new function named `broken-copy` that accepts one argument `lst`.
- `(if (null? lst)` is the base case check. `null?` asks if the list is empty.
- `'()` is returned if the list is empty. This is the empty list literal, serving as the foundation of our result.
- `(list ...)` is called in the recursive case. `list` takes its arguments and puts them inside a brand new list container.
- `(car lst)` retrieves the first element of the current list.
- `(broken-copy (cdr lst))` is the recursive call. `cdr` steps forward by getting the rest of the list.

Here is the execution trace for `(broken-copy '(1 2 3))`:

1. `(broken-copy '(1 2 3))` — `lst` is not null. Returns `(list 1 (broken-copy '(2 3)))`.
2. `(broken-copy '(2 3))` — `lst` is not null. Returns `(list 2 (broken-copy '(3)))`.
3. `(broken-copy '(3))` — `lst` is not null. Returns `(list 3 (broken-copy '()))`.
4. `(broken-copy '())` — `lst` is null. Returns `'()`.
5. Unwind step 1: `(list 3 '())` evaluates to `(3 ())`.
6. Unwind step 2: `(list 2 '(3 ()))` evaluates to `(2 (3 ()))`.
7. Unwind step 3: `(list 1 '(2 (3 ())))` evaluates to `(1 (2 (3 ())))`.

The final output is `(1 (2 (3 ())))` because `list` wrapped the recursive result inside a new list at every single step, creating deeply nested layers.

### CS Lens
The `list` bug demonstrates the difference between **list concatenation/appending** and **list wrapping**. Also recognized in: JSON arrays where pushing an array into an array creates a nested 2D array rather than merging elements; deeply nested HTML `<div>` structures when inner content isn't flattened; Russian nesting dolls.

### SE Lens
The alternative to learning this specific bug is trial and error with `append` or `flatten` later. The design principle is **type consistency**. A list-processing function expecting a flat list will crash if fed a nested list. Using the correct constructor from the start eliminates the need for expensive post-processing cleanups.

### Commands needed
To run the code, use the Racket command line tool:
`racket commandments.rkt`

### One sentence connecting this unit to what came immediately before
Now that we have seen exactly how `list` creates deeply nested, incorrect shapes in recursion, we must introduce the tool designed to fix this: `cons`.

## Concept Unit: The Correct Version With `cons`

### The Problem
We need to rebuild the original list exactly, without adding unwanted nesting. We need a way to take one element and attach it directly to the front of a list, extending the list rather than wrapping it.

### Project Change
- **Reference Source** — No reference counterpart — this is a core SICP drill.
- **Files affected** — `commandments.rkt` (modified)
- **Change type** — add
- **Location** — Below `broken-copy`.
- **Dependencies** — `racket`.

### The New Code
```scheme
(define (my-copy lst)
  (if (null? lst)
      '()
      (cons (car lst) (my-copy (cdr lst)))))
```

### The Updated Project
```scheme
#lang racket

(define (broken-copy lst)
  (if (null? lst)
      '()
      (list (car lst) (broken-copy (cdr lst)))))

// ← new
(define (my-copy lst)
  (if (null? lst)
      '()
      (cons (car lst) (my-copy (cdr lst)))))
```
The file now contains the correct structural recursion pattern for copying a list, standing right next to the broken one for comparison.

### Introduce the concept in isolation
Let's see what `cons` does with the exact same inputs we gave to `list` earlier.

```scheme
(cons 1 '(2 3))
```

### Run it. Show the real output.
```
'(1 2 3)
```
This output proves that `cons` takes a single element `1` and links it directly to the front of the list `(2 3)`, resulting in a flat `(1 2 3)`. It does not nest the list.

### Discard the throwaway example
The isolated `(cons 1 '(2 3))` line is discarded and will not appear again.

### Mechanical walkthrough
- `(define (my-copy lst)` declares the new copying function.
- `(if (null? lst)` is the same base case check.
- `'()` is the exact same empty list foundation.
- `(cons ...)` is the crucial difference. **`cons`** allocates a new list cell that points to `(car lst)` as its head and the result of the recursive call as its tail.
- `(car lst)` gets the current element to keep.
- `(my-copy (cdr lst))` gets the fully assembled remainder of the list from the recursion.

Here is the execution trace for `(my-copy '(1 2 3))`:

1. `(my-copy '(1 2 3))` — `lst` is not null. Returns `(cons 1 (my-copy '(2 3)))`.
2. `(my-copy '(2 3))` — `lst` is not null. Returns `(cons 2 (my-copy '(3)))`.
3. `(my-copy '(3))` — `lst` is not null. Returns `(cons 3 (my-copy '()))`.
4. `(my-copy '())` — `lst` is null. Returns `'()`.
5. Unwind step 1: `(cons 3 '())` evaluates to `(3)`.
6. Unwind step 2: `(cons 2 '(3))` evaluates to `(2 3)`.
7. Unwind step 3: `(cons 1 '(2 3))` evaluates to `(1 2 3)`.

Because `cons` joins one element to the front of an already-correct list, the list is perfectly assembled on the way back up the call stack.

### CS Lens
This is **Structural recursion** returning a structurally identical value. Also recognized in: linked list insertions, immutable tree rebalancing, functional state updates in Redux, purely functional persistent data structures.

### SE Lens
The alternative was `list`, which broke the shape. Another alternative is mutating a shared list in a `while` loop (which doesn't exist in pure Scheme). The **Second Commandment** design principle is enforced: "Use `cons` to build lists." We pay a small cost of O(N) stack frames, but we gain code that is mathematically provable and thread-safe because it mutates nothing.

### Commands needed
None new.

### Run it. Show the real output.
Running `(my-copy '(1 2 3))` in the REPL yields:
```
'(1 2 3)
```

### One sentence connecting this unit to what came immediately before
With the correct copying pattern established, we can now start doing real work, like removing specific elements while rebuilding the rest.

## Concept Unit: `my-rember` — removing an atom

### The Problem
We need to write a function that removes the *first* occurrence of a specific atom from a list, but leaves the rest of the list completely intact. To do this, we must rebuild the parts of the list we want to keep.

### Project Change
- **Reference Source** — The Little Schemer, Chapter 3.
- **Files affected** — `commandments.rkt` (modified)
- **Change type** — add
- **Location** — Below `my-copy`.
- **Dependencies** — `racket`.

### The New Code
```scheme
(define (my-rember atom lst)
  (cond
    [(null? lst) '()]
    [(equal? (car lst) atom) (cdr lst)]
    [else (cons (car lst) (my-rember atom (cdr lst)))]))
```

### The Updated Project
```scheme
(define (my-copy lst)
  (if (null? lst)
      '()
      (cons (car lst) (my-copy (cdr lst)))))

// ← new
(define (my-rember atom lst)
  (cond
    [(null? lst) '()]
    [(equal? (car lst) atom) (cdr lst)]
    [else (cons (car lst) (my-rember atom (cdr lst)))]))
```
The file now contains `my-rember`, which introduces filtering logic on top of the list-building pattern we just learned.

### Introduce the concept in isolation
Let's see how `equal?` compares atoms before we use it to drop elements.

```scheme
(equal? 'b 'b)
```

### Run it. Show the real output.
```
#t
```
This output proves that `equal?` successfully identifies when the target atom matches the current element.

### Discard the throwaway example
The isolated `(equal? 'b 'b)` line is discarded.

### Mechanical walkthrough
- `(define (my-rember atom lst)` declares a function taking the target `atom` and the `lst`.
- `(cond ...)` starts a multi-branch conditional.
- `[(null? lst) '()]` is the standard base case. If we hit the end, return the empty list.
- `[(equal? (car lst) atom)` checks if the very first element of the list matches our target atom.
- `(cdr lst)]` is returned immediately if the match succeeds. By returning `cdr` instead of recursing or `cons`ing the `car`, we effectively "drop" the current element. Because we do not call `my-rember` again, only the *first* occurrence is removed.
- `[else (cons (car lst) (my-rember atom (cdr lst)))]` is the recursive case for when the element does *not* match. Following the Second Commandment, we use **`cons`** to glue the non-matching `(car lst)` onto the result of recursing on the rest of the list.

Execution trace for `(my-rember 'b '(a b c b))`:

1. `(my-rember 'b '(a b c b))` — `lst` is not null, `car` is 'a', not equal to 'b'. Returns `(cons 'a (my-rember 'b '(b c b)))`.
2. `(my-rember 'b '(b c b))` — `lst` is not null, `car` is 'b', which equals 'b'. Returns `'(c b)` directly.
3. Unwind step 1: `(cons 'a '(c b))` evaluates to `(a c b)`.

The else branch uses `cons` to rebuild the head of the list while the recursive call handles the tail. This is the exact Second Commandment pattern.

### CS Lens
This is an **early return** pattern applied to structural recursion. Also recognized in: linear search algorithms, tree pruning, short-circuit evaluation in boolean logic, router path matching.

### SE Lens
The alternative is a `filter` function, which would remove *all* occurrences, or an iterative loop with a `break` statement. The functional design principle here is that to "remove" something from an immutable structure, you simply stop including it in the newly constructed copy.

### Commands needed
None new.

### Run it. Show the real output.
Running `(my-rember 'b '(a b c b))` yields:
```
'(a c b)
```

### One sentence connecting this unit to what came immediately before
If we can drop an element by omitting `cons`, we can add brand new elements by using `cons` twice.

## Concept Unit: `my-insertR` — inserting an element

### The Problem
We need to insert a brand new atom directly to the right of the first occurrence of a specific old atom. This requires building a list where, upon finding the target, we assemble *both* the old element and the new element before attaching the rest of the list.

### Project Change
- **Reference Source** — The Little Schemer, Chapter 3.
- **Files affected** — `commandments.rkt` (modified)
- **Change type** — add
- **Location** — Below `my-rember`.
- **Dependencies** — `racket`.

### The New Code
```scheme
(define (my-insertR new old lst)
  (cond
    [(null? lst) '()]
    [(equal? (car lst) old)
     (cons old (cons new (cdr lst)))]
    [else (cons (car lst) (my-insertR new old (cdr lst)))]))
```

### The Updated Project
```scheme
(define (my-rember atom lst)
  (cond
    [(null? lst) '()]
    [(equal? (car lst) atom) (cdr lst)]
    [else (cons (car lst) (my-rember atom (cdr lst)))]))

// ← new
(define (my-insertR new old lst)
  (cond
    [(null? lst) '()]
    [(equal? (car lst) old)
     (cons old (cons new (cdr lst)))]
    [else (cons (car lst) (my-insertR new old (cdr lst)))]))
```
The file now contains `my-insertR`, demonstrating multiple `cons` operations to inject data.

### Introduce the concept in isolation
Let's look at how we can use `cons` twice in a row to manually build a sequence of two elements onto an existing list.

```scheme
(cons 'x (cons 'y '(z)))
```

### Run it. Show the real output.
```
'(x y z)
```
This proves that nesting `cons` calls builds the list from right to left, putting 'x' in front of 'y', and 'y' in front of the rest of the list.

### Discard the throwaway example
The isolated `(cons 'x (cons 'y '(z)))` is discarded.

### Mechanical walkthrough
- `(define (my-insertR new old lst)` declares the function taking the `new` atom to insert, the `old` target atom, and the `lst`.
- `[(null? lst) '()]` is the exact same base case.
- `[(equal? (car lst) old)` checks if we found the target atom.
- `(cons old (cons new (cdr lst)))]` is the insertion logic. We **`cons`** the `new` atom onto the `(cdr lst)`, which is the rest of the list. Then we **`cons`** the `old` atom onto *that* result. Because we do not recurse further, this only happens at the first occurrence.
- `[else (cons (car lst) (my-insertR new old (cdr lst)))]` is the identical Second Commandment recursive branch we used in `my-rember` and `my-copy`.

Execution trace for `(my-insertR 'x 'b '(a b c))`:

1. `(my-insertR 'x 'b '(a b c))` — `lst` is not null, `car` is 'a', not equal to 'b'. Returns `(cons 'a (my-insertR 'x 'b '(b c)))`.
2. `(my-insertR 'x 'b '(b c))` — `lst` is not null, `car` is 'b', which equals 'b'. Returns `(cons 'b (cons 'x '(c)))`.
3. Unwind step 2: `(cons 'b '(x c))` evaluates to `(b x c)`.
4. Unwind step 1: `(cons 'a '(b x c))` evaluates to `(a b x c)`.

Everything is built with `cons`. We used TWO `cons` calls in the found case — one to keep `old`, one to insert `new`.

### CS Lens
This is **linked list insertion**. Also recognized in: DOM node insertion (`insertBefore`), text editor buffer modifications, DNA sequencing edits, splicing in video editing timelines.

### SE Lens
The alternative is using `append` to stick a sublist into the middle, but `append` forces a full traversal of the first argument. By using `cons`, we achieve an O(1) insertion at the current point in the traversal.

### Commands needed
None new.

### Run it. Show the real output.
Running `(my-insertR 'x 'b '(a b c))` yields:
```
'(a b x c)
```

### One sentence connecting this unit to what came immediately before
We have seen that `cons` is the ultimate list builder, but we must finally prove why its competitor, `append`, is forbidden inside the recursion.

## Concept Unit: Why `append` is Quadratic and Forbidden

### The Problem
When building a list, a developer might be tempted to use `append` to join the recursive result to a list containing the current element. We need to prove that doing this on every recursive step causes severe performance degradation, specifically **quadratic cost**, compared to `cons`.

### Project Change
- **Reference Source** — No reference counterpart.
- **Files affected** — `commandments.rkt` (modified)
- **Change type** — add
- **Location** — Below `my-insertR`.
- **Dependencies** — `racket`.

### The New Code
```scheme
(define (slow-copy lst)
  (if (null? lst)
      '()
      (append (list (car lst)) (slow-copy (cdr lst)))))
```

### The Updated Project
```scheme
(define (my-insertR new old lst)
  (cond
    [(null? lst) '()]
    [(equal? (car lst) old)
     (cons old (cons new (cdr lst)))]
    [else (cons (car lst) (my-insertR new old (cdr lst)))]))

// ← new
(define (slow-copy lst)
  (if (null? lst)
      '()
      (append (list (car lst)) (slow-copy (cdr lst)))))
```
The file now contains an `append`-based copy function alongside the correct `cons`-based versions.

### Introduce the concept in isolation
Let's see what `append` does when given two lists.

```scheme
(append '(1) '(2 3))
```

### Run it. Show the real output.
```
'(1 2 3)
```
This output proves that `append` correctly flattens the lists together. It creates the right shape, which is why it looks like a valid solution.

### Discard the throwaway example
The isolated `(append '(1) '(2 3))` line is discarded.

### Mechanical walkthrough
- `(define (slow-copy lst)` declares our new, inefficient copy function.
- `(append ...)` takes two lists and concatenates them.
- `(list (car lst))` wraps the current element in a new, single-element list. `append` requires all of its arguments to be lists, so we can't just pass `(car lst)` directly.
- `(slow-copy (cdr lst))` is the recursive call.

Here is the hidden timing trace that makes this dangerous. `append` works by traversing the entire first argument list to copy its cells.
When we use `append` in a recursion that reverses a list (a common beginner error) or builds up a large list argument-first, `append` traverses the continually growing accumulated list on *every single step*.
Even in our `slow-copy` where the first list is small, `append` forces an entirely unnecessary allocation of a new list just to hold `(car lst)` before tearing it apart again to join it. If `append` was used on the *recursive result* as the first argument, an N-element list would require N traversals, each taking N steps — a classic **quadratic cost** of $O(N^2)$.
By contrast, `cons` takes exactly 1 step (O(1)) because it simply creates a pointer to the existing tail.

### CS Lens
This is **algorithmic complexity (Big O Notation)**. Also recognized in: string concatenation inside a loop in Java/C# (why `StringBuilder` exists), bubble sort, unindexed SQL joins.

### SE Lens
The design principle is **mechanical sympathy** with the data structure. A linked list is designed to be built from back to front using `cons`. `append` is designed for joining two entirely separate, pre-computed lists. Using `append` inside a recursive step is structurally hostile to how linked lists are stored in memory. **The Second Commandment:** When recurring on a list and building a list result, always use `cons` to glue the head to the recursive result. Never use `list` in the recursive case. Never use `append` in the recursive case.

### Commands needed
None new.

### Run it. Show the real output.
Running `(slow-copy '(1 2 3))` yields:
```
'(1 2 3)
```
It returns the correct answer, which is exactly why the bug is dangerous — it fails silently in performance, not in correctness.

### One sentence connecting this unit to what came immediately before
With the Second Commandment proven, you can safely write any function that transforms or filters a list.

---

## Connect the Pieces
Let's trace a single value, the atom `'c`, through the entire `my-rember` process when we run `(my-rember 'b '(b c))`.
1. The list `'(b c)` is passed to `my-rember`.
2. The `cond` checks if the `car` (`'b`) equals `'b`. It does.
3. The function immediately returns the `cdr`, which is `'(c)`. The `'c` atom was never explicitly processed, touched, or `cons`ed; it survived intact simply because it was part of the tail that got passed back up.

## What breaks without this
If we violate the Second Commandment and use `list` in `my-rember`'s recursive case:
```scheme
(define (broken-rember atom lst)
  (cond
    [(null? lst) '()]
    [(equal? (car lst) atom) (cdr lst)]
    [else (list (car lst) (broken-rember atom (cdr lst)))]))
```
Running `(broken-rember 'b '(a b c))` yields:
```
'(a (c))
```
The `list` function wrapped our `'a` and the returned `'(c)` into a new, nested structure. Our flat list is ruined. Replacing `list` with `cons` restores the correct `'(a c)` output.

## Exercises
- Write `my-insertL`, which inserts `new` to the *left* of the first occurrence of `old`.
- Write `my-rember-all`, which removes *every* occurrence of `atom`, not just the first one. (Hint: what should the matching branch do instead of just returning `cdr`?)

## Definition of Done
- [x] A Racket file containing `broken-copy`, `my-copy`, `my-rember`, `my-insertR`, and `slow-copy`.
- [x] You have verified that `cons` flattens elements onto a list, while `list` nests them.
- [x] The Second Commandment is memorized.

```bash
git add commandments.rkt
git commit -m "Implement Second Commandment list builders to ensure flat O(1) list construction"
```
