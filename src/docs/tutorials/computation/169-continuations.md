# Lesson 169: Continuations

**What you will build**: By the end of this lesson you'll compute the identical inner expression, `2 + 3`, and route its result to two genuinely different next steps — `add-one-then-done` and `double-then-done` — getting `6` from one and `10` from the other, on the *same* computation. That swappable "what happens next" is a **continuation**: the rest of a computation, turned into a real, passable value instead of something implicit and fixed.

**What you need to know first**: Lesson 165's closures, revisited here as a similar "bundle up a piece of computation" idea; Lesson 156's denotation.

**Terms introduced in this lesson**:

- **continuation** — a function representing "the rest of the computation": what to do with a value once it's produced, made into a real, callable, swappable value rather than an implicit next step. *Why it matters*: ordinary function calls always return to one fixed place — the caller; a continuation makes "where does this result go next" an explicit, changeable choice.
- **continuation-passing style (CPS)** — writing code so that, instead of returning a value directly, a function calls its continuation with that value. *Why it matters*: the actual technique this lesson's own `compute-with-k` uses — every one of this lesson's functions takes a continuation argument and calls it, rather than using a plain `return`.

**Objects and methods used**: None new. This lesson reuses `+`/`*` (Lesson 2), each already covered.

---

## Concept Unit: The Same Computation, Two Different "Next Steps"

### The Problem

`(+ 2 3)` always produces `5`, and ordinarily that `5` goes back to whatever called it — one fixed destination. Can "what happens to this `5`" be made into something explicit and swappable, instead of implicit and fixed?

### Introduce the concept in isolation

```clojure
(defn add-one-then-done [x] (+ x 1))
(defn double-then-done [x] (* x 2))

(defn compute-with-k [k] (k (+ 2 3)))
```

```
user=> (compute-with-k add-one-then-done)
6
user=> (compute-with-k double-then-done)
10
```

`compute-with-k` never returns `(+ 2 3)`'s result directly — it calls `k`, its own argument, *with* that result. `k` is the **continuation**: "what to do next," passed in rather than hardcoded. The identical inner computation, `2 + 3 = 5`, reaches two completely different final answers depending purely on which continuation receives it — `6` when the next step adds one, `10` when the next step doubles.

### Discard the throwaway example

Not applicable — real, verified output showing the identical sub-computation reaching two different real final answers.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch, minimal demonstration of continuation-passing style.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn compute-with-k [k] (k (+ 2 3)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(+ 2 3)`** — reappearing `+` (Lesson 2): computed first, exactly as always — continuations change what happens to a result, never how it's computed.
- **`(k (+ 2 3))`** — first appearance of this specific shape: calling `k`, a plain function received as an argument, with the just-computed value — **continuation-passing style**, the technique this whole lesson is built from.

### CS Lens

A continuation is Lesson 165's own closure idea, aimed at a different target: a closure bundles "code plus the environment it needs"; a continuation bundles "what happens with a value, once it exists" — both are ordinary computation, turned into a real, passable value instead of staying implicit.

### SE Lens

Making "what happens next" explicit costs real readability for ordinary code — `(+ 2 3)` alone is simpler than `(compute-with-k add-one-then-done)` — which is exactly why CPS is reached for deliberately, not by default: it earns its cost specifically when "what happens next" itself needs to vary, be saved, or be invoked more than once, none of which plain function returns support.

---

## Concept Unit: Threading a Continuation Through Nested Computation

### The Problem

Does this same idea work once the computation itself has more than one step — does the continuation still reach the *final* answer, or only the innermost one?

### Introduce the concept in isolation

```clojure
(defn after-multiply [k result] (k (+ result 4)))
(defn compute-nested [k] (after-multiply k (* 2 3)))
(defn finish [x] x)
```

```
user=> (compute-nested finish)
10
user=> (compute-nested double-then-done)
20
```

`compute-nested` computes `2 \times 3 = 6` first, then calls `after-multiply` — passing its *own* continuation `k` straight through, unchanged — which adds `4` (`6 + 4 = 10`) and *then* finally calls `k` with that result. `finish`, a continuation that just returns its argument unchanged, reaches `10` — the plain answer. `double-then-done`, the identical continuation from the previous unit, reaches `20` instead — the *same* two-step computation, `(2 \times 3) + 4`, routed to a different final step.

### Discard the throwaway example

Not applicable — real, verified output confirming the continuation reaches the true final result, not just the first intermediate one.

### Project Change

- **Reference Source**: No reference counterpart — extends this lesson's own first unit to a genuinely nested computation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn after-multiply [k result] (k (+ result 4)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(after-multiply k (* 2 3))`**, in `compute-nested` — first appearance of this specific idea: the *same* continuation `k` gets threaded one level deeper, rather than each step inventing its own.
- **`(k (+ result 4))`**, in `after-multiply` — the continuation is only ever called once, at the true end of the computation — not after the multiply, only after the add that follows it.
- **`finish`** — first appearance of the simplest possible continuation: "do nothing further, just return this value" — the implicit behavior every ordinary function call already has, made explicit here for the first time.

### CS Lens

A full continuation-passing-style interpreter would rewrite Lesson 163's own `eval-ast` this identical way — every recursive call taking a continuation instead of returning — a genuine, real technique used by real compilers and interpreters, deliberately not fully built here: threading a continuation through every branch of `eval-env`'s own growing `cond` is real, additional complexity this lesson scopes out honestly, keeping the core idea — a continuation is a real, swappable value — isolated and checkable on its own first.

### SE Lens

`after-multiply` never had to know or care *what* `k` eventually does — `finish` and `double-then-done` are both perfectly valid continuations to hand it, exactly the same substitutability Lesson 139's abstraction already named: `after-multiply`'s own interface (call `k` with the right value) is all that matters, not any particular continuation's internals.

### Connection to the previous unit

The previous unit swapped continuations on a single-step computation; this unit proves the identical swap still reaches the true final answer once a second step is threaded in between.

---

## Connect the Pieces

The same nested computation, two different continuations, two different real endings:

```clojure
(println "2*3+4, continuation = finish:" (compute-nested finish))
(println "2*3+4, continuation = double:" (compute-nested double-then-done))
```

```
2*3+4, continuation = finish: 10
2*3+4, continuation = double: 20
```

Neither `compute-nested` nor `after-multiply` changed at all between these two calls — only which continuation was handed in, proving the "rest of the computation" really is a separate, swappable piece, not baked into the computation itself.

## What Breaks Without This

Suppose a real program needed to abandon a computation partway through — skip the rest of the current expression entirely and jump straight to some outer point, the way an early `return` or a thrown exception does. Ordinary function calls can't do this: each one always returns to its own direct caller, one level up, with no way to skip several levels at once. A continuation can: calling a *different* continuation than the "normal" next step — one that jumps straight to an outer completion instead of continuing the current chain — is exactly the real mechanism Lesson 170's exceptions are built from, previewed here rather than built, since it needs one more real piece (a way to genuinely *not* return to the immediate caller) this lesson's own simple examples never required.

## Exercises

1. **Trace.** By hand, trace `(compute-nested double-then-done)` through `compute-nested`/`after-multiply`, confirming the continuation is called exactly once, with the value `10`, not `6`.
2. **Predict.** Before checking, predict `(compute-with-k finish)` — the simplest possible continuation, on this lesson's own first computation. Then verify it just returns `5` unchanged.
3. **Verify.** Write a third continuation, `square-then-done`, and confirm `(compute-nested square-then-done)` gives `100`, not `20`.
4. **Break it, on purpose.** Modify `after-multiply` to call `k` with `result` directly, skipping the `+ 4` step entirely, and describe exactly which real value each of this lesson's own two `compute-nested` calls would now produce instead.
5. **Generalize.** Describe, without coding it, how `eval-env` (Lesson 164) would need to change to thread a continuation through its own `"add"` branch — which of its two recursive calls would need to happen first, and what the continuation for the second one would need to do with both results.
6. **Reconstruct.** Close this lesson. From memory, explain why `6` and `10` from this lesson's own first unit prove a continuation is a real, separate value — not just a description of what happens next.

## Definition of Done

- [ ] You can write a function in continuation-passing style, calling its continuation instead of returning directly.
- [ ] You can swap which continuation a computation uses and predict the resulting final answer.
- [ ] You can thread a single continuation through a two-step computation and confirm it's only called once, at the true end.
- [ ] You completed Exercise 3 and confirmed a third, self-written continuation produces the correct result.
- [ ] You completed Exercise 4 and correctly predicted both real results after removing the `+ 4` step.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you built and found — for example, `"Implement square-then-done, confirm compute-nested gives 100; predict and confirm results after removing the +4 step"` — not just `"lesson 169 exercise"`.

---

**Next lesson:** Lesson 170, *Exceptions*, uses this lesson's own continuation idea for real: a thrown exception is exactly a call to a *different* continuation than the current, normal one — jumping straight to a distant handler instead of returning through every intermediate caller in between.
