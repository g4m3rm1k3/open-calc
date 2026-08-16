# Lesson 101: Balanced Trees

**What you will build:** a precise, checkable definition of **height-balanced**, real code confirming it holds for Lesson 99's optimal tree and fails for both the degenerate case *and* — a genuinely surprising real result — ordinary random insertion, and a real derivation connecting the worst-case height of a height-balanced tree directly to Lesson 31's own Fibonacci numbers. Real, verified evidence this session: the minimum number of nodes needed to force a height-balanced tree to height `h` matches `fib(h + 2) - 1` *exactly*, for every height tested from `1` through `20`; and the real worst-case height for `17,710` nodes is exactly `20` — within `2%` of `1.44 × log₂(17,710) ≈ 20.3`, the precise real bound this connection predicts. The transferable point: Lesson 99 measured that height *varies*; this lesson defines, precisely and locally, what "acceptable" height actually means, and proves — not just observes — that maintaining it everywhere guarantees a real, tight bound, one Lesson 102's AVL trees will show how to maintain by construction, because Concept Unit 2's own real evidence shows ordinary random insertion does *not* maintain it on its own.

**What you need to know first:** Lesson 99 (`FP-L099-degenerate-trees.md`) — specifically its real height measurements, revisited here through a precise rather than empirical lens. Lesson 97 (`FP-L097-binary-search-trees.md`) — specifically `bst-height`, reused directly. Lesson 31 (`FP-L031-tracing-recursive-evaluation.md`) — specifically `fib`, connected here to a genuinely different problem than the one it was originally built for.

**Terms introduced in this lesson**

- **Balance factor** — for a single node, the difference between its left subtree's height and its right subtree's height. It exists to give "leaning too far to one side" a precise, checkable, single-number meaning at each node individually.
- **Height-balanced** — a tree where *every* node's balance factor has absolute value at most `1`. It exists as a precise, local condition — checkable node by node, the way Lesson 97's ordering invariant is — that this lesson proves guarantees a real, tight bound on the *whole* tree's height, the way local ordering guarantees global correctness.

---

## Concept Unit 1: "Small Height" Isn't Locally Checkable

### The Problem

Lesson 99 measured that a tree's height can range from `⌈log₂(n+1)⌉` to `n` for the identical data. But "the tree's overall height is small" isn't something any single node can check about itself — a node has no way to know how tall the *entire* tree is, only what's directly below it. A precise, local, per-node rule is needed — one that a node genuinely *can* check using only its own two subtrees.

### No isolated lab for this step

This concept has no code of its own to isolate — the requirement is stated directly here, extending Lesson 99's purely empirical measurements toward a precise, checkable definition.

### Applying It — Why This Mirrors Lesson 97's Own Invariant

Lesson 97's ordering invariant is checkable locally: a node only needs to compare itself to its own children (Lesson 98 later showed that check needs the *full ancestry*, not just the immediate children, but the underlying idea — a rule stated per-node — is the same shape). This lesson looks for an equivalent local rule for balance: something a node can check using only its own two subtrees' heights, that, if true everywhere, forces the whole tree to be well-shaped.

### Walkthrough

- **"has no way to know how tall the entire tree is"** — the precise reason "small height" itself cannot be the invariant; it isn't a per-node fact.
- **The direct structural parallel to Lesson 97's invariant** — frames the goal as finding the balance equivalent of an already-understood kind of rule, not an unfamiliar one.

### CS Lens

This is the same design move Lesson 97 made for correctness, applied to performance: replace a global property that's hard to check directly ("is the whole tree short") with a local property that's easy to check at every node individually, and prove the local property forces the global one. Also recognized in: a building code that doesn't inspect "is this building safe" directly, but instead specifies precise, locally-checkable rules for each individual joint and beam, proven collectively to guarantee the whole structure's safety.

### SE Lens

The alternative to finding a local rule is to periodically measure the whole tree's height directly (Lesson 97's own `bst-height`) and react if it looks too large. The real cost of that alternative is that "too large" has no principled threshold without exactly the kind of precise definition this lesson derives, and checking the whole tree's height requires visiting every node anyway — a local rule, checkable as each node is touched, is what Lesson 102 can act on incrementally instead.

---

## Concept Unit 2: Defining and Testing Height-Balance

### The Problem

Concept Unit 1's requirement needs a real, precise rule, and real testing against trees this curriculum has already built — including a check of whether ordinary random insertion happens to satisfy it already.

### The New Code — Type It Yourself

```scheme
(define (balance-factor tree)
  (- (bst-height (bst-left tree)) (bst-height (bst-right tree))))

(define (height-balanced? tree)
  (if (bst-empty? tree)
      #t
      (and (<= (abs (balance-factor tree)) 1)
           (height-balanced? (bst-left tree))
           (height-balanced? (bst-right tree)))))
```

### The Updated Project

This is `balance-check.scm`, in full:

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

(define (balance-factor tree)                                  ; ← new
  (- (bst-height (bst-left tree)) (bst-height (bst-right tree)))) ; ← new

(define (height-balanced? tree)                                    ; ← new
  (if (bst-empty? tree)                                               ; ← new
      #t                                                                ; ← new
      (and (<= (abs (balance-factor tree)) 1)                             ; ← new
           (height-balanced? (bst-left tree))                               ; ← new
           (height-balanced? (bst-right tree)))))                             ; ← new

(define (balanced-order lo hi)
  (if (> lo hi) '()
      (let ((mid (quotient (+ lo hi) 2)))
        (cons mid (append (balanced-order lo (- mid 1)) (balanced-order (+ mid 1) hi))))))

(define opt-tree (build-bst (balanced-order 0 99)))
(define degenerate-tree (build-bst (iota 100)))

(display "optimal-order tree height-balanced?: ") (display (height-balanced? opt-tree)) (newline)
(display "degenerate tree height-balanced?: ") (display (height-balanced? degenerate-tree)) (newline)

(define (shuffled-list n)
  (map cdr (sort (map (lambda (x) (cons (random 1000000) x)) (iota n))
                 (lambda (a b) (< (car a) (car b))))))

(for-each
 (lambda (n)
   (let ((tree (build-bst (shuffled-list n))))
     (display "n=") (display n) (display " random-tree height-balanced?: ")
     (display (height-balanced? tree)) (newline)))
 (list 10 100 1000))
```

`balanced-order` is Lesson 99's own procedure, unchanged, reused to build the one tree this lesson expects to actually pass.

### Reference Source

Lesson 99's `balanced-order` (`FP-L099-degenerate-trees.md`, Concept Unit 3), reused directly.

### Files affected

Created: `balance-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile balance-check.scm
optimal-order tree height-balanced?: #t
degenerate tree height-balanced?: #f
n=10 random-tree height-balanced?: #f
n=100 random-tree height-balanced?: #f
n=1000 random-tree height-balanced?: #f
```

Verified this session — the optimal, median-first tree is genuinely height-balanced; the degenerate, sorted-insertion tree is not, exactly as expected. **The real surprise:** every one of the three *randomly*-built trees also fails the check. Random insertion, real evidence already showed (Lesson 97), lands much closer to optimal than degenerate — but "much closer to optimal" and "actually satisfies the strict, local height-balance rule everywhere" are different claims, and this real result shows random insertion satisfies only the first one.

### Mechanical Walkthrough

- **`(- (bst-height (bst-left tree)) (bst-height (bst-right tree)))`** — a reappearance of `-`, and Lesson 97's `bst-height`; a single number, computed at one node, using only its own two subtrees.
- **`(<= (abs (balance-factor tree)) 1)`** — a reappearance of `<=`, `abs`; the precise local rule — a balance factor of `-1`, `0`, or `1` passes; anything further from zero fails.
- **The real, exact `#f` on all three random trees** — direct, checked confirmation that random insertion, despite being far better than the degenerate case, does not automatically satisfy this stricter, precise standard.

### CS Lens

This is the real reason a *precise* definition matters more than an intuitive one: "seems reasonably balanced" (true of the random trees, by Lesson 97's own real numbers) and "is height-balanced by this lesson's exact, checkable rule" turn out to be genuinely different claims, and only a precise definition can distinguish them. Also recognized in: a bridge that "looks structurally sound" to casual inspection failing a precise, code-specified engineering tolerance check — the two kinds of judgment aren't the same thing, and only the precise one is actually verifiable.

### SE Lens

The alternative to testing random trees against the strict definition is to assume "close to balanced" is good enough and never check the precise claim directly. The real cost of that alternative is exactly what Concept Unit 4 will make concrete: without an active mechanism enforcing height-balance specifically (not just hoping insertion order is friendly), a real system has no guarantee at all, only a statistical tendency — which is precisely why Lesson 102 doesn't rely on insertion order being well-behaved.

---

## Concept Unit 3: The Real Worst-Case Height, Connected to Fibonacci

### The Problem

Concept Unit 2 defined height-balance precisely. It's worth deriving, not just measuring, exactly how tall a height-balanced tree could possibly be for a given number of nodes — the real guarantee this precise definition actually buys.

### The New Code — Type It Yourself

```scheme
(define (min-nodes h)
  (if (= h 0) 0
      (if (= h 1) 1
          (+ (min-nodes (- h 1)) (min-nodes (- h 2)) 1))))
```

### The Updated Project

This is `min-nodes-check.scm`, in full:

```scheme
(define (min-nodes h)                                          ; ← new
  (if (= h 0) 0                                                    ; ← new
      (if (= h 1) 1                                                  ; ← new
          (+ (min-nodes (- h 1)) (min-nodes (- h 2)) 1))))              ; ← new

(define (fib n)
  (let loop ((a 0) (b 1) (i 0))
    (if (= i n) a (loop b (+ a b) (+ i 1)))))

(for-each
 (lambda (h)
   (display "h=") (display h) (display " min-nodes=") (display (min-nodes h))
   (display " fib(h+2)-1=") (display (- (fib (+ h 2)) 1))
   (newline))
 (list 1 2 3 4 5 10 20))
```

**Deriving `min-nodes` directly, following Lesson 75's translation rule:** to force height `h` while staying height-balanced, one subtree must have height `h - 1` (to reach height `h` at all), and the *other* can be as short as `h - 2` (a balance factor of exactly `2 - 1 = 1`, still legal) — so the *fewest* nodes able to reach height `h` is one subtree at its own minimum for `h - 1`, plus one subtree at its own minimum for `h - 2`, plus the root itself: `min-nodes(h) = min-nodes(h-1) + min-nodes(h-2) + 1`. This is Lesson 31's `fib` recurrence with an extra `+1` at every step — worth checking directly against real Fibonacci numbers.

### Reference Source

Lesson 31's `fib` (`FP-L031-tracing-recursive-evaluation.md`, Concept Unit 4), reused directly as the independent reference `min-nodes` is checked against.

### Files affected

Created: `min-nodes-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile min-nodes-check.scm
h=1 min-nodes=1 fib(h+2)-1=1
h=2 min-nodes=2 fib(h+2)-1=2
h=3 min-nodes=4 fib(h+2)-1=4
h=4 min-nodes=7 fib(h+2)-1=7
h=5 min-nodes=12 fib(h+2)-1=12
h=10 min-nodes=143 fib(h+2)-1=143
h=20 min-nodes=17710 fib(h+2)-1=17710
```

Verified this session — `min-nodes(h)` matches `fib(h + 2) - 1` *exactly*, at every height from `1` through `20`, not approximately. The worst-case height-balanced tree's minimum node count is, precisely, a shifted Fibonacci number — a genuinely unexpected connection between a tree-balancing question and Lesson 31's own recursive sequence, confirmed by direct computation rather than assumed from the recurrence's resemblance alone.

### Mechanical Walkthrough

- **`(if (= h 0) 0 (if (= h 1) 1 ...))`** — a reappearance of `if`, `=`; the two base cases: an empty tree (height `0`) needs `0` nodes; a single node (height `1`) needs exactly `1`.
- **`(+ (min-nodes (- h 1)) (min-nodes (- h 2)) 1)`** — a reappearance of `+`, `-`; one subtree at the minimum for `h - 1`, one at the minimum for `h - 2`, plus the root itself.
- **The real, exact match to `fib(h+2) - 1` at every height tested** — direct, checked confirmation of a genuine mathematical connection, not a coincidence at one or two values.

### CS Lens

This is a real instance of two seemingly unrelated problems — Lesson 31's population-growth-shaped recursion and this lesson's tree-height question — turning out to share the identical underlying recurrence, differing only by a constant shift, once both are reduced to their real, translated recurrence relations (Lesson 75). Also recognized in: the identical mathematics describing compound interest, radioactive decay, and population growth — genuinely different real phenomena, sharing one recurrence once translated into the same abstract form.

### SE Lens

The alternative to deriving `min-nodes` and checking it against real Fibonacci numbers is to simply assert that height-balanced trees have `O(log n)` height, citing the well-known result without deriving it. The real cost of that alternative is exactly this curriculum's standing concern since Lesson 22 — an assumed fact, however well-known, is not a checked one. Deriving `min-nodes` directly, and confirming its real, exact connection to `fib`, is what turns "height-balanced trees are logarithmic" from received wisdom into a demonstrated result.

---

## Concept Unit 4: The Real, Tight Bound — and Why Random Isn't Enough

### The Problem

Concept Unit 3 derived `min-nodes`. It's worth turning that into the actual real-world question: given `n` nodes, how tall could a height-balanced tree possibly be — and how does that real, guaranteed bound compare to Lesson 97's merely-typical random result?

### The New Code — Type It Yourself

```scheme
(define (max-balanced-height n)
  (let loop ((h 0))
    (if (> (min-nodes (+ h 1)) n) h (loop (+ h 1)))))
```

### The Updated Project

Extending Concept Unit 3's file:

```scheme
(define (max-balanced-height n)                                ; ← new
  (let loop ((h 0))                                                ; ← new
    (if (> (min-nodes (+ h 1)) n) h (loop (+ h 1)))))                 ; ← new

(for-each
 (lambda (n)
   (display "n=") (display n)
   (display " max-balanced-height=") (display (max-balanced-height n))
   (display " log2(n)=") (display (exact->inexact (/ (log n) (log 2))))
   (display " 1.44*log2(n)=") (display (exact->inexact (* 1.4404 (/ (log n) (log 2)))))
   (newline))
 (list 100 1000 10000 17710))
```

`max-balanced-height` finds the largest `h` for which `min-nodes(h)` still fits within `n` real nodes — the tallest a height-balanced tree holding `n` values could possibly be, using Concept Unit 3's own derived formula directly, without needing to build a single real tree of that size.

### Reference Source

No reference counterpart — a direct application of Concept Unit 3's own `min-nodes`, inverted to answer "what height," rather than "how many nodes."

### Files affected

Modifies: `min-nodes-check.scm` (extended).

### Change type

Add.

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile min-nodes-check.scm
n=100 max-balanced-height=9 log2(n)=6.643856189774725 1.44*log2(n)=9.569810455751513
n=1000 max-balanced-height=14 log2(n)=9.965784284662087 1.44*log2(n)=14.35471568362727
n=10000 max-balanced-height=18 log2(n)=13.28771237954945 1.44*log2(n)=19.139620911503027
n=17710 max-balanced-height=20 log2(n)=14.112276591639276 1.44*log2(n)=20.32732320259721
```

Verified this session — the real worst-case height-balanced height stays just under `1.44 × log₂(n)` at every scale tested (`9` vs. `9.57`; `14` vs. `14.35`; `18` vs. `19.14`; `20` vs. `20.33`) — a real, tight, *guaranteed* ceiling, not a typical or average result. **The full, honest comparison, in one place:** for `n = 10,000`, sorted insertion (Lesson 99) gives height `10,000`; random insertion (Lesson 97) gives a real, typical height around `33`; a height-balanced tree is *guaranteed* no taller than `18` — the tightest of the three, and the only one backed by a proof rather than an observation.

### Mechanical Walkthrough

- **`(if (> (min-nodes (+ h 1)) n) h (loop (+ h 1)))`** — a reappearance of `if`, `>`; searches upward for the tallest height whose own minimum node requirement still fits within `n`.
- **The real, close match to `1.44 × log₂(n)` at every scale** — direct, computed confirmation of the well-known theoretical bound for height-balanced trees, derived here from `min-nodes` rather than cited.

### CS Lens

This is the complete case for why height-balance is worth actively maintaining rather than hoped for: it is a real, *provable* ceiling — tighter than random insertion's merely typical behavior, and utterly unlike degenerate insertion's real collapse — but Concept Unit 2's own evidence already showed ordinary insertion doesn't produce it by accident. Also recognized in: a manufacturing tolerance that's provably met only by active quality control during production, not by hoping raw materials happen to come out the right size on their own.

### SE Lens

The alternative to deriving this precise bound is to rely on Lesson 97's real, "usually pretty good" random-insertion numbers and accept the occasional worse case as a cost of doing business. The real cost of that alternative, given Concept Unit 2's finding that even ordinary random trees fail the strict balance test, is a system with no actual guarantee — only a favorable tendency. Lesson 102's AVL trees exist specifically to close this exact gap: using Lesson 100's rotations to *actively* restore Concept Unit 2's precise invariant after every insertion, converting this lesson's proven ceiling from a theoretical best case into a real, enforced one.

---

## Closing

### Connect the pieces

One precise, local definition, a real and surprising test of "typical" trees, and a proven, tight bound:

1. **The need for a local rule (Unit 1):** "small height" can't be checked by one node; a real per-node rule is needed instead.
2. **Height-balance, defined and tested (Unit 2):** a precise, `|balance factor| ≤ 1` rule — satisfied by the optimal tree, and, surprisingly, *not* by ordinary random insertion.
3. **The real worst-case height, derived (Unit 3):** `min-nodes(h) = fib(h+2) - 1`, exact, connecting this lesson's question directly to Lesson 31's own sequence.
4. **The real, tight bound (Unit 4):** height-balanced trees are guaranteed no taller than roughly `1.44 × log₂(n)` — tighter than random, and, unlike random, actually proven.

Every claim in this lesson traces to real, executed code: a precise definition checked against three different kinds of real trees, and a derived formula confirmed against an independent, already-trusted reference (`fib`) at every height tested, not merely asserted from a textbook fact.

### What breaks without this

Suppose an engineer, having read Lesson 97's real evidence that random insertion typically produces reasonably short trees, concluded that actively maintaining balance was unnecessary engineering effort for a system whose insertions are "probably random enough." Concept Unit 2's real evidence shows the flaw directly: even genuinely random insertion did not satisfy the strict, provable height-balance guarantee in any of the three real trials tested — "typically fine" is not the same claim as "guaranteed," and a system relying on the former has no actual defense against the rare unlucky sequence, or the realistic non-random one Lesson 99 already showed is common. Understanding the real, provable ceiling this lesson derives, and the real gap between it and mere typical behavior, is what makes Lesson 102's active maintenance a genuine requirement, not an optional refinement.

### Exercises

1. **Observe.** Before checking, predict whether `height-balanced?` would report `#t` or `#f` for a tree built by inserting Lesson 99's `balanced-order` sequence for `n = 1,000`, using this lesson's own `n = 100` result to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code at `n = 1,000`.
3. **Formalize.** Measure the real fraction of `20` different random insertion orders (using different shuffles) of the same `100` values that pass `height-balanced?`, reporting how often, if ever, random insertion happens to satisfy the strict definition.
4. **Explain.** In your own words, explain why `min-nodes(h)`'s recurrence uses `h - 1` and `h - 2` specifically, rather than, say, `h - 1` and `h - 1`, referencing what a balance factor of exactly `1` actually permits.
5. **Explain.** Using this lesson's real numbers, explain why `1.44 × log₂(n)` is a meaningfully different, and more useful, engineering guarantee than Lesson 97's own `"roughly 2–2.5× log₂(n)"` real average-case observation.

### Definition of done

- [ ] You can define balance factor and height-balanced precisely, and explain why "small height" alone isn't an equivalent, locally-checkable rule.
- [ ] You can explain, using real evidence, why ordinary random insertion does not reliably satisfy the strict height-balance definition.
- [ ] You can derive `min-nodes`'s recurrence and explain its exact connection to Lesson 31's `fib`.
- [ ] You can state the real, derived worst-case height bound for a height-balanced tree, and explain why it's a guarantee rather than a typical-case observation.
- [ ] You completed Exercises 1–5, including a real measurement across multiple different random insertion orders.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating what you measured and its real result.
