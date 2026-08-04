# Concept: Solid-of-Revolution Mesh Generation, and the On-Axis Pole-Vertex Fix

**What you'll understand by the end:** the classic computer-graphics
technique for building a real 3D mesh by sweeping a 2D `(radius, z)`
profile 360° around an axis — turning each profile point into a ring
of vertices, connected ring-to-ring into quad faces — and a real,
easy-to-miss correctness detail: a profile point sitting exactly *on*
the axis needs one shared vertex, not a full ring of coincident
duplicates, or the resulting mesh gets real, literal zero-area
triangles.

**Prerequisites:**
`numpy-array-and-pyvista-line-cell-connectivity.md`.

## Setup

Python 3 with `pip install numpy pyvista`.

## The Problem

Many real, physically round objects — a wine glass, a bottle, a
machined shaft, a drill bit's conical tip — share a real geometric
property: their entire 3D shape is fully described by a single 2D
profile (their outline, seen from the side) plus the fact that the
profile is spun a full 360° around a central axis. Building the real
3D mesh by hand, vertex by vertex, would be enormously tedious; the
real, standard technique instead sweeps the 2D profile computationally,
generating every vertex and face from it directly.

## The Isolated Example

The core sweep — turning each 2D profile point into a ring of real 3D
vertices:

```python
import math

import numpy as np


def revolve_naive(points, segments=8):
    """Every profile point gets a full ring, even an on-axis (radius=0) one."""
    angles = np.linspace(0, 2 * math.pi, segments, endpoint=False)
    vertices = []
    for radius, z in points:
        for angle in angles:
            vertices.append((radius * math.cos(angle), radius * math.sin(angle), z))
    return np.array(vertices)


profile = [(0.0, 0.0), (5.0, 0.0), (5.0, 10.0)]  # a cone-tipped cylinder
naive_vertices = revolve_naive(profile, segments=8)

print("NAIVE (every point gets a full ring) -- total vertices:", len(naive_vertices))
print("tip ring vertices (should all be the SAME point, (0,0,0)):")
for v in naive_vertices[:4]:
    print("   ", v)
```

**Real output, run this session:**
```
NAIVE (every point gets a full ring) -- total vertices: 24
tip ring vertices (should all be the SAME point, (0,0,0)):
    [0. 0. 0.]
    [0. 0. 0.]
    [0. 0. 0.]
    [-0.  0.  0.]
```

**What this proves:** for the profile's first point — `(radius=0,
z=0)`, sitting exactly on the axis — every one of its 8 real "ring"
vertices came out at the identical coordinate, `(0, 0, 0)` (floating-
point noise aside). Treating an on-axis point as a full ring, exactly
like every other profile point, genuinely produces **8 coincident
duplicate vertices** at the tip.

The real, concrete problem this causes — a degenerate, zero-area
triangle:

```python
def triangle_area(a, b, c):
    return 0.5 * np.linalg.norm(np.cross(np.array(b) - np.array(a), np.array(c) - np.array(a)))


naive_tip_a = (0.0, 0.0, 0.0)
naive_tip_b = (0.0, 0.0, 0.0)  # numerically identical to tip_a
real_ring_point = (5.0, 0.0, 0.0)
print("naive triangle area (tip_a, tip_b, ring point):", triangle_area(naive_tip_a, naive_tip_b, real_ring_point))
```

**Real output, run this session:**
```
naive triangle area (tip_a, tip_b, ring point): 0.0
```

**What this proves:** a triangle built from two of the naive tip
ring's own vertices plus one real point from the next ring out has
genuinely **zero area** — a real, literal sliver, since two of its
three corners are the exact same point. A mesh containing triangles
like this has real, invalid geometry at its tip.

The fix — an on-axis point becomes a single, shared **pole** vertex:

```python
def revolve_with_pole(points, segments=8):
    """An on-axis (radius=0) point becomes ONE shared pole vertex."""
    angles = np.linspace(0, 2 * math.pi, segments, endpoint=False)
    vertices = []
    for radius, z in points:
        if radius <= 1e-9:
            vertices.append((0.0, 0.0, z))
        else:
            for angle in angles:
                vertices.append((radius * math.cos(angle), radius * math.sin(angle), z))
    return np.array(vertices)


pole_vertices = revolve_with_pole(profile, segments=8)
print("POLE (on-axis point becomes ONE shared vertex) -- total vertices:", len(pole_vertices))

pole = (0.0, 0.0, 0.0)
ring_a = (5.0, 0.0, 0.0)
ring_b = (5.0 * 0.7071, 5.0 * 0.7071, 0.0)
print("pole-based triangle area (pole, ring_a, ring_b):", triangle_area(pole, ring_a, ring_b))
```

**Real output, run this session:**
```
POLE (on-axis point becomes ONE shared vertex) -- total vertices: 17
pole-based triangle area (pole, ring_a, ring_b): 8.83875
```

**What this proves:** the pole-based version genuinely uses **fewer**
real vertices (`17` instead of `24` — one shared pole instead of 8
coincident duplicates), and a triangle fanning out from that single
pole vertex to two genuinely *different* points on the next real ring
has real, non-degenerate area (`8.83875`, not `0.0`).

## Mechanical Walkthrough

- Each 2D profile point `(radius, z)` becomes a real **ring** of 3D
  vertices, one per angular step, computed as `(radius * cos(angle),
  radius * sin(angle), z)` — the same real polar-to-Cartesian
  conversion for every angle in a full, even sweep around the Z axis.
- Consecutive rings are connected into **quad faces** (four corners:
  two vertices from one ring, two from the next, at matching angular
  positions) — this is the actual "skin" of the resulting mesh between
  two profile points.
- A profile point with `radius` at (or extremely near) `0` sits
  **exactly on the sweep axis** — every one of its "ring" vertices
  would land at the identical real coordinate regardless of angle,
  since revolving a point that's already on the axis doesn't move it
  at all.
- Recognizing that degenerate case and emitting **one shared vertex**
  instead of a full ring is what keeps the resulting mesh's own
  geometry valid — the faces touching that pole become triangles
  (pole, ring-vertex, next-ring-vertex) instead of quads, fanning
  around it correctly with real, non-zero area.

## CS Lens

This is the classic computer-graphics **surface of revolution**
algorithm — one of the most common real ways to generate a 3D mesh
procedurally from a compact 2D description, rather than authoring
every vertex by hand. The pole-vertex handling is a real, concrete
instance of correctly handling a **degenerate case** in a geometric
algorithm: a general rule ("every profile point becomes a ring")
applied blindly at a genuinely special input (a point already on the
axis of revolution) produces coincident, structurally invalid
geometry — recognizing and special-casing that specific input is what
keeps the general algorithm correct everywhere, including at its own
edge case.

Also recognized in: any real 3D modeling tool's own "lathe" or "revolve"
tool (Blender, SolidWorks, Fusion 360 all expose this exact operation
directly); a sphere generated as a revolved semicircle, which has
**two** real poles (top and bottom) needing the identical fix at both
ends; any parametric surface generator handling a coordinate
singularity (the north/south poles of a UV-mapped sphere are the
identical real problem, one dimension up).

## SE Lens

The real, practical risk of skipping this fix: a mesh with degenerate,
zero-area triangles at its own tip may still *render* something that
looks approximately correct at a glance, while being genuinely invalid
geometry underneath — real downstream operations (surface normal
calculation, boolean mesh operations, 3D printing slicers) can fail or
produce visibly wrong results specifically because of those hidden,
zero-area slivers, often far from where the actual authoring mistake
was made. Catching this at generation time, with an explicit, real
check for the degenerate case, is far cheaper than debugging its
downstream symptoms later.

## Connection

Builds on `numpy-array-and-pyvista-line-cell-connectivity.md` for the
underlying `numpy` array + `pyvista` mesh-construction pattern, applied
here to real 2D **polygon faces** (quads and triangles) instead of
line cells. A real, applied instance in this project's own history: a
real toolholder/tool-tip mesh generator sweeping a 2D `(radius, z)`
profile — matching how a real toolholder catalog (Mastercam's own
Tool/Assembly Designer) actually represents a holder, a stack of
frustum segments — with exactly this pole-vertex handling protecting
against a real, concrete tip-cap correctness bug, and the identical
primitive reused for both a tool's own drill/endmill tip shape and a
holder's full frustum stack.

## Try It Yourself

1. Build a profile with **two** on-axis points (both ends at
   `radius=0`, like a sphere's north and south poles) and confirm
   `revolve_with_pole` correctly produces exactly two pole vertices,
   one at each end, rather than treating them as one shared point.
2. Compute the naive version's own **total** vertex count for a
   profile with 5 points (one of them on-axis) at `segments=48` (this
   project's own real default) — comparing it directly against the
   pole-based version's count, to see how much the naive duplication
   actually costs as `segments` grows.
3. Build the real quad faces connecting two **non-pole** rings (using
   this file's own `ring_vertex`-style indexing) and confirm each
   quad's own four corners form a real, non-degenerate, roughly
   rectangular patch of the resulting mesh's surface.
