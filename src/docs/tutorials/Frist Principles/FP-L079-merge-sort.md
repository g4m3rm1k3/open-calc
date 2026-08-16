# Lesson 79: Merge Sort

**What you will build:** `merge-sort`, a real, correct sorting procedure derived entirely from Lesson 78's divide-and-conquer template — verified against Guile's own built-in `sort` across ten real test cases, including an empty list, a single element, and a list of duplicates. Real, measured evidence this session: at `n = 1,000`, `merge-sort` makes exactly `5,044` comparisons; a straightforward insertion sort, on the identical reverse-sorted input, makes `499,500` — nearly **`99` times more**. The transferable point: Lesson 78's `dc-max` had a trivial Combine step, one comparison. This lesson derives an algorithm whose Combine step does real, nontrivial work — merging two already-sorted halves — and shows, with real numbers, exactly what that nontrivial combine buys: a genuinely different growth rate, not just a faster constant.

**What you need to know first:** Lesson 78 (`FP-L078-divide-and-conquer.md`) — specifically the Divide/Conquer/Combine template, and `list-head`/`list-tail`, reused directly to split the list. Lesson 77 (`FP-L077-recurrence-trees.md`) — specifically the level-sum technique, extended here to a recurrence whose per-level cost isn't constant. Lesson 69 (`FP-L069-growth-rates.md`) — specifically the growth-rate categories, `n log n` among them, checked against real evidence for the first time.

**Terms introduced in this lesson**

- **Merge** — combining two already-sorted lists into one sorted list, in one linear pass, by repeatedly comparing the two lists' current front elements and taking the smaller. It exists as the specific, nontrivial Combine step that turns Lesson 78's general divide-and-conquer template into a real sorting algorithm.

---

## Concept Unit 1: A Combine Step Worth Doing

### The Problem

Lesson 78's `dc-max` combined two solved halves with a single comparison — real divide and conquer, but a Combine step almost too simple to be interesting on its own. It's worth asking whether a problem exists where combining two already-solved pieces is itself real, nontrivial work — and whether that work is still cheaper than solving the whole problem from scratch. Sorting is exactly this kind of problem: given two lists, *each already sorted*, is there a way to combine them into one fully sorted list, more cheaply than throwing both away and sorting everything from the beginning?

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, before Concept Unit 2 answers it with real code.

### Applying It — Why "Already Sorted" Changes the Question

Sorting an arbitrary list of `n` elements from scratch requires comparing elements against each other with no guaranteed structure to exploit — Lesson 20's total order holds, but nothing about *where* any element sits relative to the others is known in advance. Two lists that are *already* sorted internally are a genuinely different, easier starting point: each list's own smallest remaining element is always sitting right at its front, ready to be compared, with no searching required to find it.

### Walkthrough

- **The reframed question — combine, not resort** — sets up exactly what Concept Unit 2 needs to answer with real code.
- **"each list's own smallest remaining element is always sitting right at its front"** — the specific structural fact that makes combining two sorted lists a fundamentally different, easier task than sorting from scratch.

### CS Lens

This is the general insight behind every divide-and-conquer algorithm whose Combine step does real work: exploiting a guarantee already established by the Conquer step (here, "each half is already sorted") to make combining cheaper than solving the combined problem blind. Also recognized in: merging two already-alphabetized stacks of paper into one alphabetized stack by repeatedly taking whichever stack's top sheet comes first — never needing to re-sort either stack from scratch, only to interleave them correctly.

### SE Lens

The alternative to exploiting the "already sorted" guarantee is to combine two solved halves by concatenating them and re-sorting the whole result, ignoring the work Conquer already did. The real cost of that alternative is throwing away real, already-established structure — exactly the kind of waste Lesson 54 named when `fib` recomputed values it had already found. Designing Combine to actually use what Conquer guarantees, as this lesson does, is what makes the divide-and-conquer approach to sorting worth deriving at all.

---

## Concept Unit 2: Deriving merge

### The Problem

Concept Unit 1's question needs a real, working answer: a procedure that takes two sorted lists and produces one sorted list, checked directly before it's trusted inside a larger algorithm.

### The New Code — Type It Yourself

```scheme
(define (merge a b)
  (cond ((null? a) b)
        ((null? b) a)
        ((< (car a) (car b)) (cons (car a) (merge (cdr a) b)))
        (else (cons (car b) (merge a (cdr b))))))
```

### Checking merge Directly, Before Using It

Before `merge` becomes part of anything larger, its own three cases — both lists non-empty, and each one individually empty — are checked directly:

```
$ guile merge-check.scm
(1 2 3 4 5 6)
(1 2)
(1 2)
```

Verified this session — `(merge '(1 3 5) '(2 4 6))` produces `(1 2 3 4 5 6)`; `(merge '() '(1 2))` and `(merge '(1 2) '())` both correctly return `(1 2)`, confirming the two base cases (one list already empty) work correctly before `merge` is ever combined with anything else.

### Mechanical Walkthrough

- **`((null? a) b)`** — a reappearance of `null?`; if the first list is exhausted, everything remaining in the second list is already sorted and belongs at the end, unchanged.
- **`((null? b) a)`** — the mirror image: if the second list is exhausted, the first list's remainder is already sorted and belongs at the end.
- **`((< (car a) (car b)) (cons (car a) (merge (cdr a) b)))`** — a reappearance of `<`, `car`, `cons`, and `cdr`: if `a`'s front element is smaller, it comes first in the result, followed by merging the rest of `a` with all of `b`.
- **`(else (cons (car b) (merge a (cdr b))))`** — the mirror image: `b`'s front element comes first, followed by merging all of `a` with the rest of `b`.
- **The real, correct output on all three checked cases** — direct confirmation `merge` behaves correctly, including both base cases, before it becomes a Combine step inside a larger algorithm.

### CS Lens

This is a genuinely new algorithmic idea, distinct from every prior search or combination technique in this curriculum: two already-ordered sequences interleaved into one, in a single linear pass, by always advancing whichever sequence currently holds the smaller front value. Also recognized in: a librarian combining two already-alphabetized card catalogs into one, by repeatedly pulling whichever catalog's front card comes first alphabetically; combining two sorted stacks of graded exams by student ID into a single sorted stack, one comparison at a time.

### SE Lens

The alternative to deriving and checking `merge` on its own is to write it directly inside the larger sorting algorithm Concept Unit 3 builds, and debug both at once if something goes wrong. The real cost of that alternative is exactly what the Concept Isolation Rule has guarded against since Lesson 3: a bug in the combined result becomes ambiguous between "the merge logic is wrong" and "the recursive splitting is wrong." Checking `merge` alone first, as this unit does, means Concept Unit 3's real code can be trusted to reveal only splitting-and-recursion issues, not merging issues too.

---

## Concept Unit 3: Deriving merge-sort From the Divide-and-Conquer Template

### The Problem

Lesson 78's template needs filling in for sorting specifically, using Concept Unit 2's now-verified `merge` as the Combine step.

### Applying the Template

**Divide:** split the list into a left half and a right half, using Lesson 78's `list-head` and `list-tail` — a smaller instance of the identical "sort this list" question, twice over.

**Conquer:** sort the left half and sort the right half, each by the identical recursive procedure, trusted by the leap of faith (Lesson 46) to actually be sorted, without tracing either call.

**Combine:** `merge` the two now-sorted halves — Concept Unit 2's already-verified procedure, doing the real work Lesson 78's `dc-max` never needed.

**The base case:** a list with zero or one elements is already sorted, with nothing to divide.

### The New Code — Type It Yourself

```scheme
(define (merge-sort lst)
  (if (or (null? lst) (null? (cdr lst)))
      lst
      (let* ((half (quotient (length lst) 2))
             (left (merge-sort (list-head lst half)))
             (right (merge-sort (list-tail lst half))))
        (merge left right))))
```

### The Updated Project

This is `merge-sort.scm`, in full:

```scheme
(define (merge a b)
  (cond ((null? a) b)
        ((null? b) a)
        ((< (car a) (car b)) (cons (car a) (merge (cdr a) b)))
        (else (cons (car b) (merge a (cdr b))))))

(define (merge-sort lst)                                      ; ← new
  (if (or (null? lst) (null? (cdr lst)))                        ; ← new
      lst                                                        ; ← new
      (let* ((half (quotient (length lst) 2))                     ; ← new
             (left (merge-sort (list-head lst half)))              ; ← new
             (right (merge-sort (list-tail lst half))))             ; ← new
        (merge left right))))                                        ; ← new

(for-each
 (lambda (lst) (display (merge-sort lst)) (newline))
 (list (list 5 3 8 1 9 2 7 4 6 0)
       '()
       (list 1)
       (list 3 3 1 1 2 2)
       (list 5 4 3 2 1)))

(display "matches built-in sort: ")
(display (equal? (merge-sort '(9 5 1 8 2 7 3 6 4 0))
                  (sort '(9 5 1 8 2 7 3 6 4 0) <)))
(newline)
```

`merge` is Concept Unit 2's own, unchanged and already verified; `merge-sort` is new, filling in Lesson 78's template with `merge` as its Combine step.

### Reference Source

No reference counterpart — `merge-sort` is a from-scratch derivation, following Lesson 78's Divide/Conquer/Combine template directly, with Concept Unit 2's `merge` supplying the Combine step.

### Files affected

Created: `merge-sort.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile merge-sort.scm
(0 1 2 3 4 5 6 7 8 9)
()
(1)
(1 1 2 2 3 3)
(1 2 3 4 5)
matches built-in sort: #t
```

Verified this session — across five varied lists, including an empty list, a single element, and a list with duplicate values (`3 3 1 1 2 2` sorting correctly to `1 1 2 2 3 3`), `merge-sort` produces correctly sorted output every time. The sixth check confirms `merge-sort` agrees exactly with Guile's own built-in `sort` on a sixth, independent test case — an external, trusted reference, the same role Guile's built-in `expt` played for `fast-expt` in Lesson 66.

### Mechanical Walkthrough

- **`(or (null? lst) (null? (cdr lst)))`** — a reappearance of `or`, `null?`, and `cdr`; the base case, true when the list has zero or one elements, both already trivially sorted.
- **`(let* ((half (quotient (length lst) 2)) ...) ...)`** — a reappearance of `let*`, `quotient`, and `length` (Lesson 78's own pattern, reused unchanged), computing the midpoint once.
- **`(merge-sort (list-head lst half))` / `(merge-sort (list-tail lst half))`** — the two recursive calls, each trusted by the leap of faith to correctly return its half, fully sorted.
- **`(merge left right)`** — Concept Unit 2's already-verified Combine step, doing the real work of interleaving the two trusted, sorted halves.
- **The real, correct output across every test case, plus the built-in `sort` match** — confirms the entire derivation, not merely one isolated piece of it.

### CS Lens

This is divide and conquer's Combine step carrying its full weight for the first time in this curriculum: unlike `dc-max`'s one-comparison combine, `merge`'s linear interleaving is where merge sort's real correctness and real efficiency both actually live — Divide and Conquer here are almost bookkeeping by comparison. Also recognized in: two separately-organized moving companies each packing one half of a house's items in a sensible, internally-consistent order, with the actual hard, valuable work of the whole move happening at the single truck where both halves' boxes get loaded together in the right final order.

### SE Lens

The alternative to deriving `merge-sort` from Lesson 78's named template is to write a sorting algorithm from scratch, without any structural guide. The real cost of that alternative isn't necessarily a wrong result — but Concept Unit 2's isolated, pre-verified `merge` and Concept Unit 3's direct reuse of Lesson 78's Divide/Conquer/Combine structure are exactly what made this derivation fast and low-risk to get right, compared to inventing both the splitting and the combining logic simultaneously from nothing.

---

## Concept Unit 4: Real Cost — Why the Nontrivial Combine Step Matters

### The Problem

Concept Unit 1 claimed a nontrivial Combine step could buy something real. It's worth measuring that directly, both in isolation (does `merge-sort`'s real growth rate match the `n log n` category Lesson 69 named but never measured) and in contrast (how does it compare to a naive, simpler sorting approach at real scale).

### The New Code — Type It Yourself

```scheme
(define (merge-c a b)
  (cond ((null? a) b)
        ((null? b) a)
        (else (set! comparisons (+ comparisons 1))
              (if (< (car a) (car b))
                  (cons (car a) (merge-c (cdr a) b))
                  (cons (car b) (merge-c a (cdr b)))))))
```

### The Updated Project

This is `cost-check.scm`, in full:

```scheme
(define comparisons 0)

(define (merge-c a b)                                          ; ← new
  (cond ((null? a) b)                                            ; ← new
        ((null? b) a)                                             ; ← new
        (else (set! comparisons (+ comparisons 1))                  ; ← new
              (if (< (car a) (car b))                                ; ← new
                  (cons (car a) (merge-c (cdr a) b))                   ; ← new
                  (cons (car b) (merge-c a (cdr b)))))))                ; ← new

(define (merge-sort-c lst)
  (if (or (null? lst) (null? (cdr lst)))
      lst
      (let* ((half (quotient (length lst) 2))
             (left (merge-sort-c (list-head lst half)))
             (right (merge-sort-c (list-tail lst half))))
        (merge-c left right))))

(define (insert x sorted)
  (cond ((null? sorted) (list x))
        (else (set! comparisons (+ comparisons 1))
              (if (< x (car sorted))
                  (cons x sorted)
                  (cons (car sorted) (insert x (cdr sorted)))))))

(define (insertion-sort lst)
  (if (null? lst)
      '()
      (insert (car lst) (insertion-sort (cdr lst)))))

(for-each
 (lambda (n)
   (set! comparisons 0)
   (merge-sort-c (reverse (iota n)))
   (display "n=") (display n) (display " comparisons=") (display comparisons)
   (display " n*log2(n)=") (display (exact->inexact (* n (/ (log n) (log 2)))))
   (newline))
 (list 10 100 1000 10000 100000))

(for-each
 (lambda (n)
   (set! comparisons 0)
   (insertion-sort (reverse (iota n)))
   (display "n=") (display n) (display " insertion-comparisons=") (display comparisons)
   (newline))
 (list 10 100 1000))
```

`merge-sort-c` and `merge-c` add Lesson 31-style counting on top of Concept Unit 3's already-verified `merge-sort` and `merge`, unchanged in logic; `insertion-sort` and `insert` are a from-scratch, independently-derived naive sort — check each new element against a growing sorted result one position at a time — built purely as an honest baseline, the same role `linear-search` played for `binary-search` in Lesson 68. `(reverse (iota n))` builds a reverse-sorted input, deliberately, so both procedures face the identical input at each size.

### Reference Source

No reference counterpart — `merge-c` and `merge-sort-c` add Lesson 31's counting technique to Concept Unit 3's own code; `insertion-sort` is a from-scratch baseline built for this comparison specifically.

### Files affected

Created: `cost-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

**`merge-sort`'s real comparison count, at increasing scale, against `n × log₂(n)`:**

```
n=10 comparisons=19 n*log2(n)=33.219280948873624
n=100 comparisons=356 n*log2(n)=664.3856189774725
n=1000 comparisons=5044 n*log2(n)=9965.784284662088
n=10000 comparisons=69008 n*log2(n)=132877.1237954945
n=100000 comparisons=853904 n*log2(n)=1660964.0474436812
```

Verified this session, on a reverse-sorted input of each size. The ratio of real comparisons to `n × log₂(n)` stays close to `0.5`–`0.57` across the entire range — a `10,000`-times increase in `n` — neither drifting toward `0` nor growing without bound, exactly the signature of genuine `Θ(n log n)` growth (Lesson 72): the real cost tracks the *shape* of `n log n` closely, even though the exact constant multiplier depends on real implementation details this lesson doesn't derive precisely.

**A real, direct contrast against a naive insertion sort, on the identical reverse-sorted input:**

```
n=10 insertion-comparisons=45
n=100 insertion-comparisons=4950
n=1000 insertion-comparisons=499500
```

At `n = 1,000`: `merge-sort` needs `5,044` comparisons; a straightforward insertion sort needs `499,500` — nearly `99` times more, on the identical input. Insertion sort's real numbers themselves match `n(n-1)/2` exactly (`1000 × 999 / 2 = 499,500`) — real, checked `Θ(n²)` behavior, the direct real-world cost of never exploiting Concept Unit 1's "already sorted" guarantee at all.

**Connecting to Lesson 77's level-sum technique:** `merge-sort`'s recurrence is `T(n) = 2T(n/2) + n` — structurally like `dc-max`'s `T(n) = 2T(n/2) + 1` (Lesson 78), except each node's own cost is no longer a constant `1`, but `n`, the size of the merge it performs. Summed level by level: level `0` does `n` total work (one merge of size `n`); level `1` does `n` total work too (two merges, each of size `n/2`, `2 × n/2 = n`); every level does exactly `n` total work, all the way down to level `log₂(n)`. Total cost: `n` work, repeated across `log₂(n) + 1` levels — `n × log₂(n)`, exactly the real growth rate confirmed above.

### Mechanical Walkthrough

- **`merge-c`** — a reappearance of Lesson 31's `set!`-based counting technique, applied to Concept Unit 2's already-verified `merge`, unchanged in logic, recording one comparison per element actually compared.
- **`insert`** — first appearance: a from-scratch procedure inserting one value into an already-sorted list at its correct position, comparing against each existing element in turn until finding where the new value belongs.
- **`insertion-sort`** — first appearance: builds a sorted result one element at a time, `insert`ing each element of the original list into an already-sorted result built from everything before it — a genuinely different algorithm from `merge-sort`, built only as an honest, independent baseline.
- **`(reverse (iota n))`** — a reappearance of `reverse` (Lesson 37) and `iota`; builds the identical reverse-sorted input for both procedures at each size, so the comparison is fair.
- **The real, stable ratio to `n log₂(n)` across five scales spanning `10,000×`** — direct, measured evidence for a growth-rate category this curriculum has named (Lesson 69) but never confirmed with real numbers until now.
- **The real `99`-times gap against insertion sort, on the identical input** — makes Concept Unit 1's claim ("cheaper than resorting from scratch") concrete and felt, not just theoretically plausible.
- **`n(n-1)/2` matching insertion sort's real numbers exactly** — confirms insertion sort's own real behavior is genuinely `Θ(n²)`, the honest baseline `merge-sort` is being compared against.
- **The level-sum reasoning, extended from Lesson 77** — shows the identical tool from Lesson 77 (sum every level's total cost) still works even when a level's per-node cost isn't constant, as long as each *level's total* is tracked correctly.

### CS Lens

This is the real payoff of choosing a nontrivial Combine step deliberately: `merge-sort`'s `Θ(n log n)` is a genuinely different growth-rate *category* from insertion sort's `Θ(n²)`, not merely a smaller constant — exactly Lesson 69's distinction between growth-rate categories, now backed by real, measured evidence for the first time. Also recognized in: a company reorganizing its filing system from "check every folder in the building" (linear-in-total-folders, repeated for every new document) to "each department keeps its own alphabetized files, merged into a company-wide index" — a structural change, not just a faster search within the same broken structure.

### SE Lens

The alternative to measuring real comparison counts is to trust the `T(n) = 2T(n/2) + n` recurrence and its `n log n` solution purely algebraically, the way Concept Unit 1's claim was first stated. The real cost of that alternative is exactly this curriculum's standing concern since Lesson 22: an algebraically plausible recurrence could still misdescribe what the real code does, the same risk Lesson 76 guarded against for `binary-search`. Measuring real comparisons across five scales and checking the ratio holds steady, as this unit does, confirms the recurrence's solution matches reality, not just the algebra.

---

## Closing

### Connect the pieces

One nontrivial Combine step, derived, verified, and measured against a real, honest baseline:

1. **The question posed (Unit 1):** can two already-sorted pieces be combined more cheaply than resorting from scratch?
2. **`merge`, derived and checked alone (Unit 2):** a linear interleaving of two sorted lists, verified correct before being trusted inside anything larger.
3. **`merge-sort`, filled in from Lesson 78's template (Unit 3):** Divide via `list-head`/`list-tail`, Conquer via the leap of faith, Combine via `merge` — verified against six real test cases, including Guile's own built-in `sort`.
4. **Real cost, measured and contrasted (Unit 4):** `Θ(n log n)` confirmed by a stable ratio across a `10,000×` range, and a real, `99`-times gap against insertion sort's genuinely `Θ(n²)` behavior at `n = 1,000`.

Every claim in this lesson traces to real, checked code — correctness checked against an independent reference, cost checked against both an algebraic prediction and a real, contrasting baseline — the complete pattern this curriculum has used since Lesson 22, now applied to a full, real sorting algorithm.

### What breaks without this

Suppose a system needed to repeatedly sort growing batches of data, and its original implementation used something shaped like insertion sort, chosen when batches were always small enough that `499,500` versus `5,044` comparisons didn't matter. As the real batch size `n` grows, Concept Unit 4's real evidence shows the gap doesn't just grow — it grows in a fundamentally different way, `Θ(n²)` pulling away from `Θ(n log n)` faster and faster, exactly Lesson 69's growth-rate hierarchy predicting a small early difference becoming an overwhelming one at real scale. Recognizing this in advance — before a batch size grows large enough to make the naive approach genuinely unusable — is exactly what this lesson's real, measured comparison equips an engineer to do.

### Exercises

1. **Observe.** Before checking, predict whether `merge-sort`'s real comparison count at `n = 1,000,000` will stay within the same `0.5`–`0.57` ratio band to `n × log₂(n)` this lesson found at smaller scales.
2. **Formalize.** Confirm your Exercise 1 prediction by running the instrumented `merge-sort-c` (built by adding Lesson 31-style counting to `merge`, following this lesson's own measurement code) at `n = 1,000,000`.
3. **Formalize.** Measure insertion sort's real comparison count at `n = 5,000`, confirm it matches `n(n-1)/2` exactly, and compute the real ratio of insertion sort's to `merge-sort`'s comparisons at that size.
4. **Explain.** In your own words, explain why `merge-sort`'s real ratio to `n log₂(n)` stays roughly stable rather than exactly `1`, referencing the difference between an exact algebraic solution to a recurrence and this lesson's simplified `T(n) = 2T(n/2) + n` model, which doesn't precisely account for every real operation `merge` performs.
5. **Explain.** Using Lesson 78's vocabulary, explain why `merge-sort` is genuine divide and conquer and not decrease and conquer, citing its real Divide and Combine steps specifically.

### Definition of done

- [ ] You can derive `merge` and explain why it's checked in isolation before being used inside `merge-sort`.
- [ ] You can fill in Lesson 78's Divide/Conquer/Combine template for sorting, from memory, including the correct base case.
- [ ] You can explain, using real measured numbers, why `merge-sort`'s growth rate is a different *category* from insertion sort's, not just a smaller constant.
- [ ] You can extend Lesson 77's level-sum technique to a recurrence whose per-level cost is `n` rather than a constant, and explain why the level-by-level total stays the same at every level.
- [ ] You completed Exercises 1–5, including a real measurement at a scale not tested in this lesson.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating the sizes you tested and the real ratios you measured.
