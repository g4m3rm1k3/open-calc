# Lesson 3: Scalars and Geometric Quantities

**What you will build:** Two small, separate demonstrations in one file.
First, a second and third robot position on Lesson 1's track, used to prove
that two *measurements* (distances) can be meaningfully added together even
though Lesson 2 already proved two *points* cannot. Second, a `scale_vector`
function that makes a movement bigger, smaller, or reversed — built by hand,
after proving Python's own `*` operator cannot be trusted to do it. The
transferable problem: a third kind of number is now in play, one that isn't
a location or a movement at all — a plain measurement, like a distance, an
angle, or a scale factor — and it has to be told apart from both, especially
because it sometimes looks *identical* to a point once written down.

**What you need to know first:** Lesson 1's `distance` function and its
six-word taxonomy; Lesson 2's point/vector distinction and its
`subtract_points` pattern. This lesson assumes both without re-explaining
them from scratch.

**Assumed background (outside this curriculum):** unchanged from Lessons 1
and 2.

**Terms introduced in this lesson:**

- **Scalar** — a plain quantity with a size but no direction and no
  location: a measurement like a distance, an angle, a mass, or a scale
  factor. Why: Lesson 1's `distance` function already produced one of these
  without naming it, and Lesson 2's 1D positions and this lesson's scalars
  can both be a single plain Python number — the name exists precisely to
  keep those two from being confused just because they share a
  representation.
- **Scalar multiplication** (of a vector) — multiplying every component of
  a vector by the same plain number, producing a new vector pointing the
  same direction (or the exact opposite, if the number is negative) and
  scaled longer or shorter. Why: this is the actual operation behind
  everyday ideas like "twice as far," "half speed," or "reverse direction."

**Objects and methods used:**

None. Every operation this lesson performs was already covered by Lessons 1
and 2's assumed background or by their own code. This lesson's new material
is, once again, entirely conceptual and mathematical, not syntactic.

---

## Concept Unit: A Plain Number Can Mean Two Different Things

### The Problem

Lesson 1's `robot_a = 3` and Lesson 1's `distance(robot_a, robot_b)` (which
evaluates to `6`) are both, as far as Python is concerned, the exact same
kind of thing: a plain integer. Lesson 2 gave a name to the difference
between a location and a movement, even though both were 2D tuples. This
lesson asks the same question one level down: are `3` (a position) and `6`
(a distance) the same kind of number, just because they're both plain
integers with no tuple around them at all?

*A note on method:* like Lessons 1 and 2's taxonomy units, this is a
modeling idea, not a new Python construct — plain integers and addition
were already part of this lesson's assumed background. No throwaway syntax
lab is needed here.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1 and 2.
- **Files affected:** `geometry_lesson_03.py` — created, as a new file for
  this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
robot_a = 3
robot_b = 9


def distance(a, b):
    return abs(a - b)


leg_1 = distance(robot_a, robot_b)
print(leg_1)

robot_c = 15
leg_2 = distance(robot_b, robot_c)
print(leg_2)

total_distance = leg_1 + leg_2
print(total_distance)
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation both prior lessons' first units
were in.

### Mechanical Walkthrough

Every syntactic element in the block above, in order:

- `robot_a = 3` and `robot_b = 9` — plain variable assignments, already
  basic. Worth naming explicitly, though, using this lesson's new
  vocabulary: per Lesson 2's terms, these are **1D points** — locations on
  a single track — even though neither is wrapped in a tuple the way
  Lesson 2's 2D points were. A point doesn't need more than one number; it
  needs exactly as many numbers as there are dimensions to locate it in,
  and a single track only has one.
- `def distance(a, b): return abs(a - b)` — this is the exact `distance`
  function built and fully explained in Lesson 1, retyped here unchanged.
  Per the Repetition Rule, its mechanics don't get re-explained — but it's
  worth restating, by name, what it *is*: a function that takes two points
  and returns the scalar measurement of how far apart they are.
- `leg_1 = distance(robot_a, robot_b)` — a function call, already basic.
  `leg_1` now holds `6` — a **scalar**, not a point. Unlike `robot_a` and
  `robot_b`, `leg_1` doesn't describe "where" anything is; it describes
  "how much" separation exists between two points that themselves already
  exist elsewhere in the program.
- `robot_c = 15` — a third 1D point, introduced specifically so a second,
  independent distance can be measured.
- `leg_2 = distance(robot_b, robot_c)` — the same function, called again
  with a different pair of points, producing a second scalar, `6`.
- `total_distance = leg_1 + leg_2` — this is the new idea in this unit:
  plain `+` on `leg_1` and `leg_2` computes `12`, and — unlike Lesson 2's
  `robot_start + robot_end`, which silently did the wrong thing — this
  addition is exactly right. `leg_1` and `leg_2` are both scalars, and
  adding two scalar distances together (the length of one leg of a journey,
  plus the length of a second leg) produces a third meaningful distance:
  the total. Scalars, unlike points, are safe to add.

### CS Lens

Sorting plain numbers into "a location" versus "a measurement" — even when
both are written identically, as a bare Python `int` — is the same
**scalar versus vector-space-element** distinction physics has used for
centuries, just applied here to Lesson 2's points as well as vectors.

```
Also recognized in: physics (mass, temperature, energy, and speed are
scalars; velocity, force, and displacement are vectors — speed is "how
fast," velocity is "how fast, in which direction"), audio engineering (a
volume knob is a scalar gain; stereo pan is closer to a direction), and
CAD/CAM itself (a feed rate or spindle speed is a scalar; a tool's
orientation is a vector — a preview of Lesson 340's Tool Orientation)
```

### SE Lens

The design principle is **the same one Lesson 2 established, applied one
level down**: a value's *representation* (a bare Python number, here,
instead of a tuple) does not by itself tell you whether an operation on it
is meaningful. The alternative not chosen: assume that because `robot_a`
and `leg_1` are both plain integers, whatever Python's operators do to them
must be safe.

That assumption isn't punished the way Lesson 2's was — Python's `+`
really does compute the right answer for `leg_1 + leg_2`, because addition
really is what "combining two distances" means. But the same assumption,
applied to `robot_a + robot_b`, would silently compute `12` — a number that
looks exactly as plausible as `total_distance` did, while meaning nothing
at all: there is no sensible "location" produced by adding two other
locations together, on a track or anywhere else. Unlike Lesson 2's tuple
`+`, which at least *looked* different (a longer tuple, not a 2D point) and
gave the mistake away, adding two 1D points with plain `+` produces a
perfectly ordinary-looking integer with no visible sign anything went
wrong. The cost of *not* keeping "point" and "scalar" straight in your own
head, here, is a bug with no symptom at all — which is exactly why this
lesson exists before any code actually needs to add two points together.

### Commands Needed

Same command as Lessons 1 and 2 — `python geometry_lesson_03.py`. Nothing
new here.

### Run It

```
6
6
12
```

Verified by actually running the file above.

### Connection

Lesson 1's `distance` function has a real name for what it returns now:
a scalar. The next unit puts that word to work on the *other* side of
Lesson 2's vocabulary — not measuring a vector, but resizing one.

---

## Concept Unit: Scaling a Vector — Multiplying by a Scalar

### The Problem

Lesson 2's `movement` vector describes one specific move. Plenty of real
situations need that same shape of move, just bigger, smaller, or
backwards — a CNC program running a roughing pass at double step-over, a
camera zoom, a physics engine applying half a time-step's worth of
velocity. Before writing that operation by hand, check whether Python's `*`
— which you already know multiplies plain numbers — happens to do the
sensible thing to a tuple, too:

```python
movement = (2, -1)

print(movement * 3)
print(movement * -1)
```

```
(2, -1, 2, -1, 2, -1)
()
```

Verified by actually running this. `movement * 3` doesn't scale the vector
at all — it **repeats** the tuple three times end to end, the same
sequence-oriented behavior as the `+` concatenation surprise from Lesson 2,
now showing up on `*`. This is called **sequence repetition**, and it's
worse than merely wrong here: `movement * -1` doesn't even repeat anything
— Python treats a negative repeat count as zero repetitions, so the result
is an **empty tuple**, `()`, silently discarding both components entirely.
This throwaway check is discarded now; it never appears in the project
again. Its only job was to prove that `*`, like `+` before it, cannot be
trusted on a tuple standing in for a vector — whatever "scale this vector"
means has to be written by hand, the same way `subtract_points` and
`add_vector_to_point` were in Lesson 2.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_03.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(total_distance)` line added in
  Concept Unit 1.
- **Dependencies:** none beyond what Concept Unit 1 already established.

### The New Code

```python
def subtract_points(head, tail):
    return (head[0] - tail[0], head[1] - tail[1])


robot_start = (3, 4)
robot_end = (5, 3)
movement = subtract_points(robot_end, robot_start)
print(movement)


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


doubled = scale_vector(movement, 3)
print(doubled)

reversed_movement = scale_vector(movement, -1)
print(reversed_movement)
```

### The Updated Project

```python
robot_a = 3
robot_b = 9


def distance(a, b):
    return abs(a - b)


leg_1 = distance(robot_a, robot_b)
print(leg_1)

robot_c = 15
leg_2 = distance(robot_b, robot_c)
print(leg_2)

total_distance = leg_1 + leg_2
print(total_distance)


def subtract_points(head, tail):                  # ← new
    return (head[0] - tail[0], head[1] - tail[1])  # ← new


robot_start = (3, 4)                                # ← new
robot_end = (5, 3)                                  # ← new
movement = subtract_points(robot_end, robot_start)  # ← new
print(movement)                                     # ← new


def scale_vector(vector, factor):                   # ← new
    return (vector[0] * factor, vector[1] * factor) # ← new


doubled = scale_vector(movement, 3)                 # ← new
print(doubled)                                      # ← new

reversed_movement = scale_vector(movement, -1)      # ← new
print(reversed_movement)                            # ← new
```

The file as a whole now demonstrates two separate but related lessons about
plain numbers: the top half proves two scalars can be safely added where
two points could not; the bottom half rebuilds a Lesson 2 vector, then
scales it up and reverses it, proving both results by hand after showing
Python's native `*` cannot produce either one correctly.

### Mechanical Walkthrough

Every syntactic element in this unit's new code, in order:

- `def subtract_points(head, tail): ...` and the `robot_start`,
  `robot_end`, `movement` lines that follow — this is Lesson 2's own
  function and pattern, retyped here unchanged. Per the Repetition Rule, no
  re-explanation is owed; it's reused exactly as it was built.
- `def scale_vector(vector, factor):` — a function definition, already
  basic syntax. The parameter names matter: `vector` is the thing being
  resized, `factor` is the scalar doing the resizing — naming them this way
  makes the function's contract readable without needing to open its body.
- `return (vector[0] * factor, vector[1] * factor)` — a new tuple literal,
  built from two multiplications. `vector[0]`, `vector[1]` are ordinary
  tuple indexing, already covered. The multiplication itself is ordinary
  arithmetic — but what it computes is the new idea: multiplying *each
  component separately* by the same scalar, rather than multiplying the two
  components together or doing anything to the tuple as a whole, is exactly
  what "make this movement bigger by this factor" means geometrically. This
  is the by-hand fix for the failure the throwaway check just proved:
  component-by-component multiplication, not sequence repetition.
- `doubled = scale_vector(movement, 3)` — a function call, already basic.
  Passing `3` scales `movement` to three times its original size in the
  same direction — the correct version of what `movement * 3` was supposed
  to do above, and visibly a different, sensible-looking result
  (`(6, -3)`) rather than a six-item tuple.
- `reversed_movement = scale_vector(movement, -1)` — the same function,
  called with `-1`. Multiplying every component by `-1` flips the sign of
  each one, which turns "2 right, 1 down" into "2 left, 1 up" — the exact
  opposite movement. This is the correct version of what `movement * -1`
  was supposed to do, in stark contrast to the empty tuple that operator
  actually produced.

### CS Lens

Multiplying every component of a compound value by the same scalar,
independently, is the core operation behind **linear scaling** — the same
mathematical move whether it's applied to a 2D vector, a 3D vector, an
image's brightness values, or a spreadsheet column.

```
Also recognized in: image editing (a "brightness" slider multiplies every
pixel's value by the same factor), audio production (a gain control
multiplies every sample by the same factor), financial modeling (scaling
every line item in a budget by a common growth-rate factor), and physics
simulation (multiplying a velocity vector by a time-step scalar to get a
displacement)
```

### SE Lens

The design principle, again, is **writing the operation by hand instead of
trusting the language's built-in operator on the wrong type** — the same
principle Lesson 2 established for `+`, now confirmed to hold for `*` as
well. The alternative not chosen: assume that because `*` scales plain
numbers correctly, it must generalize sensibly to a tuple standing in for a
vector.

The real cost of that assumption, demonstrated concretely above, isn't
symmetric between the two operators: `movement * 3` at least produces a
tuple of the *wrong length*, which a length check or a moment of confusion
might eventually catch. `movement * -1` produces an *empty* tuple —
something that would likely crash, loudly, the next time any code tried to
read `vector[0]` from it, rather than silently propagating a wrong-but-
plausible answer the way Lesson 3's own `robot_a + robot_b` would have.
Neither failure mode is acceptable, but they fail differently, which is
worth knowing before you're the one debugging whichever one you hit.

### Commands Needed

Same command as Concept Unit 1 — `python geometry_lesson_03.py`. Nothing
new here.

### Run It

```
6
6
12
(2, -1)
(6, -3)
(-2, 1)
```

Verified by actually running the updated file above.

### Connection

This lesson now has both halves of the scalar story: a scalar produced by
measuring (`distance`, Concept Unit 1) and a scalar consumed to resize a
vector (`scale_vector`, this unit). Between Lesson 2's point/vector split
and this lesson's scalar, this curriculum's core vocabulary — object,
relationship, measurement — has its first three concrete geometric object
types: point, vector, and scalar.

---

## Connect the Pieces

One concrete value, traced through this lesson's second half, start to
finish:

1. `robot_start = (3, 4)` and `robot_end = (5, 3)` — two points, rebuilt
   from Lesson 2.
2. `subtract_points(robot_end, robot_start)` computes `movement = (2, -1)`
   — a vector, exactly as it did in Lesson 2.
3. `scale_vector(movement, 3)` is called — inside the function, `vector` is
   bound to `(2, -1)` and `factor` is bound to `3`.
4. `vector[0] * factor` evaluates to `2 * 3`, which is `6`. `vector[1] *
   factor` evaluates to `-1 * 3`, which is `-3`.
5. The function returns `(6, -3)` — the same direction as `movement`, three
   times as long.
6. `scale_vector(movement, -1)` is called next — `factor` is now `-1`.
7. `vector[0] * factor` evaluates to `2 * -1`, which is `-2`. `vector[1] *
   factor` evaluates to `-1 * -1`, which is `1`.
8. The function returns `(-2, 1)` — the exact reverse of `movement`, proving
   that scalar multiplication by a negative number flips a vector's
   direction without changing what kind of thing it is: still a vector,
   never a point, no matter what scalar it's multiplied by.

## What Breaks Without This

Skip `scale_vector` and reach for the language's own `*` operator directly,
the way a reader in a hurry might:

```python
movement = (2, -1)

reversed_movement = movement * -1
print(reversed_movement)

print(reversed_movement[0])
```

```
()
Traceback (most recent call last):
  File "geometry_lesson_03_broken.py", line 6, in <module>
    print(reversed_movement[0])
          ~~~~~~~~~~~~~~~~~^^^
IndexError: tuple index out of range
```

Verified by actually running this broken version. Unlike Lesson 1's and
Lesson 2's silent, wrong-but-plausible failures, this one crashes outright
— which sounds worse but is, in one sense, the friendlier failure: a
crash with a traceback tells you immediately, and exactly, that something
is wrong, at the moment it goes wrong, rather than letting a wrong answer
travel silently through the rest of the program the way `robot_a +
robot_b` or `movement * 3` would have.

## Exercises

1. Predict, before running it, what `scale_vector(movement, 0)` returns for
   any vector `movement`. What does a vector scaled by zero mean
   geometrically? Verify your prediction.
2. Predict, before running it, what `scale_vector(movement, 1)` returns.
   Explain, in one sentence, why multiplying by `1` should always return an
   unchanged vector, and confirm your program agrees.
3. `total_distance = leg_1 + leg_2` worked correctly with plain `+` because
   both operands were scalars. Using `scale_vector` and `add_vector_to_point`
   from Lesson 2, compute the point the robot reaches after moving along
   `movement` three times in a row, starting from `robot_start` — without
   calling either function more than twice total.

## Definition of Done

- [ ] `geometry_lesson_03.py` exists and runs with no errors via
      `python geometry_lesson_03.py`.
- [ ] Running it prints `6`, `6`, `12`, `(2, -1)`, `(6, -3)`, then
      `(-2, 1)` — matching this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, why `leg_1 + leg_2` is
      safe but `robot_a + robot_b` would silently be nonsense, even though
      both use the exact same `+` operator on the exact same kind of plain
      Python number.
- [ ] You can explain what `movement * 3` and `movement * -1` actually
      compute in real Python, and why neither result is the scaled or
      reversed vector a reader might expect.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Add scalars: distances can be summed safely, points can't, and vectors need scale_vector instead of *"`,
      not `git commit -m "add scalar and scale_vector"`.

Next: Lesson 4 — Coordinate Systems, where "3, 4" stops being an absolute
fact about a point and becomes a fact that only makes sense relative to a
chosen frame of reference — the same position can be a different pair of
numbers depending on where you decide to measure from.
