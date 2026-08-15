# Lesson 68: Repeated Halving

**What you will build:** `binary-search`, a real procedure finding a target value in a sorted vector by repeatedly halving the region left to search — verified correct against `linear-search` on six real test cases, then measured directly at scale: searching for the last element among `1,000,000` real, sorted values, `linear-search` needs **`1,000,000`** comparisons and **`115.818`** ms; `binary-search` needs exactly **`20`** comparisons and **`0.062`** ms — over **`1,800` times faster**. That `20` is not a coincidence: `⌊log₂(1,000,000)⌋ + 1 = 19 + 1 = 20`, matching Lesson 67's `halving-count(1,000,000) = 19` exactly. The transferable point: Lesson 66 and 67 analyzed halving inside arithmetic (`fast-expt`). This lesson applies the identical idea — discard half of what remains at every step — to search, the first of many places this curriculum will find the same logarithmic pattern.

**What you need to know first:** Lesson 20 (`FP-L020-ordering.md`) — specifically total order, the property `binary-search` depends on entirely: the data must be sorted. Lesson 55 (`FP-L055-dynamic-programming-emerges.md`) — specifically vectors, reused here to hold sorted data with direct, indexed access. Lesson 67 (`FP-L067-logarithms.md`) — specifically `halving-count` and `⌊log₂(n)⌋`, checked directly against this lesson's real comparison counts.

**Terms introduced in this lesson**

- **Search space** (revisited precisely) — Lesson 56 named this generally; here it means specifically the contiguous region of a sorted collection still possibly containing the target, tracked by `binary-search` as a shrinking `lo`–`hi` range.
- **Binary search** — a search technique for sorted data: check the middle of the remaining search space; if it's the target, done; if the target is larger, discard the lower half and repeat on the upper half; if smaller, discard the upper half and repeat on the lower half.

---

## Concept Unit 1: The Search Problem — Linear as Baseline

### The Problem

Finding a specific value in a collection is one of the most common computational questions there is. Before deriving a faster technique, it's worth building the most obvious one — check every element, in order, until the target is found or the collection is exhausted — as a real, working baseline to measure against.

### The New Code — Type It Yourself

```scheme
(define (linear-search vec target)
  (let ((n (vector-length vec)))
    (let loop ((i 0))
      (cond ((= i n) #f)
            ((= (vector-ref vec i) target) i)
            (else (loop (+ i 1)))))))
```

### The Updated Project

This is `search-compare.scm`, in full:

```scheme
(define (linear-search vec target)
  (let ((n (vector-length vec)))
    (let loop ((i 0))
      (cond ((= i n) #f)
            ((= (vector-ref vec i) target) i)
            (else (loop (+ i 1)))))))

(display (linear-search (vector 1 3 5 7 9) 7))
(newline)
```

### Reference Source

The most direct translation of "check every element in order": start at index `0`; if the current index has reached the vector's length, the target isn't present, return `#f`; if the current element matches, return its index; otherwise, move to the next index.

### Files affected

Created: `search-compare.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile search-compare.scm
3
```

Verified this session — `7` is found at index `3` in `#(1 3 5 7 9)`.

### Mechanical Walkthrough

- **`(let loop ((i 0)) ...)`** — Lesson 39's named-`let` loop, tracking the current position.
- **`((= i n) #f)`** — the not-found case: every position has been checked with no match.
- **`((= (vector-ref vec i) target) i)`** — the found case: the current position's value matches, return that index.
- **`(else (loop (+ i 1)))`** — otherwise, advance to the next position and try again.

### CS Lens

This is the most literal possible translation of "search," making no assumptions whatsoever about the data's structure — it works identically whether `vec` is sorted, reverse-sorted, or in no particular order at all, which is both its strength and, as Concept Unit 2 will show, precisely what limits its speed. Also recognized in: checking every page of an unindexed document for a specific word; checking every house on a street, one at a time, looking for a specific address with no numbering system to navigate by.

### SE Lens

The alternative to building `linear-search` at all is to skip straight to a faster technique, the same choice this curriculum declined to make for `naive-expt` in Lesson 66. The real cost of that alternative, again, is losing a real, measured baseline — without `linear-search`'s real `1,000,000`-comparison, `115.818`-ms cost established directly, `binary-search`'s advantage in Concept Unit 4 would be an abstract claim rather than a demonstrated fact.

---

## Concept Unit 2: Halving the Search Space — Binary Search, Derived

### The Problem

`linear-search` makes no use of any structure in the data. If the data is known to be sorted — Lesson 20's total order — a genuinely different, much faster strategy becomes available, worth deriving carefully, since it depends entirely on an assumption `linear-search` never needed.

### Applying It — The Derivation

**The key assumption, stated explicitly, since everything that follows depends on it:** the vector is sorted in increasing order.

**The strategy:** check the value at the middle of the current search space. If it's the target, done. If it's *less than* the target, the target — if present at all — must be somewhere to the right, in the upper half; the entire lower half, including the middle itself, can be discarded, since everything there is smaller than the target. If the middle value is *greater than* the target, symmetric reasoning discards the entire upper half instead.

**Why this depends entirely on Concept Unit 2's assumption:** discarding half the data based on one comparison is only valid because sortedness guarantees everything on one side of the middle is uniformly too small, and everything on the other side is uniformly too large. `linear-search` needed no such guarantee, and could make no such shortcut.

### The New Code — Type It Yourself

```scheme
(define (binary-search vec target)
  (let loop ((lo 0) (hi (- (vector-length vec) 1)))
    (if (> lo hi)
        #f
        (let ((mid (quotient (+ lo hi) 2)))
          (cond ((= (vector-ref vec mid) target) mid)
                ((< (vector-ref vec mid) target) (loop (+ mid 1) hi))
                (else (loop lo (- mid 1))))))))
```

### The Updated Project

This is `search-compare.scm`, extended:

```scheme
(define (linear-search vec target)
  (let ((n (vector-length vec)))
    (let loop ((i 0))
      (cond ((= i n) #f)
            ((= (vector-ref vec i) target) i)
            (else (loop (+ i 1)))))))

(define (binary-search vec target)
  (let loop ((lo 0) (hi (- (vector-length vec) 1)))
    (if (> lo hi)
        #f
        (let ((mid (quotient (+ lo hi) 2)))
          (cond ((= (vector-ref vec mid) target) mid)
                ((< (vector-ref vec mid) target) (loop (+ mid 1) hi))
                (else (loop lo (- mid 1))))))))

(display (linear-search (vector 1 3 5 7 9) 7))
(newline)
(display (binary-search (vector 1 3 5 7 9) 7))
(newline)
```

### Reference Source

The derivation above, translated directly: `lo` and `hi` track the current search space's boundaries; `(> lo hi)` detects an empty search space (not found); `mid`, the halving point (Lesson 62's `quotient`), is checked directly; the two `cond` branches discard half the remaining space by moving `lo` past `mid` or `hi` before `mid`, exactly the derivation's "discard the entire half" move.

### Files affected

Modified: `search-compare.scm`.

### Change type

Extend existing procedure file.

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile search-compare.scm
3
3
```

Verified this session — both `linear-search` and `binary-search` find `7` at index `3` in `#(1 3 5 7 9)`, agreeing exactly.

### Mechanical Walkthrough

- **`(let loop ((lo 0) (hi (- (vector-length vec) 1))) ...)`** — the search space, tracked as a shrinking range, starting as the entire vector.
- **`(if (> lo hi) #f ...)`** — the search space has shrunk to nothing: the target isn't present.
- **`(let ((mid (quotient (+ lo hi) 2))) ...)`** — finding the current search space's middle index.
- **`((= (vector-ref vec mid) target) mid)`** — the found case.
- **`((< (vector-ref vec mid) target) (loop (+ mid 1) hi))`** — the target is larger: discard everything from `lo` through `mid`, continue on `mid + 1` through `hi`.
- **`(else (loop lo (- mid 1)))`** — the target is smaller: discard everything from `mid` through `hi`, continue on `lo` through `mid - 1`.

### CS Lens

This is exactly `fast-expt`'s halving structure (Lesson 66), applied to a search space instead of an exponent — discard half of what remains at every step, based on one comparison, rather than examining every element individually. Also recognized in: looking up a word in a printed dictionary by opening toward the middle, judging which half the word falls in alphabetically, and repeating within that half; a "guess the number" game where each guess is told "higher" or "lower," letting the guesser discard half the remaining range with each guess.

### SE Lens

The alternative to stating Concept Unit 2's sortedness assumption explicitly is to build `binary-search` and only discover later, on unsorted data, that it produces wrong answers without any error or warning. The real cost of that alternative is a silent correctness bug, exactly the kind Lesson 9's preconditions and postconditions exist to prevent — `binary-search`'s entire correctness rests on an assumption about its input that must be true every time it's called, never verified by the procedure itself. Stating it plainly up front, as this unit does, is what makes that dependency visible rather than an unstated trap.

---

## Concept Unit 3: Checking Correctness on Several Cases

### The Problem

`binary-search`'s derivation is sound reasoning. It's worth checking directly, across several cases — including targets not present at all — that it agrees with `linear-search` exactly.

### No isolated lab for this step

This concept has no code of its own to isolate — the real comparison is demonstrated directly below.

### Applying It — Six Real Comparisons

```
$ guile correctness.scm
target=1 linear=0 binary=0
target=19 linear=9 binary=9
target=7 linear=3 binary=3
target=8 linear=#f binary=#f
target=-5 linear=#f binary=#f
target=100 linear=#f binary=#f
```

Verified this session — on the sorted vector `#(1 3 5 7 9 11 13 15 17 19)`, checking the first element, the last element, a middle element, and three targets genuinely absent (one between existing values, one below the smallest, one above the largest), `linear-search` and `binary-search` agree exactly, every time.

### Walkthrough

- **The real six-way exact match, including three not-found cases** — direct, verified confirmation that `binary-search`'s halving logic correctly handles both boundaries (first and last element) and the "target isn't here at all" case, not just typical middle-of-the-data lookups.
- **The three not-found cases specifically** — confirm `binary-search`'s `(> lo hi)` termination correctly recognizes an exhausted search space in three structurally different ways (a genuine gap, below range, above range).

### CS Lens

This is the identical validation discipline this curriculum has used since Lesson 28: a new, faster procedure checked against an already-trusted, simpler one, on a battery of cases deliberately including boundaries and negative results, not just the easy, typical case. Also recognized in: a new, optimized database index checked against a full table scan on a range of queries, including queries known to return no results, before the index is trusted in production.

### SE Lens

The alternative to testing not-found cases specifically is to test only targets known to be present, the way an incomplete test suite might. The real cost of that alternative, for `binary-search` specifically, is that its termination condition (`lo > hi`) is exactly the part of the derivation most likely to contain an off-by-one error — untested, a bug there could cause an infinite loop or an incorrect `#f` on some present target. Testing three distinct not-found cases deliberately, as this unit does, is what confirms this specific, easy-to-get-wrong part of the logic.

---

## Concept Unit 4: Measuring the Real Cost, and Connecting to log₂

### The Problem

Concept Unit 2 argued binary search should need far fewer comparisons than linear search. This needs measuring directly, at real scale, and checking against Lesson 67's `halving-count` precisely, not just informally.

### No isolated lab for this step

This concept has no code of its own to isolate — the real measurement is demonstrated directly below.

### Applying It — Real Comparisons and Timing at n = 1,000,000

**Searching for the last element (the worst case for `linear-search`) in a sorted, `1,000,000`-element vector:**

```
$ guile binary-search.scm
linear-search found at index: 999999 comparisons: 1000000
binary-search found at index: 999999 comparisons: 20
```

```
$ guile timing.scm
linear-search: 115.818 ms
binary-search: 0.062 ms
```

Verified this session — `linear-search` makes exactly `1,000,000` comparisons and takes `115.818` ms; `binary-search` makes exactly `20` comparisons and takes `0.062` ms — a real, measured speedup of over `1,800` times, both finding the identical, correct index, `999999`.

**Connecting `20` directly to Lesson 67's `halving-count`:** Lesson 67 found `halving-count(1,000,000) = 19` — the number of times `1,000,000` can be halved before reaching `1`. `binary-search`'s worst-case comparison count is `⌊log₂(n)⌋ + 1` — one more than the pure halving count, because the *first* comparison happens before any halving has occurred yet. `19 + 1 = 20`, matching `binary-search`'s real, measured comparison count exactly, not approximately.

### Walkthrough

- **The real `1,000,000`-versus-`20` comparison count** — direct, measured confirmation of Concept Unit 2's halving-discards-half reasoning, at genuine scale.
- **The real `115.818` ms versus `0.062` ms timing** — confirms the comparison-count difference translates directly into a real, felt speed difference, exactly Lesson 56's counting-predicts-runtime connection.
- **`19 + 1 = 20`, an exact match, not an approximation** — the strongest possible confirmation that `binary-search`'s cost is precisely explained by Lesson 67's logarithm, with the "+1" accounted for and explained rather than left as unexplained slack.

### CS Lens

This is the second real, measured confirmation (after `fast-expt`, Lesson 66–67) that halving a search space produces logarithmic — not linear — cost, and the exact `19 + 1 = 20` match demonstrates that this isn't merely "roughly logarithmic" but precisely, derivably so. Also recognized in: a library's card catalog letting a patron locate any book among millions in a small, bounded number of steps by repeatedly narrowing a range, rather than checking every book; a "twenty questions" game correctly identifying any one of over a million possible answers using at most twenty carefully chosen yes/no questions — mathematically, the identical `log₂` bound this lesson just measured directly.

### SE Lens

The alternative to connecting `binary-search`'s real comparison count precisely back to `halving-count` is to note both are "small" and "logarithmic-ish" without confirming the exact relationship. The real cost of that alternative is missing the strongest, most convincing evidence available here — the exact `19 + 1 = 20` match, which is qualitatively stronger proof than an approximate resemblance would be. Checking the precise relationship, as this unit does, turns "binary search seems fast" into "binary search's cost is derivable, in advance, from Lesson 67's logarithm, exactly."

---

## Closing

### Connect the pieces

One search space, halved repeatedly, measured and explained precisely:

1. **The baseline (Unit 1):** `linear-search`, checking every element, making no assumptions about the data's structure.
2. **The faster technique, derived (Unit 2):** `binary-search`, discarding half the remaining search space per comparison, depending entirely on Lesson 20's sortedness assumption, stated explicitly.
3. **Correctness, checked (Unit 3):** six real cases, including three not-found cases, `linear-search` and `binary-search` agreeing exactly every time.
4. **The real cost, measured and precisely explained (Unit 4):** `1,000,000` versus `20` comparisons, `115.818` ms versus `0.062` ms, with `20` derived exactly as `halving-count(1,000,000) + 1 = 19 + 1 = 20` — not approximately, exactly.

This lesson is the second time this curriculum has measured a real, dramatic speedup from halving (after `fast-expt`, Lessons 66–67) and, this time, achieved an *exact* match to Lesson 67's logarithm rather than an approximate one — confirming the logarithmic pattern discovered in arithmetic transfers directly, precisely, to search.

### What breaks without this

Suppose a system needed to look up records in a large, sorted dataset — say, a million customer accounts sorted by ID — repeatedly, as part of a frequently-used feature, and its implementation used `linear-search`'s approach, checking each record in order. Based on this lesson's real, measured evidence, each individual lookup could cost over a hundred milliseconds, exactly the kind of latency that compounds into a sluggish, unusable feature under any real load. Recognizing that the data is sorted, and applying `binary-search` instead, as this lesson derived and measured, is the difference between a lookup that takes `115.818` ms and one that takes `0.062` ms — the exact kind of decision that determines whether a real system feels instant or feels broken.

### Exercises

1. **Observe.** Trace `binary-search`'s execution by hand on `#(1 3 5 7 9 11 13 15 17 19)`, searching for `13`, writing out `lo`, `hi`, and `mid` at each step until the target is found.
2. **Formalize.** Run `binary-search` on the identical input and confirm the real trace matches your Exercise 1 hand trace exactly.
3. **Explain.** State, in your own words, what would go wrong if `binary-search` were run on an *unsorted* vector — construct a small, specific example where it would return the wrong answer (or fail to find a target that's actually present).
4. **Formalize.** Measure `linear-search` and `binary-search` on a sorted vector of your own size, at least `100,000`, searching for the last element (the worst case for linear search), and report the real, measured comparison counts and timing.
5. **Explain.** Using your Exercise 4 comparison count, compute `halving-count(n) + 1` for your chosen `n` (using Lesson 67's `halving-count`), and confirm it matches your measured `binary-search` comparison count exactly, the way Concept Unit 4 confirmed `19 + 1 = 20`.

### Definition of done

- [ ] You can implement `linear-search` and explain why it makes no assumptions about data structure.
- [ ] You can derive `binary-search`, explaining precisely why it depends on the data being sorted.
- [ ] You can check `binary-search`'s correctness against `linear-search`, including deliberately testing not-found cases.
- [ ] You can measure `binary-search`'s real comparison count and explain it as exactly `⌊log₂(n)⌋ + 1` in the worst case.
- [ ] You completed Exercises 1–5 using a vector size not used as this lesson's own example.
- [ ] Commit `search-compare.scm` and your Exercise 4 and 5 findings, with a commit message stating the size you tested and the exact comparison-count match you confirmed.
