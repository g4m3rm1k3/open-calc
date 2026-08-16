# Lesson 110: Representation Invariants

**What you will build:** two explicitly named, separately-checked things this Era has been building all along without naming: a **representation invariant** (a `rep-ok?` check confirming the concrete data is even well-formed) and an **abstraction function** (a check confirming that well-formed data actually represents the *correct* abstract value). Real, verified evidence this session: a heap array corrupted directly, bypassing every real operation, is correctly caught — `heap-rep-ok?` returns `#f`. A *different*, more dangerous kind of bug — an `extract-min` that only shrinks the count without touching the root at all — produces an array `heap-rep-ok?` calls perfectly valid, `#t`, because removing a leaf can never break heap-order. But its abstraction — the actual represented set, `(1 2 3 5 9)` — still contains `1`, the true minimum, untouched, while silently dropping `8` instead. The transferable point: this Era's `heap-valid?`, `rb-valid?`, and every other `*-valid?` checker already built were always representation-invariant checks. This lesson shows, with a real, caught bug, exactly what they were never enough to catch alone.

**What you need to know first:** Lesson 104 (`FP-L104-heaps.md`) — specifically `heap-valid?`, `heap-insert`, and the whole heap array representation, reused directly as this lesson's own running example. Lesson 84 (`FP-L084-abstract-data-types.md`) — specifically the ADT contract format, the abstract behavior this lesson's abstraction function connects real data back to.

**Terms introduced in this lesson**

- **Representation invariant (RI)** — a condition the concrete data must always satisfy to be considered well-formed at all, independent of what abstract value it's supposed to represent. It exists to name, precisely, what every `*-valid?` checker this Era has already built — `heap-valid?`, `rb-valid?`, and others — actually checks.
- **Abstraction function (AF)** — a function mapping any well-formed concrete representation to the specific abstract value it represents. It exists because "the data is well-formed" and "the data represents the *right* thing" are two separate claims, and this lesson shows a real case where the first holds while the second silently fails.

**Objects and methods used**

- **`sort`**
  - *What it is:* a real Guile procedure sorting a list according to a given comparison procedure.
  - *Implementation:* takes a list and a `<`-shaped predicate, returns a newly ordered list; reappearing from Lesson 79, used as `(sort elements <)`.
  - *Its use:* this lesson's own abstraction function for the heap — converting an unordered array into the one, canonical sorted form used to compare represented sets for equality.

---

## Concept Unit 1: A Pattern Repeated Six Times, Never Named

### The Problem

Lesson 104's `heap-valid?`, Lesson 103's `rb-valid?`, and every other `*-valid?`-shaped checker this Era has built all do the identical *kind* of thing: walk the concrete data and confirm some structural condition holds. None of them were ever asked, directly, what happens when that condition holds *and the operation is still wrong* — whether structural validity alone is even enough to trust a result.

### No isolated lab for this step

This concept has no code of its own to isolate — the pattern is posed directly here, drawing on checkers already built across this Era.

### Reference Source

No reference counterpart — the motivating pattern draws on Lesson 103 and 104's own already-built checkers, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Two Questions Hiding Inside One Checker

Every `*-valid?` call this Era has made actually answers a narrower question than it might seem to: "is this data shaped correctly?" — never "does this data hold the value it's supposed to hold, after whatever operation just ran?" Those are genuinely different questions, and only the first one has ever been checked directly, by name, so far.

### Walkthrough

- **The direct citation of `heap-valid?` and `rb-valid?` by name** — grounds the distinction in checkers already built and trusted, not a new, abstract example.
- **"shaped correctly" versus "holds the right value"** — previews Concept Unit 2's own precise split.

### CS Lens

This is Lesson 2's "turning ambiguity into precision" applied to this curriculum's own verification habits: a checking pattern used successfully, repeatedly, without ever being asked what, precisely, it does and doesn't guarantee. Also recognized in: a building inspector confirming a structure meets code (sound, won't collapse) without that inspection saying anything about whether the building is actually the *house* the blueprint called for — two separate questions, easy to conflate under one word, "passed inspection."

### SE Lens

The alternative to separating these two questions is to keep trusting a single `*-valid?`-shaped check as if it covers everything worth checking about an operation's correctness. The real risk of that alternative is exactly what Concept Unit 4 demonstrates with a real, caught bug: a structurally perfect result that is nonetheless the wrong answer, passing every check this Era has used so far without exception.

---

## Concept Unit 2: Defining Representation Invariant and Abstraction Function

### The Problem

Concept Unit 1 named the split. It needs two precise definitions — one for each question — plus a decision about how to state the second one concretely enough to actually check in code.

### No isolated lab for this step

This concept has no code of its own to isolate — the definitions are stated directly below, and Concept Unit 3 implements and checks them as real code.

### Reference Source

No reference counterpart — a from-scratch derivation naming a pattern already present in earlier lessons' code.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Naming Both Halves Precisely

**Representation invariant (RI):** a condition on the concrete data alone — no reference to what it's "supposed" to represent — that must hold for the data to count as well-formed at all. Lesson 104's `heap-valid?` *is* a representation invariant, stated as running code: every parent no larger than its children, nothing more.

**Abstraction function (AF):** a function from any RI-satisfying concrete representation to the specific abstract value it represents. For Lesson 104's heap, a natural abstraction function is: *the sorted list of every element currently stored* — since a heap's whole abstract purpose is to represent a collection supporting repeated minimum-extraction, and two heaps holding the identical multiset of values, however differently arranged internally, represent the identical abstract collection.

**Why both are needed, together, to trust an operation:** a correct operation must do two things at once — preserve the RI (the *result* is still well-formed), and change the AF in exactly the way the abstract operation promises (inserting `x` really does add `x` to the represented collection; extracting the minimum really does remove the smallest element, and nothing else). Checking only the first, as every `*-valid?` checker built so far has done, can miss a real bug in the second.

### Walkthrough

- **RI defined with no mention of "correctness" or "the right value"** — deliberately narrower than it might first sound, matching exactly what `heap-valid?`'s own code checks.
- **AF defined as a function to *some* abstract value, not necessarily a unique representation of it** — many different heap arrays can share the identical abstraction (sorted contents), exactly the many-to-one relationship a representation invariant alone can't express.
- **"a correct operation must do two things at once"** — previews Concept Unit 4's own real, two-part check.

### CS Lens

This is the formal version of a distinction this curriculum has drawn before in a different shape: Lesson 84's own separation of *behavior* (a contract) from *representation* (an implementation) — a representation invariant and abstraction function are exactly the precise, checkable machinery that connects those two things for one specific implementation, rather than leaving the connection implicit. Also recognized in: a translator's two separate duties — confirming a sentence is grammatically well-formed in the target language, and confirming it actually means the same thing as the original — a sentence can satisfy the first without ever satisfying the second.

### SE Lens

The alternative to naming both pieces explicitly is to write one checker, call it "validation," and trust that passing it means the operation was correct — exactly the habit Concept Unit 1 described this Era as having used successfully, so far, by relying on separately-designed test cases to catch AF-level bugs informally rather than checking the abstraction directly. The real cost of that alternative is precisely what Concept Unit 4 measures: a bug that happens to preserve the RI can slip through an RI-only check completely undetected.

---

## Concept Unit 3: Writing Both Checks as Real Code

### The Problem

Concept Unit 2 defined both pieces. Lesson 104 already has a representation invariant, `heap-valid?`, under a different name. It needs an actual abstraction function, written as real code, and both checked together against a real heap.

### The New Code — Type It Yourself

```scheme
(define (heap-abstraction darr)
  (sort (let loop ((i 0) (acc '()))
          (if (= i (cadr darr)) acc (loop (+ i 1) (cons (vector-ref (car darr) i) acc))))
        <))
```

### Reference Source

Lesson 104's `heap-valid?` (`FP-L104-heaps.md`, Concept Unit 3), reused here unchanged under the name `heap-rep-ok?` — the identical code, renamed to match this lesson's own precise vocabulary.

### Files affected

Created: `repinvariant-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `repinvariant-check.scm`, in full — reusing Lesson 104's heap code unchanged, `heap-valid?` renamed to `heap-rep-ok?`, with this unit's new abstraction function added:

```scheme
(define (heap-parent i) (quotient (- i 1) 2))
(define (make-doubling-dynarray) (list (make-vector 1) 0))
(define (doubling-append darr x)
  (let* ((vec (car darr)) (count (cadr darr)) (cap (vector-length vec)))
    (if (< count cap)
        (begin (vector-set! vec count x) (list vec (+ count 1)))
        (let ((new-vec (make-vector (* cap 2))))
          (let loop ((i 0)) (if (< i cap) (begin (vector-set! new-vec i (vector-ref vec i)) (loop (+ i 1)))))
          (vector-set! new-vec count x)
          (list new-vec (+ count 1))))))
(define (heap-swap! vec i j)
  (let ((tmp (vector-ref vec i))) (vector-set! vec i (vector-ref vec j)) (vector-set! vec j tmp)))
(define (sift-up! vec i)
  (if (> i 0)
      (let ((p (heap-parent i)))
        (if (< (vector-ref vec i) (vector-ref vec p)) (begin (heap-swap! vec i p) (sift-up! vec p))))))
(define (heap-insert darr x)
  (let* ((darr2 (doubling-append darr x)) (vec (car darr2)) (count (cadr darr2)))
    (sift-up! vec (- count 1)) darr2))

(define (heap-rep-ok? darr)                                        ; ← new (renamed from heap-valid?)
  (let ((vec (car darr)) (count (cadr darr)))
    (let loop ((i 1))
      (cond ((>= i count) #t)
            ((> (vector-ref vec (heap-parent i)) (vector-ref vec i)) #f)
            (else (loop (+ i 1)))))))

(define (heap-abstraction darr)                                    ; ← new
  (sort (let loop ((i 0) (acc '()))                                    ; ← new
          (if (= i (cadr darr)) acc (loop (+ i 1) (cons (vector-ref (car darr) i) acc)))) ; ← new
        <))                                                               ; ← new

(define h (let loop ((vs '(5 3 8 1 9 2)) (d (make-doubling-dynarray)))
            (if (null? vs) d (loop (cdr vs) (heap-insert d (car vs))))))
(display "real heap rep-ok? ") (display (heap-rep-ok? h)) (newline)
(display "real heap abstraction (represented multiset): ") (display (heap-abstraction h)) (newline)
```

`heap-rep-ok?` is exactly Lesson 104's `heap-valid?`, unchanged, under this lesson's own precise name. `heap-abstraction` walks the array's live portion (indices `0` through `count − 1`) into a plain list, then sorts it — the array's own internal arrangement, whatever it happens to be, collapses into one canonical form, so two differently-arranged-but-equal-content heaps produce the identical abstraction.

### Mechanical Walkthrough

- **`(let loop ((i 0) (acc '())) (if (= i (cadr darr)) acc (loop (+ i 1) (cons (vector-ref (car darr) i) acc))))`** — a reappearance of named-let recursion, `vector-ref`, `cons`; collects every live element into a plain list, ignoring the array's own internal, heap-ordered arrangement entirely.
- **`(sort ... <)`** — a reappearance of `sort`; the specific choice that makes this function an *abstraction* function rather than just a data dump — two heaps holding the same values in different internal arrangements now produce identical output.
- **The real, exact match: `heap-rep-ok?` returns `#t`, and `heap-abstraction` returns `(1 2 3 5 8 9)`, the correctly sorted form of every inserted value** — direct, checked confirmation that a correctly-built heap satisfies both the representation invariant and represents the intended abstract set.

### CS Lens

This is Lesson 91's own `Set`/`Map`-versus-representation distinction, made fully precise: `heap-abstraction`'s output — a plain sorted list — is, in effect, the *set* this heap represents, computed directly from the array Lesson 104 chose specifically for its own performance properties, not for how naturally it reveals that set.

### SE Lens

The alternative to writing an explicit abstraction function is to trust that "the heap looks right" from its own array contents directly, without ever converting to a comparable, canonical form. The real cost of that alternative is exactly what Concept Unit 4 demonstrates: without a real abstraction function to compare against, a bug that still produces a plausible-looking array has nothing concrete to be checked against.

---

## Concept Unit 4: A Real Bug the Representation Invariant Alone Cannot Catch

### The Problem

Concept Unit 3 confirmed a correct heap satisfies both checks. It's worth deliberately building an incorrect operation and checking both separately — to see, directly, whether a representation invariant alone is actually sufficient to catch a real, meaningful bug.

### The New Code — Type It Yourself

```scheme
(define (buggy-extract-min darr) (list (car darr) (- (cadr darr) 1)))
```

### Reference Source

No reference counterpart — a deliberately incorrect procedure, built specifically to demonstrate this unit's own claim, contrasted against Lesson 104's real, correct `heap-extract-min`.

### Files affected

Modified: `repinvariant-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `repinvariant-check.scm`, with Concept Unit 3's own file extended by two real checks:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define corrupted (list (vector 9 1 8 3 5 2) 6))                   ; ← new
(display "corrupted array rep-ok? ") (display (heap-rep-ok? corrupted)) (newline) ; ← new

(define (buggy-extract-min darr) (list (car darr) (- (cadr darr) 1))) ; ← new
(define after-buggy (buggy-extract-min h))                            ; ← new
(display "after buggy-extract-min, rep-ok? ") (display (heap-rep-ok? after-buggy)) (newline) ; ← new
(display "after buggy-extract-min, abstraction: ") (display (heap-abstraction after-buggy)) (newline) ; ← new
```

`corrupted` is a hand-built array that violates heap-order directly (`9` sits at the root, above its own children `1` and `8`), bypassing every real operation this curriculum has built — a raw representation-invariant violation. `buggy-extract-min` is a *plausible-looking* mistake: it shrinks the count, exactly as a real extraction should, but never moves the last element to the root and never calls `sift-down!` — the two steps Lesson 104's real `heap-extract-min` depends on entirely.

### Mechanical Walkthrough

- **`(vector 9 1 8 3 5 2)`** — first appearance of `vector` used as a direct literal constructor in this lesson (rather than `make-vector` plus fills); builds a fixed, hand-chosen array whose root, `9`, is larger than both of its children, a direct violation deliberately chosen to trigger `heap-rep-ok?`'s own failing branch.
- **`(list (car darr) (- (cadr darr) 1))`** in `buggy-extract-min` — first appearance of this specific omission: every real step Lesson 104's `heap-extract-min` performs on the array itself (moving the last element to the root, sifting down) is simply missing; only the count changes.
- **The real, exact `#f` for the corrupted array** — direct, checked confirmation that `heap-rep-ok?` does catch a raw, direct structural violation, exactly as Concept Unit 2 predicted.
- **The real, exact `#t` for `after-buggy`, immediately followed by a wrong abstraction** — the crux of this whole lesson: `heap-rep-ok?` genuinely cannot tell the buggy result apart from a correct one, because shrinking the count by one, without touching any element, can never break heap-order among the elements that remain — a leaf's removal cannot violate any parent-child relationship still present.

### CS Lens

This is Concept Unit 2's own claim, now checked rather than merely stated: a representation invariant and an abstraction function genuinely check *different* things, and this lesson's real bug is constructed to sit exactly in the gap between them — RI-preserving, AF-violating, a combination the RI check alone is structurally incapable of detecting, no matter how thoroughly it's written.

### SE Lens

The alternative to writing and checking an explicit abstraction function is relying entirely on representation-invariant checks like `heap-rep-ok?`/`heap-valid?`, the way every prior lesson in this Era has done. The real, demonstrated cost of that alternative: `buggy-extract-min` would pass every check this curriculum has built so far, silently, while genuinely corrupting what the heap represents — the real minimum, `1`, incorrectly remains in the collection, while `8`, which was never the minimum, is silently and incorrectly discarded instead.

### Run It — Show the Real Output

```
$ guile repinvariant-check.scm
real heap rep-ok? #t
real heap abstraction (represented multiset): (1 2 3 5 8 9)
corrupted array rep-ok? #f
after buggy-extract-min, rep-ok? #t
after buggy-extract-min, abstraction: (1 2 3 5 9)
```

Verified this session — a correctly built heap from `5, 3, 8, 1, 9, 2` satisfies `heap-rep-ok?` and abstracts to exactly `(1 2 3 5 8 9)`, the correctly sorted set of every inserted value. A directly hand-corrupted array is correctly caught, `#f`. But `buggy-extract-min`, run on the same correct heap, produces a result `heap-rep-ok?` calls perfectly valid, `#t` — while its real abstraction, `(1 2 3 5 9)`, still contains `1`, the true minimum, and is missing `8` instead, a value that was never anywhere close to the minimum of `{5, 3, 8, 1, 9, 2}`. The correct result of extracting the true minimum would abstract to `(2 3 5 8 9)` — `1` removed, everything else intact — nothing at all like what `buggy-extract-min` actually produced, despite passing the only check this Era has used until now.

---

## Closing

### Connect the pieces

One heap, one real bug, checked two separate ways:

1. **The unnamed split, named (Unit 1):** every `*-valid?` checker this Era built already answers only "is this shaped correctly," never "does this hold the right value."
2. **Both halves defined precisely (Unit 2):** a representation invariant checks structure alone; an abstraction function maps structure to the abstract value it's supposed to represent — both needed to trust an operation.
3. **Both written as real code (Unit 3):** `heap-rep-ok?` (Lesson 104's own `heap-valid?`, renamed) and a new `heap-abstraction`, both confirmed correct on a real, correctly-built heap.
4. **A real bug caught by only one of the two (Unit 4):** `buggy-extract-min` passes `heap-rep-ok?` completely, while its abstraction reveals it silently corrupted the represented set — the true minimum untouched, the wrong element discarded instead.

Every claim in this lesson traces to real, executed code: a real, correct heap checked both ways, a hand-corrupted array caught by the RI alone, and a real, deliberately incorrect operation that the RI alone provably cannot catch.

### What breaks without this

Suppose a real system's test suite for a priority-queue-backed feature checked only that the underlying heap array stayed well-formed after every operation — exactly the representation-invariant-only habit Concept Unit 1 described this Era as having relied on so far. This lesson's own `buggy-extract-min` shows precisely what that test suite would miss: an extraction bug that silently returns and discards the wrong elements entirely, while every structural check keeps passing, run after run, because the specific class of bug this lesson constructed sits exactly in structural validity's blind spot. Checking the abstraction directly, as Concept Unit 3 and 4 do, is what would have caught it.

### Exercises

1. **Observe.** Before checking, predict whether `buggy-extract-min`, called *twice* in a row on the same heap, would ever produce an array that fails `heap-rep-ok?`, using this unit's own reasoning about leaf removal to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code, calling `buggy-extract-min` three times in a row on a real heap and checking `heap-rep-ok?` after each call.
3. **Formalize.** Write a representation invariant and abstraction function for Lesson 107's Union-Find parent-pointer array (an RI confirming every `uf-find` walk terminates; an AF mapping the array to the actual partition it represents), and use them to catch a deliberately broken `uf-union!` of your own design.
4. **Explain.** In your own words, explain why removing the array's *last* element specifically (as `buggy-extract-min` does) can never violate heap-order, referencing what makes the last index in a complete tree's array layout always a leaf.
5. **Explain.** Using this lesson's real numbers, explain precisely why an abstraction function needs to produce a *canonical* form (like a sorted list) rather than just returning the array's raw contents directly — referencing what would go wrong comparing two correct, differently-arranged heaps' raw arrays for equality.

### Definition of done

- [ ] You can state the difference between a representation invariant and an abstraction function, and explain why both are needed to trust an operation.
- [ ] You can explain, precisely, why `buggy-extract-min` passes `heap-rep-ok?` — what property of leaves in a complete tree makes that possible.
- [ ] You can point to this lesson's own real output — `(1 2 3 5 9)` versus the correct `(2 3 5 8 9)` — as the concrete proof an abstraction-function check catches something an RI check cannot.
- [ ] You completed Exercises 1–5, including a real representation invariant and abstraction function for a structure from an earlier lesson.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, measured results.
