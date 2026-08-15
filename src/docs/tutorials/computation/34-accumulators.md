# Lesson 34: Accumulators

**What you will build**: By the end of this lesson you'll be able to take any recursive function that combines its result *after* a recursive call returns, and mechanically transform it into one that computes the combination *before* the call and carries it forward as a parameter — the exact pattern Lesson 27's `reduce`, Lesson 28's `reverse-acc`, and Lesson 33's `find-subset-sum` all already used, now recognized as one deliberate, repeatable procedure instead of three separate inventions.

**What you need to know first**: Lesson 27's accumulator-passing `my-reduce` and Lesson 23's call-stack vocabulary — this lesson names precisely what accumulators remove from that stack.

**Terms introduced in this lesson**:

- **pending work** — an operation a recursive call still needs to perform after the call it made returns, held on the call stack until that return happens. *Why it matters*: names precisely what an accumulator eliminates — in a function like Lesson 27's `list-sum`, every waiting call on the stack is holding onto exactly one pending addition; an accumulator-based version leaves none of them holding anything.
- **accumulator transformation** — the systematic process of rewriting a recursive function that combines results after each recursive call returns into one that computes the combination before each call and carries it forward as a parameter. *Why it matters*: names the actual mechanical procedure this lesson derives, distinguishing "recognizing the accumulator shape when it's already there" (already done in three earlier lessons) from "deliberately converting an existing function into that shape."

**Objects and methods used**: None new. This lesson reuses `defn`, `if`, `empty?`, `first`, `rest`, and `+`, transforming how they're arranged rather than introducing anything new.

---

## Concept Unit: Recognizing the Pattern — What's Left to Do After Recursion Returns

### The Problem

Lesson 27's `list-sum` and Lesson 27's `my-reduce` compute the identical sum, using visibly different code shapes. What, precisely, is different about *when* each one does its actual combining work?

### Introduce the concept in isolation

```clojure
(defn list-sum [lst]
  (if (empty? lst)
    0
    (+ (first lst) (list-sum (rest lst)))))
```

Trace `(list-sum (list 1 2 3))`, paying attention to what each waiting call still has left to do the moment the base case is reached:

```
Call list-sum(1 2 3) — still needs to: add 1 to whatever list-sum(2 3) returns
  Call list-sum(2 3) — still needs to: add 2 to whatever list-sum(3) returns
    Call list-sum(3) — still needs to: add 3 to whatever list-sum() returns
      Call list-sum() — base case, returns 0 immediately
    resumes: 3 + 0 = 3
  resumes: 2 + 3 = 5
resumes: 1 + 5 = 6
```

At the exact moment `list-sum()` hits its base case, *three* calls are still paused on the call stack (Lesson 23), each one holding onto exactly one **pending** addition — `list-sum(3)` is still waiting to add `3`, `list-sum(2 3)` is still waiting to add `2`, `list-sum(1 2 3)` is still waiting to add `1`. None of that addition happens until the base case's `0` starts working its way back up through all three waiting calls.

### Discard the throwaway example

Not applicable — this trace re-examines a function this series already trusts, rather than introducing new code.

### Generalizing

Every function this series has written using the shape "combine the current element with `(recursive-call ...)`" — `sum-to`, `factorial`, `my-length`, `list-sum`, `tree-sum` — has this identical property: work is deferred, held pending on the stack, until the base case returns and the unwinding begins. Lesson 27's `my-reduce` was different, and this unit is where that difference gets a name.

### CS Lens

"Pending work held on the stack until a recursive call returns" is precisely what Lesson 193 (*Stack Frames*) will show is literally true at the level of a running program's memory — this lesson's informal call-stack trace and that lesson's formal memory model describe the exact same thing, at two different levels of detail.

### SE Lens

Nothing is wrong with `list-sum`'s shape — it's correct, and this section has relied on it constantly. This unit's point is narrower and more precise: naming exactly *what* is being held pending, and by how many calls at once, is the necessary first step before the next unit can show how to eliminate it deliberately.

---

## Concept Unit: The Transformation — From Post-Call Combining to Pre-Call Accumulation

### The Problem

Given `list-sum`'s shape, and knowing `my-reduce` computes the identical answer without leaving anything pending, is there a repeatable, mechanical procedure for turning the first shape into the second — not just for summing, but for any function shaped like `list-sum`?

### Introduce the concept in isolation

Apply a fixed, four-step recipe to `list-sum`:

1. **Add an accumulator parameter.** `list-sum [lst]` becomes `list-sum-acc [lst acc]`.
2. **Choose the accumulator's starting value** — whatever the base case would need to return if the list were already empty. For summing, that's `0` (Lesson 6's identity for `+`, in the sense that adding `0` changes nothing).
3. **At the base case, return the accumulator directly** — no more combining left to do, because (as step 4 ensures) it's already been done.
4. **At the recursive case, combine the current element with the accumulator *before* recursing, and pass that combined value forward as the new accumulator** — instead of combining *after* the recursive call returns.

```clojure
(defn list-sum-acc [lst acc]
  (if (empty? lst)
    acc
    (list-sum-acc (rest lst) (+ acc (first lst)))))
```

```
user=> (list-sum-acc (list 1 2 3) 0)
6
```

Trace it the same way as before, tracking what's pending at each step:

```
Call list-sum-acc(1 2 3, 0) — nothing pending; computes new acc = 0 + 1 = 1 before recursing
  Call list-sum-acc(2 3, 1) — nothing pending; computes new acc = 1 + 2 = 3 before recursing
    Call list-sum-acc(3, 3) — nothing pending; computes new acc = 3 + 3 = 6 before recursing
      Call list-sum-acc((), 6) — base case, returns 6 directly
```

Not one of the four calls is holding any pending work — each one finished its own combining step *before* making its recursive call, and the base case's answer, `6`, is already the final answer, requiring no further combining on the way back up at all.

### Discard the throwaway example

Not applicable — `list-sum-acc` is a real function, and it's exactly `my-reduce` specialized to `+` and `0`, confirmed directly in this lesson's Connect the Pieces.

### Project Change

- **Reference Source**: `list-sum`, from Lesson 27, serves as the direct reference this transformation is applied to.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn list-sum-acc [lst acc]
  (if (empty? lst)
    acc
    (list-sum-acc (rest lst) (+ acc (first lst)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`acc`** — first appearance, in this lesson, of a parameter added specifically by this transformation's step 1 — not part of `list-sum`'s original signature at all.
- **`(if (empty? lst) acc ...)`** — reappearing base-case shape, with `acc` (step 3) returned directly in place of `list-sum`'s literal `0` — the accumulator has already accumulated everything the literal `0` would have needed built up around it afterward.
- **`(list-sum-acc (rest lst) (+ acc (first lst)))`** — reappearing recursive-call shape, with the combining step (`+ acc (first lst)`) moved *inside* the call's own arguments (step 4), computed before the recursive call happens, rather than wrapping around it the way `list-sum`'s `(+ (first lst) (list-sum (rest lst)))` did.

### CS Lens

This four-step recipe is exactly how `my-reduce` (Lesson 27) was already shaped, and exactly how `reverse-acc` (Lesson 28) and `find-subset-sum` (Lesson 33) were each independently derived — this lesson is the first time the *procedure* itself, rather than one specific application of it, has been stated as something to apply deliberately to a new function.

### SE Lens

Applying this transformation isn't free — `list-sum-acc` requires an extra argument (the accumulator's starting value) at every call site, a real, minor cost in convenience `list-sum` didn't have. Lesson 27's own `reduce` handles this by taking the starting value as an explicit argument every time, exactly the same tradeoff; a wrapper function supplying the initial `0` automatically (`(defn list-sum-acc-wrapped [lst] (list-sum-acc lst 0))`) is a common, small convenience for hiding this detail from callers who don't need to see it.

### Connection to the previous unit

The previous unit named what `list-sum` leaves pending at every level; this unit is the precise, repeatable procedure for eliminating that pending work entirely, applied to `list-sum` directly and verified against `my-reduce`'s already-trusted behavior.

---

## Concept Unit: Why This Matters — Nothing Left at the Base Case

### The Problem

Both `list-sum` and `list-sum-acc` compute the identical answer. Concept Unit 1 showed `list-sum` leaves three pending additions on the stack at its deepest point. Does `list-sum-acc` actually avoid that cost, or does it just relocate the same amount of work somewhere else?

### Introduce the concept in isolation

Compare the two traces directly, side by side, at the exact moment each one reaches its base case:

```
list-sum's stack at the base case:
  list-sum(1 2 3) — pending: + 1 to the result
  list-sum(2 3)   — pending: + 2 to the result
  list-sum(3)     — pending: + 3 to the result
  list-sum()      — base case, returns 0

list-sum-acc's stack at the base case:
  list-sum-acc(1 2 3, 0) — pending: nothing
  list-sum-acc(2 3, 1)   — pending: nothing
  list-sum-acc(3, 3)     — pending: nothing
  list-sum-acc((), 6)    — base case, returns 6 (the complete, final answer)
```

Both traces have four calls deep — the *number* of waiting calls hasn't changed, and won't, since both functions still recurse once per list element. What's genuinely different is what each waiting call is holding onto: `list-sum`'s waiting calls each hold a real, unfinished piece of arithmetic; `list-sum-acc`'s waiting calls hold nothing at all — they're only still "on the stack" because Clojure hasn't yet been told it's safe to discard them, a distinction Lesson 35 (*Tail Recursion*) picks up directly, showing that a call holding no pending work can, in principle, be discarded the moment it makes its recursive call, rather than kept around until that call returns.

### Discard the throwaway example

Not applicable — this comparison is the direct payoff of both previous units' work.

### CS Lens

A recursive call is called a **tail call** when it's the very last thing a function does — nothing pending afterward, exactly `list-sum-acc`'s situation at every step. Lesson 35 is named for exactly this property and shows what real advantage it unlocks; this lesson has already done the harder half of the work by showing precisely *how* to reshape a function to have that property in the first place.

### SE Lens

The accumulator transformation is worth applying deliberately whenever a recursive function's pending work could become large — processing a very long list, say — even before knowing the specific benefit Lesson 35 names, because "nothing left pending at the base case" is, on its own, a clearer, more traceable shape: the accumulator at any point *is* the complete, correct answer to "everything processed so far," checkable at any depth without needing to first unwind back to the top.

### Connection to the previous unit

The previous unit performed the transformation mechanically; this unit is the direct verification that it actually accomplished what Concept Unit 1 set out to eliminate — comparing both traces at their most extended point and confirming the pending work is genuinely gone, not merely hidden.

---

## Connect the Pieces

`list-sum-acc`, confirmed to be exactly `my-reduce`, specialized:

```clojure
(println "list-sum:" (list-sum (list 1 2 3 4)))
(println "list-sum-acc:" (list-sum-acc (list 1 2 3 4) 0))
(println "my-reduce, same operation:" (my-reduce + 0 (list 1 2 3 4)))
(println "All three agree:" (= (list-sum (list 1 2 3 4)) (list-sum-acc (list 1 2 3 4) 0) (my-reduce + 0 (list 1 2 3 4))))
```

```
list-sum: 10
list-sum-acc: 10
my-reduce, same operation: 10
All three agree: true
```

`list-sum-acc` and `my-reduce + 0` aren't merely similar — tracing either one produces the identical sequence of accumulator values at every step, because `my-reduce`, defined back in Lesson 27, already *was* this lesson's transformation, applied to an arbitrary combining function and starting value instead of specifically `+` and `0`. This lesson didn't introduce a new capability; it named and generalized a procedure this series had already been quietly using.

## What Breaks Without This

Suppose the accumulator transformation were applied carelessly — updating the accumulator, but forgetting to change the base case to return it:

```clojure
(defn broken-list-sum-acc [lst acc]
  (if (empty? lst)
    0
    (broken-list-sum-acc (rest lst) (+ acc (first lst)))))
```

```
user=> (broken-list-sum-acc (list 1 2 3) 0)
0
```

`0`, always — regardless of the list's actual contents. The accumulator was faithfully built up to `6` by the time the base case was reached, exactly as `list-sum-acc` computed — but the base case, still returning the literal `0` instead of `acc`, discards it entirely. This is exactly step 3 of the transformation, skipped: the whole point of carrying a value forward as an accumulator is defeated if the base case doesn't actually hand it back once there's nothing left to accumulate.

## Exercises

1. **Trace.** By hand, trace `(list-sum-acc (list 5 10 15) 0)`, tracking the accumulator's value at each step.
2. **Predict.** Before running it, predict what `(list-sum-acc (list 1 2 3) 100)` — starting the accumulator at `100` instead of `0` — produces. Verify your prediction.
3. **Transform.** Apply this lesson's four-step recipe to `factorial` (Lesson 20), producing `factorial-acc`. State the correct starting value for the accumulator, and verify it against `factorial` on at least two inputs.
4. **Break it, on purpose.** Apply the recipe to `my-length` (Lesson 24), but deliberately make the same mistake as `broken-list-sum-acc` — updating the accumulator correctly but returning the wrong thing at the base case. Confirm it produces a wrong count.
5. **Generalize.** `tree-sum` (Lesson 30) combines two recursive calls, not one — does this lesson's four-step recipe apply directly, or does it need to change to handle two recursive calls instead of one? Attempt an accumulator-based `tree-sum-acc` and note what, if anything, had to be different.
6. **Reconstruct.** Close this lesson. From memory, state the four-step accumulator transformation recipe, and explain, using the call-stack trace from Concept Unit 3, exactly what it eliminates.

## Definition of Done

- [ ] You can apply the four-step accumulator transformation to a recursive function you haven't seen transformed before.
- [ ] You completed Exercise 3 (`factorial-acc`) and verified it against the original `factorial`.
- [ ] You can trace both a pre-transformation and post-transformation version of the same function, correctly identifying what's pending at the base case in each.
- [ ] You attempted Exercise 5 and can state, specifically, whether trees require any change to the basic recipe.
- [ ] Commit `factorial-acc` and your Exercise 5 findings to your notes repository, with a commit message stating what you discovered about applying the recipe to a two-recursive-call function — for example, `"Add factorial-acc (starting value 1); tree-sum-acc needs two accumulator updates per call since tree-sum branches twice"` — not just `"lesson 34 exercise"`.

---

**Next lesson:** Lesson 35, *Tail Recursion*, is the direct payoff this lesson set up: showing precisely why a recursive call with nothing pending afterward can run using constant stack space, regardless of how long the list being processed is.
