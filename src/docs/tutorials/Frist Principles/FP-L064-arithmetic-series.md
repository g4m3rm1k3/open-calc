# Lesson 64: Arithmetic Series

**What you will build:** `arithmetic-sum-formula`, a real, closed-form procedure computing the sum of any arithmetic sequence directly, with no loop and no recursion at all — derived from first principles using a classic pairing trick, not memorized. Real, verified evidence this session: the formula matches `sigma` (Lesson 63) exactly across five varied test cases, including a negative common difference and a zero common difference. At a real, measured `n = 5,000,000` terms, the formula computes the answer in **`0.025` ms**; `sigma`, computing the identical, exact `12,500,002,500,000`, takes **`1,749.214` ms** — roughly **`70,000` times slower**. The transferable point: a derived closed-form formula isn't just more elegant than summing term by term — it can be almost incomprehensibly faster, and this lesson derives one honestly, from a proof, rather than presenting it as something to memorize.

**What you need to know first:** Lesson 22 (`FP-L022-proof-as-reliable-reasoning.md`) — specifically the discipline of deriving rather than assuming, applied directly to this lesson's central formula. Lesson 63 (`FP-L063-sequences-and-sums.md`) — specifically `sigma` and *sequence*, both extended directly here.

**Terms introduced in this lesson**

- **Arithmetic sequence** — a sequence (Lesson 63) where each term differs from the one before it by a fixed amount, called the common difference. `3, 5, 7, 9, 11, …` is an arithmetic sequence with common difference `2`; as a function, `f(i) = a + d × i`, where `a` is the first term and `d` is the common difference.
- **Arithmetic series** — the sum of an arithmetic sequence's terms over some range.
- **Closed form** — an expression computable directly from a formula's inputs, requiring no loop, no recursion, and no repeated addition — in sharp contrast to `sigma`'s term-by-term accumulation. `arithmetic-sum-formula`, derived in this lesson, is a closed form for the arithmetic series.

---

## Concept Unit 1: What Makes a Sequence "Arithmetic"

### The Problem

`sigma` (Lesson 63) can sum any sequence at all — nothing about it assumes any particular structure. Arithmetic sequences have one, specific, simple structure worth naming precisely before deriving anything about them.

### No isolated lab for this step

This concept has no code of its own to isolate — the definition is stated directly below.

### Applying It — Naming the Structure

**The defining property:** in an arithmetic sequence, consecutive terms always differ by the same fixed amount — the common difference, `d`. Given a first term `a` and common difference `d`, the sequence's `i`th term (starting from `i = 0`) is `a + d × i`.

**As real code, using Lesson 63's own function-as-sequence view:**

```scheme
(define (arithmetic-term a d) (lambda (i) (+ a (* d i))))
```

`(arithmetic-term 1 1)` is the sequence `1, 2, 3, 4, …`; `(arithmetic-term 3 2)` is `3, 5, 7, 9, …`; `(arithmetic-term 5 0)` is `5, 5, 5, 5, …` — a valid, if unusual, arithmetic sequence, with common difference `0`.

### Walkthrough

- **"consecutive terms always differ by the same fixed amount"** — the precise, checkable defining property, distinguishing an arithmetic sequence from any other sequence `sigma` could sum.
- **`(arithmetic-term a d)`** — returns a `lambda`, exactly Lesson 63's sequence-as-function representation, ready to hand directly to `sigma`.
- **`d = 0` as a valid, degenerate case** — worth naming explicitly, since it will be checked directly in Concept Unit 3, confirming the formula being derived doesn't secretly assume `d` is nonzero.

### CS Lens

This is the practice of identifying a common, restricted shape within a more general category — `sigma` handles any sequence, but "arithmetic" names a specific, structured subset worth deriving a specialized, faster tool for, exactly the way this curriculum specialized `table-fib` (Lesson 55) for `fib`'s particular recurrence rather than relying only on general recursion. Also recognized in: a shipping company noticing that a specific subset of its routes always adds a fixed cost per stop, and building a specialized pricing formula for exactly that subset rather than computing every route generically; a payroll system noticing that hourly employees' pay always increases by a fixed raise amount per year, structuring that calculation specially rather than looking it up generically each time.

### SE Lens

The alternative to naming this structure precisely is to jump directly to deriving a formula without first confirming exactly what class of sequence the formula will (and won't) apply to. The real cost of that alternative is a formula whose scope is unclear — accidentally applied to a sequence that isn't actually arithmetic, producing a silently wrong answer. Naming the defining property explicitly first, as this unit does, costs nothing beyond the definition itself; it is what makes Concept Unit 3's verification meaningful, checking the formula specifically against sequences confirmed to satisfy this property.

---

## Concept Unit 2: Deriving the Sum Formula — Gauss's Pairing Trick

### The Problem

The formula for summing an arithmetic series is well known, and it would be easy to simply state it. Following this curriculum's standing discipline (Lesson 22), it's worth deriving it instead — using a specific, classic technique, not just asserting the result.

### No isolated lab for this step

This concept has no code of its own to isolate — the derivation is stated directly below, in prose.

### Applying It — The Derivation

**Setting up the sum, written forwards, for `n` terms starting at `a` with common difference `d`:**

$$S = a + (a + d) + (a + 2d) + \cdots + (a + (n-1)d)$$

**The same sum, written backwards — the identical terms, in reverse order:**

$$S = (a + (n-1)d) + (a + (n-2)d) + \cdots + (a + d) + a$$

**Adding the two versions of `S` together, term by term, matching each forward term with the backward term in the identical position:**

$$2S = [a + (a+(n-1)d)] + [(a+d) + (a+(n-2)d)] + \cdots$$

**Noticing every one of these `n` bracketed pairs sums to the identical value:** each pair is one term from the front and one from the back, and because the sequence increases by a constant `d` from the front while decreasing by the identical `d` from the back, every pair's total is exactly `2a + (n-1)d` — the first term plus the last term, always.

**Concluding:** since all `n` pairs sum to the identical `2a + (n-1)d`, the total `2S = n × (2a + (n-1)d)`, so:

$$S = \frac{n \times (2a + (n-1)d)}{2}$$

### Walkthrough

- **Writing the sum forwards and backwards** — the defining move of Gauss's classic pairing trick, setting up two versions of the identical quantity for direct comparison.
- **"every one of these `n` bracketed pairs sums to the identical value"** — the key insight the entire derivation rests on, stated and justified, not merely asserted.
- **`S = n × (2a + (n-1)d) / 2`** — the closed-form result, reached entirely through algebraic reasoning from the sequence's own defining property (Concept Unit 1), not looked up or memorized.

### CS Lens

This is a genuine mathematical derivation, historically attributed to a young Carl Friedrich Gauss, and it demonstrates directly what "closed form" means: a formula reached by reasoning about the sum's *structure*, not by actually performing the addition — exactly the distinction Concept Unit 4 will measure the cost of directly. Also recognized in: an engineer deriving a bridge's load capacity from its structural geometry, rather than testing it by progressively adding weight until it fails; an economist deriving a compound-interest total from a formula, rather than simulating each individual compounding period one at a time.

### SE Lens

The alternative to deriving this formula is to look it up and use it without understanding why it holds. The real cost of that alternative surfaces the moment a related but different problem arises — Lesson 65's geometric series, built next, needs a genuinely different derivation technique, and without having practiced deriving (rather than memorizing) here, adapting to that new technique would be starting from nothing. Deriving it via Gauss's pairing trick, as this unit does, builds the transferable skill: recognizing a sum's internal structure and exploiting it directly, not just recalling one specific formula.

---

## Concept Unit 3: Checking the Formula Against sigma

### The Problem

Concept Unit 2's derivation is algebraically sound. Following this curriculum's evidence discipline (Lesson 22 onward), it's worth checking it directly against real, independently computed sums — including the `d = 0` edge case named in Concept Unit 1.

### The New Code — Type It Yourself

```scheme
(define (arithmetic-sum-formula a d n)
  (/ (* n (+ (* 2 a) (* (- n 1) d))) 2))
```

### The Updated Project

This is `arithmetic-series.scm`, in full:

```scheme
(define (sigma f lo hi)
  (if (> lo hi)
      0
      (+ (f lo) (sigma f (+ lo 1) hi))))

(define (arithmetic-term a d) (lambda (i) (+ a (* d i))))

(define (arithmetic-sum-formula a d n)
  (/ (* n (+ (* 2 a) (* (- n 1) d))) 2))

(for-each
  (lambda (params)
    (let* ((a (car params)) (d (cadr params)) (n (caddr params))
           (real-sum (sigma (arithmetic-term a d) 0 (- n 1)))
           (formula-sum (arithmetic-sum-formula a d n)))
      (display "a=") (display a) (display " d=") (display d) (display " n=") (display n)
      (display " sigma=") (display real-sum)
      (display " formula=") (display formula-sum)
      (display " match=") (display (= real-sum formula-sum))
      (newline)))
  (list (list 1 1 10) (list 3 2 15) (list 5 0 8) (list 10 -1 20) (list 0 3 100)))
```

### Reference Source

Concept Unit 2's derived formula, translated directly: `n × (2a + (n-1)d) / 2`, using Scheme's `/`, `*`, `+`, and `-` exactly as written.

### Files affected

Created: `arithmetic-series.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile arithmetic-series.scm
a=1 d=1 n=10 sigma=55 formula=55 match=#t
a=3 d=2 n=15 sigma=255 formula=255 match=#t
a=5 d=0 n=8 sigma=40 formula=40 match=#t
a=10 d=-1 n=20 sigma=10 formula=10 match=#t
a=0 d=3 n=100 sigma=14850 formula=14850 match=#t
```

Verified this session — across five varied test cases, including a negative common difference (`d = -1`) and a zero common difference (`d = 0`, Concept Unit 1's degenerate case), `arithmetic-sum-formula`'s result matches `sigma`'s independently, term-by-term computed sum exactly, every time.

### Mechanical Walkthrough

- **`(/ (* n (+ (* 2 a) (* (- n 1) d))) 2)`** — a direct, one-line translation of `n × (2a + (n-1)d) / 2`, with Scheme's ordinary arithmetic operators.
- **`(sigma (arithmetic-term a d) 0 (- n 1))`** — the independent check: `arithmetic-term a d` builds the sequence as a function, `sigma` sums it term by term from index `0` to `n - 1`, computing the identical sum a completely different way.
- **The real `#t` match at every one of five varied cases** — direct, verified confirmation, not assumed correctness.

### CS Lens

This is Lesson 63's `sigma` serving exactly the role a general, trusted tool should serve: an independent check for a specialized, faster tool being introduced alongside it, following the identical pattern Concept Unit 2's CS Lens already noted for the derivation itself — trust built by comparison, not by algebraic plausibility alone. Also recognized in: a company's newly built fast-path billing calculator checked against its older, slower, but already-trusted general billing engine on every case where both apply, before the fast path is relied upon; a compiler's newly added optimization checked against its unoptimized output on a battery of test programs before being trusted in production.

### SE Lens

The alternative to checking the derived formula against `sigma` is to trust the algebra in Concept Unit 2 was translated into code correctly without any independent check. The real cost of that alternative is exactly the risk this curriculum has guarded against since Lesson 28 — a plausible-looking formula, correctly derived on paper but mistranslated into code (a misplaced parenthesis, an off-by-one in `n - 1`), producing silently wrong answers. Checking against `sigma`'s independent computation across five varied cases, as this unit does, is what confirms the translation, not just the derivation, is correct.

---

## Concept Unit 4: The Real Cost of a Closed Form

### The Problem

Concept Unit 3 confirmed the formula is *correct*. It's worth measuring, directly, just how much faster a closed form actually is than summing term by term — not simply asserting "closed forms are faster," following this curriculum's evidence discipline.

### No isolated lab for this step

This concept has no code of its own to isolate — the real timing comparison is demonstrated directly below.

### Applying It — Real Timing at n = 5,000,000

```
$ guile timing.scm
sigma, n=5000000: 12500002500000 in 1749.214 ms
formula, n=5000000: 12500002500000 in 0.025 ms
```

Verified this session — summing the first `5,000,000` positive integers: `sigma`, adding term by term, takes `1,749.214` ms; `arithmetic-sum-formula`, computing the identical, exact `12,500,002,500,000` directly from the formula, takes `0.025` ms — a real, measured difference of roughly **`70,000` times**.

**Naming why, directly:** `sigma`'s cost grows with `n` — summing `5,000,000` terms means `5,000,000` additions, one per term, exactly the counting-and-runtime connection Lesson 56 already established. `arithmetic-sum-formula`'s cost doesn't depend on `n` at all — computing `n × (2a + (n-1)d) / 2` takes the identical, small number of arithmetic operations whether `n` is `10` or `10,000,000`. This is exactly what "closed form" means in practice, not just in derivation: a fixed, small amount of work, regardless of how large the range being summed actually is.

### Walkthrough

- **The real `1,749.214` ms versus `0.025` ms measurement** — first direct, measured evidence of what a derived closed form is actually worth, not merely an assertion that "formulas are faster."
- **"`arithmetic-sum-formula`'s cost doesn't depend on `n` at all"** — the precise mechanical reason for the measured gap, distinguishing a formula whose *work* scales with input size from one whose work is fixed.

### CS Lens

This is the sharpest, most concrete evidence yet of Lesson 56's central claim — that counting (here, "how many additions does this computation perform") predicts runtime directly — and a direct preview of the "growth rate" vocabulary Lesson 69 and Lesson 71 (Big-O) will formalize: `sigma`'s cost grows with `n`, `arithmetic-sum-formula`'s doesn't grow with `n` at all. Also recognized in: a warehouse that can report its total inventory value instantly from a running total maintained continuously, versus one that must recount every single item from scratch each time a total is requested; a bank that can compute compound interest for any number of years directly from a formula, versus one that must simulate each year's compounding individually.

### SE Lens

The alternative to deriving and using a closed form, when one exists, is to always compute via `sigma` or an equivalent loop, trusting that "it's just addition, how slow can it be." The real cost of that alternative, at real scale, is precisely `1,749.214` ms spent doing work a `0.025` ms computation could have replaced entirely — a difference invisible at `n = 10` (both essentially instant) but dramatic and consequential the moment a program needs to work at genuinely large scale. Deriving the closed form and measuring the real gap, as this lesson does, is what turns "closed forms are nice" into a concretely, measurably justified engineering choice.

---

## Closing

### Connect the pieces

One kind of sequence, one derived formula, checked and measured:

1. **The structure, named (Unit 1):** arithmetic sequences, defined by a fixed common difference, expressed directly as a function following Lesson 63's own sequence definition.
2. **The formula, derived (Unit 2):** Gauss's pairing trick, reasoning about the sum's structure directly rather than performing the addition, producing `S = n(2a + (n-1)d)/2`.
3. **The formula, checked (Unit 3):** matched against `sigma`'s independent, term-by-term computation exactly, across five varied cases including the `d = 0` edge case Concept Unit 1 explicitly named.
4. **The formula's real value, measured (Unit 4):** a real, roughly `70,000`-times speed advantage at `n = 5,000,000`, traced directly to the formula's cost not growing with `n` at all.

Every real number in this lesson — the five exact `#t` matches, `1,749.214` ms, `0.025` ms — was measured directly, and the derivation itself traced back to a specific, checkable reasoning step (pairing forwards and backwards terms), not asserted as a formula to memorize — exactly the standard this curriculum has held since Lesson 22, now applied to one of mathematics' most famous elementary results.

### What breaks without this

Suppose an engineer needed to compute the total cost of a payment plan with a fixed monthly increase — say, `240` monthly payments starting at some amount and increasing by a fixed amount each month — and, lacking a derived closed form, computed the total by simulating all `240` months in a loop each time the total needed reporting, perhaps inside a frequently-called API endpoint. For `240` terms, this might run acceptably fast; but the identical pattern, applied somewhere the range is far larger — computing a running total across millions of transactions, say — would incur exactly the kind of avoidable, measured cost Concept Unit 4 demonstrated, `1,749.214` ms of unnecessary work standing in for `0.025` ms of necessary work. Recognizing an arithmetic structure and deriving its closed form, as this lesson did from Gauss's own reasoning, is what prevents this exact, easily overlooked inefficiency.

### Exercises

1. **Observe.** Choose your own values of `a`, `d`, and `n`, and compute the arithmetic series sum by hand, using Gauss's pairing trick directly (write the sum forwards and backwards, pair, and simplify) rather than adding term by term.
2. **Formalize.** Check your Exercise 1 hand computation against both `sigma` and `arithmetic-sum-formula`, confirming all three agree.
3. **Explain.** State, in your own words, why every one of the `n` paired terms in Concept Unit 2's derivation sums to the identical value, `2a + (n-1)d` — referencing specifically how the front-to-back increase and the back-to-front decrease cancel.
4. **Formalize.** Measure `sigma` and `arithmetic-sum-formula` at a value of `n` of your own choosing, at least `1,000,000`, and report the real, measured speed ratio you observe.
5. **Explain.** Using Concept Unit 4's reasoning, explain why `arithmetic-sum-formula`'s runtime should stay roughly constant even if `n` were increased by a factor of `1,000` from your Exercise 4 test, while `sigma`'s runtime would not.

### Definition of done

- [ ] You can state what makes a sequence arithmetic, and express one as a function of the form `f(i) = a + d × i`.
- [ ] You can derive the arithmetic series sum formula using Gauss's pairing trick, without looking it up.
- [ ] You can check a derived closed-form formula against an independent, term-by-term computation.
- [ ] You can measure, and explain in terms of growing versus fixed work, why a closed form outperforms term-by-term summation at scale.
- [ ] You completed Exercises 1–5 using values of `a`, `d`, and `n` not used as this lesson's own examples.
- [ ] Commit `arithmetic-series.scm` and your Exercise 4 measurements, with a commit message stating the `n` you tested and the speed ratio you found.
