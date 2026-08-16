# Lesson 174: Type Inference

**What you will build**: By the end of this lesson you'll infer a function parameter's type automatically, from how it's *used* inside the function body, rather than requiring it to be declared by hand — `"y"`, used inside `["add" ["var" "y"] 1]`, is inferred as `"number"` with no type annotation anywhere in sight, even when the use is nested two levels deep inside another `"add"`.

**What you need to know first**: Lesson 173's `type-check` and type environment; Lesson 149's recursive tree-walking, applied here to searching an AST rather than folding it.

**Terms introduced in this lesson**:

- **type inference** — automatically deriving a program's types from how its values are actually used, rather than requiring every type to be written down explicitly. *Why it matters*: Lesson 173's `type-check` needed a type environment handed to it; this lesson builds the missing piece — producing that environment automatically, from the code itself.
- **constraint** — here, specifically: a fact, discovered by inspecting how a variable is used, that narrows down what type it must be. *Why it matters*: a genuinely different sense than Lesson 1's own "constraint" (a restriction a problem's valid inputs or outputs must satisfy) — this lesson's version is narrower, applying specifically to what a type-inference algorithm derives about one variable from one use site, not a problem's overall requirements. "`y` appears inside an `add`" is a real constraint in this lesson's sense — it doesn't prove `y` is a number by itself, but it's exactly the kind of evidence a real inference algorithm accumulates and reasons from.

**Objects and methods used**: None new. This lesson reuses `cond` (Lesson 151), `or`/`=` (Lesson 7, Lesson 6), and `number?` (Lesson 41), each already covered.

---

## Concept Unit: Finding Every Use of a Variable

### The Problem

Before any type can be inferred for a parameter, its every use inside the function body needs to be found — not just at the top level, but nested arbitrarily deep inside other expressions.

### Introduce the concept in isolation

```clojure
(declare mentions?)
(defn mentions? [name ast]
  (cond
    (number? ast) false
    (= (get ast 0) "var") (= (get ast 1) name)
    true (or (mentions? name (get ast 1)) (mentions? name (get ast 2)))))
```

```
user=> (mentions? "z" ["add" 1 ["add" ["var" "z"] 2]])
true
user=> (mentions? "y" ["add" ["var" "x"] 1])
false
```

`mentions?` walks the AST exactly the way `eval-env`'s own recursion does, but asks a different question at every step: "does `name` show up anywhere in here." A bare number never mentions anything. A `"var"` node mentions `name` only if it names it directly. An `"add"` node mentions `name` if *either* operand does — recursively, so a use buried inside a nested `"add"` is still found.

### Discard the throwaway example

Not applicable — `mentions?` is real, reusable, and verified against both a nested match and a genuine non-match.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch search built on the identical AST shapes `eval-env` (Lesson 164) already walks.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn mentions? [name ast]
  (cond
    (number? ast) false
    (= (get ast 0) "var") (= (get ast 1) name)
    true (or (mentions? name (get ast 1)) (mentions? name (get ast 2)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(number? ast) false`** — first appearance of this specific base case: a bare number can never mention a variable name, since it contains no names at all.
- **`(= (get ast 1) name)`**, in the `"var"` branch — checks the variable reference's own name directly against the one being searched for.
- **`(or (mentions? name (get ast 1)) (mentions? name (get ast 2)))`** — reappearing `or` (Lesson 7): true if *either* subtree mentions the name, searching both branches of an `"add"` node recursively, exactly the depth-first search this lesson needs.

### CS Lens

`mentions?` is Lesson 125's own depth-first search, applied to an AST instead of a graph — "does this name appear anywhere reachable from here" is precisely the same question DFS answers for "is this vertex reachable," just walked over a different kind of structure.

### SE Lens

Searching the *entire* body, not just its top level, is what makes this inference genuinely useful rather than only handling the simplest possible case — a parameter used two or three expressions deep is exactly as findable as one used immediately, with no special-casing required.

---

## Concept Unit: Inferring a Type From a Real Constraint

### The Problem

Finding *that* a variable is used is not the same as knowing *what type* that use requires. Can "used inside an `add`" become a real, checkable **constraint** — "this variable must be a number" — without ever being told so directly?

### Introduce the concept in isolation

```clojure
(declare uses-as-number?)
(defn uses-as-number? [name ast]
  (cond
    (number? ast) false
    (= (get ast 0) "var") false
    true (or (mentions? name (get ast 1)) (mentions? name (get ast 2)))))

(defn infer-type [name body]
  (if (uses-as-number? name body) "number" "unconstrained"))
```

```
user=> (infer-type "y" ["add" ["var" "y"] 1])
"number"
user=> (infer-type "z" ["add" 1 ["add" ["var" "z"] 2]])
"number"
user=> (infer-type "y" ["var" "y"])
"unconstrained"
```

`uses-as-number?` checks specifically whether `name` appears *as an operand of an `add` node* — the one real constraint this small language's own `"add"` establishes: whatever's added must be a number. `"y"` inside `["add" ["var" "y"] 1]` is inferred as `"number"`, correctly, with no annotation anywhere. `"z"`, nested two `"add"` levels deep, is inferred correctly too — `mentions?`'s own recursive search already handles the depth. A parameter that's only ever *returned* directly, `["var" "y"]` alone, gives `"unconstrained"`, honestly: nothing in this small language's own rules forces a bare, unused-in-`add` parameter to be any particular type.

### Discard the throwaway example

Not applicable — `uses-as-number?`/`infer-type` are real, reusable, and verified against three real function bodies, including one deliberately giving an honest "unconstrained" result.

### Project Change

- **Reference Source**: Lesson 173's own `type-check`, whose `check-add` branch names the exact constraint this lesson's `uses-as-number?` now derives automatically instead of assuming pre-supplied.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn infer-type [name body]
  (if (uses-as-number? name body) "number" "unconstrained"))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= (get ast 0) "var") false`**, in `uses-as-number?` — first appearance of this specific idea: a bare `"var"` node *by itself* establishes no constraint — using `y` doesn't, on its own, say anything about its type; only using it *inside* something with real type requirements (here, `"add"`) does.
- **`(or (mentions? name (get ast 1)) (mentions? name (get ast 2)))`** — reappearing `mentions?` (this lesson's first unit), checked against an `"add"` node's own two operands specifically — the one place this tiny language actually requires a number.

### CS Lens

This is real **type inference**, honestly scoped down: a real inference algorithm (Hindley-Milner, used by ML, Haskell, and Rust's own type inference) collects *every* such constraint across a whole program and solves them together, potentially inferring far more than one variable's type from indirect relationships between several; this lesson's own version collects exactly one kind of constraint (`"add"` requires numbers) and stops there, a real, working instance of the idea rather than the full general algorithm.

### SE Lens

Type inference's real payoff is exactly what this lesson's own three examples show: `"y"`'s type was never written anywhere, and yet a real, correct type — `"number"` — was produced automatically; a language leaning on inference trades explicit annotations for this kind of automatic derivation, at the honest cost that "unconstrained" is sometimes the correct, most that can be said answer, exactly as this lesson's own third example demonstrates rather than hides.

### Connection to the previous unit

The previous unit found every place a name is used; this unit turns *one specific kind* of use into a real, derived type — the actual inference step, built directly on the previous unit's own search.

---

## Connect the Pieces

Search, then inference, on three real function bodies:

```clojure
(println "y in (add (var y) 1):" (infer-type "y" ["add" ["var" "y"] 1]))
(println "z nested two add levels deep:" (infer-type "z" ["add" 1 ["add" ["var" "z"] 2]]))
(println "y only ever returned bare:" (infer-type "y" ["var" "y"]))
```

```
y in (add (var y) 1): number
z nested two add levels deep: number
y only ever returned bare: unconstrained
```

Two real, correct inferences, and one honest admission that this small language's own rules simply don't say enough to infer anything for the third case.

## What Breaks Without This

Suppose a much larger real program required a type annotation on every single function parameter, with no inference at all. Every call site and every function definition would need explicit types written by hand, even where the correct type is completely determined by how the parameter is actually used — real, repetitive work a reader (and a compiler) could derive automatically. Type inference's absence doesn't make programs incorrect; it makes them more verbose than the information already present in the code strictly requires, exactly the gap this lesson's own `infer-type` closes for the one constraint this small language actually has.

## Exercises

1. **Trace.** By hand, trace `(mentions? "z" ["add" 1 ["add" ["var" "z"] 2]])` through every recursive call, confirming exactly where it finds `"z"`.
2. **Predict.** Before checking, predict `(infer-type "a" ["add" ["var" "b"] ["var" "a"]])` — `"a"` used as the *second*, not first, operand of an `add`. Then verify.
3. **Verify.** Confirm `(infer-type "w" 42)` — a body that's just a bare number, never referencing `"w"` at all — correctly reports `"unconstrained"`.
4. **Break it, on purpose.** Modify `uses-as-number?` to only check `(get ast 1)`, never `(get ast 2)`, and find a real function body where this change causes a wrong `"unconstrained"` result for a parameter that genuinely is used as a number.
5. **Generalize.** Describe, without coding it, what additional constraint `uses-as-number?` would need to check if this language's `"call"` node also constrained its function-position operand's parameter type.
6. **Reconstruct.** Close this lesson. From memory, explain why `"y"` in `["var" "y"]` alone gives `"unconstrained"`, not `"number"` — what specifically is missing that the other two examples had.

## Definition of Done

- [ ] You can write a search that finds every use of a variable name across a nested AST.
- [ ] You can turn a specific pattern of use (an operand of `add`) into a real, derived type constraint.
- [ ] You can explain why "unconstrained" is sometimes the honest, correct result of inference, not a failure of it.
- [ ] You completed Exercise 3 and confirmed a body never referencing the parameter correctly infers "unconstrained".
- [ ] You completed Exercise 4 and found a real case where checking only one operand position produces a wrong result.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm infer-type on an unused parameter gives unconstrained; find (add 1 (var y)) wrongly infers unconstrained when only checking operand 1"` — not just `"lesson 174 exercise"`.

---

**Next lesson:** Lesson 175, *Parametric Polymorphism*, asks what type a function that works correctly for *any* type at all — like Lesson 25's own `map` — should be given, when no single concrete type like `"number"` could ever be right for every call.
