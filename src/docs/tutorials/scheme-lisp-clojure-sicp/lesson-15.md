# Lesson 15: Association Lists — `lookup`, `newpair`, `extend`

The reader will implement association lists (a-lists) — the original Lisp key-value store — and the standard operations: `build` (create a pair), `lookup` (find a value by key), `extend` (add a new key-value pair), `update` (replace a value), and `remove-key`. They will also write a simple symbol table using an a-list, which is a concrete useful tool. The transferable problems: (1) an association list is a list of pairs — each pair is a (key . value) cons cell, and looking up a key means scanning the list linearly; (2) a-lists support a fundamental operation in almost every real Lisp system — the environment (variable bindings) is itself an a-list in many Scheme implementations; (3) the lookup pattern (scan until found or exhausted) is the same structural recursion you have been writing for six lessons, now applied to a useful data structure.

What you need to know first: Lessons 0-14 (all prior concepts through structural recursion, set operations, member?, subset?, higher-order functions, closures).

**Terms used in this lesson:**
- **define** — A special form in Scheme used to bind a name to a value or a function globally. It exists so we can reuse values and recursion without repeating the code.
- **cond** — A special form for multi-way conditional branching. It evaluates predicates one by one and executes the corresponding expression for the first one that is true, preventing nested `if` statements.
- **else** — A keyword used inside `cond` as the fallback branch when all other conditions fail, ensuring the conditional always returns a meaningful value.
- **quote (`'`)** — A syntax shorthand that tells Scheme to treat the following expression as literal data rather than code to evaluate, preventing evaluation of symbols and lists.
- **let** — A special form that creates local variable bindings within a specific scope. It evaluates expressions and binds them to names before evaluating its body, avoiding redundant computation.
- **if** — A special form for two-way conditional branching. It evaluates a predicate and evaluates the consequent if true, or the alternate if false.
- **#f** — The boolean literal for false in Scheme. It represents the concept of falsity or the absence of a value (such as a failed search).
- **Dotted pair (cons cell)** — The fundamental building block of Scheme data structures. A pair of exactly two memory locations, created by `cons`, typically written `(a . b)`. It exists to link data elements together.

**Objects and methods used:**

**build**
- *What it is:* A helper function to create a new key-value pair.
- *Implementation:* `(define (build key val) (cons key val))`
- *Its use:* Used to construct pairs that will be inserted into the association list.
- *Type:* User-defined function.
- *Responsibility:* Encapsulates the raw `cons` operation with meaningful names (`key` and `val`) to signify intent.
- *Depends on:* Two arguments: a key (usually a symbol) and a value of any type.
- *Connects to:* Calls `cons`. Called by `extend` and `update`.
- *Shape:* Internal implementation detail for pair creation.

**lookup**
- *What it is:* A function to retrieve a value from an association list based on a given key.
- *Implementation:* `(define (lookup key alist) ...)`
- *Its use:* Used to query the data structure to find the value associated with a key, or return `#f` if not found.
- *Type:* User-defined recursive function.
- *Responsibility:* Scans the list linearly, comparing the requested key to each pair's key, returning the corresponding value upon a match.
- *Depends on:* A key to search for and an association list to search within.
- *Connects to:* Calls `null?`, `equal?`, `caar`, `cdar`, `cdr`. Called by `env-lookup`.
- *Shape:* Public API surface for the association list data structure.

**extend**
- *What it is:* A function to prepend a new key-value pair to an association list.
- *Implementation:* `(define (extend key val alist) (cons (build key val) alist))`
- *Its use:* Used to add new entries or shadow existing entries in an environment.
- *Type:* User-defined function.
- *Responsibility:* Creates a new list node whose payload is the new key-value pair, pointing to the rest of the existing list.
- *Depends on:* A key, a value, and an existing association list.
- *Connects to:* Calls `build` and `cons`. Called by `env-extend`.
- *Shape:* Public API surface for modifying the association list (by creating a new one).

**update**
- *What it is:* A function to modify the first occurrence of a key in an association list.
- *Implementation:* `(define (update key val alist) ...)`
- *Its use:* Used when we want to change a value in place (structurally, by returning a new list with the replaced pair) without shadowing.
- *Type:* User-defined recursive function.
- *Responsibility:* Rebuilds the list up to the updated key, replacing that pair, and preserving the rest of the list.
- *Depends on:* A key, a new value, and an existing association list.
- *Connects to:* Calls `null?`, `equal?`, `caar`, `build`, `cons`, `car`, `cdr`.
- *Shape:* Public API surface for modifying existing entries.

**env-lookup**
- *What it is:* A specialized lookup function for an interpreter environment.
- *Implementation:* `(define (env-lookup name env) ...)`
- *Its use:* Resolves variable names to values in a symbol table, raising an error if unbound.
- *Type:* User-defined function.
- *Responsibility:* Wraps `lookup` with error handling to enforce that queried variables must exist.
- *Depends on:* A variable name and an environment (association list).
- *Connects to:* Calls `lookup` and `error`.
- *Shape:* Public API surface for the interpreter's symbol table.

**env-extend**
- *What it is:* A specialized extension function for an interpreter environment.
- *Implementation:* `(define (env-extend name val env) (extend name val env))`
- *Its use:* Adds a new variable binding to the current environment frame.
- *Type:* User-defined function.
- *Responsibility:* Directly delegates to `extend` to model variable shadowing in new scopes.
- *Depends on:* A variable name, a value, and an environment.
- *Connects to:* Calls `extend`.
- *Shape:* Public API surface for the interpreter's symbol table.

**Everything else in the file, not this lesson's subject but still explained:**

**cons**
- *What it is:* The primitive allocator that links two values.
- *Implementation:* `(cons a b)`
- *Its use:* Creates individual dotted pairs and links list nodes together.
- *Type:* Built-in procedure.
- *Responsibility:* Allocates a new cons cell in memory.
- *Depends on:* Any two Scheme values.
- *Connects to:* Called whenever list structure is built.
- *Shape:* Language primitive.

**car**
- *What it is:* Accessor for the first half of a cons cell.
- *Implementation:* `(car pair)`
- *Its use:* Retrieves the payload or the key-value pair from a list node.
- *Type:* Built-in procedure.
- *Responsibility:* Dereferences the first pointer of a cons cell.
- *Depends on:* A non-empty cons cell.
- *Connects to:* Evaluated as part of list traversal.
- *Shape:* Language primitive.

**cdr**
- *What it is:* Accessor for the second half of a cons cell.
- *Implementation:* `(cdr pair)`
- *Its use:* Retrieves the rest of a list or the value from a dotted pair.
- *Type:* Built-in procedure.
- *Responsibility:* Dereferences the second pointer of a cons cell.
- *Depends on:* A non-empty cons cell.
- *Connects to:* Evaluated to traverse lists.
- *Shape:* Language primitive.

**caar**
- *What it is:* Shorthand for `(car (car list))`.
- *Implementation:* `(caar alist)`
- *Its use:* Extracts the key from the first pair in an association list.
- *Type:* Built-in procedure.
- *Responsibility:* Performs two consecutive `car` operations.
- *Depends on:* A list whose first element is a cons cell.
- *Connects to:* Simplifies deep structure access.
- *Shape:* Language primitive.

**cdar**
- *What it is:* Shorthand for `(cdr (car list))`.
- *Implementation:* `(cdar alist)`
- *Its use:* Extracts the value from the first pair in an association list.
- *Type:* Built-in procedure.
- *Responsibility:* Performs a `car` followed by a `cdr`.
- *Depends on:* A list whose first element is a cons cell.
- *Connects to:* Simplifies deep structure access.
- *Shape:* Language primitive.

**null?**
- *What it is:* Predicate to test for the empty list.
- *Implementation:* `(null? val)`
- *Its use:* Serves as the base case condition for recursive list functions.
- *Type:* Built-in procedure.
- *Responsibility:* Returns `#t` if the argument is the empty list `()`, else `#f`.
- *Depends on:* Any Scheme value.
- *Connects to:* Used in `cond` branches to stop recursion.
- *Shape:* Language primitive.

**equal?**
- *What it is:* Deep equality predicate.
- *Implementation:* `(equal? a b)`
- *Its use:* Compares requested keys against keys stored in the association list.
- *Type:* Built-in procedure.
- *Responsibility:* Performs a structural comparison of two values, returning `#t` if they have the same contents.
- *Depends on:* Any two Scheme values.
- *Connects to:* Used in `cond` branches for matching.
- *Shape:* Language primitive.

**list**
- *What it is:* Variadic function to build a proper list.
- *Implementation:* `(list a b ...)`
- *Its use:* Builds a new list containing the provided elements.
- *Type:* Built-in procedure.
- *Responsibility:* Chains `cons` cells together, terminating with `'()`.
- *Depends on:* Any number of arguments.
- *Connects to:* Used to instantiate a list of one item in `update`.
- *Shape:* Language primitive.

**error**
- *What it is:* Function to halt execution and report a failure.
- *Implementation:* `(error 'symbol "message" value)`
- *Its use:* Aborts `env-lookup` when a requested variable is not found.
- *Type:* Built-in procedure.
- *Responsibility:* Throws an exception with the provided message and context.
- *Depends on:* A symbol indicating the source, a string message, and optional values.
- *Connects to:* Halts the program flow entirely.
- *Shape:* Language primitive.

## Concept Unit: Association Lists

### The Problem
We need a way to associate keys with values, like a dictionary or a map in other languages, using only the fundamental list structures we already understand. We need a format that allows storing and retrieving these mapped pairs.

### Introduce the concept in isolation
An association list is a list where each element is a dotted pair (a cons cell). We can create a simple one and inspect it. 

```scheme
(define sample-alist
  '((name . Alice)
    (age . 30)
    (city . Boston)))

(caar sample-alist)
```
Output:
```
'name
```
This proves that the `caar` of the list (the `car` of the first element) successfully extracts the key `'name` from the pair `(name . Alice)`. This structure is called an **association list**.

### Discard the throwaway example
The `sample-alist` definition above is discarded; it exists only to show the shape of the data structure.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are building our own data structure to support later interpreter steps.
- **Files affected:** `a-list.rkt` (new file)
- **Change type:** add
- **Location:** At the top of the new file.
- **Dependencies:** Standard Scheme/Racket library.

### The New Code
```scheme
(define sample-alist
  '((name . Alice)
    (age . 30)
    (city . Boston)))
```

### The Updated Project
```scheme
// ← new file: a-list.rkt
(define sample-alist
  '((name . Alice)
    (age . 30)
    (city . Boston)))
```
This creates a global constant holding an association list we can use to test our functions.

### Mechanical walkthrough
1. `define` — A special form in Scheme used to bind a name to a value globally.
2. `sample-alist` — The symbol being bound as a variable.
3. `'` — The quote syntax shorthand that tells Scheme to treat the following list as literal data, not a function call.
4. `((name . Alice) ...)` — A list containing three cons cells. Each inner parenthesis with a dot represents a dotted pair created by `cons`.

### CS Lens
This embodies the **Key-Value Store** concept. Data is stored by a unique identifier (the key) and retrieved using that same identifier.
Also recognized in: JSON objects, Python dictionaries, Redis databases, HTTP headers, DNS records.

### SE Lens
We chose to use a simple linear list of pairs rather than a hash table. The tradeoff is performance: lookup is O(N) instead of O(1). However, the benefit is immutability and simplicity — we can easily "shadow" variables by prepending to the list without permanently destroying older data, which is crucial for functional programming and scoping.

### Commands needed
No new terminal commands needed. This is standard Racket code run in DrRacket or via `racket a-list.rkt`.

### Run it. Show the real output.
```scheme
(caar sample-alist)
(cdar sample-alist)
```
Output:
```
'name
'Alice
```

### Connecting to what came immediately before
Now that we have a structure to hold pairs, we need a function to construct these pairs programmatically rather than writing literal dotted syntax.

## Concept Unit: `build`

### The Problem
Writing `(cons key val)` directly everywhere we want to make a pair exposes the raw memory allocation primitive. We want a function that explicitly says "I am making a key-value pair."

### Introduce the concept in isolation
We can write a function that wraps `cons`.

```scheme
((lambda (key val) (cons key val)) 'name 'Alice)
```
Output:
```
'(name . Alice)
```
This proves that applying `cons` to two symbols returns a dotted pair, not a two-element list.

### Discard the throwaway example
The raw lambda above is discarded; we will bind it to a name in the project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `a-list.rkt`
- **Change type:** add
- **Location:** Below `sample-alist`.
- **Dependencies:** None.

### The New Code
```scheme
(define (build key val) 
  (cons key val))
```

### The Updated Project
```scheme
(define sample-alist
  '((name . Alice)
    (age . 30)
    (city . Boston)))

(define (build key val) // ← new
  (cons key val))       // ← new
```
This adds the `build` function, which wraps `cons` to clearly communicate our intent to build a key-value pair.

### Mechanical walkthrough
1. `define` — Special form to bind a function globally.
2. `(build key val)` — Declares a function named `build` taking two parameters.
3. `cons` — The primitive allocator that links two values.
4. `key` — The first parameter, passed as the `car` of the new cell.
5. `val` — The second parameter, passed as the `cdr` of the new cell.

### CS Lens
This embodies the **Constructor** concept — a function dedicated to instantiating a specific data type.
Also recognized in: class constructors in OOP, factory functions, algebraic data type constructors in Haskell.

### SE Lens
This is the **Domain-Driven Naming** principle. The alternative was using `cons` directly inline. We chose `build` because `cons` means "allocate a memory cell", while `build` in our context means "create a key-value mapping". This reduces cognitive load when reading the code later.

### Commands needed
None.

### Run it. Show the real output.
```scheme
(build 'name 'Alice)
```
Output:
```
'(name . Alice)
```

### Connecting to what came immediately before
We can now build pairs programmatically. Next, we need a way to search an existing list to find the value for a given key.

## Concept Unit: `lookup`

### The Problem
Given a key and an association list, we need to scan the list and return the matching value, or `#f` if the key is not present.

### Introduce the concept in isolation
We can write a recursive scan.

```scheme
(define (find-first lst)
  (if (null? lst)
      #f
      (car lst)))

(find-first '(1 2 3))
```
Output:
```
1
```
This proves the base case behavior: it handles the empty list properly and otherwise inspects the first element.

### Discard the throwaway example
The `find-first` function is discarded; we will write the full lookup logic next.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `a-list.rkt`
- **Change type:** add
- **Location:** Below `build`.
- **Dependencies:** None.

### The New Code
```scheme
(define (lookup key alist)
  (cond
    [(null? alist) #f]
    [(equal? key (caar alist)) (cdar alist)]
    [else (lookup key (cdr alist))]))
```

### The Updated Project
```scheme
(define (build key val) 
  (cons key val))

(define (lookup key alist) // ← new
  (cond
    [(null? alist) #f]
    [(equal? key (caar alist)) (cdar alist)]
    [else (lookup key (cdr alist))]))
```
This defines `lookup`, a structural recursion that scans the association list to find a matching key.

### Mechanical walkthrough
1. `define` — Binds the function `lookup`.
2. `(lookup key alist)` — The function signature.
3. `cond` — Multi-way conditional branching.
4. `(null? alist)` — Predicate to test for the empty list. Base case for the recursion.
5. `#f` — The boolean literal for false, returned if the list is empty (key not found).
6. `equal?` — Deep equality predicate.
7. `key` — The item we are searching for.
8. `caar` — Shorthand for `(car (car list))`, extracting the key from the current pair.
9. `cdar` — Shorthand for `(cdr (car list))`, extracting the value from the current pair.
10. `else` — The fallback branch keyword.
11. `lookup` — Recursive call to the function itself.
12. `key` — Passed along unchanged.
13. `cdr` — Accessor for the second half of a cons cell, yielding the rest of the list.

**Execution trace for `(lookup 'age sample-alist)`:**
1. `alist` is `((name . Alice) (age . 30) (city . Boston))`. `(null? alist)` is `#f`.
2. `(caar alist)` is `'name`. `(equal? 'age 'name)` is `#f`.
3. Calls `(lookup 'age (cdr alist))`.
4. `alist` is `((age . 30) (city . Boston))`. `(null? alist)` is `#f`.
5. `(caar alist)` is `'age`. `(equal? 'age 'age)` is `#t`.
6. Returns `(cdar alist)`, which is `30`.

### CS Lens
This embodies **Linear Search** and **Structural Recursion**.
Also recognized in: linked list traversal, filesystem path resolution, iterating over arrays.

### SE Lens
We chose recursive linear search over a fast O(1) hash map because functional immutable data structures are easily shared and versioned. The tradeoff is worst-case O(N) time complexity for reads.

### Commands needed
None.

### Run it. Show the real output.
```scheme
(lookup 'name sample-alist)
(lookup 'age sample-alist)
(lookup 'email sample-alist)
```
Output:
```
'Alice
30
#f
```

### Connecting to what came immediately before
We can now read from the list. To make it dynamic, we must be able to add new keys.

## Concept Unit: `extend`

### The Problem
We need to add a new key-value pair to our association list. Instead of modifying the list in place (which Scheme lists discourage), we want to return a new list with the element prepended.

### Introduce the concept in isolation
We can prepend an item to a list using `cons`.

```scheme
(cons 1 '(2 3))
```
Output:
```
'(1 2 3)
```
This proves that `cons` can take an element and a list, yielding a new list with the element at the front.

### Discard the throwaway example
The integer list cons is discarded; we will use it with pairs.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `a-list.rkt`
- **Change type:** add
- **Location:** Below `lookup`.
- **Dependencies:** None.

### The New Code
```scheme
(define (extend key val alist)
  (cons (build key val) alist))
```

### The Updated Project
```scheme
(define (lookup key alist)
  (cond
    [(null? alist) #f]
    [(equal? key (caar alist)) (cdar alist)]
    [else (lookup key (cdr alist))]))

(define (extend key val alist) // ← new
  (cons (build key val) alist))
```
This defines `extend`, which builds a new pair and prepends it to the existing association list.

### Mechanical walkthrough
1. `define` — Binds the function `extend`.
2. `(extend key val alist)` — The function signature.
3. `cons` — The primitive allocator. It takes the new pair and makes it the head of the new list.
4. `build` — The helper function we defined earlier to create a key-value pair.
5. `key` — Passed to `build`.
6. `val` — Passed to `build`.
7. `alist` — Passed as the `cdr` to `cons`, forming the rest of the list.

### CS Lens
This embodies **Variable Shadowing**. Because we add to the front and `lookup` scans from the front, a newer key will be found before an older key with the same name.
Also recognized in: lexical scoping in compilers, CSS rule precedence, prototype chains in JavaScript.

### SE Lens
We chose to prepend rather than append (O(N)) or mutate. Prepending is O(1) and naturally implements shadowing, which is exactly how local variables shadow global ones in Lisp environments.

### Commands needed
None.

### Run it. Show the real output.
```scheme
(define updated (extend 'name 'Bob sample-alist))
(lookup 'name updated)
```
Output:
```
'Bob
```

### Connecting to what came immediately before
Prepending shadows existing keys. But what if we want to actually replace a value without shadowing it, structurally updating the list?

## Concept Unit: `update`

### The Problem
Sometimes we want to replace the first occurrence of a key in the list, preserving the order and size of the list, rather than accumulating shadowed duplicates at the front.

### Introduce the concept in isolation
We can use structural recursion to rebuild a list, substituting an element when we find it.

```scheme
(define (replace-first lst target replacement)
  (cond
    [(null? lst) '()]
    [(equal? (car lst) target) (cons replacement (cdr lst))]
    [else (cons (car lst) (replace-first (cdr lst) target replacement))]))

(replace-first '(a b c) 'b 'z)
```
Output:
```
'(a z c)
```
This proves that we can rebuild the spine of a list and replace a targeted element without modifying the original.

### Discard the throwaway example
The `replace-first` function is discarded; we apply the pattern to a-lists next.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `a-list.rkt`
- **Change type:** add
- **Location:** Below `extend`.
- **Dependencies:** None.

### The New Code
```scheme
(define (update key val alist)
  (cond
    [(null? alist) (list (build key val))]
    [(equal? key (caar alist))
     (cons (build key val) (cdr alist))]
    [else
     (cons (car alist) (update key val (cdr alist)))]))
```

### The Updated Project
```scheme
(define (extend key val alist)
  (cons (build key val) alist))

(define (update key val alist) // ← new
  (cond
    [(null? alist) (list (build key val))]
    [(equal? key (caar alist))
     (cons (build key val) (cdr alist))]
    [else
     (cons (car alist) (update key val (cdr alist)))]))
```
This defines `update`, which reconstructs the list, replacing the found key's pair with a new pair.

### Mechanical walkthrough
1. `define` — Binds the function `update`.
2. `cond` — Multi-way conditional branching.
3. `null?` — Predicate to test for the empty list. If empty, the key wasn't found.
4. `list` — Variadic function to build a proper list. We use it to create a one-element list containing the new pair if the key was missing.
5. `build` — Creates the new pair.
6. `equal?` — Deep equality predicate checking if the current pair's key matches.
7. `caar` — Extracts the current key.
8. `cons` — Used to attach the new pair to the rest of the list (`cdr alist`), or to attach the unchanged current pair (`car alist`) to the recursively rebuilt tail.
9. `cdr` — The rest of the list.
10. `else` — Fallback branch.
11. `car` — The current pair, kept unchanged.
12. `update` — Recursive call on the rest of the list.

**Execution trace for `(update 'age 31 sample-alist)`:**
1. `alist` is `((name . Alice) (age . 30) (city . Boston))`. Key `'age` ≠ `'name`.
2. Branch `else` fires: `(cons '(name . Alice) (update 'age 31 '((age . 30) (city . Boston))))`.
3. Recursive call: `alist` is `((age . 30) (city . Boston))`. Key `'age` = `'age`.
4. Branch 2 fires: `(cons '(age . 31) '((city . Boston)))` returns `((age . 31) (city . Boston))`.
5. Original `cons` links them: `((name . Alice) (age . 31) (city . Boston))`.

### CS Lens
This embodies **Persistent Data Structures**. We are not mutating the original list in place; we are returning a new list that shares unchanged structure (the tail) with the original.
Also recognized in: Git commit histories, React state updates, functional Redux reducers.

### SE Lens
We chose to rebuild the list spine to remain pure and functional, avoiding side effects like `set-car!`. The tradeoff is that updating an element at the end of the list requires allocating O(N) new cons cells to rebuild the entire path to it.

### Commands needed
None.

### Run it. Show the real output.
```scheme
(update 'age 31 sample-alist)
```
Output:
```
'((name . Alice) (age . 31) (city . Boston))
```

### Connecting to what came immediately before
We have standard functions to build, search, prepend, and structurally update an a-list. We can now use these to build a concrete application: an environment for an interpreter.

## Concept Unit: A Simple Symbol Table

### The Problem
An interpreter needs to store variables and look them up. If a variable is unbound, looking it up shouldn't just silently return `#f` (which is a valid variable value in Scheme); it should crash the program.

### Introduce the concept in isolation
We can use `let` to bind a value locally and test it.

```scheme
(let ([result 10])
  (if result
      result
      'failed))
```
Output:
```
10
```
This proves that `let` evaluates its binding and gives it a local name we can reuse without recomputing it.

### Discard the throwaway example
The simple `let` is discarded; we apply it to lookup results next.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `a-list.rkt`
- **Change type:** add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```scheme
(define empty-env '())

(define (env-lookup name env)
  (let ([result (lookup name env)])
    (if result
        result
        (error 'env-lookup "unbound variable" name))))

(define (env-extend name val env)
  (extend name val env))
```

### The Updated Project
```scheme
(define (update key val alist)
  ... )

; A simple symbol table for a tiny interpreter
(define empty-env '())

(define (env-lookup name env)
  (let ([result (lookup name env)])
    (if result
        result
        (error 'env-lookup "unbound variable" name))))

(define (env-extend name val env)
  (extend name val env))
```
This defines a domain-specific wrapper around our a-list functions to act as a strict environment for an interpreter.

### Mechanical walkthrough
1. `define` — Binds the variables.
2. `empty-env` — A domain-specific name for the empty list `'()`.
3. `env-lookup` — The wrapper function.
4. `let` — Special form to create a local binding.
5. `result` — The local variable holding the return value of `lookup`.
6. `lookup` — Our a-list search function.
7. `if` — Two-way conditional branch. In Scheme, any value other than `#f` is truthy.
8. `error` — Halts execution. It is called if `result` is `#f` (unbound).
9. `'env-lookup` — The symbol passed to `error` indicating the source of the crash.
10. `"unbound variable"` — The message string passed to `error`.
11. `name` — Passed to `error` to show which variable failed.
12. `env-extend` — Directly delegates to `extend`.

### CS Lens
This embodies a **Symbol Table** and **Environment Frames**.
Also recognized in: compilers (tracking declared variables), OS environment variables (`$PATH`), shell sessions.

### SE Lens
We engineered this using the **Adapter Pattern**. We wrap the generic `lookup` function to enforce domain-specific rules (variables must exist) without polluting the generic data structure code with interpreter logic.

### Commands needed
None.

### Run it. Show the real output.
```scheme
(define env1 (env-extend 'x 10 empty-env))
(define env2 (env-extend 'y 20 env1))
(define env3 (env-extend 'x 99 env2))

(env-lookup 'x env3)
(env-lookup 'y env3)
(env-lookup 'x env2)
```
Output:
```
99
20
10
```

### Connecting to what came immediately before
This completes our mapping from abstract data structure (a-list) to practical application (interpreter environment).

---

## Closing

This is the end of Module 1. You can now write recursive functions on lists or numbers, use higher-order functions, and implement data structures from scratch. The module proved that with just `cons`, `car`, `cdr`, `null?`, and recursion, you can build almost anything. Module 2 will give you better tools for the same problems: named let, letrec, tail calls, and continuations.

- **Connect the pieces:** When evaluating `(env-lookup 'x env3)`, the function delegates to `lookup`, which scans the association list `((x . 99) (y . 20) (x . 10))` built by consecutive calls to `extend` (which calls `build` and `cons`). `lookup` finds `'x` in the first pair, returns `99`, which `let` binds to `result`, passes the truthiness test in `if`, and is returned to the user.
- **What breaks without this:** If we delete the `error` check in `env-lookup` and just return `result`, an unbound variable lookup would return `#f`, which the interpreter might mistakenly treat as a valid user boolean instead of an invalid program state.
- **Exercises:**
  1. Write `remove-key` to remove the first pair with a matching key from an a-list.
  2. Write `merge-alists` to merge two a-lists, ensuring left-alist keys take priority over right-alist keys.
- **Definition of done:** 
  - [x] Implemented `build`, `lookup`, `extend`, and `update`.
  - [x] Built the `env-lookup` and `env-extend` adapters.
  - `git commit -m "Implement association lists and environment adapter"` (because we need a robust way to store scoped variable bindings before building the evaluation core).
