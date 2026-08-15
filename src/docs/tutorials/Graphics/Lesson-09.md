# Lesson 9: Norms and Distance

**What you will build:** A `norm` function that finally answers a question
every lesson since Lesson 2 has sidestepped — how long is a vector, really
— built from Lesson 7's dot product and Python's `math.sqrt`, imported for
the first time in this curriculum. You'll use it to generalize Lesson 1's
one-dimensional `distance` into a real, two-dimensional Euclidean distance,
exactly as promised back in Lesson 1. The transferable problem: this
curriculum has been calling `x_axis` and `y_axis` "unit vectors" since
Lesson 6, and calling the dot-product-onto-a-unit-vector trick
"projection" since Lesson 7, without ever being able to prove either claim.
This lesson finally can.

**What you need to know first:** Lesson 1's `distance` (the 1D version this
lesson generalizes), Lesson 2's `subtract_points`, and Lesson 7's
`dot_product` — specifically, Lesson 7's own closing promise that "a vector
dotted with itself" is the raw ingredient this lesson needed.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–8, with one addition worth stating plainly: nothing in this curriculum
so far has used Python's `import` statement. This lesson's first unit
introduces it from scratch, in full, rather than assuming it.

**Terms introduced in this lesson:**

- **Norm** (also called **magnitude** or **length**) — a vector's own size,
  computed as the square root of its dot product with itself. Why: Lesson
  7's dot product could measure how two *different* vectors relate to each
  other, but nothing so far could answer "how big is this one vector, on
  its own" — norm is that missing measurement.
- **Unit vector** — a vector whose norm equals exactly `1`. Why: Lesson 6
  and 7 both called `x_axis` and `y_axis` unit vectors and relied on that
  fact for projection to work correctly, without this curriculum having any
  way to define or verify it until now.

**Objects and methods used:**

- **`import` (statement)**
  - *What it is:* A Python statement that loads a module — a separate file
    of pre-written code — and makes its contents available under a name.
    It's not a function call and returns no value; it's an instruction to
    the interpreter to go find and load something before continuing.
  - *Implementation:* `import math` loads Python's built-in `math` module
    and binds the name `math` to it in the current file. Everything the
    module defines then becomes reachable through that name, written
    `math.something` — never as a bare name on its own.
  - *Its use:* Unlike `abs()`, which Lesson 1 used with no import at all
    because it lives in Python's automatically-loaded `builtins`, the
    square root function this lesson needs lives in the separate `math`
    module and has to be explicitly loaded before it can be called.

**"Everything else in the file, not this lesson's subject but still
explained."**

- **`math.sqrt()`**
  - *What it is:* A function defined inside Python's `math` module,
    reachable only after `import math` has run.
  - *Implementation:* Signature `math.sqrt(x)`. Returns the non-negative
    square root of `x`, always as a `float` — `math.sqrt(9)` returns `3.0`,
    not the integer `3`, even though `9` itself was a whole number. Its
    documented contract lives in Python's official standard-library
    reference under the `math` module; a reader who wants to see its real
    implementation can find it in the CPython source repository rather
    than take this description on faith.
  - *Its use:* This lesson's `norm` function needs an actual square root to
    turn `dot_product(v, v)` — a *squared* length — back into a real
    length, the same way a real Pythagorean-theorem calculation needs a
    square root to turn the sum of two squared sides back into the
    hypotenuse's own length.

---

## Concept Unit: How Long Is a Vector? Introducing `math.sqrt`

### The Problem

`dot_product(v, v)` — a vector dotted with itself — was already computed
back in Lesson 7, but its result was never actually treated as "the
vector's length." There's a reason: `dot_product((3, 4), (3, 4))` computes
`3*3 + 4*4`, which is `25` — recognizably related to the Pythagorean
theorem, but `25` is not the length of a vector that a 3-4-5 right triangle
says should be `5`. Something is missing, and it's the same something the
Pythagorean theorem itself needs: a square root.

Python's `abs()`, used since Lesson 1, needed no `import` at all — it lives
in `builtins`, loaded into every Python program automatically. A square
root function isn't part of `builtins`. Before writing anything real,
isolate exactly how to reach it:

```python
import math

print(math.sqrt(9))
print(math.sqrt(2))
```

```
3.0
1.4142135623730951
```

Verified by actually running this. `math.sqrt(9)` returns `3.0` — the
familiar, exact square root of a perfect square, but returned as a `float`,
not the `int` a reader might expect from a whole-number input. This is
called **importing a module**: `import math` loads Python's built-in `math`
module and makes everything inside it reachable through the name `math`,
written `math.sqrt(...)` rather than a bare `sqrt(...)`. `math.sqrt(2)`
proves the function isn't limited to perfect squares — it returns
`1.4142135623730951`, an ordinary (irrational, approximated) square root.
This throwaway check is discarded now; it never appears in the project
again. Its only job was to prove `math.sqrt` works exactly as expected
before trusting it inside a real geometric function.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–8.
- **Files affected:** `geometry_lesson_09.py` — created, as a new file for
  this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else — `math` ships
  with every standard Python install.

### The New Code

```python
import math


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


x_axis = (1, 0)
movement = (3, 4)

print(norm(x_axis))
print(norm(movement))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has been
in so far.

### Mechanical Walkthrough

Every syntactic element in the block above, in order:

- `import math` — already given full treatment above, in the isolated lab.
  Its placement at the very top of the file, before any other code, is the
  conventional location for every `import` a Python file needs — worth
  noting even though nothing in the language actually requires it to sit
  first.
- `def dot_product(a, b): ...` — Lesson 7's own function, retyped
  unchanged. No re-explanation owed for its mechanics, per the Repetition
  Rule.
- `def norm(v):` — a function definition, already-basic syntax.
- `return math.sqrt(dot_product(v, v))` — the new idea, built from two
  already-covered pieces: `dot_product(v, v)` — the vector dotted with
  itself, `v[0]*v[0] + v[1]*v[1]`, which by the Pythagorean theorem is
  exactly the *square* of the vector's true length — passed straight into
  `math.sqrt`, which undoes that squaring and returns the real length.
- `x_axis = (1, 0)` — Lesson 6's own basis vector, retyped, chosen because
  its norm has been assumed to be exactly `1` since the lesson that
  introduced it, without proof until now.
- `movement = (3, 4)` — a vector chosen deliberately to form a 3-4-5 right
  triangle, so its norm comes out to a clean, checkable `5.0` instead of an
  approximate decimal.
- `print(norm(x_axis))` and `print(norm(movement))` — already-basic
  function calls, producing `1.0` and `5.0`.

### CS Lens

Computing a vector's length as the square root of its dot product with
itself is applying the **Pythagorean theorem**, generalized past two named
sides into a formula that works for a vector of any number of components.

```
Also recognized in: statistics (the standard deviation of a dataset is,
structurally, a norm — a square root of a sum of squared deviations),
signal processing (the RMS, or root-mean-square, amplitude of a signal is
the same square-root-of-summed-squares pattern), and machine learning
(the L2 norm of a weight vector, used to measure and penalize model
complexity, is exactly this operation applied to far more than two
components)
```

### SE Lens

The design principle is **reaching into a separate module instead of
assuming every useful function lives in `builtins`**. The alternative not
chosen: implement square root by hand — Newton's method, or repeated
approximation, written from scratch — rather than trusting a
pre-written, already-tested implementation from the standard library.

Writing square root by hand is a genuinely interesting exercise, and real
numerical-computing curricula do teach it. The cost of doing it here,
instead of importing it: a hand-written approximation needs its own
correctness argument, its own handling of edge cases (negative inputs,
zero, very large numbers), and its own testing — all before it can be
trusted inside `norm`, which itself needs to be trusted before Concept
Unit 2 can build a real distance function on top of it. `math.sqrt` has
already had all of that done, by people whose entire job was getting it
right, which is exactly the situation `import` exists to take advantage
of: reuse over reinvention, for a problem that's already been solved
correctly.

### Commands Needed

Same command as every prior lesson — `python geometry_lesson_09.py`.
Nothing new here.

### Run It

```
1.0
5.0
```

Verified by actually running the file above.

### Connection

`x_axis` really does have a norm of exactly `1.0` — the claim every prior
lesson made about it is finally proven, not assumed. The next unit uses
this same `norm` function to generalize Lesson 1's one-dimensional
`distance` into a real two-dimensional one.

---

## Concept Unit: Distance Between Two Points, Generalized

### The Problem

Lesson 1's `distance(a, b) = abs(a - b)` only ever worked for two plain
numbers — positions on a single track. Lesson 2 moved points into two
dimensions and never came back to `distance`; nothing in this curriculum
can currently answer "how far apart are these two 2D points" at all. The
answer turns out to be nothing more than "the length of the vector between
them" — and both of those pieces already exist.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_09.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(norm(movement))` line added in
  Concept Unit 1.
- **Dependencies:** none beyond what Concept Unit 1 already established.

### The New Code

```python
def subtract_points(head, tail):
    return (head[0] - tail[0], head[1] - tail[1])


def distance(p1, p2):
    return norm(subtract_points(p2, p1))


p1 = (0, 0)
p2 = (3, 4)
print(distance(p1, p2))
```

### The Updated Project

```python
import math


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


x_axis = (1, 0)
movement = (3, 4)

print(norm(x_axis))
print(norm(movement))


def subtract_points(head, tail):                     # ← new
    return (head[0] - tail[0], head[1] - tail[1])     # ← new


def distance(p1, p2):                                 # ← new
    return norm(subtract_points(p2, p1))               # ← new


p1 = (0, 0)                                            # ← new
p2 = (3, 4)                                            # ← new
print(distance(p1, p2))                                # ← new
```

The file as a whole now builds a complete chain: a dot product, a norm
built from that dot product, and a real 2D distance built from that norm —
each one a thin, one-line function wrapping the tool the previous unit or
lesson already proved correct.

### Mechanical Walkthrough

Every syntactic element in this unit's new code, in order:

- `def subtract_points(head, tail): ...` — Lesson 2's own function,
  retyped unchanged. No re-explanation owed, per the Repetition Rule.
- `def distance(p1, p2):` — a function definition, already-basic syntax,
  reusing the exact name Lesson 1's own 1D `distance` used — deliberately,
  since this is that same function's generalization, not an unrelated new
  one.
- `return norm(subtract_points(p2, p1))` — the new idea, in one line:
  `subtract_points(p2, p1)` produces the vector *from* `p1` *to* `p2`
  (Lesson 2's own head/tail convention), and `norm` of that vector is
  exactly how far apart `p1` and `p2` are — direction discarded, only
  distance kept, the same relationship Lesson 1's `abs(a - b)` had with
  the 1D case.
- `p1 = (0, 0)` and `p2 = (3, 4)` — the same 3-4-5 pair `movement` already
  used in Concept Unit 1, chosen again so the answer, `5.0`, is checkable
  by hand rather than trusted blindly.
- `print(distance(p1, p2))` — an already-basic function call, producing
  `5.0` — exactly `norm(movement)`'s own answer from Concept Unit 1, since
  `subtract_points((3, 4), (0, 0))` returns `movement` itself.

### CS Lens

Building a 2D distance function out of an existing 1D one's *shape* — "the
norm of the difference" — while changing nothing about what `distance`
conceptually means, is **generalization through a shared interface**: the
same name, the same contract ("how far apart are these two things"),
extended to a case the original implementation never anticipated.

```
Also recognized in: overloaded operators in many languages (the same `+`
symbol meaning "add numbers," "concatenate strings," or "combine vectors,"
depending on what it's given), REST APIs (the same endpoint shape serving
both a single resource and a paginated collection of them), and
mathematics itself (the Pythagorean theorem in 2D, extended without
changing its underlying idea into 3D, and eventually into arbitrarily many
dimensions)
```

### SE Lens

The design principle is **building the general case out of already-proven
smaller pieces**, rather than writing a brand-new 2D distance formula from
scratch. The alternative not chosen: implement `distance(p1, p2)` directly
as `math.sqrt((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2)` — mathematically
identical, but written as one dense expression instead of composed from
`subtract_points`, `dot_product`, and `norm`.

The dense, all-in-one version isn't wrong, and it's arguably more familiar
to anyone who already knows the distance formula by heart. The cost this
lesson's composed version avoids: if `dot_product` or `norm` ever needed a
fix — say, extending to 3D by adding a `z` component — the all-in-one
version would need every distance-shaped formula across the whole project
found and fixed by hand. The composed version needs exactly one change,
inside `dot_product` itself, and `norm` and `distance` both inherit the
fix automatically, because they were never anything but thin wrappers
around it.

### Commands Needed

Same command as Concept Unit 1 — `python geometry_lesson_09.py`. Nothing
new here.

### Run It

```
1.0
5.0
5.0
```

Verified by actually running the updated file above.

### Connection

Lesson 1's `distance` now has a real 2D counterpart, built from Lesson 7's
dot product and this lesson's `norm` rather than reinvented from
scratch. Lesson 10, Normalization, uses this exact `norm` function for one
more job: turning any vector, of any length, into a unit vector pointing
the same direction.

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish — closing a loop opened back in Lesson 7:

1. Lesson 7 projected `feature_in_part = (3, 4)` onto `stretched_x_axis =
   (2, 0)` and got `6` instead of the true x-component, `3` — a result the
   Closing section of that lesson could observe but not fully explain,
   since nothing yet could measure `stretched_x_axis`'s own length.
2. `norm(stretched_x_axis)` computes `math.sqrt(dot_product((2, 0), (2,
   0)))`.
3. `dot_product((2, 0), (2, 0))` computes `2*2 + 0*0`, which is `4`.
4. `math.sqrt(4)` returns `2.0` — proof, finally available, that
   `stretched_x_axis` is not a unit vector at all; it's exactly twice as
   long as the real `x_axis`.
5. That `2.0` is exactly the factor by which Lesson 7's projection came out
   wrong: `6` instead of `3` is `3` multiplied by that same `2.0`. The
   mystery Lesson 7 had to leave unresolved is, with this lesson's `norm`
   in hand, no longer a mystery at all.

## What Breaks Without This

`norm` is `math.sqrt(dot_product(v, v))` — two steps. Drop the `math.sqrt`
and use only the dot product, a mistake that's easy to make since
`dot_product(v, v)` looks, at a glance, like it might already be "the
length":

```python
def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


movement = (3, 4)
forgot_sqrt = dot_product(movement, movement)
print(forgot_sqrt)
```

```
25
```

Verified by actually running this. `25`, not `5` — this is the vector's
**squared** length, not its length. It isn't a crash, and for a vector this
short the mistake might even go unnoticed if the number is only ever
compared to other squared lengths (a real, legitimate optimization some
programs deliberately use, to avoid the cost of a square root when only
*comparing* two distances, not reporting an exact one). The danger is
using a squared length exactly where a real one was needed — printing
`25` as "the distance," or feeding it into a formula that assumed an
un-squared value — which produces a plausible-looking but wrong number
with no error anywhere in sight.

## Exercises

1. Predict, then verify: what does `norm((0, 0))` return — the length of a
   vector with no direction and no size at all? Explain why that answer is
   the only sensible one.
2. Compute `distance((1, 1), (4, 5))` by hand — subtract the points, then
   apply the Pythagorean theorem to the result — before running it, then
   verify your program agrees.
3. Using `norm` and `scale_vector` from Lesson 3, write a check that
   confirms `stretched_x_axis` scaled by `0.5` has a norm of exactly `1.0`
   — in other words, find the correction that would have made Lesson 7's
   projection come out right.

## Definition of Done

- [ ] `geometry_lesson_09.py` exists and runs with no errors via
      `python geometry_lesson_09.py`.
- [ ] Running it prints `1.0`, `5.0`, then `5.0` again — matching this
      lesson's verified output exactly.
- [ ] You can explain, without looking at the file, why `norm` needs both
      `dot_product` and `math.sqrt`, and what `dot_product(v, v)` alone
      actually represents if the `sqrt` is left out.
- [ ] You can explain, using this lesson's own numbers, why Lesson 7's
      projection onto `stretched_x_axis` came out double the true
      component.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Add norm and 2D distance: a vector's length is the sqrt of its dot product with itself"`,
      not `git commit -m "add norm and distance functions"`.

Next: Lesson 10 — Normalization, where this lesson's `norm` gets used in
reverse: not to measure a vector's length, but to strip it away entirely,
producing a unit vector that keeps only a direction.
