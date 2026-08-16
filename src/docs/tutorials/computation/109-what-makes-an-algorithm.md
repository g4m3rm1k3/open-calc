# Lesson 109: What Makes an Algorithm?

**What you will build**: By the end of this lesson you'll have a precise, four-part definition of "algorithm" — finiteness, determinism, correctness, and resource usage — and verify, with real code and real output, that Lesson 92's `bst-search` already satisfied all four, whether or not this series ever stopped to check them explicitly against this definition.

**What you need to know first**: Lesson 22's base cases and progress; Lesson 78's randomized algorithms and `shuffle`; Lesson 93's structural induction; Lesson 104's `identical?`; Lesson 107's step-counting technique.

**Terms introduced in this lesson**:

- **algorithm** — a finite, well-defined sequence of steps that transforms an input into an output, satisfying four properties this lesson names precisely: finiteness, determinism (or a stated relaxation of it), correctness relative to a specification, and bounded resource usage. *Why it matters*: this series has been building algorithms since Lesson 20, informally; this lesson is the first to state exactly what separates "a sequence of steps that happens to work" from "an algorithm," precisely, and to check each part directly.
- **space complexity** — how much memory an algorithm's execution requires, as a function of input size, using the identical Big-O vocabulary Lesson 51 built for time. *Why it matters*: Lessons 50 through 53 measured *time* almost exclusively; this lesson names memory as an equally real, separately-measured resource, and measures it directly rather than only asserting it.

**Objects and methods used**: None new. This lesson reuses `bst-search` (Lesson 92), `shuffle` (Lesson 78), `identical?` (Lesson 104), and `count-search-steps` (Lesson 107), each already covered.

---

## Concept Unit: Finiteness and Determinism, Checked Directly

### The Problem

Lesson 20 built recursive functions; Lesson 22 proved they terminate. Lesson 78 built *randomized* algorithms, where the same input can take a different path through the computation on different runs. Are both genuinely "algorithms," under one precise definition — and can the difference between them actually be observed, not just described?

### Introduce the concept in isolation

```clojure
(defn same-output-twice? [tree target]
  (= (bst-search tree target) (bst-search tree target)))
```

```
user=> (same-output-twice? bst 70)
true
user=> (shuffle [1 2 3])
[3 1 2]
user=> (shuffle [1 2 3])
[1 3 2]
```

`same-output-twice?` calls `bst-search` on the identical tree and target twice — `true`, unsurprising, but now a checked fact rather than an assumption: **determinism**, precisely, means the same input always produces the same output. `(shuffle [1 2 3])`, called twice on the identical input, gives *different* results — genuinely violating that same-input-same-output property. The standard resolution, stated honestly rather than glossed over: a randomized algorithm is deterministic *given both its input and its random choices* — the randomness is itself treated as a second, explicit input, and the algorithm's behavior, as a function of *both* inputs together, is entirely fixed.

### Discard the throwaway example

Not applicable — `same-output-twice?` is a real, reusable function, and both `shuffle` calls are real, run output.

### Project Change

- **Reference Source**: `same-output-twice?` reuses Lesson 92's `bst-search` directly, called twice to make Lesson 109's definition of determinism checkable rather than assumed; `shuffle` reused unchanged from Lesson 78.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn same-output-twice? [tree target]
  (= (bst-search tree target) (bst-search tree target)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(bst-search tree target)`, called twice** — reappearing (Lesson 92); calling the identical function, on the identical arguments, twice in a row is the direct, checkable meaning of "same input, same output," rather than a property taken on faith.
- **`(= ... ...)`** — reappearing equality (Lesson 2), here comparing two *invocations* of the same function rather than two plain values, a first use of `=` for this specific purpose.
- **`(shuffle [1 2 3])`** — reappearing (Lesson 78): the counterexample, run twice, genuinely producing two different orderings from the identical input.

### CS Lens

Treating randomness as an explicit second input, rather than a mysterious exception to determinism, is the identical move Lesson 78 itself made when it first introduced randomized algorithms — this lesson simply gives that resolution its proper place inside a general definition, checked here directly against both a deterministic and a randomized function side by side.

### SE Lens

Finiteness is not automatic — Lesson 22's own base-case-and-progress checklist exists precisely because a recursive definition that looks reasonable can still fail to terminate; "is this actually finite" remains a real question to check for every new algorithm this series builds from here forward, not a property granted for free by writing code that looks like an algorithm.

---

## Concept Unit: Correctness, Checked Against a Specification

### The Problem

Lesson 93 proved `bst-search` correct via structural induction. What, precisely, was that proof a proof *of* — and can "correctness" be stated as a checkable claim, run against real cases, rather than only trusted from the proof's own existence?

### Introduce the concept in isolation

```clojure
(defn satisfies-search-spec? [tree present-value absent-value]
  (and (= (bst-search tree present-value) present-value)
       (= (bst-search tree absent-value) nil)))
```

```
user=> (satisfies-search-spec? bst 70 15)
true
```

An algorithm is **correct** relative to a **specification** — here stated directly as code: "for a present value, return it; for an absent one, return `nil`." `satisfies-search-spec?` checks both halves of that contract at once, against `bst`'s own already-verified cases (`70` present, `15` absent, both traced back in Lesson 92). Correctness is *always* relative to some stated specification, never an absolute property a function either "has" or "lacks" in isolation — a different specification would make the identical code either trivially correct or genuinely wrong.

### Discard the throwaway example

Not applicable — `satisfies-search-spec?` is a real, reusable function.

### Project Change

- **Reference Source**: `satisfies-search-spec?` states, as real code, the specification Lesson 93's own structural-induction proof was proving `bst-search` correct against.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn satisfies-search-spec? [tree present-value absent-value]
  (and (= (bst-search tree present-value) present-value)
       (= (bst-search tree absent-value) nil)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= (bst-search tree present-value) present-value)`** — first appearance of a specification's "present" half, stated as a direct equality check rather than prose.
- **`(= (bst-search tree absent-value) nil)`** — first appearance of the "absent" half, checked separately — a specification with two distinct cases, per Lesson 17's own proof-by-cases discipline.
- **`and`** — reappearing (Lesson 7): both halves must hold together for the specification to be satisfied at all.

### CS Lens

Every structural-induction proof this series has written since Lesson 93 was, precisely, a correctness proof under this lesson's own definition — Lesson 93 never used the word "algorithm," but `bst-search` was one the entire time, and `satisfies-search-spec?` is the identical claim that proof established, now runnable directly rather than only readable.

### SE Lens

Stating a specification explicitly, as checkable code, is what makes "is this right" a question with a definite answer rather than a matter of opinion — `satisfies-search-spec?` could be run against *any* tree and target pair a real test suite might generate, exactly the kind of concrete check Lesson 110 (immediately next) builds into the very first step of solving a new problem.

### Connection to the previous unit

The previous unit established that an algorithm must finish and behave predictably; this unit is what "behaves predictably" actually has to mean — predictable *relative to a stated, checkable contract*, run here rather than only claimed.

---

## Concept Unit: Resource Usage — Time and Space, Both Measured

### The Problem

Lesson 107 measured `bst-search`'s *time* cost directly, in real counted steps. Lesson 104's structural sharing was motivated by a completely different concern: how much *memory* an operation actually allocates. Can that be measured directly too, the same way time was?

### Introduce the concept in isolation

```clojure
(defn count-new-nodes [old-tree new-tree]
  (if (identical? old-tree new-tree)
    0
    (if (nil? new-tree)
      0
      (+ 1 (count-new-nodes (bst-left old-tree) (bst-left new-tree)) (count-new-nodes (bst-right old-tree) (bst-right new-tree))))))
```

```
user=> (def bst2 (bst-insert bst 25))
user=> (count-search-steps bst 70 0)
3
user=> (count-new-nodes bst bst2)
4
```

**Time**: reusing Lesson 107's own `count-search-steps`, `bst-search` for `70` costs `3` steps — already measured, cited here as this lesson's time-complexity evidence. **Space**: `count-new-nodes`, using Lesson 104's `identical?`, walks both trees together and counts only the positions that are genuinely *new* objects, not shared ones — `bst-insert`ing `25` into `bst`'s seven nodes allocates exactly `4` new nodes (the path from the root to the new leaf), while the other three (the entire untouched right subtree) are reused, `identical?`, exactly as Lesson 104 proved.

### Discard the throwaway example

Not applicable — `count-new-nodes` is a real, reusable function, and both counts are genuine, verified measurements.

### Project Change

- **Reference Source**: `count-new-nodes` reuses Lesson 104's `identical?` directly, applied here for the first time to *count* shared versus new nodes rather than only confirm sharing occurred at a single point.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn count-new-nodes [old-tree new-tree]
  (if (identical? old-tree new-tree)
    0
    (if (nil? new-tree)
      0
      (+ 1 (count-new-nodes (bst-left old-tree) (bst-left new-tree)) (count-new-nodes (bst-right old-tree) (bst-right new-tree))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(identical? old-tree new-tree)`** — reappearing (Lesson 104); the base case for a *shared*, unchanged subtree — correctly returns `0` the moment a position was reused rather than rebuilt, without recursing any further into it at all.
- **`(nil? new-tree)`** — reappearing (Lesson 85): the recursion's other stopping point, reached at the edge of both trees.
- **`(+ 1 (count-new-nodes (bst-left ...) (bst-left ...)) (count-new-nodes (bst-right ...) (bst-right ...)))`** — reappearing two-recursive-call structure (Lesson 30): `1` for the current position, genuinely new here, plus whatever's new in each subtree — stopping immediately, via the first base case, the moment a shared subtree is reached.

### CS Lens

Lesson 51's `O`-notation applies identically to this measured `4` as it does to the `3` steps `count-search-steps` measured — two independent resources, **time complexity** and **space complexity**, both real numbers, both measured here directly on the same operation rather than assumed to move together.

### SE Lens

An algorithm optimized purely for time can be a poor real-world choice if its space cost is unacceptable for the system it runs on, or the reverse — `bst-insert`'s `4`-new-nodes cost here happens to track its `O(\text{depth})` time cost closely, but nothing about that pairing is automatic; Lesson 100's B-tree, choosing wider nodes deliberately, trades some *additional* space per node for *fewer* node visits, a genuine, independent tradeoff this lesson's two separate measurements make it possible to state precisely.

### Connection to the previous unit

The previous unit checked correctness as a runnable claim; this unit is the other half of what makes an algorithm *good*, not merely correct — bounded, measured resource usage, in two independent dimensions, both counted directly rather than estimated.

---

## Connect the Pieces

All four properties, checked against one already-built algorithm — Lesson 93's `bst-search`, alongside Lesson 92's `bst-insert`:

```clojure
(println "Deterministic?" (same-output-twice? bst 70))
(println "Correct, relative to its specification?" (satisfies-search-spec? bst 70 15))
(println "Time cost, searching for 70:" (count-search-steps bst 70 0) "steps")
(println "Space cost, inserting 25:" (count-new-nodes bst bst2) "new nodes")
```

```
Deterministic? true
Correct, relative to its specification? true
Time cost, searching for 70: 3 steps
Space cost, inserting 25: 4 new nodes
```

Four separate questions, four separate, measured answers, for functions this series proved correct many lessons before this lesson ever named — and checked, directly — what "algorithm" was actually claiming about them.

## What Breaks Without This

Suppose someone claimed a function was "a correct algorithm" without ever stating what specification it was correct *relative to*. `satisfies-search-spec?` makes the danger concrete: change its own definition to check only the "present" half, dropping the "absent" half entirely —

```clojure
(defn incomplete-spec? [tree present-value]
  (= (bst-search tree present-value) present-value))
```

```
user=> (incomplete-spec? sorted-chain 70)
true
```

`incomplete-spec?` reports `true` for `sorted-chain` (Lesson 107's own degenerate BST) just as readily as it would for a badly broken search function that *always* returns whatever it's given — because a specification that only checks "present" tells nothing about whether "absent" cases are handled at all. Without stating and checking *both* halves, "correct" has no real target to verify against — exactly Lesson 16's own warning about unstated invariants, now applied to an entire algorithm's contract.

## Exercises

1. **Trace.** By hand, trace `(count-new-nodes bst bst2)`, listing all four nodes it counts as new.
2. **Predict.** Before checking, predict `(satisfies-search-spec? sorted-chain 70 15)` (Lesson 107's degenerate tree). Verify — does a degenerate shape affect correctness, or only cost?
3. **Verify.** Run `(same-output-twice? sorted-chain 70)` and confirm determinism holds even on a degenerate tree — correctness and determinism don't depend on shape at all.
4. **Break it, on purpose.** Using `incomplete-spec?`, find a genuinely broken search function (one that ignores its target entirely) that still passes `incomplete-spec?` for some input, demonstrating exactly why the "absent" half matters.
5. **Generalize.** Write `count-new-nodes`'s counterpart for `avl-insert` (Lesson 98), and compare its space cost to plain `bst-insert`'s on the same input — does rebalancing cost additional new nodes beyond the path itself?
6. **Reconstruct.** Close this lesson. From memory, state all four properties, and explain why a randomized algorithm is still considered deterministic in the sense this lesson actually cares about.

## Definition of Done

- [ ] You can state this lesson's four-part definition of "algorithm" from memory.
- [ ] You can write a specification as runnable code, covering both a "present" and an "absent" case.
- [ ] You can measure both time and space cost for a function you didn't write this lesson.
- [ ] You completed Exercise 4 and demonstrated why a one-sided specification misses real bugs.
- [ ] You completed Exercise 5 and compared `avl-insert`'s space cost to plain `bst-insert`'s.
- [ ] Commit your Exercise 4 and Exercise 5 work to your notes repository, with a commit message stating what you found — for example, `"Demonstrate incomplete-spec? missing a broken always-returns-target function; compare avl-insert vs bst-insert new-node counts"` — not just `"lesson 109 exercise"`.

---

**Next lesson:** Lesson 110, *Specifications Before Algorithms*, takes this lesson's `satisfies-search-spec?` idea and makes stating the specification itself the actual first, disciplined step of solving any new problem — before any algorithm is designed at all.
