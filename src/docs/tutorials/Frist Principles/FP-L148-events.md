# Lesson 148: Events

**What you will build:** an **event** — a real, precise subset of a sample space, collecting every atomic outcome that shares some real property — and real, direct evidence of what goes wrong when two events are combined without checking whether they overlap. Real, verified evidence this session: over the real, `36`-outcome two-dice sample space from Lesson 147, the event "doubles" contains exactly `6` real atomic outcomes and the event "even sum" contains exactly `18` — and real, exhaustive checking shows every single one of those `6` real doubles is *already* inside the `18` real even-sum outcomes, a real, complete overlap, not a partial one. Naively adding the two real probabilities, `P(\text{doubles}) + P(\text{even sum})`, gives `0.667`; the real, true probability of "doubles or even sum" is `0.5` — the identical number as "even sum" alone, since doubles adds nothing new. A real, general formula, `|A \cup B| = |A| + |B| - |A \cap B|`, checked directly against this exact real case, confirms it exactly: `6 + 18 - 6 = 18`, matching the real union's own measured size precisely. The transferable point: an event is a real, checkable set, not a private number attached to a vague description, and combining two events by simply adding their probabilities is only ever safe once their real overlap has actually been measured, not assumed away.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 147's own real, complete two-dice sample space — explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **Sample space (Ω)** — the real, complete set of every possible outcome of a real random process.
- **Atomic outcome** — a single, specific real outcome at the finest real level of detail a sample space is built from.
- **Event** — a real, precise subset of a sample space: a real collection of atomic outcomes sharing some real, checkable property. It exists to give "the dice show doubles" or "the sum is even" a real, exact meaning — not a vague description, but a specific, countable real set that either contains a given atomic outcome or does not.
- **Union (of events)** — the real event containing every atomic outcome that belongs to *either* of two given events (or both). It exists to give "A or B" a precise real meaning.
- **Intersection (of events)** — the real event containing every atomic outcome that belongs to *both* of two given events at once. It exists to give "A and B" a precise real meaning, and to name, precisely, the real overlap two events might share.
- **Complement (of an event)** — the real event containing every atomic outcome in the sample space that does *not* belong to a given event. It exists to give "not A" a precise real meaning.
- **Disjoint events** — two real events sharing no atomic outcomes at all — a real intersection of size `0`. It exists to name the one real condition under which simply adding two probabilities together is actually safe.

**Objects and methods used**

- **`event-union`** / **`event-intersection`** / **`event-complement`**
  - *What it is:* this lesson's own real procedures implementing the three real set operations events are combined by.
  - *Implementation:* given full real treatment in Concept Unit 3 below.
  - *Its use:* every real combination of events this lesson checks, from Concept Unit 3 onward.
- **`filter`** / **`member`** / **`length`** / **`append`**
  - *What it is:* real Scheme procedures, reused unchanged from earlier lessons — `filter` keeps only list elements satisfying a real predicate; `member` checks whether a value occurs in a list; `length` counts a list's own real elements; `append` joins two real lists.
  - *Implementation:* each takes a real predicate or value and a real list (`filter`/`member`), or a single real list (`length`), or two or more real lists (`append`); each returns a new real value or list accordingly.
  - *Its use:* every real event this lesson builds and every real set operation this lesson performs on one.
- **`even?`**
  - *What it is:* a real Scheme procedure, reused unchanged since Lesson 116, true exactly for integers divisible by `2`.
  - *Implementation:* takes one real integer, returns a real boolean.
  - *Its use:* this lesson's own `event-even-sum?` predicate.

---

## Concept Unit 1: One Question at a Time Isn't Enough

### The Problem

Lesson 147's own real code answered "what's the real probability of sum `7`" by counting how many of the `36` real atomic outcomes had that one specific real sum. A real, more general question — "what's the real probability the dice show doubles, *or* the sum is even" — can't be answered the identical way, one fixed value at a time: it needs combining potentially many real atomic outcomes, sharing two genuinely different real properties, into one real, countable collection.

### No isolated lab for this step

This unit introduces no new construct — Lesson 147's own real sample space, `two-dice-outcomes`, given full treatment in this lesson's own Header, is restated here as the real foundation Concept Unit 2 builds real events on top of.

### Reference Source

`two-dice-outcomes` — no reference counterpart to quote verbatim this session, since it is this same lesson's own file, built fresh below using Lesson 147's own already-established real construction.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What "Doubles or Even Sum" Actually Requires

Answering this real question requires three real, separate pieces: a real, checkable definition of "doubles," a real, checkable definition of "even sum," and a real, precise way to combine the two — none of which Lesson 147's own real, single-value counting (`count-with-sum`) was built to do.

### Walkthrough

- **The direct citation of Lesson 147's own `count-with-sum`** — grounds this unit's own real gap in already-established, real code, not an abstract complaint.
- **The three real, separately-named pieces the new question requires** — previews Concept Unit 2 and 3's own real structure before any code is written.

### CS Lens

This is Lesson 147's own atomic-versus-derived distinction, extended: a derived outcome, there, was one real property (a specific sum) shared by several real atomic outcomes; an event, here, is the real, general case — any real, checkable property at all, potentially shared by any real number of atomic outcomes, combinable with other such real properties.

### SE Lens

The alternative to a real, general event abstraction is writing one-off real counting code for every new real question — a fresh `count-with-doubles`, a fresh `count-with-even-sum-or-doubles`, each duplicating the identical real filtering logic. The real cost of that alternative: every new real combination of properties would need its own hand-written real procedure, rather than reusing three real, general operations across any real events at all.

---

## Concept Unit 2: Defining Real Events as Real Subsets

### The Problem

Concept Unit 1 named the real gap. It needs a real, precise definition: an event is not a vague description, it's a real, countable subset of the sample space, built by keeping only the atomic outcomes a real predicate accepts.

### Reference Source

No reference counterpart — a from-scratch real definition of two specific events over Lesson 147's own real sample space.

### Files affected

Created: `events-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (event-doubles? p) (= (car p) (cdr p)))
(define (event-even-sum? p) (even? (+ (car p) (cdr p))))
```

### The Updated Project

This is `events-check.scm`, in full — Lesson 147's own real `two-dice-outcomes`, quoted unchanged, with this lesson's own real event predicates added on top:

```scheme
(define die-faces (list 1 2 3 4 5 6))
(define two-dice-outcomes
  (apply append (map (lambda (d1) (map (lambda (d2) (cons d1 d2)) die-faces)) die-faces)))

(define (event-doubles? p) (= (car p) (cdr p)))                     ; ← new
(define (event-even-sum? p) (even? (+ (car p) (cdr p))))               ; ← new

(define event-doubles (filter event-doubles? two-dice-outcomes))    ; ← new
(define event-even-sum (filter event-even-sum? two-dice-outcomes))     ; ← new

(display "=== CU2: two real events, defined as real subsets ===") (newline) ; ← new
(display "event doubles, real outcomes: ") (display event-doubles) (newline)   ; ← new
(display "real |doubles|: ") (display (length event-doubles)) (newline)           ; ← new
(display "real |even-sum|: ") (display (length event-even-sum)) (newline)            ; ← new
(display "real P(doubles): ") (display (exact->inexact (/ (length event-doubles) 36))) (newline) ; ← new
(display "real P(even-sum): ") (display (exact->inexact (/ (length event-even-sum) 36))) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (event-doubles? p) (= (car p) (cdr p)))`** — first appearance in this lesson of this real predicate; a real atomic outcome `p`, a `(d1 . d2)` pair, satisfies it exactly when its two real values are equal.
- **`(define (event-even-sum? p) (even? (+ (car p) (cdr p))))`** — first appearance in this lesson of this real predicate; adds the pair's own two real values and checks the real result with `even?`, given full real treatment in this lesson's own Header.
- **`(filter event-doubles? two-dice-outcomes)`** — first appearance in this lesson of building an event this way: `filter`, applied to Lesson 147's own real sample space, keeps exactly the real atomic outcomes the predicate accepts — the real, precise, checkable subset this unit's own Terms section defines an event to be.
- **The real, exact `((1 . 1) (2 . 2) (3 . 3) (4 . 4) (5 . 5) (6 . 6))`, and the real, exact counts `6` and `18`** — direct, checked confirmation: doubles is a real, six-outcome event; even sum is a real, eighteen-outcome event — exactly half of the real, `36`-outcome sample space.
- **The real, exact probabilities, `0.1667` and `0.5`** — each computed the identical real way Lesson 147 established: a real event's own probability is its own real size, divided by the real size of the whole sample space.

### CS Lens

This is Lesson 91's own real Set ADT, recognized in a genuinely new domain: an event, formally, *is* a real set — a real collection with no meaningful order and no meaningful duplicates, checkable for membership — applied here not to a general-purpose data structure but to a real, specific collection of probability outcomes.

### SE Lens

The alternative to representing an event as a real, filtered list is representing it only as a bare real number, `6` or `18`, with no real record of *which* atomic outcomes actually produced that count. The real cost of that alternative, made concrete in Concept Unit 3: combining two events by their own bare counts alone gives no real way to detect overlap — exactly the real gap Concept Unit 4's own evidence depends on being able to check.

### Run It — Show the Real Output

```
$ guile events-check.scm
=== CU2: two real events, defined as real subsets ===
event doubles, real outcomes: ((1 . 1) (2 . 2) (3 . 3) (4 . 4) (5 . 5) (6 . 6))
real |doubles|: 6
real |even-sum|: 18
real P(doubles): 0.16666666666666666
real P(even-sum): 0.5
```

Verified this session — `event-doubles` and `event-even-sum`, each a real, checkable subset of Lesson 147's own `36`-outcome sample space, contain exactly `6` and `18` real atomic outcomes respectively.

---

## Concept Unit 3: Combining Real Events

### The Problem

Concept Unit 2 built two separate real events. Answering "doubles or even sum," Concept Unit 1's own original real question, needs a real, precise way to combine them — and, for later use, a real way to ask "doubles and even sum" and "not doubles" as well.

### Reference Source

No reference counterpart — a from-scratch real implementation of the three real set operations named in this lesson's own Header.

### Files affected

Modified: `events-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (event-union a b) (apply append (list a (filter (lambda (x) (not (member x a))) b))))
(define (event-intersection a b) (filter (lambda (x) (member x b)) a))
(define (event-complement a all) (filter (lambda (x) (not (member x a))) all))
```

### The Updated Project

This is `events-check.scm`, with Concept Unit 2's own file extended by this unit's own three real set operations:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define (event-union a b) (apply append (list a (filter (lambda (x) (not (member x a))) b)))) ; ← new
(define (event-intersection a b) (filter (lambda (x) (member x b)) a))                           ; ← new
(define (event-complement a all) (filter (lambda (x) (not (member x a))) all))                      ; ← new

(define union-de (event-union event-doubles event-even-sum))        ; ← new
(define inter-de (event-intersection event-doubles event-even-sum))    ; ← new
(define not-doubles (event-complement event-doubles two-dice-outcomes))   ; ← new

(display "=== CU3: real, combined events ===") (newline)             ; ← new
(display "real |doubles UNION even-sum|: ") (display (length union-de)) (newline) ; ← new
(display "real |doubles INTERSECT even-sum|: ") (display (length inter-de)) (newline) ; ← new
(display "real |NOT doubles|: ") (display (length not-doubles)) (newline)               ; ← new
```

### Mechanical Walkthrough

- **`(define (event-union a b) (apply append (list a (filter (lambda (x) (not (member x a))) b))))`** — first appearance in this lesson of this procedure; keeps all of `a`, then filters `b` down to only the real elements *not already in* `a` (`(not (member x a))`), and joins the two real results via `append` — every real atomic outcome in either event, none counted twice.
- **`(define (event-intersection a b) (filter (lambda (x) (member x b)) a))`** — first appearance in this lesson of this procedure; keeps only the real elements of `a` that are *also* real members of `b` — the real, shared overlap.
- **`(define (event-complement a all) (filter (lambda (x) (not (member x a))) all))`** — first appearance in this lesson of this procedure; keeps only the real elements of the whole sample space, `all`, that are *not* in `a`.
- **The real, exact `18` for the union, `6` for the intersection, and `30` for the complement** — direct, checked confirmation: `doubles UNION even-sum` has the identical real size as `even-sum` alone (`18`), a first real signal that something is fully contained inside something else; `doubles INTERSECT even-sum` equals `6`, the identical real size as `doubles` itself — direct, measured confirmation that *every* real double is also an even-sum outcome, not merely some of them; `NOT doubles`, `30`, correctly equals `36 − 6`.

### CS Lens

This is Lesson 17's own real relation vocabulary, recognized in a new setting: exactly as a relation was defined as a real set of pairs, checkable for membership, this unit's own three operations are the identical real set algebra — union, intersection, complement — applied to events instead of relations.

### SE Lens

The alternative to implementing `event-union`/`event-intersection`/`event-complement` as real, general procedures is hand-checking overlap for every specific pair of events encountered, the way a reader might reason informally about "doubles and even sum" without ever writing code. The real value of the general procedures: Concept Unit 4's own real, surprising finding — full overlap, not partial — was discovered by *running* `event-intersection`, not by trusting an informal guess that might easily have missed it.

### Run It — Show the Real Output

```
$ guile events-check.scm
=== CU3: real, combined events ===
real |doubles UNION even-sum|: 18
real |doubles INTERSECT even-sum|: 6
real |NOT doubles|: 30
```

Verified this session — the real union of doubles and even-sum has exactly `18` real outcomes, identical to even-sum's own size alone; the real intersection has exactly `6`, identical to doubles' own full size — real, measured evidence, not yet interpreted, that Concept Unit 4 makes explicit.

---

## Concept Unit 4: The Real, Honest Pitfall — Adding Probabilities That Overlap

### The Problem

Concept Unit 3's own real numbers contain a real surprise, not yet named: naively computing `P(\text{doubles}) + P(\text{even sum})` and naively computing the real, true `P(\text{doubles or even sum})` give two genuinely different real answers, and it's worth stating precisely why, and checking the real, general fix.

### Reference Source

No reference counterpart — a real, direct application of Concept Unit 2 and 3's own already-computed real values.

### Files affected

Modified: `events-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define naive-sum (+ (/ (length event-doubles) 36) (/ (length event-even-sum) 36)))
(define true-union-prob (/ (length union-de) 36))
```

### The Updated Project

This is `events-check.scm`, with Concept Unit 3's own file extended by a real, direct comparison, and a real check of the general inclusion-exclusion formula:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(define naive-sum (+ (/ (length event-doubles) 36) (/ (length event-even-sum) 36))) ; ← new
(define true-union-prob (/ (length union-de) 36))                                      ; ← new

(display "=== CU4: the real, honest pitfall ===") (newline)          ; ← new
(display "naive P(doubles)+P(even-sum): ") (display (exact->inexact naive-sum)) (newline) ; ← new
(display "real, true P(doubles OR even-sum): ") (display (exact->inexact true-union-prob)) (newline) ; ← new
(display "real inclusion-exclusion check, |A|+|B|-|A∩B|: ")                                  ; ← new
(display (- (+ (length event-doubles) (length event-even-sum)) (length inter-de)))              ; ← new
(display " matches real |A∪B|: ") (display (length union-de)) (newline)                            ; ← new
```

### Mechanical Walkthrough

- **`(define naive-sum (+ (/ (length event-doubles) 36) (/ (length event-even-sum) 36)))`** — the real, tempting-but-wrong computation: simply adding the two real, separately-computed probabilities.
- **`(define true-union-prob (/ (length union-de) 36))`** — the real, correct computation: the real *union's own* size, divided by the real sample space size — not the sum of the two original real sizes.
- **`(- (+ (length event-doubles) (length event-even-sum)) (length inter-de))`** — the real, general inclusion-exclusion formula, `|A| + |B| - |A \cap B|`, computed directly from Concept Unit 2 and 3's own already-established real counts.
- **The real, exact `0.667` naive sum, against the real, exact `0.5` true union probability** — direct, measured confirmation: naively adding the two real probabilities overstates the real truth by a real, exact `0.167` — precisely `P(\text{doubles} \cap \text{even sum})`, the real overlap counted twice by naive addition.
- **The real, exact match, `6 + 18 - 6 = 18`, against the real, independently-measured union size, `18`** — direct, checked confirmation that the real, general formula, applied to this lesson's own real numbers, produces exactly the real value Concept Unit 3's own direct union computation already found — not a coincidence, a real, provable identity.

### CS Lens

This is Lesson 148's own opening example, now fully explained: doubles is a real *subset* of even sum (every double's own two equal real values sum to an even number, always), so their real union adds nothing beyond even sum's own real size, and their real intersection equals doubles' own entire real size — the inclusion-exclusion formula, checked here, correctly reduces to exactly that real special case, `|A \cap B| = |A|`, without needing to be told about the real subset relationship in advance.

### SE Lens

The alternative to checking real overlap before adding two probabilities is assuming events are disjoint (given full real treatment in this lesson's own Header) unless there's an obvious real reason to think otherwise. The real cost of that alternative, made concrete by this unit's own real numbers: "doubles" and "even sum" have no real, obvious reason to overlap from their own descriptions alone — nothing about the *names* "doubles" and "even sum" announces that one fully contains the other — and a real system computing risk, payout odds, or any real probability by naive addition would be silently, systematically wrong by exactly the real size of the unexamined overlap.

### Run It — Show the Real Output

```
$ guile events-check.scm
=== CU4: the real, honest pitfall ===
naive P(doubles)+P(even-sum): 0.6666666666666666
real, true P(doubles OR even-sum): 0.5
real inclusion-exclusion check, |A|+|B|-|A∩B|: 18 matches real |A∪B|: 18
```

Verified this session — naively adding two real probabilities overstates the real truth by exactly the real size of their overlap; the real, general inclusion-exclusion formula, checked directly against this lesson's own real numbers, matches the real, independently-computed union exactly.

---

## Closing

### Connect the pieces

Two real events, one real, combined structure, one real, honest correction:

1. **The real gap, named (Unit 1):** a single derived value at a time isn't enough for real, combined questions.
2. **Real events, defined as real subsets (Unit 2):** doubles, `6` real outcomes; even sum, `18` real outcomes.
3. **Real events, combined (Unit 3):** union `18`, intersection `6`, complement `30` — real numbers revealing a real, unstated relationship.
4. **The real, honest pitfall, resolved (Unit 4):** naive addition overstates by exactly the real overlap; the real, general formula, checked, gets it exactly right.

Every claim in this lesson traces to real, executed code: two real, exhaustively-built events, three real, general set operations applied to them, and a real, direct numeric confirmation of why naive probability addition fails and what fixes it.

### What breaks without this

Suppose a real insurance-style system computed the real probability of "claim type A or claim type B" by simply adding each type's own separately-measured real probability, the way Concept Unit 4's own naive computation did. This lesson's own real evidence shows precisely what that shortcut risks: if claim type A turns out to be a real subset of claim type B — exactly as real "doubles" turned out to be a subset of real "even sum" — the naive sum would overstate the real combined risk by the entire real size of type A, a real, silent, systematic error with no warning anywhere in the naive computation itself.

### Exercises

1. **Observe.** Before checking, predict whether `event-intersection`, called with the arguments reversed (`(event-intersection event-even-sum event-doubles)` instead of `(event-intersection event-doubles event-even-sum)`), would produce a real, different result, using this lesson's own real definition of intersection to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Define a real, third event, "sum is at least `10`," and use `event-intersection` to find its real overlap with `event-doubles` — confirm, with real code, that the real overlap this time is only *partial* (some but not all doubles), unlike this lesson's own even-sum example.
4. **Explain.** In your own words, explain why `event-union`'s own real implementation needed to filter `b` down to elements not already in `a`, rather than simply appending `a` and `b` directly, referencing what would go wrong with `length`'s own real count if it didn't.
5. **Explain.** Using this lesson's own real Concept Unit 4 numbers, explain why the general inclusion-exclusion formula, `|A| + |B| - |A \cap B|`, reduces correctly to `|B|` alone in a case where `A` is entirely contained inside `B`, referencing what `|A \cap B|` equals in that specific real case.

### Definition of done

- [ ] You can state, precisely, what an event is, in terms of a sample space and a real, checkable predicate.
- [ ] You can point to this lesson's own real `6`/`18`/`18`/`6` numbers and explain what each one reveals about the real relationship between doubles and even sum.
- [ ] You can state the real inclusion-exclusion formula and explain why naive addition is only ever safe for real, disjoint events.
- [ ] You completed Exercises 1–5, including a real, checked partial-overlap example of your own.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
