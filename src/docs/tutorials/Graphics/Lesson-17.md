# Lesson 17: Numerical Error in Geometry

**What you will build:** A real explanation, backed by actually-run
proof, of the floating-point rounding behavior Lesson 10 first showed
without explaining (`0.6000000000000001` printed where a clean `0.6`
might be expected) and Lesson 16's `norm` checks quietly benefited from
going the other way (`1.0`, with no trailing digits at all). Then a
reusable `nearly_equal` function that compares floats safely, using a
real, verified case where an ordinary `==` check fails on a computation
that is mathematically correct. The transferable problem: every numeric
comparison this curriculum has written so far (`Run It` outputs,
`Definition of Done` checklists) has quietly assumed a computed float
matches its expected value exactly. Lesson 17 checks that assumption
directly, instead of continuing to rely on it by habit.

**What you need to know first:** Lesson 1's `float` data type and `abs()`
function, Lesson 3's `scale_vector`, Lesson 7's `dot_product`, Lesson 9's
`norm` and `import math`, and Lesson 10's `normalize` and its own
already-shown `0.6000000000000001` result.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–16.

**Terms introduced in this lesson:**

- **Floating-point representation error** — the small, unavoidable gap
  between a real number and the actual binary value a computer stores for
  it, because most decimal fractions have no finite representation in
  binary, the same way `1/3` has no finite representation in decimal. Why:
  this is the actual cause behind every "shouldn't this print a clean
  number?" surprise this curriculum has run into, starting with Lesson
  10's `0.6000000000000001`.
- **Correctly rounded** — a guarantee that a function returns the closest
  possible representable value to the true mathematical answer, and
  returns the *exact* answer whenever that answer happens to already be
  representable. Why: this is exactly why Lesson 16's `math.sqrt(1)` came
  back as a clean `1.0` rather than some near-but-not-quite value — not
  luck, a guarantee.
- **Tolerance (epsilon comparison)** — checking whether two floats are
  *close enough* to count as equal, using a small allowed margin, instead
  of checking whether they are bit-for-bit identical with `==`. Why:
  floating-point representation error means two floats that are
  mathematically equal can differ in their very last bit, which makes
  plain `==` an unreliable way to check geometric correctness — this
  lesson's own closing section proves it fails on a real, correct
  computation.

**Objects and methods used:**

- **`math.sqrt`**
  - *What it is:* the same square-root function from Lesson 9's own
    isolated lab, given full treatment there.
  - *Implementation:* per Lesson 9 — a function in the standard `math`
    module, called as `math.sqrt(x)`, returning a `float`.
  - *Its use:* reused unchanged here, this time specifically to check
    whether its result is *exactly* representable for a range of inputs,
    not just to compute a length.

---

## Concept Unit: Same Math, Different Bits — Why `normalize` Produced `0.6000000000000001`

### The Problem

Lesson 10 printed `0.6000000000000001` where the math says the answer
should be a clean `0.6`, and moved on without explaining why. Before
building anything new, reproduce that same kind of surprise on purpose,
using nothing but plain division and multiplication, to see exactly where
the extra digits come from.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–16.
- **Files affected:** `geometry_lesson_17.py` — created, as a new file
  for this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
print(3 / 5.0)
print(1 / 5.0)
print(3 * (1 / 5.0))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* division and multiplication are already-basic,
established since Lesson 3, and printing a `float` is already-basic since
Lesson 1. No new Python construct appears here, so no isolated throwaway
lab is needed; what's new is the *behavior* of these already-familiar
operations, not any new syntax.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `print(3 / 5.0)` — already-basic division, computing three fifths one
  way: divide once. Prints `0.6`, matching the clean decimal value
  exactly, as far as anything shown on screen can tell.
- `print(1 / 5.0)` — already-basic division, computing one fifth. Prints
  `0.2`, also clean-looking.
- `print(3 * (1 / 5.0))` — first appearance of computing the *same*
  mathematical value, three fifths, a *second* way: divide `1` by `5`
  first, keep whatever the computer actually stored for that result, then
  multiply by `3`. This prints `0.6000000000000001` — visibly different
  digits than the line above, even though "three divided by five" and
  "three times one-fifth" are the identical number in real mathematics.
  This is exactly the same digit string Lesson 10 already showed for its
  own `normalize` result — strong evidence the two computations are
  hitting the same underlying mechanism, even without needing to know
  Lesson 10's own function line by line.

**Why the two computations disagree.** Computers store `float` values in
binary (base 2), using a fixed 64 bits per value (Python's `float` is a
"double-precision" IEEE 754 number). Just as `1/3` has no finite
representation in decimal — it's `0.333...`, repeating forever — most
decimal fractions have no finite representation in *binary* either,
including `1/5`. The real, stored value behind `1 / 5.0` is not
mathematically exactly `0.2`; it's the closest one of the 64-bit values
the format can represent, rounded once at the moment the division
happens. `3 / 5.0` also gets rounded once, but only once, at the very
end — and it happens to round to the double whose shortest
round-trip decimal is `0.6`. `3 * (1 / 5.0)` rounds *twice*: once when
`1 / 5.0` is first computed and stored, and again when that
already-rounded value gets multiplied by `3`. Two roundings, taken along
a different arithmetic path, landed on a neighboring but different
64-bit value than one rounding did — close enough that the true
difference is only in the seventeenth significant digit, but not
identical.

### CS Lens

The fact that two mathematically equal expressions can produce two
different floating-point results, depending only on the order operations
happen in, is a foundational property of **floating-point arithmetic**
worth recognizing well beyond this one division.

```
Also recognized in: numerical simulations (physics engines and scientific
computing code get different results on different hardware, or after a
seemingly harmless reordering of additions, for exactly this reason —
floating-point addition and multiplication are not perfectly associative),
financial software (currency calculations are frequently done in fixed-
point or integer-cents arithmetic specifically to avoid this exact
problem, since a penny of rounding error compounding across millions of
transactions is unacceptable), and compiler optimization (a compiler is
generally forbidden from silently reordering floating-point operations
during optimization, unlike integer ones, precisely because reordering
can change the actual result, not just its performance)
```

### SE Lens

The design principle this lesson's own discovery raises is **being
honest about a system's real limitations instead of hiding them**. The
alternative not chosen, available to any language: round every displayed
float to a fixed, friendly number of decimal places by default, so `3 *
(1 / 5.0)` would always print as a tidy `0.6`.

That alternative would make output look cleaner in every lesson so far.
The real cost it pays: hiding the actual stored value doesn't remove the
underlying error, it just stops the programmer from ever seeing it — and
a rounding error that's invisible in every print statement is still fully
present in every downstream calculation that uses the value, including
comparisons that silently fail, which this lesson's own closing section
demonstrates directly. Python's default behavior — print the shortest
decimal string that round-trips back to the exact same stored bits, ugly
digits and all — costs some readability but never hides a real
discrepancy.

### Commands Needed

`python geometry_lesson_17.py` — same interpreter and command as every
prior lesson.

### Run It

```
0.6
0.2
0.6000000000000001
```

Verified by actually running the file above.

### Connection

Floating-point arithmetic can silently disagree with itself on
mathematically identical values. The next unit checks whether that means
every float this curriculum has printed so far was equally at risk — or
whether some of them were safe for a real, provable reason.

---

## Concept Unit: Which Floats Are Exact — Why Lesson 16's Norms Came Out Clean

### The Problem

If floating-point arithmetic can silently introduce error, Lesson 16's
`norm(fixture_x_axis_in_table)` and `norm(fixture_y_axis_in_table)`
should have been at risk of the same thing — yet both printed exactly
`1.0`, with no trailing digits at all. Was that luck, or something
guaranteed?

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_17.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(3 * (1 / 5.0))` line added in
  Concept Unit 1.
- **Dependencies:** none beyond what Concept Unit 1 already established.

### The New Code

```python
print(1.0 == 1)
print(4.0 == 4)
print(1000000.0 == 1000000)

import math

print(math.sqrt(1))
print(math.sqrt(4))
print(math.sqrt(25))
print(math.sqrt(2))
```

### The Updated Project

```python
print(3 / 5.0)
print(1 / 5.0)
print(3 * (1 / 5.0))

print(1.0 == 1)                                                          # ← new
print(4.0 == 4)                                                          # ← new
print(1000000.0 == 1000000)                                              # ← new

import math                                                               # ← new

print(math.sqrt(1))                                                      # ← new
print(math.sqrt(4))                                                      # ← new
print(math.sqrt(25))                                                     # ← new
print(math.sqrt(2))                                                      # ← new
```

The file now shows both sides of the same coin: arithmetic that silently
loses precision (Concept Unit 1), and arithmetic that provably doesn't
(this unit).

*A note on method:* `import math` and `math.sqrt` already received full
treatment in Lesson 9; comparing values with `==` has been used since
Lesson 5. No new Python construct appears in this unit, so no isolated
throwaway lab is needed; what's new is which specific values turn out to
be exact, and why.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `print(1.0 == 1)`, `print(4.0 == 4)`, `print(1000000.0 == 1000000)` —
  first appearance of checking whether whole numbers survive being stored
  as `float` with zero error. All three print `True`: unlike a decimal
  fraction such as `0.2`, an integer value needs no fractional binary
  digits at all to represent, so any integer within a `float`'s roughly
  nine-quadrillion-value exact range (including every number this
  curriculum has ever used) is stored with no rounding whatsoever.
- `import math` — Lesson 9's own import, retyped. No re-explanation owed,
  per the Repetition Rule.
- `print(math.sqrt(1))`, `print(math.sqrt(4))`, `print(math.sqrt(25))` —
  Lesson 9's own function, reused, called on three **perfect squares** —
  numbers whose square root is itself a whole number. Each result,
  `1.0`, `2.0`, `5.0`, comes out completely clean, with no trailing
  digits. This is exactly what Lesson 16's own `norm` checks depended on:
  `fixture_x_axis_in_table = (0, 1)` and `fixture_y_axis_in_table = (-1,
  0)` both have `dot_product(v, v)` equal to the exact integer `1` — a
  perfect square — so `math.sqrt` of that exact `1` is guaranteed, not
  merely likely, to come back as an exact `1.0`.
- `print(math.sqrt(2))` — the same function, called on a number that is
  *not* a perfect square. It prints `1.4142135623730951` — the closest
  double to the true value of √2, which is irrational and has no finite
  representation in any base at all, decimal or binary. Unlike Concept
  Unit 1's `0.6000000000000001`, this isn't a rounding surprise to
  explain away; a rounded result here is the best any finite
  representation could ever do.

**Why "correctly rounded" explains the difference.** Python's
`math.sqrt` (like every conforming IEEE 754 implementation) is
**correctly rounded**: it is required to return the exact mathematical
answer whenever that answer is itself representable as a `float`, and
otherwise the single closest representable value. `math.sqrt(1)`'s true
answer, `1`, is exactly representable — so the guarantee forces a
perfectly exact `1.0` back, not an approximation. `math.sqrt(2)`'s true
answer isn't representable in any finite number of bits, so the same
guarantee only promises the closest possible double — which is still
extremely close, but never exact. Lesson 16's clean `1.0`s were not a
coincidence; they were a direct, provable consequence of choosing basis
vectors whose squared lengths happen to be perfect squares.

### CS Lens

Distinguishing values that are *exactly* representable from values that
are only ever *approximately* representable is a load-bearing idea any
time floating-point numbers are used for anything beyond rough estimates.

```
Also recognized in: game engines and physics simulations (collision
detection code specifically checks for perfect-square distances, like
this lesson's `math.sqrt(25)`, when it can, to get exact comparisons
instead of approximate ones), cryptographic and financial systems (which
avoid floating point for exact values entirely, using integer or
fixed-point arithmetic specifically because "usually accurate" isn't good
enough when money or security is involved), and numerical analysis
generally (a whole field concerned with tracking exactly how much error
accumulates through a chain of floating-point operations, and which
operations are "numerically stable" versus prone to amplifying small
errors)
```

### SE Lens

The design principle is **relying on a documented guarantee instead of
an empirical pattern**. The alternative not chosen: trust that
`math.sqrt` "usually" returns clean results for nice-looking inputs,
without knowing whether that's actually promised or just something that
happened to work in the examples tried so far.

That alternative would have made this lesson's own claims — that Lesson
16's `1.0`s were guaranteed, not lucky — impossible to state honestly;
"usually works" and "provably always works for this exact case" look
identical from a single passing test, but only one of them can be trusted
in code a CAD/CAM system's accuracy actually depends on. The real cost of
relying on the correctly-rounded guarantee instead of raw empiricism: it
requires knowing which specific operations carry that guarantee (`+`,
`-`, `*`, `/`, and `math.sqrt` all do, under IEEE 754) and which don't —
knowledge that has to be looked up once, rather than re-verified by trial
and error every time.

### Commands Needed

`python geometry_lesson_17.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
0.6
0.2
0.6000000000000001
True
True
True
1.0
2.0
5.0
1.4142135623730951
```

Verified by actually running the updated file above.

### Connection

Some floats are provably exact (whole numbers, and square roots of
perfect squares); most are not. The next unit deals with the practical
consequence: how to compare two floats when either one might carry a tiny,
unavoidable rounding difference.

---

## Concept Unit: Comparing Floats Safely — Tolerance Instead of `==`

### The Problem

Concept Unit 1 already proved that two floats representing the exact same
real number can differ in their stored bits. That means any code —
including a future lesson's own verification step — that checks a
computed geometric result with plain `==` is at risk of reporting a
correct answer as wrong, for no reason except which arithmetic path
happened to compute it.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_17.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(math.sqrt(2))` line added in
  Concept Unit 2.
- **Dependencies:** Lesson 1's `abs()`.

### The New Code

```python
def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


print(0.1 + 0.2 == 0.3)
print(nearly_equal(0.1 + 0.2, 0.3, 0.0000001))
```

### The Updated Project

```python
print(3 / 5.0)
print(1 / 5.0)
print(3 * (1 / 5.0))

print(1.0 == 1)
print(4.0 == 4)
print(1000000.0 == 1000000)

import math

print(math.sqrt(1))
print(math.sqrt(4))
print(math.sqrt(25))
print(math.sqrt(2))


def nearly_equal(a, b, tolerance):                                       # ← new
    return abs(a - b) < tolerance                                        # ← new


print(0.1 + 0.2 == 0.3)                                                  # ← new
print(nearly_equal(0.1 + 0.2, 0.3, 0.0000001))                           # ← new
```

The file now includes a reusable way to compare two floats that tolerates
exactly the kind of tiny discrepancy Concept Units 1 and 2 proved is real
and unavoidable.

*A note on method:* `abs()` already received full treatment in Lesson 1;
comparison operators (`<`, `==`) and function definitions are
already-basic. No new Python construct is introduced; what's new is the
*technique* — comparing a difference against a threshold instead of
comparing values directly — not any new syntax.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def nearly_equal(a, b, tolerance): ...` — first appearance of a
  **tolerance comparison**: instead of asking "are these two values
  identical," it asks "are these two values close enough."
- `return abs(a - b) < tolerance` — `a - b` (already-basic subtraction)
  computes how far apart the two values are, including a sign; `abs()`
  (Lesson 1's own function, reused unchanged) discards that sign, leaving
  a plain, non-negative distance between them; `< tolerance`
  (already-basic comparison) checks whether that distance is small enough
  to not matter. Three already-familiar pieces, combined into a genuinely
  new technique: equality *within a margin*, instead of equality
  bit-for-bit.
- `print(0.1 + 0.2 == 0.3)` — already-basic, reusing Concept Unit 1's own
  finding: `False`, because `0.1 + 0.2`'s stored bits don't exactly match
  `0.3`'s.
- `print(nearly_equal(0.1 + 0.2, 0.3, 0.0000001))` — the same comparison,
  now tolerant of a difference up to `0.0000001`. Since `0.1 + 0.2`'s
  actual error is only about `0.00000000000000004` — far smaller than the
  chosen tolerance — this comes back `True`, correctly recognizing the two
  values as the same real number despite their differing bits.

### CS Lens

Comparing computed values within a tolerance rather than exactly is
standard practice anywhere floating-point results need to be checked for
correctness.

```
Also recognized in: automated test frameworks (nearly every testing
library ships its own version of this exact function — Python's own
`unittest.TestCase.assertAlmostEqual`, pytest's `pytest.approx` — because
comparing floats with plain `==` in a test is a well-known source of
flaky failures), 3D collision detection (checking whether two shapes
"touch" almost always uses a small tolerance, both to absorb floating-
point noise and to treat truly adjacent-but-not-quite-touching surfaces
as touching, which is physically what's intended), and numerical solvers
(iterative algorithms — root-finding, physics integration — stop when a
result is "close enough" to converged, using exactly this kind of
tolerance check, because they may never reach bit-perfect convergence at
all)
```

### SE Lens

The design principle is **choosing an explicit, visible tolerance value
instead of relying on an unstated assumption of exactness**. The
alternative not chosen: keep using plain `==` everywhere, and treat any
resulting mismatch as a bug to chase down in the code that produced the
numbers, rather than in the comparison itself.

That alternative would eventually surface every real bug — but Concept
Unit 1 already proved it would also flag `3 / 5.0` against `3 * (1 /
5.0)` as unequal, a false alarm with nothing actually wrong. The real
cost `nearly_equal` pays instead: the tolerance value itself is now a
judgment call baked into the code — `0.0000001` here — and it's a real
tradeoff, not a free fix. Too large a tolerance risks calling two
genuinely different results "the same," silently hiding a real geometric
error; too small a tolerance risks the exact same false alarms `==`
already produces. Choosing it requires knowing roughly how much error a
given chain of operations can realistically accumulate — a question later
lessons on geometric predicates (Lesson 19) depend on getting right.

### Commands Needed

`python geometry_lesson_17.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
0.6
0.2
0.6000000000000001
True
True
True
1.0
2.0
5.0
1.4142135623730951
False
True
```

Verified by actually running the updated file above.

### Connection

`nearly_equal` now exists, verified against the exact discrepancy Concept
Unit 1 found. Connect the Pieces, below, applies it to a real geometric
computation instead of a bare arithmetic example.

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish:

1. `3 / 5.0` prints `0.6`; `3 * (1 / 5.0)` — the same real number,
   computed via one extra rounding step — prints `0.6000000000000001`.
   Both are legitimate floating-point results; neither is a bug.
2. `math.sqrt(1)` prints a completely clean `1.0`, not because of luck but
   because `1` is a perfect square and `math.sqrt` is correctly rounded —
   exactly the property Lesson 16's own basis-vector norm checks quietly
   depended on. `math.sqrt(2)` cannot come out clean, no matter how it's
   computed, because √2 has no finite representation in any base.
3. `nearly_equal(a, b, tolerance)` uses `abs(a - b) < tolerance` to treat
   values like `0.6` and `0.6000000000000001` as equal, without ever
   needing to know in advance which specific arithmetic path produced
   either one.
4. Applied to a real geometric computation: `norm(normalize((1, 2)))`
   comes out to `0.9999999999999999`, not a clean `1.0`, even though a
   normalized vector's length is exactly `1` in real mathematics.
   `nearly_equal(norm(normalize((1, 2))), 1.0, 0.0000001)` correctly
   reports `True` where plain `==` would incorrectly report `False`.

## What Breaks Without This

A normalized vector's length should be exactly `1` — that's the entire
point of Lesson 10's `normalize`. Check it against a real vector, using
Lesson 3's `scale_vector`, Lesson 9's `norm`, and Lesson 10's `normalize`,
all reused unchanged:

```python
import math


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def scale_vector(v, factor):
    return (v[0] * factor, v[1] * factor)


def normalize(v):
    return scale_vector(v, 1 / norm(v))


def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


unit_vector = normalize((1, 2))
print(unit_vector)
print(norm(unit_vector))
print(norm(unit_vector) == 1.0)
print(nearly_equal(norm(unit_vector), 1.0, 0.0000001))
```

```
(0.4472135954999579, 0.8944271909999159)
0.9999999999999999
False
True
```

Verified by actually running this. `normalize((1, 2))`'s own length comes
out to `0.9999999999999999` — not the clean `1.0` a reader might expect,
and not equal to `1.0` under plain `==`, even though `unit_vector` is a
completely correct, valid unit vector. The error crept in through
`normalize`'s own division (`1 / norm(v)`, then a multiplication by that
already-rounded reciprocal) — the same two-rounding pattern Concept Unit
1 first demonstrated with `3 * (1 / 5.0)`. Code that checked
`norm(some_normalized_vector) == 1.0` to validate a result — a completely
reasonable-looking sanity check — would report this correct unit vector
as broken. `nearly_equal`, with a sensible tolerance, reports the truth:
`True`. Any future lesson's own verification of a computed geometric
result should reach for `nearly_equal`, not `==`, the moment a `float`
divison or `math.sqrt` sits anywhere in how that result was computed.

## Exercises

1. Using `nearly_equal`, check whether Lesson 16's `identity_matrix`
   check would have needed a tolerance if `fixture_to_table_matrix`'s
   basis vectors hadn't been made of clean integers — predict what
   `norm`-based value might have introduced rounding risk if the basis
   had come from `normalize` instead of being typed directly as `(0, 1)`
   and `(-1, 0)`.
2. Find a second pair of expressions, different from `3 / 5.0` and `3 *
   (1 / 5.0)`, that compute the same real number two different ways and
   produce two different `float` results. (Hint: try dividing by `3`
   instead of `5`.)
3. Using `nearly_equal`, write and verify a check that `normalize((3,
   4))`'s length is close enough to `1.0` to count as correct, and
   compare its behavior to plain `==` on the same value.

## Definition of Done

- [ ] `geometry_lesson_17.py` exists and runs with no errors via `python
      geometry_lesson_17.py`.
- [ ] Running it prints `0.6`, `0.2`, `0.6000000000000001`, `True`,
      `True`, `True`, `1.0`, `2.0`, `5.0`, `1.4142135623730951`, `False`,
      then `True` — matching this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, why `3 / 5.0` and `3
      * (1 / 5.0)` print different digits despite being the same real
      number.
- [ ] You can explain why `math.sqrt(1)` is guaranteed to be exact while
      `math.sqrt(2)` never can be, using the term "correctly rounded."
- [ ] You can explain why `nearly_equal` uses `<` against a tolerance
      instead of `==`, using this lesson's own verified
      `norm(normalize((1, 2)))` result.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Explain floating-point rounding and add a tolerance-based comparison for geometric results"`,
      not `git commit -m "add nearly_equal"`.

Next: Lesson 18 — Exact vs. Approximate Geometry, which builds directly on
this lesson's `nearly_equal` to ask a harder question: not just whether
two numbers are close enough, but whether an entire geometric decision — a
point counted as "on" a line, two shapes counted as "touching" — can be
trusted at all once floating-point error is in the picture.
