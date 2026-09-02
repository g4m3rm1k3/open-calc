# Lesson 15: Multi-Pass Alignment — `MeshAligner`

**What you will build:** a new class, `MeshAligner`, in a new file
`src/vector3d/mesh_aligner.py` — Phase E's last lesson, and the point
where every earlier phase of this rebuild meets at once: `Mesh` and
`Triangle` (Phase A), `NearestSurfaceFinder`/`SpatialGrid` (Phase C),
`SurfaceSampler` (Phase D), and `GradientDescentOptimizer` (Lesson 14)
all get used together, real objective function in hand, to reproduce
`diff3d.py`'s `align3d()` — including its coarse-to-fine multi-pass
structure, stepping through progressively narrower Gaussian-weighted
alignment windows.

**What you need to know first:** Phase A (`Vector3`, `Mesh.center`/
`Mesh.bounds`), Phase C (`find_closest`, `Triangle.closest_point`),
Lesson 12 (`SurfaceSampler`), and Lesson 14 in full
(`GradientDescentOptimizer.minimize`, and this project's own honest
admission there that plain gradient descent is a much simpler method
than `scipy`'s L-BFGS-B).

**Terms used in this lesson:**
- **`math.exp`** — Python's standard-library exponential function,
  computing `e` (Euler's number, ≈2.71828) raised to a given power. It
  exists as the standard, correct way to compute this in Python — the
  same role `math.sqrt` (Lesson 4) already plays for square roots; this
  lesson's own Gaussian weighting is the first place this project needs
  it.
- **Gaussian weighting** — scoring a candidate not by a *plain sum* of
  squared distances, but by a sum of `exp(-sqdist / sqwidth)` terms —
  a curve that stays close to `1` for very small `sqdist` and drops
  toward `0` extremely quickly as `sqdist` grows past `sqwidth`. It
  exists so a candidate alignment can be scored mainly by *how many
  points are already close*, rather than being dominated by a few
  badly-misaligned outlier points the way a plain sum of squares would
  be.
- **closure** — a nested function (defined with `def` inside another
  function or method) that "remembers" variables from the scope it was
  defined in, even after that outer scope's own code has moved on. This
  lesson's own `align()` method defines a fresh `objective` function
  inside its own loop, once per pass, each one remembering that pass's
  own `moving_points`/`stationary_finder`/`sqwidth` without needing them
  passed in as extra arguments every time `GradientDescentOptimizer.minimize`
  calls it.
- **coarse-to-fine alignment** — running several alignment passes in
  sequence, each one narrower/more localized than the last, each
  starting from the *previous* pass's own answer rather than from
  scratch. It exists because a wide, forgiving first pass (this lesson's
  own `width_pct == inf` case — a plain, unweighted sum, sensitive to
  every point equally) can get a rough alignment right even when the
  two meshes start out quite far apart, while later, narrower passes
  refine that rough answer using a more locally-sensitive score, without
  risking getting trapped by a bad guess right from the start the way
  starting narrow immediately might.

**Objects and methods used:**

- **`MeshAligner`**
  - *What it is:* a class performing multi-pass alignment between two
    meshes — finding the 3D offset that best lines up a moving mesh's
    surface with a stationary one's.
  - *Implementation:* `class MeshAligner:` with `__init__(self,
    optimizer)` storing a `GradientDescentOptimizer` (Lesson 14), plus
    `_total_squared_distance`, `_weighted_score`, and `align`, built
    across this lesson's three Concept Units.
  - *Its use:* the direct, from-scratch equivalent of `diff3d.py`'s
    `align3d(stationary, moving, n, width_pcts, tol_rel)` function.
  - *Type:* a plain class, composed of a `GradientDescentOptimizer`
    (Lesson 14) via **dependency injection** (Lesson 12's own term —
    reused here a second time: `MeshAligner` doesn't build its own
    optimizer internally, it receives one).
  - *Responsibility:* to define the real scoring functions `align3d()`
    itself uses (a plain sum of squared distances, and a Gaussian-
    weighted alternative), and to drive the coarse-to-fine multi-pass
    search described in this lesson's own Terms section, using
    `self.optimizer.minimize` for the actual numerical work at each
    step.
  - *Depends on:* `Mesh.bounds`/`Mesh.center` (Lesson 6),
    `SurfaceSampler` (Lesson 12), a `find_closest`-capable finder
    (`NearestSurfaceFinder` or `SpatialGrid`, Phase C),
    `Triangle.closest_point` (Lesson 10), and
    `GradientDescentOptimizer.minimize` (Lesson 14).
  - *Connects to:* calls `SurfaceSampler.sample`, `Mesh.bounds`,
    `Mesh.center`, a finder's `find_closest`, `Triangle.closest_point`,
    and `self.optimizer.minimize` — genuinely the first class in this
    project to call into every other phase at once.
  - *Shape:* the top of this project's architecture so far — everything
    built since Lesson 1 feeds into this one class's single `align`
    method.

- **`MeshAligner._total_squared_distance`**
  - *What it is:* the plain, unweighted alignment score — the direct
    equivalent of `align3d()`'s `width_pct == np.inf` branch.
  - *Implementation:*
    ```
    def _total_squared_distance(self, delta, moving_points, finder):
        total = 0.0
        for point in moving_points:
            shifted = point + delta
            triangle = finder.find_closest(shifted)
            closest = triangle.closest_point(shifted)
            diff = closest - shifted
            total += diff.dot(diff)
        return total
    ```
    — takes `self`, a candidate `Vector3` `delta`, a list of sampled
    `Vector3` points, and a finder; returns a plain number.
  - *Its use:* the objective function `align()`'s very first pass hands
    to `GradientDescentOptimizer.minimize`.
  - *Type:* an ordinary instance method.
  - *Responsibility:* to score one candidate `delta` by shifting every
    sampled moving-mesh point by it, finding each shifted point's real
    closest point on the stationary mesh, and summing every resulting
    squared distance.
  - *Depends on:* `Vector3.__add__`/`__sub__` (Lesson 2), a finder's
    `find_closest` (Phase C), `Triangle.closest_point` (Lesson 10), and
    `Vector3.dot` (Lesson 4).
  - *Connects to:* called once per gradient-descent iteration during
    `align`'s first pass, via a closure built in `align` itself.
  - *Shape:* `MeshAligner`'s own layer — this project's actual
    `Vector3`-to-number objective function, the exact shape
    `GradientDescentOptimizer.minimize` (Lesson 14) was built to accept.

- **`MeshAligner._weighted_score`**
  - *What it is:* the Gaussian-weighted alignment score — the
    equivalent of `align3d()`'s `width_pct != np.inf` branch.
  - *Implementation:*
    ```
    def _weighted_score(self, delta, moving_points, finder, sqwidth):
        total = 0.0
        for point in moving_points:
            shifted = point + delta
            triangle = finder.find_closest(shifted)
            closest = triangle.closest_point(shifted)
            diff = closest - shifted
            sqdist = diff.dot(diff)
            total += math.exp(-sqdist / sqwidth)
        return -total
    ```
    — takes the same shape as `_total_squared_distance`, plus a
    `sqwidth` controlling how narrow the weighting is; returns a plain
    number.
  - *Its use:* the objective function each of `align()`'s later, narrower
    passes hands to `GradientDescentOptimizer.minimize`.
  - *Type:* an ordinary instance method.
  - *Responsibility:* to score a candidate `delta` the same
    shift-and-find-closest way as `_total_squared_distance`, but
    weighting each point's contribution by this lesson's own **Gaussian
    weighting** rather than counting every point's squared distance
    equally.
  - *Depends on:* the same as `_total_squared_distance`, plus
    `math.exp`.
  - *Connects to:* called once per gradient-descent iteration during
    `align`'s later passes.
  - *Shape:* `MeshAligner`'s own layer, alongside
    `_total_squared_distance` — the second of the two objective-function
    "modes" `align3d()` itself switches between.

- **`MeshAligner.align`**
  - *What it is:* an instance method running the full coarse-to-fine
    multi-pass alignment `diff3d.py`'s `align3d()` performs.
  - *Implementation:* shown in full in this lesson's final Concept
    Unit's New Code — samples the moving mesh's surface, computes a
    starting guess from both meshes' centers, then loops over
    `width_pcts`, building the right objective function (via a
    **closure**, this lesson's own term) for each pass and calling
    `self.optimizer.minimize` on it, feeding each pass's result forward
    as the next pass's starting point.
  - *Its use:* the direct, from-scratch equivalent of the entire
    `align3d()` function.
  - *Type:* an ordinary instance method — the one later lessons
    (Lesson 19-20's final assembly) will actually call.
  - *Responsibility:* to orchestrate every piece this lesson and Phase
    A/C/D/Lesson 14 built into the same coarse-to-fine search
    `align3d()` performs.
  - *Depends on:* everything named in `MeshAligner`'s own entry above.
  - *Connects to:* calls `SurfaceSampler.sample` once, then
    `self.optimizer.minimize` once per entry in `width_pcts`.
  - *Shape:* `MeshAligner`'s own top-level method.

---

## Concept Unit: The Real Objective — Total Squared Distance

### The Problem

`GradientDescentOptimizer.minimize` (Lesson 14) was proven against a
made-up test function, `(v - target).dot(v - target)` — useful for
checking the optimizer itself works, but not the real question this
project needs answered: "how well does a candidate 3D offset line up
one mesh's surface with another's?" `align3d()`'s own `sqdists`
function answers exactly that, using `find_closest` (this project's
Phase C) — nothing built so far combines a candidate offset, a set of
sampled points, and a real nearest-surface search into a single score.

> **Before reading on, try this yourself:** given a candidate `delta`,
> a list of sampled points from the moving mesh's surface
> (`SurfaceSampler`, Lesson 12), and a finder for the *stationary* mesh
> (Phase C), what steps would turn those three things into a single
> number scoring how good `delta` is? (Think about what happens to
> each sampled point when shifted by `delta`, and what "close to the
> stationary mesh" would mean for each shifted point individually,
> before combining every point's own result into one overall score.)

### Introduce the Concept in Isolation

```python
# Throwaway lab: scoring how well a candidate shift lines up two point sets
class V:
    def __init__(self, x): self.x = x
    def __add__(self, o): return V(self.x + o.x)
    def __sub__(self, o): return V(self.x - o.x)

target_points = [V(1.0), V(4.0), V(9.0)]

def closest(target_points, p):
    best = None
    best_d = None
    for t in target_points:
        d = abs(t.x - p.x)
        if best_d is None or d < best_d:
            best_d = d
            best = t
    return best

def total_squared_distance(delta, moving_points, targets):
    total = 0.0
    for p in moving_points:
        shifted = V(p.x + delta.x)
        c = closest(targets, shifted)
        diff = c.x - shifted.x
        total += diff * diff
    return total

moving_points = [V(0.0), V(3.0), V(8.0)]
print(total_squared_distance(V(1.0), moving_points, target_points))
print(total_squared_distance(V(0.5), moving_points, target_points))
```

Real output:

```
0.0
0.75
```

`moving_points` (`0, 3, 8`), shifted by exactly `1.0`, land exactly on
`target_points` (`1, 4, 9`) — a perfect alignment, correctly scoring
`0.0`. Shifted by only `0.5` instead — a worse candidate — every shifted
point misses its nearest target by `0.5`, and `0.5² × 3 = 0.75`,
exactly what the real output shows: a real, checkable proof that a
worse candidate produces a strictly worse (larger) score, exactly what
an objective function `GradientDescentOptimizer.minimize` (Lesson 14)
can act on needs to do.

### Discard the Throwaway Example

This `V`/lab pair is discarded now. `MeshAligner` gets the real
`_total_squared_distance` next.

### Project Change

- **Reference Source:** `diff3d.py`'s `align3d()`, the `sqdists`
  function and the `width_pct == np.inf` branch of `minimize_pass`:
  `points = moving_points + delta; closest = find_closest(stationary, points); deltas = closest - points; return np.sum(deltas**2, axis=1)`,
  combined with `fun = lambda x: np.sum(sqdists(x))`. This method fuses
  both together into one per-candidate score, operating one point at a
  time (this project's own `find_closest`, Phase C, isn't
  batch-oriented the way `pyvista`'s is) rather than as a batched array
  operation.
- **Files affected:** create `src/vector3d/mesh_aligner.py` (new file).
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** `Vector3.__add__`/`__sub__` (Lesson 2), a
  `find_closest`-capable finder (Phase C), `Triangle.closest_point`
  (Lesson 10), `Vector3.dot` (Lesson 4).

### The New Code

Type this into `src/vector3d/mesh_aligner.py`:

```python
class MeshAligner:
    def __init__(self, optimizer):
        self.optimizer = optimizer

    def _total_squared_distance(self, delta, moving_points, finder):
        total = 0.0
        for point in moving_points:
            shifted = point + delta
            triangle = finder.find_closest(shifted)
            closest = triangle.closest_point(shifted)
            diff = closest - shifted
            total += diff.dot(diff)
        return total
```

### The Updated Project

This is the whole new file so far — nothing larger to return to yet
(the same brand-new-file exemption used throughout this curriculum):

```
 1  class MeshAligner:
 2      def __init__(self, optimizer):
 3          self.optimizer = optimizer
 4
 5      def _total_squared_distance(self, delta, moving_points, finder):
 6          total = 0.0
 7          for point in moving_points:
 8              shifted = point + delta
 9              triangle = finder.find_closest(shifted)
10              closest = triangle.closest_point(shifted)
11              diff = closest - shifted
12              total += diff.dot(diff)
13          return total
```

As a whole, this file now defines a buildable `MeshAligner(optimizer)`
that can score any candidate `delta` against a real mesh, using Phase
C's actual nearest-surface search — the first genuine
`Vector3`-to-number objective function this project has built, ready to
hand to `GradientDescentOptimizer.minimize` (Lesson 14).

### Mechanical Walkthrough

- **`class MeshAligner:`**, **`def __init__(self, optimizer):`**,
  **`self.optimizer = optimizer`** — the same `class`/`__init__`/
  attribute-assignment pattern used throughout this project; storing
  the injected optimizer exactly the way `SurfaceSampler` (Lesson 12)
  stored its injected `finder`.
- **`def _total_squared_distance(self, delta, moving_points, finder):`**
  — `def`; a leading-underscore internal helper name (Lesson 11's own
  convention); `self`, and three parameters: `delta` (the candidate
  offset being scored), `moving_points` (a plain list of `Vector3`s,
  Lesson 12's own `SurfaceSampler.sample` output shape), and `finder`
  (any `find_closest`-capable object, Phase C).
- **`total = 0.0`** — a running-total accumulator, the identical pattern
  `Mesh.area()` (Lesson 12) already used.
- **`for point in moving_points:`** — an ordinary `for` loop over the
  sampled points list.
- **`shifted = point + delta`** — `Vector3.__add__` (Lesson 2), applying
  the candidate offset to this one sampled point.
- **`triangle = finder.find_closest(shifted)`** — calling `find_closest`
  (Phase C — `NearestSurfaceFinder` or `SpatialGrid`, either one, via
  the same duck typing `SurfaceSampler` already relied on in Lesson 12)
  on the shifted point.
- **`closest = triangle.closest_point(shifted)`** — `Triangle.closest_point`
  (Lesson 10), finding the real closest point on that triangle's actual
  surface to the shifted point — not Lesson 9's old centroid
  approximation.
- **`diff = closest - shifted`** — `Vector3.__sub__` (Lesson 2), the
  vector from the shifted point to its nearest real surface point.
- **`total += diff.dot(diff)`** — `Vector3.dot` (Lesson 4), a vector
  dotted with itself — Lesson 4's own established shortcut for squared
  length, without needing an actual `.length()` call and its extra
  `math.sqrt`; accumulated into the running total.
- **`return total`** — `return`, handing back the fully-summed score.

### CS Lens

This is a **least-squares objective** — scoring a candidate by the sum
of squared errors across many individual measurements — one of the most
common objective-function shapes in all of numerical computing,
because squaring makes every error contribute positively (no
cancellation between "too far left" and "too far right") while
penalizing large errors disproportionately more than small ones.

Also recognized in: linear regression (fitting a line by minimizing the
sum of squared vertical distances from each data point to the line);
photogrammetry and 3D reconstruction (bundle adjustment, aligning many
camera views, is a large-scale least-squares problem); the Iterative
Closest Point (ICP) algorithm — a real, well-known point-cloud alignment
technique this entire lesson's own structure (shift, find nearest,
sum squared distances, optimize, repeat) closely resembles, though this
project's own version optimizes only a translation, not the full
rotation-plus-translation ICP typically solves for.

### SE Lens

The principle is **fusing several already-built pieces into exactly the
shape a consumer needs**, rather than building a new, independent
computation from scratch — every individual operation this method
performs (`+`, `find_closest`, `closest_point`, `-`, `dot`) already
existed; this method's own contribution is only the specific sequence
and the running-sum wrapper around them.

The alternative not chosen: batch the shift-and-find-closest step
across every sampled point at once, the way `numpy`-based
`sqdists(delta)` does — computing `moving_points + delta` as one array
operation, then a single (hypothetically batched) `find_closest` call
across all points together. This project's own Phase C search classes
were never built to accept a batch of query points at once (`find_closest`
takes exactly one `Vector3`), so this method calls it once per point in
an ordinary loop instead — slower than a genuinely vectorized
implementation would be, and a real, honest architectural difference
from `numpy`'s own batched approach, not something this rebuild
attempts to match.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3
from vector3d.triangle import Triangle
from vector3d.mesh import Mesh
from vector3d.nearest_surface_finder import NearestSurfaceFinder
from vector3d.mesh_aligner import MeshAligner

t1 = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(2.0, 0.0, 0.0), Vector3(0.0, 2.0, 0.0))
stationary = Mesh([t1])
finder = NearestSurfaceFinder(stationary)

moving_points = [Vector3(0.5, 0.5, 0.0), Vector3(1.0, 0.0, 0.0)]

aligner = MeshAligner(optimizer=None)
print(aligner._total_squared_distance(Vector3(0.0, 0.0, 0.0), moving_points, finder))
print(aligner._total_squared_distance(Vector3(5.0, 5.0, 5.0), moving_points, finder))
"
```

Real output:

```
0.0
131.0
```

Two sample points that already sit exactly on the stationary triangle's
surface score `0.0` at `delta = (0,0,0)` — a perfect, checkable case —
and score a large, real positive number once shifted far away by
`(5,5,5)`. (`optimizer=None` is valid here specifically because this
Concept Unit's own `Run It` never calls `self.optimizer` at all — only
`_total_squared_distance` directly.)

### Connect

`MeshAligner` can now score a candidate offset the same way
`align3d()`'s own `width_pct == np.inf` pass does. The next Concept Unit
builds the alternative scoring mode `align3d()` uses for every later,
narrower pass.

---

## Concept Unit: A Softer Objective — Gaussian Weighting

### The Problem

`align3d()`'s later passes (`width_pct` values `8`, `2`, `0.5` in the
original script's own default) don't use a plain sum of squared
distances at all — they use
`fun = lambda x: -np.sum(np.exp(-sqdists(x) / sqwidth))`, this lesson's
own **Gaussian weighting**. A plain sum of squares treats every point
equally, including ones that are currently far off — reasonable for a
first, coarse pass, but a poor way to *refine* an already-decent
alignment, where a handful of stubbornly-misaligned points (real
manufacturing differences, exactly what `diff3d.py` is looking for in
the first place) shouldn't be allowed to dominate the score once the
overall alignment is already roughly correct.

> **Before reading on, try this yourself:** `math.exp(-sqdist / sqwidth)`
> — for a very *small* `sqdist` relative to `sqwidth`, the exponent is
> close to `0`, and `math.exp(0)` is exactly `1`. For a very *large*
> `sqdist` relative to `sqwidth`, the exponent becomes a large negative
> number. What does `math.exp` do to a large negative input — does it
> approach `0`, or does it grow without bound? Given that, what would a
> sum of many `exp(-sqdist / sqwidth)` terms end up being dominated by:
> the many points that are already close, or the few that are still
> far away?

### Introduce the Concept in Isolation

```python
# Throwaway lab: down-weighting distant points instead of counting every point equally
import math

def weighted_score(sqdists, sqwidth):
    total = 0.0
    for sqd in sqdists:
        total += math.exp(-sqd / sqwidth)
    return -total

close_case = [0.01, 0.02, 0.01]
far_case = [50.0, 60.0, 45.0]

print(weighted_score(close_case, sqwidth=1.0))
print(weighted_score(far_case, sqwidth=1.0))
```

Real output:

```
-2.9602983408050916
-2.8818069546801093e-20
```

Three points that are all already very close (`sqdist` around `0.01`
to `0.02`) produce a score close to `-3` — near the most negative this
particular sum could be (each term maxing out near `-1` when `sqdist`
is near `0`); three points that are all far away produce a score
essentially `0` (`-2.88 × 10⁻²⁰`, effectively nothing), directly
answering this Concept Unit's own Socratic prompt: `math.exp` of a large
negative number approaches `0`, so far-away points contribute almost
nothing to the sum, while close points dominate it — the negative sign
out front is what turns "bigger sum of closeness" into "smaller (more
negative) score," keeping the same "lower is better" convention
`GradientDescentOptimizer.minimize` (Lesson 14) expects.

### Discard the Throwaway Example

This scratch `weighted_score` is discarded now. `MeshAligner` gets the
real `_weighted_score` next.

### Project Change

- **Reference Source:** `diff3d.py`'s `align3d()`,
  `minimize_pass`'s `else` branch:
  `sqwidth = (size * width_pct / 100) ** 2; fun = lambda x: -np.sum(np.exp(-sqdists(x) / sqwidth))`.
- **Files affected:** modify `src/vector3d/mesh_aligner.py`.
- **Change type:** add.
- **Location:** inside `class MeshAligner:`, directly after
  `_total_squared_distance` (earlier in this lesson). Also requires
  adding `import math` at the top of the file — this lesson's own
  `math.exp`, this project's first use of it.
- **Dependencies:** the same as `_total_squared_distance`, plus
  `math.exp`.

### The New Code

At the top of `src/vector3d/mesh_aligner.py`, before `class MeshAligner:`:

```python
import math
```

Then, inside `class MeshAligner:`, after `_total_squared_distance`:

```python
    def _weighted_score(self, delta, moving_points, finder, sqwidth):
        total = 0.0
        for point in moving_points:
            shifted = point + delta
            triangle = finder.find_closest(shifted)
            closest = triangle.closest_point(shifted)
            diff = closest - shifted
            sqdist = diff.dot(diff)
            total += math.exp(-sqdist / sqwidth)
        return -total
```

### The Updated Project

`src/vector3d/mesh_aligner.py` so far, new lines marked:

```
 1  import math                                                          # ← new
 2
 3
 4  class MeshAligner:
 5      def __init__(self, optimizer):
 6          self.optimizer = optimizer
 7
 8      def _total_squared_distance(self, delta, moving_points, finder):
 9          total = 0.0
10          for point in moving_points:
11              shifted = point + delta
12              triangle = finder.find_closest(shifted)
13              closest = triangle.closest_point(shifted)
14              diff = closest - shifted
15              total += diff.dot(diff)
16          return total
17
18      def _weighted_score(self, delta, moving_points, finder, sqwidth):  # ← new
19          total = 0.0                                                 # ← new
20          for point in moving_points:                                 # ← new
21              shifted = point + delta                                 # ← new
22              triangle = finder.find_closest(shifted)                 # ← new
23              closest = triangle.closest_point(shifted)               # ← new
24              diff = closest - shifted                                # ← new
25              sqdist = diff.dot(diff)                                 # ← new
26              total += math.exp(-sqdist / sqwidth)                    # ← new
27          return -total                                               # ← new
```

As a whole, `MeshAligner` now has both scoring modes `align3d()` itself
switches between — the plain sum this lesson's first Concept Unit
built, and this Gaussian-weighted alternative — differing only in the
last two lines of an otherwise identical shift-find-closest-measure
sequence.

### Mechanical Walkthrough

- **`import math`** — the same standard-library import form used since
  Lesson 4.
- **`def _weighted_score(self, delta, moving_points, finder, sqwidth):`**
  — `def`; `_weighted_score`, an internal helper name; the same first
  four parameters as `_total_squared_distance`, plus one more,
  `sqwidth` — how narrow this particular pass's weighting should be.
- **Lines through `sqdist = diff.dot(diff)`** — identical, line for
  line, to `_total_squared_distance`'s own shift/find-closest/measure
  sequence, only stopping one step earlier (storing the squared distance
  in a named variable, `sqdist`, rather than accumulating it directly)
  because this method needs that value *twice*: once to weight it, and
  implicitly through the exponent below.
- **`total += math.exp(-sqdist / sqwidth)`** — `-sqdist / sqwidth` —
  ordinary numeric division and negation, producing an increasingly
  negative number as `sqdist` grows relative to `sqwidth`; `math.exp(...)`
  (this lesson's own term) — Python's standard-library exponential
  function, turning that negative number into a value between `0`
  (for a very negative input) and `1` (for an input near `0`) — this
  lesson's own Gaussian weighting, applied for real; accumulated into
  the running total via `+=`.
- **`return -total`** — `return`, negating the accumulated sum before
  handing it back — directly implementing the sign flip this Concept
  Unit's own Socratic prompt asked about: without the negation, a
  *better* alignment (more points contributing values near `1`) would
  produce a *larger* number, the opposite of the "lower is better"
  convention every objective function in this project (and
  `GradientDescentOptimizer.minimize`, Lesson 14) assumes.

### CS Lens

This is a **Gaussian kernel** (or **radial basis function**) applied as
a weighting scheme — the same bell-curve shape (`exp(-x²/width²)`)
underlying the normal distribution in statistics, here repurposed as a
smooth, tunable "how much does this point count" function rather than a
probability density.

Also recognized in: kernel density estimation in statistics (smoothing
a set of discrete data points into a continuous density estimate, using
this same falloff shape); Gaussian blur in image processing (each output
pixel is a weighted sum of nearby input pixels, weighted by exactly
this same distance-based falloff); support vector machines' own
"RBF kernel" in machine learning, named for the identical mathematical
shape; robust statistics more broadly, where down-weighting outliers
(rather than either fully including or fully excluding them) is a
well-established technique for reducing their influence on a fitted
result.

### SE Lens

The principle is **choosing a scoring function that matches the
refinement stage**, rather than using one fixed objective for every
pass — the same coarse-to-fine philosophy this lesson's own Terms
section already named for the alignment process as a whole, here
justified at the level of *why* the scoring function itself needs to
change between passes, not just the search.

The alternative not chosen: use the plain sum-of-squares objective
(this lesson's first Concept Unit) for every single pass, never
switching to Gaussian weighting at all. That would be simpler — one
objective function, no `sqwidth` tuning needed — and would work
reasonably well when the two meshes start already close to aligned. The
real cost: a plain sum of squares can't distinguish "mostly aligned,
with a few genuinely different (machined) regions" from "poorly
aligned everywhere" — both could produce a similarly large total. The
Gaussian-weighted passes, by shrinking `sqwidth` progressively, let
later passes ignore points that remain stubbornly far (increasingly
likely to be genuine machining differences, not alignment error) while
still refining the fit for points that are already close — the actual
purpose `diff3d.py` exists for in the first place.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3
from vector3d.triangle import Triangle
from vector3d.mesh import Mesh
from vector3d.nearest_surface_finder import NearestSurfaceFinder
from vector3d.mesh_aligner import MeshAligner

t1 = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(2.0, 0.0, 0.0), Vector3(0.0, 2.0, 0.0))
stationary = Mesh([t1])
finder = NearestSurfaceFinder(stationary)
moving_points = [Vector3(0.5, 0.5, 0.0), Vector3(1.0, 0.0, 0.0)]

aligner = MeshAligner(optimizer=None)
print(aligner._weighted_score(Vector3(0.0, 0.0, 0.0), moving_points, finder, sqwidth=1.0))
print(aligner._weighted_score(Vector3(5.0, 5.0, 5.0), moving_points, finder, sqwidth=1.0))
"
```

Real output:

```
-2.0
-7.157171617118268e-29
```

The same two sample points from the previous Concept Unit: already
sitting exactly on the surface, they score `-2.0` (both terms at their
maximum, `exp(0) = 1` each, negated) — the best possible score for two
points under this weighting; shifted far away by `(5,5,5)`, the score
collapses to essentially `0` — a real, checkable proof of this Concept
Unit's own Socratic prompt: far points contribute almost nothing, close
points dominate.

### Connect

`MeshAligner` now has both scoring modes `align3d()` itself needs. The
final Concept Unit assembles them into the actual coarse-to-fine
multi-pass search.

---

## Concept Unit: Coarse to Fine — the Multi-Pass Loop

### The Problem

Nothing yet ties `_total_squared_distance`/`_weighted_score` to
`GradientDescentOptimizer.minimize` (Lesson 14), or repeats the search
across several progressively narrower passes the way `align3d()`'s own
`for w in width_pcts:` loop does, each pass starting from the previous
one's own answer.

> **Before reading on, try this yourself:** `GradientDescentOptimizer.minimize`
> (Lesson 14) expects an objective function taking *only* a candidate
> `Vector3` and returning a number — but `_total_squared_distance`/
> `_weighted_score` also need `moving_points`, `finder`, and (for the
> weighted case) `sqwidth`, none of which change *during* one particular
> pass's optimization, only *between* passes. This lesson's own Terms
> section already names the tool for this: a **closure** — a nested
> function, defined fresh inside the loop, that "remembers" that pass's
> own fixed values. Sketch, in plain words, what a nested function
> defined inside a `for width_pct in width_pcts:` loop, taking only
> `candidate` as its own parameter, would need to do in its body to
> call `self._total_squared_distance` or `self._weighted_score`
> correctly.

### Introduce the Concept in Isolation

```python
# Throwaway lab: a nested function that "remembers" a variable from its enclosing scope
def make_scorer(target):
    def score(candidate):
        return abs(candidate - target)
    return score

score_against_10 = make_scorer(10)
score_against_100 = make_scorer(100)

print(score_against_10(7))
print(score_against_100(7))
```

Real output:

```
3
93
```

`score`, defined *inside* `make_scorer`, takes only `candidate` as its
own parameter — yet its body reaches `target`, a variable from
`make_scorer`'s own enclosing scope, without `target` ever being passed
to `score` directly. This is a **closure** (this lesson's own term):
`score_against_10` and `score_against_100` are two separate functions,
each one permanently "remembering" a different `target` value from the
moment it was created, exactly the mechanism this Concept Unit's own
Socratic prompt anticipates for `align()`'s own per-pass objective
functions.

### Discard the Throwaway Example

This `make_scorer`/lab pair is discarded now. `MeshAligner` gets the
real `align` method next.

### Project Change

- **Reference Source:** `diff3d.py`'s `align3d()`, in full: the
  `moving_points = sample_points(moving, n)` line, the
  `size = np.sqrt(...)` bounds computation, the
  `delta = np.array(stationary.center) - np.array(moving.center)`
  initial guess, `minimize_pass` (both branches, already built earlier
  in this lesson), and the closing `for w in width_pcts: delta =
  minimize_pass(delta, w)` loop. This method is its complete, direct
  replacement.
- **Files affected:** modify `src/vector3d/mesh_aligner.py`.
- **Change type:** add.
- **Location:** inside `class MeshAligner:`, directly after
  `_weighted_score` (earlier in this lesson). Also requires adding
  `from vector3d.vector import Vector3` and
  `from vector3d.surface_sampler import SurfaceSampler` at the top of
  the file.
- **Dependencies:** `SurfaceSampler.sample` (Lesson 12), `Mesh.bounds`/
  `Mesh.center` (Lesson 6), `Vector3.__sub__` (Lesson 2),
  `self._total_squared_distance`/`self._weighted_score` (earlier in
  this lesson), and `self.optimizer.minimize` (Lesson 14).

### The New Code

Add these imports at the top of `src/vector3d/mesh_aligner.py`:

```python
from vector3d.vector import Vector3
from vector3d.surface_sampler import SurfaceSampler
```

Then, inside `class MeshAligner:`, after `_weighted_score`:

```python
    def align(self, stationary, stationary_finder, moving, moving_finder,
              n=2000, width_pcts=(float("inf"), 8, 2, 0.5)):
        sampler = SurfaceSampler(moving, moving_finder)
        moving_points = sampler.sample(n)

        xmin, xmax, ymin, ymax, zmin, zmax = stationary.bounds()
        size = Vector3(xmax - xmin, ymax - ymin, zmax - zmin).length()

        delta = stationary.center - moving.center

        for width_pct in width_pcts:
            if width_pct == float("inf"):
                def objective(candidate):
                    return self._total_squared_distance(candidate, moving_points, stationary_finder)
            else:
                sqwidth = (size * width_pct / 100) ** 2

                def objective(candidate):
                    return self._weighted_score(candidate, moving_points, stationary_finder, sqwidth)

            delta = self.optimizer.minimize(objective, delta)

        return delta
```

### The Updated Project

`src/vector3d/mesh_aligner.py` in full, new lines marked:

```
 1  import math
 2
 3  from vector3d.vector import Vector3                                  # ← new
 4  from vector3d.surface_sampler import SurfaceSampler                  # ← new
 5
 6
 7  class MeshAligner:
 8      def __init__(self, optimizer):
 9          self.optimizer = optimizer
10
11      def _total_squared_distance(self, delta, moving_points, finder):
12          total = 0.0
13          for point in moving_points:
14              shifted = point + delta
15              triangle = finder.find_closest(shifted)
16              closest = triangle.closest_point(shifted)
17              diff = closest - shifted
18              total += diff.dot(diff)
19          return total
20
21      def _weighted_score(self, delta, moving_points, finder, sqwidth):
22          total = 0.0
23          for point in moving_points:
24              shifted = point + delta
25              triangle = finder.find_closest(shifted)
26              closest = triangle.closest_point(shifted)
27              diff = closest - shifted
28              sqdist = diff.dot(diff)
29              total += math.exp(-sqdist / sqwidth)
30          return -total
31
32      def align(self, stationary, stationary_finder, moving, moving_finder,  # ← new
33                n=2000, width_pcts=(float("inf"), 8, 2, 0.5)):          # ← new
34          sampler = SurfaceSampler(moving, moving_finder)               # ← new
35          moving_points = sampler.sample(n)                            # ← new
36                                                                         # ← new
37          xmin, xmax, ymin, ymax, zmin, zmax = stationary.bounds()      # ← new
38          size = Vector3(xmax - xmin, ymax - ymin, zmax - zmin).length()  # ← new
39                                                                         # ← new
40          delta = stationary.center - moving.center                    # ← new
41                                                                         # ← new
42          for width_pct in width_pcts:                                 # ← new
43              if width_pct == float("inf"):                            # ← new
44                  def objective(candidate):                            # ← new
45                      return self._total_squared_distance(candidate, moving_points, stationary_finder)  # ← new
46              else:                                                     # ← new
47                  sqwidth = (size * width_pct / 100) ** 2               # ← new
48                                                                         # ← new
49                  def objective(candidate):                            # ← new
50                      return self._weighted_score(candidate, moving_points, stationary_finder, sqwidth)  # ← new
51                                                                         # ← new
52              delta = self.optimizer.minimize(objective, delta)        # ← new
53                                                                         # ← new
54          return delta                                                  # ← new
```

As a whole, `MeshAligner` is now complete: `align()` is the single
method combining every phase of this project built so far into the same
coarse-to-fine search `align3d()` performs.

### Mechanical Walkthrough

- **`def align(self, stationary, stationary_finder, moving, moving_finder, n=2000, width_pcts=(float("inf"), 8, 2, 0.5)):`**
  — `def`; `align`, the method later lessons will call directly; `self`,
  four required parameters (both meshes and both their finders — a
  deliberate design choice: `align()` accepts pre-built finders rather
  than constructing them internally, the identical dependency-injection
  reasoning `SurfaceSampler` (Lesson 12) already used), and two
  parameters with **default arguments** (Lesson 14's own term) matching
  `align3d()`'s own defaults, `n=2000` and
  `width_pcts=(float("inf"), 8, 2, 0.5)` — `float("inf")` (ordinary
  Python, already familiar) standing in for `numpy`'s own `np.inf`.
- **`sampler = SurfaceSampler(moving, moving_finder)`** /
  **`moving_points = sampler.sample(n)`** — `SurfaceSampler.__init__`
  and `.sample` (Lesson 12), generating real sample points across the
  moving mesh's surface, using whichever finder was passed in for it.
- **`xmin, xmax, ymin, ymax, zmin, zmax = stationary.bounds()`** — the
  same tuple-unpacking pattern used since Lesson 6.
- **`size = Vector3(xmax - xmin, ymax - ymin, zmax - zmin).length()`** —
  building a `Vector3` from the bounding box's own span along each
  axis, then calling `.length()` (Lesson 4) on it — the direct
  equivalent of `align3d()`'s own
  `np.sqrt((xmax-xmin)**2 + (ymax-ymin)**2 + (zmax-zmin)**2)`, expressed
  here as "the length of the diagonal vector" rather than a hand-written
  sum of squares under a square root, since `Vector3.length()` already
  computes exactly that.
- **`delta = stationary.center - moving.center`** — `Mesh.center`
  (Lesson 6, a `@property`, read with no parentheses) on both meshes,
  and `Vector3.__sub__` (Lesson 2) — the starting guess for alignment:
  simply the offset between the two meshes' overall centers, before any
  optimization has run at all.
- **`for width_pct in width_pcts:`** — an ordinary `for` loop over the
  passed-in tuple of pass widths.
- **`if width_pct == float("inf"): def objective(candidate): return self._total_squared_distance(candidate, moving_points, stationary_finder)`**
  — `def objective(candidate):`, a **closure** (this lesson's own
  term) defined fresh on this specific pass, taking only `candidate` as
  its own parameter — exactly the shape `GradientDescentOptimizer.minimize`
  (Lesson 14) requires — while its body reaches `self`, `moving_points`,
  and `stationary_finder` from the enclosing `align` method's own
  scope, none of them passed to `objective` directly, the identical
  mechanism this Concept Unit's own throwaway lab already proved.
- **`else: sqwidth = (size * width_pct / 100) ** 2; def objective(candidate): return self._weighted_score(...)`**
  — for every non-infinite `width_pct`, computing `sqwidth` (ordinary
  numeric arithmetic — `Vector3.__mul__`/`__pow__` aren't involved
  here at all, since `size` and `width_pct` are both plain numbers, not
  `Vector3`s), then defining a *different* closure, this one calling
  `_weighted_score` instead, additionally remembering this specific
  pass's own `sqwidth`.
- **`delta = self.optimizer.minimize(objective, delta)`** — calling
  `GradientDescentOptimizer.minimize` (Lesson 14) with whichever
  `objective` closure this pass just built, starting from the *current*
  `delta` — critically, the *previous* pass's own result, not the
  original starting guess — and immediately overwriting `delta` with
  this pass's improved answer, ready to feed into the next iteration of
  the loop.
- **`return delta`** — `return`, handing back the final `delta` once
  every pass in `width_pcts` has run.

### CS Lens

This is **coarse-to-fine optimization** (this lesson's own term, in
full) — a real, well-established strategy for optimization problems
with many possible "locally good but globally wrong" answers: start
with a smooth, forgiving objective that's easy to search (this lesson's
own `width_pct == inf` pass), then progressively sharpen it, using each
stage's answer to seed the next, harder-to-search stage — closures
themselves are a distinct concept (functions that capture their
defining environment), used here as the mechanism enabling that
per-pass objective switching.

Also recognized in: image processing and computer vision (multi-
resolution/"pyramid" image alignment, matching coarse, blurred versions
of two images first, then refining at progressively sharper resolutions
— structurally the same coarse-to-fine idea, in a completely different
domain); simulated annealing (starting with a "hot," exploratory search
phase and "cooling" it into a more focused one); curriculum learning in
machine learning (training a model on easier examples first, harder
ones later); this project's own earlier CS Lens note, back in Lesson 15's
own `_total_squared_distance` — the Iterative Closest Point (ICP)
algorithm this whole lesson resembles is itself frequently run in a
coarse-to-fine, multi-resolution fashion in real applications.

### SE Lens

The principle is **carrying state forward between independent search
runs**, rather than treating each pass as isolated — `delta`'s value
threads through every iteration of the loop, so a later, narrower pass
never starts from scratch; it refines whatever the previous, coarser
pass already found.

**A real, honestly-checked limitation, not merely predicted:** this
project's own `diff3d.py` never actually calls `align3d()` in its main
pipeline — the call is commented out entirely in `run_diff()`
(`# delta = align3d(m1, m2, ...)`), left disabled by the original
script's own author. Testing this lesson's own `align()` against a mesh
deliberately translated by a known offset confirms why that caution is
warranted: a single pass (`width_pcts=(float("inf"),)` alone) with a
carefully chosen learning rate converges essentially exactly — real,
checked output, `Vector3(-5.0000003, 2.9999997, -2.0000005)` against a
true answer of `(-5, 3, -2)`. Running the *full* default multi-pass
sequence (`width_pcts=(inf, 8, 2, 0.5)`, matching `align3d()`'s own
default) on the identical test case, with the identical learning rate,
lands at `Vector3(-5.502, 2.498, -2.0000005)` instead — close, but
measurably off on two axes. The cause is a real, traceable one: the
later, narrow Gaussian passes use a very small `sqwidth`, producing an
objective function whose *shape* changes extremely sharply over a small
region — and `GradientDescentOptimizer`'s own fixed finite-differences
`epsilon` (Lesson 14), tuned for the earlier, smoother pass, isn't
automatically rescaled to match. This project's own optimizer has no
adaptive step-size or epsilon-rescaling logic (a real, named gap
Lesson 14's own SE Lens already flagged, generically); this lesson is
where that gap's concrete cost shows up, on the exact multi-pass
structure it was always going to be used for. A production-quality
version would need `GradientDescentOptimizer` (or this method's own use
of it) to adapt `epsilon` relative to each pass's own `sqwidth` — left
here as an honest, open limitation, exactly mirroring the original
script's own decision to leave `align3d()` disabled by default rather
than trusted blindly in its main pipeline.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3
from vector3d.triangle import Triangle
from vector3d.mesh import Mesh
from vector3d.nearest_surface_finder import NearestSurfaceFinder
from vector3d.optimizer import GradientDescentOptimizer
from vector3d.mesh_aligner import MeshAligner

def translate_triangle(t, offset):
    return Triangle(t.v0 + offset, t.v1 + offset, t.v2 + offset)

t1 = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(4.0, 0.0, 0.0), Vector3(0.0, 4.0, 0.0))
t2 = Triangle(Vector3(1.0, 1.0, 2.0), Vector3(3.0, 1.0, 2.0), Vector3(1.0, 3.0, 2.0))
stationary = Mesh([t1, t2])

offset = Vector3(5.0, -3.0, 2.0)
moving = Mesh([translate_triangle(t1, offset), translate_triangle(t2, offset)])

stationary_finder = NearestSurfaceFinder(stationary)
moving_finder = NearestSurfaceFinder(moving)
optimizer = GradientDescentOptimizer(learning_rate=0.01, max_iterations=200)
aligner = MeshAligner(optimizer)

single_pass = aligner.align(stationary, stationary_finder, moving, moving_finder, n=30, width_pcts=(float('inf'),))
print('single pass:', single_pass)

full = aligner.align(stationary, stationary_finder, moving, moving_finder, n=30, width_pcts=(float('inf'), 8, 2, 0.5))
print('full multi-pass:', full)

print('true answer:', offset * -1.0)
"
```

Real output:

```
single pass: Vector3(-5.0000003022191075, 2.999999697780893, -2.0000005)
full multi-pass: Vector3(-5.502114012899981, 2.497886148037949, -2.0000005)
true answer: Vector3(-5.0, 3.0, -2.0)
```

Exactly the two real results this Concept Unit's own SE Lens already
walked through: a single, wide pass converges essentially exactly; the
full default multi-pass sequence — matching `align3d()`'s own defaults
— measurably drifts on two of three axes, a real, demonstrated
limitation rather than a hypothetical one.

### Connect

Phase E is complete. `MeshAligner.align` reproduces `align3d()`'s full
coarse-to-fine structure, built entirely from this project's own earlier
phases, with one honestly-documented numerical limitation in its
narrower passes — the same caution the original script's own author
seems to have reached, given that `align3d()` is never actually called
in `diff3d.py`'s own main pipeline.

---

## Connect the Pieces

One alignment run, traced through every method this lesson built:
`aligner.align(stationary, stationary_finder, moving, moving_finder,
n=30, width_pcts=(float("inf"),))` (third Concept Unit) samples the
moving mesh's surface via `SurfaceSampler` (Lesson 12), computes a
starting `delta` from both meshes' `Mesh.center` (Lesson 6), and enters
its loop. For the single `width_pct = inf` pass, it builds a closure
(this lesson's own term) around `self._total_squared_distance` (first
Concept Unit) — itself built from `find_closest` (Phase C) and
`Triangle.closest_point` (Lesson 10) — and hands that closure to
`self.optimizer.minimize` (Lesson 14), which repeatedly estimates a
gradient via finite differences and steps against it until convergence.
The result, `delta ≈ (-5.0000003, 2.9999997, -2.0000005)`, comes back
essentially exact against the true offset, `(-5, 3, -2)` — one project,
fifteen lessons, every phase from raw `Vector3` arithmetic through
binary file parsing, nearest-surface search, surface sampling, and
numerical optimization, converging on a single correct 3D answer with
zero external libraries anywhere in the chain.

---

## Try It Yourself

Type `MeshAligner` into `src/vector3d/mesh_aligner.py` yourself (not
copy-pasted, remembering `import math` and both new imports at the
top), and confirm the `Run It` output above with your own translated
mesh. Then, once that works, try narrowing the gap between the
single-pass and full-multi-pass results yourself: reduce
`GradientDescentOptimizer`'s own `epsilon` (say, to `1e-8` instead of
the default `1e-6`) and re-run the full multi-pass alignment — see for
yourself whether a smaller finite-differences step, better matched to
the later passes' own small `sqwidth`, actually closes the gap this
lesson's SE Lens documented:

```python
optimizer2 = GradientDescentOptimizer(learning_rate=0.01, epsilon=1e-8, max_iterations=200)
aligner2 = MeshAligner(optimizer2)
full2 = aligner2.align(stationary, stationary_finder, moving, moving_finder, n=30, width_pcts=(float("inf"), 8, 2, 0.5))
print(full2)
```
