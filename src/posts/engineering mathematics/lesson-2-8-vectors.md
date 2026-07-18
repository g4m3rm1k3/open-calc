# Stage 2, Lesson 2.8 — Vectors, Bearings, and Forces
**Threads:** Math · Physics · Engineering  
**Estimated time:** 65–75 minutes

---

## What This Lesson Is About

Trigonometry becomes most powerful when applied to quantities that have
both magnitude and direction — **vectors**. Force, velocity, displacement,
and acceleration are all vectors. So are the joint torques in a robot
arm, the cutting force components in a milling operation, and the GPS
displacement from one waypoint to the next. This lesson introduces
2D vectors through a trigonometric lens: decomposing a vector into
horizontal and vertical components using $\cos$ and $\sin$, adding
vectors by summing components, finding the angle between two vectors
with the dot product, and solving navigation and force problems using
these tools. The connection to the Law of Cosines appears naturally —
the magnitude of a resultant force is exactly the Law of Cosines applied
to the force triangle. By the end of this lesson you can resolve any
2D vector into components, add multiple vectors, find angles between
vectors, and apply these tools to navigation, statics, and machining
force analysis.

---

## Historical Context

The geometric treatment of forces as arrows was used by Simon Stevin
(1586) and Galileo. The word "vector" (from Latin *vehere*, to carry)
was introduced by Hamilton in 1846, the same Hamilton who invented
quaternions. The systematic component decomposition — using sine and
cosine to find horizontal and vertical parts — became standard in the
18th century with the formalisation of Newtonian mechanics. Compass
bearings, measured clockwise from North, are a navigation convention
dating to the 13th century with the magnetic compass. The two conventions
(mathematical angles CCW from East; compass bearings CW from North)
require a conversion whenever the two worlds meet in code — a source
of many real navigation errors.

---

## What You Need To Know First

- **Sine and cosine** — Lessons 2.1–2.2.
- **$\arctan 2$** — Lesson 2.4. Converting components back to angle.
- **Law of Cosines** — Lesson 2.7. Appears in the force triangle.
- **Pythagorean theorem** — for vector magnitudes.

---

## The Lesson

### Vectors: Magnitude and Direction

A **2D vector** $\mathbf{v}$ is fully described by:
- Its **magnitude** $|\mathbf{v}|$ (a non-negative scalar)
- Its **direction** $\theta$ (an angle)

Or equivalently, by its **components**:

$$\mathbf{v} = \langle v_x,\ v_y \rangle = \langle |\mathbf{v}|\cos\theta,\ |\mathbf{v}|\sin\theta \rangle$$

**Converting magnitude + angle → components:**

$$v_x = |\mathbf{v}|\cos\theta \qquad v_y = |\mathbf{v}|\sin\theta$$

**Converting components → magnitude + angle:**

$$|\mathbf{v}| = \sqrt{v_x^2 + v_y^2} \qquad \theta = \text{atan2}(v_y, v_x)$$

The angle $\theta$ here is the mathematical angle — measured
counterclockwise from the positive $x$-axis.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def mag_angle_to_components(magnitude, angle_deg):
    """Convert (magnitude, angle in degrees) to (vx, vy)."""
    angle = math.radians(angle_deg)
    return magnitude * math.cos(angle), magnitude * math.sin(angle)

def components_to_mag_angle(vx, vy):
    """Convert (vx, vy) to (magnitude, angle_degrees)."""
    mag   = math.sqrt(vx**2 + vy**2)
    angle = math.degrees(math.atan2(vy, vx))   # atan2(y, x) — y first
    return mag, angle

print("Component decomposition:\n")
print(f"{'|v|':>6}  {'θ (°)':>8}  {'vx':>10}  {'vy':>10}  {'|v| check':>12}")
print("-" * 56)

vectors = [(10, 30), (15, 45), (20, 60), (8, 120), (12, 210), (5, 315)]
for mag, angle_deg in vectors:
    vx, vy = mag_angle_to_components(mag, angle_deg)
    mag_check, _ = components_to_mag_angle(vx, vy)
    print(f"{mag:>6}  {angle_deg:>8}°  {vx:>10.4f}  {vy:>10.4f}  {mag_check:>12.6f}")

print()
# Visualise several vectors
fig, ax = plt.subplots(figsize=(8, 8))

colors = ['#2980b9','#e74c3c','#27ae60','#8e44ad','#e67e22']
for (mag, angle_deg), color in zip(vectors[:4], colors):
    vx, vy = mag_angle_to_components(mag, angle_deg)
    ax.annotate('', xy=(vx, vy), xytext=(0, 0),
                arrowprops=dict(arrowstyle='->', color=color, lw=2.5))
    # Label each vector
    ax.text(vx*0.55, vy*0.55 + 0.3,
            f'$|v|={mag}$, $\\theta={angle_deg}°$',
            fontsize=9, color=color)
    # Show component lines (dashed)
    ax.plot([0, vx], [0, 0], color=color, lw=1, linestyle='--', alpha=0.5)
    ax.plot([vx, vx], [0, vy], color=color, lw=1, linestyle='--', alpha=0.5)

ax.axhline(0, color='#333', lw=0.8); ax.axvline(0, color='#333', lw=0.8)
ax.set_aspect('equal')
ax.set_xlim(-12, 22); ax.set_ylim(-6, 22)
ax.set_xlabel('$v_x$'); ax.set_ylabel('$v_y$')
ax.set_title('Vectors and their components\n$v_x = |v|\\cos\\theta$,  $v_y = |v|\\sin\\theta$',
             fontsize=11)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** Each vector is drawn using `ax.annotate('', xy=tip, xytext=tail, arrowprops=...)` — the same arrow-only annotation from Lesson 0.8. The dashed component lines use `ax.plot([0, vx], [0, 0])` for the horizontal component and `ax.plot([vx, vx], [0, vy])` for the vertical, together forming the right triangle that defines the components.

---

### Vector Addition

Adding two vectors $\mathbf{a}$ and $\mathbf{b}$: add components.

$$\mathbf{a} + \mathbf{b} = \langle a_x + b_x,\ a_y + b_y \rangle$$

**Geometric interpretation:** place the tail of $\mathbf{b}$ at the
tip of $\mathbf{a}$. The resultant $\mathbf{a}+\mathbf{b}$ goes from
the tail of $\mathbf{a}$ to the tip of $\mathbf{b}$.

**Connection to the Law of Cosines:** if $\mathbf{a}$ and $\mathbf{b}$
make an angle $\phi$ between them, then:

$$|\mathbf{a}+\mathbf{b}|^2 = |\mathbf{a}|^2 + |\mathbf{b}|^2 + 2|\mathbf{a}||\mathbf{b}|\cos\phi$$

When $\phi = 180°$ (opposite directions): $|\mathbf{a}+\mathbf{b}| = ||\mathbf{a}|-|\mathbf{b}||$.
When $\phi = 90°$: $|\mathbf{a}+\mathbf{b}|^2 = |\mathbf{a}|^2 + |\mathbf{b}|^2$ — Pythagoras.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def add_vectors(*vectors_mag_angle):
    """
    Add any number of vectors given as (magnitude, angle_deg) pairs.
    Returns (resultant_magnitude, resultant_angle_deg, components_list).
    """
    total_x, total_y = 0.0, 0.0
    components = []
    for mag, angle_deg in vectors_mag_angle:
        vx = mag * math.cos(math.radians(angle_deg))
        vy = mag * math.sin(math.radians(angle_deg))
        components.append((vx, vy))
        total_x += vx
        total_y += vy
    resultant_mag = math.sqrt(total_x**2 + total_y**2)
    resultant_angle = math.degrees(math.atan2(total_y, total_x))
    return resultant_mag, resultant_angle, components

# Example: three forces on a structural node
forces = [(50, 0), (30, 90), (20, 150)]
R_mag, R_angle, comps = add_vectors(*forces)

print("Vector addition example: 3 forces on a node\n")
print(f"{'Force':>8}  {'Angle':>8}  {'Fx':>10}  {'Fy':>10}")
print("-" * 44)
for i, ((mag, ang), (fx, fy)) in enumerate(zip(forces, comps), 1):
    print(f"  F{i}={mag:3d}N  {ang:>7}°  {fx:>10.4f}  {fy:>10.4f}")
print("-" * 44)
total_fx = sum(c[0] for c in comps)
total_fy = sum(c[1] for c in comps)
print(f"{'Sum':>9}         {total_fx:>10.4f}  {total_fy:>10.4f}")
print(f"\nResultant: |R|={R_mag:.4f}N at {R_angle:.2f}°")

# Visualise vector addition as tip-to-tail
fig, ax = plt.subplots(figsize=(9, 7))
colors = ['#2980b9','#e74c3c','#27ae60']
labels = ['$F_1=50$N','$F_2=30$N','$F_3=20$N']

cur_x, cur_y = 0.0, 0.0
for (fx, fy), color, label in zip(comps, colors, labels):
    ax.annotate('', xy=(cur_x+fx, cur_y+fy), xytext=(cur_x, cur_y),
                arrowprops=dict(arrowstyle='->', color=color, lw=2.5))
    ax.text(cur_x+fx*0.5, cur_y+fy*0.5+0.5, label, color=color, fontsize=9)
    cur_x += fx; cur_y += fy

# Resultant from origin
ax.annotate('', xy=(total_fx, total_fy), xytext=(0, 0),
            arrowprops=dict(arrowstyle='->', color='black', lw=3,
                            linestyle='dashed'))
ax.text(total_fx*0.5-3, total_fy*0.5,
        f'$R={R_mag:.1f}$N\n$\\theta={R_angle:.1f}°$',
        fontsize=10, color='black', fontweight='bold')

ax.axhline(0, color='#333', lw=0.8); ax.axvline(0, color='#333', lw=0.8)
ax.set_aspect('equal')
ax.set_title('Vector addition (tip-to-tail)\nBlack dashed = resultant', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `add_vectors(*forces)` uses `*forces` to **unpack**
the list into individual arguments — `*iterable` in a function call
expands it in-place, so `add_vectors(*[(50,0),(30,90)])` is equivalent
to `add_vectors((50,0), (30,90))`. The `for (mag, ang), (fx, fy) in zip(...):`
uses **nested unpacking** — Python simultaneously unpacks each element of
the outer list into `(mag, ang)` and each component pair into `(fx, fy)`.

---

### The Dot Product

The **dot product** of two vectors $\mathbf{a} = \langle a_x, a_y \rangle$
and $\mathbf{b} = \langle b_x, b_y \rangle$:

$$\mathbf{a} \cdot \mathbf{b} = a_x b_x + a_y b_y$$

**Geometric form:** the dot product is related to the angle $\theta$
between the vectors:

$$\mathbf{a} \cdot \mathbf{b} = |\mathbf{a}||\mathbf{b}|\cos\theta$$

Solving for $\theta$:

$$\theta = \arccos\!\left(\frac{\mathbf{a}\cdot\mathbf{b}}{|\mathbf{a}||\mathbf{b}|}\right)$$

**Key properties:**
- If $\mathbf{a}\cdot\mathbf{b} = 0$: the vectors are **perpendicular**
- If $\mathbf{a}\cdot\mathbf{b} > 0$: angle is acute ($\theta < 90°$)
- If $\mathbf{a}\cdot\mathbf{b} < 0$: angle is obtuse ($\theta > 90°$)

**This is the Law of Cosines in disguise.** From the Law of Cosines:
$|\mathbf{a}-\mathbf{b}|^2 = |\mathbf{a}|^2 + |\mathbf{b}|^2 - 2|\mathbf{a}||\mathbf{b}|\cos\theta$.
But also $|\mathbf{a}-\mathbf{b}|^2 = (a_x-b_x)^2+(a_y-b_y)^2 = |\mathbf{a}|^2+|\mathbf{b}|^2 - 2(a_xb_x+a_yb_y)$.
Matching: $a_xb_x+a_yb_y = |\mathbf{a}||\mathbf{b}|\cos\theta$.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def dot_product(a, b):
    """Dot product of 2D vectors a=(ax,ay) and b=(bx,by)."""
    return a[0]*b[0] + a[1]*b[1]

def vector_magnitude(v):
    return math.sqrt(v[0]**2 + v[1]**2)

def angle_between(a, b):
    """Angle between vectors a and b in degrees."""
    cos_theta = dot_product(a, b) / (vector_magnitude(a) * vector_magnitude(b))
    cos_theta = max(-1, min(1, cos_theta))   # clamp for safety
    return math.degrees(math.acos(cos_theta))

print("Dot product and angles between vectors:\n")
print(f"{'a':>12}  {'b':>12}  {'a·b':>8}  {'angle':>10}")
print("-" * 50)

pairs = [((3,4),(5,0)), ((1,1),(1,-1)), ((2,3),(-3,2)),
         ((10,0),(7,7)), ((1,0),(-1,0))]
for a, b in pairs:
    dp    = dot_product(a, b)
    angle = angle_between(a, b)
    print(f"  {str(a):>10}  {str(b):>10}  {dp:>8}  {angle:>9.2f}°")

# Machining application: tool force and cutting direction
print()
print("Machining: angle between cutting force and feed direction")
feed_dir   = (1, 0)          # feeding in +x direction
cut_force  = (180, 85)       # cutting force vector (N): Fx=180, Fy=85
angle      = angle_between(feed_dir, cut_force)
efficiency = dot_product(feed_dir, cut_force) / vector_magnitude(cut_force)
print(f"  Feed direction: {feed_dir}")
print(f"  Cutting force:  {cut_force} N, |F|={vector_magnitude(cut_force):.2f} N")
print(f"  Angle between:  {angle:.2f}°")
print(f"  Force component along feed: {efficiency*vector_magnitude(cut_force):.2f} N")
```

---

### Navigation: Compass Bearings

In navigation, **compass bearings** are measured **clockwise from North**.
This is the opposite of the mathematical convention (counterclockwise
from East). The conversion:

$$\text{math angle} = 90° - \text{bearing}$$

or equivalently:

$$v_x = d\sin(\text{bearing}) \qquad v_y = d\cos(\text{bearing})$$

(Note: $\sin$ for $x$, $\cos$ for $y$ — the reverse of the normal
convention, because North is the $y$-axis and bearings go clockwise.)

**Hand-worked example:** A ship sails 40 km on a bearing of N30°E,
then 25 km on a bearing of S50°E. Find the total displacement.

**Leg 1** — N30°E means 30° clockwise from North:
$$x_1 = 40\sin(30°) = 20\ \text{km} \qquad y_1 = 40\cos(30°) \approx 34.64\ \text{km}$$

**Leg 2** — S50°E means a bearing of $180° - 50° = 130°$ from North:
$$x_2 = 25\sin(130°) \approx 19.15\ \text{km} \qquad y_2 = 25\cos(130°) \approx -16.07\ \text{km}$$

**Total displacement:**
$$x = 39.15\ \text{km}, \quad y = 18.57\ \text{km}$$

$$d = \sqrt{39.15^2 + 18.57^2} \approx 43.33\ \text{km}$$

Bearing back to starting point: $\theta_\text{math} = \arctan(18.57/39.15) \approx 25.4°$ from East $= 90° - 25.4° = 64.6°$ from North, so bearing N64.6°E.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def bearing_displacement(distance, bearing_deg):
    """
    Convert distance and compass bearing (CW from North)
    to (east, north) displacement components.
    East = x-axis, North = y-axis.
    """
    bearing = math.radians(bearing_deg)
    east  = distance * math.sin(bearing)   # sin for east (x)
    north = distance * math.cos(bearing)   # cos for north (y)
    return east, north

def components_to_bearing(east, north):
    """Convert (east, north) to (distance, compass bearing in degrees)."""
    dist    = math.sqrt(east**2 + north**2)
    bearing = math.degrees(math.atan2(east, north))   # atan2(E, N) for bearing
    if bearing < 0:
        bearing += 360   # ensure [0, 360)
    return dist, bearing

# Multi-leg voyage
legs = [(40, 30), (25, 130), (35, 200)]   # (km, bearing_degrees)

print("Navigation: multi-leg voyage\n")
print(f"{'Leg':>5}  {'Dist':>8}  {'Bearing':>10}  {'East':>10}  {'North':>10}")
print("-" * 50)

total_east, total_north = 0.0, 0.0
positions = [(0.0, 0.0)]

for i, (d, b) in enumerate(legs, 1):
    e, n = bearing_displacement(d, b)
    total_east  += e
    total_north += n
    positions.append((total_east, total_north))
    print(f"  Leg {i}  {d:>6}km  {b:>9}°  {e:>10.3f}  {n:>10.3f}")

print("-" * 50)
total_dist, total_bearing = components_to_bearing(total_east, total_north)
print(f"  Total         {total_dist:>6.3f}km  {total_bearing:>9.2f}°  "
      f"{total_east:>10.3f}  {total_north:>10.3f}")

# Plot the voyage
fig, ax = plt.subplots(figsize=(8, 8))
pos = np.array(positions)

# Draw legs
for i in range(len(positions)-1):
    ax.annotate('', xy=positions[i+1], xytext=positions[i],
                arrowprops=dict(arrowstyle='->', color='#2980b9', lw=2.5))
    mid = ((positions[i][0]+positions[i+1][0])/2,
           (positions[i][1]+positions[i+1][1])/2)
    ax.text(mid[0]+0.5, mid[1]+0.5, f'Leg {i+1}\n{legs[i][0]}km',
            fontsize=8, color='#2980b9')

# Draw resultant
ax.annotate('', xy=(total_east, total_north), xytext=(0, 0),
            arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=3,
                            linestyle='dashed'))
ax.text(total_east*0.5-2, total_north*0.5,
        f'Resultant\n{total_dist:.1f}km\nbearing {total_bearing:.1f}°',
        fontsize=9, color='#e74c3c', fontweight='bold')

# Mark positions
for i, (e, n) in enumerate(positions):
    ax.plot(e, n, 'ko', markersize=8, zorder=5)
    ax.text(e+0.5, n+0.5, f'P{i}', fontsize=9)

# Compass rose
ax.annotate('N', xy=(0, 1), xytext=(0, 0),
            xycoords=('data','axes fraction'),
            textcoords=('data','axes fraction'),
            fontsize=12, fontweight='bold', ha='center')

ax.axhline(0, color='#333', lw=0.8); ax.axvline(0, color='#333', lw=0.8)
ax.set_xlabel('East (km)'); ax.set_ylabel('North (km)')
ax.set_title('Navigation: multi-leg voyage\nEast = x-axis, North = y-axis', fontsize=11)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `bearing_displacement` uses $\sin$ for the east
component and $\cos$ for the north component — the reverse of the
standard $(\cos, \sin)$ for $(x, y)$ because bearings are measured
from North (the $y$-axis) clockwise. `components_to_bearing` uses
`math.atan2(east, north)` — note the argument order is `(east, north)`
not `(north, east)`, because we want the angle from the North axis
toward East, which is `atan2(opposite=East, adjacent=North)`.

---

### CNC Application: Machining Force Analysis

In milling, two primary cutting forces act on the tool:
- **Tangential force** $F_t$ — tangential to the tool rotation
- **Radial force** $F_r$ — perpendicular to $F_t$, directed toward the tool centre

The resultant and its components in the feed direction determine spindle
power, tool deflection, and part accuracy.

```python
import math
import matplotlib.pyplot as plt
import numpy as np

def cutting_forces(Ft, Fr, engagement_angle_deg):
    """
    Compute feed-direction and cross-feed force components.

    Ft: tangential force (N)
    Fr: radial force (N)
    engagement_angle_deg: tool-workpiece engagement angle from feed direction
    """
    phi = math.radians(engagement_angle_deg)
    # Project onto feed (x) and cross-feed (y) axes
    Fx = Ft * math.cos(phi) - Fr * math.sin(phi)
    Fy = Ft * math.sin(phi) + Fr * math.cos(phi)
    return Fx, Fy

print("Milling force analysis:\n")
print(f"{'Engagement°':>12}  {'Fx (feed)':>12}  {'Fy (cross)':>12}  {'|F|':>10}")
print("-" * 52)
Ft, Fr = 200, 80   # N
for phi_deg in range(0, 91, 15):
    Fx, Fy = cutting_forces(Ft, Fr, phi_deg)
    F_mag  = math.sqrt(Fx**2 + Fy**2)
    print(f"{phi_deg:>12}°  {Fx:>12.2f}  {Fy:>12.2f}  {F_mag:>10.2f}")

# Visualise at one engagement angle
phi_deg = 45
Fx, Fy = cutting_forces(Ft, Fr, phi_deg)
phi = math.radians(phi_deg)

fig, ax = plt.subplots(figsize=(8, 7))

# Tool circle
theta = np.linspace(0, 2*np.pi, 200)
R = 50   # mm tool radius (visual only)
ax.plot(R*np.cos(theta), R*np.sin(theta), color='#cccccc', lw=1, linestyle='--')

# Force vectors from tool centre
scale = 0.25   # scale forces for display
ax.annotate('', xy=(Ft*scale*math.cos(phi+math.pi/2),
                     Ft*scale*math.sin(phi+math.pi/2)),
            xytext=(0, 0),
            arrowprops=dict(arrowstyle='->', color='#2980b9', lw=2.5))
ax.text(Ft*scale*math.cos(phi+math.pi/2)*1.1,
        Ft*scale*math.sin(phi+math.pi/2)*1.1+3,
        f'$F_t={Ft}$N', color='#2980b9', fontsize=10)

ax.annotate('', xy=(-Fr*scale*math.cos(phi),
                     -Fr*scale*math.sin(phi)),
            xytext=(0, 0),
            arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=2.5))
ax.text(-Fr*scale*math.cos(phi)*1.2-15,
        -Fr*scale*math.sin(phi)*1.2,
        f'$F_r={Fr}$N', color='#e74c3c', fontsize=10)

# Resultant
ax.annotate('', xy=(Fx*scale, Fy*scale), xytext=(0, 0),
            arrowprops=dict(arrowstyle='->', color='#27ae60', lw=3))
ax.text(Fx*scale*1.1, Fy*scale*1.1+3,
        f'$F_{{result}}$\n={math.sqrt(Fx**2+Fy**2):.1f}N',
        color='#27ae60', fontsize=9, fontweight='bold')

ax.axhline(0, color='#333', lw=0.8); ax.axvline(0, color='#333', lw=0.8)
ax.set_aspect('equal')
ax.set_xlim(-80, 80); ax.set_ylim(-80, 80)
ax.set_title(f'Milling force components at {phi_deg}° engagement\n'
             f'Feed direction = +x axis', fontsize=11)
ax.set_xlabel('Feed direction (x)'); ax.set_ylabel('Cross-feed (y)')
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

---

## Connect the Pieces

**What this lesson built on:** Sine and cosine (Lessons 2.1–2.2) for
component decomposition. `atan2` (Lesson 2.4) for converting back to
angle. The Law of Cosines (Lesson 2.7) — the formula for resultant
magnitude is the Law of Cosines applied to the force/vector triangle.

**What this lesson makes possible:** Stage 4 (Linear Algebra) —
vectors are generalised to $n$ dimensions, the dot product extended,
and the angle formula generalised. The dot product formula
$\mathbf{a}\cdot\mathbf{b}=|\mathbf{a}||\mathbf{b}|\cos\theta$ is
the geometric foundation of the entire linear algebra chapter.
Stage 5 (Calculus) — velocity and acceleration are vector quantities;
work is a dot product. Stage 7 (Physics) — all of statics and dynamics
uses vector addition and decomposition.

---

## Summary

**Components:** $v_x = |v|\cos\theta$, $v_y = |v|\sin\theta$.

**Magnitude/angle from components:** $|v|=\sqrt{v_x^2+v_y^2}$,
$\theta=\text{atan2}(v_y, v_x)$.

**Vector addition:** add components separately.

**Dot product:** $\mathbf{a}\cdot\mathbf{b} = a_xb_x+a_yb_y = |\mathbf{a}||\mathbf{b}|\cos\theta$.

**Angle between vectors:**
$\theta = \arccos\!\left(\dfrac{\mathbf{a}\cdot\mathbf{b}}{|\mathbf{a}||\mathbf{b}|}\right)$.

**Compass bearings:** CW from North. East component $= d\sin(\text{bearing})$,
North component $= d\cos(\text{bearing})$.

**New Python:**
- `*iterable` in a function call — unpack a list into arguments
- Nested tuple unpacking in `for (a, b), (c, d) in zip(...)`
- `math.atan2(east, north)` — angle from North axis (bearing convention)

---

## Problems

### Math

**1.** Find the resultant of the two forces and its direction.

(a) $F_1 = 40$N at $20°$, $F_2 = 60$N at $80°$

(b) $F_1 = 100$N due East, $F_2 = 75$N due North

<details>
<summary>Answers</summary>

(a) $F_{1x}=40\cos20°=37.59$, $F_{1y}=40\sin20°=13.68$.
$F_{2x}=60\cos80°=10.42$, $F_{2y}=60\sin80°=59.09$.
$R_x=48.01$, $R_y=72.77$. $|R|=\sqrt{48.01^2+72.77^2}=87.24$N.
$\theta=\arctan(72.77/48.01)=56.6°$.

(b) $R_x=100$, $R_y=75$. $|R|=\sqrt{10000+5625}=125$N.
$\theta=\arctan(75/100)=36.87°$ from East.

</details>

---

**2.** An aircraft flies 200 km on a bearing of 310°, then 150 km on a
bearing of 40°. Find the distance and bearing back to the start.

<details>
<summary>Answer</summary>

Leg 1: $E_1=200\sin(310°)=-153.21$km, $N_1=200\cos(310°)=128.56$km.
Leg 2: $E_2=150\sin(40°)=96.42$km, $N_2=150\cos(40°)=114.91$km.
Total: $E=-56.79$km, $N=243.47$km.
Distance $=\sqrt{56.79^2+243.47^2}=250.00$km.
Bearing $=\arctan(-56.79/243.47)$ from North $= -13.1°$ → bearing $346.9°$ (N13.1°W).

</details>

---

**3.** Find the angle between the vectors $\mathbf{a} = \langle 3, -1 \rangle$
and $\mathbf{b} = \langle 2, 5 \rangle$.

<details>
<summary>Answer</summary>

$\mathbf{a}\cdot\mathbf{b} = 6-5=1$. $|\mathbf{a}|=\sqrt{10}$, $|\mathbf{b}|=\sqrt{29}$.
$\cos\theta=1/\sqrt{290}$. $\theta=\arccos(1/\sqrt{290})\approx86.6°$.

</details>

---

### Code Challenges

**Challenge 1 — Vector class**

```python
import math

class Vector2D:
    """A 2D vector with components (x, y)."""

    def __init__(self, x, y):
        self.x = x
        self.y = y

    @classmethod
    def from_polar(cls, magnitude, angle_deg):
        """Create from magnitude and angle in degrees."""
        pass

    def magnitude(self):
        """Return |v|."""
        pass

    def angle_deg(self):
        """Return angle in degrees (atan2 convention)."""
        pass

    def __add__(self, other):
        """Return self + other as a new Vector2D."""
        pass

    def dot(self, other):
        """Return dot product self · other."""
        pass

    def angle_between_deg(self, other):
        """Return angle between self and other in degrees."""
        pass

    def __repr__(self):
        return f"Vector2D({self.x:.4f}, {self.y:.4f})"


# --- tests: do not modify ---
v1 = Vector2D.from_polar(10, 30)
assert math.isclose(v1.x, 10*math.cos(math.radians(30)), rel_tol=1e-9)
assert math.isclose(v1.magnitude(), 10.0, rel_tol=1e-9)
assert math.isclose(v1.angle_deg(), 30.0, abs_tol=1e-9)

v2 = Vector2D(3, 4)
assert math.isclose(v2.magnitude(), 5.0, rel_tol=1e-9)

v3 = Vector2D(1, 0)
v4 = Vector2D(0, 1)
assert math.isclose(v3.dot(v4), 0.0, abs_tol=1e-9)
assert math.isclose(v3.angle_between_deg(v4), 90.0, abs_tol=1e-9)

v5 = v3 + v4
assert math.isclose(v5.x, 1.0) and math.isclose(v5.y, 1.0)

print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Multi-leg navigation**

```python
import math

def navigate(legs):
    """
    Given a list of (distance_km, bearing_deg) legs,
    compute the total displacement.
    Returns (total_distance, final_bearing, east_km, north_km).
    """
    pass


# --- tests: do not modify ---
# Single leg N (bearing=0°): should go purely north
d, b, e, n = navigate([(100, 0)])
assert math.isclose(e, 0.0,   abs_tol=1e-9)
assert math.isclose(n, 100.0, rel_tol=1e-9)

# Two equal legs at 90° to each other: 3-4-5 triangle
d, b, e, n = navigate([(30, 0), (40, 90)])
assert math.isclose(d, 50.0, rel_tol=1e-6)

# Return to start: two legs, each the reverse of the other
d, b, e, n = navigate([(50, 45), (50, 225)])
assert math.isclose(d, 0.0, abs_tol=1e-6)

print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Static force equilibrium**

A point is in static equilibrium when the sum of all forces acting on
it is zero. Given all forces except one, find the missing equilibrium force.

```python
import math

def equilibrium_force(known_forces):
    """
    Given a list of (magnitude, angle_deg) forces,
    return the (magnitude, angle_deg) of the force needed
    to bring the system into equilibrium (zero net force).
    """
    pass


# --- tests: do not modify ---
# One force of 10N at 0° requires 10N at 180° to balance
mag, ang = equilibrium_force([(10, 0)])
assert math.isclose(mag, 10.0, rel_tol=1e-9)
assert math.isclose(ang % 360, 180.0, abs_tol=0.01)

# Two forces at 90° to each other
mag2, ang2 = equilibrium_force([(3, 0), (4, 90)])
assert math.isclose(mag2, 5.0, rel_tol=1e-9)   # 3-4-5

# Three forces already balanced: equilibrium force is ~0
mag3, _ = equilibrium_force([(10, 0), (10, 120), (10, 240)])
assert math.isclose(mag3, 0.0, abs_tol=1e-6)

print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove that the dot product formula $\mathbf{a}\cdot\mathbf{b} = |\mathbf{a}||\mathbf{b}|\cos\theta$ follows from the Law of Cosines.

<details>
<summary>Answer</summary>

Consider the triangle formed by $\mathbf{a}$, $\mathbf{b}$, and
$\mathbf{a}-\mathbf{b}$. By the Law of Cosines:

$$|\mathbf{a}-\mathbf{b}|^2 = |\mathbf{a}|^2 + |\mathbf{b}|^2 - 2|\mathbf{a}||\mathbf{b}|\cos\theta$$

But also, expanding in components:
$$|\mathbf{a}-\mathbf{b}|^2 = (a_x-b_x)^2+(a_y-b_y)^2 = |\mathbf{a}|^2 - 2(a_xb_x+a_yb_y) + |\mathbf{b}|^2$$

Equating the two expressions:
$$-2(a_xb_x+a_yb_y) = -2|\mathbf{a}||\mathbf{b}|\cos\theta$$
$$a_xb_x+a_yb_y = |\mathbf{a}||\mathbf{b}|\cos\theta \qquad \blacksquare$$

</details>

**5. ★** A vector $\mathbf{v}$ is **projected** onto a vector $\mathbf{u}$
by the formula $\text{proj}_{\mathbf{u}}\mathbf{v} = \dfrac{\mathbf{v}\cdot\mathbf{u}}{|\mathbf{u}|^2}\mathbf{u}$.

(a) Show that $\text{proj}_{\mathbf{u}}\mathbf{v}$ has magnitude $|\mathbf{v}|\cos\theta$
where $\theta$ is the angle between $\mathbf{v}$ and $\mathbf{u}$.

(b) Show that $\mathbf{v} - \text{proj}_{\mathbf{u}}\mathbf{v}$ is perpendicular to $\mathbf{u}$.

(c) Implement `project_vector(v, u)` and verify with a test case.

```python
import math

def project_vector(v, u):
    """Return the projection of v onto u."""
    pass

# Test: project (3,4) onto (1,0) should give (3,0)
result = project_vector((3,4),(1,0))
assert math.isclose(result[0], 3.0) and math.isclose(result[1], 0.0)
# Remainder should be perpendicular to u
vx, vy = 3 - result[0], 4 - result[1]
assert math.isclose(vx*1 + vy*0, 0.0, abs_tol=1e-9)  # dot with (1,0)=0
print("✓ Extension 5 passed!")
```
