# Lesson 22: Base Cases and Progress

**What you will build**: By the end of this lesson you'll be able to state, precisely and checkably, exactly what guarantees a recursive function terminates — not "it looks like it should stop," but a specific condition you can verify directly against any recursive function's code, including the two broken examples the previous two lessons already showed failing in different ways.

**What you need to know first**: The previous two lessons' `broken-sum-to` (a recursive call that never shrinks its input) and the corrected `sum-by-twos` (whose base case had to change from `=` to `<=` to actually terminate).

**Terms introduced in this lesson**:

- **termination measure** — a quantity computed from a recursive function's input that strictly decreases with every recursive call, and cannot decrease below some fixed bound. *Why it matters*: this is the precise, checkable condition that guarantees a recursive function eventually reaches its base case — both of this series' broken examples so far failed to have one, for two different reasons.
- **well-ordering principle** — every non-empty collection of natural numbers has a smallest element. *Why it matters*: this is the exact mathematical fact that makes a termination measure work at all — a quantity that keeps decreasing through the natural numbers cannot do so forever, because there is always a smallest one left, and once it's reached, there's nothing smaller to decrease to.

**Objects and methods used**: None new. This lesson formalizes reasoning about functions already written in the previous two lessons.

---

## Concept Unit: Two Ways Recursion Can Fail to Terminate

### The Problem

Lesson 20's `broken-sum-to` called itself on the exact same input forever. Lesson 21's `broken-sum-by-twos` called itself on a genuinely *shrinking* input, yet also never terminated for odd starting values. Two different functions, two different mistakes, the identical outcome — is there one precise condition that would have ruled out both failures in advance, rather than needing a separate explanation for each?

### Introduce the concept in isolation

Look at exactly what went wrong in each case:

```clojure
(defn broken-sum-to [n]
  (if (= n 0)
    0
    (+ n (broken-sum-to n))))          ; recursive call on n — unchanged
```

```clojure
(defn broken-sum-by-twos [n]
  (if (= n 0)                          ; base case checks exact equality
    0
    (+ n (broken-sum-by-twos (- n 2))))) ; but n decreases by 2, skipping odd n past 0
```

`broken-sum-to`'s input never gets smaller at all — the recursive call's argument, `n`, is identical to the input that was just received. `broken-sum-by-twos`'s input *does* get smaller with every call, but the base case only checks for one exact value (`0`), and stepping by `2` from an odd starting number never lands on it.

These are two different failures of the same missing thing: neither function has a quantity that is guaranteed to (1) get strictly smaller with every recursive call, and (2) actually be caught by the base case once it gets small enough. `broken-sum-to` fails the first requirement entirely; `broken-sum-by-twos` satisfies the first but not the second.

### Discard the throwaway example

Not applicable — both broken functions were already shown, in earlier lessons, to fail; this unit is naming precisely why.

### CS Lens

Failing to shrink the input at all (`broken-sum-to`'s mistake) and shrinking it in a way that overshoots the base case (`broken-sum-by-twos`'s original mistake) are both extremely common, real bugs — the first shows up as an accidentally-copied parameter in a recursive call; the second shows up whenever a loop or recursive step's "check for done" condition doesn't match the actual step size being taken. Naming both failures precisely, as this unit does, is what makes them recognizable on sight in unfamiliar code, rather than only after watching it hang.

### SE Lens

A recursive function that fails to terminate doesn't produce a wrong answer — it produces no answer at all, consuming resources until something external stops it (a crash, a timeout, a user killing the process). This is a categorically different failure than a wrong-but-finished computation, and it's exactly why this lesson exists as its own topic rather than being folded into a general "check your code carefully" — the specific, checkable condition the next unit states is what catches this particular failure mode before it ever runs.

---

## Concept Unit: The Termination Measure

### The Problem

State the one condition, precisely, that both broken functions were missing — specific enough to check directly against any recursive function's code, not just recognizable after the fact once a function is already known to hang.

### Introduce the concept in isolation

A **termination measure** for a recursive function is a quantity, computed from its input, satisfying three requirements:

1. **It strictly decreases with every recursive call.** Not "usually decreases" or "tends to decrease" — every single recursive call must produce a smaller measure than the call that made it.
2. **It cannot decrease below some fixed bound.** For natural-number inputs, that bound is typically `0` — the measure can get arbitrarily close to it, but never go below it while still making recursive calls.
3. **The base case is guaranteed to catch it** before or exactly when the measure would need to decrease below that bound.

Check `sum-to` against all three: the measure is `n` itself. It strictly decreases by exactly `1` with every recursive call (`(- n 1)`). It's bounded below by `0` (natural-number inputs never go negative here). And the base case, `(= n 0)`, catches it at exactly the bound — there's no way for `n` to decrease past `0` without the base case firing first, since it decreases one integer at a time and `0` is precisely the value being checked for.

Now check the *corrected* `sum-by-twos` (base case `(<= n 0)`, not `(= n 0)`): the measure is still `n`. It strictly decreases by `2` with every recursive call. It's bounded below by `0`. And the base case — `(<= n 0)`, not `(= n 0)` — is what makes requirement 3 hold even though the step size is `2`: any value at or below `0` triggers the base case, so the measure doesn't need to land on an exact value to be caught, only to cross the boundary. This is precisely why changing `=` to `<=` fixed the function: it repaired requirement 3 without needing to touch the measure or the step size at all.

`broken-sum-to` fails requirement 1 outright (the measure, `n`, doesn't decrease). The *original* `broken-sum-by-twos` fails requirement 3 specifically (the measure decreases correctly, by requirement 1 and 2's standards, but the base case doesn't actually catch every value the measure could reach).

### Discard the throwaway example

Not applicable — this unit's content is a checklist applied to functions already written.

### Formal Definition, Walked Through

> A recursive function is guaranteed to terminate on a given input if there exists a termination measure `m`, computed from the function's parameters, such that: (1) every recursive call's arguments produce a strictly smaller value of `m` than the current call's; (2) `m` is bounded below by some fixed value `b`; and (3) the base case is reached whenever `m` would otherwise need to go below `b`.

- *"strictly smaller"* — not "no larger"; a measure that can stay the same between calls provides no guarantee at all, the exact gap `broken-sum-to` fell into.
- *"bounded below by some fixed value"* — without this, a measure could decrease forever (through negative numbers, say) without ever being forced to stop, providing no actual termination guarantee even while genuinely decreasing every call.

### CS Lens

A termination measure is often called a **variant** in formal program-verification literature — the same idea Lesson 16's loop invariant used for correctness, applied here to guarantee a process *ends* rather than to guarantee what's true *while* it runs. Both together — an invariant that holds throughout, and a variant that strictly decreases throughout — are the two halves of a complete correctness argument for any repeated or recursive process.

### SE Lens

Stating a termination measure explicitly, even informally, before trusting a recursive function is a real, cheap habit that catches both of this series' broken examples immediately: `broken-sum-to`'s measure claim ("`n` decreases each call") is falsified by reading the code — the recursive call passes `n`, unchanged. `broken-sum-by-twos`'s original measure claim ("`n` decreases to `0`") is subtly wrong — it decreases *toward* `0` but doesn't reliably *reach* it. Neither mistake requires running the code to catch, once the three requirements are checked deliberately against the function's actual text.

### Connection to the previous unit

The previous unit identified two different failures informally; this unit gives the precise, three-part checklist that explains both — `broken-sum-to` fails part 1, and the original `broken-sum-by-twos` fails part 3, while the corrected version satisfies all three.

---

## Concept Unit: Well-Ordering — Why a Decreasing Measure Actually Guarantees Termination

### The Problem

"The measure strictly decreases and stays non-negative" is stated as a guarantee of termination — but *why*, exactly, does a strictly decreasing sequence of natural numbers have to stop? Couldn't it just keep decreasing, forever, always finding some smaller natural number?

### Introduce the concept in isolation

It can't, and the reason is a fact worth stating precisely: the **well-ordering principle** — every non-empty collection of natural numbers has a smallest element. Apply this directly to a termination measure's sequence of values across successive recursive calls: `n₀ > n₁ > n₂ > ...`, all natural numbers (by requirement 2's lower bound). If this sequence never stopped, the collection `{n₀, n₁, n₂, ...}` would be a non-empty collection of natural numbers — and by well-ordering, it has a smallest element, say `nₖ`. But the sequence keeps strictly decreasing past every point (by assumption, it never stops), so there's some later term `n_{k+1}` smaller than `nₖ` — contradicting that `nₖ` was the smallest element of the whole collection. This is Lesson 17's proof by contradiction, applied directly: assuming the sequence never terminates leads to an impossibility, so it must terminate.

### Discard the throwaway example

Not applicable — this is the formal justification for the previous unit's checklist, not new code.

### CS Lens

Well-ordering is the exact same underlying fact that made Lesson 15's mathematical induction valid in the first place — both rely on the natural numbers having no infinite descending chain, just applied in two directions: induction climbs *upward* from a base case, using the fact that every natural number is reachable that way; a termination argument works *downward* toward a base case, using the fact that no descent through the natural numbers can continue forever. Lesson 259's *Turing machines* and Lesson 261's *halting problem* both return to exactly this question — whether a process is guaranteed to stop — at a far more general level than a single recursive function's own termination measure.

### SE Lens

This is why a termination measure specifically needs to be bounded *below*, and specifically by natural numbers (or something that reduces to them) — a quantity that could decrease through, say, an unbounded range with no floor (arbitrary real numbers approaching but never reaching a limit) would not automatically terminate just because it's "always getting smaller." The well-ordering principle is what makes "strictly decreasing, bounded below by zero, over the naturals" a genuine guarantee, not just an intuition that usually happens to work out.

### Connection to the previous unit

The previous unit stated the three-part checklist as something to verify; this unit supplies the actual reason the checklist, once satisfied, is a real guarantee rather than a heuristic — grounded in the same mathematical fact that already justified induction, three lessons ago.

---

## Connect the Pieces

Every recursive function from this section so far, checked against the full termination-measure checklist:

| Function | Measure | Strictly decreases? | Bounded below? | Base case catches it? | Terminates? |
|---|---|---|---|---|---|
| `sum-to` | `n` | Yes, by `1` | Yes, by `0` | Yes, `(= n 0)` exactly matches | **Yes** |
| `factorial` | `n` | Yes, by `1` | Yes, by `0` | Yes, `(= n 0)` exactly matches | **Yes** |
| `even-number?` | `n` | Yes, by `1` | Yes, by `0` | Yes, `(= n 0)` exactly matches | **Yes** |
| `sum-by-twos` (corrected) | `n` | Yes, by `2` | Yes, by `0` | Yes, `(<= n 0)` catches any crossing | **Yes** |
| `broken-sum-to` | `n` | **No** — unchanged | — | — | **No** |
| `broken-sum-by-twos` (original) | `n` | Yes, by `2` | Yes, by `0` | **No** — `(= n 0)` misses odd values | **No** |

Every "No" in the table traces back to exactly one of the three checklist requirements failing — never a vague "something's wrong," but a specific, named gap, checkable directly against the function's own code without needing to run it and wait.

## What Breaks Without This

Suppose a new recursive function were written without checking this lesson's three requirements at all — say, a countdown function intended to reach `1`, but with its base case accidentally checking `(= n 0)`:

```clojure
(defn countdown-to-one [n]
  (if (= n 0)
    (quote done)
    (+ n (countdown-to-one (- n 1)))))
```

Called on any positive integer, this actually works — `n` decreases by exactly `1` each time, and `0` is reached precisely, the same shape as `sum-to`. The termination measure checklist, applied *before* running it, would have confirmed this immediately: measure `n`, strictly decreasing by `1`, bounded below by `0`, base case matching exactly. Called on `0.5` (a non-integer, never excluded by anything in the function itself), the measure decreases by `1` each time but never hits `0` exactly — `0.5, -0.5, -1.5, ...` — sailing straight past the base case forever, the identical failure mode as the original `sum-by-twos`, for a reason the checklist would have caught immediately if the function's actual domain (integers only, never checked or stated) had been considered as part of requirement 3.

## Exercises

1. **Trace.** State the termination measure for `factorial`, and verify all three checklist requirements against its actual code, the way this lesson did for `sum-to`.
2. **Predict.** Before checking, predict whether a function recursing on `(quot n 2)` (integer division by 2, decreasing toward `0`) satisfies all three requirements for natural-number inputs. What about for `n = 0` itself, as a starting input — does the base case need to handle it directly, or does the recursive step ever get reached?
3. **Diagnose.** For `broken-sum-to` and the original `broken-sum-by-twos`, state, in one sentence each, exactly which of the three checklist requirements fails and why — not just "it doesn't terminate."
4. **Break it, on purpose.** Write a recursive function whose measure decreases correctly and is bounded below correctly, but whose base case checks the wrong exact condition anyway (the same category of mistake as the original `sum-by-twos`), using a step size and base case combination of your own choosing.
5. **Generalize.** `even-number?` was verified against the checklist in Connect the Pieces using `n`'s value as the measure. Is there a different, equally valid measure you could use instead for the same function? (Hint: does the measure have to be `n` itself, or just some quantity derived from it that also satisfies all three requirements?)
6. **Reconstruct.** Close this lesson. From memory, state the three requirements of a termination measure, and explain, using the well-ordering principle, why satisfying all three is a genuine guarantee rather than just a strong hint.

## Definition of Done

- [ ] You can state the three requirements of a termination measure from memory.
- [ ] You can check a given recursive function against all three requirements and correctly identify which (if any) fail.
- [ ] You completed Exercise 3, correctly diagnosing both broken functions using this lesson's precise vocabulary rather than "it doesn't work."
- [ ] You can explain, using the well-ordering principle, why a strictly decreasing sequence of natural numbers cannot continue forever.
- [ ] Commit your Exercise 4 function to your notes repository, with a commit message stating which requirement you deliberately violated and how — for example, `"Add broken-sum-by-fours — base case (= n 0) misses starting values not divisible by 4, same gap as original sum-by-twos"` — not just `"lesson 22 exercise"`.

---

**Next lesson:** Lesson 23, *Tracing Recursive Evaluation*, builds the skill of following a recursive function's execution completely by hand — every call, every pending operation, drawn out as an evaluation tree — the tool this lesson's termination arguments assumed but didn't yet teach how to perform systematically.
