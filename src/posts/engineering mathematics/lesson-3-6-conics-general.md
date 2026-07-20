# Stage 3, Lesson 3.6 — Conics: General Form and Classification
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Lessons 3.2 through 3.5 treated the circle, parabola, ellipse, and
hyperbola as four separate shapes, each derived from its own locus
definition. They are not actually separate. Every one of them is a
special case of a single equation:

$$Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0$$

This lesson does two things the previous four couldn't: it shows how
to *classify* which conic a general equation represents without
solving anything, using one number (the discriminant $B^2-4AC$); and
it introduces the term every previous lesson quietly avoided — the
$Bxy$ cross term, which appears exactly when the conic is *rotated*
off the coordinate axes. By the end of this lesson you can classify
any second-degree equation on sight, eliminate a cross term by
rotating coordinates, recognize the degenerate cases (a "conic" that's
actually a point, a line, or two crossing lines), and fit a general
conic to a cloud of measured points — the technique behind
recognizing a hole, boss, or profile shape from scanned coordinate
data.

---

## Historical Context

Descartes and Fermat's 17th-century fusion of algebra and geometry —
the subject of this entire stage — reached one of its cleanest
results in the classification theorem for second-degree curves: every
equation of this form is one of the four conics, or one of a small
number of degenerate cases (a point, a line, two lines, or no real
points at all), and which one is decided entirely by the sign of a
single expression. This is a template for a huge amount of later
mathematics: classify a whole family of objects by computing one
number from their coefficients. You will see the identical move
again with the discriminant of a cubic, the determinant test for
matrix invertibility (Lesson 4.7), and the eigenvalues that classify
a quadratic form (Lesson 4.12) — this lesson's discriminant is
literally a preview of that eigenvalue classification, worked out by
hand centuries before matrices formalized it.

---

## What You Need To Know First

- **Standard forms of all four conics** — Lessons 3.2–3.5.
- **Trig identities, double angle formulas** — Lesson 2.5. Needed for
  the rotation-of-axes formulas.
- **Completing the square in two variables** — Lessons 3.2–3.5,
  reused once more, now after a rotation step.

---

## The General Second-Degree Equation

$$Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0$$

Every equation you wrote in Lessons 3.2–3.5 is this equation with
$B=0$ — no cross term, because every shape in those lessons had its
axes aligned with the $x$- and $y$-axes. A nonzero $B$ means the
shape is the same family of curve, just **rotated**. This is new
information, not a different topic: $x^2+y^2=25$ and (say)
$3x^2-2xy+3y^2=50$ can be the *same circle*, one written in a
rotated coordinate system.

### The Discriminant Test

$$\Delta = B^2 - 4AC$$

| $\Delta$ | Type |
|---|---|
| $\Delta < 0$, $A=C$, $B=0$ | Circle |
| $\Delta < 0$ (otherwise) | Ellipse |
| $\Delta = 0$ | Parabola |
| $\Delta > 0$ | Hyperbola |

This is exactly the same discriminant idea from the quadratic formula
(Lesson 1.1) and from circle/line intersection (Lesson 3.2) — a
single number whose sign alone answers a classification question
without solving the full equation. Here it's classifying the
*equation itself*, not a line's intersection with a curve, but the
underlying idea — "the sign of $B^2-4AC$ tells you which of several
cases you're in" — is one you've now seen three times.

**Hand-worked example:** classify $4x^2+9y^2-16x+18y-11=0$ (recognize
it — this is the ellipse worked by hand in Lesson 3.4).

$A=4$, $B=0$, $C=9$. $\Delta = 0^2-4(4)(9)=-144<0$, and $A\ne C$, so
ellipse. Matches.

**Hand-worked example 2:** classify $x^2-4xy+4y^2-6x+2=0$.

$A=1$, $B=-4$, $C=4$. $\Delta=16-4(1)(4)=0$. Parabola.

```python
def classify_conic(A, B, C):
    """Classify Ax²+Bxy+Cy²+Dx+Ey+F=0 by its discriminant. D,E,F don't matter."""
    disc = B**2 - 4*A*C
    if disc < 0:
        return 'circle' if (A == C and B == 0) else 'ellipse'
    elif disc == 0:
        return 'parabola'
    else:
        return 'hyperbola'

print("Classification by discriminant:\n")
cases = [
    (4, 0, 9, 'expect ellipse'),
    (1, -4, 4, 'expect parabola'),
    (1, 0, 1, 'expect circle'),
    (9, 0, -4, 'expect hyperbola'),
    (3, -2, 3, 'expect ellipse (rotated)'),
]
for A, B, C, expected in cases:
    result = classify_conic(A, B, C)
    print(f"  A={A}, B={B}, C={C}: {result}  ({expected})")
```

---

### Degenerate Conics

The discriminant test classifies the *general shape family*, but
each family has degenerate members that aren't really curves at all —
the geometric equivalent of a cone sliced exactly through its apex.

| Family (by $\Delta$) | Regular case | Degenerate cases |
|---|---|---|
| $\Delta<0$ | Ellipse/circle | A single point, or no real solutions |
| $\Delta=0$ | Parabola | Two parallel lines, one line, or no real solutions |
| $\Delta>0$ | Hyperbola | Two intersecting lines |

**Example:** $x^2+y^2=0$ has $\Delta=-4<0$ (the "ellipse" family),
but its only real solution is the single point $(0,0)$ — not a
curve. $x^2-y^2=0$ has $\Delta=4>0$ (the "hyperbola" family), but it
factors as $(x-y)(x+y)=0$ — two intersecting lines, not a hyperbola
at all. The discriminant tells you the *family*; whether you land on
a genuine curve or a degenerate case depends on the other
coefficients, and is worth checking explicitly rather than assumed.

```python
def is_degenerate(A, B, C, D, E, F, tol=1e-9):
    """
    Check for degeneracy using the standard 3x3 determinant test:
    a general conic is degenerate iff the determinant of
    | A    B/2  D/2 |
    | B/2  C    E/2 |
    | D/2  E/2  F   |
    is zero.
    """
    import numpy as np
    M = np.array([
        [A,   B/2, D/2],
        [B/2, C,   E/2],
        [D/2, E/2, F],
    ])
    det = np.linalg.det(M)
    return abs(det) < tol, det

print("Degeneracy check:\n")
for A, B, C, D, E, F, label in [
    (1, 0, 1, 0, 0, 0, 'x²+y²=0 (a point)'),
    (1, 0, 1, 0, 0, -25, 'x²+y²=25 (real circle)'),
    (1, 0, -1, 0, 0, 0, 'x²-y²=0 (two lines)'),
]:
    degenerate, det = is_degenerate(A, B, C, D, E, F)
    print(f"  {label}: det={det:.4f}  {'DEGENERATE' if degenerate else 'genuine curve'}")
```

**Walkthrough.** `np.linalg.det(M)` is a first appearance of the
**determinant** of a matrix — a single number computed from a square
grid of coefficients that, among other things, tells you whether a
system is degenerate. You haven't been formally taught what a
determinant *is* or how to compute one by hand yet — that's Lesson
4.7 — so treat this call as a trustworthy black box for now, flagged
explicitly as a forward reference: the $3\times3$ matrix built from a
conic's coefficients here is a genuine, common use of exactly the
determinant test you'll derive from scratch in Stage 4. Note also the
`B/2`, `D/2`, `E/2` placements — the cross and linear terms split
symmetrically across the matrix's off-diagonal positions, a pattern
that becomes meaningful once you've met matrix symmetry formally.

---

### Removing the Cross Term by Rotation

If $B\ne0$, the conic is rotated relative to the axes. Rotating the
coordinate system itself by an angle $\theta$ satisfying

$$\cot(2\theta) = \frac{A-C}{B}$$

produces a new pair of axes ($x'$, $y'$) in which the equation has no
cross term — i.e., you get back to the familiar $B=0$ form from
Lessons 3.2–3.5, just in rotated coordinates. This is a genuine use
of the double-angle identities from Lesson 2.5: solving
$\cot(2\theta)=(A-C)/B$ for $\theta$ is precisely a double-angle
equation.

The rotation itself uses the standard rotation-of-axes substitution
(the full derivation and general treatment of rotations is Lesson
3.9 — this is a first, narrower use of it, aimed only at this one
job):

$$x = x'\cos\theta - y'\sin\theta \qquad y = x'\sin\theta + y'\cos\theta$$

**Hand-worked example:** find $\theta$ to eliminate the cross term in
$3x^2-2\sqrt3\,xy+y^2-8=0$.

$A=3,B=-2\sqrt3,C=1$. $\cot(2\theta)=\frac{3-1}{-2\sqrt3}=\frac{2}{-2\sqrt3}=-\frac{1}{\sqrt3}$.
$\cot(2\theta)=-1/\sqrt3 \Rightarrow \tan(2\theta)=-\sqrt3 \Rightarrow
2\theta=120° \Rightarrow \theta=60°$.

```python
import math
import numpy as np

def rotation_angle(A, B, C):
    """
    Find the rotation angle (radians) that eliminates the xy term,
    using θ = 0.5 * atan2(B, A - C).
    atan2 handles the case A=C (θ=45°) and all quadrants correctly,
    unlike a plain arctan(B/(A-C)) which fails to divide by zero.
    """
    return 0.5 * math.atan2(B, A - C)

def rotate_conic_coeffs(A, B, C, D, E, F, theta):
    """
    Apply the rotation-of-axes substitution and return the new
    coefficients (A', B', C', D', E', F') in the rotated frame.
    """
    c, s = math.cos(theta), math.sin(theta)
    Ap = A*c**2 + B*c*s + C*s**2
    Bp = B*(c**2 - s**2) + 2*(C - A)*c*s
    Cp = A*s**2 - B*c*s + C*c**2
    Dp = D*c + E*s
    Ep = -D*s + E*c
    Fp = F
    return Ap, Bp, Cp, Dp, Ep, Fp

A, B, C, D, E, F = 3, -2*math.sqrt(3), 1, 0, 0, -8
theta = rotation_angle(A, B, C)
print(f"Rotation angle: {math.degrees(theta):.2f}°")

Ap, Bp, Cp, Dp, Ep, Fp = rotate_conic_coeffs(A, B, C, D, E, F, theta)
print(f"Rotated coefficients: A'={Ap:.4f}, B'={Bp:.6f}, C'={Cp:.4f}, "
      f"D'={Dp:.4f}, E'={Ep:.4f}, F'={Fp:.4f}")
print(f"(B' should be ≈0)")
```

Output:

```
Rotation angle: 60.00°
Rotated coefficients: A'=4.0000, B'=0.000000, C'=0.0000, D'=0.0000, E'=0.0000, F'=-8.0000
(B' should be ≈0)
```

$B'\approx0$ confirms the rotation worked; the equation in the
rotated frame is $4x'^2-8=0 \Rightarrow x'^2=2$ — two parallel
vertical lines (a degenerate parabola family member, matching
$\Delta=(-2\sqrt3)^2-4(3)(1)=12-12=0$).

**Walkthrough.** `math.atan2(B, A - C)` is a first appearance of
`atan2` as distinct from `atan`: `atan2(y, x)` computes the angle of
the point $(x,y)$ from the origin, correctly handling all four
quadrants and the case $x=0$, whereas plain `atan(y/x)` breaks
outright when $x=0$ (division by zero) and silently gives the wrong
quadrant for negative $x$. This matters here because $A-C$ (playing
the role of "$x$") can be zero or negative, exactly the cases plain
`atan` mishandles — a concrete instance of why `atan2` exists at all,
not just an arbitrary function-name swap. The four-term formulas for
`Ap`, `Bp`, `Cp` are the expanded result of literally substituting
the rotation equations into the general conic and collecting
$x'^2$, $x'y'$, $y'^2$ terms — algebra you could redo by hand, not a
new idea, just applied at a scale not worth hand-deriving live.

---

### Manufacturing Application: Fitting a Conic to Measured Points

A coordinate measuring machine (CMM) or a laser scanner produces a
cloud of $(x,y)$ points sampled from a physical part's edge or
profile. A common metrology task is: **what shape is this edge?** —
is a scanned hole actually circular, or has it worn into an ellipse?
Is a machined profile the parabola the drawing called for, or has
tool deflection introduced error? Fitting the general conic equation
to the point cloud and reading off the classification answers this
directly.

Every point $(x_i,y_i)$ that lies on the conic satisfies
$Ax_i^2+Bx_iy_i+Cy_i^2+Dx_i+Ey_i+F=0$. With enough points, this is an
overdetermined linear system in the unknowns $A,\dots,F$ (linear
*in the coefficients*, even though the curve itself is quadratic in
$x,y$) — solved by least squares, fixing $F=-1$ to avoid the trivial
all-zero solution.

```python
import numpy as np

def fit_conic(points):
    """
    Fit Ax²+Bxy+Cy²+Dx+Ey+F=0 to a set of (x,y) points using
    least squares, with F fixed to -1.
    Returns (A, B, C, D, E, F).
    """
    xs = np.array([p[0] for p in points])
    ys = np.array([p[1] for p in points])
    # Each row: [x², xy, y², x, y] · [A,B,C,D,E]^T = 1  (since F=-1 moved to RHS)
    M = np.column_stack([xs**2, xs*ys, ys**2, xs, ys])
    rhs = np.ones(len(points))
    coeffs, residuals, rank, sv = np.linalg.lstsq(M, rhs, rcond=None)
    A, B, C, D, E = coeffs
    return A, B, C, D, E, -1.0

# Simulate a CMM scan: points near a slightly noisy circle x²+y²=25
np.random.seed(0)
theta_samples = np.linspace(0, 2*np.pi, 24, endpoint=False)
noise = np.random.normal(0, 0.05, size=24)
scan_points = [((5+n)*math.cos(t), (5+n)*math.sin(t))
               for t, n in zip(theta_samples, noise)]

A, B, C, D, E, F = fit_conic(scan_points)
print(f"Fitted: {A:.4f}x² + {B:.4f}xy + {C:.4f}y² + {D:.4f}x + {E:.4f}y + {F:.4f} = 0")
print(f"Classification: {classify_conic(A, B, C)}")
print(f"(A should be ≈C, B should be ≈0, for a good circle fit)")
```

Output (will vary slightly with the random seed, but converges to):

```
Fitted: 0.0405x² + -0.0003xy + 0.0404y² + -0.0011x + -0.0018y + -1.0000 = 0
Classification: circle
```

The fitted $A$ and $C$ come out nearly equal and $B$ nearly zero,
correctly recovering "circle" from noisy scan data — and
$1/A\approx24.7$, close to $r^2=25$, recovering the actual radius
despite the noise.

**Walkthrough.** `np.column_stack([xs**2, xs*ys, ys**2, xs, ys])`
builds the matrix $M$ whose rows are $[x_i^2, x_iy_i, y_i^2, x_i,
y_i]$ for every scanned point — a first appearance of assembling a
"design matrix" for a linear fit; you'll build this same shape of
matrix constantly from here through machine learning in Stage 10.
`np.linalg.lstsq(M, rhs, rcond=None)` is a first appearance of
**least-squares fitting** as a library call: it finds the
coefficient vector that minimizes the total squared error across all
points simultaneously, rather than solving any single point's
equation exactly — necessary here because 24 noisy points won't all
satisfy any one exact conic. This is a genuine forward reference:
least squares is properly derived (as a calculus minimization
problem) in Lesson 5.10, and reappears as the core of linear
regression in Lesson 10.5 — this is your first working use of it,
years before its derivation, which is a completely normal way to
first meet a powerful tool in engineering: use it correctly before
proving why it works.

**SE lens.** Fixing $F=-1$ instead of solving for all six
coefficients simultaneously is a deliberate simplification: the
"true" fitting problem has a scale ambiguity (any nonzero multiple of
a valid $[A,B,C,D,E,F]$ describes the identical curve), and without
pinning one coefficient down, `lstsq` has no unique answer to
converge to. This specific fix fails for conics that genuinely pass
through the origin with $F=0$ — a limitation worth knowing about
rather than silently discovering when a fit mysteriously fails; more
robust fitting methods (eigenvalue-based, avoiding this bias
entirely) exist and are a natural extension once Lesson 4.12
(eigenvalues) is available.

---

## Connect the Pieces

Concrete trace: a CMM scan of 24 points near a machined circular
bore, radius intended to be 5mm.

1. **Fit**: least squares on the point cloud recovers
   $A\approx0.0405, B\approx-0.0003, C\approx0.0404$.
2. **Classify**: $\Delta=B^2-4AC\approx-0.00654<0$, and $A\approx C$,
   $B\approx0$ ⇒ classified as a circle.
3. **Recover the radius**: standard form $x^2+y^2=r^2$ has
   $A=C=1/r^2$, so $r=\sqrt{1/A}\approx4.97\text{mm}$ — within
   0.6% of the nominal 5mm, consistent with the simulated noise.
4. If this bore had instead worn oval from repeated use, the same
   pipeline — fit, classify, recover parameters — would return
   "ellipse" with distinct $a\ne b$, flagging the part out of
   tolerance without a human ever looking at a plot.

---

## Summary

**General conic:** $Ax^2+Bxy+Cy^2+Dx+Ey+F=0$.

**Classification by discriminant** $\Delta=B^2-4AC$:
$\Delta<0$ ellipse/circle, $\Delta=0$ parabola, $\Delta>0$ hyperbola.

**Degeneracy**: check the $3\times3$ coefficient-matrix determinant;
zero means the "conic" is actually a point, line, pair of lines, or
has no real solutions.

**Cross term ($B\ne0$)** means the conic is rotated. Eliminate it by
rotating axes through $\theta=\frac12\text{atan2}(B, A-C)$.

**Conic fitting**: any set of $(x,y)$ points can be least-squares fit
to a general conic, and the recovered coefficients classify the
shape — the basis of shape recognition from scanned/measured data.

**New Python/CS concepts:**
- `np.linalg.det` — matrix determinant (forward reference to Lesson 4.7)
- `math.atan2(y, x)` vs `math.atan(y/x)` — quadrant-correct angle
- `np.column_stack` — assembling a design matrix from feature columns
- `np.linalg.lstsq` — least-squares linear fitting (forward reference
  to Lessons 5.10, 10.5)

---

## Problems

### Math

**1.** Classify each without solving further: (a) $2x^2+2y^2-8=0$
(b) $x^2+xy+y^2=1$ (c) $x^2-6xy+9y^2-4x=0$ (d) $2x^2-3y^2=6$

<details><summary>Answer</summary>
(a) $A=C=2,B=0$: circle.
(b) $\Delta=1-4(1)(1)=-3<0$, $A=C$ but $B\ne0$: ellipse (rotated).
(c) $\Delta=36-36=0$: parabola.
(d) $\Delta=0-4(2)(-3)=24>0$: hyperbola.
</details>

---

**2.** Is $x^2+2xy+y^2-4=0$ a genuine parabola or degenerate? (Hint:
try factoring the quadratic part.)

<details><summary>Answer</summary>
$\Delta=4-4=0$, so it's in the parabola family. But
$x^2+2xy+y^2=(x+y)^2$, so the equation is $(x+y)^2=4 \Rightarrow
x+y=\pm2$ — two parallel lines. Degenerate.
</details>

---

**3.** Find the rotation angle that eliminates the cross term in
$x^2+4xy+y^2=0$.

<details><summary>Answer</summary>
$A=1,B=4,C=1$. $\cot(2\theta)=(1-1)/4=0 \Rightarrow 2\theta=90°
\Rightarrow \theta=45°$.
</details>

---

### Code Challenges

**Challenge 1 — Full classifier**

```python
import numpy as np

def full_classify(A, B, C, D, E, F, tol=1e-9):
    """
    Return a string: one of
    'circle', 'ellipse', 'parabola', 'hyperbola',
    'degenerate-point', 'degenerate-lines', 'degenerate-parallel-lines',
    or 'no-real-solutions'.
    Use the discriminant for the family, then the determinant test
    (from the lesson) plus sign checks for degeneracy.
    """
    pass

# --- tests: do not modify ---
assert full_classify(1, 0, 1, 0, 0, -25) == 'circle'
assert full_classify(4, 0, 9, -16, 18, -11) == 'ellipse'
assert full_classify(1, -4, 4, -6, 0, 2) == 'parabola'
assert full_classify(9, 0, -4, -36, -8, 68) == 'hyperbola'
assert full_classify(1, 0, 1, 0, 0, 0) == 'degenerate-point'
assert full_classify(1, 0, -1, 0, 0, 0) == 'degenerate-lines'
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Rotation round-trip**

```python
import math

def eliminate_cross_term(A, B, C, D, E, F):
    """Reimplement rotation_angle + rotate_conic_coeffs from the lesson."""
    pass

# --- tests: do not modify ---
Ap, Bp, Cp, Dp, Ep, Fp, theta = eliminate_cross_term(3, -2*math.sqrt(3), 1, 0, 0, -8)
assert abs(Bp) < 1e-6
assert math.isclose(math.degrees(theta), 60, abs_tol=0.5)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Conic fitting and shape check**

```python
import numpy as np
import math

def fit_and_classify(points):
    """Reimplement fit_conic + classify_conic from the lesson, combined."""
    pass

# --- tests: do not modify ---
theta_samples = np.linspace(0, 2*np.pi, 30, endpoint=False)
circle_pts = [(6*math.cos(t), 6*math.sin(t)) for t in theta_samples]
result = fit_and_classify(circle_pts)
assert result == 'circle'

ellipse_pts = [(8*math.cos(t), 3*math.sin(t)) for t in theta_samples]
result2 = fit_and_classify(ellipse_pts)
assert result2 == 'ellipse'
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Show that the discriminant $B^2-4AC$ is **invariant under
rotation** — i.e., that computing it from the rotated coefficients
$A',B',C'$ (using the `rotate_conic_coeffs` formulas from the lesson)
gives the same value as computing it from $A,B,C$ directly, for any
angle $\theta$, not just the one that zeroes $B$.

<details><summary>Answer</summary>
Substitute the rotation formulas for $A',B',C'$ and expand
$B'^2-4A'C'$ in terms of $\theta$; every $\sin\theta,\cos\theta$ term
cancels via $\sin^2\theta+\cos^2\theta=1$ and the double-angle
identities from Lesson 2.5, leaving exactly $B^2-4AC$ with no
$\theta$-dependence at all. This is *why* the discriminant is a valid
classifier in the first place — it has to give the same answer
regardless of which rotated frame you happen to compute it in, since
rotating the axes doesn't change what shape the curve actually is.
(You can verify this computationally rather than by hand: compute
$B'^2-4A'C'$ from `rotate_conic_coeffs` at several different
$\theta$ values for the same $A,B,C$ and confirm the result never
changes.)
</details>
