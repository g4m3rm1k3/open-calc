# Lesson 168: References

**What you will build**: By the end of this lesson you'll bind two different variable names, `"x"` and `"y"`, to the identical store location, and prove that mutating through one is visible through the other: `(set-var env store "x" 999)` changes what `"y"` reads too, `100` to `999`, with no code anywhere naming both variables together.

**What you need to know first**: Lesson 167's environment/store split, `get-var`/`set-var`, and its own location model.

**Terms introduced in this lesson**:

- **alias** — two or more names that refer to the same location, so that mutating through any one of them is visible through all the others. *Why it matters*: Lesson 167 already built everything aliasing needs — a location shared between two environment entries is already an alias, without any new machinery at all.

**Objects and methods used**: None new. This lesson reuses `get-var`/`set-var` (Lesson 167), each already covered.

---

## Concept Unit: Two Names, One Location

### The Problem

Lesson 167's environment mapped each name to its own location. Is there anything stopping *two* different names from mapping to the identical location — and if not, what happens when one of them is mutated?

### Introduce the concept in isolation

```
user=> (def env [["x" 0] ["y" 0]])
user=> (def store [100])
user=> (get-var env store "x")
100
user=> (get-var env store "y")
100
user=> (def store2 (set-var env store "x" 999))
user=> (get-var env store2 "y")
999
user=> (get-var env store2 "x")
999
```

`env` binds both `"x"` and `"y"` to location `0` — nothing in Lesson 167's own `get-var`/`set-var` forbids this; it was never checked because it never needed to be. Both names read the identical value, `100`, before any mutation. Mutating *only* `"x"` — `set-var` never mentions `"y"` at all — changes what `"y"` reads too: `999`, the identical new value. `"x"` and `"y"` are **aliases**: different names, the same real, shared location.

### Discard the throwaway example

Not applicable — real, verified proof that mutating one name changes what a second, unrelated-looking name reads.

### Project Change

- **Reference Source**: Lesson 167's own `get-var`/`set-var`, reused entirely unchanged — this lesson's own point is that aliasing needed no new code at all.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit uses Lesson 167's own existing functions on a new environment shape (two names, one location) rather than introducing new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`[["x" 0] ["y" 0]]`** — first appearance of this specific environment shape: two distinct entries, identical second slot — the location `0` genuinely shared, not merely equal by coincidence.
- **`(set-var env store "x" 999)`** — reappearing `set-var` (Lesson 167): looks up `"x"`'s location (`0`), and mutates the store at that location — `"y"` is never referenced anywhere in this call, yet is affected, because it shares the identical location.

### CS Lens

Aliasing wasn't built as new machinery — it fell directly out of Lesson 167's own environment/store separation: anywhere two names can map to the same location, mutating through either one is automatically visible through both, a direct, unavoidable consequence of the store being the single real source of truth for a location's value.

### SE Lens

This is precisely why aliasing is a real, common source of bugs in languages with mutable references: code mutating `"x"`, with no reason to suspect `"y"` even exists, can silently change what a completely different-looking piece of code reads through `"y"` — not a malfunction, exactly the correct, designed behavior this lesson's own store model produces, and exactly why it needs to be understood rather than assumed away.

---

## Connect the Pieces

Two names, one location, one real mutation:

```clojure
(println "Before: x =" (get-var env store "x") "y =" (get-var env store "y"))
(println "After mutating x: y =" (get-var env store2 "y"))
```

```
Before: x = 100 y = 100
After mutating x: y = 999
```

`"y"` was never touched directly — its value changed anyway, because it was never really a separate value to begin with, only a separate name for the same one.

## What Breaks Without This

Suppose a function received two parameters that happened to be aliased — the caller passed the same variable in twice, under two different parameter names — and the function's own logic assumed mutating one parameter would never affect the other. Lesson 167's own store model shows precisely why that assumption is unsafe: if the two parameter names share a location, mutating one *is* mutating the other, with nothing in the function's own local code signaling that the two names are secretly the same thing. Real bugs from exactly this pattern are common enough that some languages provide explicit tools (const references, ownership rules) specifically to prevent unintended aliasing — tools that only make sense once aliasing itself, demonstrated concretely here, is understood as a real, designed consequence of shared locations, not a mysterious edge case.

## Exercises

1. **Trace.** By hand, using `get-var`/`set-var`'s own definitions, confirm exactly why `"y"` reads `999` after only `"x"` was mutated.
2. **Predict.** Before checking, predict what happens if `"x"` and `"y"` map to *different* locations (`[["x" 0] ["y" 1]]`, with a two-element store) and `"x"` is mutated. Then verify `"y"` is unaffected.
3. **Verify.** Confirm a *third* name, `"z"`, also bound to location `0`, sees the identical mutated value after `"x"` is changed — aliasing isn't limited to exactly two names.
4. **Break it, on purpose.** Write code that assumes mutating `"x"` can never affect `"y"`, run it against this lesson's own aliased `env`, and describe the real, wrong assumption that breaks.
5. **Generalize.** Describe, without coding it, a real scenario in an actual program (not this toy interpreter) where two variables becoming unintentionally aliased would cause a genuine, hard-to-find bug.
6. **Reconstruct.** Close this lesson. From memory, explain why aliasing required zero new code — connect it directly to Lesson 167's own environment/store separation.

## Definition of Done

- [ ] You can create two aliased names sharing one location and prove mutation through either is visible through both.
- [ ] You can explain why aliasing is a direct consequence of Lesson 167's store model, not separate new machinery.
- [ ] You can describe a real bug aliasing could cause if assumed away.
- [ ] You completed Exercise 3 and confirmed a third aliased name also sees a shared mutation.
- [ ] You completed Exercise 4 and described the real, wrong assumption your own test code made.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm z aliased to x/y also sees mutated value 999; show code assuming x/y independence breaks under aliasing"` — not just `"lesson 168 exercise"`.

---

**Next lesson:** Lesson 169, *Continuations*, asks a genuinely different question about evaluation — not what a variable currently holds, but what happens *next*, after the current expression finishes — deriving "the rest of the computation" as a real, nameable value in its own right.
