# Lesson 45: Loop Invariants

**What you will build:** A precisely stated invariant for Lesson 38's `sum-acc`, proven to hold at every single call using the exact induction technique Lesson 43 and Lesson 44 already established — and a deliberately broken sibling procedure whose bug is caught by checking the invariant, without ever running the broken code at all. The transferable problem this lesson is actually about: Lesson 30's progress measure guarantees a tail-recursive procedure like `sum-acc` eventually stops. It says nothing at all about whether the value it stops with is actually correct — that guarantee needs a second, independent property, checked at every step rather than only at the very end.

**What you need to know first:** Lesson 30 (`FP-L030-making-progress.md`) — specifically *progress measure*, deliberately distinguished from this lesson's invariant rather than confused with it. Lesson 38 (`FP-L038-accumulators.md`) — specifically `sum-acc`, reused directly as this lesson's central example. Lesson 43 (`FP-L043-structural-induction.md`) and Lesson 44 (`FP-L044-mathematical-induction.md`) — specifically the base-case-and-inductive-step proof structure, applied directly to this lesson's invariant.

**Terms introduced in this lesson**

- **Loop invariant** — a property that is true every single time a loop (in this curriculum, a tail-recursive procedure's recursive call, per Lesson 39) is about to run again, from the very first call through every subsequent one. An invariant is established once, at the start, and preserved by every iteration — proving both is what guarantees the loop's final result is actually correct, not merely that the loop eventually stops.

## Objects and methods used

None new. This lesson reuses `sum-acc` and `clean-sum` (Lesson 38) directly, examining a property of already-written code rather than introducing new syntax.

---

## Concept Unit 1: What Progress Measures Don't Tell You

### The Problem

Lesson 30 proved `factorial`'s progress measure reaches `0` in exactly `n` steps — a guarantee about *when* a recursive procedure stops. Nothing in that proof, or in any progress-measure argument, says anything about *what value* the procedure actually produces when it does stop. A procedure could terminate exactly on schedule, per a perfectly valid progress measure, and still return a completely wrong answer every time.

### No isolated lab for this step

This concept has no code of its own to isolate — the gap between termination and correctness is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Two Different Questions

**Lesson 30's question, restated:** does `sum-acc`'s recursion reach its base case?

**Checking `sum-acc`'s progress measure directly:** `lst` shrinks by exactly one item with every call, via `(cdr lst)` — strictly decreasing, bounded below by `'()`, exactly Lesson 30's requirement. `sum-acc` is guaranteed to terminate.

**A genuinely different question, not yet asked:** once `sum-acc` terminates, is the value it returns actually the sum of the original list?

**Confirming these are independent questions, with a concrete counterexample:** a procedure that ignored its list entirely and always returned `0` immediately would also satisfy a perfectly valid progress measure (it terminates instantly, every time) while being completely wrong for any non-empty list. Termination alone guarantees nothing about correctness.

### Walkthrough

- **`sum-acc`'s progress measure, rechecked from Lesson 30's own framework** — confirms termination is genuinely established, before this unit moves on to what it doesn't establish.
- **The always-returns-`0` counterexample** — a concrete, deliberately extreme case demonstrating that "terminates" and "correct" are independent properties, not two names for the same guarantee.
- **"termination alone guarantees nothing about correctness"** — not a new concept, but the precise statement of the gap this whole lesson exists to close.

### CS Lens

This is the recognition that a complete correctness argument for any looping or recursive process actually needs two separate guarantees — that it terminates, and that what it terminates with is right — and that these two guarantees require genuinely different kinds of reasoning, neither one substituting for the other. Also recognized in: a factory process guaranteed to eventually stop producing units, which says nothing about whether those units meet specification; a negotiation guaranteed to eventually conclude, which says nothing about whether the concluded terms are actually favorable; a search guaranteed to eventually finish examining every candidate, which says nothing about whether it correctly recognized the right one when it found it.

### SE Lens

The alternative to distinguishing these two questions is to treat "I proved it terminates" as though it settled correctness too, an easy conflation given both proofs, in this curriculum, use closely related induction-style reasoning. The real cost of that alternative is a false sense of completeness: a procedure fully verified to terminate (Lesson 30's own standard) could still be silently, completely wrong, exactly the always-returns-`0` example demonstrates. Naming the second, independent question explicitly, as this unit does, costs nothing beyond recognizing it needs asking; it sets up the rest of this lesson to actually answer it.

---

## Concept Unit 2: Loop Invariant — a Property True at Every Step

### The Problem

Correctness needs to be checked at *every* step of the recursion, not only compared against the final answer after the fact — the same reason Lesson 22 preferred a general proof over checking a handful of final results. What's needed is a property, stated precisely, that's true every single time `sum-acc` is about to make its next call.

### No isolated lab for this step

This concept has no code of its own to isolate — the property is stated directly below, not through a construct with its own syntax.

### Applying It — Stating sum-acc's Invariant

**`sum-acc`'s two parameters, at any point during its recursion:** `lst`, whatever items remain unprocessed, and `acc`, the running total built so far.

**The invariant, stated precisely:** `acc + sum(lst)` always equals the sum of the *original*, complete list `sum-acc` was first called on — where `sum(lst)` here means the ordinary sum of whatever items remain in the current, shrinking `lst`.

**Checking this invariant at the very first call, applying `sum-acc` to `(list 91 85 72)`:** `acc = 0`, `lst = (91 85 72)`. `0 + sum((91 85 72)) = 0 + 248 = 248` — the sum of the original list. Holds.

**Checking it partway through, after one recursive call has been made:** `acc = 91`, `lst = (85 72)`. `91 + sum((85 72)) = 91 + 157 = 248` — still the sum of the original list. Still holds.

**Checking it at the very end, when `lst` becomes `'()`:** `acc = 248`, `lst = '()`. `248 + sum('()) = 248 + 0 = 248`. Still holds — and since `lst` is now empty, the invariant directly states `acc` itself equals the original sum, exactly what `sum-acc`'s base case returns.

### Walkthrough

- **`acc + sum(lst) = sum(original list)`** — first appearance of *loop invariant*, stated precisely as a relationship between the two parameters that must hold at every point in the recursion.
- **The three checks — at the start, partway through, and at the end** — demonstrates the invariant holding at more than one point, building genuine confidence rather than checking only a single moment.
- **The base-case check specifically, `248 + 0 = 248`** — confirms directly why an invariant that holds all the way to the end is actually useful: at termination, it collapses into exactly the statement that the returned value is correct.

### CS Lens

This is the standard tool software verification uses to reason about any looping or iterative process: a property that holds unchanged across every iteration, chosen specifically so that, combined with the loop's own stopping condition, it implies the desired final result. Also recognized in: a bank's running balance invariant — deposits and withdrawals recorded so far always equal the difference between the current balance and the opening balance — checked at every transaction, not just at closing time; a construction project's safety invariant — the structure remains stable — checked at every stage, not just at completion; a chemical process's mass-balance invariant — total mass in equals total mass out plus what's currently in the reactor — checked continuously, not just at the end of a batch.

### SE Lens

The alternative to stating an invariant explicitly is to trust that a tail-recursive procedure "probably" computes the right thing, based on it looking similar to other correct procedures already built. The real cost of that alternative is exactly Concept Unit 1's counterexample risk: a procedure can terminate correctly and still be wrong, with nothing about its surface structure revealing the difference. Stating the invariant precisely, and checking it at multiple points as this unit does, costs the work of identifying exactly what relationship should hold; it is what turns "probably correct" into something that can actually be checked, and, in Concept Unit 3, actually proven.

---

## Concept Unit 3: Proving the Invariant, Using Induction

### The Problem

Concept Unit 2 checked the invariant at three specific points. Establishing it for *every* call `sum-acc` could ever make, on a list of any length, needs the same technique Lesson 43 and Lesson 44 already built for exactly this kind of unbounded claim.

### No isolated lab for this step

This concept has no code of its own to isolate — the complete inductive proof is given directly below, not through a construct with its own syntax.

### Applying It — the Full Proof

**Restating the invariant as the property to prove, `P`, for every call `sum-acc(lst, acc)` reachable from an original call `sum-acc(original, 0)`:** `acc + sum(lst) = sum(original)`.

**Base case: the very first call, `sum-acc(original, 0)`.** `acc + sum(lst) = 0 + sum(original) = sum(original)`. Holds directly — this is the starting point, requiring no assumption.

**Inductive step: assume the invariant holds for some call `sum-acc(lst, acc)` — the inductive hypothesis — and show it holds for the next call, `sum-acc((cdr lst), (+ (car lst) acc))`, which `sum-acc`'s own recursive case actually makes.**

> 1. **Inductive hypothesis:** `acc + sum(lst) = sum(original)`.
> 2. The next call's accumulator is `(+ (car lst) acc)`, and its list is `(cdr lst)`.
> 3. `(+ (car lst) acc) + sum((cdr lst))` — the invariant's left side, evaluated for the next call.
> 4. `sum(lst) = (car lst) + sum((cdr lst))`, by ordinary summation (Lesson 26) — a list's sum is its first item plus the sum of the rest.
> 5. Substituting Step 4 into the inductive hypothesis (Step 1): `acc + (car lst) + sum((cdr lst)) = sum(original)`.
> 6. Step 3's expression, `(car lst) + acc + sum((cdr lst))`, is the same three terms as Step 5's left side, just reordered — and addition doesn't care about order (Lesson 15, Concept Unit 4) — so Step 3 equals `sum(original)` too.
> 7. Therefore, the invariant holds for the next call as well.

**Confirming both parts together establish the invariant for every call, on a list of any length:** exactly Lesson 44's own argument, specialized here to "number of recursive calls made so far" rather than to `n` directly — the first call is covered by the base case, and every subsequent call is covered by the inductive step, however many calls the recursion ultimately makes.

### Walkthrough

- **The base case, the very first call with `acc = 0`** — a direct application of Concept Unit 2's own first check, now proven rather than merely checked.
- **Step 1, the inductive hypothesis, stated explicitly** — a reappearance of *inductive hypothesis* (Lesson 43), applied here to a call's own parameters rather than to a smaller instance of a data structure.
- **Steps 2 through 7, connecting the current call's assumed invariant to the next call's invariant** — the actual mechanics of the inductive step, grounded directly in `sum-acc`'s real recursive case.
- **The explicit connection to Lesson 44's own argument shape** — not a new concept, but confirmation that proving an invariant across a recursion's calls is yet another instance of the identical induction technique, now applied to a third kind of claim (after trees and lists) in as many lessons.

### CS Lens

This is the formal justification for exactly what Concept Unit 2 only checked at three points — a complete proof, covering every call `sum-acc` could ever make on a list of any length, using the identical induction technique this curriculum has now applied to trees (Lesson 43), natural numbers (Lesson 44), and loop invariants (here) in successive lessons. Also recognized in: a formally verified control system, proving a safety invariant holds at every control cycle, no matter how many cycles the system runs; a database transaction system, proving a consistency invariant holds after every single transaction, no matter how many transactions occur; a cryptographic protocol, proving a security invariant holds at every message exchange, no matter how long a session lasts.

### SE Lens

The alternative to proving the invariant is to check it at a few points, the way Concept Unit 2 did, and trust that the pattern continues. The real cost of that alternative is, once again, Lesson 22's central warning: checking three points is evidence, not proof, and nothing about three successful checks logically rules out a violation at the two-hundredth call on some much longer list. Proving it inductively, as this unit does, costs the real work of Steps 1 through 7; it establishes the invariant with the same certainty Lesson 43 and Lesson 44 already demanded for claims about trees and natural numbers, now extended to claims about a running computation's own intermediate state.

---

## Concept Unit 4: Invariants Catch Bugs Before Running Any Code

### The Problem

Concept Unit 3's proof was written for the *correct* `sum-acc`. It's worth demonstrating directly what happens when the same discipline — state the invariant, try to prove it holds — is applied to a version with a real, easy-to-make bug, to see whether the invariant actually catches the mistake.

### The New Code — Type It Yourself

```scheme
(define (sum-acc-buggy lst acc)
  (if (null? lst)
      acc
      (sum-acc-buggy (cdr lst) (+ acc 1))))
```

### The Updated Project

This is `sum-acc-buggy.scm`, in full:

```scheme
(define (sum-acc-buggy lst acc)
  (if (null? lst)
      acc
      (sum-acc-buggy (cdr lst) (+ acc 1))))

(define (clean-sum-buggy lst) (sum-acc-buggy lst 0))

(display (clean-sum-buggy (list 91 85 72)))
(newline)
```

### Reference Source

`sum-acc.scm` (Lesson 38), with exactly one change: `(+ (car lst) acc)` narrowed to `(+ acc 1)` — a plausible-looking typo, adding one instead of adding the actual item.

### Files affected

Created: `sum-acc-buggy.scm`.

### Change type

Add (new file, deliberately flawed, kept for comparison).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile sum-acc-buggy.scm
3
```

Verified this session — `3`, not `248`. `sum-acc-buggy` silently computes the *count* of items, not their sum — a real, running, plausible-looking wrong answer, exactly the kind of bug this curriculum has repeatedly warned produces no visible sign of failure.

**Checking the invariant against this buggy version, before — and independent of — the real output just shown:** does `acc + sum(lst) = sum(original)` hold for `sum-acc-buggy`? Checking the inductive step directly: the next call's accumulator is `(+ acc 1)`, not `(+ (car lst) acc)`. Redoing Concept Unit 3's Step 3 with this actual update: `(+ acc 1) + sum((cdr lst))`. This does *not* generally equal `acc + sum(lst)` (Step 1's inductive hypothesis) — it's off by `1 - (car lst)`, which is zero only when `(car lst)` happens to be exactly `1`. The invariant fails at the very first place it's checked, for any list whose first item isn't `1` — `91`, in this case.

### Walkthrough

- **`(+ acc 1)`, the single altered line** — deliberately isolated so the consequence of exactly this one change can be examined precisely.
- **`3`, the real, wrong output** — confirms the bug is genuinely present and genuinely silent, running to completion with no error.
- **Rechecking the inductive step with the buggy update rule, finding it fails** — the actual demonstration this unit exists to provide: the invariant, checked the same way Concept Unit 3 checked the correct version, immediately reveals exactly where the buggy version breaks — not by running it and noticing a wrong number, but by attempting the proof and finding it doesn't go through.

### CS Lens

This is the practical, day-to-day value of stating and checking a loop invariant: the exact same discipline that proves a correct procedure correct also exposes, precisely and immediately, where an incorrect procedure's incorrectness actually lives — not merely that it's wrong, but the specific line responsible. Also recognized in: an accounting audit's balance-check invariant immediately flagging the specific transaction where books stopped reconciling, rather than only revealing that the year-end totals don't match; a manufacturing quality invariant immediately flagging the specific station where a part first went out of tolerance, rather than only revealing that the finished product failed inspection; a scientific experiment's control-invariant check immediately flagging the specific trial where conditions drifted, rather than only revealing that final results look inconsistent.

### SE Lens

The alternative to checking the invariant explicitly is to notice only that `sum-acc-buggy`'s final output, `3`, looks wrong, without a systematic way to trace exactly where the computation went astray. The real cost of that alternative, for a longer, more complex procedure than this lesson's simple example, is a much harder debugging task: working backward from a wrong final answer to the specific flawed step, without the invariant's own precise, checkable statement to test each step against. Stating the invariant and checking the inductive step directly against the buggy code, as this unit does, costs nothing beyond redoing Concept Unit 3's algebra with the actual buggy update rule substituted in; it locates the exact defect immediately, from reasoning alone, without needing to trace through a single execution by hand.

---

## Closing

### Connect the pieces

One procedure and one deliberately broken sibling, traced through every unit built in this lesson, start to finish:

1. **The gap named (Unit 1):** termination (Lesson 30) says nothing about correctness — a trivial, always-wrong procedure can terminate perfectly.
2. **The invariant stated (Unit 2):** `acc + sum(lst) = sum(original)`, checked at the start, partway through, and at the end of `sum-acc`'s real recursion.
3. **The invariant proven, for any list length (Unit 3):** a complete inductive proof, base case and inductive step, establishing the invariant for every call `sum-acc` could ever make.
4. **A bug caught by the same check (Unit 4):** `sum-acc-buggy`, silently computing `3` instead of `248`, exposed immediately by attempting Concept Unit 3's same inductive step and finding it fails.

Unit 4's check reruns Unit 3's exact inductive-step algebra, substituting only the buggy update rule — not a fresh investigative technique, but the identical proof attempt, applied to code it was never actually written for, exposing precisely where it breaks.

### What breaks without this

Suppose a real accumulator-based procedure, structured like `sum-acc`, were deployed with `sum-acc-buggy`'s exact category of mistake — an accumulator update that looks plausible, references the right variables, and produces a real number, but silently computes the wrong quantity. Because the procedure still terminates correctly (its progress measure, `lst` shrinking toward `'()`, was never affected by the mistake) and still produces *a* number, nothing about running it would signal a problem unless someone happened to check the specific output against an independently known correct value, the same discipline Lesson 22 and Lesson 29 already insisted on. A team relying only on "it ran and gave back a number" would carry this defect forward, potentially for a long time, exactly the risk every silent, non-crashing bug in this curriculum has demonstrated. Restoring this lesson's discipline — stating a loop invariant for any accumulator-based procedure and checking, even just informally, whether its inductive step actually preserves it — is what would catch this specific category of mistake immediately, by reasoning about the code's structure directly, without needing to run it at all.

### Exercises

1. **Observe.** Take one of your own accumulator-based procedures from Lesson 38's exercises, and state its loop invariant precisely, the way Concept Unit 2 stated `sum-acc`'s.
2. **Formalize.** Check your Exercise 1 invariant at the start, partway through (by hand, for one specific input), and at the end of your procedure's recursion, the way Concept Unit 2 checked all three points for `sum-acc`.
3. **Formalize.** Write the complete inductive proof that your Exercise 1 invariant holds for every call your procedure could make, following Concept Unit 3's exact base-case-and-inductive-step structure.
4. **Explain.** Deliberately introduce a plausible, easy-to-make bug into your Exercise 1 procedure's accumulator update, the way Concept Unit 4 changed `(+ (car lst) acc)` to `(+ acc 1)`. Run the buggy version and report its real, wrong output.
5. **Explain.** Recheck your Exercise 3 proof's inductive step against the buggy update rule from Exercise 4, the way Concept Unit 4 rechecked `sum-acc`'s proof against `sum-acc-buggy`. State precisely where and why the proof attempt fails.

### Definition of done

- [ ] You can state the difference between a progress measure and a loop invariant, and explain why a procedure can have a valid progress measure while still being incorrect.
- [ ] You can state a precise loop invariant for an accumulator-based procedure of your own, checked at more than one point in its execution.
- [ ] You can write a complete inductive proof that a stated invariant holds for every call a recursive procedure could make.
- [ ] You can locate a deliberately introduced bug by rechecking an invariant's inductive step against the buggy code, without relying on the program's wrong output alone.
- [ ] You completed Exercises 1–5 using a procedure of your own choosing, not `sum-acc`.
- [ ] Commit your Exercise 3 proof, your Exercise 4 buggy version, and your Exercise 5 diagnosis, with a commit message stating exactly which step of your invariant proof failed for the buggy version, and why.
