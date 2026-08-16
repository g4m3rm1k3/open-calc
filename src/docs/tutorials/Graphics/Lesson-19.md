# Lesson 19: Geometric Predicates

**What you will build:** `classify_turn`, a single function that answers
a three-way question — does point `c` sit to the **left**, to the
**right**, or exactly **straight** along the line from `a` through `b` —
by reading the sign of one already-familiar number, Lesson 8's
`cross_product`. Answering three possible outcomes from one function
needs a genuinely new piece of Python: `if`/`elif`/`else`, this
curriculum's first branching construct, introduced here in full. Then a
tolerant version, reusing Lesson 17 and 18's `nearly_equal`, fixes the
same floating-point misclassification Lesson 18 already proved is real.
The transferable problem: Lessons 8, 11, and 18 each quietly built their
own version of "read a computed number's sign to answer a geometric
question" without ever naming the pattern itself. This lesson names it —
a **geometric predicate** — and gives it its first three-way form.

**What you need to know first:** Lesson 2's `subtract_points`, Lesson 8's
`cross_product` and its sign-reading rule, Lesson 11's orientation test
(another sign-reading predicate, built the same way), and Lesson 17 and
18's `nearly_equal` and its own floating-point false-negative case.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–18, except that `if`/`elif`/`else` — explicitly *not* assumed until
now — receives full first-appearance treatment in this lesson's first
Concept Unit, per this curriculum's own stated ground rules.

**Terms introduced in this lesson:**

- **Conditional branch (`if`/`elif`/`else`)** — a construct that runs one,
  and only one, of several blocks of code, chosen by checking conditions
  in order until one is `True`. Why: every yes/no test this curriculum
  has built so far (`is_point_on_line`, `nearly_equal`) has returned the
  result of a single boolean expression directly, because there were only
  ever two possible outcomes; a genuine three-way answer — left, right, or
  straight — cannot be produced by any single expression, and needs a
  construct that can choose between more than two paths.
- **Geometric predicate** — a function whose entire purpose is to
  classify a geometric relationship by computing one number and reading
  its sign (or its distance from zero), rather than computing a new shape
  or position. Why: this is the general pattern behind Lesson 8's
  turn-direction reading, Lesson 11's orientation test, and Lesson 18's
  `is_point_on_line` — three functions this curriculum already built
  without ever naming what they had in common.

**Objects and methods used:**

None. `classify_turn` and its tolerant version are hand-authored project
code, built from Lesson 2, 8, and 17/18's own reused functions plus this
lesson's own new `if`/`elif`/`else`.

---

## Concept Unit: Three-Way Decisions — `if`/`elif`/`else`

### The Problem

Lesson 8's `cross_product` sign already distinguishes a left turn from a
right turn from no turn at all — three real outcomes — but every function
built on top of it so far has only ever asked a yes/no question about one
of those outcomes at a time (Lesson 18's `is_point_on_line` asks only "is
it exactly the zero case"). Build a single function that returns all
three answers directly, by name.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–18.
- **Files affected:** `geometry_lesson_19.py` — created, as a new file
  for this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def classify_turn(a, b, c):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))

    if turn_value > 0:
        return "left"
    elif turn_value < 0:
        return "right"
    else:
        return "straight"


print(classify_turn((0, 0), (3, 4), (6, 8)))
print(classify_turn((0, 0), (3, 4), (0, 5)))
print(classify_turn((0, 0), (3, 4), (5, 0)))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

### Isolated Concept: `if`/`elif`/`else`

This is exactly what `classify_turn`'s three `return` branches above are
doing, isolated down to a single number instead of a computed cross
product. Run it three times, changing exactly one thing each time, to
see all three branches actually fire:

```python
example_number = 5

if example_number > 0:
    print("positive")
elif example_number < 0:
    print("negative")
else:
    print("zero")
```

Run with `example_number = 5`:

```
positive
```

Run again with `example_number = -3`:

```
negative
```

Run a third time with `example_number = 0`:

```
zero
```

Each run proves a different one of the three branches actually executes,
and that the other two are skipped entirely — not evaluated, not run,
simply never reached. This is called a **conditional branch**: Python
checks `example_number > 0` first; if that's `True`, it runs the `if`
block and skips straight past `elif` and `else` without even checking
them. If it's `False`, it checks the `elif`'s own condition,
`example_number < 0`, next; if that's `True`, it runs *that* block
instead. `else`, with no condition of its own, is what runs only when
every condition above it came back `False` — Python's way of saying "none
of the above."

### Discard

`example_number` and its `if`/`elif`/`else` block above are now
discarded — they exist only to prove branching chooses exactly one path,
and will not appear in the project again. `classify_turn`'s own
`if`/`elif`/`else`, shown in the real code above, works by the identical
rule, just checking `turn_value`'s sign instead of a plain example
number.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def subtract_points(a, b): ...`, `def cross_product(a, b): ...` —
  Lesson 2 and 8's own functions, retyped unchanged. No re-explanation
  owed, per the Repetition Rule.
- `def classify_turn(a, b, c): ...` — first appearance: a function
  designed from the start to return one of three different values.
- `turn_value = cross_product(subtract_points(b, a), subtract_points(c,
  a))` — already-basic reuse, storing the result in a named variable so
  its sign can be checked three separate times below without
  recomputing it.
- `if turn_value > 0:` — first appearance of `if` in real project code:
  checks whether `turn_value` is positive. If `True`, only the indented
  block directly beneath this line runs.
- `return "left"` — already-basic (Lesson 1 established `str` as a data
  type; returning one has been legal since Lesson 2), but this is the
  first time a function's *return value itself* is used to communicate
  which of several outcomes occurred, rather than a computed number or
  point.
- `elif turn_value < 0:` — first appearance of `elif`: checked only if
  the `if` above it was `False`. Here, `turn_value < 0` — negative —
  fires this branch and returns `"right"`.
- `else:` — first appearance of `else`: no condition of its own, runs
  only when both the `if` and every `elif` above it were `False` — the
  remaining case, `turn_value` equal to exactly `0`, returns `"straight"`.
- `print(classify_turn((0, 0), (3, 4), (6, 8)))` — `(6, 8)` is `2 * (3,
  4)`, sitting exactly on the same line as `b`. `turn_value` comes out to
  `0`, so the `else` branch fires: `"straight"`.
- `print(classify_turn((0, 0), (3, 4), (0, 5)))` — `turn_value` comes out
  positive (`15`), firing the `if` branch: `"left"`.
- `print(classify_turn((0, 0), (3, 4), (5, 0)))` — `turn_value` comes out
  negative (`-20`), firing the `elif` branch: `"right"`.

### CS Lens

Choosing exactly one of several code paths based on a checked condition —
a **conditional branch** — is one of the handful of control-flow ideas
every real programming language provides, in some form, because
computation without the ability to choose between paths can't express
most real decisions at all.

```
Also recognized in: every CPU's own instruction set (a conditional jump
instruction is the hardware-level version of exactly this idea — `if`
statements in every language ultimately compile down to one), G-code
interpreters and CNC controllers (a canned cycle or macro that behaves
differently depending on a sensor reading or a stored variable is
branching, expressed in a completely different syntax), and rule-based
systems broadly (a spam filter, a tax calculator, a game's AI decision
tree — anything describable as "when X, do this; otherwise, do that" is
this same construct, however it's dressed up)
```

### SE Lens

The design principle is **returning a labeled outcome instead of a bare
number**, so the caller doesn't have to re-derive what a raw
`cross_product` value means every time it's used. The alternative not
chosen: skip `classify_turn` entirely, and have every future lesson call
`cross_product` directly and re-check its sign by hand, the way Lesson 8
and Lesson 18 both did.

That alternative avoids introducing `if`/`elif`/`else` at all — every
prior lesson managed without it. The real cost it pays: re-deriving "what
does a positive cross product mean here" at every call site is exactly
the kind of repeated, error-prone logic this curriculum's whole SE Lens
theme, since Lesson 13, has argued against. `classify_turn` pays for that
savings with a genuinely new piece of syntax to learn, but only once —
every future lesson that needs a turn classified can now just call it and
read a plain string.

### Commands Needed

`python geometry_lesson_19.py` — same interpreter and command as every
prior lesson. The isolated `example_number` lab above was run three
separate times, each with `example_number` changed and nothing else,
never added to `geometry_lesson_19.py`.

### Run It

```
straight
left
right
```

Verified by actually running the file above.

### Connection

`classify_turn` correctly reads all three cases on hand-typed integer
points. Lesson 18 already proved that a computed point can silently break
the zero case — the next unit checks whether `classify_turn` has the
exact same weakness, and names the general pattern both lessons have
been building toward.

---

## Concept Unit: Naming the Pattern — Geometric Predicates

### The Problem

Lesson 18's `is_point_on_line` gave a false negative on a point produced
by `normalize` and `scale_vector`, because the "exactly zero" case is
fragile under floating-point arithmetic. `classify_turn`'s `else` branch
depends on that exact same zero case — check whether it fails the same
way, and, once it does, name what all of Lesson 8, 11, and 18's tests
actually have in common.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_19.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(classify_turn((0, 0), (3, 4),
  (5, 0)))` line added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `subtract_points`, `cross_product`.

### The New Code

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


def classify_turn_tolerant(a, b, c, tolerance):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))

    if nearly_equal(turn_value, 0, tolerance):
        return "straight"
    elif turn_value > 0:
        return "left"
    else:
        return "right"


computed_point = scale_vector(normalize((3, 4)), 5 * norm((3, 4)))

print(computed_point)
print(classify_turn((0, 0), (3, 4), computed_point))
print(classify_turn_tolerant((0, 0), (3, 4), computed_point, 0.0000001))
```

### The Updated Project

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def classify_turn(a, b, c):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))

    if turn_value > 0:
        return "left"
    elif turn_value < 0:
        return "right"
    else:
        return "straight"


print(classify_turn((0, 0), (3, 4), (6, 8)))
print(classify_turn((0, 0), (3, 4), (0, 5)))
print(classify_turn((0, 0), (3, 4), (5, 0)))


import math                                                              # ← new


def dot_product(a, b):                                                  # ← new
    return a[0] * b[0] + a[1] * b[1]                                    # ← new


def norm(v):                                                             # ← new
    return math.sqrt(dot_product(v, v))                                 # ← new


def scale_vector(v, factor):                                             # ← new
    return (v[0] * factor, v[1] * factor)                               # ← new


def normalize(v):                                                        # ← new
    return scale_vector(v, 1 / norm(v))                                 # ← new


def nearly_equal(a, b, tolerance):                                       # ← new
    return abs(a - b) < tolerance                                       # ← new


def classify_turn_tolerant(a, b, c, tolerance):                          # ← new
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))  # ← new
                                                                           # ← new
    if nearly_equal(turn_value, 0, tolerance):                           # ← new
        return "straight"                                                # ← new
    elif turn_value > 0:                                                 # ← new
        return "left"                                                    # ← new
    else:                                                                # ← new
        return "right"                                                   # ← new


computed_point = scale_vector(normalize((3, 4)), 5 * norm((3, 4)))       # ← new

print(computed_point)                                                    # ← new
print(classify_turn((0, 0), (3, 4), computed_point))                     # ← new
print(classify_turn_tolerant((0, 0), (3, 4), computed_point, 0.0000001))  # ← new
```

The file now holds two versions of the three-way test side by side: the
strict one, which this unit is about to show fails, and a tolerant one
built the same way Lesson 18 already fixed `is_point_on_line`.

*A note on method:* `import math`, `dot_product`, `norm`, `scale_vector`,
`normalize`, and `nearly_equal` are all retyped unchanged from Lessons 3,
7, 9, 10, and 17. The only new construct in `classify_turn_tolerant` is
its own use of `if`/`elif`/`else` — already given full treatment in
Concept Unit 1 — so no second isolated lab is needed here.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `import math`, `def dot_product(...)`, `def norm(...)`, `def
  scale_vector(...)`, `def normalize(...)`, `def nearly_equal(...)` —
  Lessons 3, 7, 9, 10, and 17's own code, retyped unchanged. No
  re-explanation owed, per the Repetition Rule.
- `def classify_turn_tolerant(a, b, c, tolerance): ...` — the same shape
  as Concept Unit 1's `classify_turn`, with one extra parameter.
- `turn_value = cross_product(...)` — already-basic reuse, identical to
  Concept Unit 1.
- `if nearly_equal(turn_value, 0, tolerance):` — a **hard concept
  reappearing**: `if`/`elif`/`else` itself was already given full
  treatment in Concept Unit 1, so no re-explanation is owed for the
  branching mechanics here — but the *order* of the checks is new and
  worth noticing: the tolerant zero-check runs *first*, before the
  `turn_value > 0` check Concept Unit 1 ran first. Checking near-zero
  before positive/negative is deliberate: a `turn_value` that's a tiny
  positive or negative number, like Lesson 18's own floating-point noise,
  needs to be caught by the tolerance check before either sign check
  gets a chance to misclassify it.
- `return "straight"`, `elif turn_value > 0: return "left"`, `else:
  return "right"` — already-basic reuse of the same three-outcome
  pattern from Concept Unit 1, just reordered.
- `computed_point = scale_vector(normalize((3, 4)), 5 * norm((3, 4)))` —
  Lesson 18's own construction, retyped, reproducing that lesson's exact
  floating-point-noisy point.
- `print(computed_point)` — already-basic; prints
  `(15.000000000000002, 20.0)`, matching Lesson 18 exactly.
- `print(classify_turn((0, 0), (3, 4), computed_point))` — Concept Unit
  1's strict function, called on this noisy point. It prints `"right"` —
  wrong: `computed_point` is genuinely collinear with `(0, 0)` and `(3,
  4)`, the same false-classification failure Lesson 18 already proved for
  `is_point_on_line`, now showing up in `classify_turn`'s `elif` branch
  instead of its `else`.
- `print(classify_turn_tolerant((0, 0), (3, 4), computed_point,
  0.0000001))` — the tolerant version, on the same point. It prints
  `"straight"` — correct.

**Naming the pattern.** `classify_turn`, `classify_turn_tolerant`,
Lesson 18's `is_point_on_line`, Lesson 11's orientation (handedness)
test, and Lesson 8's own turn-direction sign reading are five different
functions built the exact same way: compute one number (always, in this
curriculum, a `cross_product` or a `dot_product`), then answer a
geometric question entirely by reading that number's sign or its
distance from zero — never by computing a new shape, position, or
distance. This pattern, this lesson's own title, is a **geometric
predicate**: a function whose entire job is classification, not
construction.

### CS Lens

Geometric predicates are, as a category, worth naming precisely because
so much of computational geometry is built on a small handful of them,
reused constantly.

```
Also recognized in: convex hull algorithms (Graham scan and its relatives
run `classify_turn`-shaped left/right/straight tests, thousands of times,
as their entire inner loop), point-in-polygon testing (deciding whether a
point is inside a shape is typically built from a sequence of exactly
this kind of turn-direction check against each edge), and Delaunay
triangulation (the "in-circle" predicate — is this point inside or
outside the circle through three others — is a more elaborate version of
the same idea: one computed number, classified by sign, deciding a real
geometric question)
```

### SE Lens

The design principle is **recognizing a repeated shape across several
already-built pieces of code and naming it**, rather than treating each
one as an unrelated, one-off function. The alternative not chosen: leave
Lesson 8's sign-reading, Lesson 11's orientation test, and Lesson 18's
`is_point_on_line` as three separate, unconnected techniques, the way
they were each introduced.

That alternative isn't wrong — each one worked fine on its own. The real
cost of never naming the shared pattern: a future lesson needing a new
geometric yes/no or three-way test would have no template to reach for,
and might re-derive the "compute a number, check its sign" idea from
scratch, or worse, reach for `==` directly the way Lesson 18's *first*,
broken version of `is_point_on_line` did, before that lesson's own fix.
Naming **geometric predicate** now means every future lesson building one
can be recognized — and built tolerant from the start — as an instance of
a pattern already known to need care, not a fresh problem each time.

### Commands Needed

`python geometry_lesson_19.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
straight
left
right
(15.000000000000002, 20.0)
right
straight
```

Verified by actually running the updated file above. `classify_turn`
misclassifies `computed_point` as `"right"`; `classify_turn_tolerant`
correctly reports `"straight"`.

### Connection

Both units of this lesson now agree on what they built: a three-way
geometric predicate, and proof that it needs the same tolerance
discipline Lesson 18 already established for two-way ones. Connect the
Pieces, below, traces the full comparison.

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish:

1. `classify_turn((0, 0), (3, 4), (6, 8))`, `(0, 5)`, and `(5, 0)` return
   `"straight"`, `"left"`, and `"right"` — all three branches of
   `if`/`elif`/`else` proven to fire correctly on clean, hand-typed
   points.
2. `computed_point = scale_vector(normalize((3, 4)), 5 * norm((3, 4)))`
   comes out to `(15.000000000000002, 20.0)` — the same floating-point-
   noisy point Lesson 18 already built, mathematically collinear with
   `(0, 0)` and `(3, 4)`.
3. `classify_turn((0, 0), (3, 4), computed_point)` returns `"right"` — a
   real, verified misclassification, caused by `turn_value` landing on a
   tiny nonzero number instead of exactly `0`.
4. `classify_turn_tolerant((0, 0), (3, 4), computed_point, 0.0000001)`
   returns `"straight"` — the same underlying `cross_product` value,
   checked first against a tolerance before either sign is trusted,
   correctly recovering the true geometric answer.
5. Both `classify_turn` and Lesson 18's `is_point_on_line` are geometric
   predicates, both share the exact same floating-point weakness, and
   both are fixed by the exact same technique: check `nearly_equal`
   against zero before trusting any sign.

## What Breaks Without This

`classify_turn_tolerant` checks its tolerance *before* checking either
sign, on purpose. Check what happens when that order is reversed —
checking the signs first, and only falling back to the tolerance check in
the `else`:

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


def classify_turn_wrong_order(a, b, c, tolerance):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))

    if turn_value > 0:
        return "left"
    elif turn_value < 0:
        return "right"
    else:
        return "straight" if nearly_equal(turn_value, 0, tolerance) else "unreachable"


import math


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def scale_vector(v, factor):
    return (v[0] * factor, v[1] * factor)


def normalize(v):
    return scale_vector(v, 1 / norm(v))


computed_point = scale_vector(normalize((3, 4)), 5 * norm((3, 4)))

print(classify_turn_wrong_order((0, 0), (3, 4), computed_point, 0.0000001))
```

```
right
```

Verified by actually running this — note the deliberately unreachable
`else` branch here uses a one-line `if`/`else` *expression* only to prove
the point about ordering, not as new material this lesson is teaching.
Even with a `nearly_equal` check written into the function, the result is
still the wrong answer, `"right"` — because `turn_value > 0` is checked
*first*, on the raw, un-tolerant value, and a tiny negative floating-point
number satisfies neither `turn_value > 0` nor lands anywhere near the
`else` branch that actually contains the tolerance check; it satisfies
`elif turn_value < 0` instead and returns immediately, before the
tolerance logic ever runs. Writing a `nearly_equal` check *somewhere* in
a function is not the same as writing it *first* — `if`/`elif`/`else`
runs its conditions in order and stops at the first one that matches, so
a tolerant check placed after a strict one that already catches the case
never gets a chance to run at all. This is exactly why
`classify_turn_tolerant`, above, checks `nearly_equal` before either
sign, not after.

## Exercises

1. Using `classify_turn`, verify that swapping the order of the last two
   arguments — `classify_turn((0, 0), (5, 0), (3, 4))` instead of
   `classify_turn((0, 0), (3, 4), (5, 0))` — produces the opposite
   left/right answer. Explain why, using Lesson 8's own anticommutativity
   proof for `cross_product`.
2. Write a fourth call to `classify_turn_tolerant`, using a point that is
   genuinely off the line by a visible amount (not floating-point noise),
   the way Lesson 18's `off_line_point` was. Confirm it's still correctly
   classified as `"left"` or `"right"`, not incorrectly caught by the
   tolerance check.
3. Predict, then verify, what `classify_turn((0, 0), (0, 0), (5, 0))`
   returns — a case where `a` and `b` are the same point, so there's no
   real line to classify against. Explain what `turn_value` computes in
   this case and why the function still returns *an* answer instead of
   crashing.

## Definition of Done

- [ ] `geometry_lesson_19.py` exists and runs with no errors via `python
      geometry_lesson_19.py`.
- [ ] Running it prints `straight`, `left`, `right`,
      `(15.000000000000002, 20.0)`, `right`, then `straight` — matching
      this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, how `if`/`elif`/`else`
      decides which single branch runs, using this lesson's own
      `example_number` lab.
- [ ] You can explain what a geometric predicate is, and name three
      examples from this curriculum that fit the definition.
- [ ] You can explain why `classify_turn_tolerant` checks its tolerance
      before either sign, using this lesson's own `classify_turn_wrong_order`
      counter-example.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Build a three-way turn predicate and prove tolerance must be checked first"`,
      not `git commit -m "add classify_turn"`.

Next: Lesson 20 — Geometric Problem-Solving, Section I's closing workshop
lesson, which combines this section's own tools — vectors, dot and cross
products, transformations, tolerant predicates — into a single worked
problem, before Section II, "2D Computational Geometry," begins at Lesson
21.
