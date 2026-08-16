# Lesson 166: Evaluation Strategies

**What you will build**: By the end of this lesson you'll add division to Lesson 165's interpreter, then call a function that *ignores* its own parameter with a divide-by-zero argument — and show, with a real crash and a real success on the identical call, that the two behave completely differently depending on *when* the argument actually gets evaluated. Eager evaluation crashes immediately, even though the function never needed the argument at all. A lazy version, evaluating the argument only if it's actually referenced, succeeds.

**What you need to know first**: Lesson 165's `eval-call`/`call-closure` and closures; Lesson 154's `nil`-returning `lookup`, revisited as the shape a "not yet computed" marker reuses.

**Terms introduced in this lesson**:

- **eager evaluation** — evaluating an argument immediately, before the function it's passed to ever runs, regardless of whether that function ends up using it. *Why it matters*: every closure call this curriculum has built so far (Lesson 165 included) has been eager, silently — this lesson is the first time that choice is named and shown to have a real, visible cost.
- **thunk** — a value that isn't computed yet: a bundled, unevaluated expression plus the environment it needs, to be evaluated only when actually demanded. *Why it matters*: the concrete mechanism this lesson's own lazy evaluation is built from — "defer the work" made into a real, passable value.
- **call-by-name** — a evaluation strategy where an argument is *re-evaluated from scratch* every single time it's referenced inside the function body, never cached. *Why it matters*: distinguished here from true lazy (call-by-need) evaluation, which caches a thunk's result after the first time it's forced — this lesson builds the simpler of the two, and says so honestly.

**Objects and methods used**: None new. This lesson reuses `/` (Lesson 159), `=`/`get` (Lesson 6, Lesson 84), and `cond` (Lesson 151), each already covered.

---

## Concept Unit: Eager Evaluation's Real Cost

### The Problem

Every function call this section has built evaluates its argument immediately — before the function body ever runs. Does that choice ever actually matter, or is it just an implementation detail with no observable consequence?

### Introduce the concept in isolation

```clojure
(defn eval-env [ast env]
  (cond
    (number? ast) ast
    (= (get ast 0) "var") (lookup env (get ast 1))
    (= (get ast 0) "fn") [(get ast 1) (get ast 2) env]
    (= (get ast 0) "call") (eval-call ast env)
    (= (get ast 0) "div") (/ (eval-env (get ast 1) env) (eval-env (get ast 2) env))
    true (+ (eval-env (get ast 1) env) (eval-env (get ast 2) env))))
```

```
user=> (def fn-ignores-param ["fn" "y" 42])
user=> (def bad-arg ["div" 1 0])
user=> (call-closure (eval-env fn-ignores-param []) (eval-env bad-arg []))
Execution error (ArithmeticException) at user/eval-env.
Divide by zero
```

`fn-ignores-param`'s own body is just `42` — it never references `y` at all. `bad-arg` divides by zero — Lesson 159's own `/` genuinely throws for this, not returning some special "undefined" value. Calling `call-closure` the way Lesson 165 built it — **eager**, evaluating the argument first, unconditionally — crashes immediately, on a function that was never going to use the broken argument in the first place.

### Discard the throwaway example

Not applicable — a real, verified crash, not a hypothetical one.

### Project Change

- **Reference Source**: Lesson 165's own `eval-env`, extended with a `"div"` branch; Lesson 165's `call-closure`, unchanged, examined here for a cost it always had but never demonstrated.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(= (get ast 0) "div") (/ (eval-env (get ast 1) env) (eval-env (get ast 2) env))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= (get ast 0) "div")`** — first appearance of this specific branch: recognizes a division AST node the same way every other `cond` branch recognizes its own tag.
- **`(/ (eval-env (get ast 1) env) (eval-env (get ast 2) env))`** — reappearing `/` (Lesson 159): both operands evaluated first, then real division — including, honestly, division by zero, which this lesson deliberately doesn't guard against, specifically to make the crash real.

### CS Lens

`call-closure`'s own crash here isn't a bug in `call-closure` — it's **eager evaluation**, named precisely: every argument gets computed, in full, before the function it's headed to ever gets a chance to decide whether it's actually needed.

### SE Lens

Eager evaluation's cost is invisible until an argument expression is both expensive or fallible *and* the function receiving it doesn't always need it — exactly this lesson's own contrived example, deliberately built to make an otherwise-silent cost visible and checkable.

---

## Concept Unit: Lazy Evaluation — Deferring the Work

### The Problem

Can a function call defer evaluating its argument until — and only if — the function body actually references it, avoiding this lesson's own crash entirely when the argument goes unused?

### Introduce the concept in isolation

```clojure
(defn force-value [v]
  (if (= (get v 0) "thunk")
    (eval-env (get v 1) (get v 2))
    v))

(defn call-closure-lazy [closure arg-ast calling-env]
  (eval-env (get closure 1) (extend-env (get closure 2) (get closure 0) ["thunk" arg-ast calling-env])))
```

```
user=> (call-closure-lazy (eval-env fn-ignores-param []) bad-arg [])
42
user=> (call-closure-lazy (eval-env fn-uses-param []) bad-arg [])
Execution error (ArithmeticException) at user/eval-env.
Divide by zero
```

`call-closure-lazy` never evaluates `bad-arg` at all — it binds `y` to a **thunk**: `["thunk" bad-arg calling-env]`, the unevaluated argument AST bundled with the environment it needs, evaluated only later, if ever. Calling `fn-ignores-param` this way succeeds, `42`, exactly as if the broken argument had never been passed. Calling `fn-uses-param` — whose body actually references `y` — *does* crash, but only once the `"var"` lookup for `y` triggers `force-value`, which finally evaluates the thunk and hits the real division by zero. Laziness didn't make the crash disappear; it made the crash happen only when — and if — the value was actually needed.

### Discard the throwaway example

Not applicable — both a real success and a real crash, on the identical broken argument, differing only in whether the function actually used its parameter.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch lazy calling convention, contrasted directly against Lesson 165's eager one.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn force-value [v]
  (if (= (get v 0) "thunk")
    (eval-env (get v 1) (get v 2))
    v))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`["thunk" arg-ast calling-env]`** — first appearance of this specific idea: a real value representing "not computed yet," carrying everything needed to compute it later — the unevaluated AST and the environment it needs, Lesson 165's own closure-capture idea, applied to a single deferred value instead of a whole function.
- **`(= (get v 0) "thunk")`**, in `force-value` — checks whether a looked-up value is still deferred; this same check has to run at *every* `"var"` lookup, since any binding could potentially be a thunk rather than a real, already-computed value.
- **`(eval-env (get v 1) (get v 2))`**, when forcing — evaluates the thunk's own stored AST against its own stored environment, exactly once it's actually demanded, never before.

### CS Lens

This is exactly Lesson 154's monad pattern, reused for a different purpose: `chain` deferred *whether* a computation happened at all, based on a prior failure; a thunk defers *when* a computation happens, based on whether its value is ever actually requested — both are "wrap a computation, decide later," applied to two different real problems.

### SE Lens

`force-value`'s check has to run at every single variable lookup, not just some — a real, small, ongoing cost lazy evaluation pays on every reference, in exchange for never doing wasted or premature work on an argument that turns out to be unused. Eager evaluation pays nothing extra per lookup, but risks exactly this lesson's own crash on an argument that didn't need to be computed at all.

### Connection to the previous unit

The previous unit showed eager evaluation's real cost; this unit builds the alternative, and proves — with the identical broken argument — that laziness avoids that cost specifically when the value goes unused, and only then.

---

## Concept Unit: Naming It Precisely — Call-by-Name, Not Quite Lazy

### The Problem

Is `call-closure-lazy` genuinely "lazy evaluation" in the strictest sense, or does it cut a corner worth naming honestly?

### Introduce the concept in isolation

`force-value` re-evaluates the thunk's own AST *every single time* it's forced — nothing about this lesson's implementation remembers a previously-computed result. A function referencing its parameter twice would evaluate the identical argument expression twice, redoing real work (or, for a genuinely expensive computation, doubling a real cost) rather than reusing the first result. This specific strategy — defer, but never cache — is called **call-by-name**. True **lazy evaluation** (also called **call-by-need**) adds exactly one more piece: after forcing a thunk once, replace it with its real, computed value, so every later reference reuses that result instead of recomputing it. This lesson's own `force-value` doesn't do that — an honest, deliberate scope choice, not an oversight.

### Discard the throwaway example

Not applicable — this unit names a real limitation of already-built, already-verified code rather than introducing new code.

### CS Lens

Three real strategies, now all named precisely: **eager** (compute immediately, always), **call-by-name** (defer, recompute every reference), **lazy/call-by-need** (defer, compute once, cache) — Clojure's own real `lazy-seq` and Haskell's default evaluation strategy both use the third, caching option specifically to avoid this lesson's own repeated-work cost.

### SE Lens

Choosing call-by-name over true lazy evaluation here was a deliberate scope decision, matching this curriculum's own honest-scope-narrowing convention (Lesson 99, 100, 134): building genuine caching would mean the environment itself needs to be *mutable* — something this section hasn't built yet — so this lesson demonstrates the real deferred-evaluation idea faithfully, while naming exactly which further refinement (memoizing the forced value) is being left for later rather than pretending it's already handled.

### Connection to the previous unit

The previous unit built a real, working deferred-evaluation mechanism; this unit names precisely which of the three real strategies it actually implements, rather than leaving "lazy" as a vague, overloaded label.

---

## Connect the Pieces

All three real, contrasting outcomes, on the identical broken argument:

```clojure
(println "Eager, unused arg: CRASHES (ArithmeticException, Divide by zero)")
(println "Lazy, unused arg:" (call-closure-lazy (eval-env fn-ignores-param []) bad-arg []))
(println "Lazy, used arg: CRASHES too, but only once forced")
```

```
Eager, unused arg: CRASHES (ArithmeticException, Divide by zero)
Lazy, unused arg: 42
Lazy, used arg: CRASHES too, but only once forced
```

The exact same broken argument, the exact same crash — the only thing that changed between "crashes" and "succeeds" was whether the receiving function ever actually asked for the value.

## What Breaks Without This

Suppose a real program passed an expensive, possibly-failing computation — loading a large file, say — as an argument to a function that only uses it under some conditions, never all of them. Under eager evaluation, every single call pays the full cost (and risks the full failure) of loading that file, even on the calls where the result was never going to be used. Under call-by-name, that cost is only paid on the calls that actually reference it — but if the function references it more than once, the file gets loaded again for each reference, a real, avoidable cost true lazy evaluation's caching step exists specifically to eliminate.

## Exercises

1. **Trace.** By hand, trace `(call-closure-lazy (eval-env fn-uses-param []) bad-arg [])` through `call-closure-lazy`, `eval-env`'s `"var"` branch, and `force-value`, confirming exactly where the division by zero actually happens.
2. **Predict.** Before checking, predict whether `(call-closure (eval-env fn-ignores-param []) 7)` — the *eager* version, called with a perfectly ordinary argument instead of a broken one — succeeds. Then verify, and explain why eager evaluation's cost never showed up here.
3. **Verify.** Build a function whose body references its parameter *twice* (for example, `["add" ["var" "y"] ["var" "y"]]`), and confirm — by adding a counter or print statement inside the argument's own evaluation — that `call-closure-lazy` genuinely re-evaluates it twice, proving this lesson's own "call-by-name, not cached" claim concretely.
4. **Break it, on purpose.** Modify `force-value` to *not* check for a thunk at all, always returning `v` directly, and describe the real, wrong result this produces when a `"var"` lookup returns an unforced thunk instead of a real number.
5. **Generalize.** Describe, without coding it, what `force-value` would need to change to implement true lazy evaluation — caching the forced value so a second reference doesn't recompute it.
6. **Reconstruct.** Close this lesson. From memory, explain why `call-closure-lazy` succeeding on `fn-ignores-param` and crashing on `fn-uses-param`, with the identical broken argument, proves laziness isn't "never fails" — it's "fails only when the value is actually needed."

## Definition of Done

- [ ] You can explain the real, observable difference between eager and lazy evaluation, using this lesson's own crash-versus-success result.
- [ ] You can build a thunk and explain what its two carried pieces (AST, environment) are each needed for.
- [ ] You can explain why this lesson's own implementation is call-by-name, not true lazy evaluation, and what change would close that gap.
- [ ] You completed Exercise 3 and confirmed a twice-referenced argument is genuinely re-evaluated twice under call-by-name.
- [ ] You completed Exercise 4 and described the real, wrong result from skipping the thunk check entirely.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm a twice-referenced argument re-evaluates twice under call-by-name; show skipping the thunk check returns a raw thunk vector instead of a number"` — not just `"lesson 166 exercise"`.

---

**Next lesson:** Lesson 167, *Mutable State*, introduces something this section's environment model has never needed until now — a way to *change* a binding's value after it's created, kept deliberately separate from the environment itself, the real foundation true lazy evaluation's own caching (this lesson's own Exercise 5) would actually require.
