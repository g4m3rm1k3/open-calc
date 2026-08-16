# Lesson 165: Closures

**What you will build**: By the end of this lesson you'll add function definitions and function calls to Lesson 164's toy interpreter, and prove — with a real, deliberately broken alternative implementation — that a function must capture the environment it was *defined* in, not whichever environment happens to be active when it's *called*. Called from two different environments, a correct closure gives the identical answer, `105`, both times; a broken one that uses the caller's environment instead gives a genuinely different, wrong answer, `1004`.

**What you need to know first**: Lesson 164's `eval-env` and environment model; Lesson 151's `cond`; Lesson 154's `lookup`.

**Terms introduced in this lesson**:

- **closure** — a function value that carries, alongside its parameter and body, the environment that was active when it was defined. *Why it matters*: without it, a function couldn't reliably use a variable from its own defining context once it's called from somewhere else — the exact bug this lesson's own broken version demonstrates concretely.
- **lexical scope** — the rule that a variable reference resolves against the environment where it was *written*, not the environment active when that code happens to run. *Why it matters*: the property closures exist to implement correctly — "lexical" names the *textual* location a reference was written at, as opposed to whatever's dynamically calling it.

**Objects and methods used**: None new. This lesson reuses `cond` (Lesson 151), `lookup`/`extend-env`-style vector building (Lesson 154, Lesson 84), and `assoc` (Lesson 84), each already covered.

---

## Concept Unit: A Function Value Captures Its Environment

### The Problem

`["fn" "y" ["add" ["var" "x"] ["var" "y"]]]` — a function taking `y`, adding it to some outer `x` — needs `x` to come from *somewhere*. If this function is defined where `x` is `100`, then called later, does it matter what `x` means at the call site, or does the function need to remember where it came from?

### Introduce the concept in isolation

```clojure
(defn extend-env [env name value]
  (assoc env (count env) [name value]))

(defn eval-env [ast env]
  (cond
    (number? ast) ast
    (= (get ast 0) "var") (lookup env (get ast 1))
    (= (get ast 0) "fn") [(get ast 1) (get ast 2) env]
    (= (get ast 0) "call") (eval-call ast env)
    true (+ (eval-env (get ast 1) env) (eval-env (get ast 2) env))))
```

```
user=> (def outer-env [["x" 100]])
user=> (def fn-ast ["fn" "y" ["add" ["var" "x"] ["var" "y"]]])
user=> (eval-env fn-ast outer-env)
["y" ["add" ["var" "x"] ["var" "y"]] [["x" 100]]]
```

Evaluating a `"fn"` node doesn't run the function's body at all — it builds a **closure**: a three-element vector holding the parameter name (`"y"`), the body AST (unchanged), and, critically, `env` itself — `outer-env`, the environment active *right now*, at definition time. The function doesn't yet know what `y` will be, but it already knows, permanently, that `x` means `100` — captured, not merely referenced.

### Discard the throwaway example

Not applicable — real, verified output showing exactly what a closure value contains.

### Project Change

- **Reference Source**: Lesson 164's own `eval-env`, extended with a fourth `cond` branch for `"fn"` nodes.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn extend-env [env name value]
  (assoc env (count env) [name value]))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(assoc env (count env) [name value])`**, in `extend-env` — reappearing `assoc`-as-append (Lesson 94): adds one new binding to an environment, reusing the identical vector-as-lookup-table shape Lesson 154 already established.
- **`(= (get ast 0) "fn") [(get ast 1) (get ast 2) env]`** — first appearance of this specific idea: building a closure value bundles the AST's own parameter and body slots together with `env` itself — the entire mechanism this lesson exists to explain, in one line.

### CS Lens

`env`, bundled inside the closure, is exactly Lesson 139's own abstraction idea applied to a function: the closure's *interface* (call it with one argument, get a result) hides its *internals* (which environment it happens to carry) — a caller never needs to know or supply that environment explicitly.

### SE Lens

Capturing `env` by reference, not by copying its current contents into some separate frozen snapshot, means a closure and the code around it always agree about what any *shared* variable currently means — the real reason "capture the environment" and "capture a snapshot of specific values" are genuinely different designs with different consequences.

---

## Concept Unit: Calling a Closure — Captured Environment, Not Calling Environment

### The Problem

A closure carries its own captured environment. When it's actually called, should the function body evaluate against *that* captured environment, or against whatever environment happens to be active at the call site?

### Introduce the concept in isolation

```clojure
(defn eval-call [ast env]
  (call-closure (eval-env (get ast 1) env) (eval-env (get ast 2) env)))

(defn call-closure [closure arg-value]
  (eval-env (get closure 1) (extend-env (get closure 2) (get closure 0) arg-value)))
```

```
user=> (def closure-val (eval-env fn-ast outer-env))
user=> (def env-call-site-1 (extend-env outer-env "f" closure-val))
user=> (def env-call-site-2 (extend-env [["x" 999]] "f" closure-val))
user=> (def call-ast ["call" ["var" "f"] 5])
user=> (eval-env call-ast env-call-site-1)
105
user=> (eval-env call-ast env-call-site-2)
105
```

`closure-val` is built once, capturing `x = 100`. `env-call-site-1` and `env-call-site-2` both bind the name `"f"` to that identical closure — but disagree about what `x` itself means at each call site (`100` versus `999`). Calling `f` from *either* site gives the identical answer, `105`: `call-closure` builds the function body's evaluation environment from `(get closure 2)` — the *captured* environment — extended with the new parameter binding, never touching the calling environment's own `x` at all.

### Discard the throwaway example

Not applicable — `eval-call`/`call-closure` are real, reusable, and verified to give the identical, correct answer from two genuinely different calling environments.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch function-call mechanism built on this lesson's own closure representation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn call-closure [closure arg-value]
  (eval-env (get closure 1) (extend-env (get closure 2) (get closure 0) arg-value)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get closure 2)`** — first appearance of this specific access: reads the closure's own *captured* environment — never the environment `eval-call` itself was passed.
- **`(extend-env (get closure 2) (get closure 0) arg-value)`** — reappearing `extend-env` (this lesson's first unit): builds the body's real evaluation environment by adding just the new parameter binding on top of the captured environment, nothing from the call site mixed in.
- **`(eval-env (get closure 1) ...)`** — reappearing `eval-env` (Lesson 164): evaluates the closure's own body AST against that newly built environment.

### CS Lens

This is **lexical scope**: `x` inside the function body resolves against the environment where the function was *written*, not wherever it's *called from* — the alternative, resolving against the calling environment instead, is called **dynamic scope**, a real, different design choice most modern languages deliberately reject for exactly the surprising-result reason this lesson's own next unit demonstrates.

### SE Lens

Lexical scope is what makes a function's own behavior predictable purely by reading its own definition — a reader never has to trace every possible call site to know what a variable inside a function means, since it's fixed permanently at definition time, not dependent on where the function happens to get called from later.

### Connection to the previous unit

The previous unit built the closure, capturing an environment; this unit proves that captured environment, not the calling one, is what actually gets used — the entire mechanism this lesson exists to explain, made concrete on real, contrasting input.

---

## Concept Unit: What Dynamic Scoping Would Have Done Instead

### The Problem

Is the previous unit's result — `105` regardless of calling environment — actually load-bearing, or would a simpler implementation, ignoring the captured environment, have given the identical answer anyway?

### Introduce the concept in isolation

```clojure
(defn call-closure-broken [closure arg-value calling-env]
  (eval-env (get closure 1) (extend-env calling-env (get closure 0) arg-value)))
```

```
user=> (eval-call-broken call-ast env-call-site-2)
1004
```

`call-closure-broken` builds the body's evaluation environment from `calling-env` — the environment active at the *call site* — instead of the closure's own captured one. Called from `env-call-site-2`, where `x` means `999`, it computes `999 + 5 = 1004`, not `105`. The identical closure, the identical call — only which environment gets consulted differs, and that one difference changes the real, computed answer.

### Discard the throwaway example

Not applicable — `1004` is a real, verified result, proving the divergence concretely rather than asserting it.

### Project Change

- **Reference Source**: No reference counterpart — a deliberately incorrect variant, built specifically to demonstrate this lesson's own point by contrast.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit's function is deliberately incorrect and exists only to demonstrate a real divergence, not as code to adopt.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(extend-env calling-env (get closure 0) arg-value)`** — the one real difference from `call-closure`: `calling-env` in place of `(get closure 2)`, using whatever environment happened to be active at the call site instead of the one captured at definition time.

### CS Lens

This is dynamic scoping, made concrete rather than described abstractly: `x` resolves to whatever `x` currently means at the moment of the call, which can silently change depending on *where in the program* a function happens to get called from — a real, historical design choice some older languages made, and a real, ongoing source of exactly this kind of surprising bug in the languages that did.

### SE Lens

The real cost of dynamic scoping isn't that it's always wrong — it's that a function's own behavior becomes dependent on its entire calling context, which a reader can't determine just by reading the function's own definition; every one of this lesson's own closures avoids that cost by capturing its environment once, permanently, at the only moment — definition — where "which environment" has one unambiguous answer.

### Connection to the previous unit

The previous unit showed the correct, captured-environment behavior; this unit shows the real, concrete divergence a plausible-looking alternative produces, proving the capture in the previous unit was never optional scaffolding.

---

## Connect the Pieces

Correct and broken, side by side, on the identical closure and call:

```clojure
(println "Correct (captured env), site 1:" (eval-env call-ast env-call-site-1))
(println "Correct (captured env), site 2:" (eval-env call-ast env-call-site-2))
(println "Broken (calling env), site 2:" (eval-call-broken call-ast env-call-site-2))
```

```
Correct (captured env), site 1: 105
Correct (captured env), site 2: 105
Broken (calling env), site 2: 1004
```

The correct version agrees with itself regardless of calling context — exactly what "the function's own meaning doesn't depend on where it's called from" requires; the broken version doesn't, proving that requirement was never automatic.

## What Breaks Without This

Suppose a real program passed a closure as an argument into a much larger, unrelated function — a genuinely common pattern (Lesson 25's own `map`, taking a function to apply, is a simpler cousin of exactly this). If closures used dynamic scoping, that closure's own behavior would silently depend on whatever local variables happened to exist inside the unrelated function it was passed into — a real correctness hazard invisible from reading the closure's own definition, discoverable only by tracing every possible place it might eventually get called from. Lexical scope, implemented by capturing the environment once at definition time, is what makes passing a function around as a plain value safe at all.

## Exercises

1. **Trace.** By hand, trace `(eval-env call-ast env-call-site-1)` through `eval-call`/`call-closure`, confirming which environment `add`'s own two `var` lookups actually resolve against.
2. **Predict.** Before checking, predict `(eval-call-broken call-ast env-call-site-1)` — the broken version, called from `env-call-site-1` specifically, where the calling environment's own `x` happens to already be `100`. Then verify, and explain why it agrees with the correct version *here*, even though it disagreed at `env-call-site-2`.
3. **Verify.** Build a second closure capturing `x = 7` instead of `100`, and confirm calling it gives a different real result than `closure-val`, even when called from the identical environment.
4. **Break it, on purpose, differently.** Modify `call-closure` to ignore the parameter binding entirely — evaluate the body directly against the captured environment, with no `extend-env` call at all — and describe the real error or wrong result this produces.
5. **Generalize.** Describe, without coding it, how `["fn" "y" ...]` and `eval-env`'s own `"fn"` branch would need to change to support a function with *two* parameters instead of one.
6. **Reconstruct.** Close this lesson. From memory, explain why `1004` versus `105` proves closures need to capture their defining environment — using this lesson's own two numbers, not a general statement about scoping.

## Definition of Done

- [ ] You can build a closure value and explain what each of its three slots holds.
- [ ] You can call a closure and explain why its body evaluates against the captured environment, not the calling one.
- [ ] You can explain the real difference between lexical and dynamic scoping, using this lesson's own `105`-versus-`1004` result.
- [ ] You completed Exercise 3 and confirmed two closures capturing different values for `x` give different real results.
- [ ] You completed Exercise 4 and described the real failure from skipping the parameter binding entirely.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm a second closure capturing x=7 gives 12, not 105; show skipping extend-env causes the parameter y to be unresolvable"` — not just `"lesson 165 exercise"`.

---

**Next lesson:** Lesson 166, *Evaluation Strategies*, asks a question this lesson's own `eval-call` never had to face — exactly *when* an argument like `arg-value` actually gets evaluated, before or during the call — comparing eager, lazy, and call-by-name evaluation on this section's own toy interpreter.
