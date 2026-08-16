# Lesson 189: Floating-Point Representation

- **What you will build** — a function computing a fraction's binary
  expansion using exact rational arithmetic, a normalized
  sign/exponent/mantissa decomposition mirroring real floating-point
  hardware, and a function that measures the exact, nonzero error left
  behind when a fraction's binary expansion is cut off after a fixed
  number of bits. The transferable problem: every number represented so
  far in this section has been a whole integer; real numbers need
  fractions too, and binary cannot represent every fraction a human cares
  about exactly — which is not a bug or a rare edge case, it is a provable
  mathematical fact about which fractions binary even *can* represent,
  with real, measurable consequences for every floating-point computation
  ever run.
- **What you need to know first** — positional notation (Lesson 184);
  `/` producing exact fractions (Section I); the Pigeonhole Principle
  (Lesson 66); recursion with an accumulator (Section III, reused
  throughout this section).
- **Terms introduced in this lesson**
  - **fractional binary expansion** — the binary digits that come after
    a "binary point," each one worth a *negative* power of two (`1/2`,
    `1/4`, `1/8`, ...), the same way `137`'s digits are each worth a
    positive power of ten.
  - **normalized form** — writing a number as a value between `1` and the
    radix, times the radix raised to some power — binary's version of
    scientific notation (`6` as `1.1₂ × 2²`, the same idea as `350` as
    `3.5 × 10²`).
  - **exponent** — the power the radix is raised to in normalized form;
    it says how big or small the number is, independent of its exact
    digits.
  - **mantissa (significand)** — the digits of the normalized value
    itself, after the implicit leading `1`; it says exactly *which*
    number between `1` and the radix this is, independent of its scale.
  - **implicit leading bit** — the `1` that every normalized binary value
    always starts with, by definition of "normalized" — since it's always
    the same digit, it never has to be stored at all, a detail real
    floating-point hardware relies on for one extra bit of real precision.
  - **rounding error (approximation error)** — the exact difference
    between a fraction's true value and whatever a fixed number of binary
    digits actually manages to represent; not a mistake, but an
    unavoidable, precisely measurable consequence of a finite digit
    budget meeting an infinite expansion.
- **Objects and methods used**: None new. This lesson reuses `/`, `*`,
  `+`, `-`, `<`, `>=` (Section I), `cons`, `first`, `rest`, `empty?`,
  `reverse`, `list` (Section II), each already covered.

---

## Concept Unit: Fractional Binary and Non-Terminating Expansions

### The Problem

Every digit list this section has built represents a whole number.
Fractions need digits *after* the point too — and it's not obvious yet
whether every fraction that has a clean, finite decimal form (like `0.1`)
also has a clean, finite *binary* form.

### Introduce the Concept in Isolation

Positional notation (Lesson 184) weighted each digit by a *positive*
power of the radix. A digit after the point is worth a *negative* power
instead — `1/2`, `1/4`, and so on. Confirm that generalization holds using
exact fractions, computing what binary `0.11` (two digits after the
point, both `1`) is actually worth:

```clojure
(+ (/ 1 2) (/ 1 4))
```

Run:

```
user=> (+ (/ 1 2) (/ 1 4))
3/4
```

`/` on two integers that don't divide evenly, already relied on since
Section I, returns a real, exact fraction — not an approximation. `3/4`
confirms binary `0.11` is worth exactly the same thing decimal `0.75`
is: `(1 × 1/2) + (1 × 1/4)`, positional notation running with negative
exponents instead of positive ones.

### Discard the Throwaway Example

The hand-typed sum above only existed to confirm the generalization. The
real project code below computes a fraction's binary digits directly,
for any input, rather than checking a fixed set of digits already known.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 188's completed integer representation.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Converting a fraction to binary digits works by repeated doubling: double
the fraction; if the result is `1` or more, that position's digit is `1`
and the next fraction to convert is whatever's left over past `1`;
otherwise the digit is `0` and the whole doubled value carries forward
unchanged.

```clojure
(defn fraction-digit
  [f]
  (if (>= (* f 2) 1) 1 0))
```

```clojure
(defn fraction-next
  [f]
  (if (>= (* f 2) 1) (- (* f 2) 1) (* f 2)))
```

### The Updated Project

Both freestanding functions above compute one digit and one "what's left"
value. A fixed number of digits — chosen up front, since (as this unit's
own trace will show) this process doesn't always stop on its own — comes
from repeating that pair and collecting the digits, in the order they were
computed:

```clojure
(defn fraction-bits-acc
  [f bits-remaining digits]
  (if (= bits-remaining 0)
    (reverse digits)
    (fraction-bits-acc (fraction-next f) (- bits-remaining 1) (cons (fraction-digit f) digits))))
```

```clojure
(defn fraction-bits
  [f bits-remaining]
  (fraction-bits-acc f bits-remaining (list)))
```

### Mechanical Walkthrough

Enumerating `fraction-digit`'s and `fraction-next`'s bodies:

- `(* f 2)` — **(c) already basic**; doubling, the fractional-side mirror
  of `decimal->binary-acc`'s `quot n 2` halving the *integer* side.
- `(>= (* f 2) 1)` — **(c) already basic**; checks whether doubling
  crossed the next whole unit — exactly the test that decides this
  position's digit.
- `(- (* f 2) 1)` — **(c) already basic**; when doubling did cross `1`,
  subtracting it back off leaves only the part still to be converted.

Enumerating `fraction-bits-acc`'s body:

- `(= bits-remaining 0)`, `reverse digits` — **(c) already basic**
  individually; the reversal matters here in a way it didn't for
  `decimal->binary-acc`: this recursion computes digits *most-significant
  first* (closest to the point first), so consing each new one onto the
  front builds them in reverse order, and a final `reverse` restores the
  correct left-to-right order before returning.
- `fraction-bits-acc (fraction-next f) (- bits-remaining 1) (cons ...)` —
  **(b) a hard concept reappearing**: the same accumulator-recursion
  pattern used throughout this section, counting a fixed budget down to
  zero instead of shrinking a number to zero.

Trace `fraction-bits` on `1/10` — decimal `0.1` — for `6` bits, since
`0.1` has a famous, well-known reputation worth checking directly:

```
f 1/10, digit (2×1/10=1/5, <1) → 0, next 1/5
f 1/5,  digit (2×1/5=2/5, <1)  → 0, next 2/5
f 2/5,  digit (2×2/5=4/5, <1)  → 0, next 4/5
f 4/5,  digit (2×4/5=8/5, ≥1)  → 1, next 8/5−1=3/5
f 3/5,  digit (2×3/5=6/5, ≥1)  → 1, next 6/5−1=1/5
f 1/5,  digit (2×1/5=2/5, <1)  → 0, next 2/5
```

Reversing the six collected digits gives `(0 0 0 1 1 0)`. Look closely at
the fraction column: `1/5` appears twice — once at the very start of the
second row, and again at the start of the sixth. Once the *exact same*
fraction reappears, every digit computed after it must repeat exactly
what followed it the first time, forever — the same guarantee the
Pigeonhole Principle (Lesson 66) already proved in a different setting:
there are only finitely many possible fractions with denominator `10`
that this doubling process can ever produce, so *some* value has to recur
eventually, and once it does, the process can never terminate. `1/10`'s
binary expansion does not stop at six digits, or sixteen, or six hundred —
it repeats `0011` forever. This is proof, not observation: `0.1` has no
finite binary representation, full stop.

### CS Lens

A fraction whose expansion never terminates, in some base, is not unique
to binary or to this one value.

```
Also recognized in: `1/3` in decimal (`0.333...`, the everyday-familiar
version of exactly this phenomenon); the Pigeonhole Principle (Lesson
66) itself, guaranteeing any base-N expansion of a rational number must
either terminate or eventually cycle, since there are only finitely many
possible remainders; and continued fractions, a different but related
way of representing exactly the numbers a fixed-base positional system
struggles with
```

### SE Lens

Some real systems sidestep this entire problem by never using binary
floating-point for values where exactness matters — storing currency as
plain integer cents, for instance, or using a dedicated arbitrary-precision
decimal type, both of which represent `0.1` exactly because they're
working in base ten (or an integer scaled by a known power of ten) instead
of base two. That's a real, well-known, hard-won engineering rule:
financial software is routinely warned never to store money in plain
binary floating-point, precisely because of the fact just proven. The
tradeoff: decimal and fixed-point types are exact for the fractions
humans actually write down, but slower and less universally supported in
hardware than native binary floats, which nearly every CPU has dedicated,
fast circuitry for — speed and hardware support, traded against exactness
for the specific fractions people care about.

---

## Concept Unit: Sign, Exponent, and Mantissa

### The Problem

`fraction-bits` only handles values already between `0` and `1`. A real
number can be any size — how is *that* represented compactly, the way
`6` and `600000` shouldn't need wildly different amounts of storage just
because one is bigger?

### Introduce the Concept in Isolation

Decimal already has an answer to this, in scientific notation: `350` is
`3.5 × 10²`, a value between `1` and `10` times a power of ten. Confirm it
holds as plain exact arithmetic, entirely in decimal, before touching
binary:

```clojure
(* (/ 7 2) 100)
```

Run:

```
user=> (* (/ 7 2) 100)
350
```

`7/2` is `3.5`, `100` is `10²`, and multiplying them back together
recovers `350` exactly — confirming any positive number can be rewritten
as (something between `1` and the radix) times (the radix to some power).
**This is called normalized form.** Binary's version replaces radix ten
with radix two: something between `1` and `2`, times `2` to some power.

### Discard the Throwaway Example

The decimal check above only confirmed the general idea. The real project
code below finds a number's binary normalized form directly — its
**exponent**, and, reusing `fraction-bits` from the first unit, its
**mantissa**.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `fraction-bits`.
- **Dependencies**: Babashka, already installed.

### The New Code

Finding the exponent means repeatedly halving or doubling a number until
it lands between `1` and `2`, counting each step:

```clojure
(defn normalize-exponent
  [n]
  (if (>= n 2)
    (+ 1 (normalize-exponent (/ n 2)))
    (if (< n 1)
      (- (normalize-exponent (* n 2)) 1)
      0)))
```

### The Updated Project

The exponent alone doesn't capture the value's exact digits. `2`, raised
to that exponent, is needed to find the normalized value itself — and
that needs its own small helper, since no exponentiation function has
been built yet in this section:

```clojure
(defn pow2
  [e]
  (if (= e 0)
    1
    (* 2 (pow2 (- e 1)))))
```

Together, the normalized value's fractional part — everything past the
implicit leading `1` — is what `fraction-bits` (first unit) turns into
the actual mantissa bits:

```clojure
(defn mantissa-bits
  [n bits]
  (fraction-bits (- (/ n (pow2 (normalize-exponent n))) 1) bits))
```

### Mechanical Walkthrough

Enumerating `normalize-exponent`'s body:

- `(>= n 2)`, `(< n 1)` — **(c) already basic**; together they detect
  which of the three cases applies: too big, too small, or already
  normalized.
- `(+ 1 (normalize-exponent (/ n 2)))` — **(b) a hard concept
  reappearing**: shrink-toward-a-base-case recursion again, halving `n`
  each time and counting the halvings — the exponent *is* that count.
- `(- (normalize-exponent (* n 2)) 1)` — **(a) first appearance**: the
  mirror case, for a value smaller than `1` — doubling `n` toward `1`
  instead of halving it toward `1`, and *subtracting* one from the count
  instead of adding, since a value that started below `1` needs a
  *negative* exponent to normalize.
- `0` — **(c) already basic**; the base case, reached once `n` is already
  in `[1, 2)`.

Enumerating `pow2`'s body:

- `(* 2 (pow2 (- e 1)))` — **(b) a hard concept reappearing**; the same
  shrink-to-zero recursion as `make-ones` (Lesson 187), computing a power
  by repeated multiplication instead of counting doublings the way
  `bits-needed-acc` (Lesson 184) did.

Enumerating `mantissa-bits`'s body:

- `(pow2 (normalize-exponent n))` — **(c) already basic**; both pieces
  already independently verified, composed to get `2` raised to `n`'s own
  exponent.
- `(/ n (pow2 ...))` — **(c) already basic**; `n` scaled down to its
  normalized form, some value in `[1, 2)`.
- `(- ... 1)` — **(a) first appearance**: strips off the *implicit leading
  bit* — every normalized value's integer part is provably always exactly
  `1`, so subtracting it leaves only the genuinely informative part, the
  fractional bits that actually distinguish this value from any other
  normalized value.

Trace all three functions on `n = 6`:

```
normalize-exponent 6:  6 ≥ 2 → 1 + normalize-exponent 3
normalize-exponent 3:  3 ≥ 2 → 1 + normalize-exponent 3/2
normalize-exponent 3/2: not ≥2, not <1 → 0
                        so normalize-exponent 3 = 1, normalize-exponent 6 = 2

pow2 2 → 2 × pow2 1 → 2 × (2 × pow2 0) → 2 × (2 × 1) → 4

n / (pow2 exponent) = 6 / 4 = 3/2
mantissa fraction = 3/2 − 1 = 1/2
mantissa-bits 6 4 = fraction-bits 1/2 4
```

`fraction-bits 1/2 4`, traced the same way as the first unit: doubling
`1/2` gives exactly `1`, so the very first digit is `1` and everything
left over is `0` — every remaining position doubles `0` and stays `0`.
The result is `(1 0 0 0)`. `6` is `1.1000₂ × 2²` — exponent `2`, mantissa
`(1 0 0 0)`, an implicit leading `1` never stored because normalized
form guarantees it's always there.

### CS Lens

Splitting a value into "how big" (exponent) and "exactly what" (mantissa)
is scientific notation's own idea, one level more general than decimal.

```
Also recognized in: ordinary decimal scientific notation, which this
unit's isolated lab confirmed directly; IEEE 754, the real, near-universal
floating-point standard, which uses this exact sign/exponent/mantissa
split with a genuinely implicit, never-stored leading bit, for real free
precision; and slide rules, which physically separate a number's
magnitude from its digits along two different scales
```

### SE Lens

A fixed-point representation — a constant, unchanging number of
fractional bits for every value, with no exponent at all — was the
available alternative, and it's genuinely simpler: no `normalize-exponent`
or `pow2` needed, just a plain binary point in a fixed spot. Its real cost
is range: a fixed-point format sized for values near `1` either overflows
outright on something the size of a galaxy's distance in meters, or loses
every bit of precision on something the size of an electron's charge. The
exponent built in this unit is what lets the *same* fixed mantissa budget
represent both — at the honest cost this whole lesson exists to name: a
fixed number of mantissa bits has to cover proportionally more ground as
the exponent grows, meaning precision necessarily shrinks for larger
magnitudes, a real, unavoidable tradeoff, not an implementation flaw.

---

## Concept Unit: Measuring the Error

### The Problem

The first unit proved `1/10`'s binary expansion never terminates. Any
real representation has to cut it off at some fixed number of bits. What
exactly is lost when it does — not just "some imprecision," but a real,
computable number?

### Introduce the Concept in Isolation

The same phenomenon shows up in decimal, where it's easier to see
directly: truncating `1/3`'s decimal expansion to three digits gives
`0.333`, built here from exact fractions to keep every step checkable:

```clojure
(+ (/ 3 10) (/ 3 100) (/ 3 1000))
```

Run:

```
user=> (+ (/ 3 10) (/ 3 100) (/ 3 1000))
333/1000
```

Compare that truncated value against the true, exact `1/3`:

```clojure
(- (/ 1 3) (/ 333 1000))
```

Run:

```
user=> (- (/ 1 3) (/ 333 1000))
1/3000
```

`1/3000` is a real, nonzero, exactly-computed number — not a rounding
artifact of imprecise arithmetic, since every value involved is an exact
fraction. Truncating `1/3`'s decimal expansion at three digits loses
*exactly* `1/3000`, no more, no less. **This is called rounding error**,
and it can be measured this precisely for binary fractions too.

### Discard the Throwaway Example

The decimal check above only confirmed error can be measured exactly.
The real project code below measures it for `1/10`'s own truncated binary
expansion, computed in the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `mantissa-bits`.
- **Dependencies**: Babashka, already installed.

### The New Code

Reconstructing a fraction's value from its binary digits needs each
digit's own place value — `1/2` for the first position, `1/4` for the
second, halving again each step:

```clojure
(defn fraction-value
  [digits place-value]
  (if (empty? digits)
    0
    (+ (* (first digits) place-value) (fraction-value (rest digits) (/ place-value 2)))))
```

### The Updated Project

The exact error is whatever's left once the reconstructed value is
subtracted from the true one:

```clojure
(defn approximation-error
  [true-value digits]
  (- true-value (fraction-value digits (/ 1 2))))
```

### Mechanical Walkthrough

Enumerating `fraction-value`'s body:

- `(empty? digits)`, `0` — **(c) already basic**; once every digit is
  consumed, whatever's left contributes nothing further.
- `(* (first digits) place-value)` — **(c) already basic**; this
  position's digit times its place value — `0` or `1` times `1/2`, `1/4`,
  and so on, positional notation run in reverse, reconstructing a value
  from digits instead of extracting digits from a value.
- `(fraction-value (rest digits) (/ place-value 2))` — **(b) a hard
  concept reappearing**: ordinary structural recursion over a list
  (Section II), halving the place value with each step exactly the way
  `fraction-digit`'s own doubling ran the identical relationship in the
  opposite direction.

Enumerating `approximation-error`'s body:

- `(- true-value (fraction-value digits (/ 1 2)))` — **(c) already
  basic** subtraction, composing two independently verified values.

Trace `approximation-error` on the true value `1/10` and the first unit's
own six-bit result, `(0 0 0 1 1 0)`:

```
fraction-value (0 0 0 1 1 0) 1/2
  = 0×1/2  + fraction-value (0 0 1 1 0) 1/4
  = 0×1/4  + fraction-value (0 1 1 0)   1/8
  = 0×1/8  + fraction-value (1 1 0)     1/16
  = 1×1/16 + fraction-value (1 0)       1/32
  = 1/16 + [1×1/32 + fraction-value (0) 1/64]
  = 1/16 + 1/32 + [0×1/64 + fraction-value () 1/128]
  = 1/16 + 1/32 + 0 + 0
  = 3/32

approximation-error 1/10 (0 0 0 1 1 0)
  = 1/10 − 3/32
  = 16/160 − 15/160
  = 1/160
```

Six bits of `1/10`'s binary expansion reconstruct to `3/32` — not `1/10`
— and the exact gap between them is `1/160`, a real, nonzero, precisely
known number. Every arithmetic operation ever performed on a truncated
binary fraction inherits some version of this exact gap; it never
disappears, it only gets carried forward into whatever computation uses
that fraction next.

### CS Lens

An exact, quantifiable gap between a truncated representation and a true
value is the root cause of a whole, real, extremely well-documented class
of computing surprises.

```
Also recognized in: the famous `0.1 + 0.2` not equaling `0.3` exactly in
nearly every mainstream language's floating-point arithmetic — directly
reproducible in any real REPL, and directly explained by this unit's own
derivation; numerical analysis's entire subfield of error propagation,
studying how small per-operation errors like this one compound across
long computations; and floating-point "drift" in physics and graphics
engines, where a simulation run for a very long time visibly accumulates
these small, individually tiny errors into a large, visible one
```

### SE Lens

Because this whole lesson computed everything with exact rational
arithmetic, every comparison in it (`>=`, `<`, `=`) has been completely
safe and exact the entire time. Real floating-point code doesn't get that
luxury: comparing two floats for exact equality is a famous, common real
bug, because two mathematically-equal computations can land on slightly
different bit patterns depending on the exact order operations happened
in — the accumulated error this unit just measured exactly, showing up
differently depending on path. The real, standard fix is comparing
"close enough" — within some small tolerance — instead of exact equality,
a genuine extra complication that exact rational arithmetic, used
throughout this lesson and this entire curriculum before it, has simply
never had to deal with.

---

## Connect the Pieces

Follow `6` through the normalized form this lesson built, and `1/10`
through the error this lesson measured. `(normalize-exponent 6)` returns
`2`; `(pow2 2)` returns `4`; `6 / 4` is `3/2`, and subtracting the
implicit leading `1` leaves `1/2` — fed straight into the first unit's
own `fraction-bits`, giving mantissa `(1 0 0 0)`. `6` is exactly `1.1000₂
× 2²`, and multiplying that back out — `(1 + 1/2) × 4` — returns `6`
exactly, no error at all, because `6`'s binary expansion genuinely
terminates. `1/10` does not: the same `fraction-bits` function, run on
`1/10` instead of `6`'s mantissa fraction, produces `(0 0 0 1 1 0)`, and
`approximation-error` — built from `fraction-value`, the exact reverse of
`fraction-digit` — proves the gap left behind is exactly `1/160`, not an
approximation of an error, the error itself, computed exactly. The same
three-unit toolkit — expand a fraction to binary, normalize a value into
exponent and mantissa, and measure exactly what a fixed digit budget
loses — handles both a number that fits perfectly and one that provably
never can.

## What Breaks Without This

`normalize-exponent`'s two recursive branches exist because a value could
start either too big (needing halving) or too small (needing doubling).
Drop the second branch and only handle the too-big case:

```clojure
(defn normalize-exponent-broken
  [n]
  (if (>= n 2)
    (+ 1 (normalize-exponent-broken (/ n 2)))
    0))
```

Trace it on `n = 1/2` — a value that's already too *small* to be
normalized, needing a negative exponent:

```
normalize-exponent-broken 1/2: not ≥ 2 → return 0 immediately
```

The broken version claims `1/2`'s exponent is `0` — meaning it claims
`1/2` is already normalized, in `[1, 2)`. It plainly is not: `1/2` is less
than `1`. Feed that wrong exponent into `mantissa-bits`: `(pow2 0)` is
`1`, so the "normalized" value used for the mantissa would be `1/2 / 1 =
1/2`, and subtracting the implicit leading `1` gives `1/2 − 1 = -1/2` — a
*negative* fraction handed to `fraction-bits`, which was never built to
handle one. Nothing about the missing branch throws an error by itself;
it silently produces a nonsensical exponent that only reveals itself once
something downstream — here, a negative "fraction" — stops making sense.
Restoring the `(< n 1)` branch, doubling `n` up toward `1` and counting a
negative exponent for it, is what gives every value, not just the ones
already at or above `1`, a real, correct normalized form.

## Exercises

1. Trace `fraction-bits` on `1/4` for `4` bits by hand, and confirm the
   expansion terminates (every digit past the first is `0`) — explain, in
   one sentence, what's different about `1/4` from `1/10` that guarantees
   this.
2. Using `normalize-exponent`, `pow2`, and `mantissa-bits`, derive the
   normalized form of `11` by hand (`decimal->binary 11` was `(1 0 1 1)`
   back in Lesson 184) and state its exponent and its first four mantissa
   bits.
3. `approximation-error` was only checked on `1/10` truncated to six
   bits. Compute it by hand for `1/10` truncated to just `4` bits instead,
   and confirm the error is larger than the six-bit version's `1/160` —
   explain in one sentence why fewer bits should always mean at least as
   much error, never less.

## Definition of Done

- [ ] `fraction-digit`, `fraction-next`, `fraction-bits-acc`, and
      `fraction-bits` are written and hand-traced for `1/10` at six bits,
      matching this lesson's `(0 0 0 1 1 0)`.
- [ ] `normalize-exponent`, `pow2`, and `mantissa-bits` are written and
      hand-traced for `n = 6`, matching this lesson's exponent `2` and
      mantissa `(1 0 0 0)`.
- [ ] `fraction-value` and `approximation-error` are written and confirmed
      to compute exactly `1/160` for `1/10` truncated to six bits.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why the broken version's failure doesn't
      show up until `mantissa-bits` is called, not inside
      `normalize-exponent-broken` itself.
- [ ] Commit with a message explaining *why* the error in this lesson was
      computed as an exact fraction rather than approximated some other
      way, not just *what* functions were added.
