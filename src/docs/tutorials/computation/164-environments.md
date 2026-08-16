# Lesson 164: Environments

**What you will build**: By the end of this lesson you'll extend Lesson 163's `eval-ast` to handle a third AST shape — `["var" "x"]`, a variable reference — resolved by looking it up in a real **environment**: a mapping from names to values, reusing Lesson 154's own lookup table directly. `(eval-env ["add" ["var" "x"] ["add" ["var" "y"] 3]] [["x" 10] ["y" 20]])` correctly computes `33`, a real expression mixing variables and literals, evaluated against a real environment.

**What you need to know first**: Lesson 163's `eval-ast`; Lesson 154's `lookup`/`lookup-at`, reused directly as this lesson's environment; Lesson 151's `cond`.

**Terms introduced in this lesson**:

- **environment** — a mapping from variable names to their currently bound values, consulted during evaluation whenever a variable reference is encountered. *Why it matters*: an AST node like `["var" "x"]` names a variable but doesn't carry its value — the environment is where that value actually lives, separate from the AST itself.

**Objects and methods used**: None new. This lesson reuses `lookup`/`lookup-at` (Lesson 154), `cond` (Lesson 151), and `number?` (Lesson 41), each already covered.

---

## Concept Unit: A Third AST Shape — Variable References

### The Problem

Lesson 163's `eval-ast` handles two AST shapes: a bare number, and an `"add"` node. Real expressions need a third: a reference to a variable, whose value isn't written in the AST at all — it has to come from somewhere else, supplied separately.

### Introduce the concept in isolation

```clojure
(defn eval-env [ast env]
  (cond
    (number? ast) ast
    (= (get ast 0) "var") (lookup env (get ast 1))
    true (+ (eval-env (get ast 1) env) (eval-env (get ast 2) env))))
```

```
user=> (def env [["x" 10] ["y" 20]])
user=> (eval-env ["var" "x"] env)
10
user=> (eval-env ["add" ["var" "x"] 5] env)
15
```

`env` is Lesson 154's own lookup table, reused directly — a real environment, mapping `"x"` to `10` and `"y"` to `20`. `["var" "x"]` is a new AST shape: not a number, not an `"add"` node, but a name to be resolved. `eval-env`, using `cond` (Lesson 151) instead of `eval-ast`'s plain `if`, checks all three shapes directly: a bare number evaluates to itself; a `"var"` node's second slot is looked up in `env`; anything else — an `"add"` node — recurses on both operands, exactly as before, now also threading `env` through so a variable buried anywhere inside can still be resolved.

### Discard the throwaway example

Not applicable — `eval-env` is real, reusable, and verified against a bare variable and a variable combined with a literal.

### Project Change

- **Reference Source**: Lesson 163's own `eval-ast`, extended here with a third `cond` branch and a threaded `env` parameter; Lesson 154's `lookup`, reused unchanged as the environment itself.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn eval-env [ast env]
  (cond
    (number? ast) ast
    (= (get ast 0) "var") (lookup env (get ast 1))
    true (+ (eval-env (get ast 1) env) (eval-env (get ast 2) env))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(cond (number? ast) ast ...)`** — reappearing `cond` (Lesson 151): the first branch, reappearing from `eval-ast` (Lesson 163) unchanged.
- **`(= (get ast 0) "var") (lookup env (get ast 1))`** — first appearance of this specific branch: recognizes a variable-reference AST node by its own tag, then resolves it via Lesson 154's own `lookup`, using the node's second slot (the variable's name) as the lookup key.
- **`(+ (eval-env (get ast 1) env) (eval-env (get ast 2) env))`** — reappearing recursive shape (Lesson 163), now threading `env` through both recursive calls, so a variable nested arbitrarily deep inside an `"add"` node still resolves against the identical environment.

### CS Lens

This is `chain`'s own composition idea (Lesson 154), inverted: `chain` threaded a *possibly-failing value* through a sequence of steps; `eval-env` threads a *fixed environment* through a whole recursive evaluation instead — a different thing being carried, the identical discipline of passing it explicitly rather than relying on it being available from nowhere.

### SE Lens

Passing `env` as an explicit argument, rather than reaching for some global lookup table, means `eval-env` can be called with *different* environments for the identical AST — the same expression, `x + 5`, means `15` under one environment and something else entirely under another, a real flexibility a hardcoded lookup could never offer.

---

## Connect the Pieces

A real expression, mixing variables and literals, evaluated against a real environment:

```clojure
(println "x + y:" (eval-env ["add" ["var" "x"] ["var" "y"]] env))
(println "x + (y + 3):" (eval-env ["add" ["var" "x"] ["add" ["var" "y"] 3]] env))
```

```
x + y: 30
x + (y + 3): 33
```

Both expressions resolve their variables against the identical `env`, and both recurse correctly through `"add"` nodes that themselves contain variable references — the third `cond` branch and the threaded `env` parameter working together on genuinely nested input, not just the simplest one-variable case.

## What Breaks Without This

Suppose `eval-env` were called with an environment missing a variable the AST actually references — say, `(eval-env ["var" "z"] env)`, and `env` has no `"z"` entry at all. `lookup` (Lesson 154) returns `nil` for a missing key, exactly its own documented behavior — meaning `eval-env` would silently return `nil` for an undefined variable, rather than a clear "undefined variable" error. A real language implementation needs to decide deliberately whether that's acceptable or whether looking up a genuinely undefined variable should be treated as an error instead — a design choice this lesson's own `eval-env` doesn't yet make, inherited directly from `lookup`'s own quiet Lesson 154 behavior.

## Exercises

1. **Trace.** By hand, trace `(eval-env ["add" ["var" "x"] ["add" ["var" "y"] 3]] env)` through every recursive call, confirming which lookup happens when.
2. **Predict.** Before checking, predict `(eval-env ["var" "z"] env)` — a variable `env` doesn't contain. Then verify it returns `nil`, and explain why using Lesson 154's own `lookup` behavior.
3. **Verify.** Confirm `eval-env` on the identical AST, called with *two different* environments, produces two different real results.
4. **Break it, on purpose.** Modify `eval-env` so that a missing variable causes a real, visible error instead of silently returning `nil` — describe the real tradeoff between the two behaviors.
5. **Generalize.** Describe, without coding it, how the grammar (Lesson 160) and parser (Lesson 161) would need to change to actually produce `["var" "x"]` nodes from real syntax, rather than being written by hand the way this lesson's own examples were.
6. **Reconstruct.** Close this lesson. From memory, explain why `env` has to be threaded through *every* recursive call in `eval-env`, not just checked once at the top.

## Definition of Done

- [ ] You can extend an interpreter to handle a new AST shape by adding a `cond` branch.
- [ ] You can explain why an environment is passed as an explicit argument rather than assumed to be globally available.
- [ ] You can evaluate a real expression mixing variables and literals against a real environment.
- [ ] You completed Exercise 3 and confirmed the same AST evaluates differently under two different environments.
- [ ] You completed Exercise 4 and described the real tradeoff between silent `nil` and a visible error for undefined variables.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and built — for example, `"Confirm (add (var x) 5) gives 15 under env1 and a different result under env2; add explicit undefined-variable error handling"` — not just `"lesson 164 exercise"`.

---

**Next lesson:** Lesson 165, *Closures*, asks what should happen to an environment when a function is defined inside one and then called somewhere else entirely — the real problem lexical scope exists to solve, building directly on this lesson's own environment model.
