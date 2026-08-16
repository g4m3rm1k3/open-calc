# Lesson 44: Robust 2D Geometry

**What you will build:** A corrected `count_ray_crossings`, finally
resolving the exact limitation Lesson 35's own closing section
disclosed and deliberately left unfixed: a ray passing directly through
a shared polygon vertex getting double-counted by the two edges that
meet there. The fix computes each edge's own crossing parameter directly
— the same algebra Lesson 25's `segment_intersection` already uses —
and applies a **half-open interval** rule instead of a closed one,
so a shared vertex belongs to exactly one of its two edges, never both,
never neither. The transferable problem: every "what breaks" section
since Lesson 16 has honestly shown a real limitation without fixing it,
on purpose, so this curriculum could keep moving forward without
stopping to perfect every edge case immediately. This lesson is where
one specific, named promise — Lesson 35's own — finally gets paid off.

**What you need to know first:** Lesson 35's `is_point_in_polygon` and
its own vertex-straddling limitation, Lesson 25's `segment_intersection`
and its `t`/`s` derivation, and Lesson 33's `get_edge`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–43.

**Terms introduced in this lesson:**

- **Half-open interval** — a range that includes one of its own
  endpoints but excludes the other, written `[0, 1)` rather than `[0,
  1]`. Why: this is the specific fix that resolves Lesson 35's own
  vertex-straddling bug — treating an edge's own starting vertex as
  "belonging to it" while treating its ending vertex as "belonging to
  the next edge instead" means a shared vertex is never counted by both
  edges, or by neither.

**Objects and methods used:**

None. `count_ray_crossings_robust` and `is_point_in_polygon_robust` are
hand-authored project code, built from Lesson 2, 8, and 33's own reused
functions.

---

## Concept Unit: Recovering t and s Directly — Rebuilding the Crossing Test

### The Problem

Lesson 35's own `count_ray_crossings` called `segment_intersection` and
only ever looked at its final answer — a point, or `"no intersection"`.
Fixing the vertex-straddling bug needs access to the edge's own crossing
parameter, `s`, directly, so a custom rule can be applied to it instead
of `segment_intersection`'s own built-in closed-interval check.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–43.
- **Files affected:** `geometry_lesson_44.py` — created, as a new file
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


def get_edge(polygon, i):
    start = polygon[i]
    end = polygon[(i + 1) % len(polygon)]
    return (start, end)


def count_ray_crossings_robust(point, far_point, polygon):
    count = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        edge_start = edge[0]
        edge_end = edge[1]
        ray_dir = subtract_points(far_point, point)
        edge_dir = subtract_points(edge_end, edge_start)
        denominator = cross_product(ray_dir, edge_dir)

        if denominator != 0:
            diff = subtract_points(edge_start, point)
            t = cross_product(diff, edge_dir) / denominator
            s = cross_product(diff, ray_dir) / denominator

            if t >= 0:
                if s >= 0:
                    if s < 1:
                        count = count + 1

    return count


def is_point_in_polygon_robust(point, polygon):
    far_point = (point[0] + 1000, point[1])
    crossings = count_ray_crossings_robust(point, far_point, polygon)
    return crossings % 2 == 1


polygon = [(0, 0), (4, 0), (4, 3), (0, 3)]

inside_point = (2, 1.5)
outside_point = (10, 10)

print(is_point_in_polygon_robust(inside_point, polygon))
print(is_point_in_polygon_robust(outside_point, polygon))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* `subtract_points`, `cross_product`, and `get_edge`
are Lesson 2, 8, and 33's own functions, retyped unchanged; `!=`, `>=`,
and `<` are the same already-basic comparison-operator category as `==`,
established since Lesson 5. No new Python construct appears here, so no
isolated throwaway lab is needed.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def subtract_points(...)`, `def cross_product(...)`, `def
  get_edge(...)` — Lesson 2, 8, and 33's own functions, retyped
  unchanged. No re-explanation owed, per the Repetition Rule.
- `def count_ray_crossings_robust(point, far_point, polygon): ...` —
  first appearance: this lesson's own rebuilt subject.
- `ray_dir = subtract_points(far_point, point)`, `edge_dir =
  subtract_points(edge_end, edge_start)`, `denominator =
  cross_product(ray_dir, edge_dir)` — Lesson 25's own
  `segment_intersection` derivation, reused: the identical setup, just
  computed inline instead of hidden behind a function call, so `s` stays
  available afterward.
- `if denominator != 0: ...` — a guard clause (Lesson 25's own term),
  identical in purpose to `segment_intersection`'s own parallel check,
  just written as "proceed if not parallel" instead of "exit if
  parallel."
- `diff = subtract_points(edge_start, point)`, `t =
  cross_product(diff, edge_dir) / denominator`, `s =
  cross_product(diff, ray_dir) / denominator` — Lesson 25's own formula,
  reused exactly, recovering both parameters: `t` locates the crossing
  along the ray, `s` locates it along the edge.
- `if t >= 0: ...` — first appearance of this rebuild's own bounds
  check: the ray only extends forward from `point`, never backward, so a
  negative `t` means the lines cross behind the ray's own start, not on
  it.
- `if s >= 0: if s < 1: count = count + 1` — Lesson 25's own segment
  bound, `0` to `1`, reused for now with its ordinary closed-at-both-ends
  shape (this unit doesn't yet change it) — the actual fix is Concept
  Unit 2's own job.
- `def is_point_in_polygon_robust(point, polygon): ...` — Lesson 35's
  own function, rebuilt on top of this unit's new crossing counter.
- `polygon`, `inside_point`, `outside_point` — Lesson 35's own original
  rectangle and test points, reused.
- `print(is_point_in_polygon_robust(inside_point, polygon))`,
  `print(is_point_in_polygon_robust(outside_point, polygon))` — `True`,
  `False`: the identical, correct answers Lesson 35's own original
  version already gave for these two ordinary cases — proof this
  rebuild hasn't broken anything that already worked.

### CS Lens

Reimplementing an already-correct piece of logic with more of its own
internal state exposed, specifically so a more precise rule can be
applied to one part of it, is a common refactoring motivation.

```
Also recognized in: numerical library internals (a general-purpose
library function is often reimplemented, more explicitly, inside
performance- or precision-critical code specifically to control a detail
the general version hides), compiler intermediate representations (a
compiler frequently "lowers" a high-level operation into a more explicit
form specifically to apply an optimization or correctness fix that isn't
expressible against the higher-level version), and graphics pipeline
rasterizers (production rasterizers reimplement basic line and edge
tests with exactly this kind of exposed, tunable parameter, rather than
calling a generic intersection routine, for precisely this reason)
```

### SE Lens

The design principle is **exposing internal state deliberately, in order
to apply a more precise rule to it**, rather than treating an existing
function as an opaque black box. The alternative not chosen: keep
calling Lesson 25's own `segment_intersection` unchanged, and try to
patch the vertex-straddling bug some other way, without ever touching
its own internal `s` value.

That alternative isn't really available — `segment_intersection`'s
whole point is returning a finished, closed-interval-checked point;
nothing about its own return value distinguishes "touched at `s = 0`"
from "touched at `s = 0.5`." Rebuilding the derivation inline, exposing
`s` before any bounds check runs, is what makes Concept Unit 2's actual
fix possible at all.

### Commands Needed

`python geometry_lesson_44.py` — same interpreter and command as every
prior lesson.

### Run It

```
True
False
```

Verified by actually running the file above.

### Connection

The rebuilt crossing counter still agrees with Lesson 35's own original
answers on ordinary points. The next unit changes exactly one comparison
to fix the case that was never ordinary at all.

---

## Concept Unit: The Half-Open Rule — Giving Each Vertex Exactly One Owner

### The Problem

Lesson 35's own bug came from `s`'s bounds being closed at both ends,
`0 <= s <= 1` — a ray passing through a shared vertex hits it at `s = 1`
on one edge and `s = 0` on the very next edge, and both count it. Making
the interval **half-open** — including `s = 0` but excluding `s = 1` —
means every vertex belongs to exactly one edge's own count, never two.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_44.py` — modified.
- **Change type:** replace (Concept Unit 1's own bounds check gains its
  real, working shape — it already used `s < 1` from the start, so
  Lesson 35's original comparison, `s <= 1`, is what's being replaced by
  demonstration in this unit's own closing proof, not a second edit to
  Concept Unit 1's file).
- **Location:** the closing section below, comparing this lesson's own
  fix against Lesson 35's original.
- **Dependencies:** Concept Unit 1's `count_ray_crossings_robust`,
  `is_point_in_polygon_robust`.

### The New Code

```python
notch_polygon = [(0, 0), (4, 0), (2, 2), (4, 4), (0, 4)]
genuinely_inside_point = (1, 2)
far_point = (genuinely_inside_point[0] + 1000, genuinely_inside_point[1])

print(count_ray_crossings_robust(genuinely_inside_point, far_point, notch_polygon))
print(is_point_in_polygon_robust(genuinely_inside_point, notch_polygon))
```

### The Updated Project

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def get_edge(polygon, i):
    start = polygon[i]
    end = polygon[(i + 1) % len(polygon)]
    return (start, end)


def count_ray_crossings_robust(point, far_point, polygon):
    count = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        edge_start = edge[0]
        edge_end = edge[1]
        ray_dir = subtract_points(far_point, point)
        edge_dir = subtract_points(edge_end, edge_start)
        denominator = cross_product(ray_dir, edge_dir)

        if denominator != 0:
            diff = subtract_points(edge_start, point)
            t = cross_product(diff, edge_dir) / denominator
            s = cross_product(diff, ray_dir) / denominator

            if t >= 0:
                if s >= 0:
                    if s < 1:
                        count = count + 1

    return count


def is_point_in_polygon_robust(point, polygon):
    far_point = (point[0] + 1000, point[1])
    crossings = count_ray_crossings_robust(point, far_point, polygon)
    return crossings % 2 == 1


polygon = [(0, 0), (4, 0), (4, 3), (0, 3)]

inside_point = (2, 1.5)
outside_point = (10, 10)

print(is_point_in_polygon_robust(inside_point, polygon))
print(is_point_in_polygon_robust(outside_point, polygon))


notch_polygon = [(0, 0), (4, 0), (2, 2), (4, 4), (0, 4)]              # ← new
genuinely_inside_point = (1, 2)                                       # ← new
far_point = (genuinely_inside_point[0] + 1000, genuinely_inside_point[1])  # ← new

print(count_ray_crossings_robust(genuinely_inside_point, far_point, notch_polygon))  # ← new
print(is_point_in_polygon_robust(genuinely_inside_point, notch_polygon))  # ← new
```

The file now runs the exact case Lesson 35 proved broken, through the
rebuilt, half-open-bounded crossing counter.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `notch_polygon`, `genuinely_inside_point` — Lesson 35's own reflex
  polygon and its own genuinely-interior test point, reused unchanged —
  the exact case that lesson's own closing section proved broken.
- `far_point` — already-basic reuse, built the same way as
  `is_point_in_polygon_robust`'s own internal ray.
- `print(count_ray_crossings_robust(genuinely_inside_point, far_point,
  notch_polygon))` — prints `1`. Where Lesson 35's own original crossing
  counter found `2` (double-counting the shared vertex `(4, 0)` and
  `(0, 0)` between adjacent edges — wait, more precisely, the notch
  vertex `(2, 2)` shared between edges `(4, 0)-(2, 2)` and `(2,
  2)-(4, 4)`), this rebuilt version finds exactly `1`: the half-open
  `s < 1` rule means the edge *ending* at `(2, 2)` no longer counts that
  shared point as its own crossing, leaving only the edge that *starts*
  there to count it — once, correctly.
- `print(is_point_in_polygon_robust(genuinely_inside_point,
  notch_polygon))` — prints `True`. `1 % 2 == 1` is `True`: correctly
  inside, resolving Lesson 35's own false `False` for good.

**Why excluding one end, not both, is the fix.** Excluding *both* ends
(`0 < s < 1`) would swing too far the other way — a ray passing exactly
through a vertex would then be missed by *every* adjacent edge, instead
of double-counted by two of them, an equally wrong result in the
opposite direction. Excluding *neither* end is Lesson 35's own original
bug. Excluding exactly one end means every vertex, shared between
exactly two edges in a simple polygon, is "owned" by exactly one of
them — the one where it serves as the *starting* point — and counted
exactly once, matching what a genuine crossing at that location should
contribute.

### CS Lens

Choosing a half-open interval specifically to give every boundary point a
single, unambiguous owner is a real, recurring convention in software,
not an arbitrary implementation detail of this one function.

```
Also recognized in: Python's own `range` and slicing (`range(0, 5)`
and `some_list[0:5]` are both half-open — they include index `0` but
exclude index `5` — specifically so consecutive ranges like `range(0,
5)` and `range(5, 10)` tile perfectly with no overlap and no gap, the
identical property this lesson's own `s < 1` rule provides for adjacent
polygon edges), calendar and scheduling systems (a meeting from `9:00`
to `10:00` is conventionally half-open, so a `10:00` meeting starting
right after doesn't count as an overlap), and computational geometry
libraries generally (production point-in-polygon implementations
document this exact half-open convention, often called "top-left" or
"shared-edge" rules, as the standard fix for this exact class of bug)
```

### SE Lens

The design principle is **choosing a convention that guarantees no
double-counting and no under-counting simultaneously**, rather than
patching the specific symptom that happened to be discovered first. The
alternative not chosen: special-case the exact situation Lesson 35 found
— check whether the ray's own `t` happens to land near a vertex, and
handle that one case separately from the general rule.

That alternative would fix the *specific* example that was found, while
leaving the underlying rule — closed intervals at both ends — capable of
producing the identical bug at any *other* shared vertex a different
polygon or a different ray might hit. The half-open rule fixes the
general case once, for every polygon and every ray, rather than patching
individual symptoms as they're discovered.

### Commands Needed

`python geometry_lesson_44.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
True
False
1
True
```

Verified by actually running the updated file above.

### Connection

Lesson 35's own promise is resolved: the exact case that lesson proved
broken now works correctly, using a general rule rather than a
one-off patch. Connect the Pieces, below, traces the full fix start to
finish.

---

## Connect the Pieces

One vertex, traced through both versions of the crossing test, start to
finish:

1. `notch_polygon`'s reflex vertex, `(2, 2)`, is shared between edge
   `(4, 0)-(2, 2)` (ending there, `s = 1`) and edge `(2, 2)-(4, 4)`
   (starting there, `s = 0`).
2. Lesson 35's own original test, using closed bounds `0 <= s <= 1`,
   counted *both* edges' own crossing at this shared point — `2`
   crossings total for `genuinely_inside_point`, reporting it, wrongly,
   as outside.
3. This lesson's rebuilt test, using the half-open bound `0 <= s < 1`,
   excludes the *ending* edge's own count (`s = 1` no longer satisfies
   `s < 1`) while keeping the *starting* edge's own count (`s = 0` still
   satisfies `s >= 0`) — exactly `1` crossing, reporting the point
   correctly as inside.

## What Breaks Without This

Prove the fix is real by reverting to a closed upper bound and rerunning
the exact same case:

```python
def count_ray_crossings_closed(point, far_point, polygon):
    count = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        edge_start = edge[0]
        edge_end = edge[1]
        ray_dir = subtract_points(far_point, point)
        edge_dir = subtract_points(edge_end, edge_start)
        denominator = cross_product(ray_dir, edge_dir)

        if denominator != 0:
            diff = subtract_points(edge_start, point)
            t = cross_product(diff, edge_dir) / denominator
            s = cross_product(diff, ray_dir) / denominator

            if t >= 0:
                if s >= 0:
                    if s <= 1:
                        count = count + 1

    return count


print(count_ray_crossings_closed(genuinely_inside_point, far_point, notch_polygon))
```

```
2
```

Verified by actually running this. Changing exactly one comparison, `s <
1` back to `s <= 1`, reproduces Lesson 35's own original bug precisely:
`2` crossings instead of `1`, and `is_point_in_polygon` built on top of
it would report the same genuinely-interior point as outside again. The
entire fix this lesson delivers lives in that single character —
proof that robust geometry code often isn't about more code, but about
which exact boundary condition a comparison operator draws.

## Exercises

1. Using `count_ray_crossings_robust`, verify that
   `notch_polygon`'s *other* four vertices — the ones that aren't shared
   at the exact height of a horizontal ray from a typical test point —
   still produce correct crossing counts for several points of your own
   choosing.
2. Build a polygon where a ray from your own chosen test point passes
   through *two different* shared vertices at once (two separate pairs
   of adjacent edges). Verify the half-open rule correctly resolves both
   simultaneously.
3. Using `count_ray_crossings_robust`, predict what happens for a test
   point whose ray runs exactly *along* one of the polygon's own edges
   (collinear with it, not just touching a vertex). Explain which part
   of the existing `if denominator != 0` guard clause already handles
   this case, and verify your prediction.

## Definition of Done

- [ ] `geometry_lesson_44.py` exists and runs with no errors via `python
      geometry_lesson_44.py`.
- [ ] Running it prints `True`, `False`, `1`, then `True` — matching this
      lesson's verified output exactly.
- [ ] You can explain, without looking at the file, what a half-open
      interval is and why `s < 1` fixes Lesson 35's own vertex-straddling
      bug where `s <= 1` did not.
- [ ] You can explain why excluding *both* ends of the interval would be
      just as wrong as excluding neither, using this lesson's own
      reasoning about vertex ownership.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Fix the Lesson 35 vertex-straddling bug with a half-open interval rule"`,
      not `git commit -m "fix ray casting"`.

Next: Lesson 45 — 2D Geometry Workshop, Section II's own closing
synthesis lesson, combining this section's full toolkit — lines, circles,
polygons, triangulation, spatial partitioning, and now this lesson's own
robustness discipline — into unfamiliar problems solved from first
principles, the same closing-workshop shape Lesson 20 already
established for Section I.
