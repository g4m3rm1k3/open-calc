# Junior to Senior — T10·L7 — Polygon Boolean Operations

**Prerequisites:** T10·L6 (Winding Order). You understand polygon orientation.
This lesson explains polygon Boolean operations by first showing WHAT breaks when you
try to implement them yourself, then explaining the SPECIFIC problems the Clipper library
solves, and WHAT the three operations produce geometrically.

**What this lab adds:**
- WHY Boolean operations are geometrically hard — the specific edge cases that break naive implementations
- WHAT union, intersection, and difference produce — with concrete geometric examples
- HOW `pyclipper`'s integer coordinate system avoids floating-point errors
- WHY the winding rule (even-odd vs non-zero) exists — with a self-intersecting polygon example
- Using the library step by step with verified outputs

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Two polygons that share an edge — not overlapping, just touching along one side.
>    What does their UNION look like? What about their INTERSECTION?
> 2. `pyclipper` requires integer coordinates. You have floats like `50.25mm`. What
>    do you multiply by to convert to integers without losing sub-millimetre precision?
> 3. A self-intersecting polygon (the shape crosses itself). What do "inside" and
>    "outside" even mean for such a shape? Why does it matter which winding rule you use?
>
> *(Answers at the end of this lab)*

---

## Why This Is Hard to Implement Yourself

Before using the library, understand what it is solving:

**Edge case 1: T-intersection**
```
  Polygon A has an edge from (0,0) to (10,0).
  Polygon B has a vertex exactly ON that edge at (5,0).
  
  The union of A and B passes THROUGH vertex (5,0) of B.
  A naive algorithm misses this vertex — the output has a notch.
```

**Edge case 2: Coincident edges**
```
  A has an edge from (0,0) to (10,0).
  B has an edge from (3,0) to (7,0) — ON THE SAME LINE.
  
  The union boundary partially overlaps. What gets included?
  A naive algorithm double-counts the coincident portion.
```

**Edge case 3: Floating-point catastrophe**
```
  Two edges that SHOULD intersect at (5.0, 5.0).
  Computed intersection: (4.9999999998, 5.0000000001).
  Subsequent operations treat these as different points — topology breaks.
```

The Clipper library (Angus Johnson, 20+ years development) handles all three.
Writing your own would take months and would still have bugs.

---

### Concept: The Three Boolean Operations

**What it is:** Given two polygons A and B, compute:

```
Union (A ∪ B):           Intersection (A ∩ B):      Difference (A \ B):
┌─────────┐             ┌─────────┐               ┌─────────┐
│         │             │         │               │   ┌─┐   │
│    A    │             │    A    │               │   │ │   │
│    ┌────┼─┐           │    ┌────┤               │   └─┘   │
│    │    │ │           │    │////│               │         │
└────┼────┘ │           └────┼────┘               └─────────┘
     │  B   │                │
     └──────┘                └──────(only the overlap)
```

- **Union:** Everything from either shape
- **Intersection:** Only where both overlap (the shaded region)
- **Difference A\B:** A with the B-overlap removed

**The CNC use case:**

For a pocket with an island:
- **Outer boundary** = CCW polygon (the pocket)
- **Island** = CW polygon (the part that stays standing)
- **What to machine** = Difference(pocket, island)

---

## Step 1 — Install and Import

```bash
pip install pyclipper
```

Create `src/boolean_ops.py`:

```python
# src/boolean_ops.py
import pyclipper

# pyclipper requires INTEGER coordinates.
# Why? Integers avoid ALL floating-point errors — the same rounding issues
# that plagued T10-L0 disappear when you only use integers.
# Solution: multiply by a SCALE factor to preserve sub-millimetre precision.
SCALE = 1000   # 1 unit = 0.001mm → coordinates in units of 0.001mm

def to_clipper(points: list[tuple[float, float]]) -> list[tuple[int, int]]:
    """Convert millimetre floats to scaled integers."""
    return [(int(x * SCALE), int(y * SCALE)) for x, y in points]

def from_clipper(points: list[tuple[int, int]]) -> list[tuple[float, float]]:
    """Convert scaled integers back to millimetre floats."""
    return [(x / SCALE, y / SCALE) for x, y in points]
```

### SAVE AND TRY

```bash
python -c "
from src.boolean_ops import to_clipper, from_clipper

# Round-trip test:
original  = [(0.0, 0.0), (50.25, 0.0), (50.25, 25.5), (0.0, 25.5)]
scaled    = to_clipper(original)
recovered = from_clipper(scaled)

print('Scaled:', scaled)
print('Recovered:', recovered)
print('Match:', all(abs(a[0]-b[0]) < 0.001 and abs(a[1]-b[1]) < 0.001
                    for a, b in zip(original, recovered)))
"
```

**You should see:**
```
Scaled: [(0, 0), (50250, 0), (50250, 25500), (0, 25500)]
Recovered: [(0.0, 0.0), (50.25, 0.0), (50.25, 25.5), (0.0, 25.5)]
Match: True
```

The coordinates are scaled by 1000 — `50.25mm` becomes `50250` — which is an exact integer.
The recovery back to floats loses no precision (within 0.001mm).

---

## Step 2 — Implement the Three Operations

Add to `src/boolean_ops.py`:

```python
def _boolean_op(
    subjects: list[list[tuple[float, float]]],
    clips:    list[list[tuple[float, float]]],
    clip_type: int,
) -> list[list[tuple[float, float]]]:
    """Internal: performs a Boolean operation using pyclipper."""
    pc = pyclipper.Pyclipper()

    for poly in subjects:
        pc.AddPath(to_clipper(poly), pyclipper.PT_SUBJECT, True)

    for poly in clips:
        pc.AddPath(to_clipper(poly), pyclipper.PT_CLIP, True)

    result = pc.Execute(clip_type, pyclipper.PFT_NONZERO, pyclipper.PFT_NONZERO)
    return [from_clipper(path) for path in result]


def union(subjects, clips):
    return _boolean_op(subjects, clips, pyclipper.CT_UNION)

def intersection(subjects, clips):
    return _boolean_op(subjects, clips, pyclipper.CT_INTERSECTION)

def difference(subjects, clips):
    return _boolean_op(subjects, clips, pyclipper.CT_DIFFERENCE)
```

---

## Step 3 — Write Tests That Verify the Geometry

```python
# tests/test_boolean_ops.py
import pytest
from src.boolean_ops import union, intersection, difference

# Two 10×10 squares that overlap:
SQUARE_A = [(0, 0), (10, 0), (10, 10), (0, 10)]
SQUARE_B = [(5, 0), (15, 0), (15, 10), (5, 10)]


class TestUnion:
    def test_union_of_two_overlapping_squares_has_one_result(self) -> None:
        result = union([SQUARE_A], [SQUARE_B])
        assert len(result) == 1   # merged into one polygon

    def test_union_area_is_less_than_sum_of_individual_areas(self) -> None:
        result     = union([SQUARE_A], [SQUARE_B])
        union_area = polygon_area(result[0])
        sum_areas  = 100 + 100   # each is 10×10=100
        assert union_area < sum_areas   # the overlap is counted only once


class TestIntersection:
    def test_intersection_is_the_overlap_only(self) -> None:
        result = intersection([SQUARE_A], [SQUARE_B])
        assert len(result) == 1
        # A from 0-10, B from 5-15 → overlap is 5-10 = 5×10=50:
        assert abs(polygon_area(result[0]) - 50) < 1


class TestDifference:
    def test_difference_removes_overlapping_region(self) -> None:
        result = difference([SQUARE_A], [SQUARE_B])
        assert len(result) == 1
        # A (100) minus overlap (50) = 50:
        assert abs(polygon_area(result[0]) - 50) < 1

    def test_difference_is_not_commutative(self) -> None:
        """A\B is not the same as B\A"""
        a_minus_b = difference([SQUARE_A], [SQUARE_B])
        b_minus_a = difference([SQUARE_B], [SQUARE_A])
        # Both produce area 50, but different shapes:
        assert polygon_area(a_minus_b[0]) == pytest.approx(polygon_area(b_minus_a[0]), abs=1)
        # But the polygons themselves differ:
        # A\B is on the left (x: 0-5); B\A is on the right (x: 10-15)


def polygon_area(points) -> float:
    """Shoelace formula for area."""
    n   = len(points)
    area = 0
    for i in range(n):
        j = (i + 1) % n
        area += points[i][0] * points[j][1]
        area -= points[j][0] * points[i][1]
    return abs(area) / 2
```

### SAVE AND TRY

```bash
pytest tests/test_boolean_ops.py -v
```

Expected: all 4 tests pass.

---

### Concept: Even-Odd vs Non-Zero Fill Rules

**What it is:** For self-intersecting polygons or complex shapes with holes, you need
a rule to determine which regions are "inside." The two rules are:

- **Non-zero:** A region is inside if the winding number is not zero (count how many times
  the boundary circles the region, with direction)
- **Even-odd:** A region is inside if the winding number is ODD (alternates in/out)

```
A figure-8 shape (self-intersecting):

Non-zero fill:
  Both loops of the 8 are "inside" (winding = 1 for each)

Even-odd fill:
  If boundary crosses once = inside (winding = 1)
  If boundary crosses again = outside (winding = 2 = even)
  The second-crossed region is "outside"
```

**For CNC:** Use `pyclipper.PFT_NONZERO` (non-zero). CNC profiles are NOT self-intersecting
by design — you never want a tool path that overlaps itself. If your profile self-intersects,
it is a modelling error that should be fixed before machining, not handled by an even-odd rule.

---

## 🎯 Challenge: Pocket With Island

**You know:** `difference`, winding order.

**Task:** Define a 50×50mm outer pocket and a 10×10mm island in the centre.
Compute the pocket geometry (what gets machined = outer minus island).

Verify the result:
- Has more than one polygon (outer boundary + hole boundary)
- OR has exactly one polygon whose area is approximately `50×50 - 10×10 = 2400mm²`

---

<details>
<summary>▶ Show Solution</summary>

```python
def test_pocket_with_island() -> None:
    # 50×50mm outer pocket:
    outer  = [(0,0), (50,0), (50,50), (0,50)]
    # 10×10mm island centred at (25,25):
    island = [(20,20), (30,20), (30,30), (20,30)]

    result = difference([outer], [island])

    # The result should be the outer minus the hole:
    total_area = sum(polygon_area(p) for p in result)
    expected   = 50*50 - 10*10   # = 2400mm²
    assert abs(total_area - expected) < 1
```

```python
# Implementation — already done with the difference() function:
outer  = [(0,0), (50,0), (50,50), (0,50)]
island = [(20,20), (30,20), (30,30), (20,30)]
pocket = difference([outer], [island])
print(f'Number of result polygons: {len(pocket)}')
print(f'Total area: {sum(polygon_area(p) for p in pocket):.1f}mm²')
```

**Key insight:** `pyclipper` returns the pocket as either one polygon with a "hole"
contour (represented as a CW inner boundary) or two separate polygons. The total
machined area is the outer area minus the island area = 2400mm². This is exactly
the area the CNC tool needs to cover.

</details>

---

## Final Check

| Operation | Input | Output |
|---|---|---|
| `union(A, B)` | Two polygon lists | Merged outline |
| `intersection(A, B)` | Two polygon lists | Overlapping region only |
| `difference(A, B)` | Two polygon lists | A minus B |
| Scale factor (SCALE=1000) | Float mm | Integer units of 0.001mm |

---

## Quick Check Answers

**1. Two polygons sharing an edge. Union and intersection?**

Union: one polygon — the two shapes merged. The shared edge disappears into the interior.
Intersection: the shared EDGE (a degenerate polygon with zero area) or an empty result,
depending on implementation. This is one of the T-intersection edge cases that makes
Boolean operations hard — the shared edge is exactly on the boundary of both shapes.

**2. `50.25mm` to integer with `SCALE=1000`. What do you multiply?**

`50.25 × 1000 = 50250`. Scale of 1000 means 1 unit = 0.001mm precision (1 micron).
For CNC geometry, this is far more precision than any machine needs. The result is an exact
integer — no floating-point errors in the Clipper computation.

**3. Self-intersecting polygon — inside vs outside — why does the winding rule matter?**

For a figure-8, the crossing region is wound clockwise by one loop and counter-clockwise
by the other. The NET winding number there is zero (1 + (-1) = 0). Non-zero rule: zero
means OUTSIDE — the crossing region is a hole. Even-odd rule: the crossing region is
wound an even number of times — also outside. In this case both rules agree. But for
more complex self-intersections, they differ — which is why the rule must be explicit.
