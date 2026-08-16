# Lesson 80: Quicksort

**What you will build:** `quicksort`, a second real, correct sorting procedure — verified against Guile's own built-in `sort` the same way Lesson 79's `merge-sort` was, but built from an almost exactly *mirrored* Divide-and-Conquer shape: where `merge-sort`'s Divide step was free (split by position) and its Combine step did all the real work, `quicksort`'s Divide step (partitioning around a chosen value) does all the real comparison work, and its Combine step is free (concatenate). Real, measured evidence this session: on an already-sorted input, `quicksort`'s real comparison count matches `n(n-1)/2` *exactly* — `499,500` at `n = 1,000`, identical to Lesson 79's insertion-sort worst case — while on a genuinely shuffled input of the identical size, it needs only `10,089`, tracking `n log₂(n)` closely instead. The transferable point: this is the real, measured version of the gap Lesson 74 named and Lesson 76 promised — the *same* algorithm, on inputs of the *identical* size, whose worst case and typical case don't just differ in which input triggers them, but differ in **order of growth itself**.

**What you need to know first:** Lesson 79 (`FP-L079-merge-sort.md`) — specifically the Divide/Conquer/Combine template applied to sorting, and `merge-sort`'s real comparison counts, contrasted directly here. Lesson 74 (`FP-L074-worst-average-best-case.md`) — specifically worst-case and average-case cost, both measured concretely here for the first time on an algorithm where they genuinely differ in growth order. Lesson 73 (`FP-L073-big-omega.md`) — specifically the adversary-argument style of reasoning, reused here to explain *why* a sorted input is the worst possible one for this specific `quicksort`.

**Terms introduced in this lesson**

- **Partition** — rearranging a list around a chosen **pivot** value into two groups: every element less than the pivot, and every element not less than it — the comparison-based work `quicksort`'s Divide step performs, in contrast to `merge-sort`'s free, position-based split.
- **Pivot** — the single value a partition step compares every other element against; `quicksort`'s real cost, this lesson shows, depends entirely on how evenly a chosen pivot happens to split the remaining elements.

---

## Concept Unit 1: A Mirror-Image Divide Step

### The Problem

Lesson 79's `merge-sort` split its input by position alone — no comparisons at all in the Divide step — and did all its real comparison work in Combine, merging two already-sorted halves. It's worth asking whether the opposite arrangement is possible: a Divide step that does real, comparison-based work up front, arranged so cleverly that once each resulting piece is independently sorted, no further combining work is needed at all.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, using Lesson 79's own structure as the point of contrast.

### Applying It — What Would Make Combine Free

`merge-sort`'s Combine step was expensive because its two halves, though each internally sorted, were *not yet correctly interleaved with each other* — `merge` had to figure out, comparison by comparison, which of the two sorted halves each final position belonged to. Combine would be genuinely free only if the Divide step had *already* guaranteed every element in one piece belongs strictly before every element in the other, in the final sorted order — leaving nothing left to figure out at combine time except placing the two pieces one after the other.

### Walkthrough

- **The direct contrast with `merge-sort`'s Combine step** — names exactly what made `merge` necessary: two sorted pieces that still needed interleaving.
- **"leaving nothing left to figure out... except placing the two pieces one after the other"** — states precisely what a free Combine step would require the Divide step to have already guaranteed.

### CS Lens

This is a genuine structural mirror image within the same design pattern: two algorithms both fit Lesson 78's Divide/Conquer/Combine template, but move the same real amount of necessary comparison work into opposite steps. Also recognized in: two different approaches to organizing a filing cabinet — one that files everything roughly by section first and carefully alphabetizes within each section afterward, versus one that carefully determines each document's exact section up front, needing no further sorting once filed.

### SE Lens

The alternative to seeking this mirror-image structure is to assume `merge-sort`'s shape — free divide, expensive combine — is simply what divide-and-conquer sorting looks like. The real cost of that alternative is missing a genuinely different, equally valid design point, one whose real trade-offs (explored fully in Concept Unit 4) are different enough to matter in practice. Seeking the mirror image deliberately, as this unit does, is what motivates deriving `quicksort` as something genuinely new, not a small variation on Lesson 79.

---

## Concept Unit 2: Deriving Partition and Quicksort

### The Problem

Concept Unit 1's goal needs a real Divide step: a way to split a list around some chosen value so that everything smaller ends up in one piece, everything else in the other — guaranteeing the ordering Combine will need for free.

### The New Code — Type It Yourself

```scheme
(define (quicksort lst)
  (if (or (null? lst) (null? (cdr lst)))
      lst
      (let ((pivot (car lst)))
        (append (quicksort (filter (lambda (x) (< x pivot)) (cdr lst)))
                (list pivot)
                (quicksort (filter (lambda (x) (>= x pivot)) (cdr lst)))))))
```

### The Updated Project

This is `quicksort.scm`, in full:

```scheme
(define (quicksort lst)                                       ; ← new
  (if (or (null? lst) (null? (cdr lst)))                        ; ← new
      lst                                                        ; ← new
      (let ((pivot (car lst)))                                    ; ← new
        (append (quicksort (filter (lambda (x) (< x pivot)) (cdr lst)))    ; ← new
                (list pivot)                                                ; ← new
                (quicksort (filter (lambda (x) (>= x pivot)) (cdr lst)))))))  ; ← new

(for-each
 (lambda (lst) (display (quicksort lst)) (newline))
 (list (list 5 3 8 1 9 2 7 4 6 0)
       '()
       (list 1)
       (list 3 3 1 1 2 2)
       (list 5 4 3 2 1)
       (list 1 2 3 4 5)))

(display "matches built-in sort: ")
(display (equal? (quicksort '(9 5 1 8 2 7 3 6 4 0))
                  (sort '(9 5 1 8 2 7 3 6 4 0) <)))
(newline)
```

**Applying Lesson 78's template directly:** **Divide** — choose the first element as the **pivot**, then **partition** the rest into two groups using `filter` (Lesson 35): everything less than the pivot, everything not. **Conquer** — recursively `quicksort` each group, trusted by the leap of faith. **Combine** — `append` the sorted "less than" group, the pivot itself, and the sorted "not less than" group, in that order — free, because the Divide step already guaranteed every element in the first group belongs before the pivot, and every element in the second belongs after it.

### Reference Source

No reference counterpart — `quicksort` is a from-scratch derivation, following Lesson 78's Divide/Conquer/Combine template with a genuinely different Divide step from Lesson 79's.

### Files affected

Created: `quicksort.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile quicksort.scm
(0 1 2 3 4 5 6 7 8 9)
()
(1)
(1 1 2 2 3 3)
(1 2 3 4 5)
(1 2 3 4 5)
matches built-in sort: #t
```

Verified this session — across six varied lists, including an empty list, a single element, duplicates, and an already-sorted list, `quicksort` produces correctly sorted output every time, and agrees exactly with Guile's own built-in `sort` on a seventh, independent check.

### Mechanical Walkthrough

- **`(or (null? lst) (null? (cdr lst)))`** — a reappearance of `or`, `null?`, `cdr`; the identical base case as Lesson 79's `merge-sort`, since a list of zero or one elements needs no partitioning at all.
- **`(let ((pivot (car lst))) ...)`** — a reappearance of `let` and `car`; names the chosen pivot — the first element, the simplest possible choice.
- **`(filter (lambda (x) (< x pivot)) (cdr lst))`** — a reappearance of `filter` (Lesson 35) and `<`; keeps only the elements of the rest of the list smaller than the pivot — the partition's "less than" group.
- **`(filter (lambda (x) (>= x pivot)) (cdr lst))`** — a reappearance of `filter` and a first appearance of `>=`: keeps every element *not* smaller than the pivot — the mirror group, using "greater than or equal" specifically so that an element exactly equal to the pivot lands in one group, not both and not neither.
- **`(append (quicksort ...) (list pivot) (quicksort ...))`** — a reappearance of `append` (Lesson 37) and `list`; the entire Combine step, placing the two already-sorted, already-correctly-ordered groups on either side of the pivot.
- **The real, correct output across every test case, plus the built-in `sort` match** — confirms the whole derivation together, the same standard Lesson 79 applied to `merge-sort`.

### CS Lens

This is Concept Unit 1's mirror image, fully realized: `quicksort`'s partition step does the real comparison work `merge-sort` deferred to its Combine step, and its Combine step (`append`) does the trivial position-based work `merge-sort`'s Divide step handled for free. Two genuinely different algorithms, built from the identical three-step template, distinguished entirely by *which* step carries the real cost. Also recognized in: two different approaches to seating a wedding reception — one that assigns tables carefully up front based on who should sit together (expensive up-front work, trivial to finalize afterward) versus one that seats guests roughly by arrival order and carefully reshuffles the seating chart afterward (cheap up front, expensive to finalize).

### SE Lens

The alternative to choosing the first element as the pivot is to choose some other element — the last, the middle, or one picked at random. The real cost of the simplest choice, the first element, is exactly what Concept Unit 4 measures directly: it works correctly regardless of which element is chosen, but *how well it performs* depends entirely on how that choice interacts with the specific input's existing order — a real trade-off this unit's simplicity defers, and Concept Unit 4 makes concrete.

---

## Concept Unit 3: Real Cost — Worst Case and Typical Case, Diverging in Kind

### The Problem

Concept Unit 2's `quicksort` is correct regardless of pivot choice or input order. It's worth measuring, directly, whether its *cost* is equally indifferent — the same real question Lesson 74 asked of `linear-search`, now asked of a genuinely different, partition-based algorithm.

### The New Code — Type It Yourself

```scheme
(define (partition-count pivot lst)
  (if (null? lst)
      (list '() '())
      (begin
        (set! comparisons (+ comparisons 1))
        (let ((rest (partition-count pivot (cdr lst))))
          (if (< (car lst) pivot)
              (list (cons (car lst) (car rest)) (cadr rest))
              (list (car rest) (cons (car lst) (cadr rest))))))))
```

### The Updated Project

This is `quicksort-cost.scm`, in full:

```scheme
(define comparisons 0)

(define (partition-count pivot lst)                            ; ← new
  (if (null? lst)                                                 ; ← new
      (list '() '())                                                ; ← new
      (begin                                                          ; ← new
        (set! comparisons (+ comparisons 1))                            ; ← new
        (let ((rest (partition-count pivot (cdr lst))))                   ; ← new
          (if (< (car lst) pivot)                                           ; ← new
              (list (cons (car lst) (car rest)) (cadr rest))                  ; ← new
              (list (car rest) (cons (car lst) (cadr rest))))))))               ; ← new

(define (quicksort-c lst)
  (if (or (null? lst) (null? (cdr lst)))
      lst
      (let* ((pivot (car lst))
             (parts (partition-count pivot (cdr lst))))
        (append (quicksort-c (car parts)) (list pivot) (quicksort-c (cadr parts))))))

(define (shuffled-list n)
  (map cdr (sort (map (lambda (x) (cons (random 1000000) x)) (iota n))
                 (lambda (a b) (< (car a) (car b))))))

(for-each
 (lambda (n)
   (set! comparisons 0)
   (quicksort-c (iota n))
   (display "n=") (display n) (display " comparisons=") (display comparisons)
   (display " n(n-1)/2=") (display (/ (* n (- n 1)) 2))
   (newline))
 (list 10 100 1000))

(for-each
 (lambda (n)
   (set! comparisons 0)
   (quicksort-c (shuffled-list n))
   (display "n=") (display n) (display " comparisons=") (display comparisons)
   (display " n*log2(n)=") (display (exact->inexact (* n (/ (log n) (log 2)))))
   (newline))
 (list 10 100 1000 10000))
```

`quicksort-c` reimplements Concept Unit 2's `quicksort` using `partition-count` in place of the two separate `filter` calls, so a single pass over the list counts exactly one comparison per element checked against the pivot, rather than two passes; `shuffled-list` builds a genuinely shuffled input by pairing each value with a random key and sorting by the key, discarding the key afterward.

### Reference Source

No reference counterpart — `quicksort-c` restructures Concept Unit 2's `quicksort` to add Lesson 31-style counting without double-counting each element; `shuffled-list` is a from-scratch helper built for this measurement specifically.

### Files affected

Created: `quicksort-cost.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

**On an already-sorted input, choosing the first (and therefore smallest) element as pivot every time:**

```
n=10 comparisons=45 n(n-1)/2=45
n=100 comparisons=4950 n(n-1)/2=4950
n=1000 comparisons=499500 n(n-1)/2=499500
```

Verified this session — the real comparison count matches `n(n-1)/2` *exactly* at every size tested, identical to Lesson 79's insertion-sort worst case. **Naming why, using Lesson 73's adversary-argument style reasoning:** on an already-sorted list, the first element is always the *smallest* remaining one — every partition puts *zero* elements in the "less than" group and *everything else* in the "not less than" group. The problem never actually shrinks by half; it shrinks by exactly one element per level, `n` levels deep, each level doing up to `n` comparisons — real, checked `Θ(n²)` behavior, not merely a slower constant.

**On the identical sizes, genuinely shuffled using Guile's built-in `random`:**

```
n=10 comparisons=20 n*log2(n)=33.219280948873624
n=100 comparisons=604 n*log2(n)=664.3856189774725
n=1000 comparisons=10089 n*log2(n)=9965.784284662088
n=10000 comparisons=155868 n*log2(n)=132877.1237954945
```

Verified this session — at `n = 1,000`, the identical algorithm needs only `10,089` comparisons on a shuffled input, versus `499,500` on a sorted one — nearly `50` times fewer, at the *identical size*, from a single change to the input's existing order. The ratio to `n log₂(n)` stays within a reasonable, bounded band (roughly `0.6` to `1.2`) across a thousand-fold increase in `n`, the same kind of stable-ratio evidence Lesson 79 used to confirm `merge-sort`'s real `Θ(n log n)` growth.

### Mechanical Walkthrough

- **`(begin (set! comparisons (+ comparisons 1)) (let ((rest ...)) ...))`** — a reappearance of `begin` (Lesson 73), `set!` (Lesson 31); counts exactly one comparison per element of `lst`, before recursing to partition the rest.
- **`(if (< (car lst) pivot) (list (cons (car lst) (car rest)) (cadr rest)) ...)`** — a reappearance of `if`, `<`, `cons`, `car`, `cadr`; places the current element into whichever of the two result lists it belongs, built up from the recursive call's own already-partitioned pair.
- **`(random 1000000)`** — first appearance: a real Guile procedure returning a pseudo-random non-negative integer strictly less than its argument; used here purely to generate distinct random keys for shuffling, without needing to explain a random-number algorithm of its own.
- **`(sort (map (lambda (x) (cons (random 1000000) x)) (iota n)) (lambda (a b) (< (car a) (car b))))`** — a reappearance of `sort` (Lesson 79), `map`, `iota`; pairs each value with a random key, sorts by the key, and `shuffled-list`'s own `map cdr` (not shown separately, part of the same expression) discards the keys afterward, leaving the values in a genuinely randomized order.
- **The exact match to `n(n-1)/2` on sorted input** — direct, checked confirmation this specific `quicksort` (first-element pivot) is genuinely `Θ(n²)` in its worst case, not merely slower by some constant.
- **The dramatic, real gap at the identical `n`** — makes Lesson 74's worst-versus-typical distinction concrete on an algorithm where, unlike `linear-search`, the two cases genuinely belong to different growth-rate categories.

### CS Lens

This is Lesson 74's worst/average/best distinction realized at its sharpest: `linear-search`'s worst and best cases (Lesson 74) differed by a constant factor, both firmly `Θ(n)`; `quicksort`'s worst and typical cases differ in *category*, `Θ(n²)` against something tracking `Θ(n log n)` — the exact situation Lesson 74's Concept Unit 4 and Lesson 76's Exercise 4 both flagged in advance as needing an algorithm like this one to demonstrate concretely. Also recognized in: a delivery route planner whose typical route is efficient but whose worst-case route, triggered by one specific, avoidable routing decision, becomes dramatically — not just slightly — less efficient.

### SE Lens

The alternative to measuring both an adversarial and a typical input is to report only one of the two, the way an incomplete benchmark might. The real cost of that alternative, in either direction, is a seriously misleading impression: reporting only the shuffled-input numbers would hide a real, dramatic risk lurking for sorted or nearly-sorted real-world data (a genuinely common case — log files, already partially processed batches); reporting only the sorted-input numbers would make `quicksort` look uniformly worse than `merge-sort`, when typical performance tells a very different story. Measuring both explicitly, as this unit does, is what a complete, honest cost analysis requires.

---

## Concept Unit 4: The Real Fix, Named Honestly

### The Problem

Concept Unit 3 found a real, dramatic weakness tied to one specific design choice: always picking the first element as pivot. It's worth naming, honestly, what a real fix would involve — without fully deriving and re-verifying an entire second implementation in this lesson.

### No isolated lab for this step

This concept has no code of its own to isolate — the fix is named and reasoned about directly, building on Concept Unit 3's real evidence.

### Applying It — Why a Different Pivot Choice Would Help

Concept Unit 3's worst case came from a specific, exploitable pattern: the pivot happened to always be the smallest (or, symmetrically, the largest) remaining element, producing a maximally *unbalanced* split every single time. Choosing the pivot differently — the middle element, or an element chosen using Guile's own `random` (already used in Concept Unit 3 for generating test input, reusable here for choosing a pivot instead) — would make it far harder for any *one* kind of already-existing input order to reliably trigger the worst case on every single partition.

**What this doesn't fully resolve:** even a randomly chosen pivot can, on any given run, happen to split badly by chance — the worst case doesn't disappear, it becomes far less *likely* to occur reliably, a genuine improvement in the *average* case rather than a change to what the true worst case could still theoretically be. Deriving and verifying a randomized-pivot version rigorously is left as an exercise, not attempted fully here — this lesson's own real evidence (Concept Unit 3) is specific to the simplest, first-element pivot choice.

### Walkthrough

- **"maximally unbalanced split every single time"** — precisely names the mechanism Concept Unit 3's real numbers demonstrated, not just observed.
- **The explicit "left as an exercise, not attempted fully here"** — an honest scope limit, consistent with Lesson 75's own admission about `fast-expt`'s recurrence, rather than implying a fix was fully derived and verified when it wasn't.

### CS Lens

This is the standard, well-known trade-off behind every real pivot-selection strategy: no single fixed choice (first, last, middle) can avoid a worst-case input entirely, since an adversary (Lesson 73's own reasoning, applied here) who knows the strategy can always construct one — but making the choice unpredictable to any such adversary, via randomization, is what real, production sorting implementations actually do. Also recognized in: a security system relying on a fixed, known checkpoint being more exploitable than one whose checks happen at genuinely unpredictable points, precisely because a fixed pattern is something an adversary can plan around in advance.

### SE Lens

The alternative to naming this limitation honestly is to present `quicksort` as simply "fast," the way an incomplete summary might, without ever mentioning the real, measured `Θ(n²)` risk Concept Unit 3 found. The real cost of that alternative is a false sense of safety that could fail exactly where it matters most — on real-world data that happens to already be sorted or nearly so, a genuinely common case, not a contrived one. Naming the risk and its real, if incompletely derived, fix honestly, as this unit does, is what distinguishes engineering judgment from marketing.

---

## Closing

### Connect the pieces

Two algorithms, one template, opposite cost profiles, and a worst case that finally differs in kind:

1. **The mirror image sought (Unit 1):** an expensive Divide step paired with a free Combine step, the opposite of Lesson 79's `merge-sort`.
2. **`quicksort`, derived (Unit 2):** partition around a pivot (Divide), recurse (Conquer, trusted by the leap of faith), `append` (Combine, free) — verified correct across seven real checks.
3. **Real cost, both extremes measured (Unit 3):** `Θ(n²)`, exact to `n(n-1)/2`, on adversarial sorted input; a `Θ(n log n)`-tracking count on shuffled input — nearly `50` times fewer comparisons at the identical `n = 1,000`.
4. **The honest fix, named but not fully derived (Unit 4):** a different pivot strategy reduces the *likelihood* of the worst case without eliminating it, a real trade-off left as an exercise.

Every claim in this lesson traces to real, measured code, checked both where `quicksort` performs at its best and, deliberately, where it performs at its worst — exactly the complete, two-sided cost analysis Lesson 74 first argued for and this lesson finally delivers on an algorithm where the two sides genuinely differ in growth order.

### What breaks without this

Suppose an engineer, having measured `quicksort` only on shuffled test data during development, deployed it into a system that occasionally receives already-sorted or nearly-sorted real input — log entries appended in order, or data already partially processed by an earlier sorting step. Concept Unit 3's real evidence shows exactly what would happen: not a modest slowdown, but a genuine, `Θ(n²)` collapse in performance, on input that looks entirely reasonable and unremarkable to anyone who hasn't seen this lesson's specific evidence. Measuring the adversarial case deliberately, as this lesson does, and understanding *why* it happens (Concept Unit 3's adversary-argument reasoning) is what would let that same engineer catch the risk before a real, already-sorted batch of production data ever hit it.

### Exercises

1. **Observe.** Before checking, predict whether choosing the *last* element as pivot, instead of the first, would still produce a `Θ(n²)` worst case on an already-sorted input, and if so, why.
2. **Formalize.** Modify `quicksort` to choose the last element as pivot, and confirm or correct your Exercise 1 prediction with real, measured comparison counts on a sorted input.
3. **Formalize.** Modify `quicksort` to choose a pivot using Guile's `random` (Concept Unit 3), and measure its real comparison count on the identical already-sorted input Concept Unit 3 used, at `n = 1,000`. Report whether the dramatic worst case disappeared, decreased, or stayed the same.
4. **Explain.** Using Lesson 73's adversary-argument vocabulary, explain in your own words why an adversary who knows `quicksort` always picks the first element as pivot could always construct a worst-case input, but an adversary who doesn't know which random pivot will be chosen has a much harder time doing so.
5. **Explain.** Compare `merge-sort` (Lesson 79) and `quicksort` directly: state one real, concrete situation where `merge-sort`'s guaranteed `Θ(n log n)` (regardless of input order) would be the more responsible engineering choice than `quicksort`'s typically-faster-but-occasionally-`Θ(n²)` real profile.

### Definition of done

- [ ] You can derive `quicksort` from Lesson 78's template, explaining specifically which step (Divide or Combine) carries the real cost, in contrast to `merge-sort`.
- [ ] You can explain, using real measured numbers, why choosing the first element as pivot produces `Θ(n²)` behavior specifically on already-sorted input.
- [ ] You can explain why a shuffled input's real comparison count tracks `n log₂(n)` while a sorted input's does not, for the identical algorithm.
- [ ] You attempted Exercise 3, measuring whether a randomized pivot reduces the real, measured worst-case cost on the identical adversarial input.
- [ ] You completed Exercises 1–5, including at least one real measurement using a pivot strategy different from this lesson's own first-element choice.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating the pivot strategy you tested and its real comparison count on the sorted input.
