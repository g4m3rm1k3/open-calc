# Lesson 94: Load Factor

**What you will build:** a real measurement of hash table lookup cost across five genuinely different **load factors** — the precise name for the table-size-versus-occupancy ratio Lesson 93 only tested at its two extremes — followed by a real, self-resizing hash table that keeps load factor bounded automatically, the same amortized-doubling technique Lesson 86 used for dynamic arrays, applied here to an entirely different structure. Real, verified evidence this session: average lookup cost stays nearly flat, `0.0010`–`0.0015` ms, across load factors `1` through `100`, then climbs to `0.0046` ms at load factor `1,000` and `0.0224` ms at load factor `5,000` — real, measured confirmation that cost tracks load factor, not table size or key count alone. A hash table that doubles its own size whenever load factor exceeds `1` keeps every one of `100,000` real insertions to a total of `131,088` rehash operations — a bounded ratio to `n`, matching Lesson 86's own dynamic array numbers almost exactly, in a completely different structure.

**What you need to know first:** Lesson 93 (`FP-L093-hash-tables.md`) — specifically the real chained hash table, extended directly here with automatic resizing. Lesson 86 (`FP-L086-dynamic-arrays.md`) — specifically amortized doubling, reapplied to a genuinely different mechanism (rehashing, not copying). Lesson 74 (`FP-L074-worst-average-best-case.md`) — specifically average-case cost, the precise sense in which this lesson's lookup measurements are taken.

**Terms introduced in this lesson**

- **Load factor** — the ratio of stored elements to table size (`n / table-size`) in a hash table. It exists to give Lesson 93's informal "how full is the table" a precise, checkable number, directly predicting average bucket size and, this lesson shows, average lookup cost.

---

## Concept Unit 1: Measuring the Full Curve, Not Just the Extremes

### The Problem

Lesson 93 measured exactly two situations: a reasonably sized table (real, dramatic speedup) and an artificially tiny one (real, dramatic slowdown). It never measured what happens *between* those extremes, or found where, precisely, cost starts climbing.

### The New Code — Type It Yourself

```scheme
(define (load-factor ht) (/ (ht-count ht) (ht-size ht)))
```

### The Updated Project

This is `load-factor-check.scm`, in full:

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

(define (make-hashtable-from-range n table-size)
  (let ((ht (make-hashtable table-size)))
    (let loop ((i 0)) (if (< i n) (begin (ht-put! ht (number->string i) i) (loop (+ i 1)))))
    ht))

(define n 5000)
(define all-keys (map number->string (iota n)))

(define (time-avg label thunk keys)                             ; ← new
  (let ((start (get-internal-real-time)))                          ; ← new
    (for-each thunk keys)                                            ; ← new
    (let ((end (get-internal-real-time)))                              ; ← new
      (display label) (display ": avg=")                                 ; ← new
      (display (exact->inexact (/ (* 1000 (- end start))                    ; ← new
                                   internal-time-units-per-second               ; ← new
                                   (length keys))))                               ; ← new
      (display " ms/lookup")                                                        ; ← new
      (newline))))                                                                    ; ← new

(for-each
 (lambda (table-size)
   (let ((ht (make-hashtable-from-range n table-size)))
     (display "table-size=") (display table-size)
     (display " load-factor=") (display (exact->inexact (/ n table-size)))
     (display " ")
     (time-avg "avg-lookup" (lambda (k) (ht-get ht k)) all-keys)))
 (list 5000 500 50 5 1))
```

Unlike Lesson 93's single-key timing checks, this unit times looking up *every one* of the `5,000` stored keys and divides by `5,000` — a real, direct measurement of Lesson 74's own average-case cost, not one key's individual result.

### Reference Source

Lesson 93's `make-hashtable`/`ht-put!`/`ht-get` (`FP-L093-hash-tables.md`, Concept Unit 3), reused unchanged; `time-avg` extends Lesson 83's timing technique to measure a genuine average across many operations at once.

### Files affected

Created: `load-factor-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile load-factor-check.scm
table-size=5000 load-factor=1.0 avg-lookup: avg=0.0010136 ms/lookup
table-size=500 load-factor=10.0 avg-lookup: avg=0.001111 ms/lookup
table-size=50 load-factor=100.0 avg-lookup: avg=0.0014788 ms/lookup
table-size=5 load-factor=1000.0 avg-lookup: avg=0.0045798 ms/lookup
table-size=1 load-factor=5000.0 avg-lookup: avg=0.0223644 ms/lookup
```

Verified this session (Lesson 83's timing-variance note applies here too) — average lookup cost stays nearly flat across load factors `1` through `100` (`0.0010`–`0.0015` ms, dominated by fixed overhead — computing the hash itself, not scanning a bucket), then climbs clearly: roughly `3×` from load factor `100` to `1,000`, and almost exactly `5×` from `1,000` to `5,000` — tracking the `5×` increase in load factor itself closely. **Naming why:** average bucket size *is* load factor, by definition (`n` keys spread across `table-size` buckets averages `n / table-size` per bucket) — once a bucket's own size grows large enough to dominate over fixed overhead, cost tracks it directly.

### Mechanical Walkthrough

- **`(for-each thunk keys)`** inside `time-avg` — a reappearance of `for-each`; runs the timed operation once per key, rather than Lesson 93's single-call timing.
- **`(/ ... (length keys))`** — a reappearance of `/`, `length`; divides total time by the number of operations performed, producing a genuine per-operation average.
- **The real, flat-then-climbing pattern across five load factors** — direct, measured evidence connecting a precise number (load factor) to a precise, real cost curve, not just two disconnected extremes.

### CS Lens

This is Lesson 74's average-case cost measured as a genuine function of one clean, named variable — load factor — rather than left as "depends on the table," the same shift from vague to precise Lesson 71 made for growth rate itself. Also recognized in: a restaurant's real average wait time tracked against table occupancy percentage specifically, rather than only comparing "busy night" to "quiet night" as two disconnected extremes.

### SE Lens

The alternative to measuring the full curve is to test only a comfortable load factor during development and never learn where cost actually starts climbing. The real cost of that alternative is exactly what Concept Unit 3 and 4 exist to prevent: without knowing the shape of this curve, there's no principled way to decide *when* a hash table needs to grow to stay fast — only trial and error after a slowdown is already noticed.

---

## Concept Unit 2: Deriving a Resize Policy

### The Problem

Concept Unit 1 found real numbers but no rule. It's worth deriving, precisely, at what load factor a table should grow — and what "grow" should actually mean given Lesson 92's hash function depends on `table-size` directly.

### No isolated lab for this step

This concept has no code of its own to isolate — the derivation is stated directly below, building on Lesson 86's own doubling reasoning.

### Applying It — Why Growing Requires Rehashing, Not Just Copying

Lesson 86's dynamic array, when full, allocated a bigger array and *copied* every element to the identical relative position. A hash table can't do that: `hash-position`'s own `modulo table-size` means a key's correct bucket *depends on* `table-size` — doubling the table without recomputing every key's position would leave most keys in the wrong bucket for the new size. Growing a hash table means allocating a larger array **and rehashing every existing key** into its newly correct position — genuinely more work per resize than Lesson 86's array ever needed, though Concept Unit 4 shows the *amortized* picture stays just as good.

**The threshold, chosen directly from Concept Unit 1's real evidence:** resizing whenever load factor exceeds `1` keeps average bucket size at or below `1` at all times — squarely inside the flat, cheap region Concept Unit 1 measured (load factors `1` through `100` all stayed near the fixed-overhead floor).

### Walkthrough

- **The precise reason copying alone doesn't work here** — `modulo table-size`'s own dependence on the size being changed, a structural difference from Lesson 86's array that copying never had to account for.
- **The threshold choice, tied directly to Concept Unit 1's own real curve** — not an arbitrary constant, a number chosen from measured evidence.

### CS Lens

This is Lesson 86's amortized-doubling idea, applied to a structure where growing is more expensive per event (a full rehash, not a plain copy) but no less amortized-cheap overall, because the identical geometric-doubling argument (Lesson 65) still bounds the total work across a whole sequence of insertions. Also recognized in: a company reorganizing its entire filing system (not just adding more cabinets) every time it outgrows its current scheme, because the old filing *rule* itself depended on the old size.

### SE Lens

The alternative to resizing based on load factor is to pick a table size once, in advance, and never revisit it — Lesson 93's own two examples, `1,000` and `1`, both fixed forever. The real cost of that alternative, as Concept Unit 1 measured, is a hash table that starts fast and silently degrades as real data grows past whatever size was originally guessed. Deriving a real resize policy, as this unit does, is what makes a hash table's `O(1)` average promise durable as `n` grows, not just true at whatever size it happened to be built for.

---

## Concept Unit 3: Building a Self-Resizing Hash Table

### The Problem

Concept Unit 2's policy needs real code: a hash table that checks its own load factor after every insertion and rehashes into a bigger table automatically when needed.

### The New Code — Type It Yourself

```scheme
(define (ht-resize! ht new-size)
  (let ((old-pairs (ht-all-pairs ht))
        (new-vec (make-vector new-size '())))
    (for-each (lambda (p)
                (let ((pos (hash-position (car p) new-size)))
                  (vector-set! new-vec pos (cons p (vector-ref new-vec pos)))))
              old-pairs)
    (set-ht-vec! ht new-vec)))
```

### The Updated Project

This is `resize-check.scm`, in full:

```scheme
(define (map-put m k v)
  (cons (cons k v) (filter (lambda (p) (not (equal? (car p) k))) m)))
(define (map-get m k) (cdr (assoc k m)))

(define (sum-hash key)
  (apply + (map char->integer (string->list key))))
(define (hash-position key table-size)
  (modulo (sum-hash key) table-size))

(define (make-hashtable size) (cons (make-vector size '()) 0))    ; ← new
(define (ht-vec ht) (car ht))
(define (ht-count ht) (cdr ht))                                     ; ← new
(define (set-ht-vec! ht v) (set-car! ht v))                           ; ← new
(define (set-ht-count! ht c) (set-cdr! ht c))                           ; ← new
(define (ht-size ht) (vector-length (ht-vec ht)))                        ; ← new
(define (load-factor ht) (/ (ht-count ht) (ht-size ht)))

(define (ht-all-pairs ht)                                                    ; ← new
  (apply append (vector->list (ht-vec ht))))                                   ; ← new

(define (ht-resize! ht new-size)                                                 ; ← new
  (let ((old-pairs (ht-all-pairs ht))                                              ; ← new
        (new-vec (make-vector new-size '())))                                        ; ← new
    (for-each (lambda (p)                                                              ; ← new
                (let ((pos (hash-position (car p) new-size)))                            ; ← new
                  (vector-set! new-vec pos (cons p (vector-ref new-vec pos)))))             ; ← new
              old-pairs)                                                                     ; ← new
    (set-ht-vec! ht new-vec)))                                                                 ; ← new

(define (ht-put! ht k v)
  (let* ((pos (hash-position k (ht-size ht)))
         (bucket (vector-ref (ht-vec ht) pos))
         (already-present (if (assoc k bucket) #t #f)))
    (vector-set! (ht-vec ht) pos (map-put bucket k v))
    (if (not already-present) (set-ht-count! ht (+ (ht-count ht) 1)))
    (if (> (load-factor ht) 1)
        (ht-resize! ht (* (ht-size ht) 2)))))

(define (ht-get ht k)
  (let* ((pos (hash-position k (ht-size ht)))
         (bucket (vector-ref (ht-vec ht) pos)))
    (map-get bucket k)))

(define ht (make-hashtable 1))
(let loop ((i 0)) (if (< i 1000) (begin (ht-put! ht (number->string i) i) (loop (+ i 1)))))
(display "after 1000 inserts starting from size 1: table-size=") (display (ht-size ht))
(display " load-factor=") (display (exact->inexact (load-factor ht)))
(newline)
(display "get \"500\": ") (display (ht-get ht "500")) (newline)
(display "get \"0\": ") (display (ht-get ht "0")) (newline)
(display "get \"999\": ") (display (ht-get ht "999")) (newline)
```

The hash table itself is now a mutable `(vector . count)` pair, tracking real occupancy alongside its buckets. `ht-put!` checks `load-factor` after every insertion and resizes — doubling the table and rehashing every pair — the moment it would exceed `1`.

### Reference Source

Lesson 93's `map-put`/`map-get`/`hash-position` (`FP-L093-hash-tables.md`, `FP-L092-hashing.md`), reused unchanged; the mutable, self-resizing container is new, extending Lesson 93's fixed-size table with Lesson 87-style mutation.

### Files affected

Created: `resize-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile resize-check.scm
after 1000 inserts starting from size 1: table-size=1024 load-factor=0.9765625
get "500": 500
get "0": 0
get "999": 999
```

Verified this session — starting from a table of size `1` and inserting `1,000` keys, the table automatically grew, doubling repeatedly, to size `1,024` — the smallest power of `2` keeping load factor at or below `1` for `1,000` real entries — and every key checked (`"500"`, `"0"`, and `"999"`, inserted at the very start, middle, and end of the process, across multiple resizes) is still correctly retrievable.

### Mechanical Walkthrough

- **`(cons (make-vector size '()) 0)`** — a reappearance of `cons`, `make-vector`; the table starts with `0` real entries tracked alongside its bucket array.
- **`(set-ht-vec! ht v)` / `(set-ht-count! ht c)`** — a reappearance of `set-car!`/`set-cdr!` (Lesson 87); the table's own bucket array and count both become mutable fields, exactly Lesson 90's deque-container pattern reapplied.
- **`(ht-all-pairs ht)`** — first appearance of `apply append` used to flatten a vector-of-lists into one plain list: gathers every key-value pair currently stored, regardless of which bucket it's in, as the raw material for rehashing.
- **`(hash-position (car p) new-size)`** — a reappearance of `hash-position`; recomputed for the *new* size, exactly the step Concept Unit 2 identified as necessary and different from Lesson 86's plain copy.
- **`(if (> (load-factor ht) 1) (ht-resize! ht (* (ht-size ht) 2)))`** — a reappearance of `if`, `>`, `*`; Concept Unit 2's threshold, checked after every single insertion.
- **The real, correct retrieval of keys inserted before, during, and after multiple resizes** — direct, checked confirmation that resizing preserves every previously-stored key correctly.

### CS Lens

This is Lesson 87's mutation lesson and Lesson 86's amortized-doubling lesson combined in one real structure: the table's own identity (which array it currently uses) changes via mutation, exactly as needed for every existing reference to the table to see the resized version automatically, without any calling code needing to know a resize even happened. Also recognized in: a company's phone directory automatically reprinted and redistributed once it outgrows its current binder, with everyone continuing to use "the directory" as a single, stable concept despite its physical form changing entirely underneath.

### SE Lens

The alternative to mutating the table's own container is to have `ht-resize!` return a *new* table, requiring every caller to remember to use the returned value — exactly Lesson 86 and 89's own immutable style. The real cost of that alternative here is a real risk: a caller holding an old reference after a resize would silently keep using a stale, no-longer-growing table. Making the table itself mutable, as this unit does, is a deliberate trade-off favoring safety against exactly that mistake, at the cost of the aliasing risks Lesson 87 named honestly.

---

## Concept Unit 4: Confirming the Amortized Cost, Again

### The Problem

Concept Unit 3's resizing works correctly. It's worth confirming its *cost* stays amortized-cheap, the way Lesson 86 confirmed for arrays — not assuming the identical doubling argument transfers automatically just because the code looks similar.

### The New Code — Type It Yourself

```scheme
(define rehashes 0)
```

### The Updated Project

Extending Concept Unit 3's file, instrumenting `ht-resize!` to count real rehash operations:

```scheme
(define rehashes 0)                                             ; ← new

(define (ht-resize! ht new-size)
  (let ((old-pairs (ht-all-pairs ht))
        (new-vec (make-vector new-size '())))
    (for-each (lambda (p)
                (set! rehashes (+ rehashes 1))                     ; ← new
                (let ((pos (hash-position (car p) new-size)))
                  (vector-set! new-vec pos (cons p (vector-ref new-vec pos)))))
              old-pairs)
    (set-ht-vec! ht new-vec)))

(for-each
 (lambda (n)
   (set! rehashes 0)
   (let ((ht2 (make-hashtable 1)))
     (let loop ((i 0)) (if (< i n) (begin (ht-put! ht2 (number->string i) i) (loop (+ i 1)))))
     (display "n=") (display n) (display " total-rehash-operations=") (display rehashes)
     (display " ratio-to-n=") (display (exact->inexact (/ rehashes n)))
     (newline)))
 (list 1000 10000 100000))
```

### Reference Source

No reference counterpart — reuses Concept Unit 3's own structure with Lesson 31-style counting added to `ht-resize!`.

### Files affected

Created: `resize-cost.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile resize-cost.scm
n=1000 total-rehash-operations=1033 ratio-to-n=1.033
n=10000 total-rehash-operations=16397 ratio-to-n=1.6397
n=100000 total-rehash-operations=131088 ratio-to-n=1.31088
```

Verified this session — total rehash operations across `n` insertions stay proportional to `n`, the ratio bounded between roughly `1` and `1.7` at every scale, *not* growing without bound. **Comparing directly to Lesson 86's own real numbers** (`1.5`, `1.27`, `1.023`, `1.6383`, `1.31071`, at matching scales): the two ratio sequences land in the identical range, because both are governed by the identical geometric-doubling mathematics (Lesson 65) — only the thing being moved at each doubling differs (whole array elements there, key-value pairs here).

### Mechanical Walkthrough

- **`(set! rehashes (+ rehashes 1))`** — a reappearance of `set!`; counts every individual pair moved during any resize, across the entire sequence of insertions.
- **The real, bounded ratio at every scale, matching Lesson 86's pattern** — direct, measured confirmation that this lesson's more expensive per-resize cost (a full rehash, not a plain copy) still amortizes exactly as cheaply as Lesson 86's simpler case, because the *number* of resizes and the *total* elements moved are governed by the identical doubling structure, regardless of what "moving one element" actually costs.

### CS Lens

This is the generality of amortized analysis demonstrated directly: the identical mathematical argument (geometric doubling means total work across all resizes stays proportional to final size) applies unchanged to a structure where the cost of a resize is qualitatively different — full rehashing instead of plain copying — because the argument never depended on *what* was being moved, only on *how often* moves happen and how their sizes compound. Also recognized in: the identical compound-interest mathematics applying equally to a savings account and a population growth model, despite one being about money and the other about organisms.

### SE Lens

The alternative to re-measuring the amortized cost here is to assume it transfers automatically from Lesson 86's dynamic array result, since the doubling code looks structurally similar. The real cost of that alternative is exactly this curriculum's standing concern since Lesson 22: an assumption, however reasonable, is not the same as a checked fact — rehashing genuinely does more work per resize than copying, and confirming the *total*, summed cost still stays bounded, as this unit does, is what turns "should still be amortized `O(1)`" into "measured, and it is."

---

## Closing

### Connect the pieces

One precise number, one real curve, one derived policy, and its amortized cost confirmed a second time:

1. **The full curve, measured (Unit 1):** flat near `0.001` ms through load factor `100`, climbing to `0.022` ms by load factor `5,000`.
2. **The policy, derived (Unit 2):** resize whenever load factor exceeds `1`, and rehash — not just copy — because a hash table's bucket assignment depends on its own size.
3. **A real, self-resizing table, built (Unit 3):** growing automatically from size `1` to `1,024` across `1,000` real insertions, every key remaining correctly retrievable throughout.
4. **The amortized cost, confirmed again (Unit 4):** total rehash operations bounded proportionally to `n`, landing in the identical ratio range as Lesson 86's entirely different structure.

Every claim in this lesson traces to real, measured code: a genuine average-case curve across five load factors, a real policy derived from that curve rather than assumed, and its amortized cost independently reconfirmed rather than assumed to transfer from a structurally similar but genuinely different prior result.

### What breaks without this

Suppose a real hash table were built once, at a fixed size chosen for whatever data volume existed during initial development, with no resize policy at all — exactly Lesson 93's own two fixed examples. Concept Unit 1's real curve shows precisely what would happen as real data grew past that original size: lookup cost climbing steadily, then sharply, entirely predictable from load factor alone, but invisible to anyone who never measured the relationship this lesson just measured. Building the resize policy directly into the structure, as Concept Unit 3 does, is what keeps a hash table's real performance matching its `O(1)`-average reputation as data grows, rather than requiring a human to notice a slowdown and intervene manually.

### Exercises

1. **Observe.** Before checking, predict whether choosing a resize threshold of `0.5` instead of `1` (resizing twice as eagerly) would produce a *smaller* or *larger* total rehash count across `100,000` insertions, using Concept Unit 4's own reasoning.
2. **Formalize.** Modify the resize threshold to `0.5`, measure the real total rehash count at `n = 100,000`, and confirm or correct your Exercise 1 prediction.
3. **Formalize.** Measure real average lookup cost, using Concept Unit 1's `time-avg` technique, on the self-resizing table from Concept Unit 3 at `n = 5,000`, `50,000`, and `500,000`, and confirm it stays within the flat, low-load-factor region Concept Unit 1 identified.
4. **Explain.** In your own words, explain why `ht-resize!` needs `hash-position`'s *new* `table-size` for every rehashed pair, rather than being able to reuse each pair's already-computed old position in any way.
5. **Explain.** Using this lesson's real ratio comparison to Lesson 86, explain why the *specific* growth factor (doubling, versus, say, growing by `50%` each time) matters for keeping amortized cost bounded, referencing Lesson 65's geometric series reasoning.

### Definition of done

- [ ] You can define load factor precisely and explain why it predicts average lookup cost.
- [ ] You can explain why growing a hash table requires rehashing, not just copying, unlike Lesson 86's dynamic array.
- [ ] You can trace `ht-put!`'s resize check and explain exactly when and why a resize is triggered.
- [ ] You confirmed, with real measured numbers, that this lesson's rehashing cost is amortized-bounded, not just assumed to be from Lesson 86's similar-looking result.
- [ ] You completed Exercises 1–5, including a real measurement using a resize threshold other than `1`.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating the threshold or scale you tested and its real, measured results.
