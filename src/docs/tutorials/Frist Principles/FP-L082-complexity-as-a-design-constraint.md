# Lesson 82: Complexity as a Design Constraint

**What you will build:** `share-element?`, solved two genuinely different ways for a problem this curriculum hasn't built before — does list `a` share any element with list `b`? — with the *second* approach chosen deliberately, using Era III's own tools, **before** writing its real code, not discovered to be better only after the fact. Real, verified evidence this session: on two same-sized, non-overlapping lists of `1,000` elements each, the naive approach makes exactly `1,000,000` comparisons — real, measured `Θ(n²)` behavior — while the sort-then-search approach, predicted in advance to be better, makes only `9,000` — over `100` times fewer, confirming the prediction rather than merely following it. The transferable point: every algorithm in Era III so far was analyzed for its cost — sometimes before writing code (Lesson 75's recurrences), sometimes only after (Lesson 68's real timing). This lesson closes Era III by using the *entire* toolkit built since Lesson 56 deliberately, at design time, on a problem approached for the very first time — complexity as a genuine constraint shaping a choice, not a report card issued afterward.

**What you need to know first:** This lesson deliberately draws on the whole of Era III rather than one specific prior lesson — Lesson 56 (counting predicts runtime), Lesson 71–73 (Big-O, Big-Theta, Big-Omega), Lesson 74 (worst/average/best case), Lesson 75–77 (recurrences and recurrence trees), Lesson 78–80 (divide and conquer, merge sort, quicksort), and Lesson 81 (lower bounds) all get named and used directly below.

**Terms introduced in this lesson**

- **Complexity-first design** — predicting an approach's growth-rate category *before* writing its real code, and using that prediction as a genuine constraint on which approach to build — ruling one out, or choosing between two correct options — rather than treating complexity analysis as something to measure only once code already exists. It exists because every real engineering decision about which algorithm to build happens *before* the algorithm is built, and Era III's tools are only a design constraint, rather than a retrospective, if they're usable at that earlier point.

---

## Concept Unit 1: A New Problem, Approached Deliberately

### The Problem

A genuinely new question, not yet solved anywhere in this curriculum: given two lists, `a` and `b`, do they share at least one common element? Before writing any code at all, it's worth asking what Era III's tools predict about the obvious first approach — and whether that prediction should change what gets built.

### No isolated lab for this step

This concept has no code of its own to isolate — the question and its first, most obvious approach are reasoned about directly, before any code is written.

### Applying It — Predicting the Obvious Approach's Cost, Before Writing It

The most direct approach: for every element of `a`, check whether it appears anywhere in `b`, the way Lesson 68's `linear-search` checks for one target. If `a` has `n` elements and `b` has `m`, and checking membership in `b` costs up to `m` comparisons (Lesson 68's own real, established worst case), checking *every* element of `a` this way costs up to `n × m` comparisons total — `Θ(n²)` when `a` and `b` are similarly sized, exactly Lesson 69's "quadratic" category, predicted from Era III's own vocabulary alone, without a single line of this specific procedure's code having been written yet.

### Walkthrough

- **The direct reuse of `linear-search`'s known worst case** — Lesson 68's real, already-established `Θ(n)` cost is applied here as a *building block* in a larger prediction, not re-derived.
- **"`n × m` comparisons... predicted... without a single line of this specific procedure's code having been written yet"** — names precisely what makes this complexity-first: the classification exists before the implementation does.

### CS Lens

This is complexity analysis functioning as a design tool rather than a post-hoc report: the same reasoning Lesson 75 used to derive a recurrence from already-written code is used here on a plan that doesn't have code yet, predicting a growth-rate category from the shape of an approach alone. Also recognized in: an engineer estimating a bridge design's material cost from its blueprint's dimensions, before any material is purchased, using known per-unit costs the same way this unit reuses `linear-search`'s known per-check cost.

### SE Lens

The alternative to predicting first is to simply write the nested-checking approach, measure it, and only then discover whether it's fast enough — exactly the *order* every other algorithm's analysis in Era III happened in, until now. The real cost of that alternative, at real scale, is discovering a `Θ(n²)` problem only after time has already been spent building and possibly deploying it. Predicting the category first, as this unit does, is what makes the *next* unit's search for a better approach a deliberate choice instead of a reaction to a problem already found the hard way.

---

## Concept Unit 2: Designing a Better Approach, Before Building It

### The Problem

Concept Unit 1 predicted `Θ(n²)` for the obvious approach. It's worth asking, deliberately and before writing code, whether Era III's own tools suggest a genuinely better design — the same complexity-first discipline applied to searching for an alternative, not just analyzing the first idea.

### No isolated lab for this step

This concept has no code of its own to isolate — the design reasoning is stated directly below, using tools already built in Lessons 68 and 79.

### Applying It — Reusing Sorting and Binary Search as Design Tools

Lesson 68 already established that a *sorted* collection supports much cheaper membership checks — `O(log n)` via `binary-search`, instead of linear search's `O(n)`. Lesson 79 already established a real, correct way to sort a list in `Θ(n log n)`: `merge-sort` (or, via Guile's own built-in `sort`, functionally the identical idea). Combining both, entirely on paper before writing this specific procedure's code: sort `b` once (`Θ(m log m)`), then check each of `a`'s `n` elements against the now-sorted `b` using binary search (`Θ(n log m)` total) — a total predicted cost of `Θ(m log m + n log m)`, which, for similarly-sized lists, is `Θ(n log n)` — a different, smaller growth-rate *category* than Concept Unit 1's `Θ(n²)`, predicted the same way Lesson 74's Concept Unit 4 and Lesson 80 distinguished growth-rate categories, not just constants.

### Walkthrough

- **Reusing `binary-search`'s and `merge-sort`'s already-established costs as design components** — the core complexity-first move: combining two already-analyzed tools' known costs into a prediction for a new design, before writing the new design's code.
- **"a different, smaller growth-rate category"** — echoes Lesson 79 and 80's own vocabulary precisely, applied here at design time instead of after measurement.

### CS Lens

This is algorithm design by composition: a new problem's solution assembled from two already-understood, already-analyzed building blocks, with the new solution's cost predicted by combining the blocks' known costs rather than analyzed from scratch. Also recognized in: an electrical engineer predicting a new circuit's total resistance from its individual, already-characterized components' known resistances, before ever building the physical circuit.

### SE Lens

The alternative to designing this way is to invent a genuinely new algorithm from nothing for every new problem, ignoring tools already built and analyzed. The real cost of that alternative is both wasted design effort and a higher risk of an unanalyzed, untested new technique — reusing `binary-search` and `merge-sort`'s already-verified correctness and already-measured cost, as this unit does, means only the *combination* needs fresh verification, not both pieces from scratch.

---

## Concept Unit 3: Building Both, and Confirming the Prediction

### The Problem

Concept Unit 1 and 2's predictions — `Θ(n²)` for the obvious approach, a smaller category for the sort-based one — need checking against real code and real measurement, the same standing discipline this curriculum has applied since Lesson 22.

### The New Code — Type It Yourself

```scheme
(define (share-element-sorted? a b)
  (let ((sorted-b (list->vector (sort b <))))
    (let loop ((a a))
      (cond ((null? a) #f)
            ((binary-search-in sorted-b (car a)) #t)
            (else (loop (cdr a)))))))
```

### The Updated Project

This is `design-check.scm`, in full:

```scheme
(define (share-element-naive? a b)
  (let loop ((a a))
    (cond ((null? a) #f)
          ((member (car a) b) #t)
          (else (loop (cdr a))))))

(define (binary-search-in vec target)
  (let loop ((lo 0) (hi (- (vector-length vec) 1)))
    (if (> lo hi)
        #f
        (let ((mid (quotient (+ lo hi) 2)))
          (cond ((= (vector-ref vec mid) target) #t)
                ((< (vector-ref vec mid) target) (loop (+ mid 1) hi))
                (else (loop lo (- mid 1))))))))

(define (share-element-sorted? a b)                            ; ← new
  (let ((sorted-b (list->vector (sort b <))))                    ; ← new
    (let loop ((a a))                                             ; ← new
      (cond ((null? a) #f)                                          ; ← new
            ((binary-search-in sorted-b (car a)) #t)                  ; ← new
            (else (loop (cdr a)))))))                                   ; ← new

;; correctness, both approaches
(for-each
 (lambda (pair)
   (display (share-element-naive? (car pair) (cadr pair)))
   (display " ")
   (display (share-element-sorted? (car pair) (cadr pair)))
   (newline))
 (list (list '(1 2 3) '(4 5 6))
       (list '(1 2 3) '(4 5 3))
       (list '() '(1 2 3))))

;; comparison counting, Lesson 31-style, added once correctness is confirmed above
(define comparisons 0)

(define (member-c? x lst)
  (cond ((null? lst) #f)
        (else (set! comparisons (+ comparisons 1))
              (if (equal? x (car lst)) #t (member-c? x (cdr lst))))))

(define (share-element-naive-c? a b)
  (let loop ((a a))
    (cond ((null? a) #f)
          ((member-c? (car a) b) #t)
          (else (loop (cdr a))))))

(define (binary-search-in-c vec target)
  (let loop ((lo 0) (hi (- (vector-length vec) 1)))
    (if (> lo hi)
        #f
        (let ((mid (quotient (+ lo hi) 2)))
          (set! comparisons (+ comparisons 1))
          (cond ((= (vector-ref vec mid) target) #t)
                ((< (vector-ref vec mid) target) (loop (+ mid 1) hi))
                (else (loop lo (- mid 1))))))))

(define (share-element-sorted-c? a b)
  (let ((sorted-b (list->vector (sort b <))))
    (let loop ((a a))
      (cond ((null? a) #f)
            ((binary-search-in-c sorted-b (car a)) #t)
            (else (loop (cdr a)))))))

(for-each
 (lambda (n)
   (let ((a (iota n))
         (b (map (lambda (x) (+ x n)) (iota n))))
     (set! comparisons 0)
     (share-element-naive-c? a b)
     (let ((naive-c comparisons))
       (set! comparisons 0)
       (share-element-sorted-c? a b)
       (let ((sorted-c comparisons))
         (display "n=") (display n)
         (display " naive-comparisons=") (display naive-c)
         (display " sorted-comparisons=") (display sorted-c)
         (newline)))))
 (list 10 100 1000))
```

`share-element-naive?` reuses `member`, a reappearance of the identical membership-checking idea `linear-search` (Lesson 68) demonstrated by hand; `binary-search-in` is Lesson 68's `binary-search`, adapted to return a plain `#t`/`#f` instead of an index; `share-element-sorted?` is new, filling in Concept Unit 2's design directly. The counting versions (`member-c?`, `binary-search-in-c`, and the `-c?`-suffixed wrappers) add Lesson 31's own `set!`-based counting technique on top of the already-verified plain versions, exactly the pattern Lesson 73 and 74 used — correctness checked first, on the simple version; cost measured second, on an instrumented copy, once correctness is no longer in question. `a`'s elements and `b`'s elements are built as two disjoint ranges (`0` through `n - 1`, and `n` through `2n - 1`) specifically so neither approach can ever find a match early — the real worst case for both, checked deliberately rather than by accident.

### Reference Source

Lesson 68's `binary-search` (`FP-L068-repeated-halving.md`, Concept Unit 2), adapted; Guile's built-in `sort`, already used as a trusted reference in Lesson 79 and 80, used here as a real working tool rather than only a check. `share-element-sorted?` itself has no reference counterpart — it is this lesson's own design, assembled from both.

### Files affected

Created: `design-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

**Correctness, both approaches, three real cases:**

```
$ guile design-check.scm
#f #f
#t #t
#f #f
```

Verified this session — across a case with no shared elements, one with a shared element, and an empty first list, both approaches agree exactly.

**Real comparison counts, confirming Concept Unit 1 and 2's predictions, on two disjoint (non-overlapping) lists of matching size — the real worst case for both approaches, since every check must run to completion without ever finding a match:**

```
n=10 naive-comparisons=100 sorted-comparisons=30
n=100 naive-comparisons=10000 sorted-comparisons=600
n=1000 naive-comparisons=1000000 sorted-comparisons=9000
```

Verified this session — the naive approach's real comparison count matches `n²` *exactly* at every size (`100`, `10,000`, `1,000,000`), confirming Concept Unit 1's `Θ(n²)` prediction precisely, not approximately. The sort-based approach needs only `9,000` comparisons at `n = 1,000` — over `100` times fewer — confirming Concept Unit 2's predicted, smaller growth-rate category before any of this specific code existed.

### Mechanical Walkthrough

- **`(list->vector (sort b <))`** — first appearance of `list->vector`: a real Scheme procedure converting a list into a vector, needed here because `binary-search-in` (like Lesson 68's original) requires indexed, constant-time access, which vectors provide and plain lists don't.
- **`(binary-search-in sorted-b (car a))`** — a reappearance of `binary-search` (Lesson 68), adapted; checks whether the current element of `a` exists anywhere in the sorted `b`.
- **`(cond ((null? a) #f) ((binary-search-in ...) #t) (else (loop (cdr a))))`** — a reappearance of `cond`, `null?`; checks each element of `a` in turn, stopping the moment any shared element is found, or reporting none once `a` is exhausted.
- **`member-c?` and `binary-search-in-c`** — a reappearance of Lesson 31's `set!`-based counting technique, applied to two different procedures at once; each records one comparison per element actually checked, the same instrumentation style Lesson 73 and 74 used.
- **`(map (lambda (x) (+ x n)) (iota n))`** — a reappearance of `map`, `iota`; builds `b` as a range strictly above `a`'s own range, guaranteeing the two lists share nothing, so both approaches are measured on their genuine worst case rather than an accidental early match.
- **The real, exact `n²` match, and the real `100×` gap at `n = 1,000`** — direct, checked confirmation that both Concept Unit 1's and Concept Unit 2's design-time predictions, made before this code existed, were correct.

### CS Lens

This is the complete complexity-first design loop closed: predict a category from known building blocks (Concept Unit 1, 2), build the real code, then measure to confirm the prediction rather than to discover the cost cold — the identical evidence discipline this curriculum has used since Lesson 22, now applied in the *opposite* temporal order from most of Era III's own earlier lessons. Also recognized in: an engineer predicting a bridge's load capacity from its design specifications, then testing the built bridge to *confirm* the prediction, rather than testing first to *discover* an unknown capacity.

### SE Lens

The alternative to designing `share-element-sorted?` deliberately is to build only the naive version, ship it, and react to a performance problem once it appears at real scale — the reactive pattern Concept Unit 1's SE Lens already named as costly. The real, measured `100×` gap at only `n = 1,000` — a size many real datasets exceed easily — shows concretely what that reactive pattern risks: a costly rewrite under real pressure, instead of a design decision made calmly, in advance, using tools this curriculum spent an entire Era building.

---

## Concept Unit 4: The Whole Toolkit, Named Together

### The Problem

This lesson, and Era III as a whole, are ending. It's worth naming, explicitly, which specific tool from Lessons 56 through 81 did which specific job in this one small design process — turning an implicit sense of "the tools were useful" into a precise map of what each one is actually for.

### No isolated lab for this step

This concept has no code of its own to isolate — it is a direct, named recap of Concept Unit 1 through 3's own reasoning, tied explicitly back to the lessons that built each tool.

### Applying It — Naming Each Tool's Real Job in This Design

- **Counting predicts runtime (Lesson 56):** the foundational assumption underneath every prediction in this lesson — that counting operations in advance says something real about actual running time, confirmed repeatedly with real measurements ever since.
- **Big-O, Big-Omega, Big-Theta (Lessons 71–73):** the precise vocabulary used to state Concept Unit 1 and 2's predictions (`Θ(n²)` versus `Θ(n log n)`) as checkable claims, not vague impressions.
- **Worst, average, and best case (Lesson 74):** this lesson's real measurement deliberately used the worst case (disjoint lists) for *both* approaches, so the `100×` comparison would be a fair, like-for-like comparison — not an accident of picking an easy case for one and a hard case for the other.
- **Recurrences and recurrence trees (Lessons 75–77):** the underlying reasoning behind *why* `merge-sort` costs `Θ(n log n)` at all, trusted here as an already-established fact rather than re-derived, exactly the reuse Concept Unit 2 depended on.
- **Divide and conquer, merge sort, quicksort (Lessons 78–80):** `merge-sort` (or Guile's built-in `sort`, functionally the same idea) supplied the sorting step this lesson's better design depends on entirely.
- **Lower bounds (Lesson 81):** the reason this lesson didn't also search for something faster than `Θ(n log n)` for the sorting step specifically — Lesson 81 already proved no comparison-based sort could beat it, so effort was correctly directed elsewhere.

### Walkthrough

- **Each bullet naming one lesson and its concrete role in this lesson's own design** — turns six separate prior lessons into one coherent toolkit, applied together on a single real problem.
- **The lower-bounds bullet specifically** — shows a lower bound doing real design work: not just a theoretical ceiling, but a reason to *stop* looking for an improvement in one specific place and focus effort elsewhere.

### CS Lens

This is what "complexity as a design constraint" actually means in practice: not one single technique, but an entire toolkit — counting, notation, case analysis, recurrence-solving, design patterns, and lower bounds — each answering a different piece of the same underlying question, brought together deliberately on one real design decision. Also recognized in: a structural engineer's toolkit — material science, load calculations, safety-factor standards, and known failure-mode research — none of which alone answers "is this bridge design safe," but which together, applied deliberately, do.

### SE Lens

The alternative to naming each tool's specific role is to treat "Era III" as a vague sense of "now I think about complexity," without a precise map of which specific question each specific tool actually answers. The real cost of that alternative is exactly what this lesson's title warns against: complexity analysis reduced to something applied loosely and inconsistently, rather than a genuine, reachable-on-demand design constraint. Naming each tool's job precisely, as this unit does, is what makes the entire toolkit something to reach for deliberately on the *next* new problem, not something remembered only vaguely as "stuff from Era III."

---

## Closing

### Connect the pieces

One new problem, solved twice, with the better solution chosen before it was ever built:

1. **The obvious approach, analyzed in advance (Unit 1):** `Θ(n²)`, predicted from `linear-search`'s already-known cost, before any new code existed.
2. **A better design, composed from known tools (Unit 2):** sorting plus binary search, predicted at `Θ(n log n)`, assembled from Lesson 68 and 79's already-verified pieces.
3. **Both built, and the predictions confirmed (Unit 3):** real code, real correctness across three cases, and a real, exact `n²` match versus a real `100×` improvement at `n = 1,000`.
4. **The whole Era III toolkit, named explicitly (Unit 4):** six specific tools, each doing one specific, nameable job in this one concrete design.

Every claim in this lesson traces to either a prediction made from already-established facts, checked afterward against real code, or a direct citation of the specific earlier lesson that established the fact being reused — complexity analysis used as this lesson's title demands: before the code, not only after it.

### What breaks without this

Suppose an engineer, faced with this lesson's exact problem — do two lists share an element — reached immediately for the nested-checking approach without ever pausing to predict its cost, simply because it was the first idea that came to mind. On small test data, both approaches would look identical; the real, `100×` gap this lesson measured at `n = 1,000` would stay invisible until production data grew large enough to expose it — at which point fixing it means rewriting, retesting, and redeploying, under real pressure, something that Concept Unit 1 and 2's five minutes of upfront reasoning would have avoided entirely. This is the concrete, felt cost of treating complexity analysis as an afterthought rather than the design constraint this lesson, and this Era, have argued it should be.

### Exercises

1. **Observe.** Before checking, predict `share-element-sorted?`'s real comparison count at `n = 10,000`, using this lesson's own real numbers at smaller sizes to justify your prediction.
2. **Formalize.** Confirm your Exercise 1 prediction by running the instrumented version (add Lesson 31-style counting to `binary-search-in`, following this lesson's own measurement approach) at `n = 10,000`.
3. **Formalize.** Design, predict the complexity of, and then build a third approach to `share-element?`: converting both lists into a data structure with faster membership checks than a sorted vector, if one exists in this curriculum's toolkit so far, or explain why one doesn't yet.
4. **Explain.** Using Lesson 74's vocabulary specifically, explain why this lesson's real measurement (Concept Unit 3) deliberately used the *worst* case for both approaches, rather than each approach's own best case, and why using each one's best case instead would have made the comparison meaningless.
5. **Explain.** Choose a real problem of your own, not covered anywhere in this curriculum, and write out Concept Unit 1 and 2's reasoning for it: an obvious first approach, its predicted complexity using tools already built in this curriculum, and a deliberately designed alternative, predicted *before* writing either one's real code.

### Definition of done

- [ ] You can predict an approach's growth-rate category from already-known building blocks, before writing that approach's code.
- [ ] You can name at least four specific tools from Lessons 56–81 and state precisely what question each one answers.
- [ ] You can explain why this lesson's real measurement used the worst case deliberately, for a fair comparison between two approaches.
- [ ] You completed Exercise 3, designing and predicting a genuinely new approach to this lesson's problem before building it.
- [ ] You completed Exercise 5, applying this lesson's full predict-then-build-then-confirm process to a problem of your own choosing.
- [ ] Commit your Exercise 2, 3, and 5 findings, with a commit message stating the problem you designed for and whether your prediction, made in advance, was confirmed.
