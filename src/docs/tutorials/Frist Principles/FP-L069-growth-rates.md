# Lesson 69: Growth Rates

**What you will build:** `has-duplicate?`, one new real procedure — but this lesson's actual work is assembling six growth-rate categories side by side, each backed by real, measured evidence, most of it already gathered across Lessons 51 through 68. Real numbers, collected in one place for the first time: constant (`arithmetic-sum-formula`, Lesson 64: `0.025` ms whether summing `5,000,000` terms or five), logarithmic (`halving-count`, Lesson 67: exactly `+10` for every `1,000×` increase in `n`), linear (`linear-search`, Lesson 68: time roughly doubles when `n` doubles), quadratic (`has-duplicate?`, built fresh this lesson: time roughly *quadruples* when `n` doubles), exponential (`all-subsets`, Lesson 51: `1,024` calls become `1,048,576` from just ten more items), and factorial (`permutations`, Lesson 58: `2.858` ms becomes nearly sixteen *seconds* across four more items). The transferable point: this curriculum has been measuring these six behaviors separately since Era II. This lesson is where they finally sit next to each other, ordered, so the difference between them stops being six separate facts and becomes one felt hierarchy.

**What you need to know first:** Lesson 51 (`FP-L051-generating-possibilities.md`), Lesson 53 (`FP-L053-repeated-subproblems.md`) — exponential evidence, reused directly. Lesson 58 (`FP-L058-permutations.md`) — factorial evidence, reused directly. Lesson 64 (`FP-L064-arithmetic-series.md`) — constant-time evidence, reused directly. Lesson 67 (`FP-L067-logarithms.md`) — logarithmic evidence, reused directly. Lesson 68 (`FP-L068-repeated-halving.md`) — linear evidence, reused directly.

**Terms introduced in this lesson**

- **Growth rate** — how a computation's cost (time, calls, comparisons) changes as its input size `n` increases. Two algorithms can both be "correct" while having entirely different growth rates, exactly the gap this curriculum has measured repeatedly without yet naming the underlying hierarchy.
- **Polynomial growth** — growth proportional to `n` raised to some fixed power (`n`, `n²`, `n³`, …). Linear growth is the specific polynomial case of power `1`; quadratic growth, this lesson's new example, is the case of power `2`.
- **Doubling ratio** — the practical diagnostic this lesson uses throughout: measure a computation's cost at some `n`, then again at `2n`, and look at the *ratio* between the two costs. That ratio, not the raw numbers, is what reveals which growth-rate category a computation belongs to.

---

## Concept Unit 1: Six Categories, One Comparison Table

### The Problem

Six different growth behaviors have already appeared in this curriculum, each measured in its own lesson, each connected to its own specific procedure. It's worth naming all six together, in one place, before looking at any more evidence.

### No isolated lab for this step

This concept has no code of its own to isolate — the six categories are named directly below.

### Applying It — Naming the Six Categories

| Category | What happens as `n` grows | Already measured, real evidence |
|---|---|---|
| Constant | Cost stays the same, regardless of `n` | `arithmetic-sum-formula` (Lesson 64): `0.025` ms at `n = 5,000,000` |
| Logarithmic | Cost grows by a fixed amount each time `n` *multiplies* | `halving-count` (Lesson 67): `+10` for every `1,000×` increase |
| Linear | Cost grows in direct proportion to `n` | `linear-search` (Lesson 68): worst-case comparisons equal `n` exactly |
| Quadratic (polynomial) | Cost grows in proportion to `n²` | Built this lesson: `has-duplicate?` |
| Exponential | Cost grows by a fixed *multiple* each time `n` increases by `1` | `all-subsets` (Lesson 51): `2ⁿ` calls |
| Factorial | Cost grows by a *shrinking-by-one* multiple each time `n` increases by `1` | `permutations` (Lesson 58): `n!` orderings |

### Walkthrough

- **The table itself** — the first time this curriculum has placed all six behaviors in one location, each one traced back to a specific, real, already-measured procedure rather than introduced as an abstract new idea.
- **"already measured, real evidence"** — deliberately emphasizing that nothing in this table is a new claim; every entry cites a lesson where the number was actually produced by running code.

### CS Lens

This is the recognition that six seemingly separate measurements, made across a large stretch of this curriculum, are instances of a small, closed set of named categories — exactly the same kind of unifying recognition Lesson 60 made for Pascal's Triangle and dynamic programming. Also recognized in: a biologist recognizing that several separately observed growth patterns across different species all fall into a small number of named mathematical growth models; a financial analyst recognizing that several separately tracked investment returns all fall into a small number of named compounding patterns.

### SE Lens

The alternative to naming these six categories explicitly is to keep treating each new algorithm's performance as its own separate question, answered from scratch by measurement alone, the way this curriculum did lesson by lesson through Era II and the first half of Era III. The real cost of that alternative, addressed directly by Concept Unit 5, is having no way to *predict* which category a genuinely new, unmeasured algorithm will fall into, without running it first. Naming the categories, as this unit does, is the necessary first step toward Lesson 70's asymptotic thinking and Lesson 71's Big-O — a vocabulary for reasoning about growth without needing to measure everything directly.

---

## Concept Unit 2: Constant and Logarithmic — Barely Growing at All

### The Problem

Two of the six categories are worth examining together first, because both are, in a specific sense this unit makes precise, barely affected by `n` growing at all — worth confirming directly, using real evidence already gathered.

### No isolated lab for this step

This concept has no code of its own to isolate — the real evidence is restated directly below, from Lesson 64 and Lesson 67.

### Applying It — Restating Two Already-Measured Results Side by Side

**Constant, from Lesson 64:** `arithmetic-sum-formula` took `0.025` ms summing `5,000,000` terms. Summing `10` terms, or `10` billion terms, costs the identical, fixed handful of arithmetic operations — `n` doesn't appear in the cost at all.

**Logarithmic, from Lesson 67:** `halving-count(1,000) = 9`; `halving-count(1,000,000) = 19`; `halving-count(1,000,000,000) = 29`. Each `1,000×` increase in `n` — a thousandfold jump — costs only `10` more steps. `n` does appear in the cost, but so weakly that multiplying it by a thousand barely moves the needle.

**The precise distinction between them:** constant cost doesn't depend on `n` whatsoever. Logarithmic cost does depend on `n`, but grows so slowly that, practically, enormous changes in `n` produce small, almost unnoticeable changes in cost.

### Walkthrough

- **The restated `0.025` ms and `9`/`19`/`29` figures** — no new computation, but the first time these two results have been placed side by side specifically to contrast "doesn't depend on `n`" against "depends on `n`, but barely."
- **"barely moves the needle"** — a precise, informal restatement of logarithmic growth's defining practical property, grounded in the real `+10`-per-`1,000×` pattern rather than left abstract.

### CS Lens

This is the practical reason binary search (Lesson 68) and exponentiation by squaring (Lesson 66) both felt almost too fast to believe: their costs belong to categories that are, for all realistic purposes, insensitive to how large the input actually is. Also recognized in: a well-indexed database lookup taking essentially the same time whether the table holds a thousand rows or a billion; a well-organized filing system letting a clerk find any document in a small, bounded number of steps regardless of the archive's total size.

### SE Lens

The alternative to distinguishing "doesn't depend on `n`" from "depends on `n`, but weakly" is to lump both together as simply "fast." The real cost of that alternative would be missing a genuine, meaningful difference — a constant-time operation performed a million times still costs a fixed amount; a logarithmic-time operation performed a million times costs a bit more each time, small but real. Keeping the distinction precise, as this unit does, matters directly the moment either operation is used as a building block inside a larger, repeated computation — a distinction Era III's later lessons will build on directly.

---

## Concept Unit 3: Linear and Quadratic — the Doubling Ratio, Applied

### The Problem

Linear and quadratic growth are both cases where cost genuinely, substantially increases with `n` — but by how much, precisely, and how can that be told apart without already knowing the underlying formula? A practical diagnostic is needed, and quadratic growth needs a real procedure to measure in the first place.

### The New Code — Type It Yourself

```scheme
(define (has-duplicate? lst)
  (cond ((null? lst) #f)
        ((member (car lst) (cdr lst)) #t)
        (else (has-duplicate? (cdr lst)))))
```

### The Updated Project

This is `has-duplicate.scm`, in full:

```scheme
(define (has-duplicate? lst)
  (cond ((null? lst) #f)
        ((member (car lst) (cdr lst)) #t)
        (else (has-duplicate? (cdr lst)))))

(display (has-duplicate? (list 1 2 3 4 3)))
(newline)
(display (has-duplicate? (list 1 2 3 4 5)))
(newline)
```

### Reference Source

The most direct translation of "check every pair": for each item, check whether it appears again anywhere later in the list, using `member` (Lesson 53); if any item does, there's a duplicate; if the list runs out with none found, there isn't.

### Files affected

Created: `has-duplicate.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile has-duplicate.scm
#t
#f
```

Verified this session — `(1 2 3 4 3)` correctly reports a duplicate (`3` appears twice); `(1 2 3 4 5)` correctly reports none.

### Applying the Doubling Ratio — Linear vs. Quadratic, Measured

**Linear, restated from Lesson 68:** `linear-search`'s real timing at `n = 100,000`, `200,000`, and `400,000`:

```
$ guile growth.scm
n=100000 time=12.683 ms
n=200000 time=23.819 ms
n=400000 time=43.886 ms
```

Doubling `n` roughly doubles the time (`12.683 → 23.819`, `23.819 → 43.886`) — a doubling ratio close to `2×`, matching linear growth exactly.

**Quadratic, measured fresh with `has-duplicate?`:**

```
$ guile quadratic.scm
n=2000 time=8.171 ms
n=4000 time=31.512 ms
n=8000 time=116.287 ms
```

Doubling `n` roughly *quadruples* the time (`8.171 → 31.512`, a ratio of `3.86×`; `31.512 → 116.287`, a ratio of `3.69×`) — a doubling ratio close to `4×`, not `2×`.

**Naming why, directly:** `has-duplicate?`'s `member` call, for each item, scans however many items remain — roughly `n` comparisons, done for each of roughly `n` items, giving roughly `n × n = n²` total comparisons. Doubling `n` means `(2n)² = 4n²` — four times the work, exactly the measured `~4×` ratio.

### Mechanical Walkthrough

- **`(cond ((null? lst) #f) ...)`** — the base case: an empty list has no duplicates.
- **`((member (car lst) (cdr lst)) #t)`** — checking whether the first item reappears anywhere in the rest of the list.
- **`(else (has-duplicate? (cdr lst)))`** — if not, check the rest of the list the identical way.
- **The doubling-ratio measurements** — the practical technique this unit introduces: measure at `n` and `2n`, and read the *ratio*, `~2×` for linear, `~4×` for quadratic, as the diagnostic signal.

### CS Lens

This is the doubling ratio as a genuinely practical diagnostic tool: without ever deriving a formula, measuring cost at `n` and `2n` and checking whether the ratio is close to `2` (linear), `4` (quadratic), `8` (cubic), or something else entirely reveals a real algorithm's growth category directly from evidence. Also recognized in: a doctor estimating a tumor's growth pattern by comparing its size at two time points, rather than deriving its biological growth law from first principles; an economist estimating whether a cost scales linearly or quadratically with volume by comparing costs at two different production levels.

### SE Lens

The alternative to measuring the doubling ratio directly is to guess an algorithm's growth category by reading its code and reasoning informally about loops and nesting. The real cost of that alternative, for code with subtle structure (recursive calls, hidden work inside a library function), is a plausible-sounding guess that might be wrong. Measuring the real doubling ratio, as this unit does for both `linear-search` and `has-duplicate?`, turns a guess into evidence — exactly this curriculum's standing discipline, now packaged as a specific, reusable diagnostic technique.

---

## Concept Unit 4: Exponential and Factorial — Extreme Growth, Restated

### The Problem

The two most extreme categories have already been measured, dramatically, in Lesson 51 and Lesson 58. It's worth restating them here specifically through the doubling-ratio lens, to see how differently they behave from linear and quadratic growth.

### No isolated lab for this step

This concept has no code of its own to isolate — the real evidence is restated directly below.

### Applying It — Doubling Ratios for Exponential and Factorial

**Exponential, restated from Lesson 51 and 56:** `all-subsets`' real subset count at `n = 10` was `1,024`; at `n = 20` — not double, but ten *more* items — it was `1,048,576`. The doubling ratio here isn't even the right question: exponential growth's defining property is that *adding a fixed number of items* (not doubling `n`) multiplies the cost by a fixed factor — each single additional item doubles `all-subsets`' count outright.

**Factorial, restated from Lesson 58:** `permutations`' real timing went from `2.858` ms at `n = 6` to `15,984.115` ms at `n = 10` — just four more items, not a doubling of `n` at all, produced a roughly `5,600×` increase in time.

**Naming the contrast directly:** linear and quadratic growth's doubling ratios (`~2×`, `~4×`) stay the *same* no matter how large `n` already is. Exponential and factorial growth have no such fixed doubling ratio at all — the *amount* added per step, not the ratio `n` is multiplied by, is what drives their cost, and that makes them fundamentally worse at scale than any fixed-power polynomial, no matter how high the power.

### Walkthrough

- **The restated `1,024`/`1,048,576` and `2.858`/`15,984.115` figures** — no new computation, but reexamined specifically through the doubling-ratio framework Concept Unit 3 introduced.
- **"the doubling ratio here isn't even the right question"** — the central, precise distinction: polynomial categories (constant, linear, quadratic, …) have a *fixed* doubling ratio; exponential and factorial do not, because their growth compounds with every single additional unit of `n`, not merely with a doubling of it.

### CS Lens

This is the sharpest possible confirmation of why exponential and factorial algorithms are treated as a fundamentally different, more dangerous category than any polynomial one, no matter how high-degree: a quadratic algorithm's cost at `n = 1,000` versus `n = 1,000,000` is large but bounded by a fixed formula; an exponential or factorial algorithm's cost over the identical range is effectively unbounded in practice. Also recognized in: a rumor spreading exponentially through a population, where each person tells a fixed number of new people, versus a queue growing linearly, where a fixed number of new people join per hour — the rumor's spread becomes uncontrollable in a way the queue's growth never does, no matter how long either continues.

### SE Lens

The alternative to distinguishing exponential and factorial growth from "just a higher-degree polynomial" is to treat all "big" growth rates as roughly interchangeable, differing only by how large the numbers get. The real cost of that alternative is missing the qualitative cliff between them — a quadratic algorithm remains usable, if slow, well past the point an exponential one has already become completely impractical, exactly what Lesson 58's `permutations` demonstrated directly at `n = 10`. Keeping this distinction sharp, as this unit does, is precisely why this curriculum has treated overlapping subproblems (Lesson 53) and dynamic programming (Lesson 55) as such a significant fix — not a modest optimization, but an escape from a fundamentally worse category of growth.

---

## Concept Unit 5: Putting Them in Order

### The Problem

Six categories have now been named and grounded in real evidence. It's worth stating their relative order explicitly, and confirming that order is consistent across every real measurement this lesson has gathered.

### No isolated lab for this step

This concept has no code of its own to isolate — the ordering is stated directly below, using every result already gathered in this lesson.

### Applying It — The Complete Ordering, Justified by Real Evidence

$$\text{constant} < \text{logarithmic} < \text{linear} < \text{quadratic} < \text{exponential} < \text{factorial}$$

**Checking this order against every real measurement gathered in this lesson, at comparable scale:** constant (`0.025` ms, unaffected by scale) is cheaper than logarithmic (`19`–`29` steps across billions-fold changes in `n`); logarithmic is cheaper than linear (`linear-search`'s comparisons equal `n` directly, vastly more than `halving-count`'s `~20`–`30` at the identical scale); linear's doubling ratio (`~2×`) is smaller than quadratic's (`~4×`); and both are dwarfed entirely by exponential and factorial growth, where `all-subsets` and `permutations` reached costs in the millions and in the tens of thousands of milliseconds from input sizes barely into the double digits — scales where linear and quadratic algorithms remained entirely comfortable.

**Stating this honestly as an ordering of long-run behavior, not a claim about every single input:** for very small `n`, a "worse" category can still finish faster in absolute terms than a "better" one with more overhead per step — this lesson's ordering is about what happens as `n` grows large, exactly the "asymptotic" framing Lesson 70 will make precise.

### Walkthrough

- **The six-category ordering, stated as one inequality** — the culmination of every real number gathered in this lesson, arranged into a single, checkable hierarchy.
- **The honest caveat about small `n`** — following this curriculum's standing discipline (Lesson 64's `d = 0`, Lesson 65's `r = 1`) of stating a result's precise scope rather than overclaiming it holds universally, in every circumstance, without qualification.

### CS Lens

This is the complete growth-rate hierarchy underlying essentially every algorithm-comparison decision in computer science, now grounded entirely in real evidence this curriculum produced itself, not handed down as a table to memorize — exactly the "derive, don't memorize" discipline this curriculum has held since Lesson 22, applied here to one of the field's most consequential pieces of vocabulary. Also recognized in: a naturalist's ordering of organism growth patterns, from organisms with fixed adult size (constant) through those with unbounded compounding growth, grounded in direct field measurement rather than an assumed taxonomy.

### SE Lens

The alternative to deriving this ordering from this curriculum's own real, measured evidence is to present it as a table to memorize, disconnected from anything actually built or run. The real cost of that alternative is exactly what this entire lesson has worked against: vocabulary without grounding, the kind this curriculum has avoided since Lesson 1. Every category in this ordering traces back to a specific, real procedure this curriculum built and measured directly — `arithmetic-sum-formula`, `halving-count`, `linear-search`, `has-duplicate?`, `all-subsets`, `permutations` — making the ordering something demonstrated, not merely asserted.

---

## Closing

### Connect the pieces

Six categories, six real procedures, one ordering:

1. **The categories, named (Unit 1):** constant, logarithmic, linear, quadratic (polynomial), exponential, factorial — each tied directly to a specific, already-built procedure.
2. **Constant and logarithmic, contrasted (Unit 2):** `arithmetic-sum-formula`'s true independence from `n`, versus `halving-count`'s slow, but real, dependence on it.
3. **Linear and quadratic, measured via doubling ratio (Unit 3):** `linear-search`'s `~2×` and `has-duplicate?`'s `~4×`, a new, reusable diagnostic technique introduced alongside the new procedure.
4. **Exponential and factorial, restated (Unit 4):** `all-subsets` and `permutations`, both driven by growth with no fixed doubling ratio at all, qualitatively worse than any polynomial.
5. **The complete ordering (Unit 5):** constant < logarithmic < linear < quadratic < exponential < factorial, checked against every real number gathered across this lesson and honestly scoped to large-`n` behavior.

Every category in this lesson's ordering is backed by a real procedure, built and measured either in this lesson or an earlier one — this lesson's entire contribution is arrangement and comparison, using the doubling-ratio technique as the connecting thread, setting up Lesson 70's asymptotic thinking and Lesson 71's Big-O notation to formalize what's now directly, firsthand understood.

### What breaks without this

Suppose an engineer, having built several algorithms across a project without ever comparing their growth categories directly, needed to choose between two working, correct implementations of the same feature — one this curriculum's evidence would classify as quadratic, one as exponential — based only on which one "felt faster" during small-scale testing. Because exponential and polynomial algorithms can perform similarly at small `n` (Concept Unit 5's honest caveat), that engineer might choose the exponential one, only to discover it becomes catastrophically slow the moment real, larger-scale data arrives — exactly the gap between `n = 10`'s barely-noticeable difference and `n = 20`'s dramatic one that Lesson 51 already measured directly. Having the doubling-ratio diagnostic and the six-category vocabulary from this lesson is what turns "pick whichever felt faster in testing" into a deliberate, evidence-based decision made *before* a costly mistake reaches production scale.

### Exercises

1. **Observe.** Choose two procedures already built elsewhere in this curriculum, not used as this lesson's own examples, and classify each into one of the six growth-rate categories, stating your reasoning.
2. **Formalize.** For one of your Exercise 1 procedures, measure its real cost at `n` and `2n`, and compute the doubling ratio, following Concept Unit 3's methodology.
3. **Explain.** State whether your Exercise 2 measured ratio matches the category you predicted in Exercise 1 — if it doesn't, explain what that would mean about your original classification.
4. **Formalize.** Implement a small, real procedure with cubic growth (`n³`) — for example, checking every triple of items in a list for some condition — and measure its doubling ratio at two sizes of your own choosing.
5. **Explain.** Using Concept Unit 5's ordering, predict, before measuring, whether your Exercise 4 cubic procedure's doubling ratio should be closer to `4×` (quadratic) or `8×` (cubic), and explain your prediction using the identical `(2n)ᵏ` reasoning Concept Unit 3 used for quadratic growth.

### Definition of done

- [ ] You can name and define all six growth-rate categories from this lesson, each tied to a real, concrete example.
- [ ] You can compute a doubling ratio from real measured data and identify which growth-rate category it indicates.
- [ ] You can explain why exponential and factorial growth have no fixed doubling ratio, unlike every polynomial category.
- [ ] You can state the complete growth-rate ordering and explain why it's scoped to large-`n` behavior, not every input size.
- [ ] You completed Exercises 1–5, including a real, newly measured cubic-growth procedure.
- [ ] Commit your Exercise 4 procedure and your Exercise 2 through 5 findings, with a commit message stating the growth categories you confirmed.
