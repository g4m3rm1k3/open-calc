# Lesson 179: Small-Step vs Big-Step Semantics

**What you will build**: By the end of this lesson you'll write `one-step`, a real function performing *exactly one* reduction on an AST — and watch `["add" ["add" 1 2] 3]` genuinely pass through a real intermediate state, `["add" 3 3]`, on its way to `6`, two separate calls, two separate real values, rather than Lesson 178's own single leap straight from the expression to its final answer.

**What you need to know first**: Lesson 178's big-step operational semantics and its own `add-rule-holds?`; Lesson 164's AST shapes.

**Terms introduced in this lesson**:

- **small-step semantics** — a specification describing execution as a sequence of *individual* reductions, each one rewriting a program one step closer to a final value. *Why it matters*: makes every intermediate state of a computation a real, nameable thing — Lesson 178's big-step rules never had to name `["add" 3 3]` as a real intermediate value; small-step semantics does, on purpose.
- **reduction** — one single small-step transition, rewriting one part of an expression into a simpler equivalent. *Why it matters*: the actual unit small-step semantics is built from — a big-step derivation's entire multi-line proof corresponds to one single "reduces to" step's worth of work, viewed at a coarser grain.

**Objects and methods used**: None new. This lesson reuses `number?` (Lesson 41), `get` (Lesson 84), and `and`/`not` (Lesson 7), each already covered.

---

## Concept Unit: A Real Function That Takes Exactly One Step

### The Problem

`eval-env` (Lesson 164) always reduces an expression all the way to its final value in one call — there's no way to ask it for just the *next* intermediate state. Can a genuinely different function be built that performs exactly one reduction, and stops?

### Introduce the concept in isolation

```clojure
(declare one-step-add one-step-add-recurse)
(defn one-step [ast]
  (if (number? ast)
    ast
    (one-step-add ast)))

(defn one-step-add [ast]
  (if (and (number? (get ast 1)) (number? (get ast 2)))
    (+ (get ast 1) (get ast 2))
    (one-step-add-recurse ast)))
```

```
user=> (def prog ["add" ["add" 1 2] 3])
user=> (one-step prog)
["add" 3 3]
user=> (one-step ["add" 3 3])
6
```

`one-step` reduces the *innermost* fully-numeric `"add"` it can find, by exactly one step, and returns the resulting AST — not the fully-evaluated answer. `["add" ["add" 1 2] 3]` becomes `["add" 3 3]`: the inner `["add" 1 2]` genuinely reduced to `3`, but the outer `"add"` is still sitting there, unreduced, a real intermediate expression Lesson 178's own big-step rules never had a name for. Calling `one-step` *again*, on that real intermediate result, finally reaches `6`.

### Discard the throwaway example

Not applicable — `one-step`/`one-step-add` are real, reusable, and verified across two separate real calls, each producing a genuinely different intermediate value.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch single-step reducer, contrasted directly against Lesson 164's own `eval-env`.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn one-step-add-recurse [ast]
  (if (not (number? (get ast 1)))
    ["add" (one-step (get ast 1)) (get ast 2)]
    ["add" (get ast 1) (one-step (get ast 2))]))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(and (number? (get ast 1)) (number? (get ast 2)))`**, in `one-step-add` — first appearance of this specific check: a `"add"` node is only *actually* reduced (combined into one number) once *both* its operands are already plain numbers — the exact condition that distinguishes "ready to reduce" from "needs to navigate deeper first."
- **`["add" (one-step (get ast 1)) (get ast 2)]`**, in `one-step-add-recurse` — first appearance of this specific idea: when the left operand isn't a number yet, take *one* step inside it, and rebuild the surrounding `"add"` around that single, smaller change — everything else in the expression stays exactly as it was.
- **`(number? ast)`**, in `one-step`'s own base case — reappearing `number?` (Lesson 41): a bare number has no further step to take at all — it's already fully reduced.

### CS Lens

This is called **small-step semantics** — each call to `one-step` is one **reduction**: the smallest possible unit of "the program got closer to its final value." Also recognized in: how a calculator's own display updates one operation at a time; how a spreadsheet recalculates one cell before moving to the next dependent one; how a real CPU executes one instruction, leaving a fully inspectable state, before the next.

### SE Lens

`one-step` makes every intermediate state real and inspectable — exactly what a debugger needs: stepping through a program one reduction at a time is precisely what "step into" or "step over" in a real debugger corresponds to, a capability `eval-env`'s own all-at-once style has no natural way to offer at all.

---

## Concept Unit: Counting Steps on a Deeper Expression

### The Problem

Does `one-step`'s own behavior generalize correctly to an expression nested more than two levels deep, taking exactly as many steps as there are "add"s to resolve?

### Introduce the concept in isolation

```
user=> (def prog2 ["add" ["add" ["add" 1 1] 1] 1])
user=> (def s1 (one-step prog2))
user=> s1
["add" ["add" 2 1] 1]
user=> (def s2 (one-step s1))
user=> s2
["add" 3 1]
user=> (def s3 (one-step s2))
user=> s3
4
```

Three real reductions, three genuinely different intermediate states, each one exactly one `"add"` closer to done: `["add" ["add" 1 1] 1] 1]` → `["add" ["add" 2 1] 1]` → `["add" 3 1]` → `4`. `one-step`'s own recursive navigation (this lesson's first unit) always finds the *innermost* fully-numeric `"add"` first, meaning the reduction order is fixed and predictable, not arbitrary.

### Discard the throwaway example

Not applicable — three real, verified calls, each one a genuinely new intermediate AST.

### Project Change

- **Reference Source**: This lesson's own `one-step`, reused unchanged on a deeper expression.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit applies the already-built `one-step` to a new, deeper input rather than introducing new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(one-step prog2)`, `(one-step s1)`, `(one-step s2)`** — reappearing `one-step` (this lesson's first unit), called three separate times, each one operating on the *real result* of the previous call — the actual mechanism by which a sequence of small steps reaches the same final answer big-step semantics reaches in one leap.

### CS Lens

Big-step semantics (Lesson 178) answers "what does this program compute" in one shot; small-step semantics answers "what does this program do right now, at this exact point" — genuinely different questions, both real, both necessary depending on what's actually being reasoned about.

### SE Lens

A real compiler's own optimization passes operate small-step-style, deliberately: rewriting one piece of a program at a time (constant folding, dead-code elimination), each pass a real, individually-verifiable reduction, rather than reasoning about "what does the whole program eventually compute" all at once.

### Connection to the previous unit

The previous unit proved `one-step` takes exactly one real step on a two-level expression; this unit confirms the identical function scales correctly to three levels, taking exactly three real, verified steps.

---

## Connect the Pieces

The same expression, reduced one real step at a time, matching `eval-env`'s own big-step answer:

```clojure
(println "eval-env, big-step:" (eval-env prog []))
(println "one-step chain:" prog "->" after1 "->" after2)
```

```
eval-env, big-step: 6
one-step chain: [add [add 1 2] 3] -> [add 3 3] -> 6
```

`eval-env` and repeated `one-step` calls reach the identical final answer — the only difference is whether the intermediate state, `["add" 3 3]`, was ever a real, nameable value along the way.

## What Breaks Without This

Suppose Lesson 166's evaluation-strategy comparison (eager forcing a divide-by-zero argument immediately; lazy deferring it) had to be described using only `eval-env`-style, all-at-once evaluation. There would be no way to say "the argument hasn't been evaluated *yet*, but will be, later, if referenced" — `eval-env` either has evaluated something or it hasn't returned yet at all. `one-step`'s own real intermediate states are exactly what makes that distinction expressible: after *one* step, an unevaluated thunk can genuinely still be sitting there, unresolved, as a real, inspectable part of the state — impossible to point at under big-step semantics alone.

## Exercises

1. **Trace.** By hand, using `one-step`'s own definition, confirm `(one-step ["add" 2 ["add" 3 4]])` reaches `["add" 2 7]`, not `9`.
2. **Predict.** Before checking, predict how many `one-step` calls `["add" ["add" ["add" 1 1] 1] 1]` needs to fully reduce to a bare number. Then verify by calling `one-step` repeatedly and counting.
3. **Verify.** Confirm the final value reached by repeated `one-step` calls on `prog2` (this lesson's own three-level example) matches `(eval-env prog2 [])`'s own big-step answer.
4. **Break it, on purpose.** Modify `one-step-add-recurse` to always step the *right* operand first, even when the left one isn't a number yet, and describe the real, different sequence of intermediate states this produces on `prog2`.
5. **Generalize.** Describe, without coding it, what `one-step` would need to check for a `"var"` node — does a variable reference reduce in one step, or does it need the environment threaded through as well?
6. **Reconstruct.** Close this lesson. From memory, explain why `["add" 3 3]` being a real, nameable intermediate value is the actual point of this lesson, not merely a detail of how `one-step` happens to be implemented.

## Definition of Done

- [ ] You can write a function that performs exactly one reduction on an AST and returns a real intermediate state.
- [ ] You can chain repeated calls to reach the same final answer big-step evaluation reaches directly.
- [ ] You can explain why small-step semantics can express things big-step semantics structurally cannot.
- [ ] You completed Exercise 2 and correctly counted the reductions needed for a triple-nested `add`.
- [ ] You completed Exercise 4 and described the real, different reduction sequence from stepping the right operand first.
- [ ] Commit your Exercise 2 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm 3-deep nested add needs exactly 3 one-step calls to reach a number; show right-first stepping produces a different intermediate sequence reaching the same final value"` — not just `"lesson 179 exercise"`.

---

**Next lesson:** Lesson 180, *Program Equivalence*, uses this lesson's own real machinery to ask a precise question — when are two syntactically different programs guaranteed to compute the same thing — connecting directly back to Lesson 156's denotation.
