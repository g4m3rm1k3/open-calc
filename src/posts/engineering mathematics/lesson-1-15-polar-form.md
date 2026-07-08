# Stage 1, Lesson 1.15 — Modulus, Argument, and Polar Form
**Threads:** Math · Physics · CS  
**Estimated time:** 60–75 minutes

---

## What This Lesson Is About

Every complex number can be described in two completely equivalent ways:
the **Cartesian form** $z = a + bi$ (real and imaginary components),
and the **polar form** $z = r(\cos\theta + i\sin\theta)$, where $r$ is the
distance from the origin and $\theta$ is the angle measured from the
positive real axis. These are two coordinate systems for the same point
in the complex plane.

The polar form is not just a notational convenience — it reveals the
geometry of **multiplication** in a way that the Cartesian form hides.
In polar form, multiplying two complex numbers means multiplying their
moduli and adding their arguments. This single fact explains why
multiplication by $i$ rotates by 90°, why $i^2 = -1$ (rotating 180°),
and why the complex exponential $e^{i\theta}$ is a rotation (Lesson 1.16).

By the end of this lesson you can convert between Cartesian and polar
form in both directions, compute the argument carefully (accounting for
all four quadrants), multiply and divide in polar form, and interpret
all these operations geometrically.

---

## Historical Context

The idea of representing complex numbers by distance and angle emerged
naturally from the geometric interpretation Argand and Gauss developed
in the early 19th century. The notation $r(\cos\theta + i\sin\theta)$
appears explicitly in Gauss's 1831 paper. The abbreviation $\text{cis}\,\theta$
(for $\cos\theta + i\sin\theta$) was used by William Kingdon Clifford
in the 1870s. The full connection between polar form and the exponential
— $e^{i\theta} = \cos\theta + i\sin\theta$ — was proved by Euler in 1748,
but its significance as a natural description of oscillation was not fully
appreciated until the 20th century, when Fourier analysis and signal
processing made it central to engineering.

---

## What You Need To Know First

- **Complex plane** — plotting $z = a+bi$ at $(a,b)$ (Lesson 1.14).
- **Modulus** $|z| = \sqrt{a^2+b^2}$ (Lesson 1.13).
- **Trigonometry** — $\sin$, $\cos$, $\tan$; angles in radians; all four quadrants.
- **$\text{atan2}(y, x)$** — the two-argument arctangent that handles all quadrants
  (you may have seen this; it is reviewed below).

---

## The Lesson

### The Argument of a Complex Number

**Definition:** the **argument** of a nonzero complex number $z = a + bi$,
written $\arg(z)$ or $\theta$, is the angle from the positive real axis
to the vector $(a, b)$, measured **counter-clockwise**, in radians.

**The issue with $\arctan$:** a common mistake is to write
$\theta = \arctan(b/a)$. This fails because:

1. $\arctan$ only returns values in $(-\pi/2, \pi/2)$ — it misses the
   left half-plane.
2. The formula $b/a$ gives the same ratio for opposite signs (e.g.,
   $(-3)/(-4) = 3/4$), so it cannot distinguish $(3, 4)$ from $(-3, -4)$.

**The fix: use $\text{atan2}(b, a)$**, which takes both $b$ and $a$ as
separate arguments and returns the correct angle in $(-\pi, \pi]$:

| Quadrant | $a, b$ | $\text{atan2}(b,a)$ |
|----------|--------|----------------------|
| 1st | $a > 0, b > 0$ | $\arctan(b/a) \in (0, \pi/2)$ |
| 2nd | $a < 0, b > 0$ | $\pi - \arctan(|b/a|) \in (\pi/2, \pi)$ |
| 3rd | $a < 0, b < 0$ | $-\pi + \arctan(|b/a|) \in (-\pi, -\pi/2)$ |
| 4th | $a > 0, b < 0$ | $\arctan(b/a) \in (-\pi/2, 0)$ |
| Positive real | $a > 0, b = 0$ | $0$ |
| Negative real | $a < 0, b = 0$ | $\pi$ |
| Positive imag | $a = 0, b > 0$ | $\pi/2$ |
| Negative imag | $a = 0, b < 0$ | $-\pi/2$ |

**Principal argument:** by convention, $\arg(z) \in (-\pi, \pi]$ is the
**principal value**. Adding $2\pi k$ for any integer $k$ gives another
valid argument (angles are periodic with period $2\pi$).

**Hand-worked examples:**

$z = 1 + i$: $a = b = 1$, so $\theta = \text{atan2}(1, 1) = \arctan(1) = \pi/4$ (45°).

$z = -1 + i$: $a = -1, b = 1$, so $\theta = \pi - \pi/4 = 3\pi/4$ (135°).

$z = -1 - i$: $a = b = -1$, so $\theta = -\pi + \pi/4 = -3\pi/4$ (−135° or 225°).

$z = 3 + 4i$: $\theta = \arctan(4/3) \approx 0.9273$ rad $\approx 53.13°$.

```python
import math
import cmath
import numpy as np
import matplotlib.pyplot as plt

def argument_degrees(z):
    """Return the argument of z in degrees, in (-180, 180]."""
    return math.degrees(cmath.phase(z))   # cmath.phase uses atan2 internally

def argument_radians(z):
    """Return the argument of z in radians, in (-pi, pi]."""
    return cmath.phase(z)

# Test all four quadrants and special cases
test_cases = [
    (1+0j,     "Positive real",  0),
    (0+1j,     "Positive imag",  90),
    (-1+0j,    "Negative real",  180),
    (0-1j,     "Negative imag", -90),
    (1+1j,     "Q1 (45°)",       45),
    (-1+1j,    "Q2 (135°)",      135),
    (-1-1j,    "Q3 (-135°)",    -135),
    (1-1j,     "Q4 (-45°)",     -45),
    (3+4j,     "3+4i",           math.degrees(math.atan2(4,3))),
    (-2-3j,    "-2-3i",          math.degrees(math.atan2(-3,-2))),
]

print(f"{'Number':>12} | {'Description':<20} | {'arg (°)':>10} | {'Expected (°)':>14}")
print("-" * 65)
for z, desc, expected in test_cases:
    arg = argument_degrees(z)
    ok  = '✓' if abs(arg - expected) < 1e-8 else '✗'
    print(f"{str(z):>12} | {desc:<20} | {arg:>10.4f} | {expected:>14.4f}  {ok}")

# Comparison: atan alone fails for Q2/Q3
print("\nWhy atan(b/a) alone fails:")
for z, desc, _ in [(-1+1j,"Q2"), (-1-1j,"Q3")]:
    a, b = z.real, z.imag
    wrong_angle = math.degrees(math.atan(b/a))
    right_angle = argument_degrees(z)
    print(f"  z = {z}: atan(b/a) gives {wrong_angle:>8.2f}°, atan2 gives {right_angle:>8.2f}°")
```

**Walkthrough:** `cmath.phase(z)` is Python's built-in function for
$\arg(z)$ — it returns the angle in $(-\pi, \pi]$ using the `atan2`
algorithm. `math.degrees(...)` converts radians to degrees.
`math.atan(b/a)` fails for $(-1+i)$ and $(-1-i)$ because both give
$b/a = -1$ and $\arctan(-1) = -45°$, when the correct answers are
$135°$ and $-135°$ respectively.

---

### Polar Form

Once we have $r = |z|$ and $\theta = \arg(z)$, we can write $z$ in
**polar form**:

$$\boxed{z = r(\cos\theta + i\sin\theta)}$$

**Why:** the point $(a, b)$ in polar coordinates is $a = r\cos\theta$,
$b = r\sin\theta$. So $z = a + bi = r\cos\theta + i(r\sin\theta) = r(\cos\theta + i\sin\theta)$.

**Converting Cartesian → Polar:**
$$r = \sqrt{a^2+b^2}, \qquad \theta = \text{atan2}(b, a)$$

**Converting Polar → Cartesian:**
$$a = r\cos\theta, \qquad b = r\sin\theta$$

**The abbreviation $\text{cis}$:** some texts write $\text{cis}\,\theta$
for $\cos\theta + i\sin\theta$, so $z = r\,\text{cis}\,\theta$.

**Hand-worked examples:**

(1) $z = 1 + i$: $r = \sqrt{2}$, $\theta = \pi/4$.
$z = \sqrt{2}(\cos(\pi/4) + i\sin(\pi/4)) = \sqrt{2}\left(\frac{1}{\sqrt{2}} + \frac{i}{\sqrt{2}}\right)$.
Check: $\sqrt{2}/\sqrt{2} = 1$ and $\sqrt{2}\cdot i/\sqrt{2} = i$. ✓

(2) $z = 2(\cos(2\pi/3) + i\sin(2\pi/3))$ (polar → Cartesian):
$a = 2\cos(120°) = 2\cdot(-1/2) = -1$,
$b = 2\sin(120°) = 2\cdot(\sqrt{3}/2) = \sqrt{3}$.
So $z = -1 + \sqrt{3}\,i$.

(3) $z = -4$ (a real negative number): $r = 4$, $\theta = \pi$.
$z = 4(\cos\pi + i\sin\pi) = 4(-1+0) = -4$. ✓

(4) $z = 3i$: $r = 3$, $\theta = \pi/2$.
$z = 3(\cos(\pi/2) + i\sin(\pi/2)) = 3(0 + i) = 3i$. ✓

```python
import math
import cmath
import numpy as np
import matplotlib.pyplot as plt

def cartesian_to_polar(z):
    """
    Convert z = a+bi to polar form (r, theta_radians).
    Returns (r, theta) where r >= 0, theta in (-pi, pi].
    """
    r     = abs(z)
    theta = cmath.phase(z)   # atan2(b, a) in radians
    return r, theta

def polar_to_cartesian(r, theta):
    """
    Convert polar (r, theta in radians) to complex number.
    Returns a + bi.
    """
    return complex(r * math.cos(theta), r * math.sin(theta))

# Test round-trips
test_pts = [1+1j, -1+1j, -1-1j, 1-1j, 3+4j, 0-5j, 2+0j, -3+0j]
print("Round-trip Cartesian → Polar → Cartesian:")
print(f"{'z':>12} | {'r':>8} | {'θ (°)':>10} | {'Reconstructed':>15} | {'Match'}")
print("-" * 60)
for z in test_pts:
    r, theta = cartesian_to_polar(z)
    z_rec    = polar_to_cartesian(r, theta)
    match    = abs(z - z_rec) < 1e-12
    print(f"{str(z):>12} | {r:>8.4f} | {math.degrees(theta):>10.4f}° | {str(z_rec):>15} | {'✓' if match else '✗'}")

# Visualise polar coordinates on the complex plane
fig, ax = plt.subplots(figsize=(8, 8))

# Draw concentric circles at r = 1, 2, 3
for r_circle in [1, 2, 3]:
    theta_c = np.linspace(0, 2*np.pi, 300)
    ax.plot(r_circle*np.cos(theta_c), r_circle*np.sin(theta_c),
            color='#cccccc', lw=1.5, ls='--', zorder=1)
    ax.annotate(f'r={r_circle}', xy=(r_circle, 0.05), fontsize=8, color='#aaa')

# Draw angle lines at 0°, 30°, 45°, 60°, 90°, ...
for deg in range(0, 360, 30):
    theta_d = math.radians(deg)
    ax.plot([0, 3.3*math.cos(theta_d)], [0, 3.3*math.sin(theta_d)],
            color='#ddd', lw=1, zorder=1)
    ax.annotate(f'{deg}°', xy=(3.5*math.cos(theta_d), 3.5*math.sin(theta_d)),
                fontsize=7, ha='center', va='center', color='#999')

# Plot specific complex numbers in polar form
examples = [
    (math.sqrt(2), math.pi/4,    '√2·cis(45°) = 1+i',  '#2980b9'),
    (2,            2*math.pi/3,  '2·cis(120°) = -1+√3i','#e74c3c'),
    (3,            -math.pi/6,   '3·cis(-30°)',          '#27ae60'),
    (2.5,          math.pi,      '2.5·cis(π) = -2.5',   '#8e44ad'),
]
for r, theta, label, color in examples:
    z = polar_to_cartesian(r, theta)
    ax.annotate('', xy=(z.real, z.imag), xytext=(0,0),
                arrowprops=dict(arrowstyle='->', color=color, lw=2.5))
    ax.scatter([z.real], [z.imag], s=100, color=color, zorder=5)
    ax.annotate(label, xy=(z.real, z.imag),
                xytext=(z.real+0.1, z.imag+0.2), fontsize=9, color=color)
    # Draw arc showing angle
    theta_arc = np.linspace(0, theta if theta > 0 else theta, 50)
    scale = 0.4 * r
    ax.plot(scale*np.cos(theta_arc), scale*np.sin(theta_arc), color=color, lw=1.5, ls=':')

ax.axhline(0, color='#333', lw=1.5)
ax.axvline(0, color='#333', lw=1.5)
ax.set_xlim(-4, 4); ax.set_ylim(-4, 4)
ax.set_aspect('equal')
ax.set_xlabel('Real axis'); ax.set_ylabel('Imaginary axis')
ax.set_title('Polar form: $z = r(\\cos\\theta + i\\sin\\theta)$\n'
             'Dashed circles = constant $r$; grey lines = constant $\\theta$', fontsize=11)
ax.grid(False)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `abs(z)` gives the modulus $r$, and `cmath.phase(z)`
gives the argument $\theta$ in $(-\pi, \pi]$. `polar_to_cartesian`
reconstructs the Cartesian form using $a = r\cos\theta$, $b = r\sin\theta$;
the slight floating-point error is below $10^{-12}$. The plot draws
concentric circles (constant $r$) and radial lines (constant $\theta$)
to show the polar grid laid over the complex plane.

---

### Multiplication and Division in Polar Form

**Multiplication:**

Let $z_1 = r_1(\cos\theta_1 + i\sin\theta_1)$ and
$z_2 = r_2(\cos\theta_2 + i\sin\theta_2)$.

$$z_1 z_2 = r_1 r_2 [(\cos\theta_1\cos\theta_2 - \sin\theta_1\sin\theta_2)
+ i(\sin\theta_1\cos\theta_2 + \cos\theta_1\sin\theta_2)]$$

By the addition formulas for cosine and sine:
$\cos\theta_1\cos\theta_2 - \sin\theta_1\sin\theta_2 = \cos(\theta_1+\theta_2)$
and $\sin\theta_1\cos\theta_2 + \cos\theta_1\sin\theta_2 = \sin(\theta_1+\theta_2)$.

Therefore:

$$\boxed{z_1 z_2 = r_1 r_2 \big[\cos(\theta_1+\theta_2) + i\sin(\theta_1+\theta_2)\big]}$$

$$|z_1 z_2| = r_1 r_2 \qquad \arg(z_1 z_2) = \theta_1 + \theta_2$$

**In words:** multiplying two complex numbers **multiplies their moduli**
and **adds their arguments**.

**Division:**

$$\frac{z_1}{z_2} = \frac{r_1}{r_2}\big[\cos(\theta_1-\theta_2) + i\sin(\theta_1-\theta_2)\big]$$

$$\left|\frac{z_1}{z_2}\right| = \frac{r_1}{r_2} \qquad \arg\!\left(\frac{z_1}{z_2}\right) = \theta_1 - \theta_2$$

**This explains everything about multiplication by $i$:**

$i$ in polar form: $|i| = 1$, $\arg(i) = \pi/2$.

Multiplying $z$ by $i$ adds $\pi/2$ to the argument — a 90° CCW rotation — and
leaves the modulus unchanged. This is the geometric content of Lesson 1.14's
observation that multiplication by $i$ rotates by 90°.

**Hand-worked example — multiplication:**

$z_1 = 2(\cos(30°) + i\sin(30°))$ and $z_2 = 3(\cos(60°) + i\sin(60°))$.

$z_1 z_2 = 2 \cdot 3 \cdot [\cos(90°) + i\sin(90°)] = 6(0 + i) = 6i$.

**Verification (Cartesian):**
$z_1 = 2(\frac{\sqrt{3}}{2} + \frac{i}{2}) = \sqrt{3}+i$,
$z_2 = 3(\frac{1}{2} + \frac{\sqrt{3}}{2}i) = \frac{3}{2}+\frac{3\sqrt{3}}{2}i$.
$z_1 z_2 = (\sqrt{3}+i)(\frac{3}{2}+\frac{3\sqrt{3}}{2}i)
= \frac{3\sqrt{3}}{2} + \frac{3\cdot3}{2}i + \frac{3}{2}i + \frac{3\sqrt{3}}{2}i^2
= \frac{3\sqrt{3}}{2} - \frac{3\sqrt{3}}{2} + ({\frac{9}{2}+\frac{3}{2}})i = 6i$. ✓

```python
import math
import cmath
import numpy as np
import matplotlib.pyplot as plt

def polar_multiply(z1, z2):
    """
    Multiply z1 and z2 using polar form: multiply moduli, add arguments.
    Returns the product as a complex number.
    """
    r1, theta1 = abs(z1), cmath.phase(z1)
    r2, theta2 = abs(z2), cmath.phase(z2)
    r_product    = r1 * r2
    theta_product = theta1 + theta2
    return complex(r_product * math.cos(theta_product),
                   r_product * math.sin(theta_product))

def polar_divide(z1, z2):
    """Divide z1/z2 using polar form: divide moduli, subtract arguments."""
    if z2 == 0:
        raise ZeroDivisionError("Cannot divide by zero")
    r1, theta1 = abs(z1), cmath.phase(z1)
    r2, theta2 = abs(z2), cmath.phase(z2)
    return complex((r1/r2)*math.cos(theta1-theta2),
                   (r1/r2)*math.sin(theta1-theta2))

# Verify against Python's built-in
test_pairs = [
    (1+1j, 1+1j),
    (2+0j, 0+3j),
    (3+4j, 1+2j),
    (cmath.rect(2, math.pi/6), cmath.rect(3, math.pi/3)),   # polar_multiply example
]
print("Multiplication check (polar_multiply vs z1*z2):")
print(f"{'z1':>14} * {'z2':>14} | {'polar result':>20} | {'Python result':>20} | Match")
print("-" * 85)
for z1, z2 in test_pairs:
    pm   = polar_multiply(z1, z2)
    true = z1 * z2
    ok   = abs(pm - true) < 1e-10
    print(f"{str(z1):>14} * {str(z2):>14} | {str(pm):>20} | {str(true):>20} | {'✓' if ok else '✗'}")

print()
print("Argument addition: arg(z1*z2) = arg(z1) + arg(z2)")
for z1, z2 in test_pairs:
    theta1 = cmath.phase(z1)
    theta2 = cmath.phase(z2)
    theta_product = cmath.phase(z1*z2)
    sum_angles = theta1 + theta2
    # Normalise to (-pi, pi] for comparison
    sum_normalised = (sum_angles + math.pi) % (2*math.pi) - math.pi
    match = abs(sum_normalised - theta_product) < 1e-10
    print(f"  θ₁+θ₂ = {math.degrees(sum_angles):.1f}°,  arg(z₁z₂) = {math.degrees(theta_product):.1f}°  {'✓' if match else 'diff (by 2π, ok)'}")

# cmath.rect(r, theta) is the built-in polar -> complex converter
print(f"\ncmath.rect(2, π/4) = {cmath.rect(2, math.pi/4)}")
print(f"Expected: 2*(cos45°+i sin45°) = {complex(2*math.cos(math.pi/4), 2*math.sin(math.pi/4))}")
```

**Walkthrough:** `cmath.rect(r, theta)` is Python's built-in function
for converting polar form $(r, \theta)$ to a complex number — it
computes $r e^{i\theta}$ internally using `r*cos(theta) + r*sin(theta)*j`.
`cmath.phase(z)` gives the principal argument. The `% (2*math.pi)` trick
normalises an angle to $[0, 2\pi)$, and subtracting $\pi$ then shifts
to $(-\pi, \pi]$. The argument addition is correct modulo $2\pi$, which
is why we normalise before comparing.

---

### Integer Powers in Polar Form

From the multiplication rule, by induction:

$$z^n = r^n(\cos(n\theta) + i\sin(n\theta))$$

This is **De Moivre's theorem** (Lesson 1.17 develops its full power),
but we can use it now.

**Hand-worked example:** compute $(1+i)^{10}$.

$|1+i| = \sqrt{2}$, $\arg(1+i) = \pi/4$.
$(1+i)^{10} = (\sqrt{2})^{10}(\cos(10\pi/4) + i\sin(10\pi/4))$.

$(\sqrt{2})^{10} = 2^5 = 32$.
$10\pi/4 = 5\pi/2$. Now $5\pi/2 = 2\pi + \pi/2$, so $\cos(5\pi/2) = \cos(\pi/2) = 0$
and $\sin(5\pi/2) = \sin(\pi/2) = 1$.

$(1+i)^{10} = 32(0 + i) = 32i$.

**Verification (brute force):**
$(1+i)^2 = 2i$.
$(1+i)^4 = (2i)^2 = -4$.
$(1+i)^8 = (-4)^2 = 16$.
$(1+i)^{10} = (1+i)^8 \cdot (1+i)^2 = 16 \cdot 2i = 32i$. ✓

```python
import math
import cmath
import numpy as np
import matplotlib.pyplot as plt

def de_moivre(z, n):
    """
    Compute z^n using De Moivre: r^n * (cos(n*theta) + i*sin(n*theta)).
    n should be a non-negative integer.
    """
    r, theta = abs(z), cmath.phase(z)
    return cmath.rect(r**n, n*theta)   # cmath.rect(r,theta) = r*(cos+i*sin)

# Verify (1+i)^10 = 32i
z = 1+1j
n = 10
result = de_moivre(z, n)
print(f"(1+i)^10 via De Moivre: {result}")
print(f"  Should be 32i:        {32j}")
print(f"  Matches: {abs(result - 32j) < 1e-10}")
print()

# Compare to Python's built-in
for z, n in [(1+1j, 10), (1j, 4), (-1+1j, 3), (0.5+0.866j, 6)]:
    dm     = de_moivre(z, n)
    python = z**n
    ok     = abs(dm - python) < 1e-10
    print(f"  ({z})^{n}: De Moivre={dm:.4f}, Python={python:.4f}, match={ok}")

# Visualise: successive powers on the complex plane
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Left: z=1+i, n=0..8
z_base = 1+1j
pows = [de_moivre(z_base, n) for n in range(9)]
ax = axes[0]
spiral_r = np.abs(np.array(pows))
theta_full = np.linspace(0, 2*np.pi, 200)

ax.plot([p.real for p in pows], [p.imag for p in pows], '-o',
        color='#2980b9', lw=1.5, markersize=8, zorder=5)
for n, p in enumerate(pows):
    ax.annotate(f'$z^{{{n}}}$', xy=(p.real, p.imag),
                xytext=(p.real+0.5, p.imag+0.3), fontsize=8.5, color='#2980b9')
ax.axhline(0, color='#333', lw=1); ax.axvline(0, color='#333', lw=1)
ax.set_aspect('equal')
ax.set_xlabel('Real'); ax.set_ylabel('Imaginary')
ax.set_title('$(1+i)^n$: modulus grows by $\\sqrt{2}$ each step\n'
             'argument increases by 45° each step', fontsize=10)
ax.grid(True, alpha=0.3)

# Right: z on unit circle, z^n traces unit circle
z_unit = cmath.rect(1, math.pi/6)   # r=1, theta=30°
pows_unit = [de_moivre(z_unit, n) for n in range(13)]
ax = axes[1]
ax.plot(np.cos(theta_full), np.sin(theta_full), color='#ddd', lw=2)
ax.plot([p.real for p in pows_unit], [p.imag for p in pows_unit], '-o',
        color='#e74c3c', lw=1.5, markersize=8, zorder=5)
for n, p in enumerate(pows_unit):
    ax.annotate(f'$n={n}$', xy=(p.real, p.imag),
                xytext=(p.real+0.05, p.imag+0.08), fontsize=7.5, color='#c0392b')
ax.axhline(0, color='#333', lw=1); ax.axvline(0, color='#333', lw=1)
ax.set_aspect('equal')
ax.set_xlim(-1.5, 1.5); ax.set_ylim(-1.5, 1.5)
ax.set_xlabel('Real'); ax.set_ylabel('Imaginary')
ax.set_title('$e^{i\\pi/6}$ to the $n$-th power: travels unit circle by 30° steps\n'
             '(After 12 steps, returns to start: $z^{12} = 1$)', fontsize=10)
ax.grid(True, alpha=0.3)

plt.suptitle('De Moivre: $z^n = r^n(\\cos n\\theta + i\\sin n\\theta)$', fontsize=12)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `cmath.rect(r**n, n*theta)` is the most direct
implementation of De Moivre: it computes $r^n e^{in\theta}$. `cmath.rect`
accepts any real arguments, so `r**n` and `n*theta` are computed in
Python's standard float arithmetic. The right panel shows a unit-circle
point (modulus exactly 1) raised to successive powers — it travels the
unit circle in equal angular steps and returns to the start after 12 steps
($12 \times 30° = 360°$).

---

## Connect the Pieces

**What this lesson built on:** complex plane and modulus (Lessons 1.13–1.14);
trigonometric addition formulas (secondary-school prerequisite).

**What this lesson makes possible:** Lesson 1.16 (Euler's formula
$e^{i\theta} = \cos\theta + i\sin\theta$ — which makes polar form
exponentially compact), Lesson 1.17 (De Moivre's theorem and roots of
unity). Beyond Stage 1: phasor analysis in AC circuits, Fourier
transform (decomposing signals into complex exponentials), Laplace transform
(s-domain: complex frequency plane), Z-transform (discrete signal processing).

---

## Summary

**Polar form:** $z = r(\cos\theta + i\sin\theta)$, where $r = |z|$ and $\theta = \arg(z)$.

**Converting:** $r = \sqrt{a^2+b^2}$, $\theta = \text{atan2}(b,a)$;
$a = r\cos\theta$, $b = r\sin\theta$.

**Multiplication:** $|z_1 z_2| = r_1 r_2$, $\arg(z_1 z_2) = \theta_1 + \theta_2$.

**Division:** $|z_1/z_2| = r_1/r_2$, $\arg(z_1/z_2) = \theta_1 - \theta_2$.

**Powers:** $z^n = r^n(\cos n\theta + i\sin n\theta)$.

**New Python:**
- `cmath.phase(z)` — argument in $(-\pi, \pi]$
- `cmath.rect(r, theta)` — polar to complex
- `abs(z)` — modulus

---

## Problems

### Math

**1.** Express in polar form $r(\cos\theta + i\sin\theta)$:
(a) $\sqrt{3} + i$ (b) $-2$ (c) $-1 - i$ (d) $2 - 2\sqrt{3}\,i$

<details>
<summary>Answers</summary>

(a) $r=2$, $\theta=\pi/6$: $z=2(\cos(\pi/6)+i\sin(\pi/6))$.
(b) $r=2$, $\theta=\pi$: $z=2(\cos\pi+i\sin\pi)$.
(c) $r=\sqrt{2}$, $\theta=-3\pi/4$: $z=\sqrt{2}(\cos(-3\pi/4)+i\sin(-3\pi/4))$.
(d) $r=\sqrt{4+12}=4$, $\theta=-\pi/3$: $z=4(\cos(-\pi/3)+i\sin(-\pi/3))$.

</details>

---

**2.** Convert from polar to Cartesian form:
(a) $4(\cos(\pi/3)+i\sin(\pi/3))$
(b) $\sqrt{2}(\cos(3\pi/4)+i\sin(3\pi/4))$
(c) $5(\cos(-\pi/2)+i\sin(-\pi/2))$

<details>
<summary>Answers</summary>

(a) $4(1/2 + i\sqrt{3}/2) = 2 + 2\sqrt{3}\,i$.
(b) $\sqrt{2}(-1/\sqrt{2}+i/\sqrt{2}) = -1 + i$.
(c) $5(0 - i) = -5i$.

</details>

---

**3.** Using polar multiplication:

(a) Compute $(1+i)(1+\sqrt{3}\,i)$ by converting both to polar and multiplying.
(b) Compute $(\sqrt{3}-i)^4$ using De Moivre's theorem.
(c) Find $z$ such that $z^3 = 8$. (One real answer exists; use De Moivre to find the other two.)

<details>
<summary>Answers</summary>

(a) $1+i = \sqrt{2}\,\text{cis}(\pi/4)$, $1+\sqrt{3}\,i = 2\,\text{cis}(\pi/3)$.
Product: $2\sqrt{2}\,\text{cis}(\pi/4+\pi/3) = 2\sqrt{2}\,\text{cis}(7\pi/12)$.

(b) $\sqrt{3}-i = 2\,\text{cis}(-\pi/6)$; $(\sqrt{3}-i)^4 = 2^4\,\text{cis}(-4\pi/6) = 16\,\text{cis}(-2\pi/3) = 16(-1/2-i\sqrt{3}/2) = -8-8\sqrt{3}\,i$.

(c) $z^3 = 8\,\text{cis}(0)$, so $|z|^3 = 8 \Rightarrow |z|=2$, and $3\theta = 2\pi k$ for $k=0,1,2$.
$z_0 = 2\,\text{cis}(0) = 2$, $z_1 = 2\,\text{cis}(2\pi/3) = -1+\sqrt{3}\,i$, $z_2 = 2\,\text{cis}(4\pi/3) = -1-\sqrt{3}\,i$.

</details>

---

**4.** (Proof) Let $z = r(\cos\theta + i\sin\theta)$. Prove that
$\arg(z^{-1}) = -\theta$ and $|z^{-1}| = 1/r$ using the polar form
of division.

<details>
<summary>Proof</summary>

$z^{-1} = 1/z$. Write $1 = 1\,(\cos 0 + i\sin 0)$.
By polar division: $|1/z| = 1/r$ and $\arg(1/z) = 0 - \theta = -\theta$. $\square$

</details>

---

### Code Challenges

**Challenge 1 — Polar converter and verifier**

```python
import cmath
import math

def to_polar(z):
    """
    Return (r, theta) where r = |z|, theta = arg(z) in (-pi, pi].
    If z == 0, return (0, 0).
    """
    pass  # your code here

def from_polar(r, theta):
    """Return the complex number r*(cos theta + i*sin theta)."""
    pass  # your code here

def polar_power(z, n):
    """
    Compute z^n using De Moivre: r^n * (cos(n*theta) + i*sin(n*theta)).
    n is a non-negative integer.
    Handle z==0 separately (0^n = 0 for n>0, undefined for n=0).
    """
    pass  # your code here


# --- tests: do not modify ---
# to_polar
r, th = to_polar(1+1j)
assert abs(r - math.sqrt(2)) < 1e-10
assert abs(th - math.pi/4) < 1e-10

r, th = to_polar(0+0j)
assert r == 0 and th == 0

r, th = to_polar(-1+0j)
assert abs(r - 1) < 1e-10 and abs(th - math.pi) < 1e-10

# from_polar
z = from_polar(2, math.pi/3)
assert abs(z - (1 + 1j*math.sqrt(3))) < 1e-10

# round-trip
for z in [1+1j, -2+3j, 0-4j, 5+0j, -1-1j]:
    r, th = to_polar(z)
    z_back = from_polar(r, th)
    assert abs(z - z_back) < 1e-10, f"Round-trip failed for {z}"

# polar_power
assert abs(polar_power(1+1j, 10) - 32j) < 1e-8      # (1+i)^10 = 32i
assert abs(polar_power(1j, 4) - 1+0j) < 1e-10        # i^4 = 1
assert abs(polar_power(0+0j, 5) - 0+0j) < 1e-10      # 0^5 = 0

# De Moivre for n=12 on unit circle (returns to start)
z_unit = from_polar(1, math.pi/6)   # 30° point
assert abs(polar_power(z_unit, 12) - 1+0j) < 1e-10   # 12×30° = 360°

# Match Python's built-in
for z, n in [(3+4j, 3), (-1+1j, 5), (0+2j, 4)]:
    assert abs(polar_power(z, n) - z**n) < 1e-8

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

`to_polar`: `if z == 0: return 0, 0`; `return abs(z), cmath.phase(z)`.
`from_polar`: `return complex(r*math.cos(theta), r*math.sin(theta))`.
`polar_power`: `if z == 0: return 0j`; `r,th = to_polar(z)`;
`return from_polar(r**n, n*th)`.

</details>

---

**Challenge 2 — Argument addition checker**

```python
import random
import math
import cmath

def check_arg_addition(N=5000, seed=42):
    """
    Verify that arg(z1*z2) ≡ arg(z1) + arg(z2)  (mod 2π)
    for N random pairs. Return the maximum error (should be < 1e-10).
    
    Note: the product argument may wrap outside (-pi, pi], so compare
    modulo 2*pi.
    """
    pass  # your code here

def check_modulus_multiplicativity(N=5000, seed=42):
    """
    Verify |z1*z2| = |z1|*|z2| for N random pairs.
    Return maximum error.
    """
    pass  # your code here


# --- tests: do not modify ---
max_arg_err = check_arg_addition()
assert max_arg_err < 1e-8, f"Argument addition error: {max_arg_err}"

max_mod_err = check_modulus_multiplicativity()
assert max_mod_err < 1e-8, f"Modulus multiplicativity error: {max_mod_err}"

print("✓ Challenge 2 passed!")
print(f"  Max arg addition error: {max_arg_err:.2e}")
print(f"  Max modulus mult error: {max_mod_err:.2e}")
```

<details>
<summary>Hint</summary>

To compare arguments modulo $2\pi$: compute `diff = (theta1 + theta2 - theta_product)`;
then check `abs(diff % (2*math.pi)) < tol` or `abs(diff % (2*math.pi) - 2*math.pi) < tol`.

</details>

---

**Challenge 3 — Polar multiplication visualiser**

```python
import numpy as np
import matplotlib.pyplot as plt
import cmath
import math

def visualise_polar_multiplication(z1, z2):
    """
    Create a figure showing:
    - z1 and z2 as arrows in the complex plane
    - Their product z1*z2
    - The modulus multiplication: r1*r2 shown as lengths
    - The argument addition: theta1+theta2 shown as angles
    
    Return (fig, ax).
    """
    pass  # your code here


# No automated test -- visual is the result.
fig1, ax1 = visualise_polar_multiplication(1+1j, 0+2j)
plt.show()

fig2, ax2 = visualise_polar_multiplication(
    cmath.rect(2, math.pi/6),
    cmath.rect(3, math.pi/4)
)
plt.show()
print("✓ Challenge 3 complete (visual output)!")
```

<details>
<summary>Hint</summary>

Draw arrows from origin to `z1`, `z2`, and `z1*z2`.
Show arc for angle of each using `np.linspace(0, cmath.phase(z), 50)`.
Annotate with `r₁=|z₁|`, `r₂=|z₂|`, `r₁r₂=|z₁z₂|`, `θ₁`, `θ₂`, `θ₁+θ₂`.

</details>

---

### Extension

**4. ★** Prove the **multiplication law for arguments** directly: for
$z_1 = r_1(\cos\theta_1 + i\sin\theta_1)$ and $z_2 = r_2(\cos\theta_2 + i\sin\theta_2)$,
show algebraically (using trig addition formulas) that:

$$z_1 z_2 = r_1 r_2 [\cos(\theta_1+\theta_2) + i\sin(\theta_1+\theta_2)]$$

**5. ★** A complex number $z$ satisfies $|z| = 1$ and $\arg(z) = 2\pi/n$
for some positive integer $n$. Show that $z^n = 1$. Such numbers are called
**$n$-th roots of unity**; they will be studied in full in Lesson 1.17.
Find all 5th roots of unity and plot them.
