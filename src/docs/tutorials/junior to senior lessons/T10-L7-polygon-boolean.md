# Junior to Senior — T10·L7 — Polygon Boolean Operations

**Prerequisites:** T10·L6 (Winding Order). You understand polygon orientation.
This lesson covers Boolean operations on polygons — union, intersection, and
difference — and introduces `pyclipper` as the production library.

**What this lab adds:**
- Union: area covered by either polygon
- Intersection: area covered by both polygons
- Difference: A minus B (used for pockets with islands)
- Why implementing these from scratch is not appropriate
- `pyclipper`: the Python binding to the Clipper library
- The winding rule: even-odd vs non-zero fill

**Time:** 45–60 minutes (more conceptual + library introduction)

---

> **Quick Check — try to answer before reading:**
>
> 1. You have a 50×50mm rectangle. Inside it is a 10×10mm square island.
>    The "difference" operation gives you what shape?
> 2. Two circles of radius 10mm, overlapping. The "union" gives what shape?
> 3. Why is implementing polygon union yourself a bad idea?
>
> *(Answers at the end of this lab)*

---

## Why Not Implement From Scratch

Polygon Boolean operations (clipping) appear simple but have dozens of edge cases:

- Self-intersecting polygons
- Coincident edges
- Holes (rings within polygons)
- Floating-point degenerate cases
- Winding number computation

The algorithms (Sutherland-Hodgman, Greiner-Hormann, Vatti) are well-studied but
complex to implement correctly. Production-quality implementations represent years
of engineering.

**The right approach:** Use `pyclipper` (Python) or `clipper2-js` (TypeScript/JS)
— both wrap the Clipper library by Angus Johnson, which is production-grade and
used in CAM software worldwide.

---

### Concept: The Three Boolean Operations

```
A          B         A ∪ B (Union)    A ∩ B (Intersection)  A \ B (Difference)
┌──────┐   ┌──────┐  ┌────────┐       ┌───┐                  ┌───┐
│      │   │      │  │        │       │///│                  │   │ (empty inside)
│  A   │   │  B   │  │  A+B   │       │///│                  │   │
└──────┘   └──────┘  └────────┘       └───┘                  └───┘
```

---

### Concept: `pyclipper`

**Installing:**

```bash
pip install pyclipper
```

**Usage:**

```python
import pyclipper

# Coordinates in integer units (multiply mm by 1000 for 0.001mm precision):
SCALE = 1000

def to_clipper(points):
    return [(int(x * SCALE), int(y * SCALE)) for x, y in points]

def from_clipper(points):
    return [(x / SCALE, y / SCALE) for x, y in points]

# Two rectangles:
rect_a = to_clipper([(0,0), (50,0), (50,30), (0,30)])
rect_b = to_clipper([(20,10), (60,10), (60,40), (20,40)])

# Boolean difference A \ B:
pc = pyclipper.Pyclipper()
pc.AddPath(rect_a, pyclipper.PT_SUBJECT, True)
pc.AddPath(rect_b, pyclipper.PT_CLIP,    True)

result = pc.Execute(pyclipper.CT_DIFFERENCE, pyclipper.PFT_NONZERO)
output = [from_clipper(path) for path in result]
```

---

## Step 1 — TypeScript with Clipper2

```bash
npm install clipper2-js
```

Create `src/boolean.ts`:

```ts
import { Clipper, Paths64, Path64, Point64, ClipType, FillRule } from 'clipper2-js';

const SCALE = 1000;  // 0.001mm precision

export interface Polygon {
  points: { x: number; y: number }[];
}

function toClipperPath(polygon: Polygon): Path64 {
  const path = new Path64();
  for (const p of polygon.points) {
    path.push(new Point64(Math.round(p.x * SCALE), Math.round(p.y * SCALE)));
  }
  return path;
}

function fromClipperPath(path: Path64): Polygon {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    points.push({ x: p.x / SCALE, y: p.y / SCALE });
  }
  return { points };
}

function booleanOp(
  subjects: Polygon[],
  clips:    Polygon[],
  clipType: ClipType,
): Polygon[] {
  const subjectPaths = new Paths64();
  subjects.forEach(s => subjectPaths.push(toClipperPath(s)));

  const clipPaths = new Paths64();
  clips.forEach(c => clipPaths.push(toClipperPath(c)));

  const result = new Paths64();
  Clipper.BooleanOp(clipType, FillRule.NonZero, subjectPaths, clipPaths, result);

  return Array.from(result).map(p => fromClipperPath(p));
}

export function union(subjects: Polygon[], clips: Polygon[]): Polygon[] {
  return booleanOp(subjects, clips, ClipType.Union);
}

export function intersection(subjects: Polygon[], clips: Polygon[]): Polygon[] {
  return booleanOp(subjects, clips, ClipType.Intersection);
}

export function difference(subjects: Polygon[], clips: Polygon[]): Polygon[] {
  return booleanOp(subjects, clips, ClipType.Difference);
}
```

---

## Step 2 — Write Tests

Create `src/boolean.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { union, intersection, difference } from './boolean';

const square: { points: { x: number; y: number }[] } = {
  points: [{ x:0,y:0 }, { x:10,y:0 }, { x:10,y:10 }, { x:0,y:10 }],
};

const smallSquare = {
  points: [{ x:2,y:2 }, { x:8,y:2 }, { x:8,y:8 }, { x:2,y:8 }],
};

const overlapping = {
  points: [{ x:5,y:0 }, { x:15,y:0 }, { x:15,y:10 }, { x:5,y:10 }],
};

describe('polygon boolean operations', () => {

  it('difference of a square minus a smaller contained square produces a result', () => {
    const result = difference([square], [smallSquare]);
    // Result should be non-empty (a square with a hole):
    expect(result.length).toBeGreaterThan(0);
  });

  it('intersection of two overlapping rectangles is non-empty', () => {
    const result = intersection([square], [overlapping]);
    expect(result.length).toBeGreaterThan(0);
  });

  it('union of two disjoint rectangles has two parts or one merged shape', () => {
    const a = { points: [{ x:0,y:0 }, { x:5,y:0 }, { x:5,y:5 }, { x:0,y:5 }] };
    const b = { points: [{ x:10,y:0 }, { x:15,y:0 }, { x:15,y:5 }, { x:10,y:5 }] };
    const result = union([a], [b]);
    // Two disjoint rectangles → two result polygons:
    expect(result.length).toBe(2);
  });

  it('difference of a rectangle with itself is empty', () => {
    const result = difference([square], [square]);
    expect(result.length).toBe(0);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass (if `clipper2-js` is installed correctly).

---

## 🎯 Challenge: Pocket Geometry

**You know:** Boolean difference, winding order, `pyclipper`/clipper2.

**Task:** Build `pocketGeometry(outer: Polygon, islands: Polygon[]): Polygon[]`
that returns the pocket geometry: the outer boundary minus all islands.

This is the exact operation the CAM system performs before generating pocket toolpaths.

Write 2 tests: one pocket with no islands (returns the outer boundary), one with an island.

---

<details>
<summary>▶ Show Solution</summary>

```ts
export function pocketGeometry(outer: Polygon, islands: Polygon[]): Polygon[] {
  if (islands.length === 0) return [outer];
  return difference([outer], islands);
}
```

**Tests:**
```ts
it('pocket with no islands returns the outer boundary', () => {
  const result = pocketGeometry(square, []);
  expect(result).toHaveLength(1);
});

it('pocket with an island returns outer minus island', () => {
  const result = pocketGeometry(square, [smallSquare]);
  // Should have at least one polygon (outer boundary with hole):
  expect(result.length).toBeGreaterThan(0);
  // The result area should be less than the original square:
  // (Full area verification requires computing polygon areas from clipper output)
});
```

</details>

---

## Final Check

| Operation | Meaning | CNC use |
|---|---|---|
| Union (A ∪ B) | All area from A or B | Merging adjacent surfaces |
| Intersection (A ∩ B) | Only area in both | Finding overlap regions |
| Difference (A \ B) | A minus B | Pocket with islands |

---

## Quick Check Answers

**1. 50×50mm rectangle minus 10×10mm interior square — what shape?**

A 50×50mm rectangle with a 10×10mm hole (rectangular ring). The difference operation
removes the smaller square from the interior of the larger one, producing a polygon
with a hole. In CNC terms, this is a pocket with an island — the tool must cut the
large area but leave the small square standing.

**2. Two overlapping circles, radius 10mm — union gives what?**

A single connected shape — a "vesica piscis" outline (two circular arcs forming a
lens-like boundary) merged into one polygon. The union of two overlapping shapes is
always a single connected polygon (if they overlap) or two separate polygons (if they don't).

**3. Why is implementing polygon union yourself a bad idea?**

Dozens of degenerate edge cases: T-intersections (two edges meeting at a point that
is not a corner), coincident edges (two edges at the same position), self-intersecting
polygons, holes within holes, floating-point precision causing missed intersections.
Production implementations like Clipper have been tested on millions of real-world
polygons over 15+ years. Writing your own will work for 90% of cases and fail
unexpectedly in production.
