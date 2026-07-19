# Stage 2, Lesson 2.5 — Trigonometric Identities
**Threads:** Math · Physics · CS  
**Estimated time:** 65–80 minutes

---

## What This Lesson Is About

A trigonometric identity is an equation that is true for every value
of the variable (where both sides are defined). Unlike an equation that
has specific solutions, an identity holds universally. Identities are
the algebra of trigonometry: they let you rewrite expressions in more
useful forms, simplify complicated wave functions, derive new results
from known ones, and solve equations that would otherwise be intractable.
This lesson builds the complete toolkit: the Pythagorean identities
(already seen in Lesson 2.3), the symmetry identities (even/odd and
cofunction), and the most powerful set of all — the angle addition
formulas and their consequences (double angle, half angle). By the end
you can prove identities, apply them to simplify expressions, and derive
exact values for angles like $15°$ and $75°$ that are not on the standard
unit circle.

---

## What You Need To Know First

- **All six trig functions** — Lessons 2.1–2.3.
- **Pythagorean identities** — Lesson 2.3.
- **Unit circle values** — Lesson 2.1.

---

## The Lesson

### The Strategy for Proving Identities

An identity proof is different from solving an equation. You cannot
cross-multiply or add things to both sides — because you don't yet know
the two sides are equal (that's what you're trying to prove).

**The rules:**

1. Work on **one side only** — transform it until it matches the other.
2. Start with the **more complicated side**.
3. Use algebra and known identities to simplify.
4. Never assume the conclusion.

**Common tactics:**
- Rewrite everything in terms of $\sin$ and $\cos$
- Factor, expand, combine fractions
- Multiply top and bottom by a conjugate
- Use $1 = \sin^2\theta + \cos^2\theta$ to substitute

---

### The Three Groups of Identities

#### Group 1 — Pythagorean Identities (Lesson 2.3)

$$\sin^2\theta + \cos^2\theta = 1$$
$$1 + \tan^2\theta = \sec^2\theta$$
$$\cot^2\theta + 1 = \csc^2\theta$$

**Rearrangements** (frequently needed):

$$\sin^2\theta = 1 - \cos^2\theta \qquad \cos^2\theta = 1 - \sin^2\theta$$
$$\tan^2\theta = \sec^2\theta - 1 \qquad \sec^2\theta - 1 = \tan^2\theta$$

#### Group 2 — Symmetry Identities

**Even/odd** (from Lesson 2.2 — the unit circle reflection):

$$\cos(-\theta) = \cos\theta \quad \text{(even)}$$
$$\sin(-\theta) = -\sin\theta \quad \text{(odd)}$$
$$\tan(-\theta) = -\tan\theta \quad \text{(odd)}$$

**Cofunction identities** — each function equals its "co-" at the complementary angle $\pi/2 - \theta$:

$$\sin\theta = \cos\!\left(\frac{\pi}{2}-\theta\right) \qquad \cos\theta = \sin\!\left(\frac{\pi}{2}-\theta\right)$$

$$\tan\theta = \cot\!\left(\frac{\pi}{2}-\theta\right) \qquad \sec\theta = \csc\!\left(\frac{\pi}{2}-\theta\right)$$

*Proof of the first:* On the unit circle, the point at angle $\theta$ is
$(\cos\theta, \sin\theta)$. The point at angle $\pi/2-\theta$ is obtained
by reflecting across the line $y=x$ (swapping coordinates):
$(\sin\theta, \cos\theta)$. The $x$-coordinate of the point at $\pi/2-\theta$
is $\cos(\pi/2-\theta)$, so $\cos(\pi/2-\theta) = \sin\theta$. $\blacksquare$

The word "cosine" literally means "complement's sine" — $\cos\theta = \sin(90°-\theta)$.

#### Group 3 — Angle Addition Formulas

These are the most powerful identities. They express $\sin$ and $\cos$
of a sum of two angles in terms of $\sin$ and $\cos$ of the individual angles:

$$\boxed{\sin(\alpha+\beta) = \sin\alpha\cos\beta + \cos\alpha\sin\beta}$$
$$\boxed{\cos(\alpha+\beta) = \cos\alpha\cos\beta - \sin\alpha\sin\beta}$$

**Subtraction versions** (replace $\beta$ with $-\beta$ and use even/odd):

$$\sin(\alpha-\beta) = \sin\alpha\cos\beta - \cos\alpha\sin\beta$$
$$\cos(\alpha-\beta) = \cos\alpha\cos\beta + \sin\alpha\sin\beta$$

**Tangent addition:**

$$\tan(\alpha\pm\beta) = \frac{\tan\alpha\pm\tan\beta}{1\mp\tan\alpha\tan\beta}$$

These four are derived from just two (the $\sin$ and $\cos$ sum formulas).

**Proof of $\cos(\alpha+\beta)$** (from the distance formula — one of
several approaches):

Consider two points on the unit circle at angles $\alpha$ and $-\beta$:
$A = (\cos\alpha, \sin\alpha)$ and $B = (\cos(-\beta), \sin(-\beta)) = (\cos\beta, -\sin\beta)$.

The distance $|AB|^2 = (\cos\alpha-\cos\beta)^2 + (\sin\alpha+\sin\beta)^2$
$= \cos^2\alpha - 2\cos\alpha\cos\beta + \cos^2\beta + \sin^2\alpha + 2\sin\alpha\sin\beta + \sin^2\beta$
$= 2 - 2\cos\alpha\cos\beta + 2\sin\alpha\sin\beta$.

The same distance using the angle between $A$ and $B$ (which is $\alpha+\beta$,
measured around the circle from $B$ to $A$) gives:
$|AB|^2 = 2 - 2\cos(\alpha+\beta)$.

Setting equal: $\cos(\alpha+\beta) = \cos\alpha\cos\beta - \sin\alpha\sin\beta$. $\blacksquare$

---

### Deriving Exact Values

The addition formulas let us compute exact values at angles beyond
the standard $0°, 30°, 45°, 60°, 90°$.

**Example:** Find $\sin(75°)$ exactly.

Write $75° = 45° + 30°$:

$$\sin(75°) = \sin(45°+30°) = \sin 45°\cos 30° + \cos 45°\sin 30°$$
$$= \frac{\sqrt{2}}{2}\cdot\frac{\sqrt{3}}{2} + \frac{\sqrt{2}}{2}\cdot\frac{1}{2}
= \frac{\sqrt{6}}{4} + \frac{\sqrt{2}}{4} = \frac{\sqrt{6}+\sqrt{2}}{4}$$

**Verify:** $(\sqrt{6}+\sqrt{2})/4 \approx (2.449+1.414)/4 \approx 0.9659$,
and $\sin(75°) \approx 0.9659$. ✓

**Example:** Find $\cos(15°)$ exactly.

Write $15° = 45° - 30°$:

$$\cos(15°) = \cos(45°-30°) = \cos 45°\cos 30° + \sin 45°\sin 30°$$
$$= \frac{\sqrt{2}}{2}\cdot\frac{\sqrt{3}}{2} + \frac{\sqrt{2}}{2}\cdot\frac{1}{2}
= \frac{\sqrt{6}+\sqrt{2}}{4}$$

Note: $\sin(75°) = \cos(15°)$ — confirmed by the cofunction identity. ✓

```python
import math
import numpy as np

def sin_exact(alpha_deg, beta_deg):
    """
    Compute sin(alpha + beta) using the addition formula,
    showing each step numerically.
    """
    a = math.radians(alpha_deg)
    b = math.radians(beta_deg)
    result_formula = math.sin(a)*math.cos(b) + math.cos(a)*math.sin(b)
    result_direct  = math.sin(a + b)
    return result_formula, result_direct

def cos_exact(alpha_deg, beta_deg):
    """Compute cos(alpha + beta) using the addition formula."""
    a = math.radians(alpha_deg)
    b = math.radians(beta_deg)
    result_formula = math.cos(a)*math.cos(b) - math.sin(a)*math.sin(b)
    result_direct  = math.cos(a + b)
    return result_formula, result_direct

print("Exact values via addition formulas:\n")
print(f"{'Angle':>12}  {'Formula':>12}  {'Direct':>12}  {'Match':>6}")
print("-" * 50)

cases = [
    ("sin(75°)",  lambda: sin_exact(45, 30)),
    ("cos(15°)",  lambda: cos_exact(45, 30)),
    ("sin(105°)", lambda: sin_exact(60, 45)),
    ("cos(255°)", lambda: cos_exact(210, 45)),
    ("sin(5π/12)",lambda: sin_exact(45, 30)),  # 5π/12 = 75°
]

for label, fn in cases:
    formula, direct = fn()
    match = math.isclose(formula, direct, rel_tol=1e-10)
    print(f"{label:>12}  {formula:>12.8f}  {direct:>12.8f}  {'✓' if match else '✗':>6}")

print()
# Special exact forms
sqrt2, sqrt3, sqrt6 = math.sqrt(2), math.sqrt(3), math.sqrt(6)
print("Exact radical forms:")
print(f"  sin(75°) = (√6+√2)/4 = {(sqrt6+sqrt2)/4:.8f}")
print(f"  cos(15°) = (√6+√2)/4 = {(sqrt6+sqrt2)/4:.8f}")
print(f"  sin(15°) = (√6-√2)/4 = {(sqrt6-sqrt2)/4:.8f}")
print(f"  cos(75°) = (√6-√2)/4 = {(sqrt6-sqrt2)/4:.8f}")
```

**Walkthrough:** `math.radians(alpha_deg)` converts degrees to radians
for the standard `math.sin` and `math.cos` functions. The function
computes the result two ways — via the addition formula and directly —
and the `cases` list uses `lambda:` to defer the call so each function
is evaluated once in the loop. `f"{'✓' if match else '✗':>6}"` is a
conditional inside an f-string format spec — the `>6` right-aligns the
emoji in a 6-character field.

---

### Double Angle Formulas

Set $\beta = \alpha$ in the addition formulas:

$$\boxed{\sin(2\alpha) = 2\sin\alpha\cos\alpha}$$

$$\cos(2\alpha) = \cos^2\alpha - \sin^2\alpha$$

Using $\sin^2+\cos^2=1$, two equivalent forms:

$$\cos(2\alpha) = 1 - 2\sin^2\alpha = 2\cos^2\alpha - 1$$

**Tangent double angle:**

$$\tan(2\alpha) = \frac{2\tan\alpha}{1-\tan^2\alpha}$$

**Half angle formulas** (solve the double angle formula for $\sin^2$ and $\cos^2$):

$$\cos^2\alpha = \frac{1+\cos(2\alpha)}{2} \qquad \sin^2\alpha = \frac{1-\cos(2\alpha)}{2}$$

Taking square roots (sign depends on the quadrant of $\alpha/2$):

$$\cos\!\frac{\alpha}{2} = \pm\sqrt{\frac{1+\cos\alpha}{2}} \qquad \sin\!\frac{\alpha}{2} = \pm\sqrt{\frac{1-\cos\alpha}{2}}$$

**Hand-worked example:** Find $\sin(22.5°)$ exactly.

$22.5° = 45°/2$, so use the half-angle formula with $\alpha = 45°$:

$$\sin(22.5°) = \sqrt{\frac{1-\cos 45°}{2}} = \sqrt{\frac{1-\sqrt{2}/2}{2}} = \sqrt{\frac{2-\sqrt{2}}{4}} = \frac{\sqrt{2-\sqrt{2}}}{2}$$

(positive because $22.5°$ is in Q1).

**Verify:** $\frac{\sqrt{2-\sqrt{2}}}{2} = \frac{\sqrt{2-1.414}}{2} \approx \frac{\sqrt{0.586}}{2} \approx \frac{0.765}{2} \approx 0.383$,
and $\sin(22.5°) \approx 0.383$. ✓

```python
import math
import numpy as np
import matplotlib.pyplot as plt

# Demonstrate double angle formulas visually
theta = np.linspace(0, 2*np.pi, 400)

fig, axes = plt.subplots(1, 2, figsize=(13, 5))

# Left: sin(2θ) = 2sin(θ)cos(θ)
axes[0].plot(theta, np.sin(2*theta),
             color='#2980b9', lw=2.5, label='$\\sin(2\\theta)$')
axes[0].plot(theta, 2*np.sin(theta)*np.cos(theta),
             color='#e74c3c', lw=1.5, linestyle='--',
             label='$2\\sin\\theta\\cos\\theta$')
axes[0].axhline(0, color='#333', lw=0.8)
axes[0].set_title('$\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta$\n'
                  '(dashed overlays solid — same function)', fontsize=10)
axes[0].set_xlabel('$\\theta$'); axes[0].set_ylabel('$y$')
axes[0].legend(fontsize=9); axes[0].grid(True, alpha=0.3)

# Right: three forms of cos(2θ)
axes[1].plot(theta, np.cos(2*theta),
             color='#2980b9', lw=3, label='$\\cos(2\\theta)$', alpha=0.6)
axes[1].plot(theta, np.cos(theta)**2 - np.sin(theta)**2,
             color='#e74c3c', lw=2, linestyle='--',
             label='$\\cos^2\\theta - \\sin^2\\theta$')
axes[1].plot(theta, 1 - 2*np.sin(theta)**2,
             color='#27ae60', lw=1.5, linestyle=':',
             label='$1 - 2\\sin^2\\theta$')
axes[1].axhline(0, color='#333', lw=0.8)
axes[1].set_title('Three equivalent forms of $\\cos(2\\theta)$\n'
                  '(all three curves coincide)', fontsize=10)
axes[1].set_xlabel('$\\theta$'); axes[1].set_ylabel('$y$')
axes[1].legend(fontsize=9); axes[1].grid(True, alpha=0.3)

# π tick marks
for ax in axes:
    ax.set_xticks([0, math.pi/2, math.pi, 3*math.pi/2, 2*math.pi])
    ax.set_xticklabels(['$0$','$\\pi/2$','$\\pi$','$3\\pi/2$','$2\\pi$'])

plt.suptitle('Double angle formulas: all three cos forms are identical',
             fontsize=12)
plt.tight_layout()
plt.show()

# Verify half-angle example
alpha = math.pi/4    # 45°
sin_half = math.sqrt((1 - math.cos(alpha))/2)
print(f"sin(22.5°) via half-angle: {sin_half:.8f}")
print(f"sin(22.5°) direct:         {math.sin(math.pi/8):.8f}")
print(f"Exact form: sqrt(2-sqrt(2))/2 = {math.sqrt(2-math.sqrt(2))/2:.8f}")
```

**Walkthrough:** The left plot overlays $\sin(2\theta)$ computed
directly against $2\sin\theta\cos\theta$ computed from the formula.
They produce identical arrays — the dashed line lies exactly on top
of the solid line. On the right, three formula variants for $\cos(2\theta)$
are plotted with different colours and styles; all three overlap perfectly.
Visually verifying that curves coincide is a standard sanity check when
working with identities.

---

### Proving Identities: Worked Examples

**Example 1:** Prove $\dfrac{\sin\theta}{1-\cos\theta} = \dfrac{1+\cos\theta}{\sin\theta}$.

*Strategy:* Cross-multiply is not allowed (we don't know they're equal yet).
Work on the left side:

$$\frac{\sin\theta}{1-\cos\theta} \cdot \frac{1+\cos\theta}{1+\cos\theta}
= \frac{\sin\theta(1+\cos\theta)}{1-\cos^2\theta}
= \frac{\sin\theta(1+\cos\theta)}{\sin^2\theta}
= \frac{1+\cos\theta}{\sin\theta} \checkmark$$

We used the Pythagorean identity $1-\cos^2\theta = \sin^2\theta$ and
the conjugate multiplication technique.

**Example 2:** Prove $\sin^4\theta - \cos^4\theta = \sin^2\theta - \cos^2\theta$.

*Strategy:* factor the left side as a difference of squares:

$$\sin^4\theta - \cos^4\theta = (\sin^2\theta - \cos^2\theta)(\sin^2\theta + \cos^2\theta)$$
$$= (\sin^2\theta - \cos^2\theta)(1) = \sin^2\theta - \cos^2\theta \checkmark$$

**Example 3:** Prove $\dfrac{\cos(2\theta)}{1+\sin(2\theta)} = \dfrac{\cos\theta - \sin\theta}{\cos\theta + \sin\theta}$.

Expand both numerator and denominator using double angle formulas:

$$\text{Numerator: } \cos(2\theta) = \cos^2\theta - \sin^2\theta = (\cos\theta-\sin\theta)(\cos\theta+\sin\theta)$$
$$\text{Denominator: } 1 + \sin(2\theta) = \sin^2\theta + \cos^2\theta + 2\sin\theta\cos\theta = (\cos\theta+\sin\theta)^2$$

$$\frac{(\cos\theta-\sin\theta)(\cos\theta+\sin\theta)}{(\cos\theta+\sin\theta)^2} = \frac{\cos\theta-\sin\theta}{\cos\theta+\sin\theta} \checkmark$$

```python
import math
import numpy as np

def verify_identity_numerically(lhs, rhs, n_points=500, tol=1e-8):
    """
    Verify a trig identity by evaluating both sides at many points.
    Skips points where either side has absolute value > 1e6 (near singularities).
    
    lhs, rhs: functions theta -> float
    Returns True if all checked points match within tol.
    """
    # np.linspace: 500 points from 0.1 to 2*pi-0.1, avoiding exact multiples of pi/2
    test_pts = np.linspace(0.1, 2*math.pi - 0.1, n_points)

    all_match = True
    n_checked = 0
    for t in test_pts:
        try:
            l = lhs(t)
            r = rhs(t)
            if abs(l) > 1e6 or abs(r) > 1e6:
                continue   # skip near singularities
            if not math.isclose(l, r, abs_tol=tol):
                print(f"  MISMATCH at t={t:.4f}: lhs={l:.6f}, rhs={r:.6f}")
                all_match = False
            n_checked += 1
        except (ZeroDivisionError, ValueError):
            pass   # skip undefined points

    return all_match, n_checked

print("Numerically verifying trig identities:\n")

identities = [
    ("sin²θ + cos²θ = 1",
     lambda t: math.sin(t)**2 + math.cos(t)**2,
     lambda t: 1.0),

    ("sin(θ)/(1-cos(θ)) = (1+cos(θ))/sin(θ)",
     lambda t: math.sin(t)/(1-math.cos(t)),
     lambda t: (1+math.cos(t))/math.sin(t)),

    ("sin⁴θ - cos⁴θ = sin²θ - cos²θ",
     lambda t: math.sin(t)**4 - math.cos(t)**4,
     lambda t: math.sin(t)**2 - math.cos(t)**2),

    ("cos(2θ)/(1+sin(2θ)) = (cosθ-sinθ)/(cosθ+sinθ)",
     lambda t: math.cos(2*t)/(1+math.sin(2*t)),
     lambda t: (math.cos(t)-math.sin(t))/(math.cos(t)+math.sin(t))),

    ("sin(α+β) = sinα cosβ + cosα sinβ  (β=π/6)",
     lambda t: math.sin(t + math.pi/6),
     lambda t: math.sin(t)*math.cos(math.pi/6) + math.cos(t)*math.sin(math.pi/6)),
]

for label, lhs, rhs in identities:
    ok, n = verify_identity_numerically(lhs, rhs)
    status = "✓" if ok else "✗"
    print(f"  {status}  {label}  (checked {n} points)")
```

**Walkthrough:** `verify_identity_numerically` implements a general
identity checker — it evaluates both sides at 500 random-ish points
and confirms they match. The `abs(l) > 1e6` check skips near-singular
points where numerical evaluation is unreliable. The `try/except` block
catches `ZeroDivisionError` (e.g., $\sin\theta = 0$ when evaluating
$1/\sin\theta$) and `ValueError` (e.g., $\sqrt{x}$ with negative $x$),
both of which signal a singularity rather than a genuine mismatch.

---

## Connect the Pieces

**What this lesson built on:** All six trig functions (Lessons 2.1–2.3).
The Pythagorean identity from Lesson 2.1. Even/odd functions from
Lesson 2.2. Proof strategies from Lessons 0.9–0.10.

**What this lesson makes possible:** Lesson 2.6 (Law of Sines and
Cosines) — proved using the addition formulas. Stage 5 (Calculus) —
$\frac{d}{dx}\sin x = \cos x$ is proved using the addition formula and
a limit calculation. Fourier analysis (Stage 7) — the product-to-sum
formulas (derivatives of the addition formulas) are used to show that
$\int_0^{2\pi}\sin(mx)\sin(nx)\,dx = 0$ for $m\neq n$, the
**orthogonality** of sinusoids.

**In engineering:** the addition formula $\cos(\alpha-\beta)$ is the
basis for **phase detection** in signal processing — multiplying two
signals $\cos(\omega t)$ and $\cos(\omega t + \phi)$ and low-pass
filtering gives $\frac{1}{2}\cos\phi$, from which $\phi$ is extracted.
This is how FM radio demodulation and motor position sensing work.

---

## Summary

**Pythagorean:**
$\sin^2\theta+\cos^2\theta=1$, $\quad 1+\tan^2\theta=\sec^2\theta$, $\quad \cot^2\theta+1=\csc^2\theta$

**Even/odd:**
$\cos(-\theta)=\cos\theta$, $\quad \sin(-\theta)=-\sin\theta$, $\quad \tan(-\theta)=-\tan\theta$

**Cofunction:**
$\sin\theta=\cos(\pi/2-\theta)$, $\quad \tan\theta=\cot(\pi/2-\theta)$

**Addition:**
$$\sin(\alpha\pm\beta)=\sin\alpha\cos\beta\pm\cos\alpha\sin\beta$$
$$\cos(\alpha\pm\beta)=\cos\alpha\cos\beta\mp\sin\alpha\sin\beta$$
$$\tan(\alpha\pm\beta)=\frac{\tan\alpha\pm\tan\beta}{1\mp\tan\alpha\tan\beta}$$

**Double angle:**
$\sin(2\alpha)=2\sin\alpha\cos\alpha$,
$\quad\cos(2\alpha)=\cos^2\alpha-\sin^2\alpha=1-2\sin^2\alpha=2\cos^2\alpha-1$

**Half angle:**
$\cos^2\alpha=\frac{1+\cos 2\alpha}{2}$, $\quad\sin^2\alpha=\frac{1-\cos 2\alpha}{2}$

---

## Problems

### Math

**1.** Find the exact value.

(a) $\sin(105°)$ &emsp; (b) $\cos(195°)$ &emsp; (c) $\tan(15°)$

<details>
<summary>Answers</summary>

(a) $\sin(60°+45°) = \sin 60°\cos 45°+\cos 60°\sin 45° = \frac{\sqrt{3}}{2}\cdot\frac{\sqrt{2}}{2}+\frac{1}{2}\cdot\frac{\sqrt{2}}{2} = \frac{\sqrt{6}+\sqrt{2}}{4}$

(b) $\cos(180°+15°) = -\cos(15°) = -\frac{\sqrt{6}+\sqrt{2}}{4}$

(c) $\tan(45°-30°) = \frac{1-1/\sqrt{3}}{1+1/\sqrt{3}} = \frac{\sqrt{3}-1}{\sqrt{3}+1} = \frac{(\sqrt{3}-1)^2}{2} = 2-\sqrt{3}$

</details>

---

**2.** If $\sin\alpha = 3/5$ ($\alpha$ in Q1) and $\cos\beta = -5/13$ ($\beta$ in Q2),
find $\sin(\alpha+\beta)$, $\cos(\alpha-\beta)$, and $\tan(2\alpha)$.

<details>
<summary>Answers</summary>

$\cos\alpha=4/5$, $\sin\beta=12/13$ (Q2, positive).

$\sin(\alpha+\beta) = \frac{3}{5}\cdot(-\frac{5}{13})+\frac{4}{5}\cdot\frac{12}{13} = -\frac{15}{65}+\frac{48}{65} = \frac{33}{65}$

$\cos(\alpha-\beta) = \frac{4}{5}\cdot(-\frac{5}{13})+\frac{3}{5}\cdot\frac{12}{13} = -\frac{20}{65}+\frac{36}{65} = \frac{16}{65}$

$\tan(2\alpha) = \frac{2\cdot(3/4)}{1-(3/4)^2} = \frac{3/2}{7/16} = \frac{24}{7}$

</details>

---

**3.** Prove each identity.

(a) $\cos(3\theta) = 4\cos^3\theta - 3\cos\theta$

(b) $\dfrac{1-\cos(2\theta)}{\sin(2\theta)} = \tan\theta$

(c) $\sin(\theta+\pi) = -\sin\theta$

<details>
<summary>Answers</summary>

(a) $\cos(3\theta)=\cos(2\theta+\theta)=\cos(2\theta)\cos\theta-\sin(2\theta)\sin\theta$
$=(2\cos^2\theta-1)\cos\theta-2\sin\theta\cos\theta\cdot\sin\theta$
$=2\cos^3\theta-\cos\theta-2\sin^2\theta\cos\theta$
$=2\cos^3\theta-\cos\theta-2(1-\cos^2\theta)\cos\theta$
$=4\cos^3\theta-3\cos\theta$. ✓

(b) $\frac{1-\cos(2\theta)}{\sin(2\theta)} = \frac{1-(1-2\sin^2\theta)}{2\sin\theta\cos\theta} = \frac{2\sin^2\theta}{2\sin\theta\cos\theta} = \frac{\sin\theta}{\cos\theta} = \tan\theta$. ✓

(c) $\sin(\theta+\pi)=\sin\theta\cos\pi+\cos\theta\sin\pi=\sin\theta(-1)+\cos\theta(0)=-\sin\theta$. ✓

</details>

---

### Code Challenges

**Challenge 1 — Addition formula calculator**

```python
import math

def sin_sum(alpha_rad, beta_rad):
    """Return sin(alpha + beta) using the addition formula."""
    pass

def cos_sum(alpha_rad, beta_rad):
    """Return cos(alpha + beta) using the addition formula."""
    pass

def tan_sum(alpha_rad, beta_rad):
    """Return tan(alpha + beta) using the addition formula.
    Raises ZeroDivisionError if 1 - tan(a)*tan(b) == 0."""
    pass


# --- tests: do not modify ---
import math

a, b = math.pi/4, math.pi/6

assert math.isclose(sin_sum(a, b), math.sin(a+b), rel_tol=1e-10)
assert math.isclose(cos_sum(a, b), math.cos(a+b), rel_tol=1e-10)
assert math.isclose(tan_sum(a, b), math.tan(a+b), rel_tol=1e-8)

# sin(α+β) with α=π, β=π/3
assert math.isclose(sin_sum(math.pi, math.pi/3), math.sin(4*math.pi/3), rel_tol=1e-10)

# cos(2α) = cos(α+α)
for alpha in [0.3, 0.7, 1.2, 2.0]:
    assert math.isclose(cos_sum(alpha, alpha), math.cos(2*alpha), rel_tol=1e-10)

print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Identity prover**

```python
import math, numpy as np

def check_identity(lhs_func, rhs_func, n=300, tol=1e-8, singularity_threshold=1e5):
    """
    Test whether lhs_func(theta) == rhs_func(theta) for n sample angles.
    Skip points where either side exceeds singularity_threshold.
    Returns (True/False, number_of_points_checked).
    """
    pass  # your code here


# --- tests: do not modify ---
import math

# True identities
ok, n = check_identity(
    lambda t: math.sin(t)**2 + math.cos(t)**2,
    lambda t: 1.0)
assert ok and n > 200, f"Pythagorean identity failed or too few points checked: {ok}, {n}"

ok, n = check_identity(
    lambda t: math.sin(2*t),
    lambda t: 2*math.sin(t)*math.cos(t))
assert ok

ok, n = check_identity(
    lambda t: math.cos(t + math.pi/3),
    lambda t: math.cos(t)*0.5 - math.sin(t)*math.sqrt(3)/2)
assert ok

# False "identity" (not actually an identity)
ok, n = check_identity(
    lambda t: math.sin(t+1),
    lambda t: math.sin(t) + 1)
assert not ok, "sin(t+1) ≠ sin(t)+1 should fail"

print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Exact value finder**

```python
import math

def exact_sin_cos_from_addition(alpha_deg, beta_deg):
    """
    Compute sin(alpha+beta) and cos(alpha+beta) using the addition formula,
    where alpha and beta are given in degrees.
    
    Only works for standard angles (multiples of 30° and 45°).
    Returns (sin_val, cos_val) as floats.
    """
    pass  # your code here

def find_exact_radical_form(value, tolerance=1e-8):
    """
    Given a float value, try to identify it as one of the common
    exact radical forms: a/b, sqrt(a)/b, (sqrt(a)+sqrt(b))/c.
    Returns a string description or None if not recognised.
    
    Searches: fractions p/q for p,q in 1..6;
    sqrt(n)/m for n,m in 1..6;
    (sqrt(a)±sqrt(b))/c for a,b,c in 1..8.
    """
    pass  # your code here


# --- tests: do not modify ---
s, c = exact_sin_cos_from_addition(45, 30)
assert math.isclose(s, math.sin(math.radians(75)), rel_tol=1e-10)
assert math.isclose(c, math.cos(math.radians(75)), rel_tol=1e-10)

# (√6+√2)/4 ≈ 0.9659
form = find_exact_radical_form((math.sqrt(6)+math.sqrt(2))/4)
assert form is not None, "Should recognise (√6+√2)/4"
print(f"  (√6+√2)/4 identified as: {form}")

# 1/2 = 0.5
form2 = find_exact_radical_form(0.5)
assert form2 is not None
print(f"  0.5 identified as: {form2}")

print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Derive the **product-to-sum formulas** from the addition formulas:

$$\sin\alpha\cos\beta = \tfrac{1}{2}[\sin(\alpha+\beta) + \sin(\alpha-\beta)]$$
$$\cos\alpha\cos\beta = \tfrac{1}{2}[\cos(\alpha-\beta) + \cos(\alpha+\beta)]$$
$$\sin\alpha\sin\beta = \tfrac{1}{2}[\cos(\alpha-\beta) - \cos(\alpha+\beta)]$$

Then use them to prove the **orthogonality** of sinusoids:
for integers $m \neq n$:

$$\int_0^{2\pi} \sin(m\theta)\sin(n\theta)\,d\theta = 0$$

(You may use $\int_0^{2\pi}\cos(k\theta)\,d\theta = 0$ for any nonzero integer $k$.)

<details>
<summary>Answer</summary>

**Product-to-sum:** Add the two addition formulas:
$\sin(\alpha+\beta)+\sin(\alpha-\beta) = 2\sin\alpha\cos\beta$.
Divide by 2. Similarly for the others.

**Orthogonality:**
$\sin(m\theta)\sin(n\theta) = \tfrac{1}{2}[\cos((m-n)\theta)-\cos((m+n)\theta)]$.
Integrating over $[0,2\pi]$: both $\cos((m-n)\theta)$ and $\cos((m+n)\theta)$
integrate to zero (since $m-n \neq 0$ and $m+n \neq 0$ for $m \neq n$, $m,n \geq 1$).
Therefore $\int_0^{2\pi}\sin(m\theta)\sin(n\theta)\,d\theta = 0$. $\blacksquare$

This is the key property that makes Fourier series work: the sine functions at
different frequencies are mutually "orthogonal" — they do not interfere with
each other, so you can extract each frequency component independently.

</details>
