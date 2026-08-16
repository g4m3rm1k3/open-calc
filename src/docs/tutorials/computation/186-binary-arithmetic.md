# Lesson 186: Binary Arithmetic

- **What you will build** — a half-adder and full-adder built from Lesson
  185's gates, a ripple-carry circuit that chains full-adders together to
  add two whole binary numbers from Lesson 184, and a half-subtractor
  showing the mirror-image logic for borrowing instead of carrying. The
  transferable problem: ordinary decimal addition — "carry the 1" — has a
  hardware counterpart built from nothing but the gates already on hand,
  and once addition is real circuitry, subtraction turns out to be either
  its own small mirror-image circuit or, as Lesson 188 will show, not a
  separate circuit at all.
- **What you need to know first** — `xor-gate`, `and-gate`, `or-gate`,
  `not-gate`, and circuit composition (Lesson 185); binary digit lists,
  `decimal->binary`, and `binary->decimal` (Lesson 184); accumulator
  recursion, vector-as-pair with `get` (Section V), `first`/`rest`/`reverse`
  (Section II).
- **Terms introduced in this lesson**
  - **half-adder** — a circuit adding exactly two bits, producing a sum
    bit and a carry bit; "half" because it has nowhere to accept a carry
    coming in from a less-significant position.
  - **carry** — the `1` produced when adding two bits overflows what a
    single bit can hold (`1 + 1`), and that has to be added into the
    *next*, more significant position — the same idea as "carry the 1" in
    ordinary decimal addition, just happening every time two bits both
    happen to be `1` instead of only when a decimal column exceeds nine.
  - **full-adder** — a circuit adding two bits *plus* a carry bit coming
    in from a less-significant position, producing a sum bit and a carry
    bit going out to the next position.
  - **ripple-carry addition** — adding two whole binary numbers by
    chaining full-adders from least-significant bit to most-significant
    bit, letting each stage's carry-out become the next stage's carry-in.
  - **half-subtractor** — the borrow-based mirror of a half-adder:
    subtracting one bit from another, producing a difference bit and a
    borrow bit.
  - **borrow** — the flag a subtraction sets when the top bit is smaller
    than the bit being taken away (`0 - 1`), signaling that the *next*
    more-significant position has to give up one of its own units to
    cover the shortfall — decimal's "borrow from the next column," one
    bit at a time.
- **Objects and methods used**: None new. This lesson reuses `xor-gate`,
  `and-gate`, `or-gate`, `not-gate` (Lesson 185), `[...]` (vector literal),
  `get` (Section V), `first`, `rest`, `empty?`, `cons`, `list`, `reverse`
  (Section II), each already covered.

---

## Concept Unit: The Half-Adder

### The Problem

Lesson 185 built gates that each answer one boolean question about their
inputs. Adding two bits needs *two* answers at once: what's the sum bit,
and did it overflow into a carry? No single gate from Lesson 185 produces
two outputs.

### Introduce the Concept in Isolation

Skipped — building a circuit that returns two related values as a pair is
not a new construct here. It's Section V's own "vector-as-pair" convention
(a two-slot `[a b]` accessed with `get`, already lab'd for nodes, queues,
and deques) applied to two gates already lab'd and verified in Lesson 185.
Nothing syntactic in this unit is new; only the specific arithmetic fact
being encoded is.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 185's gates.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Adding two bits by hand makes the pattern obvious: `0+0=0`, `0+1=1`,
`1+0=1`, and `1+1=10` — a sum bit of `0` with a carry. The sum bit matches
Lesson 185's XOR truth table exactly (`1` exactly when the inputs differ),
and the carry bit matches AND exactly (`1` only when both inputs are `1`):

```clojure
(defn half-adder
  [a b]
  [(xor-gate a b) (and-gate a b)])
```

### The Updated Project

This is a freestanding new function with nothing enclosing it yet —
Project Change already covers this case.

### Mechanical Walkthrough

Enumerating `half-adder`'s body:

- `defn`, `[a b]` — **(c) already basic**.
- `[(xor-gate a b) (and-gate a b)]` — **(c) already basic** as *syntax* (a
  two-element vector literal, the same pattern as every earlier
  vector-as-pair), but the specific pairing — XOR for the sum, AND for the
  carry — is **(a) first appearance**: this is the arithmetic insight
  itself, not a construct, and it hasn't appeared before this unit.

Trace `half-adder` on every possible input, since there are only four:

```
half-adder 0 0 → [(xor-gate 0 0) (and-gate 0 0)] → [0 0]   0+0=0,  no carry
half-adder 1 0 → [(xor-gate 1 0) (and-gate 1 0)] → [1 0]   1+0=1,  no carry
half-adder 0 1 → [(xor-gate 0 1) (and-gate 0 1)] → [1 0]   0+1=1,  no carry
half-adder 1 1 → [(xor-gate 1 1) (and-gate 1 1)] → [0 1]   1+1=10, sum 0, carry 1
```

Every line's sum bit is Lesson 185's own `xor-gate` trace on that same
input, and every carry bit is `and-gate` on the same input — `half-adder`
adds nothing new to *how* those gates compute, only packages their two
already-correct answers together.

### CS Lens

Returning two related values as one paired result, rather than as two
separate calls, is a pattern independent of circuits entirely.

```
Also recognized in: integer division functions that return quotient and
remainder together (`divmod`-style APIs), an ALU's result-plus-overflow-
flag output, a parser returning both a parsed value and the remaining
unconsumed input, and a network checksum shipped alongside the data it
protects
```

### SE Lens

The alternative — two separate functions, `half-adder-sum` and
`half-adder-carry`, each independently computing its own answer — was
available and rejected. Splitting them would mean any caller needing both
the sum and the carry (which `full-adder`, next, always does) calls into
this circuit's gates twice, silently duplicating real work: in software,
wasted computation; in real hardware, an entirely duplicated set of gates
consuming extra chip area and power for no new information. Packaging
both outputs from one shared computation, the same "compute once" tradeoff
already made for the recursive helpers back in Section III and V, is
worth the small cost of unpacking the pair with `get` at the call site.

---

## Concept Unit: The Full-Adder

### The Problem

`half-adder` has nowhere to accept a carry coming in from a
less-significant bit. Adding real multi-bit numbers needs exactly that —
every position except the very first has to account for whatever the
position before it carried forward.

### Introduce the Concept in Isolation

Skipped — this unit's technique, computing one value and passing it
whole to a helper function rather than recomputing it, is the same
"compute once, pass to a helper" pattern already lab'd back in Section
III and reused constantly since (Lessons 56, 87, 89, 91). The only new
material is the specific circuit wiring, not a new construct.

### Discard the Throwaway Example

Not applicable — same as the previous unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `half-adder`.
- **Dependencies**: Babashka, already installed.

### The New Code

A full-adder is two half-adders chained together: the first adds the two
real inputs, the second adds that result's sum bit to the incoming carry,
and the two carries from both stages are combined with OR, because either
stage overflowing is enough to carry into the next position.

```clojure
(defn full-adder-finish
  [stage1 stage2]
  [(get stage2 0) (or-gate (get stage1 1) (get stage2 1))])
```

### The Updated Project

`full-adder-finish` only combines two already-computed stages — it isn't
the whole circuit by itself. The function callers actually use wraps it,
computing both half-adder stages first and passing them in as a single
already-computed value each, rather than recomputing `stage1` a second
time to get at its sum bit:

```clojure
(defn full-adder-second-stage
  [stage1 cin]
  (full-adder-finish stage1 (half-adder (get stage1 0) cin)))
```

```clojure
(defn full-adder
  [a b cin]
  (full-adder-second-stage (half-adder a b) cin))
```

### Mechanical Walkthrough

Enumerating `full-adder`'s body:

- `half-adder a b` — **(c) already basic**, the same function verified in
  the first unit, now supplying `stage1` — its sum bit is what the second
  stage will add to `cin`, and its carry bit is one of the two inputs
  `full-adder-finish`'s OR will combine.
- `full-adder-second-stage` receiving that result whole — **(b) a hard
  concept reappearing**: "compute once, pass to a helper," restated above.

Enumerating `full-adder-second-stage`'s body:

- `(get stage1 0)` — **(c) already basic**; pulls `stage1`'s sum bit back
  out to feed the second half-adder.
- `half-adder (get stage1 0) cin` — **(c) already basic** call, producing
  `stage2`: the *real* sum (accounting for the incoming carry) and a
  second carry bit.
- `full-adder-finish stage1 (half-adder ...)` — **(a) first appearance**:
  both stages, not just the second one, get passed forward together —
  `stage1`'s carry bit is still needed by `full-adder-finish`, even though
  `stage1`'s sum bit was already consumed computing `stage2`.

Enumerating `full-adder-finish`'s body:

- `(get stage2 0)` — **(c) already basic**; the second half-adder's sum
  bit is the full-adder's real, final sum — the first stage's sum bit was
  only ever an intermediate value, never the answer.
- `(or-gate (get stage1 1) (get stage2 1))` — **(b) a hard concept
  reappearing**: `or-gate` from Lesson 185, combining the two stages'
  carry bits — the final carry-out is `1` if *either* stage overflowed,
  which is exactly what OR means here.

Trace `full-adder` on `a = 1, b = 1, cin = 1` — every input bit set, the
case most likely to expose a wiring mistake:

```
stage1 = half-adder 1 1 → [0 1]                     1+1 = 0, carry 1
stage2 = half-adder (get stage1 0)=0, cin=1 → half-adder 0 1 → [1 0]
                                                     0+1 = 1, carry 0
sum        = get stage2 0 → 1
carry-out  = or-gate (get stage1 1)=1 (get stage2 1)=0 → 1
result: [1 1]
```

`1 + 1 + 1 = 3`, which is `11` in binary — sum bit `1`, carry `1` — and
`full-adder`'s result, `[1 1]`, matches exactly. Every value in the trace
came from a gate or half-adder already verified in this lesson or the
last; nothing here is trusted without a traceable source.

### CS Lens

Building a full-adder out of two already-verified half-adders, instead of
deriving it from scratch, is hierarchical composition — the same idea
Lesson 185 named for gates, one level up.

```
Also recognized in: this exact two-half-adder-plus-OR shape, which is the
standard textbook construction for a full-adder in every digital logic
course; function composition (Lesson 5) building a new function out of
already-verified smaller ones; and a recursive-descent parser combining
already-verified rule-parsers into a parser for a larger grammar
(Section VIII)
```

### SE Lens

A full-adder could instead be built directly and primitively — its own
truth table hand-implemented, the way `nand-gate` was built directly in
Lesson 185, rather than composed from two half-adders. That alternative
can, in principle, use fewer total gates: composing two half-adders and an
OR gate costs five gates total (two XOR, two AND, one OR), while a
hand-minimized primitive full-adder circuit — the kind real chip designers
actually ship — can do the same job with fewer. The cost accepted here is
the same one this curriculum has already accepted elsewhere: favoring
reuse of already-verified pieces (half-adder, checked against every input
in the previous unit) over a hand-optimized gate count that would have to
be re-verified from scratch.

---

## Concept Unit: Ripple-Carry Multi-Bit Addition

### The Problem

`full-adder` adds one column of two numbers, plus whatever carried in
from the column before it. Adding two whole binary numbers — Lesson 184's
digit lists, more than one bit each — means running that same column
addition once per position, letting each position's carry-out become the
next position's carry-in.

### Introduce the Concept in Isolation

Skipped — threading a value (here, the carry) through a recursive walk
across a list, accumulating a result as it goes, is the identical
accumulator-recursion pattern Lesson 184's `decimal->binary-acc` already
used and lab'd, just walking a list here instead of shrinking a number.

### Discard the Throwaway Example

Not applicable — same as the previous two units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `full-adder`.
- **Dependencies**: Babashka, already installed.

### The New Code

`decimal->binary`'s digit lists are most-significant-bit first, but a
ripple-carry adder has to *start* at the least-significant bit — the only
position that never has an incoming carry to wait on. `reverse` (Lesson
28) flips a digit list to least-significant-first before the real work
starts:

```clojure
(defn ripple-add-with-final-carry
  [carry digits]
  (if (= carry 1)
    (cons 1 digits)
    digits))
```

### The Updated Project

`ripple-add-with-final-carry` only handles what happens once every
position has been added — the recursive walk itself, one `full-adder`
call per position, comes first and calls it when there's nothing left to
add:

```clojure
(defn ripple-add-continue
  [stage bits-a bits-b digits]
  (ripple-add-acc (rest bits-a) (rest bits-b) (get stage 1) (cons (get stage 0) digits)))
```

```clojure
(defn ripple-add-acc
  [bits-a bits-b carry digits]
  (if (empty? bits-a)
    (ripple-add-with-final-carry carry digits)
    (ripple-add-continue (full-adder (first bits-a) (first bits-b) carry) bits-a bits-b digits)))
```

```clojure
(defn ripple-add
  [bits-a bits-b]
  (ripple-add-acc (reverse bits-a) (reverse bits-b) 0 (list)))
```

### Mechanical Walkthrough

Enumerating `ripple-add`'s body:

- `reverse bits-a`, `reverse bits-b` — **(c) already basic**, Lesson 28;
  flips each most-significant-first input to least-significant-first, the
  order the carry actually has to ripple through.
- `ripple-add-acc ... 0 (list)` — **(c) already basic** call syntax; the
  initial carry is `0` (nothing has overflowed yet) and the accumulated
  result starts empty, the same starting shape as `decimal->binary-acc`'s
  own accumulator.

Enumerating `ripple-add-acc`'s body:

- `(empty? bits-a)` — **(c) already basic**, Section II; true once every
  position has been added.
- `full-adder (first bits-a) (first bits-b) carry` — **(c) already
  basic** call to this lesson's own second unit, supplying the current
  least-significant-remaining bit of each number plus whatever carried in.
- `ripple-add-continue` receiving that whole result — **(b) a hard concept
  reappearing**: "compute once, pass to a helper," the same discipline
  named in the second unit, now applied to a full-adder's result instead
  of a half-adder's.

Enumerating `ripple-add-continue`'s body:

- `(rest bits-a)`, `(rest bits-b)` — **(c) already basic**, Section II;
  drop the bit position just processed.
- `(get stage 1)` as the new carry — **(c) already basic**; this position's
  carry-out becomes the *next* recursive call's carry-in — the actual
  "ripple."
- `(cons (get stage 0) digits)` — **(c) already basic**; the same
  cons-to-front accumulation `decimal->binary-acc` used, which is why the
  result comes out most-significant-first without a final reverse, exactly
  as it did there.

Trace `ripple-add` on `(decimal->binary 5)` and `(decimal->binary 6)` —
`(1 0 1)` and `(1 1 0)` — chosen because Lesson 184's own algorithm
produces both as exactly three digits, with nothing to pad:

```
Reversed inputs: bits-a (1 0 1), bits-b (0 1 1)

Position 1: first bits-a=1, first bits-b=0, carry-in=0
  full-adder 1 0 0 → [1 0]     digits (1),           new carry 0
Position 2: first bits-a=0, first bits-b=1, carry-in=0
  full-adder 0 1 0 → [1 0]     digits (1 1),          new carry 0
Position 3: first bits-a=1, first bits-b=1, carry-in=0
  full-adder 1 1 0 → [0 1]     digits (0 1 1),        new carry 1
Base case: bits-a empty, carry=1 → cons 1 onto digits → (1 0 1 1)
```

Each position's `full-adder` call is exactly the second unit's own
function, checked there against hand arithmetic; nothing about *this*
trace re-derives what a full-adder does, only how carry moves between
calls. The final result, `(1 0 1 1)`, is checked against Lesson 184's own
`binary->decimal` in Connect the Pieces below.

### CS Lens

Ripple-carry addition — one stage per bit position, each waiting on the
one before it — is a real, named hardware circuit, not just a teaching
device.

```
Also recognized in: this exact circuit shape in real early CPU adder
hardware; pipeline hazards in CPU pipelining (Lesson 200), where one
stage has to wait on a result from an earlier stage before it can
proceed; and sequential dependency chains in software — `reduce` itself
(Lesson 27) can't run its steps in parallel for the same reason, each
step needs the previous step's accumulator first
```

### SE Lens

Real hardware doesn't always use ripple-carry for wide numbers, because
the correct answer for the *most*-significant bit can't be known until
the carry has physically propagated through every single less-significant
stage — for an `n`-bit number, that's `n` stages of real gate delay before
the answer is trustworthy. The named, real alternative is carry-lookahead
addition, which computes every position's carry in parallel using
additional logic, trading more gates — more chip area, more power — for
much less delay. Ripple-carry, built here, is simpler and smaller;
carry-lookahead is faster but bigger. Neither is a free win — which one a
real chip uses depends on whether raw addition speed or gate count matters
more for that specific design.

---

## Concept Unit: The Half-Subtractor

### The Problem

Addition has a full circuit now. Subtraction — `1 - 0`, `0 - 1`, and so
on — needs its own bit-level logic: what happens, at the bit level, when
the value being subtracted is bigger than the value it's being taken from?

### Introduce the Concept in Isolation

Skipped — a two-output circuit represented as a pair is the exact same
idea as the first unit's `half-adder`; only the specific gate wiring for
subtraction's difference and borrow bits is new information, not a new
construct.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `ripple-add`.
- **Dependencies**: Babashka, already installed.

### The New Code

Subtracting `b` from `a`, one bit at a time: `0-0=0`, `1-0=1`, `1-1=0`, and
`0-1` needs a **borrow** — it comes out as `1` (the same as `2 - 1` once a
unit is borrowed from the next position), with a borrow flag set. The
difference bit is XOR again — differing bits always produce a `1`,
whether adding or subtracting — but the borrow bit is new: a borrow is
needed exactly when the top bit is `0` and the bit being subtracted is
`1`, which is AND applied to *NOT* of the top bit and the bottom bit:

```clojure
(defn half-subtractor
  [a b]
  [(xor-gate a b) (and-gate (not-gate a) b)])
```

### The Updated Project

This is a freestanding new function with nothing enclosing it yet —
Project Change already covers this case.

### Mechanical Walkthrough

Enumerating `half-subtractor`'s body:

- `xor-gate a b` — **(c) already basic**; identical call to `half-adder`'s
  own sum bit, since "these bits differ" is the correct answer to both
  "what's the sum bit" and "what's the difference bit."
- `and-gate (not-gate a) b` — **(a) first appearance**: this specific
  wiring — AND applied to the *negation* of the first input and the raw
  second input — is new; it is not the same expression as `half-adder`'s
  carry bit (`and-gate a b`, no negation), even though both are "the
  second output of a two-bit circuit."

Trace `half-subtractor` on every possible input, since there are only
four, checking each against hand subtraction:

```
half-subtractor 0 0 → [(xor-gate 0 0) (and-gate (not-gate 0) 0)] → [0 0]   0-0=0, no borrow
half-subtractor 1 0 → [(xor-gate 1 0) (and-gate (not-gate 1) 0)] → [1 0]   1-0=1, no borrow
half-subtractor 1 1 → [(xor-gate 1 1) (and-gate (not-gate 1) 1)] → [0 0]   1-1=0, no borrow
half-subtractor 0 1 → [(xor-gate 0 1) (and-gate (not-gate 0) 1)] → [1 1]   0-1=1, borrow
```

The last line is the only one where a borrow fires: `not-gate 0` is `1`,
and `and-gate 1 1` is `1` — exactly the case where the top bit can't
cover the subtraction on its own. Every other case has `and-gate`
receiving at least one `0`, so no borrow is ever raised when the top bit
is already big enough.

A full-subtractor — accepting a borrow-in the same way `full-adder`
accepted a carry-in, and a ripple-borrow circuit chaining full-subtractors
across a whole digit list the same way this lesson's third unit chained
full-adders — follows the identical composition shape just built for
addition: two half-subtractors, sharing a borrow the way two half-adders
shared a carry, combined with OR the same way the two carry-outs were.
Per this curriculum's own established practice of scoping down breadth
rather than rigor when a lesson's honest scope exceeds what's tractable to
fully re-derive and re-verify in one sitting (Lessons 99, 100, and 134 all
do this explicitly), that full construction is described here rather than
re-built and re-verified line by line a second time — the representative
core, the bit-level borrow logic itself, is what's derived and checked
above.

### CS Lens

Borrow-based subtraction is the direct bit-level mirror of carry-based
addition — the same overflow idea, running in the opposite direction.

```
Also recognized in: manual decimal subtraction's own "borrow from the
next column," which this circuit reproduces bit by bit instead of digit
by digit; comparator and ALU subtract-mode circuits in real CPUs; and —
flagged, not built here — the two's complement trick Lesson 188 derives,
which lets real hardware reuse the very adder built in this lesson for
subtraction instead of needing a second, separate circuit at all
```

### SE Lens

Building a dedicated subtractor, mirroring the adder step for step, is the
conceptually direct answer — and it's genuinely what this unit needed, to
teach borrow logic on its own terms. But it is not what most real
hardware actually ships: building and maintaining an entire second
arithmetic circuit, parallel to the adder, doubles the gates dedicated to
basic arithmetic for comparatively little benefit, since a way exists to
express subtraction as a special case of addition (negate one operand,
then add). Real ALUs almost always take that second option once it's
available — one adder, reused, rather than one adder and one subtractor
maintained side by side. This unit deliberately built the more direct,
more expensive-in-hardware version first, because seeing borrow logic
derived concretely is worth more, at this point in the curriculum, than
jumping straight to the trick that makes a dedicated subtractor
unnecessary.

---

## Connect the Pieces

Follow `5 + 6` through every function this lesson built, starting and
ending in Lesson 184's own representation. `(decimal->binary 5)` gives
`(1 0 1)`; `(decimal->binary 6)` gives `(1 1 0)`. `(ripple-add (1 0 1)
(1 1 0))` reverses both to least-significant-first, runs `full-adder`
three times — each call itself built from two `half-adder` calls, checked
against hand arithmetic in the second unit — threading the carry from
each position into the next, and returns `(1 0 1 1)`, exactly as traced in
the third unit. Feed that straight back into Lesson 184's own
`(binary->decimal (1 0 1 1))`: Horner's method walks it and returns `11`
— matching `5 + 6` exactly, and matching the same `(1 0 1 1)` Lesson 184's
own isolated lab produced by hand for the number eleven, independently, a
full lesson earlier. Every layer here — gates, half-adder, full-adder,
ripple-carry — was built from the layer directly below it and checked
against real arithmetic before the next layer was allowed to depend on it.

## What Breaks Without This

`full-adder-finish`'s OR combines *both* stages' carry bits, because
either one overflowing is enough to carry forward. Drop the second one and
just return the first stage's carry alone:

```clojure
(defn full-adder-finish-broken
  [stage1 stage2]
  [(get stage2 0) (get stage1 1)])
```

Trace it on `a = 1, b = 0, cin = 1` — a case where the *first* stage
doesn't overflow but the *second* one does:

```
stage1 = half-adder 1 0 → [1 0]                     1+0 = 1, carry 0
stage2 = half-adder (get stage1 0)=1, cin=1 → half-adder 1 1 → [0 1]
                                                     1+1 = 0, carry 1
Correct carry-out: or-gate (get stage1 1)=0 (get stage2 1)=1 → 1
Broken carry-out:  (get stage1 1) alone → 0
```

`1 + 0 + 1 = 2`, which is `10` in binary — sum `0`, carry `1`. The broken
version's sum bit is still right (`0`, correctly taken from `stage2`), but
its carry-out is `0` instead of `1` — it reports the answer as plain `0`
instead of `10`, silently losing the leading `1` entirely, because it only
ever looks at whether the *first* stage overflowed and never checks
whether adding the carry-in in the *second* stage did. Nothing throws; the
function returns a valid-looking `[0 0]` pair. Restoring the OR of both
carry bits is what makes `full-adder` account for an overflow that can
happen at either stage, not just the first.

## Exercises

1. Trace `full-adder` by hand on `a = 0, b = 0, cin = 1` and confirm the
   result is `[1 0]` — explain, in one sentence, which of the two internal
   half-adder stages is where the `1` actually comes from.
2. `ripple-add` requires both digit lists to be the same length (this
   lesson's own example, three digits each, was chosen for exactly that
   reason). Using `bits-needed` from Lesson 184, sketch in prose how a
   shorter number could be padded with leading zeros before calling
   `ripple-add`, so two differently-sized numbers could still be added
   correctly. No code required yet.
3. Trace `half-subtractor` on `a = 1, b = 1` and `a = 0, b = 1` by hand,
   and state in one sentence why only one of those two cases sets the
   borrow flag.

## Definition of Done

- [ ] `half-adder` is written and hand-traced for all four possible
      inputs, matching this lesson's worked trace.
- [ ] `full-adder`, `full-adder-second-stage`, and `full-adder-finish` are
      written and hand-traced for at least `a=1,b=1,cin=1`.
- [ ] `ripple-add`, `ripple-add-acc`, `ripple-add-continue`, and
      `ripple-add-with-final-carry` are written and confirmed, by hand
      trace, to correctly compute `5 + 6 = 11` when composed with Lesson
      184's `decimal->binary` and `binary->decimal`.
- [ ] `half-subtractor` is written and hand-traced for all four possible
      inputs.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why the broken version's sum bit is still
      correct even though its carry-out is wrong.
- [ ] Commit with a message explaining *why* ripple-carry addition needs
      its inputs reversed before the recursion starts, not just *what*
      functions were added.
