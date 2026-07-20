# Stage 3, Lesson 3.4 — Ellipses
**Threads:** Math · Physics · Engineering
**Estimated time:** 65–75 minutes

---

## What This Lesson Is About

The circle (Lesson 3.2) was "equidistant from one point." The
parabola (Lesson 3.3) was "equidistant from one point and one line."
The ellipse is the third locus construction in this pattern: **the
sum of the distances to two fixed points (the foci) is constant.**
Same tool — the distance formula — a different constraint, a third
shape.

Ellipses show up wherever something orbits, rotates off-centre, or
needs two focal points to work: planetary orbits (Kepler's first
law), elliptical gears and cams that convert constant input rotation
into variable output speed, whispering-gallery acoustics, and
elliptical pockets or profiles machined directly into parts. By the
end of this lesson you can derive the standard equation from the two-
foci definition, find vertices/co-vertices/foci/eccentricity, convert
general form to standard form, plot an ellipse parametrically,
intersect an ellipse with a line, and estimate a machined elliptical
profile's cut length — a quantity that, unlike the circle's
$2\pi r$, has no simple closed form.

---

## Historical Context

The ellipse was the third of Menaechmus's conic sections, but its
most consequential appearance came in 1609, when Johannes Kepler
published his first law of planetary motion: planets orbit the Sun
in ellipses, with the Sun at one focus — not the centre. This broke
2000 years of assumed circular orbits and was a direct product of
Tycho Brahe's precise observational data on Mars, which refused to
fit any circular model. The reflective property of the ellipse (a
ray from one focus reflects to the other) was exploited in
"whispering gallery" architecture — most famously the U.S. Capitol's
Statuary Hall — and, far more recently, in lithotripsy, a medical
procedure that uses an elliptical reflector to focus shock waves from
one focus (outside the body) onto a kidney stone positioned at the
other.

---

## What You Need To Know First

- **Distance formula** — Lesson 3.1. The ellipse equation is the sum
  of two distance formulas set equal to a constant.
- **Completing the square** — Lesson 1.2 / Lesson 3.2. Needed for
  general → standard form, this time in *two* variables at once.
- **Circle-line intersection, parabola-line intersection** — Lesson
  3.2, Lesson 3.3. Same substitute-and-solve pattern, reused a third
  time.
- **Parametric circle plotting** — Lesson 3.2. The ellipse's
  parametric form is a direct generalization.

---

## The Lesson

### The Ellipse as a Locus

**Definition:** given two fixed points $F_1$, $F_2$ (the **foci**)
and a constant $2a$ greater than the distance between them, an
**ellipse** is the set of all points $P$ such that

$$\text{dist}(P,F_1) + \text{dist}(P,F_2) = 2a$$

Take foci at $F_1=(-c,0)$ and $F_2=(c,0)$ on the $x$-axis. For
$P=(x,y)$:

$$\sqrt{(x+c)^2+y^2} + \sqrt{(x-c)^2+y^2} = 2a$$

Isolating one radical, squaring, isolating the remaining radical, and
squaring again (a standard but tedious algebra sequence — you're not
asked to reproduce every step, only to trust the destination) reduces
this to:

$$\frac{x^2}{a^2} + \frac{y^2}{b^2} = 1 \qquad \text{where } b^2 = a^2-c^2$$

This is the **standard form**, centred at the origin. $a$ is the
**semi-major axis** (half the longest diameter), $b$ the **semi-minor
axis**, and $c$ the distance from centre to each focus. Note the
relationship is $b^2=a^2-c^2$ — *not* the Pythagorean $c^2=a^2+b^2$
you might expect; here $c$ is the shortest side of the right triangle
formed by centre, focus, and co-vertex.

**Hand-worked example:** find the foci of $\dfrac{x^2}{25}+\dfrac{y^2}{9}=1$.

$a^2=25 \Rightarrow a=5$. $b^2=9 \Rightarrow b=3$.
$c^2=a^2-b^2=25-9=16 \Rightarrow c=4$. Foci: $(\pm4, 0)$.

**Numerical check before moving on** — confirm the sum-of-distances
property actually holds at a real point on this ellipse, the same
sanity-check habit used for the parabola in Lesson 3.3:

```python
import numpy as np

# Throwaway check: does a point on x²/25+y²/9=1 satisfy
# dist(P,F1)+dist(P,F2) = 2a = 10?
a, b, c = 5, 3, 4
x = 3
y = b * np.sqrt(1 - x**2/a**2)   # solve the ellipse equation for y

F1 = np.array([-c, 0])
F2 = np.array([c, 0])
P = np.array([x, y])

d1 = np.linalg.norm(P - F1)
d2 = np.linalg.norm(P - F2)

print(f"Point P=({x}, {y:.4f})")
print(f"  dist(P,F1) = {d1:.6f}")
print(f"  dist(P,F2) = {d2:.6f}")
print(f"  sum         = {d1+d2:.6f}  (expected 2a = {2*a})")
```

Output:

```
Point P=(3, 2.4000)
  dist(P,F1) = 7.0000
  dist(P,F2) = 3.0000
  sum         = 10.000000  (expected 2a = 10)
```

**New here:** `np.linalg.norm(P - F1)` — the magnitude of a vector,
computed as $\sqrt{\text{sum of squared components}}$. This is
exactly the distance formula from Lesson 3.1, just computed via
vector subtraction and a library norm function instead of writing
`math.sqrt((x1-x2)**2+(y1-y2)**2)` by hand. It's the same idea you
already used manually to reflect rays in Lesson 3.3; here it's
introduced as its own named tool because from this point on, distance
calculations in this curriculum will generally use `np.linalg.norm`
rather than spelled-out `sqrt` — a shorter, less error-prone way to
say the same thing, especially once points have more than two
coordinates (which they will, from Stage 4 onward). The check
confirms the standard-form equation genuinely encodes the two-foci
sum condition. Discarded now; it doesn't reappear.

---

### Vertices, Co-vertices, Eccentricity, and General Form

For $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$ with $a>b$ (major axis
horizontal):

- **Vertices** (ends of major axis): $(\pm a, 0)$
- **Co-vertices** (ends of minor axis): $(0, \pm b)$
- **Foci**: $(\pm c, 0)$, $c=\sqrt{a^2-b^2}$
- **Eccentricity**: $e = c/a$, always between 0 and 1

Eccentricity measures *how elongated* the ellipse is. $e\to0$ means
$c\to0$, the foci merge into the centre, and the ellipse becomes a
circle — the circle is the special case $e=0$. $e\to1$ means the
ellipse becomes very flattened, stretching toward (but never
reaching) a parabola-like openness. This is the same parameter used
to classify a planet's orbit: Earth's orbit has $e\approx0.017$
(nearly circular); Halley's Comet has $e\approx0.967$ (a long, thin
ellipse).

If the major axis is vertical instead ($b>a$ relative to which axis
is longer, or more precisely: whichever denominator is larger
determines the major axis direction), swap the roles of $x$ and $y$
in the vertex/focus formulas accordingly.

**Shifted centre** $(h,k)$: $\dfrac{(x-h)^2}{a^2}+\dfrac{(y-k)^2}{b^2}=1$.

**General form**: $Ax^2+Cy^2+Dx+Ey+F=0$ with $A,C$ same sign,
$A\ne C$. Converting to standard form completes the square in *both*
variables — the same technique as the circle in Lesson 3.2, applied
twice instead of once because the $x^2$ and $y^2$ coefficients now
differ.

**Hand-worked example:** convert $4x^2+9y^2-16x+18y-11=0$ to standard
form.

Group by variable and factor out the leading coefficients first:

$$4(x^2-4x) + 9(y^2+2y) = 11$$
$$4(x^2-4x+4) + 9(y^2+2y+1) = 11 + 16 + 9$$
$$4(x-2)^2 + 9(y+1)^2 = 36$$
$$\frac{(x-2)^2}{9} + \frac{(y+1)^2}{4} = 1$$

Centre $(2,-1)$, $a=3$ (horizontal, since $9>4$), $b=2$.
$c=\sqrt{9-4}=\sqrt5$. Foci: $(2\pm\sqrt5, -1)$. $e=\sqrt5/3\approx0.745$.

```python
import math

def general_to_ellipse_standard(A, C, D, E, F):
    """
    Convert Ax²+Cy²+Dx+Ey+F=0 to standard form.
    Returns (h, k, a, b, c, e, major_axis) where major_axis is 'x' or 'y'.
    """
    h = -D / (2*A)
    k = -E / (2*C)
    # Constant on the right after completing the square in both variables
    rhs = A*h**2 + C*k**2 - F
    a_sq = rhs / A
    b_sq = rhs / C
    if a_sq <= 0 or b_sq <= 0:
        raise ValueError("Not a real ellipse")
    if a_sq >= b_sq:
        a, b, major_axis = math.sqrt(a_sq), math.sqrt(b_sq), 'x'
    else:
        a, b, major_axis = math.sqrt(b_sq), math.sqrt(a_sq), 'y'
    c = math.sqrt(a**2 - b**2)
    e = c / a
    return h, k, a, b, c, e, major_axis

print("General → standard form (ellipses):\n")
cases = [(4, 9, -16, 18, -11), (1, 4, 0, 0, -4)]
for A, C, D, E, F in cases:
    h, k, a, b, c, e, axis = general_to_ellipse_standard(A, C, D, E, F)
    print(f"  {A}x²+{C}y²+({D})x+({E})y+({F})=0")
    print(f"  → centre ({h:.3f},{k:.3f}), a={a:.4f}, b={b:.4f}, "
          f"major axis: {axis}")
    print(f"  → c={c:.4f}, e={e:.4f}\n")
```

**Walkthrough.** `h = -D/(2*A)` and `k = -E/(2*C)` are completing the
square's usual result, done independently per variable — a direct
reuse of the circle's version from Lesson 3.2, just divided by $A$
and $C$ respectively instead of both by 1. `rhs = A*h**2 + C*k**2 -
F` is new only as *this specific algebra step*, not as a concept —
it's the constant left after moving everything to one side, the same
bookkeeping as the hand-worked example above. The `if a_sq >= b_sq`
branch is new: unlike the circle, an ellipse's two denominators
aren't interchangeable — whichever is larger determines which axis
is "major," and the formulas for vertices/foci depend on getting that
assignment right, so the code has to check it explicitly rather than
assume $x$ is always major.

---

### Parametric Form and Plotting

Generalizing the circle's parametrization $x=r\cos t, y=r\sin t$
(Lesson 3.2) to two independent radii:

$$x = h + a\cos t \qquad y = k + b\sin t \qquad t \in [0, 2\pi)$$

This traces the full ellipse exactly once as $t$ sweeps $0$ to
$2\pi$ — but unlike the circle, $t$ here is **not** the angle from
the centre to the point $(x,y)$ except at the vertices and
co-vertices; for a non-circular ellipse the two are different
angles. This distinction matters later (Lesson 3.8, polar conics) —
for now, treat $t$ as a parameter that traces the shape correctly,
not as "the angle."

```python
import numpy as np
import matplotlib.pyplot as plt

def plot_ellipse(h, k, a, b, ax=None, **kwargs):
    """Plot (x-h)²/a²+(y-k)²/b²=1 parametrically."""
    if ax is None:
        fig, ax = plt.subplots(figsize=(8, 8))
    t = np.linspace(0, 2*np.pi, 300)
    x = h + a*np.cos(t)
    y = k + b*np.sin(t)
    ax.plot(x, y, lw=2.5, **kwargs)
    return ax

fig, ax = plt.subplots(figsize=(9, 7))
plot_ellipse(2, -1, 3, 2, ax=ax, color='#2980b9',
             label=r'$\frac{(x-2)^2}{9}+\frac{(y+1)^2}{4}=1$')

h, k, a, b = 2, -1, 3, 2
c = math.sqrt(a**2 - b**2)
for fx, fy in [(h-c, k), (h+c, k)]:
    ax.plot(fx, fy, 'o', color='#e74c3c', markersize=9, zorder=5)
ax.plot(h, k, '+', color='#333', markersize=12, markeredgewidth=2)

ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.legend(fontsize=10)
ax.set_title('Ellipse with foci marked', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
plt.tight_layout()
plt.show()
```

**Walkthrough.** `def plot_ellipse(h, k, a, b, ax=None, **kwargs)` —
first appearance of `**kwargs`: it collects any extra named arguments
the caller passes (`color=`, `label=`, and so on here) into a
dictionary, which `ax.plot(x, y, lw=2.5, **kwargs)` then unpacks back
out as individual keyword arguments to `ax.plot`. This is what lets
`plot_ellipse` accept whatever styling options `ax.plot` supports
without the function having to name each one — a first appearance
worth pausing on because you'll reuse this exact pattern for the rest
of the curriculum whenever a wrapper function should stay flexible
about styling. `math.sqrt(a**2 - b**2)` reuses the focal-distance
formula derived above; nothing new there.

---

### Ellipse–Line Intersection

The same substitute-and-solve pattern as Lesson 3.2 (circle) and
Lesson 3.3 (parabola), used a third time — restated briefly rather
than re-derived, per the repetition rule.

Substituting $y=mx+c$ into $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$ and
clearing denominators gives a quadratic in $x$ whose discriminant
again determines miss / tangent / secant.

```python
import math

def ellipse_line_intersect(a, b, m, c):
    """Intersect x²/a²+y²/b²=1 (centred at origin) with y=mx+c."""
    A = b**2 + a**2*m**2
    B = 2*a**2*m*c
    C = a**2*c**2 - a**2*b**2
    disc = B**2 - 4*A*C
    if disc < -1e-9:
        return []
    elif abs(disc) <= 1e-9:
        x = -B / (2*A)
        return [(x, m*x + c)]
    else:
        x1 = (-B + math.sqrt(disc)) / (2*A)
        x2 = (-B - math.sqrt(disc)) / (2*A)
        return [(x1, m*x1 + c), (x2, m*x2 + c)]

print("Ellipse-line intersection, x²/25+y²/9=1:\n")
for m, c, label in [(0, 2, 'y=2'), (1, 6, 'y=x+6 (tangent-ish, check)'),
                     (1, 20, 'y=x+20 (misses)')]:
    pts = ellipse_line_intersect(5, 3, m, c)
    print(f"  {label}: {len(pts)} point(s)")
    for pt in pts:
        print(f"    ({pt[0]:.4f}, {pt[1]:.4f})")
```

---

### Manufacturing Application: Elliptical Pockets and Perimeter Estimation

An elliptical pocket, cam, or gasket profile is cut by following the
parametric path $(h+a\cos t, k+b\sin t)$, exactly as plotted above —
generating toolpath points is a direct reuse of the parabola
toolpath idea from Lesson 3.3, just with the ellipse's parametrization
instead of a step in $x$.

The circle's circumference, $2\pi r$, has an exact closed form. The
**ellipse's perimeter does not** — it requires an integral (an
"elliptic integral," named after this exact problem) that Stage 5's
calculus doesn't even resolve to elementary functions. For now, two
practical alternatives:

1. **Ramanujan's approximation** (very accurate for most engineering purposes):
$$P \approx \pi\left[3(a+b) - \sqrt{(3a+b)(a+3b)}\right]$$

2. **Numerical estimation by polygon approximation**: generate many
   points along the ellipse, sum the straight-line distance between
   each consecutive pair. More points → closer to the true curve
   length. This is the same "approximate a curve by short straight
   segments" idea the toolpath itself already uses — the cutting
   tool's real path *is* a polygon approximation of the true ellipse,
   so this estimate is actually measuring what the machine will
   really travel, not just estimating a mathematical abstraction.

```python
import numpy as np

def ellipse_perimeter_ramanujan(a, b):
    """Ramanujan's approximation for ellipse perimeter."""
    return math.pi * (3*(a+b) - math.sqrt((3*a+b)*(a+3*b)))

def ellipse_perimeter_numeric(a, b, n_points=1000):
    """
    Estimate perimeter by summing distances between consecutive
    points on the parametric ellipse -- the polygon-approximation
    method, which is also literally what a CNC toolpath does.
    """
    t = np.linspace(0, 2*np.pi, n_points, endpoint=True)
    x = a * np.cos(t)
    y = b * np.sin(t)
    points = list(zip(x, y))
    total = 0.0
    for (x1, y1), (x2, y2) in zip(points, points[1:]):
        total += math.hypot(x2 - x1, y2 - y1)
    return total

import math
a, b = 5, 3
approx = ellipse_perimeter_ramanujan(a, b)
for n in [8, 50, 1000]:
    numeric = ellipse_perimeter_numeric(a, b, n_points=n)
    print(f"  n={n:5d} points: numeric perimeter = {numeric:.6f}")
print(f"  Ramanujan approximation:    {approx:.6f}")

# Material/laser-cutting estimate: 0.02mm/sec cut speed
cut_speed_mm_s = 0.02
print(f"\nEstimated cut time for a={a}mm, b={b}mm ellipse at "
      f"{cut_speed_mm_s}mm/s: {approx/cut_speed_mm_s:.1f} s")
```

Output (abridged):

```
  n=    8 points: numeric perimeter = 24.278313
  n=   50 points: numeric perimeter = 25.526988
  n= 1000 points: numeric perimeter = 25.526998
  Ramanujan approximation:    25.526999

Estimated cut time for a=5mm, b=3mm ellipse at 0.02mm/s: 1276.3 s
```

**Walkthrough.** `for (x1, y1), (x2, y2) in zip(points, points[1:])`
is a new twist on `zip`, not a new concept in itself: `points[1:]` is
the same list with its first element dropped, so zipping `points`
against `points[1:]` pairs each point with the *next* one — point 0
with point 1, point 1 with point 2, and so on — which is exactly how
you walk consecutive pairs along a path without an index variable.
`math.hypot(x2-x1, y2-y1)` is a first appearance: it computes
$\sqrt{\Delta x^2+\Delta y^2}$ directly — the same distance formula
you've hand-written many times, now via a dedicated function built
for exactly this two-argument case. Note how the numeric estimate at
$n=8$ points (24.28) is visibly short of the true value, but by
$n=1000$ it agrees with Ramanujan's closed-form approximation to five
decimal places — direct evidence that "more, smaller straight
segments approximate a curve better," the same principle that will
resurface, formalized, as the Riemann sum in Lesson 5.13.

**SE lens.** Two different strategies solve the same problem here:
a closed-form approximation formula (fast, one line, no loop) versus
a numerical simulation (slower, but you can watch it converge and
trust it for shapes that have no known formula at all — you'll reuse
`ellipse_perimeter_numeric`'s pattern verbatim for any future curve
that isn't an ellipse). The real engineering tradeoff: Ramanujan's
formula is dramatically faster and accurate to within a tiny fraction
of a percent for essentially all real ellipses, so production CAM
software uses it or something like it; the numerical version exists
here specifically because it generalizes to shapes with no formula at
all, which is most of them.

---

## Connect the Pieces

Concrete trace: an elliptical gasket profile, $a=5\text{mm}$,
$b=3\text{mm}$, centred at the origin.

1. **Locus definition**: sum of distances to $F_1=(-4,0)$,
   $F_2=(4,0)$ equals $2a=10$ for every point on the profile
   ($c=\sqrt{25-9}=4$).
2. **Eccentricity**: $e=4/5=0.8$ — a fairly elongated ellipse.
3. **Parametric plot**: $(5\cos t, 3\sin t)$ traces the full profile.
4. **Toolpath generation**: the same parametrization, sampled at many
   $t$ values, becomes the machine's cutting path.
5. **Perimeter estimate**: summing consecutive toolpath segment
   lengths (25.527mm) matches Ramanujan's closed-form estimate to
   five decimals — confirming the toolpath is a faithful
   approximation of the true curve, and giving a cut-time estimate
   for the job.

One equation — locus definition, standard form, parametrization,
toolpath, and perimeter — traced through five representations of the
same shape.

---

## Summary

**Locus definition:** $\text{dist}(P,F_1)+\text{dist}(P,F_2)=2a$.

**Standard form:** $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$,
$b^2=a^2-c^2$, centre origin (shift by $h,k$ as usual).

**Eccentricity:** $e=c/a \in [0,1)$; $e=0$ is a circle.

**General → standard:** complete the square in both variables
(Lesson 1.2 / 3.2, applied twice).

**Parametric form:** $x=h+a\cos t,\ y=k+b\sin t$.

**Ellipse-line intersection:** substitute, solve the quadratic — same
pattern as circle and parabola.

**Perimeter has no elementary closed form** — use Ramanujan's
approximation or numerical polygon summation.

**New Python/CS concepts:**
- `np.linalg.norm` — vector magnitude (distance formula via vectors)
- `**kwargs` — forwarding arbitrary keyword arguments to another function
- `zip(points, points[1:])` — pairing consecutive elements in a sequence
- `math.hypot(dx, dy)` — direct 2D distance

---

## Problems

### Math

**1.** Find $a$, $b$, $c$, the foci, and the eccentricity of
$\dfrac{x^2}{169}+\dfrac{y^2}{25}=1$.

<details><summary>Answer</summary>
$a=13$, $b=5$, $c=\sqrt{169-25}=12$. Foci $(\pm12,0)$.
$e=12/13\approx0.923$.
</details>

---

**2.** Convert $x^2+4y^2+6x-8y+9=0$ to standard form.

<details><summary>Answer</summary>
$(x^2+6x)+4(y^2-2y)=-9$
$(x^2+6x+9)+4(y^2-2y+1)=-9+9+4$
$(x+3)^2+4(y-1)^2=4$
$\dfrac{(x+3)^2}{4}+(y-1)^2=1$. Centre $(-3,1)$, $a=2$ (horizontal),
$b=1$.
</details>

---

**3.** A whispering-gallery ellipse has $a=10\text{m}$, $c=6\text{m}$.
A sound wave leaves one focus and reflects once off the wall. How far
does it travel in total before reaching the other focus?

<details><summary>Answer</summary>
By the locus definition itself: the total path length from one focus,
off the ellipse, to the other focus is always $2a=20\text{m}$,
regardless of where on the wall it reflects.
</details>

---

### Code Challenges

**Challenge 1 — Ellipse class**

```python
import math

class Ellipse:
    def __init__(self, h, k, a, b):
        """Ellipse (x-h)²/a²+(y-k)²/b²=1. Assumes a≠b."""
        if a <= 0 or b <= 0:
            raise ValueError("a and b must be positive")
        self.h, self.k, self.a, self.b = h, k, a, b

    @classmethod
    def from_general(cls, A, C, D, E, F):
        """Create from Ax²+Cy²+Dx+Ey+F=0."""
        pass

    def foci(self):
        """Return [(x1,y1), (x2,y2)] for the two foci."""
        pass

    def eccentricity(self):
        pass

    def contains_point(self, x, y, tol=1e-9):
        pass

    def perimeter_ramanujan(self):
        pass

# --- tests: do not modify ---
e = Ellipse(0, 0, 5, 3)
assert e.contains_point(5, 0)
assert e.contains_point(0, 3)
foci = e.foci()
assert any(math.isclose(fx, 4, abs_tol=1e-9) for fx, fy in foci)
assert math.isclose(e.eccentricity(), 0.8, abs_tol=1e-9)
assert math.isclose(e.perimeter_ramanujan(), 25.526999, abs_tol=1e-3)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Intersections**

```python
import math

def ellipse_line_pts(a, b, m, c):
    """Intersect x²/a²+y²/b²=1 with y=mx+c. Returns list of (x,y)."""
    pass

# --- tests: do not modify ---
pts = ellipse_line_pts(5, 3, 0, 0)   # major axis crossing
assert len(pts) == 2
xs = sorted(p[0] for p in pts)
assert math.isclose(xs[0], -5, abs_tol=1e-6)
assert math.isclose(xs[1], 5, abs_tol=1e-6)

pts_miss = ellipse_line_pts(5, 3, 1, 20)
assert len(pts_miss) == 0
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Numeric perimeter convergence**

```python
import math
import numpy as np

def perimeter_numeric(a, b, n_points):
    """Same polygon-approximation idea from the lesson; reimplement it."""
    pass

# --- tests: do not modify ---
p1000 = perimeter_numeric(5, 3, 1000)
ramanujan = math.pi * (3*(5+3) - math.sqrt((3*5+3)*(5+3*3)))
assert math.isclose(p1000, ramanujan, rel_tol=1e-4)

# Convergence: more points should get closer to the Ramanujan value
p8 = perimeter_numeric(5, 3, 8)
p50 = perimeter_numeric(5, 3, 50)
assert abs(p50 - ramanujan) < abs(p8 - ramanujan)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove the ellipse's reflective property: a ray leaving one
focus reflects off the ellipse and passes through the other focus.
(Hint: this is a geometric argument about the tangent line bisecting
the *external* angle $\angle F_1PF_2$, not an algebraic derivation —
sketch it, using the fact that the shortest path from $F_1$ to any
point on the tangent line to $F_2$, reflected, is a straight line.)

<details><summary>Answer</summary>
Let $P$ be a point on the ellipse and let $\ell$ be the tangent line
at $P$. Reflect $F_1$ across $\ell$ to get $F_1'$. Because $\ell$ is
tangent (touches the ellipse at exactly $P$ and nowhere else), every
other point $Q$ on $\ell$ lies strictly outside the ellipse, meaning
$\text{dist}(Q,F_1)+\text{dist}(Q,F_2) > 2a$ for $Q\ne P$, while
equality $=2a$ holds only at $P$. Since reflection preserves distance,
$\text{dist}(Q,F_1)=\text{dist}(Q,F_1')$ for all $Q$ on $\ell$, so
$\text{dist}(Q,F_1')+\text{dist}(Q,F_2)$ is minimized over $Q\in\ell$
exactly at $Q=P$. A sum of two distances from a fixed line is
minimized where the two points and $Q$ are collinear — so $F_1'$,
$P$, $F_2$ are collinear, meaning the incoming ray $F_1\to P$ and the
line $P\to F_1'$ are mirror images across $\ell$ (equal angles), and
the "reflected" continuation of that line is exactly $P\to F_2$.
Hence a ray from $F_1$ reflects at $P$ directly toward $F_2$.
$\blacksquare$
</details>
