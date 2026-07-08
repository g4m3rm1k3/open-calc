# Stage 2, Lesson 2.1 — Angles: Degrees, Radians, and Arc Length
**Threads:** Math · Physics  
**Estimated time:** 55–70 minutes

---

## What This Lesson Is About

Before we can talk about trigonometric functions, we need to agree on how to
measure angles. There are two completely different systems — degrees and radians —
and the choice matters enormously. Degrees are familiar but arbitrary: the
360-degree circle was chosen by ancient Babylonians for astronomical convenience,
not mathematical necessity. Radians are the unit that the geometry of the circle
*forces on you* if you ask the right question: how much angle does an arc
subtend when that arc is exactly as long as the radius? The answer — one radian
— is the only angle unit that makes the arc length formula $s = r\theta$ work
without any conversion factor, that makes angular velocity connect cleanly to
linear speed, and that makes the derivative of $\sin x$ equal $\cos x$ without
a hidden constant. Every formula in physics, signal processing, and engineering
mathematics is written in radians because every formula that lives in calculus
*requires* radians.

By the end of this lesson you will understand where both units come from, convert
fluently between them, derive the arc length and sector area formulas from first
principles, and know exactly why radians are the natural unit for mathematics.

---

## Historical Context

The 360-degree circle appears in Babylonian astronomy around 2000 BCE, most
likely because 360 is close to the number of days in a year and has many
divisors — it divides evenly by 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20,
24, 30, 36, 40, 45, 60, 72, 90, 120, 180, and 360, making it easy to subdivide
into equal parts by hand. Greek astronomers including Hipparchus (c. 150 BCE)
adopted the Babylonian system and built the first trigonometric tables in degrees.
The word **radian** first appeared in print in 1873 in an examination set by
James Thomson (brother of Lord Kelvin), but the concept was used implicitly by
Roger Cotes in 1714. The decisive moment came when Euler, developing calculus
systematically in the 1730s, needed the limit $\lim_{x\to 0}\sin(x)/x = 1$ to
hold exactly — and proved it holds only when $x$ is in radians. That limit is
the reason every calculus formula uses radians.

---

## What You Need To Know First

- **Circle geometry:** the circumference of a circle of radius $r$ is $C = 2\pi r$,
  and the area is $A = \pi r^2$. These are the only facts about circles this lesson
  builds on.
- **Proportional reasoning:** if a full rotation is both 360° and $2\pi$ radians,
  then any angle is the same fraction of each complete turn.
- **$\pi$:** the irrational constant $\pi \approx 3.14159$ defined as the ratio
  of circumference to diameter of any circle, $\pi = C/d$. Stage 1 Lesson 1.8
  established that $\pi$ is irrational; here we use it as a known constant.

---

## The Lesson

### What Is an Angle?

We need a precise definition before we can measure anything.

An **angle** is formed by two rays (called **sides**) sharing a common endpoint
called the **vertex**. The angle records how far you rotate one ray to reach the
other. To make this unambiguous, we agree on a standard setup.

**Standard position:** an angle is in **standard position** when its vertex is
at the origin and its **initial side** lies along the positive $x$-axis. The
**terminal side** is where the rotation ends. Every angle in Stage 2 is in
standard position unless stated otherwise.

**Sign convention:** we measure angles as positive when the rotation is
**counter-clockwise** (CCW) and negative when it is **clockwise** (CW). This
convention matches the orientation of the complex plane from Stage 1 and the
right-hand rule in physics.

Geometrically: imagine standing at the origin, facing right along the positive
$x$-axis. A positive angle rotates you counter-clockwise (toward the positive
$y$-axis). A negative angle rotates you clockwise (toward the negative $y$-axis).

**Coterminal angles:** two angles are **coterminal** if they share the same
terminal side — meaning they differ by one or more complete rotations. Adding or
subtracting any whole number of full turns gives a coterminal angle. In degrees:

$$\theta \text{ and } \theta + 360°k \text{ are coterminal for any integer } k$$

*Example:* $30°$, $390°$, and $-330°$ are all coterminal. Check:
$390° - 360° = 30°$ ✓ and $-330° + 360° = 30°$ ✓.

Coterminal angles are not equal as numbers, but they describe the same
geometric rotation — the terminal side lands in the same place.

---

### Degrees — The Historical Unit

A **degree** is defined as $\frac{1}{360}$ of a full rotation. A full rotation
is 360°, a right angle is 90°, a straight line is 180°.

The number 360 was chosen for divisibility, not mathematics. No geometric reason
forces a full rotation to be 360°. If the Babylonians had chosen 400, we would
work in units of 400-grads (and surveyors briefly tried this — the **gradian**
system divides a right angle into 100 units, giving 400 gradians per full turn).

Degrees are subdivided further for precise angular measurement:
$$1° = 60 \text{ arc-minutes} ('), \qquad 1' = 60 \text{ arc-seconds} ('')$$
$$\therefore 1° = 3600''$$

GPS coordinates use decimal degrees (e.g., $51.5074°$ N) or degrees-minutes-seconds.
One arc-second on Earth's surface corresponds to about 31 metres.

**Worked example — identifying quadrant from degree measure:**

We say an angle is in the **first quadrant** if its terminal side lies in the
region $0° < \theta < 90°$; **second** if $90° < \theta < 180°$; **third**
if $180° < \theta < 270°$; **fourth** if $270° < \theta < 360°$.

Identify the quadrant of $\theta = 250°$.

We compare to the boundaries: $180° < 250° < 270°$. Therefore $250°$ is in the
**third quadrant**. The terminal side lies below the negative $x$-axis.

**Verification:** $250° = 180° + 70°$. Starting from the negative $x$-axis
(180°) and rotating a further 70° counter-clockwise puts us past the $-y$-axis
direction (270°)? No — 70° short of it. So we are between the $-x$ and $-y$
axes, which is the third quadrant. ✓

---

### Radians — The Natural Unit

We need a unit of angle that connects directly to the geometry of the circle,
without arbitrary constants. Here is how to find it.

**The question:** suppose we have a circle of radius $r$ and we rotate by angle
$\theta$ (in some unknown unit). The arc length cut off at the circumference
depends on both $r$ and $\theta$. We want a unit where that relationship is as
clean as possible. The cleanest possible formula would be $s = r\theta$ — arc
length equals radius times angle, no constants. What choice of unit makes this
exact?

**The answer:** define one unit of angle as the angle that cuts off an arc of
length exactly equal to the radius. Then if $\theta$ is measured in that unit,
$s = r\theta$ holds exactly, because $\theta = s/r$ by definition.

This unit is called a **radian**.

**Formal definition:** the angle $\theta$ subtended at the centre of a circle
of radius $r$ by an arc of length $s$ is

$$\theta \text{ (in radians)} = \frac{s}{r}$$

Since $\theta$ is a ratio of two lengths, it is **dimensionless** — radians
are not a physical unit like metres or kilograms, but a dimensionless number.

**Full rotation in radians:** the arc length of a complete circle is the
circumference $s = 2\pi r$. The angle for a full turn is therefore:

$$\theta_{\text{full}} = \frac{s}{r} = \frac{2\pi r}{r} = 2\pi \text{ radians}$$

This is not a choice or a convention. It is a consequence of the definition and
the fact that $C = 2\pi r$.

**Geometric picture of 1 radian:** take any circle and mark a point $P$ on its
circumference. Measure a distance along the arc equal to the radius $r$ and mark
the endpoint $Q$. The central angle $\angle POQ$ is exactly 1 radian. Because
the circumference is $2\pi r$, you would need to lay the radius down $2\pi \approx 6.283$
times to go all the way around — so a full rotation is $2\pi$ radians.

One radian $\approx 57.296°$. It is slightly less than $60°$ — about the angle
in an equilateral triangle — which is a useful geometric anchor.

**Why radians are forced on us by calculus:** the derivative of $\sin x$ is
$\cos x$ only when $x$ is in radians. If $x$ is in degrees, the derivative is
$\frac{\pi}{180}\cos x$. The factor $\pi/180$ would appear in *every* derivative,
*every* integral, *every* Taylor series, and *every* differential equation
involving trig functions. Radians eliminate this constant everywhere it would
otherwise appear.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

# Geometric picture: 1 radian = arc equal to radius
# We show this for a circle of radius r=4
r = 4

fig, ax = plt.subplots(figsize=(7, 6))

# Draw the full circle (light grey)
t_full = np.linspace(0, 2*np.pi, 400)
ax.plot(r*np.cos(t_full), r*np.sin(t_full), color='#ddd', lw=2)

# Draw the arc of length r (1 radian), in red
t_arc = np.linspace(0, 1.0, 200)   # 1.0 radian
ax.plot(r*np.cos(t_arc), r*np.sin(t_arc), color='#e74c3c', lw=4, label=f'Arc = r = {r} (1 radian)')

# Draw the two radii that bound the arc (blue)
ax.plot([0, r], [0, 0], color='#2980b9', lw=3, label=f'Radius r = {r}')
ax.plot([0, r*math.cos(1)], [0, r*math.sin(1)], color='#2980b9', lw=3)

# Show the angle arc
t_angle = np.linspace(0, 1.0, 80)
ax.plot(0.8*np.cos(t_angle), 0.8*np.sin(t_angle), color='#333', lw=1.5)
ax.annotate('1 radian ≈ 57.3°', xy=(0.5, 0.42), fontsize=11, color='#333')
ax.annotate('Arc length = r', xy=(r*math.cos(0.5)+0.2, r*math.sin(0.5)+0.2),
            fontsize=11, color='#e74c3c')

ax.set_aspect('equal')
ax.legend(fontsize=10, loc='upper right')
ax.axis('off')
ax.set_title('Definition of 1 radian: the central angle whose arc equals the radius\n'
             r'$2\pi \approx 6.283$ radii fit around the full circumference', fontsize=10)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `np.linspace(0, 1.0, 200)` generates 200 evenly-spaced values
from 0 to 1 radian, used as parameter $t$ in `r*np.cos(t)` and `r*np.sin(t)`.
This traces the arc from angle 0 to 1 radian on a circle of radius 4. The red
arc and blue radii together show the geometric definition: the arc (red) has
the same length as each radius (blue). The smaller arc drawn at radius 0.8
marks the angle itself. **Connection:** this picture is why all subsequent trig
formulas use radians — the formula $s = r\theta$ holds exactly, with no
multiplicative constant.

---

### Converting Between Degrees and Radians

We have established:
$$360° = 2\pi \text{ rad}$$

Divide both sides by 360:
$$1° = \frac{2\pi}{360} \text{ rad} = \frac{\pi}{180} \text{ rad}$$

Divide both sides of the original equation by $2\pi$:
$$1 \text{ rad} = \frac{360°}{2\pi} = \frac{180°}{\pi}$$

This gives the two conversion formulas:

$$\boxed{\theta_{\text{rad}} = \theta_{\text{deg}} \times \frac{\pi}{180}},
\qquad
\boxed{\theta_{\text{deg}} = \theta_{\text{rad}} \times \frac{180}{\pi}}$$

**Common exact conversions to know without computing:**

| Degrees | Radians (exact) | Why |
|---------|----------------|-----|
| 30° | $\pi/6$ | $30 \times \pi/180 = \pi/6$ |
| 45° | $\pi/4$ | $45 \times \pi/180 = \pi/4$ |
| 60° | $\pi/3$ | $60 \times \pi/180 = \pi/3$ |
| 90° | $\pi/2$ | Quarter turn |
| 120° | $2\pi/3$ | $120 \times \pi/180 = 2\pi/3$ |
| 180° | $\pi$ | Half turn |
| 270° | $3\pi/2$ | Three-quarter turn |
| 360° | $2\pi$ | Full turn |

**Worked example 1 — degrees to radians:**

Convert $210°$ to radians.

We multiply by $\pi/180$:

$$210° \times \frac{\pi}{180} = \frac{210\pi}{180}$$

Now simplify the fraction $210/180$. The GCD of 210 and 180 is 30 (since
$210 = 30 \times 7$ and $180 = 30 \times 6$). Dividing:

$$\frac{210\pi}{180} = \frac{7\pi}{6}$$

So $210° = \frac{7\pi}{6}$ radians. This is $\frac{7}{12}$ of a full turn,
which places the terminal side in the third quadrant (between $\pi$ and $3\pi/2$).
**Verification:** $\frac{7\pi/6}{2\pi} = \frac{7}{12}$, and
$\frac{7}{12} \times 360° = 210°$. ✓

**Worked example 2 — radians to degrees:**

Convert $\frac{5\pi}{4}$ radians to degrees.

We multiply by $180/\pi$. The $\pi$ in the numerator and denominator cancel:

$$\frac{5\pi}{4} \times \frac{180}{\pi} = \frac{5 \times 180}{4} = \frac{900}{4} = 225°$$

The terminal side of $225°$ is in the third quadrant (between $180°$ and $270°$).
**Verification:** $\frac{225}{360} = \frac{5}{8}$ of a full turn, and
$\frac{5}{8} \times 2\pi = \frac{5\pi}{4}$ rad. ✓

**Worked example 3 — non-exact conversion:**

Convert $100°$ to radians (leave as a multiple of $\pi$, then approximate).

$$100° \times \frac{\pi}{180} = \frac{100\pi}{180} = \frac{5\pi}{9} \approx \frac{5 \times 3.14159}{9} \approx 1.745 \text{ rad}$$

**Worked example 4 — find a coterminal angle in $[0°, 360°)$:**

Find the coterminal angle of $\frac{15\pi}{4}$ radians in $[0, 2\pi)$.

Subtract full turns ($2\pi = 8\pi/4$) until the angle is in range:

$$\frac{15\pi}{4} - 2\pi = \frac{15\pi}{4} - \frac{8\pi}{4} = \frac{7\pi}{4}$$

Is $\frac{7\pi}{4}$ in $[0, 2\pi)$? Yes, since $\frac{7\pi}{4} < \frac{8\pi}{4} = 2\pi$. ✓

So $\frac{15\pi}{4}$ is coterminal with $\frac{7\pi}{4}$ (which is $315°$).

**Python:** `math.radians(deg)` computes $\theta \times \pi/180$; `math.degrees(rad)`
computes $\theta \times 180/\pi$. These are the only Python functions this lesson
introduces for conversion.

---

### Arc Length — Derived from the Definition

We now derive the arc length formula, rather than stating it.

We defined the radian by the equation $\theta = s/r$. Multiply both sides by $r$:

$$s = r\theta \qquad (\theta \text{ in radians})$$

This is not a new formula — it is the **definition of radian measure rearranged**.
The arc length subtended by a central angle $\theta$ (in radians) on a circle of
radius $r$ is $r\theta$.

**Physical lens:** this formula is why engineers and physicists use radians. In
rotational motion, the distance traveled by a point on the rim of a wheel of
radius $r$ rotating through angle $\theta$ is $s = r\theta$, giving speed
$v = r\omega$ where $\omega = d\theta/dt$ is the angular velocity in rad/s.
If $\theta$ were in degrees, these formulas would need a factor of $\pi/180$.

**Geometric lens:** $s = r\theta$ says arc length is proportional to the angle
and to the radius simultaneously. Double the radius, double the arc. Double the
angle, double the arc. At $\theta = 2\pi$ (full turn), $s = 2\pi r$ — the
circumference, which is correct.

**Worked example 1 — clock minute hand:**

A clock has a minute hand of length 15 cm. How far does the tip travel in
20 minutes?

*Step 1.* Find the angle swept. Twenty minutes is $\frac{20}{60} = \frac{1}{3}$
of a full hour, which is $\frac{1}{3}$ of a full turn. In radians:

$$\theta = \frac{1}{3} \times 2\pi = \frac{2\pi}{3} \text{ rad}$$

*Step 2.* Apply $s = r\theta$ with $r = 15$ cm and $\theta = 2\pi/3$:

$$s = 15 \times \frac{2\pi}{3} = \frac{30\pi}{3} = 10\pi \text{ cm}$$

*Numerically:* $10\pi \approx 31.4$ cm — about one-third of the circumference
$2\pi \times 15 \approx 94.2$ cm. ✓ (One-third of the full circumference,
as expected for a 20-minute sweep.)

**Worked example 2 — find radius from arc and angle:**

An arc of length 12 cm subtends a central angle of $\frac{3\pi}{4}$ radians
at the centre of a circle. Find the radius.

From $s = r\theta$, we solve for $r$:

$$r = \frac{s}{\theta} = \frac{12}{3\pi/4} = \frac{12 \times 4}{3\pi} = \frac{48}{3\pi} = \frac{16}{\pi}$$

*Numerically:* $16/\pi \approx 5.09$ cm.

*Verification:* $s = r\theta = \frac{16}{\pi} \times \frac{3\pi}{4} = \frac{16 \times 3}{4} = 12$ cm. ✓

**Worked example 3 — find angle from arc and radius:**

On a circle of radius 8 m, an arc has length 6 m. Find the central angle in
radians and in degrees.

$$\theta = \frac{s}{r} = \frac{6}{8} = \frac{3}{4} \text{ rad}$$

In degrees: $\frac{3}{4} \times \frac{180°}{\pi} = \frac{135°}{\pi} \approx 42.97°$.

---

### Sector Area — Derived from Proportionality

A **sector** is the "pie slice" region bounded by two radii and the arc between
them. We want its area.

The full circle has area $\pi r^2$ and corresponds to angle $2\pi$ radians. A
sector with angle $\theta$ is a fraction $\frac{\theta}{2\pi}$ of the full circle:

$$A_{\text{sector}} = \frac{\theta}{2\pi} \cdot \pi r^2 = \frac{\pi r^2 \theta}{2\pi} = \frac{1}{2}r^2\theta$$

$$\boxed{A_{\text{sector}} = \frac{1}{2}r^2\theta \qquad (\theta \text{ in radians})}$$

**Worked example — pizza slice:**

A circular pizza has radius 30 cm. A slice subtends $50°$ at the centre.
Find the area of the slice.

*Step 1.* Convert to radians: $\theta = 50 \times \frac{\pi}{180} = \frac{50\pi}{180} = \frac{5\pi}{18}$ rad.

*Step 2.* Apply the sector area formula:

$$A = \frac{1}{2}(30)^2 \cdot \frac{5\pi}{18} = \frac{1}{2} \cdot 900 \cdot \frac{5\pi}{18} = \frac{900 \times 5\pi}{36} = \frac{4500\pi}{36} = 125\pi \approx 392.7 \text{ cm}^2$$

*Check the fraction:* a 50° slice is $\frac{50}{360} = \frac{5}{36}$ of the
whole pizza. Full pizza area $= \pi \times 900 = 900\pi$. Slice
$= \frac{5}{36} \times 900\pi = 125\pi$. ✓

```python
import math
import numpy as np
import matplotlib.pyplot as plt

# Visualise arc length s = r*theta for several angles on one circle
r = 5
angles_deg = [30, 60, 90, 120, 180]
colors = ['#2980b9', '#27ae60', '#e74c3c', '#e67e22', '#8e44ad']

fig, axes = plt.subplots(1, 2, figsize=(13, 6))

# Left panel: arc lengths
ax = axes[0]
t_full = np.linspace(0, 2*np.pi, 400)
ax.plot(r*np.cos(t_full), r*np.sin(t_full), color='#eee', lw=2)
ax.plot([0, r], [0, 0], color='#bbb', lw=1.5, ls='--')

for deg, col in zip(angles_deg, colors):
    th = math.radians(deg)
    s = r * th
    t = np.linspace(0, th, 120)
    ax.plot(r*np.cos(t), r*np.sin(t), color=col, lw=4)
    mid = th / 2
    ax.annotate(f's = {s:.1f} cm\n({deg}°)',
                xy=((r + 0.7)*math.cos(mid), (r + 0.7)*math.sin(mid)),
                ha='center', fontsize=8.5, color=col)

ax.axhline(0, color='#ccc', lw=1); ax.axvline(0, color='#ccc', lw=1)
ax.set_aspect('equal'); ax.set_xlim(-7, 8); ax.set_ylim(-1, 9)
ax.axis('off')
ax.set_title(f'Arc length $s = r\\theta$ for $r = {r}$ cm\nEach arc subtends the labelled angle', fontsize=10)

# Right panel: sector area for the pizza example
ax = axes[1]
r_pizza = 3   # scaled for display
theta_pizza = math.radians(50)
t_full2 = np.linspace(0, 2*np.pi, 400)
ax.plot(r_pizza*np.cos(t_full2), r_pizza*np.sin(t_full2), color='#ddd', lw=2)

# Shade the sector
t_sector = np.linspace(0, theta_pizza, 120)
xs = [0] + list(r_pizza*np.cos(t_sector)) + [0]
ys = [0] + list(r_pizza*np.sin(t_sector)) + [0]
ax.fill(xs, ys, color='#e74c3c', alpha=0.3)
ax.plot(xs, ys, color='#e74c3c', lw=2)

# Annotate
mid_angle = theta_pizza / 2
ax.annotate(f'50°\n$A = 125\\pi$ cm²', xy=(r_pizza*0.55*math.cos(mid_angle), r_pizza*0.55*math.sin(mid_angle)),
            ha='center', fontsize=10, color='#c0392b')
ax.set_aspect('equal'); ax.axis('off')
ax.set_title('Sector area $A = \\frac{1}{2}r^2\\theta$\nPizza slice: $r=30$ cm, $\\theta=50°$', fontsize=10)

plt.suptitle('Arc length and sector area — both formulas need radians', fontsize=11)
plt.tight_layout(); plt.show()

# Verify the examples numerically
s_clock = 15 * (2*math.pi/3)
print(f"Clock example: s = 15 × 2π/3 = {s_clock:.4f} cm = 10π = {10*math.pi:.4f} ✓")

r_arc = 12 / (3*math.pi/4)
print(f"Arc/radius example: r = 12 / (3π/4) = 16/π = {16/math.pi:.4f} cm")
print(f"  Check: r × 3π/4 = {r_arc * 3*math.pi/4:.4f} cm ✓")

A_pizza = 0.5 * 30**2 * math.radians(50)
print(f"Pizza: A = ½ × 900 × (5π/18) = 125π = {125*math.pi:.4f} = {A_pizza:.4f} ✓")
```

**Walkthrough:** the left panel draws each arc by creating a parameter array
with `np.linspace(0, th, 120)` where `th` is the angle in radians, then
plotting `r*np.cos(t)` and `r*np.sin(t)` — the parametric equations of the
circle. The right panel uses `ax.fill` with a closed polygon (origin, then the
arc points, then back to origin) to shade the pizza sector. The print statements
verify the three worked examples numerically. **Connection:** these are the same
formulas used in signal processing for sweep rates and in mechanical engineering
for gear ratios — the dimensionless ratio $s/r = \theta$ appears in both.

---

### Angular Velocity

We now apply what we have built to rotating systems, where angle changes over
time.

**The problem:** a wheel is spinning. We want to describe both how fast it
rotates (in terms of angle per second) and how fast a point on its rim moves
(in terms of distance per second). How are these related?

**Angular velocity** $\omega$ (omega) is the rate of change of angle with time:

$$\omega = \frac{\Delta\theta}{\Delta t} \qquad [\text{rad/s}]$$

For constant rotation through angle $\theta$ in time $t$: $\theta = \omega t$.

**Connecting to linear speed:** a point on the rim at radius $r$ travels arc
length $s = r\theta$ when the wheel rotates by $\theta$. If this takes time $t$:

$$v = \frac{s}{t} = \frac{r\theta}{t} = r \cdot \frac{\theta}{t} = r\omega$$

$$\boxed{v = r\omega}$$

This formula holds only in radians. If $\omega$ were in degrees per second,
the formula would be $v = r\omega\pi/180$ — an ugly constant. Radians make it
clean.

**RPM to rad/s:** speeds are often given in **revolutions per minute** (rpm).
One revolution is $2\pi$ radians; one minute is 60 seconds:

$$\omega \,[\text{rad/s}] = \text{rpm} \times \frac{2\pi \,\text{rad}}{1 \,\text{rev}} \times \frac{1 \,\text{min}}{60 \,\text{s}} = \text{rpm} \times \frac{\pi}{30}$$

**Worked example 1 — hard drive:**

A hard drive spins at 7200 rpm. Find $\omega$ in rad/s and the linear speed
at the outer edge where $r = 4.5$ cm.

*Step 1.* Convert rpm to rad/s:
$$\omega = 7200 \times \frac{\pi}{30} = 240\pi \approx 754 \text{ rad/s}$$

*Step 2.* Find linear speed. Convert radius: $r = 4.5$ cm $= 0.045$ m:
$$v = r\omega = 0.045 \times 240\pi = 10.8\pi \approx 33.9 \text{ m/s}$$

*Sanity check:* $33.9 \text{ m/s} \approx 122 \text{ km/h}$ — the rim of a hard
drive platter moves at highway speed. ✓

**Worked example 2 — find safe maximum rpm:**

A grinding wheel must not exceed surface speed 30 m/s (beyond which it may
shatter). The radius is $r = 0.15$ m. Find the maximum safe rpm.

From $v = r\omega$:
$$\omega_{\max} = \frac{v_{\max}}{r} = \frac{30}{0.15} = 200 \text{ rad/s}$$

Convert to rpm:
$$\text{rpm} = \omega \times \frac{30}{\pi} = 200 \times \frac{30}{\pi} = \frac{6000}{\pi} \approx 1910 \text{ rpm}$$

**Worked example 3 — Earth's rotation:**

The Earth rotates once every 24 hours. Find $\omega$ and the speed of a
point on the equator ($r_{\text{Earth}} \approx 6371$ km).

$$\omega = \frac{2\pi \text{ rad}}{24 \times 3600 \text{ s}} = \frac{2\pi}{86400} \approx 7.27 \times 10^{-5} \text{ rad/s}$$

$$v = r\omega = 6{,}371{,}000 \text{ m} \times 7.27 \times 10^{-5} \text{ rad/s} \approx 463 \text{ m/s} \approx 1666 \text{ km/h}$$

The equator moves at 1666 km/h due to Earth's rotation. This is why rockets
launch eastward from near the equator — they get this speed for free.

---

## Connect the Pieces

**What this lesson built on:** circle geometry ($C = 2\pi r$, $A = \pi r^2$)
and proportional reasoning. No trigonometry was needed — just the definition
of radian measure and the arc-length formula derived from it.

**What this lesson makes possible:** Lesson 2.2 defines the six trigonometric
functions on the unit circle ($r = 1$) — the angles there are in radians.
Lesson 2.9 graphs $\sin$ and $\cos$: the period $2\pi$ comes from the full
circle in radians. Stage 5 (calculus): the fact that $\frac{d}{dx}\sin x = \cos x$
requires $x$ in radians — the proof uses the limit $\lim_{x\to 0}\sin x/x = 1$,
which holds only in radian measure. Stage 7 (differential equations): angular
frequency $\omega$ in $y'' + \omega^2 y = 0$ is always in rad/s.

**Real-world connection:** every formula in AC electrical engineering uses
$\omega = 2\pi f$ (frequency $f$ in Hz gives $\omega$ in rad/s). A 50 Hz
mains supply has $\omega = 100\pi \approx 314$ rad/s. The voltage is
$V(t) = V_0 \sin(\omega t)$ — $t$ is in seconds, $\omega t$ is in radians.

---

## Summary

**Degree:** $1°$ is $\frac{1}{360}$ of a full rotation.

**Radian:** $\theta = s/r$ — the central angle whose arc equals the radius.
Full rotation $= 2\pi$ rad. One radian $\approx 57.3°$.

**Conversion:**
$$\theta_\text{rad} = \theta_\text{deg} \times \frac{\pi}{180}, \qquad \theta_\text{deg} = \theta_\text{rad} \times \frac{180}{\pi}$$

**Key exact values:** $30° = \pi/6$, $45° = \pi/4$, $60° = \pi/3$,
$90° = \pi/2$, $180° = \pi$, $360° = 2\pi$.

**Arc length (derived from $\theta = s/r$):**
$$s = r\theta \qquad (\theta \text{ in radians})$$

**Sector area (derived by proportionality):**
$$A = \frac{1}{2}r^2\theta \qquad (\theta \text{ in radians})$$

**Angular velocity:**
$$\omega = \frac{\Delta\theta}{\Delta t} \text{ [rad/s]}, \qquad v = r\omega, \qquad \text{rpm} \to \text{rad/s}: \; \omega = \text{rpm} \times \frac{\pi}{30}$$

---

## Problems

### Computation

**1.** Convert to radians (give exact answers as multiples of $\pi$):
(a) 150°, (b) 225°, (c) 315°, (d) 72°, (e) 330°.

<details>
<summary>Answers</summary>

(a) $150 \times \frac{\pi}{180} = \frac{5\pi}{6}$.
(b) $225 \times \frac{\pi}{180} = \frac{5\pi}{4}$.
(c) $315 \times \frac{\pi}{180} = \frac{7\pi}{4}$.
(d) $72 \times \frac{\pi}{180} = \frac{2\pi}{5}$.
(e) $330 \times \frac{\pi}{180} = \frac{11\pi}{6}$.

</details>

---

**2.** Convert to degrees:
(a) $\frac{7\pi}{6}$, (b) $\frac{5\pi}{3}$, (c) $3$ rad, (d) $\frac{\pi}{12}$.

<details>
<summary>Answers</summary>

(a) $\frac{7\pi}{6} \times \frac{180}{\pi} = 210°$.
(b) $\frac{5\pi}{3} \times \frac{180}{\pi} = 300°$.
(c) $3 \times \frac{180}{\pi} = \frac{540}{\pi} \approx 171.9°$.
(d) $\frac{\pi}{12} \times \frac{180}{\pi} = 15°$.

</details>

---

**3.** A circular wheel of radius 0.4 m rotates through $\frac{5\pi}{3}$ rad.
(a) How far does a point on the rim travel?
(b) What fraction of a full turn is this rotation?
(c) If the rotation takes 2 seconds, find $\omega$ and $v$.

<details>
<summary>Answers</summary>

(a) $s = r\theta = 0.4 \times \frac{5\pi}{3} = \frac{2\pi}{3} \approx 2.09$ m.
(b) $\frac{5\pi/3}{2\pi} = \frac{5}{6}$ of a full turn.
(c) $\omega = \frac{5\pi/3}{2} = \frac{5\pi}{6} \approx 2.62$ rad/s;
$v = 0.4 \times \frac{5\pi}{6} = \frac{\pi}{3} \approx 1.05$ m/s.

</details>

---

### Understanding

**4.** A student converts $45°$ to radians and writes $45° \times \frac{180}{\pi} = \frac{8100}{\pi}$.
Identify the error and give the correct answer.

<details>
<summary>Answer</summary>

The student multiplied by $180/\pi$ (the degrees-to-radians conversion is $\pi/180$,
not $180/\pi$ — that is the *radians to degrees* direction).
Correct: $45 \times \frac{\pi}{180} = \frac{\pi}{4}$ rad.

</details>

---

**5.** Explain in one paragraph why the formula $v = r\omega$ requires $\omega$
to be in radians per second, not degrees per second. What factor would appear
if degrees were used?

<details>
<summary>Answer</summary>

The formula $v = r\omega$ is derived from $s = r\theta$ and $v = s/t$:
$v = r\theta/t = r\omega$. But $s = r\theta$ holds only when $\theta$ is in
radians (it is the definition of radian measure). If $\theta$ were in degrees,
we would need $s = r\theta_\text{deg} \times (\pi/180)$, giving
$v = r\omega_\text{deg} \times (\pi/180)$. The factor $\pi/180$ would appear
in every rotational mechanics formula.

</details>

---

### Proof

**6.** Starting from the sector area formula $A = \frac{1}{2}r^2\theta$, prove
that the area can also be written as $A = \frac{1}{2}sr$ where $s$ is the arc
length, and as $A = \frac{s^2}{2\theta}$.

<details>
<summary>Proof</summary>

*Claim 1:* $A = \frac{1}{2}sr$.

From $s = r\theta$ we have $\theta = s/r$. Substitute into $A = \frac{1}{2}r^2\theta$:
$$A = \frac{1}{2}r^2 \cdot \frac{s}{r} = \frac{1}{2}r \cdot s = \frac{1}{2}sr. \quad \square$$

*Claim 2:* $A = \frac{s^2}{2\theta}$.

From Claim 1, $A = \frac{1}{2}sr$. And from $s = r\theta$, $r = s/\theta$. Substituting:
$$A = \frac{1}{2}s \cdot \frac{s}{\theta} = \frac{s^2}{2\theta}. \quad \square$$

</details>

---

### Extension

**★ 7.** A sector has fixed perimeter $P$ (two radii plus the arc). Show that
the area of the sector is maximised when $\theta = 2$ radians, and find the
maximum area in terms of $P$.

*(Hint: write $r$ in terms of $P$ and $\theta$ using the perimeter constraint
$P = 2r + r\theta = r(2 + \theta)$, substitute into $A = \frac{1}{2}r^2\theta$,
then maximise over $\theta > 0$.)*

**★ 8.** Prove that the arc length formula $s = r\theta$ is consistent with
the circumference formula $C = 2\pi r$ — that is, show that substituting $\theta = 2\pi$
(one full turn) gives the correct circumference. Then use the same approach to
derive the area of a full circle $A = \pi r^2$ from the sector area formula.

---

### Code Challenges

**Challenge 1 — Angle conversion and normalisation**

```python
import math

def deg_to_rad(degrees):
    """Convert degrees to radians. Do NOT use math.radians internally."""
    pass

def rad_to_deg(radians):
    """Convert radians to degrees. Do NOT use math.degrees internally."""
    pass

def normalize_deg(theta):
    """Return the coterminal angle of theta (degrees) in [0, 360)."""
    pass

def normalize_rad(theta):
    """Return the coterminal angle of theta (radians) in [0, 2*pi)."""
    pass

def are_coterminal_deg(a, b, tol=1e-10):
    """Return True if a and b (degrees) are coterminal angles."""
    pass


# --- tests: do not modify ---
assert abs(deg_to_rad(180) - math.pi)       < 1e-12
assert abs(deg_to_rad(90)  - math.pi/2)     < 1e-12
assert abs(deg_to_rad(0)   - 0)             < 1e-15
assert abs(rad_to_deg(math.pi)   - 180)     < 1e-10
assert abs(rad_to_deg(math.pi/3) - 60)      < 1e-10
for d in [30, 45, 60, 90, 120, 180, 210, 270, 315]:
    assert abs(rad_to_deg(deg_to_rad(d)) - d) < 1e-10, f"Round-trip failed at {d}°"
assert abs(normalize_deg(370)  - 10)         < 1e-10
assert abs(normalize_deg(-30)  - 330)        < 1e-10
assert abs(normalize_deg(720)  - 0)          < 1e-10
assert abs(normalize_rad(3*math.pi) - math.pi) < 1e-10
assert abs(normalize_rad(-math.pi/2) - 3*math.pi/2) < 1e-10
assert are_coterminal_deg(30, 390)  == True
assert are_coterminal_deg(30, 60)   == False
assert are_coterminal_deg(0, 360)   == True
assert are_coterminal_deg(45, -315) == True
print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

`deg_to_rad`: `return degrees * math.pi / 180`.
`rad_to_deg`: `return radians * 180 / math.pi`.
`normalize_deg`: `return theta % 360`.
`normalize_rad`: `return theta % (2 * math.pi)`.
`are_coterminal_deg`: `return abs(normalize_deg(a) - normalize_deg(b)) < tol`.

</details>

---

**Challenge 2 — Arc length, sector area, and angular velocity**

```python
import math

def arc_length(r, theta_rad):
    """Return arc length s = r*theta. Raise ValueError if theta_rad < 0."""
    pass

def sector_area(r, theta_rad):
    """Return sector area = (1/2)*r^2*theta. Raise ValueError if theta_rad < 0."""
    pass

def rpm_to_omega(rpm):
    """Convert rpm to angular velocity in rad/s."""
    pass

def rim_speed(r_m, rpm):
    """Tangential speed v = r*omega (r in metres, rpm in rev/min)."""
    pass

def max_safe_rpm(r_m, max_speed_ms):
    """Find maximum rpm given radius (m) and maximum allowable surface speed (m/s)."""
    pass


# --- tests: do not modify ---
assert abs(arc_length(1, math.pi) - math.pi) < 1e-12
assert abs(arc_length(15, 2*math.pi/3) - 10*math.pi) < 1e-10   # clock example
assert abs(arc_length(16/math.pi, 3*math.pi/4) - 12) < 1e-10   # arc/radius example
try:
    arc_length(5, -1)
    assert False, "Should raise ValueError"
except ValueError:
    pass
assert abs(sector_area(1, 2*math.pi) - math.pi) < 1e-10         # full circle = pi*r^2
assert abs(sector_area(30, math.radians(50)) - 125*math.pi) < 1e-8  # pizza example
assert abs(rpm_to_omega(60) - 2*math.pi) < 1e-10                # 60 rpm = 2pi rad/s
assert abs(rpm_to_omega(0) - 0) < 1e-15
assert abs(rim_speed(0.045, 7200) - 0.045*240*math.pi) < 1e-8   # hard drive
expected_rpm = 6000/math.pi
assert abs(max_safe_rpm(0.15, 30) - expected_rpm) < 1e-8         # grinder example
print("✓ Challenge 2 passed!")
print(f"  Hard drive rim speed: {rim_speed(0.045, 7200):.2f} m/s")
print(f"  Grinder max rpm: {max_safe_rpm(0.15, 30):.1f}")
```

<details>
<summary>Hint</summary>

`arc_length`: validate `theta_rad >= 0`; return `r * theta_rad`.
`sector_area`: validate; return `0.5 * r**2 * theta_rad`.
`rpm_to_omega`: `return rpm * math.pi / 30`.
`rim_speed`: `return r_m * rpm_to_omega(rpm)`.
`max_safe_rpm`: from $v = r\omega$ and $\omega = \text{rpm}\times\pi/30$: $\text{rpm} = v/(r \times \pi/30) = 30v/(\pi r)$.

</details>

---

**Challenge 3 — Angle visualiser**

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def draw_standard_angle(ax, theta_deg, r=1.0, color='#2980b9'):
    """
    Draw an angle in standard position on axis ax:
    - Initial side: from origin along positive x-axis to radius r
    - Terminal side: from origin to (r cos θ, r sin θ)
    - Arc: from 0 to theta_deg (CCW if positive, CW if negative)
    - Label with degrees and radians
    Assumes ax already has the unit circle drawn.
    """
    pass

def quadrant_of(theta_deg):
    """
    Quadrant of the angle (normalise to [0,360) first).
    Return 1, 2, 3, or 4. Return 0 if on an axis boundary (0, 90, 180, 270).
    """
    pass


# --- tests: do not modify ---
assert quadrant_of(45)   == 1
assert quadrant_of(135)  == 2
assert quadrant_of(225)  == 3
assert quadrant_of(315)  == 4
assert quadrant_of(0)    == 0
assert quadrant_of(90)   == 0
assert quadrant_of(400)  == 1    # 400 - 360 = 40 → Q1
assert quadrant_of(-60)  == 4    # -60 + 360 = 300 → Q4

fig, axes = plt.subplots(1, 4, figsize=(16, 4))
for ax, (deg, col) in zip(axes, [(45,'#2980b9'), (135,'#e74c3c'), (240,'#27ae60'), (-60,'#e67e22')]):
    t = np.linspace(0, 2*np.pi, 300)
    ax.plot(np.cos(t), np.sin(t), color='#ddd', lw=2)
    ax.axhline(0, color='#aaa', lw=1); ax.axvline(0, color='#aaa', lw=1)
    ax.set_aspect('equal'); ax.set_xlim(-1.5, 1.5); ax.set_ylim(-1.5, 1.5)
    ax.axis('off')
    draw_standard_angle(ax, deg, color=col)
    q = quadrant_of(deg)
    ax.set_title(f'{deg}° — {"Q"+str(q) if q else "boundary"}')

plt.suptitle('Standard position angles: CCW = positive, CW = negative')
plt.tight_layout(); plt.show()
print("✓ Challenge 3 passed!")
```

<details>
<summary>Hint</summary>

`draw_standard_angle`: compute `theta_rad = math.radians(theta_deg)`.
Initial side: `ax.plot([0, r], [0, 0], color=color, lw=2)`.
Terminal: `ax.plot([0, r*math.cos(theta_rad)], [0, r*math.sin(theta_rad)], color=color, lw=2)`.
Arc: `t = np.linspace(0, theta_rad, 100)`; `ax.plot(0.4*np.cos(t), 0.4*np.sin(t), color=color)`.
`quadrant_of`: `n = theta_deg % 360`; boundary if `n % 90 == 0`; else `int(n // 90) + 1`.

</details>
