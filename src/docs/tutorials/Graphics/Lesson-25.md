# Lesson 25: Segment Intersection

**What you will build:** `segment_intersection`, reusing Lesson 24's own
`t`/`s` cross-product derivation, but guarded by three separate checks
instead of one confident division: parallel segments (Lesson 24's own
crash, now handled instead of left to crash), a crossing point that falls
outside the first segment's bounds, and one that falls outside the
second's — each returning the string `"no intersection"` instead of
propagating a wrong answer or an unhandled error. The transferable
problem: Lesson 24 deliberately left `line_intersection` crashing on
parallel input, reasonable for two infinite lines a caller chose
carefully. Real segment data — the edges of an actual polygon, a
fixture's boundary — includes parallel and non-overlapping pairs
*constantly*, as an entirely normal, expected case, not a rare mistake to
crash on.

**What you need to know first:** Lesson 24's `line_intersection` and its
own `t`/`s` derivation, Lesson 21's `is_t_on_segment`, and Lesson 19's
`if`/`elif`/`else`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–24.

**Terms introduced in this lesson:**

- **Guard clause** — an `if` check placed at the very start of a
  function, that returns immediately for a case the rest of the function
  isn't built to handle, so everything after it can safely assume that
  case has already been ruled out. Why: `segment_intersection` has three
  separate ways to have no real answer — this term names the pattern that
  handles all three without nesting the function's main logic three
  levels deep.

**Objects and methods used:**

None. `segment_intersection` is hand-authored project code, built from
Lesson 2, 8, 21, and 24's own reused functions.

---

## Concept Unit: Guarding Against Parallel Segments

### The Problem

Lesson 24's `line_intersection` crashes with a real `ZeroDivisionError`
the moment its two directions are parallel — a deliberate, understood
choice for two infinite lines. A polygon's own edges are frequently
parallel to each other on purpose (a rectangle's opposite sides, a
fixture's parallel faces) — segment intersection has to treat "these two
don't cross" as a normal, valid answer, not a crash.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–24.
- **Files affected:** `geometry_lesson_25.py` — created, as a new file
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


def segment_intersection(segment1_start, segment1_end, segment2_start, segment2_end):
    dir1 = subtract_points(segment1_end, segment1_start)
    dir2 = subtract_points(segment2_end, segment2_start)
    denominator = cross_product(dir1, dir2)

    if denominator == 0:
        return "no intersection"


print(segment_intersection((0, 0), (3, 4), (0, 1), (6, 9)))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* `subtract_points` and `cross_product` are Lesson 2
and 8's own functions, retyped unchanged; the `if` **guard clause** below
uses `if`/`else` mechanics already given full treatment in Lesson 19. No
new Python construct appears here, so no isolated throwaway lab is
needed; what's new is the *pattern* this already-familiar `if` is put to.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def subtract_points(a, b): ...`, `def cross_product(a, b): ...` —
  Lesson 2 and 8's own functions, retyped unchanged. No re-explanation
  owed, per the Repetition Rule.
- `def segment_intersection(segment1_start, segment1_end, segment2_start,
  segment2_end): ...` — first appearance: unlike Lesson 24's
  `line_intersection`, this function takes each line as two endpoints,
  matching how a real segment is actually stored.
- `dir1 = subtract_points(segment1_end, segment1_start)`, `dir2 =
  subtract_points(segment2_end, segment2_start)` — already-basic reuse,
  recovering each segment's own direction vector from its two endpoints —
  the same conversion Lesson 21's own Concept Unit 3 already performed.
- `denominator = cross_product(dir1, dir2)` — already-basic reuse,
  identical to Lesson 24's own setup.
- `if denominator == 0: return "no intersection"` — first appearance of
  a **guard clause**: this check runs before any other work happens, and
  exits the function immediately with a plain, valid answer — the string
  `"no intersection"` — for exactly the input that would otherwise crash
  `line_intersection`'s own division. Nothing after this line ever runs
  for parallel input.
- `print(segment_intersection((0, 0), (3, 4), (0, 1), (6, 9)))` —
  `dir1 = (3, 4)`, `dir2 = (6, 8)` — parallel, the same relationship
  Lesson 24's own closing section already proved crashes
  `line_intersection`. Here, it prints `"no intersection"` instead —
  a real answer, not a crash.

### CS Lens

Returning a plain, valid "no answer" result instead of raising an
exception, for a case that is a normal and expected part of the problem
rather than a genuine mistake, is a real, recurring design choice.

```
Also recognized in: dictionary and map lookups (`dict.get(key, default)`
in Python returns a sensible default for a missing key instead of raising
`KeyError`, precisely because "the key isn't there" is often an expected
outcome, not a bug), search functions across many languages (a `find`
that returns `-1` or a similar sentinel instead of throwing when nothing
is found), and parser combinators (a parsing attempt that legitimately
might not match returns a "no match" result rather than treating every
failed parse attempt as an exceptional error)
```

### SE Lens

The design principle is **treating an expected outcome as a normal
return value, not an exception**. The alternative not chosen: keep
`line_intersection`'s own behavior — let `segment_intersection` crash
with a `ZeroDivisionError` on parallel segments too, the same way Lesson
24 deliberately left it.

That alternative was the right choice for `line_intersection` itself,
where the caller is expected to already know or check whether two lines
are parallel before calling it. It's the wrong choice here: a real
polygon-processing routine calling `segment_intersection` on every pair
of edges in a shape will hit parallel pairs constantly, as a completely
normal part of the input, not a mistake — crashing on every one of them
would make the function unusable for its actual purpose. The real cost
of guarding it: every caller now has to check for the string
`"no intersection"` instead of trusting the result is always a point —
a real tradeoff, not a free improvement.

### Commands Needed

`python geometry_lesson_25.py` — same interpreter and command as every
prior lesson.

### Run It

```
no intersection
```

Verified by actually running the file above.

### Connection

Parallel segments are now handled without crashing. The next unit adds
the second, genuinely new case a *segment* introduces that an infinite
line never had to consider at all.

---

## Concept Unit: Bounded on Both Sides — Checking t and s

### The Problem

Two segments' underlying lines can cross at a perfectly real point — one
that both `t` and `s` locate correctly — while that point sits outside
one or both of the actual, bounded segments. Lesson 21 already proved
this exact gap exists for a single point against a single segment; this
unit checks it for both segments at once.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_25.py` — modified.
- **Change type:** replace (the incomplete `segment_intersection` from
  Concept Unit 1 gains a real body beyond its guard clause).
- **Location:** inside `segment_intersection`, immediately after the
  `denominator == 0` guard clause added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `segment_intersection`,
  `subtract_points`, `cross_product`; Lesson 21's `point_on_line` and
  `is_t_on_segment`.

### The New Code

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


def is_t_on_segment(t):
    return 0 <= t <= 1


def segment_intersection(segment1_start, segment1_end, segment2_start, segment2_end):
    dir1 = subtract_points(segment1_end, segment1_start)
    dir2 = subtract_points(segment2_end, segment2_start)
    denominator = cross_product(dir1, dir2)

    if denominator == 0:
        return "no intersection"

    diff = subtract_points(segment2_start, segment1_start)
    t = cross_product(diff, dir2) / denominator
    s = cross_product(diff, dir1) / denominator

    if is_t_on_segment(t) == False:
        return "no intersection"

    if is_t_on_segment(s) == False:
        return "no intersection"

    return point_on_line(segment1_start, dir1, t)


print(segment_intersection((0, 0), (4, 4), (0, 4), (4, 0)))
print(segment_intersection((0, 0), (4, 4), (0, 4), (1, 3)))
print(segment_intersection((0, 0), (3, 4), (0, 1), (6, 9)))
```

### The Updated Project

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def add_vector_to_point(point, vector):                                  # ← new
    return (point[0] + vector[0], point[1] + vector[1])                # ← new


def scale_vector(vector, factor):                                        # ← new
    return (vector[0] * factor, vector[1] * factor)                     # ← new


def point_on_line(line_point, line_direction, t):                        # ← new
    return add_vector_to_point(line_point, scale_vector(line_direction, t))  # ← new


def is_t_on_segment(t):                                                  # ← new
    return 0 <= t <= 1                                                  # ← new


def segment_intersection(segment1_start, segment1_end, segment2_start, segment2_end):
    dir1 = subtract_points(segment1_end, segment1_start)
    dir2 = subtract_points(segment2_end, segment2_start)
    denominator = cross_product(dir1, dir2)

    if denominator == 0:
        return "no intersection"

    diff = subtract_points(segment2_start, segment1_start)               # ← new
    t = cross_product(diff, dir2) / denominator                         # ← new
    s = cross_product(diff, dir1) / denominator                         # ← new

    if is_t_on_segment(t) == False:                                     # ← new
        return "no intersection"                                        # ← new

    if is_t_on_segment(s) == False:                                     # ← new
        return "no intersection"                                        # ← new

    return point_on_line(segment1_start, dir1, t)                       # ← new


print(segment_intersection((0, 0), (4, 4), (0, 4), (4, 0)))              # ← new
print(segment_intersection((0, 0), (4, 4), (0, 4), (1, 3)))              # ← new
print(segment_intersection((0, 0), (3, 4), (0, 1), (6, 9)))              # ← new
```

`segment_intersection` now has all three of its guard clauses in place,
and returns a real point only once every one of them has passed.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def add_vector_to_point(...)`, `def scale_vector(...)`, `def
  point_on_line(...)` — Lesson 2, 3, and 21's own functions, retyped
  unchanged. No re-explanation owed, per the Repetition Rule.
- `def is_t_on_segment(t): ...` — Lesson 21's own function, retyped
  unchanged.
- `diff = subtract_points(segment2_start, segment1_start)`, `t =
  cross_product(diff, dir2) / denominator`, `s = cross_product(diff,
  dir1) / denominator` — Lesson 24's own derivation, reused unchanged,
  now safe to run unconditionally since the guard clause above already
  ruled out `denominator == 0`.
- `if is_t_on_segment(t) == False: return "no intersection"` — first
  appearance of this lesson's second guard clause: even with a real,
  computed `t`, a value outside `0`-to-`1` means the crossing point falls
  beyond where segment 1 actually ends.
- `if is_t_on_segment(s) == False: return "no intersection"` — the third
  guard clause, the identical check applied to segment 2's own bound.
- `return point_on_line(segment1_start, dir1, t)` — reached only once
  every guard clause above has passed: a real intersection, genuinely
  within both segments' bounds.
- `print(segment_intersection((0, 0), (4, 4), (0, 4), (4, 0)))` — the two
  diagonals of a 4-by-4 square, which genuinely cross at their shared
  midpoint. Prints `(2.0, 2.0)`.
- `print(segment_intersection((0, 0), (4, 4), (0, 4), (1, 3)))` — the
  same first segment, but the second one is deliberately shortened so it
  stops well short of `(2, 2)` — its own direction only reaches `t` values
  up to `1`, while the true crossing point needs `s = 2.0` on this
  segment, twice past its own far endpoint. Prints `"no intersection"` —
  even though the two *lines* genuinely cross, the two *segments* do not.
- `print(segment_intersection((0, 0), (3, 4), (0, 1), (6, 9)))` —
  Concept Unit 1's own parallel case, still correctly caught by the first
  guard clause. Prints `"no intersection"`.

### CS Lens

Structuring a function as a sequence of early-exit guard clauses, rather
than one large nested conditional, is a widely recognized way to keep
multi-case logic readable.

```
Also recognized in: input validation code across virtually every
language (a function that checks several preconditions and returns or
raises immediately on the first failure, rather than nesting the "happy
path" three levels deep inside three `if`s), HTTP request handlers (many
web frameworks structure request validation as a sequence of early
returns — missing auth, bad input, not found — before reaching the
actual request logic), and parsers and compilers (a syntax check that
bails out immediately on the first malformed token, rather than
continuing to parse inside progressively deeper nested conditions)
```

### SE Lens

The design principle is **flattening multiple failure conditions into a
sequence of independent, early-exit checks**, rather than nesting them
inside one another. The alternative not chosen: a single nested
structure — `if denominator != 0: if is_t_on_segment(t): if
is_t_on_segment(s): ... `, three levels deep, with the real "return a
point" logic buried at the bottom of all three.

That alternative would work identically. The real cost it pays: three
levels of nested `if` blocks push the actual success case further right
and further down with every added check, and adding a fourth guard
clause in the future would mean nesting a fourth level deeper still.
Guard clauses keep every check at the same, shallow level, and the
function's main "everything passed" logic — the final `return
point_on_line(...)` — stays visually flat and easy to find, regardless
of how many guard clauses come before it.

### Commands Needed

`python geometry_lesson_25.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
(2.0, 2.0)
no intersection
no intersection
```

Verified by actually running the updated file above.

### Connection

All three of `segment_intersection`'s guard clauses now work together:
parallel segments, an out-of-bounds `t`, and an out-of-bounds `s` are all
correctly recognized as "no intersection," while a genuine crossing
returns the real point. Connect the Pieces, below, traces all three
cases side by side.

---

## Connect the Pieces

Three segment pairs, traced through every guard clause this lesson
built, start to finish:

1. `(0, 0)`–`(4, 4)` and `(0, 4)`–`(4, 0)`: `denominator` is nonzero, `t`
   comes out to `0.5` (within bounds), `s` comes out to `0.5` (within
   bounds) — every guard clause passes, and `point_on_line` returns the
   real crossing point, `(2.0, 2.0)`.
2. `(0, 0)`–`(4, 4)` and `(0, 4)`–`(1, 3)`: `denominator` is nonzero, `t`
   comes out to `0.5` (within bounds) — but `s` comes out to `2.0`,
   caught by the third guard clause. The underlying lines cross at a real
   point; the second *segment* never reaches it.
3. `(0, 0)`–`(3, 4)` and `(0, 1)`–`(6, 9)`: `denominator` comes out to
   `0` — caught by the very first guard clause, before `t` or `s` are
   ever computed at all.

## What Breaks Without This

Concept Unit 2 added *two* separate guard clauses — one for `t`, one for
`s` — deliberately, not one combined check. Prove why both are needed by
removing the `s` check and running the exact segment pair that's supposed
to be caught by it:

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


def is_t_on_segment(t):
    return 0 <= t <= 1


def segment_intersection_missing_s_check(segment1_start, segment1_end, segment2_start, segment2_end):
    dir1 = subtract_points(segment1_end, segment1_start)
    dir2 = subtract_points(segment2_end, segment2_start)
    denominator = cross_product(dir1, dir2)

    if denominator == 0:
        return "no intersection"

    diff = subtract_points(segment2_start, segment1_start)
    t = cross_product(diff, dir2) / denominator

    if is_t_on_segment(t) == False:
        return "no intersection"

    return point_on_line(segment1_start, dir1, t)


print(segment_intersection_missing_s_check((0, 0), (4, 4), (0, 4), (1, 3)))
```

```
(2.0, 2.0)
```

Verified by actually running this. This is the exact segment pair
Concept Unit 2 already proved should return `"no intersection"` — the
second segment, `(0, 4)`–`(1, 3)`, stops well short of the true crossing
point. Without the `s` guard clause, the function doesn't crash and
doesn't raise any error — it confidently returns `(2.0, 2.0)`, a point
that is real, correctly computed, and **not actually on the second
segment at all**. This is a silent false positive: code calling this
broken version would believe two segments intersect when they genuinely
don't, exactly the kind of mistake that would tell a CAM system a tool
path crosses a boundary it never actually reaches. Checking `t` alone
only confirms the crossing point lies within the *first* segment; `s`
is the only thing that confirms the *second* one reaches it too, and
skipping either check independently breaks the function in a way the
other one can't cover for.

## Exercises

1. Using `segment_intersection`, swap which segment is passed first —
   call it as `segment_intersection((0, 4), (1, 3), (0, 0), (4, 4))`
   instead of the original order. Predict, then verify, whether the
   result changes, and explain why using this lesson's own guard-clause
   structure.
2. Build a pair of segments that share an endpoint exactly — for example,
   `(0, 0)`–`(4, 0)` and `(0, 0)`–`(0, 4)`. Verify what `segment_intersection`
   returns, and explain what `t` and `s` both come out to at a shared
   endpoint.
3. Using `segment_intersection`, test two segments that lie on the same
   infinite line and genuinely overlap along part of their length — for
   example, `(0, 0)`–`(4, 0)` and `(2, 0)`–`(6, 0)`. Predict what
   `denominator` comes out to for this case, and explain why this
   function, as written, cannot correctly report the overlapping region
   as an intersection at all.

## Definition of Done

- [ ] `geometry_lesson_25.py` exists and runs with no errors via `python
      geometry_lesson_25.py`.
- [ ] Running it prints `no intersection`, `(2.0, 2.0)`,
      `no intersection`, then `no intersection` — matching this lesson's
      verified output exactly (Concept Unit 1's own single-line run,
      followed by Concept Unit 2's three).
- [ ] You can explain, without looking at the file, what a guard clause is
      and name all three of `segment_intersection`'s own guard clauses.
- [ ] You can explain why checking `t` alone is not enough, using this
      lesson's own verified `(2.0, 2.0)` false-positive counter-example.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Add segment intersection with guard clauses for parallel and out-of-bounds cases"`,
      not `git commit -m "add segment_intersection"`.

Next: Lesson 26 — Orientation Tests, which returns to Lesson 8 and 19's
own sign-reading predicates at greater depth, formalizing the
`cross_product`-based orientation test this curriculum has already used
repeatedly, in preparation for Lesson 33's polygons.
