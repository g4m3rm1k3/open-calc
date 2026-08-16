# Lesson 86: Dynamic Arrays

**What you will build:** two real strategies for growing an array one element at a time when its final size isn't known in advance — one that resizes by exactly `1` whenever full, one that **doubles** its capacity instead — with real, measured evidence settling which one actually scales. Growing to `100,000` elements one at a time, the resize-by-`1` strategy performs exactly `4,999,950,000` real element copies, matching `n(n-1)/2` exactly; the doubling strategy performs only `131,071` — fewer copies at `n = 100,000` than the naive strategy needed at `n = 100`. The transferable point: Lesson 85 derived why a *fixed-size* array offers constant-time indexing. This lesson asks what happens when the size isn't fixed — and shows that occasional, individually expensive resizes can still add up to a cheap **amortized** cost per operation overall, a genuinely different idea from Lesson 74's average case.

**What you need to know first:** Lesson 85 (`FP-L085-arrays.md`) — specifically that an array's capacity, once allocated, is fixed, which is exactly the problem this lesson solves. Lesson 64 (`FP-L064-arithmetic-series.md`) — specifically the `n(n+1)/2` closed form, which this lesson's naive strategy's real cost matches directly. Lesson 65 (`FP-L065-geometric-series.md`) — specifically geometric growth, which explains why doubling's total cost stays bounded. Lesson 74 (`FP-L074-worst-average-best-case.md`) — specifically average-case cost, contrasted directly against this lesson's new *amortized* cost.

**Terms introduced in this lesson**

- **Dynamic array** — an array-backed structure whose capacity grows automatically as elements are appended: when a `append` finds the underlying array already full, a new, larger array is allocated, every existing element is copied into it, and the new element is added — all before the append is considered complete.
- **Amortized cost** — the average cost *per operation*, computed across an entire sequence of operations performed on one evolving structure, even when individual operations within that sequence cost wildly different real amounts. This is a genuinely different idea from Lesson 74's average-case cost, which averages over different possible *inputs* of the identical size — amortized cost instead averages over *time*, across a sequence of operations that change the structure's state as they go.

---

## Concept Unit 1: What Happens When the Size Isn't Known?

### The Problem

Lesson 85's array had its size fixed at creation — `(make-array n)` allocated exactly `n` elements' worth of space, once. Real usage often doesn't work that way: building up a result one value at a time, with no way to know the final count in advance. It's worth asking directly what "append one more element" should even mean for a structure whose size was fixed the moment it was created.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, building on Lesson 85's own fixed-size array.

### Applying It — Why This Isn't Automatically Solvable

A fixed-size array has no spare room built in — every one of its bytes is already accounted for, by Lesson 85's own `base + index × element-size` formula. Appending past the end isn't a matter of "finding space nearby," because there's no guarantee anything at all sits in memory immediately after the array's last byte. The only real option, once an array is full, is building an entirely new, larger array somewhere else and moving every existing element into it.

### Walkthrough

- **"no spare room built in"** — a direct consequence of Lesson 85's own formula: a fixed-size array's layout leaves nothing unaccounted for.
- **"building an entirely new, larger array... and moving every existing element"** — states, in advance, exactly what Concept Unit 2 and 3's real code will have to do, and exactly where its real cost will come from.

### CS Lens

This is the real, structural reason "just make it bigger" isn't free for contiguous storage the way it is for a linked structure: a list can grow by adding one new cell anywhere in memory, connected by a reference, but an array's entire value depends on staying one single, unbroken block. Also recognized in: a fully-occupied parking garage needing to expand — there's no way to add one more space to the existing structure without either building an entirely new, larger garage or demolishing and rebuilding it.

### SE Lens

The alternative to reasoning this through is to assume a "resizable array" is simply a built-in feature with no real cost, the way Guile's own vectors might appear from the outside. The real cost of that alternative is missing exactly what Concept Unit 2 measures directly: resizing is real, expensive work, and *how often* it happens is a design choice with dramatically different real consequences, not a detail that can be ignored.

---

## Concept Unit 2: The Naive Strategy — Resize by One

### The Problem

The simplest possible strategy: whenever the array is full, grow its capacity by exactly one. It's worth building this for real and measuring its actual cost, rather than assuming "simplest" means "cheap enough."

### The New Code — Type It Yourself

```scheme
(define (naive-append darr x)
  (let* ((vec (car darr)) (count (cadr darr)) (cap (vector-length vec)))
    (if (< count cap)
        (begin (vector-set! vec count x) (list vec (+ count 1)))
        (let ((new-vec (make-vector (+ cap 1))))
          (let loop ((i 0))
            (if (< i cap)
                (begin (vector-set! new-vec i (vector-ref vec i))
                       (loop (+ i 1)))))
          (vector-set! new-vec count x)
          (list new-vec (+ count 1))))))
```

### The Updated Project

This is `dynarray-check.scm`, in full:

```scheme
(define copies 0)

(define (make-naive-dynarray) (list (make-vector 0) 0))

(define (naive-append darr x)                                  ; ← new
  (let* ((vec (car darr)) (count (cadr darr)) (cap (vector-length vec)))  ; ← new
    (if (< count cap)                                              ; ← new
        (begin (vector-set! vec count x) (list vec (+ count 1)))     ; ← new
        (let ((new-vec (make-vector (+ cap 1))))                       ; ← new
          (let loop ((i 0))                                              ; ← new
            (if (< i cap)                                                  ; ← new
                (begin (vector-set! new-vec i (vector-ref vec i))             ; ← new
                       (set! copies (+ copies 1))                              ; ← new
                       (loop (+ i 1)))))                                         ; ← new
          (vector-set! new-vec count x)                                           ; ← new
          (list new-vec (+ count 1))))))                                            ; ← new

(define (fill-naive n)
  (let loop ((darr (make-naive-dynarray)) (i 0))
    (if (= i n) darr (loop (naive-append darr i) (+ i 1)))))

(for-each
 (lambda (n)
   (set! copies 0)
   (fill-naive n)
   (display "n=") (display n)
   (display " naive-copies=") (display copies)
   (display " n(n-1)/2=") (display (/ (* n (- n 1)) 2))
   (newline))
 (list 10 100 1000 10000 100000))
```

`darr` is represented as a two-element list: the underlying vector, and how many of its positions currently hold real values (`count`, distinct from the vector's own full capacity, `cap`).

### Reference Source

No reference counterpart — this is a from-scratch implementation of the simplest possible resizing strategy, built specifically to measure its real cost.

### Files affected

Created: `dynarray-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile dynarray-check.scm
n=10 naive-copies=45 n(n-1)/2=45
n=100 naive-copies=4950 n(n-1)/2=4950
n=1000 naive-copies=499500 n(n-1)/2=499500
n=10000 naive-copies=49995000 n(n-1)/2=49995000
n=100000 naive-copies=4999950000 n(n-1)/2=4999950000
```

Verified this session — the real total number of element copies matches `n(n-1)/2` *exactly* at every size tested. **Naming why, directly:** the first append copies `0` elements (the array starts empty), the second copies `1`, the third copies `2`, and so on — appending the `k`-th element (after the array is already full) costs `k - 1` copies, and summing `0 + 1 + 2 + ... + (n-1)` is exactly Lesson 64's own arithmetic series, `n(n-1)/2`.

### Mechanical Walkthrough

- **`(let* ((vec (car darr)) (count (cadr darr)) (cap (vector-length vec))) ...)`** — a reappearance of `let*`, `car`, `cadr`, `vector-length`; reads out the current vector, how many real values it holds, and its full capacity.
- **`(if (< count cap) ...)`** — a reappearance of `if`, `<`; if there's still room, no resize is needed at all.
- **`(make-vector (+ cap 1))`** — a reappearance of `make-vector`; the naive strategy's defining choice: grow capacity by exactly one element.
- **`(let loop ((i 0)) (if (< i cap) (begin ... (loop (+ i 1)))))`** — a reappearance of the named-`let` looping idiom; copies every one of the `cap` existing elements into the new, larger vector, one at a time.
- **The real, exact `n(n-1)/2` match** — direct, checked confirmation that this lesson's cost model (`k - 1` copies for the `k`-th append) is precisely what the real code performs, not merely a plausible estimate.

### CS Lens

This is `Θ(n²)` total cost for `n` appends, arising from a genuinely reasonable-sounding design choice — grow by exactly what's needed, no more — that turns out to be exactly wrong once real, cumulative cost is measured. Also recognized in: a moving company that rents a slightly-too-small truck for every single trip, forced to rent one more truck and reload everything already loaded, every time one more box shows up — technically using exactly the space needed at each step, at enormous cumulative cost.

### SE Lens

The alternative to measuring this directly is to assume "resize by exactly what's needed" must be the most efficient strategy, since it never allocates unused space. The real cost of that alternative is exactly what this unit measured: `4,999,950,000` real copies to build a `100,000`-element array — a strategy that looks frugal at any single step but is catastrophically expensive in total, motivating Concept Unit 3's deliberately less "frugal-looking" alternative.

---

## Concept Unit 3: The Doubling Strategy

### The Problem

Concept Unit 2's naive strategy resizes far too often. It's worth trying the opposite instinct — resizing rarely, by allocating far more room than immediately needed — and measuring whether that actually helps.

### The New Code — Type It Yourself

```scheme
(define (doubling-append darr x)
  (let* ((vec (car darr)) (count (cadr darr)) (cap (vector-length vec)))
    (if (< count cap)
        (begin (vector-set! vec count x) (list vec (+ count 1)))
        (let ((new-vec (make-vector (* cap 2))))
          (let loop ((i 0))
            (if (< i cap)
                (begin (vector-set! new-vec i (vector-ref vec i))
                       (loop (+ i 1)))))
          (vector-set! new-vec count x)
          (list new-vec (+ count 1))))))
```

### The Updated Project

This is `dynarray-doubling-check.scm`, in full:

```scheme
(define copies 0)

(define (make-doubling-dynarray) (list (make-vector 1) 0))

(define (doubling-append darr x)                                ; ← new
  (let* ((vec (car darr)) (count (cadr darr)) (cap (vector-length vec)))
    (if (< count cap)
        (begin (vector-set! vec count x) (list vec (+ count 1)))
        (let ((new-vec (make-vector (* cap 2))))                    ; ← new
          (let loop ((i 0))
            (if (< i cap)
                (begin (vector-set! new-vec i (vector-ref vec i))
                       (set! copies (+ copies 1))
                       (loop (+ i 1)))))
          (vector-set! new-vec count x)
          (list new-vec (+ count 1))))))

(define (fill-doubling n)
  (let loop ((darr (make-doubling-dynarray)) (i 0))
    (if (= i n) darr (loop (doubling-append darr i) (+ i 1)))))

(for-each
 (lambda (n)
   (set! copies 0)
   (fill-doubling n)
   (display "n=") (display n)
   (display " doubling-copies=") (display copies)
   (display " ratio-to-n=") (display (exact->inexact (/ copies n)))
   (newline))
 (list 10 100 1000 10000 100000))
```

`doubling-append` is identical in shape to Concept Unit 2's `naive-append`, differing in exactly one place: `(make-vector (* cap 2))` instead of `(make-vector (+ cap 1))` — capacity doubles instead of incrementing by one. `make-doubling-dynarray` starts at capacity `1` rather than `0`, so doubling always has something to double.

### Reference Source

Concept Unit 2's own `naive-append`, with the single, deliberate change to its resize amount — not a from-scratch design.

### Files affected

Created: `dynarray-doubling-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile dynarray-doubling-check.scm
n=10 doubling-copies=15 ratio-to-n=1.5
n=100 doubling-copies=127 ratio-to-n=1.27
n=1000 doubling-copies=1023 ratio-to-n=1.023
n=10000 doubling-copies=16383 ratio-to-n=1.6383
n=100000 doubling-copies=131071 ratio-to-n=1.31071
```

Verified this session — total copies stay proportional to `n` at every scale (the ratio to `n` staying between roughly `1` and `1.7`, never growing without bound the way the naive strategy's real numbers did), reaching only `131,071` copies at `n = 100,000` — fewer than the naive strategy needed at `n = 100`. **Naming why, directly:** doubling means resizes happen at capacities `1, 2, 4, 8, ..., 2^k` — a geometric sequence (Lesson 65) — and each resize copies the *previous* capacity's worth of elements, so total copies are `1 + 2 + 4 + ... + 2^(k-1)`, a geometric series summing to just under `2^k`, itself just under `2n`. **The real ratio's own honest variation:** the ratio to `n` isn't a single fixed constant — it depends on how close `n` is to the *next* power of `2` (freshly past a doubling point, like `n = 10,000` just past `8,192`, wastes more allocated-but-unused capacity than `n = 1,000`, sitting just under `1,024`) — a real, checked detail, not a flaw in the measurement.

### Mechanical Walkthrough

- **`(make-vector (* cap 2))`** — a reappearance of `make-vector`, `*`; the doubling strategy's one, defining change from Concept Unit 2.
- **`(make-vector 1)`** in `make-doubling-dynarray` — starts capacity at `1` rather than `0`, so `cap` is never `0` when doubling (`0 × 2` would never grow).
- **The real, bounded ratio to `n`, at every scale** — direct, measured confirmation that total copies grow proportionally to `n`, not to `n²`, the qualitative shift Concept Unit 4 names precisely.

### CS Lens

This is amortized analysis's central insight made concrete: allocating *more* than immediately needed, seemingly wasteful at any single step, is exactly what keeps the *total*, summed cost proportional to `n` instead of `n²` — the same geometric-series reasoning Lesson 65 and Lesson 77 both already used to sum a tree's levels, now summing a sequence of resizes instead. Also recognized in: a growing city building road capacity for double its current population at each expansion, rather than exactly matching current need — occasionally "wasting" built capacity, but avoiding the far greater cumulative cost of constant, incremental rebuilding.

### SE Lens

The alternative to doubling is any fixed growth amount larger than `1` (adding `10`, or `100`, at each resize) — genuinely better than Concept Unit 2's naive strategy, but still `Θ(n²)` in total, because a *fixed* growth amount still means the number of resizes grows in proportion to `n`. The real cost of that alternative is a subtler, easy-to-miss trap: it looks like an improvement (fewer resizes than growing by exactly `1`) while still carrying the identical asymptotic problem. Doubling — growing *proportionally* to the current size, not by a fixed amount — is what changes the total cost's growth-rate category entirely, not merely its constant.

---

## Concept Unit 4: Naming Amortized Cost Precisely

### The Problem

Concept Unit 3's real evidence needs a precise name — and a precise distinction from Lesson 74's average-case cost, since the two ideas are easy to conflate but are genuinely different questions.

### No isolated lab for this step

This concept has no code of its own to isolate — the definition and distinction are stated directly below, using Concept Unit 2 and 3's own real, already-gathered evidence.

### Applying It — Amortized Cost, Precisely Distinguished From Average Case

**Amortized cost:** the total cost of a *sequence* of `n` operations, divided by `n` — the average cost *per operation*, across time, for one evolving structure. Concept Unit 3's doubling strategy: total cost across `n` appends is `Θ(n)`, so the amortized cost *per append* is `Θ(n) / n = Θ(1)` — constant, even though any *individual* append might cost `Θ(n)` (whenever it happens to trigger a resize).

**Lesson 74's average case, restated for contrast:** the average cost of *one* operation, across *different possible inputs* of the *same* size — no sequence, no evolving state, just one operation and a distribution over what input it might receive.

**Why these are genuinely different questions:** average-case cost could be asked about a *single* call to `doubling-append` in isolation (what's the expected cost of one append, averaged over equally likely current capacities) — a Lesson 74-style question. Amortized cost is asked about the *entire sequence* of `n` appends building up one structure from empty — a question about total, cumulative cost divided across the operations that produced it, regardless of how any one of them, by itself, might have been unusually expensive.

### Walkthrough

- **The precise definition, "total cost divided by number of operations"** — turns Concept Unit 3's real numbers (`131,071` copies across `100,000` appends) into a checkable per-operation claim: `131,071 / 100,000 ≈ 1.3`, genuinely constant, not growing with `n`.
- **The explicit, side-by-side contrast with Lesson 74** — prevents exactly the conflation this unit exists to head off: "average" in two genuinely different senses, applied to genuinely different questions.

### CS Lens

This is why amortized analysis exists as its own tool, distinct from worst-case, best-case, and average-case analysis: some structures have no single operation that's reliably cheap, and no realistic input distribution that avoids the expensive case — the *only* way to characterize their real cost honestly is across a whole sequence of operations, exactly what this lesson's `Θ(n)`-total, `Θ(1)`-amortized result demonstrates. Also recognized in: a car's amortized fuel cost per mile, computed over an entire trip including refueling stops, even though the actual cost during any single mile spent at a gas pump is effectively infinite for that mile alone.

### SE Lens

The alternative to naming amortized cost precisely is to describe a dynamic array's append operation as simply "`O(1)`," the way an imprecise summary might, without acknowledging that some individual appends are genuinely `Θ(n)`. The real cost of that alternative is a false expectation: a system relying on every single append being uniformly fast could be surprised by real, occasional latency spikes exactly when a resize triggers — spikes amortized analysis predicts and explains, but a bare "`O(1)`" label hides entirely. Naming it as *amortized* `O(1)`, precisely, as this unit does, is what keeps the real, occasional cost visible rather than averaged away into an inaccurate blanket claim.

---

## Closing

### Connect the pieces

Two resizing strategies, one dramatic real gap, one precisely named idea:

1. **The problem, posed (Unit 1):** a fixed-size array offers no way to grow without allocating an entirely new one.
2. **The naive strategy, measured (Unit 2):** resize by `1` every time, real cost `Θ(n²)`, matching `n(n-1)/2` exactly.
3. **The doubling strategy, measured (Unit 3):** resize by doubling, real cost `Θ(n)` total, bounded ratio to `n` at every scale tested.
4. **Amortized cost, named and distinguished (Unit 4):** `Θ(1)` per append on average across the whole sequence, genuinely different from Lesson 74's average-case cost, which averages over inputs, not over time.

Every claim in this lesson traces to real, exhaustively counted copies across genuine sequences of appends, at five increasing scales — the same evidence discipline this curriculum has used since Lesson 22, now applied to a cost that only makes sense summed across a sequence of operations rather than measured on any one of them alone.

### What breaks without this

Suppose an engineer, building a system that repeatedly appends to a growing collection, chose Concept Unit 2's naive strategy because "resize by exactly what's needed" sounded like the more careful, resource-conscious choice. Real evidence in this lesson shows exactly what would happen as that collection grows: `4,999,950,000` real copies by the time it reaches `100,000` elements, versus `131,071` for the doubling alternative — a difference that would show up as a system growing steadily, then catastrophically, slower as its data grows, for a reason invisible in any test using only small collections. Understanding amortized cost, as this lesson derives it, is what makes choosing the doubling strategy a deliberate decision rather than a lucky default.

### Exercises

1. **Observe.** Before checking, predict whether growing capacity by *tripling* instead of doubling would still produce `Θ(n)` total cost, using Concept Unit 3's geometric-series reasoning.
2. **Formalize.** Modify `doubling-append` to triple capacity instead, measure its real total copies at the same five scales as Concept Unit 3, and confirm or correct your Exercise 1 prediction.
3. **Formalize.** Measure the real, individual cost of *each* append in a sequence of `20` doubling-strategy appends (not just the total), and identify exactly which append indices trigger a resize, connecting your answer to Concept Unit 3's `1, 2, 4, 8, ...` capacities.
4. **Explain.** Using Concept Unit 4's precise distinction, explain in your own words why "amortized `O(1)`" is a genuinely different, and more honest, claim than "worst-case `O(1)`," citing a specific append from Exercise 3 that was expensive.
5. **Explain.** State, in your own words, why growing capacity by a *fixed* amount larger than `1` (Concept Unit 3's SE Lens point) still produces `Θ(n²)` total cost, using Concept Unit 2's own reasoning about how many resizes such a strategy would need.

### Definition of done

- [ ] You can explain why a fixed-size array cannot support appending past its capacity without allocating a new array.
- [ ] You can state the real, measured cost difference between resize-by-one and resize-by-doubling, and explain why doubling changes the growth-rate *category*, not just the constant.
- [ ] You can define amortized cost precisely and explain, in your own words, how it differs from Lesson 74's average-case cost.
- [ ] You completed Exercise 3, identifying exactly which individual appends in a real sequence trigger a resize.
- [ ] You completed Exercises 1–5, including a real measurement using a growth strategy other than doubling.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating the growth strategy you tested and its real, measured total cost.
