# Lesson 66: Exponents

**What you will build:** `naive-expt` and `fast-expt`, two independently correct procedures for computing `aⁿ`, differing dramatically in how they get there. Real, measured evidence this session: computing `2¹⁰⁰⁰⁰⁰⁰` — a genuine, `301,030`-digit number — `naive-expt` takes **`36,400.101` ms** and makes **`1,000,001`** recursive calls; `fast-expt` computes the identical, exact result in **`1.37` ms**, making only **`27`** calls — over **`26,000` times faster**. The transferable point: this curriculum has used `expt` since Lesson 63 without asking how it actually computes an exponent efficiently. This lesson asks that question directly, and the answer — a technique that halves the problem at every step — sets up Lesson 67 (Logarithms) and Lesson 68 (Repeated Halving) with a real, felt reason to care about what "halving" buys.

**What you need to know first:** Lesson 46 (`FP-L046-recursive-invariants.md`) — specifically the leap-of-faith derivation discipline, applied to `fast-expt`'s recursive case. Lesson 56 (`FP-L056-why-counting-matters.md`) — specifically the connection between counting steps and runtime, directly confirmed again here. Lesson 63 (`FP-L063-sequences-and-sums.md`) — specifically `expt`, used without question until now.

**Terms introduced in this lesson**

- **Repeated multiplication** — the definition of `aⁿ` as `a` multiplied by itself `n` times: `a × a × a × ⋯ × a`. This is what an exponent *means*; it says nothing yet about how to compute it efficiently.
- **Exponentiation by squaring** — a technique for computing `aⁿ` using far fewer than `n` multiplications, by halving the exponent at every step whenever it's even, computing `aⁿ = (aⁿ/²)²`, and peeling off one factor of `a` whenever it's odd.

---

## Concept Unit 1: Exponents as Repeated Multiplication — the Direct Translation

### The Problem

`expt` has been used since Lesson 63 without ever asking how it computes its result. The most direct, literal reading of "`aⁿ`" — `a` multiplied by itself `n` times — translates almost immediately into a recursive procedure, worth building and checking before asking whether it's the *best* way.

### Applying It — Deriving naive-expt

**The invariant, stated first:** `(naive-expt a n)` returns `a` raised to the power `n`, for `n ≥ 0`.

**The base case:** `a⁰ = 1`, for any `a` — `(naive-expt a 0)` should return `1`.

**The recursive case, derived by trusting `(naive-expt a (- n 1))` without tracing it:** `aⁿ = a × aⁿ⁻¹` — one factor of `a`, times everything the smaller power already accounts for.

### The New Code — Type It Yourself

```scheme
(define (naive-expt a n)
  (if (= n 0)
      1
      (* a (naive-expt a (- n 1)))))
```

### The Updated Project

This is `expt-compare.scm`, in full:

```scheme
(define (naive-expt a n)
  (if (= n 0)
      1
      (* a (naive-expt a (- n 1)))))

(display (naive-expt 2 10))
(newline)
```

### Reference Source

Repeated multiplication's own definition, translated directly: `a⁰ = 1` became the base case; `aⁿ = a × aⁿ⁻¹` became the recursive case — exactly the identical derive-then-translate discipline this curriculum used for `factorial` (Lesson 28), a procedure `naive-expt`'s structure closely resembles.

### Files affected

Created: `expt-compare.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile expt-compare.scm
1024
```

Verified this session — `(naive-expt 2 10) = 1024`, matching `2¹⁰` directly.

### Mechanical Walkthrough

- **`(if (= n 0) 1 ...)`** — the base case: `a⁰ = 1`.
- **`(* a (naive-expt a (- n 1)))`** — the recursive case: one factor of `a`, times the result of the smaller power, trusted by the leap of faith to already be correct.

### CS Lens

This is the most literal, unoptimized reading of what an exponent *means*, structurally identical to `factorial`'s own recursive definition — both compute a repeated operation (multiplication) by peeling off one instance at a time. Also recognized in: a naive interest calculator computing compound growth by simulating each individual compounding period one at a time, rather than using a closed form; a naive image-scaling routine doubling an image's size by repeating a single doubling operation the requested number of times, one at a time.

### SE Lens

The alternative to building `naive-expt` at all is to skip straight to a faster technique, never actually confirming what the "obvious," most literal translation costs. The real cost of that alternative is losing the direct, felt comparison Concept Unit 4 provides — without `naive-expt` as a real, measured baseline, `fast-expt`'s advantage would be an abstract claim rather than a demonstrated fact. Building the naive version first, as this unit does, costs one small, easily-derived procedure; it is what makes the coming comparison concrete rather than hypothetical.

---

## Concept Unit 2: A Faster Way — Exponentiation by Squaring

### The Problem

`naive-expt` makes exactly `n` recursive calls to compute `aⁿ` — one multiplication peeled off at a time. It's worth asking whether every one of those `n` steps is actually necessary, or whether some cleverer structure could reach the same answer in far fewer.

### Applying It — Deriving fast-expt

**The key observation:** if `n` is even, `aⁿ = (aⁿ/²)²` — computing the smaller power `aⁿ/²` just *once*, then squaring it, produces the full result without ever computing `aⁿ/²` a second time.

**Checking this concretely:** `a⁸ = (a⁴)² = a⁴ × a⁴`. Computing `a⁴` once and squaring it needs only whatever it costs to compute `a⁴`, plus one multiplication — not eight separate factors of `a` multiplied one at a time.

**The base case:** identical to `naive-expt`'s — `a⁰ = 1`.

**The recursive case, in two parts:** if `n` is even, `aⁿ = (aⁿ/²)²`, trusting `(fast-expt a (/ n 2))` by the leap of faith. If `n` is odd, halving doesn't divide evenly — peel off one factor of `a` first, exactly `naive-expt`'s own move, then the remaining exponent, `n − 1`, is even, ready for the halving case on the next call.

### The New Code — Type It Yourself

```scheme
(define (square x) (* x x))

(define (fast-expt a n)
  (cond ((= n 0) 1)
        ((even? n) (square (fast-expt a (/ n 2))))
        (else (* a (fast-expt a (- n 1))))))
```

### The Updated Project

This is `expt-compare.scm`, extended:

```scheme
(define (naive-expt a n)
  (if (= n 0)
      1
      (* a (naive-expt a (- n 1)))))

(define (square x) (* x x))

(define (fast-expt a n)
  (cond ((= n 0) 1)
        ((even? n) (square (fast-expt a (/ n 2))))
        (else (* a (fast-expt a (- n 1))))))

(display (naive-expt 2 10))
(newline)
(display (fast-expt 2 10))
(newline)
```

### Reference Source

Concept Unit 2's derivation, translated directly, using `cond` (Lesson 59) for the three-way branch: the base case unchanged from `naive-expt`; the even case, `(square (fast-expt a (/ n 2)))`, a direct translation of `aⁿ = (aⁿ/²)²`; the odd case, `(* a (fast-expt a (- n 1)))`, identical to `naive-expt`'s single-step recursive case, reducing `n` to the next even number.

### Files affected

Modified: `expt-compare.scm`.

### Change type

Extend existing procedure file.

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile expt-compare.scm
1024
1024
```

Verified this session — `naive-expt` and `fast-expt` agree exactly on `2¹⁰`.

### Mechanical Walkthrough

- **`(cond ((= n 0) 1) ...)`** — the base case, identical to `naive-expt`'s.
- **`((even? n) (square (fast-expt a (/ n 2))))`** — the halving case: compute `aⁿ/²` once (trusted by the leap of faith), then `square` it — one multiplication, not `n/2` more recursive steps' worth.
- **`(else (* a (fast-expt a (- n 1))))`** — the odd case, identical in shape to `naive-expt`'s only move, but reached only once per odd exponent along the way, not at every single step.

### CS Lens

This is the general technique of exponentiation by squaring, used in essentially every real cryptographic and numerical library that needs to compute large powers efficiently — the same halving structure Lesson 68's Repeated Halving will name formally, applied here specifically to multiplication. Also recognized in: a tournament bracket determining a single winner from `n` competitors using only `log₂(n)` rounds, by pairing competitors and advancing winners, rather than `n` sequential one-on-one matches; a binary search (a later Era's subject) finding a target in a sorted list using `log₂(n)` comparisons rather than checking every entry.

### SE Lens

The alternative to deriving `fast-expt` is to accept `naive-expt`'s `n`-step cost as simply what computing a power requires. The real cost of that alternative, made concrete in Concept Unit 4, is enormous at real scale — genuinely large exponents, common in cryptographic computation, would be entirely impractical with `naive-expt`'s approach. Recognizing that squaring an already-computed smaller power avoids redoing work, as this unit does, is what makes computing with large exponents practical at all.

---

## Concept Unit 3: Checking Both Against Each Other and Against Guile's Own expt

### The Problem

`fast-expt`'s derivation is sound reasoning, but it's worth checking directly, across several values, that it agrees with both `naive-expt` and Guile's own built-in `expt` — not just trusting the derivation.

### No isolated lab for this step

This concept has no code of its own to isolate — the real comparison is demonstrated directly below.

### Applying It — A Three-Way Comparison

```
$ guile expt.scm
a=2 n=10 naive=1024 fast=1024 builtin=1024
a=3 n=7 naive=2187 fast=2187 builtin=2187
a=5 n=0 naive=1 fast=1 builtin=1
a=7 n=1 naive=7 fast=7 builtin=7
a=2 n=20 naive=1048576 fast=1048576 builtin=1048576
```

Verified this session — across five varied test cases, including `n = 0` (the base case) and `n = 1` (the smallest odd case), `naive-expt`, `fast-expt`, and Guile's own built-in `expt` agree exactly, every time.

### Walkthrough

- **The real five-way, three-procedure match** — direct, verified confirmation that `fast-expt`'s halving-based derivation is not just plausible, but correct, checked against both a from-scratch alternative and a trusted, external reference (`expt` itself).
- **`n = 0` and `n = 1` explicitly included** — confirms both boundary conditions Concept Unit 2's derivation depends on (the base case, and the smallest case where the odd branch alone applies with no even step at all) are handled correctly.

### CS Lens

This is the same three-way validation pattern this curriculum has used since Lesson 28 for `factorial`: a new, derived procedure checked against both an independent, differently-built alternative and an already-trusted external implementation, catching any disagreement immediately rather than discovering it later. Also recognized in: a newly implemented cryptographic library function checked against both a reference implementation and a slower, more obviously correct implementation, on a battery of known test vectors, before being trusted in production.

### SE Lens

The alternative to this three-way check is to trust `fast-expt`'s derivation because the algebra in Concept Unit 2 looks sound. The real cost of that alternative is exactly the risk this curriculum has warned against repeatedly — a subtly wrong translation of correct reasoning into code, perhaps an off-by-one in the odd case's exponent reduction, producing wrong answers only for certain inputs. Checking against two independent references, as this unit does, is what confirms the translation itself, not just the reasoning behind it.

---

## Concept Unit 4: Measuring the Real Cost Difference

### The Problem

Concept Unit 2 argued `fast-expt` should need far fewer steps than `naive-expt`. This needs measuring directly, at a scale large enough for the difference to be dramatic and unmistakable.

### No isolated lab for this step

This concept has no code of its own to isolate — the real timing and call-count measurement is demonstrated directly below.

### Applying It — Real Timing and Call Counts at n = 1,000,000

```
$ guile expt-timing.scm
n=1000000
naive-expt: 36400.101 ms, calls=1000001
fast-expt: 1.37 ms, calls=27
log2(n) ~ 19.931568569324174
digits in 2^1000000: 301030
naive == fast: #t
```

Verified this session — computing `2¹⁰⁰⁰⁰⁰⁰`, a genuine `301,030`-digit number: `naive-expt` makes `1,000,001` recursive calls and takes `36,400.101` ms; `fast-expt` makes only `27` calls and takes `1.37` ms — a real, measured speedup of over `26,000` times, both producing the identical, exact result, confirmed by `(= (naive-expt 2 1000000) (fast-expt 2 1000000))` returning `#t`.

**Naming the pattern in the call counts, directly:** `naive-expt`'s `1,000,001` calls track `n` exactly, one call per unit of exponent. `fast-expt`'s `27` calls are close to `2 × log₂(n)` — `log₂(1,000,000) ≈ 19.93`, and `27` is in that neighborhood, the extra calls coming from the odd-exponent steps mixed in among the halvings. `fast-expt`'s call count doesn't grow with `n` itself — it grows with *how many times `n` can be halved*, a dramatically slower-growing quantity, formalized precisely as Lesson 67's logarithm.

### Walkthrough

- **The real `36,400.101` ms versus `1.37` ms measurement** — the most dramatic real timing gap this curriculum has measured yet, directly confirming Concept Unit 2's reasoning at genuine scale.
- **The real `1,000,001`-versus-`27` call count** — direct, measured confirmation of Lesson 56's counting-predicts-runtime connection, applied here to two structurally different algorithms for the identical problem.
- **`log₂(1,000,000) ≈ 19.93`, compared against `27`** — an honest, approximate connection to a quantity this curriculum hasn't formally defined yet, flagged clearly as a preview rather than a fully derived result, motivating Lesson 67 directly.

### CS Lens

This is the sharpest real evidence yet for why "how many steps does this take" (Lesson 56) is worth analyzing precisely: two algorithms solving the identical problem, correctly, can differ by a factor of `26,000` at a scale that's genuinely unremarkable for real applications like cryptography, where exponents in the thousands or millions of bits are routine. Also recognized in: a cryptographic system's practical viability depending entirely on using exponentiation by squaring rather than naive repeated multiplication — real-world encryption would be computationally infeasible without exactly this technique; a numerical library's matrix-power computation using the identical squaring trick to make otherwise-impractical computations feasible.

### SE Lens

The alternative to measuring this comparison at real scale (`n = 1,000,000`) is to test only small exponents, where both procedures finish near-instantly and the difference is invisible. The real cost of that alternative is exactly the trap this curriculum warned about in Lesson 39 and Lesson 58 — a program that works acceptably in testing but becomes practically unusable the moment it's used at realistic scale. Measuring at a scale where the difference is unmistakable, as this unit does, is what makes the value of exponentiation by squaring undeniable rather than theoretical.

---

## Closing

### Connect the pieces

Two procedures, one problem, a dramatic measured difference:

1. **The literal translation (Unit 1):** `naive-expt`, repeated multiplication, one factor peeled off per call — `n` calls total.
2. **The faster technique, derived (Unit 2):** `fast-expt`, halving the exponent whenever possible, squaring an already-computed smaller power instead of recomputing it.
3. **Both checked against each other and against `expt` (Unit 3):** exact agreement across five varied cases, including both boundary conditions.
4. **The real cost, measured (Unit 4):** `36,400.101` ms and `1,000,001` calls versus `1.37` ms and `27` calls — a real, over-`26,000`-times speedup, with `fast-expt`'s call count tracking a quantity close to `log₂(n)`, motivating Lesson 67's formal definition directly.

Every real number in this lesson — the five-way exact matches, `36,400.101` ms, `1.37` ms, `1,000,001` calls, `27` calls — came from code built and run this lesson; the connection to `log₂(n)` was flagged honestly as a preview, not yet a fully derived result, setting up exactly what Lesson 67 exists to formalize.

### What breaks without this

Suppose a system needed to compute a cryptographic operation involving an exponent hundreds or thousands of digits long — entirely ordinary in real encryption — and its implementation used `naive-expt`'s approach, one multiplication per unit of the exponent. Based on this lesson's real, measured evidence, where an exponent of merely `1,000,000` already took over thirty-six seconds with the naive approach, an exponent large enough for real cryptographic security would take a duration measured in years, decades, or far longer — entirely, practically infeasible, not just slow. Exponentiation by squaring, derived and measured in this lesson, is not an optional optimization for such systems; it is the specific technique that makes modern cryptography computationally possible at all.

### Exercises

1. **Observe.** Compute `3⁸` by hand using exponentiation by squaring's own logic (halving where possible, peeling off a factor where not), tracking each intermediate value.
2. **Formalize.** Run `fast-expt` on `(3, 8)` and confirm it matches your Exercise 1 hand computation and Guile's `expt`.
3. **Explain.** State, in your own words, why `fast-expt`'s odd-exponent branch is necessary — what would go wrong if `fast-expt` only ever tried to halve, with no fallback for odd exponents.
4. **Formalize.** Measure `naive-expt` and `fast-expt` at a value of `n` of your own choosing, at least `100,000`, and report the real, measured call counts and timing you observe.
5. **Explain.** Using your Exercise 4 call counts, compute `log₂(n)` for your chosen `n`, and state how closely `fast-expt`'s real call count tracks it, the way Concept Unit 4 did for `n = 1,000,000`.

### Definition of done

- [ ] You can derive `naive-expt` directly from the definition of repeated multiplication.
- [ ] You can derive `fast-expt`'s halving technique, explaining both the even case and the necessary odd-case fallback.
- [ ] You can check both procedures against each other and against a trusted, external reference.
- [ ] You can measure and explain, with real evidence, why exponentiation by squaring dramatically outperforms naive repeated multiplication at scale.
- [ ] You completed Exercises 1–5 using a value of `n` not used as this lesson's own example.
- [ ] Commit `expt-compare.scm` and your Exercise 4 and 5 findings, with a commit message stating the `n` you tested and the speedup you measured.
