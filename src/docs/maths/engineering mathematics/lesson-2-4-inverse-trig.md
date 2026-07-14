# Stage 2, Lesson 2.4 — Inverse Trigonometric Functions
**Threads:** Math · Physics · CS  
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

The trigonometric functions take an angle and produce a ratio. The inverse
trigonometric functions go the other direction: given a ratio, find the
angle. This reverse direction is what you need whenever a measurement gives
you a side length and you want to know the angle — the slope of a terrain,
the angle of a robotic arm joint, the phase of a signal, the bearing to a
GPS waypoint. But there is a subtlety: $\sin$, $\cos$, and $\tan$ are not
injective over their full domains (Lesson 0.7). $\sin(30°) = \sin(150°) = 0.5$,
so "which angle has sine 0.5?" has infinitely many answers. To build true
inverse functions, we restrict the domain to an interval on which each
function is injective — the **principal value** range. By the end of this
lesson you can evaluate $\arcsin$, $\arccos$, and $\arctan$ exactly at
standard values, understand the restriction that makes each well-defined,
use the two-argument `atan2` function that handles all four quadrants, and
apply the inverses to solve practical angle problems.

---

## Historical Context

The inverse trigonometric functions were understood long before they were
named. Astronomers routinely computed angles from ratios — what we would
call $\arcsin$ — using tables. James Gregory developed formulas for
$\arctan$ as an infinite series in 1671 (the Gregory–Leibniz series
$\pi/4 = 1 - 1/3 + 1/5 - \cdots$ is a consequence). The notation $\sin^{-1}$
for inverse sine was introduced by John Herschel in 1813, and the prefix
"arc" (as in $\arcsin$) was popularised in the late 19th century —
reflecting the interpretation as the arc length on the unit circle whose
sine is the given value. The `atan2` function, now standard in all
programming languages, was introduced in FORTRAN in the 1960s to solve the
quadrant ambiguity problem that arises in geometric computations.

---

## What You Need To Know First

- **Injective functions and inverses** — Lesson 0.7. Inverses exist only
  for injective functions; we restrict domain to achieve injectivity.
- **$\sin$, $\cos$, $\tan$** — Lessons 2.1–2.3.
- **The reflection across $y = x$** — Lesson 0.8. The graph of the inverse
  is the reflection of the original.

---

## The Lesson

### Why Restriction Is Necessary

$\sin\theta = 0.5$ is satisfied by $\theta = \pi/6$, $\theta = 5\pi/6$,
$\theta = \pi/6 + 2\pi$, $\theta = 5\pi/6 + 2\pi$, and infinitely many more.
A function must give one output for each input (Lesson 0.6).
To make $\arcsin$ a function, we must restrict $\sin$ to an interval
where it is one-to-one.

**The canonical choices:**

| Function | Restricted domain | Gives | Inverse name | Range of inverse |
|----------|------------------|-------|-------------|-----------------|
| $\sin\theta$ | $[-\pi/2,\ \pi/2]$ | injective | $\arcsin$ or $\sin^{-1}$ | $[-\pi/2,\ \pi/2]$ |
| $\cos\theta$ | $[0,\ \pi]$ | injective | $\arccos$ or $\cos^{-1}$ | $[0,\ \pi]$ |
| $\tan\theta$ | $(-\pi/2,\ \pi/2)$ | injective | $\arctan$ or $\tan^{-1}$ | $(-\pi/2,\ \pi/2)$ |

**The choices are not arbitrary.** Each interval is chosen so the
function is monotone (strictly increasing or decreasing), includes $0$,
and covers the complete range. For $\sin$: the interval $[-\pi/2, \pi/2]$
is the stretch from $-90°$ to $90°$ where $\sin$ is increasing from $-1$
to $1$. For $\cos$: $[0, \pi]$ is where $\cos$ is decreasing from $1$ to $-1$.
For $\tan$: the open interval $(-\pi/2, \pi/2)$ is one complete period.

---

### $\arcsin$: Domain $[-1,1]$, Range $[-\pi/2,\ \pi/2]$

**Definition:** $\arcsin(x) = \theta$ means $\sin\theta = x$ and
$\theta \in [-\pi/2,\ \pi/2]$.

**Key values:**

| $x$ | $\arcsin(x)$ | Degrees |
|-----|-------------|---------|
| $-1$ | $-\pi/2$ | $-90°$ |
| $-\sqrt{2}/2$ | $-\pi/4$ | $-45°$ |
| $-1/2$ | $-\pi/6$ | $-30°$ |
| $0$ | $0$ | $0°$ |
| $1/2$ | $\pi/6$ | $30°$ |
| $\sqrt{2}/2$ | $\pi/4$ | $45°$ |
| $\sqrt{3}/2$ | $\pi/3$ | $60°$ |
| $1$ | $\pi/2$ | $90°$ |

**Cancellation identities** — these only hold in the given range:

$$\sin(\arcsin(x)) = x \quad \text{for } x \in [-1, 1]$$

$$\arcsin(\sin(\theta)) = \theta \quad \text{only if } \theta \in [-\pi/2, \pi/2]$$

The second identity fails outside the restricted range:
$\arcsin(\sin(2\pi/3)) = \arcsin(\sqrt{3}/2) = \pi/3 \neq 2\pi/3$.
The output is the principal value, not the original angle.

---

### $\arccos$: Domain $[-1,1]$, Range $[0,\ \pi]$

**Definition:** $\arccos(x) = \theta$ means $\cos\theta = x$ and
$\theta \in [0,\ \pi]$.

**Key values:** $\arccos(1) = 0$, $\arccos(0) = \pi/2$,
$\arccos(-1) = \pi$, $\arccos(1/2) = \pi/3$, $\arccos(-1/2) = 2\pi/3$.

**Complementary identity:** $\arcsin(x) + \arccos(x) = \pi/2$ for all $x \in [-1,1]$.

*Proof:* Let $\theta = \arcsin(x)$, so $\sin\theta = x$ and $\theta\in[-\pi/2,\pi/2]$.
Then $\cos(\pi/2 - \theta) = \sin\theta = x$, and $\pi/2 - \theta \in [0, \pi]$
(the range of $\arccos$). So $\arccos(x) = \pi/2 - \theta = \pi/2 - \arcsin(x)$. $\blacksquare$

---

### $\arctan$: Domain $\mathbb{R}$, Range $(-\pi/2,\ \pi/2)$

**Definition:** $\arctan(x) = \theta$ means $\tan\theta = x$ and
$\theta \in (-\pi/2,\ \pi/2)$.

**Domain is all of $\mathbb{R}$** because $\tan$ takes every real value.
**Horizontal asymptotes** of the graph: $\arctan(x) \to \pi/2$ as
$x \to +\infty$ and $\arctan(x) \to -\pi/2$ as $x \to -\infty$.

**$\arctan$ is the most practically useful inverse trig function** because:
1. Given a slope $m = \Delta y/\Delta x$, the angle from horizontal
   is $\arctan(m)$.
2. In signal processing, phase angles are computed via $\arctan$.
3. In navigation, bearings between two points use $\arctan$.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

fig, axes = plt.subplots(1, 3, figsize=(14, 6))

# arcsin
x_sin = np.linspace(-1, 1, 400)
axes[0].plot(x_sin, np.arcsin(x_sin), color='#2980b9', lw=2.5)
# np.arcsin: element-wise arcsin, domain [-1,1], range [-pi/2, pi/2]
axes[0].axhline(0, color='#333', lw=0.8); axes[0].axvline(0, color='#333', lw=0.8)
axes[0].axhline( math.pi/2, color='#aaa', lw=1, linestyle='--')
axes[0].axhline(-math.pi/2, color='#aaa', lw=1, linestyle='--')
axes[0].set_yticks([-math.pi/2, -math.pi/4, 0, math.pi/4, math.pi/2])
axes[0].set_yticklabels(['$-\\pi/2$','$-\\pi/4$','$0$','$\\pi/4$','$\\pi/2$'])
# set_yticks/yticklabels: same pattern as x-axis labels, now for y-axis
axes[0].set_title('$y = \\arcsin x$\nDomain $[-1,1]$, Range $[-\\pi/2, \\pi/2]$', fontsize=10)
axes[0].set_xlabel('$x$'); axes[0].set_ylabel('$y$ (radians)')
axes[0].grid(True, alpha=0.3)

# arccos
x_cos = np.linspace(-1, 1, 400)
axes[1].plot(x_cos, np.arccos(x_cos), color='#e74c3c', lw=2.5)
# np.arccos: element-wise arccos, domain [-1,1], range [0, pi]
axes[1].axhline(0,       color='#333', lw=0.8); axes[1].axvline(0, color='#333', lw=0.8)
axes[1].axhline(math.pi, color='#aaa', lw=1, linestyle='--')
axes[1].axhline(math.pi/2, color='#aaa', lw=1, linestyle='--')
axes[1].set_yticks([0, math.pi/4, math.pi/2, 3*math.pi/4, math.pi])
axes[1].set_yticklabels(['$0$','$\\pi/4$','$\\pi/2$','$3\\pi/4$','$\\pi$'])
axes[1].set_title('$y = \\arccos x$\nDomain $[-1,1]$, Range $[0, \\pi]$', fontsize=10)
axes[1].set_xlabel('$x$'); axes[1].set_ylabel('$y$ (radians)')
axes[1].grid(True, alpha=0.3)

# arctan
x_tan = np.linspace(-8, 8, 400)
axes[2].plot(x_tan, np.arctan(x_tan), color='#27ae60', lw=2.5)
# np.arctan: element-wise arctan, domain R, range (-pi/2, pi/2)
axes[2].axhline(0, color='#333', lw=0.8); axes[2].axvline(0, color='#333', lw=0.8)
axes[2].axhline( math.pi/2, color='#aaa', lw=1.2, linestyle='--', label='$\\pm\\pi/2$ asymptotes')
axes[2].axhline(-math.pi/2, color='#aaa', lw=1.2, linestyle='--')
axes[2].set_yticks([-math.pi/2, -math.pi/4, 0, math.pi/4, math.pi/2])
axes[2].set_yticklabels(['$-\\pi/2$','$-\\pi/4$','$0$','$\\pi/4$','$\\pi/2$'])
axes[2].set_title('$y = \\arctan x$\nDomain $\\mathbb{R}$, Range $(-\\pi/2, \\pi/2)$', fontsize=10)
axes[2].set_xlabel('$x$'); axes[2].set_ylabel('$y$ (radians)')
axes[2].legend(fontsize=8); axes[2].grid(True, alpha=0.3)

plt.suptitle('The three principal inverse trigonometric functions', fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `np.arcsin`, `np.arccos`, `np.arctan` are numpy's
element-wise inverse trig functions — the first appearance of this set.
`axes[0].set_yticks([...])` and `axes[0].set_yticklabels([...])` work
identically to the `x` versions from Lesson 2.2, replacing default
numerical tick marks with $\pi$-fraction labels. The dashed horizontal
lines mark the asymptotes of $\arctan$ and the boundary values of
$\arcsin$ and $\arccos$.

---

### The Two-Argument Arctangent: `atan2`

**The problem with $\arctan(y/x)$:** $\arctan$ only returns values in
$(-\pi/2, \pi/2)$ — the right half-plane. Given a point $(x, y)$ in the
second quadrant (where $x < 0$, $y > 0$), the angle is between $\pi/2$
and $\pi$, but $\arctan(y/x)$ gives a negative value (the equivalent
angle in the fourth quadrant). Also, if $x = 0$, division is undefined.

**Solution:** the `atan2(y, x)` function takes two separate arguments
and returns the correct angle in $(-\pi, \pi]$ for any $(x, y)$:

$$\text{atan2}(y, x) = \begin{cases} \arctan(y/x) & x > 0 \\ \arctan(y/x) + \pi & x < 0,\ y \geq 0 \\ \arctan(y/x) - \pi & x < 0,\ y < 0 \\ +\pi/2 & x = 0,\ y > 0 \\ -\pi/2 & x = 0,\ y < 0 \end{cases}$$

This is the standard function used in every geometric computation. The
argument order is `atan2(y, x)` — **$y$ first**, then $x$ — which catches
many beginners off guard.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

print("atan2(y, x) — correct quadrant always:\n")
print(f"{'Point (x,y)':>16}  {'atan2':>10}  {'degrees':>9}  {'Quadrant'}")
print("-" * 55)

test_points = [
    ( 1,  1,  'Q1'),
    (-1,  1,  'Q2'),
    (-1, -1,  'Q3'),
    ( 1, -1,  'Q4'),
    ( 1,  0,  'positive x-axis'),
    (-1,  0,  'negative x-axis'),
    ( 0,  1,  'positive y-axis'),
    ( 0, -1,  'negative y-axis'),
]

for x, y, label in test_points:
    angle   = math.atan2(y, x)    # math.atan2(y, x): note y FIRST
    naive   = math.atan(y/x) if x != 0 else float('nan')
    print(f"  ({x:+2d}, {y:+2d})  {angle:>10.4f}  {math.degrees(angle):>9.1f}°  {label}")

print()
# Show where naive arctan fails vs atan2
print("Comparison: arctan(y/x) vs atan2(y, x) for Q2 point (-1, 1):")
x, y = -1, 1
print(f"  arctan(y/x) = arctan({y}/{x}) = arctan(-1) = {math.atan(y/x):.4f} ({math.degrees(math.atan(y/x)):.1f}°)  WRONG")
print(f"  atan2(y,x)  = atan2({y},{x})  = {math.atan2(y,x):.4f} ({math.degrees(math.atan2(y,x)):.1f}°)  CORRECT")
```

**Walkthrough:** `math.atan2(y, x)` is Python's two-argument arctangent.
The critical thing to notice: **$y$ is the first argument, $x$ is the
second**. This is the universal convention across mathematics, physics,
and every programming language — but it is easily confused with the
natural `(x, y)` ordering of a point. The comparison shows that the
naive `math.atan(y/x)` gives $-45°$ for the point $(-1, 1)$ (which is
genuinely at $135°$) because it cannot distinguish Q2 from Q4.

---

### Exact Values and Compositions

**Hand-worked examples:**

(a) $\arcsin(1/2) = \pi/6$ because $\sin(\pi/6) = 1/2$ and $\pi/6 \in [-\pi/2, \pi/2]$. ✓

(b) $\arccos(-\sqrt{3}/2)$: need $\theta \in [0,\pi]$ with $\cos\theta = -\sqrt{3}/2$.
That is $\theta = 5\pi/6$. So $\arccos(-\sqrt{3}/2) = 5\pi/6$.

(c) $\sin(\arctan(3/4))$: let $\theta = \arctan(3/4)$, so $\tan\theta = 3/4$
in Q1. From the 3-4-5 right triangle: $\sin\theta = 3/5$.
So $\sin(\arctan(3/4)) = 3/5$.

(d) $\cos(\arcsin(-5/13))$: let $\theta = \arcsin(-5/13)$, so $\sin\theta = -5/13$
and $\theta \in [-\pi/2, 0]$ (negative input → negative output from $\arcsin$).
$\cos\theta = \sqrt{1 - 25/169} = \sqrt{144/169} = 12/13$ (positive because
$\theta$ is in Q4 where $\cos > 0$). So $\cos(\arcsin(-5/13)) = 12/13$.

```python
import math

print("Evaluating compositions:\n")

# sin(arctan(3/4)): draw a 3-4-5 triangle
theta = math.atan(3/4)
result = math.sin(theta)
print(f"sin(arctan(3/4)):")
print(f"  arctan(3/4) = {theta:.4f} ({math.degrees(theta):.2f}°)")
print(f"  sin(arctan(3/4)) = {result:.4f}  (exact: 3/5 = {3/5})")

print()
# cos(arcsin(-5/13))
theta2 = math.asin(-5/13)
result2 = math.cos(theta2)
print(f"cos(arcsin(-5/13)):")
print(f"  arcsin(-5/13) = {theta2:.4f} ({math.degrees(theta2):.2f}°)  [in Q4]")
print(f"  cos(arcsin(-5/13)) = {result2:.6f}  (exact: 12/13 = {12/13:.6f})")

print()
# Demonstrate restricted range: arcsin(sin(x)) ≠ x outside [-pi/2, pi/2]
print("Cancellation identity: arcsin(sin(θ)) = θ ONLY if θ ∈ [-π/2, π/2]:\n")
for theta_deg in [30, 90, 120, 150, 210, 330]:
    theta = math.radians(theta_deg)
    result = math.asin(math.sin(theta))
    matches = math.isclose(result, theta, abs_tol=1e-9)
    print(f"  arcsin(sin({theta_deg:3d}°)) = arcsin({math.sin(theta):+.4f}) "
          f"= {math.degrees(result):+.1f}°  {'= θ ✓' if matches else f'≠ θ ✗ (outside range)'}")
```

**Walkthrough:** The last loop demonstrates one of the most common
beginner errors with inverse trig: assuming $\arcsin(\sin\theta) = \theta$
always. For $\theta = 150°$, $\sin(150°) = 0.5$, so $\arcsin(0.5) = 30°$
— not $150°$. The output is the principal value in $[-90°, 90°]$, which
happens to be the angle in Q1 with the same sine value.

---

### Applications

**CNC machining — tool angle from slope:**
A surface has slope $\Delta z / \Delta x = 0.364$. What angle does
the surface make with horizontal?

$$\alpha = \arctan(0.364) \approx 20°$$

The tool must be tilted by $20°$ to machine this surface perpendicular to its face.

**Robotics — joint angle from end-effector position:**
A 2-link planar arm has links of length $L_1 = 300$ mm and $L_2 = 200$ mm.
The end-effector is at $(x, y) = (400, 150)$ mm. Finding the joint angles
requires solving: $x = L_1\cos\theta_1 + L_2\cos(\theta_1+\theta_2)$,
$y = L_1\sin\theta_1 + L_2\sin(\theta_1+\theta_2)$ — a system whose
solution involves $\arctan$.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

# Convert Cartesian coordinates to polar angle using atan2
def cartesian_to_polar(x, y):
    """Return (r, theta_rad) for the point (x, y)."""
    r = math.sqrt(x**2 + y**2)   # distance from origin
    theta = math.atan2(y, x)      # angle, correct for all quadrants
    return r, theta

print("Cartesian → Polar using atan2:\n")
points = [(3, 4), (-3, 4), (-3, -4), (3, -4), (0, 5), (-2, 0)]
print(f"{'(x, y)':>12}  {'r':>8}  {'θ (rad)':>10}  {'θ (deg)':>10}")
print("-" * 48)
for x, y in points:
    r, theta = cartesian_to_polar(x, y)
    print(f"  ({x:+3}, {y:+3})  {r:>8.4f}  {theta:>10.4f}  {math.degrees(theta):>10.2f}°")

# Surface angle from slope
print("\nMachining application — surface angle from slope:")
for slope, label in [(0.364, "gentle"), (1.0, "45°"), (2.747, "70°")]:
    angle = math.degrees(math.atan(slope))
    print(f"  slope={slope:.3f} ({label}): angle = {angle:.2f}°")

# Visualise: angle from CNC coordinate system
fig, ax = plt.subplots(figsize=(9, 5))
x_surf = np.linspace(0, 4, 100)
slope  = 0.364
y_surf = slope * x_surf

ax.plot(x_surf, y_surf, color='#e74c3c', lw=3, label='Surface')
ax.axhline(0, color='#2980b9', lw=1.5, label='Tool horizontal axis')

# Draw angle arc
theta_rad = math.atan(slope)
theta_arc = np.linspace(0, theta_rad, 60)
r_arc = 0.8
ax.plot(r_arc*np.cos(theta_arc), r_arc*np.sin(theta_arc),
        color='#27ae60', lw=2)
ax.text(r_arc*math.cos(theta_rad/2)+0.05,
        r_arc*math.sin(theta_rad/2)+0.05,
        f'$\\alpha = \\arctan(0.364) \\approx 20°$',
        fontsize=9, color='#27ae60')

ax.set_xlim(-0.5, 4.5); ax.set_ylim(-0.5, 2)
ax.set_aspect('equal')
ax.set_title('Finding surface angle with $\\arctan$:\n'
             'slope = $\\Delta z / \\Delta x$ → tilt angle',
             fontsize=11)
ax.set_xlabel('$x$ (mm)'); ax.set_ylabel('$z$ (mm)')
ax.legend(fontsize=10); ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `cartesian_to_polar` uses `math.atan2(y, x)` — the
correct two-argument form — to compute the polar angle without any
quadrant ambiguity. `np.cos(theta_arc)` and `np.sin(theta_arc)` draw
the angle arc as a parametric curve at radius `r_arc`. This is the
same parametric circle technique from Lesson 2.1's unit circle diagram,
now used to draw just a portion of a circle as an angle indicator.

---

## Connect the Pieces

**What this lesson built on:** Injective functions and inverses
(Lesson 0.7 — we restricted to a monotone interval to achieve
injectivity). The reflection property of inverses (Lesson 0.8 —
the graph is the reflection across $y=x$). All six trig functions
(Lessons 2.1–2.3).

**What this lesson makes possible:** Lesson 2.5 (identities) uses
$\arcsin + \arccos = \pi/2$ and related results. Stage 3 (Analytic
Geometry) uses `atan2` for bearings and polar coordinates. Stage 4
(Linear Algebra) uses $\arccos$ for the angle between vectors.
Stage 5 (Calculus) — the derivatives $\frac{d}{dx}\arcsin x = 1/\sqrt{1-x^2}$
and $\frac{d}{dx}\arctan x = 1/(1+x^2)$ are among the most important
in the table.

**In CS and robotics:** `math.atan2(y, x)` is in every geometry
computation — collision detection, pathfinding, camera orientation,
inverse kinematics. Every 2D game and every robotics library has it.
The two-argument form is the version always used in production code.

---

## Summary

**$\arcsin$:** $[-1,1] \to [-\pi/2, \pi/2]$.
$\sin(\arcsin x) = x$. $\arcsin(\sin\theta) = \theta$ only if $\theta\in[-\pi/2,\pi/2]$.

**$\arccos$:** $[-1,1] \to [0, \pi]$.
$\arcsin x + \arccos x = \pi/2$.

**$\arctan$:** $\mathbb{R} \to (-\pi/2, \pi/2)$.
Horizontal asymptotes at $\pm\pi/2$. Used for slope → angle.

**`atan2(y, x)`:** returns angle in $(-\pi, \pi]$ for any $(x,y)$.
Handles all quadrants correctly. **Always prefer `atan2` over `arctan(y/x)`.**

**New Python:**
- `np.arcsin(x)`, `np.arccos(x)`, `np.arctan(x)` — element-wise inverse trig
- `math.asin(x)`, `math.acos(x)`, `math.atan(x)` — scalar versions
- `math.atan2(y, x)` — two-argument arctangent, $y$ first
- `np.arctan2(y, x)` — element-wise version for arrays
- `ax.set_yticks(...)`, `ax.set_yticklabels(...)` — custom y-axis ticks

---

## Problems

### Math

**1.** Evaluate exactly (give answer in radians as a fraction of $\pi$).

(a) $\arcsin\!\left(-\dfrac{\sqrt{3}}{2}\right)$ &emsp;
(b) $\arccos(0)$ &emsp;
(c) $\arctan(-1)$ &emsp;
(d) $\arcsin\!\left(\sin\!\dfrac{7\pi}{6}\right)$

<details>
<summary>Answers</summary>

(a) $-\pi/3$ (since $\sin(-\pi/3)=-\sqrt{3}/2$ and $-\pi/3\in[-\pi/2,\pi/2]$)

(b) $\pi/2$ (since $\cos(\pi/2)=0$ and $\pi/2\in[0,\pi]$)

(c) $-\pi/4$ (since $\tan(-\pi/4)=-1$ and $-\pi/4\in(-\pi/2,\pi/2)$)

(d) $\sin(7\pi/6)=-1/2$, so $\arcsin(-1/2)=-\pi/6$. Note: $7\pi/6\notin[-\pi/2,\pi/2]$, so we do not recover $7\pi/6$.

</details>

---

**2.** Find the exact value of each composition.

(a) $\cos(\arctan\,2)$

(b) $\tan\!\left(\arcsin\!\dfrac{3}{5}\right)$

(c) $\sin\!\left(\arccos\!\left(-\dfrac{1}{3}\right)\right)$

<details>
<summary>Answers</summary>

(a) Let $\theta=\arctan 2$, $\tan\theta=2$, Q1. $\sec^2\theta=1+4=5$, $\cos\theta=1/\sqrt{5}=\sqrt{5}/5$.

(b) $\theta=\arcsin(3/5)$, $\sin\theta=3/5$, $\cos\theta=4/5$. $\tan\theta=3/4$.

(c) $\theta=\arccos(-1/3)\in(\pi/2,\pi)$, $\cos\theta=-1/3$. $\sin\theta=\sqrt{1-1/9}=\sqrt{8/9}=2\sqrt{2}/3$ (positive in Q2).

</details>

---

**3.** (Proof) Prove that $\arctan(x) + \arctan(1/x) = \pi/2$ for $x > 0$.

<details>
<summary>Answer</summary>

Let $\alpha=\arctan(x)$ and $\beta=\arctan(1/x)$, both in $(0,\pi/2)$ for $x>0$.
$\tan\alpha=x$ and $\tan\beta=1/x=\cot\alpha=\tan(\pi/2-\alpha)$.
Since $\arctan$ is injective and $\pi/2-\alpha\in(0,\pi/2)$:
$\beta=\pi/2-\alpha$, i.e., $\alpha+\beta=\pi/2$. $\blacksquare$

</details>

---

### Code Challenges

**Challenge 1 — Inverse trig evaluator**

```python
import math

def arcsin_deg(x):
    """Return arcsin(x) in degrees. Raises ValueError if |x| > 1."""
    pass

def arccos_deg(x):
    """Return arccos(x) in degrees. Raises ValueError if |x| > 1."""
    pass

def arctan_deg(x):
    """Return arctan(x) in degrees."""
    pass

def atan2_deg(y, x):
    """Return atan2(y, x) in degrees. Full range (-180, 180]."""
    pass


# --- tests: do not modify ---
assert math.isclose(arcsin_deg(0.5),            30.0,  abs_tol=1e-9)
assert math.isclose(arcsin_deg(-math.sqrt(2)/2),-45.0, abs_tol=1e-9)
assert math.isclose(arccos_deg(0),              90.0,  abs_tol=1e-9)
assert math.isclose(arccos_deg(-0.5),          120.0,  abs_tol=1e-9)
assert math.isclose(arctan_deg(1),              45.0,  abs_tol=1e-9)
assert math.isclose(arctan_deg(-math.sqrt(3)), -60.0,  abs_tol=1e-9)
assert math.isclose(atan2_deg(1, -1),          135.0,  abs_tol=1e-9)
assert math.isclose(atan2_deg(-1, -1),        -135.0,  abs_tol=1e-9)

try:
    arcsin_deg(1.5)
    assert False, "Should raise ValueError"
except ValueError:
    pass

print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Cartesian to polar**

```python
import math

def cartesian_to_polar_deg(x, y):
    """
    Convert (x, y) to (r, theta_degrees) where theta in (-180, 180].
    Returns (r, theta) as a tuple.
    """
    pass

def polar_to_cartesian(r, theta_deg):
    """
    Convert (r, theta_degrees) to (x, y).
    """
    pass


# --- tests: do not modify ---
import math

r, t = cartesian_to_polar_deg(1, 0)
assert math.isclose(r, 1.0) and math.isclose(t, 0.0)

r, t = cartesian_to_polar_deg(0, 3)
assert math.isclose(r, 3.0) and math.isclose(t, 90.0)

r, t = cartesian_to_polar_deg(-1, 1)
assert math.isclose(r, math.sqrt(2)) and math.isclose(t, 135.0)

# Round-trip: polar -> Cartesian -> polar
for r_in, t_in in [(5, 37), (3, -120), (2, 180)]:
    x, y = polar_to_cartesian(r_in, t_in)
    r_out, t_out = cartesian_to_polar_deg(x, y)
    assert math.isclose(r_out, r_in, rel_tol=1e-9)
    assert math.isclose(t_out, t_in, abs_tol=1e-9)

print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Angle between two points**

```python
import math

def bearing(x1, y1, x2, y2):
    """
    Compute the angle from point (x1,y1) to point (x2,y2),
    measured counterclockwise from the positive x-axis.
    Returns angle in degrees in [0, 360).
    """
    pass

def angle_between_vectors(x1, y1, x2, y2):
    """
    Compute the angle between vectors (x1,y1) and (x2,y2),
    using the dot product formula:
    cos(theta) = (x1*x2 + y1*y2) / (|v1| * |v2|)
    Returns angle in degrees in [0, 180].
    """
    pass


# --- tests: do not modify ---
import math

assert math.isclose(bearing(0,0, 1,0),   0.0,   abs_tol=1e-9)   # east
assert math.isclose(bearing(0,0, 0,1),   90.0,  abs_tol=1e-9)   # north
assert math.isclose(bearing(0,0,-1,0),   180.0, abs_tol=1e-9)   # west
assert math.isclose(bearing(0,0, 0,-1),  270.0, abs_tol=1e-9)   # south
assert math.isclose(bearing(0,0, 1,1),   45.0,  abs_tol=1e-9)   # NE

assert math.isclose(angle_between_vectors(1,0, 0,1), 90.0,  abs_tol=1e-9)
assert math.isclose(angle_between_vectors(1,0, 1,0), 0.0,   abs_tol=1e-9)
assert math.isclose(angle_between_vectors(1,0,-1,0), 180.0, abs_tol=1e-9)
assert math.isclose(angle_between_vectors(1,1, 1,0), 45.0,  abs_tol=1e-9)

print("✓ Challenge 3 passed!")
```

<details>
<summary>Hint for angle_between_vectors</summary>

Use `math.acos(dot_product / (mag1 * mag2))` where `dot_product = x1*x2 + y1*y2`,
`mag1 = math.sqrt(x1**2+y1**2)`, `mag2 = math.sqrt(x2**2+y2**2)`.
Clamp the argument to $[-1,1]$ with `max(-1, min(1, ...))` to avoid
floating-point errors causing `acos` to receive a value slightly outside
its domain.

</details>

---

### Extension

**4. ★** A classic result: $\arctan(1/2) + \arctan(1/3) = \pi/4$.

(a) Prove it using the addition formula for tangent:
$\tan(\alpha+\beta) = \dfrac{\tan\alpha+\tan\beta}{1-\tan\alpha\tan\beta}$.

(b) This identity was used by John Machin in 1706 to compute $\pi$ to
100 decimal places. He used $\pi/4 = 4\arctan(1/5) - \arctan(1/239)$,
which converges much faster. Verify this numerically.

```python
import math
result = 4*math.atan(1/5) - math.atan(1/239)
print(f"4*arctan(1/5) - arctan(1/239) = {result:.15f}")
print(f"pi/4                          = {math.pi/4:.15f}")
print(f"Match: {math.isclose(result, math.pi/4)}")
```

<details>
<summary>Answer to (a)</summary>

Let $\alpha=\arctan(1/2)$, $\beta=\arctan(1/3)$.
$\tan(\alpha+\beta) = \frac{1/2+1/3}{1-1/2\cdot1/3} = \frac{5/6}{5/6} = 1$.
Since $\alpha,\beta\in(0,\pi/4)$, their sum is in $(0,\pi/2)$.
The unique angle in $(0,\pi/2)$ with tangent 1 is $\pi/4$.
Therefore $\alpha+\beta=\pi/4$. $\blacksquare$

</details>
