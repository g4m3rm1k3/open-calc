# Lesson 10: Normalization

**What you will build:** A `normalize` function that strips a vector's
length away entirely, leaving only its direction — turning any vector into
a unit vector, the exact property Lesson 6 and 7 assumed and Lesson 9
finally learned how to measure. You'll then break it on purpose, feeding it
a vector with no direction at all, and watch Python refuse outright rather
than return a wrong answer. The transferable problem: some geometric
operations only care about *which way* something points, not how far — a
lighting calculation cares about a surface's direction, not its
arbitrary length; a projection needs a true unit vector to give a correct
answer at all, as Lesson 7's stretched-axis mistake proved. Normalization
is the operation that isolates direction from magnitude.

**What you need to know first:** Lesson 3's `scale_vector` and Lesson 9's
`norm`. This lesson combines both into one new function and one important
numerical warning.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–9.

**Terms introduced in this lesson:**

- **Normalize** — to scale a vector by the reciprocal of its own norm,
  producing a unit vector that points the same direction but has a length
  of exactly `1`. Why: Lesson 7's projection trick and Lesson 6's basis
  vectors both depend on their inputs already being unit vectors;
  normalization is how an arbitrary vector, of any length, gets turned into
  one.

**Objects and methods used:**

None new. This lesson reuses Lesson 3's `scale_vector` and Lesson 9's
`norm` and `dot_product`; division itself is ordinary arithmetic already
covered by this lesson's assumed background.

---

## Concept Unit: Stripping Away Length

### The Problem

Lesson 7's projection trick — dotting a vector against a basis vector to
recover a component — only gave the right answer when the basis vector's
length was exactly `1`. Lesson 6's basis vectors happened to already be
unit vectors, built that way from the start. Not every vector this
curriculum will ever need a direction from is going to be that convenient
— a cutting force, a camera's facing direction, a surface's own tilt might
have any length at all. Something needs to take an arbitrary vector and
produce a unit vector that still points the same way.

*A note on method:* like Lesson 9's `norm`, this unit's operation is built
entirely from already-covered pieces — `scale_vector`, `norm`, and
ordinary division. No throwaway syntax lab is needed; the new content is
mathematical, taught directly in the real code below.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–9.
- **Files affected:** `geometry_lesson_10.py` — created, as a new file for
  this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
import math


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def normalize(v):
    return scale_vector(v, 1 / norm(v))


movement = (3, 4)
direction = normalize(movement)
print(direction)
print(norm(direction))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has been
in so far.

### Mechanical Walkthrough

Every syntactic element in the block above, in order:

- `import math`, `def dot_product(...)`, `def norm(...)`, `def
  scale_vector(...)` — Lessons 3 and 9's own code, retyped unchanged. No
  re-explanation owed for their mechanics, per the Repetition Rule.
- `def normalize(v):` — a function definition, already-basic syntax.
- `return scale_vector(v, 1 / norm(v))` — the new idea. `norm(v)` measures
  `v`'s own length. `1 / norm(v)` is that length's reciprocal — ordinary
  division, already covered by this lesson's assumed background.
  `scale_vector(v, ...)` then shrinks or grows `v` by exactly that
  reciprocal factor: a vector twice as long as a unit vector gets scaled by
  `1/2`, ending up exactly unit length; a vector already unit length gets
  scaled by `1/1`, unchanged. Every case lands at length `1`, pointing
  wherever `v` originally pointed.
- `movement = (3, 4)` — the same 3-4-5 vector Lesson 9 used, retyped, so
  the result can be checked by hand: a `3-4-5` triangle's direction is a
  well-known `(0.6, 0.8)`.
- `direction = normalize(movement)` and the two `print(...)` calls —
  already basic, producing `direction` itself and then `direction`'s own
  norm, as a check that normalization actually did what it claims.

### Run It

```
(0.6000000000000001, 0.8)
1.0
```

Verified by actually running the file above. The x-component prints as
`0.6000000000000001`, not the clean `0.6` hand arithmetic would predict —
Python's floating-point division doesn't represent `3/5` exactly in
binary, the same kind of rounding Lesson 17, Numerical Error in Geometry,
covers in full. `norm(direction)` still comes back as a clean `1.0` here,
but that's not something to rely on in general — floating-point rounding
like this can, and does, accumulate into a length that's off by a tiny
amount rather than landing exactly on `1.0`.

### CS Lens

Separating a compound quantity into a magnitude and a direction, then
discarding the magnitude on purpose, is **decomposition into orthogonal
properties** — splitting a value into independent pieces that can be
reasoned about, and manipulated, separately.

```
Also recognized in: complex numbers (any complex number decomposes into a
magnitude and an angle, the same way this lesson splits a vector into a
length and a direction), color representation (HSL color splits hue —
direction around a color wheel — from lightness and saturation, its own
kind of magnitude), and physics (velocity decomposing into speed, a plain
magnitude, and heading, a pure direction, exactly mirroring this lesson's
`norm` and `normalize`)
```

### SE Lens

The design principle is **isolating the one property a calculation
actually needs**, rather than carrying an entire vector's worth of
information into a function that only cares about direction. The
alternative not chosen: pass raw, un-normalized vectors into every
function that only cares about direction, and let each one recompute or
work around the leftover magnitude itself.

That alternative already failed once, concretely: Lesson 7's projection
against `stretched_x_axis` produced a plausible-but-wrong answer precisely
because it received a non-unit vector where a unit vector was assumed.
Normalizing at the boundary — once, in one function, before a direction
-only calculation ever runs — means every downstream function can safely
assume its direction inputs are already unit length, instead of each one
needing its own defensive check.

### Commands Needed

Same command as every prior lesson — `python geometry_lesson_10.py`.
Nothing new here.

### Run It

Already shown above, as this unit's own verified output.

### Connection

`normalize` correctly turns a real vector into a unit-length direction.
The next unit asks what happens when there's no direction to extract at
all — when the vector being normalized has no length whatsoever.

---

## Concept Unit: The Numerical Trap — Normalizing Zero

### The Problem

`normalize(v)` divides by `norm(v)`. Division by zero is undefined in
ordinary arithmetic, and Python enforces that directly rather than
returning some placeholder value. A zero-length vector — `(0, 0)` — is a
completely realistic input in real geometry: the direction from a point to
itself, a surface normal computed from three points that happen to be
collinear, a camera's facing direction when its target coincides exactly
with its own position. What does `normalize` actually do when handed one?

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** none — this unit is a deliberate demonstration of
  failure, run as its own standalone script rather than appended to
  `geometry_lesson_10.py`, so the working file from Concept Unit 1 is never
  left in a broken state.
- **Change type:** not applicable.
- **Location:** not applicable.
- **Dependencies:** none beyond what Concept Unit 1 already established.

### The New Code

```python
zero_vector = (0, 0)
print(normalize(zero_vector))
```

### The Updated Project

Not applicable — this unit deliberately does not modify
`geometry_lesson_10.py`; see Project Change above.

### Mechanical Walkthrough

Every syntactic element in the block above, in order:

- `zero_vector = (0, 0)` — a plain tuple assignment, already basic. What
  makes it worth its own variable name, rather than just writing `(0, 0)`
  inline, is what it represents: the one vector whose norm is `0`,
  verified directly in Lesson 9's own exercises.
- `print(normalize(zero_vector))` — a function call, already basic in its
  syntax, but its *behavior* here is the entire point of this unit: inside
  `normalize`, `norm(zero_vector)` returns `0.0`, and `1 / 0.0` is exactly
  the division by zero Python refuses to silently paper over.

### Run It

```
Traceback (most recent call last):
  File "geometry_lesson_10_broken.py", line 21, in <module>
    print(normalize(zero_vector))
          ~~~~~~~~~^^^^^^^^^^^^^
  File "geometry_lesson_10_broken.py", line 17, in normalize
    return scale_vector(v, 1 / norm(v))
                           ~~^~~~~~~~~
ZeroDivisionError: division by zero
```

Verified by actually running this. Unlike every prior lesson's "what
breaks" moments — a silently wrong answer, a plausible-looking but
incorrect tuple — this one crashes outright, immediately, with a
`ZeroDivisionError` and a traceback pointing exactly at the failing line.

### CS Lens

A zero-length vector having no defined direction is a **degenerate case**
— an input that technically fits a function's expected shape (a plain
2-tuple, indistinguishable in type from any other vector) but breaks an
assumption the function's logic secretly depends on.

```
Also recognized in: dividing total distance by zero elapsed time to
compute speed, computing the slope of a perfectly vertical line (an
infinite or undefined "rise over run"), and normalizing a dataset column
that happens to contain the exact same value in every row, leaving no
variation to divide by
```

### SE Lens

The design principle at work isn't one this lesson's own code chose — it's
Python's own division operator refusing, by design, to return a
placeholder value like `0` or `infinity` for an undefined operation,
forcing the caller to confront the problem immediately rather than let a
meaningless result travel silently downstream. The alternative some
languages and libraries do choose: return a special "not a number" value
(`NaN`) instead of raising an error, letting the broken computation
continue to run.

Both approaches have real, documented tradeoffs. A loud crash, the way
Python's `ZeroDivisionError` works, stops the program at the exact moment
and location the problem occurred — easy to diagnose, but potentially
disruptive if the crash happens somewhere a program genuinely cannot
afford to stop, like the middle of a real-time animation loop. A silent
`NaN`, the way some numerical libraries prefer, keeps a program running,
but the "not a number" value tends to spread through every later
calculation that touches it, turning one degenerate input into an entire
downstream trail of meaningless results that can be far harder to trace
back to its actual origin. Neither is universally "correct" — but knowing
which one you're relying on, before a zero vector shows up in real data,
is the entire point of this unit.

### Commands Needed

Same command as every prior lesson, run against the standalone broken
script rather than `geometry_lesson_10.py` — nothing new here.

### Run It

Already shown above, as this unit's own verified crash.

### Connection

`normalize` is now fully understood: correct for any real direction,
and honestly, loudly wrong for the one input that has no direction at
all. Lesson 11, Orientation, picks up from here, using unit vectors and
signed area — Lesson 8's cross product — to formally define handedness and
winding, the two ideas this curriculum has been informally leaning on
since Lesson 6.

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish:

1. `movement = (3, 4)` — a vector with a real, nonzero length.
2. `norm(movement)` computes `math.sqrt(dot_product((3, 4), (3, 4)))`,
   which is `math.sqrt(9 + 16)`, which is `math.sqrt(25)`, which is `5.0`
   — Lesson 9's own already-verified answer.
3. `1 / norm(movement)` computes `1 / 5.0`, which is `0.2`.
4. `scale_vector((3, 4), 0.2)` computes `(3 * 0.2, 4 * 0.2)`, which Python
   actually returns as `(0.6000000000000001, 0.8)` due to floating-point
   rounding, not the mathematically exact `(0.6, 0.8)`.
5. `norm(direction)` recomputes the length of this new, shorter vector:
   `dot_product` gives back a value extremely close to `1.0`, and
   `math.sqrt` of that returns `1.0` — proof, even with the tiny rounding
   error along the way, that the result really is (for all practical
   purposes) a unit vector.

## What Breaks Without This

Already demonstrated, in full, as this lesson's second Concept Unit:
`normalize((0, 0))` raises `ZeroDivisionError`, immediately, rather than
returning any kind of point, vector, or placeholder value. No separate
demonstration is needed here — the crash itself *is* this lesson's "what
breaks" section, moved earlier because it was the second unit's entire
subject rather than an afterthought.

## Exercises

1. `normalize` never checks its input's length before dividing. Without
   changing `normalize` itself, write a small check *before* calling it
   that decides whether a vector is safe to normalize, using `norm`. (This
   curriculum hasn't formally covered `if`/`else` yet — write your check
   using a boolean expression and `assert`, which halts a program with a
   clear message if given a `False` value, the way `assert norm(v) != 0`
   would.)
2. Predict, then verify: does `normalize(scale_vector(movement, -1))` point
   in the same direction as `normalize(movement)`, or the opposite one?
   Explain using what Lesson 3 already proved about `scale_vector` with a
   negative factor.
3. Compute `normalize((5, 0))` by hand before running it. Explain, in one
   sentence, why normalizing a vector that already points exactly along
   the x-axis produces a result you could have predicted without any
   arithmetic at all.

## Definition of Done

- [ ] `geometry_lesson_10.py` exists and runs with no errors via
      `python geometry_lesson_10.py`.
- [ ] Running it prints `(0.6000000000000001, 0.8)`, then `1.0` — matching
      this lesson's verified output exactly.
- [ ] You have actually run the zero-vector version and seen the real
      `ZeroDivisionError` traceback, not just read about it.
- [ ] You can explain, without looking at the file, why normalizing a
      zero-length vector is mathematically undefined, not just a Python
      technicality.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Add normalize: strip a vector's length to get a unit direction, and confirm it crashes honestly on zero"`,
      not `git commit -m "add normalize function"`.

Next: Lesson 11 — Orientation, where Lesson 8's cross product and this
lesson's unit vectors combine to formally define handedness and winding —
ideas this curriculum has been using informally since the first tilted
basis in Lesson 6.
