# Lesson 188: Two's Complement

- **What you will build** — the derivation Lesson 187 promised: a way to
  represent negative numbers such that Lesson 186's own unmodified
  `ripple-add` produces correct results on them, with no special-casing of
  any sign bit at all. The transferable problem: sign-magnitude's flaw
  wasn't really "a bit reserved for sign" — it was that ordinary addition
  hardware had no way to know that bit meant something different from the
  rest. Two's complement fixes that by choosing the negative pattern so
  that plain addition, run exactly as-is, produces the right answer by
  construction.
- **What you need to know first** — `not-gate` (Lesson 185); `ripple-add`
  (Lesson 186); `pad-to-width`, `truncate-to-width`, `decimal->binary`,
  `binary->decimal` (Lessons 184 and 187); `map` (Lesson 25).
- **Terms introduced in this lesson**
  - **ones' complement** — flipping every bit of a number's binary
    representation (`0` becomes `1`, `1` becomes `0`); on its own, not
    quite enough to make addition work correctly on negative numbers,
    demonstrated directly in this lesson's closing section.
  - **two's complement** — a number's ones' complement, plus one; the
    representation this lesson derives and shows is exactly what makes
    unmodified binary addition produce correct results on negative values.
- **Objects and methods used**: None new. This lesson reuses `not-gate`
  (Lesson 185), `map` (Lesson 25), `ripple-add`, `pad-to-width`,
  `truncate-to-width`, `decimal->binary`, `binary->decimal` (Lessons 184,
  186, 187), each already covered.

---

## Concept Unit: Deriving Two's Complement

### The Problem

Lesson 187 closed by showing sign-magnitude's real failure: feeding its
bit patterns into `ripple-add` unmodified gave `18` instead of `0` for
`-1 + 1`. What bit pattern for `-1` *would* make `ripple-add`, completely
unmodified, actually produce `0` when added to `1`'s ordinary pattern?

### Introduce the Concept in Isolation

Skipped — this unit's new code composes entirely already-lab'd pieces
(`not-gate` from Lesson 185, `map` from Lesson 25, `ripple-add` and the
width functions from Lessons 186 and 187); the new material is the
algebraic idea being derived, which the real code below demonstrates
directly rather than through a disconnected throwaway example.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 187's unfinished problem.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Flipping a single bit is exactly `not-gate`, already built and verified in
Lesson 185:

```clojure
(defn flip-bit
  [b]
  (not-gate b))
```

Flipping every bit in a whole digit list is `map` — already covered in
Lesson 25, and never yet used since, on the digit lists this whole section
has built — applying `flip-bit` to each one:

```clojure
(defn ones-complement
  [digits]
  (map flip-bit digits))
```

### The Updated Project

Ones' complement alone is not the answer (this lesson's closing section
shows exactly why). Two's complement is ones' complement plus one — added
using Lesson 186's own unmodified `ripple-add`, then fit back to the
original width with Lesson 187's own `truncate-to-width`, since adding one
can produce an extra leading digit the fixed width has no room for:

```clojure
(defn twos-complement
  [digits width]
  (truncate-to-width (ripple-add (ones-complement digits) (pad-to-width (list 1) width)) width))
```

### Mechanical Walkthrough

Enumerating `flip-bit`'s body:

- `not-gate b` — **(c) already basic**; Lesson 185's own gate, unchanged.

Enumerating `ones-complement`'s body:

- `map flip-bit digits` — **(b) a hard concept reappearing**: `map`
  (Lesson 25) applying an already-defined function, by name, to every
  element of a sequence — the same pattern this curriculum has used for
  every transformation since anonymous functions were ruled out.

Enumerating `twos-complement`'s body:

- `ones-complement digits` — **(c) already basic**, just defined above.
- `pad-to-width (list 1) width` — **(c) already basic**; builds the plain
  number `1`, fit to the same width as the input, ready to add.
- `ripple-add (ones-complement digits) (pad-to-width (list 1) width)` —
  **(c) already basic** call, composing two already-verified pieces —
  Lesson 186's adder, completely unaware anything about signs is
  happening.
- `truncate-to-width ... width` — **(c) already basic**; Lesson 187's own
  function, catching whatever extra leading digit the addition produced.

Trace `twos-complement` on `(pad-to-width (decimal->binary 1) 4)` —
`(0 0 0 1)` — the ordinary four-bit pattern for `1`:

```
ones-complement (0 0 0 1) → map flip-bit → (1 1 1 0)
pad-to-width (list 1) 4 → (0 0 0 1)
ripple-add (1 1 1 0) (0 0 0 1) → (1 1 1 1)     (full ripple trace below)
truncate-to-width (1 1 1 1) 4 → (1 1 1 1)      (already exactly 4 digits)
```

The `ripple-add` step itself, position by position (least-significant
first, same convention as every trace since Lesson 186):

```
Position 1: 0+1, carry-in 0 → full-adder 0 1 0 → sum 1, carry 0
Position 2: 1+0, carry-in 0 → full-adder 1 0 0 → sum 1, carry 0
Position 3: 1+0, carry-in 0 → full-adder 1 0 0 → sum 1, carry 0
Position 4: 1+0, carry-in 0 → full-adder 1 0 0 → sum 1, carry 0
```

`twos-complement (0 0 0 1) 4` is `(1 1 1 1)` — every position of `ones-
complement`'s `(1 1 1 0)` added `1`'s own pattern cleanly, with no carry
ever propagating past its own position, since flipping every bit of `1`
left nothing that could carry into the next one.

### CS Lens

"Flip every bit, then add one" is not just this lesson's own derivation —
it is a real, named hardware operation.

```
Also recognized in: a real CPU's NEG (negate) instruction, implemented
in hardware as exactly this flip-then-increment sequence; the actual
Internet checksum algorithm (used in IPv4 and TCP headers), which is
defined directly in terms of ones' complement arithmetic; and modular
additive inverses generally (Lesson 54) — two's complement negation is,
underneath the bit-level mechanics, the additive inverse modulo 2^width
```

### SE Lens

An alternative was available: precompute a lookup table mapping every
possible bit pattern directly to its negation, for some fixed width,
instead of deriving the negation algebraically every time. A table gives
an instant, single lookup per negation, but its size grows exponentially
with the width — a `32`-bit table would need over four billion entries —
and a completely separate table would be needed for every different word
width a program might use. The flip-and-add approach built here costs a
handful of gate-delays worth of real computation per negation, but works
identically for any width, using the exact same adder already verified in
Lesson 186 — the same compute-versus-precompute tradeoff this curriculum
has already named elsewhere, here settled decisively in favor of
computing it, because the alternative's memory cost scales far worse than
the computation's time cost.

---

## Concept Unit: Verifying the Payoff — Addition Just Works

### The Problem

Lesson 187 promised that this scheme would let `-1 + 1` be computed by
plain, unmodified addition. `twos-complement` produces a bit pattern; has
that promise actually been kept?

### Introduce the Concept in Isolation

Skipped — decoding a two's complement pattern back to a signed decimal
value reuses `first`, `binary->decimal`, and `twos-complement` itself, all
already covered; the real verification below is the substance of this
unit, not a separate lab.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `twos-complement`.
- **Dependencies**: Babashka, already installed.

### The New Code

Decoding checks the leading bit: `0` means the pattern is already an
ordinary unsigned value; `1` means it represents a negative number, whose
magnitude is found by negating the pattern back — applying
`twos-complement` a second time:

```clojure
(defn twos-complement->decimal
  [digits width]
  (if (= (first digits) 0)
    (binary->decimal digits)
    (- 0 (binary->decimal (twos-complement digits width)))))
```

### The Updated Project

This is a freestanding new function with nothing enclosing it yet —
Project Change already covers this case. The real payoff is checking it
against the exact failure Lesson 187 closed with — `-1`'s pattern added to
`1`'s pattern, through `ripple-add`, completely unmodified:

```clojure
(ripple-add (list 1 1 1 1) (list 0 0 0 1))
```

### Mechanical Walkthrough

Enumerating `twos-complement->decimal`'s body:

- `(= (first digits) 0)` — **(c) already basic**; reads the leading bit,
  the same position sign-magnitude reserved in Lesson 187 — but here
  nothing was *reserved*, the leading bit just happens to be `1` whenever
  `twos-complement` produced a pattern representing a negative value.
- `(- 0 (binary->decimal (twos-complement digits width)))` — **(a) first
  appearance**: negating a decoded value by first re-applying
  `twos-complement` to the *pattern*, not by flipping the sign of an
  already-decoded number — a genuinely new use of the function just built,
  applying it a second time to reverse its own effect.

Trace `twos-complement->decimal` on `(1 1 1 1)`, this unit's own
`twos-complement 1`'s output from the first unit:

```
(first (1 1 1 1)) → 1, so this pattern is negative
twos-complement (1 1 1 1) 4 → (0 0 0 1)     (traced below)
binary->decimal (0 0 0 1) → 1
(- 0 1) → -1
```

The inner `twos-complement (1 1 1 1) 4` trace: `ones-complement (1 1 1
1)` flips every bit to `(0 0 0 0)`; adding `1`'s pattern to an all-zero
pattern, position by position, never produces a carry, so `ripple-add`
returns `(0 0 0 1)` directly, and `truncate-to-width` leaves it untouched
at exactly four digits. `twos-complement->decimal (1 1 1 1) 4` correctly
returns `-1` — applying two's complement to its own output undoes it,
recovering the original magnitude.

Now the real payoff, `ripple-add` on `-1`'s and `1`'s patterns directly,
with no sign-aware logic anywhere in `ripple-add` itself — traced position
by position, least-significant first:

```
Position 1: 1+1, carry-in 0 → full-adder 1 1 0 → sum 0, carry 1
Position 2: 1+0, carry-in 1 → full-adder 1 0 1 → sum 0, carry 1
Position 3: 1+0, carry-in 1 → full-adder 1 0 1 → sum 0, carry 1
Position 4: 1+0, carry-in 1 → full-adder 1 0 1 → sum 0, carry 1
Base case: carry 1, digits (0 0 0 0) → cons 1 → (1 0 0 0 0)
```

`ripple-add` returns `(1 0 0 0 0)` — five digits, one more than the
four-bit width both inputs actually live in. `(truncate-to-width (1 0 0 0
0) 4)` drops that extra leading digit — the same overflow mechanism
Lesson 187 built, here discarding exactly the bit that a real four-bit
register physically has nowhere to put — leaving `(0 0 0 0)`.
`binary->decimal (0 0 0 0)` is `0`. `-1 + 1`, computed by an adder that
has never once been told anything about signs, is `0`. Lesson 187's
promise is kept.

### CS Lens

The property just verified — one shared, unmodified adder correctly
handling both unsigned and signed addition — is the actual, historical
reason two's complement won out over every alternative.

```
Also recognized in: real CPU ALUs, which use exactly one adder circuit
for both addition and subtraction of signed integers, specifically
because of this property; subtraction itself, implementable in any two's
complement system as "negate the second operand, then add," needing no
separate subtractor circuit at all — precisely the alternative Lesson
186's own SE Lens named as what real hardware actually ships; and modular
arithmetic's additive inverse (Lesson 54) guaranteeing, by definition,
that a value plus its inverse always returns to zero within a fixed
modulus
```

### SE Lens

The two historically real alternatives — sign-magnitude (Lesson 187) and
plain ones' complement (without the final increment; this lesson's
closing section shows exactly what goes wrong) — both need real, extra
correction logic wired into their adders to handle signs correctly:
sign-magnitude needs dedicated sign-comparison logic before addition even
starts, and ones' complement famously needs an "end-around carry"
correction step added back into the result afterward. Two's complement's
real advantage, verified directly above, is that it needs neither — the
exact adder already fully built and verified in Lesson 186, with not one
line changed, already does the right thing. That is the actual, documented
reason two's complement, not either alternative, became the near-universal
standard in real hardware.

---

## Concept Unit: The Asymmetric Range

### The Problem

Sign-magnitude's real flaw, from Lesson 187, was one wasted bit pattern —
two different four-bit patterns both decoded to zero. Two's complement
just avoided any special-casing in addition; does it also avoid that
waste, and if every pattern is now used for a distinct value, what range
of values does a four-bit two's complement register actually cover?

### Introduce the Concept in Isolation

Skipped — this unit only runs `twos-complement->decimal`, already built
and verified in the second unit, on two new boundary inputs; nothing
syntactic is new.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script; no new
  functions, only new inputs to `twos-complement->decimal`.
- **Change type**: N/A — this unit verifies existing code against new
  inputs rather than adding any.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

The largest positive four-bit two's complement pattern has its leading
bit `0` and every other bit `1`:

```clojure
(twos-complement->decimal (list 0 1 1 1) 4)
```

### The Updated Project

Skipped — no enclosing file exists yet; this and the pattern below are
standalone calls at the `bb` REPL, not a defined function.

### Mechanical Walkthrough

`(twos-complement->decimal (list 0 1 1 1) 4)`: the leading bit is `0`, so
this takes the direct branch — `binary->decimal (0 1 1 1)`, Horner's
method giving `1`, then `3`, then `7`. The largest positive value four
bits can hold in two's complement is `7` — the same as `max-unsigned 3`
from Lesson 187, since three bits' worth of magnitude is all a positive
two's complement value ever gets to use once the leading bit is
reserved for `0`.

Now the smallest — most negative — pattern, leading bit `1` and every
other bit `0`:

```clojure
(twos-complement->decimal (list 1 0 0 0) 4)
```

The leading bit is `1`, so this takes the negation branch:
`twos-complement (1 0 0 0) 4` first computes `ones-complement (1 0 0 0)`,
flipping every bit to `(0 1 1 1)`, then adds `1`'s pattern:

```
Position 1: 1+1, carry-in 0 → full-adder 1 1 0 → sum 0, carry 1
Position 2: 1+0, carry-in 1 → full-adder 1 0 1 → sum 0, carry 1
Position 3: 1+0, carry-in 1 → full-adder 1 0 1 → sum 0, carry 1
Position 4: 0+0, carry-in 1 → full-adder 0 0 1 → sum 1, carry 0
```

`ripple-add` returns `(1 0 0 0)` — four digits, no overflow this time —
and `truncate-to-width` leaves it unchanged. `twos-complement (1 0 0 0)
4` is `(1 0 0 0)` — the same pattern that went in. `binary->decimal (1 0 0
0)` is `8`, so `twos-complement->decimal (1 0 0 0) 4` returns `-8`.

Four bits, sixteen total patterns, and every one of them now decodes to a
genuinely distinct value from `-8` through `7` — fifteen negative-through-
positive values plus zero, sixteen values for sixteen patterns, with none
wasted the way sign-magnitude's double zero was. But the range itself is
not symmetric: `-8` is representable and `+8` is not — the most negative
value, `(1 0 0 0)`, negates back to *itself*, not to a distinct positive
`8`, because `8` itself needs a full four bits of magnitude that a
positive two's complement value, with its leading bit forced to `0`,
never has room for.

### CS Lens

Two's complement's asymmetric range, and its one value with no positive
counterpart, is a real, well-documented property of every signed integer
type built this way.

```
Also recognized in: real signed integer types across every mainstream
language and architecture (an 8-bit signed integer's actual range is
-128 to 127, not -127 to 127); the well-known real bug class where
`abs(INT_MIN)` in C either silently returns the same negative value or is
undefined behavior, because negating the minimum representable value
overflows exactly the way this unit just demonstrated by hand; and
overflow-checking code in real compilers and static analyzers, which has
to special-case exactly this one value
```

### SE Lens

Sign-magnitude's symmetric range (`-7` to `7` in four bits) and two's
complement's asymmetric one (`-8` to `7`) is a real, already-settled
tradeoff, not an oversight. Every mainstream architecture accepted two's
complement's odd, asymmetric edge case — one negative value with no
positive counterpart, a genuinely surprising fact to a reader meeting it
for the first time — in exchange for a much larger, already-verified win:
zero wasted bit patterns, and one shared, unmodified adder for both
addition and subtraction (this lesson's second unit). The single-value
asymmetry is a narrow, well-understood, well-documented edge case; the
alternative it was traded against was a doubled-up hardware cost paid on
every single addition or subtraction a chip would ever perform.

---

## Connect the Pieces

Follow `1` and `-1` through every function in this lesson and back to
Lesson 187's own unresolved problem. `(pad-to-width (decimal->binary 1)
4)` gives `1`'s ordinary pattern, `(0 0 0 1)`. `(twos-complement (0 0 0
1) 4)` — built from `not-gate` (Lesson 185), `map` (Lesson 25), and
Lesson 186's own `ripple-add` — gives `(1 1 1 1)`, verified directly by
`twos-complement->decimal` to decode back to `-1`. Feeding both patterns
into `ripple-add` exactly as-is — the identical function from Lesson 186,
not one line changed since it was written — and truncating the result to
four bits with Lesson 187's own `truncate-to-width` gives `(0 0 0 0)`:
`-1 + 1 = 0`, computed by hardware that was never told anything about
signs at all. Every one of this section's five lessons so far — bits,
gates, adders, fixed-width registers, and now two's complement — is a
single load-bearing link in that one chain.

## What Breaks Without This

The whole derivation hinges on the "plus one" — ones' complement alone,
without it, is *not* the same thing as two's complement. Prove it: negate
`1` using only `ones-complement`, skipping the increment entirely, and add
it to `1`'s own pattern with the unmodified `ripple-add`:

```clojure
(ripple-add (ones-complement (list 0 0 0 1)) (list 0 0 0 1))
```

`(ones-complement (0 0 0 1))` is `(1 1 1 0)`. Trace the addition,
least-significant first:

```
Position 1: 0+1, carry-in 0 → full-adder 0 1 0 → sum 1, carry 0
Position 2: 1+0, carry-in 0 → full-adder 1 0 0 → sum 1, carry 0
Position 3: 1+0, carry-in 0 → full-adder 1 0 0 → sum 1, carry 0
Position 4: 1+0, carry-in 0 → full-adder 1 0 0 → sum 1, carry 0
```

`ripple-add` returns `(1 1 1 1)` — no overflow this time, so
`truncate-to-width` would leave it untouched. `binary->decimal (1 1 1 1)`
is `15`, not `0`. Ones' complement alone gives `1 + "negative one"` a
result of `15` — all bits set, not the all-zero pattern a true additive
inverse requires. The missing `+1` is not a cosmetic finishing touch; it's
the one step that turns "every bit flipped" (which only guarantees the
result of adding a number to its flip is always exactly `2^width - 1`,
all ones) into "the actual additive inverse" (which requires landing on
`0`, one past all ones — exactly what carries `2^width - 1` over into
`2^width`, which is `0` once it overflows a fixed width). Restoring the
increment in `twos-complement`'s own definition is what closes that
one-off gap.

## Exercises

1. Trace `twos-complement->decimal` by hand on `(1 1 1 1)` and `(0 0 0
   0)`, and explain in one sentence why `(0 0 0 0)` is the one pattern
   where it doesn't matter which branch of the `if` runs.
2. Using `twos-complement->decimal`, decode `(1 1 0 1)` and `(0 1 0 1)` by
   hand, the same way this lesson decoded `(1 0 0 0)` and `(0 1 1 1)`.
3. This lesson's third unit showed `(1 0 0 0)` negates back to itself.
   Trace `twos-complement` on every *other* pattern with a leading `1` in
   four bits — `(1 0 0 1)` through `(1 1 1 1)` — and confirm each one
   negates to a genuinely different, positive pattern, unlike `(1 0 0 0)`.

## Definition of Done

- [ ] `flip-bit`, `ones-complement`, and `twos-complement` are written and
      hand-traced for `1`'s four-bit pattern, matching this lesson's
      worked trace of `(1 1 1 1)`.
- [ ] `twos-complement->decimal` is written and confirmed to decode
      `(1 1 1 1)` as `-1` and `(0 0 0 1)` as `1`.
- [ ] The `-1 + 1 = 0` verification, using unmodified `ripple-add` and
      `truncate-to-width`, is understood well enough to explain, without
      notes, why no sign-specific logic was needed anywhere in that
      addition.
- [ ] The asymmetric range (`-8` to `7` in four bits) and the one
      no-positive-counterpart value are understood well enough to state,
      without notes, why `(1 0 0 0)` negates back to itself.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why ones' complement alone lands on `15`
      instead of `0`.
- [ ] Commit with a message explaining *why* two's complement needs no
      changes to `ripple-add` at all, not just *what* functions were
      added.
