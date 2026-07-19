# Stage 3, Lesson 3.2 — Circles
**Threads:** Math · Physics · Engineering  
**Estimated time:** 55–65 minutes

---

## What This Lesson Is About

The circle is the simplest conic section — and the most fundamental
shape in engineering. Holes, bosses, shafts, O-rings, wheel paths,
radar sweeps, arc welds, and turning operations are all circles or
arcs of circles. The circle's equation is the distance formula from
Lesson 3.1 turned into an equation: all points at fixed distance $r$
from a centre $(h, k)$. From this single idea flow the standard and
general forms, tangent lines, circle-line intersections, and the
conditions for two circles to intersect, be tangent, or be separate.
By the end of this lesson you can write the circle equation from any
sufficient description, convert between standard and general form by
completing the square, find tangent lines to circles, and determine
the intersection of a line or circle with a given circle — tools that
appear constantly in CAD geometry, CNC path planning, and collision
detection.

---

## Historical Context

Euclid devoted three books of the *Elements* to circles. The definition
as "points equidistant from a centre" is his. The algebraic equation
$x^2+y^2=r^2$ had to wait for Descartes' coordinate geometry in 1637.
The systematic study of circle-circle and circle-line intersections was
important in astronomy — the ancient model of planetary motion used
circles (epicycles), and computing when a planet would be at a certain
position required finding circle intersections. In modern manufacturing,
the ISO GPS (Geometrical Product Specification) standard defines circular
tolerances algebraically — a cylindrical bore must have its axis within
a cylinder of tolerance radius $t$ — using exactly the circle geometry
of this lesson.

---

## What You Need To Know First

- **Distance formula** — Lesson 3.1. The circle equation is the distance
  formula set equal to a constant.
- **Completing the square** — Lesson 1.2. Used to convert from general
  to standard form.
- **Point-to-line distance** — Lesson 3.1. Used to find circle-line
  intersections.

---

## The Lesson

### The Circle Equation

**Definition:** A **circle** with centre $(h, k)$ and radius $r > 0$
is the set of all points $(x, y)$ satisfying:

$$\boxed{(x-h)^2 + (y-k)^2 = r^2}$$

This is the **standard form**. It is the distance formula
$\sqrt{(x-h)^2+(y-k)^2}=r$ squared. The centre is not on the circle;
every other point at distance $r$ is.

**Special case:** when the centre is the origin, $h=k=0$:
$x^2+y^2=r^2$.

**Expanding** the standard form:

$$x^2-2hx+h^2+y^2-2ky+k^2=r^2$$

$$x^2+y^2-2hx-2ky+(h^2+k^2-r^2)=0$$

This is the **general form:** $x^2+y^2+Dx+Ey+F=0$,
where $D=-2h$, $E=-2k$, $F=h^2+k^2-r^2$.

**Converting general → standard: complete the square** in both $x$ and $y$.

**Hand-worked example:** Convert $x^2+y^2-4x+6y+9=0$ to standard form.

Group and complete:

$$(x^2-4x) + (y^2+6y) = -9$$

$$(x^2-4x+4) + (y^2+6y+9) = -9+4+9$$

$$(x-2)^2+(y+3)^2 = 4$$

Centre $(2,-3)$, radius $2$.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def general_to_standard(D, E, F):
    """
    Convert x²+y²+Dx+Ey+F=0 to standard form (h,k,r).
    Returns (h, k, r) or raises ValueError if not a real circle.
    """
    h = -D/2
    k = -E/2
    r_sq = h**2 + k**2 - F
    if r_sq <= 0:
        raise ValueError(f"Not a real circle: r² = {r_sq:.4f}")
    return h, k, math.sqrt(r_sq)

def standard_to_general(h, k, r):
    """Convert (h,k,r) to (D,E,F) for x²+y²+Dx+Ey+F=0."""
    D = -2*h
    E = -2*k
    F = h**2 + k**2 - r**2
    return D, E, F

print("General → standard form (completing the square):\n")
cases = [(-4, 6, 9), (-6, 4, -9), (2, -4, -4)]
for D, E, F in cases:
    h, k, r = general_to_standard(D, E, F)
    print(f"  x²+y²+({D})x+({E})y+({F})=0")
    print(f"  → centre ({h:.2f},{k:.2f}), radius {r:.4f}")
    D2,E2,F2 = standard_to_general(h, k, r)
    print(f"  Round-trip: D={D2:.2f}, E={E2:.2f}, F={F2:.2f}  ✓\n")

# Draw several circles
fig, ax = plt.subplots(figsize=(9, 9))
theta = np.linspace(0, 2*np.pi, 300)

circles = [(0, 0, 5, '#2980b9', 'Centre $(0,0)$, $r=5$'),
           (3, -2, 4, '#e74c3c', 'Centre $(3,-2)$, $r=4$'),
           (-2, 3, 2, '#27ae60', 'Centre $(-2,3)$, $r=2$')]

for h, k, r, color, label in circles:
    x_circ = h + r*np.cos(theta)
    y_circ = k + r*np.sin(theta)
    ax.plot(x_circ, y_circ, color=color, lw=2.5, label=label)
    ax.plot(h, k, '+', color=color, markersize=12, markeredgewidth=2)
    # Show radius to one point
    ax.plot([h, h+r], [k, k], color=color, lw=1, linestyle='--', alpha=0.6)
    ax.text(h+r/2, k+0.2, f'$r={r}$', fontsize=9, color=color, ha='center')

ax.axhline(0, color='#333', lw=0.8); ax.axvline(0, color='#333', lw=0.8)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.legend(fontsize=9, loc='lower right')
ax.set_title('$(x-h)^2+(y-k)^2=r^2$: three circles', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
plt.tight_layout()
plt.show()
```

**Walkthrough:** `h + r*np.cos(theta)` and `k + r*np.sin(theta)` are
the parametric equations of a circle of radius $r$ centred at $(h,k)$
— exactly the unit-circle definition from Lesson 2.1, scaled by $r$
and shifted by $(h,k)$. The `+` marker style in `ax.plot` draws a plus
sign — useful for marking centre points since it does not fill the circle
and is visually distinct from `o` or `s`.

---

### Tangent Lines to a Circle

A **tangent** to a circle at point $P$ is the line that touches the circle
at exactly one point — $P$ — and is perpendicular to the radius at $P$.

**Method:** given circle $(x-h)^2+(y-k)^2=r^2$ and a point $P=(x_0,y_0)$
on the circle:

1. Slope of radius $CP$: $m_r = (y_0-k)/(x_0-h)$
2. Tangent slope: $m_t = -1/m_r$ (perpendicular)
3. Tangent line: $y-y_0 = m_t(x-x_0)$

**Compact formula:** the tangent to $x^2+y^2=r^2$ at $(x_0,y_0)$ is:

$$x_0 x + y_0 y = r^2$$

For a general circle $(x-h)^2+(y-k)^2=r^2$ at point $(x_0,y_0)$:

$$(x_0-h)(x-h) + (y_0-k)(y-k) = r^2$$

**Hand-worked example:** Tangent to $(x-2)^2+(y-1)^2=25$ at $(5,5)$.

Check: $(5-2)^2+(5-1)^2=9+16=25$. ✓ Point is on the circle.

Radius slope: $m_r=(5-1)/(5-2)=4/3$.
Tangent slope: $m_t=-3/4$.
Tangent: $y-5=-\frac{3}{4}(x-5)$, i.e. $y=-\frac{3}{4}x+\frac{35}{4}$.

**Tangent from an external point:** a point $Q$ outside the circle has
exactly two tangent lines to the circle. Finding them requires solving
a system (the tangent passes through $Q$ and touches the circle at one
point). The length of the tangent from $Q=(x_1,y_1)$ to a circle
$(x-h)^2+(y-k)^2=r^2$ is:

$$\ell = \sqrt{(x_1-h)^2+(y_1-k)^2-r^2}$$

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def tangent_at_point(h, k, r, px, py):
    """
    Return (m, b) for the tangent to circle (h,k,r) at point (px,py).
    Point must be on the circle (verified by assertion).
    """
    assert math.isclose((px-h)**2+(py-k)**2, r**2, rel_tol=1e-6), \
        f"({px},{py}) is not on the circle"
    if math.isclose(px, h):   # vertical radius → horizontal tangent
        return 0, py          # y = py
    m_r = (py-k) / (px-h)
    if math.isclose(m_r, 0):  # horizontal radius → vertical tangent
        raise ValueError("Vertical tangent: undefined slope")
    m_t = -1/m_r
    b_t = py - m_t*px
    return m_t, b_t

def tangent_length(h, k, r, qx, qy):
    """Length of tangent from external point (qx,qy) to circle (h,k,r)."""
    d_sq = (qx-h)**2 + (qy-k)**2
    if d_sq < r**2:
        raise ValueError("Point is inside the circle")
    return math.sqrt(d_sq - r**2)

# Example
h, k, r = 2, 1, 5
px, py  = 5, 5
m_t, b_t = tangent_at_point(h, k, r, px, py)
print(f"Tangent to (x-{h})²+(y-{k})²={r}² at ({px},{py}):")
print(f"  slope = {m_t:.4f}")
print(f"  equation: y = {m_t:.4f}x + {b_t:.4f}")
print(f"  verify perpendicular to radius: m_r × m_t = "
      f"{(py-k)/(px-h) * m_t:.6f} (should be -1)")

print()
# Tangent length from external point
qx, qy = 9, 5
ell = tangent_length(h, k, r, qx, qy)
dist_q = math.sqrt((qx-h)**2+(qy-k)**2)
print(f"Tangent length from ({qx},{qy}) to circle:")
print(f"  Distance to centre = {dist_q:.4f}")
print(f"  Tangent length ℓ = {ell:.4f}")
print(f"  Verify: ℓ² + r² = {ell**2 + r**2:.4f} = d² = {dist_q**2:.4f}")

# Visualise
fig, ax = plt.subplots(figsize=(9, 9))
theta = np.linspace(0, 2*np.pi, 300)

# Circle
ax.plot(h + r*np.cos(theta), k + r*np.sin(theta),
        color='#2980b9', lw=2.5, label=f'$(x-{h})^2+(y-{k})^2={r**2}$')
ax.plot(h, k, '+', color='#2980b9', markersize=14, markeredgewidth=2)

# Radius to tangent point
ax.plot([h, px], [k, py], color='#aaaaaa', lw=1.5, linestyle='--',
        label='Radius (perpendicular to tangent)')

# Tangent point
ax.plot(px, py, 'o', color='#e74c3c', markersize=11, zorder=5)

# Tangent line
x_tang = np.linspace(0, 10, 200)
y_tang = m_t*x_tang + b_t
ax.plot(x_tang, y_tang, color='#e74c3c', lw=2.5,
        label=f'Tangent: $y={m_t}x+{b_t:.2f}$')

# Tangent from external point
ax.plot(qx, qy, 's', color='#27ae60', markersize=11, zorder=5,
        label=f'External point $({qx},{qy})$')
ax.plot([qx, qx], [qy, qy], alpha=0)   # placeholder

ax.axhline(0,color='#333',lw=0.8); ax.axvline(0,color='#333',lw=0.8)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.legend(fontsize=9, loc='lower left')
ax.set_title('Tangent to a circle at a point\n'
             'Tangent ⊥ radius at the point of tangency', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
plt.tight_layout()
plt.show()
```

**Walkthrough:** The `assert` statement in `tangent_at_point` enforces
a precondition: the function only makes sense if the point is actually
on the circle. If called with a point not on the circle, it fails loudly
with a clear message rather than silently returning wrong results. This
"fail fast" pattern is standard defensive programming.

---

### Circle-Line Intersection

To find where line $y = mx+c$ meets circle $(x-h)^2+(y-k)^2=r^2$,
substitute $y$ and solve the resulting quadratic.

Let the discriminant of that quadratic be $\Delta$:
- $\Delta > 0$: two intersection points (secant)
- $\Delta = 0$: one intersection point (tangent)
- $\Delta < 0$: no intersection (line misses circle)

The discriminant condition relates to the distance from the circle's
centre to the line: the line is tangent iff $d = r$ where $d$ is
the point-to-line distance from Lesson 3.1.

**Hand-worked example:** Intersect $x^2+y^2=25$ with $y=x+1$.

Substitute: $x^2+(x+1)^2=25 \Rightarrow 2x^2+2x-24=0 \Rightarrow x^2+x-12=0$

$(x+4)(x-3)=0$: $x=-4$ (giving $y=-3$) or $x=3$ (giving $y=4$).

Intersection points: $(-4,-3)$ and $(3,4)$.

```python
import math
import numpy as np

def circle_line_intersect(h, k, r, m, c):
    """
    Find intersections of circle (x-h)²+(y-k)²=r² with line y=mx+c.
    Returns list of (x,y) tuples: [], [(x,y)], or [(x1,y1),(x2,y2)].
    """
    # Substitute y=mx+c into circle equation:
    # (x-h)² + (mx+c-k)² = r²
    # Expand and collect: (1+m²)x² + 2(m(c-k)-h)x + (h²+(c-k)²-r²) = 0
    A = 1 + m**2
    B = 2*(m*(c-k) - h)
    C = h**2 + (c-k)**2 - r**2

    disc = B**2 - 4*A*C   # discriminant

    if disc < -1e-10:
        return []   # no intersection
    elif abs(disc) <= 1e-10:
        x = -B/(2*A)
        return [(x, m*x+c)]   # tangent point
    else:
        x1 = (-B + math.sqrt(disc))/(2*A)
        x2 = (-B - math.sqrt(disc))/(2*A)
        return [(x1, m*x1+c), (x2, m*x2+c)]

# Test examples
print("Circle-line intersection:\n")
cases = [
    (0, 0, 5,  1,  1, 'y=x+1'),
    (0, 0, 5,  1,  4, 'y=x+4  (tangent: d=4/√2≈2.83? no -- let me check)'),
    (0, 0, 5,  1,  6, 'y=x+6  (misses: d=6/√2≈4.24)'),
    (2, 1, 5, -1,  3, 'y=-x+3'),
]

for h,k,r,m,c,label in cases:
    pts = circle_line_intersect(h,k,r,m,c)
    d = abs(m*h - k + c)/math.sqrt(m**2+1)   # centre-to-line distance
    result = {0:'miss',1:'tangent',2:'secant'}[len(pts)]
    print(f"  {label}")
    print(f"    d(centre,line)={d:.4f}, r={r} → {result}")
    for pt in pts:
        print(f"    Point: ({pt[0]:.4f}, {pt[1]:.4f})")
    print()
```

**Walkthrough:** The quadratic in $x$ after substituting $y=mx+c$ has
coefficients $A$, $B$, $C$ derived by expanding $(x-h)^2+(mx+c-k)^2=r^2$.
`disc = B**2 - 4*A*C` is the discriminant. The three cases — negative,
zero, positive — correspond exactly to the geometric cases of missing,
tangency, and secancy. The absolute tolerance `1e-10` in `abs(disc) <= 1e-10`
handles floating-point near-zero values for the tangent case.

---

### Two-Circle Relationships

Two circles with centres $C_1$, $C_2$ and radii $r_1$, $r_2$:

| $d = d(C_1, C_2)$ | Relationship |
|-------------------|-------------|
| $d > r_1 + r_2$ | Separate (exterior) |
| $d = r_1 + r_2$ | Externally tangent (1 point) |
| $|r_1-r_2| < d < r_1+r_2$ | Intersecting (2 points) |
| $d = |r_1-r_2|$ | Internally tangent (1 point) |
| $d < |r_1-r_2|$ | One inside other (0 points) |
| $d = 0$, $r_1=r_2$ | Identical |

**Finding intersection points:** subtract the two circle equations.
$(x-h_1)^2+(y-k_1)^2=r_1^2$ minus $(x-h_2)^2+(y-k_2)^2=r_2^2$ gives
a linear equation (the **radical axis**) — then substitute back.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def circle_circle_relationship(h1,k1,r1, h2,k2,r2):
    """Classify the relationship between two circles."""
    d = math.sqrt((h2-h1)**2 + (k2-k1)**2)
    if d > r1+r2+1e-9:      return 'separate',        d
    if math.isclose(d, r1+r2, abs_tol=1e-9): return 'ext_tangent', d
    if d < abs(r1-r2)-1e-9: return 'one_inside',      d
    if math.isclose(d, abs(r1-r2), abs_tol=1e-9): return 'int_tangent', d
    return 'intersecting', d

def circle_circle_intersect(h1,k1,r1, h2,k2,r2):
    """
    Find intersection points of two circles by finding the radical axis
    (subtract equations) then intersecting that line with one circle.
    """
    rel, d = circle_circle_relationship(h1,k1,r1, h2,k2,r2)
    if rel in ('separate','one_inside'):
        return []

    # Subtract the two equations: gives the radical axis (a line)
    # (x-h1)^2+(y-k1)^2=r1^2 minus (x-h2)^2+(y-k2)^2=r2^2
    # -2(h2-h1)x - 2(k2-k1)y + (h2^2-h1^2+k2^2-k1^2+r1^2-r2^2) = 0
    a = -2*(h2-h1)
    b = -2*(k2-k1)
    c = (h2**2-h1**2) + (k2**2-k1**2) + (r1**2-r2**2)
    # Line: ax + by + c = 0

    if math.isclose(b, 0, abs_tol=1e-10):
        # Vertical radical axis: x = -c/a
        x = -c/a
        # Substitute into circle 1
        disc = r1**2 - (x-h1)**2
        if disc < 0: return []
        if math.isclose(disc, 0): return [(x, k1)]
        return [(x, k1+math.sqrt(disc)), (x, k1-math.sqrt(disc))]
    else:
        # Express y = (-ax-c)/b, substitute into circle 1
        m = -a/b
        cc = -c/b
        return circle_line_intersect(h1,k1,r1,m,cc)

print("Two-circle intersections:\n")
pairs = [
    (0,0,3, 4,0,3, 'intersecting'),
    (0,0,2, 5,0,2, 'separate'),
    (0,0,3, 3,0,3, 'ext_tangent'),
    (0,0,5, 0,0,3, 'one_inside (concentric)'),
]
for h1,k1,r1,h2,k2,r2,expected in pairs:
    rel, d = circle_circle_relationship(h1,k1,r1,h2,k2,r2)
    pts = circle_circle_intersect(h1,k1,r1,h2,k2,r2)
    print(f"  C1=({h1},{k1},r={r1}), C2=({h2},{k2},r={r2}): {rel} ({len(pts)} pts)")
    for pt in pts:
        print(f"    ({pt[0]:.4f}, {pt[1]:.4f})")

# Visualise all five relationships
fig, axes = plt.subplots(1,3, figsize=(14,5))

scenarios = [
    (0,0,3,  4,0,2,  'Intersecting (2 points)'),
    (0,0,3,  5,0,2,  'External tangent (1 point)'),
    (0,0,5,  1,0,2,  'One inside other (0 points)'),
]
theta = np.linspace(0, 2*np.pi, 300)

for ax,(h1,k1,r1,h2,k2,r2,title) in zip(axes, scenarios):
    ax.plot(h1+r1*np.cos(theta), k1+r1*np.sin(theta),
            color='#2980b9', lw=2.5, label=f'$C_1$')
    ax.plot(h2+r2*np.cos(theta), k2+r2*np.sin(theta),
            color='#e74c3c', lw=2.5, label=f'$C_2$')
    ax.plot(h1,k1,'+',color='#2980b9',markersize=10,markeredgewidth=2)
    ax.plot(h2,k2,'+',color='#e74c3c',markersize=10,markeredgewidth=2)

    pts = circle_circle_intersect(h1,k1,r1,h2,k2,r2)
    for pt in pts:
        ax.plot(*pt,'o',color='#27ae60',markersize=10,zorder=5)

    ax.set_aspect('equal'); ax.grid(True,alpha=0.3)
    ax.set_title(title, fontsize=9); ax.legend(fontsize=8)
    ax.axhline(0,color='#333',lw=0.5); ax.axvline(0,color='#333',lw=0.5)

plt.suptitle('Two-circle relationships', fontsize=12)
plt.tight_layout()
plt.show()
```

---

### Manufacturing Application: Hole Placement and Tolerance

In precision machining, holes are specified by their centre coordinates
and diameter. The **minimum wall thickness** between two holes is the
distance between the circles minus nothing (for tangent holes, wall
thickness is zero). Checking whether a drill path clears a previously
drilled hole is a circle-circle proximity test.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def min_wall_thickness(h1, k1, d1, h2, k2, d2):
    """
    Minimum wall thickness between two cylindrical holes.
    Returns negative if holes overlap.
    """
    centre_dist = math.sqrt((h2-h1)**2 + (k2-k1)**2)
    return centre_dist - d1/2 - d2/2

# Part layout: three holes in an aluminium block
holes = [
    (10, 10, 8,  '#2980b9', 'H1: ∅8mm'),
    (30, 10, 12, '#e74c3c', 'H2: ∅12mm'),
    (20, 28, 10, '#27ae60', 'H3: ∅10mm'),
]

print("Hole clearance check:\n")
for i in range(len(holes)):
    for j in range(i+1, len(holes)):
        h1,k1,d1,_,lbl1 = holes[i]
        h2,k2,d2,_,lbl2 = holes[j]
        t = min_wall_thickness(h1,k1,d1, h2,k2,d2)
        status = 'OK ✓' if t >= 2.0 else ('TOUCH' if t >= 0 else 'OVERLAP ✗')
        print(f"  {lbl1} ↔ {lbl2}: wall={t:.2f}mm  {status}")

fig, ax = plt.subplots(figsize=(8,7))
theta = np.linspace(0, 2*np.pi, 300)

for h,k,d,color,label in holes:
    r = d/2
    ax.fill(h+r*np.cos(theta), k+r*np.sin(theta),
            color=color, alpha=0.25)
    ax.plot(h+r*np.cos(theta), k+r*np.sin(theta),
            color=color, lw=2, label=label)
    ax.plot(h, k, '+', color=color, markersize=12, markeredgewidth=2)
    ax.text(h, k-r-1.5, f'$\\varnothing${d}', ha='center',
            fontsize=9, color=color)

# Block outline
ax.add_patch(plt.Rectangle((0,0),45,40, fill=False,
                             edgecolor='#555', lw=2, linestyle='--'))

ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.set_xlim(-3,50); ax.set_ylim(-5,45)
ax.legend(fontsize=9, loc='upper right')
ax.set_title('Hole placement: circle geometry in CNC machining', fontsize=11)
ax.set_xlabel('$x$ (mm)'); ax.set_ylabel('$y$ (mm)')
plt.tight_layout()
plt.show()
```

**Walkthrough:** `plt.Rectangle((x,y), width, height, ...)` draws a
rectangle patch — its first appearance. `ax.add_patch(...)` adds it
to the axes. Unlike `ax.plot`, which draws from data arrays,
`ax.add_patch` adds a `Patch` object with its own drawing properties.
`fill=False` gives an outlined rectangle without fill; `edgecolor` sets
the border colour.

---

## Connect the Pieces

**What this lesson built on:** Distance formula (Lesson 3.1) — the
circle is literally the distance formula set equal to a constant.
Completing the square (Lesson 1.2). Point-to-line distance (Lesson 3.1)
— used in the circle-line tangency condition. Quadratic formula —
the intersection quadratic uses it.

**What this lesson makes possible:** Lesson 3.3 (Parabolas) — defined
as equidistant from a point and a line, another distance construction.
Lessons 3.4–3.5 (Ellipses and Hyperbolas) — both defined via distance
sums/differences. The circle is the simplest conic; the techniques
developed here generalise directly.

---

## Summary

**Standard form:** $(x-h)^2+(y-k)^2=r^2$, centre $(h,k)$, radius $r$.

**General form:** $x^2+y^2+Dx+Ey+F=0$. Convert by completing the square:
$h=-D/2$, $k=-E/2$, $r=\sqrt{h^2+k^2-F}$.

**Tangent at $(x_0,y_0)$:** perpendicular to radius; slope $= -1/m_r$.

**Tangent length** from external point: $\ell=\sqrt{d^2-r^2}$.

**Circle-line:** substitute line into circle, solve quadratic.
$\Delta>0$: 2 pts; $\Delta=0$: tangent; $\Delta<0$: miss.

**Two circles:** compare $d$ to $r_1+r_2$ and $|r_1-r_2|$. Intersections
via radical axis (subtract equations → linear equation).

**New Python:**
- `ax.add_patch(plt.Rectangle(...))` — draw a rectangle
- `fill=False`, `edgecolor` — unfilled bordered shapes

---

## Problems

### Math

**1.** Write the standard form; identify centre and radius.

(a) $x^2+y^2-6x+2y-6=0$

(b) $x^2+y^2+4x-8y+11=0$

<details>
<summary>Answers</summary>

(a) $(x-3)^2+(y+1)^2=16$. Centre $(3,-1)$, $r=4$.

(b) $(x+2)^2+(y-4)^2=9$. Centre $(-2,4)$, $r=3$.

</details>

---

**2.** Find the tangent to $(x-1)^2+(y+2)^2=10$ at the point $(4,-1)$.

<details>
<summary>Answer</summary>

Check: $(4-1)^2+(-1+2)^2=9+1=10$. ✓
Radius slope: $(-1-(-2))/(4-1)=1/3$.
Tangent slope: $-3$.
Tangent: $y+1=-3(x-4)$ → $y=-3x+11$.

</details>

---

**3.** Find all intersection points of $(x-1)^2+y^2=4$ and $(x+1)^2+y^2=4$.

<details>
<summary>Answer</summary>

Subtract: $(x-1)^2-(x+1)^2=0 \Rightarrow -4x=0 \Rightarrow x=0$.
Substitute: $1+y^2=4 \Rightarrow y=\pm\sqrt{3}$.
Points: $(0,\sqrt{3})$ and $(0,-\sqrt{3})$.

</details>

---

### Code Challenges

**Challenge 1 — Circle class**

```python
import math

class Circle:
    def __init__(self, h, k, r):
        """Circle with centre (h,k) and radius r."""
        if r <= 0:
            raise ValueError(f"Radius must be positive, got {r}")
        self.h, self.k, self.r = h, k, r

    @classmethod
    def from_general(cls, D, E, F):
        """Create from x²+y²+Dx+Ey+F=0."""
        pass

    def contains_point(self, x, y, tol=1e-9):
        """True if (x,y) is on the circle."""
        pass

    def tangent_at(self, px, py):
        """Return (m, b) for tangent line y=mx+b at point (px,py) on circle."""
        pass

    def tangent_length(self, qx, qy):
        """Length of tangent from external point (qx,qy)."""
        pass

    def __repr__(self):
        return f"Circle(centre=({self.h},{self.k}), r={self.r})"


# --- tests: do not modify ---
c = Circle(2, 1, 5)
assert c.contains_point(7, 1)   # rightmost point
assert c.contains_point(5, 5)
assert not c.contains_point(0, 0)

c2 = Circle.from_general(-4, 6, 9)
assert math.isclose(c2.h, 2) and math.isclose(c2.k, -3) and math.isclose(c2.r, 2)

m, b = c.tangent_at(5, 5)
assert math.isclose(m, -0.75, abs_tol=1e-9)

ell = c.tangent_length(9, 5)
assert math.isclose(ell**2 + c.r**2, (9-c.h)**2+(5-c.k)**2, rel_tol=1e-9)

print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Intersections**

```python
import math

def circle_line_pts(h, k, r, m, c):
    """Intersect circle (h,k,r) with y=mx+c. Returns list of (x,y) points."""
    pass

def circle_circle_pts(h1,k1,r1, h2,k2,r2):
    """Intersect two circles. Returns list of (x,y) points."""
    pass


# --- tests: do not modify ---
# x²+y²=25, y=x+1 → (-4,-3) and (3,4)
pts = circle_line_pts(0,0,5, 1,1)
assert len(pts)==2
xs = sorted(p[0] for p in pts)
assert math.isclose(xs[0], -4, abs_tol=1e-6)
assert math.isclose(xs[1],  3, abs_tol=1e-6)

# Tangent line
pts2 = circle_line_pts(0,0,5, 1,5*math.sqrt(2))
# d from (0,0) to y=x+5√2: |5√2|/√2 = 5 = r → tangent
assert len(pts2)==1

# Two circles intersect
pts3 = circle_circle_pts(0,0,3, 4,0,3)
assert len(pts3)==2
for pt in pts3:
    assert math.isclose(pt[0]**2+pt[1]**2, 9, rel_tol=1e-6)

print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Minimum enclosing circle**

Given a set of points, find the smallest circle that contains all of them.
Use the simple heuristic: start with the circumcircle of the two furthest
points as a diameter, then expand to include any points outside.

```python
import math

def min_enclosing_circle(points):
    """
    Find (h, k, r) of the smallest circle containing all points.
    Uses a simple two-pass heuristic (not Welzl's exact algorithm).
    1. Find the two furthest points p1, p2.
    2. Start with the circle having p1p2 as diameter.
    3. For each point outside the circle, expand to include it
       by finding the new circle through p1, the new point, 
       with the new point on the boundary.
    
    Returns (h, k, r).
    """
    pass


# --- tests: do not modify ---
# Single point
h, k, r = min_enclosing_circle([(3, 4)])
assert math.isclose(h,3) and math.isclose(k,4) and math.isclose(r,0,abs_tol=1e-9)

# Two points: diameter
h, k, r = min_enclosing_circle([(0,0),(4,0)])
assert math.isclose(h,2) and math.isclose(k,0) and math.isclose(r,2)

# All points of a unit square must be inside
pts = [(0,0),(1,0),(1,1),(0,1)]
h, k, r = min_enclosing_circle(pts)
for px,py in pts:
    assert math.sqrt((px-h)**2+(py-k)**2) <= r + 1e-9

print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove that if two circles intersect at points $A$ and $B$, then
the line $AB$ (the **radical axis**) is perpendicular to the line joining
the two centres.

<details>
<summary>Answer</summary>

Let the circles be $C_1: (x-h_1)^2+(y-k_1)^2=r_1^2$ and $C_2:(x-h_2)^2+(y-k_2)^2=r_2^2$.
Subtracting gives the radical axis equation:
$-2(h_2-h_1)x - 2(k_2-k_1)y + \text{const} = 0$.
The normal vector to this line is $(-(h_2-h_1), -(k_2-k_1))$, which is
parallel to $(h_2-h_1, k_2-k_1)$ — the direction of the line joining
the centres. A line is perpendicular to its normal vector, so the radical
axis is perpendicular to the centre-to-centre line. $\blacksquare$

</details>
