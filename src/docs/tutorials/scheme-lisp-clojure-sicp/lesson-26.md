# Lesson 26: Running Backwards — Queries as Programs

You will see the full payoff of relational programming: running a Scheme interpreter written as a miniKanren relation backward to generate Scheme programs that produce a desired output. You will write a tiny relational arithmetic evaluator and run it forward (evaluate expressions) and backward (generate expressions that evaluate to a target value). The transferable problems: (1) if you can write a program evaluator as a relation, you get a program synthesizer for free — run it backward; (2) this is the foundation of program synthesis and AI planning; (3) the relational mindset — describe what is true instead of how to compute it — is a transferable architectural thinking skill even in non-relational languages.

**What you need to know first:** Lessons 0–25 (all prior concepts through membero, appendo, listo, conde, fresh, ==, backtracking).

**Terms used in this lesson:**
- **Bidirectionality** — The ability to use the same relational logic to compute forward (evaluating inputs to an output) or backward (generating inputs from a desired output), by treating arguments as unknowns. It exists to avoid writing separate programs for generation and evaluation.
- **Multiple answers** — Relational queries can return all valid solutions rather than just the first one found, enabling search spaces to be explored completely.
- **Composability** — The practice of combining smaller relations using `fresh`, `==`, and `conde` to build complex relational programs, allowing simple truth statements to form rich logic.
- **Separation of logic from search** — The architectural property where the programmer specifies *what* is true (the relations), and the engine (miniKanren) figures out *how* to find solutions using search and backtracking.
- **Program synthesis** — The automated generation of programs that satisfy a specific constraint or evaluate to a target value, achieved here "for free" by running an evaluator relation backwards.
- **`membero`** — A relation that succeeds if an element is a member of a list. Reappearing from earlier lessons, it describes membership rather than checking it iteratively.
- **`appendo`** — A relation that succeeds if appending two lists yields a third list. Reappearing from earlier lessons, it relates three lists structurally.
- **`listo`** — A relation that succeeds if its argument is a proper list. Reappearing from earlier lessons.
- **`conde`** — The relational equivalent of `cond`, used to branch search paths. Reappearing from earlier lessons, it creates independent universes of truth.
- **`fresh`** — A form that introduces new, unbound logic variables. Reappearing from earlier lessons, it creates unknowns to be constrained.
- **`==`** — The unification operator, ensuring two logic variables or values represent the same structure. Reappearing from earlier lessons.
- **Backtracking** — The search strategy miniKanren uses to explore all branches of a `conde`, reverting and trying alternatives when a path fails. Reappearing from earlier lessons.

**Objects and methods used:**

- **`numbero`**
  - *What it is:* A built-in miniKanren relation that asserts an argument must be a number.
  - *Implementation:* `(numbero x)`, succeeding if `x` is a numeric literal.
  - *Its use:* Used in our evaluator to ground the base case where numeric expressions evaluate to themselves.
  - *Type:* Relational macro / function.
  - *Responsibility:* Asserts that a logic variable unifies with a numerical value, failing branches where it does not.
  - *Depends on:* An argument (logic variable or concrete value).
  - *Connects to:* Called within `conde` branches to constrain data types during search.
  - *Shape:* A primitive relational building block provided by the `faster-miniKanren` library.

- **`evalo`**
  - *What it is:* A custom relational evaluator for a tiny arithmetic subset of Scheme.
  - *Implementation:* `(define (evalo expr val) ...)` using `conde`, `numbero`, `fresh`, and `==`.
  - *Its use:* To demonstrate running an evaluator forward and backward.
  - *Type:* Custom relational function.
  - *Responsibility:* Relates an expression tree (`expr`) to its evaluated result (`val`).
  - *Depends on:* Two arguments, one representing the AST and one representing the value.
  - *Connects to:* Calls itself recursively (`evalo e1 v1`), calls `numbero`, `==`.
  - *Shape:* The core API of our relational interpreter.

- **`run*`** / **`run`**
  - *What it is:* The interface to execute a miniKanren query and extract results.
  - *Implementation:* `(run* (q) ...)` or `(run 5 (q) ...)`.
  - *Its use:* To run our relations and ask questions, capping the search space if necessary.
  - *Type:* Query macro.
  - *Responsibility:* Executes the relational search and materializes the logic variables into a list of results.
  - *Depends on:* A number of desired results (or `*` for all), a list of query variables, and relational goals.
  - *Connects to:* Wraps relational logic and interacts with the miniKanren search stream.
  - *Shape:* The boundary between functional Scheme and the relational miniKanren environment.

- **`core.logic`**
  - *What it is:* A Clojure library that implements miniKanren.
  - *Implementation:* `(require '[clojure.core.logic :as l])`.
  - *Its use:* To preview the transferability of relational concepts to another language.
  - *Type:* Clojure library.
  - *Responsibility:* Provides logic programming primitives (`run*`, `fresh`, `==`, `conde`) in Clojure.
  - *Depends on:* Clojure's macro system and sequence abstractions.
  - *Connects to:* Interacts with native Clojure data structures like vectors and maps.
  - *Shape:* An embedded DSL inside Clojure for relational programming.


## Concept Unit: The payoff — a relational arithmetic evaluator

### The Problem
We have learned how to write relations that describe what is true. Now, we want to apply this to the ultimate meta-circular challenge: writing an evaluator. A standard evaluator takes an expression and returns a value. A *relational* evaluator relates an expression to a value, without enforcing which one is the input and which is the output.

### Introduce the concept in isolation
Let's see the primitive we will need: `numbero`. This is called a **type-checking relation**.
```scheme
(require faster-miniKanren)

(run* (q) (numbero 5))
; => (_0)

(run* (q) (numbero 'hello))
; => ()
```
The first query succeeds (returning a generic logic variable `_0` since `q` is unbound but the query succeeds) because `5` is a number. The second fails (returning an empty list) because `'hello` is a symbol. This proves that we can declaratively enforce type constraints inside miniKanren queries.

### Discard the throwaway example
The throwaway type-checking code is deleted and will not appear in the project again.

### Project Change
- **Reference Source** — No reference counterpart — this is a from-scratch addition because we are demonstrating relational interpretation.
- **Files affected** — `evalo.rkt` (created)
- **Change type** — Add
- **Location** — N/A
- **Dependencies** — `faster-miniKanren`

### The New Code
```scheme
(require faster-miniKanren)

; evalo: (evalo expr val) succeeds when expr evaluates to val
(define (evalo expr val)
  (conde
    ; numbers evaluate to themselves
    [(numbero expr) (== expr val)]
    ; addition
    [(fresh (e1 e2 v1 v2)
       (== expr (list '+ e1 e2))
       (== val (+ v1 v2))
       (evalo e1 v1)
       (evalo e2 v2))]
    ; multiplication
    [(fresh (e1 e2 v1 v2)
       (== expr (list '* e1 e2))
       (== val (* v1 v2))
       (evalo e1 v1)
       (evalo e2 v2))]))

(run* (q) (evalo '(+ 1 2) q))
(run* (q) (evalo '(* (+ 1 2) 4) q))
```

### The Updated Project
```scheme
// ← new (The entire file is new, representing our evaluator)
(require faster-miniKanren)

(define (evalo expr val) ...)
(run* (q) (evalo '(+ 1 2) q))
// Evaluates to: (3)
(run* (q) (evalo '(* (+ 1 2) 4) q))
// Evaluates to: (12)
```
The evaluator maps arithmetic abstract syntax trees to their evaluated sums and products.

### Mechanical walkthrough
- `(define (evalo expr val))` defines our relation taking two arguments.
- `conde` branches between the possible forms our expression can take.
- `[(numbero expr) (== expr val)]` is the base case: if `expr` is a number, the value `val` must unify with it.
- `(fresh (e1 e2 v1 v2) ...)` introduces local logic variables for the sub-expressions and their values.
- `(== expr (list '+ e1 e2))` structurally matches `expr` to a list starting with `+` and two arguments.
- `(== val (+ v1 v2))` uses Scheme's native `+` to compute the resulting value. Note that in a pure miniKanren, we would use a relational arithmetic system, but here we project into native arithmetic for simplicity.
- `(evalo e1 v1)` recursively evaluates the first operand.
- `(evalo e2 v2)` recursively evaluates the second operand.

Execution trace for `(run* (q) (evalo '(+ 1 2) q))`:
```
Step 1: evalo called with expr='(+ 1 2), val=q
Step 2: numbero branch fails because '(+ 1 2) is a list.
Step 3: addition branch matches: expr unifies with (list '+ e1 e2), so e1=1, e2=2.
Step 4: (evalo 1 v1) succeeds via numbero, v1=1.
Step 5: (evalo 2 v2) succeeds via numbero, v2=2.
Step 6: (== val (+ 1 2)) unifies val with 3. q is 3.
```


## Concept Unit: Running `evalo` backward — generate expressions

### The Problem
We have a working evaluator, but we wrote it relationally. What happens if we provide the target value and leave the expression as the unknown logic variable?

### Introduce the concept in isolation
Let's see a simpler backward relation: `appendo` backward. This is called **backward execution**.
```scheme
(run* (q) (appendo q '(3 4) '(1 2 3 4)))
; => ((1 2))
```
We ask what prefix appended to `(3 4)` yields the full list, proving that the engine can infer arguments from the result.

### Discard the throwaway example
The `appendo` example is deleted and will not appear in the project again.

### Project Change
- **Reference Source** — No reference counterpart.
- **Files affected** — `evalo.rkt` (modified)
- **Change type** — Add
- **Location** — Appended to the end of the file.
- **Dependencies** — `evalo`

### The New Code
```scheme
(run 5 (q) (evalo q 6))
```

### The Updated Project
```scheme
(define (evalo expr val) ...)
// ...
// ← new
(run 5 (q) (evalo q 6))
// => (6
//     (+ 0 6)
//     (+ 1 5)
//     (+ 2 4)
//     (* 1 6))
```
We asked the system to generate 5 valid Scheme programs that evaluate to `6`.

### Mechanical walkthrough
- `run 5` limits the search to 5 answers, because there are infinitely many expressions that evaluate to 6.
- `(evalo q 6)` passes the unbound variable `q` as the expression, and `6` as the target value.
- miniKanren systematically tries all branches of `evalo`. It tries `numbero`, unifying `q` with `6`.
- It tries the `+` branch, introducing `e1` and `e2`, and searches for numbers that add to 6.
- WITHOUT CHANGING ANY CODE, we generated programs. This is **program synthesis**. The engine searches its own tree of relational constraints, generating abstract syntax trees that satisfy the evaluation logic.


## Concept Unit: Running `evalo` sideways — fill in the blanks

### The Problem
If we can run fully forward and fully backward, can we leave holes in the middle of our structures?

### Introduce the concept in isolation
Let's use `appendo` with holes. This is called **sideways execution**.
```scheme
(run* (q) (appendo '(1) q '(1 2 3)))
; => ((2 3))
```
The unknowns can be anywhere in the data structures, proving that unification explores bidirectionally across the data.

### Discard the throwaway example
The `appendo` sideways example is deleted.

### Project Change
- **Reference Source** — No reference counterpart.
- **Files affected** — `evalo.rkt` (modified)
- **Change type** — Add
- **Location** — Appended to the end of the file.
- **Dependencies** — `evalo`

### The New Code
```scheme
; What goes in the blank? (+ _ 3) = 7
(run* (q) (evalo (list '+ q 3) 7))

; What operation makes (? 2 3) = 6?
(run* (q) (evalo (list q 2 3) 6))

; What two numbers add to 10?
(run 5 (q)
  (fresh (a b)
    (evalo (list '+ a b) 10)
    (== q (list a b))))
```

### The Updated Project
```scheme
(define (evalo expr val) ...)
// ...
// ← new
(run* (q) (evalo (list '+ q 3) 7))  
// => (4)

(run* (q) (evalo (list q 2 3) 6))   
// => (*)

(run 5 (q)
  (fresh (a b)
    (evalo (list '+ a b) 10)
    (== q (list a b))))
// => ((0 10) (1 9) (2 8) (3 7) (4 6))
```
The same `evalo` relation, run in different directions, answers completely different questions.

### Mechanical walkthrough
- `(list '+ q 3)` constructs an expression with a logic variable inside it.
- `(evalo ... 7)` constrains the result to `7`. The engine searches the `+` branch and deduces `q` must evaluate to 4.
- `(list q 2 3)` places the unknown in the operator position. The engine matches the `*` branch because `(* 2 3)` is `6`.
- `(fresh (a b) ... (== q (list a b)))` packages two unknowns into the single query variable `q`.

Execution trace for `(run* (q) (evalo (list '+ q 3) 7))`:
```
Step 1: expr is (list '+ q 3), val is 7.
Step 2: Matches the addition branch of evalo.
Step 3: e1 unifies with q, e2 unifies with 3.
Step 4: (evalo e2 v2) evaluates 3, so v2=3.
Step 5: The constraint (== val (+ v1 v2)) becomes (== 7 (+ v1 3)), implying v1=4.
Step 6: (evalo e1 v1) becomes (evalo q 4), so q unifies with 4.
```

## Concept Unit: The architectural insight

### The Problem
Why does relational programming matter outside of solving logic puzzles or writing synthesizers in Racket?

### Introduce the concept in isolation
Imagine writing SQL: `SELECT * FROM users WHERE age = 6`. You specify the target state (the what), not the iteration over the tables (the how). This is called **declarative querying**.

### Discard the throwaway example
The SQL analogy is complete.

### Project Change
- **Reference Source** — No reference counterpart.
- **Files affected** — None.
- **Change type** — Conceptual.
- **Location** — N/A.
- **Dependencies** — N/A.

### The New Code
```scheme
; No code for this concept unit.
```

### The Updated Project
```scheme
// No code added.
```

### Mechanical walkthrough
Relational programming teaches you to think about WHAT IS TRUE rather than HOW TO COMPUTE IT. This skill transfers everywhere:
- **Database queries**: SQL is a relational language — you describe the result, not the algorithm.
- **Type inference**: A type checker is a constraint solver — it finds types that satisfy the constraints.
- **Configuration management**: Tools like Puppet/Ansible describe desired state, not the procedure.
- **AI planning**: Describe the goal state; the planner finds a sequence of actions.
- **Clojure's `core.logic` library**: miniKanren embedded in Clojure.


## Concept Unit: `core.logic` preview — the same ideas in Clojure

### The Problem
As we conclude Module 3, we want to look ahead to see how these exact concepts map to Clojure, which will be featured heavily in later modules.

### Introduce the concept in isolation
Clojure's vector syntax `[1 2 3]` is equivalent to Scheme's lists for data grouping. This is called **Clojure vector literals**.

### Discard the throwaway example
The vector syntax is understood.

### Project Change
- **Reference Source** — No reference counterpart.
- **Files affected** — `preview.clj` (created)
- **Change type** — Add
- **Location** — N/A
- **Dependencies** — Clojure environment

### The New Code
```clojure
(require '[clojure.core.logic :as l])

(l/run* [q]
  (l/membero q [1 2 3]))

(l/run* [q]
  (l/fresh [a b]
    (l/appendo a b [1 2 3])
    (l/== q [a b])))
```

### The Updated Project
```clojure
// ← new (Previewing Module 5 concepts)
(require '[clojure.core.logic :as l])

(l/run* [q]
  (l/membero q [1 2 3]))  
// => (1 2 3)

(l/run* [q]
  (l/fresh [a b]
    (l/appendo a b [1 2 3])
    (l/== q [a b])))
// => ([[] [1 2 3]] [[1] [2 3]] [[1 2] [3]] [[1 2 3] []])
```
The exact same relations you just wrote in Racket miniKanren exist in Clojure as `core.logic`.

### Mechanical walkthrough
- `(require '[clojure.core.logic :as l])` imports the miniKanren library into the Clojure namespace.
- `l/run*`, `l/membero`, `l/fresh`, `l/appendo`, and `l/==` are the exact same operators you already know, just prefixed with the `l/` namespace.
- The names are the same. The mental model is identical. When you reach Module 5, this will be familiar ground.


## Module 3 Summary

What relational programming gives you:
- **Bidirectionality**: run any argument as the unknown.
- **Multiple answers**: get all solutions, not just one.
- **Composability**: combine relations with `fresh`, `==`, and `conde`.
- **Separation of logic from search**: you describe WHAT, miniKanren figures out HOW.
- **Program synthesis**: write an evaluator, get a synthesizer free.

Module 3 is done. The reader now knows three programming paradigms: functional (Modules 0–2), relational (Module 3), and imperative-influenced (the set! mutation from Lesson 20). Module 4 (SICP) will deepen the functional model — building a Scheme interpreter, working with streams, and understanding the mathematical foundations.
