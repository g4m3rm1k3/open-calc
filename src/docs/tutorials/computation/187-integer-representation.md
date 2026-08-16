# Lesson 187: Integer Representation

- **What you will build** — functions that fit a binary digit list to a
  fixed register width (padding or truncating it), a derivation of the
  largest value a given width can hold, and a first attempt at
  representing negative numbers: sign-magnitude, the scheme where the
  leading bit is a plain sign flag. The transferable problem: every
  function in Lessons 184 through 186 let its digit lists grow as large as
  a number needed; real hardware registers can't — they have a fixed
  number of bits, chosen in advance, and that fixed width is what makes
  both overflow and negative-number representation genuinely hard
  problems instead of afterthoughts.
- **What you need to know first** — `decimal->binary`, `binary->decimal`
  (Lesson 184), `ripple-add` (Lesson 186), `count`, `cons`, `first`,
  `rest` (Section II), `<` and the other comparison operators (Section I).
- **Terms introduced in this lesson**
  - **word width (fixed-width representation)** — the fixed number of
    bits a register or storage location has to hold a value in, decided
    in advance and never grown to fit a larger result.
  - **overflow** — what happens when a computation's true result needs
    more bits than the fixed width has room for; the extra high-order
    bits are lost, and the value that remains is silently wrong.
  - **unsigned integer** — a binary value interpreted as a plain
    non-negative magnitude, with no bit reserved to mean "negative" —
    every bit contributes straight to the number's size, the same
    interpretation Lesson 184 already used throughout.
  - **sign-magnitude representation** — a scheme for negative numbers
    that reserves one bit (conventionally the leading, most-significant
    bit) as a sign flag and interprets the remaining bits as an ordinary
    unsigned magnitude.
- **Objects and methods used**: None new. This lesson reuses `defn`, `if`,
  `cons`, `count`, `first`, `rest` (Section II), `<`, `-` (Section I),
  each already covered.

---

## Concept Unit: Fixed-Width Registers and Overflow

### The Problem

`ripple-add` (Lesson 186) let its result grow to however many digits the
true sum needed — adding two 3-digit numbers produced a 4-digit answer
without complaint. A real hardware register can't do that: it has a fixed
number of physical wires, decided when the chip was designed, and a
result that needs one more bit than that has nowhere to put it. What
actually happens to a computation whose true answer doesn't fit?

### Introduce the Concept in Isolation

Skipped — fitting a list to a fixed size by adding or removing elements
from one end is ordinary recursion over a list, the same shape as every
other list-walking function since Section II; nothing syntactic here is
new. The concept being taught — that a *fixed* width forces something to
give, either padding or loss — is best shown directly in real project
code rather than a disconnected throwaway example.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 186's arithmetic circuits.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Fitting a digit list to a fixed width has two directions: a list shorter
than the width gets leading zeros added, and a list longer than the width
gets its extra leading digits dropped. Padding first:

```clojure
(defn pad-to-width
  [digits width]
  (if (>= (count digits) width)
    digits
    (pad-to-width (cons 0 digits) width)))
```

### The Updated Project

Truncating the other direction needs to know exactly how many leading
digits are in excess before it can drop them one at a time:

```clojure
(defn drop-leading
  [digits excess]
  (if (= excess 0)
    digits
    (drop-leading (rest digits) (- excess 1))))
```

```clojure
(defn truncate-to-width
  [digits width]
  (if (> (count digits) width)
    (drop-leading digits (- (count digits) width))
    digits))
```

### Mechanical Walkthrough

Enumerating `pad-to-width`'s body:

- `defn`, `[digits width]`, `if` — **(c) already basic**.
- `(>= (count digits) width)` — **(c) already basic**; `count` and `>=`
  are both already covered, checking whether padding is even needed.
- `(cons 0 digits)` — **(c) already basic**; adds one leading zero — a
  leading zero never changes a binary value, only how many digits
  represent it, the same fact `decimal->binary`'s own zero-digit base
  case relied on in Lesson 184.
- `pad-to-width (cons 0 digits) width` — **(b) a hard concept
  reappearing**: the same accumulator-style recursion pattern used
  throughout this section, shrinking the *gap* between the current length
  and `width` by one each call instead of shrinking a number.

Enumerating `truncate-to-width`'s body:

- `(> (count digits) width)`, `drop-leading`, `(- (count digits) width)` —
  **(c) already basic** individually, composing to compute exactly how
  many leading digits are in excess before removing any.

Enumerating `drop-leading`'s body:

- `(rest digits)` — **(c) already basic**, Section II; drops the current
  leading digit.
- `drop-leading (rest digits) (- excess 1)` — **(b) a hard concept
  reappearing**, the same accumulator-style recursion again, this time
  counting excess down to zero instead of up to a target.

Trace `truncate-to-width` on `(ripple-add (decimal->binary 5)
(decimal->binary 6))` — Lesson 186's own `(1 0 1 1)`, fit into a register
only `3` bits wide, the same width both original inputs needed:

```
digits (1 0 1 1), width 3: (count digits)=4 > 3, excess = 4 - 3 = 1
drop-leading (1 0 1 1) 1 → excess 1 ≠ 0 → drop-leading (rest (1 0 1 1)) 0
                          → drop-leading (0 1 1) 0 → excess = 0 → return (0 1 1)
```

`(0 1 1)` is what a 3-bit register actually holds after "5 + 6" —
`binary->decimal (0 1 1)` gives `3`, not `11`. The true answer needed four
bits; the register only had three, so the leading `1` — the part of the
answer that mattered most — was silently dropped. This is **overflow**,
and the value left behind, `3`, is not a warning or an error, it's just a
plain, valid-looking, wrong number.

### CS Lens

A fixed width silently discarding whatever doesn't fit is not unique to
binary addition.

```
Also recognized in: real, historical integer-overflow bugs (classic
fixed-width `int` wraparound bugs, and the Ariane 5 rocket's 1996
failure, caused by a 64-bit value overflowing a 16-bit field during a
data conversion); odometers rolling over after their fixed number of
digits; and modular arithmetic itself (Lesson 54) — a fixed-width
register's overflow is exactly "wrapping around" a fixed range, the same
idea, just expressed in binary instead of decimal
```

### SE Lens

This curriculum's own Clojure code has never actually had to think about
this problem until now — and that's a deliberate design choice in the
language itself, not an accident. Clojure's ordinary `+` throws a real
`ArithmeticException` the moment a computation would overflow a fixed-size
machine integer, rather than silently wrapping the way raw hardware or C
does; `+'` goes further and automatically promotes the result to an
arbitrary-precision integer (a "bignum") that simply grows as large as it
needs to, with no fixed width at all — which is exactly the behavior this
entire section's own `decimal->binary` and `ripple-add` have quietly
relied on since Lesson 184. Three real, different answers to the same
problem: silently wrap (raw hardware, and this unit's `truncate-to-width`,
matching it deliberately to teach the failure), fail loudly the moment it
would happen (`+`), or never have a fixed width to overflow in the first
place (`+'`, and this curriculum's own arithmetic so far). None is free —
wrapping is fast but dangerous, failing loudly is safe but has to be
handled, and unbounded growth costs real memory and speed a fixed-width
register never pays.

---

## Concept Unit: Unsigned Range

### The Problem

Given a fixed width of `n` bits, and knowing every value is a plain
unsigned magnitude, what's the actual largest value that width can hold
before overflow becomes inevitable?

### Introduce the Concept in Isolation

Skipped — Lesson 184's third unit already lab'd the fact that `k` bits
produce exactly `2^k` distinguishable patterns; this unit answers the
inverse-adjacent question — not "how many bits for `n` values" but "what's
the largest value `n` bits can hold" — using the same doubling relationship,
already established, rather than a new construct.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `truncate-to-width`.
- **Dependencies**: Babashka, already installed.

### The New Code

The largest value an `n`-bit unsigned register can hold is whatever every
bit set to `1` represents — build that exact digit list first:

```clojure
(defn make-ones
  [n]
  (if (= n 0)
    (list)
    (cons 1 (make-ones (- n 1)))))
```

### The Updated Project

`make-ones` only builds the digit list — Lesson 184's own `binary->decimal`
is what turns it into the actual largest representable number:

```clojure
(defn max-unsigned
  [n]
  (binary->decimal (make-ones n)))
```

### Mechanical Walkthrough

Enumerating `make-ones`'s body:

- `defn`, `[n]`, `if`, `(= n 0)` — **(c) already basic**.
- `(cons 1 (make-ones (- n 1)))` — **(c) already basic** individually
  (`cons`, `-`), composing into **(b) a hard concept reappearing**: the
  same shrink-toward-a-base-case recursion this whole section has used
  repeatedly, here building a list of a specific length instead of
  converting a number.

Enumerating `max-unsigned`'s body:

- `binary->decimal (make-ones n)` — **(c) already basic**; both pieces
  were already verified independently — Lesson 184's own reconstruction
  function, applied to this unit's freshly built all-ones list.

Trace `max-unsigned` on `n = 3`, the exact width the first unit's overflow
demonstration used:

```
make-ones 3 → cons 1 (make-ones 2)
            → cons 1 (cons 1 (make-ones 1))
            → cons 1 (cons 1 (cons 1 (make-ones 0)))
            → cons 1 (cons 1 (cons 1 (list)))
            → (1 1 1)
binary->decimal (1 1 1) → 1, then 3, then 7   (Horner's method, Lesson 184)
```

`max-unsigned 3` returns `7` — and the first unit's overflow example added
`5 + 6 = 11` into a 3-bit register. `11` is greater than `7`, the largest
value three bits can honestly hold, which is exactly why it had nowhere
to go but to wrap: the true sum was never representable in that width to
begin with, confirmed now by an entirely independent derivation rather
than just observed after the fact.

### CS Lens

A fixed word width bounding the largest representable value is a concept
independent of this lesson's own toy functions.

```
Also recognized in: real hardware integer types (`uint8` capped at 255,
`uint16` at 65535, `uint32` at roughly four billion); network protocol
fields sized to their exact expected range (a TTL field, one byte; a port
number, two bytes); and old file-format size fields whose fixed width
became a real, historical limitation once files grew past what the
format's designers expected
```

### SE Lens

The same tension Lesson 184 already named for choosing a bit count now
resurfaces at the register-width level: pick a tight width matching
today's actual range, or a generously wide one with headroom for growth.
A tight width (say, exactly enough for values up to `100`) wastes nothing,
but the first unit's overflow demonstration is exactly what happens the
day a value exceeds it — silently, not with an error. A generous width
avoids that risk but costs real, permanent space for every value stored,
whether or not it ever gets close to using it — the identical tradeoff
already named for `bits-needed`, now costing physical register bits
instead of storage-format bits.

---

## Concept Unit: Sign-Magnitude Representation

### The Problem

Every value this section has represented so far has been non-negative.
Real programs need negative numbers. The most direct idea available:
reserve one bit to say "this number is negative," and let the rest of the
bits be an ordinary unsigned magnitude, exactly as already built. Does
that direct idea actually work cleanly?

### Introduce the Concept in Isolation

Skipped — sign-magnitude's pieces are all already-lab'd constructs
(`if`, `cons`, `<`, `-`, `first`, `rest`, and the unsigned encode/decode
functions from Lessons 184 and the earlier units of this lesson); the new
material is the representational *idea* itself, which the real code below
demonstrates directly.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `max-unsigned`.
- **Dependencies**: Babashka, already installed.

### The New Code

Encoding a number as sign-magnitude needs its sign and its plain magnitude
(absolute value) computed separately first:

```clojure
(defn sign-of
  [n]
  (if (< n 0) 1 0))
```

```clojure
(defn abs-value
  [n]
  (if (< n 0) (- 0 n) n))
```

### The Updated Project

Both feed into the actual encoder: the sign becomes the leading bit, and
the magnitude — converted with Lesson 184's own `decimal->binary`, then
padded to fill out the remaining width with this lesson's own
`pad-to-width` — becomes the rest:

```clojure
(defn decimal->sign-magnitude
  [n width]
  (cons (sign-of n) (pad-to-width (decimal->binary (abs-value n)) (- width 1))))
```

Decoding reverses it — split the leading sign bit off, reconstruct the
magnitude from what remains, and apply the sign:

```clojure
(defn magnitude-to-signed
  [sign-bit magnitude]
  (if (= sign-bit 1)
    (- magnitude)
    magnitude))
```

```clojure
(defn sign-magnitude->decimal
  [digits]
  (magnitude-to-signed (first digits) (binary->decimal (rest digits))))
```

### Mechanical Walkthrough

Enumerating `sign-of`'s and `abs-value`'s bodies:

- `(< n 0)` — **(c) already basic**, one of the comparison operators from
  Section I.
- `(- 0 n)` — **(c) already basic**; ordinary subtraction, here computing
  a value's negation.

Enumerating `decimal->sign-magnitude`'s body:

- `sign-of n`, `abs-value n`, `decimal->binary`, `pad-to-width` — **(c)
  already basic**, each independently verified already.
- `cons (sign-of n) (pad-to-width ...)` as a whole — **(a) first
  appearance**: this specific composition — one sign bit consed onto a
  padded magnitude field — is the sign-magnitude scheme itself, not a new
  construct but a new, real representational choice.

Enumerating `sign-magnitude->decimal`'s body:

- `(first digits)`, `(rest digits)` — **(c) already basic**, splitting the
  sign bit from the magnitude bits.
- `magnitude-to-signed (first digits) (binary->decimal (rest digits))` —
  **(a) first appearance**: applying a sign, read from a single bit, to an
  otherwise ordinary unsigned reconstruction.

Trace both directions on `n = 5, width = 4`:

```
decimal->sign-magnitude 5 4
  sign-of 5 → 0                      (5 is not negative)
  abs-value 5 → 5
  decimal->binary 5 → (1 0 1)
  pad-to-width (1 0 1) 3 → (1 0 1)   (already 3 digits, no padding needed)
  cons 0 (1 0 1) → (0 1 0 1)

sign-magnitude->decimal (0 1 0 1)
  first → 0, rest → (1 0 1)
  binary->decimal (1 0 1) → 5        (Lesson 184, Horner's method)
  magnitude-to-signed 0 5 → 5        (sign bit 0, no negation)
```

`5` round-trips through both functions back to `5` — but the scheme's
real weakness only shows up at zero. `(sign-magnitude->decimal (list 0 0
0 0))` decodes to `0`; so does `(sign-magnitude->decimal (list 1 0 0
0))` — sign bit `1`, magnitude `0`, and `magnitude-to-signed` returns
`(- 0)`, which is plain `0`, not some distinct "negative zero" value.
Two genuinely different four-bit patterns, `(0 0 0 0)` and `(1 0 0 0)`,
decode to the exact same number. Out of sixteen possible four-bit
patterns, one is entirely wasted duplicating a value another pattern
already represents.

### CS Lens

Reserving a dedicated sign bit next to an otherwise ordinary magnitude is
a real, historically used encoding choice, not just a stepping stone.

```
Also recognized in: several early real computers' arithmetic units,
which genuinely used sign-magnitude in hardware; some fixed-point audio
and DSP formats, which still use it today for symmetric range around
zero; and — flagged, not built here — IEEE 754 floating-point's own sign
bit, which Lesson 189 will show is sign-magnitude for exactly the sign,
even though the rest of a float's bits work nothing like plain unsigned
magnitude
```

### SE Lens

This lesson could have skipped straight to a scheme without
sign-magnitude's flaws. Building sign-magnitude for real, and hitting its
concrete double-zero waste directly, was deliberate: it's the
representation most people would invent first if asked "how would you add
a sign to a binary number," which makes its real failure — one wasted
pattern, and (shown in this lesson's closing section) addition itself
breaking — the honest motivation for whatever replaces it, rather than a
replacement scheme's odd-looking rules being presented with no reason to
trust them. The cost paid for that motivation is real: `decimal->sign-magnitude`
and `sign-magnitude->decimal`, verified and working code in this lesson,
will not be reused going forward once a scheme without their flaws
replaces them — a deliberate, contained one-lesson detour, not wasted
effort.

---

## Connect the Pieces

Follow the number `5` through every function this lesson built. Lesson
184's `(decimal->binary 5)` gives `(1 0 1)` — three digits, and
`truncate-to-width` applied to it at width `3` leaves it untouched (it
already fits, confirmed by the same `(count digits) > width` check that
caught the first unit's four-digit overflow). `(max-unsigned 3)`,
computed completely independently from `make-ones` and Lesson 184's
`binary->decimal`, returns `7` — and `5` is safely within that range,
which is exactly why `5` alone was never at risk of the overflow `5 + 6`
produced. Widening to a signed, four-bit register, `(decimal->sign-magnitude
5 4)` gives `(0 1 0 1)`, and `(sign-magnitude->decimal (0 1 0 1))` returns
`5` again — sign-magnitude round-trips correctly for an ordinary positive
number. Every function here traces back to either Lesson 184's original
binary conversion or Lesson 186's own register-width handling, checked at
every step against a number already fully understood.

## What Breaks Without This

Sign-magnitude round-trips correctly on its own — the real problem is
what happens the moment its bit patterns meet *ordinary* unsigned
addition, exactly the kind `ripple-add` (Lesson 186) already provides,
with no awareness that a leading bit might mean "sign" instead of
"magnitude." Encode `-1` and `1` as four-bit sign-magnitude:

```
decimal->sign-magnitude -1 4 → (1 0 0 1)     sign 1, magnitude 001 = 1
decimal->sign-magnitude  1 4 → (0 0 0 1)     sign 0, magnitude 001 = 1
```

`-1 + 1` must be `0`. Feed both patterns straight into `ripple-add`,
exactly as if they were ordinary unsigned numbers, since `ripple-add` has
no way to know they aren't:

```
(ripple-add (1 0 0 1) (0 0 0 1))
```

Tracing position by position (least-significant first, same as Lesson
186's own trace): position 1 adds `1 + 1` with no carry-in, giving sum
`0`, carry `1`; position 2 adds `0 + 0` plus that carry, giving sum `1`,
carry `0`; position 3 adds `0 + 0`, giving sum `0`, no carry; position 4 —
the *sign* bits — adds `1 + 0`, giving sum `1`, no carry. Final result:
`(1 0 0 1 0)`. `binary->decimal` on that is `18`. `ripple-add` never knew
position 4 held a sign flag instead of a magnitude bit — it added `1` (the
"negative" flag) and `0` (the "positive" flag) exactly like any other
column, and produced a plain, valid-looking, completely wrong `18` instead
of `0`. This is not a bug in `ripple-add`; it is doing exactly what an
unsigned adder is supposed to do. The bug is feeding it a representation
it was never designed to understand — sign-magnitude needs its sign bit
handled specially, by dedicated logic checking and comparing signs before
addition even happens, which no version of this section's adder has ever
had. Lesson 188 derives a different scheme, two's complement, built
specifically so that ordinary, unmodified addition — the exact
`ripple-add` already sitting finished from Lesson 186 — produces the
right answer on negative numbers without any special-casing at all.

## Exercises

1. `pad-to-width` and `truncate-to-width` were never combined into one
   function that does either, depending on which is needed. Sketch, in
   prose, how a single `fit-to-width` function could dispatch between
   them — no code required yet.
2. Compute `max-unsigned 4` by hand, the same way this lesson traced
   `max-unsigned 3`, and confirm it matches `2^4 - 1`.
3. Encode `-5` as a four-bit sign-magnitude pattern by hand, using
   `sign-of`, `abs-value`, `decimal->binary`, and `pad-to-width` exactly as
   `decimal->sign-magnitude` does internally, and then decode it back with
   `sign-magnitude->decimal` to confirm it returns `-5`.

## Definition of Done

- [ ] `pad-to-width`, `drop-leading`, and `truncate-to-width` are written
      and hand-traced against this lesson's `5 + 6` overflow example.
- [ ] `make-ones` and `max-unsigned` are written and confirmed for
      `n = 3`, matching this lesson's worked trace of `7`.
- [ ] `sign-of`, `abs-value`, `decimal->sign-magnitude`,
      `magnitude-to-signed`, and `sign-magnitude->decimal` are written and
      confirmed to round-trip `5` correctly.
- [ ] The double-zero flaw is understood well enough to state, without
      notes, which two four-bit patterns both decode to zero and why.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why `ripple-add` is not at fault for
      returning `18` instead of `0`.
- [ ] Commit with a message explaining *why* sign-magnitude was worth
      building even though it's about to be replaced, not just *what*
      functions were added.
