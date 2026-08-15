# Lesson 61: Inclusion-Exclusion

**What you will build:** a real, verified fix for exactly the gap Lesson 57's own SE Lens flagged and deferred: counting a union of categories that overlap, not just disjoint ones. Real, measured evidence this session: among the numbers `1` through `100`, `33` are divisible by `3` and `20` are divisible by `5` — naively adding gives `53`, but a real, brute-force count of numbers divisible by `3` *or* `5` finds only `47`. Subtracting the `6` numbers divisible by both — `33 + 20 − 6 = 47` — matches exactly. The transferable point: the addition principle (Lesson 57) is a special case of a more general rule, one that works whether categories overlap or not, and this lesson derives that general rule and checks it against real, brute-force evidence twice — once for two categories, once for three.

**What you need to know first:** Lesson 35 (`FP-L035-filter.md`) — specifically `filter`, reused throughout to count categories directly. Lesson 57 (`FP-L057-addition-and-multiplication-principles.md`) — specifically the addition principle and its own SE Lens, which named this exact gap ("when categories secretly do overlap") without fixing it — this lesson is that fix.

**Terms introduced in this lesson**

- **Overlap** (of two categories) — the set of possibilities belonging to *both* categories at once. The numbers divisible by both `3` and `5` — equivalently, divisible by `15` — are the overlap between "divisible by `3`" and "divisible by `5`."
- **Inclusion-exclusion principle** — the general counting rule for a union of categories that may overlap: include every category's count, then exclude the counts of every pairwise overlap, then include back the counts of every triple overlap, and so on, alternating, until every possible overlap has been accounted for exactly once.

## Objects and methods used

- **`modulo`**
  - *What it is:* a real Scheme procedure computing the remainder of dividing one integer by another.
  - *Implementation:* takes a dividend and a divisor, returning the remainder; confirmed this session as `(modulo n 3)`, returning `0` exactly when `n` is divisible by `3`.
  - *Its use:* every category test in this lesson — "divisible by `3`," "divisible by `5`," and so on — built directly from `(= 0 (modulo n k))`.

---

## Concept Unit 1: When Categories Aren't Disjoint — the Addition Principle's Blind Spot

### The Problem

Lesson 57's addition principle requires categories to be disjoint — no possibility belongs to more than one. Lesson 57's own SE Lens warned, without demonstrating, that adding category counts "by habit" when categories secretly overlap silently overcounts. It's worth seeing this failure directly, with real numbers, before deriving the fix.

### No isolated lab for this step

This concept has no code of its own to isolate — the real failure is demonstrated directly below, using `filter` (Lesson 35) unchanged.

### Applying It — A Real, Measured Overcount

```scheme
(define div3 (filter (lambda (n) (= 0 (modulo n 3))) nums))
(define div5 (filter (lambda (n) (= 0 (modulo n 5))) nums))
(define div3-or-5 (filter (lambda (n) (or (= 0 (modulo n 3)) (= 0 (modulo n 5)))) nums))
```

```
$ guile incl-excl.scm
div3 count: 33
div5 count: 20
div3-or-5 count (brute force): 47
naive sum (div3+div5): 53
```

Verified this session — among `1` through `100`, exactly `33` numbers are divisible by `3`, exactly `20` are divisible by `5`, and a direct, brute-force count of numbers divisible by *either* finds exactly `47`. Naively adding `33 + 20` gives `53` — six more than the real, measured total.

**Naming why:** "divisible by `3`" and "divisible by `5`" are not disjoint — a number divisible by both, like `15` or `30`, gets counted once inside `div3` and *again* inside `div5`, so simply adding counts it twice. The addition principle's precondition (Lesson 57) — disjoint categories — genuinely fails here, and the real `53`-versus-`47` gap is the direct, measured consequence.

### Walkthrough

- **The real `33`, `20`, and `47` counts** — direct evidence of a genuine category overlap's effect, not a hypothetical warning.
- **The real `53`-versus-`47` mismatch** — confirms Lesson 57's SE Lens's warning with an actual number, not just a cautionary statement.
- **"a number divisible by both... gets counted once inside `div3` and again inside `div5`"** — the precise mechanism of the overcount, named directly.

### CS Lens

This is the general danger of summing counts drawn from a database query, a set of survey responses, or a set of log entries without first confirming the underlying groups are mutually exclusive — a mistake that produces a plausible-looking but wrong total, exactly the kind Lesson 22's evidence-over-assumption discipline exists to catch. Also recognized in: a company's headcount, overcounted by naively summing each department's roster when some employees hold joint appointments across two departments; a survey's total "yes" responses, overcounted by summing per-question "yes" counts when a respondent could answer "yes" to more than one related question describing the same underlying fact.

### SE Lens

The alternative to checking for overlap before adding is to trust that two categories are disjoint because they sound like separate criteria — "divisible by `3`" and "divisible by `5`" certainly *sound* unrelated. The real cost of that alternative, demonstrated directly here, is a silent, exactly-`6`-too-large total, with nothing in the naive computation itself signaling anything went wrong. Measuring the real, brute-force total and comparing it against the naive sum directly, as this unit does, costs one extra `filter` call; it's what makes the overcount visible rather than invisible.

---

## Concept Unit 2: Deriving the Fix — Subtract the Overlap

### The Problem

Concept Unit 1 found the naive sum too large by exactly `6`. It's worth working out, in prose, exactly what that `6` is and why subtracting it recovers the correct total — not just confirming the arithmetic happens to work.

### Applying It — The Derivation

**Naming the excess precisely:** every number divisible by both `3` and `5` was counted twice in `33 + 20` — once in `div3`, once in `div5` — but should be counted once in the true union. Counting it twice, then subtracting it once, leaves it counted exactly once, correcting the double-count without removing it entirely.

**Checking this against the real, measured overlap:**

```scheme
(define div15 (filter (lambda (n) (= 0 (modulo n 15))) nums))
```

```
$ guile incl-excl.scm
div15 count (both): 6
inclusion-exclusion (div3+div5-div15): 47
```

Verified this session — exactly `6` numbers between `1` and `100` are divisible by `15` (equivalently, by both `3` and `5`), exactly matching Concept Unit 1's `53 − 47 = 6` excess; `33 + 20 − 6 = 47`, matching the real, brute-force union count exactly.

**Stated as a general rule, for two categories:**

$$|A \cup B| = |A| + |B| - |A \cap B|$$

Where `A ∪ B` reads "the union — everything in `A` or `B`" and `A ∩ B` reads "the intersection — everything in both `A` and `B`." This is a strict generalization of the addition principle (Lesson 57): when `A` and `B` are genuinely disjoint, `|A ∩ B| = 0`, and the formula reduces to exactly Lesson 57's rule, `|A ∪ B| = |A| + |B|`.

### Walkthrough

- **The real `6`-versus-`6` match** — direct, independent confirmation that the "excess" identified abstractly in Concept Unit 1 is exactly the real, measured overlap.
- **`33 + 20 − 6 = 47`** — the corrected formula, checked against the real brute-force total from Concept Unit 1, matching exactly.
- **"a strict generalization of the addition principle"** — explicit confirmation that Lesson 57's rule wasn't wrong, only incomplete — a special case of this lesson's more general one, recovered exactly when the overlap term is zero.

### CS Lens

This is the fundamental correction technique behind every accurate union-of-groups count: identify what's double-counted, subtract it exactly once, and confirm the correction against independent, brute-force evidence rather than trusting the algebra alone. Also recognized in: a marketing team correcting a naive "total reach" estimate (summing each channel's audience) by subtracting the audience overlap between channels, measured directly rather than assumed; a city planner correcting a naive "total commuters" estimate by subtracting the number of people using more than one form of transit, counted directly.

### SE Lens

The alternative to deriving the subtraction term from the specific mechanism of double-counting is to memorize `|A| + |B| - |A ∩ B|` as a formula without understanding why the subtraction is exactly right — neither too much nor too little. The real cost of that alternative surfaces the moment a third category enters, as Concept Unit 3 does next: a memorized two-category formula gives no guidance for extending correctly, while an understood derivation — count everything, remove exactly what was double-counted — generalizes directly. Deriving it from the real, measured `6`-versus-`6` match, as this unit does, builds the version of understanding that transfers.

---

## Concept Unit 3: Generalizing to Three Categories

### The Problem

Real counting problems often involve more than two overlapping categories. It's worth checking directly whether the two-category fix extends the way the derivation's underlying logic suggests, or whether a third category introduces some new subtlety.

### No isolated lab for this step

This concept has no code of its own to isolate — the real, three-category comparison is demonstrated directly below, using `filter` unchanged.

### Applying It — Divisible by 2, 3, or 5, Checked Three Ways

**Predicting, by extending Concept Unit 2's logic before checking:** with three categories, every pairwise overlap gets double-counted the identical way two-category overlap did, so subtracting all three pairwise overlaps should fix that. But a number in *all three* categories was added three times (once per category) and then subtracted three times (once per pairwise overlap it belongs to) — net zero, when it should be counted once. It needs adding back exactly once more.

**Stated as a formula, extending Concept Unit 2's directly:**

$$|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|$$

**Checking against real, measured counts, for divisibility by `2`, `3`, and `5` among `1` through `100`:**

```
$ guile three-set.scm
brute force |A∪B∪C|: 74
A=50 B=33 C=20
AB=16 AC=10 BC=6 ABC=3
inclusion-exclusion result: 74
```

Verified this session — `50 + 33 + 20 − 16 − 10 − 6 + 3 = 74`, matching the real, brute-force count of numbers divisible by `2`, `3`, or `5` exactly.

### Walkthrough

- **The prediction, worked out in prose before checking** — following this curriculum's standing discipline (Lesson 22 onward) of predicting before verifying.
- **The real `74`-versus-`74` match, across seven separate real counts (`A`, `B`, `C`, `AB`, `AC`, `BC`, `ABC`) combined by one formula** — the strongest evidence in this lesson, confirming the alternating add-subtract-add pattern generalizes correctly, not just for two categories.
- **"added back exactly once more"** — the precise correction for triple overlap, distinguishing this from a naive extension that might have stopped after subtracting pairwise overlaps.

### CS Lens

This is the general inclusion-exclusion principle in its fullest form here demonstrated: alternate adding and subtracting overlaps of increasing size, confirmed to converge on the exact right count because each possibility, no matter how many categories it belongs to, ends up counted exactly once by the alternating sum. Also recognized in: a database query correctly counting rows matching any of several overlapping filter conditions, using the identical alternating-sum logic to avoid double-counting rows matching multiple conditions; a risk analyst correctly estimating the probability of any of several overlapping failure modes occurring, using the identical alternating correction.

### SE Lens

The alternative to deriving and checking the three-category extension is to assume the two-category pattern ("add both, subtract the overlap") simply continues by subtracting every overlap, without separately reasoning about triple overlap's net effect. The real cost of that alternative, left unchecked, would be a formula that undercounts numbers divisible by all three — subtracted three times but only added back zero, rather than the correct net-once. Deriving the "add back" term from first principles, and checking the complete formula against a real, independently brute-forced `74`, as this unit does, is what catches this exact, easy-to-make generalization error before it's trusted.

---

## Closing

### Connect the pieces

One gap, named by Lesson 57, closed here in full:

1. **The gap, demonstrated (Unit 1):** a real, measured `53`-versus-`47` overcount, confirming Lesson 57's SE Lens's warning with actual numbers.
2. **The two-category fix, derived and checked (Unit 2):** `|A| + |B| - |A ∩ B|`, checked against a real `6`-count overlap, recovering `47` exactly — and confirmed as a strict generalization of Lesson 57's addition principle, not a replacement for it.
3. **The three-category extension, predicted and checked (Unit 3):** the alternating add-subtract-add formula, checked against seven independently measured real counts, recovering `74` exactly.

Every correction in this lesson was checked against a real, brute-force count generated by `filter` — nothing in this lesson's formulas was trusted on algebraic plausibility alone, exactly this curriculum's standing evidence discipline, now applied to closing a gap this same curriculum named two lessons ago and deliberately left open until the tools existed to close it properly.

### What breaks without this

Suppose an analyst needed to estimate a company's total unique customer reach across three overlapping marketing channels — email, social media, and direct mail — and, applying only Lesson 57's addition principle without recognizing that a customer could appear in more than one channel's list, simply summed each channel's count. The real total would be silently inflated, exactly the way `33 + 20` overstated the true `47` here, by however many customers happen to appear on multiple channels' lists — a genuinely common situation, not an edge case. Applying inclusion-exclusion correctly, as this lesson derived, either by directly subtracting measured overlaps or by recognizing when a brute-force union count is feasible instead, is what prevents reporting a reach number larger than the company's actual, real customer base.

### Exercises

1. **Observe.** Using the numbers `1` through `50`, count how many are divisible by `4` and how many are divisible by `6`, and compute the naive sum.
2. **Formalize.** Compute the real, brute-force count of numbers from `1` to `50` divisible by `4` or `6`, and compare it against your Exercise 1 naive sum — confirm they differ, and by how much.
3. **Explain.** Using Concept Unit 2's two-category formula, compute the corrected count directly, and confirm it matches your Exercise 2 brute-force result exactly.
4. **Formalize.** Choose three divisors of your own (not `2`, `3`, `5`), and compute the real union count both by brute force and by the three-category inclusion-exclusion formula from Concept Unit 3, confirming they match.
5. **Explain.** State, in your own words, why the three-category formula adds back the triple-overlap count exactly once, rather than twice or not at all — referencing how many times a number in all three categories gets counted by the "add all three, subtract all three pairwise overlaps" step alone.

### Definition of done

- [ ] You can state why the addition principle (Lesson 57) requires disjoint categories, and what goes wrong when it's applied without checking that.
- [ ] You can derive and apply the two-category inclusion-exclusion formula, `|A| + |B| - |A ∩ B|`.
- [ ] You can derive and apply the three-category inclusion-exclusion formula, explaining why the triple-overlap term is added back rather than subtracted.
- [ ] You can check an inclusion-exclusion result against a real, brute-force count, the way every claim in this lesson was checked.
- [ ] You completed Exercises 1–5 using divisors of your own, not `3`, `5`, or `2`.
- [ ] Commit your Exercise 2 through 5 findings, with a commit message stating the divisors you chose and the counts you verified.
