# Stage 3, Lesson 3.3 — Parabolas
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

A parabola is not "the shape of $y=x^2$" — that's a consequence, not
the definition. A parabola is the set of points **equidistant from a
fixed point (the focus) and a fixed line (the directrix)**. Everything
in this lesson — the standard equation, the vertex form, the focal
length, the reflective property — falls out of that one distance
condition, the same way the circle fell out of "equidistant from a
single point" in Lesson 3.2. This is the second conic, and the second
time you'll watch a locus definition turn into algebra via the
distance formula.

The reflective property is why this shape matters industrially:
satellite dishes, headlight reflectors, radio telescopes, and solar
concentrators are all manufactured to a parabolic profile because rays
parallel to the axis of a parabola all reflect through a single point
— the focus. Machining or moulding that profile accurately is a
directly line's worth of code away from what you'll build below.

By the end of this lesson you can derive a parabola's equation from
its focus and directrix, convert between vertex and general form,
compute the focal length and latus rectum, verify the reflective
property numerically, intersect a parabola with a line, and generate
a toolpath-ready set of points along a parabolic profile.

---

## Historical Context

The Greeks studied parabolas as one of Menaechmus's three conic
sections (c. 350 BCE), found by slicing a cone with a plane parallel
to its side. Archimedes proved the area under a parabolic segment
using an early form of integration nearly 2000 years before calculus
was formalized. The focus-directrix definition and the reflective
property were known to the Greeks geometrically, but it was Galileo
(1638) who proved that projectile motion under constant gravity
traces a parabola — the first time this "pure" geometric curve was
shown to govern real physical motion. The reflective property was put
to engineering use much later: parabolic mirrors in reflecting
telescopes (Newton, 1668) and, in the 20th century, parabolic
antennas and satellite dishes.

---

## What You Need To Know First

- **Distance formula** — Lesson 3.1. The parabola equation is the
  distance formula applied twice (point-to-point, point-to-line) and
  set equal.
- **Point-to-line distance** — Lesson 3.1. Needed for the directrix
  side of the definition.
- **Completing the square** — Lesson 1.2. Converts general form to
  vertex form.
- **Circle-line intersection technique** — Lesson 3.2, §Circle-Line
  Intersection. The parabola-line method is the same substitute-and-
  solve pattern; it isn't re-derived from scratch here.

---

## The Lesson

### The Parabola as a Locus

**Definition:** given a fixed point $F$ (the **focus**) and a fixed
line $\ell$ (the **directrix**, not passing through $F$), a
**parabola** is the set of all points $P$ such that

$$\text{dist}(P, F) = \text{dist}(P, \ell)$$

Take the simplest case: focus $F=(0,p)$, directrix $y=-p$. For a
point $P=(x,y)$:

$$\text{dist}(P,F) = \sqrt{x^2+(y-p)^2} \qquad \text{dist}(P,\ell) = y+p$$

Setting them equal and squaring:

$$x^2 + (y-p)^2 = (y+p)^2$$
$$x^2 + y^2 - 2py + p^2 = y^2 + 2py + p^2$$
$$x^2 = 4py$$

This is the **standard form**, vertex at the origin, opening upward
if $p>0$. The constant $p$ is the **focal length** — the distance
from vertex to focus, equal to the distance from vertex to directrix.

**Hand-worked example:** find the focus and directrix of $x^2=12y$.

Match $x^2=4py$: $4p=12 \Rightarrow p=3$. Focus $(0,3)$, directrix
$y=-3$.

**A quick numerical check before trusting the algebra.** Before
building anything with this equation, it's worth confirming the
locus property actually holds for a specific point — throwaway code,
not part of anything we keep:

```python
import math

# Throwaway check: does a point on x²=12y satisfy dist(P,F)=dist(P,directrix)?
p = 3
x = 6
y = x**2 / (4*p)          # solve x²=4py for y
dist_to_focus = math.sqrt(x**2 + (y - p)**2)
dist_to_directrix = y - (-p)   # y minus the directrix's y-value

print(f"Point ({x}, {y})")
print(f"  distance to focus (0,{p}):      {dist_to_focus:.6f}")
print(f"  distance to directrix y=-{p}:   {dist_to_directrix:.6f}")
```

Output:

```
Point (6, 3.0)
  distance to focus (0,3):      6.000000
  distance to directrix y=-3:   6.000000
```

The two distances match, confirming the equation encodes the locus
definition correctly. This snippet is discarded now — it never
appears in the project again; it only existed to sanity-check the
algebra above.

**Four orientations.** Depending on which way the parabola opens:

| Form | Opens | Focus | Directrix |
|---|---|---|---|
| $x^2=4py$ | up ($p>0$) / down ($p<0$) | $(0,p)$ | $y=-p$ |
| $y^2=4px$ | right ($p>0$) / left ($p<0$) | $(p,0)$ | $x=-p$ |

Shifting the vertex to $(h,k)$ replaces $x$ with $x-h$ and $y$ with
$y-k$:

$$(x-h)^2 = 4p(y-k) \qquad \text{or} \qquad (y-k)^2 = 4p(x-h)$$

---

### Vertex Form, General Form, and Converting Between Them

The **vertex form** you already know from Algebra II is
$y=a(x-h)^2+k$. Comparing to $(x-h)^2=4p(y-k)$:

$$a = \frac{1}{4p} \qquad \Longleftrightarrow \qquad p = \frac{1}{4a}$$

So $a$ (steepness) and $p$ (focal length) are reciprocally related —
a "wider" parabola (small $|a|$) has a large focal length, and a
"narrower" one (large $|a|$) has a small focal length. This matters
physically: a satellite dish with a small focal length has its
receiver close to the dish; a large focal length pushes it far out on
a support arm.

The **general form** is $y=ax^2+bx+c$. Converting general → vertex is
completing the square, exactly as in Lesson 1.2 and Lesson 3.2 —
we're reusing that construct, not re-teaching it.

**Hand-worked example:** convert $y=2x^2-12x+23$ to vertex form and
find the focus.

$$y = 2(x^2-6x) + 23 = 2(x^2-6x+9-9)+23 = 2(x-3)^2 - 18 + 23 = 2(x-3)^2+5$$

Vertex $(3,5)$, $a=2 \Rightarrow p = 1/(4 \cdot 2) = 1/8$. Focus is
$1/8$ above the vertex: $(3, 5.125)$. Directrix: $y = 5 - 1/8 =
4.875$.

```python
import math

def general_to_vertex_parabola(a, b, c):
    """
    Convert y = ax²+bx+c to vertex form y = a(x-h)²+k.
    Returns (a, h, k, p, focus, directrix_y).
    """
    h = -b / (2*a)
    k = c - b**2 / (4*a)
    p = 1 / (4*a)
    focus = (h, k + p)
    directrix_y = k - p
    return a, h, k, p, focus, directrix_y

print("General → vertex form (parabolas):\n")
cases = [(2, -12, 23), (1, 0, 0), (-0.5, 2, 1)]
for a, b, c in cases:
    a2, h, k, p, focus, dir_y = general_to_vertex_parabola(a, b, c)
    print(f"  y = {a}x² + ({b})x + {c}")
    print(f"  → vertex ({h:.3f}, {k:.3f}), p = {p:.4f}")
    print(f"  → focus {focus}, directrix y={dir_y:.4f}\n")
```

**Walkthrough.** `h = -b/(2*a)` and `k = c - b**2/(4*a)` are the
completed-square results — algebra you just did by hand above,
translated line-for-line into code; no new concept there. `p =
1/(4*a)` is new only in the sense that it's the vertex-form-to-focal-
length relationship derived a moment ago, applied for the first time
in code. `focus = (h, k + p)` packages two values into a tuple — a
reappearance of the tuple-return pattern from `general_to_standard`
in Lesson 3.2, not a new idea.

---

### Plotting a Parabola and Verifying the Focal Property Visually

```python
import numpy as np
import matplotlib.pyplot as plt

def plot_parabola(h, k, p, xlim=(-6, 6), ax=None):
    """
    Plot (x-h)²=4p(y-k) over a range of x, with focus and directrix marked.
    """
    if ax is None:
        fig, ax = plt.subplots(figsize=(8, 8))
    x = np.linspace(h + xlim[0], h + xlim[1], 400)
    y = (x - h)**2 / (4*p) + k
    ax.plot(x, y, color='#2980b9', lw=2.5, label=f'$(x-{h})^2=4({p})(y-{k})$')
    focus = (h, k + p)
    ax.plot(*focus, 'o', color='#e74c3c', markersize=9, zorder=5, label='Focus')
    ax.axhline(k - p, color='#27ae60', lw=2, linestyle='--', label='Directrix')
    ax.plot(h, k, '+', color='#333', markersize=12, markeredgewidth=2)
    ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
    return ax

fig, ax = plt.subplots(figsize=(8, 8))
plot_parabola(0, 0, 2, ax=ax)
ax.legend(fontsize=9)
ax.set_title('$x^2=8y$: vertex, focus, and directrix', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
plt.tight_layout()
plt.show()
```

**Walkthrough.** `np.linspace(h + xlim[0], h + xlim[1], 400)` builds
400 evenly spaced $x$-values centred on the vertex — a reappearance
of `np.linspace` from earlier lessons, no restatement owed.
`ax.axhline(k - p, ..., linestyle='--')` is a first appearance of
`linestyle='--'` as a *keyword argument spelled out explicitly*
(you've seen dashed lines drawn via `'--'` as a positional format
string before, in Lesson 3.2's radius lines) — here it's passed as a
named `linestyle=` argument instead, which matters because
`axhline` doesn't accept the compact `'b--'`-style format string that
`ax.plot` does; it needs `color=` and `linestyle=` as separate
keywords. Everything else in this function — `ax.plot`, `'+'`
markers, `ax.set_aspect('equal')` — is a direct reuse of Lesson 3.2's
circle-plotting code.

---

### The Reflective Property

**Claim:** any ray travelling parallel to a parabola's axis reflects
off the parabola's interior surface and passes through the focus —
regardless of where on the parabola it strikes.

This is *why* parabolic mirrors and antennas exist. A satellite dish
receives radio waves arriving as (effectively) parallel rays from a
distant satellite; the parabolic shape concentrates all of them at
one point, where the receiver sits. Run the reflection in reverse — a
light source at the focus of a parabolic mirror — and you get a
headlight or a searchlight: rays leaving the focus emerge parallel.

**The geometry.** At a point $P$ on the parabola, the tangent line
bisects the angle between the segment $PF$ (to the focus) and the
vertical line through $P$ (parallel to the axis). A ray coming
straight down and hitting the tangent reflects at equal
angle-of-incidence/angle-of-reflection — and that reflected ray
travels along $PF$, straight to the focus.

Rather than take that on faith, verify it numerically: fire several
vertical rays at a parabola, reflect each one off the tangent line at
its point of impact, and check that every reflected ray passes
through the focus.

```python
import numpy as np
import matplotlib.pyplot as plt

def parabola_tangent_slope(x0, p):
    """Slope of the tangent to x²=4py at the point (x0, x0²/(4p))."""
    # dy/dx of y = x²/(4p) is x/(2p)
    return x0 / (2*p)

def reflect_vertical_ray(x0, p):
    """
    A vertical ray travelling in -y direction strikes the parabola
    x²=4py at x=x0. Return the reflected ray as a direction vector,
    using the law of reflection off the tangent line.
    """
    m = parabola_tangent_slope(x0, p)
    # Tangent direction vector, normalized
    t = np.array([1, m]) / math.sqrt(1 + m**2)
    incoming = np.array([0, -1])   # straight down
    # Reflect incoming across the tangent: r = 2(d·t)t - d
    d_dot_t = np.dot(incoming, t)
    reflected = 2 * d_dot_t * t - incoming
    return reflected

import math
p = 2
strike_points = [-4, -2, -0.5, 1, 3]
fig, ax = plt.subplots(figsize=(9, 8))
plot_parabola(0, 0, p, xlim=(-5, 5), ax=ax)

for x0 in strike_points:
    y0 = x0**2 / (4*p)
    # Incoming ray: from above, straight down, to (x0, y0)
    ax.plot([x0, x0], [y0 + 3, y0], color='#888', lw=1.2, linestyle=':')
    # Reflected ray: from (x0, y0) toward the focus, extended a bit past it
    direction = reflect_vertical_ray(x0, p)
    end = np.array([x0, y0]) + direction * 5
    ax.plot([x0, end[0]], [y0, end[1]], color='#f39c12', lw=1.5)
    # Verify: does the reflected ray pass through the focus (0, p)?
    # Parametrize and solve for t where x=0
    t_at_focus = -x0 / direction[0] if direction[0] != 0 else 0
    hit = np.array([x0, y0]) + direction * t_at_focus
    print(f"x0={x0:5.1f}: reflected ray crosses x=0 at y={hit[1]:.4f} "
          f"(focus is at y={p})")

ax.legend(fontsize=9, loc='upper center')
ax.set_title('Reflective property: vertical rays converge at the focus',
              fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
plt.tight_layout()
plt.show()
```

Output:

```
x0= -4.0: reflected ray crosses x=0 at y=2.0000 (focus is at y=2)
x0= -2.0: reflected ray crosses x=0 at y=2.0000 (focus is at y=2)
x0= -0.5: reflected ray crosses x=0 at y=2.0000 (focus is at y=2)
x0=  1.0: reflected ray crosses x=0 at y=2.0000 (focus is at y=2)
x0=  3.0: reflected ray crosses x=0 at y=2.0000 (focus is at y=2)
```

Every ray, regardless of where it strikes, reflects to exactly
$y=2$ — the focus — confirming the claim.

**Walkthrough.** `parabola_tangent_slope` computes $dy/dx$ of
$y=x^2/(4p)$ by the power rule — you haven't formally met derivatives
yet (that's Stage 5), so treat this one line as a given fact for now,
flagged as a forward reference; it will be *derived*, not just used,
in Lesson 5.4. `np.array([1, m]) / math.sqrt(1 + m**2)` is a new
concept: **vector normalization** — dividing a vector by its own
magnitude to produce a unit vector (length 1). `np.dot(a, b)` is a
first appearance of the dot product *as code*; the geometric meaning
(projection, angle between vectors) is a full lesson away in Lesson
4.2 — here, treat it as "multiply corresponding components and sum,"
which is all the reflection formula needs. The line `reflected = 2 *
(d·t) * t - incoming` is the vector form of the law of reflection —
a hard concept worth naming even though its derivation is deferred:
this exact formula reappears in ray tracing, billiard/collision
physics, and light-bounce shaders, which is why it's worth committing
to memory now even before you can derive it.

**CS/SE lens.** This function computes something exact (reflection
angle) using floating-point trigonometry-free vector arithmetic,
rather than tracking angles in degrees and calling `sin`/`cos`. The
tradeoff: vector reflection avoids the quadrant and wraparound bugs
that plague angle-based code (is this angle measured from the
$x$-axis or the tangent? clockwise or counterclockwise?), at the cost
of being less immediately readable to someone thinking in degrees.
This is the standard approach in every real ray tracer and physics
engine — none of them track angles internally.

---

### Parabola–Line Intersection

Same substitution-and-solve pattern as Lesson 3.2's circle-line
intersection: substitute the line into the parabola equation, get a
quadratic, use the discriminant.

For $x^2=4py$ intersected with $y=mx+c$:

$$x^2 = 4p(mx+c) \Rightarrow x^2 - 4pmx - 4pc = 0$$

$\Delta = (4pm)^2 + 16pc$. $\Delta>0$: two points (secant); $\Delta=0$:
tangent; $\Delta<0$: miss.

**Hand-worked example:** intersect $x^2=8y$ with $y=x+2$.

$x^2 = 8(x+2) \Rightarrow x^2-8x-16=0$. Discriminant $=64+64=128>0$,
two real roots: $x = (8 \pm \sqrt{128})/2 = 4 \pm 4\sqrt2$.

```python
import math

def parabola_line_intersect(p, m, c):
    """
    Intersect x²=4py with y=mx+c. Returns list of (x,y) points.
    """
    A, B, C = 1, -4*p*m, -4*p*c
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

print("Parabola-line intersection:\n")
for p, m, c, label in [(2, 1, 2, 'y=x+2'), (2, 0, 0, 'y=0 (through vertex)'),
                        (2, 1, -10, 'y=x-10 (misses)')]:
    pts = parabola_line_intersect(p, m, c)
    print(f"  x²=8y ∩ {label}: {len(pts)} point(s)")
    for pt in pts:
        print(f"    ({pt[0]:.4f}, {pt[1]:.4f})")
```

**Walkthrough.** Every element here — the `A, B, C` quadratic
coefficients, the `disc` variable, the three-way branch on its sign,
`math.sqrt(disc)` — is the same *pattern* as
`circle_line_intersect` in Lesson 3.2, just with a different `A`,
`B`, `C` derivation. Per the repetition rule, this gets a brief
restatement rather than a full re-explanation: the branch structure
and tolerance handling (`abs(disc) <= 1e-9`) are the identical idea
you already learned, reused on a new equation.

---

### Manufacturing Application: Parabolic Reflector Toolpaths

A parabolic mirror mould — for a headlight reflector, a solar
concentrator, or a radio dish — is machined by moving a cutting tool
along the parabola's profile, one small step at a time, then
revolving that profile (a lathe operation) or sweeping it (a 3-axis
mill) to generate the full 3D surface. The first step in either case
is the same: generate a dense, evenly spaced set of $(x,y)$ points
along the 2D parabolic profile for the controller to follow.

```python
import numpy as np
import matplotlib.pyplot as plt

def parabola_toolpath(h, k, p, x_start, x_end, step):
    """
    Generate toolpath points along (x-h)²=4p(y-k) from x_start to x_end.
    Returns list of (x, y) points spaced `step` apart in x.
    """
    n_steps = int(round((x_end - x_start) / step)) + 1
    xs = np.linspace(x_start, x_end, n_steps)
    ys = (xs - h)**2 / (4*p) + k
    return list(zip(xs, ys))

# A small parabolic reflector: focal length 15mm, 40mm aperture wide
p_focal = 15
path = parabola_toolpath(h=0, k=0, p=p_focal, x_start=-20, x_end=20, step=2)

print(f"Toolpath: {len(path)} points, focal length {p_focal}mm\n")
for x, y in path[:5]:
    print(f"  X{x:6.2f} Y{y:6.3f}")
print("  ...")
for x, y in path[-2:]:
    print(f"  X{x:6.2f} Y{y:6.3f}")

# Depth check: how deep does the mould need to be cut at the edge?
edge_depth = path[-1][1]
print(f"\nMaximum cut depth (at aperture edge): {edge_depth:.3f}mm")

fig, ax = plt.subplots(figsize=(9, 6))
xs_path = [pt[0] for pt in path]
ys_path = [pt[1] for pt in path]
ax.plot(xs_path, ys_path, 'o-', color='#2980b9', markersize=4, lw=1.5,
        label='Toolpath points')
focus = (0, p_focal)
ax.plot(*focus, '*', color='#e74c3c', markersize=16, label='Focus (receiver location)')
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.legend(fontsize=9)
ax.set_title(f'Parabolic reflector profile, p={p_focal}mm', fontsize=11)
ax.set_xlabel('$x$ (mm)'); ax.set_ylabel('$y$ (mm)')
plt.tight_layout()
plt.show()
```

**Walkthrough.** `int(round((x_end - x_start) / step)) + 1` computes
how many sample points a fixed step size produces over a given
range — routine arithmetic, no new concept. `np.linspace(x_start,
x_end, n_steps)` reuses the sampling pattern from earlier in this
lesson. `zip(xs, ys)` is a first appearance: it pairs up two
equal-length sequences element-by-element, turning two parallel
arrays of $x$-values and $y$-values into a single sequence of
$(x,y)$ tuples — exactly the shape a CNC point list needs.
`list(zip(...))` forces that pairing into a concrete list rather than
the lazy iterator `zip` produces by default.

**SE lens.** Generating toolpath points by fixed step size in $x$
(rather than fixed arc length) is simple but not uniform: near the
vertex, where the parabola is nearly flat, points end up close
together in actual path distance; near the steep edges, they end up
farther apart, meaning the cutter takes bigger real jumps exactly
where the surface curves fastest — the worst place for a large step.
Real CAM software instead steps by **arc length** or by a maximum
**chordal deviation** tolerance (how far the straight segment between
two points is allowed to stray from the true curve). That's a more
complex calculation — it needs the arc length integral from Stage
5 — which is why this lesson's version is the simplified,
good-enough-for-now approach, with the real one flagged as a debt to
pay off once integration is available.

---

## Connect the Pieces

Concrete trace: a parabolic reflector with focal length $p=15\text{mm}$,
vertex at the origin.

1. **Locus definition** → equation: $x^2=4(15)y=60y$.
2. **Vertex/general form**: already in vertex form, $h=0,k=0$;
   $a=1/(4p)=1/60$.
3. **Plot**: focus at $(0,15)$, directrix $y=-15$.
4. **Reflective property**: a vertical ray striking the profile at
   $x=-20$ reflects and crosses $x=0$ at $y=15$ — the focus, where
   the receiver/bulb/detector physically sits.
5. **Toolpath**: the same equation, sampled every 2mm in $x$ from
   $-20$ to $20$, becomes the 41-point path a mill or lathe follows
   to cut the mould.

One equation, five different uses — the locus definition, the
geometric picture, the physical function, and the manufacturing
instructions are all the same $x^2=4py$.

---

## Summary

**Locus definition:** $\text{dist}(P,F)=\text{dist}(P,\ell)$.

**Standard form (vertex at origin):** $x^2=4py$ (opens up/down) or
$y^2=4px$ (opens left/right). $p$ = focal length.

**Shifted:** $(x-h)^2=4p(y-k)$.

**Vertex ↔ general:** $a=1/(4p)$; convert general → vertex by
completing the square (Lesson 1.2, reused).

**Reflective property:** rays parallel to the axis reflect through
the focus — verified via vector reflection, $r = 2(d\cdot t)t - d$.

**Parabola-line intersection:** substitute, solve the resulting
quadratic, same discriminant logic as Lesson 3.2's circle-line case.

**New Python/CS concepts:**
- Vector normalization: dividing by magnitude to get a unit vector
- `np.dot` — dot product (mechanics now, geometric meaning in Lesson 4.2)
- `zip()` — pairing parallel sequences into tuples
- `linestyle=` as an explicit keyword vs. the compact format-string style

---

## Problems

### Math

**1.** Find the focus and directrix of $y^2=-20x$.

<details><summary>Answer</summary>
$4p=-20 \Rightarrow p=-5$. Opens left. Focus $(-5,0)$, directrix $x=5$.
</details>

---

**2.** Convert $y=-3x^2+12x-7$ to vertex form and find the focal length.

<details><summary>Answer</summary>
$y=-3(x^2-4x)-7=-3(x-2)^2+12-7=-3(x-2)^2+5$.
Vertex $(2,5)$. $p=1/(4a)=1/(4\cdot-3)=-1/12$. Focal length $|p|=1/12$; opens downward.
</details>

---

**3.** Find the intersection points of $y^2=4x$ and $x=3$.

<details><summary>Answer</summary>
$y^2=12 \Rightarrow y=\pm2\sqrt3$. Points $(3,2\sqrt3)$ and $(3,-2\sqrt3)$.
</details>

---

### Code Challenges

**Challenge 1 — Parabola class**

```python
import math

class Parabola:
    def __init__(self, h, k, p):
        """Parabola (x-h)²=4p(y-k). p can be negative (opens down)."""
        if p == 0:
            raise ValueError("p cannot be zero")
        self.h, self.k, self.p = h, k, p

    @classmethod
    def from_general(cls, a, b, c):
        """Create from y=ax²+bx+c."""
        pass

    def focus(self):
        """Return (x, y) of the focus."""
        pass

    def directrix_y(self):
        """Return the y-value of the (horizontal) directrix."""
        pass

    def contains_point(self, x, y, tol=1e-9):
        """True if (x,y) satisfies the parabola equation."""
        pass

    def y_at(self, x):
        """Return y for a given x on the parabola."""
        pass

# --- tests: do not modify ---
par = Parabola(0, 0, 2)
assert par.contains_point(4, 2)          # 4²=16=4*2*2 ✓
assert par.focus() == (0, 2)
assert par.directrix_y() == -2

par2 = Parabola.from_general(2, -12, 23)
assert math.isclose(par2.h, 3, abs_tol=1e-9)
assert math.isclose(par2.k, 5, abs_tol=1e-9)
assert math.isclose(par2.p, 0.125, abs_tol=1e-9)

assert math.isclose(par.y_at(4), 2, abs_tol=1e-9)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Intersections**

```python
import math

def parabola_line_pts(h, k, p, m, c):
    """Intersect (x-h)²=4p(y-k) with y=mx+c. Returns list of (x,y)."""
    pass

# --- tests: do not modify ---
pts = parabola_line_pts(0, 0, 2, 1, 2)   # x²=8y ∩ y=x+2
assert len(pts) == 2
xs = sorted(p[0] for p in pts)
assert math.isclose(xs[0], 4 - 4*math.sqrt(2), abs_tol=1e-6)
assert math.isclose(xs[1], 4 + 4*math.sqrt(2), abs_tol=1e-6)

pts_tangent = parabola_line_pts(0, 0, 2, 0, 0)  # through the vertex only
assert len(pts_tangent) == 1

pts_miss = parabola_line_pts(0, 0, 2, 1, -10)
assert len(pts_miss) == 0
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Reflective property, generalized**

```python
import math
import numpy as np

def reflects_to_focus(h, k, p, x0, tol=1e-6):
    """
    Fire a vertical ray down at x=x0 onto parabola (x-h)²=4p(y-k).
    Return True if the reflected ray passes through the focus.
    Reuse the tangent-slope and vector-reflection ideas from the lesson.
    """
    pass

# --- tests: do not modify ---
for x0 in [-10, -3, 0.5, 7]:
    assert reflects_to_focus(0, 0, 3, x0), f"failed at x0={x0}"
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** A parabolic microphone dish has focal length $p=20\text{cm}$.
Sound arrives as parallel waves along the axis. Prove, using the
reflective property, that placing the microphone exactly at the
focus is the *only* position where all reflected sound arrives in
phase (i.e., having travelled the same total distance from the
wavefront to the microphone).

<details><summary>Answer</summary>
Consider a wavefront as a horizontal line at height $y_0$ above the
dish, arriving simultaneously at every point of the dish (parallel
rays, same starting height). For a ray striking the dish at
$(x,y)$, the distance travelled to that point is $y_0-y$. By the
locus definition, $\text{dist}((x,y),F)=\text{dist}((x,y),\ell)=y-(-p)=y+p$
where $\ell$ is the directrix $y=-p$. The *total* path length from
the wavefront to the focus, via the dish, is
$(y_0-y)+\text{dist}((x,y),F)=(y_0-y)+(y+p)=y_0+p$ — independent of
$x$ and $y$. Every reflected ray travels the same total distance to
the focus, regardless of where it struck the dish, so all arrive in
phase only there. $\blacksquare$
</details>
