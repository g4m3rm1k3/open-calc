# Stage 1, Lesson 1.14 — The Complex Plane (Argand Diagrams)
**Threads:** Math · Physics · CS  
**Estimated time:** 50–65 minutes

---

## What This Lesson Is About

Every complex number $z = a + bi$ has two independent components —
its real part $a$ and its imaginary part $b$. These two numbers locate
a point uniquely in a **plane**: the real axis runs left-right and the
imaginary axis runs up-down. This plane is called the **complex plane**
or the **Argand diagram**, and it is one of the most powerful tools in
mathematics: it makes the algebra of complex numbers visible, turns
multiplication into a geometric operation (rotation + scaling), and
reveals why complex numbers describe waves and oscillations so naturally.

This lesson builds the full geometric picture: how to plot any complex
number, how to read off real and imaginary parts, how addition becomes
vector translation, how the modulus is a distance, and how conjugation
is a reflection. The geometric understanding developed here is
prerequisite for Lesson 1.15 (polar form), where you will see that
every complex number can also be described by its distance from the
origin and its angle — a representation that makes multiplication
particularly transparent.

---

## Historical Context

Jean-Robert Argand, a Parisian bookkeeper and amateur mathematician,
published his geometric interpretation of complex numbers in 1806 in
a self-published pamphlet. He independently rediscovered the same idea
that Caspar Wessel (1799, unpublished) and Gauss (1811, in private
letters) had developed. The geometric representation solved a long-standing
philosophical problem: if $i = \sqrt{-1}$ has no place on the real
number line, where does it live? Argand's answer: on a perpendicular
axis. The imaginary unit $i$ is the point one unit above the origin,
not to the right of it. Gauss popularised the idea and introduced
the term "complex number" (from the Latin *complexus*, meaning
"entwined together"), rejecting Descartes' dismissive "imaginary."

---

## What You Need To Know First

- **Complex number form** $z = a + bi$, real part, imaginary part (Lesson 1.12).
- **Modulus** $|z| = \sqrt{a^2+b^2}$ (Lesson 1.13).
- **Conjugate** $\bar{z} = a - bi$ and its properties (Lesson 1.13).
- **Addition**: $(a+bi)+(c+di) = (a+c)+(b+d)i$ — component-wise (Lesson 1.13).

---

## The Lesson

### Setting Up the Complex Plane

The complex plane is a standard Cartesian coordinate system with one
specific assignment:
- The **horizontal axis** ($x$-axis) is the **real axis**: the point
  $(a, 0)$ represents the real number $a$.
- The **vertical axis** ($y$-axis) is the **imaginary axis**: the
  point $(0, b)$ represents the purely imaginary number $bi$.
- A general complex number $z = a + bi$ is the point $(a, b)$.

**Notation:** we write $z \leftrightarrow (a, b)$ or simply plot $z$ at
the coordinates $(a, b)$.

**Key points to memorise:**
- $0 \to (0, 0)$, the origin
- $1 \to (1, 0)$, on the real axis
- $i \to (0, 1)$, one unit above the origin
- $-1 \to (-1, 0)$
- $-i \to (0, -1)$
- $3 + 4i \to (3, 4)$

**Geometric lens:** real numbers lie entirely on the horizontal axis.
Purely imaginary numbers lie entirely on the vertical axis. Complex
numbers with both parts nonzero occupy the interior of the plane.
The complex plane literally contains the real number line as a subset.

**Formal lens:** the complex plane is a bijection between $\mathbb{C}$
and $\mathbb{R}^2$. Every point in the plane corresponds to exactly
one complex number, and every complex number to exactly one point.
But $\mathbb{C}$ has more structure than $\mathbb{R}^2$: it has
multiplication, which $\mathbb{R}^2$ vectors do not naturally inherit.

```python
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(9, 9))

# Plot key complex numbers
points = {
    '0':    (0, 0),
    '1':    (1, 0),
    'i':    (0, 1),
    '-1':   (-1, 0),
    '-i':   (0, -1),
    '3+4i': (3, 4),
    '2-3i': (2, -3),
    '-2+i': (-2, 1),
    '-1-2i':(-1, -2),
}
colors = ['#333333', '#2980b9', '#e74c3c', '#2980b9', '#e74c3c',
          '#27ae60', '#8e44ad', '#e67e22', '#c0392b']

for (label, (x, y)), color in zip(points.items(), colors):
    ax.scatter([x], [y], s=100, color=color, zorder=5)
    # Annotate with offset to avoid overlap
    dx, dy = 0.1, 0.12
    if x < 0: dx = -0.35
    ax.annotate(f'$z = {label}$\n$({x},{y})$', xy=(x, y),
                xytext=(x+dx, y+dy), fontsize=8.5, color=color)

# Draw a radius line to 3+4i to illustrate modulus
ax.plot([0, 3], [0, 4], color='#27ae60', lw=2, linestyle='--', alpha=0.8)
ax.annotate('$|z|=\\sqrt{3^2+4^2}=5$', xy=(1.5, 2.2),
            fontsize=9, color='#27ae60', rotation=53)

# Real and imaginary axes
ax.axhline(0, color='#333', lw=1.5)
ax.axvline(0, color='#333', lw=1.5)

# Dashed lines from 3+4i to real and imaginary axes (showing components)
ax.plot([3, 3], [0, 4], color='#888', lw=1, ls=':')   # vertical
ax.plot([0, 3], [4, 4], color='#888', lw=1, ls=':')   # horizontal
ax.annotate('Re(z) = 3', xy=(1.5, 0), xytext=(1.5, -0.25),
            fontsize=8, ha='center', color='#888')
ax.annotate('Im(z) = 4', xy=(0, 2), xytext=(-0.9, 2),
            fontsize=8, ha='center', color='#888', rotation=90)

ax.set_xlim(-3.5, 4.5); ax.set_ylim(-4, 5.5)
ax.set_xlabel('Real axis', fontsize=12)
ax.set_ylabel('Imaginary axis', fontsize=12)
ax.set_title('The Complex Plane (Argand Diagram)\nEach $z = a+bi$ is the point $(a, b)$', fontsize=12)
ax.grid(True, alpha=0.3)
ax.set_aspect('equal')
plt.tight_layout(); plt.show()
```

**Walkthrough:** each call to `ax.scatter([x], [y], ...)` plots a single
dot; wrapping scalars in lists `[x]`, `[y]` is required because
`ax.scatter` expects array-like arguments. `ax.annotate(text, xy=tip, xytext=label_pos)`
places `text` at `xytext` with an implicit connection to point `xy`.
The dotted lines from $(3, 4)$ to the axes show the real and imaginary
components geometrically, the same way you read off coordinates in a
Cartesian system.

---

### Geometric Interpretation of Operations

**Addition — vector translation:**

Adding $w = c + di$ to $z = a + bi$ shifts the point $z$ by the
vector $(c, d)$. The result $(a+c, b+d)$ is the tip of the parallelogram
with vertices at $0$, $z$, $w$, and $z+w$. This is exactly the
**parallelogram rule** for vector addition.

**Subtraction — displacement vector:**

$z_2 - z_1$ is the vector from $z_1$ to $z_2$. Its length $|z_2 - z_1|$
is the **distance between the two points** in the complex plane.

$$d(z_1, z_2) = |z_2 - z_1| = \sqrt{(a_2-a_1)^2 + (b_2-b_1)^2}$$

This is simply the Euclidean distance formula.

**Conjugate — reflection:**

$\bar{z} = a - bi$ reflects $z = a + bi$ across the real axis. The
real part is unchanged; the imaginary part changes sign. Geometrically:
the point $(a, b)$ is reflected to $(a, -b)$.

**Modulus — distance from origin:**

$|z| = \sqrt{a^2+b^2}$ is the distance from the origin to the point
$(a, b)$ — the Pythagorean theorem. The **unit circle** $|z| = 1$
is the set of all complex numbers at distance 1 from the origin.

**Circles in the complex plane:**

The equation $|z - z_0| = r$ describes all points at distance $r$
from $z_0$ — a **circle** centred at $z_0$ with radius $r$.

$|z - (2+i)| = 3$: circle of radius 3 centred at $2+i$ (the point $(2,1)$).

**Lines in the complex plane:**

$\text{Re}(z) = 3$: the vertical line $a = 3$.
$\text{Im}(z) = -1$: the horizontal line $b = -1$.

```python
import numpy as np
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 2, figsize=(14, 7))

# ---- Left: operations as geometry ----
ax = axes[0]

z1 = complex(1, 2)
z2 = complex(3, 1)
z_sum = z1 + z2
z_diff = z2 - z1
z1_conj = z1.conjugate()

# Vectors from origin
for z, color, label in [(z1, '#2980b9', 'z₁=1+2i'),
                         (z2, '#e74c3c', 'z₂=3+i'),
                         (z_sum, '#27ae60', 'z₁+z₂=4+3i')]:
    ax.annotate('', xy=(z.real, z.imag), xytext=(0,0),
                arrowprops=dict(arrowstyle='->', color=color, lw=2))
    ax.scatter([z.real], [z.imag], s=80, color=color, zorder=5)
    ax.annotate(label, xy=(z.real, z.imag), xytext=(z.real+0.1, z.imag+0.1),
                fontsize=9, color=color)

# Parallelogram sides (dashed)
ax.annotate('', xy=(z_sum.real, z_sum.imag), xytext=(z1.real, z1.imag),
            arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=1.5, ls='dashed'))
ax.annotate('', xy=(z_sum.real, z_sum.imag), xytext=(z2.real, z2.imag),
            arrowprops=dict(arrowstyle='->', color='#2980b9', lw=1.5, ls='dashed'))

# Conjugate (reflection)
ax.scatter([z1_conj.real], [z1_conj.imag], s=80, color='#8e44ad', marker='D', zorder=5)
ax.annotate('z̄₁=1-2i\n(reflection)', xy=(z1_conj.real, z1_conj.imag),
            xytext=(z1_conj.real+0.15, z1_conj.imag-0.3), fontsize=8.5, color='#8e44ad')
ax.plot([z1.real, z1_conj.real], [z1.imag, z1_conj.imag],
        color='#8e44ad', lw=1.5, ls=':', zorder=4)

ax.axhline(0, color='#333', lw=1.5)
ax.axvline(0, color='#333', lw=1.5)
ax.set_xlim(-1, 5); ax.set_ylim(-3, 4)
ax.set_aspect('equal')
ax.set_xlabel('Real'); ax.set_ylabel('Imaginary')
ax.set_title('Addition = parallelogram; conjugate = reflection', fontsize=10)
ax.grid(True, alpha=0.3)

# ---- Right: circles and unit circle ----
ax = axes[1]
theta = np.linspace(0, 2*np.pi, 300)

# Unit circle
ax.plot(np.cos(theta), np.sin(theta), color='#2980b9', lw=2.5, label='|z|=1 (unit circle)')

# Circle |z - (2+i)| = 1.5
z0 = 2 + 1j
r  = 1.5
ax.plot(z0.real + r*np.cos(theta), z0.imag + r*np.sin(theta),
        color='#e74c3c', lw=2, label=f'|z-(2+i)|={r}')
ax.scatter([z0.real], [z0.imag], s=80, color='#e74c3c', zorder=5)
ax.annotate('centre\n2+i', xy=(z0.real, z0.imag),
            xytext=(z0.real+0.1, z0.imag+0.1), fontsize=8, color='#e74c3c')

# Mark unit-circle special points
for z, label in [(1+0j,'1'), (1j,'i'), (-1+0j,'-1'), (-1j,'-i'),
                  ((1+1j)/np.sqrt(2), '(1+i)/√2')]:
    ax.scatter([z.real], [z.imag], s=60, color='#2980b9', zorder=6)
    ax.annotate(label, xy=(z.real, z.imag),
                xytext=(z.real+0.08, z.imag+0.08), fontsize=8, color='#2980b9')

ax.axhline(0, color='#333', lw=1.5)
ax.axvline(0, color='#333', lw=1.5)
ax.set_xlim(-2, 4); ax.set_ylim(-2, 2.5)
ax.set_aspect('equal')
ax.set_xlabel('Real'); ax.set_ylabel('Imaginary')
ax.set_title('|z|=1: unit circle; |z-z₀|=r: circle centred at z₀', fontsize=10)
ax.legend(fontsize=9)
ax.grid(True, alpha=0.3)

plt.suptitle('Geometry of the Complex Plane', fontsize=12)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `z1.conjugate()` returns the complex conjugate.
`z.real` and `z.imag` give the components. The unit circle is
plotted as `(cos θ, sin θ)` for $\theta \in [0, 2\pi)$: these
are exactly the points where $a^2+b^2 = 1$.
For the circle $|z-z_0|=r$, the centre is shifted: `z0.real + r*cos(θ)`
and `z0.imag + r*sin(θ)`.

---

### Regions in the Complex Plane

Just as inequalities on the real line define intervals, inequalities
on the complex plane define regions (sets of points).

| Condition | Geometric region |
|-----------|-----------------|
| $|z| < r$ | Open disk of radius $r$ centred at origin |
| $|z| \leq r$ | Closed disk |
| $r_1 < |z| < r_2$ | Annulus (ring) between two circles |
| $\text{Re}(z) > 0$ | Right half-plane |
| $\text{Im}(z) \leq 0$ | Lower half-plane (including real axis) |
| $|z - z_0| \leq r$ | Closed disk centred at $z_0$ |
| $0 < |z - z_0| < r$ | Punctured disk (disk minus the point $z_0$) |

**Hand-worked example:** describe the set $\{z : |z - 1| = |z + 1|\}$.

$|z-1| = |z+1|$ means "distance from $z$ to $1$" equals "distance from $z$
to $-1$". This is the set of points equidistant from $(1, 0)$ and $(-1, 0)$
— the perpendicular bisector of the segment joining them, which is the
**imaginary axis** $\text{Re}(z) = 0$.

**Verification:** if $z = bi$ (on imaginary axis): $|bi-1| = \sqrt{1+b^2}$
and $|bi+1| = \sqrt{1+b^2}$. Equal. ✓

```python
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.colors import ListedColormap

fig, axes = plt.subplots(1, 3, figsize=(16, 5))

N = 400
x = np.linspace(-3, 3, N)
y = np.linspace(-3, 3, N)
X, Y = np.meshgrid(x, y)   # X[i,j]=x[j], Y[i,j]=y[i] over the grid

# Each (X[i,j], Y[i,j]) represents the complex number X[i,j] + i*Y[i,j]

# Left: |z| < 2 (open disk)
Z_mod = np.sqrt(X**2 + Y**2)
mask1 = Z_mod < 2.0   # boolean array: True where condition holds
axes[0].contourf(X, Y, mask1.astype(float), levels=[0.5, 1.5],
                 colors=['#aed6f1'], alpha=0.7)
axes[0].contour(X, Y, Z_mod, levels=[2.0], colors=['#2980b9'], linewidths=2)
axes[0].set_title('$|z| < 2$: open disk', fontsize=10)

# Middle: annulus 1 < |z| < 2
mask2 = (Z_mod > 1) & (Z_mod < 2)   # & is element-wise AND on arrays
axes[1].contourf(X, Y, mask2.astype(float), levels=[0.5, 1.5],
                 colors=['#a9dfbf'], alpha=0.7)
axes[1].contour(X, Y, Z_mod, levels=[1.0, 2.0], colors=['#27ae60'], linewidths=2)
axes[1].set_title('$1 < |z| < 2$: annulus', fontsize=10)

# Right: Re(z) > 0 (right half-plane)
mask3 = X > 0
axes[2].contourf(X, Y, mask3.astype(float), levels=[0.5, 1.5],
                 colors=['#f9e79f'], alpha=0.7)
axes[2].axvline(0, color='#e67e22', lw=2, label='Re(z)=0 boundary')
axes[2].set_title('$\\text{Re}(z) > 0$: right half-plane', fontsize=10)

for ax in axes:
    ax.axhline(0, color='#333', lw=1)
    ax.axvline(0, color='#333', lw=1)
    ax.set_aspect('equal')
    ax.set_xlabel('Re'); ax.set_ylabel('Im')
    ax.set_xlim(-3, 3); ax.set_ylim(-3, 3)
    ax.grid(True, alpha=0.2)

plt.suptitle('Regions in the complex plane defined by inequalities', fontsize=11)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `np.meshgrid(x, y)` produces two 2D arrays `X` and `Y`:
at position `[i,j]`, `X[i,j] = x[j]` and `Y[i,j] = y[i]`. So
`X + 1j*Y` (if we computed it) would give the complex number at each
grid point. `Z_mod = np.sqrt(X**2 + Y**2)` computes $|z|$ at every
point simultaneously. `mask1 = Z_mod < 2.0` is a boolean array —
`True` at every grid point satisfying the condition. `mask2 = (Z_mod > 1) & (Z_mod < 2)`
uses `&` for element-wise boolean AND. `ax.contourf` fills regions.
`mask.astype(float)` converts `True/False` to `1.0/0.0` so `contourf`
can identify the shaded region.

---

### Multiplication by $i$ is a 90° Rotation

This is one of the most important geometric facts in all of complex analysis.

**Claim:** multiplying a complex number $z = a + bi$ by $i$ rotates
it 90° counter-clockwise around the origin.

**Proof:** $iz = i(a+bi) = ai + bi^2 = -b + ai$.

The point $(a, b)$ maps to $(-b, a)$. Let's check: the vector $(-b, a)$
is the vector $(a, b)$ rotated 90° CCW. (Rotating $(a, b)$ by 90° CCW
gives the vector perpendicular to it, with the same length, in the
CCW direction, which is $(-b, a)$.)

**Verification of length:** $|-b+ai| = \sqrt{b^2+a^2} = |a+bi| = |z|$.
Rotation preserves length. ✓

**Applying twice:** $i^2 z = i(iz) = i(-b+ai) = -ai + ai^2 = -a - bi = -z$.
Rotating by 90° twice is the same as multiplying by $-1$ — rotation by 180°,
which sends $z$ to $-z$ (reflection through the origin). ✓

**Physical lens:** In AC circuits, the impedance of an ideal inductor is
$j\omega L$ (pure imaginary). Multiplying the current phasor by $j\omega L$
to get the voltage means rotating the current by 90° — the voltage
across an inductor leads the current by 90°. The phase shift in AC
circuits is exactly this rotation.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

fig, axes = plt.subplots(1, 2, figsize=(13, 6))

# Left: rotating z by multiplying by i (repeated)
z_original = complex(3, 1)
rotations  = [z_original * (1j)**n for n in range(5)]   # i^0, i^1, i^2, i^3, i^4
colors_rot = ['#2980b9', '#e74c3c', '#27ae60', '#e67e22', '#8e44ad']
labels_rot = ['z', 'iz', 'i²z = -z', 'i³z', 'i⁴z = z']

ax = axes[0]
for z, color, label in zip(rotations, colors_rot, labels_rot):
    ax.annotate('', xy=(z.real, z.imag), xytext=(0, 0),
                arrowprops=dict(arrowstyle='->', color=color, lw=2.5))
    ax.scatter([z.real], [z.imag], s=90, color=color, zorder=5)
    ax.annotate(f'{label}\n={z}', xy=(z.real, z.imag),
                xytext=(z.real+0.1, z.imag+0.1), fontsize=8, color=color)

# Draw circular arc showing rotation
theta_arc = np.linspace(0, 3*np.pi/2, 100)
r_arc = abs(z_original)
ax.plot(r_arc*np.cos(theta_arc), r_arc*np.sin(theta_arc),
        color='#bbb', lw=1.5, ls='--', zorder=3)

ax.axhline(0, color='#333', lw=1); ax.axvline(0, color='#333', lw=1)
ax.set_xlim(-4, 4); ax.set_ylim(-4, 4)
ax.set_aspect('equal')
ax.set_xlabel('Real'); ax.set_ylabel('Imaginary')
ax.set_title('Multiplying by $i$ rotates 90° CCW\n$iz = -b+ai$ for $z = a+bi$', fontsize=10)
ax.grid(True, alpha=0.3)

# Right: visualise angle (argument) of several numbers
ax = axes[1]
unit_pts = [(1+0j, '0°'), (1j, '90°'), (-1+0j, '180°'), (-1j, '-90°'),
             ((1+1j)/math.sqrt(2), '45°'), ((1-1j)/math.sqrt(2), '-45°')]

theta_full = np.linspace(0, 2*np.pi, 300)
ax.plot(np.cos(theta_full), np.sin(theta_full), color='#ddd', lw=2)

for z, angle_label in unit_pts:
    ax.annotate('', xy=(z.real*0.95, z.imag*0.95), xytext=(0,0),
                arrowprops=dict(arrowstyle='->', color='#2980b9', lw=2))
    ax.scatter([z.real], [z.imag], s=80, color='#e74c3c', zorder=5)
    ax.annotate(angle_label, xy=(z.real, z.imag),
                xytext=(z.real*1.15, z.imag*1.15), fontsize=9, color='#e74c3c', ha='center')

# Draw angle arc for 45° point
theta_small = np.linspace(0, math.pi/4, 40)
ax.plot(0.3*np.cos(theta_small), 0.3*np.sin(theta_small), color='#888', lw=1.5)
ax.annotate('45°', xy=(0.35, 0.12), fontsize=8, color='#888')

ax.axhline(0, color='#333', lw=1); ax.axvline(0, color='#333', lw=1)
ax.set_xlim(-1.5, 1.5); ax.set_ylim(-1.5, 1.5)
ax.set_aspect('equal')
ax.set_xlabel('Real'); ax.set_ylabel('Imaginary')
ax.set_title('Angles on the unit circle: the argument of $z$\n(detailed in Lesson 1.15)', fontsize=10)
ax.grid(True, alpha=0.3)

plt.suptitle('Multiplication by $i$ = rotation by 90°', fontsize=11)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `[z_original * (1j)**n for n in range(5)]` is a list
comprehension computing $z, iz, i^2z, i^3z, i^4z$. `(1j)**n` uses
Python's built-in complex exponentiation. `math.pi/4` is $\pi/4$ radians
= 45°. `np.linspace(0, math.pi/4, 40)` creates 40 points from 0 to
$\pi/4$ for drawing the 45° arc.

---

### Distance and Loci

A **locus** is a set of complex numbers $z$ satisfying some condition.
Geometric thinking in the complex plane lets us identify many loci
immediately.

**Example 1 — Equidistant from two points:**
$|z - z_1| = |z - z_2|$ is the perpendicular bisector of the
segment from $z_1$ to $z_2$.

**Example 2 — Sum of distances constant:**
$|z - z_1| + |z - z_2| = c$ (for $c > |z_1 - z_2|$) is an **ellipse**
with foci at $z_1$ and $z_2$.

**Example 3 — Circle through algebra:**
$|z - 1| = 2$: a circle. Expanding: $|(x-1) + iy|^2 = 4$,
so $(x-1)^2 + y^2 = 4$ — a circle centred at $(1, 0)$ with radius $2$.

**Example 4 — Apollonius circles:**
$|z - z_1|/|z - z_2| = k$ (constant) for $k \neq 1$ is a circle (the
Apollonius circle). For $k = 1$: the perpendicular bisector.

**Hand-worked example:** find and describe the locus $|z - 2| = |z - 2i|$.

This is the set of points equidistant from $2 = (2, 0)$ and $2i = (0, 2)$.
It is the perpendicular bisector of the segment from $(2,0)$ to $(0,2)$.
The midpoint is $(1, 1)$ and the segment has slope $-1$, so the
perpendicular bisector has slope $+1$ and passes through $(1, 1)$:

$$y - 1 = 1(x - 1) \implies y = x$$

In complex notation: $\text{Im}(z) = \text{Re}(z)$, i.e., $b = a$.

---

## Connect the Pieces

**What this lesson built on:** all of complex arithmetic (Lesson 1.13);
the fact that complex numbers have two independent components (Lesson 1.12).
The distance formula $|z_1-z_2| = \sqrt{(a_1-a_2)^2+(b_1-b_2)^2}$ is
the Pythagorean theorem applied to $\mathbb{R}^2$.

**What this lesson enables:** Lesson 1.15 (polar form — the angle is
the argument $\arg(z)$, which the complex plane makes visible). Lesson 1.16
(Euler's formula — the unit circle is the setting for $e^{i\theta}$).
Stage 3 Fourier analysis — the spectrum is plotted in the complex plane.
Control theory — poles and zeros of transfer functions are plotted in
the complex plane and their positions determine stability.

---

## Summary

- Every $z = a+bi$ is plotted at the point $(a, b)$ in the **complex plane**.
- Real numbers lie on the **horizontal (real) axis**; purely imaginary
  numbers lie on the **vertical (imaginary) axis**.
- $|z|$ = distance from origin; $|z_1-z_2|$ = distance between points.
- $\bar{z}$ = reflection across the real axis.
- Addition = vector addition (parallelogram rule).
- $|z-z_0| = r$: a circle centred at $z_0$ with radius $r$.
- Multiplying by $i$ = rotation by 90° CCW.

**New Python:**
- `np.meshgrid(x, y)` — grid of coordinates for region plotting
- `mask.astype(float)` — convert boolean array for `contourf`
- `ax.contourf(X, Y, Z, levels=...)` — fill a region

---

## Problems

### Math

**1.** Plot each of the following on an Argand diagram (sketch by hand, label
real and imaginary parts):

$z_1 = 4 + 3i$, $z_2 = -2 + i$, $z_3 = 3i$, $z_4 = -4 - 2i$, $z_5 = 5$.

For each: find $|z_k|$ and $|\bar{z}_k|$.

<details>
<summary>Answers</summary>

$|z_1| = \sqrt{16+9} = 5$, $|\bar{z}_1| = 5$.
$|z_2| = \sqrt{4+1} = \sqrt{5}$, $|\bar{z}_2| = \sqrt{5}$.
$|z_3| = 3$, $|\bar{z}_3| = 3$.
$|z_4| = \sqrt{16+4} = \sqrt{20} = 2\sqrt{5}$, $|\bar{z}_4| = 2\sqrt{5}$.
$|z_5| = 5$, $|\bar{z}_5| = 5$.

In all cases $|z| = |\bar{z}|$ (reflection preserves distance from origin).

</details>

---

**2.** Describe (in words and as an equation in $x$ and $y$) each locus:

(a) $|z| = 5$
(b) $|z - 3| = 2$
(c) $\text{Re}(z) = -1$
(d) $|z - i| = |z + i|$
(e) $|z - 1| + |z + 1| = 4$

<details>
<summary>Answers</summary>

(a) Circle $x^2+y^2=25$, radius 5 centred at origin.
(b) Circle $(x-3)^2+y^2=4$, radius 2 centred at $(3,0)$.
(c) Vertical line $x=-1$.
(d) Equidistant from $(0,1)$ and $(0,-1)$: perpendicular bisector = real axis, $y=0$.
(e) Ellipse with foci $(\pm 1, 0)$ and sum-of-distances = 4: semi-major $a=2$, $c=1$, $b=\sqrt{3}$. Equation: $x^2/4 + y^2/3 = 1$.

</details>

---

**3.** (a) Show that multiplying $z = a + bi$ by $i$ gives the rotation $(a,b) \to (-b, a)$.
(b) Verify that $|iz| = |z|$ — rotation preserves modulus.
(c) What rotation does multiplication by $-i$ correspond to?

<details>
<summary>Answers</summary>

(a) $iz = i(a+bi) = ai + bi^2 = -b + ai$. Point $(-b, a)$ is $(a,b)$ rotated 90° CCW. $\square$
(b) $|iz| = |-b+ai| = \sqrt{b^2+a^2} = |z|$. $\square$
(c) $(-i)z = (-i)(a+bi) = -ai - bi^2 = b - ai$. Point $(b, -a)$ is $(a,b)$ rotated 90° CW (i.e., $-90°$).

</details>

---

**4.** (Proof) Prove that for any $z_1, z_2 \in \mathbb{C}$:

$$|z_1 - z_2| \geq \big||z_1| - |z_2|\big|$$

(This is the **reverse triangle inequality**.)

<details>
<summary>Proof</summary>

By the triangle inequality: $|z_1| = |z_1-z_2+z_2| \leq |z_1-z_2|+|z_2|$,
so $|z_1|-|z_2| \leq |z_1-z_2|$.
Similarly $|z_2|-|z_1| \leq |z_2-z_1| = |z_1-z_2|$.
Taking both: $\big||z_1|-|z_2|\big| \leq |z_1-z_2|$. $\square$

</details>

---

### Code Challenges

**Challenge 1 — Argand diagram plotter**

```python
import numpy as np
import matplotlib.pyplot as plt
import cmath

def plot_argand(complex_numbers, labels=None, title='Argand Diagram'):
    """
    Plot a list of complex numbers on an Argand diagram.
    - Mark each point with a dot and its label (if provided).
    - Draw a line from the origin to each point (showing it as a vector).
    - Show the real and imaginary axes.
    - Title the plot with `title`.
    - Return the figure and axis objects.
    
    complex_numbers: list of complex numbers
    labels: list of strings (same length), or None for default labels z0, z1, ...
    """
    pass  # your code here

def complex_distance(z1, z2):
    """Return the distance between z1 and z2 in the complex plane."""
    pass  # your code here

def midpoint(z1, z2):
    """Return the midpoint of z1 and z2 as a complex number."""
    pass  # your code here


# --- tests: do not modify ---
# complex_distance
assert abs(complex_distance(3+4j, 0+0j) - 5.0) < 1e-10
assert abs(complex_distance(1+1j, 1+1j) - 0.0) < 1e-10
assert abs(complex_distance(0+0j, 1+1j) - abs(1+1j)) < 1e-10

# midpoint
assert abs(midpoint(0+0j, 2+4j) - (1+2j)) < 1e-10
assert abs(midpoint(1+2j, 3+4j) - (2+3j)) < 1e-10
assert midpoint(z, -z) == 0j for z in [1+2j, 3-4j]  # midpoint of z and -z is 0

# plot_argand (visual test only)
points = [1+0j, 0+1j, -1+0j, 0-1j, 3+4j, -2-3j]
labs   = ['1', 'i', '-1', '-i', '3+4i', '-2-3i']
fig, ax = plot_argand(points, labs, title='Test Plot')
assert fig is not None and ax is not None
plt.close(fig)

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

`complex_distance`: `return abs(z2 - z1)`.
`midpoint`: `return (z1 + z2) / 2`.
`plot_argand`: create `fig, ax = plt.subplots(...)`.
For each `z`: `ax.scatter([z.real], [z.imag])`;
draw arrow with `ax.annotate('', xy=(z.real,z.imag), xytext=(0,0), arrowprops=...)`.
Add axes with `ax.axhline(0); ax.axvline(0)`.

Note: fix the test line `assert midpoint(z, -z) == 0j for z in [...]` — it should be
a loop: `for z in [1+2j, 3-4j]: assert midpoint(z, -z) == 0j`.

</details>

---

**Challenge 2 — Locus classifier**

```python
import numpy as np
import cmath

def points_on_circle(centre, radius, N=500):
    """
    Return N evenly spaced complex numbers on the circle |z - centre| = radius.
    """
    pass  # your code here

def classify_locus(condition_fn, x_range=(-5,5), y_range=(-5,5), N=200):
    """
    Sample an N×N grid of complex numbers in the given range.
    Apply condition_fn(z) -> bool to each.
    Return a dict with:
      'count': number of points satisfying the condition
      'fraction': fraction of grid satisfying it
      'shape_hint': 'circle', 'line', 'half-plane', or 'other'
        (classify by fraction: ~pi*r^2/area for disk, ~0.5 for half-plane,
         near 0 for a curve/line)
    """
    pass  # your code here


# --- tests: do not modify ---
import math

# points_on_circle
pts = points_on_circle(2+1j, 3, N=500)
assert len(pts) == 500
# All points should be distance 3 from 2+1j
errors = [abs(abs(z - (2+1j)) - 3) for z in pts]
assert max(errors) < 1e-10

# Unit circle
unit_pts = points_on_circle(0+0j, 1, N=200)
assert all(abs(abs(z) - 1) < 1e-10 for z in unit_pts)

# classify_locus: |z| < 2 should be roughly pi*4 / 100 ≈ 0.126 of 10x10 grid
result = classify_locus(lambda z: abs(z) < 2, (-5,5), (-5,5), N=100)
# Area of circle r=2 = pi*4 ≈ 12.57 out of 100 grid area -> fraction ≈ 0.126
assert 0.1 < result['fraction'] < 0.15, f"Got {result['fraction']}"

# classify_locus: Re(z) > 0 → half-plane, fraction ≈ 0.5
result2 = classify_locus(lambda z: z.real > 0, (-5,5), (-5,5), N=100)
assert 0.45 < result2['fraction'] < 0.55

print("✓ Challenge 2 passed!")
print(f"  Locus |z|<2: fraction = {result['fraction']:.4f}")
print(f"  Locus Re(z)>0: fraction = {result2['fraction']:.4f}")
```

<details>
<summary>Hint</summary>

`points_on_circle`: `theta = np.linspace(0, 2*np.pi, N, endpoint=False)`;
return `[centre + radius*np.exp(1j*t) for t in theta]` or
`centre + radius*(np.cos(theta) + 1j*np.sin(theta))`.
`classify_locus`: `x = np.linspace(*x_range, N)`, `y = np.linspace(*y_range, N)`,
`X,Y = np.meshgrid(x,y)`, `Z = X + 1j*Y`.
Apply `condition_fn` with `np.vectorize(condition_fn)(Z)` to get a boolean array.

</details>

---

**Challenge 3 — Rotation visualiser**

```python
import numpy as np
import matplotlib.pyplot as plt
import cmath

def rotate_by_i(z, steps=4):
    """
    Return a list of length steps+1: [z, iz, i^2*z, ..., i^steps*z].
    """
    pass  # your code here

def rotation_matrix_2d(theta_degrees):
    """
    Return the 2x2 rotation matrix for rotation by theta_degrees degrees.
    [[cos θ, -sin θ],
     [sin θ,  cos θ]]
    as a numpy array.
    """
    pass  # your code here

def complex_mul_as_matrix(z):
    """
    Return the 2x2 matrix M such that M @ [a, b]^T = [a', b']^T,
    where a'+b'*i = z * (a+b*i).
    
    For z = c+di, M = [[c, -d], [d, c]]
    """
    pass  # your code here


# --- tests: do not modify ---
import math

# rotate_by_i
pts = rotate_by_i(3+1j, 4)
assert len(pts) == 5
assert abs(pts[0] - (3+1j)) < 1e-10
assert abs(pts[1] - 1j*(3+1j)) < 1e-10   # i*(3+i) = -1+3i
assert abs(pts[4] - (3+1j)) < 1e-10       # i^4 * z = z

# rotation_matrix_2d
M90 = rotation_matrix_2d(90)
assert abs(M90[0,0]) < 1e-10   # cos(90°) = 0
assert abs(M90[0,1] - (-1)) < 1e-10  # -sin(90°) = -1
assert abs(M90[1,0] - 1) < 1e-10    # sin(90°) = 1

# Rotating [1, 0] by 90° should give [0, 1]
v = np.array([1.0, 0.0])
rotated = M90 @ v
assert abs(rotated[0] - 0) < 1e-10 and abs(rotated[1] - 1) < 1e-10

# complex_mul_as_matrix: multiplying by i should be the 90° rotation matrix
Mi = complex_mul_as_matrix(1j)   # z = i = 0+1i -> M = [[0,-1],[1,0]]
assert abs(Mi[0,0] - 0) < 1e-10
assert abs(Mi[0,1] - (-1)) < 1e-10
assert abs(Mi[1,0] - 1) < 1e-10
assert abs(Mi[1,1] - 0) < 1e-10
# M for i must match 90° rotation matrix
assert np.allclose(Mi, rotation_matrix_2d(90), atol=1e-10)

print("✓ Challenge 3 passed!")
print("  Multiplying by i is equivalent to the 90° rotation matrix.")
print("  Complex multiplication by z=c+di is the matrix [[c,-d],[d,c]].")
```

<details>
<summary>Hint</summary>

`rotate_by_i`: `return [(1j)**n * z for n in range(steps+1)]`.
`rotation_matrix_2d`: `theta = math.radians(theta_degrees)`;
`return np.array([[math.cos(theta), -math.sin(theta)], [math.sin(theta), math.cos(theta)]])`.
`complex_mul_as_matrix`: `c,d = z.real, z.imag`;
`return np.array([[c, -d], [d, c]])`.

</details>

---

### Extension

**4. ★** The **Mandelbrot set** is the set of complex numbers $c$ for which
the iteration $z_{n+1} = z_n^2 + c$ with $z_0 = 0$ does not diverge.

(a) Write a Python function `mandelbrot(c, max_iter=100)` that returns the
number of iterations before $|z_n| > 2$ (or `max_iter` if it never does).

(b) Use `np.vectorize` and `np.meshgrid` to compute the Mandelbrot set on
a 400×400 grid of $c$ values in $[-2-1.5i, 1+1.5i]$ and plot it with
`ax.imshow(iterations, cmap='inferno', extent=[-2,1,-1.5,1.5])`.

*(This uses everything from this lesson: the complex plane as a grid of points,
iteration of complex arithmetic, and the modulus as a divergence test.)*

**5. ★** Prove: for any $z_1, z_2 \in \mathbb{C}$, $|z_1+z_2|^2 + |z_1-z_2|^2 = 2(|z_1|^2 + |z_2|^2)$.
This is the **parallelogram law** — the sum of the squares of the diagonals
equals the sum of the squares of the sides.
