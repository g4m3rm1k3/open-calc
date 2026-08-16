# Lesson 77: Recurrence Trees

**What you will build:** a real, level-by-level accounting of `all-subsets-naive`'s recurrence, `T(n) = 2T(n-1) + 1` — confirming its total real cost, `2,047` calls at `n = 10` (Lesson 51's own established number), by summing each level of its **recurrence tree** directly: level `0` has `1` node, level `1` has `2`, level `2` has `4`, ..., level `n` has `2ⁿ`, and the total, `1 + 2 + 4 + ... + 2¹⁰ = 2,047`, is Lesson 65's own geometric series formula, reused rather than re-derived. Then, honestly, the technique meets its limit: `fib`'s real, already-drawn call tree (Lesson 31) has no such clean, uniform levels at all — and this lesson shows exactly why, using `fib(4)`'s real `9`-node tree. The transferable point: Lesson 76's algebraic expansion solved a recurrence with *one* self-reference per step cleanly. A recurrence with *two* self-references per step, like `fib`'s, doesn't expand into a simple chain — it expands into a genuine tree, and some trees can still be summed level by level, while others, `fib`'s among them, resist that too.

**What you need to know first:** Lesson 76 (`FP-L076-expanding-recurrences.md`) — specifically the expansion technique, and Exercise 4's honest finding that `fib`'s two-term recurrence resists it. Lesson 51 (`FP-L051-generating-possibilities.md`) — specifically the naive, double-recursive-call `all-subsets`, and its real, measured `2,047` calls at `n = 10`. Lesson 65 (`FP-L065-geometric-series.md`) — specifically `geometric-sum-formula`, reused directly to explain this lesson's level totals. Lesson 31 (`FP-L031-tracing-recursive-evaluation.md`) — specifically `fib(4)`'s real, hand-verified `9`-call tree, revisited here as this lesson's central counterexample.

**Terms introduced in this lesson**

- **Recurrence tree** — a diagram representing a recurrence's real execution directly: each node is one call, its children are the calls it makes recursively, and a node's own label is its non-recursive cost. The tree's total node count equals `T(n)` exactly. It exists because a recurrence with more than one differently-shaped self-reference per step, like `fib`'s `T(n-1) + T(n-2)`, doesn't reduce to Lesson 76's single algebraic chain — but its real total cost can still sometimes be found by adding up an entire level of the tree at a time.

---

## Concept Unit 1: When Algebra Alone Isn't Enough

### The Problem

Lesson 76's Exercise 4 asked for `fib`'s recurrence, `T(n) = T(n-1) + T(n-2) + 1`, to be expanded the same way `binary-search`'s was. Substituting once, replacing `T(n-1)` with its own definition, already shows the trouble: `T(n) = (T(n-2) + T(n-3) + 1) + T(n-2) + 1` — two separate `T(n-2)` terms now, not one, and the next substitution would produce even more terms, of even more different sizes. `binary-search`'s expansion replaced *one* `T` term with a new expression containing *one* new `T` term, every time — a chain. `fib`'s expansion replaces *one* `T` term with an expression containing *two* new `T` terms — the term count doesn't stay flat, it grows. A different tool is needed for recurrences shaped like this.

### No isolated lab for this step

This concept has no code of its own to isolate — the difficulty is shown directly above, using Lesson 76's own attempted expansion.

### Applying It — Naming What's Actually Different

`binary-search`'s recurrence has exactly one recursive term on its right-hand side; expanding it produces a straight chain, one link at a time, exactly what Lesson 76's method needs. `fib`'s recurrence has *two* recursive terms; expanding it produces branching — each substitution doesn't lengthen a chain, it splits one term into two. A chain has a length; a branching structure has a *shape*, and reasoning about a shape needs a picture, not just an equation.

### Walkthrough

- **The two-term substitution, shown concretely** — makes the branching problem visible immediately, rather than asserting it abstractly.
- **"a chain has a length; a branching structure has a shape"** — the precise reason Lesson 76's method doesn't transfer, motivating a genuinely different tool rather than a small patch to the old one.

### CS Lens

This is the real distinction between linear recursion (one recursive call per case, like `binary-search`'s or `fast-expt`'s single branch) and tree recursion (more than one recursive call per case, like `fib`'s or `all-subsets`'s naive version) — a distinction this curriculum has used code to demonstrate since Lesson 31, now given the precise reason it matters for *solving* a recurrence, not just for noticing redundant work. Also recognized in: a single hallway (linear recursion) versus a hallway that splits at every junction into two further hallways (tree recursion) — the identical contrast Lesson 75 named informally, now shown to have real algebraic consequences.

### SE Lens

The alternative to naming this distinction precisely is to keep attempting algebraic expansion on every recurrence, treating a growing mess of terms as a sign of a mistake to fix rather than a sign the technique doesn't apply. The real cost of that alternative is wasted effort forcing the wrong tool onto the wrong shape of problem. Recognizing the distinction up front, as this unit does, is what motivates reaching for a recurrence tree specifically for tree-shaped recursion, rather than continuing to fight algebra that was never going to simplify.

---

## Concept Unit 2: Defining a Recurrence Tree, and Summing One That Works

### The Problem

A recurrence tree needs a precise definition, and a real, worked example where it actually succeeds at finding a total cost — before Concept Unit 3 shows one where it runs into its own limit.

### No isolated lab for this step

This concept has no code of its own to isolate — the definition and worked example are given directly below, using Lesson 51's own established real evidence.

### Applying It — Defining the Tree, Then Summing It

**A recurrence tree, precisely:** for a recurrence `T(n)`, draw one node for the top-level call. For each recursive term on the right-hand side, draw one child node, labeled with that term's smaller argument, and repeat the process on each child, down to the base case. Each node's own cost is whatever non-recursive work its case contributes (Lesson 75's Rule 2 or Rule 3). The tree's **total cost is the sum of every node's own cost, across the entire tree** — and that total is exactly `T(n)`, since every node corresponds to exactly one real call.

**Applying this to `all-subsets-naive`'s recurrence, `T(n) = 2T(n-1) + 1`:** the root, for input size `n`, has cost `1` and exactly two children, each for input size `n - 1`. Each of *those* has cost `1` and two children of its own, for size `n - 2` — and so on, down to size `0`.

**Naming the resulting shape, level by level:** level `0` (the root) has `1` node. Level `1` has `2` nodes (the root's two children). Level `2` has `4` nodes (each level-`1` node has two children). In general, level `i` has `2ⁱ` nodes — every node at every level has exactly two children, so the node count exactly doubles each level, all the way down to level `n` (the base cases, size `0`).

**Summing every level's total cost:** each of the `2ⁱ` nodes at level `i` costs `1`, so level `i`'s total cost is `2ⁱ`. The tree's grand total is `2⁰ + 2¹ + 2² + ... + 2ⁿ` — exactly Lesson 65's geometric series, with first term `1`, ratio `2`, and `n + 1` terms. Lesson 65's `geometric-sum-formula` gives this sum directly: `2ⁿ⁺¹ - 1`.

### Walkthrough

- **The tree's definition, node by node** — mirrors Lesson 75's translation rule exactly, but drawn as a shape instead of written as an equation.
- **"level `i` has `2ⁱ` nodes"** — the key structural fact this specific recurrence's uniform, two-children-every-node shape makes possible.
- **The geometric series connection** — a direct reuse of Lesson 65's own closed form, not a coincidence: a recurrence tree that doubles every level *is* a geometric sequence of level totals, by construction.

### CS Lens

This is the level-sum technique for solving tree-shaped recurrences: instead of tracking individual branches algebraically, count how much total work happens at each *depth*, then sum across depths — which works cleanly precisely when every node at a given depth looks the same. Also recognized in: counting a company's total headcount by summing "how many people report at each level of the org chart" rather than tracing every individual reporting chain separately; counting a family tree's total ancestors by summing "how many ancestors existed at each generation back," when every generation has the same number of parents per person.

### SE Lens

The alternative to summing level by level is to try tracing every individual root-to-leaf path in the tree separately and adding up all of their costs — technically possible, but for `2¹⁰ = 1,024` leaves at `n = 10`, that means separately accounting for over a thousand paths instead of eleven levels. The real cost of that alternative is needless complexity when the tree's uniform shape already makes a much shorter route available. Summing by level, as this unit does, is what makes a tree with exponentially many nodes solvable with a sum of only `n + 1` terms.

---

## Concept Unit 3: Verifying the Sum Against Real Code

### The Problem

Concept Unit 2's level-sum, `2ⁿ⁺¹ - 1`, needs checking against Lesson 51's own real, already-measured `2,047` calls at `n = 10` — and, ideally, against fresh evidence at a size not yet measured.

### The New Code — Type It Yourself

```scheme
(define (level-sum n)
  (let loop ((i 0) (level-size 1) (total 0))
    (if (> i n)
        total
        (loop (+ i 1) (* level-size 2) (+ total level-size)))))
```

### The Updated Project

This is `tree-check.scm`, in full:

```scheme
(define call-count 0)

(define (all-subsets-naive items)
  (set! call-count (+ call-count 1))
  (if (null? items)
      (list '())
      (append (map (lambda (s) (cons (car items) s))
                   (all-subsets-naive (cdr items)))
              (all-subsets-naive (cdr items)))))

(define (level-sum n)                                          ; ← new
  (let loop ((i 0) (level-size 1) (total 0))                     ; ← new
    (if (> i n)                                                   ; ← new
        total                                                      ; ← new
        (loop (+ i 1) (* level-size 2) (+ total level-size)))))     ; ← new

(for-each
 (lambda (n)
   (set! call-count 0)
   (all-subsets-naive (iota n))
   (display "n=") (display n)
   (display " real-calls=") (display call-count)
   (display " level-sum(n)=") (display (level-sum n))
   (newline))
 (list 1 2 3 5 10))
```

`all-subsets-naive` is Lesson 51's own naive, double-recursive-call version, written out directly from its documented shape (calling `(all-subsets (cdr items))` twice), with Lesson 31-style call counting added.

### Reference Source

Lesson 51's naive `all-subsets` (`FP-L051-generating-possibilities.md`, Concept Unit 3), reconstructed from its documented double-call shape with counting added; `level-sum` is new, directly implementing Concept Unit 2's level-by-level total rather than Lesson 65's closed form, to check the *accumulation process* itself, not only its final algebraic answer.

### Files affected

Created: `tree-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile tree-check.scm
n=1 real-calls=3 level-sum(n)=3
n=2 real-calls=7 level-sum(n)=7
n=3 real-calls=15 level-sum(n)=15
n=5 real-calls=63 level-sum(n)=63
n=10 real-calls=2047 level-sum(n)=2047
```

Verified this session — at every size tested, including `n = 10`, matching Lesson 51's own established `2,047` exactly, the real call count equals the level-by-level sum precisely. Checking against Lesson 65's closed form directly: `geometric-sum-formula`'s `2ⁿ⁺¹ - 1` at `n = 10` is `2¹¹ - 1 = 2,048 - 1 = 2,047` — the identical number, reached by three independent routes: real execution, level-by-level accumulation, and Lesson 65's algebraic formula.

### Mechanical Walkthrough

- **`(let loop ((i 0) (level-size 1) (total 0)) ...)`** — a reappearance of the named-`let` looping idiom (Lesson 39/51), tracking three values at once: the current level `i`, that level's node count `level-size`, and the running `total`.
- **`(* level-size 2)`** — a reappearance of `*`; doubles the level size for the next iteration, directly implementing "level `i + 1` has twice as many nodes as level `i`."
- **`(+ total level-size)`** — a reappearance of `+`; accumulates the current level's full contribution into the running total before moving to the next level.
- **The real, exact three-way match** — confirms the recurrence tree's level-by-level structure isn't just a visual aid, but a genuinely accurate accounting of every real call made.

### CS Lens

This is a recurrence tree's level-sum technique fully vindicated: the same total, reached by actually running the recursive code, by simulating the tree's level structure directly, and by an independently-derived closed-form formula, agreeing exactly. Also recognized in: auditing a company's total payroll three ways — summing every individual paycheck, summing every department's total, and computing it from a single top-level formula — and finding all three agree, each method checking the other two.

### SE Lens

The alternative to writing `level-sum` as its own small procedure is to trust Concept Unit 2's algebra and Lesson 51's already-existing measurement without checking a third, independent route between them. The real cost of that alternative is missing a subtle mismatch — a recurrence tree drawn slightly wrong (an off-by-one in how many levels exist, say) could still coincidentally produce a formula that matches one already-known value. Building `level-sum` as genuinely separate code, checked at five different sizes including ones never checked before, is what confirms the tree's structure itself, not just its final number at one size.

---

## Concept Unit 4: Where the Technique Meets Its Limit — fib's Real Tree

### The Problem

Concept Unit 2's level-sum technique worked because `all-subsets-naive`'s tree is perfectly uniform: every node has exactly two children, and every leaf sits at the identical depth, `n`. It's worth checking, honestly, against `fib`'s real tree — already drawn and verified in Lesson 31 — whether the identical technique still applies.

### No isolated lab for this step

This concept has no code of its own to isolate — Lesson 31's own already-verified real tree for `fib(4)` is revisited directly.

### Applying It — Counting fib(4)'s Real Tree, Level by Level

Lesson 31's real, hand-confirmed call tree for `fib(4)`, using its own real trace order:

```
Level 0:              fib(4)
Level 1:        fib(3)         fib(2)
Level 2:    fib(2)  fib(1)   fib(1)  fib(0)
Level 3:  fib(1) fib(0)
```

**Counting real nodes per level:** level `0` has `1` node (`fib(4)`). Level `1` has `2` nodes (`fib(3)`, `fib(2)`). Level `2` has `4` nodes (`fib(3)`'s two children, plus `fib(2)`'s two children). Level `3` has only `2` nodes — `fib(2)`'s own two children, from the *level-2* copy of `fib(2)` under `fib(3)`. The level-`2` copy of `fib(1)` under `fib(3)`, and the level-`2` `fib(1)` and `fib(0)` under `fib(4)`'s `fib(2)`, are already base cases — they have *no* children at all, and the tree simply ends there, at level `2`, along those branches.

**Naming what breaks:** `all-subsets-naive`'s tree had every leaf at the identical depth, `n`, because both children always shrink the input by exactly `1`. `fib`'s tree has leaves at *multiple different depths* — some branches (`fib(1)`, `fib(0)` reached directly) end two levels down; others (reached through an extra `fib(2)`) continue to three. There is no single "level `i` has `X` nodes" formula that holds for *every* `i` here, because the tree's own shape isn't uniform. Summing `1 + 2 + 4 + 2 = 9` still gives the exact right total — Lesson 31's own real `9` — but only because every individual level was counted from the *real* tree, not predicted from a clean formula the way `all-subsets-naive`'s levels were.

### Walkthrough

- **The real, uneven level counts (`1, 2, 4, 2`)** — direct, checked evidence that a recurrence tree's total can still be found by summing real levels, even when no clean per-level formula exists.
- **"leaves at multiple different depths"** — the precise structural reason `fib`'s two differently-sized recursive terms (`n - 1` and `n - 2`) produce a genuinely less uniform tree than `all-subsets-naive`'s two identically-sized terms (`n - 1` and `n - 1`).

### CS Lens

This is the honest boundary of the level-sum technique: it always gives a *correct* total when applied to the tree's real, actual levels, but it only yields a clean, general *formula* — the kind Concept Unit 2 derived for `all-subsets-naive` — when the tree's shape is uniform enough for "level `i`'s node count" to be expressible as a simple pattern. `fib`'s tree fails that second, stronger requirement, even though the technique itself still works in its weaker form. Also recognized in: a family tree where every person has exactly two children (a clean, predictable generation-size formula) versus a real family tree with varying numbers of children per person (still countable, generation by generation, but with no simple formula predicting a generation's size in advance).

### SE Lens

The alternative to checking `fib`'s tree honestly is to assume the level-sum technique, having worked cleanly once, generalizes to every tree-shaped recurrence. The real cost of that alternative is exactly Lesson 75's own warning against overgeneralizing from one confirming example — here, extended from translation rules to solving techniques. `fib`'s real tree, revisited directly rather than assumed to behave like `all-subsets-naive`'s, is what reveals a genuine, structural limit: a fully general closed form for `fib`'s call count exists (it's known to grow in proportion to the golden ratio raised to the power `n`, connecting to Lesson 69's "exponential" category), but deriving it needs techniques beyond simple level-summing, and beyond this lesson's scope.

---

## Closing

### Connect the pieces

Two real recurrence trees, one solved cleanly, one honestly only partly solved:

1. **The limit of algebra, named (Unit 1):** `fib`'s two-term recurrence branches under expansion instead of forming a chain, motivating a genuinely different, visual tool.
2. **The tool defined, and it works (Unit 2):** a recurrence tree's total cost is its level-by-level sum; `all-subsets-naive`'s uniform tree sums to Lesson 65's own geometric series, `2ⁿ⁺¹ - 1`.
3. **Triple confirmation (Unit 3):** real execution, level-by-level simulation, and closed-form algebra all agree exactly, at `n = 10` and at fresh sizes.
4. **The honest limit (Unit 4):** `fib`'s real, uneven tree still sums correctly level by level (`1 + 2 + 4 + 2 = 9`, Lesson 31's own number), but has no clean per-level formula the way the uniform tree did — a genuine, named boundary of what this lesson's technique can promise in general.

Every number in this lesson traces to real code, a real hand-countable tree, or both — the level-sum technique proven to work exactly where the tree is uniform, and shown, honestly, exactly where that uniformity runs out.

### What breaks without this

Suppose an engineer, having successfully used the level-sum technique on one tree-shaped recurrence, assumed the same clean "level `i` has `X` nodes" reasoning would work for *any* branching recursive algorithm, and tried to derive a similarly tidy formula for a real, unevenly-branching algorithm's cost. Concept Unit 4's honest limit shows exactly what would go wrong: the real tree's uneven shape has no such formula to find, and time spent hunting for one would be time spent on a technique that was never going to close the gap. Recognizing which trees are uniform enough for a clean formula, and which aren't, as this lesson does explicitly, is what tells an engineer when to reach for level-summing and when to reach for something else instead — memoization (Lesson 54), for instance, which this curriculum already built specifically because `fib`'s uneven, overlapping tree makes so much genuinely redundant, avoidable work.

### Exercises

1. **Observe.** Draw `fib(5)`'s recurrence tree by hand, extending `fib(4)`'s real tree by one more level, and predict its total node count before checking.
2. **Formalize.** Run a freshly instrumented `fib` at `n = 5` to confirm your Exercise 1 prediction, and list your tree's real node count at each level, the way this lesson did for `fib(4)`.
3. **Explain.** State, in your own words, why `all-subsets-naive`'s tree has every leaf at the identical depth `n`, referencing its recurrence's two identically-shrinking terms (`T(n-1)` and `T(n-1)`) specifically.
4. **Formalize.** Draw the recurrence tree for `T(n) = 3T(n-1) + 1` (three equally-shrinking recursive terms instead of two), derive its level-`i` node count and total sum following Concept Unit 2's method, and implement and check a `level-sum`-style verification for it.
5. **Explain.** Using this lesson's distinction between a tree that sums cleanly and one that doesn't, explain why `fast-expt`'s recurrence (Lesson 75, Concept Unit 4) — one recursive term per call, but of two different possible shrink amounts depending on even or odd — resists being drawn as a single clean recurrence tree the same way `fib`'s does, despite having only one recursive call per level.

### Definition of done

- [ ] You can define a recurrence tree and explain why its total node count equals the recurrence's `T(n)` exactly.
- [ ] You can derive a clean, general level-`i` node count formula for a uniformly-branching recurrence, and sum it using an already-established closed form (Lesson 65's geometric series).
- [ ] You can explain, using `fib(4)`'s real tree specifically, why an uneven recurrence tree can still be summed correctly level by level even without a general per-level formula.
- [ ] You completed Exercise 1 and 2, extending `fib`'s real tree by hand and confirming it against a fresh real run.
- [ ] You completed Exercises 3–5, applying this lesson's distinction to at least one recurrence not used as this lesson's own example.
- [ ] Commit your Exercise 2 and 4 findings, with a commit message stating which recurrence tree you analyzed and whether it summed cleanly by level.
