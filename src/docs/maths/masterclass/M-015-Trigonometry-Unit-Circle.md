# M-015 — The Unit Circle: One Picture That Replaces Every Trig Formula

**Phase 4 · Exponentials, Logarithms, and Trigonometry · Lesson 3 of 3**

---

Your teacher gave you a right triangle and said: opposite over hypotenuse is sine, adjacent over hypotenuse is cosine. Fine. Now: what is sin(150°)? What is cos(−45°)? What is sin(720°)?

A right triangle has angles between 0° and 90°. It breaks for everything else.

There is one picture that fixes all of this, extends trig to every angle that exists — including negative angles and angles bigger than 360° — and from which every trig identity you've ever memorised can be *derived* in under a minute. Let's build it.

---

## The Setup: One Circle, Two Coordinates

Take a circle with radius 1, centred at the origin. Place a point on it at angle θ, measured counterclockwise from the positive x-axis.

That point has an x-coordinate and a y-coordinate. We give them names:

$$(\cos θ,\; \sin θ) = \text{the point on the unit circle at angle } θ$$

That's the whole definition. **cos θ is the x-coordinate. sin θ is the y-coordinate.**

---

## The Full Diagram — Every Key Angle, Labelled

This is the diagram you need to be able to read fluently. Every key angle, its radian measure, and its exact coordinates:

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

fig, ax = plt.subplots(1, 1, figsize=(10, 10))
ax.set_facecolor('#0f1117')
fig.patch.set_facecolor('#0f1117')
ax.set_aspect('equal')
ax.set_xlim(-1.7, 1.7)
ax.set_ylim(-1.7, 1.7)

# Unit circle
theta_full = np.linspace(0, 2*np.pi, 400)
ax.plot(np.cos(theta_full), np.sin(theta_full), color='#2a4060', lw=2)

# Axes
ax.axhline(0, color='#3a4060', lw=1)
ax.axvline(0, color='#3a4060', lw=1)
ax.text( 1.12, 0.04, '1',  color='#555', fontsize=10, ha='center')
ax.text(-1.12, 0.04, '-1', color='#555', fontsize=10, ha='center')
ax.text( 0.04, 1.12, '1',  color='#555', fontsize=10)
ax.text( 0.04,-1.12, '-1', color='#555', fontsize=10)

# Key angles: (degrees, radian_label, coords_label)
key_angles = [
    (0,   '0',      '(1, 0)'),
    (30,  'π/6',    '(√3/2, ½)'),
    (45,  'π/4',    '(√2/2, √2/2)'),
    (60,  'π/3',    '(½, √3/2)'),
    (90,  'π/2',    '(0, 1)'),
    (120, '2π/3',   '(-½, √3/2)'),
    (135, '3π/4',   '(-√2/2, √2/2)'),
    (150, '5π/6',   '(-√3/2, ½)'),
    (180, 'π',      '(-1, 0)'),
    (210, '7π/6',   '(-√3/2, -½)'),
    (225, '5π/4',   '(-√2/2, -√2/2)'),
    (240, '4π/3',   '(-½, -√3/2)'),
    (270, '3π/2',   '(0, -1)'),
    (300, '5π/3',   '(½, -√3/2)'),
    (315, '7π/4',   '(√2/2, -√2/2)'),
    (330, '11π/6',  '(√3/2, -½)'),
]

for (deg, rad_label, coord_label) in key_angles:
    rad = np.radians(deg)
    px, py = np.cos(rad), np.sin(rad)

    # Spoke
    ax.plot([0, px], [0, py], color='#1e3050', lw=1, zorder=1)

    # Dot
    ax.plot(px, py, 'o', color='#4fc3f7', markersize=5, zorder=3)

    # Radian label (just outside the circle)
    label_r = 1.18
    lx, ly = label_r * np.cos(rad), label_r * np.sin(rad)
    ax.text(lx, ly, rad_label, color='#5a8aaa', fontsize=9,
            ha='center', va='center', fontfamily='serif', style='italic')

    # Coordinate label (further out, only at 45° multiples to avoid clutter)
    if deg % 90 == 0 or deg in [30, 60, 120, 150, 210, 240, 300, 330]:
        coord_r = 1.45
        cx_pos = coord_r * np.cos(rad)
        cy_pos = coord_r * np.sin(rad)
        ax.text(cx_pos, cy_pos, coord_label, color='#3a6080',
                fontsize=7.5, ha='center', va='center', fontfamily='monospace')

ax.axis('off')
ax.set_title('The Unit Circle — every key angle and its (cos θ, sin θ) coordinates',
             color='#5a7a90', fontsize=11, style='italic', pad=12)
plt.tight_layout()
plt.show()
```

Take a moment with that diagram. The coordinates at 0° are (1, 0) — the starting point. At 90° it's (0, 1) — the top of the circle. This is the definition: cos is x, sin is y.

---

## Why Right Triangles Are Just a Special Case

For angles between 0° and 90°, the point on the circle, the origin, and the foot of a perpendicular form a right triangle with hypotenuse 1. So "opposite over hypotenuse" is just the y-coordinate — which is sin θ. The old definition was a special case all along.

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

fig, ax = plt.subplots(figsize=(6, 5.5))
ax.set_facecolor('#0f1117')
fig.patch.set_facecolor('#0f1117')
ax.set_aspect('equal')
ax.set_xlim(-0.15, 1.3)
ax.set_ylim(-0.15, 1.15)

theta = np.radians(50)
px, py = np.cos(theta), np.sin(theta)

# Arc (first quadrant only)
arc_t = np.linspace(0, np.pi/2, 100)
ax.plot(np.cos(arc_t), np.sin(arc_t), color='#2a4060', lw=2)

# Axes
ax.axhline(0, color='#3a4060', lw=1)
ax.axvline(0, color='#3a4060', lw=1)

# Right triangle
triangle = plt.Polygon([[0,0],[px,0],[px,py]], closed=True,
                        facecolor='#4fc3f720', edgecolor='#2a4060', lw=1)
ax.add_patch(triangle)

# Hypotenuse (radius = 1)
ax.plot([0, px], [0, py], color='#ccc', lw=2.5, label='radius = 1 (hypotenuse)')

# cos θ leg — horizontal
ax.plot([0, px], [0, 0], color='#4fc3f7', lw=3)
ax.text(px/2, -0.07, 'cos θ  (adjacent)', color='#4fc3f7', fontsize=10, ha='center')

# sin θ leg — vertical
ax.plot([px, px], [0, py], color='#ff9800', lw=3)
ax.text(px + 0.07, py/2, 'sin θ\n(opposite)', color='#ff9800', fontsize=10, ha='left', va='center')

# Point
ax.plot(px, py, 'wo', markersize=8)

# Right angle mark
small = 0.04
ax.plot([px - small, px - small, px], [0, small, small], color='#555', lw=1)

# Angle arc
angle_arc = np.linspace(0, theta, 60)
ax.plot(0.12*np.cos(angle_arc), 0.12*np.sin(angle_arc), color='#888', lw=1.5)
ax.text(0.16, 0.06, 'θ = 50°', color='#888', fontsize=9)

ax.set_title('For 0° < θ < 90°, the old and new definitions agree.\n'
             'The hypotenuse is 1, so "opposite/hyp" = y-coordinate = sin θ.',
             color='#5a7a90', fontsize=10, style='italic')
ax.axis('off')
plt.tight_layout()
plt.show()
```

---

## Reading Values Off the Circle

You don't memorise a table. You derive values from geometry.

**0°:** start at (1, 0). So cos 0 = 1, sin 0 = 0.

**90°:** quarter turn to the top, (0, 1). So cos 90° = 0, sin 90° = 1.

**45°:** the point is equidistant from both axes, so x = y. From x² + y² = 1 with x = y: 2x² = 1, x = 1/√2 ≈ 0.707. Both equal.

**30° and 60°:** from the geometry of the equilateral triangle inscribed in the unit circle. sin 30° = 1/2, cos 30° = √3/2. At 60°, the values swap.

**150°:** mirror of 30° across the y-axis. Same y-coordinate (sin 150° = 1/2), but x flips sign: cos 150° = −√3/2.

None of this is memorisation. It is geometry.

---

## The Pythagorean Identity — One Line

Every point (cos θ, sin θ) lies on the circle x² + y² = 1. Substitute the names:

$$\cos^2 θ + \sin^2 θ = 1$$

This is not an identity to memorise. It **is** the equation of the circle.

---

## Why Radians?

1 radian = the angle that cuts off an arc of length 1 on the unit circle (radius = 1, so arc length = angle in radians).

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

fig, ax = plt.subplots(figsize=(6, 5))
ax.set_facecolor('#0f1117')
fig.patch.set_facecolor('#0f1117')
ax.set_aspect('equal')
ax.set_xlim(-1.4, 1.4)
ax.set_ylim(-1.2, 1.4)

# Full circle (dim)
t_full = np.linspace(0, 2*np.pi, 400)
ax.plot(np.cos(t_full), np.sin(t_full), color='#1e2d3a', lw=2)

# Highlighted arc: 1 radian (about 57.3°)
t_arc = np.linspace(0, 1.0, 100)
ax.plot(np.cos(t_arc), np.sin(t_arc), color='#ff9800', lw=5, label='Arc length = 1 radian = 1 unit')

# Radii
ax.plot([0, 1],                         [0, 0],             color='#4fc3f7', lw=2)
ax.plot([0, np.cos(1)], [0, np.sin(1)], color='#4fc3f7', lw=2)
ax.text(0.5, -0.1, 'radius = 1', color='#4fc3f7', fontsize=10, ha='center')

# Angle arc (inner)
inner = np.linspace(0, 1.0, 60)
ax.plot(0.25*np.cos(inner), 0.25*np.sin(inner), color='#888', lw=2)
ax.text(0.3, 0.14, '1 rad\n≈ 57.3°', color='#888', fontsize=9)

# Arc length label
mid_arc = 0.5
ax.annotate('arc = 1\n(= θ in radians)',
            xy=(np.cos(mid_arc)*1.02, np.sin(mid_arc)*1.02),
            xytext=(1.1, 0.85),
            color='#ff9800', fontsize=10,
            arrowprops=dict(arrowstyle='->', color='#ff9800', lw=1.5))

ax.set_title('1 radian: arc length = 1 on the unit circle\n'
             'So arc length = θ (in radians). No conversion needed.',
             color='#5a7a90', fontsize=10, style='italic')
ax.axis('off')
plt.tight_layout()
plt.show()
```

Why this matters for calculus: the derivative of sin is cos — **only in radians**. In degrees it would be (π/180)cos. Radians make the formula clean. Use them everywhere.

---

## Sin and Cos as Waves

The unit circle shows sin and cos as coordinates. "Unroll" the circle — plot the coordinate value against the angle — and you get a wave. These two plots tell you everything about the behaviour of both functions:

```python
import matplotlib.pyplot as plt
import numpy as np

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 6), sharex=True)
for ax in [ax1, ax2]:
    ax.set_facecolor('#0f1117')
fig.patch.set_facecolor('#0f1117')

theta = np.linspace(0, 2*np.pi, 500)

# Mark key x positions
key_x = [0, np.pi/6, np.pi/4, np.pi/3, np.pi/2, np.pi, 3*np.pi/2, 2*np.pi]
key_labels = ['0', 'π/6', 'π/4', 'π/3', 'π/2', 'π', '3π/2', '2π']

# sin plot
ax1.plot(theta, np.sin(theta), color='#ff9800', lw=2.5)
ax1.axhline(0,  color='#3a4060', lw=1)
ax1.axhline(1,  color='#2a3550', lw=0.8, ls='--')
ax1.axhline(-1, color='#2a3550', lw=0.8, ls='--')
ax1.set_ylabel('sin θ', color='#ff9800', fontsize=11)
ax1.set_ylim(-1.4, 1.4)

# Mark the peak at π/2
ax1.annotate('sin(π/2) = 1\n(top of circle)',
             xy=(np.pi/2, 1), xytext=(np.pi/2 + 0.3, 1.2),
             color='#ff9800', fontsize=9,
             arrowprops=dict(arrowstyle='->', color='#ff9800', lw=1))

# cos plot
ax2.plot(theta, np.cos(theta), color='#4fc3f7', lw=2.5)
ax2.axhline(0,  color='#3a4060', lw=1)
ax2.axhline(1,  color='#2a3550', lw=0.8, ls='--')
ax2.axhline(-1, color='#2a3550', lw=0.8, ls='--')
ax2.set_ylabel('cos θ', color='#4fc3f7', fontsize=11)
ax2.set_ylim(-1.4, 1.4)
ax2.set_xticks(key_x)
ax2.set_xticklabels(key_labels, color='#555', fontsize=9)
ax2.tick_params(axis='x', colors='#555')

# Mark start at 0
ax2.annotate('cos(0) = 1\n(starts at (1,0))',
             xy=(0, 1), xytext=(0.3, 1.2),
             color='#4fc3f7', fontsize=9,
             arrowprops=dict(arrowstyle='->', color='#4fc3f7', lw=1))

for ax in [ax1, ax2]:
    ax.tick_params(axis='y', colors='#555')
    for s in ax.spines.values():
        s.set_color('#2a3050')
    for xk in key_x:
        ax.axvline(xk, color='#1e2535', lw=0.8)

fig.suptitle('sin and cos as waves — the unit circle, unrolled',
             color='#5a7a90', fontsize=12, style='italic', y=0.98)
plt.tight_layout()
plt.show()
```

**Notice:** where sin reaches its peak (1), cos is at zero. Where cos starts at its max (1, at θ=0), sin is at zero. They are always 90° out of phase. And sin²θ + cos²θ = 1 holds at every point — you can see this in the plots: when one is large, the other must compensate.

---

## The Angle Addition Formulas — Four Lines

$$\cos(\alpha + \beta) = \cos\alpha\cos\beta - \sin\alpha\sin\beta$$
$$\sin(\alpha + \beta) = \sin\alpha\cos\beta + \cos\alpha\sin\beta$$

These follow from complex multiplication (M-012). Since $e^{i(\alpha+\beta)} = e^{i\alpha} \cdot e^{i\beta}$:

$$(\cos(\alpha+\beta) + i\sin(\alpha+\beta)) = (\cos\alpha + i\sin\alpha)(\cos\beta + i\sin\beta)$$

Expanding the right side and equating real and imaginary parts gives both formulas simultaneously. That's the entire proof.

Verify sin(75°) = sin(45° + 30°):

```python
import math

alpha, beta = math.radians(45), math.radians(30)

sin_75_formula = math.sin(alpha)*math.cos(beta) + math.cos(alpha)*math.sin(beta)
sin_75_direct  = math.sin(math.radians(75))

print(f"Addition formula: sin(45°)cos(30°) + cos(45°)sin(30°)")
print(f"  = {math.sin(alpha):.4f} × {math.cos(beta):.4f} + {math.cos(alpha):.4f} × {math.sin(beta):.4f}")
print(f"  = {sin_75_formula:.8f}")
print(f"Direct:  sin(75°) = {sin_75_direct:.8f}")
print(f"Match:   {abs(sin_75_formula - sin_75_direct) < 1e-12}")
```

---

## Double Angle Formulas — Set α = β

In the addition formulas, set α = β = θ:

$$\cos(2θ) = \cos^2θ - \sin^2θ = 1 - 2\sin^2θ = 2\cos^2θ - 1$$
$$\sin(2θ) = 2\sinθ\cosθ$$

Derived in five seconds. Not memorised.

---

## Negative Angles and Periodicity — Read from the Picture

**sin(−θ) = −sin(θ):** reflect across the x-axis. The y-coordinate flips.
**cos(−θ) = cos(θ):** the x-coordinate is unchanged.
**sin(θ + 2π) = sin(θ):** a full rotation returns you to the same point.

These are not rules. They are observations from the unit circle.

---

## Try It Yourself

1. **Find sin(105°)** using the addition formula sin(60° + 45°). Compute it step by step, then verify:

```python
import math
print("sin(105°) =", math.sin(math.radians(105)))
print("sin(60° + 45°) via formula =",
      math.sin(math.radians(60)) * math.cos(math.radians(45))
      + math.cos(math.radians(60)) * math.sin(math.radians(45)))
```

2. **Prove sin(π − θ) = sin(θ)** using the addition formula with α = π and β = −θ.

3. **Find the exact value of cos(π/12) = cos(15°)** as cos(45° − 30°). No calculator.

---

## What Comes Next

M-016 is where calculus begins. The first thing calculus does with trig is prove that sin's derivative is cos. That proof requires the limit:

$$\lim_{h \to 0} \frac{\sin h}{h} = 1$$

This limit equals 1 *only in radians* — and we can prove it using the arc-length picture from this lesson. Everything we just built is about to become load-bearing.
