# Lesson 112: Inventing a Data Structure

**What you will build:** a **monotonic deque** — a structure this curriculum has never named or built, invented here to satisfy a real operation set no single Era IV structure can satisfy on its own: repeatedly push a new value, repeatedly retire the oldest value, and repeatedly ask for the current minimum among everything still present, all needed together as a real "window" of recent data slides forward. Real, verified evidence this session: across `190` real sliding windows over a `200`-value random stream (window size `10`), the invented structure's reported minimum matches a brute-force scan of the true window contents exactly, every single time. Its real, measured total cost across `10,000` pushes is `19,995` — writes plus evictions combined — matching a real, amortized `~2` units of work per push, not the `k`-per-query cost a naive deque-plus-scan approach would pay. The transferable point: Era IV's closing skill isn't memorizing eleven named structures — it's Lesson 111's own decision procedure, pushed one step further, to the point of recognizing when *no* existing structure suffices and a genuinely new invariant has to be derived from first principles.

**What you need to know first:** Lesson 111 (`FP-L111-choosing-structures.md`) — specifically its four-step decision procedure, applied here to conclude that no existing structure suffices. Lesson 104 (`FP-L104-heaps.md`) — specifically why a heap alone cannot satisfy this lesson's operation set, the concrete gap this lesson's invention closes. Lesson 86 (`FP-L086-dynamic-arrays.md`) and Lesson 108 (`FP-L108-path-compression.md`) — specifically amortized cost, reused directly for this lesson's own real measurement.

**Terms introduced in this lesson**

- **Monotonic deque** — a double-ended structure holding only the elements of a window that could still possibly become a future minimum, kept in non-decreasing order from front to back at all times. It exists to answer "what's the current minimum" in true constant time, without needing to store or compare every element the window has ever held.

**Objects and methods used**

- **`make-vector`**
  - *What it is:* a real Scheme procedure creating a new vector of a given length.
  - *Implementation:* takes a length, returns a fresh vector; reappearing from Lesson 55, used here as `(make-vector n)`.
  - *Its use:* the monotonic deque's own backing storage, sized to the stream length for this lesson's bounded demonstration.
- **`vector-ref`/`vector-set!`**
  - *What it is:* real Scheme procedures reading and writing a vector's value at a given index.
  - *Implementation:* reappearing from Lesson 55/85, used as `(vector-ref vec i)` and `(vector-set! vec hi pair)`.
  - *Its use:* direct, `O(1)` access to both the current front and the current back of the monotonic sequence — the real requirement neither a plain list nor a lazily-rebalanced queue can satisfy for this specific structure.

---

## Concept Unit 1: An Operation Set No Existing Structure Satisfies

### The Problem

Consider a real stream of readings arriving one at a time, and a requirement to always know, cheaply, the minimum reading among the most recent `k` — pushed forward continuously as new readings arrive and old ones age out. Precisely, three operations, all needed repeatedly: `push-back(x)` (a new reading arrives), `pop-front-if(x)` (the oldest reading, `x`, ages out of the window), and `peek-min()` (what's the smallest reading currently in the window). Applying Lesson 111's own decision procedure directly: a plain deque (`push-back`/`pop-front` in real `O(1)`) has no way to answer `peek-min()` without scanning every element currently held — real, linear cost, every single call. A heap (`peek-min()` in real `O(1)`) has no operation at all for removing one *specific*, arbitrary element — the one aging out of the window is essentially never the current minimum, and nothing built in Lesson 104 supports finding and removing an arbitrary, non-minimum element cheaply.

### No isolated lab for this step

This concept has no code of its own to isolate — the operation set and the gap are posed directly here, applying Lesson 111's own procedure to a genuinely new scenario.

### Reference Source

No reference counterpart — the motivating gap is derived directly from Lesson 104 and 111's own established real limits, not any external implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Confirming Step 2 of Lesson 111's Procedure Actually Fails Here

Lesson 111's step 2 asks, categorically, whether each candidate supports every required operation *at all*. Neither candidate here fails categorically in the way a hash table failed prefix queries in Lesson 106 — a deque *can* compute a minimum, and a heap *can*, in principle, search for and remove an arbitrary element. What actually fails is cost: every known way to make either structure support all three operations degrades at least one of them to real, linear cost per call — precisely the signal, per Lesson 111's step 4, that a genuinely new combination or a genuinely new invariant is needed.

### Walkthrough

- **The three operations named precisely, before any structure is proposed** — Lesson 84's own discipline, applied to a brand-new scenario this Era never explicitly built.
- **Neither candidate failing categorically, only on cost** — a genuinely different shape of gap than Lesson 111's own hash-table example, worth distinguishing explicitly.

### CS Lens

This is the real, natural limit of Lesson 111's own decision procedure: step 4 checks whether *existing* candidates, alone or combined, suffice — and this scenario is chosen specifically because the honest answer, reached by actually applying the procedure, is no. Also recognized in: an engineer correctly concluding, after genuinely checking every off-the-shelf option, that nothing quite fits — the same conclusion a checklist should sometimes produce, not a failure of the checklist.

### SE Lens

The alternative to deriving a new structure is accepting the best *existing* option's real cost — a deque with an `O(k)` scan per minimum query, for instance — and calling it good enough. The real cost of that alternative, for a workload genuinely needing frequent minimum queries over a sliding window (real-time sensor monitoring, stock-price rolling minimums), compounds directly with how often `peek-min()` is actually called — exactly the kind of real, measured cost Concept Unit 4 checks rather than assumes acceptable.

---

## Concept Unit 2: Deriving the Monotonic Invariant

### The Problem

Concept Unit 1 established that a new invariant is needed. It needs to be derived from a real, checkable argument — not guessed — for *why* it's safe to discard information, since discarding incorrectly would silently break `peek-min()`.

### No isolated lab for this step

This concept has no code of its own to isolate — the invariant and its correctness argument are derived directly below, and Concept Unit 3 implements and verifies them as real code.

### Reference Source

No reference counterpart — a from-scratch derivation, the actual invention this lesson is built around.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — the Domination Argument

**The key real-world fact worth naming precisely:** the window always evicts its *oldest* remaining element first — whatever gets pushed later always leaves later, never sooner.

**The domination argument, precise:** suppose element `y` is already in the window, and a new element `x` is pushed with `x ≤ y`. Since `x` was pushed after `y`, `x` will remain in the window for at least as long as `y` does — `x` cannot leave before `y` does. So at every single future moment `y` is still present, `x` is *also* still present, and `x ≤ y` — meaning `y` can never, at any future point, be the *smallest* element in the window, because `x` is right there, at least as small, the entire time `y` remains. `y` is provably, permanently irrelevant to every future `peek-min()` call, the moment a smaller-or-equal `x` arrives after it — it can be discarded immediately, not merely deprioritized.

**The invariant this produces:** keep only the elements that have *not* yet been dominated this way — precisely, keep the sequence in non-decreasing order by value from front (oldest surviving) to back (most recent), discarding, from the back, any existing element whose value is `≥` a newly-pushed one, the instant it arrives.

**Why the true front is always the true minimum:** every element that could have been smaller has already, by the invariant, either been kept (and sits further front) or never existed in the window at all. The front of this reduced sequence is the smallest value among every element genuinely still eligible to be the answer.

### Walkthrough

- **The domination argument, stated as a real, general claim about timing and value together** — not "a smaller element is better," but the specific, provable claim that a smaller *later* element makes an existing element unreachable as a future answer.
- **"discarded... not merely deprioritized"** — the exact move that keeps this structure small: dominated elements aren't kept in some secondary role, they're gone, permanently.

### CS Lens

This is a real instance of an **invariant discovered by asking what information can be safely thrown away**, rather than what needs to be kept — a rarer, harder-to-spot design move than most of this Era's invariants, which mostly governed how to keep *everything*, correctly arranged. Also recognized in: a hiring pipeline correctly discarding a candidate the moment a strictly-better-qualified, more-recently-available candidate appears for the identical, single open role — not because the first candidate became worse, but because they can no longer possibly be the one chosen.

### SE Lens

The alternative to proving the domination argument rigorously is implementing a plausible-sounding eviction rule and trusting real test cases to catch any mistake. The real risk of that alternative: an eviction rule that's slightly too aggressive (discarding an element that could still become the answer) would fail silently on inputs where the discarded element's absence doesn't happen to matter for the specific test cases tried — exactly the kind of gap Lesson 110's representation-invariant-versus-abstraction-function distinction warned about, here avoided by deriving correctness before writing any code at all.

---

## Concept Unit 3: Implementing and Verifying the Monotonic Deque

### The Problem

Concept Unit 2 derived the invariant. It needs real code — genuine, direct access to *both* ends of the sequence at once, since eviction happens at the back while queries happen at the front, repeatedly, in the same structure.

### The New Code — Type It Yourself

```scheme
(define (md-push-back md pair)
  (let ((vec (md-vec md)) (lo (md-lo md)) (hi (md-hi md)))
    (let loop ((hi hi))
      (if (and (> hi lo) (>= (car (vector-ref vec (- hi 1))) (car pair)))
          (loop (- hi 1))
          (begin (vector-set! vec hi pair) (list vec lo (+ hi 1)))))))
```

### Reference Source

No reference counterpart — a from-scratch implementation of Concept Unit 2's derived invariant, storing elements directly in a Lesson 85-style array rather than a linked or two-list structure, specifically because this lesson's own operations need real, simultaneous `O(1)` access to both ends, not the one-end-favoring access a lazily-rebalanced queue provides.

### Files affected

Created: `monodeque-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `monodeque-check.scm`, in full:

```scheme
(define (make-md n) (list (make-vector n) 0 0))
(define (md-vec md) (car md))
(define (md-lo md) (cadr md))
(define (md-hi md) (caddr md))
(define (md-peek-min md) (car (vector-ref (md-vec md) (md-lo md))))

(define (md-push-back md pair)                                     ; ← new
  (let ((vec (md-vec md)) (lo (md-lo md)) (hi (md-hi md)))             ; ← new
    (let loop ((hi hi))                                                   ; ← new
      (if (and (> hi lo) (>= (car (vector-ref vec (- hi 1))) (car pair)))    ; ← new
          (loop (- hi 1))                                                      ; ← new
          (begin (vector-set! vec hi pair) (list vec lo (+ hi 1)))))))            ; ← new

(define (md-pop-if-front-index-equals md idx)
  (let ((vec (md-vec md)) (lo (md-lo md)) (hi (md-hi md)))
    (if (and (> hi lo) (= (cdr (vector-ref vec lo)) idx)) (list vec (+ lo 1) hi) md)))

(define stream (let loop ((i 0) (acc '())) (if (= i 200) (reverse acc) (loop (+ i 1) (cons (random 100) acc)))))
(define k 10)
(define (naive-window-min lst start k)
  (apply min (let loop ((i start) (n 0) (acc '())) (if (= n k) acc (loop (+ i 1) (+ n 1) (cons (list-ref lst i) acc))))))

(define md0 (let loop ((i 0) (md (make-md 200))) (if (= i k) md (loop (+ i 1) (md-push-back md (cons (list-ref stream i) i))))))
(define all-ok #t)
(let loop ((i k) (md md0))
  (if (< i (length stream))
      (let* ((md1 (md-pop-if-front-index-equals md (- i k)))
             (md2 (md-push-back md1 (cons (list-ref stream i) i)))
             (real-min (md-peek-min md2))
             (expected-min (naive-window-min stream (- (+ i 1) k) k)))
        (if (not (= real-min expected-min))
            (begin (set! all-ok #f) (display "MISMATCH at i=") (display i) (newline)))
        (loop (+ i 1) md2))))
(display "sliding-window-min correctness over 200 values, window 10, all matched brute force? ") (display all-ok) (newline)
```

`md-push-back` walks backward from the current back (`hi`), evicting — simply by decrementing `hi` without erasing the value, since it will be overwritten before ever being read again — every element the domination argument proves irrelevant, then writes the new element into the now-correct slot. Elements are stored as `(value . index)` pairs specifically so `md-pop-if-front-index-equals` can tell whether the value aging out of the window is *still present* (by comparing the original stream position, not the value) or was already evicted earlier by a smaller value — comparing raw values alone would misidentify which occurrence of a repeated value is actually leaving.

### Mechanical Walkthrough

- **`(list (make-vector n) 0 0)`** in `make-md` — a reappearance of `make-vector`, `list`; `lo` and `hi` both start at `0`, an empty range with nothing yet stored.
- **`(let loop ((hi hi)) (if (and (> hi lo) (>= ...)) (loop (- hi 1)) ...))`** — first appearance of this specific eviction shape: shrinking `hi` repeatedly is the literal execution of Concept Unit 2's domination argument, discarding every trailing element the new value provably makes irrelevant.
- **`(vector-set! vec hi pair)`** — a reappearance of `vector-set!`; writes the new element into the exact slot the eviction loop determined is correct, the one and only real write per push.
- **`(cons (list-ref stream i) i)`** — first appearance of pairing a value with its own original stream position; the specific fix for the duplicate-value ambiguity a plain value comparison cannot resolve.
- **`(= (cdr (vector-ref vec lo)) idx)`** in `md-pop-if-front-index-equals` — a reappearance of `=`, `cdr`; compares by *index*, not value, correctly distinguishing "this specific element is leaving" from "some other, equal-valued element happens to still be at the front."
- **The real, exact `#t` across all `190` checked windows** — direct, checked confirmation that Concept Unit 2's derived invariant, executed as real code, correctly tracks the true minimum at every single step, not just in aggregate.

### CS Lens

This is Lesson 79's own "correct but naive versus correct and efficient" distinction, encountered a final time in this Era: a plain deque-plus-scan is correct; this structure is correct *and* answers `peek-min()` in genuine `O(1)`, the real difference Concept Unit 2's invariant was derived specifically to buy.

### SE Lens

The alternative representation — the two-list, lazily-rebalanced queue technique this curriculum has used informally elsewhere — was tried first while preparing this lesson and found genuinely incorrect for this specific use: it gives amortized `O(1)` access favoring one end, but this structure needs real, immediate access to *both* ends on every single operation, not access that's cheap only when averaged over time. The real lesson in that: not every representation technique that worked for an earlier structure transfers automatically to a new operation set — Lesson 111's own step 4 (checking compatibility directly, not assuming it) applies to *inventing* a structure just as much as to *combining* existing ones.

### Run It — Show the Real Output

```
$ guile monodeque-check.scm
sliding-window-min correctness over 200 values, window 10, all matched brute force? #t
```

Verified this session — across `190` real sliding windows (a `200`-value stream, window size `10`), the invented structure's reported minimum matches a brute-force scan of the actual window contents exactly, every single time, with zero mismatches.

**Execution trace — pushing `5`, `3`, `8`, `1` in order, the identical values Lesson 104 traced for its own heap:**

1. `(md-push-back md (cons 5 0))` — `hi = lo = 0`, so the eviction loop's `(> hi lo)` check fails immediately; writes `(5 . 0)` at index `0`. `peek-min` is `5`.
2. `(md-push-back ... (cons 3 1))` — `hi = 1 > lo = 0`; checks index `0`: `5 ≥ 3` is true, evicts (`hi` becomes `0`); loop stops (`hi = lo`); writes `(3 . 1)` at index `0`. `peek-min` is `3`.
3. `(md-push-back ... (cons 8 2))` — `hi = 1 > lo = 0`; checks index `0`: `3 ≥ 8` is false, no eviction; writes `(8 . 2)` at index `1`. `peek-min` is still `3`.
4. `(md-push-back ... (cons 1 3))` — `hi = 2 > lo = 0`; checks index `1`: `8 ≥ 1` is true, evicts (`hi` becomes `1`); checks index `0`: `3 ≥ 1` is true, evicts (`hi` becomes `0`); loop stops; writes `(1 . 3)` at index `0`. `peek-min` is `1`.

The real, confirmed final state: only `(1 . 3)` remains — both `5` and `3` and `8`'s dominance relationships resolved in favor of `1`, exactly as Concept Unit 2's argument predicts, matching Lesson 104's own real minimum of `{5, 3, 8, 1}`.

---

## Concept Unit 4: The Real, Amortized Cost

### The Problem

Concept Unit 3 confirmed correctness. A single `md-push-back` call can, in principle, evict many elements at once — worth measuring, honestly, whether that means some individual pushes are genuinely expensive, or whether the *total* cost across many pushes stays small regardless.

### The New Code — Type It Yourself

```scheme
(define pushes 0) (define evictions 0)
(define (md-push-back-counted md pair)
  (let ((vec (md-vec md)) (lo (md-lo md)) (hi (md-hi md)))
    (let loop ((hi hi))
      (if (and (> hi lo) (>= (car (vector-ref vec (- hi 1))) (car pair)))
          (begin (set! evictions (+ evictions 1)) (loop (- hi 1)))
          (begin (set! pushes (+ pushes 1)) (vector-set! vec hi pair) (list vec lo (+ hi 1)))))))
```

### Reference Source

No reference counterpart — a counted instrumentation of Concept Unit 3's own `md-push-back`, the identical technique Lesson 92, 104, and 108 all already used.

### Files affected

Created: `monodeque-cost.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `monodeque-cost.scm`, in full:

```scheme
(define (make-md n) (list (make-vector n) 0 0))
(define (md-vec md) (car md))
(define (md-lo md) (cadr md))
(define (md-hi md) (caddr md))

(define pushes 0) (define evictions 0)                             ; ← new
(define (md-push-back-counted md pair)                                ; ← new
  (let ((vec (md-vec md)) (lo (md-lo md)) (hi (md-hi md)))                ; ← new
    (let loop ((hi hi))                                                      ; ← new
      (if (and (> hi lo) (>= (car (vector-ref vec (- hi 1))) (car pair)))       ; ← new
          (begin (set! evictions (+ evictions 1)) (loop (- hi 1)))                 ; ← new
          (begin (set! pushes (+ pushes 1)) (vector-set! vec hi pair) (list vec lo (+ hi 1))))))) ; ← new

(for-each
 (lambda (n)
   (define s (let loop ((i 0) (acc '())) (if (= i n) (reverse acc) (loop (+ i 1) (cons (random 1000000) acc)))))
   (set! pushes 0) (set! evictions 0)
   (let loop ((i 0) (md (make-md n))) (if (< i n) (loop (+ i 1) (md-push-back-counted md (cons (list-ref s i) i)))))
   (display "n=") (display n) (display " real vector-writes=") (display pushes)
   (display " real evictions=") (display evictions) (display " total=") (display (+ pushes evictions)) (newline))
 (list 1000 10000))
```

Every real element gets exactly one `vector-set!` call across its entire lifetime in the structure (`pushes` counts these) and, individually, can be evicted at most once, ever, since eviction removes it from consideration permanently (`evictions` counts these) — the same "each unit of work happens at most a bounded number of times per element" argument Lesson 86 and 108 both already used for their own amortized claims.

### Mechanical Walkthrough

- **`(set! evictions (+ evictions 1))`, `(set! pushes (+ pushes 1))`** — a reappearance of `set!`; two separate counters, distinguishing real writes from real evictions, the same separation Lesson 108's own naive-versus-compressed comparison used.
- **The real, exact totals — `1,990` at `n = 1,000`, `19,995` at `n = 10,000`** — direct, measured confirmation that total real work stays close to `2n`, not `n × k` or worse, regardless of how unevenly individual pushes happen to distribute their eviction cost.

### CS Lens

This is amortized analysis's central argument (Lesson 86's own "allocating more than immediately needed keeps total cost proportional to `n`"), applied here through a different mechanism: not pre-allocating capacity, but bounding each element's *total* lifetime cost (one write, at most one eviction) regardless of which single push happens to trigger that eviction.

### SE Lens

The alternative to this real measurement is trusting the domination argument's correctness (Concept Unit 3) as proof enough that the structure is also efficient. The real, distinct check this unit performs: correctness and efficiency are two separate claims, exactly Lesson 99's own standing lesson — a structurally sound, correct monotonic deque could still, in principle, have been implemented in a way that made total eviction cost grow faster than `n`, and only this lesson's real, counted measurement — not the invariant's own correctness — rules that out.

### Run It — Show the Real Output

```
$ guile monodeque-cost.scm
n=1000 real vector-writes=1000 real evictions=990 total=1990
n=10000 real vector-writes=10000 real evictions=9995 total=19995
```

Verified this session — across `1,000` and `10,000` real pushes of random values, total real work (writes plus evictions combined) is `1,990` and `19,995` respectively — genuinely close to `2n` at both scales, confirming the amortized `O(1)`-per-push claim with real, measured numbers rather than trusting the argument alone.

---

## Closing

### Connect the pieces

Four values, `5, 3, 8, 1`, and a genuinely new structure, traced through every unit this lesson built:

1. **The real gap, found by applying Lesson 111's own procedure (Unit 1):** neither a deque nor a heap alone satisfies all three required operations at acceptable cost.
2. **A new invariant, derived from a real, provable argument (Unit 2):** a later, smaller-or-equal element permanently dominates an earlier, larger one — safe to discard, not merely deprioritize.
3. **Implemented and verified (Unit 3):** `190` real sliding windows, zero mismatches against brute force; the identical `5, 3, 8, 1` sequence Lesson 104 traced, now resolving to the identical real minimum, `1`.
4. **The real, amortized cost, measured (Unit 4):** `~2n` total real work across `n` pushes, at two separate scales, confirming efficiency as a claim checked separately from correctness.

Every claim in this lesson traces to real, executed code: a real correctness check against brute force across `190` genuine windows, and a real, counted cost measurement distinguishing writes from evictions.

### What breaks without this

Suppose a real monitoring system needed a rolling minimum over the last `k` sensor readings, and an engineer, reaching for familiar tools, built it from Lesson 104's heap plus a separate structure tracking *when* to remove aging entries — without deriving whether removal could be done cheaply. Lesson 104's heap genuinely has no efficient way to remove an arbitrary, non-minimum element; a real implementation built this way would need to fall back to a linear search for the aging element on every single removal, exactly the cost Concept Unit 1 identified and this lesson's invented structure avoids entirely.

### Exercises

1. **Observe.** Before checking, predict how this lesson's structure and reasoning would need to change to track a rolling *maximum* instead of minimum, using Concept Unit 2's own domination argument to justify your answer.
2. **Formalize.** Implement the rolling-maximum version and confirm it matches brute force across a real, randomized stream.
3. **Formalize.** This lesson's `make-md` allocates a vector sized to the *entire* stream in advance, a simplification for a bounded demonstration. Using Lesson 86's own doubling strategy, adapt the monotonic deque to handle a genuinely unbounded stream, and confirm correctness still holds.
4. **Explain.** In your own words, explain why storing `(value . index)` pairs, rather than values alone, is necessary specifically because window elements can repeat — referencing what could go wrong with `md-pop-if-front-index-equals` if it compared values instead.
5. **Explain.** Using Lesson 111's own four-step procedure, restate this lesson's Concept Unit 1 as a formal application of that procedure, step by step, showing precisely which step first revealed that no existing structure would do.

### Definition of done

- [ ] You can state the domination argument precisely and explain why it justifies permanently discarding an element, not just reordering it.
- [ ] You can trace `md-push-back` on `5, 3, 8, 1` by hand and reproduce this lesson's own real final state.
- [ ] You can explain why a lazily-rebalanced two-list queue, correct for a plain FIFO queue, is genuinely wrong for this structure's specific requirements.
- [ ] You completed Exercises 1–5, including a real, working rolling-maximum variant and an unbounded-stream version using Lesson 86's own growth strategy.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, measured results.
