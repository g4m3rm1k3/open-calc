# Lesson 25: Recursion in miniKanren — `appendo` and `membero`

What you will build: You will write `membero` (is this element a member of this list?) and `appendo` (does appending list1 to list2 give list3?) as miniKanren relations. These are the two canonical recursive relations from The Reasoned Schemer. The transferable problems this lesson is actually about are how recursive relations in miniKanren use the same structural recursion pattern as Scheme functions, but with `conde` for the base and recursive cases; how `appendo` can determine any ONE of its three arguments given the other two; and how unification handles the structural pattern-matching that `car`/`cdr` did in functional code.

What you need to know first: Lessons 0–24 (all prior concepts through `run*`, `fresh`, `==`, `conde`, conjunction, disjunction, backtracking, and unification).

**Terms used in this lesson:**
- **run\*** — a miniKanren wrapper that executes a relational query, finding all possible valid assignments for its logic variables, and returns them as a Scheme list.
- **fresh** — a miniKanren form that introduces new, unbound logic variables into a given scope, which can then be unified with values or other variables.
- **== (unification)** — the fundamental operation in miniKanren that asserts two terms must be structurally equal, making variables take on values necessary to make the equality true.
- **conde** — the miniKanren equivalent of `cond`, which introduces disjunction (logical OR) by branching into multiple independent clauses, succeeding if any clause succeeds.
- **conjunction** — logical AND, achieved in miniKanren by placing multiple goals in sequence within the same `fresh` or `conde` clause; all goals must succeed for the clause to succeed.
- **disjunction** — logical OR, achieved by having multiple clauses inside a `conde`; the overall program explores every valid clause.
- **backtracking** — the engine's mechanism of returning to a previous choice point (like an alternative `conde` clause) when the current path fails or when asked for more answers.
- **unification** — the process of finding a substitution of values for variables that makes two logical terms identical.

**Objects and methods used:**

- **membero**
  - *What it is:* A miniKanren relation that succeeds if a given item is a member of a given list.
  - *Implementation:* A recursive function using `conde` and `fresh` to deconstruct the list via unification.
  - *Its use:* To conceptually check for membership, or to generate lists containing a specific item.
  - *Type:* A relational Scheme function `(membero x lst)`.
  - *Responsibility:* Asserts that `x` exists somewhere within the elements of `lst`.
  - *Depends on:* Two logic variables or concrete terms representing the element and the list.
  - *Connects to:* Calls `conde`, `fresh`, `==`, and recurses on `membero`.
  - *Shape:* A domain-level relational abstraction inside the logic program.

- **appendo**
  - *What it is:* A miniKanren relation that succeeds if appending the first two lists yields the third list.
  - *Implementation:* A recursive function using `conde` and `fresh` to unify the head and tail of the lists.
  - *Its use:* To append lists, split a list into parts, or compute a missing prefix/suffix.
  - *Type:* A relational Scheme function `(appendo l1 l2 l3)`.
  - *Responsibility:* Asserts the structural relationship that `l1` concatenated with `l2` is exactly `l3`.
  - *Depends on:* Three logic variables or concrete terms representing the two input lists and the combined list.
  - *Connects to:* Calls `conde`, `fresh`, `==`, and recurses on `appendo`.
  - *Shape:* A domain-level relational abstraction inside the logic program.

- **listo**
  - *What it is:* A miniKanren relation that succeeds if its argument is a proper list (ending in the empty list).
  - *Implementation:* A recursive function checking for the empty list or a pair whose tail is also a list.
  - *Its use:* To distinguish proper lists from dotted pairs, or to generate lists of increasing arbitrary length.
  - *Type:* A relational Scheme function `(listo lst)`.
  - *Responsibility:* Asserts that the sequence of cons cells in `lst` eventually terminates with `()`.
  - *Depends on:* A logic variable or concrete term.
  - *Connects to:* Calls `conde`, `fresh`, `==`, and recurses on `listo`.
  - *Shape:* A domain-level relational abstraction inside the logic program.

- **cons**
  - *What it is:* The fundamental list-building function in Scheme that creates a pair (a cons cell).
  - *Implementation:* `(cons head tail)` evaluates to a new memory cell pointing to `head` and `tail`.
  - *Its use:* In miniKanren, `cons` is used within unifications (e.g., `(== lst (cons head tail))`) to pattern-match and destruct or construct lists.
  - *Type:* A built-in Scheme function.
  - *Responsibility:* Combines two values into a pair.
  - *Depends on:* Two arguments: the element to become the `car` and the element to become the `cdr`.
  - *Connects to:* Used directly by `==` to specify the structural shape a logic variable must take.
  - *Shape:* A standard library primitive used throughout structural recursion.

- **list**
  - *What it is:* A variadic Scheme function that constructs a proper list from its arguments.
  - *Implementation:* Evaluates each argument and chains them using `cons`, terminating with `()`.
  - *Its use:* To build literal proper lists dynamically or structure output queries.
  - *Type:* A built-in Scheme function `(list arg ...)`.
  - *Responsibility:* Packages multiple disparate items into a single ordered collection.
  - *Depends on:* Any number of valid Scheme expressions.
  - *Connects to:* The underlying pair-allocation machinery.
  - *Shape:* A standard library primitive.

---

## Concept Unit: `membero` — the relational version of `member?`

### The Problem
We need to know if an element exists within a list. In functional Scheme, we wrote `member?` by checking if the list was empty, checking if the `car` matched our element, and if not, recursing on the `cdr`. In miniKanren, we don't have `if`, `car`, or `cdr`. We must write a relation that succeeds when an element is in a list, using only logical assertions, pattern matching (unification), and disjunction (`conde`).

### Introduce the concept in isolation
Let's see how we can express the idea that an element is at the head of a list using only `==` and `fresh`, without using `car` or `cdr`. 

```scheme
(require faster-miniKanren)

(run* (q)
  (fresh (rest)
    (== '(a b c) (cons 'a rest))
    (== q rest)))
```

Output:
```
'((b c))
```

This output proves that unifying a concrete list `'(a b c)` with a pattern `(cons 'a rest)` successfully destructures the list. The unification engine automatically assigns the tail `'(b c)` to the logic variable `rest`. This is how we extract the rest of a list in miniKanren.

### Discard the throwaway example
The one-off test of list destructuring above is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are defining fundamental relational abstractions for our logic programs.
- **Files affected:** `src/relations.scm` (created)
- **Change type:** add
- **Location:** At the top of the new file.
- **Dependencies:** Requires `faster-miniKanren`.

### The New Code
```scheme
(require faster-miniKanren)

(define (membero x lst)
  (conde
    [(fresh (rest)
       (== lst (cons x rest)))]
    [(fresh (head rest)
       (== lst (cons head rest))
       (membero x rest))]))
```

### The Updated Project
```scheme
// ← new file: src/relations.scm
(require faster-miniKanren)

(define (membero x lst)
  (conde
    [(fresh (rest)
       (== lst (cons x rest)))]
    [(fresh (head rest)
       (== lst (cons head rest))
       (membero x rest))]))
```
Our project now has a `membero` relation that can assert whether `x` is inside `lst`.

### Mechanical walkthrough

- `(define (membero x lst))` is a standard Scheme function definition that will return a miniKanren goal.
- `(conde ...)` establishes a disjunction: the relation succeeds if *either* of its branches succeeds. The overall engine will try all valid paths, branching the computation.
- `[(fresh (rest) ...)]` opens the first clause. The `fresh` form creates a new local logic variable called `rest`. `fresh` introduces new, unbound logic variables into a given scope, which can then be unified with values or other variables.
- `(== lst (cons x rest))` is the single goal in the first clause. `== (unification)` asserts two terms must be structurally equal. Here it states that `lst` is a pair whose first element is exactly `x`, and whose tail is whatever `rest` ends up being. If this succeeds, `x` is the head of the list!
- `[(fresh (head rest) ...)]` opens the second clause. It creates two new logic variables, `head` and `rest`.
- `(== lst (cons head rest))` destructs the list into its head and tail. Unlike functional Scheme where we'd explicitly call `(car lst)`, unification naturally unpacks it.
- `(membero x rest)` is a recursive call. If the list is structurally a pair (proven by the previous line), this line asserts that `x` must be a member of its tail. 

Let's trace a simple query: `(run* (q) (membero q '(a b c)))`

```
Iteration 1: evaluate (membero q '(a b c)).
  Clause 1: unify '(a b c) with (cons q rest). q becomes 'a, rest becomes '(b c). Succeeds! Result 1 is 'a.
  Clause 2: unify '(a b c) with (cons head rest). head becomes 'a, rest becomes '(b c).
Iteration 2: recurse into (membero q '(b c)).
  Clause 1: unify '(b c) with (cons q rest2). q becomes 'b, rest2 becomes '(c). Succeeds! Result 2 is 'b.
  Clause 2: unify '(b c) with (cons head2 rest2). head2 becomes 'b, rest2 becomes '(c).
Iteration 3: recurse into (membero q '(c)).
  Clause 1: unify '(c) with (cons q rest3). q becomes 'c, rest3 becomes '(). Succeeds! Result 3 is 'c.
  Clause 2: unify '(c) with (cons head3 rest3). head3 becomes 'c, rest3 becomes '().
Iteration 4: recurse into (membero q '()).
  Clause 1: unify '() with (cons q rest4). Fails! Empty list is not a pair.
  Clause 2: unify '() with (cons head4 rest4). Fails!
```
The final output is `(a b c)`, correctly extracting every member.

---

## Concept Unit: Running `membero` backward and sideways

### The Problem
In functional programming, `member?` takes two inputs and returns a boolean. If we wanted to know "what lists contain the element 'b'?", we would have to write a completely different, infinite-list-generating function. We need a way to run our relational `membero` backward, demonstrating the power of pure relations over directional functions.

### Introduce the concept in isolation
Let's ask miniKanren to fill in the blank for a list where the *tail* is known, but the head is unknown:

```scheme
(run 1 (q)
  (== q (cons 'unknown '(1 2))))
```

Output:
```
'((unknown 1 2))
```

This output proves that unification builds lists just as well as it destructs them. By supplying an unbound variable `q` and asserting it equals a `cons` of a symbol and a concrete list, unification fills in `q` with the fully realized list. We can use this bidirectional power.

### Discard the throwaway example
The list-building unification test is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `src/relations.scm` (modified)
- **Change type:** add
- **Location:** Below the `membero` definition.
- **Dependencies:** `membero` must be defined.

### The New Code
```scheme
(define (backward-membero-test)
  (run 3 (q) 
    (membero 'b q)))
```

### The Updated Project
```scheme
(define (membero x lst)
  (conde
    [(fresh (rest)
       (== lst (cons x rest)))]
    [(fresh (head rest)
       (== lst (cons head rest))
       (membero x rest))]))

// ← new
(define (backward-membero-test)
  (run 3 (q) 
    (membero 'b q)))
```
Our project now includes a function that asks for 3 distinct lists that contain the symbol `b`.

### Mechanical walkthrough

- `(run 3 (q) ...)` runs a query and asks for exactly 3 successful assignments for `q`. `run*` would loop forever because there are infinitely many lists containing 'b'. `run*` is a miniKanren wrapper that executes a relational query, finding all possible valid assignments.
- `(membero 'b q)` asks miniKanren to prove that `'b` is a member of the entirely unbound variable `q`. 

Trace of `(run 3 (q) (membero 'b q))`:

```
Iteration 1: evaluate (membero 'b q). 
  Clause 1: unify q with (cons 'b rest). q becomes (b . _0). Succeeds! Result 1 is (b . _0).
  Clause 2: unify q with (cons head rest) and recurse (membero 'b rest).
Iteration 2: inside (membero 'b rest).
  Clause 1: unify rest with (cons 'b rest2). q becomes (head b . rest2). Succeeds! Result 2 is (_0 b . _1).
  Clause 2: unify rest with (cons head2 rest2) and recurse (membero 'b rest2).
Iteration 3: inside (membero 'b rest2).
  Clause 1: unify rest2 with (cons 'b rest3). q becomes (head head2 b . rest3). Succeeds! Result 3 is (_0 _1 b . _2).
```

The output `((b . _0) (_0 b . _1) (_0 _1 b . _2))` shows three structural families of lists: lists where `b` is first, lists where `b` is second, and lists where `b` is third. The `_0`, `_1` etc. are unbound variables (they can be anything). This is the engine using `backtracking` (the engine's mechanism of returning to a previous choice point) to explore every valid path, generating data out of thin air to satisfy our relation.

---

## Concept Unit: `appendo` — the relational version of `append`

### The Problem
We need to concatenate two lists together into a third list. The standard functional `append` operates by taking `l1` and `l2`, recurring down `l1` until it hits the empty list, and then swapping in `l2`. We must port this structural recursion into a pure relation that asserts `l3` is the concatenation of `l1` and `l2`.

### Introduce the concept in isolation
Let's see how we can conceptually "append" an empty list to another list relationally.

```scheme
(run* (q)
  (fresh (l1 l2)
    (== l1 '())
    (== l2 '(3 4))
    (== q l2)))
```

Output:
```
'((3 4))
```

This output proves that when the first list is empty, the result of the concatenation is just the second list. This directly gives us our base case.

### Discard the throwaway example
The empty-list unification test is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `src/relations.scm` (modified)
- **Change type:** add
- **Location:** Below `backward-membero-test`.
- **Dependencies:** Requires `faster-miniKanren`.

### The New Code
```scheme
(define (appendo l1 l2 l3)
  (conde
    [(== l1 '()) 
     (== l2 l3)]
    [(fresh (head tail res)
       (== l1 (cons head tail))
       (== l3 (cons head res))
       (appendo tail l2 res))]))
```

### The Updated Project
```scheme
(define (backward-membero-test)
  (run 3 (q) 
    (membero 'b q)))

// ← new
(define (appendo l1 l2 l3)
  (conde
    [(== l1 '()) 
     (== l2 l3)]
    [(fresh (head tail res)
       (== l1 (cons head tail))
       (== l3 (cons head res))
       (appendo tail l2 res))]))
```
We now have `appendo`, a relation that holds true if `l1` appended to `l2` equals `l3`.

### Mechanical walkthrough

- `(define (appendo l1 l2 l3))` takes three lists. `appendo` is a miniKanren relation that succeeds if appending the first two lists yields the third list.
- `(conde ...)` branches the logic for the base case and the recursive case.
- `[(== l1 '()) (== l2 l3)]` is the base case clause. It is a `conjunction` (logical AND). It asserts that IF `l1` is empty, THEN `l3` must equal `l2`. 
- `[(fresh (head tail res) ...)]` opens the recursive case, minting three new variables.
- `(== l1 (cons head tail))` asserts that `l1` is a pair, binding its first element to `head` and the rest to `tail`.
- `(== l3 (cons head res))` asserts that `l3` is a pair, and crucially, its first element is the *same* `head` as `l1`. The rest of `l3` is assigned to `res`.
- `(appendo tail l2 res)` recurses, asserting that appending the `tail` of `l1` to `l2` yields `res` (the tail of `l3`).

Trace for `(run* (q) (appendo '(1) '(2) q))`:

```
Iteration 1: evaluate (appendo '(1) '(2) q).
  Clause 1: unify '(1) with '(). Fails!
  Clause 2: unify '(1) with (cons head tail). head becomes 1, tail becomes '().
            unify q with (cons 1 res).
Iteration 2: recurse into (appendo '() '(2) res).
  Clause 1: unify '() with '(). Succeeds! 
            unify '(2) with res. res becomes '(2).
  Clause 2: unify '() with (cons head2 tail2). Fails!
Result: q is (cons 1 '(2)), which is '(1 2).
```

---

## Concept Unit: Why `appendo` is more powerful than `append`

### The Problem
We have a relational `appendo`, but so far we've only used it like standard `append`: giving it `l1` and `l2` to produce `l3`. We need to use `appendo` in ways `append` cannot handle, to prove why relational programming is a distinct paradigm. We want to ask "what did I append to `'(1 2)` to get `'(1 2 3 4)`?", and "what are all the ways to split `'(1 2 3)`?".

### Introduce the concept in isolation
Let's show that unification can solve for missing internal pieces. 

```scheme
(run* (q)
  (== '(1 2 3 4) (cons 1 (cons 2 q))))
```

Output:
```
'((3 4))
```

This output proves that unification can peer deep inside a structure and deduce the exact missing tail required to make two terms structurally identical.

### Discard the throwaway example
The internal unification test is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `src/relations.scm` (modified)
- **Change type:** add
- **Location:** Below `appendo`.
- **Dependencies:** Requires `appendo` and `list`.

### The New Code
```scheme
(define (appendo-sideways-test)
  (run* (q) 
    (appendo '(1 2) q '(1 2 3 4))))

(define (appendo-split-test)
  (run* (q)
    (fresh (l1 l2)
      (appendo l1 l2 '(1 2 3))
      (== q (list l1 l2)))))
```

### The Updated Project
```scheme
(define (appendo l1 l2 l3)
  (conde
    [(== l1 '()) (== l2 l3)]
    [(fresh (head tail res)
       (== l1 (cons head tail))
       (== l3 (cons head res))
       (appendo tail l2 res))]))

// ← new
(define (appendo-sideways-test)
  (run* (q) 
    (appendo '(1 2) q '(1 2 3 4))))

(define (appendo-split-test)
  (run* (q)
    (fresh (l1 l2)
      (appendo l1 l2 '(1 2 3))
      (== q (list l1 l2)))))
```
Our project now includes tests that run `appendo` with its arguments missing in different places, proving it is fully multidirectional.

### Mechanical walkthrough

- `(appendo '(1 2) q '(1 2 3 4))` inside `appendo-sideways-test` leaves the second argument unbound. The engine will destructure `l1` and `l3` simultaneously until `l1` is empty, at which point the base case `(== l2 l3)` unifies `q` with the remainder of `l3`, which is `'(3 4)`.
- `(fresh (l1 l2) ...)` creates two unbound variables to represent the split parts.
- `(appendo l1 l2 '(1 2 3))` asks the engine to find *any* `l1` and `l2` that append to make `'(1 2 3)`. Because `l1` can either be empty (clause 1) or a pair (clause 2), `conde` branches and explores *both* paths at every step.
- `(== q (list l1 l2))` bundles the two discovered lists into a single pair so they can be returned by `run*`. `list` is a variadic Scheme function that constructs a proper list from its arguments.

The output of `appendo-split-test` is `((() (1 2 3)) ((1) (2 3)) ((1 2) (3)) ((1 2 3) ()))`. 
The `append function` takes `l1` and `l2` and produces `l3` (one direction only). The `appendo relation` can determine any argument given the other two. It generated all possible splits of a list — a computation that would require explicit, stateful algorithmic programming in a functional language!

---

## Concept Unit: Writing `listo` — generating proper lists

### The Problem
We have seen dotted pairs like `(b . _0)` returned from our queries. A dotted pair is an improper list (it does not end in `()`). We need a relation that succeeds only if its argument is a proper list, and we need to use it to generate pure proper lists.

### Introduce the concept in isolation
Let's see what happens if we assert that the tail of a list is explicitly the empty list.

```scheme
(run* (q)
  (fresh (head tail)
    (== q (cons head tail))
    (== tail '())))
```

Output:
```
'((_0))
```

This output proves that constraining the tail of a pair to be `()` restricts the shape to a proper list of exactly one element. If we recursively constrain tails to eventually be `()`, we constrain the structure to proper lists of any length.

### Discard the throwaway example
The proper list shape test is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `src/relations.scm` (modified)
- **Change type:** add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```scheme
(define (listo lst)
  (conde
    [(== lst '())]
    [(fresh (head tail)
       (== lst (cons head tail))
       (listo tail))]))
```

### The Updated Project
```scheme
(define (appendo-split-test)
  (run* (q)
    (fresh (l1 l2)
      (appendo l1 l2 '(1 2 3))
      (== q (list l1 l2)))))

// ← new
(define (listo lst)
  (conde
    [(== lst '())]
    [(fresh (head tail)
       (== lst (cons head tail))
       (listo tail))]))
```
We now have `listo`, which proves whether `lst` is a proper list.

### Mechanical walkthrough

- `(define (listo lst))` takes a single argument. `listo` is a miniKanren relation that succeeds if its argument is a proper list.
- `[(== lst '())]` is the base case. The empty list is trivially a proper list. If `lst` is `()`, this succeeds.
- `[(fresh (head tail) ...)]` opens the recursive case. 
- `(== lst (cons head tail))` enforces that `lst` is at least one cons cell long.
- `(listo tail)` recurses, asserting that the `tail` must also satisfy `listo`.

Trace of `(run 4 (q) (listo q))`:

```
Iteration 1: evaluate (listo q).
  Clause 1: unify q with '(). Succeeds! Result 1 is ().
  Clause 2: unify q with (cons head tail) and recurse into (listo tail).
Iteration 2: inside (listo tail).
  Clause 1: unify tail with '(). q becomes (head . ()), which is (head). Succeeds! Result 2 is (_0).
  Clause 2: unify tail with (cons head2 tail2) and recurse into (listo tail2).
Iteration 3: inside (listo tail2).
  Clause 1: unify tail2 with '(). q becomes (head head2). Succeeds! Result 3 is (_0 _1).
  Clause 2: unify tail2 with (cons head3 tail3) and recurse into (listo tail3).
Iteration 4: inside (listo tail3).
  Clause 1: unify tail3 with '(). q becomes (head head2 head3). Succeeds! Result 4 is (_0 _1 _2).
```

Running `listo` with an unconstrained `q` asks miniKanren to generate things that satisfy the relation. It starts with the base case (`()`), then tries one cons cell ending in the base case `(_0)`, then two `(_0 _1)`, and so on, generating increasingly long proper lists. 

`membero`, `appendo`, and `listo` are the three canonical relations from *The Reasoned Schemer*. They demonstrate that structural recursion plus `conde` is all you need for full relational programming. 

In Lesson 26, we will see the most mind-bending use: running entire programs backward to generate inputs that produce a desired output. Exercises for this lesson include writing `lengtho` (q is a list of length n) and `reverseo` (l2 is the reverse of l1).
