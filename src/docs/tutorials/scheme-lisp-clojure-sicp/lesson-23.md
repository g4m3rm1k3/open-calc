# Lesson 23: Relations, Not Functions — miniKanren Basics

What you will build:
The reader will install the `faster-miniKanren` package in Racket and write their first logic programs using `run`, `fresh`, and `==`. The transferable problems this lesson tackles are unification — the core algorithmic mechanism that makes two terms equal by finding values for logic variables — and the fundamental shift from functional programming ("compute this value") to relational programming ("describe what is true"). You will understand how a logic variable represents an unknown that receives a value through unification, and how `run` finds all values that satisfy a query.

What you need to know first:
Lessons 0–22 (all prior concepts through structural recursion, higher-order functions, closures, streams, let/letrec).

Terms used in this lesson:
- **Function** — a mapping from inputs to exactly one output. Exists to perform a single-direction computation where inputs are fully known and the result is computed.
- **Relation** — a description of a truth that may hold for many combinations of values. Exists to express constraints that can run in multiple directions (e.g., asking what inputs produce a known output).
- **Logic variable** — an unknown that can be given a value through unification. Exists to represent a placeholder in a relational query, entirely different from a lexical binding like `let`.
- **Unification** — the algorithm that makes two terms equal by finding values for logic variables. Exists as the core engine of logic programming, structurally aligning two expressions.
- **Reified variable** — a logic variable that remains unconstrained when a query finishes, printed with a `_` prefix (like `_0`). Exists to show that any value could satisfy the relation at that position.

Objects and methods used:
- **`faster-miniKanren`**
  - *What it is:* A complete logic programming system embedded in Scheme.
  - *Implementation:* An installable Racket package that provides macros and functions for relational programming.
  - *Its use:* We use it to write logic programs directly inside our Racket project.
  - *Type:* Racket package.
  - *Responsibility:* Provides the core relational forms and a unification engine to solve logic queries.
  - *Depends on:* Racket's macro system to extend the language.
  - *Connects to:* App code that requires it and evaluates relational queries.
  - *Shape:* A third-party library dependency.
- **`run*`**
  - *What it is:* The query engine interface for miniKanren.
  - *Implementation:* A macro `(run* (var ...) goal ...)` that evaluates goals and returns a list of results.
  - *Its use:* We use it to ask "what values of the logic variable make these goals true?" and get ALL answers.
  - *Type:* Macro.
  - *Responsibility:* Executes a logic program, collecting every satisfying value for the query variables.
  - *Depends on:* One or more logic variables to query, and one or more goals to satisfy.
  - *Connects to:* The miniKanren constraint solver internally; returns a Scheme list to the caller.
  - *Shape:* The boundary between functional Scheme and relational miniKanren.
- **`run`**
  - *What it is:* A bounded version of the query engine.
  - *Implementation:* A macro `(run n (var ...) goal ...)` that evaluates goals and returns at most `n` results.
  - *Its use:* We use it to limit the number of answers from infinite relations so they don't run forever.
  - *Type:* Macro.
  - *Responsibility:* Executes a logic program, stopping after finding `n` satisfying values.
  - *Depends on:* An integer limit `n`, query variables, and goals.
  - *Connects to:* The miniKanren search stream, forcing only the first `n` elements.
  - *Shape:* A bounded query boundary.
- **`fresh`**
  - *What it is:* The form that introduces new, unbound logic variables.
  - *Implementation:* A macro `(fresh (var ...) goal ...)` creating locally scoped logic variables.
  - *Its use:* We use it to create unknowns that we can unify with other values or variables.
  - *Type:* Macro.
  - *Responsibility:* Allocates new logic variables and extends the current substitution environment for the nested goals.
  - *Depends on:* Names to bind as logic variables, and goals to evaluate in their scope.
  - *Connects to:* The unification engine which will eventually constrain these variables.
  - *Shape:* A lexical scope for logic variables.
- **`==`**
  - *What it is:* The unification operator.
  - *Implementation:* A function/macro `(== u v)` that returns a goal which succeeds if `u` and `v` can unify.
  - *Its use:* We use it to assert that two terms are equal, structurally, binding variables as needed.
  - *Type:* Goal constructor.
  - *Responsibility:* Attempts to make two terms structurally identical, updating the substitution if successful, or failing if impossible.
  - *Depends on:* Two terms (can be constants, structures, or logic variables).
  - *Connects to:* The active substitution state of the `run` block.
  - *Shape:* The fundamental primitive goal of miniKanren.
- **`succeed`**
  - *What it is:* The always-true goal.
  - *Implementation:* A predefined goal in miniKanren that always succeeds without changing substitutions.
  - *Its use:* We use it as a base case that trivially satisfies a query.
  - *Type:* Goal.
  - *Responsibility:* Succeeds immediately, akin to `#t` in boolean logic.
  - *Depends on:* Nothing.
  - *Connects to:* The search stream, returning it unchanged.
  - *Shape:* A primitive base case.
- **`fail`**
  - *What it is:* The always-false goal.
  - *Implementation:* A predefined goal in miniKanren that always fails, emptying the search stream.
  - *Its use:* We use it as a base case that rejects a query path.
  - *Type:* Goal.
  - *Responsibility:* Fails immediately, akin to `#f` in boolean logic.
  - *Depends on:* Nothing.
  - *Connects to:* The search stream, terminating the current branch.
  - *Shape:* A primitive base case.

**Everything else in the file, not this lesson's subject but still explained:**
- **`list`**
  - *What it is:* The standard Scheme list constructor.
  - *Implementation:* A variadic function `(list a b ...)` returning a linked list.
  - *Its use:* Used here to build structural shapes to demonstrate structural unification.
  - *Type:* Function.
  - *Responsibility:* Allocates a new cons-cell chain containing the provided elements.
  - *Depends on:* The elements to include.
  - *Connects to:* Unification, which traverses these lists element by element.
  - *Shape:* A standard library data constructor.
- **`membero`**
  - *What it is:* A relational goal asserting list membership.
  - *Implementation:* A function/macro `(membero item lst)`.
  - *Its use:* Used as a black box here to demonstrate returning multiple discrete answers in a query.
  - *Type:* Goal.
  - *Responsibility:* Succeeds if `item` unifies with any element structurally inside `lst`.
  - *Depends on:* An item (often a logic variable) and a list.
  - *Connects to:* The search stream, producing multiple successful paths if multiple elements match.
  - *Shape:* A standard relation from the library.
- **`quote` / `'`**
  - *What it is:* Scheme's literal data syntax.
  - *Implementation:* A special form `'(1 2 3)` preventing evaluation.
  - *Its use:* Creates raw lists of data to pass into unification without trying to call `1` as a function.
  - *Type:* Core syntax.
  - *Responsibility:* Returns data as-is without evaluating it as code.
  - *Depends on:* The s-expression to quote.
  - *Connects to:* The evaluator.
  - *Shape:* Fundamental language construct.

## Concept Unit: The mental model shift — functions vs relations

### The Problem
We are accustomed to functional programming, where a computation goes in exactly one direction: inputs go in, and one output comes out. But many real-world problems are relational constraints: "x and y must be double each other." We need a way to declare constraints that the computer solves, rather than step-by-step instructions.

### Commands needed
To make this unit real, install the package in DrRacket:
1. Open DrRacket
2. Go to File -> Install Package...
3. Type: `faster-miniKanren`
4. Click Install

### Introduce the concept in isolation
To see the difference, let's look at standard functional Racket first.

```scheme
(define (double x) (* 2 x))
(double 5)
```

Running this yields `10`. This is a **function** computing an output from an input. It only works one way. If we want to know what number gives `10`, `(double)` cannot help us directly; we'd have to write a separate `(halve x)` function.

### Discard the throwaway example
We discard the `double` function; it was just to prove how one-way functional programming is. It will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are starting a new logic programming file.
- **Files affected**: Created `lesson23.rkt`.
- **Change type**: add.
- **Location**: Top of the new file.
- **Dependencies**: The `faster-miniKanren` package must be installed in DrRacket.

### The New Code
```scheme
#lang racket
(require faster-miniKanren)
```

### The Updated Project
```scheme
// ← new
#lang racket
(require faster-miniKanren)
```
Our new file now declares it's a Racket program and brings in the logic programming tools we will use to write relations instead of functions.

### Mechanical walkthrough
- `#lang` — A language declaration directive in Racket.
- `racket` — Specifies we are using the standard Racket language dialect.
- `require` — Racket's module import form, bringing external library bindings into the current scope.
- `faster-miniKanren` — The package providing the relational operators and unification engine we just installed.

### CS Lens
This is the shift from Imperative/Functional to Declarative Logic Programming. Instead of providing the algorithm to compute a result, we provide the truths (relations) and the language's internal solver discovers the matching values. Also recognized in: SQL query planners, constraint solvers for UI layouts, type inference engines in compilers, and regular expression engines finding matches.

### SE Lens
Why use a library instead of writing a new language like Prolog? By embedding miniKanren in Scheme, we can mix functional and relational code freely. We don't have to rewrite our entire application in a logic language just to solve one constraint problem. The tradeoff is that our logic programs inherit Scheme's parenthesis-heavy syntax instead of having a bespoke declarative syntax.

### Run it
The code runs with no output, successfully loading the library.

### Connecting sentence
With the relational engine imported, we can ask our first multi-directional question using logic variables.

## Concept Unit: `run`, `fresh`, and `==`

### The Problem
We need to actually query the relational engine to find answers to constraints. We need to introduce unknowns, define relationships between them, and ask the system for the valid values.

### Introduce the concept in isolation
We start with a simple constraint: an unknown `q` must equal `5`.

```scheme
(run* (q)
  (== q 5))
```

Running this yields `'( (5) )`. This proves that the **query engine** successfully unified our logic variable `q` with the literal `5`, returning it inside a list of answers.

### Discard the throwaway example
We discard this tiny query; it was just to prove the shape of a relational call. It will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition.
- **Files affected**: `lesson23.rkt`.
- **Change type**: add.
- **Location**: Appended to the bottom of the file.
- **Dependencies**: The `faster-miniKanren` package loaded in the previous unit.

### The New Code
```scheme
(run* (q)
  (fresh (x)
    (== x 3)
    (== q x)))

(run* (q)
  (== q '(1 2 3)))
```

### The Updated Project
```scheme
#lang racket
(require faster-miniKanren)

(run* (q) // ← new
  (fresh (x) // ← new
    (== x 3) // ← new
    (== q x))) // ← new
    
(run* (q) // ← new
  (== q '(1 2 3))) // ← new
```
We have added two relational queries that introduce logic variables and use unification to make them equal to values.

### Mechanical walkthrough
- `run*` — The query engine macro executing a logic program and collecting every satisfying value for the query variables.
- `(q)` — The list of query variables that `run*` will return values for.
- `fresh` — The form introducing locally scoped, unbound logic variables.
- `(x)` — The list of newly allocated logic variables for this scope.
- `==` — The unification operator attempting to make two terms structurally identical.
- `x` — Our logic variable being unified with `3`.
- `3` — A literal number.
- `==` — The unification operator, again, attempting to make two terms structurally identical.
- `q` — The query variable.
- `x` — The logic variable (now unified to 3) being unified with `q`.
- `run*` — The query engine macro, again, starting a second independent query.
- `(q)` — The query variable list for the second query.
- `==` — The unification operator.
- `q` — The query variable.
- `'` — The quote operator, preventing evaluation of the list.
- `(1 2 3)` — A literal list of three numbers.

### CS Lens
This introduces logic programming queries. `run*` bridges the functional world (returning a normal list of answers) and the logic world (evaluating constraints). The `fresh` form is equivalent to existential quantification (∃x) in formal logic: "there exists some x such that...". Also recognized in: Z3 solver assertions, Prolog queries, and formal verification frameworks.

### SE Lens
Notice that `==` is not an assignment like `=`. It is a symmetric assertion: `(== q x)` and `(== x q)` mean exactly the same thing. This eliminates the entire category of "order of assignment" bugs, but the tradeoff is that we must carefully structure constraints so the solver can efficiently navigate the search space.

### Commands needed
None.

### Run it
Running the file yields:
```scheme
'( (3) )
'( ((1 2 3)) )
```

### Connecting sentence
While `==` handles direct constants easily, its true power lies in structurally unpacking complex data through the unification algorithm.

## Concept Unit: Unification — what `==` actually does

### The Problem
If `==` were just an equality check, it wouldn't be very useful. We need a way to describe the shape of data and let the logic engine figure out the missing pieces inside it.

### Introduce the concept in isolation
We can attempt to unify two literal constants directly without variables.

```scheme
(run* (q) (== 1 1))
(run* (q) (== 1 2))
```

Running the first yields `'(_0)`. Because `1` equals `1`, the query succeeds, but `q` was never mentioned in the constraints, so it remains a free variable. Running the second yields `'()`. Because `1` cannot equal `2`, the goal fails entirely, returning zero answers. 

### Discard the throwaway example
We discard these trivial unifications; they were just to prove success and failure. They will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition.
- **Files affected**: `lesson23.rkt`.
- **Change type**: add.
- **Location**: Appended to the bottom of the file.
- **Dependencies**: None.

### The New Code
```scheme
(run* (q) (== q 42))

(run* (q)
  (fresh (x)
    (== q x)
    (== x 'hello)))

(run* (q)
  (== q (list 1 2 3)))

(run* (q)
  (fresh (x)
    (== (list 1 x 3) (list 1 2 3))
    (== q x)))
```

### The Updated Project
```scheme
#lang racket
(require faster-miniKanren)

; ...previous queries...

(run* (q) (== q 42)) // ← new

(run* (q) // ← new
  (fresh (x) // ← new
    (== q x) // ← new
    (== x 'hello))) // ← new

(run* (q) // ← new
  (== q (list 1 2 3))) // ← new

(run* (q) // ← new
  (fresh (x) // ← new
    (== (list 1 x 3) (list 1 2 3)) // ← new
    (== q x))) // ← new
```
We have added a progression of unification goals that show variables matching constants, variables matching variables, and finally, structures matching structures.

### Mechanical walkthrough
- `run*` — The query engine macro executing a logic program and collecting every satisfying value for the query variables.
- `(q)` — The list of query variables.
- `==` — The unification operator attempting to make two terms structurally identical.
- `q` — The query variable.
- `42` — A literal integer.
- `run*` — The query engine macro, again.
- `(q)` — The query variable list.
- `fresh` — The form introducing locally scoped logic variables.
- `(x)` — The newly allocated logic variable.
- `==` — The unification operator.
- `q` — The query variable.
- `x` — The inner logic variable.
- `==` — The unification operator.
- `x` — The inner logic variable.
- `'` — The quote operator.
- `hello` — A literal symbol.
- `run*` — The query engine macro.
- `(q)` — The query variable list.
- `==` — The unification operator.
- `q` — The query variable.
- `list` — The standard Scheme list constructor function, allocating a cons-cell chain.
- `1` — A literal integer.
- `2` — A literal integer.
- `3` — A literal integer.
- `run*` — The query engine macro.
- `(q)` — The query variable list.
- `fresh` — The form introducing locally scoped logic variables.
- `(x)` — The inner logic variable.
- `==` — The unification operator.
- `list` — The standard Scheme list constructor function.
- `1` — A literal integer.
- `x` — The inner logic variable.
- `3` — A literal integer.
- `list` — The standard Scheme list constructor function.
- `1` — A literal integer.
- `2` — A literal integer.
- `3` — A literal integer.
- `==` — The unification operator.
- `q` — The query variable.
- `x` — The inner logic variable, now constrained.

1. `(== 1 1)` — The solver aligns the lists element by element, and the first elements match perfectly; no substitutions needed.
2. `(== x 2)` — The second elements are a variable and a constant. Unification succeeds by binding `x` to `2`.
3. `(== 3 3)` — The third elements match perfectly.
4. `(== q x)` — Now that `x` is `2`, `q` unifies with `2` as well.

### CS Lens
This is the Unification Algorithm, famously implemented by J.A. Robinson in 1965. It is the algorithm that determines if two syntactic expressions can be made identical by substituting variables. Also recognized in: Hindley-Milner type inference (which unifies type variables), logic programming languages like Prolog, and theorem provers.

### SE Lens
Structural unification gives us two-way data flow. In standard programming, extracting `2` from the middle of a list requires writing specific index accessors `(cadr lst)`. With unification, we just declare a template `(list 1 x 3)` and the engine performs the extraction for us. The tradeoff is performance: full unification is computationally heavier than direct memory access.

### Commands needed
None.

### Run it
Running the code yields:
```scheme
'( (42) )
'( (hello) )
'( ((1 2 3)) )
'( (2) )
```

### Connecting sentence
The engine can return all valid answers, but if a relation can generate infinite valid answers, asking for all of them is dangerous.

## Concept Unit: `run` vs `run*` — limiting the number of answers

### The Problem
Some relational queries have an infinite number of valid answers (e.g., "what lists have a length greater than 5?"). If we use a query engine that asks for all of them, the program will hang indefinitely. We need a way to cap the search.

### Introduce the concept in isolation
We will use `membero`, a relational goal that asserts a logic variable is a member of a list. When paired with `run*`, it returns every matching element.

```scheme
(run* (q)
  (membero q '(1 2 3)))
```

Running this yields `'(1 2 3)`. This proves the engine successfully found three distinct values for `q` that satisfy the membership constraint. 

### Discard the throwaway example
We discard this exhaustive query; it was just to prove multiple answers exist. It will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition.
- **Files affected**: `lesson23.rkt`.
- **Change type**: add.
- **Location**: Appended to the bottom of the file.
- **Dependencies**: None.

### The New Code
```scheme
(run 2 (q)
  (membero q '(1 2 3)))
```

### The Updated Project
```scheme
#lang racket
(require faster-miniKanren)

; ...previous queries...

(run 2 (q) // ← new
  (membero q '(1 2 3))) // ← new
```
We have added a query that bounds the engine to at most two answers, regardless of how many more exist.

### Mechanical walkthrough
- `run` — A bounded version of the query engine macro, stopping after finding a specific number of satisfying values.
- `2` — The integer limit capping the maximum number of answers.
- `(q)` — The list of query variables.
- `membero` — A relational goal asserting list membership, succeeding if `q` unifies with any element.
- `q` — The query variable.
- `'` — The quote operator, preventing evaluation.
- `(1 2 3)` — A literal list of three integers.

### CS Lens
This demonstrates lazy evaluation of search streams. miniKanren computes answers one at a time yielding to the caller. `run*` forces the stream until exhaustion, while `run n` pulls only `n` items and stops. Also recognized in: Python generators (`yield`), RxJS Observables (take(n)), and Haskell's infinite lists.

### SE Lens
Bounding infinite search spaces is critical for robust system design. When exposing logic queries to a user interface or an API, we never use `run*` on unbounded constraints because a malicious or accidental query could cause a denial of service (DoS). The tradeoff is that `run 2` may silently truncate valid answers, so the developer must intentionally choose pagination over completeness.

### Commands needed
None.

### Run it
Running the code yields:
```scheme
'( (1 2) )
```

### Connecting sentence
Sometimes, a query finishes but leaves some variables unconstrained; we need to understand how the system represents an unknown that could be anything.

## Concept Unit: The `_` wildcard and reified logic variables

### The Problem
If a constraint doesn't force a variable to equal a specific value, what is its answer? If `q` must be a list of two elements, but we never say what those elements are, the engine needs a notation to show that they are still unknowns.

### Introduce the concept in isolation
We define `q` as a list of two fresh variables, `x` and `y`, but give them no other constraints.

```scheme
(run* (q)
  (fresh (x y)
    (== q (list x y))))
```

Running this yields `'((_0 _1))`. This proves that `q` is a list of two distinct **reified logic variables**. The `_` notation means "this variable remained unbound when the query finished." 

### Discard the throwaway example
We discard this fully unconstrained query; it was just to prove the shape of a reified variable. It will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition.
- **Files affected**: `lesson23.rkt`.
- **Change type**: add.
- **Location**: Appended to the bottom of the file.
- **Dependencies**: None.

### The New Code
```scheme
(run* (q)
  (fresh (x y)
    (== q (list x y))
    (== x 'cat)))
```

### The Updated Project
```scheme
#lang racket
(require faster-miniKanren)

; ...previous queries...

(run* (q) // ← new
  (fresh (x y) // ← new
    (== q (list x y)) // ← new
    (== x 'cat))) // ← new
```
We have added a query that partially constrains a structure, binding one element but leaving the other free.

### Mechanical walkthrough
- `run*` — The query engine macro executing a logic program and collecting every satisfying value for the query variables.
- `(q)` — The list of query variables.
- `fresh` — The form introducing locally scoped logic variables.
- `(x y)` — Two newly allocated logic variables for this scope.
- `==` — The unification operator attempting to make two terms structurally identical.
- `q` — The query variable.
- `list` — The standard Scheme list constructor function.
- `x` — The first inner logic variable.
- `y` — The second inner logic variable.
- `==` — The unification operator, constraining `x`.
- `x` — The first logic variable.
- `'` — The quote operator.
- `cat` — A literal symbol.

### CS Lens
Reified variables are equivalent to Skolem variables or anonymous variables in formal logic. They represent an entity that exists but is not specified further. Also recognized in: Type variables in generics (`<T>`) before they are materialized, pattern matching wildcards (`_`) in Rust or Scala, and "don't care" conditions in digital logic circuits.

### SE Lens
Reification makes the unresolved state of the solver observable to the developer. Instead of throwing a "Not enough constraints" error, miniKanren hands back a formula containing unknowns. This allows programs to manipulate and compose incomplete information. The tradeoff is that the developer must write application code capable of handling `_0` if they intend to process the output functionally.

### Commands needed
None.

### Run it
Running the code yields:
```scheme
'( ((cat _0)) )
```

### Connecting sentence
The engine handles complex structures and wildcards gracefully, but at the absolute foundation of all these queries lie two primitive base cases.

## Concept Unit: Succeeding and failing — `succeed` and `fail`

### The Problem
Just as functional programming relies on `#t` (true) and `#f` (false) as its boolean bedrock, a logic programming system needs primitive goals that unconditionally succeed or unconditionally fail. These act as base cases for recursive logic programs.

### Introduce the concept in isolation
We run a query that relies solely on the primitive goal `succeed`.

```scheme
(run* (q) succeed)
```

Running this yields `'(_0)`. Because `succeed` is always true and adds no constraints, the query passes immediately, leaving `q` completely unconstrained. 

### Discard the throwaway example
We discard this always-true query; it was just to prove `succeed` works. It will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition.
- **Files affected**: `lesson23.rkt`.
- **Change type**: add.
- **Location**: Appended to the bottom of the file.
- **Dependencies**: None.

### The New Code
```scheme
(run* (q) fail)
```

### The Updated Project
```scheme
#lang racket
(require faster-miniKanren)

; ...previous queries...

(run* (q) fail) // ← new
```
We have added a query that unconditionally fails, mimicking a dead end in a logic search.

### Mechanical walkthrough
- `run*` — The query engine macro executing a logic program and collecting every satisfying value for the query variables.
- `(q)` — The list of query variables.
- `fail` — A predefined goal in miniKanren that always fails, emptying the search stream and rejecting the query path.

### CS Lens
These are the Top (`succeed`) and Bottom (`fail`) elements of the logic lattice. They are the identity elements for conjunction (AND) and disjunction (OR) operations in the solver stream. Also recognized in: Boolean logic (True/False), sets (Universe/Empty Set), and regular expressions (Match Anything/Match Nothing).

### SE Lens
We explicitly need a `fail` goal as a base case for recursion in logic programming. When walking down a data structure, if we reach an invalid state, we return `fail` to prune that search path. Without an explicit primitive for failure, we would have to contrive artificial failing goals like `(== 0 1)` to terminate paths.

### Commands needed
None.

### Run it
Running the code yields:
```scheme
'()
```

### Connecting sentence
With these primitives, we now have a complete foundation for expressing relational constraints.

---

## Closing

### Connect the pieces
Let's trace exactly how a query variable moves through our final programs. When we call `(run* (q) ...)`, the engine spawns a logic variable `q` and an empty substitution state. As `q` interacts with `==`, it is compared structurally. If it meets a literal like `42`, the substitution state is updated to map `q -> 42`. If it meets a `fresh` variable `x`, they are bound together `q -> x`. If it meets `fail`, the entire state is discarded, producing an empty list of answers. When the goals finish, the engine walks the final substitution state, reifying any unconstrained variables to `_0`, and returns the results to Racket.

### What breaks without this
If we attempt to use an undeclared variable without introducing it via `fresh`, it breaks.
```scheme
(run* (q) (== x 5))
```
Running this causes a direct Racket evaluation error: `x: unbound identifier`. Unification cannot magically create variables; `fresh` is strictly required to allocate the unknowns before the solver can use them.

### Exercises
1. Write a `run*` query that unifies `q` with a list of three elements where the first and third elements are the same logic variable `x`, and the middle is the symbol `'middle`.
2. Write a `run 1` query that uses `membero` to find just the first matching element of the list `'(apple banana cherry)`.

### Definition of done
- [x] Installed `faster-miniKanren` via DrRacket.
- [x] Wrote `lesson23.rkt` containing simple queries proving the behavior of `run`, `run*`, `fresh`, and `==`.
- [x] Verified that structural unification traverses lists element by element.
- [x] Executed base queries for `succeed` and `fail`.

Git commit:
```bash
git add lesson23.rkt
git commit -m "Introduce relational constraints via miniKanren primitives"
```
*Why: we have established the foundational boundary between functional Racket code and relational miniKanren queries.*
