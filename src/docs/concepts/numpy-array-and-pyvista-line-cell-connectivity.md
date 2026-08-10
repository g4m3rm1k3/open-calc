# Concept: Building a `numpy` Array, and PyVista's Line-Cell Connectivity Format

**What you'll understand by the end:** how to build a real `numpy`
array of 3D points from ordinary Python data (`np.array(...,
dtype=float)`), how `np.hstack` concatenates several small arrays into
one flat array, and PyVista/VTK's own real "line cell" convention for
describing which points connect to which — a flat array shaped
`[point_count, index, index, ...]` per line segment, not a nested
list of pairs.

**Prerequisites:**
`pyside6-pyvista-qtinteractor-3d-embedding.md`.

## Setup

Python 3 with `pip install numpy pyvista`.

## The Problem

A 3D scene's real geometry has to be handed to a rendering library in
whatever concrete format it expects — plain Python lists of tuples
aren't it. `numpy` is the real, standard way numeric data gets passed
into libraries like PyVista/VTK, but VTK's own **line cell** format for
"which points form which line segments" is a real, specific, easy-to-
get-wrong convention: it isn't a list of `(start, end)` pairs, it's one
single, flat array mixing connectivity counts in with point indices.

## The Isolated Example

Building the points array first — three disconnected line segments,
each described as a `(start, end)` pair of 3D coordinates:

```python
import numpy as np
import pyvista as pv

segments = [
    ((0.0, 0.0, 0.0), (1.0, 0.0, 0.0)),
    ((2.0, 0.0, 0.0), (2.0, 1.0, 0.0)),
    ((5.0, 5.0, 0.0), (6.0, 6.0, 0.0)),
]

points = np.array(
    [coord for segment in segments for coord in segment],
    dtype=float,
)
print("points shape:", points.shape)
print("points:\n", points)
```

**Real output, run this session:**
```
points shape: (6, 3)
points:
 [[0. 0. 0.]
 [1. 0. 0.]
 [2. 0. 0.]
 [2. 1. 0.]
 [5. 5. 0.]
 [6. 6. 0.]]
```

**What this proves:** the nested comprehension (`for segment ... for
coord in segment`) genuinely **flattened** three `(start, end)` pairs
into one real, plain sequence of six individual 3D points — `np.array`
then turned that into a real 6×3 numeric array (`shape: (6, 3)`,
confirming 6 points, 3 coordinates each), with `dtype=float` making
every value a real float regardless of whether the original Python
tuples mixed ints and floats.

Now the connectivity — describing which points form each real line
segment:

```python
lines = np.hstack([[2, 2 * i, 2 * i + 1] for i in range(len(segments))])
print("lines (flat connectivity array):", lines)

mesh = pv.PolyData(points, lines=lines)
print("mesh.n_points:", mesh.n_points)
print("mesh.n_cells:", mesh.n_cells)
```

**Real output, run this session:**
```
lines (flat connectivity array): [2 0 1 2 2 3 2 4 5]
mesh.n_points: 6
mesh.n_cells: 3
```

**What this proves:** `lines` is genuinely one single, flat array —
`[2, 0, 1, 2, 2, 3, 2, 4, 5]` — not three separate pairs. `pv.PolyData`
correctly parsed it into exactly **3** real line cells (`n_cells: 3`)
spanning all **6** real points (`n_points: 6`), confirming VTK read the
flat array using its own real, specific convention rather than
guessing at pairs.

## Mechanical Walkthrough

- `np.array(list_of_tuples, dtype=float)` converts an ordinary,
  real Python sequence into a numpy array — `dtype=float` is an
  explicit, real instruction guaranteeing every element is a floating-
  point number, regardless of what the source Python values were.
- A flattening comprehension (`for segment in segments for coord in
  segment`) is a real, ordinary way to turn a sequence of *pairs* into
  a flat sequence of the *individual items* those pairs contain —
  nothing numpy-specific about this step; it's plain Python.
- VTK's own real line-cell format packs each cell as `[point_count,
  index_0, index_1, ..., index_n]` — the **first** number in each
  group is not a coordinate or an index at all, it's a real count
  telling VTK how many point-indices follow for *this* cell, before
  the next cell's own count begins. For a simple two-point line
  segment, that's always `[2, start_index, end_index]`.
- `np.hstack([...])` concatenates several small arrays (here, one
  `[2, start_index, end_index]` triple per real segment) into one
  single, flat array — the real, correct shape `pv.PolyData(...,
  lines=...)` expects, with every segment's own connectivity group
  laid end to end.
- `2 * i` and `2 * i + 1` compute segment `i`'s own start/end indices
  directly from its position in the flat `points` array — since each
  segment contributed exactly two points, segment `0`'s points live at
  indices `0`/`1`, segment `1`'s at `2`/`3`, and so on.

## CS Lens

This is a real instance of a **flat, tagged-length encoding** — rather
than a nested data structure (a list of variable-length lists, one per
cell), VTK's own format inlines each group's real length directly
*into* the flat stream immediately before that group's own data. A
consumer reading the array has to track "how many more values belong
to the current group" as it scans, rather than the structure itself
expressing groups via nesting.

Also recognized in: TLV (Type-Length-Value) binary encodings used
throughout real network protocols and file formats; a run-length-
encoded byte stream, where a count precedes the run it describes;
`array.array`/raw buffer APIs generally, which favor flat, tightly-
packed real memory layouts over nested Python objects for real
performance reasons.

## SE Lens

The real, practical reason a library like VTK favors this flat format
over Python-friendlier nested lists: it maps directly onto a single,
real, contiguous block of memory that C/C++ rendering code (VTK's own
actual implementation) can read at high speed with no per-element
Python-object overhead — the exact same real motivation behind numpy
arrays generally, applied here specifically to *connectivity* data
rather than just point coordinates. The real, honest cost: this
format's encoding rule (a count, then that many indices, repeated) has
to be built correctly by hand, exactly the kind of easy-to-get-subtly-
wrong bookkeeping a code comment or a dedicated helper function should
document explicitly, since nothing about the flat array's own shape
visually signals what its numbers mean.

## Connection

Builds on `pyside6-pyvista-qtinteractor-3d-embedding.md` (this is the
real geometry data that gets handed to that embedded viewport). A
real, applied instance in this project's own history: a G-code
toolpath's real motion segments, each converted into its own
independent two-point line cell (deliberately **not** one long,
connected polyline, since consecutive same-kind segments aren't
necessarily contiguous once other motion kinds are interleaved between
them) — built with exactly this `np.array`/`np.hstack`/`lines=`
pipeline. A further, real instance of this file's own first Try It
Yourself exercise (a cell with more than 2 points, a leading count
other than `2`): once real circular-arc interpolation was added, each
arc became its own **variable-length** line cell — a whole real
interpolated polyline in a single cell, its own leading count equal to
however many points that specific arc was tessellated into — sitting
alongside ordinary, still-fixed 2-point cells for every straight move,
both built by the identical general connectivity-building logic with
no special-casing between the two.

## Try It Yourself

1. Build a `points`/`lines` pair for a single **triangle** instead
   (3 points, one closed 3-point line cell: `[3, 0, 1, 2]`, note the
   leading `3` instead of `2`) and confirm `pv.PolyData(points,
   lines=lines).n_cells` reports `1`, not `3` — real, direct proof the
   leading count is what tells VTK how many points belong to each
   cell, not a fixed, hardcoded `2`.
2. Deliberately build a `lines` array with an incorrect count (say,
   `[3, 0, 1]` for a real 2-point segment) and observe what real,
   concrete error or misbehavior results — direct, felt evidence of
   why the leading count has to exactly match the real number of
   indices that follow it.
3. Try building `points` directly from a plain, un-flattened list of
   `(start, end)` pairs (skip the flattening comprehension) and observe
   the real, resulting `points.shape` — reasoning about why that shape
   is wrong for `pv.PolyData`, which expects one row per individual
   point, not one row per segment.
