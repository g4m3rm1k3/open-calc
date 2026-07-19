# Stage 2, Lesson 2.9 — Polar Coordinates
**Threads:** Math · Physics · CS  
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Every point in the plane has been described so far by its Cartesian
coordinates $(x, y)$ — horizontal and vertical distances from the origin.
But many natural shapes — spirals, circles, roses, radar sweeps, antenna
patterns, orbital paths — are described far more simply by a distance
from a centre and an angle from a reference direction. These are **polar
coordinates** $(r, \theta)$. A circle of radius $R$ centred at the origin
requires the equation $x^2 + y^2 = R^2$ in Cartesian form — four symbols
involving two variables. In polar form it is simply $r = R$ — a single
symbol. The cardioid, the limaçon, the Archimedean spiral, and the
rose curves all have elegant polar equations but messy Cartesian ones.
By the end of this lesson you can convert fluently between Cartesian and
polar coordinates, graph standard polar curves by plotting $r$ as a
function of $\theta$, convert equations between the two systems, and
recognise which system is more natural for a given problem.

---

## Historical Context

Polar coordinates were introduced by Jacob Bernoulli in 1691, though
Isaac Newton had used a related system earlier. The systematic development
is due to Euler (1748). The name "polar" reflects the use of a fixed
point (the **pole**) and a fixed ray from it (the **polar axis**) as
the reference. Many of the beautiful curves described by polar equations
— the cardioid, the lemniscate, the Archimedean spiral — were studied
in the 17th and 18th centuries as examples of curves that could not be
described elegantly in Cartesian form. Today polar coordinates are
essential in radar systems (a radar sweep is naturally described by
range $r$ and bearing $\theta$), in CNC turning operations (a lathe
works in a natural polar geometry), and in antenna design (radiation
patterns are polar plots).

---

## What You Need To Know First

- **Sine, cosine, and $\arctan2$** — Lessons 2.1–2.4.
- **The Cartesian plane** — Lesson 0.4.
- **Pythagorean theorem** — for converting $r = \sqrt{x^2+y^2}$.

---

## The Lesson

### The Polar Coordinate System

**Definition:** A point $P$ has **polar coordinates** $(r, \theta)$ where:
- $r \geq 0$ is the **radial distance** from the origin (the **pole**)
- $\theta$ is the **polar angle**, measured counterclockwise from the
  positive $x$-axis (the **polar axis**)

**Conversion formulas:**

$$x = r\cos\theta \qquad y = r\sin\theta$$

$$r = \sqrt{x^2 + y^2} \qquad \theta = \text{atan2}(y, x)$$

**Non-uniqueness:** Unlike Cartesian coordinates, polar representation
is not unique. The same point can be written as $(r, \theta)$,
$(r, \theta + 2\pi)$, $(r, \theta + 4\pi)$, etc. Also, allowing $r < 0$:
$(-r, \theta)$ represents the same point as $(r, \theta + \pi)$.

**Hand-worked examples:**

Convert $(3, 4)$ to polar: $r = \sqrt{9+16} = 5$, $\theta = \arctan(4/3) \approx 53.1°$.

Convert $(r, \theta) = (2, 2\pi/3)$ to Cartesian:
$x = 2\cos(2\pi/3) = -1$, $y = 2\sin(2\pi/3) = \sqrt{3}$.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def cartesian_to_polar(x, y):
    r     = math.sqrt(x**2 + y**2)
    theta = math.atan2(y, x)   # returns angle in (-pi, pi]
    return r, theta

def polar_to_cartesian(r, theta_rad):
    return r*math.cos(theta_rad), r*math.sin(theta_rad)

print("Cartesian → Polar:\n")
print(f"{'(x, y)':>12}  {'r':>8}  {'θ (rad)':>10}  {'θ (deg)':>10}")
print("-" * 48)
points = [(1,0),(0,1),(-1,0),(0,-1),(1,1),(-1,1),(3,4),(5,-12)]
for x, y in points:
    r, theta = cartesian_to_polar(x, y)
    print(f"  ({x:+3},{y:+3})  {r:>8.4f}  {theta:>10.4f}  {math.degrees(theta):>10.2f}°")

print()
print("Polar → Cartesian:\n")
print(f"{'(r, θ°)':>14}  {'x':>10}  {'y':>10}")
print("-" * 38)
polar_pts = [(1,0),(1,90),(2,45),(3,30),(5,53.13),(4,120)]
for r, theta_deg in polar_pts:
    x, y = polar_to_cartesian(r, math.radians(theta_deg))
    print(f"  ({r}, {theta_deg:>6}°)  {x:>10.4f}  {y:>10.4f}")

# Visualise the conversion
fig, axes = plt.subplots(1, 2, figsize=(13, 6))

# Left: Cartesian
test_pts = [(3,4),(-2,3),(-1,-2),(4,-1)]
colors   = ['#2980b9','#e74c3c','#27ae60','#8e44ad']
for (x,y), col in zip(test_pts, colors):
    r, theta = cartesian_to_polar(x, y)
    axes[0].plot(x, y, 'o', color=col, markersize=10, zorder=5)
    axes[0].plot([0,x],[0,y], color=col, lw=1.5, linestyle='--', alpha=0.6)
    axes[0].plot([x,x],[0,y], color=col, lw=1, linestyle=':', alpha=0.4)
    axes[0].plot([0,x],[0,0], color=col, lw=1, linestyle=':', alpha=0.4)
    axes[0].text(x+0.1, y+0.1, f'$({x},{y})$', fontsize=9, color=col)

axes[0].axhline(0, color='#333', lw=0.8); axes[0].axvline(0, color='#333', lw=0.8)
axes[0].set_aspect('equal'); axes[0].grid(True, alpha=0.3)
axes[0].set_title('Cartesian $(x, y)$', fontsize=11)
axes[0].set_xlabel('$x$'); axes[0].set_ylabel('$y$')

# Right: Polar
ax_polar = fig.add_subplot(1, 2, 2, projection='polar')
# projection='polar': creates a polar axes -- angles go CCW from right (0 at East)

for (x,y), col in zip(test_pts, colors):
    r, theta = cartesian_to_polar(x, y)
    ax_polar.plot(theta, r, 'o', color=col, markersize=10, zorder=5)
    ax_polar.plot([0, theta], [0, r], color=col, lw=1.5, linestyle='--', alpha=0.7)
    ax_polar.text(theta, r+0.2,
                  f'$({r:.1f},{math.degrees(theta):.0f}°)$',
                  fontsize=8, color=col, ha='center')

ax_polar.set_title('Polar $(r, \\theta)$\n', fontsize=11)
# Note: we must remove the Cartesian subplot we added above and replace properly
axes[1].remove()   # remove the placeholder

plt.suptitle('The same points in Cartesian and polar coordinates', fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `projection='polar'` in `fig.add_subplot` creates a
**polar axes** — an axes object where the $x$ input is the angle in
radians and the $y$ input is the radial distance. Plotting works the
same way as Cartesian axes, but `ax_polar.plot(theta, r, ...)` places
the point at angle $\theta$ and radius $r$. We remove the placeholder
`axes[1]` created by `plt.subplots` (which set up a Cartesian axis there)
and replace it with the polar axis using `fig.add_subplot`.

---

### Converting Equations

**Cartesian equation → Polar:** substitute $x = r\cos\theta$,
$y = r\sin\theta$, and $x^2+y^2 = r^2$.

**Polar equation → Cartesian:** substitute $r^2 = x^2+y^2$,
$r\cos\theta = x$, $r\sin\theta = y$.

**Hand-worked examples:**

(a) Convert $x^2 + y^2 = 9$ to polar:
$r^2 = 9 \implies r = 3$. A circle of radius 3.

(b) Convert $y = x$ to polar:
$r\sin\theta = r\cos\theta \implies \tan\theta = 1 \implies \theta = \pi/4$.
A line at $45°$.

(c) Convert $r = 4\cos\theta$ to Cartesian:
Multiply both sides by $r$: $r^2 = 4r\cos\theta \implies x^2+y^2 = 4x \implies (x-2)^2+y^2=4$.
A circle of radius 2 centred at $(2, 0)$.

(d) Convert $x^2 + y^2 = 6y$ to polar:
$r^2 = 6r\sin\theta \implies r = 6\sin\theta$.

```python
import math
import numpy as np

print("Equation conversion examples:\n")

theta = np.linspace(0, 2*np.pi, 300)

# r = 3 (circle): should give x²+y²=9
r_circ = np.full_like(theta, 3)   # constant array of 3s
x_circ = r_circ * np.cos(theta);  y_circ = r_circ * np.sin(theta)
check_circ = np.allclose(x_circ**2 + y_circ**2, 9)
print(f"r=3 → x²+y²=9: {check_circ}")

# r = 4cos(θ): should give (x-2)²+y²=4
r_c2 = 4 * np.cos(theta)
x_c2 = r_c2 * np.cos(theta);  y_c2 = r_c2 * np.sin(theta)
# Only valid for theta where r >= 0
valid = r_c2 >= 0
check_c2 = np.allclose((x_c2[valid]-2)**2 + y_c2[valid]**2, 4, atol=1e-10)
print(f"r=4cosθ → (x-2)²+y²=4: {check_c2}")

# r = 6sinθ: should give x²+(y-3)²=9
r_c3 = 6 * np.sin(theta)
x_c3 = r_c3 * np.cos(theta);  y_c3 = r_c3 * np.sin(theta)
valid3 = r_c3 >= 0
check_c3 = np.allclose(x_c3[valid3]**2 + (y_c3[valid3]-3)**2, 9, atol=1e-10)
print(f"r=6sinθ → x²+(y-3)²=9: {check_c3}")
```

---

### Standard Polar Curves

The power of polar coordinates: many beautiful curves have simple equations.

```python
import numpy as np
import matplotlib.pyplot as plt

theta = np.linspace(0, 2*np.pi, 1000)

fig, axes = plt.subplots(2, 3, figsize=(14, 9),
                          subplot_kw={'projection': 'polar'})
# subplot_kw={'projection':'polar'}: applies the keyword to all subplots at once

curves = [
    (np.ones_like(theta),         '$r = 1$\n(Circle)',            '#2980b9'),
    (1 + np.cos(theta),           '$r = 1 + \\cos\\theta$\n(Cardioid)', '#e74c3c'),
    (2 + np.cos(theta),           '$r = 2 + \\cos\\theta$\n(Limaçon)',  '#27ae60'),
    (np.cos(2*theta),             '$r = \\cos(2\\theta)$\n(Rose, 4 petals)', '#8e44ad'),
    (np.cos(3*theta),             '$r = \\cos(3\\theta)$\n(Rose, 3 petals)', '#e67e22'),
    (theta / (2*np.pi),           '$r = \\theta/2\\pi$\n(Archimedean Spiral)', '#c0392b'),
]

for ax, (r, title, color) in zip(axes.flat, curves):
    # For rose curves, include negative r values for full petals
    ax.plot(theta, np.abs(r) if 'Rose' in title else r,
            color=color, lw=2)
    ax.plot(theta, r, color=color, lw=2)
    ax.set_title(title, fontsize=10, pad=12)
    ax.grid(True, alpha=0.3)
    ax.set_yticklabels([])   # hide radial tick labels for cleanliness

plt.suptitle('Standard polar curves', fontsize=13)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `subplot_kw={'projection': 'polar'}` is a new pattern —
passing a dictionary of keyword arguments to be applied to every subplot
created by `plt.subplots`. This avoids calling `add_subplot(..., projection='polar')`
six times individually. `axes.flat` iterates over all subplots in row-major
order regardless of the 2D shape. `ax.set_yticklabels([])` removes the
radial distance labels (which would clutter the small plots).

---

### Plotting Polar Curves in Cartesian Form

Sometimes it is useful to plot $r$ as a function of $\theta$ on a
standard Cartesian axes — this shows the "blueprint" of the curve
before wrapping it into polar form.

```python
import numpy as np
import matplotlib.pyplot as plt

theta = np.linspace(0, 2*np.pi, 500)

fig, axes = plt.subplots(2, 2, figsize=(13, 9))

pairs = [
    (1 + np.cos(theta),   '$r = 1+\\cos\\theta$ (cardioid)'),
    (np.cos(2*theta),     '$r = \\cos(2\\theta)$ (4-petal rose)'),
    (1 - 2*np.sin(theta), '$r = 1-2\\sin\\theta$ (inner loop limaçon)'),
    (theta/(2*np.pi),     '$r = \\theta/2\\pi$ (Archimedean spiral)'),
]

for (ax_cart, ax_polar), (r, title) in zip(
        zip(axes[:,0], axes[:,1]),
        [(pairs[0][0], pairs[0][1]), (pairs[2][0], pairs[2][1])]):
    pass  # we'll plot all four directly

# Just plot all 4 side by side: left=r vs theta, right=polar plot
fig, axes = plt.subplots(4, 2, figsize=(13, 18))

for row, (r_vals, title) in enumerate(pairs):
    # Left: r vs theta
    axes[row,0].plot(theta, r_vals, color='#2980b9', lw=2)
    axes[row,0].axhline(0, color='#333', lw=0.8)
    axes[row,0].set_xlabel('$\\theta$ (rad)'); axes[row,0].set_ylabel('$r$')
    axes[row,0].set_title(f'{title}\n$r$ vs $\\theta$', fontsize=9)
    axes[row,0].set_xticks([0, np.pi/2, np.pi, 3*np.pi/2, 2*np.pi])
    axes[row,0].set_xticklabels(['$0$','$\\pi/2$','$\\pi$','$3\\pi/2$','$2\\pi$'])
    axes[row,0].grid(True, alpha=0.3)

    # Right: polar plot using Cartesian axes
    x = r_vals * np.cos(theta)
    y = r_vals * np.sin(theta)
    axes[row,1].plot(x, y, color='#e74c3c', lw=2)
    axes[row,1].axhline(0, color='#333', lw=0.8)
    axes[row,1].axvline(0, color='#333', lw=0.8)
    axes[row,1].set_aspect('equal')
    axes[row,1].set_title(f'{title}\nPolar plot', fontsize=9)
    axes[row,1].grid(True, alpha=0.3)

plt.suptitle('Polar curves: $r(\\theta)$ blueprint (left) and resulting shape (right)',
             fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** Plotting the polar curve on Cartesian axes using
`x = r*cos(theta)`, `y = r*sin(theta)` is the standard approach when
you want full control over the plot's appearance. The `projection='polar'`
axes are convenient but have limited customisation. The left panels show
why each polar curve has its shape: the cardioid's $r$ ranges from $0$
to $2$ with a cosine period, so the resulting shape has one rounded lobe
that comes to a point (the "heart") where $r=0$.

---

### CNC Application: Lathe and Polar Geometry

A lathe rotates a cylindrical workpiece about its axis. The tool moves
radially while the piece rotates — this is inherently a polar geometry.
A constant-radius path (circular cross-section) is $r = R$ in polar
form. A spiral tool path (for facing operations) is $r = R_\text{start} - \frac{(R_\text{start}-R_\text{end})}{2\pi n}\theta$ where $n$ is the number of passes.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

fig, axes = plt.subplots(1, 2, figsize=(13, 6))

# Circular cross-section: r = R (constant)
theta = np.linspace(0, 2*np.pi, 300)
R = 50   # mm

axes[0].plot(R*np.cos(theta), R*np.sin(theta),
             color='#2980b9', lw=3, label='Part profile: $r=50$mm')
axes[0].fill(R*np.cos(theta), R*np.sin(theta),
             alpha=0.15, color='#2980b9')

# Tool position markers (every 45°)
for angle_deg in range(0, 360, 45):
    angle = math.radians(angle_deg)
    tx, ty = R*math.cos(angle), R*math.sin(angle)
    axes[0].plot(tx, ty, 's', color='#e74c3c', markersize=8, zorder=5)

axes[0].plot(0, 0, 'k+', markersize=14, markeredgewidth=2)   # spindle centre
axes[0].set_aspect('equal'); axes[0].grid(True, alpha=0.3)
axes[0].set_title('Lathe turning: circular profile\n$r=50$ mm constant', fontsize=10)
axes[0].set_xlabel('$x$ (mm)'); axes[0].set_ylabel('$y$ (mm)')
axes[0].legend(fontsize=9)

# Facing spiral: r decreases from 50 to 0 over 3 turns
n_turns = 3
theta_spiral = np.linspace(0, 2*np.pi*n_turns, 1000)
R_start, R_end = 50, 0
r_spiral = R_start - (R_start - R_end) / (2*np.pi*n_turns) * theta_spiral

x_spiral = r_spiral * np.cos(theta_spiral)
y_spiral = r_spiral * np.sin(theta_spiral)

axes[1].plot(x_spiral, y_spiral, color='#e74c3c', lw=2,
             label=f'Facing spiral ({n_turns} passes)')
axes[1].plot(0, 0, 'k+', markersize=14, markeredgewidth=2)
axes[1].set_aspect('equal'); axes[1].grid(True, alpha=0.3)
axes[1].set_title(f'CNC facing: Archimedean spiral tool path\n'
                  f'$r = 50 - \\frac{{50}}{{6\\pi}}\\theta$', fontsize=10)
axes[1].set_xlabel('$x$ (mm)'); axes[1].set_ylabel('$y$ (mm)')
axes[1].legend(fontsize=9)

plt.suptitle('Polar geometry in CNC lathe operations', fontsize=12)
plt.tight_layout()
plt.show()
```

---

## Connect the Pieces

**What this lesson built on:** Sine, cosine, and `atan2` (Lessons 2.1–2.4)
— the conversion formulas use these directly. Vectors (Lesson 2.8) —
polar coordinates are the magnitude-and-angle representation of a vector.
Complex numbers (Lesson 1.12) — the polar form $re^{i\theta}$ is exactly
polar coordinates applied to the complex plane.

**What this lesson makes possible:** Stage 3 (Analytic Geometry) uses
polar coordinates for conic sections in polar form (ellipses, parabolas,
hyperbolas all have simple polar equations with a focus at the origin).
Stage 5 (Calculus) — integration in polar coordinates, area of polar
regions. Stage 7 (Signals) — the complex plane in polar form is where
the $z$-transform and Laplace transform live.

---

## Summary

**Polar coordinates:** $(r, \theta)$ — distance from pole and angle from polar axis.

**Conversions:**
$$x = r\cos\theta \quad y = r\sin\theta \quad r = \sqrt{x^2+y^2} \quad \theta = \text{atan2}(y,x)$$

**Key substitutions:** $x^2+y^2 = r^2$; $r\cos\theta = x$; $r\sin\theta = y$.

**Standard curves:**

| Polar equation | Cartesian form | Shape |
|---------------|---------------|-------|
| $r = a$ | $x^2+y^2=a^2$ | Circle at origin |
| $r = 2a\cos\theta$ | $(x-a)^2+y^2=a^2$ | Circle, centre $(a,0)$ |
| $r = 1+\cos\theta$ | — | Cardioid |
| $r = \cos(n\theta)$ | — | Rose ($n$ or $2n$ petals) |
| $r = a\theta$ | — | Archimedean spiral |

**New Python:**
- `projection='polar'` in `add_subplot` or `subplot_kw` — polar axes
- `subplot_kw={'projection':'polar'}` in `plt.subplots` — all subplots polar
- `axes.flat` — iterate all subplots in row-major order
- `ax.set_yticklabels([])` — hide radial tick labels

---

## Problems

### Math

**1.** Convert to polar coordinates $(r, \theta)$ with $r \geq 0$
and $\theta \in [0, 2\pi)$.

(a) $(0, -4)$ &emsp; (b) $(-3, 3)$ &emsp; (c) $(1, -\sqrt{3})$

<details>
<summary>Answers</summary>

(a) $r=4$, $\theta=3\pi/2$

(b) $r=3\sqrt{2}$, $\theta=3\pi/4$

(c) $r=2$, $\theta=5\pi/3$ (since $\arctan(-\sqrt{3}/1) = -\pi/3$, adjust to $5\pi/3$)

</details>

---

**2.** Convert each polar equation to Cartesian form.

(a) $r = 5$

(b) $r = -4\sin\theta$

(c) $r^2 = \cos(2\theta)$ *(Hint: use $\cos(2\theta) = \cos^2\theta-\sin^2\theta$)*

<details>
<summary>Answers</summary>

(a) $x^2+y^2=25$

(b) $r^2=-4r\sin\theta \Rightarrow x^2+y^2=-4y \Rightarrow x^2+(y+2)^2=4$. Circle, centre $(0,-2)$, radius 2.

(c) $r^2=\cos^2\theta-\sin^2\theta=x^2/r^2-y^2/r^2$, so $r^4=x^2-y^2$, i.e. $(x^2+y^2)^2=x^2-y^2$. This is the lemniscate of Bernoulli.

</details>

---

**3.** Plot $r = 2 + 4\cos\theta$ (a limaçon with an inner loop).
For what values of $\theta$ is $r < 0$? What does $r < 0$ mean geometrically?

<details>
<summary>Answer</summary>

$r < 0$ when $\cos\theta < -1/2$, i.e. $\theta \in (2\pi/3, 4\pi/3)$.

When $r < 0$, the point $(r, \theta)$ is plotted in the direction
$\theta + \pi$ (opposite side of the pole), at distance $|r|$.
This creates the inner loop — the curve crosses the origin and traces
a smaller loop inside the main loop.

</details>

---

### Code Challenges

**Challenge 1 — Coordinate converter**

```python
import math

def cartesian_to_polar_deg(x, y):
    """
    Convert (x, y) to (r, theta_degrees) where theta in [0, 360).
    """
    pass

def polar_to_cartesian_deg(r, theta_deg):
    """Convert (r, theta_degrees) to (x, y)."""
    pass


# --- tests: do not modify ---
r, t = cartesian_to_polar_deg(3, 4)
assert math.isclose(r, 5.0,    rel_tol=1e-9)
assert math.isclose(t, 53.13,  abs_tol=0.01)

r, t = cartesian_to_polar_deg(0, -4)
assert math.isclose(r, 4.0,    rel_tol=1e-9)
assert math.isclose(t, 270.0,  abs_tol=0.01)

x, y = polar_to_cartesian_deg(2, 45)
assert math.isclose(x, math.sqrt(2), rel_tol=1e-9)
assert math.isclose(y, math.sqrt(2), rel_tol=1e-9)

# Round-trip
for xi, yi in [(3,4),(-1,2),(0,-5),(7,-7)]:
    r, t = cartesian_to_polar_deg(xi, yi)
    xo, yo = polar_to_cartesian_deg(r, t)
    assert math.isclose(xo, xi, abs_tol=1e-9)
    assert math.isclose(yo, yi, abs_tol=1e-9)

print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Polar curve plotter**

```python
import numpy as np
import matplotlib.pyplot as plt

def plot_polar_curve(r_func, theta_start=0, theta_end=2*np.pi,
                     n_points=1000, title='Polar Curve', color='#2980b9'):
    """
    Plot a polar curve r = r_func(theta) on both:
    (a) a standard Cartesian axes showing the resulting shape
    (b) a theta vs r axes showing the blueprint

    r_func: callable, takes array of theta values, returns array of r values
    """
    pass


# No automated test -- verify visually.
import numpy as np
plot_polar_curve(lambda t: 1 + np.cos(t),  title='Cardioid $r=1+\\cos\\theta$')
plot_polar_curve(lambda t: np.cos(3*t),     title='3-petal rose $r=\\cos(3\\theta)$')
plot_polar_curve(lambda t: t/(2*np.pi),
                 theta_end=4*np.pi, title='Spiral $r=\\theta/2\\pi$')
```

---

**Challenge 3 — Spiral facing tool path**

Generate the (x, y) coordinates for a CNC facing operation that spirals
inward from radius $R$ to the centre over $n$ complete passes.

```python
import numpy as np
import math

def facing_spiral(R_start, n_passes, points_per_pass=200):
    """
    Generate a spiral tool path from radius R_start to 0
    over n_passes complete revolutions.

    Returns (x_array, y_array) as numpy arrays.
    The path is an Archimedean spiral:
        r(theta) = R_start * (1 - theta / (2*pi*n_passes))
    """
    pass


# --- tests: do not modify ---
import numpy as np, math

x, y = facing_spiral(50, 3)

# First point should be at (50, 0)
assert math.isclose(x[0], 50.0, abs_tol=0.1)
assert math.isclose(y[0], 0.0,  abs_tol=0.1)

# Last point should be near origin
assert math.sqrt(x[-1]**2 + y[-1]**2) < 1.0

# Total arc should be 3 full turns worth of theta
# r decreases linearly -- all points should have r >= 0
r_vals = np.sqrt(x**2 + y**2)
assert np.all(r_vals >= -1e-10)

print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove that the polar equation $r = 2a\cos\theta$ represents a
circle of radius $|a|$ centred at $(a, 0)$.

<details>
<summary>Answer</summary>

Multiply both sides by $r$: $r^2 = 2ar\cos\theta$.
Substitute $r^2 = x^2+y^2$ and $r\cos\theta = x$:
$x^2+y^2 = 2ax$.
Complete the square: $x^2 - 2ax + a^2 + y^2 = a^2$, i.e. $(x-a)^2+y^2=a^2$.
This is a circle centred at $(a,0)$ with radius $|a|$. $\blacksquare$

</details>

**5. ★** The **area enclosed by a polar curve** from $\theta = \alpha$
to $\theta = \beta$ is $A = \frac{1}{2}\int_\alpha^\beta r^2\,d\theta$
(proved in Stage 5).

Use this formula (just apply it numerically with a sum) to estimate the
area enclosed by the cardioid $r = 1 + \cos\theta$.

```python
import numpy as np

def polar_area(r_func, alpha, beta, n=10000):
    """
    Numerically approximate (1/2) * integral r(theta)^2 dtheta
    from alpha to beta using the midpoint rule.
    """
    pass

import math
area = polar_area(lambda t: 1 + np.cos(t), 0, 2*math.pi)
print(f"Cardioid area: {area:.6f}")
print(f"Exact (3π/2): {3*math.pi/2:.6f}")
```

<details>
<summary>Answer</summary>

Exact: $\frac{1}{2}\int_0^{2\pi}(1+\cos\theta)^2\,d\theta = \frac{1}{2}\int_0^{2\pi}(1+2\cos\theta+\cos^2\theta)\,d\theta$.
$\int_0^{2\pi}1\,d\theta=2\pi$; $\int_0^{2\pi}2\cos\theta\,d\theta=0$;
$\int_0^{2\pi}\cos^2\theta\,d\theta=\pi$ (power reduction).
Total: $\frac{1}{2}(2\pi+0+\pi)=\frac{3\pi}{2}$. $\blacksquare$

</details>
