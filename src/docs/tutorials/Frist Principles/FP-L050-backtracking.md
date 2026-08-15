# Lesson 50: Backtracking

**What you will build:** `which-sum`, a procedure that doesn't just answer whether some subset sums to a target the way Lesson 49's `can-sum-to?` did, but returns the actual subset — built up as the search proceeds, and explicitly undone whenever a branch turns out not to work. The transferable problem this lesson is actually about: Lesson 49's search only ever needed to answer yes or no, so a failed branch could simply return `#f` and be forgotten. The moment a search needs to report *which* choices actually worked, something has to track those choices as they're made, and explicitly remove them again when a branch fails — the technique this lesson names backtracking.

**What you need to know first:** Lesson 38 (`FP-L038-accumulators.md`) — specifically *accumulator*, extended here to accumulate a set of *choices* rather than a running number. Lesson 49 (`FP-L049-recursive-search.md`) — specifically `can-sum-to?`, reused directly as the procedure this lesson extends to report its own witness.

**Terms introduced in this lesson**

- **Backtracking** — explicitly adding a choice to a partial solution before exploring further, and explicitly removing it again if that exploration fails — "backing out of" the choice so the search can try a different one from the same point. Lesson 49's `can-sum-to?` backtracked implicitly, in the sense that a failed recursive call simply contributed nothing to the final answer; this lesson makes that undoing explicit and visible, which is what's needed the moment the search must report which specific choices succeeded.

## Objects and methods used

None new. This lesson reuses `cons`, `or`, and `if`, applied to a procedure that carries and modifies a growing partial solution rather than only a running Boolean answer.

---

## Concept Unit 1: can-sum-to? Answers Yes or No — What About Which Subset?

### The Problem

`can-sum-to?` (Lesson 49) correctly reports `#t` for a target of `9` from `(3 7 5 2)` — but says nothing about *which* items actually reach it. A teacher wanting to know whether some combination of quiz scores could add up to a specific total might also want to know exactly which scores, not merely that some combination exists.

### No isolated lab for this step

This concept has no code of its own to isolate — the gap is demonstrated directly below, not through a construct with its own syntax.

### Applying It — What's Missing From a Yes/No Answer

**`can-sum-to?`'s actual output, reappearing from Lesson 49:** `(can-sum-to? (list 3 7 5 2) 9)` returns `#t` — true, but silent about *why*.

**Confirming the "why" genuinely exists, even though `can-sum-to?` never reports it:** somewhere inside `can-sum-to?`'s own recursive exploration, some specific sequence of include/exclude choices reached a target of exactly `0`, which is precisely what made the top-level call return `#t` — that sequence of choices is real, and was actually found; it simply was never captured or returned.

**Naming what's needed:** a version of the same search that, alongside answering the question, also reports the specific choices that made the answer `#t`.

### Walkthrough

- **`can-sum-to?`'s output, `#t`, re-examined for what it doesn't say** — establishes precisely what's missing, rather than treating "report the subset too" as an arbitrary new requirement.
- **"that sequence of choices is real... it simply was never captured"** — confirms the missing information already exists somewhere in the search, motivating Concept Unit 2's actual technique rather than a search built entirely from scratch.

### CS Lens

This is the distinction between an existence check and a constructive witness — Lesson 14 already named both halves of an existential claim (a claim that something exists, and the specific example that proves it); `can-sum-to?` only ever delivered the first half. Also recognized in: a database query confirming a matching record exists versus one that returns the actual record; a metal detector confirming buried metal exists somewhere in range versus a full excavation revealing exactly what and where; a proof that a solution exists versus a constructive proof that actually exhibits one.

### SE Lens

The alternative to distinguishing these two needs is to treat "does a solution exist" and "what is the solution" as the same question, answered by the same kind of procedure. The real cost of that alternative is exactly what `can-sum-to?` demonstrates: a procedure built only to answer the first question discards exactly the information needed to answer the second, even though that information was available, briefly, deep inside its own recursion. Naming the distinction explicitly, as this unit does, costs nothing beyond recognizing what's missing; it sets up Concept Unit 2 to capture the discarded information deliberately.

---

## Concept Unit 2: Backtracking — Building a Partial Solution, Undoing Failed Choices

### The Problem

Reporting the actual subset means carrying a running record of "which items have been chosen so far" through the recursion — and, critically, removing an item from that record if the branch built on choosing it doesn't ultimately succeed, so a sibling branch doesn't incorrectly inherit a choice that didn't pan out.

### No isolated lab for this step

This concept has no code of its own to isolate — the technique is stated directly below, before any code, not through a construct with its own syntax.

### Applying It — Stating the Technique Precisely

**The extra piece of state needed, in Lesson 38's exact accumulator sense:** a growing list, `chosen`, holding every item included so far along the current path through the search.

**What happens when a choice is made — the "forward" half:** including the current item means adding it to `chosen` (via `cons`, exactly the way `reverse-acc` added items to its own accumulator in Lesson 38) before recursing into the rest.

**What happens when that choice's exploration fails — the "backtrack" half:** if including the current item ultimately leads nowhere (the recursive call, with that item added, returns `#f`), the item must not remain part of `chosen` when the search tries the *next* possibility — excluding the same item instead. Because `cons` (Lesson 32) never modifies the original list it's given, only builds a new one, this undoing happens automatically: the "excluding" branch is tried using the original `chosen`, from before the failed inclusion, never the one the failed attempt built.

**Naming this precisely:** backtracking — the item was tentatively added, explored, and, because `cons` never altered the original list, automatically "removed again" the moment a sibling branch is tried using the unmodified original.

### Walkthrough

- **`chosen`, a growing list threaded through the recursion** — a reappearance of *accumulator* (Lesson 38), carrying a partial solution rather than a running number.
- **The "forward" half, adding via `cons`** — a direct reappearance of `cons`'s own behavior (Lesson 32).
- **The "backtrack" half, explained through `cons`'s non-destructive nature** — the actual mechanism this unit exists to name: because `cons` builds a new list rather than modifying the old one, backtracking requires no explicit "undo" step at all — trying the next possibility with the original, untouched `chosen` *is* the undoing.
- **"backtracking"** — first appearance of the term, defined precisely by the forward-and-undo pattern just described.

### CS Lens

This is the specific technique of exploring a choice tentatively, and automatically reverting to the state before that choice the moment a sibling possibility needs to be tried — made especially clean here because Lesson 32's `cons` never destroys the original list it extends, so "backtracking" costs nothing beyond simply not using the modified version. Also recognized in: a chess player trying a candidate move mentally, then mentally returning to the actual board position to consider a different move, having changed nothing physically; a writer trying a sentence in a separate draft before deciding whether to keep it in the real document; a hiker trying a side trail, turning back to the main trail if it's a dead end, with the main trail itself never altered by the attempt.

### SE Lens

The alternative to relying on `cons`'s non-destructive behavior is to maintain `chosen` as mutable state — adding an item, then explicitly removing it again if the branch fails, the way many other programming languages implement backtracking. The real cost of that alternative is real bookkeeping: an explicit "undo" step has to be written and gotten right for every choice point, and forgetting it, or getting it subtly wrong, risks a sibling branch silently inheriting a choice from a failed attempt. Relying on `cons`'s own non-destructive nature, as this unit does, costs nothing beyond understanding why it works; it makes backtracking automatic, a direct consequence of how Lesson 32's lists were built to behave from the very beginning.

---

## Concept Unit 3: Deriving find-subset — Returning the Actual Witness

### The Problem

Concept Unit 2 stated the technique in prose. Translating it into real code means extending `can-sum-to?`'s exact structure with the accumulator just described, following the identical derivation discipline Lesson 46 established for any new recursive procedure.

### The New Code — Type It Yourself

```scheme
(define (find-subset items target chosen)
  (if (= target 0)
      chosen
      (if (null? items)
          #f
          (if (> (car items) target)
              (find-subset (cdr items) target chosen)
              (or (find-subset (cdr items) (- target (car items)) (cons (car items) chosen))
                  (find-subset (cdr items) target chosen))))))
```

### The Updated Project

This is `which-sum.scm`, in full:

```scheme
(define (find-subset items target chosen)
  (if (= target 0)
      chosen
      (if (null? items)
          #f
          (if (> (car items) target)
              (find-subset (cdr items) target chosen)
              (or (find-subset (cdr items) (- target (car items)) (cons (car items) chosen))
                  (find-subset (cdr items) target chosen))))))

(define (which-sum items target)
  (find-subset items target '()))

(display (which-sum (list 3 7 5 2) 9))
(newline)
(display (which-sum (list 3 7 5 2) 100))
(newline)
```

### Reference Source

`can-sum-to?` (Lesson 49), with its base cases changed to return `chosen` (the witness) or `#f`, rather than `#t` or `#f`, and its "include" branch adding the current item to `chosen` via `cons` before recursing.

### Files affected

Created: `which-sum.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile which-sum.scm
(2 7)
#f
```

Verified this session — `(2 7)` genuinely sums to `9`; `100` is correctly reported unreachable, exactly as `can-sum-to?` already established.

**Checking two more cases directly:**

```
$ guile -q
scheme@(guile-user)> (define (find-subset items target chosen) (if (= target 0) chosen (if (null? items) #f (if (> (car items) target) (find-subset (cdr items) target chosen) (or (find-subset (cdr items) (- target (car items)) (cons (car items) chosen)) (find-subset (cdr items) target chosen))))))
scheme@(guile-user)> (define (which-sum items target) (find-subset items target '()))
scheme@(guile-user)> (which-sum (list 3 7 5 2) 0)
$1 = ()
scheme@(guile-user)> (which-sum (list 3 7 5 2) 10)
$2 = (7 3)
```

Verified this session — a target of `0` returns the empty subset directly; `10` returns `(7 3)`.

### Mechanical Walkthrough

- **`(if (= target 0) chosen ...)`** — the base case, now returning `chosen` — whatever has actually been accumulated on this path — rather than the bare `#t` `can-sum-to?` returned for the identical condition.
- **`(if (null? items) #f ...)`** — the second base case, unchanged from `can-sum-to?`: no items left and the target isn't `0` means failure, reported the same way as before.
- **`(cons (car items) chosen)`** — the one genuinely new piece: the "include" branch adds the current item to the accumulator before recursing, exactly Concept Unit 2's "forward" half.
- **The "exclude" branch, `(find-subset (cdr items) target chosen)`, using the original, unmodified `chosen`** — the "backtrack" half, requiring no special undo syntax at all, simply by virtue of not passing the `cons`-extended version.

### CS Lens

This is `can-sum-to?`'s exact search, carrying one additional piece of accumulated state — confirming that adding backtracking to an existing search doesn't require rebuilding it from scratch, only extending its existing structure with a partial-solution accumulator threaded alongside its existing arguments. Also recognized in: adding a "show your work" requirement to an already-correct exam-grading process, without needing to redesign the grading logic itself; adding an audit trail to an already-correct financial approval process, without needing to redesign the approval logic; adding a "why" explanation to an already-correct diagnostic system, without needing to redesign the diagnosis logic.

### SE Lens

The alternative to extending `can-sum-to?` directly is to write `which-sum` as an entirely separate procedure, reasoned about from scratch. The real cost of that alternative is exactly the duplicated-effort risk this curriculum has repeatedly warned against — re-deriving a base case and recursive case already correctly established, when the only genuinely new work is adding one accumulator. Extending `can-sum-to?`'s exact structure, as this unit does, costs the small, precise change of adding `chosen` and using it in the base case and the "include" branch; it inherits everything about `can-sum-to?`'s correctness that was already established, changing only what needed to change.

---

## Concept Unit 4: Verifying the Backtracking Search Against can-sum-to?

### The Problem

`which-sum`'s output needs checking against something independent of `which-sum` itself, exactly the discipline this curriculum has insisted on since Lesson 22 — not merely trusting a plausible-looking returned list.

### No isolated lab for this step

This concept has no code of its own to isolate — the independent cross-check is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Two Independent Checks

**The first check: does the returned subset actually sum to the target?**

```
$ guile -q
scheme@(guile-user)> (define (my-sum lst) (if (null? lst) 0 (+ (car lst) (my-sum (cdr lst)))))
scheme@(guile-user)> (define result (which-sum (list 3 7 5 2) 9))
scheme@(guile-user)> result
$1 = (2 7)
scheme@(guile-user)> (= (my-sum result) 9)
$2 = #t
```

Verified this session — `sum-list`'s own logic (Lesson 33), applied directly to `which-sum`'s returned list, confirms it genuinely sums to `9`.

**The second check: does `which-sum` finding a result agree with `can-sum-to?`'s independent yes/no answer?**

```
scheme@(guile-user)> (define (can-sum-to? items target) (if (= target 0) #t (if (null? items) #f (if (> (car items) target) (can-sum-to? (cdr items) target) (or (can-sum-to? (cdr items) (- target (car items))) (can-sum-to? (cdr items) target))))))
scheme@(guile-user)> (eq? (can-sum-to? (list 3 7 5 2) 9) (if result #t #f))
$3 = #t
```

Verified this session — `can-sum-to?`, built and verified entirely independently in Lesson 49, agrees that `9` is reachable, exactly matching `which-sum`'s having found a real witness.

**Naming what these two checks together establish:** the first confirms `which-sum`'s answer is a *genuine* witness — its own numbers really do add up correctly, checked by a completely separate summing procedure. The second confirms `which-sum`'s success or failure is *consistent* with an independently built yes/no search, addressing the exact Lesson 22 concern that a single procedure's self-reported success proves nothing on its own.

### Walkthrough

- **`(= (my-sum result) 9)`** — a reappearance of *sum-list*'s own logic (Lesson 33), used here purely as an independent check, with no connection to `which-sum`'s own internals.
- **`(eq? (can-sum-to? ...) (if result #t #f))`** — a reappearance of `can-sum-to?` (Lesson 49), checked for agreement with `which-sum`, exactly the independent cross-check Lesson 42, Concept Unit 5, already modeled by checking `inorder` against `sort`.
- **The precise statement of what each check establishes** — not a new concept, but an honest, explicit account of what "verified" actually means here, in Lesson 22's own careful sense.

### CS Lens

This is the same independent-verification discipline this curriculum has applied repeatedly — checking `my-map` against `map` (Lesson 34), `inorder` against `sort` (Lesson 42) — now applied to a backtracking search's own returned witness, checked two separate ways rather than trusted on sight. Also recognized in: a court verifying both that submitted evidence is internally consistent and that it agrees with independent witness testimony; a scientific result verified both for internal consistency (the math checks out) and for agreement with an independent measurement; an accounting figure verified both for correct arithmetic and for agreement with an independently maintained ledger.

### SE Lens

The alternative to this two-part check is to trust `which-sum`'s output simply because it returned a real, printable list that looks like a subset of the original items. The real cost of that alternative is exactly the risk Lesson 29 already demonstrated for a present-but-wrong base case: a plausible-looking result is not the same as a verified one, and a subtle bug in `find-subset`'s accumulator logic could produce a list that looks right without actually summing correctly, or without being consistent with an independent existence check. Performing both checks explicitly, as this unit does, costs two small, independent verifications; it confirms `which-sum` is correct in the strong sense this curriculum has demanded of every result since Lesson 22, not merely correct-looking.

---

## Closing

### Connect the pieces

One search, extended to report its own witness, traced through every unit built in this lesson, start to finish:

1. **The missing information named (Unit 1):** `can-sum-to?` answers yes or no, discarding the specific choices that made the answer yes.
2. **Backtracking stated precisely (Unit 2):** an accumulator added on the way in, automatically left behind — not explicitly removed — when a sibling branch is tried, thanks to `cons`'s non-destructive nature.
3. **`which-sum`, derived directly from `can-sum-to?` (Unit 3):** the identical search structure, extended with one accumulator, correctly returning `(2 7)` for a target of `9`.
4. **The result independently verified, two ways (Unit 4):** its sum checked directly, and its success checked for consistency with `can-sum-to?`'s own, separately verified answer.

Unit 4's two checks apply directly to Unit 3's exact output — not a hypothetical verification, but the actual result `which-sum` produced, checked against two things that have nothing to do with `which-sum`'s own internal logic.

### What breaks without this

Suppose a real scheduling or allocation system needed not just to confirm that some valid combination of resources could satisfy a requirement, but to actually report which specific combination — and its author, having only ever built a yes/no search like Lesson 49's `can-sum-to?`, tried to bolt on witness-reporting carelessly, perhaps by having a global, mutable variable record "the last item considered" rather than a proper, backtracking-safe accumulator. Because such a mutable record isn't automatically undone the way `cons`-built lists are, a failed branch's tentative choice could easily leak into a sibling branch's own successful result, producing a reported combination that includes an item from a path that was actually abandoned — a subtly wrong answer that might not even sum correctly, exactly the kind of error Concept Unit 4's first check exists to catch. Restoring this lesson's discipline — using an accumulator that is naturally, automatically undone by simply not being passed forward, the way `cons`'s own non-destructive behavior provides for free — is what keeps a witness-reporting search correct without requiring careful, error-prone manual bookkeeping at every choice point.

### Exercises

1. **Observe.** Take your own `can-sum-to?`-style search from Lesson 49's exercises (or build a similar yes/no search) and identify exactly what specific choices its `#t` answer depends on, the way Concept Unit 1 identified the missing subset.
2. **Formalize.** Extend your Exercise 1 search into a witness-returning version, following Concept Unit 3's exact derivation: add an accumulator, change the base cases to return it (or a fixed failure value), and add the accumulator update to the "include" branch.
3. **Explain.** Run your Exercise 2 procedure on a case with a real solution and confirm the returned witness directly — check that it actually satisfies whatever property your original search was checking for.
4. **Explain.** Cross-check your Exercise 3 result against your original Exercise 1 yes/no search, the way Concept Unit 4 checked `which-sum` against `can-sum-to?`, confirming the two agree.
5. **Explain.** In your own words, explain why `cons`'s non-destructive behavior specifically is what makes backtracking automatic in your Exercise 2 procedure, rather than requiring an explicit "undo" step.

### Definition of done

- [ ] You can explain the difference between a search that answers yes/no and one that returns an actual witness, using your own example.
- [ ] You can extend a yes/no search into a witness-returning one by adding a single accumulator, following Concept Unit 3's exact pattern.
- [ ] You can explain, precisely, why `cons`'s non-destructive nature makes backtracking automatic, without needing an explicit undo step.
- [ ] You can verify a backtracking search's result two independent ways — checking the result directly, and checking consistency with a separately built yes/no search.
- [ ] You completed Exercises 1–5 using your own search, not `can-sum-to?` or `which-sum`.
- [ ] Commit your Exercise 2 witness-returning procedure and your Exercise 3–4 verification, with a commit message stating what specific witness your Exercise 3 test case returned, and how you confirmed it was genuinely correct.
