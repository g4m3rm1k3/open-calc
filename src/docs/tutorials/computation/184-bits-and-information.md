# Lesson 184: Bits and Information

- **What you will build** — three small, real functions: one that converts
  an ordinary decimal number into its binary digits, one that reconstructs
  the decimal number back out of those digits, and one that computes the
  minimum number of bits needed to distinguish any set of `n` possibilities.
  The transferable problem underneath all three: every number you have
  worked with in this entire curriculum has been written in base ten
  without a second thought, but "base ten" was always a choice, not a law
  of nature — and the specific choice a computer makes, base two, is the
  reason the word "bit" exists at all.
- **What you need to know first** — recursion with an accumulator (the
  pattern behind DFS traversal, Dijkstra's relax step, and every other
  state-threaded recursion since), `quot` and `mod` (integer division and
  remainder, from modular arithmetic), `reduce` (folding a sequence into
  one value), `cons` and `list` (building a list from the front), and `if`.
  Nothing here depends on Section VIII's interpreter — this section starts
  a fresh running example.
- **Terms introduced in this lesson**
  - **bit** — a single binary digit, `0` or `1`; short for "binary digit,"
    the smallest unit a computer's hardware can store or distinguish,
    because it only has to reliably tell two physical states apart (see the
    SE Lens below for why that specific number matters).
  - **radix (base)** — how many distinct digit symbols a number system
    uses before it has to "carry" into the next position; ten for the
    decimal system everyone already uses, two for binary.
  - **positional notation** — a number system where a digit's contribution
    to the total value depends on *where* it sits, not just which digit it
    is; the reason `137` isn't `1 + 3 + 7` is that each digit is silently
    multiplied by a power of the radix based on its position.
  - **digit-expansion reconstruction (Horner's method)** — rebuilding a
    number from its digits by repeatedly multiplying the running total by
    the radix and adding the next digit, instead of computing each
    positional power separately and summing them at the end.
  - **bits of information** — the minimum number of bits needed to give
    every one of `n` distinct possibilities its own unique bit pattern;
    the connection between "how many things am I choosing among" and "how
    much storage does that choice cost."
- **Objects and methods used**: None new. This lesson reuses `defn`, `if`,
  `=` (Lesson 6), `quot`, `mod` (modular arithmetic), `cons`, `list`
  (Lesson 24), `reduce` (Lesson 27), `+`, `*`, `>=`, each already covered.

---

## Concept Unit: Positional Notation and the Bit

### The Problem

Every number this curriculum has written so far — `137`, `52`, `0` — has
been decimal, base ten, without ever saying so, because it never had to be
said: it was the only base in the room. But nothing about the *number 137*
is inherently decimal. It's a quantity. Decimal is just one way — a human,
historical way, tied to having ten fingers — of writing that quantity down
as a sequence of digit symbols. A computer's hardware can't reliably
distinguish ten voltage levels, but it can reliably distinguish two: on or
off, high or low. So before any of the rest of this curriculum's arithmetic
can run on real hardware, there has to be a base that only needs two
symbols. That's binary, and a single symbol in it is a bit.

### Introduce the Concept in Isolation

The idea that makes any of this work is **positional notation**: a digit's
value depends on where it sits, not just which digit it is. Make that
explicit for a number already familiar in base ten:

```clojure
(+ (* 1 100) (* 3 10) (* 7 1))
```

Run:

```
user=> (+ (* 1 100) (* 3 10) (* 7 1))
137
```

That output proves the digits `1`, `3`, `7` in `137` aren't just added —
each one is multiplied by a power of ten first: the `1` is worth
`1 × 10²`, the `3` is worth `3 × 10¹`, the `7` is worth `7 × 10⁰`. Ten is
the **radix**. Nothing in that arithmetic actually requires the radix to
be ten. Do the identical thing with radix two, treating `1`, `0`, `1`, `1`
as binary digits from most significant to least significant:

```clojure
(+ (* 1 8) (* 0 4) (* 1 2) (* 1 1))
```

Run:

```
user=> (+ (* 1 8) (* 0 4) (* 1 2) (* 1 1))
11
```

Same structure, different radix: `8`, `4`, `2`, `1` are `2³`, `2²`, `2¹`,
`2⁰` instead of powers of ten, and the digits `1 0 1 1` weighted that way
total `11`. This is **positional notation** in general, not a decimal-only
trick — decimal and binary are the same idea with a different radix
plugged in.

### Discard the Throwaway Example

Both expressions above were written by hand, one power at a time, purely
to make positional notation concrete. Neither survives past this point —
the real project code below computes the digits and the powers itself,
for any input, instead of having them typed in by hand.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because Section IX opens a new running example (binary
  representation) with nothing in an existing reference implementation to
  port from.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

The isolated lab above computed a binary expansion by hand because the
digits were already known. Going the other direction — starting from a
plain decimal number and producing its binary digits — needs the digits
peeled off one at a time. `mod n 2` gives the digit that has to sit in the
*current* position (whatever's left over after dividing by two), and
`quot n 2` gives whatever's left to keep expanding at the next position
up. Peel one digit off, recurse on the rest, and stop once nothing's left:

```clojure
(defn decimal->binary-acc
  [n digits]
  (if (= n 0)
    digits
    (decimal->binary-acc (quot n 2) (cons (mod n 2) digits))))
```

### The Updated Project

This is a freestanding new function with nothing enclosing it yet, so
there's no larger structure to show it inside — Project Change already
covers this case. One companion function wraps it to handle the one input
this recursion can't: zero itself, which would otherwise recurse into
`decimal->binary-acc 0 (list)` and immediately return the *empty* list
instead of a single `0` digit.

```clojure
(defn decimal->binary
  [n]
  (if (= n 0)
    (list 0)
    (decimal->binary-acc n (list))))
```

### Mechanical Walkthrough

Enumerating `decimal->binary-acc`'s body in order:

- `defn`, the parameter vector `[n digits]`, and `if` — **(c) already
  basic**, established since the earliest lessons.
- `(= n 0)` — **(c) already basic**; `=` was given full treatment back in
  Lesson 6 (Equality and Substitution) and has been reused constantly
  since.
- `digits` — **(c) already basic**, a plain parameter read; this is the
  base-case return value, whatever digits have accumulated so far.
- `quot n 2` — **(c) already basic**, integer division; central to this
  algorithm's whole idea, worth restating even though it's not new: it
  answers "how many groups of two are left once this position's digit is
  removed," which is exactly what has to feed the *next*, more-significant
  position.
- `mod n 2` — **(c) already basic**, the remainder; for a division by two
  specifically, the remainder can only ever be `0` or `1` — which is
  exactly why dividing repeatedly by the radix is what produces valid
  digits *for* that radix, no matter what the radix is.
- `cons (mod n 2) digits` — **(c) already basic**, `cons` prepends a value
  to the front of a list (Lesson 24).
- `decimal->binary-acc (quot n 2) (cons ...)` — **(b) a hard concept
  reappearing**: this is the same accumulator-passing recursion pattern
  used for DFS timestamps, Dijkstra's running distances, and every other
  piece of state threaded through a recursive walk since it was first
  named — here, the accumulator is the digit list built up so far, and the
  "current position" being processed is `n`.

Trace `decimal->binary-acc` on `n = 11`, since the isolated lab already
confirmed `1011` is the right answer to check against:

```
Call 1: n 11 → 5, digit (mod 11 2) = 1, digits (list) → (1)
Call 2: n 5 → 2,  digit (mod 5 2)  = 1, digits (1) → (1 1)
Call 3: n 2 → 1,  digit (mod 2 2)  = 0, digits (1 1) → (0 1 1)
Call 4: n 1 → 0,  digit (mod 1 2)  = 1, digits (0 1 1) → (1 0 1 1)
Call 5: n = 0, base case reached, return digits (1 0 1 1)
```

Each line's digit came from `mod`-ing the *current* `n` by two — the
least-significant digit still remaining — and `cons` put it in front of
whatever had already accumulated, which is why the *first* digit computed
(the least significant one) ends up at the *back* of the final list and
the *last* digit computed (most significant) ends up at the front: `cons`
always adds to the front, and significance grows as `n` shrinks toward
zero. The result, `(1 0 1 1)`, matches the isolated lab's `1011` exactly.

### CS Lens

Positional notation is not a decimal-specific or binary-specific idea —
it's a general pattern for representing quantity as a sequence of symbols
plus a fixed set of position weights.

```
Also recognized in: hexadecimal color codes and memory addresses,
IPv4 dotted-quad addressing (base 256 per position), floating-point's
exponent/mantissa split (later in this section), and — as a deliberate
non-example — Roman numerals, which are not positional at all (X always
means ten, no matter where it sits, which is exactly why arithmetic on
Roman numerals is so much harder than on positional digits)
```

### SE Lens

The real engineering decision here isn't "use positional notation" — it's
*which radix*. Base ten was never a serious hardware option: reliably
building and reading ten distinct voltage levels in the presence of
electrical noise is expensive and error-prone. Base two only needs a
circuit to distinguish *two* states, which can be done cheaply and with a
large safety margin between "on" and "off." The honest cost of that choice
is representation length: the binary expansion of a number takes roughly
3.3× as many digits as its decimal expansion (`52` is two decimal digits
but six binary digits, confirmed later in this lesson). That's a real,
accepted tradeoff — reliability and cost per digit, traded against needing
more digits — not a free win. (Base three was tried for real, not just
theoretically: the Soviet Setun computer used balanced ternary; it never
displaced binary, precisely because the reliability argument for two
states was stronger than ternary's density advantage.)

---

## Concept Unit: Reconstructing the Value

### The Problem

`decimal->binary` goes one direction: a plain number in, a list of binary
digits out. Given only the digit list back — say, from something that
stored or transmitted it — how is the original number recovered?

### Introduce the Concept in Isolation

The isolated lab in the first unit computed a binary value from digits by
finding each digit's power of the radix separately, then adding them all
at the end. That works, but it recomputes a fresh power of two from
scratch for every digit. There's a cheaper way to get the identical
answer: carry a running total, and at each digit, multiply the running
total by the radix *first*, then add the new digit. Do it by hand, in
base ten, reconstructing `137` from its digits `1`, `3`, `7`:

```clojure
(+ (* 1 10) 3)
```

Run:

```
user=> (+ (* 1 10) 3)
13
```

Continue the same step with the next digit, `7`, using `13` as the new
running total:

```clojure
(+ (* 13 10) 7)
```

Run:

```
user=> (+ (* 13 10) 7)
137
```

Two steps, each just "multiply the running total by the radix, then add
the next digit," reached `137` — the same answer the first unit's separate
power-of-ten sum would have given, without ever computing `10²` or `10¹`
directly. This incremental multiply-then-add technique is called
**Horner's method**.

### Discard the Throwaway Example

Both hand-typed steps above only existed to make Horner's method concrete
in a familiar radix. The real project code below applies the identical
technique to binary digits, generically, for any length of input.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `decimal->binary` and `decimal->binary-acc`.
- **Dependencies**: Babashka, already installed.

### The New Code

Horner's method needs one step function — multiply the running total by
two, add the next digit — and something to walk it across every digit in
order. That second part is exactly what `reduce` already does: apply a
two-argument function to a running value and each element of a sequence,
in order, keeping only the final result.

```clojure
(defn horner-step
  [acc digit]
  (+ (* acc 2) digit))
```

### The Updated Project

`horner-step` alone doesn't walk a whole digit list — it's the one-step
building block `reduce` needs. The function that actually reconstructs a
number wraps it:

```clojure
(defn binary->decimal
  [digits]
  (reduce horner-step 0 digits))
```

### Mechanical Walkthrough

Enumerating `horner-step`'s body:

- `defn`, `[acc digit]`, `+`, `*` — **(c) already basic**.
- `(* acc 2)` — **(c) already basic** arithmetic; this is the "shift the
  running total up one position" half of the technique — multiplying by
  the radix is what makes room for the next digit to land in the ones
  place.
- `(+ ... digit)` — **(c) already basic**; drops the new digit into the
  position `* acc 2` just made room for.

Enumerating `binary->decimal`'s body:

- `reduce horner-step 0 digits` — **(b) a hard concept reappearing**:
  `reduce` is the same fold pattern taught for collapsing a whole sequence
  into a single combined value (originally: summing a list). Here the
  "combining" step is `horner-step`, the seed value is `0` (the correct
  running total before any digit has been seen), and the sequence is the
  digit list itself.
- `horner-step` passed by name, not called — **(c) already basic**;
  passing an already-defined function by name as a value is the same
  pattern every earlier use of `map`, `filter`, and `reduce` in this
  curriculum has relied on, since anonymous functions were never taught.

Trace `binary->decimal` on `(1 0 1 1)` — the exact list `decimal->binary`
produced from `11` in the first unit, so the round trip can be checked:

```
Step 1: acc 0,  digit 1 → (+ (* 0 2) 1) = 1
Step 2: acc 1,  digit 0 → (+ (* 1 2) 0) = 2
Step 3: acc 2,  digit 1 → (+ (* 2 2) 1) = 5
Step 4: acc 5,  digit 1 → (+ (* 5 2) 1) = 11
```

Each step's new accumulator came from doubling the previous one (shifting
every already-placed digit one position more significant) and adding
whatever digit `reduce` handed it next, in the same left-to-right order
the digits appear in the list — most significant digit first, matching
how `decimal->binary-acc` built that list. The final accumulator, `11`,
matches the original input to `decimal->binary` exactly: the round trip
holds.

### CS Lens

Horner's method is not specific to binary or to this lesson's digit lists.

```
Also recognized in: evaluating a polynomial a·x^n + ... + c efficiently
(the technique is named for exactly this use), exponentiation by
repeated squaring's similar accumulate-as-you-go structure, and many
string hash functions, which treat a string's characters as "digits" in
some large radix and combine them with this same multiply-then-add step
```

### SE Lens

The alternative — computing each digit's power of the radix separately and
summing at the end, exactly like the first unit's isolated lab did by hand
— is not wrong, and it's arguably easier to read on the page, because it
matches the mathematical definition of positional notation directly,
term by term. Horner's method trades that direct readability for fewer
arithmetic operations: no power ever gets computed on its own, only
multiplied in one step at a time, which is why production code (and this
lesson's own `binary->decimal`) reaches for the accumulate-as-you-go form
instead of the term-by-term sum — a real efficiency-versus-directness
tradeoff, not just a stylistic preference.

---

## Concept Unit: Bits as a Measure of Information

### The Problem

Binary digits store values, but the *word* "bit" — Lesson 184's own title
promises this — is also a unit of information, independent of any
particular number being represented. Given some fixed number of distinct
possibilities to choose among (52 playing cards, 8 chess pieces, 256 gray
levels in a pixel), how many bits does *distinguishing* them actually
require?

### Introduce the Concept in Isolation

Start from the other direction: given a fixed number of bits, how many
distinct patterns can they form? Enumerate every pattern two bits can
make, explicitly:

```clojure
(list (list 0 0) (list 0 1) (list 1 0) (list 1 1))
```

Run:

```
user=> (list (list 0 0) (list 0 1) (list 1 0) (list 1 1))
((0 0) (0 1) (1 0) (1 1))
```

Count them:

```clojure
(count (list (list 0 0) (list 0 1) (list 1 0) (list 1 1)))
```

Run:

```
user=> (count (list (list 0 0) (list 0 1) (list 1 0) (list 1 1)))
4
```

Two bits produce exactly four distinguishable patterns — `2²`. That's not
a coincidence specific to two bits: each additional bit doubles the number
of patterns, because every existing pattern can now be followed by either
a `0` or a `1`. This doubling relationship between bit count and
distinguishable-pattern count is what **bits of information** measures.

### Discard the Throwaway Example

The four patterns above were typed out by hand only to make "k bits give
2^k patterns" concrete for a small, checkable k. The real project code
below answers the inverse question — given a target number of
possibilities, what's the smallest k that covers them — without ever
enumerating the patterns themselves.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the previous two units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `binary->decimal`.
- **Dependencies**: Babashka, already installed.

### The New Code

Finding the smallest `k` with `2^k >= n` doesn't need to compute a real
exponent — it can grow a candidate capacity by doubling it, exactly like
the isolated lab's pattern count doubled with each added bit, and count
how many doublings it took to reach or pass `n`:

```clojure
(defn bits-needed-acc
  [n capacity bits]
  (if (>= capacity n)
    bits
    (bits-needed-acc n (* capacity 2) (+ bits 1))))
```

### The Updated Project

As with the first unit's accumulator function, this is a freestanding new
function with nothing enclosing it yet. A small wrapper supplies the
correct starting values — a capacity of `1` (what zero bits can already
distinguish: exactly one possibility, "no choice at all") and a bit count
of `0`:

```clojure
(defn bits-needed
  [n]
  (bits-needed-acc n 1 0))
```

### Mechanical Walkthrough

Enumerating `bits-needed-acc`'s body:

- `defn`, `[n capacity bits]`, `if` — **(c) already basic**.
- `(>= capacity n)` — **(c) already basic**; `>=` was introduced with the
  other comparison operators early in this curriculum. Here it asks "can
  the current capacity already tell every one of the `n` possibilities
  apart" — the stopping condition.
- `bits` — **(c) already basic**, the base-case return value.
- `(* capacity 2)` — **(c) already basic**; doubles the capacity, mirroring
  the isolated lab's observation that one more bit doubles the number of
  distinguishable patterns.
- `(+ bits 1)` — **(c) already basic**; counts the doubling that just
  happened.
- `bits-needed-acc (* capacity 2) (+ bits 1)` — **(b) a hard concept
  reappearing**: the same accumulator-passing recursion pattern as the
  first unit's `decimal->binary-acc`, this time threading two accumulated
  values — `capacity` and `bits` — instead of one.

Trace `bits-needed` on `n = 52`, the size of a deck of playing cards:

```
Call 1: capacity 1  → 2,  bits 0 → 1, since 1  >= 52 is false
Call 2: capacity 2  → 4,  bits 1 → 2, since 2  >= 52 is false
Call 3: capacity 4  → 8,  bits 2 → 3, since 4  >= 52 is false
Call 4: capacity 8  → 16, bits 3 → 4, since 8  >= 52 is false
Call 5: capacity 16 → 32, bits 4 → 5, since 16 >= 52 is false
Call 6: capacity 32 → 64, bits 5 → 6, since 32 >= 52 is false
Call 7: capacity 64, bits = 6, base case reached: 64 >= 52 is true
```

Every call's capacity failed the `>=` test and got doubled — the digit
count only stopped growing once a capacity finally reached or passed `52`.
`64` (two to the sixth) is the first power of two that covers 52 distinct
cards; `32` (two to the fifth) falls short. The result, `6`, is the
minimum number of bits a deck of cards needs — and, not coincidentally,
exactly the length of `decimal->binary`'s own output for `52`, checked
directly in the closing section below.

### CS Lens

"How many bits does distinguishing `n` things need" recurs constantly,
well past number representation.

```
Also recognized in: hash tables sizing their bucket count to a power of
two (Section V), the literal etymology of the word "bit" (a contraction
of "binary digit," coined for exactly this measure by Claude Shannon's
information theory), error-correcting codes computing how many redundant
bits are needed to detect or correct a fault, and identifier or UUID
spaces sized to guarantee enough distinct values for every expected user
```

### SE Lens

The alternative to computing a tight minimum is what a lot of real formats
actually do: pick a generous, round bit width up front — 8, 16, 32 bits —
regardless of how many values are actually needed today, and never
recompute it. That's a real, accepted tradeoff, not laziness: the honest
cost of `bits-needed`'s tight-minimum approach is that it can silently run
out later — a field sized to exactly fit today's 52 possibilities has zero
headroom the day a 53rd is added, forcing a breaking format change. A
generously over-provisioned field wastes space and bandwidth from day one
but absorbs growth without ever changing shape. Neither choice is free;
which one a real format picks depends on whether "never breaks compatibility"
or "never wastes a bit" matters more for that specific format.

---

## Connect the Pieces

Follow one concrete value — `52`, a full deck of playing cards — through
every piece built in this lesson.

`(decimal->binary 52)` peels off binary digits from least significant to
most significant, `cons`-ing each one onto the front of the growing list,
until `52` is fully consumed:

```
n=52 → digit 0, n=26 → digit 0, n=13 → digit 1,
n=6  → digit 0, n=3  → digit 1, n=1  → digit 1, n=0 → stop
```

giving `(1 1 0 1 0 0)` — six digits. Feed that straight into
`(binary->decimal (1 1 0 1 0 0))`: `reduce` walks `horner-step` across it
left to right, doubling the running total and adding each digit —
`1, 3, 6, 13, 26, 52` — landing back on `52` exactly, confirming the two
functions are genuine inverses of each other. And `(bits-needed 52)`,
computed independently, with no reference to either digit list, returns
`6` — the same six that `decimal->binary` actually produced. That's not a
coincidence being pointed at after the fact: `bits-needed` computes the
*minimum* number of digits any binary representation of 52 must have, and
`decimal->binary`'s peel-off process, run on 52, produces exactly that
many, no more.

## What Breaks Without This

`decimal->binary-acc`'s base case, `(if (= n 0) digits ...)`, is what
stops the recursion once nothing is left to peel off. Delete that check
and leave only the recursive branch:

```clojure
(defn decimal->binary-acc-broken
  [n digits]
  (decimal->binary-acc-broken (quot n 2) (cons (mod n 2) digits)))
```

Trace what happens once `n` reaches `0`: `(quot 0 2)` is `0`, and
`(mod 0 2)` is `0` — so the very next call is
`(decimal->binary-acc-broken 0 (cons 0 digits))`, with `n` still `0`.
Nothing in this version can ever change `n` away from `0` once it gets
there, so every subsequent call is identical in every way except a
longer and longer `digits` list — the recursion never reaches a case that
returns instead of calling itself again. In Clojure, a recursive call
that is not in tail position (this one is wrapped inside `cons`, so it
isn't) consumes a real stack frame per call; with nothing to ever stop it,
that growth is unbounded, and the real, well-defined failure this produces
is a `StackOverflowError` — the JVM's own exception for exceeding its call
stack's depth, not a made-up or hypothetical outcome. (This was hand-traced
rather than run against a live Babashka process this session — the
reasoning above is exact regardless: `n` provably never changes once it
hits `0`, which is sufficient on its own to show the recursion cannot
terminate.) Restoring the original base case is what gives `n = 0` an exit
instead of a call.

## Exercises

1. Write `binary-string`, a function taking the digit list `decimal->binary`
   produces and returning it as a single human-readable string like
   `"110100"` — no fully new construct is required; there's already
   enough taught in this curriculum to build it from `reduce` and
   `str` alone.
2. Run `bits-needed` on `1`. Explain, in a sentence, why the answer is `0`
   rather than `1` — what does "zero bits of information" actually mean
   about a value that only has one possible state to begin with?
3. Trace `decimal->binary` by hand for `n = 0` specifically, through both
   `decimal->binary` and `decimal->binary-acc`, and confirm exactly where
   the wrapper's special case is what keeps the result from being the
   empty list instead of `(0)`.

## Definition of Done

- [ ] `decimal->binary` and `decimal->binary-acc` are written and hand-
      traced for at least `n = 11`, `n = 8`, and `n = 52`, all matching
      this lesson's worked traces.
- [ ] `horner-step` and `binary->decimal` are written and confirmed, by
      hand-trace, to invert `decimal->binary` for at least one input.
- [ ] `bits-needed-acc` and `bits-needed` are written and confirmed for
      `n = 1`, `n = 8`, and `n = 52`.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain out loud, without notes, why `n` can never change once it
      reaches `0` in the broken version.
- [ ] Commit with a message explaining *why* binary representation needed
      its own from-scratch running example rather than reusing anything
      from Section VIII — not just *what* functions were added.
