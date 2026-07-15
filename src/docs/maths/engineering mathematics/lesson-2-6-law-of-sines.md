# Stage 2, Lesson 2.6 — The Law of Sines
**Threads:** Math · Physics · Engineering  
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Everything so far in Stage 2 has been about right triangles and the unit
circle. Most real-world triangles are not right triangles — the triangular
bracing in a truss, the layout of a machined part, the geometry of a
robotic arm, the bearing from a GPS receiver to two landmarks. The Law of
Sines is the first tool that works for any triangle, not just right ones.
It states that the ratio of each side to the sine of its opposite angle
is constant across a triangle. This single fact lets you find unknown
sides and angles whenever you know two angles and a side (AAS or ASA),
or two sides and a non-included angle (SSA) — though the SSA case hides
a subtlety called the **ambiguous case**, where the given information may
correspond to two triangles, one, or none. By the end of this lesson you
can solve any AAS, ASA, or SSA triangle exactly, recognise and resolve
the ambiguous case, and compute triangle areas from two sides and an angle.

---

## Historical Context

The Law of Sines was known to Islamic mathematicians by the 10th century
— Abu al-Wafa Buzjani and Nasir al-Din al-Tusi stated versions of it
explicitly. In Europe it appeared in Regiomontanus's *De Triangulis*
(1464), the first systematic European treatment of trigonometry as a
subject independent of astronomy. The law was essential for navigation
and surveying: given two known landmarks visible from a ship, measuring
the angles to them allows computing the ship's position — a technique
called triangulation. The same technique is used today in GPS (with
signals instead of angles) and in robotic localisation (with lidar or
camera measurements).

---

## What You Need To Know First

- **Sine function** — Lessons 2.1–2.2.
- **Sum of angles in a triangle:** $A + B + C = \pi$ (180°).
- **Area of a triangle:** $\frac{1}{2} \times \text{base} \times \text{height}$.

---

## The Lesson

### Setup and Notation

**Standard labelling:** In triangle $ABC$:
- Angles $A$, $B$, $C$ at the three vertices
- Side $a$ is opposite angle $A$ (the side between vertices $B$ and $C$)
- Side $b$ is opposite angle $B$
- Side $c$ is opposite angle $C$

This labelling convention — lowercase side opposite uppercase angle — is
universal. Any formula involving both a side and its opposite angle will
use matching letters.

---

### The Law of Sines

**Theorem:** In any triangle $ABC$:

$$\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C}$$

Equivalently (taking reciprocals):

$$\frac{\sin A}{a} = \frac{\sin B}{b} = \frac{\sin C}{c}$$

The common ratio $\dfrac{a}{\sin A}$ equals $2R$, where $R$ is the
radius of the **circumscribed circle** (the circle passing through all
three vertices).

**Proof:** Drop a perpendicular from vertex $C$ to side $c$, with
height $h$. Using the right-triangle definition of sine in the two
sub-triangles:

$$h = b\sin A \qquad h = a\sin B$$

Setting equal: $b\sin A = a\sin B$, which rearranges to
$\dfrac{a}{\sin A} = \dfrac{b}{\sin B}$.

Repeat with a perpendicular from vertex $B$ to get $\dfrac{b}{\sin B} = \dfrac{c}{\sin C}$. $\blacksquare$

```python
import numpy as np
import matplotlib.pyplot as plt
import math

def draw_triangle(ax, A_deg, B_deg, a, title, show_proof=False):
    """
    Draw a triangle given angles A, B (degrees) and side a (opposite A).
    Returns (b, c, C_deg) for the solved triangle.
    """
    A = math.radians(A_deg)
    B = math.radians(B_deg)
    C = math.pi - A - B

    # Law of Sines: b/sinB = a/sinA
    k = a / math.sin(A)   # the common ratio
    b = k * math.sin(B)
    c = k * math.sin(C)

    # Place triangle: vertex B at origin, C at (a, 0)
    Bx, By = 0, 0
    Cx, Cy = a, 0
    # Vertex A is at angle B from BC, distance c from B
    Ax = c * math.cos(B)
    Ay = c * math.sin(B)

    verts = np.array([[Bx,By],[Cx,Cy],[Ax,Ay],[Bx,By]])
    ax.plot(verts[:,0], verts[:,1], color='#2980b9', lw=2.5)
    ax.fill(verts[:-1,0], verts[:-1,1], alpha=0.08, color='#2980b9')

    # Label vertices
    for (x, y, lbl, off) in [(Bx,By,'$B$',(-0.15,-0.15)),
                              (Cx,Cy,'$C$',(0.1,-0.15)),
                              (Ax,Ay,'$A$',(-0.05,0.12))]:
        ax.text(x+off[0], y+off[1], lbl, fontsize=12, fontweight='bold',
                color='#2c3e50')

    # Label sides with ratios
    for (x1,y1,x2,y2,lbl,ratio_lbl) in [
        (Bx,By,Cx,Cy,f'$a={a}$',f'$a/\\sin A={k:.2f}$'),
        (Cx,Cy,Ax,Ay,f'$b={b:.2f}$',f'$b/\\sin B={b/math.sin(B):.2f}$'),
        (Ax,Ay,Bx,By,f'$c={c:.2f}$',f'$c/\\sin C={c/math.sin(C):.2f}$'),
    ]:
        mx, my = (x1+x2)/2, (y1+y2)/2
        ax.text(mx, my, lbl, fontsize=9, ha='center',
                color='#e74c3c', fontweight='bold')

    ax.set_aspect('equal'); ax.grid(True, alpha=0.2)
    ax.set_title(f'{title}\n$A={A_deg}°, B={B_deg}°, C={math.degrees(C):.0f}°$',
                 fontsize=10)
    return b, c, math.degrees(C)

fig, axes = plt.subplots(1, 2, figsize=(13, 6))

b1, c1, C1 = draw_triangle(axes[0], 40, 60, 10,
                            'AAS: $A=40°, B=60°, a=10$')
b2, c2, C2 = draw_triangle(axes[1], 55, 75, 12,
                            'ASA: $A=55°, B=75°, a=12$')

plt.suptitle('Law of Sines: $\\frac{a}{\\sin A}=\\frac{b}{\\sin B}=\\frac{c}{\\sin C}$',
             fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `draw_triangle` places the triangle in a coordinate
system with $B$ at the origin and $C$ on the positive $x$-axis. Vertex
$A$ is then at angle $B$ from the $BC$ baseline, distance $c$ from $B$:
`Ax = c*cos(B)`, `Ay = c*sin(B)`. This parametric placement (an
application of the unit circle definition of sine and cosine) is how
geometric triangle-drawing always works in code. `ax.fill` shades the
interior with `alpha=0.08` — a very faint fill so the labels remain
readable.

---

### When to Use the Law of Sines

The Law of Sines works when you know a side and its opposite angle.
The applicable cases:

| Case | Given | Find |
|------|-------|------|
| AAS | Two angles and any side | Everything |
| ASA | Two angles and the included side | Everything |
| SSA | Two sides and a non-included angle | **Ambiguous** — see below |

It does **not** apply to:
- SSS (three sides) — use Law of Cosines (Lesson 2.7)
- SAS (two sides and included angle) — use Law of Cosines

**Hand-worked example (AAS):** $A = 40°$, $B = 60°$, $a = 10$.

Step 1: $C = 180° - 40° - 60° = 80°$.

Step 2: $\dfrac{b}{\sin 60°} = \dfrac{10}{\sin 40°}$, so
$b = \dfrac{10\sin 60°}{\sin 40°} = \dfrac{10 \times 0.8660}{0.6428} \approx 13.47$.

Step 3: $c = \dfrac{10\sin 80°}{\sin 40°} \approx \dfrac{10 \times 0.9848}{0.6428} \approx 15.32$.

---

### The Ambiguous Case (SSA)

When given two sides $a$, $b$ and the angle $A$ opposite the shorter
of the two sides, there may be 0, 1, or 2 triangles. The issue: after
computing $\sin B = b\sin A / a$, both $B$ and $180° - B$ could be valid.

**Analysis by case** (assuming $a < b$, $A$ is acute):

| Condition | Number of triangles |
|-----------|-------------------|
| $a < b\sin A$ | 0 — $a$ is too short to reach the base |
| $a = b\sin A$ | 1 — right triangle |
| $b\sin A < a < b$ | 2 — both $B_1$ and $B_2 = 180°-B_1$ are valid |
| $a \geq b$ | 1 — only the acute $B_1$ works |

**Hand-worked example:** $a = 7$, $b = 10$, $A = 30°$.

$$\sin B = \frac{b\sin A}{a} = \frac{10\sin 30°}{7} = \frac{5}{7} \approx 0.7143$$

Since $0.7143 < 1$ and $a < b$, we have the two-triangle case.

$B_1 = \arcsin(0.7143) \approx 45.6°$, so $C_1 = 180° - 30° - 45.6° = 104.4°$.

$B_2 = 180° - 45.6° = 134.4°$, so $C_2 = 180° - 30° - 134.4° = 15.6°$.

Both $C_1 > 0$ and $C_2 > 0$, so both triangles are valid.

$$c_1 = \frac{7\sin 104.4°}{\sin 30°} \approx 13.56 \qquad c_2 = \frac{7\sin 15.6°}{\sin 30°} \approx 3.76$$

```python
import numpy as np
import matplotlib.pyplot as plt
import math

def solve_SSA(a, b, A_deg):
    """
    Solve triangle given sides a, b and angle A (opposite a).
    Returns list of solution dicts, each with keys B, C, c (all in degrees).
    """
    A = math.radians(A_deg)
    sinB = b * math.sin(A) / a

    if sinB > 1 + 1e-10:
        return []   # no solution
    if math.isclose(sinB, 1, abs_tol=1e-10):
        B = math.pi/2
        C = math.pi - A - B
        if C <= 0: return []
        c = a * math.sin(C) / math.sin(A)
        return [{'B': math.degrees(B), 'C': math.degrees(C), 'c': c}]

    B1 = math.asin(sinB)
    solutions = []
    for B in [B1, math.pi - B1]:
        C = math.pi - A - B
        if C > 1e-10:   # valid triangle (C must be positive)
            c = a * math.sin(C) / math.sin(A)
            solutions.append({'B': math.degrees(B),
                               'C': math.degrees(C),
                               'c': c})
    return solutions

# Demonstrate the ambiguous case
a, b, A_deg = 7, 10, 30
solutions = solve_SSA(a, b, A_deg)

print(f"SSA case: a={a}, b={b}, A={A_deg}°\n")
print(f"sin(B) = b·sin(A)/a = {b*math.sin(math.radians(A_deg))/a:.4f}")
print(f"\nFound {len(solutions)} solution(s):\n")
for i, sol in enumerate(solutions, 1):
    print(f"  Triangle {i}: B={sol['B']:.2f}°, C={sol['C']:.2f}°, c={sol['c']:.4f}")

print()
# Visualise both triangles
fig, axes = plt.subplots(1, 2, figsize=(13, 6))

for ax, sol, n in zip(axes, solutions, [1, 2]):
    A = math.radians(A_deg)
    B = math.radians(sol['B'])
    c = sol['c']

    # Place: vertex B at origin, C at (a, 0)
    Bx, By = 0, 0
    Cx, Cy = a, 0
    Ax = c * math.cos(B)
    Ay = c * math.sin(B)

    verts = np.array([[Bx,By],[Cx,Cy],[Ax,Ay],[Bx,By]])
    ax.plot(verts[:,0], verts[:,1], color='#2980b9', lw=2.5)
    ax.fill(verts[:-1,0], verts[:-1,1], alpha=0.1, color='#2980b9')

    for (x,y,lbl,off) in [(Bx,By,'$B$',(-0.5,-0.5)),
                           (Cx,Cy,'$C$',(0.2,-0.5)),
                           (Ax,Ay,'$A$',(-0.3,0.3))]:
        ax.text(x+off[0], y+off[1], lbl, fontsize=12, fontweight='bold')

    # Side labels
    ax.text(a/2, -0.7, f'$a={a}$', ha='center', fontsize=10, color='#e74c3c')
    ax.text((Cx+Ax)/2+0.3, (Cy+Ay)/2, f'$b={b}$', ha='left', fontsize=10, color='#27ae60')
    ax.text((Ax+Bx)/2-0.5, (Ay+By)/2, f'$c={c:.2f}$', ha='right', fontsize=10, color='#8e44ad')

    ax.set_aspect('equal'); ax.grid(True, alpha=0.2)
    ax.set_title(f'Triangle {n}: $B={sol["B"]:.1f}°$, $C={sol["C"]:.1f}°$, $c={c:.2f}$',
                 fontsize=10)

plt.suptitle(f'Ambiguous case (SSA): $a={a}$, $b={b}$, $A={A_deg}°$ → 2 triangles',
             fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `solve_SSA` encodes the full case analysis — checking
whether $\sin B > 1$ (no solution), $\sin B = 1$ (one right triangle),
or $\sin B < 1$ (testing both $B_1$ and $\pi - B_1$). The test `C > 1e-10`
rejects any solution where the third angle would be zero or negative.
The two resulting triangles share the sides $a$ and $b$ and the angle $A$,
but have different shapes — the ambiguity is real, not a mathematical artifact.

---

### Area Formula

The same proof technique that gives the Law of Sines gives a useful
area formula. The height $h$ from vertex $C$ to side $c$ satisfies
$h = a\sin B = b\sin A$. Since area $= \frac{1}{2} \times \text{base} \times \text{height}$:

$$\text{Area} = \frac{1}{2}ab\sin C = \frac{1}{2}bc\sin A = \frac{1}{2}ac\sin B$$

Any two sides and their included angle gives the area.

**Hand-worked example:** $a = 8$, $b = 5$, $C = 60°$.

$$\text{Area} = \frac{1}{2}(8)(5)\sin 60° = 20 \times \frac{\sqrt{3}}{2} = 10\sqrt{3} \approx 17.32$$

```python
import math

def triangle_area(side1, side2, included_angle_deg):
    """Area = (1/2)*a*b*sin(C) for included angle C between sides a and b."""
    C = math.radians(included_angle_deg)
    return 0.5 * side1 * side2 * math.sin(C)

print("Triangle area from two sides and included angle:\n")
examples = [(8, 5, 60), (10, 7, 45), (6, 6, 90), (12, 9, 120)]
print(f"{'a':>5}  {'b':>5}  {'C':>6}  {'Area':>12}")
print("-" * 34)
for a, b, C in examples:
    area = triangle_area(a, b, C)
    print(f"{a:>5}  {b:>5}  {C:>5}°  {area:>12.4f}")

print()
# Manufacturing application: area of a triangular fixture plate
print("Fixture plate design:")
a, b, C_deg = 150, 200, 75   # mm, mm, degrees
area = triangle_area(a, b, C_deg)
print(f"  Sides {a}mm and {b}mm, included angle {C_deg}°")
print(f"  Plate area = {area:.1f} mm² = {area/100:.2f} cm²")
```

---

## Connect the Pieces

**What this lesson built on:** Sine function (Lessons 2.1–2.2). Angle sum
in a triangle $A+B+C=\pi$. Right-triangle trigonometry — the proof of
the Law of Sines uses the height of the triangle, computed via $\sin$.

**What this lesson makes possible:** Lesson 2.7 (Law of Cosines) handles
the cases the Law of Sines cannot — SSS and SAS — and together the two
laws solve any triangle. Stage 3 (Analytic Geometry) uses these laws for
vector problems. Stage 4 (Linear Algebra) uses the area formula as the
geometric interpretation of the cross product.

**In manufacturing and robotics:** the Law of Sines is used in fixture
design (computing distances between hole centres given angles), in robot
workspace analysis (reachable positions given arm link lengths and joint
angles), and in any triangulation measurement — including using two
known reference points to locate a part on a machine table.

---

## Summary

**Law of Sines:**
$$\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C} = 2R$$

**Applies to:** AAS, ASA, SSA.

**Solve AAS/ASA:** find third angle via $C=180°-A-B$, then use the ratio.

**Ambiguous case (SSA):** compute $\sin B = b\sin A/a$.
- $\sin B > 1$: no triangle
- $\sin B = 1$: one right triangle
- $\sin B < 1$, $a < b$: possibly two triangles (check both $B$ and $180°-B$)
- $\sin B < 1$, $a \geq b$: one triangle

**Area formula:**
$$\text{Area} = \tfrac{1}{2}ab\sin C$$

---

## Problems

### Math

**1.** Solve each triangle (find all missing sides and angles).

(a) $A = 35°$, $B = 72°$, $c = 20$

(b) $B = 48°$, $C = 67°$, $a = 15$

<details>
<summary>Answers</summary>

(a) $C=73°$. $a=c\sin A/\sin C=20\sin35°/\sin73°=12.00$. $b=20\sin72°/\sin73°=19.88$.

(b) $A=65°$. $b=15\sin48°/\sin65°=12.30$. $c=15\sin67°/\sin65°=15.24$.

</details>

---

**2.** Determine how many triangles exist, then solve completely.

(a) $a=9$, $b=12$, $A=35°$

(b) $a=15$, $b=10$, $A=40°$

(c) $a=6$, $b=10$, $A=30°$

<details>
<summary>Answers</summary>

(a) $\sin B=12\sin35°/9=0.765$. $B_1=49.9°$, $C_1=95.1°$, $c_1=15.58$. $B_2=130.1°$, $C_2=14.9°$, $c_2=4.02$. **Two triangles.**

(b) $\sin B=10\sin40°/15=0.4285$. $B_1=25.4°$ (acute), $C_1=114.6°$, $c_1=21.27$. $B_2=154.6°$: $C_2=180-40-154.6<0$ — **invalid**. **One triangle.**

(c) $\sin B=10\sin30°/6=0.833$. $B_1=56.4°$, $C_1=93.6°$, $c_1=11.97$. $B_2=123.6°$, $C_2=26.4°$, $c_2=5.33$. **Two triangles.**

</details>

---

**3.** Find the area of each triangle.

(a) $a=12$, $b=9$, $C=50°$

(b) $A=65°$, $B=48°$, $c=10$

<details>
<summary>Hints/Answers</summary>

(a) Area $= \frac{1}{2}(12)(9)\sin50° = 41.35$.

(b) Find sides first: $C=67°$. $a=10\sin65°/\sin67°=9.84$. $b=10\sin48°/\sin67°=8.07$.
Area $= \frac{1}{2}(9.84)(8.07)\sin65° = 36.07$. Or use $\frac{1}{2}ab\sin C = \frac{1}{2}(9.84)(8.07)\sin67° = 36.59$.

</details>

---

### Code Challenges

**Challenge 1 — Law of Sines solver**

```python
import math

def solve_AAS(A_deg, B_deg, a):
    """
    Solve a triangle given angles A, B and side a (opposite A).
    Returns dict with keys A, B, C (degrees), a, b, c (lengths).
    """
    pass

def solve_SSA(a, b, A_deg):
    """
    Solve triangle given sides a, b and angle A (opposite a).
    Returns list of solution dicts (0, 1, or 2 solutions).
    Each dict has keys B, C (degrees) and c (length).
    """
    pass


# --- tests: do not modify ---
# AAS test
sol = solve_AAS(40, 60, 10)
assert math.isclose(sol['C'], 80.0,    abs_tol=0.01)
assert math.isclose(sol['b'], 13.473,  abs_tol=0.01)
assert math.isclose(sol['c'], 15.321,  abs_tol=0.01)

# SSA - two solutions
sols = solve_SSA(7, 10, 30)
assert len(sols) == 2
c_vals = sorted(s['c'] for s in sols)
assert math.isclose(c_vals[0], 3.761,  abs_tol=0.01)
assert math.isclose(c_vals[1], 13.559, abs_tol=0.01)

# SSA - no solution
assert solve_SSA(3, 10, 30) == []

# SSA - one solution (a >= b)
sols2 = solve_SSA(12, 10, 40)
assert len(sols2) == 1

print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Triangle area calculator**

```python
import math

def area_two_sides_angle(a, b, C_deg):
    """Area = (1/2)*a*b*sin(C)."""
    pass

def area_AAS(A_deg, B_deg, a):
    """
    Find area given two angles A, B and side a (opposite A).
    First solve the triangle to find two sides and their included angle,
    then apply the area formula.
    """
    pass


# --- tests: do not modify ---
assert math.isclose(area_two_sides_angle(8, 5, 60),  10*math.sqrt(3), rel_tol=1e-9)
assert math.isclose(area_two_sides_angle(6, 6, 90),  18.0,            rel_tol=1e-9)

# Triangle with A=40°, B=60°, a=10
area = area_AAS(40, 60, 10)
assert math.isclose(area, 51.42, abs_tol=0.01), f"Got {area:.4f}"

print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Triangulation**

Two surveying stations $P_1$ and $P_2$ are 100 m apart. A landmark $L$
is visible from both stations. From $P_1$ the angle to $L$ is $\alpha$
from the baseline $P_1P_2$, and from $P_2$ it is $\beta$.

```python
import math

def triangulate(baseline, alpha_deg, beta_deg):
    """
    Find the distance from each station to the landmark,
    and the position of L relative to P1.
    
    baseline:   distance P1 to P2 (m)
    alpha_deg:  angle at P1 to landmark (from P1P2 baseline)
    beta_deg:   angle at P2 to landmark (from P2P1 baseline)
    
    Returns (d1, d2, Lx, Ly) where d1=|P1L|, d2=|P2L|,
    and (Lx, Ly) is L's position with P1 at origin and P2 at (baseline, 0).
    """
    pass


# --- tests: do not modify ---
# Equilateral case: alpha=beta=60° with baseline 100
d1, d2, Lx, Ly = triangulate(100, 60, 60)
assert math.isclose(d1, d2, rel_tol=1e-6)             # symmetric
assert math.isclose(Ly, 100*math.sqrt(3)/2, rel_tol=1e-6)  # height of equilateral

# Verify distances
d1, d2, Lx, Ly = triangulate(100, 50, 70)
# Check: |P2L| = sqrt((Lx-100)^2 + Ly^2)
d2_check = math.sqrt((Lx-100)**2 + Ly**2)
assert math.isclose(d2, d2_check, rel_tol=1e-6)

print("✓ Challenge 3 passed!")
```

<details>
<summary>Hint</summary>

The triangle has vertices $P_1$, $P_2$, $L$ with the baseline as side
$P_1P_2$. The angle at $P_1$ is $\alpha$, at $P_2$ is $\beta$, so
the angle at $L$ is $180° - \alpha - \beta$. Use the Law of Sines to
find $d_1 = |P_1L|$ and $d_2 = |P_2L|$. Then $L = (d_1\cos\alpha, d_1\sin\alpha)$.

</details>

---

### Extension

**4. ★** Prove the **extended law of sines:** $\dfrac{a}{\sin A} = 2R$
where $R$ is the circumradius (radius of the circle through all three vertices).

<details>
<summary>Answer</summary>

Let the circumscribed circle have centre $O$ and radius $R$. Place the
circle with $A$ on the circle. The central angle subtending arc $BC$
(not containing $A$) is $2A$ by the inscribed angle theorem. The chord
$a = BC = 2R\sin A$ (chord length = $2R\sin(\text{half central angle})$
= $2R\sin A$). Therefore $a/\sin A = 2R$. $\blacksquare$

</details>

**5. ★** The **area of a triangle** can also be written as:

$$\text{Area} = \frac{a^2 \sin B \sin C}{2\sin A}$$

Derive this from the Law of Sines and the formula Area $= \frac{1}{2}bc\sin A$.

<details>
<summary>Answer</summary>

From Law of Sines: $b = \frac{a\sin B}{\sin A}$ and $c = \frac{a\sin C}{\sin A}$.

Substituting into Area $= \frac{1}{2}bc\sin A$:

$$\text{Area} = \frac{1}{2}\cdot\frac{a\sin B}{\sin A}\cdot\frac{a\sin C}{\sin A}\cdot\sin A = \frac{a^2\sin B\sin C}{2\sin A} \qquad \blacksquare$$

</details>
