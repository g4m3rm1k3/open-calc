# Lesson 67: Logarithms

**What you will build:** `halving-count`, a real procedure counting how many times a number can be divided by `2` before reaching `1` — verified to match `⌊log₂(n)⌋` exactly, computed independently via Guile's own `log` procedure, at seven tested values including three exact powers of two. Real, verified evidence connecting this directly back to Lesson 66: `fast-expt(2, n)`'s real call count and `halving-count(n)` grow together — `19` versus `27` at `n = 1,000,000`, `9` versus `20` at `n = 1,023` — both far closer to each other than either is to `n` itself, confirming both are measuring the same underlying quantity. The transferable point: Lesson 66 measured a real, dramatic speedup without yet having a name for *why* `fast-expt` needed so few steps. This lesson supplies that name — the logarithm — defined not as an abstract inverse function, but as literally "how many times can you halve this."

**What you need to know first:** Lesson 63 (`FP-L063-sequences-and-sums.md`) — specifically `expt`, whose inverse this lesson defines directly. Lesson 66 (`FP-L066-exponents.md`) — specifically `fast-expt`'s real, measured call counts, checked directly against this lesson's `halving-count`.

**Terms introduced in this lesson**

- **Logarithm** — the inverse of exponentiation: `logᵦ(x)` is the number `y` such that `bʸ = x`. `log₂(8) = 3`, because `2³ = 8`. Just as subtraction undoes addition and division undoes multiplication, the logarithm undoes exponentiation.
- **Base** (of a logarithm) — the number being repeatedly multiplied, matching Lesson 65's *common ratio*. `log₂` asks "how many times must `2` be multiplied by itself"; `log₁₀` asks the identical question about `10`.

## Objects and methods used

- **`log`**
  - *What it is:* a real Scheme procedure computing the natural logarithm (base `e`) of a number.
  - *Implementation:* takes one number, returning its natural logarithm; confirmed this session as `(log 1000000)`, and combined via the change-of-base identity `logᵦ(x) = log(x) / log(b)` to compute a logarithm in any base, confirmed as `(/ (log 1000000) (log 2))`.
  - *Its use:* Concept Unit 3's independent check of `halving-count` against a genuine, continuous logarithm.

---

## Concept Unit 1: Repeated Halving, Counted

### The Problem

Lesson 66's `fast-expt` halved its exponent at every opportunity, and its real call count — `27` for `n = 1,000,000`, dramatically fewer than `naive-expt`'s `1,000,001` — was never fully explained, only observed. It's worth isolating exactly what "how many times can this be halved" means, as its own question, before connecting it back.

### The New Code — Type It Yourself

```scheme
(define (halving-count n)
  (let loop ((n n) (count 0))
    (if (<= n 1)
        count
        (loop (quotient n 2) (+ count 1)))))
```

### The Updated Project

This is `halving-count.scm`, in full:

```scheme
(define (halving-count n)
  (let loop ((n n) (count 0))
    (if (<= n 1)
        count
        (loop (quotient n 2) (+ count 1)))))

(display (halving-count 1024))
(newline)
```

### Reference Source

A direct question, asked literally: starting from `n`, how many times can `quotient n 2` (Lesson 62) be applied before reaching `1` or below? `halving-count` answers it by actually performing the halving, once per step, counting as it goes.

### Files affected

Created: `halving-count.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile halving-count.scm
10
```

Verified this session — `1024` can be halved exactly `10` times before reaching `1`: `1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1` — ten halvings, ten steps.

### Mechanical Walkthrough

- **`(let loop ((n n) (count 0)) ...)`** — Lesson 39's named-`let` loop, tracking both the shrinking value and how many times it's shrunk so far.
- **`(if (<= n 1) count ...)`** — stopping once `n` has been halved down to `1` or below, returning the accumulated count.
- **`(loop (quotient n 2) (+ count 1))`** — one halving step: `n` becomes `n` divided by `2` (integer division, Lesson 62's `quotient`), and the count increases by one.

### CS Lens

This is "how many times can this be halved" asked and answered as literally and mechanically as possible, deliberately before connecting it to any formal mathematical name — exactly this curriculum's standing pattern (Lesson 60's Pascal's rule, named only after being built) of building the concrete mechanism first, naming it second. Also recognized in: counting how many times a stack of paper can be folded in half before it's too thick to fold again; counting how many rounds a single-elimination tournament bracket needs to reduce a field of competitors down to one winner.

### SE Lens

The alternative to building `halving-count` as its own isolated question is to jump directly to defining the logarithm abstractly, as "the inverse of exponentiation," without first grounding it in a concrete, countable action. The real cost of that alternative, for a learner meeting logarithms for the first time, is exactly the kind of ungrounded vocabulary this curriculum has avoided since Lesson 1 — a term technically defined but not connected to anything built or felt directly. Building the concrete counting procedure first, as this unit does, is what makes Concept Unit 2's formal definition land as a *name for something already understood*, not new content to memorize.

---

## Concept Unit 2: Defining the Logarithm as the Inverse of Exponentiation

### The Problem

`halving-count` answers a very specific question — how many times can `n` be halved. The logarithm is the general mathematical name for a whole family of closely related questions, worth stating precisely now that one specific case is already built and understood.

### No isolated lab for this step

This concept has no code of its own to isolate — the definition is stated directly below, using Lesson 66's `expt` as its anchor.

### Applying It — Reversing the Exponent Question

**Lesson 66's question, restated:** given a base `a` and an exponent `n`, what is `aⁿ`? `expt` (and `fast-expt`) answer this directly.

**This lesson's question — the exact reverse:** given a base `b` and a result `x`, what exponent `y` satisfies `bʸ = x`? This is `logᵦ(x)`.

**Connecting directly to `halving-count`:** `halving-count(n)` is, precisely, an approximation of `log₂(n)` — "how many times can `n` be halved" and "what power of `2` is close to `n`" are the identical question, viewed from opposite directions. `2¹⁰ = 1024`, and `halving-count(1024) = 10` — the exponent that produces `1024` from `2` is exactly the number of times `1024` can be halved back down to `1`.

### Walkthrough

- **"the exact reverse"** — the precise, minimal definition of a logarithm: exponentiation with the exponent unknown instead of the result unknown.
- **`2¹⁰ = 1024` and `halving-count(1024) = 10`** — direct, numerical confirmation that the concrete procedure from Concept Unit 1 and the abstract definition being introduced here are describing the identical relationship.

### CS Lens

This is the general pattern of defining a new operation as the *inverse* of one already understood — subtraction as addition's inverse, division as multiplication's inverse, and now the logarithm as exponentiation's inverse — each new inverse operation answering "what input produced this output," rather than "what output does this input produce." Also recognized in: a detective working backward from a crime scene's evidence to determine what sequence of events must have produced it, rather than predicting outcomes forward from known events; an auditor working backward from a company's final reported balance to determine what transactions must have produced it.

### SE Lens

The alternative to defining the logarithm precisely, as an inverse relationship, is to treat it as "the thing you compute with a log button on a calculator," without understanding what question it actually answers. The real cost of that alternative surfaces immediately in Concept Unit 3 and 4 — without understanding that a logarithm answers "what exponent," there's no way to predict, ahead of any computation, that `fast-expt`'s call count should relate to `log₂(n)` at all. Defining it precisely as exponentiation's inverse, as this unit does, is what makes that connection derivable rather than coincidental.

---

## Concept Unit 3: Checking halving-count Against a Real Logarithm

### The Problem

Concept Unit 2 claimed `halving-count(n)` approximates `log₂(n)`. This needs checking directly against an independently computed logarithm, not just asserted from the `1024`/`10` example alone.

### No isolated lab for this step

This concept has no code of its own to isolate — the real comparison is demonstrated directly below.

### Applying It — Seven Real Comparisons

**Computing `log₂(n)` independently, using the change-of-base identity with Guile's natural `log`:**

```scheme
(/ (log n) (log 2))
```

```
$ guile log.scm
n=2 halving-count=1 log2(n)=1.0
n=4 halving-count=2 log2(n)=2.0
n=8 halving-count=3 log2(n)=3.0
n=16 halving-count=4 log2(n)=4.0
n=1024 halving-count=10 log2(n)=10.0
n=1000000 halving-count=19 log2(n)=19.931568569324174
n=1000000000 halving-count=29 log2(n)=29.897352853986263
```

Verified this session — for every exact power of two tested (`2`, `4`, `8`, `16`, `1024`), `halving-count(n)` matches `log₂(n)` *exactly*, including the decimal `.0`. For values that aren't exact powers of two (`1,000,000` and `1,000,000,000`), `halving-count(n)` matches the *whole-number part* of `log₂(n)` — `19` against `19.93`, `29` against `29.90` — confirming `halving-count` computes `⌊log₂(n)⌋`, the logarithm rounded down, exactly what a counting procedure that only sees whole halvings should produce.

### Walkthrough

- **The exact match on every power of two** — the strongest possible confirmation: no rounding, no approximation, `halving-count` and the true logarithm agree precisely wherever the true logarithm happens to be a whole number.
- **The floor-matching on non-powers of two** — confirms the relationship holds generally, not only in the special, exact case, with the small, well-understood discrepancy (a fractional remainder `halving-count` can't see) explained rather than left as unexplained noise.

### CS Lens

This is the direct confirmation that a simple, mechanical counting procedure — repeatedly halving and counting — computes a real, well-defined mathematical function, `⌊log₂(n)⌋`, without ever invoking calculus, limits, or any of the machinery typically used to define logarithms formally. Also recognized in: a mechanical postage scale determining a package's weight class by counting how many standard reference weights balance it, without ever computing an exact, continuous weight; a wine taster estimating a vintage's age by counting rings in a cross-section, arriving at a close, whole-number approximation of a continuously-elapsed duration.

### SE Lens

The alternative to checking `halving-count` against Guile's own `log` is to trust the `1024`/`10` example generalizes without further evidence. The real cost of that alternative is exactly the risk this curriculum has warned against since Lesson 22 — one matching example is not proof of a general pattern. Checking seven varied values, including both exact powers of two and values that aren't, as this unit does, is what confirms `halving-count` genuinely computes `⌊log₂(n)⌋` in general, not merely in one convenient case.

---

## Concept Unit 4: Explaining fast-expt's Real Call Count

### The Problem

Lesson 66 measured `fast-expt`'s real call counts without a name for what they were tracking. With the logarithm now defined and `halving-count` verified, it's worth checking directly whether `fast-expt`'s call counts actually track `halving-count`, the way Lesson 66's informal "close to `log₂(n)`" observation suggested.

### No isolated lab for this step

This concept has no code of its own to isolate — the real comparison is demonstrated directly below, using `fast-expt` unchanged from Lesson 66.

### Applying It — fast-expt's Calls Against halving-count, Six Values

```
$ guile connect2.scm
n=8 fast-expt-calls=5 halving-count=3
n=16 fast-expt-calls=6 halving-count=4
n=100 fast-expt-calls=10 halving-count=6
n=1023 fast-expt-calls=20 halving-count=9
n=1024 fast-expt-calls=12 halving-count=10
n=1000000 fast-expt-calls=27 halving-count=19
```

Verified this session — across six real, varied values of `n`, `fast-expt`'s real call count and `halving-count(n)` grow together, staying within roughly a factor of two of each other at every value, and both growing *far* more slowly than `n` itself — at `n = 1,000,000`, `halving-count` is `19` and `fast-expt`'s calls are `27`, while `n` itself is six orders of magnitude larger than either.

**Naming why they aren't identical, honestly, rather than overclaiming an exact match:** `fast-expt` doesn't only halve — Lesson 66's derivation showed it also peels off one factor whenever the exponent is odd (`n = 1,023`, entirely odd steps until reaching a power of two minus one, shows the largest gap: `20` calls against `9` halvings). `halving-count` counts pure halvings only; `fast-expt`'s real call count includes those extra odd-case steps too. Both are genuinely logarithmic in `n` — neither is linear — but they're not measuring the identical thing precisely, and this lesson says so directly rather than forcing an exact match that isn't really there.

### Walkthrough

- **The real six-value comparison table** — direct, measured confirmation that `fast-expt`'s call count and `halving-count` move together, both far below `n`.
- **The honest explanation of `n = 1,023`'s larger gap** — confirms this lesson's discipline of explaining discrepancies rather than hiding or ignoring them, exactly the standard set by Lesson 63's `sigma`-versus-`sum` and Lesson 65's `r = 1` edge case.
- **"neither is linear"** — the central, load-bearing conclusion: regardless of the precise relationship between the two counts, both grow logarithmically, which is what actually explains Lesson 66's dramatic, real, measured speedup.

### CS Lens

This is the completed explanation Lesson 66 deferred: `fast-expt` is fast specifically because its number of steps grows logarithmically with `n`, not linearly — a `1,000,000`-fold increase in the exponent adds only a handful more steps, not a million more, precisely because the logarithm itself grows so slowly. Also recognized in: a hierarchical filing system organized so that finding any document takes a number of steps proportional to the logarithm of the total document count, not the count itself; a well-designed voting-tabulation bracket that determines a winner among millions of ballots in a number of rounds proportional to the logarithm of the ballot count.

### SE Lens

The alternative to precisely checking `fast-expt`'s real calls against `halving-count`, and honestly naming where they diverge, is to declare Lesson 66's informal "close to `log₂(n)`" observation confirmed without further scrutiny. The real cost of that alternative would be exactly the kind of unchecked, comfortable-sounding claim this curriculum has guarded against since Lesson 22 — and it would have missed the genuinely interesting, honest finding that `n = 1,023`'s all-odd exponent path produces a real, measurable gap between the two counts. Checking directly and reporting the discrepancy honestly, as this unit does, is what makes this lesson's conclusion trustworthy rather than merely convenient.

---

## Closing

### Connect the pieces

One question — how many times can this be halved — built, named, checked, and connected back:

1. **The concrete question, built (Unit 1):** `halving-count`, counting real halvings mechanically, no formal definition needed yet.
2. **The formal name, given (Unit 2):** the logarithm, defined precisely as exponentiation's inverse, connected directly to `halving-count` via `2¹⁰ = 1024` and `halving-count(1024) = 10`.
3. **The connection, checked (Unit 3):** `halving-count(n) = ⌊log₂(n)⌋`, confirmed exactly on five powers of two and approximately (with an honestly explained floor relationship) on two non-powers.
4. **Lesson 66's mystery, resolved (Unit 4):** `fast-expt`'s real call counts shown to track `halving-count` closely, both logarithmic in `n`, with an honestly reported, explained discrepancy at `n = 1,023` rather than a forced, overclaimed exact match.

Every real number in this lesson — the exact matches on five powers of two, the floor-matches on two non-powers, the six-value `fast-expt`-versus-`halving-count` comparison — was checked directly, and this lesson's central conclusion (`fast-expt` is fast because its steps grow logarithmically, not linearly) is now a *derived, checked* fact, not the informal observation Lesson 66 was honest enough to flag as unconfirmed.

### What breaks without this

Suppose an engineer, having seen Lesson 66's dramatic `fast-expt` speedup, needed to predict how much *further* an even larger exponent — say, one a thousand times larger than `1,000,000` — would cost, without a formal understanding of why the speedup occurred. Lacking the logarithm, that engineer might guess the cost grows proportionally with the speedup already observed, or might have no principled way to predict it at all. Understanding that `fast-expt`'s cost is genuinely logarithmic, as this lesson derived and checked directly, gives a precise, quantitative answer instead: increasing `n` by a factor of `1,000` adds only `log₂(1,000) ≈ 10` more halving steps — a small, predictable, bounded increase, not a mysterious or guessed-at one.

### Exercises

1. **Observe.** Compute `halving-count` by hand for `n = 64`, listing each halving step explicitly, and confirm it matches `log₂(64)` exactly (since `64` is a power of two).
2. **Formalize.** Run `halving-count` and the change-of-base `log` computation for three values of your own choosing, at least one an exact power of two and at least one not, and confirm the exact-match and floor-match patterns from Concept Unit 3 hold.
3. **Explain.** State, in your own words, why `halving-count(n)` and `log₂(n)` agree exactly precisely when `n` is a power of two, referencing what "a power of two" means in terms of repeated halving reaching exactly `1` with nothing left over.
4. **Formalize.** Run `fast-expt` (instrumented with a call counter, following Lesson 66's pattern) against `halving-count`, for three values of `n` of your own choosing, and report the real gap you observe between the two counts.
5. **Explain.** Using your Exercise 4 results, identify whether any of your chosen values produce a gap as large as `n = 1,023`'s did in Concept Unit 4, and if so, explain why, referencing the binary structure (how many `1`s appear when the number is written in binary) of your chosen `n`.

### Definition of done

- [ ] You can define the logarithm precisely as the inverse of exponentiation, stating what question `logᵦ(x)` answers.
- [ ] You can compute `halving-count` by hand for a small power of two and explain why it matches `log₂` exactly there.
- [ ] You can check `halving-count` against an independently computed logarithm, explaining the floor relationship for non-powers of two.
- [ ] You can explain, with real evidence, why `fast-expt`'s call count is logarithmic rather than linear in `n`.
- [ ] You completed Exercises 1–5 using values of `n` not used as this lesson's own examples.
- [ ] Commit `halving-count.scm` and your Exercise 2 and 4 findings, with a commit message stating the values you tested and whether any showed a discrepancy like `n = 1,023`'s.
