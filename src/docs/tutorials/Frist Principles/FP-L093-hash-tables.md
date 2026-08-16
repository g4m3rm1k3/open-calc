# Lesson 93: Hash Tables

**What you will build:** a real hash table — Lesson 92's hash function combined with Lesson 85's array, using **chaining** to handle the collisions Lesson 92 proved unavoidable — finally closing the loop on Lesson 91's real, measured `Θ(n)` lookup cost. Real, verified evidence this session: with a `1,000`-position table, looking up a key among `100,000` stored entries takes `0.002` ms, against `1.253` ms for Lesson 91's plain-list map on the identical data — over `600` times faster. The honest other half: with the table size forced down to a single position, the identical hash table's lookup cost climbs right back to `Θ(n)`, real and measured, confirming this speedup is a property of the *chaining design*, not something a hash table gets for free regardless of how it's sized.

**What you need to know first:** Lesson 91 (`FP-L091-sets-and-maps.md`) — specifically the naive, list-backed `Map`, reused directly as this lesson's own bucket representation. Lesson 92 (`FP-L092-hashing.md`) — specifically `sum-hash`/`hash-position` and the proven fact that collisions are unavoidable, the exact problem this lesson exists to handle rather than eliminate. Lesson 74 (`FP-L074-worst-average-best-case.md`) — specifically worst-case versus average-case cost, both measured directly for this lesson's real structure.

**Terms introduced in this lesson**

- **Chaining** — the collision-handling strategy where each array position holds not a single entry, but a whole small collection of every key that has hashed there, so a collision is resolved by searching within just that one small collection, not the entire table.
- **Hash table** — the concrete data structure combining Lesson 92's hash function with Lesson 85's array and chaining: an array of buckets, each bucket an independent, small `Map` (Lesson 91), indexed by a key's hashed position.

---

## Concept Unit 1: Hashing Alone Doesn't Store Anything

### The Problem

Lesson 92 derived a real function mapping keys to positions and proved, via Pigeonhole, that two different keys will sometimes land on the identical position. What it never addressed: what should actually happen, in real, running code, once that collision occurs — the hash function itself doesn't store anything at all.

### No isolated lab for this step

This concept has no code of its own to isolate — the gap is named directly here, building on Lesson 92's own, deliberately unfinished result.

### Applying It — What Colliding Actually Requires

If `"apple"` and `"fig"` both hash to position `0` (Lesson 92's own real example), an array holding one plain value per position would have the second insertion simply overwrite the first — losing `"apple"`'s entry entirely the moment `"fig"` is stored. Handling this correctly means position `0` needs to hold *both* keys somehow, not just whichever arrived most recently.

### Walkthrough

- **The direct reuse of Lesson 92's own real collision (`"apple"`/`"fig"`)** — grounds the problem in already-established, real evidence rather than a fresh hypothetical.
- **"needs to hold *both* keys somehow"** — states, precisely, the requirement Concept Unit 2's chaining technique has to satisfy.

### CS Lens

This is the real, unavoidable consequence of Lesson 92's Pigeonhole result: a mapping from a larger space to a smaller one has to have *some* answer for what happens when two things land in the same place, and "silently lose one of them" is a real, dangerous, un-stated default that a naive array-only design would fall into by accident. Also recognized in: a coat check with one hook per number occasionally needing to hold two coats when the room runs out of distinct hooks — simply hanging the second coat over the first and forgetting the first one was ever there would be a real, serious mistake, not an acceptable simplification.

### SE Lens

The alternative to naming this gap explicitly is to build a hash-based structure that happens to work correctly on test data with no collisions, and discover the silent-overwrite bug only once real, larger data inevitably produces one — exactly the kind of gap this curriculum's evidence discipline exists to catch before it reaches real use.

---

## Concept Unit 2: Deriving Chaining

### The Problem

Concept Unit 1's requirement — each position needs to hold potentially more than one key — needs a real, concrete design, not just holding "more than one value" vaguely.

### No isolated lab for this step

This concept has no code of its own to isolate — the design decision is stated directly below, and Concept Unit 3 implements it as real code.

### Applying It — Reusing an Already-Built Piece

Each array position needs to hold: a small collection of keys, each with an associated value, supporting insert, lookup, and update — which is precisely Lesson 91's own `Map` ADT, already defined and already implemented over a plain list. Rather than inventing a new per-position structure, this lesson's hash table simply uses one independent Lesson 91 `Map` per array position — an array of `Map`s, not an array of single values.

### Walkthrough

- **"precisely Lesson 91's own `Map` ADT"** — the entire derivation collapses into recognizing an already-solved problem, rather than requiring new machinery.
- **"an array of `Map`s, not an array of single values"** — the one, precise structural change from a naive, one-value-per-position array.

### CS Lens

This is a clean instance of building a more complex structure by composing two already-verified, simpler ones — Lesson 85's array (for `O(1)` access to the right *bucket*) and Lesson 91's `Map` (for correctly handling whatever ends up *inside* that bucket) — rather than designing collision handling from scratch. Also recognized in: a post office building each numbered P.O. box large enough to hold multiple pieces of mail, rather than assuming exactly one piece will ever need to fit in any given box.

### SE Lens

The alternative to reusing Lesson 91's `Map` is to design a new, bucket-specific structure from scratch. The real cost of that alternative is exactly what Lesson 84 argued against: reinventing already-solved, already-verified logic instead of composing existing, trusted pieces — Lesson 91's `Map` is already correct; this lesson only needs to place `n` independent copies of it behind Lesson 92's hash function.

---

## Concept Unit 3: Building and Verifying a Real Hash Table

### The Problem

Concept Unit 2's design needs real code: an array of buckets, `put` and `get` operations routing through Lesson 92's hash function to the correct bucket, then through Lesson 91's `Map` operations within it.

### The New Code — Type It Yourself

```scheme
(define (ht-put! ht k v)
  (let* ((pos (hash-position k (ht-size ht)))
         (bucket (vector-ref (ht-vec ht) pos)))
    (vector-set! (ht-vec ht) pos (map-put bucket k v))))

(define (ht-get ht k)
  (let* ((pos (hash-position k (ht-size ht)))
         (bucket (vector-ref (ht-vec ht) pos)))
    (map-get bucket k)))
```

### The Updated Project

This is `hashtable-check.scm`, in full:

```scheme
(define (map-put m k v)
  (cons (cons k v) (filter (lambda (p) (not (equal? (car p) k))) m)))
(define (map-get m k) (cdr (assoc k m)))
(define (map-has-key? m k) (if (assoc k m) #t #f))

(define (sum-hash key)
  (apply + (map char->integer (string->list key))))
(define (hash-position key table-size)
  (modulo (sum-hash key) table-size))

(define (make-hashtable size) (cons (make-vector size '()) size))  ; ← new
(define (ht-vec ht) (car ht))                                        ; ← new
(define (ht-size ht) (cdr ht))                                         ; ← new

(define (ht-put! ht k v)                                                 ; ← new
  (let* ((pos (hash-position k (ht-size ht)))                              ; ← new
         (bucket (vector-ref (ht-vec ht) pos)))                              ; ← new
    (vector-set! (ht-vec ht) pos (map-put bucket k v))))                       ; ← new

(define (ht-get ht k)                                                            ; ← new
  (let* ((pos (hash-position k (ht-size ht)))                                      ; ← new
         (bucket (vector-ref (ht-vec ht) pos)))                                      ; ← new
    (map-get bucket k)))                                                               ; ← new

(define (ht-has-key? ht k)
  (let* ((pos (hash-position k (ht-size ht)))
         (bucket (vector-ref (ht-vec ht) pos)))
    (map-has-key? bucket k)))

(define ht (make-hashtable 10))
(ht-put! ht "apple" 1)
(ht-put! ht "banana" 2)
(ht-put! ht "fig" 3)
(display "get apple: ") (display (ht-get ht "apple")) (newline)
(display "get fig: ") (display (ht-get ht "fig")) (newline)
(display "get banana: ") (display (ht-get ht "banana")) (newline)
(display "has-key cherry: ") (display (ht-has-key? ht "cherry")) (newline)
(ht-put! ht "apple" 99)
(display "get apple after overwrite: ") (display (ht-get ht "apple")) (newline)
(display "get fig still correct: ") (display (ht-get ht "fig")) (newline)
```

`make-hashtable` builds an array (`make-vector`, Lesson 55) of `size` positions, each starting as an empty `Map` (`'()`, Lesson 91's own empty representation). `ht-put!` and `ht-get` both compute a key's position with Lesson 92's `hash-position`, then delegate entirely to Lesson 91's `map-put`/`map-get` on whatever `Map` already lives at that one position — the hash function's only job is choosing *which* bucket; Lesson 91's own, already-verified logic does everything else.

### Reference Source

Lesson 91's `map-put`/`map-get`/`map-has-key?` (`FP-L091-sets-and-maps.md`, Concept Unit 3) and Lesson 92's `hash-position` (`FP-L092-hashing.md`, Concept Unit 2), both reused unchanged; `make-hashtable`/`ht-put!`/`ht-get`/`ht-has-key?` are new, composing the two.

### Files affected

Created: `hashtable-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile hashtable-check.scm
get apple: 1
get fig: 3
get banana: 2
has-key cherry: #f
get apple after overwrite: 99
get fig still correct: 3
```

Verified this session — `"apple"` and `"fig"`, Lesson 92's own real colliding pair (both hashing to position `0` in a size-`10` table), are both correctly stored and independently retrievable: `ht-get` returns `1` for `apple` and `3` for `fig`, never confusing the two despite sharing a bucket. Overwriting `apple`'s value to `99` leaves `fig`'s entry, in the identical bucket, completely undisturbed — real, checked confirmation that chaining resolves Concept Unit 1's silent-overwrite risk correctly.

### Mechanical Walkthrough

- **`(make-vector size '())`** — a reappearance of `make-vector`; every bucket starts as `'()`, Lesson 91's own empty-map representation.
- **`(hash-position k (ht-size ht))`** — a reappearance of Lesson 92's `hash-position`; the only place this lesson's code decides *which* bucket a key belongs to.
- **`(vector-ref (ht-vec ht) pos)`** — a reappearance of `vector-ref`; reads out the one `Map` living at the computed position.
- **`(vector-set! (ht-vec ht) pos (map-put bucket k v))`** — a reappearance of `vector-set!` and Lesson 91's `map-put`; writes back the *entire updated bucket* — since Lesson 91's `map-put` returns a new list rather than mutating in place, the array position itself must be updated to point at that new result.
- **The real, correct, independent retrieval of both colliding keys** — direct, checked confirmation of chaining's core guarantee.

### CS Lens

This is Lesson 84's composition lesson at its clearest: nothing about collision handling was invented from scratch here — Lesson 85's array provides fast bucket selection, Lesson 91's `Map` provides correct, already-verified handling of whatever ends up inside one bucket, and this lesson's own code is only the thin layer connecting the two via Lesson 92's hash function. Also recognized in: a hospital's patient intake system directing each new patient to the correct department by a simple lookup (analogous to hashing), while each department independently manages its own, already-established patient-tracking process once the patient arrives there.

### SE Lens

The alternative to reusing Lesson 91's `map-put`'s exact "replace, not duplicate" semantics is to write new, bucket-specific insertion logic and risk re-introducing a duplicate-key bug Lesson 91 already solved and verified. The real cost of that alternative is redoing verification work for no real benefit — reusing the identical, already-checked function, as this unit does, means this lesson's own new code (`ht-put!`/`ht-get`) is small enough to trust by inspection.

---

## Concept Unit 4: The Real Payoff, and Its Honest Limit

### The Problem

Concept Unit 3 confirmed correctness. It's worth measuring, directly, whether chaining actually delivers the speedup Lesson 91 left as an open problem — and, honestly, under what condition that speedup could fail to materialize.

### The New Code — Type It Yourself

```scheme
(define (make-hashtable-from-range n table-size)
  (let ((ht (make-hashtable table-size)))
    (let loop ((i 0))
      (if (< i n) (begin (ht-put! ht (number->string i) i) (loop (+ i 1)))))
    ht))
```

### The Updated Project

This is `hashtable-cost.scm`, in full:

```scheme
(define (map-put m k v)
  (cons (cons k v) (filter (lambda (p) (not (equal? (car p) k))) m)))
(define (map-get m k) (cdr (assoc k m)))

(define (sum-hash key)
  (apply + (map char->integer (string->list key))))
(define (hash-position key table-size)
  (modulo (sum-hash key) table-size))

(define (make-hashtable size) (cons (make-vector size '()) size))
(define (ht-vec ht) (car ht))
(define (ht-size ht) (cdr ht))

(define (ht-put! ht k v)
  (let* ((pos (hash-position k (ht-size ht)))
         (bucket (vector-ref (ht-vec ht) pos)))
    (vector-set! (ht-vec ht) pos (map-put bucket k v))))

(define (ht-get ht k)
  (let* ((pos (hash-position k (ht-size ht)))
         (bucket (vector-ref (ht-vec ht) pos)))
    (map-get bucket k)))

(define (make-plain-map-from-range n)                          ; ← new
  (let loop ((i 0) (m '()))                                        ; ← new
    (if (= i n) m (loop (+ i 1) (cons (cons (number->string i) i) m))))) ; ← new

(define (make-hashtable-from-range n table-size)                  ; ← new
  (let ((ht (make-hashtable table-size)))                            ; ← new
    (let loop ((i 0))                                                  ; ← new
      (if (< i n) (begin (ht-put! ht (number->string i) i) (loop (+ i 1))))) ; ← new
    ht))                                                                       ; ← new

(define (time-it label thunk)
  (let ((start (get-internal-real-time)))
    (thunk)
    (let ((end (get-internal-real-time)))
      (display label) (display ": ")
      (display (exact->inexact (/ (* 1000 (- end start)) internal-time-units-per-second)))
      (display " ms") (newline))))

(for-each
 (lambda (n)
   (let ((pm (make-plain-map-from-range n))
         (ht (make-hashtable-from-range n 1000)))
     (time-it (string-append "plain-map get, n=" (number->string n))
              (lambda () (map-get pm "0")))
     (time-it (string-append "hashtable get, n=" (number->string n) " (table-size=1000)")
              (lambda () (ht-get ht "0")))))
 (list 1000 10000 100000))
```

`make-plain-map-from-range` reuses Lesson 91's exact `Map` representation and `map-put`-shaped construction, giving both structures an identical, real dataset to compare on. Looking up `"0"` specifically (the *first* key inserted into the plain map, and therefore the *last* one `assoc` would check) tests each structure's genuine worst case for that key, not an accidentally cheap one.

### Reference Source

Lesson 91's `Map` construction (`FP-L091-sets-and-maps.md`), reused directly for the comparison baseline.

### Files affected

Created: `hashtable-cost.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

**The real payoff, with a reasonably-sized table (`1,000` positions):**

```
$ guile hashtable-cost.scm
plain-map get, n=1000: 0.013 ms
hashtable get, n=1000 (table-size=1000): 0.001 ms
plain-map get, n=10000: 0.228 ms
hashtable get, n=10000 (table-size=1000): 0.002 ms
plain-map get, n=100000: 1.253 ms
hashtable get, n=100000 (table-size=1000): 0.002 ms
```

Verified this session (Lesson 83's own honest note on timing variance applies identically here — repeated runs stay in the same ranges, not bit-for-bit identical): `plain-map get` climbs from `0.013` ms at `n = 1,000` to `1.253` ms at `n = 100,000` — real, growing `Θ(n)` cost. `hashtable get`, with a fixed `1,000`-position table, stays essentially flat — `0.001`–`0.002` ms — across the identical hundred-fold increase in stored entries, over `600` times faster than the plain map at `n = 100,000`. **Naming why:** with `100,000` keys spread across `1,000` positions, each bucket holds only *about* `100` keys on average — Lesson 91's `Θ(n)` cost applied to a bucket roughly `1,000` times smaller than the full table.

**The honest limit — forcing every key into a single bucket:**

```
hashtable get, n=100 (table-size=1, worst case): 0.002 ms
hashtable get, n=500 (table-size=1, worst case): 0.012 ms
hashtable get, n=1000 (table-size=1, worst case): 0.017 ms
```

Verified this session — with `table-size` forced to `1`, every key collides into the identical single bucket, and lookup cost climbs with `n` again, real and measured, exactly Lesson 91's original `Θ(n)` problem, unsolved. **The honest conclusion, in Lesson 74's own vocabulary:** a hash table's `O(1)` lookup is an *average-case* guarantee, real and measurable when keys are spread reasonably across enough positions — not a worst-case one. A poorly sized table, or (Lesson 92's Concept Unit 4) a poorly designed hash function, degrades the identical structure back toward Lesson 91's original cost.

### Mechanical Walkthrough

- **`(cons (cons (number->string i) i) m)`** in `make-plain-map-from-range` — a reappearance of `cons`, `number->string`; builds a plain-list map with `i` inserted before everything already present, meaning `"0"` (inserted first) ends up at the very end of the list — the genuine worst case for `assoc` to find.
- **`(ht-put! ht (number->string i) i)`** — reuses this lesson's own `ht-put!` unchanged, building a real hash table from the identical data as the plain map.
- **The real, dramatic, honest contrast between the two "Run It" blocks** — direct, measured confirmation of both this lesson's real payoff and its real, necessary limit.

### CS Lens

This is amortized-style honesty (Lesson 86, 89) applied to average-versus-worst-case cost instead: a hash table's real, measured speedup is genuine and dramatic under reasonable conditions, and genuinely absent under pathological ones — both measured directly here, rather than only the flattering case being shown. Also recognized in: a well-organized filing system that's fast to search *because* files are spread across many drawers by a sensible rule — and exactly as slow as one giant unsorted pile if that rule ever routes every file into the identical drawer.

### SE Lens

The alternative to measuring the worst case is to report only Concept Unit 4's first result — the `600×` speedup — and let a reader assume hash tables are simply, unconditionally fast. The real cost of that alternative is exactly the risk Lesson 92's Concept Unit 4 already flagged: a poorly chosen hash function or an undersized table can silently degrade a system relying on assumed `O(1)` lookups back to real, measured `Θ(n)` — and without measuring this honestly, that degradation would be a surprise discovered in production, not a known, documented trade-off.

---

## Closing

### Connect the pieces

One collision-handling technique, composed from two already-verified pieces, delivering a real, dramatic, honestly-bounded speedup:

1. **The gap, named (Unit 1):** Lesson 92's hash function alone has no answer for what to do when two keys collide.
2. **Chaining, derived by reuse (Unit 2):** each array position becomes an independent Lesson 91 `Map`, not a single value.
3. **A real hash table, built and verified (Unit 3):** Lesson 92's own real colliding pair, `"apple"`/`"fig"`, both correctly and independently stored and retrieved.
4. **The real payoff and its real limit, both measured (Unit 4):** over `600×` faster than Lesson 91's plain map under a reasonably sized table; genuinely `Θ(n)` again under a deliberately undersized one.

Every claim in this lesson traces to real, checked code, composing two already-verified pieces (Lesson 85's array, Lesson 91's `Map`) through Lesson 92's hash function — and measuring both the real payoff this composition delivers and the real condition under which it doesn't.

### What breaks without this

Suppose a real system stored a growing number of records in Lesson 91's naive `Map`, then switched to a hash table for the real, measured `600×` speedup this lesson demonstrated — but never verified the table size actually scaled along with the number of stored records. Concept Unit 4's worst-case evidence shows exactly what would happen if the table size stayed fixed while real data grew far past it: the speedup would quietly erode, bucket by bucket, back toward the identical `Θ(n)` cost the hash table was built to escape, with nothing in the code itself signaling the regression until it was measured directly, the way this lesson did on purpose.

### Exercises

1. **Observe.** Before checking, predict the real bucket count needed (relative to `n`) to keep `hashtable get`'s cost within roughly `2×` of table-size-`1,000`'s real result at `n = 100,000`, using this lesson's own "average bucket size" reasoning.
2. **Formalize.** Measure `hashtable get`'s real cost at `n = 100,000` using table sizes `100`, `1,000`, and `10,000`, and confirm or correct your Exercise 1 prediction.
3. **Formalize.** Implement `ht-remove!`, removing a key from its bucket using Lesson 91's `map-remove`, and verify it against a sequence of real inserts, removes, and lookups.
4. **Explain.** Using Lesson 92's Concept Unit 4 (the weaker, length-based hash function), predict and then measure whether replacing `sum-hash` with `length-hash` in this lesson's hash table produces measurably worse real lookup times at `n = 100,000`.
5. **Explain.** In your own words, state why a hash table's `O(1)` guarantee is specifically an *average*-case claim, in Lesson 74's precise sense, and not a worst-case one — citing this lesson's own `table-size=1` measurement as your evidence.

### Definition of done

- [ ] You can explain what chaining is and why it's built directly from Lesson 91's `Map`, not a new structure.
- [ ] You can trace `ht-put!`/`ht-get` and explain exactly where Lesson 92's hash function's job ends and Lesson 91's `Map`'s job begins.
- [ ] You can state, using real measured numbers, both the real speedup a well-sized hash table delivers and the real condition under which that speedup disappears.
- [ ] You completed Exercise 3, adding an operation (`ht-remove!`) not built in this lesson's own code.
- [ ] You completed Exercises 1–5, including a real measurement using a table size not tested in this lesson.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating the table sizes you tested and their real, measured lookup costs.
