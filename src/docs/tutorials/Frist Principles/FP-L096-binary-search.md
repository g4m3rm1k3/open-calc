# Lesson 96: Binary Search

**What you will build:** the identical halving logic Lesson 68 already derived and verified for `binary-search`, run this time over a **sorted list** instead of a vector — and a real, measured demonstration that its famous `O(log n)` guarantee quietly disappears, even though the algorithm's own comparison count stays exactly as small as ever. Real, verified evidence this session: searching a `10,000`-element sorted list for an absent value takes exactly `13` real comparisons — matching Lesson 68's own logarithmic result almost exactly — while the *real total work* needed to reach each of those `13` comparison points is `9,982` list-walking steps, essentially the entire list. The transferable point: this curriculum has used `binary-search` since Lesson 68 without ever asking whether its speed is a property of the *algorithm* or a property of the *representation* it happened to be built on. This lesson answers that question directly, connecting Era IV's central lesson (Lesson 83: representation determines cost) to an algorithm this curriculum has trusted and reused for over twenty lessons.

**What you need to know first:** Lesson 68 (`FP-L068-repeated-halving.md`) — specifically `binary-search`'s original derivation and its real, already-measured `O(log n)` comparison count over a vector, the exact result this lesson tests under a different representation. Lesson 83 (`FP-L083-why-representation-matters.md`) — specifically the real, measured claim that identical logical operations cost different real amounts depending on representation, confirmed here for a full algorithm rather than a single operation. Lesson 85 (`FP-L085-arrays.md`) — specifically the `O(1)` address formula binary search's original speed actually depends on.

---

## Concept Unit 1: Does the Algorithm Care What It's Built On?

### The Problem

Lesson 68 derived `binary-search`'s halving logic and verified its real, logarithmic comparison count — but did so entirely over a vector, without ever asking whether that same halving logic, run over a different representation holding the identical sorted values, would deliver the identical real speedup. It's worth asking directly: is `binary-search`'s speed a property of its comparison logic, or a property of the vector it happened to be demonstrated on?

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, using Lesson 68's own already-verified algorithm as the thing being tested under a new condition.

### Applying It — What Changes and What Doesn't, Moving to a List

`binary-search`'s comparison logic — check the middle, discard half, repeat — never actually mentions vectors by name; it only needs to *find the middle* and *compare against it*. A sorted list holds the identical values in the identical order, so nothing about the algorithm's *correctness* should change. What might change is *how expensive* finding "the middle" actually is, once it's no longer a single computed address (Lesson 85) but a position reachable only by walking from the front (Lesson 12, Lesson 83).

### Walkthrough

- **"never actually mentions vectors by name"** — the algorithm's logic, read literally, has no representation-specific step, which is exactly what makes this question worth asking rather than assuming the answer.
- **The explicit split between correctness and cost** — previews Concept Unit 3's central finding before any code runs: this lesson expects correctness to hold and cost to differ.

### CS Lens

This is the exact question Lesson 84's Abstract Data Type lesson was built to make askable precisely: `binary-search`'s comparison logic is written against "a sorted collection supporting `middle` and `compare`," and Lesson 84 already showed that swapping representations under an identical interface can change real cost dramatically, even when correctness is untouched. Also recognized in: a recipe that works correctly regardless of which oven brand bakes it, while actually taking a genuinely different real amount of time depending on that oven's specific heating characteristics.

### SE Lens

The alternative to asking this question is to keep citing `binary-search`'s `O(log n)` result as if it were a universal fact about the algorithm, the way this curriculum's own Lesson 71 classification table and later reuses (Lessons 76, 82) implicitly have. The real cost of that alternative, if the assumption turned out to be false, would be trusting a fast-search guarantee in a context where it silently doesn't hold — exactly what Concept Unit 3 checks directly rather than assumes.

---

## Concept Unit 2: Adapting binary-search to a List

### The Problem

Concept Unit 1's question needs real code: `binary-search`'s identical halving logic, adapted to find and read a list's middle element instead of a vector's.

### The New Code — Type It Yourself

```scheme
(define (binary-search-list lst target lo hi)
  (if (> lo hi)
      #f
      (let ((mid (quotient (+ lo hi) 2)))
        (let ((mid-val (list-ref lst mid)))
          (cond ((= mid-val target) mid)
                ((< mid-val target) (binary-search-list lst target (+ mid 1) hi))
                (else (binary-search-list lst target lo (- mid 1))))))))
```

### The Updated Project

This is `binary-search-list-check.scm`, in full:

```scheme
(define (binary-search-list lst target lo hi)                  ; ← new
  (if (> lo hi)                                                    ; ← new
      #f                                                             ; ← new
      (let ((mid (quotient (+ lo hi) 2)))                              ; ← new
        (let ((mid-val (list-ref lst mid)))                              ; ← new
          (cond ((= mid-val target) mid)                                   ; ← new
                ((< mid-val target) (binary-search-list lst target (+ mid 1) hi)) ; ← new
                (else (binary-search-list lst target lo (- mid 1))))))))            ; ← new

(define small (iota 20))
(display "search for 13 in a 20-element sorted list: ")
(display (binary-search-list small 13 0 19))
(newline)
(display "search for 25 (absent): ")
(display (binary-search-list small 25 0 19))
(newline)
```

`binary-search-list` is `binary-search`'s exact halving structure from Lesson 68, unchanged in every way except one: `(vector-ref vec mid)` becomes `(list-ref lst mid)` (Lesson 83's own already-used procedure) — the smallest possible change that makes the identical algorithm run over a list instead of a vector.

### Reference Source

Lesson 68's `binary-search` (`FP-L068-repeated-halving.md`, Concept Unit 2), quoted verbatim except for the one representation-specific line.

### Files affected

Created: `binary-search-list-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile binary-search-list-check.scm
search for 13 in a 20-element sorted list: 13
search for 25 (absent): #f
```

Verified this session — the identical halving logic correctly finds `13` at index `13`, and correctly reports `25` absent, over a plain list — real, checked confirmation that Concept Unit 1's correctness expectation holds exactly as predicted.

### Mechanical Walkthrough

- **`(quotient (+ lo hi) 2)`** — a reappearance of `quotient`, `+`; the identical midpoint computation as Lesson 68's original, entirely representation-independent.
- **`(list-ref lst mid)`** — a reappearance of `list-ref` (Lesson 83); the one changed line, reading the list's `mid`-th element the only way a list supports.
- **The real, correct results on both a present and an absent target** — confirms this unit's minimal change preserved `binary-search`'s full correctness.

### CS Lens

This is the smallest possible experiment that isolates representation as the only changed variable: identical comparison logic, identical midpoint arithmetic, identical correctness — the *only* thing different is how one specific value gets read, which is exactly what Concept Unit 3 measures the consequence of.

### SE Lens

The alternative to changing only the one necessary line is to rewrite the search from scratch for lists, risking a subtly different algorithm that no longer isolates representation as the sole variable. Keeping every other line identical to Lesson 68's original, as this unit does, is what makes Concept Unit 3's coming comparison a fair, controlled one.

---

## Concept Unit 3: Measuring What Actually Changed

### The Problem

Concept Unit 2 confirmed correctness. It's worth measuring, directly, both the algorithm's own comparison count (expected to stay small) and the real total work `list-ref` performs underneath it (expected, from Lesson 83's own evidence, to be large).

### The New Code — Type It Yourself

```scheme
(define (counted-list-ref lst i)
  (if (= i 0)
      (car lst)
      (begin (set! list-ref-steps (+ list-ref-steps 1))
             (counted-list-ref (cdr lst) (- i 1)))))
```

### The Updated Project

This is `binary-search-list-cost.scm`, in full:

```scheme
(define comparisons 0)
(define list-ref-steps 0)

(define (counted-list-ref lst i)                                ; ← new
  (if (= i 0)                                                       ; ← new
      (car lst)                                                       ; ← new
      (begin (set! list-ref-steps (+ list-ref-steps 1))                  ; ← new
             (counted-list-ref (cdr lst) (- i 1)))))                       ; ← new

(define (binary-search-list lst target lo hi)
  (if (> lo hi)
      #f
      (let ((mid (quotient (+ lo hi) 2)))
        (set! comparisons (+ comparisons 1))
        (let ((mid-val (counted-list-ref lst mid)))
          (cond ((= mid-val target) mid)
                ((< mid-val target) (binary-search-list lst target (+ mid 1) hi))
                (else (binary-search-list lst target lo (- mid 1))))))))

(define (binary-search-list-search lst target n)
  (set! comparisons 0)
  (set! list-ref-steps 0)
  (binary-search-list lst target 0 (- n 1)))

(for-each
 (lambda (n)
   (let ((lst (iota n)))
     (binary-search-list-search lst -1 n)
     (display "n=") (display n)
     (display " comparisons=") (display comparisons)
     (display " total-list-ref-steps=") (display list-ref-steps)
     (newline)))
 (list 100 1000 10000))
```

`counted-list-ref` is `list-ref`'s own logic, made visible: walking one `cdr` at a time, counting every step, instead of relying on Guile's built-in (and therefore uninstrumentable) version. Searching for `-1` (guaranteed absent, since `iota n` never produces a negative value) forces the real worst case for both counters.

### Reference Source

Lesson 68's `binary-search` structure, reused with Lesson 31-style counting added to both the comparison logic and the underlying access.

### Files affected

Created: `binary-search-list-cost.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile binary-search-list-cost.scm
n=100 comparisons=6 total-list-ref-steps=91
n=1000 comparisons=9 total-list-ref-steps=985
n=10000 comparisons=13 total-list-ref-steps=9982
```

Verified this session — `comparisons` stays small and grows logarithmically (`6`, `9`, `13`), matching Lesson 68's own real evidence almost exactly (`⌊log₂(n)⌋ + 1`, the identical formula) — the *algorithm's own logic* really is representation-independent, exactly as Concept Unit 1 expected. But `total-list-ref-steps` grows to `9,982` at `n = 10,000` — essentially the *entire list*, not a small, bounded number — because each of the `13` calls to reach a "middle" element must walk from the front, and those thirteen walks, summed together, cost almost as much as one complete pass through the list.

### Mechanical Walkthrough

- **`(set! list-ref-steps (+ list-ref-steps 1))`** — a reappearance of `set!`; counts every single `cdr` step taken across *all* calls to `counted-list-ref`, not reset between them within one search.
- **The real, tiny `comparisons` versus the real, huge `total-list-ref-steps`** — direct, measured proof that two different things were being counted, and that Lesson 68's famous result was only ever a claim about the first one.

### CS Lens

This is the precise, measured answer to Concept Unit 1's question: `binary-search`'s `O(log n)` guarantee was never a fact about its comparison logic alone — Lesson 68's own real evidence was `O(log n)` *comparisons, each assumed to cost `O(1)` to perform*, an assumption Lesson 85's array formula satisfies and Lesson 12's list structurally cannot. The algorithm halves the *search space* logarithmically; only a representation offering `O(1)` access to any position turns that into a genuinely `O(log n)` *total* cost. Also recognized in: a strategy game that correctly narrows down an opponent's hidden choice in a logarithmic number of guesses, whose real-world speed still depends entirely on how quickly each individual guess can actually be checked.

### SE Lens

The alternative to measuring both quantities is to report only `comparisons`, the way an incomplete benchmark might, and conclude `binary-search-list` is just as fast as the original. The real cost of that alternative is exactly the trap this unit exists to catch: a reader trusting `binary-search`'s reputation without checking whether the specific representation in front of them still supports the `O(1)` access the reputation quietly assumes.

---

## Concept Unit 4: Naming What This Confirms About Era IV

### The Problem

This lesson's real finding is worth connecting explicitly back to Era IV's own central claim, rather than left as an isolated curiosity about one algorithm.

### No isolated lab for this step

This concept has no code of its own to isolate — the connection is stated directly, using this lesson's own real evidence together with Lesson 83's.

### Applying It — Stating the General Principle Precisely

Lesson 83 measured that a single operation (indexed access, front-insertion) costs differently depending on representation. This lesson shows the identical principle applies to an *entire algorithm's* real-world cost, not just one isolated operation: `binary-search`'s asymptotic advantage over `linear-search` depends entirely on being paired with a representation offering `O(1)` access to any position. Paired with a list instead, `binary-search-list`'s real total cost (dominated by `list-ref`'s walking) approaches `linear-search`'s own `O(n)` — the two algorithms' supposed advantage gap nearly disappears, not because either algorithm changed, but because the representation underneath one of them did.

**The forward-looking question this raises:** is `O(1)` array access the *only* way to get real, fast search, or could some other representation — not an array, not a plain list — also support fast search without needing one single contiguous block? This is exactly the question Lesson 97 onward (binary search *trees*) takes up directly.

### Walkthrough

- **The explicit generalization from "one operation" (Lesson 83) to "one algorithm's asymptotic guarantee" (this lesson)** — states precisely what's new here versus what Lesson 83 already established.
- **The forward pointer to binary search trees** — turns this lesson's finding into a real motivation for what comes next, rather than leaving the question unresolved.

### CS Lens

This is Era IV's throughline made explicit at the level of a whole, previously-trusted algorithm: no algorithm's real-world performance claim is complete without naming the representation it assumes, and this lesson is the concrete demonstration that even a widely-used, already-verified algorithm like `binary-search` carries exactly that hidden assumption. Also recognized in: a car's advertised fuel efficiency being a genuine, measured fact — that quietly assumes a specific fuel and a specific kind of road, neither of which the number itself states.

### SE Lens

The alternative to naming this connection explicitly is to treat this lesson's finding as a one-off curiosity about lists specifically, rather than a general lesson about hidden representation assumptions in any previously-trusted result. The real cost of that alternative is failing to apply the identical skepticism to the *next* algorithm this curriculum trusts — naming the general principle here, as this unit does, is what makes it a transferable habit rather than a fact about one specific algorithm.

---

## Closing

### Connect the pieces

One trusted algorithm, one changed representation, one real, measured gap between logic and cost:

1. **The question, posed (Unit 1):** is `binary-search`'s speed a property of its comparisons, or of the vector it was demonstrated on?
2. **The minimal, controlled change (Unit 2):** one line changed, `vector-ref` to `list-ref`, correctness fully preserved.
3. **The real, measured answer (Unit 3):** comparisons stay logarithmic; total underlying work approaches the size of the whole list.
4. **The general principle, named (Unit 4):** an algorithm's asymptotic guarantee is inseparable from the representation it assumes — exactly Era IV's central lesson, now confirmed at the level of a whole algorithm, not just one operation.

Every claim in this lesson traces to real, checked code: a minimally-changed, verified-correct adaptation of an already-trusted algorithm, and real, separate measurements distinguishing what the algorithm's own logic does from what its underlying representation actually costs.

### What breaks without this

Suppose an engineer, trusting `binary-search`'s reputation for `O(log n)` search, applied it to data stored as a linked list — perhaps because the data arrived as a list from elsewhere in a system and converting it to a vector seemed like unnecessary extra work. This lesson's real evidence shows exactly what would happen: the code would still be *correct*, and might even look reasonably fast in casual testing, while silently costing very close to `linear-search`'s full `O(n)` at real scale — a performance assumption violated by a data structure choice, with nothing about the algorithm itself signaling the problem. Measuring both comparisons and underlying access cost separately, as this lesson does, is what catches this exact mismatch before it reaches production.

### Exercises

1. **Observe.** Before checking, predict whether `binary-search-list`'s real *wall-clock time* (not just step counts) would be closer to `linear-search`'s real timing or `binary-search`'s (both from Lesson 68), at `n = 1,000,000`.
2. **Formalize.** Measure `binary-search-list`'s real wall-clock time at `n = 1,000,000` (Lesson 83's `time-it` technique), and compare it directly to Lesson 68's own real `linear-search` and `binary-search` timings at the identical size.
3. **Formalize.** Adapt Lesson 87's doubly linked structure to support `binary-search`'s halving logic, and measure whether tracking both `next` and `prev` references changes `total-list-ref-steps`'s real growth pattern at all.
4. **Explain.** In your own words, explain why Exercise 3's doubly linked adaptation cannot fix the underlying problem, even with `O(1)` backward movement available, referencing what Lesson 90's deque could and couldn't do cheaply.
5. **Explain.** Using this lesson's precise distinction between an algorithm's logical step count and its real underlying cost, revisit Lesson 79's `merge-sort` and state what representation assumption its own `Θ(n log n)` result depends on, if any — checking whether `merge-sort`'s own list-based implementation has this lesson's same hidden assumption or not.

### Definition of done

- [ ] You can state precisely what changed and what didn't between Lesson 68's `binary-search` and this lesson's `binary-search-list`.
- [ ] You can explain, using real measured numbers, why the algorithm's own comparison count stayed logarithmic while total real cost did not.
- [ ] You can state Era IV's general principle this lesson confirms: an algorithm's asymptotic guarantee assumes a specific representation, and isn't automatically preserved when that representation changes.
- [ ] You completed Exercise 5, checking whether this lesson's exact trap also applies to `merge-sort`.
- [ ] You completed Exercises 1–5, including a real wall-clock timing comparison against Lesson 68's own original numbers.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating what you measured and how it compared to Lesson 68's original results.
