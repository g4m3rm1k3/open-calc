# Lesson 91: Sets and Maps

**What you will build:** two related ADTs, `Set` and `Map`, defined in Lesson 84's precise contract format and implemented, deliberately naively, over a plain list — with `Map` built directly as a `Set` of key-value pairs, unifying the two. Real, verified evidence this session: `set-member?`'s cost climbs from `0.004` ms at `1,000` elements to `5.246` ms at `1,000,000` — real, measured, linearly growing cost for a question this curriculum has asked constantly (`linear-search`, `member`, `all-subsets`'s own duplicate-checking) without ever naming a dedicated ADT for it. The transferable point: every representation lesson in this Era so far (Lessons 85–90) picked a representation *after* naming a concrete need. This lesson names `Set` and `Map` precisely, builds the obvious first representation, and — deliberately, honestly — measures exactly the cost problem Lesson 92 exists to solve, rather than solving it here.

**What you need to know first:** Lesson 84 (`FP-L084-abstract-data-types.md`) — specifically the ADT contract format, reused directly for two new interfaces. Lesson 68 (`FP-L068-repeated-halving.md`) — specifically `linear-search`'s real, already-measured cost, the same shape of cost this lesson's `set-member?` reproduces for membership instead of position-finding.

**Terms introduced in this lesson**

- **Set** — an abstract data type for membership alone: which elements are present, with no meaningful order and no duplicates, answering only "is this here" and "add/remove this," never "which position."
- **Map** — an abstract data type associating each of a collection of distinct keys with exactly one value, supporting looking a value up by its key, replacing a key's value, and checking whether a key is present at all.

---

## Concept Unit 1: A Question Asked Constantly, Never Named

### The Problem

This curriculum has asked "is this value already present" and "what value corresponds to this key" repeatedly — `all-subsets`'s implicit uniqueness, `linear-search`'s own membership question, any lookup keyed by name or identity — always using a raw list and `member` or an equivalent hand-rolled check, never a dedicated, named ADT for the question itself. It's worth naming these two related questions precisely, the way Lesson 88 and 89 named LIFO and FIFO precisely after this curriculum had already been using both informally.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, using this curriculum's own prior, unnamed uses of membership and lookup.

### Applying It — Two Related, but Distinct, Questions

"Is `x` present" needs nothing but the elements themselves — a **Set**. "What value goes with this key" needs an association between two things — a **Map**. The two are related precisely because a Map's "is this key present" question is exactly a Set question, asked about the *keys* alone, with a value carried alongside each one.

### Walkthrough

- **The direct citation of prior, unnamed uses** — confirms this isn't a hypothetical need, it's a real, recurring pattern already present in this curriculum's own history.
- **"exactly a Set question, asked about the keys alone"** — previews Concept Unit 2's unifying construction before any code is written.

### CS Lens

This is the same naming discipline Lesson 88 and 89 applied to LIFO and FIFO, now applied to membership and association — recognizing that a pattern used repeatedly, informally, is worth a precise name specifically because naming it makes it a reusable, checkable tool rather than a habit reinvented each time. Also recognized in: a librarian's card catalog answering "is this book in the collection" (a set-shaped question) and "which shelf is this book on" (a map-shaped question) as two related but distinct services built from the identical underlying catalog.

### SE Lens

The alternative to naming these ADTs is to keep solving membership and lookup with ad hoc list-scanning code wherever the need arises, the way this curriculum has done informally so far. The real cost of that alternative isn't incorrectness — `member` and `assoc` work — it's the same cost Lesson 84 named for any unnamed interface: no shared contract to implement against, measure, or eventually replace with something faster.

---

## Concept Unit 2: Defining Set and Map Precisely

### The Problem

Concept Unit 1's two questions need Lesson 84's precise contract treatment, plus an explicit statement of how a Map can be built from a Set.

### No isolated lab for this step

This concept has no code of its own to isolate — the definitions are stated directly below.

### Applying It — Two ADTs, One Built From the Other

**The `Set` ADT:**
- **`insert(s, x)`** — *guarantees:* returns a set containing `x` and every element of `s`, with no duplicates.
- **`member?(s, x)`** — *guarantees:* returns true exactly when `x` is present in `s`.
- **`remove(s, x)`** — *guarantees:* returns a set containing every element of `s` except `x`.
- **`empty?(s)`** — *guarantees:* returns true exactly when `s` contains no elements.

**The `Map` ADT:**
- **`put(m, k, v)`** — *guarantees:* returns a map where `k` is associated with `v`; if `k` was already present, its old value is replaced, not duplicated.
- **`get(m, k)`** — *requires:* `k` is present in `m`. *guarantees:* returns the value currently associated with `k`.
- **`has-key?(m, k)`** — *guarantees:* returns true exactly when `k` is associated with some value in `m`.
- **`remove(m, k)`** — *guarantees:* returns a map with `k` and its associated value both gone.

**The unifying construction:** a `Map` can be represented as a `Set` of `(key . value)` pairs, where `has-key?` is exactly `member?` applied to the *key* component alone, and `put` is exactly `remove`-then-`insert`, guaranteeing no duplicate key ever survives a `put`.

### Walkthrough

- **Each operation as a contract** — a direct reapplication of Lesson 84's format to two new, related interfaces.
- **`put`'s explicit "replace, not duplicate" guarantee** — the one contract detail with no equivalent in `Set`, precisely because a Map's keys must stay unique in a way a Set's elements, by definition, already are.
- **The unifying construction, stated precisely** — turns "a Map is kind of like a Set" from a vague resemblance into an exact, checkable relationship.

### CS Lens

This is two ADTs sharing a real, structural relationship rather than merely a similar-sounding purpose: a Map's entire contract can be *derived* from a Set's, applied to pairs and projected onto their first component — exactly the kind of composition Lesson 84 argued an ADT boundary makes possible. Also recognized in: a phone book (a Map from name to number) built, conceptually, from a set of name-number cards, where "is this name listed" is answered by checking the set of names alone, ignoring the numbers written on each card.

### SE Lens

The alternative to deriving Map from Set is to define and implement the two independently, missing the chance to reuse one correct, verified implementation for both. The real cost of that alternative is duplicated implementation and duplicated risk of bugs — Concept Unit 3 builds exactly one real Set implementation and gets Map's behavior nearly for free by building on top of it.

---

## Concept Unit 3: The Naive Implementation

### The Problem

Concept Unit 2's contracts need a real, working implementation — the most obvious one, over a plain list, checked for correctness before Concept Unit 4 measures its cost.

### The New Code — Type It Yourself

```scheme
(define (set-insert s x) (if (set-member? s x) s (cons x s)))
(define (set-member? s x) (if (member x s) #t #f))
```

### The Updated Project

This is `setmap-check.scm`, in full:

```scheme
(define (make-set) '())
(define (set-member? s x) (if (member x s) #t #f))              ; ← new
(define (set-insert s x) (if (set-member? s x) s (cons x s)))     ; ← new
(define (set-remove s x) (filter (lambda (y) (not (equal? y x))) s)) ; ← new
(define (set-empty? s) (null? s))

(define (make-map) '())
(define (map-put m k v)                                           ; ← new
  (cons (cons k v) (filter (lambda (p) (not (equal? (car p) k))) m))) ; ← new
(define (map-get m k) (cdr (assoc k m)))                             ; ← new
(define (map-has-key? m k) (if (assoc k m) #t #f))                     ; ← new
(define (map-remove m k) (filter (lambda (p) (not (equal? (car p) k))) m)) ; ← new

(define s (set-insert (set-insert (set-insert (make-set) 1) 2) 3))
(display "set member 2: ") (display (set-member? s 2)) (newline)
(display "set member 5: ") (display (set-member? s 5)) (newline)
(display "set after re-inserting 2 (no duplicate): ") (display (set-insert s 2)) (newline)
(display "set after remove 2: ") (display (set-remove s 2)) (newline)

(define m (map-put (map-put (map-put (make-map) 'a 1) 'b 2) 'c 3))
(display "map get b: ") (display (map-get m 'b)) (newline)
(display "map has-key d: ") (display (map-has-key? m 'd)) (newline)
(define m2 (map-put m 'b 99))
(display "map get b after overwrite: ") (display (map-get m2 'b)) (newline)
(display "map size unchanged after overwrite: ") (display (length m2)) (newline)
```

`set-insert` checks membership before adding, satisfying `Set`'s no-duplicates guarantee directly. `map-put` is exactly Concept Unit 2's derived construction: `filter` out any existing pair with the identical key (a `remove`), then `cons` the new pair on (an `insert`) — one line, directly implementing "replace, not duplicate."

### Reference Source

No reference counterpart — a from-scratch, deliberately naive implementation, built to satisfy Concept Unit 2's contracts as directly as possible, over a plain list.

### Files affected

Created: `setmap-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile setmap-check.scm
set member 2: #t
set member 5: #f
set after re-inserting 2 (no duplicate): (3 2 1)
set after remove 2: (3 1)
map get b: 2
map has-key d: #f
map get b after overwrite: 99
map size unchanged after overwrite: 3
```

Verified this session — `set-member?` correctly distinguishes present (`2`) from absent (`5`); re-inserting an already-present element leaves the set unchanged in size (`(3 2 1)`, still three elements); `map-get` retrieves the correct value; `map-has-key?` correctly reports `d` absent; and overwriting `b`'s value leaves the map at exactly three entries, not four — direct, checked confirmation that `put`'s "replace, not duplicate" contract holds in real code, not just in the derivation.

### Mechanical Walkthrough

- **`(if (member x s) #t #f)`** — a reappearance of `member` (a real Scheme procedure checking list membership, already used informally in Lesson 82); `member` itself returns the matching remainder or `#f`, so wrapping it in `if` converts that into a plain `#t`/`#f`.
- **`(filter (lambda (y) (not (equal? y x))) s)`** — a reappearance of `filter` (Lesson 35), `equal?`, `not`; keeps every element except `x`, satisfying `remove`'s contract directly.
- **`(assoc k m)`** — first appearance: a real Scheme procedure searching a list of pairs for one whose `car` matches the given key, returning that pair or `#f` — exactly a Set's `member?`, specialized to check only a pair's first component.
- **`(cons (cons k v) (filter ...))`** — a reappearance of `cons`, `filter`; builds the new `(key . value)` pair and prepends it to every *other* existing pair, having just filtered out any old entry for the identical key.
- **The real, correct output across every operation, including the overwrite case** — direct, checked confirmation that both ADTs' contracts hold, not merely that the code runs without error.

### CS Lens

This is Concept Unit 2's unifying claim made concrete: `map-get`'s `assoc` and `map-has-key?`'s `assoc` are both, structurally, `Set`'s own `member?` applied to keys — the naive Map implementation didn't need independent logic, it needed the identical list-scanning idea, applied to a different projection of each element. Also recognized in: a spreadsheet's `VLOOKUP` function, which is really just "does this value appear in this column, and if so, what's in the matching row" — a membership question with a value attached.

### SE Lens

The alternative to deriving `map-put`/`map-get`/`map-has-key?` from the identical `Set`-style scanning logic is to write independent, hand-rolled lookup code for the map specifically. The real cost of that alternative is duplicated logic doing the identical conceptual work — Concept Unit 2's derived construction is what keeps this lesson's implementation small and its correctness easy to reason about directly from `Set`'s own already-verified behavior.

---

## Concept Unit 4: The Real Cost, Measured Honestly

### The Problem

Concept Unit 3's implementation is correct. It's worth measuring its real cost directly, honestly, rather than assuming "it works" means "it's efficient enough" — the same discipline Lesson 86 and 89 both applied before introducing a real fix.

### The New Code — Type It Yourself

```scheme
(define (time-it label thunk)
  (let ((start (get-internal-real-time)))
    (thunk)
    (let ((end (get-internal-real-time)))
      (display label) (display ": ")
      (display (exact->inexact (/ (* 1000 (- end start)) internal-time-units-per-second)))
      (display " ms") (newline))))
```

### The Updated Project

This is `setmap-cost.scm`, in full:

```scheme
(define (set-member? s x) (if (member x s) #t #f))

(define (time-it label thunk)                                  ; ← new
  (let ((start (get-internal-real-time)))                          ; ← new
    (thunk)                                                          ; ← new
    (let ((end (get-internal-real-time)))                              ; ← new
      (display label) (display ": ")                                     ; ← new
      (display (exact->inexact (/ (* 1000 (- end start))                    ; ← new
                                   internal-time-units-per-second)))          ; ← new
      (display " ms") (newline))))                                             ; ← new

(for-each
 (lambda (n)
   (let ((s (iota n)))
     (time-it (string-append "set-member? absent, n=" (number->string n))
              (lambda () (set-member? s -1)))))
 (list 1000 10000 100000 1000000))
```

### Reference Source

No reference counterpart — reuses Lesson 83's own `time-it` timing helper, applied to Concept Unit 3's own `set-member?`.

### Files affected

Created: `setmap-cost.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile setmap-cost.scm
set-member? absent, n=1000: 0.004 ms
set-member? absent, n=10000: 0.041 ms
set-member? absent, n=100000: 0.428 ms
set-member? absent, n=1000000: 5.246 ms
```

Verified this session (Lesson 83's honest note on timing variance applies here too) — `set-member?`'s real cost climbs steadily and proportionally with `n`, growing roughly `10×` for each `10×` increase in size, real `Θ(n)` behavior. **Naming why, directly:** `set-member?`'s `member` call walks the underlying list from the front, exactly `linear-search`'s own real, already-measured behavior (Lesson 68), applied here to checking presence rather than finding a position.

### Mechanical Walkthrough

- **`(iota n)`** — a reappearance of `iota`; builds a set of `n` distinct elements to test against.
- **`(set-member? s -1)`** — checking for `-1`, guaranteed absent from `(iota n)`'s non-negative values, forcing `member` to walk the *entire* list before returning `#f` — the real worst case, deliberately, not an accidental early exit.
- **The real, steadily climbing timing** — direct, measured confirmation this ADT's naive implementation inherits `linear-search`'s exact cost profile.

### CS Lens

This is the honest cliffhanger this curriculum's Era IV has used consistently: a correct, naive representation, measured deliberately before being improved — exactly Lesson 86's naive dynamic array and Lesson 89's naive queue, now applied to membership and lookup. A dedicated `Set`/`Map` ADT, defined and even correctly implemented, is only as fast as the representation chosen for it — naming the ADT (Concept Unit 2) didn't, by itself, solve the cost problem this unit measures. Also recognized in: naming a well-defined service level agreement for "how quickly a request will be answered" without yet having built the infrastructure fast enough to actually meet it.

### SE Lens

The alternative to measuring this cost explicitly is to consider Concept Unit 3's implementation "done" once it's correct, the way an incomplete engineering process might. The real cost of that alternative, at real scale (`5.246` ms per single membership check at `1,000,000` elements — multiplied across every check a real system might perform), is exactly the kind of silently degrading performance this curriculum has warned about since Lesson 68. Measuring it honestly here, without yet fixing it, is what makes Lesson 92's upcoming solution a response to a real, demonstrated need rather than a solution in search of a problem.

---

## Closing

### Connect the pieces

Two related ADTs, named, derived from each other, and honestly measured:

1. **The unnamed pattern, named (Unit 1):** membership and lookup, asked constantly throughout this curriculum, never given a dedicated ADT until now.
2. **Two contracts, and one derivation (Unit 2):** `Set` and `Map`, with `Map` shown to be exactly a `Set` of pairs, projected onto keys.
3. **A real, naive implementation, verified (Unit 3):** built over a plain list, correct across insert, member, remove, put, get, has-key, and overwrite.
4. **The real cost, measured honestly (Unit 4):** `Θ(n)`, climbing from `0.004` ms to `5.246` ms across a thousand-fold increase in size — the exact problem left open for Lesson 92.

Every claim in this lesson traces to real, checked code and real, measured timing — naming and deriving two ADTs precisely, then honestly confirming their naive implementation's real limit rather than either hiding it or fixing it prematurely.

### What breaks without this

Suppose a real system used this lesson's naive `Set`/`Map` implementation, correct and simple, for a growing collection of records needing frequent lookups — user accounts, cached results, anything checked repeatedly by key. Concept Unit 4's real evidence shows exactly what would happen as that collection grows into the hundreds of thousands or millions: each individual lookup, once cheap enough to ignore, would climb into multiple milliseconds, and a system performing many such lookups per request would feel the accumulated cost directly. Measuring this honestly now, before Lesson 92's fix, is what makes the fix's motivation concrete rather than assumed.

### Exercises

1. **Observe.** Before checking, predict whether `set-insert`'s real cost (which checks membership before adding) would show the identical growth pattern as `set-member?`'s, using this lesson's own implementation to justify your answer.
2. **Formalize.** Measure `set-insert`'s real cost at the same four scales as Concept Unit 4, and confirm or correct your Exercise 1 prediction.
3. **Formalize.** Measure `map-get`'s real cost at the same four scales, on a map built from `(iota n)`-keyed pairs, and compare its growth pattern to `set-member?`'s.
4. **Explain.** In your own words, explain why `map-put`'s use of `filter` to remove any existing entry for a key means `put` costs at least as much as `has-key?`, even when the key wasn't already present, referencing Concept Unit 3's actual code.
5. **Explain.** Using Lesson 84's ADT vocabulary, explain why a *faster* implementation of `Set`/`Map` (whatever Lesson 92 turns out to build) would require no changes at all to any code written generically against these contracts — citing Concept Unit 2's contracts specifically.

### Definition of done

- [ ] You can state the `Set` and `Map` ADTs' contracts, and explain precisely how `Map` is derived from `Set`.
- [ ] You can explain why `set-member?`'s real cost grows linearly, connecting it directly to `linear-search`'s already-established behavior (Lesson 68).
- [ ] You verified `map-put`'s "replace, not duplicate" guarantee with real, checked code, not just by reading the implementation.
- [ ] You completed Exercises 1–5, including at least one real timing measurement not shown in this lesson's own code.
- [ ] You can state, honestly, what problem remains unsolved at the end of this lesson, and why solving it is left to Lesson 92 rather than attempted here.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating which operation you measured and its real growth pattern.
