# Lesson 39: Sweep-Line Algorithms

**What you will build:** `find_intersections_swept`, finding every
crossing among a whole set of segments while calling Lesson 25's
`segment_intersection` far fewer times than Lesson 36's own exhaustive
check would — by sorting the segments left to right first, using
Python's `sorted`, and stopping each inner search early with `break` the
moment a later segment starts too far right to possibly reach the
current one. The transferable problem: every intersection-finding
algorithm this curriculum has built since Lesson 24 either solved one
fixed pair directly, or, for a whole collection (Lesson 36's polygon
edges), checked *every* possible pairing exhaustively. A **sweep line**
is a genuinely different strategy: process objects in sorted order along
one axis, and let that order itself rule out most pairs before ever
testing them.

**What you need to know first:** Lesson 25's `segment_intersection`,
Lesson 33's `for` loop and accumulator pattern, and Lesson 38's `while`
loop and `list.append` (reused here for building the normalized segment
list).

**Assumed background (outside this curriculum):** unchanged from Lessons
1–38, except that `sorted` and `break` — real Python tools not yet used
in this curriculum's project code — receive full first-appearance
treatment in this lesson's first two Concept Units.

**Terms introduced in this lesson:**

- **Sweep line** — an algorithmic strategy that processes a set of
  geometric objects in sorted order along one axis, using that order to
  rule out impossible pairings cheaply, instead of testing every pairing
  directly. Why: this is a fundamentally different strategy from Lesson
  36's own exhaustive nested loop — using *order itself* as the tool that
  avoids unnecessary work, rather than a geometric shortcut like Lesson
  32's radical line.

**Objects and methods used:**

- **`sorted`**
  - *What it is:* a built-in function that returns a new list containing
    the same items as its input, arranged in ascending order.
  - *Implementation:* called as `sorted(sequence)`, returning a `list`;
    for a list of tuples, items are compared position by position — first
    element first, then the second only if the first elements are equal,
    and so on.
  - *Its use:* this lesson needs its segments arranged left to right, by
    each one's own leftmost `x` coordinate, before the sweep can begin.

---

## Concept Unit: Normalizing and Sorting Segments — First Use of sorted

### The Problem

A sweep across `x` needs to know, unambiguously, which end of each
segment is "the left one" and which point should drive the sort — a
segment stored as `(p1, p2)` gives no guarantee `p1` is actually the
leftward point.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–38.
- **Files affected:** `geometry_lesson_39.py` — created, as a new file
  for this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
def normalize_segment(segment):
    p1 = segment[0]
    p2 = segment[1]
    if p1[0] <= p2[0]:
        return (p1, p2)
    else:
        return (p2, p1)


segments = [((0, 0), (3, 3)), ((0, 3), (3, 0)), ((5, 0), (8, 0)), ((6, -1), (6, 5))]

normalized_segments = []
for segment in segments:
    normalized_segments.append(normalize_segment(segment))

sorted_segments = sorted(normalized_segments)

print(normalized_segments)
print(sorted_segments)
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* `if`/`else`, `for` loops, and `list.append` were all
already given full treatment (Lessons 19, 27, and 38). No new Python
construct appears in `normalize_segment` or the `for` loop that calls
it, so no isolated throwaway lab is needed for those; `sorted` itself,
covered in the Objects and methods section above, needs no lab either —
it's a plain function call, not a new syntactic construct.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def normalize_segment(segment): ...` — first appearance: guarantees a
  segment's first point always has the smaller (or equal) `x` coordinate.
- `p1 = segment[0]`, `p2 = segment[1]` — already-basic indexing.
- `if p1[0] <= p2[0]: return (p1, p2) else: return (p2, p1)` —
  already-basic `if`/`else`, swapping the two points only when necessary
  to guarantee the leftward one comes first.
- `segments = [...]` — four segments: two that cross each other near the
  origin, and two more, far to the right, that also cross each other.
- `normalized_segments = []`, the `for` loop, and `.append(...)` —
  already-basic reuse of Lesson 38's own pattern, building a new list of
  normalized segments one at a time.
- `sorted_segments = sorted(normalized_segments)` — first appearance of
  `sorted`: given a list of `(point, point)` tuples, it compares them the
  way Python compares any tuples — first by each segment's own leading
  point, which, thanks to `normalize_segment`, is now guaranteed to be
  the leftward one.
- `print(normalized_segments)`, `print(sorted_segments)` — both print the
  identical list, `[((0, 0), (3, 3)), ((0, 3), (3, 0)), ((5, 0), (8, 0)),
  ((6, -1), (6, 5))]` — this particular set of segments already happened
  to be listed left to right.

### CS Lens

Establishing a canonical form for a piece of data — here, always putting
the leftward point first — before comparing or sorting it, is a small
but genuinely common preparatory step.

```
Also recognized in: database normalization (storing data in one
consistent, canonical shape before querying or comparing it, the same
underlying idea as this lesson's own point-ordering rule, applied to
records instead of segments), string and hash comparison (many systems
normalize case, whitespace, or Unicode form before comparing two strings
for equality, to avoid two representations of "the same" value being
treated as different), and geometric predicates in CAD kernels (many
robust geometric algorithms canonicalize a shape's own point ordering
before processing it, for the identical reason this lesson does — so
downstream logic can rely on a guaranteed, consistent shape)
```

### SE Lens

The design principle is **guaranteeing a consistent shape for the data
before relying on an ordering assumption about it**, rather than trusting
input to already be in the needed form. The alternative not chosen: skip
`normalize_segment`, and sort segments as they arrive, trusting whichever
point happens to be listed first.

That alternative would make `sorted`'s own comparison unreliable — two
representations of the exact same segment, `((0, 0), (3, 3))` and
`((3, 3), (0, 0))`, would sort to completely different positions,
because Python compares tuples by their literal first element, with no
way to know these represent the same underlying segment. Normalizing
first guarantees the sort actually reflects each segment's real position
in space, not an accident of how its endpoints happened to be listed.

### Commands Needed

`python geometry_lesson_39.py` — same interpreter and command as every
prior lesson.

### Run It

```
[((0, 0), (3, 3)), ((0, 3), (3, 0)), ((5, 0), (8, 0)), ((6, -1), (6, 5))]
[((0, 0), (3, 3)), ((0, 3), (3, 0)), ((5, 0), (8, 0)), ((6, -1), (6, 5))]
```

Verified by actually running the file above.

### Connection

Every segment is now normalized and sorted, left to right. The next unit
uses that order to skip pairs that couldn't possibly be close to each
other.

---

## Concept Unit: Stopping Early — break and Skipping Impossible Pairs

### The Problem

Once segments are sorted left to right, a segment far to the right of
another can't possibly overlap it in `x` — and neither can anything
*after* it in the sorted order, since everything later starts even
further right. Checking those remaining segments anyway would be wasted
work.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_39.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(sorted_segments)` line added
  in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `sorted_segments`.

### The New Code

```python
def find_close_pairs(sorted_segments):
    close_pairs_count = 0
    for i in range(len(sorted_segments)):
        segment_i = sorted_segments[i]
        end_x_i = segment_i[1][0]
        for j in range(i + 1, len(sorted_segments)):
            segment_j = sorted_segments[j]
            start_x_j = segment_j[0][0]
            if start_x_j > end_x_i:
                break
            close_pairs_count = close_pairs_count + 1
    return close_pairs_count


print(find_close_pairs(sorted_segments))
```

### The Updated Project

```python
def normalize_segment(segment):
    p1 = segment[0]
    p2 = segment[1]
    if p1[0] <= p2[0]:
        return (p1, p2)
    else:
        return (p2, p1)


segments = [((0, 0), (3, 3)), ((0, 3), (3, 0)), ((5, 0), (8, 0)), ((6, -1), (6, 5))]

normalized_segments = []
for segment in segments:
    normalized_segments.append(normalize_segment(segment))

sorted_segments = sorted(normalized_segments)

print(normalized_segments)
print(sorted_segments)


def find_close_pairs(sorted_segments):                                   # ← new
    close_pairs_count = 0                                                # ← new
    for i in range(len(sorted_segments)):                                # ← new
        segment_i = sorted_segments[i]                                   # ← new
        end_x_i = segment_i[1][0]                                        # ← new
        for j in range(i + 1, len(sorted_segments)):                    # ← new
            segment_j = sorted_segments[j]                               # ← new
            start_x_j = segment_j[0][0]                                  # ← new
            if start_x_j > end_x_i:                                     # ← new
                break                                                    # ← new
            close_pairs_count = close_pairs_count + 1                   # ← new
    return close_pairs_count                                             # ← new


print(find_close_pairs(sorted_segments))                                 # ← new
```

The file now counts how many segment pairs are even worth a real
intersection test, without yet running one.

### Isolated Concept: `break`

This is exactly what `find_close_pairs`'s own inner loop is doing when it
finds a segment too far away, isolated down to a plain counting loop:

```python
for i in range(10):
    if i == 3:
        break
    print(i)

print("after loop")
```

Run:

```
0
1
2
after loop
```

The loop is written to run `10` times, `i = 0` through `9` — but the
moment `i` reaches `3`, `break` exits the loop *immediately*, skipping
every remaining value entirely. `4` through `9` are never even checked
against the `if`; the loop simply stops. This is called **breaking out**
of a loop, and it's what makes a sweep genuinely faster than checking
everything: the moment a comparison proves nothing further could matter,
there's no reason to keep looking.

### Discard

The counting loop above is now discarded — it exists only to prove
`break` exits a loop immediately and skips everything remaining, and will
not appear in the project again. `find_close_pairs`'s own `break`, shown
in the real code above, works by the identical rule.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def find_close_pairs(sorted_segments): ...` — first appearance: this
  lesson's own subject.
- `close_pairs_count = 0` — Lesson 33's own accumulator pattern, reused.
- `for i in range(len(sorted_segments)): segment_i = sorted_segments[i]`
  — already-basic reuse: the outer loop, visiting each segment in sorted
  order.
- `end_x_i = segment_i[1][0]` — already-basic indexing: since
  `normalize_segment` guarantees the second point is the rightward one,
  this is exactly the segment's own rightmost `x` extent.
- `for j in range(i + 1, len(sorted_segments)): ...` — already-basic
  reuse of `range`'s own two-argument form (Lesson 33 already
  established `range(n)`; supplying a starting value, `i + 1` instead of
  `0`, is the identical function used the same way, just skipping
  segments already paired with `segment_i` in an earlier outer iteration).
- `start_x_j = segment_j[0][0]` — already-basic indexing: `segment_j`'s
  own leftmost `x`, guaranteed by the same normalization.
- `if start_x_j > end_x_i: break` — first appearance of this unit's own
  actual logic: since `sorted_segments` is sorted left to right, every
  segment from `j` onward starts at or after `segment_j`'s own start.
  The moment even `segment_j` itself starts further right than
  `segment_i` ends, every later segment must too — so the entire rest of
  this inner loop is guaranteed useless, and `break` exits it
  immediately, rather than confirming that guarantee segment by segment.
- `close_pairs_count = close_pairs_count + 1` — already-basic reuse,
  counted only when `break` doesn't fire.
- `print(find_close_pairs(sorted_segments))` — prints `2`: the two
  crossing pairs, `(seg0, seg1)` near the origin and `(seg2, seg3)` far
  to the right — the two pairs genuinely close enough in `x` to be worth
  testing.

### CS Lens

Using a sorted order to justify stopping a search the instant nothing
further could possibly matter — rather than confirming that fact for
every remaining item individually — is exactly what separates a sweep
line from a brute-force scan.

```
Also recognized in: binary search (the reason it can stop looking at
half the remaining data at each step is the identical guarantee — sorted
order lets you rule out a whole region without checking it), database
query optimization (a query planner that knows an index is sorted can
stop scanning the moment it passes the last possible matching row,
instead of scanning the whole table), and event-driven simulation
(processing scheduled events in time order lets a simulator stop
looking for "what happens next" the moment it finds the next event,
without scanning every future event still queued)
```

### SE Lens

The design principle is **letting a proven guarantee justify skipping
work, rather than checking every case individually to be sure**. The
alternative not chosen: keep the inner loop running all the way through
every segment, the way Lesson 36's own nested loop did, checking
`start_x_j > end_x_i` for every `j` without ever using `break`.

That alternative would compute the identical `close_pairs_count` — the
`if` check alone already prevents any wrong pair from being counted.
The real cost it pays: for a much longer list of segments, most of them
far from `segment_i`, that version still visits every single one, even
though sorted order already proves none of them past a certain point
could matter. `break` is what actually converts that proof into skipped
work, not just a skipped count.

### Commands Needed

`python geometry_lesson_39.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
[((0, 0), (3, 3)), ((0, 3), (3, 0)), ((5, 0), (8, 0)), ((6, -1), (6, 5))]
[((0, 0), (3, 3)), ((0, 3), (3, 0)), ((5, 0), (8, 0)), ((6, -1), (6, 5))]
2
```

Verified by actually running the updated file above.

### Connection

Two pairs are worth testing, out of six possible pairings among four
segments. The next unit actually tests them, and confirms the sweep
finds the same real intersections a full exhaustive check would.

---

## Concept Unit: Only Testing What Might Actually Cross

### The Problem

Knowing which pairs are worth testing isn't the same as finding the
actual intersections. Combine this lesson's own sweep with Lesson 25's
`segment_intersection`, and confirm the result agrees exactly with a full
exhaustive check — while doing genuinely less work to get there.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_39.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(find_close_pairs(sorted_segments))`
  line added in Concept Unit 2.
- **Dependencies:** Concept Unit 1's `normalize_segment`, `segments`;
  Concept Unit 2's own break-based skipping pattern.

### The New Code

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


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


def find_intersections_swept(segments):
    normalized = []
    for segment in segments:
        normalized.append(normalize_segment(segment))
    sorted_segments = sorted(normalized)

    checked_count = 0
    intersection_count = 0
    for i in range(len(sorted_segments)):
        segment_i = sorted_segments[i]
        end_x_i = segment_i[1][0]
        for j in range(i + 1, len(sorted_segments)):
            segment_j = sorted_segments[j]
            start_x_j = segment_j[0][0]
            if start_x_j > end_x_i:
                break
            checked_count = checked_count + 1
            result = segment_intersection(segment_i[0], segment_i[1], segment_j[0], segment_j[1])
            if result != "no intersection":
                intersection_count = intersection_count + 1

    return (intersection_count, checked_count)


def find_intersections_brute_force(segments):
    checked_count = 0
    intersection_count = 0
    for i in range(len(segments)):
        for j in range(i + 1, len(segments)):
            checked_count = checked_count + 1
            result = segment_intersection(segments[i][0], segments[i][1], segments[j][0], segments[j][1])
            if result != "no intersection":
                intersection_count = intersection_count + 1
    return (intersection_count, checked_count)


print(find_intersections_swept(segments))
print(find_intersections_brute_force(segments))
```

### The Updated Project

```python
def normalize_segment(segment):
    p1 = segment[0]
    p2 = segment[1]
    if p1[0] <= p2[0]:
        return (p1, p2)
    else:
        return (p2, p1)


segments = [((0, 0), (3, 3)), ((0, 3), (3, 0)), ((5, 0), (8, 0)), ((6, -1), (6, 5))]

normalized_segments = []
for segment in segments:
    normalized_segments.append(normalize_segment(segment))

sorted_segments = sorted(normalized_segments)

print(normalized_segments)
print(sorted_segments)


def find_close_pairs(sorted_segments):
    close_pairs_count = 0
    for i in range(len(sorted_segments)):
        segment_i = sorted_segments[i]
        end_x_i = segment_i[1][0]
        for j in range(i + 1, len(sorted_segments)):
            segment_j = sorted_segments[j]
            start_x_j = segment_j[0][0]
            if start_x_j > end_x_i:
                break
            close_pairs_count = close_pairs_count + 1
    return close_pairs_count


print(find_close_pairs(sorted_segments))


def add_vector_to_point(point, vector):                                  # ← new
    return (point[0] + vector[0], point[1] + vector[1])                # ← new


def scale_vector(vector, factor):                                        # ← new
    return (vector[0] * factor, vector[1] * factor)                     # ← new


def point_on_line(line_point, line_direction, t):                        # ← new
    return add_vector_to_point(line_point, scale_vector(line_direction, t))  # ← new


def subtract_points(a, b):                                               # ← new
    return (a[0] - b[0], a[1] - b[1])                                   # ← new


def cross_product(a, b):                                                 # ← new
    return a[0] * b[1] - a[1] * b[0]                                    # ← new


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


def find_intersections_swept(segments):                                  # ← new
    normalized = []                                                      # ← new
    for segment in segments:                                            # ← new
        normalized.append(normalize_segment(segment))                  # ← new
    sorted_segments = sorted(normalized)                                # ← new
                                                                           # ← new
    checked_count = 0                                                   # ← new
    intersection_count = 0                                              # ← new
    for i in range(len(sorted_segments)):                               # ← new
        segment_i = sorted_segments[i]                                  # ← new
        end_x_i = segment_i[1][0]                                       # ← new
        for j in range(i + 1, len(sorted_segments)):                   # ← new
            segment_j = sorted_segments[j]                              # ← new
            start_x_j = segment_j[0][0]                                 # ← new
            if start_x_j > end_x_i:                                    # ← new
                break                                                    # ← new
            checked_count = checked_count + 1                          # ← new
            result = segment_intersection(segment_i[0], segment_i[1], segment_j[0], segment_j[1])  # ← new
            if result != "no intersection":                            # ← new
                intersection_count = intersection_count + 1            # ← new
                                                                           # ← new
    return (intersection_count, checked_count)                          # ← new


def find_intersections_brute_force(segments):                            # ← new
    checked_count = 0                                                   # ← new
    intersection_count = 0                                              # ← new
    for i in range(len(segments)):                                     # ← new
        for j in range(i + 1, len(segments)):                          # ← new
            checked_count = checked_count + 1                          # ← new
            result = segment_intersection(segments[i][0], segments[i][1], segments[j][0], segments[j][1])  # ← new
            if result != "no intersection":                            # ← new
                intersection_count = intersection_count + 1            # ← new
    return (intersection_count, checked_count)                          # ← new


print(find_intersections_swept(segments))                                # ← new
print(find_intersections_brute_force(segments))                          # ← new
```

The file now finds every real intersection two different ways, and
reports how many `segment_intersection` calls each one actually needed.

*A note on method:* `add_vector_to_point` through `segment_intersection`
are Lesson 2, 3, 8, 21, and 25's own functions, retyped unchanged.
`find_intersections_brute_force` uses only already-covered constructs,
mirroring Lesson 36's own nested-loop shape exactly. No new Python
construct is introduced in this unit.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def add_vector_to_point(...)` through `def
  segment_intersection(...)` — Lesson 2, 3, 8, 21, and 25's own
  functions, retyped unchanged. No re-explanation owed, per the
  Repetition Rule.
- `def find_intersections_swept(segments): ...` — first appearance:
  combining Concept Unit 1 and 2's own sweep with a real intersection
  test.
- `normalized`, the `for` loop, `sorted_segments` — already-basic reuse
  of Concept Unit 1's own setup, now folded inside this function.
- `checked_count = 0`, `intersection_count = 0` — two accumulators
  running side by side: one counting real `segment_intersection` calls
  made, the other counting how many of those actually found a crossing.
- The nested loop through `if start_x_j > end_x_i: break` — already-basic
  reuse, identical to Concept Unit 2's own `find_close_pairs`.
- `checked_count = checked_count + 1`, `result =
  segment_intersection(...)`, `if result != "no intersection":
  intersection_count = intersection_count + 1` — first appearance of
  actually calling `segment_intersection`, only on pairs that survived
  the sweep's own `break`-based filter.
- `return (intersection_count, checked_count)` — already-basic tuple
  construction, returning both numbers together.
- `def find_intersections_brute_force(segments): ...` — first
  appearance: the identical intersection-finding logic, but checking
  *every* pair, the way Lesson 36's own `count_boundary_intersections`
  did, with no sorting and no `break`.
- `print(find_intersections_swept(segments))` — prints `(2, 2)`: `2`
  real intersections found, using only `2` calls to
  `segment_intersection`.
- `print(find_intersections_brute_force(segments))` — prints `(2, 6)`:
  the identical `2` real intersections, but only found after `6` calls —
  every one of the `4`-choose-`2` possible pairings.

**Why both numbers matter.** The first numbers, `2` and `2`, matching
exactly, is the correctness proof: the sweep finds every real
intersection a full exhaustive check would, missing nothing. The second
numbers, `2` versus `6`, is the efficiency proof: the sweep reached that
identical, correct answer using a third of the work, because sorted
order and `break` let it stop looking the moment nothing further could
matter.

### CS Lens

Confirming that a faster algorithm produces the *identical* result as an
already-trusted slower one, on the same input, is the standard way a
new, more efficient approach earns real trust.

```
Also recognized in: algorithm optimization workflows generally
(replacing a proven-correct brute-force implementation with a faster one
almost always starts by cross-checking both on the same test cases,
exactly this unit's own comparison), CAD kernel development (a faster
geometric intersection routine is validated against a slower,
exhaustively-correct reference implementation before shipping, for the
same reason), and compiler optimization passes (an optimized version of
generated code is checked against the unoptimized version's own output
to confirm the optimization didn't change the actual result, only how
fast it's reached)
```

### SE Lens

The design principle is **keeping the slower, obviously-correct version
around as a reference, rather than trusting the faster one on its
algorithm alone**. The alternative not chosen: implement
`find_intersections_swept` and ship it without ever building
`find_intersections_brute_force` to check against.

That alternative would have saved writing one extra function. The real
value of keeping both: `find_intersections_brute_force` is simple enough
to trust by inspection — it's Lesson 36's own already-proven approach —
which makes it a reliable check on `find_intersections_swept`'s own,
more intricate logic. If the two ever disagreed, the mismatch would be
immediate proof something in the sweep's own sorting or break condition
was wrong, long before that bug reached anything relying on the faster
version alone.

### Commands Needed

`python geometry_lesson_39.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
[((0, 0), (3, 3)), ((0, 3), (3, 0)), ((5, 0), (8, 0)), ((6, -1), (6, 5))]
[((0, 0), (3, 3)), ((0, 3), (3, 0)), ((5, 0), (8, 0)), ((6, -1), (6, 5))]
2
(2, 2)
(2, 6)
```

Verified by actually running the updated file above.

### Connection

The sweep and the brute-force check agree on every real intersection,
while the sweep does less work to get there. What Breaks Without This
proves the sweep's own correctness genuinely depends on the sort it's
built on.

---

## Connect the Pieces

Four segments, traced through everything this lesson built, start to
finish:

1. `segments` — two segments crossing near the origin, two more crossing
   far to the right.
2. `normalize_segment` guarantees each one's leftward point comes first;
   `sorted` arranges all four left to right.
3. `find_close_pairs` walks the sorted list, using `break` to stop each
   inner search the instant a segment starts too far right to matter —
   finding exactly `2` pairs worth testing, out of `6` possible ones.
4. `find_intersections_swept` runs `segment_intersection` only on those
   `2` pairs, finding both real crossings — the identical result
   `find_intersections_brute_force` finds by checking all `6`.

## What Breaks Without This

`find_close_pairs`'s own `break` logic is only valid because its input
is sorted. Prove it, using the same four horizontal segments from Concept
Unit 2's own reasoning, deliberately listed out of sorted order:

```python
def normalize_segment(segment):
    p1 = segment[0]
    p2 = segment[1]
    if p1[0] <= p2[0]:
        return (p1, p2)
    else:
        return (p2, p1)


def find_close_pairs(sorted_segments):
    close_pairs_count = 0
    for i in range(len(sorted_segments)):
        segment_i = sorted_segments[i]
        end_x_i = segment_i[1][0]
        for j in range(i + 1, len(sorted_segments)):
            segment_j = sorted_segments[j]
            start_x_j = segment_j[0][0]
            if start_x_j > end_x_i:
                break
            close_pairs_count = close_pairs_count + 1
    return close_pairs_count


unsorted_segments = [((5, 0), (7, 0)), ((0, 0), (2, 0)), ((6, 0), (9, 0)), ((1, 0), (4, 0))]

normalized_unsorted = []
for segment in unsorted_segments:
    normalized_unsorted.append(normalize_segment(segment))

print(find_close_pairs(normalized_unsorted))

correctly_sorted = sorted(normalized_unsorted)
print(find_close_pairs(correctly_sorted))
```

```
4
2
```

Verified by actually running this. The true answer, confirmed by sorting
first, is `2` genuinely close pairs. Fed the *same four segments*,
merely listed in a different order, and never sorted, `find_close_pairs`
silently returns `4` instead — not a crash, a confidently wrong number.
`break`'s own logic depends entirely on the guarantee that everything
after the current position in the list starts at or beyond it — a
guarantee only sorting provides. Without it, `break` can fire too early,
skipping a pair that was genuinely close (because a later segment in the
unsorted list happened to start far to the right, triggering the break
before an even-later, genuinely close segment was ever reached), while
also counting pairs that were never actually close at all (because a
segment encountered later in the unsorted list can have a *smaller* `x`
than one already processed, a relationship the `break` condition was
never designed to detect). This is why Concept Unit 1 sorted the
segments *before* anything in this lesson's own sweep logic runs — the
whole approach depends on it, not just benefits from it.

## Exercises

1. Using `find_intersections_swept`, build a set of five segments where
   only two are close enough to intersect, and confirm `checked_count`
   comes out much smaller than the `10` pairings a brute-force check of
   five segments would need.
2. Using `break`, rewrite a version of `find_close_pairs` that also
   breaks out of the *outer* loop early once `i` reaches a segment whose
   own start is already past every remaining segment's start (a case
   that can't actually happen here since the segments are already
   sorted, but reason through why it's a legitimate additional
   optimization in principle).
3. Predict, then verify: does `find_intersections_swept` give the
   correct result if two segments in the input are exact duplicates of
   each other? Explain what `segment_intersection` (Lesson 25) already
   established about parallel, overlapping input, and whether that
   still applies here.

## Definition of Done

- [ ] `geometry_lesson_39.py` exists and runs with no errors via `python
      geometry_lesson_39.py`.
- [ ] Running it prints the full 5-line sequence shown in Concept Unit
      3's Run It, ending in `(2, 2)`, then `(2, 6)` — matching this
      lesson's verified output exactly.
- [ ] You can explain, without looking at the file, why `break` is only
      valid to use here because the segments were sorted first.
- [ ] You can explain the difference between `checked_count` and
      `intersection_count` in `find_intersections_swept`'s own return
      value, and why comparing both against the brute-force version
      proves both correctness and efficiency.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Find segment intersections via a sweep line, using sorted order and break to skip impossible pairs"`,
      not `git commit -m "add find_intersections_swept"`.

Next: Lesson 40 — Voronoi Diagrams, which partitions a plane into regions
of nearest influence around a set of points, building on this lesson's
own sweep-line strategy and Lesson 28's `distance_to_line` reasoning.
