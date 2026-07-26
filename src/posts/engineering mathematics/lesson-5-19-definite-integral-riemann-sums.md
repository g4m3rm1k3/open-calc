# Stage 5, Lesson 5.19 — The Definite Integral: Riemann Sums and Area
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Chapter 5A spent twelve lessons on the derivative — the rate of
change. Chapter 5B opens with calculus's other half: the **integral**
— accumulated total, most concretely, the exact area under a curve.
This is not a new idea to this curriculum: Lesson 3.4 estimated an
ellipse's perimeter by summing many short straight segments, watching
the estimate converge as the segment count grew; Lesson 2 proved
$\pi$ could be squeezed between polygon perimeters, Archimedes-style.
Both were **Riemann sums** in disguise, without the name. This lesson
gives that technique its formal name, its precise limit-based
definition (using exactly Lesson 1's limit machinery), and its
notation — $\int_a^b f(x)\,dx$, where the $dx$ is no longer a vague
symbol but Lesson 8's differential, doing genuine notational work.
By the end of this lesson you can build left, right, midpoint, and
trapezoidal Riemann sum approximations, understand precisely how they
converge to the exact definite integral as the number of rectangles
grows, and recognize this as the same convergence phenomenon already
witnessed twice before in this curriculum.

---

## Historical Context

Archimedes' method for bounding a circle's area and $\pi$ (Lesson
5.2's history) — inscribing and circumscribing polygons and watching
bounds converge as the polygon count grows — is, in every essential
respect, a Riemann sum, applied by hand nearly 2000 years before the
name existed. Newton and Leibniz's 17th-century calculus treated area
computation as the *inverse* of differentiation (the subject of
Lesson 14's Fundamental Theorem), a genuinely different, more
powerful viewpoint than direct summation — but it was Bernhard
Riemann, in 1854, who gave the direct summation approach its first
fully rigorous definition, precise enough to handle functions far
more badly-behaved than anything Newton or Leibniz considered,
cementing "Riemann sum" as the name for exactly the technique this
lesson formalizes.

---

## What You Need To Know First

- **Limits, precisely defined** — Lesson 1. The definite integral
  is a limit, in exactly that lesson's sense.
- **The ellipse perimeter estimate, converging as segment count
  grows** — Lesson 3.4, the direct conceptual ancestor of this
  lesson's Riemann sums.
- **Archimedes' polygon-squeeze proof of $\lim\sin x/x=1$** — Lesson
  5.2, the same convergence-by-refinement idea.
- **Differentials, $dx$'s precise meaning** — Lesson 8.

---

## The Lesson

### The Area Problem

How much area lies under $y=f(x)$, above the $x$-axis, between
$x=a$ and $x=b$? For a rectangle or triangle, elementary geometry
answers directly. For a curve, there's no such direct formula — but
there is a systematic way to **approximate** it, and — crucially —
to make that approximation exact by taking a limit.

**Divide $[a,b]$ into $n$ equal subintervals**, each of width
$\Delta x=\dfrac{b-a}{n}$. In each subinterval, build a rectangle
whose height is $f$ evaluated at some point in that subinterval, and
sum the rectangles' areas.

```python
import numpy as np
import matplotlib.pyplot as plt

f = lambda x: x**2 + 1
a, b, n = 0, 2, 8
dx = (b - a) / n

fig, axes = plt.subplots(1, 3, figsize=(15, 5))
x_smooth = np.linspace(a, b, 300)

for ax, method, title in zip(axes, ['left', 'right', 'mid'],
                               ['Left Riemann sum', 'Right Riemann sum', 'Midpoint Riemann sum']):
    ax.plot(x_smooth, f(x_smooth), color='#2980b9', lw=2)
    total = 0
    for i in range(n):
        x_left = a + i*dx
        if method == 'left':
            height = f(x_left)
        elif method == 'right':
            height = f(x_left + dx)
        else:
            height = f(x_left + dx/2)
        total += height * dx
        ax.add_patch(plt.Rectangle((x_left, 0), dx, height,
                                     facecolor='#e74c3c', alpha=0.3, edgecolor='#333'))
    ax.set_title(f'{title}\nEstimate: {total:.4f}', fontsize=10)

plt.tight_layout()
plt.show()
```

**Walkthrough.** This reuses `plt.Rectangle` and `ax.add_patch`
exactly as introduced in Lesson 3.2 for drawing a machined block's
outline — the identical plotting tool, now stacking many rectangles
to approximate a curved region instead of drawing one CAD feature.
The three methods — left, right, midpoint — differ only in *where*
within each subinterval the height is sampled; all three converge to
the same value as $n$ grows, though at different rates (midpoint
converges fastest, a genuine parallel to Lesson 3's finding that
*central* difference outperforms one-sided difference).

---

### Sigma Notation

Formally, a Riemann sum is written:

$$\sum_{i=1}^{n} f(x_i^*)\,\Delta x$$

where $\Sigma$ (capital Greek sigma) means "sum the following
expression for each integer $i$ from the lower limit to the upper
limit," and $x_i^*$ denotes whichever sample point convention is
used (left endpoint, right endpoint, midpoint) within subinterval
$i$. This notation compresses "add up $n$ terms, one per rectangle"
into one compact expression — the same compression `sum(...)` or
`np.sum(...)` performs in code.

```python
def riemann_sum(f, a, b, n, method='left'):
    dx = (b - a) / n
    total = 0
    for i in range(n):
        x_left = a + i*dx
        if method == 'left':
            sample = x_left
        elif method == 'right':
            sample = x_left + dx
        elif method == 'mid':
            sample = x_left + dx/2
        total += f(sample) * dx
    return total

f = lambda x: x**2 + 1
for n in [4, 16, 64, 256, 1024]:
    estimate = riemann_sum(f, 0, 2, n, 'mid')
    print(f"n={n:<6} midpoint estimate: {estimate:.8f}")
```

Output:

```
n=4      midpoint estimate: 6.62500000
n=16     midpoint estimate: 6.66406250
n=64     midpoint estimate: 6.66650391
n=256    midpoint estimate: 6.66665649
n=1024   midpoint estimate: 6.66666604
```

The estimate is visibly converging toward $\dfrac{20}{3}\approx
6.6\overline{6}$ — the exact area, which Lesson 14 will show how to
compute directly, without any summation at all.

---

### The Definite Integral: A Limit of Riemann Sums

$$\int_a^b f(x)\,dx = \lim_{n\to\infty}\sum_{i=1}^n f(x_i^*)\,\Delta x$$

This is a genuine limit in Lesson 1's precise sense — as $n\to
\infty$ (equivalently, as $\Delta x\to0$), the Riemann sum approaches
one specific number, **provided $f$ is continuous** (a sufficient,
though not strictly necessary, condition — the full theory of exactly
which functions are "integrable" is Riemann's own deeper
contribution, beyond this lesson's scope). The integral sign $\int$
is a stretched "S" for "sum" — Leibniz's own notation, chosen
deliberately to evoke the Riemann-sum limit it represents, the same
way his $dy/dx$ notation was chosen to evoke a ratio (Lesson 3's
history). The $dx$ inside the integral is precisely Lesson 8's
differential — no longer a symbol tacked on by convention, but the
literal limiting case of the finite $\Delta x$ used to build each
Riemann sum.

```python
import sympy as sp

x = sp.symbols('x')
exact = sp.integrate(x**2 + 1, (x, 0, 2))
print(f"Exact value via sp.integrate: {exact}")
print(f"As a decimal: {float(exact):.8f}")
```

```
Exact value via sp.integrate: 20/3
As a decimal: 6.66666667
```

Confirming the Riemann sum's convergent target exactly — `sp.integrate`
is a first appearance, computing the definite integral symbolically;
Lesson 14 explains *how* it works internally (the Fundamental
Theorem, not literally summing infinitely many rectangles), but as a
verification tool here it confirms the numerical convergence observed
above.

---

### This Is Exactly Lesson 3.4's Ellipse Perimeter Technique

Lesson 3.4's `ellipse_perimeter_numeric` summed the straight-line
distance between many closely-spaced points along an ellipse,
watching the estimate converge as the point count grew — structurally
**identical** to a Riemann sum, just measuring arc length instead of
area:

```python
# Side-by-side structural comparison
def area_riemann_sum(f, a, b, n):
    """Structurally identical to Lesson 3.4's perimeter estimator."""
    dx = (b-a)/n
    return sum(f(a + i*dx + dx/2) * dx for i in range(n))

def perimeter_estimate(a, b, n_points):
    """Lesson 3.4's technique, shown again for direct comparison."""
    import numpy as np
    t = np.linspace(0, 2*np.pi, n_points)
    x = a * np.cos(t)
    y = b * np.sin(t)
    points = list(zip(x, y))
    total = 0.0
    for (x1,y1),(x2,y2) in zip(points, points[1:]):
        total += math.hypot(x2-x1, y2-y1)
    return total

print("Both techniques: refine a partition, sum small contributions, watch convergence.")
print(f"Area (n=1000):      {area_riemann_sum(lambda x: x**2+1, 0, 2, 1000):.6f}")
print(f"Perimeter (n=1000): {perimeter_estimate(5, 3, 1000):.6f}")
```

**Walkthrough.** This isn't a coincidence pointed out for its own
sake — it's the precise, general pattern this entire lesson exists to
name: **any** quantity built by "partition into small pieces, compute
something for each piece, sum, refine the partition" is a Riemann sum
in disguise, whether it's measuring area, arc length, volume (Lesson
5.19), or work (also Lesson 19). Lesson 3.4 built and used this
technique a full two stages before it had a name — now it has one.

---

### Signed Area and Properties

If $f(x)<0$ on some part of $[a,b]$, the corresponding rectangles
have **negative** height, contributing **negative** area to the sum —
the definite integral measures **signed** area (area above the axis
counts positive, below counts negative), not literal geometric area.

**Key properties**, each provable directly from the Riemann-sum
definition:

$$\int_a^b [f(x)+g(x)]\,dx = \int_a^b f(x)\,dx + \int_a^b g(x)\,dx \qquad \text{(linearity, from the sum splitting term by term)}$$
$$\int_a^b cf(x)\,dx = c\int_a^b f(x)\,dx$$
$$\int_a^b f(x)\,dx = \int_a^c f(x)\,dx + \int_c^b f(x)\,dx \qquad \text{(additivity over sub-intervals, } a<c<b\text{)}$$
$$\int_a^b f(x)\,dx = -\int_b^a f(x)\,dx$$

```python
import sympy as sp

x = sp.symbols('x')
f = sp.sin(x)
# Area under sin(x) from 0 to 2π: should be exactly 0 (equal positive/negative lobes)
result = sp.integrate(f, (x, 0, 2*sp.pi))
print(f"∫₀^2π sin(x) dx = {result}  (positive and negative halves cancel exactly)")
```

---

### Manufacturing Application: Estimating Material Removal from a Toolpath Profile

A pocket-milling operation removes material bounded above by the
stock surface and below by a machined profile $f(x)$ (assume, for
this cross-sectional estimate, a simple 2D slice). The removed
cross-sectional area is directly a definite integral, and if the
profile is only known from **measured or scanned data points**
(rather than a clean formula), a Riemann sum built from that data is
the *only* practical way to estimate it.

```python
import numpy as np

# Simulated scanned profile depths (mm) at evenly spaced x positions
x_data = np.linspace(0, 50, 26)   # 26 points, 2mm apart
depth_data = 5*np.sin(x_data/10) + 5   # a wavy pocket profile, always positive

dx = x_data[1] - x_data[0]
# Trapezoidal Riemann sum -- averages left and right heights per interval,
# generally more accurate than plain left/right for smooth data
area_trapezoidal = np.trapz(depth_data, x_data)
area_left = np.sum(depth_data[:-1]) * dx

print(f"Left Riemann sum estimate:  {area_left:.4f} mm²")
print(f"Trapezoidal estimate:       {area_trapezoidal:.4f} mm²")

material_density = 0.0027   # g/mm³, aluminum
part_width = 30   # mm, out-of-plane depth
volume = area_trapezoidal * part_width
mass_removed = volume * material_density
print(f"\nEstimated material removed: {volume:.2f} mm³ ({mass_removed:.2f} g)")
```

**Walkthrough.** `np.trapz` is a first appearance: it implements the
**trapezoidal rule**, a Riemann-sum variant using trapezoids
(averaging each interval's left and right heights) instead of flat-
topped rectangles — generally more accurate than a plain left or
right sum for smooth data, at essentially no extra cost, which is why
real numerical integration tools default to it rather than the
simpler rectangle methods shown earlier in this lesson. This section
directly demonstrates the practical necessity flagged at the top of
this lesson: real scanned/measured profiles have **no formula** to
integrate symbolically — a Riemann-sum-family method applied directly
to the data points is the only available option, exactly the same
constraint Lesson 3.4 faced with a raw point cloud instead of a clean
ellipse equation.

---

## Connect the Pieces

Concrete trace: estimating material removed from a scanned pocket
profile.

1. **Partition**: the scanned data's 26 evenly-spaced points define
   25 subintervals — a Riemann-sum partition, imposed by the
   measurement itself rather than chosen freely.
2. **Sum**: `np.trapz` computes a refined (trapezoidal) Riemann sum
   directly from the data — no formula for $f(x)$ ever needed.
3. **Convergence context**: the earlier $x^2+1$ example showed this
   same summing process converging to an exact value as the partition
   refines — here, the partition is fixed by how densely the part was
   scanned, but the underlying mathematics is identical.
4. **Physical result**: signed area becomes real volume becomes real
   mass — a genuine manufacturing quantity, computed by exactly the
   technique Lesson 3.4 used, unnamed, for an ellipse's perimeter two
   stages earlier.

---

## Summary

**Riemann sum**: $\sum_{i=1}^n f(x_i^*)\Delta x$ — rectangles
approximating area under a curve; left/right/midpoint differ only in
sample-point choice.

**Definite integral**: $\int_a^b f(x)\,dx=\lim_{n\to\infty}
\sum f(x_i^*)\Delta x$ — a genuine limit (Lesson 1), with $dx$
precisely Lesson 8's differential.

**Signed area**: negative $f$ contributes negative area.

**Properties**: linearity, additivity over subintervals, sign flip on
reversed limits — all direct consequences of the sum definition.

**Trapezoidal rule**: `np.trapz`, a more accurate Riemann-sum variant
for smooth data — the practical tool for real, measured profiles with
no underlying formula.

**Direct callback**: Lesson 3.4's ellipse perimeter estimator was
always a Riemann sum, unnamed — the identical partition-sum-refine
pattern, now formalized and given its proper name and notation.

**New Python/CS concepts:**
- `sp.integrate` — symbolic definite integration (mechanism deferred
  to Lesson 14)
- `np.trapz` — trapezoidal numerical integration

---

## Problems

### Math

**1.** Write out (don't evaluate) the left Riemann sum for
$\int_1^5 x^2\,dx$ using $n=4$ rectangles, showing each term.

<details><summary>Answer</summary>
$\Delta x=1$. Left points: $1,2,3,4$. Sum:
$f(1)(1)+f(2)(1)+f(3)(1)+f(4)(1) = 1+4+9+16=30$.
</details>

---

**2.** Without computing anything, explain why the midpoint Riemann
sum for $f(x)=x^2$ (concave up, Lesson 11) **underestimates** the
true area, while the trapezoidal estimate **overestimates** it.

<details><summary>Answer</summary>
For a concave-up function, the curve bows *below* the straight
secant line connecting the two endpoints of each trapezoid,
meaning the trapezoid's area is slightly larger than the true area
under the curve on that interval — overestimate. The midpoint
rectangle's flat top, by contrast, cuts *above* part of the concave-
up curve near each subinterval's edges and below it near the
midpoint in a way that (for concave-up functions specifically) nets
out to slightly less area than the true curve — underestimate. (This
relationship flips for concave-down functions.)
</details>

---

**3.** If $\int_0^4 f(x)\,dx=10$ and $\int_0^4 g(x)\,dx=3$, find
$\int_0^4[2f(x)-g(x)]\,dx$.

<details><summary>Answer</summary>
$2(10)-3=17$, directly from linearity.
</details>

---

### Code Challenges

**Challenge 1 — Riemann sum with convergence tracking**

```python
def riemann_sum_v2(f, a, b, n, method='left'):
    """Reimplement riemann_sum from the lesson."""
    pass

def convergence_table(f, a, b, n_values, method='mid'):
    """Return a list of (n, estimate) pairs."""
    pass

# --- tests: do not modify ---
f = lambda x: x**2 + 1
table = convergence_table(f, 0, 2, [4, 64, 1024])
assert abs(table[-1][1] - 20/3) < 0.001
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Trapezoidal rule from scratch**

```python
def trapezoidal_rule(x_values, y_values):
    """
    Reimplement np.trapz's logic: sum of (avg height * width) for
    each interval, given possibly-unevenly-spaced x_values.
    """
    pass

# --- tests: do not modify ---
import numpy as np
x = np.linspace(0, 2, 100)
y = x**2 + 1
result = trapezoidal_rule(x, y)
assert math.isclose(result, 20/3, abs_tol=0.001)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Material removal estimator**

```python
import numpy as np

def estimate_removed_volume(x_data, depth_data, part_width):
    """Reimplement the lesson's trapezoidal material-removal estimate."""
    pass

# --- tests: do not modify ---
x_data = np.linspace(0, 50, 26)
depth_data = np.full(26, 5.0)   # constant depth: exact area is trivial to check
volume = estimate_removed_volume(x_data, depth_data, 30)
assert math.isclose(volume, 50*5*30, rel_tol=0.01)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove the additivity property
$\int_a^b f\,dx=\int_a^c f\,dx+\int_c^b f\,dx$ directly from the
Riemann sum definition, for the case where $c$ happens to coincide
exactly with one of the partition points used to build the sum on
$[a,b]$ (a simplifying but genuinely instructive special case).

<details><summary>Answer</summary>
Partition $[a,b]$ into $n$ equal subintervals, and suppose $c=a+k
\Delta x$ for some integer $k$ (i.e., $c$ lands exactly on the
$k$-th partition point). The Riemann sum over $[a,b]$ is
$$\sum_{i=1}^n f(x_i^*)\Delta x = \sum_{i=1}^k f(x_i^*)\Delta x + \sum_{i=k+1}^n f(x_i^*)\Delta x$$
— simply splitting the sum at index $k$, which is always valid for
any finite sum regardless of what the terms represent. The first
piece is exactly the Riemann sum for $[a,c]$ (using the same
$\Delta x$, since $c-a=k\Delta x$ evenly divides into $k$
subintervals of that width); the second is exactly the Riemann sum
for $[c,b]$. Taking $n\to\infty$ (with $k$ scaling proportionally so
$c$ stays fixed) on both sides gives
$\int_a^bf\,dx=\int_a^cf\,dx+\int_c^bf\,dx$. $\blacksquare$ The
general case, where $c$ doesn't land exactly on a partition point for
every $n$, needs a slightly more careful limiting argument but follows
the same idea.
</details>
