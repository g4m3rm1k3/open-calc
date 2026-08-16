# Lesson 177: Algebraic Data Types

**What you will build**: By the end of this lesson you'll add real pairs to this section's own interpreter — `["pair" 3 4]`, `["fst" p]`, `["snd" p]` — and extend `type-check` to track their types precisely: `(pair 3 4)` type-checks as `["pair-type" "number" "number"]`, and `(fst (pair 3 4))` correctly type-checks as `"number"`, reading straight through the pair's own recorded type. Lesson 150 counted a product type's possibilities; this lesson gives one a real, runnable, type-checked existence.

**What you need to know first**: Lesson 150's product type; Lesson 173's `type-check` and its own `cond`-based dispatch; Lesson 164's `eval-env`.

**Terms introduced in this lesson**: None new — this lesson gives Lesson 150's already-named product type a real, working implementation, rather than naming a new concept.

**Objects and methods used**: None new. This lesson reuses `cond` (Lesson 151), `get` (Lesson 84), and `=` (Lesson 6), each already covered.

---

## Concept Unit: A Real Pair, Constructed and Deconstructed

### The Problem

Lesson 150 counted how many values a product type has. Can this section's own interpreter actually *construct* one — build a real pair, and get its two components back out?

### Introduce the concept in isolation

```clojure
(= (get ast 0) "pair") [(eval-env (get ast 1) env) (eval-env (get ast 2) env)]
(= (get ast 0) "fst") (get (eval-env (get ast 1) env) 0)
(= (get ast 0) "snd") (get (eval-env (get ast 1) env) 1)
```

```
user=> (eval-env ["pair" 3 4] [])
[3 4]
user=> (eval-env ["fst" ["pair" 3 4]] [])
3
user=> (eval-env ["snd" ["pair" 3 4]] [])
4
user=> (eval-env ["pair" 1 ["pair" 2 3]] [])
[1 [2 3]]
user=> (eval-env ["fst" ["snd" ["pair" 1 ["pair" 2 3]]]] [])
2
```

`["pair" e1 e2]` evaluates both halves and bundles the results into a real two-element vector — Lesson 150's product type, now a genuine runtime value, not just a possibility count. `["fst" p]`/`["snd" p]` evaluate `p` down to that vector and read one slot each. Pairs nest correctly: `["pair" 1 ["pair" 2 3]]` produces `[1 [2 3]]`, and reading `fst` of its own `snd` correctly reaches `2`, two levels deep.

### Discard the throwaway example

Not applicable — every branch is real, reusable, and verified across a flat pair, both accessors, and a genuinely nested pair.

### Project Change

- **Reference Source**: Lesson 164's own `eval-env`, extended with three new `cond` branches.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(= (get ast 0) "pair") [(eval-env (get ast 1) env) (eval-env (get ast 2) env)]
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`[(eval-env (get ast 1) env) (eval-env (get ast 2) env)]`** — first appearance of this specific idea: both halves of the pair evaluated independently, then bundled into one real vector — the runtime shape of Lesson 150's own product type.
- **`(get (eval-env (get ast 1) env) 0)`, `(get (eval-env (get ast 1) env) 1)`** — reappearing `get` (Lesson 84): the two accessors, each reading one slot of an already-evaluated pair.

### CS Lens

`["pair" e1 e2]`, `["fst" p]`, `["snd" p]` are exactly the three operations a product type requires: a constructor, and one accessor per component — nothing about Lesson 150's own possibility-counting math changes here, only that it's now backed by real, runnable code.

### SE Lens

Building the pair before either accessor is ever called — rather than, say, evaluating `"fst"` by re-running the pair's own construction and discarding half of it — means `p` in `(fst p)` only ever gets evaluated once, even when it's itself an expensive or side-effecting expression, exactly the "evaluate once, use twice" discipline this curriculum's own "compute once, pass to a helper" convention has always required.

---

## Concept Unit: Typing a Pair Precisely

### The Problem

Can `type-check` (Lesson 173) track a pair's *own* type — not just "some product," but which two specific types it actually bundles — and use that to correctly type its accessors?

### Introduce the concept in isolation

```clojure
(= (get ast 0) "pair") ["pair-type" (type-check (get ast 1) tenv) (type-check (get ast 2) tenv)]
(= (get ast 0) "fst") (get (type-check (get ast 1) tenv) 1)
(= (get ast 0) "snd") (get (type-check (get ast 1) tenv) 2)
```

```
user=> (type-check ["pair" 3 4] [])
["pair-type" "number" "number"]
user=> (type-check ["fst" ["pair" 3 4]] [])
"number"
```

A pair's type is `["pair-type" T1 T2]` — a real, structured type, recording both component types precisely, not merely "this is a product of *something*." `"fst"`'s type-checking rule reads position `1` of that structured type — the first component's own type — the identical position `"fst"`'s *evaluation* rule reads at runtime, one lesson earlier. Type checking and evaluation agree on where each component lives, because both were built against the identical AST shape.

### Discard the throwaway example

Not applicable — real, verified type-checking output, agreeing structurally with this lesson's own evaluation results.

### Project Change

- **Reference Source**: Lesson 173's own `type-check`, extended with three new `cond` branches, mirroring `eval-env`'s own new branches from this lesson's first unit.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(= (get ast 0) "pair") ["pair-type" (type-check (get ast 1) tenv) (type-check (get ast 2) tenv)]
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`["pair-type" (type-check (get ast 1) tenv) (type-check (get ast 2) tenv)]`** — first appearance of this specific idea: a *structured* type, not a flat string like `"number"` — carrying both component types explicitly, so a later `"fst"`/`"snd"` check can read the right one back out.
- **`(get (type-check (get ast 1) tenv) 1)`**, in the `"fst"` branch — reads index `1` of the pair's own structured type — the first component's type, at the identical position `eval-env`'s own `"fst"` branch reads for the real value.

### CS Lens

This is the real reason Lesson 150 called this a *product* type: the type itself is a genuine product — `["pair-type" T1 T2]` — of the two component types, the identical algebraic shape as the values it describes, one level up.

### SE Lens

Mirroring `eval-env`'s branches in `type-check`, position for position, is what keeps the two in sync deliberately: if a future lesson adds a fourth operation on pairs, both functions need a matching new branch, and the structural resemblance between them makes a missed one far easier to notice than if the two functions had drifted into unrelated shapes.

### Connection to the previous unit

The previous unit built pairs as real runtime values; this unit gives them real, structured types, checked by the identical logic Lesson 173 already established for every other AST shape.

---

## Connect the Pieces

A pair, evaluated and type-checked, agreeing at every step:

```clojure
(println "Value:" (eval-env ["fst" ["pair" 3 4]] []))
(println "Type:" (type-check ["fst" ["pair" 3 4]] []))
```

```
Value: 3
Type: number
```

`eval-env` and `type-check` never had to coordinate directly — both were built to read the identical AST position, and both agree, because the AST's own shape was the single source of truth for each.

## What Breaks Without This

Suppose `type-check`'s `"fst"` branch had read position `2` instead of `1` — a plausible, easy transcription slip, especially since `eval-env`'s own `"fst"` reads position `0` of the *value*, not the *type* vector, a genuinely different indexing scheme (`"pair-type"` itself occupies index `0` of the type; the components start at `1`, not `0`, unlike the runtime pair). Every real program using `fst` would type-check against the *second* component's type while actually evaluating to the *first* component's real value — a real, silent mismatch between what the type checker promises and what the program actually does, exactly the kind of inconsistency Lesson 173's whole point was to prevent, reintroduced by a mismatched index between two functions meant to agree.

## Exercises

1. **Trace.** By hand, trace `(type-check ["snd" ["pair" 3 4]] [])` through `type-check`'s `"snd"` branch, confirming which index of the structured type it reads.
2. **Predict.** Before checking, predict the type of `["pair" ["fn" "y" 1] 4]` — a pair bundling a function and a number. Then verify.
3. **Verify.** Confirm `(eval-env ["fst" ["pair" ["fn" "y" 1] 4]] [])` and `(type-check ["fst" ["pair" ["fn" "y" 1] 4]] [])` agree — a real closure value, and the type `"function"`.
4. **Break it, on purpose.** Swap `type-check`'s `"fst"`/`"snd"` index reads (make `"fst"` read index `2`, `"snd"` read index `1`), and confirm the resulting type is now wrong for a pair with two *different* component types.
5. **Generalize.** Describe, without coding it, how a *triple* — `["triple" e1 e2 e3]` — would extend both `eval-env` and `type-check`, following this lesson's own pattern.
6. **Reconstruct.** Close this lesson. From memory, explain why `eval-env`'s `"fst"` reads index `0` but `type-check`'s `"fst"` reads index `1` — name the real, structural reason the two indices differ.

## Definition of Done

- [ ] You can construct and deconstruct a real pair using `"pair"`/`"fst"`/`"snd"` AST nodes.
- [ ] You can extend `type-check` to track a pair's own structured type precisely.
- [ ] You can explain why `eval-env` and `type-check` read different index positions for the same accessor, and why that's correct, not inconsistent.
- [ ] You completed Exercise 3 and confirmed a closure-and-number pair's value and type agree.
- [ ] You completed Exercise 4 and showed swapped indices produce a real, wrong type for a mixed-type pair.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm fst of a (function, number) pair agrees value/type; show swapped fst/snd indices give wrong type for mixed pairs"` — not just `"lesson 177 exercise"`.

---

**Next lesson:** Lesson 178, *Operational Semantics*, steps back from this section's own interpreter to formalize precisely what it's been doing the whole time — defining execution as real, mathematical state transitions, giving `eval-env`'s own behavior a rigorous specification independent of any one implementation.
