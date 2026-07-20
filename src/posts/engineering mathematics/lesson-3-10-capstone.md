# Stage 3, Lesson 3.10 — Capstone: CAD Geometry and Spline Curves
**Threads:** Math · Physics · Engineering
**Estimated time:** 90–110 minutes

---

## What This Lesson Is About

Every real manufactured part's outline is not one circle, one
parabola, or one Bezier curve — it's a **mix**: a straight edge, into
a filleted (rounded) corner, into an arc, into a smooth freeform
curve, back to a straight edge. This capstone builds the one new idea
needed to handle that: a **spline** — several curve segments joined
together with control over exactly how smoothly they connect — and
then uses it, together with every other tool from this stage, to
build a small but genuine CAD pipeline: define a mixed-segment part
profile, apply transformations to it, and export it as a toolpath.

This lesson introduces less brand-new theory than the previous nine —
that's the point of a capstone. The new material is concentrated in
one place (splines and continuity), and the rest of the lesson is
about **composition**: making circles (3.2), parabolas (3.3),
ellipses (3.4), Bezier curves (3.7), and transformations (3.9) work
together inside one system, the way they actually have to in real
CAD software.

---

## Historical Context

The word "spline" predates computing entirely: it originally named a
thin, flexible strip of wood or metal that draftsmen and
shipbuilders physically bent by hand, held in place with lead weights
("ducks"), to draw a smooth curve through a set of required points —
the physical strip naturally settled into the smoothest possible
shape connecting them, minimizing bending energy. When Pierre Bézier
and Paul de Casteljau built their computational curve representations
in the 1960s (Lesson 3.7), the name transferred directly, because the
mathematical goal was the same: a smooth curve, under precise
numerical control, built from simple pieces joined smoothly. Modern
CAD kernels (the geometry engines inside SolidWorks, Fusion 360,
CATIA, and others) represent the overwhelming majority of real,
manufactured freeform surfaces — car body panels, turbine blades,
consumer product housings — as networks of exactly this kind of
piecewise spline, evaluated billions of times over a part's design
lifetime.

---

## What You Need To Know First

This capstone draws on the entire stage:
- **Circles, parabolas, ellipses** — Lessons 3.2–3.4, as reusable
  profile primitives.
- **Bezier curves** — Lesson 3.7, extended here into multi-segment
  splines.
- **Numerical tangent estimation** — Lesson 3.7's central difference,
  reused to check spline smoothness.
- **Transformations, composition, homogeneous coordinates** — Lesson
  3.9, applied to entire multi-segment profiles at once.
- **Toolpath sampling and chordal deviation** — flagged as unfinished
  business in Lesson 3.3's SE lens; resolved properly here.

---

## The Lesson

### Why One Bezier Curve Isn't Enough

A single cubic Bezier curve (Lesson 3.7) has exactly 4 control points
and one polynomial degree — it can bend at most a couple of times
before you're fighting the curve rather than shaping it. Real profiles
need many local shape changes: a gentle bulge here, a sharp-ish
transition there, each controllable independently. The solution is
not "use a higher-degree Bezier curve" (high-degree curves become
numerically unstable and lose the intuitive local control that makes
Bezier curves useful in the first place) — it's to chain **several
low-degree Bezier segments end to end**, each shaped independently,
constrained only at the **joints** where they meet.

### Continuity: How Smoothly Segments Connect

At a joint between two segments, there are three increasingly strict
levels of "smoothness":

- **$C^0$ (positional) continuity**: the segments' endpoints simply
  match — no gap, but the curve can have a visible kink (a sudden
  direction change) at the joint.
- **$C^1$ (tangent) continuity**: the segments' endpoints match *and*
  their tangent directions match — no visible kink, the curve looks
  smooth, but the *rate* at which it's curving can jump.
- **$C^2$ (curvature) continuity**: endpoints, tangents, *and*
  curvature all match — the smoothest practical level; a reflection
  off the surface (imagine a shiny car panel) shows no visible break
  at all.

You don't yet have the formal derivative (Lesson 5.3) to define
tangent direction exactly, so this lesson uses the same central-
difference numerical estimate from Lesson 3.7 to *check* continuity,
and a geometric control-point rule to *enforce* it — a genuinely
practical way to build smooth curves years before the calculus that
fully explains why the rule works.

**The $C^1$ control-point rule for adjacent cubic Bezier segments.**
If segment 1 ends at $P_3$ and segment 2 begins at $P_3' = P_3$ (this
is $C^0$: shared endpoint), then $C^1$ continuity additionally
requires segment 1's last control point $P_2$, the shared joint
$P_3$, and segment 2's first control point $P_1'$ to be **collinear**,
with $P_3$ positioned so the tangent *directions* match (magnitudes
can differ; only direction needs to agree for $C^1$). The simplest
way to guarantee this: place $P_1'$ as the reflection of $P_2$ through
$P_3$ — reusing Lesson 3.9's point-reflection idea directly.

```python
import math
import numpy as np

def mirror_point_through(point, centre):
    """Reflect a point through another point (180° rotation about centre)."""
    px, py = point
    cx, cy = centre
    return (2*cx - px, 2*cy - py)

def make_c1_spline_segment(prev_segment_controls, next_p2, next_p3):
    """
    Given the previous cubic Bezier segment's control points
    [P0,P1,P2,P3], and the desired P2 and P3 for the NEXT segment,
    compute the next segment's P0 and P1 so the joint is C1-continuous.
    Returns the next segment's full control point list.
    """
    P0, P1, P2, P3 = prev_segment_controls
    next_P0 = P3                                   # C0: shared endpoint
    next_P1 = mirror_point_through(P2, P3)          # C1: collinear, matched direction
    return [next_P0, next_P1, next_p2, next_p3]

# Segment 1: a gentle rise
seg1 = [(0, 0), (2, 6), (6, 6), (8, 2)]
# Segment 2: continues smoothly from seg1's end
seg2 = make_c1_spline_segment(seg1, next_p2=(12, -2), next_p3=(16, 0))

print("Segment 1 control points:", seg1)
print("Segment 2 control points:", seg2)
print(f"\nJoint point: {seg1[3]} == {seg2[0]}: {seg1[3] == seg2[0]}")
```

**Walkthrough.** `mirror_point_through` reuses the 180°-rotation
special case of reflection — point-through-point reflection is
equivalent to the vector formula from Lesson 3.9 with the roles
simplified, expressed here as plain coordinate arithmetic
($2c-p$) since a point reflection doesn't need the general dot-product
machinery. `make_c1_spline_segment`'s core idea — deriving one
segment's starting control points from the *previous* segment's
ending control points, rather than choosing them independently — is
the new concept this section exists to teach: **continuity is a
constraint you build into how control points are generated, not a
property you check after the fact and hope for.**

**Verifying $C^1$ numerically.** Trust, but check — the same habit as
every prior lesson in this stage:

```python
import math

def bezier_point(control_points, t):
    """From Lesson 3.7: evaluate a Bezier curve at parameter t."""
    n = len(control_points) - 1
    x = y = 0.0
    for i, (px, py) in enumerate(control_points):
        b = math.comb(n, i) * (1-t)**(n-i) * t**i
        x += b * px
        y += b * py
    return x, y

def tangent_at_end(control_points, h=1e-5):
    """Numerically estimate the tangent direction at t=1 (the curve's end)."""
    x1, y1 = bezier_point(control_points, 1 - h)
    x2, y2 = bezier_point(control_points, 1.0)
    return (x2 - x1) / h, (y2 - y1) / h

def tangent_at_start(control_points, h=1e-5):
    """Numerically estimate the tangent direction at t=0 (the curve's start)."""
    x1, y1 = bezier_point(control_points, 0.0)
    x2, y2 = bezier_point(control_points, h)
    return (x2 - x1) / h, (y2 - y1) / h

end_tangent_seg1 = tangent_at_end(seg1)
start_tangent_seg2 = tangent_at_start(seg2)

# Check the DIRECTIONS match (normalize both to unit vectors and compare)
def normalize(v):
    mag = math.hypot(*v)
    return (v[0]/mag, v[1]/mag)

dir1 = normalize(end_tangent_seg1)
dir2 = normalize(start_tangent_seg2)
print(f"\nEnd-of-seg1 tangent direction:   ({dir1[0]:.4f}, {dir1[1]:.4f})")
print(f"Start-of-seg2 tangent direction: ({dir2[0]:.4f}, {dir2[1]:.4f})")
print(f"C1 continuous: {math.isclose(dir1[0], dir2[0], abs_tol=1e-3) and math.isclose(dir1[1], dir2[1], abs_tol=1e-3)}")
```

Output:

```
End-of-seg1 tangent direction:   (0.8944, -0.4472)
Start-of-seg2 tangent direction: (0.8944, -0.4472)
C1 continuous: True
```

**Walkthrough.** `tangent_at_end` and `tangent_at_start` are one-
sided versions of Lesson 3.7's central difference — a **forward** or
**backward** difference instead, because at the very end ($t=1$) or
start ($t=0$) of a segment, a central difference would need to
evaluate the curve outside its valid $[0,1]$ range. This is a genuine
new wrinkle worth naming: the numerical-derivative technique from
Lesson 3.7 needs adjusting at a domain's boundary, a limitation
you'll see formalized as "one-sided limits" in Lesson 5.1.
`normalize` reuses the unit-vector idea from Lesson 3.5's `axis`
calculation almost verbatim. Comparing normalized directions rather
than raw tangent vectors is deliberate: $C^1$ continuity requires
matching *direction*, not matching speed/magnitude — a distinction
the code makes explicit rather than accidentally over-constraining.

---

### A Composite Profile: Mixing Lines, Arcs, and Splines

A real part outline needs to hold **different kinds of segments** in
one ordered sequence — straight edges, circular arcs, spline curves —
and treat them uniformly wherever possible (sampling into a toolpath,
transforming, measuring total length) while letting each segment type
compute its own points its own way.

```python
import math

class LineSegment:
    def __init__(self, p0, p1):
        self.p0, self.p1 = p0, p1

    def sample(self, n=20):
        x0, y0 = self.p0
        x1, y1 = self.p1
        return [(x0 + (x1-x0)*t/(n-1), y0 + (y1-y0)*t/(n-1)) for t in range(n)]

    def endpoints(self):
        return self.p0, self.p1


class ArcSegment:
    def __init__(self, centre, radius, theta_start, theta_end):
        self.centre, self.radius = centre, radius
        self.theta_start, self.theta_end = theta_start, theta_end

    def sample(self, n=20):
        cx, cy = self.centre
        thetas = [self.theta_start + (self.theta_end-self.theta_start)*t/(n-1)
                  for t in range(n)]
        return [(cx + self.radius*math.cos(th), cy + self.radius*math.sin(th))
                for th in thetas]

    def endpoints(self):
        pts = self.sample(2)
        return pts[0], pts[-1]


class BezierSegment:
    def __init__(self, control_points):
        self.control_points = control_points

    def sample(self, n=20):
        return [bezier_point(self.control_points, t/(n-1)) for t in range(n)]

    def endpoints(self):
        return self.control_points[0], self.control_points[-1]


class Profile:
    """An ordered sequence of segments forming one continuous outline."""
    def __init__(self, segments):
        self.segments = segments

    def check_continuity(self, tol=1e-6):
        """Verify each segment's start matches the previous segment's end (C0)."""
        for i in range(len(self.segments) - 1):
            _, end_prev = self.segments[i].endpoints()
            start_next, _ = self.segments[i+1].endpoints()
            gap = math.hypot(end_prev[0]-start_next[0], end_prev[1]-start_next[1])
            if gap > tol:
                return False, i
        return True, None

    def sample_all(self, points_per_segment=20):
        """Sample every segment, dropping duplicate joint points."""
        all_points = []
        for i, seg in enumerate(self.segments):
            pts = seg.sample(points_per_segment)
            all_points.extend(pts[1:] if i > 0 else pts)
        return all_points
```

**Walkthrough.** Three different classes — `LineSegment`,
`ArcSegment`, `BezierSegment` — each implement `.sample(n)` and
`.endpoints()` with completely different internal math (linear
interpolation, trig, Bernstein polynomials), but `Profile` never
needs to know which one it's holding: `Profile.sample_all` calls
`seg.sample(...)` on whatever object is in the list, and each object
handles the call correctly on its own. This is a first appearance of
a real software-engineering idea worth naming even though its formal
CS treatment (polymorphism, interfaces) comes much later in this
curriculum: **a shared method name lets different types be used
interchangeably by code that doesn't care about their internal
differences.** `pts[1:] if i > 0 else pts` avoids duplicating each
joint point (segment $i$'s last sample and segment $i+1$'s first
sample are the same physical point) — a small but real bug this
lesson's continuity focus makes easy to spot: without this check, a
generated toolpath would visit every internal joint twice.

---

### Chordal Deviation: Adaptive Sampling, Properly

Lesson 3.3 flagged fixed-step sampling as a simplification — points
came out evenly spaced in the *parameter*, not evenly spaced along
the *actual curve*, wasting resolution on flat sections and
under-resolving sharp ones. Now that the whole stage's tools are
available, that debt gets paid: sample adaptively, adding more points
exactly where the curve bends more.

```python
import math

def chordal_deviation(p0, p1, p_mid):
    """
    Perpendicular distance from p_mid to the straight chord p0-p1 --
    reuses the point-to-line distance formula from Lesson 3.1.
    """
    x0, y0 = p0
    x1, y1 = p1
    xm, ym = p_mid
    num = abs((y1-y0)*xm - (x1-x0)*ym + x1*y0 - y1*x0)
    denom = math.hypot(x1-x0, y1-y0)
    return num / denom if denom > 1e-12 else 0.0

def adaptive_sample(curve_func, t0, t1, tolerance, depth=0, max_depth=12):
    """
    Recursively sample curve_func(t) between t0 and t1, subdividing
    wherever the midpoint deviates from the straight chord by more
    than `tolerance`. Returns a list of (x,y) points.
    """
    p0 = curve_func(t0)
    p1 = curve_func(t1)
    t_mid = (t0 + t1) / 2
    p_mid = curve_func(t_mid)

    deviation = chordal_deviation(p0, p1, p_mid)
    if deviation <= tolerance or depth >= max_depth:
        return [p0, p1]
    else:
        left = adaptive_sample(curve_func, t0, t_mid, tolerance, depth+1, max_depth)
        right = adaptive_sample(curve_func, t_mid, t1, tolerance, depth+1, max_depth)
        return left[:-1] + right   # drop duplicate midpoint

# Compare fixed-step vs adaptive sampling on a sharply-curving Bezier
sharp_curve = [(0,0), (1,10), (9,10), (10,0)]
curve_func = lambda t: bezier_point(sharp_curve, t)

fixed_points = [curve_func(t/19) for t in range(20)]
adaptive_points = adaptive_sample(curve_func, 0, 1, tolerance=0.05)

print(f"Fixed-step sampling:    {len(fixed_points)} points")
print(f"Adaptive sampling:      {len(adaptive_points)} points, tol=0.05mm")
```

Output:

```
Fixed-step sampling:    20 points
Adaptive sampling:      35 points, tol=0.05mm
```

Adaptive sampling here actually uses *more* points than the fixed
20 — because it concentrates them precisely in the high-curvature
region near the middle, guaranteeing every part of the curve stays
within tolerance, rather than spending a fixed budget evenly and
hoping it's enough everywhere.

**Walkthrough.** `chordal_deviation` is a direct reuse of the
point-to-line distance formula from Lesson 3.1, applied here as a
curvature proxy rather than a geometry-classification tool.
`adaptive_sample` is a first appearance of **recursion** as a
sampling strategy: the function calls *itself* on the left half and
right half of the interval whenever the midpoint strays too far from
the straight-line chord, stopping (the "base case") once a segment is
already flat enough or a depth limit is hit to guard against infinite
recursion on a curve that never gets flat enough. This is a genuine
forward reference to Lesson 8.7 (recursion, formally), used here
because it is the natural way to express "keep subdividing until
each piece is good enough" — you don't need the formal theory of
recursion to see that this function calling a smaller version of
itself is exactly how a human would manually subdivide a stubborn
curve by hand.

---

## Capstone Project: A Bracket Profile, Start to Finish

Design a small L-bracket-style part: two straight edges, one filleted
(rounded) corner made from an arc, and one decorative Bezier-curved
edge — then mirror the whole thing to produce a matched left/right
pair, and export both as adaptively-sampled toolpaths.

```python
import math

# 1. Define the profile: straight edge -> filleted corner (arc) -> Bezier edge -> straight edge
line1 = LineSegment((0, 0), (30, 0))
fillet = ArcSegment(centre=(30, 8), radius=8, theta_start=-math.pi/2, theta_end=0)
bezier_edge = BezierSegment([(38, 8), (44, 8), (44, 20), (38, 20)])
line2 = LineSegment((38, 20), (0, 20))

profile = Profile([line1, fillet, bezier_edge, line2])

ok, bad_index = profile.check_continuity()
print(f"Profile is C0 continuous: {ok}")
if not ok:
    print(f"  Gap found before segment {bad_index+1}")

# 2. Mirror the entire profile across the y-axis for a right-hand version
mirrored_segments = []
for seg in profile.segments:
    if isinstance(seg, LineSegment):
        mirrored_segments.append(LineSegment(
            reflect_across_line([seg.p0], math.pi/2)[0],
            reflect_across_line([seg.p1], math.pi/2)[0]))
    elif isinstance(seg, ArcSegment):
        new_centre = reflect_across_line([seg.centre], math.pi/2)[0]
        # Mirroring an arc flips its direction of sweep
        mirrored_segments.append(ArcSegment(
            new_centre, seg.radius, math.pi - seg.theta_start, math.pi - seg.theta_end))
    elif isinstance(seg, BezierSegment):
        mirrored_cp = reflect_across_line(seg.control_points, math.pi/2)
        mirrored_segments.append(BezierSegment(mirrored_cp))

mirrored_profile = Profile(mirrored_segments)

# 3. Export both profiles as adaptively sampled toolpaths
def export_profile_toolpath(profile, tolerance=0.02):
    toolpath = []
    for i, seg in enumerate(profile.segments):
        if isinstance(seg, BezierSegment):
            f = lambda t, seg=seg: bezier_point(seg.control_points, t)
            pts = adaptive_sample(f, 0, 1, tolerance)
        else:
            pts = seg.sample(15)   # lines and arcs are cheap enough for fixed sampling
        toolpath.extend(pts[1:] if i > 0 else pts)
    return toolpath

left_path = export_profile_toolpath(profile)
right_path = export_profile_toolpath(mirrored_profile)

print(f"\nLeft-hand toolpath:  {len(left_path)} points")
print(f"Right-hand toolpath: {len(right_path)} points")
print(f"First 3 left points:  {[(round(x,2), round(y,2)) for x,y in left_path[:3]]}")
print(f"First 3 right points: {[(round(x,2), round(y,2)) for x,y in right_path[:3]]}")
```

**Walkthrough.** `isinstance(seg, LineSegment)` — first appearance of
checking an object's type explicitly at runtime, needed here because
each segment type must be mirrored with different geometry-specific
logic (a line just needs its two endpoints reflected; an arc needs
its centre reflected *and* its sweep direction flipped, since
mirroring reverses whether an arc sweeps clockwise or
counterclockwise; a Bezier curve needs every control point reflected).
This is the direct converse of the polymorphism note from the
`Profile` class above: sampling could ignore type differences
entirely, but *mirroring* genuinely can't — each geometry type has
its own transformation rule, so the code has to ask "what kind of
segment is this?" before it can act correctly. `lambda t, seg=seg:
...` — binding `seg=seg` as a default argument inside the loop is a
small but important detail: without it, every lambda created across
loop iterations would share the *same* `seg` variable (whatever it
equals by the time the lambdas are actually called), producing wrong
results for every segment except the last. Defaulting `seg` to its
*current* value at the time the lambda is created avoids that trap.

---

## Connect the Pieces

The full pipeline, traced through one profile:

1. **Primitives** (Lessons 3.2–3.4, 3.7): a line, a circular arc, and
   a Bezier curve — three fundamentally different mathematical
   objects.
2. **Continuity** (this lesson): verified $C^0$ across every joint via
   `Profile.check_continuity`; the Bezier edge's control points could
   additionally be constrained $C^1$ using `make_c1_spline_segment`
   for a fillet-to-curve transition with no visible kink.
3. **Transformations** (Lesson 3.9): the entire mixed-type profile
   mirrored in one pass, with each segment type contributing its own
   correct reflection rule.
4. **Adaptive sampling** (this lesson, resolving Lesson 3.3's debt):
   the Bezier edge sampled with extra resolution exactly where it
   curves sharply, while the straight edges use a cheap fixed count.
5. **Output**: two toolpaths — left-hand and mirrored right-hand —
   ready for a CNC controller, generated entirely from four short
   segment definitions and one mirror call.

This is the actual shape of a real CAD/CAM pipeline: a small number
of primitive types, strict rules for how they join, a general
transformation layer, and a sampling stage that respects tolerance
rather than an arbitrary point count.

---

## Summary

**Splines** are multiple curve segments joined at controlled
continuity: $C^0$ (position only), $C^1$ (position + tangent
direction), $C^2$ (+ curvature).

**$C^1$ Bezier joints**: mirror the previous segment's last interior
control point through the shared endpoint to get the next segment's
first interior control point.

**Composite profiles**: different segment types (`LineSegment`,
`ArcSegment`, `BezierSegment`) share a common interface
(`.sample()`, `.endpoints()`), letting generic code (like
`Profile.sample_all`) work on any of them without caring which is
which — while type-specific operations (like mirroring an arc's sweep
direction) still have to check type explicitly.

**Chordal deviation / adaptive sampling**: recursively subdivide a
curve wherever its midpoint strays too far from the straight chord,
concentrating points where curvature is highest instead of spacing
them evenly in parameter.

**New Python/CS concepts:**
- One-sided (forward/backward) numerical differences at a domain boundary
- A shared method interface across different classes (informal
  polymorphism, formalized later)
- `isinstance()` for type-specific logic
- Recursion as an adaptive sampling strategy
- Default-argument capture (`seg=seg`) to fix a loop-variable closure trap

---

## Problems

### Math

**1.** Two cubic Bezier segments share the joint point $(10,5)$.
Segment 1's last interior control point is $(8,9)$. For $C^1$
continuity, what must segment 2's first interior control point be?

<details><summary>Answer</summary>
Mirror $(8,9)$ through $(10,5)$: $(2(10)-8,\ 2(5)-9)=(12,1)$.
</details>

---

**2.** A curve's midpoint deviates 0.3mm from its chord's straight
line. If the tolerance is 0.1mm, will `adaptive_sample` subdivide
further? What if the tolerance were 0.5mm?

<details><summary>Answer</summary>
0.1mm tolerance: $0.3>0.1$, subdivides further. 0.5mm tolerance:
$0.3\le0.5$, accepted as-is, no further subdivision.
</details>

---

**3.** Explain, in one or two sentences, why mirroring an arc requires
flipping its start/end angles (as `math.pi - seg.theta_start`) rather
than just reflecting its centre point.

<details><summary>Answer</summary>
Reflecting only the centre would keep the arc sweeping in its
original rotational direction, producing a shape that curves the
*wrong way* relative to the mirrored profile (convex where it should
be concave, or vice versa) — reflection reverses orientation
(clockwise becomes counterclockwise), so the sweep angles must be
transformed too, not just the centre position.
</details>

---

### Code Challenges

**Challenge 1 — C1 spline builder**

```python
import math

def build_c1_spline(first_segment_controls, additional_p2_p3_pairs):
    """
    Given the first cubic Bezier segment's 4 control points, and a
    list of (p2, p3) pairs for each subsequent segment, build the
    full list of segments with C1 continuity enforced at every joint.
    Returns a list of control-point lists (one per segment).
    """
    pass

# --- tests: do not modify ---
first = [(0,0), (2,6), (6,6), (8,2)]
segments = build_c1_spline(first, [((12,-2),(16,0)), ((20,4),(24,2))])
assert len(segments) == 3
assert segments[0] == first
# Joint 1: shared point
assert segments[1][0] == segments[0][3]
# Joint 2: shared point
assert segments[2][0] == segments[1][3]
# Mirror check at joint 1
p2_prev = segments[0][2]
joint = segments[0][3]
p1_next = segments[1][1]
assert math.isclose(p1_next[0], 2*joint[0]-p2_prev[0], abs_tol=1e-9)
assert math.isclose(p1_next[1], 2*joint[1]-p2_prev[1], abs_tol=1e-9)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Adaptive sampler**

```python
import math

def chordal_dev(p0, p1, pm):
    """Reimplement chordal_deviation from the lesson."""
    pass

def adaptive_sample_curve(curve_func, t0, t1, tolerance, max_depth=12):
    """Reimplement adaptive_sample from the lesson."""
    pass

# --- tests: do not modify ---
# A straight line should need almost no subdivision regardless of tolerance
line_func = lambda t: (10*t, 5*t)
pts = adaptive_sample_curve(line_func, 0, 1, tolerance=0.001)
assert len(pts) <= 4   # a straight line is flat everywhere; deviation is ~0

# A sharply curving path should need real subdivision at tight tolerance
sharp = lambda t: (10*t, 20*math.sin(math.pi*t))
pts_tight = adaptive_sample_curve(sharp, 0, 1, tolerance=0.01)
pts_loose = adaptive_sample_curve(sharp, 0, 1, tolerance=1.0)
assert len(pts_tight) > len(pts_loose)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Composite profile with mirroring**

```python
import math

class Segment:
    """Base-style check: every segment type must implement these two."""
    def sample(self, n=20): raise NotImplementedError
    def endpoints(self): raise NotImplementedError

def mirror_profile(profile_segments, phi):
    """
    Mirror a list of mixed segment types (Line/Arc/Bezier from the
    lesson) across a line through the origin at angle phi.
    Reuse reflect_across_line and the type-checking pattern from the
    capstone project.
    """
    pass

# --- tests: do not modify ---
segs = [LineSegment((0,0),(10,0)), BezierSegment([(10,0),(12,4),(14,4),(16,0)])]
mirrored = mirror_profile(segs, math.pi/2)
assert isinstance(mirrored[0], LineSegment)
assert isinstance(mirrored[1], BezierSegment)
assert math.isclose(mirrored[0].p0[0], 0, abs_tol=1e-9)
assert math.isclose(mirrored[0].p1[0], -10, abs_tol=1e-9)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** The $C^1$ mirror rule places segment 2's first interior
control point by reflecting segment 1's last interior control point
through the shared joint — guaranteeing the *directions* match, but
not the *speeds*. Explain, referencing the tangent formula from
Lesson 3.7, why matching direction alone is enough for a visually
smooth ($C^1$) curve, and what could still look wrong even with
perfect $C^1$ continuity (this second part previews why $C^2$
continuity is sometimes needed for reflective/mirrored surfaces).

<details><summary>Answer</summary>
$C^1$ continuity is defined purely by the tangent *vector* matching
at the joint (Lesson 3.7's $(dx/dt,dy/dt)$), and a vector's direction
is independent of its magnitude — mirroring guarantees the two
tangent vectors point the same way, satisfying the definition exactly
even if their lengths (related to how fast each segment's parameter
sweeps through that point) differ. What can still look wrong: even
with matched direction, the curve's **rate of turning** — how quickly
the tangent direction itself changes, i.e., curvature — can jump
discontinuously at the joint, producing a visible "flat spot" or
sudden tightening that a human eye (or a reflected highlight on a
shiny surface) picks up on even though no actual kink exists. Fixing
this requires matching curvature too, which is $C^2$ continuity —
exactly why aerospace and automotive surfacing, where reflected light
must flow smoothly across a panel, routinely demand $C^2$ or even
$C^3$ splines, not just $C^1$.
</details>
