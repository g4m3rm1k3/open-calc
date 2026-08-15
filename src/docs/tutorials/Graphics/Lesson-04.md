# Lesson 4: Coordinate Systems

**What you will build:** A small CNC-flavored scene — a machine with its own
fixed origin, and a workpiece bolted down somewhere else on the machine's
table, with its own origin. You'll convert a feature's coordinates from
"relative to the part" to "relative to the machine," using nothing but
Lesson 2's vector addition, and then prove something less obvious: the
*vector* between two features on the part comes out identical no matter
which of the two coordinate systems you measure it in. The transferable
problem: every coordinate this curriculum has written so far — `(3, 4)`,
`robot_a = 3` — was quietly assumed to mean something absolute. It never
did. A coordinate only means anything relative to a chosen origin, and
changing that choice changes every number without changing anything
physically real.

**What you need to know first:** Lesson 2's point/vector distinction,
`add_vector_to_point`, and `subtract_points`. This lesson builds directly
on top of both without re-deriving them.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–3.

**Terms introduced in this lesson:**

- **Origin** — the specific point a coordinate system treats as `(0, 0)`
  — the point every other coordinate in that system is measured relative
  to. Why: "convert this coordinate to a different system" turns out to
  mean nothing more than "account for the difference between the two
  systems' origins" — a word for the origin is needed before that idea can
  be stated precisely.
- **Coordinate system** (also called a **frame of reference**) — a chosen
  origin that gives a set of bare numbers the meaning "a location." Why:
  without a chosen origin, `(10, 5)` isn't a location anywhere in
  particular — it only becomes one once something has been designated as
  `(0, 0)` to measure it from. (A full coordinate system also needs a
  choice of axis directions, not just an origin — Lesson 6, Basis Vectors,
  covers that half; this lesson deliberately isolates the origin half
  first.)

**Objects and methods used:**

None. This lesson reuses Lesson 2's `add_vector_to_point` and
`subtract_points` exactly as written, plus ordinary tuples and function
calls already covered.

---

## Concept Unit: The Same Point, Two Different Numbers

### The Problem

A CNC machine tracks its own position relative to a fixed reference point
built into the machine itself — call it the **machine origin**. That point
never moves; it's usually wherever a limit switch or a hard mechanical stop
defines `(0, 0)` to be. But a machinist setting up a new part doesn't want
to write an entire toolpath program in numbers measured from some point
buried inside the machine's frame — they want numbers measured from a
sensible point *on the part itself*, like a corner or a hole center. So
before cutting, they "zero" the machine at a chosen spot on the part,
establishing a second origin — the **work origin** — wherever the part
happens to be sitting on the table that day.

The work origin is a single, specific physical point on the machine's
table. It has coordinates in the machine's own system — say, `(100, 50)`,
wherever the part happened to get bolted down. But *within the coordinate
system it defines*, it is, by definition, `(0, 0)` — the same physical spot
described two completely different ways, depending only on which system is
doing the describing.

*A note on method:* like the taxonomy units in Lessons 1–3, this is a
modeling idea, not a new Python construct — this unit's code uses nothing
but tuples and `print`, already covered. No throwaway syntax lab is needed
here.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–3.
- **Files affected:** `geometry_lesson_04.py` — created, as a new file for
  this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
work_origin_in_machine = (100, 50)

work_origin_in_work = (0, 0)
print(work_origin_in_work)
print(work_origin_in_machine)
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has been
in so far.

### Mechanical Walkthrough

Every syntactic element in the block above, in order:

- `work_origin_in_machine = (100, 50)` — a variable assignment holding a
  tuple, both already basic. What's worth a real clause: this single tuple
  represents an entire relationship between two coordinate systems — "the
  work origin sits 100 units right and 50 units up from the machine
  origin" — packed into one point value, the same way Lesson 2 packed a
  robot's location into one tuple instead of two loose numbers.
- `work_origin_in_work = (0, 0)` — the same physical location as
  `work_origin_in_machine`, described in the *other* system. This is the
  entire point of this unit made concrete: one real place, two different
  tuples, neither one more "correct" than the other — they're just answers
  to two different questions ("where is this, relative to the machine?"
  versus "where is this, relative to the part?").
- `print(...)` — already covered by Lesson 1.

### CS Lens

Choosing an arbitrary point to call `(0, 0)`, and measuring everything else
relative to that choice, is the general idea of a **frame of reference**.

```
Also recognized in: geography (latitude and longitude are measured from
the equator and the prime meridian — both arbitrary, agreed-upon choices,
not physical features of the Earth), calendars (a date is a duration
measured from a chosen epoch — year 1, or January 1st 1970 for Unix
time — the same moment written completely differently depending on the
epoch), and robotics (a robot arm's "base frame," bolted to the floor,
versus its "end-effector frame," which moves with the gripper)
```

### SE Lens

The design principle is **choosing the reference point that's convenient
for the problem at hand, rather than forcing one reference point on every
problem**. The alternative not chosen: require every position in the
entire shop — every feature, on every part, on every machine — to always be
written in one single global coordinate system, measured from one fixed
point that never changes.

That alternative isn't hard to imagine working for a single, permanently
fixed part. The real cost shows up the moment a second part gets bolted
down somewhere else on the table, or the same part gets re-fixtured at a
slightly different spot next week: every single coordinate in every
toolpath program would need to be recalculated from scratch, by hand,
against the new machine-relative position. A separate work origin per setup
means the toolpath program itself — every feature's coordinates, relative
to the part — never has to change at all; only the one number describing
where the new work origin sits gets updated. This lesson's second unit
shows exactly why that works.

### Commands Needed

This is the first command needed in this lesson, but it's identical to
every prior lesson's: `python geometry_lesson_04.py`. From a terminal, in
the same folder as the file, with a working Python 3 install, the program's
output appears and the terminal returns to a normal prompt with no error
text — see Lesson 1 for what to do if `python` isn't recognized at all.

### Run It

```
(0, 0)
(100, 50)
```

Verified by actually running the file above.

### Connection

Two tuples now exist for the exact same physical point, and neither is
wrong. What's still missing is a way to take a feature described in the
*convenient* system (relative to the part) and find out where it actually
is in the *machine's* system — which is where the machine actually has to
move.

---

## Concept Unit: Converting Between Frames Is Just Vector Addition

### The Problem

A hole on the part is at `(10, 5)`, measured from the work origin — an easy
number for whoever programmed the part to write down, since it's measured
from a corner of the part itself. The machine, though, doesn't know
anything about "the part's corner." It only understands positions relative
to its own fixed origin. Somehow, `(10, 5)` in work coordinates has to
become the right pair of numbers in machine coordinates — and the answer
turns out to already exist in this curriculum, under a different name.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_04.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(work_origin_in_machine)` line
  added in Concept Unit 1.
- **Dependencies:** none beyond what Concept Unit 1 already established.

### The New Code

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def to_machine_coordinates(point_in_work, work_origin_in_machine):
    return add_vector_to_point(work_origin_in_machine, point_in_work)


feature_a_work = (10, 5)
feature_b_work = (14, 8)

feature_a_machine = to_machine_coordinates(feature_a_work, work_origin_in_machine)
feature_b_machine = to_machine_coordinates(feature_b_work, work_origin_in_machine)

print(feature_a_machine)
print(feature_b_machine)
```

### The Updated Project

```python
work_origin_in_machine = (100, 50)

work_origin_in_work = (0, 0)
print(work_origin_in_work)
print(work_origin_in_machine)


def add_vector_to_point(point, vector):                                       # ← new
    return (point[0] + vector[0], point[1] + vector[1])                       # ← new


def to_machine_coordinates(point_in_work, work_origin_in_machine):            # ← new
    return add_vector_to_point(work_origin_in_machine, point_in_work)         # ← new


feature_a_work = (10, 5)                                                       # ← new
feature_b_work = (14, 8)                                                       # ← new

feature_a_machine = to_machine_coordinates(feature_a_work, work_origin_in_machine)  # ← new
feature_b_machine = to_machine_coordinates(feature_b_work, work_origin_in_machine)  # ← new

print(feature_a_machine)                                                       # ← new
print(feature_b_machine)                                                       # ← new
```

The file as a whole now models a complete, small CAD/CAM setup problem: two
origins for the same physical spot (Concept Unit 1), and two part features
converted from the programmer-friendly work system into the
machine-required system, ready to be handed to a controller that has no
concept of "the part" at all.

### Mechanical Walkthrough

Every syntactic element in this unit's new code, in order:

- `def add_vector_to_point(point, vector): ...` — this is Lesson 2's own
  function, retyped unchanged. Per the Repetition Rule, no re-explanation
  is owed for its mechanics — but it's worth restating, by name, what it
  does: takes a point and a vector, returns the point you land on after
  moving by that vector.
- `def to_machine_coordinates(point_in_work, work_origin_in_machine):` — a
  new function definition, already-basic syntax. Its body is exactly one
  line: `return add_vector_to_point(work_origin_in_machine, point_in_work)`.
  This is the new idea in this unit, and it's a claim worth stating
  plainly: **a point's coordinates, relative to some origin, are exactly
  the vector from that origin to the point.** `feature_a_work = (10, 5)`
  isn't just "a tuple that happens to look like a vector" — treating it as
  the displacement from the work origin, and adding that displacement to
  where the work origin actually sits in machine space, is *precisely* how
  you find out where the feature is in machine space. `point_in_work` is
  passed into `add_vector_to_point` as the *vector* argument, not the
  *point* argument — the same tuple, understood two different ways
  depending on which coordinate system is asking.
- `feature_a_work = (10, 5)` and `feature_b_work = (14, 8)` — two new
  points, both plain tuple assignments, already basic.
- `feature_a_machine = to_machine_coordinates(feature_a_work,
  work_origin_in_machine)` — a function call, already basic. The result,
  `(110, 55)`, is where the machine actually has to move to reach the same
  physical hole that `(10, 5)` describes on the part.
- `feature_b_machine = to_machine_coordinates(...)` — the same conversion,
  applied to the second feature.

### Proving What Doesn't Change

Both features now exist in two coordinate systems. Before moving on, check
something neither system's raw numbers make obvious: does the *distance and
direction between the two features* depend on which system you measured
them in?

```python
def subtract_points(head, tail):
    return (head[0] - tail[0], head[1] - tail[1])


vector_in_work = subtract_points(feature_b_work, feature_a_work)
vector_in_machine = subtract_points(feature_b_machine, feature_a_machine)

print(vector_in_work)
print(vector_in_machine)
```

```
(4, 3)
(4, 3)
```

Verified by actually running this. `feature_a_work` and `feature_a_machine`
are completely different numbers — `(10, 5)` versus `(110, 55)` — and so
are `feature_b_work` and `feature_b_machine`. But the *vector between the
two features* comes out identically `(4, 3)` in both systems. This isn't a
coincidence: converting to machine coordinates added the exact same
`work_origin_in_machine` offset to both features, and that identical offset
cancels out completely the moment you subtract one from the other. This is
called **translation invariance** — the relationship between two points
doesn't depend on where you chose to put the origin, only their individual
coordinates do.

### CS Lens

The fact that a vector between two points survives unchanged across a
change of origin, while each point's own coordinates do not, is
**translation invariance** — a property, not an accident, that follows
directly from Lesson 2's affine-space rules.

```
Also recognized in: physics (the distance between two objects, or the
relative velocity between them, doesn't depend on which observer's
reference frame you measure it from, even though each object's own
position or velocity does), version control (a diff between two commits
is the same diff no matter which commit you happen to be currently
checked out on), and finance (the percentage change in a stock's price
over a week doesn't depend on which currency you priced the stock in,
even though the price itself does)
```

### SE Lens

The design principle is that **functions built to operate on relationships
(vectors), rather than absolute positions (points), work correctly
regardless of which coordinate system fed them their inputs** — Lesson 1's
`distance` and Lesson 2's `subtract_points` never needed to know or care
whether their arguments came from work space or machine space. The
alternative not chosen: write a separate version of every geometric
function for every coordinate system it might ever be called with — a
`subtract_points_work` and a `subtract_points_machine`, say.

The approach this lesson actually takes is simpler and clearly better *as
long as one condition holds*: both arguments to a function like
`subtract_points` have to already be expressed in the *same* system. That
condition is invisible in the code — nothing about `subtract_points(head,
tail)`'s signature says which system `head` and `tail` are supposed to be
in, or enforces that they match. The next section shows exactly what
happens when that invisible assumption gets violated by accident, which is
the real cost this design is paying for its simplicity.

### Commands Needed

Same command as Concept Unit 1 — `python geometry_lesson_04.py`. Nothing
new here.

### Run It

```
(0, 0)
(100, 50)
(110, 55)
(114, 58)
(4, 3)
(4, 3)
```

Verified by actually running the updated file above.

### Connection

This lesson's two units together prove both halves of the same fact: a
point's coordinates change completely when you change origin (Concept Unit
1), while a vector between two points does not (this unit). Lesson 5, Local
and Global Coordinates, picks this up from here and asks a question this
lesson deliberately left alone: what happens once there isn't just one
"work" system, but a whole hierarchy of them, one per object, all nested
inside each other?

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish:

1. `work_origin_in_machine = (100, 50)` — the one fact that relates the two
   coordinate systems to each other.
2. `feature_a_work = (10, 5)` — a feature's position, written the
   convenient way, relative to the part.
3. `to_machine_coordinates(feature_a_work, work_origin_in_machine)` calls
   `add_vector_to_point(work_origin_in_machine, feature_a_work)`, treating
   `(10, 5)` as a displacement from the work origin.
4. Component by component: `100 + 10 = 110`, `50 + 5 = 55`. The function
   returns `(110, 55)` — the feature's true position in the system the
   machine actually understands.
5. The same conversion runs for `feature_b_work = (14, 8)`, producing
   `feature_b_machine = (114, 58)`.
6. `subtract_points(feature_b_work, feature_a_work)` computes
   `(14 - 10, 8 - 5) = (4, 3)` — the relationship between the two features,
   measured in work coordinates.
7. `subtract_points(feature_b_machine, feature_a_machine)` computes
   `(114 - 110, 58 - 55) = (4, 3)` — the exact same relationship, measured
   in machine coordinates, because the `+100, +50` shift applied to both
   points cancels out in the subtraction.

## What Breaks Without This

Nothing in `subtract_points`'s own code checks that both of its arguments
came from the same coordinate system. Mix them by accident — a completely
realistic slip, if two variables that both happen to hold `(x, y)`-shaped
tuples get passed to the same function without checking where each one
actually came from:

```python
def subtract_points(head, tail):
    return (head[0] - tail[0], head[1] - tail[1])


feature_b_machine = (114, 58)
feature_a_work = (10, 5)

mixed_up_vector = subtract_points(feature_b_machine, feature_a_work)
print(mixed_up_vector)
```

```
(104, 53)
```

Verified by actually running this. `(104, 53)` is not an error, not a
crash, and not obviously absurd the way an empty tuple or a six-item tuple
would be — it's a perfectly plausible-looking vector that has nothing to
do with the real `(4, 3)` relationship between the two features. The bug
isn't in `subtract_points` — it did exactly what it was written to do. The
bug is that one of its two arguments was silently still in work
coordinates while the other had already been converted to machine
coordinates, and nothing in this lesson's code — or Python's own type
system — can tell the difference between a work-space tuple and a
machine-space tuple. Both are just `(int, int)`.

## Exercises

1. Suppose a second part is set up on the same machine with its own work
   origin at `(250, 80)` in machine coordinates. Write
   `to_machine_coordinates` calls to convert a feature at `(3, 3)` on
   *this* second part into machine coordinates, and confirm the result is
   different from converting the same `(3, 3)` using the first part's
   `work_origin_in_machine`.
2. Write a function `to_work_coordinates(point_in_machine,
   work_origin_in_machine)` that undoes `to_machine_coordinates` — starting
   from a machine coordinate, recover the original work coordinate. (Hint:
   this is the same relationship as Lesson 2's `subtract_points` and
   `add_vector_to_point` being inverses of each other.) Verify it against
   `feature_a_machine` and confirm you recover the original `(10, 5)`.
3. Predict, then verify: what does `to_machine_coordinates(work_origin_in_work,
   work_origin_in_machine)` return? Explain in one sentence why that
   particular result makes sense given what `work_origin_in_work` means.

## Definition of Done

- [ ] `geometry_lesson_04.py` exists and runs with no errors via
      `python geometry_lesson_04.py`.
- [ ] Running it prints `(0, 0)`, `(100, 50)`, `(110, 55)`, `(114, 58)`,
      `(4, 3)`, then `(4, 3)` again — matching this lesson's verified
      output exactly.
- [ ] You can explain, without looking at the file, why `feature_a_work`
      and `feature_a_machine` are different numbers describing the same
      physical hole, while `vector_in_work` and `vector_in_machine` are the
      same numbers describing the same relationship.
- [ ] You can explain what goes wrong, and why it doesn't crash, when
      `subtract_points` is accidentally called with one argument still in
      work coordinates and the other already in machine coordinates.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Add coordinate conversion: a point's coordinates depend on the chosen origin, but the vector between two points doesn't"`,
      not `git commit -m "add coordinate system functions"`.

Next: Lesson 5 — Local and Global Coordinates, where this lesson's one pair
of origins becomes a whole hierarchy — every object getting its own frame,
nested inside a shared one — and asks why that's worth the extra
bookkeeping.
