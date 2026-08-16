# Lesson 173: Type Systems

**What you will build**: By the end of this lesson you'll build `type-check`, a real function that walks Lesson 164's AST shapes and catches a genuine error — calling a plain number as if it were a function — *before* ever running the program, with a clear message: `"TYPE ERROR: call needs a function"`. Then you'll run the identical broken program through `eval-env` directly, uncaught, and watch it fail for real with a `StackOverflowError` instead — deep, confusing, and nowhere near the actual mistake.

**What you need to know first**: Lesson 164's `eval-env` and its own `cond`-based AST dispatch; Lesson 155's types-as-sets, revisited here as constraints checked *before* execution instead of membership checked at any point.

**Terms introduced in this lesson**:

- **static type checking** — verifying a program's types are consistent *before* it runs, by walking its AST the same way an interpreter would, but computing types instead of values. *Why it matters*: catches a real class of error — using a value as the wrong kind of thing — at the moment the mistake is written, rather than however deep into actual execution the mistake happens to surface.
- **type environment** — a mapping from variable names to their *types*, not their values, consulted during type checking the same way Lesson 164's environment is consulted during evaluation. *Why it matters*: type checking needs to know what *kind* of thing a variable holds without ever running the program to find out what it actually *is*.

**Objects and methods used**: None new. This lesson reuses `cond` (Lesson 151), `lookup` (Lesson 154), and `and`/`=` (Lesson 7, Lesson 6), each already covered.

---

## Concept Unit: Checking Types Without Running Anything

### The Problem

`eval-env` computes real values by walking an AST. Can the *identical* walk compute types instead — "number" or "function" — catching a mismatch without ever actually running the program?

### Introduce the concept in isolation

```clojure
(declare check-call check-add)
(defn type-check [ast tenv]
  (cond
    (number? ast) "number"
    (= (get ast 0) "var") (lookup tenv (get ast 1))
    (= (get ast 0) "fn") "function"
    (= (get ast 0) "call") (check-call ast tenv)
    true (check-add ast tenv)))

(defn check-add [ast tenv]
  (if (and (= (type-check (get ast 1) tenv) "number") (= (type-check (get ast 2) tenv) "number"))
    "number"
    "TYPE ERROR: add needs two numbers"))
```

```
user=> (type-check ["add" 1 2] [])
"number"
user=> (type-check ["add" ["fn" "y" 1] 2] [])
"TYPE ERROR: add needs two numbers"
```

`type-check` mirrors `eval-env`'s own `cond` shape exactly — a bare number's type is `"number"`; a `"fn"` node's type is always `"function"`, without ever evaluating its body at all. `check-add` requires *both* operands to type-check as `"number"` — `["add" 1 2]` passes; `["add" ["fn" "y" 1] 2]` — trying to add a function to a number — fails, caught directly, with no computation ever actually attempted.

### Discard the throwaway example

Not applicable — `type-check`/`check-add` are real, reusable, and verified against both a valid and an invalid `"add"` node.

### Project Change

- **Reference Source**: Lesson 164's own `eval-env`, mirrored here structurally — the identical `cond` shape, computing types instead of values.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn check-add [ast tenv]
  (if (and (= (type-check (get ast 1) tenv) "number") (= (type-check (get ast 2) tenv) "number"))
    "number"
    "TYPE ERROR: add needs two numbers"))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(lookup tenv (get ast 1))`**, in `type-check`'s `"var"` branch — reappearing `lookup` (Lesson 154), applied to a **type environment** — types, not values, but the identical lookup mechanism.
- **`(= (get ast 0) "fn") "function"`** — first appearance of this specific idea: a function's type is always `"function"`, decided instantly, without ever looking inside its own body — the body's own correctness is a separate concern from the function's own type.
- **`(and (= (type-check (get ast 1) tenv) "number") (= (type-check (get ast 2) tenv) "number"))`** — reappearing `and`/`=` (Lesson 7, Lesson 6): both operands' types are checked *recursively*, before either is trusted to be a number.

### CS Lens

A type is being used here exactly as Lesson 155 defined it — a set of legal values (`"number"`, `"function"`) — but the *question* being asked is new: not "is this specific value a member," but "does this whole program's structure guarantee every value involved will be a member of the right type, for every possible run" — **static type checking**, checked once, before execution, rather than checked value-by-value during it.

### SE Lens

`type-check` never actually adds, calls, or evaluates anything — it only asks "would this be legal," the identical distinction Lesson 159 drew between syntax and semantics, now drawn a second time between *checking* semantics and *running* them.

---

## Concept Unit: The Same Mistake, Caught Early or Discovered Late

### The Problem

Does catching a type error before execution actually matter — or would the real interpreter have caught the identical mistake anyway, just as clearly?

### Introduce the concept in isolation

```clojure
(defn check-call [ast tenv]
  (if (= (type-check (get ast 1) tenv) "function")
    "number"
    "TYPE ERROR: call needs a function"))
```

```
user=> (type-check ["call" 5 3] [])
"TYPE ERROR: call needs a function"
user=> (eval-env ["call" 5 3] [])
Execution error (StackOverflowError) at user/eval-env.
```

`["call" 5 3]` — calling the plain number `5` as if it were a function — is caught cleanly by `type-check`, with a message naming exactly what's wrong. Run through `eval-env` directly, uncaught, the identical mistake produces a `StackOverflowError` — deep, real, and giving no indication at all that the actual problem was "`5` isn't a function." `eval-call` tries to read `5`'s own body and captured environment (`get 5 1`, `get 5 2` — both `nil`, since `get` on a number is always `nil`), then recurses on that `nil` AST forever, crashing only once the call stack itself runs out — nowhere near the real mistake, and saying nothing about what it actually was.

### Discard the throwaway example

Not applicable — both results are real, verified output: a clean type error, and a genuine, confusing runtime crash on the identical broken program.

### Project Change

- **Reference Source**: Lesson 164's own `eval-env`, run here deliberately without any type checking first, to contrast against this lesson's own `type-check`.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn check-call [ast tenv]
  (if (= (type-check (get ast 1) tenv) "function")
    "number"
    "TYPE ERROR: call needs a function"))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= (type-check (get ast 1) tenv) "function")`** — checks the "call" node's own function position *before* anything is evaluated — exactly the check `eval-call` (Lesson 165) never performs, since it always assumes its first argument really is a closure.

### CS Lens

This is the entire practical case for static typing, made concrete rather than argued abstractly: the *same* real mistake produces a clear, immediate diagnosis under type checking, and an unrelated-looking crash, arbitrarily far from the actual error, without it — not a difference in whether the mistake is caught, but in how clearly and how early.

### SE Lens

`eval-env` was never wrong to crash on `["call" 5 3]` — it was only ever built to handle well-typed programs, and this lesson's own `type-check` is what makes "well-typed" a checkable precondition instead of an unstated assumption every caller has to somehow already know to satisfy.

### Connection to the previous unit

The previous unit built the type-checking mechanism; this unit proves it catches a real, previously-unguarded runtime failure earlier and more clearly than letting the program simply run.

---

## Connect the Pieces

The identical broken program, checked before running and then actually run:

```clojure
(println "Type-checked first:" (type-check ["call" 5 3] []))
(println "Run directly, uncaught: StackOverflowError, no useful message")
```

```
Type-checked first: TYPE ERROR: call needs a function
Run directly, uncaught: StackOverflowError, no useful message
```

Same program, same real mistake — a clear diagnosis from one, a cryptic crash from the other.

## What Breaks Without This

Suppose a much larger program, built from many nested function calls, had this exact mistake buried somewhere deep inside — a value accidentally used where a function was expected, dozens of calls removed from where the program actually starts running. Without static type checking, that mistake surfaces only once execution actually reaches it, as some downstream crash (or, worse, a `StackOverflowError` with a stack trace pointing at generic interpreter machinery, not the actual line where the wrong value was created) — exactly this lesson's own demonstrated failure, at a scale where finding the real cause by hand would be far harder than on a four-node toy AST.

## Exercises

1. **Trace.** By hand, trace `(type-check ["add" 1 2] [])` through `type-check`/`check-add`, confirming both operands check as `"number"`.
2. **Predict.** Before checking, predict `(type-check ["call" ["fn" "y" 1] 3] [])` — calling a genuine function. Then verify it type-checks as `"number"`.
3. **Verify.** Confirm `(type-check ["var" "x"] [["x" "number"]])` correctly looks up `"x"`'s type from a type environment, the same way `lookup` (Lesson 154) already worked for values.
4. **Break it, on purpose.** Construct a *different* broken program — adding a function to a function, `["add" ["fn" "y" 1] ["fn" "z" 2]]` — and confirm `type-check` catches it while describing what `eval-env`, run directly, would likely do instead.
5. **Generalize.** Describe, without coding it, what `type-check`'s `"fn"` branch would need to check if function types tracked their *parameter's* type too, not just "function" as one flat category.
6. **Reconstruct.** Close this lesson. From memory, explain why the exact same mistake produces a clear message from `type-check` and a `StackOverflowError` from `eval-env` — name precisely what `eval-call` was missing that caused the crash.

## Definition of Done

- [ ] You can write a type checker that mirrors an interpreter's own AST-walking structure, computing types instead of values.
- [ ] You can explain why a type environment maps names to types, not values.
- [ ] You can demonstrate the identical real mistake caught cleanly by type checking and crashing confusingly at runtime.
- [ ] You completed Exercise 3 and confirmed type-environment lookup works the same way value-environment lookup does.
- [ ] You completed Exercise 4 and found a second real program `type-check` correctly rejects.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm type-environment lookup for x; find add-of-two-functions rejected by type-check with a clear message"` — not just `"lesson 173 exercise"`.

---

**Next lesson:** Lesson 174, *Type Inference*, asks whether `type-check`'s own type environment always has to be supplied by hand — or whether a program's real types can be *derived* automatically, from how its own variables are actually used.
