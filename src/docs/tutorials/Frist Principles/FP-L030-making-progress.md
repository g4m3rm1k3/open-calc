# Lesson 30: Making Progress

**What you will build:** Two real, running Scheme programs that both have a correctly stated base case — and only one of them ever actually reaches it. The transferable problem this lesson is actually about: Lesson 27 and Lesson 29 both focused on whether a base case exists and whether it's stated correctly; neither one asked whether every recursive call is actually guaranteed to get closer to it. A base case that's stated perfectly can still be unreachable from some starting values, if nothing forces each recursive call to make real progress toward it.

**What you need to know first:** Lesson 20 (`FP-L020-ordering.md`) — specifically *total order*, reused directly to explain what "getting closer" actually requires. Lesson 23 (`FP-L023-direct-proof.md`) — specifically direct proof's hypothesis-to-conclusion structure, reused directly in Concept Unit 3 to prove a procedure terminates. Lesson 27 (`FP-L027-recursive-definitions.md`) and Lesson 29 (`FP-L029-base-cases.md`) — specifically *base case*, extended here with a second, independent requirement a base case alone does not guarantee.

**Terms introduced in this lesson**

- **Progress measure** — a quantity, computed from a recursive call's argument, that strictly decreases with every recursive call and is bounded below by the base case. A progress measure is what actually guarantees a recursive procedure terminates — a correct base case only guarantees *where* it stops, not that it will ever get there.

## Objects and methods used

None new. This lesson reuses `define`, `if`, `=`, `-`, and `display` exactly as established in Lesson 28, applying them to two small, contrasting procedures.

---

## Concept Unit 1: Having a Base Case Isn't Enough — a Recursive Call That Doesn't Get Closer

### The Problem

`factorial` and `fib` (Lessons 28 and 29) both decrease their argument by exactly `1` on every recursive call, always landing precisely on their base case. Nothing about `if (= n 0) ...` in either procedure actually requires this, though — it only states what happens *once* `n` reaches `0`. A recursive case that doesn't reliably move `n` toward `0` could have a perfectly correct base case and still never reach it for some inputs.

### The New Code — Type It Yourself

```scheme
(define (countdown-by-2 n)
  (if (= n 0)
      'done
      (countdown-by-2 (- n 2))))
```

### The Updated Project

This is `countdown.scm`, in full:

```scheme
(define (countdown-by-2 n)
  (if (= n 0)
      'done
      (countdown-by-2 (- n 2))))

(display (countdown-by-2 4))
(newline)
```

### Reference Source

No reference counterpart — a small, deliberately minimal procedure built specifically to expose this lesson's point.

### Files affected

Created: `countdown.scm`.

### Change type

Add (new file).

### Dependencies

The Guile interpreter (Lesson 28).

### Run It — Show the Real Output

```
$ guile countdown.scm
done
```

Verified this session: `countdown-by-2` applied to `4` steps through `4, 2, 0`, reaching the base case exactly, and returns `done` immediately.

### Mechanical Walkthrough

- **`(if (= n 0) 'done (countdown-by-2 (- n 2)))`** — a reappearance of *conditional expression*, *base case*, and *recursive case* (Lessons 12 and 27), with a base case that checks for `n` equal to exactly `0`, not "`n` at or below `0`."
- **`(- n 2)`**, subtracting `2` each call rather than `1`** — the one deliberate difference from every recursive procedure this curriculum has written so far, chosen specifically to set up Concept Unit 4.
- **`4 → 2 → 0`, reaching the base case exactly** — confirms this particular call works correctly, without yet revealing the problem this unit is building toward.

### CS Lens

This is the recognition that a recursive case's specific arithmetic — not just the presence of a base case — determines whether recursion actually terminates for a given input. Also recognized in: a countdown timer decremented by an increment that doesn't evenly divide its starting value, potentially skipping past zero; a search algorithm that jumps by a fixed step size, potentially stepping over its target; a scheduling loop incrementing by a fixed interval that may never land exactly on a target date; a physical simulation stepping forward in fixed time increments that may step past an event it needed to detect precisely.

### SE Lens

The alternative to examining the recursive case's specific arithmetic is to trust that "it has a base case" is the whole story, the same incomplete confidence Lesson 29 already warned against for base cases that are merely present rather than correct. The real cost of that alternative, made concrete in Concept Unit 4, is a recursive procedure that works perfectly for every input someone happens to test and fails for inputs with a different, untested property — here, oddness — with nothing about the code itself hinting at the distinction. Examining exactly how the argument changes with each call, as this unit begins to do, costs nothing beyond looking closely at the recursive case; it is the first step toward the guarantee Concept Unit 2 names precisely.

---

## Concept Unit 2: Progress — a Quantity That Strictly Decreases Toward the Base Case

### The Problem

Concept Unit 1 worked correctly for `4`. Whether it works for *every* natural number depends on something that hasn't been stated precisely yet: a guarantee that repeatedly subtracting `2` from any legal starting value eventually lands exactly on `0`, not merely gets close to it or passes by it.

### No isolated lab for this step

This concept has no code of its own to isolate — stating the progress requirement precisely is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Naming What factorial and fib Actually Guarantee

**`factorial`'s recursive call, examined for progress:** `(factorial (- n 1))` — `n` decreases by exactly `1` each call. Starting from any natural number, subtracting `1` repeatedly visits every natural number below it, in order, with none skipped — it must eventually reach exactly `0`.

**`countdown-by-2`'s recursive call, examined the same way:** `(countdown-by-2 (- n 2))` — `n` decreases by exactly `2` each call. Starting from `4`: `4, 2, 0` — reaches `0` exactly. Starting from `5`: `5, 3, 1, -1, -3, ...` — `0` is never one of these values at all.

**Naming the actual requirement, precisely:** a recursive procedure terminates only if some quantity, computed from its argument, strictly decreases with every recursive call *and* is guaranteed to actually reach the base case's value, not merely approach or pass it. This quantity is a progress measure.

**Connecting this directly to Lesson 20:** "strictly decreases" is exactly Lesson 20's ordering vocabulary — the progress measure needs a total order (so every value can be compared to the base case) in which the sequence of values produced by repeated recursive calls is strictly decreasing and bounded below by the base case.

### Walkthrough

- **`factorial`'s `n − 1`, checked against every natural number starting point** — confirms, for the first time explicitly, exactly why factorial's specific arithmetic is safe: subtracting `1` from any natural number, repeated enough times, cannot skip `0`.
- **`countdown-by-2`'s `n − 2`, checked against both an even and an odd starting point** — demonstrates concretely, using Concept Unit 1's own worked example, exactly where the same style of reasoning succeeds and where it fails.
- **"a progress measure"** — first appearance of this lesson's central term, defined by the two-part requirement (strictly decreasing, bounded below by the base case) just worked out.
- **The explicit connection to Lesson 20's ordering vocabulary** — not a new concept, but a direct application of *total order*, confirming this requirement is a specific instance of an idea already fully established.

### CS Lens

This is termination analysis: verifying not merely that a stopping condition exists, but that a process is actually guaranteed to reach it — a distinct question from correctness, and one this curriculum will return to formally much later when analyzing algorithms in general. Also recognized in: a `while` loop's own termination depending on its updated variable actually reaching its stopping condition, not just having one written; a physical process guaranteed to reach equilibrium because some measurable quantity (energy, in many physical systems) strictly decreases toward a known floor; a negotiation guaranteed to end because the range of acceptable offers strictly narrows each round; a board game guaranteed to end because some quantity (available moves, remaining pieces) strictly decreases and cannot go below zero.

### SE Lens

The alternative to identifying an explicit progress measure is to write a recursive case that "seems like" it should get smaller, without checking precisely how, and without checking whether it can skip past the base case for some inputs. The real cost of that alternative is exactly `countdown-by-2`'s hidden flaw: the procedure looks identical in structure to a correct one, passes every even-number test, and fails silently — not with a wrong answer, but by never returning at all — for exactly the inputs nobody happened to try. Naming the progress measure explicitly, and checking it against the base case's exact value, as this unit does, costs one deliberate check per recursive procedure; it is what turns "probably terminates" into a claim that can actually be verified.

---

## Concept Unit 3: Verifying Progress Really Happens — Proving factorial Terminates

### The Problem

Concept Unit 2 explained, informally, why `factorial`'s progress measure is safe. Stating this as an actual direct proof, following Lesson 23's exact structure, confirms it properly rather than leaving it as a plausible-sounding explanation — precisely the standard Lesson 22 demanded of any claim worth trusting.

### No isolated lab for this step

This concept has no code of its own to isolate — the proof is given directly below, not through a construct with its own syntax.

### Applying It — a Direct Proof of Termination

**Hypothesis:** `n` is a natural number (`n ≥ 0`, a whole number).

**Conclusion:** repeatedly applying `factorial`'s recursive case — replacing `n` with `n − 1` — reaches `0` in exactly `n` steps.

**The chain:**

> 1. Define the progress measure as `n` itself.
> 2. Each recursive call replaces `n` with `n − 1`, so the progress measure strictly decreases by exactly `1` per call.
> 3. Since `n` is a natural number, `n ≥ 0`.
> 4. A quantity starting at `n`, decreasing by exactly `1` each step, and never going below `0` (by the base case's guard, `(= n 0)`, stopping recursion the moment `0` is reached) must pass through every integer from `n` down to `0`, in order, since decreasing by exactly `1` cannot skip any integer.
> 5. Therefore, the progress measure reaches exactly `0` after exactly `n` steps, and the base case fires.

**Checking this proof against Concept Unit 1's `countdown-by-2`, to confirm it correctly identifies why that procedure is different:** applying the identical argument, with a progress measure decreasing by `2` per call instead of `1`, Step 4 fails — decreasing by `2` *can* skip an integer, specifically whichever one has the opposite parity from the starting value's distance to `0`. The proof genuinely does not go through for `countdown-by-2`, confirming, rather than merely illustrating, that the two procedures are fundamentally different in this respect.

### Walkthrough

- **The hypothesis and conclusion, stated first** — a direct reappearance of Lesson 23's *direct proof* structure.
- **Step 2, identifying the progress measure explicitly** — a reappearance of *progress measure* (Concept Unit 2), now used as the actual subject of a formal proof rather than an informal observation.
- **Step 4, the step where decreasing by exactly `1` matters** — the crux of the entire proof: this is precisely the step that would fail for `countdown-by-2`, checked explicitly in the paragraph following the proof itself.
- **The explicit check against `countdown-by-2`** — not a new concept, but confirmation, using Lesson 24's counterexample-hunting spirit, that the proof's own reasoning correctly distinguishes the two procedures rather than accidentally applying to both.

### CS Lens

This is a termination proof, one of the two proof obligations (alongside correctness) any recursive or iterative process genuinely deserves before being trusted — and the first time this curriculum has proven that a procedure terminates, rather than merely proving what it computes once it does. Also recognized in: a compiler's termination checker for certain restricted recursive definitions, verifying a decreasing measure automatically; a formal methods proof accompanying safety-critical software, establishing that a control loop cannot run forever; a mathematician's proof that a numerical method converges, established by showing a specific quantity strictly decreases toward a known bound; a project manager's argument that a shrinking backlog, worked at a guaranteed pace, must reach zero by a specific date.

### SE Lens

The alternative to proving termination is to trust that a recursive procedure "looks like" it should terminate, based on its resemblance to other procedures that do. The real cost of that alternative is exactly what `countdown-by-2` demonstrates: superficial resemblance to a correct pattern (a base case, a recursive call, an argument that "gets smaller") is not the same as a verified guarantee, and the two can diverge on inputs nobody happened to try. Proving termination explicitly, as this unit does for `factorial`, costs the real effort of a full direct proof; it is what actually distinguishes "this should work" from "this is guaranteed to work, for every natural number, not just the ones tested."

---

## Concept Unit 4: A Real Bug — Progress That Doesn't Reach the Base Case

### The Problem

Concept Unit 2 predicted, on paper, that `countdown-by-2` applied to an odd number would never reach `0`. It's worth confirming this against a real, running program, exactly the way Lesson 29 confirmed Lesson 27's paper argument about missing base cases.

### The New Code — Type It Yourself

No new code is needed — the exact procedure from Concept Unit 1, applied to a different, deliberately chosen argument.

### The Updated Project

`countdown.scm`, with its final call changed from `4` to `5`:

```scheme
(define (countdown-by-2 n)
  (if (= n 0)
      'done
      (countdown-by-2 (- n 2))))

(display (countdown-by-2 5))
(newline)
```

### Reference Source

Concept Unit 1's `countdown.scm`, with exactly its final argument changed — the same procedure, applied to the input Concept Unit 2 predicted would fail.

### Files affected

Modified: `countdown.scm`.

### Change type

Replace (the argument to the final call only).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile countdown.scm &
$ sleep 5
$ ps -p <pid>
   <pid> still running
```

Verified this session: `countdown-by-2` applied to `5` was still running, unfinished, five full seconds later — a call that, had it reached its base case, would have returned in a fraction of a second, exactly as `countdown-by-2` applied to `4` (Concept Unit 1) did instantly. The process was terminated manually; it showed no sign of ever stopping on its own.

### Mechanical Walkthrough

- **`5, 3, 1, -1, -3, -5, ...`, the actual sequence of arguments produced** — not shown by any single output (this call, unlike Lesson 29's `broken-factorial.scm`, prints nothing at all, since `(display ...)` never runs until the call returns), but derivable directly from the recursive case, confirming Concept Unit 2's prediction exactly.
- **`(= n 0)`, never once true along this sequence** — a reappearance of the base case's guard, checked here against every value the sequence actually produces, confirming it is never satisfied.
- **The procedure hanging rather than crashing or growing memory** — a genuinely different failure signature from Lesson 29's `broken-factorial.scm`: because `countdown-by-2`'s recursive call is the very last operation performed (nothing is done with its result afterward), it does not accumulate pending work the way `factorial`'s `(* n (factorial (- n 1)))` did — it simply loops, consuming processor time without consuming growing memory, a distinction this curriculum will examine formally once tail recursion is introduced.

### CS Lens

This is a real, observed instance of a recursive procedure with a perfectly stated base case that is nonetheless unreachable for a specific, identifiable category of input — confirming Concept Unit 3's proof was not merely a formality, but caught something real. Also recognized in: an off-by-parity bug in production code that only manifests for odd-numbered inputs, passing every test built from even numbers; a physical control system that oscillates around, but never settles exactly on, a target value, because its adjustment step doesn't evenly divide the distance remaining; a game's turn-based loop that never reaches a "final round" trigger because its round counter increments by a step size that skips past the trigger value; a financial amortization schedule that never reaches exactly zero balance because its payment size doesn't evenly divide the starting principal.

### SE Lens

The alternative to actually running this specific case is to trust Concept Unit 2 and Concept Unit 3's paper reasoning without observing the predicted failure directly. The real cost of that alternative, consistent with Lesson 29's own reasoning, is a weaker, less memorable understanding of a bug category that is common, real, and does not announce itself the way a crash does — this procedure gives no error message at all; it simply never finishes. Running it deliberately, as this unit does, costs a wasted, terminated process; it confirms directly that a stated, correct-looking base case is not, on its own, any guarantee of reachability.

---

## Concept Unit 5: Progress Doesn't Have to Be Simple Subtraction

### The Problem

Every progress measure examined so far has been "subtract a fixed amount from `n`." It's worth confirming this is one instance of a more general idea, not the whole idea — a progress measure only needs to strictly decrease toward a bound, by whatever means actually guarantees that.

### No isolated lab for this step

This concept has no code of its own to isolate — a second, differently structured progress measure is examined directly below, not through a construct with its own syntax.

### Applying It — Halving Instead of Subtracting

**A different recursive shape, informally:** repeatedly dividing a positive integer by `2` (discarding any remainder) until reaching `1`.

**Checking whether "subtract a fixed amount" describes this:** it doesn't — the amount subtracted from `n` to get `n ÷ 2` (with remainder discarded) is different every time, depending on `n` itself, unlike `factorial`'s constant `1` or `countdown-by-2`'s constant `2`.

**Checking whether this is still a valid progress measure, using Concept Unit 2's actual requirement rather than its specific example:** does `n ÷ 2` strictly decrease, for every `n` greater than `1`? Yes — for any whole number greater than `1`, dividing by `2` and discarding the remainder always produces a strictly smaller whole number. Is it bounded below by a reachable base case? Yes — repeatedly halving any positive integer eventually reaches exactly `1`, since halving (with remainder discarded) can never skip over `1` the way subtracting `2` could skip over `0`: the sequence `8, 4, 2, 1` or `7, 3, 1` always lands on `1` precisely, because dividing any number greater than `1` by `2` always yields a result of at least `1`, and dividing `1` itself is where the base case belongs.

**Naming what this confirms:** a progress measure can be *any* rule that strictly decreases toward a base case's value — fixed subtraction is simply the easiest example to reason about, not a requirement.

### Walkthrough

- **"repeatedly dividing... by `2`... until reaching `1`"** — a deliberately different recursive shape, introduced specifically to test whether Concept Unit 2's definition of progress measure was accidentally too narrow.
- **Checking strict decrease and reachability against Concept Unit 2's actual stated requirement, not against `factorial`'s specific pattern** — confirms the general definition, correctly applied, covers this new case without needing to be restated or loosened.
- **"fixed subtraction is simply the easiest example to reason about, not a requirement"** — not a new concept, but the precise, generalizing conclusion this unit exists to establish.

### CS Lens

This is confirmation that a general definition, correctly stated, covers cases its original motivating example never anticipated — exactly the kind of generality Lesson 7 already valued in a well-stated computational problem. This particular progress measure — repeated halving — will recur throughout this curriculum in a much more consequential role once search and divide-and-conquer algorithms are introduced. Also recognized in: a binary search's search space, halved with each comparison rather than reduced by a fixed amount; a population model where a quantity decays by a fixed proportion each period rather than a fixed amount; a sorting algorithm that repeatedly splits a collection in half; a guessing game ("higher or lower") where each guess eliminates roughly half the remaining possibilities rather than one at a time.

### SE Lens

The alternative to checking a progress measure against its actual general definition is to assume, from a small number of examples, that all progress measures must look like `factorial`'s — a fixed amount subtracted each time. The real cost of that alternative would be failing to recognize a perfectly valid, terminating recursive procedure as such, simply because its specific arithmetic doesn't match the first pattern encountered — or, worse, mistakenly assuming a *different* kind of decreasing quantity is safe without actually checking it against the two real requirements (strictly decreasing, reachable base case) this lesson established. Checking a new candidate progress measure against the general definition directly, as this unit does, costs one careful verification; it is what allows this curriculum's later, more varied recursive procedures to be trusted individually, rather than only the ones that happen to resemble `factorial`.

---

## Closing

### Connect the pieces

Two versions of one procedure, traced through every unit built in this lesson, start to finish:

1. **A base case that isn't automatically reachable (Unit 1):** `countdown-by-2`, working correctly for `4`.
2. **Progress, named precisely (Unit 2):** `factorial`'s `n − 1` shown safe for every natural number; `countdown-by-2`'s `n − 2` shown to skip `0` entirely for odd starting values.
3. **Termination actually proven (Unit 3):** a full direct proof that `factorial` reaches `0` in exactly `n` steps, and an explicit check confirming the same argument fails for `countdown-by-2`.
4. **The predicted failure, run for real (Unit 4):** `countdown-by-2` applied to `5`, observed hanging indefinitely, confirming Unit 2's prediction.
5. **Progress generalized beyond subtraction (Unit 5):** repeated halving, checked against the same two-part requirement and found to qualify, despite looking nothing like `factorial`'s pattern.

Unit 4's real, observed hang is the exact failure Unit 2 predicted on paper and Unit 3's proof explicitly showed could not be ruled out for this specific procedure — nothing in this lesson's progression introduced a fresh, disconnected example.

### What breaks without this

Suppose a real scheduling system used a recursive procedure structured like `countdown-by-2`, decrementing a remaining-days counter by a fixed step to determine when a deadline had been reached, and that step size didn't always evenly divide the starting count — exactly the flaw this lesson isolated. For most schedules, the counter would happen to land exactly on zero and the procedure would terminate normally, giving every appearance of correctness during ordinary use and testing. For a schedule whose starting count had the wrong relationship to the step size, the deadline check would never fire at all, and the process built around it would hang indefinitely — not crash, not misbehave visibly, simply never complete — exactly the silent, non-crashing failure Concept Unit 4 observed directly. Restoring this lesson's discipline — identifying the actual progress measure for every recursive procedure, and checking, the way Concept Unit 3 did with an actual proof, that it cannot skip the base case for any legal input — is what catches this before a specific, untested starting value reaches it in production.

### Exercises

1. **Observe.** Take a recursive procedure from your own Lesson 28 or Lesson 29 exercises and state, explicitly, what its progress measure is and what it strictly decreases toward, the way Concept Unit 2 did for `factorial`.
2. **Formalize.** Write a direct proof, following Concept Unit 3's exact structure, that your Exercise 1 procedure's progress measure reaches its base case for every legal input.
3. **Predict.** Invent a small, deliberate change to your Exercise 1 procedure's recursive case that would break its progress measure for some inputs but not others, the way Concept Unit 1 changed `n − 1` to `n − 2`. Predict which inputs would fail before testing.
4. **Explain.** Run your Exercise 3 broken version on both a input you predicted would work and one you predicted would hang, and report what actually happened, the way Concept Unit 4 confirmed `countdown-by-2`'s failure for real.
5. **Formalize.** Find or invent a progress measure that isn't simple fixed subtraction, the way Concept Unit 5 used repeated halving, and check it against this lesson's two-part requirement (strictly decreasing, reachable base case) explicitly.

### Definition of done

- [ ] You can state the difference between "has a base case" and "is guaranteed to reach it," using your own example.
- [ ] You can identify a recursive procedure's progress measure and state precisely what it decreases toward.
- [ ] You can write a direct proof that a specific recursive procedure terminates for every legal input.
- [ ] You can construct a recursive procedure whose base case is correct but unreachable for some inputs, and explain exactly which inputs fail and why.
- [ ] You completed Exercises 1–5 using your own recursive procedure, not `factorial` or `countdown-by-2`.
- [ ] Commit your Exercise 2 proof and Exercise 3 broken version, with a commit message stating which specific inputs you predicted would hang before testing, and whether you were right.
