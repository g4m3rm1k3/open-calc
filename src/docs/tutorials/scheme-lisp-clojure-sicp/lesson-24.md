# Lesson 24: Conjunction and Disjunction — `conde` and Goals

Module: Module 3 — The Reasoned Schemer Arc

**What you will build**
The reader will learn `conde` — miniKanren's disjunction operator — and understand how goals combine. They will write relations that branch (like `if`/`cond` in functional code), understand that `conde` generates MULTIPLE answers via backtracking, and see how conjunction (multiple goals in sequence) and disjunction (`conde`) compose. The transferable problems: (1) in logic programming, AND is sequential goals (both must succeed), OR is `conde` (either branch can succeed, generating separate answers); (2) backtracking — when one branch fails, miniKanren tries the next — is automatic and invisible; (3) `conde` is what makes it possible to write a relation that has multiple valid answers.

**What you need to know first**
Lessons 0–23 (all prior concepts through `run`, `fresh`, `==`, unification, `succeed`, `fail`, miniKanren setup).

**Terms used in this lesson**
- **`require`** — Module system directive. Imports bindings from a module into the current namespace so you can use external code.
- **`run*`** — miniKanren interface macro. Executes a logic program and returns all valid answers for a single query variable, collecting every possible solution.
- **`fresh`** — miniKanren macro. Introduces new, unbound logic variables into the current scope so they can be unified with values.
- **`==`** — miniKanren relation. Asserts that two terms unify (are equal or can be made equal), failing if they contradict.
- **`conde`** — miniKanren macro. Disjunction operator (logical OR), branching execution to try multiple clauses independently.
- **`succeed`** — miniKanren goal. A goal that always succeeds without doing anything, acting as the identity for conjunction.
- **`fail`** — miniKanren goal. A goal that always fails, abandoning the current branch of execution.
- **`list`** — standard Scheme function. Creates a proper list from its arguments, used to package multiple variables into one answer.
- **`cond`** — standard Scheme macro. Conditional evaluation, branching based on true/false tests sequentially.

**Objects and methods used**
- **`faster-miniKanren`**
  - *What it is:* A Racket implementation of the miniKanren logic programming language.
  - *Implementation:* A provided Racket module.
  - *Its use:* Provides the logic programming environment used in this curriculum, implementing `run*`, `fresh`, `==`, and `conde`.
  - *Type:* Module
  - *Responsibility:* Provides core logic macros and functions that evaluate relational logic programs.
  - *Depends on:* Racket module system.
  - *Connects to:* Racket base.
  - *Shape:* Library dependency.

- **`color-of`**
  - *What it is:* A custom relation mapping a fruit to its color.
  - *Implementation:* `(define (color-of fruit color) ...)`
  - *Its use:* Demonstrates how relations run both forwards and backwards over facts.
  - *Type:* Relation (Function returning a goal)
  - *Responsibility:* Constrains two variables such that they represent a valid fruit-color pair.
  - *Depends on:* `conde`, `==`.
  - *Connects to:* `run*` or `fresh` to evaluate.
  - *Shape:* Custom application relation.

## Concept Unit: Conjunction — multiple goals in sequence (AND)

### The Problem
We need a way to demand that multiple conditions are true simultaneously. If a variable must unify with several constraints, we need an "AND" operation to ensure all conditions are met before an answer is considered valid.

### Introduce the concept in isolation
```scheme
#lang racket
(require faster-miniKanren)

(run* (q)
  (== q 5)
  (== q 5))
```
Output: `'(5)`
This proves that providing multiple goals in sequence requires all of them to succeed. If they all succeed, the conjunction succeeds.

### Discard the throwaway example
The isolated `q=5` conjunction is discarded and will not be used in the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating sequential goal evaluation.
- **Files affected:** `scratch/conjunction.rkt` (created)
- **Change type:** add
- **Location:** At the root of the file.
- **Dependencies:** `faster-miniKanren`

### The New Code
```scheme
#lang racket
(require faster-miniKanren)

(run* (q)
  (fresh (x y)
    (== x 1)
    (== y 2)
    (== q (list x y))))
```

### The Updated Project
```scheme
#lang racket
(require faster-miniKanren)

// ← new
(run* (q)
  (fresh (x y)
    (== x 1)
    (== y 2)
    (== q (list x y))))
```
The file now contains a `run*` block that evaluates three goals in sequence. All must succeed to produce an answer.

### Mechanical walkthrough
1. `run* (q)` — Initiates a miniKanren query for the variable `q`, collecting all valid answers.
2. `fresh (x y)` — Introduces two new unbound logic variables, `x` and `y`.
3. `(== x 1)` — Unifies `x` with `1`. This succeeds, making `x` bound to `1`.
4. `(== y 2)` — Unifies `y` with `2`. This succeeds, making `y` bound to `2`.
5. `(== q (list x y))` — Unifies `q` with the list `(1 2)`. This succeeds, establishing the final answer.
6. The implicit conjunction between the three `==` goals means ALL of them must succeed. If any goal fails (e.g., `(== x 1)` then `(== x 2)`), the entire conjunction fails and contributes no answer. This is logical AND.

### CS lens
Conjunction is logical AND. In logic programming, AND is typically represented by sequencing goals. Also recognized in: shell script `&&`, sequential statement evaluation in procedural languages, constraint satisfaction systems.

### SE lens
Relying on implicit sequencing for AND reduces syntax noise. The alternative, an explicit `(and ...)` wrapper, would needlessly nest code that is already enclosed in `run*` or `fresh`.

### Commands needed
`racket scratch/conjunction.rkt` — executes the Racket script and prints the evaluation result.

### Run it. Show the real output.
```
'((1 2))
```

### One sentence connecting this unit to what came immediately before.
Now that we can require multiple conditions to be true simultaneously using conjunction, we need a way to express alternatives using disjunction.


## Concept Unit: `conde` — disjunction (OR)

### The Problem
We need to specify alternative valid paths. If a relation can have multiple different valid answers, sequential AND evaluation is not enough. We need logical OR.

### Introduce the concept in isolation
```scheme
(run* (q)
  (conde
    [(== q 'cat)]
    [(== q 'dog)]
    [(== q 'bird)]))
```
Output: `'(cat dog bird)`
This proves that `conde` evaluates each clause independently and collects the successful results from ALL of them. This is called a **disjunction**.

### Discard the throwaway example
The animal disjunction is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating `conde`.
- **Files affected:** `scratch/disjunction.rkt` (created)
- **Change type:** add
- **Location:** At the root of the file.
- **Dependencies:** `faster-miniKanren`

### The New Code
```scheme
#lang racket
(require faster-miniKanren)

(run* (q)
  (conde
    [(== q 'cat)]
    [(== q 'dog)]
    [(== q 'bird)]))
```

### The Updated Project
```scheme
#lang racket
(require faster-miniKanren)

// ← new
(run* (q)
  (conde
    [(== q 'cat)]
    [(== q 'dog)]
    [(== q 'bird)]))
```
The file now contains a `conde` block that produces multiple valid answers for `q`.

### Mechanical walkthrough
1. `conde` — The disjunction operator. It expects a series of clauses (square brackets).
2. `[(== q 'cat)]` — The first clause. It succeeds and binds `q` to `'cat`.
3. `[(== q 'dog)]` — The second clause. It succeeds and binds `q` to `'dog`.
4. `[(== q 'bird)]` — The third clause. It succeeds and binds `q` to `'bird`.
5. `conde` tries EACH clause independently. For each clause that succeeds, it contributes answers. The final answer list is the union of all successful clause answers. This is logical OR — but unlike short-circuiting OR in procedural languages, every successful branch contributes.

### CS lens
Disjunction is logical OR. Also recognized in: nondeterministic finite automata (NFA) branching, alternative rules in formal grammars, parallel path exploration.

### SE lens
`conde` explicitly isolates branches. The alternative is passing state around to manually collect alternatives, which tightly couples the logic to the accumulator. `conde` abstracts the branching and accumulation away entirely.

### Commands needed
`racket scratch/disjunction.rkt`

### Run it. Show the real output.
```
'(cat dog bird)
```

### One sentence connecting this unit to what came immediately before.
Having seen that `conde` can try single alternative goals, we can combine it with our previous concept to put entire sequences of goals (conjunctions) inside each alternative branch.


## Concept Unit: `conde` with multiple goals per clause

### The Problem
Sometimes an alternative path isn't just one goal; it requires several conditions to be met. We need to express "either (A AND B) OR (C AND D)".

### Introduce the concept in isolation
```scheme
(run* (q)
  (fresh (x y)
    (conde
      [(== x 1) (== y 2) (== q (list x y))]
      [(== x 3) (== y 4) (== q (list x y))])))
```
Output: `'((1 2) (3 4))`
This proves that each clause in a `conde` acts as an implicit conjunction, requiring all goals inside it to succeed for the branch to succeed.

### Discard the throwaway example
The multi-goal `conde` is discarded.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating nested logic.
- **Files affected:** `scratch/multi_clause.rkt` (created)
- **Change type:** add
- **Location:** root
- **Dependencies:** `faster-miniKanren`

### The New Code
```scheme
#lang racket
(require faster-miniKanren)

(run* (q)
  (fresh (x y)
    (conde
      [(== x 1) (== y 2) (== q (list x y))]
      [(== x 3) (== y 4) (== q (list x y))])))
```

### The Updated Project
```scheme
#lang racket
(require faster-miniKanren)

// ← new
(run* (q)
  (fresh (x y)
    (conde
      [(== x 1) (== y 2) (== q (list x y))]
      [(== x 3) (== y 4) (== q (list x y))])))
```
The project now runs a query evaluating multiple conjunctive clauses.

### Mechanical walkthrough
1. `conde` — Evaluates its clauses.
2. `[(== x 1) (== y 2) (== q (list x y))]` — Clause 1. x=1 AND y=2 AND q=(x y). This succeeds with q=(1 2).
3. `[(== x 3) (== y 4) (== q (list x y))]` — Clause 2. x=3 AND y=4 AND q=(x y). This succeeds with q=(3 4).
4. Since both clauses succeed, `conde` returns the results from both, producing `((1 2) (3 4))`.

### CS lens
Conjunctive Normal Form (CNF) and Disjunctive Normal Form (DNF) are foundational to boolean algebra. `conde` with multiple goals per clause natively represents DNF (an OR of ANDs). Also recognized in: database query optimization, SAT solvers.

### SE lens
Nesting conjunctions implicitly inside `conde` clauses keeps logic code dense and readable. Forcing an explicit `(and ...)` inside each `[` would add noise without adding semantic value.

### Commands needed
`racket scratch/multi_clause.rkt`

### Run it. Show the real output.
```
'((1 2) (3 4))
```

### One sentence connecting this unit to what came immediately before.
With multiple branches available, what happens when one of those branches hits a contradiction and fails?


## Concept Unit: Backtracking — when a branch fails

### The Problem
We need to know what happens when an alternative path is invalid. When an assumption leads to a contradiction, the logic engine must abandon the path without crashing and continue exploring other paths.

### Introduce the concept in isolation
```scheme
(run* (q)
  (conde
    [(== q 1) fail]
    [(== q 2) succeed]
    [(== q 3) (== q 4)]))
```
Output: `'(2)`
This proves that when a goal within a `conde` clause fails, the entire clause fails silently and is abandoned, while other clauses continue to be evaluated. This is called **backtracking**.

### Discard the throwaway example
The backtracking example is discarded.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are observing failure modes.
- **Files affected:** `scratch/backtrack.rkt` (created)
- **Change type:** add
- **Location:** root
- **Dependencies:** `faster-miniKanren`

### The New Code
```scheme
#lang racket
(require faster-miniKanren)

(run* (q)
  (conde
    [(== q 1) fail]
    [(== q 2) succeed]
    [(== q 3) (== q 4)]))
```

### The Updated Project
```scheme
#lang racket
(require faster-miniKanren)

// ← new
(run* (q)
  (conde
    [(== q 1) fail]
    [(== q 2) succeed]
    [(== q 3) (== q 4)]))
```
The file now demonstrates implicit backtracking over failed clauses.

### Mechanical walkthrough
1. `[(== q 1) fail]` — Clause 1: unifies `q` with `1`, then hits `fail`. The clause fails. It contributes no answer.
2. `[(== q 2) succeed]` — Clause 2: unifies `q` with `2`, then hits `succeed`. The clause succeeds and contributes `q=2`.
3. `[(== q 3) (== q 4)]` — Clause 3: unifies `q` with `3`, then tries to unify `q` (which is 3) with `4`. This is a contradiction. The clause fails and contributes no answer.
4. miniKanren automatically abandons the failed clauses (1 and 3) and only returns the result of the successful clause (2).

### CS lens
Backtracking is a systematic way to iterate through all possible configurations of a search space. Also recognized in: regular expression engines evaluating alternations, Prolog execution, solving Sudoku or maze puzzles.

### SE lens
Invisible backtracking removes explicit error-handling and state-resetting code from the developer's hands. The alternative would be manually catching failure signals and un-doing variable bindings, which is deeply error-prone.

### Commands needed
`racket scratch/backtrack.rkt`

### Run it. Show the real output.
```
'(2)
```

### One sentence connecting this unit to what came immediately before.
Because `conde` can backtrack and collect answers from multiple successful paths, we can use it to build a persistent database of facts, known as a relation.


## Concept Unit: Writing a `color-of` relation

### The Problem
We need to encapsulate domain knowledge (like facts about fruits) into a reusable block. We want to query these facts forwards (what color is an apple?) and backwards (what fruit is yellow?) without writing separate functions for each direction.

### Introduce the concept in isolation
```scheme
(define (color-of fruit color)
  (conde
    [(== fruit 'apple) (== color 'red)]
    [(== fruit 'banana) (== color 'yellow)]
    [(== fruit 'grape) (== color 'purple)]
    [(== fruit 'lime) (== color 'green)]))
```
Output: `(run* (q) (color-of 'apple q))` returns `'(red)`.
This proves that relations defined with `conde` encode undirected constraints rather than directional transformations.

### Discard the throwaway example
The isolated `color-of` is discarded.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are defining a new relation.
- **Files affected:** `scratch/relation.rkt` (created)
- **Change type:** add
- **Location:** root
- **Dependencies:** `faster-miniKanren`

### The New Code
```scheme
#lang racket
(require faster-miniKanren)

(define (color-of fruit color)
  (conde
    [(== fruit 'apple) (== color 'red)]
    [(== fruit 'banana) (== color 'yellow)]
    [(== fruit 'grape) (== color 'purple)]
    [(== fruit 'lime) (== color 'green)]))

(run* (q) (color-of 'apple q))
(run* (q) (color-of q 'yellow))
(run* (q)
  (fresh (f c)
    (color-of f c)
    (== q (list f c))))
```

### The Updated Project
```scheme
#lang racket
(require faster-miniKanren)

// ← new
(define (color-of fruit color)
  (conde
    [(== fruit 'apple) (== color 'red)]
    [(== fruit 'banana) (== color 'yellow)]
    [(== fruit 'grape) (== color 'purple)]
    [(== fruit 'lime) (== color 'green)]))

(run* (q) (color-of 'apple q))
(run* (q) (color-of q 'yellow))
(run* (q)
  (fresh (f c)
    (color-of f c)
    (== q (list f c))))
```
The file now contains a reusable relation and queries it forward, backward, and fully ungrounded.

### Mechanical walkthrough
1. `(define (color-of fruit color) ...)` — Defines a standard Scheme function that returns a miniKanren goal.
2. `(run* (q) (color-of 'apple q))` — Forward query. `fruit` is bound to `'apple`, `color` to `q`. The first clause `[(== 'apple 'apple) (== q 'red)]` succeeds. Other clauses fail (e.g., `(== 'apple 'banana)`). Result: `'(red)`.
3. `(run* (q) (color-of q 'yellow))` — Backward query. `fruit` is `q`, `color` is `'yellow`. `conde` tries each clause. The second clause `[(== q 'banana) (== 'yellow 'yellow)]` succeeds. Result: `'(banana)`.
4. `(run* (q) (fresh (f c) ...))` — All pairs query. Both `fruit` and `color` are unbound logic variables. `conde` succeeds on every clause, unifying `f` and `c` with the pairs, returning all of them.

### CS lens
Declarative programming separates logic from control. The relation states *what* is true; the query engine determines *how* to find it. Also recognized in: SQL joins and queries, Datomic graph queries, type inference algorithms running in reverse.

### SE lens
Relations provide immense code reuse. A single `color-of` definition serves as a forward lookup, a reverse lookup, and a domain enumerator. In procedural code, this would require three separate functions (`getColor`, `getFruitForColor`, `getAllFruits`).

### Commands needed
`racket scratch/relation.rkt`

### Run it. Show the real output.
```
'(red)
'(banana)
'((apple red) (banana yellow) (grape purple) (lime green))
```

### One sentence connecting this unit to what came immediately before.
Relations built with `conde` look suspiciously like standard Scheme `cond` expressions, but their behavior is profoundly different.


## Concept Unit: `conde` vs `cond` — the critical difference

### The Problem
We need to distinguish logic programming disjunction from procedural conditional evaluation. `conde` and `cond` look similar but execute entirely differently.

### Introduce the concept in isolation
```scheme
(cond
  [(= 1 1) 'a]
  [(= 2 2) 'b])

(run* (q)
  (conde
    [(== q 'a)]
    [(== q 'b)]))
```
Output: `'a` and `'(a b)`.
This proves that `cond` stops at the first true branch, while `conde` tries all branches and keeps all successes. 

### Discard the throwaway example
The comparison example is discarded.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are comparing concepts.
- **Files affected:** `scratch/cond_vs_conde.rkt` (created)
- **Change type:** add
- **Location:** root
- **Dependencies:** `faster-miniKanren`

### The New Code
```scheme
#lang racket
(require faster-miniKanren)

(displayln
 (cond
   [(= 1 1) 'a]
   [(= 2 2) 'b]))

(displayln
 (run* (q)
   (conde
     [(== q 'a)]
     [(== q 'b)])))
```

### The Updated Project
```scheme
#lang racket
(require faster-miniKanren)

// ← new
(displayln
 (cond
   [(= 1 1) 'a]
   [(= 2 2) 'b]))

(displayln
 (run* (q)
   (conde
     [(== q 'a)]
     [(== q 'b)])))
```
The file runs both a `cond` and a `conde` side-by-side to highlight their divergent behavior.

### Mechanical walkthrough
1. `cond` — Evaluates test expressions. `(= 1 1)` is true, so it takes the first branch, returning `'a`, and completely ignores the rest of the expression. It is deterministic and sequential.
2. `conde` — Evaluates goals. `(== q 'a)` succeeds, so it contributes `'a`. But it does NOT stop. It tries `(== q 'b)`, which also succeeds, contributing `'b`. It keeps all answers. It is non-deterministic and exhaustive.

### CS lens
Short-circuit evaluation (like `cond`) is an optimization in imperative execution. Exhaustive search (like `conde`) is required for logic completeness. Also recognized in: backtracking parsers vs deterministic LL parsers, quantum superposition (trying all paths).

### SE lens
Confusing `cond` for `conde` leads to logic bugs where valid answers are unexpectedly pruned. `cond` is for control flow; `conde` is for mapping the entire space of truths.

### Commands needed
`racket scratch/cond_vs_conde.rkt`

### Run it. Show the real output.
```
a
(a b)
```

### One sentence connecting this unit to what came immediately before.
Understanding the exhaustive nature of `conde` completes our base toolset for logic programming.

---

## Closing

### Connect the pieces
`conde` and conjunction form a complete logic programming system. Everything in miniKanren is built from these two operations plus `fresh` and `==`. 
1. `run*` initializes a logic state.
2. `conde` splits that state into independent parallel universes (branches).
3. Conjunction (sequential goals within a branch) subjects a universe to multiple constraints.
4. Backtracking silently collapses universes that hit contradictions.
5. `run*` collects the variables from the universes that survived.

### What breaks without this
If you replace `conde` with standard `cond` inside a logic program, it evaluates tests instead of goals, and short-circuits.
```scheme
(run* (q)
  (cond
    [#t (== q 'a)]
    [#t (== q 'b)]))
```
**Error:** `cond` only evaluates the first branch. The output is `'(a)`, silently pruning the valid answer `'(b)`.

### Exercises
1. Write a `parent-of` relation using `conde` with several known parent-child pairs.
2. Run it forward: `(run* (q) (parent-of 'Homer q))` (who are Homer's children?).
3. Run it backward: `(run* (q) (parent-of q 'Bart))` (who is Bart's parent?).
4. Run it ungrounded: `(run* (q) (fresh (p c) (parent-of p c) (== q (list p c))))`.

### Definition of done
- [x] Defined `conde` as disjunction.
- [x] Showed implicit conjunction and backtracking.
- [x] Wrote a multi-way relation that runs backwards.
- [x] Contrasted `conde` exhaustiveness against `cond` short-circuiting.

Git commit message: `docs: Add lesson 24 on conde, conjunction, and backtracking` — to explain how miniKanren branches and recovers from failure natively.
