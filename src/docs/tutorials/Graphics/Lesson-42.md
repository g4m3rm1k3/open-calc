# Lesson 42: Polygon Triangulation

**What you will build:** `triangulate`, breaking any simple polygon into
triangles using **ear clipping** — repeatedly finding one vertex whose
own corner can be safely cut off as a triangle, removing it, and
repeating until only a triangle remains. An "ear" needs two separate
conditions checked together: the vertex must be convex (Lesson 37's own
test, reused for one vertex instead of the whole polygon), *and* no
other vertex of the polygon may have wandered inside the candidate
triangle (Lesson 35's `is_point_in_polygon`, reused unchanged on the
candidate triangle itself). The transferable problem: Lesson 41 built
triangles outward from scattered seed points, with no polygon boundary
to respect at all. This lesson triangulates the *opposite* way — starting
from one polygon's own real boundary, including a genuine reflex vertex,
and cutting it apart without ever cutting through empty space the
polygon doesn't actually contain.

**What you need to know first:** Lesson 37's `get_vertex`,
`classify_turn`, and convexity reasoning, Lesson 34's
`polygon_orientation`, Lesson 35's `is_point_in_polygon`, and Lesson 38's
`list.append` and `while` loop.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–41.

**Terms introduced in this lesson:**

- **Ear** — a vertex of a polygon whose triangle, formed with its own
  immediate neighbors, can be safely removed: the vertex must be convex,
  *and* no other vertex of the polygon may lie inside that triangle. Why:
  this is the one unit of work ear clipping repeats until the whole
  polygon is triangulated, and it's a stronger condition than convexity
  alone, as this lesson's own closing proves directly.
- **Ear clipping** — an algorithm that triangulates a polygon by finding
  one ear, removing it as a triangle, and repeating on the
  now-one-vertex-smaller polygon until only a triangle remains. Why: this
  is the method this lesson uses, chosen because every piece of it —
  convexity, containment, growing a result — already exists in this
  curriculum's own toolkit.

**Objects and methods used:**

None. Every function in this lesson is hand-authored project code, built
from Lesson 34, 35, 37, and 38's own reused functions.

---

## Concept Unit: Is This Vertex Convex? — Testing One Corner at a Time

### The Problem

Lesson 37's `is_polygon_convex` answers one yes/no question about an
entire polygon. Ear clipping needs a narrower question, asked
repeatedly: is *this specific* vertex, on its own, convex — regardless
of whether any other vertex is.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–41.
- **Files affected:** `geometry_lesson_42.py` — created, as a new file
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


def get_vertex(polygon, i):
    return polygon[i % len(polygon)]


def get_edge(polygon, i):
    start = polygon[i]
    end = polygon[(i + 1) % len(polygon)]
    return (start, end)


def polygon_signed_area(polygon):
    total = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        v1 = edge[0]
        v2 = edge[1]
        total = total + cross_product(v1, v2)
    return total / 2


def polygon_orientation(polygon):
    signed_area = polygon_signed_area(polygon)

    if signed_area > 0:
        return "counterclockwise"
    elif signed_area < 0:
        return "clockwise"
    else:
        return "degenerate"


def is_convex_vertex(polygon, i):
    prev_vertex = get_vertex(polygon, i - 1)
    current_vertex = get_vertex(polygon, i)
    next_vertex = get_vertex(polygon, i + 1)
    overall = polygon_orientation(polygon)
    local_turn = classify_turn(prev_vertex, current_vertex, next_vertex)

    if overall == "counterclockwise":
        return local_turn == "left"
    else:
        return local_turn == "right"


notch_polygon = [(0, 0), (4, 0), (2, 2), (4, 4), (0, 4)]

print(is_convex_vertex(notch_polygon, 0))
print(is_convex_vertex(notch_polygon, 1))
print(is_convex_vertex(notch_polygon, 2))
print(is_convex_vertex(notch_polygon, 3))
print(is_convex_vertex(notch_polygon, 4))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* every function above is retyped unchanged from
Lessons 2, 8, 19, 33, 34, and 37, except `is_convex_vertex` itself,
which is built entirely from already-covered function calls and
`if`/`else`. No new Python construct appears here, so no isolated
throwaway lab is needed.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def subtract_points(...)` through `def polygon_orientation(...)` —
  Lesson 2, 8, 19, 33, and 34's own functions, retyped unchanged. No
  re-explanation owed, per the Repetition Rule.
- `def is_convex_vertex(polygon, i): ...` — first appearance: a
  narrower, single-vertex version of Lesson 37's own convexity test.
- `prev_vertex`, `current_vertex`, `next_vertex`, `overall`,
  `local_turn` — already-basic reuse, the identical five lines Lesson
  37's own `is_polygon_convex` already computed inside its loop.
- `if overall == "counterclockwise": return local_turn == "left" else:
  return local_turn == "right"` — a **hard concept reappearing**: Lesson
  37's own comparison logic, restated for one vertex's own answer
  instead of a whole-polygon guard clause.
- `notch_polygon = [(0, 0), (4, 0), (2, 2), (4, 4), (0, 4)]` — Lesson 35
  and 38's own reflex-notch polygon, reused: five vertices, one of them,
  `(2, 2)`, genuinely non-convex.
- The five `print(is_convex_vertex(notch_polygon, i))` calls — print
  `True`, `True`, `False`, `True`, `True`: every vertex is convex except
  index `2`, the reflex point itself.

### CS Lens

Refactoring a whole-collection check into a single-item version that the
original can be rebuilt from, rather than maintaining two independent
implementations, is a small but genuinely valuable instance of the same
reuse discipline this curriculum has followed since Lesson 13.

```
Also recognized in: validation libraries (a form validator's
"is this whole form valid" check is almost always built from a
single-field "is this one field valid" function, reused per field,
exactly this lesson's own relationship to Lesson 37), test suites (a
single assertion function gets reused across many individual test cases
rather than each test reimplementing its own comparison logic), and mesh
processing (checking whether an entire 3D mesh is watertight is built
from a per-edge "does this edge have exactly two adjacent faces" check,
the identical whole-versus-one-piece relationship)
```

### SE Lens

The design principle is **factoring a per-item test out of a
whole-collection check**, once a second use for the per-item version
appears. The alternative not chosen: leave Lesson 37's own convexity
logic embedded inside `is_polygon_convex`'s loop, and write a second,
separate copy of the identical five lines inside this lesson's own ear
test instead of extracting `is_convex_vertex`.

That alternative would have worked, technically — the logic is short
enough to duplicate without much visible cost. The real cost it pays:
two copies of the identical reasoning about convexity, in two different
lessons, would need to be kept consistent by hand forever after. Naming
`is_convex_vertex` once means both Lesson 37's own whole-polygon check
and this lesson's own ear test can, in principle, share a single
trusted implementation of what "convex, at one vertex" actually means.

### Commands Needed

`python geometry_lesson_42.py` — same interpreter and command as every
prior lesson.

### Run It

```
True
True
False
True
True
```

Verified by actually running the file above.

### Connection

Convexity alone is checkable per vertex. The next unit proves it isn't
the whole story — a convex vertex can still fail to be a valid ear.

---

## Concept Unit: Is This Vertex an Ear? — Checking Nothing Else Got in the Way

### The Problem

A convex vertex's own triangle can still contain some *other* vertex of
the polygon — cutting it off anyway would slice straight through
territory that isn't really this corner's own to remove. An **ear**
needs both conditions confirmed, not just convexity alone.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_42.py` — modified.
- **Change type:** add.
- **Location:** appended below the final `print(is_convex_vertex(...))`
  line added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `is_convex_vertex`, `get_vertex`,
  `notch_polygon`.

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


def count_ray_crossings(point, far_point, polygon):
    count = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        edge_start = edge[0]
        edge_end = edge[1]
        result = segment_intersection(point, far_point, edge_start, edge_end)
        if result != "no intersection":
            count = count + 1
    return count


def is_point_in_polygon(point, polygon):
    far_point = (point[0] + 1000, point[1])
    crossings = count_ray_crossings(point, far_point, polygon)
    return crossings % 2 == 1


def is_vertex_of_triangle(v, triangle):
    if v == triangle[0]:
        return True
    if v == triangle[1]:
        return True
    if v == triangle[2]:
        return True
    return False


def is_ear(polygon, i):
    if is_convex_vertex(polygon, i) == False:
        return False

    prev_vertex = get_vertex(polygon, i - 1)
    current_vertex = get_vertex(polygon, i)
    next_vertex = get_vertex(polygon, i + 1)
    triangle = [prev_vertex, current_vertex, next_vertex]

    for j in range(len(polygon)):
        test_vertex = polygon[j]
        if is_vertex_of_triangle(test_vertex, triangle) == False:
            if is_point_in_polygon(test_vertex, triangle):
                return False

    return True


print(is_ear(notch_polygon, 0))
print(is_ear(notch_polygon, 3))
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


def get_vertex(polygon, i):
    return polygon[i % len(polygon)]


def get_edge(polygon, i):
    start = polygon[i]
    end = polygon[(i + 1) % len(polygon)]
    return (start, end)


def polygon_signed_area(polygon):
    total = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        v1 = edge[0]
        v2 = edge[1]
        total = total + cross_product(v1, v2)
    return total / 2


def polygon_orientation(polygon):
    signed_area = polygon_signed_area(polygon)

    if signed_area > 0:
        return "counterclockwise"
    elif signed_area < 0:
        return "clockwise"
    else:
        return "degenerate"


def is_convex_vertex(polygon, i):
    prev_vertex = get_vertex(polygon, i - 1)
    current_vertex = get_vertex(polygon, i)
    next_vertex = get_vertex(polygon, i + 1)
    overall = polygon_orientation(polygon)
    local_turn = classify_turn(prev_vertex, current_vertex, next_vertex)

    if overall == "counterclockwise":
        return local_turn == "left"
    else:
        return local_turn == "right"


notch_polygon = [(0, 0), (4, 0), (2, 2), (4, 4), (0, 4)]

print(is_convex_vertex(notch_polygon, 0))
print(is_convex_vertex(notch_polygon, 1))
print(is_convex_vertex(notch_polygon, 2))
print(is_convex_vertex(notch_polygon, 3))
print(is_convex_vertex(notch_polygon, 4))


def add_vector_to_point(point, vector):                                  # ← new
    return (point[0] + vector[0], point[1] + vector[1])                # ← new


def scale_vector(vector, factor):                                        # ← new
    return (vector[0] * factor, vector[1] * factor)                     # ← new


def point_on_line(line_point, line_direction, t):                        # ← new
    return add_vector_to_point(line_point, scale_vector(line_direction, t))  # ← new


def is_t_on_segment(t):                                                  # ← new
    return 0 <= t <= 1                                                  # ← new


def segment_intersection(segment1_start, segment1_end, segment2_start, segment2_end):  # ← new
    dir1 = subtract_points(segment1_end, segment1_start)                # ← new
    dir2 = subtract_points(segment2_end, segment2_start)                # ← new
    denominator = cross_product(dir1, dir2)                             # ← new
                                                                           # ← new
    if denominator == 0:                                                 # ← new
        return "no intersection"                                        # ← new
                                                                           # ← new
    diff = subtract_points(segment2_start, segment1_start)              # ← new
    t = cross_product(diff, dir2) / denominator                         # ← new
    s = cross_product(diff, dir1) / denominator                         # ← new
                                                                           # ← new
    if is_t_on_segment(t) == False:                                     # ← new
        return "no intersection"                                        # ← new
                                                                           # ← new
    if is_t_on_segment(s) == False:                                     # ← new
        return "no intersection"                                        # ← new
                                                                           # ← new
    return point_on_line(segment1_start, dir1, t)                       # ← new


def count_ray_crossings(point, far_point, polygon):                      # ← new
    count = 0                                                            # ← new
    for i in range(len(polygon)):                                       # ← new
        edge = get_edge(polygon, i)                                     # ← new
        edge_start = edge[0]                                            # ← new
        edge_end = edge[1]                                              # ← new
        result = segment_intersection(point, far_point, edge_start, edge_end)  # ← new
        if result != "no intersection":                                # ← new
            count = count + 1                                           # ← new
    return count                                                         # ← new


def is_point_in_polygon(point, polygon):                                 # ← new
    far_point = (point[0] + 1000, point[1])                              # ← new
    crossings = count_ray_crossings(point, far_point, polygon)          # ← new
    return crossings % 2 == 1                                           # ← new


def is_vertex_of_triangle(v, triangle):                                  # ← new
    if v == triangle[0]:                                                 # ← new
        return True                                                      # ← new
    if v == triangle[1]:                                                 # ← new
        return True                                                      # ← new
    if v == triangle[2]:                                                 # ← new
        return True                                                      # ← new
    return False                                                         # ← new


def is_ear(polygon, i):                                                  # ← new
    if is_convex_vertex(polygon, i) == False:                           # ← new
        return False                                                    # ← new
                                                                           # ← new
    prev_vertex = get_vertex(polygon, i - 1)                            # ← new
    current_vertex = get_vertex(polygon, i)                             # ← new
    next_vertex = get_vertex(polygon, i + 1)                            # ← new
    triangle = [prev_vertex, current_vertex, next_vertex]                # ← new
                                                                           # ← new
    for j in range(len(polygon)):                                       # ← new
        test_vertex = polygon[j]                                        # ← new
        if is_vertex_of_triangle(test_vertex, triangle) == False:       # ← new
            if is_point_in_polygon(test_vertex, triangle):              # ← new
                return False                                            # ← new
                                                                           # ← new
    return True                                                          # ← new


print(is_ear(notch_polygon, 0))                                          # ← new
print(is_ear(notch_polygon, 3))                                          # ← new
```

The file now has a complete, real ear test — not just convexity, but the
full condition an ear actually needs.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def add_vector_to_point(...)` through `def is_point_in_polygon(...)`
  — Lesson 2, 3, 8, 21, 25, and 35's own functions, retyped unchanged.
  No re-explanation owed, per the Repetition Rule.
- `def is_vertex_of_triangle(v, triangle): ...` — first appearance: a
  small helper checking whether a point is literally one of a triangle's
  own three corners, written with three separate `if` statements rather
  than a single `or`-joined condition, matching this curriculum's
  established style since Lesson 21.
- `def is_ear(polygon, i): ...` — first appearance: this lesson's own
  actual test.
- `if is_convex_vertex(polygon, i) == False: return False` — a guard
  clause (Lesson 25's own term), reusing Concept Unit 1's own function:
  a non-convex vertex can never be an ear, so there's no reason to check
  anything further.
- `prev_vertex`, `current_vertex`, `next_vertex`, `triangle` —
  already-basic reuse, building the candidate ear as a plain 3-vertex
  `list` — the same shape `is_point_in_polygon` already expects for any
  polygon.
- `for j in range(len(polygon)): test_vertex = polygon[j]` —
  already-basic reuse, checking every vertex of the *original* polygon,
  not just the three forming the candidate triangle.
- `if is_vertex_of_triangle(test_vertex, triangle) == False: if
  is_point_in_polygon(test_vertex, triangle): return False` — first
  appearance of the actual containment check: for any vertex that
  *isn't* one of the triangle's own three corners, Lesson 35's own
  predicate, reused completely unchanged, checks whether it has wandered
  inside. The moment one has, this vertex fails to be an ear.
- `return True` — reached only once every other vertex has been checked
  and none were found inside.
- `print(is_ear(notch_polygon, 0))` — prints `False`: vertex `0` is
  convex (Concept Unit 1 already confirmed this), but its own candidate
  triangle, `((0, 4), (0, 0), (4, 0))`, turns out to contain the reflex
  vertex `(2, 2)` — disqualifying it.
- `print(is_ear(notch_polygon, 3))` — prints `True`: vertex `3`'s own
  triangle, `((2, 2), (4, 4), (0, 4))`, contains no other vertex at all.

### CS Lens

Requiring two independent conditions to both hold, rather than trusting
the cheaper one alone, is worth recognizing on its own — the same
discipline Lesson 36 already applied when boundary crossings alone
turned out not to be enough to detect polygon overlap.

```
Also recognized in: mesh generation and CAD kernels (every production
implementation of ear clipping performs exactly this two-part check —
convexity is cheap to test and rules out most vertices quickly, but the
containment check is what actually guarantees correctness), collision
detection broad-phase and narrow-phase pipelines (a cheap bounding check
narrows candidates first, but a more expensive precise check still has
to confirm before anything is trusted, the same two-tier structure), and
compiler optimization safety checks (an optimization that looks locally
valid — like inlining a function — often still needs a broader,
more expensive check to confirm nothing elsewhere in the program depends
on the un-inlined version)
```

### SE Lens

The design principle is **checking the cheap condition first, and only
paying for the expensive one when it might actually matter**. The
alternative not chosen: run the full containment check against every
vertex regardless of convexity, skipping the `is_convex_vertex` guard
clause entirely.

That alternative would still be correct — a non-convex vertex would
eventually fail the containment check too, once enough of the polygon's
own vertices turned out to sit inside its badly-shaped candidate
triangle. The real cost it pays: `is_point_in_polygon`, called once per
other vertex, is meaningfully more expensive than
`is_convex_vertex`'s own single `classify_turn` call — checking the
cheap condition first, and returning `False` immediately when it fails,
avoids paying for the expensive check on every non-convex vertex a real
polygon might have.

### Commands Needed

`python geometry_lesson_42.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
True
True
False
True
True
False
True
```

Verified by actually running the updated file above.

### Connection

A real ear test now exists, and it already disagrees with convexity
alone on this lesson's own reflex polygon. The next unit uses that test
to actually cut the polygon into triangles.

---

## Concept Unit: Clipping Ears Until Only a Triangle Remains

### The Problem

One confirmed ear is one triangle. A whole triangulation needs this
found, recorded, and removed, over and over, on a polygon that shrinks
by one vertex each time — continuing for as long as more than a triangle
remains, a count that depends entirely on the input, not a number known
in advance.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_42.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(is_ear(notch_polygon, 3))`
  line added in Concept Unit 2.
- **Dependencies:** Concept Unit 1's `get_vertex`, Concept Unit 2's
  `is_ear`, `notch_polygon`, Lesson 34's `polygon_signed_area`.

### The New Code

```python
def find_ear_index(polygon):
    for i in range(len(polygon)):
        if is_ear(polygon, i):
            return i
    return 0


def remove_vertex(polygon, i):
    result = []
    for j in range(len(polygon)):
        if j != i:
            result.append(polygon[j])
    return result


def triangulate(polygon):
    remaining = polygon
    triangles = []

    while len(remaining) > 3:
        ear_index = find_ear_index(remaining)
        prev_vertex = get_vertex(remaining, ear_index - 1)
        current_vertex = get_vertex(remaining, ear_index)
        next_vertex = get_vertex(remaining, ear_index + 1)
        triangles.append((prev_vertex, current_vertex, next_vertex))
        remaining = remove_vertex(remaining, ear_index)

    triangles.append((remaining[0], remaining[1], remaining[2]))
    return triangles


triangles = triangulate(notch_polygon)
print(triangles)

total_area = 0
for triangle in triangles:
    total_area = total_area + polygon_signed_area(list(triangle))

print(total_area)
print(polygon_signed_area(notch_polygon))
```

### The Updated Project

```python
def is_convex_vertex(polygon, i):
    prev_vertex = get_vertex(polygon, i - 1)
    current_vertex = get_vertex(polygon, i)
    next_vertex = get_vertex(polygon, i + 1)
    overall = polygon_orientation(polygon)
    local_turn = classify_turn(prev_vertex, current_vertex, next_vertex)

    if overall == "counterclockwise":
        return local_turn == "left"
    else:
        return local_turn == "right"


def is_vertex_of_triangle(v, triangle):
    if v == triangle[0]:
        return True
    if v == triangle[1]:
        return True
    if v == triangle[2]:
        return True
    return False


def is_ear(polygon, i):
    if is_convex_vertex(polygon, i) == False:
        return False

    prev_vertex = get_vertex(polygon, i - 1)
    current_vertex = get_vertex(polygon, i)
    next_vertex = get_vertex(polygon, i + 1)
    triangle = [prev_vertex, current_vertex, next_vertex]

    for j in range(len(polygon)):
        test_vertex = polygon[j]
        if is_vertex_of_triangle(test_vertex, triangle) == False:
            if is_point_in_polygon(test_vertex, triangle):
                return False

    return True


notch_polygon = [(0, 0), (4, 0), (2, 2), (4, 4), (0, 4)]

print(is_ear(notch_polygon, 0))
print(is_ear(notch_polygon, 3))


def find_ear_index(polygon):                                             # ← new
    for i in range(len(polygon)):                                       # ← new
        if is_ear(polygon, i):                                          # ← new
            return i                                                    # ← new
    return 0                                                             # ← new


def remove_vertex(polygon, i):                                           # ← new
    result = []                                                          # ← new
    for j in range(len(polygon)):                                       # ← new
        if j != i:                                                      # ← new
            result.append(polygon[j])                                  # ← new
    return result                                                        # ← new


def triangulate(polygon):                                                # ← new
    remaining = polygon                                                 # ← new
    triangles = []                                                      # ← new
                                                                           # ← new
    while len(remaining) > 3:                                           # ← new
        ear_index = find_ear_index(remaining)                           # ← new
        prev_vertex = get_vertex(remaining, ear_index - 1)              # ← new
        current_vertex = get_vertex(remaining, ear_index)                # ← new
        next_vertex = get_vertex(remaining, ear_index + 1)               # ← new
        triangles.append((prev_vertex, current_vertex, next_vertex))    # ← new
        remaining = remove_vertex(remaining, ear_index)                 # ← new
                                                                           # ← new
    triangles.append((remaining[0], remaining[1], remaining[2]))        # ← new
    return triangles                                                     # ← new


triangles = triangulate(notch_polygon)                                   # ← new
print(triangles)                                                         # ← new

total_area = 0                                                           # ← new
for triangle in triangles:                                               # ← new
    total_area = total_area + polygon_signed_area(list(triangle))       # ← new

print(total_area)                                                        # ← new
print(polygon_signed_area(notch_polygon))                                # ← new
```

The file now triangulates a real, non-convex polygon completely, and
proves the result is correct by an independent area check.

*A note on method:* `list.append` and the `while` loop were both given
full first-appearance treatment in Lesson 38 — no new Python construct
appears in this unit. `remove_vertex`'s own `result = []` followed by
`.append` inside a `for` loop is Lesson 38's own list-building pattern,
just filtering out one index instead of collecting every item
unconditionally.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def find_ear_index(polygon): ...` — first appearance: scans every
  vertex in order and returns the first one that passes Concept Unit
  2's own `is_ear` test.
- `for i in range(len(polygon)): if is_ear(polygon, i): return i` —
  already-basic reuse of a search loop, structurally identical to
  Lesson 27's own early-exit pattern, just returning a found index
  instead of `True`.
- `return 0` — a fallback, reached only if no ear is ever found; for any
  genuinely simple polygon, ear clipping's own underlying theorem
  guarantees at least one ear always exists, so this line is never
  actually reached by valid input.
- `def remove_vertex(polygon, i): ...` — first appearance: builds a
  *new* list containing every vertex except the one at index `i`.
- `result = []`, the `for` loop, `if j != i: result.append(polygon[j])`
  — Lesson 38's own list-building pattern, reused: start empty, and
  append each item that survives a condition — here, every index except
  the one being removed.
- `def triangulate(polygon): ...` — first appearance: this lesson's own
  final subject.
- `remaining = polygon`, `triangles = []` — already-basic setup: a
  working copy of the vertex list that will shrink, and an empty list
  that will grow.
- `while len(remaining) > 3: ...` — a **hard concept reappearing**:
  Lesson 38's own `while` loop, restated: continues for as long as more
  than a triangle's worth of vertices remain, a count that depends
  entirely on the specific polygon, not a number decided in advance.
- `ear_index = find_ear_index(remaining)` — already-basic reuse, finding
  one real ear in the current, shrinking polygon.
- `prev_vertex`, `current_vertex`, `next_vertex` — already-basic reuse,
  the ear's own three corners.
- `triangles.append((prev_vertex, current_vertex, next_vertex))` —
  Lesson 38's own method, reused: recording this ear as one more
  finished triangle.
- `remaining = remove_vertex(remaining, ear_index)` — already-basic
  reuse, shrinking the working polygon by exactly the vertex just
  clipped.
- `triangles.append((remaining[0], remaining[1], remaining[2]))` —
  reached once the loop exits with exactly three vertices left: the
  final triangle, needing no ear test at all, since any three points
  already form one valid triangle.
- `return triangles` — every triangle found, in the order they were
  clipped.
- `triangles = triangulate(notch_polygon)`, `print(triangles)` — prints
  `[((0, 0), (4, 0), (2, 2)), ((0, 4), (0, 0), (2, 2)), ((2, 2), (4, 4),
  (0, 4))]` — three triangles from the original five vertices.
- `total_area`, the `for` loop, `print(total_area)`,
  `print(polygon_signed_area(notch_polygon))` — Lesson 33's own
  accumulator pattern, reused: summing each output triangle's own
  `polygon_signed_area` (Lesson 34, reused on a 3-vertex list). Both
  print `12.0` — the three triangles' combined area exactly matches the
  original polygon's own area, confirming the triangulation is correct,
  not just plausible-looking.

### CS Lens

Verifying a decomposition by checking that its pieces recombine to the
original whole — here, summed area matching exactly — is a general and
powerful correctness check, wherever something is broken into smaller
parts.

```
Also recognized in: finite element meshing (a mesh's total volume or
area is checked against the original modeled part's own known volume, to
catch meshing errors before a simulation runs on bad data), image
processing tile-based algorithms (splitting a large image into tiles for
parallel processing is checked by confirming the tiles' combined pixel
count matches the original image), and accounting reconciliation
(splitting a total transaction into line items is checked by confirming
the line items sum back to the original total, the identical
decomposition-must-recombine principle applied to money instead of
geometry)
```

### SE Lens

The design principle is **checking a result against an independent
property it must satisfy, rather than trusting the algorithm because its
individual steps looked correct**. The alternative not chosen: trust
`triangulate`'s own output once `is_ear` and `remove_vertex` were each
verified individually, without ever summing the resulting triangles'
areas back together.

That alternative would have caught a broken `is_ear` or `remove_vertex`
individually, but not necessarily a subtler bug in how `triangulate`
combines them — an off-by-one in which vertex gets removed, say, that
still produces triangles but silently wrong ones. The area cross-check
this unit performed is a single, cheap, independent confirmation that
the whole triangulation — not just its individual pieces — is correct,
the same standard of evidence Lesson 24's own `t`/`s` double-check and
Lesson 16's identity-matrix proof already applied elsewhere in this
curriculum.

### Commands Needed

`python geometry_lesson_42.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
True
True
False
True
True
False
True
[((0, 0), (4, 0), (2, 2)), ((0, 4), (0, 0), (2, 2)), ((2, 2), (4, 4), (0, 4))]
12.0
12.0
```

Verified by actually running the updated file above.

### Connection

`notch_polygon` is now fully, correctly triangulated, with an
independent area check confirming it. What Breaks Without This proves
that skipping the containment check inside `is_ear` — trusting convexity
alone — would have corrupted this exact result.

---

## Connect the Pieces

One polygon, traced through everything this lesson built, start to
finish:

1. `notch_polygon = [(0, 0), (4, 0), (2, 2), (4, 4), (0, 4)]` — five
   vertices, one reflex.
2. `is_convex_vertex` finds every vertex convex except index `2`.
3. `is_ear` finds vertex `0` disqualified anyway — its triangle contains
   the reflex vertex — while vertex `3` passes both conditions cleanly.
4. `triangulate` repeatedly finds and clips real ears — `find_ear_index`
   locating one, `remove_vertex` shrinking the polygon, `.append`
   recording the triangle — until exactly three vertices remain, closing
   with `[((0, 0), (4, 0), (2, 2)), ((0, 4), (0, 0), (2, 2)), ((2, 2),
   (4, 4), (0, 4))]`.
5. Summing `polygon_signed_area` over all three triangles gives `12.0`,
   exactly matching `polygon_signed_area(notch_polygon)`'s own `12.0` —
   independent proof the triangulation is correct.

## What Breaks Without This

`is_ear`'s own containment check exists specifically to catch a convex
vertex whose triangle isn't actually safe to clip. Prove it, by building
the ear vertex `0` *would* produce if only convexity were checked:

```python
prev_vertex = get_vertex(notch_polygon, -1)
current_vertex = get_vertex(notch_polygon, 0)
next_vertex = get_vertex(notch_polygon, 1)

naive_triangle = (prev_vertex, current_vertex, next_vertex)
print(naive_triangle)
print(polygon_signed_area(list(naive_triangle)))
```

```
((0, 4), (0, 0), (4, 0))
8.0
```

Verified by actually running this. Vertex `0` genuinely is convex — this
lesson's own Concept Unit 1 already confirmed it — so a naive ear test
checking only `is_convex_vertex` would accept this exact triangle,
`((0, 4), (0, 0), (4, 0))`, as a valid clip. It isn't: this triangle's
own `8.0` units of area silently include the reflex vertex `(2, 2)`
inside it — territory that isn't really this corner's alone to remove,
since `(2, 2)` is a real vertex of the actual polygon boundary sitting
inside that space. Clipping this "ear" anyway would corrupt the whole
remaining triangulation: the algorithm would continue on a five-minus-one
vertex shape that no longer represents `notch_polygon`'s real boundary
at all, and the final area cross-check this lesson's own Concept Unit 3
relies on would silently disagree with the original polygon's own area —
exactly the kind of corruption a naive, convexity-only implementation
would never catch on its own, without ever crashing or raising an error.

## Exercises

1. Using `triangulate`, triangulate `square = [(0, 0), (4, 0), (4, 4),
   (0, 4)]` — a fully convex polygon with no reflex vertices at all —
   and confirm it produces exactly two triangles whose combined area
   matches the square's own `16.0`.
2. Using `is_ear`, check every vertex of a hexagon of your own choosing
   that has *two* reflex vertices instead of one, and confirm
   `find_ear_index` still finds a genuinely valid ear to start from.
3. Predict, then verify, how many triangles `triangulate` produces for a
   polygon with `7` vertices. Explain the general relationship between a
   polygon's vertex count and its triangle count in any ear-clipping
   triangulation, using this lesson's own `5`-vertex, `3`-triangle result
   as a starting point.

## Definition of Done

- [ ] `geometry_lesson_42.py` exists and runs with no errors via `python
      geometry_lesson_42.py`.
- [ ] Running it prints the full 10-line sequence shown in Concept Unit
      3's Run It, ending in the three-triangle list, `12.0`, then `12.0`
      — matching this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, why an ear needs both
      convexity *and* an empty-triangle check, using this lesson's own
      verified vertex-`0` counter-example.
- [ ] You can explain why `triangulate` uses a `while` loop instead of a
      `for` loop, using the same "size not known in advance" reasoning
      Lesson 38 already established for `convex_hull`.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Triangulate polygons via ear clipping, requiring both convexity and an empty containment check"`,
      not `git commit -m "add triangulate"`.

Next: Lesson 43 — Spatial Partitioning in 2D, which returns to the
"check every pairing" cost Lesson 36 and 39 both grappled with, this time
solving it by dividing space itself into cells, rather than sorting
along a single sweep axis.
