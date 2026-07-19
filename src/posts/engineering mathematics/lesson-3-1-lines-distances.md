# Stage 3, Lesson 3.1 — Lines and Distances in the Plane
**Threads:** Math · Physics · CS  
**Estimated time:** 55–65 minutes

---

## What This Lesson Is About

Stage 3 is Analytic Geometry — the study of geometric objects using
algebraic equations. Every curve that appears in engineering
(paths, profiles, cross-sections, tolerances) lives in the coordinate
plane and has an equation. This lesson establishes the foundations:
the distance formula, the line equation in its several forms, the
relationship between slopes of parallel and perpendicular lines, the
distance from a point to a line, and line intersections. These are the
tools that make everything else in Stage 3 possible — circles, parabolas,
ellipses, and hyperbolas are all defined through distance relationships,
so the distance machinery here is essential. By the end of this lesson
you can write the equation of a line from any sufficient description,
find distances between points and from points to lines, determine
whether two lines are parallel or perpendicular, and find their
intersection — building blocks that appear constantly in CAD, CNC
path planning, and collision detection.

---

## Historical Context

Analytic geometry was invented simultaneously and independently by René
Descartes and Pierre de Fermat around 1637. Descartes published first
in his *La Géométrie*, an appendix to his philosophical work *Discourse
on the Method*. The key insight — that every geometric curve has an
algebraic equation and every algebraic equation has a geometric curve —
unified the two previously separate branches of mathematics. The
Cartesian coordinate system is named after Descartes. Fermat, who
worked in private and did not publish systematically, arguably understood
the relationship between algebra and geometry more deeply, but Descartes
got the credit. The practical payoff was immediate: geometric problems
that had required elaborate proofs with ruler and compass could now be
solved by algebraic manipulation.

---

## What You Need To Know First

- **The Cartesian plane** — Lesson 0.4.
- **Functions** — Lesson 0.6. A line $y = mx+b$ is a function.
- **Pythagorean theorem** — the distance formula is its direct application.
- **$\arctan 2$** — Lesson 2.4. Angles of lines use this.

---

## The Lesson

### Distance Between Two Points

The distance between $(x_1, y_1)$ and $(x_2, y_2)$ is the length of
the hypotenuse of the right triangle with legs $\Delta x = x_2 - x_1$
and $\Delta y = y_2 - y_1$:

$$d = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$$

The **midpoint** of the segment:

$$M = \left(\frac{x_1+x_2}{2},\ \frac{y_1+y_2}{2}\right)$$

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def distance(p1, p2):
    """Euclidean distance between points p1=(x1,y1) and p2=(x2,y2)."""
    return math.sqrt((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2)

def midpoint(p1, p2):
    return ((p1[0]+p2[0])/2, (p1[1]+p2[1])/2)

print("Distance and midpoint examples:\n")
pairs = [((0,0),(3,4)), ((1,2),(4,6)), ((-1,3),(2,-1)), ((2,3),(8,7))]
print(f"{'P1':>12}  {'P2':>12}  {'Distance':>10}  {'Midpoint':>16}")
print("-" * 58)
for p1, p2 in pairs:
    d = distance(p1, p2)
    m = midpoint(p1, p2)
    print(f"  {str(p1):>10}  {str(p2):>10}  {d:>10.4f}  {str(m):>16}")

# Visualise with triangle
fig, ax = plt.subplots(figsize=(8, 6))
p1, p2 = (1, 2), (5, 5)
m = midpoint(p1, p2)
d = distance(p1, p2)

ax.plot(*zip(p1, p2), 'o-', color='#2980b9', lw=2.5, markersize=9)
ax.plot([p1[0], p2[0]], [p1[1], p1[1]], color='#e74c3c', lw=1.5,
        linestyle='--', label=f'$\\Delta x = {p2[0]-p1[0]}$')
ax.plot([p2[0], p2[0]], [p1[1], p2[1]], color='#27ae60', lw=1.5,
        linestyle='--', label=f'$\\Delta y = {p2[1]-p1[1]}$')
ax.plot(*m, 's', color='#8e44ad', markersize=10, zorder=5,
        label=f'Midpoint {m}')

ax.annotate(f'$P_1{p1}$', p1, xytext=(-0.5, -0.3), textcoords='offset points',
            fontsize=10, ha='right')
ax.annotate(f'$P_2{p2}$', p2, xytext=(5, 5), textcoords='offset points',
            fontsize=10)
ax.text((p1[0]+p2[0])/2 - 0.4, (p1[1]+p2[1])/2 + 0.1,
        f'$d = {d:.2f}$', fontsize=11, color='#2980b9', fontweight='bold')

ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.legend(fontsize=9)
ax.set_title('Distance formula: $d = \\sqrt{\\Delta x^2 + \\Delta y^2}$', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
plt.tight_layout()
plt.show()
```

**Walkthrough:** `ax.plot(*zip(p1, p2), ...)` uses two new idioms together.
`zip(p1, p2)` pairs the $x$-coordinates and $y$-coordinates: `((1,5),(2,5))`.
`*zip(p1,p2)` unpacks that into two arguments, giving `ax.plot([1,5],[2,5],...)`
— the list of $x$-values followed by the list of $y$-values. This is a
compact pattern for plotting a line segment between two points.

---

### Forms of the Line Equation

Every non-vertical line can be written in several equivalent forms.

**Slope-intercept:** $y = mx + b$, where $m$ is the slope and $b$ the
$y$-intercept. The slope:

$$m = \frac{\Delta y}{\Delta x} = \frac{y_2-y_1}{x_2-x_1} = \tan\theta$$

where $\theta$ is the angle the line makes with the positive $x$-axis.

**Point-slope:** $y - y_1 = m(x - x_1)$ — useful when you have a point
and a slope.

**Two-point form:** given $(x_1,y_1)$ and $(x_2,y_2)$:
$$y - y_1 = \frac{y_2-y_1}{x_2-x_1}(x-x_1)$$

**Standard (general) form:** $ax + by + c = 0$ — works for all lines
including vertical ones ($b=0$, giving $ax+c=0 \Rightarrow x=-c/a$).

**Intercept form:** $\dfrac{x}{p} + \dfrac{y}{q} = 1$ — where $p$ is
the $x$-intercept and $q$ the $y$-intercept (neither zero).

**Hand-worked examples:**

(a) Line through $(2,1)$ and $(5,7)$: slope $= (7-1)/(5-2) = 2$.
Point-slope: $y-1 = 2(x-2)$, so $y = 2x - 3$.

(b) Line through $(1,3)$ perpendicular to $y = -\frac{1}{2}x + 4$:
perpendicular slope $= 2$. Point-slope: $y-3 = 2(x-1)$, so $y = 2x+1$.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def line_from_two_points(p1, p2):
    """Return (m, b) for y = mx + b through p1 and p2."""
    if math.isclose(p2[0]-p1[0], 0):
        raise ValueError("Vertical line: undefined slope")
    m = (p2[1]-p1[1]) / (p2[0]-p1[0])
    b = p1[1] - m*p1[0]
    return m, b

def line_from_point_slope(p, m):
    """Return (m, b) for y = mx + b through point p with slope m."""
    return m, p[1] - m*p[0]

def line_intersection(m1, b1, m2, b2):
    """
    Find intersection of y=m1x+b1 and y=m2x+b2.
    Returns (x, y) or None if parallel.
    """
    if math.isclose(m1, m2):
        return None   # parallel (or identical)
    x = (b2 - b1) / (m1 - m2)
    y = m1*x + b1
    return x, y

# Examples
print("Line equations:\n")

m, b = line_from_two_points((2,1),(5,7))
print(f"Through (2,1) and (5,7): y = {m}x + {b}")

m2, b2 = line_from_point_slope((3,2), -1/m)   # perpendicular through (3,2)
print(f"Perpendicular at (3,2):   y = {m2}x + {b2:.4f}")

pt = line_intersection(m, b, m2, b2)
print(f"Intersection: {pt}")

# Visualise a family of lines
fig, ax = plt.subplots(figsize=(9, 6))
x = np.linspace(-2, 7, 300)

# Main line
y_main = m*x + b
ax.plot(x, y_main, color='#2980b9', lw=2.5, label=f'$y={m}x+{b}$ (slope {m})')

# Perpendicular
y_perp = m2*x + b2
ax.plot(x, y_perp, color='#e74c3c', lw=2, linestyle='--',
        label=f'$y={m2}x+{b2:.2f}$ (perp, slope {m2})')

# Parallel through (0,2)
m_par, b_par = m, 2
y_par = m_par*x + b_par
ax.plot(x, y_par, color='#27ae60', lw=1.5, linestyle=':',
        label=f'$y={m_par}x+{b_par}$ (parallel)')

# Mark key points
ax.plot(*pt, 'o', color='#8e44ad', markersize=12, zorder=5,
        label=f'Intersection {tuple(round(v,2) for v in pt)}')
ax.plot(2,1,'s',color='#2980b9',markersize=9,zorder=5)
ax.plot(5,7,'s',color='#2980b9',markersize=9,zorder=5)

ax.axhline(0,color='#333',lw=0.8); ax.axvline(0,color='#333',lw=0.8)
ax.set_ylim(-4, 10); ax.set_aspect('equal')
ax.legend(fontsize=9, loc='upper left'); ax.grid(True, alpha=0.3)
ax.set_title('Parallel and perpendicular lines', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
plt.tight_layout()
plt.show()
```

**Walkthrough:** `line_intersection` solves $m_1x+b_1 = m_2x+b_2$ for
$x$ by rearranging: $(m_1-m_2)x = b_2-b_1$, so $x=(b_2-b_1)/(m_1-m_2)$.
`math.isclose(m1, m2)` catches the parallel case where the denominator
would be zero. `tuple(round(v,2) for v in pt)` rounds each coordinate
to 2 decimal places for display — a generator expression inside `tuple()`.

---

### Parallel and Perpendicular Lines

Two lines $y = m_1 x + b_1$ and $y = m_2 x + b_2$:

**Parallel:** $m_1 = m_2$ (and $b_1 \neq b_2$, else they are the same line)

**Perpendicular:** $m_1 \cdot m_2 = -1$, i.e., $m_2 = -1/m_1$

*Proof of perpendicularity condition:* if one line rises 1 unit for
every $m$ units right, the perpendicular falls $m$ units for every 1
unit right (rotate the direction vector $90°$: $(1, m) \to (-m, 1)$).
The slope of the rotated direction is $1/(-m) = -1/m$. $\blacksquare$

**Note:** vertical lines ($x = c$) are perpendicular to horizontal
lines ($y = k$). The slope of a vertical line is undefined; the formula
$m_1 m_2 = -1$ handles only the non-vertical case.

---

### Distance from a Point to a Line

Given a line $ax + by + c = 0$ and a point $(x_0, y_0)$:

$$d = \frac{|ax_0 + by_0 + c|}{\sqrt{a^2 + b^2}}$$

**Derivation sketch:** The shortest path from a point to a line is
along the perpendicular. The formula comes from parameterising that
perpendicular and finding where it meets the line.

**Converting to standard form:** if the line is $y = mx + k$, write
it as $mx - y + k = 0$, so $a=m$, $b=-1$, $c=k$:

$$d = \frac{|mx_0 - y_0 + k|}{\sqrt{m^2+1}}$$

**Hand-worked example:** Distance from $(3, 1)$ to $3x - 4y + 5 = 0$:

$$d = \frac{|3(3) - 4(1) + 5|}{\sqrt{9+16}} = \frac{|9-4+5|}{5} = \frac{10}{5} = 2$$

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def point_to_line_distance(x0, y0, a, b, c):
    """Distance from point (x0,y0) to line ax+by+c=0."""
    return abs(a*x0 + b*y0 + c) / math.sqrt(a**2 + b**2)

def closest_point_on_line(x0, y0, a, b, c):
    """
    Find the point on line ax+by+c=0 closest to (x0,y0).
    Drop a perpendicular from (x0,y0) to the line.
    """
    # The foot of the perpendicular
    denom = a**2 + b**2
    xf = x0 - a*(a*x0 + b*y0 + c)/denom
    yf = y0 - b*(a*x0 + b*y0 + c)/denom
    return xf, yf

print("Point-to-line distances:\n")
examples = [
    (3, 1,  3, -4,  5, '3x-4y+5=0'),
    (0, 0,  4, -3, 10, '4x-3y+10=0'),
    (2, 3,  1, -1,  0, 'x-y=0 (y=x)'),
    (5, 0, -1,  0,  3, '-x+3=0 (x=3)'),
]
print(f"{'Point':>10}  {'Line':>16}  {'Distance':>10}")
print("-" * 42)
for x0,y0,a,b,c,label in examples:
    d = point_to_line_distance(x0,y0,a,b,c)
    print(f"  ({x0},{y0:>2})   {label:>14}  {d:>10.4f}")

# Visualise distance for one example
fig, ax = plt.subplots(figsize=(8, 7))
a, b, c = 3, -4, 5
x0, y0 = 3, 1
xf, yf = closest_point_on_line(x0, y0, a, b, c)
d = point_to_line_distance(x0, y0, a, b, c)

x = np.linspace(-1, 5, 300)
# Line 3x-4y+5=0  =>  y = (3x+5)/4
y_line = (3*x + 5) / 4
ax.plot(x, y_line, color='#2980b9', lw=2.5, label='$3x-4y+5=0$')

# Point and its foot
ax.plot(x0, y0, 'o', color='#e74c3c', markersize=12, zorder=5,
        label=f'Point $(3, 1)$')
ax.plot(xf, yf, 's', color='#27ae60', markersize=10, zorder=5,
        label=f'Foot $({xf:.2f}, {yf:.2f})$')

# Perpendicular segment
ax.plot([x0, xf], [y0, yf], color='#e74c3c', lw=2, linestyle='--')
ax.text((x0+xf)/2 + 0.1, (y0+yf)/2 + 0.1,
        f'$d = {d:.1f}$', fontsize=12, color='#e74c3c', fontweight='bold')

# Right-angle marker at foot
perp_dir = np.array([x0-xf, y0-yf])
perp_dir = perp_dir / np.linalg.norm(perp_dir) * 0.2
# np.linalg.norm: Euclidean norm (length) of a vector array -- first appearance
line_dir = np.array([-b, a]) / math.sqrt(a**2+b**2) * 0.2
corner = np.array([xf, yf])
ax.plot([corner[0]+perp_dir[0], corner[0]+perp_dir[0]+line_dir[0],
         corner[0]+line_dir[0]],
        [corner[1]+perp_dir[1], corner[1]+perp_dir[1]+line_dir[1],
         corner[1]+line_dir[1]], color='#555', lw=1)

ax.axhline(0,color='#333',lw=0.8); ax.axvline(0,color='#333',lw=0.8)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.legend(fontsize=10)
ax.set_title('Distance from point to line\n'
             '$d = |ax_0+by_0+c|/\\sqrt{a^2+b^2}$', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
plt.tight_layout()
plt.show()
```

**Walkthrough:** `np.linalg.norm(v)` computes the Euclidean length of
a vector array — its first appearance. `norm([3,4])` returns 5. It is
used here to normalise the perpendicular direction to unit length before
scaling it to draw the right-angle marker. `np.linalg` is the linear
algebra submodule of numpy; `linalg.norm` is the most frequently used
function from it.

---

### The Perpendicular Bisector

The **perpendicular bisector** of segment $P_1P_2$ is the set of all
points equidistant from $P_1$ and $P_2$. It passes through the midpoint
of $P_1P_2$ and has slope $-1/m_{P_1P_2}$.

**Application — circumcircle:** the centre of the circle through three
points is the intersection of the perpendicular bisectors of any two
of the three segments formed by the points.

```python
import math

def perpendicular_bisector(p1, p2):
    """
    Return (m, b) for the perpendicular bisector of segment P1P2.
    Line: y = mx + b.
    """
    mx, my = (p1[0]+p2[0])/2, (p1[1]+p2[1])/2   # midpoint
    seg_slope = (p2[1]-p1[1]) / (p2[0]-p1[0])
    perp_slope = -1/seg_slope
    b = my - perp_slope*mx
    return perp_slope, b

def circumcircle(p1, p2, p3):
    """
    Find centre (cx, cy) and radius r of the circle through p1, p2, p3.
    Intersection of the perpendicular bisectors of P1P2 and P1P3.
    """
    m1, b1 = perpendicular_bisector(p1, p2)
    m2, b2 = perpendicular_bisector(p1, p3)
    cx, cy = line_intersection(m1, b1, m2, b2)
    r = distance((cx, cy), p1)
    return cx, cy, r

# Test: find circumcircle of a triangle
p1, p2, p3 = (0,0), (4,0), (0,3)
cx, cy, r = circumcircle(p1, p2, p3)
print(f"Circumcircle of (0,0), (4,0), (0,3):")
print(f"  Centre: ({cx:.4f}, {cy:.4f})")
print(f"  Radius: {r:.4f}")
print(f"  Verify distances: {distance((cx,cy),p1):.4f}, "
      f"{distance((cx,cy),p2):.4f}, {distance((cx,cy),p3):.4f}")
```

**Walkthrough:** `circumcircle` finds where two perpendicular bisectors
meet — the circumcentre — by calling `line_intersection` from earlier
in the lesson. This is the prototype of the pattern that appears
throughout Stage 3: define a geometric object (the circumcircle) by
a distance condition (equidistant from three points), translate that
into algebra (perpendicular bisectors), and solve (line intersection).

---

## Connect the Pieces

**What this lesson built on:** Pythagorean theorem — the distance formula
is its coordinate form. Functions (Lesson 0.6) — $y=mx+b$ is a linear
function. Trigonometry — slope $m = \tan\theta$ and perpendicular slopes
use rotation (which is trig). Vectors (Lesson 2.8) — the vector from
$P_1$ to $P_2$ is $(x_2-x_1, y_2-y_1)$, and the perpendicularity
condition $m_1m_2=-1$ is the dot product being zero.

**What this lesson makes possible:** Lesson 3.2 (Circles) — a circle
is defined as all points at fixed distance from a centre, using the
distance formula directly. Every subsequent conic section in Stage 3
uses the distance formula and line equations established here. Stage 4
(Linear Algebra) — systems of line equations are matrix equations.

**In manufacturing:** tolerance zones in CNC are often point-to-line
distances. Straightness tolerance on a machined edge is the maximum
distance from any point on the edge to the ideal line. Perpendicularity
tolerance between two faces uses exactly the perpendicular slope condition.

---

## Summary

**Distance:** $d = \sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$. **Midpoint:**
$M=\left(\frac{x_1+x_2}{2},\frac{y_1+y_2}{2}\right)$.

**Line forms:**
- Slope-intercept: $y = mx+b$
- Point-slope: $y-y_1 = m(x-x_1)$
- Standard: $ax+by+c=0$

**Slope:** $m=(y_2-y_1)/(x_2-x_1)=\tan\theta$.

**Parallel:** $m_1=m_2$. **Perpendicular:** $m_1m_2=-1$.

**Point-to-line distance:** $d=|ax_0+by_0+c|/\sqrt{a^2+b^2}$.

**New Python:**
- `*zip(p1, p2)` — unpack zipped coordinates for `ax.plot`
- `np.linalg.norm(v)` — Euclidean length of a vector

---

## Problems

### Math

**1.** Find the equation of the line satisfying each condition.

(a) Through $(-2, 5)$ with slope $-3$

(b) Through $(1,-1)$ and $(4,5)$

(c) Through $(2,3)$, perpendicular to $y=\frac{1}{4}x-7$

<details>
<summary>Answers</summary>

(a) $y-5=-3(x+2)$ → $y=-3x-1$

(b) $m=(5-(-1))/(4-1)=2$; $y+1=2(x-1)$ → $y=2x-3$

(c) Perp slope $=-4$; $y-3=-4(x-2)$ → $y=-4x+11$

</details>

---

**2.** Find the distance from the origin to the line $5x-12y+26=0$.

<details>
<summary>Answer</summary>

$d=|5(0)-12(0)+26|/\sqrt{25+144}=26/13=2$.

</details>

---

**3.** Three vertices of a triangle are $A=(0,0)$, $B=(6,0)$, $C=(2,4)$.

(a) Find the equation of each side.

(b) Find the perpendicular bisectors of $AB$ and $BC$.

(c) Find the circumcentre (intersection of the bisectors).

(d) Verify that the circumcentre is equidistant from all three vertices.

<details>
<summary>Answers</summary>

(a) $AB$: $y=0$; $BC$: slope$=(4-0)/(2-6)=-1$, $y=-x+6$;
$CA$: slope$=4/2=2$, $y=2x$.

(b) Bisector of $AB$: midpoint$(3,0)$, slope undefined (perp to
horizontal is vertical): $x=3$.
Bisector of $BC$: midpoint$(4,2)$, perp slope$=1$: $y-2=1(x-4)$, $y=x-2$.

(c) $x=3$, $y=3-2=1$. Circumcentre: $(3,1)$.

(d) $d(A)=\sqrt{9+1}=\sqrt{10}$, $d(B)=\sqrt{9+1}=\sqrt{10}$,
$d(C)=\sqrt{1+9}=\sqrt{10}$. ✓ All equal $\sqrt{10}$.

</details>

---

### Code Challenges

**Challenge 1 — Line toolkit**

```python
import math

def slope(p1, p2):
    """Slope of the line through p1 and p2. Returns None for vertical line."""
    pass

def line_equation(p1, p2):
    """
    Return (a, b, c) for ax+by+c=0 through p1 and p2.
    Normalise so that sqrt(a²+b²)=1 (unit normal form).
    """
    pass

def are_parallel(m1, m2, tol=1e-9):
    """True if lines with slopes m1, m2 are parallel."""
    pass

def are_perpendicular(m1, m2, tol=1e-9):
    """True if lines with slopes m1, m2 are perpendicular."""
    pass


# --- tests: do not modify ---
assert math.isclose(slope((0,0),(3,6)), 2.0)
assert slope((0,0),(0,5)) is None   # vertical

a, b, c = line_equation((0,0),(1,1))  # y=x  =>  x-y=0
assert math.isclose(abs(a), abs(b)) and math.isclose(c, 0, abs_tol=1e-9)

assert are_parallel(2, 2)
assert not are_parallel(2, 3)
assert are_perpendicular(2, -0.5)
assert not are_perpendicular(2, 2)

print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Distance toolkit**

```python
import math

def point_distance(p1, p2):
    """Euclidean distance between two points."""
    pass

def point_to_line(x0, y0, a, b, c):
    """Distance from (x0,y0) to line ax+by+c=0."""
    pass

def foot_of_perpendicular(x0, y0, a, b, c):
    """Closest point on line ax+by+c=0 to (x0,y0)."""
    pass


# --- tests: do not modify ---
assert math.isclose(point_distance((0,0),(3,4)), 5.0)
assert math.isclose(point_distance((1,2),(4,6)), 5.0)
assert math.isclose(point_to_line(3,1,3,-4,5),  2.0)
assert math.isclose(point_to_line(0,0,4,-3,10), 2.0)

xf, yf = foot_of_perpendicular(3,1,3,-4,5)
# Foot should be on the line
assert math.isclose(3*xf - 4*yf + 5, 0, abs_tol=1e-9)
# And at distance 2 from (3,1)
assert math.isclose(point_distance((3,1),(xf,yf)), 2.0, rel_tol=1e-9)

print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Circumcircle finder**

```python
import math

def circumcircle(p1, p2, p3):
    """
    Find the circumcircle of triangle p1p2p3.
    Returns (cx, cy, r): centre and radius.
    Raises ValueError if points are collinear.
    """
    pass


# --- tests: do not modify ---
# Right triangle 3-4-5: circumcentre is midpoint of hypotenuse
cx, cy, r = circumcircle((0,0),(4,0),(0,3))
assert math.isclose(r, 2.5, rel_tol=1e-6)
assert math.isclose(cx, 2.0, rel_tol=1e-6)
assert math.isclose(cy, 1.5, rel_tol=1e-6)

# Equilateral triangle: circumcentre at centroid
import math
s = 2   # side length
p1, p2, p3 = (0,0), (s,0), (s/2, s*math.sqrt(3)/2)
cx, cy, r = circumcircle(p1, p2, p3)
assert math.isclose(r, s/math.sqrt(3), rel_tol=1e-6)

# Collinear points should raise ValueError
try:
    circumcircle((0,0),(1,1),(2,2))
    assert False, "Should raise ValueError"
except ValueError:
    pass

print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** The **angle bisectors** of two lines $L_1$ and $L_2$ are the
loci of points equidistant from both lines. Given lines $3x-4y+5=0$
and $5x+12y-10=0$, find both angle bisectors.

<details>
<summary>Answer</summary>

A point $(x,y)$ on an angle bisector satisfies:
$$\frac{|3x-4y+5|}{5} = \frac{|5x+12y-10|}{13}$$

Taking the two sign combinations:

Case 1 ($+$): $13(3x-4y+5) = 5(5x+12y-10)$
$\Rightarrow 39x-52y+65=25x+60y-50$
$\Rightarrow 14x-112y+115=0$.

Case 2 ($-$): $13(3x-4y+5) = -5(5x+12y-10)$
$\Rightarrow 39x-52y+65=-25x-60y+50$
$\Rightarrow 64x+8y+15=0$.

The two angle bisectors are $14x-112y+115=0$ and $64x+8y+15=0$. $\square$

</details>

**5. ★** Prove that the three perpendicular bisectors of a triangle are
concurrent (meet at a single point — the circumcentre), using the
distance characterisation.

<details>
<summary>Answer</summary>

Let $P$ be the intersection of the perpendicular bisectors of $AB$ and
$AC$. By the definition of the perpendicular bisector of $AB$:
$|PA|=|PB|$. By the definition of the perpendicular bisector of $AC$:
$|PA|=|PC|$. Therefore $|PB|=|PC|$, which means $P$ lies on the
perpendicular bisector of $BC$. So all three bisectors meet at $P$. $\blacksquare$

</details>
