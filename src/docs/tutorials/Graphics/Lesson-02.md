# Lesson 2: Points, Vectors, and Directions

**What you will build:** Lesson 1's robot escapes its single track and moves
in a plane — its position becomes a pair of numbers instead of one. You'll
compute the displacement between two positions, then reuse that exact
displacement to move a completely different point by the same amount. The
transferable problem underneath it: a location and a movement look
identical once they're written down as two numbers, but they behave
completely differently — and code that doesn't respect the difference
compiles, runs, and silently produces the wrong answer.

**What you need to know first:** Lesson 1 — specifically, its six-word
taxonomy (object, relationship, measurement, query, constraint,
transformation) and the pattern it established of naming a relationship as
a reusable function, the way `distance` did. This lesson's own new material
does not depend on Lesson 1's `distance` function itself, only on that
pattern.

**Assumed background (outside this curriculum):** unchanged from Lesson 1 —
general Python fluency covering core data types (including tuples), loops,
function definitions, and `print()`. Nothing new is assumed beyond what
Lesson 1 already used.

**Terms introduced in this lesson:**

- **Point** — a geometric object representing a fixed location in space. Why:
  Lesson 1's robot position was "the thing itself" without a name for what
  kind of geometric object it was; now that a second kind of object is about
  to show up (see below), the two need distinct names, and "point" is the
  one for "a place."
- **Vector** — a geometric object representing a displacement: a change in
  position, with a size and a direction, but no location of its own. Why:
  "move 2 units right and 1 unit down" means the same thing whether it's
  applied starting from your desk or from the far side of the planet — a
  vector is what captures a movement's shape, independent of where it
  starts.
- **Component** — one of the individual numbers making up a point's or
  vector's tuple representation (its x-component, its y-component, and so
  on). Why: "the first number in the tuple" is clumsy to keep saying, and
  later lessons need to talk about components individually (Lesson 6, Basis
  Vectors, is built entirely around what a component actually means).

**Objects and methods used:**

None. Every operation this lesson performs — indexing a tuple, building a
new tuple from an expression, defining and calling a function — was already
covered by this lesson's assumed background or by Lesson 1. This lesson's
new material is entirely conceptual: the same syntax, used to represent two
things that must not be confused with each other.

---

## Concept Unit: One Number Stops Being Enough

### The Problem

Lesson 1's robot lived on a single track, so one number fully described
"where" — position `3`, position `9`, nothing else needed. A real robot (or
a CNC tool, or a camera, or almost anything else this curriculum will ever
model) doesn't live on a line. It lives in a plane, or in space. Once a
robot can move left/right *and* forward/backward, a single number can no
longer say where it is — "3" doesn't tell you if that's 3 steps east, 3
steps north, or some mix of both.

*A note on method:* like Lesson 1's taxonomy unit, this unit introduces a
modeling idea, not a new Python construct — tuples themselves were already
part of this lesson's assumed background. What's new is using a tuple to
represent a *2D location*, not the tuple syntax itself, so there is no
throwaway syntax lab here.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing directly from Lesson 1's file.
- **Files affected:** `geometry_lesson_02.py` — created, as a new file for
  this lesson (rather than continuing to edit Lesson 1's file, so Lesson 1's
  finished result stays intact and reviewable on its own).
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
robot_start = (3, 4)
robot_end = (5, 3)

print(robot_start)
print(robot_end)
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation Lesson 1's Concept Unit 1 was in.

### Mechanical Walkthrough

Every syntactic element in the block above, in order:

- `robot_start = (3, 4)` — a variable assignment, whose value is a tuple
  literal. Tuple syntax itself is genuinely basic, already-established
  syntax per this lesson's assumed background — no restatement owed there.
  What *is* new, and worth its own clause: the decision to store two related
  numbers in one tuple, as a single value, rather than in two separate
  variables like `robot_start_x = 3` and `robot_start_y = 4`. Bundled this
  way, "the robot's position" is one thing you can pass to a function, print,
  or store in a list — not two things you have to remember to keep in sync.
- `robot_end = (5, 3)` — the same construct and the same reasoning, reused.
- `print(robot_start)` and `print(robot_end)` — calls to `print()`, already
  covered by Lesson 1. Passing a tuple to `print()` specifically (rather
  than two separate numbers, as Lesson 1 did) is new only in the sense that
  it's the first time this curriculum has printed a compound value — worth
  noting only because the output below shows the tuple's own parenthesized
  form, `(3, 4)`, not `3 4` the way Lesson 1's two-argument `print` did.

### CS Lens

Bundling two related numbers into one tuple, so that "a 2D position" can be
passed around, printed, and reasoned about as a single value instead of two
loose ones, is **aggregation** — building a compound value out of simpler
parts.

```
Also recognized in: structs and records in languages like C and Rust,
rows in a database table, a complex number (bundling a real part and an
imaginary part into one mathematical object), and an RGB color value
(bundling red, green, and blue into one "color" instead of three loose
numbers)
```

### SE Lens

The design principle is **grouping related data instead of scattering it
across separate variables**. The alternative not chosen: keep `robot_x` and
`robot_y` (or `robot_start_x`, `robot_start_y`, `robot_end_x`,
`robot_end_y`, and so on) as independent variables.

That alternative isn't free of upside — it's arguably more transparent for
a single, never-reused value, since both numbers are visible by name with
no indexing required. The real cost it pays as a program grows: nothing
stops `robot_start_x` and `robot_end_y` from being accidentally passed to
the same function together, since the language has no idea the two loose
variables were ever meant to travel as a pair. Bundling them into one tuple
value doesn't eliminate every mistake — a plain tuple still won't stop you
from mixing up which index is x and which is y, since that convention lives
only in this lesson's prose, not in the language itself — but it does make
"this pair belongs together" a fact the program itself carries around,
instead of a fact that only lives in a variable-naming convention a future
edit could quietly break.

### Commands Needed

Same command as Lesson 1 — `python geometry_lesson_02.py`. Nothing new here.

### Run It

```
(3, 4)
(5, 3)
```

Verified by actually running the file above.

### Connection

Two locations now exist in the program, each one bundled into a single
tuple. What's still missing is any way to talk about the *movement* between
them — and, as the next unit shows, that turns out not to be the same kind
of thing as a location at all.

---

## Concept Unit: A Vector Is a Difference Between Two Points, Not a Point Itself

### The Problem

The robot moved from `robot_start` to `robot_end`. Both are 2D positions,
represented the exact same way — a tuple of two numbers. It would be
reasonable to guess that "combining" two tuples in Python, using the `+`
operator you already know from adding numbers, does something sensible with
them. Try it, in a throwaway check, before writing anything real:

```python
robot_start = (3, 4)
robot_end = (5, 3)

print(robot_start + robot_end)
```

```
(3, 4, 5, 3)
```

Verified by actually running this. `+` on two tuples doesn't add their
numbers component by component — it **concatenates** them, end to end, into
one longer tuple. `(3, 4, 5, 3)` isn't a 2D position, or a movement, or
anything geometric at all — it's a four-item list of numbers, and treating
it as a point would be nonsense. This throwaway check is discarded now; it
never appears in the project again. Its only job was to prove, rather than
merely assert, that Python's own `+` cannot be trusted here — whatever
computes "the movement from `robot_start` to `robot_end`" has to be written
by hand.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_02.py` — modified.
- **Change type:** add.
- **Location:** appended below the two `print()` calls added in Concept
  Unit 1.
- **Dependencies:** none beyond what Concept Unit 1 already established.

### The New Code

```python
def subtract_points(head, tail):
    return (head[0] - tail[0], head[1] - tail[1])


def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


movement = subtract_points(robot_end, robot_start)
print(movement)

other_start = (0, 0)
other_end = add_vector_to_point(other_start, movement)
print(other_end)
```

### The Updated Project

```python
robot_start = (3, 4)
robot_end = (5, 3)

print(robot_start)
print(robot_end)


def subtract_points(head, tail):                       # ← new
    return (head[0] - tail[0], head[1] - tail[1])       # ← new


def add_vector_to_point(point, vector):                 # ← new
    return (point[0] + vector[0], point[1] + vector[1]) # ← new


movement = subtract_points(robot_end, robot_start)       # ← new
print(movement)                                           # ← new

other_start = (0, 0)                                      # ← new
other_end = add_vector_to_point(other_start, movement)     # ← new
print(other_end)                                           # ← new
```

The file as a whole now does three things: it still defines and prints
`robot_start` and `robot_end` from Concept Unit 1; it computes the
displacement between them by hand, since `+` can't be trusted to; and it
proves that displacement is reusable by applying it to a completely
different starting point, `other_start`, and checking that the result makes
sense.

### Mechanical Walkthrough

Every syntactic element in this unit's new code, in order:

- `def subtract_points(head, tail):` — a function definition with two
  parameters, already basic per this lesson's assumed background. The
  parameter *names* are worth a clause: `head` and `tail` name the two ends
  of the movement being measured (borrowed from how a vector is often drawn
  — a tail where it starts, a head where it points), not just "first
  argument, second argument."
- `return (head[0] - tail[0], head[1] - tail[1])` — a `return` statement
  whose value is a new tuple literal, built from two subtractions.
  `head[0]`, `tail[0]`, `head[1]`, `tail[1]` are all plain tuple indexing,
  already covered by this lesson's assumed background. The subtraction
  itself is ordinary arithmetic — but *what it computes* is the new idea:
  subtracting the tail's x from the head's x, and the tail's y from the
  head's y, produces a brand-new tuple that is not a position at all. It's
  the answer to "how far, and in which direction, do you have to move to
  get from `tail` to `head`" — a **vector**, built by hand, component by
  component, because the throwaway check above already proved `head - tail`
  using Python's own `-` operator isn't even legal between two tuples
  (unlike `+`, which silently does the wrong thing, `-` between tuples
  raises a `TypeError` — there is no way to get this answer except writing
  it out by hand, one component at a time).
- `def add_vector_to_point(point, vector):` — same construct as the
  previous function, reused; no restatement owed for the syntax. The
  parameter names `point` and `vector` are chosen to make the function's
  contract readable at the call site: this function expects one of each,
  not two points or two vectors.
- `return (point[0] + vector[0], point[1] + vector[1])` — the same
  component-by-component pattern as `subtract_points`, but adding instead
  of subtracting, and producing a **point** this time, not a vector: a
  location, plus a displacement, lands on a new location.
- `movement = subtract_points(robot_end, robot_start)` — a function call,
  already basic. The argument order matters: `robot_end` is passed as
  `head`, `robot_start` as `tail`, which is why this computes "the movement
  *to* the end position *from* the start" and not the reverse — a detail
  the Closing section returns to.
- `other_start = (0, 0)` — a brand-new point, chosen specifically because it
  shares no numbers at all with `robot_start` or `robot_end`, so that
  reusing `movement` against it can't be mistaken for a coincidence.
- `other_end = add_vector_to_point(other_start, movement)` — the same
  displacement computed a moment ago, applied to a completely different
  starting point. This is the entire point (no pun intended) of
  distinguishing points from vectors in the first place: `movement` doesn't
  know or care that it originally came from `robot_start` and `robot_end`
  — it's reusable anywhere.

### CS Lens

The rule set this unit just built by hand — point minus point gives a
vector; point plus vector gives a point; nothing here ever adds two points
together — has a formal name in mathematics: an **affine space**. Points
and vectors are deliberately different kinds of geometric object, even
though this lesson represents both as plain tuples of two numbers.
Lesson 13, Affine Transformations, formalizes this rule set completely;
this lesson only needed to prove, with real code, that the distinction is
real and not just pedantry.

```
Also recognized in: calendar dates versus durations (you can't add
"March 5th" to "March 9th," but you can subtract them to get "4 days,"
and you can add "4 days" to a date to get another date), version-control
commits versus diffs (a diff is reusable against a different starting
commit, the way `movement` was reused against `other_start`), and
odometer readings versus distance traveled
```

### SE Lens

The design principle is **giving the same underlying representation two
different meanings on purpose, and writing separate functions to keep them
straight** — `subtract_points` always returns something meant to be treated
as a vector, `add_vector_to_point` always expects one of each. The
alternative not chosen: represent points and vectors with the exact same
kind of tuple and rely on the programmer to remember, unaided, which tuple
in a given piece of code means "a place" and which means "a move."

That alternative costs nothing when a file is small enough to hold in your
head — exactly the situation in this lesson's eight-line file. The real
tradeoff shows up as a program grows past the size any one person can hold
in their head at once: without functions whose names and parameter labels
say what kind of tuple they expect, nothing stops a future edit from
passing a point where a vector belongs, and Python will not complain — both
are, after all, just tuples of two numbers, and the throwaway check earlier
already proved Python's own operators won't catch the mistake either. The
honest cost being paid here: two small functions to maintain instead of one
inline `+`. The honest benefit: every future call site that says
`add_vector_to_point(some_point, some_vector)` is legible on sight, in a
way `some_point + some_vector` never could be even if Python's `+` had done
the sensible thing.

### Commands Needed

Same command as Concept Unit 1 — `python geometry_lesson_02.py`. Nothing
new here.

### Run It

```
(3, 4)
(5, 3)
(2, -1)
(2, -1)
```

Verified by actually running the updated file above.

### Connection

Concept Unit 1 gave "a location" a representation; this unit gave "a move"
its own representation, proved by hand-building the arithmetic that
Python's own operators refuse to do correctly, and proved that a vector
carries no memory of where it came from by successfully reusing the exact
same `movement` against an unrelated starting point. Everything from here
forward that talks about "how something changes" — a rotation, a
translation, a robot's velocity — is a variation on this same vector idea.

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish:

1. `robot_start = (3, 4)` and `robot_end = (5, 3)` — two points, each
   bundled into a single tuple (Concept Unit 1).
2. `subtract_points(robot_end, robot_start)` is called — inside the
   function, `head` is bound to `(5, 3)` and `tail` is bound to `(3, 4)`.
3. `head[0] - tail[0]` evaluates to `5 - 3`, which is `2`. `head[1] -
   tail[1]` evaluates to `3 - 4`, which is `-1`.
4. The function returns `(2, -1)` — a vector: "2 units right, 1 unit down,"
   regardless of where that move starts.
5. `movement` now holds `(2, -1)`; `print(movement)` writes it out.
6. `add_vector_to_point(other_start, movement)` is called with
   `other_start = (0, 0)` — a point that shares no history with
   `robot_start` or `robot_end` at all.
7. `point[0] + vector[0]` evaluates to `0 + 2`, which is `2`. `point[1] +
   vector[1]` evaluates to `0 + (-1)`, which is `-1`.
8. The function returns `(2, -1)` — a brand-new point, produced by applying
   the exact same displacement that moved the robot to a completely
   different starting location, which is only possible because the
   displacement was represented as its own thing, not baked into the two
   points it was originally measured between.

## What Breaks Without This

`subtract_points(head, tail)` treats its first argument as the destination
and its second as the origin — swap them, a genuinely easy mistake to make
at a call site, and see what happens:

```python
robot_start = (3, 4)
robot_end = (5, 3)


def subtract_points(head, tail):
    return (head[0] - tail[0], head[1] - tail[1])


backwards_movement = subtract_points(robot_start, robot_end)
print(backwards_movement)
```

```
(-2, 1)
```

Verified by actually running this swapped-argument version. This isn't a
crash, and it isn't even obviously wrong on its own — `(-2, 1)` is a
perfectly valid vector, just the *wrong* one: it's the exact negation of
the correct `(2, -1)`, describing a move in precisely the opposite
direction. Fed into `add_vector_to_point`, this backwards vector would move
a robot away from where it should have gone, silently, with no error at
any point. The fix isn't a code change — the function was written
correctly — it's discipline at the call site about which point is the
destination and which is the origin, which is exactly why this lesson
named the parameters `head` and `tail` instead of `a` and `b`.

## Exercises

1. Compute, by hand on paper, the vector from `(0, 0)` to `(10, 10)`. Then
   add that vector to the point `(-5, 2)` using `add_vector_to_point`, and
   verify your program's answer against your own arithmetic.
2. Predict, before running it, what `subtract_points(p, p)` returns for any
   point `p` — the vector from a point to itself. Verify with a few
   different points.
3. `add_vector_to_point` expects a point first and a vector second. Call it
   with the arguments swapped — a vector first, a point second — and
   confirm it still runs without error and returns *some* answer. Explain,
   in your own words, why Python allowing this to run is exactly the same
   kind of danger as the tuple-concatenation surprise at the start of
   Concept Unit 2, even though no error ever appears.

## Definition of Done

- [ ] `geometry_lesson_02.py` exists and runs with no errors via
      `python geometry_lesson_02.py`.
- [ ] Running it prints `(3, 4)`, then `(5, 3)`, then `(2, -1)` twice —
      matching this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, why `robot_start +
      robot_end` does not compute a meaningful geometric result in Python,
      and what it computes instead.
- [ ] You can state, from memory, the three rules this lesson's code
      obeys: point minus point gives a vector; point plus vector gives a
      point; two points are never added together.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Separate points from vectors: a location and a movement need different rules, not just different names"`,
      not `git commit -m "add point and vector functions"`.

Next: Lesson 3 — Scalars and Geometric Quantities, where a third kind of
number enters the picture: one that isn't a location or a movement at all,
but a plain measurement like distance, angle, or scale, and has to be told
apart from both.
