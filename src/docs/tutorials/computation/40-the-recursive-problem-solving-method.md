# Lesson 40: The Recursive Problem-Solving Method

**What you will build**: By the end of this lesson you'll have a single, named, six-step method combining everything Section II has built — recursive definitions, structural recursion, termination measures, tracing, overlapping-subproblem detection, and accumulators — and you'll have watched it applied, deliberately and completely, to a problem this series hasn't already solved. This closes Section II; Section III turns from recursion and data back toward algebra, applied with everything this section has built now available.

**What you need to know first**: Everything from Lessons 19 through 39 — this lesson assembles what's already there into one repeatable sequence, the same closing shape Lesson 18 gave Section I.

**Terms introduced in this lesson**:

- **the recursive problem-solving method** — a repeatable six-step sequence for deriving a correct recursive function from a problem's own recursive structure: define the data recursively, derive the function's shape structurally, state and verify a termination measure, trace a small example by hand, check for overlapping subproblems, and consider whether an accumulator is needed. *Why it matters*: this is the process Section II's lessons have followed implicitly, on every function from `sum-to` to `fib-dp` — naming it turns "notice the pattern in hindsight" into "apply it deliberately," on a problem none of those lessons already solved.

**Objects and methods used**: None new. This lesson applies `if`, `empty?`, `first`, `rest`, `recur`, `+`, and `<`, all already covered, to a new problem.

---

## Concept Unit: The Method, Named and Ordered

### The Problem

Every recursive function this section has written followed a similar sequence of decisions — what's the smallest case, what does the recursive case look like, does it actually terminate, does it waste work recomputing anything. Is that sequence one repeatable method, the way Lesson 18 found one for proof, or does it just look similar in hindsight?

### Introduce the concept in isolation

State the method as an ordered sequence, naming which earlier lesson supplied each step:

1. **Define the data recursively.** What's the base case? What's the recursive case, and exactly what "smaller instance" does it refer to? (Lesson 19 — nothing else in this method makes sense until this is precise.)
2. **Derive the function's shape structurally from that definition.** One recursive call per smaller instance the definition specifies — no more, no fewer (Lessons 20–21).
3. **State and verify a termination measure.** What decreases with every recursive call? What bounds it? Does the base case actually catch it (Lesson 22) — not just "probably," but checked against all three of that lesson's requirements.
4. **Trace a small, concrete example by hand** before trusting the code on anything larger (Lesson 23) — the same discipline Lesson 18's mindset applied to proofs, now applied to recursive functions specifically.
5. **Check for overlapping subproblems.** Does the recursive structure ever compute the identical smaller instance more than once? If so, memoize (Lesson 38) or restructure bottom-up (Lesson 39) — and if not, say so explicitly and move on, rather than applying the technique out of habit where it isn't needed.
6. **Consider whether an accumulator, and `recur`, are appropriate** — especially if the function might ever process very large input (Lessons 34–35, 37).

### Discard the throwaway example

Not applicable — the next unit applies this exact sequence, in order, to a new problem.

### CS Lens

This six-step sequence is the recursion-and-data-structure-specific version of the same larger discipline Section XIV (*Integration and Advanced Problem Solving*) will eventually generalize past recursion entirely — specify, derive structure, verify correctness, check efficiency. Learning the recursion-specific version here is what will make that later, broader framework feel like a continuation, not something new to learn from scratch.

### SE Lens

Skipping step 5 — the overlapping-subproblems check — in either direction is a real, common mistake: applying memoization reflexively to a function that never actually recomputes anything wastes effort and adds complexity for no benefit (Lesson 38's own `factorial` exercise already raised this directly); skipping the check on a function that genuinely does have exponential redundancy, the way naive `fib` does, leaves real, avoidable cost sitting in production code. The step is "check," not "always apply."

---

## Concept Unit: Applying the Full Method to a New Problem

### The Problem

Put the method to work on a genuinely new question: given an opening balance and an ordered list of transaction amounts (positive for deposits, negative for withdrawals, applied without rejection this time), on which transaction — by number — does the balance first go negative, if ever?

### Introduce the concept in isolation

**Step 1 — Define the data recursively.** The transaction list is an ordinary list (Lesson 19): the empty list (no transactions left) is the base case; a transaction together with a smaller list of remaining transactions is the recursive case — nothing new here, the same list definition every function in this section has used.

**Step 2 — Derive the function's shape structurally.** One recursive call, on `(rest transactions)`, mirroring the list definition's own recursive case exactly (Lesson 21):

```clojure
(defn first-overdraft-index [balance transactions index]
  (if (empty? transactions)
    nil
    (if (< (+ balance (first transactions)) 0)
      index
      (recur (+ balance (first transactions)) (rest transactions) (+ index 1)))))
```

Two base-adjacent cases, not one: `(empty? transactions)` (no more transactions — no overdraft occurred, returning `nil`), and a *success* condition checked before recursing further (`(< (+ balance (first transactions)) 0)` — this transaction pushes the balance negative, returning the current `index` directly) — the same two-condition shape Lesson 33's `find-subset-sum` already used (a success check, then a base case, then the recursive case).

**Step 3 — State and verify a termination measure.** The measure is the length of `transactions`. It strictly decreases by exactly `1` with every recursive call (`(rest transactions)`). It's bounded below by `0` elements. The base case, `(empty? transactions)`, catches it exactly at that bound — all three of Lesson 22's requirements, satisfied the same way every list-consuming function in this section already has been.

**Step 4 — Trace a small example by hand.** Opening balance `50`, transactions `(30 -100 20)`:

```
first-overdraft-index(50, (30 -100 20), 1)
  50 + 30 = 80, not < 0 → recur(80, (-100 20), 2)
first-overdraft-index(80, (-100 20), 2)
  80 + -100 = -20, < 0! → return 2
```

Transaction `2` (the `-100` withdrawal) is the first to push the balance negative — confirmed by hand before trusting the code on anything larger.

**Step 5 — Check for overlapping subproblems.** Does this function ever compute the identical `(balance, transactions, index)` combination more than once? No — it processes the transaction list once, straight through, in order, with no branching into multiple recursive calls per step the way `fib` or `find-subset-sum` did. There is nothing to memoize here, and applying memoization anyway would add real complexity (a cache, a `declare`, a wrapper) for zero actual benefit — the correct application of step 5 is recognizing this and explicitly moving on, not memoizing reflexively.

**Step 6 — Consider an accumulator and `recur`.** `balance` and `index` are already exactly this — both are carried forward as parameters, updated before each recursive call, with `recur` already used directly (Lesson 34's transformation and Lesson 35's `recur` applied together, from the very first draft, rather than retrofitted afterward). This function was written with the accumulator shape built in from step 2, because by this point in the section, that shape is the natural first choice, not an afterthought.

### Discard the throwaway example

Not applicable — `first-overdraft-index` is a real, complete, verified function, and the six-step process that produced it is the actual point of this lesson.

### CS Lens

Every step of this derivation reused a technique from a specific earlier lesson, cited by name rather than re-derived from scratch — the entire value of naming and practicing the six-step method is exactly this: recognizing which earlier tool a new problem's shape calls for, rather than reasoning about recursion from first principles every single time a new function is needed.

### SE Lens

Step 5's honest "no overlap here" is as important a result as finding overlap and fixing it — a method that only ever tells its user to apply more techniques isn't actually guiding a decision, it's just a checklist of additions. This lesson's problem needed accumulator-passing (already present) and did not need memoization; a different problem might need the reverse; the method's real job is helping decide which, not applying everything available every time.

### Connection to the previous unit

The previous unit stated the six-step method as an ordered abstraction; this unit ran every step against a real, previously-unsolved problem, including the moment — step 5 — where the method's own discipline correctly concluded that a technique available from earlier in the section simply wasn't needed here.

---

## Connect the Pieces

The complete record of this lesson's derivation, showing every technique from Section II contributing to one outcome:

| Step | Technique used | What it contributed |
|---|---|---|
| Define the data | Lesson 19 | A precise base case (empty list) and recursive case (a transaction plus a smaller list) |
| Derive the shape | Lessons 20–21 | One recursive call, matching the list definition's own recursive case exactly |
| Termination measure | Lesson 22 | Confirmed the transaction list's length decreases, is bounded, and is caught by the base case |
| Trace by hand | Lesson 23 | Verified transaction `2` as the answer for a concrete case, before trusting the code generally |
| Overlapping subproblems | Lessons 38–39 | Checked, and correctly found none — no memoization needed |
| Accumulator and `recur` | Lessons 34, 35, 37 | Built into the function's shape from the start, giving it Lesson 35's constant-space guarantee directly |

Every row uses a technique this section built separately, for a different original purpose — the function this lesson closes with was never producible by any single one of them alone, the same conclusion Lesson 18 reached for Section I's proof techniques.

## What Breaks Without This

Suppose step 5 had been skipped — not checked at all, just assumed, out of habit, that any recursive function processing a list "probably benefits from memoization," and `first-overdraft-index` were wrapped in `declare` and `memoize` the way `fib-memo` was:

```clojure
(declare overdraft-memo)
(defn overdraft-helper [balance transactions index]
  (if (empty? transactions)
    nil
    (if (< (+ balance (first transactions)) 0)
      index
      (overdraft-memo (+ balance (first transactions)) (rest transactions) (+ index 1)))))
(def overdraft-memo (memoize overdraft-helper))
```

This isn't wrong, exactly — it still computes the correct answer. But every call's arguments (`balance`, `transactions`, `index`) are almost always different from every other call's, since the running balance changes with every transaction — meaning the cache essentially never produces a hit, and every call pays memoization's real overhead (a cache lookup, the wrapper indirection) for a benefit that step 5's honest check would have shown doesn't exist here. This is the concrete cost of skipping step 5 rather than actually performing it: not a wrong answer, but real, unnecessary complexity and overhead, applied because a technique was available, not because the problem's own structure called for it.

## Exercises

1. **Trace.** By hand, trace `(first-overdraft-index 100 (list -50 -30 -40) 1)`, the way Concept Unit 2 traced its own example.
2. **Predict.** Before running it, predict `(first-overdraft-index 100 (list 10 20 30) 1)` — a transaction list that never overdraws. What should the function return?
3. **Apply the method.** Using all six steps, derive a function `count-deposits` that counts how many transactions in a list are deposits (positive amounts), stating each step explicitly the way Concept Unit 2 did.
4. **Break it, on purpose.** Remove the accumulator shape from `first-overdraft-index` — rewrite it as a non-tail-recursive version that combines results *after* the recursive call returns instead of carrying them forward — and explain, using Lesson 35's vocabulary, what property it loses.
5. **Generalize.** Apply the six-step method to a problem involving `account-tree` (Lesson 30) instead of a list: derive a function that finds the *depth* of the shallowest empty subtree (the shortest path from root to any missing child) — is this structurally recursive the way `tree-sum` was? Does it need one or two recursive calls?
6. **Reconstruct.** Close this lesson — and Section II. From memory, list all six steps of the recursive problem-solving method, in order, and explain why step 5 has two possible honest outcomes (found overlap, fix it; found none, move on), not just one.

## Definition of Done

- [ ] You can list the six steps of the recursive problem-solving method from memory, in order.
- [ ] You completed Exercise 3, applying the full method to a function this series hasn't already written, stating every step explicitly.
- [ ] You completed Exercise 5 and can state whether your tree-based function needed one or two recursive calls, and why.
- [ ] You can explain why skipping step 5's check (rather than performing it and finding no overlap) is a real mistake, even when the resulting code still produces correct answers.
- [ ] Commit `first-overdraft-index` and your Exercise 3 and Exercise 5 solutions to your notes repository, with a commit message summarizing your step 5 findings for each — for example, `"Add first-overdraft-index, count-deposits, shallowest-empty-depth — none have overlapping subproblems; all use accumulator/recur where processing very large input was plausible"` — not just `"lesson 40 exercise, section II complete"`.

---

**Next lesson:** Lesson 41, *Variables and Symbolic Expressions*, opens Section III — Algebra for Programmers — treating algebraic expressions themselves as manipulable computational objects, building directly on the recursive-structure thinking Section II spent forty lessons establishing, now aimed at symbolic manipulation instead of lists and trees.
