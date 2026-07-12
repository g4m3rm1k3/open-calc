# Stage 2, Lesson 2.1 — Angles and the Unit Circle
**Threads:** Math · Physics · CS  
**Estimated time:** 60–75 minutes

---

## What This Lesson Is About

Trigonometry begins with a question that sounds purely geometric — how do
you measure an angle? — and produces an answer that turns out to be
the right foundation for waves, oscillations, rotations, signal processing,
and complex numbers. The answer is **radians**: measuring angles as the
arc length they cut on a circle of radius 1. This lesson builds that
definition carefully, introduces the **unit circle** — the circle of radius
1 centred at the origin — and uses it to define the cosine and sine of any
angle. Every trigonometric identity, every wave equation, every Fourier
transform, and every rotation matrix in this curriculum is a consequence
of what is defined here. By the end of this lesson you can convert between
degrees and radians fluently, locate any standard angle on the unit circle,
read off exact coordinate values at the 12 key angles, and compute arc
lengths and sector areas.

---

## Historical Context

Angle measurement in degrees (360° in a full rotation) dates to Babylonian
astronomy around 2000 BCE — 360 was chosen because it is close to the
number of days in a year and has many divisors. Radians were formalised
much later: Roger Cotes used them implicitly in 1714, and the name
"radian" was coined by James Thomson in 1873. The superiority of radians
over degrees is not aesthetic — it is mathematical. In radians, the
derivative of $\sin\theta$ is exactly $\cos\theta$. In degrees, the
derivative of $\sin\theta°$ is $\frac{\pi}{180}\cos\theta°$ — an ugly
constant that infects every formula in calculus and physics. Radians
are the natural unit because they are defined in terms of arc length,
which is the most geometrically fundamental quantity.

---

## What You Need To Know First

- **The Cartesian plane** — Lesson 0.4. The unit circle lives there.
- **Functions and their notation** — Lesson 0.6. Sine and cosine are
  functions from angles to real numbers.
- **The number $\pi$** — appears throughout. $\pi \approx 3.14159$ is the
  ratio of any circle's circumference to its diameter.

---

## The Lesson

### Measuring Angles: Degrees and Radians

**Degrees** divide a full rotation into 360 equal parts. The choice of
360 is historical convention, not mathematics.

**Radians** measure angles by the arc they cut on a unit circle.

**Definition:** One **radian** is the angle subtended at the centre of a
circle of radius $r$ by an arc of length $r$.

Since the full circumference of a circle of radius $r$ is $2\pi r$, a
full rotation subtends arc length $2\pi r$ — which is $2\pi$ times the
radius. Therefore:

$$360° = 2\pi \text{ radians}$$

**Conversion formulas:**

$$\theta_\text{rad} = \theta_\text{deg} \times \frac{\pi}{180°}
\qquad\qquad
\theta_\text{deg} = \theta_\text{rad} \times \frac{180°}{\pi}$$

**The key angles to know in both units:**

| Degrees | Radians | Fraction of $\pi$ |
|---------|---------|-------------------|
| $0°$ | $0$ | $0$ |
| $30°$ | $\dfrac{\pi}{6}$ | $\frac{1}{6}\pi$ |
| $45°$ | $\dfrac{\pi}{4}$ | $\frac{1}{4}\pi$ |
| $60°$ | $\dfrac{\pi}{3}$ | $\frac{1}{3}\pi$ |
| $90°$ | $\dfrac{\pi}{2}$ | $\frac{1}{2}\pi$ |
| $180°$ | $\pi$ | $\pi$ |
| $270°$ | $\dfrac{3\pi}{2}$ | $\frac{3}{2}\pi$ |
| $360°$ | $2\pi$ | $2\pi$ |

**Memory trick for the fractions:** the denominators are 6, 4, 3, 2 —
decreasing from 6. Or: $30° = \pi/6$ because $180/30 = 6$;
$45° = \pi/4$ because $180/45 = 4$; $60° = \pi/3$ because $180/60 = 3$.

```python
import numpy as np
import math

print("Degree–radian conversion table:\n")
print(f"{'Degrees':>10}  {'Radians':>14}  {'As fraction of π':>18}")
print("-" * 48)

key_degrees = [0, 30, 45, 60, 90, 120, 135, 150, 180, 270, 360]
for deg in key_degrees:
    rad  = math.radians(deg)       # math.radians: degrees → radians
    frac = rad / math.pi           # express as multiple of π
    # Format fraction nicely
    if frac == 0:
        frac_str = "0"
    elif frac == 1:
        frac_str = "π"
    else:
        # Find a simple fraction: multiply by common denominators
        for denom in [6, 4, 3, 2, 1]:
            numer = round(frac * denom)
            if abs(numer/denom - frac) < 1e-9 and numer > 0:
                frac_str = f"{numer}π/{denom}" if denom > 1 else f"{numer}π"
                break
        else:
            frac_str = f"{frac:.4f}π"
    print(f"{deg:>10}°  {rad:>14.6f}  {frac_str:>18}")

print()
# Conversion functions
def to_radians(degrees):
    return degrees * math.pi / 180

def to_degrees(radians):
    return radians * 180 / math.pi

# Verify
assert math.isclose(to_radians(180), math.pi)
assert math.isclose(to_degrees(math.pi/2), 90.0)
print("Conversions verified: to_radians(180) = π, to_degrees(π/2) = 90°")
```

**Walkthrough:** `math.radians(deg)` is Python's built-in degree-to-radian
converter — equivalent to `deg * math.pi / 180`. `math.pi` is $\pi$ to
full floating-point precision ($\approx 3.14159265358979$). The fraction
formatting loop searches for a clean fraction with denominator 1, 2, 3,
4, or 6 — the denominators that appear in the standard angles. `round()`
converts a float to the nearest integer.

---

### The Unit Circle

**Definition:** The **unit circle** is the circle of radius 1 centred
at the origin:

$$x^2 + y^2 = 1$$

For any angle $\theta$ (measured in radians, counterclockwise from the
positive $x$-axis), the point where the terminal ray of $\theta$
intersects the unit circle has coordinates $(\cos\theta, \sin\theta)$.

This is the definition of cosine and sine:

$$\cos\theta = x\text{-coordinate of the unit circle point at angle }\theta$$
$$\sin\theta = y\text{-coordinate of the unit circle point at angle }\theta$$

**Why this definition?** It extends trigonometry beyond right triangles
to all angles — including obtuse angles, negative angles, and angles
greater than $360°$. The right-triangle definition (opposite/hypotenuse,
adjacent/hypotenuse) only works for angles between $0°$ and $90°$.
The unit circle definition works for every real number.

**Immediate consequences:**

1. $\cos^2\theta + \sin^2\theta = 1$ (Pythagorean identity — the point
   lies on the unit circle, so $x^2 + y^2 = 1$)

2. $-1 \leq \cos\theta \leq 1$ and $-1 \leq \sin\theta \leq 1$
   (coordinates of a unit circle point)

3. $\cos(0) = 1$ and $\sin(0) = 0$ (the point at angle 0 is $(1, 0)$)

4. $\cos(\pi/2) = 0$ and $\sin(\pi/2) = 1$ (the point at $90°$ is $(0, 1)$)

5. $\cos(\pi) = -1$ and $\sin(\pi) = 0$ (the point at $180°$ is $(-1, 0)$)

```python
import numpy as np
import matplotlib.pyplot as plt
import math

fig, ax = plt.subplots(figsize=(9, 9))

# Draw the unit circle
theta_full = np.linspace(0, 2*np.pi, 400)
ax.plot(np.cos(theta_full), np.sin(theta_full),
        color='#aaaaaa', lw=1.5, linestyle='--')

# Coordinate axes
ax.axhline(0, color='#333', lw=1)
ax.axvline(0, color='#333', lw=1)

# The 16 standard angles: multiples of π/6 and π/4
standard_angles = [
    (0,         '0',       '(1, 0)'),
    (math.pi/6, 'π/6',     '(√3/2, 1/2)'),
    (math.pi/4, 'π/4',     '(√2/2, √2/2)'),
    (math.pi/3, 'π/3',     '(1/2, √3/2)'),
    (math.pi/2, 'π/2',     '(0, 1)'),
    (2*math.pi/3, '2π/3',  '(-1/2, √3/2)'),
    (3*math.pi/4, '3π/4',  '(-√2/2, √2/2)'),
    (5*math.pi/6, '5π/6',  '(-√3/2, 1/2)'),
    (math.pi,   'π',       '(-1, 0)'),
    (7*math.pi/6,'7π/6',   '(-√3/2, -1/2)'),
    (5*math.pi/4,'5π/4',   '(-√2/2, -√2/2)'),
    (4*math.pi/3,'4π/3',   '(-1/2, -√3/2)'),
    (3*math.pi/2,'3π/2',   '(0, -1)'),
    (5*math.pi/3,'5π/3',   '(1/2, -√3/2)'),
    (7*math.pi/4,'7π/4',   '(√2/2, -√2/2)'),
    (11*math.pi/6,'11π/6', '(√3/2, -1/2)'),
]

for theta, label, coords in standard_angles:
    x, y = math.cos(theta), math.sin(theta)

    # Dot on the circle
    ax.plot(x, y, 'o', color='#2980b9', markersize=7, zorder=5)

    # Radial line from origin to point
    ax.plot([0, x], [0, y], color='#cccccc', lw=0.8)

    # Angle label (outside the circle)
    r_label = 1.22
    ax.text(r_label*x, r_label*y, label,
            ha='center', va='center', fontsize=8,
            color='#e74c3c', fontweight='bold')

    # Coordinate label (inside, at the point)
    r_coord = 0.72
    ax.text(r_coord*x if abs(x) > 0.1 else x*0.5,
            r_coord*y if abs(y) > 0.1 else y*0.5 + (0.08 if y > 0 else -0.08),
            coords, ha='center', va='center', fontsize=6.5, color='#2c3e50')

# Label axes
ax.text(1.08, 0.04, '$x$', fontsize=12, color='#333')
ax.text(0.04, 1.08, '$y$', fontsize=12, color='#333')
ax.text(0.02, 0.02, '$O$', fontsize=11, color='#333')

ax.set_xlim(-1.55, 1.55); ax.set_ylim(-1.55, 1.55)
ax.set_aspect('equal')
ax.set_title('The Unit Circle: $x^2 + y^2 = 1$\n'
             'Point at angle $\\theta$: $(\\cos\\theta, \\sin\\theta)$',
             fontsize=12)
ax.grid(True, alpha=0.2)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `np.linspace(0, 2*np.pi, 400)` generates 400 angles
evenly spaced around the full circle. `np.cos(theta_full)` and
`np.sin(theta_full)` compute the $x$ and $y$ coordinates at each angle —
element-wise cosine and sine, producing the unit circle when plotted
against each other. `r_label = 1.22` places angle labels 22% beyond the
circle edge so they do not overlap the dots. `r_coord = 0.72` places
coordinate labels 28% inside the circle edge.

---

### The Exact Values at Key Angles

Three right triangles give exact values at $30°$, $45°$, and $60°$.

**The $45°$-$45°$-$90°$ triangle:** an isosceles right triangle with
legs of length 1 has hypotenuse $\sqrt{2}$. Therefore:

$$\cos(45°) = \cos\!\tfrac{\pi}{4} = \frac{1}{\sqrt{2}} = \frac{\sqrt{2}}{2}
\qquad
\sin(45°) = \sin\!\tfrac{\pi}{4} = \frac{\sqrt{2}}{2}$$

**The $30°$-$60°$-$90°$ triangle:** half of an equilateral triangle with
side 2. The short leg is 1, hypotenuse is 2, long leg is $\sqrt{3}$.

$$\cos(30°) = \cos\!\tfrac{\pi}{6} = \frac{\sqrt{3}}{2}, \quad \sin(30°) = \frac{1}{2}$$

$$\cos(60°) = \cos\!\tfrac{\pi}{3} = \frac{1}{2}, \quad \sin(60°) = \frac{\sqrt{3}}{2}$$

**Memory pattern:** as the angle increases from $0$ to $90°$, $\cos$ decreases
from 1 to 0 and $\sin$ increases from 0 to 1. The values are:

$$\cos\theta: \quad \frac{\sqrt{4}}{2},\ \frac{\sqrt{3}}{2},\ \frac{\sqrt{2}}{2},\ \frac{\sqrt{1}}{2},\ \frac{\sqrt{0}}{2}$$

at $0°, 30°, 45°, 60°, 90°$ respectively. (And $\sin$ is the same
sequence in reverse.) The pattern $\sqrt{4}/2$, $\sqrt{3}/2$,
$\sqrt{2}/2$, $\sqrt{1}/2$, $\sqrt{0}/2$ is the standard mnemonic.

**Values in all four quadrants:** use reference angles. The reference
angle of $\theta$ is its acute angle distance to the nearest $x$-axis.
The signs of $\cos$ and $\sin$ depend on the quadrant:

| Quadrant | $x$ sign | $y$ sign | $\cos$ sign | $\sin$ sign |
|----------|----------|----------|-------------|-------------|
| I ($0$ to $\pi/2$) | $+$ | $+$ | $+$ | $+$ |
| II ($\pi/2$ to $\pi$) | $-$ | $+$ | $-$ | $+$ |
| III ($\pi$ to $3\pi/2$) | $-$ | $-$ | $-$ | $-$ |
| IV ($3\pi/2$ to $2\pi$) | $+$ | $-$ | $+$ | $-$ |

Mnemonic: **All Students Take Calculus** — All positive (I), Sine positive
(II), Tangent positive (III), Cosine positive (IV).

**Hand-worked example:** Find $\cos(5\pi/6)$ exactly.

$5\pi/6 = 150°$ is in Quadrant II. Reference angle: $180° - 150° = 30°$,
so reference angle is $\pi/6$.

$\cos(\pi/6) = \sqrt{3}/2$. In Quadrant II, cosine is negative.

$$\cos(5\pi/6) = -\frac{\sqrt{3}}{2}$$

```python
import math
import numpy as np

# The exact values table
print("Exact values at standard angles:\n")
print(f"{'Angle':>8}  {'Degrees':>8}  {'cos':>12}  {'sin':>12}")
print("-" * 50)

exact = [
    (0,            '0',     1,           0          ),
    (math.pi/6,    '30°',   math.sqrt(3)/2, 1/2    ),
    (math.pi/4,    '45°',   math.sqrt(2)/2, math.sqrt(2)/2),
    (math.pi/3,    '60°',   1/2,         math.sqrt(3)/2),
    (math.pi/2,    '90°',   0,           1          ),
    (2*math.pi/3,  '120°',  -1/2,        math.sqrt(3)/2),
    (3*math.pi/4,  '135°',  -math.sqrt(2)/2, math.sqrt(2)/2),
    (5*math.pi/6,  '150°',  -math.sqrt(3)/2, 1/2   ),
    (math.pi,      '180°',  -1,          0          ),
    (3*math.pi/2,  '270°',  0,           -1         ),
    (2*math.pi,    '360°',  1,           0          ),
]

for theta, label, cos_exact, sin_exact in exact:
    cos_computed = math.cos(theta)
    sin_computed = math.sin(theta)
    # Verify exact = computed to within floating-point tolerance
    assert math.isclose(cos_exact, cos_computed, abs_tol=1e-10), \
        f"cos mismatch at {label}"
    assert math.isclose(sin_exact, sin_computed, abs_tol=1e-10), \
        f"sin mismatch at {label}"
    print(f"{theta/math.pi:>7.4f}π  {label:>8}  {cos_exact:>12.6f}  {sin_exact:>12.6f}")

print("\nAll exact values verified against math.cos and math.sin ✓")
```

**Walkthrough:** The `assert` statements serve as a self-test — every
exact value we state is numerically verified against `math.cos` and
`math.sin`. If any entry were wrong, the assertion would fail with a clear
error message. This is the code equivalent of checking your work.
`abs_tol=1e-10` allows for floating-point rounding at entries like
$\cos(\pi/2) = 0$, which `math.cos` returns as $6.12 \times 10^{-17}$
(not exactly 0) due to floating-point representation of $\pi$.

---

### Arc Length and Sector Area

Two direct applications of radians:

**Arc length:** the length of the arc cut by angle $\theta$ (in radians)
on a circle of radius $r$:

$$s = r\theta$$

This formula is the reason radians exist — it is clean and simple.
In degrees it would be $s = r\theta\pi/180$, an uglier formula.

**Sector area:** the area of the pie-slice region cut by angle $\theta$:

$$A = \frac{1}{2}r^2\theta$$

*Derivation:* the full circle has area $\pi r^2$. A sector with angle
$\theta$ is a fraction $\theta/(2\pi)$ of the full circle:
$A = \pi r^2 \cdot \theta/(2\pi) = r^2\theta/2$.

**Hand-worked examples:** $r = 5$ cm, $\theta = \pi/3$.

$$s = 5 \cdot \frac{\pi}{3} = \frac{5\pi}{3} \approx 5.236 \text{ cm}$$

$$A = \frac{1}{2}(5^2)\frac{\pi}{3} = \frac{25\pi}{6} \approx 13.09 \text{ cm}^2$$

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def arc_length(r, theta_rad):
    """Arc length s = r * theta (theta in radians)."""
    return r * theta_rad

def sector_area(r, theta_rad):
    """Sector area A = (1/2) * r^2 * theta (theta in radians)."""
    return 0.5 * r**2 * theta_rad

# Verify examples
r, theta = 5, math.pi/3
print(f"r={r}, theta=π/3:")
print(f"  Arc length s = {arc_length(r, theta):.4f} cm (= 5π/3)")
print(f"  Sector area A = {sector_area(r, theta):.4f} cm² (= 25π/6)")

print()
# Table for several radii and angles
print("Arc length table (s = rθ):\n")
print(f"{'r':>6}  {'θ (rad)':>10}  {'θ (deg)':>10}  {'s':>10}")
print("-" * 42)
for r in [1, 3, 5, 10]:
    for theta_deg in [30, 60, 90, 180]:
        theta_r = math.radians(theta_deg)
        s = arc_length(r, theta_r)
        print(f"{r:>6}  {theta_r:>10.4f}  {theta_deg:>10}°  {s:>10.4f}")

# Visualise a sector
fig, ax = plt.subplots(figsize=(7, 7))
r_plot, theta_plot = 3, 2*math.pi/3  # radius=3, angle=120°

# Full circle (faint)
theta_full = np.linspace(0, 2*np.pi, 300)
ax.plot(r_plot*np.cos(theta_full), r_plot*np.sin(theta_full),
        color='#cccccc', lw=1, linestyle='--')

# Shaded sector
theta_sector = np.linspace(0, theta_plot, 200)
sector_x = np.concatenate([[0], r_plot*np.cos(theta_sector), [0]])
sector_y = np.concatenate([[0], r_plot*np.sin(theta_sector), [0]])
# np.concatenate: join arrays end-to-end into one array
# used here to build the closed polygon: origin → arc → back to origin
ax.fill(sector_x, sector_y, color='#2980b9', alpha=0.3)
ax.plot(sector_x, sector_y, color='#2980b9', lw=2)

# Arc label
s_val = arc_length(r_plot, theta_plot)
mid_angle = theta_plot / 2
ax.text(r_plot*1.1*math.cos(mid_angle), r_plot*1.1*math.sin(mid_angle),
        f'$s = r\\theta = {s_val:.2f}$', fontsize=10, color='#2980b9',
        ha='center')

# Radius labels
ax.text(r_plot/2*math.cos(0)+0.1, 0.15, f'$r={r_plot}$',
        fontsize=10, color='#e74c3c')
ax.text(r_plot/2*math.cos(theta_plot)-0.4, r_plot/2*math.sin(theta_plot)+0.1,
        f'$r={r_plot}$', fontsize=10, color='#e74c3c')

# Angle arc
theta_arc = np.linspace(0, theta_plot, 100)
ax.plot(0.6*np.cos(theta_arc), 0.6*np.sin(theta_arc),
        color='#27ae60', lw=2)
ax.text(0.75*math.cos(theta_plot/2), 0.75*math.sin(theta_plot/2),
        f'$\\theta = 2\\pi/3$', fontsize=9, color='#27ae60', ha='center')

ax.axhline(0, color='#333', lw=0.8)
ax.axvline(0, color='#333', lw=0.8)
ax.set_aspect('equal')
ax.set_xlim(-1.5, 4); ax.set_ylim(-1, 4)
A_val = sector_area(r_plot, theta_plot)
ax.set_title(f'Sector: $r={r_plot}$, $\\theta=2\\pi/3$\n'
             f'Arc length $s={s_val:.3f}$, Area $A={A_val:.3f}$', fontsize=11)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `np.concatenate([[0], r_plot*np.cos(theta_sector), [0]])`
joins three arrays into one: the single value $[0]$ (the origin),
the arc's $x$-coordinates, and $[0]$ again (returning to the origin).
This creates the closed polygon needed for `ax.fill`. `ax.fill(x, y)`
fills the interior of the polygon defined by `(x, y)` — the first
appearance of this function. The `alpha=0.3` makes the fill semi-transparent
so the circle outline beneath remains visible.

---

### Coterminal Angles and Periodicity

Two angles are **coterminal** if they share the same terminal ray —
they differ by a multiple of $2\pi$:

$$\theta \text{ and } \theta + 2\pi k, \quad k \in \mathbb{Z}$$

This means cosine and sine repeat every $2\pi$:

$$\cos(\theta + 2\pi) = \cos\theta \qquad \sin(\theta + 2\pi) = \sin\theta$$

They are **periodic** with period $2\pi$.

**Hand-worked example:** Find the coterminal angle in $[0, 2\pi)$ for
$\theta = 13\pi/4$.

$$\frac{13\pi}{4} - 2\pi = \frac{13\pi}{4} - \frac{8\pi}{4} = \frac{5\pi}{4}$$

$5\pi/4$ is in $[0, 2\pi)$. So $13\pi/4$ and $5\pi/4$ are coterminal.

```python
import math

def coterminal_in_range(theta, low=0, high=2*math.pi):
    """
    Find the coterminal angle of theta in [low, high).
    Uses the modulo operation to reduce to the standard range.
    """
    period = high - low
    return ((theta - low) % period) + low
    # % period: Python's modulo finds the remainder after dividing by period
    # This maps any angle to the equivalent angle in [low, low+period)

print("Coterminal angles in [0, 2π):\n")
test_angles = [13*math.pi/4, -math.pi/3, 5*math.pi, -7*math.pi/6, 100]
for theta in test_angles:
    standard = coterminal_in_range(theta)
    print(f"  {theta/math.pi:.4f}π  →  {standard/math.pi:.4f}π  "
          f"= {math.degrees(standard):.1f}°")

print()
# Verify periodicity
theta = 2.3
for k in range(-3, 4):
    assert math.isclose(math.cos(theta), math.cos(theta + 2*math.pi*k))
    assert math.isclose(math.sin(theta), math.sin(theta + 2*math.pi*k))
print("Periodicity verified: cos(θ+2πk) = cos(θ), sin(θ+2πk) = sin(θ) for k=-3..3 ✓")
```

**Walkthrough:** `((theta - low) % period) + low` is the standard
modulo-to-range formula. `% period` gives the remainder when dividing
by `period` — always in $[0, \text{period})$. Adding `low` shifts to
$[\text{low}, \text{low}+\text{period})$. Subtracting `low` first makes
it work for ranges that do not start at 0. For example:
$(13\pi/4)\ \%\ (2\pi) = 13\pi/4 - 3\cdot(8\pi/4)/4 \cdot...$
— the `%` operator handles this arithmetic automatically.

---

## Connect the Pieces

**What this lesson built on:** The Cartesian plane (Lesson 0.4) —
the unit circle lives there. The Pythagorean theorem — $x^2+y^2=1$
comes from it. Functions and their domain/range (Lesson 0.6) —
$\cos$ and $\sin$ are functions $\mathbb{R} \to [-1,1]$.

**What this lesson makes possible:** Lesson 2.2 (graphs of $\sin$
and $\cos$), Lesson 2.3 (all six trig functions), and every subsequent
trig lesson build directly on the unit circle definition established here.
Stage 3 (Analytic Geometry) uses angles and the unit circle for polar
coordinates. Stage 5 (Calculus) derives $\frac{d}{d\theta}\sin\theta
= \cos\theta$ — which only works this cleanly because we used radians.

**In manufacturing:** CNC machines use angles in radians internally
for G-code arc calculations. The arc length formula $s=r\theta$ is
literally used to compute how far a tool travels along a circular arc.
Rotation matrices (Stage 4) are built from $\cos$ and $\sin$ defined
exactly as here.

---

## Summary

**Radians:** $2\pi$ rad $= 360°$. Conversion: multiply by $\pi/180$
or $180/\pi$.

**Unit circle:** $x^2+y^2=1$. The point at angle $\theta$ is
$(\cos\theta, \sin\theta)$.

**Pythagorean identity:** $\cos^2\theta + \sin^2\theta = 1$.

**Exact values** (memorise):

| $\theta$ | $0$ | $\pi/6$ | $\pi/4$ | $\pi/3$ | $\pi/2$ |
|----------|-----|---------|---------|---------|---------|
| $\cos\theta$ | $1$ | $\dfrac{\sqrt{3}}{2}$ | $\dfrac{\sqrt{2}}{2}$ | $\dfrac{1}{2}$ | $0$ |
| $\sin\theta$ | $0$ | $\dfrac{1}{2}$ | $\dfrac{\sqrt{2}}{2}$ | $\dfrac{\sqrt{3}}{2}$ | $1$ |

**ASTC sign rule:** All (I), Sin (II), Tan (III), Cos (IV).

**Arc length:** $s = r\theta$. **Sector area:** $A = \tfrac{1}{2}r^2\theta$.

**Periodicity:** $\cos(\theta+2\pi) = \cos\theta$, $\sin(\theta+2\pi)=\sin\theta$.

**New Python:**
- `math.radians(deg)` — degrees to radians
- `math.degrees(rad)` — radians to degrees
- `math.cos(theta)`, `math.sin(theta)` — cosine, sine of angle in radians
- `np.cos(arr)`, `np.sin(arr)` — element-wise on arrays
- `ax.fill(x, y)` — fill interior of a polygon
- `np.concatenate([a, b, c])` — join arrays end-to-end
- `theta % (2*math.pi)` — reduce angle to $[0, 2\pi)$

---

## Problems

### Math

**1.** Convert to radians (exact, in terms of $\pi$).

(a) $225°$ &emsp; (b) $315°$ &emsp; (c) $-150°$ &emsp; (d) $540°$

<details>
<summary>Answers</summary>

(a) $\dfrac{5\pi}{4}$ &emsp;
(b) $\dfrac{7\pi}{4}$ &emsp;
(c) $-\dfrac{5\pi}{6}$ &emsp;
(d) $3\pi$

</details>

---

**2.** Find the exact value of each expression.

(a) $\cos(5\pi/4)$ &emsp;
(b) $\sin(4\pi/3)$ &emsp;
(c) $\cos(-\pi/6)$ &emsp;
(d) $\sin(7\pi/6)$

<details>
<summary>Answers</summary>

(a) $-\sqrt{2}/2$ (QII, ref angle $\pi/4$, cos negative)

(b) $-\sqrt{3}/2$ (QIII, ref angle $\pi/3$, sin negative)

(c) $\sqrt{3}/2$ ($\cos$ is even: $\cos(-\theta)=\cos\theta$)

(d) $-1/2$ (QIII, ref angle $\pi/6$, sin negative)

</details>

---

**3.** A CNC router cuts a circular arc of radius 150 mm through
an angle of $\theta = 2.4$ rad.

(a) What is the arc length the tool travels?

(b) What is the area swept by the cutting radius?

(c) The feed rate is 800 mm/min along the arc. How long does the cut take?

<details>
<summary>Answers</summary>

(a) $s = 150 \times 2.4 = 360$ mm

(b) $A = \frac{1}{2}(150)^2(2.4) = 27{,}000$ mm²

(c) $t = 360/800 = 0.45$ min $= 27$ seconds

</details>

---

**4.** (Proof) Prove that $\cos^2\theta + \sin^2\theta = 1$ for all
$\theta$, using only the definition of $\cos$ and $\sin$ as coordinates
on the unit circle.

<details>
<summary>Answer</summary>

By definition, $(\cos\theta, \sin\theta)$ is a point on the unit circle
$x^2+y^2=1$. Substituting: $\cos^2\theta + \sin^2\theta = 1$. $\blacksquare$

This is not a coincidence or a theorem to prove from other facts — it is
an immediate consequence of the definition. The unit circle *is* the
set of points satisfying $x^2+y^2=1$, and $\cos$/$\sin$ are defined as
the coordinates of a point on it.

</details>

---

### Code Challenges

**Challenge 1 — Unit circle values**

```python
import math

def unit_circle_point(theta_rad):
    """
    Return (cos(theta), sin(theta)) as a tuple.
    theta_rad: angle in radians
    """
    pass

def angle_to_quadrant(theta_rad):
    """
    Return which quadrant (1, 2, 3, or 4) the angle is in.
    Reduce to [0, 2π) first.
    Returns 0 for angles on the axes (multiples of π/2).
    """
    pass


# --- tests: do not modify ---
x, y = unit_circle_point(0)
assert math.isclose(x, 1) and math.isclose(y, 0)

x, y = unit_circle_point(math.pi/2)
assert math.isclose(x, 0, abs_tol=1e-10) and math.isclose(y, 1)

x, y = unit_circle_point(math.pi)
assert math.isclose(x, -1) and math.isclose(y, 0, abs_tol=1e-10)

# Pythagorean identity holds for all angles
import numpy as np
for theta in np.linspace(0, 4*math.pi, 100):
    x, y = unit_circle_point(theta)
    assert math.isclose(x**2 + y**2, 1, rel_tol=1e-10), \
        f"Pythagorean identity failed at theta={theta}"

assert angle_to_quadrant(math.pi/4)    == 1
assert angle_to_quadrant(3*math.pi/4)  == 2
assert angle_to_quadrant(5*math.pi/4)  == 3
assert angle_to_quadrant(7*math.pi/4)  == 4
assert angle_to_quadrant(0)            == 0   # on the axis

print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Arc and sector calculator**

```python
import math

def arc_length(r, theta_deg):
    """Arc length for radius r and angle theta given in DEGREES."""
    pass

def sector_area(r, theta_deg):
    """Sector area for radius r and angle theta given in DEGREES."""
    pass

def central_angle_from_arc(r, s):
    """
    Find the central angle (in degrees) given radius r and arc length s.
    """
    pass


# --- tests: do not modify ---
assert math.isclose(arc_length(1, 180),   math.pi,        rel_tol=1e-9)
assert math.isclose(arc_length(5, 60),    5*math.pi/3,    rel_tol=1e-9)
assert math.isclose(sector_area(1, 360),  math.pi,        rel_tol=1e-9)
assert math.isclose(sector_area(5, 60),   25*math.pi/6,   rel_tol=1e-9)
assert math.isclose(central_angle_from_arc(5, 5*math.pi/3), 60.0, rel_tol=1e-9)

print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Draw the unit circle**

Reproduce the unit circle diagram from the lesson — the 16 standard
angles with exact coordinate labels — as a standalone function you can
call with any set of angles.

```python
import matplotlib.pyplot as plt
import numpy as np
import math

def draw_unit_circle(angles_rad, labels, figsize=(9, 9)):
    """
    Draw the unit circle and mark each angle in angles_rad
    with its label and coordinate values.
    
    angles_rad: list of angles in radians
    labels:     list of angle labels (e.g. ['π/6', 'π/4', ...])
    """
    pass   # your code here


# Test with the 8 multiples of π/4
angles = [k*math.pi/4 for k in range(8)]
labels = ['$0$','$\\pi/4$','$\\pi/2$','$3\\pi/4$',
          '$\\pi$','$5\\pi/4$','$3\\pi/2$','$7\\pi/4$']
draw_unit_circle(angles, labels)
```

---

### Extension

**4. ★** The **radian measure** of an angle can be defined without
reference to the unit circle: it is the ratio of arc length to radius,
$\theta = s/r$, for any circle. Prove that this ratio is the same
regardless of the radius $r$ chosen — that is, the ratio $s/r$ is a
property of the angle alone, not of the particular circle.

<details>
<summary>Answer</summary>

Two circles of radii $r_1$ and $r_2$ centred at the same point, with the
same central angle $\theta$. The arcs $s_1$ and $s_2$ are proportional
to the radii (since the arcs are similar): $s_1/s_2 = r_1/r_2$.
Therefore $s_1/r_1 = s_2/r_2$. The ratio $s/r$ is the same for both
circles — it depends only on $\theta$, not on $r$. $\blacksquare$

</details>

**5. ★** The unit circle can be parametrised as $(\cos t, \sin t)$ for
$t \in [0, 2\pi)$. Prove that this map is a bijection from $[0, 2\pi)$
to the unit circle $\{(x,y) : x^2+y^2=1\}$.

<details>
<summary>Answer</summary>

**Injective:** Suppose $(\cos t_1, \sin t_1) = (\cos t_2, \sin t_2)$
with $t_1, t_2 \in [0,2\pi)$. Then both points are at the same location
on the unit circle, which corresponds to a unique angle in $[0,2\pi)$.
So $t_1 = t_2$. ✓

**Surjective:** Let $(x,y)$ with $x^2+y^2=1$. Since $x\in[-1,1]$,
there exists $\theta\in[0,\pi]$ with $\cos\theta = x$. Then
$\sin\theta = \pm\sqrt{1-x^2} = \pm|y|$. Choose $\theta$ or $2\pi-\theta$
to match the sign of $y$. This gives $t\in[0,2\pi)$ with
$(\cos t, \sin t) = (x,y)$. ✓ $\square$

</details>
