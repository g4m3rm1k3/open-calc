# Lesson 185: Boolean Circuits

- **What you will build** — a small set of logic-gate functions operating
  on the `0`/`1` bits from the previous lesson, a proof that every one of
  them can be rebuilt from a single primitive gate (NAND) alone, and one
  small circuit — an equality checker — composed by wiring several gates'
  outputs into other gates' inputs. The transferable problem: Lesson 7 and
  8 already gave boolean logic (`and`, `or`, `not`, truth tables) full
  treatment as *math*; this lesson is about what it takes to realize that
  same math as physical, wired-together hardware operating on the bits
  Lesson 184 defined — and why real chips don't actually contain a
  dedicated physical AND gate, OR gate, and NOT gate each built separately.
- **What you need to know first** — `and`, `or`, `not`, and truth tables
  (Lesson 7, Predicates and Boolean Logic; Lesson 8, Truth Tables and
  Logical Equivalence), and binary digits as `0`/`1` values (Lesson 184).
- **Terms introduced in this lesson**
  - **logic gate** — a physical (or, here, simulated) component that
    computes one fixed boolean function of its inputs; the hardware
    counterpart of a single boolean operator like `and` or `or`.
  - **NAND gate** — the gate whose output is `0` exactly when both inputs
    are `1`, and `1` in every other case; short for "NOT-AND."
  - **functional completeness (universal gate)** — a gate, or small set of
    gates, is functionally complete when *every* possible boolean function
    can be built by composing that gate alone, with nothing else; NAND by
    itself has this property, proven directly in this lesson.
  - **circuit** — a network of gates where some gates' outputs are wired
    into other gates' inputs, computing a function no single gate could
    compute alone.
- **Objects and methods used**: None new. This lesson reuses `and`, `or`,
  `not` (Lesson 7), `if`, `=` (Lesson 6), each already covered — applied
  here to a new domain (`0`/`1` bits) rather than to genuinely new syntax.

---

## Concept Unit: From Boolean Values to Gates on Bits

### The Problem

Lesson 7 and 8's `and`, `or`, and `not` operate on Clojure's own booleans,
`true` and `false`. Lesson 184's binary digits are `0` and `1` — plain
integers, not booleans at all. A gate has to take bits in and put a bit
back out. Can `and`, `or`, and `not` just be pointed at `0` and `1`
directly, the way they were always pointed at `true` and `false`?

### Introduce the Concept in Isolation

Try it, using an input pair where the boolean answer is unambiguous:
logical AND of "false" and "true" must be false — `0` and `1` should give
`0` back if `0`/`1` behave like `false`/`true`.

```clojure
(and 0 1)
```

Run:

```
user=> (and 0 1)
1
```

That output is wrong for AND: `0 and 1` must be `0`, not `1`. The reason
is Clojure's own truthiness rule, already relied on since the first `if`
in this curriculum but never stated this bluntly: in Clojure, *only* `nil`
and `false` count as false — every other value, `0` included, counts as
true. `and` evaluates its arguments and returns the first one that's
falsy, or the last one if none are; since `0` is truthy in Clojure, `and`
never finds a falsy argument in `(and 0 1)` and just returns its last
argument, `1`. This is not a bug in `and` — it is exactly what `and` has
always done — but it proves plain `0`/`1` integers cannot be fed straight
into `and`/`or`/`not` as if `0` meant false the way it does in many other
languages. **This is called a truthiness mismatch**: the bit
representation and Clojure's own notion of "falsy" disagree about what `0`
means.

### Discard the Throwaway Example

`(and 0 1)` was run only to expose the mismatch; it's never called again.
The real project code below converts explicitly between bits and booleans
instead of relying on Clojure to treat `0` as false.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  opening this section's own running example, continuing directly from
  Lesson 184's bit representation.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Two small conversion functions bridge the mismatch: one turning a bit
into the boolean Clojure's `and`/`or`/`not` actually expect, one turning
the boolean answer back into a bit.

```clojure
(defn bit->bool
  [b]
  (= b 1))
```

```clojure
(defn bool->bit
  [p]
  (if p 1 0))
```

### The Updated Project

Both are freestanding new functions with nothing enclosing them yet —
Project Change already covers this case. Together, they make an honest
gate function possible: convert the bit inputs to booleans, apply the
real boolean operator, convert the boolean result back to a bit.

```clojure
(defn and-gate
  [a b]
  (bool->bit (and (bit->bool a) (bit->bool b))))
```

```clojure
(defn or-gate
  [a b]
  (bool->bit (or (bit->bool a) (bit->bool b))))
```

```clojure
(defn not-gate
  [a]
  (bool->bit (not (bit->bool a))))
```

### Mechanical Walkthrough

Enumerating `bit->bool`'s body:

- `defn`, `[b]` — **(c) already basic**.
- `(= b 1)` — **(c) already basic**; `=` was fully treated in Lesson 6.
  Its result here is exactly what makes the bridge work: `=` always
  returns a real Clojure boolean, `true` or `false`, never `0` or `1` —
  which is precisely what `and`/`or`/`not` need to behave correctly.

Enumerating `bool->bit`'s body:

- `defn`, `[p]`, `if` — **(c) already basic**.
- `p` used directly as the `if`'s test — **(c) already basic**; this is
  ordinary `if` usage, just written to make the point explicit: `if`
  itself already relies on exactly the truthiness rule the isolated lab
  just exposed.

Enumerating `and-gate`'s body (the same pattern repeats for `or-gate` and
`not-gate`):

- `bool->bit`, `and`, `bit->bool` — **(c) already basic**; `and` is the
  same operator from Lesson 7, now composed with the two new bridge
  functions rather than called on raw values directly.

Trace `and-gate` on `a = 1, b = 0`:

```
Step 1: (bit->bool 1) → (= 1 1) → true
Step 2: (bit->bool 0) → (= 0 1) → false
Step 3: (and true false) → false, since `and` finds a falsy argument
Step 4: (bool->bit false) → (if false 1 0) → 0
```

`and-gate 1 0` returns `0` — unlike the isolated lab's `(and 0 1)`, this
version never lets a raw `0` or `1` reach `and` directly; only real
booleans do, so the truthiness mismatch never has a chance to appear.

### CS Lens

A logic gate — a physical component computing one fixed boolean function —
is the hardware realization of the boolean algebra Lesson 7 and 8 already
covered as pure math.

```
Also recognized in: ALU (arithmetic logic unit) design inside a real
CPU, hardware description languages like Verilog and VHDL that describe
circuits as compositions of gates, digital circuit simulators (SPICE),
and Boolean satisfiability (SAT) solvers, which treat a circuit as a set
of constraints to search over
```

### SE Lens

An alternative design was available and rejected here on purpose: keep
bits as real Clojure `true`/`false` values everywhere in this section,
instead of `0`/`1` integers, which would make the truthiness mismatch
disappear entirely — no `bit->bool`/`bool->bit` bridge would ever be
needed. The tradeoff is continuity: Lesson 184's binary digit lists, and
every worked trace in it, are built from literal `0`s and `1`s, matching
how binary numbers are written and read everywhere outside this codebase.
Switching representations mid-section would break that continuity for a
one-lesson convenience. The honest, ongoing cost being paid instead is
small but real: every gate function here pays a conversion tax at its
boundary that a pure-boolean design wouldn't need.

---

## Concept Unit: NAND as a Universal Gate

### The Problem

`and-gate`, `or-gate`, and `not-gate` each do their own independent
conversion-and-compose work. Real chips don't actually contain three
separately engineered gate types wired in parallel through a factory —
overwhelmingly, they're built almost entirely out of one repeated gate.
Which one, and how can AND, OR, and NOT all be recovered from just it?

### Introduce the Concept in Isolation

Skipped — this unit's new concept is a mathematical/hardware fact
(functional completeness), not a new Clojure construct; the Concept
Isolation Rule's lab requirement is for new syntax, and nothing syntactic
here is new. The proof *is* the lab: build NAND directly, then rebuild
NOT, AND, and OR from nothing but NAND, and check each rebuilt gate
against the direct version from the first unit.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example this unit; the
functions below are real, verified project code from the start.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `not-gate`.
- **Dependencies**: Babashka, already installed.

### The New Code

NAND itself is defined directly and primitively — deliberately *not* by
composing `and-gate` and `not-gate`, since the entire point is that NAND
is the one gate that doesn't need anything else to exist first:

```clojure
(defn nand-gate
  [a b]
  (if (and (= a 1) (= b 1)) 0 1))
```

### The Updated Project

`nand-gate` alone doesn't prove anything about the other gates — the
proof is in what gets built from it next. NOT falls out first, since NAND
applied to a single value twice (both inputs the same) is exactly NOT of
that value:

```clojure
(defn not-from-nand
  [a]
  (nand-gate a a))
```

AND is NOT applied to NAND's own output — undoing the "N" in NAND:

```clojure
(defn and-from-nand
  [a b]
  (not-from-nand (nand-gate a b)))
```

OR needs De Morgan's law: OR of two values equals NAND of their negations.

```clojure
(defn or-from-nand
  [a b]
  (nand-gate (not-from-nand a) (not-from-nand b)))
```

### Mechanical Walkthrough

Enumerating `nand-gate`'s body:

- `defn`, `[a b]`, `if`, `and`, `=` — **(c) already basic**, all reused
  exactly as in the first unit.
- `(if (and (= a 1) (= b 1)) 0 1)` as a whole — **(a) first appearance**:
  this is the first gate in the lesson defined directly against raw bit
  values rather than through the `bit->bool`/`bool->bit` bridge, on
  purpose — NAND is being treated as the true hardware primitive, with
  nothing beneath it to convert through.

Enumerating `not-from-nand`'s body:

- `nand-gate a a` — **(b) a hard concept reappearing, in a new shape**:
  reusing the same argument for both of a two-input gate's inputs is the
  circuit-design idea that a gate's inputs don't have to come from
  different signals — wiring one signal to both inputs of a NAND gate is
  a real, standard way to build a NOT gate in actual hardware, not just a
  coding shortcut.

Enumerating `and-from-nand`'s and `or-from-nand`'s bodies:

- `not-from-nand (nand-gate a b)` and
  `nand-gate (not-from-nand a) (not-from-nand b)` — **(b) a hard concept
  reappearing**: composing one gate's output directly into another gate's
  input is the **circuit** idea this lesson's Terms Introduced named —
  `or-from-nand` specifically applies De Morgan's law (already proven as
  a logical-equivalence exercise back in Lesson 8) at the *circuit* level:
  negate both inputs, then NAND them, instead of directly computing OR.

Check every rebuilt gate against the first unit's direct version, on
`a = 1, b = 1`:

```
not-from-nand 1        → (nand-gate 1 1) → (if (and true true) 0 1) → 0
not-gate 1 (direct)     → 0                                             matches

and-from-nand 1 1      → (not-from-nand (nand-gate 1 1)) → (not-from-nand 0) → 1
and-gate 1 1 (direct)   → 1                                             matches

or-from-nand 1 1       → (nand-gate (not-from-nand 1) (not-from-nand 1))
                        → (nand-gate 0 0) → (if (and false false) 0 1) → 1
or-gate 1 1 (direct)    → 1                                             matches
```

Every NAND-derived gate agrees with the direct version built from `and`,
`or`, and `not` in the first unit — on this input, and (checked separately
by hand for every other `0`/`1` combination while writing this lesson) on
all four possible inputs, confirming NAND alone is enough to rebuild every
other gate this lesson has, exactly what functional completeness claims.

### CS Lens

NAND's universality is a specific instance of a much larger idea: a small
set of primitives, proven sufficient to build everything else, needs
nothing more to be added.

```
Also recognized in: real ASIC and FPGA fabrication, which is built almost
entirely from repeated NAND (or NOR) standard cells rather than a
zoo of custom gate types; NOR, provably universal by the same argument as
NAND; reduced/minimal instruction sets in CPU design, where a small core
of instructions is proven sufficient and everything else compiles down to
them; and Turing-completeness itself, where a tiny set of primitive
operations is shown sufficient to express any computable function
```

### SE Lens

The alternative to universality is exactly what the first unit built:
dedicated, separately engineered AND, OR, and NOT components, each doing
its own direct work. That alternative isn't wrong — it can even be
marginally faster per gate, since there's no extra NAND-composition
overhead. But manufacturing a single, uniform gate design repeated
billions of times across a chip is dramatically cheaper and more reliable
than fabricating several different gate types, each needing its own
separately characterized voltage and timing profile — a real, documented
reason real chip design leans on NAND-heavy (or NOR-heavy) standard-cell
libraries instead of a mix of native gate types. The cost this project
accepts by defining `and-gate`/`or-gate`/`not-gate` directly *and*
separately via NAND is redundancy — two independent implementations of
the same three functions, kept only so the check above has something to
compare against; a real fabrication pipeline would keep just one.

---

## Concept Unit: Composing Gates into a Circuit

### The Problem

A single gate answers one fixed question about its inputs. Real
computation needs several gates' answers combined — an actual **circuit**,
not just an isolated gate. What does wiring several gates together to
compute something none of them computes alone actually look like?

### Introduce the Concept in Isolation

Skipped — the new concept here is circuit composition itself, already
introduced by name and by NAND's own derived gates in the second unit;
this unit's real code *is* the next example of the same idea, applied to
build something genuinely new: a gate for "these two bits differ."

### Discard the Throwaway Example

Not applicable — same as the second unit, there is no separate throwaway
example.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `or-from-nand`.
- **Dependencies**: Babashka, already installed.

### The New Code

"These two bits differ" is true exactly when one input is `1` and the
other is `0` — either `(a AND NOT b)` or `(NOT a AND b)`, combined with
OR:

```clojure
(defn xor-gate
  [a b]
  (or-gate (and-gate a (not-gate b)) (and-gate (not-gate a) b)))
```

### The Updated Project

`xor-gate` alone answers "do these differ." Its exact opposite — "are
these the same" — is one more gate wired onto its output, `not-gate`
applied to whatever `xor-gate` returns:

```clojure
(defn bits-equal?
  [a b]
  (not-gate (xor-gate a b)))
```

### Mechanical Walkthrough

Enumerating `xor-gate`'s body:

- `or-gate`, `and-gate`, `not-gate` — **(c) already basic**, all from the
  first unit.
- `(or-gate (and-gate a (not-gate b)) (and-gate (not-gate a) b))` as a
  whole — **(a) first appearance**: this is the lesson's first genuine
  multi-gate **circuit** — three gate calls whose *outputs* feed directly
  into a fourth gate's *inputs*, rather than any single gate call standing
  alone. `xor-gate` is not itself a new primitive operator; it's what
  wiring existing gates together in this specific shape computes.

Enumerating `bits-equal?`'s body:

- `not-gate (xor-gate a b)` — **(b) a hard concept reappearing**: the same
  gates-feeding-gates composition, one layer deeper — `bits-equal?` is
  built entirely out of `xor-gate`, which is itself already built out of
  `and-gate`/`or-gate`/`not-gate`, a circuit built from a circuit.

Trace `xor-gate` and `bits-equal?` on `a = 1, b = 0`:

```
Step 1: (not-gate 0) → 1                        [not b]
Step 2: (and-gate 1 1) → 1                       [a AND (not b)]
Step 3: (not-gate 1) → 0                        [not a]
Step 4: (and-gate 0 0) → 0                       [(not a) AND b]
Step 5: (or-gate 1 0) → 1                        xor-gate returns 1
Step 6: (not-gate 1) → 0                         bits-equal? returns 0
```

`xor-gate 1 0` returns `1` (the bits genuinely differ), and `bits-equal?
1 0` returns `0` (correctly reporting they are *not* equal) — each step
above traces directly to the wiring in `xor-gate`'s own definition: step 2
is the "`a` is `1` and `b` is not" branch, step 4 is the "`a` is not `1`
and `b` is" branch, and step 5 combines them with OR exactly because
either branch alone is enough to prove the bits differ.

### CS Lens

Composing already-built gates into a new circuit, rather than defining
every needed function as its own hardware primitive, is the same idea
this whole lesson has been building toward from its very first unit.

```
Also recognized in: parity-check bits, which use exactly this XOR
structure for error detection; the half-adder circuit (next lesson),
whose sum output is this exact XOR; one-time-pad and stream-cipher
encryption, which combine a message and a key with bitwise XOR; and
digital comparator circuits, which generalize `bits-equal?` to whole
multi-bit numbers
```

### SE Lens

`bits-equal?` could instead have been defined directly and primitively,
the same way `nand-gate` was in the second unit — a hand-written truth
table with no composition at all. That alternative can be marginally
faster in real hardware, since signals only pass through one gate's worth
of delay instead of three chained gates' worth. The tradeoff accepted
here is the same one this curriculum has already named for ordinary code,
now applied to circuits: composing already-verified pieces (`and-gate`,
`or-gate`, `not-gate`, already checked against NAND in the previous unit)
costs a little propagation delay but avoids re-deriving and re-verifying
the same logic a third time. Real chip designers make this exact
trade-off deliberately, case by case — composed logic where clarity and
reuse matter more, hand-optimized primitive cells where the extra gate
delay is the more expensive cost.

---

## Connect the Pieces

Follow one pair of bits, `a = 1, b = 0`, through every gate this lesson
built. The first unit's direct `and-gate 1 0` returns `0`, converting
through `bit->bool`/`bool->bit` around a real `and`. The second unit's
NAND-derived `and-from-nand 1 0` — built from nothing but `nand-gate`,
`not-from-nand`, and De Morgan's law — was checked by hand against every
input combination and agrees with `and-gate` on all of them, confirming
NAND alone was enough to reconstruct it. The third unit's `xor-gate 1 0`
composes `and-gate`, `or-gate`, and `not-gate` — the same first-unit gates
just confirmed trustworthy against NAND — and returns `1`, correctly
reporting that `1` and `0` differ; `bits-equal? 1 0` wires one more
`not-gate` onto that result and returns `0`. Every layer, from the raw
truthiness mismatch this lesson opened with, through NAND's universality,
to a composed circuit answering a question no single gate could answer
alone, traces back to the same four primitive functions from the first
unit.

## What Breaks Without This

De Morgan's law is what makes `or-from-nand` correct — OR of two values
equals NAND of their *negations*, not NAND of the raw values. Drop the
negation and the bug is silent, not a crash:

```clojure
(defn or-from-nand-broken
  [a b]
  (nand-gate a b))
```

Trace it on `a = 1, b = 1`, where OR and NAND actually disagree:

```
or-from-nand-broken 1 1 → (nand-gate 1 1) → (if (and true true) 0 1) → 0
or-gate 1 1 (direct, correct)              → 1
```

`or-from-nand-broken` returns `0` for two `1` inputs — but `1 OR 1` must
be `1`; two true things OR'd together is still true. `nand-gate a b`
alone computes NOT of AND, not OR — the broken version is quietly
computing NAND itself and calling it OR. Nothing throws an exception;
every gate call succeeds and returns a valid-looking bit, which is exactly
why this class of bug is dangerous in a real circuit — it only shows up
when someone checks the output against the truth table it was supposed to
match, the same way this lesson's second unit checked every NAND-derived
gate by hand instead of trusting the algebra alone. Restoring the
negations in `or-from-nand` is what closes the gap.

## Exercises

1. Derive `nor-gate` (NOT of OR) directly and primitively, the same way
   `nand-gate` was defined directly rather than composed. Then prove NOR
   is also functionally complete by rebuilding `not-gate`, `and-gate`, and
   `or-gate` from nothing but `nor-gate`, the way the second unit did for
   NAND.
2. `xor-gate` composes four gate calls. Write out, by hand, the full trace
   for `a = 0, b = 0` and `a = 1, b = 1`, and confirm both return `0` —
   explain in one sentence why XOR is `0` whenever its two inputs match.
3. `bits-equal?` only compares one pair of bits. Sketch, in prose, what
   would have to change to compare two whole binary digit lists (Lesson
   184's `decimal->binary` output) for equality, bit by bit — no code
   required yet.

## Definition of Done

- [ ] `bit->bool`, `bool->bit`, `and-gate`, `or-gate`, and `not-gate` are
      written and hand-traced for at least one input each.
- [ ] `nand-gate`, `not-from-nand`, `and-from-nand`, and `or-from-nand` are
      written and checked by hand against the direct gates from the first
      unit, on all four `0`/`1` input combinations for the two-input gates.
- [ ] `xor-gate` and `bits-equal?` are written and hand-traced for at
      least `a = 1, b = 0` and `a = 1, b = 1`.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why `or-from-nand-broken` fails silently
      instead of throwing an error.
- [ ] Commit with a message explaining *why* NAND was chosen as the
      primitive to derive everything else from, not just *what* gates were
      added.
