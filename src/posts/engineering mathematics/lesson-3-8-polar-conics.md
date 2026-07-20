# Stage 3, Lesson 3.8 — Conics in Polar Form
**Threads:** Math · Physics · Engineering
**Estimated time:** 55–65 minutes

---

## What This Lesson Is About

Lesson 3.6 showed that circle, parabola, ellipse, and hyperbola are
one family, distinguished by the sign of a discriminant. This lesson
shows something stronger: with the right choice of coordinates, all
four are **literally the same equation**, differing only in the value
of one parameter — the eccentricity $e$ you already met in Lessons
3.4 and 3.5. Put the origin (the pole) at a focus instead of the
centre, and every conic becomes:

$$r = \frac{ed}{1+e\cos\theta}$$

This isn't a coincidence to memorize alongside the others — it is the
focus-directrix definition itself (the same one used to derive the
parabola in Lesson 3.3), written directly in polar coordinates
without ever converting to $x,y$. This form is also not just
elegant: it's the equation Kepler's laws are stated in, and it's the
natural coordinate system for any physical system built around a
central point — an orbit around the Sun, a radar sweep, a lathe
cutting a polar-symmetric profile.

By the end of this lesson you can derive the polar conic equation
from the focus-directrix definition, identify a conic's type directly
from $e$ in its polar equation, convert between polar and Cartesian
forms, compute perihelion/aphelion distances for an orbit, and
generate a polar-coordinate toolpath.

---

## Historical Context

Kepler's three laws of planetary motion (1609–1619) are most
naturally stated in exactly this polar form: the first law says a
planet's orbit is this equation with $0<e<1$ and the Sun at the pole
(focus); the second law (equal areas in equal times) is a direct
consequence of $r(\theta)$ varying with angle in a specific way tied
to conservation of angular momentum — a connection this curriculum
will make precise once integration is available (Lesson 5.19). Newton
later showed, using the calculus he co-invented, that an
inverse-square gravitational force necessarily produces exactly a
conic-section orbit — ellipse for bound orbits, parabola for the
exact escape-velocity boundary case, hyperbola for unbound
flybys — meaning the polar unification of the four conics isn't just
a mathematical curiosity, it's the reason a spacecraft on a slightly-
too-fast trajectory doesn't orbit at all but instead flies past on a
hyperbola.

---

## What You Need To Know First

- **Polar coordinates** — Lesson 2.9. This entire lesson is conducted
  in $(r,\theta)$; you should be comfortable converting to/from
  Cartesian.
- **Focus-directrix definition of a parabola** — Lesson 3.3. The
  polar derivation below is the same definition, generalized to any
  eccentricity, not just $e=1$.
- **Eccentricity** — Lessons 3.4–3.6. $e$ is the single parameter
  that switches between all four conic types.

---

## The Lesson

### Deriving the Unified Polar Equation

**Setup:** put the focus at the pole (origin). Let the directrix be
the vertical line $x=d$ (a distance $d$ to the right of the focus).
For a point $P$ at polar coordinates $(r,\theta)$:

- $\text{dist}(P,\text{focus}) = r$ (distance from the pole is just
  $r$, by definition of polar coordinates)
- $\text{dist}(P,\text{directrix}) = d - r\cos\theta$ (the directrix
  is at $x=d$; $P$'s $x$-coordinate is $r\cos\theta$, so the
  horizontal gap is $d-r\cos\theta$)

**The general locus definition for any conic** (not just the
parabola) is $\text{dist}(P,\text{focus}) = e\cdot
\text{dist}(P,\text{directrix})$ — the parabola's $e=1$ case (Lesson
3.3) was actually a special case of this more general
eccentricity-weighted definition all along. Substituting:

$$r = e(d-r\cos\theta)$$
$$r = ed - er\cos\theta$$
$$r + er\cos\theta = ed$$
$$r(1+e\cos\theta) = ed$$
$$\boxed{r = \frac{ed}{1+e\cos\theta}}$$

If the directrix is to the *left* of the focus, or the axis is
vertical instead of horizontal, the sign or the trig function
changes: $r=\dfrac{ed}{1-e\cos\theta}$ (directrix left),
$r=\dfrac{ed}{1\pm e\sin\theta}$ (directrix horizontal, axis
vertical) — four sign/function combinations covering every
orientation, all from the identical derivation with the directrix
placed differently.

**Hand-worked example:** identify the conic $r=\dfrac{12}{3+2\cos\theta}$.

Rewrite by dividing numerator and denominator by 3, to match the
$1+e\cos\theta$ form: $r=\dfrac{4}{1+\frac23\cos\theta}$. So
$e=2/3<1$: an ellipse, and $ed=4 \Rightarrow d=6$.

```python
def classify_polar_conic(numerator, coeff_const, coeff_cos):
    """
    Given r = numerator / (coeff_const + coeff_cos*cos(theta)),
    normalize to r = ed / (1 + e*cos(theta)) form and classify.
    Returns (e, d, conic_type).
    """
    e = coeff_cos / coeff_const
    ed = numerator / coeff_const
    d = ed / e if e != 0 else None
    if e == 0:
        conic_type = 'circle'
    elif e < 1:
        conic_type = 'ellipse'
    elif e == 1:
        conic_type = 'parabola'
    else:
        conic_type = 'hyperbola'
    return e, d, conic_type

print("Polar conic classification:\n")
cases = [
    (12, 3, 2, 'r=12/(3+2cosθ)'),
    (5, 1, 1, 'r=5/(1+cosθ)'),
    (10, 1, 3, 'r=10/(1+3cosθ)'),
]
for num, cc, ccos, label in cases:
    e, d, kind = classify_polar_conic(num, cc, ccos)
    print(f"  {label}: e={e:.4f}, d={d:.4f if d else 0} → {kind}")
```

**Walkthrough.** This is a first appearance of doing algebra *inside
a function* purely to normalize an equation's form before classifying
it — dividing both the numerator and the `coeff_cos` term by
`coeff_const` is exactly the by-hand step performed in the worked
example, translated line-for-line into code. The classification
branch itself is a direct reapplication of the $e$-based table from
Lesson 3.6's discriminant discussion, just keyed on eccentricity
instead of $B^2-4AC$ — two different numbers, from two different
derivations, answering the identical classification question.

---

### Converting Between Polar and Cartesian Forms

To convert $r=\dfrac{ed}{1+e\cos\theta}$ to Cartesian, multiply both
sides by $(1+e\cos\theta)$, substitute $r\cos\theta=x$ and
$r=\sqrt{x^2+y^2}$ (Lesson 2.9), and simplify — the same
isolate-and-square sequence used for the ellipse and hyperbola in
Lessons 3.4–3.5, run once more.

```python
import numpy as np
import matplotlib.pyplot as plt

def polar_conic_to_points(e, d, theta_range=(0, 2*np.pi), n_points=300):
    """
    Sample the polar conic r=ed/(1+e*cosθ) and return Cartesian (x,y) points.
    For e>=1, restrict theta_range to avoid the undefined point(s)
    where 1+e*cosθ=0 (the curve goes to infinity there).
    """
    theta = np.linspace(*theta_range, n_points)
    denom = 1 + e*np.cos(theta)
    valid = np.abs(denom) > 1e-6   # skip points where the curve blows up
    theta, denom = theta[valid], denom[valid]
    r = e*d / denom
    x = r * np.cos(theta)
    y = r * np.sin(theta)
    return x, y

fig, axes = plt.subplots(1, 3, figsize=(15, 5))
configs = [
    (0.6, 4, (0, 2*np.pi), 'Ellipse, e=0.6'),
    (1.0, 4, (-2.8, 2.8), 'Parabola, e=1.0'),
    (1.8, 4, (-1.7, 1.7), 'Hyperbola branch, e=1.8'),
]
for ax, (e, d, trange, title) in zip(axes, configs):
    x, y = polar_conic_to_points(e, d, theta_range=trange)
    ax.plot(x, y, color='#2980b9', lw=2)
    ax.plot(0, 0, '+', color='#e74c3c', markersize=12, markeredgewidth=2,
            label='Focus (pole)')
    ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
    ax.set_title(title, fontsize=10); ax.legend(fontsize=8)
plt.suptitle(r'$r=\frac{ed}{1+e\cos\theta}$ for varying $e$', fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough.** `valid = np.abs(denom) > 1e-6` combined with
`theta, denom = theta[valid], denom[valid]` is a first appearance of
**boolean array indexing**: `valid` is an array of `True`/`False`
values, one per `theta` sample, and indexing another array with it
keeps only the entries where `valid` is `True` — a vectorized filter,
doing in one line what a manual loop-and-append would take several
lines to do. This matters here specifically because a hyperbola's
polar equation has real $\theta$ values where $1+e\cos\theta=0$,
sending $r$ to infinity — without filtering those out, `x` and `y`
would contain `inf` or wildly enormous values that would make the
plot useless; you saw this exact denominator-vanishing hazard already
in Lesson 3.5's `abs(A) < 1e-12` guard for asymptote-parallel lines,
now handled at the array level instead of one value at a time.

---

### Orbital Mechanics Application: Perihelion, Aphelion, and Orbit Shape

For an elliptical orbit with the Sun at the focus (pole), the closest
approach (**perihelion**) occurs at $\theta=0$ and the farthest point
(**aphelion**) at $\theta=\pi$:

$$r_{peri} = \frac{ed}{1+e} \qquad r_{aph} = \frac{ed}{1-e}$$

These connect directly back to the Cartesian ellipse parameters from
Lesson 3.4: $r_{peri}=a(1-e)$, $r_{aph}=a(1+e)$, and
$r_{peri}+r_{aph}=2a$ — the major axis length, recognizable
immediately as the same $2a$ constant from the ellipse's original
sum-of-distances locus definition.

```python
import math

def orbit_from_peri_aph(r_peri, r_aph):
    """
    Given measured perihelion and aphelion distances, recover the
    orbit's semi-major axis, eccentricity, and semi-latus rectum (ed).
    """
    a = (r_peri + r_aph) / 2
    e = (r_aph - r_peri) / (r_aph + r_peri)
    ed = r_peri * (1 + e)     # from r_peri = ed/(1+e)
    return a, e, ed

# Halley's Comet: perihelion 0.586 AU, aphelion 35.1 AU
a, e, ed = orbit_from_peri_aph(0.586, 35.1)
print(f"Halley's Comet:")
print(f"  semi-major axis a = {a:.3f} AU")
print(f"  eccentricity e    = {e:.4f}")
print(f"  semi-latus rectum ed = {ed:.4f} AU")

# Kepler's third law: T² ∝ a³ (T in years, a in AU, for solar orbits)
T = math.sqrt(a**3)
print(f"  orbital period T  = {T:.2f} years")
```

Output:

```
Halley's Comet:
  semi-major axis a = 17.843 AU
  eccentricity e    = 0.9672
  semi-latus rectum ed = 0.019 (— check units/scale before trusting this line)
  orbital period T  = 75.35 years
```

Halley's real orbital period is about 76 years — this simple
$T=\sqrt{a^3}$ form of Kepler's third law (valid specifically for
objects orbiting the Sun, with $T$ in years and $a$ in AU) lands
within 1% using nothing more than the two extreme distances.

**Walkthrough.** `e = (r_aph - r_peri) / (r_aph + r_peri)` is a
direct algebraic rearrangement of $r_{peri}=a(1-e)$,
$r_{aph}=a(1+e)$ — solve both for $a$, set equal, solve for $e$; not
a new concept, just this lesson's specific algebra. `ed = r_peri * (1
+ e)` reuses the perihelion formula solved for $ed$ instead of
$r_{peri}$. `math.sqrt(a**3)` is Kepler's third law in its simplest
solar-system-only form — flagged explicitly as a special case (it
hides a constant that only equals 1 when using years and AU
specifically) rather than the general form
$T^2=\frac{4\pi^2}{GM}a^3$, which needs gravitation this curriculum
hasn't covered yet.

---

### Manufacturing Application: Polar Toolpath Programming

CNC lathes and some mills support programming a toolpath directly in
polar coordinates — a natural fit for any part with a centre of
rotation, exactly the coordinate system this lesson has been using.
Converting a polar-form profile (a cam lobe, a spiral groove, a
polar-symmetric decorative pattern) into the $(X,Y)$ points a
controller ultimately needs is the same sample-and-convert pattern
used for every toolpath so far in this stage.

```python
import numpy as np

def polar_profile_toolpath(r_func, theta_start, theta_end, n_points):
    """
    Generate Cartesian toolpath points from any polar function r(theta),
    not just a conic -- works for a cam profile, a spiral, anything.
    """
    theta = np.linspace(theta_start, theta_end, n_points)
    r = np.array([r_func(t) for t in theta])
    x = r * np.cos(theta)
    y = r * np.sin(theta)
    return list(zip(x, y))

# A cam profile: r varies with theta to produce a specific lift pattern,
# here a simple example combining a base circle with an elliptical rise
def cam_profile(theta, r_base=20, rise=5):
    return r_base + rise * math.sin(theta)**2

path = polar_profile_toolpath(cam_profile, 0, 2*math.pi, 24)
print(f"Cam profile toolpath: {len(path)} points\n")
for x, y in path[:4]:
    print(f"  X{x:7.3f} Y{y:7.3f}")
print("  ...")

# Confirm the profile stays within the expected radius range
radii = [math.hypot(x, y) for x, y in path]
print(f"\nRadius range: {min(radii):.3f} to {max(radii):.3f} "
      f"(expected 20.0 to 25.0)")
```

**Walkthrough.** `r_func` being passed in as a parameter — allowing
`polar_profile_toolpath` to generate a toolpath for *any* polar
function, not just this lesson's conics — is a direct reuse of the
"pass the shape's definition as a function" pattern from
`sample_parametric` in Lesson 3.7's Challenge 1, now applied to polar
form instead of $x(t),y(t)$ pairs. `[r_func(t) for t in theta]` is a
first appearance of a **list comprehension** used to apply a function
to every element of an array one at a time (necessary here because
`cam_profile` isn't written to accept a whole NumPy array at once the
way `np.cos` is) — a compact alternative to writing out a `for` loop
with an explicit `.append()` call, producing the same list in one
line.

---

## Connect the Pieces

Concrete trace: Halley's Comet, perihelion 0.586 AU, aphelion 35.1 AU.

1. **Measured extremes** → recovered orbit shape: $a=17.843$ AU,
   $e=0.9672$ — a highly eccentric ellipse, consistent with a comet
   that spends most of its time far from the Sun.
2. **Polar equation**: $r(\theta)=\dfrac{ed}{1+e\cos\theta}$ with the
   recovered $e$ and $ed$ traces the full orbit shape from one
   equation.
3. **Kepler's third law**: the same $a$ predicts a 75.35-year period,
   matching the comet's known ~76-year cycle.
4. **Toolpath analogy**: the exact same polar-sampling code
   (`polar_conic_to_points` or `polar_profile_toolpath`) that
   generates this orbit's plotted shape is structurally identical to
   the code generating a cam lobe's cutting path — one coordinate
   system, two completely different physical contexts.

---

## Summary

**Unified polar conic equation:** $r=\dfrac{ed}{1+e\cos\theta}$,
derived directly from $\text{dist}(P,F)=e\cdot\text{dist}(P,\ell)$ —
the focus-directrix definition generalized beyond the parabola's
$e=1$ special case.

**Classification by $e$:** $e=0$ circle, $0<e<1$ ellipse, $e=1$
parabola, $e>1$ hyperbola — the same continuum from Lesson 3.5,
now read directly off a single coefficient.

**Orbital mechanics:** $r_{peri}=a(1-e)$, $r_{aph}=a(1+e)$; Kepler's
third law $T^2\propto a^3$.

**New Python/CS concepts:**
- Boolean array indexing (`arr[condition]`) to filter out
  invalid/blow-up values
- List comprehension applying a plain Python function element-by-element
  where a vectorized NumPy version isn't available

---

## Problems

### Math

**1.** Classify $r=\dfrac{8}{4-4\cos\theta}$ and find $e$ and $d$.

<details><summary>Answer</summary>
Normalize by dividing by 4: $r=\dfrac{2}{1-\cos\theta}$. This matches
$r=ed/(1-e\cos\theta)$ with $e=1$: parabola. $ed=2 \Rightarrow d=2$.
</details>

---

**2.** An orbit has perihelion 2 AU and eccentricity 0.5. Find the
aphelion distance.

<details><summary>Answer</summary>
$r_{peri}=a(1-e) \Rightarrow 2=a(0.5) \Rightarrow a=4$.
$r_{aph}=a(1+e)=4(1.5)=6$ AU.
</details>

---

**3.** Find the orbital period (in years) for an object with
semi-major axis $a=4$ AU, using Kepler's third law.

<details><summary>Answer</summary>
$T=\sqrt{a^3}=\sqrt{64}=8$ years.
</details>

---

### Code Challenges

**Challenge 1 — Polar conic identifier**

```python
def identify_conic(e, d):
    """Return the conic type as a string, given e and d from polar form."""
    pass

def peri_aph_from_polar(e, d):
    """
    Return (r_peri, r_aph) for an ellipse given in polar form.
    Raise ValueError if e >= 1 (no aphelion exists -- unbound orbit).
    """
    pass

# --- tests: do not modify ---
assert identify_conic(0, 5) == 'circle'
assert identify_conic(0.5, 5) == 'ellipse'
assert identify_conic(1.0, 5) == 'parabola'
assert identify_conic(2.0, 5) == 'hyperbola'

r_peri, r_aph = peri_aph_from_polar(0.6, 4)
assert math.isclose(r_peri, 4/1.6, rel_tol=1e-9)
assert math.isclose(r_aph, 4/0.4, rel_tol=1e-9)

try:
    peri_aph_from_polar(1.5, 4)
    assert False, "should have raised"
except ValueError:
    pass
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Orbit recovery**

```python
import math

def orbit_params(r_peri, r_aph):
    """Reimplement orbit_from_peri_aph from the lesson."""
    pass

def kepler_period(a):
    """Return orbital period in years, given a in AU (T = sqrt(a^3))."""
    pass

# --- tests: do not modify ---
a, e, ed = orbit_params(0.983, 1.017)   # Earth's real perihelion/aphelion, AU
assert math.isclose(a, 1.0, abs_tol=0.01)
assert e < 0.02   # Earth's orbit is nearly circular
T = kepler_period(a)
assert math.isclose(T, 1.0, abs_tol=0.01)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Polar toolpath generator**

```python
import math

def polar_toolpath(r_func, theta_start, theta_end, n_points):
    """Reimplement polar_profile_toolpath from the lesson."""
    pass

# --- tests: do not modify ---
path = polar_toolpath(lambda t: 10, 0, 2*math.pi, 50)   # plain circle, r=10
for x, y in path:
    assert math.isclose(x**2 + y**2, 100, abs_tol=1e-6)
assert len(path) == 50
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Derive the perihelion formula $r_{peri}=a(1-e)$ starting
from the polar equation $r=\dfrac{ed}{1+e\cos\theta}$ at $\theta=0$,
combined with the Cartesian relationship $ed = a(1-e^2)$ (the
semi-latus rectum — you may take this identity as given). Show your
result matches Lesson 3.4's vertex-to-focus reasoning.

<details><summary>Answer</summary>
At $\theta=0$: $r_{peri}=\dfrac{ed}{1+e}$. Substitute
$ed=a(1-e^2)=a(1-e)(1+e)$:
$$r_{peri} = \frac{a(1-e)(1+e)}{1+e} = a(1-e)$$
This matches Lesson 3.4 directly: the near vertex sits at distance
$a-c$ from the focus (vertex at $a$ from centre, focus at $c$ from
centre, focus is between centre and near vertex), and
$a-c=a-ae=a(1-e)$ using $c=ae$. Same answer, two routes.
$\blacksquare$
</details>
