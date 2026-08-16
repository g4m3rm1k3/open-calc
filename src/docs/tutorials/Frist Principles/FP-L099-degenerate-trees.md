# Lesson 99: Degenerate Trees

**What you will build:** a real, complete measurement of how much a BST's height can vary for the *identical* set of values, depending purely on the order they're inserted in. Real, verified evidence this session: for `10,000` values, height ranges from `14` (inserting a carefully chosen middle-first order) to `10,000` (inserting in already-sorted order) — a `700`-times difference, for a data structure whose ordering invariant (Lesson 97) holds perfectly at every single height along that entire range. The transferable point: Lesson 97 measured *one* degenerate case, sorted insertion, and moved on. This lesson quantifies the full spectrum — the best possible height, the worst possible height, and where ordinary random insertion actually lands between them — and names exactly why the worst case isn't a rare, contrived edge case, but a realistic risk for real, naturally-ordered data.

**What you need to know first:** Lesson 97 (`FP-L097-binary-search-trees.md`) — specifically the real height measurements this lesson extends into a full comparison. Lesson 98 (`FP-L098-tree-invariants.md`) — specifically that the ordering invariant says nothing about balance, the exact gap this lesson quantifies precisely. Lesson 78 (`FP-L078-divide-and-conquer.md`) — specifically the Divide/Conquer/Combine pattern, reused here to derive the *best possible* insertion order.

**Terms introduced in this lesson**

- **Degenerate tree** — a binary search tree whose height equals the number of values it holds, making it structurally no better than Lesson 12's plain list, despite satisfying Lesson 97's ordering invariant perfectly at every node.

---

## Concept Unit 1: One Bad Case Isn't the Whole Picture

### The Problem

Lesson 97 measured exactly one degenerate case — sorted insertion order producing height `1,000` for `1,000` values — and moved on without asking how *bad* "bad" actually gets, or how *good* "good" could possibly be for the identical data. It's worth measuring the full range.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, extending Lesson 97's own single data point.

### Applying It — Four Real Orders Worth Comparing

The identical `n` values, inserted in four different orders, should be expected to produce four different real heights: already sorted (Lesson 97's own degenerate case), reverse-sorted (an untested but suspiciously similar pattern), genuinely random (Lesson 97's own "typical" case), and — the real question this unit adds — whatever order would produce the *smallest possible* height, to know exactly how far random insertion actually is from optimal.

### Walkthrough

- **The four named orders** — turns "how bad can it get, how good could it be" into four specific, measurable real conditions.
- **"how far random insertion actually is from optimal"** — a genuinely new question Lesson 97 never asked, needing its own real answer.

### CS Lens

This is the difference between finding *a* bad case and characterizing the *full range* of a structure's real behavior — Lesson 74's worst/average/best-case discipline, applied here to a data structure's shape rather than an algorithm's comparison count. Also recognized in: an engineer stress-testing a bridge not just under one specific known-bad load, but across the full range from lightest to heaviest realistic load, to know exactly where the real margin lies.

### SE Lens

The alternative to measuring the full range is to treat Lesson 97's one degenerate example as sufficiently alarming and move directly to a fix. The real cost of that alternative is not knowing whether the fix (Lesson 100 onward) needs to handle a `2×` gap or a `700×` one — the real magnitude, measured in this lesson, is what makes the coming solution's importance concrete rather than assumed.

---

## Concept Unit 2: Deriving the Best Possible Order

### The Problem

Three of Concept Unit 1's four orders (sorted, reverse, random) are easy to produce directly. The fourth — whatever order produces the smallest possible height — needs deriving before it can be measured.

### No isolated lab for this step

This concept has no code of its own to isolate — the derivation reuses Lesson 78's own Divide/Conquer/Combine pattern directly.

### Applying It — Median-First Insertion, Derived From Lesson 78's Pattern

**Divide:** given a sorted range of values, split it at its middle value. **Conquer:** recursively determine the best insertion order for the values below the middle, and separately for the values above it. **Combine:** insert the middle value *first*, then interleave the two recursively-determined orders for its two halves.

**Why this produces the smallest possible height:** inserting the middle value first makes it the tree's root, with (roughly) half the remaining values destined for its left subtree and half for its right — and applying the identical rule recursively to each half means every subtree, at every level, ends up as balanced as the data allows. This is exactly the shape Lesson 78's `dc-max` and Lesson 79's `merge-sort` both derived — split at the middle, solve each half identically — applied here to produce an *insertion order* rather than to solve a problem directly.

### Walkthrough

- **The direct reuse of Lesson 78's own named steps** — this isn't a new derivation technique, it's the identical Divide/Conquer/Combine pattern, applied to a new kind of output (an order, not a value).
- **"exactly the shape Lesson 78's `dc-max` and Lesson 79's `merge-sort` both derived"** — grounds the claim in already-verified prior results rather than presenting it as a fresh, disconnected idea.

### CS Lens

This is divide and conquer used to construct an *optimal input* for another algorithm, rather than to solve a problem directly — a genuinely different use of the identical pattern, showing its reach extends beyond the sorting and searching problems this curriculum has used it for so far. Also recognized in: choosing the order to introduce topics in a course specifically so that each new topic sits at the "middle" of what a learner already half-knows and half-doesn't, rather than teaching in an arbitrary or accidentally worst-case order.

### SE Lens

The alternative to deriving this order carefully is to guess at "some reasonably mixed-up order" and hope it produces good real balance. The real cost of that alternative is not actually knowing whether a given order is close to optimal or merely better than the worst case — deriving the *provably* best order, as this unit does, is what gives Concept Unit 3's measurement a genuine ceiling to compare everything else against.

---

## Concept Unit 3: Measuring the Full Spectrum

### The Problem

Concept Unit 1 named four orders; Concept Unit 2 derived the missing one. It's worth measuring all four for real, on the identical value sets, at more than one scale.

### The New Code — Type It Yourself

```scheme
(define (balanced-order lo hi)
  (if (> lo hi)
      '()
      (let ((mid (quotient (+ lo hi) 2)))
        (cons mid (append (balanced-order lo (- mid 1)) (balanced-order (+ mid 1) hi))))))
```

### The Updated Project

This is `degenerate-check.scm`, in full:

```scheme
(define (make-bst-node value left right) (list value left right))
(define (bst-value n) (car n))
(define (bst-left n) (cadr n))
(define (bst-right n) (caddr n))
(define empty-bst '())
(define (bst-empty? n) (null? n))

(define (bst-insert tree value)
  (if (bst-empty? tree)
      (make-bst-node value empty-bst empty-bst)
      (cond ((< value (bst-value tree))
             (make-bst-node (bst-value tree) (bst-insert (bst-left tree) value) (bst-right tree)))
            ((> value (bst-value tree))
             (make-bst-node (bst-value tree) (bst-left tree) (bst-insert (bst-right tree) value)))
            (else tree))))

(define (build-bst values)
  (let loop ((vs values) (tree empty-bst))
    (if (null? vs) tree (loop (cdr vs) (bst-insert tree (car vs))))))

(define (bst-height tree)
  (if (bst-empty? tree) 0
      (+ 1 (max (bst-height (bst-left tree)) (bst-height (bst-right tree))))))

(define (balanced-order lo hi)                                  ; ← new
  (if (> lo hi)                                                     ; ← new
      '()                                                             ; ← new
      (let ((mid (quotient (+ lo hi) 2)))                                ; ← new
        (cons mid (append (balanced-order lo (- mid 1))                     ; ← new
                           (balanced-order (+ mid 1) hi))))))                   ; ← new

(define (shuffled-list n)
  (map cdr (sort (map (lambda (x) (cons (random 1000000) x)) (iota n))
                 (lambda (a b) (< (car a) (car b))))))

(for-each
 (lambda (n)
   (let ((sorted-height (bst-height (build-bst (iota n))))
         (reverse-height (bst-height (build-bst (reverse (iota n)))))
         (random-height (bst-height (build-bst (shuffled-list n))))
         (balanced-height (bst-height (build-bst (balanced-order 0 (- n 1))))))
     (display "n=") (display n)
     (display " sorted=") (display sorted-height)
     (display " reverse=") (display reverse-height)
     (display " random=") (display random-height)
     (display " balanced-order=") (display balanced-height)
     (display " ceil-log2(n+1)=") (display (ceiling (/ (log (+ n 1)) (log 2))))
     (newline)))
 (list 100 1000 10000))
```

`balanced-order` never touches a BST at all — it produces a plain list of *indices*, `0` through `hi`, reordered so inserting them in that sequence (into any correct `bst-insert`) yields the smallest possible height, by construction.

### Reference Source

Lesson 78's Divide/Conquer/Combine template (`FP-L078-divide-and-conquer.md`), reused directly to derive an insertion order rather than a value.

### Files affected

Created: `degenerate-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile degenerate-check.scm
n=100 sorted=100 reverse=100 random=14 balanced-order=7 ceil-log2(n+1)=7.0
n=1000 sorted=1000 reverse=1000 random=19 balanced-order=10 ceil-log2(n+1)=10.0
n=10000 sorted=10000 reverse=10000 random=33 balanced-order=14 ceil-log2(n+1)=14.0
```

Verified this session — at every scale, `sorted` and `reverse` both produce height exactly `n` (fully degenerate, confirming the pathology isn't specific to ascending order); `balanced-order` produces height *exactly* matching `⌈log₂(n+1)⌉` — `7`, `10`, `14` — the true theoretical minimum for a binary tree holding `n` values, achieved precisely, not merely approximated. At `n = 10,000`, the real range runs from `14` (best) to `10,000` (worst) — a `700`-times difference for the identical set of values. `random`'s real height (`14`, `19`, `33`, matching Lesson 97's own numbers) sits far closer to the optimal end than the degenerate one, but is not itself optimal.

### Mechanical Walkthrough

- **`(quotient (+ lo hi) 2)`** — a reappearance of `quotient`; the identical midpoint computation Lesson 68's `binary-search` used, here choosing which index to insert first instead of which to compare against.
- **`(cons mid (append (balanced-order lo (- mid 1)) (balanced-order (+ mid 1) hi)))`** — a reappearance of `cons`, `append`; places the middle index first in the resulting order, then the recursively-ordered lower half, then the recursively-ordered upper half.
- **The real, exact match between `balanced-order`'s height and `⌈log₂(n+1)⌉`** — direct, checked confirmation this insertion order achieves the true theoretical best, not just an improvement over random.
- **`sorted` and `reverse` both at exactly `n`** — confirms the degenerate pathology is symmetric, not an artifact of ascending order specifically.

### CS Lens

This is Lesson 74's worst/average/best-case framework applied to a data structure's *shape* rather than an algorithm's cost directly: `n` (worst, sorted or reverse), `⌈log₂(n+1)⌉` (best, `balanced-order`), and random insertion landing at a real, measured point closer to the best case but not achieving it — three genuinely different real numbers for the identical underlying data. Also recognized in: a stack of identical building blocks that can be arranged into a stable, `log`-height pyramid or an unstable, full-height single tower — the material is identical; only the arrangement determines the real, structural outcome.

### SE Lens

The alternative to measuring all four orders is to report only the worst and the typical case, the way Lesson 97 did. The real cost of that alternative is not knowing the true size of the available improvement — Concept Unit 4 uses this lesson's `700×` real gap specifically to make the case for why later lessons (Lesson 100 onward) are worth the real engineering effort they require.

---

## Concept Unit 4: Why This Isn't a Contrived Edge Case

### The Problem

Concept Unit 3's `sorted`/`reverse` degenerate cases might look like artificial worst cases nobody would actually construct on purpose. It's worth naming, honestly, why real systems produce exactly this pattern without anyone intending to.

### No isolated lab for this step

This concept has no code of its own to isolate — the argument is stated directly, using Concept Unit 3's own real numbers.

### Applying It — Real Sources of Already-Sorted Data

Sequential IDs assigned in increasing order, timestamps recorded as events occur, records already sorted by an earlier processing step before being inserted into a new tree — all of these are common, realistic sources of data that arrives *already sorted*, not through any adversarial intent (Lesson 73's adversary, by contrast, had to deliberately construct a bad case). A system inserting timestamped log entries into a BST *as they occur* is, structurally, doing exactly Concept Unit 3's `sorted` insertion — heading toward height `n`, not through misuse, but through the single most natural way such data actually arrives.

### Walkthrough

- **The explicit contrast with Lesson 73's adversary** — this lesson's worst case doesn't require an adversary at all; ordinary, well-intentioned data naturally produces it.
- **The concrete timestamped-log example** — turns "sorted insertion is realistic" into a specific, plausible real scenario rather than an abstract possibility.

### CS Lens

This is precisely why Lesson 97's invariant, correct as it is, isn't the end of the real engineering story: a structure can be perfectly correct and still perform arbitrarily badly on real, unremarkable data, for reasons that have nothing to do with anyone doing anything wrong. Also recognized in: a filing system that works perfectly for randomly-arriving documents but collapses into a single unsearchable pile if documents happen to arrive in a specific, common pattern nobody thought to plan for.

### SE Lens

The alternative to naming this risk explicitly is to treat the degenerate case as a theoretical curiosity, addressed only if it happens to come up. The real cost of that alternative, given how common naturally-sorted or naturally-ordered real data actually is, is deploying a structure with a real, `700×`-magnitude performance cliff sitting directly in the path of ordinary, expected usage — precisely the motivation Lesson 100's rotations and Lessons 101–103's self-balancing trees exist to remove, by keeping a tree close to `balanced-order`'s real result *automatically*, regardless of what order data actually arrives in.

---

## Closing

### Connect the pieces

One question about the true range, one derived optimal order, a real, measured spectrum, and an honest reason it matters:

1. **The narrower question, widened (Unit 1):** not just "is sorted insertion bad," but "how bad, compared to how good it could be."
2. **The best possible order, derived (Unit 2):** median-first insertion, using Lesson 78's own Divide/Conquer/Combine pattern.
3. **The full spectrum, measured (Unit 3):** `n` (sorted/reverse) down to `⌈log₂(n+1)⌉` (optimal) — a real `700×` range at `n = 10,000`.
4. **Why it's not contrived (Unit 4):** ordinary, well-intentioned data — sequential IDs, timestamps — naturally produces the worst case, with no adversary required.

Every claim in this lesson traces to real, executed code: four genuinely different insertion orders, measured on the identical values, with the theoretically optimal order derived from an already-trusted pattern and its real result matching the true mathematical minimum exactly.

### What breaks without this

Suppose a real logging system inserted each new event into a BST as it occurred, keyed by timestamp — the most natural design imaginable, with nothing about it looking careless. Concept Unit 3's real evidence shows exactly what would happen as that log grows: height climbing to match the total event count, every search degrading toward Lesson 96's own list-like `O(n)` cost, for a structure that was never misused, only fed data in the single most common real order such data actually arrives in. Understanding this risk precisely, and quantifying its true size, as this lesson does, is what makes Lesson 100 onward a response to a demonstrated, common problem rather than a solution to a rare, hypothetical one.

### Exercises

1. **Observe.** Before checking, predict the real height of a BST built by inserting values in an order that alternates between the smallest and largest remaining value (`0`, `n-1`, `1`, `n-2`, `2`, ...), using this lesson's own reasoning about what makes an order good or bad.
2. **Formalize.** Confirm your Exercise 1 prediction with real code and a real measurement, at the same three scales as Concept Unit 3.
3. **Formalize.** Measure `balanced-order`'s real height at `n = 100,000` and `n = 1,000,000`, confirming it continues to match `⌈log₂(n+1)⌉` exactly at larger scales.
4. **Explain.** In your own words, explain why `balanced-order`'s Divide/Conquer/Combine derivation guarantees the *smallest possible* height, not merely a small one, referencing what would have to be true for any height smaller than `⌈log₂(n+1)⌉` to hold `n` values at all.
5. **Explain.** Using this lesson's real numbers, explain why "just insert in a good order" is not a practical fix for the timestamped-log scenario in Concept Unit 4, even though `balanced-order` is provably optimal — what real constraint makes it unusable there.

### Definition of done

- [ ] You can state the real height range this lesson measured, from best to worst, for the identical set of values.
- [ ] You can explain how `balanced-order` is derived from Lesson 78's Divide/Conquer/Combine pattern, applied to producing an order rather than solving a problem directly.
- [ ] You can explain why real, well-intentioned data commonly produces the degenerate case, without needing Lesson 73's adversarial reasoning.
- [ ] You can explain why insertion-order control is not a practical general solution, motivating Lesson 100's different approach.
- [ ] You completed Exercises 1–5, including a real measurement at a scale not tested in this lesson.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating the insertion order you tested and its real, measured height.
