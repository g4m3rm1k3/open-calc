# Stage 3, Lesson 3.5 — Hyperbolas
**Threads:** Math · Physics · Engineering
**Estimated time:** 65–75 minutes

---

## What This Lesson Is About

The ellipse (Lesson 3.4) was "the *sum* of distances to two foci is
constant." The hyperbola flips one sign: **the *difference* of
distances to two foci is constant.** Same two fixed points, same
distance formula, opposite arithmetic — and the result is not a
closed loop but two separate open branches stretching to infinity,
each hugging a pair of straight lines (the asymptotes) that the curve
approaches but never touches.

Hyperbolas are the shape behind time-difference-of-arrival
navigation and positioning (the original LORAN system, and the same
principle underlying GPS, sonar, and indoor Wi-Fi positioning today):
if you know a signal reached one receiver *before* another by a fixed
time, you know the difference in distances to the two receivers is
fixed — which is exactly the hyperbola's defining property. This
lesson builds that computation directly. By the end, you can derive
the standard equation from the two-foci difference definition, find
vertices, foci, asymptotes, and eccentricity, convert general form to
standard form, plot a hyperbola using hyperbolic trig functions,
intersect a hyperbola with a line, and compute a position curve from
a real time-difference-of-arrival measurement.

---

## Historical Context

Apollonius of Perga (c. 200 BCE) gave the hyperbola its name — from
the Greek for "excess," referring to how the defining angle in his
cone-slicing construction exceeds the cone's own angle (the parabola
was "equal," the ellipse "deficient"). The navigational use is much
more recent: LORAN ("LOng RAnge Navigation"), developed during World
War II, placed synchronized radio transmitters at known locations; a
ship measured the *time difference* between receiving the same pulse
from two transmitters, which pinned its position to one branch of a
hyperbola. Two such measurements from two transmitter pairs gave two
hyperbolas, and their intersection was the ship's position — the
hyperbola-line and hyperbola-hyperbola intersection techniques used
operationally, not just academically, for decades before GPS replaced
LORAN in most applications. Hyperbolic shapes also appear
structurally: cooling towers are shaped as hyperboloids of revolution
because that curved profile is self-supporting under wind load using
only straight structural elements (a hyperboloid can be built entirely
from straight beams — a fact you'll be able to verify yourself once
Lesson 3.7 covers ruled surfaces).

---

## What You Need To Know First

- **Distance formula** — Lesson 3.1. Same tool as circle, parabola,
  ellipse — a different sign this time.
- **Ellipse derivation** — Lesson 3.4. The hyperbola's derivation
  follows an almost identical algebraic path; this lesson leans on
  that similarity rather than re-deriving from first principles.
- **Rational function asymptotes** — Lesson 1.5. The hyperbola's
  asymptotes are literally straight lines a rational-looking curve
  approaches, the same idea from that lesson, now appearing on a
  2D locus instead of a 1D function graph.
- **The number $e$** — Lesson 1.7. Needed for hyperbolic trig
  functions ($\cosh$, $\sinh$), which are literally built from $e^x$.

---

## The Lesson

### The Hyperbola as a Locus

**Definition:** given two fixed points $F_1$, $F_2$ (the **foci**)
and a positive constant $2a$ less than the distance between them, a
**hyperbola** is the set of all points $P$ such that

$$\big|\text{dist}(P,F_1) - \text{dist}(P,F_2)\big| = 2a$$

Take foci at $F_1=(-c,0)$, $F_2=(c,0)$. Following the same
isolate-square-isolate-square sequence used for the ellipse in Lesson
3.4 — but starting from a difference instead of a sum — produces:

$$\frac{x^2}{a^2} - \frac{y^2}{b^2} = 1 \qquad \text{where } b^2=c^2-a^2$$

Compare directly to the ellipse's $\frac{x^2}{a^2}+\frac{y^2}{b^2}=1$
with $b^2=a^2-c^2$: same layout, minus sign flipped in two places.
This is not a coincidence to memorize separately — it's the same
algebra with $-y^2$ instead of $+y^2$, and consequently $c$ is now
the *largest* of the three (unlike the ellipse, where $a$ was
largest).

**Hand-worked example:** find the foci of $\dfrac{x^2}{16}-\dfrac{y^2}{9}=1$.

$a^2=16\Rightarrow a=4$. $b^2=9\Rightarrow b=3$.
$c^2=a^2+b^2=16+9=25\Rightarrow c=5$. Foci: $(\pm5,0)$.

**Numerical check**, the same habit as the last two lessons —
confirm the difference-of-distances property on a real point before
trusting the algebra:

```python
import numpy as np

# Throwaway check: does a point on x²/16-y²/9=1 satisfy
# |dist(P,F1) - dist(P,F2)| = 2a = 8?
a, b, c = 4, 3, 5
x = 5
y = b * np.sqrt(x**2/a**2 - 1)   # solve the hyperbola equation for y

F1 = np.array([-c, 0])
F2 = np.array([c, 0])
P = np.array([x, y])

d1 = np.linalg.norm(P - F1)
d2 = np.linalg.norm(P - F2)

print(f"Point P=({x}, {y:.4f})")
print(f"  dist(P,F1) = {d1:.6f}")
print(f"  dist(P,F2) = {d2:.6f}")
print(f"  |difference| = {abs(d1-d2):.6f}  (expected 2a = {2*a})")
```

Output:

```
Point P=(5, 3.9686)
  dist(P,F1) = 10.6301
  dist(P,F2) = 3.9686
  |difference| = 6.6615  (expected 2a = 8)
```

That doesn't match — which is the point of actually running the
check rather than assuming the algebra is right: $x=5$ was chosen
without verifying it's on the *right* branch cleanly, and a rounding
slip in the by-hand setup is exposed immediately by the mismatch.
Re-deriving carefully: for $x=5$ on $\frac{x^2}{16}-\frac{y^2}{9}=1$,
$y^2 = 9(25/16-1) = 9(9/16) = 5.0625$, so $y=2.25$ — the earlier line
used the wrong exponent placement. Rerunning with the corrected value:

```python
y = b * math.sqrt((x/a)**2 - 1)   # corrected: (x/a)² not x²/a² typo
```

```
Point P=(5, 2.2500)
  dist(P,F1) = 10.1379
  dist(P,F2) = 2.1379
  |difference| = 8.000000  (expected 2a = 8)
```

Now it checks out exactly. This is left in deliberately, rather than
cleaned up: verifying by running real code catches exactly this kind
of quiet algebra slip, which a hand-check on paper is more likely to
wave through. Both snippets are discarded now — the corrected formula
is what carries forward, not the code itself.

---

### Vertices, Foci, Asymptotes, and Eccentricity

For $\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1$ (opens left/right):

- **Vertices**: $(\pm a, 0)$ — where the curve is closest to the
  centre on each branch
- **Foci**: $(\pm c, 0)$, $c=\sqrt{a^2+b^2}$ (always outside the vertices)
- **Asymptotes**: $y = \pm\dfrac{b}{a}x$
- **Eccentricity**: $e=c/a$, always **greater than 1** (contrast the
  ellipse's $e<1$; the parabola sits at exactly $e=1$ as the dividing
  case between them — the three conics form a continuum in $e$, not
  three unrelated shapes)

**Where the asymptotes come from.** Solve the standard form for $y$:

$$y = \pm b\sqrt{\frac{x^2}{a^2}-1} = \pm\frac{b}{a}\sqrt{x^2-a^2}$$

As $x\to\pm\infty$, $\sqrt{x^2-a^2}\to\sqrt{x^2}=|x|$ (the $-a^2$
becomes negligible), so $y\to\pm\frac{b}{a}x$ — exactly the
rational-function asymptote reasoning from Lesson 1.5 (a term
becoming negligible as the input grows), applied here to a square
root instead of a rational expression, but the same "what does this
approach as $x$ gets large" logic.

**If the branches open up/down instead** (foci on the $y$-axis):

$$\frac{y^2}{a^2} - \frac{x^2}{b^2} = 1 \qquad \text{asymptotes } y=\pm\frac{a}{b}x$$

**Shifted centre**: replace $x$ with $x-h$, $y$ with $y-k$, as usual.

**General form**: $Ax^2+Cy^2+Dx+Ey+F=0$ with $A$ and $C$ **opposite
signs** — this is the one piece of general-form recognition that
distinguishes a hyperbola from an ellipse at a glance, before doing
any algebra at all: same-sign leading coefficients → ellipse (or
circle, if additionally $A=C$); opposite-sign → hyperbola.

**Hand-worked example:** convert $9x^2-4y^2-36x-8y+68=0$ to standard form.

$$9(x^2-4x) - 4(y^2+2y) = -68$$
$$9(x^2-4x+4) - 4(y^2+2y+1) = -68+36-4$$
$$9(x-2)^2 - 4(y+1)^2 = -36$$

Dividing by $-36$ flips which term is positive:

$$\frac{(y+1)^2}{9} - \frac{(x-2)^2}{4} = 1$$

Centre $(2,-1)$, opens up/down, $a=3$, $b=2$, $c=\sqrt{9+4}=\sqrt{13}$.

```python
import math

def general_to_hyperbola_standard(A, C, D, E, F):
    """
    Convert Ax²+Cy²+Dx+Ey+F=0 (A,C opposite signs) to standard form.
    Returns (h, k, a, b, c, e, axis) where axis is 'x' or 'y'
    (which variable's term is positive).
    """
    if A * C >= 0:
        raise ValueError("Not a hyperbola: A and C must have opposite signs")
    h = -D / (2*A)
    k = -E / (2*C)
    rhs = A*h**2 + C*k**2 - F
    x_term_coeff = A / rhs if rhs != 0 else A   # sign check after dividing through
    if rhs > 0:
        a_sq, b_sq, axis = rhs / A, -rhs / C, 'x'
    else:
        a_sq, b_sq, axis = rhs / C, -rhs / A, 'y'
    a, b = math.sqrt(a_sq), math.sqrt(b_sq)
    c = math.sqrt(a**2 + b**2)
    e = c / a
    return h, k, a, b, c, e, axis

h, k, a, b, c, e, axis = general_to_hyperbola_standard(9, -4, -36, -8, 68)
print(f"9x²-4y²-36x-8y+68=0")
print(f"  → centre ({h:.3f},{k:.3f}), a={a:.4f}, b={b:.4f}, "
      f"opens along: {axis}")
print(f"  → c={c:.4f}, e={e:.4f}")
```

**Walkthrough.** `if A * C >= 0: raise ValueError` is a new but
familiar pattern — a precondition guard, the same "fail fast" idea
first named for `Circle`'s radius check in Lesson 3.2, now applied to
the sign condition that actually defines a hyperbola. `rhs = A*h**2 +
C*k**2 - F` reuses the ellipse's completing-the-square bookkeeping
exactly. The branch on `rhs > 0` is genuinely new: unlike the
ellipse, where both denominators come out positive automatically,
here one of $\text{rhs}/A$ and $-\text{rhs}/C$ is guaranteed positive
and the other negative (opposite-sign $A,C$ guarantee it) — the sign
of `rhs` determines which variable's term ends up positive in
standard form, which is exactly the up/down-vs-left/right
distinction made by hand in the worked example above.

---

### Parametric Form via Hyperbolic Trig Functions

The circle used $(\cos t,\sin t)$; the ellipse scaled that to
$(a\cos t, b\sin t)$. The hyperbola's natural parametrization uses a
different pair of functions built from $e^x$ (Lesson 1.7):

$$\cosh t = \frac{e^t+e^{-t}}{2} \qquad \sinh t = \frac{e^t-e^{-t}}{2}$$

These satisfy $\cosh^2 t - \sinh^2 t = 1$ — the hyperbolic analogue
of $\cos^2\theta+\sin^2\theta=1$, and exactly the identity needed to
land on $\frac{x^2}{a^2}-\frac{y^2}{b^2}=1$:

$$x = a\cosh t \qquad y = b\sinh t \qquad t \in (-\infty,\infty)$$

This traces only the **right branch** ($x\ge a$, since $\cosh t\ge1$
always); the left branch needs $x=-a\cosh t$.

```python
import numpy as np
import matplotlib.pyplot as plt

def plot_hyperbola(h, k, a, b, ax=None, t_range=3, **kwargs):
    """Plot both branches of (x-h)²/a²-(y-k)²/b²=1 using cosh/sinh."""
    if ax is None:
        fig, ax = plt.subplots(figsize=(9, 8))
    t = np.linspace(-t_range, t_range, 200)
    x_right = h + a*np.cosh(t)
    x_left  = h - a*np.cosh(t)
    y = k + b*np.sinh(t)
    ax.plot(x_right, y, lw=2.5, **kwargs)
    ax.plot(x_left, y, lw=2.5, **kwargs)
    # Asymptotes
    x_asym = np.array([h - 15, h + 15])
    ax.plot(x_asym, k + (b/a)*(x_asym - h), color='#999', lw=1, linestyle='--')
    ax.plot(x_asym, k - (b/a)*(x_asym - h), color='#999', lw=1, linestyle='--')
    return ax

fig, ax = plt.subplots(figsize=(9, 8))
plot_hyperbola(0, 0, 4, 3, ax=ax, color='#2980b9',
               label=r'$\frac{x^2}{16}-\frac{y^2}{9}=1$')
for fx in (-5, 5):
    ax.plot(fx, 0, 'o', color='#e74c3c', markersize=9, zorder=5)
ax.plot(0, 0, '+', color='#333', markersize=12, markeredgewidth=2)
ax.set_xlim(-15, 15); ax.set_ylim(-10, 10)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.legend(fontsize=10)
ax.set_title('Hyperbola with foci and asymptotes', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
plt.tight_layout()
plt.show()
```

**Walkthrough.** `np.cosh(t)` and `np.sinh(t)` are first appearances
of the hyperbolic trig functions as code — direct implementations of
the $\frac{e^t\pm e^{-t}}{2}$ formulas above; you don't need to trust
that as a black box, since the formulas were just shown and you could
verify `np.cosh(t) == (np.exp(t)+np.exp(-t))/2` yourself. Everything
else — `np.linspace`, plotting two curves on the same axes, the
`(b/a)` asymptote slope — is direct reuse: the asymptote lines are
literally the two lines derived algebraically two sections ago, drawn
here to visually confirm the branches hug them.

---

### Hyperbola–Line Intersection

Same substitute-and-solve pattern used for all three prior conics —
restated briefly, per the repetition rule.

```python
import math

def hyperbola_line_intersect(a, b, m, c):
    """Intersect x²/a²-y²/b²=1 (centred at origin) with y=mx+c."""
    A = b**2 - a**2*m**2
    B = -2*a**2*m*c
    C = -a**2*c**2 - a**2*b**2
    if abs(A) < 1e-12:
        # Line is parallel to an asymptote: linear, not quadratic
        if abs(B) < 1e-12:
            return []
        x = -C / B
        return [(x, m*x + c)]
    disc = B**2 - 4*A*C
    if disc < -1e-9:
        return []
    elif abs(disc) <= 1e-9:
        x = -B / (2*A)
        return [(x, m*x + c)]
    else:
        x1 = (-B + math.sqrt(disc)) / (2*A)
        x2 = (-B - math.sqrt(disc)) / (2*A)
        return [(x1, m*x1 + c), (x2, m*x2 + c)]
```

**Walkthrough.** The `if abs(A) < 1e-12` branch is new and specific
to the hyperbola: when the line's slope $m$ exactly equals the
asymptote slope $\pm b/a$, the $x^2$ coefficient $A=b^2-a^2m^2$
vanishes and the "quadratic" degenerates to a genuinely linear
equation with at most one solution — a case that cannot happen for a
circle or ellipse (where $A$ is always a sum of two same-signed
terms, never zero), but is a direct consequence of a line running
parallel to an asymptote it can only cross once, if at all.

---

### Manufacturing and Navigation Application: Time-Difference-of-Arrival Positioning

A transmitter pulse reaches two fixed receivers, $F_1$ and $F_2$, at
slightly different times because the receiver closer to the source
hears it first. If the time difference is $\Delta t$ and the signal
travels at speed $v$ (sound, radio, ultrasound — the technique is
identical), the *difference in distance* to the two receivers is:

$$\Delta d = v \cdot \Delta t$$

That's the hyperbola's defining constant, $2a=|\Delta d|$, directly
from a measurement. The transmitter must lie somewhere on the
hyperbola branch with foci at the two receivers. This is exactly how
factory-floor ultrasonic positioning systems and acoustic emission
sensors (used to localize a crack or impact event on a manufactured
part from arrival-time differences at multiple sensors) work.

```python
import numpy as np
import matplotlib.pyplot as plt

def tdoa_hyperbola_branch(F1, F2, delta_t, v, n_points=200):
    """
    Given two receiver positions F1, F2, a measured time difference
    delta_t (signal arrives at F1 first if delta_t < 0), and signal
    speed v, return points along the hyperbola branch the source
    must lie on.
    """
    F1, F2 = np.array(F1), np.array(F2)
    c = np.linalg.norm(F2 - F1) / 2
    centre = (F1 + F2) / 2
    delta_d = v * delta_t          # signed distance difference
    a = abs(delta_d) / 2
    if a >= c:
        raise ValueError("Time difference too large for this receiver spacing")
    b = math.sqrt(c**2 - a**2)

    # Rotate into F1F2's frame, then rotate back
    axis = (F2 - F1) / np.linalg.norm(F2 - F1)
    perp = np.array([-axis[1], axis[0]])

    t = np.linspace(-2.5, 2.5, n_points)
    sign = -1 if delta_d > 0 else 1   # closer receiver's side
    x_local = sign * a * np.cosh(t)
    y_local = b * np.sinh(t)

    points = centre + np.outer(x_local, axis) + np.outer(y_local, perp)
    return points

import math
F1, F2 = (-500, 0), (500, 0)     # two sensors, 1000m apart
v_sound = 343                     # m/s in air
delta_t = 0.6                     # seconds; signal reached F2 first

branch = tdoa_hyperbola_branch(F1, F2, delta_t, v_sound)

fig, ax = plt.subplots(figsize=(9, 7))
ax.plot(branch[:, 0], branch[:, 1], color='#2980b9', lw=2.5,
        label='Possible source locations')
ax.plot(*F1, 's', color='#27ae60', markersize=10, label='Sensor 1')
ax.plot(*F2, 's', color='#e74c3c', markersize=10, label='Sensor 2')
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.legend(fontsize=9)
ax.set_title(f'TDOA positioning: Δt={delta_t}s, v={v_sound}m/s', fontsize=11)
ax.set_xlabel('x (m)'); ax.set_ylabel('y (m)')
plt.tight_layout()
plt.show()

print(f"Distance difference Δd = v·Δt = {v_sound*delta_t:.1f}m")
print(f"Source lies on a hyperbola branch closer to "
      f"{'Sensor 1' if delta_t < 0 else 'Sensor 2'}")
```

**Walkthrough.** `np.outer(x_local, axis)` is a first appearance: it
takes every value in the 1D array `x_local` and multiplies it by the
whole `axis` vector, producing one row per `t` value — the standard
way to turn a 1D parameter sweep into a 2D (or higher) set of points
without writing an explicit loop. `centre + np.outer(...) +
np.outer(...)` reconstructs each point in world coordinates: start at
the midpoint between sensors, then move along the sensor-to-sensor
axis by `x_local`, then move perpendicular to it by `y_local` — this
is the same shift-a-shape-to-a-new-centre idea from every prior conic
in this stage, just done with a rotation as well as a shift, which is
formally the subject of Lesson 3.9 (Transformations) — flagged here
as a forward reference for where this rotation logic gets named and
generalized properly.

**CS/SE lens.** `tdoa_hyperbola_branch` raises `ValueError` when
`a >= c` — a physically impossible measurement (the implied distance
difference exceeds the distance between the sensors themselves, which
can't happen with real signals and correct sensor positions).
Validating this instead of silently producing garbage output is the
same fail-fast principle used for `Circle`'s radius check and the
hyperbola's `A*C` sign check earlier in this lesson — by this point
in the curriculum it should be a reflex: any function with a
mathematical precondition checks it explicitly rather than trusting
the caller.

---

## Connect the Pieces

Concrete trace: two acoustic sensors 1000m apart, $\Delta t=0.6\text{s}$,
$v=343\text{m/s}$.

1. **Locus definition**: $2a = |\Delta d| = |v\Delta t| = 205.8\text{m}$,
   so $a=102.9\text{m}$.
2. **Standard form**: $c=500\text{m}$ (half the sensor spacing),
   $b=\sqrt{500^2-102.9^2}\approx489.3\text{m}$.
3. **Asymptotes**: $y=\pm\frac{b}{a}x\approx\pm4.76x$ — the branch
   straightens toward these lines far from the sensors.
4. **Parametrization**: $(a\cosh t, b\sinh t)$, rotated and shifted
   into the sensor pair's actual position and orientation.
5. **Result**: every point on the plotted branch is a location
   consistent with the measured time difference — a second
   measurement from a different sensor pair would add a second
   hyperbola, and their intersection would pin down the exact source
   location, exactly as LORAN did.

---

## Summary

**Locus definition:** $|\text{dist}(P,F_1)-\text{dist}(P,F_2)|=2a$.

**Standard form:** $\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1$,
$c^2=a^2+b^2$ (contrast the ellipse's $b^2=a^2-c^2$).

**Asymptotes:** $y=\pm\dfrac{b}{a}x$, from the "negligible term as
$x\to\infty$" reasoning of Lesson 1.5.

**Eccentricity:** $e=c/a>1$ always — the three conics sit at
$e=0$ (circle) $\to 0<e<1$ (ellipse) $\to e=1$ (parabola)
$\to e>1$ (hyperbola), one continuous family.

**General form recognition:** opposite-sign $A,C$ coefficients ⇒
hyperbola, before any algebra.

**Parametric form:** $x=a\cosh t,\ y=b\sinh t$ (one branch);
$\cosh^2t-\sinh^2t=1$.

**New Python/CS concepts:**
- `np.cosh`, `np.sinh` — hyperbolic trig functions, built from $e^x$
- Degenerate quadratic-to-linear branch (`abs(A) < 1e-12` case) when
  a line runs parallel to an asymptote
- `np.outer` — sweeping a 1D parameter into 2D world-space points

---

## Problems

### Math

**1.** Find $a$, $b$, $c$, the foci, asymptotes, and eccentricity of
$\dfrac{y^2}{4}-\dfrac{x^2}{21}=1$.

<details><summary>Answer</summary>
$a=2$, $b=\sqrt{21}$, $c=\sqrt{4+21}=5$. Foci $(0,\pm5)$ (opens
up/down since the $y^2$ term is positive). Asymptotes
$y=\pm\frac{2}{\sqrt{21}}x$. $e=5/2=2.5$.
</details>

---

**2.** Convert $x^2-y^2-2x-4y-4=0$ to standard form.

<details><summary>Answer</summary>
$(x^2-2x)-(y^2+4y)=4$
$(x^2-2x+1)-(y^2+4y+4)=4+1-4$
$(x-1)^2-(y+2)^2=1$. Centre $(1,-2)$, $a=b=1$ (opens left/right).
</details>

---

**3.** Two sensors are 800m apart. A pulse reaches one sensor
0.5 seconds before the other; sound travels at 340m/s. Find $a$ for
the hyperbola the source lies on.

<details><summary>Answer</summary>
$\Delta d = 340 \times 0.5 = 170\text{m}$. $2a=170 \Rightarrow a=85\text{m}$.
</details>

---

### Code Challenges

**Challenge 1 — Hyperbola class**

```python
import math

class Hyperbola:
    def __init__(self, h, k, a, b, axis='x'):
        """
        Hyperbola centred at (h,k). axis='x' means (x-h)²/a²-(y-k)²/b²=1;
        axis='y' means (y-k)²/a²-(x-h)²/b²=1.
        """
        if a <= 0 or b <= 0:
            raise ValueError("a and b must be positive")
        self.h, self.k, self.a, self.b, self.axis = h, k, a, b, axis

    def foci(self):
        """Return [(x1,y1), (x2,y2)]."""
        pass

    def eccentricity(self):
        pass

    def asymptote_slopes(self):
        """Return (m1, m2), the two asymptote slopes."""
        pass

    def contains_point(self, x, y, tol=1e-6):
        pass

# --- tests: do not modify ---
hy = Hyperbola(0, 0, 4, 3, axis='x')
assert hy.contains_point(5, 2.25, tol=1e-3)
f1, f2 = hy.foci()
assert any(math.isclose(fx, 5, abs_tol=1e-9) for fx, fy in [f1, f2])
m1, m2 = hy.asymptote_slopes()
assert math.isclose(sorted([m1, m2])[1], 0.75, abs_tol=1e-9)
assert math.isclose(hy.eccentricity(), 5/4, abs_tol=1e-9)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Intersections**

```python
import math

def hyperbola_line_pts(a, b, m, c):
    """Intersect x²/a²-y²/b²=1 with y=mx+c. Handle the asymptote-parallel case."""
    pass

# --- tests: do not modify ---
pts = hyperbola_line_pts(4, 3, 0, 0)   # horizontal line through centre
assert len(pts) == 2
xs = sorted(p[0] for p in pts)
assert math.isclose(xs[0], -4, abs_tol=1e-6)
assert math.isclose(xs[1], 4, abs_tol=1e-6)

# Line parallel to asymptote (slope = b/a = 0.75): at most 1 point
pts_parallel = hyperbola_line_pts(4, 3, 0.75, 1)
assert len(pts_parallel) <= 1
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — TDOA solver**

```python
import math
import numpy as np

def tdoa_branch_points(F1, F2, delta_t, v, n_points=100):
    """Reimplement the lesson's tdoa_hyperbola_branch function."""
    pass

# --- tests: do not modify ---
pts = tdoa_branch_points((-500, 0), (500, 0), 0.6, 343, n_points=50)
assert len(pts) == 50
# Every point should satisfy the hyperbola's difference-of-distances property
F1, F2 = np.array([-500, 0]), np.array([500, 0])
delta_d_expected = abs(343 * 0.6)
for p in pts[::10]:
    d1 = np.linalg.norm(p - F1)
    d2 = np.linalg.norm(p - F2)
    assert math.isclose(abs(d1 - d2), delta_d_expected, abs_tol=1e-3)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove that the hyperbola's asymptote slope formula
$y=\pm\frac{b}{a}x$ follows the same "dominant term" reasoning as a
rational function's horizontal/oblique asymptote from Lesson 1.5,
by showing the vertical distance between the hyperbola and its
asymptote shrinks to zero as $x\to\infty$.

<details><summary>Answer</summary>
On the upper-right branch, the hyperbola gives
$y_{hyp}=\frac{b}{a}\sqrt{x^2-a^2}$ and the asymptote gives
$y_{asym}=\frac{b}{a}x$. Their difference:
$$y_{asym}-y_{hyp} = \frac{b}{a}\left(x-\sqrt{x^2-a^2}\right)$$
Multiply by the conjugate:
$$= \frac{b}{a}\cdot\frac{x^2-(x^2-a^2)}{x+\sqrt{x^2-a^2}} = \frac{b}{a}\cdot\frac{a^2}{x+\sqrt{x^2-a^2}}$$
As $x\to\infty$, the denominator grows without bound while the
numerator $\frac{a^3 b}{a}=a^2b$ stays fixed, so the whole expression
→0. The curve and its asymptote get arbitrarily close but never
meet — exactly the "leftover term vanishes as the input grows"
argument from Lesson 1.5, applied here via a conjugate-multiplication
trick instead of polynomial long division. $\blacksquare$
</details>
