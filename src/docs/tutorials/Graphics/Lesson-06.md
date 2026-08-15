# Lesson 6: Basis Vectors

**What you will build:** A function that reconstructs a point from two plain
numbers *and* two explicit direction vectors, proving that every tuple this
curriculum has written so far — `(3, 4)`, every point, every vector — was
secretly leaning on an unstated assumption about which way "x" and "y"
actually point. You'll then swap those two direction vectors for a
different pair and watch the exact same numbers, `(3, 4)`, land on a
completely different physical spot. The transferable problem: Lesson 4 and
5 showed that a coordinate's meaning depends on a chosen origin. This
lesson shows the other half — a coordinate's meaning depends just as much
on a chosen pair of axis directions, and every lesson before this one has
been quietly assuming one specific choice without ever saying so.

**What you need to know first:** Lesson 2's `add_vector_to_point`, Lesson
3's `scale_vector`, and Lesson 4/5's idea that a coordinate system is a
*choice*, not a fact of nature. This lesson completes that idea.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–5.

**Terms introduced in this lesson:**

- **Basis vector** — one of the vectors that defines a coordinate system's
  axis directions and unit length; a 2D coordinate system needs exactly two
  (one per dimension). Why: "3 units in the x-direction" is meaningless
  until "the x-direction" is itself pinned down as an actual vector — a
  basis vector is that pinned-down direction, made explicit instead of
  assumed.
- **Standard basis** — the specific, conventional choice where the x-axis
  is `(1, 0)` and the y-axis is `(0, 1)`. Why: this is the exact choice
  every lesson before this one made silently; naming it lets it be treated
  as one option among several, rather than as the only possibility.

**Objects and methods used:**

None. This lesson reuses Lesson 2's `add_vector_to_point` and Lesson 3's
`scale_vector` exactly as written.

---

## Concept Unit: A Coordinate Is a Recipe, Not Just Two Numbers

### The Problem

Every point this curriculum has written so far — `(3, 4)`, `robot_start`,
`feature_in_part` — was read the same silent way: "3 steps in whatever
direction x means, 4 steps in whatever direction y means." Nothing in any
prior lesson's code ever actually stated what "the x-direction" *is*, as a
piece of data. It was simply assumed to mean "right," and "the
y-direction" was assumed to mean "up." A coordinate pair is really a
*recipe* — "this many of one direction, plus this many of another" — and a
recipe is useless without knowing what the ingredients actually are.

*A note on method:* like every prior lesson's taxonomy unit, this is a
modeling idea, not a new Python construct — this unit's code is built
entirely from `add_vector_to_point` and `scale_vector`, both already
covered. No throwaway syntax lab is needed here.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–5.
- **Files affected:** `geometry_lesson_06.py` — created, as a new file for
  this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


x_axis = (1, 0)
y_axis = (0, 1)


def from_components(x_amount, y_amount, x_axis, y_axis):
    along_x = scale_vector(x_axis, x_amount)
    along_y = scale_vector(y_axis, y_amount)
    return add_vector_to_point(along_x, along_y)


feature_in_part = (3, 4)
rebuilt = from_components(feature_in_part[0], feature_in_part[1], x_axis, y_axis)
print(rebuilt)
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has been
in so far.

### Mechanical Walkthrough

Every syntactic element in the block above, in order:

- `def add_vector_to_point(...)` and `def scale_vector(...)` — Lessons 2
  and 3's own functions, retyped unchanged. No re-explanation owed for
  their mechanics, per the Repetition Rule.
- `x_axis = (1, 0)` and `y_axis = (0, 1)` — two plain tuple assignments,
  already basic. What's new is not the syntax but the *idea*: these two
  tuples are this lesson's first appearance of **basis vectors**,
  written out as real data instead of being an unstated assumption baked
  into every prior lesson's arithmetic.
- `def from_components(x_amount, y_amount, x_axis, y_axis):` — a function
  definition, already-basic syntax. Its job is new: reconstruct a point
  from *four* pieces of information — two plain numbers and two direction
  vectors — instead of the two numbers alone.
- `along_x = scale_vector(x_axis, x_amount)` — Lesson 3's `scale_vector`,
  called for the first time on a basis vector rather than an arbitrary
  movement. Scaling `x_axis` by `x_amount` produces "however far
  `x_amount` units actually is, in whatever direction `x_axis` actually
  points."
- `along_y = scale_vector(y_axis, y_amount)` — the same operation for the
  other axis.
- `return add_vector_to_point(along_x, along_y)` — Lesson 2's
  `add_vector_to_point`, called here with two vectors rather than a point
  and a vector; nothing in the function's own code distinguishes the two
  cases, since both arguments are just tuples either way. Combining
  `along_x` and `along_y` produces the final reconstructed point.
- `feature_in_part = (3, 4)` and the `from_components(...)` call — already
  basic. The result, `rebuilt`, should equal `feature_in_part` exactly,
  since `x_axis` and `y_axis` here are the *standard basis* — the same
  silent assumption every prior lesson already made, now made explicit and
  shown to reproduce exactly what was always happening under the hood.

### CS Lens

Building a point out of "this much of one direction, plus this much of
another" is a **linear combination** — one of the single most-reused ideas
in all of mathematics and computing.

```
Also recognized in: color (any color a screen displays is some amount of
a red basis, plus some amount of a green basis, plus some amount of a
blue basis — RGB is a coordinate system exactly like this lesson's, with
three basis "directions" instead of two), audio synthesis (a complex
sound built from a weighted combination of pure basis tones), and
spreadsheets (a weighted total built from named columns, each column
acting as one basis "direction" of the calculation)
```

### SE Lens

The design principle is **making an assumption into explicit, inspectable
data**. The alternative not chosen: keep treating "x means right, y means
up" as a fixed fact baked permanently into every formula, the way every
lesson before this one effectively did.

That alternative costs nothing as long as every coordinate system a program
ever touches agrees on the same convention. The real cost shows up the
moment two disagreeing conventions meet in the same program — which
happens constantly in real graphics work: mathematics and CAD conventionally
treat "up" as positive y, while most computer screens treat "down" as
positive y, because early displays drew top row first. A program that
silently assumes one convention while its data uses the other doesn't
crash — it just draws everything upside down, which the Closing section
demonstrates concretely. Making the basis vectors explicit parameters,
the way `from_components` does, is what makes that disagreement visible
and fixable instead of invisible and assumed away.

### Commands Needed

Same command as every prior lesson — `python geometry_lesson_06.py`.
Nothing new here.

### Run It

```
(3, 4)
```

Verified by actually running the file above.

### Connection

`from_components` reproduces the standard basis exactly, proving the
"recipe" framing is consistent with everything this curriculum has already
built. The next unit changes the ingredients.

---

## Concept Unit: Different Basis Vectors, Same Numbers, Different Point

### The Problem

`x_axis` and `y_axis` were, in Concept Unit 1, `(1, 0)` and `(0, 1)` — one
specific choice among many possible ones. Nothing about `from_components`
requires that particular choice; it only requires *some* pair of direction
vectors. What happens to the exact same numbers, `x_amount = 3, y_amount =
4`, if the directions they're multiplied against are different?

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_06.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(rebuilt)` line added in Concept
  Unit 1.
- **Dependencies:** none beyond what Concept Unit 1 already established.

### The New Code

```python
tilted_x_axis = (0, 1)
tilted_y_axis = (-1, 0)

rotated = from_components(feature_in_part[0], feature_in_part[1], tilted_x_axis, tilted_y_axis)
print(rotated)
```

### The Updated Project

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


x_axis = (1, 0)
y_axis = (0, 1)


def from_components(x_amount, y_amount, x_axis, y_axis):
    along_x = scale_vector(x_axis, x_amount)
    along_y = scale_vector(y_axis, y_amount)
    return add_vector_to_point(along_x, along_y)


feature_in_part = (3, 4)
rebuilt = from_components(feature_in_part[0], feature_in_part[1], x_axis, y_axis)
print(rebuilt)

tilted_x_axis = (0, 1)                                                            # ← new
tilted_y_axis = (-1, 0)                                                           # ← new

rotated = from_components(feature_in_part[0], feature_in_part[1], tilted_x_axis, tilted_y_axis)  # ← new
print(rotated)                                                                    # ← new
```

The file as a whole now proves this lesson's entire point twice: once by
reconstructing a point with the standard basis and getting back exactly
what went in, and once by reconstructing the *same numeric components*
with a different basis and getting back something else entirely.

### Mechanical Walkthrough

Every syntactic element in this unit's new code, in order:

- `tilted_x_axis = (0, 1)` and `tilted_y_axis = (-1, 0)` — two new tuple
  assignments, already-basic syntax. What they represent is the new idea:
  a second, equally legitimate pair of basis vectors, chosen here to be a
  quarter-turn away from the standard basis — "x" now points where "y"
  used to, and "y" now points where the negative of "x" used to.
  Lesson 11, Orientation, covers what governs which such swaps are even
  allowed; this lesson only needs one concrete example.
- `rotated = from_components(feature_in_part[0], feature_in_part[1],
  tilted_x_axis, tilted_y_axis)` — the exact same function, called with the
  exact same numbers extracted from `feature_in_part`, but a different pair
  of basis vectors passed in. `from_components` itself has no idea
  anything is different — it's reusing the same two-vector scaling recipe
  from Concept Unit 1 unchanged; the input tuples are what changed.

### CS Lens

Feeding the same components through a different basis and getting a
different point is a first, concrete look at **change of basis** — a
foundational idea for anything that needs to move geometry between
different coordinate conventions.

```
Also recognized in: 3D engines (an object's own local axes point in
different world directions depending on how the object itself is
rotated — its "forward" and the world's "forward" agree only when it
hasn't been rotated at all), video game controls (converting a joystick's
"forward" input, relative to which way the camera is currently facing,
into an actual world-space movement direction), and physics (two
observers, rotated relative to each other, describing the same physical
force with different-looking component numbers)
```

### SE Lens

The design principle, again, is that **`from_components` never had to
change** — only the data passed into it did. The alternative not chosen:
write a separate function for "reconstruct a point using the standard
basis" versus "reconstruct a point using some other basis."

The approach this lesson actually takes means any future basis — a
rotated one, a scaled one, a screen-space one with y flipped — works with
the exact same function, with zero new code. The real cost is the one this
lesson opened with and the Closing section proves concretely: nothing
about a bare tuple like `(3, 4)` visibly announces which basis it's meant
to be read against, so a caller who quietly assumes the wrong one gets a
plausible, silently wrong answer rather than an error.

### Commands Needed

Same command as Concept Unit 1 — `python geometry_lesson_06.py`. Nothing
new here.

### Run It

```
(3, 4)
(-4, 3)
```

Verified by actually running the updated file above.

### Connection

The exact same numbers, `3` and `4`, produced two entirely different
physical points depending only on which basis vectors they were multiplied
against. Lesson 4 and 5 already proved a coordinate's meaning depends on a
chosen origin; this unit proves it depends just as much on a chosen pair of
directions. Lesson 12, Coordinate Transformations, is where both halves —
origin and basis — get combined into one general operation.

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish:

1. `feature_in_part = (3, 4)` — a coordinate pair, no different in
   appearance from any point earlier lessons wrote.
2. `from_components(3, 4, x_axis, y_axis)` is called with the standard
   basis. `scale_vector((1, 0), 3)` computes `(3, 0)`. `scale_vector((0,
   1), 4)` computes `(0, 4)`. `add_vector_to_point((3, 0), (0, 4))`
   computes `(3, 4)` — an exact match for the original tuple, proving the
   standard basis was the silent assumption behind every prior lesson.
3. `from_components(3, 4, tilted_x_axis, tilted_y_axis)` is called with the
   rotated basis instead. `scale_vector((0, 1), 3)` computes `(0, 3)`.
   `scale_vector((-1, 0), 4)` computes `(-4, 0)`. `add_vector_to_point((0,
   3), (-4, 0))` computes `(-4, 3)`.
4. The two calls received the identical numbers, `3` and `4`, in the
   identical order — and produced `(3, 4)` and `(-4, 3)`, two different
   points, separated by more than either point's own components. The only
   thing that changed between them was which basis vectors were passed in.

## What Breaks Without This

Mathematics and CAD conventionally treat positive y as "up." Most computer
screens treat positive y as "down," because early displays drew their
first row of pixels at the top. Reconstruct the same point, `(3, 4)`,
against a basis that reflects the screen's real convention instead of the
math convention this lesson has used everywhere else:

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def from_components(x_amount, y_amount, x_axis, y_axis):
    along_x = scale_vector(x_axis, x_amount)
    along_y = scale_vector(y_axis, y_amount)
    return add_vector_to_point(along_x, along_y)


x_axis = (1, 0)

intended_math_result = from_components(3, 4, x_axis, (0, 1))
actual_screen_result = from_components(3, 4, x_axis, (0, -1))

print(intended_math_result)
print(actual_screen_result)
```

```
(3, 4)
(3, -4)
```

Verified by actually running this. Both calls received the exact same `3`
and `4`. The first used a y-axis of `(0, 1)` — "up is positive" — and
landed at `(3, 4)`. The second used `(0, -1)` — "down is positive," the
real convention on most screens — and landed at `(3, -4)`: the same
horizontal position, but flipped vertically. A programmer who designed a
shape assuming math convention, then handed its coordinates to a screen
that actually uses the opposite convention, would see every one of their
shapes rendered upside down — not a crash, not an exception, just a
silently mirrored result, for exactly the reason this lesson's entire
Concept Unit 2 demonstrated on purpose.

## Exercises

1. Choose a basis where `x_axis = (2, 0)` and `y_axis = (0, 2)` — same
   directions as standard, but twice the length. Predict, then verify,
   what `from_components(3, 4, x_axis, y_axis)` returns, and explain in one
   sentence what a "longer" basis vector does to the resulting point
   compared to the standard basis.
2. Find a pair of basis vectors, other than the tilted one already used in
   this lesson, for which `from_components(1, 1, your_x_axis,
   your_y_axis)` returns `(0, 0)`. (Hint: think about what `along_x` and
   `along_y` would need to do to cancel each other out.)
3. `from_components` takes `x_axis` and `y_axis` as its *last* two
   parameters, after the numeric components. Predict, then verify, what
   happens if you accidentally call it with the two basis vectors swapped
   — `from_components(3, 4, y_axis, x_axis)` instead of
   `from_components(3, 4, x_axis, y_axis)` — using the standard basis.
   Explain why the result differs from `(3, 4)` even though `x_axis` and
   `y_axis` individually are unchanged.

## Definition of Done

- [ ] `geometry_lesson_06.py` exists and runs with no errors via
      `python geometry_lesson_06.py`.
- [ ] Running it prints `(3, 4)`, then `(-4, 3)` — matching this lesson's
      verified output exactly.
- [ ] You can explain, without looking at the file, why
      `from_components(3, 4, x_axis, y_axis)` and `from_components(3, 4,
      tilted_x_axis, tilted_y_axis)` return different points despite
      receiving the identical numbers `3` and `4`.
- [ ] You can explain, in your own words, why a math-convention y-axis and
      a screen-convention y-axis produce vertically flipped results from
      the same numeric coordinates.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Add basis vectors: a coordinate is a recipe, and the same numbers mean different points under different bases"`,
      not `git commit -m "add from_components function"`.

Next: Lesson 7 — Dot Products, where this lesson's basis vectors turn out
to hold the key to a new question entirely: given a vector, how much of it
actually points in a given direction?
