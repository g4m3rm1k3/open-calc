# Lesson 166: Why Averages Behave — Concentration Intuition

**What you will build.** A real, provable explanation for something this curriculum has relied on, silently, in every single Monte Carlo check since Lesson 159: run enough independent trials, average the results, and that average lands close to the true expected value — not by luck, but by a real, quantifiable guarantee. Four real procedures: `sample-mean`, which averages `n` fair coin flips; `variance`, which computes a random variable's exact spread from its own distribution; `chebyshev-bound`, a real, general inequality bounding how far *any* random variable can stray from its own mean, using nothing but its variance; and `fraction-exceeding`, which measures, for real, how often a sample mean actually strays that far. The transferable idea: **concentration** — a random quantity built by averaging many independent pieces has far less spread than any single piece alone, and that reduction in spread is not just observable, it's provable, with an exact formula for how fast it happens.

**What you need to know first.** Lesson 150 (Independence) for what it means for random outcomes to carry no information about each other. Lesson 153 (Expected Value) for expectation and linearity. Lesson 154 (Variance) for variance itself, as a measure of spread. Lesson 155 (Common Distributions) for the Binomial distribution's own variance formula, `n·p·(1-p)`, and for a single Bernoulli trial as `Binomial(1, p)`'s own special case. Lesson 159 (Monte Carlo Algorithms) for the whole practice of estimating a true value by averaging many real trials, a practice this lesson finally explains rather than just uses. Lesson 165 (Probabilistic Analysis) for this curriculum's now-standard move of proving an exact claim and then checking it against real, independent, measured evidence.

**Terms used in this lesson**

- **`define`** — binds a name, at top level, to a procedure or a value.
- **`let`** — introduces one or more local bindings, visible only inside `let`'s own body.
- **`let*`** — like `let`, but each binding can see the ones before it in the same block. This lesson reuses it for computing a distribution's own mean first, and then its squared deviations, which depend on that mean.
- **Named `let` (self-referential loop)** — a `let` that gives its own body a name, so the body can call that name again with new argument values. Scheme's loop construct, with no separate `for` or `while` keyword.
- **Accumulator-passing recursion** — carrying the "answer built so far" as an extra argument on each self-call. Every loop in this lesson uses it, unchanged from its use across Lessons 162 through 165.
- **`if`** — a two-branch conditional: evaluates its test, then evaluates exactly one of its remaining sub-expressions.
- **`lambda`** — builds an anonymous procedure, created right where it's needed. This lesson uses it for small, one-off transformations passed to `map`, like squaring a single deviation from the mean.
- **Exact rational numbers** — Guile's numeric tower represents the result of dividing two exact integers that don't divide evenly as an exact fraction, never a rounded decimal. This lesson's variance and bound computations stay exact fractions throughout, converted to decimals only for reading.
- **Sample mean** — the average of `n` independent observations of the same random variable; itself a random variable, since a fresh set of `n` observations gives a (possibly different) fresh average.
- **Variance of a sum** — for independent random variables, the variance of their sum equals the sum of their individual variances — a real, provable fact this lesson derives directly, distinct from expected value's own linearity, which needs no independence at all.
- **Concentration** — the phenomenon of a random quantity's own probability mass clustering tightly around its expected value, with the width of that clustering shrinking as more independent pieces get averaged together. The informal name for what a sample mean does as `n` grows; this lesson's whole point is making that informal observation exact.
- **The law of large numbers** — the classical name for the general phenomenon that a sample mean converges toward the true expected value as the number of observations grows. This lesson doesn't merely restate it — it derives and verifies a specific, quantitative version of *why* it's true.
- **Chebyshev's inequality** — a real, general bound: for any random variable with a defined variance, the probability of straying at least `k` away from its own mean is at most `Var(X) / k²` — true for *any* distribution shape, using nothing but the variance.
- **Tail probability** — the probability of a random variable landing far from its mean, specifically beyond some threshold; "tail" because, plotted as a distribution, these are the thin, far-out edges rather than the tall middle.

**Objects and methods used**

*This lesson's own subject, in the order its Concept Units introduce them:*

- **`sample-mean`**
  - *What it is:* a procedure this lesson derives in Concept Unit 1 — flips a fair coin `n` times, encoded as `0`/`1`, and returns the average of all `n` flips.
  - *Implementation:* `(sample-mean n)` → an exact rational between `0` and `1`, inclusive.
  - *Its use:* the single real random quantity this entire lesson studies the concentration of.
- **`variance`**
  - *What it is:* derived in Concept Unit 1 — computes a discrete random variable's exact variance directly from its own outcomes and their probabilities.
  - *Implementation:* `(variance outcomes probabilities)` → an exact rational, `Σ p(x)·(x − mean)²`.
  - *Its use:* verifies, exactly, that variance adds across independent sums — the load-bearing fact this whole lesson's derivation depends on.
- **`chebyshev-bound`**
  - *What it is:* derived in Concept Unit 2 — computes the real upper bound Chebyshev's inequality guarantees.
  - *Implementation:* `(chebyshev-bound variance-of-x k)` → an exact or inexact number, `Var(X) / k²`.
  - *Its use:* a completely general tool, usable on *any* random variable's own variance — this lesson applies it first to a tiny two-outcome case, then to a real sample mean.
- **`fraction-exceeding`**
  - *What it is:* derived in Concept Unit 3 — measures, across many real independent trials, how often a sample mean actually strays at least `epsilon` from the true mean.
  - *Implementation:* `(fraction-exceeding n epsilon trials)` → an exact rational between `0` and `1`, the real measured tail frequency.
  - *Its use:* the empirical side of this lesson's central claim, checked against `chebyshev-bound`'s own exact prediction.

*Everything else in the file, not this lesson's subject but still explained:*

- **`random`**
  - *What it is:* Guile's built-in source of pseudo-randomness, first given full treatment in Lesson 162.
  - *Implementation:* `(random n)`, for exact integer `n`, returns an exact integer uniformly chosen from `0` up to (not including) `n`.
  - *Its use:* every coin flip in this lesson bottoms out in `(random 2)`.
- **`apply`**
  - *What it is:* a procedure that calls another procedure, but with its arguments taken from a list instead of written out individually.
  - *Implementation:* `(apply proc list)` calls `proc` with `list`'s own elements as its separate arguments — `(apply + (list 1 2 3))` is exactly `(+ 1 2 3)`.
  - *Its use:* sums a whole list of weighted outcomes, or a whole list of squared deviations, without needing to know in advance how many there are.
- **`map`**
  - *What it is:* a transformation procedure — applies a given procedure to every element of one or more lists, returning a new list of the results.
  - *Implementation:* `(map proc list)` returns a new list, `(proc x)` for each `x` in `list`; `(map proc list1 list2)` applies a two-argument `proc` to corresponding elements of both lists at once.
  - *Its use:* multiplies each outcome by its own probability, and squares each deviation from the mean, across a whole distribution at once.
- **`length`**
  - *What it is:* a measuring procedure — counts how many elements a list has.
  - *Implementation:* `(length lst)` returns an exact integer.
  - *Its use:* divides an accumulated total by however many measurements were actually collected.
- **`cons`**
  - *What it is:* a constructor — builds one new pair from two values; repeated `cons`ing builds a list.
  - *Implementation:* `(cons a b)` returns a fresh pair whose `car` is `a` and whose `cdr` is `b`.
  - *Its use:* `collect-sample-means`, this lesson's own verification helper, builds up a list of real measured sample means one at a time.
- **`abs`**
  - *What it is:* a procedure — returns a number's absolute value.
  - *Implementation:* `(abs x)` returns `x` if `x ≥ 0`, and `-x` otherwise.
  - *Its use:* measures how far a sample mean strayed from the true mean, in either direction, without caring which direction.
- **`exact->inexact`**
  - *What it is:* a converter — turns an exact number into an ordinary inexact decimal, for reading.
  - *Implementation:* `(exact->inexact n)` returns the closest floating-point representation of `n`.
  - *Its use:* converts this lesson's exact variances, bounds, and measured frequencies into readable decimals, without ever computing with a rounded value.
- **`list`**
  - *What it is:* a constructor — builds a list directly from its arguments.
  - *Implementation:* `(list v0 v1 ... vn)` returns a fresh list holding exactly those values, in that order.
  - *Its use:* bundles several real results together for a single `display` call.
- **`display`**
  - *What it is:* an output procedure — writes a human-readable representation of a value to the terminal.
  - *Implementation:* `(display obj)` sends `obj`'s printed form to the current output port.
  - *Its use:* every real result in this lesson's Run It sections was produced with `display`.
- **`newline`**
  - *What it is:* an output procedure — writes a single line break.
  - *Implementation:* `(newline)` takes no required arguments.
  - *Its use:* keeps each displayed result on its own line.
- **`+`, `-`, `*`, `/`**
  - *What it is:* four of Scheme's arithmetic procedures — ordinary procedures, not special syntax.
  - *Implementation:* each takes any number of numeric arguments; `/` on two exact integers that don't divide evenly returns an exact rational.
  - *Its use:* `+` accumulates every running total in this lesson; `-` computes deviations from a mean; `*` computes squared deviations and probability-weighted contributions; `/` computes every mean, variance, and bound.
- **`>=`, `=`**
  - *What it is:* numeric comparison procedures, returning `#t` or `#f`.
  - *Implementation:* `(>= a b)` and `(= a b)` compare two numbers.
  - *Its use:* `>=` decides whether a measured deviation counts as "exceeding" a threshold; `=` recognizes every loop's base case.

---

## Concept Unit: The Variance of a Sample Mean

### The Problem

A single fair coin flip, encoded as `0` or `1`, is about as spread-out a random quantity as a two-outcome variable can be — it lands on one extreme or the other, never anywhere in between. The average of ten independent flips behaves completely differently: it can land on any multiple of `1/10` from `0` to `1`, and empirically — this curriculum has already leaned on this fact, silently, since Lesson 159 — that average tends to cluster much closer to `1/2` than any single flip ever could. Why? A single flip's own variance is fixed, an unchanging fact about a fair coin. What actually changes when many flips get averaged together, and can that change be computed exactly, in advance, without ever running a single trial?

### Project Change

- **Reference Source** — No reference counterpart. This lesson derives concentration from first principles.
- **Files affected** — this lesson's own file. As established in Lesson 162, this curriculum has no separate, persisted project source tree.
- **Change type** — add: three new top-level procedures.
- **Location** — nothing precedes them in this lesson yet; these are the first definitions this lesson makes.
- **Dependencies** — none beyond Guile's built-in procedures.

### The New Code

```scheme
(define (flip) (random 2))

(define (sample-mean n)
  (let loop ((i 0) (total 0))
    (if (= i n)
        (/ total n)
        (loop (+ i 1) (+ total (flip))))))

(define (variance outcomes probabilities)
  (let* ((mean (apply + (map * outcomes probabilities)))
         (sq-devs (map (lambda (x p) (* p (* (- x mean) (- x mean)))) outcomes probabilities)))
    (apply + sq-devs)))
```

### The Updated Project

Skipped — `flip`, `sample-mean`, and `variance` are brand-new, freestanding top-level procedures with no existing enclosing structure to place them inside yet; Project Change already covers this case.

### Isolated Lab: Variance Adds for Independent Sums

The core new idea here is that variance, unlike expected value, needs **independence** to add across a sum — Lesson 153's linearity of expectation held with *no* independence requirement at all, and this lesson's whole derivation depends on variance being different. Isolated, using `variance` itself on two tiny, hand-computed distributions: a single flip, and the sum of two independent flips.

A single flip takes value `0` or `1`, each with probability `1/2`. The sum of two independent flips takes value `0`, `1`, or `2` — `0` only if both flips are `0` (`1/4`), `2` only if both are `1` (`1/4`), and `1` if exactly one is (`1/2`, since either flip could be the one that landed heads):

```scheme
(variance '(0 1) '(1/2 1/2))
;=> 1/4

(variance '(0 1 2) '(1/4 1/2 1/4))
;=> 1/2
```

`Var(single flip) = 1/4` — matching Lesson 155's own Binomial variance shortcut, `p(1-p) = (1/2)(1/2) = 1/4`, since a single flip is a `Binomial(1, 1/2)`. `Var(sum of 2 flips) = 1/2`, which is exactly `2 × 1/4` — the variance of the sum is the *sum* of the two individual variances, not, say, the variance of a single flip scaled by anything more complicated. This is not a coincidence of this particular distribution: **for independent random variables, variance adds directly across a sum**, a real, provable fact distinct from (and needing more than) expected value's own linearity.

### Discarding the Lab

This two-flip, hand-computed comparison is discarded now — it served only to confirm, exactly, that variance really does add for an independent sum. Nothing about the lab's own two tiny distributions appears again; the real derivation below generalizes straight from this one verified fact.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (flip) (random 2))`** — `define` binds `flip` to a zero-parameter procedure; `(random 2)` draws a uniform `0` or `1`, standing in for one fair coin toss.
- **`(define (sample-mean n) ...)`** — `define` binds `sample-mean` to a one-parameter procedure.
- **`(let loop ((i 0) (total 0)) ...)`** — a named `let`: `i` counts completed flips, `total` accumulates their sum.
- **`(if (= i n) (/ total n) (loop (+ i 1) (+ total (flip))))`** — the base case divides the accumulated `total` by `n`, the exact average; otherwise, `(flip)` produces one real fresh coin toss, `+` folds it into `total`, and the loop advances.
- **`(define (variance outcomes probabilities) ...)`** — `define` binds `variance` to a two-parameter procedure: a list of possible outcomes, and a matching list of their own probabilities.
- **`(let* ((mean (apply + (map * outcomes probabilities))) (sq-devs (map (lambda (x p) (* p (* (- x mean) (- x mean)))) outcomes probabilities))) ...)`** — `let*`, needed because `sq-devs`'s own binding depends on `mean`, computed one line earlier in the same block. `(map * outcomes probabilities)` multiplies each outcome by its own probability, pairwise; `(apply + ...)` sums those products, computing the distribution's own mean — expected value, exactly as Lesson 153 defined it. `(lambda (x p) (* p (* (- x mean) (- x mean))))` is a small anonymous procedure: for one outcome `x` with probability `p`, `(- x mean)` is that outcome's own deviation from the mean, squared by multiplying it against itself, and weighted by `p`. `(map (lambda ...) outcomes probabilities)` applies that whole computation across every outcome and its matching probability at once, producing `sq-devs`, a list of probability-weighted squared deviations.
- **`(apply + sq-devs)`** — sums every weighted squared deviation, computing the variance itself: `Σ p(x)·(x − mean)²`, exactly Lesson 154's own definition.

### CS Lens

This is **variance adding across a sum of independent random variables** — a real, provable fact, distinct from expected value's own linearity, which needs no independence at all.

Also recognized in: measurement uncertainty in physics and engineering, where combining several independent noisy readings has a combined uncertainty that grows with the *sum* of the individual variances, not their sum of standard deviations directly; portfolio risk in finance, where the variance of a sum of genuinely uncorrelated investments' returns is the sum of their individual variances (and *not* the sum when they're correlated, which is exactly why this fact needs independence); and signal processing, where independent noise sources added together have a combined noise power equal to the sum of their individual powers.

### SE Lens

The design principle here is **verifying a general claim on the smallest case where it's still nontrivial**, before trusting it at scale. `variance`, applied to just two flips, is the smallest case where "does variance really add" is even a meaningful question — a single flip has nothing to add to.

An alternative that was *not* chosen: skip the two-flip verification entirely and jump straight to asserting `Var(X̄_n) = Var(X)/n` for general `n`, trusting the formula from a textbook or a memorized rule. The real cost of that shortcut: nothing in this lesson would then actually demonstrate *why* division by `n` (rather than, say, `n²`, or `√n`) is the correct scaling — the two-flip case, checked exactly, is what grounds the general claim in something this lesson's own code actually computed and confirmed, rather than something merely asserted from outside.

### Run It

```scheme
(flip)
;=> 1

(flip)
;=> 1

(flip)
;=> 0

(flip)
;=> 1

(flip)
;=> 1
```

Five real, independent flips — a real mix of `0`s and `1`s, though this particular run happened to draw four `1`s and only one `0`.

```scheme
(sample-mean 10)
;=> 3/5

(sample-mean 10)
;=> 1/2
```

Two independent ten-flip sample means, `3/5` and `1/2` — different real values from the same procedure, exactly the randomness this lesson's whole analysis exists to quantify.

**The real claim to check: `Var(X̄_n) = Var(X) / n`, applied at `n = 10` and `n = 100`.** Collecting `5,000` independent sample means at each `n`, and measuring their own empirical variance — the spread of the *averages themselves*, not of individual flips:

```scheme
(define (mean-of-list lst) (/ (apply + lst) (length lst)))
(define (variance-of-list lst)
  (let ((m (mean-of-list lst)))
    (/ (apply + (map (lambda (x) (* (- x m) (- x m))) lst)) (length lst))))
(define (collect-sample-means n trials)
  (let loop ((t 0) (acc '()))
    (if (= t trials)
        acc
        (loop (+ t 1) (cons (sample-mean n) acc)))))

(exact->inexact (variance-of-list (collect-sample-means 10 5000)))
;=> 0.0256102364

(exact->inexact (/ 1/4 10))
;=> 0.025

(exact->inexact (variance-of-list (collect-sample-means 100 5000)))
;=> 0.002514833436

(exact->inexact (/ 1/4 100))
;=> 0.0025
```

At `n = 10`, real measured variance `0.0256`, predicted `0.025`. At `n = 100`, real measured variance `0.00251`, predicted `0.0025` — a full order of magnitude smaller, exactly tracking the `10×` increase in `n`, exactly as `Var(X)/n` predicts. This confirms the general formula this Concept Unit's own two-flip Isolated Lab pointed toward: for `n` independent flips, each with variance `1/4`, `Var(sum) = n · (1/4)`, and `sample-mean`'s own division by `n` scales that further by `1/n²` (since `Var(cX) = c²·Var(X)` for a constant `c`), giving `Var(X̄_n) = n · (1/4) / n² = (1/4)/n = Var(X)/n`.

### Connection

Variance shrinks, measurably, as `n` grows — but "shrinks" alone doesn't yet say how confident to be that any *one* real sample mean actually landed close to the truth. The next problem is turning a variance, on its own, into an actual probability bound.

---

## Concept Unit: Chebyshev's Inequality

### The Problem

`Var(X̄_n)` shrinking as `n` grows is real, measured evidence that sample means cluster more tightly — but variance alone is a single number, not a probability. What's needed is a way to turn "the variance is this small" into an actual, honest statement like "the chance of straying this far from the mean is at most this much" — and, remarkably, a way to do that using *only* the variance, without needing to know the sample mean's own full distribution shape at all.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — add: one new, freestanding top-level procedure.
- **Location** — after `variance`; usable on any random variable's own variance, not just this lesson's coin flips.
- **Dependencies** — none beyond Guile's built-in arithmetic.

### The New Code

```scheme
(define (chebyshev-bound variance-of-x k)
  (/ variance-of-x (* k k)))
```

### The Updated Project

Skipped — a brand-new, freestanding top-level procedure with no existing enclosing structure to place it inside.

### Isolated Lab: Dropping Terms Only Shrinks a Sum

The core new idea behind Chebyshev's inequality isn't any new Scheme construct — it's a single, simple fact about sums of non-negative numbers, worth seeing in complete isolation before trusting it inside a real probabilistic argument: dropping some terms from a sum of non-negative numbers can only make the sum smaller, or leave it unchanged, never larger.

```scheme
(define full-terms (list 3 0 5 1 4))

(apply + full-terms)
;=> 13

(apply + (list 3 5 4))
;=> 12
```

`13`, the sum of every term, and `12`, the sum of only the terms that are `3` or larger — smaller, because two genuinely positive terms (`0` and `1`) got left out. This is the entire mechanical move behind Chebyshev's inequality: variance, `Var(X) = Σ p(x)·(x − mean)²`, is itself a sum of non-negative terms — every single term is a probability (never negative) times a squared deviation (never negative). Keeping only the terms where `|x − mean|` is large, and dropping the rest, can only produce something *smaller than or equal to* the full variance — never larger.

### Discarding the Lab

`full-terms` and its two sums are discarded now. It never appears in the project again — the real derivation below performs this exact same "keep only the big terms" move directly on `variance`'s own defining sum.

### The Derivation

Start from variance's own full definition: `Var(X) = Σ p(x)·(x − mean)²`, summed over every possible outcome `x`. Now keep only the outcomes where `|x − mean| ≥ k`, for some threshold `k`, and drop the rest — by the Isolated Lab's own fact, this can only make the sum smaller or equal, never larger:

`Var(X) ≥ Σ_{x: |x−mean|≥k} p(x)·(x − mean)²`

For every one of the *remaining* outcomes — the ones that weren't dropped — `(x − mean)²` is, by definition of which ones were kept, at least `k²`. Replacing each kept term's own `(x − mean)²` with the smaller number `k²` can only shrink the sum further, or leave it equal:

`Σ_{x: |x−mean|≥k} p(x)·(x − mean)² ≥ Σ_{x: |x−mean|≥k} p(x)·k² = k² · P(|X − mean| ≥ k)`

Chaining both steps: `Var(X) ≥ k² · P(|X − mean| ≥ k)`, which rearranges directly into **Chebyshev's inequality**: `P(|X − mean| ≥ k) ≤ Var(X) / k²` — exactly what `chebyshev-bound` computes.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (chebyshev-bound variance-of-x k) (/ variance-of-x (* k k)))`** — `define` binds `chebyshev-bound` to a two-parameter procedure. `(* k k)` computes `k²`; `/` divides the given variance by it, computing exactly the bound the derivation above proves: `Var(X) / k²`. Nothing about this procedure is specific to coin flips, or to any particular distribution — it's as general as the derivation itself, which never assumed anything about `X` beyond having a defined variance.

### CS Lens

This is **Chebyshev's inequality**: a real, general bound on how far any random variable can stray from its own mean, using nothing but its variance — no assumption about the distribution's shape at all.

Also recognized in: quality control, bounding the probability a manufactured part's measurement falls far outside spec using only a known process variance, with no need to assume the measurements follow any particular curve; network engineering, bounding how badly a packet's actual latency might deviate from average latency using only a measured variance; and Markov's inequality, an even more general (and even looser) bound this lesson's own derivation is secretly a special case of — Chebyshev's inequality is exactly Markov's inequality applied to the non-negative random variable `(X − mean)²` instead of to `X` directly.

### SE Lens

The design principle here is **a bound that costs almost nothing to compute, in exchange for real generality**. `chebyshev-bound` needs only one number, a variance — no distribution shape, no assumption of normality or symmetry, nothing beyond what `variance` already computes.

An alternative that was *not* chosen: derive a tighter, distribution-specific bound — for a fair coin's sample mean specifically, an exact binomial-probability calculation would give the *true* tail probability, not just an upper bound on it. That alternative is strictly more informative when it's available, but it needs to know the exact distribution, term by term, and has to be re-derived from scratch for every different kind of random variable. The real cost `chebyshev-bound` accepts in exchange for never needing that: its own bound can be, and often is, quite loose — a real, honest number that's still true, but far from the tightest true statement that could be made, as this lesson's own next Run It section will show directly.

### Run It

A tiny, exact check, using the two-flip distribution this Concept Unit's Isolated Lab already established has variance `1/2`, at threshold `k = 1`:

```scheme
(chebyshev-bound 1/2 1)
;=> 1/2
```

And the *true* exact tail probability, computed directly from the sum-of-2-flips distribution — `P(|X − 1| ≥ 1)` means landing on `0` or `2`, each with probability `1/4`:

```scheme
(+ 1/4 1/4)
;=> 1/2
```

`1/2` and `1/2` — Chebyshev's bound is *exactly* tight here, not merely an overestimate. This won't always happen (the next Concept Unit will show a case where the bound is far looser), but it's real, exact proof the inequality is not just "true in a vacuous, useless way" — sometimes, it's the best possible statement.

### Connection

A general, distribution-free bound now exists, verified exactly on a tiny case. The next problem is applying it to the actual question this lesson opened with: how confident can a real sample mean, built from many flips, actually be?

---

## Concept Unit: Concentration of the Sample Mean

### The Problem

Concept Unit 1 established `Var(X̄_n) = Var(X)/n`. Concept Unit 2 established a general way to turn any variance into a probability bound. Combining them directly: `P(|X̄_n − mean| ≥ ε) ≤ Var(X̄_n)/ε² = Var(X)/(n·ε²)` — a bound that shrinks as `n` grows, for any fixed threshold `ε`. Does a real, measured sample mean actually respect that shrinking bound?

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — add: one new, freestanding top-level procedure.
- **Location** — after `sample-mean`; calls it directly, many times.
- **Dependencies** — `sample-mean`, defined in Concept Unit 1, and `chebyshev-bound`, defined in Concept Unit 2.

### The New Code

```scheme
(define (fraction-exceeding n epsilon trials)
  (let loop ((t 0) (bad 0))
    (if (= t trials)
        (/ bad trials)
        (let ((m (sample-mean n)))
          (loop (+ t 1)
                (if (>= (abs (- (exact->inexact m) 1/2)) epsilon) (+ bad 1) bad))))))
```

### The Updated Project

Skipped — a brand-new, freestanding top-level procedure with no existing enclosing structure to place it inside.

### Isolated Lab: None — Justified Skip

`fraction-exceeding` combines a count-terminated named-let loop, an accumulator, `sample-mean`, `abs`, and comparison operators — every one of them already fully treated, either earlier in this lesson or in Lessons 162 through 165. Nothing here is a new construct; it's a new *combination* of already-established pieces, applying this Concept Unit's own real question (how often does a sample mean stray this far) rather than teaching a new mechanical idea. Per the Concept Isolation Rule, no lab is warranted.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (fraction-exceeding n epsilon trials) ...)`** — `define` binds `fraction-exceeding` to a three-parameter procedure.
- **`(let loop ((t 0) (bad 0)) ...)`** — a named `let`: `t` counts completed trials, `bad` counts how many of them strayed too far.
- **`(if (= t trials) (/ bad trials) ...)`** — the base case divides the count of bad trials by the total, computing the real measured fraction.
- **`(let ((m (sample-mean n))) ...)`** — a plain `let`, one binding: `m`, one fresh, real sample mean of `n` flips.
- **`(if (>= (abs (- (exact->inexact m) 1/2)) epsilon) (+ bad 1) bad)`** — `(exact->inexact m)` converts `m` to a decimal so it can be compared directly against `epsilon`, itself written as a decimal; `(- ... 1/2)` computes the signed deviation from the true mean, `1/2`; `abs` discards the sign, since straying too far in either direction counts equally; `>=` checks whether that distance reaches or exceeds `epsilon`. If so, `bad` advances; otherwise, it doesn't.
- **`(loop (+ t 1) ...)`** — the recursive step, advancing the trial count regardless of whether this trial counted as "bad."

### CS Lens

This is **concentration**, made quantitative: `chebyshev-bound`, applied to a shrinking `Var(X̄_n)`, predicts the probability of a large deviation shrinks as `n` grows — and this is the specific mechanism underneath the informally-named **law of large numbers**, the classical guarantee that sample means converge toward the true mean.

Also recognized in: polling and survey statistics, where a larger sample size shrinks the margin of error around a measured proportion by exactly this kind of `1/n`-driven mechanism; every Monte Carlo check this curriculum has run since Lesson 159, all of which relied on exactly this concentration to justify treating a large-trial average as trustworthy; A/B testing, where a large enough sample size is required before a measured difference between two variants can be trusted as more than noise; and physical thermodynamics, where the incredibly precise, predictable behavior of a gas's average pressure emerges from the concentration of an average over an astronomical number of individually chaotic particle collisions.

### SE Lens

The design principle here is **an honest bound is still useful even when it's loose**. Chebyshev's bound, checked below, will turn out to dramatically overestimate the true chance of a large deviation at `n = 1000` — and that's not a flaw in the bound, it's the nature of a guarantee that has to hold for *every* possible distribution with the given variance, not just this lesson's specific fair coin.

An alternative that was *not* chosen: only trust a concentration claim once it's been checked empirically, treating Chebyshev's bound as unnecessary once real trial data is available anyway. The real value this lesson's exact bound provides that no amount of empirical measurement alone ever could: `chebyshev-bound` gives a guarantee *before* running a single trial, true regardless of how the coin (or any other bounded-variance process) actually behaves — the empirical measurements below confirm the bound holds, they don't substitute for having had it in the first place. The cost of leaning on the exact bound instead of only measuring: as the SE Lens in Concept Unit 2 already named, the guarantee can be, and often is, far looser than the truth — real, useful protection against the worst case, not a precise prediction of the typical case.

### Run It

Threshold `epsilon = 0.1` — "the sample mean is off from the true mean, `1/2`, by at least a tenth" — checked at three real sample sizes, `20,000` independent trials each:

```scheme
(exact->inexact (fraction-exceeding 10 0.1 20000))
;=> 0.35025

(exact->inexact (chebyshev-bound (/ 1/4 10) 0.1))
;=> 2.4999999999999996
```

At `n = 10`, the real measured fraction exceeding, `0.35`, sits comfortably under the "bound," `2.5` — but a probability bound over `1` carries no real information at all; every probability is already at most `1`. This is Chebyshev's inequality at its loosest and least useful: technically true, but not a meaningful guarantee at this small an `n`.

```scheme
(exact->inexact (fraction-exceeding 100 0.1 20000))
;=> 0.0363

(exact->inexact (chebyshev-bound (/ 1/4 100) 0.1))
;=> 0.24999999999999994
```

At `n = 100`, the bound, `0.25`, is now meaningfully below `1` — a real, non-trivial guarantee that the sample mean strays by `0.1` or more no more than a quarter of the time. The real measured rate, `0.0363`, is well under that — the bound holds, comfortably, though it overestimates the true rate by close to a factor of `7`.

```scheme
(exact->inexact (fraction-exceeding 1000 0.1 20000))
;=> 0.0

(exact->inexact (chebyshev-bound (/ 1/4 1000) 0.1))
;=> 0.024999999999999994
```

At `n = 1000`, the bound has shrunk further, to `0.025`. The real measurement: `0` — not one of `20,000` real independent trials strayed by `0.1` or more. The bound still holds (`0 ≤ 0.025`, trivially), but the true rate is so small that `20,000` trials weren't even enough to observe a single violation — real, direct evidence of just how loose Chebyshev's bound can be at large `n`, and just how strongly a large sample mean actually concentrates around the truth.

### Connection

A real bound, derived from nothing but variance, has now been checked at three real scales — vacuous at `n = 10`, meaningfully protective at `n = 100`, and dramatically conservative at `n = 1000`. What's left is tracing one value through everything this lesson built, and being honest about what a bound like this cannot promise on its own.

---

## Closing

### Connect the Pieces

One coin, moving through every piece built in this lesson, start to finish:

```scheme
(variance '(0 1) '(1/2 1/2))
;=> 1/4
```

The single flip's own exact variance — the one real number every other piece of this lesson is built from.

```scheme
(/ 1/4 100)
;=> 1/400
```

The exact predicted variance of a `100`-flip sample mean — `Var(X)/n`, derived and verified in Concept Unit 1.

```scheme
(chebyshev-bound 1/400 0.1)
;=> 0.24999999999999994
```

The exact probability bound that follows from that variance alone — Chebyshev's inequality, derived in Concept Unit 2, applied here to the sample mean's own shrunken variance instead of a single flip's larger one.

```scheme
(exact->inexact (fraction-exceeding 100 0.1 20000))
;=> 0.0341
```

And the real, measured rate at which a genuine `100`-flip sample mean actually strays that far — a fresh `20,000` trials, run again here, giving a real number close to but not identical to Concept Unit 3's own `0.0363` (real, independent randomness genuinely varies run to run) — comfortably under the bound either way, confirming, empirically, a guarantee that was true before a single one of these trials ever ran.

### What Breaks Without This

Chebyshev's inequality, as derived, needs `Var(X)` to be a real, finite number — every step of the derivation divided by `k²`, but never once needed to divide by, or otherwise assume anything about, the variance itself except that it exists. Breaking a *different* assumption on purpose instead: what if the bound is asked about a threshold `k` of `0`?

```scheme
(chebyshev-bound 1/4 0)
```

Run for real:

```
;; real output:
;; Throw to key `numerical-overflow' with args `("divide" "Numerical overflow" #f #f)'.
```

A real, immediate error — `(* 0 0)` is `0`, and Guile's exact arithmetic refuses to divide `1/4` by an exact `0` at all, raising a `numerical-overflow` condition rather than silently producing an infinite or undefined result. This isn't a bug to patch so much as a sign the question itself doesn't make sense: `P(|X − mean| ≥ 0)` is asking for the probability that `X` differs from its own mean by *at least nothing at all* — true with probability `1` for literally any random variable, since every outcome satisfies `|x - mean| ≥ 0` trivially. Chebyshev's inequality, correctly, refuses to manufacture a meaningless "bound" for a question that already has an obvious answer without any inequality at all — every real use of `chebyshev-bound` in this lesson picked a genuinely positive `k`, the only range where the bound says anything not already known for free.

### Exercises

- This lesson used a fair coin, `p = 1/2`, with `Var(single flip) = 1/4`. Redo the whole chain — single-flip variance, `Var(X̄_n)`, and a real Chebyshev bound — for a biased coin, `p = 0.9`, using Lesson 155's own `p(1-p)` formula. Which direction does the bound move, and does that match the real, measured behavior of a biased coin's own sample mean?
- Concept Unit 3 measured `fraction-exceeding` at `epsilon = 0.1`. Rerun it at `epsilon = 0.05` (a tighter threshold) for the same three `n` values, and predict, before measuring, whether the real fractions and the Chebyshev bounds should both grow or shrink compared to this lesson's own results.
- Chebyshev's inequality doesn't need a coin flip at all — it works for any random variable with a finite variance. Pick a different random variable already built somewhere in this curriculum (a single die roll, say, values `1` through `6`), compute its real variance with the `variance` procedure from this lesson, and compute a real Chebyshev bound for it.
- This lesson's SE Lens in Concept Unit 3 noted Chebyshev's bound overestimated the true `n = 1000` tail probability by a huge margin. Look up (or, if you're feeling ambitious, attempt to derive) the Binomial distribution's own *exact* tail probability formula, and compare its real prediction at `n = 1000`, `epsilon = 0.1` against both this lesson's Chebyshev bound and its real Monte Carlo measurement.

### Definition of Done

- [ ] `flip`, `sample-mean`, `variance`, `chebyshev-bound`, and `fraction-exceeding` are all defined, all actually run in Guile this session, with real output pasted in for every claim.
- [ ] `Var(X̄_n) = Var(X)/n` has been checked at two different real values of `n`, not just asserted.
- [ ] Chebyshev's inequality has been checked both exactly (the tight two-flip case) and empirically (the `n = 10`, `100`, `1000` sample-mean cases), and the real measured rate has been confirmed to never exceed the predicted bound, at any of them.
- [ ] The `k = 0` failure has been caused on purpose, its real error read, and the reason it's not a bug — the question itself being meaningless — has been articulated, not just observed.
- [ ] `git commit` — a message explaining *why* a loose bound (dramatically overestimating the true tail probability at large `n`) is still worth having: it's a guarantee that holds before any data exists, for any distribution with the given variance, not a substitute for measurement but a foundation underneath it.
