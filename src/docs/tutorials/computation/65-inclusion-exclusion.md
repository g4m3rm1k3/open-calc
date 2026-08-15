# Lesson 65: Inclusion-Exclusion

**What you will build**: By the end of this lesson you'll have the precise fix for exactly the overlap problem Lesson 60 flagged but didn't solve — a corrected counting rule for combining two sets that *do* overlap, verified directly using Lesson 10's real set operations rather than trusted only symbolically.

**What you need to know first**: Lesson 60's addition rule and its non-overlap requirement, and Lesson 10's `union` and `intersection`.

**Terms introduced in this lesson**:

- **inclusion-exclusion** — the principle that counting a union by simply adding two sets' sizes overcounts their shared elements, corrected by subtracting the intersection's size: `|A ∪ B| = |A| + |B| - |A ∩ B|`. *Why it matters*: the precise, provable fix for exactly the overlap problem Lesson 60 identified as unsafe for the plain addition rule.

**Objects and methods used**: None new. This lesson combines `clojure.set/union`, `clojure.set/intersection` (Lesson 10), and `my-length` (Lesson 24), each already covered.

---

## Concept Unit: Correcting for Overlap

### The Problem

Lesson 60 showed that adding two counts overcounts whenever the two categories overlap — "all-letter passwords" and "passwords containing at least one letter" double-count every all-letter password. Is there a precise correction, rather than just a warning to avoid the situation?

### Introduce the concept in isolation

When two sets `A` and `B` overlap, `|A| + |B|` counts every element in *both* sets **twice** — once as a member of `A`, once again as a member of `B` — while every element in only one of the two sets is counted correctly, once. The fix is to subtract back out exactly the amount that was double-counted — the size of the overlap itself, `|A ∩ B|` (Lesson 10's intersection):

> **|A ∪ B| = |A| + |B| - |A ∩ B|**

When `A` and `B` don't overlap at all (`A ∩ B` is empty, `|A ∩ B| = 0`), this reduces exactly to Lesson 60's original addition rule — inclusion-exclusion isn't a replacement for that rule, it's its honest generalization, correct whether or not the non-overlap condition happens to hold.

### Discard the throwaway example

Not applicable — this formula is verified directly against real sets in the next unit.

### CS Lens

"Add, then subtract back the double-counted part" is the exact correction Lesson 62's combination formula also performed, in spirit — dividing out an overcounted factor there, subtracting one here — both are instances of "count something easy to overcount directly, then correct precisely for the overcounting," rather than trying to count the right thing directly from the start.

### SE Lells

This formula turns Lesson 60's warning ("don't add overlapping cases") into an actual, usable tool: overlapping cases don't have to be avoided, they just need the correction applied — a real, practical difference between "this technique doesn't work here" and "this technique needs one more term here."

---

## Concept Unit: Verifying With Real Sets

### The Problem

Confirm the formula against real, countable sets — not just symbolically, but by actually building the sets and counting.

### Introduce the concept in isolation

```clojure
(require '[clojure.set :as set])

(def multiples-of-2 #{2 4 6 8 10 12 14 16 18 20})
(def multiples-of-3 #{3 6 9 12 15 18})

(defn inclusion-exclusion-2 [a b]
  (- (+ (my-length a) (my-length b)) (my-length (set/intersection a b))))
```

```
user=> (inclusion-exclusion-2 multiples-of-2 multiples-of-3)
13
user=> (my-length (set/union multiples-of-2 multiples-of-3))
13
```

Both routes agree: `10` multiples of `2` plus `6` multiples of `3`, minus the `3` multiples of `6` counted in both (`6, 12, 18` — Lesson 10's intersection, computed directly), gives `13` — and actually building the real union with `set/union` and counting it directly confirms the identical number, `13`, not merely a symbolically plausible one.

### Discard the throwaway example

Not applicable — `inclusion-exclusion-2` is a real, verified function.

### Project Change

- **Reference Source**: No reference counterpart — a direct implementation of this lesson's own derived formula.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `clojure.set`, required as in Lesson 10.

### The New Code — type it yourself

```clojure
(defn inclusion-exclusion-2 [a b]
  (- (+ (my-length a) (my-length b)) (my-length (set/intersection a b))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(set/intersection a b)`** — reappearing `clojure.set/intersection` (Lesson 10), computing exactly the overlap this lesson's formula needs to subtract.
- **`(my-length a)`, `(my-length b)`, `(my-length (set/intersection a b))`** — reappearing `my-length` (Lesson 24), applied to real sets to get real counts — proof that `my-length`'s structural recursion (built and verified for lists) works correctly on sets too, since Clojure treats both as sequences the same way once counting is what's needed.

### CS Lens

Verifying `inclusion-exclusion-2`'s formula against `set/union` computed and counted directly is the exact "prove the fast version against a slow, obviously-correct reference" habit this series has practiced since Lesson 20 — here, the "slow" version isn't slower in any meaningful sense, but it *is* more obviously correct, since it never risked the overcounting mistake at all.

### SE Lells

Real problems needing inclusion-exclusion frequently can't practically build the actual union to check directly — counting people who like tea *or* coffee from separate tea-drinker and coffee-drinker counts, without a master list of every person, is exactly the situation where the formula is genuinely necessary, not merely a shortcut over something equally easy to compute directly.

### Connection to the previous unit

The previous unit derived the correction formula abstractly; this unit confirms it against real, buildable sets, using tools (Lesson 10's set operations) trusted since early in this series.

---

## Connect the Pieces

Lesson 60's own overlap warning, now precisely resolved:

```clojure
(def all-letter-count 456976)
(def all-digit-count 10000)
(def contains-letter-count 456976)     ; every all-letter string also "contains a letter" — total overlap
(println "Naive (wrong) addition:" (+ all-letter-count contains-letter-count))
(println "Corrected via inclusion-exclusion:" (- (+ all-letter-count contains-letter-count) all-letter-count))
```

```
Naive (wrong) addition: 913952
Corrected via inclusion-exclusion: 456976
```

The naive sum double-counts every all-letter password (since "all-letter" and "contains a letter" describe the identical set in this specific comparison, their intersection *is* the full `456976`) — subtracting that full overlap back out correctly reduces the total to exactly `456976`, confirming there's genuinely nothing new being added by the second, entirely-overlapping category — precisely the mistake Lesson 60's "What Breaks Without This" flagged, now shown corrected rather than merely avoided.

## What Breaks Without This

Suppose the intersection itself were computed incorrectly — say, using the wrong pair of sets (`multiples-of-2` intersected with itself, instead of with `multiples-of-3`):

```
user=> (- (+ 10 6) (my-length (set/intersection multiples-of-2 multiples-of-2)))
6
```

`6`, not `13` — using the wrong intersection (all of `multiples-of-2`, `10` elements, subtracted from `16`) produces a specific, plausible-looking but entirely wrong total. This is a real, easy mistake: the formula's correctness depends entirely on the intersection genuinely being `A ∩ B`, the actual overlap between the *two specific sets in question* — a typo substituting the wrong set produces no error, only a silently wrong count, exactly the "technically executes, silently wrong" risk this series has flagged since Lesson 1.

## Exercises

1. **Trace.** By hand, list `multiples-of-2` and `multiples-of-5` up to `20`, find their overlap, and compute `|A ∪ B|` using inclusion-exclusion. Verify against `set/union`.
2. **Predict.** Before computing it, predict `inclusion-exclusion-2` for two sets with *no* overlap at all. Does it reduce correctly to Lesson 60's plain addition rule?
3. **Verify.** Confirm Exercise 1's result against `my-length (set/union ...)` directly, the way Concept Unit 2 did.
4. **Break it, on purpose.** Reproduce the wrong-intersection mistake from "What Breaks Without This" yourself, using a different pair of sets, and confirm it produces a specific, wrong total.
5. **Generalize.** State (you don't need to implement it) the three-set version of inclusion-exclusion — `|A ∪ B ∪ C|` — by extending the "add singles, subtract pairs" pattern one level further. What has to be added back at the end, and why?
6. **Reconstruct.** Close this lesson. From memory, derive the two-set inclusion-exclusion formula, explaining precisely what gets double-counted and why subtracting the intersection fixes it exactly.

## Definition of Done

- [ ] You can compute `|A ∪ B|` correctly for two overlapping sets, using inclusion-exclusion.
- [ ] You completed Exercise 3, verifying your formula-based count against a directly-built union.
- [ ] You completed Exercise 5 and can state the three-set formula, including why a term needs to be added back at the end.
- [ ] You can explain why inclusion-exclusion reduces to Lesson 60's addition rule exactly when there's no overlap.
- [ ] Commit your Exercise 1 and Exercise 5 work to your notes repository, with a commit message stating the counts you verified — for example, `"Verify multiples-of-2/5 union count via inclusion-exclusion matches set/union directly; state 3-set formula: singles - pairs + triple"` — not just `"lesson 65 exercise"`.

---

**Next lesson:** Lesson 66, *Pigeonhole Principle*, introduces this section's first pure existence proof — showing something *must* be true without constructing a single example of it, using nothing more than the counting rules already built.
