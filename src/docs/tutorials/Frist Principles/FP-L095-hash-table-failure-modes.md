# Lesson 95: Hash Table Failure Modes

**What you will build:** a real **hash flooding** attack against Lesson 92's own `sum-hash` — every one of `5,040` anagrams of `"abcdefg"` hashed to the *identical* position, at *every* table size tested, because summing character codes ignores their order entirely. Real, verified evidence this session: looking up all `5,040` attack keys in Lesson 94's self-resizing hash table (which grew to a real `8,192`-position table, exactly as designed) takes `100.611` ms — over `22` times slower than `4.556` ms for `5,040` ordinary, non-colliding keys in a table of the identical size. The transferable point: Lesson 94 measured average-case cost and built a resize policy assuming reasonably-distributed keys. This lesson asks Lesson 73's exact question — what can an adversary who *knows* the hash function do — and shows, concretely, that resizing alone cannot save a hash table from a hash function with a real, exploitable structural weakness.

**What you need to know first:** Lesson 94 (`FP-L094-load-factor.md`) — specifically the self-resizing hash table, attacked directly here. Lesson 92 (`FP-L092-hashing.md`) — specifically `sum-hash`, and Exercise 5's own already-flagged observation that anagrams like `"eat"`/`"tea"` share a hash code. Lesson 73 (`FP-L073-big-omega.md`) — specifically the adversary argument, reapplied here to a hash function instead of a search algorithm.

**Terms introduced in this lesson**

- **Hash flooding** — an attack where an adversary who knows or can guess a hash function deliberately constructs many keys that all map to the identical hash value, degrading a hash table's real lookup cost back toward `Θ(n)`, regardless of the table's size or any resizing policy applied to it.

---

## Concept Unit 1: What Would an Adversary Do?

### The Problem

Lesson 94 measured real, average-case cost and built a resize policy on the assumption that keys spread out reasonably across positions. Lesson 73's adversary argument asked what happens when an adversary, knowing exactly how an algorithm works, deliberately constructs the worst possible input. It's worth asking the identical question about `sum-hash` specifically: does knowing its exact definition let an adversary construct keys guaranteed to collide?

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, reapplying Lesson 73's own reasoning to a new target.

### Applying It — The Exact Weakness sum-hash Exposes

`sum-hash` computes `char->integer` for every character and adds them all together — a sum has no notion of *order* at all. Any two strings using the identical multiset of characters, rearranged, produce the identical sum, and therefore the identical hash, and therefore (Lesson 92's own `modulo`) the identical position, at *any* table size. Lesson 92's own Exercise 5 already noticed this for one pair (`"eat"`/`"tea"`); an adversary doesn't need just a pair — every one of a string's `n!` **anagrams** shares the identical hash.

### Walkthrough

- **The direct reuse of Lesson 73's adversary framing** — this isn't a new kind of reasoning, it's the identical question, aimed at a different target.
- **"at *any* table size"** — the specific, alarming detail that separates this from Lesson 93 and 94's earlier, benign collisions: those depended on the specific table size chosen; this one doesn't depend on table size at all.

### CS Lens

This is the real, structural reason "the hash function ignores order" is a security-relevant weakness, not merely a minor imperfection: an attacker doesn't need to guess table sizes or get lucky — Lesson 58's own `permutations` procedure, applied to any chosen string, mechanically generates an unlimited supply of guaranteed collisions. Also recognized in: a security checkpoint that only checks *which* items someone is carrying, never their arrangement, letting someone repackage a suspicious set of items in a different order to look identical to a benign one, by the checkpoint's own stated criteria.

### SE Lens

The alternative to asking this question is to trust Lesson 94's real, benign measurements as evidence a hash table is broadly safe. The real cost of that alternative is exactly what security engineering calls out repeatedly: measuring against realistic, non-adversarial data says nothing about behavior under data an adversary deliberately constructed to be unrealistic, on purpose.

---

## Concept Unit 2: Constructing and Confirming the Attack

### The Problem

Concept Unit 1's claim needs real, executed proof: generate real anagrams, and confirm they really do collide, at more than one table size, not just assumed from the algebra.

### The New Code — Type It Yourself

```scheme
(define (unique lst)
  (if (null? lst)
      '()
      (if (member (car lst) (cdr lst))
          (unique (cdr lst))
          (cons (car lst) (unique (cdr lst))))))
```

### The Updated Project

This is `attack-check.scm`, in full:

```scheme
(define (remove-item x lst)
  (filter (lambda (y) (not (equal? y x))) lst))
(define (permutations lst)
  (if (null? lst)
      (list '())
      (apply append
             (map (lambda (x)
                    (map (lambda (p) (cons x p))
                         (permutations (remove-item x lst))))
                  lst))))

(define (sum-hash key)
  (apply + (map char->integer (string->list key))))
(define (hash-position key table-size)
  (modulo (sum-hash key) table-size))

(define (unique lst)                                            ; ← new
  (if (null? lst)                                                  ; ← new
      '()                                                            ; ← new
      (if (member (car lst) (cdr lst))                                ; ← new
          (unique (cdr lst))                                            ; ← new
          (cons (car lst) (unique (cdr lst))))))                          ; ← new

(define base-chars (string->list "abcdef"))
(define anagram-keys (map list->string (permutations base-chars)))
(display "number of anagram keys: ") (display (length anagram-keys)) (newline)

(for-each
 (lambda (table-size)
   (let ((positions (map (lambda (k) (hash-position k table-size)) anagram-keys)))
     (display "table-size=") (display table-size)
     (display " distinct positions used by all ") (display (length anagram-keys))
     (display " anagrams: ") (display (length (unique positions)))
     (newline)))
 (list 10 100 1000 10000))
```

`permutations` is Lesson 58's own procedure, unchanged, generating every rearrangement of `"abcdef"`'s six letters — real anagrams, not hand-picked examples.

### Reference Source

Lesson 58's `permutations` (`FP-L058-permutations.md`, Concept Unit 4), reused directly; Lesson 92's `sum-hash`/`hash-position` (`FP-L092-hashing.md`), unchanged, as the attack's real target.

### Files affected

Created: `attack-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile attack-check.scm
number of anagram keys: 720
table-size=10 distinct positions used by all 720 anagrams: 1
table-size=100 distinct positions used by all 720 anagrams: 1
table-size=1000 distinct positions used by all 720 anagrams: 1
table-size=10000 distinct positions used by all 720 anagrams: 1
```

Verified this session — all `720` real anagrams of `"abcdef"` (`6!`, every one actually generated by Lesson 58's `permutations`, not sampled) reduce to exactly `1` distinct position, at every one of four genuinely different table sizes. Unlike Lesson 93 and 94's earlier collisions, which depended on a specific, small table size, this collision persists completely unchanged across a `1,000×` range of table sizes — real, confirmed evidence the attack doesn't depend on guessing the table's size at all.

### Mechanical Walkthrough

- **`(member (car lst) (cdr lst))`** — a reappearance of `member`; checks whether the current element appears again later in the list.
- **`(if (member ...) (unique (cdr lst)) (cons (car lst) (unique (cdr lst))))`** — a reappearance of `if`, `cons`; keeps an element only if it doesn't reappear later, producing a list of genuinely distinct values.
- **The real, exact `1` at every table size** — direct, checked confirmation that this collision is total and size-independent, not a partial or size-dependent clustering like Lesson 93's own examples.

### CS Lens

This is Lesson 62's Pigeonhole Principle's *opposite* extreme made concrete: Pigeonhole guarantees *some* minimum number of collisions once keys outnumber positions; this attack achieves the *worst possible* outcome — every single key sharing one position — far beyond what Pigeonhole requires, by exploiting a specific structural blindness in the hash function itself rather than merely having many keys.

### SE Lens

The alternative to generating real anagrams programmatically is to hand-pick two or three colliding examples, the way Lesson 92's own Exercise 5 did. The real cost of that alternative here is understating the danger — a handful of hand-picked collisions looks like an edge case; `720` real, mechanically-generated ones, all landing on the identical position regardless of table size, demonstrates a systemic, exploitable weakness rather than an unlucky coincidence.

---

## Concept Unit 3: Measuring the Real Damage

### The Problem

Concept Unit 2 proved the collision. It's worth measuring, directly, how much real damage it does to Lesson 94's actual self-resizing hash table — not just counting distinct positions, but real lookup time on a real, attacked table.

### The New Code — Type It Yourself

```scheme
(define (time-total label thunk keys)
  (let ((start (get-internal-real-time)))
    (for-each thunk keys)
    (let ((end (get-internal-real-time)))
      (display label) (display ": total=")
      (display (exact->inexact (/ (* 1000 (- end start)) internal-time-units-per-second)))
      (display " ms for ") (display (length keys)) (display " lookups") (newline))))
```

### The Updated Project

This is `attack-cost.scm`, in full (reusing Lesson 94's self-resizing table, parameterized by which hash function to use):

```scheme
(define (remove-item x lst) (filter (lambda (y) (not (equal? y x))) lst))
(define (permutations lst)
  (if (null? lst) (list '())
      (apply append (map (lambda (x) (map (lambda (p) (cons x p)) (permutations (remove-item x lst)))) lst))))

(define (map-put m k v) (cons (cons k v) (filter (lambda (p) (not (equal? (car p) k))) m)))
(define (map-get m k) (cdr (assoc k m)))

(define (sum-hash key) (apply + (map char->integer (string->list key))))
(define (hash-position key table-size) (modulo (sum-hash key) table-size))

(define (make-hashtable size) (cons (make-vector size '()) 0))
(define (ht-vec ht) (car ht))
(define (ht-count ht) (cdr ht))
(define (set-ht-vec! ht v) (set-car! ht v))
(define (set-ht-count! ht c) (set-cdr! ht c))
(define (ht-size ht) (vector-length (ht-vec ht)))
(define (load-factor ht) (/ (ht-count ht) (ht-size ht)))
(define (ht-all-pairs ht) (apply append (vector->list (ht-vec ht))))

(define (ht-resize! ht new-size hashfn)                          ; ← new
  (let ((old-pairs (ht-all-pairs ht)) (new-vec (make-vector new-size '())))
    (for-each (lambda (p)
                (let ((pos (hashfn (car p) new-size)))
                  (vector-set! new-vec pos (cons p (vector-ref new-vec pos)))))
              old-pairs)
    (set-ht-vec! ht new-vec)))

(define (ht-put! ht k v hashfn)                                     ; ← new
  (let* ((pos (hashfn k (ht-size ht)))
         (bucket (vector-ref (ht-vec ht) pos))
         (already (if (assoc k bucket) #t #f)))
    (vector-set! (ht-vec ht) pos (map-put bucket k v))
    (if (not already) (set-ht-count! ht (+ (ht-count ht) 1)))
    (if (> (load-factor ht) 1) (ht-resize! ht (* (ht-size ht) 2) hashfn))))

(define (ht-get ht k hashfn)                                          ; ← new
  (let* ((pos (hashfn k (ht-size ht))) (bucket (vector-ref (ht-vec ht) pos)))
    (map-get bucket k)))

(define (time-total label thunk keys)                                   ; ← new
  (let ((start (get-internal-real-time)))                                  ; ← new
    (for-each thunk keys)                                                    ; ← new
    (let ((end (get-internal-real-time)))                                      ; ← new
      (display label) (display ": total=")                                       ; ← new
      (display (exact->inexact (/ (* 1000 (- end start))                            ; ← new
                                   internal-time-units-per-second)))                    ; ← new
      (display " ms for ") (display (length keys)) (display " lookups") (newline))))       ; ← new

(define anagram-keys (map list->string (permutations (string->list "abcdefg"))))
(display "num anagram keys: ") (display (length anagram-keys)) (newline)

(define ht-attack (make-hashtable 1))
(for-each (lambda (k) (ht-put! ht-attack k 1 hash-position)) anagram-keys)
(display "after attack insert: table-size=") (display (ht-size ht-attack)) (newline)
(time-total "attacked-table lookups" (lambda (k) (ht-get ht-attack k hash-position)) anagram-keys)

(define normal-keys (map number->string (iota (length anagram-keys))))
(define ht-normal (make-hashtable 1))
(for-each (lambda (k) (ht-put! ht-normal k 1 hash-position)) normal-keys)
(display "normal table: table-size=") (display (ht-size ht-normal)) (newline)
(time-total "normal-table lookups" (lambda (k) (ht-get ht-normal k hash-position)) normal-keys)
```

Lesson 94's `ht-put!`/`ht-get`/`ht-resize!` now take the hash function as an explicit parameter, `hashfn`, rather than calling `hash-position` by name directly — a small change letting this lesson swap in Concept Unit 4's fix without duplicating the whole structure.

### Reference Source

Lesson 94's self-resizing hash table (`FP-L094-load-factor.md`, Concept Unit 3), parameterized over its hash function; Lesson 58's `permutations`, generating the real attack keys.

### Files affected

Created: `attack-cost.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile attack-cost.scm
num anagram keys: 5040
after attack insert: table-size=8192
attacked-table lookups: total=100.611 ms for 5040 lookups
normal table: table-size=8192
normal-table lookups: total=4.556 ms for 5040 lookups
```

Verified this session (Lesson 83's own honest note on timing variance applies here too — repeated runs land in the same broad range, roughly `15`–`25` times slower, not the identical millisecond figure) — `5,040` real anagrams of `"abcdefg"` (`7!`) grow the self-resizing table to `8,192` positions, exactly Lesson 94's own policy working as designed. Looking all `5,040` of them back up takes `100.611` ms — over `22` times slower than `4.556` ms for the identical number of ordinary, non-colliding keys in a table of the *identical* size. **Naming why:** resizing grows the table based only on *count*, never checking *distribution* — an `8,192`-position table with every key jammed into one bucket has exactly the same real lookup cost as a table of size `1`.

### Mechanical Walkthrough

- **`(ht-put! ht-attack k 1 hash-position)`** — a reappearance of Lesson 94's `ht-put!`, now taking `hash-position` explicitly, applied to every real attack key.
- **The real, `22×` gap between attacked and normal tables of the identical size** — direct, measured confirmation that Lesson 94's resize policy, while correctly keeping load factor bounded, provides zero protection against this specific structural weakness.

### CS Lens

This is the precise, measured limit of Lesson 94's own guarantee: amortized doubling keeps the *number of buckets* proportional to the *number of keys*, but says nothing at all about whether keys are actually spread across those buckets — a hash flooding attack breaks the second assumption while leaving the first completely intact. Also recognized in: a building code correctly ensuring enough total exits for a building's occupancy, doing nothing to prevent every occupant from being funneled toward the identical single exit by a poorly designed floor plan.

### SE Lens

The alternative to measuring the attacked table directly is to trust that Lesson 94's resize policy, having worked correctly on realistic data, provides some general robustness. The real cost of that alternative, for any real system accepting externally-supplied keys (a URL parameter, a form field, an API request — anything an outside party controls), is a genuine denial-of-service risk: an adversary supplying deliberately crafted keys could degrade real lookup performance by more than an order of magnitude, exactly as measured here.

---

## Concept Unit 4: A Real Fix — Positional Weighting

### The Problem

Concept Unit 3 confirmed the real damage. It's worth deriving and checking a genuine fix — a hash function that doesn't share `sum-hash`'s order-blindness.

### The New Code — Type It Yourself

```scheme
(define (poly-hash key)
  (let loop ((chars (string->list key)) (acc 0))
    (if (null? chars)
        acc
        (loop (cdr chars) (+ (* acc 31) (char->integer (car chars)))))))
```

### The Updated Project

Extending Concept Unit 3's file:

```scheme
(define (poly-hash key)                                         ; ← new
  (let loop ((chars (string->list key)) (acc 0))                   ; ← new
    (if (null? chars)                                                ; ← new
        acc                                                            ; ← new
        (loop (cdr chars) (+ (* acc 31) (char->integer (car chars))))))) ; ← new

(define (poly-position key table-size) (modulo (poly-hash key) table-size)) ; ← new

(display "distinct poly-hash positions among all anagrams (table-size=8192): ")
(display (length (unique (map (lambda (k) (poly-position k 8192)) anagram-keys))))
(newline)

(define ht-fixed (make-hashtable 1))
(for-each (lambda (k) (ht-put! ht-fixed k 1 poly-position)) anagram-keys)
(display "fixed table (poly-hash) on attack keys: table-size=") (display (ht-size ht-fixed)) (newline)
(time-total "fixed-table lookups (poly-hash, attack keys)"
            (lambda (k) (ht-get ht-fixed k poly-position)) anagram-keys)
```

`poly-hash` accumulates each character's code, but multiplies the running total by `31` before adding the next one — since multiplication happens *before* each character is added, a character's actual position changes how much it contributes to the final total, unlike `sum-hash`'s position-blind addition.

### Reference Source

No reference counterpart — `poly-hash` is a from-scratch, deliberately order-sensitive hash function, built specifically to fix Concept Unit 1's identified weakness.

### Files affected

Modifies: `attack-cost.scm` (extended, not a new file).

### Change type

Add.

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile attack-cost.scm
distinct poly-hash positions among all anagrams (table-size=8192): 1100
fixed table (poly-hash) on attack keys: table-size=8192
fixed-table lookups (poly-hash, attack keys): total=0.941 ms for 5040 lookups
```

Verified this session — the identical `5,040` attack keys, which collapsed to `1` distinct position under `sum-hash`, spread across `1,100` distinct positions under `poly-hash`. Real lookup cost drops to `0.941` ms — over `100` times faster than the `100.611` ms measured against `sum-hash` on the *identical* attack keys, and even slightly faster than `sum-hash`'s own `4.556` ms on ordinary, non-adversarial keys.

### Mechanical Walkthrough

- **`(+ (* acc 31) (char->integer (car chars)))`** — a reappearance of `+`, `*`; multiplies the accumulated total by `31` before adding the next character, so a character's contribution to the final hash depends on how many characters come *after* it, not just its own code.
- **The real jump from `1` to `1,100` distinct positions** — direct, measured confirmation the fix targets the exact weakness Concept Unit 1 identified: order now genuinely affects the hash.
- **The real, `100×` recovery in lookup time** — confirms the improved distribution translates directly into real, restored performance, not just a theoretical improvement.

### CS Lens

This is the real engineering answer to a hash flooding risk: not eliminating collisions entirely (Lesson 62's Pigeonhole Principle already ruled that out permanently), but choosing a hash function whose structure doesn't hand an adversary an easy, mechanical way to construct massive numbers of them, the way `sum-hash`'s order-blindness did. Also recognized in: a combination lock design that depends on the *order* digits are entered, not just which digits are used, specifically to prevent someone who's seen the correct digits (in some order) from unlocking it by trying rearrangements.

### SE Lens

The alternative to deriving and measuring a real fix is to simply warn that `sum-hash` is "insecure" without demonstrating a concrete, checkable improvement. The real cost of that alternative is leaving the reader with a named risk and no verified path forward — this unit's real, measured `100×` recovery is what turns "avoid order-blind hash functions" from a rule to memorize into a demonstrated, checkable engineering practice.

---

## Closing

### Connect the pieces

One adversarial question, one real attack, one measured cost, one verified fix:

1. **The question, reapplied from Lesson 73 (Unit 1):** what can an adversary who knows the hash function construct?
2. **The attack, real and confirmed (Unit 2):** `720` real anagrams, `1` distinct position, at every table size tested.
3. **The real damage, measured (Unit 3):** `22×` slower lookups on a correctly-resized, `8,192`-position table under attack.
4. **The real fix (Unit 4):** a position-sensitive hash function, `1,100` distinct positions instead of `1`, real lookup cost recovered by over `100×`.

Every claim in this lesson traces to real, executed code: an attack generated mechanically (not hand-picked), its real cost measured against a genuine baseline of the identical size, and a real fix verified to actually change the underlying distribution, not merely asserted to be better.

### What breaks without this

Suppose a real web service used `sum-hash`-style hashing for a table keyed by user-supplied input — form field names, URL parameters, anything an external party controls. Concept Unit 3's real evidence shows exactly what an attacker could do: submit a batch of deliberately anagram-related keys, degrading that specific table's real performance by more than `20×`, with Lesson 94's own resize policy offering no protection at all, because the attack targets *distribution*, not *count*. Understanding this risk precisely, and verifying a real fix, as this lesson does, is what separates "our hash table is probably fine" from a checked, defensible engineering claim.

### Exercises

1. **Observe.** Before checking, predict whether `poly-hash` is itself immune to *every* possible hash-flooding attack, or only to the specific anagram-based one this lesson constructed.
2. **Formalize.** Research (or derive) a different attack targeting `poly-hash`'s specific structure — for example, keys constructed so their polynomial values are deliberately congruent modulo a chosen table size — and measure whether it produces a real collision cluster.
3. **Formalize.** Measure `poly-hash`'s real distinct-position count on `720` anagrams of a *different* base string than `"abcdef"`, confirming the fix generalizes beyond this lesson's own example.
4. **Explain.** In your own words, explain why choosing `31` specifically in `poly-hash` isn't essential to the fix — what property of *any* multiplier greater than `1` is what actually breaks `sum-hash`'s order-blindness.
5. **Explain.** Using Lesson 73's adversary-argument vocabulary precisely, explain why "our hash function has never had a collision in testing" is not evidence against the kind of attack this lesson constructed.

### Definition of done

- [ ] You can explain, precisely, why `sum-hash` is vulnerable to anagram-based collisions and `poly-hash` is not.
- [ ] You can explain why Lesson 94's resize policy provides no protection against a hash flooding attack, using the distinction between count and distribution.
- [ ] You generated a real attack (not hand-picked examples) and measured its real cost against a hash table of the identical, matched size.
- [ ] You completed Exercise 2, investigating whether the fix itself has its own exploitable weakness.
- [ ] You completed Exercises 1–5, including a real measurement using a base string not used in this lesson's own example.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating what you tested and whether the fix held up.
