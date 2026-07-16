# Stage 2, Lesson 2.7 — The Law of Cosines
**Threads:** Math · Physics · Engineering  
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

The Law of Sines (Lesson 2.6) requires knowing a side and its opposite
angle. When you only have three sides (SSS) or two sides and the angle
between them (SAS), it cannot help. The **Law of Cosines** fills exactly
this gap. It is the generalisation of the Pythagorean theorem to all
triangles — when $C = 90°$, it reduces to $a^2 + b^2 = c^2$ exactly.
For any other angle, the correction term $-2ab\cos C$ adjusts for the
deviation from a right angle. The Law of Cosines also yields **Heron's
formula** for area from three sides alone. Together with the Law of Sines,
it gives a complete toolkit: any triangle can be solved from any sufficient
set of given information. By the end of this lesson you can solve any SAS
or SSS triangle, compute triangle area using Heron's formula, and apply
both laws strategically to multi-step geometry problems.

---

## Historical Context

The geometric equivalent of the Law of Cosines appears in Euclid's
*Elements* (Book II, Propositions 12–13) around 300 BCE, stated as a
relationship between areas of squares rather than as an algebraic equation.
The modern algebraic form was given by François Viète in the 1590s. The
formula is sometimes called the **Al-Kashi theorem** after the Persian
mathematician Jamshīd al-Kāshī, who stated it clearly in 1427. The
connection to the Pythagorean theorem was explicit from the start: the
Law of Cosines is Pythagoras with a correction for non-right angles.
In computational geometry — game engines, CAD, robotics — the Law of
Cosines appears constantly in the form "given three side lengths, find
the angles," which is the fundamental step in mesh rendering and inverse
kinematics.

---

## What You Need To Know First

- **Pythagorean theorem:** $a^2 + b^2 = c^2$ for a right triangle.
- **Cosine function** — Lesson 2.2.
- **The Law of Sines** — Lesson 2.6, for comparison.

---

## The Lesson

### Statement and Proof

**Law of Cosines:** In any triangle $ABC$ with sides $a$, $b$, $c$
opposite angles $A$, $B$, $C$:

$$a^2 = b^2 + c^2 - 2bc\cos A$$

$$b^2 = a^2 + c^2 - 2ac\cos B$$

$$c^2 = a^2 + b^2 - 2ab\cos C$$

All three are the same formula — just relabelling which angle and opposite
side you are working with. The standard form to memorise:
"the square of a side equals the sum of the squares of the other two sides,
minus twice their product times the cosine of the included angle."

**Proof:** Place the triangle with $C$ at the origin, $B$ at $(a, 0)$.
Then $A$ is at the point $(b\cos C,\ b\sin C)$ — at distance $b$ from
$C$ at angle $C$.

$$c^2 = |AB|^2 = (b\cos C - a)^2 + (b\sin C)^2$$

$$= b^2\cos^2 C - 2ab\cos C + a^2 + b^2\sin^2 C$$

$$= a^2 + b^2(\cos^2 C + \sin^2 C) - 2ab\cos C$$

$$= a^2 + b^2 - 2ab\cos C \qquad \blacksquare$$

(using $\cos^2 C + \sin^2 C = 1$)

**Special case:** If $C = 90°$, $\cos C = 0$, and the formula becomes
$c^2 = a^2 + b^2$ — the Pythagorean theorem. The Law of Cosines is the
Pythagorean theorem extended to all angles.

**Obtaining angles from sides** (rearranging):

$$\cos A = \frac{b^2 + c^2 - a^2}{2bc} \qquad
\cos B = \frac{a^2 + c^2 - b^2}{2ac} \qquad
\cos C = \frac{a^2 + b^2 - c^2}{2ab}$$

```python
import numpy as np
import matplotlib.pyplot as plt
import math

def draw_labelled_triangle(ax, vertices, labels, side_labels, angle_labels, title):
    """Draw a triangle with labelled vertices, sides, and angles."""
    verts = np.array(vertices + [vertices[0]])
    ax.plot(verts[:,0], verts[:,1], color='#2980b9', lw=2.5)
    ax.fill(verts[:-1,0], verts[:-1,1], alpha=0.08, color='#2980b9')

    for (x,y), lbl in zip(vertices, labels):
        ax.text(x, y, lbl, fontsize=13, fontweight='bold',
                ha='center', va='center', color='#2c3e50')

    # Side labels at midpoints
    n = len(vertices)
    for i, slbl in enumerate(side_labels):
        x1,y1 = vertices[i]
        x2,y2 = vertices[(i+1)%n]
        ax.text((x1+x2)/2, (y1+y2)/2, slbl, fontsize=10,
                ha='center', color='#e74c3c', fontweight='bold')

    ax.set_aspect('equal'); ax.grid(True, alpha=0.2)
    ax.set_title(title, fontsize=10)

fig, axes = plt.subplots(1, 2, figsize=(13, 6))

# SAS example: b=5, c=8, A=60° => a=7
b_len, c_len, A_deg = 5, 8, 60
A = math.radians(A_deg)
a_len = math.sqrt(b_len**2 + c_len**2 - 2*b_len*c_len*math.cos(A))

# Place: B at origin, C at (a,0), A computed from the sides
Bx, By = 0, 0
Cx, Cy = a_len, 0
# Angle B: use law of cosines to find cosB
cosB = (a_len**2 + c_len**2 - b_len**2)/(2*a_len*c_len)
B_angle = math.acos(cosB)
Ax = c_len * math.cos(B_angle)
Ay = c_len * math.sin(B_angle)

draw_labelled_triangle(axes[0],
    [(Bx-0.3,By-0.3),(Cx+0.2,Cy-0.3),(Ax-0.1,Ay+0.2)],
    ['$B$','$C$','$A$'],
    [f'$a={a_len:.1f}$', f'$b={b_len}$', f'$c={c_len}$'],
    [], f'SAS: $b={b_len}$, $c={c_len}$, $A={A_deg}°$\n→ $a={a_len:.1f}$')

# SSS example: a=5, b=7, c=10
a2,b2,c2 = 5,7,10
cosA2 = (b2**2+c2**2-a2**2)/(2*b2*c2)
cosB2 = (a2**2+c2**2-b2**2)/(2*a2*c2)
A2 = math.acos(cosA2); B2 = math.acos(cosB2)

Bx2,By2 = 0,0; Cx2,Cy2 = a2,0
Ax2 = b2*math.cos(A2+math.pi-math.pi)
# Recompute properly: place B at origin, C at (a,0)
# angle at B is B2
Ax2 = c2*math.cos(B2); Ay2 = c2*math.sin(B2)

draw_labelled_triangle(axes[1],
    [(Bx2-0.3,By2-0.3),(Cx2+0.2,Cy2-0.3),(Ax2-0.1,Ay2+0.2)],
    ['$B$','$C$','$A$'],
    [f'$a={a2}$',f'$b={b2}$',f'$c={c2}$'],
    [], f'SSS: $a={a2}$, $b={b2}$, $c={c2}$\n→ $A={math.degrees(math.acos(cosA2)):.1f}°$, '
        f'$B={math.degrees(B2):.1f}°$, $C={180-math.degrees(math.acos(cosA2))-math.degrees(B2):.1f}°$')

plt.suptitle('Law of Cosines: $a^2 = b^2+c^2-2bc\\cos A$', fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** The triangle is placed with $B$ at the origin and $C$
on the positive $x$-axis, then $A$ is located using the angle at $B$
and the length $c$: `Ax = c*cos(B)`, `Ay = c*sin(B)` — the same
coordinate placement used in Lesson 2.6. `draw_labelled_triangle` is a
helper that draws the triangle, fills it lightly, and labels vertices
and sides from the passed lists.

---

### Solving SAS Triangles

**When to use:** two sides and the angle between them (the included angle).

**Strategy:**
1. Use the Law of Cosines to find the third side.
2. Use the Law of Sines (easier) or Law of Cosines to find one more angle.
3. Find the third angle from $A+B+C = 180°$.

**Hand-worked example:** $b = 5$, $c = 8$, $A = 60°$.

Step 1 — find $a$:

$$a^2 = 5^2 + 8^2 - 2(5)(8)\cos 60° = 25 + 64 - 80 \times 0.5 = 49$$

$$a = 7$$

Step 2 — find $B$ (use Law of Sines on the known pair $a$, $A$):

$$\sin B = \frac{b\sin A}{a} = \frac{5\sin 60°}{7} = \frac{5\times 0.8660}{7} \approx 0.6186$$

$$B \approx 38.2°$$

Step 3: $C = 180° - 60° - 38.2° = 81.8°$.

```python
import math

def solve_SAS(b, c, A_deg):
    """
    Solve triangle given sides b, c and included angle A.
    Returns dict with all sides and angles.
    """
    A = math.radians(A_deg)

    # Step 1: find a via Law of Cosines
    a = math.sqrt(b**2 + c**2 - 2*b*c*math.cos(A))

    # Step 2: find B via Law of Sines (choose the non-included angle
    # opposite the shorter side to avoid the ambiguous case)
    # Use Law of Cosines to be safe: no ambiguity
    cosB = (a**2 + c**2 - b**2) / (2*a*c)
    B_deg = math.degrees(math.acos(cosB))
    # math.acos always returns a value in [0, π], so no ambiguity here

    # Step 3: third angle
    C_deg = 180 - A_deg - B_deg

    return {'a': a, 'b': b, 'c': c,
            'A': A_deg, 'B': B_deg, 'C': C_deg}

def solve_SSS(a, b, c):
    """
    Solve triangle given all three sides.
    Returns dict with all angles.
    """
    # Use Law of Cosines for all three angles
    cosA = (b**2 + c**2 - a**2) / (2*b*c)
    cosB = (a**2 + c**2 - b**2) / (2*a*c)
    # Clamp to [-1, 1] to handle floating-point errors
    cosA = max(-1, min(1, cosA))
    cosB = max(-1, min(1, cosB))
    # max(-1, min(1, x)): clamp x to the interval [-1, 1]
    # necessary because floating-point arithmetic can give values like 1.0000000001

    A_deg = math.degrees(math.acos(cosA))
    B_deg = math.degrees(math.acos(cosB))
    C_deg = 180 - A_deg - B_deg   # use subtraction for the third angle

    return {'a': a, 'b': b, 'c': c,
            'A': A_deg, 'B': B_deg, 'C': C_deg}

# Test both
print("SAS: b=5, c=8, A=60°")
sol = solve_SAS(5, 8, 60)
for k, v in sol.items():
    print(f"  {k} = {v:.4f}")

print()
print("SSS: a=5, b=7, c=10")
sol2 = solve_SSS(5, 7, 10)
for k, v in sol2.items():
    print(f"  {k} = {v:.4f}")
print(f"  Sum of angles: {sol2['A']+sol2['B']+sol2['C']:.6f}°")
```

**Walkthrough:** `max(-1, min(1, cosA))` clamps the cosine value to
$[-1, 1]$. Floating-point arithmetic can produce values like
$1.0000000000000002$ for a degenerate triangle (e.g., all three sides
nearly collinear), which causes `math.acos` to raise a `ValueError` since
its domain is $[-1, 1]$. Clamping prevents this without silently hiding
genuine errors. Finding $C$ by subtraction ($180° - A - B$) is more
numerically stable than computing $\cos C$ — small errors in $A$ and $B$
accumulate but remain controlled.

---

### Heron's Formula

Given three sides of a triangle, we can compute the area without finding
any angle first.

**Heron's formula:** let $s = (a+b+c)/2$ (the **semi-perimeter**). Then:

$$\text{Area} = \sqrt{s(s-a)(s-b)(s-c)}$$

**Derivation:** from the Law of Cosines,
$\cos C = (a^2+b^2-c^2)/(2ab)$.
The area formula gives $\text{Area} = \frac{1}{2}ab\sin C$.
Using $\sin^2 C = 1-\cos^2 C$ and factoring the result:

$$\text{Area}^2 = \frac{1}{4}a^2 b^2\sin^2 C = \frac{1}{4}a^2b^2(1-\cos^2 C)$$

$$= \frac{1}{4}(ab+ab\cos C)(ab-ab\cos C)$$

Substituting the expression for $\cos C$ and factoring using the identity
$(x+y)(x-y) = x^2-y^2$ leads — after careful algebra — to
$\text{Area}^2 = s(s-a)(s-b)(s-c)$.

**Hand-worked example:** $a = 5$, $b = 7$, $c = 10$.

$s = (5+7+10)/2 = 11$.

$$\text{Area} = \sqrt{11(11-5)(11-7)(11-10)} = \sqrt{11\times 6\times 4\times 1} = \sqrt{264} \approx 16.25$$

```python
import math

def heron_area(a, b, c):
    """Compute triangle area using Heron's formula."""
    s = (a + b + c) / 2   # semi-perimeter
    radicand = s*(s-a)*(s-b)*(s-c)
    if radicand < 0:
        return 0.0   # degenerate triangle (due to floating-point)
    return math.sqrt(radicand)

print("Heron's formula: Area = sqrt(s(s-a)(s-b)(s-c))\n")
triangles = [(5, 7, 10), (3, 4, 5), (8, 8, 8), (6, 8, 10), (5, 5, 6)]
print(f"{'a':>5}  {'b':>5}  {'c':>5}  {'s':>6}  {'Area':>10}")
print("-" * 38)
for a, b, c in triangles:
    s = (a+b+c)/2
    area = heron_area(a, b, c)
    print(f"{a:>5}  {b:>5}  {c:>5}  {s:>6.1f}  {area:>10.4f}")

print()
# Verify against (1/2)*a*b*sin(C) for the known case
a, b, c = 5, 7, 10
sol = solve_SSS(a, b, c)
area_trig = 0.5*a*b*math.sin(math.radians(sol['C']))
area_heron = heron_area(a, b, c)
print(f"Cross-check a=5, b=7, c=10:")
print(f"  Heron's formula:  {area_heron:.6f}")
print(f"  (1/2)ab·sin(C):   {area_trig:.6f}")
print(f"  Match: {math.isclose(area_heron, area_trig, rel_tol=1e-9)}")
```

**Walkthrough:** `s = (a + b + c) / 2` computes the semi-perimeter —
half the perimeter. The `radicand < 0` check handles the case where the
three "sides" do not actually form a triangle (violating the triangle
inequality). This cannot happen with valid geometric data but can arise
with floating-point rounding.

---

### Choosing Between the Laws

| Given | Use | Notes |
|-------|-----|-------|
| AAS, ASA | Law of Sines | Direct: find third angle, then sides |
| SSA | Law of Sines | Careful: ambiguous case |
| SAS | Law of Cosines | Find the missing side first |
| SSS | Law of Cosines | Find the largest angle first (avoids ambiguity in Law of Sines) |

**Why find the largest angle first in SSS?** In SSS, after finding one
angle with the Law of Cosines, you might switch to the Law of Sines for
the remaining angles. The Law of Sines is ambiguous for obtuse angles
(both $\theta$ and $180°-\theta$ have the same sine). The largest angle
is the most likely to be obtuse — find it with the Law of Cosines
(which uses $\arccos$, unambiguous in $[0°, 180°]$), then use the Law
of Sines safely for the acute angles.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

# Visualise the relationship between the laws
fig, ax = plt.subplots(figsize=(10, 7))
ax.axis('off')
ax.set_title('Triangle Solving: Which Law to Use?', fontsize=13,
             fontweight='bold', pad=20)

# Decision flowchart as text boxes
boxes = [
    (0.5, 0.92, 'What is given?', '#2c3e50', 'white', 14),
    (0.18, 0.70, 'AAS or ASA\n(2 angles + 1 side)', '#2980b9', 'white', 10),
    (0.50, 0.70, 'SSA\n(2 sides + non-incl. angle)', '#e67e22', 'white', 10),
    (0.82, 0.70, 'SAS or SSS\n(all sides / 2 sides + incl. angle)', '#27ae60', 'white', 10),
    (0.18, 0.42, 'Law of Sines\nDirect solution', '#2980b9', 'white', 10),
    (0.50, 0.42, 'Law of Sines\nCheck ambiguous case\n(0, 1, or 2 solutions)', '#e67e22', 'white', 10),
    (0.82, 0.42, 'Law of Cosines\nFind missing side\nor largest angle first', '#27ae60', 'white', 10),
    (0.5, 0.12, 'Then use Law of Sines\nor angle sum for remaining unknowns', '#8e44ad', 'white', 10),
]

for x, y, text, bg, fg, fs in boxes:
    ax.text(x, y, text, ha='center', va='center', fontsize=fs,
            color=fg, fontweight='bold',
            transform=ax.transAxes,
            # transform=ax.transAxes: place at axis-fraction coordinates (0-1 range)
            bbox=dict(boxstyle='round,pad=0.5', facecolor=bg,
                      edgecolor='white', linewidth=1.5))

# Arrows
arrow_pairs = [
    (0.18, 0.85, 0.18, 0.78),
    (0.50, 0.85, 0.50, 0.78),
    (0.82, 0.85, 0.82, 0.78),
    (0.18, 0.62, 0.18, 0.52),
    (0.50, 0.62, 0.50, 0.52),
    (0.82, 0.62, 0.82, 0.52),
    (0.18, 0.32, 0.40, 0.18),
    (0.82, 0.32, 0.60, 0.18),
    (0.50, 0.32, 0.50, 0.18),
]
for x1,y1,x2,y2 in arrow_pairs:
    ax.annotate('', xy=(x2,y2), xytext=(x1,y1),
                arrowprops=dict(arrowstyle='->', color='#aaaaaa', lw=1.5),
                xycoords='axes fraction', textcoords='axes fraction')

plt.tight_layout()
plt.show()
```

**Walkthrough:** `xycoords='axes fraction'` and `textcoords='axes fraction'`
tell `ax.annotate` to interpret both the arrow head (`xy`) and tail
(`xytext`) positions in axis-fraction coordinates ($0$ to $1$), rather
than data coordinates. This is needed here because `ax.axis('off')` removes
the data coordinate system, so we position everything as fractions of the
plot area. `transform=ax.transAxes` in `ax.text` achieves the same thing
for the text boxes.

---

### Manufacturing Application: Link Length in a Robotic Arm

A two-link planar robot arm has link lengths $L_1$ and $L_2$. The
end-effector (tool tip) is at position $(x, y)$. Finding the joint
angles requires the Law of Cosines.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def inverse_kinematics_2link(x, y, L1, L2):
    """
    Find joint angles (theta1, theta2) for a 2-link planar arm
    to reach (x, y), using the Law of Cosines.
    
    Returns (theta1, theta2) in degrees, or None if unreachable.
    theta2 is the elbow angle (between the two links).
    theta1 is the base angle (first link from horizontal).
    """
    d = math.sqrt(x**2 + y**2)   # distance from origin to target

    # Check reachability
    if d > L1 + L2 or d < abs(L1 - L2):
        return None   # target is out of reach

    # Law of Cosines: find elbow angle theta2
    # d² = L1² + L2² - 2*L1*L2*cos(π - theta2) = L1²+L2²+2*L1*L2*cos(theta2)
    cos_theta2 = (d**2 - L1**2 - L2**2) / (2*L1*L2)
    cos_theta2 = max(-1, min(1, cos_theta2))   # clamp for floating-point
    theta2 = math.acos(cos_theta2)             # elbow angle (always positive here)

    # Law of Cosines: find angle alpha (from base to target)
    alpha = math.atan2(y, x)                   # angle to target from horizontal
    cos_beta = (L1**2 + d**2 - L2**2) / (2*L1*d)
    cos_beta = max(-1, min(1, cos_beta))
    beta = math.acos(cos_beta)                 # angle at shoulder triangle

    theta1 = alpha - beta   # base joint angle (elbow-up configuration)

    return math.degrees(theta1), math.degrees(theta2)

# Test the IK solver
L1, L2 = 300, 200   # mm
targets = [(400, 150), (300, 200), (0, 500), (100, 100)]

print(f"2-Link Arm IK (L1={L1}mm, L2={L2}mm):\n")
print(f"{'Target (x,y)':>16}  {'θ1 (°)':>10}  {'θ2 (°)':>10}  {'Reach':>8}")
print("-" * 52)
for (x, y) in targets:
    result = inverse_kinematics_2link(x, y, L1, L2)
    if result is None:
        print(f"  ({x:4d},{y:4d})         unreachable")
    else:
        t1, t2 = result
        # Verify by forward kinematics
        Ax = L1*math.cos(math.radians(t1))
        Ay = L1*math.sin(math.radians(t1))
        Ex = Ax + L2*math.cos(math.radians(t1+t2))
        Ey = Ay + L2*math.sin(math.radians(t1+t2))
        err = math.sqrt((Ex-x)**2 + (Ey-y)**2)
        print(f"  ({x:4d},{y:4d})  {t1:>10.2f}  {t2:>10.2f}  err={err:.4f}mm")

# Visualise one configuration
fig, ax = plt.subplots(figsize=(7, 7))
t1_deg, t2_deg = inverse_kinematics_2link(400, 150, L1, L2)
t1, t2 = math.radians(t1_deg), math.radians(t2_deg)

Ox, Oy = 0, 0
Ax = L1*math.cos(t1); Ay = L1*math.sin(t1)
Ex = Ax + L2*math.cos(t1+t2); Ey = Ay + L2*math.sin(t1+t2)

ax.plot([Ox,Ax], [Oy,Ay], color='#2980b9', lw=6, solid_capstyle='round',
        label=f'Link 1 ({L1}mm), $\\theta_1={t1_deg:.1f}°$')
ax.plot([Ax,Ex], [Ay,Ey], color='#e74c3c', lw=5, solid_capstyle='round',
        label=f'Link 2 ({L2}mm), $\\theta_2={t2_deg:.1f}°$')
ax.plot(Ox, Oy, 'ks', markersize=12)   # base (black square)
ax.plot(Ax, Ay, 'o', color='#2980b9', markersize=12)   # elbow
ax.plot(Ex, Ey, '*', color='#27ae60', markersize=16, zorder=5,
        label=f'End-effector (400, 150)')   # end-effector (star)

ax.axhline(0, color='#333', lw=0.8); ax.axvline(0, color='#333', lw=0.8)
ax.set_aspect('equal')
ax.set_xlim(-100, 550); ax.set_ylim(-50, 400)
ax.set_title(f'2-Link Robot IK via Law of Cosines\nTarget: (400, 150) mm',
             fontsize=11)
ax.set_xlabel('x (mm)'); ax.set_ylabel('y (mm)')
ax.legend(fontsize=9); ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `solid_capstyle='round'` in `ax.plot` rounds the ends
of thick lines — used here to make the robot links look like physical
rods rather than flat-ended rectangles. `'ks'` is a marker style
combining `'k'` (black) and `'s'` (square). `'*'` draws a star marker —
used for the end-effector to make it visually distinct. The forward
kinematics verification at the end (`Ex, Ey`) confirms the IK is correct
by computing where the arm actually reaches and measuring the error.

---

## Connect the Pieces

**What this lesson built on:** Pythagorean theorem (now a special case).
Cosine function (Lesson 2.2). Law of Sines (Lesson 2.6) — used after the
Law of Cosines to find remaining angles.

**What this lesson makes possible:** Together, the Law of Sines and Law
of Cosines solve any triangle. Stage 3 (Analytic Geometry) — the distance
formula is the Law of Cosines for vectors. Stage 4 (Linear Algebra) — the
dot product formula $\mathbf{a}\cdot\mathbf{b} = |\mathbf{a}||\mathbf{b}|\cos\theta$
is the Law of Cosines rearranged. Stage 5 (Calculus) — Heron's formula
connects to the Gram determinant in integration of surface areas.

---

## Summary

**Law of Cosines:** $a^2 = b^2 + c^2 - 2bc\cos A$ (and cyclic forms).

**For finding a side (SAS):** plug in directly.

**For finding an angle (SSS):**
$$\cos A = \frac{b^2+c^2-a^2}{2bc}$$

**Heron's formula (SSS area):** $s=(a+b+c)/2$;
$\text{Area}=\sqrt{s(s-a)(s-b)(s-c)}$.

**Strategy:** use the Law of Cosines for SAS and SSS; use the Law of Sines
for AAS, ASA, and (carefully) SSA. In SSS, find the largest angle first.

**New Python:**
- `max(-1, min(1, val))` — clamp a value to the interval $[-1, 1]$
- `solid_capstyle='round'` — rounded line ends in `ax.plot`
- `'ks'`, `'*'` marker styles — black square, star

---

## Problems

### Math

**1.** Solve each triangle completely.

(a) $a = 6$, $b = 8$, $C = 40°$ (SAS)

(b) $a = 9$, $b = 12$, $c = 15$ (SSS)

(c) $b = 4$, $c = 7$, $A = 120°$ (SAS, obtuse angle)

<details>
<summary>Answers</summary>

(a) $c^2=36+64-96\cos40°=100-73.52=26.48$, $c=5.146$.
$\cos A=(26.48+64-36)/(2\times5.146\times8)=54.48/82.34=0.6616$, $A=48.6°$.
$B=180-40-48.6=91.4°$.

(b) This is a 3-4-5 triangle scaled by 3. $\cos C=(81+144-225)/(2\times9\times12)=0$,
$C=90°$. $\cos A=(144+225-81)/(2\times12\times15)=0.8$, $A=36.87°$. $B=53.13°$.

(c) $a^2=16+49-56\cos120°=65-56(-0.5)=93$, $a=9.644$.
$\cos B=(93+49-16)/(2\times9.644\times7)=126/134.99=0.9334$, $B=21.1°$.
$C=180-120-21.1=38.9°$.

</details>

---

**2.** Find the area of each triangle using Heron's formula.

(a) $a=7$, $b=10$, $c=5$

(b) $a=13$, $b=14$, $c=15$

<details>
<summary>Answers</summary>

(a) $s=11$. Area $=\sqrt{11\cdot4\cdot1\cdot6}=\sqrt{264}=2\sqrt{66}\approx16.25$.

(b) $s=21$. Area $=\sqrt{21\cdot8\cdot7\cdot6}=\sqrt{7056}=84$.

</details>

---

**3.** A triangular steel brace has sides 80 cm, 60 cm, and 100 cm.

(a) Is this a right triangle? How can you tell without computing angles?

(b) What angle does the 80 cm side make with the 60 cm side?

(c) What is the area of the brace?

<details>
<summary>Answers</summary>

(a) Check $80^2+60^2=6400+3600=10000=100^2$. Yes — perfect right triangle.

(b) The angle between 80 and 60 is $C$, opposite the hypotenuse 100.
$\cos C=(6400+3600-10000)/(2\times80\times60)=0/9600=0$, $C=90°$.

(c) Area $=\frac{1}{2}\times80\times60=2400$ cm².

</details>

---

### Code Challenges

**Challenge 1 — Law of Cosines solver**

```python
import math

def solve_SAS(b, c, A_deg):
    """Solve triangle given sides b, c and included angle A. Returns full solution dict."""
    pass

def solve_SSS(a, b, c):
    """Solve triangle given all three sides. Returns full solution dict."""
    pass

def heron_area(a, b, c):
    """Compute area using Heron's formula."""
    pass


# --- tests: do not modify ---
# SAS: b=5, c=8, A=60° -> a=7
sol = solve_SAS(5, 8, 60)
assert math.isclose(sol['a'], 7.0,     rel_tol=1e-6)
assert math.isclose(sol['B'], 38.213,  abs_tol=0.01)
assert math.isclose(sol['C'], 81.787,  abs_tol=0.01)

# SSS: 3-4-5 right triangle
sol2 = solve_SSS(3, 4, 5)
assert math.isclose(sol2['C'], 90.0,   abs_tol=0.001)

# Heron
assert math.isclose(heron_area(5, 7, 10), 16.248, abs_tol=0.001)
assert math.isclose(heron_area(3, 4, 5),  6.0,    rel_tol=1e-9)

print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Complete triangle solver**

```python
import math

def solve_triangle(given):
    """
    Solve any triangle from given information.
    
    given: dict with some of: 'a','b','c','A','B','C'
          (angles in degrees, sides as lengths)
    
    Strategy:
    - Count sides and angles given
    - Choose Law of Sines or Cosines appropriately
    - Return complete dict with all 6 values
    - Return None if the triangle is impossible
    """
    pass  # your code here -- use solve_SAS, solve_SSS, and Law of Sines


# --- tests: do not modify ---
# AAS
sol = solve_triangle({'A': 40, 'B': 60, 'a': 10})
assert math.isclose(sol['C'], 80.0, abs_tol=0.01)
assert math.isclose(sol['b'], 13.473, abs_tol=0.01)

# SAS
sol2 = solve_triangle({'b': 5, 'c': 8, 'A': 60})
assert math.isclose(sol2['a'], 7.0, rel_tol=1e-6)

# SSS
sol3 = solve_triangle({'a': 3, 'b': 4, 'c': 5})
assert math.isclose(sol3['C'], 90.0, abs_tol=0.001)

print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — 2-link robot workspace**

Plot the reachable workspace of a 2-link arm with $L_1=300$ mm and
$L_2=200$ mm, and identify which target points are reachable.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

def reachable(x, y, L1, L2):
    """Return True if the point (x,y) is reachable by the 2-link arm."""
    pass

L1, L2 = 300, 200

# Test grid
x_range = np.linspace(-550, 550, 200)
y_range = np.linspace(-550, 550, 200)
X, Y = np.meshgrid(x_range, y_range)
# np.meshgrid: creates 2D coordinate arrays from 1D ranges
# X[i,j] = x_range[j], Y[i,j] = y_range[i] for all i,j

Z = np.array([[reachable(x, y, L1, L2) for x in x_range] for y in y_range])

fig, ax = plt.subplots(figsize=(7, 7))
ax.contourf(X, Y, Z, levels=[-0.5, 0.5, 1.5],
            colors=['#f0f0f0', '#2980b9'], alpha=0.7)
# ax.contourf: filled contour plot -- shades regions where Z is in each level range

ax.plot(0, 0, 'ks', markersize=10)   # base
ax.set_aspect('equal')
ax.set_xlabel('x (mm)'); ax.set_ylabel('y (mm)')
ax.set_title(f'Reachable workspace: $L_1={L1}$mm, $L_2={L2}$mm\n'
             f'(blue = reachable, inner hole = too close)', fontsize=10)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

<details>
<summary>Hint for reachable</summary>

A point $(x,y)$ is reachable if and only if:
$|L_1 - L_2| \leq \sqrt{x^2+y^2} \leq L_1+L_2$.

The upper bound $L_1+L_2$ is the fully extended arm.
The lower bound $|L_1-L_2|$ is the fully folded arm (the two links overlap).

</details>

---

### Extension

**4. ★** Prove that for any triangle, the largest angle is always opposite
the longest side, using the Law of Cosines.

<details>
<summary>Answer</summary>

Suppose $a \geq b$ (WLOG). We want to show $A \geq B$.

From the Law of Cosines:
$\cos A = \frac{b^2+c^2-a^2}{2bc}$ and $\cos B = \frac{a^2+c^2-b^2}{2ac}$.

Since $a \geq b$: $b^2+c^2-a^2 \leq a^2+c^2-b^2$, which means the
numerator for $\cos A$ is $\leq$ numerator for $\cos B$.
Also, the denominators $2bc$ and $2ac$ satisfy $2bc \geq 2ac$ (since $b \geq...$)
— wait, $a \geq b$ so $2ac \geq 2bc$.

More cleanly: $\cos A - \cos B = \frac{b^2+c^2-a^2}{2bc} - \frac{a^2+c^2-b^2}{2ac}$.

Common denominator $2abc$:
$= \frac{a(b^2+c^2-a^2) - b(a^2+c^2-b^2)}{2abc}$
$= \frac{ab^2+ac^2-a^3-a^2b-bc^2+b^3}{2abc}$
$= \frac{(b^3-a^3)+(ab^2-a^2b)+(ac^2-bc^2)}{2abc}$
$= \frac{(b-a)(b^2+ab+a^2) + ab(b-a) + c^2(a-b)}{2abc}$
$= \frac{(b-a)(a^2+ab+b^2+ab-c^2)}{2abc}$

Since $a \geq b$: $(b-a) \leq 0$. If the second factor is positive, then $\cos A \leq \cos B$,
meaning $A \geq B$ (cosine is decreasing on $[0°, 180°]$). The second factor $a^2+2ab+b^2-c^2 = (a+b)^2-c^2 > 0$ since $c < a+b$ (triangle inequality). $\square$

</details>
