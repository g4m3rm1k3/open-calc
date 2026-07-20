# Stage 3, Lesson 3.7 — Parametric Curves
**Threads:** Math · Physics · Engineering
**Estimated time:** 65–75 minutes

---

## What This Lesson Is About

Every curve in Lessons 3.2–3.6 eventually got a parametric form —
$(r\cos t, r\sin t)$ for the circle, $(a\cosh t, b\sinh t)$ for the
hyperbola — but each time, the parametrization was a convenience for
plotting a shape whose "real" definition was an algebraic equation in
$x$ and $y$. This lesson flips that relationship: **the parameter is
the primary definition**, not a plotting trick. A parametric curve is
simply a pair of functions $x(t)$, $y(t)$, and it can trace shapes
that no equation $y=f(x)$ could ever describe — curves that cross
themselves, curves traced by a point on a rolling wheel, and the
control-point curves that every CAD system uses to define smooth
freeform shapes.

Two of the three new curve types in this lesson are not exotic
mathematical curiosities — they are the literal shapes of real
manufactured parts. The **involute of a circle** is the standard
tooth profile of essentially every spur and helical gear made today,
chosen because of a mechanical property (constant velocity ratio)
that this lesson derives directly from the parametrization. The
**cycloid** is the tooth profile used in an older but still-produced
family of gears and clock mechanisms. **Bezier curves** are how every
CAD/CAM system — and this curriculum's own Stage 3 capstone —
represents smooth freeform profiles under direct designer control.

---

## Historical Context

Roulette curves — curves traced by a point on one shape rolling
along another — were studied intensely in the 17th century; the
cycloid in particular was fought over so bitterly by Descartes,
Pascal, Fermat, and the Bernoullis (over who could solve its area,
tangent, and brachistochrone properties first) that it earned the
nickname "the Helen of geometers." The involute's mechanical
importance was established much later: in the 1760s, Leonhard Euler
proved that involute-profiled gear teeth maintain a *constant*
angular velocity ratio between meshing gears even under small
manufacturing or spacing errors — a property no other practical tooth
profile has — which is why the involute became, and remains, the
overwhelming industry standard. Bezier curves are the youngest of the
three: developed independently in the early 1960s by Pierre Bézier at
Renault and Paul de Casteljau at Citroën, both working on
mathematical descriptions of car body panels for computer-aided
design — literally the origin of the CAD field this stage is building
toward.

---

## What You Need To Know First

- **Parametric forms of the conics** — Lessons 3.2–3.5. You've already
  used $(x(t),y(t))$ pairs repeatedly; this lesson names and
  generalizes what you were already doing.
- **Unit circle and radians** — Lesson 2.1. The cycloid and involute
  are both built directly on a rolling/unwinding circle.
- **Toolpath point generation** — Lessons 3.3–3.4. Sampling a
  parametric curve into a discrete point list is a direct reuse.

---

## The Lesson

### Parametric Curves, Generally

A **parametric curve** in the plane is a pair of functions of a
single parameter $t$:

$$x = x(t) \qquad y = y(t) \qquad t \in [t_0, t_1]$$

Unlike $y=f(x)$, a parametric curve can be **multi-valued** —
multiple $t$ values can give the same $x$ but different $y$, letting
the curve loop, cross itself, or double back, none of which a
function graph can do.

**Simple example:** the line segment from $(1,2)$ to $(5,8)$:

$$x(t) = 1 + 4t \qquad y(t) = 2+6t \qquad t\in[0,1]$$

At $t=0$: $(1,2)$. At $t=1$: $(5,8)$. At $t=0.5$: the midpoint,
$(3,5)$ — linear interpolation, exactly the pattern behind every
"lerp" function you'll meet in graphics code from here on.

**Tangent direction.** The instantaneous direction of travel at
parameter $t$ is the vector $(dx/dt, dy/dt)$ — you'll derive this
formally with the chain rule in Lesson 5.5; for now, estimate it
numerically with a small step, the same finite-difference idea used
informally once already for the parabola's reflective property in
Lesson 3.3:

```python
def tangent_direction(x_func, y_func, t, h=1e-6):
    """
    Numerically estimate the tangent direction (dx/dt, dy/dt) at
    parameter t using a central difference: comparing the curve's
    position slightly before and after t.
    """
    dx = (x_func(t + h) - x_func(t - h)) / (2*h)
    dy = (y_func(t + h) - y_func(t - h)) / (2*h)
    return dx, dy

import math
# Check against the circle, whose exact tangent direction is known analytically
r = 5
t0 = math.pi / 3
dx, dy = tangent_direction(lambda t: r*math.cos(t), lambda t: r*math.sin(t), t0)
exact_dx, exact_dy = -r*math.sin(t0), r*math.cos(t0)
print(f"Numeric tangent:  ({dx:.6f}, {dy:.6f})")
print(f"Exact tangent:    ({exact_dx:.6f}, {exact_dy:.6f})")
```

Output:

```
Numeric tangent:  (-4.330127, 2.500000)
Exact tangent:    (-4.330127, 2.500000)
```

**Walkthrough.** The **central difference** `(f(t+h) - f(t-h)) /
(2*h)` is a first appearance of numerical differentiation: it
estimates a rate of change by comparing two nearby points straddling
$t$, rather than one point ahead of it (a "forward difference," also
possible but slightly less accurate). This is not yet a derivative in
the formal sense Lesson 5.3 will define — it's a numerical
approximation used here because the exact derivative machinery
doesn't exist in this curriculum yet, but the approximation is
accurate enough to build real geometry with, as the near-exact match
above confirms. `lambda t: r*math.cos(t)` is a reappearance of the
lambda syntax for a small inline function — you've used it before for
short callbacks; passing one as an argument to `tangent_direction` is
the same idea, now used to keep the curve's definition compact.

---

### The Cycloid

A **cycloid** is the path traced by a point on the rim of a circle of
radius $r$ as it rolls without slipping along a straight line.

**Derivation sketch.** After the circle has rolled through angle $t$
(radians), its centre has moved a horizontal distance equal to the
arc length rolled, $rt$ (no-slip means arc length rolled = distance
travelled). The rim point's position relative to the centre is
$(-r\sin t, -r\cos t)$ (rotated by $t$ from its starting position at
the bottom). Adding the centre's position:

$$x(t) = r(t - \sin t) \qquad y(t) = r(1-\cos t)$$

**Manufacturing relevance.** Cycloidal gear teeth (as opposed to the
now-dominant involute profile) are generated using this exact curve
as the tooth flank, and remain standard in certain pump and clock
gear trains where their rolling-contact properties are preferred.

```python
import numpy as np
import matplotlib.pyplot as plt

def cycloid(r, t):
    """Position on a cycloid generated by a circle of radius r, at parameter t."""
    x = r * (t - np.sin(t))
    y = r * (1 - np.cos(t))
    return x, y

r = 2
t = np.linspace(0, 4*np.pi, 400)   # two full rolls
x, y = cycloid(r, t)

fig, ax = plt.subplots(figsize=(10, 4))
ax.plot(x, y, color='#2980b9', lw=2.5, label='Cycloid')
ax.axhline(0, color='#333', lw=1)

# Show the generating circle at a few positions, to make the rolling motion visible
theta_circ = np.linspace(0, 2*np.pi, 100)
for t_snap in [0, np.pi, 2*np.pi, 3*np.pi]:
    cx = r * t_snap   # centre has moved r*t_snap horizontally
    cy = r
    ax.plot(cx + r*np.cos(theta_circ), cy + r*np.sin(theta_circ),
            color='#ccc', lw=1, linestyle=':')
    px, py = cycloid(r, t_snap)
    ax.plot(px, py, 'o', color='#e74c3c', markersize=6, zorder=5)

ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.legend(fontsize=9)
ax.set_title(f'Cycloid, generating circle r={r}', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
plt.tight_layout()
plt.show()
```

**Walkthrough.** `r * (t - np.sin(t))` and `r * (1 - np.cos(t))` are
direct code translations of the derivation above — no new syntax.
Plotting the generating circle at several snapshot positions
(`cx = r * t_snap`, matching the same no-slip distance formula) and
marking the traced point on each is new *as a visualization
technique*, not as math: it makes the rolling motion legible by
showing several instants of it at once, the same idea as a stroboscope
photograph.

---

### The Involute of a Circle

Imagine a taut string wound around a circle of radius $r$, with a
pencil at its end. **Unwinding** the string while keeping it taut
traces the **involute of the circle**.

**Derivation sketch.** After unwinding through angle $t$, the length
of string that has come free equals the arc length that used to be
wrapped there, $rt$. The pencil sits at the end of a straight segment
of that length, tangent to the circle at the point where the string
leaves it. Working out the geometry (the tangent point is at angle
$t$ around the circle, and the pencil extends perpendicular to the
radius at that point, a distance $rt$ further out):

$$x(t) = r(\cos t + t\sin t) \qquad y(t) = r(\sin t - t\cos t)$$

**Why this exact curve is the gear-tooth standard.** The involute has
a property no other practical curve shares: when two gears with
involute-profiled teeth mesh, the line of contact between them is
always tangent to both base circles at the same fixed angle (the
*pressure angle*) — meaning the ratio of angular velocities between
the two gears stays exactly constant throughout the mesh, even if the
centre distance between the gears is slightly off from nominal (a
manufacturing or assembly tolerance that is unavoidable in practice).
Non-involute tooth profiles generally lose this property under any
spacing error, producing vibration and uneven wear.

```python
import numpy as np
import matplotlib.pyplot as plt

def involute(r, t):
    """Position on the involute of a circle of radius r, at parameter t."""
    x = r * (np.cos(t) + t*np.sin(t))
    y = r * (np.sin(t) - t*np.cos(t))
    return x, y

r_base = 3
t = np.linspace(0, 2.5*np.pi, 300)
x, y = involute(r_base, t)

fig, ax = plt.subplots(figsize=(8, 8))
theta_circ = np.linspace(0, 2*np.pi, 100)
ax.plot(r_base*np.cos(theta_circ), r_base*np.sin(theta_circ),
        color='#27ae60', lw=1.5, linestyle='--', label='Base circle')
ax.plot(x, y, color='#2980b9', lw=2.5, label='Involute')

# Show the taut "string" at one instant, t = 1.5 rad
t_snap = 1.5
tx, ty = r_base*np.cos(t_snap), r_base*np.sin(t_snap)   # point on circle where string leaves
px, py = involute(r_base, t_snap)                        # pencil position
ax.plot([tx, px], [ty, py], color='#e74c3c', lw=1.2, label='"String" (tangent segment)')
ax.plot(px, py, 'o', color='#e74c3c', markersize=8, zorder=5)

ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.legend(fontsize=9)
ax.set_title(f'Involute of a circle, r={r_base}', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
plt.tight_layout()
plt.show()

# Verify the "string" segment is tangent to the base circle and has length r*t_snap
string_length = math.hypot(px - tx, py - ty)
print(f"String length at t={t_snap}: {string_length:.4f} (expected r*t = {r_base*t_snap:.4f})")
```

Output:

```
String length at t=1.5: 4.5000 (expected r*t = 4.5000)
```

**Walkthrough.** Everything here reuses prior tools — `np.cos`,
`np.sin`, `math.hypot` (Lesson 3.4) — applied to a new formula. The
one new idea is the verification itself: confirming the "string"
segment's length matches $rt$ exactly is a direct numerical check
that the derivation's geometric claim (unwound length = previously
wrapped arc length) actually holds in the code, the same
sanity-check habit used throughout Lessons 3.4–3.5.

---

### Bezier Curves

A **Bezier curve** is defined not by an equation but by a small set
of **control points** that pull the curve toward them without the
curve necessarily passing through all of them (only the first and
last). This is the representation nearly every CAD/CAM and vector
graphics system uses for freeform curves, because designers can shape
a curve intuitively by dragging control points rather than editing
an equation.

**Quadratic Bezier** (3 control points $P_0,P_1,P_2$):

$$B(t) = (1-t)^2P_0 + 2(1-t)tP_1 + t^2P_2 \qquad t\in[0,1]$$

**Cubic Bezier** (4 control points, the most common in practice):

$$B(t) = (1-t)^3P_0 + 3(1-t)^2tP_1 + 3(1-t)t^2P_2 + t^3P_3$$

These coefficients — $(1-t)^3$, $3(1-t)^2t$, and so on — are
**Bernstein polynomials**; the general degree-$n$ Bezier curve with
control points $P_0,\dots,P_n$ is

$$B(t) = \sum_{i=0}^n \binom{n}{i}(1-t)^{n-i}t^i P_i$$

directly recognizable as the binomial theorem's coefficient pattern
(Lesson 6.1 will name $\binom{n}{i}$ formally as "$n$ choose $i$";
here it's used as a known counting formula already familiar from
Pascal's triangle).

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def bezier_curve(control_points, num_points=200):
    """
    Evaluate a Bezier curve of any degree from its control points,
    using the general Bernstein polynomial formula.
    control_points: list of (x, y) tuples.
    """
    n = len(control_points) - 1   # degree
    t_values = np.linspace(0, 1, num_points)
    curve = []
    for t in t_values:
        x, y = 0.0, 0.0
        for i, (px, py) in enumerate(control_points):
            bernstein = math.comb(n, i) * (1-t)**(n-i) * t**i
            x += bernstein * px
            y += bernstein * py
        curve.append((x, y))
    return curve

control_points = [(0, 0), (2, 8), (6, 8), (8, 0)]   # cubic, 4 points
curve = bezier_curve(control_points)

fig, ax = plt.subplots(figsize=(9, 6))
cx = [p[0] for p in control_points]
cy = [p[1] for p in control_points]
ax.plot(cx, cy, 'o--', color='#e74c3c', markersize=8, lw=1,
        label='Control polygon')
curve_x = [p[0] for p in curve]
curve_y = [p[1] for p in curve]
ax.plot(curve_x, curve_y, color='#2980b9', lw=2.5, label='Bezier curve')

ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.legend(fontsize=9)
ax.set_title('Cubic Bezier curve and its control polygon', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
plt.tight_layout()
plt.show()
```

**Walkthrough.** `math.comb(n, i)` is a first appearance: it computes
the binomial coefficient $\binom{n}{i}$ — "$n$ choose $i$" — directly,
without you having to implement factorials by hand; you'll meet the
combinatorial *meaning* of this quantity properly in Lesson 6.1, but
its formula ($\frac{n!}{i!(n-i)!}$) is exactly the Bernstein
polynomial's coefficient, so using the library function now avoids
re-deriving something you'll formally learn a few stages from here.
`for i, (px, py) in enumerate(control_points)` combines two things
you've each seen separately before: `enumerate` (giving both an
index and a value while looping) and tuple-unpacking directly inside
a `for` target (`(px, py)` pulling both coordinates out of each
control point tuple in one step) — the combination is new, but each
half is a reappearance. The nested loop structure — outer loop over
$t$, inner loop over control points — computes a full weighted sum
for every single output point, an $O(n\cdot\text{num\_points})$ cost
that's fine for a handful of control points but is exactly the kind
of nested-loop cost Lesson 8.8 will teach you to name and reason
about formally.

**SE lens.** `bezier_curve` works for *any* number of control points
because it never hard-codes "3" or "4" anywhere — the degree $n$ is
derived from `len(control_points) - 1`, and the Bernstein formula
scales automatically. The alternative — writing a separate
`quadratic_bezier` and `cubic_bezier` function, each with the
specific formula spelled out — would be faster to read for a
beginner but would need a new function every time a designer wanted
a 5-point curve; the general version costs a small amount of
extra abstraction (the `math.comb` call, the nested loop) in exchange
for handling every degree without new code, a tradeoff CAD systems
consistently make in the real thing.

---

### Manufacturing Application: Generating a Gear Tooth Toolpath from the Involute

Cutting or 3D-printing a gear tooth from its involute profile means
converting the parametric curve into a concrete sequence of toolpath
points — the same sampling idea used for the parabolic reflector
(Lesson 3.3) and the elliptical pocket (Lesson 3.4), applied here to
a curve with no algebraic $y=f(x)$ form at all, which is exactly why
the parametric representation matters: some real manufactured
profiles simply don't have a non-parametric equation to fall back on.

```python
import numpy as np

def involute_tooth_profile(r_base, t_start, t_end, n_points=50):
    """
    Generate toolpath points along one flank of a gear tooth,
    using the involute of the base circle between two parameter values.
    """
    t = np.linspace(t_start, t_end, n_points)
    x, y = involute(r_base, t)
    return list(zip(x, y))

r_base = 20   # mm
# One tooth flank, from the base circle out to the tooth tip
flank = involute_tooth_profile(r_base, t_start=0.1, t_end=0.9, n_points=20)

print(f"Involute tooth flank: {len(flank)} toolpath points\n")
for x, y in flank[:3]:
    print(f"  X{x:7.3f} Y{y:7.3f}")
print("  ...")
for x, y in flank[-2:]:
    print(f"  X{x:7.3f} Y{y:7.3f}")

# Distance from base circle centre to each point -- should increase monotonically
# (further unwinding = further from centre) as a sanity check on the profile
radii = [math.hypot(x, y) for x, y in flank]
print(f"\nRadius increases monotonically: {all(radii[i] < radii[i+1] for i in range(len(radii)-1))}")
```

**Walkthrough.** `all(radii[i] < radii[i+1] for i in
range(len(radii)-1))` is a first appearance of `all()` combined with
a **generator expression** — `radii[i] < radii[i+1] for i in
range(...)` produces a stream of `True`/`False` values (one per
consecutive pair), and `all()` checks that every single one is
`True`, short-circuiting to `False` at the first failure. This is a
compact, idiomatic way to express "check a condition across an entire
sequence" without writing an explicit loop with a flag variable — a
pattern you'll use constantly for validation checks from here
forward. The check itself matters physically: an involute profile
genuinely should move monotonically outward as it unwinds further, so
a monotonic radius sequence is a real sanity check that the generated
toolpath is geometrically sound, not just a stylistic assertion.

---

## Connect the Pieces

Concrete trace: a 20mm base-radius gear, one tooth flank.

1. **Parametric definition**: $x(t)=r(\cos t+t\sin t)$,
   $y(t)=r(\sin t-t\cos t)$ — a curve with no $y=f(x)$ equivalent.
2. **Tangent direction**: at any $t$, `tangent_direction` (or the
   exact derivative, once Stage 5 provides it) gives the cutting
   tool's required orientation at that point on the flank.
3. **Sampling**: `involute_tooth_profile` turns the continuous curve
   into 20 discrete $(x,y)$ points between $t=0.1$ and $t=0.9$.
4. **Verification**: the monotonic-radius check confirms the sampled
   points trace a geometrically sensible profile before that toolpath
   is ever sent to a real machine.

The cycloid and Bezier sections follow the identical
define-parametrically → plot → sample-into-toolpath pipeline; the
involute was traced end-to-end here because it's the profile you're
most likely to actually manufacture.

---

## Summary

**Parametric curve:** $x(t), y(t)$ — more general than $y=f(x)$; can
represent self-intersecting or non-function curves.

**Tangent direction:** $(dx/dt, dy/dt)$, estimated numerically here
via central difference; formalized in Lesson 5.5.

**Cycloid:** $x=r(t-\sin t)$, $y=r(1-\cos t)$ — traced by a point on
a rolling circle; used in some gear and clock mechanisms.

**Involute of a circle:** $x=r(\cos t+t\sin t)$, $y=r(\sin t-t\cos
t)$ — the standard modern gear-tooth profile, chosen for its constant
velocity-ratio property under spacing tolerance.

**Bezier curve:** $B(t)=\sum\binom{n}{i}(1-t)^{n-i}t^iP_i$ — the
control-point representation behind CAD/CAM freeform curves.

**New Python/CS concepts:**
- Central difference numerical derivative estimate
- `math.comb(n, i)` — binomial coefficient (forward reference to Lesson 6.1)
- `enumerate` combined with tuple-unpacking in a `for` target
- `all(... for ...)` with a generator expression for sequence-wide checks

---

## Problems

### Math

**1.** Find the position and tangent direction (exact, via the
formulas given, not numerically) of the cycloid $x=2(t-\sin t)$,
$y=2(1-\cos t)$ at $t=\pi$.

<details><summary>Answer</summary>
Position: $x=2(\pi-0)=2\pi$, $y=2(1-(-1))=4$ — the highest point of
the arch. $dx/dt=2(1-\cos t)=2(1-(-1))=4$. $dy/dt=2\sin t=0$. Tangent
direction $(4,0)$ — horizontal, matching the peak of the arch where
the curve is momentarily moving purely sideways.
</details>

---

**2.** A gear's base circle has radius 15mm. How much string has
unwound (equivalently, what is the straight-line "string" length)
when the involute parameter is $t=2$ radians?

<details><summary>Answer</summary>
Length $=rt=15\times2=30\text{mm}$.
</details>

---

**3.** For the quadratic Bezier with $P_0=(0,0)$, $P_1=(4,6)$,
$P_2=(8,0)$, find $B(0.5)$.

<details><summary>Answer</summary>
$B(0.5)=(0.5)^2P_0+2(0.5)(0.5)P_1+(0.5)^2P_2 = 0.25(0,0)+0.5(4,6)+0.25(8,0)$
$=(0,0)+(2,3)+(2,0)=(4,3)$.
</details>

---

### Code Challenges

**Challenge 1 — General parametric sampler**

```python
import math

def sample_parametric(x_func, y_func, t_start, t_end, n_points):
    """
    Sample any parametric curve into a list of (x,y) toolpath points.
    Should work identically for cycloid, involute, or any other
    x(t), y(t) pair.
    """
    pass

# --- tests: do not modify ---
pts = sample_parametric(lambda t: 5*math.cos(t), lambda t: 5*math.sin(t),
                          0, 2*math.pi, 100)
assert len(pts) == 100
assert math.isclose(pts[0][0], 5, abs_tol=1e-6)
for x, y in pts:
    assert math.isclose(x**2 + y**2, 25, abs_tol=1e-6)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Involute pressure angle check**

```python
import math

def involute_point(r, t):
    """Reimplement the involute(r, t) function from the lesson."""
    pass

def string_length_at(r, t):
    """Distance from the involute point back to the tangent point on the circle."""
    pass

# --- tests: do not modify ---
r = 10
for t in [0.5, 1.0, 2.0]:
    length = string_length_at(r, t)
    assert math.isclose(length, r*t, abs_tol=1e-6)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Bezier curve evaluator**

```python
import math

def bezier_point(control_points, t):
    """Evaluate a single point on a Bezier curve of any degree at parameter t."""
    pass

# --- tests: do not modify ---
# Linear Bezier (2 points) should just be a straight-line lerp
p = bezier_point([(0,0), (10,10)], 0.3)
assert math.isclose(p[0], 3, abs_tol=1e-9)
assert math.isclose(p[1], 3, abs_tol=1e-9)

# Quadratic from Problem 3 above
p2 = bezier_point([(0,0),(4,6),(8,0)], 0.5)
assert math.isclose(p2[0], 4, abs_tol=1e-9)
assert math.isclose(p2[1], 3, abs_tol=1e-9)

# Endpoints always match P0 and Pn exactly
p3 = bezier_point([(1,1),(5,9),(9,2),(3,3)], 0.0)
assert p3 == (1, 1)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove that every Bezier curve begins exactly at $P_0$ and
ends exactly at $P_n$, directly from the Bernstein polynomial formula
(not just by observing it in code).

<details><summary>Answer</summary>
At $t=0$: every term $\binom{n}{i}(1-t)^{n-i}t^i$ with $i>0$ contains
a factor of $t^i=0$, vanishing. Only $i=0$ survives:
$\binom{n}{0}(1-0)^n(0)^0P_0 = 1\cdot1\cdot1\cdot P_0=P_0$ (using the
convention $0^0=1$). So $B(0)=P_0$. By the symmetric argument at
$t=1$: every term with $i<n$ contains a factor of $(1-t)^{n-i}=0$,
leaving only $i=n$: $\binom{n}{n}(1-1)^0(1)^nP_n=P_n$. So $B(1)=P_n$.
$\blacksquare$
</details>
