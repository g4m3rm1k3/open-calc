# Lesson 78: Divide and Conquer

**What you will build:** `dc-max`, a genuinely new procedure — not yet built anywhere in this curriculum — that finds a list's largest element by splitting it into two halves, recursively finding each half's maximum, and combining the two results with a single comparison. Real, verified evidence this session: `dc-max` agrees exactly with a straightforward linear scan across five test cases, including a list with repeated values and a single-element list, and its real call count grows as exactly `2n - 1` — `63` calls at `n = 32`, `199` at `n = 100` — a clean, verified pattern connecting directly to Lesson 77's recurrence-tree tools. The transferable point: Lesson 51's `all-subsets` and Lesson 68's `binary-search` were each derived, separately, using Lesson 46's leap-of-faith reasoning. This lesson names the common shape several of this curriculum's recursive algorithms already share — **divide and conquer** — precisely enough to *derive a brand-new algorithm from the pattern itself*, not just recognize the pattern in algorithms already built.

**What you need to know first:** Lesson 46 (`FP-L046-recursive-invariants.md`) — specifically the recursive leap of faith, reused directly to trust `dc-max`'s recursive calls without tracing them. Lesson 51 (`FP-L051-generating-possibilities.md`) — specifically `all-subsets`, reclassified here as this curriculum's first real divide-and-conquer example. Lesson 68 (`FP-L068-repeated-halving.md`) — specifically `binary-search`, contrasted here against true divide and conquer. Lesson 77 (`FP-L077-recurrence-trees.md`) — specifically the recurrence-tree tools, reused to check `dc-max`'s real call count.

**Terms introduced in this lesson**

- **Divide and conquer** — a recursive design pattern with three named steps: *divide* a problem into one or more smaller subproblems of the identical type; *conquer* each subproblem by solving it recursively, trusted via Lesson 46's leap of faith, without tracing how; *combine* the subproblems' solved results into a solution for the original problem. It exists as a named template so a new recursive algorithm can be *derived* by filling in these three steps deliberately, rather than invented from scratch each time.
- **Decrease and conquer** — a named, narrower cousin of divide and conquer: a recursive design that reduces a problem to exactly *one* smaller subproblem of the identical type (not several), whose result is returned directly or with trivial adjustment — no real combining step. It exists to prevent overusing "divide and conquer" for every recursive algorithm that merely shrinks toward a base case, when only some of them genuinely split into multiple pieces that need combining.

---

## Concept Unit 1: A Pattern Behind Several Already-Built Algorithms

### The Problem

This curriculum has derived several recursive algorithms so far — `all-subsets` (Lesson 51), `binary-search` (Lesson 68), `fast-expt` (Lesson 66) — each time using Lesson 46's leap-of-faith reasoning, but each time as if starting from nothing. Lesson 77 already noticed a real structural difference between some of these (uniform branching versus uneven branching, versus no branching at all). It's worth asking whether some of them share a common, nameable *design* pattern precise enough to be reused deliberately on a brand-new problem, not just noticed after the fact.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, using algorithms this curriculum has already built.

### Applying It — What "A Common Pattern" Would Need to Mean

Noticing that two procedures both happen to recurse isn't enough to call it a shared *pattern* — `fib`, `all-subsets`, and `binary-search` all recurse, but Lesson 77 already showed their recursion structures are genuinely different in shape. A real, reusable pattern would need to name specific, fillable steps — not just "it recurses," but something concrete enough that a new problem could be run through the identical steps and produce a genuinely new algorithm.

### Walkthrough

- **The three already-built examples, named together** — sets up a concrete set of cases to check any proposed pattern against.
- **"fillable steps"** — the real bar a pattern needs to clear to be more than a retrospective label.

### CS Lens

This is the difference between an observation and a design pattern: noticing that several solutions share a trait is an observation; naming the trait precisely enough to produce a *new* solution by following it deliberately is a pattern, in the same sense architecture or software engineering use the word. Also recognized in: noticing several successful recipes all involve searing meat before braising it (an observation) versus naming "sear, then braise" as a technique precise enough to apply to a protein never cooked that way before (a reusable pattern).

### SE Lens

The alternative to naming this pattern precisely is to keep deriving each new recursive algorithm from first principles every time, the way Lessons 51, 66, and 68 each did independently. The real cost of that alternative isn't wrongness — each derivation was sound — it's redundant effort: re-discovering the identical shape of reasoning each time, without a name to reach for that would make the next derivation faster and more deliberate. Naming the pattern, as this lesson does, is what turns three separate successes into one reusable design tool.

---

## Concept Unit 2: Defining Divide and Conquer's Three Steps

### The Problem

Concept Unit 1's goal needs a precise definition — three specific, checkable steps, not a vague impression of "breaks things into pieces."

### No isolated lab for this step

This concept has no code of its own to isolate — the definition is stated directly below, and Concept Unit 3 checks it against real, already-built code.

### Applying It — The Three Steps, and a Necessary Contrast

**Divide:** break the original problem into one or more smaller subproblems of the *identical type* — not a different, easier kind of question, but a smaller instance of the same question.

**Conquer:** solve each subproblem by recursion, trusted via Lesson 46's leap of faith — the recursive call's correctness is assumed, not re-derived or traced, exactly the discipline Lesson 46 already established.

**Combine:** take the subproblems' already-solved results and merge them into a solution for the *original* problem — the step that makes divide and conquer more than just "shrink and recurse."

**The necessary contrast — decrease and conquer:** some recursive algorithms divide a problem into exactly *one* smaller subproblem, and their "combine" step is trivial — return the subproblem's result unchanged, or with a small, constant adjustment. Calling this divide and conquer too would blur a real distinction: genuine divide and conquer's combine step does real work merging *multiple* solved pieces; decrease and conquer's does not, because there is only ever one piece to begin with.

### Walkthrough

- **"the identical type"** — the precise requirement that separates true recursive division from merely calling a different, simpler helper function.
- **The leap-of-faith citation in "Conquer"** — a hard concept reappearing (Lesson 46), restated by name rather than left implicit, since it's exactly what makes writing the Conquer step honest rather than a hidden assumption.
- **The decrease-and-conquer contrast** — prevents the new vocabulary from being applied so broadly it stops meaning anything specific.

### CS Lens

This is the standard three-part decomposition used to teach and recognize an entire family of algorithms, precisely because naming the three steps separately makes it possible to ask, for any candidate new algorithm, "what exactly divides, what exactly conquers, what exactly combines" — three concrete design questions instead of one vague one. Also recognized in: a manufacturing assembly line explicitly separating "break down the raw material," "process each part," and "assemble the parts into the final product" as three distinct, individually improvable stages, rather than treating "manufacturing" as one undifferentiated activity.

### SE Lens

The alternative to distinguishing divide and conquer from decrease and conquer is to use "divide and conquer" loosely for any recursive algorithm at all. The real cost of that alternative is losing precision exactly where it matters for reasoning about cost: Lesson 77 already showed that a uniformly-branching recurrence tree and a single-branch recurrence chain need genuinely different analysis tools. Keeping the two named separately, as this unit does, keeps the vocabulary aligned with the real structural difference Lesson 76 and 77 already found.

---

## Concept Unit 3: Classifying Real, Already-Built Algorithms

### The Problem

Concept Unit 2's definitions need checking against real, already-built code — do they actually, cleanly classify algorithms this curriculum has already derived and measured?

### No isolated lab for this step

This concept has no code of its own to isolate — the classification is stated directly below, using real code from Lessons 51 and 68.

### Applying It — Classifying all-subsets and binary-search

**`all-subsets` (Lesson 51), reclassified as divide and conquer:**

- **Divide:** split `items` into its first element, `(car items)`, and the rest, `(cdr items)` — a smaller instance of the identical "find all subsets of a list" question.
- **Conquer:** `(all-subsets (cdr items))`, trusted by the leap of faith to correctly return every subset of the rest.
- **Combine:** `(append (map (lambda (s) (cons (car items) s)) rest-subsets) rest-subsets)` — merging the trusted subproblem's result into two halves of the final answer: every subset with `(car items)` added, and every subset without it.

This is genuine divide and conquer, not decrease and conquer: the Combine step does real, necessary work merging the subproblem's result into *two* differently-shaped pieces of the final answer, not just returning it unchanged.

**`binary-search` (Lesson 68), reclassified as decrease and conquer:**

- **Divide (in the weaker, decrease-and-conquer sense):** narrow to exactly *one* half of the remaining range — `(loop (+ mid 1) hi)` or `(loop lo (- mid 1))`, never both.
- **Conquer:** the recursive call on that one chosen half, trusted by the leap of faith.
- **Combine:** none, beyond returning the recursive call's result directly — there is only ever one subproblem, so there is nothing to merge.

### Walkthrough

- **`all-subsets`'s real Combine step, quoted directly** — confirms Concept Unit 2's definition against code already built and measured, not a fresh example invented to fit the definition neatly.
- **`binary-search`'s trivial Combine step** — the concrete evidence for calling it decrease and conquer rather than divide and conquer: nothing is actually combined, because nothing is actually divided into more than one active piece.

### CS Lens

This is the classification doing real, useful work: two algorithms that both "recurse on a smaller version of the problem" turn out to belong to genuinely different categories once the Combine step is checked directly, exactly the kind of precision Concept Unit 2 required. Also recognized in: two business strategies that both "expand into new territory" turning out to be genuinely different in kind once checked against whether they integrate the new territory's results back into a combined whole, or simply operate it as an independent, separate unit.

### SE Lens

The alternative to classifying real code is to leave Concept Unit 2's definitions untested, hoping they apply cleanly to whatever comes up. The real cost of that alternative is exactly the gap this curriculum has warned against since Lesson 22: a definition that sounds right but was never checked against a real example. Classifying `all-subsets` and `binary-search` directly, as this unit does, confirms the three-step definition — and its decrease-and-conquer exception — actually fit real, already-verified code before Concept Unit 4 trusts the same steps to derive something new.

---

## Concept Unit 4: Deriving a New Algorithm From the Pattern

### The Problem

Concept Unit 3 confirmed the pattern *describes* existing code. The real test is whether it can *derive* new code — filling in Divide, Conquer, and Combine deliberately for a problem this curriculum hasn't solved recursively yet: finding the largest value in a list.

### Applying the Pattern — Deriving dc-max

**Divide:** split the list into a left half and a right half, each roughly half the original length — a smaller instance of the identical "find the largest value in this list" question, twice over.

**Conquer:** find the maximum of the left half, and separately the maximum of the right half, each by the identical recursive procedure, trusted by the leap of faith not to be traced.

**Combine:** the larger of the two halves' maxima is the maximum of the whole list — one comparison.

**The base case:** a list with exactly one element is its own maximum, with nothing to divide.

### The New Code — Type It Yourself

```scheme
(define (dc-max lst)
  (if (null? (cdr lst))
      (car lst)
      (let* ((half (quotient (length lst) 2))
             (left-max (dc-max (list-head lst half)))
             (right-max (dc-max (list-tail lst half))))
        (if (> left-max right-max) left-max right-max))))
```

### The Updated Project

This is `dc-max.scm`, in full:

```scheme
(define (dc-max lst)                                          ; ← new
  (if (null? (cdr lst))                                         ; ← new
      (car lst)                                                  ; ← new
      (let* ((half (quotient (length lst) 2))                     ; ← new
             (left-max (dc-max (list-head lst half)))              ; ← new
             (right-max (dc-max (list-tail lst half))))             ; ← new
        (if (> left-max right-max) left-max right-max))))            ; ← new

(define (linear-max lst)
  (if (null? (cdr lst))
      (car lst)
      (let ((rest-max (linear-max (cdr lst))))
        (if (> (car lst) rest-max) (car lst) rest-max))))

(for-each
 (lambda (lst)
   (display lst) (display " dc-max=") (display (dc-max lst))
   (display " linear-max=") (display (linear-max lst))
   (newline))
 (list (list 3 1 4 1 5 9 2 6) (list 7) (list 2 9) (list 5 5 5)
       (list 1 2 3 4 5 6 7 8 9 10)))

;; call counting, Lesson 31-style, added once correctness is confirmed above
(define call-count 0)

(define (dc-max-counted lst)
  (set! call-count (+ call-count 1))
  (if (null? (cdr lst))
      (car lst)
      (let* ((half (quotient (length lst) 2))
             (left-max (dc-max-counted (list-head lst half)))
             (right-max (dc-max-counted (list-tail lst half))))
        (if (> left-max right-max) left-max right-max))))

(for-each
 (lambda (n)
   (set! call-count 0)
   (dc-max-counted (iota n))
   (display "n=") (display n) (display " dc-max-calls=") (display call-count)
   (newline))
 (list 1 2 4 8 16 32 100))
```

`linear-max` is a straightforward, already-familiar-shaped linear scan (structurally identical to `all-subsets`'s own decrease-and-conquer shape from Lesson 51, applied to a different question) — built here purely as an independent way to check `dc-max`'s correctness, the same role `naive-expt` played for `fast-expt` in Lesson 66. `dc-max-counted` adds Lesson 31's own `set!`-based counting on top of the already-verified `dc-max`, the same correctness-first-then-instrument pattern Lesson 73 and 74 used.

### Reference Source

No reference counterpart — `dc-max` is a from-scratch derivation, following Concept Unit 2's three-step pattern directly, as this lesson's own demonstration that the pattern generates new algorithms rather than only describing old ones.

### Files affected

Created: `dc-max.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile dc-max.scm
(3 1 4 1 5 9 2 6) dc-max=9 linear-max=9
(7) dc-max=7 linear-max=7
(2 9) dc-max=9 linear-max=9
(5 5 5) dc-max=5 linear-max=5
(1 2 3 4 5 6 7 8 9 10) dc-max=10 linear-max=10
```

Verified this session — across five varied test cases, including a single-element list (`(7)`, Concept Unit 4's base case) and a list with repeated maximum values (`(5 5 5)`), `dc-max` and `linear-max` agree exactly, every time.

**A second real check — call count, connecting directly to Lesson 77's tree tools:**

```
n=1 dc-max-calls=1
n=2 dc-max-calls=3
n=4 dc-max-calls=7
n=8 dc-max-calls=15
n=16 dc-max-calls=31
n=32 dc-max-calls=63
n=100 dc-max-calls=199
```

Verified this session — `dc-max`'s real call count is exactly `2n - 1` at every size tested, including `n = 100`, not a power of `2`. This matches Lesson 77's own recurrence-tree reasoning directly: `dc-max`'s recurrence is `T(n) = 2T(n/2) + 1`, structurally identical in shape to `all-subsets-naive`'s `T(n) = 2T(n-1) + 1` — a uniformly-branching tree with `n` leaves (the base cases) and exactly `n - 1` internal, combining nodes, for `2n - 1` nodes total.

### Mechanical Walkthrough

- **`(null? (cdr lst))`** — a reappearance of `null?` and `cdr`; the base case check, true exactly when `lst` has one element left.
- **`(let* ((half (quotient (length lst) 2)) ...) ...)`** — a reappearance of `let*` (Lesson 37) and `quotient` (Lesson 67); computes the midpoint index, using `let*` specifically because `left-max` and `right-max`'s own definitions don't depend on each other, but both depend on `half`, computed first.
- **`list-head`** — first appearance: a real Scheme procedure taking a list and a count, returning a new list containing exactly that many elements from the front; confirmed this session as `(list-head lst half)`, returning the left half.
- **`list-tail`** — first appearance: a real Scheme procedure taking a list and a count, returning the remainder of the list *after* skipping that many elements from the front; confirmed this session as `(list-tail lst half)`, returning the right half — together, `list-head` and `list-tail` at the identical index split a list into two non-overlapping halves that reconstruct the whole.
- **`(dc-max (list-head lst half))` / `(dc-max (list-tail lst half))`** — the two recursive calls, each trusted by the leap of faith (Lesson 46) to correctly return its half's maximum, without tracing either call.
- **`(if (> left-max right-max) left-max right-max)`** — a reappearance of `if` and `>`; the entire Combine step, one comparison deciding which trusted result is the answer.
- **`dc-max-counted`** — a reappearance of Lesson 31's `set!`-based counting technique, applied to `dc-max` unchanged in logic, to produce the real call counts reported below.

### CS Lens

This is divide and conquer functioning exactly as a generative design tool: three named steps, filled in deliberately for a genuinely new problem, producing a correct algorithm checked independently against a different, already-trusted approach — the identical discipline Lesson 46 established for any recursive derivation, now organized around a reusable three-step template. Also recognized in: a tournament bracket finding an overall winner by dividing competitors into two halves, letting each half produce its own winner independently, then playing one final match to combine the two half-winners into the overall champion.

### SE Lens

The alternative to deriving `dc-max` via the named pattern is to write a linear scan (`linear-max`) and stop there, since it's simpler and already correct. The real cost of that alternative, for this specific problem, is genuinely small — `linear-max` is a perfectly reasonable choice for finding a maximum. The real value here isn't that `dc-max` is a better *solution* to this particular problem; it's that deriving it demonstrates the pattern itself is usable on a problem it wasn't retrofitted to describe, which is exactly the confidence Lesson 79 needs to apply the identical Divide/Conquer/Combine template to a problem — sorting — where the divide-and-conquer version genuinely does outperform simpler alternatives.

---

## Closing

### Connect the pieces

One pattern, checked against old code, then used to build new code:

1. **The pattern sought (Unit 1):** a common, reusable shape behind several already-built recursive algorithms, precise enough to generate new ones.
2. **Three steps, defined (Unit 2):** Divide, Conquer, Combine — plus decrease and conquer, named separately to keep the vocabulary precise.
3. **Real classification (Unit 3):** `all-subsets` confirmed as genuine divide and conquer, `binary-search` reclassified as decrease and conquer, both checked directly against their real code.
4. **A new algorithm, derived (Unit 4):** `dc-max`, filled in from the pattern for a problem never solved recursively in this curriculum before, verified correct against `linear-max` and checked, exactly, against Lesson 77's recurrence-tree tools.

Every claim in this lesson traces to either real, already-verified code (Unit 3) or a freshly derived and independently checked procedure (Unit 4) — the pattern proven descriptive first, then proven generative.

### What breaks without this

Suppose an engineer, facing a genuinely new problem that could be solved by splitting it into independent pieces and combining the results, had only ever seen recursion used to shrink a problem toward a single smaller version of itself (`binary-search`'s shape). Without divide and conquer named as its own distinct pattern, that engineer might reach for a decrease-and-conquer-shaped recursive attempt, or give up on a recursive approach entirely, simply for lack of a template that fits the actual problem shape. Naming Divide, Conquer, and Combine as separate, deliberate design questions, as this lesson does, is what makes a genuinely new algorithm like `dc-max` derivable on purpose, rather than found only by accident or trial and error.

### Exercises

1. **Observe.** Before checking, predict whether `dc-max`'s real call count at `n = 64` will be `2 × 64 - 1 = 127`, using this lesson's real evidence at `n = 32` and `n = 100` to justify your prediction.
2. **Formalize.** Confirm your Exercise 1 prediction by running `dc-max` with counting added, at `n = 64`.
3. **Formalize.** Derive `dc-min`, following Concept Unit 4's identical three-step pattern for finding a list's smallest value instead of its largest, and verify it against a straightforward linear-scan `linear-min` across at least five test cases.
4. **Explain.** Classify Lesson 66's `fast-expt` using this lesson's vocabulary — divide and conquer, or decrease and conquer — explaining your answer using its real Combine step (or lack of one), the same way Concept Unit 3 classified `binary-search`.
5. **Explain.** In your own words, state why `all-subsets`'s Combine step (`append` of two mapped/unmapped halves) does genuinely more work than `binary-search`'s (returning one recursive result unchanged) — connecting your answer to Lesson 77's finding that `all-subsets-naive`'s recurrence tree has exponentially many nodes while `binary-search`'s recurrence chain has only `log₂(n)`.

### Definition of done

- [ ] You can state divide and conquer's three steps from memory, and explain the real distinction between it and decrease and conquer.
- [ ] You can classify a recursive algorithm you haven't seen classified before, by naming its actual Divide, Conquer, and Combine steps (or explaining why it's decrease and conquer instead).
- [ ] You derived `dc-max` (or reconstructed it) and verified it against an independent, differently-derived procedure.
- [ ] You can explain why `dc-max`'s real call count, `2n - 1`, follows directly from Lesson 77's recurrence-tree reasoning.
- [ ] You completed Exercises 1–5, including deriving at least one new procedure not built in this lesson.
- [ ] Commit your Exercise 3 through 5 findings, with a commit message stating the procedure you derived and how you verified its correctness.
